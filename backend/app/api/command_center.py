from fastapi import APIRouter, Depends, Response, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import Any, Optional
import hashlib
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from fastapi import HTTPException

from app.db.database import get_db
from app.db.models import Patient
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()

@router.get("/dashboard")
async def get_command_center_dashboard(
    response: Response,
    if_none_match: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get Command Center Dashboard with SWR ETag Caching.
    Returns pre-calculated athlete semaphore status in O(1).
    """
    professional_id = current_user.user_id
    
    # 1. Fetch max last_risk_evaluation to generate ETag
    max_eval_query = await db.execute(
        select(func.max(Patient.last_risk_evaluation))
        .where(Patient.professional_id == professional_id)
    )
    max_last_eval = max_eval_query.scalar()
    
    # Generate ETag
    if max_last_eval:
        etag_str = f"W/{professional_id}-{max_last_eval.isoformat()}"
    else:
        etag_str = f"W/{professional_id}-empty"
        
    etag = hashlib.md5(etag_str.encode()).hexdigest()
    etag_header = f'"{etag}"'
    
    # 2. Check If-None-Match for 304 Not Modified
    if if_none_match == etag_header:
        response.status_code = 304
        return Response(status_code=304)
        
    # 3. Set Cache Headers
    response.headers["Cache-Control"] = "private, max-age=0, must-revalidate"
    response.headers["ETag"] = etag_header
    
    # 4. Fetch Athletes Data
    patients_query = await db.execute(
        select(Patient)
        .where(Patient.professional_id == professional_id)
        .order_by(Patient.updated_at.desc())
    )
    patients = patients_query.scalars().all()
    
    # Construct response matching Frontend requirements
    dashboard_data = []
    for p in patients:
        dashboard_data.append({
            "athlete_id": str(p.id),
            "name": p.full_name,
            "semaphore_status": p.semaphore_status or "GREEN",
            "primary_risk_factor": p.primary_risk_factor,
            "context_metadata": p.context_metadata or {}
        })
        
    return {"athletes": dashboard_data}

class SnoozeRequest(BaseModel):
    hours: int

@router.post("/patients/{athlete_id}/snooze")
async def snooze_patient_alert(
    athlete_id: str,
    payload: SnoozeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Snooze an alert for a patient.
    Strict Clinical Guardrails applied.
    """
    professional_id = current_user.user_id
    
    patient_query = await db.execute(
        select(Patient)
        .where(Patient.id == athlete_id, Patient.professional_id == professional_id)
    )
    patient = patient_query.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Athlete not found")
        
    # Business Rules (Clinical Guardrails)
    if patient.semaphore_status == "RED" and payload.hours > 48:
        raise HTTPException(
            status_code=400, 
            detail="Pacientes en estado crítico (ROJO) no pueden silenciarse por más de 48h. Se requiere reevaluación clínica."
        )
        
    if patient.semaphore_status == "YELLOW" and payload.hours > 168:
        raise HTTPException(
            status_code=400,
            detail="Pacientes en estado de advertencia (AMARILLO) no pueden silenciarse por más de 7 días (168h)."
        )
        
    # Validations passed, update snooze_until
    new_snooze_time = datetime.now(timezone.utc) + timedelta(hours=payload.hours)
    
    # Invalidate current semaphore status to hide it optimistically in the DB
    patient.snooze_until = new_snooze_time
    patient.semaphore_status = "GREEN" # Or None, resetting risk until next nightly sweep evaluates it again
    
    # We update the 'updated_at' to trigger ETag changes on the dashboard
    patient.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    return {"status": "success", "snoozed_until": new_snooze_time.isoformat()}

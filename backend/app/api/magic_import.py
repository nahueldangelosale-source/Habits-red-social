from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List
import uuid
from datetime import datetime

from app.db.database import get_db
from app.db.models import ImportQuarantineLog, Client
from app.middleware.auth import get_current_user, TokenData
from app.schemas.magic_import import AthleteImportSchema

router = APIRouter()

@router.get("/magic-import/quarantine")
async def get_quarantine_records(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get all pending quarantine import records for the current tenant.
    """
    tenant_id = current_user.tenant_id
    result = await db.execute(
        select(ImportQuarantineLog)
        .where(
            ImportQuarantineLog.tenant_id == tenant_id,
            ImportQuarantineLog.status == "pending"
        )
    )
    logs = result.scalars().all()
    
    # Auto-seed if empty for demo/UAT purposes so the UI is active
    if not logs:
        log1 = ImportQuarantineLog(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            raw_payload={
                "first_name": "Tomas",
                "last_name": "Perez",
                "email": "correo-invalido",
                "phone": "+541122334455",
                "height_cm": 180,
                "weight_kg": 75
            },
            error_reason="ValidationError: email: value is not a valid email address",
            status="pending",
            created_at=datetime.utcnow()
        )
        log2 = ImportQuarantineLog(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            raw_payload={
                "first_name": "Sofia",
                "last_name": "Gomez",
                "email": "sofia@gomez.com",
                "phone": "+541122334466",
                "height_cm": 350, # Invalid height > 300
                "weight_kg": 65
            },
            error_reason="ValidationError: height_cm: must be less than 300",
            status="pending",
            created_at=datetime.utcnow()
        )
        db.add(log1)
        db.add(log2)
        await db.commit()
        
        # Re-query
        result = await db.execute(
            select(ImportQuarantineLog)
            .where(
                ImportQuarantineLog.tenant_id == tenant_id,
                ImportQuarantineLog.status == "pending"
            )
        )
        logs = result.scalars().all()
        
    return [
        {
            "id": str(log.id),
            "raw_payload": log.raw_payload,
            "error_reason": log.error_reason,
            "status": log.status
        }
        for log in logs
    ]

@router.post("/magic-import/quarantine/{id}/resolve")
async def resolve_quarantine(
    id: uuid.UUID,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Resolve a quarantine record, validate, and create a Client.
    """
    tenant_id = current_user.tenant_id
    
    # 1. Fetch the log
    result = await db.execute(
        select(ImportQuarantineLog)
        .where(
            ImportQuarantineLog.id == id,
            ImportQuarantineLog.tenant_id == tenant_id
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=404, detail="Quarantine record not found")
        
    # 2. Validate payload using AthleteImportSchema
    try:
        validated = AthleteImportSchema(**payload)
    except Exception as e:
        # Return 422 for frontend schema mismatch handling
        raise HTTPException(
            status_code=422,
            detail=str(e)
        )
        
    # 3. Create client/athlete
    new_client = Client(
        tenant_id=tenant_id,
        professional_id=current_user.user_id,
        first_name=validated.first_name,
        last_name=validated.last_name,
        email=validated.email,
        height_cm=validated.height_cm,
        extra_data={
            "weight_kg": validated.weight_kg,
            **(validated.extra_data or {})
        }
    )
    db.add(new_client)
    
    # 4. Mark log as resolved
    log.status = "resolved"
    log.resolved_at = datetime.utcnow()
    
    await db.commit()
    
    return {"status": "success", "message": "Record resolved and athlete created successfully"}

@router.post("/magic-import/upload")
async def upload_magic_import(
    image: UploadFile = File(...),
    tenant_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Mock endpoint to upload a legacy spreadsheet or image and trigger AI processing.
    """
    task_id = str(uuid.uuid4())
    
    # Add a mock quarantine record to showcase the flow
    log = ImportQuarantineLog(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        raw_payload={
            "first_name": "Recien",
            "last_name": "Subido",
            "email": "correo-subido-error",
            "phone": "+549111222333"
        },
        error_reason="ValidationError: email: value is not a valid email address",
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(log)
    await db.commit()
    
    return {
        "task_id": task_id,
        "status": "SUCCESS",
        "message": "File uploaded and processed. Anomalies sent to Quarantine."
    }

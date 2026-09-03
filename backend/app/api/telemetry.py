from fastapi import APIRouter, Depends, Request, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import M2MAuditVault
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/bypass")
async def clinical_telemetry_bypass(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Inyección directa e inmutable en la M2MAuditVault sin bloquear el hilo principal.
    Usado para telemetría Fire-and-Forget (ej. navigator.sendBeacon).
    """
    payload = await request.json()
    
    # Fast-fail silencioso si el payload está mal formado
    if not payload:
        return {"status": "accepted"}
        
    def persist_telemetry(data: dict):
        with db.begin(): # Transaction
            vault_entry = M2MAuditVault(
                event_type=data.get('event_type', 'WATCHTOWER_TRIVIAL_TOGGLE_CLICKED'),
                entity_id=data.get('tenant_id', 'unknown'),
                tenant_id=data.get('tenant_id', 'unknown'),
                payload=data
            )
            db.add(vault_entry)
            
    background_tasks.add_task(persist_telemetry, payload)
    
    return {"status": "accepted"}

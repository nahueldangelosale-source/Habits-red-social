from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any
import uuid

from app.db.connection import get_db
from app.db.models import Protocol, Client, ActiveWorkoutPlan, ClientExtraFlags, M2MAuditVaultGhost
from app.middleware.auth import get_current_user, TokenData
from app.core.telemetry import publish_telemetry_event

router = APIRouter()

async def clone_global_baseline_to_tenant(db: AsyncSession, baseline_id: uuid.UUID, tenant_id: uuid.UUID, professional_id: uuid.UUID = None):
    # 1. Fetch Universal Baseline
    if isinstance(baseline_id, str):
        baseline_id = uuid.UUID(baseline_id)
    if isinstance(tenant_id, str):
        tenant_id = uuid.UUID(tenant_id)

    result = await db.execute(
        select(Protocol).where(
            Protocol.id == baseline_id,
            Protocol.is_global == True
        )
    )
    master_protocol = result.scalar_one_or_none()
    if not master_protocol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Universal Baseline not found"
        )
        
    # 2. Deep Clone (Copy-on-Write)
    cloned_protocol = Protocol(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        professional_id=professional_id,
        client_id=None,
        type=master_protocol.type,
        name=f"Copia de {master_protocol.name}",
        description=master_protocol.description,
        content=master_protocol.content,
        version=1,
        is_global=False,
        origin_global_id=master_protocol.id
    )
    db.add(cloned_protocol)
    
    # 3. Crear Atleta Cero (Ghost Persona)
    ghost_athlete = Client(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        professional_id=professional_id,
        first_name="Demo",
        last_name="Atleta",
        email=f"demo_{uuid.uuid4()}@sandbox.local",
        extra_data={ClientExtraFlags.IS_GHOST_PERSONA.value: True}
    )
    db.add(ghost_athlete)
    await db.flush()
    
    # 4. Vincular el protocolo clonado al Atleta Cero
    cloned_protocol.client_id = ghost_athlete.id
    
    # 5. Crear el ActiveWorkoutPlan
    active_plan = ActiveWorkoutPlan(
        id=uuid.uuid4(),
        protocol_id=cloned_protocol.id,
        client_id=ghost_athlete.id,
        tenant_id=tenant_id,
        professional_id=professional_id,
        current_snapshot=cloned_protocol.content,
        state_hash=str(uuid.uuid4()),
        status="ACTIVE"
    )
    db.add(active_plan)
    await db.flush()
    return ghost_athlete.id, active_plan.id, cloned_protocol.id

@router.post("/universal-baseline/{baseline_id}", response_model=dict)
async def adopt_universal_baseline(
    baseline_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Onboarding B2B Zero-Friction:
    Clona un Protocolo Universal (Master Catalog) e inyecta un Ghost Persona
    para generar Time-to-First-Value inmediato sin ensuciar la telemetría operativa.
    """
    # Usar la función extraída
    ghost_athlete_id, active_plan_id, cloned_protocol_id = await clone_global_baseline_to_tenant(
        db, baseline_id, current_user.tenant_id, current_user.user_id
    )
    
    # 6. Registrar en partición M2MAuditVaultGhost para auditoría aislada
    audit_event = M2MAuditVaultGhost(
        client_id=ghost_athlete_id,
        event_type="TTFV_ACHIEVED",
        payload={
            "professional_id": str(current_user.user_id),
            "baseline_adopted": str(baseline_id),
            "ghost_client_id": str(ghost_athlete_id),
            "active_plan_id": str(active_plan_id)
        }
    )
    db.add(audit_event)
    
    await db.commit()
    
    # 7. Dispatch Redis Pub/Sub OTel Event
    await publish_telemetry_event(
        tenant_id=str(current_user.tenant_id),
        event_type="TTFV_ACHIEVED",
        payload={"professional_id": str(current_user.user_id)}
    )
    
    return {
        "status": "success",
        "message": "Universal Baseline adopted",
        "cloned_protocol_id": cloned_protocol_id,
        "ghost_athlete_id": ghost_athlete_id,
        "active_plan_id": active_plan_id
    }

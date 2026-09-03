from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import os

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.domain.billing.models import Subscription

from app.db.models import User

import uuid
from app.schemas.protocol import ProtocolCreateSchema

router = APIRouter(prefix="/api/v1/protocols", tags=["Protocols"])

MAX_ATHLETES_TIER_1 = int(os.environ.get("MAX_ATHLETES_TIER_1", "2"))

@router.post("")
async def create_protocol(
    payload: ProtocolCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Guarda el protocolo (rutina/dieta) para un atleta.
    INYECCIÓN FASE 63: El Cerrojo Financiero.
    Valida el límite de la suscripción antes de permitir la asignación.
    """
    tenant_id = current_user.tenant_id
    
    # 1. Obtener la suscripción B2B del Tenant
    stmt_sub = select(Subscription).where(Subscription.tenant_id == tenant_id)
    result_sub = await db.execute(stmt_sub)
    subscription = result_sub.scalar_one_or_none()
    
    tier = subscription.tier if subscription else "TIER_1"
    
    # 2. Contar Atletas Activos del Tenant
    stmt_count = select(func.count(User.id)).where(
        User.tenant_id == tenant_id,
        User.role == "ATHLETE" 
    )
    result_count = await db.execute(stmt_count)
    current_athletes = result_count.scalar_one()
    
    # 3. Validar Límites (Glassmorphic Soft-Lock Trigger)
    limit = MAX_ATHLETES_TIER_1 if tier == "TIER_1" else 500 
    
    if current_athletes >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error_code": "SEATS_EXHAUSTED",
                "message": f"Has alcanzado el límite de {limit} atletas de tu Plan Ignite.",
                "tier_required": "TIER_2"
            }
        )
        
    # 4. Insertar el Protocolo en PostgreSQL
    from app.db.models import Protocol
    
    new_protocol = Protocol(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        client_id=uuid.UUID(payload.client_id),
        type=payload.type,
        name=payload.name,
        description=payload.description,
        content=payload.content.model_dump(),
        status="ACTIVE"
    )
    
    db.add(new_protocol)
    await db.commit()
    await db.refresh(new_protocol)
        
    return {"status": "success", "message": "Protocolo guardado con éxito", "protocol_id": str(new_protocol.id)}

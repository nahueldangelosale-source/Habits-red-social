from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.services.redis_client import get_redis as get_redis_client
from app.db.rbac import User, Role
from app.domain.watchtower.models import ActionCard, ActionCardStatus
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import json

router = APIRouter()

class ActionCardResponse(BaseModel):
    id: UUID
    status: str
    title: str

@router.post("/{card_id}/assign_rescue_routine", response_model=ActionCardResponse)
async def assign_rescue_routine(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Solo dueños, gerentes o entrenadores pueden resolver
    if current_user.role not in [Role.ADMIN, Role.PERSONAL_TRAINER]:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    stmt = select(ActionCard).where(
        ActionCard.id == card_id,
        ActionCard.tenant_id == current_user.tenant_id
    )
    result = await db.execute(stmt)
    card = result.scalars().first()

    if not card:
        raise HTTPException(status_code=404, detail="ActionCard not found")

    if card.status != ActionCardStatus.PENDING:
        raise HTTPException(status_code=400, detail="ActionCard is not PENDING")

    # Muta el estado
    card.status = ActionCardStatus.RESOLVED
    await db.commit()
    await db.refresh(card)

    # TODO: Encolar tarea Celery o Webhook para reajustar los objetivos del atleta
    # adjust_athlete_routine.delay(card.athlete_id)

    return ActionCardResponse(id=card.id, status=card.status.value, title=card.title)

@router.post("/{card_id}/mark_contacted", response_model=ActionCardResponse)
async def mark_contacted(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis_client = Depends(get_redis_client)
):
    """
    Atomicidad: Modifica DB (Postgres) y Cache (Redis) en el mismo ciclo.
    Si Redis falla, revierte la DB.
    """
    if current_user.role not in [Role.ADMIN, Role.PERSONAL_TRAINER]:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    stmt = select(ActionCard).where(
        ActionCard.id == card_id,
        ActionCard.tenant_id == current_user.tenant_id
    )
    result = await db.execute(stmt)
    card = result.scalars().first()

    if not card:
        raise HTTPException(status_code=404, detail="ActionCard not found")

    if card.status != ActionCardStatus.PENDING:
        raise HTTPException(status_code=400, detail="ActionCard is not PENDING")

    # Muta el estado
    card.status = ActionCardStatus.CONTACTED

    try:
        # Atomicidad DB + Redis
        await db.flush()
        
        redis_key = f"cri:{card.tenant_id}:{card.athlete_id}:recent_no_shows"
        await redis_client.set(redis_key, 0)
        
        await db.commit()
        await db.refresh(card)

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Atomic operation failed: {str(e)}")

    return ActionCardResponse(id=card.id, status=card.status.value, title=card.title)

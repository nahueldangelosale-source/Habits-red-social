"""
Gamification API Router — Endpoints de XP, Niveles, Retos y Sincronización de Gamificación.
"""

import uuid
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.services.gamification_service import GamificationService


router = APIRouter(prefix="/api/v1/gamification", tags=["gamification"])


# ═══════════════════════════════════════════════════════════════
# PYDANTIC SCHEMAS
# ═══════════════════════════════════════════════════════════════

class AwardXPRequest(BaseModel):
    amount: int
    source: str = "workout"  # 'workout' | 'meal' | 'habit' | 'readiness'
    idempotency_key: Optional[str] = None
    description: Optional[str] = None


class XPEventItem(BaseModel):
    idempotencyKey: str
    source: str
    amount: int
    timestamp: Optional[int] = None


class SyncXPOutboxRequest(BaseModel):
    events: List[XPEventItem]


class ChallengeResponse(BaseModel):
    id: str
    title: str
    type: str
    target_value: int
    current_value: int
    state: str
    start_date: str
    end_date: str
    duration_days: int

    class Config:
        from_attributes = True


class CreateChallengeRequest(BaseModel):
    title: str
    type: str = "STREAK"
    target_value: int = 7
    duration_days: int = 7
    squad_id: Optional[str] = None
    target_client_id: Optional[str] = None


class ChallengeProgressRequest(BaseModel):
    value: int = 1
    source: str = "HABIT_CHECKIN"


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.get("/status")
async def get_gamification_status(
    client_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Devuelve el estado consolidado de XP, nivel y retos del atleta."""
    target_id = uuid.UUID(client_id) if client_id else current_user.user_id
    status_data = await GamificationService.get_athlete_status(db, target_id)
    return status_data


@router.post("/award-xp", status_code=status.HTTP_200_OK)
async def award_xp(
    payload: AwardXPRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Acredita XP de manera idempotente y transaccional."""
    wallet, tx, is_new = await GamificationService.award_xp(
        db=db,
        client_id=current_user.user_id,
        amount=payload.amount,
        source=payload.source,
        idempotency_key=payload.idempotency_key,
        description=payload.description,
    )
    level_info = GamificationService.get_xp_progress(wallet.balance)
    return {
        "total_xp": wallet.balance,
        "is_new_credit": is_new,
        "transaction_id": str(tx.id) if tx else None,
        "level_info": level_info,
    }


@router.post("/sync-xp-outbox")
async def sync_xp_outbox(
    payload: SyncXPOutboxRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Sincroniza en lote la cola de XP generada offline por el atleta."""
    events_data = [e.model_dump() for e in payload.events]
    result = await GamificationService.sync_xp_outbox(db, current_user.user_id, events_data)
    return result


@router.get("/challenges", response_model=List[ChallengeResponse])
async def list_challenges(
    client_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Lista todos los retos activos asignados al atleta."""
    target_id = uuid.UUID(client_id) if client_id else current_user.user_id
    challenges = await GamificationService.get_active_challenges(db, target_id)
    return [
        ChallengeResponse(
            id=str(c.id),
            title=c.title,
            type=c.type,
            target_value=c.target_value,
            current_value=c.current_value,
            state=c.state,
            start_date=c.start_date.isoformat(),
            end_date=c.end_date.isoformat(),
            duration_days=c.duration_days,
        )
        for c in challenges
    ]


@router.post("/challenges", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    payload: CreateChallengeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Crea o asigna un reto al atleta o a un alumno específico."""
    target_client_id = (
        uuid.UUID(payload.target_client_id)
        if payload.target_client_id
        else current_user.user_id
    )
    squad_uuid = uuid.UUID(payload.squad_id) if payload.squad_id else None

    challenge = await GamificationService.create_challenge(
        db=db,
        tenant_id=current_user.tenant_id,
        client_id=target_client_id,
        title=payload.title,
        type=payload.type,
        target_value=payload.target_value,
        duration_days=payload.duration_days,
        squad_id=squad_uuid,
    )
    return ChallengeResponse(
        id=str(challenge.id),
        title=challenge.title,
        type=challenge.type,
        target_value=challenge.target_value,
        current_value=challenge.current_value,
        state=challenge.state,
        start_date=challenge.start_date.isoformat(),
        end_date=challenge.end_date.isoformat(),
        duration_days=challenge.duration_days,
    )


@router.post("/challenges/{challenge_id}/progress")
async def record_challenge_progress(
    challenge_id: str,
    payload: ChallengeProgressRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Registra progreso en un reto y comprueba si se ha completado."""
    try:
        challenge, is_completed = await GamificationService.record_challenge_progress(
            db=db,
            challenge_id=uuid.UUID(challenge_id),
            client_id=current_user.user_id,
            value=payload.value,
            source=payload.source,
        )
        return {
            "challenge_id": str(challenge.id),
            "current_value": challenge.current_value,
            "target_value": challenge.target_value,
            "is_completed": is_completed,
            "state": challenge.state,
        }
    except ValueError:
        raise HTTPException(status_code=404, detail="Challenge not found")

"""
Habits API Router — Endpoints de Prescripción, Cumplimiento y Sincronización de Hábitos.
"""

import uuid
from datetime import date, datetime
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.services.habit_service import HabitService


router = APIRouter(prefix="/api/v1/habits", tags=["habits"])


# ═══════════════════════════════════════════════════════════════
# PYDANTIC SCHEMAS
# ═══════════════════════════════════════════════════════════════

class HabitLogResponse(BaseModel):
    id: str
    log_date: str
    completed: bool
    value: Optional[float] = None
    zone: str

    class Config:
        from_attributes = True


class HabitResponse(BaseModel):
    id: str
    client_id: str
    template_id: str
    title: str
    type: str
    category: str
    input_type: str
    unit: Optional[str] = None
    target_value: Optional[float] = None
    duration: str
    scheduled_days: List[int]
    tags: List[str]
    is_custom: bool
    is_active: bool
    streak_current: int
    streak_best: int
    level: int
    start_date: str
    logs: List[HabitLogResponse] = []

    class Config:
        from_attributes = True


class PrescribeHabitRequest(BaseModel):
    template_id: str
    title: str
    type: str = "BUILD"
    category: str = "CUSTOM"
    input_type: str = "BOOLEAN"
    unit: Optional[str] = None
    target_value: Optional[float] = None
    duration: str = "INDEFINITE"
    scheduled_days: Optional[List[int]] = Field(default_factory=lambda: [1, 2, 3, 4, 5, 6, 7])
    tags: Optional[List[str]] = Field(default_factory=list)
    is_custom: bool = False
    start_date: Optional[str] = None
    target_client_id: Optional[str] = None  # Si el coach prescribe a un alumno específico


class UpdateHabitRequest(BaseModel):
    title: Optional[str] = None
    scheduled_days: Optional[List[int]] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None
    tags: Optional[List[str]] = None
    duration: Optional[str] = None


class CheckInRequest(BaseModel):
    date: str  # YYYY-MM-DD
    completed: bool = True
    value: Optional[float] = None


class BatchSyncItem(BaseModel):
    local_id: str
    template_id: str
    title: str
    type: str = "BUILD"
    category: str = "CUSTOM"
    input_type: str = "BOOLEAN"
    unit: Optional[str] = None
    target_value: Optional[float] = None
    duration: str = "INDEFINITE"
    scheduled_days: Optional[List[int]] = None
    tags: Optional[List[str]] = None
    is_custom: bool = False
    completed_days: List[str] = Field(default_factory=list)  # YYYY-MM-DD
    daily_values: Dict[str, float] = Field(default_factory=dict)


class BatchSyncRequest(BaseModel):
    habits: List[BatchSyncItem]


# ═══════════════════════════════════════════════════════════════
# HELPER DE SERIALIZACIÓN
# ═══════════════════════════════════════════════════════════════

def serialize_habit(h) -> HabitResponse:
    logs_res = [
        HabitLogResponse(
            id=str(l.id),
            log_date=l.log_date.isoformat(),
            completed=l.completed,
            value=l.value,
            zone=l.zone,
        )
        for l in (h.logs or [])
    ]
    return HabitResponse(
        id=str(h.id),
        client_id=str(h.client_id),
        template_id=h.template_id,
        title=h.title,
        type=h.type,
        category=h.category,
        input_type=h.input_type,
        unit=h.unit,
        target_value=h.target_value,
        duration=h.duration,
        scheduled_days=h.scheduled_days or [1, 2, 3, 4, 5, 6, 7],
        tags=h.tags or [],
        is_custom=h.is_custom,
        is_active=h.is_active,
        streak_current=h.streak_current,
        streak_best=h.streak_best,
        level=h.level,
        start_date=h.start_date.isoformat() if hasattr(h.start_date, 'isoformat') else str(h.start_date),
        logs=logs_res,
    )


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.get("", response_model=List[HabitResponse])
async def list_habits(
    client_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Lista todos los hábitos activos del usuario autenticado o del alumno solicitado."""
    target_id = uuid.UUID(client_id) if client_id else current_user.user_id
    habits = await HabitService.get_client_habits(db, target_id)
    return [serialize_habit(h) for h in habits]


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def prescribe_habit(
    payload: PrescribeHabitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Crea o prescribe un nuevo hábito."""
    target_client_id = (
        uuid.UUID(payload.target_client_id)
        if payload.target_client_id
        else current_user.user_id
    )

    start_d = (
        datetime.strptime(payload.start_date, "%Y-%m-%d").date()
        if payload.start_date
        else datetime.utcnow().date()
    )

    habit = await HabitService.prescribe_or_create_habit(
        db=db,
        tenant_id=current_user.tenant_id,
        client_id=target_client_id,
        template_id=payload.template_id,
        title=payload.title,
        type=payload.type,
        category=payload.category,
        input_type=payload.input_type,
        unit=payload.unit,
        target_value=payload.target_value,
        duration=payload.duration,
        scheduled_days=payload.scheduled_days,
        tags=payload.tags,
        is_custom=payload.is_custom,
        start_date=start_d,
    )
    return serialize_habit(habit)


@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    payload: UpdateHabitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Actualiza la configuración y días programados de un hábito."""
    try:
        habit = await HabitService.update_habit(
            db=db,
            habit_id=uuid.UUID(habit_id),
            title=payload.title,
            scheduled_days=payload.scheduled_days,
            target_value=payload.target_value,
            unit=payload.unit,
            tags=payload.tags,
            duration=payload.duration,
        )
        return serialize_habit(habit)
    except ValueError:
        raise HTTPException(status_code=404, detail="Habit not found")


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> None:
    """Desactiva un hábito (soft-delete)."""
    success = await HabitService.soft_delete_habit(db, uuid.UUID(habit_id))
    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")


@router.post("/{habit_id}/check-in", response_model=HabitResponse)
async def record_check_in(
    habit_id: str,
    payload: CheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Registra el check-in diario de un hábito (booleano o numérico con zona de tolerancia)."""
    try:
        log_d = datetime.strptime(payload.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    try:
        habit, _ = await HabitService.record_check_in(
            db=db,
            habit_id=uuid.UUID(habit_id),
            log_date=log_d,
            completed=payload.completed,
            value=payload.value,
        )
        return serialize_habit(habit)
    except ValueError:
        raise HTTPException(status_code=404, detail="Habit not found")


@router.delete("/{habit_id}/check-in/{log_date}", response_model=HabitResponse)
async def remove_check_in(
    habit_id: str,
    log_date: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Deshace el check-in de una fecha específica."""
    try:
        log_d = datetime.strptime(log_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    try:
        habit = await HabitService.remove_check_in(db, uuid.UUID(habit_id), log_d)
        return serialize_habit(habit)
    except ValueError:
        raise HTTPException(status_code=404, detail="Habit not found")


@router.get("/adherence")
async def get_adherence(
    client_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """Calcula las métricas de adherencia y racha global del atleta."""
    target_id = uuid.UUID(client_id) if client_id else current_user.user_id
    metrics = await HabitService.calculate_client_adherence(db, target_id)
    return metrics


@router.post("/sync-batch", response_model=List[HabitResponse])
async def sync_batch(
    payload: BatchSyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """
    Sincroniza en lote hábitos creados localmente en el navegador hacia PostgreSQL.
    Permite migrar el estado previo de localStorage sin perder rachas ni datos históricos.
    """
    synced_habits = []
    for item in payload.habits:
        habit = await HabitService.prescribe_or_create_habit(
            db=db,
            tenant_id=current_user.tenant_id,
            client_id=current_user.user_id,
            template_id=item.template_id,
            title=item.title,
            type=item.type,
            category=item.category,
            input_type=item.input_type,
            unit=item.unit,
            target_value=item.target_value,
            duration=item.duration,
            scheduled_days=item.scheduled_days,
            tags=item.tags,
            is_custom=item.is_custom,
        )

        # Migrar logs completados
        for date_str in item.completed_days:
            try:
                log_d = datetime.strptime(date_str, "%Y-%m-%d").date()
                val = item.daily_values.get(date_str)
                await HabitService.record_check_in(
                    db=db,
                    habit_id=habit.id,
                    log_date=log_d,
                    completed=True,
                    value=val,
                )
            except Exception:
                continue

        # Recargar hábito actualizado con logs
        reloaded = await HabitService.get_habit_by_id(db, habit.id)
        if reloaded:
            synced_habits.append(reloaded)

    return [serialize_habit(h) for h in synced_habits]

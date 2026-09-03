"""
Routines Router — Gestión de mesociclos y rutinas asignadas.
Endpoints para consultar rutinas activas por atleta.
"""

import uuid
from typing import Any, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import WorkoutPlan, WorkoutDay, SupersetGroup, ExerciseTarget
from app.middleware.auth import get_current_user, get_current_professional, TokenData

router = APIRouter()
logger = structlog.get_logger()


@router.get("/active", summary="Obtener rutina activa del atleta")
async def get_active_routine(
    athlete_id: Optional[uuid.UUID] = Query(None, description="ID del atleta (para coach view)"),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Devuelve la rutina activamente asignada a un atleta.
    Si el caller es un atleta, devuelve su propia rutina.
    Si es un profesional, puede consultar la de cualquier atleta de su tenant.
    """
    target_id = athlete_id or current_user.user_id

    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.client_id == target_id,
            WorkoutPlan.is_deleted == False,
            WorkoutPlan.delivery_status == "ASSIGNED",
        )
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
        .order_by(WorkoutPlan.updated_at.desc())
        .limit(1)
    )
    plan = result.scalar_one_or_none()

    if not plan:
        return {"has_routine": False, "routine": None}

    return {
        "has_routine": True,
        "routine": {
            "id": str(plan.id),
            "title": plan.title,
            "description": plan.description,
            "delivery_status": plan.delivery_status,
            "total_days": len(plan.days),
            "days": [
                {
                    "id": str(d.id),
                    "name": d.name,
                    "order": d.order,
                    "exercises_count": sum(len(ss.exercises) for ss in d.supersets),
                }
                for d in sorted(plan.days, key=lambda x: x.order)
            ],
        },
    }


@router.get("/{routine_id}", summary="Obtener rutina completa por ID")
async def get_routine_by_id(
    routine_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Obtiene el detalle completo de una rutina con todos sus días y ejercicios."""
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.id == routine_id,
            WorkoutPlan.is_deleted == False,
        )
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")

    return plan


@router.get("/", summary="Listar rutinas de un atleta")
async def list_athlete_routines(
    athlete_id: uuid.UUID = Query(..., description="ID del atleta"),
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Lista todas las rutinas (activas e históricas) de un atleta."""
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.client_id == athlete_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_deleted == False,
        )
        .order_by(WorkoutPlan.created_at.desc())
    )
    plans = list(result.scalars().all())

    return [
        {
            "id": str(p.id),
            "title": p.title,
            "delivery_status": p.delivery_status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "is_master": p.is_master,
        }
        for p in plans
    ]

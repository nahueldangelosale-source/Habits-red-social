"""
Exercises Router — Catálogo de ejercicios con taxonomía biomecánica.
Soporta búsqueda, filtrado por grupo muscular/patrón/equipo y detalle.
"""

import uuid
from typing import Any, List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.models import Exercise
from app.middleware.auth import get_current_user, TokenData

router = APIRouter()
logger = structlog.get_logger()


@router.get("/", summary="Listar ejercicios con filtros")
async def list_exercises(
    muscle: Optional[str] = Query(None, description="Filtrar por músculo principal"),
    pattern: Optional[str] = Query(None, description="Filtrar por patrón de movimiento"),
    equipment: Optional[str] = Query(None, description="Filtrar por equipo requerido"),
    skill_max: Optional[int] = Query(None, ge=1, le=5, description="Nivel máximo de habilidad"),
    q: Optional[str] = Query(None, description="Búsqueda por nombre o alias"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Devuelve el catálogo de ejercicios con filtros opcionales.
    Incluye ejercicios globales y los personalizados del entrenador.
    """
    query = select(Exercise).where(Exercise.is_deleted == False)

    # Incluir globales + propios del trainer
    query = query.where(
        or_(
            Exercise.is_global == True,
            Exercise.trainer_id == current_user.user_id,
        )
    )

    if muscle:
        query = query.where(Exercise.primary_muscle.ilike(f"%{muscle}%"))

    if pattern:
        query = query.where(Exercise.movement_pattern.ilike(f"%{pattern}%"))

    if skill_max:
        query = query.where(Exercise.skill_level <= skill_max)

    if q:
        query = query.where(
            or_(
                Exercise.official_name.ilike(f"%{q}%"),
                Exercise.search_aliases.ilike(f"%{q}%"),
            )
        )

    query = query.order_by(Exercise.official_name).offset(offset).limit(limit)

    result = await db.execute(query)
    exercises = list(result.scalars().all())

    logger.info("exercises_listed", count=len(exercises))

    return [
        {
            "id": str(ex.id),
            "exercise_id": ex.exercise_id,
            "official_name": ex.official_name,
            "movement_pattern": ex.movement_pattern,
            "laterality": ex.laterality,
            "axial_load": ex.axial_load,
            "primary_muscle": ex.primary_muscle,
            "synergist_muscles": ex.synergist_muscles,
            "equipment_required": ex.equipment_required,
            "skill_level": ex.skill_level,
            "joint_impact": ex.joint_impact,
            "video_url": ex.video_url,
            "mechanic": ex.mechanic,
            "contraindications": ex.contraindications,
            "is_global": ex.is_global,
        }
        for ex in exercises
    ]


@router.get("/search", summary="Búsqueda rápida de ejercicios")
async def search_exercises(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    limit: int = Query(10, ge=1, le=50),
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Búsqueda rápida por nombre o alias. Optimizada para autocomplete
    en el WorkoutBuilder (PanoramicBuilder).
    """
    result = await db.execute(
        select(Exercise)
        .where(
            Exercise.is_deleted == False,
            or_(
                Exercise.is_global == True,
                Exercise.trainer_id == current_user.user_id,
            ),
            or_(
                Exercise.official_name.ilike(f"%{q}%"),
                Exercise.search_aliases.ilike(f"%{q}%"),
            ),
        )
        .order_by(Exercise.official_name)
        .limit(limit)
    )
    exercises = list(result.scalars().all())

    return [
        {
            "id": str(ex.id),
            "official_name": ex.official_name,
            "primary_muscle": ex.primary_muscle,
            "equipment_required": ex.equipment_required,
            "video_url": ex.video_url,
        }
        for ex in exercises
    ]


@router.get("/{exercise_id}", summary="Detalle de ejercicio por ID")
async def get_exercise_detail(
    exercise_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Devuelve el detalle completo de un ejercicio incluyendo video,
    biomecánica, contraindicaciones y aliases de búsqueda.
    """
    result = await db.execute(
        select(Exercise).where(
            Exercise.id == exercise_id,
            Exercise.is_deleted == False,
        )
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ejercicio no encontrado",
        )

    return {
        "id": str(exercise.id),
        "exercise_id": exercise.exercise_id,
        "official_name": exercise.official_name,
        "search_aliases": exercise.search_aliases,
        "movement_pattern": exercise.movement_pattern,
        "laterality": exercise.laterality,
        "axial_load": exercise.axial_load,
        "primary_muscle": exercise.primary_muscle,
        "synergist_muscles": exercise.synergist_muscles,
        "equipment_required": exercise.equipment_required,
        "skill_level": exercise.skill_level,
        "joint_impact": exercise.joint_impact,
        "video_url": exercise.video_url,
        "mechanic": exercise.mechanic,
        "contraindications": exercise.contraindications,
        "is_global": exercise.is_global,
        "trainer_id": str(exercise.trainer_id) if exercise.trainer_id else None,
    }


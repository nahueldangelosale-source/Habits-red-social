"""
Workouts Router — CRUD completo para planes de entrenamiento.
Permite crear, listar, obtener, actualizar y eliminar planes del WorkoutBuilder.
Multi-tenant isolated con soft deletes.
"""

import uuid
from typing import List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import WorkoutPlan, WorkoutDay, SupersetGroup, ExerciseTarget
from app.middleware.auth import get_current_professional, TokenData
from app.schemas.fitness import (
    WorkoutPlanCreate,
    WorkoutPlanRead,
    WorkoutPlanUpdate,
)
from app.repositories.workout_repo import WorkoutRepository

router = APIRouter()
logger = structlog.get_logger()


# =============================================================================
# CREATE — POST /api/v1/workouts/
# =============================================================================

@router.post(
    "/",
    response_model=WorkoutPlanRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear plan de entrenamiento",
)
async def create_workout_plan(
    plan_data: WorkoutPlanCreate,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """
    Crea un nuevo plan de entrenamiento con sus días, superseries y ejercicios.
    Multi-tenant: aislado por tenant_id del profesional autenticado.
    """
    repo = WorkoutRepository(db, current_user.tenant_id)
    
    try:
        new_plan = await repo.create_plan(current_user.user_id, plan_data)
        await db.commit()
        await db.refresh(new_plan, attribute_names=["days"])
        
        # Eager load nested relationships for response
        result = await db.execute(
            select(WorkoutPlan)
            .where(WorkoutPlan.id == new_plan.id)
            .options(
                selectinload(WorkoutPlan.days)
                .selectinload(WorkoutDay.supersets)
                .selectinload(SupersetGroup.exercises)
            )
        )
        plan_with_details = result.scalar_one()
        
        logger.info(
            "workout_plan_created",
            plan_id=str(plan_with_details.id),
            professional_id=str(current_user.user_id),
            tenant_id=str(current_user.tenant_id),
            days_count=len(plan_with_details.days),
        )
        
        return plan_with_details
        
    except Exception as e:
        await db.rollback()
        logger.error("workout_plan_create_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear plan de entrenamiento: {str(e)}",
        )


# =============================================================================
# LIST — GET /api/v1/workouts/
# =============================================================================

@router.get(
    "/",
    response_model=List[WorkoutPlanRead],
    summary="Listar planes de entrenamiento",
)
async def list_workout_plans(
    client_id: Optional[uuid.UUID] = Query(None, description="Filtrar por atleta"),
    is_master: Optional[bool] = Query(None, description="Filtrar solo plantillas maestras"),
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """
    Lista todos los planes de entrenamiento del profesional autenticado.
    Opcionalmente filtra por client_id o plantillas maestras.
    """
    query = (
        select(WorkoutPlan)
        .where(
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_deleted == False,
        )
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
        .order_by(WorkoutPlan.created_at.desc())
    )
    
    if client_id:
        query = query.where(WorkoutPlan.client_id == client_id)
    
    if is_master is not None:
        query = query.where(WorkoutPlan.is_master == is_master)
    
    result = await db.execute(query)
    plans = list(result.scalars().unique().all())
    
    logger.info(
        "workout_plans_listed",
        count=len(plans),
        tenant_id=str(current_user.tenant_id),
    )
    
    return plans


# =============================================================================
# GET ONE — GET /api/v1/workouts/{plan_id}
# =============================================================================

@router.get(
    "/{plan_id}",
    response_model=WorkoutPlanRead,
    summary="Obtener plan de entrenamiento por ID",
)
async def get_workout_plan(
    plan_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """
    Obtiene un plan de entrenamiento específico con todos sus días,
    superseries y ejercicios. Aislado por tenant_id.
    """
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de entrenamiento no encontrado",
        )
    
    return plan


# =============================================================================
# UPDATE — PUT /api/v1/workouts/{plan_id}
# =============================================================================

@router.put(
    "/{plan_id}",
    response_model=WorkoutPlanRead,
    summary="Actualizar plan de entrenamiento",
)
async def update_workout_plan(
    plan_id: uuid.UUID,
    plan_update: WorkoutPlanUpdate,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """
    Actualiza campos del plan de entrenamiento (título, descripción, estado de entrega).
    Solo actualiza campos no-nulos enviados en el body.
    """
    # Verificar que el plan existe y pertenece al tenant
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_deleted == False,
        )
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de entrenamiento no encontrado",
        )
    
    # Aplicar actualizaciones parciales
    update_data = plan_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionaron campos para actualizar",
        )
    
    stmt = (
        update(WorkoutPlan)
        .where(WorkoutPlan.id == plan_id)
        .values(**update_data)
    )
    await db.execute(stmt)
    await db.commit()
    
    # Recargar con relaciones para el response
    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.id == plan_id)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    updated_plan = result.scalar_one()
    
    logger.info(
        "workout_plan_updated",
        plan_id=str(plan_id),
        updated_fields=list(update_data.keys()),
    )
    
    return updated_plan


# =============================================================================
# DELETE — DELETE /api/v1/workouts/{plan_id}
# =============================================================================

@router.delete(
    "/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar plan de entrenamiento (soft delete)",
)
async def delete_workout_plan(
    plan_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """
    Soft delete de un plan de entrenamiento. El plan se marca como eliminado
    pero no se borra de la base de datos para auditoría.
    """
    repo = WorkoutRepository(db, current_user.tenant_id)
    deleted = await repo.soft_delete_plan(plan_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de entrenamiento no encontrado",
        )
    
    await db.commit()
    
    logger.info(
        "workout_plan_deleted",
        plan_id=str(plan_id),
        tenant_id=str(current_user.tenant_id),
    )


# =============================================================================
# ASSIGN — POST /api/v1/workouts/{plan_id}/assign
# =============================================================================

from pydantic import BaseModel


class AssignPlanRequest(BaseModel):
    client_id: uuid.UUID
    delivery_status: str = "ASSIGNED"


@router.post(
    "/{plan_id}/assign",
    response_model=WorkoutPlanRead,
    summary="Asignar plan a un atleta",
)
async def assign_workout_plan(
    plan_id: uuid.UUID,
    payload: AssignPlanRequest,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """
    Asigna un plan de entrenamiento a un atleta (client_id).
    Si el plan es una plantilla maestra, crea una copia para el atleta.
    """
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_deleted == False,
        )
    )
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de entrenamiento no encontrado",
        )
    
    # Actualizar asignación
    stmt = (
        update(WorkoutPlan)
        .where(WorkoutPlan.id == plan_id)
        .values(
            client_id=payload.client_id,
            delivery_status=payload.delivery_status,
        )
    )
    await db.execute(stmt)
    await db.commit()
    
    # Recargar con relaciones
    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.id == plan_id)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    assigned_plan = result.scalar_one()
    
    logger.info(
        "workout_plan_assigned",
        plan_id=str(plan_id),
        client_id=str(payload.client_id),
    )
    
    return assigned_plan


# =============================================================================
# DUPLICATE — POST /api/v1/workouts/{plan_id}/duplicate
# =============================================================================

@router.post(
    "/{plan_id}/duplicate",
    response_model=WorkoutPlanRead,
    status_code=status.HTTP_201_CREATED,
    summary="Duplicar plan (Smart Fork)",
)
async def duplicate_workout_plan(
    plan_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """
    Duplica un plan existente (incluyendo días, superseries y ejercicios).
    La copia queda sin atleta asignado y con referencia al plan original.
    """
    # Cargar plan original con todas las relaciones
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_deleted == False,
        )
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    original = result.scalar_one_or_none()
    
    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de entrenamiento no encontrado",
        )
    
    # Crear copia profunda
    new_plan = WorkoutPlan(
        tenant_id=current_user.tenant_id,
        professional_id=current_user.user_id,
        client_id=None,  # Sin asignar
        title=f"{original.title} (Copia)",
        description=original.description,
        is_master=False,
        derived_from_master_id=original.id,
    )
    
    for day in original.days:
        new_day = WorkoutDay(
            tenant_id=current_user.tenant_id,
            name=day.name,
            order=day.order,
            plan=new_plan,
        )
        for superset in day.supersets:
            new_superset = SupersetGroup(
                tenant_id=current_user.tenant_id,
                order=superset.order,
                notes=superset.notes,
                day=new_day,
            )
            for exercise in superset.exercises:
                new_exercise = ExerciseTarget(
                    tenant_id=current_user.tenant_id,
                    exercise_id=exercise.exercise_id,
                    order=exercise.order,
                    sets=exercise.sets,
                    reps=exercise.reps,
                    rpe=exercise.rpe,
                    weight=exercise.weight,
                    rest_seconds=exercise.rest_seconds,
                    notes=exercise.notes,
                    superset_group=new_superset,
                )
                db.add(new_exercise)
            db.add(new_superset)
        db.add(new_day)
    
    db.add(new_plan)
    await db.commit()
    
    # Recargar con relaciones para el response
    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.id == new_plan.id)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    duplicated = result.scalar_one()
    
    logger.info(
        "workout_plan_duplicated",
        original_id=str(plan_id),
        new_id=str(duplicated.id),
    )
    
    return duplicated

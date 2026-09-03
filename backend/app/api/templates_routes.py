"""
Templates Router — CRUD de plantillas maestras de entrenamiento.
Las plantillas son WorkoutPlans con is_master=True y client_id=None.
"""

import uuid
from typing import Any, List, Optional

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import WorkoutPlan, WorkoutDay, SupersetGroup, ExerciseTarget
from app.middleware.auth import get_current_professional, TokenData
from app.schemas.fitness import WorkoutPlanCreate, WorkoutPlanRead, WorkoutPlanUpdate

router = APIRouter()
logger = structlog.get_logger()


@router.get("/", summary="Listar plantillas maestras")
async def list_templates(
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Lista todas las plantillas maestras del profesional (is_master=True).
    Estas son las plantillas reutilizables del Google Drive-style explorer.
    """
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_master == True,
            WorkoutPlan.is_deleted == False,
        )
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
        .order_by(WorkoutPlan.created_at.desc())
    )
    templates = list(result.scalars().unique().all())

    logger.info("templates_listed", count=len(templates), tenant_id=str(current_user.tenant_id))
    return templates


@router.post("/", status_code=status.HTTP_201_CREATED, summary="Crear plantilla maestra")
async def create_template(
    plan_data: WorkoutPlanCreate,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Crea una nueva plantilla maestra. Fuerza is_master=True y client_id=None.
    """
    new_template = WorkoutPlan(
        tenant_id=current_user.tenant_id,
        professional_id=current_user.user_id,
        client_id=None,
        title=plan_data.title,
        description=plan_data.description,
        is_master=True,
    )

    for day_data in plan_data.days:
        new_day = WorkoutDay(
            tenant_id=current_user.tenant_id,
            name=day_data.name,
            order=day_data.order,
            plan=new_template,
        )
        for superset_data in day_data.supersets:
            new_superset = SupersetGroup(
                tenant_id=current_user.tenant_id,
                order=superset_data.order,
                notes=superset_data.notes,
                day=new_day,
            )
            for exercise_data in superset_data.exercises:
                new_exercise = ExerciseTarget(
                    tenant_id=current_user.tenant_id,
                    exercise_id=exercise_data.exercise_id,
                    order=exercise_data.order,
                    sets=exercise_data.sets,
                    reps=exercise_data.reps,
                    rpe=exercise_data.rpe,
                    weight=exercise_data.weight,
                    rest_seconds=exercise_data.rest_seconds,
                    notes=exercise_data.notes,
                    superset_group=new_superset,
                )
                db.add(new_exercise)
            db.add(new_superset)
        db.add(new_day)

    db.add(new_template)
    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.id == new_template.id)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    created = result.scalar_one()

    logger.info("template_created", template_id=str(created.id))
    return created


@router.get("/{template_id}", summary="Obtener plantilla por ID")
async def get_template(
    template_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Obtiene una plantilla maestra con todo su contenido."""
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.id == template_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_master == True,
            WorkoutPlan.is_deleted == False,
        )
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    return template


@router.put("/{template_id}", summary="Actualizar plantilla")
async def update_template(
    template_id: uuid.UUID,
    update_data: WorkoutPlanUpdate,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Actualiza título, descripción o estado de una plantilla."""
    data = update_data.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    stmt = (
        update(WorkoutPlan)
        .where(
            WorkoutPlan.id == template_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_master == True,
            WorkoutPlan.is_deleted == False,
        )
        .values(**data)
    )
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    await db.commit()

    # Reload
    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.id == template_id)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    return result.scalar_one()


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar plantilla")
async def delete_template(
    template_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete de una plantilla maestra."""
    stmt = (
        update(WorkoutPlan)
        .where(
            WorkoutPlan.id == template_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_master == True,
            WorkoutPlan.is_deleted == False,
        )
        .values(is_deleted=True)
    )
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    await db.commit()
    logger.info("template_deleted", template_id=str(template_id))


@router.post("/{template_id}/fork", status_code=status.HTTP_201_CREATED, summary="Fork adaptativo")
async def fork_template(
    template_id: uuid.UUID,
    client_id: Optional[uuid.UUID] = Query(None, description="Atleta al que asignar el fork"),
    current_user: TokenData = Depends(get_current_professional),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Crea una copia (fork) de una plantilla para un atleta específico.
    La copia queda como plan normal (is_master=False) con derived_from_master_id.
    """
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.id == template_id,
            WorkoutPlan.tenant_id == current_user.tenant_id,
            WorkoutPlan.is_master == True,
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
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")

    # Deep copy
    forked = WorkoutPlan(
        tenant_id=current_user.tenant_id,
        professional_id=current_user.user_id,
        client_id=client_id,
        title=f"{original.title} (Fork)",
        description=original.description,
        is_master=False,
        derived_from_master_id=original.id,
        delivery_status="ASSIGNED" if client_id else None,
    )

    for day in original.days:
        new_day = WorkoutDay(
            tenant_id=current_user.tenant_id, name=day.name, order=day.order, plan=forked
        )
        for ss in day.supersets:
            new_ss = SupersetGroup(
                tenant_id=current_user.tenant_id, order=ss.order, notes=ss.notes, day=new_day
            )
            for ex in ss.exercises:
                new_ex = ExerciseTarget(
                    tenant_id=current_user.tenant_id,
                    exercise_id=ex.exercise_id,
                    order=ex.order,
                    sets=ex.sets,
                    reps=ex.reps,
                    rpe=ex.rpe,
                    weight=ex.weight,
                    rest_seconds=ex.rest_seconds,
                    notes=ex.notes,
                    superset_group=new_ss,
                )
                db.add(new_ex)
            db.add(new_ss)
        db.add(new_day)

    db.add(forked)
    await db.commit()

    result = await db.execute(
        select(WorkoutPlan)
        .where(WorkoutPlan.id == forked.id)
        .options(
            selectinload(WorkoutPlan.days)
            .selectinload(WorkoutDay.supersets)
            .selectinload(SupersetGroup.exercises)
        )
    )
    return result.scalar_one()

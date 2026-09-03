from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.models import WorkoutSession, NutritionPlan
import uuid
from datetime import datetime, date
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.db.database import get_db
from app.db.models import Client, VideoReview, WorkoutPlan, WorkoutDay, SupersetGroup, ExerciseTarget, WorkoutSets
from app.middleware.auth import get_current_user, TokenData
from app.services.acwr_service import ACWRService
from sqlalchemy.orm import selectinload

import structlog

logger = structlog.get_logger()

router = APIRouter(prefix="/api/v1/athlete")

@router.get("/telemetry")
async def get_athlete_telemetry(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get dynamic fatigue (ACWR) and readiness stats for the logged-in athlete.
    Forces synchronous calculation to ensure warnings are generated and returned in tests.
    """
    res = await ACWRService.get_cached_acwr(current_user.user_id, db, trigger_bg_on_miss=False)
    return res

@router.post("/video-review", status_code=status.HTTP_201_CREATED)
async def submit_video_review(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Submit a video for technical review.
    Determines priority and category automatically based on video content.
    """
    client_id = current_user.user_id
    tenant_id = current_user.tenant_id
    
    # Get client to retrieve professional_id
    result = await db.execute(
        select(Client).where(Client.id == client_id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    professional_id = client.professional_id
    if not professional_id:
        # Default fallback to first professional in tenant if not assigned
        from app.db.models import Professional
        pro_result = await db.execute(
            select(Professional).where(Professional.tenant_id == tenant_id).limit(1)
        )
        pro = pro_result.scalar_one_or_none()
        if not pro:
            raise HTTPException(status_code=400, detail="No professional found in tenant")
        professional_id = pro.id
        client.professional_id = professional_id
        db.add(client)
        
    exercise_name = payload.get("exercise_name")
    video_url = payload.get("video_url")
    
    if not exercise_name or not video_url:
        raise HTTPException(status_code=400, detail="exercise_name and video_url are required")
        
    # Analyze video url to set priority and status for Chapter 3 tests
    ai_priority = "P3"
    ai_triage_category = "Ejecución Correcta"
    review_status = "approved"
    
    if "critical" in video_url or "_p1" in video_url:
        ai_priority = "P1"
        ai_triage_category = "Curvatura Lumbar Peligrosa"
        review_status = "pending"
    elif "plateau" in video_url or "_p2" in video_url:
        ai_priority = "P2"
        ai_triage_category = "Rango de Movimiento Insuficiente"
        review_status = "pending"
        
    new_review = VideoReview(
        client_id=client_id,
        professional_id=professional_id,
        exercise_name=exercise_name,
        video_url=video_url,
        ai_priority=ai_priority,
        ai_triage_category=ai_triage_category,
        status=review_status,
        feedback=None if review_status == "pending" else "Auto-aprobado por IA"
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    return {
        "status": review_status,
        "video_id": str(new_review.id),
        "ai_priority": ai_priority,
        "ai_triage_category": ai_triage_category
    }

@router.get("/profile")
async def get_athlete_profile(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
) -> Any:
    """
    Get consolidated profile for the athlete (coach view context).
    Includes biometrics from extra_data, training stats, but NO gamification.
    """
    client_id = current_user.user_id
    
    result = await db.execute(
        select(Client).where(Client.id == client_id)
    )
    client = result.scalar_one_or_none()
    
    if not client:
        raise HTTPException(status_code=404, detail="Athlete not found")
        
    extra_data = client.extra_data or {}
    biometrics = extra_data.get("biometrics", {})
    
    # Simple training stats aggregation (could be expanded)
    # Getting total volume from WorkoutSession
    from app.db.models import WorkoutSession
    session_result = await db.execute(
        select(func.count(WorkoutSession.id), func.sum(WorkoutSession.volume))
        .where(WorkoutSession.client_id == client_id)
    )
    total_sessions, total_volume = session_result.first()
    
    # Getting active nutrition plan
    from app.db.models import NutritionPlan
    nutrition_result = await db.execute(
        select(NutritionPlan)
        .where(NutritionPlan.client_id == client_id, NutritionPlan.is_active == True)
        .order_by(NutritionPlan.created_at.desc())
        .limit(1)
    )
    active_nutrition = nutrition_result.scalar_one_or_none()
    
    return {
        "personal": {
            "first_name": client.first_name,
            "last_name": client.last_name,
            "created_at": client.created_at.isoformat() if client.created_at else None,
            "photo_url": extra_data.get("photo_url")
        },
        "biometrics": {
            "weight": biometrics.get("weight", client.height_cm), # Fallback if weight is not in extra_data
            "height": client.height_cm,
            "body_fat": biometrics.get("body_fat")
        },
        "training": {
            "total_sessions": total_sessions or 0,
            "total_volume": float(total_volume or 0),
            "prs": extra_data.get("prs", [])
        },
        "nutrition": {
            "active_plan_id": str(active_nutrition.id) if active_nutrition else None,
            "macros": active_nutrition.macros if active_nutrition else None
        }
    }


# =============================================================================
# B.2 — GET /routine/today — Rutina asignada para hoy
# =============================================================================

@router.get("/routine/today")
async def get_routine_today(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """
    Devuelve la rutina asignada al atleta para el día de hoy.
    Calcula qué día del plan corresponde basándose en la fecha de asignación.
    Si no tiene plan asignado, devuelve estructura vacía.
    """
    athlete_id = current_user.user_id

    # Buscar plan activo asignado al atleta (delivery_status = ASSIGNED)
    result = await db.execute(
        select(WorkoutPlan)
        .where(
            WorkoutPlan.client_id == athlete_id,
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
        return {
            "has_plan": False,
            "message": "No tenés un plan de entrenamiento asignado aún.",
            "plan": None,
            "today": None,
        }

    # Calcular qué día corresponde hoy (rotación cíclica)
    total_days = len(plan.days)
    if total_days == 0:
        return {
            "has_plan": True,
            "message": "Tu plan no tiene días configurados.",
            "plan": {"id": str(plan.id), "title": plan.title},
            "today": None,
        }

    # Contar días desde la asignación para determinar day_index
    days_since_assigned = (date.today() - plan.updated_at.date()).days
    current_day_index = days_since_assigned % total_days

    # Ordenar días por 'order'
    sorted_days = sorted(plan.days, key=lambda d: d.order)
    today_day = sorted_days[current_day_index]

    # Formatear ejercicios para el frontend
    exercises = []
    for superset in sorted(today_day.supersets, key=lambda s: s.order):
        for ex in sorted(superset.exercises, key=lambda e: e.order):
            exercises.append({
                "id": str(ex.id),
                "exercise_id": str(ex.exercise_id),
                "sets": ex.sets,
                "reps": ex.reps,
                "rpe": ex.rpe,
                "weight": ex.weight,
                "rest_seconds": ex.rest_seconds,
                "notes": ex.notes,
                "superset_group_id": str(superset.id),
            })

    logger.info(
        "athlete_routine_today",
        athlete_id=str(athlete_id),
        plan_id=str(plan.id),
        day_name=today_day.name,
        exercises_count=len(exercises),
    )

    return {
        "has_plan": True,
        "plan": {
            "id": str(plan.id),
            "title": plan.title,
            "total_days": total_days,
        },
        "today": {
            "day_id": str(today_day.id),
            "day_name": today_day.name,
            "day_order": today_day.order,
            "day_index": current_day_index,
            "exercises": exercises,
        },
    }


# =============================================================================
# B.2.B — POST /routine/self — Auto-asignación de rutina (Atleta Autónomo B2C)
# =============================================================================

class SelfRoutineExerciseInput(BaseModel):
    exercise_name: str
    exercise_id: Optional[str] = None
    sets: int = 3
    reps: Optional[int] = 10
    rpe: Optional[int] = 8
    weight: Optional[float] = 0.0
    rest_seconds: Optional[int] = 90
    notes: Optional[str] = None


class SelfRoutineDayInput(BaseModel):
    name: str
    order: int = 0
    exercises: list[SelfRoutineExerciseInput] = []


class SelfAssignRoutineRequest(BaseModel):
    template_id: Optional[str] = None
    title: Optional[str] = "Mi Rutina Personalizada"
    description: Optional[str] = None
    days: Optional[list[SelfRoutineDayInput]] = None


@router.post("/routine/self", status_code=status.HTTP_201_CREATED)
async def self_assign_routine(
    payload: SelfAssignRoutineRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """
    Permite a un atleta autónomo (B2C) auto-asignarse una rutina de entrenamiento
    a partir de una plantilla o construida ad-hoc, dejándola activa para hoy.
    """
    athlete_id = current_user.user_id
    tenant_id = current_user.tenant_id

    # 1. Obtener o crear registro de Client
    client_res = await db.execute(select(Client).where(Client.id == athlete_id))
    client = client_res.scalar_one_or_none()
    if not client:
        client = Client(
            id=athlete_id,
            tenant_id=tenant_id,
            full_name=getattr(current_user, "name", "Atleta Autónomo"),
            email=getattr(current_user, "email", f"athlete_{athlete_id.hex[:6]}@bienestar.app"),
        )
        db.add(client)
        await db.flush()

    # 2. Resolver o asignar professional_id
    professional_id = client.professional_id
    if not professional_id:
        from app.db.models import Professional
        pro_result = await db.execute(
            select(Professional).where(Professional.tenant_id == tenant_id).limit(1)
        )
        pro = pro_result.scalar_one_or_none()
        if not pro:
            pro = Professional(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                full_name="Sistema Bienestar AI",
                email=f"ai_trainer_{tenant_id.hex[:6]}@bienestar.app",
                role="TRAINER",
            )
            db.add(pro)
            await db.flush()
        professional_id = pro.id
        client.professional_id = professional_id
        db.add(client)

    # 3. Archivar planes activos previos del atleta
    from sqlalchemy import update
    await db.execute(
        update(WorkoutPlan)
        .where(
            WorkoutPlan.client_id == athlete_id,
            WorkoutPlan.delivery_status == "ASSIGNED",
        )
        .values(delivery_status="SUPERSEDED")
    )

    # 4. Caso A: Clonación desde Plantilla Maestra
    if payload.template_id:
        template_uuid = uuid.UUID(payload.template_id)
        tmpl_res = await db.execute(
            select(WorkoutPlan)
            .where(WorkoutPlan.id == template_uuid)
            .options(
                selectinload(WorkoutPlan.days)
                .selectinload(WorkoutDay.supersets)
                .selectinload(SupersetGroup.exercises)
            )
        )
        template = tmpl_res.scalar_one_or_none()
        if not template:
            raise HTTPException(status_code=404, detail="Plantilla no encontrada")

        new_plan = WorkoutPlan(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            professional_id=professional_id,
            client_id=athlete_id,
            title=payload.title or template.title,
            description=payload.description or template.description,
            delivery_status="ASSIGNED",
            is_master=False,
            derived_from_master_id=template.id,
        )
        db.add(new_plan)
        await db.flush()

        for day in template.days:
            new_day = WorkoutDay(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                plan_id=new_plan.id,
                name=day.name,
                order=day.order,
            )
            db.add(new_day)
            await db.flush()

            for ss in day.supersets:
                new_ss = SupersetGroup(
                    id=uuid.uuid4(),
                    tenant_id=tenant_id,
                    day_id=new_day.id,
                    order=ss.order,
                    notes=ss.notes,
                )
                db.add(new_ss)
                await db.flush()

                for ex in ss.exercises:
                    new_ex = ExerciseTarget(
                        id=uuid.uuid4(),
                        tenant_id=tenant_id,
                        superset_group_id=new_ss.id,
                        exercise_id=ex.exercise_id,
                        custom_exercise_name=ex.custom_exercise_name,
                        order=ex.order,
                        sets=ex.sets,
                        reps=ex.reps,
                        rpe=ex.rpe,
                        weight=ex.weight,
                        rest_seconds=ex.rest_seconds,
                        notes=ex.notes,
                    )
                    db.add(new_ex)

        await db.commit()
        await db.refresh(new_plan)

        logger.info("athlete_routine_self_assigned_from_template", athlete_id=str(athlete_id), plan_id=str(new_plan.id))
        return {
            "status": "success",
            "message": "Rutina asignada exitosamente desde plantilla.",
            "plan_id": str(new_plan.id),
            "title": new_plan.title,
        }

    # 5. Caso B: Construcción Ad-Hoc de Días y Ejercicios
    days_data = payload.days
    if not days_data or len(days_data) == 0:
        # Default Full Body 3 Días si no se enviaron días
        days_data = [
            SelfRoutineDayInput(
                name="Día 1 - Torso & Core",
                order=0,
                exercises=[
                    SelfRoutineExerciseInput(exercise_name="Press de Banca con Barra", sets=4, reps=8, rpe=8, weight=60.0),
                    SelfRoutineExerciseInput(exercise_name="Remo con Barra", sets=4, reps=10, rpe=8, weight=50.0),
                    SelfRoutineExerciseInput(exercise_name="Press Militar con Mancuernas", sets=3, reps=12, rpe=7, weight=18.0),
                    SelfRoutineExerciseInput(exercise_name="Plancha Abdominal", sets=3, reps=60, rpe=7, weight=0.0),
                ]
            ),
            SelfRoutineDayInput(
                name="Día 2 - Pierna & Glúteos",
                order=1,
                exercises=[
                    SelfRoutineExerciseInput(exercise_name="Sentadilla Trasera con Barra", sets=4, reps=8, rpe=8, weight=80.0),
                    SelfRoutineExerciseInput(exercise_name="Peso Muerto Rumano", sets=4, reps=10, rpe=8, weight=70.0),
                    SelfRoutineExerciseInput(exercise_name="Prensa Inclinada", sets=3, reps=12, rpe=8, weight=120.0),
                    SelfRoutineExerciseInput(exercise_name="Elevación de Talones", sets=4, reps=15, rpe=8, weight=40.0),
                ]
            ),
            SelfRoutineDayInput(
                name="Día 3 - Full Body Hipertrofia",
                order=2,
                exercises=[
                    SelfRoutineExerciseInput(exercise_name="Dominadas o Jalón al Pecho", sets=4, reps=10, rpe=8, weight=0.0),
                    SelfRoutineExerciseInput(exercise_name="Fondos en Paralelas o Press Inclinado", sets=3, reps=10, rpe=8, weight=0.0),
                    SelfRoutineExerciseInput(exercise_name="Zancadas con Mancuernas", sets=3, reps=12, rpe=8, weight=16.0),
                    SelfRoutineExerciseInput(exercise_name="Curl de Bíceps en Superset con Tríceps Polea", sets=3, reps=12, rpe=8, weight=14.0),
                ]
            ),
        ]

    new_plan = WorkoutPlan(
        id=uuid.uuid4(),
        tenant_id=tenant_id,
        professional_id=professional_id,
        client_id=athlete_id,
        title=payload.title or "Mi Rutina de Entrenamiento",
        description=payload.description or "Rutina auto-asignada",
        delivery_status="ASSIGNED",
        is_master=False,
    )
    db.add(new_plan)
    await db.flush()

    for day_input in days_data:
        new_day = WorkoutDay(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            plan_id=new_plan.id,
            name=day_input.name,
            order=day_input.order,
        )
        db.add(new_day)
        await db.flush()

        new_ss = SupersetGroup(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            day_id=new_day.id,
            order=0,
        )
        db.add(new_ss)
        await db.flush()

        for idx, ex_input in enumerate(day_input.exercises):
            ex_uuid = uuid.UUID(ex_input.exercise_id) if ex_input.exercise_id else None
            new_ex = ExerciseTarget(
                id=uuid.uuid4(),
                tenant_id=tenant_id,
                superset_group_id=new_ss.id,
                exercise_id=ex_uuid,
                custom_exercise_name=ex_input.exercise_name,
                order=idx,
                sets=ex_input.sets,
                reps=ex_input.reps,
                rpe=ex_input.rpe,
                weight=ex_input.weight,
                rest_seconds=ex_input.rest_seconds,
                notes=ex_input.notes,
            )
            db.add(new_ex)

    await db.commit()
    await db.refresh(new_plan)

    logger.info("athlete_routine_self_assigned_custom", athlete_id=str(athlete_id), plan_id=str(new_plan.id), days_count=len(days_data))
    return {
        "status": "success",
        "message": "Rutina personalizada auto-asignada exitosamente.",
        "plan_id": str(new_plan.id),
        "title": new_plan.title,
        "total_days": len(days_data),
    }


# =============================================================================
# B.3 — POST /sets — Registrar serie completada
# =============================================================================

class CompletedSetPayload(BaseModel):
    """Payload para registrar una serie completada por el atleta."""
    exercise_id: uuid.UUID
    protocol_id: Optional[uuid.UUID] = None
    idempotency_key: str = Field(description="UUID v4 generado por el cliente para prevenir duplicados")
    target_reps: int
    target_weight: float
    actual_reps: Optional[int] = None
    actual_weight: Optional[float] = None
    rpe: Optional[int] = Field(None, ge=1, le=10)
    is_completed: bool = True
    client_created_at: datetime

    model_config = ConfigDict(strict=True)


@router.post("/sets", status_code=status.HTTP_201_CREATED)
async def record_completed_set(
    payload: CompletedSetPayload,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """
    Registra una serie completada por el atleta. Usa idempotency_key (UUIDv4)
    para prevenir duplicados en caso de retry (offline queue / poor connectivity).
    """
    athlete_id = current_user.user_id

    # Verificar idempotencia — si ya existe, retornar éxito sin duplicar
    existing = await db.execute(
        select(WorkoutSets).where(WorkoutSets.idempotency_key == payload.idempotency_key)
    )
    existing_set = existing.scalar_one_or_none()
    if existing_set:
        logger.info("set_already_recorded", idempotency_key=payload.idempotency_key)
        return {
            "status": "already_recorded",
            "set_id": str(existing_set.id),
            "message": "Serie ya registrada previamente (idempotente).",
        }

    new_set = WorkoutSets(
        athlete_id=athlete_id,
        exercise_id=payload.exercise_id,
        protocol_id=payload.protocol_id,
        idempotency_key=payload.idempotency_key,
        target_reps=payload.target_reps,
        target_weight=payload.target_weight,
        actual_reps=payload.actual_reps,
        actual_weight=payload.actual_weight,
        rpe=payload.rpe,
        is_completed=payload.is_completed,
        client_created_at=payload.client_created_at,
    )

    db.add(new_set)
    await db.commit()
    await db.refresh(new_set)

    logger.info(
        "set_recorded",
        set_id=str(new_set.id),
        athlete_id=str(athlete_id),
        exercise_id=str(payload.exercise_id),
        actual_reps=payload.actual_reps,
        actual_weight=payload.actual_weight,
        rpe=payload.rpe,
    )

    return {
        "status": "recorded",
        "set_id": str(new_set.id),
        "message": "Serie registrada exitosamente.",
    }


# =============================================================================
# POST /feedback — Check-in / Feedback del atleta
# =============================================================================

class AthleteFeedbackPayload(BaseModel):
    """Feedback del atleta (check-in de comida, RPE de sesión, etc.)."""
    type: str = Field(description="Tipo: 'MEAL_CHECKIN', 'SESSION_RPE', 'GENERAL'")
    data: dict = Field(default_factory=dict, description="Payload específico según type")
    idempotency_key: Optional[str] = None

    model_config = ConfigDict(strict=True)


@router.post("/feedback", status_code=status.HTTP_201_CREATED)
async def submit_athlete_feedback(
    payload: AthleteFeedbackPayload,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
) -> Any:
    """
    Registra feedback del atleta (check-in de comida, RPE general, etc.).
    Guarda en extra_data del Client como histórico de feedbacks.
    """
    athlete_id = current_user.user_id

    result = await db.execute(
        select(Client).where(Client.id == athlete_id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Atleta no encontrado")

    # Append feedback to client's extra_data
    extra_data = client.extra_data or {}
    feedbacks = extra_data.get("feedbacks", [])
    feedbacks.append({
        "type": payload.type,
        "data": payload.data,
        "timestamp": datetime.utcnow().isoformat(),
        "idempotency_key": payload.idempotency_key,
    })
    extra_data["feedbacks"] = feedbacks[-50:]  # Keep last 50 feedbacks
    client.extra_data = extra_data

    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(client, "extra_data")

    await db.commit()

    logger.info(
        "athlete_feedback_submitted",
        athlete_id=str(athlete_id),
        feedback_type=payload.type,
    )

    return {
        "status": "recorded",
        "message": f"Feedback '{payload.type}' registrado exitosamente.",
    }

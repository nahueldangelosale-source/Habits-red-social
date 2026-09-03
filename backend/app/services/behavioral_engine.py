"""
Bienestar APP - Behavioral Engine (Chapter 4: Módulo "Mind")
=============================================================
Motor de Psicología del Comportamiento basado en neurociencia aplicada.

Pilares:
1. Habit Stacking: Anclaje de entrenamiento a hábitos preexistentes
2. SMART-T Fragmenter: Micro-victorias de ~12 días para ciclos de dopamina
3. Consistency Score: Reemplazo no-punitivo de streaks lineales

Principio Clave: "Nunca falles dos veces" - El sistema perdona 1 día 
de inactividad usando grace_days, protegiendo la motivación del atleta.
"""

import uuid
import structlog
from datetime import datetime, timedelta, date
from typing import Optional, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AthleteDraft,
    ConsistencyTracker,
    ConsistencyTier,
    MicroMilestone,
    WorkoutSession,
)
from app.services.streak_engine import get_logical_habit_date

logger = structlog.get_logger()

# =============================================================================
# CONFIGURACIÓN DEL MOTOR CONDUCTUAL
# =============================================================================

# SMART-T Fragmenter: Duración de cada micro-milestone en días
MILESTONE_CYCLE_DAYS = 12
# Número de milestones a generar automáticamente por ciclo
MILESTONES_PER_CYCLE = 6  # 6 x 12 = 72 días (~2.5 meses)
# Consistency: Umbral de días activos por semana para "semana activa"
MIN_ACTIVE_DAYS_PER_WEEK = 2
# Consistency: Semanas para promoción de tier
WEEKS_FOR_SILVER = 4   # 4 semanas consecutivas activas → SILVER
WEEKS_FOR_GOLD = 8     # 8 semanas consecutivas activas → GOLD


# =============================================================================
# 1. HABIT STACKING (Pilar 1)
# =============================================================================

async def set_habit_anchor(
    db: AsyncSession,
    client_id: uuid.UUID,
    habit_text: str
) -> dict:
    """
    Establece o actualiza el hábito ancla del atleta.
    Ejemplo: "Después de tomar mi café matutino" → El sistema notificará
    al atleta en ese momento para iniciar la rutina.
    """
    result = await db.execute(
        select(AthleteDraft)
        .where(AthleteDraft.client_id == client_id)
        .order_by(AthleteDraft.created_at.desc())
        .limit(1)
    )
    draft = result.scalars().first()

    if not draft:
        logger.warning("habit_anchor_no_draft", client_id=str(client_id))
        return {"status": "error", "message": "No se encontró perfil de onboarding."}

    draft.habit_anchor = habit_text
    await db.commit()
    
    logger.info("habit_anchor_set", client_id=str(client_id), anchor=habit_text)
    return {
        "status": "success",
        "habit_anchor": habit_text,
        "message": f"Tu entrenamiento está anclado a: '{habit_text}'. Te recordaremos en ese momento."
    }


async def get_habit_anchor(
    db: AsyncSession,
    client_id: uuid.UUID
) -> Optional[str]:
    """Recupera el hábito ancla actual del atleta."""
    result = await db.execute(
        select(AthleteDraft.habit_anchor)
        .where(AthleteDraft.client_id == client_id)
        .order_by(AthleteDraft.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


# =============================================================================
# 2. SMART-T FRAGMENTER (Pilar 2 - Micro-Victorias de Dopamina)
# =============================================================================

def _generate_milestone_names(goal_tags: list) -> List[str]:
    """
    Genera nombres de milestones contextuales basados en los goal_tags
    del atleta. Si no hay tags, usa milestones genéricos de progresión.
    """
    # Milestones base (siempre presentes)
    base_milestones = [
        "Completar 3 sesiones de entrenamiento",
        "Registrar tu readiness 5 días seguidos",
        "Alcanzar 70% de consistencia semanal",
        "Completar tu primera semana completa",
        "Lograr 2 semanas consecutivas activas",
        "Mantener tu tier de consistencia por 3 semanas",
    ]
    
    # Milestones contextuales por objetivo
    goal_milestones = {
        "WEIGHT_LOSS": [
            "Registrar 4 entrenamientos en 12 días",
            "Completar 2 sesiones cardiovasculares",
            "Mantener readiness promedio ≥ 3",
        ],
        "MUSCLE_GAIN": [
            "Completar 4 sesiones de fuerza en 12 días",
            "Aumentar carga en 1 ejercicio compuesto",
            "Registrar todas tus series y repeticiones",
        ],
        "GENERAL_FITNESS": [
            "Entrenar 3 días diferentes esta quincena",
            "Probar un ejercicio nuevo del catálogo",
            "Completar una sesión de movilidad",
        ],
    }
    
    result = list(base_milestones)
    
    if goal_tags:
        for tag in goal_tags:
            if tag in goal_milestones:
                result.extend(goal_milestones[tag])
    
    return result[:MILESTONES_PER_CYCLE]


async def generate_micro_milestones(
    db: AsyncSession,
    client_id: uuid.UUID,
    start_date: Optional[date] = None,
    goal_tags: Optional[list] = None,
) -> List[dict]:
    """
    SMART-T Fragmenter: Auto-genera micro-milestones de ~12 días.
    Cada milestone es un checkpoint de dopamina que fragmenta las metas
    a largo plazo en victorias inmediatas y celebrables.
    
    Returns:
        Lista de milestones generados con sus fechas objetivo.
    """
    if start_date is None:
        tz = "America/Argentina/Buenos_Aires"
        start_date = get_logical_habit_date(datetime.utcnow(), tz)
    
    if goal_tags is None:
        # Recuperar goal_tags del AthleteDraft
        draft_result = await db.execute(
            select(AthleteDraft.goal_tags)
            .where(AthleteDraft.client_id == client_id)
            .order_by(AthleteDraft.created_at.desc())
            .limit(1)
        )
        goal_tags = draft_result.scalar_one_or_none() or []
    
    milestone_names = _generate_milestone_names(goal_tags)
    generated = []
    
    for i, name in enumerate(milestone_names):
        target_date = start_date + timedelta(days=MILESTONE_CYCLE_DAYS * (i + 1))
        
        milestone = MicroMilestone(
            client_id=client_id,
            target_logical_date=target_date,
            milestone_name=name,
            xp_reward=50 + (i * 10),  # XP incrementa con cada milestone
        )
        db.add(milestone)
        generated.append({
            "milestone_name": name,
            "target_date": str(target_date),
            "xp_reward": milestone.xp_reward,
        })
    
    await db.commit()
    
    logger.info(
        "smart_t_milestones_generated",
        client_id=str(client_id),
        count=len(generated),
        first_target=generated[0]["target_date"] if generated else None,
    )
    
    return generated


async def check_and_achieve_milestones(
    db: AsyncSession,
    client_id: uuid.UUID,
) -> List[dict]:
    """
    Verifica milestones pendientes y marca como logrados los que 
    correspondan. Retorna los milestones recién logrados para 
    disparar celebraciones en el frontend.
    """
    tz = "America/Argentina/Buenos_Aires"
    today = get_logical_habit_date(datetime.utcnow(), tz)
    
    # Traer milestones pendientes cuya fecha ya pasó
    result = await db.execute(
        select(MicroMilestone)
        .where(
            MicroMilestone.client_id == client_id,
            MicroMilestone.is_achieved == False,
            MicroMilestone.target_logical_date <= today,
        )
        .order_by(MicroMilestone.target_logical_date.asc())
    )
    pending = result.scalars().all()
    
    achieved = []
    for milestone in pending:
        milestone.is_achieved = True
        milestone.achieved_at = datetime.utcnow()
        achieved.append({
            "id": str(milestone.id),
            "milestone_name": milestone.milestone_name,
            "xp_reward": milestone.xp_reward,
        })
    
    if achieved:
        await db.commit()
        logger.info(
            "milestones_achieved",
            client_id=str(client_id),
            count=len(achieved),
        )
    
    return achieved


# =============================================================================
# 3. CONSISTENCY SCORE (Pilar 1 - No-Punitivo)
# =============================================================================

async def _get_or_create_tracker(
    db: AsyncSession,
    client_id: uuid.UUID,
) -> ConsistencyTracker:
    """Obtiene o crea el ConsistencyTracker para un cliente."""
    result = await db.execute(
        select(ConsistencyTracker)
        .where(ConsistencyTracker.client_id == client_id)
    )
    tracker = result.scalars().first()
    
    if not tracker:
        tracker = ConsistencyTracker(client_id=client_id)
        db.add(tracker)
        await db.flush()
        logger.info("consistency_tracker_created", client_id=str(client_id))
    
    return tracker


async def record_activity(
    db: AsyncSession,
    client_id: uuid.UUID,
    activity_date: Optional[date] = None,
) -> dict:
    """
    Registra una actividad y actualiza el ConsistencyTracker.
    Implementa la lógica "Nunca Falles Dos Veces":
    - Si el atleta falta 1 día, consume 1 grace_day pero mantiene tier
    - Si falta 2+ días Y no tiene grace_days, se rebaja el score pero NO el tier
    - El tier NUNCA baja mientras haya semanas activas recientes
    """
    if activity_date is None:
        tz = "America/Argentina/Buenos_Aires"
        activity_date = get_logical_habit_date(datetime.utcnow(), tz)
    
    tracker = await _get_or_create_tracker(db, client_id)
    
    # Calcular gap desde última actividad
    if tracker.last_activity_logical_date:
        gap_days = (activity_date - tracker.last_activity_logical_date).days
        
        if gap_days <= 0:
            # Ya se registró hoy o fecha anterior, no contar doble
            return {
                "status": "already_recorded",
                "tier": tracker.current_tier,
                "score": tracker.weekly_consistency_score,
            }
        
        if gap_days == 2:
            # 1 día de descanso → consumir grace day (Nunca Falles Dos Veces)
            if tracker.grace_days_remaining > 0:
                tracker.grace_days_remaining -= 1
                logger.info("grace_day_consumed", client_id=str(client_id), remaining=tracker.grace_days_remaining)
        elif gap_days >= 3:
            # 2+ días de inactividad → reducir score pero proteger tier
            penalty = min(15, (gap_days - 2) * 5)
            tracker.weekly_consistency_score = max(0, tracker.weekly_consistency_score - penalty)
            logger.warning(
                "consistency_gap_detected",
                client_id=str(client_id),
                gap_days=gap_days,
                penalty=penalty,
            )
    
    # Actualizar fecha de última actividad
    tracker.last_activity_logical_date = activity_date
    
    # Incrementar score (cap 100)
    tracker.weekly_consistency_score = min(100, tracker.weekly_consistency_score + 15)
    
    # Evaluar promoción de tier semanal
    tracker.consecutive_active_weeks = await _calculate_active_weeks(db, client_id)
    
    if tracker.consecutive_active_weeks >= WEEKS_FOR_GOLD:
        tracker.current_tier = ConsistencyTier.GOLD.value
    elif tracker.consecutive_active_weeks >= WEEKS_FOR_SILVER:
        tracker.current_tier = ConsistencyTier.SILVER.value
    
    await db.commit()
    
    logger.info(
        "consistency_activity_recorded",
        client_id=str(client_id),
        tier=tracker.current_tier,
        score=tracker.weekly_consistency_score,
        active_weeks=tracker.consecutive_active_weeks,
    )
    
    return {
        "status": "recorded",
        "tier": tracker.current_tier,
        "score": tracker.weekly_consistency_score,
        "grace_days_remaining": tracker.grace_days_remaining,
        "consecutive_active_weeks": tracker.consecutive_active_weeks,
    }


async def _calculate_active_weeks(
    db: AsyncSession,
    client_id: uuid.UUID,
) -> int:
    """
    Calcula semanas consecutivas activas mirando WorkoutSessions
    de las últimas 12 semanas. Una semana es "activa" si tiene
    al menos MIN_ACTIVE_DAYS_PER_WEEK sesiones.
    """
    tz = "America/Argentina/Buenos_Aires"
    today = get_logical_habit_date(datetime.utcnow(), tz)
    twelve_weeks_ago = today - timedelta(weeks=12)
    
    result = await db.execute(
        select(WorkoutSession.started_at)
        .where(
            WorkoutSession.client_id == client_id,
            WorkoutSession.started_at >= datetime.combine(twelve_weeks_ago, datetime.min.time()),
        )
        .order_by(WorkoutSession.started_at.desc())
    )
    sessions = result.scalars().all()
    
    if not sessions:
        return 0
    
    # Agrupar por semana ISO
    week_counts = {}
    for session_dt in sessions:
        week_key = session_dt.isocalendar()[:2]  # (year, week)
        week_counts[week_key] = week_counts.get(week_key, 0) + 1
    
    # Contar semanas consecutivas activas desde la más reciente
    current_week = today.isocalendar()[:2]
    consecutive = 0
    
    for i in range(12):
        check_date = today - timedelta(weeks=i)
        week_key = check_date.isocalendar()[:2]
        
        if week_counts.get(week_key, 0) >= MIN_ACTIVE_DAYS_PER_WEEK:
            consecutive += 1
        else:
            break
    
    return consecutive


async def get_consistency_summary(
    db: AsyncSession,
    client_id: uuid.UUID,
) -> dict:
    """
    Devuelve un resumen completo del estado de consistencia del atleta
    para renderizar en el dashboard B2C.
    """
    tracker = await _get_or_create_tracker(db, client_id)
    
    # Traer milestones próximos
    tz = "America/Argentina/Buenos_Aires"
    today = get_logical_habit_date(datetime.utcnow(), tz)
    
    milestones_result = await db.execute(
        select(MicroMilestone)
        .where(
            MicroMilestone.client_id == client_id,
            MicroMilestone.is_achieved == False,
        )
        .order_by(MicroMilestone.target_logical_date.asc())
        .limit(3)
    )
    next_milestones = milestones_result.scalars().all()
    
    return {
        "tier": tracker.current_tier,
        "weekly_score": tracker.weekly_consistency_score,
        "grace_days_remaining": tracker.grace_days_remaining,
        "consecutive_active_weeks": tracker.consecutive_active_weeks,
        "next_milestones": [
            {
                "name": m.milestone_name,
                "target_date": str(m.target_logical_date),
                "xp_reward": m.xp_reward,
                "days_remaining": (m.target_logical_date - today).days,
            }
            for m in next_milestones
        ],
    }


async def reset_weekly_grace_days(
    db: AsyncSession,
    client_id: uuid.UUID,
) -> None:
    """
    Reset semanal de grace_days a 2. Debe invocarse por un cron semanal
    o al detectar inicio de nueva semana ISO en record_activity.
    """
    tracker = await _get_or_create_tracker(db, client_id)
    tracker.grace_days_remaining = 2
    await db.commit()
    logger.info("grace_days_reset", client_id=str(client_id))

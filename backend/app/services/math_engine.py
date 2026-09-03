import structlog
from datetime import datetime
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import WorkoutSets
import asyncio

logger = structlog.get_logger()

def calculate_brzycki_e1rm(weight: float, reps: int) -> float:
    """
    Calcula el 1RM estimado (e1RM) usando la frmula de Brzycki.
    """
    if reps <= 0 or weight <= 0:
        return 0.0
        
    effective_reps = reps
    if effective_reps >= 37:
        logger.warning("math_engine_guardrail_triggered", reps=reps, msg="Repeticiones > 36. Capando a 36 para clculo Brzycki.")
        effective_reps = 36
        
    e1rm = weight * (36 / (37 - effective_reps))
    return round(e1rm, 2)


async def get_current_e1rm_on_demand(
    db: AsyncSession,
    athlete_id: UUID,
    exercise_id: UUID,
    protocol_id: UUID,
) -> float:
    """
    Read-Through Cache con Redis.
    Acotado por protocol_id (Mesociclo activo).
    """
    from app.services.redis_client import get_redis
    redis = await get_redis()
    cache_key = f"e1rm:{athlete_id}:{exercise_id}:{protocol_id}"
    
    # 1. Intentar leer de Redis (Cache Hit)
    cached_val = await redis.get(cache_key)
    if cached_val is not None:
        return float(cached_val)
        
    # 2. Cache Miss: Consultar la DB
    stmt = select(WorkoutSets).where(
        WorkoutSets.athlete_id == athlete_id,
        WorkoutSets.exercise_id == exercise_id,
        WorkoutSets.protocol_id == protocol_id,
        WorkoutSets.is_completed == True,
        WorkoutSets.is_unscheduled == False
    ).order_by(WorkoutSets.client_created_at.desc()).limit(3)
    
    result = await db.execute(stmt)
    sets = result.scalars().all()
    
    e1rm = 0.0
    if sets:
        recent_e1rms = [calculate_brzycki_e1rm(s.actual_weight, s.actual_reps) for s in sets if s.actual_weight and s.actual_reps]
        if recent_e1rms:
            e1rm = max(recent_e1rms)
            
    # 3. Guardar en Redis con TTL de 7 das (memoizacin)
    await redis.setex(cache_key, 604800, e1rm)
    return e1rm


async def recalculate_and_cache_e1rm(
    athlete_id: UUID,
    exercise_id: UUID,
    protocol_id: UUID
):
    """
    Background Task asncrona para la Invalidacin Proactiva de Cach.
    Usa un bloqueo (Distributed Lock) para evitar Condiciones de Carrera (Stale Data Write).
    """
    from app.services.redis_client import get_redis
    from app.db.connection import async_session_maker
    
    redis = await get_redis()
    lock_key = f"lock:e1rm:{athlete_id}:{exercise_id}:{protocol_id}"
    cache_key = f"e1rm:{athlete_id}:{exercise_id}:{protocol_id}"
    
    # Adquirir lock distribuido usando redis-py
    lock_acquired = await redis.set(lock_key, "1", nx=True, ex=10) # 10s TTL
    
    if not lock_acquired:
        logger.warning("e1rm_lock_collision", athlete_id=str(athlete_id), exercise_id=str(exercise_id))
        for _ in range(10):
            await asyncio.sleep(0.5)
            if await redis.set(lock_key, "1", nx=True, ex=10):
                lock_acquired = True
                break
                
        if not lock_acquired:
            logger.error("e1rm_lock_failed", athlete_id=str(athlete_id), exercise_id=str(exercise_id))
            return
            
    try:
        # Sesion DB aislada
        async with async_session_maker() as db:
            stmt = select(WorkoutSets).where(
                WorkoutSets.athlete_id == athlete_id,
                WorkoutSets.exercise_id == exercise_id,
                WorkoutSets.protocol_id == protocol_id,
                WorkoutSets.is_completed == True,
                WorkoutSets.is_unscheduled == False
            ).order_by(WorkoutSets.client_created_at.desc()).limit(3)
            
            result = await db.execute(stmt)
            sets = result.scalars().all()
            
            e1rm = 0.0
            if sets:
                recent_e1rms = [calculate_brzycki_e1rm(s.actual_weight, s.actual_reps) for s in sets if s.actual_weight and s.actual_reps]
                if recent_e1rms:
                    e1rm = max(recent_e1rms)
                    
            await redis.setex(cache_key, 604800, e1rm)
            logger.info("e1rm_background_cache_updated", athlete_id=str(athlete_id), exercise_id=str(exercise_id), e1rm=e1rm)
    finally:
        await redis.delete(lock_key)


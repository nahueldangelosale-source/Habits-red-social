import asyncio
import structlog
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.db.connection import async_session_maker
from app.db.models import WorkoutSession, ExerciseLog
from app.domain.math_engine.e1rm import get_best_e1rm
from app.domain.math_engine.snc_fatigue import compute_session_fatigue
from app.services.sse_manager import sse_manager
from app.services.redis_client import get_redis

logger = structlog.get_logger()

def _run_pure_math_pipeline(session_data: dict, logs_data: list[dict]) -> dict:
    """
    CPU-Bound Entrypoint.
    Runs pure mathematical functions from the domain layer.
    """
    # 1. Calcular Fatiga SNC de la sesión
    volume = session_data.get("total_volume_kg", 0.0)
    rpe = session_data.get("perceived_rpe", 5)
    fatigue = compute_session_fatigue(volume, float(rpe))

    # 2. Calcular e1RM por cada ejercicio (simplificado)
    # En un caso real agruparíamos por exercise_id
    # Aquí calculamos un "max e1rm" global de la sesión como demo de agregación pesada
    best_e1rm_global = get_best_e1rm(logs_data)
    
    # Podríamos tener loops densos, procesamiento matricial, etc.
    # Simulamos un poco de carga pesada si fuera necesario, 
    # pero las fórmulas puras ya están importadas.
    
    return {
        "snc_fatigue_generated": fatigue,
        "best_e1rm_global": best_e1rm_global
    }


async def process_telemetry_bg(workout_session_id: UUID, athlete_id: UUID):
    """
    Worker Asíncrono de Telemetría (Math Engine Pipeline).
    Se invoca vía FastAPI BackgroundTasks.
    """
    logger.info("telemetry_worker_started", session_id=str(workout_session_id))
    
    try:
        async with async_session_maker() as db:
            # 1. Extraer datos (I/O Bound)
            stmt = select(WorkoutSession).where(WorkoutSession.id == workout_session_id)
            result = await db.execute(stmt)
            session_obj = result.scalar_one_or_none()
            
            if not session_obj:
                logger.error("telemetry_worker_session_not_found", session_id=str(workout_session_id))
                return
                
            logs_stmt = select(ExerciseLog).where(ExerciseLog.session_id == workout_session_id)
            logs_res = await db.execute(logs_stmt)
            logs_objs = logs_res.scalars().all()
            
            # Preparar dicts crudos para el engine puro
            session_dict = {
                "total_volume_kg": session_obj.total_volume_kg,
                "perceived_rpe": session_obj.perceived_rpe
            }
            logs_dict_list = [
                {
                    "weight": l.weight_kg,
                    "reps": l.reps,
                    "rpe": session_obj.perceived_rpe # Aproximación si el RPE es por sesión
                }
                for l in logs_objs
            ]

        # 2. Computar Matemáticas Pesadas en Hilo Separado (Libera el GIL)
        # Offloading the CPU-bound work
        calc_results = await asyncio.to_thread(_run_pure_math_pipeline, session_dict, logs_dict_list)
        
        async with async_session_maker() as db:
            # 3. Guardar resultados y marcar como COMPLETED (I/O Bound)
            # En una arquitectura real actualizaríamos tablas de proyecciones o la misma sesión
            # Aquí actualizamos el estado transaccional para la estrategia de reconciliación
            await db.execute(
                update(WorkoutSession)
                .where(WorkoutSession.id == workout_session_id)
                .values(math_status="COMPLETED")
            )
            await db.commit()
            
            # Guardamos la fatiga en Redis para dashboards rápidos
            redis = await get_redis()
            await redis.setex(
                f"snc_fatigue:{athlete_id}",
                86400, # 24 hrs
                calc_results["snc_fatigue_generated"]
            )
            
            logger.info("telemetry_worker_success", 
                        session_id=str(workout_session_id), 
                        results=calc_results)
            
            # 4. SSE Broadcast para UX Mágica
            payload = {
                "session_id": str(workout_session_id),
                "fatigue": calc_results["snc_fatigue_generated"],
                "e1rm": calc_results["best_e1rm_global"],
                "status": "COMPLETED"
            }
            # Se envía al canal del atleta para que el dashboard se actualice en tiempo real
            await sse_manager.broadcast_to_client(athlete_id, "TELEMETRY_UPDATED", payload)

    except Exception as e:
        logger.error("telemetry_worker_failed", session_id=str(workout_session_id), error=str(e))
        # En caso de fallo, intentamos marcarlo como FAILED (si la DB responde)
        try:
            async with async_session_maker() as db:
                await db.execute(
                    update(WorkoutSession)
                    .where(WorkoutSession.id == workout_session_id)
                    .values(math_status="FAILED")
                )
                await db.commit()
        except:
            pass


async def reconcile_orphaned_workouts():
    """
    El Sweeper (Garbage Collector).
    Busca sesiones cuyo math_status sigue en PENDING tras 5 minutos de haber finalizado.
    Re-inyecta las sesiones al worker.
    """
    logger.info("reconcile_orphaned_workouts_started")
    try:
        async with async_session_maker() as db:
            five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
            stmt = select(WorkoutSession).where(
                WorkoutSession.math_status == "PENDING",
                WorkoutSession.ended_at < five_mins_ago
            )
            res = await db.execute(stmt)
            orphans = res.scalars().all()
            
            for orphan in orphans:
                logger.warning("recovering_orphaned_workout", session_id=str(orphan.id))
                asyncio.create_task(process_telemetry_bg(orphan.id, orphan.client_id))
                
            logger.info("reconcile_orphaned_workouts_finished", recovered_count=len(orphans))
    except Exception as e:
        logger.error("reconcile_orphaned_workouts_failed", error=str(e))

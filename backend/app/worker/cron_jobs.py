import asyncio
import structlog
from sqlalchemy import select
from app.db.connection import async_session_maker
from app.db.models import Tenant
from app.services.radar_engine import RadarEngine

logger = structlog.get_logger()

# Global variable to manage the scheduler task
_radar_scheduler_task = None

async def run_radar_analytics_loop():
    """
    Loop asíncrono puro que ejecuta el análisis del Radar Predictivo cada 1 hora.
    Sigue las directrices Lean para evitar Celery/Redis en esta fase.
    """
    logger.info("radar_scheduler_started")
    while True:
        try:
            # Esperar 1 hora (3600 segundos)
            # En producción corre cada 1 hora. Para testing podemos acotarlo.
            await asyncio.sleep(3600)
            
            logger.info("radar_scheduler_tick_executing")
            
            # Crear sesión asíncrona de base de datos
            async with async_session_maker() as db:
                # Obtener todos los tenants
                stmt = select(Tenant)
                res = await db.execute(stmt)
                tenants = res.scalars().all()
                
                engine = RadarEngine(db)
                for tenant in tenants:
                    try:
                        created, resolved = await engine.run_analytics_for_tenant(tenant.id)
                        logger.info(
                            "radar_scheduler_tenant_completed",
                            tenant_id=str(tenant.id),
                            created_alerts=created,
                            resolved_alerts=resolved
                        )
                    except Exception as tenant_err:
                        logger.error(
                            "radar_scheduler_tenant_failed",
                            tenant_id=str(tenant.id),
                            error=str(tenant_err)
                        )
        except asyncio.CancelledError:
            logger.info("radar_scheduler_cancelled")
            break
        except Exception as e:
            logger.error("radar_scheduler_tick_failed", error=str(e))
            # Esperar un momento antes de reintentar si falló la conexión a la base de datos
            await asyncio.sleep(60)

def start_radar_scheduler():
    """
    Inicia el scheduler en segundo plano.
    """
    global _radar_scheduler_task
    if _radar_scheduler_task is None:
        _radar_scheduler_task = asyncio.create_task(run_radar_analytics_loop())
        logger.info("radar_scheduler_task_registered")

def stop_radar_scheduler():
    """
    Detiene el scheduler de forma limpia.
    """
    global _radar_scheduler_task
    if _radar_scheduler_task is not None:
        _radar_scheduler_task.cancel()
        _radar_scheduler_task = None
        logger.info("radar_scheduler_task_stopped")

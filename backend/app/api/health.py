from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import time

from app.db.connection import get_db
from app.config import get_settings

settings = get_settings()
router = APIRouter()

@router.get("/health", tags=["Infrastructure"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint para monitoreo de uptime y telemetría de base de datos.
    """
    start_time = time.perf_counter()
    db_status = "connected"
    
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"
        
    lag_ms = (time.perf_counter() - start_time) * 1000

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "app": settings.app_name,
        "environment": settings.environment,
        "telemetry": {
            "event_loop_lag_ms": round(lag_ms, 2),
            "database": {
                "status": db_status
            }
        }
    }

@router.get("/ready", tags=["Infrastructure"])
async def readiness_check():
    """
    Readiness probe para orquestadores (Kubernetes / Render / Cloud Run).
    """
    return {"ready": True}

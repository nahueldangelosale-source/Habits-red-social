import time
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, text
from app.db.connection import get_db
from app.middleware.auth import get_current_user, TokenData
from app.domain.watchtower.cri_engine import calculate_cri, AthleteStats
from app.db.models import Client, ActiveWorkoutPlan, ClientExtraFlags
from app.domain.watchtower.models import ChurnRiskScore
from app.services.redis_client import get_redis
from app.services.socket_manager import manager as socket_manager
from app.api.onboarding_routes import clone_global_baseline_to_tenant
from app.worker.scheduling_worker import process_churn_risk_evaluation
import logging
from datetime import datetime, timedelta, timezone
from opentelemetry import trace
import uuid

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)
router = APIRouter(tags=["Sandbox Simulator"])

@router.post("/reset")
async def hard_reset_sandbox(
    baseline_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Destruye atómicamente al Ghost Athlete del tenant y lo re-clona.
    SLA < 800ms.
    """
    start_time = time.time()
    tenant_id = current_user.tenant_id
    
    with tracer.start_as_current_span("sandbox.hard_reset") as span:
        try:
            # Atomic Transaction con Timeout a nivel PostgreSQL
            await db.execute(text("SET LOCAL statement_timeout = 2000;"))
            
            # Buscar el Ghost Athlete de este tenant
            stmt = select(Client.id).where(
                Client.tenant_id == tenant_id,
                Client.extra_data.contains({ClientExtraFlags.IS_GHOST_PERSONA.value: True})
            )
            result = await db.execute(stmt)
            ghost_id = result.scalar_one_or_none()
            
            if ghost_id:
                logger.info(f"[Sandbox] Destruyendo Ghost ID {ghost_id} para Tenant {tenant_id}")
                
                # ActiveWorkoutPlan Cascade
                await db.execute(
                    delete(ActiveWorkoutPlan).where(ActiveWorkoutPlan.client_id == ghost_id)
                )
                
                # Destruir Cliente
                await db.execute(
                    delete(Client).where(Client.id == ghost_id)
                )
                
                # Flush de Redis Keys asociadas al ghost
                redis = await get_redis()
                keys = await redis.keys(f"cri:{tenant_id}:{ghost_id}:*")
                if keys:
                    await redis.delete(*keys)
            
            # Re-Clonar (Generar nuevo Ghost)
            new_ghost_id, new_plan_id = await clone_global_baseline_to_tenant(
                db, baseline_id, tenant_id
            )
            
            await db.commit()
            
            elapsed_ms = (time.time() - start_time) * 1000
            span.set_attribute("execution.latency_ms", elapsed_ms)
            
            if elapsed_ms > 800:
                logger.warning(f"[SLA Breach] Hard Reset tomó {elapsed_ms:.2f}ms (> 800ms limit)")
            else:
                logger.info(f"[Sandbox] Hard Reset completado en {elapsed_ms:.2f}ms")
            
            # Notificar al Frontend reactivo
            await socket_manager.broadcast_to_tenant(
                tenant_id, 
                {
                    "type": "SANDBOX_RESET_COMPLETED",
                    "payload": {
                        "new_ghost_id": new_ghost_id,
                        "new_plan_id": new_plan_id
                    }
                }
            )
            
            return {
                "status": "success",
                "message": "Tabula Rasa completada.",
                "ghost_athlete_id": new_ghost_id,
                "latency_ms": elapsed_ms
            }
            
        except Exception as e:
            await db.rollback()
            logger.error(f"[Sandbox] Fallo críitico en Hard Reset: {str(e)}")
            raise HTTPException(status_code=500, detail="Fallo de Atomicidad en Tabula Rasa")

@router.post("/simulate-absence")
async def simulate_absence(
    days: int = 5,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Retrocede los timestamps de last_active_at del Ghost Athlete y reencola el CRI Engine.
    """
    tenant_id = current_user.tenant_id
    
    # Buscar Ghost
    stmt = select(Client).where(
        Client.tenant_id == tenant_id,
        Client.extra_data.contains({ClientExtraFlags.IS_GHOST_PERSONA.value: True})
    )
    result = await db.execute(stmt)
    ghost = result.scalar_one_or_none()
    
    if not ghost:
        raise HTTPException(status_code=404, detail="Ghost Athlete no encontrado")
        
    past_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Mutación DB (si tuviéramos un campo last_active_at lo actualizaríamos aquí)
    # Por ahora mutamos el last_attendance en Redis
    redis = await get_redis()
    await redis.set(f"cri:{tenant_id}:{ghost.id}:last_attendance", past_date.isoformat())
    await redis.set(f"cri:{tenant_id}:{ghost.id}:consecutive_attendances", "0")
    
    # Calcular CRI directo usando la pureza del motor matemático
    stats = AthleteStats(
        days_since_last_attendance=days,
        consecutive_attendances=0,
        cancel_no_show_ratio=0.5,
        dsi_score=0.8,
        plan_completion_rate=0.2
    )
    cri_result = calculate_cri(stats)
    
    # Guardar la métrica en BD para el histórico simulado
    score_record = ChurnRiskScore(
        client_id=ghost.id,
        tenant_id=tenant_id,
        score=cri_result.score,
        risk_level=cri_result.risk_level.value,
        evaluated_at=datetime.now(timezone.utc),
        contributing_factors=cri_result.factors
    )
    db.add(score_record)
    await db.commit()
    
    # Emitir evento al Watchtower
    await socket_manager.broadcast_to_tenant(
        tenant_id, 
        {
            "type": "CRI_ALERT",
            "payload": {
                "client_id": ghost.id,
                "score": cri_result.score,
                "risk_level": cri_result.risk_level.value,
                "factors": cri_result.factors
            }
        }
    )
    
    return {"status": "success", "message": f"Simulación de abandono ({days} días) iniciada.", "cri": cri_result.score}

@router.post("/simulate-drift")
async def simulate_drift(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Simula alta discrepancia (Drift Biomecánico) disparando ActionCard.
    """
    tenant_id = current_user.tenant_id
    stmt = select(Client.id).where(
        Client.tenant_id == tenant_id,
        Client.extra_data.contains({ClientExtraFlags.IS_GHOST_PERSONA.value: True})
    )
    ghost_id = (await db.execute(stmt)).scalar_one_or_none()
    if not ghost_id:
        raise HTTPException(status_code=404, detail="Ghost Athlete no encontrado")
        
    await socket_manager.broadcast_to_tenant(
        tenant_id, 
        {
            "type": "ACTION_CARD_GENERATED",
            "payload": {
                "ghost_id": ghost_id,
                "card_type": "BIOMECHANICAL_DRIFT",
                "severity": "HIGH",
                "dsi": 1.8
            }
        }
    )
    
    return {"status": "success", "message": "Simulación de drift biomecánico emitida."}

@router.post("/simulate-conflict")
async def simulate_conflict(
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Altera el state_hash del Ghost y emite evento de conflicto.
    """
    tenant_id = current_user.tenant_id
    stmt = select(Client.id).where(
        Client.tenant_id == tenant_id,
        Client.extra_data.contains({ClientExtraFlags.IS_GHOST_PERSONA.value: True})
    )
    ghost_id = (await db.execute(stmt)).scalar_one_or_none()
    if not ghost_id:
        raise HTTPException(status_code=404, detail="Ghost Athlete no encontrado")
        
    await socket_manager.broadcast_to_tenant(
        tenant_id, 
        {
            "type": "MERGE_CONFLICT_DETECTED",
            "payload": {
                "ghost_id": ghost_id,
                "conflict_type": "BIOMECHANICAL_DRIFT"
            }
        }
    )
    
    return {"status": "success", "message": "Simulación de conflicto emitida."}

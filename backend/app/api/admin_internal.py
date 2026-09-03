import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from opentelemetry import trace

from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.domain.billing.models import LedgerEntry
from app.services.redis_client import get_redis
from redis.asyncio import Redis

logger = logging.getLogger(__name__)
tracer = trace.get_tracer(__name__)

router = APIRouter(prefix="/api/v1/admin/internal", tags=["Internal Admin"])

# TODO (JIRA-899): Eliminar este endpoint temporal tras estabilizar la Fase 53 (MercadoPago Payouts)
@router.post("/seed-wallet")
async def seed_canary_wallet(
    target_user_id: uuid.UUID,
    target_tenant_id: uuid.UUID,
    current_user: TokenData = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """
    Inyección de liquidez artificial (6,000 ARS) para pruebas del Canario Alfa.
    Oculto tras Feature Flag (Validación estricta de roles/UUIDs).
    """
    # 1. Feature Flag / Autorización Estricta (Solo ADMIN puede gatillar esto)
    if current_user.role != "ADMIN":
        logger.error(f"Intento no autorizado de inyección de saldo por {current_user.user_id}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado. Feature Flag deshabilitada.")

    amount_cents = 600000  # 6,000 ARS
    
    # 2. Inyección de Trazabilidad OpenTelemetry con Semántica Personalizada
    with tracer.start_as_current_span("seed_funding_injection") as span:
        # Contexto de Simulación
        span.set_attribute("app.simulation.active", True)
        span.set_attribute("app.simulation.type", "canary_seed_funding")
        span.set_attribute("app.finance.ledger.entry_type", "SEED_FUNDING")
        
        # Contexto de Ejecución
        span.set_attribute("app.execution.origin", "ephemeral_endpoint")
        span.set_attribute("app.execution.operator", str(current_user.user_id))
        
        # Contexto de Resiliencia
        span.set_attribute("app.payout.threshold_override", True)

        try:
            # 3. Transacción ACID en Postgres
            seed_entry = LedgerEntry(
                tenant_id=target_tenant_id,
                user_id=target_user_id,
                amount_cents=amount_cents,
                currency="ARS",
                reference_type="SEED_FUNDING",
                reference_id=uuid.uuid4()
            )
            db.add(seed_entry)
            await db.commit()
            
            # 4. Actualización del Caché en Redis
            cache_key = f"tenant:{target_tenant_id}:prof:{str(target_user_id)}:balance"
            await redis.hincrby(cache_key, "available_cents", amount_cents)
            
            logger.info(
                f"seed_funding_injected - operator={current_user.user_id} target_user={target_user_id} amount={amount_cents}"
            )
            
            return {
                "status": "success",
                "message": f"6,000 ARS inyectados con éxito en la billetera de {target_user_id}",
                "trace_context": "simulation_active"
            }
            
        except Exception as e:
            await db.rollback()
            span.record_exception(e)
            span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
            logger.error(f"Fallo en inyección de fondos: {str(e)}")
            raise HTTPException(status_code=500, detail="Fallo crítico al inyectar fondos semilla")

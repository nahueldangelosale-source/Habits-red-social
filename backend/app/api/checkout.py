from fastapi import APIRouter, Depends, Response, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.db.database import get_db
from app.middleware.auth import get_current_user, TokenData
from app.schemas.monetization import (
    StandardResponse, 
    ResponseMeta, 
    CheckoutPreferenceRequest,
    CheckoutPreferencePayload
)
from app.db.models import FinancialLedger, PurchaseIntent
from app.services.redis_client import get_redis
from redis.asyncio import Redis
import uuid

router = APIRouter(prefix="/checkout", tags=["Monetization"])

@router.post("/preference", status_code=status.HTTP_201_CREATED, response_model=StandardResponse[CheckoutPreferencePayload])
async def create_checkout_preference(
    payload: CheckoutPreferenceRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    tenant_id = str(current_user.tenant_id)
    features = getattr(current_user, "features", {}) 
    is_chaos_tenant = tenant_id == "CHAOS_001"
    
    if is_chaos_tenant or features.get("ENABLE_REAL_LEDGER"):
        # La Puerta de Idempotencia (Redis SETNX)
        # Asumimos que el frontend envía un 'idempotency_key' en el payload. 
        # Si no lo envía, generamos uno temporal para propósitos de prueba, 
        # pero en producción debería ser obligatorio en el Request.
        idempotency_key = getattr(payload, "idempotency_key", uuid.uuid4().hex)
        redis_key = f"idempotency:{tenant_id}:{idempotency_key}"
        
        # SETNX: Solo establece la clave si no existe. Expira en 24h.
        acquired = await redis.set(redis_key, "locked", nx=True, ex=86400)
        if not acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Transaction already processing or processed (Idempotency Key Conflict)"
            )
            
        try:
            # El Ledger Append-Only (PostgreSQL)
            preference_id = f"pref_{tenant_id[:8]}_{uuid.uuid4().hex[:8]}"
            amount_cents = payload.plan_price_cents
            
            # 1. Registrar la Intención de Compra
            purchase_intent = PurchaseIntent(
                tenant_id=tenant_id,
                idempotency_key=idempotency_key,
                amount_cents=amount_cents,
                status="CREATED"
            )
            db.add(purchase_intent)
            
            # 2. Registrar en el Ledger Financiero Inmutable
            ledger_entry = FinancialLedger(
                tenant_id=tenant_id,
                amount_cents=amount_cents,
                transaction_type="SUBSCRIPTION_INTENT",
                reference_id=preference_id
            )
            db.add(ledger_entry)
            
            await db.commit()
            
            return StandardResponse(
                data=CheckoutPreferencePayload(
                    preference_id=preference_id,
                    amount_cents=amount_cents,
                    currency="ARS",
                    status="created",
                    init_point=f"https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id={preference_id}"
                ),
                meta=ResponseMeta(is_degraded=False, ttl=0)
            )
            
        except IntegrityError:
            await db.rollback()
            # Escudo Final de BD
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Integrity violation (Unique Constraint failed)"
            )
        except Exception as e:
            await db.rollback()
            # En caso de error, liberamos el candado para permitir reintentos válidos
            await redis.delete(redis_key)
            raise e

    # SRE Guardrail
    response.headers["X-Ecosystem-Degraded"] = "true"
    
    mock_payload = CheckoutPreferencePayload(
        preference_id=f"pref_CHAOS_{uuid.uuid4().hex[:8]}",
        amount_cents=1000000, # 10,000 ARS (Mocked)
        currency="ARS",
        status="created",
        init_point=f"https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock_{uuid.uuid4().hex[:8]}"
    )
    
    return StandardResponse(
        data=mock_payload,
        meta=ResponseMeta(
            is_degraded=True, 
            reason="Pending MP Webhook/Ledger integration (Phase 52)",
            ttl=0 # Do not cache checkouts
        )
    )

from pydantic import BaseModel
from sqlalchemy import update
from app.domain.billing.models import Subscription, LedgerEntry

class SimulateUpgradeRequest(BaseModel):
    idempotency_key: str
    target_tier: str = "TIER_2"
    amount_cents: int = 500000

@router.post("/simulate-b2b-upgrade", status_code=status.HTTP_200_OK)
async def simulate_b2b_upgrade(
    payload: SimulateUpgradeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    """
    Mock B2B: Simula un pago exitoso de Stripe/MercadoPago para ascender de Tier.
    Escribe en el Ledger Inmutable.
    """
    tenant_id = str(current_user.tenant_id)
    redis_key = f"idempotency:{tenant_id}:{payload.idempotency_key}"
    
    acquired = await redis.set(redis_key, "locked", nx=True, ex=86400)
    if not acquired:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Transaction already processed (Idempotency Key Conflict)"
        )
        
    try:
        # 1. Registrar en Ledger Inmutable (Append-Only)
        ledger_entry = LedgerEntry(
            tenant_id=uuid.UUID(tenant_id),
            user_id=current_user.user_id,
            amount_cents=payload.amount_cents,
            currency="ARS",
            reference_type="SUBSCRIPTION_UPGRADE",
            reference_id=uuid.uuid4()
        )
        db.add(ledger_entry)
        
        # 2. Actualizar Suscripción
        stmt = (
            update(Subscription)
            .where(Subscription.tenant_id == uuid.UUID(tenant_id))
            .values(tier=payload.target_tier)
        )
        await db.execute(stmt)
        
        await db.commit()
        return {"status": "success", "message": f"Ascendido a {payload.target_tier} exitosamente", "ledger_id": str(ledger_entry.id)}
        
    except Exception as e:
        await db.rollback()
        await redis.delete(redis_key)
        import logging
        logging.getLogger(__name__).error(f"Error in simulate_b2b_upgrade: {e}")
        raise HTTPException(status_code=500, detail="Error procesando la transacción simulada")

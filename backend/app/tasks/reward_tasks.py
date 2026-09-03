import asyncio
import logging
import uuid

from celery import shared_task
from sqlalchemy.future import select

from app.db.connection import async_session_maker
from app.db.models import Tenant

logger = logging.getLogger(__name__)

async def _process_referral_reward_async(new_tenant_id: str):
    """
    Lógica asíncrona del Motor Viral.
    Implementa el "Escudo Asimétrico" para evitar Sybil attacks.
    """
    try:
        new_tenant_uuid = uuid.UUID(new_tenant_id)
    except ValueError:
        logger.error(f"Invalid UUID provided for reward processing: {new_tenant_id}")
        return

    async with async_session_maker() as db:
        # 1. Recuperar el tenant recién creado que completó la Prueba de Trabajo
        result = await db.execute(select(Tenant).where(Tenant.id == new_tenant_uuid))
        new_tenant = result.scalars().first()
        
        if not new_tenant:
            logger.error(f"Tenant {new_tenant_id} no encontrado para recompensa de referidos.")
            return
            
        if new_tenant.referral_reward_claimed:
            logger.info(f"Tenant {new_tenant_id} ya cobró su recompensa. Idempotencia activada.")
            return
            
        if not new_tenant.referred_by_tenant_id:
            logger.info(f"Tenant {new_tenant_id} es orgánico (no fue referido).")
            return
            
        # 2. Lookup Referrer
        result_ref = await db.execute(select(Tenant).where(Tenant.id == new_tenant.referred_by_tenant_id))
        referrer_tenant = result_ref.scalars().first()
        
        if not referrer_tenant:
            logger.error(f"Tenant Referidor {new_tenant.referred_by_tenant_id} no encontrado.")
            return
            
        # 3. ESCUDO ASIMÉTRICO (CTO Guardrail)
        if not referrer_tenant.stripe_customer_id:
            logger.warning(
                f"🛡️ ASYMMETRIC SHIELD ENGAGED: El referidor {referrer_tenant.id} "
                f"intentó reclamar recompensa sin tener Billing verificado (Risk of Sybil Attack). "
                f"Recompensa denegada atómicamente."
            )
            # Acotamos el intento (quemamos la oportunidad)
            new_tenant.referral_reward_claimed = True
            await db.commit()
            return
            
        # 4. Inyección Atómica de Recompensas
        logger.info(f"💸 MOTOR VIRAL: Inyectando 100,000 Compute Units al Referidor ({referrer_tenant.id}) y Referido ({new_tenant.id}).")
        
        new_tenant.compute_units_balance += 100000
        new_tenant.referral_reward_claimed = True  # Cerrar la brecha de re-entrancy
        
        referrer_tenant.compute_units_balance += 100000
        
        await db.commit()
        
        logger.info(f"✅ Motor Viral: Recompensa B2B completada con éxito.")


@shared_task(name="rewards.process_referral")
def process_referral_reward(new_tenant_id: str):
    """
    Celery task bridge que orquesta la inyección asíncrona de Compute Units
    a ambos extremos del embudo B2B PLG.
    """
    loop = asyncio.get_event_loop()
    loop.run_until_complete(_process_referral_reward_async(new_tenant_id))
    return f"Processed B2B reward loop for {new_tenant_id}"

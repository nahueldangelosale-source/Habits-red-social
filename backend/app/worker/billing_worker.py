import asyncio
from celery import shared_task
from app.db.database import async_session_maker
from app.domain.billing.models import Invoice, LedgerEntry
from app.domain.scheduling.workflow_manager import ClassSessionWorkflowManager
from sqlalchemy.future import select
import uuid
import logging

logger = logging.getLogger(__name__)

async def async_process_mp_webhook(mp_payment_id: str, event_id: str):
    """
    1. Llama a la API de MP (simulado) para traer el status real.
    2. Si es APPROVED, marca el invoice y promueve la reserva.
    """
    async with async_session_maker() as session:
        # Simulamos GET https://api.mercadopago.com/v1/payments/{mp_payment_id}
        # En producción se usaría httpx.get() con el Access Token de MP
        await asyncio.sleep(0.5) 
        
        # Simulamos respuesta exitosa de MP
        simulated_status = "approved"
        
        if simulated_status != "approved":
            logger.info(f"Payment {mp_payment_id} not approved. Status: {simulated_status}")
            return
            
        # Buscamos la intención de pago
        stmt = select(Invoice).where(Invoice.provider_payment_id == mp_payment_id)
        result = await session.execute(stmt)
        invoice = result.scalar_one_or_none()
        
        if not invoice:
            logger.error(f"Invoice for MP payment {mp_payment_id} not found.")
            return
            
        if invoice.status == "PAID":
            logger.info(f"Invoice {invoice.id} already marked as PAID.")
            return

        workflow = ClassSessionWorkflowManager(session)
        # Promover reserva + impactar ledger de forma atómica
        success = await workflow.confirm_paid_reservation(
            reservation_id=invoice.reservation_id,
            invoice_id=invoice.id,
            amount_cents=invoice.amount_cents
        )
        
        if success:
            logger.info(f"Successfully processed payment {mp_payment_id} and promoted reservation {invoice.reservation_id}")
        else:
            logger.error(f"Failed to process payment {mp_payment_id} atomically.")

@shared_task(name="billing.process_mp_webhook")
def process_mp_webhook(mp_payment_id: str, event_id: str):
    """
    Worker Síncrono-Asíncrono de Celery que captura la notificación
    desacoplada de Mercado Pago.
    """
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    loop.run_until_complete(async_process_mp_webhook(mp_payment_id, event_id))

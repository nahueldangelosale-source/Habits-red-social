from celery import shared_task
from app.db.connection import async_session_maker
from app.db.models import FinancialTransaction, Client, PaymentStatus
from sqlalchemy import select
from datetime import datetime, timedelta
import asyncio
import structlog

logger = structlog.get_logger()

async def sweep_pending_transactions_async():
    """
    Sweeper de reconciliación asíncrona.
    Busca transacciones que se crearon hace más de 5 minutos y siguen pending
    (lo que indica que el webhook de Mercado Pago nunca llegó o falló).
    """
    from app.services.payment_service import payment_service
    from app.services.sse_manager import sse_manager
    
    async with async_session_maker() as session:
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        # Buscar transacciones 'pending' de hace más de 5 mins, pero no más viejas de 2 horas (para evitar polling eterno)
        max_age = datetime.utcnow() - timedelta(hours=2)
        
        stmt = select(FinancialTransaction).where(
            FinancialTransaction.status == "pending",
            FinancialTransaction.created_at < cutoff_time,
            FinancialTransaction.created_at > max_age
        )
        
        result = await session.execute(stmt)
        pending_txs = result.scalars().all()
        
        for txn in pending_txs:
            try:
                # Polling a MP API
                payment_info = payment_service.get_payment_info(txn.provider_payment_id) if txn.provider_payment_id else None
                
                # Si no tenemos provider_payment_id, en MP el external_reference permite buscar, 
                # pero el SDK no lo soporta de forma directa por ID. Asumimos que podemos obtenerlo
                # por otro medio en el SDK (ej. search). En la práctica, el webhook provee el ID. 
                # Como simplificación, si MP no está, no hacemos nada y el usuario puede reclamar.
                # Nota: Una implementación de producción haría payment_service.sdk.payment().search({"external_reference": txn.id})
                
                if not payment_info and txn.id:
                    search_res = payment_service.sdk.payment().search({"external_reference": str(txn.id)})
                    if search_res["status"] == 200 and search_res["response"]["results"]:
                        payment_info = search_res["response"]["results"][0]

                if payment_info and payment_info.get("status") == "approved":
                    logger.info("sweeper_recovered_payment", tx_id=str(txn.id))
                    
                    txn.status = "approved"
                    txn.checkout_status = "swept"
                    txn.checkout_confirmed_at = datetime.utcnow()
                    
                    if txn.client_id:
                        stmt_c = select(Client).where(Client.id == txn.client_id)
                        client = (await session.execute(stmt_c)).scalar_one_or_none()
                        if client:
                            client.payment_status = PaymentStatus.ACTIVE
                            client.access_expires_at = datetime.utcnow() + timedelta(days=30)
                            
                            # Broadcast success delayed
                            await sse_manager.broadcast_to_tenant(
                                tenant_id=client.tenant_id,
                                message_type="payment_confirmed",
                                payload={"transaction_id": str(txn.id), "recovered": True}
                            )
            except Exception as e:
                logger.error("sweeper_error_on_tx", tx_id=str(txn.id), error=str(e))
                
        await session.commit()


@shared_task(name="sweep_pending_transactions")
def sweep_pending_transactions():
    """
    Celery entrypoint for the sweeper.
    Runs every 5 minutes via Celery Beat.
    """
    asyncio.run(sweep_pending_transactions_async())

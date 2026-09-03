import asyncio
import logging
from sqlalchemy import select
from app.db.connection import async_session_maker
from app.db.models import Client
from app.workers.cri_worker import process_cri_recalculation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def rebuild_all():
    """
    Script de resiliencia (Principio de Vogels).
    Reconstruye el estado de CRI en PostgreSQL (Snapshots) y Redis DB 1
    para todos los atletas activos leyendo el Event Sourcing.
    """
    logger.info("Iniciando reconstrucción del caché CRI...")
    
    async with async_session_maker() as db:
        # Get all active clients
        stmt = select(Client.id).where(Client.is_active == True)
        res = await db.execute(stmt)
        client_ids = res.scalars().all()
        
    logger.info(f"Encontrados {len(client_ids)} atletas activos para procesar.")
    
    success_count = 0
    for cid in client_ids:
        try:
            await process_cri_recalculation(str(cid))
            success_count += 1
            if success_count % 100 == 0:
                logger.info(f"Procesados {success_count}/{len(client_ids)} atletas...")
        except Exception as e:
            logger.error(f"Error procesando atleta {cid}: {e}")
            
    logger.info(f"Reconstrucción completada. {success_count} perfiles hidratados exitosamente.")

if __name__ == "__main__":
    asyncio.run(rebuild_all())

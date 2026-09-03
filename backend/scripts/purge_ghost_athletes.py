import asyncio
import argparse
import sys
from loguru import logger
from sqlalchemy import select, delete
from app.db.connection import get_db_session_factory
from app.db.models import Client, ActiveWorkoutPlan, ClientExtraFlags

async def purge_ghost_athletes(tenant_id: str = None, batch_size: int = 500, sleep_ms: int = 100):
    """
    Purga Ghost Athletes de la base de datos de manera contenida.
    Implementa Throttled Batching para evitar lock contention.
    """
    logger.info(f"Iniciando purga de Ghost Athletes (Batch: {batch_size}, Sleep: {sleep_ms}ms)")
    
    SessionLocal = get_db_session_factory()
    
    async with SessionLocal() as db:
        total_deleted = 0
        while True:
            # Seleccionar Ghost Athletes
            stmt = select(Client.id).where(
                Client.extra_data.contains({ClientExtraFlags.IS_GHOST_PERSONA.value: True})
            ).limit(batch_size)
            
            if tenant_id:
                stmt = stmt.where(Client.tenant_id == tenant_id)
                
            result = await db.execute(stmt)
            ghost_ids = result.scalars().all()
            
            if not ghost_ids:
                logger.info(f"Purga finalizada. Total eliminados: {total_deleted}")
                break
                
            logger.info(f"Purgando batch de {len(ghost_ids)} Ghost Athletes...")
            
            # Borrar ActiveWorkoutPlans asociados
            # (Si ondelete="CASCADE" está configurado no sería estrictamente necesario, pero es más seguro explícito)
            await db.execute(
                delete(ActiveWorkoutPlan).where(ActiveWorkoutPlan.client_id.in_(ghost_ids))
            )
            
            # Borrar Clients
            await db.execute(
                delete(Client).where(Client.id.in_(ghost_ids))
            )
            
            await db.commit()
            total_deleted += len(ghost_ids)
            
            logger.info(f"Esperando {sleep_ms}ms para liberar locks...")
            await asyncio.sleep(sleep_ms / 1000.0)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Purge Ghost Athletes Sandbox Data")
    parser.add_argument("--tenant-id", type=str, help="Specific Tenant ID to purge", default=None)
    parser.add_argument("--batch-size", type=int, help="Batch size for deletion", default=500)
    parser.add_argument("--sleep-ms", type=int, help="Sleep between batches (ms)", default=100)
    
    args = parser.parse_args()
    
    asyncio.run(purge_ghost_athletes(
        tenant_id=args.tenant_id,
        batch_size=args.batch_size,
        sleep_ms=args.sleep_ms
    ))

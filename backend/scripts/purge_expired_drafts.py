import asyncio
import sys
import os

# Ensure the app can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.database import async_sessionmaker, engine
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("PurgeDrafts")

async def purge_expired_drafts(batch_size: int = 500, throttle_seconds: float = 1.0):
    """
    Deletes expired plan drafts using Throttled Batching to avoid Table Locking.
    This prevents OOM in Redis/DB by continuously cleaning up the JSONB drafts.
    """
    logger.info("Starting Garbage Collection for expired Plan Drafts...")
    
    total_deleted = 0
    
    async with async_sessionmaker(engine)() as session:
        while True:
            # We use a CTE or IN clause with LIMIT to delete in small batches
            # The statement deletes up to `batch_size` rows that are expired
            stmt = text(f"""
                DELETE FROM plan_drafts 
                WHERE id IN (
                    SELECT id FROM plan_drafts 
                    WHERE expires_at < NOW() 
                    LIMIT :batch_size
                )
            """)
            
            result = await session.execute(stmt, {"batch_size": batch_size})
            deleted_count = result.rowcount
            await session.commit()
            
            if deleted_count == 0:
                logger.info(f"Finished garbage collection. Total deleted: {total_deleted}")
                break
                
            total_deleted += deleted_count
            logger.info(f"Deleted batch of {deleted_count} rows. Total so far: {total_deleted}. Throttling for {throttle_seconds}s...")
            
            # Throttle to allow concurrent queries to execute (prevent lock starvation)
            await asyncio.sleep(throttle_seconds)

if __name__ == "__main__":
    asyncio.run(purge_expired_drafts())

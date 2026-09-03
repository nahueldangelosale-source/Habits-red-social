import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import text
from app.config import get_settings
from app.domain.gaming.models import ScoreCardVault

async def test_upsert():
    try:
        settings = get_settings()
        engine = create_async_engine(settings.database_url)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        tenant_id = uuid.UUID('0ebc9bdf-db33-41bb-96bf-5dcf56ea98ed')
        user_id = uuid.UUID('4d76be7f-8b2b-4cb4-ad24-97296da99654')
        event_id = uuid.uuid4()
        
        async with async_session() as db:
            stmt = insert(ScoreCardVault).values(
                user_id=user_id,
                tenant_id=tenant_id,
                total_xp=50,
                current_level=1,
                last_event_id=event_id,
                last_client_timestamp=datetime.utcnow()
            )
            
            upsert_stmt = stmt.on_conflict_do_update(
                index_elements=['user_id', 'tenant_id'],
                set_={
                    'total_xp': ScoreCardVault.total_xp + 50,
                    'last_event_id': event_id,
                    'last_client_timestamp': datetime.utcnow(),
                    'last_updated_at': datetime.utcnow()
                }
            )
            
            await db.execute(upsert_stmt)
            await db.commit()
            
            result = await db.execute(text("SELECT total_xp FROM scorecard_vault WHERE user_id = :u"), {"u": user_id})
            print('XP:', result.scalar())
            
    except Exception as e:
        print('Error:', e)

if __name__ == "__main__":
    asyncio.run(test_upsert())

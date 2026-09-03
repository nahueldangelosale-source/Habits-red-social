import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import get_settings

async def check_table():
    try:
        settings = get_settings()
        engine = create_async_engine(settings.database_url)
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scorecard_vault');"))
            exists = result.scalar()
            print("ScoreCardVault table exists:", exists)
            
            if not exists:
                print("Table does not exist, creating it now via Base.metadata.create_all...")
                from app.db.database import engine as db_engine, Base
                from app.domain.gaming.models import ScoreCardVault
                # Run create_all for just this model's table or all
                await conn.run_sync(Base.metadata.create_all)
                print("Tables created.")
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(check_table())

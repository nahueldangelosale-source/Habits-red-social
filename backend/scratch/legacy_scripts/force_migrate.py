import asyncio
from sqlalchemy import text
from app.db.database import engine

async def migrate():
    try:
        async with engine.connect() as conn:
            print("Trying to alter column sync_status...")
            await conn.execute(text("ALTER TABLE clients ALTER COLUMN sync_status TYPE VARCHAR(50) USING sync_status::text;"))
            await conn.commit()
            print("Successfully altered clients.sync_status to VARCHAR(50)")
            
            result = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'sync_status'"))
            row = result.fetchone()
            print(f"Verified type: {row}")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())

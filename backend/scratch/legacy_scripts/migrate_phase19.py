import asyncio
from sqlalchemy import text
from app.db.database import engine

async def migrate():
    try:
        async with engine.connect() as conn:
            print("Altering exercises table for Phase 19...")
            await conn.execute(text("""
                ALTER TABLE exercises 
                ADD COLUMN IF NOT EXISTS is_global BOOLEAN NOT NULL DEFAULT TRUE,
                ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
                ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
            """))
            await conn.commit()
            print("Successfully altered exercises table.")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())

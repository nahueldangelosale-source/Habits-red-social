
import asyncio
from sqlalchemy import text
from app.db.database import engine

async def migrate_athlete_drafts_v2():
    commands = [
        "ALTER TABLE athlete_drafts ALTER COLUMN training_experience TYPE VARCHAR(50) USING training_experience::text",
        "ALTER TABLE athlete_drafts ALTER COLUMN habit_work_type TYPE VARCHAR(50) USING habit_work_type::text",
        "ALTER TABLE athlete_drafts ALTER COLUMN risk_score TYPE VARCHAR(20) USING risk_score::text",
        "ALTER TABLE athlete_drafts ALTER COLUMN status TYPE VARCHAR(50) USING status::text",
    ]
    
    print("🚀 REINTENTO DE MIGRACIÓN (V2) - Athlete Drafts...")
    
    async with engine.connect() as conn:
        for cmd in commands:
            try:
                print(f"Ejecutando: {cmd}")
                await conn.execute(text(cmd))
                await conn.commit()
                print("✅ COMMIT")
            except Exception as e:
                print(f"⚠️ Aviso: {str(e)}")
                # In case of error in asyncpg, we might need to rollback to reset the connection state
                await conn.rollback()
                
    print("\n✅ Proceso completado.")

if __name__ == "__main__":
    asyncio.run(migrate_athlete_drafts_v2())

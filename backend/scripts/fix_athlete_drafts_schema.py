
import asyncio
from sqlalchemy import text
from app.db.database import engine

async def fix_athlete_drafts_schema():
    """
    Agrega las columnas faltantes a la tabla athlete_drafts para cumplir con la Taxonomía Universal.
    Si ya existen, el try/except manejará la situación.
    """
    commands = [
        # Nuevas columnas de Taxonomía Universal (Phase 25)
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS training_experience VARCHAR(50) DEFAULT 'BEGINNER'",
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS training_days_available INTEGER DEFAULT 3",
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS training_duration_pref INTEGER DEFAULT 60",
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS medical_tags JSONB DEFAULT '[]'",
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS goal_tags JSONB DEFAULT '[]'",
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS habit_sleep_quality INTEGER DEFAULT 3",
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS habit_stress_level INTEGER DEFAULT 3",
        "ALTER TABLE athlete_drafts ADD COLUMN IF NOT EXISTS habit_work_type VARCHAR(50) DEFAULT 'SEDENTARY'",
        
        # Asegurar tipos VARCHAR para columnas existentes que podrían ser Enums
        "ALTER TABLE athlete_drafts ALTER COLUMN risk_score TYPE VARCHAR(20) USING risk_score::text",
        "ALTER TABLE athlete_drafts ALTER COLUMN status TYPE VARCHAR(50) USING status::text",
    ]
    
    print("🚀 REPARANDO ESQUEMA athlete_drafts...")
    
    async with engine.connect() as conn:
        for cmd in commands:
            try:
                print(f"Ejecutando: {cmd}")
                await conn.execute(text(cmd))
                await conn.commit()
                print("✅ OK")
            except Exception as e:
                print(f"⚠️ Aviso: {str(e)}")
                await conn.rollback()
                
    print("\n✅ Esquema de athlete_drafts actualizado y curado.")

if __name__ == "__main__":
    asyncio.run(fix_athlete_drafts_schema())

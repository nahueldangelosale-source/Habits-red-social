"""
Chapter 4: Migración de tablas Psicología del Comportamiento
- consistency_trackers
- micro_milestones  
- habit_anchor column en athlete_drafts
"""
import asyncio
import os
import sys

sys.path.insert(0, ".")

from sqlalchemy import text
from app.db.connection import engine


async def migrate():
    async with engine.begin() as conn:
        # 1. ConsistencyTracker table
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'consistency_trackers')"
        ))
        if not result.scalar():
            await conn.execute(text("""
                CREATE TABLE consistency_trackers (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    weekly_consistency_score INTEGER DEFAULT 0,
                    current_tier VARCHAR(50) DEFAULT 'BRONZE',
                    last_activity_logical_date DATE,
                    grace_days_remaining INTEGER DEFAULT 2,
                    consecutive_active_weeks INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT uq_consistency_tracker_client UNIQUE (client_id)
                )
            """))
            await conn.execute(text(
                "CREATE INDEX ix_consistency_tracker_client ON consistency_trackers(client_id)"
            ))
            print("OK Tabla 'consistency_trackers' creada exitosamente.")
        else:
            print("SKIP Tabla 'consistency_trackers' ya existe.")

        # 2. MicroMilestone table
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'micro_milestones')"
        ))
        if not result.scalar():
            await conn.execute(text("""
                CREATE TABLE micro_milestones (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    target_logical_date DATE NOT NULL,
                    milestone_name VARCHAR(255) NOT NULL,
                    is_achieved BOOLEAN DEFAULT FALSE,
                    achieved_at TIMESTAMPTZ,
                    xp_reward INTEGER DEFAULT 50,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )
            """))
            await conn.execute(text(
                "CREATE INDEX ix_micro_milestones_client_date ON micro_milestones(client_id, target_logical_date)"
            ))
            print("OK Tabla 'micro_milestones' creada exitosamente.")
        else:
            print("SKIP Tabla 'micro_milestones' ya existe.")

        # 3. habit_anchor column on athlete_drafts
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'athlete_drafts' AND column_name = 'habit_anchor')"
        ))
        if not result.scalar():
            await conn.execute(text(
                "ALTER TABLE athlete_drafts ADD COLUMN habit_anchor VARCHAR(255)"
            ))
            print("OK Columna 'habit_anchor' anadida a 'athlete_drafts'.")
        else:
            print("SKIP Columna 'habit_anchor' ya existe en 'athlete_drafts'.")

    await engine.dispose()
    print("\nMigracion Capitulo 4 (Modulo Mind) completada.")


if __name__ == "__main__":
    asyncio.run(migrate())

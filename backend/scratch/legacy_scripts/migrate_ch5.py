"""
Chapter 5: Migración de tablas Gamificación y Retención Interactiva (Módulo Gaming & Social)
- squads
- squad_members
- squad_activities
- squad_notifications
"""
import asyncio
import os
import sys

sys.path.insert(0, ".")

from sqlalchemy import text
from app.db.connection import engine


async def migrate():
    print("[INFO] Iniciando migracion del Capitulo 5...")
    async with engine.begin() as conn:
        # 1. squads table
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'squads')"
        ))
        if not result.scalar():
            await conn.execute(text("""
                CREATE TABLE squads (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    goal_type VARCHAR(50) NOT NULL,
                    goal_target VARCHAR(255),
                    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                    starts_at TIMESTAMPTZ,
                    ends_at TIMESTAMPTZ,
                    is_active BOOLEAN DEFAULT TRUE NOT NULL,
                    challenge_title VARCHAR(255),
                    challenge_ends_at TIMESTAMPTZ
                )
            """))
            print("OK Tabla 'squads' creada exitosamente.")
        else:
            print("SKIP Tabla 'squads' ya existe.")

        # 2. squad_members table
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'squad_members')"
        ))
        if not result.scalar():
            await conn.execute(text("""
                CREATE TABLE squad_members (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    avatar_url VARCHAR(500),
                    is_leader BOOLEAN DEFAULT FALSE NOT NULL,
                    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                    current_streak INTEGER DEFAULT 0 NOT NULL,
                    total_activities INTEGER DEFAULT 0 NOT NULL,
                    last_activity_at TIMESTAMPTZ,
                    streak_shields INTEGER DEFAULT 0 NOT NULL,
                    CONSTRAINT uq_squad_client UNIQUE (squad_id, client_id)
                )
            """))
            print("OK Tabla 'squad_members' creada exitosamente.")
        else:
            print("SKIP Tabla 'squad_members' ya existe.")

        # 3. squad_activities table
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'squad_activities')"
        ))
        if not result.scalar():
            await conn.execute(text("""
                CREATE TABLE squad_activities (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
                    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    activity_type VARCHAR(50) NOT NULL,
                    description VARCHAR(500) NOT NULL,
                    metadata_json JSONB DEFAULT '{}'::jsonb NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
                )
            """))
            print("OK Tabla 'squad_activities' creada exitosamente.")
        else:
            print("SKIP Tabla 'squad_activities' ya existe.")

        # 4. squad_notifications table
        result = await conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'squad_notifications')"
        ))
        if not result.scalar():
            await conn.execute(text("""
                CREATE TABLE squad_notifications (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
                    sender_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                    sender_name VARCHAR(100) NOT NULL,
                    activity_type VARCHAR(50) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
                )
            """))
            print("OK Tabla 'squad_notifications' creada exitosamente.")
        else:
            print("SKIP Tabla 'squad_notifications' ya existe.")

    await engine.dispose()
    print("[SUCCESS] Migracion Capitulo 5 (Gaming & Social) completada.")


if __name__ == "__main__":
    asyncio.run(migrate())

import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres.auwayrniyaoiabkpdkav:Eloso2026*-@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

async def main():
    print("Conectando a Supabase para aplicar migraciones de desafíos y gamificación...")
    conn = await asyncpg.connect(DATABASE_URL, timeout=30)
    
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS athlete_challenges (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            squad_id UUID REFERENCES squads(id) ON DELETE SET NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'STREAK',
            target_value INTEGER NOT NULL DEFAULT 7,
            current_value INTEGER NOT NULL DEFAULT 0,
            state VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            duration_days INTEGER NOT NULL DEFAULT 7,
            deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
        );

        CREATE INDEX IF NOT EXISTS idx_athlete_challenges_client_state ON athlete_challenges(client_id, state);
        CREATE INDEX IF NOT EXISTS idx_athlete_challenges_tenant ON athlete_challenges(tenant_id);

        CREATE TABLE IF NOT EXISTS challenge_progress_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            challenge_id UUID NOT NULL REFERENCES athlete_challenges(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            value INTEGER NOT NULL DEFAULT 1,
            source VARCHAR(50) NOT NULL DEFAULT 'HABIT_CHECKIN',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge ON challenge_progress_events(challenge_id);
        CREATE INDEX IF NOT EXISTS idx_challenge_progress_client ON challenge_progress_events(client_id);

        ALTER TABLE athlete_challenges ENABLE ROW LEVEL SECURITY;
        ALTER TABLE challenge_progress_events ENABLE ROW LEVEL SECURITY;
    """)
    
    print("[EXITO] Tablas athlete_challenges y challenge_progress_events creadas y protegidas con RLS en Supabase.")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())

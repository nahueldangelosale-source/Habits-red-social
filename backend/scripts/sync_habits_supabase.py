import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres.auwayrniyaoiabkpdkav:Eloso2026*-@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

async def main():
    conn = await asyncpg.connect(DATABASE_URL, timeout=30)
    
    # Check if habits table exists, if not create it
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            template_id VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(10) NOT NULL DEFAULT 'BUILD',
            category VARCHAR(30) NOT NULL DEFAULT 'CUSTOM',
            input_type VARCHAR(10) NOT NULL DEFAULT 'BOOLEAN',
            unit VARCHAR(30),
            target_value NUMERIC(10, 2),
            duration VARCHAR(30) DEFAULT 'INDEFINITE',
            scheduled_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
            tags TEXT[] DEFAULT '{}',
            is_custom BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            streak_current INTEGER DEFAULT 0,
            streak_best INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            start_date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS habit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
            log_date DATE NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            value NUMERIC(10, 2),
            zone VARCHAR(10) DEFAULT 'NONE',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
        ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
    """)
    
    print("Tablas habits y habit_logs verificadas y protegidas con RLS en Supabase.")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())

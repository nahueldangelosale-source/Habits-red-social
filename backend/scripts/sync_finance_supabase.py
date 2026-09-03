import asyncio
import asyncpg

DATABASE_URL = "postgresql://postgres.auwayrniyaoiabkpdkav:Eloso2026*-@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

async def main():
    print("Conectando a Supabase para aplicar migraciones de finanzas del coach...")
    conn = await asyncpg.connect(DATABASE_URL, timeout=30)
    
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS commercial_plans (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL DEFAULT 'RECURRING',
            tier VARCHAR(50) NOT NULL DEFAULT 'PRO',
            price NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
            currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
            frequency VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
            duration_text VARCHAR(100) NOT NULL DEFAULT 'Mensual recurrente',
            description TEXT NOT NULL DEFAULT '',
            badge VARCHAR(100),
            features TEXT[] DEFAULT '{}',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_commercial_plans_tenant ON commercial_plans(tenant_id, is_active);

        CREATE TABLE IF NOT EXISTS client_memberships (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            plan_id UUID REFERENCES commercial_plans(id) ON DELETE SET NULL,
            plan_name VARCHAR(255) NOT NULL,
            tier VARCHAR(50) NOT NULL DEFAULT 'PRO',
            monthly_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
            status VARCHAR(30) NOT NULL DEFAULT 'PAID',
            last_payment_date DATE,
            days_overdue INTEGER DEFAULT 0,
            enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_client_memberships_tenant_status ON client_memberships(tenant_id, status);
        CREATE INDEX IF NOT EXISTS idx_client_memberships_client ON client_memberships(client_id);

        CREATE TABLE IF NOT EXISTS client_payment_records (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            membership_id UUID REFERENCES client_memberships(id) ON DELETE SET NULL,
            amount NUMERIC(12, 2) NOT NULL,
            currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
            payment_method VARCHAR(50) NOT NULL DEFAULT 'TRANSFER',
            payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_client_payments_tenant_date ON client_payment_records(tenant_id, payment_date);
        CREATE INDEX IF NOT EXISTS idx_client_payments_client ON client_payment_records(client_id);

        ALTER TABLE commercial_plans ENABLE ROW LEVEL SECURITY;
        ALTER TABLE client_memberships ENABLE ROW LEVEL SECURITY;
        ALTER TABLE client_payment_records ENABLE ROW LEVEL SECURITY;
    """)
    
    print("[EXITO] Tablas commercial_plans, client_memberships y client_payment_records creadas y aseguradas con RLS en Supabase.")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())

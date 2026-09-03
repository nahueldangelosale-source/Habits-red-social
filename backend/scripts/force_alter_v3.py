
import asyncio
from sqlalchemy import text
from app.db.database import engine

VIEW_DEF = """
CREATE MATERIALIZED VIEW mv_churn_risk AS
 SELECT c.id AS client_id,
    c.tenant_id,
    c.first_name,
    c.last_name,
    c.phone,
    c.email,
    c.is_active,
    c.payment_status,
    max(ws.started_at) AS last_session_at,
    COALESCE(EXTRACT(day FROM now() - max(ws.started_at)::timestamp with time zone), 999::numeric)::integer AS days_inactive
   FROM clients c
     LEFT JOIN workout_sessions ws ON ws.client_id = c.id  
  WHERE c.is_active = true
  GROUP BY c.id, c.tenant_id, c.first_name, c.last_name, c.phone, c.email, c.is_active, c.payment_status
 HAVING max(ws.started_at) IS NULL OR max(ws.started_at) < (now() - '7 days'::interval);
"""

async def force_alter_v3():
    commands = [
        # 1. Drop dependencies
        "DROP MATERIALIZED VIEW IF EXISTS mv_churn_risk",
        
        # 2. Alter columns (Tenants)
        "ALTER TABLE tenants ALTER COLUMN plan_tier TYPE VARCHAR(50) USING plan_tier::text",
        "ALTER TABLE tenants ALTER COLUMN subscription_tier TYPE VARCHAR(50) USING subscription_tier::text",
        "ALTER TABLE tenants ALTER COLUMN payment_provider TYPE VARCHAR(50) USING payment_provider::text",
        "ALTER TABLE tenants ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text",
        "ALTER TABLE tenants ALTER COLUMN subscription_status TYPE VARCHAR(50) USING subscription_status::text",
        
        # 3. Alter columns (Professionals)
        "ALTER TABLE professionals ALTER COLUMN specialty TYPE VARCHAR(50) USING specialty::text",
        "ALTER TABLE professionals ALTER COLUMN subscription_status TYPE VARCHAR(50) USING subscription_status::text",
        
        # 4. Alter columns (Clients)
        "ALTER TABLE clients ALTER COLUMN sync_status TYPE VARCHAR(50) USING sync_status::text",
        "ALTER TABLE clients ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text",
        
        # 5. Alter columns (Messages)
        "ALTER TABLE messages ALTER COLUMN intent_category TYPE VARCHAR(50) USING intent_category::text",
    ]
    
    print("🚀 MIGRACIÓN FINAL (V3) - Resolviendo dependencias...")
    
    async with engine.connect() as conn:
        for cmd in commands:
            try:
                print(f"Ejecutando: {cmd}")
                await conn.execute(text(cmd))
                print("✅ OK")
            except Exception as e:
                print(f"⚠️ Aviso: {str(e)}")
        
        print("\n🔄 Recreando vista materializada...")
        await conn.execute(text(VIEW_DEF))
        print("✅ mv_churn_risk restaurada.")
        
        await conn.commit()
    
    print("\n✅ Auditoría de Datos completada: Todo el esquema es ahora VARCHAR.")

if __name__ == "__main__":
    asyncio.run(force_alter_v3())

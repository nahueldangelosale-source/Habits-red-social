
import asyncio
from sqlalchemy import text
from app.db.database import engine

async def force_alter_enums_v2():
    commands = [
        "ALTER TABLE tenants ALTER COLUMN plan_tier TYPE VARCHAR(50) USING plan_tier::text",
        "ALTER TABLE tenants ALTER COLUMN subscription_tier TYPE VARCHAR(50) USING subscription_tier::text",
        "ALTER TABLE tenants ALTER COLUMN payment_provider TYPE VARCHAR(50) USING payment_provider::text",
        "ALTER TABLE tenants ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text",
        "ALTER TABLE tenants ALTER COLUMN subscription_status TYPE VARCHAR(50) USING subscription_status::text",
        "ALTER TABLE professionals ALTER COLUMN specialty TYPE VARCHAR(50) USING specialty::text",
        "ALTER TABLE professionals ALTER COLUMN subscription_status TYPE VARCHAR(50) USING subscription_status::text",
        "ALTER TABLE clients ALTER COLUMN sync_status TYPE VARCHAR(50) USING sync_status::text",
        "ALTER TABLE clients ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text",
        "ALTER TABLE messages ALTER COLUMN intent_category TYPE VARCHAR(50) USING intent_category::text",
    ]
    
    print("🚀 REINTENTO DE MIGRACIÓN AGRESIVA (V2)...")
    
    async with engine.connect() as conn:
        for cmd in commands:
            print(f"Ejecutando: {cmd}")
            await conn.execute(text(cmd))
            await conn.commit()
            print("✅ COMMIT")
            
    print("\n✅ Proceso completado.")

if __name__ == "__main__":
    asyncio.run(force_alter_enums_v2())

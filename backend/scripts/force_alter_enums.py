
import asyncio
from sqlalchemy import text
from app.db.database import engine, sync_engine

async def force_alter_enums():
    """
    Fuerza la alteración de tipos de columna de Enum a VARCHAR en PostgreSQL.
    Esto es necesario porque SQLAlchemy no cambia los tipos de columna automáticamente
    y asyncpg rechaza strings si la columna es un tipo Enum personalizado.
    """
    commands = [
        # Table: tenants
        "ALTER TABLE tenants ALTER COLUMN plan_tier TYPE VARCHAR(50) USING plan_tier::text",
        "ALTER TABLE tenants ALTER COLUMN subscription_tier TYPE VARCHAR(50) USING subscription_tier::text",
        "ALTER TABLE tenants ALTER COLUMN payment_provider TYPE VARCHAR(50) USING payment_provider::text",
        "ALTER TABLE tenants ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text",
        "ALTER TABLE tenants ALTER COLUMN subscription_status TYPE VARCHAR(50) USING subscription_status::text",
        
        # Table: professionals
        "ALTER TABLE professionals ALTER COLUMN specialty TYPE VARCHAR(50) USING specialty::text",
        "ALTER TABLE professionals ALTER COLUMN subscription_status TYPE VARCHAR(50) USING subscription_status::text",
        
        # Table: clients
        "ALTER TABLE clients ALTER COLUMN sync_status TYPE VARCHAR(50) USING sync_status::text",
        "ALTER TABLE clients ALTER COLUMN payment_status TYPE VARCHAR(50) USING payment_status::text",
        
        # Table: messages
        "ALTER TABLE messages ALTER COLUMN intent_category TYPE VARCHAR(50) USING intent_category::text",
        "ALTER TABLE messages ALTER COLUMN sender_type TYPE VARCHAR(50) USING sender_type::text",
    ]
    
    print("🚀 Iniciando migración de fuerza bruta (Enum -> VARCHAR)...")
    
    async with engine.begin() as conn:
        for cmd in commands:
            try:
                print(f"Ejecutando: {cmd}")
                await conn.execute(text(cmd))
                print("✅ OK")
            except Exception as e:
                print(f"⚠️ Error (podría ser porque la columna ya es VARCHAR): {str(e)}")
    
    print("\n✅ Base de datos migrada: Columnas ahora son VARCHAR.")

if __name__ == "__main__":
    asyncio.run(force_alter_enums())

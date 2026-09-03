
import asyncio
from sqlalchemy import text
from app.db.connection import engine

async def fix_enums():
    async with engine.connect() as conn:
        print("\n--- Fixing Enums in DB ---")
        
        # 1. Drop existing ones (requires dropping columns first or using a robust migration)
        # Instead of dropping, let's try to ALTER them to match our needs if possible, 
        # but ADD VALUE can't be done in a transaction easily.
        
        # Strategy: Let's see if we can just cast everything to uppercase in the DB first.
        # But for Enum types, we need to check if they are ALREADY uppercase.
        
        # Given the error "invalid input value", let's try to recreate them with a safe script.
        # We need to temporarily drop the columns that use them.
        
        cmds = [
            # Dependency cleanup
            "ALTER TABLE tenants ALTER COLUMN plan_tier TYPE VARCHAR",
            "ALTER TABLE tenants ALTER COLUMN subscription_tier TYPE VARCHAR",
            "ALTER TABLE tenants ALTER COLUMN payment_provider TYPE VARCHAR",
            "ALTER TABLE processed_payment_events ALTER COLUMN provider TYPE VARCHAR",
            
            "DROP TYPE IF EXISTS plantier CASCADE",
            "DROP TYPE IF EXISTS subscriptiontier CASCADE",
            "DROP TYPE IF EXISTS paymentprovider CASCADE",
            
            "CREATE TYPE plantier AS ENUM ('FREE', 'STARTER', 'PRO', 'ELITE')",
            "CREATE TYPE subscriptiontier AS ENUM ('FREE', 'PRO')",
            "CREATE TYPE paymentprovider AS ENUM ('MERCADO_PAGO', 'STRIPE', 'NONE')",
            
            "ALTER TABLE tenants ALTER COLUMN plan_tier TYPE plantier USING plan_tier::plantier",
            "ALTER TABLE tenants ALTER COLUMN subscription_tier TYPE subscriptiontier USING subscription_tier::subscriptiontier",
            "ALTER TABLE tenants ALTER COLUMN payment_provider TYPE paymentprovider USING payment_provider::paymentprovider",
            "ALTER TABLE processed_payment_events ALTER COLUMN provider TYPE paymentprovider USING provider::paymentprovider"
        ]
        
        for cmd in cmds:
            print(f"Executing: {cmd}")
            try:
                await conn.execute(text(cmd))
                await conn.commit()
            except Exception as e:
                print(f"Error in {cmd}: {e}")
                await conn.rollback()

if __name__ == "__main__":
    asyncio.run(fix_enums())

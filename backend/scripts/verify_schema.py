
import asyncio
from sqlalchemy import text
from app.db.database import engine

async def verify_schema():
    query = """
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('clients', 'professionals', 'tenants', 'messages')
    AND column_name IN ('sync_status', 'payment_status', 'subscription_status', 'specialty', 'plan_tier', 'intent_category');
    """
    async with engine.connect() as conn:
        result = await conn.execute(text(query))
        rows = result.fetchall()
        print("\n🔎 Estado actual del esquema en PostgreSQL:")
        for row in rows:
            print(f"Table: {row[0]} | Column: {row[1]} | Type: {row[2]}")

if __name__ == "__main__":
    asyncio.run(verify_schema())

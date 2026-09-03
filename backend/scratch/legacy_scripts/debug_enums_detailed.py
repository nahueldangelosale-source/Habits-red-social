
import asyncio
from sqlalchemy import text
from app.db.connection import engine

async def check_enums_detailed():
    async with engine.connect() as conn:
        print("\n--- Detailed Enum Inspection ---")
        query = text("""
            SELECT n.nspname as schema, t.typname as type, e.enumlabel as label
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE t.typname IN ('subscriptiontier', 'paymentprovider', 'plantier')
            ORDER BY n.nspname, t.typname, e.enumsortorder;
        """)
        result = await conn.execute(query)
        for row in result:
            print(f"Schema: {row[0]} | Type: {row[1]} | Label: '{row[2]}'")

if __name__ == "__main__":
    asyncio.run(check_enums_detailed())

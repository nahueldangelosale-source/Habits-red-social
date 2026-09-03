import asyncio
import uuid
from sqlalchemy import text
from app.db.database import engine

async def check():
    async with engine.connect() as conn:
        # Check clients table schema
        result = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'sync_status'"))
        row = result.fetchone()
        print(f"DEBUG: clients.sync_status type is {row}")

        # Check for any other issues
        try:
            result = await conn.execute(text("SELECT id, sync_status FROM clients LIMIT 1"))
            rows = result.fetchall()
            print(f"DEBUG: Found {len(rows)} clients")
            if rows:
                print(f"DEBUG: First client sync_status: {rows[0][1]} (type: {type(rows[0][1])})")
        except Exception as e:
            print(f"DEBUG: Error reading clients: {e}")

if __name__ == "__main__":
    asyncio.run(check())

import asyncio
import os
from sqlalchemy import text
from app.db.database import engine

async def test_connection():
    try:
        print(f"Testing connection to: {os.getenv('DATABASE_URL')}")
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"✅ Connection successful! Result: {result.scalar()}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())

import asyncio
from sqlalchemy import text
from app.db.database import init_db, engine

async def main():
    print("Enabling vector extension...")
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    
    print("Starting init_db...")
    await init_db()
    print("init_db completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())

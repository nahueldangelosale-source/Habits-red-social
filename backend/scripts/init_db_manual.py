import asyncio
from app.db.connection import engine, Base
from app.db.rbac import User  # Import to register model
from app.db.models import *   # Import all other models

async def init():
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init())

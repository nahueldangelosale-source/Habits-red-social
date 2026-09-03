import asyncio
from sqlalchemy import text
from app.db.database import engine, Base
from app.db.models import Exercise

async def refresh_schema():
    print("🧹 Borrando tabla 'exercises' antigua...")
    async with engine.begin() as conn:
        # We use raw SQL to ensure the table is dropped even if ORM mapping changed
        await conn.execute(text("DROP TABLE IF EXISTS exercises CASCADE"))
        print("✅ Tabla borrada.")
        
        print("🔨 Recreando tabla 'exercises' con el nuevo esquema...")
        # Since Base.metadata.create_all is sync, we use run_sync
        await conn.run_sync(Base.metadata.create_all)
        print("✨ Tabla recreada exitosamente.")

if __name__ == "__main__":
    asyncio.run(refresh_schema())

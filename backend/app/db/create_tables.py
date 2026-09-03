import asyncio
from app.db.connection import engine, Base
from app.db.models import Exercise # noqa: F401

async def create_tables():
    print("🛠️  Creando tablas en la base de datos...")
    async with engine.begin() as conn:
        # Esto creará solo las tablas que no existan
        await conn.run_sync(Base.metadata.create_all)
    print("✨ Tablas creadas con éxito.")

if __name__ == "__main__":
    asyncio.run(create_tables())

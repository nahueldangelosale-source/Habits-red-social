
import asyncio
from sqlalchemy import text
from app.db.database import engine

async def get_view_def():
    # Obtener definición de vista materializada
    query = "SELECT pg_get_viewdef('mv_churn_risk', true);"
    async with engine.connect() as conn:
        try:
            result = await conn.execute(text(query))
            row = result.fetchone()
            if row:
                print("\n📄 Definición de mv_churn_risk:")
                print(row[0])
            else:
                print("❌ No se encontró el viewdef.")
        except Exception as e:
            print(f"❌ Error al obtener definition: {e}")

if __name__ == "__main__":
    asyncio.run(get_view_def())

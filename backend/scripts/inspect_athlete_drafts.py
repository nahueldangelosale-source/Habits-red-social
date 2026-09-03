
import asyncio
from sqlalchemy import text
from app.db.database import engine

async def inspect_athlete_drafts():
    query = """
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'athlete_drafts';
    """
    async with engine.connect() as conn:
        result = await conn.execute(text(query))
        rows = result.fetchall()
        print("\n🔎 Columnas en athlete_drafts:")
        for row in rows:
            print(f"Column: {row[0]} | Type: {row[1]}")

if __name__ == "__main__":
    asyncio.run(inspect_athlete_drafts())

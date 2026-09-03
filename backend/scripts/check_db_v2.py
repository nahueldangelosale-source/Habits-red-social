import asyncio
from app.db.database import async_session_maker
from app.db.models import Exercise
from sqlalchemy import select

async def check():
    async with async_session_maker() as s:
        stmt = select(Exercise).limit(5)
        result = await s.execute(stmt)
        exercises = result.scalars().all()
        print(f"Total exercises found in sample: {len(exercises)}")
        for e in exercises:
            print(f"- {e.exercise_id}: {e.official_name} | {e.equipment_required}")

if __name__ == "__main__":
    asyncio.run(check())

import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
sys.path.append(os.path.dirname(__file__))

from sqlalchemy import select
from app.db.connection import get_db
from app.db.models import Exercise

async def main():
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        stmt = select(Exercise)
        res = await db.execute(stmt)
        exercises = res.scalars().all()
        print(f"Total exercises in DB: {len(exercises)}")
        for e in exercises[:10]:
            print(f"ID: {e.id} | Name: {e.official_name} | Pattern: {e.movement_pattern} | Skill: {e.skill_level} | Axial: {e.axial_load} | Impact: {e.joint_impact}")
    finally:
        await db_gen.aclose()

if __name__ == "__main__":
    asyncio.run(main())

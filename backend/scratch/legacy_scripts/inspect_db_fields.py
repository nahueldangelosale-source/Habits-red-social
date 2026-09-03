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
        # Get unique equipment
        res = await db.execute(select(Exercise.equipment_required))
        eqs = set()
        for r in res.scalars().all():
            if isinstance(r, list):
                for item in r:
                    eqs.add(item)
            elif isinstance(r, str):
                eqs.add(r)
        
        # Get unique movement patterns
        res_pat = await db.execute(select(Exercise.movement_pattern))
        pats = set(res_pat.scalars().all())

        print("Unique Equipment in DB:")
        print(sorted(list(eqs)))
        print("\nUnique Movement Patterns in DB:")
        print(sorted(list(pats)))
    finally:
        await db_gen.aclose()

if __name__ == "__main__":
    asyncio.run(main())

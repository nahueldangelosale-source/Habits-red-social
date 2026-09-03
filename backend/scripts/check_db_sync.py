from app.db.database import sync_session_maker
from app.db.models import Exercise
from sqlalchemy import select

def check():
    with sync_session_maker() as s:
        stmt = select(Exercise).limit(5)
        exercises = s.scalars(stmt).all()
        print(f"Total exercises found in sample: {len(exercises)}")
        for e in exercises:
            print(f"- {e.exercise_id}: {e.official_name} | {e.equipment_required}")

if __name__ == "__main__":
    check()

import uuid
import sys
import os
import argparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, date
import json

# Agregar el directorio actual al PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.models import Base, User, Patient
from app.core.config import settings

def seed_database():
    print(f"Connecting to database at {settings.DATABASE_URL}...")
    engine = create_engine(settings.DATABASE_URL)
    
    # IMPORTANTE: En el entorno E2E real (GitHub Actions Service), la BD estará vacía y Alembic 
    # se habrá ejecutado. En desarrollo local, podríamos no querer dropear todo.
    # Base.metadata.drop_all(bind=engine)
    # Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    print("Cleaning existing seed data...")
    # Clean previous e2e data if exists based on some criteria
    # for safety we might just delete specific emails
    db.query(User).filter(User.email == "e2e_coach@bienestar.app").delete()
    db.query(User).filter(User.email == "e2e_athlete@bienestar.app").delete()
    db.commit()

    print("Seeding new E2E test data...")
    coach_id = uuid.uuid4()
    athlete_id = uuid.uuid4()
    patient_id = uuid.uuid4()

    # 1. Crear Coach (B2B)
    coach = User(
        id=coach_id,
        email="e2e_coach@bienestar.app",
        hashed_password="hashed_password_mock",
        is_active=True,
        is_coach=True
    )
    db.add(coach)

    # 2. Crear Atleta (B2C)
    athlete = User(
        id=athlete_id,
        email="e2e_athlete@bienestar.app",
        hashed_password="hashed_password_mock",
        is_active=True,
        is_coach=False
    )
    db.add(athlete)
    db.commit()

    # 3. Crear Patient Profile asociado al Atleta
    # Datos clínicos precargados necesarios para tests del OCR / DietQA
    extra_data = {
        "metabolic_profile": "Standard",
        "clinical_history": []
    }
    
    patient = Patient(
        id=patient_id,
        user_id=athlete_id,
        first_name="E2E",
        last_name="Athlete",
        date_of_birth=date(1990, 1, 1),
        gender="M",
        extra_data=extra_data
    )
    db.add(patient)
    db.commit()

    print(f"Successfully seeded database!")
    print(f"Coach ID: {coach_id}")
    print(f"Athlete ID: {athlete_id}")
    print(f"Patient ID: {patient_id}")

    db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed E2E data")
    args = parser.parse_args()
    seed_database()

import asyncio
import uuid
from datetime import datetime
from app.db.database import async_session_maker
from app.db.models import Client, FinancialTransaction, VideoReview, AthleteDraft, Tenant, Professional
from sqlalchemy import select

async def seed_demo_data():
    """
    Inyecta el 'Client 0' (Demo) para que el dashboard luzca 'vivo' desde el primer login.
    Demuestra la "Activación Wow" de todos los roles (Trainer, Nutri, Gym Owner).
    """
    async with async_session_maker() as db:
        print("Obteniendo Tenant y Profesional de prueba...")
        
        # 1. Recuperar dependencias para las FK
        tenant = await db.scalar(select(Tenant).limit(1))
        professional = await db.scalar(select(Professional).limit(1))
        
        if not tenant or not professional:
            print("❌ No se encontraron Tenants o Profesionales en la base de datos.")
            return

        tenant_id = tenant.id
        professional_id = professional.id

        demo_client_id = uuid.uuid4()
        
        # 2. Crear el Cliente Demo
        print(f"Sincronizando Client 0: {demo_client_id}")
        demo_client = Client(
            id=demo_client_id,
            tenant_id=tenant_id,
            professional_id=professional_id,
            first_name="Demo Client 0",
            last_name="(Seed)",
            email="demo@aurea.fitness",
            is_active=True,
            payment_status="ACTIVE",
            extra_data={
                "pain_areas": ["Lumbar"],
                "estimated_1rm": {"bench": 60, "squat": 90, "deadlift": 100},
                "streak": 0
            }
        )
        db.add(demo_client)
        await db.flush()
        
        # 3. Impacto Gym: Transacción Financiera (Bento Widget)
        print("Activando Dashboard Financiero (MRR)...")
        tx = FinancialTransaction(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            client_id=demo_client.id,
            amount_total=150.0,
            amount_pro=150.0,
            amount_platform=0.0,
            currency="USD",
            provider="seed",
            status="succeeded",
            created_at=datetime.utcnow()
        )
        db.add(tx)
        
        # 4. Impacto Entrenador: Validation Tinder (P1 = High Priority)
        print("Activando Validation Tinder (Video P1)...")
        review = VideoReview(
            id=uuid.uuid4(),
            client_id=demo_client.id,
            professional_id=professional_id,
            exercise_name="Sentadilla Libre",
            video_url="https://ejemplo.com/video.mp4",
            status="pending",
            ai_priority="P1",
            ai_triage_category="High Risk Biomechanics",
            ai_analysis_details={"issue": "Flexión Lumbar Grave - Riesgo en Sentadilla"},
            created_at=datetime.utcnow()
        )
        db.add(review)
        
        # 5. Impacto Nutricionista y Cascade Builder: Athlete Draft
        print("Activando In-box Clínico y Cascade Builder...")
        draft = AthleteDraft(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            client_id=demo_client.id,
            status="pending_review",
            onboarding_data={
                "tdee": 2450, 
                "tmb": 1750, 
                "stressLevel": 8
            },
            medical_tags=["LOWER_BACK_PAIN"],
            goal_tags=["HYPERTROPHY"],
            mutated_routine={},
            ai_reasoning={"justification": "Seed data injection"}
        )
        db.add(draft)
        
        await db.commit()
        print(f"✅ Dashboard encendido con éxito. Client ID: {demo_client.id}")

if __name__ == "__main__":
    asyncio.run(seed_demo_data())

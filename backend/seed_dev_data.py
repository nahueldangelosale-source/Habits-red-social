
import asyncio
import os
import sys
from datetime import datetime, timedelta
from uuid import uuid4

# Añadir directorio raíz al path para importar app
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.db.connection import engine, Base, async_session_maker
from app.config import get_settings

# Overwrite engine to avoid asyncpg statement cache issues after Enum DDL
settings = get_settings()
engine = create_async_engine(
    settings.database_url,
    connect_args={"prepared_statement_cache_size": 0}
)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
from app.db.models import (
    Tenant, 
    Professional, 
    Client, 
    WorkoutSession, 
    ExerciseLog, 
    VideoReview, 
    FinancialTransaction,
    PlanTier,
    PaymentStatus,
    SubscriptionTier,
    PaymentProvider
)
from app.db.rbac import User, UserRole, Role
from app.middleware.auth import get_password_hash

from sqlalchemy import text

async def seed_data():
    print("Iniciando Seeding de Datos Pro + Auth...")

    # DEBUG: Verificar modelos registrados
    print(f"Tablas registradas en Metadata: {Base.metadata.tables.keys()}")
    
    # Crear tablas
    async with engine.begin() as conn:
        # Habilitar extensión pgvector
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        # await conn.run_sync(Base.metadata.create_all)
    print("Tablas creadas/verificadas")

    async with engine.begin() as conn:
        print("Limpiando tablas existentes...")
        await conn.execute(text("TRUNCATE TABLE tenants, users CASCADE"))
        
        # 1. Crear Tenant (Pro) via Raw SQL
        tenant_id = uuid4()
        print(f"Creando Tenant: {tenant_id}")
        await conn.execute(text("""
            INSERT INTO tenants (
                id, name, slug, settings, primary_color, compute_units_balance, 
                subscription_price, currency, plan_tier, subscription_tier, 
                payment_provider, subscription_status, created_at, updated_at, 
                referral_reward_claimed
            ) 
            VALUES (
                :id, :name, :slug, '{}'::jsonb, '#CEFF00', 500000, 
                20.0, 'USD', 'PRO'::plantier, 'FREE'::subscriptiontier, 
                'NONE'::paymentprovider, 'active', NOW(), NOW(), 
                false
            )
        """), {"id": tenant_id, "name": "Gino Emiliozzi Fitness", "slug": "gino-fitness"})
        
        # 🟢 AUTH SEEDING: Crear el User Central via Raw SQL
        user_id = tenant_id # Link atómico en dev
        print(f"Creando User: {user_id}")
        await conn.execute(text("""
            INSERT INTO users (
                id, email, hashed_password, first_name, last_name, 
                is_active, is_verified, is_superuser, vital_points, streak_days, created_at, updated_at
            ) 
            VALUES (
                :id, :email, :password, 'Gino', 'Emiliozzi', 
                true, true, false, 0, 0, NOW(), NOW()
            )
        """), {
            "id": user_id, 
            "email": "gino@example.com", 
            "password": get_password_hash("admin123")
        })

        # 🔵 RBAC SEEDING: Asignar Rol via Raw SQL
        print("Asignando Rol ADMIN...")
        await conn.execute(text("""
            INSERT INTO user_roles (id, user_id, tenant_id, role, is_active, created_at)
            VALUES (:id, :user_id, :tenant_id, 'ADMIN'::role, true, NOW())
        """), {"id": uuid4(), "user_id": user_id, "tenant_id": tenant_id})

        # 2. Crear Professional via Raw SQL
        pro_id = user_id # Link atómico en dev
        print("Creando Profesional...")
        await conn.execute(text("""
            INSERT INTO professionals (
                id, tenant_id, first_name, last_name, email, 
                auth_user_id, specialty, subscription_status, 
                service_type, created_at, updated_at
            )
            VALUES (
                :id, :tenant_id, 'Gino', 'Emiliozzi', 'gino@example.com', 
                :auth_id, 'HYBRID'::professionalspecialty, 'active', 
                'fitness', NOW(), NOW()
            )
        """), {"id": user_id, "tenant_id": tenant_id, "auth_id": str(user_id)})

    # Now use the session for the rest of the objects as they don't involve complex Enums in their initial state or we can handle them
    async with async_session_maker() as session:
        # 3. Crear Clientes
        clients = []
        
        # Cliente 1: Riesgo Lesión (Carga subió 20%)
        c1 = Client(
            id=uuid4(),
            tenant_id=tenant_id,
            professional_id=pro_id,
            first_name="Carlos",
            last_name="Méndez",
            email="carlos@example.com",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            last_synced_at=datetime.utcnow(),
            extra_data={"streak": 15, "pain_areas": ["Rodilla Izq"]}
        )
        clients.append(c1)
        
        # Cliente 2: Video Pendiente
        c2 = Client(
            id=uuid4(),
            tenant_id=tenant_id,
            professional_id=pro_id,
            first_name="Sofía",
            last_name="López",
            email="sofia@example.com",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            last_synced_at=datetime.utcnow(),
            extra_data={"streak": 8, "estimated_1rm": {"squat": 80, "deadlift": 100, "bench": 45}}
        )
        clients.append(c2)
        
        # Cliente 3: Churn Risk (Inactivo > 7 días)
        c3 = Client(
            id=uuid4(),
            tenant_id=tenant_id,
            professional_id=pro_id,
            first_name="Pedro",
            last_name="Sánchez",
            email="pedro@example.com",
            payment_status=PaymentStatus.PAST_DUE,
            is_active=True,
            last_synced_at=datetime.utcnow() - timedelta(days=10),
            access_expires_at=datetime.utcnow() - timedelta(days=2)
        )
        clients.append(c3)
        
        # Cliente 4: Manual Payment (Cash)
        c4 = Client(
            id=uuid4(),
            tenant_id=tenant_id,
            professional_id=pro_id,
            first_name="Miguel",
            last_name="Cash",
            email="miguel@example.com",
            payment_status=PaymentStatus.MANUAL_OVERRIDE,
            is_active=True,
            last_synced_at=datetime.utcnow(),
            extra_data={"notes": "Paga en efectivo en el gym"}
        )
        clients.append(c4)

        session.add_all(clients)
        await session.flush()
        
        # 4. Crear Datos de Actividad
        
        # Sesión para Carlos (Riesgo Lesión)
        session_c1 = WorkoutSession(
            id=uuid4(),
            client_id=c1.id,
            started_at=datetime.utcnow() - timedelta(hours=2),
            total_volume_kg=12450
        )
        session.add(session_c1)
        
        # Log de ejercicio con aumento de carga
        log_sq = ExerciseLog(
            session_id=session_c1.id,
            exercise_name="Barbell Squat",
            sets=4,
            reps=8,
            weight_kg=120.0,
            load_increase_pct=20.0 # High Risk!
        )
        session.add(log_sq)
        
        # 5. Crear Video Review
        video = VideoReview(
            id=uuid4(),
            client_id=c2.id,
            professional_id=pro_id,
            exercise_name="Deadlift",
            video_url="https://www.youtube.com/watch?v=op9kVnSvrQw", # Demo
            thumbnail_url="https://img.youtube.com/vi/op9kVnSvrQw/0.jpg",
            status="pending",
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        session.add(video)
        
        # 6. Crear Transacciones (Revenue)
        # 3 pagos este mes
        t1 = FinancialTransaction(
            tenant_id=tenant_id,
            client_id=c1.id,
            amount_total=20.0,
            amount_pro=18.0,
            amount_platform=2.0,
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        t2 = FinancialTransaction(
            tenant_id=tenant_id,
            client_id=c2.id,
            amount_total=20.0,
            amount_pro=18.0,
            amount_platform=2.0,
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        t3 = FinancialTransaction(
            tenant_id=tenant_id, # Pago manual registrado (opcional si se trackea)
            client_id=c4.id,
            amount_total=20.0,
            amount_pro=20.0,
            amount_platform=0.0, # Cash no paga fee automatico
            created_at=datetime.utcnow() - timedelta(days=1),
            provider="cash"
        )
        session.add_all([t1, t2, t3])
        
        await session.commit()
        print("Datos de prueba insertados!")
        print(f"   - Tenant ID: {tenant_id}")
        print(f"   - Pro ID: {pro_id}")
        print(f"   - Clientes creados: {len(clients)}")

if __name__ == "__main__":
    asyncio.run(seed_data())

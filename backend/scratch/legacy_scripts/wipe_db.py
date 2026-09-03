import asyncio
from uuid import uuid4
from sqlalchemy import text
from app.db.database import engine, Base
from app.middleware.auth import get_password_hash

async def wipe_data():
    print("Wiping DB and creating clean initial state...")
    async with engine.begin() as conn:
        print("Truncating tables...")
        await conn.execute(text("TRUNCATE TABLE tenants, users CASCADE"))
        
from app.db.models import Tenant, User, Professional, UserRole
from app.db.database import async_session_maker

async def wipe_data():
    print("Wiping DB and creating clean initial state using ORM...")
    async with engine.begin() as conn:
        print("Truncating tables...")
        await conn.execute(text("TRUNCATE TABLE tenants, users CASCADE"))
        
    async with async_session_maker() as session:
        tenant_id = uuid4()
        print(f"Creating Tenant: {tenant_id}")
        
        tenant = Tenant(
            id=tenant_id,
            name="Gino Emiliozzi Fitness",
            slug="gino-fitness",
            settings={},
            primary_color="#CEFF00",
            secondary_color="#000000",
            compute_units_balance=500000,
            subscription_price=20.0,
            currency="USD",
            plan_tier="PRO",
            subscription_tier="FREE",
            payment_provider="NONE",
            subscription_status="active",
            fee_bps=500,
            referral_reward_claimed=False
        )
        session.add(tenant)
        await session.flush()
        
        user_id = tenant_id
        print(f"Creating Admin User: {user_id}")
        user = User(
            id=user_id,
            email="gino@example.com",
            hashed_password=get_password_hash("admin123"),
            first_name="Gino",
            last_name="Emiliozzi",
            is_active=True,
            is_verified=True,
            is_superuser=False,
            vital_points=0,
            streak_days=0
        )
        session.add(user)
        await session.flush()

        print("Assigning ADMIN Role...")
        role = UserRole(
            id=uuid4(),
            user_id=user_id,
            tenant_id=tenant_id,
            role="ADMIN",
            is_active=True
        )
        session.add(role)

        print("Creating Professional...")
        pro = Professional(
            id=user_id,
            tenant_id=tenant_id,
            first_name="Gino",
            last_name="Emiliozzi",
            email="gino@example.com",
            auth_user_id=str(user_id),
            specialty="HYBRID",
            subscription_status="active",
            service_type="fitness"
        )
        session.add(pro)

        await session.commit()

    print("Clean state ready! No mock clients. Login with gino@example.com / admin123")

if __name__ == "__main__":
    asyncio.run(wipe_data())

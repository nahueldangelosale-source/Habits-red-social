"""
Bienestar APP - Supabase Bootstrap Script
Creates enum types and seeds initial user data for login.
Run after init_db has created all tables.
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from uuid import uuid4
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import get_settings
from app.middleware.auth import get_password_hash

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    connect_args={"prepared_statement_cache_size": 0}
)


# All PostgreSQL ENUM types used by the application
ENUM_DEFINITIONS = {
    "professionalspecialty": ["NUTRITIONIST", "PERSONAL_TRAINER", "HYBRID"],
    "protocoltype": ["STRENGTH", "HYPERTROPHY", "ENDURANCE", "MOBILITY", "CUSTOM"],
    "protocolstatus": ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"],
    "clientextraflags": ["IS_GLP1", "INJURY_RISK"],
    "activeplanstatus": ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED", "DRAFT"],
    "syncstatus": ["SYNCED", "PENDING", "CONFLICT", "OFFLINE"],
    "paymentstatus": ["active", "past_due", "manual", "trial"],
    "intentcategory": ["training", "nutrition", "billing", "general"],
    "plantier": ["FREE", "STARTER", "PRO", "ELITE"],
    "subscriptiontier": ["FREE", "PRO"],
    "paymentprovider": ["MERCADO_PAGO", "STRIPE", "NONE"],
    "musclegroup": ["CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE", "FULL_BODY"],
    "consistencytier": ["INCONSISTENT", "DEVELOPING", "CONSISTENT", "ELITE"],
    "role": [
        "NUTRITIONIST", "PERSONAL_TRAINER", "ADMIN",
        "CLIENT_NUTRITION", "CLIENT_FITNESS", "CLIENT_HYBRID"
    ],
    "permission": [
        "diet:create", "diet:read", "diet:edit", "diet:delete", "diet:check",
        "workout:create", "workout:read", "workout:edit", "workout:delete", "workout:check",
        "clinical:full", "clinical:limited", "clinical:read",
        "chat:nutrition", "chat:fitness", "chat:all",
        "video:upload", "video:review", "video:view",
        "analytics:full", "analytics:personal",
        "billing:manage", "billing:view",
        "admin:tenant", "admin:users",
    ],
}


async def create_enums(conn):
    """Create all PostgreSQL ENUM types if they don't exist."""
    print("--- Creating PostgreSQL ENUM types ---")
    for name, values in ENUM_DEFINITIONS.items():
        values_str = ", ".join(f"'{v}'" for v in values)
        # Use DO block for IF NOT EXISTS semantics
        sql = f"""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '{name}') THEN
                CREATE TYPE {name} AS ENUM ({values_str});
            END IF;
        END $$;
        """
        await conn.execute(text(sql))
        print(f"  [OK] {name}")
    print("--- All ENUM types ready ---\n")


async def seed_user(conn):
    """Seed the minimum data needed for login: Tenant + User + UserRole + Professional."""
    print("--- Seeding initial data ---")

    # Check if user already exists
    result = await conn.execute(text("SELECT id FROM users WHERE email = 'gino@example.com'"))
    if result.first():
        print("  [SKIP] User gino@example.com already exists.")
        return

    tenant_id = uuid4()
    user_id = tenant_id  # Atomic link for dev

    # 1. Create Tenant
    print(f"  Creating Tenant: {tenant_id}")
    await conn.execute(text("""
        INSERT INTO tenants (
            id, name, slug, settings, primary_color, secondary_color, compute_units_balance,
            subscription_price, fee_bps, currency, plan_tier, subscription_tier,
            payment_provider, subscription_status, created_at, updated_at,
            referral_reward_claimed, payment_status, ff_checkout_v2
        )
        VALUES (
            :id, :name, :slug, '{}'::jsonb, '#CEFF00', '#3b82f6', 500000,
            20.0, 1000, 'USD', 'PRO'::plantier, 'FREE'::subscriptiontier,
            'NONE'::paymentprovider, 'active', NOW(), NOW(),
            false, 'active', false
        )
    """), {"id": tenant_id, "name": "Gino Emiliozzi Fitness", "slug": "gino-fitness"})

    # 2. Create User (auth entity)
    hashed = get_password_hash("admin123")
    print(f"  Creating User: {user_id}")
    await conn.execute(text("""
        INSERT INTO users (
            id, email, hashed_password, first_name, last_name,
            is_active, is_verified, is_superuser, vital_points, streak_days,
            created_at, updated_at
        )
        VALUES (
            :id, :email, :password, 'Gino', 'Emiliozzi',
            true, true, false, 0, 0, NOW(), NOW()
        )
    """), {"id": user_id, "email": "gino@example.com", "password": hashed})

    # 3. Create UserRole (RBAC link)
    print("  Assigning Role ADMIN...")
    await conn.execute(text("""
        INSERT INTO user_roles (id, user_id, tenant_id, role, is_active, created_at)
        VALUES (:id, :user_id, :tenant_id, 'ADMIN'::role, true, NOW())
    """), {"id": uuid4(), "user_id": user_id, "tenant_id": tenant_id})

    # 4. Create Professional
    print("  Creating Professional...")
    await conn.execute(text("""
        INSERT INTO professionals (
            id, tenant_id, first_name, last_name, email,
            auth_user_id, specialty, subscription_status,
            service_type, created_at, updated_at, role
        )
        VALUES (
            :id, :tenant_id, 'Gino', 'Emiliozzi', 'gino@example.com',
            :auth_id, 'HYBRID'::professionalspecialty, 'active',
            'fitness', NOW(), NOW(), 'ADMIN'
        )
    """), {"id": user_id, "tenant_id": tenant_id, "auth_id": str(user_id)})

    print("\n  [OK] Initial data seeded!")
    print("  =======================================")
    print("  Login credentials:")
    print("    Email:    gino@example.com")
    print("    Password: admin123")
    print("  =======================================\n")


async def main():
    print("=" * 50)
    print("  Bienestar APP - Supabase Bootstrap")
    print("=" * 50 + "\n")

    async with engine.begin() as conn:
        # Step 1: Create enums
        await create_enums(conn)

        # Step 2: Seed data
        await seed_user(conn)

    print("[DONE] Bootstrap complete. You can now start the backend.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())

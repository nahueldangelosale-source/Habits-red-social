"""
Create dev admin user via raw SQL.
Run with: python create_dev_user.py
"""
import asyncio
import sys
import os
from uuid import uuid4

sys.path.append(os.path.dirname(__file__))

import bcrypt
from sqlalchemy import text
from app.db.connection import engine


def hash_password(password: str) -> str:
    """Hash password with bcrypt directly (bypasses passlib compatibility issues)."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


async def create_user():
    user_id = uuid4()
    tenant_id = uuid4()
    role_id = uuid4()
    hashed = hash_password("admin123")

    async with engine.begin() as conn:
        # Check if user exists
        result = await conn.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": "admin@trinidad.com"},
        )
        row = result.first()
        if row:
            await conn.execute(
                text("UPDATE users SET hashed_password = :pw WHERE email = :email"),
                {"pw": hashed, "email": "admin@trinidad.com"},
            )
            print(f"✅ User exists. Password reset to 'admin123' (bcrypt)")
            return

        # Ensure tenant exists
        result = await conn.execute(text("SELECT id FROM tenants LIMIT 1"))
        tenant_row = result.first()
        if tenant_row:
            tenant_id = tenant_row[0]
            print(f"🏢 Using existing tenant: {tenant_id}")
        else:
            await conn.execute(
                text("""
                    INSERT INTO tenants (id, name, slug, plan_tier, subscription_price, currency)
                    VALUES (:id, :name, :slug, :plan, :price, :currency)
                """),
                {
                    "id": str(tenant_id), "name": "Trinidad Dev",
                    "slug": "trinidad-dev", "plan": "pro",
                    "price": 0, "currency": "USD",
                },
            )
            print(f"🏢 Created tenant: {tenant_id}")

        # Create user
        await conn.execute(
            text("""
                INSERT INTO users (id, email, first_name, last_name, hashed_password,
                                   is_superuser, is_active, is_verified, vital_points, streak_days)
                VALUES (:id, :email, :fn, :ln, :pw, :su, :active, :verified, 0, 0)
            """),
            {
                "id": str(user_id), "email": "admin@trinidad.com",
                "fn": "Admin", "ln": "Trinidad",
                "pw": hashed, "su": True, "active": True, "verified": True,
            },
        )

        # Create admin role
        await conn.execute(
            text("""
                INSERT INTO user_roles (id, user_id, tenant_id, role, is_active)
                VALUES (:id, :uid, :tid, :role, :active)
            """),
            {
                "id": str(role_id), "uid": str(user_id),
                "tid": str(tenant_id), "role": "ADMIN", "active": True,
            },
        )

        print(f"✅ Created user: admin@trinidad.com / admin123")
        print(f"   user_id:   {user_id}")
        print(f"   tenant_id: {tenant_id}")
        print(f"   role:      ADMIN")


if __name__ == "__main__":
    asyncio.run(create_user())

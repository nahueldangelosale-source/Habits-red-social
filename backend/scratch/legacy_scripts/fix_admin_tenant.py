import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    # Force IPv4 127.0.0.1 to avoid WinError 1225 on localhost
    engine = create_async_engine('postgresql+asyncpg://postgres:bienestar_dev_2026@127.0.0.1:5432/bienestar')
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT id FROM users WHERE email='admin@trinidad.com'"))
        user_id = res.scalar()
        
        if not user_id:
            print("User not found")
            return
            
        print("User found:", user_id)
        
        # Check if user has tenant
        res = await conn.execute(text("SELECT tenant_id FROM user_roles WHERE user_id=:id"), {"id": user_id})
        tenant_id = res.scalar()
        
        if not tenant_id:
            tenant_id = uuid.uuid4()
            await conn.execute(
                text("INSERT INTO tenants (id, name, slug) VALUES (:id, 'Trinidad', 'trinidad') ON CONFLICT DO NOTHING"),
                {"id": tenant_id}
            )
            role_id = uuid.uuid4()
            await conn.execute(
                text("INSERT INTO user_roles (id, user_id, tenant_id, role, is_active) VALUES (:rid, :uid, :tid, 'admin', true)"),
                {"rid": role_id, "uid": user_id, "tid": tenant_id}
            )
            print(f"Created tenant {tenant_id} and assigned admin role")
        else:
            print(f"User already has tenant: {tenant_id}")
            
        print("Done! (Password not changed, assuming it is admin123 as created)")
        
asyncio.run(main())


import asyncio
from sqlalchemy import select
from app.db.database import async_session
from app.db.models import Tenant, Professional, User
from app.api.auth import DEV_USERS

async def check_tenant():
    async with async_session() as session:
        # Get dev trainer config
        dev_config = DEV_USERS["entrenador@bienestar.app"]
        user_id = dev_config["user_id"]
        tenant_id = dev_config["tenant_id"]
        
        print(f"Checking for User ID: {user_id}")
        print(f"Tenant ID from config: {tenant_id}")
        
        # Query Tenant
        result = await session.execute(select(Tenant).where(Tenant.id == tenant_id))
        tenant = result.scalar_one_or_none()
        
        if tenant:
            print(f"Tenant Found: {tenant.name}")
            print(f"Tenant Settings: {tenant.settings}")
        else:
            print("Tenant NOT found!")

if __name__ == "__main__":
    asyncio.run(check_tenant())

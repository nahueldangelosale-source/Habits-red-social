import asyncio
from sqlalchemy import select, func
from app.db.database import engine
from app.db.models import Tenant, Professional

async def check_data():
    async with engine.connect() as conn:
        t_count = (await conn.execute(select(func.count()).select_from(Tenant))).scalar()
        p_count = (await conn.execute(select(func.count()).select_from(Professional))).scalar()
        print(f"DEBUG: Tenants: {t_count}, Professionals: {p_count}")

if __name__ == "__main__":
    asyncio.run(check_data())

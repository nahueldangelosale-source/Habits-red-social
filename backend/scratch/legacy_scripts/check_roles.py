import asyncio
from sqlalchemy import select
from app.db.database import SessionLocal
from app.db.rbac import User, UserRole

async def main():
    async with SessionLocal() as db:
        res = await db.execute(select(User).where(User.email=='nahueldangelosale@gmail.com'))
        user = res.scalars().first()
        if user:
            print(f'User: {user.id}')
            res2 = await db.execute(select(UserRole).where(UserRole.user_id==user.id))
            roles = res2.scalars().all()
            print(f'Roles: {roles}')
            for r in roles:
                print(f"Role: {r.role}, Tenant: {r.tenant_id}")
        else:
            print('No user')

if __name__ == "__main__":
    asyncio.run(main())

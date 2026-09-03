import asyncio
import sqlalchemy.ext.asyncio as sa

async def test():
    e = sa.create_async_engine('postgresql+asyncpg://postgres:bienestar_dev_2026@127.0.0.1:5432/bienestar')
    try:
        async with e.connect():
            print('PostgreSQL is UP')
    except Exception as ex:
        print(f"PostgreSQL is DOWN: {ex}")

asyncio.run(test())

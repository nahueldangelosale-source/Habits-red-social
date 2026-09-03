
import asyncio
from sqlalchemy import text
from app.db.connection import engine

async def check_enums_v2():
    async with engine.connect() as conn:
        for enum_name in ['professionalspecialty', 'role']:
            print(f"\n--- Values for Enum: {enum_name} ---")
            result = await conn.execute(text(f"SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = '{enum_name}'"))
            for row in result:
                print(f" - {row[0]}")

if __name__ == "__main__":
    asyncio.run(check_enums_v2())

import asyncio
import os
import sys
import uuid
import traceback
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from app.db.connection import get_db
from app.api.auth import whoami
from app.middleware.auth import TokenData

async def run():
    try:
        # Simulate a token and a session
        async for db in get_db():
            current_user = TokenData(
                user_id=uuid.uuid4(),
                tenant_id=uuid.uuid4(),
                role="professional"
            )
            res = await whoami(current_user=current_user, db=db)
            print(res)
            break
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())

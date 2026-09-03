import asyncio
import json
import uuid
import logging
from datetime import datetime

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Mock the redis client in the module before importing
class MockRedis:
    def __init__(self):
        self.data = {}
        self.expirations = {}
        self.published = []

    async def incr(self, key):
        if key not in self.data:
            self.data[key] = 0
        self.data[key] += 1
        return self.data[key]

    async def expire(self, key, seconds):
        self.expirations[key] = seconds
        return True
        
    async def publish(self, channel, message):
        self.published.append((channel, message))
        return 1

import app.services.redis_client
mock_redis_instance = MockRedis()
app.services.redis_client.redis_client = mock_redis_instance

from app.workers.gamification_worker import process_event
from app.config import get_settings

settings = get_settings()
engine = create_async_engine(settings.database_url)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

logging.basicConfig(level=logging.INFO)

async def test_worker():
    tenant_id = uuid.UUID('22222222-2222-2222-2222-222222222222')  # Try an existing tenant
    user_id = uuid.UUID('11111111-1111-1111-1111-111111111111')    # Try an existing user

    async with async_session() as db:
        # Pushing 5 concurrent events (simulate farm attempt)
        for i in range(1, 6):
            event_id = str(uuid.uuid4())
            payload = json.dumps({
                "event_id": event_id,
                "tenant_id": str(tenant_id),
                "user_id": str(user_id),
                "action_type": "WORKOUT_COMPLETED"
            })
            
            print(f"--- Processing Event {i} ---")
            success = await process_event(event_id, payload, db)
            print(f"Event {i} success: {success}")
            
        # Validate PostgreSQL
        result = await db.execute(f"SELECT total_xp FROM scorecard_vault WHERE user_id = '{user_id}'")
        row = result.scalar()
        print(f"Final XP in DB: {row}")
        
    print("Rate Limit Tracker in Redis:", mock_redis_instance.data)
    print("Total Published SSE Events:", len(mock_redis_instance.published))

if __name__ == "__main__":
    asyncio.run(test_worker())

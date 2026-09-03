import asyncio
import httpx
import uuid
import sys
import logging
from collections import Counter
from datetime import datetime, timezone, timedelta

# Mocking config and setup to run from scripts folder
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import sessionmaker, sync_engine
from app.db.models import Tenant, User
from app.domain.scheduling.models import Resource, ClassSession
from app.main import app
from fastapi import Request

# Avoid running real worker side effects in test
from unittest.mock import patch

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("StressTest")

def seed_database():
    """Seed the database with a tenant, resource, and a class session with 1 spot left."""
    SyncSession = sessionmaker(bind=sync_engine)
    db = SyncSession()
    
    tenant_id = uuid.uuid4()
    tenant = Tenant(id=tenant_id, name="Stress Test Tenant", slug=f"stress-test-tenant-{tenant_id}")
    db.add(tenant)
    db.commit()

    resource_id = uuid.uuid4()
    resource = Resource(id=resource_id, tenant_id=tenant_id, name="Test Studio", capacity=20)
    db.add(resource)
    db.commit()

    user_id = uuid.uuid4()
    user = User(id=user_id, email=f"test_{user_id}@test.com", hashed_password="hash", first_name="Test", last_name="User")
    db.add(user)
    db.commit()

    session_id = uuid.uuid4()
    class_session = ClassSession(
        id=session_id,
        tenant_id=tenant_id,
        resource_id=resource_id,
        name="Golden Ticket Class",
        start_time=datetime.now(timezone.utc),
        end_time=datetime.now(timezone.utc) + timedelta(hours=1),
        max_capacity=20,
        current_capacity=19,
        version=1
    )
    db.add(class_session)
    db.commit()
    db.close()
    
    logger.info(f"Database seeded. ClassSession ID: {session_id} (1 spot left)")
    return str(session_id), str(user_id)

async def test_golden_ticket_overbooking(session_id: str, user_id: str):
    logger.info("--- Starting Golden Ticket (Overbooking) Test ---")
    
    # We mock the get_current_user dependency to avoid authentication issues during stress test
    from app.api.scheduling_routes import get_current_user
    
    async def mock_get_current_user(request: Request):
        return {"id": user_id}
        
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        
        async def make_request(i):
            idempotency_key = str(uuid.uuid4())
            payload = {
                "session_id": session_id,
                "idempotency_key": idempotency_key
            }
            headers = {"Idempotency-Key": idempotency_key}
            
            start_time = datetime.now()
            response = await client.post("/api/v1/scheduling/reservations", json=payload, headers=headers)
            end_time = datetime.now()
            latency = (end_time - start_time).total_seconds() * 1000
            
            return response.status_code, latency

        # Patch celery delays
        with patch('app.api.scheduling_routes.send_reservation_confirmation.delay') as mock_email:
            with patch('app.api.scheduling_routes.sync_reservation_to_analytics.delay') as mock_analytics:
                
                # Launch 50 concurrent requests
                tasks = [make_request(i) for i in range(50)]
                results = await asyncio.gather(*tasks)
                
                status_codes = [res[0] for res in results]
                latencies = [res[1] for res in results]
                
                counts = Counter(status_codes)
                logger.info(f"Golden Ticket Response Codes: {counts}")
                logger.info(f"Average Latency: {sum(latencies)/len(latencies):.2f} ms")
                logger.info(f"Celery emails sent: {mock_email.call_count}")
                
                assert counts.get(200, 0) == 1, "There should be exactly 1 success (200)"
                assert counts.get(409, 0) == 49, "There should be exactly 49 conflicts (409)"
                assert mock_email.call_count == 1, "Only 1 email should have been sent to Celery"
                logger.info("Golden Ticket Test PASSED ✓")

async def test_tunnel_without_signal(session_id: str, user_id: str):
    logger.info("--- Starting Tunnel Without Signal (Idempotency) Test ---")
    
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # First we might need another class session that has capacity
        # We use the same session but it might be full. Let's seed another one.
        new_session_id, _ = seed_database()
        idempotency_key = str(uuid.uuid4())
        
        async def make_request():
            payload = {
                "session_id": new_session_id,
                "idempotency_key": idempotency_key
            }
            headers = {"Idempotency-Key": idempotency_key}
            response = await client.post("/api/v1/scheduling/reservations", json=payload, headers=headers)
            return response.status_code
        
        # Fire 6 identical requests simultaneously
        # Wait, if we fire them simultaneously, idempotency checks might race if there is no lock!
        # The user said: "Genera un Idempotency-Key único. Envía la petición y obtén 200 OK. Inmediatamente (o concurrentemente), bombardea el endpoint 5 veces."
        
        with patch('app.api.scheduling_routes.send_reservation_confirmation.delay') as mock_email:
            with patch('app.api.scheduling_routes.sync_reservation_to_analytics.delay') as mock_analytics:
                # 1st request
                res_code_1 = await make_request()
                
                # 5 subsequent requests concurrently
                tasks = [make_request() for _ in range(5)]
                results = await asyncio.gather(*tasks)
        
        all_codes = [res_code_1] + list(results)
        counts = Counter(all_codes)
        logger.info(f"Idempotency Response Codes: {counts}")
        
        assert counts.get(200, 0) == 6, "All identical requests should return 200 OK via idempotency"
        logger.info("Idempotency Test PASSED ✓")

async def main():
    try:
        session_id, user_id = seed_database()
        await test_golden_ticket_overbooking(session_id, user_id)
        await test_tunnel_without_signal(session_id, user_id)
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

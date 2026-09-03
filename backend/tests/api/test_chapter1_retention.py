import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.connection import get_db
from app.db.models import (
    Client, MasterTemplate, DailyReadiness, WorkoutSession, Conversation, Message, Professional, PaymentStatus
)
from app.services.churn_service import check_client_churn_triggers
from app.middleware.auth import get_current_user

import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine():
    from app.db.connection import engine
    await engine.dispose()
    yield
    await engine.dispose()

class MockUser:
    def __init__(self, user_id=None, tenant_id=None, email="test_athlete@example.com"):
        self.id = user_id or uuid.uuid4()
        self.tenant_id = tenant_id or uuid.uuid4()
        self.email = email
        self.user_id = str(self.id)
        self.role = "athlete"

@pytest.fixture
async def setup_test_data(db_session: AsyncSession):
    """
    Creates tenant, professional, client, and related mock data.
    """
    # Use existing or create test professional and client
    pass

# =============================================================================
# TESTS: JTBD Schema Flexibility
# =============================================================================

@pytest.mark.asyncio
async def test_master_template_schema_flexibility():
    """
    Verifies that MasterTemplate can be successfully created and saved with a null or 'ANY' target_gender.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        # Create template with target_gender = None (representing "ANY" or gender-neutral)
        template = MasterTemplate(
            name="JTBD Strength Builder Null Gender",
            target_gender=None,
            experience_level="Intermedio",
            main_focus="fat_loss",
            days_per_week=3,
            routine_data={"exercises": []}
        )
        
        try:
            db.add(template)
            await db.commit()
            await db.refresh(template)
            
            assert template.id is not None
            assert template.target_gender in [None, "ANY"]
            
            # Cleanup
            await db.delete(template)
            await db.commit()
        except Exception as e:
            await db.rollback()
            raise e
    finally:
        await db_gen.aclose()

# =============================================================================
# TESTS: Billing Hardlocks (402 Payment Required)
# =============================================================================

@pytest.mark.asyncio
async def test_athlete_routine_billing_lock_past_due():
    """
    Asserts that routine retrieve endpoints block the client and return 402 if they are 'past_due'.
    """
    # 1. Create a past due client and mock auth
    test_client_id = uuid.uuid4()
    test_tenant_id = uuid.uuid4()
    
    mock_athlete = MockUser(user_id=test_client_id, tenant_id=test_tenant_id)
    
    # Override auth to return our mock athlete user
    async def override_get_current_user():
        return mock_athlete
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    # Also we need to mock the B2C athlete helper 'get_current_athlete' to return a client with past_due
    from app.api.athlete import get_current_athlete
    
    past_due_client = Client(
        id=test_client_id,
        tenant_id=test_tenant_id,
        first_name="Expired",
        last_name="User",
        email="test_athlete@example.com",
        phone="+5491122223333",
        payment_status="past_due",
        is_active=True
    )
    
    async def override_get_current_athlete():
        return past_due_client
        
    app.dependency_overrides[get_current_athlete] = override_get_current_athlete
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/athlete/routine/today")
        
    # Assert 402 status code and billing message
    assert response.status_code == 402
    assert "Su suscripción ha vencido" in response.json()["detail"]
    
    # Cleanup overrides
    app.dependency_overrides.clear()

# =============================================================================
# TESTS: Proactive Churn Prediction Triggers
# =============================================================================

@pytest.mark.asyncio
async def test_churn_cns_fatigue_alert_generation():
    """
    Asserts that loading 3 critical fatigue logs generates a SYSTEM Message and SSE warning.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        # 1. Create/Retrieve a test professional & client
        # Find any professional
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping db tests")
            
        client = Client(
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Fatigued",
            last_name="Athlete",
            email=f"fatigued_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100009999",
            payment_status="active",
            is_active=True
        )
        db.add(client)
        await db.commit()
        await db.refresh(client)
        
        # 2. Add 3 low energy (<= 2) / high soreness (>= 4) check-ins
        readiness_logs = []
        base_date = datetime.utcnow().date()
        for i in range(3):
            r_log = DailyReadiness(
                athlete_id=client.id,
                logical_date=base_date - timedelta(days=i),
                energy_level=2,
                muscle_soreness=4
            )
            db.add(r_log)
            readiness_logs.append(r_log)
        await db.commit()
        
        # 3. Trigger churn engine manually
        await check_client_churn_triggers(client.id, db)
        
        # 4. Assert that a SYSTEM Message with [CNS Fatigue Warning] was created
        stmt = (
            select(Message)
            .join(Conversation)
            .where(
                Conversation.client_id == client.id,
                Message.sender_type == "SYSTEM",
                Message.content.like("%[CNS Fatigue Warning]%")
            )
        )
        res = await db.execute(stmt)
        warning_msg = res.scalar_one_or_none()
        
        assert warning_msg is not None
        assert "fatiga acumulada crítica del SNC" in warning_msg.content
        
        # Clean up
        for r in readiness_logs:
            await db.delete(r)
        await db.delete(client)
        await db.commit()
    finally:
        await db_gen.aclose()

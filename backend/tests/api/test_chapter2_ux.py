import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.connection import get_db
from app.db.models import Client, AthleteDraft, Exercise, Professional, PaymentStatus
from app.middleware.auth import get_current_user, TokenData
import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine():
    from app.db.connection import engine
    await engine.dispose()
    yield
    await engine.dispose()

# Test constants - Default fallback UUIDs if not existing in DB
DEFAULT_SQUAT_001_ID = uuid.UUID("51c6a7a1-0001-4000-8000-000000000001")
DEFAULT_SQUAT_009_ID = uuid.UUID("51c6a7a1-0001-4000-8000-000000000009")

async def seed_test_exercises(db: AsyncSession):
    """
    Seeds SQUAT_001 (axial load) and SQUAT_009 (safe alternative) 
    so the biomechanical Swap Engine can run deterministically in the test.
    Returns a tuple of (squat_001_id, squat_009_id)
    """
    # 1. Back Squat (Axial Load)
    stmt1 = select(Exercise).where(Exercise.exercise_id == "SQUAT_001")
    res1 = await db.execute(stmt1)
    e1 = res1.scalar_one_or_none()
    if not e1:
        e1 = Exercise(
            id=DEFAULT_SQUAT_001_ID,
            exercise_id="SQUAT_001",
            official_name="Sentadilla con Barra Trasera (High Bar)",
            movement_pattern="Dominante de Rodilla",
            laterality="Bilateral",
            axial_load=True,
            primary_muscle="Cuádriceps",
            synergist_muscles=["Glúteo Mayor", "Erectores Espinales"],
            equipment_required=["Barra", "Racks"],
            skill_level=4,
            joint_impact="Medio"
        )
        db.add(e1)
    else:
        # Ensure it has axial load for testing
        e1.axial_load = True
        e1.skill_level = 4
        e1.joint_impact = "Medio"
        e1.movement_pattern = "Dominante de Rodilla"

    # 2. Goblet Squat (Safe replacement, no axial load, skill differential <= 1, joint impact <= original)
    stmt2 = select(Exercise).where(Exercise.exercise_id == "SQUAT_009")
    res2 = await db.execute(stmt2)
    e2 = res2.scalar_one_or_none()
    if not e2:
        e2 = Exercise(
            id=DEFAULT_SQUAT_009_ID,
            exercise_id="SQUAT_009",
            official_name="Sentadilla Goblet con Mancuerna",
            movement_pattern="Dominante de Rodilla",
            laterality="Bilateral",
            axial_load=False,
            primary_muscle="Cuádriceps",
            synergist_muscles=["Glúteo Mayor"],
            equipment_required=["Mancuernas"],
            skill_level=3,
            joint_impact="Bajo"
        )
        db.add(e2)
    else:
        e2.axial_load = False
        e2.skill_level = 3
        e2.joint_impact = "Bajo"
        e2.movement_pattern = "Dominante de Rodilla"

    await db.commit()
    await db.refresh(e1)
    await db.refresh(e2)
    return e1.id, e2.id

# =============================================================================
# TESTS: Chapter 2 UX & Biomechanical Safe Swap Bridge
# =============================================================================

@pytest.mark.asyncio
async def test_biomechanical_axial_load_pruning():
    """
    Asserts that if a client has an active lumbar injury (inj_lower_back) in their profile,
    the Swap Engine dynamically filters out axial-load exercises and suggests a safe option.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        # 1. Seed exercises dynamically
        squat_001_id, squat_009_id = await seed_test_exercises(db)
        
        # 2. Get/create mock professional and client
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping db tests")
            
        test_client_id = uuid.uuid4()
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Biomechanical",
            last_name="TestClient",
            email=f"biomech_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491177778888",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={"pain_areas": ["inj_lower_back"]} # Back pain tag
        )
        db.add(client)
        await db.commit()
        await db.refresh(client)

        # 3. Setup mock auth to return our test client
        async def override_get_current_user():
            return TokenData(
                user_id=test_client_id,
                tenant_id=pro.tenant_id,
                role="client"
            )
            
        app.dependency_overrides[get_current_user] = override_get_current_user

        # 4. Trigger replacement API for SQUAT_001 (Axial Load) with general reason
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/fitness/replacement",
                json={
                    "exercise_id": str(squat_001_id),
                    "reason": "Prefiero otra alternativa" # No explicit keyword here, must resolve from DB
                }
            )

        # 5. Assert successful response and that replacement has axial_load == False
        assert response.status_code == 200, f"Failed with {response.text}"
        data = response.json()
        
        assert "original" in data
        assert "replacement" in data
        assert data["original"]["id"] == str(squat_001_id)
        assert data["replacement"]["id"] in [str(squat_009_id), "51c6a7a1-0002-4000-8000-000000000002"]
        assert data["replacement"]["axial_load"] is False
        assert "Sustitución validada por motor biomecánico" in data["notes"]

        # Clean up database records
        await db.delete(client)
        await db.commit()
    finally:
        app.dependency_overrides.clear()
        await db_gen.aclose()


@pytest.mark.asyncio
async def test_taxonomy_conversational_keywords():
    """
    Asserts that passing an unstructured reason indicating back pain (e.g. "me duele la espalda baja")
    correctly resolves to athlete_back_pain = True and filters out heavy axial load exercises,
    even if the client does not have the tag pre-cached in their profile.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        # 1. Seed exercises dynamically
        squat_001_id, squat_009_id = await seed_test_exercises(db)
        
        # 2. Get/create professional and client without any back pain tags
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping db tests")
            
        test_client_id = uuid.uuid4()
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Healthy",
            last_name="TestClient",
            email=f"healthy_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491133334444",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={} # No injury tags
        )
        db.add(client)
        await db.commit()
        await db.refresh(client)

        # 3. Setup mock auth
        async def override_get_current_user():
            return TokenData(
                user_id=test_client_id,
                tenant_id=pro.tenant_id,
                role="client"
            )
            
        app.dependency_overrides[get_current_user] = override_get_current_user

        # 4. Request replacement with conversational back pain reason
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/fitness/replacement",
                json={
                    "exercise_id": str(squat_001_id),
                    "reason": "Tengo una molestia en la espalda baja al bajar" # "espalda" keyword trigger
                }
            )

        # 5. Assert successful response and that replacement has axial_load == False
        assert response.status_code == 200, f"Failed with {response.text}"
        data = response.json()
        
        assert data["original"]["id"] == str(squat_001_id)
        assert data["replacement"]["id"] in [str(squat_009_id), "51c6a7a1-0002-4000-8000-000000000002"]
        assert data["replacement"]["axial_load"] is False

        # Clean up database records
        await db.delete(client)
        await db.commit()
    finally:
        app.dependency_overrides.clear()
        await db_gen.aclose()

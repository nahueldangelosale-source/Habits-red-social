"""
Chapter 4: Psicología del Comportamiento - Integration Tests
=============================================================
Tests de integración para los 3 pilares:
1. ConsistencyTracker no-punitivo (Nunca Falles Dos Veces)
2. Autonomic De-load reemplaza hipertrofia por Restauración NQ
3. SMART-T Fragmenter genera micro-milestones correctamente
"""
import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.connection import get_db
from app.db.models import (
    Client, Professional, PaymentStatus, AthleteDraft,
    ConsistencyTracker, MicroMilestone, WorkoutPlan, WorkoutSession,
    ConsistencyTier, DailyReadiness,
)
from app.middleware.auth import get_current_user, TokenData
import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine():
    from app.db.connection import engine
    await engine.dispose()
    yield
    await engine.dispose()


# =============================================================================
# TEST 1: CONSISTENCY TRACKER - NON-PUNITIVE (Pilar 1)
# =============================================================================

@pytest.mark.asyncio
async def test_consistency_tracker_non_punitive():
    """
    Verifica que el ConsistencyTracker implementa correctamente la regla
    'Nunca Falles Dos Veces':
    - Faltar 1 día consume un grace_day pero NO reduce el tier
    - El tier NUNCA baja mientras haya grace_days restantes
    - El score se incrementa con cada actividad registrada
    """
    db_gen = get_db()
    db = await anext(db_gen)
    test_client_id = uuid.uuid4()
    try:
        # Get/create mock professional
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        # IMPORTANT: Commit Client FIRST, then AthleteDraft (FK dependency)
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Chapter4",
            last_name="ConsistencyTest",
            email=f"ch4cons_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100001111",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Now add AthleteDraft (client already exists in DB)
        draft = AthleteDraft(
            tenant_id=pro.tenant_id,
            client_id=test_client_id,
            onboarding_data={"test": True},
            mutated_routine={"exercises": []},
            ai_reasoning={"notes": "test"},
            goal_tags=["GENERAL_FITNESS"],
        )
        db.add(draft)
        await db.commit()

        # Auth setup
        async def override_get_current_user():
            return TokenData(user_id=str(test_client_id), tenant_id=str(pro.tenant_id), role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Day 1: First activity
            resp1 = await ac.post("/api/v1/athlete/readiness", json={
                "energy_level": 4,
                "muscle_soreness": 4,
                "stress_level": 3,
                "sleep_hours": 7.5,
            })
            assert resp1.status_code == 200
            data1 = resp1.json()
            assert data1["red_flags_detected"] == False
            assert data1["is_mutation_triggered"] == False

        # Verify ConsistencyTracker was created
        tracker_res = await db.execute(
            select(ConsistencyTracker).where(ConsistencyTracker.client_id == test_client_id)
        )
        tracker = tracker_res.scalars().first()
        assert tracker is not None, "ConsistencyTracker should be created on first readiness"
        assert tracker.current_tier == ConsistencyTier.BRONZE.value
        initial_score = tracker.weekly_consistency_score
        assert initial_score > 0, "Score should increase after recording activity"
        assert tracker.grace_days_remaining == 2, "Grace days should start at 2"

        # Simulate a 1-day gap (skip a day, then record)
        from app.services.behavioral_engine import record_activity
        
        # Simulate: last activity was 2 days ago (1 day gap)
        today = date.today()
        tracker.last_activity_logical_date = today - timedelta(days=2)
        await db.commit()
        
        # Record activity today (creates a 1-day gap)
        result = await record_activity(db, test_client_id, today)
        assert result["status"] == "recorded"
        
        # Refresh tracker
        await db.refresh(tracker)
        assert tracker.grace_days_remaining == 1, f"One grace day should be consumed, got {tracker.grace_days_remaining}"
        assert tracker.current_tier == ConsistencyTier.BRONZE.value, "Tier should NOT decrease after 1-day gap"

    finally:
        # Cleanup - rollback any pending errors first
        app.dependency_overrides.pop(get_current_user, None)
        try:
            await db.rollback()
        except Exception:
            pass
        try:
            await db.execute(delete(DailyReadiness).where(DailyReadiness.athlete_id == test_client_id))
            await db.execute(delete(ConsistencyTracker).where(ConsistencyTracker.client_id == test_client_id))
            await db.execute(delete(MicroMilestone).where(MicroMilestone.client_id == test_client_id))
            await db.execute(delete(AthleteDraft).where(AthleteDraft.client_id == test_client_id))
            await db.execute(delete(Client).where(Client.id == test_client_id))
            await db.commit()
        except Exception:
            await db.rollback()
        await db.close()


# =============================================================================
# TEST 2: AUTONOMIC DE-LOAD & RED FLAGS (Pilar 3)
# =============================================================================

@pytest.mark.asyncio
async def test_autonomic_deload_red_flags():
    """
    Verifica que las Red Flags neurobiológicas disparan el Protocolo
    de Descarga Autonómica:
    - stress_level > 8 -> Fuerza la mutación independientemente de energy
    - sleep_hours < 5 -> Fuerza la mutación independientemente de energy
    - El mensaje empático NO usa tono militarista
    """
    db_gen = get_db()
    db = await anext(db_gen)
    test_client_id = uuid.uuid4()
    try:
        # Get/create mock professional
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        # Commit Client FIRST
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Chapter4",
            last_name="DeloadTest",
            email=f"ch4deload_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100002222",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Then AthleteDraft
        draft = AthleteDraft(
            tenant_id=pro.tenant_id,
            client_id=test_client_id,
            onboarding_data={"test": True},
            mutated_routine={"exercises": []},
            ai_reasoning={"notes": "test"},
            goal_tags=["MUSCLE_GAIN"],
        )
        db.add(draft)
        await db.commit()

        # Auth setup
        async def override_get_current_user():
            return TokenData(user_id=str(test_client_id), tenant_id=str(pro.tenant_id), role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Scenario A: High stress (> 8) with NORMAL energy (4)
            resp_stress = await ac.post("/api/v1/athlete/readiness", json={
                "energy_level": 4,         # Normal energy
                "muscle_soreness": 4,      # Not sore
                "stress_level": 9,         # RED FLAG: stress > 8
                "sleep_hours": 7.0,        # Good sleep
            })
            assert resp_stress.status_code == 200
            data_stress = resp_stress.json()
            assert data_stress["red_flags_detected"] == True, "Red flags should be detected for stress > 8"
            assert data_stress["is_mutation_triggered"] == True, "Mutation should trigger even with normal energy"

        # Verify the empathic tone in safety_tasks prompt selection
        from app.tasks.safety_tasks import AUTONOMIC_DELOAD_PROMPT, EMPATHIC_TONE_AUTONOMIC_DELOAD
        assert "NQ" in AUTONOMIC_DELOAD_PROMPT, "Prompt should mention Restauración NQ"
        assert "Movilidad" in AUTONOMIC_DELOAD_PROMPT
        assert "bienestar" in EMPATHIC_TONE_AUTONOMIC_DELOAD.lower()
        assert "castigo" not in EMPATHIC_TONE_AUTONOMIC_DELOAD.lower(), "No punitive language allowed"
        assert "militar" not in EMPATHIC_TONE_AUTONOMIC_DELOAD.lower(), "No militaristic language allowed"

        # Verify Red Flags detection function
        from app.api.readiness_routes import _detect_red_flags
        assert _detect_red_flags(stress_level=9, sleep_hours=7.0) == True, "Stress > 8 is a red flag"
        assert _detect_red_flags(stress_level=5, sleep_hours=4.5) == True, "Sleep < 5 is a red flag"
        assert _detect_red_flags(stress_level=5, sleep_hours=7.0) == False, "Normal values = no red flags"
        assert _detect_red_flags(stress_level=None, sleep_hours=None) == False, "None values = no red flags"

    finally:
        # Cleanup
        app.dependency_overrides.pop(get_current_user, None)
        try:
            await db.rollback()
        except Exception:
            pass
        try:
            await db.execute(delete(DailyReadiness).where(DailyReadiness.athlete_id == test_client_id))
            await db.execute(delete(ConsistencyTracker).where(ConsistencyTracker.client_id == test_client_id))
            await db.execute(delete(MicroMilestone).where(MicroMilestone.client_id == test_client_id))
            await db.execute(delete(AthleteDraft).where(AthleteDraft.client_id == test_client_id))
            await db.execute(delete(Client).where(Client.id == test_client_id))
            await db.commit()
        except Exception:
            await db.rollback()
        await db.close()


# =============================================================================
# TEST 3: SMART-T FRAGMENTER (Pilar 2)
# =============================================================================

@pytest.mark.asyncio
async def test_smart_t_milestone_fragmenter():
    """
    Verifica que el SMART-T Fragmenter genera correctamente
    micro-milestones de ~12 días:
    - Genera el número correcto de milestones
    - Las fechas están espaciadas por 12 días
    - Los milestones incluyen XP incrementales
    - Los milestones quedan persistidos en la base de datos
    """
    db_gen = get_db()
    db = await anext(db_gen)
    test_client_id = uuid.uuid4()
    try:
        # Get/create mock professional
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        # Commit Client FIRST
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Chapter4",
            last_name="MilestoneTest",
            email=f"ch4mile_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491100003333",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Then AthleteDraft
        draft = AthleteDraft(
            tenant_id=pro.tenant_id,
            client_id=test_client_id,
            onboarding_data={"test": True},
            mutated_routine={"exercises": []},
            ai_reasoning={"notes": "test"},
            goal_tags=["WEIGHT_LOSS"],
        )
        db.add(draft)
        await db.commit()

        # Generate milestones via the engine
        from app.services.behavioral_engine import generate_micro_milestones, MILESTONE_CYCLE_DAYS

        start = date(2026, 1, 1)
        milestones = await generate_micro_milestones(
            db, test_client_id,
            start_date=start,
            goal_tags=["WEIGHT_LOSS"],
        )

        assert len(milestones) > 0, "Should generate at least 1 milestone"
        assert len(milestones) <= 6, "Should generate at most 6 milestones per cycle"

        # Verify 12-day spacing
        first_target = milestones[0]["target_date"]
        expected_first = str(start + timedelta(days=MILESTONE_CYCLE_DAYS))
        assert first_target == expected_first, f"First milestone should be at {expected_first}, got {first_target}"

        if len(milestones) >= 2:
            second_target = milestones[1]["target_date"]
            expected_second = str(start + timedelta(days=MILESTONE_CYCLE_DAYS * 2))
            assert second_target == expected_second, f"Second milestone should be at {expected_second}, got {second_target}"

        # Verify XP is incrementing
        for i, m in enumerate(milestones):
            expected_xp = 50 + (i * 10)
            assert m["xp_reward"] == expected_xp, f"Milestone {i} XP should be {expected_xp}, got {m['xp_reward']}"

        # Verify persistence in database
        db_milestones_res = await db.execute(
            select(MicroMilestone).where(MicroMilestone.client_id == test_client_id)
        )
        db_milestones = db_milestones_res.scalars().all()
        assert len(db_milestones) == len(milestones), "All milestones should be persisted in the DB"

        # Verify all are initially not achieved
        for m in db_milestones:
            assert m.is_achieved == False, "New milestones should not be achieved"

    finally:
        # Cleanup
        try:
            await db.rollback()
        except Exception:
            pass
        try:
            await db.execute(delete(MicroMilestone).where(MicroMilestone.client_id == test_client_id))
            await db.execute(delete(ConsistencyTracker).where(ConsistencyTracker.client_id == test_client_id))
            await db.execute(delete(AthleteDraft).where(AthleteDraft.client_id == test_client_id))
            await db.execute(delete(Client).where(Client.id == test_client_id))
            await db.commit()
        except Exception:
            await db.rollback()
        await db.close()

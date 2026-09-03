import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.connection import get_db
from app.db.models import Client, Exercise, Professional, PaymentStatus, WorkoutSession, VideoReview, Message, Conversation
from app.middleware.auth import get_current_user, TokenData
import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine():
    from app.db.connection import engine
    await engine.dispose()
    yield
    await engine.dispose()

DEFAULT_BARBELL_SQUAT_ID = uuid.UUID("51c6a7a1-0002-4000-8000-000000000001")
DEFAULT_DUMBBELL_SQUAT_ID = uuid.UUID("51c6a7a1-0002-4000-8000-000000000002")
DEFAULT_BODYWEIGHT_SQUAT_ID = uuid.UUID("51c6a7a1-0002-4000-8000-000000000003")

async def seed_test_exercises_chapter3(db: AsyncSession):
    """
    Seeds a hierarchy of exercises in 'Dominante de Rodilla' movement pattern:
    1. Barbell Back Squat: Skill level 4, Barbell required, axial load = True.
    2. Goblet Squat: Skill level 3, Mancuernas required, axial load = False.
    3. Bodyweight Squat: Skill level 1, Sin Equipo, axial load = False.
    """
    # 1. Barbell Back Squat
    stmt1 = select(Exercise).where(Exercise.exercise_id == "CH3_BARBELL_SQUAT")
    res1 = await db.execute(stmt1)
    e1 = res1.scalar_one_or_none()
    if not e1:
        e1 = Exercise(
            id=DEFAULT_BARBELL_SQUAT_ID,
            exercise_id="CH3_BARBELL_SQUAT",
            official_name="Barbell Back Squat (CH3)",
            movement_pattern="Dominante de Rodilla",
            laterality="Bilateral",
            axial_load=True,
            primary_muscle="Cuádriceps",
            synergist_muscles=["Glúteos"],
            equipment_required=["Barra"],
            skill_level=4,
            joint_impact="Medio"
        )
        db.add(e1)
    else:
        e1.skill_level = 4
        e1.axial_load = True
        e1.equipment_required = ["Barra"]

    # 2. Goblet Squat
    stmt2 = select(Exercise).where(Exercise.exercise_id == "CH3_DUMBBELL_SQUAT")
    res2 = await db.execute(stmt2)
    e2 = res2.scalar_one_or_none()
    if not e2:
        e2 = Exercise(
            id=DEFAULT_DUMBBELL_SQUAT_ID,
            exercise_id="CH3_DUMBBELL_SQUAT",
            official_name="Goblet Squat (CH3)",
            movement_pattern="Dominante de Rodilla",
            laterality="Bilateral",
            axial_load=False,
            primary_muscle="Cuádriceps",
            synergist_muscles=["Glúteos"],
            equipment_required=["Mancuerna"],
            skill_level=3,
            joint_impact="Bajo"
        )
        db.add(e2)
    else:
        e2.skill_level = 3
        e2.axial_load = False
        e2.equipment_required = ["Mancuerna"]

    # 3. Bodyweight Squat
    stmt3 = select(Exercise).where(Exercise.exercise_id == "CH3_BODYWEIGHT_SQUAT")
    res3 = await db.execute(stmt3)
    e3 = res3.scalar_one_or_none()
    if not e3:
        e3 = Exercise(
            id=DEFAULT_BODYWEIGHT_SQUAT_ID,
            exercise_id="CH3_BODYWEIGHT_SQUAT",
            official_name="Bodyweight Squat (CH3)",
            movement_pattern="Dominante de Rodilla",
            laterality="Bilateral",
            axial_load=False,
            primary_muscle="Cuádriceps",
            synergist_muscles=["Glúteos"],
            equipment_required=[],
            skill_level=1,
            joint_impact="Bajo"
        )
        db.add(e3)
    else:
        e3.skill_level = 1
        e3.axial_load = False
        e3.equipment_required = []

    await db.commit()
    return DEFAULT_BARBELL_SQUAT_ID, DEFAULT_DUMBBELL_SQUAT_ID, DEFAULT_BODYWEIGHT_SQUAT_ID


# =============================================================================
# TESTS: Chapter 3 Biomechanical Engine & AI Triage
# =============================================================================

@pytest.mark.asyncio
async def test_swap_engine_cascades():
    """
    Verifica que la lógica del Swap Engine maneje cascadas conversacionales:
    - Regresiones de habilidad cuando la técnica es muy difícil.
    - Exclusión de equipo faltante (e.g. sin barra -> buscar goblet o bodyweight).
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        # Seed exercises
        barbell_id, dumbbell_id, bodyweight_id = await seed_test_exercises_chapter3(db)

        # Get/create mock professional and client
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB, skipping")

        test_client_id = uuid.uuid4()
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Chapter3",
            last_name="SwapTest",
            email=f"ch3swap_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491188889999",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Auth setup
        async def override_get_current_user():
            return TokenData(user_id=test_client_id, tenant_id=pro.tenant_id, role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        # Scenario A: Skill Regression (too difficult)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/fitness/replacement",
                json={
                    "exercise_id": str(barbell_id),
                    "reason": "La técnica es muy difícil y no me sale"
                }
            )
            assert response.status_code == 200, response.text
            data = response.json()
            assert data["replacement"]["skill_level"] < 4 # Skill regression vs original 4
            assert "Regresión de habilidad aplicada" in data["notes"]

        # Scenario B: Equipment Deficiency (no barbell)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/fitness/replacement",
                json={
                    "exercise_id": str(barbell_id),
                    "reason": "Sin barra, no tengo barra en casa"
                }
            )
            assert response.status_code == 200, response.text
            data = response.json()
            # Replacement has no "Barra" in equipment_required
            assert "Barra" not in (data["replacement"].get("equipment_required") or [])
            assert "Ajuste por equipamiento completado" in data["notes"]

        # Clean up database records
        await db.delete(client)
        await db.commit()
    finally:
        app.dependency_overrides.clear()
        await db_gen.aclose()


@pytest.mark.asyncio
async def test_ewma_acwr_calculation_and_alerts():
    """
    Verifica el motor de cálculo EWMA ACWR:
    - Que calcule correctamente la carga interna (session-RPE * duración).
    - Que al registrar un incremento severo de carga (ACWR >= 1.50)
      se dispare la alerta de sobreentrenamiento de forma persistente.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB")

        test_client_id = uuid.uuid4()
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Chapter3",
            last_name="ACWRTest",
            email=f"ch3acwr_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491111112222",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Seed multiple historical sessions with low load to establish chronic baseline
        # then trigger an acute spike.
        base_time = datetime.utcnow() - timedelta(days=35)
        for i in range(35):
            day = base_time + timedelta(days=i)
            # Establish baseline: 60 minutes * RPE 3 = 180 internal load
            session = WorkoutSession(
                client_id=client.id,
                started_at=day,
                ended_at=day + timedelta(minutes=60),
                duration_minutes=60,
                perceived_rpe=3,
                internal_load=180.0,
                external_load_watts=150.0
            )
            db.add(session)
        
        # Acute Spike today: 90 minutes * RPE 10 = 900 internal load
        spike_session = WorkoutSession(
            client_id=client.id,
            started_at=datetime.utcnow(),
            ended_at=datetime.utcnow() + timedelta(minutes=90),
            duration_minutes=90,
            perceived_rpe=10,
            internal_load=900.0,
            external_load_watts=400.0
        )
        db.add(spike_session)
        await db.commit()

        # Run telemetry endpoint
        async def override_get_current_user():
            return TokenData(user_id=client.id, tenant_id=pro.tenant_id, role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/v1/athlete/telemetry")
            assert response.status_code == 200
            data = response.json()
            assert data["acwr"] >= 1.50
            assert data["risk_status"] == "DANGER_ZONE"
            assert data["risk_color"] == "RED"

        # Check if SYSTEM message alert was generated in GENERAL conversation
        from app.db.models import Message, Conversation
        conv_stmt = select(Conversation).where(Conversation.client_id == client.id, Conversation.entity_type == "GENERAL")
        conv_res = await db.execute(conv_stmt)
        conv = conv_res.scalar_one_or_none()
        assert conv is not None

        msg_stmt = select(Message).where(Message.conversation_id == conv.id, Message.sender_type == "SYSTEM")
        msg_res = await db.execute(msg_stmt)
        messages = msg_res.scalars().all()
        assert len(messages) > 0
        assert "[ACWR Spike Warning]" in messages[0].content

        # Clean up database records
        from sqlalchemy import delete
        await db.execute(delete(Message).where(
            (Message.conversation_id.in_(select(Conversation.id).where(Conversation.client_id == client.id))) |
            (Message.sender_id == client.id)
        ))
        await db.execute(delete(Conversation).where(Conversation.client_id == client.id))
        await db.execute(delete(WorkoutSession).where(WorkoutSession.client_id == client.id))
        await db.delete(client)
        await db.commit()
    finally:
        app.dependency_overrides.clear()
        await db_gen.aclose()


@pytest.mark.asyncio
async def test_video_triage_and_trainer_dashboard():
    """
    Verifica el pipeline de triaje de video por IA y la bandeja de entrada del entrenador:
    - Sube 3 videos: P1 (Riesgo crítico), P2 (Estancamiento), y P3 (Ejecución correcta).
    - Assert que se categoricen correctamente en la base de datos.
    - Fetch del dashboard del entrenador y verifica que el queue filtre y muestre P1 primero, luego P2,
      y oculte por completo a los videos P3 (auto-aprobados) para eliminar fatiga cognitiva.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        prof_res = await db.execute(select(Professional).limit(1))
        pro = prof_res.scalar_one_or_none()
        if not pro:
            pytest.skip("No professional found in DB")

        test_client_id = uuid.uuid4()
        client = Client(
            id=test_client_id,
            tenant_id=pro.tenant_id,
            professional_id=pro.id,
            first_name="Chapter3",
            last_name="TriageTest",
            email=f"ch3triage_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491122223333",
            payment_status=PaymentStatus.ACTIVE,
            is_active=True,
            extra_data={}
        )
        db.add(client)
        await db.commit()

        # Auth setup for athlete video submission
        async def override_get_current_user_athlete():
            return TokenData(user_id=client.id, tenant_id=pro.tenant_id, role="client")
        app.dependency_overrides[get_current_user] = override_get_current_user_athlete

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Submit P1 Video (contains "critical")
            res_p1 = await ac.post(
                "/api/v1/athlete/video-review",
                json={
                    "exercise_name": "Sentadilla Trasera Barra",
                    "video_url": "https://example.com/video_critical_p1.mp4"
                }
            )
            assert res_p1.status_code == 201, res_p1.text
            data_p1 = res_p1.json()
            assert data_p1["ai_priority"] == "P1"
            assert "Curvatura Lumbar Peligrosa" in data_p1["ai_triage_category"]

            # 2. Submit P2 Video (contains "plateau")
            res_p2 = await ac.post(
                "/api/v1/athlete/video-review",
                json={
                    "exercise_name": "Sentadilla Profunda",
                    "video_url": "https://example.com/video_plateau_p2.mp4"
                }
            )
            assert res_p2.status_code == 201, res_p2.text
            data_p2 = res_p2.json()
            assert data_p2["ai_priority"] == "P2"
            assert "Rango de Movimiento Insuficiente" in data_p2["ai_triage_category"]

            # 3. Submit P3 Video (contains "perfect" or others)
            res_p3 = await ac.post(
                "/api/v1/athlete/video-review",
                json={
                    "exercise_name": "Sentadilla Goblet",
                    "video_url": "https://example.com/video_perfect_p3.mp4"
                }
            )
            assert res_p3.status_code == 201, res_p3.text
            data_p3 = res_p3.json()
            assert data_p3["ai_priority"] == "P3"
            assert data_p3["status"] == "approved" # Auto-approved

        # Auth setup for trainer dashboard retrieve
        async def override_get_current_user_trainer():
            return TokenData(user_id=pro.id, tenant_id=pro.tenant_id, role="personal_trainer")
        app.dependency_overrides[get_current_user] = override_get_current_user_trainer

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/v1/trainer/dashboard")
            assert response.status_code == 200, response.text
            data = response.json()
            
            video_queue = data["video_queue"]
            # Assert P3 is completely hidden
            assert all(v["ai_priority"] != "P3" for v in video_queue)
            
            # Assert P1 is sorted before P2
            priority_indices = [v["ai_priority"] for v in video_queue if v["ai_priority"] in ["P1", "P2"]]
            # P1 should come first, then P2
            # Let's check that if both are in list, P1 is before P2
            if "P1" in priority_indices and "P2" in priority_indices:
                p1_index = priority_indices.index("P1")
                p2_index = priority_indices.index("P2")
                assert p1_index < p2_index

        # Clean up database records
        from sqlalchemy import delete
        await db.execute(delete(VideoReview).where(VideoReview.client_id == client.id))
        await db.delete(client)
        await db.commit()
    finally:
        app.dependency_overrides.clear()
        await db_gen.aclose()

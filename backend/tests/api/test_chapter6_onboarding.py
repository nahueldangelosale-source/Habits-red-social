import pytest
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.connection import get_db
from app.db.models import (
    Client, Professional, AthleteDraft, Conversation, Message, Tenant
)
from app.middleware.auth import get_current_user, TokenData
import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine():
    from app.db.connection import engine
    await engine.dispose()
    yield
    await engine.dispose()

@pytest.mark.asyncio
async def test_b2c_onboarding_lumbar_pain_yellow_risk_high_stress():
    """
    Verifica el workflow completo de onboarding B2C:
    1. Envío exitoso a /api/v1/onboarding/submit.
    2. Persistencia en Client y AthleteDraft.
    3. Motor de reglas determinista de tags (McGill protocol -> Yellow risk por LOWER_BACK_PAIN).
    4. Detección de fatiga/estrés (habit_stress_level >= 4 -> HIGH_STRESS -> Enfoque de recuperación).
    5. Creación de Conversación (WORKOUT) y Mensaje de Sistema en Sovereign Inbox.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        # 1. Obtener o crear un Tenant y Profesional para el test
        tenant_res = await db.execute(select(Tenant).limit(1))
        tenant = tenant_res.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(
                name="Test Onboarding Tenant",
                slug="test-onboarding-tenant"
            )
            db.add(tenant)
            await db.commit()
            await db.refresh(tenant)

        prof_res = await db.execute(select(Professional).where(Professional.tenant_id == tenant.id))
        pro = prof_res.scalars().first()
        if not pro:
            pro = Professional(
                tenant_id=tenant.id,
                first_name="Coach",
                last_name="Test",
                email=f"coach_onboarding_{uuid.uuid4().hex[:6]}@example.com",
                phone="+5491199999999",
                specialty="FITNESS",
                service_type="FITNESS"
            )
            db.add(pro)
            await db.commit()
            await db.refresh(pro)

        # Payload de onboarding B2C
        payload = {
            "first_name": "Juan",
            "last_name": "Pérez",
            "email": f"juan_onboard_{uuid.uuid4().hex[:6]}@example.com",
            "age": 30,
            "weight_kg": 82.5,
            "height_cm": 178.0,
            "training_experience": "BEGINNER",
            "training_days_available": 3,
            "training_duration_pref": 60,
            "medical_tags": ["LOWER_BACK_PAIN"],
            "goal_tags": ["STRENGTH"],
            "habit_sleep_quality": 3,
            "habit_stress_level": 5,  # stress >= 4 -> HIGH_STRESS
            "habit_work_type": "SEDENTARY",
            "equipment": "none",
            "injuries": "none"
        }

        # Mock de autenticación para el onboarding
        async def override_get_current_user():
            return TokenData(user_id=str(uuid.uuid4()), tenant_id=str(tenant.id), role="client")
        
        from app.api.onboarding_routes import mock_get_current_tenant
        async def override_get_current_tenant():
            return tenant

        app.dependency_overrides[get_current_user] = override_get_current_user
        app.dependency_overrides[mock_get_current_tenant] = override_get_current_tenant

        # Llamar al endpoint
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/v1/onboarding/submit", json=payload)

        # Assert status exitoso
        assert response.status_code == 200
        data = response.json()
        assert data["id"] is not None
        assert data["risk_score"] == "Yellow"  # Disparado por LOWER_BACK_PAIN
        assert data["status"] == "pending_review"

        draft_id = uuid.UUID(data["id"])
        client_id = uuid.UUID(data["client_id"])

        # Verificar persistencia en base de datos
        draft_stmt = select(AthleteDraft).where(AthleteDraft.id == draft_id)
        draft_res = await db.execute(draft_stmt)
        draft = draft_res.scalar_one_or_none()

        assert draft is not None
        assert draft.risk_score == "Yellow"
        assert "LOWER_BACK_PAIN" in draft.mutated_routine["tags"]
        assert "HIGH_STRESS" in draft.mutated_routine["tags"]
        assert draft.mutated_routine["suggested_approach"] == "Enfoque de recuperación"
        assert draft.training_experience == "BEGINNER"
        assert draft.habit_stress_level == 5

        # Verificar creación del Cliente
        client_stmt = select(Client).where(Client.id == client_id)
        client_res = await db.execute(client_stmt)
        client = client_res.scalar_one_or_none()

        assert client is not None
        assert client.first_name == "Juan"
        assert client.last_name == "Pérez"
        assert client.extra_data["age"] == 30
        assert client.extra_data["weight_kg"] == 82.5

        # Verificar creación de conversación e inbox en base de datos
        conv_stmt = select(Conversation).where(
            Conversation.client_id == client_id,
            Conversation.professional_id == pro.id,
            Conversation.entity_type == "WORKOUT"
        )
        conv_res = await db.execute(conv_stmt)
        conversation = conv_res.scalar_one_or_none()

        assert conversation is not None
        assert conversation.entity_id == draft_id

        # Verificar mensaje del sistema
        msg_stmt = select(Message).where(Message.conversation_id == conversation.id)
        msg_res = await db.execute(msg_stmt)
        message = msg_res.scalar_one_or_none()

        assert message is not None
        assert message.sender_type == "SYSTEM"
        assert message.intent_category == "training"
        assert "HIGH_STRESS" in message.content
        assert "LOWER_BACK_PAIN" in message.content

        # Cleanup de datos del test
        await db.delete(message)
        await db.delete(conversation)
        await db.delete(draft)
        await db.delete(client)
        await db.commit()

    finally:
        app.dependency_overrides.clear()
        await db_gen.aclose()


@pytest.mark.asyncio
async def test_b2b_professional_onboarding_persistence():
    """
    Verifica que los perfiles de profesionales (Entrenadores/Nutricionistas)
    se registren y persistan correctamente vinculados al Tenant correspondiente.
    """
    db_gen = get_db()
    db = await anext(db_gen)
    try:
        # Obtener tenant existente
        tenant_res = await db.execute(select(Tenant).limit(1))
        tenant = tenant_res.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(
                name="Test B2B Onboarding Tenant",
                slug="test-b2b-onboarding"
            )
            db.add(tenant)
            await db.commit()
            await db.refresh(tenant)

        # Crear Entrenador Personal
        pt = Professional(
            tenant_id=tenant.id,
            first_name="Elena",
            last_name="Sánchez",
            email=f"elena_pt_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491133333333",
            specialty="Fuerza y Biomecánica",
            service_type="FITNESS",
            bio="Experta en entrenamiento funcional",
            coaching_style="Motivador"
        )

        # Crear Nutricionista
        nutri = Professional(
            tenant_id=tenant.id,
            first_name="Carlos",
            last_name="Gómez",
            email=f"carlos_nutri_{uuid.uuid4().hex[:6]}@example.com",
            phone="+5491144444444",
            specialty="Nutrición Deportiva",
            service_type="NUTRITION",
            bio="Especialista en recomposición corporal",
            coaching_style="Empático"
        )

        db.add(pt)
        db.add(nutri)
        await db.commit()

        # Verificar persistencia del Entrenador
        pt_stmt = select(Professional).where(Professional.id == pt.id)
        pt_res = await db.execute(pt_stmt)
        persisted_pt = pt_res.scalar_one_or_none()

        assert persisted_pt is not None
        assert persisted_pt.first_name == "Elena"
        assert persisted_pt.service_type == "FITNESS"
        assert persisted_pt.tenant_id == tenant.id

        # Verificar persistencia del Nutricionista
        nutri_stmt = select(Professional).where(Professional.id == nutri.id)
        nutri_res = await db.execute(nutri_stmt)
        persisted_nutri = nutri_res.scalar_one_or_none()

        assert persisted_nutri is not None
        assert persisted_nutri.first_name == "Carlos"
        assert persisted_nutri.service_type == "NUTRITION"
        assert persisted_nutri.tenant_id == tenant.id

        # Cleanup
        await db.delete(persisted_pt)
        await db.delete(persisted_nutri)
        await db.commit()

    finally:
        await db_gen.aclose()

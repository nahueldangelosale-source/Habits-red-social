"""
=============================================================================
SUITE DE SMOKE TESTS E2E — PRODUCCIÓN (3 FLUJOS CRÍTICOS)
=============================================================================
Valida de forma integral los 3 Workflows de punta a punta con autenticación real:
- Workflow 1 (W1): Registro público del Coach, Login, Creación de Atleta en Roster, Consulta y Búsqueda de Ejercicios.
- Workflow 2 (W2): Generación de Magic Link, Canje de Atleta, Sesión y Consulta de Rutina Asignada.
- Workflow 3 (W3): Registro Autoservicio B2C, Login, Catálogo de Ejercicios y Acceso Autónomo.
"""

import pytest
import uuid
from httpx import AsyncClient
from app.middleware.auth import create_magic_link_token


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 1: COACH LIFECYCLE & OPERATIONS (B2B)
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_w1_coach_registration_and_session(e2e_client: AsyncClient):
    """
    W1.1: Registro de un nuevo Coach (B2B):
    1. Registra un nuevo Coach con Tenant/Organización.
    2. Valida la creación atómica de Tenant, User, Professional y UserRole(ADMIN).
    3. Inicia sesión con credenciales vía /token.
    4. Consulta el perfil en /api/v1/auth/whoami.
    """
    unique_id = uuid.uuid4().hex[:6]
    coach_email = f"coach_{unique_id}@testgym.com"
    coach_password = "SecurePassword123!"

    # 1. Registro del Coach
    register_payload = {
        "email": coach_email,
        "password": coach_password,
        "first_name": "Gino",
        "last_name": "Tubaro",
        "business_name": f"Gym Elite {unique_id}",
        "specialty": "PERSONAL_TRAINER"
    }
    reg_response = await e2e_client.post("/api/v1/auth/register", json=register_payload)
    assert reg_response.status_code == 201, f"Error en registro: {reg_response.text}"
    
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == coach_email
    assert reg_data["user"]["role"] == "ADMIN"
    
    coach_tenant_id = reg_data["user"]["tenant_id"]

    # 2. Login con OAuth2 form-data
    login_response = await e2e_client.post(
        "/token",
        data={"username": coach_email, "password": coach_password}
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    token = login_data["access_token"]
    assert token is not None

    # 3. Whoami con token real del Coach
    whoami_res = await e2e_client.get(
        "/api/v1/auth/whoami",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert whoami_res.status_code == 200, f"Error en whoami: {whoami_res.text}"
    whoami_data = whoami_res.json()
    assert whoami_data["email"] == coach_email
    assert whoami_data["role"] == "ADMIN"
    assert whoami_data["tenant_id"] == coach_tenant_id


@pytest.mark.asyncio
async def test_w1_coach_creates_athlete_and_queries_roster(e2e_client: AsyncClient):
    """
    W1.2: El Coach registrado crea un Atleta en su Roster y consulta su detalle.
    """
    unique_id = uuid.uuid4().hex[:6]
    coach_email = f"marcus_{unique_id}@powerhouse.com"
    coach_password = "PasswordCoach123!"

    # 1. Registrar Coach
    reg_res = await e2e_client.post("/api/v1/auth/register", json={
        "email": coach_email,
        "password": coach_password,
        "first_name": "Marcus",
        "last_name": "Rios",
        "business_name": f"Power House {unique_id}",
        "specialty": "PERSONAL_TRAINER"
    })
    assert reg_res.status_code == 201
    coach_token = reg_res.json()["access_token"]

    # 2. Crear Atleta en el Roster
    athlete_payload = {
        "first_name": "Leandro",
        "last_name": "Usea",
        "email": f"leandro_{unique_id}@test.com",
        "height_cm": 182.0,
        "weight_kg": 78.5,
        "age": 27,
        "extra_data": {
            "goal": "HIPERTROFIA",
            "days_per_week": 4
        }
    }
    res_create = await e2e_client.post(
        "/api/v1/athletes",
        json=athlete_payload,
        headers={"Authorization": f"Bearer {coach_token}"}
    )
    assert res_create.status_code in (200, 201), f"Error creando atleta: {res_create.text}"
    created_data = res_create.json()
    athlete_id = created_data.get("athlete_id") or created_data.get("id")
    assert athlete_id is not None

    # 3. Consultar detalle del Atleta
    res_detail = await e2e_client.get(
        f"/api/v1/trainer/athletes/{athlete_id}",
        headers={"Authorization": f"Bearer {coach_token}"}
    )
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["first_name"] == "Leandro"


@pytest.mark.asyncio
async def test_w1_exercise_search_and_catalog(e2e_client: AsyncClient):
    """
    W1.3: Verifica que GET /api/v1/exercises/search no sufra route shadowing contra GET /{id}.
    """
    unique_id = uuid.uuid4().hex[:6]
    reg_res = await e2e_client.post("/api/v1/auth/register", json={
        "email": f"trainer_search_{unique_id}@gym.com",
        "password": "Password123!",
        "first_name": "Franco",
        "last_name": "Colapinto",
        "business_name": f"Williams {unique_id}"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]

    # Search exercises
    res_search = await e2e_client.get(
        "/api/v1/exercises/search?q=Squat",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_search.status_code == 200, f"Error en búsqueda: {res_search.text}"
    assert isinstance(res_search.json(), list)

    # List catalog
    res_list = await e2e_client.get(
        "/api/v1/exercises/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_list.status_code == 200
    assert isinstance(res_list.json(), list)


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 2: INVITED ATHLETE MAGIC LINK & ONBOARDING (B2B2C)
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_w2_magic_link_redemption_and_session(e2e_client: AsyncClient):
    """
    W2.1: Flujo de Atleta Invitado:
    1. Coach Registra su Gym y Crea un Atleta en su Roster.
    2. Sistema genera Magic Link efímero con JTI único.
    3. Atleta canjea vía POST /api/v1/auth-b2c/redeem con json={"magic_token": ...}.
    4. Atleta recibe token de sesión y consulta su rutina asignada para hoy.
    """
    unique_id = uuid.uuid4().hex[:6]
    
    # 1. Coach Registra y Crea Atleta
    coach_res = await e2e_client.post("/api/v1/auth/register", json={
        "email": f"coach_magic_{unique_id}@box.com",
        "password": "Password123!",
        "first_name": "Lucas",
        "last_name": "García",
        "business_name": f"CrossBox {unique_id}"
    })
    coach_data = coach_res.json()
    coach_token = coach_data["access_token"]
    tenant_id = uuid.UUID(coach_data["user"]["tenant_id"])

    ath_res = await e2e_client.post(
        "/api/v1/athletes",
        json={
            "first_name": "Camila",
            "last_name": "Valdez",
            "email": f"camila_{unique_id}@gmail.com",
            "height_cm": 168.0,
            "weight_kg": 60.0
        },
        headers={"Authorization": f"Bearer {coach_token}"}
    )
    athlete_id = uuid.UUID(ath_res.json()["athlete_id"])

    # 2. Generar Magic Link Token
    magic_token = create_magic_link_token(athlete_id=athlete_id, tenant_id=tenant_id)

    # 3. Canjear Magic Link (POST con payload JSON)
    redeem_res = await e2e_client.post(
        "/api/v1/auth-b2c/redeem",
        json={"magic_token": magic_token}
    )
    assert redeem_res.status_code == 200, f"Error en canje de Magic Link: {redeem_res.text}"
    redeem_data = redeem_res.json()
    assert "access_token" in redeem_data
    assert redeem_data["athlete_id"] == str(athlete_id)
    assert redeem_data["tenant_id"] == str(tenant_id)

    athlete_token = redeem_data["access_token"]

    # 4. Atleta autenticado consulta su rutina asignada
    routine_res = await e2e_client.get(
        "/api/v1/athlete/routine/today",
        headers={"Authorization": f"Bearer {athlete_token}"}
    )
    assert routine_res.status_code in (200, 404)  # 200 con rutina o 404 si aún no tiene sesión hoy


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 3: STANDALONE AUTONOMOUS B2C ATHLETE
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_w3_standalone_b2c_signup_and_features(e2e_client: AsyncClient):
    """
    W3.1: Registro autoservicio de Atleta Autónomo:
    1. POST /api/v1/auth/register-b2c sin gimnasio (afiliado a 'Comunidad Bienestar').
    2. Inicia sesión y valida su rol CLIENT_FITNESS.
    3. Consulta catálogo de ejercicios para entrenar de forma independiente.
    """
    unique_id = uuid.uuid4().hex[:6]
    b2c_email = f"atleta_libre_{unique_id}@habits.app"
    b2c_password = "PasswordB2C123!"

    # 1. Registro B2C
    payload = {
        "email": b2c_email,
        "password": b2c_password,
        "first_name": "Agustín",
        "last_name": "Pérez"
    }
    res_reg = await e2e_client.post("/api/v1/auth/register-b2c", json=payload)
    assert res_reg.status_code == 201, f"Error en registro B2C: {res_reg.text}"
    reg_data = res_reg.json()
    
    assert "access_token" in reg_data
    assert reg_data["user"]["role"] == "CLIENT_FITNESS"
    token = reg_data["access_token"]

    # 2. Login verification
    res_login = await e2e_client.post(
        "/token",
        data={"username": b2c_email, "password": b2c_password}
    )
    assert res_login.status_code == 200
    
    # 3. Acceso a biblioteca de ejercicios
    res_exercises = await e2e_client.get(
        "/api/v1/exercises/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_exercises.status_code == 200
    assert isinstance(res_exercises.json(), list)

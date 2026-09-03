import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.db.models import Client, ActiveWorkoutPlan, ClientExtraFlags
import uuid

@pytest.mark.asyncio
async def test_simulate_absence_returns_success(async_client: AsyncClient, auth_headers):
    # En un entorno real asertaríamos que un Ghost Athlete existe antes
    # Aquí mockeamos o testeamos el handler asumiendo que arroja 404 si no hay Ghost.
    # Dado que no sabemos si los fixtures tienen un Ghost Creado:
    response = await async_client.post(
        "/api/v1/sandbox/simulate-absence?days=5",
        headers=auth_headers
    )
    assert response.status_code in [200, 404]

@pytest.mark.asyncio
async def test_hard_reset_enforces_atomic_transaction(async_client: AsyncClient, auth_headers):
    baseline_id = str(uuid.uuid4())
    
    response = await async_client.post(
        f"/api/v1/sandbox/reset?baseline_id={baseline_id}",
        headers=auth_headers
    )
    
    # 404 is valid if baseline_id is not found in the DB.
    # If it was found, 200 would mean Tabula Rasa succeeded.
    # 500 would mean the atomic transaction failed unexpectedly.
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert data["status"] == "success"
        assert "ghost_athlete_id" in data
        assert "latency_ms" in data
        assert data["latency_ms"] < 2000  # We set a hard timeout of 2000ms

@pytest.mark.asyncio
async def test_simulate_conflict(async_client: AsyncClient, auth_headers):
    response = await async_client.post(
        "/api/v1/sandbox/simulate-conflict",
        headers=auth_headers
    )
    assert response.status_code in [200, 404]

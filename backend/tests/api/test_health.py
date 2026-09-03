import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check_contract():
    """
    Quality Gate: Validates the health endpoint contract.
    Ensures OTel telemetry and DB connectivity are reported.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")

        
    assert response.status_code == 200
    data = response.json()
    
    # Contract validation
    assert "status" in data
    assert "telemetry" in data
    assert "event_loop_lag_ms" in data["telemetry"]
    assert "database" in data["telemetry"]
    assert "status" in data["telemetry"]["database"]
    
    # Value type validation
    assert float(data["telemetry"]["event_loop_lag_ms"]) >= 0
    assert data["app"] == "Bienestar APP"

@pytest.mark.asyncio
async def test_ready_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/ready")

    assert response.status_code == 200
    assert response.json() == {"ready": True}

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.db.models import WorkoutSession

@pytest.mark.asyncio
async def test_ingest_workout_telemetry_returns_202(client: AsyncClient, db_session):
    payload = {
        "started_at": "2026-06-07T10:00:00Z",
        "ended_at": "2026-06-07T11:00:00Z",
        "total_volume_kg": 15000.0,
        "perceived_rpe": 8,
        "logs": [
            {
                "exercise_name": "Squat",
                "sets": 4,
                "reps": 10,
                "weight_kg": 100.0
            }
        ]
    }
    
    # 1. Enviar telemetría
    response = await client.post("/api/v1/telemetry/workout", json=payload)
    
    # 2. Validar Respuesta Inmediata (Event-Driven)
    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "Accepted"
    assert "session_id" in data
    
    session_id = data["session_id"]
    
    # 3. Validar Estado en BD
    stmt = select(WorkoutSession).where(WorkoutSession.id == session_id)
    res = await db_session.execute(stmt)
    db_session_obj = res.scalar_one_or_none()
    
    assert db_session_obj is not None
    assert db_session_obj.math_status == "PENDING"
    assert db_session_obj.total_volume_kg == 15000.0

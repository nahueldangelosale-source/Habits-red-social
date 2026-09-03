import pytest
from httpx import AsyncClient, ASGITransport
import uuid

# Assuming tests run against the main FastAPI app
try:
    from app.main import app
    from app.middleware.auth import get_current_user, get_current_professional, TokenData
    from app.db.rbac import User
except ImportError:
    pytest.skip("Skipping because of missing app configuration", allow_module_level=True)


async def override_get_current_user():
    return TokenData(
        user_id=uuid.uuid4(),
        tenant_id=uuid.uuid4(),
        role="professional"
    )


import pytest_asyncio

@pytest_asyncio.fixture(autouse=True)
async def dispose_engine():
    from app.db.connection import engine
    await engine.dispose()
    yield
    await engine.dispose()


@pytest.fixture
def mock_auth():
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_current_professional] = override_get_current_user
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_workouts_unauthorized():
    """Verify endpoint returns 401 without token."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/api/v1/workouts/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_workouts_authorized(mock_auth):
    """Verify endpoint returns 200 with empty list for mocked professional."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/api/v1/workouts/")
    
    assert response.status_code == 200
    assert response.json() == []

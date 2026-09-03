import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.middleware.auth import create_magic_link_token, create_b2c_refresh_token

@pytest.mark.asyncio
async def test_auth_b2c_magic_link_redeem_and_refresh():
    athlete_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    
    # 1. Generate magic link token
    magic_token = create_magic_link_token(athlete_id=athlete_id, tenant_id=tenant_id)
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 2. Redeem magic link
        redeem_res = await ac.post(
            "/api/v1/auth-b2c/redeem",
            json={"magic_token": magic_token}
        )
        assert redeem_res.status_code == 200, f"Redeem failed: {redeem_res.text}"
        data = redeem_res.json()
        assert "access_token" in data
        assert data["athlete_id"] == str(athlete_id)
        assert data["tenant_id"] == str(tenant_id)
        
        # Check refresh cookie was set
        assert "refresh_token" in redeem_res.cookies
        refresh_cookie = redeem_res.cookies["refresh_token"]
        
        # 3. Refresh access token using cookie
        ac.cookies.set("refresh_token", refresh_cookie)
        refresh_res = await ac.post("/api/v1/auth-b2c/refresh")
        assert refresh_res.status_code == 200, f"Refresh failed: {refresh_res.text}"
        refresh_data = refresh_res.json()
        assert "access_token" in refresh_data
        assert refresh_data["access_token"] is not None
        
        # 4. Logout
        logout_res = await ac.post("/api/v1/auth-b2c/logout")
        assert logout_res.status_code == 200

@pytest.mark.asyncio
async def test_auth_b2c_invalid_magic_token():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post(
            "/api/v1/auth-b2c/redeem",
            json={"magic_token": "invalid.jwt.token"}
        )
        assert res.status_code == 401

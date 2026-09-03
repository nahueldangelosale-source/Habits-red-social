"""
Auth B2C Router — Magic Link Redemption, Token Refresh & Logout
Endpoints para el flujo de autenticación sin contraseña de atletas (B2C).

Flujo:
1. Coach genera Magic Link → atleta recibe URL con token efímero (72h)
2. Atleta hace clic → POST /redeem → recibe access_token + refresh_token (HttpOnly cookie)
3. access_token expira (30min) → POST /refresh → nuevo access_token transparente
4. POST /logout → invalida refresh cookie
"""

from fastapi import APIRouter, HTTPException, Response, Request, status
from pydantic import BaseModel
from typing import Optional
from jose import jwt, JWTError
from uuid import UUID

from app.config import get_settings
from app.middleware.auth import (
    create_b2c_access_token,
    create_b2c_refresh_token,
)

settings = get_settings()
router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class RedeemRequest(BaseModel):
    magic_token: str
    req_id: Optional[str] = None


class RedeemResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    athlete_id: str
    tenant_id: str


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Helpers ──────────────────────────────────────────────────────────────────

def _decode_token(token: str, expected_type: Optional[str] = None) -> dict:
    """Decode and validate a JWT token, optionally checking the 'type' claim."""
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {str(e)}"
        )

    if expected_type and payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Tipo de token incorrecto. Esperado: {expected_type}, recibido: {payload.get('type')}"
        )

    sub = payload.get("sub")
    tenant_id = payload.get("tenant_id")
    if not sub or not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token incompleto: faltan campos sub o tenant_id"
        )

    return payload


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set the refresh token as an HttpOnly secure cookie."""
    is_production = settings.environment == "production"
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,  # 30 days
        path="/api/v1/auth-b2c",
    )


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/redeem", response_model=RedeemResponse)
async def redeem_magic_link(body: RedeemRequest, response: Response):
    """
    Canjea un Magic Link Token efímero (72h) por un par access+refresh.

    El Magic Link fue generado por el Coach y enviado al atleta vía WhatsApp/Email.
    Una vez canjeado, el jti se marca como quemado en Redis (single-use).
    """
    payload = _decode_token(body.magic_token, expected_type="magic_link")

    athlete_id = UUID(payload["sub"])
    tenant_id = UUID(payload["tenant_id"])
    session_version = payload.get("session_version", 1)

    # Single-use burn: verificar y marcar jti en Redis
    jti = payload.get("jti")
    if jti:
        try:
            from app.services.redis_client import get_redis
            redis = await get_redis()
            if redis:
                burned_key = f"burned_jti:{jti}"
                already_used = await redis.get(burned_key)
                if already_used:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Este enlace ya fue utilizado. Solicitá uno nuevo a tu entrenador."
                    )
                await redis.setex(burned_key, 72 * 3600, "1")
        except HTTPException:
            raise
        except Exception:
            # Redis no disponible — permitir redemption pero logear warning
            import structlog
            structlog.get_logger().warning("redis_unavailable_for_jti_burn", jti=jti)

    access_token = create_b2c_access_token(athlete_id, tenant_id, session_version)
    refresh_token = create_b2c_refresh_token(athlete_id, tenant_id, session_version)

    _set_refresh_cookie(response, refresh_token)

    return RedeemResponse(
        access_token=access_token,
        athlete_id=str(athlete_id),
        tenant_id=str(tenant_id),
    )


@router.post("/refresh", response_model=RefreshResponse)
async def refresh_access_token(request: Request, response: Response):
    """
    Renueva el access_token usando el refresh_token de la HttpOnly cookie.

    Llamado automáticamente por el interceptor del frontend (client.ts)
    cuando un request retorna 401.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontró refresh token. Inicie sesión nuevamente."
        )

    payload = _decode_token(refresh_token, expected_type="refresh")

    athlete_id = UUID(payload["sub"])
    tenant_id = UUID(payload["tenant_id"])
    session_version = payload.get("session_version", 1)

    # Emitir nuevo access token
    new_access = create_b2c_access_token(athlete_id, tenant_id, session_version)

    # Rotar refresh token (security best practice)
    new_refresh = create_b2c_refresh_token(athlete_id, tenant_id, session_version)
    _set_refresh_cookie(response, new_refresh)

    return RefreshResponse(access_token=new_access)


@router.post("/logout")
async def logout_b2c(response: Response):
    """
    Invalida la sesión B2C eliminando la cookie de refresh token.
    """
    response.delete_cookie(
        key="refresh_token",
        path="/api/v1/auth-b2c",
    )
    return {"detail": "Sesión cerrada correctamente."}

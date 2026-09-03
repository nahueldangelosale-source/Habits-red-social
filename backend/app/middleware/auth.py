"""
Security Middleware - Authentication & Authorization
Implementa JWT verification, API keys, y tenant isolation.
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from jose import JWTError, jwt
from pydantic import BaseModel

from app.config import get_settings

settings = get_settings()

# =============================================================================
# PASSWORD HASHING (using bcrypt directly — passlib has Python 3.13 compat issues)
# =============================================================================

import bcrypt as _bcrypt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica contraseña contra hash bcrypt."""
    return _bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def get_password_hash(password: str) -> str:
    """Genera hash bcrypt de contraseña."""
    return _bcrypt.hashpw(
        password.encode("utf-8"),
        _bcrypt.gensalt(),
    ).decode("utf-8")


# =============================================================================
# JWT TOKENS
# =============================================================================

class TokenPayload(BaseModel):
    """Payload del JWT token."""
    sub: str  # Subject (user_id o professional_id)
    tenant_id: str
    role: str  # "professional", "client", "admin"
    exp: datetime
    iat: datetime


class TokenData(BaseModel):
    """Datos extraídos del token."""
    user_id: UUID
    tenant_id: UUID
    role: str


import uuid as uuid_pkg

def create_access_token(
    user_id: UUID,
    tenant_id: UUID,
    role: str = "professional",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Crea un JWT access token.
    
    Args:
        user_id: UUID del usuario
        tenant_id: UUID del tenant
        role: Rol del usuario
        expires_delta: Tiempo de expiración personalizado
        
    Returns:
        JWT token string
    """
    if not settings.secret_key or settings.secret_key == "dev-secret-key-change-in-production":
        raise ValueError("SECRET_KEY must be set in production")
    
    now = datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    
    payload = {
        "sub": str(user_id),
        "tenant_id": str(tenant_id),
        "role": role,
        "exp": expire,
        "iat": now,
    }
    
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_invitation_token(email: str, role: str, tenant_id: UUID) -> str:
    """
    Crea un token JWT transitorio (24h) para invitaciones de profesionales.
    """
    now = datetime.utcnow()
    expire = now + timedelta(hours=24)
    
    payload = {
        "sub": email,
        "tenant_id": str(tenant_id),
        "role": role,
        "type": "invitation",
        "jti": str(uuid_pkg.uuid4()),
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def create_magic_link_token(athlete_id: UUID, tenant_id: UUID) -> str:
    """
    Crea un token efímero de 72 horas para la Fricción Cero del B2C.
    Incluye un 'jti' único para lograr Idempotencia mediante Redis.
    """
    now = datetime.utcnow()
    expire = now + timedelta(hours=72)
    
    payload = {
        "sub": str(athlete_id),
        "tenant_id": str(tenant_id),
        "role": "b2c_athlete",
        "type": "magic_link",
        "jti": str(uuid_pkg.uuid4()), # Crucial for single-use burn mechanism
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_b2c_access_token(athlete_id: UUID, tenant_id: UUID, session_version: int = 1) -> str:
    """
    Access Token de corta duración (30 min) para el B2C.
    Viaja en cabecera Authorization: Bearer.
    """
    now = datetime.utcnow()
    expire = now + timedelta(minutes=30)
    
    payload = {
        "sub": str(athlete_id),
        "tenant_id": str(tenant_id),
        "role": "b2c_athlete",
        "type": "access",
        "session_version": session_version,
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_b2c_refresh_token(athlete_id: UUID, tenant_id: UUID, session_version: int = 1) -> str:
    """
    Refresh Token de larga duración (30 días).
    Viaja exclusivamente en HttpOnly Cookie.
    """
    now = datetime.utcnow()
    expire = now + timedelta(days=30)
    
    payload = {
        "sub": str(athlete_id),
        "tenant_id": str(tenant_id),
        "role": "b2c_athlete",
        "type": "refresh",
        "session_version": session_version,
        "jti": str(uuid_pkg.uuid4()), # Crucial para invalidación granular (redis blocklist)
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_transfer_token(athlete_id: UUID, tenant_id: UUID, session_version: int = 1) -> str:
    """
    One-Time Transfer Token (TTL 30s) usado por Desktop para reclamar 
    las cookies y accesos después de que el móvil validó el Magic Link.
    """
    now = datetime.utcnow()
    expire = now + timedelta(seconds=30)
    
    payload = {
        "sub": str(athlete_id),
        "tenant_id": str(tenant_id),
        "role": "b2c_athlete",
        "type": "transfer",
        "session_version": session_version,
        "jti": str(uuid_pkg.uuid4()),
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)



def decode_access_token(token: str) -> TokenData:
    """
    Decodifica y valida un JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData con información del usuario
        
    Raises:
        HTTPException 401 si el token es inválido
    """
    # 🔒 SECURITY: Hardcoded demo token removed (was granting unauthenticated ADMIN access)
    try:
        payload = jwt.decode(
            token, 
            settings.secret_key, 
            algorithms=[settings.algorithm]
        )
        user_id = payload.get("sub")
        tenant_id = payload.get("tenant_id")
        role = payload.get("role", "client")
        
        if not user_id or not tenant_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: faltan campos requeridos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(
            user_id=UUID(user_id),
            tenant_id=UUID(tenant_id),
            role=role,
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# =============================================================================
# SECURITY DEPENDENCIES
# =============================================================================

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)

# API Key header scheme
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    api_key: Optional[str] = Depends(api_key_header),
) -> TokenData:
    """
    Dependency: Obtiene el usuario actual del token o API key.
    
    Soporta:
    - Authorization: Bearer <jwt_token>
    - X-API-Key: <api_key>
    """
    import asyncio
    # Intentar Bearer token primero
    if credentials:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, decode_access_token, credentials.credentials)
    
    # Intentar API Key
    if api_key:
        # TODO: Validar API key contra base de datos
        # Por ahora, usar formato simple: tenant_id:user_id:secret
        try:
            parts = api_key.split(":")
            if len(parts) >= 3:
                return TokenData(
                    user_id=UUID(parts[1]),
                    tenant_id=UUID(parts[0]),
                    role="api_client",
                )
        except (ValueError, IndexError):
            pass
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key inválida",
        )
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token o API Key requerido",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_professional(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    """Dependency: Requiere rol 'professional', 'admin' o 'superuser'."""
    if current_user.role.lower() not in ["professional", "admin", "superuser", "super_admin", "personal_trainer", "nutritionist"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de profesional",
        )
    return current_user


async def get_current_admin(
    current_user: TokenData = Depends(get_current_user),
) -> TokenData:
    """Dependency: Requiere rol 'admin' o 'superuser'."""
    if current_user.role.lower() not in ["admin", "superuser", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de administrador",
        )
    return current_user


# =============================================================================
# OPTIONAL AUTH (Para endpoints mixtos)
# =============================================================================

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    api_key: Optional[str] = Depends(api_key_header),
) -> Optional[TokenData]:
    """
    Dependency: Obtiene usuario si hay token, None si no.
    Para endpoints que funcionan con o sin auth.
    """
    try:
        return await get_current_user(credentials, api_key)
    except HTTPException:
        return None


# =============================================================================
# TENANT ISOLATION
# =============================================================================

class TenantContext:
    """Contexto del tenant actual para el request."""
    
    def __init__(self, tenant_id: UUID, user_id: UUID, role: str):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.role = role
    
    def verify_access(self, resource_tenant_id: UUID) -> bool:
        """Verifica que el usuario puede acceder al recurso."""
        if self.role == "admin":
            return True  # Admin puede acceder a todo
        return self.tenant_id == resource_tenant_id


async def get_tenant_context(
    current_user: TokenData = Depends(get_current_user),
) -> TenantContext:
    """Dependency: Obtiene contexto de tenant para isolation."""
    return TenantContext(
        tenant_id=current_user.tenant_id,
        user_id=current_user.user_id,
        role=current_user.role,
    )

async def require_pro_tier(
    tenant_context: TenantContext = Depends(get_tenant_context),
    db: "AsyncSession" = Depends(lambda: None) # Avoid circular import, we will manually resolve get_db
) -> TenantContext:
    """Dependency: Requiere suscripción PRO activa para acceso avanzado B2B."""
    from app.db.models import Tenant, SubscriptionTier
    from app.db.connection import get_db
    from sqlalchemy import select
    from fastapi import Depends
    
    # Resolviendo dependencias dinámicamente para evitar circularidad
    gen = get_db()
    db_session = await gen.__anext__()
    
    try:
        query = select(Tenant).where(Tenant.id == tenant_context.tenant_id)
        result = await db_session.execute(query)
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant no encontrado",
            )
            
        # Tolerancia FinOps (Dunning de 7 días: past_due sigue siendo válido, pending es un intermedio)
        if tenant.subscription_tier != SubscriptionTier.PRO or tenant.subscription_status not in ["active", "past_due", "trialing"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Requiere actualización a suscripción Pro Suite."
            )
            
        return tenant_context
    finally:
        await gen.aclose()


# =============================================================================
# WORKFLOW J: THE GLASS WALL (Elegant Degradation - Phase 25)
# =============================================================================

async def verify_active_subscription(
    request: Request,
    tenant_context: TenantContext = Depends(get_tenant_context),
) -> TenantContext:
    """
    Dependency: B2B Write Lock (The Glass Wall).
    Bloquea las peticiones de escritura (POST/PUT/PATCH/DELETE) del Coach si el gimnasio (Tenant)
    está en mora ('past_due'). Permite GET para lectura (Degradación Elegante).
    Arroja un HTTP 402 Payment Required para forzar la regularización.
    """
    from app.db.models import Tenant
    from app.db.connection import get_db
    from sqlalchemy import select
    
    gen = get_db()
    db_session = await gen.__anext__()
    
    try:
        query = select(Tenant).where(Tenant.id == tenant_context.tenant_id)
        result = await db_session.execute(query)
        tenant = result.scalar_one_or_none()
        
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant no encontrado."
            )
            
        # 1. Bloqueo de Escritura si es 'past_due' (The Glass Wall)
        # Solo permitimos GET. POST, PUT, PATCH, DELETE son bloqueados.
        if tenant.subscription_status == "past_due" and request.method != "GET":
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Acceso restringido: El centro se encuentra en modo de Solo Lectura por irregularidad en la suscripción (past_due)."
            )
            
        return tenant_context
    finally:
        await gen.aclose()



"""
Middleware package
Security, rate limiting, and request processing.
"""

from app.middleware.auth import (
    get_current_user,
    get_current_professional,
    get_current_admin,
    get_optional_user,
    get_tenant_context,
    create_access_token,
    decode_access_token,
    TokenData,
    TenantContext,
)

from app.middleware.rate_limit import (
    limiter,
    setup_rate_limiting,
    LIMITS,
)

__all__ = [
    # Auth
    "get_current_user",
    "get_current_professional", 
    "get_current_admin",
    "get_optional_user",
    "get_tenant_context",
    "create_access_token",
    "decode_access_token",
    "TokenData",
    "TenantContext",
    # Rate Limiting
    "limiter",
    "setup_rate_limiting",
    "LIMITS",
]

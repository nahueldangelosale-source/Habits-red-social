"""
Rate Limiting Middleware
Protección contra abuso de APIs usando slowapi.
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# =============================================================================
# LIMITER CONFIGURATION
# =============================================================================

def get_identifier(request):
    """
    Obtiene identificador para rate limiting.
    Prioridad: API Key > User ID > IP Address
    """
    # Intentar extraer de header
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return f"api:{api_key[:16]}"  # Primeros 16 chars
    
    # Intentar desde Authorization (si ya fue parseado)
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        # Usar hash del token para no exponer
        return f"jwt:{hash(auth)}"
    
    # Fallback a IP
    return get_remote_address(request)


# Crear limiter
limiter = Limiter(
    key_func=get_identifier,
    default_limits=["100/minute"],  # Default global
    storage_uri="memory://",  # En producción usar Redis
)


# =============================================================================
# RATE LIMIT DEFINITIONS
# =============================================================================

# Por tipo de endpoint
LIMITS = {
    # AI-intensive endpoints (costosos)
    "ai_heavy": "10/minute",      # Voice-to-Chart, Magic Import
    
    # AI-moderate
    "ai_moderate": "30/minute",   # WhatsApp responses
    
    # Standard APIs
    "standard": "60/minute",      # CRUD operations
    
    # Public/Health
    "public": "200/minute",       # Health checks, docs
    
    # Auth endpoints (más estrictos)
    "auth": "5/minute",           # Login, token refresh
}


def get_limit_for_endpoint(endpoint_type: str) -> str:
    """Obtiene el límite para un tipo de endpoint."""
    return LIMITS.get(endpoint_type, LIMITS["standard"])


# =============================================================================
# SETUP FUNCTION
# =============================================================================

def setup_rate_limiting(app):
    """
    Configura rate limiting en la aplicación FastAPI.
    
    Usage:
        from app.middleware.rate_limit import setup_rate_limiting, limiter
        setup_rate_limiting(app)
        
        @app.get("/endpoint")
        @limiter.limit("10/minute")
        async def endpoint(request: Request):
            ...
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

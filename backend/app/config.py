"""
Bienestar APP - Application Configuration
Settings loaded from environment variables with Pydantic validation.

SECURITY: En producción, TODAS las variables críticas deben venir de .env
"""

import os
from functools import lru_cache
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable binding."""
    
    # Environment
    environment: str = "development"  # development, staging, production
    
    # Database
    database_url: str = "postgresql+asyncpg://postgres:bienestar_dev_2026@localhost:5432/bienestar"
    
    # OpenAI
    openai_api_key: str = ""
    
    # Gemini / Google AI (Phase 26)
    google_api_key: str = ""
    
    # Resend (Email Service - Phase 25)
    resend_api_key: str = ""
    
    # Security - NO DEFAULTS EN PRODUCCIÓN
    secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS - Dominios permitidos (separados por coma)
    cors_origins: str = "http://localhost:3000,http://localhost:8100,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
    
    # WhatsApp Business API
    whatsapp_verify_token: str = ""
    whatsapp_access_token: str = ""
    whatsapp_phone_number_id: str = ""
    
    # Stripe
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    
    # Google OAuth 2.0 (Phase 17)
    google_client_id: str = ""
    google_client_secret: str = ""
    
    # Rate Limiting
    rate_limit_redis_url: Optional[str] = None  # None = in-memory (DEPRECATED: use redis_url)
    
    # Redis (shared connection for Revenue Guard, Rate Limiting, WebSocket Pub/Sub)
    redis_url: str = "redis://localhost:6379"
    
    # Mercado Pago
    mp_access_token: str = ""
    mp_webhook_secret: str = ""  # HMAC secret for webhook signature verification

    # Feature Flags
    ff_compassion_engine: bool = False
    ff_magic_import_v2: bool = True
    ff_checkout_v2: bool = False  # Dark Launch B2C Checkout
    ff_exclude_ghost_athletes: bool = True  # Oculta Atletas Cero de analíticas y workers

    # Application
    app_name: str = "Bienestar APP"
    debug: bool = False  # Default a False para seguridad
    
    @field_validator('secret_key')
    @classmethod
    def validate_secret_key(cls, v, info):
        """Valida que secret_key esté configurado en producción."""
        # Acceder al environment desde los datos
        values = info.data
        env = values.get('environment', 'development')
        
        if env == 'production' and (not v or v == "dev-secret-key-change-in-production"):
            raise ValueError(
                "SECRET_KEY must be set in production. "
                "Generate with: openssl rand -hex 32"
            )
        
        # En development, generar key temporal si no existe
        if not v:
            import secrets
            return secrets.token_hex(32)
        
        return v
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Convierte string de CORS origins a lista."""
        if not self.cors_origins:
            return []
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Verifica si estamos en producción."""
        return self.environment == "production"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"  # Ignorar variables no definidas
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance for dependency injection."""
    return Settings()


def validate_production_config():
    """
    Valida configuración crítica para producción.
    Llamar durante startup en producción.
    """
    settings = get_settings()
    errors = []
    
    if settings.is_production:
        if not settings.secret_key:
            errors.append("SECRET_KEY is required")
        if settings.debug:
            errors.append("DEBUG must be False in production")
        cors_list = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
        if "*" in cors_list:
            errors.append("CORS_ORIGINS cannot be '*' in production")
        if not settings.database_url or "localhost" in settings.database_url:
            errors.append("DATABASE_URL must point to production database")
    
    if errors:
        raise ValueError(f"Production configuration errors: {', '.join(errors)}")

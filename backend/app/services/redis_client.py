"""
Shared async Redis client for Bienestar APP.
Used by: Revenue Guard, Rate Limiting, WebSocket Pub/Sub.

Provides a singleton connection pool reused across the application.
"""

from typing import Optional

import redis.asyncio as aioredis
import structlog

from app.config import get_settings

logger = structlog.get_logger()
settings = get_settings()

_redis_client: Optional[aioredis.Redis] = None

def _init_redis():
    global _redis_client
    if _redis_client is None:
        redis_url = settings.redis_url
        _redis_client = aioredis.from_url(
            redis_url,
            decode_responses=True,
            max_connections=20,
        )
    return _redis_client

# Singleton instance for simple imports
# Note: In async contexts, use get_redis() for better control, 
# but this provides the object name expected by legacy routers.
redis_client = _init_redis()

async def get_redis() -> aioredis.Redis:
    """
    Returns the shared async Redis connection.
    Verifies connectivity on first call.
    """
    client = _init_redis()
    # Verify connectivity if needed
    try:
        await client.ping()
    except Exception as e:
        logger.error("redis_ping_failed", error=str(e))
    return client


async def close_redis():
    """Gracefully close Redis connection pool. Call on app shutdown."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("redis_disconnected")

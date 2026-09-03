"""
Bienestar APP - Conexión a Base de Datos (Proxy)
Centraliza la lógica en app.db.database para evitar duplicidad de pools.
"""
from app.db.database import (
    Base,
    get_db,
    get_async_db,
    engine,
    async_session_maker,
    sync_engine,
    sync_session_maker
)

import asyncio
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configuración del Sweeper
BATCH_SIZE = 50
INTERVAL_SECONDS = 5

async def check_emergency_brake(session: AsyncSession) -> bool:
    """Verifica si el equipo de soporte activó el 'Pause DLQ Sweeper' en el Watchtower."""
    try:
        # Asume que tenemos una tabla `config_sweeper_settings` o similar.
        # Fallback a falso si la tabla no existe durante la prueba de concepto.
        result = await session.execute(text("SELECT is_paused FROM config_sweeper_settings LIMIT 1"))
        row = result.fetchone()
        return row[0] if row else False
    except Exception as e:
        logger.warning(f"No se pudo consultar el Emergency Brake: {e}. Asumiendo NO PAUSADO.")
        return False

async def drain_dlq_batch(session: AsyncSession):
    """
    Procesa un lote de mensajes de la DLQ usando estrategia LIFO para pagos legítimos (Prioridad de Retención).
    """
    # 1. Obtenemos un lote de pagos fallidos ordenados por más recientes (LIFO en contexto de recuperación de Revenue)
    fetch_query = text("""
        SELECT id, payload, retry_count 
        FROM financial_dlq 
        WHERE status = 'PENDING' 
        ORDER BY created_at DESC 
        LIMIT :batch_size
        FOR UPDATE SKIP LOCKED
    """)
    
    result = await session.execute(fetch_query, {"batch_size": BATCH_SIZE})
    messages = result.fetchall()
    
    if not messages:
        return 0

    logger.info(f"Drenando {len(messages)} mensajes de la DLQ...")

    for msg in messages:
        # Aquí simularíamos la re-evaluación del webhook financiero contra PostgreSQL y Redis.
        # Al ser un script de reconciliación, insertaremos directamente si no existe.
        
        # Simulamos un procesamiento exitoso
        update_query = text("""
            UPDATE financial_dlq 
            SET status = 'PROCESSED', processed_at = NOW() 
            WHERE id = :msg_id
        """)
        await session.execute(update_query, {"msg_id": msg.id})
    
    await session.commit()
    return len(messages)

async def sweeper_loop():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI.replace('postgresql://', 'postgresql+asyncpg://'), pool_size=5)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    logger.info("Iniciando Financial Reconciliation Sweeper (Leaky Bucket)...")

    while True:
        try:
            async with async_session() as session:
                is_paused = await check_emergency_brake(session)
                if is_paused:
                    logger.info("Sweeper PAUSADO por Emergency Brake. Esperando...")
                    await asyncio.sleep(15)
                    continue
                
                processed_count = await drain_dlq_batch(session)
                
                if processed_count > 0:
                    # Control de Flujo (Leaky Bucket) para evitar Thundering Herd en la DB
                    logger.info(f"Lote procesado. Aplicando límite de tasa ({INTERVAL_SECONDS}s)...")
                    await asyncio.sleep(INTERVAL_SECONDS)
                else:
                    # Si no hay mensajes, backoff normal
                    await asyncio.sleep(10)
        
        except Exception as e:
            logger.error(f"Error crítico en Sweeper Loop: {e}")
            await asyncio.sleep(30) # Backoff tras error

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    # Ignorar errores de event loop cerrado al salir
    try:
        asyncio.run(sweeper_loop())
    except KeyboardInterrupt:
        logger.info("Sweeper detenido manualmente.")

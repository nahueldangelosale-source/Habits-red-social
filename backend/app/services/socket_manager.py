import asyncio
import json
import logging
from typing import Dict, List
from fastapi import WebSocket
import redis.asyncio as aioredis
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class ConnectionManager:
    """
    Gestor de Conexiones WebSocket escalable (Fase 61: The Real-Time Fabric).
    Utiliza Redis Pub/Sub (Fire-and-Forget) para coordinar mensajes B2C y B2B
    evitando saturar el Event Loop de FastAPI.
    """
    def __init__(self):
        # Mapea tenant_id -> Lista de WebSockets locales
        self.tenant_connections: Dict[str, List[WebSocket]] = {}
        
        # Conexión Redis
        redis_url = getattr(settings, "redis_url", "redis://localhost:6379")
        self.redis = aioredis.from_url(redis_url, decode_responses=True)
        self.pubsub = self.redis.pubsub()
        self.channel_name = "ws_tenant_events"
        self._listener_task = None

    async def _listen(self):
        """Escucha mensajes de Redis Pub/Sub y los distribuye a los WebSockets locales del Tenant."""
        try:
            await self.pubsub.subscribe(self.channel_name)
            logger.info(f"🎧 Suscrito a canal Redis Pub/Sub: {self.channel_name}")
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        tenant_id = data.get("tenant_id")
                        payload = data.get("payload")
                        
                        # Si hay WebSockets conectados localmente para este tenant, transmitir
                        if tenant_id and tenant_id in self.tenant_connections:
                            disconnected = []
                            for ws in self.tenant_connections[tenant_id]:
                                try:
                                    await ws.send_json(payload)
                                except Exception as e:
                                    logger.warning(f"Error enviando mensaje a socket en tenant {tenant_id}: {e}")
                                    disconnected.append(ws)
                            
                            # Limpiar desconectados silenciosos
                            for ws in disconnected:
                                self.disconnect(ws, tenant_id)
                                
                    except json.JSONDecodeError:
                        logger.error("Error decodificando mensaje de Redis Pub/Sub")
        except asyncio.CancelledError:
            logger.info("🛑 El listener de Redis Pub/Sub fue cancelado (Shutdown).")
        except Exception as e:
            logger.error(f"Error crítico en _listen de ConnectionManager: {e}")

    async def connect(self, websocket: WebSocket, tenant_id: str):
        """Acepta un WS, lo agrupa por tenant y asegura que el listener esté corriendo."""
        await websocket.accept()
        if tenant_id not in self.tenant_connections:
            self.tenant_connections[tenant_id] = []
        self.tenant_connections[tenant_id].append(websocket)
        logger.info(f"🔌 Nuevo socket conectado al Tenant {tenant_id}. (Total local: {len(self.tenant_connections[tenant_id])})")
        
        # Iniciar la tarea de escucha en background si es la primera conexión del worker
        if self._listener_task is None:
            self._listener_task = asyncio.create_task(self._listen())

    def disconnect(self, websocket: WebSocket, tenant_id: str):
        """Remueve la conexión del tenant."""
        if tenant_id in self.tenant_connections:
            if websocket in self.tenant_connections[tenant_id]:
                self.tenant_connections[tenant_id].remove(websocket)
            if not self.tenant_connections[tenant_id]:
                del self.tenant_connections[tenant_id]
        logger.info(f"❌ Socket desconectado del Tenant {tenant_id}.")

    async def broadcast_to_tenant(self, tenant_id: str, payload: dict):
        """
        [FIRE-AND-FORGET] Publica un mensaje en Redis para todos los clientes de un Tenant.
        Invocado por los endpoints REST estándar sin bloquear la latencia HTTP.
        """
        data = {
            "tenant_id": tenant_id,
            "payload": payload
        }
        await self.redis.publish(self.channel_name, json.dumps(data))

    async def shutdown(self):
        """Limpia la conexión Redis y cancela el listener al apagar Uvicorn."""
        if self._listener_task:
            self._listener_task.cancel()
            try:
                await self._listener_task
            except asyncio.CancelledError:
                pass
        try:
            await self.pubsub.unsubscribe(self.channel_name)
        except Exception:
            pass
        try:
            await self.redis.close()
        except Exception:
            pass

manager = ConnectionManager()

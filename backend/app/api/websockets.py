from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from starlette.websockets import WebSocketState
import asyncio
import logging

from app.middleware.auth import decode_access_token
from app.services.socket_manager import manager

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/tenant/{tenant_id}")
async def websocket_tenant_endpoint(
    websocket: WebSocket, 
    tenant_id: str, 
    token: str = Query(...)
):
    """
    Zero-Trust WebSocket Connection.
    Valida el JWT desde el Query Parameter (ya que los navegadores no envían headers en WS).
    """
    try:
        # Validación O(1) de firma JWT (Offloaded al ThreadPool para proteger el Event Loop)
        loop = asyncio.get_running_loop()
        token_data = await loop.run_in_executor(None, decode_access_token, token)
        
        # Validación de cruce de Tenant
        if str(token_data.tenant_id) != tenant_id:
            logger.warning(f"WS Rechazado: Tenant Mismatch. User {token_data.user_id} intentó acceder a {tenant_id}")
            await websocket.close(code=1008, reason="Tenant Mismatch")
            return

        # Aceptar la conexión y agrupar por tenant
        await manager.connect(websocket, tenant_id)
        
        # Ping inicial de prueba
        await websocket.send_json({"event_type": "CONNECTED", "message": "Zero-Trust WS Estabilshed"})

        # Bucle de retención pasiva (El servidor solo escucha desconexiones o pings)
        while True:
            data = await websocket.receive_text()
            if data == "PING":
                await websocket.send_json({"event_type": "PONG"})
                
    except Exception as e:
        # Si la decodificación del token falla (expirado o firma inválida), decode_access_token lanza HTTPException
        logger.warning(f"WS Rechazado: {e}")
        if websocket.client_state == WebSocketState.CONNECTING:
            await websocket.close(code=1008, reason="Policy Violation / Invalid Token")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, tenant_id)
        logger.info(f"WS Desconectado del tenant {tenant_id}")

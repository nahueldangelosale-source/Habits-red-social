from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import asyncio

from app.services.redis_client import redis_client

router = APIRouter()

async def event_generator(request: Request, athlete_id: str, last_event_id: str):
    stream_key = f"notifications:athlete:{athlete_id}"
    # Si el cliente envía Last-Event-ID, empezamos desde ahí; si no, desde el último ($)
    last_id_processed = last_event_id if last_event_id else "$"

    while True:
        if await request.is_disconnected():
            break

        # Consultamos a Redis de forma no bloqueante (bloqueo por 1000ms)
        # xread returns a list of tuples: [(b'stream_key', [(b'message_id', {b'field': b'value', ...})])]
        try:
            events = await redis_client.xread({stream_key: last_id_processed}, count=1, block=1000)
            
            if events:
                for stream, event_list in events:
                    for e_id, e_data in event_list:
                        # Decodificar bytes
                        e_id_str = e_id.decode('utf-8') if isinstance(e_id, bytes) else e_id
                        event_type = e_data[b'event'].decode('utf-8') if b'event' in e_data else "message"
                        data_str = e_data[b'data'].decode('utf-8') if b'data' in e_data else ""
                        
                        # El ID de Redis mapea directo al estándar SSE id:
                        yield f"id: {e_id_str}\n"
                        yield f"event: {event_type}\n"
                        yield f"data: {data_str}\n\n"
                        
                        last_id_processed = e_id_str
        except Exception as e:
            pass
                
        await asyncio.sleep(0.1)

@router.get("/stream")
async def sse_notifications(request: Request, athlete_id: str):
    # El navegador inyecta automáticamente este encabezado en las reconexiones
    last_event_id = request.headers.get("Last-Event-ID", None)
    
    return StreamingResponse(
        event_generator(request, athlete_id, last_event_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Crítico para evitar que Nginx buferice el stream
        }
    )

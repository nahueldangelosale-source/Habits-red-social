import json

async def buffer_streak_event(redis_client, athlete_id: str, payload: dict):
    stream_key = f"notifications:athlete:{athlete_id}"
    
    # Serializamos el payload de datos
    event_data = {
        "event": "streak_ignited",
        "data": json.dumps(payload)
    }
    
    # XADD inserta el evento con un ID autogenerado por Redis (timestamp-secuencia)
    # MAXLEN ~ 5 asegura que solo conservamos los últimos 5 eventos del usuario
    event_id = await redis_client.xadd(stream_key, event_data, maxlen=5, approximate=True)
    return event_id

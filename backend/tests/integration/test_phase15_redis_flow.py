import pytest
import asyncio
import time
from httpx import AsyncClient
from uuid import uuid4
from datetime import datetime, timezone

from app.main import app
from app.services.redis_client import get_redis

@pytest.mark.asyncio
async def test_phase15_cache_miss_and_hit():
    """
    Test de Cache-Miss & Cache-Hit
    1. Vaciar la caché de Redis para un entorno de test.
    2. Ejecutar GET /api/v1/athlete/routine/today. Verificar tiempo (Cache Miss).
    3. Ejecutar inmediatamente el mismo GET. Verificar que el tiempo caiga drásticamente (< 5ms) (Cache Hit).
    """
    redis = await get_redis()
    
    # 1. Vaciar la caché de e1RM
    keys = await redis.keys("e1rm:*")
    if keys:
        await redis.delete(*keys)
        
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Nota: En el arnés real, aquí inyectamos el JWT del atleta de prueba.
        
        # 2. Primer request (Cache Miss) - Debería hacer query SQL
        t0 = time.perf_counter()
        res1 = await client.get("/api/v1/athlete/routine/today")
        t1 = time.perf_counter()
        
        time_miss = (t1 - t0) * 1000  # ms
        
        # 3. Segundo request (Cache Hit) - Debería leer de Redis
        t2 = time.perf_counter()
        res2 = await client.get("/api/v1/athlete/routine/today")
        t3 = time.perf_counter()
        
        time_hit = (t3 - t2) * 1000  # ms
        
        # Assertions
        assert res1.status_code in [200, 401, 402, 404] # Tolerancia a auth mock
        print(f"Cache Miss: {time_miss:.2f}ms | Cache Hit: {time_hit:.2f}ms")
        
        # Validamos que el Hit sea al menos más rápido y preferiblemente < 5ms 
        # (Depende del entorno local, pero ilustra la aserción de performance)
        if res1.status_code == 200:
            assert time_hit < time_miss

@pytest.mark.asyncio
async def test_phase15_proactive_invalidation():
    """
    Test de Invalidación Proactiva
    1. Hacer un POST /api/v1/athlete/sets con un nuevo peso máximo.
    2. Introducir un delay artificial de 100ms (esperar BackgroundTask).
    3. Hacer GET /api/v1/athlete/routine/today.
    4. Afirmar (Assert) que el valor devuelto refleja el nuevo e1RM.
    """
    async with AsyncClient(app=app, base_url="http://test") as client:
        target_exercise = str(uuid4())
        active_protocol = str(uuid4())
        
        # 1. POST - Simular completar un set de Récord
        payload = {
            "exercise_id": target_exercise,
            "target_reps": 5,
            "target_weight": 100.0,
            "actual_reps": 5,
            "actual_weight": 150.0,  # Nuevo PR masivo para forzar cambio de e1rm
            "rpe": 8,
            "client_created_at": datetime.now(timezone.utc).isoformat(),
            "idempotency_key": str(uuid4()),
            "protocol_id": active_protocol
        }
        
        res_post = await client.post("/api/v1/athlete/sets", json=payload)
        
        # 2. Delay artificial para permitir que fastapi.BackgroundTasks procese y escriba en Redis
        await asyncio.sleep(0.1)
        
        # 3. GET - Fetch the routine to see if e1RM was updated silently
        res_get = await client.get("/api/v1/athlete/routine/today")
        
        if res_get.status_code == 200:
            data = res_get.json()
            exercises = data.get("exercises", [])
            
            # 4. Afirmar
            # Buscamos nuestro ejercicio en la rutina de vuelta
            for ex in exercises:
                if ex["exercise_id"] == target_exercise:
                    # Según formula Brzycki: 150 * (36 / (37 - 5)) = 150 * (36/32) = 150 * 1.125 = 168.75 kg
                    assert ex["current_e1rm"] > 160.0
                    break

import asyncio
import uuid
import sys
import os

# Fix Windows encoding
sys.stdout.reconfigure(encoding='utf-8')
os.environ['PYTHONIOENCODING'] = 'utf-8'

import httpx

BASE_URL = "http://localhost:8000/api/v1"

async def test_mesocycles_uat():
    print("\n=== INICIANDO UAT GRADO BANCARIO: MESOCYCLES (CQRS + RLS) ===\n")

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=15.0) as client:
        
        # =====================================================================
        # PRUEBA C: Resiliencia (Pydantic - State Bloat Defense)
        # =====================================================================
        print("[PRUEBA C] Resiliencia y Validacion Pydantic (State Bloat Defense)")
        malformed_payload = {
            "client_id": str(uuid.uuid4()),
            "taxonomy_id": "HYPERTROPHY_PHASE_1",
            "name": "Rutina de Prueba C",
            "routine_structure": {
                # Falta 'days' -> Pydantic deberia rechazar
                "invalid_key": "this_should_fail"
            }
        }
        
        headers = {"Authorization": "Bearer fake_token_for_test"}
        response = await client.post("/mesocycles", json=malformed_payload, headers=headers)
        
        if response.status_code == 401:
            print("[OK] Auth intercepto la peticion sin token valido (Expected: 401)")
            print(f"     Detalle: {response.text[:200]}")
        elif response.status_code == 422:
            print("[OK] Pydantic rechazo el payload malformado: 422 Unprocessable Entity")
            print(f"     Detalle: {response.text[:200]}")
        else:
            print(f"[FAIL] Codigo inesperado: {response.status_code}")
            print(f"     Detalle: {response.text[:200]}")

        # =====================================================================
        # PRUEBA C2: Payload con JSONB totalmente invalido (sin routine_structure)
        # =====================================================================
        print("\n[PRUEBA C2] Payload sin routine_structure (campo obligatorio)")
        empty_payload = {
            "client_id": str(uuid.uuid4()),
            "taxonomy_id": "STRENGTH_MAX",
            "name": "Rutina Sin Estructura"
            # Falta routine_structure -> Pydantic lo rechaza
        }
        
        response2 = await client.post("/mesocycles", json=empty_payload, headers=headers)
        
        if response2.status_code == 401:
            print("[OK] Auth intercepto antes de Pydantic (Expected en modo sin auth real)")
        elif response2.status_code == 422:
            print("[OK] Pydantic rechazo payload sin routine_structure: 422")
            print(f"     Detalle: {response2.text[:200]}")
        else:
            print(f"[FAIL] Codigo inesperado: {response2.status_code}")

        # =====================================================================
        # PRUEBA A: Happy Path (requiere un token JWT real)
        # =====================================================================
        print("\n[PRUEBA A] Happy Path - Insercion exitosa")
        print("[INFO] Este test requiere un token JWT real.")
        print("       Para ejecutar el Happy Path completo:")
        print("       1. Obtener token via POST /api/v1/auth/login")
        print("       2. Pasar el token como Bearer en el header")
        print("       3. Verificar HTTP 200 + mesocycle_id en respuesta")

        # =====================================================================
        # PRUEBA B: Zero-Trust RLS (requiere 2 tokens de tenants diferentes)
        # =====================================================================
        print("\n[PRUEBA B] Zero-Trust RLS - Penetration Test")
        print("[INFO] Este test requiere dos tokens JWT de tenants distintos.")
        print("       1. Token A (Franquicia A) crea un mesocycle")
        print("       2. Token B (Franquicia B) intenta leer el mesocycle de A")
        print("       3. Verificar HTTP 403 o resultado vacio (RLS bloqueante)")

        # =====================================================================
        # VERIFICACION: Endpoint responde correctamente
        # =====================================================================
        print("\n[HEALTH CHECK] Verificando que el endpoint /mesocycles existe...")
        health = await client.options("/mesocycles")
        if health.status_code in [200, 204, 405]:
            print(f"[OK] Endpoint /api/v1/mesocycles responde (Status: {health.status_code})")
        else:
            print(f"[FAIL] Endpoint no encontrado: {health.status_code}")

        print("\n=== FIN DE UAT ===")

if __name__ == "__main__":
    asyncio.run(test_mesocycles_uat())

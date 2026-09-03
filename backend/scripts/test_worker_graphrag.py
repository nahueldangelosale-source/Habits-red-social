import sys
import os
import json
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.domains.onboarding.tasks import process_onboarding_pipeline

# Payload simulando el DTO OnboardingData con lesión de espalda baja
payload = {
    "goal": "muscular_hypertrophy",
    "biometric_tags": ["inj_lower_back"],
    "nut_clinical_tags": []
}

print("=== DEPLOYING KINETIC GRAPH-RAG STRESS TEST ===")
print("Inyectando DTO con 'inj_lower_back'. El motor debería bloquear ejercicios con Carga Axial...")

# apply() corre la tarea sincrónicamente dentro del thread actual para testing
result = process_onboarding_pipeline.apply(args=[payload])

if result.successful():
    print("\n[ÉXITO] Tarea completada.")
    print("Resultado:")
    print(json.dumps(result.result, indent=2))
else:
    print("\n[ERROR] Tarea falló.")
    print(result.traceback)

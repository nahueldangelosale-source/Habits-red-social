"""
Test del Pipeline COMPLETO — DietQA Service (Async)
Simula exactamente lo que recibiría el endpoint POST /api/v1/dietqa/generate-plan
"""
import sys, asyncio, json
sys.path.insert(0, ".")

from app.domains.dietqa.service import dietqa_service
from app.domains.dietqa.schemas import (
    GeneratePlanRequest, BiometricsPayload, PatientIdentity,
    GenderEnum, ActivityLevel, GutHealth, ClinicalHardStop, ArchetypeEnum,
)

async def main():
    # Worst-Case Scenario: paciente obeso, CERO LACTEOS, hinchado, sin GLP-1
    request = GeneratePlanRequest(
        biometrics=BiometricsPayload(
            weight=95,
            height=175,
            age=42,
            waist=102,  # > 90cm = MetS risk
            gender=GenderEnum.MALE,
            activity_level=ActivityLevel.LIGHT,
        ),
        archetype=ArchetypeEnum.TIME_CRUNCH,
        clinical_hard_stops=[ClinicalHardStop.CERO_LACTEOS],
        gut_health=GutHealth.BLOATED,
        medication_glp1=False,
        patient=PatientIdentity(name="Nahuelito", phone="+5491155667788"),
    )

    print("=" * 70)
    print("  PIPELINE COMPLETO - DietQA Service (Worst-Case Scenario)")
    print("=" * 70)

    result = await dietqa_service.generate_plan(request)
    
    # Pretty-print del resultado
    output = result.model_dump()
    print(json.dumps(output, indent=2, ensure_ascii=False, default=str))

    print("\n" + "=" * 70)
    print("  RESUMEN")
    print("=" * 70)
    print(f"  Paciente:        {result.patient_name} ({result.patient_id})")
    print(f"  TMB:             {result.tmb} kcal")
    print(f"  DER:             {result.daily_energy_requirement} kcal")
    print(f"  Arquetipo:       {result.archetype_label}")
    print(f"  MetS Risk:       {result.clinical_flags.metabolic_syndrome_risk}")
    print(f"  Low-FODMAP:      {result.clinical_flags.low_fodmap_active}")
    print(f"  GLP-1 Safe:      {result.clinical_flags.glp1_safety_mode}")
    print(f"  Blocked:         {result.clinical_flags.blocked_ingredients}")
    for day in result.plan:
        print(f"\n  {day.label}")
        print(f"    Target: {day.target_calories} kcal | Actual: {day.total_calories} kcal")
        for meal in day.meals:
            subs_text = ""
            if meal.substitutions:
                subs_text = " [SUBS: " + ", ".join(f"{s['original']}->{s['replacement']}" for s in meal.substitutions) + "]"
            print(f"    - {meal.meal_type:<10} {meal.name:<40} {meal.calories:>5} kcal{subs_text}")
    
    print(f"\n  Narrativa: {result.llm_narrative}")

asyncio.run(main())

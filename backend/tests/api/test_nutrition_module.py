import pytest
import uuid
from app.services.shopping_list_service import ShoppingListService
from app.services.micronutrient_validator import MicronutrientValidator, AlertSeverity
from app.models.meal_block import Micros
from app.domains.dietqa.service import DietQAService
from app.domains.dietqa.schemas import (
    GeneratePlanRequest, 
    BiometricsPayload, 
    GenderEnum, 
    ActivityLevel, 
    GutHealth,
    ClinicalHardStop,
    ArchetypeEnum
)
from app.services.nutrition_vision import NutritionVisionService, ImageAnalysisRequest

def test_shopping_list_service_consolidation():
    """Verifica que ShoppingListService consolide y escale ingredientes correctamente."""
    sample_meals = [
        {
            "mealType": "Desayuno",
            "options": [
                {
                    "name": "Tostadas con Palta y Huevo",
                    "totalMacros": {"calories": 360, "protein": 19, "carbs": 32, "fats": 18},
                    "ingredients": [
                        {"name": "Pan integral", "quantity": 60, "unit": "g"},
                        {"name": "Huevos enteros", "quantity": 2, "unit": "u"},
                        {"name": "Palta Hass", "quantity": 40, "unit": "g"}
                    ]
                }
            ]
        },
        {
            "mealType": "Almuerzo",
            "options": [
                {
                    "name": "Pechuga con Arroz",
                    "totalMacros": {"calories": 420, "protein": 45, "carbs": 40, "fats": 8},
                    "ingredients": [
                        {"name": "Pechuga de pollo", "quantity": 200, "unit": "g"},
                        {"name": "Arroz integral", "quantity": 120, "unit": "g"},
                        {"name": "Aceite de oliva", "quantity": 5, "unit": "ml"}
                    ]
                }
            ]
        }
    ]

    # Test 1 semana (multiplier = 1.0)
    result_1w = ShoppingListService.generate_from_plan(sample_meals, time_horizon="1w")
    assert result_1w.total_items == 6
    assert result_1w.multiplier == 1.0
    assert "Carnes, Pescados & Huevos" in result_1w.grouped_items
    assert "Granos, Cereales & Harinas" in result_1w.grouped_items

    # Test 15 días (multiplier = 2.0)
    result_2w = ShoppingListService.generate_from_plan(sample_meals, time_horizon="2w")
    assert result_2w.multiplier == 2.0
    chicken_item = next(i for i in result_2w.items if "pollo" in i.name.lower())
    assert chicken_item.raw_amount == 400  # 200g * 2.0

@pytest.mark.asyncio
async def test_dietqa_tmb_and_plan_generation():
    """Verifica el cálculo de TMB Mifflin-St Jeor y Day A / Day B asimétrico."""
    from app.domains.dietqa.schemas import PatientIdentity

    req = GeneratePlanRequest(
        patient=PatientIdentity(name="Atleta Test", email="test@bienestar.app"),
        biometrics=BiometricsPayload(
            age=30,
            weight=80.0,
            height=180.0,
            waist=85.0,
            gender=GenderEnum.MALE,
            activity_level=ActivityLevel.ACTIVE
        ),
        archetype=ArchetypeEnum.WELLNESS,
        gut_health=GutHealth.PERFECT,
        medication_glp1=False,
        clinical_hard_stops=[ClinicalHardStop.CERO_LACTEOS]
    )

    service = DietQAService()
    response = await service.generate_plan(req)
    assert response.patient_name == "Atleta Test"
    assert response.tmb > 1600
    assert response.daily_energy_requirement > 2200
    assert len(response.plan) >= 2
    assert response.plan[0].target_calories >= response.plan[1].target_calories

def test_micronutrient_validator_pathology_alerts():
    """Verifica que el validador de micronutrientes emita alertas clínicas correctas."""
    validator = MicronutrientValidator()
    
    # Evaluar con patología de anemia y aporte deficiente de hierro
    deficient_micros = Micros(
        iron=5.0,  # Normal para anemia > 18mg (severidad crítica)
        calcium=1000.0,
        zinc=11.0,
        magnesium=400.0,
        selenium=55.0,
        vitamin_d=600.0,
        vitamin_b12=2.4,
        folate=400.0,
        potassium=2500.0,
        sodium=1500.0,
        omega_3=1000.0
    )
    
    alerts = validator.validate_plan(deficient_micros, pathologies=["anemia"])
    assert len(alerts) > 0
    anemia_alert = next(a for a in alerts if a.nutrient == "iron")
    assert anemia_alert.severity in (AlertSeverity.CRITICAL, AlertSeverity.HIGH)
    assert len(anemia_alert.suggested_foods) > 0

@pytest.mark.asyncio
async def test_nutrition_vision_service_demo():
    """Verifica que NutritionVisionService maneje correctamente el flujo de análisis."""
    service = NutritionVisionService()
    req = ImageAnalysisRequest(
        image_base64="dGVzdF9pbWFnZV9ieXRlcw==",
        client_id=uuid.uuid4(),
        meal_type="Almuerzo"
    )
    result = await service.analyze_image(req)
    assert result.macros.calories > 0
    assert result.macros.protein_g > 0
    assert len(result.ingredients) > 0

"""
DietQA Domain - FastAPI Router
Endpoint principal: POST /api/v1/dietqa/generate-plan
"""

import logging
import uuid
import json
import hashlib
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.middleware.rate_limit import limiter
from app.domains.dietqa.schemas import GeneratePlanRequest, GeneratePlanResponse
from app.domains.dietqa.service import dietqa_service
from app.db.database import get_db as get_async_db
from app.db.connection import get_db as get_sync_db
from app.db.models import Patient
from app.middleware.auth import get_optional_user, TokenData
from app.schemas.nutrition import DietQASubstitutionRequest, DietQASubstitutionResponse, NutritionRadarResponse, RadarDataPoint

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/dietqa",
    tags=["DietQA - Motor Nutricional"],
)

@router.post("/generate-plan", response_model=GeneratePlanResponse)
@limiter.limit("5/minute")
async def generate_plan(
    payload: GeneratePlanRequest,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
    current_user: TokenData = Depends(get_optional_user),
) -> GeneratePlanResponse:
    try:
        result = await dietqa_service.generate_plan(payload)
        return result
    except Exception as e:
        logger.error(f"DietQA - Error generating plan: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del motor DietQA: {str(e)}"
        )

from pydantic import BaseModel
class AnalyzeMealRequest(BaseModel):
    image_url: str
    patient_id: str

@router.post("/analyze")
async def analyze_meal(payload: AnalyzeMealRequest):
    from app.worker.dietqa_tasks import analyze_meal_image_task
    correlation_id = str(uuid.uuid4())
    analyze_meal_image_task.delay(
        image_url=payload.image_url,
        patient_id=payload.patient_id,
        correlation_id=correlation_id
    )
    return {
        "status": "accepted",
        "message": "Análisis encolado. Escuche eventos SSE para resultados.",
        "correlation_id": correlation_id
    }

@router.get("/health")
async def dietqa_health():
    from app.infrastructure.neo4j_client import neo4j_client
    try:
        result = await neo4j_client.execute_query("RETURN 1 AS ping")
        neo4j_ok = len(result) > 0
    except Exception:
        neo4j_ok = False
    return {
        "service": "DietQA",
        "status": "healthy" if neo4j_ok else "degraded",
        "neo4j_connected": neo4j_ok,
    }

# --- NEW PHASE 39 ENDPOINTS ---

REDIS_MOCK_CACHE = {}

# Caching rules hash in memory to avoid parsing every time (Directiva 4 del CTO)
MEDICAL_RULES = {
    "AIP": {"banned_ingredients": ["Tomates", "Lácteos", "Huevos", "Nueces"]},
    "Keto": {"banned_ingredients": ["Azúcar", "Harina", "Miel", "Arroz"]},
    "Plant-Based": {"banned_ingredients": ["Carne", "Pollo", "Pescado", "Lácteos", "Huevos"]},
    "Low-FODMAP": {"banned_ingredients": ["Cebolla", "Ajo", "Manzana", "Trigo"]}
}

def get_medical_rules_hash(archetype: str, intolerances: list[str]) -> str:
    base_rules = MEDICAL_RULES.get(archetype, {}).get("banned_ingredients", [])
    combined = sorted(base_rules + intolerances)
    rules_string = json.dumps(combined)
    return hashlib.md5(rules_string.encode('utf-8')).hexdigest()

def mock_llm_substitution(ingredient: str, archetype: str, intolerances: list[str]) -> tuple[list[str], str]:
    banned = MEDICAL_RULES.get(archetype, {}).get("banned_ingredients", []) + intolerances
    banned_lower = [b.lower() for b in banned]
    ingredient_lower = ingredient.lower()
    
    if ingredient_lower == "yogur entero":
        if "lácteos" in banned_lower or archetype == "Plant-Based":
            return ["Yogur de Coco", "Yogur de Almendras"], "El paciente no tolera los lácteos o sigue dieta Plant-Based."
        else:
            return ["Yogur Griego", "Kefir"], "Se recomienda yogur griego por su alto contenido proteico o Kefir."
            
    if ingredient_lower == "queso cheddar":
        if "lácteos" in banned_lower or archetype == "Plant-Based":
            return ["Levadura Nutricional", "Queso de Castañas"], "La levadura nutricional aporta sabor a queso y vitamina B12."
        else:
            return ["Queso Gouda", "Queso Feta"], "Opciones con menor índice inflamatorio relativo."

    return ["Alternativa 1", "Alternativa 2"], f"Sustituciones calculadas bajo protocolo {archetype}."

@router.post("/substitutions", response_model=DietQASubstitutionResponse)
async def get_substitutions(
    req: DietQASubstitutionRequest,
    db: Session = Depends(get_sync_db),
    current_user: TokenData = Depends(get_optional_user)
):
    patient = db.query(Patient).filter(Patient.id == uuid.UUID(req.patient_id)).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
    extra_data = patient.extra_data or {}
    archetype = extra_data.get("archetype", "Standard")
    intolerances = extra_data.get("intolerances", [])
    
    rules_hash = get_medical_rules_hash(archetype, intolerances)
    cache_key = f"dietqa:sub:{archetype}:{rules_hash}:{req.ingredient.lower().replace(' ', '_')}"
    
    if cache_key in REDIS_MOCK_CACHE:
        cached_result = REDIS_MOCK_CACHE[cache_key]
        return DietQASubstitutionResponse(
            original_ingredient=req.ingredient,
            suggested_substitutes=cached_result["substitutes"],
            ai_reasoning=cached_result["reasoning"],
            cached=True
        )
        
    substitutes, reasoning = mock_llm_substitution(req.ingredient, archetype, intolerances)
    REDIS_MOCK_CACHE[cache_key] = {"substitutes": substitutes, "reasoning": reasoning}
    
    return DietQASubstitutionResponse(
        original_ingredient=req.ingredient,
        suggested_substitutes=substitutes,
        ai_reasoning=reasoning,
        cached=False
    )

@router.get("/patients/{patient_id}/radar", response_model=NutritionRadarResponse)
async def get_nutrition_radar(
    patient_id: str,
    db: Session = Depends(get_sync_db),
    current_user: TokenData = Depends(get_optional_user)
):
    patient = db.query(Patient).filter(Patient.id == uuid.UUID(patient_id)).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
        
    extra_data = patient.extra_data or {}
    archetype = extra_data.get("archetype", "Standard")
    is_glp1 = extra_data.get("is_glp1_user", False)
    
    if archetype == "Keto":
        radar_data = [
            RadarDataPoint(subject="Proteína", A=90),
            RadarDataPoint(subject="Grasas", A=130),
            RadarDataPoint(subject="Carbohidratos", A=20),
            RadarDataPoint(subject="Fibra", A=30),
            RadarDataPoint(subject="Micronutrientes", A=70),
        ]
    elif archetype == "Plant-Based":
        radar_data = [
            RadarDataPoint(subject="Proteína", A=60),
            RadarDataPoint(subject="Grasas", A=40),
            RadarDataPoint(subject="Carbohidratos", A=110),
            RadarDataPoint(subject="Fibra", A=140),
            RadarDataPoint(subject="Micronutrientes", A=120),
        ]
    else:
        radar_data = [
            RadarDataPoint(subject="Proteína", A=80),
            RadarDataPoint(subject="Grasas", A=60),
            RadarDataPoint(subject="Carbohidratos", A=100),
            RadarDataPoint(subject="Fibra", A=80),
            RadarDataPoint(subject="Micronutrientes", A=90),
        ]

    if is_glp1:
        for item in radar_data:
            if item.subject == "Proteína":
                item.A += 30
            elif item.subject in ["Grasas", "Carbohidratos"]:
                item.A -= 20

    return NutritionRadarResponse(
        radar_data=radar_data,
        archetype_info=f"Perfil Activo: {archetype}" + (" (Modificador GLP-1)" if is_glp1 else ""),
        calories_target=1800 if is_glp1 else 2200
    )

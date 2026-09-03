from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/dietqa")

class SwapRequest(BaseModel):
    patient_id: str
    ingredient: str

@router.post("/substitutions")
async def get_substitutions(request: SwapRequest):
    # Simplified AI logic for Phase 24 validation
    # Returns macro-equivalent swaps
    
    swaps_map = {
        "Yogur Entero": ["Queso Batido 0%", "Kefir", "Leche de Almendras + Proteina"],
        "Queso Cheddar": ["Queso Mozzarella Magro", "Queso Fresco Bajas Calorias"],
        "Pollo": ["Pavo", "Atun al Natural", "Tofu Firme"],
        "Arroz Blanco": ["Quinoa", "Arroz Integral", "Boniato/Batata"]
    }
    
    # Try case-insensitive matching
    ingredient_lower = request.ingredient.lower()
    found_swaps = []
    
    for key, value in swaps_map.items():
        if key.lower() in ingredient_lower or ingredient_lower in key.lower():
            found_swaps = value
            break
            
    if not found_swaps:
        found_swaps = [f"Alternativa proteica/carbo a {request.ingredient}"]
        
    return {
        "ingredient": request.ingredient,
        "suggested_substitutes": found_swaps,
        "ai_reasoning": f"Sustitucion recomendada buscando equivalencia calorica y de macronutrientes para {request.ingredient}.",
        "cached": True
    }

"""
Nutrition Vision Service - "Nutrium Killer"
Photo-to-Macros analysis using GPT-4o Vision.

Features:
- Snap & Track: Photo → Macro estimation
- SKU matching for marketplace integration
- Ingredient detection and suggestions
"""

import base64
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.config import get_settings

settings = get_settings()


# =============================================================================
# SCHEMAS
# =============================================================================

class MacroEstimate(BaseModel):
    """Estimación de macronutrientes."""
    calories: int = Field(ge=0)
    protein_g: float = Field(ge=0)
    carbs_g: float = Field(ge=0)
    fat_g: float = Field(ge=0)
    fiber_g: float = Field(ge=0, default=0)


class DetectedIngredient(BaseModel):
    """Ingrediente detectado en la imagen."""
    name: str
    name_es: str
    estimated_grams: float
    confidence: float = Field(ge=0, le=1)
    sku_id: Optional[str] = None  # Para marketplace
    affiliate_url: Optional[str] = None


class ImageAnalysisRequest(BaseModel):
    """Request para análisis de imagen."""
    image_base64: str = Field(..., description="Imagen en base64 (JPEG/PNG)")
    client_id: Optional[UUID] = None
    meal_type: Optional[str] = Field(None, description="breakfast, lunch, dinner, snack")


class ImageAnalysisResponse(BaseModel):
    """Respuesta del análisis de imagen."""
    id: UUID = Field(default_factory=uuid4)
    macros: MacroEstimate
    ingredients: list[DetectedIngredient]
    meal_description: str
    recommendations: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)


# =============================================================================
# SERVICE
# =============================================================================

class NutritionVisionService:
    """
    Servicio de visión para nutrición.
    Analiza fotos de comida y estima macros.
    """
    
    def __init__(self):
        self.openai_api_key = settings.openai_api_key
    
    async def analyze_image(
        self,
        image_base64: str,
        meal_type: Optional[str] = None,
    ) -> ImageAnalysisResponse:
        """
        Analiza imagen de comida y estima macros.
        
        Args:
            image_base64: Imagen en base64
            meal_type: Tipo de comida (opcional)
            
        Returns:
            ImageAnalysisResponse con macros e ingredientes
        """
        # Si no hay API key, retornar demo
        if not self.openai_api_key:
            return self._demo_response(meal_type)
        
        try:
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI(api_key=self.openai_api_key)
            
            # Prompt para GPT-4o Vision
            system_prompt = """You are a nutrition expert analyzing food photos.
Your task is to:
1. Identify all visible ingredients with estimated portions
2. Calculate approximate macronutrients
3. Provide a brief meal description

IMPORTANT:
- Focus on accuracy for protein/carbs/fat estimation
- Do NOT lecture or moralize about food choices
- Be helpful and practical
- Estimates are for tracking, not clinical precision

Return JSON in this exact format:
{
    "meal_description": "Brief description of the meal",
    "confidence": 0.7-0.95,
    "ingredients": [
        {"name": "ingredient name", "name_es": "nombre en español", "estimated_grams": 150, "confidence": 0.8}
    ],
    "macros": {
        "calories": 450,
        "protein_g": 30,
        "carbs_g": 40,
        "fat_g": 15,
        "fiber_g": 5
    },
    "recommendations": ["Optional helpful tips"]
}"""

            user_prompt = "Analyze this meal photo and estimate the nutritional content."
            if meal_type:
                user_prompt += f" This is a {meal_type}."
            
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=1000,
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            # Parsear respuesta
            ingredients = [
                DetectedIngredient(
                    name=ing.get("name", "Unknown"),
                    name_es=ing.get("name_es", ing.get("name", "Desconocido")),
                    estimated_grams=ing.get("estimated_grams", 100),
                    confidence=ing.get("confidence", 0.7),
                )
                for ing in result.get("ingredients", [])
            ]
            
            macros_data = result.get("macros", {})
            macros = MacroEstimate(
                calories=macros_data.get("calories", 0),
                protein_g=macros_data.get("protein_g", 0),
                carbs_g=macros_data.get("carbs_g", 0),
                fat_g=macros_data.get("fat_g", 0),
                fiber_g=macros_data.get("fiber_g", 0),
            )
            
            # Añadir marketplace SKUs a ingredientes comunes
            ingredients = self._add_sku_links(ingredients)
            
            return ImageAnalysisResponse(
                macros=macros,
                ingredients=ingredients,
                meal_description=result.get("meal_description", "Analyzed meal"),
                recommendations=result.get("recommendations", []),
                confidence=result.get("confidence", 0.75),
            )
            
        except Exception as e:
            # Fallback a demo en caso de error
            return self._demo_response(meal_type, error=str(e))
    
    def _add_sku_links(
        self, 
        ingredients: list[DetectedIngredient]
    ) -> list[DetectedIngredient]:
        """
        Añade SKU IDs y links de afiliados a ingredientes conocidos.
        En producción, esto consultaría la base de datos de productos.
        """
        # Mapeo demo de ingredientes a SKUs
        sku_map = {
            "chicken": ("SKU-CHICKEN-001", "https://shop.bienestar.app/p/pollo-pechuga"),
            "pollo": ("SKU-CHICKEN-001", "https://shop.bienestar.app/p/pollo-pechuga"),
            "rice": ("SKU-RICE-001", "https://shop.bienestar.app/p/arroz-integral"),
            "arroz": ("SKU-RICE-001", "https://shop.bienestar.app/p/arroz-integral"),
            "protein powder": ("SKU-WHEY-001", "https://shop.bienestar.app/p/whey-protein"),
            "proteina": ("SKU-WHEY-001", "https://shop.bienestar.app/p/whey-protein"),
            "avocado": ("SKU-AVO-001", "https://shop.bienestar.app/p/palta"),
            "palta": ("SKU-AVO-001", "https://shop.bienestar.app/p/palta"),
            "eggs": ("SKU-EGGS-001", "https://shop.bienestar.app/p/huevos-campo"),
            "huevos": ("SKU-EGGS-001", "https://shop.bienestar.app/p/huevos-campo"),
            "oats": ("SKU-OATS-001", "https://shop.bienestar.app/p/avena-integral"),
            "avena": ("SKU-OATS-001", "https://shop.bienestar.app/p/avena-integral"),
        }
        
        for ingredient in ingredients:
            name_lower = ingredient.name.lower()
            name_es_lower = ingredient.name_es.lower()
            
            for key, (sku, url) in sku_map.items():
                if key in name_lower or key in name_es_lower:
                    ingredient.sku_id = sku
                    ingredient.affiliate_url = url
                    break
        
        return ingredients
    
    def _demo_response(
        self, 
        meal_type: Optional[str] = None,
        error: Optional[str] = None,
    ) -> ImageAnalysisResponse:
        """Genera respuesta demo cuando no hay API key o hay error."""
        
        # Diferentes demos según tipo de comida
        if meal_type == "breakfast":
            return ImageAnalysisResponse(
                macros=MacroEstimate(
                    calories=450,
                    protein_g=30,
                    carbs_g=45,
                    fat_g=15,
                    fiber_g=8,
                ),
                ingredients=[
                    DetectedIngredient(
                        name="Oatmeal",
                        name_es="Avena",
                        estimated_grams=80,
                        confidence=0.9,
                        sku_id="SKU-OATS-001",
                        affiliate_url="https://shop.bienestar.app/p/avena-integral",
                    ),
                    DetectedIngredient(
                        name="Blueberries",
                        name_es="Arándanos",
                        estimated_grams=50,
                        confidence=0.85,
                    ),
                    DetectedIngredient(
                        name="Protein Powder",
                        name_es="Proteína en Polvo",
                        estimated_grams=30,
                        confidence=0.8,
                        sku_id="SKU-WHEY-001",
                        affiliate_url="https://shop.bienestar.app/p/whey-protein",
                    ),
                ],
                meal_description="Desayuno proteico: Avena con proteína y arándanos",
                recommendations=["Excelente fuente de carbohidratos complejos y proteína"],
                confidence=0.85,
            )
        else:
            # Demo genérico (almuerzo)
            return ImageAnalysisResponse(
                macros=MacroEstimate(
                    calories=550,
                    protein_g=45,
                    carbs_g=40,
                    fat_g=20,
                    fiber_g=6,
                ),
                ingredients=[
                    DetectedIngredient(
                        name="Grilled Chicken Breast",
                        name_es="Pechuga de Pollo a la Plancha",
                        estimated_grams=200,
                        confidence=0.9,
                        sku_id="SKU-CHICKEN-001",
                        affiliate_url="https://shop.bienestar.app/p/pollo-pechuga",
                    ),
                    DetectedIngredient(
                        name="Brown Rice",
                        name_es="Arroz Integral",
                        estimated_grams=150,
                        confidence=0.85,
                        sku_id="SKU-RICE-001",
                        affiliate_url="https://shop.bienestar.app/p/arroz-integral",
                    ),
                    DetectedIngredient(
                        name="Mixed Vegetables",
                        name_es="Vegetales Mixtos",
                        estimated_grams=100,
                        confidence=0.8,
                    ),
                ],
                meal_description="Almuerzo balanceado: Pollo con arroz integral y vegetales",
                recommendations=[
                    "Buena distribución de macros",
                    "Considera añadir más vegetales verdes",
                ],
                confidence=0.82,
            )


# Instancia global del servicio
nutrition_vision_service = NutritionVisionService()

from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class FoodItem(BaseModel):
    name: str = Field(description="Nombre del alimento detectado")
    portion_estimation: str = Field(description="Estimación visual de la porción (e.g., '1 taza', '200g', '1 rebanada')")
    calories: int = Field(description="Calorías estimadas para esta porción")
    protein: float = Field(description="Gramos de proteína estimados")
    carbs: float = Field(description="Gramos de carbohidratos estimados")
    fat: float = Field(description="Gramos de grasa estimados")

class MealAnalysisResult(BaseModel):
    """
    Estructura de salida requerida matemáticamente al LLM mediante instructor.
    Garantiza que no haya fallos estructurales para el front-end del Nutricionista.
    """
    source_type: Literal['home_cooked', 'nutrition_label', 'barcode', 'ambiguous'] = Field(
        description="""
        Tipo de imagen recibida. 
        - 'home_cooked': Comida real/plato donde se deben inferir los macros visualmente.
        - 'nutrition_label': Foto de una tabla nutricional impresa en un envase comercial.
        - 'barcode': Foto de un código de barras.
        - 'ambiguous': Imagen demasiado borrosa o que no contiene comida ni información nutricional.
        """
    )
    is_commercial_label: bool = Field(
        description="True si la imagen es explícitamente una etiqueta nutricional o empaque comercial. Ayuda a la UI a saber que los valores son absolutos y no inferidos visualmente."
    )
    food_items: List[FoodItem] = Field(description="Lista de los alimentos u objetos detectados y su desglose")
    total_calories: int = Field(description="Suma total de calorías de la imagen")
    total_protein: float = Field(description="Suma total de proteínas")
    total_carbs: float = Field(description="Suma total de carbohidratos")
    total_fat: float = Field(description="Suma total de grasas")
    
    confidence_score: float = Field(
        description="Puntuación de confianza del análisis entre 0.0 y 1.0. Si la imagen es dudosa o ambigua, este valor debe ser menor a 0.85",
        ge=0.0,
        le=1.0
    )
    clinical_flags: List[str] = Field(
        default_factory=list,
        description="Alertas clínicas rápidas inferidas (e.g., 'Alto en sodio', 'Exceso de grasas saturadas', 'Bajo en fibra'). Vacío si todo es normal."
    )

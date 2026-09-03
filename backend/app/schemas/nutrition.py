from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

class BioMetabolicArchetype(str, Enum):
    KETO = "Keto"
    AIP = "AIP" # Auto-Immune Protocol
    PLANT_BASED = "Plant-Based"
    LOW_FODMAP = "Low-FODMAP"
    MEDITERRANEAN = "Mediterranean"
    STANDARD = "Standard"
    BALANCED = "Balanced"

class NutritionalProfileSchema(BaseModel):
    schema_version: str = Field(default="1.0", description="Versión del esquema de datos")
    archetype: BioMetabolicArchetype = Field(default=BioMetabolicArchetype.STANDARD)
    is_glp1_user: bool = Field(default=False, description="Uso activo de análogos de GLP-1")
    intolerances: List[str] = Field(default_factory=list, description="Ej: Lactosa, Gluten")
    allergies: List[str] = Field(default_factory=list)
    gut_health_status: Optional[str] = Field(default=None)
    metabolic_goal: Optional[str] = Field(default=None)
    additional_metadata: Dict[str, Any] = Field(default_factory=dict)

class DietQASubstitutionRequest(BaseModel):
    ingredient: str = Field(..., description="Ingrediente a sustituir")
    patient_id: str = Field(..., description="UUID del paciente para extraer perfil")

class DietQASubstitutionResponse(BaseModel):
    original_ingredient: str
    suggested_substitutes: List[str]
    ai_reasoning: str
    cached: bool = Field(default=False, description="True si provino de Redis en O(1)")

class RadarDataPoint(BaseModel):
    subject: str
    A: int # Current Value
    fullMark: int = 150

class NutritionRadarResponse(BaseModel):
    radar_data: List[RadarDataPoint]
    archetype_info: str
    calories_target: int

# --- SARA Food Items Schemas ---
class SaraFoodItemBase(BaseModel):
    alimento: str = Field(..., description="Nombre descriptivo del alimento")
    grupo: Optional[str] = Field(default=None, description="Grupo al que pertenece")
    enerc_kcal: float
    protcnt: float
    fat: float
    choavldf: float # Carbohidratos disponibles
    chocdf: Optional[float] = None
    fibtg: Optional[float] = None
    
    class Config:
        from_attributes = True

class SaraFoodItemResponse(SaraFoodItemBase):
    id_sara: uuid.UUID

class PaginatedFoodResponse(BaseModel):
    items: List[SaraFoodItemResponse]
    total: int
    page: int
    limit: int
    pages: int

# --- Shopping List Schemas ---
class TimeHorizonEnum(str, Enum):
    DAYS_3 = "3d"
    WEEK_1 = "1w"
    WEEKS_2 = "2w"
    MONTH_1 = "1m"

class SmartShoppingItemSchema(BaseModel):
    id: str
    name: str
    raw_amount: float
    raw_unit: str = "g"
    category: str
    retail_packaging: str
    household_measure: str
    yield_description: str

class ForecastPlateSchema(BaseModel):
    name: str
    qty: int
    cals: int
    tag: str

class ShoppingListResponse(BaseModel):
    time_horizon: str
    multiplier: float
    total_items: int
    items: List[SmartShoppingItemSchema]
    grouped_items: Dict[str, List[SmartShoppingItemSchema]]
    forecast_plates: List[ForecastPlateSchema]

# --- Meal Logs & Adherence Schemas ---
class MealLogCreate(BaseModel):
    raw_text: str = Field(..., description="Texto o transcripción de la comida")
    meal_type: Optional[str] = Field(default="Comida", description="Desayuno, Almuerzo, Merienda, Cena, Snack")
    estimated_calories: Optional[float] = None
    estimated_protein: Optional[float] = None
    estimated_carbs: Optional[float] = None
    estimated_fat: Optional[float] = None
    parsed_items: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class MealLogResponse(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    raw_text: str
    estimated_calories: Optional[float] = None
    estimated_protein: Optional[float] = None
    estimated_carbs: Optional[float] = None
    estimated_fat: Optional[float] = None
    parsed_items: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True

class DailyAdherenceResponse(BaseModel):
    date: str
    calories_consumed: float
    calories_target: float
    protein_consumed: float
    protein_target: float
    carbs_consumed: float
    carbs_target: float
    fat_consumed: float
    fat_target: float
    compliance_percentage: float
    logged_meals_count: int

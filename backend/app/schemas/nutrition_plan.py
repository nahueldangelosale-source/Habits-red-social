"""
Nutrition Plan Schemas — Sprint 2 (Gap Killer Update)

CONTRATO ESTRICTO: extra='forbid' en todos los niveles.
Cambios respecto a Sprint 1:
  - MealBlock ahora usa `options: List[MealOption]` en lugar de `items: List[MealItem]`
  - MealBlock tiene `custom_label` (nomenclatura personalizable: "Ingesta 1", "Pre-entreno")
  - MealBlock tiene `notes` a nivel de bloque (instrucciones del profesional)
  - MealOption agrupa items bajo un label ("Opción A", "Opción B")
"""

from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime


class MealType(str, Enum):
    """Clasificador interno para lógica de Status High/Low insulinogénico (NaaS)."""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    PRE_WORKOUT = "pre_workout"
    POST_WORKOUT = "post_workout"


class MacroNutrients(BaseModel):
    model_config = ConfigDict(extra='forbid')

    protein_g: float = Field(..., ge=0, description="Proteína en gramos")
    carbs_g: float = Field(..., ge=0, description="Carbohidratos en gramos")
    fat_g: float = Field(..., ge=0, description="Grasas en gramos")
    calories: int = Field(..., ge=0, description="Calorías totales")


class MealItem(BaseModel):
    model_config = ConfigDict(extra='forbid')

    id: str = Field(..., min_length=1, max_length=50, description="ID único para reconciliación en React")
    name: str = Field(..., min_length=1, max_length=100)
    portion_amount: float = Field(..., gt=0)
    portion_unit: str = Field(..., min_length=1, max_length=20)
    macros: MacroNutrients
    notes: Optional[str] = Field(default=None, max_length=500)


class MealOption(BaseModel):
    """Una opción dentro de una ingesta. El atleta elige cuál comer."""
    model_config = ConfigDict(extra='forbid')

    id: str = Field(..., min_length=1, max_length=50)
    label: str = Field(default="Opción A", min_length=1, max_length=50)
    items: List[MealItem]


class MealBlock(BaseModel):
    """
    Una ingesta (momento de alimentación).
    - `type`: Clasificador interno (para lógica NaaS de Status High/Low).
    - `custom_label`: Lo que ve el profesional y el atleta ("Ingesta 1", "Pre-entreno").
      Si es None, el frontend muestra "Ingesta {n}" automáticamente.
    - `options`: Lista de opciones alternativas. El atleta elige una.
    - `notes`: Instrucciones del profesional a nivel de ingesta.
    """
    model_config = ConfigDict(extra='forbid')

    id: str = Field(..., min_length=1, max_length=50)
    type: MealType
    custom_label: Optional[str] = Field(default=None, max_length=50)
    time_target: Optional[str] = Field(default=None, pattern=r"^([01]?[0-9]|2[0-3]):[0-5][0-9]$")
    notes: Optional[str] = Field(default=None, max_length=500)
    options: List[MealOption]


class NutritionPlanBase(BaseModel):
    model_config = ConfigDict(extra='forbid')

    title: str = Field(..., min_length=1, max_length=100)
    daily_macros_target: MacroNutrients
    meals: List[MealBlock]


class NutritionPlanCreate(NutritionPlanBase):
    athlete_id: str = Field(..., description="UUID del atleta")


class NutritionPlanUpdate(NutritionPlanBase):
    pass


class NutritionPlanResponse(NutritionPlanBase):
    id: str
    athlete_id: str
    trainer_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

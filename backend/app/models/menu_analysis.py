"""
MENU ANALYSIS MODEL
Menu Scanner (Restaurant Mode) - GPT-4o Vision pipeline

Features:
- Ephemeral processing (no S3 storage)
- 3 tactical options output
- Modification suggestions
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


# ═══════════════════════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════════════════════

class OptionType(str, Enum):
    IDEAL = "ideal"           # Best fit for macros
    CONTROLLED = "controlled"  # Allows indulgence with modifications
    DISASTER = "disaster"      # High impact, requires compensation


class DietGoal(str, Enum):
    FAT_LOSS = "fat_loss"
    MUSCLE_GAIN = "muscle_gain"
    MAINTENANCE = "maintenance"
    PERFORMANCE = "performance"


# ═══════════════════════════════════════════════════════════════════════════════
# REQUEST/RESPONSE MODELS
# ═══════════════════════════════════════════════════════════════════════════════

class UserContext(BaseModel):
    """User's current nutritional state for menu analysis"""
    user_id: str
    user_name: str
    remaining_calories: int
    remaining_protein: float   # grams
    remaining_carbs: float     # grams
    remaining_fat: float       # grams
    diet_type: str            # "KETO", "STANDARD", etc.
    allergies: List[str] = []  # ["GLUTEN", "DAIRY", "NUTS"]
    goal: DietGoal = DietGoal.MAINTENANCE


class MenuDish(BaseModel):
    """A dish extracted from the menu image"""
    name: str
    description: Optional[str] = None
    estimated_calories: int
    estimated_protein: float
    estimated_carbs: float
    estimated_fat: float
    allergens_detected: List[str] = []
    confidence: float = 0.8  # How confident the AI is about these values


class MenuModification(BaseModel):
    """Suggested modification to make a dish fit the diet"""
    action: str       # "REMOVE", "ADD", "SUBSTITUTE", "REQUEST"
    item: str         # "mayonesa", "pan", "aderezo"
    reason: str       # "Reduce carbs by 15g"
    impact_calories: int = 0
    impact_carbs: float = 0
    impact_fat: float = 0


class MenuOption(BaseModel):
    """A tactical recommendation from the menu"""
    option_type: OptionType
    dish: MenuDish
    modifications: List[MenuModification] = []
    
    # User-facing text
    headline: str        # "La Opción Ideal" / "El Antojo Controlado" / "El Desastre"
    recommendation: str  # "Pide la ensalada..."
    warning: Optional[str] = None  # "Si pides esto, mañana deberás..."
    
    # Final values after modifications
    final_calories: int
    final_protein: float
    final_carbs: float
    final_fat: float
    
    # How well it fits
    fit_score: float  # 0-1, how well it fits remaining macros


class MenuAnalysisResult(BaseModel):
    """Complete result of menu scan"""
    id: str
    analyzed_at: datetime
    user_context: UserContext
    
    # Restaurant info (if detected)
    restaurant_name: Optional[str] = None
    cuisine_type: Optional[str] = None
    
    # All dishes extracted
    all_dishes: List[MenuDish] = []
    
    # The 3 tactical options
    options: List[MenuOption] = []  # Exactly 3: ideal, controlled, disaster
    
    # Processing metadata
    processing_time_ms: int = 0
    model_used: str = "gpt-4o"
    
    # For analytics (B2B value)
    user_choice: Optional[str] = None  # Which option they chose
    actual_order: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════════
# CHEAT MEAL LOG (B2B Analytics)
# ═══════════════════════════════════════════════════════════════════════════════

class CheatMealLog(BaseModel):
    """
    Logged when user uses Restaurant Mode.
    Visible to nutritionist in their dashboard.
    """
    id: str
    user_id: str
    professional_id: str
    logged_at: datetime
    
    # Context
    restaurant_name: Optional[str] = None
    location: Optional[str] = None
    
    # What AI suggested vs what user chose
    ai_recommended: str      # "Ensalada Caprese"
    user_selected: str       # "Pizza Pepperoni"
    option_type_chosen: OptionType
    
    # Impact
    caloric_impact: int      # +400 kcal over plan
    was_compensated: bool    # Did AI adjust next day?
    compensation_applied: Optional[str] = None  # "Reduced carbs Saturday"
    
    # Notes
    user_note: Optional[str] = None
    professional_note: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════════
# SYSTEM PROMPT FOR GPT-4o VISION
# ═══════════════════════════════════════════════════════════════════════════════

MENU_SCANNER_SYSTEM_PROMPT = """
Role: You are an expert Clinical Nutritionist and Menu Hacker named "Hólos".

Task: Analyze the provided menu image against the user's nutritional constraints.

Rules:
1. **Identify**: Extract ALL dishes visible in the image with estimated macros.
2. **Filter**: Immediately discard items containing [USER_ALLERGIES].
3. **Rank**: Select the top 3 options that fit within [REMAINING_CALORIES].
4. **Modify**: You MUST suggest modifications to fit the diet:
   - "Pide el aderezo aparte"
   - "Sin pan" / "Sin croutons"
   - "Doble proteína"
   - "Sustituye papas por ensalada"
5. **Tone**: Empathetic but firm. Use the user's name. Be encouraging, not preachy.

Output 3 options:
- **IDEAL**: Best macro fit, requires minimal willpower
- **CONTROLLED**: Allows indulgence with smart modifications  
- **DISASTER**: High caloric impact, but explain the "deal" (extra cardio, reduced next meal)

Output Format: JSON following the MenuAnalysisResult schema.

Remember: The user is at a restaurant with friends. They're anxious about breaking their diet.
Your job is to give them CONFIDENCE, not guilt.
"""


# ═══════════════════════════════════════════════════════════════════════════════
# SAMPLE MOCK RESPONSE (For testing without API key)
# ═══════════════════════════════════════════════════════════════════════════════

MOCK_MENU_RESPONSE = MenuAnalysisResult(
    id="mock_001",
    analyzed_at=datetime.now(),
    user_context=UserContext(
        user_id="user_123",
        user_name="María",
        remaining_calories=450,
        remaining_protein=30,
        remaining_carbs=40,
        remaining_fat=15,
        diet_type="STANDARD",
        allergies=["GLUTEN"],
        goal=DietGoal.FAT_LOSS
    ),
    restaurant_name="Pizzería Don Antonio",
    cuisine_type="Italian",
    all_dishes=[
        MenuDish(name="Ensalada Caprese", estimated_calories=280, estimated_protein=12, estimated_carbs=8, estimated_fat=22),
        MenuDish(name="Pizza Napolitana", estimated_calories=320, estimated_protein=14, estimated_carbs=38, estimated_fat=12, allergens_detected=["GLUTEN"]),
        MenuDish(name="Pizza Pepperoni", estimated_calories=420, estimated_protein=18, estimated_carbs=42, estimated_fat=20, allergens_detected=["GLUTEN"]),
    ],
    options=[
        MenuOption(
            option_type=OptionType.IDEAL,
            dish=MenuDish(name="Ensalada Caprese", estimated_calories=280, estimated_protein=12, estimated_carbs=8, estimated_fat=22),
            modifications=[
                MenuModification(action="ADD", item="Doble mozzarella", reason="Aumenta proteína +8g", impact_calories=70),
                MenuModification(action="REQUEST", item="Aceite de oliva aparte", reason="Controla grasas")
            ],
            headline="🥗 La Opción Ideal",
            recommendation="Pide la Ensalada Caprese con doble queso. Cubre tu proteína restante y te mantiene en déficit.",
            final_calories=350,
            final_protein=20,
            final_carbs=8,
            final_fat=26,
            fit_score=0.92
        ),
        MenuOption(
            option_type=OptionType.CONTROLLED,
            dish=MenuDish(name="Pizza Napolitana (sin borde)", estimated_calories=240, estimated_protein=12, estimated_carbs=26, estimated_fat=10),
            modifications=[
                MenuModification(action="REMOVE", item="Borde de la pizza", reason="Reduce carbos -12g", impact_carbs=-12),
                MenuModification(action="REQUEST", item="Solo 2 porciones", reason="Controla porciones")
            ],
            headline="🍕 El Antojo Controlado",
            recommendation="2 porciones de Pizza Napolitana (masa fina, sin borde). Solo bebe agua.",
            warning="Estarás en tu límite de carbos. No picotees después.",
            final_calories=240,
            final_protein=12,
            final_carbs=26,
            final_fat=10,
            fit_score=0.75
        ),
        MenuOption(
            option_type=OptionType.DISASTER,
            dish=MenuDish(name="Pizza Pepperoni", estimated_calories=420, estimated_protein=18, estimated_carbs=42, estimated_fat=20, allergens_detected=["GLUTEN"]),
            modifications=[],
            headline="🔥 El Desastre",
            recommendation="Si pides la Pepperoni completa...",
            warning="Excederás 200kcal. Mañana deberás hacer 25 min de cardio extra O saltarte el snack de la tarde. ¿Aceptas el trato?",
            final_calories=420,
            final_protein=18,
            final_carbs=42,
            final_fat=20,
            fit_score=0.35
        )
    ],
    processing_time_ms=3200,
    model_used="mock"
)

"""
MENU SCANNER SERVICE
Restaurant Mode - GPT-4o Vision pipeline for menu analysis

Features:
- Process menu photos with Vision AI
- Generate 3 tactical options (Ideal/Controlled/Disaster)
- Mock mode for testing without API key
"""

import os
import base64
import json
from datetime import datetime
from typing import Optional
from uuid import uuid4

from ..models.menu_analysis import (
    UserContext,
    MenuAnalysisResult,
    MenuOption,
    MenuDish,
    MenuModification,
    OptionType,
    DietGoal,
    CheatMealLog,
    MENU_SCANNER_SYSTEM_PROMPT,
    MOCK_MENU_RESPONSE
)


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_MOCK = not OPENAI_API_KEY  # Auto-fallback to mock if no key

# If you have the key, try importing OpenAI
if OPENAI_API_KEY:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    except ImportError:
        USE_MOCK = True
        client = None
else:
    client = None


# ═══════════════════════════════════════════════════════════════════════════════
# MENU SCANNER CLASS
# ═══════════════════════════════════════════════════════════════════════════════

class MenuScanner:
    """
    Analyzes menu photos and returns tactical eating options.
    Uses GPT-4o Vision when API key is available, otherwise mock.
    """
    
    def __init__(self):
        self.use_mock = USE_MOCK
    
    def _build_user_prompt(self, context: UserContext) -> str:
        """Build the user prompt with context"""
        return f"""
Analiza este menú para {context.user_name}.

**Restricciones del Usuario:**
- Calorías restantes hoy: {context.remaining_calories} kcal
- Proteína restante: {context.remaining_protein}g
- Carbohidratos restantes: {context.remaining_carbs}g
- Grasa restante: {context.remaining_fat}g
- Tipo de dieta: {context.diet_type}
- Alergias: {', '.join(context.allergies) if context.allergies else 'Ninguna'}
- Objetivo: {context.goal.value}

Responde en JSON con el formato MenuAnalysisResult.
Incluye EXACTAMENTE 3 opciones: ideal, controlled, disaster.
"""
    
    async def analyze_menu(
        self,
        image_bytes: bytes,
        user_context: UserContext
    ) -> MenuAnalysisResult:
        """
        Analyze a menu image and return tactical options.
        
        Args:
            image_bytes: Raw bytes of the menu photo
            user_context: User's nutritional state
        
        Returns:
            MenuAnalysisResult with 3 options
        """
        start_time = datetime.now()
        
        if self.use_mock:
            return self._mock_analyze(user_context, start_time)
        
        return await self._real_analyze(image_bytes, user_context, start_time)
    
    def _mock_analyze(
        self,
        context: UserContext,
        start_time: datetime
    ) -> MenuAnalysisResult:
        """Return mock response for testing"""
        result = MOCK_MENU_RESPONSE.model_copy()
        result.id = str(uuid4())
        result.analyzed_at = start_time
        result.user_context = context
        result.processing_time_ms = 150  # Simulated fast response
        result.model_used = "mock"
        
        # Adjust recommendations based on user context
        if context.diet_type == "KETO":
            result.options[0].recommendation = "Pide la Ensalada con extra aguacate. Sin croutons. Perfecta para keto."
        
        return result
    
    async def _real_analyze(
        self,
        image_bytes: bytes,
        context: UserContext,
        start_time: datetime
    ) -> MenuAnalysisResult:
        """Use GPT-4o Vision for real analysis"""
        if not client:
            return self._mock_analyze(context, start_time)
        
        try:
            # Encode image to base64
            image_b64 = base64.b64encode(image_bytes).decode('utf-8')
            
            # Make Vision API call
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": MENU_SCANNER_SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": self._build_user_prompt(context)
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            # Parse response
            content = response.choices[0].message.content
            data = json.loads(content)
            
            # Calculate processing time
            processing_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Build result
            return self._parse_ai_response(data, context, processing_ms)
            
        except Exception as e:
            print(f"GPT-4o Vision error: {e}")
            # Fallback to mock on error
            result = self._mock_analyze(context, start_time)
            result.model_used = f"mock (error: {str(e)[:50]})"
            return result
    
    def _parse_ai_response(
        self,
        data: dict,
        context: UserContext,
        processing_ms: int
    ) -> MenuAnalysisResult:
        """Parse GPT-4o response into our model"""
        options = []
        
        for opt_data in data.get("options", [])[:3]:
            dish_data = opt_data.get("dish", {})
            
            dish = MenuDish(
                name=dish_data.get("name", "Plato"),
                description=dish_data.get("description"),
                estimated_calories=dish_data.get("estimated_calories", 0),
                estimated_protein=dish_data.get("estimated_protein", 0),
                estimated_carbs=dish_data.get("estimated_carbs", 0),
                estimated_fat=dish_data.get("estimated_fat", 0),
                allergens_detected=dish_data.get("allergens_detected", []),
                confidence=dish_data.get("confidence", 0.8)
            )
            
            modifications = [
                MenuModification(
                    action=mod.get("action", "REQUEST"),
                    item=mod.get("item", ""),
                    reason=mod.get("reason", ""),
                    impact_calories=mod.get("impact_calories", 0),
                    impact_carbs=mod.get("impact_carbs", 0),
                    impact_fat=mod.get("impact_fat", 0)
                )
                for mod in opt_data.get("modifications", [])
            ]
            
            option = MenuOption(
                option_type=OptionType(opt_data.get("option_type", "controlled")),
                dish=dish,
                modifications=modifications,
                headline=opt_data.get("headline", "Opción"),
                recommendation=opt_data.get("recommendation", ""),
                warning=opt_data.get("warning"),
                final_calories=opt_data.get("final_calories", dish.estimated_calories),
                final_protein=opt_data.get("final_protein", dish.estimated_protein),
                final_carbs=opt_data.get("final_carbs", dish.estimated_carbs),
                final_fat=opt_data.get("final_fat", dish.estimated_fat),
                fit_score=opt_data.get("fit_score", 0.5)
            )
            options.append(option)
        
        # Parse all detected dishes
        all_dishes = [
            MenuDish(
                name=d.get("name", ""),
                estimated_calories=d.get("estimated_calories", 0),
                estimated_protein=d.get("estimated_protein", 0),
                estimated_carbs=d.get("estimated_carbs", 0),
                estimated_fat=d.get("estimated_fat", 0)
            )
            for d in data.get("all_dishes", [])
        ]
        
        return MenuAnalysisResult(
            id=str(uuid4()),
            analyzed_at=datetime.now(),
            user_context=context,
            restaurant_name=data.get("restaurant_name"),
            cuisine_type=data.get("cuisine_type"),
            all_dishes=all_dishes,
            options=options,
            processing_time_ms=processing_ms,
            model_used="gpt-4o"
        )
    
    def log_cheat_meal(
        self,
        result: MenuAnalysisResult,
        chosen_option: MenuOption,
        professional_id: str
    ) -> CheatMealLog:
        """
        Log a cheat meal for B2B analytics.
        Called when user makes a selection.
        """
        # Determine AI's ideal recommendation
        ideal_option = next(
            (o for o in result.options if o.option_type == OptionType.IDEAL),
            result.options[0] if result.options else None
        )
        
        # Calculate caloric impact vs remaining
        caloric_impact = chosen_option.final_calories - result.user_context.remaining_calories
        
        return CheatMealLog(
            id=str(uuid4()),
            user_id=result.user_context.user_id,
            professional_id=professional_id,
            logged_at=datetime.now(),
            restaurant_name=result.restaurant_name,
            location=None,  # Would come from GPS
            ai_recommended=ideal_option.dish.name if ideal_option else "N/A",
            user_selected=chosen_option.dish.name,
            option_type_chosen=chosen_option.option_type,
            caloric_impact=caloric_impact,
            was_compensated=False,  # Will be set by compensation engine
            compensation_applied=None
        )


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON INSTANCE
# ═══════════════════════════════════════════════════════════════════════════════

menu_scanner = MenuScanner()


async def analyze_menu(
    image_bytes: bytes,
    user_context: UserContext
) -> MenuAnalysisResult:
    """Public API for menu analysis"""
    return await menu_scanner.analyze_menu(image_bytes, user_context)


def is_mock_mode() -> bool:
    """Check if running in mock mode (no API key)"""
    return USE_MOCK

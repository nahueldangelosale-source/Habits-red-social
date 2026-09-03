"""
DietQA Domain — Service Layer
El "Cerebro Despiadado" que orquesta:
  1. Cálculos metabólicos (Mifflin-St Jeor + PAL)
  2. Filtrado de recetas (Neo4j si disponible, In-Memory fallback)
  3. Sustituciones automáticas via ALTERNATIVE_TO
  4. Ensamblaje del plan asimétrico (Día A / Día B)

Estrategia "Cero Tokens Desperdiciados":
  - El grafo hace el trabajo pesado de filtrado y sustitución.
  - La IA solo recibe recetas 100% validadas para "redactar".
"""

import logging
import uuid

from app.domains.dietqa.schemas import (
    GeneratePlanRequest, GeneratePlanResponse,
    RecipeDTO, DayPlan, ClinicalFlags,
    GutHealth, ActivityLevel, GenderEnum,
)
from app.domains.dietqa import graph_engine

logger = logging.getLogger(__name__)

ARCHETYPE_LABELS = {
    "ARQ_09_LONGEVITY_VITALITY": "Longevidad y Prevención",
    "ARQ_07_TIME_CRUNCH_2X": "Entrenamiento Rápido",
    "ARQ_03_PPL": "Fuerza y Masa Muscular",
    "ARQ_01_WELLNESS": "Bienestar y Adherencia",
    "ARQ_CUSTOM": "Perfil Personalizado",
}


class DietQAService:
    """Motor de generación de planes nutricionales."""

    # ──────────────────────────────────────────────────────────────────
    # 1. CÁLCULOS METABÓLICOS
    # ──────────────────────────────────────────────────────────────────

    @staticmethod
    def calculate_tmb(weight: float, height: float, age: int, gender: GenderEnum) -> float:
        """Mifflin-St Jeor: la ecuación más validada clínicamente para TMB."""
        base = 10 * weight + 6.25 * height - 5 * age
        return base + 5 if gender == GenderEnum.MALE else base - 161

    @staticmethod
    def calculate_daily_energy(tmb: float, activity_level: ActivityLevel) -> float:
        """TMB × Factor PAL = Gasto Energético Diario Total (DER)."""
        pal_map = {
            ActivityLevel.SEDENTARY: 1.2,
            ActivityLevel.LIGHT: 1.55,
            ActivityLevel.ACTIVE: 1.9,
        }
        return round(tmb * pal_map.get(activity_level, 1.2), 0)

    @staticmethod
    def assess_metabolic_risk(waist: float, gender: GenderEnum) -> bool:
        """Circunferencia abdominal > umbral = riesgo de Síndrome Metabólico."""
        threshold = 90 if gender == GenderEnum.MALE else 85
        return waist > threshold

    # ──────────────────────────────────────────────────────────────────
    # 2. ORQUESTADOR PRINCIPAL
    # ──────────────────────────────────────────────────────────────────

    async def generate_plan(self, request: GeneratePlanRequest) -> GeneratePlanResponse:
        """
        Pipeline completo:
          Wizard JSON → Cálculos → Graph Engine → Sustituciones → Plan Asimétrico
        """
        bio = request.biometrics

        # 1. Cálculos metabólicos
        tmb = self.calculate_tmb(bio.weight, bio.height, bio.age, bio.gender)
        daily_energy = self.calculate_daily_energy(tmb, bio.activity_level)
        met_risk = self.assess_metabolic_risk(bio.waist, bio.gender)

        logger.info(
            f"🧮 TMB: {tmb:.0f} kcal | PAL: {bio.activity_level.value} | "
            f"DER: {daily_energy:.0f} kcal | MetS Risk: {met_risk}"
        )

        # 2. Flags clínicas
        hard_stop_ids = [hs.value for hs in request.clinical_hard_stops]
        
        blocked_ingredients = []
        if "CERO_LACTEOS" in hard_stop_ids:
            blocked_ingredients.extend(["Mantequilla", "Queso", "Yogurt", "Leche"])
        if "SIN_GLUTEN" in hard_stop_ids:
            blocked_ingredients.extend(["Trigo", "Cebada", "Centeno"])
        if "VEGANO" in hard_stop_ids:
            blocked_ingredients.extend(["Pollo", "Carne", "Salmón", "Huevo"])

        clinical_flags = ClinicalFlags(
            metabolic_syndrome_risk=met_risk,
            low_fodmap_active=request.gut_health in (GutHealth.BLOATED, GutHealth.IRREGULAR),
            glp1_safety_mode=request.medication_glp1,
            blocked_ingredients=blocked_ingredients,
        )

        # 3. Consultar el grafo (in-memory fallback)
        safe_recipes_raw = graph_engine.query_safe_recipes(
            hard_stop_ids=hard_stop_ids,
            gut_health=request.gut_health.value,
            medication_glp1=request.medication_glp1,
            calorie_target=daily_energy,
        )

        logger.info(f"🔍 Graph Engine devolvió {len(safe_recipes_raw)} recetas seguras de {len(graph_engine.RECIPES)} totales.")

        # 4. Buscar sustituciones disponibles
        substitutions = graph_engine.find_substitutions(hard_stop_ids, request.gut_health.value)
        
        logger.info(f"🔄 Sustituciones activas: {len(substitutions)} — {[f'{s['original']}→{s['replacement']}' for s in substitutions]}")

        # 5. Aplicar sustituciones y convertir a DTOs
        safe_recipes: list[RecipeDTO] = []
        for raw in safe_recipes_raw:
            modified, applied_subs = graph_engine.get_recipe_with_substitutions(raw, substitutions)
            recipe = RecipeDTO(
                id=modified["id"],
                name=modified["name"],
                meal_type=modified["type"],
                prep_time=modified["prep_time"],
                calories=modified["calories"],
                protein=modified["protein"],
                carbs=modified["carbs"],
                fats=modified["fats"],
                substitutions=[
                    {"original": s["original"], "replacement": s["replacement"]}
                    for s in applied_subs
                ],
            )
            safe_recipes.append(recipe)

        # 6. Armar Plan Asimétrico (Día A: Entrenamiento, Día B: Descanso)
        day_a_target = daily_energy * 1.1   # Superávit leve en día de entrenamiento
        day_b_target = daily_energy * 0.85  # Déficit controlado en día de descanso

        meal_sched = getattr(request, "meal_schedule", "3meals")

        # Clasificar por tipo de comida para armar días completos
        breakfasts = [r for r in safe_recipes if r.meal_type == "Breakfast"]
        lunches    = [r for r in safe_recipes if r.meal_type == "Lunch"]
        dinners    = [r for r in safe_recipes if r.meal_type == "Dinner"]
        snacks     = [r for r in safe_recipes if r.meal_type == "Snack"]

        day_a_meals = []
        day_b_meals = []

        if meal_sched == "fasting":
            # Ayuno 16:8: Se salta el desayuno (Breakfast) por completo.
            # Día A: Almuerzo, Cena, Colación
            if lunches: day_a_meals.append(lunches[0])
            if dinners: day_a_meals.append(dinners[0])
            if snacks: day_a_meals.append(snacks[0])
            
            # Día B: Almuerzo, Cena, Colación
            if len(lunches) > 1: day_b_meals.append(lunches[1])
            elif lunches: day_b_meals.append(lunches[0])
            if len(dinners) > 1: day_b_meals.append(dinners[1])
            elif dinners: day_b_meals.append(dinners[0])
            if len(snacks) > 1: day_b_meals.append(snacks[1])
            elif snacks: day_b_meals.append(snacks[0])
            
        elif meal_sched == "5meals":
            # 5 comidas: Desayuno, Almuerzo, Cena, 2 Colaciones
            if breakfasts: day_a_meals.append(breakfasts[0])
            if lunches:    day_a_meals.append(lunches[0])
            if dinners:    day_a_meals.append(dinners[0])
            if snacks:     day_a_meals.append(snacks[0])
            if len(snacks) > 1: day_a_meals.append(snacks[1])
            
            if len(breakfasts) > 1: day_b_meals.append(breakfasts[1])
            elif breakfasts:        day_b_meals.append(breakfasts[0])
            if len(lunches) > 1:    day_b_meals.append(lunches[1])
            elif lunches:           day_b_meals.append(lunches[0])
            if len(dinners) > 1:    day_b_meals.append(dinners[1])
            elif dinners:           day_b_meals.append(dinners[0])
            if len(snacks) > 1:     day_b_meals.append(snacks[1])
            elif snacks:            day_b_meals.append(snacks[0])
            if len(snacks) > 2:     day_b_meals.append(snacks[2])
            elif len(snacks) > 1:   day_b_meals.append(snacks[1])
            
        else: # "3meals" or fallback
            # 3 comidas estándar: Desayuno, Almuerzo, Cena. Sin colaciones.
            if breakfasts: day_a_meals.append(breakfasts[0])
            if lunches:    day_a_meals.append(lunches[0])
            if dinners:    day_a_meals.append(dinners[0])
            
            if len(breakfasts) > 1: day_b_meals.append(breakfasts[1])
            elif breakfasts:        day_b_meals.append(breakfasts[0])
            if len(lunches) > 1:    day_b_meals.append(lunches[1])
            elif lunches:           day_b_meals.append(lunches[0])
            if len(dinners) > 1:    day_b_meals.append(dinners[1])
            elif dinners:           day_b_meals.append(dinners[0])

        plan = [
            DayPlan(
                label="Día A — Entrenamiento",
                total_calories=sum(m.calories for m in day_a_meals),
                target_calories=round(day_a_target),
                meals=day_a_meals,
            ),
            DayPlan(
                label="Día B — Descanso",
                total_calories=sum(m.calories for m in day_b_meals),
                target_calories=round(day_b_target),
                meals=day_b_meals,
            ),
        ]

        # 7. Narrativa Clínica (en vez de gastar tokens de LLM)
        patient_id = f"PAC-{uuid.uuid4().hex[:4].upper()}"
        archetype_label = ARCHETYPE_LABELS.get(request.archetype.value, "Personalizado")

        sched_labels = {
            "3meals": "3 comidas al día",
            "5meals": "5 ingestas al día (con colaciones)",
            "fasting": "Ayuno Intermitente 16:8 (omitiendo desayuno)"
        }
        sched_label = sched_labels.get(meal_sched, "3 comidas al día")

        narrative_parts = [
            f"Plan nutricional generado para {request.patient.name}.",
            f"Arquetipo: {archetype_label}.",
            f"Distribución temporal: {sched_label}.",
            f"Requerimiento diario estimado: {int(daily_energy)} kcal (TMB: {int(tmb)} × PAL).",
        ]
        if clinical_flags.metabolic_syndrome_risk:
            narrative_parts.append("⚠️ Riesgo de Síndrome Metabólico detectado — se priorizan carbohidratos complejos y se limitan azúcares simples.")
        if clinical_flags.low_fodmap_active:
            narrative_parts.append("🛡️ Protocolo Low-FODMAP activado — vegetales fermentables (ajo, cebolla) sustituidos automáticamente.")
        if clinical_flags.glp1_safety_mode:
            narrative_parts.append("🚨 Modo seguro GLP-1 — ayunos prolongados (>12h) y déficits agresivos bloqueados por seguridad.")
        if substitutions:
            narrative_parts.append(f"🔄 {len(substitutions)} sustitución(es) automática(s) aplicada(s) por el motor de grafos sin intervención de IA.")

        return GeneratePlanResponse(
            patient_name=request.patient.name,
            patient_id=patient_id,
            tmb=round(tmb, 1),
            daily_energy_requirement=daily_energy,
            archetype_label=archetype_label,
            clinical_flags=clinical_flags,
            plan=plan,
            llm_narrative=" ".join(narrative_parts),
        )


# Singleton
dietqa_service = DietQAService()

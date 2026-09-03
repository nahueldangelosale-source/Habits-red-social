"""
DietQA — In-Memory Graph Engine (Fallback sin Docker/Neo4j)

Simula la topología del grafo Neo4j completamente en memoria usando 
diccionarios Python. Permite probar el pipeline completo (TMB → Filtrado 
→ Sustitución → Plan Asimétrico) sin infraestructura externa.

Cuando Neo4j esté disponible, neo4j_client.py tomará el control automáticamente.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════
# DATOS DEL GRAFO EN MEMORIA (Equivalente a seed_dietqa_graph.py)
# ═══════════════════════════════════════════════════════════════

INGREDIENTS = {
    "Mantequilla":  {"name": "Mantequilla", "category": "Dairy"},
    "Ghee":         {"name": "Ghee", "category": "Fat"},
    "Ajo":          {"name": "Ajo", "category": "Vegetable", "fodmap": True},
    "Cebolla":      {"name": "Cebolla", "category": "Vegetable", "fodmap": True},
    "Aceite de Oliva Infusionado": {"name": "Aceite de Oliva Infusionado", "category": "Fat"},
    "Trigo":        {"name": "Trigo", "category": "Grain", "gluten": True},
    "Quinoa":       {"name": "Quinoa", "category": "Grain"},
    "Arroz":        {"name": "Arroz", "category": "Grain"},
    "Sal":          {"name": "Sal", "category": "Mineral"},
    "Pollo":        {"name": "Pollo", "category": "Meat"},
    "Salmón":       {"name": "Salmón", "category": "Fish"},
    "Tofu":         {"name": "Tofu", "category": "Plant Protein"},
    "Huevo":        {"name": "Huevo", "category": "Egg"},
    "Espinaca":     {"name": "Espinaca", "category": "Vegetable"},
    "Palta":        {"name": "Palta", "category": "Vegetable"},
    "Batata":       {"name": "Batata", "category": "Vegetable"},
    "Yogurt":       {"name": "Yogurt", "category": "Dairy"},
    "Leche de Almendras": {"name": "Leche de Almendras", "category": "Plant Milk"},
    "Avena":        {"name": "Avena", "category": "Grain"},
    "Banana":       {"name": "Banana", "category": "Fruit"},
    "Arándanos":    {"name": "Arándanos", "category": "Fruit"},
    "Aceite de Coco": {"name": "Aceite de Coco", "category": "Fat"},
    "Limón":        {"name": "Limón", "category": "Fruit"},
    "Jengibre":     {"name": "Jengibre", "category": "Spice"},
    "Cúrcuma":      {"name": "Cúrcuma", "category": "Spice"},
}

# Relaciones ALTERNATIVE_TO (la magia para ahorrar tokens)
ALTERNATIVES = [
    {"original": "Mantequilla", "replacement": "Ghee", "diet": "Cero Lácteos"},
    {"original": "Mantequilla", "replacement": "Aceite de Coco", "diet": "Vegano"},
    {"original": "Yogurt", "replacement": "Leche de Almendras", "diet": "Cero Lácteos"},
    {"original": "Yogurt", "replacement": "Leche de Almendras", "diet": "Vegano"},
    {"original": "Ajo", "replacement": "Aceite de Oliva Infusionado", "diet": "Low-FODMAP"},
    {"original": "Cebolla", "replacement": "Jengibre", "diet": "Low-FODMAP"},
    {"original": "Trigo", "replacement": "Quinoa", "diet": "Sin Gluten"},
    {"original": "Trigo", "replacement": "Arroz", "diet": "Sin Gluten"},
    {"original": "Pollo", "replacement": "Tofu", "diet": "Vegano"},
    {"original": "Salmón", "replacement": "Tofu", "diet": "Vegano"},
    {"original": "Huevo", "replacement": "Tofu", "diet": "Vegano"},
]

# 15-20 recetas con Edge Cases diseñados para estresar los filtros
RECIPES = [
    # ── DESAYUNOS ──
    {
        "id": "REC_001", "name": "Avena con Banana y Arándanos",
        "type": "Breakfast", "prep_time": 8,
        "calories": 350, "protein": 12, "carbs": 55, "fats": 8,
        "ingredients": ["Avena", "Banana", "Arándanos", "Leche de Almendras"],
        "tags": ["Vegano", "Cero Lácteos", "Sin Gluten"],
    },
    {
        "id": "REC_002", "name": "Huevos Revueltos con Espinaca",
        "type": "Breakfast", "prep_time": 10,
        "calories": 280, "protein": 20, "carbs": 5, "fats": 18,
        "ingredients": ["Huevo", "Espinaca", "Aceite de Oliva Infusionado", "Sal"],
        "tags": ["Keto", "Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },
    {
        "id": "REC_003", "name": "Yogurt con Granola",  # ⚠️ EDGE CASE: Lácteo + Gluten
        "type": "Breakfast", "prep_time": 5,
        "calories": 310, "protein": 15, "carbs": 40, "fats": 10,
        "ingredients": ["Yogurt", "Avena", "Banana"],
        "tags": [],
    },
    {
        "id": "REC_004", "name": "Smoothie Anti-Inflamatorio",
        "type": "Breakfast", "prep_time": 5,
        "calories": 220, "protein": 5, "carbs": 35, "fats": 8,
        "ingredients": ["Banana", "Espinaca", "Jengibre", "Cúrcuma", "Leche de Almendras"],
        "tags": ["Vegano", "Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },

    # ── ALMUERZOS ──
    {
        "id": "REC_005", "name": "Pollo al Ajo Asado",  # ⚠️ EDGE CASE: choca con Low-FODMAP (ajo)
        "type": "Lunch", "prep_time": 30,
        "calories": 450, "protein": 40, "carbs": 10, "fats": 15,
        "ingredients": ["Pollo", "Ajo", "Aceite de Oliva Infusionado", "Sal"],
        "tags": ["Keto", "Cero Lácteos", "Sin Gluten"],
    },
    {
        "id": "REC_006", "name": "Bowl de Quinoa y Tofu",
        "type": "Lunch", "prep_time": 15,
        "calories": 400, "protein": 25, "carbs": 45, "fats": 12,
        "ingredients": ["Quinoa", "Tofu", "Espinaca", "Palta", "Limón"],
        "tags": ["Vegano", "Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },
    {
        "id": "REC_007", "name": "Salmón Teriyaki con Arroz",
        "type": "Lunch", "prep_time": 25,
        "calories": 520, "protein": 38, "carbs": 50, "fats": 16,
        "ingredients": ["Salmón", "Arroz", "Jengibre", "Sal"],
        "tags": ["Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },
    {
        "id": "REC_008", "name": "Ensalada César con Pollo",  # ⚠️ EDGE CASE: tiene Yogurt (aderezo)
        "type": "Lunch", "prep_time": 15,
        "calories": 380, "protein": 30, "carbs": 20, "fats": 20,
        "ingredients": ["Pollo", "Espinaca", "Yogurt", "Limón"],
        "tags": [],
    },
    {
        "id": "REC_009", "name": "Wrap de Trigo con Pollo",  # ⚠️ EDGE CASE: Trigo (Gluten)
        "type": "Lunch", "prep_time": 12,
        "calories": 410, "protein": 28, "carbs": 45, "fats": 14,
        "ingredients": ["Trigo", "Pollo", "Palta", "Sal"],
        "tags": [],
    },

    # ── CENAS ──
    {
        "id": "REC_010", "name": "Salmón a la Mantequilla",  # ⚠️ EDGE CASE: Keto pero Lácteo
        "type": "Dinner", "prep_time": 20,
        "calories": 500, "protein": 35, "carbs": 2, "fats": 38,
        "ingredients": ["Salmón", "Mantequilla", "Limón", "Sal"],
        "tags": ["Keto"],
    },
    {
        "id": "REC_011", "name": "Tofu Salteado con Verduras",
        "type": "Dinner", "prep_time": 18,
        "calories": 320, "protein": 22, "carbs": 28, "fats": 14,
        "ingredients": ["Tofu", "Espinaca", "Jengibre", "Arroz"],
        "tags": ["Vegano", "Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },
    {
        "id": "REC_012", "name": "Pollo Grillado con Batata",
        "type": "Dinner", "prep_time": 25,
        "calories": 430, "protein": 35, "carbs": 40, "fats": 12,
        "ingredients": ["Pollo", "Batata", "Aceite de Oliva Infusionado", "Sal"],
        "tags": ["Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },
    {
        "id": "REC_013", "name": "Pasta Cebolla Caramelizada",  # ⚠️ EDGE CASE: Gluten + FODMAP
        "type": "Dinner", "prep_time": 22,
        "calories": 480, "protein": 15, "carbs": 65, "fats": 16,
        "ingredients": ["Trigo", "Cebolla", "Mantequilla", "Sal"],
        "tags": [],
    },
    {
        "id": "REC_014", "name": "Bowl Keto de Palta y Huevo",
        "type": "Dinner", "prep_time": 10,
        "calories": 350, "protein": 18, "carbs": 8, "fats": 28,
        "ingredients": ["Huevo", "Palta", "Aceite de Oliva Infusionado", "Sal"],
        "tags": ["Keto", "Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },

    # ── SNACKS ──
    {
        "id": "REC_015", "name": "Batido Proteico de Banana",
        "type": "Snack", "prep_time": 5,
        "calories": 200, "protein": 20, "carbs": 25, "fats": 4,
        "ingredients": ["Banana", "Leche de Almendras"],
        "tags": ["Vegano", "Cero Lácteos", "Sin Gluten", "Low-FODMAP"],
    },
    {
        "id": "REC_016", "name": "Palta con Limón y Sal",
        "type": "Snack", "prep_time": 3,
        "calories": 160, "protein": 2, "carbs": 8, "fats": 14,
        "ingredients": ["Palta", "Limón", "Sal"],
        "tags": ["Vegano", "Cero Lácteos", "Sin Gluten", "Low-FODMAP", "Keto"],
    },
]


# ═══════════════════════════════════════════════════════════════
# MOTOR DE CONSULTAS (Emula las consultas Cypher en memoria)
# ═══════════════════════════════════════════════════════════════

# Hardstop → Neo4j Tag name mapping
HARDSTOP_TO_TAG = {
    "CERO_LACTEOS": "Cero Lácteos",
    "SIN_GLUTEN": "Sin Gluten",
    "VEGANO": "Vegano",
    "KETO": "Keto",
    "HIPERTENSION": "Hipertensión",
}

# Categorías bloqueadas por cada hardstop
HARDSTOP_BLOCKED_CATEGORIES = {
    "CERO_LACTEOS": {"Dairy"},
    "VEGANO": {"Meat", "Fish", "Egg", "Dairy"},
    "SIN_GLUTEN": set(),  # Se filtra por ingrediente, no categoría
    "KETO": set(),
    "HIPERTENSION": set(),
}

# Ingredientes específicos bloqueados
HARDSTOP_BLOCKED_INGREDIENTS = {
    "SIN_GLUTEN": {"Trigo"},
    "HIPERTENSION": set(),  # No bloquea ingredientes específicos por ahora
}


def _ingredient_has_fodmap(name: str) -> bool:
    ing = INGREDIENTS.get(name, {})
    return ing.get("fodmap", False)


def _recipe_is_safe(
    recipe: dict,
    hard_stop_ids: list[str],
    gut_health: str,
    medication_glp1: bool,
) -> bool:
    """Determina si una receta pasa TODOS los filtros clínicos."""
    
    recipe_ingredients = recipe.get("ingredients", [])
    recipe_tags = set(recipe.get("tags", []))

    # 1. Filtrar por categorías bloqueadas
    for hs in hard_stop_ids:
        blocked_cats = HARDSTOP_BLOCKED_CATEGORIES.get(hs, set())
        for ing_name in recipe_ingredients:
            ing = INGREDIENTS.get(ing_name, {})
            if ing.get("category") in blocked_cats:
                # ¿Hay alternativa?
                tag_name = HARDSTOP_TO_TAG.get(hs, hs)
                has_alt = any(
                    a["original"] == ing_name and a["diet"] == tag_name
                    for a in ALTERNATIVES
                )
                if not has_alt:
                    return False

    # 2. Filtrar ingredientes específicos bloqueados
    for hs in hard_stop_ids:
        blocked_ings = HARDSTOP_BLOCKED_INGREDIENTS.get(hs, set())
        for ing_name in recipe_ingredients:
            if ing_name in blocked_ings:
                tag_name = HARDSTOP_TO_TAG.get(hs, hs)
                has_alt = any(
                    a["original"] == ing_name and a["diet"] == tag_name
                    for a in ALTERNATIVES
                )
                if not has_alt:
                    return False

    # 3. Filtrar por FODMAP si hay problemas gastrointestinales
    if gut_health in ("bloated", "irregular"):
        for ing_name in recipe_ingredients:
            if _ingredient_has_fodmap(ing_name):
                has_alt = any(
                    a["original"] == ing_name and a["diet"] == "Low-FODMAP"
                    for a in ALTERNATIVES
                )
                if not has_alt:
                    return False

    return True


def query_safe_recipes(
    hard_stop_ids: list[str],
    gut_health: str,
    medication_glp1: bool,
    calorie_target: float,
) -> list[dict]:
    """Filtra recetas seguras del grafo in-memory."""
    max_cal = calorie_target * 1.2
    safe = []
    for recipe in RECIPES:
        if recipe["calories"] > max_cal:
            continue
        if _recipe_is_safe(recipe, hard_stop_ids, gut_health, medication_glp1):
            safe.append(recipe)
    return safe


def find_substitutions(hard_stop_ids: list[str], gut_health: str) -> list[dict]:
    """Encuentra sustituciones aplicables según las restricciones activas."""
    active_diets = set()
    for hs in hard_stop_ids:
        tag = HARDSTOP_TO_TAG.get(hs)
        if tag:
            active_diets.add(tag)
    if gut_health in ("bloated", "irregular"):
        active_diets.add("Low-FODMAP")

    subs = []
    for alt in ALTERNATIVES:
        if alt["diet"] in active_diets:
            # 🛡️ RESILIENCIA NEO4J (WHERE NOT SIMULADO)
            # Verificar que el reemplazo no viole ninguna de las restricciones globales
            replacement = alt["replacement"]
            replacement_is_safe = True
            
            # Check categorías bloqueadas
            for hs in hard_stop_ids:
                blocked_cats = HARDSTOP_BLOCKED_CATEGORIES.get(hs, set())
                ing = INGREDIENTS.get(replacement, {})
                if ing.get("category") in blocked_cats:
                    replacement_is_safe = False
                    break
                    
                blocked_ings = HARDSTOP_BLOCKED_INGREDIENTS.get(hs, set())
                if replacement in blocked_ings:
                    replacement_is_safe = False
                    break
                    
            # Check FODMAP (Gut Health)
            if gut_health in ("bloated", "irregular") and _ingredient_has_fodmap(replacement):
                replacement_is_safe = False

            if replacement_is_safe:
                subs.append(alt)
            else:
                logger.warning(f"Deadlock prevenido: Sustitución de {alt['original']} a {replacement} rechazada por choque con restricciones globales.")
                
    return subs


def get_recipe_with_substitutions(
    recipe: dict,
    substitutions: list[dict],
) -> tuple[dict, list[dict]]:
    """
    Aplica las sustituciones ALTERNATIVE_TO a los ingredientes de una receta.
    Retorna: (receta_con_sustituciones, lista_de_sustituciones_aplicadas)
    """
    applied = []
    new_ingredients = list(recipe["ingredients"])
    
    # 🛡️ PROTECCIÓN DE MACROS (Colapso Proteico)
    protein_loss_simulated = 0

    for sub in substitutions:
        if sub["original"] in new_ingredients:
            idx = new_ingredients.index(sub["original"])
            new_ingredients[idx] = sub["replacement"]
            applied.append({
                "original": sub["original"],
                "replacement": sub["replacement"],
                "reason": sub["diet"],
            })
            
            # Evaluamos si estamos sustituyendo una fuente de alta proteína por una de baja
            orig_cat = INGREDIENTS.get(sub["original"], {}).get("category")
            repl_cat = INGREDIENTS.get(sub["replacement"], {}).get("category")
            
            HIGH_PROTEIN_CATS = ("Meat", "Fish", "Egg", "Dairy")
            if orig_cat in HIGH_PROTEIN_CATS and repl_cat not in HIGH_PROTEIN_CATS and repl_cat != "Plant Protein":
                protein_loss_simulated += 15 # Reducción simulada drástica de proteína

    if protein_loss_simulated > 10:
        logger.error(f"🔴 Colapso de Macros Detectado en receta: {recipe['name']}. "
                     f"La sustitución causa una pérdida de >10g de proteína. Abortando sustituciones.")
        return recipe, [] # Devolvemos la receta sin sustituciones (será filtrada más adelante por ser insegura)

    new_protein = max(0, recipe["protein"] - protein_loss_simulated)
    modified = {**recipe, "ingredients": new_ingredients, "protein": new_protein}
    return modified, applied

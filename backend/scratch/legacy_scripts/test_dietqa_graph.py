"""
Test de Estrés del Graph Engine — Worst-Case Scenario Clínico
Simula el payload: Cero Lácteos + Low-FODMAP (gut bloated) + 2200 kcal
"""
import sys
sys.path.insert(0, ".")

from app.domains.dietqa.graph_engine import (
    query_safe_recipes, find_substitutions, get_recipe_with_substitutions, RECIPES
)

print("=" * 70)
print("  TEST DE ESTRÉS — DietQA Graph Engine (In-Memory)")
print("=" * 70)

# Parámetros del Worst-Case
hard_stops = ["CERO_LACTEOS"]
gut = "bloated"    # Low-FODMAP activado
glp1 = False
target_kcal = 2200.0

print(f"\n📋 Escenario: Hard Stops={hard_stops}, Gut={gut}, GLP-1={glp1}, Target={target_kcal} kcal")
print(f"📦 Total de recetas en el grafo: {len(RECIPES)}")

# 1. Filtrar recetas seguras
safe = query_safe_recipes(hard_stops, gut, glp1, target_kcal)
print(f"\n✅ Recetas SEGURAS que pasan todos los filtros: {len(safe)}/{len(RECIPES)}")
for r in safe:
    print(f"   [{r['id']}] {r['name']:<40} {r['calories']:>5} kcal  |  Tags: {', '.join(r.get('tags', []))}")

# 2. Recetas BLOQUEADAS
safe_ids = {r["id"] for r in safe}
blocked = [r for r in RECIPES if r["id"] not in safe_ids]
print(f"\n❌ Recetas BLOQUEADAS: {len(blocked)}/{len(RECIPES)}")
for r in blocked:
    reason = []
    for ing in r.get("ingredients", []):
        if ing in ("Yogurt", "Mantequilla", "Leche"):
            reason.append(f"{ing} (Lácteo)")
        if ing in ("Ajo", "Cebolla"):
            reason.append(f"{ing} (FODMAP)")
        if ing == "Trigo":
            reason.append(f"{ing} (Gluten)")
    print(f"   [{r['id']}] {r['name']:<40} ❌ Motivo: {', '.join(reason) if reason else 'Calorías exceden rango'}")

# 3. Sustituciones activas
subs = find_substitutions(hard_stops, gut)
print(f"\n🔄 Sustituciones ALTERNATIVE_TO activas: {len(subs)}")
for s in subs:
    print(f"   {s['original']:<25} → {s['replacement']:<30} (Dieta: {s['diet']})")

# 4. Aplicar sustituciones a una receta de ejemplo
print(f"\n🧪 Ejemplo de sustitución aplicada:")
# Buscar una receta que tenga ingredientes que pueden sustituirse
test_recipe = next((r for r in RECIPES if r["id"] == "REC_005"), None)  # Pollo al Ajo
if test_recipe:
    modified, applied = get_recipe_with_substitutions(test_recipe, subs)
    print(f"   Receta: {test_recipe['name']}")
    print(f"   Original:    {test_recipe['ingredients']}")
    print(f"   Modificada:  {modified['ingredients']}")
    for a in applied:
        print(f"   Sustitución: {a['original']} → {a['replacement']} (Razón: {a['reason']})")

print("\n" + "=" * 70)
print("  ✅ TEST COMPLETADO")
print("=" * 70)

from typing import List, Dict, Any, Tuple
from app.schemas.nutrition import (
    TimeHorizonEnum, 
    SmartShoppingItemSchema, 
    ForecastPlateSchema, 
    ShoppingListResponse
)

MULTIPLIERS: Dict[str, float] = {
    "3d": 0.43,
    "1w": 1.0,
    "2w": 2.0,
    "1m": 4.0
}

RETAIL_KNOWLEDGE_BASE: Dict[str, Dict[str, str]] = {
    "pan": {"pack": "1 paquete de pan lactal (400g)", "measure": "2 rebanadas (~60g)", "yield": "Rinde ~7 desayunos"},
    "granola": {"pack": "1 bolsa o frasco (250g)", "measure": "2 cdas soperas (~30g)", "yield": "Rinde ~8 porciones"},
    "arroz": {"pack": "1 paquete de 500g o 1kg", "measure": "1 taza cocida (~150g)", "yield": "Rinde ~6 comidas"},
    "huevo": {"pack": "1 media docena (6 u)", "measure": "2 huevos enteros", "yield": "Rinde 3 desayunos"},
    "clara": {"pack": "1 sachet o 1 docena", "measure": "3 a 4 claras", "yield": "Rinde 3 tortillas"},
    "peceto": {"pack": "1 bandeja de ~500g a 1kg", "measure": "1 bife mediano (~180g)", "yield": "Rinde 3 a 5 comidas"},
    "lomo": {"pack": "1 bandeja de lomo magro (~600g)", "measure": "1 porción (~160g)", "yield": "Rinde 3 a 4 comidas"},
    "pollo": {"pack": "1 bandeja de pechuga (~1kg)", "measure": "1 pechuga mediana (~200g)", "yield": "Rinde ~5 comidas"},
    "pavo": {"pack": "1 paquete de pechuga de pavo (150g)", "measure": "2 a 3 fetas (~60g)", "yield": "Rinde 2 a 3 sandwiches"},
    "merluza": {"pack": "1 bandeja de filete fresco (~600g)", "measure": "1 filete (~200g)", "yield": "Rinde 3 cenas"},
    "salmón": {"pack": "1 filete de salmón (~400g)", "measure": "1 porción (~180g)", "yield": "Rinde 2 cenas"},
    "palta": {"pack": "2 o 3 unidades medianas", "measure": "1/2 palta (~40g)", "yield": "Rinde 4 a 6 tostadas"},
    "yogur": {"pack": "1 pote grande (500g) o 2 chicos", "measure": "1 taza o vaso (~200g)", "yield": "Rinde 3 porciones"},
    "leche": {"pack": "1 sachet de 1 litro", "measure": "1 taza (~200ml)", "yield": "Rinde 5 batidos"},
    "queso": {"pack": "1 pote de untable / 200g magro", "measure": "1 casette / 2 cdas (~40g)", "yield": "Rinde 5 porciones"},
    "frutos": {"pack": "1 bandeja de frutos rojos (150g)", "measure": "1 puñado (~80g)", "yield": "Rinde 2 meriendas"},
    "banana": {"pack": "1 racimo (~1kg)", "measure": "1 banana mediana (~100g)", "yield": "Rinde ~8 unidades"},
    "manzana": {"pack": "1 bolsa de 1kg (~5-6 u)", "measure": "1 manzana mediana (~120g)", "yield": "Rinde ~6 meriendas"},
    "brócoli": {"pack": "1 planta de brócoli fresca (400g)", "measure": "1 taza al vapor (~100g)", "yield": "Rinde 4 porciones"},
    "espinaca": {"pack": "1 paquete de espinaca lavada", "measure": "1 plato hondo (~150g)", "yield": "Rinde 2 tortillas/guarniciones"},
    "calabaza": {"pack": "1/2 calabaza mediana (~1kg)", "measure": "1 porción puré (~180g)", "yield": "Rinde 4 a 5 porciones"},
    "papa": {"pack": "1 bolsa de papas (1 a 2kg)", "measure": "1 papa mediana (~150g)", "yield": "Rinde 6 a 8 guarniciones"},
    "batata": {"pack": "1/2 kg de batatas", "measure": "1 batata chica (~120g)", "yield": "Rinde 4 porciones"},
    "aceite": {"pack": "1 botella de oliva (500ml)", "measure": "1 cucharada (~10ml)", "yield": "Rinde 50 ensaladas"},
    "tomate": {"pack": "1/2 kg de tomates", "measure": "1 tomate mediano (~120g)", "yield": "Rinde 4 ensaladas"},
    "avena": {"pack": "1 paquete de avena (400g)", "measure": "4 cdas soperas (~45g)", "yield": "Rinde 9 desayunos/pancakes"},
    "whey": {"pack": "1 pote o doy pack (900g)", "measure": "1 scoop (~30g)", "yield": "Rinde 30 batidos"},
    "tortilla": {"pack": "1 paquete de 6 a 10 tortillas", "measure": "2 tortillas (~60g)", "yield": "Rinde 3 a 5 comidas"},
    "quinoa": {"pack": "1 paquete de 250g", "measure": "1/2 taza cocida (~100g)", "yield": "Rinde 5 bowls"}
}

class ShoppingListService:
    """
    Servicio para orquestar y consolidar listas de compras inteligentes
    a partir de las comidas y recetas planificadas en el plan nutricional del atleta.
    """

    @classmethod
    def generate_from_plan(
        cls, 
        meals: List[Dict[str, Any]], 
        time_horizon: str = "1w"
    ) -> ShoppingListResponse:
        multiplier = MULTIPLIERS.get(time_horizon, 1.0)
        consolidation: Dict[str, SmartShoppingItemSchema] = {}
        plate_counts: Dict[str, Dict[str, Any]] = {}

        # Iterar sobre las comidas del plan (se asume ciclo de 7 días o lista de comidas)
        for meal in meals:
            meal_type = meal.get("mealType") or meal.get("meal_type") or meal.get("name") or "Comida"
            options = meal.get("options") or []
            
            # Tomar la opción activa (o la primera)
            if options:
                active_opt = options[0]
                opt_name = active_opt.get("name") or meal_type
                total_macros = active_opt.get("totalMacros") or active_opt.get("total_macros") or {}
                cals = total_macros.get("calories", 350)

                if opt_name not in plate_counts:
                    plate_counts[opt_name] = {
                        "name": opt_name,
                        "qty": 0,
                        "cals": cals,
                        "tag": meal_type
                    }
                plate_counts[opt_name]["qty"] += 1

                ingredients = active_opt.get("ingredients") or []
                for ing in ingredients:
                    ing_name = ing.get("name", "").strip()
                    if not ing_name:
                        continue
                    
                    key = ing_name.lower().strip()
                    qty = float(ing.get("quantity") or ing.get("amount") or 0)
                    unit = ing.get("unit") or "g"

                    if key in consolidation:
                        consolidation[key].raw_amount += qty
                    else:
                        category, packaging, measure, yield_desc = cls._categorize_and_package(ing_name, qty, unit, time_horizon)
                        consolidation[key] = SmartShoppingItemSchema(
                            id=key,
                            name=ing_name,
                            raw_amount=qty,
                            raw_unit=unit,
                            category=category,
                            retail_packaging=packaging,
                            household_measure=measure,
                            yield_description=yield_desc
                        )

        # Escalar cantidades según el horizonte de tiempo
        scaled_items: List[SmartShoppingItemSchema] = []
        for item in consolidation.values():
            scaled_amount = round(item.raw_amount * multiplier)
            packaging = item.retail_packaging

            # Adaptar empaque sugerido para períodos de 15 días o 1 mes
            if time_horizon in ("2w", "1m"):
                name_l = item.name.lower()
                if "huevo" in name_l:
                    packaging = "1 maple de 30 huevos"
                elif "pollo" in name_l:
                    packaging = "2 bandejas grandes (~2kg)"
                elif "arroz" in name_l:
                    packaging = "1 paquete de 1kg"
                elif "pan" in name_l:
                    packaging = "2 paquetes de pan lactal"
                elif "avena" in name_l:
                    packaging = "2 paquetes de avena (800g)"

            scaled_items.append(
                SmartShoppingItemSchema(
                    id=item.id,
                    name=item.name,
                    raw_amount=scaled_amount,
                    raw_unit=item.raw_unit,
                    category=item.category,
                    retail_packaging=packaging,
                    household_measure=item.household_measure,
                    yield_description=item.yield_description
                )
            )

        # Agrupar por categorías
        grouped: Dict[str, List[SmartShoppingItemSchema]] = {}
        for item in scaled_items:
            if item.category not in grouped:
                grouped[item.category] = []
            grouped[item.category].append(item)

        # Forecast de platos
        forecast_plates = [
            ForecastPlateSchema(
                name=p["name"],
                qty=max(1, round(p["qty"] * multiplier)),
                cals=p["cals"],
                tag=p["tag"]
            )
            for p in plate_counts.values()
        ]

        return ShoppingListResponse(
            time_horizon=time_horizon,
            multiplier=multiplier,
            total_items=len(scaled_items),
            items=scaled_items,
            grouped_items=grouped,
            forecast_plates=forecast_plates
        )

    @classmethod
    def _categorize_and_package(cls, name: str, qty: float, unit: str, time_horizon: str) -> Tuple[str, str, str, str]:
        n = name.lower()
        category = "Otros / Almacén"
        retail_packaging = "1 unidad / paquete chico"
        household_measure = f"{qty}{unit} por plato"
        yield_desc = "Rinde según plan"

        for kw, info in RETAIL_KNOWLEDGE_BASE.items():
            if kw in n:
                retail_packaging = info["pack"]
                household_measure = info["measure"]
                yield_desc = info["yield"]
                break

        if any(w in n for w in ["pollo", "carne", "peceto", "lomo", "atún", "salmón", "merluza", "huevo", "clara", "pavo"]):
            category = "Carnes, Pescados & Huevos"
        elif any(w in n for w in ["arroz", "avena", "pan", "quinoa", "granola", "fideos", "lentejas", "harina", "tortilla"]):
            category = "Granos, Cereales & Harinas"
        elif any(w in n for w in ["palta", "brócoli", "tomate", "hojas", "frutos", "espinaca", "calabaza", "batata", "papa", "banana", "manzana", "zanahoria", "pimiento", "cebolla"]):
            category = "Frutas & Verduras Frescas"
        elif any(w in n for w in ["yogur", "leche", "queso", "whey", "proteína"]):
            category = "Lácteos & Proteínas"
        elif any(w in n for w in ["aceite", "miel", "chía", "nuez", "almendra"]):
            category = "Grasas Saludables & Especias"

        return category, retail_packaging, household_measure, yield_desc

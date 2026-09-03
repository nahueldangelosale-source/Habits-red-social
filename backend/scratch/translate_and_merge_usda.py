"""
Script de Traducción, Estandarización y Fusión: USDA FoodData Central Foundation -> SARA Master Database
Bienestar APP - Agosto 2026
"""

import csv
import json
import os
import re

# Diccionario exhaustivo de traducción y embellecimiento para los alimentos Foundation del USDA
TRANSLATION_RULES = [
    (r'\bHummus, commercial\b', 'Hummus de garbanzos tradicional'),
    (r'\bMilk, reduced fat, fluid, 2% milkfat.*', 'Leche semidescremada fluida 2%'),
    (r'\bMilk, lowfat, fluid, 1% milkfat.*', 'Leche semidescremada fluida 1%'),
    (r'\bMilk, nonfat, fluid.*\(fat free or skim\)', 'Leche descremada 0% grasa'),
    (r'\bMilk, whole, 3\.25% milkfat.*', 'Leche entera fluida 3.25%'),
    (r'\bTomatoes, grape, raw\b', 'Tomates cherry / uva frescos'),
    (r'\bTomatoes, canned, red, ripe, diced\b', 'Tomates perita en cubos enlatados'),
    (r'\bSalt, table, iodized\b', 'Sal de mesa yodada'),
    (r'\bBeans, snap, green, canned, regular pack, drained solids\b', 'Chauchas / Judías verdes enlatadas escurridas'),
    (r'\bBroccoli, raw\b', 'Brócoli fresco crudo'),
    (r'\bFrankfurter, beef, unheated\b', 'Salchicha de ternera tipo viena'),
    (r'\bNuts, almonds, dry roasted, with salt added\b', 'Almendras tostadas sin aceite con sal'),
    (r'\bCheese, ricotta, whole milk\b', 'Queso Ricotta de leche entera'),
    (r'\bKale, raw\b', 'Kale / Col rizada fresca cruda'),
    (r'\bKale, frozen, cooked, boiled, drained, without salt\b', 'Kale / Col rizada cocida al vapor sin sal'),
    (r'\bEgg, whole, raw, frozen, pasteurized\b', 'Huevo entero líquido pasteurizado'),
    (r'\bEgg, white, raw, frozen, pasteurized\b', 'Claras de huevo líquidas pasteurizadas'),
    (r'\bEgg, white, dried\b', 'Clara de huevo en polvo deshidratada'),
    (r'\bEgg, whole, dried\b', 'Huevo entero en polvo deshidratado'),
    (r'\bEgg, yolk, raw, frozen, pasteurized\b', 'Yema de huevo líquida pasteurizada'),
    (r'\bEgg, yolk, dried\b', 'Yema de huevo en polvo deshidratada'),
    (r'\bSauce, salsa, ready-to-serve\b', 'Salsa mexicana fresca de tomate y vegetales'),
    (r'\bSauce, pasta, spaghetti/marinara, ready-to-serve\b', 'Salsa marinara / pomodoro para pastas'),
    (r'\bSausage, breakfast sausage, beef, pre-cooked, unprepared\b', 'Salchicha de ternera para desayuno'),
    (r'\bOnion rings, breaded, par fried, frozen, prepared, heated in oven\b', 'Aros de cebolla rebozados al horno'),
    (r'\bPickles, cucumber, dill or kosher dill\b', 'Pepinillos en vinagre con eneldo'),
    (r'\bPeanut butter, smooth style, with salt\b', 'Mantequilla / Pasta de maní cremosa'),
    (r'\bCheese, parmesan, grated\b', 'Queso Parmesano rallado'),
    (r'\bCheese, pasteurized process, American, vitamin D fortified\b', 'Queso procesado tipo americano en fetas'),
    (r'\bCheese, swiss\b', 'Queso Suizo / Emmental'),
    (r'\bCheese, cheddar\b', 'Queso Cheddar madurado'),
    (r'\bCheese, cottage, lowfat, 2% milkfat\b', 'Queso Cottage magro 2%'),
    (r'\bCheese, mozzarella, low moisture, part-skim\b', 'Queso Mozzarella semidescremado'),
    (r'\bCheese, dry white, queso seco\b', 'Queso blanco seco rallable'),
    (r'\bGrapefruit juice, white, canned or bottled, unsweetened\b', 'Jugo de pomelo blanco 100% puro sin azúcar'),
    (r'\bPeaches, yellow, raw\b', 'Durazno / Melocotón amarillo fresco'),
    (r'\bSeeds, sunflower seed kernels, dry roasted, with salt added\b', 'Semillas de girasol tostadas con sal'),
    (r'\bSausage, Italian, pork, mild, cooked, pan-fried\b', 'Chorizo italiano de cerdo cocido'),
    (r'\bBread, white, commercially prepared\b', 'Pan blanco de molde de mesa'),
    (r'\bBread, whole-wheat, commercially prepared\b', 'Pan integral 100% de trigo'),
    (r'\bSausage, turkey, breakfast links, mild, raw\b', 'Salchicha magra de pavo para desayuno'),
    (r'\bCarrots, frozen, unprepared.*', 'Zanahorias congeladas en cubos'),
    (r'\bMustard, prepared, yellow\b', 'Mostaza amarilla tradicional preparada'),
    (r'\bFigs, dried, uncooked\b', 'Higos secos deshidratados'),
    (r'\bKiwifruit, green, raw\b', 'Kiwi verde fresco crudo'),
    (r'\bMelons, cantaloupe, raw\b', 'Melón cantalupo dulce fresco'),
    (r'\bNectarines, raw\b', 'Nectarina / Pelón fresco crudo'),
    (r'\bOranges, raw, navels.*', 'Naranja de ombligo fresca jugosa'),
    (r'\bStrawberries, raw\b', 'Frutillas / Fresas frescas crudas'),
    (r'\bLettuce, cos or romaine, raw\b', 'Lechuga romana fresca cruda'),
    (r'\bYogurt, Greek, plain, nonfat\b', 'Yogur griego natural 0% grasa sin azúcar'),
    (r'\bYogurt, Greek, strawberry, nonfat\b', 'Yogur griego sabor frutilla 0% grasa'),
    (r'\bOil, coconut\b', 'Aceite de coco extra virgen'),
    (r'\bTurkey, ground, 93% lean, 7% fat, pan-broiled crumbles\b', 'Carne picada de pavo 93% magra cocida'),
    (r'\bChicken, broilers or fryers, drumstick, meat only, cooked, braised\b', 'Pata de pollo cocida sin piel'),
    (r'\bChicken, broiler or fryers, breast, skinless, boneless, meat only, cooked, braised\b', 'Pechuga de pollo cocida sin piel ni hueso'),
    (r'\bHam, sliced, pre-packaged, deli meat.*', 'Jamón cocido magro natural feteado'),
    (r'\bPears, raw, bartlett.*', 'Pera Williams / Bartlett fresca cruda'),
    (r'\bOlives, green, Manzanilla, stuffed with pimiento\b', 'Aceitunas verdes rellenas con morrón'),
    (r'\bSausage, pork, chorizo, link or ground, cooked, pan-fried\b', 'Chorizo de cerdo parrillero cocido'),
    (r'\bCookies, oatmeal, soft, with raisins\b', 'Galletitas suaves de avena con pasas de uva'),
    (r'\bFish, haddock, raw\b', 'Pescado Abadejo / Haddock fresco crudo'),
    (r'\bFish, pollock, raw\b', 'Pescado Abadejo de Alaska / Pollock fresco crudo'),
    (r'\bFish, tuna, light, canned in water, drained solids\b', 'Atún claro al natural enlatado escurrido'),
    (r'\bSugars, granulated\b', 'Azúcar blanco refinado de mesa'),
    (r'\bRestaurant, Chinese, sweet and sour pork\b', 'Cerdo agridulce estilo oriental'),
    (r'\bRestaurant, Chinese, fried rice, without meat\b', 'Arroz frito con vegetales estilo oriental'),
    (r'\bRestaurant, Latino, tamale, pork\b', 'Tamal tradicional relleno de cerdo'),
    (r'\bRestaurant, Latino, pupusas con frijoles.*\b', 'Pupusa de masa de maíz con frijoles'),
    (r'\bBeef, loin, top loin steak, boneless, lip-on, separable lean only, trimmed to 1/8" fat, choice, raw\b', 'Bife de chorizo / Bife angosto vacuno magro crudo'),
    (r'\bBeef, loin, tenderloin roast, separable lean only, boneless, trimmed to 0" fat, select, cooked, roasted\b', 'Lomo vacuno asado al horno 100% magro'),
    (r'\bBeef, round, eye of round roast, boneless, separable lean only, trimmed to 0" fat, select, raw\b', 'Peceto vacuno magro sin grasa crudo'),
    (r'\bBeef, round, top round roast, boneless, separable lean only, trimmed to 0" fat, select, raw\b', 'Nalga vacuna magra para milanesas cruda'),
    (r'\bBeef, short loin, t-bone steak, bone-in, separable lean only, trimmed to 1/8" fat, choice, cooked, grilled\b', 'Bife T-Bone con hueso a la parrilla'),
    (r'\bBeef, short loin, porterhouse steak, separable lean only, trimmed to 1/8" fat, select, raw\b', 'Bife Porterhouse / Costeleta ancha vacuna cruda'),
    (r'\bBeans, Dry, Dark Red Kidney.*', 'Porotos / Frijoles colorados oscuros secos crudos'),
    (r'\bBeans, Dry, Pink.*', 'Porotos / Frijoles rosados secos crudos'),
    (r'\bBeans, Dry, Navy.*', 'Porotos / Frijoles blancos chicos secos crudos'),
    (r'\bBeans, Dry, Light Red Kidney.*', 'Porotos / Frijoles rojos claros secos crudos'),
    (r'\bBeans, Dry, Brown.*', 'Porotos / Frijoles marrones secos crudos'),
    (r'\bBeans, Dry, Flor de Mayo.*', 'Porotos / Frijoles Flor de Mayo secos crudos'),
    (r'\bBeans, Dry, Carioca.*', 'Porotos / Frijoles Carioca secos crudos'),
    (r'\bBeans, Dry, Tan.*', 'Porotos / Frijoles crema secos crudos'),
    (r'\bBeans, Dry, Pinto.*', 'Porotos / Frijoles pintos secos crudos'),
    (r'\bBeans, Dry, Small Red.*', 'Porotos / Frijoles rojos pequeños secos crudos'),
    (r'\bBeans, Dry, Medium Red.*', 'Porotos / Frijoles rojos medianos secos crudos'),
    (r'\bBeans, Dry, Cranberry.*', 'Porotos / Frijoles Cranberry secos crudos'),
    (r'\bBeans, Dry, Light Tan.*', 'Porotos / Frijoles bayos claros secos crudos'),
    (r'\bBeans, Dry, Black.*', 'Porotos / Frijoles negros secos crudos'),
    (r'\bBeans, Dry, Small White.*', 'Porotos / Frijoles blancos pequeños secos crudos'),
    (r'\bBeans, Dry, Red.*', 'Porotos / Frijoles rojos secos crudos'),
    (r'\bBeans, Dry, Great Northern.*', 'Porotos / Frijoles blancos Great Northern secos crudos'),
    (r'\bSpinach, raw\b', 'Espinaca fresca cruda'),
    (r'\bSpinach, baby\b', 'Espinaca baby tierna cruda'),
    (r'\bBlueberries, raw\b', 'Arándanos frescos crudos'),
    (r'\bAvocados, raw, all commercial varieties\b', 'Palta / Aguacate Hass fresco'),
    (r'\bWalnuts, English\b', 'Nueces mariposa peladas'),
    (r'\bApples, fuji, with skin, raw\b', 'Manzana Fuji con piel cruda'),
    (r'\bApples, gala, with skin, raw\b', 'Manzana Gala con piel cruda'),
    (r'\bApples, granny smith, with skin, raw\b', 'Manzana verde Granny Smith con piel cruda'),
    (r'\bApples, red delicious, with skin, raw\b', 'Manzana Red Delicious con piel cruda'),
    (r'\bApples, honeycrisp, with skin, raw\b', 'Manzana Honeycrisp con piel cruda'),
    (r'\bSalmon, Atlantic, farmed, raw\b', 'Salmón rosado del Atlántico fresco crudo'),
    (r'\bSalmon, Atlantic, wild, raw\b', 'Salmón rosado salvaje fresco crudo'),
    (r'\bOats, whole grain, rolled, old fashioned\b', 'Avena tradicional arrollada en copos'),
    (r'\bQuinoa, uncooked\b', 'Quinoa en grano cruda'),
    (r'\bLentils, mature seeds, raw\b', 'Lentejas secas crudas'),
    (r'\bChickpeas, \(garbanzo beans, bengal gram\), mature seeds, raw\b', 'Garbanzos secos crudos'),
    (r'\bSweet potato, raw, unprepared\b', 'Batata / Camote fresco crudo'),
    (r'\bPotatoes, russet, flesh and skin, raw\b', 'Papa / Patata Russet con piel cruda'),
    (r'\bPotatoes, red, flesh and skin, raw\b', 'Papa roja con piel cruda'),
    (r'\bPotatoes, white, flesh and skin, raw\b', 'Papa blanca con piel cruda'),
    (r'\bPotatoes, gold, flesh and skin, raw\b', 'Papa amarilla / dorada con piel cruda'),
    (r'\bRice, white, long-grain, regular, raw, unenriched\b', 'Arroz blanco grano largo fino crudo'),
    (r'\bRice, brown, long-grain, raw\b', 'Arroz integral grano largo crudo'),
    (r'\bRice, jasmine, raw\b', 'Arroz Jazmín aromático crudo'),
    (r'\bRice, basmati, raw\b', 'Arroz Basmati aromático crudo'),
    (r'\bChia seeds, dried\b', 'Semillas de chía deshidratadas'),
    (r'\bFlaxseed, ground\b', 'Semillas de lino / linaza molidas'),
    (r'\bOil, olive, extra virgin\b', 'Aceite de oliva extra virgen'),
    (r'\bOil, avocado\b', 'Aceite de palta / aguacate puro')
]

WORD_REPLACEMENTS = {
    'raw': 'crudo',
    'cooked': 'cocido',
    'baked': 'al horno',
    'boiled': 'hervido',
    'roasted': 'asado',
    'fried': 'frito',
    'pan-fried': 'a la plancha / sartén',
    'grilled': 'a la parrilla',
    'steamed': 'al vapor',
    'braised': 'estofado',
    'skinless': 'sin piel',
    'boneless': 'deshuesado / sin hueso',
    'canned': 'enlatado',
    'frozen': 'congelado',
    'dried': 'deshidratado / seco',
    'unprepared': 'sin preparar',
    'fresh': 'fresco',
    'dry roasted': 'tostado en seco',
    'nonfat': 'descremado 0%',
    'lowfat': 'bajo en grasa',
    'reduced fat': 'reducido en grasa',
    'whole': 'entero',
    'fluid': 'fluido / líquido',
    'salted': 'con sal',
    'unsalted': 'sin sal',
    'without salt': 'sin sal',
    'with salt added': 'con sal',
    'chicken': 'pollo',
    'beef': 'ternera / carne vacuna',
    'pork': 'cerdo',
    'turkey': 'pavo',
    'fish': 'pescado',
    'beans': 'frijoles / porotos',
    'cheese': 'queso',
    'milk': 'leche',
    'egg': 'huevo',
    'nuts': 'frutos secos',
    'seeds': 'semillas',
    'oil': 'aceite',
    'bread': 'pan',
    'apples': 'manzanas',
    'pears': 'peras',
    'oranges': 'naranjas',
    'potatoes': 'papas',
    'carrots': 'zanahorias',
    'onions': 'cebollas',
    'tomatoes': 'tomates'
}

def translate_description(desc: str) -> str:
    """Traduce la descripción en inglés de USDA a español limpio."""
    # 1. Chequear reglas directas de regex
    for pattern, replacement in TRANSLATION_RULES:
        if re.search(pattern, desc, re.IGNORECASE):
            return replacement

    # 2. Limpieza de prefijos y fragmentos genéricos
    cleaned = desc
    cleaned = re.sub(r'\(Includes foods for USDA.*?\)', '', cleaned)
    cleaned = re.sub(r'\(0% moisture\)', '(base seca)', cleaned)
    
    # 3. Traducción de términos clave por palabras
    parts = [p.strip() for p in cleaned.split(',') if p.strip()]
    translated_parts = []
    
    for part in parts:
        lower_p = part.lower()
        if lower_p in WORD_REPLACEMENTS:
            translated_parts.append(WORD_REPLACEMENTS[lower_p])
        else:
            # Reemplazar palabras internas
            p_words = part.split()
            tr_words = [WORD_REPLACEMENTS.get(w.lower(), w) for w in p_words]
            translated_parts.append(' '.join(tr_words))
            
    result = ' '.join(translated_parts)
    result = re.sub(r'\s+', ' ', result).strip()
    return (result[0].upper() + result[1:]) if len(result) > 0 else desc

def infer_category(desc_es: str, p: float, c: float, f: float) -> str:
    """Infiere la categoría SARA basada en el nombre traducido y macros."""
    lower = desc_es.lower()
    if any(k in lower for k in ['carne', 'ternera', 'cerdo', 'pavo', 'pollo', 'lomo', 'bife', 'salchicha', 'chorizo', 'peceto', 'nalga']):
        return 'Carnes.xls'
    if any(k in lower for k in ['pescado', 'atún', 'salmón', 'abadejo', 'pollock', 'merluza', 'haddock']):
        return 'Pescados.xls'
    if any(k in lower for k in ['leche', 'queso', 'yogur', 'ricotta', 'cottage', 'mozzarella', 'cheddar', 'parmesano']):
        return 'Leche.xls'
    if any(k in lower for k in ['huevo', 'clara', 'yema']):
        return 'Huevo.xls'
    if any(k in lower for k in ['aceite', 'mantequilla', 'pasta de maní', 'palta', 'almendras', 'nueces', 'semillas']):
        return 'Grasas.xls'
    if any(k in lower for k in ['manzana', 'pera', 'naranja', 'durazno', 'kiwi', 'frutilla', 'arándanos', 'melón', 'higos', 'jugo']):
        return 'Frutas.xls'
    if any(k in lower for k in ['arroz', 'avena', 'pan', 'quinoa', 'galletitas', 'frijoles', 'porotos', 'lentejas', 'garbanzos', 'harina']):
        return 'Cereales.xls'
    if any(k in lower for k in ['brócoli', 'kale', 'tomate', 'espinaca', 'zanahoria', 'papa', 'batata', 'cebolla', 'chauchas', 'pepinillos', 'lechuga']):
        return 'Vegetales.xls'
    if any(k in lower for k in ['azúcar', 'dulce', 'miel', 'tamal', 'pupusa']):
        return 'ProdAz.xls'
    
    # Fallback por macro predominante
    if p >= 12 and p > c:
        return 'Carnes.xls'
    if c >= 15:
        return 'Cereales.xls'
    if f >= 15:
        return 'Grasas.xls'
    return 'Vegetales.xls'


def main():
    print("Iniciando Pipeline de Traducción y Fusión USDA Foundation -> SARA...")
    
    # 1. Cargar SARA Master Database actual
    sara_path = 'web/src/data/SARA_Master_Database.json'
    with open(sara_path, 'r', encoding='utf-8') as f:
        sara_data = json.load(f)
    print(f"Base SARA actual: {len(sara_data)} alimentos.")
    
    # Registro de nombres para evitar duplicados exactos
    seen_names = {re.sub(r'[^a-zA-Z0-9]', '', item.get('Alimento', '')).lower() for item in sara_data}
    
    # 2. Cargar alimentos Foundation del USDA
    foundation_foods = {}
    with open('docs/Alimentos/FoodData_Central_foundation_food_csv_2026-04-30/food.csv', 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            if row.get('data_type') == 'foundation_food':
                foundation_foods[row['fdc_id']] = {
                    'fdc_id': row['fdc_id'],
                    'description': row['description'],
                    'calories': 0.0,
                    'protein': 0.0,
                    'fat': 0.0,
                    'carbs': 0.0,
                    'water': 0.0,
                    'ash': 0.0,
                    'sodium': 0.0,
                    'calcium': 0.0,
                    'iron': 0.0,
                    'potassium': 0.0,
                    'zinc': 0.0,
                    'vit_c': 0.0,
                    'thia': 0.0,
                    'ribf': 0.0,
                    'nia': 0.0
                }
                
    # 3. Mapear nutrientes analíticos
    with open('docs/Alimentos/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv', 'r', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            fdc_id = row['fdc_id']
            if fdc_id in foundation_foods:
                n_id = row['nutrient_id']
                try:
                    amt = float(row['amount'])
                except:
                    continue
                if n_id in ('1008', '2047', '2048') and foundation_foods[fdc_id]['calories'] == 0:
                    foundation_foods[fdc_id]['calories'] = amt
                elif n_id == '1003': foundation_foods[fdc_id]['protein'] = amt
                elif n_id == '1004': foundation_foods[fdc_id]['fat'] = amt
                elif n_id == '1005': foundation_foods[fdc_id]['carbs'] = amt
                elif n_id == '1051': foundation_foods[fdc_id]['water'] = amt
                elif n_id == '1007': foundation_foods[fdc_id]['ash'] = amt
                elif n_id == '1093': foundation_foods[fdc_id]['sodium'] = amt
                elif n_id == '1087': foundation_foods[fdc_id]['calcium'] = amt
                elif n_id == '1089': foundation_foods[fdc_id]['iron'] = amt
                elif n_id == '1092': foundation_foods[fdc_id]['potassium'] = amt
                elif n_id == '1095': foundation_foods[fdc_id]['zinc'] = amt
                elif n_id == '1162': foundation_foods[fdc_id]['vit_c'] = amt
                elif n_id == '1165': foundation_foods[fdc_id]['thia'] = amt
                elif n_id == '1166': foundation_foods[fdc_id]['ribf'] = amt
                elif n_id == '1167': foundation_foods[fdc_id]['nia'] = amt

    # 4. Traducir y transformar a formato SARA Master Schema
    added_count = 0
    merged_items = []
    
    # Deduplicar internamente descripciones repetidas de USDA
    usda_seen_descriptions = set()
    
    for fdc_id, item in foundation_foods.items():
        desc_en = item['description'].strip()
        if desc_en in usda_seen_descriptions:
            continue
        usda_seen_descriptions.add(desc_en)
        
        desc_es = translate_description(desc_en)
        p = round(item['protein'], 1)
        c = round(item['carbs'], 1)
        f = round(item['fat'], 1)
        cals = round(item['calories']) if item['calories'] > 0 else round(p*4 + c*4 + f*9)
        
        # Omitir alimentos con 0 macros totales si no son agua/sal
        if (p + c + f) == 0 and cals == 0 and 'sal' not in desc_es.lower():
            continue
            
        norm_key = re.sub(r'[^a-zA-Z0-9]', '', desc_es).lower()
        if norm_key in seen_names:
            # Si el nombre es exactamente igual, le añadimos (USDA) para distinguir el perfil analítico
            display_name = f"{desc_es} (USDA)"
        else:
            display_name = f"{desc_es} (USDA)"
            
        category = infer_category(desc_es, p, c, f)
        
        sara_entry = {
            "ID_SARA": float(100000 + int(fdc_id)),
            "Alimento": display_name,
            "ID_SARA_1": f"USDA-{fdc_id}",
            "ENERC_KJ": round(cals * 4.184, 1),
            "ENERC_KCAL": float(cals),
            "WATER": item['water'] if item['water'] > 0 else None,
            "PROTCNT": float(p),
            "FAT": float(f),
            "CHOCDF": float(c),
            "ASH": item['ash'] if item['ash'] > 0 else None,
            "Sodiomg": item['sodium'] if item['sodium'] > 0 else None,
            "K": item['potassium'] if item['potassium'] > 0 else None,
            "CA": item['calcium'] if item['calcium'] > 0 else None,
            "P": None,
            "FE": item['iron'] if item['iron'] > 0 else None,
            "ZN": item['zinc'] if item['zinc'] > 0 else None,
            "THIA": item['thia'] if item['thia'] > 0 else None,
            "RIBF": item['ribf'] if item['ribf'] > 0 else None,
            "NIA": item['nia'] if item['nia'] > 0 else None,
            "VITC": item['vit_c'] if item['vit_c'] > 0 else None,
            "origen_categoria": category
        }
        
        merged_items.append(sara_entry)
        seen_names.add(norm_key)
        added_count += 1

    print(f"Alimentos USDA Foundation procesados y traducidos: {added_count}")
    
    # 5. Fusión final
    final_database = sara_data + merged_items
    print(f"Total de alimentos en Base de Datos Unificada: {len(final_database)}")
    
    # 6. Guardar en destinos oficiales
    targets = [
        'web/src/data/SARA_Master_Database.json',
        'docs/Alimentos/SARA_Master_Database.json'
    ]
    
    for t in targets:
        with open(t, 'w', encoding='utf-8') as f:
            json.dump(final_database, f, indent=4, ensure_ascii=False)
        print(f"Guardado exitosamente en: {t}")
        
    print("\n¡Proceso de traducción e integración completado al 100%!")

if __name__ == '__main__':
    main()

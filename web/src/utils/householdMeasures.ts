/**
 * Household Measures & Plate Distribution Utility
 * Convierte gramos brutos en equivalencias pedagógicas cotidianas (cucharadas, tazas, unidades, palmas)
 * y calcula la distribución física real del plato (Método de Harvard / Plato Saludable).
 */

import type { MacroNutrients } from '../schemas/nutritionPlanSchema';

export interface PlateBreakdown {
    vegetablesGrams: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    totalGrams: number;
    vegetablesPct: number;
    proteinPct: number;
    carbsPct: number;
    fatsPct: number;
    plateConicGradient: string;
}

export type FoodPlateCategory = 'vegetables' | 'protein' | 'carbs' | 'fats';

/**
 * Clasifica un alimento en su grupo visual de plato
 */
export function categorizeFoodItem(name: string, category: string = '', macros: MacroNutrients): FoodPlateCategory {
    const n = (name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const c = (category || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // 1. Grasas, Aceites, Semillas, Frutos Secos
    if (
        n.includes('aceite') || n.includes('oliva') || n.includes('girasol') || n.includes('coco') ||
        n.includes('palta') || n.includes('aguacate') || n.includes('nuez') || n.includes('nueces') ||
        n.includes('almendra') || n.includes('mani') || n.includes('cacahuate') || n.includes('semilla') ||
        n.includes('chia') || n.includes('lino') || n.includes('manteca') || n.includes('mantequilla') ||
        n.includes('mayonesa') || (macros.fat_g * 9 > macros.calories * 0.65)
    ) {
        return 'fats';
    }

    // 2. Vegetales, Hortalizas, Ensaladas, Frutas
    if (
        n.includes('brocoli') || n.includes('espinaca') || n.includes('lechuga') || n.includes('tomate') ||
        n.includes('zanahoria') || n.includes('zapallo') || n.includes('calabaza') || n.includes('pepino') ||
        n.includes('zucchini') || n.includes('morron') || n.includes('pimiento') || n.includes('cebolla') ||
        n.includes('rucula') || n.includes('acelga') || n.includes('coliflor') || n.includes('esparrago') ||
        n.includes('berenjena') || n.includes('repollo') || n.includes('banana') || n.includes('platano') ||
        n.includes('manzana') || n.includes('pera') || n.includes('naranja') || n.includes('frutilla') ||
        n.includes('fresa') || n.includes('arandano') || n.includes('kiwi') || n.includes('durazno') ||
        c.includes('verdura') || c.includes('hortaliza') || c.includes('fruta')
    ) {
        return 'vegetables';
    }

    // 3. Proteínas Magras y Fuertes
    if (
        n.includes('pollo') || n.includes('pechuga') || n.includes('carne') || n.includes('lomo') ||
        n.includes('nalga') || n.includes('cuadril') || n.includes('bife') || n.includes('peceto') ||
        n.includes('huevo') || n.includes('clara') || n.includes('pescado') || n.includes('merluza') ||
        n.includes('atun') || n.includes('salmon') || n.includes('trucha') || n.includes('cerdo') ||
        n.includes('solomillo') || n.includes('tofu') || n.includes('whey') || n.includes('proteina') ||
        n.includes('caseina') || c.includes('carne') || c.includes('huevo') || (macros.protein_g * 4 > macros.calories * 0.45)
    ) {
        return 'protein';
    }

    // 4. Carbohidratos y Cereales Complejos (Default restante)
    return 'carbs';
}

/**
 * Calcula la distribución física del plato (Harvard Healthy Eating Plate)
 */
export function calculateVisualPlate(items: Array<{ name: string; portion_amount?: number; quantity_g?: number; macros: MacroNutrients }>): PlateBreakdown {
    let vegetablesGrams = 0;
    let proteinGrams = 0;
    let carbsGrams = 0;
    let fatsGrams = 0;

    for (const item of items) {
        const grams = Number(item.portion_amount ?? item.quantity_g ?? 100);
        const group = categorizeFoodItem(item.name, '', item.macros);

        if (group === 'vegetables') vegetablesGrams += grams;
        else if (group === 'protein') proteinGrams += grams;
        else if (group === 'fats') fatsGrams += grams;
        else carbsGrams += grams;
    }

    const totalGrams = vegetablesGrams + proteinGrams + carbsGrams + fatsGrams;

    if (totalGrams === 0) {
        return {
            vegetablesGrams: 0,
            proteinGrams: 0,
            carbsGrams: 0,
            fatsGrams: 0,
            totalGrams: 0,
            vegetablesPct: 50,
            proteinPct: 25,
            carbsPct: 25,
            fatsPct: 0,
            plateConicGradient: 'conic-gradient(#10b981 0% 50%, #f43f5e 50% 75%, #f59e0b 75% 100%)'
        };
    }

    const vegPct = Number(((vegetablesGrams / totalGrams) * 100).toFixed(1));
    const proPct = Number(((proteinGrams / totalGrams) * 100).toFixed(1));
    const carPct = Number(((carbsGrams / totalGrams) * 100).toFixed(1));
    const fatPct = Number(((fatsGrams / totalGrams) * 100).toFixed(1));

    // Conic gradient: Emerald (Vegetables), Rose (Protein), Amber (Carbs), Sky (Fats)
    const p1 = vegPct;
    const p2 = p1 + proPct;
    const p3 = p2 + carPct;

    const plateConicGradient = `conic-gradient(#10b981 0% ${p1}%, #f43f5e ${p1}% ${p2}%, #f59e0b ${p2}% ${p3}%, #0ea5e9 ${p3}% 100%)`;

    return {
        vegetablesGrams,
        proteinGrams,
        carbsGrams,
        fatsGrams,
        totalGrams,
        vegetablesPct: vegPct,
        proteinPct: proPct,
        carbsPct: carPct,
        fatsPct: fatPct,
        plateConicGradient
    };
}

/**
 * Traduce gramos/porciones a Medidas Caseras Pedagógicas en lenguaje cotidiano.
 * Valida unidades ('u', 'g', 'ml') para evitar colisiones redundantes o contradictorias.
 */
export function getHouseholdMeasure(foodName: string, quantity: number, unit: string = 'g'): string {
    if (!foodName || !quantity || quantity <= 0) return '';

    const cleanUnit = (unit || 'g').toLowerCase().trim();
    const n = foodName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // Si el nombre ya incluye la medida (ej: "(1 scoop)", "(2 rebanadas)"), no duplicar
    if (n.includes('scoop') || n.includes('rebanada') || n.includes('cda') || n.includes('taza')) {
        return '';
    }

    // SI LA UNIDAD YA ES EN UNIDADES ('u', 'unid', 'unidad', 'unidades')
    if (cleanUnit === 'u' || cleanUnit === 'unid' || cleanUnit === 'unidad' || cleanUnit === 'unidades') {
        // Ya está expresado en unidades en la interfaz (ej: "2 u", "1 u", "3 u").
        // Para evitar choque de similitud redundante (ej: "Huevos 2 u • (1 unidad grande)"), no agregamos medida redundante.
        return '';
    }

    // SI LA UNIDAD ES EN GRAMOS ('g') O MILILITROS ('ml'):
    const grams = Number(quantity);

    // 1. Aceites y grasas líquidas (oliva, coco, girasol)
    if (n.includes('aceite')) {
        if (grams <= 6) return '1 cdita de té';
        if (grams <= 14) return '1 cda sopera';
        if (grams <= 24) return '2 cdas soperas';
        const cdas = Math.round(grams / 10);
        return `~${cdas} cdas soperas`;
    }

    // 2. Palta / Aguacate
    if (n.includes('palta') || n.includes('aguacate')) {
        if (grams <= 45) return '1/4 de palta chica';
        if (grams <= 80) return '1/2 palta mediana';
        if (grams <= 130) return '3/4 de palta';
        return '1 palta entera';
    }

    // 3. Huevos enteros (cuando vienen pesados en gramos)
    if (n.includes('huevo') && !n.includes('clara')) {
        const units = Math.max(1, Math.round(grams / 55));
        return units === 1 ? '~1 huevo mediano' : `~${units} huevos enteros`;
    }

    // 4. Claras de huevo (cuando vienen pesadas en gramos)
    if (n.includes('clara')) {
        const units = Math.max(1, Math.round(grams / 35));
        return units === 1 ? '~1 clara' : `~${units} claras`;
    }

    // 5. Carnes y Pescados (Pollo, Vacuna, Cerdo, Pescado, Merluza, Atún, Salmón, Peceto, Milanesa, Lomo)
    if (
        n.includes('pollo') || n.includes('pechuga') || n.includes('carne') || n.includes('lomo') || 
        n.includes('nalga') || n.includes('pescado') || n.includes('merluza') || n.includes('atun') || 
        n.includes('salmon') || n.includes('peceto') || n.includes('cuadril') || n.includes('milanesa') ||
        n.includes('bife') || n.includes('solomillo')
    ) {
        if (grams <= 110) return '~1 filete chico (palma de la mano)';
        if (grams <= 160) return '~1 bife mediano (palma de la mano)';
        if (grams <= 220) return '~1 bife mediano/grande (palma + dedos)';
        if (grams <= 280) return '~1 porción grande (palma colmada)';
        return `~${(grams / 150).toFixed(1)} bifes medianos`;
    }

    // 6. Arroz / Fideos / Legumbres / Quinoa (pesado cocido / seco)
    if (n.includes('arroz') || n.includes('fideo') || n.includes('pasta') || n.includes('lenteja') || n.includes('garbanzo') || n.includes('poroto') || n.includes('quinoa')) {
        if (grams <= 50) return '~1/2 taza cocida';
        if (grams <= 100) return '~1 taza cocida (1 puño)';
        if (grams <= 150) return '~1.5 tazas cocidas';
        if (grams <= 220) return '~2 tazas cocidas';
        return `~${(grams / 80).toFixed(1)} tazas cocidas`;
    }

    // 7. Avena en hojuelas
    if (n.includes('avena')) {
        if (grams <= 25) return '~2 cdas soperas colmadas';
        if (grams <= 45) return '~4 cdas soperas (1/3 taza)';
        if (grams <= 70) return '~6 cdas soperas (1/2 taza)';
        if (grams <= 100) return '~1 taza rasa';
        return `~${Math.round(grams / 10)} cdas soperas`;
    }

    // 8. Pan de molde / Pan integral / Masa madre
    if (n.includes('pan')) {
        if (grams <= 35) return '~1 rebanada chica';
        if (grams <= 70) return '~2 rebanadas medianas';
        if (grams <= 110) return '~3 rebanadas (sandwich)';
        const slices = Math.round(grams / 35);
        return `~${slices} rebanadas`;
    }

    // 9. Papa / Batata / Camote
    if (n.includes('papa') || n.includes('batata') || n.includes('camote')) {
        if (grams <= 130) return '~1 papa chica';
        if (grams <= 220) return '~1 papa mediana';
        if (grams <= 360) return '~2 papas medianas o 1 grande';
        return `~${(grams / 180).toFixed(1)} papas medianas`;
    }

    // 10. Ensaladas / Hojas verdes / Tomate
    if (n.includes('mix') || n.includes('ensalada') || n.includes('hojas') || n.includes('lechuga') || n.includes('tomate')) {
        if (grams <= 100) return '~1 plato mediano';
        return '~1 plato hondo colmado';
    }

    // 11. Brócoli / Coliflor / Vegetales
    if (n.includes('brocoli') || n.includes('coliflor')) {
        if (grams <= 80) return '~3-4 arbolitos';
        if (grams <= 150) return '~1 taza de arbolitos (1 puño)';
        if (grams <= 250) return '~2 tazas de arbolitos';
        return '~1 plato hondo colmado';
    }

    // 12. Zanahoria
    if (n.includes('zanahoria')) {
        if (grams <= 70) return '~1/2 zanahoria mediana';
        if (grams <= 130) return '~1 zanahoria mediana';
        return '~2 zanahorias';
    }

    // 13. Banana / Manzana / Frutas
    if (n.includes('banana') || n.includes('platano') || n.includes('manzana') || n.includes('pera') || n.includes('naranja')) {
        if (grams <= 70) return '~1/2 fruta mediana';
        if (grams <= 120) return '~1 fruta mediana';
        if (grams <= 180) return '~1 fruta grande';
        return `~${Math.round(grams / 100)} frutas`;
    }

    // 14. Frutos secos (Nueces, Almendras, Maní)
    if (n.includes('nuez') || n.includes('nueces') || n.includes('almendra') || n.includes('mani')) {
        if (grams <= 20) return '~1 puñado chico (~8-10 unid)';
        if (grams <= 35) return '~1 puñado cerrado (~15-18 unid)';
        return '~1 puñado colmado';
    }

    // 15. Leche / Yogur
    if (n.includes('leche') || n.includes('yogur') || n.includes('bebida')) {
        if (grams <= 130) return '~1/2 taza o pote chico';
        if (grams <= 230) return '~1 pote individual o 1 taza';
        return `~${(grams / 200).toFixed(1)} tazas/potes`;
    }

    // 16. Quesos
    if (n.includes('queso')) {
        if (grams <= 25) return '~1 feta fina / 1 cda untable';
        if (grams <= 50) return '~1 casette de queso / 2 cdas colmadas';
        return `~${Math.round(grams / 30)} porciones chicas`;
    }

    // 17. Proteína Whey en polvo
    if (n.includes('whey') || n.includes('proteina')) {
        if (grams <= 35) return '~1 scoop';
        return `~${(grams / 30).toFixed(1)} scoops`;
    }

    return '';
}

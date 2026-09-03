/**
 * Smart Swap Engine — Motor de Sustitución Isocalórica e Isomacronutriente
 * 
 * Permite reemplazar cualquier alimento por alternativas bioquímicamente equivalentes
 * calculando automáticamente los gramos exactos para igualar el macronutriente dominante
 * o el valor calórico total, preservando la adherencia al plan nutricional.
 */

import { SARA_DATABASE, normalizeStr, type SaraFoodItem } from './saraSearchEngine';
import { getHouseholdMeasure } from './householdMeasures';

export type MacroDominance = 'CARBS' | 'PROTEIN' | 'FAT' | 'BALANCED';

export interface SwapAlternativeItem {
  name: string;
  category: string;
  protPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  calsPer100g: number;
  tags?: string[]; // 'vegan', 'gluten_free', 'dairy_free', etc.
}

export interface CalculatedSwap {
  name: string;
  category: string;
  quantity_g: number;
  household: string | null;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calories: number;
  };
  dominanceMatch: MacroDominance;
  matchPercentage: number;
  tag?: string;
  isCustomSearch?: boolean;
}

// ── Banco Curado de Alimentos Canónicos para Sustituciones Rápidas ─────────────

export const CANONICAL_SWAP_BANK: SwapAlternativeItem[] = [
  // ── Carbohidratos / Almidones / Tubérculos / Frutas ──
  { name: 'Avena en hojuelas', category: 'Cereales', protPer100g: 13.5, carbsPer100g: 60.0, fatPer100g: 6.5, calsPer100g: 360, tags: ['vegan', 'dairy_free'] },
  { name: 'Arroz Blanco / Basmati', category: 'Cereales', protPer100g: 7.0, carbsPer100g: 78.0, fatPer100g: 0.8, calsPer100g: 355, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Arroz Integral / Yamaní', category: 'Cereales', protPer100g: 8.0, carbsPer100g: 74.0, fatPer100g: 2.2, calsPer100g: 350, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Batata / Camote al horno', category: 'Tubérculos', protPer100g: 2.0, carbsPer100g: 24.0, fatPer100g: 0.2, calsPer100g: 105, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Papa / Patata al vapor', category: 'Tubérculos', protPer100g: 2.0, carbsPer100g: 17.0, fatPer100g: 0.1, calsPer100g: 77, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Pan Integral de Masa Madre', category: 'Panificados', protPer100g: 9.0, carbsPer100g: 45.0, fatPer100g: 2.0, calsPer100g: 235, tags: ['vegan', 'dairy_free'] },
  { name: 'Fideos / Pasta al huevo', category: 'Pastas', protPer100g: 12.0, carbsPer100g: 72.0, fatPer100g: 2.0, calsPer100g: 355, tags: ['vegetarian', 'dairy_free'] },
  { name: 'Quinoa en Grano', category: 'Cereales', protPer100g: 14.0, carbsPer100g: 64.0, fatPer100g: 6.0, calsPer100g: 368, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Banana / Plátano maduro', category: 'Frutas', protPer100g: 1.1, carbsPer100g: 23.0, fatPer100g: 0.3, calsPer100g: 95, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Manzana fresca', category: 'Frutas', protPer100g: 0.3, carbsPer100g: 14.0, fatPer100g: 0.2, calsPer100g: 58, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Galletas de Arroz', category: 'Cereales', protPer100g: 8.0, carbsPer100g: 80.0, fatPer100g: 2.0, calsPer100g: 370, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Harina de Avena', category: 'Cereales', protPer100g: 13.0, carbsPer100g: 65.0, fatPer100g: 6.5, calsPer100g: 370, tags: ['vegan', 'dairy_free'] },
  { name: 'Lentejas cocidas', category: 'Legumbres', protPer100g: 9.0, carbsPer100g: 20.0, fatPer100g: 0.5, calsPer100g: 120, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Garbanzos cocidos', category: 'Legumbres', protPer100g: 8.5, carbsPer100g: 27.0, fatPer100g: 2.6, calsPer100g: 164, tags: ['vegan', 'gluten_free', 'dairy_free'] },

  // ── Proteínas / Carnes / Huevos / Lácteos / Vegetales ──
  { name: 'Peceto / Cuadril Magro', category: 'Carnes', protPer100g: 24.0, carbsPer100g: 0.0, fatPer100g: 3.5, calsPer100g: 130, tags: ['gluten_free', 'dairy_free'] },
  { name: 'Pechuga de Pollo sin piel', category: 'Carnes', protPer100g: 23.0, carbsPer100g: 0.0, fatPer100g: 1.5, calsPer100g: 110, tags: ['gluten_free', 'dairy_free'] },
  { name: 'Lomo Vacuno Magro', category: 'Carnes', protPer100g: 22.0, carbsPer100g: 0.0, fatPer100g: 3.5, calsPer100g: 120, tags: ['gluten_free', 'dairy_free'] },
  { name: 'Lomo de Cerdo Magro', category: 'Carnes', protPer100g: 22.0, carbsPer100g: 0.0, fatPer100g: 3.0, calsPer100g: 115, tags: ['gluten_free', 'dairy_free'] },
  { name: 'Milanesa al Horno', category: 'Carnes', protPer100g: 20.0, carbsPer100g: 10.0, fatPer100g: 5.0, calsPer100g: 170, tags: ['dairy_free'] },
  { name: 'Filete de Merluza / Pescado Blanco', category: 'Pescados', protPer100g: 18.0, carbsPer100g: 0.0, fatPer100g: 1.2, calsPer100g: 85, tags: ['gluten_free', 'dairy_free'] },
  { name: 'Filete de Salmón Rosado', category: 'Pescados', protPer100g: 20.0, carbsPer100g: 0.0, fatPer100g: 12.0, calsPer100g: 190, tags: ['gluten_free', 'dairy_free'] },
  { name: 'Atún al Natural (Lata)', category: 'Pescados', protPer100g: 24.0, carbsPer100g: 0.0, fatPer100g: 0.8, calsPer100g: 105, tags: ['gluten_free', 'dairy_free'] },
  { name: 'Claras de Huevo', category: 'Huevos', protPer100g: 11.0, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 50, tags: ['vegetarian', 'gluten_free', 'dairy_free'] },
  { name: 'Huevo Entero', category: 'Huevos', protPer100g: 13.0, carbsPer100g: 0.5, fatPer100g: 10.0, calsPer100g: 145, tags: ['vegetarian', 'gluten_free', 'dairy_free'] },
  { name: 'Tofu Firme', category: 'Soja / Vegano', protPer100g: 15.0, carbsPer100g: 2.0, fatPer100g: 7.0, calsPer100g: 130, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Seitán (Gluten de trigo)', category: 'Vegano', protPer100g: 25.0, carbsPer100g: 6.0, fatPer100g: 1.8, calsPer100g: 140, tags: ['vegan', 'dairy_free'] },
  { name: 'Proteína Whey 80%', category: 'Suplementos', protPer100g: 78.0, carbsPer100g: 5.0, fatPer100g: 4.0, calsPer100g: 370, tags: ['vegetarian', 'gluten_free'] },
  { name: 'Proteína Aislada de Soja / Arveja', category: 'Suplementos', protPer100g: 80.0, carbsPer100g: 3.0, fatPer100g: 2.0, calsPer100g: 355, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Queso Cottage / Ricotta Magra', category: 'Lácteos', protPer100g: 12.5, carbsPer100g: 3.0, fatPer100g: 2.0, calsPer100g: 82, tags: ['vegetarian', 'gluten_free'] },
  { name: 'Yogur Griego Natural 0%', category: 'Lácteos', protPer100g: 10.0, carbsPer100g: 4.0, fatPer100g: 0.2, calsPer100g: 60, tags: ['vegetarian', 'gluten_free'] },

  // ── Vegetales / Ensaladas ──
  { name: 'Mix Hojas Verdes & Tomate', category: 'Vegetales', protPer100g: 1.5, carbsPer100g: 4.0, fatPer100g: 0.2, calsPer100g: 24, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Brócoli al Vapor', category: 'Vegetales', protPer100g: 3.0, carbsPer100g: 5.0, fatPer100g: 0.4, calsPer100g: 35, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Zanahoria Rallada', category: 'Vegetales', protPer100g: 1.0, carbsPer100g: 9.0, fatPer100g: 0.2, calsPer100g: 40, tags: ['vegan', 'gluten_free', 'dairy_free'] },

  // ── Grasas Saludables / Aceites / Frutos Secos / Semillas ──
  { name: 'Aceite de Oliva Extra Virgen', category: 'Aceites', protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 884, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Palta / Aguacate Hass', category: 'Frutas Grasas', protPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 15.0, calsPer100g: 160, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Nueces / Almendras', category: 'Frutos Secos', protPer100g: 18.0, carbsPer100g: 14.0, fatPer100g: 54.0, calsPer100g: 610, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Pasta de Maní 100% natural', category: 'Frutos Secos', protPer100g: 25.0, carbsPer100g: 18.0, fatPer100g: 50.0, calsPer100g: 600, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Semillas de Chía / Lino', category: 'Semillas', protPer100g: 18.0, carbsPer100g: 30.0, fatPer100g: 31.0, calsPer100g: 480, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Aceitunas Verdes / Negras', category: 'Grasas', protPer100g: 1.0, carbsPer100g: 3.5, fatPer100g: 14.0, calsPer100g: 145, tags: ['vegan', 'gluten_free', 'dairy_free'] },
  { name: 'Chocolate Amargo 85%', category: 'Grasas', protPer100g: 8.0, carbsPer100g: 24.0, fatPer100g: 48.0, calsPer100g: 560, tags: ['vegan', 'gluten_free', 'dairy_free'] }
];

/**
 * Determina el perfil de macronutriente dominante de un alimento.
 */
export function getFoodDominance(
  protein_g: number,
  carbs_g: number,
  fat_g: number
): MacroDominance {
  const pKcal = (protein_g || 0) * 4;
  const cKcal = (carbs_g || 0) * 4;
  const fKcal = (fat_g || 0) * 9;
  const total = pKcal + cKcal + fKcal;

  if (total === 0) return 'BALANCED';

  // Si los carbohidratos aportan más del 45% de calorías o superan claramente a la proteína
  if (cKcal >= pKcal && cKcal >= fKcal) {
    return 'CARBS';
  }

  // Si las proteínas aportan más del 40% de calorías o superan a carbohidratos
  if (pKcal >= cKcal && pKcal >= fKcal) {
    return 'PROTEIN';
  }

  // Si las grasas son el aporte calórico mayoritario
  if (fKcal >= cKcal && fKcal >= pKcal) {
    return 'FAT';
  }

  return 'BALANCED';
}

/**
 * Calcula la porción equivalente para un alimento candidato.
 */
export function calculateEquivalentPortion(
  targetMacros: { protein_g: number; carbs_g: number; fat_g: number; calories: number },
  candidate: SwapAlternativeItem,
  dominance: MacroDominance
): CalculatedSwap {
  let calculatedGrams = 100;

  if (dominance === 'CARBS' && candidate.carbsPer100g > 0) {
    // Igualar carbohidratos
    const targetC = targetMacros.carbs_g || 20;
    calculatedGrams = Math.round((targetC / candidate.carbsPer100g) * 100);
  } else if (dominance === 'PROTEIN' && candidate.protPer100g > 0) {
    // Igualar proteínas
    const targetP = targetMacros.protein_g || 20;
    calculatedGrams = Math.round((targetP / candidate.protPer100g) * 100);
  } else if (dominance === 'FAT' && candidate.fatPer100g > 0) {
    // Igualar grasas
    const targetF = targetMacros.fat_g || 10;
    calculatedGrams = Math.round((targetF / candidate.fatPer100g) * 100);
  } else {
    // Isocalórico
    const targetKcal = targetMacros.calories || 150;
    const calsPer100 = candidate.calsPer100g || (candidate.protPer100g * 4 + candidate.carbsPer100g * 4 + candidate.fatPer100g * 9) || 100;
    calculatedGrams = Math.round((targetKcal / calsPer100) * 100);
  }

  // Sanitización de límites razonables (mínimo 5g)
  calculatedGrams = Math.max(5, calculatedGrams);

  // Calcular macros reales resultantes de la porción
  const ratio = calculatedGrams / 100;
  const p = Number((candidate.protPer100g * ratio).toFixed(1));
  const c = Number((candidate.carbsPer100g * ratio).toFixed(1));
  const f = Number((candidate.fatPer100g * ratio).toFixed(1));
  const cals = Math.round(candidate.calsPer100g * ratio) || Math.round(p * 4 + c * 4 + f * 9);

  // Precisión del match con respecto al objetivo
  let match = 100;
  if (dominance === 'CARBS' && targetMacros.carbs_g > 0) {
    match = Math.max(70, Math.min(100, Math.round(100 - Math.abs(c - targetMacros.carbs_g) / targetMacros.carbs_g * 100)));
  } else if (dominance === 'PROTEIN' && targetMacros.protein_g > 0) {
    match = Math.max(70, Math.min(100, Math.round(100 - Math.abs(p - targetMacros.protein_g) / targetMacros.protein_g * 100)));
  } else if (dominance === 'FAT' && targetMacros.fat_g > 0) {
    match = Math.max(70, Math.min(100, Math.round(100 - Math.abs(f - targetMacros.fat_g) / targetMacros.fat_g * 100)));
  }

  const household = getHouseholdMeasure(candidate.name, calculatedGrams);

  return {
    name: candidate.name,
    category: candidate.category,
    quantity_g: calculatedGrams,
    household,
    macros: {
      protein_g: p,
      carbs_g: c,
      fat_g: f,
      calories: cals
    },
    dominanceMatch: dominance,
    matchPercentage: match,
    tag: candidate.tags?.[0]
  };
}

/**
 * Obtiene la lista inteligente de sustitutos para un alimento dado.
 */
export function getSmartSwaps(
  foodName: string,
  portionGrams: number,
  macros: { protein_g: number; carbs_g: number; fat_g: number; calories?: number },
  filterTab: 'auto' | 'carbs' | 'protein' | 'fat' | 'vegan' = 'auto'
): CalculatedSwap[] {
  const normFoodName = normalizeStr(foodName);
  const targetKcal = macros.calories || (macros.protein_g * 4 + macros.carbs_g * 4 + macros.fat_g * 9);
  const targetMacros = {
    protein_g: macros.protein_g,
    carbs_g: macros.carbs_g,
    fat_g: macros.fat_g,
    calories: targetKcal
  };

  const dominance = getFoodDominance(macros.protein_g, macros.carbs_g, macros.fat_g);

  // Filtrar banco canónico descartando el mismo alimento
  let candidates = CANONICAL_SWAP_BANK.filter(item => {
    const normCand = normalizeStr(item.name);
    return !normCand.includes(normFoodName) && !normFoodName.includes(normCand);
  });

  if (filterTab === 'carbs') {
    candidates = candidates.filter(c => c.carbsPer100g >= 15);
  } else if (filterTab === 'protein') {
    candidates = candidates.filter(c => c.protPer100g >= 10);
  } else if (filterTab === 'fat') {
    candidates = candidates.filter(c => c.fatPer100g >= 10);
  } else if (filterTab === 'vegan') {
    candidates = candidates.filter(c => c.tags?.includes('vegan'));
  } else {
    // Modo AUTO: Filtrar por la dominancia del alimento original
    if (dominance === 'CARBS') {
      candidates = candidates.filter(c => c.carbsPer100g >= 15);
    } else if (dominance === 'PROTEIN') {
      candidates = candidates.filter(c => c.protPer100g >= 10);
    } else if (dominance === 'FAT') {
      candidates = candidates.filter(c => c.fatPer100g >= 10);
    }
  }

  // Calcular las porciones equivalentes para todos los candidatos
  const activeDominance = filterTab === 'carbs' ? 'CARBS' : filterTab === 'protein' ? 'PROTEIN' : filterTab === 'fat' ? 'FAT' : dominance;

  const results = candidates.map(candidate => 
    calculateEquivalentPortion(targetMacros, candidate, activeDominance)
  );

  // Ordenar por cercanía calórica o score
  return results.slice(0, 8);
}

/**
 * Convierte cualquier alimento de la base SARA en un swap calculado respecto al objetivo.
 */
export function convertSaraItemToSwap(
  saraItem: SaraFoodItem,
  targetMacros: { protein_g: number; carbs_g: number; fat_g: number; calories?: number },
  dominance: MacroDominance
): CalculatedSwap {
  const candidate: SwapAlternativeItem = {
    name: saraItem.alimento,
    category: saraItem.grupo,
    protPer100g: saraItem.protcnt,
    carbsPer100g: saraItem.choavldf,
    fatPer100g: saraItem.fat,
    calsPer100g: saraItem.enerc_kcal
  };

  const targetKcal = targetMacros.calories || (targetMacros.protein_g * 4 + targetMacros.carbs_g * 4 + targetMacros.fat_g * 9);
  return {
    ...calculateEquivalentPortion({ ...targetMacros, calories: targetKcal }, candidate, dominance),
    isCustomSearch: true
  };
}

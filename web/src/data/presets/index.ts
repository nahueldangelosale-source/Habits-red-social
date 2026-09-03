/**
 * Hub Maestro de Presets Nutricionales — Bienestar APP
 * Unifica las 4 Fases Clínicas y Deportivas (52 Recetas Totales en Tríada A/B/C)
 */

import { PRESET_FASE_01_FUERZA_HIPERTROFIA, type PresetPhase, type PresetMeal, type PresetOption, type PresetIngredient } from './fase1_fuerza_hipertrofia';
import { PRESET_FASE_02_METABOLIC_FAT_LOSS } from './fase2_metabolic_fat_loss';
import { PRESET_FASE_03_LONGEVITY_GUT_HEALTH } from './fase3_longevity_gut_health';
import { PRESET_FASE_04_ATHLETIC_FEMALE_HEALTH } from './fase4_athletic_female_health';
import { INITIAL_SEED_RECIPES } from './seedAllRecipes';

export { INITIAL_SEED_RECIPES };
export type { PresetPhase, PresetMeal, PresetOption, PresetIngredient };

export const ALL_PRESET_PHASES: PresetPhase[] = [
  PRESET_FASE_01_FUERZA_HIPERTROFIA,
  PRESET_FASE_02_METABOLIC_FAT_LOSS,
  PRESET_FASE_03_LONGEVITY_GUT_HEALTH,
  PRESET_FASE_04_ATHLETIC_FEMALE_HEALTH
];

/**
 * Obtener preset por ID de Fase Nutricional
 */
export function getPresetByPhaseId(phaseId: string): PresetPhase | undefined {
  return ALL_PRESET_PHASES.find(p => p.phaseId === phaseId);
}

/**
 * Obtener presets compatibles con un Arquetipo de Atleta
 */
export function getPresetsByArchetype(archetypeId: string): PresetPhase[] {
  return ALL_PRESET_PHASES.filter(p => p.targetArchetypes.includes(archetypeId));
}

/**
 * Mapeo de Arquetipos a su Fase Nutricional Recomendada por Defecto
 */
/**
 * Mapeo de Arquetipos a su Fase Nutricional Recomendada por Defecto
 */
export const ARCHETYPE_DEFAULT_PHASE_MAP: Record<string, string> = {
  ARQ_03_PPL: "FASE_01_FUERZA_HIPERTROFIA",
  ARQ_02_UPPER_LOWER: "FASE_01_FUERZA_HIPERTROFIA",
  ARQ_01_HYPERTROPHY_PT: "FASE_01_FUERZA_HIPERTROFIA",
  HIPERTROFIA: "FASE_01_FUERZA_HIPERTROFIA",
  STRENGTH: "FASE_01_FUERZA_HIPERTROFIA",
  RECOMPOSITION: "FASE_01_FUERZA_HIPERTROFIA",
  BODY_RECOMP: "FASE_01_FUERZA_HIPERTROFIA",
  BODY_MUSCLE_GAIN: "FASE_01_FUERZA_HIPERTROFIA",
  'body:muscle_gain': "FASE_01_FUERZA_HIPERTROFIA",
  'body:recomp': "FASE_01_FUERZA_HIPERTROFIA",
  
  ARQ_08_METABOLIC_FAT_LOSS: "FASE_02_METABOLIC_FAT_LOSS",
  ARQ_07_TIME_CRUNCH_2X: "FASE_02_METABOLIC_FAT_LOSS",
  ARQ_01_WELLNESS: "FASE_02_METABOLIC_FAT_LOSS",
  FAT_LOSS: "FASE_02_METABOLIC_FAT_LOSS",
  BODY_FAT_LOSS: "FASE_02_METABOLIC_FAT_LOSS",
  'body:fat_loss': "FASE_02_METABOLIC_FAT_LOSS",
  WEIGHT_LOSS: "FASE_02_METABOLIC_FAT_LOSS",

  ARQ_09_LONGEVITY_VITALITY: "FASE_03_LONGEVITY_GUT_HEALTH",
  ARQ_CLINICAL_GI: "FASE_03_LONGEVITY_GUT_HEALTH",
  ARQ_GLP1_PROTECTION: "FASE_03_LONGEVITY_GUT_HEALTH",
  HEALTH: "FASE_03_LONGEVITY_GUT_HEALTH",
  BODY_HEALTH: "FASE_03_LONGEVITY_GUT_HEALTH",
  'body:health': "FASE_03_LONGEVITY_GUT_HEALTH",
  REHAB_LONGEVITY: "FASE_03_LONGEVITY_GUT_HEALTH",
  VITALITY_MAINTENANCE: "FASE_03_LONGEVITY_GUT_HEALTH",

  ARQ_FEMALE_HEALTH: "FASE_04_ATHLETIC_FEMALE_HEALTH",
  ARQ_05_ATHLETIC_40: "FASE_04_ATHLETIC_FEMALE_HEALTH",
  ARQ_CARB_CYCLING: "FASE_04_ATHLETIC_FEMALE_HEALTH",
  SPORT_PERFORMANCE: "FASE_04_ATHLETIC_FEMALE_HEALTH",
  'sport:performance': "FASE_04_ATHLETIC_FEMALE_HEALTH",
  HIGH_PERFORMANCE: "FASE_04_ATHLETIC_FEMALE_HEALTH"
};

/**
 * Resuelve la Fase Nutricional Recomendada para un atleta según sus datos de Onboarding
 */
export function resolveRecommendedPhase(goalTags?: string[], gender?: string | null, age?: number): PresetPhase {
  if (goalTags && goalTags.length > 0) {
    for (const tag of goalTags) {
      const phaseId = ARCHETYPE_DEFAULT_PHASE_MAP[tag] || ARCHETYPE_DEFAULT_PHASE_MAP[tag.toUpperCase()];
      if (phaseId) {
        const found = getPresetByPhaseId(phaseId);
        if (found) return found;
      }
    }
  }

  if (gender === 'female' || (gender && gender.toLowerCase().startsWith('f'))) {
    return PRESET_FASE_04_ATHLETIC_FEMALE_HEALTH;
  }

  if (age && age >= 55) {
    return PRESET_FASE_03_LONGEVITY_GUT_HEALTH;
  }

  return PRESET_FASE_01_FUERZA_HIPERTROFIA;
}

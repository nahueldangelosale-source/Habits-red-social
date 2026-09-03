/**
 * Conversor y Semilla de Todas las Recetas Maestras de los Presets (52 Recetas)
 * Convierte las opciones de las 4 Fases en objetos `Recipe` listos para useNutritionStore.
 */

import { PRESET_FASE_01_FUERZA_HIPERTROFIA } from './fase1_fuerza_hipertrofia';
import { PRESET_FASE_02_METABOLIC_FAT_LOSS } from './fase2_metabolic_fat_loss';
import { PRESET_FASE_03_LONGEVITY_GUT_HEALTH } from './fase3_longevity_gut_health';
import { PRESET_FASE_04_ATHLETIC_FEMALE_HEALTH } from './fase4_athletic_female_health';
import type { Recipe, RecipeIngredient } from '../../stores/useNutritionStore';

const ALL_PHASES = [
  PRESET_FASE_01_FUERZA_HIPERTROFIA,
  PRESET_FASE_02_METABOLIC_FAT_LOSS,
  PRESET_FASE_03_LONGEVITY_GUT_HEALTH,
  PRESET_FASE_04_ATHLETIC_FEMALE_HEALTH
];

export const INITIAL_SEED_RECIPES: Recipe[] = ALL_PHASES.flatMap((phase) =>
  phase.meals.flatMap((meal) =>
    meal.options.map((opt) => {
      const now = new Date().toISOString();
      const ingredients: RecipeIngredient[] = opt.ingredients.map((ing, idx) => ({
        saraId: `sara_preset_${opt.optionId}_${idx}`,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        macros: {
          protein: Number(((ing.protPer100g * ing.amount) / 100).toFixed(1)),
          carbs: Number(((ing.carbsPer100g * ing.amount) / 100).toFixed(1)),
          fats: Number(((ing.fatPer100g * ing.amount) / 100).toFixed(1)),
          calories: Number(((ing.calsPer100g * ing.amount) / 100).toFixed(1))
        }
      }));

      return {
        id: `rec_${opt.optionId}`,
        name: opt.name,
        tags: [...opt.tags, phase.phaseName],
        servings: opt.servings,
        prepTimeMin: opt.prepTimeMin,
        ingredients,
        totalMacros: {
          protein: opt.totalMacros.protein,
          carbs: opt.totalMacros.carbs,
          fats: opt.totalMacros.fats,
          calories: opt.totalMacros.calories
        },
        createdAt: now,
        updatedAt: now
      };
    })
  )
);

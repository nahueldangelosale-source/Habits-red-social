/**
 * Engine Paramétrico de Nutrición (NaaS)
 * Basado en Mifflin-St Jeor, Alpert y la ISSN.
 */

// Factores de Actividad Física (PAL)
export const PAL_MULTIPLIERS = {
  SEDENTARY: 1.200,      // Trabajo escritorio, sin ejercicio
  LIGHTLY_ACTIVE: 1.375, // Ejercicio ligero 1-3 días
  MODERATELY_ACTIVE: 1.550, // Ejercicio moderado 3-5 días
  VERY_ACTIVE: 1.725,    // Ejercicio intenso 6-7 días
  EXTREMELY_ACTIVE: 1.900 // Ejercicio intenso + trabajo físico
};

// Opciones de Ecuaciones de TMB (Permitiendo legacy para adherencia del profesional)
export type BMRFormula = 'MIFFLIN_ST_JEOR' | 'HARRIS_BENEDICT' | 'KATCH_MCARDLE';

export const BMR_FORMULAS = {
  MIFFLIN_ST_JEOR: {
    id: 'MIFFLIN_ST_JEOR',
    label: 'Mifflin-St Jeor (1990)',
    description: 'Estándar clínico moderno. Menor sesgo de sobreestimación. Recomendada.'
  },
  HARRIS_BENEDICT: {
    id: 'HARRIS_BENEDICT',
    label: 'Harris-Benedict (Rev. 1984)',
    description: 'Clásico de la industria. Tiende a sobreestimar TMB en un 5%, ideal para perfiles hiperactivos o preferencias del profesional.'
  },
  KATCH_MCARDLE: {
    id: 'KATCH_MCARDLE',
    label: 'Katch-McArdle',
    description: 'Basado puramente en Masa Magra (FFM). Ideal para atletas muy magros (<10% BF).'
  }
};

// Failsafes Algorítmicos
export const NUTRITION_FAILSAFES = {
  MIN_FAT_G_PER_KG_BW: 0.6, // Nunca bajar de 0.6g grasa/kg BW para proteger endocrinología
  MIN_FAT_PERCENTAGE: 0.20,  // En déficit moderado, no bajar del 20% kcal
  MAX_ENERGY_TRANSFER_KCAL_PER_KG_FM: 69.3, // Límite de Alpert (Catabolismo Máximo)
  MAX_WEEKLY_WEIGHT_LOSS_PERCENT: 0.01, // Tasa máxima de pérdida de peso (1%) si no hay % grasa
  MIN_ENERGY_AVAILABILITY_KCAL_PER_KG_FFM: 30 // Suelo energético RED-S
};

export type BodyCompositionGoal = 
  | 'HYPERTROPHY' 
  | 'RECOMPOSITION' 
  | 'FAT_LOSS' 
  | 'PERFORMANCE' 
  | 'LONGEVITY'
  | 'MINICUT_AGRESIVO'
  | 'RECOVERY_DIET'
  | 'MATADOR_DEFICIT'
  | 'REFEED_CARBS';

export interface GoalMacroConfig {
  energyShiftMin: number; // Porcentaje min (ej. -0.20)
  energyShiftMax: number; // Porcentaje max (ej. -0.25)
  proteinMin: number; // Multiplicador
  proteinMax: number; // Multiplicador
  proteinBase: 'BW' | 'FFM'; // Si se multiplica por Peso (BW) o Masa Magra (FFM)
  fatMin: number; // Multiplicador
  fatMax: number; // Multiplicador
  fatBase: 'BW' | 'PERCENT_GET'; // Si se multiplica por Peso o es porcentaje de GET
}

// Matriz Paramétrica de Asignación por Objetivo (Consenso ISSN + Deep Research)
export const GOAL_MACRO_MATRIX: Record<BodyCompositionGoal, GoalMacroConfig> = {
  HYPERTROPHY: {
    energyShiftMin: 0.10,
    energyShiftMax: 0.20,
    proteinMin: 1.6,
    proteinMax: 2.2,
    proteinBase: 'BW',
    fatMin: 0.8,
    fatMax: 1.2,
    fatBase: 'BW'
  },
  RECOMPOSITION: {
    energyShiftMin: -0.10,
    energyShiftMax: 0.0,
    proteinMin: 2.0,
    proteinMax: 2.4,
    proteinBase: 'BW',
    fatMin: 0.8,
    fatMax: 1.0,
    fatBase: 'BW'
  },
  FAT_LOSS: {
    energyShiftMin: -0.25,
    energyShiftMax: -0.20,
    proteinMin: 2.3,
    proteinMax: 3.1,
    proteinBase: 'FFM',
    fatMin: 0.6,
    fatMax: 0.8,
    fatBase: 'BW'
  },
  MINICUT_AGRESIVO: {
    energyShiftMin: -0.30,
    energyShiftMax: -0.20,
    proteinMin: 2.4,
    proteinMax: 2.8,
    proteinBase: 'BW',
    fatMin: 0.5,
    fatMax: 0.7,
    fatBase: 'BW'
  },
  RECOVERY_DIET: {
    energyShiftMin: 0.0,
    energyShiftMax: 0.05,
    proteinMin: 1.8,
    proteinMax: 2.2,
    proteinBase: 'BW',
    fatMin: 1.0,
    fatMax: 1.2,
    fatBase: 'BW'
  },
  MATADOR_DEFICIT: {
    energyShiftMin: -0.25,
    energyShiftMax: -0.20,
    proteinMin: 2.2,
    proteinMax: 2.6,
    proteinBase: 'BW',
    fatMin: 0.7,
    fatMax: 0.9,
    fatBase: 'BW'
  },
  REFEED_CARBS: {
    energyShiftMin: 0.05,
    energyShiftMax: 0.15,
    proteinMin: 1.8,
    proteinMax: 2.2,
    proteinBase: 'BW',
    fatMin: 0.3,
    fatMax: 0.5,
    fatBase: 'BW'
  },
  PERFORMANCE: {
    energyShiftMin: 0.0,
    energyShiftMax: 0.10,
    proteinMin: 1.4,
    proteinMax: 2.0,
    proteinBase: 'BW',
    fatMin: 1.0,
    fatMax: 1.5,
    fatBase: 'BW'
  },
  LONGEVITY: {
    energyShiftMin: 0.0,
    energyShiftMax: 0.0,
    proteinMin: 1.2,
    proteinMax: 1.6,
    proteinBase: 'BW',
    fatMin: 0.25, // 25% del GET
    fatMax: 0.35, // 35% del GET
    fatBase: 'PERCENT_GET'
  }
};

// ── Algoritmos de Software y Failsafes Clínicos del Deep Research ──────────────

/**
 * Suavizado de Tendencia de Peso con Media Móvil Ponderada Exponencialmente (EWMA).
 * Usado por MacroFactor y Carbon Diet Coach para aislar retención hídrica y glucógeno.
 * Formula: Trend_t = alpha * Weight_t + (1 - alpha) * Trend_{t-1}
 */
export function calculateEWMATrendWeight(weights: number[], alpha: number = 0.1): number[] {
  if (weights.length === 0) return [];
  const trend: number[] = [weights[0]];
  for (let i = 1; i < weights.length; i++) {
    const nextTrend = alpha * weights[i] + (1 - alpha) * trend[i - 1];
    trend.push(Math.round(nextTrend * 100) / 100);
  }
  return trend;
}

/**
 * Cálculo del TDEE Dinámico y Adaptativo.
 * Deduce el gasto energético real basado en la variación del peso suavizado (Trend Weight)
 * comparado con el consumo calórico promedio registrado.
 * Asume ~7,700 kcal por kg de masa corporal ganada o perdida.
 */
export function calculateDynamicTDEE(
  initialTrendWeightKg: number,
  currentTrendWeightKg: number,
  averageDailyIntakeKcal: number,
  daysElapsed: number
): number {
  if (daysElapsed <= 0) return averageDailyIntakeKcal;
  const weightDeltaKg = currentTrendWeightKg - initialTrendWeightKg;
  const totalEnergyImbalanceKcal = weightDeltaKg * 7700;
  const dailyEnergyImbalanceKcal = totalEnergyImbalanceKcal / daysElapsed;
  // Si perdió peso (delta negativo), el TDEE es mayor que la ingesta diaria
  const calculatedTDEE = Math.round(averageDailyIntakeKcal - dailyEnergyImbalanceKcal);
  return Math.max(1200, calculatedTDEE);
}

/**
 * Failsafe Clínico: Validación de Umbral Seguro para Minicut Agresivo.
 * La evidencia clínica (Helms, Trexler) demuestra que por debajo de 14% BF en hombres
 * o 22% en mujeres, el déficit agresivo produce proteólisis masiva, caída de T3 y RED-S.
 */
export function validateMinicutSuitability(
  gender: 'MALE' | 'FEMALE',
  bodyFatPercentage: number
): { isAllowed: boolean; minRequiredBF: number; warning?: string } {
  const minRequiredBF = gender === 'MALE' ? 14 : 22;
  if (bodyFatPercentage < minRequiredBF) {
    return {
      isAllowed: false,
      minRequiredBF,
      warning: `Minicut no recomendado: Tu porcentaje de grasa actual (${bodyFatPercentage}%) está por debajo del umbral clínico de seguridad (${minRequiredBF}% para ${gender === 'MALE' ? 'hombres' : 'mujeres'}). Se recomienda un déficit moderado o mantenimiento para evitar proteólisis y colapso neuroendocrino.`
    };
  }
  return { isAllowed: true, minRequiredBF };
}

/**
 * Límite de Transferencia Energética de Alpert (Catabolismo Máximo).
 * Calcula el déficit calórico diario máximo que los adipocitos pueden suministrar
 * sin que el organismo empiece a canibalizar masa muscular (69.3 kcal/kg de masa grasa).
 */
export function calculateAlpertDeficitLimit(fatMassKg: number): number {
  return Math.round(fatMassKg * NUTRITION_FAILSAFES.MAX_ENERGY_TRANSFER_KCAL_PER_KG_FM);
}

/**
 * Recovery Diet: Cálculo de Salto Inmediato a Mantenimiento Corregido.
 * Compensa la termogénesis adaptativa residual (-10% a -15% del TDEE teórico)
 * para normalizar leptina, T3 y eje gonadal sin rebote adiposo descontrolado.
 */
export function calculateRecoveryDietTarget(
  theoreticalTDEE: number,
  adaptiveSuppressionPercentage: number = 0.12
): { targetCalories: number; expectedWaterReboundKg: { min: number; max: number } } {
  const penalizedTDEE = Math.round(theoreticalTDEE * (1 - adaptiveSuppressionPercentage));
  return {
    targetCalories: penalizedTDEE,
    expectedWaterReboundKg: { min: 1.5, max: 3.0 }
  };
}

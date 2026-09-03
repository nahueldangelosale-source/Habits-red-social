
// --------------------------------------------------------------------------------
// PAIN-MONITORING MODEL (Silbernagel)
// --------------------------------------------------------------------------------

export const evaluatePainProgression = (
  currentSessionVAS: number, 
  postSessionVAS: number,
  morningAfterVAS: number,
  weeklyTrend: 'STABLE' | 'DECREASING' | 'INCREASING'
): { action: 'DECREASE_VOLUME' | 'MAINTAIN' | 'INCREASE_MARGINALLY', rationale: string } => {
  
  // Regla 1 y 2: Dolor intra y post sesión <= 5
  if (currentSessionVAS > 5 || postSessionVAS > 5) {
    return {
      action: 'DECREASE_VOLUME',
      rationale: 'Transgresión del umbral de dolor intra/post sesión (>5/10). Reducción de carga terapéutica requerida.'
    };
  }

  // Regla 3: Rigidez/Dolor matutino <= basal (5)
  if (morningAfterVAS > 5) {
    return {
      action: 'DECREASE_VOLUME',
      rationale: 'Sensibilización tisular matutina detectada. Posible respuesta inflamatoria desproporcionada.'
    };
  }

  // Regla 4: Tendencia semanal
  if (weeklyTrend === 'INCREASING') {
    return {
      action: 'DECREASE_VOLUME',
      rationale: 'Patrón ascendente de dolor inter-semanal detectado por análisis de regresión. Intervención preventiva.'
    };
  }

  return {
    action: 'INCREASE_MARGINALLY',
    rationale: 'Marcadores de dolor constantes y bajo umbral. Autorizado incremento progresivo marginal (5-10%).'
  };
};

// --------------------------------------------------------------------------------
// ACUTE:CHRONIC WORKLOAD RATIO (ACWR)
// --------------------------------------------------------------------------------

export const calculateACWR = (acuteLoad: number, chronicLoad: number): number => {
  if (chronicLoad === 0) return 1.0; // Evitar división por cero
  return acuteLoad / chronicLoad;
};

export const evaluateACWR = (acwr: number): { status: 'DANGER' | 'SWEET_SPOT' | 'UNDER_TRAINING', rationale: string } => {
  if (acwr > 1.5) {
    return {
      status: 'DANGER',
      rationale: 'Zona de peligro (ACWR > 1.5). La demanda sobrepasa la capacidad elástica. Alto riesgo lesional.'
    };
  }
  if (acwr < 0.8) {
    return {
      status: 'UNDER_TRAINING',
      rationale: 'Sub-entrenamiento (ACWR < 0.8). Desadaptación del tejido conectivo y pérdida de tolerancia.'
    };
  }
  return {
    status: 'SWEET_SPOT',
    rationale: 'Sweet Spot de rehabilitación (ACWR 0.8 - 1.3). Tolerancia mecánica óptima.'
  };
};

// --------------------------------------------------------------------------------
// PRESETS POR FASE CLÍNICA
// --------------------------------------------------------------------------------

export type ClinicalPhase = 'FASE_1_TOLERANCIA' | 'FASE_2_CONSTRUCCION' | 'FASE_3_READAPTACION';

interface ClinicalPreset {
  rpeMin: number;
  rpeMax: number;
  acwrMin: number;
  acwrMax: number;
  contractionType: string;
}

export const CLINICAL_PHASES: Record<ClinicalPhase, ClinicalPreset> = {
  FASE_1_TOLERANCIA: {
    rpeMin: 3,
    rpeMax: 5,
    acwrMin: 0.8,
    acwrMax: 1.0,
    contractionType: 'Isométrica (Control cortical y analgesia)'
  },
  FASE_2_CONSTRUCCION: {
    rpeMin: 5,
    rpeMax: 7,
    acwrMin: 1.0,
    acwrMax: 1.2,
    contractionType: 'Isotónica (HSR - Heavy Slow Resistance)'
  },
  FASE_3_READAPTACION: {
    rpeMin: 7,
    rpeMax: 8.5,
    acwrMin: 1.0,
    acwrMax: 1.3,
    contractionType: 'Dinámica / Pliometría bajo impacto'
  }
};

export const getPhasePreset = (phase: ClinicalPhase) => CLINICAL_PHASES[phase];

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export const validateClinicalDosage = (_days: any[], _experienceLevel: ExperienceLevel) => {
  // TODO: Implement actual dosage validation based on ACWR and Pain Monitoring
  return { isValid: true, violations: [] };
};

export const applyClinicalDefaults = (exercise: any, experienceLevel: ExperienceLevel): any => {
  // Apply Motor 80/20 defaults (RPE and Set caps based on experience)
  const defaultSets = experienceLevel === 'BEGINNER' ? 2 : experienceLevel === 'INTERMEDIATE' ? 3 : 4;
  const defaultRpe = experienceLevel === 'BEGINNER' ? 6 : experienceLevel === 'INTERMEDIATE' ? 7 : 8;
  
  return {
    ...exercise,
    sets: exercise.sets || defaultSets,
    rpe: exercise.rpe || defaultRpe
  };
};

import { v4 as uuidv4 } from 'uuid';
import { EXERCISES_DATABASE, type ExerciseTaxonomy } from '../data/exercisesData';
import type { WorkoutDay } from '../stores/usePlanBuilderStore';

export const findEx = (id: string, fallbackKeywords?: string[]): ExerciseTaxonomy => {
  const direct = EXERCISES_DATABASE.find(e => e.ID_Ejercicio === id);
  if (direct) return direct;

  if (fallbackKeywords && fallbackKeywords.length > 0) {
    const match = EXERCISES_DATABASE.find(e => {
      const name = (e.Nombre_Oficial || '').toLowerCase();
      const alias = (e.Alias_Buscador || '').toLowerCase();
      const muscle = (e.Musculo_Agonista || '').toLowerCase();
      return fallbackKeywords.some(kw => {
        const k = kw.toLowerCase();
        return name.includes(k) || alias.includes(k) || muscle.includes(k);
      });
    });
    if (match) return match;
  }

  // Fallbacks temáticos inteligentes según prefijo
  if (id.startsWith('HPUSH') || id.startsWith('CHEST')) {
    const chest = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Pectoral'));
    if (chest) return chest;
  }
  if (id.startsWith('HPULL') || id.startsWith('BACK') || id.startsWith('VPULL')) {
    const back = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Dorsal') || e.Musculo_Agonista?.includes('Espalda'));
    if (back) return back;
  }
  if (id.startsWith('VPUSH') || id.startsWith('SHO')) {
    const shoulder = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Deltoides'));
    if (shoulder) return shoulder;
  }
  if (id.startsWith('ARM') || id.startsWith('BICEP')) {
    const bicep = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Bíceps'));
    if (bicep) return bicep;
  }
  if (id.startsWith('TRICEP')) {
    const tricep = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Tríceps') || e.Musculos_Sinergistas?.includes('Tríceps'));
    if (tricep) return tricep;
  }
  if (id.startsWith('HINGE') || id.startsWith('GLUTE') || id.startsWith('DEAD')) {
    const hinge = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Glúteo') || e.Musculo_Agonista?.includes('Isquiosurales'));
    if (hinge) return hinge;
  }
  if (id.startsWith('SQUAT') || id.startsWith('LUNGE')) {
    const quad = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Cuádriceps'));
    if (quad) return quad;
  }
  if (id.startsWith('CORE') || id.startsWith('PREHAB')) {
    const core = EXERCISES_DATABASE.find(e => e.Musculo_Agonista?.includes('Abdominal') || e.Musculo_Agonista?.includes('Core') || e.ID_Ejercicio.startsWith('PREHAB'));
    if (core) return core;
  }

  return EXERCISES_DATABASE[0];
};

export interface GenerateRoutineOptions {
  goal?: string; // 'HIPERTROFIA' | 'FAT_LOSS' | 'STRENGTH' | 'BODY_RECOMP' | 'CALISTHENICS' | 'GLUTES'
  daysCount?: number; // 3, 4, 5, 6
  injuries?: string[]; // 'LUMBAR', 'SHOULDER', 'KNEE', 'CERVICAL'
  skillLevel?: 'Principiante' | 'Intermedio' | 'Avanzado';
  phaseModality?: string; // 'ADAPTACION' | 'HIPERTROFIA' | 'FUERZA' | 'TRANSICION' | 'DELOAD'
  phaseId?: string;
  phaseName?: string;
  isFemaleAthlete?: boolean; // Ajuste volumétrico por dimorfismo sexual (+15-20% tolerancia de series)
  splitPreference?: 'FULL_BODY' | 'CLASSIC_WEIDER' | 'UPPER_LOWER' | 'PPL';
}

interface TierPrescription {
  sets: string;
  reps: string;
  rpe: string;
  progression?: string;
}

export const getPhasePrescription = (
  tier: 'PRIMARY' | 'SECONDARY' | 'ACCESSORY' | 'CORE' | 'RAMP',
  phaseModality: string = 'HIPERTROFIA',
  customProgression?: string
): TierPrescription => {
  const norm = phaseModality.toUpperCase();

  if (norm.includes('FUERZA') || norm.includes('INTENS')) {
    switch (tier) {
      case 'RAMP': return { sets: '2', reps: '8-10', rpe: 'PAPE Neural', progression: customProgression || 'Potenciación Post-Activación' };
      case 'PRIMARY': return { sets: '4-5', reps: '3-5', rpe: '9 (RIR 1)', progression: customProgression || 'Sobrecarga de tensión mecánica máxima' };
      case 'SECONDARY': return { sets: '3-4', reps: '5-6', rpe: '8.5 (RIR 1-2)', progression: customProgression || 'Fuerza complementaria' };
      case 'ACCESSORY': return { sets: '3', reps: '8-10', rpe: '8 (RIR 2)', progression: customProgression || 'Estabilidad y tendones' };
      case 'CORE': return { sets: '3', reps: '10/lado', rpe: 'Core Pesado', progression: customProgression || 'Anti-extensión / Anti-rotación' };
    }
  }

  if (norm.includes('ADAPTACION') || norm.includes('ANATOMIC')) {
    switch (tier) {
      case 'RAMP': return { sets: '2', reps: '15', rpe: 'Movilidad', progression: customProgression || 'Flujo articular dinámico' };
      case 'PRIMARY': return { sets: '3', reps: '12-15', rpe: '7 (RIR 3)', progression: customProgression || 'Condicionamiento del tejido conectivo' };
      case 'SECONDARY': return { sets: '3', reps: '12-15', rpe: '7.5 (RIR 2-3)', progression: customProgression || 'Capacitación neuromuscular' };
      case 'ACCESSORY': return { sets: '2-3', reps: '15', rpe: '7.5 (RIR 2)', progression: customProgression || 'Tolerancia metabólica' };
      case 'CORE': return { sets: '3', reps: '15/lado', rpe: 'Control', progression: customProgression || 'Estabilidad lumbopélvica' };
    }
  }

  if (norm.includes('DELOAD') || norm.includes('DESCARGA') || norm.includes('TRANSICION')) {
    switch (tier) {
      case 'RAMP': return { sets: '2', reps: '10', rpe: 'Descarga', progression: customProgression || 'Movilidad regenerativa' };
      case 'PRIMARY': return { sets: '2', reps: '6-8', rpe: '6 (RIR 4)', progression: customProgression || 'Descarga de fatiga central' };
      case 'SECONDARY': return { sets: '2', reps: '8-10', rpe: '6.5 (RIR 3-4)', progression: customProgression || 'Mantenimiento del patrón motor' };
      case 'ACCESSORY': return { sets: '2', reps: '10-12', rpe: '7 (RIR 3)', progression: customProgression || 'Flujo regenerativo' };
      case 'CORE': return { sets: '2', reps: '8/lado', rpe: 'Control', progression: customProgression || 'Regenerativo' };
    }
  }

  // Por defecto: Hipertrofia
  switch (tier) {
    case 'RAMP': return { sets: '2', reps: '12-15', rpe: 'Activación', progression: customProgression || 'Activación' };
    case 'PRIMARY': return { sets: '4', reps: '6-8', rpe: '8 (RIR 2)', progression: customProgression || 'Sobrecarga progresiva' };
    case 'SECONDARY': return { sets: '3-4', reps: '8-10', rpe: '8.5 (RIR 1-2)', progression: customProgression || 'Hipertrofia miofibrilar' };
    case 'ACCESSORY': return { sets: '3', reps: '10-12', rpe: '9 (RIR 1)', progression: customProgression || 'Aislamiento metabólico' };
    case 'CORE': return { sets: '3', reps: '10-12/lado', rpe: 'Core', progression: customProgression || 'Estabilidad 360°' };
  }
};

export const generateSmartRoutine = (options: GenerateRoutineOptions): WorkoutDay[] => {
  const { goal = 'HIPERTROFIA', daysCount = 4, injuries = [], phaseModality = 'HIPERTROFIA', phaseId, phaseName, isFemaleAthlete = false, splitPreference } = options;
  const hasLumbarPain = injuries.some(i => i.toLowerCase().includes('lumbar') || i.toLowerCase().includes('espalda'));
  const hasShoulderPain = injuries.some(i => i.toLowerCase().includes('hombro') || i.toLowerCase().includes('manguito'));
  const hasKneePain = injuries.some(i => i.toLowerCase().includes('rodilla') || i.toLowerCase().includes('rotula'));

  const normGoal = (goal || '').toUpperCase();
  const normPhase = (phaseModality || '').toUpperCase();
  const isStrength = normPhase.includes('FUERZA') || normPhase.includes('INTENS') || normGoal.includes('STRENGTH') || normGoal.includes('FUERZA');

  let days: WorkoutDay[];

  if (normGoal.includes('CALISTHENICS') || normGoal.includes('CALISTENIA')) {
    days = generateCalisthenicsDays(hasShoulderPain, hasLumbarPain, phaseModality);
  } else if (normGoal.includes('GLUTE') || normGoal.includes('GLUTEOS')) {
    days = generateGluteSpecializationDays(hasLumbarPain, hasKneePain, phaseModality);
  } else if (isStrength) {
    if (daysCount === 3) {
      days = generate3DayStrengthDUP(hasLumbarPain, hasShoulderPain, hasKneePain);
    } else if (daysCount === 5) {
      days = generate5DayStrengthSBD(hasLumbarPain, hasShoulderPain, hasKneePain);
    } else if (daysCount === 6) {
      days = generate6DayStrengthSBD(hasLumbarPain, hasShoulderPain, hasKneePain);
    } else {
      days = generate4DayStrengthUpperLower(hasLumbarPain, hasShoulderPain, hasKneePain);
    }
  } else if (daysCount === 3) {
    if (splitPreference === 'CLASSIC_WEIDER' || normGoal.includes('WEIDER') || normGoal.includes('CLASSIC')) {
      days = generate3DayClassicWeider(hasLumbarPain, hasShoulderPain, hasKneePain, phaseModality);
    } else {
      days = generateFullBodyDays(hasLumbarPain, hasShoulderPain, hasKneePain, phaseModality);
    }
  } else if (daysCount === 5) {
    days = generate5DayPPLUpperLower(hasLumbarPain, hasShoulderPain, hasKneePain, phaseModality);
  } else if (daysCount === 6) {
    days = generate6DayPPLDays(hasLumbarPain, hasShoulderPain, hasKneePain, phaseModality);
  } else {
    days = generate4DayUpperLower(hasLumbarPain, hasShoulderPain, hasKneePain, phaseModality);
  }

  // Enriquecer cada ejercicio con las etiquetas biomecánicas y algorítmicas del Deep Research
  const enrichedDays = days.map(day => ({
    ...day,
    customName: day.customName || day.name,
    phaseId: phaseId || day.phaseId,
    phaseName: phaseName || day.phaseName || phaseModality,
    items: day.items.map((item, idx) => {
      if (item.type !== 'EXERCISE' || !item.exercise) return item;
      
      const isWarmup = (item.progression?.includes('PAPE') || item.progression?.includes('Movilidad') || item.progression?.includes('Band') || item.exercise.ID_Ejercicio.startsWith('RAMP') || item.exercise.ID_Ejercicio.startsWith('MOV') || item.exercise.ID_Ejercicio.startsWith('PLYO') || item.exercise.ID_Ejercicio.startsWith('PAPE')) && idx < 2;
      const isCore = idx >= day.items.length - 1 || item.exercise.ID_Ejercicio.startsWith('PREHAB') || item.exercise.ID_Ejercicio.startsWith('CORE') || item.exercise.Musculo_Agonista?.includes('Abdominal') || item.exercise.Musculo_Agonista?.includes('Core');
      const isPrimary = !isWarmup && !isCore && (item.progression?.includes('[T1]') || (!item.progression?.includes('[T2]') && !item.progression?.includes('[T3]') && (idx === 1 || idx === 2 || (idx === 3 && day.items.length > 6))));
      const isSecondary = !isWarmup && !isCore && !isPrimary && (item.progression?.includes('[T2]') || idx <= 4);

      let tier: 'T1' | 'T2' | 'T3' | 'CORE' | 'RAMP' = 'T3';
      if (isWarmup) tier = 'RAMP';
      else if (isCore) tier = 'CORE';
      else if (isPrimary) tier = 'T1';
      else if (isSecondary) tier = 'T2';

      const isAxial = getAxialLoadScore(item.exercise) >= 7;
      const stretchBiased = isStretchBiasedExercise(item.exercise);
      const isImmutable = tier === 'T1';

      // Modulación por dimorfismo sexual (+1 serie en accesorios/secundarios si es mujer por mayor tolerancia)
      let sets = item.sets;
      if (isFemaleAthlete && (tier === 'T2' || tier === 'T3')) {
        const currentSets = parseInt(sets) || 3;
        if (currentSets < 5) sets = String(currentSets + 1);
      }

      // Resíntesis de fosfocreatina y descansos de precisión
      const restTimer = item.restTimer || (tier === 'T1' ? '240' : tier === 'T2' ? '180' : tier === 'T3' ? '120' : tier === 'RAMP' ? '90' : '60');

      return {
        ...item,
        tier,
        isAxial,
        stretchBiased,
        isImmutable,
        sets,
        restTimer
      };
    })
  }));

  return enrichedDays;
};

export const generateSmartSingleDay = (dayName: string, dayIndex: number, totalDays: number, options: GenerateRoutineOptions): WorkoutDay => {
  const fullRoutine = generateSmartRoutine({ ...options, daysCount: totalDays });
  const index = Math.min(dayIndex, fullRoutine.length - 1);
  const templateDay = fullRoutine[index] || fullRoutine[0];
  
  return {
    ...templateDay,
    id: uuidv4(),
    name: dayName || templateDay.name,
    phaseId: options.phaseId || templateDay.phaseId,
    phaseName: options.phaseName || templateDay.phaseName
  };
};

export interface MuscleVolumeLandmarks {
  MEV: number;
  MAV: number;
  MRV: number;
}

export interface HypertrophyVolumeLandmarks {
  MV: number; // Mantenimiento
  MEV: number; // Mínimo Efectivo
  MAV: number; // Máximo Adaptativo
  MRV: number; // Máximo Recuperable
  description?: string;
}

/**
 * Matriz Unificada de Volume Landmarks Semanales según literatura científica contemporánea
 * (Dr. Mike Israetel / RP, Eric Helms, Brad Schoenfeld).
 * Define umbrales de series efectivas (RIR <= 3) por grupo muscular.
 */
export const HYPERTROPHY_VOLUME_LANDMARKS: Record<string, HypertrophyVolumeLandmarks> = {
  Pectoral: { MV: 5, MEV: 9, MAV: 16, MRV: 22, description: '4-6 MV, 8-10 MEV, 12-20 MAV, 22+ MRV' },
  Dorsales: { MV: 6, MEV: 10, MAV: 18, MRV: 25, description: 'Tracción vertical y lats. 6 MV, 10 MEV, 14-22 MAV, 25+ MRV' },
  Trapecio_Romboides: { MV: 0, MEV: 2, MAV: 9, MRV: 16, description: 'Trapecio y romboides. 0 MV, 0-4 MEV, 6-12 MAV, 16+ MRV' },
  DeltoidesAnterior: { MV: 0, MEV: 1, MAV: 7, MRV: 12, description: 'Estimulado indirectamente por presses. 0 MV, 0-2 MEV, 6-8 MAV, 12+ MRV' },
  DeltoidesLateral: { MV: 6, MEV: 9, MAV: 19, MRV: 26, description: 'Tolerancia ultra-alta. 6 MV, 8-10 MEV, 16-22 MAV, 26+ MRV' },
  DeltoidesPosterior: { MV: 0, MEV: 7, MAV: 14, MRV: 20, description: 'Pájaros y face pulls. 0 MV, 6-8 MEV, 12-16 MAV, 20+ MRV' },
  Biceps: { MV: 4, MEV: 8, MAV: 16, MRV: 24, description: '4 MV, 8 MEV, 12-20 MAV, 24+ MRV' },
  Triceps: { MV: 4, MEV: 6, MAV: 14, MRV: 20, description: '4 MV, 6 MEV, 10-18 MAV, 20+ MRV' },
  Cuadriceps: { MV: 6, MEV: 9, MAV: 15, MRV: 20, description: '6 MV, 8-10 MEV, 12-18 MAV, 20+ MRV' },
  Isquiosurales: { MV: 4, MEV: 6, MAV: 13, MRV: 18, description: '4 MV, 6 MEV, 10-16 MAV, 18+ MRV' },
  Gluteos: { MV: 0, MEV: 2, MAV: 8, MRV: 16, description: '0 MV, 0-4 MEV, 4-12 MAV, 16+ MRV' },
  Pantorrillas: { MV: 6, MEV: 8, MAV: 14, MRV: 20, description: 'Gemelos/sóleo. 6 MV, 8 MEV, 12-16 MAV, 20+ MRV' },
  Core: { MV: 0, MEV: 0, MAV: 7, MRV: 12, description: 'Anti-movimiento. 0 MV, 0 MEV, 4-10 MAV, 12+ MRV' }
};

export interface MesocycleWeekConfig {
  week: number;
  phase: string;
  targetRir: number;
  rirLabel: string;
  volumeTier: 'MEV' | 'MAV_LOW' | 'MAV' | 'MRV' | 'DELOAD';
  loadProgression: string;
  description: string;
}

/**
 * Arquitectura de Progresión Estándar para Mesociclo de Hipertrofia (4-6 Semanas).
 * Justificado por la cinética de MPS y Z-disc streaming vs. Repeated Bout Effect.
 */
export const HYPERTROPHY_MESOCYCLE_WEEKS: MesocycleWeekConfig[] = [
  {
    week: 1,
    phase: 'Introducción / Acumulación Temprana',
    targetRir: 3,
    rirLabel: 'RIR 3 (RPE 7)',
    volumeTier: 'MEV',
    loadProgression: 'Carga conservadora para iniciar adaptaciones sin inducir daño severo (Z-disc streaming).',
    description: 'Activación del estímulo sin secuestrar la síntesis de proteína muscular para reparación tisular excesiva.'
  },
  {
    week: 2,
    phase: 'Acumulación Media',
    targetRir: 2,
    rirLabel: 'RIR 2 (RPE 8)',
    volumeTier: 'MAV_LOW',
    loadProgression: 'Sobrecarga micro-incremental (+1.25 a 2.5 kg en barra o +1-2 repeticiones manteniendo carga).',
    description: 'Progresión gradual hacia el volumen máximo adaptativo.'
  },
  {
    week: 3,
    phase: 'Intensificación Temprana (Peak MPS)',
    targetRir: 1,
    rirLabel: 'RIR 1 (RPE 9)',
    volumeTier: 'MAV',
    loadProgression: 'Carga moderada-alta con repeated bout effect activo.',
    description: 'La síntesis proteica se correlaciona con hipertrofia neta al atenuarse el daño muscular inicial.'
  },
  {
    week: 4,
    phase: 'Overreaching Funcional',
    targetRir: 0,
    rirLabel: 'RIR 0 en T3 (Fallo) / RIR 1 en T1',
    volumeTier: 'MRV',
    loadProgression: 'Tensión mecánica y estrés metabólico máximos rozando el MRV.',
    description: 'Fallo técnico estricto en aislamiento T3; RIR 1 seguro en compuestos axiales T1.'
  },
  {
    week: 5,
    phase: 'Descarga Activa (Deload)',
    targetRir: 3,
    rirLabel: 'RIR 3-4 (RPE 6-7)',
    volumeTier: 'DELOAD',
    loadProgression: 'Mantenimiento del peso en la barra con reducción del 40-50% de series.',
    description: 'Disipación de fatiga del SNC y periférica sin desentrenar adaptaciones hipertróficas ni de fuerza.'
  }
];

export const HYPERTROPHY_CONSTRAINTS = {
  maxEffectiveSetsPerMusclePerSession: 10, // Techo biológico: 6-10 series por músculo/sesión para evitar junk volume
  minEffectiveSetsPerMusclePerSession: 3,
  maxArmIsolationSetsPerSession: 4, // Límite estricto de flexión/extensión directa de codo para prevenir epicondilitis
  maxAxialT1PerSession: 1, // Máximo 1 ejercicio T1 axial pesado por sesión (mitigar aferencias tipo III/IV)
  stretchBiasedTag: 'SMH' // Stretch-Mediated Hypertrophy (Titina)
};

export interface PrilepinZone {
  minPct: number;
  maxPct: number;
  optimalRepsPerSet: string;
  rangeTotalReps: string;
  optimalTotalReps: number;
  focus: string;
}

/**
 * Tabla Heurística de Prilepin para Regulación de Volumen e Intensidad en Levantamientos de Fuerza Máxima.
 * Desarrollada por A.S. Prilepin y adaptada por Westside Barbell / Boris Sheiko para levantamientos SBD.
 */
export const PRILEPIN_VOLUME_TABLE: PrilepinZone[] = [
  { minPct: 55, maxPct: 65, optimalRepsPerSet: '3 - 6', rangeTotalReps: '18 - 30', optimalTotalReps: 24, focus: 'Esfuerzo Dinámico (DE), velocidad, RFD temprana, automatización motora.' },
  { minPct: 70, maxPct: 79, optimalRepsPerSet: '3 - 6', rangeTotalReps: '12 - 24', optimalTotalReps: 18, focus: 'Acumulación de volumen técnico, hipertrofia de fibras tipo IIa, base de fuerza.' },
  { minPct: 80, maxPct: 89, optimalRepsPerSet: '2 - 4', rangeTotalReps: '10 - 20', optimalTotalReps: 15, focus: 'Fuerza máxima submáxima, optimización de Rate Coding, transmutación neural.' },
  { minPct: 90, maxPct: 100, optimalRepsPerSet: '1 - 2', rangeTotalReps: '4 - 10', optimalTotalReps: 7, focus: 'Realización de fuerza absoluta, Esfuerzo Máximo (ME). Tope 10 reps al >90%.' }
];

export interface StrengthWeekConfig {
  week: number;
  phase: string;
  intensityRange: string;
  rirRange: string;
  rpeTarget: string;
  velocityLossLimit: string;
  focus: string;
  description: string;
}

/**
 * Arquitectura de Progresión Ondulada para Mesociclo de Fuerza Máxima (4 Semanas).
 * Basada en el control de pérdida de velocidad intra-serie (10-20% VL) y resíntesis de fosfocreatina.
 */
export const STRENGTH_MESOCYCLE_WEEKS: StrengthWeekConfig[] = [
  {
    week: 1,
    phase: 'Fase de Acumulación',
    intensityRange: '70% - 80%',
    rirRange: 'RIR 3 - 4',
    rpeTarget: 'RPE 6 - 7',
    velocityLossLimit: '10% - 15%',
    focus: 'Engrase motor & volumen técnico',
    description: 'Volumen de alta calidad, consolidación del patrón motor y acondicionamiento tendinoso.'
  },
  {
    week: 2,
    phase: 'Fase de Intensificación',
    intensityRange: '80% - 85%',
    rirRange: 'RIR 2 - 3',
    rpeTarget: 'RPE 7 - 8',
    velocityLossLimit: '15% - 20%',
    focus: 'Reclutamiento de unidades motoras rápidas',
    description: 'Sobrecarga de motoneuronas de gran calibre (Tipo IIa/IIx) según el principio de Henneman.'
  },
  {
    week: 3,
    phase: 'Fase de Realización',
    intensityRange: '85% - 92.5%',
    rirRange: 'RIR 1 - 2',
    rpeTarget: 'RPE 8 - 9',
    velocityLossLimit: '15% - 20%',
    focus: 'Rate Coding y manifestación de fuerza absoluta',
    description: 'Frecuencia de descarga máxima tetánica y anulación de inhibición del órgano tendinoso de Golgi.'
  },
  {
    week: 4,
    phase: 'Fase de Tapering / Deload',
    intensityRange: '70% - 75%',
    rirRange: 'RIR 3 - 4',
    rpeTarget: 'RPE 6',
    velocityLossLimit: '< 10%',
    focus: 'Disipación de fatiga latente (Fitness-Fatigue Model)',
    description: 'Reducción del 50% de volumen para disipar la fatiga central del SNC y expresar el 1RM latente.'
  }
];

export const STRENGTH_CONSTRAINTS = {
  maxExercisesPerSession: 6, // Prevención estricta de Junk Volume en el SNC
  minRestSecondsT1: 180, // Mínimo biológico para el 95% de resíntesis de PCr
  optimalRestSecondsT1: 240, // Descanso óptimo T1 (180s - 300s)
  maxRepsPerSetT1: 6, // Failsafe técnico: >6 reps desvía la adaptación hacia fatiga metabólica
  maxTotalRepsAbove90Pct: 10, // Techo crítico de Prilepin al >90% 1RM
  maxAxialT1PerSession: 1 // Prohibido solapar Sentadilla pesada y Peso Muerto libre pesado el mismo día
};

export const VOLUME_LANDMARKS_MATRIX: Record<'Principiante' | 'Intermedio' | 'Avanzado', Record<string, MuscleVolumeLandmarks>> = {
  Principiante: {
    Pectoral: { MEV: 6, MAV: 10, MRV: 14 },
    Espalda: { MEV: 8, MAV: 12, MRV: 16 },
    Deltoides: { MEV: 6, MAV: 10, MRV: 14 },
    Cuadriceps: { MEV: 6, MAV: 10, MRV: 14 },
    Isquiosurales: { MEV: 4, MAV: 8, MRV: 12 },
    Gluteos: { MEV: 4, MAV: 8, MRV: 12 },
    Biceps: { MEV: 4, MAV: 8, MRV: 12 },
    Triceps: { MEV: 4, MAV: 8, MRV: 12 },
    Pantorrillas: { MEV: 6, MAV: 10, MRV: 16 },
    Core: { MEV: 0, MAV: 6, MRV: 10 }
  },
  Intermedio: {
    Pectoral: { MEV: 8, MAV: 14, MRV: 20 },
    Espalda: { MEV: 10, MAV: 16, MRV: 22 },
    Deltoides: { MEV: 8, MAV: 16, MRV: 22 },
    Cuadriceps: { MEV: 8, MAV: 12, MRV: 18 },
    Isquiosurales: { MEV: 6, MAV: 12, MRV: 16 },
    Gluteos: { MEV: 6, MAV: 12, MRV: 20 },
    Biceps: { MEV: 8, MAV: 12, MRV: 18 },
    Triceps: { MEV: 6, MAV: 12, MRV: 16 },
    Pantorrillas: { MEV: 8, MAV: 14, MRV: 20 },
    Core: { MEV: 4, MAV: 10, MRV: 16 }
  },
  Avanzado: {
    Pectoral: { MEV: 10, MAV: 18, MRV: 22 },
    Espalda: { MEV: 12, MAV: 20, MRV: 26 },
    Deltoides: { MEV: 10, MAV: 20, MRV: 26 },
    Cuadriceps: { MEV: 10, MAV: 16, MRV: 20 },
    Isquiosurales: { MEV: 8, MAV: 14, MRV: 18 },
    Gluteos: { MEV: 8, MAV: 16, MRV: 24 },
    Biceps: { MEV: 10, MAV: 16, MRV: 24 },
    Triceps: { MEV: 8, MAV: 16, MRV: 20 },
    Pantorrillas: { MEV: 10, MAV: 18, MRV: 28 },
    Core: { MEV: 6, MAV: 14, MRV: 22 }
  }
};

export const SESSION_TIME_BUDGET_CONFIG = {
  totalMinutes: 60,
  maxAxialScorePerSession: 15,
  phases: [
    { name: 'RAMP_WARMUP', minutes: 7, totalSets: 4, rpe: 3, description: 'Movilidad articular y activación de estabilizadores.' },
    { name: 'PRIMARIO_FUERZA', minutes: 18, totalSets: 4, rpe: 8, rir: 2, restSec: 180, description: 'Multiarticular pesado con barra (Prilepin 15 reps totales).' },
    { name: 'SECUNDARIO_HIPERTROFIA', minutes: 18, totalSets: 6, rpe: 8.5, rir: 1, restSec: 90, description: 'Multiarticular con mancuernas o máquinas (Alto SFR, baja carga axial).' },
    { name: 'AISLAMIENTO_ACCESORIO', minutes: 12, totalSets: 6, rpe: 9.5, rir: 0, restSec: 60, description: 'Aislamiento en poleas / Myo-reps para repeticiones efectivas al fallo.' },
    { name: 'CORE_COOLDOWN', minutes: 5, totalSets: 3, rpe: 7, restSec: 45, description: 'Estabilidad 360° McGill Big 3 y retorno a la calma.' }
  ]
};

export const getAxialLoadScore = (exercise: ExerciseTaxonomy): number => {
  if (exercise.Carga_Axial === 'NO') return 1;
  const name = (exercise.Nombre_Oficial || '').toLowerCase();
  if (name.includes('sentadilla trasera') || name.includes('peso muerto convencional')) return 10;
  if (name.includes('press militar') || name.includes('peso muerto rumano')) return 7;
  if (name.includes('sentadilla') || name.includes('prensa') || name.includes('zancada')) return 5;
  return 3;
};

/**
 * Hipertrofia Mediada por Estiramiento (Stretch-Mediated Hypertrophy / Titina).
 * Identifica ejercicios con tensión pasiva máxima en posición elongada (Pedrosa et al., Wolf et al.).
 */
export const isStretchBiasedExercise = (exercise: ExerciseTaxonomy): boolean => {
  const name = (exercise.Nombre_Oficial || '').toLowerCase();
  const notes = (exercise.Biomecanica_Clave || '').toLowerCase();
  return (
    name.includes('inclinado') ||
    name.includes('rumano') ||
    name.includes('rdl') ||
    name.includes('búlgara') ||
    name.includes('bulgara') ||
    name.includes('nordic') ||
    name.includes('estiramiento') ||
    name.includes('hack') ||
    name.includes('sissy') ||
    name.includes('apertura') ||
    name.includes('cruce') ||
    name.includes('tras nuca') ||
    name.includes('overhead') ||
    name.includes('predicador') ||
    (name.includes('sentado') && name.includes('curl')) ||
    (name.includes('polea') && name.includes('cruce')) ||
    notes.includes('estiramiento') ||
    notes.includes('elongación') ||
    notes.includes('titina') ||
    notes.includes('smh')
  );
};

export const calculateFractionalVolume = (days: WorkoutDay[]): Record<string, number> => {
  const volumeMap: Record<string, number> = {};
  days.forEach(day => {
    day.items.forEach(item => {
      if (item.type === 'EXERCISE' && item.exercise) {
        const setsNum = parseInt(item.sets) || 3;
        const agonist = item.exercise.Musculo_Agonista || 'General';
        volumeMap[agonist] = (volumeMap[agonist] || 0) + setsNum;
        
        // Fraccional para sinergistas (0.5)
        const synergists = (item.exercise.Musculos_Sinergistas || '').split(',').map(s => s.trim()).filter(Boolean);
        synergists.forEach(syn => {
          volumeMap[syn] = (volumeMap[syn] || 0) + (setsNum * 0.5);
        });
      }
    });
  });
  return volumeMap;
};

// ── VALIDADOR FAILSAFE DE FUERZA MÁXIMA (Reglas Neuromusculares & Prilepin) ──
export interface StrengthSessionValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Validador Failsafe de Sesiones de Fuerza Máxima.
 * Evalúa las reglas neurofisiológicas de Prilepin, prevención de pérdida de velocidad >20%,
 * tiempo de descanso bioenergético para resíntesis de fosfocreatina y mitigación de co-fatiga axial.
 */
export const validateStrengthSession = (session: WorkoutDay): StrengthSessionValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const exerciseItems = session.items.filter(it => it.type === 'EXERCISE' && it.exercise);

  // REGLA 1: Techo de Volumen (Prevención de Junk Volume en el SNC)
  if (exerciseItems.length > 6) {
    errors.push(`Error de Diseño: Una sesión de fuerza no debe exceder 6 ejercicios totales (actual: ${exerciseItems.length}).`);
  }

  const t1Exercises = exerciseItems.filter(it => it.tier === 'T1' || it.progression?.includes('[T1]'));
  const t2Exercises = exerciseItems.filter(it => it.tier === 'T2' || it.progression?.includes('[T2]'));

  for (const item of t1Exercises) {
    const repsNum = parseInt(item.reps) || 0;
    // REGLA 2: Failsafe Técnico de Repeticiones T1 (máx 6 reps)
    if (repsNum > 6) {
      errors.push(`Failsafe Neural: ${item.exercise.Nombre_Oficial} prescribe ${repsNum} reps, superando el máximo de 6 para fuerza absoluta.`);
    }

    // REGLA 3: Prevención de Fallo Concéntrico destructivo (Velocity Loss > 20%)
    const rpeStr = String(item.rpe || '');
    if (rpeStr.includes('10') || rpeStr.includes('0 (Fallo)')) {
      errors.push(`Peligro SNC: ${item.exercise.Nombre_Oficial} tiene RPE 10 (0 RIR). En fuerza máxima el RPE recomendado es 8 - 9 para evitar pérdida de velocidad >20%.`);
    }

    // REGLA 4: Resíntesis de Fosfocreatina (ATP-PCr >= 180s)
    const restSec = parseInt(item.restTimer || '0') || 0;
    if (restSec > 0 && restSec < 180) {
      warnings.push(`Déficit Bioenergético: ${item.exercise.Nombre_Oficial} tiene ${restSec}s de descanso. La intensidad demanda un mínimo de 180s para resíntesis de PCr.`);
    }

    // REGLA 5: Mitigación de Co-fatiga Axial
    const isAxialT1 = getAxialLoadScore(item.exercise) >= 7;
    if (isAxialT1) {
      for (const t2 of t2Exercises) {
        if (getAxialLoadScore(t2.exercise) >= 7) {
          errors.push(`Conflicto Axial: ${item.exercise.Nombre_Oficial} y ${t2.exercise.Nombre_Oficial} sobrecargan la columna en la misma sesión.`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
};

// ── IMPLEMENTACIÓN 3 DÍAS FUERZA: FULL BODY DUP (Texas Method / Zourdos) ──
function generate3DayStrengthDUP(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean): WorkoutDay[] {
  const squatT1 = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const benchT1 = hasShoulder ? findEx('HPUSH_004', ['press banca inclinado con barra']) : findEx('HPUSH_001', ['press de banca con barra']);
  const deadliftT1 = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']) : findEx('HINGE_001', ['peso muerto convencional']);
  const ohpT1 = hasShoulder ? findEx('VPUSH_002', ['press de hombros sentado con mancuernas']) : findEx('VPUSH_001', ['press militar con barra de pie']);

  return [
    {
      id: uuidv4(),
      name: 'Día 1: Full Body - Sentadilla Trasera (Esfuerzo Máximo Inferior & Volumen Superior)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLYO_002', ['salto de longitud']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Broad Jump)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatT1, sets: '4', reps: '1x3 Top + 3x5', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Sentadilla Trasera 80-82.5% (Prilepin PCr 240s)', restTimer: '240' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchT1, sets: '4', reps: '6', weight: 'Auto', rpe: '7.5 (RIR 2-3)', videoUrl: '', progression: '[T2] Press de Banca 75% Volumen Técnico', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_009', ['remo pendlay']), sets: '3', reps: '8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Remo Pendlay estricto 65-70%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_003', ['curl de isquiosurales sentado']), sets: '3', reps: '10', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T3] Curl femoral sentado (Soporte lumbar forzado 60-65%)', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2: Full Body - Press Militar (Recuperación Activa & Variación Liviana)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PAPE_003', ['med ball slams', 'lanzamiento balistico']), sets: '2', reps: '3', weight: '5-10kg', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Med Ball Slams)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: ohpT1, sets: '4', reps: '5', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Press Militar 77.5-80% (Prilepin 180s)', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CATILLI_SQ_02', ['sentadilla atras (pausa)', 'sentadilla con pausa']), sets: '3', reps: '4', weight: 'Auto', rpe: '7 (RIR 3)', videoUrl: '', progression: '[T2] Sentadilla Pausa 2s al 70% (Disipar reflejo miotático)', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_001', ['dominadas estrictas pronas']), sets: '3', reps: '8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Dominadas lastradas / estrictas', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_001', ['elevaciones laterales con mancuernas']), sets: '3', reps: '12', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T3] Elevaciones laterales 60%', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3: Full Body - Peso Muerto (Intensidad Máxima & Esfuerzo Neural)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLYO_001', ['salto al cajon']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Box Jump)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadliftT1, sets: '4', reps: '1x2 Top + 3x3', weight: 'Auto', rpe: '8.5 (RIR 1-2)', videoUrl: '', progression: '[T1] Peso Muerto 85-88% (Prilepin PCr 300s)', restTimer: '300' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchT1, sets: '4', reps: '1x2 Top + 3x3', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T1/T2] Press de Banca 85% Realización Neural', restTimer: '240' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']), sets: '3', reps: '8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Hip Thrust sin carga espinal 70-75%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_006', ['extension de triceps en polea alta con cuerda']), sets: '3', reps: '10', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T3] Extensiones tríceps bloqueo 65-70%', restTimer: '90' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 4 DÍAS FUERZA: UPPER / LOWER DE FUERZA ──
function generate4DayStrengthUpperLower(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean): WorkoutDay[] {
  const benchT1 = hasShoulder ? findEx('HPUSH_004', ['press banca inclinado con barra']) : findEx('HPUSH_001', ['press de banca con barra']);
  const squatT1 = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const ohpT1 = hasShoulder ? findEx('VPUSH_002', ['press de hombros sentado con mancuernas']) : findEx('VPUSH_001', ['press militar con barra de pie']);
  const deadliftT1 = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']) : findEx('HINGE_001', ['peso muerto convencional']);

  return [
    {
      id: uuidv4(),
      name: 'Día 1: Torso A - Press de Banca (Fuerza Horizontal Máxima)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PAPE_002', ['flexiones pliometricas pape', 'flexiones pliometricas']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Flexión Pliométrica)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchT1, sets: '4', reps: '4', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Press Banca Competición 82.5% (Prilepin PCr 240s)', restTimer: '240' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_005', ['remo en maquina con apoyo de pecho']), sets: '4', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Seal Row / Apoyo Pecho 75% (Sin carga lumbar)', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPUSH_002', ['press de hombros sentado con mancuernas']), sets: '3', reps: '8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Press militar mancuernas 70%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_007', ['rompecraneos con barra ez']), sets: '3', reps: '10', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T3] Rompecráneos tríceps bloqueo 65%', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2: Pierna A - Sentadilla Trasera (Fuerza Dominante de Rodilla)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLYO_001', ['salto al cajon']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Box Jump)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatT1, sets: '4', reps: '4', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Sentadilla Trasera 80-82.5% (Prilepin PCr 240s)', restTimer: '240' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']), sets: '3', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Hip Thrust pesado 75% (Sin carga espinal)', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PRE_018', ['curl nordico de isquiosurales']), sets: '3', reps: '5', weight: 'Corporal', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Curl Nórdico excéntrico rigidez tendinosa', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_001', ['plancha frontal']), sets: '3', reps: '30s', weight: 'Corporal', rpe: '7', videoUrl: '', progression: 'Plancha anti-extensión RKC', restTimer: '60' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3: Torso B - Press Militar (Fuerza Vertical & Bloqueo)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PAPE_003', ['med ball slams', 'lanzamiento balistico']), sets: '2', reps: '4', weight: '5-10kg', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Med Ball Slams)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: ohpT1, sets: '4', reps: '4', weight: 'Auto', rpe: '8.5 (RIR 1.5)', videoUrl: '', progression: '[T1] Press Militar 82.5% (Prilepin 180s)', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPUSH_014', ['press spoto']), sets: '4', reps: '5', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Spoto Press 75% (Control punto estancamiento)', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_002', ['dominadas supinas']), sets: '4', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Dominadas lastradas supinas', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_004', ['face pulls en polea']), sets: '3', reps: '15', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Face Pulls salud escapular y manguito', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 4: Pierna B - Peso Muerto (Fuerza Cadena Posterior)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLYO_002', ['salto de longitud']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Broad Jump)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadliftT1, sets: '4', reps: '1x2 Top + 3x3', weight: 'Auto', rpe: '8.5 (RIR 1-2)', videoUrl: '', progression: '[T1] Peso Muerto 85% (Prilepin PCr 300s)', restTimer: '300' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004', ['prensa de piernas']), sets: '3', reps: '8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Prensa 45° 70% (Mitigación axial forzada - Cero estrés lumbar)', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('LUNGE_001', ['sentadilla bulgara con mancuernas']), sets: '3', reps: '8/lado', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T3] Sentadilla Búlgara estabilidad 65%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_003', ['rueda abdominal']), sets: '3', reps: '10', weight: 'Corporal', rpe: '8', videoUrl: '', progression: 'Rueda Abdominal anti-extensión', restTimer: '90' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 5 DÍAS FUERZA: ESPECIALIZACIÓN SBD (Sheiko / Búlgaro) ──
function generate5DayStrengthSBD(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean): WorkoutDay[] {
  const squatT1 = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const benchT1 = hasShoulder ? findEx('HPUSH_004', ['press banca inclinado con barra']) : findEx('HPUSH_001', ['press de banca con barra']);
  const deadliftT1 = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']) : findEx('HINGE_001', ['peso muerto convencional']);

  return [
    {
      id: uuidv4(),
      name: 'Día 1: SBD Liviano - Técnica (Fuerza Submáxima & Acumulación)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CATILLI_SQ_02', ['sentadilla atras (pausa)', 'sentadilla con pausa']), sets: '3', reps: '5', weight: 'Auto', rpe: '6 (RIR 4)', videoUrl: '', progression: '[T2] Sentadilla Técnica con Pausa 70%', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchT1, sets: '4', reps: '5', weight: 'Auto', rpe: '6 (RIR 4)', videoUrl: '', progression: '[T2] Press de Banca Técnico 70%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_001', ['dominadas estrictas pronas']), sets: '3', reps: '8', weight: 'Auto', rpe: '7 (RIR 3)', videoUrl: '', progression: '[T3] Tracción vertical técnica', restTimer: '120' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2: Tracción Máxima - Peso Muerto (Esfuerzo Máximo Tracción)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLYO_001', ['salto al cajon']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Box Jump)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadliftT1, sets: '3', reps: '1x2 Top + 2x3', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T1] Peso Muerto Top Set 90% + Backoff 80%', restTimer: '300' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_005', ['remo en maquina con apoyo de pecho']), sets: '3', reps: '8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Remo apoyo pecho 70-75%', restTimer: '120' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3: Empuje Volumen - Press de Banca (Volumen Fuerza & Hipertrofia Neural)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: benchT1, sets: '5', reps: '4', weight: 'Auto', rpe: '7.5 (RIR 2-3)', videoUrl: '', progression: '[T1] Press de Banca 80% Volumen Neural', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPUSH_002', ['press de hombros sentado con mancuernas']), sets: '3', reps: '10', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Hombros sentado 65%', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_006', ['extension de triceps en polea alta con cuerda']), sets: '3', reps: '12', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T3] Tríceps polea 60%', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 4: Rodilla Máxima - Sentadilla Trasera (Esfuerzo Máximo Rodilla)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PAPE_001', ['vertical jump squat']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Jump Squat)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatT1, sets: '4', reps: '1x2 Top + 3x3', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T1] Sentadilla Top Set 90% + Backoff 80%', restTimer: '300' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_003', ['curl de isquiosurales sentado']), sets: '3', reps: '10', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T3] Curl femoral sentado soporte 65-70%', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 5: Variantes SBD - Spoto & RDL (Transmutación & Puntos de Estancamiento)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPUSH_014', ['press spoto']), sets: '3', reps: '5', weight: 'Auto', rpe: '7.5 (RIR 2-3)', videoUrl: '', progression: '[T2] Spoto Press 75% Control excéntrico', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_002', ['peso muerto rumano']), sets: '3', reps: '5', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] RDL Cadena Posterior 75%', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_004', ['press pallof']), sets: '3', reps: '10/lado', weight: 'Polea', rpe: '7', videoUrl: '', progression: 'Press Pallof anti-rotación', restTimer: '60' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 6 DÍAS FUERZA: SBD DOBLE FRECUENCIA ÉLITE ──
function generate6DayStrengthSBD(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean): WorkoutDay[] {
  const benchT1 = hasShoulder ? findEx('HPUSH_004', ['press banca inclinado con barra']) : findEx('HPUSH_001', ['press de banca con barra']);
  const squatT1 = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const deadliftT1 = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']) : findEx('HINGE_001', ['peso muerto convencional']);
  const ohpT1 = hasShoulder ? findEx('VPUSH_002', ['press de hombros sentado con mancuernas']) : findEx('VPUSH_001', ['press militar con barra de pie']);

  return [
    {
      id: uuidv4(),
      name: 'Día 1: Torso A - Press de Banca (Fuerza Máxima Horizontal)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PAPE_002', ['flexiones pliometricas pape', 'flexiones pliometricas']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Flexión Pliométrica)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchT1, sets: '4', reps: '4', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Press de Banca Competición 82.5%', restTimer: '240' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_005', ['remo en maquina con apoyo de pecho']), sets: '4', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Remo apoyo pecho 75%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_007', ['rompecraneos con barra ez']), sets: '3', reps: '10', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T3] Rompecráneos 65%', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2: Pierna A - Sentadilla Trasera (Esfuerzo Máximo Rodilla)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLYO_001', ['salto al cajon']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Box Jump)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatT1, sets: '4', reps: '4', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Sentadilla Trasera 80-82.5%', restTimer: '240' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_003', ['curl de isquiosurales sentado']), sets: '4', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Curl femoral sentado soporte 75%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_001', ['plancha frontal']), sets: '3', reps: '30s', weight: 'Corporal', rpe: '7', videoUrl: '', progression: 'Plancha anti-extensión RKC', restTimer: '60' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3: Tracción & Vertical - Dominada & Press Militar (Fuerza Vertical)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PAPE_003', ['med ball slams', 'lanzamiento balistico']), sets: '2', reps: '4', weight: '5-10kg', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Med Ball Slams)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: ohpT1, sets: '4', reps: '4', weight: 'Auto', rpe: '8.5 (RIR 1.5)', videoUrl: '', progression: '[T1] Press Militar 82.5%', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_001', ['dominadas estrictas pronas']), sets: '4', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Dominadas lastradas', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_001', ['elevaciones laterales con mancuernas']), sets: '3', reps: '12', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T3] Elevaciones laterales 60%', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 4: Pierna B - Peso Muerto (Esfuerzo Máximo Cadena Posterior)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLYO_002', ['salto de longitud']), sets: '2', reps: '3', weight: 'Corporal', rpe: '6 (PAPE)', videoUrl: '', progression: 'PAPE Primer Balístico (Broad Jump)', restTimer: '90' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadliftT1, sets: '4', reps: '1x2 Top + 3x3', weight: 'Auto', rpe: '8.5 (RIR 1-2)', videoUrl: '', progression: '[T1] Peso Muerto 85%', restTimer: '300' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004', ['prensa de piernas']), sets: '3', reps: '8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Prensa 45° 70% (Mitigación axial forzada - Cero compresión lumbar)', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_003', ['rueda abdominal']), sets: '3', reps: '10', weight: 'Corporal', rpe: '8', videoUrl: '', progression: 'Rueda Abdominal anti-extensión', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 5: Torso B - Spoto Press & Remo con Apoyo (Puntos de Estancamiento)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPUSH_014', ['press spoto']), sets: '4', reps: '5', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Spoto Press 75% Control excéntrico', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_009', ['remo pendlay']), sets: '4', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Remo Pendlay 75%', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_006', ['extension de triceps en polea alta con cuerda']), sets: '3', reps: '10', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: '[T3] Extensiones tríceps polea 65%', restTimer: '90' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 6: Pierna C - Sentadilla con Pausa & Cadera (Transmutación Asistida)',
      primaryModality: 'FUERZA',
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CATILLI_SQ_02', ['sentadilla atras (pausa)', 'sentadilla con pausa']), sets: '3', reps: '4', weight: 'Auto', rpe: '7.5 (RIR 2)', videoUrl: '', progression: '[T2] Sentadilla con Pausa 2s al 75%', restTimer: '180' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']), sets: '3', reps: '6', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2] Hip Thrust pesado 75% (Sin carga espinal)', restTimer: '120' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PRE_018', ['curl nordico de isquiosurales']), sets: '3', reps: '5', weight: 'Corporal', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T3] Curl Nórdico excéntrico', restTimer: '120' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 4 DÍAS TORSO / PIERNA (Estándar GBR / Lyle McDonald) ──
function generate4DayUpperLower(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean, phaseModality: string = 'HIPERTROFIA'): WorkoutDay[] {
  const benchExercise = hasShoulder ? findEx('HPUSH_004', ['press banca inclinado con barra']) : findEx('HPUSH_001', ['press de banca con barra']);
  const overheadPress = hasShoulder ? findEx('VPUSH_002', ['press de hombros sentado con mancuernas']) : findEx('VPUSH_001', ['press militar con barra de pie']);
  const squatExercise = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const deadliftVariant = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']) : findEx('HINGE_002', ['peso muerto rumano']);

  const pPrimary = getPhasePrescription('PRIMARY', phaseModality);
  const pSecondary = getPhasePrescription('SECONDARY', phaseModality);
  const pAccessory = getPhasePrescription('ACCESSORY', phaseModality);
  const pCore = getPhasePrescription('CORE', phaseModality);
  const pRamp = getPhasePrescription('RAMP', phaseModality);

  return [
    {
      id: uuidv4(),
      name: 'Día 1 - Torso A: Foco en Empuje Horizontal & Tracción Vertical (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_002', ['separacion de banda elastica']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Banda', rpe: pRamp.rpe, videoUrl: '', progression: 'Band Pull-Aparts' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_004', ['flexion escapular']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Corporal', rpe: pRamp.rpe, videoUrl: '', progression: 'Flexión escapular' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchExercise, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Press de banca con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasShoulder ? findEx('VPULL_003', ['jalon al pecho polea alta']) : findEx('VPULL_001', ['dominadas estrictas pronas']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T2] Dominadas / Jalón al pecho' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasShoulder ? findEx('HPUSH_002', ['press de banca con mancuernas']) : findEx('HPUSH_004', ['press de banca inclinado con barra']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press inclinado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_005', ['remo en maquina con apoyo de pecho']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T3] Remo máquina apoyo pecho' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_001', ['elevaciones laterales con mancuernas']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: pAccessory.rpe, videoUrl: '', progression: '[T3] Elevaciones laterales' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_006', ['extension de triceps en polea alta con cuerda']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Tríceps polea cuerda (Límite articular codo)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_004', ['press pallof']), sets: pCore.sets, reps: '12/lado', weight: 'Polea', rpe: pCore.rpe, videoUrl: '', progression: 'Press Pallof anti-rotación' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2 - Pierna A: Foco en Cuádriceps & Isquiosurales Soporte (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_002', ['movilizacion de tobillo contra pared']), sets: pRamp.sets, reps: '12/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Tobillo en pared' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_001', ['puente de gluteo con banda']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Puente glúteo con banda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatExercise, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Sentadilla trasera' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_003', ['curl de isquiosurales sentado']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Curl femoral sentado (SMH cadera 90° - Soporte forzado)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004', ['prensa de piernas']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Prensa a 45° pies bajos' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_001', ['extension de cuadriceps']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Sillón de cuádriceps' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_004', ['elevacion de talones de pie']), sets: '4', reps: '10-12', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Gemelos de pie' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_002', ['plancha lateral corta']), sets: pCore.sets, reps: '30s/lado', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Plancha lateral McGill' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3 - Torso B: Foco en Empuje Vertical & Tracción Horizontal (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_004', ['libro abierto toracico']), sets: pRamp.sets, reps: '8/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Libro abierto torácico' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_005', ['complejo ytwl en suelo']), sets: pRamp.sets, reps: '5/pos', weight: 'Corporal', rpe: pRamp.rpe, videoUrl: '', progression: 'Complejo YTWL' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_009', ['remo pendlay']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Remo Pendlay con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: overheadPress, sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press militar sentado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_005', ['jalon al pecho agarre neutro']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Jalón pecho agarre neutro' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_014', ['cruces en polea alta']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Cruces en polea (Pectoral SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_004', ['curl predicador con barra ez']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl predicador (Límite 3 series codo)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_008', ['extension de triceps tras nuca con mancuerna']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Tríceps overhead (SMH cabeza larga)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_003', ['perro de muestra', 'bird-dog']), sets: pCore.sets, reps: '6/lado', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Bird-dog McGill' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 4 - Pierna B: Foco en Cadena Posterior & Cadera (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_003', ['caminata lateral con banda']), sets: pRamp.sets, reps: '15/lado', weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Monster walks con banda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadliftVariant, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Peso muerto rumano con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasKnee ? findEx('LUNGE_001', ['sentadilla bulgara']) : findEx('SQUAT_005', ['sentadilla hack en maquina']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Hack Squat / Búlgara' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Hip Thrust con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_002', ['curl de isquiosurales acostado']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl femoral acostado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_005', ['elevacion de talones sentado']), sets: '4', reps: '15-20', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Gemelos sentado (sóleo)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasLumbar ? findEx('PREHAB_001', ['flexion abdominal de mcgill']) : findEx('CORE_003', ['rueda abdominal']), sets: pCore.sets, reps: '10-12', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Anti-extensión abdominal' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 3 DÍAS FULL BODY (Estándar DUP / Helms) ──
function generateFullBodyDays(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean, phaseModality: string = 'HIPERTROFIA'): WorkoutDay[] {
  const squat = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const bench = hasShoulder ? findEx('HPUSH_002', ['press de banca con mancuernas']) : findEx('HPUSH_001', ['press de banca con barra']);
  const deadlift = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra']) : findEx('HINGE_002', ['peso muerto rumano']);
  const press = hasShoulder ? findEx('VPUSH_002', ['press de hombros sentado con mancuernas']) : findEx('VPUSH_001', ['press militar con barra de pie']);

  const pPrimary = getPhasePrescription('PRIMARY', phaseModality);
  const pSecondary = getPhasePrescription('SECONDARY', phaseModality);
  const pAccessory = getPhasePrescription('ACCESSORY', phaseModality);
  const pCore = getPhasePrescription('CORE', phaseModality);
  const pRamp = getPhasePrescription('RAMP', phaseModality);

  return [
    {
      id: uuidv4(),
      name: 'Día 1 - Full Body A: Foco en Sentadilla & Empuje Plano (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_001', ['el mejor estiramiento del mundo']), sets: pRamp.sets, reps: '6/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'World Greatest Stretch' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squat, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Sentadilla trasera con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: bench, sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press con barra / mancuernas plano' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_005', ['jalon al pecho agarre neutro']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Jalón al pecho agarre neutro' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_003', ['curl de isquiosurales sentado']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl femoral sentado (SMH cadera 90°)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_008', ['extension de triceps tras nuca con mancuerna']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Tríceps overhead en polea (SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasLumbar ? findEx('PREHAB_006', ['insecto muerto']) : findEx('CORE_003', ['rueda abdominal']), sets: pCore.sets, reps: '12', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Rueda abdominal / Deadbug' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2 - Full Body B: Foco en Bisagra Cadera & Presión Vertical (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_001', ['puente de gluteo con banda']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Puente glúteo' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadlift, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Peso muerto rumano con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: press, sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press militar sentado mancuernas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004', ['prensa de piernas']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Prensa de piernas 45° guiada' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_005', ['remo en maquina con apoyo de pecho']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: pAccessory.rpe, videoUrl: '', progression: '[T3] Remo apoyo pecho / polea baja' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_014', ['curl inclinado con mancuernas']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl bíceps inclinado (SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_004', ['press pallof']), sets: pCore.sets, reps: '12/lado', weight: 'Polea', rpe: pCore.rpe, videoUrl: '', progression: 'Press Pallof anti-rotación' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3 - Full Body C: Foco en Empuje Inclinado & Aislamiento Cuádriceps (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_004', ['libro abierto toracico']), sets: pRamp.sets, reps: '8/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Libro abierto torácico' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasShoulder ? findEx('HPUSH_002') : findEx('HPUSH_004', ['press de banca inclinado con barra']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Press inclinado barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_009', ['remo pendlay']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Remo Pendlay con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('LUNGE_001', ['sentadilla bulgara']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Sentadilla Búlgara mancuernas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_001', ['elevaciones laterales con mancuernas']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Elevaciones laterales' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_001', ['extension de cuadriceps']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Sillón de cuádriceps reclinado (SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_002', ['plancha lateral corta']), sets: pCore.sets, reps: '30s/lado', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Plancha lateral McGill' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 3 DÍAS DIVISIÓN CLÁSICA GIMNASIO (Pecho/Tríceps, Espalda/Bíceps, Pierna/Hombro) ──
export function generate3DayClassicWeider(
  hasLumbar: boolean,
  hasShoulder: boolean,
  hasKnee: boolean,
  phaseModality: string = 'HIPERTROFIA'
): WorkoutDay[] {
  const pPrimary = getPhasePrescription('PRIMARY', phaseModality);
  const pSecondary = getPhasePrescription('SECONDARY', phaseModality);
  const pAccessory = getPhasePrescription('ACCESSORY', phaseModality);
  const pCore = getPhasePrescription('CORE', phaseModality);
  const pRamp = getPhasePrescription('RAMP', phaseModality);

  // Cortafuegos clínicos adaptativos
  const benchPrimary = hasShoulder
    ? findEx('HPUSH_002', ['press de banca con mancuernas'])
    : findEx('HPUSH_001', ['press de banca con barra']);

  const inclinePress = hasShoulder
    ? findEx('HPUSH_002', ['press de banca con mancuernas'])
    : findEx('HPUSH_004', ['press de banca inclinado con barra']);

  const pullPrimary = hasShoulder
    ? findEx('VPULL_005', ['jalon al pecho agarre neutro'])
    : findEx('VPULL_001', ['dominadas estrictas pronas']);

  const rowSecondary = hasLumbar
    ? findEx('HPULL_005', ['remo en maquina con apoyo de pecho'])
    : findEx('HPULL_001', ['remo con barra inclinado']);

  const squatPrimary = hasLumbar || hasKnee
    ? findEx('SQUAT_004', ['prensa de piernas'])
    : findEx('SQUAT_001', ['sentadilla trasera con barra']);

  const hingeSecondary = hasLumbar
    ? findEx('ISO_003', ['curl de isquiosurales sentado'])
    : findEx('HINGE_002', ['peso muerto rumano']);

  const shoulderPress = hasShoulder
    ? findEx('VPUSH_002', ['press de hombros sentado con mancuernas'])
    : findEx('VPUSH_001', ['press militar con barra de pie']);

  return [
    {
      id: uuidv4(),
      name: 'Día 1 - Pecho & Tríceps: Foco en Empuje Horizontal & Brazos (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_004', ['flexion escapular']), sets: pRamp.sets, reps: '12', weight: 'Corporal', rpe: pRamp.rpe, videoUrl: '', progression: 'Activación y centrado escapular RAMP' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchPrimary, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: `[T1] ${benchPrimary.Nombre_Oficial} (${pPrimary.progression || 'Sobrecarga'})` },
        { id: uuidv4(), type: 'EXERCISE', exercise: inclinePress, sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press inclinado pectoral superior' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_014', ['cruces en polea alta']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Cruces en polea (Pectoral SMH estiramiento)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_006', ['extension de triceps en polea alta con cuerda']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Extensión tríceps polea cuerda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_008', ['extension de triceps tras nuca con mancuerna']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Tríceps overhead tras nuca (Cabeza larga SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasLumbar ? findEx('PREHAB_006', ['insecto muerto']) : findEx('CORE_001', ['plancha frontal']), sets: pCore.sets, reps: '45s', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Plancha frontal RKC antiextensión' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2 - Espalda & Bíceps: Foco en Tirón Vertical/Horizontal & Flexores (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_004', ['libro abierto toracico']), sets: pRamp.sets, reps: '8/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Movilidad torácica y escapular RAMP' },
        { id: uuidv4(), type: 'EXERCISE', exercise: pullPrimary, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: `[T1] ${pullPrimary.Nombre_Oficial} (${pPrimary.progression || 'Sobrecarga'})` },
        { id: uuidv4(), type: 'EXERCISE', exercise: rowSecondary, sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Remo con soporte de pecho / barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_003', ['vuelos posteriores con mancuernas', 'pajaros']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Pájaros posteriores (Deltoides posterior)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_001', ['curl de biceps con barra recta']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: pAccessory.rpe, videoUrl: '', progression: '[T3] Curl de bíceps con barra recta' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_014', ['curl inclinado con mancuernas']), sets: '3', reps: '10-12', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl bíceps banco inclinado (Cabeza larga SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_006', ['insecto muerto', 'deadbug']), sets: pCore.sets, reps: pCore.reps, weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Deadbug antiextensión lumbar' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3 - Piernas & Hombros: Foco en Dominancia Rodilla/Cadera & Deltoides (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_002', ['movilizacion de tobillo contra pared']), sets: pRamp.sets, reps: '12/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Movilidad de tobillo y cadera RAMP' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatPrimary, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: `[T1] ${squatPrimary.Nombre_Oficial} (${pPrimary.progression || 'Sobrecarga'})` },
        { id: uuidv4(), type: 'EXERCISE', exercise: hingeSecondary, sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Peso muerto rumano / Curl femoral sentado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: shoulderPress, sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press militar de hombros' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_001', ['elevaciones laterales con mancuernas']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Elevaciones laterales con mancuernas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_004', ['elevacion de talones de pie']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Elevación de talones de pie (Gemelos)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_004', ['press pallof']), sets: pCore.sets, reps: '12/lado', weight: 'Polea', rpe: pCore.rpe, videoUrl: '', progression: 'Press Pallof anti-rotación 360°' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 5 DÍAS HÍBRIDO PHAT (Upper/Lower Power + PPL Hipertrofia) ──
function generate5DayPPLUpperLower(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean, phaseModality: string = 'HIPERTROFIA'): WorkoutDay[] {
  const pPrimary = getPhasePrescription('PRIMARY', phaseModality);
  const pSecondary = getPhasePrescription('SECONDARY', phaseModality);
  const pAccessory = getPhasePrescription('ACCESSORY', phaseModality);
  const pCore = getPhasePrescription('CORE', phaseModality);
  const pRamp = getPhasePrescription('RAMP', phaseModality);

  const squatExercise = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const benchExercise = hasShoulder ? findEx('HPUSH_004', ['press de banca inclinado con barra']) : findEx('HPUSH_001', ['press de banca con barra']);
  const deadliftVariant = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra']) : findEx('HINGE_002', ['peso muerto rumano']);

  return [
    {
      id: uuidv4(),
      name: 'Día 1 - Upper Power: Foco en Empuje Horizontal & Remo Pesado (Hipertrofia/Tensión)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_002', ['separacion de banda elastica']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Banda', rpe: pRamp.rpe, videoUrl: '', progression: 'Band Pull-Aparts' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchExercise, sets: '4', reps: '4-6', weight: 'Pesado', rpe: '8.5 (RIR 1-2)', videoUrl: '', progression: '[T1 Power] Press de banca plano (180s descanso)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_009', ['remo pendlay']), sets: '4', reps: '4-6', weight: 'Pesado', rpe: '8.5 (RIR 1-2)', videoUrl: '', progression: '[T1 Power] Remo Pendlay con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasShoulder ? findEx('VPUSH_002') : findEx('VPUSH_001', ['press militar con barra de pie']), sets: '3', reps: '6-8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2 Power] Press militar con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_001', ['curl de biceps con barra recta']), sets: '3', reps: '8-10', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T3] Curl bíceps barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_006', ['extension de triceps en polea alta con cuerda']), sets: '3', reps: '8-10', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T3] Tríceps polea cuerda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_006', ['insecto muerto']), sets: pCore.sets, reps: pCore.reps, weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Deadbug antiextensión' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2 - Lower Power: Foco en Sentadilla Trasera & Bisagra Pesada (Hipertrofia/Tensión)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_002', ['movilizacion de tobillo contra pared']), sets: pRamp.sets, reps: '12/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Tobillo pared' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatExercise, sets: '4', reps: '4-6', weight: 'Pesado', rpe: '8.5 (RIR 1-2)', videoUrl: '', progression: '[T1 Power] Sentadilla trasera pesada' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadliftVariant, sets: '4', reps: '4-6', weight: 'Pesado', rpe: '8.5 (RIR 1-2)', videoUrl: '', progression: '[T1 Power] RDL / Hip Thrust pesado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004', ['prensa de piernas']), sets: '3', reps: '6-8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T2 Power] Prensa 45° pesada' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_004', ['elevacion de talones de pie']), sets: '4', reps: '8-10', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Gemelos de pie' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_002', ['plancha lateral corta']), sets: pCore.sets, reps: '30s/lado', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Plancha lateral McGill' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3 - Push Hipertrofia: Foco en Pectoral Clavicular & Tríceps Overhead (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_004', ['flexion escapular']), sets: pRamp.sets, reps: '12', weight: 'Corporal', rpe: pRamp.rpe, videoUrl: '', progression: 'Flexión escapular' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasShoulder ? findEx('HPUSH_002') : findEx('HPUSH_004', ['press de banca inclinado con barra']), sets: '3', reps: '10-12', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T2] Press inclinado mancuernas / barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPUSH_006', ['fondos en paralelas (pecho)']), sets: '3', reps: '8-10', weight: 'Corporal', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T2] Fondos en paralelas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_014', ['cruces en polea alta']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Cruces en polea (Pectoral SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_001', ['elevaciones laterales con mancuernas']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Elevaciones laterales' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_008', ['extension de triceps tras nuca con mancuerna']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Extensión tríceps overhead (SMH cabeza larga)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_004', ['press pallof']), sets: pCore.sets, reps: '12/lado', weight: 'Polea', rpe: pCore.rpe, videoUrl: '', progression: 'Press Pallof anti-rotación' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 4 - Pull Hipertrofia: Foco en Dorsal Ancho & Bíceps Longitud (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_004', ['libro abierto toracico']), sets: pRamp.sets, reps: '8/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Libro abierto torácico' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_003', ['jalon al pecho polea alta']), sets: '3', reps: '10-12', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T2] Jalón al pecho polea alta' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_005', ['remo en maquina con apoyo de pecho']), sets: '3', reps: '10-12', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T2] Remo máquina apoyo de pecho' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_004', ['face pulls en polea']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Face pull en polea' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_003', ['vuelos posteriores con mancuernas']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Pájaros posteriores' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_014', ['curl inclinado con mancuernas']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl inclinado mancuernas (SMH)' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 5 - Legs Hipertrofia: Foco en Búlgara & Isquios Elongados (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_003', ['caminata lateral con banda']), sets: pRamp.sets, reps: '15/lado', weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Monster walks con banda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('LUNGE_001', ['sentadilla bulgara']), sets: '3', reps: '10-12', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T2] Sentadilla Búlgara con mancuernas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra']), sets: '3', reps: '10-12', weight: 'Auto', rpe: '8.5 (RIR 1)', videoUrl: '', progression: '[T2] Hip Thrust con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_003', ['curl de isquiosurales sentado']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl femoral sentado (SMH cadera 90°)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_001', ['extension de cuadriceps']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Sillón de cuádriceps reclinado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_005', ['elevacion de talones sentado']), sets: '4', reps: '15-20', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Gemelos sentado (sóleo)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_001', ['flexion abdominal de mcgill']), sets: pCore.sets, reps: '5-3-1', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'McGill curl-up' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN 6 DÍAS PPL x 2 (Push / Pull / Legs Doble Frecuencia Avanzado) ──
function generate6DayPPLDays(hasLumbar: boolean, hasShoulder: boolean, hasKnee: boolean, phaseModality: string = 'HIPERTROFIA'): WorkoutDay[] {
  const pPrimary = getPhasePrescription('PRIMARY', phaseModality);
  const pSecondary = getPhasePrescription('SECONDARY', phaseModality);
  const pAccessory = getPhasePrescription('ACCESSORY', phaseModality);
  const pCore = getPhasePrescription('CORE', phaseModality);
  const pRamp = getPhasePrescription('RAMP', phaseModality);

  const squatExercise = hasLumbar || hasKnee ? findEx('SQUAT_004', ['prensa de piernas']) : findEx('SQUAT_001', ['sentadilla trasera con barra']);
  const benchExercise = hasShoulder ? findEx('HPUSH_004', ['press de banca inclinado con barra']) : findEx('HPUSH_001', ['press de banca con barra']);
  const overheadPress = hasShoulder ? findEx('VPUSH_002', ['press de hombros sentado con mancuernas']) : findEx('VPUSH_001', ['press militar con barra de pie']);
  const deadliftVariant = hasLumbar ? findEx('HINGE_005', ['empuje de cadera con barra']) : findEx('HINGE_002', ['peso muerto rumano']);

  return [
    {
      id: uuidv4(),
      name: 'Día 1 - Push A: Foco en Pectoral Medio & Tríceps Lateral (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_002', ['separacion de banda elastica']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Banda', rpe: pRamp.rpe, videoUrl: '', progression: 'Band Pull-Aparts' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_004', ['flexion escapular']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Corporal', rpe: pRamp.rpe, videoUrl: '', progression: 'Flexión escapular' },
        { id: uuidv4(), type: 'EXERCISE', exercise: benchExercise, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Press de banca plano con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasShoulder ? findEx('HPUSH_002') : findEx('HPUSH_004', ['press de banca inclinado con barra']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press inclinado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_014', ['cruces en polea alta']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Cruces en polea (SMH)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_001', ['elevaciones laterales con mancuernas']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Elevaciones laterales' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_006', ['extension de triceps en polea alta con cuerda']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Tríceps polea cuerda (Límite 3 series codo)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_006', ['insecto muerto']), sets: pCore.sets, reps: pCore.reps, weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Deadbug antiextensión' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2 - Pull A: Foco en Dorsal Ancho & Bíceps Supinado (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_004', ['libro abierto toracico']), sets: pRamp.sets, reps: '8/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Libro abierto torácico' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_005', ['complejo ytwl en suelo']), sets: pRamp.sets, reps: '5/pos', weight: 'Corporal', rpe: pRamp.rpe, videoUrl: '', progression: 'Complejo YTWL' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasShoulder ? findEx('VPULL_003') : findEx('VPULL_001', ['dominadas estrictas pronas']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Dominadas estrictas pronas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_005', ['remo en maquina con apoyo de pecho']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Remo máquina apoyo de pecho' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_005', ['jalon al pecho agarre neutro']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Jalón al pecho agarre neutro' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_003', ['vuelos posteriores con mancuernas']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Pájaros posteriores' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_004', ['curl predicador con barra ez']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl predicador EZ (Límite 3 series codo)' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3 - Legs A: Foco en Cuádriceps Dominante & Gemelos (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_002', ['movilizacion de tobillo contra pared']), sets: pRamp.sets, reps: '12/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Tobillo en pared' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_001', ['puente de gluteo con banda']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Puente glúteo con banda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: squatExercise, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Sentadilla trasera con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_003', ['curl de isquiosurales sentado']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Curl femoral sentado (SMH cadera 90° - Soporte forzado)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004', ['prensa de piernas']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Prensa a 45° pies bajos' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_001', ['extension de cuadriceps']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Sillón de cuádriceps' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_004', ['elevacion de talones de pie']), sets: '4', reps: '10-12', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Gemelos de pie' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CORE_004', ['press pallof']), sets: pCore.sets, reps: '12/lado', weight: 'Polea', rpe: pCore.rpe, videoUrl: '', progression: 'Press Pallof anti-rotación' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 4 - Push B: Foco en Deltoides Militar & Tríceps Overhead (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_002', ['separacion de banda elastica']), sets: pRamp.sets, reps: pRamp.reps, weight: 'Banda', rpe: pRamp.rpe, videoUrl: '', progression: 'Band Pull-Aparts' },
        { id: uuidv4(), type: 'EXERCISE', exercise: overheadPress, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Press militar barra / mancuernas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPUSH_006', ['fondos en paralelas (pecho)']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Corporal', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Fondos en paralelas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPUSH_002', ['press de banca con mancuernas']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Press banca mancuernas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_005', ['elevaciones laterales en polea']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Elevaciones laterales en polea' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_008', ['extension de triceps tras nuca con mancuerna']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Tríceps overhead mancuerna (SMH cabeza larga)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_002', ['plancha lateral corta']), sets: pCore.sets, reps: '30s/lado', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Plancha lateral McGill' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 5 - Pull B: Foco en Espalda Alta Romboides & Bíceps Inclinado (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_004', ['libro abierto toracico']), sets: pRamp.sets, reps: '8/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Libro abierto torácico' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_009', ['remo pendlay']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Remo Pendlay con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPULL_001', ['remo con barra inclinado']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Remo con barra inclinado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_004', ['jalon al pecho agarre supino']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Jalón al pecho agarre supino' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHISO_004', ['face pulls en polea']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Face pull en polea' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARMISO_014', ['curl inclinado con mancuernas']), sets: '3', reps: '12-15', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl bíceps inclinado (SMH cabeza larga)' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 6 - Legs B: Foco en Cadena Posterior & Glúteos (Hipertrofia)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_003', ['caminata lateral con banda']), sets: pRamp.sets, reps: '15/lado', weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Monster walks con banda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: deadliftVariant, sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: pPrimary.progression || '[T1] Peso muerto rumano con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasKnee ? findEx('LUNGE_001', ['sentadilla bulgara']) : findEx('SQUAT_005', ['sentadilla hack en maquina']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Sentadilla Hack en máquina' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: '[T2] Hip Thrust con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_002', ['curl de isquiosurales acostado']), sets: pAccessory.sets, reps: pAccessory.reps, weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Curl femoral acostado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ISO_005', ['elevacion de talones sentado']), sets: '4', reps: '15-20', weight: 'Auto', rpe: '0 (Fallo)', videoUrl: '', progression: '[T3] Gemelos sentado (sóleo)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: hasLumbar ? findEx('PREHAB_001') : findEx('CORE_003', ['rueda abdominal']), sets: pCore.sets, reps: '10-12', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Rueda abdominal' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN ESPECIALIZACIÓN GLÚTEOS (Bret Contreras LVT) ──
function generateGluteSpecializationDays(hasLumbar: boolean, hasKnee: boolean, phaseModality: string = 'HIPERTROFIA'): WorkoutDay[] {
  const pPrimary = getPhasePrescription('PRIMARY', phaseModality);
  const pSecondary = getPhasePrescription('SECONDARY', phaseModality);
  const pAccessory = getPhasePrescription('ACCESSORY', phaseModality);
  const pCore = getPhasePrescription('CORE', phaseModality);
  const pRamp = getPhasePrescription('RAMP', phaseModality);

  return [
    {
      id: uuidv4(),
      name: 'Día 1: Glúteo Máximo (Vector Anteroposterior Pesado)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_003', ['caminata lateral con banda']), sets: pRamp.sets, reps: '15/lado', weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Caminata lateral' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra', 'hip thrust']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: 'Barbell Hip Thrust pesado (Pausa 2s)' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('LUNGE_002', ['sentadilla bulgara']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: 'Sentadilla búlgara con mancuernas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_002', ['peso muerto rumano', 'rdl']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: 'RDL con barra' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_002', ['plancha lateral mcgill']), sets: pCore.sets, reps: '30s/lado', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Plancha lateral' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2: Glúteo Medio & Cadena Posterior (Vector Axial & Lateral)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_001', ['puente de gluteo']), sets: pRamp.sets, reps: '20', weight: 'Miniband', rpe: pRamp.rpe, videoUrl: '', progression: 'Puente glúteo con banda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_002', ['peso muerto rumano']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Auto', rpe: pPrimary.rpe, videoUrl: '', progression: 'Peso muerto rumano pesado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: 'Hip Thrust moderado' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_005', ['curl nordico excentrico']), sets: pAccessory.sets, reps: '4-5', weight: 'Corporal', rpe: 'Control', videoUrl: '', progression: 'Curl nórdico excéntrico' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_003', ['bird-dog']), sets: pCore.sets, reps: '6/lado', weight: 'Corporal', rpe: 'Bird-dog' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3: Bombeo Metabólico & Glúteo 3D (Altas Repeticiones)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HINGE_005', ['empuje de cadera con barra']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: 'Hip Thrust con pausa' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004', ['prensa de piernas']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Auto', rpe: pSecondary.rpe, videoUrl: '', progression: 'Prensa 45° pies altos' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_003', ['caminata lateral con banda']), sets: pAccessory.sets, reps: '20/lado', weight: 'Miniband', rpe: '10 (Al fallo)', videoUrl: '', progression: 'Monster walks continuos' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_006', ['insecto muerto', 'deadbug']), sets: pCore.sets, reps: pCore.reps, weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Deadbug' }
      ]
    }
  ];
}

// ── IMPLEMENTACIÓN CALISTENIA PROGRESIVA (Steven Low / Overcoming Gravity) ──
function generateCalisthenicsDays(hasShoulder: boolean, hasLumbar: boolean, phaseModality: string = 'HIPERTROFIA'): WorkoutDay[] {
  const pPrimary = getPhasePrescription('PRIMARY', phaseModality);
  const pSecondary = getPhasePrescription('SECONDARY', phaseModality);
  const pAccessory = getPhasePrescription('ACCESSORY', phaseModality);
  const pCore = getPhasePrescription('CORE', phaseModality);
  const pRamp = getPhasePrescription('RAMP', phaseModality);

  return [
    {
      id: uuidv4(),
      name: 'Día 1: Torso / Pierna Gimnástico A (Empuje Vertical & Tracción)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_004', ['libro abierto']), sets: pRamp.sets, reps: '8/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Libro abierto' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_004', ['flexion escapular']), sets: pRamp.sets, reps: '10-12', weight: 'Corporal', rpe: pRamp.rpe, videoUrl: '', progression: 'Flexión escapular' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CAL_014', ['parada de manos asistida', 'handstand']), sets: pPrimary.sets, reps: '5-8', weight: 'Corporal', rpe: pPrimary.rpe, videoUrl: '', progression: 'Parada de manos asistida' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_001', ['dominadas pronas', 'pull-up']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Corporal', rpe: pPrimary.rpe, videoUrl: '', progression: 'Dominadas pronas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CAL_001', ['fondos en paralelas', 'dips']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Corporal', rpe: pSecondary.rpe, videoUrl: '', progression: 'Fondos en paralelas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_006', ['sentadilla a una pierna', 'pistol squat']), sets: pSecondary.sets, reps: '6-8/pierna', weight: 'Corporal', rpe: pSecondary.rpe, videoUrl: '', progression: 'Pistol squat' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_005', ['curl nordico']), sets: pAccessory.sets, reps: '4-5', weight: 'Corporal', rpe: 'Control', videoUrl: '', progression: 'Curl nórdico excéntrico' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 2: Torso / Core Gimnástico B (Empuje Horizontal & Anillas)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_002', ['separacion de banda']), sets: pRamp.sets, reps: '15-20', weight: 'Banda', rpe: pRamp.rpe, videoUrl: '', progression: 'Separación con banda' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_004', ['pseudo planche']), sets: pSecondary.sets, reps: '10-12', weight: 'Corporal', rpe: pSecondary.rpe, videoUrl: '', progression: 'Pseudo Planche Push-ups' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CAL_003', ['remo invertido en anillas']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Corporal', rpe: pPrimary.rpe, videoUrl: '', progression: 'Remos invertidos en anillas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CAL_001', ['fondos en anillas']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Corporal', rpe: pSecondary.rpe, videoUrl: '', progression: 'Fondos en anillas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CAL_013', ['l-sit en paralelas']), sets: pCore.sets, reps: '15-20s', weight: 'Corporal', rpe: 'Compresión', videoUrl: '', progression: 'L-Sit en paralelas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_002', ['plancha lateral']), sets: pCore.sets, reps: '30s/lado', weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Plancha lateral McGill' }
      ]
    },
    {
      id: uuidv4(),
      name: 'Día 3: Potencia & Resistencia Gimnástica C (Full Body Flow)',
      primaryModality: phaseModality,
      isCollapsed: false,
      items: [
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLIO_001', ['saltos pogo']), sets: pRamp.sets, reps: '15 rebotes', weight: 'Corporal', rpe: 'Potenciación', videoUrl: '', progression: 'Saltos pogo' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('VPULL_003', ['dominadas neutras']), sets: pPrimary.sets, reps: pPrimary.reps, weight: 'Corporal', rpe: pPrimary.rpe, videoUrl: '', progression: 'Dominadas neutras' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('HPUSH_003', ['flexiones declinadas', 'push-ups']), sets: pSecondary.sets, reps: pSecondary.reps, weight: 'Corporal', rpe: pSecondary.rpe, videoUrl: '', progression: 'Flexiones declinadas' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PLIO_002', ['salto de longitud']), sets: pSecondary.sets, reps: '4 saltos', weight: 'Corporal', rpe: 'Pliometría', videoUrl: '', progression: 'Salto de longitud a dos pies' },
        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_006', ['insecto muerto']), sets: pCore.sets, reps: pCore.reps, weight: 'Corporal', rpe: pCore.rpe, videoUrl: '', progression: 'Deadbug' }
      ]
    }
  ];
}

import { type ExerciseTaxonomy, EXERCISES_DATABASE } from '../data/exercisesData';
import { useClinicalStore } from '../stores/useClinicalStore';

export interface ClinicalEvaluationResult {
  isBlocked: boolean;
  blockReason?: string;
  isSwapped: boolean;
  originalExerciseId?: string;
  newExerciseId?: string;
  newExercise?: ExerciseTaxonomy;
  clinicalRationale?: string;
  recommendedTempo?: string;
  recommendedRir?: number;
  recommendedRpe?: number;
  pacingNote?: string;
}

// --------------------------------------------------------------------------------
// PROTOCOLOS DE PROGRESIÓN TERAPÉUTICA (Cook & Purdam + Rio TNT)
// --------------------------------------------------------------------------------
export const THERAPEUTIC_PROGRESSION_LOGIC = {
  Phase_1_Reactive: {
    objective: "Analgesia mediada por el SNC y reducción de inhibición cortical",
    intervention: "Isometría Analgésica Pautada",
    dosage: "5 series x 45s holds",
    intensityMVC: "70-80%",
    restSeconds: 120
  },
  Phase_2_Dysrepair: {
    objective: "Mecanotransducción, síntesis de colágeno y organización de matriz",
    intervention: "Heavy Slow Resistance (HSR) + Tendon Neuroplastic Training (TNT)",
    dosage: "3-4 series x 15-6 RM progresivo en 8-12 semanas",
    tempo: "3-2-3-0 o 3-0-3-0",
    pacingMechanism: "Metrónomo externo sincronizado a 60 bpm"
  },
  Phase_3_Degenerative_Dynamic: {
    objective: "Tolerancia al ciclo de estiramiento-acortamiento (CEA)",
    intervention: "Carga pliométrica, balística y drop landings",
    constraint: "Mantenimiento profiláctico HSR 1 vez por semana mínimo"
  }
};

// --------------------------------------------------------------------------------
// DICCIONARIO DE SMART SWAPS (INJURY_FIREWALL_V2_PRO)
// --------------------------------------------------------------------------------

interface SwapRule {
  id: string;
  triggerPathology: string;
  triggerKeywords: string[];
  replacementId: string;
  rationale: string;
  maxRpe?: number;
  minRir?: number;
  recommendedTempo?: string;
  pacingNote?: string;
}

const SMART_SWAPS_DICTIONARY: SwapRule[] = [
  // ── COLUMNA LUMBAR ──
  {
    id: 'SWAP_LUMBAR_001',
    triggerPathology: 'LUMBAR_PAIN',
    triggerKeywords: ['sentadilla trasera', 'back squat', 'buenos dias', 'squat'],
    replacementId: 'SQUAT_003', // Sentadilla Copa (Goblet Squat)
    rationale: 'Desplaza el centro de masas al plano anterior. Dicta verticalidad del tronco y reduce las fuerzas de cizallamiento y compresión en L4-L5 a umbrales seguros (< 3400N NIOSH).',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '3-1-1-0'
  },
  {
    id: 'SWAP_LUMBAR_002',
    triggerPathology: 'LUMBAR_PAIN',
    triggerKeywords: ['peso muerto convencional', 'deadlift convencional', 'peso muerto'],
    replacementId: 'GLUTE_001', // Barbell Hip Thrust
    rationale: 'Aísla la extensión de cadera hipertrófica apoyando la espalda sobre un banco, eliminando por completo el momento de flexión lumbar y el torque espinal.',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '2-1-1-2'
  },
  {
    id: 'SWAP_LUMBAR_003',
    triggerPathology: 'LUMBAR_PAIN',
    triggerKeywords: ['sit-up', 'crunch', 'abdominales tradicionales'],
    replacementId: 'PREHAB_001', // McGill Curl-Up
    rationale: 'Sustitución para construir rigidez isométrica profunda (McGill Big 3), evitando la flexión lumbar repetitiva bajo carga que degenera el anillo fibroso.',
    maxRpe: 7,
    minRir: 3,
    recommendedTempo: 'Pausa 10s'
  },
  {
    id: 'SWAP_LUMBAR_004',
    triggerPathology: 'LUMBAR_PAIN',
    triggerKeywords: ['press militar con barra', 'press militar de pie', 'overhead press'],
    replacementId: 'SHO_003', // Elevaciones laterales en plano escapular / Press sentado
    rationale: 'Previene la hiperextensión lumbar forzada y el choque de las facetas articulares lumbares bajo compresión vertical.',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '2-0-2-0'
  },

  // ── COMPLEJO DEL HOMBRO ──
  {
    id: 'SWAP_SHOULDER_001',
    triggerPathology: 'SHOULDER_IMPINGEMENT',
    triggerKeywords: ['remo al cuello', 'upright row', 'elevacion lateral en rotacion interna', 'empty can'],
    replacementId: 'SHO_003', // Elevaciones en Plano Escapular (Scaption) con rotación externa
    rationale: 'Aprovecha el plano escapular natural (30-45°), facilitando el tilt posterior. La rotación externa remueve el tubérculo mayor de la trayectoria acromial, preservando el espacio de 10-15 mm.',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '3-0-1-0'
  },
  {
    id: 'SWAP_SHOULDER_002',
    triggerPathology: 'SHOULDER_IMPINGEMENT',
    triggerKeywords: ['press militar', 'overhead press', 'shrugs'],
    replacementId: 'RAMP_004', // Push-up Plus (Flexión Escapular)
    rationale: 'Minimiza los ratios electromiográficos lesivos (UT/SA y UT/LT). Aísla el trabajo en el serrato anterior y trapecio inferior, reprimiendo el patrón de encogimiento patológico.',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '2-2-2-0'
  },
  {
    id: 'SWAP_SHOULDER_003',
    triggerPathology: 'SHOULDER_IMPINGEMENT',
    triggerKeywords: ['press de banca con barra', 'barbell bench press', 'dips profundos', 'fondos'],
    replacementId: 'CHEST_003', // Press Inclinado con Mancuernas (Neutro) / Floor Press
    rationale: 'Permite rotación humeral libre y tope de descenso seguro. Evita que el húmero cruce a hiperextensión pasiva, protegiendo la cápsula glenohumeral anterior.',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '2-1-1-0'
  },

  // ── RODILLA (PATELOFEMORAL & LCA) ──
  {
    id: 'SWAP_KNEE_001',
    triggerPathology: 'PATELLOFEMORAL_PAIN',
    triggerKeywords: ['leg extension', 'extension de cuadriceps', 'sentadilla profunda libre'],
    replacementId: 'SQUAT_004', // Prensa 45° con pies altos / Spanish Squat
    rationale: 'En cadena abierta, elimina las fuerzas de reacción (PFJRF) en ángulos terminales (0-30°); en cadena cerrada, anula el pico compresivo rotuliano en flexión extrema mediante co-contracción de isquios.',
    maxRpe: 8.5,
    minRir: 1,
    recommendedTempo: '3-0-2-0'
  },
  {
    id: 'SWAP_KNEE_002',
    triggerPathology: 'PATELLOFEMORAL_PAIN',
    triggerKeywords: ['salto', 'jump', 'pliometria', 'box jump'],
    replacementId: 'MOV_002', // Movilización de Tobillo contra Pared
    rationale: 'Restaura la dorsiflexión del tobillo y reduce el impacto de compresión reactiva sobre el tendón rotuliano, previniendo el valgo dinámico compensatorio.',
    maxRpe: 7,
    minRir: 3,
    recommendedTempo: 'Controlado'
  },

  // ── TOBILLO & PIE ──
  {
    id: 'SWAP_ANKLE_001',
    triggerPathology: 'WBLT_DORSIFLEXION_DEFICIT',
    triggerKeywords: ['sentadilla trasera clasica', 'pistol squat', 'sentadilla libre'],
    replacementId: 'SQUAT_003', // Sentadilla Copa con Talones Elevados (>20mm)
    rationale: 'Restablece el rango mecánico aparente del tobillo. Permite una traslación tibial adecuada, cancelando la compensación en cadena que causaría pronación plantar y retroversión pélvica ("butt wink").',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '3-0-1-0'
  },
  {
    id: 'SWAP_FOOT_001',
    triggerPathology: 'PLANTAR_FASCIOPATHY',
    triggerKeywords: ['calf raise', 'estiramiento estatico', 'saltos en cuerda'],
    replacementId: 'CALF_001', // Protocolo Rathleff: Elevación Unilateral de Talón con Toalla
    rationale: 'Dorsiflexión forzada de la 1ª articulación metatarsofalángica mediante toalla (Mecanismo de Molinete). Aplica carga tensional HSR para remodelar colágeno.',
    maxRpe: 9,
    minRir: 1,
    recommendedTempo: '3-2-3-0'
  },

  // ── CODO & MUÑECA ──
  {
    id: 'SWAP_ELBOW_001',
    triggerPathology: 'LATERAL_EPICONDYLALGIA',
    triggerKeywords: ['curl invertido', 'extension de muñeca rapida'],
    replacementId: 'RAMP_002', // Extensiones HSR / Band Pull-Aparts pautados con metrónomo
    rationale: 'Protocolo Tendon Neuroplastic Training (TNT). Interrupción de la hiperactividad corticoespinal y normalización del control motor a través de sincronización acústica a 60 bpm.',
    maxRpe: 8,
    minRir: 2,
    recommendedTempo: '3-0-3-0',
    pacingNote: 'Sincronizar tempo con metrónomo a 60 bpm'
  }
];

// --------------------------------------------------------------------------------
// MATRIZ DE BANDERAS ROJAS (RED FLAGS TRIAGE)
// --------------------------------------------------------------------------------

interface RedFlagConfig {
  code: string;
  category: string;
  matchers: string[];
  action: 'BLOQUEO_TOTAL';
  userMessage: string;
}

const RED_FLAGS_DICTIONARY: RedFlagConfig[] = [
  {
    code: 'FLAG_NEURO_001',
    category: 'Radiculopatía / Cauda Equina',
    matchers: ['pérdida de fuerza en el pie', 'pie caído', 'adormecimiento perineal', 'silla de montar', 'incontinencia', 'dolor eléctrico bajo la rodilla'],
    action: 'BLOQUEO_TOTAL',
    userMessage: 'Alerta Neurológica: Posible compromiso radicular agudo L5-S1 o cauda equina. Suspensión inmediata de carga y derivación urgente a Neurología/Neurocirugía.'
  },
  {
    code: 'FLAG_ONCO_002',
    category: 'Sospecha Oncológica / Sistémica',
    matchers: ['dolor nocturno constante', 'pérdida de peso sin dieta', 'fatiga extrema', 'fiebre articular'],
    action: 'BLOQUEO_TOTAL',
    userMessage: 'Alerta Sistémica: Patrón de dolor no mecánico. Se requiere evaluación médica especializada para descartar patología grave subyacente.'
  },
  {
    code: 'FLAG_CARDIO_003',
    category: 'Isquemia Miocárdica / Cardiovascular',
    matchers: ['presión torácica', 'opresión en el pecho', 'falta de aire en reposo', 'dolor de mandíbula', 'sudoración fría'],
    action: 'BLOQUEO_TOTAL',
    userMessage: 'Alerta Cardiovascular: Sospecha de evento coronario o isquémico. Suspenda toda actividad física y contacte de inmediato a los servicios de emergencia.'
  },
  {
    code: 'FLAG_TRAUMA_004',
    category: 'Fractura / Inestabilidad Traumática',
    matchers: ['traumatismo reciente', 'deformidad ósea', 'imposibilidad de soportar peso', 'dolor agudo post-caída'],
    action: 'BLOQUEO_TOTAL',
    userMessage: 'Alerta Traumatológica: Sospecha de fractura o luxación aguda. Requiere diagnóstico por imagen antes de aplicar cualquier carga mecánica.'
  },
  {
    code: 'FLAG_MYO_005',
    category: 'Rotura Miotendinosa Completa',
    matchers: ['chasquido fuerte', 'pérdida súbita de fuerza', 'signo de popeye', 'masa muscular retraída'],
    action: 'BLOQUEO_TOTAL',
    userMessage: 'Alerta Estructural: Posible rotura miotendinosa completa. Evaluación ortopédica obligatoria para determinar conducta médica/quirúrgica.'
  }
];

export const checkRedFlags = (symptomList: string[]): { isBlocked: boolean; blockReason?: string; code?: string } => {
  const normalized = symptomList.map(s => s.toLowerCase());

  for (const flag of RED_FLAGS_DICTIONARY) {
    const hasMatch = flag.matchers.some(matcher => 
      normalized.some(s => s.includes(matcher))
    );
    if (hasMatch) {
      return {
        isBlocked: true,
        blockReason: flag.userMessage,
        code: flag.code
      };
    }
  }

  return { isBlocked: false };
};

// --------------------------------------------------------------------------------
// MOTOR DE EVALUACIÓN (CLINICAL FIREWALL V2 PRO)
// --------------------------------------------------------------------------------

export const evaluateExercise = (
  exercise: ExerciseTaxonomy
): ClinicalEvaluationResult => {
  // Extraemos estado de la store clínica
  const { activePathologies, redFlags, wbltDeficit } = useClinicalStore.getState();

  // 1. Triage Médico Temprano
  const redFlagCheck = checkRedFlags(redFlags);
  if (redFlagCheck.isBlocked) {
    return {
      isBlocked: true,
      blockReason: redFlagCheck.blockReason,
      isSwapped: false
    };
  }

  // 2. Evaluaciones Biomecánicas Especiales (Dorsiflexión WBLT < 10 cm)
  const isSquat = (exercise.Nombre_Oficial || '').toLowerCase().includes('sentadilla') ||
                  (exercise.Alias_Buscador || '').toLowerCase().includes('squat');
                  
  if (wbltDeficit && isSquat && exercise.ID_Ejercicio !== 'SQUAT_003') {
    const gobletHeels = EXERCISES_DATABASE.find(e => e.ID_Ejercicio === 'SQUAT_003') || exercise;
    return {
      isBlocked: false,
      isSwapped: true,
      originalExerciseId: exercise.ID_Ejercicio,
      newExerciseId: gobletHeels.ID_Ejercicio,
      newExercise: gobletHeels,
      clinicalRationale: 'Déficit de dorsiflexión (WBLT < 10 cm): Sentadilla adaptada con talones elevados (>20 mm) para prevenir colapso en valgo y compensación lumbar ("butt wink").',
      recommendedTempo: '3-0-1-0',
      recommendedRir: 2,
      recommendedRpe: 8
    };
  }

  // 3. Matriz de Smart Swaps
  if (activePathologies.length === 0) {
    return { isBlocked: false, isSwapped: false };
  }

  const exerciseNameLower = (exercise.Nombre_Oficial || '').toLowerCase();
  const exerciseAliasLower = (exercise.Alias_Buscador || '').toLowerCase();

  for (const pathology of activePathologies) {
    for (const rule of SMART_SWAPS_DICTIONARY) {
      if (rule.triggerPathology.toUpperCase() === pathology.toUpperCase() || pathology.toUpperCase().includes(rule.triggerPathology.toUpperCase())) {
        
        const isMatch = rule.triggerKeywords.some(keyword => 
          exerciseNameLower.includes(keyword) || exerciseAliasLower.includes(keyword)
        );

        if (isMatch) {
          const replacement = EXERCISES_DATABASE.find(e => e.ID_Ejercicio === rule.replacementId);
          
          if (replacement && replacement.ID_Ejercicio !== exercise.ID_Ejercicio) {
            return {
              isBlocked: false,
              isSwapped: true,
              originalExerciseId: exercise.ID_Ejercicio,
              newExerciseId: replacement.ID_Ejercicio,
              newExercise: replacement,
              clinicalRationale: rule.rationale,
              recommendedTempo: rule.recommendedTempo,
              recommendedRir: rule.minRir,
              recommendedRpe: rule.maxRpe,
              pacingNote: rule.pacingNote
            };
          }
        }
      }
    }
  }

  return { isBlocked: false, isSwapped: false };
};

export const clinicalFirewall = {
  validate: (exercise: any, injuries: string[] = []): any => {
    // Si se pasan lesiones directamente desde onboarding, sincronizamos temporalmente
    const evalResult = evaluateExercise(exercise as any);
    
    if (evalResult.isBlocked) {
      return { ...exercise, isBlocked: true, blockReason: evalResult.blockReason };
    }
    
    if (evalResult.isSwapped && evalResult.newExercise) {
      return {
        ...evalResult.newExercise,
        name: evalResult.newExercise.Nombre_Oficial || exercise.name,
        isSwapped: true,
        originalExerciseName: exercise.Nombre_Oficial || exercise.name || 'Ejercicio Base',
        clinicalRationale: evalResult.clinicalRationale,
        tempo: evalResult.recommendedTempo || exercise.tempo,
        rpe: evalResult.recommendedRpe ? String(evalResult.recommendedRpe) : exercise.rpe,
        rir: evalResult.recommendedRir ? String(evalResult.recommendedRir) : exercise.rir
      };
    }
    
    return {
      ...exercise,
      isSwapped: false
    };
  }
};

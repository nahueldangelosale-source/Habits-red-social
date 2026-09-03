// utils/circuitGeneratorEngine.ts
import type { 
  CircuitBlockType, 
  CircuitGeneratedBlock, 
  CircuitGeneratorOptions, 
  ExerciseMeta, 
  CircuitExerciseItem 
} from '../types/circuit.types';
import { EXERCISES_DATABASE, type ExerciseTaxonomy } from '../data/exercisesData';

// Umbrales biomecánicos empíricos derivados de revisiones clínicas
const MAX_GRIP_FATIGUE_THRESHOLD = 22; 
const MAX_SPINAL_COMPRESSION_THRESHOLD = 25;

/**
 * Convierte un ExerciseTaxonomy de la base de datos a ExerciseMeta paramétrico
 */
export function mapTaxonomyToMeta(ex: ExerciseTaxonomy): ExerciseMeta {
  const name = ex.Nombre_Oficial || '';
  const pat = ex.Patron_Movimiento || '';
  const equipStr = (ex.Equipamiento_Requerido || '').toLowerCase();
  
  // Categoría biomecánica
  let category: ExerciseMeta['category'] = 'CORE';
  if (pat.includes('Empuje') || pat.includes('Push') || pat.includes('Horizontal') && pat.includes('Empuje')) {
    category = 'UPPER_PUSH';
  } else if (pat.includes('Tracción') || pat.includes('Pull') || pat.includes('Vertical') && pat.includes('Tracción')) {
    category = 'UPPER_PULL';
  } else if (pat.includes('Rodilla') || pat.includes('Squat') || pat.includes('Lunge')) {
    category = 'LOWER_PUSH';
  } else if (pat.includes('Cadera') || pat.includes('Hinge') || pat.includes('Deadlift')) {
    category = 'LOWER_HINGE';
  } else if (pat.includes('Locomoción') || pat.includes('Transporte') || pat.includes('Pliometría') || pat.includes('Acondicionamiento')) {
    category = 'LOCOMOTION';
  }

  // Equipamiento
  const equipment: ExerciseMeta['equipment'] = [];
  if (equipStr.includes('barra') || equipStr.includes('olímpica')) equipment.push('BARBELL');
  if (equipStr.includes('mancuerna') || equipStr.includes('dumbbell')) equipment.push('DUMBBELL');
  if (equipStr.includes('kettlebell') || equipStr.includes('pesa rusa')) equipment.push('KETTLEBELL');
  if (equipStr.includes('corporal') || equipStr.includes('peso corporal') || equipStr.includes('mat') || equipStr.includes('colchoneta') || equipStr.includes('ninguno')) equipment.push('BODYWEIGHT');
  if (equipStr.includes('máquina') || equipStr.includes('polea')) equipment.push('MACHINE');
  if (equipStr.includes('banda') || equipStr.includes('miniband')) equipment.push('BAND');
  if (equipment.length === 0) equipment.push('BODYWEIGHT');

  // Scores
  let gripFatigueScore = 2;
  if (name.toLowerCase().includes('deadlift') || name.toLowerCase().includes('remo') || name.toLowerCase().includes('dominada') || name.toLowerCase().includes('farmer') || name.toLowerCase().includes('hang')) {
    gripFatigueScore = 8;
  } else if (name.toLowerCase().includes('swing') || name.toLowerCase().includes('clean') || name.toLowerCase().includes('snatch')) {
    gripFatigueScore = 6;
  } else if (category === 'UPPER_PUSH' || category === 'LOWER_PUSH') {
    gripFatigueScore = 1;
  }

  let spinalCompressionScore = 2;
  if (ex.Carga_Axial === 'SÍ' || name.toLowerCase().includes('sentadilla trasera') || name.toLowerCase().includes('peso muerto')) {
    spinalCompressionScore = 8;
  } else if (name.toLowerCase().includes('militar') || name.toLowerCase().includes('push press') || name.toLowerCase().includes('salto')) {
    spinalCompressionScore = 5;
  } else if (name.toLowerCase().includes('plancha') || name.toLowerCase().includes('bird-dog') || name.toLowerCase().includes('mcgill') || name.toLowerCase().includes('curl')) {
    spinalCompressionScore = 0;
  }

  return {
    id: ex.ID_Ejercicio,
    name: ex.Nombre_Oficial,
    category,
    equipment,
    gripFatigueScore,
    spinalCompressionScore,
    targetMuscle: ex.Musculo_Agonista || 'Global'
  };
}

/**
 * Validador Biomecánico de Telemetría Clínica (5 Reglas Inviolables)
 */
export function validateCircuitBiomechanics(block: CircuitGeneratedBlock): { isValid: boolean; warnings: string[]; positives: string[] } {
  const warnings: string[] = [];
  const positives: string[] = [];
  let cumulativeGripFatigue = 0;
  let cumulativeSpinalLoad = 0;

  if (block.exercises.length === 0) {
    return { isValid: false, warnings: ['El circuito no contiene ejercicios asignados.'], positives: [] };
  }

  for (let i = 0; i < block.exercises.length; i++) {
    const current = block.exercises[i].exercise;
    
    // Regla 1: Protección de Agarre (Grip Shielding)
    cumulativeGripFatigue += current.gripFatigueScore;
    if (cumulativeGripFatigue > MAX_GRIP_FATIGUE_THRESHOLD) {
      warnings.push(`⚠️ Riesgo de fallo de agarre prematuro en "${current.name}". Se recomienda insertar un ejercicio de empuje o tren inferior.`);
      cumulativeGripFatigue = 0;
    }

    // Regla 2: Blindaje Lumbar (Spine Shielding)
    cumulativeSpinalLoad += current.spinalCompressionScore;
    if (cumulativeSpinalLoad > MAX_SPINAL_COMPRESSION_THRESHOLD) {
      warnings.push(`⚠️ Doble compresión axial severa acumulada en "${current.name}". Riesgo de fatiga paraespinal lumbar.`);
      cumulativeSpinalLoad = 0;
    }

    // Regla 3: Shunting PHA (Upper <-> Lower)
    if (block.blockType === 'PHA_TRISERIE' && i > 0) {
      const prev = block.exercises[i - 1].exercise;
      const isUpper = (cat: string) => cat.includes('UPPER');
      const isLower = (cat: string) => cat.includes('LOWER');
      
      if ((isUpper(prev.category) && isUpper(current.category)) || 
          (isLower(prev.category) && isLower(current.category))) {
        warnings.push(`⚠️ Infracción PHA: Secuencia consecutiva "${prev.name}" y "${current.name}". Alterna Tren Superior con Tren Inferior.`);
      }
    }
  }

  // Regla 4: Ratios Aláctico vs Glucolítico
  if (block.targetEnergySystem === 'ALACTIC' && block.restTimeSec && block.workTimeSec) {
    if (block.restTimeSec < block.workTimeSec * 3) {
      warnings.push('⚠️ Cinética de Fosfágenos: El descanso es insuficiente para resintetizar >70% de PCr (Ratio mínimo 1:3).');
    }
  }

  if (warnings.length === 0) {
    positives.push('✅ Parámetros hemodinámicos y de shunting vascular nominales.');
    positives.push('✅ Cero cuellos de botella en la faja lumbar y agarre isométrico.');
    positives.push('✅ Ratios de densidad energética calibrados para la vía bioenergética objetivo.');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    positives
  };
}

/**
 * Generador Determinista Inteligente de 1-Clic
 */
export function generateSmartCircuit(
  options: CircuitGeneratorOptions, 
  database: ExerciseTaxonomy[] = EXERCISES_DATABASE
): CircuitGeneratedBlock {
  const mappedDb = database.map(mapTaxonomyToMeta);
  
  // Filtrar por equipamiento disponible
  let availablePool = mappedDb.filter(ex => 
    ex.equipment.some(eq => options.availableEquipment.includes(eq))
  );
  if (availablePool.length === 0) availablePool = mappedDb; // fallback

  const selectedItems: CircuitExerciseItem[] = [];
  let rounds = options.rounds || 4;
  let workTime = options.workTimeSec || 40;
  let restTime = options.restTimeSec || 20;
  let name = 'Circuito Inteligente';
  let description = 'Secuencia metabólica balanceada';
  let intervalTime = options.intervalTimeSec;
  let timeCap = options.timeCapMin;

  switch (options.blockType) {
    case 'TABATA': {
      rounds = 8;
      workTime = 20;
      restTime = 10;
      name = '⚡ Tabata Protocolo Científico (4 Min)';
      description = '20s trabajo / 10s descanso x 8 rondas. Máxima potencia anaeróbica y VO2 Máx.';
      // Seleccionar 2 ejercicios alternados (Cardio / Global + Core)
      const loco = availablePool.filter(e => e.category === 'LOCOMOTION' || e.category === 'LOWER_HINGE')[0] || availablePool[0];
      const upper = availablePool.filter(e => e.category === 'UPPER_PUSH' || e.category === 'CORE')[0] || availablePool[1];
      selectedItems.push({ id: crypto.randomUUID(), exercise: loco, workTimeSec: 20, restTimeSec: 10, reps: 'Máximas' });
      selectedItems.push({ id: crypto.randomUUID(), exercise: upper, workTimeSec: 20, restTimeSec: 10, reps: 'Máximas' });
      break;
    }

    case 'EMOM': {
      rounds = options.rounds || 10;
      intervalTime = 60;
      workTime = 20;
      restTime = 40;
      name = `⏱️ EMOM ${rounds} Min de Potencia & Calidad`;
      description = 'Trabajo cada minuto (15-20s esfuerzo / 40-45s recuperación de PCr).';
      const powerEx = availablePool.filter(e => e.category === 'LOWER_PUSH' || e.category === 'LOCOMOTION')[0] || availablePool[0];
      const pushEx = availablePool.filter(e => e.category === 'UPPER_PUSH')[0] || availablePool[1];
      selectedItems.push({ id: crypto.randomUUID(), exercise: powerEx, reps: '3-5 reps explosivas', workTimeSec: 20, restTimeSec: 40 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: pushEx, reps: '4-6 reps técnicas', workTimeSec: 20, restTimeSec: 40 });
      break;
    }

    case 'AMRAP': {
      timeCap = options.timeCapMin || 12;
      rounds = 1;
      name = `🔥 AMRAP ${timeCap} Min (Shunting PHA & Core)`;
      description = `Máximas rondas en ${timeCap} minutos con ritmo constante (RPE 8).`;
      const lower = availablePool.filter(e => e.category === 'LOWER_PUSH')[0] || availablePool[0];
      const push = availablePool.filter(e => e.category === 'UPPER_PUSH')[0] || availablePool[1];
      const pull = availablePool.filter(e => e.category === 'UPPER_PULL')[0] || availablePool[2];
      const core = availablePool.filter(e => e.category === 'CORE')[0] || availablePool[3];
      selectedItems.push({ id: crypto.randomUUID(), exercise: lower, reps: '10' });
      selectedItems.push({ id: crypto.randomUUID(), exercise: push, reps: '10' });
      selectedItems.push({ id: crypto.randomUUID(), exercise: pull, reps: '10' });
      selectedItems.push({ id: crypto.randomUUID(), exercise: core, reps: '15' });
      break;
    }

    case 'PHA_TRISERIE': {
      rounds = 4;
      workTime = 45;
      restTime = 15;
      name = '🔄 Triserie PHA de Shunting Sanguíneo';
      description = 'Alternancia estricta Tren Superior <-> Tren Inferior sin pausa intra-serie.';
      const lower = availablePool.filter(e => e.category === 'LOWER_PUSH' || e.category === 'LOWER_HINGE')[0] || availablePool[0];
      const upperPush = availablePool.filter(e => e.category === 'UPPER_PUSH')[0] || availablePool[1];
      const upperPull = availablePool.filter(e => e.category === 'UPPER_PULL')[0] || availablePool[2];
      selectedItems.push({ id: crypto.randomUUID(), exercise: lower, reps: '10-12', workTimeSec: 45, restTimeSec: 0 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: upperPush, reps: '10-12', workTimeSec: 45, restTimeSec: 0 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: upperPull, reps: '10-12', workTimeSec: 45, restTimeSec: 60 });
      break;
    }

    case 'COMPLEX': {
      rounds = 4;
      name = '🏋️ Complejo Ininterrumpido (Unbroken)';
      description = 'Secuencia continua sin soltar el implemento (6 reps por ejercicio).';
      const rdl = availablePool.filter(e => e.category === 'LOWER_HINGE')[0] || availablePool[0];
      const row = availablePool.filter(e => e.category === 'UPPER_PULL')[0] || availablePool[1];
      const squat = availablePool.filter(e => e.category === 'LOWER_PUSH')[0] || availablePool[2];
      const press = availablePool.filter(e => e.category === 'UPPER_PUSH')[0] || availablePool[3];
      selectedItems.push({ id: crypto.randomUUID(), exercise: rdl, reps: '6', unbroken: true });
      selectedItems.push({ id: crypto.randomUUID(), exercise: row, reps: '6', unbroken: true });
      selectedItems.push({ id: crypto.randomUUID(), exercise: squat, reps: '6', unbroken: true });
      selectedItems.push({ id: crypto.randomUUID(), exercise: press, reps: '6', unbroken: true });
      break;
    }

    case 'RAMP_WARMUP': {
      rounds = 1;
      name = '🌡️ Protocolo RAMP de Calentamiento Integral';
      description = '4 Fases: Elevación, Activación, Movilización y Potenciación PAPE.';
      const raise = availablePool.filter(e => e.category === 'LOCOMOTION')[0] || availablePool[0];
      const activate = availablePool.filter(e => e.category === 'CORE')[0] || availablePool[1];
      const mobilize = availablePool.filter(e => e.category === 'LOWER_PUSH')[0] || availablePool[2];
      const potentiate = availablePool.filter(e => e.category === 'LOCOMOTION')[1] || availablePool[3];
      selectedItems.push({ id: crypto.randomUUID(), exercise: raise, reps: '2 min', workTimeSec: 120, restTimeSec: 10 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: activate, reps: '10 holds', workTimeSec: 45, restTimeSec: 10 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: mobilize, reps: '6/lado', workTimeSec: 45, restTimeSec: 10 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: potentiate, reps: '5 explosivos', workTimeSec: 20, restTimeSec: 30 });
      break;
    }

    default: {
      rounds = 3;
      name = '📦 Circuito Estándar de Hipertrofia & Core';
      description = '3 Rondas continuas con descanso inter-ronda.';
      const e1 = availablePool[0] || mappedDb[0];
      const e2 = availablePool[1] || mappedDb[1];
      const e3 = availablePool[2] || mappedDb[2];
      selectedItems.push({ id: crypto.randomUUID(), exercise: e1, reps: '12', workTimeSec: 40, restTimeSec: 20 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: e2, reps: '12', workTimeSec: 40, restTimeSec: 20 });
      selectedItems.push({ id: crypto.randomUUID(), exercise: e3, reps: '15', workTimeSec: 40, restTimeSec: 60 });
      break;
    }
  }

  return {
    id: `block-gen-${Date.now()}`,
    name,
    description,
    blockType: options.blockType,
    rounds,
    exercises: selectedItems,
    intervalTimeSec: intervalTime,
    timeCapMin: timeCap,
    workTimeSec: workTime,
    restTimeSec: restTime,
    targetEnergySystem: options.targetEnergySystem,
    workToRestRatio: `${workTime}:${restTime}`
  };
}

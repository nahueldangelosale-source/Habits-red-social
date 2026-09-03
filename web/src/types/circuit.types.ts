// types/circuit.types.ts

export type CircuitBlockType = 
  | 'TABATA' 
  | 'EMOM' 
  | 'AMRAP' 
  | 'PHA_TRISERIE' 
  | 'COMPLEX' 
  | 'RAMP_WARMUP' 
  | 'STANDARD';

export type EnergySystem = 'ALACTIC' | 'GLYCOLYTIC' | 'OXIDATIVE';

export type Equipment = 'BARBELL' | 'DUMBBELL' | 'KETTLEBELL' | 'BODYWEIGHT' | 'MACHINE' | 'CABLE' | 'BAND';

export type BiomechanicalCategory = 
  | 'UPPER_PUSH' 
  | 'UPPER_PULL' 
  | 'LOWER_PUSH' 
  | 'LOWER_HINGE' 
  | 'CORE' 
  | 'LOCOMOTION';

export interface ExerciseMeta {
  id: string;
  name: string;
  category: BiomechanicalCategory;
  equipment: Equipment[];
  gripFatigueScore: number;       // 0-10 escala de fatiga de agarre
  spinalCompressionScore: number; // 0-10 escala de carga axial
  targetMuscle: string;
}

export interface CircuitExerciseItem {
  id: string;
  exercise: ExerciseMeta;
  reps?: string;
  workTimeSec?: number;
  restTimeSec?: number;
  unbroken?: boolean;
}

export interface CircuitGeneratedBlock {
  id: string;
  name: string;
  description: string;
  blockType: CircuitBlockType;
  rounds: number;
  exercises: CircuitExerciseItem[];
  intervalTimeSec?: number;
  timeCapMin?: number;
  workTimeSec?: number;
  restTimeSec?: number;
  targetEnergySystem: EnergySystem;
  workToRestRatio?: string;
}

export interface CircuitGeneratorOptions {
  blockType: CircuitBlockType;
  availableEquipment: Equipment[];
  targetEnergySystem: EnergySystem;
  focusMuscles: BiomechanicalCategory[];
  intensityLevel: number; // 1-10
  timeCapMin?: number;
  intervalTimeSec?: number;
  workTimeSec?: number;
  restTimeSec?: number;
  rounds?: number;
}

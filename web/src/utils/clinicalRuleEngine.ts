import type { AthleteTrait } from '../schemas/traitsSchema';

export interface ResolvedConstraints {
  maxRpe: number;
  forbiddenExercises: string[]; // IDs or Tags like 'LEG_004'
  requiredVolumeRatio: string;
  focusMode: boolean; // Zen Mode
  exerciseDurationLimitMs: number;
  clinicalMessage?: string; // Educative copy
}

export function resolveAthleteConstraints(activeTraits: Record<string, AthleteTrait>): ResolvedConstraints {
  const constraints: ResolvedConstraints = {
    maxRpe: 10,
    forbiddenExercises: [],
    requiredVolumeRatio: '1:1',
    focusMode: false,
    exerciseDurationLimitMs: 90 * 60 * 1000, // 90 min default
  };

  // Convert to array and sort by weight descending (Highest priority first)
  const sortedTraits = Object.values(activeTraits)
    .filter(t => !t.isStale) // Ignore stale traits for hard restrictions, or we could handle them differently
    .sort((a, b) => b.weight - a.weight);

  // Apply rules in order of weight
  for (const trait of sortedTraits) {
    switch (trait.traitId) {
      // LEVEL 0
      case 'CLINICAL_LUMBAR_FLEX':
        if (!constraints.forbiddenExercises.includes('DEADLIFT')) {
          constraints.forbiddenExercises.push('DEADLIFT', 'CRUNCHES');
          if (!constraints.clinicalMessage) constraints.clinicalMessage = "Fase 1: Acondicionamiento Neural y Blindaje Lumbar.";
        }
        break;
      case 'CLINICAL_PELVIC_FLOOR':
        if (!constraints.forbiddenExercises.includes('VALSALVA')) {
          constraints.forbiddenExercises.push('VALSALVA', 'PLYOMETRICS');
          if (!constraints.clinicalMessage) constraints.clinicalMessage = "Protocolo de Protección Pélvica Activado.";
        }
        break;

      // LEVEL 1
      case 'SYS_HPA_BURNOUT':
        if (constraints.maxRpe > 7) {
          constraints.maxRpe = 7;
          constraints.exerciseDurationLimitMs = Math.min(constraints.exerciseDurationLimitMs, 45 * 60 * 1000);
          if (!constraints.clinicalMessage) constraints.clinicalMessage = "Ajustado para restaurar tu sistema nervioso central sin comprometer el crecimiento.";
        }
        break;
      case 'SYS_COGNITIVE_OVERLOAD':
        constraints.focusMode = true;
        if (!constraints.clinicalMessage) constraints.clinicalMessage = "Modo Foco: Entrenamientos directos y sin fricción.";
        break;
      case 'SYS_WEEKEND_WARRIOR':
        constraints.exerciseDurationLimitMs = Math.min(constraints.exerciseDurationLimitMs, 30 * 60 * 1000); // Shorter sessions
        if (!constraints.clinicalMessage) constraints.clinicalMessage = "Exercise Snacks: Acondicionamiento exprés para proteger tus articulaciones.";
        break;

      // LEVEL 2
      case 'PREF_HYPERTROPHY':
        // Only applies if no higher rule overrode it.
        if (constraints.maxRpe >= 8) {
          // If we reached here, no burnout is present
          // We can set default hypertrophy behaviors
        }
        break;
      case 'PREF_MRV_MAX':
        if (constraints.maxRpe >= 9) {
          constraints.maxRpe = 10;
        }
        break;
    }
  }

  return constraints;
}

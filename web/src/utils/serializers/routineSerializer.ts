import type { WorkoutDay, NutritionPlan, RoutineExercise, RoutineBlock } from '../../stores/usePlanBuilderStore';

export interface SerializedExercise {
  type: 'EXERCISE';
  exercise_id: string;
  sets: string;
  reps: string;
  weight: string;
  rpe: string;
  progression: string;
  is_swapped?: boolean;
  clinical_rationale?: string;
  original_exercise_id?: string;
}

export interface SerializedBlock {
  type: 'BLOCK';
  block_id: string; // Referencia al ID del bloque (ej. "mcgill_big_3")
  name: string;
  items: SerializedExercise[];
}

export type SerializedItem = SerializedExercise | SerializedBlock;

export interface SerializedDay {
  id: string;
  name: string;
  items: SerializedItem[];
}

export interface SerializedRoutinePayload {
  client_id: string;
  type: 'ROUTINE';
  name: string;
  source_template_id: string | null;
  entity_type: 'CLIENT_INSTANCE';
  content: {
    mesocycle_taxonomy: string;
    days: SerializedDay[];
    nutrition: NutritionPlan;
    telemetry: any;
    dates: { startDate: Date | null; endDate: Date | null };
  };
}

export interface SerializedTemplatePayload {
  type: 'TEMPLATE';
  name: string;
  taxonomy_id: string | null;
  version: number;
  tags: string[];
  content: {
    phases: {
      id: string;
      name: string;
      release_date: string | null;
      notes: string;
      days: SerializedDay[];
    }[];
    nutrition: NutritionPlan;
  };
}

/**
 * Función pura de Data Stripping (Serialización).
 * Convierte el estado rico de la UI (que contiene catálogos masivos)
 * en un modelo de dominio ligero, extrayendo únicamente referencias (IDs) y overrides manuales.
 */
export const serializeRoutineForAPI = (
  clientId: string,
  cycleName: string,
  cycleTaxonomyId: string | null,
  days: WorkoutDay[],
  nutrition: NutritionPlan,
  workloadMetrics: any,
  dates: { startDate: Date | null; endDate: Date | null },
  sourceTemplateId: string | null = null
): SerializedRoutinePayload => {
  
  const serializeExercise = (item: RoutineExercise): SerializedExercise => ({
    type: 'EXERCISE',
    exercise_id: item.exercise.ID_Ejercicio, // Solo la referencia
    sets: item.sets,
    reps: item.reps,
    weight: item.weight,
    rpe: item.rpe,
    progression: item.progression,
    is_swapped: item.isSwapped,
    clinical_rationale: item.clinicalRationale,
    original_exercise_id: item.originalExerciseId,
  });

  const serializedDays: SerializedDay[] = days.map((day) => {
    const items: SerializedItem[] = day.items.map((item) => {
      if (item.type === 'BLOCK') {
        const block = item as RoutineBlock;
        return {
          type: 'BLOCK',
          block_id: block.id,
          name: block.name,
          items: block.items.map(serializeExercise),
        };
      } else {
        return serializeExercise(item as RoutineExercise);
      }
    });

    return {
      id: day.id,
      name: day.name,
      items,
    };
  });

  return {
    client_id: clientId,
    type: 'ROUTINE',
    name: cycleName || 'Rutina sin nombre',
    source_template_id: sourceTemplateId,
    entity_type: 'CLIENT_INSTANCE',
    content: {
      mesocycle_taxonomy: cycleTaxonomyId || '',
      days: serializedDays,
      nutrition,
      telemetry: workloadMetrics,
      dates,
    },
  };
};

/**
 * Serializa un Template para guardarlo en la Biblioteca del Entrenador.
 * No requiere client_id — es IP pura del entrenador.
 */
export const serializeTemplateForAPI = (
  templateName: string,
  taxonomyId: string | null,
  version: number,
  tags: string[],
  phases: { id: string; name: string; releaseDate: string | null; notes: string; days: WorkoutDay[] }[],
  nutrition: NutritionPlan
): SerializedTemplatePayload => {
  const serializeExercise = (item: RoutineExercise): SerializedExercise => ({
    type: 'EXERCISE',
    exercise_id: item.exercise.ID_Ejercicio,
    sets: item.sets,
    reps: item.reps,
    weight: item.weight,
    rpe: item.rpe,
    progression: item.progression,
    is_swapped: item.isSwapped,
    clinical_rationale: item.clinicalRationale,
    original_exercise_id: item.originalExerciseId,
  });

  const serializedPhases = phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    release_date: phase.releaseDate,
    notes: phase.notes,
    days: phase.days.map((day) => {
      const items: SerializedItem[] = day.items.map((item) => {
        if (item.type === 'BLOCK') {
          const block = item as RoutineBlock;
          return {
            type: 'BLOCK',
            block_id: block.id,
            name: block.name,
            items: block.items.map(serializeExercise),
          };
        } else {
          return serializeExercise(item as RoutineExercise);
        }
      });

      return {
        id: day.id,
        name: day.name,
        items,
      };
    }),
  }));

  return {
    type: 'TEMPLATE',
    name: templateName || 'Template sin nombre',
    taxonomy_id: taxonomyId,
    version,
    tags,
    content: {
      phases: serializedPhases,
      nutrition,
    },
  };
};

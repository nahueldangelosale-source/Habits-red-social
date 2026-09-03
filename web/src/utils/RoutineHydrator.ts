import { EXERCISES_DATABASE, type ExerciseTaxonomy } from '../data/exercisesData';
import type { SerializedDay, SerializedExercise, SerializedBlock } from './serializers/routineSerializer';

// 1. Guardarraíl de Rendimiento: Convertir catálogo a Hash Map O(1)
export const EXERCISE_DICTIONARY: Record<string, ExerciseTaxonomy> = EXERCISES_DATABASE.reduce((acc, ex) => {
  acc[ex.ID_Ejercicio] = ex;
  return acc;
}, {} as Record<string, ExerciseTaxonomy>);

export interface HydratedExercise extends SerializedExercise {
  name: string;
  muscle_group: string;
  isFallback?: boolean;
}

export interface HydratedBlock {
  type: 'BLOCK';
  block_id: string;
  name: string;
  items: HydratedExercise[];
}

export type HydratedItem = HydratedExercise | HydratedBlock;

export interface HydratedDay {
  id: string;
  name: string;
  items: HydratedItem[];
}

/**
 * Capa de Hidratación (Edge Hydration)
 * Toma el JSONB optimizado y lo cruza con el catálogo en memoria (O(1)).
 * Implementa Graceful Degradation para mantener la app viva si hay asimetría de datos.
 */
export const hydrateRoutine = (serializedDays: SerializedDay[]): HydratedDay[] => {
  if (!serializedDays || !Array.isArray(serializedDays)) return [];

  const hydrateExercise = (item: SerializedExercise): HydratedExercise => {
    const catalogData = EXERCISE_DICTIONARY[item.exercise_id];
    
    if (catalogData) {
      return {
        ...item,
        name: catalogData.Nombre_Oficial,
        muscle_group: catalogData.Musculo_Agonista,
      };
    }

    // Guardarraíl Clínico: Graceful Degradation (Fallback)
    return {
      ...item,
      name: `Ejercicio Descatalogado (${item.exercise_id})`,
      muscle_group: 'N/A',
      isFallback: true,
    };
  };

  return serializedDays.map(day => {
    return {
      ...day,
      items: day.items.map(item => {
        if (item.type === 'BLOCK') {
          const block = item as SerializedBlock;
          return {
            type: 'BLOCK',
            block_id: block.block_id,
            name: block.name,
            items: block.items.map(hydrateExercise)
          };
        } else {
          return hydrateExercise(item as SerializedExercise);
        }
      })
    };
  });
};

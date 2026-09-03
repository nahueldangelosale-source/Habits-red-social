import type { WorkoutDay, RoutineExercise, RoutineItem } from '../stores/usePlanBuilderStore';
import { applyPresetProgression, type DayNode, type ExerciseNode, type ProgressionPreset, type ProgressionSettings } from './progressionEngine';

export function adaptWorkoutDaysToDayNodes(days: WorkoutDay[]): DayNode[] {
    return days.map(day => {
        const exercises: ExerciseNode[] = [];
        
        // Flatten items for the legacy engine (it only understands exercises, not blocks)
        const processItem = (item: RoutineItem) => {
            if (item.type === 'BLOCK' && item.items) {
                item.items.forEach(processItem);
            } else if (item.type === 'EXERCISE') {
                const ex = item as RoutineExercise;
                exercises.push({
                    id: ex.id,
                    name: ex.exercise.Nombre_Oficial,
                    officialName: ex.exercise.Nombre_Oficial,
                    movementPattern: ex.exercise.Patron_Movimiento,
                    description: `${ex.sets} sets x ${ex.reps} reps @ RPE ${ex.rpe || 'Auto'}`,
                    _originalItem: ex // store original item reference to reconstruct later
                });
            }
        };
        day.items.forEach(processItem);

        return { name: day.name, exercises, isDeload: false };
    });
}

export function adaptDayNodesToWorkoutDays(dayNodes: DayNode[]): WorkoutDay[] {
    return dayNodes.map(node => {
        const items: RoutineItem[] = node.exercises.map(ex => {
            const originalEx = ex._originalItem as RoutineExercise;
            
            // Extract the new sets and RPE from the modified description
            const setsMatch = ex.description.match(/(\d+)\s*sets/i);
            const rpeMatch = ex.description.match(/@ RPE (\d+(\.\d+)?)/i);
            
            return {
                ...originalEx,
                id: crypto.randomUUID(), // always new UUID to prevent collisions
                sets: setsMatch ? setsMatch[1] : originalEx.sets,
                rpe: rpeMatch ? rpeMatch[1] : originalEx.rpe,
                notes: node.isDeload ? 'Semana de Deload (Descarga activa)' : originalEx.notes
            };
        });

        return {
            id: crypto.randomUUID(),
            name: node.name,
            items,
            isCollapsed: false,
            primaryModality: node.isDeload ? 'DELOAD' : undefined
        };
    });
}

/**
 * Pipeline principal para generar el mesociclo
 */
export function createMesocycleFromWeek1(week1Days: WorkoutDay[], totalWeeks: number, preset: ProgressionPreset, settings?: ProgressionSettings): WorkoutDay[] {
    const dayNodes = adaptWorkoutDaysToDayNodes(week1Days);
    const progressionNodes = applyPresetProgression(dayNodes, totalWeeks, preset, settings);
    return adaptDayNodesToWorkoutDays(progressionNodes);
}

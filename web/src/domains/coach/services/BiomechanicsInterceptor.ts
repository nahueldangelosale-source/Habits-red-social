import { z } from 'zod';
import type { IMacrocycle } from '../../../entities/workout/schemas';

export const BiomechanicalInjectionInputSchema = z.object({
    athleteId: z.string(),
    medicalTags: z.array(z.string()).optional(),
    targetPattern: z.enum(['RODILLA', 'CADERA', 'EMPUJE_V', 'EMPUJE_H', 'TRACCION_V', 'CORE']),
});

export type BiomechanicalInjectionInput = z.infer<typeof BiomechanicalInjectionInputSchema>;

export const ExerciseProposalSchema = z.object({
    name: z.string(),
    pattern: z.string(),
    isAdapted: z.boolean(),
    reason: z.string().optional()
});

export type ExerciseProposal = z.infer<typeof ExerciseProposalSchema>;

export class BiomechanicsInterceptor {
    /**
     * Evaluates a smart slot injection and forces biomechanical guardrails based on clinical tags.
     */
    static evaluateSlot(input: BiomechanicalInjectionInput): ExerciseProposal {
        const data = BiomechanicalInjectionInputSchema.parse(input);
        const hasKneeInjury = data.medicalTags?.includes('inj_knees') || 
                              data.medicalTags?.includes('rodilla') || 
                              data.medicalTags?.includes('KNEE_INJURY');

        let exerciseData: ExerciseProposal = {
            name: "Ejercicio Estándar",
            pattern: data.targetPattern,
            isAdapted: false
        };

        if (data.targetPattern === 'RODILLA') {
            if (hasKneeInjury) {
                exerciseData = {
                    name: "Sentadilla en Caja (Bajo Impacto)",
                    pattern: "KNEE_DOM_BILATERAL",
                    isAdapted: true,
                    reason: "Adaptación por perfil clínico: Lesión de rodilla documentada"
                };
            } else {
                exerciseData = {
                    name: "Sentadilla Trasera con Barra",
                    pattern: "RODILLA",
                    isAdapted: false
                };
            }
        } else if (data.targetPattern === 'CADERA') {
            exerciseData = {
                name: "Peso Muerto Rumano",
                pattern: "CADERA",
                isAdapted: false
            };
        } else if (data.targetPattern === 'EMPUJE_V') {
            exerciseData = {
                name: "Press Militar",
                pattern: "EMPUJE_V",
                isAdapted: false
            };
        } else if (data.targetPattern === 'EMPUJE_H') {
            exerciseData = {
                name: "Press de Banca",
                pattern: "EMPUJE_H",
                isAdapted: false
            };
        } else if (data.targetPattern === 'TRACCION_V') {
            exerciseData = {
                name: "Dominadas",
                pattern: "TRACCION_V",
                isAdapted: false
            };
        }

        return exerciseData;
    }

    /**
     * FITNESS FUNCTION: Hard Constraint validation for Junk Volume.
     * Rejects any macrocycle where sum(sets) for the same muscle group at RPE > 8 exceeds 10 per session.
     */
    static validateJunkVolume(macrocycle: IMacrocycle): { isValid: boolean; warnings: string[] } {
        const warnings: string[] = [];
        
        // Safety check if structure is not yet fully formed
        if (!macrocycle.structure || typeof macrocycle.structure !== 'object') {
             return { isValid: true, warnings };
        }

        // Iterate through weeks -> days -> blocks -> exercises
        for (const [weekKey, weekData] of Object.entries(macrocycle.structure)) {
             if (!weekData || typeof weekData !== 'object' || !('days' in weekData)) continue;

             for (const [dayKey, dayData] of Object.entries((weekData as Record<string, any>).days)) {
                  // Track volume per muscle group per session
                  const sessionVolumeByMuscle: Record<string, number> = {};

                  const dayRecord = dayData as Record<string, any>;
                  for (const block of (dayRecord.blocks || [])) {
                       for (const exercise of (block.exercises || [])) {
                            // Extract primary muscle from biomechanical_tags (mock approach for constraints)
                            // A robust approach would use a catalog mapping
                            const muscleTags = exercise.biomechanical_tags?.filter((t: string) => !t.includes('_dominant') && !t.includes('anti_')) || [];
                            const primaryMuscle = muscleTags.length > 0 ? muscleTags[0] : 'unknown';
                            
                            // Check RPE (simulated by checking if execution implies high intensity, or if 'rpe' property exists)
                            // We assume standard AI generation maps `rpe` inside the schema if passed, else default to 9 if sets <= 3
                            const effectiveRpe = exercise.rpe || (exercise.sets && exercise.sets <= 3 ? 9 : 7);

                            if (effectiveRpe > 8) {
                                sessionVolumeByMuscle[primaryMuscle] = (sessionVolumeByMuscle[primaryMuscle] || 0) + (exercise.sets || 0);
                            }
                       }
                  }

                  // Evaluate Hard Constraints for this session
                  for (const [muscle, sets] of Object.entries(sessionVolumeByMuscle)) {
                      if (sets > 10 && muscle !== 'unknown') {
                          warnings.push(`Semana ${weekKey} - ${dayKey}: El volumen basura (Junk Volume) para [${muscle}] excede el límite clínico seguro de 10 sets a RPE > 8. Se programaron ${sets} sets.`);
                      }
                  }
             }
        }

        return {
            isValid: warnings.length === 0,
            warnings
        };
    }
}

/**
 * Fitness API Service
 * Endpoints for Personal Trainer features (Hexfit Killer)
 */

import { api } from './client';
import type {
    ExerciseList,
    Exercise,
    SetRepCalculation,
    ReplacementRequest,
    ReplacementResponse,
} from './types';

const PREFIX = '/api/v1/fitness';

export const fitnessApi = {
    /**
     * List exercises with optional filters
     */
    getExercises: (params?: { muscle_group?: string; equipment?: string }) => {
        const queryParams: Record<string, string> = {};
        if (params?.muscle_group) queryParams.muscle_group = params.muscle_group;
        if (params?.equipment) queryParams.equipment = params.equipment;
        return api.get<ExerciseList>(`${PREFIX}/exercises`, queryParams);
    },

    /**
     * Get single exercise by ID
     */
    getExercise: (exerciseId: string) =>
        api.get<Exercise>(`${PREFIX}/exercises/${exerciseId}`),

    /**
     * Find replacement exercise for constraints
     */
    findReplacement: (request: ReplacementRequest) =>
        api.post<ReplacementResponse>(`${PREFIX}/replacement`, request),

    /**
     * Calculate sets/reps based on 1RM and training goal
     */
    calculateSetsReps: (oneRepMax: number, goal: 'strength' | 'hypertrophy' | 'endurance' = 'hypertrophy') =>
        api.get<SetRepCalculation>(`${PREFIX}/calculate-sets-reps`, {
            one_rep_max: String(oneRepMax),
            goal,
        }),

    /**
     * Demo: Knee pain replacement
     */
    demoKneePain: () =>
        api.get<ReplacementResponse>(`${PREFIX}/demo/knee-pain`),

    /**
     * Demo: No barbell replacement
     */
    demoNoBarbell: () =>
        api.get<ReplacementResponse>(`${PREFIX}/demo/no-barbell`),
};

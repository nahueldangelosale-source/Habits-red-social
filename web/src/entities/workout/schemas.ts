import { z } from 'zod';

export const AiExerciseTargetSchema = z.object({
    id: z.string(),
    order: z.number(),
    sets: z.number().nullable().optional(),
    reps: z.string().nullable().optional(),
    weight: z.number().nullable().optional(),
    rest_seconds: z.number().nullable().optional(),
    exercise: z.object({
        id: z.string(),
        name: z.string(),
        name_es: z.string().nullable().optional()
    }).nullable().optional(),
    isAiSwapped: z.boolean().optional(),
    clinicalContext: z.string().nullable().optional()
});

export const AiSwapResponseSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SUCCESS']),
    result: z.object({
        exercises: z.array(AiExerciseTargetSchema).optional(),
        error: z.string().optional(),
        rationale: z.string().optional(),
        proposalId: z.string().optional(),
        metadata: z.object({
            model: z.string().optional(),
            input_tokens: z.number().optional(),
            output_tokens: z.number().optional()
        }).optional()
    }).nullable().optional()
});

export const AiProposalSchema = z.object({
    proposalId: z.string(),
    suggestedExercise: AiExerciseTargetSchema,
    rationale: z.string(),
    status: z.enum(['pending', 'approved', 'rejected'])
});

export type IAiProposal = z.infer<typeof AiProposalSchema>;

export type IAiSwapResponse = z.infer<typeof AiSwapResponseSchema>;
export type IAiExerciseTarget = z.infer<typeof AiExerciseTargetSchema>;

// THE EXERCISE VAULT SCHEMAS
export const ExerciseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    video_url: z.string().url().nullable().optional(),
    description: z.string().nullable().optional(),
    execution_cues: z.array(z.string()).default([]),
    biomechanical_tags: z.array(z.string()).default([])
});

export type IExercise = z.infer<typeof ExerciseSchema>;

export const MacrocycleSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    target_tags: z.array(z.string()).default([]),
    structure: z.record(z.string(), z.any()), // Can be refined to week/day structures later
    status: z.enum(['PENDING_APPROVAL', 'ACTIVE', 'ARCHIVED']),
    created_at: z.string().datetime().optional()
});

export type IMacrocycle = z.infer<typeof MacrocycleSchema>;

// HARD CONSTRAINTS: INTENSITY TECHNIQUES
export const DropsetSchema = z.object({
    type: z.literal('DROPSET'),
    drops: z.number().min(1).max(3),
    percent_reduction: z.number().min(10).max(30),
    rest_time_seconds: z.number().max(15, "Dropsets admiten máximo 15s de descanso intra-serie")
});

export const RestPauseSchema = z.object({
    type: z.literal('REST_PAUSE'),
    mini_sets: z.number().min(1).max(5),
    rest_time_seconds: z.number().min(10).max(20, "Rest-Pause admite entre 10s y 20s de descanso")
});

export const SupersetSchema = z.object({
    type: z.literal('SUPERSET'),
    exercise_ids: z.array(z.string()).length(2),
    target: z.enum(['HYPERTROPHY', 'STRENGTH']),
    rest_time_seconds: z.number().superRefine((val, ctx) => {
         // Strict constraint: STRENGTH needs 180s+, HYPERTROPHY needs >= 90s
         const target = (ctx as any).parent?.target;
         if (target === 'STRENGTH' && val < 180) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Supersets de fuerza requieren min 180s de descanso" });
         } else if (target === 'HYPERTROPHY' && val < 90) {
              ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Supersets de hipertrofia requieren min 90s de descanso" });
         }
    })
});

// NUTRITION ONBOARDING SCHEMAS & CONSTANTS
export const NUTRITION_LOGISTICS_TAGS = [
  'nut_log_market_1',
  'nut_log_market_2_3',
  'nut_log_market_app',
  'nut_log_kitchen_hate',
  'nut_log_kitchen_basic',
  'nut_log_kitchen_chef',
] as const;

export const NUTRITION_GOAL_TAGS = [
  'nut_goal_size_down',
  'nut_goal_energy',
  'nut_goal_digestion',
  'nut_goal_longevity',
] as const;

export const NUTRITION_OBSTACLE_TAGS = [
  'nut_obs_bored',
  'nut_obs_night_anxiety',
  'nut_obs_shopping',
  'nut_obs_no_support',
] as const;

export const CLINICAL_NUTRITION_TAGS = [
  'nut_diet_none',
  'nut_diet_vegetarian',
  'nut_diet_vegan',
  'nut_diet_keto',
  'nut_sym_bloating',
  'nut_sym_headache',
  'nut_sym_fatigue',
] as const;

export const NUTRITION_READINESS_TAGS = [
  'nut_change_action',
  'nut_change_contemplation',
  'nut_change_pre_contemplation',
] as const;

export const NutritionOnboardingSchema = z.object({
  nut_logistics_tags: z.array(z.enum(NUTRITION_LOGISTICS_TAGS))
    .describe("Etiquetas de frecuencia de compras y relación con la cocina"),
    
  nut_goals_tags: z.array(z.enum(NUTRITION_GOAL_TAGS))
    .describe("Metas principales de nutrición y salud del atleta"),
    
  nut_obstacles_tags: z.array(z.enum(NUTRITION_OBSTACLE_TAGS))
    .describe("Barreras psicológicas o logísticas superadas o presentes"),
    
  nut_clinical_tags: z.array(z.enum(CLINICAL_NUTRITION_TAGS))
    .describe("Restricciones dietéticas severas y sintomatología reportada"),
    
  nut_readiness_tags: z.array(z.enum(NUTRITION_READINESS_TAGS))
    .max(1, "Solo se debe seleccionar un nivel de Readiness")
    .describe("Nivel de disposición al cambio conductual (Transtheoretical Model)"),
});


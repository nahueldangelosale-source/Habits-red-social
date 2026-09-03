import { z } from 'zod';

export const TraitLevelSchema = z.union([
  z.literal(0), // Bloqueantes Médicos
  z.literal(1), // Estados Sistémicos
  z.literal(2), // Preferencias Estéticas
]);

export const TraitSourceSchema = z.enum(['ONBOARDING', 'TELEMETRY', 'COACH']);

export const AthleteTraitSchema = z.object({
  traitId: z.string(),
  level: TraitLevelSchema,
  weight: z.number().int().min(0).max(100),
  source: TraitSourceSchema,
  discoveredAt: z.string().datetime(), // ISO 8601 string
  expiresAt: z.string().datetime().optional(),
  isStale: z.boolean().default(false),
  payload: z.any().optional(),
});

export type TraitLevel = z.infer<typeof TraitLevelSchema>;
export type TraitSource = z.infer<typeof TraitSourceSchema>;
export type AthleteTrait = z.infer<typeof AthleteTraitSchema>;

// Catálogo base de Traits y sus metadatos (para inyección fácil)
export const AVAILABLE_TRAITS = {
  // Nivel 0 (Clínicos - Peso 100)
  CLINICAL_LUMBAR_FLEX: { level: 0 as TraitLevel, weight: 100 },
  CLINICAL_PELVIC_FLOOR: { level: 0 as TraitLevel, weight: 100 },
  
  // Nivel 1 (Sistémicos - Peso 50)
  SYS_HPA_BURNOUT: { level: 1 as TraitLevel, weight: 50 },
  SYS_WEEKEND_WARRIOR: { level: 1 as TraitLevel, weight: 50 },
  SYS_COGNITIVE_OVERLOAD: { level: 1 as TraitLevel, weight: 50 }, // TDAH

  // Nivel 2 (Preferencias - Peso 10)
  PREF_HYPERTROPHY: { level: 2 as TraitLevel, weight: 10 },
  PREF_MRV_MAX: { level: 2 as TraitLevel, weight: 10 },
};

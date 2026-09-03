/**
 * NaaS Nutrition Schemas (Zod v4) — Sprint 2 Gap Killer
 *
 * CONTRATO BIDIRECCIONAL: Espejo EXACTO de backend/app/schemas/nutrition_plan.py
 *
 * Sprint 2 Changes:
 *   - MealBlock.items → MealBlock.options: List[MealOption]
 *   - MealBlock.custom_label: nomenclatura personalizable ("Ingesta 1")
 *   - MealBlock.notes: instrucciones del profesional a nivel de bloque
 *   - MealOption: agrupa items bajo un label ("Opción A", "Opción B")
 *   - Macro Envelope: helpers para calcular rango min-max entre opciones
 */

import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const MealTypeEnum = z.enum([
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'pre_workout',
    'post_workout'
]);
export type MealType = z.infer<typeof MealTypeEnum>;

// ─── Sub-Models (Strict — mirrors Pydantic extra='forbid') ───────────────────

export const MacroNutrientsSchema = z.object({
    protein_g: z.number().min(0, 'Proteína no puede ser negativa'),
    carbs_g: z.number().min(0, 'Carbohidratos no pueden ser negativos'),
    fat_g: z.number().min(0, 'Grasas no pueden ser negativas'),
    calories: z.number().int().min(0, 'Calorías no pueden ser negativas'),
}).strict();

export type MacroNutrients = z.infer<typeof MacroNutrientsSchema>;

export const MealItemSchema = z.object({
    id: z.string().min(1).max(50),
    sara_item_id: z.string().max(50).nullable().optional(),
    name: z.string().min(1).max(100),
    portion_amount: z.number().positive('La porción debe ser mayor a 0'),
    portion_unit: z.string().min(1).max(20),
    macros: MacroNutrientsSchema,
    notes: z.string().max(500).nullable().optional(),
}).strict();

export type MealItem = z.infer<typeof MealItemSchema>;

export const MealOptionSchema = z.object({
    id: z.string().min(1).max(50),
    label: z.string().min(1).max(50).default('Opción A'),
    isAIDraft: z.boolean().optional().default(false),
    items: z.array(MealItemSchema),
}).strict();

export type MealOption = z.infer<typeof MealOptionSchema>;

export const MealBlockSchema = z.object({
    id: z.string().min(1).max(50),
    type: MealTypeEnum,
    custom_label: z.string().max(50).nullable().optional(),
    time_target: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM inválido').nullable().optional(),
    notes: z.string().max(500).nullable().optional(),
    options: z.array(MealOptionSchema),
}).strict();

export type MealBlock = z.infer<typeof MealBlockSchema>;

// ─── Top-Level Plan Schemas ──────────────────────────────────────────────────

export const NutritionPlanCreateSchema = z.object({
    athlete_id: z.string().min(1, 'athlete_id es requerido'),
    title: z.string().min(1).max(100),
    daily_macros_target: MacroNutrientsSchema,
    meals: z.array(MealBlockSchema),
}).strict();

export type NutritionPlanCreate = z.infer<typeof NutritionPlanCreateSchema>;

export const NutritionPlanUpdateSchema = z.object({
    title: z.string().min(1).max(100),
    daily_macros_target: MacroNutrientsSchema,
    meals: z.array(MealBlockSchema),
}).strict();

export type NutritionPlanUpdate = z.infer<typeof NutritionPlanUpdateSchema>;

export const NutritionPlanResponseSchema = z.object({
    id: z.string(),
    athlete_id: z.string(),
    trainer_id: z.string(),
    title: z.string(),
    daily_macros_target: MacroNutrientsSchema,
    meals: z.array(MealBlockSchema),
    created_at: z.string(),
    updated_at: z.string(),
});

export type NutritionPlanResponse = z.infer<typeof NutritionPlanResponseSchema>;

// ─── NaaS Block Constants (Manifiesto de Arquitectura Nutricional) ──────────

export const NAAS_BLOCK_SIZES = {
    CHO: 15,  // 1 Bloque Carbohidrato = 15g <CHOAVLDF>
    PRO: 7,   // 1 Bloque Proteína = 7g <PROCNT>
    FAT: 5,   // 1 Bloque Grasa = 5g <FATCE>
} as const;

// ─── Option Labels ──────────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function getNextOptionLabel(existingOptions: MealOption[]): string {
    return `Opción ${OPTION_LABELS[existingOptions.length] ?? existingOptions.length + 1}`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Calcula calorías desde macros (Atwater) */
export function calcCaloriesFromMacros(macros: Omit<MacroNutrients, 'calories'>): number {
    return Math.round(macros.protein_g * 4 + macros.carbs_g * 4 + macros.fat_g * 9);
}

/** Genera un ID seguro para reconciliación en React */
export function generateBlockId(): string {
    return crypto.randomUUID();
}

/** Suma macros de un array de MealItems */
export function sumItemsMacros(items: MealItem[]): MacroNutrients {
    return items.reduce(
        (acc, item) => ({
            protein_g: acc.protein_g + item.macros.protein_g,
            carbs_g: acc.carbs_g + item.macros.carbs_g,
            fat_g: acc.fat_g + item.macros.fat_g,
            calories: acc.calories + item.macros.calories,
        }),
        { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 }
    );
}

/**
 * Macro Envelope: calcula el rango min-max de macros entre todas las opciones
 * de una ingesta. Si la varianza de calorías excede el threshold (default 10%),
 * devuelve `isBalanced: false` para alertar al entrenador.
 */
export interface MacroEnvelope {
    min: MacroNutrients;
    max: MacroNutrients;
    avg: MacroNutrients;
    isBalanced: boolean;
    variancePct: number; // % de variación de calorías entre opciones
}

export function calcMacroEnvelope(options: MealOption[], thresholdPct = 10): MacroEnvelope {
    const validOptions = options.filter(opt => opt.items.length > 0);
    
    if (validOptions.length === 0) {
        const zero: MacroNutrients = { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 };
        return { min: zero, max: zero, avg: zero, isBalanced: true, variancePct: 0 };
    }

    const optionMacros = validOptions.map(opt => sumItemsMacros(opt.items));

    const min: MacroNutrients = {
        protein_g: Math.min(...optionMacros.map(m => m.protein_g)),
        carbs_g: Math.min(...optionMacros.map(m => m.carbs_g)),
        fat_g: Math.min(...optionMacros.map(m => m.fat_g)),
        calories: Math.min(...optionMacros.map(m => m.calories)),
    };

    const max: MacroNutrients = {
        protein_g: Math.max(...optionMacros.map(m => m.protein_g)),
        carbs_g: Math.max(...optionMacros.map(m => m.carbs_g)),
        fat_g: Math.max(...optionMacros.map(m => m.fat_g)),
        calories: Math.max(...optionMacros.map(m => m.calories)),
    };

    const avg: MacroNutrients = {
        protein_g: Math.round(optionMacros.reduce((s, m) => s + m.protein_g, 0) / validOptions.length * 10) / 10,
        carbs_g: Math.round(optionMacros.reduce((s, m) => s + m.carbs_g, 0) / validOptions.length * 10) / 10,
        fat_g: Math.round(optionMacros.reduce((s, m) => s + m.fat_g, 0) / validOptions.length * 10) / 10,
        calories: Math.round(optionMacros.reduce((s, m) => s + m.calories, 0) / validOptions.length),
    };

    const avgCal = avg.calories || 1;
    const variancePct = avgCal > 0
        ? Math.round(((max.calories - min.calories) / avgCal) * 100)
        : 0;

    return {
        min, max, avg,
        isBalanced: variancePct <= thresholdPct,
        variancePct,
    };
}

/** Crea un MealItem vacío con defaults seguros */
export function createEmptyMealItem(name: string = ''): MealItem {
    return {
        id: generateBlockId(),
        name,
        portion_amount: 100,
        portion_unit: 'g',
        macros: { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 },
        notes: null,
    };
}

/** Crea una MealOption vacía */
export function createEmptyMealOption(label: string = 'Opción A'): MealOption {
    return {
        id: generateBlockId(),
        label,
        items: [],
    };
}

/** Crea un MealBlock vacío con una opción por defecto */
export function createEmptyMealBlock(type: MealType, timeTarget?: string, customLabel?: string): MealBlock {
    return {
        id: generateBlockId(),
        type,
        custom_label: customLabel ?? null,
        time_target: timeTarget ?? null,
        notes: null,
        options: [createEmptyMealOption('Opción A')],
    };
}

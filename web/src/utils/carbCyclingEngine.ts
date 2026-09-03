/**
 * Motor Pedagógico de Ciclado de Carbohidratos (Carb Cycling Engine)
 * Bienestar APP — Fase 90
 * 
 * Permite al entrenador y atleta alternar de forma intuitiva entre:
 * 🔥 Día de Entrenamiento (Día On): Alta energía glucídica para rendimiento y síntesis proteica.
 * 🛋️ Día de Descanso (Día Off): Menor demanda de almidones, mayor saciedad y flexibilidad metabólica.
 */

export interface DayMacroTarget {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    dayType: 'TRAINING' | 'HEAVY_COMPOUND' | 'REST' | 'BALANCED' | 'REFEED';
    badgeLabel: string;
    pedagogicalTip: string;
}

export function calculateCarbCyclingTargets(
    baseTarget: { calories: number; protein_g: number; carbs_g: number; fat_g: number },
    isCyclingEnabled: boolean,
    isTrainingDay: boolean,
    isHeavyCompoundDay: boolean = false
): DayMacroTarget {
    if (!isCyclingEnabled) {
        return {
            ...baseTarget,
            dayType: 'BALANCED',
            badgeLabel: '⚖️ Pauta Equilibrada',
            pedagogicalTip: 'Distribución uniforme de macronutrientes para toda la semana.'
        };
    }

    const protein = Math.round(baseTarget.protein_g); // La proteína se mantiene inmutable

    if (isTrainingDay) {
        // 🔥 Día de Entrenamiento Pesado (Piernas/Espalda): +30% Carbos según consenso del Deep Research
        // ⚡ Día de Entrenamiento Estándar: +20% Carbos
        const carbMultiplier = isHeavyCompoundDay ? 1.30 : 1.20;
        const carbs = Math.round(baseTarget.carbs_g * carbMultiplier);
        const fat = Math.max(35, Math.round(baseTarget.fat_g * (isHeavyCompoundDay ? 0.85 : 0.90)));
        const calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));

        return {
            calories,
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
            dayType: isHeavyCompoundDay ? 'HEAVY_COMPOUND' : 'TRAINING',
            badgeLabel: isHeavyCompoundDay ? '🔥 Día Pesado (Alta Recarga +30%)' : '⚡ Día de Entreno (Energía Alta)',
            pedagogicalTip: isHeavyCompoundDay 
                ? 'Superávit glucídico específico para optimizar la tensión mecánica y glucógeno en grupos de alta demanda axial (Pierna/Espalda).'
                : 'Más carbohidratos para llenar tus depósitos de glucógeno y rendir con máxima fuerza.'
        };
    } else {
        // 🛋️ Día de Descanso: -35% Carbos, +15% Grasas saludables (Compensación isocalórica)
        const carbs = Math.round(baseTarget.carbs_g * 0.65);
        const fat = Math.round(baseTarget.fat_g * 1.15);
        const calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));

        return {
            calories,
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
            dayType: 'REST',
            badgeLabel: '🛋️ Día de Descanso (Recuperación)',
            pedagogicalTip: 'Menos almidones y más grasas saludables para regular la saciedad mientras tus músculos se reparan.'
        };
    }
}

/**
 * Refeed Estructurado de Carbohidratos (24 a 48 horas).
 * Basado en Campbell et al. y Dirlewanger et al.:
 * - Grasas al piso fisiológico (20 a 30g) para prevenir la lipogénesis por excedente.
 * - Carbohidratos elevados (+50% a +75%) para inducir un pico agudo de leptina (+28%)
 *   y restaurar el glucógeno muscular e intramuscular.
 */
export function calculateStructuredRefeed(
    maintenanceCalories: number,
    athleteWeightKg: number
): DayMacroTarget {
    const protein_g = Math.round(athleteWeightKg * 2.0); // 2.0 g/kg
    const fat_g = 25; // Piso estricto de 25g de grasa limpia
    const caloriesFromProtAndFat = (protein_g * 4) + (fat_g * 9);
    // Superávit agudo de mantenimiento + 10%
    const targetCalories = Math.round(maintenanceCalories * 1.10);
    const carbs_g = Math.round((targetCalories - caloriesFromProtAndFat) / 4);

    return {
        calories: targetCalories,
        protein_g,
        carbs_g,
        fat_g,
        dayType: 'REFEED',
        badgeLabel: '🍚 Refeed Estructurado (Leptina +28%)',
        pedagogicalTip: 'Grasas al mínimo (25g) y carbohidratos limpios elevados para reiniciar el termostato de leptina sin acumular tejido adiposo.'
    };
}

/**
 * supplementationEngine.ts
 * Motor de Suplementación Autónoma P1
 */

export type TrainingGoal = 'Fuerza Maxima' | 'Hipertrofia' | 'Resistencia Aerobica' | 'Resistencia Anaerobica' | 'Recomposicion';

export interface AthleteState {
  weightKg: number;
  age: number;
  isCaloricDeficit: boolean;
  primaryGoal: TrainingGoal;
  daysOnCreatine: number;
  hoursUntilSleepAtWorkout: number;
}

export interface SupplementPlan {
  creatine: { dailyDoseGrams: number; phase: 'Carga' | 'Mantenimiento'; message: string };
  betaAlanine: { dailyDoseGrams: number; isPrescribed: boolean; message: string };
  caffeine: { preWorkoutDoseMg: number; isPrescribed: boolean; timingMinutes: number; warning?: string };
  citrulline: { preWorkoutDoseGrams: number; isPrescribed: boolean; timingMinutes: number };
  hmb: { dailyDoseGrams: number; isPrescribed: boolean; message: string };
}

export class SupplementationEngine {
  
  public static generatePrescription(state: AthleteState): SupplementPlan {
    const { weightKg, primaryGoal, hoursUntilSleepAtWorkout, age, isCaloricDeficit } = state;

    // 1. Creatina Monohidrato
    const isLoading = state.daysOnCreatine <= 7;
    const creatineDose = isLoading 
      ? parseFloat((0.3 * weightKg).toFixed(1)) 
      : Math.max(3, Math.min(5, 0.05 * weightKg));
    
    // 2. Beta-Alanina
    const needsBuffer = ['Resistencia Anaerobica', 'Fuerza Maxima', 'Hipertrofia'].includes(primaryGoal);
    const betaAlanineDose = needsBuffer ? Math.min(6.4, parseFloat((0.065 * weightKg).toFixed(1))) : 0;

    // 3. Cafeína Anhidra
    const benefitsFromCaffeine = ['Fuerza Maxima', 'Resistencia Aerobica', 'Hipertrofia'].includes(primaryGoal);
    let caffeineDose = 0;
    let caffeineWarning = undefined;
    
    if (benefitsFromCaffeine) {
      if (hoursUntilSleepAtWorkout >= 8) {
        caffeineDose = Math.min(Math.max(3 * weightKg, 0), 400); // Tope de 400mg
      } else {
        caffeineWarning = "Suprimida. El clearance de la vida media interferiría con la arquitectura del sueño.";
      }
    }

    // 4. Malato de Citrulina
    const needsVasodilation = ['Fuerza Maxima', 'Hipertrofia'].includes(primaryGoal);
    const citrullineDose = needsVasodilation ? 8 : 0;

    // 5. HMB
    const needsAntiCatabolic = age >= 50 || isCaloricDeficit;
    const hmbDose = needsAntiCatabolic ? parseFloat(((38 * weightKg) / 1000).toFixed(1)) : 0;

    return {
      creatine: {
        dailyDoseGrams: creatineDose,
        phase: isLoading ? 'Carga' : 'Mantenimiento',
        message: 'Consumir diariamente independientemente del horario de entrenamiento.'
      },
      betaAlanine: {
        dailyDoseGrams: betaAlanineDose,
        isPrescribed: needsBuffer,
        message: needsBuffer ? 'Fraccionar en 3-4 dosis diarias para evitar parestesia.' : 'No requerido para el objetivo actual.'
      },
      caffeine: {
        preWorkoutDoseMg: Math.round(caffeineDose),
        isPrescribed: caffeineDose > 0,
        timingMinutes: 60,
        warning: caffeineWarning
      },
      citrulline: {
        preWorkoutDoseGrams: citrullineDose,
        isPrescribed: needsVasodilation,
        timingMinutes: 45
      },
      hmb: {
        dailyDoseGrams: hmbDose,
        isPrescribed: needsAntiCatabolic,
        message: needsAntiCatabolic ? 'Dividir en 3 tomas para mantener niveles plasmáticos estables.' : 'Suficiente con proteína dietaria intacta.'
      }
    };
  }
}

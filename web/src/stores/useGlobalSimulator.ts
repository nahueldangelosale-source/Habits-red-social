import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GlobalSimulatorState {
    // B2B State (Gym)
    gymActiveClients: number;
    gymBaseMRR: number; // Base MRR per client, e.g., $50
    gymChurnRiskCount: number;
    
    // Pro State (Trainer)
    proHasNewAlert: boolean;
    proAlertMessage: string | null;
    proAssignedClients: number;

    // B2C State (Athlete - Simulating "Juan Pérez")
    athleteName: string;
    athletePhase: 'ONBOARDING' | 'CONSOLIDATED';
    athleteStressLevel: 'optimal' | 'fatigued' | 'danger';
    athleteResilienceXP: number;
    athleteWorkoutStatus: 'pending' | 'completed';

    // Lista de atletas generados localmente (Fix de Persistencia)
    mockedAthletes: any[];

    // God Mode Triggers
    triggerOnboardClient: (name: string) => void;
    addMockedAthlete: (athlete: any) => void;
    triggerWorkoutCompletion: (rpe: number) => void;
    triggerReportStress: () => void;
    triggerHabitCompletion: () => void;
    resetSimulator: () => void;
}

const initialState = {
    gymActiveClients: 150,
    gymBaseMRR: 50,
    gymChurnRiskCount: 12,
    
    proHasNewAlert: false,
    proAlertMessage: null,
    proAssignedClients: 35,

    athleteName: 'Atleta Demo',
    athletePhase: 'ONBOARDING' as const,
    athleteStressLevel: 'optimal' as const,
    athleteResilienceXP: 100,
    athleteWorkoutStatus: 'pending' as const,

    mockedAthletes: [] as any[],
};

export const useGlobalSimulator = create<GlobalSimulatorState>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Acción 1: Alta de Cliente (Impacta B2B y Pro)
            triggerOnboardClient: (name: string) => {
                set((state) => ({
                    gymActiveClients: state.gymActiveClients + 1,
                    proAssignedClients: state.proAssignedClients + 1,
                    athleteName: name,
                    athletePhase: 'ONBOARDING',
                    athleteStressLevel: 'optimal',
                    athleteWorkoutStatus: 'pending',
                }));
            },

            addMockedAthlete: (athlete: any) => {
                set((state) => ({
                    mockedAthletes: [athlete, ...state.mockedAthletes],
                    proAssignedClients: state.proAssignedClients + 1,
                    gymActiveClients: state.gymActiveClients + 1
                }));
            },

            // Acción 2: Completar Entrenamiento (Impacta B2C y Pro)
            triggerWorkoutCompletion: (rpe: number) => {
                set((state) => {
                    const isHighRpe = rpe >= 8;
                    return {
                        athleteWorkoutStatus: 'completed',
                        // Si RPE es muy alto, dispara alerta al trainer y cambia estado del atleta
                        athleteStressLevel: isHighRpe ? 'fatigued' : state.athleteStressLevel,
                        proHasNewAlert: isHighRpe,
                        proAlertMessage: isHighRpe ? `${state.athleteName} reportó RPE ${rpe}/10. ACWR disparado. Posible riesgo de sobreentrenamiento.` : state.proAlertMessage,
                        gymChurnRiskCount: isHighRpe ? state.gymChurnRiskCount + 1 : state.gymChurnRiskCount
                    };
                });
            },

            // Acción 3: Reportar Estrés / Modo Calma (Impacta B2C, B2B y Pro)
            triggerReportStress: () => {
                set((state) => ({
                    athleteStressLevel: 'danger',
                    proHasNewAlert: true,
                    proAlertMessage: `ALERTA ROJA: ${state.athleteName} reportó fatiga sistémica y dolor articular. Requiere intervención inmediata (Recovery).`,
                    gymChurnRiskCount: state.gymChurnRiskCount + 1,
                }));
            },

            // Acción 4: Completar Hábitos (Impacta B2C Gamification)
            triggerHabitCompletion: () => {
                set((state) => ({
                    athleteResilienceXP: state.athleteResilienceXP + 50,
                    // Bajar el riesgo de churn si el atleta construye buenos hábitos
                    gymChurnRiskCount: Math.max(0, state.gymChurnRiskCount - 1)
                }));
            },

            resetSimulator: () => {
                set(initialState);
            }
        }),
        {
            name: 'bienestar-global-simulator-storage',
        }
    )
);

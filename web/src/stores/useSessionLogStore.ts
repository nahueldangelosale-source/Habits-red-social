/**
 * useSessionLogStore.ts
 * Store Offline-First para persistir los registros de sesión del atleta.
 * Los datos sobreviven a recargas, navegación y cierre de pantalla.
 * Al final de la sesión, se sincroniza el batch completo al backend.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExerciseLog {
  exerciseId: string;
  prescribedWeight: string;
  prescribedReps: string;
  actualWeight: string;
  actualReps: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface SessionLog {
  dayId: string;
  dayName: string;
  athleteId: string;
  protocolId: string;
  startedAt: string;
  completedAt?: string;
  exercises: Record<string, ExerciseLog>; // keyed by exerciseId for O(1) access
  isSynced: boolean;
}

interface SessionLogState {
  activeSessions: Record<string, SessionLog>; // keyed by `${athleteId}_${dayId}`
  completedSessions: SessionLog[];
}

interface SessionLogActions {
  startSession: (athleteId: string, protocolId: string, dayId: string, dayName: string) => void;
  logExercise: (sessionKey: string, exerciseId: string, data: Partial<ExerciseLog>) => void;
  toggleComplete: (sessionKey: string, exerciseId: string, prescribedWeight: string, prescribedReps: string) => void;
  completeSession: (sessionKey: string) => void;
  markSynced: (sessionKey: string) => void;
  getSessionKey: (athleteId: string, dayId: string) => string;
  clearSyncedSessions: () => void;
}

export const useSessionLogStore = create<SessionLogState & SessionLogActions>()(
  persist(
    (set, get) => ({
      activeSessions: {},
      completedSessions: [],

      getSessionKey: (athleteId: string, dayId: string) => `${athleteId}_${dayId}`,

      startSession: (athleteId, protocolId, dayId, dayName) => {
        const key = get().getSessionKey(athleteId, dayId);
        set((state) => {
          // Don't overwrite if session already exists (resume)
          if (state.activeSessions[key]) return state;
          return {
            activeSessions: {
              ...state.activeSessions,
              [key]: {
                dayId,
                dayName,
                athleteId,
                protocolId,
                startedAt: new Date().toISOString(),
                exercises: {},
                isSynced: false,
              }
            }
          };
        });
      },

      logExercise: (sessionKey, exerciseId, data) => {
        set((state) => {
          const session = state.activeSessions[sessionKey];
          if (!session) return state;
          
          const existing = session.exercises[exerciseId] || {
            exerciseId,
            prescribedWeight: '',
            prescribedReps: '',
            actualWeight: '',
            actualReps: '',
            isCompleted: false,
          };

          return {
            activeSessions: {
              ...state.activeSessions,
              [sessionKey]: {
                ...session,
                exercises: {
                  ...session.exercises,
                  [exerciseId]: { ...existing, ...data }
                }
              }
            }
          };
        });
      },

      toggleComplete: (sessionKey, exerciseId, prescribedWeight, prescribedReps) => {
        set((state) => {
          const session = state.activeSessions[sessionKey];
          if (!session) return state;
          
          const existing = session.exercises[exerciseId];
          const wasCompleted = existing?.isCompleted || false;

          return {
            activeSessions: {
              ...state.activeSessions,
              [sessionKey]: {
                ...session,
                exercises: {
                  ...session.exercises,
                  [exerciseId]: {
                    exerciseId,
                    prescribedWeight,
                    prescribedReps,
                    actualWeight: existing?.actualWeight || prescribedWeight,
                    actualReps: existing?.actualReps || prescribedReps,
                    isCompleted: !wasCompleted,
                    completedAt: !wasCompleted ? new Date().toISOString() : undefined,
                  }
                }
              }
            }
          };
        });
      },

      completeSession: (sessionKey) => {
        set((state) => {
          const session = state.activeSessions[sessionKey];
          if (!session) return state;

          const completedSession: SessionLog = {
            ...session,
            completedAt: new Date().toISOString(),
          };

          const { [sessionKey]: _, ...remaining } = state.activeSessions;
          return {
            activeSessions: remaining,
            completedSessions: [...state.completedSessions, completedSession],
          };
        });
      },

      markSynced: (sessionKey) => {
        set((state) => ({
          completedSessions: state.completedSessions.map(s => 
            `${s.athleteId}_${s.dayId}` === sessionKey ? { ...s, isSynced: true } : s
          )
        }));
      },

      clearSyncedSessions: () => {
        set((state) => ({
          completedSessions: state.completedSessions.filter(s => !s.isSynced)
        }));
      },
    }),
    {
      name: 'session-log-storage',
      version: 1,
    }
  )
);

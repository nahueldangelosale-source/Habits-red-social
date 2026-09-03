import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { useHabitStore } from './useHabitStore';

export interface ExerciseExecution {
  exerciseId: string; // ID from RoutineExercise
  seriesIndex: number; // For straight sets without 'isWeekLocked' complexity in Phase 1
  repsDone: string;
  weightUsed: string;
  rirReal: string;
  isCompleted: boolean;
  rpe?: number; // Esfuerzo 1-10 (Borg CR10)
  painLevel?: number; // EVA 0-10 (0 = Sin dolor)
  painJoint?: string; // e.g. 'Rodilla', 'Hombro', 'Lumbar', 'Codo'
}

export interface SessionExecution {
  sessionId: string; // The ID of the session being executed
  date: string; // ISO date string
  startTime: number;
  endTime: number | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'COMPLETED_MANUAL';
  
  // High Fidelity Payload (JSONB in backend)
  exercises: Record<string, ExerciseExecution[]>; 
  
  // Structured Columns (MVD - Minimum Viable Data)
  mvd_rpe: number | null; // Esfuerzo general del día / sesión (sRPE 1-10)
  mvd_pain?: number | null; // Dolor articular global (EVA 0-10)
  mvd_satisfaction?: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'TIRED';
  mvd_duration: number | null;
  mvd_tags: string[];
  clientNotes: string;
}

interface ExecutionState {
  activeSession: SessionExecution | null;
  sessionHistory: SessionExecution[];
  hiitState: {
    isActive: boolean;
    currentRound: number;
    totalRounds: number;
    isWorkPhase: boolean;
    timeRemaining: number;
    workTime: number;
    restTime: number;
    isRecoveryMode: boolean;
    isPaused: boolean;
  } | null;
}

interface ExecutionActions {
  startSession: (sessionId: string) => void;
  endSession: (
    clientNotes?: string, 
    rpeSession?: number, 
    painSession?: number, 
    satisfaction?: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'TIRED'
  ) => void;
  logManualSession: (sessionId: string, date: string, mvd_rpe: number, mvd_duration: number, mvd_tags: string[], clientNotes: string) => void;
  updateSetExecution: (
    exerciseId: string, 
    seriesIndex: number, 
    updates: Partial<ExerciseExecution>
  ) => void;
  markSetCompleted: (exerciseId: string, seriesIndex: number, completed: boolean) => void;
  startHIIT: (config: { workTime: number; restTime: number; rounds: number; isRecoveryMode?: boolean }) => void;
  tickHIIT: () => void;
  pauseHIIT: () => void;
  skipRound: () => void;
  completeHIIT: () => void;
}

type ExecutionStore = ExecutionState & ExecutionActions;

export const useExecutionStore = create<ExecutionStore>()(
  persist(
    immer((set) => ({
      activeSession: null,
      sessionHistory: [],
      hiitState: null,
      
      startSession: (sessionId: string) => set((state) => {
        state.activeSession = {
          sessionId,
          date: new Date().toISOString().split('T')[0],
          startTime: Date.now(),
          endTime: null,
          status: 'IN_PROGRESS',
          exercises: {},
          mvd_rpe: null,
          mvd_pain: null,
          mvd_satisfaction: 'GOOD',
          mvd_duration: null,
          mvd_tags: [],
          clientNotes: ''
        };
      }),

      endSession: (clientNotes, rpeSession, painSession, satisfaction) => set((state) => {
        if (state.activeSession) {
          state.activeSession.endTime = Date.now();
          state.activeSession.status = 'COMPLETED';
          state.activeSession.mvd_duration = Math.round((state.activeSession.endTime - state.activeSession.startTime) / 60000);
          if (clientNotes !== undefined) state.activeSession.clientNotes = clientNotes;
          if (rpeSession !== undefined) state.activeSession.mvd_rpe = rpeSession;
          if (painSession !== undefined) state.activeSession.mvd_pain = painSession;
          if (satisfaction !== undefined) state.activeSession.mvd_satisfaction = satisfaction;
          
          state.sessionHistory.push(state.activeSession);
          state.activeSession = null;
        }
      }),

      logManualSession: (sessionId, date, mvd_rpe, mvd_duration, mvd_tags, clientNotes) => set((state) => {
        state.sessionHistory.push({
          sessionId,
          date,
          startTime: Date.now(),
          endTime: Date.now(),
          status: 'COMPLETED_MANUAL',
          exercises: {},
          mvd_rpe,
          mvd_duration,
          mvd_tags,
          clientNotes
        });
      }),

      updateSetExecution: (exerciseId, seriesIndex, updates) => set((state) => {
        if (!state.activeSession) return;
        
        if (!state.activeSession.exercises[exerciseId]) {
          state.activeSession.exercises[exerciseId] = [];
        }

        const sets = state.activeSession.exercises[exerciseId];
        
        // Ensure array has enough slots
        while (sets.length <= seriesIndex) {
          sets.push({
            exerciseId,
            seriesIndex: sets.length,
            repsDone: '',
            weightUsed: '',
            rirReal: '',
            isCompleted: false
          });
        }

        Object.assign(sets[seriesIndex], updates);
      }),

      markSetCompleted: (exerciseId, seriesIndex, completed) => set((state) => {
        if (!state.activeSession) return;
        
        if (!state.activeSession.exercises[exerciseId]) {
          state.activeSession.exercises[exerciseId] = [];
        }

        const sets = state.activeSession.exercises[exerciseId];
        while (sets.length <= seriesIndex) {
          sets.push({
            exerciseId,
            seriesIndex: sets.length,
            repsDone: '',
            weightUsed: '',
            rirReal: '',
            isCompleted: false
          });
        }

        sets[seriesIndex].isCompleted = completed;
      }),

      startHIIT: (config) => set((state) => {
        const workTime = config.isRecoveryMode ? Math.round(config.workTime * 0.9) : config.workTime;
        state.hiitState = {
          isActive: true,
          currentRound: 1,
          totalRounds: config.rounds,
          isWorkPhase: true,
          timeRemaining: workTime,
          workTime: workTime,
          restTime: config.restTime,
          isRecoveryMode: !!config.isRecoveryMode,
          isPaused: false
        };
      }),

      tickHIIT: () => set((state) => {
        if (!state.hiitState || state.hiitState.isPaused || !state.hiitState.isActive) return;
        
        if (state.hiitState.timeRemaining > 0) {
          state.hiitState.timeRemaining -= 1;
        } else {
          if (state.hiitState.isWorkPhase) {
            state.hiitState.isWorkPhase = false;
            state.hiitState.timeRemaining = state.hiitState.restTime;
          } else {
            if (state.hiitState.currentRound < state.hiitState.totalRounds) {
              state.hiitState.currentRound += 1;
              state.hiitState.isWorkPhase = true;
              state.hiitState.timeRemaining = state.hiitState.workTime;
            } else {
              state.hiitState.isActive = false;
            }
          }
        }
      }),

      pauseHIIT: () => set((state) => {
        if (state.hiitState) {
          state.hiitState.isPaused = !state.hiitState.isPaused;
        }
      }),

      skipRound: () => set((state) => {
        if (!state.hiitState || !state.hiitState.isActive) return;
        if (state.hiitState.isWorkPhase) {
          state.hiitState.isWorkPhase = false;
          state.hiitState.timeRemaining = state.hiitState.restTime;
        } else {
          if (state.hiitState.currentRound < state.hiitState.totalRounds) {
            state.hiitState.currentRound += 1;
            state.hiitState.isWorkPhase = true;
            state.hiitState.timeRemaining = state.hiitState.workTime;
          } else {
            state.hiitState.isActive = false;
          }
        }
      }),

      completeHIIT: () => set((state) => {
        if (state.hiitState) {
          state.hiitState.isActive = false;
        }
        window.dispatchEvent(new CustomEvent('xp:award', { detail: { source: 'workout', amount: 50 } }));
      })
    })),
    {
      name: 'execution-store'
    }
  )
);

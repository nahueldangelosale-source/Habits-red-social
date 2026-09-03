import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type RecurringClass } from './useAgendaStore';
import { useGamificationStore } from './useGamificationStore';
import toast from 'react-hot-toast';

export interface ActiveLiveClass {
  classId: string;
  title: string;
  instructorName: string;
  activityType: string;
  startedAt: number; // Timestamp en ms del momento en que arrancó o se reanudó
  accumulatedSeconds: number; // Segundos acumulados en pausas anteriores
  isRunning: boolean;
  rpe: number;
  distanceKm: number;
  distanceMeters: number;
  notes: string;
}

interface LiveClassStore {
  activeClass: ActiveLiveClass | null;
  isModalOpen: boolean;

  // Acciones
  startClass: (classData: RecurringClass) => void;
  pauseClass: () => void;
  resumeClass: () => void;
  resetClass: () => void;
  updateMetrics: (metrics: Partial<Pick<ActiveLiveClass, 'rpe' | 'distanceKm' | 'distanceMeters' | 'notes'>>) => void;
  openModal: () => void;
  closeModal: () => void;
  getElapsedSeconds: () => number;
  finishClass: () => { xpEarned: number; internalLoad: number; elapsedSeconds: number } | null;
}

// Control de Screen WakeLock
let wakeLockSentinel: any = null;

const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator && (navigator as any).wakeLock) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
    }
  } catch (err) {
    // Silencioso si el navegador o permisos lo deniegan
  }
};

const releaseWakeLock = async () => {
  try {
    if (wakeLockSentinel) {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    }
  } catch (err) {}
};

export const useLiveClassStore = create<LiveClassStore>()(
  persist(
    (set, get) => ({
      activeClass: null,
      isModalOpen: false,

      startClass: (classData: RecurringClass) => {
        const newClass: ActiveLiveClass = {
          classId: classData.id,
          title: classData.title,
          instructorName: classData.instructorName,
          activityType: classData.activityType,
          startedAt: Date.now(),
          accumulatedSeconds: 0,
          isRunning: true,
          rpe: 8,
          distanceKm: 0,
          distanceMeters: 0,
          notes: ''
        };

        set({
          activeClass: newClass,
          isModalOpen: true
        });

        requestWakeLock();
      },

      pauseClass: () => {
        const { activeClass } = get();
        if (!activeClass || !activeClass.isRunning) return;

        const currentElapsed = Math.floor((Date.now() - activeClass.startedAt) / 1000);
        set({
          activeClass: {
            ...activeClass,
            accumulatedSeconds: activeClass.accumulatedSeconds + currentElapsed,
            isRunning: false,
            startedAt: Date.now()
          }
        });

        releaseWakeLock();
      },

      resumeClass: () => {
        const { activeClass } = get();
        if (!activeClass || activeClass.isRunning) return;

        set({
          activeClass: {
            ...activeClass,
            isRunning: true,
            startedAt: Date.now()
          }
        });

        requestWakeLock();
      },

      resetClass: () => {
        const { activeClass } = get();
        if (!activeClass) return;

        set({
          activeClass: {
            ...activeClass,
            accumulatedSeconds: 0,
            startedAt: Date.now(),
            isRunning: false
          }
        });
      },

      updateMetrics: (metrics) => {
        const { activeClass } = get();
        if (!activeClass) return;

        set({
          activeClass: {
            ...activeClass,
            ...metrics
          }
        });
      },

      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),

      getElapsedSeconds: () => {
        const { activeClass } = get();
        if (!activeClass) return 0;
        if (!activeClass.isRunning) return activeClass.accumulatedSeconds;

        const currentDelta = Math.floor((Date.now() - activeClass.startedAt) / 1000);
        return activeClass.accumulatedSeconds + currentDelta;
      },

      finishClass: () => {
        const { activeClass, getElapsedSeconds } = get();
        if (!activeClass) return null;

        const totalSeconds = getElapsedSeconds();
        const effectiveMinutes = Math.max(1, Math.floor(totalSeconds / 60));
        const internalLoad = effectiveMinutes * activeClass.rpe;
        const xpEarned = Math.min(80, Math.max(25, Math.round((effectiveMinutes / 5) * 4 + activeClass.rpe * 2)));

        // 1. Premiar XP en Gamificación
        useGamificationStore.getState().awardXP('WORKOUT_LOG', xpEarned);

        // 2. Registrar progreso en Squad
        useGamificationStore.getState().recordProgress({
          source: 'WORKOUT_COMPLETE',
          value: 1,
          clientId: 'me'
        });

        // 3. Emitir eventos globales
        window.dispatchEvent(new CustomEvent('xp:award', {
          detail: { source: 'live_class', amount: xpEarned }
        }));

        window.dispatchEvent(new CustomEvent('habit:complete_category', {
          detail: { category: 'FITNESS' }
        }));

        const isSwimming = activeClass.activityType === 'SWIMMING';
        const distanceText = isSwimming && activeClass.distanceMeters > 0 
          ? ` (${activeClass.distanceMeters}m)` 
          : activeClass.distanceKm > 0 
          ? ` (${activeClass.distanceKm} km)` 
          : '';

        toast.success(
          `¡${activeClass.title} finalizada${distanceText}! Duración: ${effectiveMinutes} min • +${xpEarned} XP 🏆`,
          { duration: 5000 }
        );

        releaseWakeLock();

        // Limpiar estado
        set({
          activeClass: null,
          isModalOpen: false
        });

        return { xpEarned, internalLoad, elapsedSeconds: totalSeconds };
      }
    }),
    {
      name: 'useLiveClassStore',
      partialize: (state) => ({
        activeClass: state.activeClass,
        isModalOpen: state.isModalOpen
      })
    }
  )
);

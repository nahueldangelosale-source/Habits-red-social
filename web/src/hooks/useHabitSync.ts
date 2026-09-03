import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_BASE_URL } from '../api/client';
import { useHabitStore, type PrescribedHabit, type HabitCategory, type HabitInputType, type HabitType } from '../stores/useHabitStore';
import toast from 'react-hot-toast';

export interface BackendHabitLog {
  id: string;
  log_date: string;
  completed: boolean;
  value: number | null;
  zone: string;
}

export interface BackendHabit {
  id: string;
  client_id: string;
  template_id: string;
  title: string;
  type: HabitType;
  category: HabitCategory;
  input_type: HabitInputType;
  unit: string | null;
  target_value: number | null;
  duration: string;
  scheduled_days: number[];
  tags: string[];
  is_custom: boolean;
  is_active: boolean;
  streak_current: number;
  streak_best: number;
  level: number;
  start_date: string;
  logs: BackendHabitLog[];
}

/**
 * Hook de sincronización bidireccional entre useHabitStore (localStorage) y PostgreSQL (/api/v1/habits).
 * Garantiza persistencia en la nube, soporte multi-dispositivo y fallback offline.
 */
export function useHabitSync(clientId?: string) {
  const queryClient = useQueryClient();
  const { prescribedHabits, setHabitsFromServer, setHabitSyncStatus } = useHabitStore();

  // 1. Fetch de hábitos desde PostgreSQL
  const { data: serverHabits, isLoading, isError, refetch } = useQuery<BackendHabit[]>({
    queryKey: ['habits', clientId || 'me'],
    queryFn: async () => {
      const url = clientId 
        ? `${API_BASE_URL}/api/v1/habits?client_id=${clientId}` 
        : `${API_BASE_URL}/api/v1/habits`;
      return await apiRequest<BackendHabit[]>(url);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
  });

  // 2. Hidratación / Merge de Backend hacia LocalStore
  useEffect(() => {
    if (serverHabits && Array.isArray(serverHabits)) {
      const mappedHabits: PrescribedHabit[] = serverHabits.map((sh) => {
        const completedDays = (sh.logs || [])
          .filter((l) => l.completed)
          .map((l) => l.log_date);

        const dailyValues: Record<string, number> = {};
        const dailyZones: Record<string, any> = {};

        (sh.logs || []).forEach((l) => {
          if (l.value !== null && l.value !== undefined) {
            dailyValues[l.log_date] = l.value;
          }
          dailyZones[l.log_date] = l.zone;
        });

        return {
          id: sh.id,
          serverId: sh.id,
          syncStatus: 'SYNCED' as const,
          clientId: sh.client_id,
          templateId: sh.template_id,
          title: sh.title,
          type: sh.type,
          category: sh.category,
          tags: sh.tags || [],
          inputType: sh.input_type,
          unit: sh.unit || undefined,
          targetValue: sh.target_value || undefined,
          duration: sh.duration as any,
          startDate: sh.start_date,
          scheduledDays: sh.scheduled_days || [1, 2, 3, 4, 5, 6, 7],
          streakCurrent: sh.streak_current,
          streakBest: sh.streak_best,
          completedDays,
          dailyValues,
          dailyZones,
          level: sh.level,
          isCustom: sh.is_custom,
        };
      });

      if (mappedHabits.length > 0) {
        setHabitsFromServer(mappedHabits);
      }
    }
  }, [serverHabits, setHabitsFromServer]);

  // 3. Mutación para Check-in en el Backend
  const checkInMutation = useMutation({
    mutationFn: async ({ habitId, date, completed, value }: { habitId: string; date: string; completed: boolean; value?: number }) => {
      return await apiRequest<BackendHabit>(`${API_BASE_URL}/api/v1/habits/${habitId}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ date, completed, value }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    onError: (err) => {
      console.warn('Fallo sync de check-in con backend (fallback offline activo):', err);
    }
  });

  // 4. Mutación para Batch Sync de hábitos creados offline / previos en localStorage
  const batchSyncMutation = useMutation({
    mutationFn: async (habitsToSync: PrescribedHabit[]) => {
      const payload = {
        habits: habitsToSync.map((h) => ({
          local_id: h.id,
          template_id: h.templateId,
          title: h.title,
          type: h.type,
          category: h.category,
          input_type: h.inputType,
          unit: h.unit,
          target_value: h.targetValue,
          duration: h.duration,
          scheduled_days: h.scheduledDays,
          tags: h.tags,
          is_custom: h.isCustom,
          completed_days: h.completedDays,
          daily_values: h.dailyValues,
        })),
      };

      return await apiRequest<BackendHabit[]>(`${API_BASE_URL}/api/v1/habits/sync-batch`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (synced) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  // 5. Auto-sincronización de hábitos locales no migrados
  useEffect(() => {
    const unmigrated = prescribedHabits.filter((h) => !h.serverId || h.syncStatus === 'LOCAL');
    if (unmigrated.length > 0 && !isLoading && !isError) {
      batchSyncMutation.mutate(unmigrated);
    }
  }, [prescribedHabits.length, isLoading, isError]);

  return {
    serverHabits,
    isLoading,
    isError,
    refetch,
    syncCheckIn: checkInMutation.mutate,
  };
}

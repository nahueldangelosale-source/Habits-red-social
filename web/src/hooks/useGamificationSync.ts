import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_BASE_URL } from '../api/client';
import { useGamificationStore, type XPEvent, type Challenge } from '../stores/useGamificationStore';

export interface GamificationStatusResponse {
  total_xp: number;
  level: number;
  level_title: string;
  xp_progress: {
    current_xp: number;
    current_level: number;
    level_title: string;
    xp_for_current_level: number;
    xp_for_next_level: number;
    remaining_xp: number;
    progress_percent: number;
  };
  active_challenges_count: number;
}

export interface BackendChallenge {
  id: string;
  title: string;
  type: 'STREAK' | 'VOLUME' | 'CONSISTENCY';
  target_value: number;
  current_value: number;
  state: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PIVOTED';
  start_date: string;
  end_date: string;
  duration_days: number;
}

/**
 * Hook de sincronización en la nube para XP, Niveles y Retos del Atleta.
 * Conecta useGamificationStore con PostgreSQL (/api/v1/gamification).
 */
export function useGamificationSync(clientId?: string) {
  const queryClient = useQueryClient();
  const { xpOutbox, totalXP } = useGamificationStore();

  // 1. Fetch de estado de gamificación desde PostgreSQL
  const { data: statusData, isLoading, isError, refetch } = useQuery<GamificationStatusResponse>({
    queryKey: ['gamification-status', clientId || 'me'],
    queryFn: async () => {
      const url = clientId 
        ? `${API_BASE_URL}/api/v1/gamification/status?client_id=${clientId}` 
        : `${API_BASE_URL}/api/v1/gamification/status`;
      return await apiRequest<GamificationStatusResponse>(url);
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
  });

  // 2. Hidratación de XP y Nivel en el Store Local
  useEffect(() => {
    if (statusData && typeof statusData.total_xp === 'number') {
      useGamificationStore.setState((state) => {
        // Si el backend tiene mayor o igual XP que el store local, adoptamos el estado del backend
        if (statusData.total_xp >= state.totalXP) {
          state.totalXP = statusData.total_xp;
          state.level = statusData.level;
        }
      });
    }
  }, [statusData]);

  // 3. Mutación para sincronizar la cola de eventos de XP
  const syncOutboxMutation = useMutation({
    mutationFn: async (events: XPEvent[]) => {
      return await apiRequest<{ synced_events_count: number; current_balance: number }>(
        `${API_BASE_URL}/api/v1/gamification/sync-xp-outbox`,
        {
          method: 'POST',
          body: JSON.stringify({ events }),
        }
      );
    },
    onSuccess: (data) => {
      useGamificationStore.setState((state) => {
        state.xpOutbox = state.xpOutbox.filter((e) => e.syncStatus !== 'pending');
        if (data.current_balance > state.totalXP) {
          state.totalXP = data.current_balance;
        }
      });
      queryClient.invalidateQueries({ queryKey: ['gamification-status'] });
    },
    onError: (err) => {
      console.warn('[Gamification Sync] Error al sincronizar outbox con backend:', err);
    },
  });

  // 4. Auto-sincronización cuando hay eventos pendientes en outbox
  useEffect(() => {
    const pending = xpOutbox.filter((e) => e.syncStatus === 'pending');
    if (pending.length > 0 && !isLoading) {
      syncOutboxMutation.mutate(pending);
    }
  }, [xpOutbox.length, isLoading]);

  return {
    statusData,
    isLoading,
    isError,
    refetch,
    syncNow: () => {
      const pending = xpOutbox.filter((e) => e.syncStatus === 'pending');
      if (pending.length > 0) syncOutboxMutation.mutate(pending);
    },
  };
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { ActionCard } from '../types/api';

export function useActionCards() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['actionCards'],
    queryFn: async () => {
      const data = await api.get<{ items: ActionCard[] }>('/api/v1/action_cards');
      return data.items;
    },
    // Refetch every 30 seconds only if window is focused
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const markContacted = useMutation({
    mutationFn: async (cardId: string) => {
      const data = await api.post(`/api/v1/action_cards/${cardId}/mark_contacted`);
      return data;
    },
    onMutate: async (cardId) => {
      await queryClient.cancelQueries({ queryKey: ['actionCards'] });

      // Snapshot the previous value
      const previousCards = queryClient.getQueryData<ActionCard[]>(['actionCards']);

      // Optimistically update to immediately remove it from the list or mark as completed
      if (previousCards) {
        queryClient.setQueryData<ActionCard[]>(['actionCards'], (old) => 
          old?.map(card => card.id === cardId ? { ...card, status: 'COMPLETED' } : card)
            .filter(card => card.status !== 'COMPLETED') // Archivar visualmente
        );
      }

      return { previousCards };
    },
    onError: (err, cardId, context) => {
      // Rollback on error
      if (context?.previousCards) {
        queryClient.setQueryData(['actionCards'], context.previousCards);
      }
      // Assuming a toast system is in place
      console.error("Error de conexión. Inténtalo de nuevo.", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['actionCards'] });
    },
  });

  const assignRescueRoutine = useMutation({
    mutationFn: async ({ cardId, professionalId }: { cardId: string, professionalId: string }) => {
      const data = await api.post(`/api/v1/action_cards/${cardId}/assign_rescue_routine`, {
        professional_id: professionalId
      });
      return data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['actionCards'] });
    }
  });

  return {
    query,
    markContacted,
    assignRescueRoutine,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

// ─────────────────────────────────────────────────────────────────
// Types matching backend WorkoutPlan (is_master=True) response
// ─────────────────────────────────────────────────────────────────
export interface BackendExerciseTarget {
  id: string;
  exercise_id: string | null;
  custom_exercise_name?: string;
  order: number;
  sets: number | null;
  reps: string | null;
  rpe: string | null;
  weight: string | null;
  rest_seconds: number | null;
  notes: string | null;
}

export interface BackendSupersetGroup {
  id: string;
  order: number;
  notes: string | null;
  exercises: BackendExerciseTarget[];
}

export interface BackendWorkoutDay {
  id: string;
  name: string;
  order: number;
  supersets: BackendSupersetGroup[];
}

export interface BackendTemplate {
  id: string;
  tenant_id: string;
  professional_id: string;
  title: string;
  description: string | null;
  is_master: boolean;
  derived_from_master_id: string | null;
  delivery_status: string | null;
  days: BackendWorkoutDay[];
  created_at: string;
  updated_at: string;
}

interface CreateTemplatePayload {
  title: string;
  description?: string;
  days: {
    name: string;
    order: number;
    supersets: {
      order: number;
      notes?: string;
      exercises: {
        exercise_id?: string;
        order: number;
        sets?: number;
        reps?: string;
        rpe?: string;
        weight?: string;
        rest_seconds?: number;
        notes?: string;
      }[];
    }[];
  }[];
}

interface UpdateTemplatePayload {
  title?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────────
const TEMPLATES_KEY = ['templates'] as const;

// ─────────────────────────────────────────────────────────────────
// Hook: useTemplateSync — Sincroniza Template Library con Backend
// ─────────────────────────────────────────────────────────────────
export function useTemplateSync() {
  const queryClient = useQueryClient();

  // ── LIST ───────────────────────────────────────────────────────
  const listQuery = useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: async (): Promise<BackendTemplate[]> => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return [];
        const data = await api.get<BackendTemplate[]>('/api/v1/templates');
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('Template sync: using local catalog fallback', err);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 min cache
    retry: false,
    refetchOnWindowFocus: false,
  });

  // ── CREATE ─────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (payload: CreateTemplatePayload): Promise<BackendTemplate> => {
      return api.post<BackendTemplate>('/api/v1/templates', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });

  // ── UPDATE ─────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTemplatePayload }): Promise<BackendTemplate> => {
      return api.put<BackendTemplate>(`/api/v1/templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });

  // ── DELETE ─────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/api/v1/templates/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TEMPLATES_KEY });
      const previous = queryClient.getQueryData<BackendTemplate[]>(TEMPLATES_KEY);
      if (previous) {
        queryClient.setQueryData<BackendTemplate[]>(TEMPLATES_KEY, previous.filter(t => t.id !== id));
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TEMPLATES_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
    },
  });

  // ── FORK (to athlete) ─────────────────────────────────────────
  const forkMutation = useMutation({
    mutationFn: async ({ templateId, clientId }: { templateId: string; clientId?: string }): Promise<BackendTemplate> => {
      const params = clientId ? `?client_id=${clientId}` : '';
      return api.post<BackendTemplate>(`/api/v1/templates/${templateId}/fork${params}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
      queryClient.invalidateQueries({ queryKey: ['workoutPlan'] });
    },
  });

  return {
    // Queries
    templates: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,

    // Mutations
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    forkTemplate: forkMutation.mutateAsync,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isForking: forkMutation.isPending,
  };
}

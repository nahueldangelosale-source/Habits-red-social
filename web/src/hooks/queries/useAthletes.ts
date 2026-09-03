import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';

// Type definitions based on our Python Pydantic models
export interface Athlete {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  metabolic_archetype?: string;
  current_weight_kg?: number;
  injuries_history?: any[];
  performance_charts?: any;
  created_at?: string;
  tenant_id: string;
  status: string;
}

export interface ProtocolAssignment {
  protocol_id: string;
  start_date: string;
  end_date: string;
}

export const useAthletes = () => {
  return useQuery({
    queryKey: ['athletes'],
    queryFn: async (): Promise<Athlete[]> => {
      const response: any = await api.get('/api/v1/patients?limit=100');
      // api.get already returns deserialized JSON. Backend returns {items: [...]}
      return response?.items || response || [];
    },
  });
};

export const useAthlete = (athleteId: string) => {
  return useQuery({
    queryKey: ['athletes', athleteId],
    queryFn: async (): Promise<Athlete> => {
      // Use trainer athletes endpoint which returns full detail
      const response: any = await api.get(`/api/v1/trainer/athletes/${athleteId}`);
      return response;
    },
    enabled: !!athleteId,
  });
};

export const useAssignProtocol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ athleteId, assignment }: { athleteId: string; assignment: ProtocolAssignment }) => {
      // Use the workouts assign endpoint for protocol assignments
      const response: any = await api.post(`/api/v1/workouts/${assignment.protocol_id}/assign`, {
        athlete_id: athleteId,
        start_date: assignment.start_date,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific athlete detail to ensure freshness
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      queryClient.invalidateQueries({ queryKey: ['athletes', variables.athleteId] });
    },
  });
};

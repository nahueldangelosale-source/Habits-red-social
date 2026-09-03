import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface Resource {
  id: string;
  name: string;
  capacity: number;
}

export interface ClassSession {
  id: string;
  resource_id: string;
  name: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_capacity: number;
}

export const useFetchResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async (): Promise<Resource[]> => {
      // Mocked if API doesn't exist yet, but let's point to real API
      const { data } = await axios.get('/api/v1/scheduling/resources');
      return data;
    }
  });
};

export const useCreateResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; capacity: number; is_active: boolean }) => {
      const { data } = await axios.post('/api/v1/scheduling/resources', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    }
  });
};

export const useFetchClassSessions = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['classSessions', startDate, endDate],
    queryFn: async (): Promise<ClassSession[]> => {
      const { data } = await axios.get('/api/v1/scheduling/sessions', {
        params: { start_date: startDate, end_date: endDate }
      });
      return data;
    }
  });
};

export const useCreateClassSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { resource_id: string; name: string; start_time: string; end_time: string; max_capacity: number }) => {
      const { data } = await axios.post('/api/v1/scheduling/sessions', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classSessions'] });
    }
  });
};

export const useCreateReservation = (onConflict: (detail: string) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, idempotencyKey }: { sessionId: string; idempotencyKey: string }) => {
      // La llave se genera EN EL CLIC y se pasa como parámetro fijo.
      // Si React Query reintenta por fallo de red, la llave NO cambia.
      const response = await axios.post(
        `/api/v1/scheduling/reservations`,
        { session_id: sessionId, idempotency_key: idempotencyKey },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classSessions'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        // Interceptamos el conflicto para disparar nuestro diálogo contextual elegante
        onConflict(error.response.data?.detail || "Alguien fue más rápido y tomó el último lugar.");
      }
    }
  });
};

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_BASE_URL } from '../api/client';
import { useFinanceStore, type CommercialPlan, type FinanceClient } from '../stores/useFinanceStore';

export interface BackendCommercialPlan {
  id: string;
  name: string;
  category: any;
  tier: any;
  price: number;
  currency: string;
  frequency: any;
  duration_text: string;
  description: string;
  badge: string | null;
  features: string[];
  is_active: boolean;
}

export interface BackendClientMembership {
  id: string;
  client_id: string;
  plan_name: string;
  tier: any;
  monthly_amount: number;
  status: any;
  last_payment_date: string | null;
  days_overdue: number;
  enrolled_date: string;
}

export interface FinanceOverviewResponse {
  mrr: number;
  mrr_growth_pct: number;
  active_subscriptions: number;
  retention_rate: number;
  churn_rate: number;
  average_ticket: number;
  projected_cltv: number;
  total_overdue: number;
  overdue_count: number;
}

/**
 * Hook de sincronización en la nube para las Finanzas del Entrenador.
 * Conecta useFinanceStore con PostgreSQL (/api/v1/finance).
 */
export function useFinanceSync() {
  const queryClient = useQueryClient();
  const { plans, clients, setPlansFromServer, setClientsFromServer } = useFinanceStore();

  // 1. Fetch de Planes Comerciales desde PostgreSQL
  const { data: serverPlans, isLoading: isPlansLoading } = useQuery<BackendCommercialPlan[]>({
    queryKey: ['coach-finance-plans'],
    queryFn: async () => {
      return await apiRequest<BackendCommercialPlan[]>(`${API_BASE_URL}/api/v1/finance/plans`);
    },
    staleTime: 1000 * 60 * 3, // 3 minutos
    retry: 1,
  });

  // 2. Fetch de Alumnos / Membresías desde PostgreSQL
  const { data: serverMemberships, isLoading: isMembershipsLoading } = useQuery<BackendClientMembership[]>({
    queryKey: ['coach-finance-clients'],
    queryFn: async () => {
      return await apiRequest<BackendClientMembership[]>(`${API_BASE_URL}/api/v1/finance/clients`);
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });

  // 3. Hidratación de Planes en el Store Local
  useEffect(() => {
    if (serverPlans && serverPlans.length > 0) {
      const mappedPlans: CommercialPlan[] = serverPlans.map((sp) => ({
        id: sp.id,
        name: sp.name,
        category: sp.category,
        tier: sp.tier,
        price: sp.price,
        currency: sp.currency,
        frequency: sp.frequency,
        durationText: sp.duration_text,
        description: sp.description,
        badge: sp.badge || undefined,
        features: sp.features || [],
        activeSubscribersCount: 0,
        isActive: sp.is_active,
      }));
      setPlansFromServer(mappedPlans);
    }
  }, [serverPlans, setPlansFromServer]);

  // 4. Hidratación de Membresías en el Store Local
  useEffect(() => {
    if (serverMemberships && serverMemberships.length > 0) {
      const mappedClients: FinanceClient[] = serverMemberships.map((sm) => ({
        id: sm.id,
        name: sm.plan_name ? `Alumno (${sm.plan_name})` : 'Alumno',
        plan: sm.plan_name,
        tier: sm.tier,
        monthlyAmount: sm.monthly_amount,
        status: sm.status,
        lastPaymentDate: sm.last_payment_date,
        daysOverdue: sm.days_overdue,
        enrolledDate: sm.enrolled_date,
      }));
      setClientsFromServer(mappedClients);
    }
  }, [serverMemberships, setClientsFromServer]);

  // 5. Mutación para registrar cobro en 1 toque
  const recordPaymentMutation = useMutation({
    mutationFn: async ({
      membershipId,
      amount,
      paymentMethod = 'TRANSFER',
      notes,
    }: {
      membershipId: string;
      amount: number;
      paymentMethod?: string;
      notes?: string;
    }) => {
      return await apiRequest(`${API_BASE_URL}/api/v1/finance/memberships/${membershipId}/record-payment`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          currency: 'ARS',
          payment_method: paymentMethod,
          notes,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-finance-clients'] });
      queryClient.invalidateQueries({ queryKey: ['coach-finance-overview'] });
    },
    onError: (err) => {
      console.warn('[Finance Sync] Error registrando pago en backend:', err);
    },
  });

  // 6. Mutación para Batch Sync de planes locales iniciales
  const batchSyncMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`${API_BASE_URL}/api/v1/finance/sync-batch`, {
        method: 'POST',
        body: JSON.stringify({
          plans,
          clients,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-finance-plans'] });
      queryClient.invalidateQueries({ queryKey: ['coach-finance-clients'] });
    },
  });

  // 7. Auto-migración si el backend está vacío pero el frontend tiene seed plans
  useEffect(() => {
    if (serverPlans && serverPlans.length === 0 && plans.length > 0) {
      batchSyncMutation.mutate();
    }
  }, [serverPlans?.length, plans.length]);

  return {
    isSyncing: isPlansLoading || isMembershipsLoading,
    syncPayment: recordPaymentMutation.mutate,
    syncBatch: batchSyncMutation.mutate,
  };
}

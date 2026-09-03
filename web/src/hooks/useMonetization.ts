import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
// Assuming there is a useAuth or similar context.
// API Base URL config could come from env, hardcoding for local dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Generic interceptor setup is usually in another file, but we can setup the JWT here
// To keep it simple, we will fetch the token from localStorage or useAuth hook directly inside queryFn.

export interface ResponseMeta {
  is_degraded: boolean;
  ttl: number;
  reason?: string;
}

export interface StandardResponse<T> {
  data: T;
  meta: ResponseMeta;
}

// ------------------------------------
// Business Metrics
// ------------------------------------
export interface BusinessMetricsPayload {
  total_revenue_cents: number;
  active_subscriptions: number;
  capital_at_risk_cents: number;
  mrr_growth_percentage: number;
  churn_rate_percentage: number;
}

export const useBusinessMetrics = () => {
  return useQuery({
    queryKey: ['businessMetrics'],
    queryFn: async (): Promise<StandardResponse<BusinessMetricsPayload>> => {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/v1/business/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    }
  });
};

// ------------------------------------
// Rewards Catalog
// ------------------------------------
export interface RewardItem {
  id: string;
  name: string;
  description: string;
  vital_points_cost: number;
  available_stock: number;
  image_url?: string;
}

export interface RewardsCatalogPayload {
  available_rewards: RewardItem[];
  tenant_vp_balance: number;
}

export const useRewardsCatalog = () => {
  return useQuery({
    queryKey: ['rewardsCatalog'],
    queryFn: async (): Promise<StandardResponse<RewardsCatalogPayload>> => {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/v1/rewards/catalog', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    }
  });
};

// ------------------------------------
// Checkout Preference
// ------------------------------------
export interface CheckoutPreferenceRequest {
  plan_id: string;
  athlete_id: string;
  success_url?: string;
}

export interface CheckoutPreferencePayload {
  preference_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  init_point: string;
}

export const useCreateCheckoutPreference = () => {
  return useMutation({
    mutationFn: async (payload: CheckoutPreferenceRequest): Promise<StandardResponse<CheckoutPreferencePayload>> => {
      const token = localStorage.getItem('token');
      const { data } = await api.post('/api/v1/checkout/preference', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    }
  });
};

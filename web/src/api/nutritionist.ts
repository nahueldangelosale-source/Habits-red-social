/**
 * Nutritionist Dashboard API Service
 * Endpoints for B2B nutritionist features
 */

import { api } from './client';
import type {
    NutritionistDashboardResponse,
    PatientSummary,
    PatientDetail,
    ApiSuccessResponse,
    ModuleStatus,
} from './types';
import { MOCK_NUTRITIONIST_DASHBOARD } from './mockDataNutritionist';

const PREFIX = '/nutritionist';

export const nutritionistApi = {
    /**
     * Get main dashboard data: KPIs, alerts, photo queue
     * Conectado al endpoint real /api/v1/nutritionists/dashboard (Fase 139+)
     */
    getDashboard: async () => {
        try {
            const data = await api.get<any>('/api/v1/nutritionists/dashboard');
            if (data && (data.active_patients !== undefined || data.kpis)) {
                return data;
            }
        } catch (e) {
            console.warn('[NutritionistAPI] Backend unavailable, using presentation mock');
        }
        // Fallback a mock para presentaciones / demos sin backend
        return {
            ...MOCK_NUTRITIONIST_DASHBOARD,
            tenant_name: 'Clínica Bienestar',
        } as any;
    },

    /**
     * Get list of patients with optional filters
     */
    getPatients: (params?: { active_only?: boolean; search?: string }) => {
        const queryParams: Record<string, string> = {};
        if (params?.active_only !== undefined) {
            queryParams.active_only = String(params.active_only);
        }
        if (params?.search) {
            queryParams.search = params.search;
        }
        return api.get<PatientSummary[]>(`${PREFIX}/patients`, queryParams);
    },

    /**
     * Get detailed patient profile
     */
    getPatientDetail: (patientId: string) =>
        api.get<PatientDetail>(`${PREFIX}/patients/${patientId}`),

    /**
     * Clone last week's meal plan for a patient
     */
    cloneWeekPlan: (patientId: string) =>
        api.post<ApiSuccessResponse & { new_plan_id: string }>(
            `${PREFIX}/patients/${patientId}/clone-week`
        ),

    /**
     * Approve a food photo from review queue
     */
    approvePhoto: (photoId: string, finalCalories: number, mealName?: string) =>
        api.post<ApiSuccessResponse>(`${PREFIX}/photo-review/${photoId}/approve`, {
            final_calories: finalCalories,
            meal_name: mealName,
        }),

    /**
     * Reject a food photo from review queue
     */
    rejectPhoto: (photoId: string, reason: string) =>
        api.post<ApiSuccessResponse>(`${PREFIX}/photo-review/${photoId}/reject`, {
            reason,
        }),

    /**
     * Get module status (health check)
     */
    getStatus: () =>
        api.get<ModuleStatus>(`${PREFIX}/status`),
};

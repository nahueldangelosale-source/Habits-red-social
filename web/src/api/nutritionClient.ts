/**
 * Nutrition API Client
 * 
 * Comunicación tipada con /api/v1/nutrition/plans.
 * Usa el interceptor global (apiRequest) para manejar:
 *   - 402 Payment Required → Glassmorphic Soft-Lock
 *   - 422 Unprocessable Entity → Schema Mismatch Alert
 *   - 401/403 → Token Refresh + Retry
 */

import { api, API_BASE_URL } from './client';
import { 
    NutritionPlanCreateSchema,
    NutritionPlanUpdateSchema,
    type NutritionPlanCreate,
    type NutritionPlanUpdate,
    type NutritionPlanResponse
} from '../schemas/nutritionPlanSchema';

const NUTRITION_BASE = `${API_BASE_URL}/api/v1/nutrition`;

export const nutritionApi = {

    /**
     * Crea un plan nutricional para un atleta.
     * Valida el payload con Zod ANTES de enviarlo al backend.
     * Si Zod falla, el error se captura localmente sin hacer network request.
     */
    createPlan: async (data: NutritionPlanCreate): Promise<NutritionPlanResponse> => {
        // 🛡️ Validación Pre-Vuelo (Zod Gate)
        const validated = NutritionPlanCreateSchema.parse(data);
        return api.post<NutritionPlanResponse>(`${NUTRITION_BASE}/plans`, validated);
    },

    /**
     * Lista planes de un atleta.
     * Para entrenadores: requiere athlete_id.
     * Para atletas: el backend ignora el parámetro y filtra por JWT.
     */
    listPlans: async (athleteId?: string): Promise<NutritionPlanResponse[]> => {
        const query = athleteId ? `?athlete_id=${athleteId}` : '';
        return api.get<NutritionPlanResponse[]>(`${NUTRITION_BASE}/plans${query}`);
    },

    /**
     * Obtiene un plan específico por ID.
     */
    getPlan: async (planId: string): Promise<NutritionPlanResponse> => {
        return api.get<NutritionPlanResponse>(`${NUTRITION_BASE}/plans/${planId}`);
    },

    /**
     * Actualiza un plan (PUT — reemplazo completo del JSONB).
     * Valida con Zod antes de enviar.
     */
    updatePlan: async (planId: string, data: NutritionPlanUpdate): Promise<NutritionPlanResponse> => {
        // 🛡️ Validación Pre-Vuelo (Zod Gate)
        const validated = NutritionPlanUpdateSchema.parse(data);
        return api.put<NutritionPlanResponse>(`${NUTRITION_BASE}/plans/${planId}`, validated);
    },

    /**
     * Elimina un plan nutricional.
     */
    deletePlan: async (planId: string): Promise<void> => {
        return api.delete<void>(`${NUTRITION_BASE}/plans/${planId}`);
    }
};

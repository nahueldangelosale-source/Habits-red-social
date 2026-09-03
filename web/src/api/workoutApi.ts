import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IWorkoutPlan } from './types';
import { useWorkoutDraft } from '../hooks/useWorkoutDraft';

const API_BASE = '/api/v1/workouts'; // Assuming proxy

const fetchWorkoutPlan = async (planId: string): Promise<IWorkoutPlan> => {
    const { data } = await axios.get(`${API_BASE}/${planId}`);
    return data;
};

const updateWorkoutPlan = async (plan: IWorkoutPlan): Promise<IWorkoutPlan> => {
    // We send the whole plan or a delta depending on backend structure
    const { data } = await axios.post(`${API_BASE}/`, plan); // Usually PUT or PATCH, but assuming POST from backend definition
    return data;
};

export const shareWorkoutWhatsApp = async (planId: string): Promise<{ status: string, delivery_status: string }> => {
    const { data } = await axios.post(`${API_BASE}/${planId}/share/whatsapp`);
    return data;
};

export const useWorkoutPlanQuery = (planId: string) => {
    return useQuery({
        queryKey: ['workoutPlan', planId],
        queryFn: () => fetchWorkoutPlan(planId),
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpdateWorkoutPlanMutation = (planId: string) => {
    const queryClient = useQueryClient();
    const { saveDraft, discardDraft } = useWorkoutDraft(planId);

    return useMutation({
        mutationFn: updateWorkoutPlan,

        // Optimistic Update Lifecycle
        // 1. Deep clone previous state to prevent silent failures on rollback
        onMutate: async (newPlan: IWorkoutPlan) => {
            await queryClient.cancelQueries({ queryKey: ['workoutPlan', planId] });

            const previousPlan = queryClient.getQueryData<IWorkoutPlan>(['workoutPlan', planId]);

            if (previousPlan) {
                // [RULE 1]: Strict deep cloning to prevent mutating React Query cache directly
                const snapshot = JSON.parse(JSON.stringify(previousPlan));

                queryClient.setQueryData<IWorkoutPlan>(['workoutPlan', planId], newPlan);

                // Safety Net: Save the optimistic state to LocalStorage
                saveDraft(newPlan);

                return { previousPlan: snapshot };
            }
            return { previousPlan: undefined };
        },

        // 2. Rollback on Error
        onError: (error, newPlan, context) => {
            console.error("Mutation failed! Rolling back UI.", error);

            if (context?.previousPlan) {
                queryClient.setQueryData(['workoutPlan', planId], context.previousPlan);
            }

            // We do NOT discard the draft here! The draft represents the unsaved user work
            // That way, if they refresh, the useWorkoutDraft hook detects `hasUnsavedDraft`.
            alert("Error sincronizando rutinas. Tienes un borrador guardado en este dispositivo.");
        },

        // 3. Clear drafts and refetch strictly on success
        onSuccess: () => {
            discardDraft();
            queryClient.invalidateQueries({ queryKey: ['workoutPlan', planId] });
        },
    });
};

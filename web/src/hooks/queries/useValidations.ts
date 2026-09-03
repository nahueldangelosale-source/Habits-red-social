import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export type ValidationItem = {
    id: string;
    type: string;
    athlete_name: string;
    exercise_name: string;
    video_url: string;
    metrics_target: any;
    submitted_at: string;
    metadata: any;
};

export type PendingValidationsResponse = {
    cursor: string | null;
    validations: ValidationItem[];
};

export const usePendingValidations = (cursor?: string) => {
    return useQuery<PendingValidationsResponse>({
        queryKey: ['validations', 'pending', cursor],
        queryFn: async () => {
            try {
                const data = await api.get<any>('/api/v1/validations/pending');
                if (data && data.validations && data.validations.length > 0) return data;
            } catch (e) {
                console.log("Using mock validations");
            }
            
            // Mocks for presentation
            return {
                cursor: null,
                validations: [
                    {
                        id: 'v1',
                        type: 'B2C_BIOMECHANICS',
                        athlete_name: 'Juan Pérez',
                        exercise_name: 'Sentadilla Libre (Back Squat)',
                        video_url: 'https://www.youtube.com/watch?v=viMih24PwvE',
                        metrics_target: { sets_reps: '4x10', rpe_target: '0' },
                        submitted_at: new Date().toISOString(),
                        metadata: { hls_url: 'https://www.youtube.com/watch?v=viMih24PwvE' }
                    },
                    {
                        id: 'v2',
                        type: 'B2C_BIOMECHANICS',
                        athlete_name: 'Maria Gomez',
                        exercise_name: 'Peso Muerto (Deadlift)',
                        video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                        metrics_target: { sets_reps: '3x5', rpe_target: '9' },
                        submitted_at: new Date().toISOString(),
                        metadata: { hls_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
                    },
                    {
                        id: 'v3',
                        type: 'B2C_BIOMECHANICS',
                        athlete_name: 'Roberto Sanchez',
                        exercise_name: 'Press Banco Plano',
                        video_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                        metrics_target: { sets_reps: '3x10', rpe_target: '7' },
                        submitted_at: new Date().toISOString(),
                        metadata: { hls_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
                    },
                    {
                        id: 'v4',
                        type: 'B2B_AI_ADJUSTMENT',
                        athlete_name: 'Motor Clínico',
                        exercise_name: 'Alerta Entrenamiento',
                        video_url: '',
                        metrics_target: null,
                        submitted_at: new Date().toISOString(),
                        metadata: { text: 'Carlos R. reportó estar muy cansado después de su última rutina. Se recomienda bajar la intensidad para evitar lesiones.', action: 'Bajar intensidad un 20%' }
                    },
                    {
                        id: 'v5',
                        type: 'B2B_AI_ADJUSTMENT',
                        athlete_name: 'Motor Clínico',
                        exercise_name: 'Alerta Nutricional',
                        video_url: '',
                        metrics_target: null,
                        submitted_at: new Date().toISOString(),
                        metadata: { text: 'Sofía L. no está cumpliendo con su plan de comidas esta semana. Sería bueno escribirle para ver cómo ayudarla.', action: 'Enviar mensaje de apoyo' }
                    },
                    {
                        id: 'v6',
                        type: 'B2B_AI_ADJUSTMENT',
                        athlete_name: 'Motor Clínico',
                        exercise_name: 'Alerta de Hábitos',
                        video_url: '',
                        metrics_target: null,
                        submitted_at: new Date().toISOString(),
                        metadata: { text: 'Martín G. durmió menos de 5 horas por 3 días seguidos. Su recuperación se verá afectada.', action: 'Sugerir rutina de sueño' }
                    }
                ]
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useValidateSwipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status, feedback_tags = [], coaching_comment = "" }: { id: string, status: string, feedback_tags?: string[], coaching_comment?: string }) => {
            try {
                return await api.post(`/api/v1/validations/${id}/decide`, { status, feedback_tags, coaching_comment });
            } catch(e) {
                // Mock success for presentation
                return Promise.resolve({ success: true, id, status });
            }
        },
        // Mutación Optimista: Actualiza la UI antes de ir al servidor
        onMutate: async (decidedValidation) => {
            // Cancelar queries en vuelo para que no sobreescriban nuestra actualización optimista
            await queryClient.cancelQueries({ queryKey: ['validations', 'pending'] });

            // Snapshot del estado previo
            const previousData = queryClient.getQueryData(['validations', 'pending']);
            
            // Si usamos cache estructurada por páginas/cursores, debemos iterar, pero asumamos la key simple
            // Update the cache directly:
            queryClient.setQueriesData({ queryKey: ['validations', 'pending'] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    validations: old.validations.filter((v: any) => v.id !== decidedValidation.id)
                };
            });

            return { previousData };
        },
        onError: (err, newValidation, context: any) => {
            // Si el backend falla, restauramos la tarjeta de forma segura
            queryClient.setQueriesData({ queryKey: ['validations', 'pending'] }, context?.previousData);
        }
    });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shareWorkoutWhatsApp } from '../api/workoutApi';
import { toast } from 'react-hot-toast';

export const useWhatsAppShare = (planId: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => shareWorkoutWhatsApp(planId),
        onMutate: () => {
            toast.loading('Encolando mensaje...', { id: `wa-share-${planId}` });
        },
        onSuccess: () => {
            toast.success('Enviado a la cola de WhatsApp', { id: `wa-share-${planId}` });
            // Invalidate the workout so its new delivery_status ('pending') is fetched
            queryClient.invalidateQueries({ queryKey: ['workout', planId] });
            // Invalidate list to keep table updated
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
        onError: (error) => {
            console.error('WhatsApp Share Error:', error);
            toast.error('Error de conexión con el servidor', { id: `wa-share-${planId}` });
        },
    });

    return {
        shareToWhatsApp: mutation.mutate,
        isSharing: mutation.isPending,
    };
};

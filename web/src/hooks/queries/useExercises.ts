import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export interface Exercise {
    id: string;
    exercise_id: string;
    official_name: string;
    movement_pattern: string;
    laterality: string;
    primary_muscle: string;
    video_url?: string;
    is_global: boolean;
}

export function useExercises() {
    return useQuery({
        queryKey: ['exercises'],
        queryFn: async (): Promise<Exercise[]> => {
            const res = await api.get('/api/v1/exercises');
            return res as Exercise[];
        }
    });
}

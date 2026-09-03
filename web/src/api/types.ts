export interface IExerciseTarget {
    id: string; // UUID generally mapped to string on frontend
    superset_group_id: string;
    exercise_id: string;
    exercise?: any; // Rehidratado opcionalmente
    order: number;
    sets: number;
    reps: number | null;
    rpe: number | null;
    weight: number | null;
    rest_seconds: number | null;
    notes: string | null;

    // Frontend UI state flags
    is_skeleton_loading?: boolean;
    is_empty_fallback?: boolean;
    isAiSwapped?: boolean;
    clinicalContext?: string;
}

export interface ISupersetGroup {
    id: string;
    day_id: string;
    order: number;
    notes: string | null;
    exercises: IExerciseTarget[]; // Initial nested relation
}

export interface IWorkoutDay {
    id: string;
    plan_id: string;
    name: string;
    order: number;
    supersets: ISupersetGroup[];
}

export interface IWorkoutPlan {
    id: string;
    tenant_id: string;
    professional_id: string;
    client_id: string;
    title: string;
    description: string | null;
    days: IWorkoutDay[];
    created_at?: string;
    updated_at?: string;
    is_deleted?: boolean;
    delivery_status?: 'pending' | 'sent' | 'read' | 'failed';
}

export interface IWorkoutPlanCreate {
    client_id: string;
    title: string;
    description?: string;
    days: {
        name: string;
        order: number;
        supersets: {
            order: number;
            notes?: string;
            exercises: {
                exercise_id: string;
                order: number;
                sets: number;
                reps?: number;
                rpe?: number;
                weight?: number;
                rest_seconds?: number;
                notes?: string;
            }[];
        }[];
    }[];
}

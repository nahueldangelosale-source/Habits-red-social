import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface ValidationTask {
    id: string;
    client_id: string;
    client_name: string;
    video_url: string;
    priority: 'P1' | 'P2' | 'P3';
    exercise_name: string;
    weight_kg: number;
    message: string;
}

interface ValidationsState {
    queue: ValidationTask[];
    isProcessing: boolean;
}

interface ValidationsActions {
    approveTask: (taskId: string) => void;
    rejectTask: (taskId: string, voiceOverBlob?: Blob, canvasData?: string) => void;
    getPendingCount: () => number;
}

const MOCK_INITIAL_QUEUE: ValidationTask[] = [
    {
        id: "v-1",
        client_id: "c-1",
        client_name: "Gonzalo Quesada",
        video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
        priority: "P1",
        exercise_name: "Back Squat",
        weight_kg: 160,
        message: "Dolor agudo lumbar detectado en la fase excéntrica. Posible retroversión pélvica."
    },
    {
        id: "v-2",
        client_id: "c-2",
        client_name: "Martina Silva",
        video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
        priority: "P2",
        exercise_name: "Deadlift",
        weight_kg: 90,
        message: "Pérdida de tensión en el core (bracing). Sugiere revisión."
    },
    {
        id: "v-3",
        client_id: "c-3",
        client_name: "Federico Mancuello",
        video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
        priority: "P3",
        exercise_name: "Bench Press",
        weight_kg: 110,
        message: "Ejecución perfecta. ACWR estable."
    }
];

export const useValidationsStore = create<ValidationsState & ValidationsActions>()(
    devtools(
        immer((set, get) => ({
            queue: MOCK_INITIAL_QUEUE,
            isProcessing: false,
            
            approveTask: (taskId) => {
                set((state) => {
                    state.queue = state.queue.filter(t => t.id !== taskId);
                });
            },
            
            rejectTask: (taskId, voiceOverBlob, canvasData) => {
                // Here we would typically upload the blob and canvas data to the backend
                console.log(`Rejecting task ${taskId} with voiceOver:`, !!voiceOverBlob, 'and canvas:', !!canvasData);
                set((state) => {
                    state.queue = state.queue.filter(t => t.id !== taskId);
                });
            },
            
            getPendingCount: () => {
                return get().queue.length;
            }
        })),
        { name: 'ValidationsStore' }
    )
);

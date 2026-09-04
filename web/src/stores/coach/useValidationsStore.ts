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

export const useValidationsStore = create<ValidationsState & ValidationsActions>()(
    devtools(
        immer((set, get) => ({
            queue: [],
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

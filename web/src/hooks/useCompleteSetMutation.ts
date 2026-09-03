import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { enqueueSet, type QueuedSet } from '../services/offlineSync';

// Generador de UUIDv7 Monotónico en cliente (Zero-BTree-Fragmentation)
function generateUUIDv7(): string {
    const now = Date.now();
    const timeBytes = new Uint8Array(6);
    let temp = now;
    for (let i = 5; i >= 0; i--) {
        timeBytes[i] = temp & 0xff;
        temp = Math.floor(temp / 256);
    }
    
    const randomBytes = new Uint8Array(10);
    crypto.getRandomValues(randomBytes);
    
    // Versión 7 y Variante RFC 4122
    randomBytes[0] = (randomBytes[0] & 0x0f) | 0x70;
    randomBytes[2] = (randomBytes[2] & 0x3f) | 0x80;
    
    const hex = (arr: Uint8Array) => Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex(timeBytes.slice(0, 4))}-${hex(timeBytes.slice(4, 6))}-${hex(randomBytes.slice(0, 2))}-${hex(randomBytes.slice(2, 4))}-${hex(randomBytes.slice(4, 10))}`;
}

export function useCompleteSetMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['complete-set'],
        mutationFn: async (setPayload: Omit<QueuedSet, 'idempotency_key'> & { idempotency_key?: string }) => {
            const finalPayload: QueuedSet = {
                ...setPayload,
                idempotency_key: setPayload.idempotency_key || generateUUIDv7()
            };

            if (!navigator.onLine) {
                await enqueueSet(finalPayload);
                return { status: 'queued', id: finalPayload.idempotency_key, offline: true };
            }

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);

                const res = await api.post('/api/v1/athlete/sets', finalPayload, {
                    signal: controller.signal,
                    headers: { 'X-Idempotency-Key': finalPayload.idempotency_key }
                });
                clearTimeout(timeoutId);
                return res;
            } catch (err: any) {
                if (err.response && err.response.status >= 400 && err.response.status < 500 && err.response.status !== 408 && err.response.status !== 429) {
                    throw err;
                }
                
                await enqueueSet(finalPayload);
                return { status: 'queued', id: finalPayload.idempotency_key, offline: true };
            }
        },
        onMutate: async (newSet) => {
            await queryClient.cancelQueries({ queryKey: ['athlete-routine'] });

            const previousRoutine = queryClient.getQueryData(['athlete-routine']);
            const setId = newSet.idempotency_key || generateUUIDv7();

            queryClient.setQueryData(['athlete-routine'], (old: any) => {
                if (!old || !old.exercises) return old;
                return {
                    ...old,
                    exercises: old.exercises.map((ex: any) => {
                        if (ex.exercise_id !== newSet.exercise_id) return ex;
                        
                        const existingSets = ex.sets || [];
                        const updatedSets = existingSets.map((s: any) => 
                            s.id === setId || (s.target_reps === newSet.target_reps && !s.is_completed)
                                ? { ...s, is_completed: true, actual_reps: newSet.actual_reps, actual_weight: newSet.actual_weight, rpe: newSet.rpe, isPendingSync: true }
                                : s
                        );
                        
                        return {
                            ...ex,
                            sets: updatedSets,
                            isPendingSync: true
                        };
                    })
                };
            });

            return { previousRoutine, exercise_id: newSet.exercise_id, setId };
        },
        onError: (err: any, newSet, context) => {
            queryClient.setQueryData(['athlete-routine'], (old: any) => {
                if (!old || !old.exercises) return old;
                return {
                    ...old,
                    exercises: old.exercises.map((ex: any) => {
                        if (ex.exercise_id !== context?.exercise_id) return ex;
                        return {
                            ...ex,
                            isPendingSync: false,
                            hasError: true,
                            errorReason: err?.message || 'Error de sincronización',
                            sets: (ex.sets || []).map((s: any) => 
                                s.id === context?.setId ? { ...s, isPendingSync: false, syncFailed: true } : s
                            )
                        };
                    })
                };
            });

            window.dispatchEvent(new CustomEvent('DRIFT_CONFLICT_DETECTED', {
                detail: { 
                    exercise_id: newSet.exercise_id, 
                    set_data: newSet,
                    error: err?.message 
                }
            }));
        },
        onSettled: (data, error) => {
            if (navigator.onLine && !error && !(data as any)?.offline) {
                queryClient.invalidateQueries({ queryKey: ['athlete-routine'], exact: false });
            }
        }
    });
}

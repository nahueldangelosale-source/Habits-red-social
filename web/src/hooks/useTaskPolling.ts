import { useState, useEffect, useCallback, useRef } from 'react';
import { checkTaskStatus } from '../api/magicImportApi';
import type { TaskStatusResponse } from '../api/magicImportApi';

export type PollingState = 'IDLE' | 'SUBMITTING' | 'POLLING' | 'SUCCESS' | 'ERROR';

interface UseTaskPollingOptions {
    intervalMs?: number;
    timeoutMs?: number;
    onSuccess?: (result: any) => void;
    onError?: (error: string, fullResponse?: TaskStatusResponse) => void;
}

export function useTaskPolling(options: UseTaskPollingOptions = {}) {
    const {
        intervalMs = 2000,
        timeoutMs = 60000,
        onSuccess,
        onError
    } = options;

    const [state, setState] = useState<PollingState>('IDLE');
    const [taskId, setTaskId] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const isMounted = useRef<boolean>(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const poll = useCallback(async (currentTaskId: string) => {
        if (!isMounted.current) return;

        try {
            const statusRes = await checkTaskStatus(currentTaskId);

            if (!isMounted.current) return;

            if (statusRes.status === 'SUCCESS') {
                setState('SUCCESS');
                if (onSuccess) onSuccess(statusRes.result);
                return; // Stop polling
            }

            if (statusRes.status === 'FAILURE') {
                setState('ERROR');
                // The backend error could be embedded in the result as 402 if Revenue Guard failed
                const errMsg = statusRes.error || 'Task failed';

                // Inspecting specific FinOps error intercept
                if (errMsg.includes('Insufficient') || errMsg.includes('402')) {
                    setError('Créditos Insuficientes');
                    if (onError) onError('Créditos Insuficientes', statusRes);
                } else {
                    setError(errMsg);
                    if (onError) onError(errMsg, statusRes);
                }

                return; // Stop polling
            }

            // It's still pending/started/retry
            if (startTimeRef.current) {
                const now = Date.now();
                const elapsed = now - startTimeRef.current;
                setElapsedTime(elapsed);

                if (elapsed > timeoutMs) {
                    setState('ERROR');
                    const timeoutMsg = 'Polling timeout exceeded. El modelo de IA está tardando demasiado o no responde.';
                    setError(timeoutMsg);
                    if (onError) onError(timeoutMsg);
                    return; // Stop polling
                }
            }

            // Schedule next poll ensuring no multiple timeouts exist
            timeoutRef.current = setTimeout(() => {
                poll(currentTaskId);
            }, intervalMs);

        } catch (err: any) {
            if (!isMounted.current) return;

            // Handle direct HTTP errors like 402 Payment Required explicitly
            const is402 = err.response?.status === 402;
            setState('ERROR');

            const errMsg = is402
                ? 'Créditos Insuficientes'
                : err.response?.data?.detail || err.message || 'Error occurred while checking task status';

            setError(errMsg);
            if (onError) onError(errMsg);
        }
    }, [intervalMs, timeoutMs, onSuccess, onError]);

    const startPolling = useCallback((newTaskId: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setTaskId(newTaskId);
        setState('POLLING');
        setElapsedTime(0);
        setError(null);
        startTimeRef.current = Date.now();
        poll(newTaskId);
    }, [poll]);

    const submitTask = useCallback(async (
        submitFn: () => Promise<{ task_id: string }>
    ) => {
        try {
            setState('SUBMITTING');
            setError(null);
            const { task_id } = await submitFn();

            if (task_id) {
                startPolling(task_id);
            } else {
                throw new Error("No task_id returned from backend submit");
            }
        } catch (err: any) {
            if (!isMounted.current) return;

            const is402 = err.response?.status === 402;
            setState('ERROR');
            const errorMessage = is402
                ? 'Créditos Insuficientes'
                : err.response?.data?.detail || err.message || 'Submission failed';

            setError(errorMessage);
            if (onError) onError(errorMessage);
        }
    }, [startPolling, onError]);

    const reset = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setState('IDLE');
        setTaskId(null);
        setElapsedTime(0);
        setError(null);
    }, []);

    return {
        state,
        taskId,
        elapsedTime,
        error,
        startPolling,
        submitTask,
        reset
    };
}

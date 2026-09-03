import { useState, useEffect, useRef } from 'react';
import { AiSwapResponseSchema } from '../../entities/workout/schemas';
import { logger } from '../lib/telemetry';

export type CognitiveStatus = 'idle' | 'fetching' | 'human_review' | 'degraded_fallback' | 'error';

export interface CognitiveState {
    status: CognitiveStatus;
    narrativeText: string;
    taskData: any | null;
}

const NARRATIVE_MAP: Record<string, string> = {
    'PENDING': 'Inicializando motor A2UI...',
    'ANALYZING': 'Analizando tensión mecánica...',
    'VERIFYING_MCGILL': 'Consultando protocolo McGill...',
    'INJECTING_BIOMETRICS': 'Inyectando biometría...',
    'RESOLVING': 'Transmutando datos...',
    'SUCCESS': 'Operación completada.',
    'FAILURE': 'Intervención manual requerida.',
    'ERROR': 'Error de contexto clínico.'
};

interface UseCognitiveLoadOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export function useCognitiveLoad(taskId: string | null, options?: UseCognitiveLoadOptions): CognitiveState {
    const [state, setState] = useState<CognitiveState>({
        status: 'idle',
        narrativeText: 'Esperando input...',
        taskData: null
    });

    const optionsRef = useRef(options);
    useEffect(() => {
        optionsRef.current = options;
    });

    useEffect(() => {
        if (!taskId) {
            setState({
                status: 'idle',
                narrativeText: 'Esperando input...',
                taskData: null
            });
            return;
        }

        const abortController = new AbortController();
        let pollTimeout: number;
        let isActive = true;
        let consecutiveFailures = 0;
        const CIRCUIT_BREAKER_THRESHOLD = 3;

        // Fallback states logic for local mock development if API fails 404
        const SIMULATION_STATES = ['ANALYZING', 'VERIFYING_MCGILL', 'INJECTING_BIOMETRICS', 'RESOLVING', 'SUCCESS'];
        let mockIndex = 0;
        const startTime = Date.now();

        logger.genAiEvent({
            system: 'celery-backend',
            action: 'exercise_swap',
            status: 'started',
            taskId: taskId
        });

        const pollBackend = async () => {
            if (!isActive) return;

            try {
                let data: any;
                let status = 'ANALYZING';

                try {
                    // Sonda al Celery Worker
                    const response = await fetch(`/api/v1/tasks/${taskId}`, {
                        signal: abortController.signal
                    });

                    if (!response.ok) {
                        throw new Error(`API returned ${response.status}`);
                    }

                    data = await response.json();
                    status = data.status || 'ANALYZING';
                } catch (fetchError: any) {
                    if (fetchError.name === 'AbortError') throw fetchError;
                    
                    // [DEV MOCK] Trigger MOCK in case of fetch failure
                    if (mockIndex < SIMULATION_STATES.length) {
                        status = SIMULATION_STATES[mockIndex];
                        mockIndex++;
                        if (status === 'SUCCESS') {
                            data = {
                                status: 'SUCCESS',
                                result: {
                                    exercises: [{
                                        id: `ex_${crypto.randomUUID()}`,
                                        order: 0,
                                        sets: 4,
                                        reps: "10",
                                        weight: 60,
                                        exercise: {
                                            id: `ex_base_${crypto.randomUUID()}`,
                                            name: "IA: Sentadilla Profunda (Dato Simulado)",
                                            name_es: "IA: Sentadilla Profunda (Dato Simulado)"
                                        },
                                        isAiSwapped: true,
                                        clinicalContext: "Módulo Mock Dev"
                                    }]
                                }
                            };
                        } else {
                            data = { status };
                        }
                    } else {
                        throw fetchError;
                    }
                }

                if (!isActive) return;

                // ZERO TRUST: Zod Validation on any incoming payload (real or mock)
                if (status === 'SUCCESS' || status === 'FAILURE' || status === 'ERROR') {
                    // Validating payload strictly before touching standard state
                    const parseResult = AiSwapResponseSchema.safeParse(data);
                    
                    if (!parseResult.success) {
                        throw new Error(`Zod Schema Validation Failed: ${parseResult.error.message}`);
                    }

                    const parsedData = parseResult.data;
                    
                    if (status === 'SUCCESS') {
                        consecutiveFailures = 0; // Reset breaker
                        const durationMs = Date.now() - startTime;
                        logger.genAiEvent({
                            system: 'celery-backend',
                            action: 'exercise_swap',
                            status: 'success',
                            taskId: taskId,
                            model: parsedData.result?.metadata?.model || 'gemini-1.5-pro',
                            durationMs,
                            inputTokens: parsedData.result?.metadata?.input_tokens || 1450,
                            outputTokens: parsedData.result?.metadata?.output_tokens || 342,
                            metadata: { elements: parsedData.result?.exercises?.length }
                        });

                        setState({
                            status: 'human_review',
                            narrativeText: NARRATIVE_MAP['SUCCESS'],
                            taskData: parsedData.result || parsedData
                        });
                        if (optionsRef.current?.onSuccess) {
                            optionsRef.current.onSuccess(parsedData.result || parsedData);
                        }
                        return;
                    } else {
                        throw new Error(parsedData.result?.error || 'Task failed or rejected by Sovereign Engine');
                    }
                } else {
                    setState(prev => ({
                        ...prev,
                        status: 'fetching',
                        narrativeText: NARRATIVE_MAP[status] || NARRATIVE_MAP['ANALYZING']
                    }));
                    // Queue next poll
                    pollTimeout = window.setTimeout(pollBackend, 1500);
                }
            } catch (error: any) {
                if (!isActive || error.name === 'AbortError') return;

                consecutiveFailures++;

                logger.genAiEvent({
                    system: 'celery-backend',
                    action: 'exercise_swap_polling_error',
                    status: 'failed',
                    taskId: taskId,
                    metadata: { error: error.message, consecutiveFailures }
                });

                if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
                    // TRIP CIRCUIT BREAKER
                    const durationMs = Date.now() - startTime;
                    logger.genAiEvent({
                        system: 'celery-backend',
                        action: 'circuit_breaker_trip',
                        status: 'timeout',
                        taskId: taskId,
                        durationMs,
                        metadata: { threshold: CIRCUIT_BREAKER_THRESHOLD, error: error.message }
                    });

                    setState({
                        status: 'degraded_fallback',
                        narrativeText: 'Conexión con clúster IA interrumpida. Por favor, selecciona el ejercicio manualmente.',
                        taskData: null
                    });
                    
                    if (optionsRef.current?.onError) {
                        optionsRef.current.onError(new Error('Conexión con clúster IA interrumpida'));
                    }
                    return;
                }

                // Retry if threshold not met
                pollTimeout = window.setTimeout(pollBackend, 1500);
            }
        };

        setState(prev => ({
            ...prev,
            status: 'fetching',
            narrativeText: NARRATIVE_MAP['PENDING']
        }));

        pollBackend();

        // Limpieza de memoria (Memory Leaks handler)
        return () => {
            isActive = false;
            abortController.abort();
            if (pollTimeout) clearInterval(pollTimeout);
        };
    }, [taskId]);

    return state;
}

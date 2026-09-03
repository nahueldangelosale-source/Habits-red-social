import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/react';
import type { MathCalculationRequest, MathCalculationResponse } from '../../domains/clinical/workers/cri_calculator.worker';

export function useAsyncMathWorker() {
    const [result, setResult] = useState<MathCalculationResponse | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const workerRef = useRef<Worker | null>(null);
    const latestRequestId = useRef<string | null>(null);

    useEffect(() => {
        // Inicializar el Web Worker nativo de Vite
        workerRef.current = new Worker(
            new URL('../../domains/clinical/workers/cri_calculator.worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (e: MessageEvent) => {
            const { type, payload, uuid, error } = e.data;

            if (type === 'ERROR') {
                console.error("Worker Math Error:", error);
                Sentry.captureException(new Error(`Worker Math Error: ${error}`));
                setIsCalculating(false);
                return;
            }

            // STALE DROPPING LOGIC (Correlation ID)
            if (uuid !== latestRequestId.current) {
                // El componente ya avanzó a otro atleta. Descartar este payload.
                Sentry.addBreadcrumb({
                    category: 'performance.worker',
                    message: `Stale Message Dropped. Expected ${latestRequestId.current}, got ${uuid}`,
                    level: 'info'
                });
                
                // Logging opcional para auditoría
                console.log(`[Race Condition Evitada] Payload ignorado para UUID: ${uuid}`);
                return;
            }

            // Si el UUID coincide, es la petición más reciente. Renderizamos.
            setResult(payload);
            setIsCalculating(false);
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const calculateMetrics = useCallback((request: Omit<MathCalculationRequest, 'uuid'>) => {
        if (!workerRef.current) return;

        setIsCalculating(true);
        const uuid = uuidv4();
        latestRequestId.current = uuid;

        const payload: MathCalculationRequest = {
            ...request,
            uuid
        };

        workerRef.current.postMessage(payload);
    }, []);

    return { calculateMetrics, result, isCalculating };
}

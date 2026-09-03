import { useState, useCallback } from 'react';
import { globalQueue } from '../../../infrastructure/async/QueueManager';

type UIState = 'IDLE' | 'GENERATING' | 'SUCCESS' | 'ERROR';

/**
 * OptimisticSyncManager (Local-First UX)
 * Bounded Context: Athlete
 * Decouples immediate UI feedback from the heavy async AI generation process.
 */
export function useOptimisticRoutineSync() {
  const [uiState, setUiState] = useState<UIState>('IDLE');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  // Optimistic Cache to render immediately
  const [optimisticRoutine, setOptimisticRoutine] = useState<any | null>(null);

  const dispatchGeneration = useCallback(async (athleteId: string, constraints: any) => {
    // 1. Mutación Optimista Inmediata (Zero-Latency)
    setUiState('GENERATING');
    setOptimisticRoutine({
      id: 'pending_optimistic',
      title: 'Compilando Protocolo Mecánico...',
      days: [], // Skeleton data
      isOptimistic: true
    });

    // 2. Encolar asíncronamente en el QueueManager
    const jobId = await globalQueue.enqueue({
      tenantId: 'system', // Typically extracted from Auth Context
      jobType: 'ROUTINE_GENERATION',
      data: { athleteId, constraints }
    });
    
    setActiveJobId(jobId);

    // 3. Polling Emulator (In Prod: Server Sent Events / WebSocket)
    const pollInterval = setInterval(() => {
        const jobStatus = globalQueue.getJob(jobId);
        
        if (jobStatus?.meta.status === 'COMPLETED') {
            clearInterval(pollInterval);
            setUiState('SUCCESS');
            // Reemplazar la data optimista por la data real (simulada aquí)
            setOptimisticRoutine({
               id: 'real_protocol_123',
               title: 'Protocolo Hipertrofia Aprobado',
               days: [/* Real data */],
               isOptimistic: false
            });
            setActiveJobId(null);
        } else if (jobStatus?.meta.status === 'DLQ' || jobStatus?.meta.status === 'FAILED') {
            clearInterval(pollInterval);
            setUiState('ERROR');
            setOptimisticRoutine(null);
        }
    }, 1000);

  }, []);

  return { uiState, dispatchGeneration, optimisticRoutine, activeJobId };
}

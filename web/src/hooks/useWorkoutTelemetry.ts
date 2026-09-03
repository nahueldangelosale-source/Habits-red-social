import { useRef, useCallback } from 'react';
import { analytics } from '../services/AnalyticsService';

export function useWorkoutTelemetry() {
    const startTimeRef = useRef<number | null>(null);

    // Called when the first DnD interaction starts
    const onFirstInteraction = useCallback(() => {
        if (startTimeRef.current === null) {
            startTimeRef.current = Date.now();
            console.log("[Telemetry] TTFP timer started");
        }
    }, []);

    const onPublishSuccess = useCallback((payload?: { blocksUsed: number, aiSwaps: number }) => {
        if (startTimeRef.current !== null) {
            const timeToFirstPublishMs = Date.now() - startTimeRef.current;

            // Emitir evento de negocio al Data Warehouse / PostHog
            analytics.track('workout_published', {
                time_to_first_publish_ms: timeToFirstPublishMs,
                number_of_blocks_used: payload?.blocksUsed || 0,
                ai_swaps_triggered: payload?.aiSwaps || 0
            });

            // Reset after success
            startTimeRef.current = null;
        }
    }, []);

    return {
        onFirstInteraction,
        onPublishSuccess,
    };
}

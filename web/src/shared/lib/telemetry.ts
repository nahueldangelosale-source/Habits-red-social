/**
 * Semantic Telemetry Module (OpenTelemetry Simulation)
 * Provides structured Gen-AI observabilty matching Enterprise 2026 specs.
 */

type TelemetryLevel = 'info' | 'warn' | 'error' | 'critical';

interface GenAiEvent {
    system: string; // e.g., 'celery-backend', 'a2ui-engine'
    action: string; // e.g., 'exercise_swap', 'circuit_breaker_trip'
    status: 'started' | 'success' | 'failed' | 'timeout';
    taskId?: string;
    model?: string;
    durationMs?: number;
    inputTokens?: number;
    outputTokens?: number;
    metadata?: Record<string, any>;
    timestamp?: string;
}

export const logger = {
    log: (level: TelemetryLevel, message: string, data?: any) => {
        const timestamp = new Date().toISOString();
        const payload = JSON.stringify({ timestamp, level, message, data });
        // In a real application, this would dispatch to Datadog / OTEL Collector
        if (level === 'error' || level === 'critical') {
            console.error(`[TELEMETRY] ${payload}`);
        } else {
            console.info(`[TELEMETRY] ${payload}`);
        }
    },

    genAiEvent: (event: GenAiEvent) => {
        event.timestamp = new Date().toISOString();
        const level = (event.status === 'failed' || event.status === 'timeout') ? 'error' : 'info';
        
        const message = `GenAI Event: ${event.system} -> ${event.action} [${event.status.toUpperCase()}]`;
        
        logger.log(level, message, {
            gen_ai: {
                system: event.system,
                action: event.action,
                status: event.status,
                task_id: event.taskId,
                request: {
                    model: event.model || 'unknown'
                },
                usage: {
                    input_tokens: event.inputTokens || 0,
                    output_tokens: event.outputTokens || 0
                },
                duration_ms: event.durationMs
            },
            ...event.metadata
        });
    }
};

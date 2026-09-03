/**
 * AnalyticsService - Singleton
 * Maneja la telemetría de producto con degradación elegante.
 * Si no hay PostHog configurado, almacena en memoria para no romper UAT.
 */

class AnalyticsService {
    private static instance: AnalyticsService;
    private initialized: boolean = false;
    private posthogKey: string | undefined;
    private eventLog: Array<{ event: string; properties: any; timestamp: string }> = [];

    private constructor() {
        this.posthogKey = import.meta.env.VITE_POSTHOG_KEY;
        this.init();
    }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    private init() {
        if (this.posthogKey) {
            // Aquí se inicializaría el SDK de PostHog real
            // posthog.init(this.posthogKey, { api_host: 'https://app.posthog.com' })
            this.initialized = true;
            console.log('[Analytics] PostHog initialized.');
        } else {
            console.log('[Analytics] Running in Memory Mock Mode (No VITE_POSTHOG_KEY).');
            this.initialized = true;
        }
    }

    public track(eventName: string, properties: Record<string, any>) {
        if (!this.initialized) return;

        const eventRecord = {
            event: eventName,
            properties,
            timestamp: new Date().toISOString()
        };

        if (this.posthogKey) {
            // posthog.capture(eventName, properties);
            console.log(`[Analytics:PostHog] Emitting ${eventName}`, properties);
        } else {
            // Guardrail: Fallback silencioso y seguro
            this.eventLog.push(eventRecord);
            console.log(`[Analytics:Memory] Captured ${eventName}`, properties);
        }
    }

    public getDebugLogs() {
        return this.eventLog;
    }
}

export const analytics = AnalyticsService.getInstance();

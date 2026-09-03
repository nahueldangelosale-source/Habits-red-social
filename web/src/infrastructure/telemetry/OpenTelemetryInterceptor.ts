import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, propagation } from '@opentelemetry/api';

export class OpenTelemetryInterceptor {
  private static instance: OpenTelemetryInterceptor;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): OpenTelemetryInterceptor {
    if (!OpenTelemetryInterceptor.instance) {
      OpenTelemetryInterceptor.instance = new OpenTelemetryInterceptor();
    }
    return OpenTelemetryInterceptor.instance;
  }

  public initialize(serviceName = 'bienestar-frontend', otlpEndpoint = 'http://localhost:4318/v1/traces') {
    if (this.isInitialized) return;

    try {
      // 1. Set Propagator for Trace Context Propagation (W3C Standard)
      // Esto asegura que el traceparent header se inyecte en los fetch()
      propagation.setGlobalPropagator(new W3CTraceContextPropagator());

      // 2. Configure Resource Metadata
      const provider = new WebTracerProvider({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
      });

      // 3. Configure OTLP Exporter pointing to our local OTel Collector (HTTP endpoint)
      const exporter = new OTLPTraceExporter({
        url: otlpEndpoint,
        // headers: { Authorization: "Bearer ..." } // Se configuraría si apuntamos directo a Grafana
      });

      provider.addSpanProcessor(new BatchSpanProcessor(exporter, {
        maxQueueSize: 100,
        maxExportBatchSize: 10,
        scheduledDelayMillis: 2000,
      }));

      // 4. Register Provider globally
      provider.register();

      // 5. Register Auto-instrumentations
      registerInstrumentations({
        instrumentations: [
          new DocumentLoadInstrumentation(),
          // Instrumenta nativamente la Fetch API, inyectando el header traceparent
          // solo en las URLs permitidas para no filtrar trazas a terceros
          new FetchInstrumentation({
            propagateTraceHeaderCorsUrls: [
              new RegExp('http://localhost:8000/.*'),
              new RegExp('https://api\\.bienestar\\.app/.*')
            ]
          }),
        ],
      });

      this.isInitialized = true;
      console.log(`[Telemetry] Initialized. Exporting traces to ${otlpEndpoint}`);
    } catch (e) {
      console.error('[Telemetry] Initialization failed:', e);
    }
  }

  // Utilidad para crear trazas custom en el Frontend
  public startActiveSpan<T>(name: string, fn: (span: any) => T): T {
    const tracer = trace.getTracer('bienestar-frontend-custom');
    return tracer.startActiveSpan(name, (span) => {
      try {
        return fn(span);
      } finally {
        span.end();
      }
    });
  }
}

import os
import logging
from fastapi import FastAPI

logger = logging.getLogger(__name__)

def setup_telemetry(app: FastAPI = None, service_name: str = "bienestar-backend-api"):
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
        
        try:
            from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        except ImportError:
            OTLPSpanExporter = None
            
        try:
            from opentelemetry.semconv.resource import ResourceAttributes
            service_name_attr = ResourceAttributes.SERVICE_NAME
            deploy_env_attr = ResourceAttributes.DEPLOYMENT_ENVIRONMENT
        except ImportError:
            service_name_attr = "service.name"
            deploy_env_attr = "deployment.environment"
            
        resource = Resource.create(attributes={
            service_name_attr: service_name,
            deploy_env_attr: os.getenv("ENVIRONMENT", "development")
        })
        provider = TracerProvider(resource=resource)
        
        if OTLPSpanExporter:
            otlp_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
            otlp_exporter = OTLPSpanExporter(endpoint=otlp_endpoint, insecure=True)
            processor = BatchSpanProcessor(otlp_exporter)
            provider.add_span_processor(processor)
            
        trace.set_tracer_provider(provider)
        if app is not None:
            FastAPIInstrumentor.instrument_app(app)
        SQLAlchemyInstrumentor().instrument()
        logger.info("Telemetry initialized successfully.")
    except Exception as e:
        logger.warning(f"Telemetry setup skipped or degraded: {e}")

async def publish_telemetry_event(tenant_id: str, event_type: str, payload: dict):
    """
    Publish an explicit telemetry event.
    """
    try:
        from opentelemetry import trace
        span = trace.get_current_span()
        if span and span.is_recording():
            span.add_event(
                name=event_type,
                attributes={
                    "tenant_id": tenant_id,
                    **{f"payload.{k}": str(v) for k, v in payload.items()}
                }
            )
    except Exception:
        pass
    logger.info(f"Telemetry Event: {event_type} for tenant {tenant_id}", extra=payload)

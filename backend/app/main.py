"""
Bienestar APP - FastAPI Application Entry Point
El Sistema Operativo Holístico para Profesionales del Bienestar

SECURITY HARDENED: CORS whitelist, rate limiting, structured logging
"""

import os
from dotenv import load_dotenv

# 🔥 Load .env explicitly before importing any routers that might rely on them
load_dotenv()

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from fastapi.responses import JSONResponse

from app.config import get_settings, validate_production_config
from app.db.database import close_db
from app.core.telemetry import setup_telemetry

# -----------------------------------------------------------------------------
# INFRASTRUCTURE LAYER (Cross-cutting)
# -----------------------------------------------------------------------------
from app.api.v1.infrastructure.health import router as health_router

# -----------------------------------------------------------------------------
# DOMAIN LAYER (v1 Bounded Contexts)
# -----------------------------------------------------------------------------
from app.api.v1.routers.auth import router as auth_router

from app.api.voice_to_chart import router as voice_to_chart_router
from app.api.whatsapp import router as whatsapp_router
from app.api.magic_import import router as magic_import_router
from app.api.revenue_guard import router as revenue_guard_router
from app.api.routers.b2b_import import router as b2b_import_router
from app.api.routers.radar_telemetry import router as radar_telemetry_router

from app.api.fitness import router as fitness_router
from app.api.nutrition_vision import router as nutrition_vision_router
from app.api.squad import router as squad_router
from app.api.sync import router as sync_router
from app.api.tasks import router as tasks_router
from app.api.recipes import router as recipes_router
from app.api.nutrition_plans import router as nutrition_plans_router
from app.api.nutrition_routes import router as nutrition_router
from app.api.nutrition import router as sara_nutrition_router
from app.api.nutritionist_routes import router as nutritionist_router
from app.api.patients import router as patients_router
from app.api.websockets import router as ws_router
from app.api.payout_routes import router as payout_router

from app.middleware.rate_limit import setup_rate_limiting, limiter

settings = get_settings()
sentry_dsn = os.getenv("SENTRY_DSN") or getattr(settings, "sentry_dsn", None)
if sentry_dsn:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        sentry_sdk.init(
            dsn=sentry_dsn,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
            environment=settings.environment,
            integrations=[
                FastApiIntegration(),
                SqlalchemyIntegration(),
            ]
        )
    except ImportError:
        pass

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager para startup/shutdown.
    Inicializa conexiones y recursos al arrancar.
    """
    # Startup
    logger.info(
        "application_starting",
        app_name=settings.app_name,
        environment=settings.environment,
        debug=settings.debug,
    )
    
    # Validar configuración en producción
    if settings.is_production:
        try:
            validate_production_config()
            logger.info("production_config_validated")
        except ValueError as e:
            logger.error("production_config_invalid", error=str(e))
            raise
    else:
        # En desarrollo/producción, las tablas se gestionan vía Alembic
        # await init_db()  # Migration Lite eliminada
        logger.info("database_lifecycle_managed_by_alembic")

    # 🧬 DietQA: Conectar Neo4j al arrancar
    try:
        from app.infrastructure.neo4j_client import neo4j_client
        await neo4j_client.connect()
        logger.info("neo4j_connected_for_dietqa")
    except Exception as e:
        logger.warning(f"neo4j_connection_skipped: {e}")
    
    # 📡 RADAR PREDICTIVO: Iniciar scheduler asíncrono
    try:
        from app.worker.cron_jobs import start_radar_scheduler
        start_radar_scheduler()
        logger.info("Initializing OpenAI API...")
    except Exception as e:
        logger.error("radar_scheduler_startup_failed", error=str(e))
    
    # Init Celery inspect
    from app.celery_app import celery_app
    app.state.celery = celery_app
    
    yield
    
    # Shutdown
    logger.info("Shutting down Application...")
    from app.services.socket_manager import manager
    await manager.shutdown()
    await close_db()
    
    # Detener el scheduler del radar predictivo
    try:
        from app.worker.cron_jobs import stop_radar_scheduler
        stop_radar_scheduler()
    except Exception:
        pass
        
    # Close Redis connection pool
    from app.services.redis_client import close_redis
    await close_redis()
    # Close Neo4j
    try:
        from app.infrastructure.neo4j_client import neo4j_client
        await neo4j_client.close()
    except Exception:
        pass
    logger.info("all_connections_closed")


app = FastAPI(
    title=settings.app_name,
    description="""
    ## El Sistema Operativo Invisible para Profesionales del Bienestar
    
    ### Módulos Disponibles:
    - 🎙️ **Voice-to-Chart**: Transcripción de voz a historia clínica SOAP
    - 💬 **WhatsApp Intelligence**: Asistente conversacional con guardrails
    - 📸 **Magic Import**: Importación de Excel/PDF legacy con visión AI
    - 💳 **Revenue Guard**: Sistema de Fair Use y facturación
    
    ### Seguridad:
    - 🔐 JWT Authentication
    - 🛡️ Rate Limiting
    - 🏢 Multi-Tenant Isolation
    """,
    version="0.2.0",  # Version bump por security hardening
    docs_url="/docs" if (settings.debug or settings.environment == "development") else None,
    redoc_url="/redoc" if (settings.debug or settings.environment == "development") else None,
    lifespan=lifespan,
)

# Activar la Trazabilidad E2E con OTLP
setup_telemetry(app)

# [CONFIGURACIÓN CORS]: Orígenes configurables dinámicamente según entorno
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True, # Crucial para el intercambio de tokens de sesión
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🤖 AI TELEMETRY: Capture GenAI traces for AUREA engine
try:
    import litellm
    litellm.success_callback = ["otlp"]
except (ImportError, Exception):
    pass

# Setup rate limiting
setup_rate_limiting(app)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with structured logging."""
    from opentelemetry import trace
    import uuid
    
    request_id = str(uuid.uuid4())[:8]
    span = trace.get_current_span()
    trace_id = format(span.get_span_context().trace_id, "032x") if span.is_recording() else None
    
    logger.info(
        "request_started",
        request_id=request_id,
        trace_id=trace_id,
        method=request.method,
        path=request.url.path,
        client=request.client.host if request.client else "unknown",
    )
    
    response = await call_next(request)
    
    logger.info(
        "request_completed",
        request_id=request_id,
        trace_id=trace_id,
        status_code=response.status_code,
    )
    
    response.headers["X-Request-ID"] = request_id
    if trace_id:
        response.headers["X-Trace-ID"] = trace_id
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions with logging and CORS headers."""
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        error=str(exc),
        error_type=type(exc).__name__,
    )
    
    content = {"detail": "Error interno del servidor"}
    if settings.debug:
        content = {"detail": str(exc), "type": type(exc).__name__}
        
    response = JSONResponse(
        status_code=500,
        content=content
    )
    
    # 🩹 CORS FIX: Manual injection of headers in error response
    origin = request.headers.get("origin")
    if origin in settings.cors_origins_list:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        
    return response


# Registrar routers modularizados (v1)
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])

# 🔗 TOKEN ALIAS: Resolution for frontend and tests on /token and /api/v1/auth/token
from app.api.v1.routers.auth import login_for_access_token
app.post("/token", tags=["Authentication"])(login_for_access_token)
app.post("/api/v1/auth/token", tags=["Authentication"])(login_for_access_token)

# Registrar routers legacy/pendientes
# app.include_router(voice_to_chart_router, prefix="/api/v1/voice", tags=["Voice"])
# app.include_router(whatsapp_router, prefix="/api/v1/whatsapp", tags=["WhatsApp"])
app.include_router(magic_import_router, prefix="/api/v1", tags=["Magic"])
# app.include_router(revenue_guard_router, prefix="/api/v1/revenue", tags=["Revenue"])
# app.include_router(b2b_import_router, prefix="/api/v1/import", tags=["B2B Import"])
# app.include_router(radar_telemetry_router, prefix="/api/v1/telemetry", tags=["Telemetry"])
app.include_router(fitness_router, prefix="/api/v1/fitness", tags=["Fitness"])

from app.api.telemetry import router as telemetry_router
app.include_router(telemetry_router, prefix="/api/v1")

# from app.api.telemetry_mock import router as telemetry_mock_router
# app.include_router(telemetry_mock_router, prefix="/api/v1/ws-telemetry", tags=["Vibe Coding Mock"])

from app.api.workouts import router as workouts_router
app.include_router(workouts_router, prefix="/api/v1/workouts", tags=["Workouts"])
app.include_router(nutrition_vision_router)
app.include_router(sync_router, prefix="/api/v1/sync", tags=["Sync"])
app.include_router(tasks_router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(recipes_router, prefix="/api/v1/recipes", tags=["Recipes"])
app.include_router(nutrition_plans_router, prefix="/api/v1/nutrition-plans", tags=["Nutrition Plans"])
app.include_router(nutrition_router, prefix="/api/v1/nutrition", tags=["Nutrition"])
from app.api.trainer_routes import router as trainer_router
from app.api.scheduling_routes import router as scheduling_router

app.include_router(sara_nutrition_router) # SARA 2 (Prefix already inside router definition)
app.include_router(nutritionist_router, prefix="/api/v1/nutritionists", tags=["Nutritionists"])
app.include_router(trainer_router, prefix="/api/v1/trainer", tags=["Trainer"])
app.include_router(scheduling_router, prefix="/api/v1/scheduling", tags=["Scheduling"])

from app.api.attendance_routes import router as attendance_router
app.include_router(attendance_router, prefix="/api/v1", tags=["Attendance Engine"])
from app.api.v1.professionals import router as professionals_router
app.include_router(professionals_router, prefix="/api/v1")
app.include_router(payout_router, prefix="/api/v1/payout", tags=["Payouts"])
from app.api.chat import router as chat_router
from app.api.webhooks import router as webhooks_router
from app.api.inbox import router as inbox_router
from app.api.watchtower import router as watchtower_router
from app.api.auth_b2c import router as auth_b2c_router
from app.api.checkout import router as checkout_router
from app.api.billing_routes import router as billing_router
from app.api.finance import router as finance_router
from app.api.protocols import router as protocols_router
from app.api.mesocycles import router as mesocycles_router
from app.api.validations import router as validations_router
from app.api.ws_canvas import router as ws_canvas_router

app.include_router(chat_router, prefix="/api/v1")
app.include_router(inbox_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/api/v1/ws", tags=["WebSockets"])

from app.api.sse import router as sse_router
app.include_router(sse_router, prefix="/api/v1/notifications")
app.include_router(watchtower_router) # 🗼 The Watchtower OLAP Dashboard
app.include_router(auth_b2c_router, prefix="/api/v1/auth-b2c", tags=["Auth B2C"])  # 🔑 B2C Burnable Magic Links
app.include_router(checkout_router, prefix="/api/v1")
app.include_router(billing_router, prefix="/api/v1/billing")
app.include_router(finance_router)
app.include_router(protocols_router)
app.include_router(mesocycles_router)
app.include_router(validations_router, prefix="/api/v1/validations", tags=["Validations"])

from app.api.clinical_routes import router as clinical_router
from app.api.v1.plans_routes import router as plans_router
# app.include_router(clinical_router)
app.include_router(plans_router)

from app.api.conflicts import router as conflicts_router
app.include_router(conflicts_router, prefix="/api/v1/clinical")

from app.api.storage_routes import router as storage_router
# app.include_router(storage_router)

from app.api.dashboard_metrics import router as dashboard_metrics_router
app.include_router(dashboard_metrics_router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(patients_router, prefix="/api/v1", tags=["Patients"])

from app.api.command_center import router as command_center_router
app.include_router(command_center_router, prefix="/api/v1/command-center", tags=["Command Center"])

from app.api.interventions import router as interventions_router
# app.include_router(interventions_router)


from app.api.business import router as business_router
from app.api.onboarding_routes import router as onboarding_router
from app.api.tenants import router as tenants_router
# REMOVED: Empty skeleton router was shadowing real Google OAuth endpoint in app.api.v1.routers.auth
# from app.api.auth_oauth import router as auth_oauth_router
from app.api.athlete import router as athlete_router  # Workflow 3.2: Math Engine
from app.api.habits import router as habits_router  # Multi-Role Habit Persistence Engine
from app.api.gamification import router as gamification_router  # Multi-Role Gamification & XP Ledger
from app.api.notifications import router as notifications_router # Workflow 3.2: Web Push
from app.api.routines import router as routines_router # Workflow Cascade Builder
from app.api.nutrition_voice import router as nutrition_voice_router # Workflow G: Nutritional Copilot
from app.api.rewards_routes import router as rewards_router # Workflow C/O2O: Gamification Engine

app.include_router(habits_router)
app.include_router(gamification_router)
app.include_router(business_router, prefix="/api/v1")
app.include_router(onboarding_router, prefix="/api/v1/business/onboarding", tags=["onboarding"])
app.include_router(tenants_router, prefix="/api/v1/tenants")
# app.include_router(inventory_router)

from app.middleware.auth import get_current_user # Standard dependency from middleware
from fastapi import Depends


from app.api.templates_routes import router as templates_router
from app.api.exercises_routes import router as exercises_router

# REMOVED: auth_oauth_router (empty skeleton, was shadowing real /api/v1/auth/google)
app.include_router(athlete_router)
# app.include_router(notifications_router)
app.include_router(routines_router, prefix="/api/v1/routines", tags=["Routines"])
app.include_router(templates_router, prefix="/api/v1/templates", tags=["Templates"])
app.include_router(exercises_router, prefix="/api/v1/exercises", tags=["Exercises"])
# app.include_router(nutrition_voice_router)
app.include_router(rewards_router, prefix="/api/v1")

# 🧬 DietQA: Motor Nutricional (Neo4j + RAG)
from app.domains.dietqa.router import router as dietqa_router
app.include_router(dietqa_router)

# 📄 Clinical Vault: OCR & IA Document Ingestion
from app.api.documents import router as documents_router
# app.include_router(documents_router)

# ⚙️ Configuration & Feature Flags (REMOVED: empty skeleton router with no endpoints)
# from app.api.routers.config_flags import router as config_flags_router
# app.include_router(config_flags_router, prefix="/api/v1")

from app.api.action_cards import router as action_cards_router
app.include_router(action_cards_router, prefix="/api/v1/action_cards", tags=["ActionCards"])

from app.api.v1.routers.gaming import router as gaming_router
app.include_router(gaming_router, prefix="/api/v1/gaming", tags=["Gaming Engine"])

from app.api.admin_internal import router as admin_internal_router
app.include_router(admin_internal_router)

from app.api.sandbox_routes import router as sandbox_router
app.include_router(sandbox_router, prefix="/api/v1/sandbox")

@app.get("/", tags=["Root"])
@limiter.limit("100/minute")
async def root(request: Request):
    """Endpoint raíz - información básica de la API."""
    return {
        "message": "Bienvenido a Bienestar APP API",
        "version": "0.2.0",
        "environment": settings.environment,
        "docs": "/docs" if settings.debug else "disabled",
        "health": "/api/v1/health"
    }


# 🔒 SECURITY: /debug/init-db endpoint REMOVED (was executing DDL without auth)
# Use Alembic migrations for schema changes instead.


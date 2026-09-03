import os
from celery import Celery
import sys

# Set default settings to env
# Default locally to Redis as per CTO directive to avoid SQLite locking issues under concurrency
broker_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")

celery_app = Celery(
    "bienestar_worker",
    broker=broker_url,
    backend=result_backend,
    include=[
        "app.tasks.ai_tasks",
        "app.tasks.watchtower_tasks",
        "app.tasks.reward_tasks",
        "app.tasks.nutrition_tasks",
        "app.tasks.safety_tasks",
        "app.tasks.mass_assignment_tasks",
        "app.tasks.matchmaking_tasks",
        "app.domains.coach.tasks",
        "app.domains.onboarding.tasks",
        "app.worker.dietqa_tasks",
        "app.worker.snapshot_tasks",
        "app.workers.cri_worker",
        "app.workers.dietqa_worker",
        "app.worker.scheduling_worker"
    ]
)

# Inicializamos OTel si estamos corriendo en modo worker
if "worker" in sys.argv or __name__ == "__main__":
    from app.core.telemetry import setup_telemetry
    # Al pasar None, solo configuramos el provider y registramos el instrumentor de Celery
    setup_telemetry(None, service_name="bienestar-celery-worker")

# Optional configuration, see the application user guide.
celery_app.conf.update(
    # Enterprise Reliability Settings (Acks Late Strategy)
    task_acks_late=True,                 # Don't acknowledge task until it's finished successfully
    worker_prefetch_multiplier=1,        # Only fetch one task at a time (fair dispatch for heavy LLMs)
    
    # Serialization
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    
    # Track started state
    task_track_started=True,
    
    # Timezone
    timezone="UTC",
    enable_utc=True,
    
    # Celery-Beat: Periodic task schedule (The Watchtower MV Refresh)
    beat_schedule={
        "refresh-watchtower-views-every-15m": {
            "task": "watchtower.refresh_views",
            "schedule": 900.0,  # 15 minutes in seconds
        },
        "sweep-no-shows-nightly": {
            "task": "app.worker.scheduling_worker.sweep_no_shows",
            "schedule": 86400.0, # Every 24h, idealmente se usaría crontab
        },
        "process-churn-risk-nightly": {
            "task": "app.worker.scheduling_worker.process_churn_risk_evaluation",
            "schedule": 86400.0,
        },
        "sweep-daily-snapshots-hourly": {
            "task": "app.worker.snapshot_tasks.sweep_daily_snapshots_nightly",
            "schedule": 3600.0,  # Every hour to hit different timezones at 02:00 AM
        }
    },
)

if __name__ == '__main__':
    celery_app.start()

"""
Watchtower Celery Tasks
Refreshes Materialized Views on a periodic schedule (every 15 min via celery-beat).
Ensures the Watchtower Dashboard reads from pre-computed snapshots, isolating OLAP from OLTP.
"""

import structlog
from sqlalchemy import text

from app.celery_app import celery_app
from app.db.connection import sync_engine

logger = structlog.get_logger()


@celery_app.task(name="watchtower.refresh_views", bind=True, max_retries=2)
def refresh_watchtower_views(self) -> dict:
    """
    Refresh both Watchtower Materialized Views concurrently.
    Uses a raw synchronous connection (Celery tasks are synchronous).
    """
    views = ["mv_churn_risk", "mv_machine_telemetry"]
    results = {}

    try:
        with sync_engine.connect() as conn:
            for view_name in views:
                try:
                    conn.execute(
                        text(f"REFRESH MATERIALIZED VIEW CONCURRENTLY {view_name}")
                    )
                    conn.commit()
                    results[view_name] = "refreshed"
                    logger.info("mv_refreshed", view=view_name)
                except Exception as view_err:
                    # If CONCURRENTLY fails (e.g., no unique index yet), fall back to blocking refresh
                    conn.rollback()
                    logger.warning(
                        "mv_concurrent_refresh_failed_fallback",
                        view=view_name,
                        error=str(view_err)
                    )
                    try:
                        conn.execute(text(f"REFRESH MATERIALIZED VIEW {view_name}"))
                        conn.commit()
                        results[view_name] = "refreshed_blocking"
                    except Exception as fallback_err:
                        conn.rollback()
                        results[view_name] = f"error: {fallback_err}"
                        logger.error("mv_refresh_failed", view=view_name, error=str(fallback_err))

    except Exception as exc:
        logger.error("watchtower_refresh_connection_error", error=str(exc))
        raise self.retry(exc=exc, countdown=60)

    return results

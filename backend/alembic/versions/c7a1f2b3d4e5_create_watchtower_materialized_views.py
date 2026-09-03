"""Create Watchtower Materialized Views

Revision ID: c7a1f2b3d4e5
Revises: b95045558568
Create Date: 2026-03-06 02:48:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'c7a1f2b3d4e5'
down_revision: Union[str, Sequence[str], None] = '2f45f365cf9b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create Materialized Views for Watchtower OLAP isolation."""

    # ── mv_churn_risk ─────────────────────────────────────────────────────
    # Identifies active clients with ZERO workout sessions in the last 7 days.
    # Tenant-isolated via clients.tenant_id.
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_churn_risk AS
        SELECT
            c.id AS client_id,
            c.tenant_id,
            c.first_name,
            c.last_name,
            c.phone,
            c.email,
            c.is_active,
            c.payment_status,
            MAX(ws.started_at) AS last_session_at,
            COALESCE(
                EXTRACT(DAY FROM (NOW() - MAX(ws.started_at))),
                999
            )::integer AS days_inactive
        FROM clients c
        LEFT JOIN workout_sessions ws ON ws.client_id = c.id
        WHERE c.is_active = true
        GROUP BY c.id, c.tenant_id, c.first_name, c.last_name,
                 c.phone, c.email, c.is_active, c.payment_status
        HAVING MAX(ws.started_at) IS NULL
           OR MAX(ws.started_at) < NOW() - INTERVAL '7 days'
        WITH DATA;
    """)

    # Unique index required for REFRESH CONCURRENTLY
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ix_mv_churn_risk_client
        ON mv_churn_risk (client_id);
    """)

    # ── mv_machine_telemetry ──────────────────────────────────────────────
    # Aggregates exercise usage (proxy for machine telemetry) over 30 days.
    # Tenant-isolated via clients.tenant_id through workout_sessions.
    op.execute("""
        CREATE MATERIALIZED VIEW IF NOT EXISTS mv_machine_telemetry AS
        SELECT
            c.tenant_id,
            el.exercise_name,
            COUNT(*)::integer AS total_uses,
            SUM(el.sets * el.reps)::integer AS total_reps,
            ROUND(SUM(el.weight_kg * el.sets * el.reps)::numeric, 1) AS total_volume_kg,
            COUNT(DISTINCT ws.client_id)::integer AS unique_users
        FROM exercise_logs el
        JOIN workout_sessions ws ON ws.id = el.session_id
        JOIN clients c ON c.id = ws.client_id
        WHERE ws.started_at >= NOW() - INTERVAL '30 days'
        GROUP BY c.tenant_id, el.exercise_name
        WITH DATA;
    """)

    # Composite unique index for REFRESH CONCURRENTLY
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS ix_mv_machine_telemetry_tenant_exercise
        ON mv_machine_telemetry (tenant_id, exercise_name);
    """)


def downgrade() -> None:
    """Drop Watchtower Materialized Views."""
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_machine_telemetry CASCADE;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_churn_risk CASCADE;")

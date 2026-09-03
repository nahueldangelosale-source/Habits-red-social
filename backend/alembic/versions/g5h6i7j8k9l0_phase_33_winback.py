"""phase_33_winback

Revision ID: g5h6i7j8k9l0
Revises: f4g5h6i7j8k9
Create Date: 2026-06-07 20:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'g5h6i7j8k9l0'
down_revision = 'f4g5h6i7j8k9'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. State Machine Table
    op.create_table('coach_communication_states',
        sa.Column('coach_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('state', sa.String(length=20), server_default="ACTIVE", nullable=False),
        sa.Column('unopened_streak', sa.Integer(), server_default="0", nullable=False),
        sa.Column('cooldown_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 2. MV Attribution Funnel
    op.execute("""
        CREATE MATERIALIZED VIEW mv_attribution_funnel AS
        WITH raw_logs AS (
            SELECT 
                l.coach_id,
                l.target_date,
                l.status as delivery_status,
                l.opened_at,
                l.clicked_at,
                jsonb_array_elements_text(
                    CASE 
                        WHEN jsonb_typeof(l.payload_jsonb->'target_group') = 'array' 
                        THEN l.payload_jsonb->'target_group' 
                        ELSE '[]'::jsonb 
                    END
                )::uuid as athlete_id,
                FALSE as is_control
            FROM notification_digest_logs l
            
            UNION ALL
            
            SELECT 
                l.coach_id,
                l.target_date,
                'CONTROL' as delivery_status,
                NULL as opened_at,
                NULL as clicked_at,
                jsonb_array_elements_text(
                    CASE 
                        WHEN jsonb_typeof(l.payload_jsonb->'control_group') = 'array' 
                        THEN l.payload_jsonb->'control_group' 
                        ELSE '[]'::jsonb 
                    END
                )::uuid as athlete_id,
                TRUE as is_control
            FROM notification_digest_logs l
        ),
        reactivations AS (
            SELECT DISTINCT r.athlete_id, r.target_date
            FROM raw_logs r
            JOIN workout_sets ws ON ws.athlete_id = r.athlete_id
            WHERE ws.client_created_at BETWEEN r.target_date AND (r.target_date + INTERVAL '7 days')
              AND ws.is_completed = TRUE
        )
        SELECT 
            rl.coach_id,
            rl.athlete_id,
            rl.target_date,
            rl.is_control,
            rl.delivery_status,
            (rl.opened_at IS NOT NULL) as was_opened,
            (rl.clicked_at IS NOT NULL) as was_clicked,
            (re.athlete_id IS NOT NULL) as was_reactivated
        FROM raw_logs rl
        LEFT JOIN reactivations re 
            ON rl.athlete_id = re.athlete_id AND rl.target_date = re.target_date;
    """)

    # UNIQUE INDEX for REFRESH CONCURRENTLY
    op.execute("CREATE UNIQUE INDEX ux_mv_attribution ON mv_attribution_funnel(coach_id, athlete_id, target_date);")
    
    # B-Tree index optimized for the "Query de Oro" (last 30 days filter)
    op.execute("CREATE INDEX ix_mv_attribution_coach_date ON mv_attribution_funnel(coach_id, target_date DESC);")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_mv_attribution_coach_date;")
    op.execute("DROP INDEX IF EXISTS ux_mv_attribution;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_attribution_funnel;")
    op.drop_table('coach_communication_states')

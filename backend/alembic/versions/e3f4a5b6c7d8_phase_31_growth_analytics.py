"""phase_31_growth_analytics

Revision ID: e3f4a5b6c7d8
Revises: d1e2f3a4b5c6
Create Date: 2026-06-07 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e3f4a5b6c7d8'
down_revision = 'd1e2f3a4b5c6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create Partitioned Table for Telemetry
    op.execute("""
        CREATE TABLE growth_event_tracks (
            id UUID NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
            tenant_id UUID NOT NULL,
            squad_id UUID,
            actor_id UUID NOT NULL,
            target_id UUID,
            event_type VARCHAR(50) NOT NULL,
            metadata_json JSONB NOT NULL DEFAULT '{}',
            PRIMARY KEY (id, created_at)
        ) PARTITION BY RANGE (created_at);
    """)

    # Create indexes for the partitioned table
    op.execute("CREATE INDEX ix_growth_events_squad_type ON growth_event_tracks (squad_id, event_type);")
    op.execute("CREATE INDEX ix_growth_events_created ON growth_event_tracks (created_at);")

    # Create initial partitions (Current Month and Next Month)
    op.execute("""
        CREATE TABLE growth_event_tracks_y2026m06 PARTITION OF growth_event_tracks
        FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
    """)
    op.execute("""
        CREATE TABLE growth_event_tracks_y2026m07 PARTITION OF growth_event_tracks
        FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
    """)

    # 2. Materialized View: K-Factor
    # K = successful invites / total athletes in the squad
    op.execute("""
        CREATE MATERIALIZED VIEW mv_squad_viral_k_factor AS
        WITH invites AS (
            SELECT squad_id, COUNT(*) as invites_sent
            FROM growth_event_tracks
            WHERE event_type = 'invite_sent' AND created_at > NOW() - INTERVAL '30 days'
            GROUP BY squad_id
        ),
        conversions AS (
            SELECT squad_id, COUNT(*) as invites_accepted
            FROM growth_event_tracks
            WHERE event_type = 'invite_accepted' AND created_at > NOW() - INTERVAL '30 days'
            GROUP BY squad_id
        ),
        squad_size AS (
            SELECT squad_id, COUNT(*) as total_members
            FROM squad_members
            GROUP BY squad_id
        )
        SELECT 
            s.squad_id,
            COALESCE(i.invites_sent, 0) as invites_sent,
            COALESCE(c.invites_accepted, 0) as invites_accepted,
            s.total_members,
            CASE WHEN s.total_members > 0 
                 THEN ROUND((COALESCE(c.invites_accepted, 0)::numeric / s.total_members::numeric), 2)
                 ELSE 0 END as k_factor
        FROM squad_size s
        LEFT JOIN invites i ON s.squad_id = i.squad_id
        LEFT JOIN conversions c ON s.squad_id = c.squad_id;
    """)
    op.execute("CREATE UNIQUE INDEX ux_mv_k_factor_squad_id ON mv_squad_viral_k_factor(squad_id);")

    # 3. Materialized View: Engagement Score
    # interactions per member over last 7 days
    op.execute("""
        CREATE MATERIALIZED VIEW mv_squad_engagement_score AS
        WITH interactions AS (
            SELECT squad_id, COUNT(*) as total_interactions
            FROM squad_activities
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY squad_id
        ),
        squad_size AS (
            SELECT squad_id, COUNT(*) as total_members
            FROM squad_members
            GROUP BY squad_id
        )
        SELECT 
            s.squad_id,
            COALESCE(i.total_interactions, 0) as total_interactions,
            s.total_members,
            CASE WHEN s.total_members > 0 
                 THEN ROUND((COALESCE(i.total_interactions, 0)::numeric / s.total_members::numeric), 2)
                 ELSE 0 END as engagement_score
        FROM squad_size s
        LEFT JOIN interactions i ON s.squad_id = i.squad_id;
    """)
    op.execute("CREATE UNIQUE INDEX ux_mv_engagement_squad_id ON mv_squad_engagement_score(squad_id);")

    # 4. Materialized View: Social Churn Predictor
    # DAU/MAU ratio drop proxy. Here we calculate ratio of active days in last 7 days vs last 30 days
    op.execute("""
        CREATE MATERIALIZED VIEW mv_squad_churn_predictor AS
        WITH active_7d AS (
            SELECT client_id, COUNT(DISTINCT DATE(created_at)) as days_active_7d
            FROM squad_activities
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY client_id
        ),
        active_30d AS (
            SELECT client_id, COUNT(DISTINCT DATE(created_at)) as days_active_30d
            FROM squad_activities
            WHERE created_at > NOW() - INTERVAL '30 days'
            GROUP BY client_id
        ),
        members AS (
            SELECT sm.squad_id, sm.client_id
            FROM squad_members sm
        )
        SELECT 
            m.squad_id,
            m.client_id,
            COALESCE(a7.days_active_7d, 0) as days_active_7d,
            COALESCE(a30.days_active_30d, 0) as days_active_30d,
            CASE WHEN COALESCE(a30.days_active_30d, 0) > 0 
                 THEN ROUND((COALESCE(a7.days_active_7d, 0)::numeric / 7.0) / (COALESCE(a30.days_active_30d, 0)::numeric / 30.0), 2)
                 ELSE 0 END as social_vitality_ratio
        FROM members m
        LEFT JOIN active_7d a7 ON m.client_id = a7.client_id
        LEFT JOIN active_30d a30 ON m.client_id = a30.client_id;
    """)
    op.execute("CREATE UNIQUE INDEX ux_mv_churn_client_id ON mv_squad_churn_predictor(client_id);")
    op.execute("CREATE INDEX ix_mv_churn_squad_id ON mv_squad_churn_predictor(squad_id);")


def downgrade() -> None:
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_squad_churn_predictor;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_squad_engagement_score;")
    op.execute("DROP MATERIALIZED VIEW IF EXISTS mv_squad_viral_k_factor;")
    op.execute("DROP TABLE IF EXISTS growth_event_tracks CASCADE;")

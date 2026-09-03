"""add_challenges_tables

Revision ID: h7c8d9e0f1g2
Revises: g6b7c8d9e0f1
Create Date: 2026-08-26 11:21:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'h7c8d9e0f1g2'
down_revision: Union[str, Sequence[str], None] = 'g6b7c8d9e0f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear tabla athlete_challenges
    op.execute("""
        CREATE TABLE IF NOT EXISTS athlete_challenges (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            squad_id UUID REFERENCES squads(id) ON DELETE SET NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'STREAK',
            target_value INTEGER NOT NULL DEFAULT 7,
            current_value INTEGER NOT NULL DEFAULT 0,
            state VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            duration_days INTEGER NOT NULL DEFAULT 7,
            deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
        );

        CREATE INDEX IF NOT EXISTS idx_athlete_challenges_client_state ON athlete_challenges(client_id, state);
        CREATE INDEX IF NOT EXISTS idx_athlete_challenges_tenant ON athlete_challenges(tenant_id);

        -- 2. Crear tabla challenge_progress_events
        CREATE TABLE IF NOT EXISTS challenge_progress_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            challenge_id UUID NOT NULL REFERENCES athlete_challenges(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            value INTEGER NOT NULL DEFAULT 1,
            source VARCHAR(50) NOT NULL DEFAULT 'HABIT_CHECKIN',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge ON challenge_progress_events(challenge_id);
        CREATE INDEX IF NOT EXISTS idx_challenge_progress_client ON challenge_progress_events(client_id);

        -- 3. Habilitar RLS estricto
        ALTER TABLE athlete_challenges ENABLE ROW LEVEL SECURITY;
        ALTER TABLE challenge_progress_events ENABLE ROW LEVEL SECURITY;
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS challenge_progress_events CASCADE;")
    op.execute("DROP TABLE IF EXISTS athlete_challenges CASCADE;")

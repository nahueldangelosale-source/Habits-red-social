"""add_habits_tables

Revision ID: f5a6b7c8d9e0
Revises: e4f5a6b7c8d9
Create Date: 2026-08-25 16:32:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f5a6b7c8d9e0'
down_revision: Union[str, Sequence[str], None] = 'e4f5a6b7c8d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Crear tabla habits
    op.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            template_id VARCHAR(100) NOT NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(10) NOT NULL DEFAULT 'BUILD',
            category VARCHAR(30) NOT NULL DEFAULT 'CUSTOM',
            input_type VARCHAR(10) NOT NULL DEFAULT 'BOOLEAN',
            unit VARCHAR(30),
            target_value NUMERIC(10, 2),
            duration VARCHAR(30) DEFAULT 'INDEFINITE',
            scheduled_days INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
            tags TEXT[] DEFAULT '{}',
            is_custom BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            streak_current INTEGER DEFAULT 0,
            streak_best INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            start_date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)

    # Índices para habits
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_habits_client_id ON habits(client_id);
        CREATE INDEX IF NOT EXISTS idx_habits_tenant_id ON habits(tenant_id);
        CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(client_id, is_active);
    """)

    # 2. Crear tabla habit_logs
    op.execute("""
        CREATE TABLE IF NOT EXISTS habit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
            log_date DATE NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            value NUMERIC(10, 2),
            zone VARCHAR(10) DEFAULT 'NONE',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)

    # Índices para habit_logs
    op.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS uq_habit_logs_habit_date ON habit_logs(habit_id, log_date);
        CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(log_date);
    """)

    # 3. Habilitar RLS en habits y habit_logs
    op.execute("""
        ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS tenant_isolation_habits ON habits;
        CREATE POLICY tenant_isolation_habits ON habits
            USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

        ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS habit_logs_access ON habit_logs;
        CREATE POLICY habit_logs_access ON habit_logs
            USING (EXISTS (
                SELECT 1 FROM habits h 
                WHERE h.id = habit_logs.habit_id 
                AND h.tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            ));
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS habit_logs CASCADE;")
    op.execute("DROP TABLE IF EXISTS habits CASCADE;")

"""enable_rls_global

Revision ID: afc7b2953245
Revises: m3s0cyc1e_001
Create Date: 2026-06-25 12:17:54.378304

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'afc7b2953245'
down_revision: Union[str, Sequence[str], None] = 'm3s0cyc1e_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Enable RLS globally on all public tables."""
    op.execute('''
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
            EXECUTE 'ALTER TABLE public."' || r.tablename || '" ENABLE ROW LEVEL SECURITY;';
        END LOOP;
    END;
    $$;
    ''')


def downgrade() -> None:
    """Downgrade schema: Disable RLS globally on all public tables."""
    op.execute('''
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
            EXECUTE 'ALTER TABLE public."' || r.tablename || '" DISABLE ROW LEVEL SECURITY;';
        END LOOP;
    END;
    $$;
    ''')

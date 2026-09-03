"""lockdown_rls_all_tables

Revision ID: g6b7c8d9e0f1
Revises: f5a6b7c8d9e0
Create Date: 2026-08-26 10:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'g6b7c8d9e0f1'
down_revision: Union[str, Sequence[str], None] = 'f5a6b7c8d9e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Enforce Row Level Security (RLS) dynamically on EVERY table in the public schema.
    This resolves Supabase security audit warning 'rls_disabled_in_public' (CRITICAL ISSUE)
    and ensures zero-trust protection across all current and future tables.
    """
    op.execute("""
    DO $$
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN 
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename NOT IN ('spatial_ref_sys') -- exclude PostGIS internals if any
        LOOP
            EXECUTE 'ALTER TABLE public."' || r.tablename || '" ENABLE ROW LEVEL SECURITY;';
        END LOOP;
    END;
    $$;
    """)


def downgrade() -> None:
    pass

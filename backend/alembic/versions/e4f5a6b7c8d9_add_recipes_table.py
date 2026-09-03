"""add_recipes_table

Revision ID: e4f5a6b7c8d9
Revises: e26b0e2112fe
Create Date: 2026-08-24 19:51:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e4f5a6b7c8d9'
down_revision: Union[str, Sequence[str], None] = 'e26b0e2112fe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create recipes table if not exists
    op.execute("""
        CREATE TABLE IF NOT EXISTS recipes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
            professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
            macros JSONB NOT NULL DEFAULT '{}'::jsonb,
            instructions TEXT,
            tags JSONB NOT NULL DEFAULT '[]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """)

    # Create index for tenant lookups
    op.execute("""
        CREATE INDEX IF NOT EXISTS idx_recipes_tenant_id ON recipes(tenant_id);
    """)

    # Enable RLS
    op.execute("""
        ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
    """)

    # RLS Policy
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_policies WHERE tablename = 'recipes' AND policyname = 'tenant_isolation_recipes'
            ) THEN
                CREATE POLICY tenant_isolation_recipes ON recipes
                    FOR ALL
                    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
            END IF;
        END $$;
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS recipes CASCADE;")

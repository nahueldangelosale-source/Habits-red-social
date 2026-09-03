"""hardening_forced_migration_fix

Revision ID: 0e6f9a705a0d
Revises: 890fc896ee12
Create Date: 2026-03-12 11:52:07.286932

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0e6f9a705a0d'
down_revision: Union[str, Sequence[str], None] = '890fc896ee12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Forced Migration: Fix sync_status ENUM mismatch for offline-first."""
    op.execute("ALTER TABLE clients ALTER COLUMN sync_status TYPE VARCHAR(50) USING sync_status::text")


def downgrade() -> None:
    """Revert sync_status to VARCHAR(20)."""
    op.execute("ALTER TABLE clients ALTER COLUMN sync_status TYPE VARCHAR(20) USING sync_status::text")


"""Phase 49 - Zero Trust UI & RBAC Core

Revision ID: c5eab8b5f7d8
Revises: aa4d63a456ac
Create Date: 2026-06-09 10:03:18.073078

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c5eab8b5f7d8'
down_revision: Union[str, Sequence[str], None] = 'aa4d63a456ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('professionals', sa.Column('role', sa.String(length=50), server_default='PT', nullable=False))
    op.add_column('tenants', sa.Column('secondary_color', sa.String(length=7), server_default='#3b82f6', nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('tenants', 'secondary_color')
    op.drop_column('professionals', 'role')

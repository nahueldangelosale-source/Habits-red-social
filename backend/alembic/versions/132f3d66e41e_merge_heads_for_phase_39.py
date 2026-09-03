"""Merge heads for Phase 39

Revision ID: 132f3d66e41e
Revises: a1acf92c4843, p1q2r3s4t5u6
Create Date: 2026-06-08 14:04:42.188291

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '132f3d66e41e'
down_revision: Union[str, Sequence[str], None] = ('a1acf92c4843', 'p1q2r3s4t5u6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

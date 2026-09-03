"""Phase 40 Add ClinicalDocument model

Revision ID: 2373c2f87c06
Revises: 132f3d66e41e
Create Date: 2026-06-08 15:44:39.361393

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '2373c2f87c06'
down_revision: Union[str, Sequence[str], None] = '132f3d66e41e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'clinical_documents',
        sa.Column('id', sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('patient_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('file_url', sa.String(length=1024), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='processing'),
        sa.Column('extracted_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('reviewed_by', sa.UUID(as_uuid=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('file_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ondelete='SET NULL'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('clinical_documents')

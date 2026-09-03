"""Add Protocol Universal Baseline fields

Revision ID: d3e4f5g6h7i8
Revises: c2a3b4c5d6e7
Create Date: 2026-06-14 02:47:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd3e4f5g6h7i8'
down_revision = 'c2a3b4c5d6e7'
branch_labels = None
depends_on = None

def upgrade():
    # Make Protocol foreign keys nullable
    op.alter_column('protocols', 'tenant_id', existing_type=postgresql.UUID(), nullable=True)
    op.alter_column('protocols', 'professional_id', existing_type=postgresql.UUID(), nullable=True)
    op.alter_column('protocols', 'client_id', existing_type=postgresql.UUID(), nullable=True)
    
    # Add Universal Baseline fields
    op.add_column('protocols', sa.Column('is_global', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('protocols', sa.Column('origin_global_id', postgresql.UUID(as_uuid=True), nullable=True))

def downgrade():
    op.drop_column('protocols', 'origin_global_id')
    op.drop_column('protocols', 'is_global')
    
    # Revert foreign keys to non-nullable
    op.alter_column('protocols', 'client_id', existing_type=postgresql.UUID(), nullable=False)
    op.alter_column('protocols', 'professional_id', existing_type=postgresql.UUID(), nullable=False)
    op.alter_column('protocols', 'tenant_id', existing_type=postgresql.UUID(), nullable=False)

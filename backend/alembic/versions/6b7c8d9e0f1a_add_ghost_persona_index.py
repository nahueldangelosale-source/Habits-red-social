"""Add Ghost Persona JSONB index

Revision ID: 6b7c8d9e0f1a
Revises: 43f6e3ca132e
Create Date: 2026-06-14 02:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '6b7c8d9e0f1a'
down_revision = '43f6e3ca132e'
branch_labels = None
depends_on = None

def upgrade():
    # Create GIN index for Ghost Persona lookup performance
    op.create_index(
        'idx_clients_extra_data_ghost', 
        'clients', 
        ['extra_data'], 
        unique=False, 
        postgresql_using='gin'
    )

def downgrade():
    op.drop_index('idx_clients_extra_data_ghost', table_name='clients', postgresql_using='gin')

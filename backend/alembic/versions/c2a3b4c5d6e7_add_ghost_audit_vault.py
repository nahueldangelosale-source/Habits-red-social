"""Add Ghost Audit Vault

Revision ID: c2a3b4c5d6e7
Revises: 6b7c8d9e0f1a
Create Date: 2026-06-14 02:46:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c2a3b4c5d6e7'
down_revision = '6b7c8d9e0f1a'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Crear la nueva tabla maestra abstracta particionada por RANGE para ghosts
    op.execute("""
        CREATE TABLE m2m_audit_vault_ghost (
            id UUID NOT NULL,
            client_id UUID,
            event_type VARCHAR(50),
            payload JSONB,
            stack_trace TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            CONSTRAINT pk_m2m_audit_vault_ghost PRIMARY KEY (id, created_at)
        ) PARTITION BY RANGE (created_at);
    """)
    op.create_index('ix_m2m_audit_vault_ghost_client_id', 'm2m_audit_vault_ghost', ['client_id'], unique=False)
    
    # 2. Crear las particiones iniciales (Junio, Julio, Agosto 2026)
    op.execute("""
        CREATE TABLE m2m_audit_vault_ghost_2026_06 
        PARTITION OF m2m_audit_vault_ghost 
        FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
    """)
    op.execute("""
        CREATE TABLE m2m_audit_vault_ghost_2026_07 
        PARTITION OF m2m_audit_vault_ghost 
        FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
    """)
    op.execute("""
        CREATE TABLE m2m_audit_vault_ghost_2026_08 
        PARTITION OF m2m_audit_vault_ghost 
        FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
    """)

def downgrade():
    op.execute("DROP TABLE m2m_audit_vault_ghost CASCADE;")

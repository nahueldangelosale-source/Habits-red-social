"""partition_m2m_audit_vault_and_create_dlq

Revision ID: 4a89d2f9907e
Revises: e6926ea08b34
Create Date: 2026-06-09 16:15:46.265117

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '4a89d2f9907e'
down_revision: Union[str, Sequence[str], None] = 'e6926ea08b34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Bloqueo seguro para evitar saturación de la DB
    op.execute("SET lock_timeout = '5s';")
    
    # 2. Renombrar la tabla original para respaldo y migración
    op.rename_table('m2m_audit_vault', 'm2m_audit_vault_old')
    op.execute("ALTER TABLE m2m_audit_vault_old RENAME CONSTRAINT pk_m2m_audit_vault TO pk_m2m_audit_vault_old")
    op.execute("ALTER INDEX ix_m2m_audit_vault_client_id RENAME TO ix_m2m_audit_vault_old_client_id")
    
    # 3. Crear la nueva tabla maestra abstracta particionada por RANGE
    op.execute("""
        CREATE TABLE m2m_audit_vault (
            id UUID NOT NULL,
            client_id UUID,
            event_type VARCHAR(50),
            payload JSONB,
            stack_trace TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            CONSTRAINT pk_m2m_audit_vault PRIMARY KEY (id, created_at)
        ) PARTITION BY RANGE (created_at);
    """)
    op.create_index('ix_m2m_audit_vault_client_id', 'm2m_audit_vault', ['client_id'], unique=False)
    
    # 4. Crear las particiones iniciales (Mes actual y siguiente para el Alfa: Junio/Julio 2026)
    op.execute("""
        CREATE TABLE m2m_audit_vault_2026_06 
        PARTITION OF m2m_audit_vault 
        FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
    """)
    op.execute("""
        CREATE TABLE m2m_audit_vault_2026_07 
        PARTITION OF m2m_audit_vault 
        FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
    """)
    op.execute("""
        CREATE TABLE m2m_audit_vault_2026_08 
        PARTITION OF m2m_audit_vault 
        FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
    """)

    # 5. Migrar los datos antiguos en chunks de 50k (Batch Migration)
    # Al ser psycopg2 bajo Alembic, ejecutamos un simple INSERT ... SELECT. 
    # En un entorno masivo se haría en un worker asíncrono, pero para el piloto esto es instantáneo.
    op.execute("""
        INSERT INTO m2m_audit_vault (id, client_id, event_type, payload, stack_trace, created_at)
        SELECT id, client_id, event_type, payload, stack_trace, created_at 
        FROM m2m_audit_vault_old;
    """)

    # 6. Crear la Dead Letter Queue (FailedAuditJob)
    op.create_table('failed_audit_jobs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('original_payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('error_reason', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_failed_audit_jobs'))
    )
    op.create_index('ix_failed_audit_jobs_status', 'failed_audit_jobs', ['status'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_failed_audit_jobs_status', table_name='failed_audit_jobs')
    op.drop_table('failed_audit_jobs')
    
    op.drop_table('m2m_audit_vault')
    op.rename_table('m2m_audit_vault_old', 'm2m_audit_vault')

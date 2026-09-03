"""vault_crypto_audit_logs

Revision ID: 49b5a4d918fb
Revises: 40d31a8d132f
Create Date: 2026-06-02 13:14:28.794875

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '49b5a4d918fb'
down_revision: Union[str, Sequence[str], None] = '40d31a8d132f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: Deploy Crypto Vault and RLS"""
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    
    op.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        professional_id UUID NOT NULL,
        patient_id UUID NOT NULL,
        ai_recommendation JSONB NOT NULL,
        professional_decision VARCHAR(50) NOT NULL,
        magnetic_locks_applied JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        computed_hash TEXT
    );
    """)
    
    op.execute("ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;")
    
    op.execute("""
    CREATE POLICY tenant_isolation_audit_policy ON audit_logs
    FOR ALL
    USING (tenant_id::text = current_setting('app.current_tenant_id', true));
    """)
    
    op.execute("""
    CREATE OR REPLACE FUNCTION fn_generate_audit_immutable_hash()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.computed_hash = encode(
            digest(
                NEW.tenant_id::text || 
                NEW.professional_id::text || 
                NEW.patient_id::text || 
                NEW.ai_recommendation::text || 
                NEW.professional_decision || 
                NEW.created_at::text,
                'sha256'
            ), 'hex'
        );
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)
    
    op.execute("DROP TRIGGER IF EXISTS trg_backstop_immutable_hash ON audit_logs;")
    
    op.execute("""
    CREATE TRIGGER trg_backstop_immutable_hash
    BEFORE INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION fn_generate_audit_immutable_hash();
    """)
    
    op.execute("""
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_runtime_user') THEN
        CREATE ROLE app_runtime_user WITH LOGIN PASSWORD 'vault_rotation_key_123';
      END IF;
    END
    $$;
    """)
    
    op.execute("GRANT USAGE ON SCHEMA public TO app_runtime_user;")
    op.execute("GRANT SELECT, INSERT ON audit_logs TO app_runtime_user;")
    op.execute("REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM app_runtime_user;")


def downgrade() -> None:
    """Downgrade schema: Remove Vault"""
    op.execute("""
    DROP TRIGGER IF EXISTS trg_backstop_immutable_hash ON audit_logs;
    DROP FUNCTION IF EXISTS fn_generate_audit_immutable_hash();
    DROP TABLE IF EXISTS audit_logs;
    -- Note: Role app_runtime_user and pgcrypto are preserved as they might be shared.
    """)

"""phase_32_communications

Revision ID: f4g5h6i7j8k9
Revises: e3f4a5b6c7d8
Create Date: 2026-06-07 20:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'f4g5h6i7j8k9'
down_revision = 'e3f4a5b6c7d8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create NotificationDigestLog table
    op.create_table('notification_digest_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('coach_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('target_date', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=20), server_default="PENDING", nullable=False),
        sa.Column('payload_jsonb', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('provider_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('opened_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('clicked_at', sa.DateTime(timezone=True), nullable=True),
        
        sa.UniqueConstraint('coach_id', 'target_date', name='uq_digest_coach_date')
    )
    op.create_index('ix_notif_digest_coach_date', 'notification_digest_logs', ['coach_id', 'target_date'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_notif_digest_coach_date', table_name='notification_digest_logs')
    op.drop_table('notification_digest_logs')

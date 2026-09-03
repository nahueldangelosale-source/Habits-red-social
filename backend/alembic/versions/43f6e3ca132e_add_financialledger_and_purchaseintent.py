"""Add FinancialLedger and PurchaseIntent

Revision ID: 43f6e3ca132e
Revises: ddaf712d9a19
Create Date: 2026-06-11 16:53:51.277697

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '43f6e3ca132e'
down_revision: Union[str, Sequence[str], None] = 'ddaf712d9a19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('financial_ledger',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.String(), nullable=False),
        sa.Column('amount_cents', sa.BigInteger(), nullable=False),
        sa.Column('transaction_type', sa.String(), nullable=False),
        sa.Column('reference_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('reference_id')
    )
    op.create_index('idx_tenant_created', 'financial_ledger', ['tenant_id', 'created_at'], unique=False)
    op.create_index(op.f('ix_financial_ledger_tenant_id'), 'financial_ledger', ['tenant_id'], unique=False)

    op.create_table('purchase_intents',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('tenant_id', sa.String(), nullable=False),
        sa.Column('idempotency_key', sa.String(), nullable=False),
        sa.Column('amount_cents', sa.BigInteger(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id', 'idempotency_key', name='uq_tenant_idempotency')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('purchase_intents')
    op.drop_index(op.f('ix_financial_ledger_tenant_id'), table_name='financial_ledger')
    op.drop_index('idx_tenant_created', table_name='financial_ledger')
    op.drop_table('financial_ledger')

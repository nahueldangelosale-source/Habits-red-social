"""phase_34_billing_plumbing

Revision ID: l0m1n2o3p4q5
Revises: g5h6i7j8k9l0
Create Date: 2026-06-07 21:05:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'l0m1n2o3p4q5'
down_revision = 'g5h6i7j8k9l0'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Feature Capabilities
    op.create_table('feature_capabilities',
        sa.Column('id', sa.String(length=50), primary_key=True),
        sa.Column('description', sa.String(length=255), nullable=True)
    )

    # 2. Subscription Plans
    op.create_table('subscription_plans',
        sa.Column('id', sa.String(length=50), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('price_monthly', sa.Integer(), server_default="0", nullable=False),
        sa.Column('currency', sa.String(length=3), server_default="USD", nullable=False)
    )

    # 3. Plan Capability Links
    op.create_table('plan_capability_links',
        sa.Column('plan_id', sa.String(length=50), sa.ForeignKey("subscription_plans.id", ondelete="CASCADE"), primary_key=True),
        sa.Column('capability_id', sa.String(length=50), sa.ForeignKey("feature_capabilities.id", ondelete="CASCADE"), primary_key=True)
    )

    # 4. Tenant Subscriptions
    op.create_table('tenant_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('plan_id', sa.String(length=50), sa.ForeignKey("subscription_plans.id"), nullable=False),
        sa.Column('status', sa.String(length=20), server_default="ACTIVE", nullable=False),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=True)
    )

    op.create_unique_constraint('uq_tenant_subscription', 'tenant_subscriptions', ['tenant_id'])
    op.create_index('ix_tenant_subscription_tenant_id', 'tenant_subscriptions', ['tenant_id'], unique=False)
    
    # --- SEED DATA ---
    op.execute("INSERT INTO subscription_plans (id, name, price_monthly) VALUES ('PLG_FREE', 'PLG Growth Plan', 0)")
    op.execute("INSERT INTO feature_capabilities (id, description) VALUES ('ADVANCED_ROI_DASHBOARD', 'Acceso al Dashboard de Impacto B2B')")
    op.execute("INSERT INTO feature_capabilities (id, description) VALUES ('AUTOMATED_WHATSAPP_HOOKS', 'Automatización de alertas WhatsApp')")
    op.execute("INSERT INTO plan_capability_links (plan_id, capability_id) VALUES ('PLG_FREE', 'ADVANCED_ROI_DASHBOARD')")
    op.execute("INSERT INTO plan_capability_links (plan_id, capability_id) VALUES ('PLG_FREE', 'AUTOMATED_WHATSAPP_HOOKS')")


def downgrade() -> None:
    op.drop_index('ix_tenant_subscription_tenant_id', table_name='tenant_subscriptions')
    op.drop_table('tenant_subscriptions')
    op.drop_table('plan_capability_links')
    op.drop_table('subscription_plans')
    op.drop_table('feature_capabilities')

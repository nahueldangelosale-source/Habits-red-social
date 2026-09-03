"""Initial schema - Bienestar APP Core Models

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-02-05

Creates:
- tenants: Multi-tenant organizations
- professionals: Coaches/Nutritionists
- clients: End users
- protocols: Flexible JSONB diet/routine plans
- chart_records: Voice-to-Chart SOAP records
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "vector"')
    
    # Tenants table
    op.create_table(
        'tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('settings', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('ai_messages_used', sa.Integer, nullable=False, server_default='0'),
        sa.Column('ai_messages_limit', sa.Integer, nullable=False, server_default='1000'),
        sa.Column('stripe_account_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
    )
    
    # Professionals table
    op.create_table(
        'professionals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('auth_user_id', sa.String(255), nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('specialty', sa.String(20), nullable=False, server_default='hybrid'),
        sa.Column('bio', sa.Text, nullable=True),
        sa.Column('coaching_style', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_professionals_tenant_email', 'professionals', ['tenant_id', 'email'], unique=True)
    
    # Clients table
    op.create_table(
        'clients',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('professional_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('professionals.id', ondelete='SET NULL'), nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('whatsapp_id', sa.String(50), nullable=True),
        sa.Column('birth_date', sa.DateTime, nullable=True),
        sa.Column('height_cm', sa.Float, nullable=True),
        sa.Column('sync_status', sa.String(20), nullable=False, server_default='synced'),
        sa.Column('last_synced_at', sa.DateTime, nullable=True),
        sa.Column('extra_data', postgresql.JSONB, nullable=True, server_default='{}'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_clients_tenant_phone', 'clients', ['tenant_id', 'phone'])
    op.create_index('ix_clients_whatsapp', 'clients', ['whatsapp_id'])
    
    # Protocols table
    op.create_table(
        'protocols',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('data', postgresql.JSONB, nullable=False),
        sa.Column('version', sa.Integer, nullable=False, server_default='1'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('starts_at', sa.DateTime, nullable=True),
        sa.Column('ends_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_protocols_client_type', 'protocols', ['client_id', 'type'])
    op.create_index('ix_protocols_active', 'protocols', ['is_active'])
    
    # Add vector embedding column using raw SQL (pgvector type)
    op.execute('ALTER TABLE protocols ADD COLUMN vector_embedding vector(1536)')
    
    
    # Chart Records table
    op.create_table(
        'chart_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('client_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False),
        sa.Column('professional_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('professionals.id', ondelete='SET NULL'), nullable=True),
        sa.Column('consultation_date', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('soap_data', postgresql.JSONB, nullable=False),
        sa.Column('transcription_confidence', sa.Float, nullable=False, server_default='0.0'),
        sa.Column('extraction_confidence', sa.Float, nullable=False, server_default='0.0'),
        sa.Column('raw_transcription', sa.Text, nullable=True),
        sa.Column('requires_review', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('reviewed_at', sa.DateTime, nullable=True),
        sa.Column('reviewed_by_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_chart_records_client_date', 'chart_records', ['client_id', 'consultation_date'])
    op.create_index('ix_chart_records_review', 'chart_records', ['requires_review'])


def downgrade() -> None:
    op.drop_table('chart_records')
    op.drop_table('protocols')
    op.drop_table('clients')
    op.drop_table('professionals')
    op.drop_table('tenants')

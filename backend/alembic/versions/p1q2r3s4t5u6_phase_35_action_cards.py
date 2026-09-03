"""phase_35_action_cards

Revision ID: p1q2r3s4t5u6
Revises: l0m1n2o3p4q5
Create Date: 2026-06-07 21:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'p1q2r3s4t5u6'
down_revision = 'l0m1n2o3p4q5'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Action Card Templates
    op.create_table('action_card_templates',
        sa.Column('id', sa.String(length=50), primary_key=True),
        sa.Column('trigger_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('content_template', sa.String(length=500), nullable=False),
        sa.Column('confidence_base', sa.Float(), server_default="1.0", nullable=False)
    )

    # 2. Action Cards
    op.create_table('action_cards',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('coach_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('athlete_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('template_id', sa.String(length=50), sa.ForeignKey("action_card_templates.id"), nullable=False),
        sa.Column('context_payload', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('status', sa.String(length=20), server_default="PENDING_REVIEW", nullable=False),
        sa.Column('priority_score', sa.Float(), server_default="0.0", nullable=False),
        sa.Column('was_useful', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_index('ix_action_cards_coach_status', 'action_cards', ['coach_id', 'status'], unique=False)
    
    # --- SEED DATA ---
    op.execute("""
        INSERT INTO action_card_templates (id, trigger_type, title, content_template) 
        VALUES ('CHURN_RISK_ABSENCE', 'CHURN_RISK', 'Riesgo de Abandono', '¡Hola {athlete_name}! He notado que te saltaste las últimas 2 rutinas. ¿Todo bien? Estoy aquí para ajustar las cargas si estás con fatiga. ¡Vamos que no decaiga!')
    """)
    op.execute("""
        INSERT INTO action_card_templates (id, trigger_type, title, content_template) 
        VALUES ('SOCIAL_ISOLATION', 'SOCIAL_ISOLATION', 'Aislamiento Social', '¡Ey {athlete_name}! El Squad extraña verte en el Leaderboard esta semana. Sube tu próximo workout y anímales un poco. ¡Tú marcas el ritmo!')
    """)
    op.execute("""
        INSERT INTO action_card_templates (id, trigger_type, title, content_template) 
        VALUES ('STREAK_ACHIEVED', 'STREAK_ACHIEVED', 'Racha Imparable', '¡Felicidades {athlete_name}! Alcanzaste {streak_days} días consecutivos. Tu consistencia es brutal. Sigue así y este mes rompemos todos tus PRs.')
    """)


def downgrade() -> None:
    op.drop_index('ix_action_cards_coach_status', table_name='action_cards')
    op.drop_table('action_cards')
    op.drop_table('action_card_templates')

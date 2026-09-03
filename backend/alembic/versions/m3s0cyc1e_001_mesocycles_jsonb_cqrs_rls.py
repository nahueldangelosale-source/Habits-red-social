"""Mesocycles JSONB + CQRS-Lite + Zero-Trust RLS + Auth Hook

Revision ID: m3s0cyc1e_001
Revises: 2ad4e4dc62eb
Create Date: 2026-06-17 17:19:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'm3s0cyc1e_001'
down_revision: Union[str, Sequence[str], None] = '2ad4e4dc62eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Levanta la arquitectura de persistencia del Cascade Builder:
    1. Tabla transaccional `mesocycles` (OLTP - JSONB atómico)
    2. Índices compuestos para multitenencia
    3. Row Level Security Zero-Trust con auth.jwt()
    4. Auth Hook para inyectar tenant_id en JWT Claims
    5. Vista Materializada CQRS-Lite para analítica B2B (OLAP)
    """

    # =========================================================================
    # 1. TABLA TRANSACCIONAL: mesocycles (OLTP)
    # =========================================================================
    op.create_table(
        'mesocycles',
        sa.Column('id', sa.UUID(), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('tenant_id', sa.UUID(), nullable=False),
        sa.Column('client_id', sa.UUID(), nullable=False),
        sa.Column('coach_id', sa.UUID(), nullable=False),
        sa.Column('taxonomy_id', sa.String(50), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('routine_structure', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('nutrition_plan', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('telemetry_snapshot', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('version', sa.Integer(), server_default='1', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['coach_id'], ['professionals.id'], ondelete='SET NULL'),
    )

    # =========================================================================
    # 2. ÍNDICES COMPUESTOS (Multitenencia + Analítica)
    # =========================================================================

    # Índice principal: Alineado con el filtro RLS implícito (tenant_id) + búsqueda por cliente
    op.create_index(
        'idx_mesocycles_tenant_client',
        'mesocycles',
        ['tenant_id', 'client_id']
    )

    # Índice para búsqueda de mesociclos activos por coach
    op.create_index(
        'idx_mesocycles_coach_active',
        'mesocycles',
        ['coach_id', 'is_active']
    )

    # Índice GIN para consultas ad-hoc dentro del JSONB (opcional pero potente)
    op.execute(
        'CREATE INDEX idx_mesocycles_routine_gin ON mesocycles USING GIN (routine_structure);'
    )

    # =========================================================================
    # 3. ROW LEVEL SECURITY: Zero-Trust Multitenancy (auth.jwt())
    # =========================================================================
    op.execute('ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;')

    # Política Maestra: Aísla lectura y escritura por tenant_id del JWT
    op.execute("""
        CREATE POLICY "mesocycles_strict_tenant_isolation"
        ON mesocycles
        FOR ALL
        TO authenticated
        USING (
            tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
        )
        WITH CHECK (
            tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
        );
    """)

    # =========================================================================
    # 4. AUTH HOOK: Inyección de tenant_id en Custom JWT Claims
    # =========================================================================
    # Este hook intercepta la generación del token de sesión y añade el
    # tenant_id al bloque app_metadata del JWT, eliminando la necesidad de
    # subconsultas dentro del RLS.
    op.execute("""
        CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
        RETURNS jsonb
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $$
        DECLARE
            current_tenant_id uuid;
            claims jsonb;
        BEGIN
            -- 1. Resolver el tenant_id del profesional que inicia sesión
            SELECT p.tenant_id INTO current_tenant_id
            FROM public.professionals p
            WHERE p.auth_user_id = (event ->> 'user_id')
            LIMIT 1;

            -- 2. Si no se encuentra el profesional, retornar el evento sin modificar
            IF current_tenant_id IS NULL THEN
                RETURN event;
            END IF;

            -- 3. Extraer claims actuales
            claims := event -> 'claims';

            -- 4. Inyectar tenant_id en app_metadata de manera segura
            IF claims -> 'app_metadata' IS NULL THEN
                claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
            END IF;
            
            claims := jsonb_set(
                claims,
                '{app_metadata, tenant_id}',
                to_jsonb(current_tenant_id)
            );

            -- 5. Devolver el evento modificado al pipeline de autenticación
            event := jsonb_set(event, '{claims}', claims);

            RETURN event;
        END;
        $$;
    """)

    # Garantizar que el rol de Supabase Auth puede ejecutar la función
    op.execute('GRANT USAGE ON SCHEMA public TO supabase_auth_admin;')
    op.execute('GRANT SELECT ON public.professionals TO supabase_auth_admin;')

    # =========================================================================
    # 5. VISTA MATERIALIZADA CQRS-Lite (OLAP - Analítica B2B)
    # =========================================================================
    # Aplana el JSONB jerárquico en filas relacionales para que el Dashboard B2B
    # ejecute JOINs y agregaciones sin tocar la tabla transaccional.
    op.execute("""
        CREATE MATERIALIZED VIEW analytics_routine_items AS
        SELECT
            m.id AS mesocycle_id,
            m.tenant_id,
            m.client_id,
            m.coach_id,
            m.taxonomy_id,
            m.created_at,
            day_data ->> 'id' AS day_id,
            day_data ->> 'name' AS day_name,
            item_data ->> 'type' AS item_type,
            item_data ->> 'exercise_id' AS exercise_id,
            item_data ->> 'block_id' AS block_id,
            (item_data ->> 'sets')::int AS sets,
            (item_data ->> 'reps')::int AS reps,
            item_data ->> 'rpe' AS rpe,
            (item_data ->> 'is_swapped')::boolean AS is_swapped,
            item_data ->> 'clinical_rationale' AS clinical_rationale
        FROM mesocycles m,
        LATERAL jsonb_array_elements(m.routine_structure -> 'days') AS day_data,
        LATERAL jsonb_array_elements(day_data -> 'items') AS item_data
        WHERE m.is_active = true
        WITH NO DATA;
    """)

    # Índice Único requerido para REFRESH CONCURRENTLY
    op.execute("""
        CREATE UNIQUE INDEX idx_analytics_routine_items_unique
        ON analytics_routine_items (mesocycle_id, day_id, exercise_id);
    """)

    # Índices analíticos para el Dashboard B2B
    op.execute(
        'CREATE INDEX idx_analytics_tenant ON analytics_routine_items (tenant_id);'
    )
    op.execute(
        'CREATE INDEX idx_analytics_exercise ON analytics_routine_items (exercise_id);'
    )
    op.execute(
        'CREATE INDEX idx_analytics_swapped ON analytics_routine_items (is_swapped) WHERE is_swapped = true;'
    )


def downgrade() -> None:
    """Rollback completo de la arquitectura del Cascade Builder."""

    # 5. Eliminar Vista Materializada
    op.execute('DROP MATERIALIZED VIEW IF EXISTS analytics_routine_items CASCADE;')

    # 4. Eliminar Auth Hook
    op.execute('DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb) CASCADE;')

    # 3. Eliminar políticas RLS
    op.execute('DROP POLICY IF EXISTS "mesocycles_strict_tenant_isolation" ON mesocycles;')

    # 2. Eliminar índices
    op.execute('DROP INDEX IF EXISTS idx_mesocycles_routine_gin;')
    op.drop_index('idx_mesocycles_coach_active', table_name='mesocycles')
    op.drop_index('idx_mesocycles_tenant_client', table_name='mesocycles')

    # 1. Eliminar tabla
    op.drop_table('mesocycles')

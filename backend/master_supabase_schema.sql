-- =============================================================================
-- BIENESTAR APP — MASTER SUPABASE / POSTGRESQL SCHEMA (SSOT)
-- Fase 90 — Production Readiness (FSD & Zero-Trust Architecture)
-- =============================================================================

BEGIN;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. ENUMS (Idempotent Definition)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'professionalspecialty') THEN
        CREATE TYPE professionalspecialty AS ENUM ('NUTRITIONIST', 'PERSONAL_TRAINER', 'HYBRID');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'protocoltype') THEN
        CREATE TYPE protocoltype AS ENUM ('STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'MOBILITY', 'CUSTOM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'protocolstatus') THEN
        CREATE TYPE protocolstatus AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clientextraflags') THEN
        CREATE TYPE clientextraflags AS ENUM ('IS_GLP1', 'INJURY_RISK');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activeplanstatus') THEN
        CREATE TYPE activeplanstatus AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED', 'DRAFT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'syncstatus') THEN
        CREATE TYPE syncstatus AS ENUM ('SYNCED', 'PENDING', 'CONFLICT', 'OFFLINE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
        CREATE TYPE paymentstatus AS ENUM ('active', 'past_due', 'manual', 'trial');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intentcategory') THEN
        CREATE TYPE intentcategory AS ENUM ('training', 'nutrition', 'billing', 'general');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plantier') THEN
        CREATE TYPE plantier AS ENUM ('FREE', 'STARTER', 'PRO', 'ELITE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscriptiontier') THEN
        CREATE TYPE subscriptiontier AS ENUM ('FREE', 'PRO');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentprovider') THEN
        CREATE TYPE paymentprovider AS ENUM ('MERCADO_PAGO', 'STRIPE', 'NONE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'musclegroup') THEN
        CREATE TYPE musclegroup AS ENUM ('CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
        CREATE TYPE role AS ENUM ('NUTRITIONIST', 'PERSONAL_TRAINER', 'ADMIN', 'CLIENT_NUTRITION', 'CLIENT_FITNESS', 'CLIENT_HYBRID');
    END IF;
END $$;

-- =============================================================================
-- DOMINIO 1: TENANTS & MULTI-TENANCY RBAC
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}' NOT NULL,
    primary_color VARCHAR(50) DEFAULT '#CEFF00',
    secondary_color VARCHAR(50) DEFAULT '#3b82f6',
    compute_units_balance BIGINT DEFAULT 500000 NOT NULL,
    subscription_price NUMERIC(10, 2) DEFAULT 20.0,
    fee_bps INTEGER DEFAULT 1000,
    currency VARCHAR(10) DEFAULT 'USD',
    plan_tier plantier DEFAULT 'PRO',
    subscription_tier subscriptiontier DEFAULT 'FREE',
    payment_provider paymentprovider DEFAULT 'NONE',
    subscription_status VARCHAR(50) DEFAULT 'ACTIVE',
    payment_status VARCHAR(50) DEFAULT 'active',
    referral_reward_claimed BOOLEAN DEFAULT FALSE,
    ff_checkout_v2 BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role role NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_tenant_role UNIQUE (user_id, tenant_id, role)
);

CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    specialty professionalspecialty DEFAULT 'HYBRID' NOT NULL,
    bio TEXT,
    coaching_style TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_tenant_pro_email UNIQUE (tenant_id, email)
);

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp_id VARCHAR(50),
    birth_date TIMESTAMP WITH TIME ZONE,
    height_cm FLOAT,
    sync_status syncstatus DEFAULT 'SYNCED' NOT NULL,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    extra_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- DOMINIO 2: BIOMECÁNICA, LESIONES & EJERCICIOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS gym_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    muscle_group musclegroup NOT NULL,
    movement_pattern VARCHAR(100),
    mechanic VARCHAR(50),
    equipment VARCHAR(100),
    axial_load BOOLEAN DEFAULT FALSE,
    video_url TEXT,
    thumbnail_url TEXT,
    instructions TEXT,
    is_system_standard BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS injury_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    injury_code VARCHAR(50) UNIQUE NOT NULL,
    joint_region VARCHAR(100) NOT NULL,
    contraindicated_movement VARCHAR(100) NOT NULL,
    recommended_swap_pattern VARCHAR(100) NOT NULL,
    clinical_rationale TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- DOMINIO 3: ENTRENAMIENTO, PROTOCOLOS & MESOCICLOS
-- =============================================================================

CREATE TABLE IF NOT EXISTS protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type protocoltype NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data JSONB NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    vector_embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS mesocycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    weeks_count INTEGER DEFAULT 4 NOT NULL,
    current_week INTEGER DEFAULT 1 NOT NULL,
    status protocolstatus DEFAULT 'ACTIVE' NOT NULL,
    structure JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    days_count INTEGER DEFAULT 4 NOT NULL,
    is_template BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    focus VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS athlete_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    draft_type VARCHAR(50) NOT NULL, -- 'WORKOUT' | 'NUTRITION'
    payload JSONB NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_athlete_draft_type UNIQUE (client_id, draft_type)
);

-- =============================================================================
-- DOMINIO 4: TELEMETRÍA, SETS OFFLINE & MATH ENGINE
-- =============================================================================

CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    exercise_id VARCHAR(100) NOT NULL,
    protocol_id UUID,
    target_reps INTEGER NOT NULL,
    target_weight FLOAT NOT NULL,
    actual_reps INTEGER,
    actual_weight FLOAT,
    rpe FLOAT,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    is_unscheduled BOOLEAN DEFAULT FALSE NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    client_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_athlete_set_idempotency UNIQUE (athlete_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_workout_sets_lookup ON workout_sets (athlete_id, exercise_id, protocol_id, is_completed, is_unscheduled);
CREATE INDEX IF NOT EXISTS idx_workout_sets_client_date ON workout_sets (client_created_at DESC);

-- =============================================================================
-- DOMINIO 5: NUTRICIÓN & BROMATOLOGÍA SARA (834 ITEMS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS sara_food_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    source VARCHAR(50) DEFAULT 'SARA', -- 'SARA' | 'USDA' | 'CUSTOM'
    energy_kcal FLOAT NOT NULL,
    protein_g FLOAT NOT NULL,
    available_carbs_g FLOAT NOT NULL,
    total_fat_g FLOAT NOT NULL,
    dietary_fiber_g FLOAT DEFAULT 0.0,
    sodium_mg FLOAT DEFAULT 0.0,
    dominant_macro VARCHAR(20),
    tags TEXT[] DEFAULT '{}',
    is_gluten_free BOOLEAN DEFAULT FALSE,
    is_lactose_free BOOLEAN DEFAULT TRUE,
    is_vegan BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sara_food_name_trgm ON sara_food_items USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sara_food_category ON sara_food_items (category);

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    servings INTEGER DEFAULT 1 NOT NULL,
    prep_time_min INTEGER DEFAULT 15,
    ingredients JSONB NOT NULL,
    total_macros JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories INTEGER NOT NULL,
    protein_g FLOAT NOT NULL,
    carbs_g FLOAT NOT NULL,
    fat_g FLOAT NOT NULL,
    meals JSONB NOT NULL,
    carb_cycling_enabled BOOLEAN DEFAULT FALSE,
    active_shields TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- DOMINIO 6: MONETIZACIÓN & FINANCIAL LEDGER INMUTABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS purchase_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    amount_cents BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    ai_priority VARCHAR(10),
    ai_triage_category VARCHAR(100),
    ai_analysis_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_tenant_idempotency UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS financial_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    amount_cents BIGINT NOT NULL, -- Positivo (ingreso), Negativo (egreso)
    transaction_type VARCHAR(100) NOT NULL, -- 'SUBSCRIPTION_PAYMENT', 'REFUND', etc.
    reference_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tenant_ledger_created ON financial_ledger (tenant_id, created_at DESC);

-- =============================================================================
-- DOMINIO 7: COMUNICACIONES & AGORA SOBERANA
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    channel VARCHAR(50) DEFAULT 'IN_APP', -- 'IN_APP' | 'WHATSAPP'
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(50) NOT NULL, -- 'PROFESSIONAL' | 'CLIENT' | 'AI_COPILOT'
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS action_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'P2', -- 'P1', 'P2', 'P3'
    action_type VARCHAR(50) NOT NULL,
    payload JSONB DEFAULT '{}',
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- DOMINIO 8: CLÍNICA, XAI & AUDITORÍA SRE (M2M VAULT)
-- =============================================================================

CREATE TABLE IF NOT EXISTS clinical_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    doc_type VARCHAR(100) NOT NULL, -- 'LAB_RESULTS', 'INJURY_ASSESSMENT', 'DXA'
    storage_url TEXT NOT NULL,
    ai_extracted_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS m2m_audit_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    tenant_id VARCHAR(100),
    athlete_id VARCHAR(100),
    payload JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'Low' NOT NULL, -- 'High' | 'Low'
    is_unscheduled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_m2m_audit_event ON m2m_audit_vault (event_type, severity, created_at DESC);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES (Zero-Trust)
-- =============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento multi-tenant seguras
CREATE POLICY tenant_isolation_policy ON clients
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_workout_sets ON workout_sets
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE POLICY tenant_isolation_nutrition_plans ON nutrition_plans
    FOR ALL
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

COMMIT;

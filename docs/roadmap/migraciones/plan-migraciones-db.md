# Plan de Migraciones de Base de Datos

> **Bienestar APP** — Motor de Persistencia & Migraciones Relacionales  
> **Especificación Técnica para Alembic / PostgreSQL (Julio 2026 – Julio 2027)**

---

## 1. Estrategia General de Migración

Para garantizar la máxima disponibilidad del servicio (Zero-Downtime Deployment) y evitar interrupciones en la experiencia de los profesionales y atletas, todas las migraciones de base de datos se rigen bajo los siguientes tres principios fundamentales:

### 1.1. Feature Flags (Banderas de Características)
* **Principio:** Los cambios en la estructura de base de datos (DDL) se ejecutan antes del despliegue del código de aplicación correspondiente.
* **Mecanismo:** Cada nueva funcionalidad respaldada por un cambio de esquema se oculta detrás de una Feature Flag en la aplicación (ej: `FF_RUNNING_METRICS`, `FF_CLINICAL_FIREWALLS`, `FF_GARMIN_TELEMETRY`).
* **Secuencia de Despliegue:**
  1. Aplicar migración DDL en PostgreSQL (Alembic `upgrade head`).
  2. Desplegar nuevo código backend/frontend con la Feature Flag desactivada (`false`).
  3. Ejecutar scripts de Data Migration o verificación en caliente.
  4. Habilitar gradualmente la Feature Flag por Tenant o porcentaje de usuarios (Canary release: 10% → 50% → 100%).

### 1.2. Blue-Green Deployments & Patrón Expand/Contract
* **Principio:** Modificaciones transparentes sobre esquemas en producción sin bloqueos prolongados de tablas (*table locks*).
* **Fase de Expansión (Expand):**
  * Se añaden nuevas tablas, columnas o tipos ENUM como opcionales (`NULLABLE` o con `DEFAULT` constante).
  * No se renombran ni eliminan columnas existentes en la versión activa.
  * Escritura dual: El backend escribe en la estructura legacy y en la nueva estructura simultáneamente.
* **Fase de Contracción (Contract):**
  * Una vez validada la versión Green y migrados los datos históricos, se elimina la estructura legacy mediante una migración posterior diferida.

### 1.3. Reglas de Backward Compatibility (Compatibilidad Hacia Atrás)
* **Regla 1 (No breaking DDL):** La versión en ejecución $N-1$ de la API debe continuar operando sin errores tras la ejecución de la migración del release $N$.
* **Regla 2 (Locks de baja duración):** Todas las migraciones DDL deben configurar `SET lock_timeout = '5s';` para prevenir encolamiento de consultas en tablas de alto tráfico.
* **Regla 3 (Columnas NOT NULL):** Prohibido agregar columnas `NOT NULL` sin especificar un valor `DEFAULT` inmediato o permitir temporalmente `NULL`.
* **Regla 4 (Índices concurrentes):** La creación de índices en tablas grandes debe usar `CREATE INDEX CONCURRENTLY` para evitar lockeos de lectura/escritura.

---

## 2. Especificación Detallada de Migraciones

---

### Migración 001 — Disciplinas y Métricas Extendidas

#### Identificación y Contexto
* **Alembic Revision:** `20260801_001_add_disciplines_and_extended_metrics`
* **Dependencia:** `head` (Revisión actual de producción)
* **Objetivo:** Soporte para modalidades de Running, métricas biomecánicas estructuradas y parametrización de disciplinas.

#### Esquema de Base de Datos (DDL)

```sql
-- 1. Nueva tabla para configuración de disciplinas
CREATE TABLE discipline_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'STRENGTH', 'RUNNING', 'CROSSFIT', 'CYCLING'
    default_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Nueva tabla para métricas extendidas por objetivo de ejercicio
CREATE TYPE metric_type_enum AS ENUM (
    'PACE', 'DISTANCE', 'HEART_RATE_ZONE', 'CADENCE', 
    'FTP', 'TSS', 'REPS', 'WEIGHT', 'TIME'
);

CREATE TABLE exercise_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_target_id UUID NOT NULL REFERENCES exercise_targets(id) ON DELETE CASCADE,
    metric_type metric_type_enum NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_metrics_target ON exercise_metrics(exercise_target_id);

-- 3. Modificaciones a tablas existentes
ALTER TABLE workout_plans 
    ADD COLUMN discipline VARCHAR(50) NOT NULL DEFAULT 'STRENGTH';

ALTER TABLE exercise_targets 
    ADD COLUMN pace_min_km DECIMAL(5,2) NULL,
    ADD COLUMN distance_km DECIMAL(8,2) NULL,
    ADD COLUMN hr_zone INT NULL,
    ADD COLUMN cadence_spm INT NULL,
    ADD COLUMN ftp_watts INT NULL,
    ADD COLUMN tss DECIMAL(6,2) NULL;
```

#### Estrategia de Rollback (`downgrade`)
```python
def downgrade():
    op.drop_column('exercise_targets', 'tss')
    op.drop_column('exercise_targets', 'ftp_watts')
    op.drop_column('exercise_targets', 'cadence_spm')
    op.drop_column('exercise_targets', 'hr_zone')
    op.drop_column('exercise_targets', 'distance_km')
    op.drop_column('exercise_targets', 'pace_min_km')
    op.drop_column('workout_plans', 'discipline')
    op.drop_table('exercise_metrics')
    op.execute("DROP TYPE metric_type_enum;")
    op.drop_table('discipline_configs')
```

#### Data Migration Notes
* Carga inicial de datos semilla (*seed data*) en `discipline_configs`:
  * `STRENGTH`: Campos por defecto `{ "sets": true, "reps": true, "weight": true }`.
  * `RUNNING`: Campos por defecto `{ "distance_km": true, "pace_min_km": true, "hr_zone": true, "cadence_spm": true }`.
  * `CROSSFIT`: Campos por defecto `{ "wod_type": true, "scaling": true, "time_cap": true }`.

#### Impacto Estimado
* **Impacto en Producción:** Bajo. La adición de columnas opcionales con `DEFAULT` en `workout_plans` toma < 20ms. No requiere downtime.

---

### Migración 002 — Correlación Training ↔ Nutrition

#### Identificación y Contexto
* **Alembic Revision:** `20260915_002_add_training_nutrition_correlations`
* **Dependencia:** `20260801_001_add_disciplines_and_extended_metrics`
* **Objetivo:** Infraestructura para el Correlation Engine v1, asociando ciclos de entrenamiento con fases nutricionales y alertas de incompatibilidad.

#### Esquema de Base de Datos (DDL)

```sql
-- 1. Reglas de correlación predefinidas y configurables
CREATE TABLE correlation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_cycle_id UUID NOT NULL,
    nutrition_phase_id UUID NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    macro_ratio_cho INT NOT NULL, -- Porcentaje de Carbohidratos (ej: 50)
    macro_ratio_pro INT NOT NULL, -- Porcentaje de Proteínas (ej: 30)
    macro_ratio_fat INT NOT NULL, -- Porcentaje de Grasas (ej: 20)
    caloric_adjustment INT NOT NULL DEFAULT 0, -- Delta calórico (+500, -300 kcal)
    is_warning BOOLEAN NOT NULL DEFAULT false,
    warning_message TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Registro de correlaciones aplicadas entre planes reales
CREATE TYPE correlation_status_enum AS ENUM ('suggested', 'accepted', 'overridden');

CREATE TABLE plan_correlations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    nutrition_plan_id UUID NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
    correlation_rule_id UUID NULL REFERENCES correlation_rules(id) ON DELETE SET NULL,
    status correlation_status_enum NOT NULL DEFAULT 'suggested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plan_correlations_workout ON plan_correlations(workout_plan_id);
CREATE INDEX idx_plan_correlations_nutrition ON plan_correlations(nutrition_plan_id);
```

#### Estrategia de Rollback (`downgrade`)
```python
def downgrade():
    op.drop_table('plan_correlations')
    op.execute("DROP TYPE correlation_status_enum;")
    op.drop_table('correlation_rules')
```

#### Data Migration Notes
* Inserción de 5 reglas de correlación estándar predeterminadas (Fuerza Máxima ↔ Nutrición Isocalórica; Hipertrofia ↔ Superávit Calórico +20%; Resistencia ↔ Periodización de Carbohidratos).

#### Impacto Estimado
* **Impacto en Producción:** Nulo. Se introducen 2 tablas aisladas sin modificar estructuras existentes.

---

### Migración 003 — Nutrición Clínica Extendida

#### Identificación y Contexto
* **Alembic Revision:** `20261101_003_add_clinical_nutrition_firewalls`
* **Dependencia:** `20260915_002_add_training_nutrition_correlations`
* **Objetivo:** Firewalls médicos para la prescripción nutricional clínica en patologías (DM2, Embarazo, ERC).

#### Esquema de Base de Datos (DDL)

```sql
-- 1. Severidad de Firewalls Clínicos
CREATE TYPE firewall_severity_enum AS ENUM ('BLOCK', 'WARN', 'INFO');

CREATE TABLE clinical_firewalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    rules JSONB NOT NULL, -- Reglas lógicas en formato JSON (límites de macros, exclusiones)
    severity firewall_severity_enum NOT NULL DEFAULT 'BLOCK',
    affected_nutrients JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Perfil clínico estructurado del atleta/paciente
CREATE TABLE patient_clinical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb, -- ['DM2', 'HYPERTENSION']
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    trimester VARCHAR(10) NULL, -- 'T1', 'T2', 'T3' o NULL
    erc_stage INT NULL, -- Estadio ERC (1 a 5) o NULL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clinical_profiles_athlete ON patient_clinical_profiles(athlete_id);

-- 3. Modificación a la tabla de planes nutricionales
ALTER TABLE nutrition_plans
    ADD COLUMN clinical_profile_id UUID NULL REFERENCES patient_clinical_profiles(id) ON DELETE SET NULL,
    ADD COLUMN active_firewalls JSONB NOT NULL DEFAULT '[]'::jsonb;
```

#### Estrategia de Rollback (`downgrade`)
```python
def downgrade():
    op.drop_column('nutrition_plans', 'active_firewalls')
    op.drop_column('nutrition_plans', 'clinical_profile_id')
    op.drop_table('patient_clinical_profiles')
    op.drop_table('clinical_firewalls')
    op.execute("DROP TYPE firewall_severity_enum;")
```

#### Data Migration Notes
* Inserción de reglas de firewall por defecto para Diabetes Tipo 2 (`dm2-firewall`), Embarazo (`pregnancy-t1`, `pregnancy-t2`, `pregnancy-t3`) y ERC (`erc-stage-1-5`).

#### Impacto Estimado
* **Impacto en Producción:** Bajo. La adición de clave foránea `NULLABLE` y columna JSONB en `nutrition_plans` se ejecuta en modo no bloqueante.

---

### Migración 004 — Telemetría y Wearables

#### Identificación y Contexto
* **Alembic Revision:** `20270115_004_add_telemetry_and_wearables`
* **Dependencia:** `20261101_003_add_clinical_nutrition_firewalls`
* **Objetivo:** Ingesta masiva de telemetría desde Garmin/wearables, cálculo de snapshots ACWR y matriz de Wellness Score.

#### Esquema de Base de Datos (DDL)

```sql
-- 1. Conexiones OAuth2 con proveedores de Wearables
CREATE TYPE wearable_provider_enum AS ENUM ('garmin', 'strava', 'apple_health', 'whoop');

CREATE TABLE wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    provider wearable_provider_enum NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    refresh_token_encrypted TEXT NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_athlete_provider UNIQUE (athlete_id, provider)
);

-- 2. Puntos de datos de telemetría pasiva (Alto volumen)
CREATE TYPE wearable_metric_enum AS ENUM (
    'hrv', 'sleep_hours', 'sleep_quality', 'resting_hr', 
    'steps', 'active_calories', 'training_load'
);

CREATE TABLE wearable_data_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    provider wearable_provider_enum NOT NULL,
    metric_type wearable_metric_enum NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice compuesto optimizado para consultas de series temporales
CREATE INDEX idx_telemetry_athlete_time_metric 
    ON wearable_data_points(athlete_id, recorded_at DESC, metric_type);

-- 3. Snapshots calculados de ACWR por disciplina
CREATE TYPE acwr_risk_enum AS ENUM ('LOW', 'OPTIMAL', 'WARNING', 'HIGH_RISK');

CREATE TABLE acwr_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    discipline VARCHAR(50) NOT NULL DEFAULT 'STRENGTH',
    acute_load DECIMAL(10,2) NOT NULL,
    chronic_load DECIMAL(10,2) NOT NULL,
    acwr_value DECIMAL(4,2) NOT NULL,
    risk_status acwr_risk_enum NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_acwr_athlete_time ON acwr_snapshots(athlete_id, calculated_at DESC);

-- 4. Puntuaciones compuestas de Wellness
CREATE TABLE wellness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    sleep_score INT NOT NULL, -- 0-100
    stress_score INT NOT NULL, -- 0-100
    pain_score INT NOT NULL, -- 0-100
    mood_score INT NOT NULL, -- 0-100
    acwr_component DECIMAL(5,2) NOT NULL,
    hrv_component DECIMAL(5,2) NOT NULL,
    composite_score INT NOT NULL, -- 0-100
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wellness_athlete_date ON wellness_scores(athlete_id, recorded_at DESC);
```

#### Estrategia de Rollback (`downgrade`)
```python
def downgrade():
    op.drop_table('wellness_scores')
    op.drop_table('acwr_snapshots')
    op.execute("DROP TYPE acwr_risk_enum;")
    op.drop_table('wearable_data_points')
    op.execute("DROP TYPE wearable_metric_enum;")
    op.drop_table('wearable_connections')
    op.execute("DROP TYPE wearable_provider_enum;")
```

#### Data Migration Notes
* Para la tabla `wearable_data_points`, dada su alta tasa de crecimiento esperada (> 100K registros/mes), se prevé particionado por rango mensual (`PARTITION BY RANGE (recorded_at)`) en una sub-migración de optimización post-lanzamiento.

#### Impacto Estimado
* **Impacto en Producción:** Medio. Requiere la creación de 4 tablas e índices de series temporales. La ejecución de DDL toma aproximadamente 150ms.

---

### Migración 005 — Multi-Professional & Teams

#### Identificación y Contexto
* **Alembic Revision:** `20270415_005_add_multi_professional_teams`
* **Dependencia:** `20270115_004_add_telemetry_and_wearables`
* **Objetivo:** Soporte para equipos multidisciplinarios en el Tenant, asignaciones múltiples de profesionales a un atleta y comentarios cruzados en planes.

#### Esquema de Base de Datos (DDL)

```sql
-- 1. Integrantes del equipo en el Tenant
CREATE TYPE team_role_enum AS ENUM ('trainer', 'nutritionist', 'physiotherapist', 'admin');

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role team_role_enum NOT NULL DEFAULT 'trainer',
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT uq_tenant_user UNIQUE (tenant_id, user_id)
);

-- 2. Asignación de profesionales a atletas
CREATE TABLE client_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'PRIMARY_TRAINER', 'NUTRITIONIST', etc.
    is_primary BOOLEAN NOT NULL DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_athlete_member_role UNIQUE (athlete_id, team_member_id, role)
);

CREATE INDEX idx_client_assignments_athlete ON client_assignments(athlete_id);

-- 3. Comentarios y notas colaborativas en planes
CREATE TYPE plan_type_enum AS ENUM ('workout', 'nutrition');

CREATE TABLE plan_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    plan_type plan_type_enum NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plan_comments_plan ON plan_comments(plan_id, plan_type);

-- 4. Modificaciones a tablas de planes existentes
ALTER TABLE workout_plans 
    ADD COLUMN assigned_professional_id UUID NULL REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE nutrition_plans 
    ADD COLUMN assigned_professional_id UUID NULL REFERENCES users(id) ON DELETE SET NULL;
```

#### Estrategia de Rollback (`downgrade`)
```python
def downgrade():
    op.drop_column('nutrition_plans', 'assigned_professional_id')
    op.drop_column('workout_plans', 'assigned_professional_id')
    op.drop_table('plan_comments')
    op.execute("DROP TYPE plan_type_enum;")
    op.drop_table('client_assignments')
    op.drop_table('team_members')
    op.execute("DROP TYPE team_role_enum;")
```

#### Data Migration Notes (Backfill de Datos Históricos)
* **Script de Backfill Asíncrono:** Migrar todas las relaciones 1-a-1 existentes entre entrenadores y atletas hacia la nueva tabla `client_assignments` marcando `is_primary = true` y rol `'PRIMARY_TRAINER'`.
* Mantenimiento de compatibilidad hacia atrás en consultas de lectura durante 60 días antes de deprecación.

#### Impacto Estimado
* **Impacto en Producción:** Medio. Requiere un script de migración de datos post-DDL para rellenar `client_assignments` desde las claves foráneas legadas sin interrupción de servicio.

---

## 3. Matriz Resumen de Migraciones

| Rev ID | Nombre de Migración | Nuevas Tablas / Alteraciones | Impacto DDL | Tiempo Ejecución | Strategy Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **001** | `add_disciplines_and_extended_metrics` | `discipline_configs`, `exercise_metrics` / Alter `workout_plans`, `exercise_targets` | Bajo | < 50ms | Bajo |
| **002** | `add_training_nutrition_correlations` | `correlation_rules`, `plan_correlations` | Mínimo | < 30ms | Cero |
| **003** | `add_clinical_nutrition_firewalls` | `clinical_firewalls`, `patient_clinical_profiles` / Alter `nutrition_plans` | Bajo | < 40ms | Bajo |
| **004** | `add_telemetry_and_wearables` | `wearable_connections`, `wearable_data_points`, `acwr_snapshots`, `wellness_scores` | Medio | ~ 150ms | Medio (High Write Volume) |
| **005** | `add_multi_professional_teams` | `team_members`, `client_assignments`, `plan_comments` / Alter `workout_plans`, `nutrition_plans` | Medio | ~ 100ms + Backfill | Medio (Requires Data Backfill) |

---

## 4. Check-List de Verificación Post-Migración

- [ ] Verificar compatibilidad de sintaxis DDL con PostgreSQL 15+.
- [ ] Validar la ejecución del comando `alembic upgrade head` en entorno de Staging.
- [ ] Validar la ejecución completa del comando `alembic downgrade -1` probando revertibilidad limpia.
- [ ] Confirmar tiempo de respuesta de `lock_timeout` en producción (< 5 segundos).
- [ ] Ejecutar suite de pruebas de integración de API para verificar que la versión $N-1$ no sufra regresiones.

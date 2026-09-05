# Roadmap General — Julio 2026 a Julio 2027

> **Bienestar APP** — Plataforma SaaS B2B2C de Salud, Nutrición y Entrenamiento de Alto Rendimiento.  
> **Documento de Planificación Estratégica y Hoja de Ruta de Producto**

---

## 1. Visión Estratégica & Objetivos del Ciclo

El objetivo principal para el período **Julio 2026 – Julio 2027** es consolidar a **Bienestar APP** como la plataforma integral líder para entrenadores, nutricionistas, centros deportivos y atletas de alto rendimiento en América Latina. 

A lo largo de estos 12 meses (24 Sprints de 2 semanas cada uno), la evolución del producto se focalizará en cuatro pilares cardinales:

1. **Multidisciplinariedad Avanzada (Q3 2026):** Superar el dominio exclusivo del entrenamiento de fuerza tradicional integrando soporte nativo de primera clase para **Running** (ritmos, FC, cadencia) y **CrossFit** (taxonomía WOD, escalado RX/Scaled, benchmarks).
2. **Nutrición Clínica & Generación Automatizada (Q4 2026):** Incorporar motores de prescripción nutricional segura con barreras médicas (*firewalls* para DM2, embarazo por trimestre y ERC) y lanzar el motor de plantillas **Draft Engine v1** y **Smart Fork**.
3. **Telemetría Pasiva y Puntuación Compuesta (Q1 2027):** Conectar datos fisiológicos en tiempo real vía **Garmin Health API**, unificando el ratio de carga de trabajo agudo/crónico (**ACWR**) y calculando un **Wellness Score** holístico.
4. **Escalabilidad de Equipos e Inteligencia Artificial (Q2 2027):** Permitir la gestión colaborativa multiprofesional (entrenador + nutricionista + kinesiólogo) y habilitar herramientas avanzadas asistidas por IA y estimación de pose por video.

---

## 2. Desglose Trimestral y por Sprints

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CRONOGRAMA ANUAL DE SPRINTS                                     │
├────────────────────────┬────────────────────────┬───────────────────────┬───────────────────────┤
│        Q3 2026         │        Q4 2026         │        Q1 2027        │        Q2 2027        │
│  Fundamentos Multi-Dis │  Nutrición & Borradores│ Telemetría & Integrac.│    Escalabilidad & IA │
│   (Sprints 01 - 06)    │   (Sprints 07 - 12)    │   (Sprints 13 - 18)   │   (Sprints 19 - 24)   │
└────────────────────────┴────────────────────────┴───────────────────────┴───────────────────────┘
```

---

### Q3 2026 (Julio - Septiembre) — Fundamentos Multi-Disciplina & Experiencia Móvil de Sesión

#### Sprint 1-2: Extensión de Running & Paleta de Períodos
* **Objetivo:** Extender la estructura de `PERIOD_PALETTE` para soportar sesiones específicas de Running e incorporar métricas biomecánicas y de volumen aeróbico.
* **Entregables:**
  * Nuevas modalidades de período: `RUNNING_BASE`, `RUNNING_TEMPO`, `RUNNING_INTERVAL`, `RUNNING_LONG_RUN`, `RUNNING_RECOVERY`.
  * Incorporación de nuevos campos estructurados en `exercise_targets`:
    * `pace_min_km` (Ritmo objetivo en min/km, ej: `04:45`).
    * `distancia_km` (Distancia total en kilómetros, ej: `12.5`).
    * `zona_fc` (Zona de frecuencia cardíaca objetivo Z1 a Z5).
    * `cadencia_spm` (Pasos por minuto / cadencia, ej: `175`).
* **Valor de Negocio:** Permite a entrenadores de atletismo y triatlón prescribir planes de Running con la misma precisión que la fuerza.

#### Sprint 3-4: Taxonomía CrossFit WOD & Sistema de Escalado
* **Objetivo:** Implementar la taxonomía completa de entrenamiento funcional y CrossFit con soporte para benchmarks históricos.
* **Entregables:**
  * Formatos de WOD soportados: `FOR_TIME`, `AMRAP`, `EMOM`, `TABATA`, `CHIPPER`, `LADDER`, `DEATH_BY`.
  * Base de datos centralizada de WODs Benchmark (Girl WODs, Hero WODs, ej: *Fran*, *Murph*, *Grace*).
  * Sistema de escalado multi-nivel por ejercicio y WOD: `Scaled`, `RX`, `RX+`.
* **Valor de Negocio:** Captura del segmento de boxes de CrossFit y entrenadores funcionales B2B.

#### Sprint 5-6: Correlation Engine v1, Prescripción FIE & Experiencia de Sesión Activa
* **Objetivo:** Motor inteligente que correlaciona carga de entrenamiento (ACWR) con estrés autonómico (HRV), auto-sugiere suplementación, prescribe nutrición dinámica SARA 2 y ejecuta sesiones interactivas con videos de técnica de Catilli `@Catilli-20` y Smart Swap biomecánico de 3 vías.
* **Estado Actual:**
  * **[✓] P0 Cubierto:** Motor NaaS con Configuración Metabólica Global (Ecuaciones TMB, Shifts Termodinámicos y Objetivos Biológicos).
  * **[✓] P1 Suplementación:** `supplementationEngine.ts` desplegado con dosis clínicas de Creatina, Beta-Alanina, Cafeína, Citrulina y HMB en el Plan Builder.
  * **[✓] P1 Recuperación Biomecánica:** `correlationEngine.ts` (ACWR EWMA + HRV Z-Score) y `RecoveryThermometer.tsx` desplegados con psicología positiva (`Óptimo`, `Precaución`, `Alto`, `Baja`) y simulador de 30 días.
  * **[✓] P1.1 Workflow de Recetas SARA 2:** `RecipeCreatorModal.tsx` con Wizard de 3 pasos, persistencia en `useNutritionStore.ts`, 12 recetas tradicionales argentinas seed y NaaS Studio a pantalla completa.
  * **[✓] P1.2 Experiencia Móvil de Nutrición:** Menú de 4 comidas reactivo en `AthleteNutritionDashboard.tsx`, +20 XP en `useGamificationStore` por check-in y widget de nutrición en vivo en `NutritionWidget.tsx`.
  * **[✓] P1.3 Presets SARA 2 Dinámicos & UX:** Soporte para 1 a 8 ingestas, auto-calibración paramétrica al 100% de la meta diaria, filtros simétricos sin scrollbars nativas, gramos visibles y alternativas IA.
  * **[✓] P1.4 Smart Swap Engine:** Motor de sustitución isocalórica e isomacronutriente (`smartSwapEngine.ts`) con dominancia CARBS/PROT/FAT, 4 macros y medidas caseras.
  * **[✓] P1.5 Base Unificada SARA + USDA (834 alimentos):** Traducción e integración de 363 alimentos de USDA Foundation en `SARA_Master_Database.json`.
  * **[✓] P1.6 Autenticación en Producción & Magic Links:** Router `auth_b2c.py` con tokens JWT, refresh tokens HttpOnly y redención sin contraseña.
  * **[✓] P1.7 Motor de Entrenamiento FIE & Auto-Poblar 1-Clic:** `routineGeneratorEngine.ts` con hitos RP (MEV/MAV/MRV), Time-Budgeting 60m, Carga Axial $\le 15$, 5 Plantillas Maestras y 7 Bloques FIE.
  * **[✓] P1.8 Injury Firewall V2 Pro:** `clinicalFirewall.ts` con Triage de 5 Red Flags, Smart Swaps por patología (NIOSH <3400N) y protocolos HSR/TNT.
  * **[✓] P1.9 Experiencia de Sesión Activa & Video Catilli (`ActiveWorkoutSession.tsx`):**
    - Mapeo canónico a los 676 videos oficiales de `@Catilli-20` (`exerciseVideoMap.ts`).
    - Modo Enfoque 1 a 1 (Cero Scroll) con Stepper Tracker y navegación ergonómica fija.
    - Video directo en pantalla con botón flotante `Expandir ⛶` a pantalla completa y cues técnicos.
    - Reemplazo Biomecánico Inteligente con tríos rotativos continuos de 3 vías (Efecto ¡AJÁ! y cero fatiga de decisión).
    - Micro-evaluación por serie (`SetEffortPainModal`) y fin de sesión simple (`SessionDailyAssessmentModal`).
    - Resumen Gaming Premium (`GamingCelebrationOverlay`) con trofeo 3D, puntos de experiencia (+140 XP), racha, barra de nivel, desglose de estímulo por grupo muscular y Medalla de Constancia.
  * **[✓] P1.11 Cableado E2E de Producción Coach & Atleta (26 Tests de Integración):**
    - 137 endpoints REST en FastAPI/PostgreSQL activos y funcionales.
    - Sincronización de contratos de validaciones (`/pending` + `/decide`), Nutritionist Dashboard real, prefijos de ActionCards y deserialización de atletas.
    - 26 tests de integración automatizados en `test_coach_workflows.py` y `test_athlete_workflows.py` con 100% de éxito.
  * **[✓] P1.12 Experiencia Móvil de Nutrición, Smart Swap & Validación Fotográfica con Coach:**
    - Tarjeta de comida simplificada (`MealOptionCard.tsx`) con plato nutricional en Donut Chart y distribución pedagógica de macronutrientes.
    - Catálogo de recetas completas isocalóricas (`FullMealSwapModal.tsx`) y reemplazos individuales (`SmartSwapModal.tsx`) con React Portals (`createPortal`) para renderizado móvil sin cortes.
    - Motor de medidas caseras (`householdMeasures.ts`) con resolución estricta de unidades (`unit === 'u'`) eliminando choques de similitud y traduciendo gramos a referencias de la vida cotidiana.
    - Validación de plato con foto de 4 pautas pedagógicas (`MealPhotoValidationModal.tsx`), captura directa con cámara/galería, notas y sincronización en tiempo real con `useCoachCommunicationStore`.
    - Candado Pro con redirección a entrenadores certificados en Ajuste de Cargas & Video Técnica.
    - Programación semanal de hábitos (`scheduledDays: [1..7]`) en `useHabitStore.ts` y `CreateHabitModal.tsx`.
  * **[✓] P1.13 Remediación Integral de Producción Backend & Nutrición Atleta (Agosto 2026):**
    - **Seguridad P0:** Eliminación de backdoor en `auth.py`, configuración de CORS dinámico (`settings.cors_origins_list`) y Dockerfile de producción en UTF-8 con `.dockerignore` y `$PORT` dinámico.
    - **Capa de Datos:** `NutritionRepository` multi-tenant para alimentos SARA 2, recetas, planes nutricionales y registro de comidas.
    - **Módulo de Compras:** `ShoppingListService` (agrupación por góndolas, packaging retail argentino y escalador temporal `3d`/`1w`/`2w`/`1m`).
    - **Endpoints de Nutrición:** `GET /plans/active`, `POST /shopping-list`, `POST /meal-logs`, `GET /meal-logs`, `GET /adherence/today` y activación de `nutrition_vision.py` con GPT-4o.
    - **Celery & Migraciones:** Implementación de workers (`cri_worker`, `dietqa_worker`, `nutrition_tasks`), migración Alembic `recipes` (head `e4f5a6b7c8d9`), y suite de tests automatizados de nutrición e infraestructura (100% Pass).
  * **[✓] P1.14 Cierre 100% Módulo de Entrenamiento, Nube de Templates, Adherencia Dinámica & Contraste Chat (Agosto 2026):**
    - **Sincronización en la Nube de Templates:** Hook `useTemplateSync.ts` conectado a `/api/v1/templates` con invalidación de cache, persistencia en `useTemplateLibraryStore.ts` y badge de nube activa en `TemplateLibrary.tsx`.
    - **Adherencia Dinámica en Tracking View:** Reemplazo de 85% estático en `WorkoutTrackingView.tsx` por cálculo en tiempo real sobre `useExecutionStore.sessionHistory` (ventana de 28 días vs sesiones esperadas).
    - **Contraste de Chat / Inbox:** Corrección de texto blanco invisible en mensajes de atletas en modo claro (`IntelligentInbox.tsx`).
    - **Limpieza de Routers:** Des-registro de stubs muertos en `main.py` y suite de 40 tests en backend 100% aprobada (`pytest`).
  * **[✓] P1.15 Remediación Integral de Producción, Eliminación de Crashes P0/P1 & Unificación SSOT (Septiembre 2026):**
    - **Corrección de 9 Bugs P0 & 10 Bugs P1:** Fixes en `MagicLinkRedeem`, `RouteGuard`, `ZeroClientWizard`, `athleteApi`, `action_cards`, `mesocycles`, `admin_internal`, `exercises_routes` y `auth_b2c`.
    - **Registro Público Autónomo & UI Dual:** Endpoints `POST /api/v1/auth/register` (Coach con Tenant automático) y `POST /api/v1/auth/register-b2c` (Atleta libre con asignación comunitaria).
    - **Script Maestro de Base de Datos (`schema.sql`):** Unificación de 16 tablas faltantes con políticas Row-Level Security (RLS) Zero-Trust.
  * **[✓] P1.16 Suite de Smoke Tests E2E de Producción & Certificación de los 3 Workflows (Septiembre 2026):**
    - **Certificación Automatizada (5/5 Tests Passed):** Workflow 1 (Coach B2B), Workflow 2 (Atleta B2B2C Invitado por Magic Link) y Workflow 3 (Atleta B2C Libre Autoservicio) validados al 100% en `test_e2e_production_workflows.py`.
    - **Resolución de FK de Profesionales:** Resolución directa de `Professional.id` en creación de atletas y fixture `e2e_client` para JWTs reales.
  * **[✓] P1.17 Desacoplamiento Standalone de Login, Disciplinas Multidisciplinarias & Plataforma Virgen (Septiembre 2026):**
    - **Login Standalone:** Desacoplamiento total de `/login` de `AppLayout`, eliminando solapamiento de barra lateral antes de autenticarse.
    - **Catálogo Multidisciplinario:** Soporte para 9 especialidades (PT, Nutri, Híbrido, Mind Coach, Kinesiólogo, Preparador Físico, Clases Grupales, Yoga/Pilates, Gym).
    - **Sidebar Dinámico:** Avatar, iniciales, nombre y rol reactivos desde `useAuth`.
    - **Plataforma Virgen:** Limpieza de datos mock en stores de comunicación y finanzas, y activación automática del `CoachWelcomeWizardModal` en primer inicio.
  * **[✓] P1.18 Marco Científico de Hipertrofia & Biomecánica Avanzada (~50 Papers) (Septiembre 2026):**
    - Consolidación del marco empírico de Schoenfeld, Helms, Israetel, Beardsley y Zourdos.
    - Stretch-Mediated Hypertrophy (SMH), control de fatiga axial raquídea $\le 15$ puntos, y volumen fraccional de 10 grupos musculares (MEV/MAV/MRV).
    - Presets periodizados DUP (3d), GBR (4d), PPL (6d) y PHAT (5d).
  * **[✓] P1.19 Motor Canónico Weider Clásico de 3 Días & Cortafuegos Lumbar/Hombro/Rodilla (Septiembre 2026):**
    - Generador `generate3DayClassicWeider` en `routineGeneratorEngine.ts` con Pecho/Tríceps, Espalda/Bíceps, Pierna/Hombro, calentamiento RAMP específico, compuestos T1, accesorios SMH T2/T3, Core 360° y enfriamiento.
    - Cortafuegos clínico estricto contra lesiones lumbares, de hombro y de rodilla con sustitución biomecánicamente segura.
    - Eliminación definitiva del banner alarmista e intrusivo de sobreentrenamiento.
  * **[✓] P1.20 Distribución Semanal Reactiva, Ergonomía de Botones & Sincronización con Onboarding (Septiembre 2026):**
    - Reemplazo de "Split" por "Distribución Semanal" con pedagogía de descanso de 48 hs para atletas novatos.
    - Botones claros y diferenciados (`Clásica (3d)`, `Full Body (3d)`, `Torso / Pierna (4d)`, `Híbrido (5d)`, `PPL x 2 (6d)`).
    - Detección reactiva de los días disponibles del atleta informados en su onboarding (`training.days_per_week`) y preselección automática con insignias `🎯 Onboarding`.
    - Reubicación superior de botones `[ 📅 Diseñar Ciclo a Medida ]` y `[ 🎓 Ver Guía de Periodización ]` con acordeón interactivo.
  * **[ ] P1.10 Hidratación & Energía (Post-MVP):** `macroFluidEngine.ts` (Carbohidratos y reposición de fluidos/sodio intra-sesión).
  * **[ ] P2 Nutrición Clínica Avanzada:** Protocolos anti-inflamatorios y firewalls de seguridad médica (DM2, ERC, Embarazo).
* **Valor de Negocio:** Garantiza coherencia metabólica, rigor biomecánico, prevención no alarmista de sobreentrenamiento, adherencia del atleta y fidelización a través del "Efecto Ajá" en presentaciones comerciales.

---

### Q4 2026 (Octubre - Diciembre) — Nutrición Clínica & Borradores Automatizados

#### Sprint 7-8: Expansión de Nutrición Clínica (Firewalls Médicos)
* **Objetivo:** Implementar reglas de seguridad nutricional rígidas (*firewalls*) para condiciones clínicas clave.
* **Entregables:**
  * **Firewall Diabetes Tipo 2 (DM2):** Límite estricto de carga glucémica, restricción de azúcares simples y distribución controlada de carbohidratos por comida.
  * **Firewall Embarazo (T1, T2, T3):** Ajustes trimestrales de micronutrientes (ácido fólico, hierro, calcio), restricción de alimentos de alto riesgo microbiológico y cálculo de ganancia ponderal según IMC pre-gestacional.
  * **Firewall Enfermedad Renal Crónica (ERC Estadios 1 a 5):** Control automatizado de potasio, fósforo, sodio y ajuste fino de gramos de proteína por kg de peso según filtrado glomerular.
* **Valor de Negocio:** Permite la prescripción segura a nutricionistas clínicos y habilita el mercado médico-deportivo.

#### Sprint 9-10: Draft Engine v1 (Generador Automatizado de Borradores)
* **Objetivo:** Generación instantánea de borradores completos de planes de entrenamiento y nutrición cruzando biometría, disciplina y objetivos.
* **Estado:** ✅ **Completado de forma anticipada** en Agosto 2026 (`routineGeneratorEngine.ts` + `PanoramicBuilder.tsx`).
* **Entregables:**
  * Algoritmo determinístico que toma: Arquetipo de Atleta + Disciplina (Fuerza/Running/CrossFit/Calistenia/Glúteos) + Biometría + Disponibilidad de Días (3, 4 o 5 días).
  * Generación en < 1 segundo de un borrador estructurado en 5 fases (RAMP, Primario Fuerza, Secundario Hipertrofia, Aislamiento, Core McGill) con Injury Firewall integrado.
* **Valor de Negocio:** Reduce el tiempo de creación de un plan mensual de 45 minutos a menos de 5 segundos por cliente.

#### Sprint 11-12: Smart Fork Engine (Bifurcación Adaptativa de Plantillas)
* **Objetivo:** Permitir clonar una plantilla maestra hacia un cliente específico recalculando automáticamente todas las variables operativas.
* **Entregables:**
  * *Forking* de plantillas con ajuste automático en base a 1RM del atleta (pesos en kg), VAM (Velocidad Aeróbica Máxima) para Running y Requerimiento Calórico Total (TDEE).
  * Auto-escalado de volumen (series/repeticiones) y macronutrientes (gramos/día) según nivel de experiencia.
* **Valor de Negocio:** Escalabilidad masiva para entrenadores con más de 50 atletas activos.


### Fase 93: Grupos & Retos Multidisciplinarios y Experiencia Social Simétrica (Completada)
- Módulo **Grupos & Retos** (`/gamification`) con creación de clases en el momento y 13 disciplinas.
- Widget de clases activas en el inicio del Coach (`ActiveClassesWidget.tsx`).
- Módulo Social del Atleta optimizado por pestañas con `Feed` primero y comodín `Lazy Day` contextual.


## FASE 94-100: EXPERIENCIA DEL ATLETA PRÉMIUM, SOCIAL MULTI-TRIBU, FOTO BASELINE Y FICHA BIOMÉTRICA (COMPLETADAS ✅)

### Fase 94: Onboarding Pedagógico y Ergonomía de Inicio
- Acordeones colapsados por defecto en Inicio (`DailyHabitCheckin.tsx`, `NutritionWidget.tsx`, Agenda).
- Wizard de Bienvenida de 4 pasos con pedagogía visual (`AthleteWelcomeWizardModal.tsx`) y +50 XP.
- Asistente de Foto Baseline con 4 consejos y +100 XP (`BaselinePhotoModal.tsx`).

### Fase 95: Comparador Visual Antes/Después & Agendamiento de Control
- Comparador visual con Split Slider táctil y vista Lado a Lado (`VisualComparisonModal.tsx`).
- Selector de intervalo para próxima foto en 15, 20 o 30 días con cálculo automático de fecha.

### Fase 96: Unificación de Galería en Perfil & Cero Duplicación en Inicio
- Modo checklist para la tarjeta de foto inicial: desaparece de Inicio tras guardarse.
- Aviso pedagógico al atleta indicando que su foto está resguardada en `Galería de Progreso` del menú de perfil.

### Fase 97: Avatar Concéntrico & Carga de Foto de Perfil
- Corrección geométrica y simétrica del avatar y badge de nivel en `ProfileView.tsx`.
- Carga de foto de perfil personalizada (`<input type="file">` con Base64) y sincronización con el header de `AthleteMobileView.tsx`.

### Fase 98 & 99: Multi-Tribu Switcher & Pestaña Dedicada de Tribus en Social
- Sub-pestaña dedicada `👥 Tribus (3)` en `AthleteTribuDashboard.tsx` (`Muro`, `Retos`, `Ranking`, `Tribus`).
- Soporte para múltiples tribus simultáneas (`La Banda 🦁`, `CrossFit 8am 🏋️`, `Running Club 🏃`) en `useTribuStore.ts`.

### Fase 100: Vitrina de Medallas y Ficha de Datos Generales
- `AthleteMedalsModal.tsx`: 8 medallas temáticas con filtros (Todas, Obtenidas, Por Ganar), XP y exportación a Stories.
- `AthleteGeneralDataModal.tsx`: Ficha biométrica y deportiva con Peso, Altura, IMC dinámico, Objetivo, Disciplina y Coach.


## FASES 124-138: AGENDA PROFESIONAL, GOOGLE DRIVE EXPLORER, ALERTAS DE CICLO (7D) Y SEGURIDAD CLÍNICA (COMPLETADAS ✅)

### Fase 124 & 125: Chat Inteligente & Ficha de Atleta en Tiempo Real
- Selector de 7 colores para burbujas de chat del coach (`IntelligentInbox.tsx`) con contraste antialiased (`#ffffff`).
- Píldoras de filtro redondeadas con emojis de clasificación (`💬 Todos`, `🏋️ Biomecánica`, `⚠️ Riesgos`, `🥗 Nutrición`, `💳 Pagos`, `✅ Resueltos`).
- Drawer `AthleteQuickCardDrawer.tsx` con acceso en 1 clic y línea de tiempo cronológica pura.

### Fase 126 & 127: Sidebar Limpio & Biblioteca Estilo Google Drive
- Eliminación de scroll horizontal y módulo de gimnasio en `Sidebar.tsx`.
- Conmutador de workspace inferior `[ 🏋️ Coach | 🍏 Nutrición ]`.
- Arquitectura Google Drive en `TemplateLibrary.tsx` con carpetas, breadcrumbs, creación de carpetas y navegación recursiva.

### Fase 128, 129 & 130: Desacople de Rol/Tema & Logotipo Despejado
- Desacople completo entre conmutación de rol y cambio de tema visual.
- Selector de tema (`☀️ / 🌙`) reubicado en el footer del Sidebar, dejando la cabecera del logotipo `Habits.` 100% limpia.

### Fase 131, 132, 133 & 134: Módulo de Agenda & Calendario Semanal de Disponibilidad (`/calendar`)
- `ProfessionalAgenda.tsx`: Gestión integral de turnos 1 a 1, consultas, clases grupales y tareas operativas.
- Matriz semanal de disponibilidad (08:00 a 20:00) con celdas de ocupación y agendamiento en 1-clic sobre huecos libres.
- Motor de Alertas Automáticas de Fin de Ciclo: tareas prioritarias generadas 7 días antes del vencimiento de mesociclos o pautas NaaS con enlace directo al Lab/Studio.
- Rediseño UX con pedagogía visual y lenguaje simple sin carga cognitiva.

### Fase 135 & 136: Servicios de Medición Antropométrica & Servicios Personalizados
- Incorporación de tipos de servicio para Medición Antropométrica (ISAK), Test 1RM y Evaluación Postural.
- Creador dinámico de servicios personalizados ilimitados con selector de emojis y distintivos automáticos.

### Fase 137 & 138: Alerta Médica Prioritaria en Ficha del Atleta & Estabilidad HMR
- Banner de Precaución Médica Crítica y Lesiones Activas arriba de todo en `AthleteFormModal.tsx` (`/plan-builder`).
- Corrección de imports y verificación de estabilidad HMR en el editor de planes.

### Fase 139: Cableado Integral de Producción Backend & Conexión PostgreSQL (COMPLETADA ✅)
- **FastAPI 133 Endpoints REST Activos:** Descomentados y verificados routers en `main.py`, eliminando 404s en consola.
- **CRUD de Workouts (`workouts.py`):** Creación transaccional de planes anidados (días, superseries, ejercicios), soft delete, asignación y duplicación (Smart Fork).
- **Rutina del Día & Sets Idempotentes (`athlete.py`):** `GET /routine/today` con rotación de mesociclos y `POST /sets` con UUIDv4 idempotency key.
- **Catálogo de Ejercicios (`exercises_routes.py`):** Búsqueda por filtros biomecánicos y autocomplete para PanoramicBuilder.
- **Bóveda de Plantillas Maestras (`templates_routes.py`):** CRUD de Master Templates y forking adaptativo.
- **Dashboard del Nutricionista (`nutritionist_routes.py`):** Métricas reales de pacientes, planes y check-ins en PostgreSQL.
- **Validaciones de Video (`validations.py`):** Cola de revisión de técnica conectada a `video_reviews` con feedback del entrenador.
- **Chat e Inbox con PostgreSQL (`chat.py` & `inbox.py`):** Persistencia en tablas `conversations` y `messages`.
- **Reconciliación Offline (`sync.py`):** `POST /sync/push` idempotente y `GET /sync/pull` incremental para IndexedDB.

### Fase 140: Cierre 100% Módulo de Entrenamiento, Nube de Templates & Adherencia Dinámica (COMPLETADA ✅)
- **Hook de Sincronización en la Nube (`useTemplateSync.ts`):** Mapeo de Master Templates remotas de PostgreSQL a `useTemplateLibraryStore.ts` y badge reactivo `☁️ Nube activa` en `TemplateLibrary.tsx`.
- **Adherencia Dinámica en Tracking View (`WorkoutTrackingView.tsx`):** Cálculo real de adherencia en ventana móvil de 28 días vs sesiones planificadas en lugar del 85% hardcodeado.
- **Tipografía y Legibilidad de Chat (`IntelligentInbox.tsx`):** Contraste adaptativo `isCoach ? 'text-white' : 'text-slate-900 dark:text-zinc-100'`.

### Fase 141: Alertas Inteligentes de Clientes & Hero Strip Pedagógica (COMPLETADA ✅)
- **Banner Dinámico de Alertas Clínicas (`CommandCenter.tsx`):** Notificación condicional para malestares, lesiones y fatiga aguda (ACWR > 1.5). Si no hay alertas, se contrae con badge *"✓ Todo bajo control"*.
- **Hero Strip de 3 Tarjetas:** Visual pedagogy con métricas ejecutivas esenciales (Revisiones Pendientes, Escuadrones Activos, Notificaciones).
- **Conexión de Widgets (`ActiveClassesWidget.tsx`):** Sincronización reactiva con `useClassesStore.ts`.

### Fase 142: Doble Pestaña de Grupos/Retos, Acordeón de Clases & Píldoras Violetas (COMPLETADA ✅)
- **Doble Pestaña Operativa (`GamificationBuilder.tsx`):** Segmentación entre `👥 Clases & Grupos Activos` y `🏆 Catálogo de Retos (Game Master)`.
- **Acordeón Colapsable de Clases (Cerrado por Defecto):** Relevamiento sin scroll vertical con botón global `Expandir Todas` / `Colapsar Todas`.
- **Grilla Simétrica de 12 Columnas:** Identidad de clase (5 cols), comunidad y avatares (3 cols), **Píldora Violeta de Reto Activo** (3 cols) con micro-etiqueta `"RETO EN VIVO"` y dot pulsante `● Live`, y chevron de acción (1 col).
- **Banner Pedagógico:** Leyenda explicativa superior sobre la sincronización de retos en la app de los alumnos.

### Fase 143: Dashboard de Finanzas & Cobranzas con Sugerencias y WhatsApp (COMPLETADA ✅)
- **Sugerencias Inteligentes en Modo Notificación Superior (`FinanceDashboardView.tsx`):** Banner superior que prioriza cobros pendientes ($108.000) con botón `Ver Pendientes` e insights de retención (+11.7%, 88% retención).
- **Vocabulario Amigable & Pedagogía:** Sustitución de acrónimos técnicos por métricas claras (*Recaudación Mensual $1.050.000*, *Alumnos al Día 8/10*, *Cobros Pendientes $108.000*, *Cuota Promedio $38.600*).
- **Flujo Rápido de Cobro por WhatsApp:** Modal con template pre-redactado en español rioplatense, botón copiar, link `wa.me/` y acción `Ya me pagó (Marcar Al Día)`.
- **Gráfico de Evolución y Distribución de Planes:** Curva de facturación con tooltips monetarios, filtros de 6/12 meses y barras de planes Pro, Premium, Basic y Personalizado.
- **Tabla con Buscador y Filtros:** Pestañas `Todos`, `Al Día`, `Pendientes/Mora` y buscador en tiempo real.
- **Datos Seed & Persistencia v3 (`useFinanceStore.ts`):** 12 meses históricos y 10 clientes con auto-migración garantizada.

### Fase 144: Redirección a Perfil de Alumnos & Catálogo Estandarizado de Planes y Ofertas Comerciales (COMPLETADA ✅)
- **Redirección al Perfil del Alumno:** Clic directo en el nombre/avatar del alumno desde el desglose de cuotas hacia `/trainer/athlete/:id` con feedback visual táctil.
- **Doble Pestaña en Finanzas:** Pestaña `📊 Resumen & Cobranzas` y Pestaña `🏷️ Catálogo de Planes & Precios`.
- **Catálogo de Planes & Precios:** Estandarización de Membresías Mensuales, Packs de 3 y 6 meses, Rutinas Sueltas (Pago Único) y Asesorías 1 a 1 / Consultas ISAK.
- **Generador de Link de Pago & WhatsApp:** Enlace de checkout `https://bienestar.app/pay/:id` y plantilla de propuesta comercial pre-redactada.
- **Modal de Creación y Edición (`CreateEditPlanModal`):** Alta de planes personalizados con selector de nivel, precio, periodicidad, badges y checklist de beneficios.
- **Store Persistente v4 (`useFinanceStore.ts`):** CRUD reactivo para planes comerciales con persistencia y migración automática.

### Fase 145: Personalización de Mensajes de WhatsApp y Configuración de Tono para el Profesional (COMPLETADA ✅)
- **Modal Maestro de Configuración de Plantillas WhatsApp (`WhatsAppSettingsModal`):** Edición de plantillas maestras para Recordatorios de Cuotas, Compartir Planes y Agradecimientos por Pago.
- **Selectores de Tono:** Opciones en 1 clic (*Cálido y Cercano 😊*, *Directo y Formal 📋*, *Motivacional & Fitness 🔥*).
- **Edición en Tiempo Real:** Personalización sobre la marcha en cada envío por WhatsApp con chips de inserción rápida (`+ Mi Alias`, `+ Formas de Pago`, `+ Cierre Motivacional`) y botón `Guardar como mi plantilla`.
- **Persistencia v5 (`useFinanceStore.ts`):** Persistencia de plantillas por usuario y migración garantizada.

### Fase 146: Integración del Hub de Comunicación, Depuración de Módulos y Navegación Reactiva a Pendientes (COMPLETADA ✅)
- **Scroll Reactivo en "Ver Pendientes":** El banner superior y la tarjeta de Cobros Pendientes redirigen y filtran instantáneamente a los alumnos con deuda con scroll suave hasta la tabla (`#tabla-alumnos`).
- **Hub de Comunicación Integrado en Mensajes & Validaciones:** Pestaña `⚙️ Canales & Automatizaciones` con configuración de horarios semanales, protección de descanso (Gatekeeper), bypass de urgencias médicas/lesiones, auto-respuestas (Fuera de horario, Vacaciones, En clase) y triggers automáticos de retención.
- **Depuración de Rutas y Menú Dev:** Remoción de `/client`, `/debug-chat` y `/gatekeeper` (duplicado), redirigiendo `/communication` a la experiencia unificada.

### Fase 147: Rediseño Prémium de Login y Micro-Interacciones de Marca (COMPLETADA ✅)
- **Nuevo Subtítulo de Marca:** Reemplazo de *"Tu Camino al Cambio"* por **`HEALTHY RED SOCIAL`** con tipografía Montserrat 700.
- **Armonización de Tarjeta:** Contenedor `rounded-3xl`, efecto `backdrop-blur-2xl`, inputs `rounded-2xl` y footer SSL optimizado.

### Fase 148: Flor de la Vida Vectorial, Login con Google y Estrategia de Canal Propio con Resumen Semanal de Domingos (COMPLETADA ✅)
- **Flor de la Vida Vectorial:** Geometría sagrada pura en SVG nítido y animación sutil de resorte.
- **Login con Cuenta Google:** Botón nativo con isotipo oficial 'G' de 4 colores y login instantáneo.
- **Estrategia de Comunicación de Canal Propio:** Toda la interacción transcurre dentro de la app (vía Notificaciones Push).
- **📅 Resumen Semanal de los Domingos ("Sunday Briefing"):** Reporte de balance semanal + plan estratégico y mensaje motivacional del coach.

### Fase 149: Isotipo de Ecosistema Holístico y Slogan "Tu Red Social Saludable" (COMPLETADA ✅)
- **Nuevo Isotipo de Ecosistema:** Integración de la Flor de la Vida con los 6 pilares de Habits (Nutrición, Entreno, Mente, Constancia, Social y Longevidad).
- **Slogan Oficial:** Actualización a **`TU RED SOCIAL SALUDABLE`** (`Your Healthy Social Network`).

### Fase 150: Malla de Gradiente Cinematográfica, Glassmorphism y Logo Agrandado (COMPLETADA ✅)
- **Malla de Gradiente Ambiental:** Fondo vanguardista fluido con esferas de luz orgánica difuminada (rubí, índigo, periwinkle) y respiración ambiental.
- **Logo Agrandado Protagonista:** Isotipo expandido a `w-36`/`w-40` centrado en contenedor iluminado.

### Fase 151: Coherencia Clínica con la Sidebar, Logo Transparente y Selector de Idioma con Banderita (COMPLETADA ✅)
- **Estética Clínica Coherente:** Malla ambiental clara `from-[#F3F5FA] to-[#EDF2FA]`, punto de marca esmeralda `text-emerald-500` y botón en índigo coach `bg-indigo-600`.
- **Logo 100% Transparente:** Eliminado el marco/disco blanco; integración limpia y directa sobre la tarjeta.
- **Selector de Idioma con Banderas (`🇪🇸 ES` / `🇬🇧 EN`):** Switcher dinámico con traducción reactiva.

### Fase 152: Pantalla de Login Cero-Scroll, 3D Parallax Liquid Glass y Menú Ultra-Translúcido (COMPLETADA ✅)
- **Zero Scroll en Login:** Contención de altura `h-screen overflow-hidden` y dimensionamiento ergonómico.
- **Micro-Interacción 3D Parallax Liquid Glass:** Inclinación tridimensional al cursor y reflejo de cristal líquido.
- **Translucidez en Menú Lateral:** Redefinición de `.sidebar-glass` con mayor pureza vítrea (`blur(28px)`).

### Fase 153: Isotipo Habits Agrandado Protagonista y Banderitas SVG Vectoriales (COMPLETADA ✅)
- **Logo Agrandado Centrado:** Ampliación a escala `w-36`/`w-44` con sombras difuminadas y 3D Parallax reactivo.
- **Banderitas SVG Nítidas:** Banderas vectoriales para España (`🇪🇸`) y Reino Unido (`🇬🇧`).

### Fase 154: Rediseño Pedagógico de Contactos Totales, Botón Generar Nuevo y Eliminación de Cansancio (COMPLETADA ✅)
- **Botón `+ Nuevo Alumno`:** Integración en la cabecera de `Contactos Totales` para alta rápida guiada.
- **Eliminación Total de Cansancio:** Supresión de métricas complejas de cansancio en favor de métricas claras de negocio y entrenamiento (*Objetivos*, *Planes Asignados*, *Cuotas*).
- **Pedagogía Visual y Lenguaje Sencillo:** Filtros amigables y filas de clientes con estados claros y accesibles.

### Fase 155: Resolución de Runtime Errors en Atleta & Inicio Limpio con Menús Colapsados (COMPLETADA ✅)
- **Inicio de Atleta Ultra-Limpio:** Menús desplegables de Agenda, Hábitos y Nutrición cerrados por defecto para cero sobrecarga visual.
- **Fix Runtime Errors:** Corregido `useNutritionStore` indefinido en `MealOptionCard.tsx` y `recordProgress` resiliente a valores no definidos en `useGamificationStore.ts`.

### Fase 156: Colapso por Defecto en Datos & Progreso de Entrenamiento (COMPLETADA ✅)
- **Acordeones de Progreso Cerrados:** `compliance`, `volume`, `nextLevel` y `gallery` configurados cerrados inicialmente en `AthleteWorkoutView.tsx`.
- **Experiencia Panorámica Limpia:** El atleta visualiza el resumen compacto de todas sus métricas y abre únicamente la que desea explorar.

### Fase 157: Workflow Integral de Actividades Complementarias y Clases Grupales (COMPLETADA ✅)
- **Modal de Actividades Extra:** Registro en 1 toque de Running, CrossFit, Yoga, Pádel, Natación, Spinning y Clases Grupales.
- **Carga Interna TRIMP & Gamificación:** Computación de fatiga (`Minutos × RPE`), sumatoria de XP (+20 a +60 XP) y cierre de hábito de movimiento.

### Fase 158: Menú Desplegable de Rutina Diaria y Sincronización Automática de Clases en Agenda (COMPLETADA ✅)
- **Rutina Diaria Colapsable:** Tarjeta del día cerrada por defecto para mantener la vista limpia y ergonómica.
- **Acciones y Clases a Mano:** Botón de registro extra siempre visible y panel de *"Tus Clases Fijas en Agenda"* sincronizado con los días de la semana y el profesor.

### Fase 159: Clases en Vivo (Live Class Session) y Métricas de Distancia con Cálculo de Ritmo (COMPLETADA ✅)
- **Live Class Session Modal:** Cronómetro digital activo en tiempo real (`MM:SS`), controles de sesión y cómputo de XP al instante.
- **Métricas de Distancia & Ritmo:** Selector de KM para Running/Bici y Metros para Natación con cálculo automático de ritmo (`min/km` y `min/100m`).
- **Check-in Rápido de Clase:** Marcación directa de asistencia en 1 toque.

### Fase 160: Persistencia de Cronómetro en Segundo Plano, Inmunidad a Bloqueo de Pantalla y Widget Flotante (COMPLETADA ✅)
- **Timestamps & Delta Continuo:** Cronómetro inmune a bloqueo de teléfono, suspensión de batería y cambio de pestañas con `useLiveClassStore.ts`.
- **Screen Wake Lock:** Prevención de apagado automático de pantalla durante la sesión activa.
- **Widget Flotante Global:** Píldora animada `FloatingActiveClassPill.tsx` visible en toda la aplicación cuando el modal se minimiza.

### Fase 161: Persistencia de Hábitos en PostgreSQL & Sincronización en la Nube (P0-1 COMPLETADA ✅)
- **Base de Datos Multi-Tenant:** Tablas `habits` y `habit_logs` con RLS y relaciones en cascada.
- **Motor Conductual Lally:** 8 endpoints REST en `/api/v1/habits` con recálculo de rachas, umbrales `[7, 21, 45, 66, 90, 180, 365]` y zonas de tolerancia al 90%.
- **Sincronización en la Nube:** Hook `useHabitSync.ts` con auto-migración de localStorage vía batch sync e hidratación transparente.

### Fase 162: Persistencia de XP, Niveles y Retos en PostgreSQL (P0-2 COMPLETADA ✅)
- **Billetera de XP & Ledger:** `athlete_wallets` y `wallet_transactions` con idempotencia estricta.
- **Retos & Progreso:** `athlete_challenges` y `challenge_progress_events` con RLS en Supabase.
- **Motor de Gamificación:** 7 endpoints REST en `/api/v1/gamification` con cálculo exponencial de nivel y hook `useGamificationSync.ts`.

### Fase 163: Persistencia de Finanzas del Coach en PostgreSQL (P0-3 COMPLETADA ✅)
- **Catálogo de Planes Multi-Tenant:** `commercial_plans` con precios, frecuencias y RLS.
- **Membresías & Cobranzas:** `client_memberships` y `client_payment_records` con historial inmutable.
- **Motor Financiero:** 8 endpoints REST en `/api/v1/finance` con cálculo de MRR y hook `useFinanceSync.ts`.

### Fase 164: Auto-Asignación de Rutinas B2C en PostgreSQL (P0-4 COMPLETADA ✅)
- **Auto-Asignación & Clonación:** `POST /api/v1/athlete/routine/self` para plantillas o rutinas ad-hoc.
- **Resolución Automática:** Vinculación de coach IA por defecto para atletas autónomos sin entrenador.
- **Canvas Activo Interactivo:** Botón de activación de rutina inteligente en 1 toque en `ActiveCanvas.tsx`.

### Fase 165: Conexión de Webhook de Pagos y Activación Post-Checkout (P0-5 COMPLETADA ✅)
- **Webhooks Mercado Pago:** `POST /api/v1/billing/webhooks/payments` montado en `main.py` con `Redis SETNX` y `BackgroundTasks`.
- **Activación Post-Checkout:** Confirmación atómica de `Invoices`, `PurchaseIntents` y registro en `LedgerEntry`.
- **Suite de Pruebas:** `POST /api/v1/billing/simulate-webhook` y test suite en `test_billing_webhook.py`.

### Fase 166: Wizards Pedagógicos de Configuración Inicial y Modo Beta Abierto (COMPLETADA ✅)
- **Wizard de Entrenador:** `CoachWelcomeWizardModal.tsx` con setup de espacio, especialidades y link para alumnos.
- **Wizard de Atleta Dual:** `AthleteWelcomeWizardModal.tsx` adaptado para atletas con coach y atletas autónomos.
- **Modo Beta Abierto:** Bypass de barreras de pago en `AppLayout.tsx` para pruebas fluidas de usabilidad.

### Fase 167: Onboarding Rápido y Bloqueos Pedagógicos para Atleta Autónomo (COMPLETADA ✅)
- **Onboarding Rápido:** Entrada a la plataforma en <30 segundos para atletas autónomos.
- **Candado de Rutina FIE:** Bloqueo pedagógico en `AthleteWorkoutView.tsx` hasta completar datos de borrador.
- **Candado de Nutrición SARA 2:** Bloqueo pedagógico en `AthleteNutritionDashboard.tsx` hasta completar TMB/macros.
- **Candado Exclusivo de Coach:** Bloqueo en `CoachChatView.tsx` hasta vincularse con un profesional certificado.

### Fase 168: Resumen Semanal de los Domingos y Brújula de Ciclos FIE (COMPLETADA ✅)
- **Modal de Brújula Semanal:** `SundayWeeklyBriefingModal.tsx` con balance de la semana, mapa del ciclo (progreso %) y metas de la nueva semana.
- **Trigger Inteligente:** Detección automática en domingo/lunes y banner interactivo permanente en `AthleteDemoDashboard.tsx`.

### Fase 169: Biblioteca Maestra Unificada, Archivos, Compartición P2P y Wizard (COMPLETADA ✅)
- **4 Categorías Unificadas:** Entrenamientos, Nutrición, Recetarios SARA 2 y Documentos/Guías (PDF/Word/Links).
- **Carpetas Base con Emojis Temáticos:** Estructura inicial pre-poblada con selección de icono al crear.
- **Colaboración P2P:** `ShareTemplateModal.tsx` e `ImportTemplateModal.tsx` con códigos de 6 caracteres y WhatsApp.
- **Gestión de Documentos:** `UploadDocumentModal.tsx` con notas y asignación directa a alumnos.
- **Wizard Pedagógico:** `LibraryWelcomeWizardModal.tsx` en 3 pasos interactivos.

### Fase 170: Rediseño Líquido Glassmorphism y Bienvenida Visual de Hábitos (COMPLETADA ✅)
- **Bienvenida Ultra-Premium:** `AthleteWelcomeWizardModal.tsx` con branding de hábitos (`logo-habits-transparent.png`), iluminación ambiental y micro-interacciones suaves.
- **Copywriting Claro y Directo:** Enfoque en valor (plan en 1 toque, offline y XP) eliminando tecnicismos de acceso.
- **Check-in Diario Coherente:** `DailyReadinessModal.tsx` adaptado a la misma línea gráfica translúcida y de vanguardia.

### Fase 171: Tema Claro por Defecto, Logo Habits. sin Recuadro y Red Social (COMPLETADA ✅)
- **Light Mode Default:** Inicialización en tema claro para mobile-first 99%.
- **Logo Habits. & Subtítulo:** Imagotipo limpio sin recuadro con *"Tu Red Social Saludable"*.
- **Luces Fijas & Pilar Social:** Fondo fijo sin titileos y foco en comunidad y profesionales certificados.
- **Recompensa Final (+50 XP):** Celebración al terminar con trofeo animado y confetti.

### Fase 172: Integración del Nuevo Logo Vectorial y Copywriting Simple (COMPLETADA ✅)
- **Asset Vectorial:** Uso de `/logo-habits-transparent.png` mandala sagrada con iconos temáticos y punto verde esmeralda idéntico a Login.
- **Lenguaje Claro y Humano:** Reemplazo de términos técnicos por descripciones directas y comprensibles para cualquier usuario nuevo.

### Fase 173: Protagonismo Premium en Sidebar y Punto con Gradiente de Marca (COMPLETADA ✅)
- **Logo de Alto Contraste:** `Sidebar.tsx` con contenedor esmerilado translúcido y drop-shadow de neón suave.
- **Punto con Gradiente de Marca:** Punto `.` en gradiente ámbar-rosa-índigo (`from-amber-400 via-rose-500 to-indigo-600`).
- **Navegación Líquida:** Píldoras activas con luz violeta/índigo, switch de rol con gradiente satura y avatar con aro multicolor.

### Fase 174: Guía de Inicio Rápido del Entrenador en Tema Claro y Lenguaje Profesional (COMPLETADA ✅)
- **Light Mode Predeterminado:** `CoachWelcomeWizardModal.tsx` en liquid glass blanco translúcido con iluminación ambiental fija.
- **Vocabulario Profesional:** Reemplazo de "Descenso y Quema" por "Recomposición y Definición" y textos pedagógicos claros.

### Fase 175: Liquid Glass Vanguardista y Paleta Cromática del Mandala en Sidebar (COMPLETADA ✅)
- **Diferenciación de Fondo Líquido:** Gradiente multi-capa esmerilado con saturación 180% y sombra volumétrica de elevación.
- **Borde Especular Cuádruple:** Rim light vertical con gradiente Índigo-Rosa-Ámbar-Esmeralda.
- **Identidad Cromática por Módulos:** Cápsulas de icono temáticas por área según los pétalos del logo mandala.

### Fase 176: Hero Cards de Inicio Líquidos y Refinamiento Cromático de Vanguardia (COMPLETADA ✅)
- **Tarjetas de Inicio Liquid Glass:** Revisiones, Agenda y Atletas con gradientes translúcidos, specular rims y cápsulas 3D.
- **Micro-KPIs y Physics:** Badges de triaje y countdown en 45m con pulsos animados y hover interactivo.
- **Saturación en Sidebar:** Cápsulas de icono con degradés vivos y borde perimetral de 2px multi-color.

### Fase 177: Optimización de Dimensiones en Dashboard y Ficha Prolija de Contactos (COMPLETADA ✅)
- **Header y Sidebar Depurados:** Eliminación de 'Vista: Panel Principal' y chip redundante superior 'Entrenador'.
- **Hero Cards Compactas:** Dimensiones optimizadas para menor carga visual y mayor densidad de información.
- **Tira de Contactos Recientes Completa:** Plan, Finanzas, Cansancio (ACWR), Objetivos y Acciones en un layout ultra-prolijo.

### Fase 178: Resiliencia de Biblioteca y Wizard de Onboarding en Tema Claro (COMPLETADA ✅)
- **Corrección en Dashboard:** Eliminación de texto parásito en el render de contactos.
- **Estabilidad de Sesión en /library:** Hook useTemplateSync con fallback local seguro sin expulsar al usuario.
- **Wizard de Bienvenida Renovado:** Diseño Liquid Glass en Tema Claro, pedagogía visual paso a paso y textos limpios UTF-8.

### Fase 179: Remediación Integral de Producción & Eliminación de Crashes P0/P1 (COMPLETADA ✅)
- **9 Fixes Críticos P0:** Desbloqueo fatal de `MagicLinkRedeem`, eliminación del bypass en `RouteGuard` (Zero-Trust), fix `require()` en Vite ESM, corrección de token keys, solución de shadowing en `/search` de ejercicios, y quemado atómico de magic links con Redis SETNX.
- **10 Fixes de Resiliencia P1:** Preservación de `FormData` multipart en uploads, destructuring real de validaciones, método de XP corregido en Tribus, enrutamiento integral de rutas B2C y control de errores visible en wizards.

### Fase 180: Registro Público Autónomo, UI Dual de Acceso & Master Schema SSOT (COMPLETADA ✅)
- **Registro Público de Coaches y Atletas:** Endpoints `POST /api/v1/auth/register` (Coach + Organización + rol ADMIN) y `POST /api/v1/auth/register-b2c` (Atleta Standalone).
- **UI Dual de Acceso:** `LoginPage.tsx` con selector suave de modo (*"Iniciar Sesión"* / *"Soy Coach"*), inputs específicos y login directo.
- **Unificación de Base de Datos SSOT (`schema.sql`):** 16 tablas añadidas con Row-Level Security (RLS) para aislamiento multi-tenant en PostgreSQL / Supabase.
- **Compilación Limpia 100%:** Frontend (`npx tsc --noEmit` -> 0 errores) y Backend (`python3.13 -m compileall app` -> 0 errores).

### Fase 181: Certificación E2E de Flujos de Producción & Smoke Tests Automatizados (COMPLETADA ✅)
- **Suite E2E en Backend (`backend/tests/api/test_e2e_production_workflows.py`):** 5/5 tests aprobados al 100% certificando los 3 workflows críticos:
  1. *Workflow 1 (Coach B2B)*: Registro público, login OAuth2, whoami, creación de atletas y catálogo de ejercicios.
  2. *Workflow 2 (Atleta B2B2C Invitado)*: Magic Link efímero, canje de token y acceso a rutina asignada.
  3. *Workflow 3 (Atleta B2C Libre)*: Auto-registro en Comunidad Bienestar, login y biblioteca de hábitos.
- **Resolución de Foreign Key de Profesionales:** Resolución directa de `Professional.id` en creación de atletas eliminando el error de integridad referencial.

### Fase 182: Desacoplamiento de Login Standalone, Catálogo Multidisciplinario & Perfil Dinámico (COMPLETADA ✅)
- **Login Standalone:** `/login` desacoplado de `AppLayout`, eliminando solapamiento con Sidebar antes de autenticarse.
- **Catálogo de 9 Disciplinas:** Personal Trainer, Nutricionista, Coach Híbrido, Mind Coach, Kinesiólogo, Preparador Físico, Clases Grupales, Yoga/Pilates y Gimnasio.
- **Sidebar Reactivo:** Nombre, iniciales, rol y avatar resueltos dinámicamente desde `useAuth`.

### Fase 183: Erradicación Terminológica Exhaustiva de "SARA 2", "FIE" y "Catilli" (COMPLETADA ✅)
- **Higiene Semántica en Toda la Plataforma:**
  - Sustituido "SARA 2" por *Nutrición Inteligente / Planes de Nutrición*.
  - Sustituido "FIE" en rutinas por *Periodización por Ciclos / Prescripción por Ciclos*.
  - Sustituido "Catilli" por *Videos de Técnica en HD / Técnica Certificada*.
- **Aplicación Global:** Refactorización exhaustiva en `PanoramicBuilder.tsx`, `NaaSWorkspace.tsx`, `SmartVaultPanel.tsx`, `TemplateLibrary.tsx`, `ActiveWorkoutSession.tsx` y stores de Zustand.

### Fase 184: Periodización y Ciclos Ágiles en Nutrición y Rutinas (1-Clic Presets & Quick-Add) (COMPLETADA ✅)
- **Presets de Entrenamiento en 1 Clic (`PanoramicBuilder.tsx`):**
  - Macrociclo Completo (12 Semanas), Hipertrofia & Fuerza (8 Semanas), Recomposición Corporal (6 Semanas), Mesociclo de Hipertrofia (4 Semanas).
  - Auto-población de ejercicios con `generateSmartRoutine` para erradicar pantallas en blanco.
  - Chips rápidos en cabecera de fases: `+4s Hipertrofia`, `+3s Fuerza`, `+1s Descarga`, `+2s Adaptación`.
- **Presets de Nutrición en 1 Clic (`NaaSWorkspace.tsx`):**
  - Ciclo Recomposición (8 Semanas), Definición & Minicut (6 Semanas), Volumen Limpio (10 Semanas), Ciclado de Carbohidratos (4 Semanas).
  - Chips rápidos en cabecera de mapa de fases: `+4s Déficit`, `+4s Mantenimiento`, `+4s Superávit`, `+2s Reverse`.

### Fase 185: Login Autónomo con Creación de Cuenta Explícita y Google OAuth (COMPLETADA ✅)
- **Formulario Claro y Limpio (`LoginPage.tsx`):**
  - Selector de modo (*"Iniciar Sesión"* / *"Crear Cuenta Nueva"*).
  - Campos claros de Email y Contraseña con iconos, validación y alternador de visibilidad.
  - Conmutador en 1 clic: *"¿No tenés cuenta? Creá tu cuenta gratis"*.
- **Google OAuth Token Client:** Inicio de sesión instantáneo con Google Identity Services.

### Fase 186: Onboarding de Entrenadores con Bento Grid Pedagógico de 6 Pilares (COMPLETADA ✅)
- **Wizard de Bienvenida Interactivo (`CoachWelcomeWizardModal.tsx`):**
  - Bento Grid de 6 pilares: Rutinas & Ciclos, Nutrición & Fases, Clases Grupales & Retos, Agenda de Turnos, Chat & Validación 2-en-1, Finanzas & Cobros.
  - Acceso inmediato al enlace de invitación para compartir con alumnos vía WhatsApp.

### Fase 187: Marco Científico de Hipertrofia & Biomecánica Avanzada (COMPLETADA ✅)
- **Corpus Científico de ~50 Papers:**
  - Síntesis e integración de la evidencia más sólida en hipertrofia y fuerza (Schoenfeld, Helms, Israetel, Beardsley, Zourdos, Henselmans).
  - Stretch-Mediated Hypertrophy (SMH): priorización de variantes en máximo estiramiento sarcomérico para mayor hipertrofia distal.
  - Control de Carga Axial: umbral de $\le 15$ puntos acumulados para evitar sobrecarga en columna baja (L4-S1).
  - Landmarks de Volumen Fraccional: MEV, MAV, MRV con ratio 1.0 a agonistas y 0.5 a sinergistas.
  - Presets de periodización con base científica: DUP 3d, GBR 4d, PPL 6d, PHAT 5d.

### Fase 188: Supresión de Alerta Molesta de Sobreentrenamiento (COMPLETADA ✅)
- **Eliminación de Fricción Cognitiva:**
  - Erradicación definitiva de banners y modales intrusivos de "Riesgo de Sobreentrenamiento" que bloqueaban la interacción del usuario al superar hitos temporales.
  - Transformación a monitoreo silencioso y constructivo en la barra de series por grupo muscular.

### Fase 189: Cortafuegos Clínico Lumbar, Hombro y Rodilla en Generador (COMPLETADA ✅)
- **Blindaje Clínico en Generación Automática:**
  - Detección de lesiones y limitaciones del atleta (`injuries_or_limitations`: 'lumbar', 'shoulder', 'knee').
  - Sustituciones automáticas seguras en `routineGeneratorEngine.ts`: sentadillas/peso muerto con barra $\rightarrow$ Prensa 45°, Belt Squat, Hip Thrust, RDL con mancuernas; press militar $\rightarrow$ Scaption 30° con mancuernas, Floor Press; sentadilla clásica $\rightarrow$ Spanish Squat o Prensa con pies altos.

### Fase 190: Motor Canónico Weider Clásico de 3 Días (COMPLETADA ✅)
- **Rutina Clásica Canónica (`generate3DayClassicWeider`):**
  - Día 1: Pecho / Tríceps + Calentamiento RAMP específico + Core 360° + Vuelta a la calma.
  - Día 2: Espalda / Bíceps + RAMP específico + Core 360° + Vuelta a la calma.
  - Día 3: Piernas / Hombros + RAMP específico + Core 360° + Vuelta a la calma.
  - Distribución por tiers: Compuestos pesados T1, Secundarios T2, Accesorios de aislamiento / SMH T3, Core y estiramientos.
  - Compatibilidad 100% con el cortafuegos clínico.

### Fase 191: Rediseño UX de "Distribución Semanal" & Sincronización Reactiva con Onboarding (COMPLETADA ✅)
- **Higiene Semántica & Pedagogía Visual:**
  - Reemplazo absoluto del término "Split" por "Distribución Semanal".
  - Explicación pedagógica visual: regla de oro de 48 horas de recuperación muscular.
  - Botones con etiquetas diferenciadas y limpias (`Clásica (3d)`, `Full Body (3d)`, `Torso / Pierna (4d)`, `Híbrido (5d)`, `PPL x 2 (6d)`).
- **Sincronización Reactiva con Onboarding:**
  - Detección de `training.days_per_week` de `useOnboardingPTStore`. Preselección automática al abrir el constructor de rutinas.
  - Insignia interactiva: `🎯 Preferencia del cliente: X días/semana` y badge `🎯 Onboarding` en el botón correspondiente.
- **Ergonomía Superior de Acciones:**
  - Reubicación de `[ 📅 Diseñar Ciclo a Medida (Librería) ]` y `[ 🎓 Ver Guía de Periodización ]` en la cabecera superior.
  - Panel desplegable de Guía de Periodización en la parte superior sin provocar scroll forzado.
- **Verificación de Compilación Integral:**
  - Frontend: `npx tsc --noEmit` $\rightarrow$ **0 errores (Exit code 0)**.

### Fase 192: Presentación Global Ágil de Intro, Overlay Sólido Móvil, Agenda Simétrica y Erradicación de Fuga de Estado en Clases (COMPLETADA ✅)
- **Presentación e Intro Global (`IntroPage.tsx` & `App.tsx`):**
  - Fallback visual con imagotipo mandala geométrico, partículas de luz ambiental y botón de avance rápido *"Comenzar Ahora"*, asegurando que la falta de archivo físico de video no interrumpa la bienvenida.
- **Blindaje Visual de Sidebar Móvil (`Sidebar.tsx` & `MobileNavbar.tsx`):**
  - Erradicación definitiva de superposición y solapamiento tipográfico al abrir el menú lateral en dispositivos móviles mediante overlay opaco `bg-slate-900/98 backdrop-blur-2xl z-50` con aislamiento de capas y captura de eventos.
- **Agenda Semanal Simétrica y Depurada (`SmartCalendarPage.tsx` & `CalendarDayView.tsx`):**
  - Refactorización de proporciones y paddings para móvil eliminando desbordes horizontales, con depuración de datos residuales o hardcodeados.
- **Erradicación de Fuga de Estado en Clases & Grupos (`useAgendaStore.ts`):**
  - Inicialización limpia de colecciones evitando el parpadeo de datos mock previos antes del renderizado de estado vacío (*Empty State*).

### Fase 193: Selector Dual "Soy Usuario" / "Soy Coach" & Autenticación Contextual con Google y Correo (COMPLETADA ✅)
- **Selector de Rol de Primer Nivel (`LoginPage.tsx`):**
  - Sustitución de pestañas genéricas por el selector de intención directa: `[ 👤 Soy Usuario ]` (Atleta / Alumno / B2C) y `[ ⚡ Soy Coach ]` (Entrenador / Nutricionista / Profesional B2B).
- **Sub-Flujos de Acceso & Creación de Cuenta:**
  - **Iniciar Sesión:** Botón *"Continuar con Google"* o campos de *"Usuario (Correo Electrónico)"* y *"Contraseña"*, con redirección contextual automática (`/athlete` para Atletas, `/dashboard` para Coaches).
  - **Crear Cuenta:** Botón *"Registrarse con Google"* o *"Registrarse con correo"* con campo dinámico de Nombre y Apellido (o Nombre/Marca de Coach) despachando a `POST /api/v1/auth/register-b2c` o `POST /api/v1/auth/register`.
- **Resiliencia & Auto-Login en Conflicto (HTTP 409):**
  - Detección de correo existente con intento de login automático o botón de acción directa *"Ir a Iniciar Sesión"*.
- **Liquid Glass & Ergonomía Móvil:**
  - Adaptabilidad edge-to-edge en pantallas móviles y card centrada flotante con física 3D en escritorio.

### Fase 194: Blindaje de Identidad, Aislamiento de Roles y Purga de Contactos de Prueba (COMPLETADA ✅)
- **Aislamiento Estricto de Rutas por Rol (`AuthContext.tsx`, `App.tsx`):**
  - Enrutamiento defensivo reactivo para usuarios con rol `ATHLETE`: navegación garantizada hacia el entorno del alumno (`/athlete`), impidiendo fugas o accesos no autorizados a vistas exclusivas de entrenadores como `/dashboard` o `/triaje`.
- **Higiene de Datos de Producción:**
  - Purga de contactos y atletas de prueba residuales en el estado local y stores, asegurando que nuevas instancias operen en modo plataforma virgen (*clean slate*).
- **Depuración Estética de Video de Introducción (`IntroPage.tsx`):**
  - Eliminación de filtros de oscurecimiento artificial y viñetas para reproducir el video en sus colores 100% naturales, acompañado de un botón discreto *"Saltar Intro"*.

### Fase 195: Planificación Ágil de Agenda: Drag-to-Select Estilo Google Calendar & Replicación Semanal (COMPLETADA ✅)
- **Mecánica Drag-to-Select en Cuadrícula Semanal (`ProfessionalAgenda.tsx`):**
  - Selección continua de múltiples días y franjas horarias arrastrando el ratón (`onMouseDown`, `onMouseEnter`, listener global de `window.mouseup`).
  - Feedback visual táctil en el eje Z: elevación física (`scale-[1.01] z-20 shadow-md ring-2 ring-indigo-500`) y fondo índigo translúcido en celdas seleccionadas.
  - Píldora inferior flotante reactiva en tiempo real (*"Pintando X días (HH:MM - HH:MM) • Soltá el mouse para agendar o bloquear"*).
- **Modal Contextual de Creación en Lote:**
  - Doble modalidad: *Turnos Diarios Separados* (crea citas independientes para cada día seleccionado en el mismo horario) o *Bloqueo Horario Completo* (reserva todo el intervalo para eventos, descansos o evaluaciones).
- **Replicación de Semana con 1 Clic (`Replicar Semana`):**
  - Clona todos los turnos y actividades confirmadas de la semana visualizada a la semana siguiente (+7 días) y avanza automáticamente a ella con toast de éxito.
- **Navegación Semanal Ilimitada:**
  - Botones `<` y `>` para desplazarse sin límite entre semanas, con badge indicador (`+1 sem`, `+2 sem`) y botón contextual `[ ⟲ Hoy ]` para regresar de inmediato.

### Fase 196: Microinteracciones Sonoras Neuroestéticas (Web Audio API) & Celebración Dopaminérgica (COMPLETADA ✅)
- **Motor Sintetizado de Audio Nativo (`web/src/utils/audioEffects.ts`):**
  - Implementación con Web Audio API pura, sin archivos externos, cero dependencias, funcionamiento offline y latencia cero:
    - `playDopamineChime()`: Arpegio armónico ascendente dulce (F#5 $\rightarrow$ A#5 $\rightarrow$ C#6) con caída exponencial al completar tareas o consolidar hábitos.
    - `playSubtlePop()`: Pop acústico sutil y nítido para la creación instantánea de tareas (tecla Enter) o desmarcado.
    - `playCelebrationChord()`: Acorde mayor brillante (E5, G#5, B5, E6) para la duplicación de semana y confirmación de bloques en lote.
- **Microinteracciones Visuales en Checkboxes:**
  - Botón circular interactivo con animación de tilde spring (`motion.div`), rebote y tachado dinámico en verde esmeralda (`transition-all duration-300 line-through decoration-emerald-500/70`).

### Fase 197: Reducción de Carga Cognitiva, Pedagogía Visual y Rediseño Integral del Panel "To DO" (COMPLETADA ✅)
- **Erradicación de Sobrecarga Mental y Jerga Técnica (`ProfessionalAgenda.tsx`):**
  - Reducción de nombres largos a etiquetas concisas y humanas: `Semana`, `Tareas`, `Hoy`.
  - Reemplazo de botones dispersos por jerarquía limpia: acción primaria `+ Agendar Cita` y selector `To DO (X)`.
  - Tarjetas Bento compactas de un vistazo (`Citas Hoy`, `Por Vencer`, `Pendientes`, `Completadas`) que funcionan como atajos clicables de navegación.
- **Onboarding Pedagógico Visual No Invasivo:**
  - Cápsula introductoria sutil: *"Planificación ágil: Arrastrá el mouse sobre los días para agendar en bloque. Cada tarea completada suena para celebrar tu avance."* con botón *"Entendido"* y persistencia permanente en `localStorage` (`habits_agenda_quicktip_dismissed`).
- **Rediseño del Panel Lateral "To DO":**
  - Renombrado oficial a **`To DO`** con contador gramaticalmente correcto (`X pendientes`).
  - Input unificado de una sola línea horizontal (`+ [Nueva tarea... (Enter)]`) con micro-pills de prioridad directa (`Alta`, `Media`, `Baja`) eliminando el bloque vertical de dos pisos y la etiqueta pesada *"PRIORIDAD"*.
  - Eliminación de anglicismos crudos (`MEDIUM`, `HIGH`, `LOW` $\rightarrow$ `• Alta`, `• Media`, `• Baja`).
  - Píldoras de filtro compactas sin desbordes (`Todas`, `Importantes`, `Hábitos`, `Ciclos`).
  - Checkbox circular de alto contraste (`border-2 border-slate-300 dark:border-zinc-500 bg-white dark:bg-zinc-800`) con tilde animada en verde esmeralda y feedback dopaminérgico.
- **Reubicación Ergonómica a la Izquierda:**
  - Reubicación del panel lateral **To DO** al **lado izquierdo** de la cuadrícula semanal en escritorio (`xl:order-1`), respetando el patrón de lectura visual occidental (revisar pendientes $\rightarrow$ agendar/bloquear en el calendario a la derecha).
- **Verificación de Compilación Integral:**
  - Frontend: `npm run build` $\rightarrow$ **0 errores (Exit code 0)**.

### Fase 198: Estadísticas Desplegables Bajo Filtros y Acciones Rápidas a 1 Clic en Roster de Contactos (COMPLETADA ✅)
- **Eliminación de Scroll Forzado y Menú Desplegable Cerrado (`TrainerRoster.tsx`):**
  - Reubicación de las 3 tarjetas estadísticas (*Objetivos*, *Planes Asignados*, *Estado de Cuotas*) dentro de un menú desplegable colapsable **cerrado por defecto** (`isStatsOpen = false`) ubicado inmediatamente debajo de los filtros.
  - Gatillo liquid glass con micro-pills resumen en vivo (`🎯 Fuerza/Rehab`, `📋 Planes`, `💳 Cuotas`) y chevron interactivo animado 180°.
- **Tarjeta de Alumno Prémium con Visibilidad Instantánea:**
  - Exposición de datos esenciales a simple vista: Nombre, Badge `Nuevo`, Racha, Último entrenamiento, Enfoque y Etiquetas críticas.
  - **Indicador de Mensajería Interna No Leída:** Punto de pulso ámbar (`bg-amber-500 animate-pulse`) en el avatar para alertar sobre mensajes pendientes en el chat interno propio.
- **Micro-Toolbar de Acciones Rápidas a 1 Clic con `stopPropagation()`:**
  - Atajos directos a 1 clic para: `📅 Agendar Turno`, `🏋️ Ver/Diseñar Rutina`, `💬 Mensajería Interna`, `💳 Alternar Cuota` (conmutación en memoria optimista con toast reactivo) y `➡️ Perfil Completo`.
- **Verificación de Compilación Integral:**
  - Frontend: `npm run build` $\rightarrow$ **0 errores (Exit code 0)**.



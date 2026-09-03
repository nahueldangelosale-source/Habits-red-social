# 📋 Sprint Backlog — Bienestar APP

> Estado actual de ejecución y planificación de sprints inmediatos.  
> **Última actualización**: 3 de Septiembre 2026

---

## 🏆 Hitos Completados Recientemente

### Sprint de Marco Científico de Hipertrofia, Cortafuegos Clínico, Motor Weider Clásico & Distribución Semanal Reactiva (Fases 187-191 - 3 Sep 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-SPLIT-TERM | Erradicación Terminológica de "Split" por "Distribución Semanal" | ✅ Done | `web/src/components/onboarding/PanoramicBuilder.tsx` | Vocabulario pedagógico, explicación visual de 48hs de recuperación muscular para atletas principiantes |
| S-SPLIT-BTNS | Etiquetas Diferenciadas por Botón de Distribución | ✅ Done | `PanoramicBuilder.tsx` | Propiedad `buttonLabel` en `PEDAGOGICAL_SPLITS` (`Clásica (3d)`, `Full Body (3d)`, `Torso / Pierna (4d)`, `Híbrido (5d)`, `PPL x 2 (6d)`) |
| S-SPLIT-ONBOARD | Sincronización Reactiva con Onboarding del Atleta | ✅ Done | `PanoramicBuilder.tsx`, `useOnboardingPTStore.ts` | Preselección de distribución semanal basada en `days_per_week` con badges `🎯 Onboarding` y aviso interactivo |
| S-BUILDER-ACTIONS | Reubicación Superior de Acciones Clave | ✅ Done | `PanoramicBuilder.tsx` | Botones `[ 📅 Diseñar Ciclo a Medida ]` y `[ 🎓 Ver Guía de Periodización ]` arriba con panel desplegable sin scroll |
| S-WEIDER-3D | Motor Canónico Weider Clásico de 3 Días | ✅ Done | `routineGeneratorEngine.ts` | `generate3DayClassicWeider` (Pecho/Tríceps, Espalda/Bíceps, Piernas/Hombros) con RAMP, compuestos T1, SMH T2/T3, core y vuelta a la calma |
| S-CLINICAL-FW-TRAIN | Cortafuegos Clínico Lumbar/Hombro/Rodilla en Generador | ✅ Done | `routineGeneratorEngine.ts`, `clinicalFirewall.ts` | Sustitución estricta ante contraindicaciones (Prensa 45°, Belt Squat, Scaption 30°, Spanish Squat) |
| S-OVERTRAIN-CLEANUP | Supresión de Alerta Molesta de Sobreentrenamiento | ✅ Done | `PanoramicBuilder.tsx`, `routineGeneratorEngine.ts` | Eliminado el banner intrusivo y alarmista de MRV; analítica sutil y constructiva |
| S-HYPERTROPHY-MATH | Marco Científico de Hipertrofia (~50 Papers) | ✅ Done | `routineGeneratorEngine.ts` | Stretch-Mediated Hypertrophy (SMH), control de fatiga axial $\le 15$ pts, y landmarks MEV/MAV/MRV |
| S-TSC-CHECK-F191 | Verificación de Compilación Integral | ✅ Done | `web/` | `npx tsc --noEmit` $\rightarrow$ 0 errores de TypeScript |

### Sprint de Presets de Ciclos en 1 Clic, Higiene Semántica, Google OAuth & Bento Grid de Coach (Fases 183-186 - 2 Sep 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-SEMANTIC-CLEANUP | Erradicación de "SARA 2", "FIE" y "Catilli" | ✅ Done | Stores, Components, Builders | Sustitución sistemática por *Nutrición Inteligente*, *Periodización por Ciclos* y *Videos Técnicos en HD* |
| S-CYCLES-TRAINING | Presets de Ciclos de Entrenamiento en 1 Clic | ✅ Done | `PanoramicBuilder.tsx` | 4 macro/mesociclos (12s, 8s, 6s, 4s), auto-ensamblado sin pantalla en blanco y chips `+4s Hipertrofia`, etc. |
| S-CYCLES-NUTRITION | Presets de Ciclos Nutricionales en 1 Clic | ✅ Done | `NaaSWorkspace.tsx` | 4 fases metabólicas (Recomposición 8s, Minicut 6s, Volumen Limpio 10s, Ciclado Carbos 4s) y chips de periodos |
| S-AUTH-GOOGLE-OAUTH | Login Autónomo con Google OAuth Token Client | ✅ Done | `LoginPage.tsx` | Integración nativa Google Identity Services, selector Crear Cuenta / Login y visibilidad de contraseña |
| S-COACH-BENTO-WIZ | Bento Grid Pedagógico de 6 Pilares | ✅ Done | `CoachWelcomeWizardModal.tsx` | Tour interactivo visual (Rutinas, Nutrición, Clases, Agenda, Chat 2-en-1, Finanzas) y enlace de WhatsApp |

### Sprint de Desacoplamiento Standalone de Login, Catálogo Multidisciplinario, Sidebar Dinámico & Plataforma Virgen (Fase 182 - 1 Sep 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-LOGIN-STANDALONE | Desacoplamiento de `/login` de `AppLayout` | ✅ Done | `web/src/App.tsx` | Renderizado standalone full-screen; eliminación de renderizado de sidebar y datos no autenticados |
| S-LOGIN-CLEAN-UI   | Limpieza de Credenciales Mock en Login | ✅ Done | `web/src/components/LoginPage.tsx` | Eliminación de inputs pre-rellenados para experiencia limpia de usuario |
| S-DISCIPLINES-FULL | Catálogo Multidisciplinario de Especialidades | ✅ Done | `web/src/components/LoginPage.tsx` | 9 disciplinas soportadas (PT, Nutri, Híbrido, Mind Coach, Kinesio, Prep Físico, Clases, Yoga, Gym) |
| S-SIDEBAR-DYNAMIC  | Perfil Dinámico de Usuario en Sidebar | ✅ Done | `web/src/components/Sidebar.tsx` | Avatar, iniciales, nombre real y rol leídos de `useAuth()`; adiós al mock *"Nahuel H."* |
| S-VIRGIN-STORES    | Limpieza de Datos Mock en Stores de Comunicación y Finanzas | ✅ Done | `useCoachCommunicationStore.ts`, `useFinanceStore.ts` | Estado inicial vacío para nuevas cuentas de entrenadores |
| S-WIZARD-AUTO-OPEN | Activación Automática de Welcome Wizard para Coach Nuevo | ✅ Done | `web/src/components/layout/AppLayout.tsx`, `CoachWelcomeWizardModal.tsx` | Tour interactivo, branding del gimnasio y generación de link de invitación |
| S-BUILD-TSC-VERIF  | Verificación de Compilación Frontend | ✅ Done | `web/` | `npx tsc --noEmit` $\rightarrow$ 0 errores de TypeScript |

### Sprint de Suite E2E de Producción & Certificación de los 3 Workflows (Fase 181 - 1 Sep 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-E2E-W1-COACH     | Certificación E2E Workflow 1 (Coach B2B) | ✅ Done | `tests/api/test_e2e_production_workflows.py` | Registro público, Tenant, JWT, Login `/token`, `/whoami`, Roster y Exercises |
| S-E2E-W2-ATHLETE   | Certificación E2E Workflow 2 (Atleta Invitado) | ✅ Done | `tests/api/test_e2e_production_workflows.py` | Creación de atleta, Magic Link con `jti`, canje `/redeem` y consulta de rutina |
| S-E2E-W3-STANDALONE| Certificación E2E Workflow 3 (Atleta B2C Libre) | ✅ Done | `tests/api/test_e2e_production_workflows.py` | Registro `/register-b2c`, rol `CLIENT_FITNESS`, login y biblioteca autónoma |
| S-FK-PROF-RESOLV   | Resolución de `Professional.id` en Patients Router | ✅ Done | `backend/app/api/v1/routers/patients.py` | Consulta explícita a tabla `professionals` para evitar FK mismatch |
| S-TELEMETRY-CLEAN  | Resiliencia de Inicialización de Telemetría | ✅ Done | `backend/app/core/telemetry.py` | Eliminadas llamadas duplicadas fuera de try/except |
| S-PYTEST-E2E-PASS  | Ejecución Automatizada de Suite E2E | ✅ Done | `backend/tests/` | 5/5 tests PASSED (100% éxito) |

### Sprint de Auditoría Exhaustiva de Producción, Remediación P0/P1, Registro Público & Schema SSOT (Fase 179-180 - 1 Sep 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-P0-MAGICLINK | Fix Crash Fatal en MagicLinkRedeem (`.resetOnboarding`) | ✅ Done | `web/src/components/auth/MagicLinkRedeem.tsx` | Corrección de método inexistente que bloqueaba el canje de Magic Links del atleta (W2) |
| S-P0-ROUTEGUARD| Fix Bypass de Seguridad en RouteGuard (Zero-Trust) | ✅ Done | `web/src/components/auth/RouteGuard.tsx` | Eliminado mock de ADMIN sin login; redirect a `/login` y limpieza de tokens expirados |
| S-P0-REQUIRE   | Fix Crash de `require()` en Vite ESM Bundle | ✅ Done | `web/src/components/onboarding/ZeroClientWizard.tsx` | Reemplazado `require()` por constante declarativa |
| S-P0-TOKENKEY  | Fix Token Key Mismatch (`athlete_jwt` vs `token`) | ✅ Done | `web/src/api/athleteApi.ts` | Corrección de clave de almacenamiento en localStorage para feedback autenticado |
| S-P0-ROLES     | Fix Role Enum Mismatch en Action Cards | ✅ Done | `backend/app/api/action_cards.py` | Uso de `Role.ADMIN` y `Role.PERSONAL_TRAINER` válidos en RBAC |
| S-P0-MESO-SUB  | Fix `TokenData.sub` en Mesocycles | ✅ Done | `backend/app/api/mesocycles.py` | Corrección de acceso a `current_user.user_id` y `Professional.user_id` |
| S-P0-ADMIN-INT | Fix Dict vs Pydantic en Admin Internal | ✅ Done | `backend/app/api/admin_internal.py` | Acceso tipado a `current_user.role` y `current_user.user_id` |
| S-P0-ROUTES-EX | Fix Route Shadowing en Exercises Router | ✅ Done | `backend/app/api/exercises_routes.py` | Endpoint `GET /search` posicionado antes de `GET /{id}` |
| S-P0-MAGIC-BURN| Activación de Single-Use Burn para Magic Links | ✅ Done | `backend/app/api/auth_b2c.py` | Verificación y marcado atómico de `jti` con Redis SETNX |
| S-P1-CLIENT    | Fix FormData Multipart & Token Cleanup | ✅ Done | `web/src/api/client.ts` | Preservación de multipart para subida de archivos y limpieza de token en 401 |
| S-P1-VALID     | Fix Destructuring en `useValidations.ts` | ✅ Done | `web/src/hooks/queries/useValidations.ts` | Eliminado `{ data }` para consumir datos reales de `/api/v1/validations/pending` |
| S-P1-TRIBU     | Fix Método `awardXP` en useTribuStore | ✅ Done | `web/src/stores/useTribuStore.ts` | Corregida llamada a `.awardXP('habit', xp)` en lugar del inexistente `.addXP` |
| S-P1-B2CROUTES | Fix Regex `isB2CRoute` en App.tsx | ✅ Done | `web/src/App.tsx` | Agregados `/nutrition-blocks`, `/habits/*`, `/redeem` y `/login` explícito |
| S-P1-WIZARD-ERR| Fix Supresión Silenciosa de Errores en Onboarding | ✅ Done | `web/src/components/onboarding/ZeroClientWizardPT.tsx` | Manejo y toast explícito ante cualquier error de red/servidor |
| S-AUTH-REG-COACH| Endpoint Registro Público Coach con Creación de Tenant | ✅ Done | `backend/app/api/v1/routers/auth.py` | `POST /api/v1/auth/register` con slug único, password bcrypt, Professional y UserRole ADMIN |
| S-AUTH-REG-B2C | Endpoint Registro Standalone B2C | ✅ Done | `backend/app/api/v1/routers/auth.py` | `POST /api/v1/auth/register-b2c` con Client y rol CLIENT_FITNESS |
| S-LOGIN-UI     | UI Dual Login / Registro de Coach con Liquid Glass | ✅ Done | `web/src/components/LoginPage.tsx` | Selector suave "Iniciar Sesión" / "Soy Coach", inputs personalizados y payload directo |
| S-SCHEMA-SSOT  | Unificación de 16 Tablas Faltantes en `schema.sql` | ✅ Done | `backend/schema.sql` | Hábitos, Wallets, Desafíos, Tribus, Finanzas, Membresías, Templates, RLS Zero-Trust |
| S-BUILD-VERIF  | Compilación 100% Limpia Frontend y Backend | ✅ Done | `web/` & `backend/` | `npx tsc --noEmit` (0 errores) & `python3.13 -m compileall app` (0 errores) |

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-CMD-ALERT  | Alerta Inteligente Condicional de Fatiga/Lesión | ✅ Done | `web/src/components/CommandCenter.tsx` | Notificación condicional para malestares, lesiones y fatiga aguda; badge "✓ Todo bajo control" en días normales |
| S-GAM-TABS   | Doble Pestaña de Grupos vs Retos | ✅ Done | `web/src/components/coach/GamificationBuilder.tsx` | Segmentación limpia entre `👥 Clases & Grupos Activos` y `🏆 Catálogo de Retos (Game Master)` |
| S-GAM-ACC    | Acordeón de Clases Colapsado por Defecto & Grilla 12-Col | ✅ Done | `web/src/components/coach/GamificationBuilder.tsx` | Fila compacta cerrada por defecto para evitar scroll excesivo, toggle expandir/colapsar todas y simetría milimétrica |
| S-GAM-PILL   | Píldora Violeta Pedagógica de Reto Activo | ✅ Done | `web/src/components/coach/GamificationBuilder.tsx` | Leyenda superior, micro-etiqueta `"RETO EN VIVO"`, trofeo, dot verde pulsante `● Live` y botón `+ Asignar Reto` |
| S-STORE-CLS  | Store Persistente de Clases y Escuadrones | ✅ Done | `web/src/stores/useClassesStore.ts` | Gestión global de clases, horarios, miembros y sincronización en tiempo real con `ActiveClassesWidget.tsx` |
| S-FIN-ALERT  | Sugerencias Inteligentes en Modo Notificación Superior | ✅ Done | `web/src/components/dashboard/FinanceDashboardView.tsx` | Banner superior prioritario con alertas de cobros pendientes ($108.000) e insights de retención (+11.7%) |
| S-FIN-WHATSAPP| Modal de Cobro por WhatsApp con 1 Toque | ✅ Done | `web/src/components/dashboard/FinanceDashboardView.tsx` | Mensaje cordial pre-redactado, botón de copiado, apertura directa `wa.me/` y acción `Ya me pagó (Marcar Al Día)` |
| S-FIN-PEDAGOGY| Pedagogía Visual & Lenguaje Amigable en Finanzas | ✅ Done | `web/src/components/dashboard/FinanceDashboardView.tsx` | Reemplazo de acrónimos fríos por métricas humanas (*Recaudación Mensual*, *Alumnos al Día*, *Cobros Pendientes*, *Cuota Promedio*) |
| S-FIN-CHART  | Gráfico de Área con Tooltip Monetario & Rango 6/12M | ✅ Done | `web/src/components/dashboard/FinanceChart.tsx` | Curva suave de ingresos con formato `$1.050.000`, selector de meses y barras de distribución de membresías |
| S-FIN-STORE  | Store de Finanzas Persistente v3 & Datos Seed | ✅ Done | `web/src/stores/useFinanceStore.ts` | 12 meses históricos ($320k a $1.05M) y 10 clientes con auto-migración y recuperación garantizada |

### Sprint de Cierre 100% Módulo de Entrenamiento, Sincronización en la Nube de Templates, Adherencia Dinámica & Contraste de Chat (24 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-TRAIN-SYNC | Hook Reactivo de Sincronización de Templates | ✅ Done | `web/src/hooks/useTemplateSync.ts` | Conexión TanStack Query a `/api/v1/templates` (list, create, update, delete, fork) con cache invalidation |
| S-STORE-SYNC | Integración de Nube en Store de Plantillas | ✅ Done | `web/src/stores/useTemplateLibraryStore.ts` | Acción `syncFromBackend` para mergear plantillas en *"☁️ Plantillas en la Nube"* y flags `isSynced`/`lastSyncedAt` |
| S-UI-SYNC    | Indicador de Nube Activa en Biblioteca | ✅ Done | `web/src/components/library/TemplateLibrary.tsx` | Badge `☁️ Nube activa` y auto-sincronización reactiva en montaje |
| S-TRAIN-ADH  | Cálculo Dinámico de Adherencia en Tracking View | ✅ Done | `web/src/components/drilldown/WorkoutTrackingView.tsx` | Reemplazo del 85% hardcodeado por `useMemo` sobre `useExecutionStore.sessionHistory` (ventana 28 días) |
| S-CHAT-TYPO  | Corrección de Contraste y Tipografía en Chat | ✅ Done | `web/src/components/IntelligentInbox.tsx` | Corrección de `text-white` en mensajes de atleta en modo claro a `text-slate-900 dark:text-zinc-100` |
| S-BE-CLEANUP | Limpieza y Des-registro de Stubs Muertos | ✅ Done | `backend/app/main.py` | Eliminados imports y registros de `readiness_routes` y `swap_routes` vacíos |
| S-TEST-SUITE | Verificación Total de Tests Backend (40/40 Tests) | ✅ Done | `tests/api/` & `tests/math_engine/` | 40/40 tests PASSED (Workouts, Athlete, Coach, Biomechanics, EWMA ACWR, Domain Math) |
| S-FE-BUILD   | Verificación de Gobernanza DTCG y Build Vite | ✅ Done | `web/` | 0 violaciones de tokens de diseño, 0 errores TypeScript, 184 assets generados limpiamente |

### Sprint de Remediación Integral de Producción Backend, Seguridad & Nutrición Atleta (24 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-BE-SEC-01| Eliminación de Backdoor en Autenticación | ✅ Done | `backend/app/middleware/auth.py` | Eliminado token estático `demo_b2b_token_123` que otorgaba permisos `ADMIN` sin contraseña |
| S-BE-CORS-01| Configuración de CORS Dinámico | ✅ Done | `backend/app/main.py`, `config.py` | Migrado a `settings.cors_origins_list` para soportar dominios de producción (Vercel, `app.bienestaros.com`) |
| S-BE-DOCKER| Dockerfile de Producción & `.dockerignore` | ✅ Done | `backend/Dockerfile`, `.dockerignore` | Eliminado `pip build` inválido, requirements en UTF-8, `.dockerignore` y puerto dinámico `${PORT:-8000}` |
| S-BE-REPO-01| Repositorio Multi-Tenant de Nutrición | ✅ Done | `backend/app/repositories/nutrition_repo.py` | `NutritionRepository` para alimentos SARA 2, planes nutricionales, recetas y logs con Zero-Trust y Anti-IDOR |
| S-BE-SHOP-01| Motor de Compras Inteligente (Shopping List) | ✅ Done | `backend/app/services/shopping_list_service.py` | Consolidación por góndolas, conocimiento de empaque retail argentino y escalado temporal `3d`, `1w`, `2w`, `1m` |
| S-BE-LOGS-01| Endpoints de Plan Activo, Meal Logs & Adherencia | ✅ Done | `backend/app/api/nutrition_routes.py` | `GET /plans/active`, `POST /shopping-list`, `POST /meal-logs`, `GET /meal-logs`, `GET /adherence/today` |
| S-BE-VIS-01| Activación de Router Nutrition Vision GPT-4o | ✅ Done | `backend/app/api/nutrition_vision.py`, `main.py` | `POST /analyze` (Base64) y `POST /analyze-file` (`multipart/form-data`) |
| S-BE-CEL-01| Workers de Celery & Registro de Tareas | ✅ Done | `cri_worker.py`, `dietqa_worker.py`, `nutrition_tasks.py`, `celery_app.py` | `recalculate_cri_task`, `generate_dietary_plan_task`, `generate_nutrition_pdf_task` y 13 módulos en `include` |
| S-BE-MIG-01| Migración Alembic para Tabla `recipes` | ✅ Done | `alembic/versions/e4f5a6b7c8d9_add_recipes_table.py` | Tabla `recipes` con RLS multi-tenant e índices (Head `e4f5a6b7c8d9`) |
| S-BE-ENV-01| Sincronización de Variables de Entorno | ✅ Done | `backend/.env.example` | Plantilla actualizada con `REDIS_URL`, `CELERY_*`, `GOOGLE_*`, `MP_*`, `SENTRY_*`, Feature Flags |
| S-TEST-NUT | Suite de Tests de Nutrición (100% Pass) | ✅ Done | `tests/api/test_nutrition_module.py`, `test_health.py` | 4/4 tests de nutrición + 2/2 tests de infraestructura (`/health` y `/ready`) + 2/2 tests de workouts PASSED |

### Sprint de Nutrición Móvil UX, Smart Swap Integral, Medidas Caseras & Validación Fotográfica con Coach (24 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-NUT-04 | Simplificación UX de Tarjeta de Comida | ✅ Done | `web/src/components/athlete/MealOptionCard.tsx` | Eliminación de tabs Opción A/B redundantes, plato nutricional en Donut Chart pedagógico con distribución de macros (Proteína, Carbos, Grasas) |
| S-NUT-05 | Cambio de Menú Completo Isocalórico | ✅ Done | `web/src/components/nutrition/FullMealSwapModal.tsx` | Catálogo de recetas balanceadas por momento del día con `createPortal`, z-index prioritario y scroll adaptado a móviles |
| S-NUT-06 | Sustitución 1 a 1 de Alimentos | ✅ Done | `web/src/components/nutrition/SmartSwapModal.tsx` | Cálculo isocalórico, macros en tiempo real y banner AHA con medidas caseras traducidas |
| S-NUT-07 | Motor de Medidas Caseras & Validación de Unidades | ✅ Done | `web/src/utils/householdMeasures.ts` | Eliminación de choques de similitud (`2 u` sin contradicciones), soporte de `g/ml/u` y referencias pedagógicas cotidianas (rebanadas, bifes, tazas) |
| S-NUT-08 | Validación de Plato con Foto para el Coach | ✅ Done | `web/src/components/nutrition/MealPhotoValidationModal.tsx` | Guía pedagógica visual (90° cenital, luz, encuadre, escala), captura con cámara/galería, notas y envío en tiempo real a `useCoachCommunicationStore` |
| S-COACH-01| Candado Pro & Redirección a Coaches Certificados | ✅ Done | `web/src/components/athlete/` | Bloqueo con candado para funciones asistidas (Ajuste de Cargas, Video Técnica) para usuarios sin plan pro |
| S-HABIT-01| Programación Semanal de Hábitos & Creador Rápido | ✅ Done | `useHabitStore.ts`, `CreateHabitModal.tsx`, `DailyHabitCheckin.tsx` | Selector de días `[L..D]`, atajos (`L-X-V`, `M-J-S`), micro-píldoras pedagógicas y cálculo dinámico de adherencia |
| S-PROG-01 | Unificación UX de Galería de Progreso & Fotos | ✅ Done | `web/src/components/athlete/` | Eliminación de duplicidad de términos, menú desplegable y pedagogía visual simple |

### Sprint de Sincronización de Contratos Coach & Atleta y Suite de Integración E2E (24 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-WIRE-01 | Mismatch de Triaje de Validaciones & Alias `/decide` | ✅ Done | `backend/app/api/validations.py` | Formato `{cursor, validations[]}` y alias `POST /{id}/decide` para `useValidations.ts` |
| S-WIRE-02 | Rewire Real del Nutritionist Dashboard | ✅ Done | `web/src/api/nutritionist.ts`, `nutritionist_routes.py` | Conexión real a `GET /api/v1/nutritionists/dashboard` y corrección de columnas SQL en PostgreSQL |
| S-WIRE-03 | Endpoints de Video Review & Morosidad en Trainer | ✅ Done | `web/src/api/trainer.ts`, `trainer_routes.py` | Corregidos prefijos `/api/v1` y agregados endpoints `approve`, `reject` y `resolve-delinquency` |
| S-WIRE-04 | Normalización de Prefijos en Action Cards | ✅ Done | `web/src/hooks/useActionCards.ts` | Ruteado a `/api/v1/action_cards` |
| S-WIRE-05 | Desempaquetado de Atletas & Guardado Real de Protocolos | ✅ Done | `useAthletes.ts`, `usePlanBuilderMutations.ts` | Corrección de respuesta deserializada y reactivación de `POST /api/v1/protocols` |
| S-TEST-02 | Suite de 26 Tests de Integración E2E | ✅ Done | `tests/api/test_coach_workflows.py`, `test_athlete_workflows.py` | 26/26 tests PASSED (100% de éxito) con `NullPool` y aislamiento multi-tenant |

### Sprint de Cableado Integral de Producción Backend (Fases A, B, C, D) (23 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-BE-01 | Descomentar y Montar Routers en `main.py` | ✅ Done | `backend/app/main.py` | 137 endpoints REST activos: workouts, fitness, routines, templates, exercises, nutritionists, sync, validations |
| S-BE-02 | CRUD de Workouts & Asignación Transaccional | ✅ Done | `backend/app/api/workouts.py` | Create, list, get by ID, update, soft delete, assign to athlete, duplicate (Smart Fork) |
| S-BE-03 | Rutina Hoy del Atleta & Sets con Idempotencia | ✅ Done | `backend/app/api/athlete.py` | `GET /routine/today` con rotación de mesociclos y `POST /sets` con UUIDv4 idempotency key |
| S-BE-04 | Catálogo de Ejercicios & Búsqueda Biomecánica | ✅ Done | `backend/app/api/exercises_routes.py` | Búsqueda por patrón, músculo, impacto y autocomplete para PanoramicBuilder |
| S-BE-05 | Bóveda de Plantillas Maestras & Forking | ✅ Done | `backend/app/api/templates_routes.py` | CRUD de Master Templates (`is_master=True`) y fork adaptativo a atletas |
| S-BE-06 | Dashboard Real del Nutricionista | ✅ Done | `backend/app/api/nutritionist_routes.py` | Métricas reales de pacientes, conteo de planes y seguimiento de check-ins |
| S-BE-07 | Cola de Validación de Videos de Técnica | ✅ Done | `backend/app/api/validations.py` | Integrado con `video_reviews` en PostgreSQL y guardado de feedback del coach |
| S-BE-08 | Chat & Inbox Migrados a PostgreSQL | ✅ Done | `backend/app/api/chat.py`, `inbox.py` | Tablas `conversations` y `messages` con soporte multi-tenant y alias compatibles |
| S-BE-09 | Reconciliación Offline para IndexedDB | ✅ Done | `backend/app/api/sync.py` | `POST /sync/push` idempotente y `GET /sync/pull` incremental |

### Sprint de Smoke Tests E2E con Atleta Canónico (Bloque 4) (21 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-TEST-01 | Suite de Smoke Tests E2E (10/10) con Leandro Usea | ✅ Done | `web/scripts/e2e_smoke_tests.ts` | 100% Pass Rate: Auth JWT, FIE 1-Clic, NaaS 1-8 ingestas, Smart Swap, Injury Firewall, Magic Links, Sesión Activa, Gamificación y Telemetría |

### Sprint de Experiencia de Sesión Activa, Videos Oficiales Catilli & Gamificación Premium (21 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-SES-01 | Mapeo Canónico Catilli `@Catilli-20` (676 Videos) | ✅ Done | `src/utils/exerciseVideoMap.ts`, `data/catilli_all_videos.json` | Resolución automática con normalización fonética y prioridad canónica |
| S-SES-02 | Corrección Canónica Press de Banca con Barra (`fcrDKKNBba8`) | ✅ Done | `src/data/exercisesData.ts`, `exerciseVideoMap.ts` | Eliminación de badges redundantes y vinculación estricta al video de barra |
| S-SES-03 | Modo Enfoque 1 a 1 (1 Ejercicio a la vez - Cero Scroll) | ✅ Done | `src/components/athlete/ActiveWorkoutSession.tsx` | Stepper superior con tildes `✓` y barra ergonómica de navegación fija |
| S-SES-04 | Video Directo en Pantalla & Expansión `Expandir ⛶` | ✅ Done | `src/components/athlete/ActiveWorkoutSession.tsx` | Embed nativo en la tarjeta activa y reproductor full screen con cues biomecánicos |
| S-SES-05 | Reemplazo Biomecánico Inteligente (Tríos Rotativos de 3 Vías) | ✅ Done | `src/components/athlete/ActiveWorkoutSession.tsx` | Efecto ¡AJÁ!: 2 opciones curadas en 1 toque con rotación continua entre las 3 variantes |
| S-SES-06 | Relevamiento Pedagógico de Serie & Fin de Sesión Simple | ✅ Done | `src/components/athlete/ActiveWorkoutSession.tsx` | `SetEffortPainModal` y `SessionDailyAssessmentModal` con emojis y 0 sliders complejos |
| S-SES-07 | Resumen Gaming Premium con Puntos por Músculo | ✅ Done | `src/components/athlete/ActiveWorkoutSession.tsx` | `GamingCelebrationOverlay`: Trofeo 3D, XP (+140), Racha, Nivel, desglose muscular y Medalla de Constancia 🏅 |

### Sprint de Entrenamiento FIE, Plantillas Maestras & Injury Firewall V2 Pro (19 — 21 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-FIE-01 | Catálogo RAMP & 12 Categorías | ✅ Done | `src/data/exercisesData.ts`, `SmartExerciseLibrary.tsx` | 22 nuevos ejercicios con Cues de Foco Externo, regresiones y progresiones |
| S-FIE-02 | 7 Bloques FIE & Circuitos Inteligentes | ✅ Done | `src/data/templates.constants.ts` | Biseries A1/A2, Complejo PAPE, Core 360°, Tabata 4m, EMOM 10m, AMRAP 12m, Wenning |
| S-FIE-03 | Bóveda de 5 Plantillas Maestras | ✅ Done | `src/stores/useTemplateLibraryStore.ts`, `SmartVaultPanel.tsx` | Torso/Pierna 4d, Full Body 3d GZCLP, PPL/UL 5d, Glúteos LVT 3-4d, Calistenia 3d |
| S-FIE-04 | Motor de Borrador Inteligente 1-Clic | ✅ Done | `src/utils/routineGeneratorEngine.ts`, `DroppableDayColumn.tsx` | Hitos RP (MEV/MAV/MRV), Time-Budgeting 60m, Carga Axial $\le 15$ y Auto-Poblar |
| S-FIE-05 | Injury Firewall V2 Pro & Triage de Banderas Rojas | ✅ Done | `src/utils/clinicalFirewall.ts` | 5 Red Flags con bloqueo total, Smart Swaps por patología (NIOSH <3400N) y HSR/TNT |

### Sprint de Autenticación en Producción & Magic Links (18 — 19 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-AUTH-01 | Conexión JWT Backend + Refresh Token persistente | ✅ Done | `AuthContext.tsx` | Redención de tokens con expiración y cookies seguras |
| S-AUTH-02 | Flujo Magic Link para Atletas (Invitación → Redención) | ✅ Done | `MagicLinkRedeem.tsx` | Activación sin contraseña |
| S-AUTH-03 | Limpieza de logs de desarrollo y console warnings | ✅ Done | `CommandCenter.tsx` | Consola limpia en producción |

### Sprint de Nutrición SARA 2, UX & Presets Dinámicos (17 — 18 Ago 2026)

| ID | Tarea | Estado | Archivo / Módulo | Notas |
|----|-------|:------:|------------------|-------|
| S-BIO-01 | Motor de Suplementación Inteligente | ✅ Done | `src/data/supplementationEngine.ts` | Dosis P1 de Creatina, Beta-Alanina, Cafeína, Citrulina, HMB |
| S-BIO-02 | UI Asistente de Suplementación | ✅ Done | `src/components/builders/DietBuilder/NaaSBuilderCanvas.tsx` | Tarjetas pedagógicas en Plan Builder |
| S-BIO-03 | Refactor Psicología Positiva en Correlación | ✅ Done | `src/data/correlationEngine.ts` | Estados `Óptimo`, `Precaución`, `Alto`, `Baja` (sin alarmismo) |
| S-BIO-04 | Widget Termómetro de Recuperación | ✅ Done | `src/components/athlete/RecoveryThermometer.tsx` | EWMA ACWR + HRV Z-Score + Simulador 30 días para demos |
| S-BIO-05 | Inyección en Perfil del Atleta | ✅ Done | `src/components/ClientHub.tsx` | Ubicado en pestaña de Perfil con diseño glassmorphism |
| S-BIO-06 | Estandarización de Pestañas Coach | ✅ Done | `src/components/drilldown/AthleteDetailView.tsx` | **RESUMEN → ENTRENAMIENTO → NUTRICIÓN → HÁBITOS → AGENDA** |
| S-BIO-07 | Estandarización de Pestañas Atleta | ✅ Done | `src/components/ClientHub.tsx` | **Resumen → Entrenamiento → Nutrición → Hábitos → Agenda** |
| S-BIO-08 | Consolidación Comercial en Finanzas | ✅ Done | `src/components/dashboard/FinanceDashboardView.tsx` | Alertas de Churn y botón "Contactar (Salvataje)" |
| S-REC-01 | Tipado estricto `Recipe` y CRUD en store | ✅ Done | `src/stores/useNutritionStore.ts` | `addRecipe`, `updateRecipe`, `deleteRecipe`, `duplicateRecipe` |
| S-REC-02 | Wizard 3 Pasos `RecipeCreatorModal.tsx` | ✅ Done | `src/components/builders/DietBuilder/RecipeCreatorModal.tsx` | Identidad → SARA 2 → Macros por porción → Guardar |
| S-REC-03 | Pestaña Recetas + DnD en Biblioteca | ✅ Done | `src/components/builders/DietBuilder/SmartLibraryPanel.tsx` | Pestaña con badge ChefHat + Drag & Drop al canvas |
| S-REC-04 | 12 Recetas Maestras Argentinas Seed | ✅ Done | `src/data/recipeSeedData.ts` | Milanesas, Salmón, Batidos, Tostadas con Palta |
| S-REC-05 | NaaS Studio a Pantalla Completa | ✅ Done | `src/components/builders/DietBuilder/NaaSWorkspace.tsx` | Desacoplado del sidebar general + botón directo a Wizard |
| S-NUT-01 | Plan Diario Reactivo y Check-in de Comidas | ✅ Done | `src/components/athlete/AthleteNutritionDashboard.tsx` | 4 comidas diarias reales + Adherencia en tiempo real |
| S-NUT-02 | Gamificación de Comidas (+20 XP) | ✅ Done | `src/stores/useNutritionStore.ts` | Despacho de `xp:award` al bus global de gamificación |
| S-NUT-03 | Widget de Nutrición en Vivo en Mobile | ✅ Done | `src/components/athlete/NutritionWidget.tsx` | Cálculo reactivo de macros y calorías consumidas |
| S-UX-01  | Filtros Simétricos y Cero Scrollbars | ✅ Done | `src/components/builders/DietBuilder/SmartLibraryPanel.tsx` | Cuadrícula 4x2 sin rieles nativos de Windows |
| S-UX-02  | Ciclos Nutricionales Slim Colapsables | ✅ Done | `src/components/builders/DietBuilder/NaaSWorkspace.tsx` | Reducción de grosor a ~75px con toggle expandir |
| S-UX-03  | Presets Dinámicos de 1 a 8 Ingestas | ✅ Done | `src/components/builders/DietBuilder/NaaSBuilderCanvas.tsx` | Adaptación de horarios y distribución a 7 días |
| S-UX-04  | Auto-Calibración Paramétrica al 100% | ✅ Done | `src/components/builders/DietBuilder/NaaSBuilderCanvas.tsx` | Escalado proporcional exacto de calorías del día |
| S-UX-05  | Gramos Visibles y Alternativas IA | ✅ Done | `src/components/builders/DietBuilder/NaaSBuilderCanvas.tsx` | Inputs delimitados y tooltip pedagógico de variedad |
| S-SWAP-01| Motor Smart Swap con 4 Macros & Dominancia | ✅ Done | `src/utils/smartSwapEngine.ts` | Detección CARBS/PROT/FAT + equivalencia + medidas caseras |
| S-USDA-01| Ingesta & Traducción USDA Foundation (834 alimentos) | ✅ Done | `data/SARA_Master_Database.json` | +363 alimentos traducidos con análisis de laboratorio |

---

## ⚡ Próximo Sprint — Post-MVP: Motor de Hidratación & Carbos Peri-Entreno

**Período**: Septiembre 2026  
**Objetivo**: Implementación de `macroFluidEngine.ts` para cálculo y timing de carbohidratos intra-entreno, reposición de electrolitos (sodio/potasio) y alertas de hidratación.

### Tareas del Sprint

| ID | Tarea | Estimación | Prioridad | Módulo | Estado |
|----|-------|:----------:|:---------:|:------:|:------:|
| S-MFE-01 | Motor de Hidratación y Carbos Peri-Entreno | 3 pts | P1 | `src/utils/macroFluidEngine.ts` | ⏳ En Cola |
| S-MFE-02 | UI Tarjeta Dinámica Intra-Entreno en Mobile | 2 pts | P1 | `src/components/athlete/` | ⏳ En Cola |

---

## Definición de Done (DoD)

- [x] Código compila sin errores TypeScript (`npm run build` o `npx tsc --noEmit`)
- [x] Cero violaciones a tokens de diseño / cero pixels hardcodeados
- [x] Funcionalidad probada y responsive
- [x] Estado persistido en stores de Zustand
- [x] Sin console.log de desarrollo residuales
- [x] Suite de Smoke Tests E2E (10/10) ejecutada con 100% Pass Rate
- [x] Documentación oficial en `/docs/` sincronizada en cada hito

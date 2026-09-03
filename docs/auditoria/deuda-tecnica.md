# 🔧 Deuda Técnica — Bienestar APP

> Registro de deuda técnica acumulada, items resueltos y plan de pago.  
> Última actualización: 3 de Septiembre 2026

---

## 🏆 Deuda Técnica Resuelta Recientemente (Septiembre 2026)

| ID | Título | Resolución | Impacto |
|----|--------|------------|---------|
| **DT-SPLIT-TERM** | Jerga Anglosajona Confusa "Split" en Prescripción | Eliminada la palabra "Split" y reemplazada por "Distribución Semanal" con pedagogía visual de 48hs de recuperación y botones diferenciados (`Clásica (3d)`, `Full Body (3d)`, `Torso / Pierna (4d)`, `Híbrido (5d)`, `PPL x 2 (6d)`). | ✅ Resuelto |
| **DT-SPLIT-ONBOARD**| Desconexión Onboarding de Días vs Distribución Semanal | Sincronización reactiva con `training.days_per_week` de `useOnboardingPTStore`, preselección automática y badge `🎯 Onboarding`. | ✅ Resuelto |
| **DT-OVERTRAIN-ALERT**| Alerta Intrusiva y Molesta de Riesgo de Sobreentrenamiento | Eliminado banner alarmista de sobreentrenamiento/MRV en el builder, transformándolo en analítica limpia y constructiva. | ✅ Resuelto |
| **DT-WEIDER-3D** | Ausencia de Generador Canónico Weider Clásico (Pecho/Espalda/Pierna) | Implementado `generate3DayClassicWeider` en `routineGeneratorEngine.ts` con RAMP, compuestos T1, hipertrofia T2, accesorios SMH T3, core 360° y vuelta a la calma. | ✅ Resuelto |
| **DT-CLINICAL-FIREWALL-AXIAL**| Bypass de Lesiones Lumbar/Hombro/Rodilla en Generador | Integrado filtrado clínico estricto y sustituciones biomecánicas automáticas (Prensa 45°, Belt Squat, Scaption 30°) en `routineGeneratorEngine.ts`. | ✅ Resuelto |
| **DT-UX-BUILDER-ACTIONS**| Botones Críticos Ocultos al Fondo en Panoramic Builder | Reubicados `[ 📅 Diseñar Ciclo a Medida ]` y `[ 🎓 Ver Guía de Periodización ]` en la cabecera superior con acordeón interactivo sin scroll. | ✅ Resuelto |
| **DT-CYCLES-01** | Periodización & Ciclos Lentos / Pantallas en Blanco | Implementados Presets de Ciclos en 1 Clic para Nutrición (`NaaSWorkspace.tsx`) y Rutinas (`PanoramicBuilder.tsx`) con auto-ensamblaje y chips rápidos de periodos. | ✅ Resuelto |
| **DT-CLEANUP-01** | Terminología Confusa e Interna ("SARA 2", "FIE", "Catilli") | Erradicada jerga interna y sustituida por vocabulario pedagógico (*Nutrición Inteligente*, *Periodización por Ciclos*, *Videos Técnicos en HD*) en toda la aplicación. | ✅ Resuelto |
| **DT-AUTH-03** | Flujo de Acceso Ambiguo & Sin Google OAuth Dinámico | Creado selector explícito de Iniciar Sesión / Crear Cuenta con burbujas de Email/Password y Google OAuth Token Client en `LoginPage.tsx`. | ✅ Resuelto |
| **DT-COACH-WIZ-02** | Wizard de Coach con Poca Claridad de Módulos | Reestructurado en Bento Grid pedagógico de 6 pilares (Rutinas, Nutrición, Clases, Agenda, Chat 2-en-1, Finanzas) en `CoachWelcomeWizardModal.tsx`. | ✅ Resuelto |
| **DT-PROD-01** | Crash Fatal en Canje de Magic Links | Reemplazado `.reset()` inexistente por `.resetOnboarding()` en `MagicLinkRedeem.tsx`. | ✅ Resuelto |
| **DT-PROD-02** | Bypass de Seguridad en RouteGuard | Eliminado mock de acceso ADMIN sin login; redirect forzado a `/login` y purga de tokens. | ✅ Resuelto |
| **DT-PROD-03** | Crash de `require()` en Vite | Sustituido `require()` por constante estática en `ZeroClientWizard.tsx`. | ✅ Resuelto |
| **DT-PROD-04** | Token Key Mismatch (`athlete_jwt`) | Corregida lectura a `'token'` en `athleteApi.ts`. | ✅ Resuelto |
| **DT-PROD-05** | Role Enum Inválido en Action Cards | Ajustado a `Role.ADMIN` y `Role.PERSONAL_TRAINER` en `action_cards.py`. | ✅ Resuelto |
| **DT-PROD-06** | Acceso a `TokenData.sub` en Mesociclos | Acceso a `current_user.user_id` y `Professional.user_id` en `mesocycles.py`. | ✅ Resuelto |
| **DT-PROD-07** | Route Shadowing en Catálogo de Ejercicios | Movido `GET /search` antes de `GET /{id}` en `exercises_routes.py`. | ✅ Resuelto |
| **DT-PROD-08** | Magic Links Reutilizables | Implementado single-use burn atómico con Redis SETNX en `auth_b2c.py`. | ✅ Resuelto |
| **DT-PROD-09** | Endpoints de Registro Público Inexistentes | Creados `POST /api/v1/auth/register` y `POST /api/v1/auth/register-b2c` con creación atómica de Tenant. | ✅ Resuelto |
| **DT-PROD-10** | Schema Drift (16 Tablas Faltantes en SQL) | Sincronizado `schema.sql` maestro con todas las tablas de SQLAlchemy ORM y RLS multi-tenant. | ✅ Resuelto |
| **DT-FIE-01** | Categorías Vacías en Catálogo de Ejercicios | Integrados 22 ejercicios clínicos y de calentamiento RAMP con cues externos, conectando las 12 categorías en `SmartExerciseLibrary.tsx`. | ✅ Resuelto |
| **DT-FIE-02** | Ausencia de Bloques y Circuitos FIE | Añadidos 7 bloques preconfigurados (Biseries A1/A2, Complejo PAPE, Core 360°, Tabata, EMOM, AMRAP, Wenning) en `templates.constants.ts`. | ✅ Resuelto |
| **DT-FIE-03** | Plantillas Incompletas en Bóveda | Desplegadas 5 Plantillas Maestras (Torso/Pierna 4d, Full Body 3d GZCLP, PPL/UL 5d, Glúteos LVT 3-4d, Calistenia 3d) en `useTemplateLibraryStore.ts`. | ✅ Resuelto |
| **DT-FIE-04** | Falta de Generador 1-Clic de Rutinas | Implementado `routineGeneratorEngine.ts` con hitos RP (MEV/MAV/MRV), Time-Budgeting 60m, Carga Axial $\le 15$ y botones de Auto-Poblar. | ✅ Resuelto |
| **DT-FIE-05** | Injury Firewall con IDs Hardcodeados | Actualizado `clinicalFirewall.ts` a V2 Pro con Triage de 5 Red Flags, Smart Swaps por patología (NIOSH <3400N) y progresión HSR/TNT. | ✅ Resuelto |
| **DT-CORR** | Silo entre Training y Nutrition | Implementado `correlationEngine.ts` con ACWR EWMA + HRV Z-Score y terminología constructiva. | ✅ Resuelto |
| **DT-WT** | Rutas y Vistas Obsoletas Watchtower | Eliminadas rutas huérfanas `/watchtower` y `/watchtower-triage`. Alertas comerciales integradas en `FinanceDashboardView.tsx`. | ✅ Resuelto |
| **DT-NAV** | Desalineación de Pestañas en Perfiles | Estandarizado orden canónico 5 tabs: Resumen, Entrenamiento, Nutrición, Hábitos, Agenda en Coach y Atleta. | ✅ Resuelto |
| **DT-REC** | Workflow de Recetas SARA 2 | `RecipeCreatorModal.tsx` 3 pasos + CRUD en `useNutritionStore` + 12 recetas seed + NaaS Studio Fullscreen. | ✅ Resuelto |
| **DT-NUT** | Mocks en Nutrición Móvil Atleta | Conectado `dailyMealPlan` en `AthleteNutritionDashboard`, `NutritionWidget` reactivo en vivo y +20 XP por comida. | ✅ Resuelto |
| **DT-UX-01**| Scrollbars Nativos en Biblioteca SARA | Erradicados rieles toscos de Windows. Cuadrícula 4x2 simétrica para categorías y 4 columnas para ordenamiento. | ✅ Resuelto |
| **DT-UX-02**| Comidas Duplicadas en Presets | Unificación en 4 comidas maestras (`Desayuno`, `Almuerzo`, `Merienda`, `Cena`) con opciones A, B, C y D. Eliminada jerga (`Perfil Bulk`). | ✅ Resuelto |
| **DT-UX-03**| Desfase de Calorías en Carga de Ingestas | Implementado soporte dinámico de 1 a 8 ingestas con auto-calibración paramétrica al 100% de la meta diaria. | ✅ Resuelto |
| **DT-UX-04**| Gramos Invisibles en Filas de Alimentos | Corregido mapeo `portion_amount` y diseño de inputs con bordes delimitados y editables. | ✅ Resuelto |
| **DT-SWAP** | Smart Swap Hardcodeado e Incompleto | Implementado `smartSwapEngine.ts` con dominancias CARBS/PROT/FAT, 4 macros y medidas caseras. | ✅ Resuelto |
| **DT-USDA** | Base Nutricional USDA no Integrada | Traducidos y fusionados 363 alimentos de USDA Foundation en `SARA_Master_Database.json` (834 total). | ✅ Resuelto |
| **DT-AUTH-01** | Autenticación JWT en Producción | Conectado `auth_b2c.py` con tokens de 30m, refresh tokens HttpOnly de 30d y `AuthContext.tsx`. | ✅ Resuelto |
| **DT-AUTH-02** | Flujo Magic Link para Atletas | Habilitada redención y activación sin contraseña en `MagicLinkRedeem.tsx` e integración con `login()`. | ✅ Resuelto |
| **DT-BE-01**   | Routers Comentados en `main.py` | Descomentados y montados routers de Workouts, Fitness, Routines, Templates, Exercises, Nutritionists, Sync y Validations. | ✅ Resuelto |
| **DT-BE-02**   | Stubs Vacíos en Backend (53 bytes) | Implementados endpoints reales en `workouts.py`, `athlete.py`, `exercises_routes.py`, `templates_routes.py`, `routines.py`, `nutritionist_routes.py`, `validations.py` y `sync.py`. | ✅ Resuelto |
| **DT-BE-03**   | Chat e Inbox con Almacenamiento en Memoria | Migrado a PostgreSQL real (`conversations`, `messages`, `video_reviews`) con soporte multi-tenant y backwards compatibility. | ✅ Resuelto |
| **DT-BE-04**   | Reconciliación Offline Desconectada | Implementado `sync.py` (`POST /push` y `GET /pull`) para procesar cola de mutaciones de IndexedDB con UUIDv4 idempotency keys. | ✅ Resuelto |
| **DT-WIRE-01** | Mismatch en Triaje de Validaciones | Adaptado `validations.py` a estructura `{cursor, validations[]}` y agregado alias `POST /{id}/decide`. | ✅ Resuelto |
| **DT-WIRE-02** | Mock en Nutritionist Dashboard | Cableado `nutritionist.ts` a `GET /api/v1/nutritionists/dashboard` y corregidas columnas de modelos en PostgreSQL. | ✅ Resuelto |
| **DT-WIRE-03** | Mismatch de Prefijos en API y ActionCards | Corregidos prefijos `/api/v1` en `trainer.ts` y `/api/v1/action_cards` en `useActionCards.ts`. Agregados 3 endpoints en `trainer_routes.py`. | ✅ Resuelto |
| **DT-WIRE-04** | Bug de Unpacking de Datos en `useAthletes.ts` | Eliminado `.data` redundante y ruteado a endpoints reales de detalle y asignación. | ✅ Resuelto |
| **DT-WIRE-05** | Mock en Guardado de Protocolos Clínicos | Descomentado y activado `POST /api/v1/protocols` en `usePlanBuilderMutations.ts` con fallback offline. | ✅ Resuelto |
| **DT-TEST-02** | Suite de Tests E2E Coach & Atleta (26/26) | Implementados 26 tests de integración en `test_coach_workflows.py` y `test_athlete_workflows.py` con `NullPool` y 100% de éxito. | ✅ Resuelto |
| **DT-BE-SEC-01**| Backdoor Auth en `auth.py` | Eliminado token demo `demo_b2b_token_123` que otorgaba ADMIN sin autenticación. | ✅ Resuelto |
| **DT-BE-CORS**  | CORS Hardcodeado a Localhost en `main.py` | Migrado a `settings.cors_origins_list` configurable por entorno (.env). | ✅ Resuelto |
| **DT-BE-DOCKER**| Dockerfile Roto y Encoding UTF-16LE | Eliminado `pip build`, requirements convertido a UTF-8, creado `.dockerignore` y `$PORT` dinámico. | ✅ Resuelto |
| **DT-BE-NUTRI** | Falta de Capa Repository y Shopping Backend | Creado `NutritionRepository`, `ShoppingListService` con packaging argentino, endpoints de meal-logs, adherencia y router de Vision activado. | ✅ Resuelto |
| **DT-BE-CELERY**| Workers de Celery Vacíos | Implementadas tareas `recalculate_cri_task`, `generate_dietary_plan_task`, `generate_nutrition_pdf_task` y registradas en `celery_app.include`. | ✅ Resuelto |
| **DT-BE-MIG**   | Falta de Migración Alembic para `recipes` | Creada migración `e4f5a6b7c8d9_add_recipes_table.py` con políticas RLS multi-tenant (head `e4f5a6b7c8d9`). | ✅ Resuelto |
| **DT-BE-TESTS** | 0 Tests de Nutrición en Backend | Creada suite `test_nutrition_module.py` (TMB Mifflin-St Jeor, Day A/B, Shopping List, Alertas Anemia, Vision) con 100% éxito. | ✅ Resuelto |
| **DT-FIN-SEED** | Estado Inicial Vacío en Store de Finanzas | Inicializados 12 meses de facturación histórica ($320k-$1.05M) y 10 clientes con auto-migración y fallback de hidratación en `useFinanceStore.ts` (v3). | ✅ Resuelto |
| **DT-FIN-UX**   | Sugerencias Ocultas & Falta de Flujo de Cobro | Implementado banner dinámico superior de sugerencias/alertas en `FinanceDashboardView.tsx`, KPIs en lenguaje amigable y modal de cobro por WhatsApp en 1 toque. | ✅ Resuelto |
| **DT-GAM-ACC**  | Scroll Excesivo en Clases & Dispersión de Retos | Implementado acordeón colapsable cerrado por defecto en `GamificationBuilder.tsx`, grilla simétrica 12-col y píldoras violetas explicadas pedagógicamente. | ✅ Resuelto |
| **DT-CMD-ALERT**| Tarjeta Estática de Fatiga en CommandCenter | Sustituida por banner condicional de alerta médica en `CommandCenter.tsx` con badge "✓ Todo bajo control" en días normales. | ✅ Resuelto |
| **DT-ICON-01**  | Import Faltante de `ChevronDown` en Gamificación | Añadido import desde `lucide-react` en `GamificationBuilder.tsx` eliminando runtime error. | ✅ Resuelto |
| **DT-TRAIN-SYNC**| Template Library Solo en LocalStorage | Creado hook `useTemplateSync.ts` conectado a `/api/v1/templates`, merge en `useTemplateLibraryStore.ts` y badge `☁️ Nube activa`. | ✅ Resuelto |
| **DT-TRAIN-ADH** | Adherencia Hardcodeada al 85% en Tracking | Reemplazado por cálculo reactivo `useMemo` sobre `useExecutionStore.sessionHistory` (ventana 28 días vs sesiones esperadas). | ✅ Resuelto |
| **DT-CHAT-TYPO** | Contraste de Texto Invisible en Chat / Inbox | Corregido `text-white` en modo claro en `IntelligentInbox.tsx` a `text-slate-900 dark:text-zinc-100` con timestamps legibles. | ✅ Resuelto |
| **DT-BE-STUBS**  | Stubs Huérfanos en `main.py` | Eliminadas importaciones y registros muertos de `readiness_routes` y `swap_routes` en `main.py`. | ✅ Resuelto |
| **DT-BE-TESTS-40**| Suite Completa de Backend (40 Tests) | 40/40 tests de backend aprobados al 100% con `pytest` (Workouts, Athlete, Coach, Biomechanics, EWMA ACWR, Domain Math). | ✅ Resuelto |
| **DT-FIN-TMPL** | Plantilla de WhatsApp No Configurable | Implementada plantilla editable con variables `{nombre}`, `{monto}`, `{vencimiento}`, `{link_pago}` y persistencia en `useFinanceStore`. | ✅ Resuelto |
| **DT-FIN-SCROLL** | Navegación Desconectada en "Ver Pendientes" | Agregado scroll fluido automático y filtro reactivo `PENDING_OVERDUE` al pulsar el botón de notificación en Finanzas. | ✅ Resuelto |
| **DT-DEV-ROUTES** | Rutas DEV Obsoletas y Duplicadas | Eliminadas `/client`, `/debug-chat` y `/gatekeeper` del menú lateral en `Sidebar.tsx` con redirección canónica en `App.tsx`. | ✅ Resuelto |
| **DT-COMM-GATE** | Falta de Centralización de Canales y Automatizaciones | Hub de comunicación integrado como 3ra pestaña en *Mensajes & Validaciones* (`CommunicationConfigTab.tsx`) con Guardián de Descanso y bypass de urgencias. | ✅ Resuelto |
| **DT-SUN-BRIEF** | Resumen Semanal de Domingos Ausente | Automatización dominical (19:00 hs) con balance de carga/adherencia y enfoque estratégico del coach con vista previa interactiva. | ✅ Resuelto |
| **DT-AUTH-GOOG** | Acceso Lento Manual en Pantalla de Inicio | Implementado botón "Continuar con Google" con isotipo oficial 'G' de 4 colores y login instantáneo en 1 toque. | ✅ Resuelto |
| **DT-LOGIN-SCROLL** | Scrollbar Innecesario en Login Page | Ajuste de altura a `h-screen max-h-screen overflow-hidden` y dimensionamiento ergonómico sin scroll vertical. | ✅ Resuelto |
| **DT-LOGO-TRANSP** | Disco Blanco Rígido en Isotipo de Ecosistema | Generado PNG 100% transparente con los 6 pilares de Habits y micro-interacción 3D Parallax con físicas de resorte `framer-motion`. | ✅ Resuelto |
| **DT-I18N-FLAGS** | Emojis de Bandera Degradados a Texto en Windows | Reemplazados por componentes vectoriales SVG nativos (`FlagSpain`, `FlagUK`) en la cápsula de idioma. | ✅ Resuelto |
| **DT-005**     | Logs residuales en CommandCenter | Eliminados todos los `console.log` de depuración y telemetría no condicionales. | ✅ Resuelto |
| **DT-GOV**     | Violaciones de Pixels Hardcodeados | 100% de cumplimiento en Gobernanza de Diseño. Cero tokens no estandarizados. | ✅ Resuelto |
| **DT-BILL-HOOK**| Webhook de Pagos Desconectado de `main.py` | `billing_routes.py` conectado en `/api/v1/billing` con Redis SETNX y background tasks de activación. | ✅ Resuelto |
| **DT-WIZ-COACH**| Falta de Onboarding Visual para Entrenador | Implementado `CoachWelcomeWizardModal.tsx` con link de WhatsApp y configuración en 4 pasos. | ✅ Resuelto |
| **DT-WIZ-ATH**  | Onboarding Largo para Atleta Autónomo | Reducido `AthleteWelcomeWizardModal.tsx` a 3 pasos (<30 seg) con entrada directa a hábitos y +50 XP. | ✅ Resuelto |
| **DT-JIT-LOCKS**| Acceso No Configurado a Rutina y Nutrición | Implementados candados pedagógicos con wizards dedicados en `AthleteWorkoutView.tsx` y `AthleteNutritionDashboard.tsx`. | ✅ Resuelto |
| **DT-SUN-MODAL**| Ausencia de Resumen Visual de Ciclos para Atleta | Implementado `SundayWeeklyBriefingModal.tsx` con balance semanal, barra de progreso de ciclo y metas de la nueva semana. | ✅ Resuelto |

---

## Categorías de Deuda Activa

| Categoría | Emoji | Descripción |
|-----------|-------|-------------|
| **Testing** | 🧪 | Smoke tests 10/10 manuales/automatizados para Leandro Usea (S-TEST-01) |
| **Arquitectural** | 🏗️ | Motores periféricos de hidratación (`macroFluidEngine.ts` - Post-MVP) |
| **Refactor** | ✂️ | Descomposición progresiva de componentes extensos |

---

## Registro de Deuda Activa

### 🧪 Testing & Calidad (Hito Inmediato)

| ID | Título | Severidad | Descripción | Plan de Pago |
|----|--------|-----------|-------------|--------------|
| DT-TEST-01 | Smoke Tests E2E Atleta Canónico (10/10) | Alta | Checklist de 10 flujos críticos con Leandro Usea de extremo a extremo. | S-TEST-01 (Inmediato) |
| DT-011 | Tests unitarios para motores clínicos | Media | `correlationEngine.ts`, `supplementationEngine.ts`, `smartSwapEngine.ts`. | Hardening |

### 🏗️ Arquitectura & Escalabilidad (Post-MVP)

| ID | Título | Severidad | Descripción | Plan de Pago |
|----|--------|-----------|-------------|--------------|
| DT-006 | Componentes monolíticos (>800 líneas) | Media | `PlanBuilderCockpit.tsx` y `NaaSBuilderCanvas.tsx` son extensos. | Extraer sub-componentes progresivamente |
| DT-MFE | Motor de Hidratación & Carbos Peri-entreno | Baja | `macroFluidEngine.ts` para reposición de fluidos y sodio intra-sesión. | Post-MVP |



### Actualización de Deuda Técnica - Cierre de Fases 187 a 191 (Septiembre 2026):
- **Marco Científico de Hipertrofia & Biomecánica (Fase 187):** RESUELTO. Integrado corpus de ~50 papers científicos (SMH, control de fatiga axial $\le 15$ pts, landmarks MEV/MAV/MRV y presets DUP, GBR, PPL, PHAT).
- **Riesgo de Sobreentrenamiento Alarmista (Fase 188):** RESUELTO. Eliminado el banner molesto e intrusivo de MRV en favor de una lectura pedagógica no bloqueante.
- **Cortafuegos Clínico Axial & Articular en Generador (Fase 189):** RESUELTO. Detección automática y sustitución estricta para patologías lumbar, hombro y rodilla en `routineGeneratorEngine.ts`.
- **Motor Canónico Weider Clásico de 3 Días (Fase 190):** RESUELTO. Algoritmo determinista de 3 días con RAMP, compuestos T1, aislamiento/SMH T2/T3, core y estiramientos (`generate3DayClassicWeider`).
- **UX de "Distribución Semanal" & Sincronización con Onboarding (Fase 191):** RESUELTO. Eliminada palabra "Split", etiquetas claras por botón (`Clásica`, `Full Body`, `Torso/Pierna`, `Híbrido`, `PPL x 2`), preselección reactiva con días de onboarding del cliente (`days_per_week`), y reubicación ergonómica de botones de acción arriba en el builder.
- **Salud de Tipos y Compilación:** 0 errores de TypeScript (`npx tsc --noEmit` exit code 0).


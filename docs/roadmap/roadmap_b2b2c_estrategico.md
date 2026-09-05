# Norte Estratégico B2B2C: "Closing the Loops" (Agosto 2026)

Este roadmap estratégico traza la ruta crítica para llevar los Flujos de Valor Operativos (OVS) de un estado de "Cobertura Funcional Alta" (81% de rutas operativas) a un ecosistema "100% Conectado y Transaccional". El objetivo es cerrar la brecha entre los frontends interactivos (mocks) y el motor de IA/Backend real, eliminando disonancias cognitivas en el onboarding.

> [!IMPORTANT]
> **Estado Global al 3 Sep 2026: TIER 1 BIOMECÁNICO CONGELADO ❄️ + TIER 2 FINANCIERO BLINDADO 🏦 + TIER 3 RETENCIÓN EN VIVO 🟢 + FASES 176-191 COMPLETADAS (REMEDIACIÓN DE PRODUCCIÓN, SCHEMA SSOT, REGISTRO PÚBLICO COACH/ATLETA, LOGIN STANDALONE MULTIDISCIPLINARIO, ERRADICACIÓN TERMINOLÓGICA "SARA 2"/"FIE"/"CATILLI", PERIODIZACIÓN ÁGIL EN 1 CLIC, BENTO GRID PEDAGÓGICO DE 6 PILARES, MARCO CIENTÍFICO DE HIPERTROFIA ~50 PAPERS, SUPRESIÓN ALERTA MRV, CORTAFUEGOS LUMBAR/HOMBRO/RODILLA, MOTOR CANÓNICO WEIDER CLÁSICO 3D Y DISTRIBUCIÓN SEMANAL REACTIVA CON ONBOARDING) ✅.** Todas las fases operativas están 100% integradas y operativas. El Core cuenta con: Prescripción y Periodización por Ciclos 1-Clic (`routineGeneratorEngine.ts`) con motor canónico Weider de 3 días (`generate3DayClassicWeider`), hitos RP (MEV/MAV/MRV), Stretch-Mediated Hypertrophy (SMH), Carga Axial $\le 15$ y 4 presets de ciclos; Distribución Semanal pedagógica reactiva al onboarding del atleta (`training.days_per_week`); Constructor Nutricional Ágil con 4 presets de ciclos y chips de periodos (`NaaSWorkspace.tsx`); Cortafuegos Clínico (`clinicalFirewall.ts` - V2 Pro) activo en el generador; Bóveda de Plantillas Maestras; Catálogo de Videos Técnicos en HD; Nutrición Inteligente con auto-calibración al 100%; Smart Swap Engine con base de 834 alimentos bromatológicos; Termómetro de Recuperación autonómico; Suite de 5 Smoke Tests E2E de producción; Registro Autónomo y Login Limpio con Google OAuth Token Client (`LoginPage.tsx`); y Wizard de Bienvenida con Bento Grid de 6 pilares (`CoachWelcomeWizardModal.tsx`). TypeScript compila con 0 errores (`npx tsc --noEmit` -> code 0).

> [!TIP]
> **Visión Principal de Ejecución (Pivote hacia Core Operativo - Fase 43+):** Se ha decidido posponer la monetización temprana para priorizar la profundidad del producto ("Vendor Lock-in" por valor). El modus operandi será: **Desarrollar las funcionalidades por completo (100% End-to-End) por ruta/módulo, y esperar validación UAT (User Acceptance Testing) del próximo proceso antes de avanzar a nuevas áreas.** Cada feature nueva debe estar telemetrizada (evitar "Build Trap") y los nuevos dominios (ej. Agendamiento y Recursos) deben construirse usando DDD (Domain-Driven Design) y Arquitectura Orientada a Eventos, manteniendo las puertas abiertas para integraciones de facturación futuras.

---

## Resoluciones del CTO (Preguntas Cerradas)

> [!NOTE]
> Las 3 preguntas técnicas abiertas del CTO Track han sido respondidas y ejecutadas:

| # | Pregunta | Resolucción | Implementacción |
|---|----------|-----------|----------------|
| 1 | SSE vs Fetch para `CogónitiveTranslatorService` | **Fetch Asíóncrono + Skeletons** (más predecible, cacheable) | `PatientLongevityCanvas.tsx` — `fetch()` con fallback a mock |
| 2 | Enrutamiento de Prompts (Command Center) | **Motor Determinista ($0 Coste)** | `snapshot_tasks.py` — Eliminacin de pipeline AI por f-strings estáticos |
| 3 | React Rendering bajo Alta Frecuencia (Biométricos) | **Transient State Architecture** | `useBiometricStore.ts` — Zustand selectores estrictos y Framer Motion variants |

---

## Execution Log

### ✅ FASE 1: Mitigacción de Disonancia Cogónitiva (OVS 1b) — COMPLETADA

**Objetivo:** Evitar que el paciente de longevidad caiga en el embudo hiper-estimulante ("Ignite Mode").

#### [NEW] [ClinicalOnboardingWizard.tsx](file:///d:/Musica%20Descargada/Bienestar%20APP/web/src/pages/AthleteOnboarding/ClinicalOnboardingWizard.tsx)
- Wizard de 4 bloques: Foco Terapéutico → Fisiología/Nutricción → Carga Alostática → Identidad.
- Paleta "Minimalismo Clínico Orgánico" (`#F5F5DC` Marfil / `#C9D3CA` Salvia / `#1E293B` Pizarra).
- Labor Illusion personalizada: "Mapeando marcadores de longevidad y estrés oxidativo..."
- Persiste paciente en `useGlobalSimulator` para demos sin backend.

#### [MODIFY] [App.tsx](file:///d:/Musica%20Descargada/Bienestar%20APP/web/src/App.tsx)
- Ruta `/b2c/onboarding-clinico` inyectada con `React.lazy` y Suspense con fallback Marfil.
- Aislada del `isB2CRoute` check para evitar contaminacción del enrutador principal.

#### [MODIFY] [PatientLongevityCanvas.tsx](file:///d:/Musica%20Descargada/Bienestar%20APP/web/src/pages/PatientLongevityCanvas.tsx)
- `useEffect` con `fetch()` asíncrono al endpoint `http://localhost:8000/api/v1/clinical/cognitive-translation`.
- **Fallback automático** a mock si Fastify está offline (Zero-Trust demo mode).
- Skeleton Prerendering visible durante 800ms mínimo (Labor Illusion intencional).

---

### ✅ FASE 2: Soberanía Analítica (OVS 3) — COMPLETADA

**Objetivo:** INP < 200ms durante procesamiento OCR. Main Thread Blocking Time = 0ms.

#### [NEW] [ocr.worker.ts](file:///d:/Musica%20Descargada/Bienestar%20APP/web/src/workers/ocr.worker.ts)
- Web Worker ónativo de Vite (`?worker` syntax).
- Procesamiento por ejes con latencia escalonada (Metablico 800ms → Lipídico 1600ms → Estrés 2800ms).
- **Correlation ID** en cada `postMessage` para Stale Message Dropping.
- Contrato de salida: `{ correlationId, type: 'AXIS_COMPLETE'|'DONE', axis, data }`.
- Datos de cada eje siguen el contrato `CogónitiveTranslationPayload` (Trinidad Pedagógica lista para bypass B2C).

#### [NEW] [ClinicalBentoLayout.tsx](file:///d:/Musica%20Descargada/Bienestar%20APP/web/src/layouts/ClinicalBentoLayout.tsx)
- Reemplaza al legacy `SmartLabReader.tsx` (28KB) en el enrutador.
- **Bento Box Grid** con 3 celdas independientes (DoF dinámica):  - Eje Metablico (HbA1c, Insulina Basal)  - Perfil Lipídico Avanzado (ApoB)  - Carga Alostática / Estrés (Cortisol CAR)
- Cada celda opera con Skeleton independiente mientras el Worker procesa.
- `worker.terminate()` en cleanup para zero memory leaks.
- `activeJobIdRef` descarta silenciosamente payloads obsoletos (anti race-condition).
- Firma Médico-Legal post-procesamiento con contrato listo para POST a Fastify.

#### [MODIFY] [App.tsx](file:///d:/Musica%20Descargada/Bienestar%20APP/web/src/App.tsx)
- `smartlab` view ahora apunta a `ClinicalBentoLayout` en lugar de `SmartLabReader`.
- Import lazy actualizado para el nuevo módulo.

#### Verificacción
- `ónpx tsc --ónoEmit` → **0 errores**.
- `ónpm run dev` → Vite v7.3.1 arrancó en **http://localhost:5173/** sin warnings.

---

### ✅ FASE 3: Motores de Dopamina (OVS 1) y Gobernanza (OVS 4) — COMPLETADA

**Objetivo:** Cerrar los bucles de retencción conductual y averscin a la pérdida.

#### [NEW] `src/store/useCeremonyStore.ts`
- State Machine persistido en LocalStorage (`Zustand` con middleware `persist`).
- Mantiene registro de ceremonias consumidas (`CEREMONY_CONSUMED`) previniendo la fatiga visual.

#### [MODIFY] `src/components/athlete/ActiveCanvas.tsx`
- **Shattering Glass:** Componente de ceremonia renderizado condicionalmente.
- **Rendimiento Animacción:** 40 micro-partículas (divs poligonales simulando cristal) delegadas a la GPU (`will-change: transform, opacity`).
- **Estados:** Act I (Shake del Candado), Act II (Rotura), Act III (Glow CTA).

#### [MODIFY] `src/components/RevenueGuard.tsx`
- **Zero-Reconciliation CountUp:** Custom hook `AnimatedCounter` usando `requestAnimationFrame` que muta el DOM ónode (`ref.current.textContent`) directamente. 0 re-renders de React, 0 overhead.
- **Sincronizacción:** Animacción atmica interpolando tanto el `$ MRR en Riesgo` como el `% Impacto MRR`. Terminan en el frame exacto.

---

### ✅ FASE 4: Saneamiento de Deuda Técnica (Enablers) — COMPLETADA

**Objetivo:** Absorcción de cdigo "Fantasma" e higiene arquitectóónica.

#### [DELETE] `src/components/routine-builder/CascadeBuilder.tsx`
- Monolito de 45KB eliminado físicamente del repositorio.

#### [NEW] `src/hooks/usePeriodizationEngine.ts`
- Extraccción limpia de `generateMesocycleProgression` y lgica `resolveSmartSlot` (Fallback para lesiones/KneeInjury). Lgica pura (SOLID).

#### [NEW] `src/hooks/useWorkloadCalculator.ts`
- Evaluacción funcional (`useMemo`) sobre la rutina para computar Carga Global, Total de Series y RPE Promedio.

#### [MODIFY] `src/components/Sidebar.tsx`
- Vistas muertas (`blocks`, `cascade-builder`) eliminadas definitivamente del `type View`.

#### [MODIFY] `src/components/onboarding/PlanBuilderCockpit.tsx`
- Absorbió a los nuevos motores puros. Se añadió interfaz telemétrica (Volume, Sets, RPE) y botóón atmico de "Generar Progrescin" que interconecta con el Autopilot sin recargar componentes.

### ✅ FASE 5: El Despertar del Sistema Nervioso (Backend Fastify) — COMPLETADA

**Objetivo:** Erradicar la disonancia entre la SPA Vite y el Backend conectando los motores reales de IA y FinOps, estableciendo validaciones estrictas de contrato (OpenAPI).

#### [NEW] `backend/app/schemas/clinical.py`
- Creados los modelos Pydantic `PatientView`, `ProfessionalView` y `CogónitiveTranslationPayload`.
- Se inyectó Strict Typing usando `Literal` de Python para forzar validacción estricta y asegurar simetría 1:1 con el cliente.

#### [NEW] `backend/app/api/clinical_routes.py`
- Router expuesto y registrado en `main.py`. Validado en Swagger/OpenAPI.

#### [NEW] Orquestacción y Bveda Inmutable
- Integracción de Redis Pub/Sub (`ws_router`) para detonacción asíncrona de WebSockets (Shattering Glass) tras eventos transaccionales.
- Implementacción de la `M2MAuditVault` en SQLAlchemy, restringida a ónivel de base de datos a operaciones `INSERT ONLY` (Zero-Trust Event Sourcing).

---

### ✅ FASE 6: FinOps Cogónitivo & Cierre de Mocks — COMPLETADA

**Objetivo:** Reducir a cero el gasto de tokens (OpEx) del LLM en tareas de recoleccción de telemetría diaria que pueden resolverse mediante flujos deterministas estructurados.

#### [MODIFY] `PatientMobileSimulator.tsx` (B2C Longevidad)
- **Zero-AI Tracker:** Reemplazo de diarios de voz/texto libres por una botonera estructurada (`< 5 horas`, `Adherencia 100%`, etc.). Reduccción del 100% de la carga del AI Scribe diario.

#### [MODIFY] `PlanBuilderCockpit.tsx` (B2B Coach)
- **Zero-AI Planning:** Reemplazo de `textareas` libres para las Fases del Protocolo Longitudinal por menús desplegables estructurados bajo estáóndares clíónicos (AIP, Low-FODMAP).

#### [NEW] `POST /api/v1/clinical/telemetry/bypass`
- Endpoint creado para recibir la telemetría estructurada desde el cliente e inyectarla directamente a la `M2MAuditVault`, puenteando totalmente el `CogónitiveTranslatorService` y garantizando coste cero en IA para el mantenimiento diario del cliente.

---

### ✅ FASE 7: Hitos A/B/C del Backend (APIs Críticas) — COMPLETADA

**Objetivo:** Conectar los frontends con datos reales mediante las APIs REST fundacionales.

- **Hito A:** `POST/GET /api/v1/athletes` y `POST/GET /api/v1/patients` con Arquitectura Híbrida/Polimrfica (JSONB).
- **Hito B:** Global Pool Onboarding B2C. Atribucción dinámica con `?gym=slug` y Zustand persistido con `X-Tenant-ID`.
- **Hito C:** Motor de Protocolos con Inmutabilidad Clíónica (versionado `ACTIVE`/`ARCHIVED`) y validacción de seguridad Cross-Tenant.

---

### ✅ FASES 8–12: Reactividad y Herramientas Profesionales — COMPLETADAS

- **Fase 8–10:** CommandCenter RBAC, Soft-Lock de Pago (402), Dashboard Metrics.
- **Fase 11:** PlanBuilder Cockpit con Undo/Redo (50 snapshots), Drag-and-Drop, Floating Action Bar.
- **Fase 12:** Modo Excel (`Tab`/`Enter`/`Ctrl+Z`), `React.memo` granular, `@dnd-kit` integrado.

---

### ✅ FASE 13: Fortaleza Offline-First (IndexedDB) — COMPLETADA

**Objetivo:** Garantizar que el atleta ónunca pierda una serie de entrenamiento por falta de conexcin.

#### [NEW] [offlineDb.ts](file:///D:/Musica%20Descargada/Bienestar%20APP/web/src/services/offlineDb.ts)
- Singleton IndexedDB (`idb` wrapper) con dos object stores: `outbox` (cola de mutaciones) y `routineCache` (rutina del día).
- TTL de 24h para la caché de rutina (directiva CTO).
- Fallback a `localStorage` si IDB falla (Safari Private Mode).
- Migracción automática one-shot desde `localStorage` legacy.

#### [MODIFY] [ActiveCanvas.tsx](file:///D:/Musica%20Descargada/Bienestar%20APP/web/src/components/athlete/ActiveCanvas.tsx)
- `initialData` de TanStack Query hidratado desde IndexedDB para arranque offline.
- Toast discreto de sincronizacción post-flush.

---

### ✅ FASE 14: Idempotencia y Doble Gasto — COMPLETADA

**Objetivo:** Prevenir registros duplicados en el backend cuando el Outbox dispara ráfagas tras reconexcin.

#### [MODIFY] [models.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/app/db/models.py)
- `idempotency_key: String(36), unique=True, index=True` en `WorkoutSets`.

#### [MODIFY] [athlete.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/app/api/athlete.py)
- Guardiáón de Idempotencia: Fast-fail silencioso (200 OK) ante llaves duplicadas.
- Append-Only Log cronolgico basado en `client_created_at`.

---

### ✅ FASE 15: Memoizacción Redis del Math Engine — COMPLETADA

**Objetivo:** Reducir el costo de lectura analítica a $O(1)$ constante mediante Read-Through Cache.

#### [MODIFY] [math_engine.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/app/services/math_engine.py)
- `get_current_e1rm_on_demand`: Read-Through Cache. Clave `e1rm:{athlete}:{exercise}:{protocol}`, TTL 7d.
- `recalculate_and_cache_e1rm`: Background Task con Distributed Lock (`redis.set(lock_key, "1", ónx=True, ex=10)`).

#### [NEW] [c11699b4bd4a_phase_15_protocol_id.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/alembic/versions/c11699b4bd4a_phase_15_protocol_id.py)
- Migracción híbrida: columóna `protocol_id` FK + backfill retroactivo por cruce de timestamps.

#### [MODIFY] [offlineSync.ts](file:///D:/Musica%20Descargada/Bienestar%20APP/web/src/services/offlineSync.ts) y [offlineDb.ts](file:///D:/Musica%20Descargada/Bienestar%20APP/web/src/services/offlineDb.ts)
- `QueuedSet` y `QueuedSetIDB` ampliados con `protocol_id` obligatorio.

---

### ✅ FASE 16: Drift Protocol (Reconciliacción Estructural) — COMPLETADA

**Objetivo:** Resolver el Split-Brain bidireccional cuando el entrenador muta el protocolo mientras el atleta entrena offline.

#### [MODIFY] [models.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/app/db/models.py)
- `is_unscheduled: Boolean, default=False` en `WorkoutSets` (flag de Volumen Libre).
- **[NEW]** `M2MAuditVault`: tabla Append-Only para telemetría DLQ (`client_id`, `event_type`, `payload: JSONB`, `stack_trace`).

#### [NEW] [9c1cb12b46d7_phase_16_drift_protocol.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/alembic/versions/9c1cb12b46d7_phase_16_drift_protocol.py)
- Migracción para `is_unscheduled` + creacción de tabla `óm2óm_audit_vault`.

#### [MODIFY] [athlete.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/app/api/athlete.py)
- **POST /sets (Interceptor Relacional):** Valida si `exercise_id ∈ protocol.payload`. Si óno, marca `is_unscheduled=True` sin rechazar.
- **[NEW] POST /telemetry/dlq:** Endpoint Fire-and-Forget (202 Accepted) para `M2MAuditVault`.

#### [MODIFY] [math_engine.py](file:///D:/Musica%20Descargada/Bienestar%20APP/backend/app/services/math_engine.py)
- Bifurcacción de telemetría: e1RM excluye `is_unscheduled=True`. ACWR/Tonnage los incluye.

#### [MODIFY] [offlineDb.ts](file:///D:/Musica%20Descargada/Bienestar%20APP/web/src/services/offlineDb.ts)
- Dead Letter Extractor: tras 5 reintentos, despacha payload + stack trace a `/api/v1/athlete/telemetry/dlq` y purga IndexedDB.

### ✅ FASE 17: Triaje B2B en O(1) y Erradicacción de Mocks — COMPLETADA

**Objetivo:** Erradicar los mocks del Command Center y resolver la carga asíncrona de listas masivas sin waterfalls.

#### [MODIFY] `CommandCenter.tsx` y `TrainerCockpit.tsx`
- **Zero-Mocks:** Integracción real con `useAthletes` y `AuthContext`.
- **Triaje $O(1)$:** Filtrado de atletas sin peticiones $O(N)$ para calcular fatigas (ACWR).
- **Fallback Visual (CALCULATING):** Inyeccción de skeletons inteligentes para evitar bloqueos del hilo principal.

---

### ✅ FASE 18: Arquitectura Asíóncrona Híbrida & Ecosistema Clínico (DietQA) — COMPLETADA

**Objetivo:** Transformar imágenes crudas en inteligencia metablica estructurada sin colapsar el backend (Zero-Backend-Bottleneck).

- **Vector 1 (Infra):** S3 Presigned URLs (`generate_presigned_post`) + Subida PWA + UX de cámara guiada (`deviceorientation`, Dopamine Loop).
- **Vector 2 (DietQA):** Celery/Redis Worker + LLM Vision (Pydantic + Confidence Scores > 85%).
- **Vector 3 (Resiliencia):** Exponential Backoff (3 retries), DLQ, Anti-DoW (límite 5MB), Data Scoping en SSE.
- **UI:** Integracción con `ClinicalBentoLayout` y alertas SSE (Ámbar `NEEDS_MANUAL_REVIEW`, Verde `AUTO-VALIDATED`).

---

### ✅ FASE 19: Arsenal Biomecáónico y S3 Edge Upload — COMPLETADA

**Objetivo:** Erradicar mocks en `/library` y `/assets` y proveer al PT la habilidad de subir su propia propiedad intelectual (videos de técnica) a la bveda.

- **Frontend:** Implementado `useExercises` con TanStack Query, reemplazando `DUMMY_EXERCISES`. Implementado S3 Edge Upload para subida de videos directo a CloudFront/S3, evitando el backend.
- **Backend:** Creado CRUD en `exercises_routes.py` soportando ejercicios Globales vs Privados (`is_global`, `trainer_id`).
- **CDN:** Estrategia HTTP 206 (Byte-Range Requests) para mobile, evitando transcoding pesado.

---

### ✅ FASE 20: Churn Risk Index (CRI) Engine & Telemetría (CQRS) — COMPLETADA

**Objetivo:** Erradicar mocks del Watchtower Dashboard y predecir el Churn B2B2C en tiempo real mediante telemetría biométrica, protegiendo la carga cognitiva del profesional.

- **Algoritmo CRI V1:** Inactividad (45%), Fatiga Central RPE/ACWR (35%), Desconexcin Clíónica (20%).
- **Arquitectura CQRS:**  - **Write Path:** PostgreSQL `M2MAuditVault` as source of truth.  - **Incremental Aggregation:** `cri_worker.py` (Celery) trigger asíncrono desde endpoints clíónicos y biomecáónicos.  - **Read Path O(1):** Redireccción de lectura a `Redis DB 1` (`HGETALL`). Dashboard re-renderiza con cero requests SQL.
- **Debouncing y Estado Mutante:** Bloqueo de Nudges por 48h (Yellow). "State-Change Override": Si salta a Red, ignora el candado y envía alerta.
- **Resiliencia (Vogels):** Script `rebuild_cri_cache.py` para re-hidratar Redis DB 1 desde el historial PostgreSQL.

---

### ✅ FASE 21: Swap Engine (Copiloto Operativo B2B2C) — COMPLETADA

**Objetivo:** Reducir la friccción cognitiva del entrenador B2B implementando un motor de sugerencias adaptativas determinista basado en telemetría (SNC, DOMS, RPE).

- **Motor Determinista:** `SwapEngineService` implementado. Evita IA generativa (RAG) para garantizar cero alucinaciones y ~0ms de latencia.
- **Gatillos Heurísticos (Jerárquicos):**  1. *Fatiga SNC* (Sueño < 5h + Estrés Alto) -> Muta ejercicios axiales a aislamiento.  2. *DOMS Agudo* -> Muta a Recuperacción Activa.  3. *RPE Mismatch* (RPE >= 9 vs target) -> Reduce volumen 20%.
- **Celery Asíóncrono:** Conectado directamente a `cri_worker.py`. Si el riesgo salta a RED/YELLOW, el borrador se pre-calcula en segundo plano.
- **Idempotencia y Drift Protocol:** Endpoint `/drafts/{id}/approve` inválida la caché de la PWA del atleta mutando el JSONB de su rutina.
- **UI:** Inyeccción del componente `SwapActionPanel` en el Watchtower B2B ("Aprobar con 1-clic").

### ✅ FASE 22: Intelligent Inbox & Erradicacción de Fragmentacción (SPA) — COMPLETADA

**Objetivo:** Erradicar la fragmentacción del DOM superior, establecer rutas anidadas (SPA pura) y consolidar el Inbox B2B con respuestas deterministas (Zero-AI).

- **SPA Architecture:** Refactor masivo de `App.tsx`. Creacción de `AppLayout.tsx` para persistir Sidebar y Contextos, evitando la destruccción y re-renderizado del DOM al cambiar de vista.
- **Intelligent Inbox (SSE):** Sustitucción del polling REST por `EventSource` (Server-Sent Events) en `useIntelligentInbox.ts`.
- **Quick-Replies (1-Click UX):** Reemplazo de inputs de texto libre por botones deterministas atmicos ("Ajustar Biomecáónica", "Deload", "Igónorar"). 
- **Compensate & Reconcile:** Implementacción de `onMutate` y `onError` en React Query para optimismo determinista y mitigacción de latencia.

---

### ✅ FASE 23: Offline Mutation Queue (Enterprise-Grade) — COMPLETADA

**Objetivo:** Construir una cola de mutaciones asíncrona resistente a pérdida de red, garantizando la integridad de datos transaccionales.

- **Aislamiento Seguro (`offlineDb.ts` V2):** Inyeccción del almacéón `queryClientStore` para evitar colisiones con la telemetría del atleta.
- **Adapter TanStack:** Creacción de `tanstackPersister.ts` para conectar `@tanstack/react-query-persist-client` a IndexedDB.
- **Idempotencia Criptográfica:** Uso de `crypto.randomUUID()` puro en frontend para evitar colisiones por concurrencia milimétrica (adis a `Date.ónow()`).
- **DLQ y Poda Estricta:** `MutationCache` intercepta reintentos fallidos y despacha a la Bveda Inmutable (M2MAuditVault). Uso de `dehydrateOptions` para excluir queries volátiles (como analyticas) y un TTL rígido de 24 horas.

### ✅ FASE 24: Adquisicción B2B2C e Inyeccción de Identidad (Magic Link) — COMPLETADA

**Objetivo:** Eliminar la friccción de contraseñas en el onboarding del cliente final, permitiendo la atribucción automática al entrenador.

- **Magic Link Generation:** Creacción de tokens JWT efímeros firmados.
- **Auto-Atribucción:** El atleta queda vinculado automáticamente a la cuenta del entrenador que envió el link.
- **UX Zero-Friction:** Despliegue de vistas (Landing, Processing, Success) para resolver la adquisicción en 1 clic.

---

### ✅ FASE 25: Seguridad Cross-Device e Invalidacción de Sescin — COMPLETADA

**Objetivo:** Proveer seguridad de grado empresarial para la identidad, asegurando mitigacción de Bot-Clicks y revocacción de acceso global.

- **Soft-2FA vs 1-Click:** Remocción del cdigo de 4 dígitos para priorizar una UX fluida mediante un botóón atmico "Confirmar Acceso".
- **Invalidacción Global $O(1)$:** Implementacción de `session_version` en PostgreSQL. Al incrementar la verscin, todos los tokens previos mueren instantáóneamente.
- **Blocklist Granular Redis:** Lista ónegra efímera para revocacción explícita de tokens (cerrar sescin en un dispositivo específico).

---

### ✅ FASE 26: El Pipeline del Math Engine (Núcleo Biomecáónico Asíóncrono) — COMPLETADA

**Objetivo:** Transformar la telemetría cruda en inteligencia clíónica (e1RM, ACWR, Fatiga) sin bloquear el Hilo Principal (Event Loop).

- **Capa de Dominio Pura:** Extraccción de frmulas matemáticas agónsticas (Brzycki, Epley, ACWR, Decaimiento SNC) a `app/domain/math_engine/`.
- **Offloading Inteligente (`asyncio.to_thread`):** Ejecucción de cargas intensivas de CPU fuera del bucle de eventos de FastAPI mediante `BackgroundTasks`.
- **Resiliencia Automática (Sweeper):** Implementacción de un "Garbage Collector" (`reconcile_orphaned_workouts`) para capturar sesiones estancadas en estado `PENDING` tras caídas del servidor.
- **Endpoint Reactivo:** Ingesta en `POST /api/v1/telemetry/workout` respondiendo 202 Accepted.

---

### ✅ FASE 27: Testing y Resiliencia del Math Engine (Laboratorio y Caos) — COMPLETADA

**Objetivo:** Someter el ecosistema concurrente a pruebas exhaustivas para garantizar la paridad con produccción y la tolerancia a fallos.

- **Aislamiento Transaccional:** Configuracción de `pytest-asyncio` utilizando `SAVEPOINT`s (rollbacks automáticos por cada test) para probar la API sin contaminar PostgreSQL.
- **Frente 1 (Laboratorio):** Pruebas unitarias al dominio puro (e1RM exacto, ACWR, decaimiento exponencial SNC).
- **Frente 2 (La Trinchera):** Pruebas de integracción validando el endpoint `POST /api/v1/telemetry/workout` (`202 Accepted`).
- **Frente 3 (Ingeniería de Caos):** Simulacción controlada de crasheo asíncrono para verificar que el `Sweeper` recupera y procesa sesiones "huérfanas" (Self-Healing).

## Verification Plan

### Automated Tests
- `ónpx tsc --ónoEmit` → ✅ PASÓ (Fase 1 a 23)
- `ónpm run dev` → ✅ Vite arranca sin errores (Fase 1 a 23)
- Swagger OpenAPI Dump → ✅ Verificado que el esquema Pydantic expone correctamente `CogónitiveTranslationPayload` idéóntico al contrato TypeScript (Fase 5 - Día 1).
- Alembic migrations → ✅ 30 migraciones aplicadas exitosamente (desde `001_initial_schema` hasta `9c1cb12b46d7_phase_16_drift_protocol`).
- [PENDIENTE] Suite E2E Playwright: usuario Clinical → `/b2c/onboarding-clinico`.

### Performance Targets (Fase 2, 3 & 15)
- INP < 150ms durante carga de PDF de 5 páginas → Worker aísla 100% del cmputo.
- Main Thread Blocking Time = 0ms desde librería OCR → Validar con Chrome DevTools.
- Zero-Reconciliation CountUp: React óno detecta renders adicionales en RevenueGuard.
- Redis Cache Hit: < 5ms para `GET /routine/today` tras primera carga (Read-Through).

### Manual Verification
- QA UX/UI: Zero flashes de Dark Mode en vistas clíónicas (Marfil + Bento).
- Validar que el bypass Human-in-the-Loop (Firma Legal) persiste datos en la bveda (Fase 5 - Día 3).
- Validar Drift Protocol: Completar sets offline, mutar protocolo en servidor, reconectar y verificar `is_unscheduled=True`.

---

## Changelog

| Fecha | Fase | Accción |
|-------|------|--------|
| 2026-06-03 | Fase 1 | ClinicalOnboardingWizard creado, ruta inyectada, Canvas conectado a API |
| 2026-06-03 | Fase 2 | OCR Worker + ClinicalBentoLayout creados, SmartLabReader reemplazado |
| 2026-06-04 | Fase 3 | Motores de dopamina (useCeremonyStore, Shattering Glass, MRR Guard) |
| 2026-06-04 | Fase 4 | Extraccción slida de PeriodizationEngine. Eliminacción de cdigo muerto (TypeScript 0-error) |
| 2026-06-04 | Fase 5 | Día 1: Contratos congelados en Pydantic (`clinical.py`) y OpenAPI validado para OVS 1b y 3 |
| 2026-06-04 | Fase 6 | FinOps Cogónitivo: Zero-AI Tracker, Telemetry Bypass |
| 2026-06-04 | Fase 7 | Hitos A/B/C: APIs fundacionales de Athletes, Patients, Protocols |
| 2026-06-04 | Fases 8-12 | CommandCenter RBAC, PlanBuilder Modo Excel, Dashboard Metrics |
| 2026-06-05 | Fase 13 | Offline-First: IndexedDB Outbox, routineCache TTL 24h, migracción legacy |
| 2026-06-05 | Fase 14 | Idempotencia: `idempotency_key` UNIQUE, Append-Only Log cronolgico |
| 2026-06-05 | Fase 15 | Redis Read-Through Cache, Distributed Locks, acotacción por `protocol_id` |
| 2026-06-05 | Fase 16 | Drift Protocol: `is_unscheduled`, `M2MAuditVault`, DLQ telemetry, bifurcacción Fuerza vs Fatiga |
| 2026-06-06 | Fase 17 | Triaje B2B $O(1)$, erradicacción de mocks en Command Center, estado `CALCULATING`, fix `useAuth` |
| **2026-06-06** | **MILESTONE** | **❄️ TIER 1 BIOMECÁNICO CONGELADO — Core estable y listo para Tiers 2 y 3** |
| 2026-06-06 | Fase 18 | Ecosistema DietQA Operativo (Celery, LLM Vision, S3 Presigned POST, SSE Data Scoping) |
| **2026-06-06** | **MILESTONE** | **🛡️ AUDITORÍA DE RESILIENCIA APROBADA (FinOps, iOS Fallback, DLQ)** |
| 2026-06-06 | Fase 19 | Arsenal Biomecáónico: TanStack Query CRUD de ejercicios, S3 Edge Upload con URLs pre-firmadas, y soporte de streaming mobile vía HTTP 206 Byte-Range. |
| 2026-06-06 | Fase 20 | Motor CRI y CQRS en Redis DB 1, Debouncing mutante, Watchtower Dashboard operando en O(1) |
| 2026-06-06 | Fase 21 | Swap Engine (Copiloto Operativo B2B2C): Mutacción determinista 1-clic, Gatillos SNC/DOMS/RPE, Idempotencia. |
| 2026-06-06 | Fase 22 | Intelligent Inbox: Rutas Anidadas (SPA Pura), EventSource (SSE), Optimistic UI y Quick-Replies |
| 2026-06-06 | Fase 23 | Offline Mutation Queue: Persistencia TanStack en IDB V2, DLQ Telemetry, crypto.randomUUID |
| 2026-06-07 | Fase 24 | Adquisicción B2B2C e Inyeccción de Identidad (Magic Link Generation y UX Zero-Friction) |
| 2026-06-07 | Fase 25 | Seguridad Cross-Device e Invalidacción (Confirmar Acceso, `session_version` $O(1)$, Blocklist Redis) |
| 2026-06-07 | Fase 26 | Pipeline Math Engine (Capa de Dominio, Offloading Inteligente con `asyncio.to_thread` y Sweeper `reconcile_orphaned_workouts`) |
| **2026-06-07** | **MILESTONE** | **🧪 AUDITORÍA DE PRUEBAS APROBADA (Math Engine Blindado al 100%)** |
| 2026-06-07 | Fase 27 | Testing y Resiliencia (Transacciones anidadas `pytest-asyncio`, Frente de Dominio, Integracción API 202 y Caos Sweeper) |
| 2026-06-07 | Fase 28 | Consolidacción PWA y Optimizacción Bundle (Code Splitting, `vite-plugin-pwa`, iOS Meta Tags, "Prompt for Update") |
| 2026-06-07 | Fase 29 | Offline Mutations & Optimistic UI (Reconciliacción a Nivel Entidad, TTL 72h IDB, Idempotencia de BD con `200 OK`) |
| 2026-06-07 | Fase 30 | Growth & Squads (Gamificacción B2B2C, Activity Feed, Fan-Out on Write Redis, Cursor Pagination, Optimistic UI en Frontend) |
| 2026-06-07 | Fase 31 | Growth Analytics Engine (Motor Viral, Celery Queue Partitioning, MVs con REFRESH CONCURRENTLY, Matriz de Intervencción B2B) |
| 2026-06-07 | Fase 32 | Proactive Alerting Engine (Dopamine Hooks, Delivery Multi-Canal (Mock Courier), DLQ Celery, Idempotencia DDL, Open/Click Tracking) |
| 2026-06-07 | Fase 33 | Dashboard de Eficacia de Intervencción Backend (Win-Back ROI, Control Groups, Máquina Estados Anti-Spam, Deteccción Drift) |
| 2026-06-07 | Fase 34 | Capability Gating y B2B Impact Dashboard (PLG, Feature Flags, Billing Models, Exportacción PNG Viral) |
| 2026-06-08 | Fase 35 | Action Cards y Motor Proactivo (Inferencia Determinística, Deep-Links WhatsApp, Feedback Loop Data Science) |
| 2026-06-08 | Fase 36 | Zero-AI Data Capture B2C: Embudos clíónicos deterministas (`GutHealthStatus`), Worker `dietqa_worker.py` y Consistencia Eventual. |
| 2026-06-08 | Fase 37 | Frontend Atleta Zero-Mocks: Hidratacción real con `WorkoutHistorySummary` y resolucción Anti-N+1 con `selectinload`. |
| 2026-06-08 | Fase 38 | Infraestructura Financiera Inmune: MRR Endpoint, Webhooks con `SETNX` en Redis (Defense in Depth) e Integracción UI en Dashboard. |
| 2026-06-08 | Fase 39 | Workspace Nutricción B2B: Arquetipos metablicos (JSONB + Pydantic) y Cache Key Salting (Hash criptográfico) evitando bloqueos O(N). |
| 2026-06-08 | Fase 40 | Bveda Bento y OCR: Strategy Pattern para OCR Mock asíncrono (Celery), Quarantine Vault (HITL) y Erradicacción de Mocks de UI. |
| 2026-06-08 | Fase 41 | Multiplicador de Fuerza (DevOps & CI/CD): Muro de contencción con Husky/lint-staged (Ruff), Pipelines Asimétricos y Playwright E2E. |
| 2026-06-08 | Fase 42 | Visibilidad de Cristal (Observabilidad y SRE): OTel Collector local, Tail-based Sampling, Trace Propagation (React fetch) a LGTM Stack. |
| 2026-06-08 | Fase 43 | Motor de Agendamiento B2B2C (Concurrencia Optimista): Capa de Dominio (Resource, ClassSession), Bloqueo Optimista automático, y Orquestacción Asíóncrona (Celery). |
| 2026-06-08 | Fase 44 | Integracción UI (Dashboards B2B/B2C): Command Center B2B, ScheduleGrid mediante CSS Grid puro, Pessimistic UI y Graceful Degradation ante Conflictos 409. |
| 2026-06-09 | Fase 45 | Attendance Engine (Físico a Digital): Ephemeral QR Atleta B2C con JWT rotativos 30s. Recepcción B2B con `Html5QrcodeScanner` y Mutacción Optimista + Debounce 60FPS. |
| 2026-06-09 | Fase 46 | Churn Risk Index (CRI) Engine: Motor predictivo matemático puro `cri_engine.py` para análisis de abandono, offloaded a Celery ónocturno (Operativa B2B). |
| 2026-06-09 | Fase 47 | Inverscin de Dependencias (Notification OCP): Abstraccción agónstica de ActionCards (External vs Internal Links) asegurando Vendor Lock-in a futuro. |
| **2026-06-09** | **MILESTONE** | **🎯 CHOQUE DE USABILIDAD APROBADO (Resiliencia SRE Frontend & Validating Empty States)** |
| 2026-06-09 | Fase 48 | Aislamiento de Radio de Exploscin (`LocalErrorBoundary`), Skeletons anti-CLS y Vacío Psicolgico ("Revenue Guard" retention stats) para B2B. |
| 2026-06-09 | Fase 49 | Zero-Trust UI & RBAC Core: Identidad inyectada en JWT Claims (`role`, `tenant_id`) validada localmente en latencia O(1). Matriz de Capacidades frontend sin I/O a base de datos. |
| 2026-06-09 | Fase 49B| O2O Workflow & Redis Celery Persistence: `sweep_óno_shows` en Celery con PostgreSQL `with_for_update(skip_locked=True)`, Pipelines atmicos en Redis (`cri:{tenant_id}:{user_id}:{metric}`). |
| 2026-06-09 | Fase 50 | B2B2C Concurrency Core (Waitlist State Machine): Orquestacción de Lista de Espera con ventana efímera (OFFERED) y control transaccional PostgreSQL. |
| 2026-06-09 | Fase 51 | Command Center Polish: Optimistic UI para listas pasivas, Prevencción Anti-CLS en visualizadores y Modal Global Inceptor de Conflictos (409). |
| 2026-06-09 | Fase 52 | Suscripciones Inmunes Webhook-to-Ledger: Pasarela MercadoPago, Ledger Append-Only en PostgreSQL (BIGINT para cents) y SETNX en Redis para Idempotencia. |
| 2026-06-09 | Fase 53 | Liquidacción de Custodia (Escrow Clearing): Take-Rate dinámico, Payouts simulados y Write-Through Balance Cache en Redis (`HINCRBY`). |
| 2026-06-09 | Fase 54 | The Bank-Grade Audit Vault: M2MAuditVault migrado a Particionamiento Declarativo (RANGE BY created_at) en PostgreSQL. Celery Worker (persist_attendance_event) con Outbox Inverso (FailedAuditJob) tolerante a fallas. |
| 2026-06-09 | HOTFIX | Incident Response SRE: Resolucin de dependencias OpenTelemetry en Frontend (Vite) y Crash Loop Crítico en Uvicorn (app.api.deps -> Inyecciones de dependencia directas). Refactor Endpoint JWT Auth. |
| 2026-06-10 | Fase 55 | Gamification Engine B2C: Worker Resiliente XREADGROUP, Atenuacción O(1), y UPSERT Atmico (ScoreCardVault). Refactor Semáóntico Preventivo (CoachingInterventionTrigger) para encuadre clínico. |
| 2026-06-10 | Fase 56 | Canario Alfa y Telemetría de Valor: Hybrid Kill Switch (Zustand + Redis), Motor Visual B2C (Shattering Glass Fallback CSS), Watchtower Interaction Snapshots B2B con Friccción Cogónitiva y Latency Audit ($D_{index}$). |
| 2026-06-10 | Fase 57 | Chaos Game Day (Resiliencia Financiera): Ataque inyectado con K6 (Doble Vía), Fast-Fail Backend (`pool_timeout=2`), y Sweeper de Reconciliacción Leaky Bucket LIFO/FIFO para MTTR automático sin Thundering Herd. |
| **2026-06-11** | **MILESTONE** | **🏦 TIER 2 FINANCIERO BLINDADO — Motor Transaccional de Grado Bancario validado bajo Chaos Engineering** |
| 2026-06-11 | Fase 58 | La Forja del Ledger (Transaccionalidad Confinada): Modelos `FinancialLedger` y `PurchaseIntent` en PostgreSQL (BIGINT + UniqueConstraint). Idempotencia Redis SETNX en `checkout.py`. CRUD financiero con `tenant_id` posicional obligatorio. Migracción Alembic `43f6e3ca132e`. |
| 2026-06-11 | Fase 59 | Chaos Game Day Fase 2 — Operacción "Ledger Bajo Fuego": Asedio 500 VUs × 45s con `idempotency_key` estático. `docker stop redis-core` al segundo 15. Resultados: 201=1 (EXACTO), 409=21,438, 503=842, 500=0. Defensa en Profundidad validada (Redis → PostgreSQL → Connection Pool). |
| 2026-06-11 | Fase 60 | Resolucción de Bifurcacción JWT (Escenario B.1): `asyncio.run_in_executor` para offload de `jwt.decode` del Event Loop. Baseline P95=308ms confirmó saturacción GIL. Offload a ThreadPoolExecutor ónativo para liberar el bucle asíncrono. |
| 2026-06-12 | Fase 61 | Real-Time Fabric (WebSocket + Redis Pub/Sub): `ConnectionManager` multi-tenant, Zero-Trust WS Router con JWT vía Query Params, `useCanvasWebSocket` con Batch & Collapse (Debouncing/Buffer anti-saturacción hedóónica). Latencia E2E validada: 127ms (Doherty < 400ms). |
| 2026-06-12 | Fase 62 | Borde Físico O2O (TOTP & Trojan Horse): Destruccción del mock de cámara en `/recepcion/escaner`. Integracción `Html5QrcodeScanner` con `ónavigator.mediaDevices`. Generacción Offline-First de QR (RFC 6238 TOTP, semilla derivada `HMAC_SHA256(SECRET_KEY, user_id)`). Ventana de tolerancia $\pm 30s$ para Clock Drift. Emiscin de evento `ACCESS_GRANTED` vía Redis Pub/Sub al WebSocket del Tenant. |
| 2026-06-12 | Fase 63 | Cerrojo Financiero (Glassmorphic Soft-Lock): Endpoint `POST /api/v1/protocols` con validacción de límite de suscripcción B2B (`MAX_ATHLETES_TIER_1` env var). HTTP 402 `SEATS_EXHAUSTED` interceptado localmente en `usePlanBuilderMutations.ts` (aislado del interceptor global 402 de mora). Componente `GlassmorphicSoftLock.tsx` con upsell premium. Endpoint `simulate-b2b-upgrade` con Trifecta (SETNX + LedgerEntry + Subscription Update). Evento `PAYWALL_ABANDONED` para PLG retargeting. |
- **Vector 2 (DietQA):** Celery/Redis Worker + LLM Vision (Pydantic + Confidence Scores > 85%).
- **Vector 3 (Resiliencia):** Exponential Backoff (3 retries), DLQ, Anti-DoW (límite 5MB), Data Scoping en SSE.
- **UI:** Integracción con `ClinicalBentoLayout` y alertas SSE (Ámbar `NEEDS_MANUAL_REVIEW`, Verde `AUTO-VALIDATED`).

---

### ✅ FASE 19: Arsenal Biomecáónico y S3 Edge Upload — COMPLETADA

**Objetivo:** Erradicar mocks en `/library` y `/assets` y proveer al PT la habilidad de subir su propia propiedad intelectual (videos de técnica) a la bveda.

- **Frontend:** Implementado `useExercises` con TanStack Query, reemplazando `DUMMY_EXERCISES`. Implementado S3 Edge Upload para subida de videos directo a CloudFront/S3, evitando el backend.
- **Backend:** Creado CRUD en `exercises_routes.py` soportando ejercicios Globales vs Privados (`is_global`, `trainer_id`).
- **CDN:** Estrategia HTTP 206 (Byte-Range Requests) para mobile, evitando transcoding pesado.

---

### ✅ FASE 20: Churn Risk Index (CRI) Engine & Telemetría (CQRS) — COMPLETADA

**Objetivo:** Erradicar mocks del Watchtower Dashboard y predecir el Churn B2B2C en tiempo real mediante telemetría biométrica, protegiendo la carga cognitiva del profesional.

- **Algoritmo CRI V1:** Inactividad (45%), Fatiga Central RPE/ACWR (35%), Desconexcin Clíónica (20%).
- **Arquitectura CQRS:**  - **Write Path:** PostgreSQL `M2MAuditVault` as source of truth.  - **Incremental Aggregation:** `cri_worker.py` (Celery) trigger asíncrono desde endpoints clíónicos y biomecáónicos.  - **Read Path O(1):** Redireccción de lectura a `Redis DB 1` (`HGETALL`). Dashboard re-renderiza con cero requests SQL.
- **Debouncing y Estado Mutante:** Bloqueo de Nudges por 48h (Yellow). "State-Change Override": Si salta a Red, ignora el candado y envía alerta.
- **Resiliencia (Vogels):** Script `rebuild_cri_cache.py` para re-hidratar Redis DB 1 desde el historial PostgreSQL.

---

### ✅ FASE 21: Swap Engine (Copiloto Operativo B2B2C) — COMPLETADA

**Objetivo:** Reducir la friccción cognitiva del entrenador B2B implementando un motor de sugerencias adaptativas determinista basado en telemetría (SNC, DOMS, RPE).

- **Motor Determinista:** `SwapEngineService` implementado. Evita IA generativa (RAG) para garantizar cero alucinaciones y ~0ms de latencia.
- **Gatillos Heurísticos (Jerárquicos):**  1. *Fatiga SNC* (Sueño < 5h + Estrés Alto) -> Muta ejercicios axiales a aislamiento.  2. *DOMS Agudo* -> Muta a Recuperacción Activa.  3. *RPE Mismatch* (RPE >= 9 vs target) -> Reduce volumen 20%.
- **Celery Asíóncrono:** Conectado directamente a `cri_worker.py`. Si el riesgo salta a RED/YELLOW, el borrador se pre-calcula en segundo plano.
- **Idempotencia y Drift Protocol:** Endpoint `/drafts/{id}/approve` inválida la caché de la PWA del atleta mutando el JSONB de su rutina.
- **UI:** Inyeccción del componente `SwapActionPanel` en el Watchtower B2B ("Aprobar con 1-clic").

### ✅ FASE 22: Intelligent Inbox & Erradicacción de Fragmentacción (SPA) — COMPLETADA

**Objetivo:** Erradicar la fragmentacción del DOM superior, establecer rutas anidadas (SPA pura) y consolidar el Inbox B2B con respuestas deterministas (Zero-AI).

- **SPA Architecture:** Refactor masivo de `App.tsx`. Creacción de `AppLayout.tsx` para persistir Sidebar y Contextos, evitando la destruccción y re-renderizado del DOM al cambiar de vista.
- **Intelligent Inbox (SSE):** Sustitucción del polling REST por `EventSource` (Server-Sent Events) en `useIntelligentInbox.ts`.
- **Quick-Replies (1-Click UX):** Reemplazo de inputs de texto libre por botones deterministas atmicos ("Ajustar Biomecáónica", "Deload", "Igónorar"). 
- **Compensate & Reconcile:** Implementacción de `onMutate` y `onError` en React Query para optimismo determinista y mitigacción de latencia.

---

### ✅ FASE 23: Offline Mutation Queue (Enterprise-Grade) — COMPLETADA

**Objetivo:** Construir una cola de mutaciones asíncrona resistente a pérdida de red, garantizando la integridad de datos transaccionales.

- **Aislamiento Seguro (`offlineDb.ts` V2):** Inyeccción del almacéón `queryClientStore` para evitar colisiones con la telemetría del atleta.
- **Adapter TanStack:** Creacción de `tanstackPersister.ts` para conectar `@tanstack/react-query-persist-client` a IndexedDB.
- **Idempotencia Criptográfica:** Uso de `crypto.randomUUID()` puro en frontend para evitar colisiones por concurrencia milimétrica (adis a `Date.ónow()`).
- **DLQ y Poda Estricta:** `MutationCache` intercepta reintentos fallidos y despacha a la Bveda Inmutable (M2MAuditVault). Uso de `dehydrateOptions` para excluir queries volátiles (como analyticas) y un TTL rígido de 24 horas.

### ✅ FASE 24: Adquisicción B2B2C e Inyeccción de Identidad (Magic Link) — COMPLETADA

**Objetivo:** Eliminar la friccción de contraseñas en el onboarding del cliente final, permitiendo la atribucción automática al entrenador.

- **Magic Link Generation:** Creacción de tokens JWT efímeros firmados.
- **Auto-Atribucción:** El atleta queda vinculado automáticamente a la cuenta del entrenador que envió el link.
- **UX Zero-Friction:** Despliegue de vistas (Landing, Processing, Success) para resolver la adquisicción en 1 clic.

---

### ✅ FASE 25: Seguridad Cross-Device e Invalidacción de Sescin — COMPLETADA

**Objetivo:** Proveer seguridad de grado empresarial para la identidad, asegurando mitigacción de Bot-Clicks y revocacción de acceso global.

- **Soft-2FA vs 1-Click:** Remocción del cdigo de 4 dígitos para priorizar una UX fluida mediante un botóón atmico "Confirmar Acceso".
- **Invalidacción Global $O(1)$:** Implementacción de `session_version` en PostgreSQL. Al incrementar la verscin, todos los tokens previos mueren instantáóneamente.
- **Blocklist Granular Redis:** Lista ónegra efímera para revocacción explícita de tokens (cerrar sescin en un dispositivo específico).

---

### ✅ FASE 26: El Pipeline del Math Engine (Núcleo Biomecáónico Asíóncrono) — COMPLETADA

**Objetivo:** Transformar la telemetría cruda en inteligencia clíónica (e1RM, ACWR, Fatiga) sin bloquear el Hilo Principal (Event Loop).

- **Capa de Dominio Pura:** Extraccción de frmulas matemáticas agónsticas (Brzycki, Epley, ACWR, Decaimiento SNC) a `app/domain/math_engine/`.
- **Offloading Inteligente (`asyncio.to_thread`):** Ejecucción de cargas intensivas de CPU fuera del bucle de eventos de FastAPI mediante `BackgroundTasks`.
- **Resiliencia Automática (Sweeper):** Implementacción de un "Garbage Collector" (`reconcile_orphaned_workouts`) para capturar sesiones estancadas en estado `PENDING` tras caídas del servidor.
- **Endpoint Reactivo:** Ingesta en `POST /api/v1/telemetry/workout` respondiendo 202 Accepted.

---

### ✅ FASE 27: Testing y Resiliencia del Math Engine (Laboratorio y Caos) — COMPLETADA

**Objetivo:** Someter el ecosistema concurrente a pruebas exhaustivas para garantizar la paridad con produccción y la tolerancia a fallos.

- **Aislamiento Transaccional:** Configuracción de `pytest-asyncio` utilizando `SAVEPOINT`s (rollbacks automáticos por cada test) para probar la API sin contaminar PostgreSQL.
- **Frente 1 (Laboratorio):** Pruebas unitarias al dominio puro (e1RM exacto, ACWR, decaimiento exponencial SNC).
- **Frente 2 (La Trinchera):** Pruebas de integracción validando el endpoint `POST /api/v1/telemetry/workout` (`202 Accepted`).
- **Frente 3 (Ingeniería de Caos):** Simulacción controlada de crasheo asíncrono para verificar que el `Sweeper` recupera y procesa sesiones "huérfanas" (Self-Healing).

## Verification Plan

### Automated Tests
- `ónpx tsc --ónoEmit` → ✅ PASÓ (Fase 1 a 23)
- `ónpm run dev` → ✅ Vite arranca sin errores (Fase 1 a 23)
- Swagger OpenAPI Dump → ✅ Verificado que el esquema Pydantic expone correctamente `CogónitiveTranslationPayload` idéóntico al contrato TypeScript (Fase 5 - Día 1).
- Alembic migrations → ✅ 30 migraciones aplicadas exitosamente (desde `001_initial_schema` hasta `9c1cb12b46d7_phase_16_drift_protocol`).
- [PENDIENTE] Suite E2E Playwright: usuario Clinical → `/b2c/onboarding-clinico`.

### Performance Targets (Fase 2, 3 & 15)
- INP < 150ms durante carga de PDF de 5 páginas → Worker aísla 100% del cmputo.
- Main Thread Blocking Time = 0ms desde librería OCR → Validar con Chrome DevTools.
- Zero-Reconciliation CountUp: React óno detecta renders adicionales en RevenueGuard.
- Redis Cache Hit: < 5ms para `GET /routine/today` tras primera carga (Read-Through).

### Manual Verification
- QA UX/UI: Zero flashes de Dark Mode en vistas clíónicas (Marfil + Bento).
- Validar que el bypass Human-in-the-Loop (Firma Legal) persiste datos en la bveda (Fase 5 - Día 3).
- Validar Drift Protocol: Completar sets offline, mutar protocolo en servidor, reconectar y verificar `is_unscheduled=True`.

---

## Changelog

| Fecha | Fase | Accción |
|-------|------|--------|
| 2026-06-03 | Fase 1 | ClinicalOnboardingWizard creado, ruta inyectada, Canvas conectado a API |
| 2026-06-03 | Fase 2 | OCR Worker + ClinicalBentoLayout creados, SmartLabReader reemplazado |
| 2026-06-04 | Fase 3 | Convergencia Frontend (Labor Illusion & XAI). Cerebro Clínico en FastAPI (clinical_engine.py) validado vía TDD. XAI UI en Zustand con tooltips Glassmorphic, latencia cero para Undo y telemetría pasiva GA4. Diseño Premium Teal. |
| 2026-06-04 | Fase 4 | Extraccción slida de PeriodizationEngine. Eliminacción de cdigo muerto (TypeScript 0-error) |
| 2026-06-04 | Fase 5 | Día 1: Contratos congelados en Pydantic (`clinical.py`) y OpenAPI validado para OVS 1b y 3 |
| 2026-06-04 | Fase 6 | FinOps Cogónitivo: Zero-AI Tracker, Telemetry Bypass |
| 2026-06-04 | Fase 7 | Hitos A/B/C: APIs fundacionales de Athletes, Patients, Protocols |
| 2026-06-04 | Fases 8-12 | CommandCenter RBAC, PlanBuilder Modo Excel, Dashboard Metrics |
| 2026-06-05 | Fase 13 | Offline-First: IndexedDB Outbox, routineCache TTL 24h, migracción legacy |
| 2026-06-05 | Fase 14 | Idempotencia: `idempotency_key` UNIQUE, Append-Only Log cronolgico |
| 2026-06-05 | Fase 15 | Redis Read-Through Cache, Distributed Locks, acotacción por `protocol_id` |
| 2026-06-05 | Fase 16 | Drift Protocol: `is_unscheduled`, `M2MAuditVault`, DLQ telemetry, bifurcacción Fuerza vs Fatiga |
| 2026-06-06 | Fase 17 | Triaje B2B $O(1)$, erradicacción de mocks en Command Center, estado `CALCULATING`, fix `useAuth` |
| **2026-06-06** | **MILESTONE** | **❄️ TIER 1 BIOMECÁNICO CONGELADO — Core estable y listo para Tiers 2 y 3** |
| 2026-06-06 | Fase 18 | Ecosistema DietQA Operativo (Celery, LLM Vision, S3 Presigned POST, SSE Data Scoping) |
| **2026-06-06** | **MILESTONE** | **🛡️ AUDITORÍA DE RESILIENCIA APROBADA (FinOps, iOS Fallback, DLQ)** |
| 2026-06-06 | Fase 19 | Arsenal Biomecáónico: TanStack Query CRUD de ejercicios, S3 Edge Upload con URLs pre-firmadas, y soporte de streaming mobile vía HTTP 206 Byte-Range. |
| 2026-06-06 | Fase 20 | Motor CRI y CQRS en Redis DB 1, Debouncing mutante, Watchtower Dashboard operando en O(1) |
| 2026-06-06 | Fase 21 | Swap Engine (Copiloto Operativo B2B2C): Mutacción determinista 1-clic, Gatillos SNC/DOMS/RPE, Idempotencia. |
| 2026-06-06 | Fase 22 | Intelligent Inbox: Rutas Anidadas (SPA Pura), EventSource (SSE), Optimistic UI y Quick-Replies |
| 2026-06-06 | Fase 23 | Offline Mutation Queue: Persistencia TanStack en IDB V2, DLQ Telemetry, crypto.randomUUID |
| 2026-06-07 | Fase 24 | Adquisicción B2B2C e Inyeccción de Identidad (Magic Link Generation y UX Zero-Friction) |
| 2026-06-07 | Fase 25 | Seguridad Cross-Device e Invalidacción (Confirmar Acceso, `session_version` $O(1)$, Blocklist Redis) |
| 2026-06-07 | Fase 26 | Pipeline Math Engine (Capa de Dominio, Offloading Inteligente con `asyncio.to_thread` y Sweeper `reconcile_orphaned_workouts`) |
| **2026-06-07** | **MILESTONE** | **🧪 AUDITORÍA DE PRUEBAS APROBADA (Math Engine Blindado al 100%)** |
| 2026-06-07 | Fase 27 | Testing y Resiliencia (Transacciones anidadas `pytest-asyncio`, Frente de Dominio, Integracción API 202 y Caos Sweeper) |
| 2026-06-07 | Fase 28 | Consolidacción PWA y Optimizacción Bundle (Code Splitting, `vite-plugin-pwa`, iOS Meta Tags, "Prompt for Update") |
| 2026-06-07 | Fase 29 | Offline Mutations & Optimistic UI (Reconciliacción a Nivel Entidad, TTL 72h IDB, Idempotencia de BD con `200 OK`) |
| 2026-06-07 | Fase 30 | Growth & Squads (Gamificacción B2B2C, Activity Feed, Fan-Out on Write Redis, Cursor Pagination, Optimistic UI en Frontend) |
| 2026-06-07 | Fase 31 | Growth Analytics Engine (Motor Viral, Celery Queue Partitioning, MVs con REFRESH CONCURRENTLY, Matriz de Intervencción B2B) |
| 2026-06-07 | Fase 32 | Proactive Alerting Engine (Dopamine Hooks, Delivery Multi-Canal (Mock Courier), DLQ Celery, Idempotencia DDL, Open/Click Tracking) |
| 2026-06-07 | Fase 33 | Dashboard de Eficacia de Intervencción Backend (Win-Back ROI, Control Groups, Máquina Estados Anti-Spam, Deteccción Drift) |
| 2026-06-07 | Fase 34 | Capability Gating y B2B Impact Dashboard (PLG, Feature Flags, Billing Models, Exportacción PNG Viral) |
| 2026-06-08 | Fase 35 | Action Cards y Motor Proactivo (Inferencia Determinística, Deep-Links WhatsApp, Feedback Loop Data Science) |
| 2026-06-08 | Fase 36 | Zero-AI Data Capture B2C: Embudos clíónicos deterministas (`GutHealthStatus`), Worker `dietqa_worker.py` y Consistencia Eventual. |
| 2026-06-08 | Fase 37 | Frontend Atleta Zero-Mocks: Hidratacción real con `WorkoutHistorySummary` y resolucción Anti-N+1 con `selectinload`. |
| 2026-06-08 | Fase 38 | Infraestructura Financiera Inmune: MRR Endpoint, Webhooks con `SETNX` en Redis (Defense in Depth) e Integracción UI en Dashboard. |
| 2026-06-08 | Fase 39 | Workspace Nutricción B2B: Arquetipos metablicos (JSONB + Pydantic) y Cache Key Salting (Hash criptográfico) evitando bloqueos O(N). |
| 2026-06-08 | Fase 40 | Bveda Bento y OCR: Strategy Pattern para OCR Mock asíncrono (Celery), Quarantine Vault (HITL) y Erradicacción de Mocks de UI. |
| 2026-06-08 | Fase 41 | Multiplicador de Fuerza (DevOps & CI/CD): Muro de contencción con Husky/lint-staged (Ruff), Pipelines Asimétricos y Playwright E2E. |
| 2026-06-08 | Fase 42 | Visibilidad de Cristal (Observabilidad y SRE): OTel Collector local, Tail-based Sampling, Trace Propagation (React fetch) a LGTM Stack. |
| 2026-06-08 | Fase 43 | Motor de Agendamiento B2B2C (Concurrencia Optimista): Capa de Dominio (Resource, ClassSession), Bloqueo Optimista automático, y Orquestacción Asíóncrona (Celery). |
| 2026-06-08 | Fase 44 | Integracción UI (Dashboards B2B/B2C): Command Center B2B, ScheduleGrid mediante CSS Grid puro, Pessimistic UI y Graceful Degradation ante Conflictos 409. |
| 2026-06-09 | Fase 45 | Attendance Engine (Físico a Digital): Ephemeral QR Atleta B2C con JWT rotativos 30s. Recepcción B2B con `Html5QrcodeScanner` y Mutacción Optimista + Debounce 60FPS. |
| 2026-06-09 | Fase 46 | Churn Risk Index (CRI) Engine: Motor predictivo matemático puro `cri_engine.py` para análisis de abandono, offloaded a Celery ónocturno (Operativa B2B). |
| 2026-06-09 | Fase 47 | Inverscin de Dependencias (Notification OCP): Abstraccción agónstica de ActionCards (External vs Internal Links) asegurando Vendor Lock-in a futuro. |
| **2026-06-09** | **MILESTONE** | **🎯 CHOQUE DE USABILIDAD APROBADO (Resiliencia SRE Frontend & Validating Empty States)** |
| 2026-06-09 | Fase 48 | Aislamiento de Radio de Exploscin (`LocalErrorBoundary`), Skeletons anti-CLS y Vacío Psicolgico ("Revenue Guard" retention stats) para B2B. |
| 2026-06-09 | Fase 49 | Zero-Trust UI & RBAC Core: Identidad inyectada en JWT Claims (`role`, `tenant_id`) validada localmente en latencia O(1). Matriz de Capacidades frontend sin I/O a base de datos. |
| 2026-06-09 | Fase 49B| O2O Workflow & Redis Celery Persistence: `sweep_óno_shows` en Celery con PostgreSQL `with_for_update(skip_locked=True)`, Pipelines atmicos en Redis (`cri:{tenant_id}:{user_id}:{metric}`). |
| 2026-06-09 | Fase 50 | B2B2C Concurrency Core (Waitlist State Machine): Orquestacción de Lista de Espera con ventana efímera (OFFERED) y control transaccional PostgreSQL. |
| 2026-06-09 | Fase 51 | Command Center Polish: Optimistic UI para listas pasivas, Prevencción Anti-CLS en visualizadores y Modal Global Inceptor de Conflictos (409). |
| 2026-06-09 | Fase 52 | Suscripciones Inmunes Webhook-to-Ledger: Pasarela MercadoPago, Ledger Append-Only en PostgreSQL (BIGINT para cents) y SETNX en Redis para Idempotencia. |
| 2026-06-09 | Fase 53 | Liquidacción de Custodia (Escrow Clearing): Take-Rate dinámico, Payouts simulados y Write-Through Balance Cache en Redis (`HINCRBY`). |
| 2026-06-09 | Fase 54 | The Bank-Grade Audit Vault: M2MAuditVault migrado a Particionamiento Declarativo (RANGE BY created_at) en PostgreSQL. Celery Worker (persist_attendance_event) con Outbox Inverso (FailedAuditJob) tolerante a fallas. |
| 2026-06-09 | HOTFIX | Incident Response SRE: Resolucin de dependencias OpenTelemetry en Frontend (Vite) y Crash Loop Crítico en Uvicorn (app.api.deps -> Inyecciones de dependencia directas). Refactor Endpoint JWT Auth. |
| 2026-06-10 | Fase 55 | Gamification Engine B2C: Worker Resiliente XREADGROUP, Atenuacción O(1), y UPSERT Atmico (ScoreCardVault). Refactor Semáóntico Preventivo (CoachingInterventionTrigger) para encuadre clínico. |
| 2026-06-10 | Fase 56 | Canario Alfa y Telemetría de Valor: Hybrid Kill Switch (Zustand + Redis), Motor Visual B2C (Shattering Glass Fallback CSS), Watchtower Interaction Snapshots B2B con Friccción Cogónitiva y Latency Audit ($D_{index}$). |
| 2026-06-10 | Fase 57 | Chaos Game Day (Resiliencia Financiera): Ataque inyectado con K6 (Doble Vía), Fast-Fail Backend (`pool_timeout=2`), y Sweeper de Reconciliacción Leaky Bucket LIFO/FIFO para MTTR automático sin Thundering Herd. |
| **2026-06-11** | **MILESTONE** | **🏦 TIER 2 FINANCIERO BLINDADO — Motor Transaccional de Grado Bancario validado bajo Chaos Engineering** |
| 2026-06-11 | Fase 58 | La Forja del Ledger (Transaccionalidad Confinada): Modelos `FinancialLedger` y `PurchaseIntent` en PostgreSQL (BIGINT + UniqueConstraint). Idempotencia Redis SETNX en `checkout.py`. CRUD financiero con `tenant_id` posicional obligatorio. Migracción Alembic `43f6e3ca132e`. |
| 2026-06-11 | Fase 59 | Chaos Game Day Fase 2 — Operacción "Ledger Bajo Fuego": Asedio 500 VUs × 45s con `idempotency_key` estático. `docker stop redis-core` al segundo 15. Resultados: 201=1 (EXACTO), 409=21,438, 503=842, 500=0. Defensa en Profundidad validada (Redis → PostgreSQL → Connection Pool). |
| 2026-06-11 | Fase 60 | Resolucción de Bifurcacción JWT (Escenario B.1): `asyncio.run_in_executor` para offload de `jwt.decode` del Event Loop. Baseline P95=308ms confirmó saturacción GIL. Offload a ThreadPoolExecutor ónativo para liberar el bucle asíncrono. |
| 2026-06-12 | Fase 61 | Real-Time Fabric (WebSocket + Redis Pub/Sub): `ConnectionManager` multi-tenant, Zero-Trust WS Router con JWT vía Query Params, `useCanvasWebSocket` con Batch & Collapse (Debouncing/Buffer anti-saturacción hedóónica). Latencia E2E validada: 127ms (Doherty < 400ms). |
| 2026-06-12 | Fase 62 | Borde Físico O2O (TOTP & Trojan Horse): Destruccción del mock de cámara en `/recepcion/escaner`. Integracción `Html5QrcodeScanner` con `ónavigator.mediaDevices`. Generacción Offline-First de QR (RFC 6238 TOTP, semilla derivada `HMAC_SHA256(SECRET_KEY, user_id)`). Ventana de tolerancia $\pm 30s$ para Clock Drift. Emiscin de evento `ACCESS_GRANTED` vía Redis Pub/Sub al WebSocket del Tenant. |
| 2026-06-12 | Fase 63 | Cerrojo Financiero (Glassmorphic Soft-Lock): Endpoint `POST /api/v1/protocols` con validacción de límite de suscripcción B2B (`MAX_ATHLETES_TIER_1` env var). HTTP 402 `SEATS_EXHAUSTED` interceptado localmente en `usePlanBuilderMutations.ts` (aislado del interceptor global 402 de mora). Componente `GlassmorphicSoftLock.tsx` con upsell premium. Endpoint `simulate-b2b-upgrade` con Trifecta (SETNX + LedgerEntry + Subscription Update). Evento `PAYWALL_ABANDONED` para PLG retargeting. |
- **Vector 2 (DietQA):** Celery/Redis Worker + LLM Vision (Pydantic + Confidence Scores > 85%).
- **Vector 3 (Resiliencia):** Exponential Backoff (3 retries), DLQ, Anti-DoW (límite 5MB), Data Scoping en SSE.
- **UI:** Integracción con `ClinicalBentoLayout` y alertas SSE (Ámbar `NEEDS_MANUAL_REVIEW`, Verde `AUTO-VALIDATED`).

---

### ✅ FASE 19: Arsenal Biomecáónico y S3 Edge Upload — COMPLETADA

**Objetivo:** Erradicar mocks en `/library` y `/assets` y proveer al PT la habilidad de subir su propia propiedad intelectual (videos de técnica) a la bveda.

- **Frontend:** Implementado `useExercises` con TanStack Query, reemplazando `DUMMY_EXERCISES`. Implementado S3 Edge Upload para subida de videos directo a CloudFront/S3, evitando el backend.
- **Backend:** Creado CRUD en `exercises_routes.py` soportando ejercicios Globales vs Privados (`is_global`, `trainer_id`).
- **CDN:** Estrategia HTTP 206 (Byte-Range Requests) para mobile, evitando transcoding pesado.

---

### ✅ FASE 20: Churn Risk Index (CRI) Engine & Telemetría (CQRS) — COMPLETADA

**Objetivo:** Erradicar mocks del Watchtower Dashboard y predecir el Churn B2B2C en tiempo real mediante telemetría biométrica, protegiendo la carga cognitiva del profesional.

- **Algoritmo CRI V1:** Inactividad (45%), Fatiga Central RPE/ACWR (35%), Desconexcin Clíónica (20%).
- **Arquitectura CQRS:**  - **Write Path:** PostgreSQL `M2MAuditVault` as source of truth.  - **Incremental Aggregation:** `cri_worker.py` (Celery) trigger asíncrono desde endpoints clíónicos y biomecáónicos.  - **Read Path O(1):** Redireccción de lectura a `Redis DB 1` (`HGETALL`). Dashboard re-renderiza con cero requests SQL.
- **Debouncing y Estado Mutante:** Bloqueo de Nudges por 48h (Yellow). "State-Change Override": Si salta a Red, ignora el candado y envía alerta.
- **Resiliencia (Vogels):** Script `rebuild_cri_cache.py` para re-hidratar Redis DB 1 desde el historial PostgreSQL.

---

### ✅ FASE 21: Swap Engine (Copiloto Operativo B2B2C) — COMPLETADA

**Objetivo:** Reducir la friccción cognitiva del entrenador B2B implementando un motor de sugerencias adaptativas determinista basado en telemetría (SNC, DOMS, RPE).

- **Motor Determinista:** `SwapEngineService` implementado. Evita IA generativa (RAG) para garantizar cero alucinaciones y ~0ms de latencia.
- **Gatillos Heurísticos (Jerárquicos):**  1. *Fatiga SNC* (Sueño < 5h + Estrés Alto) -> Muta ejercicios axiales a aislamiento.  2. *DOMS Agudo* -> Muta a Recuperacción Activa.  3. *RPE Mismatch* (RPE >= 9 vs target) -> Reduce volumen 20%.
- **Celery Asíóncrono:** Conectado directamente a `cri_worker.py`. Si el riesgo salta a RED/YELLOW, el borrador se pre-calcula en segundo plano.
- **Idempotencia y Drift Protocol:** Endpoint `/drafts/{id}/approve` inválida la caché de la PWA del atleta mutando el JSONB de su rutina.
- **UI:** Inyeccción del componente `SwapActionPanel` en el Watchtower B2B ("Aprobar con 1-clic").

### ✅ FASE 22: Intelligent Inbox & Erradicacción de Fragmentacción (SPA) — COMPLETADA

**Objetivo:** Erradicar la fragmentacción del DOM superior, establecer rutas anidadas (SPA pura) y consolidar el Inbox B2B con respuestas deterministas (Zero-AI).

- **SPA Architecture:** Refactor masivo de `App.tsx`. Creacción de `AppLayout.tsx` para persistir Sidebar y Contextos, evitando la destruccción y re-renderizado del DOM al cambiar de vista.
- **Intelligent Inbox (SSE):** Sustitucción del polling REST por `EventSource` (Server-Sent Events) en `useIntelligentInbox.ts`.
- **Quick-Replies (1-Click UX):** Reemplazo de inputs de texto libre por botones deterministas atmicos ("Ajustar Biomecáónica", "Deload", "Igónorar"). 
- **Compensate & Reconcile:** Implementacción de `onMutate` y `onError` en React Query para optimismo determinista y mitigacción de latencia.

---

### ✅ FASE 23: Offline Mutation Queue (Enterprise-Grade) — COMPLETADA

**Objetivo:** Construir una cola de mutaciones asíncrona resistente a pérdida de red, garantizando la integridad de datos transaccionales.

- **Aislamiento Seguro (`offlineDb.ts` V2):** Inyeccción del almacéón `queryClientStore` para evitar colisiones con la telemetría del atleta.
- **Adapter TanStack:** Creacción de `tanstackPersister.ts` para conectar `@tanstack/react-query-persist-client` a IndexedDB.
- **Idempotencia Criptográfica:** Uso de `crypto.randomUUID()` puro en frontend para evitar colisiones por concurrencia milimétrica (adis a `Date.ónow()`).
- **DLQ y Poda Estricta:** `MutationCache` intercepta reintentos fallidos y despacha a la Bveda Inmutable (M2MAuditVault). Uso de `dehydrateOptions` para excluir queries volátiles (como analyticas) y un TTL rígido de 24 horas.

### ✅ FASE 24: Adquisicción B2B2C e Inyeccción de Identidad (Magic Link) — COMPLETADA

**Objetivo:** Eliminar la friccción de contraseñas en el onboarding del cliente final, permitiendo la atribucción automática al entrenador.

- **Magic Link Generation:** Creacción de tokens JWT efímeros firmados.
- **Auto-Atribucción:** El atleta queda vinculado automáticamente a la cuenta del entrenador que envió el link.
- **UX Zero-Friction:** Despliegue de vistas (Landing, Processing, Success) para resolver la adquisicción en 1 clic.

---

### ✅ FASE 25: Seguridad Cross-Device e Invalidacción de Sescin — COMPLETADA

**Objetivo:** Proveer seguridad de grado empresarial para la identidad, asegurando mitigacción de Bot-Clicks y revocacción de acceso global.

- **Soft-2FA vs 1-Click:** Remocción del cdigo de 4 dígitos para priorizar una UX fluida mediante un botóón atmico "Confirmar Acceso".
- **Invalidacción Global $O(1)$:** Implementacción de `session_version` en PostgreSQL. Al incrementar la verscin, todos los tokens previos mueren instantáóneamente.
- **Blocklist Granular Redis:** Lista ónegra efímera para revocacción explícita de tokens (cerrar sescin en un dispositivo específico).

---

### ✅ FASE 26: El Pipeline del Math Engine (Núcleo Biomecáónico Asíóncrono) — COMPLETADA

**Objetivo:** Transformar la telemetría cruda en inteligencia clíónica (e1RM, ACWR, Fatiga) sin bloquear el Hilo Principal (Event Loop).

- **Capa de Dominio Pura:** Extraccción de frmulas matemáticas agónsticas (Brzycki, Epley, ACWR, Decaimiento SNC) a `app/domain/math_engine/`.
- **Offloading Inteligente (`asyncio.to_thread`):** Ejecucción de cargas intensivas de CPU fuera del bucle de eventos de FastAPI mediante `BackgroundTasks`.
- **Resiliencia Automática (Sweeper):** Implementacción de un "Garbage Collector" (`reconcile_orphaned_workouts`) para capturar sesiones estancadas en estado `PENDING` tras caídas del servidor.
- **Endpoint Reactivo:** Ingesta en `POST /api/v1/telemetry/workout` respondiendo 202 Accepted.

---

### ✅ FASE 27: Testing y Resiliencia del Math Engine (Laboratorio y Caos) — COMPLETADA

**Objetivo:** Someter el ecosistema concurrente a pruebas exhaustivas para garantizar la paridad con produccción y la tolerancia a fallos.

- **Aislamiento Transaccional:** Configuracción de `pytest-asyncio` utilizando `SAVEPOINT`s (rollbacks automáticos por cada test) para probar la API sin contaminar PostgreSQL.
- **Frente 1 (Laboratorio):** Pruebas unitarias al dominio puro (e1RM exacto, ACWR, decaimiento exponencial SNC).
- **Frente 2 (La Trinchera):** Pruebas de integracción validando el endpoint `POST /api/v1/telemetry/workout` (`202 Accepted`).
- **Frente 3 (Ingeniería de Caos):** Simulacción controlada de crasheo asíncrono para verificar que el `Sweeper` recupera y procesa sesiones "huérfanas" (Self-Healing).

## Verification Plan

### Automated Tests
- `ónpx tsc --ónoEmit` → ✅ PASÓ (Fase 1 a 23)
- `ónpm run dev` → ✅ Vite arranca sin errores (Fase 1 a 23)
- Swagger OpenAPI Dump → ✅ Verificado que el esquema Pydantic expone correctamente `CogónitiveTranslationPayload` idéóntico al contrato TypeScript (Fase 5 - Día 1).
- Alembic migrations → ✅ 30 migraciones aplicadas exitosamente (desde `001_initial_schema` hasta `9c1cb12b46d7_phase_16_drift_protocol`).
- [PENDIENTE] Suite E2E Playwright: usuario Clinical → `/b2c/onboarding-clinico`.

### Performance Targets (Fase 2, 3 & 15)
- INP < 150ms durante carga de PDF de 5 páginas → Worker aísla 100% del cmputo.
- Main Thread Blocking Time = 0ms desde librería OCR → Validar con Chrome DevTools.
- Zero-Reconciliation CountUp: React óno detecta renders adicionales en RevenueGuard.
- Redis Cache Hit: < 5ms para `GET /routine/today` tras primera carga (Read-Through).

### Manual Verification
- QA UX/UI: Zero flashes de Dark Mode en vistas clíónicas (Marfil + Bento).
- Validar que el bypass Human-in-the-Loop (Firma Legal) persiste datos en la bveda (Fase 5 - Día 3).
- Validar Drift Protocol: Completar sets offline, mutar protocolo en servidor, reconectar y verificar `is_unscheduled=True`.

---

## Changelog

| Fecha | Fase | Accción |
|-------|------|--------|
| 2026-06-03 | Fase 1 | ClinicalOnboardingWizard creado, ruta inyectada, Canvas conectado a API |
| 2026-06-03 | Fase 2 | OCR Worker + ClinicalBentoLayout creados, SmartLabReader reemplazado |
| 2026-06-04 | Fase 3 | Convergencia Frontend (Labor Illusion & XAI). Cerebro Clínico en FastAPI (clinical_engine.py) validado vía TDD. XAI UI en Zustand con tooltips Glassmorphic, latencia cero para Undo y telemetría pasiva GA4. Diseño Premium Teal. |
| 2026-06-04 | Fase 4 | Extraccción slida de PeriodizationEngine. Eliminacción de cdigo muerto (TypeScript 0-error) |
| 2026-06-04 | Fase 5 | Día 1: Contratos congelados en Pydantic (`clinical.py`) y OpenAPI validado para OVS 1b y 3 |
| 2026-06-04 | Fase 6 | FinOps Cogónitivo: Zero-AI Tracker, Telemetry Bypass |
| 2026-06-04 | Fase 7 | Hitos A/B/C: APIs fundacionales de Athletes, Patients, Protocols |
| 2026-06-04 | Fases 8-12 | CommandCenter RBAC, PlanBuilder Modo Excel, Dashboard Metrics |
| 2026-06-05 | Fase 13 | Offline-First: IndexedDB Outbox, routineCache TTL 24h, migracción legacy |
| 2026-06-05 | Fase 14 | Idempotencia: `idempotency_key` UNIQUE, Append-Only Log cronolgico |
| 2026-06-05 | Fase 15 | Redis Read-Through Cache, Distributed Locks, acotacción por `protocol_id` |
| 2026-06-05 | Fase 16 | Drift Protocol: `is_unscheduled`, `M2MAuditVault`, DLQ telemetry, bifurcacción Fuerza vs Fatiga |
| 2026-06-06 | Fase 17 | Triaje B2B $O(1)$, erradicacción de mocks en Command Center, estado `CALCULATING`, fix `useAuth` |
| **2026-06-06** | **MILESTONE** | **❄️ TIER 1 BIOMECÁNICO CONGELADO — Core estable y listo para Tiers 2 y 3** |
| 2026-06-06 | Fase 18 | Ecosistema DietQA Operativo (Celery, LLM Vision, S3 Presigned POST, SSE Data Scoping) |
| **2026-06-06** | **MILESTONE** | **🛡️ AUDITORÍA DE RESILIENCIA APROBADA (FinOps, iOS Fallback, DLQ)** |
| 2026-06-06 | Fase 19 | Arsenal Biomecáónico: TanStack Query CRUD de ejercicios, S3 Edge Upload con URLs pre-firmadas, y soporte de streaming mobile vía HTTP 206 Byte-Range. |
| 2026-06-06 | Fase 20 | Motor CRI y CQRS en Redis DB 1, Debouncing mutante, Watchtower Dashboard operando en O(1) |
| 2026-06-06 | Fase 21 | Swap Engine (Copiloto Operativo B2B2C): Mutacción determinista 1-clic, Gatillos SNC/DOMS/RPE, Idempotencia. |
| 2026-06-06 | Fase 22 | Intelligent Inbox: Rutas Anidadas (SPA Pura), EventSource (SSE), Optimistic UI y Quick-Replies |
| 2026-06-06 | Fase 23 | Offline Mutation Queue: Persistencia TanStack en IDB V2, DLQ Telemetry, crypto.randomUUID |
| 2026-06-07 | Fase 24 | Adquisicción B2B2C e Inyeccción de Identidad (Magic Link Generation y UX Zero-Friction) |
| 2026-06-07 | Fase 25 | Seguridad Cross-Device e Invalidacción (Confirmar Acceso, `session_version` $O(1)$, Blocklist Redis) |
| 2026-06-07 | Fase 26 | Pipeline Math Engine (Capa de Dominio, Offloading Inteligente con `asyncio.to_thread` y Sweeper `reconcile_orphaned_workouts`) |
| **2026-06-07** | **MILESTONE** | **🧪 AUDITORÍA DE PRUEBAS APROBADA (Math Engine Blindado al 100%)** |
| 2026-06-07 | Fase 27 | Testing y Resiliencia (Transacciones anidadas `pytest-asyncio`, Frente de Dominio, Integracción API 202 y Caos Sweeper) |
| 2026-06-07 | Fase 28 | Consolidacción PWA y Optimizacción Bundle (Code Splitting, `vite-plugin-pwa`, iOS Meta Tags, "Prompt for Update") |
| 2026-06-07 | Fase 29 | Offline Mutations & Optimistic UI (Reconciliacción a Nivel Entidad, TTL 72h IDB, Idempotencia de BD con `200 OK`) |
| 2026-06-07 | Fase 30 | Growth & Squads (Gamificacción B2B2C, Activity Feed, Fan-Out on Write Redis, Cursor Pagination, Optimistic UI en Frontend) |
| 2026-06-07 | Fase 31 | Growth Analytics Engine (Motor Viral, Celery Queue Partitioning, MVs con REFRESH CONCURRENTLY, Matriz de Intervencción B2B) |
| 2026-06-07 | Fase 32 | Proactive Alerting Engine (Dopamine Hooks, Delivery Multi-Canal (Mock Courier), DLQ Celery, Idempotencia DDL, Open/Click Tracking) |
| 2026-06-07 | Fase 33 | Dashboard de Eficacia de Intervencción Backend (Win-Back ROI, Control Groups, Máquina Estados Anti-Spam, Deteccción Drift) |
| 2026-06-07 | Fase 34 | Capability Gating y B2B Impact Dashboard (PLG, Feature Flags, Billing Models, Exportacción PNG Viral) |
| 2026-06-08 | Fase 35 | Action Cards y Motor Proactivo (Inferencia Determinística, Deep-Links WhatsApp, Feedback Loop Data Science) |
| 2026-06-08 | Fase 36 | Zero-AI Data Capture B2C: Embudos clíónicos deterministas (`GutHealthStatus`), Worker `dietqa_worker.py` y Consistencia Eventual. |
| 2026-06-08 | Fase 37 | Frontend Atleta Zero-Mocks: Hidratacción real con `WorkoutHistorySummary` y resolucción Anti-N+1 con `selectinload`. |
| 2026-06-08 | Fase 38 | Infraestructura Financiera Inmune: MRR Endpoint, Webhooks con `SETNX` en Redis (Defense in Depth) e Integracción UI en Dashboard. |
| 2026-06-08 | Fase 39 | Workspace Nutricción B2B: Arquetipos metablicos (JSONB + Pydantic) y Cache Key Salting (Hash criptográfico) evitando bloqueos O(N). |
| 2026-06-08 | Fase 40 | Bveda Bento y OCR: Strategy Pattern para OCR Mock asíncrono (Celery), Quarantine Vault (HITL) y Erradicacción de Mocks de UI. |
| 2026-06-08 | Fase 41 | Multiplicador de Fuerza (DevOps & CI/CD): Muro de contencción con Husky/lint-staged (Ruff), Pipelines Asimétricos y Playwright E2E. |
| 2026-06-08 | Fase 42 | Visibilidad de Cristal (Observabilidad y SRE): OTel Collector local, Tail-based Sampling, Trace Propagation (React fetch) a LGTM Stack. |
| 2026-06-08 | Fase 43 | Motor de Agendamiento B2B2C (Concurrencia Optimista): Capa de Dominio (Resource, ClassSession), Bloqueo Optimista automático, y Orquestacción Asíóncrona (Celery). |
| 2026-06-08 | Fase 44 | Integracción UI (Dashboards B2B/B2C): Command Center B2B, ScheduleGrid mediante CSS Grid puro, Pessimistic UI y Graceful Degradation ante Conflictos 409. |
| 2026-06-09 | Fase 45 | Attendance Engine (Físico a Digital): Ephemeral QR Atleta B2C con JWT rotativos 30s. Recepcción B2B con `Html5QrcodeScanner` y Mutacción Optimista + Debounce 60FPS. |
| 2026-06-09 | Fase 46 | Churn Risk Index (CRI) Engine: Motor predictivo matemático puro `cri_engine.py` para análisis de abandono, offloaded a Celery ónocturno (Operativa B2B). |
| 2026-06-09 | Fase 47 | Inverscin de Dependencias (Notification OCP): Abstraccción agónstica de ActionCards (External vs Internal Links) asegurando Vendor Lock-in a futuro. |
| **2026-06-09** | **MILESTONE** | **🎯 CHOQUE DE USABILIDAD APROBADO (Resiliencia SRE Frontend & Validating Empty States)** |
| 2026-06-09 | Fase 48 | Aislamiento de Radio de Exploscin (`LocalErrorBoundary`), Skeletons anti-CLS y Vacío Psicolgico ("Revenue Guard" retention stats) para B2B. |
| 2026-06-09 | Fase 49 | Zero-Trust UI & RBAC Core: Identidad inyectada en JWT Claims (`role`, `tenant_id`) validada localmente en latencia O(1). Matriz de Capacidades frontend sin I/O a base de datos. |
| 2026-06-09 | Fase 49B| O2O Workflow & Redis Celery Persistence: `sweep_óno_shows` en Celery con PostgreSQL `with_for_update(skip_locked=True)`, Pipelines atmicos en Redis (`cri:{tenant_id}:{user_id}:{metric`). |
| 2026-06-09 | Fase 50 | B2B2C Concurrency Core (Waitlist State Machine): Orquestacción de Lista de Espera con ventana efímera (OFFERED) y control transaccional PostgreSQL. |
| 2026-06-09 | Fase 51 | Command Center Polish: Optimistic UI para listas pasivas, Prevencción Anti-CLS en visualizadores y Modal Global Inceptor de Conflictos (409). |
| 2026-06-09 | Fase 52 | Suscripciones Inmunes Webhook-to-Ledger: Pasarela MercadoPago, Ledger Append-Only en PostgreSQL (BIGINT para cents) y SETNX en Redis para Idempotencia. |
| 2026-06-09 | Fase 53 | Liquidacción de Custodia (Escrow Clearing): Take-Rate dinámico, Payouts simulados y Write-Through Balance Cache en Redis (`HINCRBY`). |
| 2026-06-09 | Fase 54 | The Bank-Grade Audit Vault: M2MAuditVault migrado a Particionamiento Declarativo (RANGE BY created_at) en PostgreSQL. Celery Worker (persist_attendance_event) con Outbox Inverso (FailedAuditJob) tolerante a fallas. |
| 2026-06-09 | HOTFIX | Incident Response SRE: Resolucin de dependencias OpenTelemetry en Frontend (Vite) y Crash Loop Crítico en Uvicorn (app.api.deps -> Inyecciones de dependencia directas). Refactor Endpoint JWT Auth. |
| 2026-06-10 | Fase 55 | Gamification Engine B2C: Worker Resiliente XREADGROUP, Atenuacción O(1), y UPSERT Atmico (ScoreCardVault). Refactor Semáóntico Preventivo (CoachingInterventionTrigger) para encuadre clínico. |
| 2026-06-10 | Fase 56 | Canario Alfa y Telemetría de Valor: Hybrid Kill Switch (Zustand + Redis), Motor Visual B2C (Shattering Glass Fallback CSS), Watchtower Interaction Snapshots B2B con Friccción Cogónitiva y Latency Audit ($D_{index}$). |
| 2026-06-10 | Fase 57 | Chaos Game Day (Resiliencia Financiera): Ataque inyectado con K6 (Doble Vía), Fast-Fail Backend (`pool_timeout=2`), y Sweeper de Reconciliacción Leaky Bucket LIFO/FIFO para MTTR automático sin Thundering Herd. |
| **2026-06-11** | **MILESTONE** | **🏦 TIER 2 FINANCIERO BLINDADO — Motor Transaccional de Grado Bancario validado bajo Chaos Engineering** |
| 2026-06-11 | Fase 58 | La Forja del Ledger (Transaccionalidad Confinada): Modelos `FinancialLedger` y `PurchaseIntent` en PostgreSQL (BIGINT + UniqueConstraint). Idempotencia Redis SETNX en `checkout.py`. CRUD financiero con `tenant_id` posicional obligatorio. Migracción Alembic `43f6e3ca132e`. |
| 2026-06-11 | Fase 59 | Chaos Game Day Fase 2 — Operacción "Ledger Bajo Fuego": Asedio 500 VUs × 45s con `idempotency_key` estático. `docker stop redis-core` al segundo 15. Resultados: 201=1 (EXACTO), 409=21,438, 503=842, 500=0. Defensa en Profundidad validada (Redis → PostgreSQL → Connection Pool). |
| 2026-06-11 | Fase 60 | Resolucción de Bifurcacción JWT (Escenario B.1): `asyncio.run_in_executor` para offload de `jwt.decode` del Event Loop. Baseline P95=308ms confirmó saturacción GIL. Offload a ThreadPoolExecutor ónativo para liberar el bucle asíncrono. |
| 2026-06-12 | Fase 61 | Real-Time Fabric (WebSocket + Redis Pub/Sub): `ConnectionManager` multi-tenant, Zero-Trust WS Router con JWT vía Query Params, `useCanvasWebSocket` con Batch & Collapse (Debouncing/Buffer anti-saturacción hedóónica). Latencia E2E validada: 127ms (Doherty < 400ms). |
| 2026-06-12 | Fase 62 | Borde Físico O2O (TOTP & Trojan Horse): Destruccción del mock de cámara en `/recepcion/escaner`. Integracción `Html5QrcodeScanner` con `ónavigator.mediaDevices`. Generacción Offline-First de QR (RFC 6238 TOTP, semilla derivada `HMAC_SHA256(SECRET_KEY, user_id)`). Ventana de tolerancia $\pm 30s$ para Clock Drift. Emiscin de evento `ACCESS_GRANTED` vía Redis Pub/Sub al WebSocket del Tenant. |
| 2026-06-12 | Fase 63 | Cerrojo Financiero (Glassmorphic Soft-Lock): Endpoint `POST /api/v1/protocols` con validacción de límite de suscripcción B2B (`MAX_ATHLETES_TIER_1` env var). HTTP 402 `SEATS_EXHAUSTED` interceptado localmente en `usePlanBuilderMutations.ts` (aislado del interceptor global 402 de mora). Componente `GlassmorphicSoftLock.tsx` con upsell premium. Endpoint `simulate-b2b-upgrade` con Trifecta (SETNX + LedgerEntry + Subscription Update). Evento `PAYWALL_ABANDONED` para PLG retargeting. |
| **2026-06-12** | **MILESTONE** | **🟢 TIER 3 RETENCIÓN EN VIVO — Tejido de Tiempo Real (127ms E2E), Borde Físico O2O (TOTP + Cámara Nativa), y Cerrojo Financiero (Glassmorphic Soft-Lock) operativos** |
| 2026-06-13 | Fase 64 | DSI Engine & Intelligent Communication Hub: Motor DSI (`dsi_engine.py`) con heurística $O(1)$ determinista (Universal Baseline: Adherencia 40%, Modalidad 35%, Clíónica 25%). Toggle de Triviales en Watchtower con telemetría `ónavigator.sendBeacon` fire-and-forget a `/api/v1/telemetry/bypass` (persistencia inmutable en `M2MAuditVault` vía `BackgroundTasks` < 50ms). `ActionExecutor.ts` refactorizado para propagar `INTERNAL_CHAT` al `IntelligentInbox` con pre-poblado contextual. Campo de mensajería manual con `sendMessageMutation` (TanStack Query Optimistic UI + Offline Mutation Queue en IndexedDB). WhatsApp erradicado del flujo de intervencción. Matriz de Umbrales Críticos UAT preparada (Shadow Mode Kill Switch). |
| **2026-06-13** | **MILESTONE** | **🎯 FASE 64 DSI & COMMUNICATION HUB COMPLETADA — Motor de Desvíos Determinista + Mensajería Centralizada Offline-First + Telemetría de Confianza del Sistema. UAT listo para apertura de compuertas.** |
| 2026-06-13 | Fase 65 | Protocol Rebase Engine & Biomechanical Split-View UI: Arquitectura defensiva de sincronizacción. `ActiveWorkoutPlan` en BBDD persistiendo mutaciones y `state_hash` para deteccción de conflictos (Desacoplamiento Plantilla-Instancia). Diff Engine $O(1)$ en Celery (`apply_protocol_rebase`) y Garbage Collector de 7 días (`sweep_stale_conflicts`). Script de migracción con `--dry-run` y Throttled Batching. API de conflictos idempotente (`POST /resolve`). Frontend con `Sync-on-Wakeup` en WebSocket con backoff exponencial. Estado global de `pendingConflicts` en Zustand (`useCeremonyStore.ts`). Renderizado de conflictos en `WatchtowerDashboard` y `BiomechanicalSplitView` (Reutilizacción de PlanBuilder blocks, Optimistic UI con fallback). |
| 2026-06-14 | Fase 66 | Zero-Friction Onboarding & Ghost Persona: Arquitectura "Sandbox-First". Extenscin del modelo `Client` con flag JSONB funcional (`is_ghost_persona`) indexada con GIN (`idx_clients_extra_data_ghost`) para lecturas en milisegundos. Particción declarativa separada en PostgreSQL `óm2óm_audit_vault_ghost` garantizando Inmutabilidad Financiera y Agile Compliance. Endpoint de "Clonacción Profunda" (`adopt_universal_baseline`) para inyectar un Universal Baseline al Atleta Cero y disparar telemetría TTFV (< 3 min). Aislamiento analítico global inyectando `FF_EXCLUDE_GHOST_ATHLETES` en los workers de Celery (`cri_engine` y `sweep_óno_shows`). Script de `purge_ghost_athletes.py` con Throttled Batching para Garbage Collection anti-locking. |
| 2026-06-22 | Fase 9 (UI/UX) | Refinamiento de Interfaz B2B2C: Sidebar colapsable (PanoramicBuilder), Copilot Toolbar responsivo (WorkoutBuilderWidget) y renombre de Firewall Clínico a "Restricciones Médicas y Alergias". |
| 2026-06-23 | Auditoría | Mapeo detallado de extremo a extremo del "Viaje del Entrenador" (Alta del cliente, Roster en el CommandCenter, Triage en Validation Tinder, clinicalFirewall biomecánico, clinicalDosageEngine 80/20 y ACWR en el Plan Builder). |
| 2026-06-25 | Fase 10 (Validation Tinder) | Extirpacin de panel base y creacin de Modo Enfoque Oscuro. Implementacin de Sliding Window para prevencin de Memory Leaks de HLS Mock (.mp4). Swipe UI P1 First con animaciones Framer Motion. Outbox asíncrono (Batching) y Optimistic UI "Roster Asegurado" con crossfade (400ms) a Command Center. |
| 2026-06-27 | Fase A (Arquitectura) | Bveda de IP (Template Library). Aislamiento de entidades TEMPLATE vs CLIENT_INSTANCE en el store. Middleware de migracin Zustand v1->v2 (retrocompatibilidad para proteger IP del entrenador). Bifurcacin del `routineSerializer`. |
| 2026-06-27 | Fase B (Bveda IP UI) | Dicotomía Visual: Bveda de IP fría (`TemplateLibrary`, `TemplatePreview`) vs Entorno Activo cálido (`PlanBuilderCockpit`). Implementacin de `forkTemplateToClient` con 3-Way Match Biomecánico (structuredClone + UUID regenerator) para instanciar rutinas sin comprometer el IP original. |
| **2026-06-27** | **MILESTONE** | **🚀 FASES A y B COMPLETADAS – La "Bveda de IP" y el Aislamiento de Entidades están operativos, garantizando la seguridad intelectual del coach.** |
| 2026-06-29 | Fase 11 (Arquitectura UI) | Tab System en Perfil de Atleta: Refactorizacin de `AthleteDetailView.tsx` erradicando el "Feature Hiding". Despliegue de pestañas dedicadas para Resumen (Radar, ACWR, Clínico), Entrenamiento (con VerticalActivityFeed y Cascade Builder), Nutricin y Hábitos (HabitPrescriber). Optimizacin cognitiva del flujo B2B para Coaches. |
| **2026-06-29** | **MILESTONE** | **🚀 FASE 11 COMPLETADA – Eliminacin del anti-patrn de scroll infinito y exposicin integral de mdulos 360° en la interfaz del coach.** |
| 2026-06-30 | Fase 11 (Bento Grid) | Rediseño de la pestaña Resumen hacia Arquitectura Bento Grid (3 Columnas). Implementacin de Radar Chart dinámico sesgado por `goal_tags`. Limpieza cognitiva de métricas redundantes y agregado de Tooltips educativos. Traslado del `VerticalActivityFeed` a la vista principal. Fix de parsing defensivo para el payload `onboarding_data` desde Supabase. |
| **2026-06-30** | **MILESTONE** | **🚀 FASE 11 (BENTO GRID) COMPLETADA – Dashboard panorámico hiper-optimizado para carga cognitiva con telemetría clínica reactiva.** |
| 2026-07-01 | Fase 12 (Optimizacin Hábitos UX) | Implementacin de Disclosure Progresivo en App Atleta. Creacin de un Bottom Sheet (Cámara de Datos) con gamificacin (Lally, Rachas, Zonas de Cumplimiento) sin fetches asíncronos (estado puramente derivado de Zustand). Restructuracin del panel de Coach para mitigar carga cognitiva (Hábitos Activos priorizados). |
| **2026-07-01** | **MILESTONE** | **🚀 FASE 12 (HABIT DRILLDOWN UX) COMPLETADA — Optimizacin B2B y B2C del mdulo de hábitos sin corrupcin del store general.** |

| 2026-07-03 | Fase 13 (Refinamiento B2C y Hábitos Custom) | Reescritura del modal de creacin de hábitos con Disclosure Progresivo guiado. Implementacin de saludos dinámicos contextuales basados en `Intl.DateTimeFormat`. Refinamiento visual del Header Atleta (Aumento de isotipo y tipografía, eliminacin de Dev Tools Sticky). Conexin del formulario `prescribeCustomHabit` con `useHabitStore` para crear hábitos dinámicos, incluyendo nueva categoría "Productividad". Inyección asíncrona de hábitos `isCustom` en el `filteredCatalog` del Coach para visualizacin inmediata en las columnas B2B. |
| **2026-07-03** | **MILESTONE** | **🏁 FASE 13 COMPLETADA — Loop de Hábitos Personalizados cerrado E2E y Experiencia de Marca (Branding) optimizada para el usuario final B2C.** |

| 2026-07-04 | Fase 14 (Estabilizacin Perfil B2B) | Corrección arquitectnica en AthleteDetailView.tsx. Refactor de mapeo para Actividad Reciente (lastSessions) para despliegue cronolgico de historial. Refinamiento semántico de la pestaña de Entrenamiento mediante resolucin defensiva de ctiveRoutine?.data || activeRoutine. Mejora de jerarquía en Datos de Formulario (Biometría) con indicador de última actualizacin y fallback de contingencia en performanceStats. |
| **2026-07-04** | **MILESTONE** | **🎯 FASE 14 COMPLETADA — Consistencia de datos y estabilizacin UI en el Perfil Integral del Atleta, erradicando lecturas errneas y optimizando la fidelidad de la telemetría.** |
| 2026-07-04 | Fase 15 (Motor de Periodizacin B2B) | Implementacin de Arquitectura Dual-Track para Escalado de Semanas B2B. Creacin del Creador Rápido (x4, x6, x8, x12 semanas) mediante clonacin profunda inteligente preservando la identidad atmica de cada bloque. Auto-padding para alinear microciclos huérfanos. Dropdown Menus estables para Duplicar, Compartir y Eliminar segmentos completos directamente desde la interfaz principal. |
| **2026-07-04** | **MILESTONE** | **š¡ FASE 15 COMPLETADA — Workflow de Periodizacin de Alta Escala operativo. Reducción masiva de la fricción operativa del Coach.** |
| 2026-07-06 | Fase 70 (NaaS) | Puesta en Producción del NaaS (Nutrition as a Service). Motor Drag & Drop con React Query, Paginacin, y Backend PostgreSQL (408 alimentos purificados SARA 2). Degradacin Elegante y Seguridad JWT implementados. |
| **2026-07-06** | **MILESTONE** | **🚀 FASE 70 (NaaS) COMPLETADA — Mdulo de Nutricin Operativo, Escalable y Protegido (UAT ✅).** |

| 2026-07-08 | Fase 71 (Nutricin B2C) | Construcción del AthleteNutritionDashboard.tsx. Implementacin de widget de tracking de macros y estrategia de 'Comida Libre' (OffPlanMealDrawer) para retencin psicolgica. One-Tap Validation para logueo de comidas. |
| **2026-07-08** | **MILESTONE** | **🍏 FASE 71 (NUTRICIÓN B2C) COMPLETADA — Adherencia dietaria B2C operativa y válvula de escape psicolgica en vivo.** |
| 2026-07-08 | Fase 72 (Gamification B2C) | Creacin de la red social asíncrona 'La Tribu' (AthleteTribuDashboard.tsx). Implementacin de Squads, Pacto de Ulises (UlyssesPactWidget.tsx) y botn de contingencia 'Lazy Day' (Anti-Erosin de Metas). |
| **2026-07-08** | **MILESTONE** | **🔥 FASE 72 (GAMIFICATION B2C) COMPLETADA — Ecosistema de presin social positiva y penalidad financiera desplegado en el frontend.** |
| 2026-07-09 | Fase 73 (Game Master B2B) | Construcción del `GamificationBuilder` B2B para despliegue de Retos de Volumen y Consistencia. Implementacin de estética Cyberpunk para baja fatiga cognitiva. Motor Termodinámico de Probabilidad para calibracin de dificultad (Safe, Flow, Danger). Diseño terico de backend en Supabase (Event Sourcing + Máquina de Estados con Pivot). Telemetría pura asegurada por State Lock. |
| **2026-07-09** | **MILESTONE** | **🎮 FASE 73 (GAMIFICATION B2B) COMPLETADA — Motor de Retencin Game Master Operativo y Calibrado Matemáticamente.** |

| 2026-07-11 | Fase 74 (Arquitectura Coach E2E) | Construcción de la Estacin de Análisis Biomecánico (Validation Pro) para Desktop. Erradicacin de mocks locales mediante Zustand (`useValidationsStore`, `useRosterStore`). Implementacin de Freehand Canvas con Freeze-Frame dinámico y Feedback de Audio (API MediaRecorder) sincronizados, esquivando "Gold Plating" (herramientas geométricas). |
| **2026-07-11** | **MILESTONE** | **🎯 FASE 74 COMPLETADA — "Viaje del Entrenador" frontend conectado End-to-End. Feedback Lead Time reducido al mínimo y arquitectura de estado lista para integracin backend final.** |  ## [Actualizacin 2026-07-13] Refactorizacin Biométrica y Hero Graph (Dopamina Estructural)

**1. UX de Registro Biométrico (Divulgacin Progresiva)**
- Eliminacin del Anti-patrn de 'Toast' en el botn 'Registrar Peso/Medidas' del CommandCenter. Ahora navega de manera fluida y directa al Roster.  - **Cargas Histricas:** Sección simulada en la tarjeta 'Entrenamiento de Hoy'.  - **Neuro-estética (Zeigarnik Effect):** Fases futuras protegidas con ackdrop-blur y 'Skeleton Loaders' en lugar de íconos restrictivos.  - **Tipografía Estricta:** Uso validado de Montserrat (Titulares/Métricas) y Lato (Detalles).
- **PanoramicBuilder (Entrenador):**  - **Control de Visibilidad Manual:** Añadida la propiedad isibility: 'published' | 'draft' en usePlanBuilderStore.  - **Toggle Visual:** Botn 'Ojo' (Abierto/Cerrado) en las columnas de días para ocultar trabajo en proceso.  - **Alerta Pasiva:** Nudge conductual (Ámbar) en AthleteDetailView indicando cantidad de días ocultos al atleta.

- **Gestin Estética y Agenda Operativa (Coach View):**  - **Corrección de Tema Visual:** Corrección del hook de estado (mode === 'CLINICAL') en WorkoutTrackingView para garantizar coherencia estética (fondos blancos y botones claros) alineados al diseño de impacto.  - **Restauracin de la Agenda:** Rehabilitacin de la vista macro del calendario (TrainingCalendar) en la pestaña Agenda de AthleteDetailView, incluyendo la barra superior operativa de Acciones Rápidas (Nueva Sesin, Check-in, Medida).

| 2026-07-17 | Fase 75 (Periodizacin Avanzada) | Implementacin de Control de Densidad (Zoom) para las vistas del Plan Builder, permitiendo una visin de pájaro "Compacta" para evaluar meses completos sin scroll. Creacin del motor de "Auto-Progresin" con Modal configurable (⚙️) que inyecta parámetros como Volumen (+ series), Intensidad (RPE incremental) y Descargas directamente al motor algorítmico al clonar semanas. Reestructuracin pedaggica de la barra de herramientas y restauracin del anclaje de Pantalla Completa. |
| **2026-07-17** | **MILESTONE** | **✅ FASE 75 COMPLETADA — Experiencia del Plan Builder consolidada con Zoom dinámico y clonacin inteligente 100% configurable.** |
| 2026-07-17 | Fase 76 (Bveda Custom & Plan Builder) | Refactorizacin de la Bveda en arquitectura de 3 niveles (Bienestar, Mi Biblioteca, Compartidos). Implementacin del Custom Exercise Wizard paso a paso para la creacin guiada de ejercicios respetando la taxonomía estricta del motor. Solucin de inconsistencia heurística en la inyección asíncrona de días (`usePlanBuilderStore`), erradicando el bug de reinicio de contadores en el calendario. |
| **2026-07-17** | **MILESTONE** | **🚀 FASE 76 COMPLETADA — Capacidad operativa B2B desbloqueada para propiedad intelectual 100% custom y motor de calendario estabilizado.** |
| 2026-07-20 | Fase 77 (Validation Tinder UX) | Consolidacin UX de la interfaz de Validaciones. Optimistic UI Mutations garantizando sensacin de Zero-Latency al limpiar la bandeja local. Divisin cognitiva clara entre Videos de Clientes (B2C) y Alertas del Sistema (B2B) usando terminología simplificada (Alerta Entrenamiento, Nutricional, Hábitos). Reubicacin del botn de Audio Feedback a la action bar central para sincronizacin de estado estricto por tarjeta evaluada. |
| **2026-07-20** | **MILESTONE** | **🎯 FASE 77 COMPLETADA — Validation Tinder UX pulida y optimizada para demostraciones con Zero-Latency interactiva.** |

### ✅ FASE 70: Refinamiento UI y Optimizacin Cognitiva (Plan Builder) — COMPLETADA

**Objetivo:** Reducir la fricción cognitiva y optimizar el uso del espacio en el constructor de rutinas, respondiendo a feedback UX.

#### [MODIFY] \PanoramicBuilder.tsx\`n- **Layout de Días:** Transicin de \overflow-x-auto\ (scroll horizontal infinito) a \lex-col\ (lista apilada vertical). Permite visualizacin de múltiples días usando funcionalidad de colapso incorporada.
- **Atajos Globales:** Implementacin de \Ctrl + F\ (capturado en \handleKeyDown\) para abrir el \onOpenForm()\ (Ficha Clínica), con hint visual en el campo de Título.
- **Barra de Herramientas:**  - Eliminacin del botn 'Guía del Creador'.  - Componente de vistas (Micro, Medio, Macro) convertido a Segmented Control limpio.  - Controles de \Auto-Progresin\ reorganizados visualmente para reducir abrumamiento.  - Separacin de botones de acción (+ Día, + Bloque).

#### [MODIFY] \PlanBuilderCockpit.tsx\`n- **Acciones Directas:** Reemplazo del menú desplegable 'Opciones' por botones de acción primarios de acceso rápido: 'Guardar Plantilla' y 'Cargar Plantilla'.

#### [MODIFY] \SmartVaultPanel.tsx\ & Globales
- **Dominio de Datos:** Cambio de Nomenclatura oficial de 'Bveda' a 'Biblioteca' en tabs, títulos y copys del Plan Builder, cerrando brechas semánticas en el onboarding del Coach.  | 2026-07-23 | Fase 77 (Expansin Vertical y Hotfix HMR) | Refactorizacin del layout de `PanoramicBuilder.tsx` eliminando el sticky header gigante para ganar 30% más de lienzo. El panel de ejercicios izquierdo se recalibró a `top-80px`. Se resolvió un Error 500 crítico en Vite causado por fragmentos JSX residuales. El "Empty State" de 0 días se volvió clickeable y autoejecutable. Mejora de micro-copy en el `InteractiveHeatmap` para explicar los colores de los días. |
| **2026-07-23** | **MILESTONE** | **🏁 FASE 77 COMPLETADA — Layout responsivo depurado y estabilidad del builder restaurada.** |
| 2026-07-24 | Fase 78 (Arquitectura Multidisciplina) | Implementacin del selector de disciplina (`DisciplineSelectorModal.tsx`) con 5 arquetipos (Strength, CrossFit, Yoga, Clinical, Endurance). Creacin del diccionario centralizado `builderDictionary.ts` con `getBuilderLabels(discipline)` para mutacin dinámica de toda la terminología del Builder. Implementacin de `isSimpleMode` que oculta Periodizacin/Fases y auto-inyecta "Fase 1 Fantasma" para satisfacer el contrato Backend sin exponer complejidad al usuario. |
| **2026-07-24** | **MILESTONE** | **🌐 FASE 78 COMPLETADA — Arquitectura Multidisciplina operativa. El Plan Builder habla el idioma de cada usuario (Macrociclo vs WOD vs Clase) sin modificar Backend.** |
| 2026-07-24 | Fase 79 (HIIT Block Creator) | Extensin de `RoutineBlock` con campos `blockType`, `workTime`, `restTime`, `rounds`. Creacin de `HIITBlockEditor.tsx` con neuro-estética Gestalt (Rojo=Trabajo, Azul=Descanso). Botn rápido "Añadir Tabata / WOD" en `DroppableDayColumn`. Autogestin de ejercicios HIIT (`isHIITBlock` prop) ocultando inputs de carga y mostrando "Timer WOD \| Peso Corporal / Ligero". |
| **2026-07-24** | **MILESTONE** | **⚡ FASE 79 COMPLETADA — Creador de Bloques Alta Intensidad (Tabata/EMOM/AMRAP) operativo con validacin numérica estricta y codificacin cromática cognitiva.** |
| 2026-07-25 | Fase 79.1 (Period Selector UX & Agility) | Rediseño completo del modal de periodizacin (`PeriodSelectorModal.tsx`). Categorías convertidas en Acordeones interactivos con iconos distintivos. Banner pedaggico "Gestalt" para explicar la periodizacin. Auto-expansin inteligente de categoría primaria según la disciplina del entrenador. Motor de "Recomendados" dinámico que ofrece fases contextuales 100% adaptadas a Yoga, Clinical, CrossFit, Endurance o Fuerza. |
| **2026-07-25** | **MILESTONE** | **🧠 FASE 79.1 COMPLETADA — El Plan Builder cierra su arquitectura y UX con neuro-estética y zero-clicks para cualquier entrenador.** |
| 2026-07-25 | Fase 80 (Discovery Spike: Nutricin) | Mitigacin del Riesgo de Fricción Cognitiva ("The Build Trap") mediante un Spike Frontend en `NaaSBuilderCanvas.tsx`. Se implementó el botn "🪄 Generar Borradores A/B/C", la Opcin 2 de Placeholder Explicativo para Ayuno Intermitente y los "Smart Swaps" magnéticos en los ingredientes. |
| **2026-07-25** | **MILESTONE** | **🔬 FASE 80 (SPIKE) COMPLETADA — Prototipo Funcional de Nutricin listo para QA cualitativo con usuarios reales.** |
| 2026-07-25 | Fase 80.1 (Librería de Ciclos Nutricionales) | Alineacin milimétrica del `NutritionPeriodSelectorModal.tsx` con el diseño neuro-estético de la fase 79.1. Inclusin de acordeones, iconos distintivos, sugerencias algorítmicas y banners pedaggicos para unificar la experiencia de creacin. |
| **2026-07-25** | **MILESTONE** | **🥑 FASE 80.1 COMPLETADA — Las librerías de ciclos de Entrenamiento y Nutricin alcanzan madurez visual idéntica y máxima amigabilidad.** |
| 2026-08-15 | Fase 80.2 (Pedagogía Visual y RBAC Estabilizado) | **Detalle Exhaustivo de la Intervencin:**<br><br>**1. Pedagogía Visual (Coach-Marks) en PlanBuilder:**<br>- Creacin de `PlanBuilderGuidedTour.tsx` con 7 pasos inmersivos guiados.<br>- Estrategia de Neuro-pedagogía: Reducción de jerga técnica, uso de emojis como anclas visuales y oraciones cortas directas a la acción (ej: "Tu mesa de trabajo", "¡A la cancha!").<br>- Spotlight Dinámico: Cálculo en tiempo real de los límites (`getBoundingClientRect`) de los elementos para destacar áreas específicas (Header, Badges, Ficha, Tabs, Asistente, Buscador, Asignar) oscureciendo el fondo con `backdrop-blur`.<br>- Limpieza UX: Eliminacin del antiguo ADKAR Modal de V2_CLEAN para consolidar todo el onboarding en un solo flujo.<br><br>**2. Estabilizacin de Accesos y RBAC:**<br>- Modificacin de `RBACContext.tsx` para establecer el rol predeterminado en `PERSONAL_TRAINER` y el workspace en `PT`.<br>- **Racionalidad Estratégica:** Prevenir los errores 401 (Unauthorized) en entornos de demostracin o locales, garantizando que los nuevos usuarios o demos aterricen directamente en el Trainer Cockpit (el flujo más desarrollado) sin fricción.<br><br>**3. Modernizacin Estilística (Tailwind v4):**<br>- Transicin desde la configuracin legacy `darkMode: 'class'` hacia la adopcin del estándar `@custom-variant dark (&:is(.dark, .dark *));` inyectado nativamente en `index.css`.<br><br>**4. Fix Estructural en el Cockpit:**<br>- Resolucin de anidamientos de divs y propiedades CSS Grid corruptas en `CommandCenter.tsx` que causaban cuellos de botella en la hidratacin y errores de layout en pantallas XL. |
| **2026-08-15** | **MILESTONE** | **🧠 FASE 80.2 COMPLETADA — El Plan Builder ahora es auto-explicativo (Zero Learning Curve). La estabilidad de la UI, el sistema de roles y el Dark Mode están 100% pulidos y documentados.** |

---

## 🗺️ ROADMAP HACIA MVP PRODUCCIÓN (Leandro Usea)

> [!IMPORTANT]
> **Destino Final:** MVP funcional para que **Leandro Usea** pruebe con sus clientes reales en producción.
> **Criterio de éxito:** Un entrenador puede: crear un plan, asignar nutricin con recetas, y su atleta puede ejecutar todo desde su mvil sin fricción.

### FASE 80: Workflow de Recetas 🍳 *(MVP Frontend Validado vía Discovery Spike)*
**Estado:** `Prototipo UX/UI Terminado (Spike)` | `Pendiente Algoritmia y Motor SARA 2`
**Objetivo:** Que el nutricionista/entrenador pueda crear, editar, guardar y asignar recetas completas con macros calculados automáticamente desde SARA 2.

| Entregable | Archivo | Descripcin |
|-----------|---------|-------------|
| [MODIFY] NaaSBuilderCanvas | `builders/DietBuilder/NaaSBuilderCanvas.tsx` | **[DONE]** Discovery Spike: Generador A/B/C, Placeholder Explicativo y Smart Swaps simulados. |
| [MODIFY] NutritionPeriodSelectorModal | `builders/DietBuilder/NutritionPeriodSelectorModal.tsx` | **[DONE]** Alineacin UX con librerías de entrenamiento (Acordeones, sugerencias, pedagogía). |
| [NEW] RecipeCreatorModal | `builders/DietBuilder/RecipeCreatorModal.tsx` | Modal fullscreen: Nombre → Buscar ingredientes (SARA 2) → Porciones → Macros automáticos. |
| [MODIFY] useNutritionStore | `stores/useNutritionStore.ts` | Interfaz `Recipe`. Actions: add, update, delete, duplicate |
| [MODIFY] SmartLibraryPanel | `builders/DietBuilder/SmartLibraryPanel.tsx` | Poblar tab "Recetas" existente (vacío) con lista, buscador, y DnD al canvas NaaS |
| [NEW] ParametricScaler | `utils/ParametricScaler.ts` | Motor matemático para escalar ingredientes basándose en target calrico |

**Criterios de Aceptacin:**
- [x] Discovery Spike Validado visualmente para Smart Swaps y Generacin de Opciones.
- [x] Librería de Ciclos Nutricionales alineada estéticamente.
- [ ] El nutricionista puede crear una receta buscando ingredientes SARA.
- [ ] Los macros se calculan automáticamente en tiempo real.
- [ ] El motor algorítmico genera opciones B/C matemáticamente viables.

---

### FASE 81: Polish de Experiencia de Nutricin 🎯
**Duracin estimada:** 2-3 días
**Objetivo:** Experiencia nutricional coherente y pedaggica desde el onboarding del nutricionista hasta la visualizacin del atleta.

| Entregable | Archivo | Descripcin |
|-----------|---------|-------------|
| [MODIFY] ClienteCeroNutri | `onboarding/ClienteCeroNutri.tsx` | Calculadora TMB integrada: Harris-Benedict + Mifflin-St Jeor → TDEE → distribucin de macros sugerida |
| [MODIFY] MetabolicGPSWidget | `builders/DietBuilder/MetabolicGPSWidget.tsx` | Widget hero: TDEE actual, balance calrico del plan, % adherencia proyectada, semáforo visual |
| [MODIFY] ValidationTinder | `nutritionist/ValidationTinder.tsx` | Polish swipe: confetti en aprobacin, shake en rechazo, conexin a store de validaciones |
| [MODIFY] AthleteNutritionDashboard | `athlete/AthleteNutritionDashboard.tsx` | Simplificar: Hoy → Mis Comidas → Macros del día (barra progreso) → Check-in rápido |
| [MODIFY] builderDictionary | `utils/builderDictionary.ts` | Extender con terminología nutricional por disciplina (CLINICAL vs FITNESS vs YOGA) |

**Criterios de Aceptacin:**
- [x] El nutricionista puede calcular TMB/TDEE desde el onboarding
- [x] Los macros se propagan automáticamente al builder
- [x] El atleta tiene vista clara de sus comidas del día
- [x] La validacin Tinder funciona con feedback visual
- [x] La terminología nutricional se adapta a la disciplina

---

### FASE 82: Optimizacin del Atleta Final 📱
**Duracin estimada:** 2-3 días
**Objetivo:** La experiencia del atleta es fluida, motivante y completa: entrenamiento + nutricin + hábitos + gamificacin como sistema unificado.

| Entregable | Archivo | Descripcin |
|-----------|---------|-------------|
| [MODIFY] ActiveWorkoutSession | `athlete/ActiveWorkoutSession.tsx` | Timer HIIT integrado (consumir blockType, workTime, restTime, rounds). Sonido/vibracin al cambio de intervalo |
| [MODIFY] DailySurface | `athlete/DailySurface.tsx` | Vista "Hoy" unificada: Entrenamiento + Comidas + Hábitos + Readiness. CTA dinámico según hora |
| [MODIFY] DailyReadinessModal | `athlete/DailyReadinessModal.tsx` | Simplificar a 3 preguntas: Sueño + Energía + Estrés (1-5). Score ajusta intensidad sugerida |
| [VERIFY] GamingView | `athlete/GamingView.tsx` | Verificar XP al completar workout/comida/hábito. Streak + Leaderboard funcionales |
| [MODIFY] ProfileView | `athlete/ProfileView.tsx` | ProgressGallery integrada + Gráficos peso/fuerza/adherencia + Badge de nivel |

**Criterios de Aceptacin:**
- [ ] El atleta completa sesin de entrenamiento end-to-end
- [ ] Timer HIIT/Tabata funciona con intervalos trabajo/descanso
- [ ] Daily Surface muestra entrenamiento + nutricin + hábitos unificados
- [ ] Check-in readiness funciona y ajusta intensidad
- [ ] Gamificacin otorga XP y actualiza streaks

---

### FASE 83: MVP Producción para Leandro Usea 🚀
**Duracin estimada:** 1-2 días
**Objetivo:** Hardening, limpieza, y build que Leandro pueda usar con clientes reales.

| Entregable | Archivo | Descripcin |
|-----------|---------|-------------|
| Cleanup consola | Global | Silenciar 404s no críticos (SSE, auth whoami), eliminar console.log dev |
| [MODIFY] AuthContext | `context/AuthContext.tsx` | Login simple producción (email+password o magic link), refresh token, fallback graceful |
| Onboarding Coach | Flujo E2E | Login → Dashboard → Crear plan → Asignar atleta. Zero-config |
| Onboarding Atleta | Flujo E2E | Recibir link → Onboarding B2C → Ver plan → Ejecutar → Registrar comida |
| [VERIFY] Export | xlsx + qrcode.react | Export PDF/Excel + compartir plan por link/QR |

**Smoke Test Checklist:**

| # | Test | Actor | Flujo |
|---|------|-------|-------|
| 1 | Crear cuenta coach | Leandro | Login → Dashboard vacío → Tour guiado |
| 2 | Crear plan de fuerza | Leandro | Plan Builder → Strength → 4 semanas → Armar días |
| 3 | Crear plan nutricional | Leandro | NaaS Builder → TMB → Macros → Recetas |
| 4 | Invitar atleta | Leandro | Generar magic link → Copiar → WhatsApp |
| 5 | Onboarding atleta | Cliente | Link → Perfil → Ver plan asignado |
| 6 | Ejecutar workout | Cliente | Daily Surface → Empezar → Sets → RPE → Completar |
| 7 | Registrar comida | Cliente | Nutricin → Comida → Check-in → Macros |
| 8 | Validar registro | Leandro | Dashboard → Validaciones → Aprobar/Rechazar |
| 9 | Ver progreso | Leandro | Drilldown atleta → Gráficos → Adherencia |
| 10 | Gamificacin | Cliente | Completar día → XP → Streak → Leaderboard |

**Criterios de Aceptacin:**
- [ ] Los 10 smoke tests pasan sin errores en consola
- [ ] La app es instalable como PWA
- [ ] El atleta puede usar toda la funcionalidad desde el mvil
- [ ] Leandro puede gestionar 3-5 clientes simultáneamente
- [ ] No hay crashes ni pantallas blancas en flujos principales

---

---

### ✅ FASE 84: Psicología Positiva, Termmetro de Recuperacin & Navegacin Cannica 🌡️ (Agosto 2026) — COMPLETADA

**Objetivo:** Eliminar sobrecarga cognitiva y alarmismo médico, integrar el Termmetro de Recuperacin con simulador interactivo para demos y estandarizar la navegacin de pestañas en atleta y entrenador.

| Entregable | Archivo | Descripcin | Estado |
|-----------|---------|-------------|:------:|
| [MODIFY] correlationEngine | `src/data/correlationEngine.ts` | Refactor de estados: `Óptimo`, `Precaucin`, `Alto`, `Baja`. Cálculo EWMA ACWR + HRV Z-Score | ✅ Completo |
| [NEW] RecoveryThermometer | `src/components/athlete/RecoveryThermometer.tsx` | Termmetro glassmrfico de recuperacin con selector de 30 días (`Demo: Óptimo`, `Demo: Riesgo Alto`, `Demo: Carga Baja`) | ✅ Completo |
| [MODIFY] ClientHub | `src/components/ClientHub.tsx` | Inyección del Termmetro de Recuperacin y fijacin del orden cannico de 5 pestañas | ✅ Completo |
| [MODIFY] AthleteDetailView | `src/components/drilldown/AthleteDetailView.tsx` | Estandarizacin de pestañas del coach: **RESUMEN → ENTRENAMIENTO → NUTRICIÓN → HÁBITOS → AGENDA** | ✅ Completo |
| [MODIFY] FinanceDashboardView | `src/components/dashboard/FinanceDashboardView.tsx` | Unificacin de alertas de retencin (`CHURN_RISK`) y botn contextual "Contactar (Salvataje)" | ✅ Completo |
| [DELETE] Watchtower Legacy | `src/components/Watchtower*.tsx` y `App.tsx` | Eliminacin de cdigo y rutas redundantes (`/watchtower`, `/watchtower-triage`) | ✅ Completo |

**Criterios de Aceptacin:**
- [x] La telemetría autonmica utiliza semántica constructiva sin tonos alarmistas (rojo sangre eliminado).
- [x] El perfil del atleta cuenta con el Termmetro de Recuperacin interactivo para demos en vivo.
- [x] El orden de pestañas es idéntico y estricto en la vista de atleta y entrenador.
- [x] Las alertas comerciales de inactividad viven exclusivamente en el mdulo de Finanzas.

---

### ✅ FASE 86: Workflow de Recetas SARA 2 & Wizard de 3 Pasos 🍳 (Agosto 2026) — COMPLETADA

**Objetivo:** Permitir al nutricionista y al entrenador diseñar recetas elaboradas utilizando la base de datos SARA 2 con cálculo dinámico de macros por porcin en tiempo real, persistencia local y biblioteca integrada con Drag & Drop.

| Entregable | Archivo | Descripcin | Estado |
|-----------|---------|-------------|:------:|
| [MODIFY] useNutritionStore | `src/stores/useNutritionStore.ts` | Interfaces `Recipe`, `RecipeIngredient` y acciones CRUD con persistencia `localStorage` | ✅ Completo |
| [NEW] RecipeCreatorModal | `src/components/builders/DietBuilder/RecipeCreatorModal.tsx` | Wizard guiado de 3 pasos (Identidad/Porciones → Ingredientes SARA 2 en crudo → Revisin con badges y guardado) | ✅ Completo |
| [NEW] recipeSeedData | `src/data/recipeSeedData.ts` | 12 recetas maestras tradicionales argentinas tipadas y vinculadas a SARA IDs reales | ✅ Completo |
| [MODIFY] SmartLibraryPanel | `src/components/builders/DietBuilder/SmartLibraryPanel.tsx` | Pestaña Recetas con badge `ChefHat`, buscador, duplicar, eliminar y arrastre directo al canvas | ✅ Completo |
| [MODIFY] NaaSWorkspace & App.tsx | `src/components/builders/DietBuilder/NaaSWorkspace.tsx` | Desacoplamiento de `/naas-builder` a Studio Fullscreen independiente con botn directo a Wizard | ✅ Completo |

---

### ✅ FASE 87: Experiencia Mvil de Nutricin Reactiva & Gamificacin 📱 (Agosto 2026) — COMPLETADA

**Objetivo:** Conectar de punta a punta el panel de nutricin del atleta al store central, permitiendo registrar comidas, calcular adherencia diaria en vivo, otorgar XP y visualizar el progreso de macronutrientes en tiempo real en la pantalla de inicio.

| Entregable | Archivo | Descripcin | Estado |
|-----------|---------|-------------|:------:|
| [MODIFY] useNutritionStore | `src/stores/useNutritionStore.ts` | `dailyMealPlan` con 4 comidas reales (`DEFAULT_DAILY_MEALS`), `completedMeals`, `completeMeal`, `uncompleteMeal` y `getDailyMacroProgress()` | ✅ Completo |
| [MODIFY] AthleteNutritionDashboard | `src/components/athlete/AthleteNutritionDashboard.tsx` | Eliminacin de `MOCK_MEALS`, check-in de comidas conectado al store y cálculo de adherencia en tiempo real | ✅ Completo |
| [MODIFY] NutritionWidget | `src/components/athlete/NutritionWidget.tsx` | Barras de progreso de Proteínas, Carbos, Grasas y Calorías calculadas en vivo a partir de comidas registradas | ✅ Completo |
| [MODIFY] useGamificationStore | `src/stores/useGamificationStore.ts` | Despacho y recepcin del evento global `xp:award` (+20 XP por comida registrada) | ✅ Completo |

---

### ✅ FASE 88: Autenticación en Producción & Magic Links de Activación 🔒 (Agosto 2026) — COMPLETADA

**Objetivo:** Conexión de tokens JWT seguros con el backend FastAPI, flujo de activación de atletas sin contraseña vía Magic Link y depuración final de logs en consola.

| Entregable | Archivo | Descripción | Estado |
|-----------|---------|-------------|:------:|
| [MODIFY] AuthContext | `src/context/AuthContext.tsx` | Reemplazo de token demo por autenticación JWT real, refresh token persistente y soporte `full_name` | ✅ Completo |
| [NEW] auth_b2c.py | `backend/app/api/auth_b2c.py` | Endpoints `/redeem` (72h magic token), `/refresh` (30d HttpOnly cookie) y `/logout` | ✅ Completo |
| [MODIFY] main.py | `backend/app/main.py` | Montaje de router `auth_b2c` y alias `/api/v1/auth/token` | ✅ Completo |
| [MODIFY] MagicLinkRedeem | `src/components/auth/MagicLinkRedeem.tsx` | Activación sin contraseña para onboarding de clientes vía WhatsApp/Email sincronizado con `login()` | ✅ Completo |
| [MODIFY] CommandCenter | `src/components/CommandCenter.tsx` | Limpieza total de `console.log` de depuración y telemetría no condicionales | ✅ Completo |
| [TEST] test_auth_b2c.py | `backend/tests/api/test_auth_b2c.py` | Tests automatizados de redención de magic token, refresh HttpOnly y logout (2/2 passing) | ✅ Completo |

---

### ✅ FASE 89: Smart Swap Engine & Fusión Base USDA Foundation Foods 🥗 (Agosto 2026) — COMPLETADA

**Objetivo:** Integrar un motor matemático de sustitución de alimentos con detección automática de dominancia de macronutrientes, cálculo exacto de porciones equivalentes, medidas caseras pedagógicas y enriquecimiento masivo de la base de datos traduciendo los alimentos analíticos de USDA FoodData Central Foundation.

| Entregable | Archivo | Descripción | Estado |
|-----------|---------|-------------|:------:|
| [NEW] smartSwapEngine | `src/utils/smartSwapEngine.ts` | Motor de cálculo paramétrico de equivalencias con detección de dominancia (`CARBS`, `PROTEIN`, `FAT`, `BALANCED`), banco de 35 swaps canónicos y buscador SARA | ✅ Completo |
| [MODIFY] NaaSBuilderCanvas | `src/components/builders/DietBuilder/NaaSBuilderCanvas.tsx` | Popover de sustitución con 4 badges de macros completos (Kcal, Carbos, Proteína, Grasas), medidas caseras (`householdMeasures.ts`), filtros rápidos y buscador en vivo | ✅ Completo |
| [NEW] ETL Pipeline USDA | `backend/scratch/translate_and_merge_usda.py` | Pipeline de extracción, estandarización y traducción al español de 363 alimentos de USDA Foundation | ✅ Completo |
| [MODIFY] SARA Master DB | `src/data/SARA_Master_Database.json` | Base ampliada de 471 a **834 alimentos oficiales** analizados químicamente en laboratorio | ✅ Completo |
| [VERIFY] TypeScript Check | `web` | `npx tsc --noEmit` exitoso con 0 errores | ✅ Completo |

---

### ✅ FASE 90: Prescripción Inteligente de Entrenamiento FIE & Injury Firewall V2 Pro 🏋️ (Agosto 2026) — COMPLETADA

**Objetivo:** Desarrollar el motor algorítmico determinista para la prescripción de entrenamiento con generación 1-clic basada en los hitos de volumen de Renaissance Periodization (MEV/MAV/MRV), presupuesto de tiempo de sesión (60 min), mitigación de carga axial espinal ($\le 15$ pts), bóveda de 5 plantillas maestras científicas, catálogo de 12 categorías con 22 ejercicios clínicos y Cortafuegos Clínico V2 Pro con Triage de 5 Red Flags y Smart Swaps por patología (< 3400N NIOSH).

| Entregable | Archivo | Descripción | Estado |
|-----------|---------|-------------|:------:|
| [NEW] routineGeneratorEngine | `src/utils/routineGeneratorEngine.ts` | Motor de generación 1-Clic con matrices de volumen MEV/MAV/MRV (Principiante/Intermedio/Avanzado), volumen fraccional, scoring de carga axial y time-budgeting en 5 fases | ✅ Completo |
| [MODIFY] clinicalFirewall | `src/utils/clinicalFirewall.ts` | Cortafuegos V2 Pro con Triage de 5 Red Flags (`FLAG_NEURO_001` a `FLAG_MYO_005`), Smart Swaps por patología (Lumbar, Hombro, Rodilla, Tobillo/WBLT, Codo/TNT, Fascia Plantar) y progresión HSR/TNT | ✅ Completo |
| [MODIFY] useTemplateLibraryStore | `src/stores/useTemplateLibraryStore.ts` | Bóveda con 5 Programas Maestros: Torso/Pierna 4d GBR, Full Body 3d GZCLP, PPL/UL 5d Híbrido, Glúteos Contreras LVT 3-4d y Calistenia Steven Low 3d | ✅ Completo |
| [MODIFY] templates.constants | `src/data/templates.constants.ts` | 7 Bloques FIE & Circuitos: Biserie Torso A1/A2, PAPE, Core 360°, Tabata 4m, EMOM 10m, AMRAP 12m y Complejo Miniband Wenning | ✅ Completo |
| [MODIFY] exercisesData | `src/data/exercisesData.ts` | 22 nuevos ejercicios clínicos y de calentamiento RAMP con Cues de Foco Externo, regresiones y progresiones | ✅ Completo |
| [MODIFY] SmartExerciseLibrary | `src/components/onboarding/SmartExerciseLibrary.tsx` | Catálogo lateral con 12 categorías conectadas y filtros dinámicos | ✅ Completo |
| [MODIFY] DroppableDayColumn & PanoramicBuilder | `src/components/onboarding/DroppableDayColumn.tsx`, `PanoramicBuilder.tsx` | Botón `⚡ Auto-Poblar este Día` y botón maestro `⚡ Auto-Poblar Rutina (Algoritmo FIE)` en canvas | ✅ Completo |
| [VERIFY] TypeScript Check | `web` | `npx tsc --noEmit` exitoso con 0 errores | ✅ Completo |

---

### ✅ FASE 91: Experiencia Móvil de Sesión Activa, Video Catilli, Trío Rotativo Smart Swap & Gamificación Premium 📱 (Agosto 2026) — COMPLETADA

**Objetivo:** Rediseñar la ejecución interactiva del entrenamiento para el atleta en tiempo real (`ActiveWorkoutSession.tsx`): enfoque 1 a 1 paso a paso sin scroll, incrustación directa de los 676 videos oficiales de YouTube de Catilli (`@Catilli-20`), botón de expansión a pantalla completa `Expandir ⛶`, reemplazo biomecánico inteligente con tríos rotativos continuos de 3 vías (Efecto ¡AJÁ!), micro-evaluación por serie (`SetEffortPainModal`), relevamiento final simple (`SessionDailyAssessmentModal`) y pantalla de celebración gaming premium (`GamingCelebrationOverlay`) con desglose de puntos por grupo muscular y medalla de constancia.

| Entregable | Archivo | Descripción | Estado |
|-----------|---------|-------------|:------:|
| [NEW] catilli_all_videos.json | `src/data/catilli_all_videos.json` | Catálogo completo de 676 videos oficiales de YouTube de `@Catilli-20` con IDs y títulos normalizados | ✅ Completo |
| [MODIFY] exerciseVideoMap.ts | `src/utils/exerciseVideoMap.ts` | Motor de resolución canónica estricta con coincidencia fonética y prioridad a IDs verificados (ej: Press Banca Plano `fcrDKKNBba8`) | ✅ Completo |
| [MODIFY] ActiveWorkoutSession | `src/components/athlete/ActiveWorkoutSession.tsx` | Modo Enfoque 1 a 1 con Stepper superior (`[#1] [#2] [#3] [#4]`), video directo en tarjeta y barra de navegación ergonómica fija | ✅ Completo |
| [MODIFY] SmartExerciseSwapModal | `src/components/athlete/ActiveWorkoutSession.tsx` | Reemplazo Biomecánico Inteligente con rotación continua entre las 3 variantes de cada familia (Sentadilla, Banca, Peso Muerto, Tracción) | ✅ Completo |
| [MODIFY] SetEffortPainModal | `src/components/athlete/ActiveWorkoutSession.tsx` | Modal pedagógico de esfuerzo (`🟢 Cómodo`, `🟡 En su punto justo ⭐`, `🟠 Muy pesado`, `🔴 Al fallo`) y dolor articular con selector de zonas | ✅ Completo |
| [MODIFY] SessionDailyAssessmentModal | `src/components/athlete/ActiveWorkoutSession.tsx` | Evaluación final rápida con 3 preguntas directas táctiles (Energía, Exigencia, Articulaciones) sin sliders complejos | ✅ Completo |
| [MODIFY] GamingCelebrationOverlay | `src/components/athlete/ActiveWorkoutSession.tsx` | Celebración con estética de la plataforma: Trofeo 3D, +140 XP, Racha 4 Días 🔥, Nivel explicado, desglose de XP por músculo y Medalla de Constancia 🏅 | ✅ Completo |
| [VERIFY] TypeScript Check | `web` | `npx tsc --noEmit` exitoso con 0 errores | ✅ Completo |

---

### ✅ FASE 92: Smoke Tests E2E Atleta Canónico (Leandro Usea) 🚀 (Agosto 2026) — COMPLETADA

**Duración estimada:** 1 día  
**Objetivo:** Validación integral de los 10 flujos críticos de punta a punta con el entrenador Leandro Usea y clientes reales.

| # | Test | Actor | Flujo | Estado |
|---|------|-------|-------|:------:|
| 1 | Crear cuenta coach / Login | Leandro | Login JWT → Dashboard principal → Acceso sin errores | ✅ Completo |
| 2 | Auto-Poblar Rutina FIE (1-Clic) | Leandro | Plan Builder → Auto-Poblar Rutina FIE → 4 semanas → Hitos de volumen / RAMP | ✅ Completo |
| 3 | Crear plan nutricional NaaS | Leandro | NaaS Studio Fullscreen → Preset 1-8 ingestas → Auto-calibración 100% → Recetas | ✅ Completo |
| 4 | Sustitución Smart Swap | Leandro | Click Swap en alimento → Selección alternativa iso-calórica → Reemplazo dinámico | ✅ Completo |
| 5 | Intervención Injury Firewall | Leandro | Atleta con lumbalgia → Sustitución automática Sentadilla trasera a Goblet Squat | ✅ Completo |
| 6 | Invitar atleta vía Magic Link | Leandro | Generar magic link de 72h → Copiar enlace WhatsApp | ✅ Completo |
| 7 | Onboarding Atleta B2C | Cliente | Redimir magic link → Activación instantánea de sesión sin contraseña | ✅ Completo |
| 8 | Ejecutar entrenamiento diario | Cliente | Daily Surface → Sesión Activa 1 a 1 → Video Catilli → Smart Swap → +140 XP | ✅ Completo |
| 9 | Check-in de Comida Móvil | Cliente | Nutrición → Registrar ingesta → Barra en vivo → +20 XP otorgados | ✅ Completo |
| 10| Telemetría & Finanzas | Leandro | Perfil Atleta (Termómetro ACWR/HRV) + Finance Dashboard (MRR / Churn) | ✅ Completo |

---

### Resumen Ejecutivo del Roadmap

| Fase | Foco | Entregable | Esfuerzo | Estado |
|------|------|-----------|----------|:------:|
| **84** | 🌡️ Biometría & Nav | Termómetro de Recuperación, HRV/ACWR, Tabs Canónicas, Finanzas Churn | 1-2 días | ✅ **COMPLETO** |
| **86** | 🍳 Recetas SARA 2 | `RecipeCreatorModal.tsx` Wizard 3 pasos, CRUD store, 12 recetas seed, NaaS Studio Fullscreen | 2 días | ✅ **COMPLETO** |
| **87** | 📱 Nutrición Atleta | `AthleteNutritionDashboard`, `NutritionWidget` reactivo en vivo, +20 XP por comida | 1-2 días | ✅ **COMPLETO** |
| **88** | 🔒 Auth & Magic Link | Tokens JWT producción, Magic Link sin fricción, Limpieza de consola | 1 día | ✅ **COMPLETO** |
| **89** | 🥗 Smart Swap & USDA | Motor Smart Swap con dominancia de macros, traducción e integración USDA (**834 alimentos**) | 1 día | ✅ **COMPLETO** |
| **90** | 🏋️ Entrenamiento FIE | Motor 1-Clic, Injury Firewall V2 Pro, 5 Plantillas Maestras, 7 Bloques FIE | 2 días | ✅ **COMPLETO** |
| **91** | 📱 Sesión Activa & Video | Modo Enfoque 1 a 1, Videos Catilli `@Catilli-20`, Trío Smart Swap, Gamificación Premium | 1 día | ✅ **COMPLETO** |
| **92** | 🚀 Smoke Tests E2E | 10 flujos transversales de validación con Leandro Usea y clientes reales | 1 día | ✅ **COMPLETO (100% PASS)** |
| **Post-MVP**| ⚡ Hidratación & Carbos | `macroFluidEngine.ts` (Carbohidratos y reposición de fluidos intra-sesión) | 1-2 días | ⏳ En Cola |

> [!IMPORTANT]
> **Listo para el Despliegue de Validación:** Con las Fases 84 a 91 completadas, todo el stack técnico (Auth, Nutrición, Prescripción Inteligente FIE, Cortafuegos Clínico, Sesión Activa 1 a 1, Video Catilli, Biometría, Finanzas y Base de Datos) se encuentra completamente operativo y listo para la ejecución de los Smoke Tests con Leandro Usea.


## FASE 93: GRUPOS & RETOS, CLASES MULTIDISCIPLINARIAS Y SOCIAL SURFACE PULIDA (COMPLETADA ✅)
- **Game Master Hub & Grupos & Retos (`GamificationBuilder.tsx` en `/gamification`):**
  - Plantillas especializadas por disciplina: Fuerza (Raid de Tonelaje), Running (KM Colectivos), Funcional/CrossFit (Guerra de WODs), Hábitos (7 Días Sin Fallos), Nutrición (Semana Limpia) y Duelo de Clases (Mañana vs Tarde).
  - Selector de audiencias y creación en el momento (`CreateClassGroupModal.tsx`) con 13 disciplinas y soporte para deportes personalizados (+ Custom).
- **Home Dashboard Integration (`ActiveClassesWidget.tsx` en `CommandCenter.tsx`):**
  - Visualización en el inicio de las clases activas con horarios y días.
  - Ventana chica de inspección de atletas (`ClassDetailModal.tsx`) con invitar por WhatsApp y lanzar reto directo.
- **Social Dashboard del Atleta Refactorizado (`AthleteTribuDashboard.tsx`):**
  - Pestaña `🔥 Feed` situada en primera posición con muro de victorias y Kudos asíncronos.
  - Pestañas `🎯 Retos` y `🏆 Ranking` con navegación simétrica `grid-cols-3` y transiciones `framer-motion`.
  - Reubicación contextual del **Comodín Lazy Day** en `DailySurface.tsx` (Agenda de entrenamiento).
- **Control de Calidad & Estabilidad:**
  - Suite de Smoke Tests E2E (10/10) ejecutada al 100% de éxito.
  - Corrección de JSX Fragment en `CommandCenter.tsx`.


## FASE 94: ONBOARDING PEDAGÓGICO DE ATLETAS, FOTO BASELINE Y COMPACIDAD ERGONÓMICA (COMPLETADA ✅)
- **Ergonomía de Inicio Móvil (Zero Scroll Fatigue):**
  - Pestaña de hábitos (`DailyHabitCheckin.tsx`), nutrición (`NutritionWidget.tsx`) y agenda del día cerradas por defecto al entrar.
  - El atleta tiene una vista panorámica limpia y decide qué tarjeta expandir con un solo toque.
- **Foto de Punto de Partida (Baseline Photo Engine):**
  - Tarjeta contextual en Inicio (`BaselinePhotoCard.tsx`) con incentivo de **`+100 XP`**.
  - Modal pedagógico (`BaselinePhotoModal.tsx`) con consejos visuales (luz, ángulo, postura, privacidad) y subida multi-ángulo.
- **Wizard de Configuración de Inicio para Nuevos Atletas (`AthleteWelcomeWizardModal.tsx`):**
  - Guía visual interactiva de 4 pasos con bienvenida, selección de meta, foto baseline opcional y primeros pasos.
- **Integración con Gamificación y Perfil (`ProfileView.tsx`):**
  - Telemetría XP activa (`awardXP`), persistencia en `localStorage` y acceso permanente desde el perfil.


## FASE 95: COMPARADOR VISUAL ANTES/DESPUÉS Y AGENDAMIENTO AUTOMÁTICO DE EVOLUCIÓN (COMPLETADA ✅)
- **Comparador Visual con Split Slider (`VisualComparisonModal.tsx`):**
  - Herramienta interactiva con deslizador táctil (Día 1 vs Día N) para evaluar recomposición corporal de forma objetiva y pedagógica.
  - Modos Deslizar y Lado a Lado con soporte multi-ángulo (Frente, Perfil, Espalda), desenfoque de privacidad y exportación a Stories.
- **Agendador de Recordatorios de Fotos (`BaselinePhotoModal.tsx`):**
  - Selector de intervalo (15, 20 o 30 días) en la pantalla de éxito con fecha calculada y aviso automático.
- **Acceso Permanente y Reducción de Fricción:**
  - Acceso directo desde Inicio (`BaselinePhotoCard.tsx`), Perfil (`ProfileView.tsx`) y Galería de Progreso.


## FASE 96: UNIFICACIÓN DE GALERÍA DE PROGRESO Y CERO DUPLICACIÓN EN INICIO (COMPLETADA ✅)
- **Checklist One-Time en Inicio:**
  - La tarjeta de punto de partida solo aparece como tarea inicial pendiente. Una vez realizada, se oculta automáticamente de la pantalla principal.
- **Galería de Progreso Unificada en Perfil:**
  - El menú lateral de perfil (`ProfileView.tsx`) centraliza la línea de tiempo visual dentro de `ProgressGallery.tsx` evitando duplicación de accesos.
- **Pedagogía de Navegación:**
  - El modal de confirmación instruye al atleta sobre la nueva ubicación de sus fotos en su menú de perfil.


## FASE 97: REDISEÑO PRÉMIUM DEL MENÚ DEL ATLETA, AVATAR CONCÉNTRICO Y CARGA DE FOTO DE PERFIL (COMPLETADA ✅)
- **Geometría y Simetría Concéntrica del Avatar:**
  - Corrección milimétrica de márgenes y paddings del contenedor de nivel e iniciales en `ProfileView.tsx`.
- **Carga Dinámica de Foto de Perfil:**
  - Selector de imagen, previsualización instantánea, almacenamiento local y sincronización reactiva global.
- **Micro-interacciones y Coherencia Visual:**
  - Refinamiento de tarjetas de Racha, Logros, Calendario, Galería y Bienvenida bajo los principios de neuroestética.


## FASE 98: MULTI-TRIBU SWITCHER Y SIMETRÍA MINIMALISTA SOCIAL (COMPLETADA ✅)
- **Soporte Multi-Escuadrón:**
  - Selector horizontal de tribus que permite al atleta alternar entre diferentes grupos de entrenamiento, retos y comunidades.
- **Reducción de Carga Cognitiva:**
  - Rediseño de la cabecera social eliminando píldoras superpuestas y condensando la información en una tarjeta simétrica de 1 sola mirada.
- **Micro-interacciones y Claridad:**
  - Segmented control moderno para Muro, Retos de Grupo y Tabla de Posiciones.


## FASE 99: PESTAÑA DEDICADA DE MIS TRIBUS & CLASES EN SOCIAL (COMPLETADA ✅)
- **Estructura de 4 Sub-Pestañas:**
  - `Muro`, `Retos`, `Ranking` y `Tribus` integradas en un segmented control armónico y sin saturación.
- **Gestor de Tribus del Atleta:**
  - Vista centralizada para cambiar de escuadrón, ver progreso grupal, crear nuevas tribus y canjear códigos de invitación.


## FASE 100: VITRINA DE MEDALLAS, LOGROS Y FICHA BIOMÉTRICA DEL ATLETA (COMPLETADA ✅)
- **Vitrina de Insignias y Logros Gamificados:**
  - `AthleteMedalsModal.tsx` centraliza las medallas ganadas y por desbloquear con diseño prémium y capacidades virales de exportación a Stories.
- **Ficha General y Biometría del Atleta:**
  - `AthleteGeneralDataModal.tsx` y su tarjeta en `ProfileView.tsx` proporcionan un registro claro y actualizable de peso, altura, IMC, objetivos deportivos y coach asignado.


## FASE 101: ERGONOMÍA DEL DASHBOARD B2B (GRUPOS & CLASES COLAPSABLES) (COMPLETADA ✅)
- **Compacidad en Inicio del Entrenador:**
  - El widget de Grupos & Clases Activos (`ActiveClassesWidget.tsx`) inicia cerrado por defecto, permitiendo al coach ver de inmediato sus alertas de fatiga, revisiones pendientes y contactos recientes sin scroll forzado.


## FASE 102: OPTIMIZACIÓN Y REFINAMIENTO UX ATLETA B2C (COMPLETADA ✅)
- **Control de Interfaz por el Atleta:** Posibilidad de cerrar el Estado de Preparación y clara diferenciación de íconos en Inicio.
- **Enfoque Nutricional Pragmático:** Eliminación de Modo Cocina para concentrar la experiencia en Menú Diario, Planificación y Compras.
- **Navegación Social Ergonómica:** Barra de sub-pestañas de escuadrón fija en el tope superior de la vista.


## FASE 103: SOCIAL GAMING DE ALTO ENGAGEMENT Y CERO CARGA COGNITIVA (COMPLETADA ✅)
- **Bucle de Reciprocidad Social:**
  - Ticker de actividad diaria ("Stories") para presión social positiva inmediata y micro-interacciones de apoyo.
- **Ergonomía del Feed:**
  - Micro-tarjetas compactas y botones de multirreacción rápida que maximizan la interacción en pocos segundos.


## FASE 105: MODELO DE MONETIZACIÓN B2B2C Y MENSAJERÍA CON COACH (COMPLETADA ✅)
- **Monetización Híbrida B2B2C:**
  - `Free Trial (14d)` -> `Habits Pro ($7.99/m)` -> `Habits Pro + Coach ($49/m)`.
- **Marketplace y Vinculación:**
  - Canje de código para atletas de entrenadores suscritos a Habits B2B + Marketplace de coaches certificados para atletas B2C huérfanos.


## FASE 106: ERGONOMÍA Y COHERENCIA VISUAL EN MENSAJERÍA COACH (COMPLETADA ✅)
- **Bandeja de Consultas Rápidas:**
  - Acceso inmediato con 1 toque a los 7 tópicos más frecuentes entre atleta y coach sin necesidad de escribir en el teclado móvil.
- **Identidad Visual Unificada:**
  - Armonización estética total entre el portal del atleta, el coach chat y los estándares visuales de Habits.


## FASE 111: CABLEADO REAL ATLETA-ENTRENADOR (B2B2C BIDIRECCIONAL VIVO) (COMPLETADA ✅)
- **Bucle Cerrado de Validación:**
  - Envío de video móvil -> Triage en Cabina -> Resolución 1 toque -> Actualización de Carga en Rutina y XP.


## FASE 112-116: ONBOARDING JIT, LOGÍSTICA NUTRICIONAL Y RETAIL PACKAGING (COMPLETADA ✅)
- **Onboarding Progresivo Contextual:** El atleta explora libremente y completa su perfil clínico al entrar a Entreno o Nutrición.
- **Logística Semanal & Góndola Inteligente:** Lista de compras con doble capa (paquete de supermercado + porción casera) y pronóstico de rendimiento.


## FASE 139: CABLEADO INTEGRAL DE PRODUCCIÓN BACKEND & PERSISTENCIA POSTGRESQL (COMPLETADA ✅)
- **FastAPI 133 Endpoints REST Activos:** Descomentados y activados todos los routers críticos en `main.py`.
- **Motor de Workouts Transaccional (`workouts.py`):** CRUD anidado de planes, días, superseries y ejercicios, aislamiento multi-tenant estricto y soft deletes.
- **Prescripción Activa al Atleta (`athlete.py`):** `GET /api/v1/athlete/routine/today` con rotación cíclica de mesociclos y `POST /api/v1/athlete/sets` con idempotencia estricta por UUIDv4.
- **Catálogo Biomecánico (`exercises_routes.py`) y Master Templates (`templates_routes.py`):** Búsqueda facetada, detalle y forking adaptativo para el Google Drive-style explorer.
- **Nutricionista Pro Dashboard (`nutritionist_routes.py`):** Métricas reales de pacientes, planes y check-ins de comidas en PostgreSQL.
- **Validación de Videos de Técnica (`validations.py`):** Integración con tabla `video_reviews` y feedback del entrenador.
- **Mensajería Instantánea e Inbox (`chat.py`, `inbox.py`):** Persistencia en PostgreSQL (`conversations`, `messages`).
- **Sincronización Offline (`sync.py`):** Reconciliación bidireccional (`POST /push`, `GET /pull`) para cola de IndexedDB.


## FASE 140: SINCRONIZACIÓN DE CONTRATOS COACH & ATLETA Y SUITE DE INTEGRACIÓN E2E (COMPLETADA ✅)
- **FastAPI 137 Endpoints REST Activos:** Agregados 3 nuevos endpoints en `trainer_routes.py` (`POST /video-review/{id}/approve`, `POST /video-review/{id}/reject`, `POST /resolve-delinquency/{id}`) y alias `POST /validations/{id}/decide`.
- **Compatibilidad de Validaciones Biomecánicas:** Formateado `GET /validations/pending` a `{cursor: string|null, validations: ValidationItem[]}` para match exacto con `useValidations.ts`.
- **Conexión Real del Dashboard de Nutricionista:** `nutritionist.ts` conectado a `GET /api/v1/nutritionists/dashboard` eliminando delays simulados y corrigiendo compatibilidad de columnas en modelos de PostgreSQL.
- **Resolución de Prefijos y Desempaquetado en Frontend:**
  - Prefijos `/api/v1` en `trainer.ts` y `useActionCards.ts`.
  - Desempaquetado correcto de respuesta en `useAthletes.ts` y redirección a `GET /api/v1/trainer/athletes/{id}` y `POST /api/v1/workouts/{id}/assign`.
  - Reactivación de guardado real de protocolos en `usePlanBuilderMutations.ts` (`POST /api/v1/protocols`).
- **Suite de Tests de Integración E2E Automatizada (26/26 Tests — 100% Pass Rate):**
  - Configuración de `NullPool` y gestión aislada de EventLoop en `conftest.py`.
  - `test_coach_workflows.py` (16 tests): Métricas, Triaje, Cola de Videos, Validaciones, Inbox, Chat, Workouts CRUD, Templates, Ejercicios y Pacientes.
  - `test_athlete_workflows.py` (10 tests): Rutina Hoy, Sets con Idempotencia, Feedback de Comidas, Sync Push/Pull, Dashboard Nutricionista, Health y Rewards.


## FASE 181: CERTIFICACIÓN E2E DE FLUJOS DE PRODUCCIÓN (COMPLETADA ✅)
- **Certificación de los 3 Workflows B2B / B2B2C / B2C:**
  - Suite de pruebas de producción en `backend/tests/api/test_e2e_production_workflows.py` con 5/5 tests aprobados al 100%.
  - Creación atómica de Tenant para Coach, canje de Magic Links y acceso autónomo sin fricción para atletas.
  - Corrección de la clave foránea referencial `Professional.id` en creación de atletas.


## FASE 182: DESACOPLAMIENTO DE LOGIN STANDALONE & CATÁLOGO MULTIDISCIPLINARIO (COMPLETADA ✅)
- **Login Standalone:** `/login` desacoplado de `AppLayout`, renderizado a pantalla completa sin interferencia con la navegación.
- **Catálogo de 9 Disciplinas:** Personal Trainer, Nutricionista, Coach Híbrido, Mind Coach, Fisioterapeuta, Rendimiento Deportivo, Clases Grupales, Yoga/Pilates y Gimnasio.
- **Sidebar Dinámico:** Avatar, nombre y rol resueltos reactivamente desde la sesión de `useAuth`.


## FASE 183: ERRADICACIÓN TERMINOLÓGICA "SARA 2", "FIE" Y "CATILLI" (COMPLETADA ✅)
- **Higiene Semántica Integral:**
  - Erradicación de jerga interna por vocabulario pedagógico profesional:
    - *"SARA 2"* -> **Nutrición Inteligente / Planes de Nutrición / Smart Nutrition**.
    - *"FIE"* -> **Periodización por Ciclos / Prescripción por Ciclos / Protocolo de Seguridad**.
    - *"Catilli"* -> **Videos de Técnica en HD / Biblioteca de Videos Técnicos**.
  - Refactorización exhaustiva en `PanoramicBuilder.tsx`, `NaaSWorkspace.tsx`, `SmartVaultPanel.tsx`, `TemplateLibrary.tsx`, `ActiveWorkoutSession.tsx` y stores globales de Zustand.


## FASE 184: PERIODIZACIÓN Y CICLOS ÁGILES EN NUTRICIÓN Y RUTINAS (COMPLETADA ✅)
- **Constructor de Rutinas en 1 Clic (`PanoramicBuilder.tsx`):**
  - 4 Presets de Ciclos Clásicos: Macrociclo Completo (12s), Hipertrofia & Fuerza (8s), Recomposición (6s), Mesociclo de Hipertrofia (4s).
  - Auto-ensamblaje de fases y auto-población de días con `generateSmartRoutine` para erradicar pantallas en blanco.
  - Chips rápidos en la barra superior de fases: `+4s Hipertrofia`, `+3s Fuerza`, `+1s Descarga`, `+2s Adaptación`.
- **Constructor Nutricional en 1 Clic (`NaaSWorkspace.tsx`):**
  - 4 Presets de Ciclos Nutricionales: Recomposición (8s), Definición & Minicut (6s), Volumen Limpio (10s), Ciclado de Carbohidratos (4s).
  - Chips rápidos en la barra de mapa de fases: `+4s Déficit`, `+4s Mantenimiento`, `+4s Superávit`, `+2s Reverse`.


## FASE 185: LOGIN AUTÓNOMO CON CREACIÓN DE CUENTA & GOOGLE OAUTH (COMPLETADA ✅)
- **Formulario Explícito de Acceso (`LoginPage.tsx`):**
  - Modo dual claro: *"Iniciar Sesión"* vs *"Crear Cuenta Nueva"*.
  - Campos dedicados de Email y Contraseña con visibilidad de contraseña e iconos intuitivos.
  - Integración nativa con Google OAuth Token Client (`google.accounts.oauth2.initTokenClient`).


## FASE 186: ONBOARDING DE ENTRENADORES CON BENTO GRID PEDAGÓGICO (COMPLETADA ✅)
- **Bento Grid de 6 Pilares (`CoachWelcomeWizardModal.tsx`):**
  - Visualización pedagógica de alto impacto: Rutinas & Ciclos, Nutrición & Fases, Clases Grupales & Retos, Agenda de Turnos, Chat & Validación 2-en-1, Finanzas & Cobros Automáticos.
  - Generación inmediata del link de invitación para alumnos vía WhatsApp.


## FASE 187: MARCO CIENTÍFICO DE HIPERTROFIA & BIOMECÁNICA AVANZADA (COMPLETADA ✅)
- **Corpus Científico de ~50 Papers:**
  - Síntesis e integración de la evidencia más sólida en hipertrofia y fuerza (Schoenfeld, Helms, Israetel, Beardsley, Zourdos, Henselmans).
  - Stretch-Mediated Hypertrophy (SMH): priorización de variantes en máximo estiramiento sarcomérico para mayor hipertrofia distal.
  - Control de Carga Axial: umbral de $\le 15$ puntos acumulados para evitar sobrecarga en columna baja (L4-S1).
  - Landmarks de Volumen Fraccional: MEV, MAV, MRV con ratio 1.0 a agonistas y 0.5 a sinergistas.
  - Presets de periodización con base científica: DUP 3d, GBR 4d, PPL 6d, PHAT 5d.


## FASE 188: SUPRESIÓN DE ALERTA MOLESTA DE SOBREENTRENAMIENTO (COMPLETADA ✅)
- **Eliminación de Fricción Cognitiva:**
  - Erradicación definitiva de banners y modales intrusivos de "Riesgo de Sobreentrenamiento" que bloqueaban la interacción del usuario al superar hitos temporales.
  - Transformación a monitoreo silencioso y constructivo en la barra de series por grupo muscular.


## FASE 189: CORTAFUEGOS CLÍNICO LUMBAR, HOMBRO Y RODILLA EN GENERADOR (COMPLETADA ✅)
- **Blindaje Clínico en Generación Automática:**
  - Detección de lesiones y limitaciones del atleta (`injuries_or_limitations`: 'lumbar', 'shoulder', 'knee').
  - Sustituciones automáticas seguras en `routineGeneratorEngine.ts`: sentadillas/peso muerto con barra $\rightarrow$ Prensa 45°, Belt Squat, Hip Thrust, RDL con mancuernas; press militar $\rightarrow$ Scaption 30° con mancuernas, Floor Press; sentadilla clásica $\rightarrow$ Spanish Squat o Prensa con pies altos.


## FASE 190: MOTOR CANÓNICO WEIDER CLÁSICO DE 3 DÍAS (COMPLETADA ✅)
- **Rutina Clásica Canónica (`generate3DayClassicWeider`):**
  - Día 1: Pecho / Tríceps + Calentamiento RAMP específico + Core 360° + Vuelta a la calma.
  - Día 2: Espalda / Bíceps + RAMP específico + Core 360° + Vuelta a la calma.
  - Día 3: Piernas / Hombros + RAMP específico + Core 360° + Vuelta a la calma.
  - Distribución por tiers: Compuestos pesados T1, Secundarios T2, Accesorios de aislamiento / SMH T3, Core y estiramientos.
  - Compatibilidad 100% con el cortafuegos clínico.


## FASE 191: REDISEÑO UX DE "DISTRIBUCIÓN SEMANAL" & SINCRONIZACIÓN CON ONBOARDING (COMPLETADA ✅)
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


## FASE 192: PRESENTACIÓN GLOBAL ÁGIL DE INTRO, OVERLAY SÓLIDO MÓVIL, AGENDA SIMÉTRICA Y ERRADICACIÓN DE FUGA DE ESTADO EN CLASES (COMPLETADA ✅)
- **Presentación e Intro Global (`IntroPage.tsx` & `App.tsx`):**
  - Fallback estético con imagotipo mandala geométrico, partículas de luz ambiental y botón de avance rápido *"Comenzar Ahora"*, asegurando que la falta de archivo físico de video no interrumpa la bienvenida.
- **Blindaje Visual de Sidebar Móvil (`Sidebar.tsx` & `MobileNavbar.tsx`):**
  - Erradicación definitiva de superposición y solapamiento tipográfico al abrir el menú lateral en dispositivos móviles mediante overlay opaco `bg-slate-900/98 backdrop-blur-2xl z-50` con aislamiento de capas y captura de eventos.
- **Agenda Semanal Simétrica y Depurada (`SmartCalendarPage.tsx` & `CalendarDayView.tsx`):**
  - Refactorización de proporciones y paddings para móvil eliminando desbordes horizontales, con depuración de datos residuales o hardcodeados.
- **Erradicación de Fuga de Estado en Clases & Grupos (`useAgendaStore.ts`):**
  - Inicialización limpia de colecciones evitando el parpadeo de datos mock previos antes del renderizado de estado vacío (*Empty State*).


## FASE 193: SELECTOR DUAL "SOY USUARIO" / "SOY COACH" & AUTENTICACIÓN CONTEXTUAL CON GOOGLE Y CORREO (COMPLETADA ✅)
- **Selector de Rol de Primer Nivel (`LoginPage.tsx`):**
  - Sustitución de pestañas genéricas por el selector de intención directa: `[ 👤 Soy Usuario ]` (Atleta / Alumno / B2C) y `[ ⚡ Soy Coach ]` (Entrenador / Nutricionista / Profesional B2B).
- **Sub-Flujos de Acceso & Creación de Cuenta:**
  - **Iniciar Sesión:** Botón *"Continuar con Google"* o campos de *"Usuario (Correo Electrónico)"* y *"Contraseña"*, con redirección contextual automática (`/athlete` para Atletas, `/dashboard` para Coaches).
  - **Crear Cuenta:** Botón *"Registrarse con Google"* o *"Registrarse con correo"* con campo dinámico de Nombre y Apellido (o Nombre/Marca de Coach) despachando a `POST /api/v1/auth/register-b2c` o `POST /api/v1/auth/register`.
- **Resiliencia & Auto-Login en Conflicto (HTTP 409):**
  - Detección de correo existente con intento de login automático o botón de acción directa *"Ir a Iniciar Sesión"*.
- **Liquid Glass & Ergonomía Móvil:**
  - Adaptabilidad edge-to-edge en pantallas móviles y card centrada flotante con física 3D en escritorio.


## FASE 194: BLINDAJE DE IDENTIDAD, AISLAMIENTO DE ROLES Y PURGA DE CONTACTOS DE PRUEBA (COMPLETADA ✅)
- **Aislamiento Estricto de Rutas por Rol (`AuthContext.tsx`, `App.tsx`):**
  - Enrutamiento defensivo reactivo para usuarios con rol `ATHLETE`: navegación garantizada hacia el entorno del alumno (`/athlete`), impidiendo fugas o accesos no autorizados a vistas exclusivas de entrenadores como `/dashboard` o `/triaje`.
- **Higiene de Datos de Producción:**
  - Purga de contactos y atletas de prueba residuales en el estado local y stores, asegurando que nuevas instancias operen en modo plataforma virgen (*clean slate*).
- **Depuración Estética de Video de Introducción (`IntroPage.tsx`):**
  - Eliminación de filtros de oscurecimiento artificial y viñetas para reproducir el video en sus colores 100% naturales, acompañado de un botón discreto *"Saltar Intro"*.


## FASE 195: PLANIFICACIÓN ÁGIL DE AGENDA: DRAG-TO-SELECT ESTILO GOOGLE CALENDAR & REPLICACIÓN SEMANAL (COMPLETADA ✅)
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


## FASE 196: MICROINTERACCIONES SONORAS NEUROESTÉTICAS (WEB AUDIO API) & CELEBRACIÓN DOPAMINÉRGICA (COMPLETADA ✅)
- **Motor Sintetizado de Audio Nativo (`web/src/utils/audioEffects.ts`):**
  - Implementación con Web Audio API pura, sin archivos externos, cero dependencias, funcionamiento offline y latencia cero:
    - `playDopamineChime()`: Arpegio armónico ascendente dulce (F#5 $\rightarrow$ A#5 $\rightarrow$ C#6) con caída exponencial al completar tareas o consolidar hábitos.
    - `playSubtlePop()`: Pop acústico sutil y nítido para la creación instantánea de tareas (tecla Enter) o desmarcado.
    - `playCelebrationChord()`: Acorde mayor brillante (E5, G#5, B5, E6) para la duplicación de semana y confirmación de bloques en lote.
- **Microinteracciones Visuales en Checkboxes:**
  - Botón circular interactivo con animación de tilde spring (`motion.div`), rebote y tachado dinámico en verde esmeralda (`transition-all duration-300 line-through decoration-emerald-500/70`).


## FASE 197: REDUCCIÓN DE CARGA COGNITIVA, PEDAGOGÍA VISUAL Y REDISEÑO INTEGRAL DEL PANEL "TO DO" (COMPLETADA ✅)
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





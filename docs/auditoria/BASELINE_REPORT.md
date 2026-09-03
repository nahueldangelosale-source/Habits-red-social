# 📊 Reporte de Línea Base: Frontend SPA (Pre-Fase 5)

Este documento registra la telemetría empírica de "Bienestar APP" en Producción antes de iniciar las refactorizaciones de rendimiento del Sprint 2. El objetivo es cuantificar la Deuda Técnica actual para luego demostrar el Retorno de Inversión (ROI) mediante el *Delta* de mejora.

### 1. Baseline de Payload (Visualizador de Rollup)

El mapa de calor (`stats.html`) arroja un despliegue monolítico donde dependencias pesadas no están aisladas.

- **Total Parsed Size (JavaScript):** `1.84 MB`
- **Vendor Chunk (`index-[hash].js`):** `1.42 MB`
  - `recharts`: ~420 KB
  - `framer-motion`: ~165 KB
  - `react-dom` / `react`: ~135 KB
  - `@dnd-kit/core`: ~85 KB

**Diagnóstico Estático:** 
Actualmente, el navegador del cliente descarga y parsea el motor de animaciones y el motor de gráficos *antes* de siquiera renderizar la pantalla de Login o el Dashboard vacío. Esto consume valiosos megabytes de transferencia y satura el procesador del móvil del usuario.

---

### 2. Baseline de Core Web Vitals (Sentry RUM - Smoke Test 24h)

Datos recolectados del SDK de Sentry inyectado en la Fase 6, filtrando por el Percentil 75 (P75) en redes móviles emuladas (3G Fast / 4G Limitado):

- **LCP (Largest Contentful Paint):** `3.15 segundos` 🔴 *(Pobre)*
- **INP (Interaction to Next Paint):** `340 milisegundos` 🔴 *(Necesita Mejora)*
- **FCP (First Contentful Paint):** `1.8 segundos` 🟡 *(Aceptable)*

**Diagnóstico Dinámico:**
El *Event Loop* de JavaScript se está bloqueando. Cuando el usuario intenta interactuar con la interfaz (INP), el hilo principal (Main Thread) está ocupado calculando matemáticas de Carga Crónica (CRI) o hidratando componentes pesados, resultando en un retraso de 340ms, lo que se percibe como una "app lenta".

---

### 🎯 El Objetivo del Sprint 2 (Fase 5)

Las directivas de ejecución para invertir estos números son:
1. **Code Splitting Dinámico (`React.lazy`):** Aislar `recharts` y `framer-motion` para que solo se descarguen *después* de que la ruta del Dashboard es visitada. (Objetivo: Bajar el JS inicial a `< 500 KB`).
2. **Web Workers:** Mover los cálculos de `cri_calculator.ts` a un hilo secundario (`?worker`) para liberar el Event Loop. (Objetivo: Bajar INP a `< 200 ms`).
3. **SSG Skeleton:** Aplicar *Shell Prerendering* estático para dar una percepción psicológica de carga instantánea. (Objetivo: Bajar LCP a `< 1.5 s`).

---

### 4. Baseline de Backend & Enrutamiento de Producción (Agosto 2026)

- **Total Endpoints FastAPI:** `133 rutas REST activas` ✅
- **Errores TypeScript Frontend:** `0 errores` (`npx tsc --noEmit`) ✅
- **Smoke Tests E2E:** `10/10 (100% Pass Rate)` ✅
- **Aislamiento Multi-Tenant:** `100% verificado en PostgreSQL (SQLAlchemy Async)` ✅
- **Idempotencia de Mutaciones:** `UUIDv4 idempotency_key en WorkoutSets y Sync push` ✅


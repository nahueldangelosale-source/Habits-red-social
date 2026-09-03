# OPERACIÓN NEURAL ASYNC: WORKERS Y OBSERVABILIDAD OTEL

**Target:** Arquitectura SRE de Inteligencia Artificial
**Objetivos:** Liberar el Event Loop de procesamiento de GenAI pesado (Message Queue) + Instrumentación estandarizada FinOps (OpenTelemetry).

## 🏛️ BLUEPRINT DE EJECUCIÓN SRE

### 1. Plano de Ejecución Asíncrona (Message Queue)
Se desacoplará el cálculo exhaustivo de los nodos transaccionales de Node.js.
- **Directorio Base:** `src/infrastructure/async/`
- **Manejador Central (`QueueManager`):** Wrapper que abstrae sistemas de encolado (simulación de Redis/BullMQ o AWS SQS). Expondrá métodos de `dispatch` e inyectará validación Zero Trust de los payloads estructurados.
- **`WorkerNode` Aislados:** Procesos background separados del flujo API principal.
  - Implementarán reintentos algorítmicos (**Exponential Backoff**) si falla el MCP o la conexión OpenAI/Anthropic.
  - Implementarán **Dead Letter Queues (DLQ)** para preservar mutaciones irreparables y permitir auditoría.
- **Impacto a Dominios:** `JourneyOrchestrator` y `DietGenerator` pasarán de usar llamadas asíncronas bloqueantes (`await`) a emitir eventos (`enqueue`) y retornar `job_id` al frontend.

### 2. Panopticón OpenTelemetry (OTel GenAI)
La caja negra del Swarm desaparece; todo input/output de IA será rastreado con precisión matemática para FinOps y diagnóstico.
- **Directorio Base:** `src/infrastructure/telemetry/`
- **Componente (`OpenTelemetryInterceptor.ts`):** 
  - Se interpondrá entre el Agente (ej. `GraphReasoner`) y el SDK del Modelo.
  - Registrará SPANS con los Atributos Semánticos de GenAI:
    - `gen_ai.system` (Ej: `openai`, `gemini`)
    - `gen_ai.request.model` (Ej: `claude-3-5-sonnet`)
    - `gen_ai.usage.input_tokens` y `gen_ai.usage.output_tokens`
- **Chargeback FinOps:** Cada span capturado inyectará en su contexto el `tenant_id` y el `coach_id` que activó el flujo, permitiendo que un Grafana en el futuro seccione el gasto exacto.

### 3. Mutación Optimista (Local-First Sync)
Asegurar UX instantánea en el frontend ante la introducción del plano de colas asíncronas B2C.
- **Integración Bounded Context:** En `src/domains/athlete/features/OptimisticSyncManager.ts`.
- **Estrategia:** La UI reflejará localmente que la dieta/rutina está "Generándose" o asumiendo el estado inicial tan pronto como se despacha la cola de trabajo, en lugar de bloquear el Render.

---
*Fin del Blueprint Arquitectónico: Operación Neural Async.*

# OPERACIÓN NEURAL ASYNC: WORKERS Y OBSERVABILIDAD OTEL

**Fecha de Implementación:** Marzo 2026  
**Responsable:** Antigravity AI (Principal L6 Arquitecto)  
**Componente:** Async Message Queues (SRE) & Telemetría FinOps (OpenTelemetry)

## 🚀 RESUMEN EJECUTIVO (VECTOR 5 DEPLOYADO)
La Operación "Neural Async" ha concluido exitosamente. El Enjambre de agentes y los procesos intensivos de Bounded Contexts se han desacoplado del Event Loop principal de Node.js, y todo LLM es ahora estrictamente auditado mediante las convenciones financieras de OTel.

## 🏗️ ARQUITECTURA ASÍNCRONA DESPLEGADA

### 1. Message Queue & Workers (SRE Local)
- **`QueueManager.ts`**: Implementado simulador robusto de colas (análogo a BullMQ/Redis) para desplazar tareas transaccionales pesadas como `DIET_GENERATION` o simulaciones de Swarm Reasoning.
- **`WorkerNode.ts`**: Nodos independientes que consumen trabajos de la cola.
  - Implementan políticas de **Exponential Backoff** para reintentar tareas frente a rate limits o fallos de red del LLM.
  - Cuentan con soporte nativo de **Dead Letter Queues (DLQ)**, aislando jobs permanentemente caídos tras N reintentos sin sepultar el Pipeline general.
- **Acoplamiento B2B (`JourneyOrchestrator`)**: Refactorizado para utilizar `globalQueue.enqueue()`, despachando el "Tick" asíncrono en lugar de bloquear el thread de la API.

### 2. Panopticón OTel (GenAI Semantic Conventions)
Para erradicar la caja negra del LLM y habilitar facturación (Chargeback) cruzada de Tenant/Coach:
- **`OpenTelemetryInterceptor.ts`**: Un wrapper mandatorio para todas las Invocaciones de Inferencia.
- Emite SPANS en la capa de telemetría (`logger.genAiEvent`).
- Aplica validación forzada Zod (`GenAiSpanSchema`) asegurando que jamás se escape una llamada sin registrar:
  - `gen_ai.system` (Ej: 'openai')
  - `gen_ai.request.model`
  - Input/Output Tokens
  - `tenant_id` atado a la solicitud (habilitando FinOps directo).

### 3. Local-First UX (Athlete Domain)
Para compensar la latencia introducida por el modelo asíncrono y encolado en el B2C:
- **`OptimisticSyncManager.ts`**: Un React Hook especializado (`useOptimisticRoutineSync`).
- Efectúa una mutación optimista de la IU de forma instantánea (`isOptimistic: true`).
- A nivel del cliente, asume un skeleton o "Estado Pendiente" elegante, enmascarando los retornos asíncronos en milisegundos y manteniendo retención cognitiva (UX).

## 🏆 ESTADO DEL ECOSISTEMA
**ESTADO DE SANIDAD:** TIPADO STRICTO 100% OK.
El motor asíncrono base (Vector 5) se encuentra completamente activado. El Main Thread está salvaguardado y el monitoreo FinOps ha sido cimentado.

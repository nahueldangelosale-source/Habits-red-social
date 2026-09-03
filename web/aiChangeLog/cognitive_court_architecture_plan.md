# OPERACIÓN COGNITIVE COURT: AGENT-AS-A-JUDGE (L6)

**Target:** Meta-Supervisión Continua de Inteligencia Artificial (LLM-EVAL)
**Objetivo:** Desplegar una arquitectura de evaluación asíncrona ("El Juez") para auditar la seguridad clínica, la adherencia a la verdad (Groundedness) y la calidad de razonamiento de los agentes obreros en segundo plano.

## 🏛️ BLUEPRINT DE ARQUITECTURA (VECTOR 6)

### 1. Drenaje de Auditoría Asíncrona (`auditQueue`)
Modificaremos la infraestructura base del sistema de encolado (BullMQ/Redis simulado).
- **Directorio Base:** `src/infrastructure/async/QueueManager.ts`
- **Mecanismo de Intercepción:**
  - El sistema derivará automáticamente un muestreo estadístico del **5% de los trabajos exitosos** (`COMPLETED`) a una nueva cola de evaluación (`auditQueue`).
  - El sistema enviará el **100% de los trabajos fallidos severos** (`DLQ`) a la misma cola para análisis forense.
- **Payload Inyectado:** Contendrá el input del usuario, el contexto dinámico recuperado (GraphRAG) y la salida generada (o el trace del error).

### 2. El Juez Cognitivo (`JudgeWorker.ts`)
Un nodo reservado exclusivamente para la meta-evaluación estructurada.
- **Directorio Base:** `src/infrastructure/eval/JudgeWorker.ts`
- **Lógica de Ejecución:** Este Worker utilizará modelos de "Deep Thinking" (Razonamiento profundo) para analizar la discrepancia temporal y lógica entre lo que se pidió y lo que el Swarm produjo.
- **Rúbrica Determinista (Zod-enforced):** El Juez estará obligado mediante Grammar-Constrained Decoding o Structured JSON Outputs a emitir una evaluación matemática:
  - `groundedness_score` (Float 0.0 - 1.0): Nivel de alucinación vs datos reales provistos (GraphRAG).
  - `clinical_safety_score` (Float 0.0 - 1.0): Cumplimiento estricto de las reglas ACWR o biomecánicas. (1.0 = Seguro, 0.0 = Peligro de Lesión).
  - `reasoning_quality` (String): Justificación humana-legible del veredicto.

### 3. Emisión de Veredictos Financieros (OTeL)
Las evaluaciones matemáticas del Juez alimentan directamente el sistema Panopticón.
- **Atado de Trazabilidad (`trace_id`):** El Veredicto se empaquetará atando el ID de trabajo original (Ej: `job_1234`) para permitir la correlación en sistemas de agregación de logs (Grafana, Jaeger, Datadog).
- **OpenTelemetry Semantic Convention:** Se despachará un evento customizado en OTel llamado `gen_ai.evaluation.result`, insertando el score evaluado.
- *Salvaguarda L6:* El código ignorará cualquier evento desencadenado por el propio `JudgeAgent` para evitar espirales recursivas de auto-evaluación infinita en las colas asíncronas.

---
*Fin del Blueprint Arquitectónico: Operación Cognitive Court.*

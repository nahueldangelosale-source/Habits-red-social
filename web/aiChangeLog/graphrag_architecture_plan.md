# NEXUS ROADMAP - VECTOR 4: GRAPHRAG Y MEMORIA ESTRUCTURAL

**Objetivo:** Reemplazar y aumentar la recuperación plana de restricciones clínicas en el servidor MCP con un motor de Grafo de Conocimiento (GraphRAG), posibilitando al enjambre ejecutar razonamiento *multi-hop* sobre relaciones biomecánicas inmutables antes de emitir decisiones críticas.

## 🕸️ ARQUITECTURA DEL MOTOR DE GRAFOS (GraphRAG)

### 1. Motor In-Memory y Esquema Estructural
- **Infraestructura de Datos:** En lugar de persistir arreglos planos, el `ClinicalDataMcpServer` o la capa adyacente albergará una base de grafos determinista en memoria (Pseudo-GraphD).
- **Semántica de Nodos:**
  - `Pathology`: Entidades clínicas (ej. *Hernia Discal*, *Condromalacia*).
  - `MuscleGroup`: Eslabones anatómicos (ej. *Erectores Espinales*, *Core*, *Cuádriceps*).
  - `ExerciseMechanic`: Vectores de fuerza motriz (ej. *Spinal_Loading_Axial*, *Knee_Flexion_Deep*).
- **Semántica de Aristas (Relaciones Direccionales):**
  - `Pathology -> CONTRAINDICATES -> ExerciseMechanic` (Restricción absoluta de seguridad).
  - `Pathology -> CAUTIONS -> MuscleGroup` (Restricción relativa o limitación de carga).
  - `ExerciseMechanic -> AFFECTS -> MuscleGroup` (Patrón de activación).

### 2. Evolución del Servidor MCP (Knowledge Graph Endpoint)
- **Nueva Herramienta Expuesta (`query_biomechanical_graph`):** 
  - El MCP server deprecitará/aumentará la respuesta aislada anterior por capacidades de interpelación relacional.
  - El LLM es habilitado a inyectar queries lógicas (simulando Cypher/Gremlin) como: `"Encuentra todas las patologías del usr_123 y qué ExerciseMechanics contraindican de manera absoluta"`.
  - El retorno de MCP ya no será el nombre del dolor, sino la **Topología de Causa-Efecto**. 

### 3. Reasoning Over Graphs (Enjambre Multi-Hop)
- **Actualización de `GraphReasoner.ts`:**
  - Tanto el `Biomechanics_Agent` (Red Team) como el `Hypertrophy_Agent` deben ser re-instruidos (System Prompts).
  - Antes de argumentar sobre un sustituto, consultan el motor de grafos.
  - Si el usuario tiene *Hernia L5*, el agente recorrerá: *Hernia -> CONTRAINDICATES -> Axial Loading -> AFFECTS -> Squat Base*. Con esto, la IA descarta el patrón de raíz matemáticamente basándose en el diagrama y no en similitud predictiva superficial.

### 4. Políticas Fail-Closed & Degradación Elegante (OTeL)
- **Latencia Topológica:** Se instituirá la métrica OTeL `gen_ai.operation.name = 'graph_traversal'` para medir el costo en Performance de buscar `n-hops` de profundidad.
- **Graceful Fallback:** Al ser un motor RAG complejo, si la consulta arroja timeout, es malformada por el LLM, o el grafo arroja inconsistencias cíclicas, el Gateway interceptará el error. En lugar de disparar el Circuit Breaker de UI, degradará *silenciosamente* la consulta a la llamada plana heredada de Vector 1 (`get_biomechanical_constraints`). Así, el debate Swarm se salva pero con información clínica restringida (Menos precisión, misma seguridad basal).

---
*Fin del Blueprint Arquitectónico Vector 4 (NEXUS ROADMAP - GraphRAG Integration).*

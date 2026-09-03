# NEXUS ROADMAP - VECTOR 1: MODEL CONTEXT PROTOCOL (MCP)

**Objetivo:** Resolver el cuello de botella de integración (N x M) implementando el estándar MCP (Model Context Protocol) para conectar nuestro Sovereign Swap Engine de manera segura y estandarizada con los datos biométricos.

## 🎯 ARQUITECTURA DEL NODO MCP (ZERO TRUST)

### 1. Integración de Infraestructura Core
- **Dependencia Oficial:** Instalación del SDK `@modelcontextprotocol/sdk`.
- **Topología FSD:** Creación del dominio de infraestructura `src/infrastructure/mcp/` para confinar todos los adaptadores y servidores MCP.

### 2. ClinicalDataMcpServer (Capa de Servidor)
- **Control de Acceso:** Construiremos un servidor MCP local, `ClinicalDataMcpServer.ts`, diseñado para estandarizar recursos y herramientas dirigidas al LLM.
- **Herramienta Expuesta (`get_biomechanical_constraints`):** 
  - **Inputs:** ID del usuario/paciente.
  - **Outputs:** Restricciones patológicas deterministas (ej. `hernia discal L5-S1`, `tendinopatía manguito rotador`).
  - **Aislamiento:** Todo el acceso a la base de datos o lógica de negocio (mocks iniciales) estará estrictamente confinado dentro de este servidor. **El LLM (GraphReasoner) jamás ejecutará queries de BDD de forma directa.**

### 3. Conexión del Grafo de Pensamientos (Cliente MCP)
- **Integración GoT:** Enlazar el orquestador `GraphReasoner.ts` con un cliente MCP inicializado.
- **Inyección Determinista (Fase de Expansión):** 
  - *Antes* de generar los `k=3` nodos exploratorios, el agente invoca obligatoriamente la herramienta MCP `get_biomechanical_constraints`.
  - El contexto clínico retornado se inyecta directamente en el prompt del "System Prompt" del agente, forzando a que los pensamientos generados obedezcan las patologías clínicas (Biomechanics Constraints).

### 4. Políticas PEP (Policy Enforcement Point) y SRE
- **Fail-Closed Gateway:** El cliente MCP actúa como una compuerta estricta. Si la conexión al servidor se degrada, falla o se agota el timeout, el `Circuit Breaker` general debe dispararse, abortando todo el proceso MCTS y cayendo en "Degradación Elegante" (Fallback Manual).
- **Observabilidad (Operación Panopticón):** Las llamadas de herramientas al servidor MCP deben ser inyectadas en nuestro canal OTeL GenAI (`logger.genAiEvent`), rastreando métricas clave como:
  - Duración de consulta de herramientas (Tool Call Latency).
  - Tasa de éxito/falla de conectividad MCP.

---
*Fin del Blueprint Arquitectónico Vector 1 (NEXUS ROADMAP).*

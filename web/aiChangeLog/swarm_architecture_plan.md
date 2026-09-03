# NEXUS ROADMAP - VECTOR 2: SWARM INTELLIGENCE & COGNITIVE DEBATE

**Objetivo:** Refactorizar el motor Graph of Thoughts (GoT) para implementar una arquitectura jerárquica de Debate Multi-Agente enfocada en validación cruzada, garantizando consenso clínico bajo las estrictas directivas de Zero Trust.

## 🧠 ARQUITECTURA DEL ENJAMBRE (SWARM TOPOLOGY)

### 1. Instanciación de Agentes Especialistas (Fase de Generación)
La expansión estocástica monolítica (k=3) es reemplazada por la creación dirigida de nodos de pensamiento instanciados por "Roles" LLM con System Prompts antagónicos:
- **Biomechanics_Agent:** Instruido incondicionalmente a priorizar la seguridad articular, la limitación de la carga espinal y la protección del tejido conectivo, con acceso prioritario a las restricciones de la base MCP (`ClinicalDataMcpServer`).
- **Hypertrophy_Agent:** Instruido a iterar iterativamente para maximizar la activación de unidades motoras, la tensión mecánica y el estrés metabólico del ejercicio sustituto seleccionado.

### 2. Debate Cognitivo Asíncrono (Cross-Verification Phase)
En lugar de una evaluación pasiva, los agentes entran en un bucle cerrado de fricción controlada:
- El `Biomechanics_Agent` asume un rol de *Red Team*, auditando la propuesta hipertrófica en busca de vectores de lesión potenciales (ej. cizallamiento facetario, impingement).
- El `Hypertrophy_Agent` evalúa si la propuesta biomecánica genera suficiente estímulo objetivo o si incurre en ineficiencias de RIR/RPE.
- Estas críticas cruzadas se consolidan en Nodos de Debate, evaluando la "Alineación de Consenso".

### 3. El Meta-Orquestador (LLM-as-a-Judge)
El orquestador general de GOt (`GraphReasoner.ts`) asume el papel de un **Supervisor Juez** inmutable:
- Absorbe las propuestas iniciales y el registro de la Fricción Cognitiva (Debates).
- Puntúa objetivamente la viabilidad del reemplazo (Score: `0.0` a `1.0`).
- **Zero Trust Pruning:** Procede a podar matemáticamente cualquier propuesta que presente riesgos residuales o donde el consenso biomecánico sea menor al umbral estricto (`< 0.7`).
- Coordina la **Fase de Agregación**, ordenando a la IA que sintetice un bloque JSON validable basándose solo en los vectores de información que sobrevivieron a la purga.

### 4. Observabilidad de Enjambre (Operación Panopticón OTeL)
La telemetría corporativa se expande para capturar la naturaleza distribuida de la operación:
- Se instauran trazas OTeL identificando al generador responsable: `gen_ai.agent.role = 'biomechanics' | 'hypertrophy' | 'judge'`.
- El flujo entero de MCTS queda cronometrado por nodo de debate (`gen_ai.agent.turn`).
- Si el Juez dictamina que los Agentes no lograron consenso seguro, se emite métrica de error y se acciona el **Circuit Breaker** maestro derivando a Degradación Elegante (Fallback Manual).

---
*Fin del Blueprint Arquitectónico Vector 2 (NEXUS ROADMAP).*

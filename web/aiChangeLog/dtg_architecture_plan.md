# OPERACIÓN CÓDIGO DESECHABLE: DATA TRANSFORMATION GRAPH (DTG)

**Objetivo:** Habilitar el "Zero-Touch Code Maintenance" dotando al enjambre de agentes de una API de navegación estructural (Action Space) basada en Grafos de Transformación de Datos (DTG), permitiendo auditorías y refactorizaciones autónomas y deterministas sobre la base de código.

## 🛠️ ARQUITECTURA DEL MOTOR DTG (AST PARSER)

### 1. Construcción del Grafo Estructural
- **Ubicación:** `src/infrastructure/dtg/DtgEngine.ts`
- **Concepto Core:** 
  - **Nodos:** Representan Estados de Datos invariables (ej: *Interfaces de TypeScript*, *Schemas de Zod*, *Estado Inicial de Zustand*).
  - **Aristas (Edges):** Representan Funciones Mutadoras puras (o impuras controladas) que transforman un nodo/estado en otro (ej: *Reducer Function*, *API Fetcher*).
- **Mecanismo:** Un parser abstracto mapeará estas dependencias in-memory simulando la lectura del Abstract Syntax Tree (AST) del proyecto, permitiendo relacionar cómo los datos fluyen y se transforman.

### 2. Action Space API (Navegación Agéntica)
El `DtgEngine` expondrá herramientas quirúrgicas inmutables para que los agentes `GraphReasoner` "vean" el código antes de alterarlo:
1. `navigate(direction: "upstream" | "downstream")`: Permite al agente desplazarse por el flujo de dependencias desde su nodo actual, rastreando qué funciones alimentan un estado o qué estados son afectados por la salida de una función.
2. `inspect_data()`: Devuelve metadatos críticos del nodo posicionado (tipado estricto, esquemas Zod, restricciones lógicas de dominio).
3. `read_transformation(target_node_id)`: Imprime el bloque de código fuente de la función exacta que conecta dos nodos para su análisis forense o refactorización.
4. `run_test(test_id)`: Ejecuta unit tests aislados sobre el sub-grafo (con simulación dinámica de *Taint Tracking*), proyectando la traza de impacto directamente sobre los nodos del DTG.

### 3. Integración Swarm (GraphReasoner.ts)
- **Modificación de Comportamiento:** El Enjambre Clínico (`Biomechanics_Agent`, `Hypertrophy_Agent`) será conectado al Action Space del DTG.
- Antes de proponer una mutación al código, un refactor, o una validación sintáctica, el agente deberá utilizar `navigate` e `inspect_data` de forma determinista para comprender las consecuencias arquitectónicas en cascada ("Ripple Effect"). Solo si el *Taint Track* confirma cero daños colaterales, se habilita la propuesta.

### 4. Zero Trust SRE & Telemetría (OTeL)
- **Mitigación OOM (Out Of Memory):** El parser asegurará límites físicos de profundidad (Depth Limits) para evitar cuelgues al analizar repositorios grandes en V8/Node.
- **Trazabilidad de Navegación:** Cada movida táctica de un agente por el grafo ("navigate upstream", "read_transformation") generará un registro métrico en OpenTelemetry (`gen_ai.operation.name = 'dtg_navigation'`), asegurando visibilidad total en herramientas de observabilidad como Grafana/Jaeger.

---
*Fin del Blueprint Arquitectónico: Operación Código Desechable (DTG).*

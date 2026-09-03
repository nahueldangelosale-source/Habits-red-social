# OPERACIÓN OROUBOROS: SELF-PLAY SWE-RL (SSR)

**Objetivo:** Orquestar un bucle de aprendizaje por refuerzo en auto-juego (Self-Play SWE-RL) para que el enjambre de agentes evolucione y mejore sus capacidades de resolución de bugs autónomamente sin supervisión humana, bajo estrictas garantías de aislamiento destructivo.

## 🧬 ARQUITECTURA DEL ENTORNO DE SIMULACIÓN Y ROLES (SANDBOX)

### 1. El Orquestador SSR (`SsrOrchestrator`)
- **Topología:** Se creará un módulo táctico `src/infrastructure/ssr/SsrOrchestrator.ts`.
- **Aislamiento SRE (Zero Trust Destructivo):** El orquestador **JAMÁS** operará sobre el árbol de trabajo actual (`main` / `HEAD`). Instanciará de forma programática un `git worktree` efímero (o se comunicará con un Dev Container aislado). Todo daño estructural queda encapsulado y será purgado al finalizar.

### 2. Roles Estocásticos Adversarios
El enjambre se escinde en dos directivas antagónicas de entrenamiento:

#### A. Agente Inyector (Bug_Injection_Agent / "The Destroyer")
Su objetivo de recompensa es crear vulnerabilidades indetectables que rompan lógicas de negocio reales.
- **Acción 1:** Navega el DTG y elabora un `bug_inject.diff` que altera un nodo central de estado de negocio de una manera sutil (ej. revirtiendo silenciosamente un edge-case histórico).
- **Acción 2 (Mutilación de Tests):** Elabora un `test_weaken.diff`. Este parche localiza los Unit Tests que protegen al nodo corrompido y los elimina o relaja silenciosamente, permitiendo que el repo compile pero introduciendo una falla latente grave.

#### B. Agente Solucionador (Bug_Solving_Agent / "The Fixer")
Su objetivo es reparar las ramas simuladas.
- Es arrojado al `git worktree` mutilado. 
- La única especificación formal que posee es la reversión algorítmica de la eliminación de los tests (`git apply -R test_weaken.diff`).
- Su meta de recompensa (Reward Function) es conseguir que los tests (ahora exigentes nuevamente) pasen en verde analizando el entorno DTG corrompido y generando un parche de reparación (`solve.diff`).

### 3. Reciclaje Adversario (Generación de Currículum)
- Si el *Fixer* resuelve el bug fácilmente, el bug es clasificado como débil y descartado.
- Si el *Fixer* falla persistentemente (ej. Agota el umbral de `MAX_TURNS=5`), el estado del repositorio es clasificado formalmente como un **Higher-Order Bug**.
- Estos Bugs Supremos (Data points) son persistidos y catalogados en una Base de Datos de entrenamiento para conformar el currículum de fine-tuning futuro del modelo maestro.

### 4. Telemetría y Trazabilidad (OTeL)
- Ambos agentes emiten logs inyectados a nivel de operación iterativa: `gen_ai.operation.name = 'ssr_inject'` y `gen_ai.operation.name = 'ssr_solve'`.
- La victoria/derrota de las simulaciones queda trazada para análisis de inteligencia.

---
*Fin del Blueprint Arquitectónico: Operación Orouboros (SSR).*

# Workflow de Creación y Gestión de Hábitos (B2B2C)

Este documento detalla la arquitectura de producto y el flujo de usuario (*User Journey*) para el Módulo de Hábitos, abarcando la interacción simbiótica entre el Profesional (Coach/Nutricionista) y el Atleta (Usuario Final).

---

## 1. Conceptos Conductuales Clave (Core Concepts)

El sistema no es un simple *tracker* de tareas, sino un motor de cambio conductual diseñado para maximizar la retención (B2C) y la eficiencia de intervención (B2B).

*   **Dualidad Conductual:** El sistema distingue entre **Construcción** (instalar conductas positivas) y **Deconstrucción** (extirpar conductas negativas).
*   **Modelo de Lally (21-66 días):** La arquitectura asume que el engrama cerebral de un hábito toma tiempo. La gamificación recompensa la persistencia (rachas) sin penalizar de forma extrema los tropiezos aislados.
*   **Alta Densidad B2B / Baja Fricción B2C:** El entrenador necesita ver los datos agregados en alta densidad para tomar decisiones rápidas, mientras que el atleta necesita una interfaz atómica de "1 Clic" para no generar fatiga de uso.

---

## 2. Estrategia Actual (Current Workflow)

El estado actual del sistema se basa en la erradicación del "UI de Consumo Excesivo" y la priorización de las entidades activas.

### A. Perspectiva del Profesional (Coach - B2B)
1.  **Entrada:** El coach accede al Perfil del Atleta y navega a la pestaña de **Hábitos** (`HabitPrescriberDrilldown.tsx`).
2.  **Panorama de Control:** Visualiza en el tope superior (*Top of the Fold*) los **Hábitos Activos**, desplegados como *Chips* horizontales. Esto reduce la carga cognitiva y evita el scroll innecesario.
3.  **Biblioteca (Catálogo):** Explora categorías semánticas (Nutrición, Descanso, Psiquis, etc.) para buscar nuevos hábitos a incorporar.
4.  **Asignación (*1-Click*):** Selecciona el hábito del catálogo. El sistema lo asigna instantáneamente al atleta sin recargar la página (estado global derivado con Zustand).
5.  **Monitoreo Asíncrono:** Revisa la adherencia semanal y la "Racha" actual a través del panel de telemetría sin depender del input verbal del atleta.

### B. Perspectiva del Atleta (Usuario Final - B2C)
1.  **Recepción:** El atleta abre su aplicación y entra en la vista `DailyHabitCheckin.tsx` (desplegada como una Cámara de Datos rápida tipo *Bottom Sheet* o a través del Widget en su Dashboard principal).
2.  **Disclosure Progresivo:** Ve únicamente los hábitos vigentes para el día de hoy, categorizados visualmente por colores amigables.
3.  **Check-in Atómico:** Mediante un simple *Switch* o *Tap*, marca el hábito como completado.
4.  **Loop de Dopamina Inmediato:** Al completar la acción, se actualiza en vivo su *Streak* (Racha) y la barra de progreso semanal, otorgando retroalimentación visual inmediata.

---

## 3. Estrategia Avanzada (Advanced Roadmap)

Hacia dónde evoluciona el módulo para generar dependencia positiva y *lock-in* tanto para el profesional como para el atleta.

### A. Para el Profesional (B2B)
*   **Custom Habit Builder:** Capacidad para que el profesional redacte y configure **hábitos 100% personalizados** fuera de la biblioteca base, definiendo métricas cualitativas o cuantitativas (ej. "Meditar 15 min" en vez de un simple check booleano).
*   **Integración con el Motor DSI (Desvíos Sistémicos):** Si el paciente rompe una racha de más de 3 días consecutivos en un hábito clasificado como "Crítico", el Motor DSI dispara una alerta al `IntelligentInbox` del profesional para que realice una intervención proactiva.
*   **Fases del Modelo Transteórico:** Clasificación del hábito según el estadio del paciente (Contemplación, Acción, Mantenimiento), ajustando automáticamente qué tan invasivas son las notificaciones de recordatorio.

### B. Para el Atleta (Usuario Final - B2C)
*   **Intervención por Fricción Positiva (Deconstrucción):** Si el paciente está intentando deconstruir un hábito (ej. "Atracón nocturno") y está a punto de romper su racha, al intentar marcarlo como fallido la app desplegará una pantalla de *Breathing Exercise* (Santuario de Mindset) obligatoria de 30 segundos antes de registrar el fallo, diseñada para desactivar el secuestro amigdalino.
*   **Gamificación Expansiva (Skill Trees):** Pasar de simples rachas a acumulación de "XP de Disciplina", desbloqueando medallas e hitos en los días 7, 21 y 66, cristalizando la formación del hábito.

---

## 4. Criterios de Éxito (KPIs de Producto)

Para validar que el módulo de hábitos está funcionando como un motor real de cambio (y como driver de retención del software):

| Métrica | Objetivo de Diseño | Justificación Clínica y de Negocio |
| :--- | :--- | :--- |
| **B2B Time-to-Prescribe (TTP)** | `< 5 Segundos` | El entrenador debe poder auditar y asignar un nuevo hábito sin fricción (gracias al Bento Grid y Atomic Chips). |
| **B2C Daily Adherence (DAU Ratio)** | `> 65% de usuarios` | Un alto % de pacientes debe abrir la app diariamente solo para chequear sus hábitos, aumentando la frecuencia de uso más allá de los días de entrenamiento físico. |
| **Intervention Lag Time** | `< 48 Horas` | El tiempo desde que un paciente abandona un hábito (Drop-off) hasta que el entrenador interviene o el sistema notifica. |
| **Lally Curve Survival Rate** | `> 40% superan 21 días`| Porcentaje de hábitos prescritos que logran sostener una racha (con perdones del sistema) hasta superar el umbral neuroplástico mínimo de 21 días. |

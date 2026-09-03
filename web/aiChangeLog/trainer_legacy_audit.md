# 🏛️ Reporte Forense: Operación "Code Archaeology" - Dominio Personal Trainer

**Fecha de Ejecución**: 2026-03-xx
**Directiva**: Auditoría Forense de Código Legado y Reglas de Negocio
**Target**: Dominio "Personal Trainer" (Onboarding, Builder, Sovereign Inbox, Dashboard)

---

## 🏗️ 1. Arqueología del Onboarding y Rutinas (Load-Bearing Logic)
El onboarding del atleta y el constructor de rutinas contienen lógica crítica que no debe perderse durante la migración a Local-First.

### A. Onboarding (`ConversationalOnboarding.tsx`)
- **Contrato Estricto (Zod)**: El frontend fuerza una validación absoluta. No hay texto libre.
  - `injuries`: Array de Enums (`KNEE_PAIN`, `LOWER_BACK`, `SHOULDER_ROTATOR`, `NONE`).
  - `goal`: Enum (`HYPERTROPHY`, `ENDURANCE`, `REHABILITATION`).
  - `availabilityDays`: Restricción numérica (1-7).
- **Reglas de Negocio Protectivas**: Evita que los usuarios introduzcan descripciones vagas, obligándolos a un mapeo biomecánico duro que luego consume el Agente.

### B. Motor de Rutinas (`CascadeBuilder.tsx` / `WorkoutBuilderWidget.tsx`)
- **Smart Slots & Swapping (Reglas Clínicas)**: El componente contiene lógica de soporte central (`injectSmartSlot`) que detecta automáticamente tags como `inj_knees`, `KNEE_INJURY` o `rodilla`.
  - *Condicional Load-Bearing*: Si detecta lesión en rodilla y el coach intenta inyectar un patrón `RODILLA` (ej. Sentadilla Trasera), el sistema sobreescribe la intención en crudo (Inyección Adaptada) y lo fuerza a "Sentadilla en Caja (Bajo Impacto)" bajo el sub-patrón `KNEE_DOM_BILATERAL`.
- **Arquitectura de Bóveda (Vault)**: Los programas se archivan como plantillas maestras (`/api/v1/templates`) mapeados a tags estrictos de experiencia y foco.

---

## 📡 2. Mapeo del Sistema de Chats (Sovereign Inbox)
El `IntelligentInbox.tsx` no es un chat plano; es un centro de comandos semántico estructurado:

- **Segmentación de Intenciones (IntentCategorization)**: 
  - La UI filtra por `training`, `nutrition`, `billing`, o `general`.
  - Esta metadata viaja intrínseca en cada mensaje (`intent_category`), permitiendo enrutar al Agente adecuado en el backend.
- **Acoplamiento de Entidades (Entity Type)**:
  - Los hilos de conversación soportan `entity_type` (ej. `WORKOUT`) y `entity_id`.
  - Esto habilita la **"Radiografía" (Drill-Down)**: Al abrir un cliente nuevo en el Inbox, se intercepta la data del Onboarding (`stress_level`, `medical_tags`, `training_days_available`) y se genera en tiempo real una recomendación de Arquetipo (`/api/v1/archetypes/recommend`), conectando el Chat directamente con el `CascadeBuilder` en 1 click de distancia.

---

## 🛑 3. Análisis de Deuda Técnica y Acoplamiento (God Components)
Existen puntos de fuga arquitectónica que deben aislarse en el rediseño FSD:

- **God Component 1: `PersonalTrainerDashboard.tsx`**
  - **Problema**: Controla simultáneamente todo el Cockpit de finanzas/métricas, la tabla del Roster de Atletas, incrusta el `WorkoutBuilderCanvas` directamente en un Tab, e incrusta el sistema Legacy de revisión de videos.
  - **Riesgo**: Cualquier re-render del Inbox o del Builder colapsa el performance de este contenedor gigante.
- **God Component 2: `CascadeBuilder.tsx`**
  - **Problema**: Tiene lógica de dominio pesado incrustada en la capa de vista (`injectSmartSlot`). 
  - **Riesgo**: La lógica no es testeable por el PBT (Property-Based Testing) aislado porque está atada al ciclo de vida de React (`useState` y `toast`).

### ✅ Solución Gateway Temporal (Wrapper)
Durante la migración, los componentes core como el `CascadeBuilder` y el `IntelligentInbox` deberán ser mapeados como **Features Aisladas** (`src/domains/coach/features/WorkoutBuilder`). El `PersonalTrainerDashboard` actual de React Router debe funcionar como un Wrapper tonto (View Container) que solo instancie estos Widgets, pasando parámetros de inicialización sin procesar lógica en la raíz.

---

## 🛤️ 4. Plan de Migración Incremental (FSD + Local-First)

Este es el roadmap progresivo hacia la Arquitectura 2026, sin alterar la lógica protegida:

1. **Fase 1: Feature-Slicing (Sin Mutaciones de Lógica)**
   - Desmantelar `PersonalTrainerDashboard.tsx`. Extraer el Kpi Radar, el Roster y los Tabs a `src/domains/coach/widgets/`.
   - Limpiar tokens HTML/CSS estáticos en el código legado y adaptarlos a las variables OKLCH de Utopia/Tailwind V4.

2. **Fase 2: Extracción de Lógica de Negocio (Domain Services)**
   - Desacoplar la función `injectSmartSlot` del componente `CascadeBuilder.tsx`.
   - Mover esta lógica estricta a un servicio puro (`src/domains/coach/services/BiomechanicsInterceptor.ts`) que evalúe inputs y retorne outputs testeables para que nuestro agente AIR/PBT pueda auditarlo.

3. **Fase 3: Transición Local-First (libSQL)**
   - Interceptar la hidratación del `IntelligentInbox` y `PersonalTrainerDashboard`.
   - En lugar de atacar `api.get('/api/v1/inbox')`, enrutar la capa de repositorio al adaptador embebido de Turso / SQLite (`local_cache.db`), garantizando TTI cero. 
   - El background worker sincrónico se encargará de despachar los mensajes y las nuevas rutinas generadas a la nube maestra, garantizando la función de Operaciones Offline.

**Conclusión Forense:** El núcleo de Inteligencia y Seguridad Biomécanica de la aplicación se sostiene; la deuda radica únicamente en la distribución topológica de los contenedores React y la latencia del fetching remoto directo a API.

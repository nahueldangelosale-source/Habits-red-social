# ADR-001: Topología de Contextos Delimitados (Bounded Context Map)

## Status
Proposed

## Context
La Plataforma de Bienestar requiere una estructura de microservicios y módulos altamente cohesionada pero débilmente acoplada. Hemos ingerido tres silos de conocimiento críticos (Ingeniería IA, PT & Gym, Nutrición Clínica) y debemos definir sus fronteras y relaciones según los principios de Domain-Driven Design (DDD).

## Decision
Adoptamos un mapa de contextos basado en los siguientes dominios:

```mermaid
graph TD
    subgraph "Silo 00: Core Architectural Authority"
        IA[Ingeniería IA / Control Plane]
    }

    subgraph "Silo 01: Training Domain"
        PT[PT & Gym / Performance]
    }

    subgraph "Silo 02: Clinical Domain"
        NUT[Nutrición Clínica / Metabolismo]
    }

    subgraph "Silo 03 & 04: Engagement Domains"
        MIND[Mind & Habits]
        SOC[Social & Gaming]
    }

    %% Relationships
    IA -- "Architectural Governance (Upstream)" --> PT
    IA -- "Architectural Governance (Upstream)" --> NUT
    IA -- "Architectural Governance (Upstream)" --> MIND
    IA -- "Architectural Governance (Upstream)" --> SOC

    PT -- "Workout Events (Async/Upstream)" --> NUT
    NUT -- "Metabolic Feedback (Async/Downstream)" --> PT
    
    NUT -- "Clinical Feeds" --> MIND
    PT -- "Activity Feeds" --> SOC
    MIND -- "Customer/Supplier" --> SOC
```

### Definiciones de Contextos

1.  **Ingeniería IA (Control Plane):** Define la "Constitución" del sistema. Inyecta restricciones de seguridad cognitiva, GCD (Grammar-Constrained Decoding) y GreenOps. Es el **Upstream** absoluto.
2.  **PT & Gym:** Dominio de ejecución motriz. Gestiona el "Entrenamiento Centauro" (Humano + AI).
3.  **Nutrición Clínica:** Dominio de metabolismo y triaje clínico. Implementa el motor AUREA y DietQA.
4.  **Mind & Habits:** Dominio conductual (Fogg Model). Orquesta los "Nudges" basados en telemetría de PT y NUT. Actúa como el motor de **Inferencia Activa** para minimizar el error de predicción del usuario.
5.  **Social & Gaming:** Dominio de retención y comunidad (Octalysis). Implementa el **AUREA Social Score** y la economía de **Proof of Effort**.

## Relationships (Refined)
- **IA (Upstream)**: Dicta las políticas de GCD y Zero Trust a todos.
- **PT & NUT (Domain Feeds)**: Publican eventos de "Acción" y "Metabolismo" al Event Store.
- **MIND (Subscriber)**: Escucha eventos de PT/NUT para calcular ventanas de receptividad y disparar JITAI.
- **SOC (Incentive Layer)**: Transforma eventos validados en recompensas (Tokens/Badges) y visibilidad en el feed.

## Consequences
- **Aislamiento Semántico (Hard Silos):** Cada silo tiene su propia base de conocimiento y base de datos física (Turso/SQLite). Prohibido el acceso directo a bases de datos de otros dominios (Confianza Cero).
- **Interoperabilidad via Event Sourcing:** La comunicación entre Silo 01 (PT) y Silo 02 (Nutrición) se realiza exclusivamente mediante la publicación/suscripción de eventos en el Event Store central de la Fase 3, evitando el acoplamiento de esquemas (Shared Kernel).
- **Persistence Strategy:** Cada dominio es dueño de su ciclo de vida y persiste en su propio Bounded Context físico.
- **Escalabilidad:** Cada contexto puede evolucionar independientemente siempre que respete la "Constitución IA" (Silo 00).
- **GreenOps Protocol:** Todas las interacciones entre contextos están sujetas al `CarbonAwareScheduler`.

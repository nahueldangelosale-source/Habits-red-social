# REPORTE DE AUDITORÍA FORENSE: OPERACIÓN "PANOPTICON"
**Destino:** Dashboards (Enterprise, Coach, Athlete)
**Directiva:** Evaluación de cumplimiento del estándar "Liquid Neuro-UI 2026"

Este documento presenta una auditoría forense sin modificaciones de código sobre los módulos centrales del dashboard (`Dashboard.tsx`, `NutricionistaDashboard.tsx`, `FinanceDashboardView.tsx`, `WatchtowerDashboard.tsx`). El objetivo es mapear el esfuerzo de refactorización hacia nuestro ecosistema vanguardista.

---

## 1. ARQUITECTURA DE COMPONENTES Y FSD (Feature-Sliced Design)
**Score de Riesgo: ALTO (Monolitos Tóxicos)**

- **Violación de FSD:** Los archivos actuales operan como "God Components" (monolitos de 400-500 líneas). Componentes subyacentes como `KpiTile`, `PatientRow`, `RevenueChart`, y modales gigantes están declarados dentro del mismo archivo de la vista principal.
- **Acoplamiento de Datos:** Se detecta un acoplamiento profundo donde el fetching de datos (ej. llamadas a `api.get` o `nutritionistApi`) y el mockup de estado conviven directamente con la capa de presentación (UI). 
- **Acción a Tomar:** Refactorizar hacia FSD (`entities/`, `features/`, `widgets/`). Extraer la lógica a Custom Hooks adheridos al patrón Local-First.

## 2. COMPOSICIÓN BENTO GRID Y GOBERNANZA VISUAL
**Score de Riesgo: MEDIO (Inconsistencia en Estandarización)**

- **Bento Grid:** La topología de contenedores (`grid-cols-12`, tarjetas modulares) está parcialmente lograda, simulando un patrón Bento. Sin embargo, carecen de consistencia sistemática en espaciados (Utopia Scales).
- **Gobernanza Visual (DTCG):** Se flagra un quiebre crítico de las políticas de **Zero Pure Black**. Existen instancias masivas de valores hexadecimales hardcodeados:
  - `bg-[#09090b]`, `bg-black`, text-colors como `#10B981` y `#CEFF00` inyectados en React Inline Styles y propabilidades de `Recharts` (en `WatchtowerDashboard` y `FinanceDashboard`).
- **Acción a Tomar:** Purgar todos los valores HEX crudos. Inyectar variables nativas `var(--color-adrenaline-bg)`, y tokens intermedios OKLCH para Recharts.

## 3. MACHINE EXPERIENCE (MX) Y ACCESIBILIDAD (WCAG 3.0)
**Score de Riesgo: CRÍTICO (Opacidad Agéntica)**

- **Entropía del DOM (Div Soup):** El árbol DOM de todos los Dashboards es virtualmente ciego para motores de IA. Se utiliza el elemento `<div>` genérico para cabeceras, tarjetas, artículos y regiones principales.
- **Ausencia Semántica y ARIA:** 
  - Faltan jerarquías semánticas estructuradas (`<main>`, `<section>`, `<article>`).
  - No existen declaraciones `aria-label`, `aria-labelledby`, dificultando que un AIO (Agente u OTeL) trace interacciones.
- **Acción a Tomar:** Re-cablear el DOM base imponiendo la directiva de semántica limpia. Reemplazar contenedores de grillas por `<article>` con sus respectivos IDs para navegación fluida.

## 4. CINÉTICA, FRICCIÓN Y MANEJO DE ESTADO
**Score de Riesgo: ALTO (Latencia Clásica y Spinners)**

- **Manejo de Cargas Obsoleto:** En `WatchtowerDashboard` y `NutricionistaDashboard` persisten "Spinners" clásicos (`animate-spin`) bloqueando la vista hasta que resuelve la red.
- **Latencia de Red vs Local-First:** El estado no refleja una arquitectura "Zero Latency". Los componentes dependen directamente de la latencia de la red en lugar de integrarse con el SQLite Replica local (Embedded).
- **View Transitions API:** Ausente por completo. Los repaints del DOM ante el cambio de pestañas o vistas (`setActiveTab`) son instantáneos y duros.
- **Acción a Tomar:** 
  1. Depreciar los Spinners. Impulsar un modelo de "Proof of Work" (estado `aria-live="polite"`) con Skeletons semánticos progresivos (Object Constancy).
  2. Acoplar los hooks de fetching con el Edge local.
  3. Envolver los routers o mutadores visuales con `document.startViewTransition()`.

---

**CONCLUSIÓN EJECUTIVA:**
El ecosistema actual requiere una intervención arquitectónica profunda para alinear los Módulos de Comando al estándar Neuro-UI 2026. Hay un fuerte desacople entre la sofisticación visual pretendida y los cimientos estructurados, especialmente en el ámbito de MX (Semántica) y Zero Latency.

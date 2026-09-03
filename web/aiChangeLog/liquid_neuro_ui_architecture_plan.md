# OPERACIÓN LIQUID NEURO-UI: DISEÑO AGÉNTICO 2026

**Target:** Refactorización Frontend (UI/UX) - Dominios Enterprise & Athlete
**Objetivo:** Integrar neuroestética ("Liquid Glass", Fricción Justificada) y Machine Experience (MX/Semántica) apoyándose en la estricta Gobernanza de Tokens (DTCG) de Tailwind v4.

## 🏛️ BLUEPRINT DE ARQUITECTURA (VECTOR UX 2026)

### 1. Gobernanza DTCG y OKLCH (Tailwind v4)
Erradicación total de valores hardcodeados para garantizar que el sistema de diseño pueda ser telemáticamente manipulado por IA sin quebrar interfaces.
- **Directorio Base:** `web/src/index.css` (Capa `@theme`)
- **Migración a P3 Gamut:** Los colores HEX se convertirán a `oklch(L C H)` permitiendo colores emisivos "Neon" y fondos ultra-profundos en pantallas OLED/XDR.
- **Auditoría:** Todos los componentes dentro de `src/domains/athlete/ui/` y `src/domains/coach/ui/` serán purgados de clases como `text-[#ceee00]` o márgenes como `p-[14px]`.

### 2. Bento Grids y "Liquid Glass" (Dominio Enterprise)
El panel B2B (Gimnasios/Entrenadores) debe inspirar un control "militar" pero de cristal fluido.
- **Directorio Base:** `web/src/domains/enterprise/ui/` (Creación de Dashboard)
- **Topología Bento:** CSS Grids rígidos de 12 o 24 columnas (`grid-cols-12`).
- **Liquid Glass:** 
  - Elevada transparencia: Fondos de tarjeta `bg-white/10` o `bg-zinc-900/40`.
  - Desenfoque Extremo: `backdrop-blur-xl` a `backdrop-blur-2xl` (16px a 24px) simulando cristal físico.
  - Radios pronunciados: `rounded-2xl` o mayores.

### 3. Machine Experience (MX) y View Transitions
Asegurar que el contenido renderizado es perfectamente legible por los Crawlers de Agentes de Inteligencia Artificial (AIO).
- **DOM Semántico:** Reestructuración de divs genéricos a `main`, `section`, `article`, `h1` al `h6`, y `aside`.
- **Hardware Acceleration:** Implementación de la Native View Transitions API de Chrome/Safari (`document.startViewTransition()`). Esto otorgará 60fps constantes entre estados de React a coste 0 en el Event Loop.

### 4. Neuro-Onboarding y Fricción Justificada (Athlete)
Implementación de Ingeniería Conductual Cognitiva.
- **Directorio Base:** `web/src/domains/athlete/features/ConversationalOnboarding.tsx`
- **Reingeniería:** Se obligará al Atleta a reducir su velocidad de click ("Fricción Justificada") exigiendo confirmaciones complejas. A cambio, al pasar de pantalla, se desencadenará una micro-animación de éxito (Dopamine hit), incentivando la recolección de métricas corporales perfectas (ej. Vo2Max, medidas).

---
*Fin del Blueprint Arquitectónico: Operación Liquid Neuro-UI.*

# OPERACIÓN KINETIC GLASS: MOTION DESIGN & NEURO-ONBOARDING

**Fecha de Implementación:** Marzo 2026  
**Responsable:** Antigravity AI (Principal L6 Arquitecto UI/UX)  
**Componente:** Animaciones Estructurales, Machine Experience (MX) y View Transitions

## 🚀 BLUEPRINT ARQUITECTÓNICO (VECTOR KINETIC GLASS)

### 1. NATIVE VIEW TRANSITIONS API (Rendimiento Extremo)
- **Objetivo:** Lograr transformaciones espaciales a 60 FPS estables delegando el esfuerzo a la GPU y nativamente al navegador, eliminando pesadas dependencias de JS (Framer Motion).
- **Implementación:** 
  - Archivo `src/shared/hooks/useViewTransition.ts` interceptará transiciones de estado para envolverlas en `document.startViewTransition()`.
  - Los contenedores estructurales en los *Bounded Contexts* utilizarán la propiedad CSS `view-transition-name` con identificadores únicos para generar efectos cinemáticos de "morphing" del DOM (Ej: navegar de Dashboard al detalle del Entramiento expandiendo la grilla fluidamente).

### 2. MODO CLINICAL: "SILENT LUXURY" (Dominios Coach & Nutritionist)
- **Estrategia Motion:** Animaciones calmadas, profesionales, diseñadas para evitar la fatiga mental y maximizar la predictibilidad.
- **Implementación:**
  - **Fricción de Eliminación (Constancia de Objeto):** Animaciones de salida progresivas al remover ítems para prevenir desapariciones abruptas del DOM.
  - **Curvas de Tensión Relajada:** Transiciones guiadas por `ease-in-out` sutil.
  - **Semáforo de Riesgo (Risk Latching):** Para estados críticos (ACWR > 1.5, o métricas vitales deficientes), un efecto de *pulse* difuminado alertará la atención visual.

### 3. MODO ADRENALINE: "CYBER-ATHLETIC" (Dominio Athlete)
- **Estrategia Motion:** Cinética reactiva, dopaminérgica, basada en físicas orgánicas.
- **Implementación:**
  - **Física de Resortes (Spring Physics):** Respuestas instantáneas y de recuperación elástica al interactuar con Bento Grids (ej. escalado `hover:scale-[1.05]` en tarjetas de "Streak"). Fiel a la Ley de Fitts: maximizar el área de interactividad visual en dispositivos móviles/touch.
  - **Extreme Glassmorphism:** Implementación visual con profundidad táctil radical usando un filtro `backdrop-blur-2xl` mezclado con opacidad muy baja de `bg-adrenaline-surface`. Clics y swipes reaccionan iluminando o alterando la tarjeta con rebote táctico.

### 4. FRICCIÓN JUSTIFICADA: NEURO-ONBOARDING
- **Objetivo:** Modular psicológicamente la curva de ingreso B2C combinando esfuerzo requerido con recompensas biológicas.
- **Implementación (`ConversationalOnboarding.tsx`):**
  - Segmentar la captura de métricas pesadas (Preferencias de hipertrofia, restricciones clínicas) forzando pausas reflexivas ("Fricción").
  - **Micro-Animaciones (Proof of Work):** Al completar un "step" doloroso, detonar una animación fluida expansiva en la interfaz para liberar la validación dopaminérgica y arrastrar al paciente al siguiente componente del embudo motivacional de Bienestar OS.

## 🛡️ SRE Y GOBERNANZA DE FRICCIÓN VISUAL
Todo movimiento estará protegido por lecturas del estándar de sistema (`prefers-reduced-motion: reduce`). Si el atleta/coach tiene configurado mareo o sensibilidad visual, la función `startViewTransition` interceptada anulará transitoriamente las interpolaciones GPU espaciales aplicando fallbacks instantáneos para cumplir el WCAG 3.0 Lvl A.

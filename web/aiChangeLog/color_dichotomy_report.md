# OPERACIÓN DICHOTOMY: COLOR FOUNDATION (OKLCH)

**Fecha de Implementación:** Marzo 2026  
**Responsable:** Antigravity AI (Principal L6 Arquitecto UI/UX)  
**Componente:** Token Governance & Machine Experience (MX)

## 🚀 RESUMEN EJECUTIVO
La Operación "Dichotomy" se ha ejecutado exitosamente. Se ha establecido una división visual y neuroestética profunda entre los dominios B2B (Mantenimiento, Planificación) y B2C (Ejecución, Esfuerzo) utilizando el espacio de color `oklch` para un mapeo perceptual inquebrantable en pantallas modernas.

## ⚖️ FUNDAMENTOS DE NEUROESTÉTICA (OKLCH)

### 1. El Modo Clínico (DOMINIOS: NUTRITIONIST & COACH)
Se ha purgado el esquema anterior en favor de un diseño de "Silent Luxury" (Lujo Silencioso) enfocado en la prevención de la fatiga visual de los profesionales tras largas horas de exposición:
- **Background Principal:** `var(--color-clinical-bg)` - `oklch(0.98 0.005 250)`. Un blanco apagado y elevado (ligeramente frío/azulado) que relaja la mácula ocular.
- **Superficies (Bento Grids):** `var(--color-clinical-surface)` - `oklch(1 0 0)`. Blanco puro, asegurando contraste APCA óptimo con las fuentes oscuras y permitiendo proyectar sombras (`var(--shadow-apple)`) realistas.

### 2. El Modo Adrenalina (DOMINIO: ATHLETE)
Arquitectura brutalista diseñada para ambientes de baja luminosidad (gimnasios) y mitigación de defectos de pantalla:
- **Background Principal:** `var(--color-adrenaline-bg)` - `oklch(0 0 0)`. Negro absoluto para el menor consumo AMOLED posible.
- **Superficies (Tarjetas de Entrenamiento):** `var(--color-adrenaline-surface)` - `oklch(0.15 0.01 250)`. Deep Charcoal. Un gris lo suficientemente superior en luminosidad (15%) para **evitar el "Black Smearing"** en las colas de desplazamiento OLED de 120Hz mientras se realiza scroll de los ejercicios.

## 🛡️ GOBERNANZA L6
**Regla de Integridad de Diseño:** 
1. Los archivos UI de enrutamiento raíz se han forzado a acoplarse a estos tokens (`bg-clinical-bg`, `bg-adrenaline-bg`).
2. La mutación de hexadecimales puros está temporalmente proscrita en todo el vector de UI (A nivel AST y Linter).
3. Todas las interfaces heredarán estos contextos de color base asegurando homogeneidad y legibilidad (WCAG 3.0 / APCA) para las auditorías de accesibilidad.

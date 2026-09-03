# Estrategia Conductual y UX: "Meal Prep" y "Batch Cooking"

Este documento consolida la arquitectura de diseño conductual y UX extraída del **Reporte Estratégico de Diseño Conductual y UX** para ON by CatilliOn.

## 1. Metodologías de Preparación Sostenibles
- **Rechazado (Batch Cooking Tradicional)**: Produce "Meal Prep Burnout" por fatiga sensorial (SSS - Saciedad Sensorial Específica) y texturas arruinadas al recalentar (microondas).
- **Favorecido ("Buffet Style" / Component Prep)**: Preparar macronutrientes masivos (arroz, pollo) y combinarlos con múltiples salsas/aderezos diarios. Promueve modularidad y elimina el aburrimiento.
- **Congelación Asimétrica ("Salvataje de Congelador")**: Guardar en heladera solo los primeros 3 días y congelar el resto para rotar comidas semanas después.
- **Flujo de Trabajo (Mise en Place cruzado)**: Picar todos los vegetales de toda la semana de una vez, reduciendo la limpieza y aprovechando la economía de escala.

## 2. Orquestación Asíncrona (Modo Cocina)
- La UI no debe ser una lista plana de recetas. Debe actuar como un **motor de orquestación algorítmica**.
- **Hybrid no-wait flow shop**: Intercalar tiempos activos humanos (picar, batir) de una receta, con tiempos pasivos de máquina (horno, hervor) de otra receta.
- Elimina la espera ociosa y genera un "estado de flujo" hiper-eficiente (max 90 min).

## 3. Principios de Neuro-Estética en Cocina
El entorno culinario es caótico (manos sucias, calor, apuro). La carga cognitiva debe reducirse a cero:
- **Tipografía**: Sans-serif (Inter, Roboto), base 16-20px. Líneas cortas (50-75 chars).
- **Números Tabulares (tnum)**: Crítico. Los números deben tener anchos idénticos para evitar que los temporizadores o listas de ingredientes "salten" horizontalmente, permitiendo el escaneo periférico.
- **Navegación Sin Contacto (Air Gestures)**: Uso de cámara frontal para avanzar pantallas sin tocar el dispositivo (evita lavar manos a cada rato).
- **Paginación Atómica (Revelación Progresiva)**: Un solo paso visible a la vez en fuente grande. Previene el pánico visual.
- **Awake Lock**: Mantener la pantalla encendida indefinidamente.
- **Offline-First**: Funcionar sin red en cocinas donde el WiFi es débil.
- **Temporizadores Embebidos**: Botones accionables dentro del texto de la receta ("Hornear por [25 minutos]").

## 4. Gamificación y Dopamina
- Cada checklist y acción debe devolver micro-recompensas (haptics, animaciones sutiles).
- Retrospectiva de ahorro de tiempo: "Completaste el Meal Prep. Te ahorraste 3.5h esta semana."
- Enviar notificaciones de timers no solo al móvil, sino a relojes inteligentes (Apple Watch) para sobreponerse al ruido de procesadoras/batidoras.

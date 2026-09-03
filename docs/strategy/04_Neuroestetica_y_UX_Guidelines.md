# Guidelines de Neuroestética y Arquitectura Visual (UX/UI)

> [!NOTE]
> **Estado:** Documento Vivo (Iterativo). Nuestro manifiesto de diseño psicológico.

## 1. La Filosofía del Diseño: Neuroestética Funcional
No competimos en features, competimos en cómo el usuario *siente* el software. Las interfaces tradicionales de B2B son tablas grises. Alpha Dynamics utiliza la belleza como un arma de adopción.
- **Glassmorphism y Blur:** Usamos paneles translúcidos (`backdrop-blur-xl`) para dar profundidad. Esto no es solo estético; ayuda a establecer jerarquía visual. El fondo se desenfoca para mantener el contexto de la aplicación mientras el usuario se concentra en un modal crítico.
- **Iluminación Sensorial (Glows):** Sombras difusas y neones (`shadow-glow`) para guiar la vista hacia los *Calls to Action* primarios sin saturar la pantalla con colores sólidos agresivos.

## 2. Sesgos Cognitivos como Patrones de UI
- **El Efecto Zeigarnik (Gatillos de Tensión):** El cerebro humano recuerda las tareas incompletas mejor que las completadas. En nuestros flujos de Onboarding (como el `ZeroClientWizard`), mostramos el resultado del plan generado borroso (Blur), obligando al usuario a ingresar su identidad para "desbloquear" la recompensa visual.
- **Labor Illusion (La Ilusión del Trabajo):** Los usuarios no confían en una IA que responde en 0.1 segundos; sienten que "no pensó lo suficiente". Implementamos flujos con *Framer Motion* que muestran los "pasos de cálculo" (ej. *Calculando TMB... Optimizando Grafo...*) durante 3 a 5 segundos intencionalmente. Esto eleva drásticamente el valor percibido del resultado.

## 3. Tipografía y Carga Cognitiva
- **B2B (Gimnasios):** Usamos tipografías sólidas y de alto contraste (ej. Montserrat o Inter bold) para transmitir robustez operativa en ambientes caóticos.
- **Clínico (Nutrición):** Usamos amplios espacios en blanco (Negative Space) y tipografías limpias. El diseño debe transmitir la esterilidad y precisión de un quirófano, reduciendo la ansiedad del paciente.

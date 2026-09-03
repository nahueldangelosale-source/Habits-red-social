# Estrategia de Onboarding: Anamnesis Estructurada y Telemetría Clínica

## Principio Fundamental
**La eliminación total del texto libre.** 
Los campos de texto abierto generan ambigüedad, dificultan la inferencia de la Inteligencia Artificial (motor clínico) y propician la alucinación de datos. 
El Onboarding B2B y B2C debe funcionar con **Métricas Cerradas y Cuantificables**. Esto permite que el sistema asigne planes de forma determinista y que el entrenador pueda leer un "blueprint" clínico limpio y predecible.

## Agrupación de Módulos (Ley de Hick)
Para reducir la carga cognitiva (y mejorar el *Completion Rate*), el Onboarding segmenta la recolección de datos en:

1. **Salud y Preexistencias:**
   - Medicación recurrente (Booleano)
   - Último chequeo general < 1 año (Booleano)
   
2. **Hábitos de Vida:**
   - **Actividad Laboral:** Nivel de movimiento diario independientemente del gimnasio (Sedentario, Ligero, Activo, Muy Activo).
   - **Consumo de Alcohol:** Sustituye la pregunta abierta de "bebidas sociales" por niveles medibles (Nada, Social, Frecuente, Diario).
   - **Tabaquismo:** Diferencia al fumador ocasional del diario, reemplazando el checkbox de "Fumador: Sí/No".

3. **Nutrición y Patrones:**
   - **Dietas Específicas:** Añadidas métricas contemporáneas como "Low Carb" y "Mediterránea" para perfilar de forma automática los requerimientos de macronutrientes.
   - **Comidas por Día:** Ayuda al algoritmo a determinar la densidad calórica de los *Smart Blocks* sugeridos (1-2, 3-4, 5+ comidas).
   - **Frecuencia de Comer Fuera:** Evalúa el grado de control calórico real del atleta.

## Manejo de la "Fricción del Entrenador" (Gestión del Cambio - ADKAR)
Algunos entrenadores prefieren charlar informalmente (WhatsApp) para relevar. La aplicación de telemetría y el cierre de campos de texto tiene un objetivo B2B central: **Dar precisión quirúrgica al algoritmo para liberar el tiempo del entrenador**. 
Al tener los datos crudos estandarizados, el entrenador no pierde la "sutileza clínica", sino que delega la recolección de la base al motor, para usar su tiempo presencial en el coaching humano.

## Telemetría y Validación de Producto
Para mitigar riesgos y validar esta estrategia, se han inyectado eventos DORA/Métricas de Producto usando IndexedDB (para resiliencia offline):
- `onboarding_step_viewed`: Se dispara al renderizar cada bloque.
- `onboarding_step_completed`: Mide los milisegundos tomados para completar el paso (validando si la estructura cerrada es más rápida que el texto libre).
- `onboarding_drop_off`: Captura abandonos prematuros.

**KPI Objetivo:** Reducción del Drop-Off en la sección de Hábitos a < 3% y aumento de la velocidad promedio de llenado a < 45 segundos por bloque.


## Actualización Agosto 2026 - Ficha del Atleta & Seguridad Clínica
- **Alerta Médica Superior:** Cuando un atleta posee lesiones activas (ej: Rodilla, Hombro) o patologías clínicas registradas en el onboarding, la Ficha del Atleta (`AthleteFormModal.tsx`) despliega automáticamente el banner de Precaución Médica Crítica en la parte superior antes de cualquier sección biométrica.
- **Integración con Injury Firewall:** Las zonas anatómicas afectadas quedan vinculadas para la protección en tiempo real durante la prescripción de ejercicios.

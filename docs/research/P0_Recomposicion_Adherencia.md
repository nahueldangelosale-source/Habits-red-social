# Especificaciones Algorítmicas y Parametrización Fisiológica para el Software de Recomposición Corporal

## Introducción al Modelo Computacional de Recomposición Corporal
El diseño y desarrollo de un software de fitness automatizado (Bienestar APP) dirigido a principiantes e individuos de nivel intermedio, específicamente enfocado en los arquetipos de usuarios "Busy Professional" y "Wellness", exige la traducción de procesos biológicos y fisiológicos altamente complejos en funciones matemáticas deterministas. La recomposición corporal, definida en la literatura clínica como la disminución concomitante de la masa grasa (FM) y la acreción de la masa libre de grasa (FFM), ha superado el paradigma histórico que la consideraba una imposibilidad termodinámica reservada exclusivamente para poblaciones novatas o con obesidad clínica. Las observaciones empíricas contemporáneas dictaminan que este fenómeno es biológicamente viable y reproducible incluso en individuos entrenados, siempre que se establezcan parámetros exactos de estímulo mecánico y partición de nutrientes1.

La base de datos relacional del software debe estructurarse sobre un núcleo algorítmico que abandone la categorización binaria tradicional de fases de "volumen" (superávit calórico) y "definición" (déficit calórico). En su lugar, el sistema opera bajo un modelo de subsidio energético endógeno. Cuando el usuario se encuentra en un estado catabólico moderado, el tejido adiposo subcutáneo y visceral actúa como un reservorio energético, liberando ácidos grasos libres que oxidativamente financian los altos costos metabólicos del anabolismo muscular provocado por el entrenamiento de resistencia1.

## Arquitectura Matemática de la Disponibilidad Energética
La modulación nutricional dentro del software no debe anclarse en la simple sustracción de calorías del Gasto Energético Diario Total (TDEE). La restricción energética lineal y desmesurada induce una cascada adaptativa que incluye la regulación a la baja de la Tasa Metabólica en Reposo (RMR), la supresión de la síntesis de proteínas musculares (MPS) y alteraciones en los ejes hormonales tiroideos y gonadales5. Para prevenir la atrofia del tejido magro y el estancamiento metabólico, el sistema prioriza un umbral crítico conocido como Disponibilidad de Energía (EA).

La EA representa la energía residual, expresada en kilocalorías, que el organismo tiene a su disposición para mantener la homeostasis celular y las funciones fisiológicas basales una vez que se ha deducido el Gasto Energético del Ejercicio (EEE).

### Métrica de Disponibilidad de Energía (EA)
- **EA Patológica (RED-S):** < 30.0 kcal/kg FFM/día. Acción del software: Alerta roja. Incremento automático de 300-400 kcal o reducción severa del volumen de entrenamiento.
- **EA Subóptima (Zona de Recomposición):** 30.0 - 45.0 kcal/kg FFM/día. Acción del software: Mantenimiento del déficit. Zona operativa estándar para pérdida de FM simultánea a hipertrofia.
- **EA Óptima (Mantenimiento):** > 45.0 kcal/kg FFM/día. Acción del software: Fase de mantenimiento post-recomposición.

## Parametrización de Macronutrientes bajo Restricción Calórica
Durante los períodos de déficit calórico, el cuerpo aumenta la dependencia oxidativa de los aminoácidos para la gluconeogénesis sistémica, elevando los requerimientos proteicos.

### Escalado Algorítmico de la Ingesta Proteica
- **BF% > 20% (Hombres) / > 30% (Mujeres):** 2.3 - 2.5 g / kg FFM
- **BF% 12-20% (Hombres) / 22-30% (Mujeres):** 2.6 - 2.8 g / kg FFM
- **BF% < 12% (Hombres) / < 22% (Mujeres):** 2.9 - 3.1 g / kg FFM

El sistema recomendará de 4 a 5 bolos de proteína diarios (0.40 a 0.55 g/kg BW por comida) para saturar el mecanismo mTOR y evitar la respuesta refractaria ("muscle full").

### Asignación de Lípidos y Carbohidratos
- **Lípidos:** 15% - 25% de la ingesta calórica total, con un mínimo estricto de 0.7 g/kg BW para preservar la biosíntesis hormonal.
- **Carbohidratos:** Resto calórico (cierre termodinámico).

## Periodización Nutricional Automatizada
Para mitigar la termogénesis adaptativa, el software integrará restricciones de energía intermitentes (diet breaks/refeeds).

- **Refeed de Carbohidratos:** Cada 14 días en déficit > 15%, si BF% es < 15% (H) o < 25% (M). Consiste en +100% kcal del déficit provenientes exclusivamente de carbohidratos durante 48 horas.
- **Diet Break:** Si la adherencia cae por debajo del 50% o la fatiga RPE 8 persiste. Regresión a TDEE de mantenimiento durante 7 a 14 días.

## Dosificación Mecánica y Arquitectura de la Dosis Mínima Efectiva
El modelo algorítmico extrae evidencia epidemiológica de Steele et al. (2017) sobre la dosis mínima efectiva. Si el usuario reporta alta fricción de tiempo (ej. < 20 min), el sistema activa el "Fallback" de Dosis Mínima:
- **Dosis Mínima:** 1 sola serie llevada al fallo absoluto (0 RIR / RPE 10), 1 a 2 días por semana. Preserva FFM y fuerza bajo déficit.

### Cuantificación a través de RIR y RPE (Autorregulación)
El software operará en la "zona de oro" de hipertrofia de:
- **Ejercicios Compuestos:** RPE 8.0 (2 RIR)
- **Aislamientos:** RPE 9.0 (1 RIR) o 9.5 (0.5 RIR)

## Diseño de la Rutina Base de Cuerpo Completo a Tres Días (Full Body)
La base de datos prescribe una arquitectura algorítmica obligatoria de "Full Body" (3 frecuencias semanales). Esto maximiza las ventanas de Síntesis de Proteínas Musculares (MPS) bajo déficit calórico.

### Día A: Énfasis Principal (Dominancia Rodilla / Empuje Horizontal)
1. Sentadilla con Barra Tras Nuca (3x 5-8 reps, 2 RIR, Descanso 180s)
2. Press de Banca Plano (3x 6-10 reps, 2 RIR, Descanso 180s)
3. Remo con Barra (3x 8-12 reps, 1-2 RIR, Descanso 120s)
4. Peso Muerto Rumano con Mancuernas (2x 10-15 reps, 2 RIR, Descanso 120s)

### Día B: Énfasis Principal (Dominancia Cadera / Empuje Vertical)
1. Peso Muerto Convencional/Rumano (3x 5-8 reps, 2-3 RIR, Descanso 180s)
2. Press Militar de Pie con Barra (3x 6-10 reps, 1-2 RIR, Descanso 180s)
3. Dominadas o Jalón al Pecho (3x 8-12 reps, 1-2 RIR, Descanso 120s)
4. Press Inclinado con Mancuernas (2x 10-15 reps, 2 RIR, Descanso 120s)

### Día C: Consolidación Asimétrica e Hipertrofia Metabólica
1. Sentadilla Frontal o Prensa (3x 8-12 reps, 2 RIR, Descanso 180s)
2. Remo Sentado en Cable (3x 10-15 reps, 1 RIR, Descanso 120s)
3. Press de Hombros Sentado Mancuernas (3x 8-12 reps, 1-2 RIR, Descanso 120s)
4. Sentadilla Búlgara / Zancadas (2x 10-12 por pierna, 2 RIR, Descanso 120s)

## Sincronización del Algoritmo
El motor monitorea adherencia cruzada: Proteína de alto nivel + Progresión en RIR/RPE.
Caídas de peso abruptas (>1% semanal) disparan carbohidratos extra. Estancamientos en RIR disparan un **Deload del -30%** en volumen operativo.

# Relevamiento de Producto — App para Profesionales del Entrenamiento
**Sesión con:** Leandro (Profesor de Educación Física, Lic. en Alto Rendimiento, estudiante de medicina, +8 años de experiencia en coaching presencial y online)
**Documento preparado para:** Equipo de desarrollo (socio, programador, ingeniero de software)

---

## MÓDULO — Nutrición: Evaluación, Educación y Seguimiento Nutricional

---

### Problema que resuelve
*(Desde la perspectiva del profesional)*

El profesional que trabaja con clientes en transformación corporal o salud necesita intervenir sobre la alimentación, pero hoy esa intervención ocurre fuera de la app: por WhatsApp manda fotos, por PDF manda guías, en una planilla anota qué come el cliente. No hay un espacio integrado donde el profesional pueda evaluar la conducta alimentaria del cliente, prescribir un plan o pautas, y hacer seguimiento en el tiempo.

El segundo problema es que las apps de coaching que intentan resolver nutrición lo hacen con un enfoque único: conteo de calorías y macros. Pero la realidad del entrenador y del nutricionista es que la mayoría de los clientes no están listos para contar macros — primero necesitan aprender a seleccionar alimentos, mejorar la calidad de lo que comen, y establecer hábitos alimentarios básicos. El módulo tiene que reflejar esa progresión: **primero educar, después cuantificar**.

---

### Lógica funcional central
*(Cómo debe comportarse el sistema)*

El módulo opera en **dos niveles progresivos**, no excluyentes. El profesional decide cuándo activar cada nivel según el cliente.

#### Nivel 1 — Evaluación y educación nutricional (base para todos los clientes)

**1.1 — Diario fotográfico de comidas**

El profesional le pide al cliente que registre su alimentación real durante un período (3 días, 5 días, lo que defina). El cliente sube fotos de cada comida desde la app, etiquetándolas como **ingestas**:

- Ingesta 1
- Ingesta 2
- Ingesta 3
- Ingesta 4
- Ingesta 5
- (tantas como el cliente necesite)

> **Nota de nomenclatura:** La app usa el término genérico **"ingesta"** por defecto. Si el profesional quiere llamarle "desayuno", "colación", "merienda" o cualquier otro nombre, puede personalizarlo. Si el cliente quiere etiquetar la foto con un nombre específico, también puede hacerlo. La app no impone nombres de comidas — usa "ingesta" como término neutro y universal.

Cada registro incluye:
- Foto de la comida (obligatoria)
- Hora del registro (automática o manual)
- Franja / nombre de la ingesta (por defecto "Ingesta 1, 2, 3..."; personalizable por el profesional o el cliente a "desayuno", "colación", etc.)
- Nota opcional del cliente ("esto fue en la oficina", "no tenía hambre pero comí igual")

El profesional recibe el diario y lo revisa — puede ver todas las fotos del cliente ordenadas por día y por franja, con la hora de cada una. Esto le permite evaluar el patrón alimentario: qué come, cuándo come, qué selección de alimentos hace, qué franjas se saltea.

**1.2 — Plan de comidas por franjas con opciones**

Después de evaluar, el profesional crea un plan de comidas organizado por ingestas. Cada ingesta puede tener **múltiples opciones** para que el cliente elija. El profesional nombra cada ingesta como quiera (puede dejar "Ingesta 1, 2, 3" o renombrar a "Desayuno", "Colación AM", "Almuerzo", etc.):

```
PLAN NUTRICIONAL — Juan García

INGESTA 1 (o "Desayuno", si el profesional lo renombró)
├── Opción A: 3 huevos revueltos + 2 tostadas integrales + 1 banana
├── Opción B: Yogur griego + granola sin azúcar + frutos rojos
└── Opción C: Avena cocida + 1 scoop proteína + mantequilla de maní

INGESTA 2 (o "Colación AM")
├── Opción A: 1 fruta + 20g almendras
└── Opción B: Yogur natural + 1 cucharada de miel

INGESTA 3 (o "Almuerzo")
├── Opción A: Pechuga de pollo + arroz integral + ensalada verde
├── Opción B: Carne magra + batata + verduras salteadas
└── Opción C: Pescado + quinoa + brócoli al vapor

INGESTA 4 (o "Merienda")
├── (misma lógica)

INGESTA 5 (o "Cena")
├── (misma lógica)
```

El cliente ve su plan en la app, organizado por franja, con las opciones claras. El profesional puede modificar opciones en cualquier momento.

**1.3 — Envío de guías y material educativo**

El profesional puede subir PDFs, imágenes o documentos educativos y asignarlos al cliente. Ejemplos: guía de porciones, lista de compras saludable, tabla de equivalencias, infografía sobre lectura de etiquetas.

Los archivos quedan vinculados al perfil del cliente en una sección de "Material educativo" o "Recursos" — no se pierden en el chat ni en WhatsApp.

---

#### Nivel 2 — Conteo de macros y calorías (activado por el profesional cuando el caso lo requiere)

No todos los clientes necesitan contar calorías. Este nivel se activa solo cuando el profesional lo decide.

**2.1 — Calculadora nutricional**

El profesional tiene acceso a una calculadora integrada que le permite estimar:
- Tasa metabólica basal (TMB) — fórmulas: Harris-Benedict, Mifflin-St Jeor, Katch-McArdle (si tiene % de grasa)
- Gasto energético total (GET) — TMB × factor de actividad
- Objetivos de macronutrientes — el profesional define la distribución (ej: 2g proteína/kg, 1g grasa/kg, resto carbohidratos)

El resultado se asigna al cliente como **meta diaria**: kcal totales + gramos de proteína, carbohidratos y grasas.

**2.2 — Registro de alimentos por el cliente (food logger)**

El cliente puede registrar lo que comió durante el día de dos formas:

- **Registro por foto con reconocimiento AI**: el cliente saca una foto de la comida, el sistema estima calorías y macros automáticamente. El cliente puede corregir si el reconocimiento no fue preciso.
- **Registro manual**: el cliente busca el alimento en una base de datos y selecciona la porción. Incluye búsqueda por texto y escáner de código de barras para alimentos envasados.

El sistema muestra al final del día: calorías consumidas vs meta, macros consumidos vs meta, con gráfico visual de progreso.

**2.3 — Vista del profesional**

El profesional ve un resumen de adherencia nutricional del cliente:
- Calorías y macros diarios vs meta (gráfico semanal)
- Días de registro completo vs días sin registro
- Alertas si el cliente se desvía significativamente de la meta (ej: más de 20% por encima o por debajo en proteína)

---

### Funcionalidades clave

#### MUST HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 1 | **Diario fotográfico de comidas** | El cliente sube fotos etiquetadas por franja (desayuno/colación/almuerzo/merienda/cena) con hora. El profesional las revisa ordenadas por día y franja. |
| 2 | **Plan de comidas por ingestas con opciones** | El profesional crea un plan organizado por ingestas, con múltiples opciones por ingesta. Cada ingesta es renombrable (por defecto "Ingesta 1, 2, 3..."). El cliente ve y elige. |
| 3 | **Nomenclatura por defecto: "ingestas"** | La app usa "ingesta" como término genérico. El profesional o el cliente puede renombrar cada ingesta a "desayuno", "colación", "cena", o el nombre que quiera. Decisión de producto. |
| 4 | **Envío de guías y material educativo (PDFs)** | El profesional sube documentos educativos al perfil del cliente. Quedan accesibles en una sección dedicada. |
| 5 | **Calculadora nutricional (TMB, GET, macros)** | Herramienta interna del profesional para calcular requerimientos calóricos y de macronutrientes del cliente. |
| 6 | **Meta diaria asignable al cliente** | El profesional define kcal + g de proteína, carbohidratos y grasas como objetivo diario. Visible para el cliente. |
| 7 | **Registro de alimentos por el cliente** | El cliente registra lo que comió: por foto con reconocimiento AI, por búsqueda en base de datos, o por escáner de código de barras. |
| 8 | **Resumen de adherencia para el profesional** | Panel con calorías/macros vs meta, días de registro, alertas de desvío. Para revisión en check-ins. |

#### NICE TO HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 9 | **Base de datos de alimentos localizada** | Base de datos con alimentos argentinos y latinoamericanos (marcas locales, cortes de carne regionales, preparaciones típicas). No depender solo de bases de datos estadounidenses. |
| 10 | **Reconocimiento AI por foto** | El cliente saca una foto de la comida y el sistema estima calorías y macros. Corregible manualmente. Requiere integración con API de reconocimiento (ej: LogMeal, Foodvisor, o modelo propio). |
| 11 | **Registro de hidratación** | Contador de vasos/litros de agua diarios. Simple, con meta configurable. |
| 12 | **Historial nutricional del cliente** | Línea de tiempo de planes asignados, cambios de meta, evolución de adherencia. El profesional ve la progresión a lo largo de meses. |
| 13 | **Galería de fotos de comidas del cliente** | Todas las fotos del diario alimentario, organizadas cronológicamente. Útil para comparar alimentación de "antes y después". |
| 14 | **Integración con apps de conteo externas** | Conexión con MyFitnessPal, Cronometer u otras. Para clientes que ya usan esas apps y no quieren migrar su registro. |
| 15 | **Escáner de código de barras** | Para alimentos envasados. El cliente escanea, el sistema busca en la base de datos y registra automáticamente. |
| 16 | **Notas del profesional por ingesta** | El profesional puede agregar una nota por ingesta (ej: en Ingesta 5/Cena: "evitar carbohidratos simples después de las 21h") visible para el cliente. |

---

### Referencia de mercado

#### Qué hace bien la competencia

- **ABC Trainerize**: Es la más avanzada en nutrición dentro de las apps de coaching. Tiene un Smart Meal Planner que genera planes personalizados según preferencias, alergias y macros del cliente. Biblioteca de recetas con porciones que se ajustan a las metas. Reportes de adherencia. Sin embargo, es un add-on pago ($20-$45/mes adicional) y la función se terceriza a Evolution Nutrition.
- **My PT Hub**: Tiene una base de datos de 650,000+ alimentos con escáner de código de barras y tracking de macros. Es la más completa en volumen de datos entre las plataformas de coaching.
- **TrueCoach**: Integra tracking nutricional vía MyFitnessPal. No tiene builder de planes propio — depende de la integración externa.
- **Apps de consumidor (MyFitnessPal, Cal AI, Nutrola)**: La tecnología de reconocimiento por foto avanza rápido. MyFitnessPal adquirió Cal AI en marzo 2026 para integrar reconocimiento AI en su tier Premium. Nutrola logra identificar comidas en menos de 3 segundos con 95%+ de precisión. Estas apps son la referencia técnica para el food logger.

#### Qué hace mal la competencia

- **Ninguna app de coaching tiene un flujo de evaluación nutricional previo a la prescripción.** Todas saltan directamente al plan de comidas o al conteo de macros, sin un paso de diagnóstico donde el profesional evalúe qué come el cliente antes de intervenir.
- **Ninguna separa "educación nutricional" de "conteo de macros" como niveles progresivos.** El enfoque es uno solo: contar. Esto no refleja la realidad del coaching donde la mayoría de los clientes no están listos para contar macros.
- **Trainerize cobra la nutrición como add-on.** Es un módulo pago separado ($20-$45/mes), lo que desincentiva su uso y fragmenta la experiencia.
- **Las bases de datos de alimentos están sesgadas al mercado anglosajón.** Encontrar "milanesa napolitana" o "mate cocido" en MyFitnessPal es posible pero inconsistente. Las bases de datos latinoamericanas son pobres.
- **El diario fotográfico no existe como herramienta de evaluación profesional en ninguna plataforma.** Las fotos de comida se usan para conteo AI, no como material de evaluación clínica que el profesional revisa.

#### Gap de mercado que esta app puede ocupar

> Ninguna app de coaching integra un **flujo progresivo de nutrición** (primero evaluar con diario fotográfico → luego educar con plan de opciones y guías → después contar macros solo si el caso lo requiere), donde el profesional controla en qué nivel está cada cliente.

Este gap es conceptual, no solo funcional: refleja una filosofía de coaching distinta — **enseñar a comer antes de cuantificar** — que ninguna plataforma del mercado implementa.

---

### Consideraciones de UX relevantes

1. **El diario fotográfico tiene que ser extremadamente simple para el cliente.** Abrir → foto → seleccionar franja → listo. Si lleva más de 10 segundos por registro, no se usa. La hora se captura automáticamente del momento de la foto.

2. **El plan de comidas debe ser visualmente claro y apetitoso.** No puede parecer una planilla de Excel. Cada franja se muestra como una tarjeta con las opciones listadas de forma limpia. Si hay imágenes de referencia (fotos de platos), mejor.

3. **El nivel 2 (conteo) no debe ser visible para clientes que no lo tienen activado.** Si el profesional decidió que el cliente solo está en nivel 1 (educación), el cliente no ve calculadoras ni gramos — solo su plan y su diario. Esto evita ansiedad y sobreinformación.

4. **La calculadora nutricional es herramienta del profesional, no del cliente.** El cliente ve la meta (kcal y macros), no la fórmula que se usó para calcularla. El profesional puede explicarlo en sesión si quiere, pero la app no expone el cálculo.

5. **El escáner de código de barras y el reconocimiento por foto son funciones que el cliente valora mucho.** Son la diferencia entre "registro engorroso que abandono" y "registro rápido que mantengo". Si hay que priorizar uno, el código de barras es más confiable; la foto es más rápida pero menos precisa en 2026.

6. **El módulo sirve a profesionales con distintos niveles de incumbencia.** Un nutricionista va a prescribir un plan detallado con gramos y macros. Un entrenador va a dar pautas generales y opciones. Un médico puede indicar restricciones alimentarias. La app no debe imponer un nivel de detalle — el profesional elige qué profundidad usar.

---

### Preguntas abiertas para el equipo de desarrollo

1. **¿Reconocimiento por foto: se desarrolla internamente o se integra una API externa?** Opciones: LogMeal API, Foodvisor API, Passio AI, o modelo propio. El desarrollo propio es costoso y requiere dataset de entrenamiento. La integración con API es más rápida pero genera dependencia y costo por llamada.

2. **¿Base de datos de alimentos: se usa una existente o se construye propia?** Opciones: integrar Open Food Facts (open source, base global), licenciar Nutritionix o FatSecret, o construir una base propia focalizada en alimentos de la región. La recomendación es arrancar con una base existente y permitir que los profesionales agreguen alimentos personalizados.

3. **¿Cómo se almacenan las fotos del diario alimentario?** El volumen de fotos de comida puede escalar rápido (5-6 fotos por día por cliente). ¿Se comprimen? ¿Se usa el mismo sistema de almacenamiento que los archivos del calendario (Módulo 2)?

4. **¿El plan de comidas se vincula al calendario (Módulo 2)?** Si el plan dice "Desayuno: opción A, B o C", ¿eso aparece en la vista diaria del calendario del cliente, o vive solo en la sección de nutrición?

5. **¿El nivel 2 (conteo) se desarrolla en la misma fase que el nivel 1, o se separa en iteraciones?** Recomendación: Fase 1 = diario fotográfico + plan por franjas + envío de PDFs. Fase 2 = calculadora + metas + food logger con búsqueda manual. Fase 3 = reconocimiento por foto + escáner de barras. Esto permite lanzar con valor inmediato sin depender de integraciones complejas.

6. **¿Se contempla que múltiples profesionales intervengan en la nutrición de un mismo cliente?** Ejemplo: el entrenador da pautas generales, pero el nutricionista (externo) carga un plan detallado. ¿Ambos tienen acceso al mismo módulo del cliente?

7. **¿El profesional puede crear templates de planes de comida reutilizables?** Igual que la biblioteca de programas de entrenamiento (Módulo 1), debería poder armar planes nutricionales tipo y asignarlos a múltiples clientes como copias independientes.

---

*Módulo de Nutrición cerrado.*

# Relevamiento de Producto — App para Profesionales del Entrenamiento
**Sesión con:** Leandro (Profesor de Educación Física, Lic. en Alto Rendimiento, estudiante de medicina, +8 años de experiencia en coaching presencial y online)
**Documento preparado para:** Equipo de desarrollo (socio, programador, ingeniero de software)

---

## MÓDULO — Creación de Sesiones de Entrenamiento (Workout Builder)

---

### Problema que resuelve
*(Desde la perspectiva del profesional)*

El entrenador necesita una herramienta para diseñar sesiones de entrenamiento con la misma precisión con la que piensa: ejercicios ordenados, con variables de carga explícitas (series, repeticiones, peso, descanso, tempo, RIR), agrupados en estructuras complejas (supersets, circuitos, EMOM) y con notas específicas por movimiento. A su vez, necesita saber si el cliente ejecutó lo que se le prescribió — y si no, qué hizo en su lugar. Sin esa doble capa de información (prescripción vs ejecución), el entrenador programa a ciegas.

---

### Lógica funcional central
*(Cómo debe comportarse el sistema)*

El builder opera sobre un principio de **dos capas por ejercicio**:

#### Capa 1 — Prescripción (entrenador)
Lo que el entrenador diseña y el cliente ve como indicación. Es la "receta" del entrenamiento.

#### Capa 2 — Ejecución (cliente)
Lo que el cliente realmente hizo. El cliente puede modificar cualquier valor de la prescripción para registrar su ejecución real. La prescripción original se mantiene visible como referencia.

**Ejemplo visual de la doble capa:**

```
PRESS BANCA CON BARRA
┌──────────┬────────────┬────────┬────────┬──────────┬────────┐
│  Serie   │    Reps    │  Peso  │ Descanso│  Tempo   │  RIR   │
├──────────┼────────────┼────────┼────────┼──────────┼────────┤
│ Serie 1  │ 10 → [8]   │ 60kg → [55kg] │ 90s  │ 3-1-2-0  │ 2 → [0] │
│ Serie 2  │ 10 → [10]  │ 60kg → [60kg] │ 90s  │ 3-1-2-0  │ 2 → [1] │
│ Serie 3  │ 10 → [9]   │ 60kg → [57.5kg]│ 90s │ 3-1-2-0  │ 2 → [0] │
└──────────┴────────────┴────────┴────────┴──────────┴────────┘
  Prescripción → [Ejecución real del cliente]
```

El entrenador ve ambas capas: la prescripción y lo que el cliente registró. Las diferencias se resaltan visualmente (color distinto, subrayado, o indicador de desvío).

---

### Estructura de una sesión

#### Jerarquía

```
PROGRAMA (macrociclo / mesociclo)
└── SESIÓN (una instancia de entrenamiento)
    ├── Nombre de sesión (ej: "Tren Superior - Fuerza")
    ├── Notas generales de sesión (instrucciones para el cliente)
    ├── EJERCICIO 1
    │   ├── Prescripción: series, reps, peso, descanso, tempo, RIR
    │   ├── Notas del ejercicio
    │   └── Ejecución: lo que el cliente registró
    ├── EJERCICIO 2A ─┐
    ├── EJERCICIO 2B ─┘ (superset vinculado)
    ├── EJERCICIO 3
    ├── CIRCUITO
    │   ├── Ejercicio 4A
    │   ├── Ejercicio 4B
    │   └── Ejercicio 4C
    └── ...
```

#### Campos por ejercicio

**Campos de prescripción (los define el entrenador):**

| Campo | Tipo | Detalle |
|---|---|---|
| **Orden** | Auto-numérico | 1, 2, 3... con letras para agrupamientos: 1A, 1B, 1C |
| **Ejercicio** | Selector del banco | Nombre + imagen/video de demostración |
| **Series** | Numérico | Cantidad de series. Puede variar por semana (ej: sem 1-3 = 3 series, sem 4 = 4 series) |
| **Repeticiones** | Numérico o Duración | Reps (ej: 10) o tiempo (ej: 30s para isométricos, AMRAP) |
| **Peso** | Numérico + unidad | kg, lb, o **%1RM**. El entrenador elige el modo de prescripción. Si usa %, el sistema calcula el valor absoluto si tiene el 1RM cargado |
| **Descanso** | Tiempo | Segundos entre series (ej: 90s) |
| **Tempo** | 4 dígitos | Excéntrica - Pausa inferior - Concéntrica - Pausa superior (ej: 3-1-2-0) |
| **RIR / RPE** | Numérico | Repeticiones en reserva (0-5) o esfuerzo percibido (1-10). Seleccionable por el entrenador |
| **Notas del ejercicio** | Texto libre | **Por semana, por ejercicio.** No es una nota global del ejercicio — cada semana puede tener su propia instrucción (ej: sem 1: "usar carga moderada", sem 3: "descarga, mismo peso", sem 4: "subir 2,5 kg"). Visible para el cliente en la semana correspondiente |

**Campos de ejecución (los completa el cliente):**

| Campo | Tipo | Detalle |
|---|---|---|
| **Reps realizadas** | Numérico | Por serie. Pre-cargado con la prescripción, el cliente modifica si no llegó o superó |
| **Peso usado** | Numérico | Por serie. Pre-cargado con la prescripción |
| **RIR / RPE real** | Numérico | Lo que el cliente percibió realmente |
| **Notas del cliente** | Texto libre | Opcional. "Me dolió el hombro en la serie 3", "Subí peso porque me sobraba" |

---

### Banco de ejercicios

El banco de ejercicios es el panel lateral desde donde el entrenador busca y arrastra ejercicios a la sesión.

#### Estructura del banco

| Componente | Detalle |
|---|---|
| **Biblioteca pre-cargada** | Ejercicios con nombre, imagen/animación, video de demostración, músculo principal, músculo secundario, patrón de movimiento, equipamiento necesario |
| **Filtros de búsqueda** | Por grupo muscular, patrón de movimiento (empuje horizontal, tirón vertical, bisagra de cadera, sentadilla, etc.), equipamiento, tipo (fuerza, cardio, movilidad, calentamiento) |
| **Buscador por texto** | Nombre del ejercicio |
| **Ejercicios personalizados** | El entrenador puede crear ejercicios propios con nombre, descripción, imagen/video propio. Quedan en su biblioteca personal |

---

### Estructuras de agrupamiento

El builder debe soportar las siguientes formas de agrupar ejercicios dentro de una sesión:

| Estructura | Cómo funciona | Notación |
|---|---|---|
| **Ejercicio individual (straight set)** | Un ejercicio, todas sus series, luego el siguiente | 1, 2, 3... |
| **Superset / Bi-serie** | Dos ejercicios alternados sin descanso entre ellos, descanso al final de la ronda | 1A, 1B |
| **Tri-serie** | Tres ejercicios consecutivos, descanso al final de la ronda | 1A, 1B, 1C |
| **Circuito** | N ejercicios consecutivos, se repite X rondas. Puede tener duración total (AMRAP) o rondas fijas | Agrupados visualmente con indicador de rondas |
| **EMOM** | Ejercicio(s) que se ejecutan al inicio de cada minuto, durante X minutos | Duración total + ejercicios internos |
| **AMRAP** | Tantas rondas como sea posible en un tiempo fijo | Duración total + ejercicios internos |
| **Drop set** | Mismo ejercicio, reducción de peso serie a serie sin descanso | Indicador en el ejercicio |
| **Pirámide** | Series con reps ascendentes o descendentes y peso inverso | Indicador en el ejercicio |

El entrenador crea estas estructuras arrastrando ejercicios y vinculándolos (como en Hexfit: seleccionar ejercicios → convertir en circuito/superset).

---

### Acciones rápidas del builder

| Acción | Detalle |
|---|---|
| **Drag & drop** | Arrastrar ejercicios del banco a la sesión. Reordenar ejercicios dentro de la sesión arrastrándolos. |
| **Copiar prescripción** | Copiar las variables de un ejercicio (series, reps, descanso, tempo) y pegarlas en otros ejercicios de la sesión. Evita retipear valores repetidos. |
| **Clonar ejercicio** | Duplicar un ejercicio con toda su prescripción dentro de la misma sesión. |
| **Reemplazar ejercicio** | Cambiar el movimiento manteniendo la estructura de prescripción (series, reps, etc.). Útil para adaptar un template. |
| **Copiar sesión completa** | Duplicar una sesión entera dentro del mismo programa o a otro programa. |
| **Clonar a otra semana** | Copiar la sesión a otra semana del mesociclo, permitiendo modificar solo las variables que cambian (ej: subir peso, bajar reps). |
| **Candado de semanas** | Bloquear/desbloquear la independencia de variables por semana. Bloqueado: todas las semanas tienen la misma prescripción. Desbloqueado: cada semana puede tener valores distintos — incluyendo **la cantidad de series** (ej: agregar una serie en semana 4), reps, peso, descanso y RIR. Esto permite sobrecarga progresiva real por volumen, intensidad o ambas. |
| **Duración estimada de la sesión** | El sistema calcula automáticamente la duración estimada sumando: (series × reps × tempo) + descansos de todos los ejercicios. El entrenador también puede sobreescribir con un valor manual. Visible para el cliente antes de arrancar la sesión. |
| **Notas de sesión** | Campo de texto visible para el cliente con instrucciones generales (ej: "Calentamiento: 10 min cardio suave + movilidad de hombros"). |

---

### Vista del cliente durante la ejecución

Cuando el cliente abre su sesión del día en la app, ve:

1. **Nombre de la sesión** y notas generales del entrenador.
2. **Lista de ejercicios** en orden, con imagen/video de cada uno.
3. **Por cada ejercicio**: las variables prescritas (series, reps, peso, descanso, tempo, RIR) pre-cargadas.
4. **Campos editables**: el cliente puede modificar reps, peso y RIR por serie si lo que hizo difiere de la prescripción.
5. **Temporizador de descanso**: se activa automáticamente al completar una serie (opcional, configurable).
6. **Campo de notas por ejercicio**: para que el cliente deje feedback.
7. **Botón "Finalizar sesión"**: marca la sesión como completada, registra fecha y hora, envía notificación al entrenador.

#### Flujo de ejecución del cliente

```
Cliente abre sesión del día
    │
    ├── Ve Ejercicio 1: Press Banca — 3x10 @ 60kg — RIR 2 — Descanso 90s
    │   ├── Serie 1: completa → marca ✓ (puede editar reps/peso/RIR si difiere)
    │   ├── Temporizador de descanso se activa: 90s
    │   ├── Serie 2: completa → marca ✓
    │   ├── Temporizador: 90s
    │   └── Serie 3: solo llegó a 8 reps → edita reps a 8, RIR a 0
    │
    ├── Ve Ejercicio 2A-2B: Superset Remo + Curl
    │   └── (misma lógica, alternando ejercicios)
    │
    ├── ... (continúa hasta el último ejercicio)
    │
    └── [FINALIZAR SESIÓN]
        ├── Feedback opcional: "¿Cómo te sentiste?" (escala 1-5 o RPE general)
        ├── Nota libre opcional
        └── Se envía notificación al entrenador
```

---

### Vista del entrenador post-sesión

El entrenador ve un resumen de la sesión completada:

| Dato | Detalle |
|---|---|
| **Fecha y hora** de ejecución | Cuándo entrenó el cliente |
| **Comparativa prescripción vs ejecución** | Por cada ejercicio, por cada serie: lo prescripto al lado de lo ejecutado. Diferencias resaltadas visualmente |
| **Desvíos relevantes** | Alertas automáticas si el cliente bajó más de X% en reps o peso respecto a la prescripción, o si reportó RIR 0 en varias series (posible fatiga excesiva) |
| **Notas del cliente** | Cualquier comentario que dejó por ejercicio o al final |
| **Feedback general** | RPE percibido de la sesión, nota libre |

---

### Funcionalidades clave

#### MUST HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 1 | **Builder con columnas de prescripción** | Ejercicio, series, reps (o duración), peso, descanso, tempo, RIR/RPE, notas. Formato tabular tipo Hexfit. |
| 2 | **Banco de ejercicios con búsqueda y filtros** | Panel lateral. Filtros por grupo muscular, patrón de movimiento, equipamiento. Drag & drop a la sesión. |
| 3 | **Supersets, tri-series, circuitos** | Vinculación de ejercicios con notación 1A/1B/1C. Soporte para EMOM, AMRAP, circuitos con rondas. |
| 4 | **Doble capa: prescripción vs ejecución** | El cliente ve la prescripción pre-cargada y puede modificar reps, peso y RIR si difiere de lo prescripto. El entrenador ve ambas capas. |
| 5 | **Candado de semanas** | Bloquear/desbloquear para que cada semana pueda tener variables distintas (sobrecarga progresiva). |
| 6 | **Copiar/pegar prescripciones** | Copiar variables de un ejercicio y aplicarlas a otros dentro de la misma sesión. |
| 7 | **Clonar y reemplazar ejercicios** | Duplicar ejercicios/sesiones. Reemplazar movimiento manteniendo la estructura de carga. |
| 8 | **Notas por semana por ejercicio y notas generales de sesión** | Cada ejercicio puede tener una nota diferente en cada semana (instrucciones de progresión, indicaciones de carga, advertencias). Adicionalmente, la sesión tiene un campo de notas generales. Las notas del cliente post-ejecución son visibles para el entrenador. |

**Nota de diseño:** El builder es una estructura flexible. Cada entrenador lo llena según su criterio y metodología — el sistema provee las columnas (series, reps, peso/%, descanso, tempo, RIR, notas) pero no impone cómo usarlas. Lo que importa es que la estructura esté completa y sea ágil de operar.
| 9 | **Botón "Finalizar sesión" en la app del cliente** | Marca completada, registra datos, envía notificación al entrenador. |
| 10 | **Temporizador de descanso** | Se activa automáticamente al completar una serie. Configurable por ejercicio. Señal sonora al finalizar. |
| 11 | **Duración estimada de la sesión** | Cálculo automático basado en series, reps, tempo y descansos. Sobreescribible manualmente por el entrenador. Visible para el cliente. |
| 12 | **Candado de semanas con modificación de series** | Al desbloquear, el entrenador puede modificar por semana no solo reps/peso/descanso sino también agregar o quitar series por ejercicio. |

#### NICE TO HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 13 | **Historial de ejecución por ejercicio** | El entrenador ve la evolución de peso/reps del cliente en un ejercicio a lo largo de las semanas. Gráfico de progreso. |
| 14 | **Alerta de desvío** | Notificación automática si el cliente reporta RIR 0 recurrente, baja de peso significativa, o no completa reps prescritas por varias sesiones. |
| 15 | **Ejercicios personalizados con video propio** | El entrenador sube sus propios ejercicios al banco con nombre, descripción e imagen/video. |
| 16 | **1RM estimado automático** | El sistema calcula 1RM estimado a partir de los datos de ejecución del cliente (fórmula de Epley/Brzycki). |
| 17 | **Peso relativo (%1RM)** | *(Ya integrado en el campo de peso del builder como opción nativa — ver campos de prescripción)* |
| 18 | **RPE percibido de la sesión** | Al finalizar, el cliente califica la dificultad general de la sesión (escala 1-10). Dato útil para monitoreo de fatiga. |
| 19 | **Builder accesible desde mobile** | Creación y edición de sesiones desde el celular del entrenador. Hexfit no tiene esto y es una queja recurrente de sus usuarios. |

---

### Referencia de mercado

#### Qué hace bien la competencia

- **Hexfit**: Builder sólido con formato tabular claro. Gran banco de ejercicios con video. Soporte para circuitos, supersets, EMOM, AMRAP. Candado de semanas para sobrecarga progresiva. Copiar/pegar prescripciones. Referencia directa del formato que se adopta.
- **TrueCoach**: Builder rápido con layout de feed lineal. 3,000+ videos de ejercicios pre-cargados. Atajos de teclado para programar rápido. Buena UX de comunicación entrenador-cliente por ejercicio.
- **CoachRx**: Integra las variables de prescripción con la planificación de periodización (macrociclo → sesión). Buen vínculo entre el plan de largo plazo y la sesión individual.
- **ABC Trainerize**: AI Workout Builder que genera borradores de sesiones a partir de datos del cliente. Master library de programas reutilizables. Automatización de entrega de programas.

#### Qué hace mal la competencia

- **Hexfit no tiene app mobile para el entrenador para crear programas.** Solo el cliente tiene app. El entrenador trabaja desde web. Esta es una limitación muy citada en reviews.
- **Hexfit no permite reordenar las columnas de prescripción (peso, reps, notas) una vez creadas.** Si el entrenador las puso en orden incorrecto, tiene que rehacerlas.
- **Ninguna app tiene una doble capa explícita de prescripción vs ejecución con comparativa visual.** TrueCoach permite que el cliente registre resultados, pero la comparación con lo prescripto no es un feature de primera clase. El entrenador tiene que buscar y comparar manualmente.
- **Los datos de ejecución del cliente rara vez generan alertas o insights automáticos.** El entrenador tiene que revisar sesión por sesión para detectar patrones de fatiga o desvío.

#### Gap de mercado que esta app puede ocupar

> Ninguna app del mercado presenta una **comparativa visual explícita prescripción vs ejecución** con alertas automáticas de desvío, integrada en un builder con la profundidad de Hexfit pero accesible desde mobile para el entrenador.

---

### Consideraciones de UX relevantes

1. **El builder debe funcionar en mobile para el entrenador.** Es la queja #1 de Hexfit. El entrenador programa entre sesiones, en el gimnasio, en el subte. Si el builder solo funciona en desktop, pierde adopción.

2. **La doble capa no debe complicar la vista del cliente.** El cliente ve la prescripción como "lo que tengo que hacer". Solo toca un campo si necesita cambiarlo. Los campos de ejecución están pre-cargados con la prescripción — el cliente edita solo lo que difiere. No se le muestra la comparativa; eso es para el entrenador.

3. **El drag & drop tiene que ser fluido en mobile.** Arrastrar ejercicios en una pantalla táctil es un desafío de UX. Alternativa: botón "Agregar ejercicio" que abre el banco como modal, seleccionar, y el ejercicio se agrega al final de la lista con opción de reordenar.

4. **El tempo es un campo experto.** No todos los entrenadores usan tempo 4-dígitos. Debería ser un campo opcional que se activa si el entrenador lo necesita, no visible por defecto para no sobrecargar la interfaz.

5. **El candado de semanas es uno de los features más potentes de Hexfit.** Implementarlo bien es crítico. La idea: por defecto todas las semanas comparten la misma prescripción. Al desbloquear, el entrenador puede cambiar valores semana a semana — incluyendo la cantidad de series (no solo reps/peso). Ejemplo: semanas 1-3 con 3 series, semana 4 con 4 series para un estímulo de sobrecarga por volumen. Visual: un ícono de candado por columna que se abre/cierra, y la tabla se expande para mostrar filas de series adicionales si se agregan.

6. **El resumen post-sesión para el entrenador tiene que ser de un vistazo.** No puede requerir abrir ejercicio por ejercicio. Vista de tabla con prescripción y ejecución lado a lado, diferencias resaltadas en color, y alertas arriba si hay desvíos importantes.

---

### Preguntas abiertas para el equipo de desarrollo

1. **¿El builder se implementa como componente web responsive o como interfaz nativa en mobile?** Web responsive es más rápido de desarrollar pero menos fluido para drag & drop. Nativo es mejor UX pero duplica trabajo.

2. **¿Cómo se almacenan los datos de ejecución del cliente?** Cada serie de cada ejercicio tiene dos registros (prescripción y ejecución). ¿Se guardan en la misma tabla con un flag, o en tablas separadas? Esto impacta las queries de historial y progreso.

3. **¿El banco de ejercicios es compartido entre todos los entrenadores de la plataforma o cada uno tiene el suyo?** La recomendación es una biblioteca base compartida (mantenida por la app) + ejercicios personalizados por entrenador.

4. **¿Qué fuente de videos de ejercicios se usa?** ¿Se licencia una biblioteca existente, se producen videos propios, o se permite solo la carga de videos del entrenador? La biblioteca pre-cargada con video es un estándar del mercado que no se puede omitir.

5. **¿El temporizador de descanso es obligatorio o el cliente puede desactivarlo?** Algunos clientes lo encuentran útil, otros lo encuentran intrusivo. Recomendación: activado por defecto, desactivable desde configuración del cliente.

6. **¿Cómo se vincula este módulo con el Módulo 1 (Biblioteca de programas)?** La sesión se crea dentro de un programa que vive en la biblioteca. Al asignar el programa a un cliente, las sesiones se copian con la prescripción. La ejecución se registra en la copia del cliente. ¿Se comparte lógica de base de datos o son módulos independientes?

7. **¿Se contempla un modo offline para la ejecución del cliente?** Si el cliente entrena en un gimnasio sin señal, tiene que poder registrar su sesión y sincronizar después. Esto requiere almacenamiento local en el dispositivo.

---

*Módulo de Creación de Sesiones cerrado.*

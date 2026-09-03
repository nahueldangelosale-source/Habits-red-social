# Relevamiento de Producto — App para Profesionales del Entrenamiento
**Sesión con:** Leandro (Profesor de Educación Física, Lic. en Alto Rendimiento, estudiante de medicina, +8 años de experiencia en coaching presencial y online)
**Documento preparado para:** Equipo de desarrollo (socio, programador, ingeniero de software)

---

## MÓDULO 2 — Calendario: Mapa Visual de Trayectoria del Cliente

---

### Problema que resuelve
*(Desde la perspectiva del profesional)*

Los calendarios de las apps existentes funcionan como agendas: muestran días con sesiones asignadas, pero no comunican hacia dónde va el proceso del cliente. El entrenador piensa en fases, bloques y progresiones — no en citas. Y el cliente necesita ver que hay un plan detrás de lo que hace cada día, no una lista interminable de sesiones sueltas.

El segundo problema es la fragmentación: hoy las fotos de progreso se guardan en una carpeta aparte, las dietas van por otro canal, las notas del entrenador no están vinculadas al día ni al contexto del programa. Todo lo que debería estar anclado a un punto temporal queda suelto.

---

### Lógica funcional central
*(Cómo debe comportarse el sistema)*

El calendario no es una agenda — es un **mapa visual de la trayectoria del cliente**, con dos niveles de lectura y múltiples capas de información ancladas a fechas.

#### Nivel 1 — Vista macro: Línea de tiempo tipo Gantt

- Visualización horizontal del macrociclo completo del cliente (puede abarcar 3 meses, 6 meses o un año entero).
- Cada fase de entrenamiento se representa como una **barra de color** con su nombre visible encima (ej: "Fuerza", "Hipertrofia", "Fase Competitiva", "Deload").
- **El color y el nombre de cada fase los define el entrenador**, no la app. El sistema provee una paleta pero el entrenador elige qué color asigna a cada tipo de fase.
- Las barras se disponen secuencialmente en una línea de tiempo, con meses y semanas como referencia en el eje horizontal.
- El cliente puede ver esta vista desde su app: entiende dónde está hoy dentro del plan, qué vino antes y qué viene después. **Ve el "hacia dónde voy".**

**Referencia visual:** Diagrama de Gantt académico/institucional — filas por tipo de bloque, columnas por mes/semana, barras de color con etiqueta encima.

#### Nivel 2 — Vista micro: Semana / Día

- Al hacer zoom (clic o pellizco en mobile), la vista macro se expande hacia la vista semanal y luego diaria.
- La vista diaria muestra: sesión de entrenamiento asignada, tareas, notas, reuniones, archivos adjuntos.
- La transición entre zoom macro y zoom micro debe ser fluida — no son dos pantallas distintas, es un mismo mapa a diferentes escalas.

#### Regla de visibilidad del cliente sobre el contenido pasado

- El cliente **SÍ ve** la línea de tiempo Gantt completa, incluyendo las fases ya completadas (las barras de color con sus nombres). Esto le muestra su recorrido y refuerza la percepción de progreso.
- El cliente **SÍ ve** los archivos adjuntos de fechas pasadas: fotos de progreso, dietas, documentos, notas compartidas.
- El cliente **NO ve** las rutinas pasadas (ejercicios, series, repeticiones, descansos de mesociclos anteriores). Una vez que el mesociclo se completa y se archiva, el contenido del entrenamiento desaparece de la vista del cliente.
- El entrenador **SÍ ve todo**: Gantt completo, archivos, y el contenido detallado de todas las rutinas pasadas y actuales.

**Lógica de fondo:** El Gantt es un mapa de recorrido, no un archivo de rutinas. El cliente entiende "ya pasé por Fuerza, ahora estoy en Hipertrofia" sin poder revisar el detalle técnico de lo que hizo. Esa información es IP del entrenador y herramienta de seguimiento profesional, no del cliente.

#### Capa de adherencia: Sesiones completadas

- Cuando el cliente finaliza una sesión desde su celular (botón "Finalizar sesión"), ese día queda marcado como completado en el calendario.
- El sistema acumula y muestra: total de sesiones cerradas, ratio de adherencia (completadas vs programadas), indicador de si el cliente está al día.
- El entrenador ve esta información tanto por cliente individual como en una vista general de su cartera.

#### Capa de archivos: Documentos anclados a fechas

- Cualquier día del calendario puede tener archivos adjuntos: fotos de progreso, dietas, estudios médicos, notas de voz, PDFs.
- **Ambos pueden subir archivos**: el entrenador (ej: plan nutricional, indicación médica) y el cliente (ej: foto de progreso, captura de análisis).
- Los archivos quedan vinculados al día y al contexto del programa — no en una carpeta separada.

#### Capa de eventos: Tareas, reuniones y recordatorios

- El entrenador puede crear **tareas con alarma** para el cliente en cualquier día (ej: "Sacar foto de progreso", "Pesarse", "Completar cuestionario").
- Se pueden agendar **reuniones o check-ins** visibles para ambos.
- Se pueden insertar **notas internas** del entrenador (visibles solo para él) o **notas compartidas** (visibles para el cliente).

---

### Funcionalidades clave

#### MUST HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 1 | **Vista macro tipo Gantt** | Línea de tiempo horizontal con barras de color por fase. Abarca desde 3 meses hasta 1 año completo. Nombres de fase visibles encima de cada barra. |
| 2 | **Zoom fluido macro ↔ micro** | Transición continua entre la vista de macrociclo y la vista semanal/diaria. No son pantallas separadas — es navegación por zoom. |
| 3 | **Color y nombre de fase personalizables** | El entrenador elige qué color representa cada tipo de fase. Sin esquema de colores impuesto. |
| 4 | **Marcado de sesión completada por el cliente** | Botón "Finalizar sesión" en la app del cliente. Marca el día como completado. |
| 5 | **Contador de adherencia** | Sesiones completadas vs programadas. Indicador visual de si el cliente está al día. Visible para el entrenador (y opcionalmente para el cliente). |
| 6 | **Tareas con alarma** | El entrenador crea tareas asignadas al cliente con fecha y hora de recordatorio. El cliente recibe notificación push. |
| 7 | **Archivos adjuntos por día** | Fotos, PDFs, dietas, documentos. Ambos (entrenador y cliente) pueden subir. Quedan vinculados al día específico. |
| 8 | **Notas y reuniones en calendario** | El entrenador puede agendar reuniones y crear notas visibles para el cliente o internas (solo visibles para el entrenador). |

#### NICE TO HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 9 | **Vista de cartera del entrenador** | Panel donde el entrenador ve todos sus clientes con indicadores de adherencia, fase actual, y alertas de clientes que se atrasaron. |
| 10 | **Galería de progreso por cliente** | Colección automática de todas las fotos subidas al calendario de un cliente, ordenadas cronológicamente. No reemplaza el anclaje por día, lo complementa. |
| 11 | **Comparativa de fotos side-by-side** | Seleccionar dos fotos de fechas distintas para comparar progreso visual. |
| 12 | **Exportar calendario a Google Calendar / iCal** | Para que el cliente vea sus sesiones y tareas en su calendario personal (sincronización unidireccional). |
| 13 | **Indicador visual de fase actual en la Gantt** | Un marcador tipo "hoy" (línea vertical o highlight) que le muestre al cliente exactamente dónde está parado dentro del macrociclo. |

---

### Referencia de mercado

#### Qué hace bien la competencia

- **CoachRx**: Es la más avanzada en periodización. Tiene una sección de Planificación y Periodización que permite crear planes de largo plazo (macrociclo) y corto plazo (mesociclo) con fechas, fases (acumulación, intensificación, precompetición, etc.) y notas. Se puede hacer zoom desde el plan de largo plazo hacia los mesociclos individuales. Es la referencia funcional más cercana al concepto.
- **TrueCoach**: Vista de mes y planificación anticipada bien diseñada. El entrenador ve el mes completo de un cliente y puede planificar con antelación. Buen sistema de compliance tracking (sesiones completadas vs asignadas).
- **Hexfit**: Permite crear tareas y objetivos diarios. Calendario funcional para asignar programas y visualizar por día/semana/mes.
- **TrainHeroic**: Permite ver estado de completitud de sesiones, RPE subjetivo del atleta, y feedback post-sesión. Bueno para seguimiento de adherencia.

#### Qué hace mal la competencia

- **Ninguna app tiene visualización tipo Gantt para el cliente.** El cliente no puede ver su trayectoria completa como un mapa con fases codificadas por color. Lo máximo que ve es un calendario mensual con sesiones asignadas — no hay "big picture".
- **CoachRx** tiene periodización, pero la visualización es funcional y plana (texto y fechas), no es una representación gráfica intuitiva. Es más una herramienta interna del entrenador que una experiencia visual para el cliente.
- **Los archivos y fotos quedan desvinculados del calendario en todas las plataformas.** Las fotos de progreso, dietas y documentos no están anclados a un día específico del programa. Se guardan en secciones separadas o directamente fuera de la app.
- **Las tareas no tienen alarma ni sistema de notificaciones integrado** en la mayoría de las plataformas. Son recordatorios pasivos, no activos.
- **Hexfit** no tiene app móvil para el entrenador — la gestión del calendario solo se hace desde web.

#### Gap de mercado que esta app puede ocupar

> Ninguna app del mercado ofrece una **visualización tipo Gantt de la trayectoria del cliente** con fases codificadas por color, zoom fluido de macro a micro, archivos anclados al día, y sistema de tareas con alarma — todo integrado en una sola vista.

Este gap es doble:
1. **Para el entrenador**: un mapa operativo de cada cliente que reemplaza la dispersión actual (calendario por un lado, fotos por otro, dietas por otro, notas por otro).
2. **Para el cliente**: una experiencia visual que le muestra hacia dónde va, dónde está, y qué tiene que hacer hoy — generando adherencia y percepción de valor del servicio.

---

### Consideraciones de UX relevantes

1. **El Gantt tiene que ser legible en mobile.** Una línea de tiempo horizontal en pantalla chica es un desafío de diseño. Opciones: scroll horizontal con snap por fase, o vista colapsada que muestra solo el bloque actual con indicador de posición en la barra completa. Esto requiere prototipado específico.

2. **La vista del cliente y la vista del entrenador son distintas.** El entrenador ve notas internas, datos de adherencia, alertas. El cliente ve su plan, sus tareas, sus archivos y su progreso. El diseño tiene que contemplar esta dualidad desde el principio.

3. **El zoom macro ↔ micro no puede ser un cambio de pantalla.** El valor del Gantt se pierde si para ver el detalle del día tenés que navegar a otra sección. Tiene que sentirse como un mapa que se acerca y se aleja.

4. **Los archivos adjuntos necesitan preview inline.** Si el cliente subió una foto de progreso, el entrenador tiene que poder verla sin descargarla — thumbnail en el calendario, expand al tocar.

5. **El color es comunicación, no decoración.** La codificación cromática de fases tiene que ser consistente entre la vista Gantt, la vista semanal y la vista diaria. Si "Fuerza" es rojo en la Gantt, tiene que ser rojo en la sesión del lunes también.

6. **El contador de adherencia tiene que motivar, no castigar.** Para el cliente, el indicador debería enfatizar las sesiones completadas (positivo) más que las faltantes (negativo). Para el entrenador, tiene que ser un dato operativo neutro.

---

### Preguntas abiertas para el equipo de desarrollo

1. **¿Qué framework de visualización se usa para el Gantt?** ¿Se construye con una librería de gráficos (D3.js, Chart.js) o se desarrolla como componente custom? El requisito de zoom fluido y responsividad en mobile condiciona esta decisión.

2. **¿Cómo se comporta el Gantt cuando no hay macrociclo asignado?** ¿El calendario se muestra como calendario semanal estándar hasta que se asigna un plan, o siempre se ofrece la posibilidad de crear una línea de tiempo?

3. **¿Los archivos adjuntos se almacenan en el servidor de la app o se integra con almacenamiento externo (S3, Google Cloud Storage)?** El volumen de fotos de progreso puede escalar rápidamente.

4. **¿Qué límite de archivos por día se establece?** ¿Hay restricción de peso/tamaño? ¿Se comprimen las imágenes al subir?

5. **¿Las alarmas de tareas son notificaciones push nativas o dentro de la app?** Push nativas tienen mejor tasa de respuesta pero requieren permisos del dispositivo.

6. **¿Cómo se sincroniza la liberación del mesociclo (Módulo 1) con la visualización en el Gantt (Módulo 2)?** El calendario debe reflejar automáticamente el estado de visibilidad del programa asignado.

7. **¿Se contempla integración bidireccional con Google Calendar / Apple Calendar, o solo exportación unidireccional?** La bidireccional es más compleja pero permite que el cliente vea sus sesiones en su calendario personal.

8. **¿Cómo se gestiona técnicamente la visibilidad diferenciada del contenido pasado?** El cliente ve la Gantt y los archivos de fechas pasadas, pero NO las rutinas completadas. ¿Se resuelve a nivel de permisos en la API, o a nivel de interfaz (el dato existe pero no se renderiza)? La primera es más segura; la segunda es más simple pero expone datos en el frontend.

---

*Módulo 2 cerrado. Pendiente: Módulo 3 (Hábitos).*


## Actualización Agosto 2026 - Módulo de Agenda Pro & Disponibilidad Semanal (`/calendar`)
- **Gestión de Turnos:** Soporte para entrenamientos 1 a 1, mediciones antropométricas ISAK, consultas nutricionales, clases grupales y servicios personalizados.
- **Matriz Semanal de Disponibilidad:** Franjas horarias de 08:00 a 20:00 de Lunes a Domingo con detección de espacios libres y agendamiento interactivo en 1 clic.
- **Avisos Automáticos de Fin de Ciclo:** Tareas autogeneradas 7 días antes de la finalización de mesociclos y planes nutricionales para asegurar renovación proactiva.
- **Checklist Operativo:** Módulo de to-do del coach con prioridades y seguimiento de tareas diarias.

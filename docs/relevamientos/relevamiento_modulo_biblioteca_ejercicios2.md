# Relevamiento de Producto — App para Profesionales del Entrenamiento
**Sesión con:** Leandro (Profesor de Educación Física, Lic. en Alto Rendimiento, estudiante de medicina, +8 años de experiencia en coaching presencial y online)
**Documento preparado para:** Equipo de desarrollo (socio, programador, ingeniero de software)

---

## MÓDULO — Biblioteca de Ejercicios: Clasificación, Navegación y Banco de Ejercicios

---

### Problema que resuelve
*(Desde la perspectiva del profesional)*

El entrenador necesita encontrar el ejercicio correcto en segundos mientras arma una sesión. Las apps existentes organizan los ejercicios por grupo muscular únicamente, lo que funciona para musculación pura pero se rompe cuando el profesional busca un ejercicio de movilidad, de rehabilitación, de pliometría o de yoga — no sabe dónde buscarlo. Un Turkish Get Up no es "hombro" ni "core" ni "piernas", es un ejercicio funcional completo. Una Cossack Squat no es solo "cuádriceps", es movilidad + fuerza.

El segundo problema es que la app sirve a profesionales distintos (entrenador, kinesiólogo, nutricionista, profe de yoga, médico deportólogo) y cada uno piensa distinto. El entrenador de gimnasio piensa por músculo. El kinesiólogo piensa por articulación. El profe de funcional piensa por patrón de movimiento. La arquitectura tiene que servir a todos sin forzar una sola lógica.

---

### Lógica funcional central
*(Cómo debe comportarse el sistema)*

La biblioteca opera con **tres niveles de navegación + un buscador global**, donde cada nivel filtra el anterior.

#### Nivel 0 — Buscador global (siempre visible)

- Campo de texto siempre visible en la parte superior del banco de ejercicios.
- Busca en: nombre oficial, alias/nombres alternativos, músculo agonista, equipamiento.
- Resultados en tiempo real (autocompletado) a medida que el profesional escribe.
- Es el acceso directo para el profesional que ya sabe qué busca.
- Ejemplo: escribir "press" muestra press banca, press militar, push press, press Arnold, press landmine, etc.

#### Nivel 1 — Categorías principales (navegación primaria)

El primer nivel organiza los ejercicios en **12 categorías funcionales**, agrupadas en 3 familias:

**Familia: Entrenamiento**
| Categoría | Qué contiene | Vol. estimado |
|---|---|---|
| Musculación | Ejercicios con resistencia para hipertrofia y fuerza general. Barra, mancuernas, máquinas, poleas, peso corporal | ~500 |
| Fuerza / Powerlifting | Sentadilla, peso muerto, press banca y variantes. Métodos especiales (cadenas, bandas, pausa, tempo) | ~200 |
| Funcional / HIIT / CrossFit | Ejercicios de peso corporal, kettlebell, medicine ball, circuitos, formatos de entrenamiento (EMOM, AMRAP, Tabata) | ~250 |
| Levantamiento olímpico | Clean, snatch, jerk y todos sus derivados parciales (pulls, high pulls, muscle versions) | ~50 |

**Familia: Bienestar y movilidad**
| Categoría | Qué contiene | Vol. estimado |
|---|---|---|
| Movilidad articular | CARs, FRC, rotaciones, movilidad integrada por articulación | ~100 |
| Stretching / Flexibilidad | Estiramientos estáticos, dinámicos, PNF, asistidos con banda | ~80 |
| Yoga | Asanas de pie, suelo, equilibrio, inversión, secuencias (saludo al sol), pranayama | ~100 |
| Pilates | Hundred, roll up, teaser, swimming, series de mat, reformer básico | ~60 |

**Familia: Prevención y condición**
| Categoría | Qué contiene | Vol. estimado |
|---|---|---|
| Rehabilitación / Prehab | Manguito rotador, estabilización escapular, activación glútea, propiocepción, auto-liberación miofascial | ~120 |
| Calentamiento / Activación | Activación glútea, movilidad pre-entrenamiento, foam rolling, calentamiento dinámico, calentamiento específico | ~80 |
| Pliometría / Potencia | Saltos, lanzamientos balísticos, ejercicios reactivos, progresiones por nivel de impacto | ~80 |
| Cardio / Acondicionamiento | Remo, bike, ski erg, sled, battle ropes, sprints, saltar soga | ~60 |

**Total objetivo: ~1,680+ ejercicios** (más ejercicios personalizados del entrenador).

#### Nivel 2 — Subcategorías (dentro de cada categoría)

Cada categoría tiene su propia lógica de subcategorías:

| Categoría | Subcategorías por |
|---|---|
| **Musculación** | Grupo muscular: Pecho, Espalda, Hombros, Brazos, Piernas, Core, Glúteos, Full body |
| **Fuerza** | Movimiento principal: Sentadilla, Peso muerto, Press banca, Accesorios, Métodos especiales |
| **Funcional / HIIT** | Tipo: Locomoción, Cambio de nivel, Empuje, Tracción, Rotación/Core |
| **Olímpico** | Movimiento: Clean, Snatch, Jerk, Derivados, Complejos |
| **Movilidad** | Articulación: Cadera, Hombro, Tobillo, Torácica, Muñeca, Integrada |
| **Stretching** | Zona: Tren superior, Tren inferior, Columna, Full body |
| **Yoga** | Tipo: De pie, Suelo, Equilibrio, Inversión, Secuencias, Respiración |
| **Pilates** | Serie: Mat básico, Mat intermedio, Mat avanzado |
| **Rehab / Prehab** | Articulación: Hombro, Rodilla, Cadera, Columna, Tobillo, Auto-liberación |
| **Calentamiento** | Tipo: Activación glútea, Movilidad articular, Foam rolling, Dinámico general, Específico |
| **Pliometría** | Nivel: Nivel 1 (reactivos bajos), Nivel 2 (saltos bilaterales), Nivel 3 (saltos unilaterales / profundidad) |
| **Cardio** | Tipo: Máquinas, Sled/trineo, Battle ropes, Soga, Sprint |

#### Nivel 3 — Filtros cruzados (aplican sobre cualquier categoría o subcategoría)

Los filtros se combinan entre sí y con la categoría seleccionada. Funcionan como refinadores, no como navegación alternativa.

| Filtro | Opciones | Uso principal |
|---|---|---|
| **Equipamiento** | Peso corporal, Barra olímpica, Mancuernas, Kettlebell, Polea, Máquina, Banda elástica, TRX, Bosu, Fitball, Medicine ball, Slam ball, Soga de saltar, Cajón pliométrico, Foam roller, Anillas, Escalera de agilidad, Trineo, Battle ropes, Step, Disco, Barra Z, Trap bar, Landmine, Sin equipo | Filtrar por lo que tiene disponible el cliente |
| **Patrón de movimiento** | Empuje horizontal, Empuje vertical, Tirón horizontal, Tirón vertical, Dominante de rodilla, Dominante de cadera, Core (anti-extensión, anti-rotación, anti-flexión lateral, rotación), Locomoción, Pliometría, Aislamiento, Carga y desplazamiento, Movilidad articular, Estiramiento | Filtrar por mecánica biomecánica |
| **Músculo agonista** | Todos los músculos principales (pectoral, dorsal, deltoides, bíceps, tríceps, cuádriceps, isquiosurales, glúteo mayor, glúteo medio, etc.) | Filtrar por músculo objetivo |
| **Lateralidad** | Bilateral, Unilateral, Alterno, Asimétrico | Filtrar por tipo de ejecución |
| **Nivel de dificultad** | 1 (muy fácil) a 5 (avanzado/complejo) | Filtrar por capacidad del cliente |
| **Impacto articular** | Bajo, Medio, Alto | Filtrar para clientes con restricciones articulares |
| **Carga axial** | Sí / No | Filtrar para clientes con patologías de columna |

#### Flujo de uso completo

```
PROFESIONAL ARMANDO UNA SESIÓN
│
├── Opción A: BÚSQUEDA DIRECTA
│   └── Escribe "sentadilla búlgara" en el buscador
│       └── Resultado directo → drag & drop al builder
│
├── Opción B: NAVEGACIÓN POR CATEGORÍA
│   ├── Clic en "Musculación"
│   ├── Clic en subcategoría "Piernas"
│   ├── Aplica filtro: Equipamiento = Mancuernas
│   ├── Aplica filtro: Nivel = 3
│   └── Ve: sentadilla búlgara, step up, estocada reversa...
│       └── Selecciona → drag & drop al builder
│
└── Opción C: NAVEGACIÓN POR FILTRO DIRECTO
    ├── Sin elegir categoría, aplica filtro: Músculo = Glúteo Mayor
    ├── Ve todos los ejercicios de todas las categorías que trabajan glúteo
    └── Puede refinar: Equipamiento = Banda elástica + Nivel = 1
        └── Ve: clamshell, puente de glúteos, monster walk...
```

---

### Metadatos por ejercicio (ficha técnica)

Cada ejercicio en la base de datos tiene los siguientes campos:

| Campo | Tipo | Visible para |
|---|---|---|
| **ID_Ejercicio** | Código único (CATEGORIA_001) | Sistema (interno) |
| **Nombre_Oficial** | Texto | Entrenador + Cliente |
| **Alias_Buscador** | Texto (nombres alternativos, inglés, apodos) | Buscador (interno) |
| **Categoría** | Selector (12 categorías) | Entrenador |
| **Subcategoría** | Selector (variable por categoría) | Entrenador |
| **Patrón_Movimiento** | Selector | Entrenador (filtro) |
| **Lateralidad** | Selector (bilateral/unilateral/alterno/asimétrico) | Entrenador |
| **Carga_Axial** | Sí/No | Entrenador (filtro) |
| **Musculo_Agonista** | Selector | Entrenador + Cliente |
| **Musculos_Sinergistas** | Texto (separados por coma) | Entrenador |
| **Equipamiento_Requerido** | Selector múltiple | Entrenador (filtro) + Cliente |
| **Nivel_Habilidad** | Numérico 1-5 | Entrenador (filtro) |
| **Nivel_Impacto_Articular** | Selector (Bajo/Medio/Alto) | Entrenador (filtro) |
| **Video** | URL o archivo | Entrenador + Cliente |
| **Instrucciones de ejecución** | Texto libre (opcional) | Cliente |
| **Errores comunes** | Texto libre (opcional) | Entrenador |

---

### Funcionalidades clave

#### MUST HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 1 | **Buscador global de ejercicios** | Campo de texto siempre visible. Búsqueda en nombre, alias, músculo, equipamiento. Autocompletado en tiempo real. |
| 2 | **12 categorías principales navegables** | Grid visual con las 12 categorías. Un toque → entra a la categoría. Iconografía clara por categoría. |
| 3 | **Subcategorías dentro de cada categoría** | Cada categoría tiene su propia lógica de subdivisión (músculo, articulación, tipo, nivel). |
| 4 | **Filtros cruzados combinables** | Equipamiento, patrón, músculo, lateralidad, nivel, impacto, carga axial. Se combinan entre sí y con la categoría. |
| 5 | **Ficha de ejercicio con video** | Al tocar un ejercicio se abre la ficha: nombre, video/GIF, músculos, equipamiento, nivel, instrucciones. |
| 6 | **Drag & drop al builder de sesiones** | Desde la ficha o la lista de resultados, arrastrar el ejercicio al builder. En mobile: botón "Agregar a sesión". |
| 7 | **Ejercicios personalizados del entrenador** | El entrenador puede crear ejercicios propios con nombre, video, descripción y campos de taxonomía. Quedan en su biblioteca privada. |
| 8 | **Ejercicios favoritos** | El entrenador puede marcar ejercicios como favoritos para acceso rápido. Sección "Mis favoritos" accesible desde el banco. |
| 9 | **Biblioteca de videos del cliente (YouTube)** | El cliente puede guardar videos de YouTube de ejercicios en su biblioteca personal dentro de la app. El entrenador accede a la biblioteca del cliente y ve qué videos guardó. Ver detalle abajo. |

#### Detalle — Biblioteca de videos del cliente (YouTube)

**Flujo del cliente:**
1. El cliente encuentra un video de ejercicio en YouTube que le interesa.
2. Desde la app, pega el link de YouTube o lo comparte directamente (share intent de YouTube → app).
3. El video se guarda en su **biblioteca personal de videos** con: thumbnail automático, título del video, link, y opcionalmente una nota del cliente ("este ejercicio me lo recomendó mi kinesiólogo").
4. El cliente puede organizar sus videos en carpetas o etiquetarlos (ej: "hombro", "movilidad", "quiero probar").
5. La biblioteca queda accesible en una sección "Mis videos" dentro del perfil del cliente.

**Flujo del entrenador:**
1. El entrenador entra al perfil del cliente y ve la sección "Videos guardados por el cliente".
2. Ve los videos que el cliente guardó: thumbnail, título, fecha, nota del cliente.
3. El entrenador puede ver el video (se abre en la app o redirige a YouTube).
4. El entrenador puede **aprobar, comentar o advertir** sobre un video: "este ejercicio no es para tu nivel" o "buena elección, lo incorporamos la semana que viene".
5. Opcionalmente, el entrenador puede **importar el video a la sesión de entrenamiento** del cliente, vinculándolo como video de demostración de un ejercicio personalizado.

**Por qué es importante:**
- El cliente consume contenido de fitness en YouTube constantemente. Si la app captura esos videos, el entrenador entiende qué está viendo el cliente y puede guiar mejor.
- Evita que el cliente haga ejercicios que vio en YouTube sin supervisión — el entrenador puede revisar y opinar.
- Genera engagement: el cliente tiene una razón más para abrir la app todos los días.

#### NICE TO HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 10 | **Ejercicios recientes** | Sección "Usados recientemente" que muestra los últimos 20-30 ejercicios que el entrenador seleccionó. Acelera la programación repetitiva. |
| 11 | **Sugerencias por contexto** | Si el entrenador ya agregó un press banca al builder, el sistema sugiere ejercicios complementarios (aperturas, press inclinado, fondos). Basado en patrón + músculo. |
| 12 | **Filtro inteligente por restricciones del cliente** | Si el cliente tiene una lesión de hombro cargada en la anamnesis (Módulo Onboarding), el banco puede filtrar automáticamente ejercicios con impacto alto en hombro. El entrenador puede desactivar este filtro. |
| 13 | **Vista por músculo (mapa corporal)** | Vista alternativa donde el entrenador toca un músculo en una silueta corporal y ve los ejercicios que lo trabajan. Visual e intuitiva, complementaria a la navegación por categoría. |
| 14 | **Comparativa de ejercicios** | Seleccionar 2-3 ejercicios y ver lado a lado: músculos, nivel, equipamiento, impacto. Útil para elegir entre alternativas. |
| 15 | **Tags personalizados del entrenador** | El entrenador puede agregar tags propios a cualquier ejercicio ("usar con principiantes", "favorito para hipertrofia de hombro", "evitar si hay dolor de rodilla"). Solo visibles para él. |
| 16 | **Historial de uso por ejercicio** | Ver cuántas veces y con qué clientes se usó un ejercicio. Dato útil para diversificar la programación. |

---

### Referencia de mercado

#### Qué hace bien la competencia

- **Hexfit**: Banco de 3,046 ejercicios con filtros por músculo, equipamiento y búsqueda por texto. Videos de demostración. Drag & drop al builder. Es la referencia funcional más directa.
- **TrueCoach**: 3,000+ videos pre-cargados. Interfaz limpia de búsqueda. El entrenador puede subir videos propios.
- **ABC Trainerize**: Biblioteca de ejercicios con videos y la posibilidad de crear ejercicios personalizados con video del entrenador.
- **MuscleWiki**: 1,900+ ejercicios en 14 idiomas con videos. Navegación por músculo en mapa corporal interactivo. Open API disponible.

#### Qué hace mal la competencia

- **Todas organizan solo por grupo muscular.** No hay categorías funcionales (movilidad, pliometría, yoga, rehabilitación). Un profesional que busca un ejercicio de movilidad de cadera no tiene dónde ir — tiene que buscar por texto y esperar que aparezca.
- **Los filtros son limitados.** Ninguna app filtra por carga axial, impacto articular, lateralidad o patrón de movimiento. Estos datos son críticos para profesionales que trabajan con poblaciones con restricciones (lesiones, patologías de columna, adultos mayores).
- **No hay vinculación con las restricciones del cliente.** Si el cliente tiene una lesión de hombro, el banco no filtra ni advierte. El entrenador tiene que recordarlo de memoria.
- **Las bases de datos de ejercicios están sesgadas a musculación.** Yoga, Pilates, movilidad y rehabilitación tienen cobertura pobre o nula en las apps de coaching.

#### Gap de mercado que esta app puede ocupar

> Ninguna app del mercado tiene una **biblioteca de ejercicios con navegación por categoría funcional + filtros biomecánicos (carga axial, impacto articular, patrón de movimiento)**, cubriendo musculación, fuerza, funcional, olímpico, movilidad, stretching, yoga, pilates, rehabilitación, pliometría y cardio en una sola base integrada.

---

### Consideraciones de UX relevantes

1. **El buscador es lo primero que ve el profesional.** Tiene que estar en la parte superior del banco, siempre visible, sin necesidad de scroll. Un profesional apurado entre sesiones escribe "press" y en 2 segundos tiene lo que necesita.

2. **Las categorías son un grid visual, no una lista.** 12 categorías con iconografía clara (pesa para musculación, persona corriendo para cardio, hueso para rehabilitación, loto para yoga). El profesional identifica la categoría de un vistazo, sin leer.

3. **Los filtros no deben sobrecargar la pantalla.** Arrancan colapsados. El profesional los despliega si necesita refinar. Los filtros activos se muestran como pills removibles ("Equipamiento: mancuernas ×", "Nivel: 2 ×").

4. **El video se reproduce en loop sin audio.** Como un GIF. El profesional (y el cliente) necesitan ver el movimiento rápido, no un tutorial completo. 10-15 segundos de loop. El audio sobra.

5. **Mobile first para el banco de ejercicios.** El entrenador arma sesiones desde el celular en el gimnasio. El banco tiene que ser navegable con una sola mano: categorías grandes, scroll vertical, filtros como bottom sheet, selección con un toque.

6. **El banco de ejercicios es compartido pero los favoritos y tags son privados.** Todos los entrenadores de la plataforma ven la misma base de ejercicios. Los ejercicios personalizados, favoritos y tags son de cada entrenador.

7. **Consistencia de nombres.** La base de datos tiene un solo nombre oficial por ejercicio + alias para búsqueda. Si el profesional busca "lagartija", "flexión de brazos" o "push up", los tres lo llevan al mismo ejercicio. Esto requiere curaduría estricta del campo Alias_Buscador.

---

### Preguntas abiertas para el equipo de desarrollo

1. **¿Cómo se gestiona la carga inicial de ~1,700 ejercicios?** ¿Se pre-cargan en una migración de base de datos, se importan desde CSV/JSON, o se cargan progresivamente? La taxonomía ya está en archivos CSV/MD listos para importación.

2. **¿Qué motor de búsqueda se usa para el buscador?** Full-text search nativo de la base de datos (PostgreSQL FTS, Elasticsearch) o búsqueda client-side con indexación en cache. El volumen (~1,700 ejercicios × 5-6 campos buscables) no es grande, pero la velocidad de autocompletado tiene que ser imperceptible (<100ms).

3. **¿Los videos se almacenan localmente o en CDN?** 1,700 ejercicios × ~5MB por video = ~8.5TB. Requiere CDN o streaming adaptativo. Los GIFs son más livianos (~500KB) pero menor calidad. Opción híbrida: GIF para preview, video HD al abrir la ficha.

4. **¿Se permite que el entrenador modifique los metadatos de un ejercicio de la base compartida?** Recomendación: no. Los metadatos de la base compartida son de solo lectura. El entrenador puede agregar tags propios (privados) pero no cambiar el nombre oficial, el músculo agonista ni el nivel. Para eso, crea un ejercicio personalizado en su biblioteca privada.

5. **¿Cómo se manejan los ejercicios con múltiples categorías?** Un Thruster es "Fuerza" y también "Funcional/HIIT" y también "Olímpico". ¿Se muestra en las tres categorías, o se asigna a una primaria y aparece en las otras vía filtros? Recomendación: categoría primaria + aparición secundaria vía búsqueda y filtros.

6. **¿El filtro por restricciones del cliente (nice to have #11) cruza datos del módulo de Onboarding?** Si sí, ¿la consulta es en tiempo real contra el perfil del cliente activo en el builder, o es un flag pre-calculado? Esto tiene implicaciones de rendimiento.

7. **¿Se implementa el mapa corporal interactivo (nice to have #13) en fase 1 o posterior?** Es un feature visual atractivo pero complejo de desarrollar. Recomendación: fase 2, una vez que la base de ejercicios esté estable y la navegación por categoría + filtros validada con usuarios.

8. **¿Cómo se integra YouTube para la biblioteca del cliente?** Opciones: (a) el cliente pega un link y la app usa la YouTube oEmbed API para extraer thumbnail + título automáticamente (sin necesidad de YouTube Data API key); (b) se usa la YouTube Data API v3 para metadata más rica (duración, canal, descripción) pero requiere API key y tiene cuotas diarias. Recomendación: arrancar con oEmbed (simple, sin key) y migrar a Data API si se necesita más metadata.

9. **¿Los videos de YouTube del cliente se reproducen dentro de la app o se redirigen a YouTube?** Embed inline (usando iframe de YouTube) es más fluido pero consume más datos y puede tener restricciones de la API de YouTube. Redirección es más simple pero saca al usuario de la app.

10. **¿El entrenador puede agregar videos de YouTube a la base de ejercicios compartida o solo a la biblioteca personal del cliente?** Recomendación: el entrenador puede importar un video de YouTube como parte de un ejercicio personalizado (su biblioteca privada). Los videos de YouTube del cliente viven en su perfil, no en la base compartida.

---

*Módulo de Biblioteca de Ejercicios cerrado.*

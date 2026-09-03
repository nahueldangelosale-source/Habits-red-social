# Relevamiento de Producto — App para Profesionales del Entrenamiento
**Sesión con:** Leandro (Profesor de Educación Física, Lic. en Alto Rendimiento, estudiante de medicina, +8 años de experiencia en coaching presencial y online)
**Documento preparado para:** Equipo de desarrollo (socio, programador, ingeniero de software)

---

## MÓDULO 1 — Programación de Entrenamientos: Sistema de Biblioteca y Asignación

---

### Problema que resuelve
*(Desde la perspectiva del profesional)*

El entrenador experto acumula con el tiempo una gran cantidad de programas diseñados, pero las herramientas actuales no permiten organizarlos con una jerarquía propia y navegable. El resultado es una biblioteca plana —una lista de nombres— que crece hasta volverse inutilizable: el entrenador pierde de vista qué programas tiene disponibles, no puede reutilizarlos con eficiencia y termina rehaciendo trabajo ya hecho.

El segundo problema es el flujo de asignación: hoy existe una separación entre la biblioteca del entrenador (sus templates, su IP) y el programa del cliente (una instancia personalizada y modificable). Las apps actuales colapsan estas dos entidades en una sola, lo que genera confusión entre el original y las copias, y hace imposible mantener orden a largo plazo.

---

### Lógica funcional central
*(Cómo debe comportarse el sistema)*

El módulo opera sobre **dos entidades separadas y con lógica distinta:**

#### Entidad 1 — Biblioteca del entrenador (Templates)
- Es la IP del entrenador. Nadie más la ve ni la modifica.
- Se organiza en una **jerarquía de carpetas definida por el entrenador**, sin estructura impuesta por la app.
- La jerarquía natural es: `Macrociclo > Mesociclo > Semanas/Rutinas`, pero el sistema no debe forzar esa nomenclatura — el entrenador nombra las carpetas como quiere.
- Los macrociclos no tienen duración fija: pueden ser 3 meses, 8 meses, o lo que el entrenador decida.
- Cada mesociclo contiene rutinas con: ejercicios, series, repeticiones, RIR/RPE, descansos, y campo de observaciones libres por ejercicio y por sesión.

#### Entidad 2 — Programa del cliente (Instancia asignada)
- Se genera al **asignar un template de la biblioteca a un cliente**: el sistema crea una copia independiente.
- El original en la biblioteca **no se modifica** si se edita la copia del cliente.
- Si el mismo template se asigna a múltiples clientes, cada uno tiene su propia copia independiente.
- La copia es **plenamente editable** por el entrenador para ese cliente específico (puede cambiar ejercicios, series, descansos, notas, sin afectar el template original ni a otros clientes).

#### Lógica de liberación progresiva (visibilidad del cliente)
- El sistema libera el contenido al cliente **por fechas**, mesociclo a mesociclo.
- El cliente ve el mesociclo activo; los siguientes están bloqueados hasta que llegue su fecha.
- Una vez que el cliente avanza y completa un mesociclo, ese contenido se oculta o archiva en la vista del cliente (sigue visible para el entrenador).
- La continuidad determina la liberación: si el cliente interrumpe, el entrenador puede intervenir manualmente sobre el cronograma.

#### Diagrama de flujo conceptual

```
BIBLIOTECA (entrenador)
└── [Carpeta] HIPERTROFIA INTERMEDIO
    ├── [Sub-carpeta] Meso 1 — Base
    │   ├── Semana 1
    │   ├── Semana 2
    │   ├── Semana 3
    │   └── Semana 4
    ├── [Sub-carpeta] Meso 2 — Acumulación
    └── [Sub-carpeta] Meso 3 — Intensificación

        ↓ ASIGNAR A CLIENTE (genera copia independiente)

PERFIL DEL CLIENTE — Juan García
└── HIPERTROFIA INTERMEDIO [copia editable]
    ├── Meso 1 → ACTIVO (visible para el cliente)
    ├── Meso 2 → BLOQUEADO (se libera: 01/09/2025)
    └── Meso 3 → BLOQUEADO (se libera: 01/10/2025)
```

---

### Funcionalidades clave

#### MUST HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 1 | **Árbol de carpetas navegable** | El entrenador crea, nombra, anida y reorganiza carpetas libremente. Sin estructura impuesta por la app. |
| 2 | **Buscador global de biblioteca** | Búsqueda por nombre de programa, mesociclo o carpeta. Para cuando el volumen de templates hace inviable la navegación manual. |
| 3 | **Creación de rutina con campos completos** | Ejercicio, series, reps, RIR/RPE, descanso, notas por ejercicio, notas generales de sesión. |
| 4 | **Asignación de template a cliente = copia independiente** | El original queda intacto. La copia es editable sin límite. |
| 5 | **Liberación por fechas al cliente** | El sistema controla qué mesociclo ve el cliente según fecha. El entrenador puede ajustar manualmente. |
| 6 | **Onboarding de cliente por email** | El entrenador ingresa el mail del cliente → el sistema envía invitación → el cliente descarga la app, crea usuario y completa el formulario de evaluación inicial que el entrenador configuró. |
| 7 | **Duplicado de template** | Poder duplicar una carpeta o un mesociclo para usarlo como punto de partida de una variante sin construir desde cero. |

#### NICE TO HAVE

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| 8 | **Vista previa del template antes de asignar** | Ver el contenido de un mesociclo desde la biblioteca sin tener que abrirlo de edición. |
| 9 | **Etiquetas opcionales sobre carpetas** | Tags como "fuerza", "hipertrofia", "intermedio", "mujer" para filtrado adicional. Complementan el árbol, no lo reemplazan. |
| 10 | **Historial de asignaciones por template** | Ver a qué clientes se asignó ese template y cuándo. Útil para saber qué programas están activos "en campo". |
| 11 | **Campo de observaciones generales del mesociclo** | Nota interna del entrenador sobre el bloque: contexto, objetivo, advertencias de diseño. No visible para el cliente. |

---

### Referencia de mercado

#### Qué hace bien la competencia

- **CoachRx**: Es la que más se acerca a la lógica de periodización real. Tiene estructura explícita Macrociclo > Mesociclo con fechas y fases. Es la referencia más cercana en términos de pensamiento periodizado.
- **TrueCoach**: Builder limpio, flujo ágil de creación, buena biblioteca de videos de ejercicios, copia y pegado de sesiones.
- **PT Distinction**: Permite copiar y pegar secciones de rutinas (calentamientos, bloques finales), lo que acelera la construcción de programas similares.
- **Hexfit**: Builder sólido, gran biblioteca de ejercicios, estructura por fase/semana/día, UI simple para el cliente.

#### Qué hace mal la competencia

- **Ninguna app ofrece jerarquía de carpetas real para la biblioteca de templates del entrenador.** Todas trabajan con listas planas + búsqueda/filtros. El entrenador no puede definir su propia arquitectura de organización.
- **Ninguna separa explícitamente la entidad "template" de la entidad "programa de cliente"** como objetos con lógica distinta. La asignación es ambigua: en muchos casos editar la copia afecta el original, o directamente no existe concepto de "original".
- **CoachRx**, aunque es la más periodizada, construye los macrociclos *dentro del perfil del cliente*, no en una biblioteca independiente reutilizable. Cada vez que arrancás con un cliente nuevo, construís desde cero o duplicás manualmente el trabajo de otro cliente.
- **Hexfit** no tiene app móvil para el entrenador (solo para el cliente), lo que limita la gestión en movimiento.

#### Gap de mercado que esta app puede ocupar

> Ninguna app del mercado tiene una **biblioteca de templates con jerarquía de carpetas navegable + buscador**, que funcione como la IP organizada del entrenador, separada y desacoplada de los programas asignados a clientes.

Este gap es especialmente crítico para entrenadores con alta rotación de clientes y muchos años de trabajo acumulado — exactamente el perfil de usuario objetivo.

---

### Consideraciones de UX relevantes

1. **Dos modos de navegación, no uno**: El árbol de carpetas y el buscador no son redundantes — son para momentos distintos. El árbol es para cuando el entrenador sabe dónde está lo que busca. El buscador es para cuando tiene volumen alto y necesita encontrar algo rápido. Ambos deben coexistir en la misma pantalla.

2. **La asignación tiene que ser un gesto, no un proceso**: Desde la biblioteca, el entrenador debería poder asignar un macrociclo a un cliente en 2-3 toques máximo: seleccionar template → elegir cliente → confirmar fechas de liberación → listo.

3. **El cliente y el entrenador ven cosas distintas del mismo programa**: El entrenador ve el macrociclo completo con todas las semanas. El cliente solo ve lo que tiene habilitado. Esto tiene que ser visible para el entrenador en la vista del programa (indicador claro de "visible para el cliente" vs "bloqueado").

4. **No imponer nomenclatura**: La app no debe llamar "Macrociclo / Mesociclo / Microciclo" a las carpetas de forma obligatoria. El entrenador elige el nombre. La jerarquía es libre.

5. **Mobile-first para el entrenador también**: Una de las quejas recurrentes en Hexfit es que no tiene app móvil para crear programas. El entrenador trabaja entre sesiones, en el gimnasio, desde el celular. La creación y edición de rutinas tiene que funcionar bien en mobile.

---

### Preguntas abiertas para el equipo de desarrollo

1. **¿Cuántos niveles de anidamiento soporta el árbol de carpetas?** La lógica natural es 2 niveles (Macrociclo > Mesociclo), pero un entrenador podría querer un tercer nivel (Macrociclo > Mesociclo > Bloque). ¿Se limita a 2 o se permite n niveles?

2. **¿Cómo se gestiona la liberación progresiva si el cliente no completa el mesociclo activo?** ¿La fecha de liberación del siguiente es fija (calendario) o relativa (X días después de que el cliente marca el anterior como completo)? ¿Quién controla eso, el sistema o el entrenador?

3. **¿Qué pasa con la copia del cliente si el entrenador borra el template original de la biblioteca?** La copia debería sobrevivir de forma independiente.

4. **¿El buscador busca solo en nombres de carpetas/programas o también dentro del contenido (nombres de ejercicios, notas)?** Un buscador que encuentre "sentadilla búlgara" dentro de cualquier rutina de la biblioteca sería muy potente.

5. **¿Cómo se versiona la biblioteca?** Si el entrenador actualiza un template (mejora el Meso 2 después de haberlo usado con varios clientes), ¿puede aplicar esa actualización a los clientes que todavía no llegaron a ese mesociclo, o cada copia es perpetuamente independiente?

6. **¿La app soporta múltiples entrenadores en la misma cuenta (modelo de equipo)?** Si hay un equipo de coaches, ¿la biblioteca es compartida o individual por entrenador?

---

*Módulo 1 cerrado. Pendiente: Módulo 2 (Calendario) y Módulo 3 (Hábitos).*

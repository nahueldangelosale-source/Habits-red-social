# Arquitectura del Motor: Arquetipo "Especialista en Calistenia / Peso Corporal" (ARQ_BODYWEIGHT_EXPERT)

> **Rango**: Desde acondicionamiento articular basal hasta habilidades estáticas de gimnasia (Planche, Front Lever) y empujes invertidos (HSPU).  
> **Enfoque Fisiológico**: Progresión por alteración de palanca biomecánica, Torque (Nm), Steady State Cycle (SSC) para tejido conectivo avascular, y Tablas de Prilepin para isometrías.

## 1. Algoritmia de Progresión: El Árbol de Nodos

A diferencia de la hipertrofia tradicional que suma discos a una barra, el motor calisténico clasifica los ejercicios en un árbol de dependencias donde avanzar significa empeorar la "desventaja mecánica" del ejecutante.

### Matrices de Progresión Central

| Nivel | Empuje Horizontal (Foco: Planche) | Empuje Vertical (Foco: HSPU) | Miembro Inferior Unilateral |
|-------|-----------------------------------|------------------------------|-----------------------------|
| **1** | Wall Push-up | Pike Push-up | Assisted Squat |
| **2** | Incline Push-up | Elevated Pike Push-up | Bodyweight Squat |
| **3** | Floor Push-up | Dips (Paralelas) | Split Squat / Step-ups |
| **4** | Diamond Push-up | Wall HeSPU (Headstand) | Bulgarian Split Squat |
| **5** | Pseudo Planche Push-up | Wall HSPU (Handstand) | Beginner Shrimp Squat |
| **6** | Tuck Planche | Freestanding HeSPU | Pistol Squat |
| **7** | Advanced Tuck Planche | Freestanding HSPU | Advanced Shrimp Squat |
| **8** | Straddle Planche | / | (Límite: Activa lastre externo) |
| **9** | Full Planche | / | / |

*Nota: Si el usuario declara poseer barras y discos, el sistema desvía automáticamente el entrenamiento de piernas hacia la sobrecarga axial tradicional (Sentadillas / Peso Muerto), ya que es biomecánicamente superior.*

### Válvulas de Seguridad (Firewalls Algorítmicos)
* **Muscle-up**: Bloqueado algorítmicamente hasta que el usuario registre y valide `3x8 Pull-ups` estrictas y `3x8 Dips` profundos (previene luxación de hombro y desgarro del tendón del bíceps).
* **Front Lever**: Bloqueado hasta consolidar el nivel de "Remos Horizontales" (Horizontal Rows).

---

## 2. Lógica Transaccional: La "Regla del Ascenso" (Level-Up)

El Plan Builder opera bajo el principio de **doble progresión** (primero volumen, luego intensidad).

1. **Inicialización**: Al ingresar a un nuevo nodo (ej. Pseudo Planche), la meta inicial se fija en **3 series de 5 repeticiones (3x5)**.
2. **Expansión Microcíclica**: El motor añade 1 repetición por serie si el usuario se mantiene a "Fallo - 1".
3. **Umbral Máximo de Promoción**: Al alcanzar fluidamente **3x8** con tempo controlado, el sistema ejecuta `promote_progression()`.
4. **Transición**: Desactiva el nodo actual, activa el siguiente (ej. Tuck Planche) y reinicia el volumen a **3x5**.
5. **Umbral de Regresión (Seguro contra Ego)**: Si el usuario es promovido pero fracasa consistentemente en sostener 3x5 limpios, se ejecuta `demote_progression()` para forzar el retorno al nodo anterior.

---

## 3. Cuantificación Computacional de Intensidad

### Ecuación de Torque para Brazos de Momento
El motor traduce ángulos corporales en carga de kilogramos (Newtons-metro) utilizando la física de cuerpo rígido.
Ejemplo para un atleta de 1.87m y 102kg en progresión de Planche:
* *Tuck Planche*: El centro de masa está cerca del hombro. Torque ~105 Nm (Equivale a sostener mancuernas de 19kg por brazo).
* *Straddle Planche*: Piernas abiertas acortan palanca. Torque ~161 Nm (~29kg por brazo).
* *Full Planche*: Extensión total. Torque ~182 Nm (~33.3kg por brazo).

### Modulación de Prilepin para Volumen Isométrico
* **Equivalencia Fisiológica**: 1 Repetición Concéntrica = 2 Segundos Isométricos.
* **El Límite**: Nunca se retiene al 100% (causa degradación técnica). El algoritmo receta retenciones al **60-70% del Max Hold Time** del usuario.
* *Ejemplo*: Si el Max Hold de un atleta es 20s, el motor prescribirá holds de 13s. Para alcanzar el volumen hipertrófico óptimo (25-50 reps concéntricas = 50-100s isométricos), recetará **4 a 5 series de 13 segundos**.

---

## 4. Arquitectura de la Sesión

**Estructura Jerárquica Obligatoria**:
`Calentamiento (Locomoción) -> Habilidad (Skill) -> Fuerza (Strength) -> Flexibilidad`

* **Skill vs Strength**: Handstand = Skill (Sistema vestibular, propiocepción, prescrito en micro-bloques tipo EMOM antes de la fatiga). Planche / Front Lever = Strength (Fuerza mecánica pura, va al bloque principal).
* **Pares Combinados (Paired Sets)**: El motor acopla antagonistas para ahorrar tiempo sin perder recuperación de ATP. Ej: Dominadas + Sentadillas (Descanso 90s). El dorsal ancho descansa >3 min mientras se hace la sentadilla.

---

## 5. Salud Articular y Tejido Conectivo

### Steady State Cycle (SSC)
Los tendones son avasculares y tardan meses en remodelar sus fibras de colágeno, mientras el músculo tarda días. Una progresión agresiva desgarra el tendón.
* Si el sistema detecta entradas a isometrías de alto torque o reportes de dolor, activa el SSC:
* Congela el volumen e intensidad al **50% de la capacidad máxima** y lo mantiene invariable durante **8 a 12 semanas** ininterrumpidas.

### Checkpoints Biométricos Obligatorios (ROM)
* **Flexión Dorsal de Muñeca (90°)**: Si falla, inyecta rutinas de "Wrist Prep".
* **Flexión Glenohumeral (180°)**: Si falla para HSPU, redirige a dislocaciones con banda.
* **Codo en Extensión Estricta (Straight Arm Strength)**: Acondicionamiento bicipital preventivo.

---

## 6. Nutrición: Maximizar la Potencia Relativa

* **Superávit Conservador**: Mantenimiento o superávit minúsculo (100-200 kcal). Un exceso de grasa/sarcoplasma es un "lastre biológico" catastrófico para la palanca (Planche).
* **Proteína**: 1.8 - 2.2 g/kg de masa magra.
* **Protocolo Tendinoso (Keith Baar)**: **10 a 15g de péptidos de colágeno + 50mg Vitamina C**, consumidos exactamente **45 a 60 minutos ANTES** de una sesión isométrica o SSC.
  * *Mecánica*: La tensión isométrica del calentamiento exprime el fluido articular actuando como una "esponja" que succiona el pico plasmático de aminoácidos directo hacia el tendón avascular para repararlo.
* **AINEs prohibidos**: El sistema desaconseja antiinflamatorios (Ibuprofeno), que cortan la cascada inflamatoria necesaria para regenerar el tendón, recomendando en su lugar Omega-3.

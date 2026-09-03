# Arquitectura del Motor: Arquetipo "Atleta Híbrido" (ARQ_HYBRID_ATHLETE)

> **Rango**: Atletas que combinan fuerza máxima/hipertrofia con resistencia cardiovascular extrema (ej. Maratón + Squat pesada).  
> **Enfoque Fisiológico**: Mitigación de Interferencia Concurrente (mTORC1 vs AMPK), Modulación Inversa de Volumen Muscular, ACWR Dual Unificado, Periodización DUP / Bloques.

## 1. Fisiología de la Interferencia Concurrente

El desafío central es la divergencia de señalización celular:
* **Entrenamiento de Fuerza**: Activa la vía anabólica **mTORC1**, induciendo hipertrofia miofibrilar y ganancia de fuerza.
* **Entrenamiento Aeróbico**: Causa crisis energética celular (aumento de AMP), activando **AMPK**. 
* **El Conflicto**: La AMPK inhibe directamente a mTORC1. Un cardio exhaustivo silencia la maquinaria anabólica, destruyendo la ganancia muscular si no se gestiona temporalmente.

### Especificidad de la Modalidad
* **Límite de Frecuencia**: >3-4 días aeróbicos por semana o >45-60 min por sesión desplaza el fenotipo hacia la resistencia y compromete la fuerza.
* **Carrera vs Ciclismo**: El ciclismo genera menor interferencia neuromecánica al no tener un componente de impacto excéntrico masivo. La carrera genera daño microtraumático que compite por recursos de recuperación celular. El algoritmo asignará un "costo de recuperación" mayor a la carrera que al ciclismo.

---

## 2. Reglas de Negocio: Separación Temporal y Prioridad AM/PM

Para disipar la inhibición aguda de mTOR por AMPK y permitir resíntesis de glucógeno, el motor exige **6 a 8 horas mínimas** de separación en dobles turnos (AM/PM).

**La Regla de Oro: "Fuerza Primero"**
Si hay colisión intradiaria, el levantamiento pesado va AM y el cardio PM. Hacer cardio extenuante primero agota la excitabilidad de la motoneurona, impidiendo el reclutamiento de fibras rápidas necesarias para la fuerza.

### Matriz de Conflictos de Horarios

| Conflicto Intradiario | Nivel de Interferencia | Acción Automática del Motor (Resolución) |
|-----------------------|------------------------|------------------------------------------|
| **Fuerza Tren Inferior Pesada (>85% 1RM) + Carrera Larga (>60 min)** | 🚨 **Crítica** | BLOQUEO intradiario. Fuerza separación obligatoria de 24-48 horas para recuperación del tejido excéntrico. |
| **Fuerza Tren Inferior + Intervalos Aeróbicos (VO2/Umbral)** | ⚠️ **Alta (Glucolítica)** | Fuerza obligatoria en AM. Cardio desplazado a PM (6-8h de brecha para separar vías AMPK/mTOR). |
| **Hipertrofia Tren Superior + Ciclismo Z2** | 🟢 **Baja** | Coexistencia fluida. Permite doble turno sin penalización en los índices predictivos. |
| **Día post-Long Run (Tirada Larga dominical)** | 🛑 **Refractariedad** | VETA sentadillas/pesos muertos al día siguiente. Inserta tren superior, prehab o descanso pasivo. |

---

## 3. Algoritmia: Modulación Inversa del Volumen Muscular

La app ajusta dinámicamente el volumen de hipertrofia (series efectivas semanales del tren inferior) en proporción inversa al volumen de resistencia (km/s semanales) para evitar el sobrentrenamiento.

* **Volumen Aeróbico Bajo (<20km o 2h bici)**: 100% volumen hipertrofia (15-20 series piernas).
* **Volumen Medio (20-40km, prep 5K/10K)**: Reducción a 10-14 series piernas. Sustitución de ejercicios excéntricos (estocadas caminadas) por concéntricos/isométricos (prensa, trineo).
* **Volumen Alto (40-60km, Medio Maratón/Triatlón)**: Reducción severa a 6-10 series piernas. 1 sesión pesada o 2 de mantenimiento neural submáximo.
* **Volumen Extremo (>60km, Maratón/Ultra)**: 3-5 series piernas orientadas puramente a fuerza neural (0 hipertrofia sarcoplasmática para evitar sumar masa inútil al corredor). *Nota: Tren superior mantiene 100% del volumen siempre.*

---

## 4. Modelos de Periodización Híbrida

El motor alterna entre dos macro-estrategias según la proximidad del evento:

1. **DUP (Periodización Ondulante Diaria)**: Usada lejos de competiciones. Permite rotar estímulos diarios para disipar fatiga (ej. Lunes Fuerza Máxima, Viernes Potencia Dinámica para salvar el desgaste metabólico pre-Long Run).
2. **Por Bloques (Zatsiorsky/Verkhoshansky)**: A 8 semanas de una prueba clave (ej. Medio Ironman). Congela la fuerza en "mantenimiento" (método 5/3/1 sin hipertrofia) y satura el volumen aeróbico, recanalizando la recuperación hacia un pico neural para el día de la carrera.

---

## 5. El ACWR Dual y Carga Unificada

Unir "Kilos" con "Kilómetros" en un solo gráfico de riesgo.
* **AU_Cardio (Unidades Arbitrarias)**: sRPE (0-10) x Minutos.
* **AU_Fuerza**: Tonelaje Efectivo (series x reps x carga) x RPE x Coeficiente de Estrés Axial (Sentadilla penaliza más que Cuádriceps en máquina).
* **Carga Diaria Unificada**: AU_Cardio + AU_Fuerza.

**Umbrales Híbridos (EWMA):**
Los atletas híbridos densifican su tejido conectivo por el exceso de volumen crónico, tolerando picos mayores.
* Zona Peligro Híbrido: **ACWR > 1.60** (vs 1.50 estándar).
* Precaución Novatos Híbridos: ACWR limitado a **1.40**.
* Superar el límite inyecta un microciclo de *Deload volumétrico* (-20% de volumen) automáticamente.

---

## 6. Bio-Hack Nutricional y Suplementación (Keith Baar Protocol)

* **Ciclado de Carbohidratos**: 
  * Días de Tensión Aeróbica (Tiradas largas): Recarga 1-4g/kg pre-entreno, intra 30-60g/hora (saturación de glucógeno).
  * Días de Fuerza Pura: Reducción drástica de carbohidratos (la hipertrofia agota <40% del glucógeno), priorizando lípidos.
* **Proteína**: Nunca <1.6g/kg/día para sostener el balance nitrogenado del mTORC1 bajo asedio aeróbico.
* **Nutrición Tendinosa Dirigida**: Ingesta de **15-25g péptidos de colágeno + 50mg Vit C** exactamente 40-60 minutos ANTES de la sesión, coincidiendo con la fase isométrica del calentamiento. La carga mecánica hace de "esponja" atrayendo aminoácidos al tendón avascular para colagénesis rápida.
* **Tampón Celular**: Creatina (reciclaje de ATP) y Beta-Alanina (buffer de acidosis) son innegociables para salvar el gap energético del concurrente.

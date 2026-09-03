# Arquitectura del Motor: Arquetipo "CrossFitter"

> **Rango**: Desde atleta base (Scaled) hasta Élite (Competitor).  
> **Enfoque Fisiológico**: Interferencia concurrente, ACWR (EWMA), Periodización Conjugada, sRPE post-WOD.

## 1. Taxonomía de WODs y Métricas Algorítmicas

El motor requiere normalizar las estructuras de entrenamiento para predecir la carga metabólica:

* **FOR_TIME**: Métrica = milisegundos. *Requiere ingesta de splits para detectar deficiencias de lactato.*
* **AMRAP**: Métrica = suma absoluta de repeticiones (convierte rondas + fraccionales).
* **EMOM**: Métrica = array binario por minuto (completado/fallado) + tonelaje acumulado. Un fallo temprano indica sobreestimación de recuperación submáxima.
* **TABATA**: Métrica = número más bajo de reps en las 8 rondas (penaliza sprint inicial suicida).
* **CHIPPER**: Métrica = tiempo total de finalización.
* **Ergómetros (Row, Ski, EchoBike)**: Métrica = Vatios promedio (potencia pura) o Ritmo/500m. La conversión caloría-vatio es obligatoria para calcular trabajo mecánico neto (Joules) independiente del peso corporal.

### Relevamiento de Benchmarks (Testeo Sistémico)

| Benchmark | Vía Metabólica | Peso (M/F) | Élite | RX Competitivo | RX Sólido | Scaled |
|-----------|-----------------|------------|-------|----------------|-----------|--------|
| **Fran** | Potencia Glucolítica | 95 / 65 lbs | < 2:00 | 3:00 - 5:00 | 5:00 - 8:00 | 8:00 - 12:00 |
| **Grace** | Fuerza-Velocidad | 135 / 95 lbs | < 1:30 | 1:30 - 3:00 | 3:00 - 5:00 | 5:00 - 8:00 |
| **DT** | Resistencia de Agarre | 155 / 105 lbs| < 4:30 | 4:30 - 7:00 | 7:00 - 10:00 | 10:00 - 15:00|
| **Murph** | Resistencia Aeróbica | Chaleco 20lb | < 40:00| 40:00 - 50:00 | 50:00 - 65:00 | 65:00 - 80:00|
| **Kalsu** | Umbral de Lactato | 135 / 95 lbs | < 14:00| 15:00 - 19:00 | 19:00 - 22:00 | 22:00 - 30:00|

---

## 2. Gestión de Fatiga (SNC) e Interferencia Concurrente

El fitness funcional sufre de la inhibición de mTOR por AMPK (aeróbico suprime hipertrofia).
**Solución Algorítmica**: Periodización Conjugada (Microciclo rotativo).

* **Días Max Effort (ME)**: Reclutamiento de unidades motoras rápidas (90-100% 1RM). Volumen bajo (1-3 reps). WOD asociado: corto (8-12 min), carga ligera (evitar fallos bajo fatiga central).
* **Días Dynamic Effort (DE)**: Velocidad (50-70% 1RM) máxima aceleración. Se colocan idealmente antes de WODs explosivos (EMOMs gimnásticos).
* **Días Repetition Effort (RE)**: "Bodybuilding Funcional". RPE 6-8, altas reps. Destinado a fortalecer tejido conectivo post-esfuerzo máximo.

### Medición de Carga (ACWR & HRV)
* **ACWR (Promedio EWMA)**: 
  * Sweet Spot: `0.8 - 1.3`.
  * Peligro: `> 1.5` (Riesgo de lesión triplicado).
* **Carga Interna (sRPE)**: RPE x Duración. *Crucial*: El push para pedir el RPE debe llegar **30 minutos después** de finalizado el WOD para evitar sesgos por hiperventilación aguda.
* **HRV (Variabilidad Cardíaca)**: Depresión sostenida + sRPE alto indica dominancia simpática. Dispara script de `down-regulation` (deload automático).

---

## 3. Presets Inteligentes de Arquitectura

| Parámetro | SCALED (Base Anatómica) | RX (Sistémico/Potencia) | COMPETITOR (Supercompensación) |
|-----------|--------------------------|-------------------------|--------------------------------|
| **Días/Semana** | 3 - 4 días | 5 días | 6 días (con splits AM/PM) |
| **ACWR** | 0.9 - 1.15 (Conservador) | 1.0 - 1.25 | 1.1 - 1.35 (Hiper-microciclos) |
| **Bloque A** | Movilidad global | Periodización Conjugada (ME/DE) | AM: Aeróbico Z2 o Halterofilia pesada limpia |
| **Bloque B** | Skill con fatiga nula, WOD moderado (RPE 6.5-7.5) | Metcon RX denso, olímpicos bajo acidosis | PM: Fuerza residual + Metcon brutal |
| **Bloque C** | / | Soporte estructural | Override Master (Deload forzado si HRV cae) |
| **Restricciones**| Cap max 70% 1RM en Olímpicos | Control estricto de tonelaje en tren superior | / |

---

## 4. Requisitos Metabólicos y Nutricionales

* **Carbohidratos Peri-Entrenamiento**: 0.5 - 1g / kg de peso 1-2h pre-WOD (baja fibra, como crema de arroz).
* **Carbohidratos Totales**: 6 - 10g / kg de peso por día (Priorizando polímeros rápidos post-WOD).
* **Proteína**: 1.6 - 2.2g / kg, obligatoriamente fraccionada en bolos de 20-30g cada 3-4 horas (para mantener el trigger de leucina activo).
* **Suplementación Tier 1**:
  * *Creatina*: 3-5g diarios continuos.
  * *Beta-alanina*: 3-5g diarios (buffer intracelular).
  * *Bicarbonato Sódico*: Buffer extracelular táctico pre-WOD.
  * *Omega 3*: 2-3g EPA/DHA en Competitors para inflamación.

---

## 5. Matriz de Sustitución Automática (Smart Swaps)

El algoritmo NO escala simplemente bajando peso; preserva la **vía metabólica, el dominio temporal y el patrón motor**.

| Fallo / Deficiencia | Alternativa RX Competitor (Táctica) | Alternativa Intermedio (Smart Swap) | Alternativa Scaled (Base Biomecánica) | Justificación Lógica |
|---------------------|-------------------------------------|-------------------------------------|---------------------------------------|----------------------|
| **No Muscle-Ups** (Anillas) | Bar Muscle-Up (1 rep) | Burpee Pull-Up (2 reps) / Chest-to-Bar | Jumping Pull-ups + Box Dips | Mantiene tracción, suma interferencia del burpee para replicar el HR del MU. |
| **No Handstand Walk** | Pegboard Ascent (1 rep) | Wall Walks (6 reps) / Shoulder Taps | Bear Crawl / Overhead Hold estático | Imita compresión de núcleo y carga de hombro. |
| **No Toes-to-Bar** | L-Sit Hold (15 seg) | V-Ups (15 reps) / Knees-to-Elbows | Abmat Sit-ups con peso | Preserva flexión de cadera bajo demanda central. |
| **Fallo 1RM en Metcon** (Ej. pesas RX under fatigue) | Auto-Downgrade a 60% de 1RM histórico | / | / | Regla inviolable: No romper el dominio temporal del WOD. Bajar carga permite fluidez sin resetear SNC. |
| **Fallo en "Murph"** (Agotamiento flexiones) | Segmentación forzada (Drop Sets) o Incline/Box Pushups | Misma cuota, atajos volumétricos. | / | Prevenir rotura de cápsula rotadora por compensación excéntrica. |

### "Box Wisdom": Cuidado Epidérmico y Pacing
* **Hiperqueratosis (Callos)**: El motor detecta volumen alto en tracciones y emite push notifications de prevención (Piedra pómez + Grips sin costuras).
* **Calzado**: El motor inhibe sugerir *Lifters* (zapatos de Halterofilia) en WODs mixtos (metcons), recomendando zapato plano (Nano/Metcon) para evitar fascitis y dolor de Aquiles.
* **Estrategia Pacing**: En WODs como Kalsu, el algoritmo emite instrucciones de "Partición Obligatoria" (descansos forzados de 15 segs) para evitar el "Redline" (pH < 6.8).

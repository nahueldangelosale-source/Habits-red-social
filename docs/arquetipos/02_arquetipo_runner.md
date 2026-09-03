# Arquitectura del Motor: Arquetipo "Runner"

> **Rango**: Desde corredores de 5K hasta atletas de Ultratrail de montaña.  
> **Enfoque Fisiológico**: LTHR (Lactate Threshold Heart Rate), GAP (Grade Adjusted Pace), RPE (CR10), Prevención de picos de sesión única.

## 1. Fisiología y Cuantificación de Zonas

El motor descarta la fórmula de FCmáx (220-edad) por su inexactitud (margen de error de hasta 20 lpm). En su lugar, el estándar oro algorítmico es el **Umbral de Lactato de Frecuencia Cardíaca (LTHR)**.

**Test de Calibración:** 30 minutos al máximo esfuerzo sostenido. Se descartan los primeros 10 minutos y se promedian los 20 finales (o test de 20 min - 5%).

### Matriz de Zonas (Basado en Joe Friel)

| Zona | % LTHR | RPE (CR10) | Equivalencia Ritmo | % Potencia (FTP) | Fisiología |
|------|--------|------------|---------------------|------------------|------------|
| **Z1 (Recovery)** | < 85% | 1 - 2 | Ritmo Recuperación | < 80% | Flujo sanguíneo sin fatiga estructural. |
| **Z2 (Aerobic)** | 85 - 89% | 3 - 4 | Ritmo Fácil (Easy) | 80 - 90% | Base aeróbica, oxidación de grasas. 80% del volumen total. |
| **Z3 (Tempo)** | 90 - 94% | 5 | Ritmo Maratón | 90 - 95% | Resistencia muscular, transición glucolítica. |
| **Z4 (Sub-Thres)** | 95 - 99% | 6 - 7 | Ritmo Umbral | 95 - 100% | Esfuerzo "cómodamente duro" sostenible 1 hora. |
| **Z5a (Threshold)** | 100 - 102% | 8 | Intervalo Largo | 100 - 105% | Trabajo en el límite de acumulación exponencial de lactato. |
| **Z5b (VO2Max)** | 103 - 106% | 9 | Intervalo Corto | 105 - 115% | Potencia aeróbica máxima. Limitante en 3K-5K. |
| **Z5c (Anaerobic)** | > 106% | 10 | Repetición (R-Pace) | > 115% | Capacidad anaeróbica, fibras rápidas. |

> **Regla de Pareto:** Algorítmicamente, el 80% del volumen debe recaer en Z1/Z2 para no sobrecargar el SNC.

---

## 2. Gestión de Carga y Prevención de Lesiones

### Adiós a la "Regla del 10%"
El motor desestima la progresión semanal del 10% y adopta el modelo de prevención por **Pico de Sesión Única (Single-Session Spike)**.

* **Trigger de Riesgo:** Si la sesión excede el **110%** de la carrera más larga de los últimos 30 días, el riesgo sube exponencialmente.
* **ACWR (Acute:Chronic Workload Ratio):**
  * Sweet Spot: `0.8 - 1.3`.
  * Undertraining: `< 0.8`.
  * Danger Zone: `> 1.5` (Dispara reducción de intensidad).

### Modelado Topográfico: GAP (Grade Adjusted Pace)
Para Ultratrail, se aplica la ecuación de Minetti. El costo energético en subidas es exponencial. En bajadas superiores al -20%, el daño excéntrico revierte la economía de carrera. El motor aplica un CAP en la ganancia de inercia por descenso.

---

## 3. Presets Inteligentes y Microciclos

| Parámetro | Corta Distancia (5K-10K) | Larga Distancia (Medio/Maratón) | Extrema (Ultratrail) |
|-----------|-------------------------|----------------------------------|----------------------|
| **Días/Semana** | 3 - 5 días | 4 - 6 días | 4 - 6 días |
| **Volumen** | Alta polarización (80% Z1/Z2, 20% Z4/Z5) | Inserciones en Z3/M-Pace | Suprime intensidad, prioriza D+ (Desnivel) |
| **Long Run** | Suave, progresión Z2 a Z3 | Bloques a ritmo de carrera pre-fatigados | **Back-to-Back**: Sáb 4h, Dom 3h. Foco: Time on feet |
| **Fuerza** | 2 días. Pliometría y reactividad | 2 días. Fuerza máxima (Bajas reps) | 2 días. Foco excéntrico y core profundo |

### Interferencia Metabólica ("Hard Days Hard, Easy Days Easy")
1. **Acoplamiento:** Pesas de tren inferior el MISMO día que la sesión de carrera intensa (Intervalos).
2. **Prioridad:** Correr a la mañana (SNC limpio), pesas a la tarde (Separación de 6 a 8 horas).
3. **Firewall del Long Run:** PROHIBIDO programar pesas de pierna el día anterior o el mismo día del Long Run.

---

## 4. Requisitos Nutricionales

* **5K / 10K:** No requiere Carb-loading extremo (400-500g basal alcanza). 25-30g carbohidratos simples 20 min pre-carrera.
* **Medio/Maratón:** Carb-loading de 8-10g/kg durante 36-48h previas. Intracarrera: 30-60g carbos/hora.
* **Ultratrail:** Oxidación exógena masiva. 60-90g carbos/hora (ratio Maltodextrina:Fructosa 2:1 o 1:0.8). Requiere "Entrenamiento del Intestino" (Gut Training) en los Long Runs.
* **Hidratación:** Requiere calibración mediante *Sweat Test*. Reposición basal 500-700mg Sodio/hora, hasta 1000mg+ en climas hostiles.

---

## 5. Matriz de "Smart Swaps" (Resolución Autónoma de Dolor/Fatiga)

| Disparador (Dolor / Alerta) | Estructura Comprometida | Sustitución Algorítmica (Smart Swap) | Intervención Complementaria |
|-----------------------------|-------------------------|--------------------------------------|-----------------------------|
| **Dolor Anterior Rodilla** | Femoropatelar / Rotuliano | **Bici Estática/Indoor**. 100% eliminación de impacto. Mismo tiempo y HR. | Modificación biomecánica: Incrementar cadencia 5-10% en próxima carrera. |
| **Dolor Plantar / Talón** | Fascia / Tendón Aquiles | **Remo o Natación**. (Bici descartada por flexión metatarsiana). | Eliminar calzado Zero Drop / Placas Carbono. Isométricos pantorrilla. |
| **Shin Splints (Espinilla)**| Estrés óseo tibial medial | **Bici Elíptica**. Mimetiza patrón motor sin reacción del suelo. | Congelar progresión de volumen al 105% de sesión previa máxima. |
| **Sobrecarga SNC Severa** | Caída HRV >15%, Suba AFI | **Swap Total de Zona**: Cambiar Z4/Z5 a Z1 Recovery Jog o Descanso absoluto. | Retrasar sesión de calidad hasta que HRV retorne a baseline. |

### "Box Wisdom": Calzado y Mente
* **Regla de Rotación:** Limitar el uso de "Super Shoes" (Placa carbono) solo a velocidad y carrera (riesgo de atrofia propioceptiva y recarga isquiotibial).
* **Transición Zero Drop:** Curva de adaptación forzada de 3 a 6 meses.
* **El "Muro" (Gobernador Central):** Implementar "Chunking" (fragmentación cognitiva) vía notificaciones audibles para reprimir el colapso neuronal.

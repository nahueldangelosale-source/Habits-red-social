# Parametrización Algorítmica y Termodinámica de la Composición Corporal

## 1. Ecuación Predictiva de la Tasa Metabólica Basal (TMB)
El motor de software debe abandonar ecuaciones históricas (Harris-Benedict) en favor de modelos rigurosamente validados mediante calorimetría indirecta contemporánea.

### Justificación Clínica (Mifflin-St Jeor)
Harris-Benedict sobreestima la TMB entre 50 y 80 kcal/día promedio, un sesgo que se amplifica en individuos con sobrepeso. Mifflin-St Jeor se mantiene dentro de un margen de error estricto del ±10% en el 82% de los individuos sanos.

### Formulación Matemática Base
**Hombres:** `TMB = (10 * Peso_kg) + (6.25 * Altura_cm) - (5 * Edad) + 5`
**Mujeres:** `TMB = (10 * Peso_kg) + (6.25 * Altura_cm) - (5 * Edad) - 161`

**Interruptor Katch-McArdle (Failsafe para Atletas de Élite):** 
Si el %Grasa es < 10% (hombres) o < 16% (mujeres):
`TMB = 370 + (21.6 * FFM_kg)`

## 2. Factores de Actividad Física (PAL)
Multiplicadores estándar para calcular el GET (Gasto Energético Total):
- **Sedentario (1.200):** Trabajo de escritorio, sin ejercicio.
- **Ligeramente Activo (1.375):** Ejercicio ligero 1-3 días/sem.
- **Moderadamente Activo (1.550):** Entrenamiento estructurado 3-5 días/sem.
- **Muy Activo (1.725):** Ejercicio intenso 6-7 días/sem (Atletas amateurs).
- **Extremadamente Activo (1.900):** Entrenamiento doble turno o trabajo físico pesado.

## 3. Reglas Biológicas de Restricción (Failsafes Algorítmicos)
Para evitar daños endocrinos y atrofia.

- **Failsafe 1 (Mínimo de Grasa / Protección Endocrina):** Nunca asignar menos de `0.6 g/kg` de peso corporal. Si ocurre, reducir déficit de carbohidratos.
- **Failsafe 2 (Límite Relativo de Grasa):** En déficit moderado/mantenimiento, grasas no deben bajar del 20% del GET.
- **Failsafe 3 (Límite de Alpert / Catabolismo Máximo):** La transferencia máxima de energía es de `69.3 kcal por kg de masa grasa por día`. Si el déficit exigido cruza esto, el software debe forzar el límite máximo ("clamp") para proteger el tejido magro.
- **Failsafe 4 (Pérdida Semanal Máxima):** Limitar el déficit para que no exceda del 0.75% al 1.0% del peso corporal por semana si se desconoce el BF%.
- **Failsafe 5 (Suelo Energético RED-S):** La EA nunca debe caer debajo de `30 kcal / kg FFM / día`.

## 4. Matriz Paramétrica de Asignación por Objetivo

| Objetivo | Desplazamiento GET | Proteína | Grasa | Carbohidratos (Cierre) |
|----------|--------------------|----------|-------|------------------------|
| **1. Hipertrofia** | +10% a +20% | 1.6 a 2.2 g/kg BW | 0.8 a 1.2 g/kg BW | Resto Kcal / 4 |
| **2. Recomposición** | 0% a -10% | 2.0 a 2.4 g/kg BW | 0.8 a 1.0 g/kg BW | Resto Kcal / 4 |
| **3. Pérdida Grasa** | -20% a -25% | 2.3 a 3.1 g/kg FFM | 0.6 a 0.8 g/kg BW | Resto Kcal / 4 |
| **4. Alto Rendimiento** | 0% a +10% | 1.4 a 2.0 g/kg BW | 1.0 a 1.5 g/kg BW | Resto Kcal / 4 |
| **5. Longevidad** | 0% (Eucalórico) | 1.2 a 1.6 g/kg BW | 25% a 35% del GET | Resto Kcal / 4 |

## 5. Lógica de Ejecución (Orden Termodinámico de Cierre)
1. Calcular FFM (`Peso * (1 - Grasa/100)`).
2. Calcular TMB (Mifflin o Katch).
3. Calcular GET (TMB * PAL).
4. Determinar Kcal Objetivo según Desplazamiento de Matriz.
5. Ejecutar Failsafes (Alpert 69.3 kcal/kg FM y RED-S 30 kcal/kg FFM).
6. Calcular gramos de Proteína y restar (g * 4 kcal) del Kcal Objetivo.
7. Calcular gramos de Grasa y restar (g * 9 kcal), verificando Mínimo 0.6 g/kg BW.
8. Dividir las Kcal remanentes por 4 para obtener Carbohidratos.
9. Resolución de Edge Cases: Si Carbos < 0 (o críticamente bajo), disminuir proteína hacia rango inferior, y si no basta, reducir el déficit agresivo total.

# El Motor Biomecánico y ACWR (Rigor Clínico)

> [!NOTE]
> **Estado:** Documento Vivo (Iterativo). Reglas de negocio científicas para el motor de entrenamiento.

## 1. El Foso Defensivo Clínico
La mayoría de las apps de fitness tratan las rutinas como "hojas de Excel". Alpha Dynamics trata cada ejercicio como un nodo en un motor paramétrico.
- **La Semántica del Esfuerzo:** No permitimos que un entrenador escriba "Hazlo pesado". Forzamos el uso de **RIR (Repeticiones en Reserva)** o **RPE (Rate of Perceived Exertion)**. Esto permite que el algoritmo sepa exactamente qué tan cerca del fallo muscular estuvo el atleta.
- **Circuitos Complejos:** Nuestro esquema Pydantic soporta EMOMs, AMRAPs, Giant Sets, y Drop-Sets con bloqueos asimétricos. Preservamos la verdadera complejidad del mundo físico.

## 2. Prevención de Lesiones (Ratio ACWR)
- **Acute:Chronic Workload Ratio:** El sistema calcula automáticamente el volumen de la semana actual (Carga Aguda) dividido por el volumen promedio de las últimas 4 semanas (Carga Crónica).
- **Zonas de Riesgo:**
  - *Sweet Spot:* 0.8 a 1.3 (Riesgo bajo, adaptación óptima).
  - *Danger Zone:* > 1.5. Si la rutina empuja al atleta a esta zona, la interfaz lanza una alerta visual (Warning) al entrenador para que module el volumen.

## 3. Autorregulación Dinámica y Workout Swaps
- El cuerpo humano no es estático. Si un atleta reporta "dolor articular" o fatiga extrema (SNC frito) en el check-in diario, el sistema no lo obliga a hacer Peso Muerto Pesado.
- El algoritmo propone un **Workout Swap**: Cambia automáticamente el ejercicio pesado por uno de menor impacto axial (Ej. Peso Muerto -> Curl Femoral en máquina), manteniendo el grupo muscular objetivo pero reduciendo el daño articular.

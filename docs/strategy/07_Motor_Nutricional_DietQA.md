# El Motor Nutricional DietQA (Algoritmos Clínicos)

> [!NOTE]
> **Estado:** Documento Vivo (Iterativo). Arquitectura lógica del motor de IA nutricional.

## 1. Asimetría Nutricional Paramétrica
Alpha Dynamics rechaza las dietas planas. El cuerpo no gasta lo mismo un martes de Sentadillas que un domingo de descanso.
- **Cálculo Base:** Tasa Metabólica Basal (TMB) calculada estrictamente mediante Mifflin-St Jeor, con multiplicadores de actividad dinámica.
- **Ciclado Asimétrico:** El algoritmo inyecta Superávit/Mantenimiento en días de entrenamiento pesado, y fuerza un Déficit calórico moderado en días de descanso. 

## 2. Escudos Clínicos (Firewalls de Responsabilidad Médica)
La IA Nutricional opera bajo "Modos de Seguridad" estrictos para evitar iatrogenia (daño al paciente):
- **Protocolo Low-FODMAP:** Si el paciente reporta inflamación gastrointestinal crónica, el LLM tiene absolutamente prohibido sugerir oligosacáridos fermentables (ajo, cebolla, trigo). 
- **Modo Seguridad GLP-1:** Para pacientes bajo tratamiento con análogos de GLP-1 (Ozempic/Wegovy). El riesgo principal es la pérdida de masa magra (sarcopenia). El sistema bloquea ayunos agresivos y fuerza la ingesta de un target hiperproteico irrenunciable.

## 3. Sustituciones con Motor de Grafos
El fracaso de la dieta moderna es la falta de adherencia (Monotonía).
- Si el usuario rechaza el "Pollo con Arroz", la IA (DietQA) consulta el grafo de equivalencias para proponer una sustitución (Ej. Pavo o Lentejas).
- **Regla Estricta:** La sustitución debe coincidir con el target de Macronutrientes con un margen de error del 5%, y no puede violar los Escudos Clínicos activos (Ej. no sugerir Lentejas si Low-FODMAP está activado).

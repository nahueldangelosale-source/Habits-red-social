# Fase 36: Cierre Definitivo del Funnel B2C Clínico

El objetivo de esta fase es sellar la "cubeta perforada" en la adquisición B2C. Actualmente, la captura de datos en el frontend es sofisticada, pero la persistencia en el backend carece de una tipificación estricta a nivel de perfil clínico y de integraciones asíncronas sólidas con los motores de IA (DietQA).

## User Review Required

> [!IMPORTANT]
> **Esquema de Base de Datos para el Perfil Clínico**
> Actualmente, en `app.db.models.Client`, estamos utilizando la columna `extra_data` (JSONB) para almacenar los biomarcadores clínicos (peso, edad, waist_cm, archetype, gut_health, clinical_hard_stops, etc.). 
> **Decisión Arquitectónica:** En lugar de crear una nueva tabla relacional estricta de base de datos (Ej: `clinical_profiles`) que añadiría complejidad de joins y migraciones, propongo **mantener el uso de JSONB para flexibilidad pero blindarlo con Pydantic en la capa API**. Esto asegura que a pesar de que el almacenamiento sea JSONB, ningún dato "sucio" logrará pasar la barrera del endpoint `POST /api/v1/patients/clinical`.
> *¿Estás de acuerdo con este enfoque o prefieres una tabla SQL 1:1 `ClientClinicalProfile` para máxima rigidez DDL?*

## Open Questions

> [!WARNING]
> **Desacoplamiento de IA: Event-Driven vs Celery Task**
> Para activar DietQA de forma asíncrona, ¿prefieres que el worker escuche un evento de Pub/Sub en Redis (`patient_onboarded`) que ya se está emitiendo en `patients.py`, o inyectamos una tarea directa a Celery (`dietqa_worker.delay(client.id)`) para mayor trazabilidad de los retries?

## Proposed Changes

### Backend: Validación Estricta (Data Gravity)

#### [MODIFY] `backend/app/api/patients.py`
- Extraer el `PatientClinicalRegister` inline hacia el módulo centralizado de esquemas.
- Actualizar el endpoint `POST /api/v1/patients/clinical` para utilizar el nuevo esquema robusto.
- Reemplazar el comentario `# dispatch to celery` con la llamada real al despachador asíncrono elegido (Celery o Pub/Sub Redis) que despertará el motor DietQA sin bloquear al usuario en el frontend.

#### [NEW] `backend/app/schemas/clinical.py`
- Mover y potenciar el modelo de validación:
  - Validaciones de dominio Pydantic: `EmailStr` para email, `Field(ge=15, le=100)` para edad, validaciones de los enums válidos para `archetype`, `activity_level` y `gut_health`.

### Frontend: Persistencia en Primer Contacto

#### [MODIFY] `frontend/src/pages/b2c/onboarding-clinico.tsx` (y sus vistas homólogas)
- Conectar el botón de "Finalizar/Ver Resultados" con el endpoint `POST /api/v1/patients/clinical`.
- Eliminar dependencias crudas del `localStorage` como única fuente de verdad y despachar la persistencia real.
- Manejar la UI optimista: Devolver de inmediato el renderizado del perfil clínico al paciente asumiendo el HTTP 201 exitoso, mientras el backend procesa asíncronamente con la IA.

## Verification Plan

### Automated Tests
- Validar mediante Pytest que payloads sin un campo requerido (ej. edad o peso con valores negativos) sean rechazados con HTTP 422 antes de tocar el modelo `Client` en base de datos.
- Validar que el HTTP 201 devuelva exitosamente dentro de los 50ms, confirmando que la llamada a la IA ha sido delegada a Background Tasks / Celery y no es síncrona.

### Manual Verification
- Ingresar al flujo de UI frontend `/b2c/onboarding-clinico`, completar el flujo.
- Confirmar vía PgAdmin / DBeaver que los datos han quedado persistidos correctamente en la tabla `clients` bajo la columna `extra_data` con la estructura correcta.
- Verificar logs del Worker para ver que DietQA recibió el payload asíncronamente.

## Integración: Auditoría Operativa (Junio 2026) y Roadmap B2B2C Estratégico

A partir de los hallazgos documentados en la **[Auditoría Operativa de Agosto 2026](file:///d:/Musica%20Descargada/Bienestar%20APP/docs/auditoria/auditoria_operativa_agosto_2026.md)** y el **[Roadmap B2B2C Estratégico](file:///d:/Musica%20Descargada/Bienestar%20APP/docs/roadmap/roadmap_b2b2c_estrategico.md)** (y habiendo completado la **Fase 35** con éxito comprobando el modelo de *cero consumo de texto libre LLM* mediante Action Cards y motor heurístico), se incorpora el siguiente vector de mitigación crítico para el embudo clínico:

> [!WARNING]
> **Zero-AI Data Capture (Extensión del Modelo Fase 35 al Onboarding Clínico)**
> Depender de la IA para interpretar texto libre del usuario durante la fase de captura introduce riesgos de latencia, coste (OpEx), alucinaciones y fuga de datos clínicos. La IA no debe ser la primera línea de recolección de datos.

### Modificaciones Estratégicas al Plan

1. **Captura Determinista y Limitación de Texto Libre:**
   - **Frontend:** Siguiendo la filosofía implementada en la Fase 35, todos los componentes de recolección clínica y B2C (ej. síntomas, arquetipos, intensidades RPE) en `/b2c/onboarding-clinico` deben obligar al usuario a usar botones, sliders y selectores cerrados con diseño determinista. Se eliminará radicalmente el uso de inputs de texto libre o `<textarea>`.
   - **Backend:** Las validaciones Pydantic (`schemas/clinical.py`) deben blindarse exclusivamente contra `Enums` estrictos, alineándose con el *Motor Asíncrono Heurístico*, para evitar inyección de texto arbitrario que requiera sanitización con IA.

2. **Posicionamiento de la IA (DietQA / Cognitive Engine):**
   - La IA se activará de forma asíncrona (como está propuesto en Celery/Redis) **únicamente** para consumir la matriz estructurada JSONB resultante. Su función será la deducción de metadatos avanzados, cruce de variables (ej. "RPE alto + dormir poco = Alerta de Sobreentrenamiento") y generación de borradores empáticos, pero no el parsing de entradas sucias del usuario.

3. **Estrategia Futura (Proyección): "Shadow AI"**
   - En lugar de pedirle al usuario que escriba texto para analizar su estado, la evolución del **Roadmap B2B2C** proyecta el uso de IA pasiva. La IA analizará patrones de comportamiento en la UI (latencia al hacer clic, dudas al seleccionar un RPE, velocidad de swipe en pantallas clínicas) para inferir resistencia o fatiga psicológica, actuando como un "Shadow Observer" determinista, sin generar fricción conversacional ni pedir texto.

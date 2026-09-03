# 📂 Relevamientos de Módulos — Bienestar APP

> Documentación funcional detallada de cada módulo del sistema.  
> Estos documentos capturan el **estado funcional real** de cada feature, no el deseado.

---

## Índice de Relevamientos

| # | Módulo | Archivo | Cobertura |
|---|--------|---------|-----------|
| 1 | Programación de Entrenamiento | [relevamiento_modulo1_programacion.md](./relevamiento_modulo1_programacion.md) | PlanBuilderCockpit, días, bloques, ejercicios |
| 2 | Calendario de Entrenamiento | [relevamiento_modulo2_calendario2222.md](./relevamiento_modulo2_calendario2222.md) | TrainingCalendar, scheduling, vistas |
| 3 | Hábitos y Conductual | [relevamiento_modulo3_habitos.md](./relevamiento_modulo3_habitos.md) | useHabitStore, 22 hábitos, Lally, streaks, MindsetSanctuary |
| 4 | Biblioteca de Ejercicios | [relevamiento_modulo_biblioteca_ejercicios2.md](./relevamiento_modulo_biblioteca_ejercicios2.md) | EXERCISES_DATABASE, taxonomía, filtros |
| 5 | Sesiones de Entrenamiento | [relevamiento_modulo_sesiones_entrenamiento.md](./relevamiento_modulo_sesiones_entrenamiento.md) | Ejecución de sesión, tracking en vivo |
| 6 | Onboarding y Anamnesis | [relevamiento_onboarding_anamnesis.md](./relevamiento_onboarding_anamnesis.md) | Wizards B2B/B2C, intake forms |
| 7 | Viaje del Entrenador | [relevamiento_viaje_entrenador.md](./relevamiento_viaje_entrenador.md) | Dashboard, triage, workflow completo |
| 8 | Módulo de Nutrición Clínica | [leandro catilli modulo nutricion.md](./leandro%20catilli%20modulo%20nutricion.md) | Motor NaaS, fases, firewalls clínicos |
| 9 | **Experiencia del Atleta (B2C)** | [relevamiento_experiencia_atleta_b2c.md](./relevamiento_experiencia_atleta_b2c.md) | **39 componentes, 9 stores, 17 rutas, Magic Link, PWA, gamificación** |
| 10 | **Gamificación** | [relevamiento_modulo_gamificacion.md](./relevamiento_modulo_gamificacion.md) | **12 componentes, 3 motores (Squad, Tokenomics, XP), economía ET/CG/CC** |
| 11 | **Validaciones y Video Feedback** | [relevamiento_modulo_validaciones_video.md](./relevamiento_modulo_validaciones_video.md) | **8 componentes, Canvas 2D, HLS, voice-over, firma digital, feedback express** |
| 13 | **API Layer y Autenticación** | [relevamiento_api_layer.md](./relevamiento_api_layer.md) | **14 módulos API, interceptor, Stale-While-Revalidate, SSE/WS** |
| 14 | **Telemetría y ACWR** | [relevamiento_telemetria_acwr.md](./relevamiento_telemetria_acwr.md) | **OpenTelemetry, Guardrail ACWR > 1.50, Airbag Cognitivo** |

---

## Relevamientos Pendientes

¡Todos los módulos han sido relevados exitosamente! (14/14)

---

## Cómo Hacer un Relevamiento

1. **Abrir el módulo** en el browser y recorrer todos los flujos
2. **Leer el código fuente** del componente principal y sus stores
3. **Documentar**: qué hace, qué inputs recibe, qué outputs genera, qué gaps tiene
4. **Formato**: Usar este template:

```markdown
# Relevamiento: [Nombre del Módulo]

## Componentes Principales
- Lista de archivos .tsx y stores involucrados

## Flujo de Usuario
- Paso a paso del happy path

## Modelo de Datos
- Interfaces TypeScript relevantes

## Integraciones
- APIs que consume, stores que lee/escribe

## Gaps Identificados
- Qué falta, qué está roto, qué es confuso

## Screenshots / Videos
- Capturas del estado actual
```

---

*Última actualización: Julio 2026*

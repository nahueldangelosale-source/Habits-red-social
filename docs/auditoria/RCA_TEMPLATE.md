# 🩺 Blameless Postmortem (RCA Template)

> *"Todo falla, todo el tiempo. No preguntamos quién rompió el sistema, sino qué en nuestra arquitectura permitió que el fallo llegara a producción."*

**Incidente:** [Nombre descriptivo del incidente, ej. "Caída del Motor CRI por Timeout en Base de Datos"]
**Fecha del Incidente:** [YYYY-MM-DD]
**Autores del RCA:** [Nombres]
**Estado:** [Borrador / En Revisión / Cerrado]

---

### 1. Contexto y Cronología (Timeline)
*Mapeo exacto de los eventos desde que se introdujo el fallo hasta que se resolvió.*
- **[HH:MM]** - Despliegue de la PR #123 a Producción.
- **[HH:MM]** - Alerta HIGH disparada en Sentry/GCP (Slack `#alerts-high-prod`).
- **[HH:MM]** - Mitigación aplicada (Rollback / Hotfix).

### 2. Impacto al Usuario y Negocio (Blast Radius)
*Métricas frías y objetivas. ¿Se vulneró algún SLO?*
- **Servicios Afectados:** (ej. FastAPI Backend, PostgreSQL Bóveda).
- **Métrica Impactada:** (ej. Tasa de éxito del endpoint `/generate-plan` cayó al 85%, SLO vulnerado).
- **Duración del Impacto:** [Minutos/Horas totales de degradación].

### 3. Causa Raíz (Root Cause - Los 5 Porqués)
*Profundizar hasta llegar a la deficiencia arquitectónica o de procesos. Jamás nombrar a un individuo.*
- **Por qué 1:** El endpoint devolvió 500.
- **Por qué 2:** Porque el Event Loop de FastAPI se bloqueó esperando a PostgreSQL.
- **Por qué 3:** Porque se lanzó un Query sin índice en la tabla `audit_logs`.
- **Causa Raíz:** No hay un *linting* o test de migración en la CI/CD que fuerce la validación de índices (EXPLAIN ANALYZE) antes de un merge a la rama principal.

### 4. Resolución y Mitigación Inmediata
*¿Cómo detuvimos la hemorragia?*
- Ejecución de Rollback mediante GitHub Actions al commit `abc1234`.
- Recuperación del *Success Rate* al 99.9% a las [HH:MM].

### 5. Action Items (Prevención Sistémica)
*Tareas asignables al Backlog para garantizar que este fallo exacto sea arquitectónicamente imposible de repetir.*
- [ ] **Acción:** Integrar `squawk` o linter de PostgreSQL en GitHub Actions para detectar queries sin índice. (Owner: [Nombre])
- [ ] **Acción:** Ajustar Timeout del Middleware de FastAPI a 3 segundos para evitar bloqueo en cascada. (Owner: [Nombre])

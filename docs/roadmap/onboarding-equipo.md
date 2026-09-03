# 🚀 Onboarding de Equipo — Bienestar APP

> Guía para incorporar nuevos desarrolladores, diseñadores y profesionales al proyecto.  
> Última actualización: Julio 2026

---

## Bienvenido/a al Equipo

Bienestar APP es una plataforma SaaS de prescripción deportiva y nutricional que opera en modelo **B2B2C** (Gyms/Entrenadores → Atletas).

---

## Lectura Obligatoria (Primeros 2 Días)

### Día 1 — Contexto y Arquitectura

| Orden | Documento | Tiempo | Qué vas a entender |
|-------|-----------|--------|---------------------|
| 1 | [README.md](../README.md) | 10 min | Estructura del proyecto y convenciones |
| 2 | [arquetipos-ciclos-y-correlacion.md](../arquitectura/arquetipos-ciclos-y-correlacion.md) | 30 min | Los 9 arquetipos, 18 ciclos de entrenamiento, 20 fases nutricionales |
| 3 | [estado-actual-sistema.md](../auditoria/estado-actual-sistema.md) | 20 min | Qué está implementado y qué falta |
| 4 | [gaps-criticos.md](../auditoria/gaps-criticos.md) | 15 min | Los 17 gaps priorizados |

### Día 2 — Roadmap y Código

| Orden | Documento | Tiempo | Qué vas a entender |
|-------|-----------|--------|---------------------|
| 5 | [roadmap-general.md](../roadmap/roadmap-general.md) | 20 min | Plan a 12 meses, sprints, hitos |
| 6 | [plan-migraciones-db.md](../roadmap/migraciones/plan-migraciones-db.md) | 20 min | Esquema de DB actual y migraciones planificadas |
| 7 | [temas-de-investigacion.md](../investigacion/temas-de-investigacion.md) | 30 min | Los 42 temas de R&D pendientes |
| 8 | Relevamientos del módulo que te asignen | Variable | Detalle funcional de tu área |

---

## Stack Tecnológico

### Frontend (`/web`)
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19 | UI framework |
| Vite | 6.x | Build tool & dev server |
| TypeScript | 5.x | Tipado estático |
| Zustand + Immer | 5.x | State management (stores persistidos en localStorage) |
| TanStack Query | 5.x | Server state & cache |
| Framer Motion | 11.x | Animaciones |
| Tailwind CSS | 3.x | Estilos utilitarios |
| Zod | 3.x | Validación de schemas (contratos API) |
| Lucide React | - | Iconografía |
| dnd-kit | 6.x | Drag and drop |

### Backend (`/backend`)
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Python | 3.11+ | Runtime |
| FastAPI | 0.115+ | Framework HTTP |
| PostgreSQL | 15+ | Base de datos relacional |
| Alembic | 1.13+ | Migraciones de DB |
| SQLAlchemy | 2.x | ORM |
| Pydantic v2 | 2.x | Validación de modelos |
| JWT + Refresh Tokens | - | Autenticación |

### Infraestructura
| Servicio | Uso |
|---------|-----|
| Docker Compose | Orquestación local (DB + backend + otel-collector) |
| OpenTelemetry | Trazas distribuidas |
| GitHub Actions | CI/CD |

---

## Stores Principales (Zustand)

Estos son los stores que vas a tocar más seguido. Todos usan Zustand + Immer + Persist:

| Store | Archivo | Responsabilidad |
|-------|---------|----------------|
| `usePlanBuilderStore` | `stores/usePlanBuilderStore.ts` | Estado central del builder de entrenamiento: días, ejercicios, bloques, fases, nutrición vinculada |
| `useNaaSCanvasStore` | `stores/useNaaSCanvasStore.ts` | Estado del builder de nutrición: comidas, opciones, items SARA 2, fases nutricionales |
| `useTemplateLibraryStore` | `stores/useTemplateLibraryStore.ts` | Biblioteca de plantillas: carpetas, templates, fork, versionado |
| `useOnboardingPTStore` | `stores/useOnboardingPTStore.ts` | Wizard de onboarding B2B (PT): biometría, training, health history, injuries |
| `useOnboardingStore` | `stores/useOnboardingStore.ts` | Wizard de onboarding B2C: biometría, arquetipos, hard stops |
| `useGamificationStore` | `stores/useGamificationStore.ts` | Gamificación: squads, challenges, streaks, HVI |

---

## Archivos de Configuración Clave

| Archivo | Qué define |
|---------|-----------|
| `web/src/data/modalityColors.ts` | **PERIOD_PALETTE** — Los 18 tipos de ciclo de entrenamiento con colores, métricas y campos |
| `web/src/data/nutritionPhasesConfig.ts` | **NUTRITION_PERIOD_PALETTE** — Los 20 módulos de fases nutricionales |
| `web/src/schemas/nutritionPlanSchema.ts` | Contratos Zod para MealBlock, MealItem, MealOption, NutritionPlanCreateSchema |
| `web/src/schemas/traitsSchema.ts` | Schema de traits del atleta (Medical Blockers, Systemic States, Preferences) |

---

## Cómo Levantar el Entorno

```bash
# 1. Frontend
cd web
npm install
npm run dev   # → http://localhost:5173

# 2. Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Docker (DB + Telemetry)
docker-compose up -d
```

> [!TIP]
> En modo desarrollo, el frontend inyecta automáticamente `demo_b2b_token_123` como JWT cuando corre en `localhost`. No necesitás configurar auth para desarrollo local.

---

## Convenciones de Código

| Regla | Detalle |
|-------|---------|
| **Componentes** | PascalCase, un componente por archivo, `.tsx` |
| **Stores** | Prefijo `use`, sufijo `Store`. Ej: `usePlanBuilderStore` |
| **APIs** | Un archivo por dominio en `api/`. Funciones con prefijo del verbo HTTP implícito |
| **Schemas** | Zod schemas junto al dominio. Validar en frontend ANTES de enviar al backend |
| **Commits** | Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:` |
| **Branches** | `feature/GAP-XXX-descripcion`, `fix/issue-descripcion` |
| **Docs** | kebab-case, español, markdown con Mermaid |

---

## ¿Con Quién Hablo?

| Rol | Área | Contacto |
|-----|------|----------|
| Product Owner | Prioridades, features, arquetipos | Nahuel |
| Frontend Lead | React, Zustand, componentes | — |
| Backend Lead | FastAPI, DB, migraciones | — |
| Nutrición Clínica | Fases, firewalls, protocolos | Leandro Catilli |
| Entrenamiento | Periodización, biomecánica, ACWR | — |

---

*Última actualización: Julio 2026*

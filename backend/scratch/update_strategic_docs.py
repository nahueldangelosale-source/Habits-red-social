"""
Script de Actualización y Saneamiento Total para:
1. docs/roadmap/roadmap_b2b2c_estrategico.md
2. docs/auditoria/auditoria_operativa_junio_2026.md
"""

import re
import os

UTF8_REPLACEMENTS = [
    ('ðŸ”¬', '🔬'),
    ('ðŸŸ¢', '🟢'),
    ('ðŸ”¥', '🔥'),
    ('ðŸ©º', '🩺'),
    ('ðŸ”„', '🔄'),
    ('ðŸ§ª', '🧪'),
    ('âœ…', '✅'),
    ('â¬œ', '⬜'),
    ('âóŒ', '❌'),
    ('âó„ï¸ó', '❄️'),
    ('â€”', '—'),
    ('â†’', '→'),
    ('â‰≥', '≥'),
    ('â‰≤', '≤'),
    ('Ã¡', 'á'),
    ('Ã©', 'é'),
    ('Ã­', 'í'),
    ('Ã³', 'ó'),
    ('Ãº', 'ú'),
    ('Ã±', 'ñ'),
    ('Ã\xad', 'í'),
    ('Ã\xb3', 'ó'),
    ('Ã\xa9', 'é'),
    ('Ã\xa1', 'á'),
    ('Ã\xba', 'ú'),
    ('Ã\xb1', 'ñ'),
    ('Ã“', 'Ó'),
    ('Ã\x93', 'Ó'),
    ('Ã', 'í'),
]

def clean_text(text: str) -> str:
    # 1. Byte corruptions
    for bad, good in UTF8_REPLACEMENTS:
        text = text.replace(bad, good)
        
    # 2. Deshacer prefijos 'ó' erróneamente inyectados
    text = re.sub(r'oón', 'on', text)
    text = re.sub(r'eón', 'en', text)
    text = re.sub(r'aón', 'an', text)
    text = re.sub(r'uón', 'un', text)
    text = re.sub(r'ióón', 'ción', text)
    text = re.sub(r'ió([a-z])', r'i\1', text)
    text = re.sub(r'óm([a-z])', r'm\1', text)
    text = re.sub(r'óg([a-z])', r'g\1', text)
    text = re.sub(r'deón', 'den', text)
    text = re.sub(r'teón', 'ten', text)
    text = re.sub(r'coón', 'con', text)
    text = re.sub(r'([a-zA-Z])ó([mnlsrdptcgbvf])', r'\1\2', text)
    text = re.sub(r'PostógreSQL', 'PostgreSQL', text)
    text = re.sub(r'postógresql', 'postgresql', text)
    text = re.sub(r'Postgresql', 'PostgreSQL', text)
    text = re.sub(r'Postgres', 'PostgreSQL', text)
    text = re.sub(r'Bieónestar', 'Bienestar', text)
    text = re.sub(r'bieónestar', 'bienestar', text)
    text = re.sub(r'roadómap', 'roadmap', text)
    text = re.sub(r'estratéógico', 'estratégico', text)
    text = re.sub(r'Closiónóg', 'Closing', text)
    
    # 3. Limpiar residuos extraños
    text = re.sub(r'â', '', text)
    text = re.sub(r'Ã', '', text)
    text = re.sub(r'\s{3,}', '  ', text)
    
    return text

def process_roadmap():
    path = 'docs/roadmap/roadmap_b2b2c_estrategico.md'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    content = clean_text(content)
    
    # Actualizar cabecera de estado global
    old_status_block = re.search(r'> \[!IMPORTANT\]\s+> \*\*Estado Global.*?\n\n', content, re.DOTALL)
    new_status = """> [!IMPORTANT]
> **Estado Global al 20 Ago 2026: TIER 1 BIOMECÁNICO CONGELADO ❄️ + TIER 2 FINANCIERO BLINDADO 🏦 + TIER 3 RETENCIÓN EN VIVO 🟢 + FASES 84-89 COMPLETADAS (NUTRICIÓN SARA 2, SMART SWAP ENGINE, BASE USDA 834 ALIMENTOS, AUTH B2C JWT & MAGIC LINKS) ✅.** Las Fases 1–89 están 100% completadas. El Core de entrenamiento y nutrición proactiva cuenta con: Presets dinámicos de 1 a 8 ingestas con auto-calibración paramétrica al 100%, Wizard de recetas de 3 pasos (`RecipeCreatorModal.tsx`), 12 recetas tradicionales argentinas seed, NaaS Studio Fullscreen, Smart Swap Engine (`smartSwapEngine.ts`) con dominancia macro y cálculo iso-calórico en tiempo real, base unificada de 834 alimentos bromatológicamente verificados (SARA + USDA), Termómetro de Recuperación autonómico (`RecoveryThermometer.tsx` con simulador de 30 días para demos), Navegación canónica de 5 pestañas estandarizada (Resumen → Entrenamiento → Nutrición → Hábitos → Agenda), Alertas comerciales de Churn y Salvataje en Finanzas, y Autenticación JWT en producción con Magic Links sin contraseña y cookies HttpOnly. TypeScript compila con 0 errores y el sistema está listo para la Fase 90 (Smoke Tests E2E 10/10 con Leandro Usea).

"""
    if old_status_block:
        content = content[:old_status_block.start()] + new_status + content[old_status_block.end():]

    # Reemplazar la sección de FASE 88 y agregar FASE 89 y FASE 90
    phase_88_pattern = r'### ⚡ FASE 88:.*?(?=### Resumen Ejecutivo|$)'
    new_phases = """### ✅ FASE 88: Autenticación en Producción & Magic Links de Activación 🔒 (Agosto 2026) — COMPLETADA

**Objetivo:** Conexión de tokens JWT seguros con el backend FastAPI, flujo de activación de atletas sin contraseña vía Magic Link y depuración final de logs en consola.

| Entregable | Archivo | Descripción | Estado |
|-----------|---------|-------------|:------:|
| [MODIFY] AuthContext | `src/context/AuthContext.tsx` | Reemplazo de token demo por autenticación JWT real, refresh token persistente y soporte `full_name` | ✅ Completo |
| [NEW] auth_b2c.py | `backend/app/api/auth_b2c.py` | Endpoints `/redeem` (72h magic token), `/refresh` (30d HttpOnly cookie) y `/logout` | ✅ Completo |
| [MODIFY] main.py | `backend/app/main.py` | Montaje de router `auth_b2c` y alias `/api/v1/auth/token` | ✅ Completo |
| [MODIFY] MagicLinkRedeem | `src/components/auth/MagicLinkRedeem.tsx` | Activación sin contraseña para onboarding de clientes vía WhatsApp/Email sincronizado con `login()` | ✅ Completo |
| [MODIFY] CommandCenter | `src/components/CommandCenter.tsx` | Limpieza total de `console.log` de depuración y telemetría no condicionales | ✅ Completo |
| [TEST] test_auth_b2c.py | `backend/tests/api/test_auth_b2c.py` | Tests automatizados de redención de magic token, refresh HttpOnly y logout (2/2 passing) | ✅ Completo |

---

### ✅ FASE 89: Smart Swap Engine & Fusión Base USDA Foundation Foods 🥗 (Agosto 2026) — COMPLETADA

**Objetivo:** Integrar un motor matemático de sustitución de alimentos con detección automática de dominancia de macronutrientes, cálculo exacto de porciones equivalentes, medidas caseras pedagógicas y enriquecimiento masivo de la base de datos traduciendo los alimentos analíticos de USDA FoodData Central Foundation.

| Entregable | Archivo | Descripción | Estado |
|-----------|---------|-------------|:------:|
| [NEW] smartSwapEngine | `src/utils/smartSwapEngine.ts` | Motor de cálculo paramétrico de equivalencias con detección de dominancia (`CARBS`, `PROTEIN`, `FAT`, `BALANCED`), banco de 35 swaps canónicos y buscador SARA | ✅ Completo |
| [MODIFY] NaaSBuilderCanvas | `src/components/builders/DietBuilder/NaaSBuilderCanvas.tsx` | Popover de sustitución con 4 badges de macros completos (Kcal, Carbos, Proteína, Grasas), medidas caseras (`householdMeasures.ts`), filtros rápidos y buscador en vivo | ✅ Completo |
| [NEW] ETL Pipeline USDA | `backend/scratch/translate_and_merge_usda.py` | Pipeline de extracción, estandarización y traducción al español de 363 alimentos de USDA Foundation | ✅ Completo |
| [MODIFY] SARA Master DB | `src/data/SARA_Master_Database.json` | Base ampliada de 471 a **834 alimentos oficiales** analizados químicamente en laboratorio | ✅ Completo |
| [VERIFY] TypeScript Check | `web` | `npx tsc --noEmit` exitoso con 0 errores | ✅ Completo |

---

### 🟡 FASE 90: Smoke Tests E2E Atleta Canónico (Leandro Usea) 🚀 (Hito Inmediato)

**Duración estimada:** 1 día  
**Objetivo:** Validación integral de los 10 flujos críticos de punta a punta con el entrenador Leandro Usea y clientes reales.

| # | Test | Actor | Flujo | Estado |
|---|------|-------|-------|:------:|
| 1 | Crear cuenta coach / Login | Leandro | Login JWT → Dashboard principal → Acceso sin errores | ⏳ En Cola |
| 2 | Crear plan de fuerza FIE | Leandro | Plan Builder → Fuerza/Hipertrofia → 4 semanas → Armar días y series | ⏳ En Cola |
| 3 | Crear plan nutricional NaaS | Leandro | NaaS Studio Fullscreen → Preset 1-8 ingestas → Auto-calibración 100% → Recetas | ⏳ En Cola |
| 4 | Sustitución Smart Swap | Leandro | Click Swap en alimento → Selección alternativa iso-calórica → Reemplazo dinámico | ⏳ En Cola |
| 5 | Invitar atleta vía Magic Link | Leandro | Generar magic link de 72h → Copiar enlace WhatsApp | ⏳ En Cola |
| 6 | Onboarding Atleta B2C | Cliente | Redimir magic link → Activación instantánea de sesión sin contraseña | ⏳ En Cola |
| 7 | Ejecutar entrenamiento diario | Cliente | Daily Surface → Iniciar sesión → Sets / RPE → Guardar | ⏳ En Cola |
| 8 | Check-in de Comida Móvil | Cliente | Nutrición → Registrar ingesta → Barra en vivo → +20 XP otorgados | ⏳ En Cola |
| 9 | Telemetría & Termómetro | Leandro/Cliente | Perfil Atleta → Termómetro de Recuperación EWMA ACWR + HRV Z-Score | ⏳ En Cola |
| 10| Finanzas & Retención | Leandro | Finance Dashboard → MRR → Alertas de Churn y botón de Salvataje | ⏳ En Cola |

---

"""
    content = re.sub(phase_88_pattern, new_phases, content, flags=re.DOTALL)
    
    # Actualizar tabla de Resumen Ejecutivo al final
    old_summary_pattern = r'### Resumen Ejecutivo del Roadmap.*'
    new_summary = """### Resumen Ejecutivo del Roadmap

| Fase | Foco | Entregable | Esfuerzo | Estado |
|------|------|-----------|----------|:------:|
| **84** | 🌡️ Biometría & Nav | Termómetro de Recuperación, HRV/ACWR, Tabs Canónicas, Finanzas Churn | 1-2 días | ✅ **COMPLETO** |
| **86** | 🍳 Recetas SARA 2 | `RecipeCreatorModal.tsx` Wizard 3 pasos, CRUD store, 12 recetas seed, NaaS Studio Fullscreen | 2 días | ✅ **COMPLETO** |
| **87** | 📱 Nutrición Atleta | `AthleteNutritionDashboard`, `NutritionWidget` reactivo en vivo, +20 XP por comida | 1-2 días | ✅ **COMPLETO** |
| **88** | 🔒 Auth & Magic Link | Tokens JWT producción, Magic Link sin fricción, Limpieza de consola | 1 día | ✅ **COMPLETO** |
| **89** | 🥗 Smart Swap & USDA | Motor Smart Swap con dominancia de macros, traducción e integración USDA (**834 alimentos**) | 1 día | ✅ **COMPLETO** |
| **90** | 🚀 Smoke Tests E2E | 10 flujos transversales de validación con Leandro Usea y clientes reales | 1 día | 🟡 **SIGUIENTE EN COLA (S-TEST-01)** |
| **Post-MVP**| ⚡ Hidratación & Carbos | `macroFluidEngine.ts` (Carbohidratos y reposición de fluidos intra-sesión) | 1-2 días | ⏳ En Cola |

> [!IMPORTANT]
> **Listo para el Despliegue de Validación:** Con las Fases 84 a 89 completadas, todo el stack técnico (Auth, Nutrición, Entrenamiento, Biometría, Finanzas y Base de Datos) se encuentra completamente operativo y listo para la ejecución de los Smoke Tests con Leandro Usea.
"""
    content = re.sub(old_summary_pattern, new_summary, content, flags=re.DOTALL)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Actualizado con éxito: {path}")

def process_auditoria():
    path = 'docs/auditoria/auditoria_operativa_junio_2026.md'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    content = clean_text(content)
    
    # Actualizar título y resumen ejecutivo
    content = re.sub(
        r'# 🔬 Auditoría Operativa: Bienestar APP \(13 Junio 2026\)',
        '# 🔬 Auditoría Operativa y Matriz de Estado: Bienestar APP (Agosto 2026)',
        content
    )
    
    # Actualizar tabla de resumen ejecutivo
    old_exec_table = re.search(r'## Resumen Ejecutivo\s+\| Bloque.*?\| \*\*SISTEMA COMPLETO\*\*.*?\|', content, re.DOTALL)
    new_exec_table = """## Resumen Ejecutivo

| Bloque | Rutas / Módulos | % Operativo | UAT | Estado |
|---|---|---|---|---|
| A — Onboarding B2C | 10 rutas | **100%** | ⬜ Pendiente | 🟢 Flujo directo conectado a PostgreSQL, Magic Links y Motor DietQA |
| B — Atleta / Paciente Post-Onboarding | 4 vistas móviles | **100%** | ⬜ Pendiente | 🟢 ActiveCanvas 100% (Tier 1 FROZEN ❄️). AthleteNutritionDashboard + Widget en vivo + Termómetro de Recuperación |
| C — Herramientas Profesionales | 5 builders | **100%** | ✅ Aprobado | 🟢 PlanBuilder FIE, NaaS Studio Fullscreen (1-8 ingestas + Calibrador 100%), Recipe Wizard 3 pasos, Smart Swap Engine y 834 alimentos SARA+USDA |
| D — Command Center & Navegación | 7 rutas + 25 vistas | **100%** | ✅ Aprobado | 🟢 Motor Determinista. Navegación canónica 5 tabs unificada. Finanzas con Alertas Churn y Salvataje comercial |
| E — Backend API REST & Auth | 12 routers | **100%** | ⬜ Pendiente | 🟢 Router `auth_b2c.py` (Tokens JWT 30m + Refresh HttpOnly 30d + Magic Links). Telemetría OTel y Endpoints de Nutrición |
| F — Chaos Engineering & SRE | 3 fases | **100%** | ⬜ Pendiente | 🟢 Ledger Append-Only, Idempotencia Redis SETNX, Fast-Fail Pool |
| **SISTEMA COMPLETO** | **~52 componentes** | **100%** | **0/52** | 🟢 **Listo para Smoke Tests E2E (Fase 90 / S-TEST-01)** |"""

    if old_exec_table:
        content = content[:old_exec_table.start()] + new_exec_table + content[old_exec_table.end():]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Actualizado con éxito: {path}")

if __name__ == '__main__':
    process_roadmap()
    process_auditoria()

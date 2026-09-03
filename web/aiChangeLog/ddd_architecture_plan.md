# OPERACIÓN BOUNDED CONTEXT: DESIGN FREEZE Y DDD

**Objetivo:** Detener temporalmente toda refactorización estética ("UI Freeze") y reestructurar el frontend para soportar una arquitectura multi-rol rígida aplicando Domain-Driven Design (DDD) y aislamientos FSD.

## 🏛️ ESTRATEGIA DE ARQUITECTURA

### 1. Patrón de Exención (Design Freeze)
La directiva central dicta que el aspecto actual de la aplicación es intocable.
- **Mecanismo:** Localizaremos los componentes UI y Dashboards clave del repositorio.
- **Acción Estricta:** Se inyectará un comentario pragma `// @archunit-ignore: UI Freeze - No modificar estilos` en la cabecera de los archivos afectados.
- **Consecuencia:** Los agentes de la IA y los desarrolladores tienen estrictamente prohibido alterar Tailwind CSS clases genéricas, colores hexadecimales, layouts o paddings en estos archivos. El código es de sólo lectura a nivel de presentación.

### 2. Topología de Bounded Contexts (FSD + DDD)
El directorio `src/domains/` adoptará la separación lógica y de negocio del Ecosistema Bienestar. Cada carpeta será un contenedor inexpugnable para un Modelo de Dominio.
- **`end_user/`**: Lógica de suscripciones B2C, métricas generales.
- **`athlete/`**: Atletas de alto rendimiento, crossfiters, rutinas personalizadas, resultados de WODs.
- **`coach/`**: Lógica de asignación de clientes, telemetría de PTs, ingresos por comisiones.
- **`nutritionist/`**: Dietas, asignación de macros, escáner de visión IA (Nutrium Killer).
- **`enterprise/`**: Panel de Gimnasios y dueños de Box (gestión de coaches, revenue tiering).

### 3. Contratos Formales (Public APIs)
Para que los Bounded Contexts funcionen sin corromper el modelo de datos, se usará el patrón FSD Public API:
- Cada módulo de dominio (ej. `src/domains/athlete/`) operará como una caja negra hacia el exterior.
- Contendrá un archivo estrictamente tipado `index.ts`.
- **Regla Inmutable:** Un dominio no puede importar directamente del sub-árbol de otro dominio. Para interactuar, deben utilizar las APIs y schemas que se exponen deliberadamente a través de los índices correspondientes. Por ejemplo, `coach` no puede mutar los esquemas internos de `athlete` de forma directa sin pasar por el contrato oficial.

---
*Fin del Blueprint Arquitectónico: Operación Bounded Context & Design Freeze.*

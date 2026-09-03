# Gobernanza Lean, Dual-Track Agile y Priorización WSJF

> [!NOTE]
> **Estado:** Documento Vivo (Iterativo). Las reglas estrictas sobre cómo el equipo de I+D decide qué construir.

## 1. Dual-Track Agile (El Freno a la Fábrica de Features)
Para evitar el "Build Trap" (construir cosas que nadie quiere), el trabajo se divide en dos pistas perpetuas:
- **Discovery Track:** Liderado por Producto/Diseño. Aquí se matan las malas ideas. Hacemos entrevistas, prototipos en Figma y *Dry-Runs* técnicos (como la evaluación de Gemini para Hexfit). El objetivo es refutar la hipótesis lo más barato posible.
- **Delivery Track:** Liderado por Ingeniería. Solo entran los items que sobrevivieron al Discovery. Aquí escribimos código escalable, asegurado por CI/CD.

## 2. WSJF (Weighted Shortest Job First)
Es el único idioma que entiende el Portfolio. Priorizamos dividiendo el Valor entre el Esfuerzo:
`WSJF = (Business Value + Time Criticality + RROE) / Job Size`
- **Business Value:** ¿Cuánto MRR nuevo genera o cuánto Churn evita?
- **Time Criticality:** ¿Perdemos una ventana de mercado si nos atrasamos?
- **RROE (Reducción de Riesgo y Habilitación):** Refactorizaciones arquitectónicas o de seguridad que evitan catástrofes futuras (Ej. Migración del esquema a Pydantic V2).
- **Job Size:** ¿Cuántos puntos de esfuerzo requiere?
*Si el WSJF es bajo, la tarea se descarta permanentemente.*

## 3. WIP Limits y La Ley de Little
- Operamos con límites de *Work in Progress* (WIP) estrictos. 
- *Ley de Little:* `Tiempo de Flujo = WIP / Rendimiento`. Si iniciamos 20 tareas a la vez, el tiempo para terminar una sola se multiplica. Preferimos tener ingenieros inactivos ayudando en otras áreas antes que iniciar código nuevo si la columna de "Testing" está llena.
- **Fallo Temprano (Seguridad Psicológica):** Prohibimos la "cultura de las buenas noticias". Reportar que un experimento falló en Discovery se celebra como una victoria, porque nos ahorró meses de codificación inútil en Delivery.

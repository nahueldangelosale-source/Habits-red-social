# Playbook Estratégico: Operación "Colo Gym" (Ingesta Mágica)

## 1. Resumen Ejecutivo (El Objetivo de Avance - BTO)
La Operación Colo Gym no es una simple migración de datos; es la punta de lanza de nuestra estrategia de **Product-Led Growth (PLG)**. El objetivo es destruir el "Vendor Lock-in" de competidores B2B (como Hexfit) que secuestran la Propiedad Intelectual clínica de los entrenadores en PDFs estáticos. 

Al orquestar una **Ingesta Mágica** basada en Inteligencia Artificial Multimodal (Vertex AI / Gemini 1.5 Pro), convertimos la Fricción de Migración en nuestra principal ventaja competitiva, habilitando un "Puente de Migración en la Sombra" escalable.

## 2. Arquitectura de Valor (WSJF y Outcomes)
Todo el desarrollo técnico se rige por la cuantificación económica del **Weighted Shortest Job First (WSJF)**:
- **Outcome Principal:** Reducción drástica del Costo de Adquisición de Clientes (CAC) y del Tiempo-a-Valor (TTV).
- **TTV Arbitrage:** Reducir el tiempo de carga de un mesociclo de 45 minutos (manual) a **< 3 minutos** (Asistido por IA).
- **Rechazo de la Fábrica de Features:** Se decidió **matar** el desarrollo de flujos manuales redundantes (ej. `/cliente-cero-gym`) para proteger la Eficiencia de Flujo. El único flujo manual justificado es el Checkout rápido (Lead-to-Cash).

## 3. Arquitectura Técnica (El Motor V2)
Para decodificar la entropía de Hexfit (drop-sets, RIR, RPE, circuitos EMOM/AMRAP), implementamos una estrategia de extracción quirúrgica:
- **Visión Multimodal:** Rechazamos el uso de OCR tradicional (PyPDF2, Tesseract) que destruye la jerarquía visual. Gemini "observa" los PDFs para entender los Wrappers (Circuitos).
- **Structured Outputs (Esquema Pydantic V2):** Forzamos a la IA a respetar una taxonomía relacional estricta, mapeando booleanos críticos como `is_unilateral` y extrayendo matrices de tempo (ej. `3-1-X-0`).

## 4. Diseño Resiliente: Human-in-the-Loop (Auditoría Asistida)
Para evitar el arquetipo de "Arreglos que Fallan" y proteger la integridad de la base de datos, implementamos una **Degradación Elegante (Fallback)**:
- **Bandera `requires_review`:** Si la IA detecta ambigüedad irreconciliable, no alucina ni descarta el ejercicio. Pide revisión humana.
- **KPI de Viabilidad:** La Tasa de Intervención Humana (HIR) debe ser **< 15%**. Si lo supera, el sistema retrocede a fase de Fine-Tuning para no trasladar la carga cognitiva al usuario.
- **UX Adaptativa (El Problema Principal-Agente):** El dashboard de revisión satisface al Head Coach mostrando evidencia visual (bounding-boxes) para darle control, y satisface al Entrenador Junior usando botones de "1-click" y resaltado neón para máxima velocidad.

## 5. Gestión del Cambio e Influencia Ejecutiva (ADKAR & Cialdini)
La tecnología no sirve si la psicología del usuario la rechaza.
- **Principio de Unidad (Cialdini):** Fabricamos un enemigo común (Hexfit y su secuestro de datos). No "vendemos software", sino que "rescatamos su metodología".
- **Negociación Holística (Logrolling):** Mantenemos nuestro Ancla de Precio premium, bonificando el onboarding a cambio de que nos traigan 5 atletas (expansión de ARR).
- **Seguridad Psicológica (Interna):** Fomentamos el reporte temprano de fallos del LLM en el equipo de ingeniería para iterar rápido en la Pista de Discovery (Dual-Track Agile).

## 6. Control de Daños (Protocolo P-S-A)
Si el Dry-Run inicial falla (HIR > 25%), no pedimos disculpas técnicas. Ejecutamos el **P-S-A**:
1. **Problema:** "Hexfit ha ofuscado tus datos más de lo normal para que no te vayas".
2. **Solución:** "Nos negamos a perder tu resolución clínica. Pausamos la ingesta 24h para hacer Fine-Tuning y que la IA aprenda tu dialecto específico".
3. **Acción:** "Sigue usando Hexfit 48h más mientras nuestro motor entrena".

## 7. OKRs Post-Lanzamiento (El "Día 1")
Para convertir esta victoria en un Procedimiento Operativo Estándar (SOP) escalable a 50 gimnasios:
- **KR 1 (Adopción):** Ratio DAU/MAU > 85% en el staff durante los primeros 14 días.
- **KR 2 (Monetización):** Procesar el 100% de nuevas altas vía nuestro Checkout rápido antes del día 30.
- **KR 3 (Prueba Social y Growth):** Exigir un "Caso de Estudio Audiovisual" al Head Coach alabando la Ingesta Mágica, para usarlo como Ads (TOFU) y generar 3 MQLs cualificados en el primer mes.
- **KR 4 (Expansión de Ingresos):** Lograr un Cross-sell del 20% hacia Nutrición Inteligente B2B2C, llevando el NRR a >120%.

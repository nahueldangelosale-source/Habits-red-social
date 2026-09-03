# Norte Estratégico: Bienestar APP (3.6.2026)

## 1. Contexto General y Visión
Alpha Dynamics es el sistema operativo B2B2C de fricción cero para la industria del fitness y la salud clínica. Nuestro objetivo no es vender software a entrenadores, sino convertirnos en el **Exoesqueleto Biomecánico y Financiero** que les permita escalar su negocio (ARPU) un 300% sin incurrir en Burnout.

---

## 2. Estrategia de Workspaces (El Ecosistema)

La plataforma opera bajo un modelo de Autorización Basada en Roles (RBAC) dinámico, donde un único "Cerebro" (Motor Frontend) adapta su estructura al Workspace activo. Hemos consolidado múltiples paneles legacy en un único núcleo: el **Command Center**.

### A. Ecosistema de Adquisición (Atleta / B2C)
- **Workflow:** El usuario final no sufre un muro de pago inicial (Hard-Lock). Pasa por un onboarding conversacional para capturar su "Arquetipo Metabólico" y necesidades.
- **La Trampa de Escasez (Soft-Lock):** El atleta entra a su dashboard en modo restringido. Ve que el sistema ya procesó sus datos ("4 sesiones generadas"), pero están detrás de un panel de *Glassmorphism*.
- **Bucle de Facturación de 72h:** 
  - **T+24h:** Mensaje de Autoridad ("Tu infraestructura sigue pausada").
  - **T+48h:** Prueba Social ("12 atletas con tu perfil ya iniciaron").
  - **T+72h:** Escasez Máxima ("Los cálculos se purgarán de la caché"). 
- Al pagar (MercadoPago/Tarjetas Locales), el Soft-Lock se destruye asincrónicamente mediante *Optimistic UI Updates* para recompensar con un "Pico de Dopamina" instantáneo.

### B. Workspace B2B (Dueño de Gimnasio / Administración)
- **Objetivo:** LTV (Life-Time Value) y MRR Predictible.
- **Workflow:** Al inyectar el rol B2B en el *Command Center*, el sistema destruye las vistas operativas granulares y renderiza métricas adelantadas (Leading Indicators).
- **Métrica Estrella:** *Capital en Riesgo (Riesgo de Fuga)*. El dueño no solo ve cuánto dinero hace, sino cuánto dinero está retenido en "Soft-Lock" pendiente de conversión, demostrando el ROI directo de la plataforma.

### C. Workspace Profesional (Entrenador / PT)
- **Objetivo:** Escalabilidad operativa y Autoridad.
- **Workflow:** El PT opera desde el *Command Center* unificado, que incluye:
  - **Radar Analítico:** Visión global del estado del Sistema Nervioso Central (SNC) de su cartera.
  - **Validation Tinder:** Un sistema de triaje rápido para validar videos de ejercicios o fallos biomecánicos.

### D. Workspace Clínico (Kinesiólogo / Nutricionista)
- **Objetivo:** Adherencia Terapéutica y Mitigación de Riesgo.
- **Workflow:** Hereda el motor del PT, pero el *Command Center* prioriza las alertas de severidad de dolor, fatiga extrema o asimetrías biomecánicas.

---

## 3. Innovación Core: El Motor de Retención Predictiva

Para evitar el anti-patrón de "Desplazando la Carga" (depender de que el entrenador busque pasivamente quién abandonó), hemos diseñado un **Motor de Alertas Tempranas**.

- **Telemetría Oscura:** El sistema procesa latencia de inicio de sesión, caída crónica de volumen (ACWR) y asimetrías en percepción de esfuerzo (RPE). Calcula un Índice de Riesgo (CRI).
- **Triaje de Retención (WIP = 1):** Si el CRI es alto, el atleta aparece en la cima del *Command Center* en un componente tipo "Tinder". Se fuerza al entrenador a revisar una alerta a la vez, evitando la fatiga cognitiva.
- **Orquestación Híbrida (Intervención 1-Click):** La IA no solo avisa del problema; propone la cura. En un solo clic, el entrenador aprueba que el sistema:
  1. Reduzca el volumen del calendario de entrenamiento del atleta (-20%).
  2. Abra un borrador empático pre-escrito en WhatsApp Web para iniciar el rescate humano.

---

## 4. Arquitectura de Seguridad (Zero-Trust UI)

- **Aislamiento en el Virtual DOM:** La diferenciación de Workspaces no se hace ocultando divs con CSS (`display: none`). Usamos *React Fiber* para asegurar que el código de un módulo (ej. clínica) no exista en la memoria RAM del navegador si el rol activo es B2B. Esto bloquea escaladas de privilegios cruzadas y auditorías DOM maliciosas.

## 5. Próximos Pasos y Vectores Críticos de Alineación
Para que esta consolidación sea ejecutada con precisión económica, definimos tres vectores estratégicos inminentes:

1. **Definición de Outcomes sobre Outputs:** No mediremos cuántos usuarios completan el flujo conversacional. El OKR central será cómo el perfilamiento del "Arquetipo Metabólico" afecta la retención a 90 días.
2. **Conciliación de Datos (Próximos Pasos):** Priorizaremos el desarrollo de Webhooks Asíncronos (Node.js/Fastify) para liquidar pagos, ya que cualquier latencia de conciliación afecta la tasa de conversión post-escasez. Asimismo, el paso de Mocks a Producción requerirá revisión estricta para evitar "Falsos Positivos" en el radar del SNC.
3. **Mapeo de Intereses (Stakeholders):** Anticipamos resistencia de usuarios acostumbrados a "listas infinitas". Nuestro BATNA será apoyarnos irrefutablemente en las métricas predictivas (CRI) y en la reducción dramática de su carga cognitiva.

---

## 6. Estrategia de Comunicación, UX Copywriting y Pedagogía
La interfaz no solo muestra datos; **condiciona el comportamiento**. Hemos diseñado el lenguaje de la plataforma bajo los siguientes pilares:

### A. Tono de Voz: El "Arquetipo del Doctor"
- **Autoridad Imparcial:** El sistema nunca suplica ("¡Por favor suscríbete!"). Diagnostica y prescribe ("Tu infraestructura está pausada. Cálculos en riesgo de purga").
- **Hibridación Empática:** Cuando el sistema detecta riesgo de abandono, no emite un aviso genérico. Propone un *Borrador Empático* simulando el tono humano ("Separar a la persona del problema biomecánico"), permitiendo que el Entrenador sea el héroe.

### B. Microcopy y Nomenclatura Táctica
Convertimos features aburridos en conceptos de alto valor percibido:
- **"Validation Tinder" (Triaje Biomecánico):** Transforma una tarea tediosa (revisar videos) en un ciclo dopamínico de alta tensión y fricción nula.
- **"Capital en Riesgo" (en lugar de "Usuarios Inactivos"):** Detona la aversión a la pérdida en clientes B2B. No es una lista de gente; es dinero que están perdiendo activamente.
- **"Soft-Lock":** El uso del *Glassmorphism* es una pedagogía visual. El valor (el plan de entrenamiento) está visible pero desenfocado; la barrera es psicológica, no técnica.
- **"Command Center" / "Telemetry Cockpit":** Nomenclaturas que infunden sensación de omnisciencia, elevando el estatus percibido del Entrenador.

### C. Pedagogía UX (Reducción de Sesgos)
- **Ilusión de Trabajo (Labor Illusion):** En lugar de pantallas de carga vacías, inyectamos copys dinámicos (*"Calculando ACWR...", "Optimizando Red Neuronal"*). Esto justifica el tiempo de espera, anclando el alto valor algorítmico del producto.
- **Traducción Cognitiva:** No mostramos "Volumen > 10.000". Traducimos el dato a un estado clínico digerible: **"Fatiga Crítica (SNC)"** vs **"Estado Zen Activo"**. Esto evita la fatiga por alarmas y fomenta la toma de decisiones determinística.

---

## 7. Sistemas de Diseño y Ergonomía Visual (OVS 1-4)
El ecosistema ha implementado un esquema de **Disonancia Cognitiva Controlada**, donde la teoría del color y la disposición del lienzo dictan el estado mental del usuario antes de que procese un solo dato.

### OVS 1: El Atleta (Modo Ignite B2C)
- **Psicología:** Retención gamificada, dopamina y estado de *Flow*.
- **Arquitectura Visual:** Simetría radial para el progreso. Interfaz en *Dark Mode* absoluto perforado por "Amarillo Tóxico" (`#CEFF00`) para CTA críticos.
- **Microinteracciones:** Secuencia *Shattering Glass* para destruir el Soft-Lock tras el pago (Tensión -> Ruptura Vectorial -> Recompensa) y feedback háptico/visual instantáneo al registrar esfuerzo (RPE).

### OVS 2: El Entrenador (Modo Clínico B2B)
- **Psicología:** Soberanía, precisión quirúrgica y mitigación de la "fatiga de decisión".
- **Arquitectura Visual:** Asimetría funcional (Regla de los Tercios). Blanco puro y grises quirúrgicos (`#F8FAFC`).
- **Triaje Cognitivo:** *Regla de la Ausencia* en el **Retention Radar**: atletas sanos se renderizan en gris mate invisible; solo el riesgo crítico se pinta en rojo. El **Validation Tinder** centraliza videos con telemetría en *Glassmorphism Inverso* y físicas de resorte (*Spring Physics*) para un TTA < 1.2s.

### OVS 3: El Nutricionista Clínico (Soberanía Analítica)
- **Psicología:** Concentración profunda y aislamiento de la señal médica frente al ruido de los biomarcadores.
- **Arquitectura Visual:** Matriz **Bento Box** basada en la Ley Gestalt de Proximidad. Agrupación clínica (Perfil Lipídico, Fatiga SNC), usando tipografía dual (`Montserrat`/`Lato`) sin colores de alarma, solo descriptores formales (High/Low).
- **Interacción Cinematográfica:** Aplicación de *Profundidad de Campo (DoF)* dinámica. Al activar dictado de voz o arrastrar un PDF (*Dropzone Inmersiva*), el entorno se desenfoca y el módulo de ingesta se aísla en el Eje Z. El escaneo OCR ocurre en un componente "fantasma" asíncrono para no romper la inmersión.

### OVS 4: El Dueño de Gimnasio (Arquitectura Financiera)
- **Psicología:** Poder, control y Aversión a la Pérdida financiera.
- **Arquitectura Visual:** El dolor monetario domina la jerarquía. El **WatchtowerTrafficLight** anclado en el centro superior.
- **Cinética de la Tensión:** Uso de animación *CountUp* acelerada sobre tipografía gigante para el *Capital en Riesgo* en USD y el porcentaje de MRR afectado, disparada exclusivamente en verdaderos saltos de riesgo para evitar *Banner Blindness*. Las proyecciones LTV:CAC asíncronas en azul sobrio sirven como ancla de resolución de esa tensión.

### OVS 1b: Paciente Clínico Exclusivo (Lienzo de Longevidad)
- **Rol:** Paciente enfocado en salud metabólica y longevidad, sin entrenador físico.
- **Psicología:** Mitigar la disonancia cognitiva erradicando el "Modo Ignite". Consolidar la biología y los hábitos en un entorno libre de ansiedad.
- **Estética Visual ("Minimalismo Clínico Orgánico"):** 
  - Fondo Marfil/Beige (`#F5F5DC`) para contención perimetral.
  - Tarjetas en Blanco Puro (`#FFFFFF`) para superficie de autoridad médica.
  - Acentos en Verde Salvia (`#C9D3CA`) para el anclaje accionable.
  - Tipografía Pizarra (`#1E293B`) para contraste filoso sin ser agresivo.
- **Motor de Progreso:** Consistencia en micro-hábitos (hidratación, ayuno) en lugar de volumen/hipertrofia. Mapeo de Gestalt con la *CognitiveInsightCard* aislando empatía, ciencia y acción.

---

## 7b. Modalidades del Sistema: IGNITE vs CLÍNICA

La plataforma opera bajo dos modalidades visuales y cognitivas mutuamente excluyentes. El motor de frontend detecta el `ThemeContext.mode` y destruye la modalidad opuesta del Virtual DOM para evitar contaminación cruzada.

| Aspecto | 🔥 Modo IGNITE (Fitness / B2C) | 🩺 Modo CLÍNICA (Salud / Longevidad) |
|---|---|---|
| **Significado** | Encendido, activación, dopamina. El sistema "enciende" al atleta para la acción y la competición contra sí mismo. | Precisión médica, autoridad terapéutica. El sistema "diagnostica y prescribe" con la calma de un consultorio. |
| **Psicología Central** | Retención gamificada. Aversión a la pérdida (Soft-Lock). Estado de Flow. | Adherencia terapéutica. Reducción de ansiedad. Confianza clínica. |
| **Paleta de Color** | Dark Mode absoluto (`#0A0A0A`). Acento "Amarillo Tóxico" (`#CEFF00`). | Marfil orgánico (`#F5F5DC`). Blanco Puro (`#FFFFFF`). Verde Salvia (`#C9D3CA`). Pizarra (`#1E293B`). |
| **Tipografía** | `Montserrat` Bold — agresiva, monoespaciada para datos numéricos. | `Montserrat` / `Lato` dual — filosa pero no hostil, lectura sin fatiga. |
| **Animaciones** | Shattering Glass, Spring Physics, CountUp acelerado. Alta tensión. | Labor Illusion suave ("Mapeando biomarcadores..."). DoF cinematográfica. |
| **Microinteracciones** | Feedback háptico al RPE. Swipe en Validation Tinder. Destrucción del candado. | Skeleton Prerendering. Dropzone inmersiva. Firma médico-legal post-OCR. |
| **Fallback de Carga** | `bg-black` / `bg-zinc-950` con texto `#CEFF00`. | `bg-[#F5F5DC]` (Marfil) o `bg-slate-50` (Blanco Quirúrgico). |
| **Usuarios Objetivo** | Atletas B2C, Entrenadores (PT), Dueños de Gym. | Pacientes de longevidad, Nutricionistas clínicos, Kinesiólogos. |
| **Objetivo de Negocio** | Conversión post-escasez → MRR. Retención por dopamina. | ARPU clínico. Adherencia a 90 días. Reducción de riesgo médico-legal. |

---

## 7c. Mapa Maestro de Rutas, Estrategia UX y KPIs

### Glosario de Columnas
- **Ruta:** URL activa en el enrutador de React Router v6.
- **Modalidad:** IGNITE 🔥 o CLÍNICA 🩺 (determina paleta, tipografía y animaciones).
- **Workspace / Rol:** Quién consume esta vista (Atleta, Entrenador, Nutricionista, Dueño, Paciente).
- **Estrategia UX:** La técnica psicológica o conductual dominante.
- **Criterio de Éxito:** La condición binaria que marca si la ruta cumple su propósito.
- **KPI Principal:** La métrica cuantitativa que se monitorea.

---

### BLOQUE A: Rutas de Adquisición B2C (Onboarding)

Estas rutas operan **fuera** del `AppContent` autenticado. Son públicas y se renderizan en un árbol de React aislado (`EntropyVAKProvider` sin `AuthProvider`).

| Ruta | Modalidad | Workspace / Rol | Componente | Estrategia UX | Criterio de Éxito | KPI Principal |
|---|---|---|---|---|---|---|
| `/b2c/onboarding` | 🔥 IGNITE | Atleta B2C | `ZeroClientWizardPT` (mode=B2C) | **Fricción Cero + Labor Illusion.** Wizard conversacional que captura el mínimo viable de datos (objetivo, nivel, lesiones) y simula procesamiento de IA. | El atleta completa el wizard en < 90 segundos y ve la confirmación. | Completion Rate > 75%. TTFV < 45s. |
| `/b2c/onboarding-clinico` | 🩺 CLÍNICA | Paciente Longevidad | `ClinicalOnboardingWizard` | **Firewall Clínico + Confianza Médica.** 4 bloques (Foco Terapéutico → Fisiología → Carga Alostática → Identidad). Paleta Marfil. Sin estimulación dopamínica. | El paciente completa las 4 fases sin abandonar. Datos clínicos innegociables capturados. | Completion Rate > 60%. Drop-off en Fase 2 < 20%. |
| `/onboarding` | 🔥 IGNITE | Atleta B2C | `ZeroClientWizardPT` (mode=B2C) | Alias de `/b2c/onboarding`. Ruta legacy para compatibilidad con links antiguos. | Redirect transparente, 0 errores 404. | Tasa de 404 = 0%. |
| `/cliente-cero` | 🔥 IGNITE | Atleta (Genérico) | `ZeroClientWizard` | **Perfilamiento Rápido.** Wizard original multi-propósito. Captura el "Arquetipo Metabólico" del usuario. | El usuario identifica su arquetipo y es redirigido al canal correcto (Fitness o Clínica). | Triage Accuracy > 90%. |
| `/cliente-cero-pt` | 🔥 IGNITE | Atleta PT | `ZeroClientWizardPT` | **Alta Conversión para Personal Trainers.** Captura solo datos críticos (objetivo, experiencia, lesiones). Inyecta el perfil directamente en el panel del Trainer. | El atleta aparece en "Atletas Recientes" del Trainer Dashboard en < 3 segundos. | Time-to-First-Injection < 3s. |
| `/cliente-cero-nutri` | 🩺 CLÍNICA | Paciente Nutricional | `ClienteCeroNutri` | **Split-Screen Clínico.** Recopilación exhaustiva: arquetipo metabólico, fármacos (GLP-1), intolerancias severas, cintura/peso. Alimenta el motor DietQA. | Datos innegociables completos. Zero fuga clínica (ningún campo crítico vacío). | Clinical Data Completeness = 100%. |
| `/magic-link-onboarding` | 🩺 CLÍNICA | Atleta Invitado | `AthleteMagicLinkForm` | **Onboarding sin fricción por invitación.** El Trainer envía un Magic Link; el atleta completa su perfil sin crear cuenta. | El atleta completa el formulario y se vincula al Trainer correcto. | Magic Link Redemption Rate > 80%. |
| `/b2c/join` | 🔥 IGNITE | Atleta Invitado | `MagicLinkRedeem` | **Redención de Magic Link.** Pantalla de aterrizaje para links de invitación. | El usuario redime el link y accede al workspace correcto sin fricciones. | Redemption Success > 95%. |
| `/join` | 🔥 IGNITE | Atleta | `JoinView` | **Punto de entrada genérico B2C.** | Redirección correcta al flujo de onboarding correspondiente. | Bounce Rate < 15%. |
| `/app/auth/success` | — (Sistema) | Todos | `AuthSuccessHandler` | **Post-Auth Redirect.** Callback tras autenticación OAuth/MagicLink. | Zero errores de estado post-auth. | Auth Error Rate = 0%. |

---

### BLOQUE B: Rutas del Atleta / Paciente (Post-Onboarding B2C)

Estas rutas son el "día a día" del usuario final tras completar el onboarding. Operan dentro del árbol B2C aislado.

| Ruta | Modalidad | Workspace / Rol | Componente | Estrategia UX | Criterio de Éxito | KPI Principal |
|---|---|---|---|---|---|---|
| `/atleta/canvas` | 🔥 IGNITE | Atleta Activo | `ActiveCanvas` | **Centro de Mando del Atleta.** Lienzo principal con estado de sesión, RPE, Shattering Glass post-pago, y listener de WebSocket para triggers remotos. | El atleta ve su progreso y puede registrar esfuerzo en < 2 toques. | Session Engagement > 4 min. RPE Submission Rate > 70%. |
| `/atleta/*` | 🔥 IGNITE | Atleta Activo | `AthleteMobileView` | **Vista Mobile-First.** Dashboard adaptativo optimizado para uso en el gimnasio (pantalla vertical, botones grandes). | Rendimiento fluido en dispositivos < 4GB RAM. INP < 200ms. | Mobile Performance Score > 85. |
| `/athlete/*` | 🔥 IGNITE | Atleta Activo | `AthleteMobileView` | Alias en inglés de `/atleta/*` para internacionalización futura. | Paridad funcional 1:1 con `/atleta/*`. | Parity Check = 100%. |
| `/longevidad` | 🩺 CLÍNICA | Paciente Longevidad | `PatientLongevityCanvas` | **Lienzo de Longevidad.** Dashboard de micro-hábitos (hidratación, ayuno, sueño). `fetch()` asíncrono al backend con fallback a mock. Skeleton con Labor Illusion de 800ms. Zero Ignite. | El paciente ve su CognitiveInsightCard personalizada. Check-in determinista sin LLM. | Daily Check-in Rate > 50%. Zero-AI Token Cost. |

---

### BLOQUE C: Rutas de Herramientas Profesionales (Sin Sidebar)

Vistas especializadas para profesionales que operan fuera del Command Center principal pero siguen en el árbol B2C aislado.

| Ruta | Modalidad | Workspace / Rol | Componente | Estrategia UX | Criterio de Éxito | KPI Principal |
|---|---|---|---|---|---|---|
| `/plan-builder` | 🩺 CLÍNICA | Nutricionista / PT | `PlanBuilderCockpit` | **Cockpit de Prescripción.** Diseño de planes nutricionales y de entrenamiento con macros estructurados (Zero-AI). Protocolo Longitudinal en 3 fases con selectores deterministas. Integrado con `usePeriodizationEngine`. | El profesional genera un plan completo sin usar textareas libres. Telemetría va al bypass. | Plan Creation Time < 10 min. Zero-AI Token Cost. |
| `/trainer-cockpit` | 🔥 IGNITE | Entrenador PT | `TrainerCockpit` | **Vista Rápida del Trainer.** Acceso directo a la cartera de atletas con indicadores de riesgo y acciones rápidas. | El Trainer identifica atletas en riesgo en < 5 segundos. | Time-to-Triage < 5s. |
| `/recepcion/escaner` | 🔥 IGNITE | Staff de Recepción (Gym) | `ReceptionScanner` | **Escáner QR de Check-in.** El recepcionista escanea el QR del atleta para registrar asistencia. Modo Kiosco. | Escaneo exitoso en < 2 segundos. | Scan Success Rate > 98%. Scan-to-Record < 2s. |
| `/test-b2b2c` | — (Dev) | Desarrollador / QA | `TestB2B2C` | **Sandbox de Integración.** Entorno de prueba para validar flujos completos B2B2C sin afectar datos reales. | Zero efectos secundarios en producción. | Test Isolation = 100%. |

---

### BLOQUE D: Rutas Autenticadas del Command Center (AppContent + Sidebar)

Estas rutas operan dentro del `AppContent` protegido por `AuthProvider`. Requieren autenticación. Renderizan el `Sidebar` + la vista seleccionada del `viewComponents` map. La modalidad se alterna dinámicamente según `ThemeContext.mode`.

| Ruta | Modalidad | Workspace / Rol | Vista (viewComponents) | Estrategia UX | Criterio de Éxito | KPI Principal |
|---|---|---|---|---|---|---|
| `/` o `/dashboard` | 🔥/🩺 (según rol) | Todos (autenticados) | `CommandCenter` | **Hub Unificado.** El cerebro se adapta al rol inyectado (RBAC). Renderiza métricas adelantadas, radar de retención, y acciones de alta prioridad. | El profesional identifica su tarea #1 en < 3 segundos. | Time-to-Action < 3s. |
| `/trainer` | 🔥 IGNITE | Entrenador PT | `CommandCenter` | **Dashboard del PT.** Atletas recientes, Validation Tinder, Radar Analítico (SNC). Acciones de rescate 1-click. | El Trainer revisa su cartera completa sin scroll infinito. | Churn Detection Rate > 80%. |
| `/trainer/athlete/:id` | 🔥 IGNITE | Entrenador PT | `CommandCenter` (vista de detalle) | **Ficha del Atleta.** Telemetría individual, historial de sesiones, ACWR, RPE trends. | El Trainer accede al perfil completo del atleta y toma decisión clínica informada. | Time-to-Insight < 10s. |
| `/trainer/finance` | 🔥 IGNITE | Entrenador PT | `FinanceDashboardView` | **Panel Financiero del PT.** MRR actual, proyecciones de ingreso, estado de cobros por tier (Ignite/Pro/Elite). | El Trainer ve su MRR actualizado sin latencia. | MRR Accuracy = 100%. |
| `/inbox` | 🔥/🩺 (según rol) | Entrenador / Nutricionista | `IntelligentInbox` | **Inbox Inteligente con Swap Engine.** Priorización automática de mensajes por urgencia clínica. Integración con generador de rutinas. | Zero mensajes críticos ignorados por más de 24h. | Critical Response Time < 24h. |
| `/validations` | 🔥 IGNITE | Entrenador PT | `ValidationsPage` | **Validation Tinder (Full Page).** Revisión de videos con física de swipe. Aprobación/Rechazo con feedback instantáneo. | TTA (Time-to-Approve) < 1.2s por video. | TTA < 1.2s. Validation Throughput > 20/sesión. |
| `/business` | 🔥 IGNITE | Dueño de Gimnasio (B2B) | `BusinessPage` (GymOwnerDashboard) | **Watchtower Financiera.** Capital en Riesgo, MRR breakdown por tier, LTV:CAC, alertas de fuga. CountUp animado con Zero-Reconciliation. | El dueño visualiza el riesgo monetario en < 2 segundos. | Capital en Riesgo Visibility < 2s. |

#### Vistas Internas del Sidebar (Accesibles desde el Command Center)

| Vista (Sidebar) | Modalidad | Workspace / Rol | Componente | Estrategia UX | KPI Principal |
|---|---|---|---|---|---|
| `roster` | 🩺 CLÍNICA | Nutricionista / PT | `PatientList` | Lista de pacientes con indicadores de adherencia. | Patient Load Time < 500ms. |
| `lab` / `smartlab` | 🩺 CLÍNICA | Nutricionista | `ClinicalBentoLayout` | Matriz Bento Box con OCR Worker. 3 ejes independientes (Metabólico, Lipídico, Estrés). INP < 150ms. | Main Thread Blocking = 0ms. |
| `nutrition` | 🩺 CLÍNICA | Nutricionista | `NutritionDashboard` | Dashboard nutricional con carga glucémica y antropometría. | Data Freshness < 24h. |
| `nutricionista` | 🩺 CLÍNICA | Nutricionista | `NutricionistaDashboard` | Panel clínico completo del nutricionista con SmartCalendar integrado. | Appointment No-Show < 10%. |
| `dietqa` | 🩺 CLÍNICA | Nutricionista | `DietQAPage` | Motor de validación clínica. Verifica que los planes no tengan fuga clínica. | Clinical Escape Rate = 0%. |
| `voice` | 🩺 CLÍNICA | Nutricionista / PT | `VoiceToChart` | Dictado de voz a ficha clínica con NLP. | Transcription Accuracy > 95%. |
| `revenue` | 🔥 IGNITE | Dueño / PT | `RevenueGuard` | MRR Guard con CountUp Zero-Reconciliation. Aversión a la pérdida. | Zero re-renders React en animación. |
| `watchtower` | 🔥 IGNITE | Dueño de Gimnasio | `WatchtowerDashboard` | Semáforo de tráfico con Leading Indicators. | Alert Latency < 5s. |
| `gamification` | 🔥 IGNITE | Atleta / PT | `GamificationHub` | Hub de logros, streaks y recompensas. Motor de dopamina. | DAU/MAU > 30%. |
| `arena` | 🔥 IGNITE | Atleta | `TheArena` | Competición social entre atletas. Leaderboards y desafíos. | Challenge Participation > 25%. |
| `mindgym` | 🩺 CLÍNICA | Atleta / Paciente | `MindGym` | Gimnasio mental. Ejercicios de respiración, meditación y manejo de cortisol. | Session Completion > 60%. |
| `referrals` | 🔥 IGNITE | Todos | `ReferralDashboard` | Motor de referidos. Programa de recompensas por invitación. | Referral Conversion > 15%. |
| `import` | 🔥 IGNITE | PT / Nutricionista | `MagicImport` | Importación mágica de hojas Excel. Celery async + Dead Letter Queue. | TTFV < 45s. Import Error Rate < 5%. |
| `branding` | — (Config) | Dueño de Gimnasio | `TenantBranding` | Marca blanca. Personalización de colores, logo y dominio. | Setup Completion > 90%. |
| `professionals` | — (Config) | Dueño de Gimnasio | `ProfessionalsManager` | Gestión del staff profesional (altas, bajas, roles). | Staff Onboarding < 5 min. |
| `calendar` | 🩺 CLÍNICA | PT / Nutricionista | `SmartCalendarPage` | Calendario inteligente con tokens de gracia y detección de ausencias. | No-Show Prediction Accuracy > 75%. |
| `prescription` | 🩺 CLÍNICA | Nutricionista | `ShoppablePrescription` | Prescripción comprable. El paciente puede adquirir suplementos directamente. | Prescription-to-Purchase > 10%. |
| `menu` | 🩺 CLÍNICA | Paciente | `MenuScanner` | Escáner de menú de restaurante con análisis nutricional. | Scan-to-Result < 3s. |
| `rewards` | 🔥 IGNITE | Dueño de Gimnasio | `RewardsVault` | Bóveda de recompensas para el programa de fidelización del gym. | Reward Redemption Rate > 40%. |
| `finance` | 🔥 IGNITE | PT / Dueño | `FinanceDashboardView` | Panel financiero con breakdown por tier de servicio. | Revenue Tracking Accuracy = 100%. |
| `library` / `assets` | — (Enabler) | PT / Nutricionista | `LibraryDashboard` / `MasterLibrary` | Biblioteca de ejercicios y assets multimedia. | Asset Search Time < 2s. |
| `communication` | 🔥/🩺 | PT / Nutricionista | `CommunicationHub` | Hub de comunicación (WhatsApp, Email, Push). Borradores empáticos. | Response Rate > 80%. |
| `client` | 🔥 IGNITE | PT | `ClientHub` | Hub de gestión de clientes con lifecycle tracking. | Client Retention 90d > 70%. |

---

### BLOQUE E: Rutas de Backend (API REST)

| Endpoint | Método | Modalidad | Consumidor | Estrategia | KPI |
|---|---|---|---|---|---|
| `/api/v1/clinical/cognitive-translation` | GET | 🩺 CLÍNICA | `PatientLongevityCanvas` | Contrato OpenAPI estricto con Pydantic Literal. Trinidad Pedagógica. | Response Time < 200ms. |
| `/api/v1/clinical/telemetry/bypass` | POST | 🩺 CLÍNICA | `PatientMobileSimulator` / `PlanBuilderCockpit` | **FinOps Bypass.** Inyección directa a `M2MAuditVault`. Zero LLM wake-up. | Token Cost = $0. Insertion Latency < 50ms. |

---

## 8. Arquitectura y Tecnologías Core (El Backend Bunker)

*   **Frontend:** React 19 (Vite), React Router v6, Tailwind CSS, Framer Motion (para físicas vectoriales y transiciones de "Cristalización/Shattering").
*   **Backend / Middleware:** FastAPI/Fastify (Python/Node) con patrón asíncrono Event-Driven usando **Redis Pub/Sub** para orquestar eventos (ej. liquidación T+72h o detonación de WebSockets).
*   **M2M Audit Vault (Zero-Trust):** Base de datos inmutable (`INSERT ONLY` forzado vía listeners de SQLAlchemy). Centraliza la ingesta de telemetría sin procesar y registros de auditoría médico-legales.
*   **FinOps Cognitivo (Zero-AI Telemetry):** Bypass de IA implementado en flujos de recolección recurrente (diarios de pacientes, PlanBuilder). La telemetría estructurada se inyecta directamente en la bóveda sin despertar motores LLM, logrando costo cero (OpEx) en transacciones iterativas.
*   **Motor Cognitivo:** `CognitiveTranslatorService` operando como interceptor determinista. Usado exclusivamente para alto valor asimétrico (ej. resúmenes semanales). Traduce matemática cruda bajo un contrato JSON estricto (`Pedagogical Copy`, `Education Pill`), garantizando *Carga Cognitiva Cero* a nivel API.
*   **Estado:** Context API (Auth, RBAC, Theme, Language), `EntropyVAKContext` (para el motor cognitivo).
*   **Seguridad:** Virtual DOM Isolation (React Fiber) para evitar escaladas de privilegios cruzadas entre Workspaces en la memoria del navegador.

---

## 9. Bitácora de Resoluciones Tácticas en Vivo (Junio 2026)

*   **[Resolución] Desacople de CSS Global (Dark Mode Override):** 
    Durante el despliegue del OVS 1b, se identificó que el componente heredaba forzosamente la directiva *Dark Mode* de la capa superior (`AppContent`), neutralizando el diseño de "Minimalismo Clínico Orgánico" (Marfil y Blanco). 
    *   **Acción:** Se aplicó un *Zero-Trust CSS* mediante valores arbitrarios JIT de Tailwind.
    *   **Resultado:** Se rompió la cascada oscura, asegurando que el Lienzo de Longevidad mantenga su pureza y autoridad médica independientemente del estado global del Theme, y se ajustó el contraste tipográfico (Slate-500/600) para garantizar accesibilidad y lectura sin fatiga.

*   **[Resolución] Despertar del Sistema Nervioso y Bóveda M2M (Fase 5):**
    *   **Acción:** Implementación de Swagger/OpenAPI con tipado estricto (`Literal`) en Pydantic (`clinical_routes.py`). Conexión de Vite al backend vía WebSocket y Redis Pub/Sub. Se instaló la bóveda inmutable `M2MAuditVault` (INSERT ONLY).
    *   **Resultado:** Cierre del loop asíncrono. Cuando un evento transaccional sucede, el Web Worker o el router dispara eventos de Redis, y el cliente detona animaciones de alto valor visual sin recargar.

*   **[Resolución] FinOps Cognitivo & Cierre de Mocks (Fase 6):**
    *   **Acción:** Erradicación del LLM en los flujos diarios de alta frecuencia y eliminación del `useGlobalSimulator` en el Frontend. Se implementó un interceptor de red unificado (`apiRequest`) y el estado global de facturación (`useBillingStore`) para capturar códigos `402 Payment Required`. A nivel base de datos, se aplicó una migración "Alembic Backfill" segura para sanitizar datos huérfanos antes de imponer restricciones `NOT NULL`, y se inyectaron índices compuestos en PostgreSQL para prevenir *Table Scans* en tenants con alta concurrencia.
    *   **Resultado:** El dashboard se hidrata concurrentemente con `Promise.all` desde la base de datos real, reduciendo latencias. El **Glassmorphic Soft-Lock** ahora responde estructuralmente a bloqueos FinOps, y el coste de IA por cada check-in diario baja a $0 (Zero-AI Telemetry).

*   **[Resolución] Activación y Onboarding Real E2E (Fase 7 - COMPLETADA):**
    *   **Acción:** Reajuste del Roadmap aplazando Monetización en favor del circuito de usabilidad B2C/B2B. Se desarrollaron los endpoints atómicos (`POST /api/v1/patients`, `/api/v1/athletes`) con un enfoque polimórfico (JSONB). Para el tráfico orgánico, se implementó "Slug Tracking" (`?gym=slug`) resolviendo el tenant público, con un "Global Pool" transparente para B2C puros, utilizando `persist` de Zustand y propagando `X-Tenant-ID`. Finalmente, el motor de protocolos (`POST /api/v1/protocols`) garantizó matemáticamente la seguridad inyectando `current_pro.tenant_id` y gestionó el versionado para Inmutabilidad Clínica (`ACTIVE` vs `ARCHIVED`).
    *   **Resultado:** Todo el flujo conversacional y de diseño de planes impacta PostgreSQL en tiempo real y con total aislamiento criptográfico Multi-Tenant, eliminando permanentemente los simuladores locales del onboarding y PlanBuilder.

*   **[Resolución] Destrucción de Mocks e Hidratación del Command Center (Fase 8 - COMPLETADA):**
    *   **Acción:** Migración del estado local dependiente de simuladores hacia la *Single Source of Truth* del servidor. Se implementó un cliente Axios centralizado (`apiClient.ts`) para la inyección universal de cabeceras de seguridad y autenticación. Se envolvió la App en TanStack Query (`React Query`) orquestando caché inteligente y flujos asíncronos en componentes clave como `PatientList.tsx` y `TrainerCockpit.tsx`. Se habilitaron los conectores RESTful definitivos en FastAPI (`GET /api/v1/patients`) y se diseñó la mutación atómica `POST /api/v1/patients/{id}/assignments`.
    *   **Resultado:** El ecosistema de listado y visualización de atletas (Roster) se liberó de sus `MOCKS`. Ahora refleja en tiempo real la Base de Datos PostgreSQL, con validaciones estrictas Cross-Tenant para IDOR, y aplica las políticas de Inmutabilidad Clínica automáticamente al realizar asignaciones de protocolos.

*   **[Resolución] Hidratación de Validation Tinder y Streaming HLS (Fase 9 - COMPLETADA):**
    *   **Acción:** Erradicación total de los datos hardcodeados en el componente `/validations`. Implementación de la paginación de ultra-baja latencia (Keyset Pagination por timestamp) en PostgreSQL (`GET /api/v1/validations/pending`). A nivel UI, se integró un hook de TanStack Query (`useValidateSwipe`) con Mutaciones Optimistas puras y rollback automático para borrar la tarjeta de la caché al instante. Adicionalmente, se instaló `hls.js` y se configuró un reproductor pre-fetching que precarga el próximo video de forma silenciosa mientras se evalúa el actual.
    *   **Resultado:** El Time-to-Approve (TTA) bajó drásticamente a menos de 1.2s. La experiencia de "Validation Tinder" es ahora adictiva, ininterrumpida y completamente real. El Entrenador procesa la biomecánica de decenas de atletas sin bloqueos de red, pantallas negras ni cuellos de botella de buffering.

*   **[Resolución] Arquitectura Reactiva WebSockets para Atleta Canvas (Fase 10 - COMPLETADA):**
    *   **Acción:** Migración del Canvas del atleta a un ecosistema Event-Driven (WebSockets + Redis Pub/Sub). Se implementó un `WebSocketConnectionManager` en FastAPI con aislamiento JWT por `athlete_id`. Para mitigar cortes de red (Half-Open Connections), se configuró un mecanismo de Ping/Pong (Heartbeat) de 30s. En el Frontend, se creó el hook `useCanvasWebSocket` combinando un Timeout de Zombis (45s), un Backoff Exponencial y el patrón "Query Fallback". 
    *   **Resultado:** El estado del Canvas se sincroniza en menos de 200ms al recibir aprobaciones del entrenador. El motor de Zustand dispara las animaciones cinemáticas ("Shattering Glass" a 60 FPS) al instante, y `TanStack Query` asegura la consistencia absoluta de los datos incluso al recuperarse de microcortes en entornos hostiles (sótanos de gimnasios).

*   **[Resolución] Motor Prescriptor y Centralización de Estado del PlanBuilder (Fase 11 - COMPLETADA):**
    *   **Acción:** Destrucción de simuladores locales en el `PlanBuilderCockpit` (Fase 11). Se estructuró un store global en el frontend (`usePlanBuilderStore` con Zustand) e inyecciones de red mediante TanStack Query (`usePlanBuilderMutations`). Del lado backend, se acopló la lógica de persistencia PostgreSQL (endpoint `/api/v1/protocols`) con un gatillo a Redis Pub/Sub (`PROTOCOL_UPDATED`). Adicionalmente, el frontend de la app del atleta (`ActiveCanvas.tsx`) fue refactorizado para usar `useQuery`, asegurando que al invalidar la caché tras un evento WebSocket, la actualización ocurra en segundo plano preservando estrictamente el RPE y inputs locales activos del usuario.
    *   **Resultado:** Consistencia extremo-a-extremo, desde el escritorio del Entrenador B2B hasta el móvil del atleta en el gimnasio. Los planes generados se almacenan atómicamente con Inmutabilidad Clínica, logrando Time-to-Insight nulo y sincronización de fricción cero en el cliente.

*   **[Resolución] Ergonomía B2B y Modo Excel en PlanBuilder (Fase 12 - COMPLETADA):**
    *   **Acción:** Refactorización profunda del `PlanBuilderCockpit` hacia la ergonomía B2B (Modo Excel). Se integró `@dnd-kit/core` para *Drag and Drop* atómico. Se implementó navegación por teclado (`Tab`, `Enter`) y un middleware nativo de *Undo/Redo* dentro del store de Zustand (soportando hasta 50 snapshots en RAM usando `immer`). Se aplicó `React.memo` a los nodos de la UI para aislar los re-renders, garantizando que el drag-and-drop corra a 60 FPS sin reflows globales. Adicionalmente, se añadió una Floating Action Bar masiva (Zero-Click Mass Actions).
    *   **Resultado:** La velocidad de captura del Supply-Side (creación de rutinas) aumentó radicalmente. Los entrenadores ya no perciben fricción en el teclado ni tienen "Ansiedad de Edición" gracias al historial temporal. El PlanBuilder es formalmente una herramienta de Grado Industrial.

*   **[Resolución] La Fortaleza en la Sombra - Resiliencia Offline-First (Fase 13 - COMPLETADA):**
    *   **Acción:** Transformación del `ActiveCanvas` del atleta a una arquitectura offline-first en 3 capas. (1) Capa PWA: Reglas `StaleWhileRevalidate` con TTL de 24h para rutinas vía Workbox. (2) Capa IndexedDB: Migración desde el frágil `localStorage` hacia un store versionado y transaccional usando `idb` (`offlineDb.ts`) que gestiona tanto el `routineCache` como el `outbox` de RPEs. (3) Hidratación Offline: TanStack Query fue configurado con `initialData` extraída desde IDB. Todo el sistema fue blindado con `try/catch` silenciosos para sobrevivir en "Safari Private Mode".
    *   **Resultado:** Resiliencia total ante zonas muertas de gimnasios. La app carga instantáneamente (Zero-Latency Start) la rutina cacheada, permite registrar los levantamientos y los sincroniza silenciosamente (*Stale-While-Revalidate* inverso) cuando la red regresa, mostrando un discreto toast de éxito en lugar de contadores ansiógenos.

*   **[Resolución] Mitigación del Doble Gasto y Pureza Temporal del Math Engine (Fase 14 - COMPLETADA):**
    *   **Acción:** Implementación del patrón de Idempotencia en el lado cliente y rediseño del Math Engine (Opción A). Se inyectó `crypto.randomUUID()` en el momento exacto de completar un set en el `ActiveCanvas`, viajando como `idempotency_key` a través de IndexedDB hasta PostgreSQL. En el backend (`athlete.py`), se interceptan duplicados generados por rebotes de red y se retorna un éxito silencioso. Adicionalmente, el Math Engine dejó de guardar el `e1RM` de forma secuencial durante los POSTs para evitar el efecto "Race Condition". Ahora, el cálculo es *Retroactivo On-Demand*, computando el `e1RM` en tiempo de lectura (`GET /routine/today`) apoyándose estrictamente en el `client_created_at` del dispositivo.
    *   **Resultado:** El Math Engine es 100% inmune a ráfagas asíncronas post-desconexión. El historial de `e1RM` mantiene una progresión matemática fiel a la realidad intra-entrenamiento del atleta, y la base de datos funciona como un verdadero *Append-Only Log* sin corrupción de estado.

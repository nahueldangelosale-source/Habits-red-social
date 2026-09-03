/// <reference lib="webworker" />

self.onmessage = (e: MessageEvent) => {
    const { correlationId } = e.data;
    
    // Simulate OCR processing and AI cognitive translation logic.
    // In a real scenario, this worker would parse the PDF/image using Tesseract or similar,
    // and then perhaps hit a lightweight WASM model or format payloads for the Fastify API.
    
    // The key here is returning partial results to drive the "Dynamic DoF" per Gestalt group.

    const processAxis = (axisName: string, data: any, delay: number) => {
        setTimeout(() => {
            self.postMessage({ correlationId, type: 'AXIS_COMPLETE', axis: axisName, data });
        }, delay);
    };

    // 1. Eje Metabólico (Fastest)
    processAxis('metabolic', [
        { 
            biomarker: 'hba1c',
            name: 'Hemoglobina Glicosilada',
            raw_value: 5.4, 
            unit: '%',
            status: 'Optimal',
            professional_view: { diagnosis: 'HbA1c óptima. Sensibilidad a la insulina intacta en tejido periférico.', ui_directive: 'clinical-accent' },
            patient_view: { pedagogical_copy: 'Tu control de azúcar es excelente.', education_pill: 'Una HbA1c menor a 5.7% indica buena salud metabólica.', actionable_habit: 'Mantén el entrenamiento de fuerza para preservar esta sensibilidad.' }
        },
        { 
            biomarker: 'insulin',
            name: 'Insulina Basal',
            raw_value: 4.2, 
            unit: 'uIU/mL',
            status: 'Optimal',
            professional_view: { diagnosis: 'Bajo HOMA-IR proyectado.', ui_directive: 'clinical-accent' },
            patient_view: { pedagogical_copy: 'Tu páncreas no está sobrecargado.', education_pill: 'Niveles bajos en ayuno significan alta eficiencia.', actionable_habit: 'Sigue evitando carbohidratos refinados en el desayuno.' }
        }
    ], 800);

    // 2. Perfil Lipídico Avanzado (Medium)
    processAxis('lipid', [
        { 
            biomarker: 'apob',
            name: 'Apolipoproteína B',
            raw_value: 115, 
            unit: 'mg/dL',
            status: 'High',
            professional_view: { diagnosis: 'ApoB elevada, discordancia aterogénica. Riesgo endotelial.', ui_directive: 'risk-high' },
            patient_view: { pedagogical_copy: 'Tus partículas de transporte de colesterol están altas.', education_pill: 'ApoB es el mejor indicador de riesgo cardiovascular crónico.', actionable_habit: 'Aumenta fibra soluble a 15g diarios y reemplaza saturadas por monoinsaturadas.' }
        }
    ], 1600);

    // 3. Eje de Estrés (Slowest - demonstrates Skeleton DoF)
    processAxis('stress', [
        { 
            biomarker: 'cortisol_awakening_response',
            name: 'Cortisol Matutino',
            raw_value: 18, 
            unit: 'ug/dL',
            status: 'High',
            professional_view: { diagnosis: 'CAR hiperactivo. Fatiga adrenal en Fase 1.', ui_directive: 'risk-high' },
            patient_view: { pedagogical_copy: 'Tu cuerpo se despierta con excesiva tensión.', education_pill: 'El cortisol alto constante al despertar roba energía para la tarde.', actionable_habit: '10 min de respiración caja (4-4-4-4) antes de mirar pantallas al despertar.' }
        }
    ], 2800);

    // Final completion flag
    setTimeout(() => {
        self.postMessage({ correlationId, type: 'DONE' });
    }, 2900);
};

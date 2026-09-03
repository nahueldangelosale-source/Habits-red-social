export interface TelemetryPayload {
    CGM_Daily_CV?: number;
    Glucose_Postprandial?: number;
    Stress_Score?: number;
    HRV_Drop_Percentage?: number;
    Deep_Sleep_Minutes?: number;
    Total_Sleep_Hours?: number;
}

export interface CognitiveTranslationObject {
    biomarker: string;
    raw_value: number;
    status: 'High' | 'Low' | 'Optimal';
    professional_view: {
        diagnosis: string;
        ui_directive: string;
    };
    patient_view: {
        pedagogical_copy: string;
        education_pill: string;
        actionable_habit: string;
    };
}

/**
 * 🌿 CognitiveTranslatorService
 * Transforma métricas crudas en "Narrativas Pre-digeridas" aplicando la pedagogía del OVS 1b (Lienzo Longevidad).
 * Actúa como interceptor asíncrono en Fastify antes de enviar el payload al cliente.
 */
export class CognitiveTranslatorService {

    public static evaluateTelemetry(data: TelemetryPayload): CognitiveTranslationObject[] {
        const translations: CognitiveTranslationObject[] = [];

        // Nodo 1: Inestabilidad Glucémica (Fatiga Postprandial)
        if ((data.CGM_Daily_CV && data.CGM_Daily_CV > 25) || (data.Glucose_Postprandial && data.Glucose_Postprandial > 140)) {
            const rawValue = data.CGM_Daily_CV ? data.CGM_Daily_CV : data.Glucose_Postprandial!;
            translations.push({
                biomarker: 'glycemic_instability',
                raw_value: rawValue,
                status: 'High',
                professional_view: {
                    diagnosis: 'Alta variabilidad glucémica o hipoglucemia reactiva detectada. Sugerencia: Reestructuración de macros post-entreno.',
                    ui_directive: 'risk-high'
                },
                patient_view: {
                    pedagogical_copy: 'Notamos que tu energía está en una montaña rusa hoy. Es completamente normal sentir niebla mental, fatiga repentina o antojos de dulce después de fluctuaciones tan rápidas de glucosa en la sangre.',
                    education_pill: 'Los picos pronunciados ocurren cuando los carbohidratos entran al torrente sanguíneo sin un "freno". Al consumir almidones o azúcares aislados, el cuerpo libera una ola de insulina que luego causa un bajón brusco, robándote la energía.',
                    actionable_habit: 'Aplica la regla del orden: En tu próxima comida, consume primero la fibra (vegetales) y las proteínas, dejando los carbohidratos para el final. Esto aplana la curva de glucosa.'
                }
            });
        }

        // Nodo 2: Carga Alostática Alta (Dominancia Simpática / Cortisol)
        if ((data.Stress_Score && data.Stress_Score > 70) || (data.HRV_Drop_Percentage && data.HRV_Drop_Percentage > 15)) {
            const rawValue = data.Stress_Score ? data.Stress_Score : data.HRV_Drop_Percentage!;
            translations.push({
                biomarker: 'allostatic_load',
                raw_value: rawValue,
                status: 'High',
                professional_view: {
                    diagnosis: 'Dominancia simpática sostenida. Riesgo de fatiga suprarrenal y resistencia a la insulina inducida por estrés.',
                    ui_directive: 'clinical-accent'
                },
                patient_view: {
                    pedagogical_copy: 'Tu sistema nervioso nos indica que tu cuerpo está trabajando horas extras, incluso en reposo. No es falta de voluntad si hoy te sientes abrumado; es tu biología pidiendo una pausa estratégica.',
                    education_pill: 'El estrés prolongado eleva el cortisol. Esta hormona de supervivencia le ordena a tu hígado producir más glucosa y bloquea la acción de la insulina, frenando la quema de grasa.',
                    actionable_habit: 'Activación parasimpática. Tómate 2 minutos para realizar respiración diafragmática (Box Breathing) para salir del estado de alerta, y evita snacks azucarados.'
                }
            });
        }

        // Nodo 3: Deuda de Recuperación (Déficit de Sueño Profundo)
        if ((data.Deep_Sleep_Minutes && data.Deep_Sleep_Minutes < 45) || (data.Total_Sleep_Hours && data.Total_Sleep_Hours < 6)) {
            const rawValue = data.Deep_Sleep_Minutes ? data.Deep_Sleep_Minutes : data.Total_Sleep_Hours!;
            translations.push({
                biomarker: 'recovery_debt',
                raw_value: rawValue,
                status: 'Low', // Low sleep
                professional_view: {
                    diagnosis: 'Déficit crítico de sueño de ondas lentas (SWS). Riesgo de supresión de leptina y elevación de grelina.',
                    ui_directive: 'clinical-muted'
                },
                patient_view: {
                    pedagogical_copy: 'Tu batería de recuperación celular no logró cargarse anoche. Hoy tu cuerpo será temporalmente menos tolerante a los azúcares y sentirás más hambre de lo habitual. Estamos aquí para compensarlo.',
                    education_pill: 'La falta de sueño altera las hormonas del apetito: eleva la grelina (hambre) y suprime la leptina (saciedad). Induce resistencia temporal a la insulina.',
                    actionable_habit: 'Recalibración automática: Hemos reducido invisiblemente tus carbohidratos de hoy en un 20%. Suma 5g extra de fibra en tu desayuno y mantén luz solar directa esta mañana.'
                }
            });
        }

        return translations;
    }
}

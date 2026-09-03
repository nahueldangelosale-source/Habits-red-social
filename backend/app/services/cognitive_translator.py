from typing import List, Dict
from app.schemas.clinical import CognitiveTranslationPayload, ProfessionalView, PatientView

class CognitiveTranslatorService:
    @staticmethod
    def evaluate_telemetry(data: Dict[str, float]) -> List[CognitiveTranslationPayload]:
        translations = []
        
        # Extract telemetry data safely
        cgm_daily_cv = data.get("CGM_Daily_CV")
        glucose_postprandial = data.get("Glucose_Postprandial")
        stress_score = data.get("Stress_Score")
        hrv_drop_percentage = data.get("HRV_Drop_Percentage")
        deep_sleep_minutes = data.get("Deep_Sleep_Minutes")
        total_sleep_hours = data.get("Total_Sleep_Hours")

        # Nodo 1: Inestabilidad Glucémica
        if (cgm_daily_cv and cgm_daily_cv > 25) or (glucose_postprandial and glucose_postprandial > 140):
            raw_value = cgm_daily_cv if cgm_daily_cv else glucose_postprandial
            translations.append(CognitiveTranslationPayload(
                biomarker='glycemic_instability',
                raw_value=raw_value,
                status='High',
                professional_view=ProfessionalView(
                    diagnosis='Alta variabilidad glucémica o hipoglucemia reactiva detectada. Sugerencia: Reestructuración de macros post-entreno.',
                    ui_directive='risk-high'
                ),
                patient_view=PatientView(
                    pedagogical_copy='Notamos que tu energía está en una montaña rusa hoy. Es completamente normal sentir niebla mental, fatiga repentina o antojos de dulce después de fluctuaciones tan rápidas de glucosa en la sangre.',
                    education_pill='Los picos pronunciados ocurren cuando los carbohidratos entran al torrente sanguíneo sin un "freno". Al consumir almidones o azúcares aislados, el cuerpo libera una ola de insulina que luego causa un bajón brusco, robándote la energía.',
                    actionable_habit='Aplica la regla del orden: En tu próxima comida, consume primero la fibra (vegetales) y las proteínas, dejando los carbohidratos para el final. Esto aplana la curva de glucosa.'
                )
            ))
            
        # Nodo 2: Carga Alostática Alta
        if (stress_score and stress_score > 70) or (hrv_drop_percentage and hrv_drop_percentage > 15):
            raw_value = stress_score if stress_score else hrv_drop_percentage
            translations.append(CognitiveTranslationPayload(
                biomarker='allostatic_load',
                raw_value=raw_value,
                status='High',
                professional_view=ProfessionalView(
                    diagnosis='Dominancia simpática sostenida. Riesgo de fatiga suprarrenal y resistencia a la insulina inducida por estrés.',
                    ui_directive='clinical-accent'
                ),
                patient_view=PatientView(
                    pedagogical_copy='Tu sistema nervioso nos indica que tu cuerpo está trabajando horas extras, incluso en reposo. No es falta de voluntad si hoy te sientes abrumado; es tu biología pidiendo una pausa estratégica.',
                    education_pill='El estrés prolongado eleva el cortisol. Esta hormona de supervivencia le ordena a tu hígado producir más glucosa y bloquea la acción de la insulina, frenando la quema de grasa.',
                    actionable_habit='Activación parasimpática. Tómate 2 minutos para realizar respiración diafragmática (Box Breathing) para salir del estado de alerta, y evita snacks azucarados.'
                )
            ))
            
        # Nodo 3: Deuda de Recuperación
        if (deep_sleep_minutes and deep_sleep_minutes < 45) or (total_sleep_hours and total_sleep_hours < 6):
            raw_value = deep_sleep_minutes if deep_sleep_minutes else total_sleep_hours
            translations.append(CognitiveTranslationPayload(
                biomarker='recovery_debt',
                raw_value=raw_value,
                status='Low',
                professional_view=ProfessionalView(
                    diagnosis='Déficit crítico de sueño de ondas lentas (SWS). Riesgo de supresión de leptina y elevación de grelina.',
                    ui_directive='clinical-muted'
                ),
                patient_view=PatientView(
                    pedagogical_copy='Tu batería de recuperación celular no logró cargarse anoche. Hoy tu cuerpo será temporalmente menos tolerante a los azúcares y sentirás más hambre de lo habitual. Estamos aquí para compensarlo.',
                    education_pill='La falta de sueño altera las hormonas del apetito: eleva la grelina (hambre) y suprime la leptina (saciedad). Induce resistencia temporal a la insulina.',
                    actionable_habit='Recalibración automática: Hemos reducido invisiblemente tus carbohidratos de hoy en un 20%. Suma 5g extra de fibra en tu desayuno y mantén luz solar directa esta mañana.'
                )
            ))
            
        return translations

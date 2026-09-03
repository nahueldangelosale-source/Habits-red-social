import { z } from 'zod';
import { logger } from '../../../shared/lib/telemetry';

// Strict validation bounded to Athlete Domain
export const AcwrPayloadSchema = z.object({
  athleteId: z.string(),
  acuteLoad: z.number().positive(),
  chronicLoad: z.number().positive()
});

export type IAcwrPayload = z.infer<typeof AcwrPayloadSchema>;

export class AcwrGuardrail {
  /**
   * Intercepts AI-generated routines or workload submissions.
   * Ensures the Acute:Chronic Workload Ratio (ACWR) does not exceed 1.50 (Injury Danger Zone).
   */
  public static validateWorkload(payload: IAcwrPayload): void {
    // Zero Trust incoming payload validation
    AcwrPayloadSchema.parse(payload);

    const acwr = payload.acuteLoad / payload.chronicLoad;
    
    if (acwr > 1.50) {
      logger.genAiEvent({
        system: 'athlete-acwr-guardrail',
        action: 'guardrail_tripped',
        status: 'failed',
        metadata: { ...payload, calculatedAcwr: acwr, reason: 'High injury risk threshold exceeded' }
      });
      
      // Forces the system (or AI) to fallback to recovery mechanisms
      throw new Error(`[ACWR_VIOLATION] Ratio actual: ${acwr.toFixed(2)}. Peligro inminente de lesión estructural. Reencaminando a protocolo de estiramiento/recuperación obligatoria.`);
    }

    logger.log('info', `[ACWR Guardrail] Carga permitida (Ratio: ${acwr.toFixed(2)})`);
  }
}

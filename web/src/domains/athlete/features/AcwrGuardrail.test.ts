import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { AcwrGuardrail, IAcwrPayload } from './AcwrGuardrail';

describe('AcwrGuardrail - Property-Based Testing (PBT)', () => {
  it('Debería aceptar cargas con un ratio ACWR <= 1.50 para cualquier entrada generativa', () => {
    // Generamos miles de entradas aleatorias pero válidas para la propiedad
    fc.assert(
      fc.property(
        fc.record({
          athleteId: fc.uuid(),
          acuteLoad: fc.float({ min: 1, max: 10000 }),
          chronicLoad: fc.float({ min: 1, max: 10000 })
        }),
        (payload: IAcwrPayload) => {
          // Pre-condición: El ratio generado aleatoriamente debe ser <= 1.50
          fc.pre(payload.acuteLoad / payload.chronicLoad <= 1.50);

          // Ejecución: El guardrail no debe lanzar ninguna excepción
          expect(() => AcwrGuardrail.validateWorkload(payload)).not.toThrow();
        }
      ),
      { numRuns: 1000 } // 1000 aserciones aleatorias por el agente de QA
    );
  });

  it('Debería rechazar (interceptar) cargas con un ratio ACWR > 1.50 para cualquier entrada generativa', () => {
    fc.assert(
      fc.property(
        fc.record({
          athleteId: fc.uuid(),
          acuteLoad: fc.float({ min: 151, max: 20000 }),
          chronicLoad: fc.float({ min: 1, max: 100 })
        }),
        (payload: IAcwrPayload) => {
          // Pre-condición: El ratio es definitivamente mayor a 1.50
          fc.pre(payload.acuteLoad / payload.chronicLoad > 1.50);

          // Ejecución: El guardrail DEBE lanzar el error de violación ACWR
          expect(() => AcwrGuardrail.validateWorkload(payload)).toThrow(/ACWR_VIOLATION/);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Zero-Touch Immunity Probe (Falsification Trap)
  // El DTG detectará mutaciones caóticas generadas por este test
  it('Zero Trust: Debe rechazar cargas crónicas negativas o nulas (Cuidado con Infinity/NaN)', () => {
    fc.assert(
      fc.property(
        fc.record({
          athleteId: fc.string(),
          acuteLoad: fc.float(),
          // Se inyecta caos intencional para verificar que Zod o el código contenga el fallo
          chronicLoad: fc.constantFrom(0, -1, -100, NaN) 
        }),
        (payload) => {
          // El esquema de Zod en AcwrGuardrail.ts debería interceptar estas entradas inválidas
          expect(() => AcwrGuardrail.validateWorkload(payload as IAcwrPayload)).toThrow();
        }
      )
    );
  });
});

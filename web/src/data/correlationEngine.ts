/**
 * correlationEngine.ts
 * Motor de Telemetría Acoplada (ACWR EWMA + HRV Z-Score)
 */

export interface DailyTelemetry {
  dateIso: string;
  trainingLoadTotal: number; // (sRPE * duration) o estrés mecánico (TSS)
  morningRmssdRaw: number;   // ms
}

export interface AutonomicReadiness {
  acwrEwma: number;
  hrvZScore: number;
  smallestWorthwhileChange: number;
  readinessStatus: 'Alto' | 'Precaución' | 'Óptimo' | 'Baja' | 'Datos Insuficientes';
  prescriptiveZones: {
    aerobicThresholdVT1: number;
    anaerobicThresholdVT2: number;
  };
}

export class CorrelationEngine {
  // Constantes de decaimiento para N=7 y N=28
  private static readonly LAMBDA_ACUTE = 2 / (7 + 1);   // 0.25
  private static readonly LAMBDA_CHRONIC = 2 / (28 + 1); // 0.0689

  /**
   * Cálculo recursivo de la Media Móvil Exponencialmente Ponderada
   */
  private static calculateEWMA(data: DailyTelemetry[]): { ewmaAcute: number, ewmaChronic: number } {
    let ewmaAcute = data[0].trainingLoadTotal;
    let ewmaChronic = data[0].trainingLoadTotal;

    for (let i = 1; i < data.length; i++) {
      const load = data[i].trainingLoadTotal;
      ewmaAcute = (load * this.LAMBDA_ACUTE) + (ewmaAcute * (1 - this.LAMBDA_ACUTE));
      ewmaChronic = (load * this.LAMBDA_CHRONIC) + (ewmaChronic * (1 - this.LAMBDA_CHRONIC));
    }
    
    return { ewmaAcute, ewmaChronic };
  }

  /**
   * Extracción de estadísticas logarítmicas de la serie de HRV
   */
  private static calculateLogHRV(data: DailyTelemetry[]) {
    // Transformación logarítmica exigida por la fisiología autonómica
    const lnSeries = data.map(d => Math.log(Math.max(d.morningRmssdRaw, 1))); // Evitar log(0)
    
    const acuteLn = lnSeries.slice(-7);
    const meanAcute = acuteLn.reduce((acc, val) => acc + val, 0) / (acuteLn.length || 1);

    const chronicLn = lnSeries.slice(-30);
    const meanChronic = chronicLn.reduce((acc, val) => acc + val, 0) / (chronicLn.length || 1);
    
    const variance = chronicLn.reduce((sum, val) => sum + Math.pow(val - meanChronic, 2), 0) / (chronicLn.length || 1);
    const stdDevChronic = Math.sqrt(variance);

    const swc = 0.5 * stdDevChronic;
    const zScore = stdDevChronic > 0 ? (meanAcute - meanChronic) / stdDevChronic : 0;

    return { zScore, swc };
  }

  /**
   * Evaluación Bidireccional Expuesta a Bienestar APP
   */
  public static evaluateReadiness(
    telemetryHistory: DailyTelemetry[], 
    athleteFTP: number
  ): AutonomicReadiness {
    
    // El modelo requiere densidad de datos para un Z-score robusto
    if (telemetryHistory.length < 7) {
      return {
        acwrEwma: 0, hrvZScore: 0, smallestWorthwhileChange: 0,
        readinessStatus: 'Datos Insuficientes',
        prescriptiveZones: { aerobicThresholdVT1: 0, anaerobicThresholdVT2: 0 }
      };
    }

    const { ewmaAcute, ewmaChronic } = this.calculateEWMA(telemetryHistory);
    const acwr = ewmaChronic > 0 ? (ewmaAcute / ewmaChronic) : 0;
    
    const { zScore, swc } = this.calculateLogHRV(telemetryHistory);

    // Motor Lógico Bidireccional
    let status: AutonomicReadiness['readinessStatus'] = 'Óptimo';
    
    if (acwr > 1.5 && zScore <= -1.5) {
      status = 'Alto';
    } else if ((acwr > 1.5 && zScore > -1.5) || (acwr >= 0.8 && acwr <= 1.3 && zScore <= -1.5)) {
      status = 'Precaución';
    } else if (acwr >= 0.8 && acwr <= 1.3 && Math.abs(zScore) <= 0.5) {
      status = 'Óptimo';
    } else if (acwr < 0.8 && zScore > 0.5) {
      status = 'Baja';
    }

    return {
      acwrEwma: parseFloat(acwr.toFixed(2)),
      hrvZScore: parseFloat(zScore.toFixed(2)),
      smallestWorthwhileChange: parseFloat(swc.toFixed(2)),
      readinessStatus: status,
      prescriptiveZones: {
        aerobicThresholdVT1: Math.round(athleteFTP * 0.75),
        anaerobicThresholdVT2: Math.round(athleteFTP * 0.95)
      }
    };
  }
}

/**
 * acwrEngine.ts
 * Acute:Chronic Workload Ratio (ACWR) via Exponentially Weighted Moving Average (EWMA)
 * 
 * Implementa el estándar de oro en prevención de lesiones y monitorización de carga,
 * superando a la media móvil simple (SMA) al dar mayor peso a la carga reciente.
 */

// Constantes de decaimiento (Time Constants)
const ACUTE_DAYS = 7;
const CHRONIC_DAYS = 28;

const LAMBDA_ACUTE = 2 / (ACUTE_DAYS + 1);
const LAMBDA_CHRONIC = 2 / (CHRONIC_DAYS + 1);

export interface DailyLoad {
    date: string; // YYYY-MM-DD
    volumeLoad: number; // Tonnage o Arbitrary Units (RPE x Duración)
}

export interface ACWRResult {
    date: string;
    acuteEWMA: number;
    chronicEWMA: number;
    acwr: number;
    zone: 'SWEET_SPOT' | 'DANGER_ZONE' | 'UNDERTRAINING' | 'TRANSITION';
}

/**
 * Determina la zona de riesgo biomecánico/fisiológico según el ACWR.
 * Basado en Gabbett et al. (2016).
 */
export function determineACWRZone(acwr: number): ACWRResult['zone'] {
    if (acwr < 0.8) return 'UNDERTRAINING';
    if (acwr >= 0.8 && acwr <= 1.3) return 'SWEET_SPOT';
    if (acwr > 1.3 && acwr < 1.5) return 'TRANSITION';
    return 'DANGER_ZONE';
}

/**
 * Calcula la progresión EWMA ACWR para una serie temporal de cargas diarias.
 * Asume que el array `dailyLoads` está ordenado cronológicamente.
 */
export function calculateEWMA(dailyLoads: DailyLoad[]): ACWRResult[] {
    const results: ACWRResult[] = [];
    
    if (dailyLoads.length === 0) return results;

    // Inicializamos las EWMAs con el primer valor de carga
    let currentAcute = dailyLoads[0].volumeLoad;
    let currentChronic = dailyLoads[0].volumeLoad;

    results.push({
        date: dailyLoads[0].date,
        acuteEWMA: currentAcute,
        chronicEWMA: currentChronic,
        acwr: currentChronic > 0 ? currentAcute / currentChronic : 0,
        zone: determineACWRZone(currentChronic > 0 ? currentAcute / currentChronic : 0)
    });

    for (let i = 1; i < dailyLoads.length; i++) {
        const load = dailyLoads[i].volumeLoad;

        currentAcute = (load * LAMBDA_ACUTE) + (currentAcute * (1 - LAMBDA_ACUTE));
        currentChronic = (load * LAMBDA_CHRONIC) + (currentChronic * (1 - LAMBDA_CHRONIC));
        
        const acwr = currentChronic > 0 ? currentAcute / currentChronic : 0;

        results.push({
            date: dailyLoads[i].date,
            acuteEWMA: currentAcute,
            chronicEWMA: currentChronic,
            acwr,
            zone: determineACWRZone(acwr)
        });
    }

    return results;
}

/**
 * Proyecta el ACWR resultante si se añade una nueva sesión hoy.
 * Útil para la Fricción Positiva en el Plan Builder.
 */
export function projectSessionImpact(
    currentChronicEWMA: number, 
    currentAcuteEWMA: number, 
    proposedSessionLoad: number
): ACWRResult {
    const projectedAcute = (proposedSessionLoad * LAMBDA_ACUTE) + (currentAcuteEWMA * (1 - LAMBDA_ACUTE));
    const projectedChronic = (proposedSessionLoad * LAMBDA_CHRONIC) + (currentChronicEWMA * (1 - LAMBDA_CHRONIC));
    
    const acwr = projectedChronic > 0 ? projectedAcute / projectedChronic : 0;

    return {
        date: new Date().toISOString().split('T')[0],
        acuteEWMA: projectedAcute,
        chronicEWMA: projectedChronic,
        acwr,
        zone: determineACWRZone(acwr)
    };
}

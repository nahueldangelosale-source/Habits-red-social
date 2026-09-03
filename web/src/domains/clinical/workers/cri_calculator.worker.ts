// CRI (Chronic Recovery Index) & ACWR (Acute:Chronic Workload Ratio) Calculator Worker
// Este archivo corre en un hilo separado para liberar el Main Thread (Event Loop Offloading)

export interface MathCalculationRequest {
    uuid: string;
    athleteId: string;
    acuteLoad: number;
    chronicLoad: number;
    hrvSequence: number[]; // For entropy calculation
}

export interface MathCalculationResponse {
    uuid: string;
    athleteId: string;
    acwr: number;
    entropy: number;
    criScore: number;
    riskStatus: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    timestamp: number;
}

// Simulador de carga pesada síncrona (O(N) o superior) para justificar el worker
function calculateSampleEntropy(sequence: number[], m: number = 2, r: number = 0.2): number {
    // Artificial delay to simulate heavy physiological signal processing
    const start = Date.now();
    while (Date.now() - start < 150) {
        // Bloqueo sincrónico intencional simulando matemática compleja
    }
    
    // Fake entropy calculation for demo purposes
    const variance = sequence.reduce((acc, val) => acc + val, 0) / sequence.length;
    return Number((Math.random() * 2 + (variance % 1)).toFixed(3));
}

self.onmessage = (e: MessageEvent<MathCalculationRequest>) => {
    const { uuid, athleteId, acuteLoad, chronicLoad, hrvSequence } = e.data;

    try {
        const acwr = Number((acuteLoad / chronicLoad).toFixed(2));
        
        // Heavy Math (Offloaded from Main Thread)
        const entropy = calculateSampleEntropy(hrvSequence);
        
        // CRI combines ACWR and Entropy
        const criScore = Number(((acwr * 0.6) + (entropy * 0.4)).toFixed(2));
        
        let riskStatus: MathCalculationResponse['riskStatus'] = 'LOW';
        if (acwr > 1.5) riskStatus = 'CRITICAL';
        else if (acwr > 1.3) riskStatus = 'HIGH';
        else if (acwr > 1.1) riskStatus = 'MODERATE';

        const response: MathCalculationResponse = {
            uuid,
            athleteId,
            acwr,
            entropy,
            criScore,
            riskStatus,
            timestamp: Date.now()
        };

        self.postMessage({ type: 'SUCCESS', payload: response });
    } catch (error) {
        self.postMessage({ type: 'ERROR', uuid, error: String(error) });
    }
};

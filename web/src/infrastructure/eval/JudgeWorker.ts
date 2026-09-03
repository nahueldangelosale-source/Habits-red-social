export interface EvaluationCriteria {
    accuracy: number;
    latencyMs: number;
    hallucinationDetected: boolean;
    styleMatched: boolean;
}

export interface EvaluationResult {
    passed: boolean;
    score: number;
    feedback: string;
}

export class JudgeWorker {
    private strictMode: boolean;

    constructor(strictMode: boolean = true) {
        this.strictMode = strictMode;
        console.log(`[JudgeWorker] Initialized. Strict Mode: ${this.strictMode}`);
    }

    public evaluate(criteria: EvaluationCriteria): EvaluationResult {
        let score = 100;
        const penalties: string[] = [];

        if (criteria.accuracy < 0.95) {
            score -= (1 - criteria.accuracy) * 100 * 2;
            penalties.push('Low accuracy');
        }

        if (criteria.latencyMs > 2000) {
            score -= 10;
            penalties.push('High latency');
        }

        if (criteria.hallucinationDetected) {
            score -= 50;
            penalties.push('Hallucination detected');
        }

        if (this.strictMode && !criteria.styleMatched) {
            score -= 20;
            penalties.push('Style mismatch');
        }

        const passed = score >= 80;

        return {
            passed,
            score: Math.max(0, Math.round(score)),
            feedback: passed ? 'Passed all quality gates.' : `Failed quality gates. Penalties: ${penalties.join(', ')}`
        };
    }
}

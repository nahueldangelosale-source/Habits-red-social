import { create } from 'zustand';

interface TelemetryMetrics {
    current_hr: number;
    hr_zone: number;
    fatigue_index: number;
    o2_sat: number;
    block_compliance: number;
    recovery_rate_bpm: number;
}

interface BiometricState {
    timestamp: string;
    athlete_id: string;
    session_type: string;
    metrics: TelemetryMetrics;
    ui_state_directive: string;
    
    // Actions
    updateTelemetry: (payload: Partial<BiometricState>) => void;
}

export const useBiometricStore = create<BiometricState>((set) => ({
    timestamp: '',
    athlete_id: '',
    session_type: 'WARMUP',
    metrics: {
        current_hr: 0,
        hr_zone: 1,
        fatigue_index: 0,
        o2_sat: 99,
        block_compliance: 0,
        recovery_rate_bpm: 0
    },
    ui_state_directive: 'STANDARD',
    
    updateTelemetry: (payload) => set((state) => ({
        ...state,
        ...payload,
        metrics: {
            ...state.metrics,
            ...(payload.metrics || {})
        }
    }))
}));

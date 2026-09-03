import { create } from 'zustand';

interface CanaryState {
  isShatteringGlassEnabled: boolean;
  isShadowMode: boolean;
  performanceThresholdMs: number;
  setCanaryConfig: (config: Partial<CanaryState>) => void;
  disableDueToPerformance: () => void;
}

export const useCanaryStore = create<CanaryState>((set) => ({
  // Default fallback
  isShatteringGlassEnabled: true,
  isShadowMode: false,
  performanceThresholdMs: 300,

  setCanaryConfig: (config) => set((state) => ({ ...state, ...config })),
  
  // Local Circuit Breaker (Main Thread Kill)
  disableDueToPerformance: () => {
    set({ isShatteringGlassEnabled: false });
    // Emit telemetry immediately
    if (typeof window !== 'undefined') {
      console.warn('[Canary Breaker] Shattering Glass disabled due to high INP latency.');
      // Simulating telemetry API call to OTel / Backend
      fetch('/api/v1/telemetry/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'canary_circuit_breaker',
          reason: 'MAIN_THREAD_LATENCY_EXCEEDED',
          timestamp: new Date().toISOString()
        })
      }).catch(console.error);
    }
  }
}));

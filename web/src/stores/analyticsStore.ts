import { create } from 'zustand';

type EventName = 
  | 'POST_FRICTION_REVERSAL' 
  | 'HARD_KILL' 
  | 'BAIL_OUT_TIME';

interface AnalyticsState {
  track: (eventName: EventName, payload?: Record<string, any>) => void;
}

export const useAnalyticsStore = create<AnalyticsState>(() => ({
  track: (eventName, payload) => {
    // ConsoleLogger strategy for now. Avoids premature scaling.
    // If the Positive Friction hypothesis is validated, we will inject PostHog/Mixpanel here.
    const timestamp = new Date().toISOString();
    
    // Formatting the output for easy reading in the console during tests
    console.group(`[TELEMETRY] 🚀 ${eventName}`);
    console.log(`Time: ${timestamp}`);
    if (payload) {
      console.log('Payload:', payload);
    }
    console.groupEnd();
  }
}));

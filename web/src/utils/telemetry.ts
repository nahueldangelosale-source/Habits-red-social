import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

interface TelemetryDB extends DBSchema {
  events: {
    key: number;
    value: {
      id?: number;
      event_name: string;
      payload: any;
      timestamp: string;
    };
  };
}

const DB_NAME = 'telemetry-queue-db';
const STORE_NAME = 'events';

let dbPromise: Promise<IDBPDatabase<TelemetryDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<TelemetryDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

async function saveToQueue(event_name: string, payload: any) {
  if (!dbPromise) return;
  try {
    const db = await dbPromise;
    await db.add(STORE_NAME, {
      event_name,
      payload,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to save telemetry to IndexedDB', e);
  }
}

async function flushQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  if (!dbPromise) return;

  try {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const events = await store.getAll();

    if (events.length === 0) return;

    for (const event of events) {
      try {
        const response = await fetch('/api/v1/telemetry/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_name: event.event_name,
            payload: event.payload
          })
        });

        if (response.ok && event.id) {
           await store.delete(event.id);
        } else if (response.status >= 400 && response.status < 500) {
           // Drop client errors to avoid infinite retry loops
           if (event.id) {
             await store.delete(event.id);
           }
        }
      } catch (error) {
         // Network error, stop flushing and try again later
         console.warn('Telemetry queue flush interrupted due to network error');
         break;
      }
    }
  } catch (e) {
    console.error('Failed to flush telemetry queue', e);
  }
}

// Setup background sync and listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', flushQueue);
  // Attempt to flush every 5 minutes
  setInterval(flushQueue, 5 * 60 * 1000);
}

async function emitWithQueue(eventName: string, payload: any) {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await saveToQueue(eventName, payload);
      return;
    }

    const response = await fetch('/api/v1/telemetry/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_name: eventName,
        payload
      })
    });

    if (!response.ok) {
      console.warn(`Telemetry ingestion dropped event for ${eventName}`, response.status);
      if (response.status >= 500) {
        await saveToQueue(eventName, payload);
      }
    }
  } catch (error) {
    console.warn(`Failed to emit ${eventName} event, queueing locally`, error);
    await saveToQueue(eventName, payload);
  }
}

export interface RecoverySliderInteractionPayload {
  athlete_id: string;
  timestamp_rendered: string;
  ttc_ms: number;
  bounced: boolean;
  recovery_value: number;
}

export const emitRecoverySliderInteraction = async (payload: RecoverySliderInteractionPayload): Promise<void> => {
  await emitWithQueue('recovery_slider_interaction', payload);
};

export const emitStripeConnectIntent = async (pt_id: string): Promise<void> => {
  await emitWithQueue('pt_stripe_connect_intent', {
    pt_id,
    timestamp: new Date().toISOString()
  });
};

export interface MRVSoftCapOverridePayload {
  expected_max: number;
  user_value: number;
  experience_level: string;
}

export const emitMRVSoftCapOverride = async (payload: MRVSoftCapOverridePayload): Promise<void> => {
  await emitWithQueue('mrv_soft_cap_override', {
    ...payload,
    timestamp: new Date().toISOString()
  });
};

export const emitACWRProjectionViewed = async (athleteId: string, acwrValue: number): Promise<void> => {
  await emitWithQueue('acwr_projection_viewed', {
    athlete_id: athleteId,
    acwr_value: acwrValue,
    timestamp: new Date().toISOString()
  });
};

export const emitCoachVolumeAdjusted = async (athleteId: string, secondsToAdjust: number, newAcwr: number): Promise<void> => {
  await emitWithQueue('coach_volume_adjusted', {
    athlete_id: athleteId,
    seconds_to_adjust: secondsToAdjust,
    new_acwr: newAcwr,
    timestamp: new Date().toISOString()
  });
};

export interface SignatureEventPayload {
  time_to_first_stroke: number;
  completion_status: boolean;
  is_routine_locked: boolean;
}

export const emitSignatureEvent = async (payload: SignatureEventPayload): Promise<void> => {
  await emitWithQueue('signature_event', {
    ...payload,
    timestamp: new Date().toISOString()
  });
};

export const emitOnboardingStepViewed = async (stepName: string, clientType: string = "atleta"): Promise<void> => {
  await emitWithQueue('onboarding_step_viewed', {
    step_name: stepName,
    client_type: clientType,
    timestamp: new Date().toISOString()
  });
};

export const emitOnboardingStepCompleted = async (stepName: string, timeSpentMs: number): Promise<void> => {
  await emitWithQueue('onboarding_step_completed', {
    step_name: stepName,
    time_spent_ms: timeSpentMs,
    timestamp: new Date().toISOString()
  });
};

export const emitOnboardingDropOff = async (stepName: string): Promise<void> => {
  await emitWithQueue('onboarding_drop_off', {
    step_name: stepName,
    timestamp: new Date().toISOString()
  });
};

// Initial flush attempt when module loads
if (typeof window !== 'undefined') {
  setTimeout(flushQueue, 1000);
}

// Mindset Sanctuary Telemetry
export const emitSanctuaryEntered = (payload: any = {}) => {
  emitWithQueue('SANCTUARY_ENTERED', payload);
  console.log('[TELEMETRY] SANCTUARY_ENTERED', payload);
};

export const emitPostFrictionReversalSuccess = (payload: any = {}) => {
  emitWithQueue('POST_FRICTION_REVERSAL_SUCCESS', payload);
  console.log('[TELEMETRY] POST_FRICTION_REVERSAL: SUCCESS', payload);
};

export const emitSanctuaryHardKill = (payload: any = {}) => {
  emitWithQueue('SANCTUARY_HARD_KILL', payload);
  console.log('[TELEMETRY] SANCTUARY_HARD_KILL', payload);
};

// web/src/services/offlineSync.ts
// ─────────────────────────────────────────────────────────────────
// Fase 13: Reescritura del Outbox — Delegación a IndexedDB
//
// INTERFAZ PÚBLICA PRESERVADA (zero breaking changes):
//   - QueuedSet (type)
//   - enqueueSet(set) → void
//   - flushOfflineQueue(apiFn) → void
//   - getAndClearQueue() → QueuedSet[] (deprecated, mantiene compat)
//
// Internamente, todo delega a offlineDb.ts (IndexedDB).
// ─────────────────────────────────────────────────────────────────

import {
  enqueueSetToIDB,
  flushOutboxFromIDB,
  migrateFromLocalStorage,
  type QueuedSetIDB
} from './offlineDb';

// ── Interfaz pública preservada ──────────────────────────────────

export interface QueuedSet {
  exercise_id: string;
  target_reps: number;
  target_weight: number;
  actual_reps: number;
  actual_weight: number;
  rpe?: number;
  client_created_at: string; // ISO 8601 guardado exacto en el momento del click
  idempotency_key: string;
  protocol_id: string;
}

// ── Migración automática al importar ─────────────────────────────
// Se ejecuta una sola vez al cargar el módulo.
// Si hay datos legacy en localStorage, los mueve a IndexedDB.
let migrationDone = false;
async function ensureMigration() {
  if (migrationDone) return;
  migrationDone = true;
  await migrateFromLocalStorage();
}

// ── API pública ──────────────────────────────────────────────────

/**
 * Añade un set a la cola offline (IndexedDB).
 * Retrocompatible con la interfaz anterior de localStorage.
 */
export async function enqueueSet(set_data: QueuedSet): Promise<void> {
  await ensureMigration();
  await enqueueSetToIDB(set_data);
}

/**
 * Bulk-sync disparado por el evento 'online'.
 * Itera la cola en IndexedDB y postea secuencialmente con retry.
 */
export async function flushOfflineQueue(
  api_post_fn: (set: QueuedSet) => Promise<any>
): Promise<{ synced: number; failed: number }> {
  await ensureMigration();

  return flushOutboxFromIDB(async (idbSet: QueuedSetIDB) => {
    // Mapear el formato IDB al formato de la API
    const apiPayload: QueuedSet = {
      exercise_id: idbSet.exercise_id,
      target_reps: idbSet.target_reps,
      target_weight: idbSet.target_weight,
      actual_reps: idbSet.actual_reps,
      actual_weight: idbSet.actual_weight,
      rpe: idbSet.rpe,
      client_created_at: idbSet.client_created_at,
      idempotency_key: idbSet.idempotency_key || idbSet.id, // Fallback to id for older sets
      protocol_id: idbSet.protocol_id
    };
    return api_post_fn(apiPayload);
  });
}

/**
 * @deprecated Mantiene retrocompatibilidad. Prefer flushOfflineQueue().
 * En la nueva arquitectura IDB, esta función retorna un array vacío
 * porque el flush se hace set-by-set con confirmación transaccional.
 */
export function getAndClearQueue(): QueuedSet[] {
  // Legacy: Intentar leer de localStorage por si acaso
  const LEGACY_KEY = 'bienestar_offline_sets_queue';
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return [];

  let queue: QueuedSet[] = [];
  try {
    queue = JSON.parse(raw);
  } catch (e) {
    console.error('[OfflineSync] Failed to parse legacy queue:', e);
  }

  localStorage.removeItem(LEGACY_KEY);
  return queue;
}

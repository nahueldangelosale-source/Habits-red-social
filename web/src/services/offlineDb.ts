// web/src/services/offlineDb.ts
// ─────────────────────────────────────────────────────────────────
// Fase 13: Capa de Persistencia Local Transaccional (IndexedDB)
//
// ESTRATEGIA DE MIGRACIÓN DE ESQUEMA:
// IndexedDB tiene versionamiento nativo. Cada vez que necesitemos
// añadir campos, stores o índices, incrementamos DB_VERSION y
// manejamos la migración dentro del callback `upgrade(db, oldVersion)`.
//
// Ejemplo futuro (Fase 14):
//   if (oldVersion < 2) {
//     const store = tx.objectStore('routineCache');
//     store.createIndex('byMuscleGroup', 'muscleGroup');
//   }
//
// Si el esquema cambia de forma incompatible, podemos hacer un
// `db.deleteObjectStore('routineCache')` seguido de `db.createObjectStore(...)`
// y la app simplemente refetcheará del servidor al próximo online.
// ─────────────────────────────────────────────────────────────────

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'bienestar-offline';
const DB_VERSION = 2;

// ── Tipos ────────────────────────────────────────────────────────

export interface QueuedSetIDB {
  id: string;           // UUID del cliente (idempotency key principal)
  exercise_id: string;
  target_reps: number;
  target_weight: number;
  actual_reps: number;
  actual_weight: number;
  rpe?: number;
  client_created_at: string; // ISO 8601
  idempotency_key?: string; // Mapeado desde QueuedSet
  protocol_id: string;
  retries: number;
}

export interface CachedRoutine {
  key: string;           // 'today'
  exercises: any[];      // RoutineExercise[] — loose typing para tolerancia de esquema
  cachedAt: number;      // Date.now() timestamp
  version: number;       // Para futuras migraciones de formato
}

// ── Singleton de la DB ───────────────────────────────────────────

let dbInstance: IDBPDatabase | null = null;

export async function initDb(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // ─── V1: Schema inicial ───
      if (oldVersion < 1) {
        // Outbox: Cola de mutaciones pendientes de sincronización
        db.createObjectStore('outbox', { keyPath: 'id' });

        // RoutineCache: Rutina del día persistida localmente
        db.createObjectStore('routineCache', { keyPath: 'key' });
      }

      // ─── V2: Offline Mutation Queue (TanStack Query) ───
      if (oldVersion < 2) {
        // QueryClientStore: Persistencia masiva del estado de TanStack Query
        // Usado como Key-Value store por el custom async persister.
        db.createObjectStore('queryClientStore');
      }
    },
  });

  return dbInstance;
}

// ── Routine Cache ────────────────────────────────────────────────

/**
 * Persiste la rutina completa del día en IndexedDB.
 * Envuelta en try/catch silencioso para tolerar Safari Private Mode
 * donde IndexedDB puede lanzar excepciones de cuota.
 */
export async function saveRoutineToLocal(exercises: any[]): Promise<void> {
  try {
    const db = await initDb();
    const record: CachedRoutine = {
      key: 'today',
      exercises,
      cachedAt: Date.now(),
      version: 1,
    };
    await db.put('routineCache', record);
  } catch (e) {
    // Silencioso: La persistencia local es best-effort.
    // Si falla (ej. Safari Private Mode), la app sigue funcionando
    // con la caché de TanStack Query en RAM.
    console.warn('[OfflineDB] Failed to cache routine locally:', e);
  }
}

/**
 * Recupera la rutina cacheada del día desde IndexedDB.
 * Retorna null si no existe o si ha expirado (>24h).
 */
export async function getLocalRoutine(): Promise<{ exercises: any[]; cachedAt: number } | null> {
  try {
    const db = await initDb();
    const record = await db.get('routineCache', 'today') as CachedRoutine | undefined;

    if (!record) return null;

    // TTL de 24 horas (directiva del CTO)
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    if (Date.now() - record.cachedAt > TWENTY_FOUR_HOURS) {
      // Caché expirado — limpiamos para evitar datos fantasma
      await db.delete('routineCache', 'today');
      return null;
    }

    return { exercises: record.exercises, cachedAt: record.cachedAt };
  } catch (e) {
    console.warn('[OfflineDB] Failed to read cached routine:', e);
    return null;
  }
}

// ── Outbox (Cola de Sets Pendientes) ─────────────────────────────

/**
 * Encola un set completado en IndexedDB (reemplaza localStorage).
 * Cada entrada tiene un UUID único para garantizar idempotencia
 * en caso de doble-flush.
 */
export async function enqueueSetToIDB(set: Omit<QueuedSetIDB, 'id' | 'retries'>): Promise<void> {
  try {
    const db = await initDb();
    const entry: QueuedSetIDB = {
      ...set,
      id: set.idempotency_key || crypto.randomUUID(), // Preferimos idempotency_key si viene
      retries: 0,
    };
    await db.add('outbox', entry);
    console.log(`[OfflineDB] Set enqueued. ID: ${entry.id}`);
  } catch (e) {
    // Fallback de emergencia: Si IndexedDB falla, usar localStorage
    console.error('[OfflineDB] IDB enqueue failed, falling back to localStorage:', e);
    const fallbackKey = 'bienestar_offline_sets_queue';
    const raw = localStorage.getItem(fallbackKey);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(set);
    localStorage.setItem(fallbackKey, JSON.stringify(queue));
  }
}

/**
 * Sincroniza todas las entradas del Outbox con el backend.
 * Usa transacciones atómicas: cada set se elimina del Outbox
 * solo DESPUÉS de la confirmación del servidor.
 */
export async function flushOutboxFromIDB(
  apiFn: (set: QueuedSetIDB) => Promise<any>
): Promise<{ synced: number; failed: number }> {
  try {
    const db = await initDb();
    const allSets = await db.getAll('outbox') as QueuedSetIDB[];

    if (allSets.length === 0) return { synced: 0, failed: 0 };

    console.log(`[OfflineDB] Flushing ${allSets.length} queued sets...`);

    let synced = 0;
    let failed = 0;
    
    const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000;
    const now = Date.now();

    for (const set of allSets) {
      // Purga de mutaciones estancadas (> 72hs)
      const createdAt = new Date(set.client_created_at).getTime();
      if (!isNaN(createdAt) && (now - createdAt > SEVENTY_TWO_HOURS)) {
        console.warn(`[OfflineDB] Set ${set.id} exceeded 72h TTL. Purging from local queue.`);
        try {
          const token = localStorage.getItem('token');
          await fetch('/api/v1/athlete/telemetry/dlq', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              event_type: "DLQ_TTL_EXPIRED",
              payload: set,
              stack_trace: "Dropped locally due to 72h TTL expiration without network connection."
            })
          });
        } catch (telemetryError) {
          console.error('[OfflineDB] Failed to send DLQ telemetry for expired TTL:', telemetryError);
        }
        await db.delete('outbox', set.id);
        continue;
      }

      try {
        await apiFn(set);
        // Solo borrar del outbox DESPUÉS del éxito del servidor
        await db.delete('outbox', set.id);
        synced++;
      } catch (e) {
        console.error(`[OfflineDB] Failed to sync set ${set.id}:`, e);
        // Incrementar contador de reintentos
        set.retries++;
        if (set.retries >= 5) {
          // Dead letter: después de 5 intentos, lo sacamos para no bloquear la cola
          console.error(`[OfflineDB] Set ${set.id} exceeded max retries. Dispatching to DLQ.`);
          
          try {
            const token = localStorage.getItem('token');
            await fetch('/api/v1/athlete/telemetry/dlq', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({
                event_type: "DLQ_SYNC_FAILURE",
                payload: set,
                stack_trace: e instanceof Error ? e.stack : String(e)
              })
            });
          } catch (telemetryError) {
            console.error('[OfflineDB] Failed to send DLQ telemetry:', telemetryError);
          }

          await db.delete('outbox', set.id);
        } else {
          await db.put('outbox', set);
        }
        failed++;
      }
    }

    console.log(`[OfflineDB] Flush complete. Synced: ${synced}, Failed: ${failed}`);
    return { synced, failed };
  } catch (e) {
    console.error('[OfflineDB] Flush failed:', e);
    return { synced: 0, failed: 0 };
  }
}

/**
 * Retorna el número de sets pendientes en el Outbox.
 */
export async function getOutboxCount(): Promise<number> {
  try {
    const db = await initDb();
    return await db.count('outbox');
  } catch {
    return 0;
  }
}

// ── Migración desde localStorage ─────────────────────────────────

/**
 * Migración one-shot: Si existen sets en localStorage del sistema
 * anterior, los mueve a IndexedDB y limpia localStorage.
 * Se ejecuta una sola vez al inicio de la app.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  const LEGACY_KEY = 'bienestar_offline_sets_queue';
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return;

    const legacySets = JSON.parse(raw);
    if (!Array.isArray(legacySets) || legacySets.length === 0) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }

    console.log(`[OfflineDB] Migrating ${legacySets.length} sets from localStorage to IndexedDB...`);

    const db = await initDb();
    const tx = db.transaction('outbox', 'readwrite');

    for (const set of legacySets) {
      await tx.store.add({
        ...set,
        id: crypto.randomUUID(),
        retries: 0,
      });
    }

    await tx.done;
    localStorage.removeItem(LEGACY_KEY);
    console.log('[OfflineDB] Migration complete.');
  } catch (e) {
    console.warn('[OfflineDB] localStorage migration failed (non-critical):', e);
  }
}

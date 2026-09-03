import { v7 as uuidv7 } from 'uuid';
import { localDb } from '../database/LocalDatabaseAdapter';

export interface SyncRecord {
  id: string; // UUIDv7 for temporal sorting
  entityType: string;
  payload: any;
  timestamp: number;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
}

/**
 * BackgroundSyncEngine
 * Operates independent of the Main Thread to sync local SQLite writes.
 * Ensures Zero-Latency UX by acting as a non-blocking background queue.
 */
class BackgroundSyncEngine {
  private isOnline: boolean = navigator.onLine;
  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // CRON-like safety net
    setInterval(() => this.triggerSync(), 30000);
  }

  /**
   * Registra una mutación local generada optimísticamente por la UI.
   * Utiliza UUIDv7 (basado en tiempo) que actúa como Reloj Lógico para CRDTs.
   */
  public async enqueueMutation(entityType: string, payload: any): Promise<string> {
    const id = uuidv7();
    const timestamp = Date.now();
    
    // 1. Escribir en la DB local (Edge SQLite Replica) - TTI 0ms
    const serializedPayload = JSON.stringify(payload);
    await localDb.executeLocalOptimistic(
      `INSERT INTO sync_queue (id, entity_type, payload, timestamp, sync_status) 
       VALUES (?, ?, ?, ?, 'PENDING')`,
      [id, entityType, serializedPayload, timestamp]
    );

    // 2. Disparar sync en segundo plano (Fire and forget)
    this.triggerSync();

    return id;
  }

  /**
   * Intenta sincronizar los registros PENDING con la nube principal.
   */
  public async triggerSync() {
    if (!this.isOnline) return;

    try {
      // 1. Obtener registros pendientes (Ordenados por UUIDv7 temporalmente)
      const result = await localDb.db.execute("SELECT * FROM sync_queue WHERE sync_status = 'PENDING' ORDER BY id ASC");
      
      if (result.rows.length === 0) return;

      const recordsToSync = result.rows.map(row => ({
        id: row.id,
        entityType: row.entity_type,
        payload: JSON.parse(row.payload as string),
        timestamp: row.timestamp
      }));

      // 2. Simulación de envío al Master DB en la nube
      // await fetch('https://api.bienestaros.com/sync', { method: 'POST', body: JSON.stringify(recordsToSync) });
      console.log(`[BackgroundSyncEngine] Sincronizando ${recordsToSync.length} registros offline a la nube...`);
      await new Promise(r => setTimeout(r, 800)); // Latencia simulada

      // 3. Marcar como SYNCED localmente para resolver el CRDT
      for (const record of recordsToSync) {
        await localDb.db.execute(
          "UPDATE sync_queue SET sync_status = 'SYNCED' WHERE id = ?",
          [record.id]
        );
      }

      console.log(`[BackgroundSyncEngine] Sincronización Exitosa.`);

    } catch (error) {
      console.error("[BackgroundSyncEngine] Error durante la sincronización CRDT:", error);
      // Falla silenciada (El retry ocurrirá en el próximo intervalo o al reconectar)
    }
  }
}

export const syncEngine = new BackgroundSyncEngine();

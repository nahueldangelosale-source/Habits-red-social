import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { initDb } from './offlineDb';

/**
 * Adaptador de almacenamiento para @tanstack/query-async-storage-persister
 * Delega en la versión 2 de offlineDb.ts (Store: queryClientStore) para 
 * evitar colisiones con la cola de Sets del atleta (outbox).
 */
const idbStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const db = await initDb();
      const val = await db.get('queryClientStore', key);
      return val ? val : null;
    } catch (e) {
      console.error('[tanstackPersister] Error en getItem', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const db = await initDb();
      await db.put('queryClientStore', value, key);
    } catch (e) {
      console.error('[tanstackPersister] Error en setItem', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      const db = await initDb();
      await db.delete('queryClientStore', key);
    } catch (e) {
      console.error('[tanstackPersister] Error en removeItem', e);
    }
  },
};

export const tanstackPersister = createAsyncStoragePersister({
  storage: idbStorage,
  // Configuraciones adicionales del persister se aplican en la instanciación principal
});

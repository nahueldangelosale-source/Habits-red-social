
import type { Client } from '@libsql/client';

import { getLocalDb } from '../../domains/core/localDb';

export class LocalDatabaseAdapter {
  private static instance: LocalDatabaseAdapter;
  public db: Client;

  private constructor() {
    // Patrón Embedded Replica (Turso / libSQL)
    // Se utilizaría un archivo local para TTI 0ms y un remote url para la sincronización CRDT
    this.db = getLocalDb();
  }

  public static getInstance(): LocalDatabaseAdapter {
    if (!LocalDatabaseAdapter.instance) {
      LocalDatabaseAdapter.instance = new LocalDatabaseAdapter();
    }
    return LocalDatabaseAdapter.instance;
  }

  /**
   * Persiste directamente a la base de datos local SQLite empotrada.
   * Utiliza UUIDv7 para prevenir colisiones en la sincronización maestra.
   */
  public async executeLocalOptimistic(sql: string, args: any[] = []) {
    return this.db.execute({ sql, args });
  }
}

export const localDb = LocalDatabaseAdapter.getInstance();

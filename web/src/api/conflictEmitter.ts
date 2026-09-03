import type { ApiConflictError } from '../types/api';

type ConflictHandler = (error: ApiConflictError['response']['data']['detail']) => void;

class ConflictEventEmitter {
  private handlers: Set<ConflictHandler> = new Set();

  subscribe(handler: ConflictHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(error: ApiConflictError['response']['data']['detail']) {
    this.handlers.forEach(h => h(error));
  }
}

export const conflictEmitter = new ConflictEventEmitter();

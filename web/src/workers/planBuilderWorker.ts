/**
 * planBuilderWorker.ts
 * Web Worker para operaciones pesadas de clonación profunda y progresión.
 * Usa crypto.randomUUID() (API nativa) para evitar dependencias de bundling en Vite.
 */

type WorkerMessage = 
  | { type: 'DUPLICATE_WEEK'; payload: { sourceDays: any[], targetStartIndex: number } }
  | { type: 'PAINT_BLOCK'; payload: { block: any, targetDayIndices: number[] } }
  | { type: 'BATCH_CREATE_DAYS'; payload: { count: number, startIndex: number } };

// Helper: deep clone un item con nuevos UUIDs nativos
const cloneItemDeep = (item: any): any => {
  if (item.type === 'BLOCK') {
    return {
      ...item,
      id: crypto.randomUUID(),
      items: item.items.map((ex: any) => ({ ...ex, id: crypto.randomUUID() }))
    };
  }
  return { ...item, id: crypto.randomUUID() };
};

self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  try {
    if (type === 'DUPLICATE_WEEK') {
      const { sourceDays, targetStartIndex } = payload;
      
      const newDays = sourceDays.map((day: any, idx: number) => ({
        ...day,
        id: crypto.randomUUID(),
        name: `Día ${targetStartIndex + idx + 1}`,
        items: day.items.map(cloneItemDeep)
      }));

      self.postMessage({ type: 'SUCCESS', action: 'DUPLICATE_WEEK', payload: { newDays } });
    } 
    
    else if (type === 'PAINT_BLOCK') {
      const { block, targetDayIndices } = payload;
      
      const updates = targetDayIndices.map((index: number) => ({
        dayIndex: index,
        newItem: cloneItemDeep(block)
      }));

      self.postMessage({ type: 'SUCCESS', action: 'PAINT_BLOCK', payload: { updates } });
    }

    else if (type === 'BATCH_CREATE_DAYS') {
      const { count, startIndex } = payload;
      
      const newDays = Array.from({ length: count }, (_, i) => ({
        id: crypto.randomUUID(),
        name: `Día ${startIndex + i + 1}`,
        items: [],
        isCollapsed: false
      }));

      self.postMessage({ type: 'SUCCESS', action: 'BATCH_CREATE_DAYS', payload: { newDays } });
    }
  } catch (error: any) {
    self.postMessage({ type: 'ERROR', message: error.message });
  }
});

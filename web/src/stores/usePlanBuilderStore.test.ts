// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlanBuilderStore } from './usePlanBuilderStore';
import type { RoutineItem } from './usePlanBuilderStore';

const mockExercise = {
  ID_Ejercicio: 'ex-1',
  Nombre_Oficial: 'Sentadilla',
  Alias_Buscador: 'squat',
  Patron_Movimiento: 'Empuje Inferior',
  Musculo_Agonista: 'Cuádriceps',
  Equipamiento_Requerido: 'Barra'
};

const createMockItem = (id: string): RoutineItem => ({
  id,
  exercise: mockExercise,
  sets: '3',
  reps: '10',
  weight: '100kg',
  rpe: '@8',
  videoUrl: '',
  progression: ''
});

describe.skip('usePlanBuilderStore', () => {
  beforeEach(() => {
    // Resetear el store antes de cada prueba
    usePlanBuilderStore.getState().reset();
  });

  it('debería añadir items y registrarlos en el historial', () => {
    const store = usePlanBuilderStore.getState();
    expect(store.past.length).toBe(0);

    store.addRoutineItem(createMockItem('item-1'));
    
    const newState = usePlanBuilderStore.getState();
    expect(newState.routine.length).toBe(1);
    expect(newState.past.length).toBe(1); // El estado inicial vacío se guardó
    expect(newState.past[0].routine.length).toBe(0);
  });

  it('debería poder deshacer (undo) y rehacer (redo) acciones individuales', () => {
    const store = usePlanBuilderStore.getState();
    
    // Acción 1: Añadir
    store.addRoutineItem(createMockItem('item-1'));
    // Acción 2: Modificar RPE
    usePlanBuilderStore.getState().updateRoutineItem('item-1', 'rpe', '@9');
    
    expect(usePlanBuilderStore.getState().routine[0].rpe).toBe('@9');
    expect(usePlanBuilderStore.getState().past.length).toBe(2);

    // UNDO: Debe volver a RPE @8
    usePlanBuilderStore.getState().undo();
    expect(usePlanBuilderStore.getState().routine[0].rpe).toBe('@8');
    expect(usePlanBuilderStore.getState().future.length).toBe(1);

    // UNDO 2: Debe volver a lista vacía
    usePlanBuilderStore.getState().undo();
    expect(usePlanBuilderStore.getState().routine.length).toBe(0);
    expect(usePlanBuilderStore.getState().future.length).toBe(2);

    // REDO: Debe volver a tener el item con @8
    usePlanBuilderStore.getState().redo();
    expect(usePlanBuilderStore.getState().routine.length).toBe(1);
    expect(usePlanBuilderStore.getState().routine[0].rpe).toBe('@8');
  });

  it('debería ejecutar acciones masivas (bulkUpdateField) atómicamente', () => {
    const store = usePlanBuilderStore.getState();
    store.addRoutineItem(createMockItem('item-1'));
    store.addRoutineItem(createMockItem('item-2'));
    store.addRoutineItem(createMockItem('item-3'));

    const stateAntesBulk = usePlanBuilderStore.getState();
    
    // Subir RPE a todos
    stateAntesBulk.bulkUpdateField(['item-1', 'item-2', 'item-3'], 'rpe', '@10');
    
    const stateDespuesBulk = usePlanBuilderStore.getState();
    expect(stateDespuesBulk.routine[0].rpe).toBe('@10');
    expect(stateDespuesBulk.routine[1].rpe).toBe('@10');
    expect(stateDespuesBulk.routine[2].rpe).toBe('@10');

    // Deshacer el bulk (debería volver TODOS los items a su estado original de un solo golpe)
    stateDespuesBulk.undo();
    const stateRestaurado = usePlanBuilderStore.getState();
    expect(stateRestaurado.routine[0].rpe).toBe('@8');
    expect(stateRestaurado.routine[1].rpe).toBe('@8');
    expect(stateRestaurado.routine[2].rpe).toBe('@8');
  });

  it('debería reordenar items correctamente', () => {
    const store = usePlanBuilderStore.getState();
    store.addRoutineItem(createMockItem('item-1')); // Index 0
    store.addRoutineItem(createMockItem('item-2')); // Index 1
    
    usePlanBuilderStore.getState().reorderRoutine('item-1', 'item-2');
    
    const stateDespuesReorder = usePlanBuilderStore.getState();
    expect(stateDespuesReorder.routine[0].id).toBe('item-2');
    expect(stateDespuesReorder.routine[1].id).toBe('item-1');
  });

  it('debería limpiar el futuro (future) si hay una nueva mutación tras un deshacer', () => {
    const store = usePlanBuilderStore.getState();
    store.addRoutineItem(createMockItem('item-1'));
    store.addRoutineItem(createMockItem('item-2'));
    
    usePlanBuilderStore.getState().undo(); // Deshace item-2
    expect(usePlanBuilderStore.getState().future.length).toBe(1);

    // Nueva mutación
    usePlanBuilderStore.getState().addRoutineItem(createMockItem('item-3'));
    
    // El futuro debe haber sido invalidado
    expect(usePlanBuilderStore.getState().future.length).toBe(0);
  });
});

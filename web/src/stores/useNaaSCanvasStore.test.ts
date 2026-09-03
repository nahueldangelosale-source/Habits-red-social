import { describe, it, expect, beforeEach } from 'vitest';
import { useNaaSCanvasStore } from './useNaaSCanvasStore';
import { MealBlock, MealOption } from '../schemas/nutritionPlanSchema';
import { v4 as uuidv4 } from 'uuid';

describe('useNaaSCanvasStore - Math Accuracy (CHOAVLDF & PROCNT)', () => {
  const store = useNaaSCanvasStore.getState();

  beforeEach(() => {
    store.clearDraft();
    store.initNewPlan('tenant-1', 'client-1', 'prof-1', {
      protein_g: 150, carbs_g: 200, fat_g: 60, calories: 1940
    });
  });

  it('calculates the exact macros proportionally based on SARA 2 drops (Labor Illusion Math)', () => {
    // Simulamos un drop de Pechuga de Pollo SARA 2 (Base 100g = 31g PRO, 0 CHO, 3.6 FAT, 165 KCAL)
    const mockSaraItem = {
      id: 'sara-pollo',
      name: 'Pechuga de Pollo',
      protein_g: 31.0,
      available_carbs_g: 0.0,
      total_fat_g: 3.6,
      energy_kcal: 165
    };

    const blockId = uuidv4();
    const optionId = uuidv4();

    const block: MealBlock = {
      id: blockId,
      type: 'lunch',
      time_target: '13:00',
      custom_label: 'Almuerzo Test',
      options: [
        { id: optionId, label: 'Opción A', items: [] }
      ],
      notes: null
    };

    useNaaSCanvasStore.getState().addMealBlock(block);
    
    // 1. Efectuamos el drop. Se inicializa por defecto en 100g
    useNaaSCanvasStore.getState().dropSaraItemToOption(blockId, optionId, mockSaraItem);

    let activePlan = useNaaSCanvasStore.getState().activePlan;
    let item = activePlan?.meals[0].options[0].items[0];

    expect(item?.portion_amount).toBe(100);
    expect(item?.macros.protein_g).toBe(31.0);
    
    // 2. Simulamos que Leandro ingresa 150g en el input numérico
    useNaaSCanvasStore.getState().updateItemPortion(blockId, optionId, item!.id, 150);
    
    activePlan = useNaaSCanvasStore.getState().activePlan;
    item = activePlan?.meals[0].options[0].items[0];

    // 150g = 1.5 multiplier
    // PRO: 31 * 1.5 = 46.5
    // FAT: 3.6 * 1.5 = 5.4
    // KCAL: 165 * 1.5 = 247.5
    
    expect(item?.portion_amount).toBe(150);
    expect(item?.macros.protein_g).toBe(46.5);
    expect(item?.macros.fat_g).toBe(5.4);
    expect(item?.macros.calories).toBe(247.5);
    expect(item?.macros.carbs_g).toBe(0);
  });

  it('prevents floating point errors when multiplying decimals (Precision Test)', () => {
    const mockSaraItem = {
      id: 'sara-brócoli',
      name: 'Brócoli crudo',
      protein_g: 3.3,
      available_carbs_g: 2.9,
      total_fat_g: 0.2,
      energy_kcal: 27
    };

    const blockId = uuidv4();
    const optionId = uuidv4();

    useNaaSCanvasStore.getState().addMealBlock({
      id: blockId,
      type: 'dinner',
      time_target: '20:00',
      custom_label: 'Cena',
      options: [{ id: optionId, label: 'A', items: [] }],
      notes: null
    });

    useNaaSCanvasStore.getState().dropSaraItemToOption(blockId, optionId, mockSaraItem);
    
    let activePlan = useNaaSCanvasStore.getState().activePlan;
    let item = activePlan?.meals[0].options[0].items[0];

    // Cambiamos a 145g
    useNaaSCanvasStore.getState().updateItemPortion(blockId, optionId, item!.id, 145);
    
    activePlan = useNaaSCanvasStore.getState().activePlan;
    item = activePlan?.meals[0].options[0].items[0];

    // PRO: 3.3 * 1.45 = 4.785 -> toFixed(1) = 4.8
    // CHO: 2.9 * 1.45 = 4.205 -> toFixed(1) = 4.2
    // FAT: 0.2 * 1.45 = 0.29 -> toFixed(1) = 0.3
    
    expect(item?.macros.protein_g).toBe(4.8);
    expect(item?.macros.carbs_g).toBe(4.2);
    expect(item?.macros.fat_g).toBe(0.3);
  });
});

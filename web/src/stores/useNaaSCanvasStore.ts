import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MealBlock, MealOption, MealItem, NutritionPlanCreate } from '../schemas/nutritionPlanSchema';
import { v4 as uuidv4 } from 'uuid';

export interface NutritionPhase {
  id: string;
  configId: string;
  name?: string;
  durationWeeks?: number;
}

export interface NaaSCanvasState {
  // El Plan Activo (Borrador)
  tenant_id?: string;
  activePlan: NutritionPlanCreate | null;
  isDirty: boolean;
  
  // Metadatos de UI Efímera (No persistidos en DB, pero sí localmente para recovery)
  activeDroppableId: string | null;
  
  // --- NUTRITION PHASES (MACRO) ---
  nutritionPhases: NutritionPhase[];
  activeNutritionPhaseId: string | null;
  addNutritionPhase: (configId: string, name?: string, durationWeeks?: number) => void;
  removeNutritionPhase: (id: string) => void;
  setActiveNutritionPhaseId: (id: string | null) => void;
  updateNutritionPhase: (id: string, updates: Partial<NutritionPhase>) => void;
  // -------------------------------
  
  // Acciones
  initNewPlan: (tenantId: string, clientId: string, professionalId: string, dailyMacros: any) => void;
  addMealBlock: (block: MealBlock) => void;
  addOptionToBlock: (blockId: string, option: MealOption) => void;
  
  // Drag & Drop SARA 2 Core Action
  dropSaraItemToOption: (blockId: string, optionId: string, saraItem: any) => void;
  
  // Recálculo (La matemática base)
  updateItemPortion: (blockId: string, optionId: string, itemId: string, newAmount: number) => void;
  
  // Safety Net
  clearDraft: () => void;
}

export const useNaaSCanvasStore = create<NaaSCanvasState>()(
  persist(
    (set, _get) => ({
      activePlan: null,
      isDirty: false,
      activeDroppableId: null,
      nutritionPhases: [],
      activeNutritionPhaseId: null,

      initNewPlan: (_tenantId, clientId, _professionalId, dailyMacros) => {
        set({
          activePlan: {
            athlete_id: clientId,
            title: 'Nuevo Plan NaaS',
            daily_macros_target: dailyMacros,
            meals: []
          },
          nutritionPhases: [],
          activeNutritionPhaseId: null,
          isDirty: true
        });
      },

      addMealBlock: (block) => {
        set((state) => {
          if (!state.activePlan) return state;
          return {
            activePlan: {
              ...state.activePlan,
              meals: [...state.activePlan.meals, block]
            },
            isDirty: true
          };
        });
      },

      addNutritionPhase: (configId, name, durationWeeks = 4) => {
        set((state) => {
          const newPhase: NutritionPhase = {
            id: uuidv4(),
            configId,
            name,
            durationWeeks
          };
          return {
            nutritionPhases: [...state.nutritionPhases, newPhase],
            activeNutritionPhaseId: state.activeNutritionPhaseId || newPhase.id,
            isDirty: true
          };
        });
      },

      removeNutritionPhase: (id) => {
        set((state) => {
          const newPhases = state.nutritionPhases.filter(p => p.id !== id);
          return {
            nutritionPhases: newPhases,
            activeNutritionPhaseId: state.activeNutritionPhaseId === id 
              ? (newPhases.length > 0 ? newPhases[0].id : null) 
              : state.activeNutritionPhaseId,
            isDirty: true
          };
        });
      },

      setActiveNutritionPhaseId: (id) => {
        set({ activeNutritionPhaseId: id });
      },

      updateNutritionPhase: (id, updates) => {
        set((state) => ({
          nutritionPhases: state.nutritionPhases.map(p => 
            p.id === id ? { ...p, ...updates } : p
          ),
          isDirty: true
        }));
      },

      addOptionToBlock: (blockId, option) => {
        set((state) => {
          if (!state.activePlan) return state;
          const newMeals = state.activePlan.meals.map(block => {
            if (block.id === blockId) {
              return { ...block, options: [...(block.options || []), option] };
            }
            return block;
          });
          return {
            activePlan: { ...state.activePlan, meals: newMeals },
            isDirty: true
          };
        });
      },

      dropSaraItemToOption: (blockId, optionId, saraItem) => {
        set((state) => {
          if (!state.activePlan) return state;
          
          const newMeals = state.activePlan.meals.map(block => {
            if (block.id !== blockId) return block;
            
            const newOptions = (block.options || []).map(opt => {
              if (opt.id !== optionId) return opt;
              
              // Base calculation (100g base for SARA 2 items)
              const defaultPortion = 100;
              const multiplier = defaultPortion / 100;
              
              const newItem: MealItem = {
                id: uuidv4(),
                sara_item_id: saraItem.id, // Linking to SARA 2 global library
                name: saraItem.name,
                portion_amount: defaultPortion,
                portion_unit: 'g',
                macros: {
                  protein_g: Number((saraItem.protein_g * multiplier).toFixed(1)),
                  carbs_g: Number((saraItem.available_carbs_g * multiplier).toFixed(1)),
                  fat_g: Number((saraItem.total_fat_g * multiplier).toFixed(1)),
                  calories: Number((saraItem.energy_kcal * multiplier).toFixed(1))
                },
                notes: null
              };
              
              return { ...opt, items: [...(opt.items || []), newItem] };
            });
            
            return { ...block, options: newOptions };
          });
          
          return {
            activePlan: { ...state.activePlan, meals: newMeals },
            isDirty: true
          };
        });
      },

      updateItemPortion: (blockId, optionId, itemId, newAmount) => {
        set((state) => {
          if (!state.activePlan) return state;
          
          const newMeals = state.activePlan.meals.map(block => {
            if (block.id !== blockId) return block;
            
            const newOptions = (block.options || []).map(opt => {
              if (opt.id !== optionId) return opt;
              
              const newItems = (opt.items || []).map(item => {
                if (item.id !== itemId) return item;
                
                if (item.portion_amount === 0) return { ...item, portion_amount: newAmount }; 
                
                const ratio = newAmount / item.portion_amount;
                
                return {
                  ...item,
                  portion_amount: newAmount,
                  macros: {
                    protein_g: Number((item.macros.protein_g * ratio).toFixed(1)),
                    carbs_g: Number((item.macros.carbs_g * ratio).toFixed(1)),
                    fat_g: Number((item.macros.fat_g * ratio).toFixed(1)),
                    calories: Number((item.macros.calories * ratio).toFixed(1))
                  }
                };
              });
              return { ...opt, items: newItems };
            });
            return { ...block, options: newOptions };
          });
          
          return { activePlan: { ...state.activePlan, meals: newMeals }, isDirty: true };
        });
      },

      clearDraft: () => set({ activePlan: null, isDirty: false, activeDroppableId: null })
    }),
    {
      name: 'naas-canvas-draft-storage',
      storage: createJSONStorage(() => localStorage), // Recuperación ante F5 (Refresh)
      partialize: (state) => ({ 
        activePlan: state.activePlan, 
        isDirty: state.isDirty 
        // No persistimos activeDroppableId (UI efímera)
      }),
    }
  )
);

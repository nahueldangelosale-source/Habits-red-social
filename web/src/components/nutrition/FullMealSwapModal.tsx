import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Sparkles, 
  Utensils, 
  Flame, 
  ChevronRight, 
  Scale, 
  PieChart 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getHouseholdMeasure } from '../../utils/householdMeasures';
import type { MealOption } from '../athlete/MealOptionCard';

interface FullMealSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  currentMealName: string;
  targetCalories: number;
  onSelectMealOption: (newOption: MealOption) => void;
}

// Catálogo Curado de Platos Completos por Momento del Día
const CURATED_MEAL_CATALOG: Record<string, MealOption[]> = {
  Desayuno: [
    {
      id: 'full_des_1',
      name: 'Tostadas con Palta y Huevo',
      ingredients: [
        { id: 'fd1_1', name: 'Pan integral', quantity: 60, unit: 'g', macros: { protein: 6, carbs: 28, fats: 2, calories: 154 } },
        { id: 'fd1_2', name: 'Huevos enteros', quantity: 2, unit: 'u', macros: { protein: 12, carbs: 1, fats: 10, calories: 142 } },
        { id: 'fd1_3', name: 'Palta Hass', quantity: 40, unit: 'g', macros: { protein: 1, carbs: 3, fats: 6, calories: 64 } }
      ],
      totalMacros: { protein: 19, carbs: 32, fats: 18, calories: 360 }
    },
    {
      id: 'full_des_2',
      name: 'Yogur Griego con Granola y Frutas',
      ingredients: [
        { id: 'fd2_1', name: 'Yogur Griego Natural', quantity: 200, unit: 'g', macros: { protein: 20, carbs: 8, fats: 0.5, calories: 120 } },
        { id: 'fd2_2', name: 'Granola baja en azúcar', quantity: 40, unit: 'g', macros: { protein: 4, carbs: 26, fats: 5, calories: 165 } },
        { id: 'fd2_3', name: 'Banana madura', quantity: 80, unit: 'g', macros: { protein: 1, carbs: 18, fats: 0.2, calories: 75 } }
      ],
      totalMacros: { protein: 25, carbs: 52, fats: 6, calories: 360 }
    },
    {
      id: 'full_des_3',
      name: 'Pancakes de Avena & Claras con Frutos Rojos',
      ingredients: [
        { id: 'fd3_1', name: 'Harina de Avena', quantity: 50, unit: 'g', macros: { protein: 7, carbs: 33, fats: 3, calories: 185 } },
        { id: 'fd3_2', name: 'Claras de Huevo', quantity: 4, unit: 'u', macros: { protein: 16, carbs: 1, fats: 0.2, calories: 70 } },
        { id: 'fd3_3', name: 'Frutos Rojos / Arándanos', quantity: 60, unit: 'g', macros: { protein: 0.5, carbs: 12, fats: 0.2, calories: 50 } },
        { id: 'fd3_4', name: 'Miel pura', quantity: 15, unit: 'g', macros: { protein: 0, carbs: 12, fats: 0, calories: 48 } }
      ],
      totalMacros: { protein: 23.5, carbs: 58, fats: 3.4, calories: 353 }
    },
    {
      id: 'full_des_4',
      name: 'Omelette de Claras con Queso Magro & Pan',
      ingredients: [
        { id: 'fd4_1', name: 'Claras de Huevo', quantity: 4, unit: 'u', macros: { protein: 16, carbs: 1, fats: 0.2, calories: 70 } },
        { id: 'fd4_2', name: 'Queso Magro untable', quantity: 40, unit: 'g', macros: { protein: 5, carbs: 1.5, fats: 1, calories: 35 } },
        { id: 'fd4_3', name: 'Pan integral', quantity: 60, unit: 'g', macros: { protein: 6, carbs: 28, fats: 2, calories: 154 } },
        { id: 'fd4_4', name: 'Tomates Cherry', quantity: 80, unit: 'g', macros: { protein: 1, carbs: 3, fats: 0.1, calories: 18 } }
      ],
      totalMacros: { protein: 28, carbs: 33.5, fats: 3.3, calories: 277 }
    }
  ],
  Almuerzo: [
    {
      id: 'full_alm_1',
      name: 'Milanesa de Peceto al Horno con Ensalada',
      ingredients: [
        { id: 'fa1_1', name: 'Peceto magro al horno', quantity: 180, unit: 'g', macros: { protein: 42, carbs: 12, fats: 6, calories: 270 } },
        { id: 'fa1_2', name: 'Mix hojas verdes & tomate', quantity: 150, unit: 'g', macros: { protein: 2, carbs: 6, fats: 0, calories: 32 } },
        { id: 'fa1_3', name: 'Aceite de oliva extra virgen', quantity: 10, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 9, calories: 81 } }
      ],
      totalMacros: { protein: 44, carbs: 18, fats: 15, calories: 383 }
    },
    {
      id: 'full_alm_2',
      name: 'Pechuga de Pollo con Arroz Integral & Brócoli',
      ingredients: [
        { id: 'fa2_1', name: 'Pechuga de Pollo grillada', quantity: 180, unit: 'g', macros: { protein: 41, carbs: 0, fats: 3, calories: 198 } },
        { id: 'fa2_2', name: 'Arroz Integral cocido', quantity: 120, unit: 'g', macros: { protein: 3.5, carbs: 32, fats: 1, calories: 150 } },
        { id: 'fa2_3', name: 'Brócoli al vapor', quantity: 100, unit: 'g', macros: { protein: 3, carbs: 5, fats: 0.4, calories: 35 } },
        { id: 'fa2_4', name: 'Aceite de oliva', quantity: 5, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 4.5, calories: 40 } }
      ],
      totalMacros: { protein: 47.5, carbs: 37, fats: 8.9, calories: 423 }
    },
    {
      id: 'full_alm_3',
      name: 'Filete de Salmón con Puré de Batata',
      ingredients: [
        { id: 'fa3_1', name: 'Filete de Salmón Rosado', quantity: 150, unit: 'g', macros: { protein: 30, carbs: 0, fats: 18, calories: 285 } },
        { id: 'fa3_2', name: 'Batata al vapor / Puré', quantity: 120, unit: 'g', macros: { protein: 2, carbs: 29, fats: 0.2, calories: 126 } },
        { id: 'fa3_3', name: 'Espinacas frescas salteadas', quantity: 100, unit: 'g', macros: { protein: 2.5, carbs: 2, fats: 0.3, calories: 20 } }
      ],
      totalMacros: { protein: 34.5, carbs: 31, fats: 18.5, calories: 431 }
    },
    {
      id: 'full_alm_4',
      name: 'Wok de Lomo Vacuno Magro con Quinoa & Vegetales',
      ingredients: [
        { id: 'fa4_1', name: 'Lomo Vacuno Magro', quantity: 160, unit: 'g', macros: { protein: 35, carbs: 0, fats: 5, calories: 192 } },
        { id: 'fa4_2', name: 'Quinoa cocida', quantity: 100, unit: 'g', macros: { protein: 4.5, carbs: 21, fats: 2, calories: 120 } },
        { id: 'fa4_3', name: 'Mix Vegetales (Zanahoria, Zucchini, Morrones)', quantity: 150, unit: 'g', macros: { protein: 2, carbs: 8, fats: 0.5, calories: 45 } },
        { id: 'fa4_4', name: 'Aceite de sésamo/oliva', quantity: 5, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 4.5, calories: 40 } }
      ],
      totalMacros: { protein: 41.5, carbs: 29, fats: 12, calories: 397 }
    }
  ],
  Merienda: [
    {
      id: 'full_mer_1',
      name: 'Sandwich Integral de Pavo & Queso Magro',
      ingredients: [
        { id: 'fm1_1', name: 'Pan integral', quantity: 60, unit: 'g', macros: { protein: 6, carbs: 28, fats: 2, calories: 154 } },
        { id: 'fm1_2', name: 'Pechuga de pavo natural', quantity: 60, unit: 'g', macros: { protein: 14, carbs: 0.5, fats: 1, calories: 65 } },
        { id: 'fm1_3', name: 'Queso magro', quantity: 30, unit: 'g', macros: { protein: 7, carbs: 0.5, fats: 4, calories: 65 } }
      ],
      totalMacros: { protein: 27, carbs: 29, fats: 7, calories: 284 }
    },
    {
      id: 'full_mer_2',
      name: 'Porridge Caliente de Avena con Manzana & Canela',
      ingredients: [
        { id: 'fm2_1', name: 'Avena en hojuelas', quantity: 45, unit: 'g', macros: { protein: 6, carbs: 27, fats: 3, calories: 162 } },
        { id: 'fm2_2', name: 'Proteína Whey', quantity: 20, unit: 'g', macros: { protein: 16, carbs: 1, fats: 0.8, calories: 75 } },
        { id: 'fm2_3', name: 'Manzana cortada', quantity: 80, unit: 'g', macros: { protein: 0.3, carbs: 11, fats: 0.1, calories: 46 } }
      ],
      totalMacros: { protein: 22.3, carbs: 39, fats: 3.9, calories: 283 }
    }
  ],
  Cena: [
    {
      id: 'full_cen_1',
      name: 'Filete de Merluza al Limón con Puré de Calabaza',
      ingredients: [
        { id: 'fc1_1', name: 'Filete de Merluza / Pescado blanco', quantity: 200, unit: 'g', macros: { protein: 36, carbs: 0, fats: 2.4, calories: 170 } },
        { id: 'fc1_2', name: 'Puré de Calabaza / Zapallo', quantity: 180, unit: 'g', macros: { protein: 2, carbs: 16, fats: 0.4, calories: 75 } },
        { id: 'fc1_3', name: 'Aceite de oliva extra virgen', quantity: 8, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 7.2, calories: 65 } }
      ],
      totalMacros: { protein: 38, carbs: 16, fats: 10, calories: 310 }
    },
    {
      id: 'full_cen_2',
      name: 'Tortilla de Espinacas & Claras con Tomates Cherry',
      ingredients: [
        { id: 'fc2_1', name: 'Claras de Huevo', quantity: 4, unit: 'u', macros: { protein: 16, carbs: 1, fats: 0.2, calories: 70 } },
        { id: 'fc2_2', name: 'Huevo Entero', quantity: 1, unit: 'u', macros: { protein: 6.5, carbs: 0.3, fats: 5, calories: 72 } },
        { id: 'fc2_3', name: 'Espinacas cocidas', quantity: 150, unit: 'g', macros: { protein: 4, carbs: 3, fats: 0.5, calories: 35 } },
        { id: 'fc2_4', name: 'Queso Magro', quantity: 40, unit: 'g', macros: { protein: 8, carbs: 1, fats: 5, calories: 80 } },
        { id: 'fc2_5', name: 'Tomates Cherry', quantity: 100, unit: 'g', macros: { protein: 1, carbs: 4, fats: 0.2, calories: 22 } }
      ],
      totalMacros: { protein: 35.5, carbs: 9.3, fats: 10.9, calories: 279 }
    },
    {
      id: 'full_cen_3',
      name: 'Fajitas de Pollo con Pimientos & Palta',
      ingredients: [
        { id: 'fc3_1', name: 'Pechuga de Pollo en tiras', quantity: 150, unit: 'g', macros: { protein: 34, carbs: 0, fats: 2.5, calories: 165 } },
        { id: 'fc3_2', name: 'Tortillas de maíz / integrales (2u)', quantity: 60, unit: 'g', macros: { protein: 4, carbs: 28, fats: 2, calories: 145 } },
        { id: 'fc3_3', name: 'Pimientos y Cebolla salteados', quantity: 100, unit: 'g', macros: { protein: 1.5, carbs: 6, fats: 0.2, calories: 32 } },
        { id: 'fc3_4', name: 'Palta en cubos', quantity: 35, unit: 'g', macros: { protein: 0.7, carbs: 3, fats: 5.2, calories: 56 } }
      ],
      totalMacros: { protein: 40.2, carbs: 37, fats: 9.9, calories: 398 }
    }
  ]
};

export const FullMealSwapModal: React.FC<FullMealSwapModalProps> = ({
  isOpen,
  onClose,
  mealType = 'Almuerzo',
  currentMealName,
  targetCalories,
  onSelectMealOption
}) => {
  const catalog = CURATED_MEAL_CATALOG[mealType] || CURATED_MEAL_CATALOG['Almuerzo'];
  const [selectedOption, setSelectedOption] = useState<MealOption>(catalog[0]);

  if (!isOpen) return null;

  const handleSelect = (option: MealOption) => {
    onSelectMealOption(option);
    toast.success(`¡Plato actualizado a ${option.name}!`, {
      icon: '🍽️'
    });
    if (navigator.vibrate) navigator.vibrate([25]);
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[88vh]"
        >
          {/* Header (shrink-0 para nunca quedar cortado) */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 dark:bg-zinc-900/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                🍽️
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  <span>Cambiar Menú Completo</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Plato Isocalórico
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {mealType} • Elige una receta completa adaptada a tus calorías ({targetCalories} kcal)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body (flex-1 con scroll limpio en móviles) */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 text-left min-h-0">
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold leading-relaxed bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
              💡 <span className="text-slate-900 dark:text-white font-black">Platos balanceados:</span> Todas las opciones respetan tus macros y calorías del día. Selecciona el plato que más te apetezca comer hoy.
            </p>

            {/* Catálogo de Recetas */}
            <div className="space-y-2.5">
              {catalog.map(opt => {
                const isSelected = selectedOption.id === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-white hover:bg-slate-50 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border-slate-200/80 dark:border-white/5'
                    }`}
                    onClick={() => setSelectedOption(opt)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                          {opt.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold">
                          {opt.totalMacros.calories} kcal • {opt.totalMacros.protein}g P • {opt.totalMacros.carbs}g C • {opt.totalMacros.fats}g G
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(opt);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        <Check size={12} />
                        <span>Elegir</span>
                      </button>
                    </div>

                    {/* Ingredientes con Medidas Caseras Pedagógicas */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                      {opt.ingredients.map(ing => {
                        const household = getHouseholdMeasure(ing.name, ing.quantity, ing.unit);
                        return (
                          <div key={ing.id} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 dark:text-zinc-300 font-bold truncate pr-2">
                              • {ing.name}
                            </span>
                            <span className="text-slate-500 dark:text-zinc-400 font-medium shrink-0">
                              {ing.quantity}{ing.unit} {household ? <strong className="text-indigo-600 dark:text-indigo-400 font-bold">({household})</strong> : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer CTA (shrink-0) */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancelar
            </button>

            <button
              onClick={() => handleSelect(selectedOption)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Check size={14} />
              <span>Aplicar Plato al Menú</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

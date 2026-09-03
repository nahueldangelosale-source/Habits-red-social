import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Search, 
  Scale, 
  Flame, 
  ShieldCheck, 
  RefreshCw,
  Utensils,
  Lightbulb
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  CANONICAL_SWAP_BANK, 
  getFoodDominance, 
  type SwapAlternativeItem, 
  type CalculatedSwap 
} from '../../utils/smartSwapEngine';
import { getHouseholdMeasure } from '../../utils/householdMeasures';

export interface SwapMealIngredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

interface SmartSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealId?: string;
  mealType?: string;
  initialFoodName?: string;
  initialQuantityGrams?: number;
  mealIngredients?: SwapMealIngredient[];
  onApplySwap?: (swapResult: {
    originalFood: string;
    newFood: string;
    newQuantityGrams: number;
    newMacros: { protein: number; carbs: number; fats: number; calories: number };
  }) => void;
}

export const SmartSwapModal: React.FC<SmartSwapModalProps> = ({
  isOpen,
  onClose,
  mealId,
  mealType = 'Almuerzo',
  initialFoodName = 'Peceto / Cuadril Magro',
  initialQuantityGrams = 180,
  mealIngredients = [],
  onApplySwap
}) => {
  const [selectedSourceFood, setSelectedSourceFood] = useState<SwapAlternativeItem>(
    CANONICAL_SWAP_BANK[14] // Peceto default or first
  );
  const [sourceGrams, setSourceGrams] = useState(initialQuantityGrams);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetFood, setSelectedTargetFood] = useState<SwapAlternativeItem>(
    CANONICAL_SWAP_BANK[15] // Pechuga de pollo default
  );

  // Match canonical food item from a string name
  const findCanonicalMatch = (name: string): SwapAlternativeItem => {
    const clean = name.toLowerCase().trim();
    const found = CANONICAL_SWAP_BANK.find(f => {
      const canonicalClean = f.name.toLowerCase();
      return canonicalClean.includes(clean) || clean.includes(canonicalClean.split('/')[0].trim());
    });
    return found || {
      name: name,
      category: 'Proteínas',
      protPer100g: 22,
      carbsPer100g: 0,
      fatPer100g: 3,
      calsPer100g: 120
    };
  };

  // Initialize or update when opening or props change
  useEffect(() => {
    if (isOpen) {
      const match = findCanonicalMatch(initialFoodName);
      setSelectedSourceFood(match);
      setSourceGrams(initialQuantityGrams || 150);

      // Auto pick a logical alternative from the same category
      const defaultAlt = CANONICAL_SWAP_BANK.find(f => 
        f.name !== match.name && 
        (f.category === match.category || (match.category === 'Carnes' && (f.category === 'Pescados' || f.category === 'Huevos')))
      );
      if (defaultAlt) {
        setSelectedTargetFood(defaultAlt);
      }
    }
  }, [initialFoodName, initialQuantityGrams, isOpen]);

  // Source food macros calculation
  const sourceMacros = useMemo(() => {
    const factor = sourceGrams / 100;
    return {
      protein: Math.round(selectedSourceFood.protPer100g * factor * 10) / 10,
      carbs: Math.round(selectedSourceFood.carbsPer100g * factor * 10) / 10,
      fats: Math.round(selectedSourceFood.fatPer100g * factor * 10) / 10,
      calories: Math.round(selectedSourceFood.calsPer100g * factor)
    };
  }, [selectedSourceFood, sourceGrams]);

  // Target food isocaloric / isomacronutrient calculation
  const calculateEquivFor = (targetFood: SwapAlternativeItem) => {
    const dominance = getFoodDominance(
      selectedSourceFood.protPer100g,
      selectedSourceFood.carbsPer100g,
      selectedSourceFood.fatPer100g
    );

    let targetGrams = 100;

    if (dominance === 'CARBS' && targetFood.carbsPer100g > 0) {
      targetGrams = Math.round((sourceMacros.carbs / targetFood.carbsPer100g) * 100);
    } else if (dominance === 'PROTEIN' && targetFood.protPer100g > 0) {
      targetGrams = Math.round((sourceMacros.protein / targetFood.protPer100g) * 100);
    } else if (dominance === 'FAT' && targetFood.fatPer100g > 0) {
      targetGrams = Math.round((sourceMacros.fats / targetFood.fatPer100g) * 100);
    } else {
      targetGrams = Math.round((sourceMacros.calories / (targetFood.calsPer100g || 100)) * 100);
    }

    targetGrams = Math.max(10, Math.min(1000, targetGrams));
    const factor = targetGrams / 100;

    const targetMacros = {
      protein: Math.round(targetFood.protPer100g * factor * 10) / 10,
      carbs: Math.round(targetFood.carbsPer100g * factor * 10) / 10,
      fats: Math.round(targetFood.fatPer100g * factor * 10) / 10,
      calories: Math.round(targetFood.calsPer100g * factor)
    };

    const deltaCals = targetMacros.calories - sourceMacros.calories;

    return {
      grams: targetGrams,
      macros: targetMacros,
      deltaCals,
      dominance
    };
  };

  const currentTargetCalculation = useMemo(() => {
    return calculateEquivFor(selectedTargetFood);
  }, [selectedSourceFood, selectedTargetFood, sourceMacros]);

  // Filtered swap alternatives sorted by relevance
  const availableAlternatives = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return CANONICAL_SWAP_BANK.filter(f => {
      if (f.name === selectedSourceFood.name) return false;
      if (!query) {
        // High similarity sorting
        if (selectedSourceFood.category === 'Carnes') {
          return f.category === 'Carnes' || f.category === 'Pescados' || f.category === 'Huevos' || f.category === 'Soja / Vegano';
        }
        if (selectedSourceFood.category === 'Pescados') {
          return f.category === 'Pescados' || f.category === 'Carnes' || f.category === 'Huevos';
        }
        if (selectedSourceFood.category === 'Cereales' || selectedSourceFood.category === 'Tubérculos' || selectedSourceFood.category === 'Panificados' || selectedSourceFood.category === 'Pastas') {
          return f.category === 'Cereales' || f.category === 'Tubérculos' || f.category === 'Panificados' || f.category === 'Pastas' || f.category === 'Legumbres';
        }
        if (selectedSourceFood.category === 'Aceites' || selectedSourceFood.category === 'Grasas' || selectedSourceFood.category === 'Frutos Secos' || selectedSourceFood.category === 'Frutas Grasas') {
          return f.category === 'Aceites' || f.category === 'Frutas Grasas' || f.category === 'Frutos Secos' || f.category === 'Grasas';
        }
        if (selectedSourceFood.category === 'Vegetales') {
          return f.category === 'Vegetales';
        }
        return f.category === selectedSourceFood.category;
      }
      return f.name.toLowerCase().includes(query) || f.category.toLowerCase().includes(query);
    });
  }, [selectedSourceFood, searchQuery]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (onApplySwap) {
      onApplySwap({
        originalFood: selectedSourceFood.name,
        newFood: selectedTargetFood.name,
        newQuantityGrams: currentTargetCalculation.grams,
        newMacros: currentTargetCalculation.macros
      });
    }

    toast.success(`¡Alimento cambiado por ${currentTargetCalculation.grams}g de ${selectedTargetFood.name.split('/')[0].trim()}!`, {
      icon: '🔄'
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
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-teal-500/10 dark:bg-zinc-900/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                🔄
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  <span>Cambiar Alimento</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Equivalencia Automática
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {mealType} • Misma proteína, carbohidratos y calorías
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

          {/* Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-left min-h-0">
            
            {/* Selector de ingredientes del menú actual */}
            {mealIngredients.length > 1 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  ¿Qué alimento de tu {mealType.toLowerCase()} deseas cambiar?
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mealIngredients.map(ing => {
                    const isSelected = selectedSourceFood.name.toLowerCase().includes(ing.name.toLowerCase()) || 
                      ing.name.toLowerCase().includes(selectedSourceFood.name.toLowerCase().split('/')[0].trim());
                    return (
                      <button
                        key={ing.name}
                        type="button"
                        onClick={() => {
                          const match = findCanonicalMatch(ing.name);
                          setSelectedSourceFood(match);
                          setSourceGrams(ing.quantity || 150);
                          const newAlt = CANONICAL_SWAP_BANK.find(f => f.name !== match.name && f.category === match.category);
                          if (newAlt) setSelectedTargetFood(newAlt);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-white/5'
                        }`}
                      >
                        <span>{ing.name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          ({ing.quantity}{ing.unit})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comparativa Visual Source -> Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              
              {/* Alimento Origen */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Alimento Original
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">
                    {sourceMacros.calories} kcal
                  </span>
                </div>

                <p className="text-xs font-black font-montserrat text-slate-900 dark:text-white truncate">
                  {selectedSourceFood.name}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Porción:</span>
                  <input
                    type="number"
                    value={sourceGrams}
                    onChange={e => setSourceGrams(Math.max(10, Number(e.target.value)))}
                    className="w-16 px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {getHouseholdMeasure(selectedSourceFood.name, sourceGrams) ? `(${getHouseholdMeasure(selectedSourceFood.name, sourceGrams)})` : 'gramos'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                  <div className="bg-white/60 dark:bg-black/20 p-1 rounded-lg">
                    <span className="text-blue-500">{sourceMacros.protein}g</span> Prot
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-1 rounded-lg">
                    <span className="text-amber-500">{sourceMacros.carbs}g</span> Carbos
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-1 rounded-lg">
                    <span className="text-rose-500">{sourceMacros.fats}g</span> Grasas
                  </div>
                </div>
              </div>

              {/* Alimento Destino Calculado */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-500/40 text-slate-900 dark:text-white space-y-2 relative shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <Sparkles size={11} />
                    Equivalencia Exacta
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {currentTargetCalculation.macros.calories} kcal ({currentTargetCalculation.deltaCals >= 0 ? `+${currentTargetCalculation.deltaCals}` : currentTargetCalculation.deltaCals})
                  </span>
                </div>

                <p className="text-xs font-black font-montserrat text-emerald-950 dark:text-emerald-100 truncate">
                  {selectedTargetFood.name}
                </p>

                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">Porción:</span>
                    <span className="px-2 py-0.5 rounded-xl bg-emerald-600 text-white text-xs font-black font-mono shadow-xs">
                      {currentTargetCalculation.grams} g
                    </span>
                  </div>
                  {getHouseholdMeasure(selectedTargetFood.name, currentTargetCalculation.grams) && (
                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                      ~ {getHouseholdMeasure(selectedTargetFood.name, currentTargetCalculation.grams)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[9px] font-bold">
                  <div className="bg-white/80 dark:bg-black/40 p-1 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400">{currentTargetCalculation.macros.protein}g</span> Prot
                  </div>
                  <div className="bg-white/80 dark:bg-black/40 p-1 rounded-lg">
                    <span className="text-amber-600 dark:text-amber-400">{currentTargetCalculation.macros.carbs}g</span> Carbos
                  </div>
                  <div className="bg-white/80 dark:bg-black/40 p-1 rounded-lg">
                    <span className="text-rose-600 dark:text-rose-400">{currentTargetCalculation.macros.fats}g</span> Grasas
                  </div>
                </div>
              </div>
            </div>

            {/* Efecto AJA! — Banner explicativo automático con Medidas Caseras */}
            <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>Efecto Equivalencia:</strong> Comer <strong>{sourceGrams}g ({getHouseholdMeasure(selectedSourceFood.name, sourceGrams)})</strong> de {selectedSourceFood.name.split('/')[0].trim()} aporta lo mismo que <strong>{currentTargetCalculation.grams}g ({getHouseholdMeasure(selectedTargetFood.name, currentTargetCalculation.grams)})</strong> de {selectedTargetFood.name.split('/')[0].trim()}. ¡Tu plan sigue 100% en balance!
              </span>
            </div>

            {/* Buscador & Alternativas Semánticas */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-montserrat">
                  Opciones sugeridas similares:
                </label>
                <span className="text-[10px] text-slate-400 font-bold">
                  {availableAlternatives.length} opciones
                </span>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar cualquier otro alimento (pollo, merluza, tofu, papa...)"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Lista de Alternativas con Gramos y Medidas Caseras en cada botón */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {availableAlternatives.map(alt => {
                  const isSelected = selectedTargetFood.name === alt.name;
                  const equiv = calculateEquivFor(alt);
                  const altHousehold = getHouseholdMeasure(alt.name, equiv.grams);
                  return (
                    <button
                      key={alt.name}
                      type="button"
                      onClick={() => {
                        setSelectedTargetFood(alt);
                        if (navigator.vibrate) navigator.vibrate([10]);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-slate-200 dark:border-white/5 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <p className="text-[11px] font-black truncate">{alt.name.split('/')[0]}</p>
                        <p className={`text-[10px] font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {altHousehold ? altHousehold : alt.category}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono block ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {equiv.grams} g
                        </span>
                        <span className={`text-[9px] font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {equiv.macros.calories} kcal
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancelar
            </button>

            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Check size={14} />
              <span>Aplicar Reemplazo en mi Menú</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowLeft, ArrowRight, Search, Plus, Trash2, 
  Check, ChefHat, Clock, Users, Sparkles, Utensils, AlertCircle 
} from 'lucide-react';
import type { Recipe, RecipeIngredient } from '../../../stores/useNutritionStore';
import { useSaraLibrary } from './SmartLibraryPanel';

// Tipo interno del modal para manejar macros por 100g durante la edición
interface ModalIngredient {
  saraId: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  protPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  calsPer100g: number;
}

interface RecipeCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingRecipe?: Recipe | null;
}

const PREP_TIMES = [
  { label: '⚡ 10 min', value: 10 },
  { label: '🕐 20 min', value: 20 },
  { label: '🍳 30 min', value: 30 },
  { label: '👨‍🍳 45+ min', value: 45 },
];

const TAG_OPTIONS = [
  'Alto en Proteína 💪', 'Vegano 🌿', 'Sin Gluten 🌾', 
  'Bajo en Carbos 🔥', 'Desayuno ☀️', 'Almuerzo 🍽️', 
  'Cena 🌙', 'Snack 🥤'
];

// Helper para resaltar coincidencias en la búsqueda
const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? (
      <span key={i} className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-0.5 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

export const RecipeCreatorModal: React.FC<RecipeCreatorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRecipe
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // Form State
  const [recipeName, setRecipeName] = useState(editingRecipe?.name || '');
  const [servings, setServings] = useState(editingRecipe?.servings || 4);
  const [prevStep1Servings, setPrevStep1Servings] = useState(editingRecipe?.servings || 4);
  const [servingsToastMessage, setServingsToastMessage] = useState<string | null>(null);
  const [prepTimeMin, setPrepTimeMin] = useState(editingRecipe?.prepTimeMin || 20);
  const [selectedTags, setSelectedTags] = useState<string[]>(editingRecipe?.tags || []);
  const [ingredients, setIngredients] = useState<ModalIngredient[]>(() => {
    if (editingRecipe?.ingredients) {
      return editingRecipe.ingredients.map(ing => ({
        saraId: ing.saraId,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        category: '',
        protPer100g: ing.amount > 0 ? (ing.macros.protein / (ing.amount / 100)) : 0,
        carbsPer100g: ing.amount > 0 ? (ing.macros.carbs / (ing.amount / 100)) : 0,
        fatPer100g: ing.amount > 0 ? (ing.macros.fats / (ing.amount / 100)) : 0,
        calsPer100g: ing.amount > 0 ? (ing.macros.calories / (ing.amount / 100)) : 0,
      }));
    }
    return [];
  });
  
  // Search & Mobile Focus State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Custom Food Form State (Escape Hatch)
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAmount, setCustomAmount] = useState(100);
  const [customProt, setCustomProt] = useState<number | ''>('');
  const [customCarbs, setCustomCarbs] = useState<number | ''>('');
  const [customFat, setCustomFat] = useState<number | ''>('');
  const [customCals, setCustomCals] = useState<number | ''>('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults = [] } = useSaraLibrary(debouncedSearch);

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      if (editingRecipe) {
        setRecipeName(editingRecipe.name);
        setServings(editingRecipe.servings);
        setPrevStep1Servings(editingRecipe.servings);
        setPrepTimeMin(editingRecipe.prepTimeMin);
        setSelectedTags(editingRecipe.tags);
        setIngredients(editingRecipe.ingredients.map(ing => ({
          saraId: ing.saraId,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          category: '',
          protPer100g: ing.amount > 0 ? (ing.macros.protein / (ing.amount / 100)) : 0,
          carbsPer100g: ing.amount > 0 ? (ing.macros.carbs / (ing.amount / 100)) : 0,
          fatPer100g: ing.amount > 0 ? (ing.macros.fats / (ing.amount / 100)) : 0,
          calsPer100g: ing.amount > 0 ? (ing.macros.calories / (ing.amount / 100)) : 0,
        })));
      } else {
        setRecipeName('');
        setServings(4);
        setPrevStep1Servings(4);
        setPrepTimeMin(20);
        setSelectedTags([]);
        setIngredients([]);
      }
      setCurrentStep(1);
      setSearchTerm('');
      setIsCreatingCustom(false);
      setServingsToastMessage(null);
    }
  }, [isOpen, editingRecipe]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addIngredient = (item: any) => {
    // Evitar duplicados
    const existing = ingredients.find(ing => ing.saraId === String(item.id_sara));
    if (existing) return;

    const newIng: ModalIngredient = {
      saraId: String(item.id_sara),
      name: item.alimento,
      amount: 100,
      unit: 'g',
      category: item.grupo || 'General',
      protPer100g: item.protcnt || 0,
      carbsPer100g: item.choavldf || 0,
      fatPer100g: item.fat || 0,
      calsPer100g: item.enerc_kcal || 0,
    };
    setIngredients([...ingredients, newIng]);
  };

  const addCustomIngredient = () => {
    if (!customName.trim()) return;

    const p = Number(customProt) || 0;
    const c = Number(customCarbs) || 0;
    const f = Number(customFat) || 0;
    const computedCals = customCals !== '' ? Number(customCals) : Math.round(p * 4 + c * 4 + f * 9);

    const customIng: ModalIngredient = {
      saraId: `custom-${Date.now()}`,
      name: customName.trim(),
      amount: customAmount || 100,
      unit: 'g',
      category: 'Personalizado',
      protPer100g: p,
      carbsPer100g: c,
      fatPer100g: f,
      calsPer100g: computedCals,
    };

    setIngredients(prev => [...prev, customIng]);
    setIsCreatingCustom(false);
    setSearchTerm('');
    setCustomName('');
    setCustomProt('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomCals('');
  };

  const updateIngredientAmount = (saraId: string, amount: number) => {
    setIngredients(prev => prev.map(ing => 
      ing.saraId === saraId ? { ...ing, amount } : ing
    ));
  };

  const removeIngredient = (saraId: string) => {
    setIngredients(prev => prev.filter(ing => ing.saraId !== saraId));
  };

  // Calculate Totals
  const totals = useMemo(() => {
    let p = 0, c = 0, f = 0, cal = 0;
    ingredients.forEach(ing => {
      const ratio = ing.amount / 100;
      p += ing.protPer100g * ratio;
      c += ing.carbsPer100g * ratio;
      f += ing.fatPer100g * ratio;
      cal += ing.calsPer100g * ratio;
    });
    return {
      protein: p / servings,
      carbs: c / servings,
      fats: f / servings,
      calories: cal / servings
    };
  }, [ingredients, servings]);

  // Transición de Paso 1 a Paso 2 con verificación de cambio de porciones
  const handleProceedToStep2 = () => {
    if (ingredients.length > 0 && servings !== prevStep1Servings) {
      setServingsToastMessage(`💡 Ajustamos los totales por porción para ${servings} ${servings === 1 ? 'plato' : 'platos'}`);
      setPrevStep1Servings(servings);
      setTimeout(() => setServingsToastMessage(null), 5000);
    }
    setCurrentStep(2);
  };

  const handleSave = () => {
    // Transformar ModalIngredient[] → RecipeIngredient[] del store
    const storeIngredients: RecipeIngredient[] = ingredients.map(ing => {
      const ratio = ing.amount / 100;
      return {
        saraId: ing.saraId,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        macros: {
          protein: Math.round(ing.protPer100g * ratio * 10) / 10,
          carbs: Math.round(ing.carbsPer100g * ratio * 10) / 10,
          fats: Math.round(ing.fatPer100g * ratio * 10) / 10,
          calories: Math.round(ing.calsPer100g * ratio),
        },
      };
    });

    onSave({
      name: recipeName,
      servings,
      prepTimeMin,
      tags: selectedTags,
      ingredients: storeIngredients,
      totalMacros: {
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fats: Math.round(totals.fats * 10) / 10,
        calories: Math.round(totals.calories),
      },
    });
  };

  if (!isOpen) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0d16] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex space-x-2">
            {[1, 2, 3].map(step => (
              <div 
                key={step} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep >= step 
                    ? 'w-8 bg-emerald-500' 
                    : 'w-4 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait" custom={currentStep}>
            {/* STEP 1 */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="p-8 space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-montserrat font-black text-slate-800 dark:text-white mb-2">
                    Dale un nombre a tu plato 🍳
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-lato">
                    Empecemos por lo básico. ¿Cómo se llama esta creación?
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      placeholder="Ej: Pollo con arroz y brócoli"
                      className="w-full text-lg font-lato p-4 bg-slate-50 dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all outline-none"
                    />
                    {recipeName.length > 0 && recipeName.length < 3 && (
                      <p className="text-xs text-amber-500 mt-2 font-lato">
                        Dale un nombre que te sea fácil recordar.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> ¿Cuántas porciones rinde?
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={servings}
                        onChange={(e) => setServings(Number(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                      <span className="font-montserrat font-bold text-xl text-emerald-600 dark:text-emerald-400 w-12 text-center">
                        {servings}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Tiempo de preparación
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {PREP_TIMES.map(time => (
                        <button
                          key={time.value}
                          onClick={() => setPrepTimeMin(time.value)}
                          className={`px-4 py-2 rounded-full font-lato text-sm transition-all ${
                            prepTimeMin === time.value
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {time.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Etiquetas (opcional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TAG_OPTIONS.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1.5 rounded-lg font-lato text-xs transition-all border ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col h-full"
              >
                <div className="p-8 pb-4 shrink-0">
                  {/* Toast pedagógico si hubo cambio de porciones */}
                  <AnimatePresence>
                    {servingsToastMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-xs font-lato font-bold flex items-center justify-between shadow-sm"
                      >
                        <span>{servingsToastMessage}</span>
                        <button 
                          onClick={() => setServingsToastMessage(null)}
                          className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <h2 className="text-2xl font-montserrat font-black text-slate-800 dark:text-white mb-2">
                    ¿Qué lleva tu receta? 🥗
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-lato mb-4">
                    Busca y añade los ingredientes.
                  </p>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (isCreatingCustom) setIsCreatingCustom(false);
                      }}
                      placeholder="Buscar un ingrediente... (ej: pollo, arroz, leche)"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-lato"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                    💡 Tip: Busca los ingredientes en crudo. Las cantidades son por receta completa, no por porción.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-32">
                  {/* Formulario de Alimento Personalizado (Escape Hatch) */}
                  <AnimatePresence>
                    {isCreatingCustom && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-montserrat font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-500" /> Crear Alimento Personalizado
                          </h4>
                          <button 
                            onClick={() => setIsCreatingCustom(false)}
                            className="text-slate-400 hover:text-slate-600 text-xs font-lato"
                          >
                            Cancelar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Nombre del Alimento
                            </label>
                            <input
                              type="text"
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              placeholder="Ej: Proteína Whey Vainilla"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Cantidad a usar (gramos)
                            </label>
                            <input
                              type="number"
                              value={customAmount || ''}
                              onChange={(e) => setCustomAmount(Number(e.target.value))}
                              placeholder="100"
                              className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                            />
                          </div>
                        </div>

                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Valores nutricionales (por 100g)
                        </p>

                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-blue-600 font-bold mb-1">Proteínas (g)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customProt}
                              onChange={(e) => setCustomProt(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="0"
                              className="w-full p-2 bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-amber-600 font-bold mb-1">Carbos (g)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customCarbs}
                              onChange={(e) => setCustomCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="0"
                              className="w-full p-2 bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-rose-600 font-bold mb-1">Grasas (g)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={customFat}
                              onChange={(e) => setCustomFat(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="0"
                              className="w-full p-2 bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-600 dark:text-slate-400 font-bold mb-1">Calorías</label>
                            <input
                              type="number"
                              value={customCals}
                              onChange={(e) => setCustomCals(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Auto"
                              className="w-full p-2 bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono dark:text-white"
                            />
                          </div>
                        </div>

                        <button
                          onClick={addCustomIngredient}
                          disabled={!customName.trim()}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl font-montserrat font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Añadir a mi receta
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Search Results */}
                  {debouncedSearch && !isCreatingCustom && (
                    <>
                      {(searchResults as any[]).length > 0 ? (
                        <div className="mb-8 bg-white dark:bg-[#0a0d16] border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                          {(searchResults as any[]).slice(0, 8).map((item: any) => (
                            <div key={item.id_sara} className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="flex-1 min-w-0 pr-3">
                                <p className="font-lato font-medium text-slate-700 dark:text-slate-200 text-sm truncate">
                                  {highlightMatch(item.alimento, debouncedSearch)}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[10px] text-slate-400 truncate">{item.grupo}</p>
                                  <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded shrink-0">por 100g</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="hidden sm:flex gap-1.5 text-[10px] font-mono">
                                  <span className="text-blue-600 font-bold">P:{item.protcnt}</span>
                                  <span className="text-amber-600 font-bold">C:{item.choavldf}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    addIngredient(item);
                                    setSearchTerm('');
                                  }}
                                  className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Escape Hatch: Alimento No Encontrado */
                        <div className="mb-8 p-6 bg-slate-50 dark:bg-[#131826] border border-dashed border-emerald-300 dark:border-emerald-800/60 rounded-2xl text-center space-y-3">
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl">
                            🍽️
                          </div>
                          <div>
                            <h4 className="font-montserrat font-bold text-slate-800 dark:text-slate-200 text-sm">
                              Mmm, no encontramos "{debouncedSearch}" en la base de datos...
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-lato max-w-sm mx-auto mt-1">
                              ¿Quieres agregarlo tú mismo con sus valores nutricionales?
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setIsCreatingCustom(true);
                              setCustomName(searchTerm);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-montserrat font-bold text-xs shadow-md transition-all"
                          >
                            <Plus className="w-4 h-4" /> Crear Ingrediente Personalizado
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Selected Ingredients */}
                  <div className="space-y-3">
                    <h3 className="font-montserrat font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Ingredientes Seleccionados ({ingredients.length})</span>
                      {!isCreatingCustom && !debouncedSearch && (
                        <button
                          onClick={() => {
                            setIsCreatingCustom(true);
                            setCustomName('');
                          }}
                          className="text-xs text-emerald-600 dark:text-emerald-400 font-lato hover:underline font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Añadir personalizado
                        </button>
                      )}
                    </h3>
                    
                    {ingredients.length === 0 ? (
                      <div className="text-center p-8 bg-slate-50/50 dark:bg-[#131826]/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-pulse">
                          🍲
                        </div>
                        <div>
                          <h4 className="font-montserrat font-bold text-slate-700 dark:text-slate-200 text-sm">
                            Tu receta está esperando sus ingredientes
                          </h4>
                          <p className="text-slate-500 dark:text-slate-400 font-lato text-xs mt-1">
                            ¡Busca el primero arriba para empezar a sumar macros! 👆
                          </p>
                        </div>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {ingredients.map(ing => {
                          const ratio = ing.amount / 100;
                          return (
                            <motion.div
                              key={ing.saraId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 bg-slate-50 dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 shadow-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-lato font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{ing.name}</p>
                                  {ing.saraId.startsWith('custom-') && (
                                    <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded shrink-0">
                                      Personalizado
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 text-xs font-mono mt-1">
                                  <span className="text-blue-600 dark:text-blue-400">P: {(ing.protPer100g * ratio).toFixed(1)}g</span>
                                  <span className="text-amber-600 dark:text-amber-400">C: {(ing.carbsPer100g * ratio).toFixed(1)}g</span>
                                  <span className="text-rose-600 dark:text-rose-400">G: {(ing.fatPer100g * ratio).toFixed(1)}g</span>
                                  <span className="text-slate-500">{(ing.calsPer100g * ratio).toFixed(0)} kcal</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0">
                                <input
                                  type="number"
                                  value={ing.amount || ''}
                                  onChange={(e) => updateIngredientAmount(ing.saraId, Number(e.target.value))}
                                  placeholder="100"
                                  className="w-20 px-2 py-1.5 text-sm bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white text-center font-lato"
                                />
                                <span className="text-slate-500 text-sm">{ing.unit}</span>
                                <button
                                  onClick={() => removeIngredient(ing.saraId)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {/* Sticky Total Bar (colapsa suavemente cuando el buscador está en foco para evitar solapamiento con teclado móvil) */}
                <AnimatePresence>
                  {!isSearchFocused && ingredients.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0a0d16]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 shadow-lg"
                    >
                      <div className="flex items-center justify-between max-w-lg mx-auto">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Utensils className="w-3 h-3" /> Total por porción ({servings} {servings === 1 ? 'plato' : 'platos'})
                          </p>
                          <div className="flex gap-3 text-sm font-mono font-bold">
                            <span className="text-blue-600 dark:text-blue-400">P: {totals.protein.toFixed(1)}g</span>
                            <span className="text-amber-600 dark:text-amber-400">C: {totals.carbs.toFixed(1)}g</span>
                            <span className="text-rose-600 dark:text-rose-400">G: {totals.fats.toFixed(1)}g</span>
                            <span className="text-slate-700 dark:text-slate-300">{totals.calories.toFixed(0)} kcal</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-montserrat font-black text-slate-800 dark:text-white">
                    ¡Tu receta está lista! ✅
                  </h2>
                </div>

                <div className="bg-slate-50 dark:bg-[#131826] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-montserrat font-black text-slate-800 dark:text-white mb-3">
                    {recipeName}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {servings} porciones
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {prepTimeMin} min
                    </span>
                    {selectedTags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
                        Ingredientes ({ingredients.length})
                      </h4>
                      <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {ingredients.map(ing => (
                          <li key={ing.saraId} className="text-sm font-lato text-slate-700 dark:text-slate-300 flex justify-between">
                            <span className="line-clamp-1 pr-2">{ing.name}</span>
                            <span className="font-mono text-slate-400 shrink-0">{ing.amount}{ing.unit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider text-right">
                        Por porción
                      </h4>
                      <div className="flex flex-col gap-2 items-end font-mono text-sm">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg font-bold">
                          Prot: {totals.protein.toFixed(1)}g
                        </span>
                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg font-bold">
                          Carb: {totals.carbs.toFixed(1)}g
                        </span>
                        <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-lg font-bold">
                          Grasa: {totals.fats.toFixed(1)}g
                        </span>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-bold mt-1">
                          {totals.calories.toFixed(0)} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0a0d16] flex justify-between items-center shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(prev => (prev - 1) as 1|2|3)}
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-lato font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          ) : (
            <div />
          )}

          {currentStep === 1 && (
            <button
              onClick={handleProceedToStep2}
              disabled={recipeName.length < 3}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-montserrat font-bold transition-all shadow-md shadow-emerald-500/20 disabled:shadow-none"
            >
              Siguiente: Ingredientes <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 2 && (
            <button
              onClick={() => setCurrentStep(3)}
              disabled={ingredients.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl font-montserrat font-bold transition-all shadow-md shadow-emerald-500/20 disabled:shadow-none"
            >
              Revisar y Guardar <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep === 3 && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-montserrat font-black text-lg transition-all shadow-lg shadow-emerald-500/30"
            >
              Guardar Receta <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


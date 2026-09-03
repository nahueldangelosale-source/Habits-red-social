import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChefHat, 
  Truck, 
  Users, 
  ArrowRightLeft, 
  Sparkles, 
  Utensils, 
  Sun, 
  Moon, 
  Coffee, 
  Flame, 
  PieChart, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useNutritionStore, 
  DAYS_OF_WEEK, 
  DAYS_OF_WEEK_SHORT, 
  getCurrentDayOfWeekName,
  type DailyMeal,
  type DailyMealOption
} from '../../stores/useNutritionStore';
import { FullMealSwapModal } from '../nutrition/FullMealSwapModal';
import { getHouseholdMeasure } from '../../utils/householdMeasures';

export const WeeklyMealPlanTab: React.FC = () => {
  const currentDayName = getCurrentDayOfWeekName();
  const initialIndex = Math.max(0, DAYS_OF_WEEK.indexOf(currentDayName));
  const [activeDayIndex, setActiveDayIndex] = useState(initialIndex !== -1 ? initialIndex : 0);

  const selectedDayName = DAYS_OF_WEEK[activeDayIndex] || 'Lunes';
  const isToday = selectedDayName.toLowerCase() === currentDayName.toLowerCase();

  const { 
    weeklySchedule, 
    weeklyLogistics, 
    setWeeklyLogistic, 
    updateWeeklyMealOption 
  } = useNutritionStore();

  // Swap Modal State
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [targetMealForSwap, setTargetMealForSwap] = useState<{
    id: string;
    mealType: string;
    name: string;
    calories: number;
  } | null>(null);

  // Obtener comidas del día seleccionado
  const mealsForDay: DailyMeal[] = weeklySchedule[selectedDayName] || weeklySchedule['Lunes'] || [];
  const dayLogistics = weeklyLogistics[selectedDayName] || {};

  // Cálculo de totales diarios
  const dayTotals = mealsForDay.reduce((acc, meal) => {
    const activeOption = meal.options[0];
    if (activeOption) {
      acc.calories += activeOption.totalMacros.calories;
      acc.protein += activeOption.totalMacros.protein;
      acc.carbs += activeOption.totalMacros.carbs;
      acc.fats += activeOption.totalMacros.fats;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const handleOpenSwap = (meal: DailyMeal) => {
    const activeOpt = meal.options[0];
    setTargetMealForSwap({
      id: meal.id,
      mealType: meal.mealType,
      name: activeOpt ? activeOpt.name : meal.mealType,
      calories: activeOpt ? activeOpt.totalMacros.calories : 400
    });
    setIsSwapModalOpen(true);
  };

  const handleApplyMealSwap = (newOption: DailyMealOption) => {
    if (targetMealForSwap) {
      updateWeeklyMealOption(selectedDayName, targetMealForSwap.id, newOption);
      toast.success(`¡Plato actualizado para ${selectedDayName}!`, { icon: '🍽️' });
    }
  };

  const getMealIcon = (mealType: string) => {
    const t = mealType.toLowerCase();
    if (t.includes('desayuno')) return <Coffee size={14} className="text-amber-500" />;
    if (t.includes('almuerzo')) return <Sun size={14} className="text-amber-500" />;
    if (t.includes('merienda') || t.includes('snack')) return <Utensils size={14} className="text-indigo-500" />;
    if (t.includes('cena')) return <Moon size={14} className="text-purple-500" />;
    return <Utensils size={14} className="text-emerald-500" />;
  };

  return (
    <div className="space-y-4 max-w-md mx-auto font-lato text-slate-900 dark:text-white">
      
      {/* Banner Informativo & Sincronización */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 flex items-start gap-2.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-xs shadow-indigo-600/30">
          <Calendar size={15} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-black font-montserrat text-indigo-950 dark:text-indigo-200">
              Organización & Logística Semanal
            </h4>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Sincronizado
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-snug mt-0.5">
            Coordinado con tu Menú Diario y Plan Nutricional. Personaliza tus platos y anticipa tus ingestas sin fricción.
          </p>
        </div>
      </div>

      {/* Selector Horizontal de Días de la Semana (LUN a DOM) */}
      <div className="flex justify-between items-center gap-1 bg-white dark:bg-[#0a0d16] p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs overflow-x-auto no-scrollbar">
        {DAYS_OF_WEEK_SHORT.map((short, idx) => {
          const isSelected = activeDayIndex === idx;
          const dayFullName = DAYS_OF_WEEK[idx];
          const isTodayBtn = dayFullName.toLowerCase() === currentDayName.toLowerCase();

          return (
            <button
              key={short}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex-1 py-2 px-1 rounded-xl text-center transition-all relative ${
                isSelected
                  ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/25'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs'
              }`}
            >
              <span className="block text-[10px] font-montserrat uppercase tracking-wider">{short}</span>
              <span className="block text-[9px] opacity-75 mt-0.5">
                {isTodayBtn ? 'Hoy' : `Día ${idx + 1}`}
              </span>
              {isTodayBtn && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Resumen de Macros del Día Seleccionado */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Total {selectedDayName} {isToday && '• (Hoy)'}
          </span>
          <p className="text-base font-black font-montserrat text-slate-900 dark:text-white leading-tight mt-0.5">
            {dayTotals.calories} <span className="text-xs font-bold text-slate-400">kcal totales</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold font-mono">
          <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
            {dayTotals.protein}g P
          </span>
          <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
            {dayTotals.carbs}g C
          </span>
          <span className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
            {dayTotals.fats}g G
          </span>
        </div>
      </div>

      {/* Lista Dinámica de Comidas Prescritas para este Día */}
      <div className="space-y-3.5">
        {mealsForDay.map((meal) => {
          const activeOpt = meal.options[0];
          const strategy = dayLogistics[meal.id] || 'cocina';

          return (
            <div 
              key={meal.id} 
              className="p-4 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3 transition-all hover:border-indigo-200 dark:hover:border-indigo-500/20"
            >
              {/* Cabecera de la Comida */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                    {getMealIcon(meal.mealType)}
                  </div>
                  <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white uppercase tracking-wider">
                    {meal.mealType} • {selectedDayName}
                  </h5>
                </div>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {meal.time}
                </span>
              </div>

              {/* Plato Planificado & Botón Cambiar */}
              {activeOpt && (
                <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                        Plato Planificado
                      </span>
                      <p className="text-xs font-black font-montserrat text-slate-800 dark:text-zinc-100 truncate mt-0.5">
                        {activeOpt.name}
                      </p>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 font-mono">
                        {activeOpt.totalMacros.calories} kcal • {activeOpt.totalMacros.protein}g P • {activeOpt.totalMacros.carbs}g C • {activeOpt.totalMacros.fats}g G
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenSwap(meal)}
                      className="py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-[11px] font-black font-montserrat flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-xs"
                      title="Cambiar receta completa para este día"
                    >
                      <Sparkles size={12} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Cambiar</span>
                    </button>
                  </div>

                  {/* Ingredientes con Medidas Caseras */}
                  <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 space-y-1">
                    {activeOpt.ingredients.map(ing => {
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
              )}

              {/* Selector de Estrategia Logística */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  ¿Cómo lo vas a resolver?
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'cocina', icon: <ChefHat size={13} />, label: 'Cocina' },
                    { id: 'delivery', icon: <Truck size={13} />, label: 'Delivery' },
                    { id: 'social', icon: <Users size={13} />, label: 'Social' }
                  ].map((strat) => {
                    const isSelected = strategy === strat.id;
                    return (
                      <button
                        key={strat.id}
                        onClick={() => setWeeklyLogistic(selectedDayName, meal.id, strat.id as any)}
                        className={`py-2 px-1.5 rounded-xl border text-center text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? strat.id === 'cocina'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                              : strat.id === 'delivery'
                                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs'
                                : 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 shadow-xs'
                            : 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {strat.icon}
                        <span className="text-[11px]">{strat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Reemplazo Isocalórico Completo para este día */}
      {targetMealForSwap && (
        <FullMealSwapModal
          isOpen={isSwapModalOpen}
          onClose={() => {
            setIsSwapModalOpen(false);
            setTargetMealForSwap(null);
          }}
          mealType={targetMealForSwap.mealType}
          currentMealName={targetMealForSwap.name}
          targetCalories={targetMealForSwap.calories}
          onSelectMealOption={handleApplyMealSwap}
        />
      )}
    </div>
  );
};

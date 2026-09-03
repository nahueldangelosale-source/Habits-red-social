import React, { useState } from 'react';
import { Target, Flame, ChevronRight, CheckCircle2, Share2, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { useNutritionStore } from '../../stores/useNutritionStore';
import { AestheticStoryStudio } from './AestheticStoryStudio';

export interface NutritionWidgetProps {
    onViewMealPlan?: () => void;
}

export const NutritionWidget: React.FC<NutritionWidgetProps> = ({ onViewMealPlan }) => {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { nutrition } = usePlanBuilderStore();
    const getDailyMacroProgress = useNutritionStore(s => s.getDailyMacroProgress);
    const completedMeals = useNutritionStore(s => s.completedMeals);
    const dailyMealPlan = useNutritionStore(s => s.dailyMealPlan);
    
    const consumed = getDailyMacroProgress();
    const completedCount = Object.keys(completedMeals).length;
    const totalMeals = dailyMealPlan.length;

    const targetCalories = parseInt(nutrition?.calories) || 2000;
    const targetProtein = parseInt(nutrition?.protein) || 150;
    const targetCarbs = parseInt(nutrition?.carbs) || 200;
    const targetFats = parseInt(nutrition?.fats) || 60;

    const macros = {
        protein: { current: consumed.protein, target: targetProtein, label: 'Proteína', color: 'bg-blue-500' },
        carbs: { current: consumed.carbs, target: targetCarbs, label: 'Carbos', color: 'bg-amber-500' },
        fats: { current: consumed.fats, target: targetFats, label: 'Grasas', color: 'bg-rose-500' },
    };
    
    const kcal = { current: consumed.calories, target: targetCalories };
    const kcalPercent = Math.min(100, Math.round((kcal.current / (kcal.target || 1)) * 100));

    return (
        <div className="bg-white dark:bg-[#0a0d16] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden font-lato transition-all">
            {/* Header */}
            <div 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 gap-2 cursor-pointer select-none hover:bg-slate-100/50 dark:hover:bg-zinc-900/40 transition-colors"
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                        <Target size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base sm:text-lg font-black font-montserrat text-slate-900 dark:text-white tracking-tight truncate">
                            Nutrición del Día
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Macros & Energía</p>
                            {completedCount > 0 && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                    <CheckCircle2 size={10} /> {completedCount}/{totalMeals}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsShareOpen(true);
                        }}
                        title="Compartir Nutrición en Stories"
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                    >
                        <Share2 size={13} />
                    </button>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs font-montserrat">
                            <Flame size={14} className="fill-emerald-500" />
                            <span>{kcal.current}</span>
                            <span className="text-slate-400 dark:text-zinc-500 font-normal text-[10px]">/{kcal.target} kcal</span>
                        </div>
                        {/* Progress bar kcal */}
                        <div className="w-20 sm:w-24 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${kcalPercent}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="p-1 text-slate-400 dark:text-zinc-500">
                        <ChevronUp size={16} className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>

            {/* Macros Bar Grid (Collapsible) */}
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {/* Proteínas */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">{macros.protein.label}</span>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">{macros.protein.current}g</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (macros.protein.current / (macros.protein.target || 1)) * 100)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full bg-blue-500 rounded-full"
                            />
                        </div>
                        <p className="text-[9px] text-right text-slate-400 mt-1">Meta: {macros.protein.target}g</p>
                    </div>

                    {/* Carbos */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">{macros.carbs.label}</span>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">{macros.carbs.current}g</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (macros.carbs.current / (macros.carbs.target || 1)) * 100)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full bg-amber-500 rounded-full"
                            />
                        </div>
                        <p className="text-[9px] text-right text-slate-400 mt-1">Meta: {macros.carbs.target}g</p>
                    </div>

                    {/* Grasas */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">{macros.fats.label}</span>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">{macros.fats.current}g</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (macros.fats.current / (macros.fats.target || 1)) * 100)}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full bg-rose-500 rounded-full"
                            />
                        </div>
                        <p className="text-[9px] text-right text-slate-400 mt-1">Meta: {macros.fats.target}g</p>
                    </div>
                </div>

                {/* Call to action */}
                {onViewMealPlan && (
                    <button 
                        onClick={onViewMealPlan}
                        className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 font-montserrat font-bold text-xs flex items-center justify-center gap-1 transition-all active:scale-98"
                    >
                        <span>Ver Plan de Comidas Completo</span>
                        <ChevronRight size={14} />
                    </button>
                )}
            </div>
            </motion.div>
            )}
            </AnimatePresence>

            {/* Modal de Compartir en Historias */}
            <AestheticStoryStudio 
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                initialCategory="NUTRITION"
                nutritionData={{
                    calories: kcal.current,
                    proteinG: macros.protein.current,
                    carbsG: macros.carbs.current,
                    fatsG: macros.fats.current
                }}
            />
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Check, Flame, ChevronDown, ChevronUp, AlertCircle, Edit3, Camera, MessageSquare, Activity, Utensils, Sparkles, PieChart, Info, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartSwapModal } from '../nutrition/SmartSwapModal';
import { FullMealSwapModal } from '../nutrition/FullMealSwapModal';
import { MealPhotoValidationModal } from '../nutrition/MealPhotoValidationModal';
import { getHouseholdMeasure } from '../../utils/householdMeasures';
import { useCoachCommunicationStore } from '../../stores/useCoachCommunicationStore';
import { useCoachStore } from '../../stores/useCoachStore';
import { useNutritionStore } from '../../stores/useNutritionStore';

export interface MacroData {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
}

export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    macros: MacroData;
}

export interface MealOption {
    id: string;
    name: string; // Ej: "Tostadas con Palta y Huevo"
    ingredients: Ingredient[];
    totalMacros: MacroData;
}

export interface MealOptionCardProps {
    mealId: string;
    time: string;
    mealType: string;
    options: MealOption[];
    isCompleted?: boolean;
    onCheckIn?: (mealId: string, optionId: string) => void;
}

export const MealOptionCard: React.FC<MealOptionCardProps> = ({
    mealId,
    time,
    mealType,
    options,
    isCompleted = false,
    onCheckIn
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentOptions, setCurrentOptions] = useState<MealOption[]>(options);
    const [activeOptionId, setActiveOptionId] = useState(options[0]?.id);
    
    // Modals state
    const [isSmartSwapOpen, setIsSmartSwapOpen] = useState(false);
    const [isFullMealSwapOpen, setIsFullMealSwapOpen] = useState(false);
    const [isPhotoValidationOpen, setIsPhotoValidationOpen] = useState(false);
    const [selectedIngredientForSwap, setSelectedIngredientForSwap] = useState<string>('');
    const [selectedQuantityForSwap, setSelectedQuantityForSwap] = useState<number>(150);

    const { assignedCoach } = useCoachStore();
    const { sendAthleteMessage } = useCoachCommunicationStore();
    const [selectedPills, setSelectedPills] = useState<string[]>([]);

    useEffect(() => {
        setCurrentOptions(options);
        if (!options.some(o => o.id === activeOptionId)) {
            setActiveOptionId(options[0]?.id);
        }
    }, [options]);

    const activeOption = currentOptions.find(o => o.id === activeOptionId) || currentOptions[0];

    const FEEDBACK_PILLS = [
        { id: 'satisfecho', label: 'Quedé súper bien', color: 'emerald' },
        { id: 'hambre', label: 'Me quedé con hambre', color: 'rose' },
        { id: 'lleno', label: 'Me llené demasiado', color: 'amber' },
        { id: 'digestion', label: 'Me siento liviano/a', color: 'emerald' },
        { id: 'hinchazon', label: 'Me siento hinchado/a', color: 'amber' },
        { id: 'energia', label: '¡Con mucha energía!', color: 'blue' },
        { id: 'ansiedad', label: 'Ganas de algo dulce', color: 'purple' },
    ];

    const togglePill = (id: string) => {
        setSelectedPills(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const { updateDailyMealOption } = useNutritionStore();

    const handleApplyFullMeal = (newOption: MealOption) => {
        setCurrentOptions(prev => {
            const exists = prev.some(o => o.id === newOption.id);
            if (exists) {
                return prev.map(o => o.id === newOption.id ? newOption : o);
            }
            return prev.map(o => o.id === activeOptionId ? newOption : o);
        });
        setActiveOptionId(newOption.id);
        updateDailyMealOption(mealId, newOption);
    };

    const handleApplyIngredientSwap = (swapResult: {
        originalFood: string;
        newFood: string;
        newQuantityGrams: number;
        newMacros: { protein: number; carbs: number; fats: number; calories: number };
    }) => {
        const updatedIngredients = activeOption.ingredients.map(ing => {
            if (ing.name.toLowerCase().includes(swapResult.originalFood.toLowerCase()) ||
                swapResult.originalFood.toLowerCase().includes(ing.name.toLowerCase().split('/')[0].trim())) {
                return {
                    ...ing,
                    name: swapResult.newFood.split('/')[0].trim(),
                    quantity: swapResult.newQuantityGrams,
                    unit: 'g',
                    macros: swapResult.newMacros
                };
            }
            return ing;
        });

        const totalMacros = updatedIngredients.reduce((acc, ing) => ({
            protein: Math.round((acc.protein + ing.macros.protein) * 10) / 10,
            carbs: Math.round((acc.carbs + ing.macros.carbs) * 10) / 10,
            fats: Math.round((acc.fats + ing.macros.fats) * 10) / 10,
            calories: acc.calories + ing.macros.calories
        }), { protein: 0, carbs: 0, fats: 0, calories: 0 });

        const updatedOption: MealOption = {
            ...activeOption,
            ingredients: updatedIngredients,
            totalMacros
        };

        setCurrentOptions(prev => prev.map(opt => opt.id === activeOption.id ? updatedOption : opt));
        updateDailyMealOption(mealId, updatedOption);
    };

    if (!activeOption) return null;

    // Calcular porcentajes del plato para el Pie Chart pedagógico
    const totalMacros = activeOption.totalMacros.protein + activeOption.totalMacros.carbs + activeOption.totalMacros.fats;
    const proteinPct = totalMacros ? (activeOption.totalMacros.protein / totalMacros) * 100 : 33;
    const carbsPct = totalMacros ? (activeOption.totalMacros.carbs / totalMacros) * 100 : 33;
    const fatsPct = totalMacros ? (activeOption.totalMacros.fats / totalMacros) * 100 : 34;

    return (
        <div className={`
            border-2 rounded-3xl transition-all duration-300 font-lato shadow-xs hover:shadow-md overflow-hidden
            ${isCompleted 
                ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/10' 
                : 'border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0a0d16]'}
        `}>
            {/* Cabecera / Resumen (Siempre visible) */}
            <div 
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3.5">
                    {/* Time Badge */}
                    <div className="text-center min-w-[48px] p-2 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Hora</span>
                        <span className={`text-sm font-black font-montserrat tracking-tight ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                            {time}
                        </span>
                    </div>

                    {/* Meal Name & Preview */}
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`text-base font-black font-montserrat tracking-tight capitalize ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                {mealType}
                            </h3>
                            {isCompleted && (
                                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                                    <Check size={11} /> Listo
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-bold flex items-center gap-1.5">
                            <span className="truncate max-w-[180px] sm:max-w-[260px]">{activeOption.name}</span>
                            <span>•</span>
                            <span className="text-slate-700 dark:text-zinc-300 font-black shrink-0">{activeOption.totalMacros.calories} kcal</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Botón rápido si no está expandido y no completado */}
                    {!isExpanded && !isCompleted && currentOptions.length > 0 && onCheckIn && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onCheckIn(mealId, activeOption.id); }}
                            className="w-9 h-9 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-center transition-all shadow-xs"
                            title="Marcar como consumido"
                        >
                            <Check size={16} strokeWidth={3} />
                        </button>
                    )}
                    
                    <button className="text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-white transition-colors bg-slate-50 dark:bg-zinc-800/80 rounded-full p-2 border border-slate-200/60 dark:border-white/5">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Contenido Expandido */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-white/5"
                        style={{ overflow: 'hidden' }}
                        onAnimationComplete={() => {
                            const el = document.getElementById(`meal-expanded-${mealId}`);
                            if(el) el.style.overflow = 'visible';
                        }}
                        id={`meal-expanded-${mealId}`}
                    >
                        <div className="p-4 sm:p-5 space-y-4">

                            {/* Barra de Menú Seleccionado + Cambiar Menú Completo */}
                            <div className="flex items-center justify-between bg-slate-50/80 dark:bg-zinc-900/60 p-3 sm:p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                                <div className="min-w-0 pr-2">
                                    <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Utensils size={14} className="text-emerald-500 shrink-0" />
                                        <span className="truncate">{activeOption.name}</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold mt-0.5">
                                        {activeOption.ingredients.length} alimentos • {activeOption.totalMacros.calories} kcal totales
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsFullMealSwapOpen(true)}
                                    className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 dark:from-indigo-950/40 dark:to-emerald-950/40 hover:from-indigo-500/20 hover:to-emerald-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300/80 dark:border-indigo-500/30 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-xs shrink-0"
                                    title="Elegir otra receta completa para esta comida"
                                >
                                    <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
                                    <span>Cambiar Menú Completo</span>
                                </button>
                            </div>

                            {/* Lista de Alimentos con Medidas Caseras Pedagógicas & Botón Cambiar Individual */}
                            <div className="space-y-2">
                                {activeOption.ingredients.map(ing => {
                                    const household = getHouseholdMeasure(ing.name, ing.quantity, ing.unit);
                                    return (
                                        <div 
                                            key={ing.id} 
                                            className="p-3 rounded-2xl bg-white dark:bg-zinc-900/40 border border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-500/20 transition-all group"
                                        >
                                            <div className="min-w-0">
                                                <span className="text-xs font-black font-montserrat text-slate-800 dark:text-zinc-200 block truncate">
                                                    {ing.name}
                                                </span>
                                                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400 font-bold flex-wrap">
                                                    <span>{ing.quantity} {ing.unit}</span>
                                                    {household && (
                                                        <span className="text-indigo-600 dark:text-indigo-400 font-black">
                                                            • ({household})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 shrink-0">
                                                <div className="text-right">
                                                    <span className="text-xs font-black font-mono text-slate-800 dark:text-zinc-200 block">
                                                        {ing.macros.calories} kcal
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold mt-0.5">
                                                        <span className="text-blue-600 dark:text-blue-400">{ing.macros.protein}g P</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-amber-600 dark:text-amber-400">{ing.macros.carbs}g C</span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-rose-600 dark:text-rose-400">{ing.macros.fats}g G</span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedIngredientForSwap(ing.name);
                                                        setSelectedQuantityForSwap(ing.quantity);
                                                        setIsSmartSwapOpen(true);
                                                    }}
                                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300 border border-slate-200/60 dark:border-white/5 text-[10px] font-black flex items-center gap-1 transition-all active:scale-95 shrink-0 shadow-xs"
                                                    title={`Cambiar ${ing.name} por otro alimento equivalente`}
                                                >
                                                    <RefreshCw size={10} className="text-emerald-500" />
                                                    <span>Cambiar</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* EL PLATO NUTRICIONAL — Visual & Pedagógico */}
                            <div className="p-4 rounded-3xl bg-slate-50/90 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/10 space-y-3.5 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <PieChart size={16} className="text-indigo-500" />
                                        <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white uppercase tracking-wider">
                                            El Plato Nutricional
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-white/5">
                                        Distribución de Macros
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] items-center gap-4">
                                    {/* Donut Chart Visual */}
                                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                        <div 
                                            className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-sm flex items-center justify-center"
                                            style={{
                                                background: `conic-gradient(
                                                    #3b82f6 0% ${proteinPct}%, 
                                                    #f59e0b ${proteinPct}% ${proteinPct + carbsPct}%, 
                                                    #f43f5e ${proteinPct + carbsPct}% 100%
                                                )`
                                            }}
                                        >
                                            <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-900 flex flex-col items-center justify-center shadow-inner">
                                                <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white leading-none">
                                                    {activeOption.totalMacros.calories}
                                                </span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">kcal</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3 Pilares Pedagógicos para Aprendizaje Fácil */}
                                    <div className="space-y-1.5 text-xs">
                                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                                                <div>
                                                    <span className="font-black text-blue-700 dark:text-blue-300 block text-[11px]">
                                                        Proteína ({proteinPct.toFixed(0)}%)
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">Reparación muscular & saciedad</span>
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-slate-700 dark:text-zinc-300 text-xs">
                                                {activeOption.totalMacros.protein}g
                                            </span>
                                        </div>

                                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
                                                <div>
                                                    <span className="font-black text-amber-700 dark:text-amber-300 block text-[11px]">
                                                        Carbohidratos ({carbsPct.toFixed(0)}%)
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">Energía para el día y entrenos</span>
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-slate-700 dark:text-zinc-300 text-xs">
                                                {activeOption.totalMacros.carbs}g
                                            </span>
                                        </div>

                                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></div>
                                                <div>
                                                    <span className="font-black text-rose-700 dark:text-rose-300 block text-[11px]">
                                                        Grasas Saludables ({fatsPct.toFixed(0)}%)
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">Salud hormonal y absorción</span>
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-slate-700 dark:text-zinc-300 text-xs">
                                                {activeOption.totalMacros.fats}g
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Sticky Bottom CTA & Photo Validation */}
                            {!isCompleted && onCheckIn && (
                                <div className="pt-2 space-y-2.5">
                                    <button 
                                        onClick={() => onCheckIn(mealId, activeOption.id)}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-montserrat font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                        <span>Marcar como Consumido</span>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={() => setIsPhotoValidationOpen(true)}
                                        className="w-full bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-montserrat font-black text-xs uppercase tracking-wider py-3 rounded-2xl flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-white/10 shadow-xs active:scale-[0.98]"
                                    >
                                        <Camera size={15} className="text-emerald-500" />
                                        <span>Validar con Foto de Plato (Coach)</span>
                                    </button>

                                    <p className="text-[10px] text-center text-slate-400 dark:text-zinc-500 font-medium px-2 leading-relaxed">
                                        📸 Saca la foto <strong className="text-slate-600 dark:text-zinc-400">desde arriba (90°)</strong> para que el profesional valide tus porciones y fije tu horario de ingesta.
                                    </p>
                                </div>
                            )}

                            {/* Feedback Pills for Completed Meals */}
                            {isCompleted && (
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={15} className="text-slate-400" />
                                        <h4 className="text-xs font-black font-montserrat text-slate-800 dark:text-zinc-200">
                                            ¿Cómo te cayó la comida? (Opcional)
                                        </h4>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5">
                                        {FEEDBACK_PILLS.map(pill => {
                                            const isSelected = selectedPills.includes(pill.id);
                                            const colorClasses: Record<string, { bg: string, text: string, border: string, selectedBg: string, selectedText: string, selectedBorder: string }> = {
                                                emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', selectedBg: 'bg-emerald-500 dark:bg-emerald-600', selectedText: 'text-white', selectedBorder: 'border-emerald-500 dark:border-emerald-600' },
                                                rose: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-500/20', selectedBg: 'bg-rose-500 dark:bg-rose-600', selectedText: 'text-white', selectedBorder: 'border-rose-500 dark:border-rose-600' },
                                                amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20', selectedBg: 'bg-amber-500 dark:bg-amber-600', selectedText: 'text-white', selectedBorder: 'border-amber-500 dark:border-amber-600' },
                                                blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20', selectedBg: 'bg-blue-500 dark:bg-blue-600', selectedText: 'text-white', selectedBorder: 'border-blue-500 dark:border-blue-600' },
                                                purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20', selectedBg: 'bg-purple-500 dark:bg-purple-600', selectedText: 'text-white', selectedBorder: 'border-purple-500 dark:border-purple-600' }
                                            };
                                            
                                            const colors = colorClasses[pill.color] || colorClasses.emerald;
                                            
                                            return (
                                                <button
                                                    key={pill.id}
                                                    type="button"
                                                    onClick={() => togglePill(pill.id)}
                                                    className={`
                                                        px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border
                                                        ${isSelected 
                                                            ? `${colors.selectedBg} ${colors.selectedText} ${colors.selectedBorder} shadow-xs scale-102` 
                                                            : `${colors.bg} ${colors.text} ${colors.border} hover:opacity-80`
                                                        }
                                                    `}
                                                >
                                                    {pill.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 1. Modal: Cambiar Menú Completo (Receta entera Isocalórica) */}
            <FullMealSwapModal
                isOpen={isFullMealSwapOpen}
                onClose={() => setIsFullMealSwapOpen(false)}
                mealType={mealType}
                currentMealName={activeOption.name}
                targetCalories={activeOption.totalMacros.calories}
                onSelectMealOption={handleApplyFullMeal}
            />

            {/* 2. Modal: Cambiar Alimento Individual (Bioquímica 1 a 1) */}
            <SmartSwapModal
                isOpen={isSmartSwapOpen}
                onClose={() => setIsSmartSwapOpen(false)}
                mealId={mealId}
                mealType={mealType}
                initialFoodName={selectedIngredientForSwap || activeOption.ingredients[0]?.name || 'Peceto / Cuadril Magro'}
                initialQuantityGrams={selectedQuantityForSwap || activeOption.ingredients[0]?.quantity || 180}
                mealIngredients={activeOption.ingredients.map(i => ({ name: i.name, quantity: i.quantity, unit: i.unit }))}
                onApplySwap={handleApplyIngredientSwap}
            />

            {/* 3. Modal: Validación con Foto de Plato para el Coach */}
            <MealPhotoValidationModal
                isOpen={isPhotoValidationOpen}
                onClose={() => setIsPhotoValidationOpen(false)}
                mealId={mealId}
                mealType={mealType}
                mealName={activeOption.name}
                calories={activeOption.totalMacros.calories}
                macros={activeOption.totalMacros}
                onConfirmCheckIn={() => onCheckIn?.(mealId, activeOption.id)}
            />
        </div>
    );
};

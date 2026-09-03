import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Target, Award, Zap, Star, X, Plus, Camera, MessageSquare, 
  Activity, ShoppingCart, Calendar, ChevronDown, ChevronUp, Sparkles, CheckCircle2 
} from 'lucide-react';
import { MealOptionCard, type MealOption } from './MealOptionCard';
import { ShoppingListOrchestrator } from '../nutrition/ShoppingListOrchestrator';
import { WeeklyMealPlanTab } from './WeeklyMealPlanTab';
import { SetupNutritionWizardModal } from './SetupNutritionWizardModal';

import { useNutritionStore } from '../../stores/useNutritionStore';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useCoachStore } from '../../stores/useCoachStore';

interface AthleteNutritionDashboardProps {
    onBack: () => void;
}

export const AthleteNutritionDashboard: React.FC<AthleteNutritionDashboardProps> = ({ onBack }) => {
    const dailyMealPlan = useNutritionStore(s => s.dailyMealPlan);
    const completedMeals = useNutritionStore(s => s.completedMeals);
    const completeMeal = useNutritionStore(s => s.completeMeal);
    
    const { hasAssignedCoach, assignedCoach } = useCoachStore();
    const hasCoachAccess = hasAssignedCoach && Boolean(assignedCoach);
    const [isNutritionDraftConfigured, setIsNutritionDraftConfigured] = useState(() => {
        return localStorage.getItem('nutrition_draft_configured') === 'true' || Boolean(dailyMealPlan && dailyMealPlan.length > 0 && dailyMealPlan[0]?.options?.length > 0);
    });
    
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [hasSeenCompletion, setHasSeenCompletion] = useState(false);
    const [activeTab, setActiveTab] = useState<'menu' | 'weekly' | 'shopping'>('menu');
    const [isCycleExpanded, setIsCycleExpanded] = useState(false);
    
    // Ingesta Extra (Fuera de Plan) State
    const [showExtraMealModal, setShowExtraMealModal] = useState(false);
    const [extraMealNote, setExtraMealNote] = useState('');
    const [extraMealSubmitted, setExtraMealSubmitted] = useState(false);
    
    // Logística Semanal State
    
    const [showNutritionWizard, setShowNutritionWizard] = useState(false);

    const { cycleName, phases, nutrition } = usePlanBuilderStore();
    const { goalTags } = useOnboardingPTStore();

    // Dinamismo de Fase vinculado al Plan Builder
    const currentPhaseTitle = nutrition?.phase1 || phases?.[0]?.name || (cycleName !== 'Nueva Plantilla' ? cycleName : null) || 'Superávit Proteico & Recomposición Muscular';
    const totalWeeks = phases?.[0]?.weeksCount || 4;
    const currentWeek = 2;
    const phaseProgressPercent = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));
    const phaseSubtitle = `Ciclo: ${currentPhaseTitle} • Semana ${currentWeek} de ${totalWeeks}`;

    const getPhaseDescription = () => {
        if (nutrition?.target === 'Déficit' || goalTags?.includes('FAT_LOSS')) {
            return 'Etapa de déficit calórico controlado: Construir adherencia y optimizar la pérdida de grasa preservando al 100% tu masa muscular.';
        }
        if (nutrition?.target === 'Superávit' || goalTags?.includes('HIPERTROFIA') || goalTags?.includes('HYPERTROPHY') || goalTags?.includes('MUSCLE_GAIN')) {
            return 'Etapa de superávit estructurado: Disponibilidad energética óptima y aporte proteico para maximizar la síntesis muscular y fuerza.';
        }
        if (goalTags?.includes('BODY_RECOMP') || goalTags?.includes('RECOMPOSITION')) {
            return 'Etapa de recomposición corporal: Balance energético ajustado, alta densidad de nutrientes y ciclado de carbohidratos según tu entrenamiento.';
        }
        return 'Etapa de recomposición corporal: Balance energético ajustado, alta densidad de nutrientes y ciclado de carbohidratos según tu entrenamiento.';
    };

    const totalMeals = dailyMealPlan.length || 1;
    const adherenceScore = Math.round((Object.keys(completedMeals).length / totalMeals) * 100) || 0;

    useEffect(() => {
        if (adherenceScore >= 100 && !hasSeenCompletion) {
            setShowCompletionModal(true);
            setHasSeenCompletion(true);
        }
    }, [adherenceScore, hasSeenCompletion]);

    const handleExtraMealSubmit = () => {
        if (!extraMealNote.trim()) return;
        setExtraMealSubmitted(true);
        setTimeout(() => {
            setShowExtraMealModal(false);
            setExtraMealSubmitted(false);
            setExtraMealNote('');
        }, 1500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full bg-slate-50 dark:bg-[#04060a] text-slate-900 dark:text-white font-lato"
        >
            {/* Header Limpio & Segmented Control */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#0a0d16]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 shadow-xs">
                <div className="flex items-center justify-between mb-3 max-w-md mx-auto">
                    <button 
                        onClick={onBack}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
                    >
                        <ArrowLeft size={16} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    
                    <h1 className="text-base font-black font-montserrat uppercase tracking-wider text-slate-900 dark:text-white">
                        Nutrición
                    </h1>

                    <button
                        onClick={() => setShowNutritionWizard(true)}
                        className="py-1 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-montserrat font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                        title="Personalizar datos nutricionales"
                    >
                        <Zap size={12} />
                        <span>Ajustar</span>
                    </button>
                </div>
                
                {/* Segmented Control iOS Style */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-white/5 max-w-md mx-auto w-full">
                    <button 
                        onClick={() => setActiveTab('menu')}
                        className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === 'menu' 
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Activity size={13} />
                        <span>Menú Diario</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('weekly')}
                        className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === 'weekly' 
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Calendar size={13} />
                        <span>Plan Semanal</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('shopping')}
                        className={`flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === 'shopping' 
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <ShoppingCart size={13} />
                        <span>Compras</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            {!hasCoachAccess && !isNutritionDraftConfigured ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 pb-32 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
                            🔒
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                Borrador Nutricional Requerido
                            </span>
                            <h3 className="text-xl font-black font-montserrat text-slate-900 dark:text-white mt-2">
                                Desbloqueá Tu Plan de Comidas
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                                Para calcular tu gasto metabólico basal (TMB), requerimiento proteico y opciones de comidas adaptadas, completá 3 datos simples (30 segundos).
                            </p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-left space-y-2 text-xs">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                <span>Cálculo científico de calorías según tu peso, altura y edad.</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                <span>Distribución de macros (Proteína, Carbohidratos y Grasas saludables).</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                <span>Filtrado automático de alergias o intolerancias alimentarias.</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowNutritionWizard(true)}
                            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-montserrat font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Sparkles size={15} />
                            <span>Calcular y Desbloquear Mi Plan Nutricional</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 pb-32">
                    {activeTab === 'menu' && (
                        <div className="max-w-md mx-auto space-y-4 relative">
                        
                        {/* ═══════════════════════════════════════════════════════════ */}
                        {/* ACORDEÓN DESPLEGABLE DE CICLO & PAUTA ENERGÉTICA          */}
                        {/* ═══════════════════════════════════════════════════════════ */}
                        <div className="bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all">
                            <button
                                onClick={() => setIsCycleExpanded(!isCycleExpanded)}
                                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                        <Activity size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                                                Semana {currentWeek} de {totalWeeks}
                                            </span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0">
                                                {phaseProgressPercent}%
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-black font-montserrat text-slate-800 dark:text-white truncate">
                                            {currentPhaseTitle}
                                        </h4>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors shrink-0">
                                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
                                        {isCycleExpanded ? 'Ocultar' : 'Ver Pauta'}
                                    </span>
                                    {isCycleExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isCycleExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-3"
                                    >
                                        {/* Descripción & Barra de Progreso */}
                                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-lato pt-1">
                                            {getPhaseDescription()}
                                        </p>

                                        <div>
                                            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                                                <span>Progreso de Fase</span>
                                                <span>{phaseProgressPercent}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" 
                                                    style={{ width: `${phaseProgressPercent}%` }} 
                                                />
                                            </div>
                                        </div>

                                        {/* Pauta Energética de Hoy Integrada */}
                                        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                            <div className="flex items-start gap-2.5">
                                                <span className="text-base">🔥</span>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                                        Pauta Energética de Hoy
                                                    </p>
                                                    <p className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5">
                                                        Día de Entrenamiento: Mayor disponibilidad de carbohidratos para energía y síntesis muscular.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                                <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                                                    🌾 Sin TACC
                                                </span>
                                                <span className="text-[9px] font-bold px-2 py-0.5 bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 rounded-md border border-sky-200 dark:border-sky-800/50">
                                                    🥛 Sin Lactosa
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botón para abrir el Wizard de Nutrición */}
                                        <div className="flex justify-end pt-1">
                                            <button
                                                onClick={() => setShowNutritionWizard(true)}
                                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-montserrat"
                                            >
                                                <Sparkles size={12} />
                                                <span>Personalizar calorías o intolerancias</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Micro-Refuerzo Adherencia */}
                        <div className="bg-white dark:bg-[#0a0d16] rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Target size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Adherencia Hoy
                                    </p>
                                    <p className="text-xl font-black font-montserrat tracking-tight text-slate-900 dark:text-white leading-none mt-1">
                                        {adherenceScore}%
                                    </p>
                                </div>
                            </div>
                            
                            {adherenceScore > 0 && (
                                <div className="text-right">
                                    <span className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                                        <Award size={13} /> {adherenceScore >= 100 ? '+1 CG' : 'Progreso'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Lista de Comidas del Día */}
                        <div className="space-y-4 pt-1">
                            {dailyMealPlan.map((meal) => (
                                <div key={meal.id} className="relative z-10">
                                    <MealOptionCard 
                                        mealId={meal.id}
                                        time={meal.time}
                                        mealType={meal.mealType}
                                        options={meal.options}
                                        isCompleted={Boolean(completedMeals[meal.id])}
                                        onCheckIn={() => completeMeal(meal.id)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Botón de Ingesta Extra */}
                        <div className="pt-2">
                            <button
                                onClick={() => setShowExtraMealModal(true)}
                                className="w-full py-3 rounded-2xl bg-white dark:bg-[#0a0d16] border border-dashed border-slate-300 dark:border-zinc-700 hover:border-indigo-400 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold font-montserrat flex items-center justify-center gap-2 transition-all shadow-xs"
                            >
                                <Plus size={15} />
                                <span>Registrar Ingesta Fuera de Plan</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'weekly' && (
                    <WeeklyMealPlanTab />
                )}

                {activeTab === 'shopping' && (
                    <div className="max-w-md mx-auto">
                        <ShoppingListOrchestrator />
                    </div>
                )}
                </div>
            )}

            {/* Modal de Configuración Nutricional */}
            <SetupNutritionWizardModal
                isOpen={showNutritionWizard}
                onClose={() => setShowNutritionWizard(false)}
                onSuccess={() => setIsNutritionDraftConfigured(true)}
            />

            

            {/* Modal de Ingesta Extra */}
            <AnimatePresence>
                {showExtraMealModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl p-5 max-w-sm w-full border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black font-montserrat uppercase">Registrar Ingesta Extra</h3>
                                <button onClick={() => setShowExtraMealModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                    <X size={16} />
                                </button>
                            </div>

                            <textarea
                                placeholder="Ej: 1 café cortado con 2 galletitas de avena..."
                                value={extraMealNote}
                                onChange={(e) => setExtraMealNote(e.target.value)}
                                className="w-full h-24 p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white outline-none resize-none"
                            />

                            <button
                                onClick={handleExtraMealSubmit}
                                disabled={!extraMealNote.trim() || extraMealSubmitted}
                                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-montserrat font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                            >
                                {extraMealSubmitted ? (
                                    <>
                                        <CheckCircle2 size={15} className="text-emerald-300" />
                                        <span>Registrado</span>
                                    </>
                                ) : (
                                    <span>Guardar Ingesta</span>
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Felicitaciones al 100% */}
            <AnimatePresence>
                {showCompletionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full text-center border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                                🏆
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                                    ¡100% de Adherencia Hoy!
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Completaste todas tus comidas planificadas. Ganaste +1 Crédito de Gamificación.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowCompletionModal(false)}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-bold text-xs shadow-md shadow-emerald-600/20"
                            >
                                ¡Genial!
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

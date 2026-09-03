import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, LayoutTemplate, Zap, Power, Moon, BrainCircuit, ShieldAlert, Loader2, FileSignature, History, CheckCircle2 } from 'lucide-react';
import { Reorder, motion } from 'framer-motion';
import { useBuilderStore } from '../../../stores/builderStore';
import { useTheme } from '../../../context/ThemeContext';
import { FoodSearchAutocomplete } from './FoodSearchAutocomplete';
import { ArchetypeSelector } from '../ArchetypeSelector';
import { FoodSwapModal } from './FoodSwapModal';

const calculateMealMacros = (foods: any[]) => {
    return foods.reduce((acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fats: acc.fats + food.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
};

interface DietBuilderCanvasProps {
    activeArchetype?: string;
}

export const DietBuilderCanvas: React.FC<DietBuilderCanvasProps> = ({ activeArchetype = 'RECOMP' }) => {
    const { activeDiet, addFoodToMeal, removeFoodFromMeal, updatePortion, wipeDiet } = useBuilderStore();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const [selectedDay, setSelectedDay] = useState('day_a');
    const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
    const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false);

    // Swap State
    const [swapTarget, setSwapTarget] = useState<{ food: any, mealId: string } | null>(null);

    // Nuevos Estados para la Arquitectura de Inteligencia Clínica
    const [isCopilotEnabled, setIsCopilotEnabled] = useState(true);
    const [isSimulatingRAG, setIsSimulatingRAG] = useState(true);
    const [hasShiftWorkerAlert, setHasShiftWorkerAlert] = useState(true); // Vector de Estilo de Vida
    const [hasSIBOAlert, setHasSIBOAlert] = useState(false);
    const [isSigned, setIsSigned] = useState(false);

    // Advanced Clinical Periodization Phases
    const [selectedPhase, setSelectedPhase] = useState<'phase_1' | 'phase_2' | 'phase_3'>('phase_1');
    // Wearable Sync & Recalibration State
    const [wearableEvent, setWearableEvent] = useState<'NONE' | 'POOR_SLEEP' | 'LOW_HRV'>('NONE');
    // Flip Micro-interaction State for Rescue Recipe
    const [isRescueFlipped, setIsRescueFlipped] = useState(false);
    


    // Get current day's meals safely
    const currentMeals = activeDiet?.days?.[selectedDay] || [];
    const days = ['day_a', 'day_b'];

    // Listen to Wearable Sync Events from GPS Widget
    useEffect(() => {
        const handleWearableSync = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.event) {
                setWearableEvent(detail.event);
            }
        };
        window.addEventListener('wearable-sync', handleWearableSync);
        return () => window.removeEventListener('wearable-sync', handleWearableSync);
    }, []);

    // Simulación del "Efecto Default" (Pre-poblado por RAG)
    useEffect(() => {
        if (isCopilotEnabled && isSimulatingRAG) {
            const timer = setTimeout(() => {
                setIsSimulatingRAG(false);
                setHasSIBOAlert(true); // Trigger de la demostración de incompatibilidad
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isCopilotEnabled, isSimulatingRAG, populateMockDiet]);

    const handleToggleCopilot = () => {
        if (isCopilotEnabled) {
            wipeDiet(); // Limpia el lienzo al apagar el Copiloto
            setHasSIBOAlert(false);
            setWearableEvent('NONE');
        } else {
            setIsSimulatingRAG(true);
        }
        setIsCopilotEnabled(!isCopilotEnabled);
    };

    const handlePrevDay = () => {
        const idx = days.indexOf(selectedDay);
        if (idx > 0) setSelectedDay(days[idx - 1]);
    };

    const handleNextDay = () => {
        const idx = days.indexOf(selectedDay);
        if (idx < days.length - 1) setSelectedDay(days[idx + 1]);
    };

    const handleContextMenu = (e: React.MouseEvent, food: any, mealId: string) => {
        e.preventDefault();
        setSwapTarget({ food, mealId });
    };

    const handleSwapComplete = (newFoodInfo: any) => {
        if (!swapTarget) return;
        removeFoodFromMeal(selectedDay, swapTarget.mealId, swapTarget.food.id);
        
        const mockSwappedFood = {
            id: `swap-${Date.now()}`,
            name: newFoodInfo.name,
            portion: newFoodInfo.portion,
            unit: newFoodInfo.unit,
            calories: swapTarget.food.calories,
            protein: swapTarget.food.protein,
            carbs: swapTarget.food.carbs,
            fats: swapTarget.food.fats
        };
        addFoodToMeal(selectedDay, swapTarget.mealId, mockSwappedFood);
        setSwapTarget(null);
    };

    const rescueRecipe = () => {
        setIsRescueFlipped(true);
        setTimeout(() => {
            setHasSIBOAlert(false);
            removeFoodFromMeal(selectedDay, 'm2', 'f5');
            addFoodToMeal(selectedDay, 'm2', {
                id: 'f5-rescue',
                name: 'Aceite de Oliva Infusionado (Sustitución algorítmica: Alto FODMAP)',
                portion: 15,
                unit: 'ml',
                calories: 120,
                protein: 0,
                carbs: 0,
                fats: 14,
                category: 'fat',
                isLocal: true,
                costLevel: 1,
                tags: ['FODMAPs_safe']
            });
            setIsRescueFlipped(false);
        }, 1000);
    };

    return (
        <div className={`flex flex-col rounded-3xl overflow-hidden transition-all duration-300 relative ${
            isClinical 
                ? 'bg-white border border-slate-200/80 shadow-md' 
                : 'bg-zinc-950/65 backdrop-blur-xl border border-white/5 shadow-2xl'
        }`}>

            {/* RAG Overlay (Loading Screen) */}
            {isSimulatingRAG && (
                <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md ${
                    isClinical ? 'bg-white/85 text-slate-800' : 'bg-zinc-950/90 text-white'
                }`}>
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                    <h3 className="text-xl font-black">Cargando Red de Conocimiento...</h3>
                    <p className="opacity-60 mt-2 font-medium">Cruzando Arquetipo {activeArchetype} y Vectores de Estilo de Vida</p>
                </div>
            )}

            {/* Archetype Context Banner */}
            <div className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-center ${
                activeArchetype === 'GASTRO' ? 'bg-amber-500/10 text-amber-500 border-b border-amber-500/20' :
                activeArchetype === 'ENDOCRINE' ? 'bg-blue-500/10 text-blue-500 border-b border-blue-500/20' :
                activeArchetype === 'ATHLETE' ? 'bg-purple-500/10 text-purple-500 border-b border-purple-500/20' :
                activeArchetype === 'LONGEVITY' ? 'bg-teal-500/10 text-teal-500 border-b border-teal-500/20' :
                activeArchetype === 'BIOMECHANIC' ? 'bg-indigo-500/10 text-indigo-500 border-b border-indigo-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20'
            }`}>
                {activeArchetype === 'GASTRO' && 'Fase 1: Eliminación FODMAP Activa'}
                {activeArchetype === 'ENDOCRINE' && 'Regla Activa: Prohibida combinación de Almidones con Granos'}
                {activeArchetype === 'ATHLETE' && 'Estrategia High-Low: Día de Alta Intensidad (+12g CHO/kg)'}
                {activeArchetype === 'LONGEVITY' && 'Protocolo de Ayuno 16:8 + Restricción Calórica Moderada'}
                {activeArchetype === 'BIOMECHANIC' && 'Sincronización Continua con Apple HealthKit / Oura Activa'}
                {activeArchetype === 'RECOMP' && 'Prioridad Innegociable: Ingesta Hiperproteica (2.2g/kg)'}
            </div>

            {/* Periodización Avanzada en 3 Fases */}
            <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-4 ${
                isClinical ? 'bg-slate-50/50 border-slate-100' : 'bg-zinc-950/40 border-white/5'
            }`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>Periodización:</span>
                <div className={`flex rounded-xl p-1 border flex-1 max-w-lg ${
                    isClinical ? 'bg-slate-100 border-slate-200' : 'bg-black/30 border-white/5'
                }`}>
                    {(['phase_1', 'phase_2', 'phase_3'] as const).map((phase) => (
                        <button
                            key={phase}
                            onClick={() => setSelectedPhase(phase)}
                            className={`flex-1 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                                selectedPhase === phase
                                    ? (isClinical ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20')
                                    : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-zinc-200')
                            }`}
                        >
                            {phase === 'phase_1' && 'Fase 1: Eliminación (W1-4)'}
                            {phase === 'phase_2' && 'Fase 2: Carb Cycling (W5-8)'}
                            {phase === 'phase_3' && 'Fase 3: Sostenibilidad (W9-12)'}
                        </button>
                    ))}
                </div>
            </div>
            {/* Header / Week Navigation */}
            <div className={`p-4 border-b flex flex-col gap-4 ${isClinical ? 'border-slate-100' : 'border-white/5'}`}>
                
                {/* Top Header Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className={`font-sans text-xl md:text-2xl font-black flex items-center gap-3 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            {activeDiet?.name || "Protocolo de 12 Semanas"}
                            {!isCopilotEnabled && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">
                                    Manual Override
                                </span>
                            )}
                        </h2>
                        
                        {/* Lifestyle Vector Badge */}
                        {hasShiftWorkerAlert && (
                            <div className={`hidden md:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                                isClinical
                                    ? 'text-indigo-600 bg-indigo-50 border-indigo-100'
                                    : 'text-indigo-400 bg-indigo-950/30 border-indigo-900/55'
                            }`}>
                                <Moon size={12} />
                                Trabajador por Turnos
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Copilot Toggle */}
                        <button
                            onClick={handleToggleCopilot}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border ${
                                isCopilotEnabled
                                ? (isClinical ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30')
                                : (isClinical ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200' : 'bg-white/5 text-zinc-400 border-white/10')
                            }`}
                        >
                            {isCopilotEnabled ? <BrainCircuit size={14} /> : <Power size={14} />}
                            {isCopilotEnabled ? 'Copilot: ON' : 'Copilot: OFF'}
                        </button>

                        <button
                            onClick={() => setIsArchetypeModalOpen(true)}
                            disabled={!isCopilotEnabled}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                                !isCopilotEnabled ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' :
                                isClinical
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'bg-[var(--color-action-primary)] text-black shadow-[0_4px_14px_rgba(206,255,0,0.15)]'
                            }`}>
                            <LayoutTemplate size={14} />
                            Arquetipos
                        </button>
                    </div>
                </div>

                {/* Bottom Header Row (Days & Sub-alerts) */}
                <div className="flex items-center justify-between">
                    <div className={`flex items-center rounded-lg p-1 ${isClinical ? 'bg-slate-100' : 'bg-white/5'}`}>
                        <button
                            onClick={handlePrevDay}
                            disabled={selectedDay === 'day_a'}
                            className={`p-1 rounded-md transition-opacity ${isClinical ? 'hover:bg-white shadow-sm' : 'hover:bg-white/10'} ${selectedDay === 'day_a' ? 'opacity-30' : ''}`}>
                            <ChevronLeft size={16} className={isClinical ? 'text-slate-500' : 'text-zinc-400'} />
                        </button>
                        <span className={`px-4 text-xs font-bold uppercase tracking-widest min-w-[80px] text-center ${isClinical ? 'text-slate-600' : 'text-zinc-300'}`}>
                            {selectedDay === 'day_a' ? 'Día A (Entrenamiento)' : 'Día B (Descanso)'}
                        </span>
                        <button
                            onClick={handleNextDay}
                            disabled={selectedDay === 'day_b'}
                            className={`p-1 rounded-md transition-opacity ${isClinical ? 'hover:bg-white shadow-sm' : 'hover:bg-white/10'} ${selectedDay === 'day_b' ? 'opacity-30' : ''}`}>
                            <ChevronRight size={16} className={isClinical ? 'text-slate-500' : 'text-zinc-400'} />
                        </button>
                    </div>

                    {hasShiftWorkerAlert && isCopilotEnabled && (
                        <div className={`text-[10px] font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                            <span className="font-bold text-indigo-500">Crononutrición Activa:</span> Carbohidratos densos reservados para el día.
                        </div>
                    )}
                </div>
            </div>

            {/* Clinical & Wearable Smart Nudges Area */}
            <div className="px-4 md:px-6 pt-4 space-y-3">
                {/* SIBO Alert Banner */}
                {hasSIBOAlert && isCopilotEnabled && selectedPhase === 'phase_1' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
                            isClinical 
                                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                                : 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-500">
                                <Zap size={14} className="fill-rose-500/20" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-wider">Incompatibilidad de Fructanos (SIBO)</h4>
                                <p className="text-xs opacity-75 mt-0.5">Detectado en ingrediente "Ajo Salteado".</p>
                            </div>
                        </div>
                        <button 
                            onClick={rescueRecipe}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] cursor-pointer"
                        >
                            Ejecutar Rescue Recipe
                        </button>
                    </motion.div>
                )}

                {/* Wearable Sleep Nudge */}
                {wearableEvent === 'POOR_SLEEP' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border flex flex-col gap-1 shadow-md ${
                            isClinical 
                                ? 'bg-amber-50 border-amber-200 text-amber-800' 
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                        }`}
                    >
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Alerta de Sueño (&lt;45m Profundo)
                        </div>
                        <p className="text-xs opacity-85 leading-relaxed">
                            Resistencia transitoria a la insulina inducida. **Recalibración Predictiva Automática**: Carbohidratos **-20%** | Grasas Saludables **+10%**.
                        </p>
                    </motion.div>
                )}

                {/* Wearable HRV Nudge */}
                {wearableEvent === 'LOW_HRV' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl border flex flex-col gap-1 shadow-md ${
                            isClinical 
                                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        }`}
                    >
                        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Alerta de HRV Baja (Estrés Autónomo)
                        </div>
                        <p className="text-xs opacity-85 leading-relaxed">
                            Sistema nervioso simpático sobrecargado. Reducción automática de carga glucémica; priorizando masa magra, fibra y recuperación.
                        </p>
                    </motion.div>
                )}

                {/* Phase 2 Carb Cycling Info */}
                {selectedPhase === 'phase_2' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
                            isClinical 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-800' 
                                : 'bg-indigo-950/20 border-indigo-900/30 text-indigo-300'
                        }`}
                    >
                        <div className="text-xs">
                            ⚡ **Periodización Asimétrica Activa**: Días de entrenamiento ({selectedDay === 'day_a' ? 'Alto CHO' : 'Bajo CHO'}) para mejorar flexibilidad metabólica.
                        </div>
                        <span className="font-mono text-[9px] px-2 py-0.5 bg-indigo-500/20 rounded uppercase font-bold shrink-0 ml-2">CARB_CYCLING</span>
                    </motion.div>
                )}

                {/* Phase 3 Lifestyle Info */}
                {selectedPhase === 'phase_3' && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
                            isClinical 
                                ? 'bg-teal-50 border-teal-200 text-teal-800' 
                                : 'bg-teal-950/20 border-teal-900/30 text-teal-300'
                        }`}
                    >
                        <div className="text-xs">
                            🧬 **Patrón de Estilo de Vida Activo (Dieta Mediterránea)**: Afianzamiento de hábitos nutricionales y flexibilidad celular a largo plazo.
                        </div>
                        <span className="font-mono text-[9px] px-2 py-0.5 bg-teal-500/20 rounded uppercase font-bold shrink-0 ml-2">SOSTENIBILIDAD</span>
                    </motion.div>
                )}
            </div>

            {/* Meal Canvas (Drag & Drop Area) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {currentMeals.map((meal) => {
                    const macros = calculateMealMacros(meal.foods);

                    // Wearables Dynamic Recalibration math
                    let displayCals = macros.calories;
                    let displayProt = macros.protein;
                    let displayCarbs = macros.carbs;
                    let displayFats = macros.fats;

                    if (wearableEvent === 'POOR_SLEEP') {
                        displayCarbs = macros.carbs * 0.8;
                        displayFats = macros.fats * 1.1;
                        displayCals = Math.round((displayCarbs * 4) + (displayFats * 9) + (displayProt * 4));
                    } else if (wearableEvent === 'LOW_HRV') {
                        displayCarbs = macros.carbs * 0.7;
                        displayProt = macros.protein * 1.15;
                        displayCals = Math.round((displayCarbs * 4) + (displayFats * 9) + (displayProt * 4));
                    }

                    // Periodization modifications: Fase 2 Carb Cycling changes values based on training/rest day
                    if (selectedPhase === 'phase_2') {
                        if (selectedDay === 'day_a') {
                            // Training Day: High carb
                            displayCarbs = displayCarbs * 1.35;
                            displayCals = Math.round((displayCarbs * 4) + (displayFats * 9) + (displayProt * 4));
                        } else {
                            // Rest Day: Low carb
                            displayCarbs = displayCarbs * 0.65;
                            displayCals = Math.round((displayCarbs * 4) + (displayFats * 9) + (displayProt * 4));
                        }
                    }

                    const isFlippedMeal = isRescueFlipped && meal.id === 'm2';

                    return (
                        <motion.div
                            key={meal.id}
                            style={{ perspective: 1000 }}
                            className="w-full"
                        >
                            <motion.div
                                animate={{ rotateY: isFlippedMeal ? 180 : 0 }}
                                transition={{ duration: 0.6 }}
                                style={{ transformStyle: 'preserve-3d' }}
                                className={`rounded-2xl border transition-all relative ${
                                    isClinical
                                        ? 'bg-white border-slate-200 hover:border-slate-300'
                                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700/80 shadow-lg'
                                }`}
                            >
                                {/* Front of the Card */}
                                <div 
                                    style={{ backfaceVisibility: 'hidden' }}
                                    className={isFlippedMeal ? 'invisible h-32' : ''}
                                >
                                    {/* Meal Header */}
                                    <div 
                                        className={`p-4 flex items-center justify-between cursor-pointer ${
                                            isClinical ? 'bg-slate-50/50' : 'bg-zinc-900/40'
                                        }`}
                                        onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                                                isClinical
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-indigo-500/20 text-indigo-400'
                                            }`}>
                                                {meal.name.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <h3 className={`font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>{meal.name}</h3>
                                                    {expandedMeal !== meal.id && (
                                                        <span className="text-[10px] font-mono font-bold text-indigo-400 shrink-0">
                                                            {Math.round(displayProt)}g / 40g Proteína
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`text-xs flex gap-3 font-medium mt-0.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                                    <span>{meal.time}</span>
                                                    <span>•</span>
                                                    <span className={wearableEvent !== 'NONE' || selectedPhase === 'phase_2' ? 'text-indigo-400 font-bold' : ''}>
                                                        {Math.round(displayCals)} kcal
                                                    </span>
                                                    {selectedPhase === 'phase_2' && (
                                                        <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono tracking-widest bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/15">
                                                            {selectedDay === 'day_a' ? 'High Carb Day' : 'Low Carb Day'}
                                                        </span>
                                                    )}
                                                    {wearableEvent !== 'NONE' && selectedPhase !== 'phase_2' && (
                                                        <span className="text-[9px] uppercase font-bold text-amber-500 font-mono tracking-widest bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/15">
                                                            Recalibrado Wearable
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Micro horizontal progress bar (protein) when collapsed */}
                                                {expandedMeal !== meal.id && (
                                                    <div className="mt-2.5 max-w-md">
                                                        <div className={`h-1.5 rounded-full overflow-hidden ${isClinical ? 'bg-slate-100' : 'bg-white/10'}`}>
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" 
                                                                style={{ width: `${Math.min(100, (displayProt / 40) * 100)}%` }} 
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Plus size={18} className={`ml-4 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`} />
                                    </div>

                                    {/* Foods list inside expanded meal */}
                                    {(expandedMeal === meal.id || meal.foods.length > 0) && (
                                        <div className={`p-4 space-y-3 ${meal.foods.length === 0 ? 'hidden' : 'block'}`}>
                                            <Reorder.Group 
                                                axis="y" 
                                                values={meal.foods} 
                                                onReorder={() => {}} 
                                                className="space-y-2"
                                            >
                                                {meal.foods.map(food => {
                                                    const fname = food.name.toLowerCase();
                                                    const isAllergen = fname.includes('maní') || fname.includes('mani') || fname.includes('ajo') || fname.includes('cebolla');
                                                    const isAlert = (hasSIBOAlert && isCopilotEnabled && isAllergen) || (!isCopilotEnabled && isAllergen);
                                                    
                                                    return (
                                                        <Reorder.Item 
                                                            key={food.id} 
                                                            value={food}
                                                            onContextMenu={(e) => handleContextMenu(e, food, meal.id)}
                                                            className={`flex items-center justify-between p-3 rounded-xl cursor-grab active:cursor-grabbing border ${
                                                                isAlert 
                                                                    ? (isClinical ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/30 border-rose-900/60')
                                                                    : (isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900 border-zinc-800')
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${isAlert ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                                <span className={`font-medium text-sm ${
                                                                    isAlert 
                                                                        ? (isClinical ? 'text-rose-700 font-bold' : 'text-rose-300 font-bold') 
                                                                        : (isClinical ? 'text-slate-700' : 'text-zinc-300')
                                                                }`}>
                                                                    {food.name}
                                                                </span>
                                                                {isAlert && !isCopilotEnabled && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white bg-rose-500 px-2 py-0.5 rounded-md shadow-sm">
                                                                        <ShieldAlert size={12} /> Hard Constraint (Alergia)
                                                                    </span>
                                                                )}
                                                                {isAlert && isCopilotEnabled && (
                                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                                        isClinical 
                                                                            ? 'text-rose-500 bg-rose-100' 
                                                                            : 'text-rose-300 bg-rose-950/40 border border-rose-900/50'
                                                                    }`}>
                                                                        FODMAP
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="number"
                                                                    value={food.portion}
                                                                    onChange={(e) => updatePortion(selectedDay, meal.id, food.id, Number(e.target.value))}
                                                                    onClick={e => e.stopPropagation()} 
                                                                    className={`w-14 bg-transparent text-right font-mono font-bold focus:outline-none border-b-2 ${
                                                                        isClinical ? 'border-slate-200 focus:border-emerald-500 text-slate-900' : 'border-zinc-800 focus:border-indigo-500 text-white'
                                                                    }`}
                                                                />
                                                                <span className={`text-xs font-bold opacity-50 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                                                    {food.unit}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); removeFoodFromMeal(selectedDay, meal.id, food.id); }}
                                                                    className="opacity-20 hover:opacity-100 hover:text-rose-500 p-1"
                                                                    title="Eliminar"
                                                                >
                                                                    &times;
                                                                </button>
                                                            </div>
                                                        </Reorder.Item>
                                                    );
                                                })}
                                            </Reorder.Group>

                                            {/* Add Food Input Minimalista */}
                                            <div className="mt-4 transition-opacity">
                                                <FoodSearchAutocomplete
                                                    mealId={meal.id}
                                                    onSelect={(food) => addFoodToMeal(selectedDay, meal.id, food)}
                                                    onClose={() => { }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Back of the Card (Flip Animation for Rescue Recipe) */}
                                {isFlippedMeal && (
                                    <div 
                                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }} 
                                        className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-center text-emerald-400"
                                    >
                                        <Zap size={24} className="animate-bounce mb-2 text-indigo-400" />
                                        <p className="font-bold text-sm">Sustitución algorítmica: Alto en FODMAP</p>
                                        <p className="text-xs opacity-80 mt-1 max-w-xs mx-auto">
                                            Ajo Salteado reemplazado por Aceite de Oliva Infusionado para protección de barrera intestinal.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Signature Panel (Sticky Bottom Bar) */}
            <div className={`p-4 border-t flex items-center justify-between transition-all ${
                isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
            }`}>
                <div className="flex items-center gap-4">
                </div>
                <div className="flex items-center gap-3">
                    {isSigned ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm px-4">
                            <CheckCircle2 size={18} /> Validado por Dr. Nahuel H.
                        </div>
                    ) : (
                        <span className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-amber-600' : 'text-amber-500'}`}>
                            Requiere Firma Clínica
                        </span>
                    )}
                    <button 
                        onClick={() => setIsSigned(true)}
                        disabled={isSigned}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                            isSigned 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border-none' 
                                : isClinical ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20' : 'bg-[var(--color-action-primary)] text-black hover:scale-105'
                        }`}
                    >
                        <FileSignature size={16} /> {isSigned ? 'Plan Firmado y Sellado' : 'Validar y Firmar Plan'}
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isArchetypeModalOpen && (
                <ArchetypeSelector
                    type="NUTRITION"
                    onClose={() => setIsArchetypeModalOpen(false)}
                />
            )}

            {swapTarget && (
                <FoodSwapModal 
                    isOpen={!!swapTarget} 
                    onClose={() => setSwapTarget(null)} 
                    originalFood={swapTarget.food} 
                    onSwap={handleSwapComplete}
                />
            )}
        </div>
    );
};

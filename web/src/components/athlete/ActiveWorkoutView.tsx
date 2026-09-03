import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RefreshCw, AlertCircle, Trophy, Info } from 'lucide-react';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { RPEBottomSheet } from './RPEBottomSheet';
import { SessionRPEBottomSheet } from './SessionRPEBottomSheet';
import { WorkoutGraduation } from './WorkoutGraduation';
import type { CrystalType } from './WorkoutGraduation';

// Mocks basados en la Bóveda Global
interface WorkoutExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    completedSets: number[];
    externalCue?: string;
}

export const ActiveWorkoutView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const { calmMode } = useCognitiveLoad();
    
    const [exercises, setExercises] = useState<WorkoutExercise[]>([
        { id: 'SQUAT_001', name: 'Sentadilla Trasera con Barra', sets: 4, reps: 10, completedSets: [], externalCue: '💡 Coach: "Siéntate en una silla imaginaria y empuja el suelo hacia afuera."' },
        { id: 'HINGE_001', name: 'Peso Muerto', sets: 3, reps: 15, completedSets: [], externalCue: '💡 Coach: "Dobla la barra con tus manos antes de subir."' }
    ]);
    
    // UI States
    const [isSwapping, setIsSwapping] = useState<string | null>(null);
    const [xaiBadge, setXaiBadge] = useState<{ id: string, message: string } | null>(null);
    
    // Progressive Friction (System 1 vs System 2)
    const [swapCount, setSwapCount] = useState(0);
    const [interceptionModal, setInterceptionModal] = useState<{ isOpen: boolean, targetExId: string | null }>({ isOpen: false, targetExId: null });
    
    // RPE Bottom Sheet State
    const [rpeSheetOpen, setRpeSheetOpen] = useState(false);
    const [activeSetData, setActiveSetData] = useState<{ exerciseId: string, setIndex: number } | null>(null);

    // End of Session State
    const [sessionRpeSheetOpen, setSessionRpeSheetOpen] = useState(false);
    const [graduationCrystal, setGraduationCrystal] = useState<CrystalType | null>(null);

    const executeSwap = (exerciseId: string, reason?: string) => {
        setIsSwapping(exerciseId);
        
        // Simulación de latencia de red y Swap Engine (Labor Illusion)
        setTimeout(() => {
            setExercises(prev => prev.map(ex => {
                if (ex.id === exerciseId) {
                    return {
                        ...ex,
                        id: `swapped_${Math.random().toString(36).substr(2, 6)}`,
                        name: 'Sentadilla Goblet', // Swap asignado por la IA
                    };
                }
                return ex;
            }));
            
            setIsSwapping(null);
            setSwapCount(prev => prev + 1);
            
            if (reason) {
                console.log(`[TELEMETRY] EVENT: CLINICAL_EVASION_AUDIT | Reason: ${reason} | SwapCount: ${swapCount + 1}`);
            }
            
            // XAI Badge B2C (Pedagógico)
            setXaiBadge({
                id: exerciseId, // The ID changes in the real app, we attach to new ID in map, but since we mock, let's keep it robust. We will attach to the new ID logic below.
                message: '🔄 Swap Biomecánico: Mismo estímulo, sin requerir máquina.'
            });
            
            // Auto-hide XAI Badge
            setTimeout(() => setXaiBadge(null), 4000);
            
        }, 1500);
    };

    const handleMachineOccupied = async (exerciseId: string) => {
        if (swapCount >= 2) {
            // Fricción Estratégica (System 2)
            setInterceptionModal({ isOpen: true, targetExId: exerciseId });
        } else {
            // Fricción Cero (System 1)
            executeSwap(exerciseId);
        }
    };

    const handleInterceptionReason = (reason: string) => {
        if (!interceptionModal.targetExId) return;
        const targetId = interceptionModal.targetExId;
        setInterceptionModal({ isOpen: false, targetExId: null });
        executeSwap(targetId, reason);
    };

    const handleCompleteSet = (exerciseId: string, setIndex: number) => {
        // Abrir Bottom Sheet
        setActiveSetData({ exerciseId, setIndex });
        setRpeSheetOpen(true);
    };

    const handleRpeSubmit = (rpe: number) => {
        if (!activeSetData) return;
        
        // Guardar RPE y marcar set como completado
        setExercises(prev => prev.map(ex => {
            if (ex.id === activeSetData.exerciseId) {
                return { ...ex, completedSets: [...ex.completedSets, activeSetData.setIndex] };
            }
            return ex;
        }));
        
        setRpeSheetOpen(false);
    };

    const getActiveExerciseName = () => {
        if (!activeSetData) return '';
        return exercises.find(e => e.id === activeSetData.exerciseId)?.name || '';
    };

    const handleSessionFinishClick = () => {
        setSessionRpeSheetOpen(true);
    };

    const handleSessionRpeSubmit = (sRpe: number, jointPain: boolean) => {
        setSessionRpeSheetOpen(false);
        // Lógica de Crystal basada en biometría (ACWR & Churn Radar Mock)
        if (jointPain || sRpe > 8) {
            setGraduationCrystal('AMBER'); // Carga alta o dolor -> Modo Recuperación Activa
        } else if (sRpe >= 6 && sRpe <= 8) {
            setGraduationCrystal('QUARTZ'); // Precisión clínica
        } else {
            setGraduationCrystal('TITANIUM'); // Fuerza Base
        }
    };

    return (
        <div className={`min-h-screen p-4 pb-24 transition-colors duration-1000 ${calmMode ? 'bg-[#0f111a]' : 'bg-[#0a0a0a]'}`}>
            
            {/* Header Sticky */}
            <header className="sticky top-0 z-40 bg-inherit py-4 flex justify-between items-center border-b border-white/5 mb-6">
                <div>
                    <h2 className={`text-2xl font-bold ${calmMode ? 'text-indigo-300' : 'text-white'}`}>
                        {calmMode ? 'Recuperación' : 'Día de Piernas'}
                    </h2>
                    {calmMode && (
                        <p className="text-xs text-indigo-400 flex items-center mt-1">
                            <Info className="w-3 h-3 mr-1" />
                            Dosis Mínima Efectiva (MED) aplicada.
                        </p>
                    )}
                </div>
                <button 
                    onClick={handleSessionFinishClick}
                    className="text-sm font-bold bg-white/10 px-4 py-2 rounded-full text-white"
                >
                    Finalizar
                </button>
            </header>

            {/* Listado de Ejercicios */}
            <div className="space-y-6">
                {exercises.map((ex) => {
                    const isSwappingThis = isSwapping === ex.id;
                    const showBadge = xaiBadge?.id === ex.id;
                    
                    return (
                        <div key={ex.id} className={`p-5 rounded-2xl border transition-all ${calmMode ? 'bg-indigo-950/20 border-indigo-900/30' : 'bg-zinc-900/40 border-zinc-800'}`}>
                            
                            {/* Cabecera del Ejercicio */}
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-white max-w-[70%]">
                                    {isSwappingThis ? (
                                        <div className="flex items-center text-zinc-500 animate-pulse">
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Calculando Swap...
                                        </div>
                                    ) : ex.name}
                                </h3>
                                
                                {ex.externalCue && !isSwappingThis && (
                                    <div className={`mt-2 text-xs px-3 py-2 rounded-xl font-medium ${calmMode ? 'bg-indigo-500/10 text-indigo-300' : 'bg-lime-400/10 text-lime-400'}`}>
                                        {ex.externalCue}
                                    </div>
                                )}
                                
                                {!isSwappingThis && (
                                    <button 
                                        onClick={() => handleMachineOccupied(ex.id)}
                                        className="text-xs flex items-center text-zinc-400 bg-zinc-800/50 px-3 py-1.5 rounded-full border border-white/5"
                                    >
                                        <AlertCircle className="w-3 h-3 mr-1.5 text-orange-400" />
                                        Máquina Ocupada
                                    </button>
                                )}
                            </div>

                            {/* B2C XAI Badge (Pedagógico) */}
                            <AnimatePresence>
                                {showBadge && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 overflow-hidden"
                                    >
                                        <div className="bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs px-3 py-2.5 rounded-lg flex items-center font-medium tracking-wide shadow-[0_0_15px_rgba(163,230,53,0.1)]">
                                            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
                                            {xaiBadge.message}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Series */}
                            <div className="space-y-3">
                                {[...Array(calmMode ? Math.max(1, ex.sets - 1) : ex.sets)].map((_, idx) => {
                                    const isCompleted = ex.completedSets.includes(idx);
                                    
                                    return (
                                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isCompleted ? 'bg-lime-400/5 border-lime-400/20' : 'bg-black/20 border-white/5'}`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-zinc-300 font-medium">{ex.reps} Repeticiones</span>
                                                    <span className="text-zinc-500 text-xs">Objetivo: Guardar 2 en recámara (RIR 2)</span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleCompleteSet(ex.id, idx)}
                                                disabled={isCompleted}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                                                    isCompleted 
                                                    ? 'bg-transparent text-lime-400/50' 
                                                    : calmMode 
                                                        ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
                                                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                                }`}
                                            >
                                                {isCompleted ? 'Lista' : 'Completar'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Botón Personal Record (Oculto en Modo Calma) */}
                            {!calmMode && (
                                <button className="mt-4 w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 flex items-center justify-center text-sm font-medium hover:text-white hover:border-zinc-500 transition-colors">
                                    <Trophy className="w-4 h-4 mr-2 text-yellow-500/50" />
                                    Registrar Récord Personal
                                </button>
                            )}

                        </div>
                    );
                })}
            </div>

            {/* Bottom Sheet Zero-Fricción para RPE */}
            <RPEBottomSheet 
                isOpen={rpeSheetOpen} 
                onClose={() => setRpeSheetOpen(false)} 
                onSubmit={handleRpeSubmit}
                exerciseName={getActiveExerciseName()}
            />

            {/* Bottom Sheet sRPE para finalizar la sesión (El WIIFM del RPE) */}
            <SessionRPEBottomSheet
                isOpen={sessionRpeSheetOpen}
                onClose={() => setSessionRpeSheetOpen(false)}
                onSubmit={handleSessionRpeSubmit}
            />

            {/* Ritual de Graduación post-RPE */}
            <AnimatePresence>
                {graduationCrystal && (
                    <WorkoutGraduation
                        crystalType={graduationCrystal}
                        onClose={onFinish}
                    />
                )}
            </AnimatePresence>
            
            {/* Transitional UI: Modal de Intercepción (System 2) */}
            <AnimatePresence>
                {interceptionModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pb-8 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                        >
                            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" />
                            
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-lime-500/20 border border-lime-500/50 flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-lime-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">AUREA Insight</h3>
                            </div>
                            
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Hemos adaptado gran parte de tu sesión hoy. Para mantener el estímulo intacto, ¿cuál es el motivo principal de este cambio?
                            </p>
                            
                            <div className="space-y-2">
                                {['Gimnasio Colapsado', 'Molestia / Dolor', 'Falta de Energía', 'No me gusta el ejercicio'].map((reason) => (
                                    <button
                                        key={reason}
                                        onClick={() => handleInterceptionReason(reason)}
                                        className="w-full text-left px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 font-medium transition-colors"
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => setInterceptionModal({ isOpen: false, targetExId: null })}
                                className="w-full mt-4 py-3 text-sm font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
        </div>
    );
};

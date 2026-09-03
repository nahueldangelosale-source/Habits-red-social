import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Flame, Award, TrendingUp, Cpu, Coffee } from 'lucide-react';
import { LazyDayButton } from './LazyDayButton';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { useQuery } from '@tanstack/react-query';

interface DailySurfaceProps {
    onStartWorkout: () => void;
}

export const DailySurface: React.FC<DailySurfaceProps> = ({ onStartWorkout }) => {
    const { athletePhase, calmMode } = useCognitiveLoad();
    const isConsolidated = athletePhase === 'CONSOLIDATED';
    
    // Fetch History Data
    const { data: historyData } = useQuery({
        queryKey: ['athlete', 'workouts'],
        queryFn: async () => {
            const res = await fetch('/api/v1/athlete/workouts');
            if (!res.ok) throw new Error('Failed to fetch history');
            return res.json();
        }
    });

    const summary = historyData?.summary || { latest_volume_kg: 12500, volume_trend_pct: 2.5, consistency_score: 78 };

    // Módulo 1: El Despliegue (Labor Illusion)
    const [isUnboxing, setIsUnboxing] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsUnboxing(false);
        }, 2200);
        return () => clearTimeout(timer);
    }, []);

    if (isUnboxing) {
        return (
            <div className="flex flex-col items-center justify-center flex-1 w-full px-6 text-center">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 border-t-2 border-lime-500 dark:border-lime-400 rounded-full animate-spin opacity-40" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-2 border-b-2 border-indigo-600 dark:border-indigo-500 rounded-full animate-spin opacity-30" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                        <Cpu className="w-6 h-6 text-slate-800 dark:text-white animate-pulse" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-2">Compilando Directivas</h2>
                    <p className="text-xs text-lime-600 dark:text-lime-400/80 font-mono">Cruzando Readiness con Fatiga SNC...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center flex-1 w-full px-6 text-center py-8">
            <AnimatePresence>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 mb-10"
                >
                    <h1 className={`text-4xl font-extrabold tracking-tight ${calmMode ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                        {calmMode ? 'Día de Recuperación Activa' : 'Día de Piernas'}
                    </h1>
                    <p className="text-slate-500 dark:text-zinc-400 text-lg">Semana 3 • Bloque de Hipertrofia</p>
                </motion.div>

                {/* Anillo de Racha (Siempre Visible) */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-48 h-48 rounded-full flex items-center justify-center mb-10"
                >
                    {/* SVG Ring para simular progreso */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 192 192">
                        <circle 
                            cx="96" cy="96" r="88" 
                            stroke="currentColor" 
                            strokeWidth="12" 
                            fill="none" 
                            className="text-slate-200 dark:text-zinc-800"
                        />
                        <circle 
                            cx="96" cy="96" r="88" 
                            stroke="currentColor" 
                            strokeWidth="12" 
                            fill="none" 
                            className={calmMode ? "text-indigo-600 dark:text-indigo-500/80" : "text-lime-500 dark:text-lime-400"}
                            strokeDasharray="553"
                            strokeDashoffset="150"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="flex flex-col items-center">
                        <Flame className={`w-10 h-10 mb-1 ${calmMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-orange-500'}`} />
                        <span className="text-3xl font-black text-slate-900 dark:text-white">12</span>
                        <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Días</span>
                    </div>
                </motion.div>

                {/* Revelación Progresiva: Métricas Avanzadas (Solo Consolidated) */}
                {isConsolidated && !calmMode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10"
                    >
                        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none p-4 rounded-2xl flex flex-col items-center">
                            <TrendingUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mb-2" />
                            <span className="text-sm text-slate-500 dark:text-zinc-400">Volumen Última Sesión</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">{summary.latest_volume_kg.toLocaleString()} kg</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none p-4 rounded-2xl flex flex-col items-center">
                            <Award className="w-6 h-6 text-amber-500 dark:text-yellow-400 mb-2" />
                            <span className="text-sm text-slate-500 dark:text-zinc-400">Tendencia de Carga</span>
                            <span className={`text-xl font-bold ${summary.volume_trend_pct >= 0 ? 'text-slate-900 dark:text-white' : 'text-red-500 dark:text-red-400'}`}>
                                {summary.volume_trend_pct > 0 ? '+' : ''}{summary.volume_trend_pct}%
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Botón Principal (Superficie de Acción) */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-sm mt-auto"
                >
                    <button 
                        onClick={onStartWorkout}
                        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center shadow-2xl transition-all
                            ${calmMode 
                                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 shadow-indigo-200/50 dark:shadow-indigo-500/20' 
                                : 'bg-lime-400 text-black hover:bg-lime-300 shadow-lime-400/20 hover:shadow-lime-400/40'
                            }
                        `}
                    >
                        <Play className={`w-6 h-6 mr-3 ${calmMode ? 'text-indigo-700 dark:text-indigo-300' : 'fill-black'}`} />
                        {calmMode ? 'Iniciar Flujo de Recuperación' : 'Iniciar Entrenamiento'}
                    </button>

                    {/* Válvula de Escape Contextual: Solo cuando hay sesión de entrenamiento hoy */}
                    <div className="mt-4">
                        <LazyDayButton />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

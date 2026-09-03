import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Activity, Edit3, Calendar, Layers, CheckCircle2, AlertTriangle, X, Dumbbell, Info, Clock, TrendingUp, Plus, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VerticalActivityFeed } from '../calendar/VerticalActivityFeed';
import { TrainingCalendar } from '../calendar/TrainingCalendar';
import { useTheme } from '../../context/ThemeContext';
import { PhaseTimeline } from './PhaseTimeline';
import { getPeriodConfig } from '../../data/modalityColors';
import { useExecutionStore } from '../../stores/useExecutionStore';

interface WorkoutTrackingViewProps {
    onEditPlan?: () => void;
    expectedSessionsPerWeek?: number;
}

export const WorkoutTrackingView: React.FC<WorkoutTrackingViewProps> = ({ onEditPlan, expectedSessionsPerWeek = 4 }) => {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const [subTab, setSubTab] = useState<'tracking' | 'agenda'>('tracking');
    const [calendarView, setCalendarView] = useState<'month' | 'quarter' | 'semester'>('month');
    const [selectedDay, setSelectedDay] = useState<any | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem('has_seen_workout_dashboard_onboarding');
        if (!hasSeen) {
            setShowOnboarding(true);
            // Optionally, clear it for testing if needed, but per request we set it so it's a one-time view
            localStorage.setItem('has_seen_workout_dashboard_onboarding', 'true');
        }
    }, []);

    // Periodo activo actual (datos stub — se reemplazará por datos del backend)
    const currentPeriod = getPeriodConfig('FUERZA');

    // Adherencia dinámica: sesiones completadas en últimos 28 días vs esperadas
    const sessionHistory = useExecutionStore((s) => s.sessionHistory);
    const adherencePercentage = useMemo(() => {
        const now = Date.now();
        const WINDOW_MS = 28 * 24 * 60 * 60 * 1000; // 28 días
        const completedInWindow = sessionHistory.filter(
            (s) => s.status !== 'IN_PROGRESS' && (now - s.startTime) <= WINDOW_MS
        ).length;
        const expected = expectedSessionsPerWeek * 4; // 4 semanas
        if (expected <= 0) return 0;
        return Math.min(100, Math.round((completedInWindow / expected) * 100));
    }, [sessionHistory, expectedSessionsPerWeek]);

    return (
        <div className="flex flex-col gap-6 relative">
            {/* Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
                <button 
                    onClick={() => setSubTab('tracking')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-t-xl transition-colors ${subTab === 'tracking' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    Seguimiento
                </button>
            </div>

            {subTab === 'tracking' ? (
                <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">
                    {/* Left Column: Calendar & Plan Summary */}
                    <div className="flex-1 space-y-6">
                        {/* Plan Summary Header */}
                        <div className={`p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${showOnboarding ? 'relative z-[101] ring-4 ring-indigo-500/50' : ''}`}>
                            <div className="flex items-center gap-6">
                                {/* Adherence Circle */}
                                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-slate-100 dark:text-slate-800"
                                            strokeWidth="3"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className={adherencePercentage >= 80 ? 'text-emerald-500' : adherencePercentage >= 60 ? 'text-amber-500' : 'text-rose-500'}
                                            strokeWidth="3"
                                            strokeDasharray={`${adherencePercentage}, 100`}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-sm font-black text-slate-800 dark:text-white">{adherencePercentage}%</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white font-montserrat">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: currentPeriod.color.bg }} />
                                            {currentPeriod.emoji} Fase de {currentPeriod.label} — Semana 2
                                        </span>
                                    </h3>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg" title="Esfuerzo Percibido Promedio">
                                            <TrendingUp size={14}/> Esfuerzo: 8.5/10
                                        </span>
                                        <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">
                                            <Clock size={14}/> 4 Sesiones/sem
                                        </span>
                                    </div>

                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if (showOnboarding) setShowOnboarding(false);
                                    if (onEditPlan) onEditPlan();
                                    else navigate('/plan-builder');
                                }}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0 relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                                <Edit3 size={16} /> Editar Plan
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {showOnboarding && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center"
                                    onClick={() => setShowOnboarding(false)}
                                >
                                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center text-white p-6 max-w-md">
                                        <h2 className="text-2xl font-black mb-2 font-montserrat">Tus métricas están aquí.</h2>
                                        <p className="text-lg text-slate-300 font-medium">
                                            Edita el plan con un solo clic. Haz clic en Editar Plan o en cualquier lado para continuar.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Timeline Visual de Periodos y Cumplimiento */}
                        <PhaseTimeline isClinical={isClinical} />
                    </div>

                    {/* Right Column: Feedback & Comments */}
                    <div className="w-full lg:w-96 space-y-6">
                        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm h-full flex flex-col min-h-[500px]">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                <Layers size={16} /> Últimos Entrenamientos
                            </h3>
                            
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {/* Comment 1 */}
                                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 relative cursor-pointer hover:shadow-md transition-all group">
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-500 animate-pulse group-hover:scale-150 transition-transform" />
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest group-hover:text-amber-700 transition-colors">Ayer, 18:30 PM - Día 12 (Empuje)</span>
                                        </div>
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${isClinical ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`} title="Auto-reportado por el atleta">
                                            <User size={10} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">Sin Validar</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                                            RPE 8 (Difícil)
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                                            Molestia Hombro
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-600 text-white shadow-sm shadow-amber-600/20">
                                            Fatigado
                                        </span>
                                    </div>
                                </div>

                                {/* Comment 2 */}
                                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/20 cursor-pointer hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest group-hover:text-emerald-700 transition-colors">10 Jul, 09:15 AM - Día 10 (Tracción)</span>
                                        </div>
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${isClinical ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`} title="Validado por Telemetría y Acceso (Proof of Workout)">
                                            <ShieldCheck size={10} />
                                            <span className="text-[8px] font-bold uppercase tracking-widest">Validado (HW)</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                                            RPE 9 (Máximo Esfuerzo)
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-sm shadow-emerald-600/20">
                                            Sin dolor
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-500 text-white shadow-sm shadow-blue-500/20">
                                            Energizado
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className={`p-4 rounded-2xl flex flex-wrap gap-4 items-center ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-lg'} border`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest opacity-50 mr-2`}>Programar Evento</span>
                        <button className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-lime-500 hover:bg-lime-600 text-black'}`}>
                            <Plus size={14} /> Nueva Sesión
                        </button>
                        <button className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                            <CheckCircle2 size={14} /> Check-in
                        </button>
                        <button className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                            <Activity size={14} /> Medida / Biometría
                        </button>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm">
                        <TrainingCalendar />
                    </div>
                </div>
            )}

            {/* Day Detail Modal */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-zinc-800"
                        >
                            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                    <Calendar size={18} className="text-indigo-500" /> Día {selectedDay.day}
                                </h3>
                                <button 
                                    onClick={() => setSelectedDay(null)}
                                    className="p-2 bg-slate-100 dark:bg-zinc-900 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-6 text-center text-slate-500 dark:text-zinc-400">
                                Aquí se mostrarán los detalles exactos del entrenamiento del día seleccionado.
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

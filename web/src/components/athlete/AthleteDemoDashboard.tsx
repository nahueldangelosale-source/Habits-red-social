import React, { useState, useMemo, useEffect } from 'react';
import { DailyHabitCheckin } from './DailyHabitCheckin';
import { ActiveWorkoutSession } from './ActiveWorkoutSession';
import { NutritionWidget } from './NutritionWidget';
import { BaselinePhotoCard } from './BaselinePhotoCard';
import { AthleteWelcomeWizardModal } from './AthleteWelcomeWizardModal';
import { SundayWeeklyBriefingModal } from './SundayWeeklyBriefingModal';
import { usePlanBuilderStore, type RoutineExercise } from '../../stores/usePlanBuilderStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useCoachStore } from '../../stores/useCoachStore';
import { 
  Dumbbell, Clock, Activity, ChevronRight, ChevronUp, Play, Zap, Shield, 
  Sparkles, Calendar, CheckCircle2, ArrowRight, Brain, MessageCircle, HelpCircle, X,
  Compass, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AthleteDemoDashboardProps {
  onStartWorkout?: () => void;
  onViewMealPlan?: () => void;
  onNavigateToWorkout?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToMind?: () => void;
  onNavigateToCoach?: () => void;
  readinessScore?: number | null;
}

export const AthleteDemoDashboard: React.FC<AthleteDemoDashboardProps> = ({ 
  onStartWorkout, 
  onViewMealPlan,
  onNavigateToWorkout,
  onNavigateToCalendar,
  onNavigateToMind,
  onNavigateToCoach,
  readinessScore 
}) => {
  const { days } = usePlanBuilderStore();
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isAgendaCollapsed, setIsAgendaCollapsed] = useState(true);
  const [isWelcomeWizardOpen, setIsWelcomeWizardOpen] = useState(false);
  const [isReadinessDismissed, setIsReadinessDismissed] = useState(false);
  const { hasAssignedCoach, assignedCoach } = useCoachStore();
  const hasCoach = hasAssignedCoach && Boolean(assignedCoach);
  const [isWorkoutDraftConfigured, setIsWorkoutDraftConfigured] = useState(() => {
    return localStorage.getItem('workout_draft_configured') === 'true' || hasCoach;
  });
  
  // Detección de Domingo / Inicio de Semana para el Resumen del Ciclo
  const [isSundayBriefingOpen, setIsSundayBriefingOpen] = useState(() => {
    const dayOfWeek = new Date().getDay(); // 0: Domingo, 1: Lunes
    const isWeekendOrStart = dayOfWeek === 0 || dayOfWeek === 1;
    const weekKey = `sunday_briefing_seen_w2_${new Date().getFullYear()}`;
    return isWeekendOrStart && localStorage.getItem(weekKey) !== 'true';
  });

  // Re-open welcome wizard on custom event if requested
  useEffect(() => {
    const handleReopenWelcome = () => setIsWelcomeWizardOpen(true);
    window.addEventListener('reopen-athlete-welcome', handleReopenWelcome);
    return () => window.removeEventListener('reopen-athlete-welcome', handleReopenWelcome);
  }, []);

  const activeDay = days[0];

  const workoutSummary = useMemo(() => {
    if (!activeDay) return null;
    const exercises = activeDay.items.filter(i => i.type === 'EXERCISE') as RoutineExercise[];
    const exerciseCount = exercises.length;
    const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 1), 0);
    const estimatedMinutes = totalSets * 3;

    return {
      exercises,
      exerciseCount,
      totalSets,
      estimatedMinutes
    };
  }, [activeDay]);

  const todayFormatted = useMemo(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, []);

  return (
    <div className="max-w-md mx-auto w-full pt-2 space-y-4 pb-24 px-3 sm:px-4 font-lato">
      
      {/* 0. Banner de Asistente de Inicio / Wizard para Usuario Nuevo */}
      <div className="p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 dark:border-indigo-500/30 rounded-3xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            ✨
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Asistente de Inicio Rápido
            </span>
            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              Personalizá tus hábitos y objetivos en 3 pasos
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsWelcomeWizardOpen(true)}
          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-montserrat shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          Iniciar
        </button>
      </div>

      {/* 1. Readiness Widget (Estado de Preparación Diaria - Descartable) */}
      {readinessScore != null && !isReadinessDismissed && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full"
        >
          {(() => {
            const getReadinessConfig = (score: number) => {
              if (score <= 2) return {
                color: 'text-red-500 dark:text-red-400',
                bg: 'bg-red-50 dark:bg-red-500/10',
                border: 'border-red-200 dark:border-red-500/20',
                label: score === 1 ? 'Fatigado — Modo Recuperación' : 'Bajo — Ajuste Sugerido',
                emoji: '😴',
                icon: <Activity className="w-5 h-5" />
              };
              if (score === 3) return {
                color: 'text-amber-500 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-500/10',
                border: 'border-amber-200 dark:border-amber-500/20',
                label: 'Moderado — Precaución',
                emoji: '⚖️',
                icon: <Shield className="w-5 h-5" />
              };
              return {
                color: 'text-emerald-500 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                border: 'border-emerald-200 dark:border-emerald-500/20',
                label: score === 4 ? 'Óptimo — Verde' : 'Pico de Rendimiento',
                emoji: '⚡',
                icon: <Zap className="w-5 h-5" />
              };
            };
            const config = getReadinessConfig(readinessScore);
            return (
              <div className={`flex items-center justify-between p-3.5 rounded-3xl border ${config.bg} ${config.border} shadow-sm transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center font-black font-montserrat text-base bg-white dark:bg-zinc-900 ${config.color} ${config.border} shadow-sm`}>
                    {readinessScore}
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado de Preparación</h3>
                    <p className={`font-black font-montserrat text-sm ${config.color}`}>{config.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('reopen-readiness'))}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    Reevaluar
                  </button>
                  <button
                    onClick={() => setIsReadinessDismissed(true)}
                    title="Cerrar Estado de Preparación"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })()}
        </motion.section>
      )}

      {/* Banner Motivacional de Domingo / Brújula de Ciclo */}
      <div 
        onClick={() => setIsSundayBriefingOpen(true)}
        className="p-3.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-indigo-500/15 border border-amber-500/30 dark:border-amber-500/20 rounded-3xl flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all active:scale-98 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-lg shadow-sm">
            🧭
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Brújula Semanal • Domingo de Balance
            </span>
            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
              Mirá cómo avanza tu ciclo y lo que se viene
            </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />
      </div>

      {/* 2. Foto de Punto de Partida (Baseline Photo Card) */}
      <BaselinePhotoCard />

      {/* 3. Agenda Rápida del Día (Colapsada por Defecto para Evitar Scroll) */}
      <section className="bg-white dark:bg-[#0a0d16] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden transition-all">
        <div 
          onClick={() => setIsAgendaCollapsed(!isAgendaCollapsed)}
          className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-montserrat">
                {todayFormatted}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                2 Turnos Programados Hoy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigateToCalendar) onNavigateToCalendar();
              }}
              className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors"
            >
              <span>Ver Agenda</span>
              <ChevronRight size={11} />
            </button>
            <div className="p-1 text-slate-400 dark:text-zinc-500">
              <ChevronUp size={16} className={`transform transition-transform duration-300 ${isAgendaCollapsed ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>

        {/* Agenda Events (Collapsible) */}
        <AnimatePresence initial={false}>
          {!isAgendaCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-slate-100 dark:border-white/5 p-4 pt-3 space-y-2 bg-slate-50/40 dark:bg-black/20"
            >
              <div 
                onClick={onNavigateToCalendar}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-white/5 text-xs cursor-pointer hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">Sesión de Entrenamiento: Fuerza</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">18:00 hs</span>
              </div>

              <div 
                onClick={onNavigateToCalendar}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-white/5 text-xs cursor-pointer hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">Cierre de Hábitos & Check-in Social</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">21:30 hs</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. Hábitos del Día & Reto de Tribu (Cerrado por Defecto) */}
      <section>
        <DailyHabitCheckin />
      </section>

      {/* 5. Nutrición del Día (Cerrada por Defecto) */}
      <section>
        <NutritionWidget onViewMealPlan={onViewMealPlan} />
      </section>

      {/* 6. Tarjeta del Entrenamiento del Día (Con Candado para particular / Virgen) */}
      {!hasCoach && !isWorkoutDraftConfigured ? (
        <section className="bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Lock size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Entrenamiento Bloqueado
                </span>
                <h4 className="text-sm font-montserrat font-black text-slate-900 dark:text-white">
                  Rutina Inteligente por Ciclos
                </h4>
              </div>
            </div>
            <span className="text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
              MODO PARTICULAR
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5 leading-relaxed">
            Desbloqueá tu plan personalizado de 3 días con periodización de sobrecarga progresiva o conectate con tu entrenador.
          </p>
          <button
            onClick={() => {
              if (onNavigateToWorkout) onNavigateToWorkout();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Configurar y Desbloquear Rutina</span>
          </button>
        </section>
      ) : activeDay ? (
        <section 
          onClick={onNavigateToWorkout}
          className="bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden cursor-pointer hover:border-indigo-500/40 transition-all"
        >
          <div className="p-4 bg-gradient-to-br from-indigo-900/30 via-slate-900 to-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Dumbbell size={18} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300 block">
                  Entrenamiento de Hoy
                </span>
                <h4 className="text-sm font-montserrat font-black text-white">
                  {activeDay.name || 'Día 1: Fuerza & Hipertrofia'}
                </h4>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigateToWorkout) onNavigateToWorkout();
                else if (onStartWorkout) onStartWorkout();
              }}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Play fill="currentColor" size={13} />
              <span>Ver Rutina</span>
            </button>
          </div>
        </section>
      ) : null}

      {/* 7. Acceso Rápido a Mind & Bienestar Mental */}
      {onNavigateToMind && (
        <section 
          onClick={onNavigateToMind}
          className="p-3.5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-500/20 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Brain size={18} />
            </div>
            <div>
              <h4 className="text-xs font-montserrat font-black text-slate-900 dark:text-white">Mind Gym & Recuperación</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Audio-guía de respiración • Reducción de cortisol</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-purple-500" />
        </section>
      )}

      {/* Overlay de Sesión Activa */}
      <AnimatePresence>
        {isWorkoutActive && !onStartWorkout && activeDay && (
          <ActiveWorkoutSession 
            day={activeDay} 
            onClose={() => setIsWorkoutActive(false)} 
          />
        )}
      </AnimatePresence>

      {/* Wizard de Bienvenida para Atletas Nuevos */}
      <AthleteWelcomeWizardModal
        isOpen={isWelcomeWizardOpen}
        onClose={() => setIsWelcomeWizardOpen(false)}
      />

      {/* Modal de Resumen Semanal de los Domingos (Brújula de Ciclo) */}
      <SundayWeeklyBriefingModal
        isOpen={isSundayBriefingOpen}
        onClose={() => setIsSundayBriefingOpen(false)}
      />
    </div>
  );
};

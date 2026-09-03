import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Play, BarChart3, TrendingUp, Activity, Flame, 
  Sparkles, Share2, Calendar, CheckCircle2, Check, ChevronRight, ChevronDown, ChevronUp, 
  Lock, Clock, Shield, Award, Target, Camera, Info, Car, Plus
} from 'lucide-react';
import { usePlanBuilderStore, type RoutineExercise } from '../../stores/usePlanBuilderStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { ActiveWorkoutSession } from './ActiveWorkoutSession';
import { ProgressGallery } from './ProgressGallery';
import { AestheticStoryStudio } from './AestheticStoryStudio';
import { SetupWorkoutWizardModal } from './SetupWorkoutWizardModal';
import { QuickTopicModal, type QuickTopicType } from './QuickTopicModal';
import { CoachPlansModal } from '../coach/CoachPlansModal';
import { LogExtraActivityModal } from './LogExtraActivityModal';
import { LiveClassSessionModal } from './LiveClassSessionModal';
import { FloatingActiveClassPill } from './FloatingActiveClassPill';
import { useCoachCommunicationStore } from '../../stores/useCoachCommunicationStore';
import { useCoachStore } from '../../stores/useCoachStore';
import { useAgendaStore, type RecurringClass } from '../../stores/useAgendaStore';
import { useLiveClassStore } from '../../stores/useLiveClassStore';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export interface AthleteWorkoutViewProps {
  onStartWorkout?: () => void;
}

export const AthleteWorkoutView: React.FC<AthleteWorkoutViewProps> = ({ onStartWorkout }) => {
  const { days } = usePlanBuilderStore();
  const activeDay = days[0];

  const { hasAssignedCoach, assignedCoach } = useCoachStore();
  const hasCoachAccess = hasAssignedCoach && Boolean(assignedCoach);
  const { sendAthleteMessage } = useCoachCommunicationStore();
  const { recurringClasses } = useAgendaStore();
  const { startClass } = useLiveClassStore();

  const [activeSubTab, setActiveSubTab] = useState<'ROUTINE' | 'ANALYTICS'>('ROUTINE');
  const [isRoutineCollapsed, setIsRoutineCollapsed] = useState(true);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isStoryShareOpen, setIsStoryShareOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isCoachPlansOpen, setIsCoachPlansOpen] = useState(false);
  const [isExtraActivityModalOpen, setIsExtraActivityModalOpen] = useState(false);
  const [selectedClassForLog, setSelectedClassForLog] = useState<RecurringClass | null>(null);

  // Borrador inteligente requerido para atletas sin coach
  const [isWorkoutDraftConfigured, setIsWorkoutDraftConfigured] = useState(() => {
    return localStorage.getItem('workout_draft_configured') === 'true' || Boolean(activeDay && activeDay.exercises?.length > 0);
  });

  // Accordion state for Datos & Progreso (Dropdown Menus - Todos cerrados por defecto)
  const [expandedAnalytics, setExpandedAnalytics] = useState<{
    compliance: boolean;
    volume: boolean;
    nextLevel: boolean;
    gallery: boolean;
  }>({
    compliance: false,
    volume: false,
    nextLevel: false,
    gallery: false
  });

  const toggleAnalyticsSection = (key: keyof typeof expandedAnalytics) => {
    setExpandedAnalytics(prev => ({ ...prev, [key]: !prev[key] }));
    if (navigator.vibrate) navigator.vibrate([10]);
  };

  // Coach Direct Actions from Workout Module
  const [coachModalState, setCoachModalState] = useState<{
    isOpen: boolean;
    type: QuickTopicType;
    exerciseName: string;
    weight?: number;
  }>({
    isOpen: false,
    type: 'cargas',
    exerciseName: 'Sentadilla Trasera con Barra',
    weight: 80
  });

  const workoutSummary = useMemo(() => {
    if (!activeDay) return null;
    const directExercises = (activeDay.items?.filter(i => i.type === 'EXERCISE') || []) as RoutineExercise[];
    const blockExercises = (activeDay.items?.filter(i => i.type === 'BLOCK') || []).flatMap((b: any) => b.items || []) as RoutineExercise[];
    let exercises = [...directExercises, ...blockExercises];

    if (exercises.length === 0) {
      exercises = [
        {
          id: 'demo-1',
          type: 'EXERCISE',
          exercise: { id: 'sq-1', name: 'Sentadilla Trasera con Barra', category: 'Piernas', targetMuscle: 'Cuádriceps', planeOfMotion: 'Sagital', equipment: 'Barra' } as any,
          sets: '4',
          reps: '8-10',
          weight: '80 kg',
          rpe: '8',
          videoUrl: '',
          progression: 'Lineal',
          restTimer: '90'
        },
        {
          id: 'demo-2',
          type: 'EXERCISE',
          exercise: { id: 'bp-1', name: 'Press de Banca Plano', category: 'Pecho', targetMuscle: 'Pectoral Mayor', planeOfMotion: 'Transversal', equipment: 'Barra' } as any,
          sets: '4',
          reps: '10',
          weight: '70 kg',
          rpe: '8',
          videoUrl: '',
          progression: 'Lineal',
          restTimer: '90'
        },
        {
          id: 'demo-3',
          type: 'EXERCISE',
          exercise: { id: 'rdl-1', name: 'Peso Muerto Rumano (RDL)', category: 'Piernas', targetMuscle: 'Isquiosurales', planeOfMotion: 'Sagital', equipment: 'Mancuernas' } as any,
          sets: '3',
          reps: '12',
          weight: '32 kg',
          rpe: '7.5',
          videoUrl: '',
          progression: 'Lineal',
          restTimer: '75'
        },
        {
          id: 'demo-4',
          type: 'EXERCISE',
          exercise: { id: 'row-1', name: 'Remo con Barra Inclinado', category: 'Espalda', targetMuscle: 'Dorsal Ancho', planeOfMotion: 'Sagital', equipment: 'Barra' } as any,
          sets: '3',
          reps: '10',
          weight: '60 kg',
          rpe: '8',
          videoUrl: '',
          progression: 'Lineal',
          restTimer: '60'
        }
      ];
    }

    const exerciseCount = exercises.length;
    const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 3), 0);
    const estimatedMinutes = totalSets * 3 || 45;

    return {
      exercises,
      exerciseCount,
      totalSets,
      estimatedMinutes
    };
  }, [activeDay]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full bg-slate-50 dark:bg-[#04060a] text-slate-900 dark:text-white font-lato"
    >
      {/* Header Sticky con Sub-tabs Mobile-First */}
      <div className="pt-4 pb-3 px-4 bg-white dark:bg-[#0a0d16] border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
              Entrenamiento
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Periodización & Rendimiento Biomecánico</p>
          </div>

          <button
            onClick={() => setIsStoryShareOpen(true)}
            className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all shadow-sm active:scale-95"
            title="Compartir entrenamiento en Historias"
          >
            <Share2 size={16} />
          </button>
        </div>

        {/* Segmented Control iOS Style */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-white/5">
          <button
            onClick={() => setActiveSubTab('ROUTINE')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'ROUTINE'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Dumbbell size={14} />
            <span>Rutina de Hoy</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ANALYTICS')}
            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeSubTab === 'ANALYTICS'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Datos & Progreso</span>
          </button>
        </div>
      </div>

      {/* Contenido Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        <AnimatePresence mode="wait">
          {activeSubTab === 'ROUTINE' ? (
            <motion.div
              key="routine"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* Candado Pedagógico: Borrador Inteligente Requerido para Atleta sin Coach */}
              {!hasCoachAccess && !isWorkoutDraftConfigured ? (
                <div className="bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
                    🔒
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      Borrador Inteligente Requerido
                    </span>
                    <h3 className="text-xl font-black font-montserrat text-slate-900 dark:text-white mt-2">
                      Desbloqueá Tu Rutina Personalizada
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      Para darte la selección exacta de ejercicios, series, repeticiones y descansos adaptados a tu cuerpo, completá 3 preguntas rápidas (30 segundos).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-left space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span>Elegí tus días disponibles por semana (3, 4 o 5 días).</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span>Definí tu nivel de experiencia y objetivo (Fuerza, Músculo o Pérdida de Grasa).</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span>Filtrado automático de molestias o lesiones articulares.</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsSetupWizardOpen(true)}
                    className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Sparkles size={16} />
                    <span>Configurar y Desbloquear Mi Rutina</span>
                  </button>
                </div>
              ) : activeDay ? (
                <div className="bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden transition-all">
                  {/* Encabezado Desplegable */}
                  <div 
                    onClick={() => setIsRoutineCollapsed(!isRoutineCollapsed)}
                    className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-rose-50/60 dark:from-zinc-900 dark:via-indigo-950/40 dark:to-purple-950/40 border-b border-indigo-100/80 dark:border-indigo-500/20 text-slate-900 dark:text-white relative cursor-pointer select-none hover:opacity-95 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                          {activeDay.name || 'Día 1'}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 flex items-center gap-1 bg-white/80 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-white/5 shadow-2xs">
                          <Clock size={12} className="text-indigo-500" /> {workoutSummary?.estimatedMinutes || 45} min
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-white/80 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shadow-2xs">
                        {isRoutineCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </div>
                    </div>

                    <h3 className="text-lg sm:text-xl font-montserrat font-black text-slate-900 dark:text-white mt-1">
                      {activeDay.name || 'Rutina de Fuerza & Hipertrofia'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-bold mt-0.5">
                      {workoutSummary?.exerciseCount || 0} Ejercicios • {workoutSummary?.totalSets || 0} Series Totales
                    </p>
                  </div>

                  {/* Lista de Ejercicios Desplegable */}
                  <AnimatePresence>
                    {!isRoutineCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-2.5 bg-slate-50/40 dark:bg-black/20">
                          {workoutSummary?.exercises.map((item, idx) => {
                            const exerciseName = item.exercise?.name || (item as any).name || 'Ejercicio';
                            const rest = item.restTimer || (item as any).restSeconds || '90';
                            const weightNum = parseFloat(item.weight) || 80;

                            return (
                              <div
                                key={item.id || idx}
                                className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200/70 dark:border-white/5 space-y-2 shadow-2xs transition-all hover:border-indigo-200 dark:hover:border-indigo-500/20"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black flex items-center justify-center font-mono">
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 dark:text-white">{exerciseName}</p>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        {item.sets} series × {item.reps} reps • {item.weight || 'Peso corporal'} {item.rpe ? `• RPE ${item.rpe}` : ''}
                                      </p>
                                    </div>
                                  </div>

                                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-slate-200/60 dark:border-white/5 shadow-2xs">
                                    {rest}s descanso
                                  </span>
                                </div>

                                {/* Acciones Directas con el Coach para este Ejercicio */}
                                <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    Coach Direct:
                                    {!hasCoachAccess && (
                                      <span className="text-[8px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-700">
                                        PRO
                                      </span>
                                    )}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!hasCoachAccess) {
                                          toast('Función Exclusiva: Requiere Plan Pro con Coach para ajuste personalizado de cargas.', {
                                            icon: '🔒',
                                            duration: 3500
                                          });
                                          setIsCoachPlansOpen(true);
                                          return;
                                        }
                                        setCoachModalState({
                                          isOpen: true,
                                          type: 'cargas',
                                          exerciseName,
                                          weight: weightNum
                                        });
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer ${
                                        hasCoachAccess
                                          ? 'bg-slate-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-slate-200/80 dark:border-white/5'
                                          : 'bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                                      }`}
                                      title={hasCoachAccess ? "Consultar o ajustar cargas de este ejercicio con tu coach" : "Bloqueado: Requiere Plan Pro con Coach"}
                                    >
                                      {hasCoachAccess ? <span>🏋️</span> : <Lock size={11} className="text-amber-600 dark:text-amber-400" />}
                                      <span>Ajustar Carga</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!hasCoachAccess) {
                                          toast('Función Exclusiva: Requiere Plan Pro con Coach para corrección técnica en video.', {
                                            icon: '🔒',
                                            duration: 3500
                                          });
                                          setIsCoachPlansOpen(true);
                                          return;
                                        }
                                        setCoachModalState({
                                          isOpen: true,
                                          type: 'video',
                                          exerciseName,
                                          weight: weightNum
                                        });
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer ${
                                        hasCoachAccess
                                          ? 'bg-slate-50 dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-slate-200/80 dark:border-white/5'
                                          : 'bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                                      }`}
                                      title={hasCoachAccess ? "Enviar video de tu técnica en este ejercicio al coach" : "Bloqueado: Requiere Plan Pro con Coach"}
                                    >
                                      {hasCoachAccess ? <span>🎥</span> : <Lock size={11} className="text-amber-600 dark:text-amber-400" />}
                                      <span>Validar Técnica</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Dumbbell size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">Día Libre o Sin Rutina Asignada</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      ¿Hiciste una clase, saliste a correr o practicaste algún deporte hoy?
                    </p>
                  </div>
                </div>
              )}

              {/* BOTONES PRINCIPALES A MANO (SIEMPRE VISIBLES SIN SCROLL) */}
              <div className="space-y-2.5">
                {activeDay && (
                  <button
                    onClick={() => {
                      if (onStartWorkout) onStartWorkout();
                      else setIsWorkoutActive(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-95 text-white font-montserrat font-black text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <Play fill="currentColor" size={16} />
                    <span>Iniciar Sesión de Hoy</span>
                  </button>
                )}

                {/* BOTÓN REGISTRAR ACTIVIDAD EXTRA O CLASE GRUPAL */}
                <button
                  type="button"
                  onClick={() => setIsExtraActivityModalOpen(true)}
                  className="w-full py-3 rounded-2xl bg-white dark:bg-[#0a0d16] hover:bg-slate-50 dark:hover:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-montserrat font-black text-xs uppercase tracking-wider border border-indigo-200/90 dark:border-indigo-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs"
                >
                  <Plus size={15} className="text-indigo-500" />
                  <span>+ Registrar Actividad Extra o Clase Grupal</span>
                </button>
              </div>

              {/* CLASES FIJAS DE TU SEMANA (SECCIÓN PEDAGÓGICA Y AUTOMATIZADA) */}
              {recurringClasses && recurringClasses.length > 0 && (
                <div className="p-4 rounded-3xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white uppercase tracking-wider">
                          Tus Clases Fijas en Agenda
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Horarios semanales confirmados
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClassForLog(null);
                        setIsExtraActivityModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      + Nueva Clase
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {recurringClasses.map((cls) => {
                      const dayLabels = cls.daysOfWeek
                        .map(d => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d])
                        .join(' • ');

                      return (
                        <div
                          key={cls.id}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-white/5 space-y-2.5 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl shrink-0">
                                {cls.activityType === 'CROSSFIT' ? '🏋️' : cls.activityType === 'YOGA' ? '🧘' : cls.activityType === 'RUNNING' ? '🏃' : cls.activityType === 'SWIMMING' ? '🏊' : '⚡'}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                  {cls.title}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold truncate">
                                  {dayLabels} • {cls.time} hs • <span className="text-slate-700 dark:text-zinc-300">{cls.instructorName}</span>
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg shrink-0 border border-indigo-200/60 dark:border-indigo-800/40">
                              {cls.durationMinutes}m
                            </span>
                          </div>

                          {/* Botones de Acción: Iniciar Clase en Vivo vs Check-in Rápido */}
                          <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClassForLog(cls);
                                setIsExtraActivityModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[10px] font-bold border border-slate-200/80 dark:border-white/5 transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Registrar que ya realizaste esta clase hoy"
                            >
                              <Check size={12} className="text-emerald-500" />
                              <span>Check-in Rápido</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => startClass(cls)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-[10px] font-montserrat font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs shadow-indigo-500/20"
                              title="Ingresar y dar inicio a la clase en vivo con cronómetro"
                            >
                              <Play fill="currentColor" size={10} />
                              <span>Iniciar Clase</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* SUB-TAB: DATOS & PROGRESO DE ENTRENAMIENTO (MENÚS DESPLEGABLES & PEDAGOGÍA VISUAL) */
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 font-lato"
            >
              {/* 1. Cumplimiento de Entrenamientos (Desplegable) */}
              <div className="bg-white dark:bg-[#0a0d16] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleAnalyticsSection('compliance')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Target size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white truncate">
                        Cumplimiento de Entrenamientos
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold truncate">
                        4 de 5 días completados esta semana
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black font-montserrat px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      85% Hecho
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      {expandedAnalytics.compliance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedAnalytics.compliance && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-100 dark:border-white/5 p-4 sm:p-5 pt-3 space-y-4"
                    >
                      <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold leading-relaxed bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                        💡 <span className="text-slate-900 dark:text-white font-black">¿Cómo vas?</span> Completaste 4 de tus 5 entrenamientos programados para esta semana. Mantener este ritmo constante te asegura progresar sin estancarte ni sobreentrenar.
                      </p>

                      {/* Gráfico de Barras de la Semana */}
                      <div className="bg-slate-50/70 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Actividad Diaria
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Meta: 5 días / semana
                          </span>
                        </div>

                        <div className="h-32 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { day: 'Lun', val: 100, label: 'Lunes: 100% Hecho' },
                              { day: 'Mar', val: 100, label: 'Martes: 100% Hecho' },
                              { day: 'Mié', val: 0, label: 'Miércoles: Descanso' },
                              { day: 'Jue', val: 100, label: 'Jueves: 100% Hecho' },
                              { day: 'Vie', val: 50, label: 'Viernes: 50% Hecho' },
                              { day: 'Sáb', val: 0, label: 'Sábado: Descanso' },
                              { day: 'Dom', val: 0, label: 'Domingo: Descanso' }
                            ]}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.12} />
                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888', fontWeight: 'bold' }} />
                              <Bar dataKey="val" fill="#10b981" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Pastillas de Resumen Fácil */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-500/20">
                          <span className="block font-black text-emerald-700 dark:text-emerald-300">4 Días</span>
                          <span className="text-[10px] font-bold text-slate-500">Entrenados</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-500/20">
                          <span className="block font-black text-amber-700 dark:text-amber-300">1 Día</span>
                          <span className="text-[10px] font-bold text-slate-500">Pendiente</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20">
                          <span className="block font-black text-indigo-700 dark:text-indigo-300">2 Días</span>
                          <span className="text-[10px] font-bold text-slate-500">Recuperación</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Peso Total Levantado (Desplegable) */}
              <div className="bg-white dark:bg-[#0a0d16] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleAnalyticsSection('volume')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <TrendingUp size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white truncate">
                        Peso Total Levantado
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold truncate">
                        Suma de todos los kilos en tus series
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black font-montserrat px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                      12.500 kg
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      {expandedAnalytics.volume ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedAnalytics.volume && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-100 dark:border-white/5 p-4 sm:p-5 pt-3 space-y-4"
                    >
                      <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold leading-relaxed bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex items-start gap-2">
                        <Car size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-slate-900 dark:text-white">Equivalencia fácil:</strong> Esta semana levantaste <strong className="text-indigo-600 dark:text-indigo-400">12.500 kg en total</strong> sumando todas tus series. ¡Es como haber levantado el peso de <strong>8 autos medianos</strong>! 🚗💪
                        </span>
                      </p>

                      {/* Gráfico de Evolución Semanal */}
                      <div className="bg-slate-50/70 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Evolución Semanal de Sobrecarga
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            +8.7% vs semana anterior
                          </span>
                        </div>

                        <div className="h-32 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                              { week: 'Semana 1', vol: 10000, label: '10.000 kg' },
                              { week: 'Semana 2', vol: 11500, label: '11.500 kg' },
                              { week: 'Semana 3', vol: 12500, label: '12.500 kg' }
                            ]}>
                              <defs>
                                <linearGradient id="colorVolW" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.12} />
                              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888', fontWeight: 'bold' }} />
                              <Area type="monotone" dataKey="vol" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVolW)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-500/20">
                          <span className="block font-black text-indigo-700 dark:text-indigo-300">+8.7%</span>
                          <span className="text-[10px] font-bold text-slate-500">Crecimiento de Fuerza</span>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-500/20">
                          <span className="block font-black text-emerald-700 dark:text-emerald-300">Óptimo</span>
                          <span className="text-[10px] font-bold text-slate-500">Sobrecarga Progresiva</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Tu Próximo Nivel (Desplegable) */}
              <div className="bg-white dark:bg-[#0a0d16] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleAnalyticsSection('nextLevel')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Award size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white truncate">
                        Tu Próximo Nivel
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold truncate">
                        Fase 1: Fuerza Base en Curso
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black font-montserrat px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                      Semana 2 de 4
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      {expandedAnalytics.nextLevel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedAnalytics.nextLevel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-100 dark:border-white/5 p-4 sm:p-5 pt-3 space-y-4"
                    >
                      <p className="text-xs text-slate-600 dark:text-zinc-300 font-bold leading-relaxed bg-slate-50 dark:bg-zinc-900/60 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                        ⭐ <strong className="text-slate-900 dark:text-white">Plan por Etapas:</strong> Al completar las 4 semanas de este ciclo, desbloquearás la <strong>Fase 2: Hipertrofia & Densidad</strong> con nuevos ejercicios y métodos avanzados de estímulo muscular.
                      </p>

                      {/* Línea de Tiempo Visual y Sencilla */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-500/20">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">Semana 1: Adaptación Anatómica</p>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Completada con éxito</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-emerald-600">✓ 100%</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30">
                          <div className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black animate-pulse">
                              2
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">Semana 2: Intensificación de Cargas</p>
                              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">En curso • 4 de 5 sesiones</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-indigo-600">80%</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-white/5 opacity-60">
                          <div className="flex items-center gap-2.5">
                            <Lock size={14} className="text-slate-400" />
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Semana 3: Volumen Máximo</p>
                              <p className="text-[10px] text-slate-400">Se desbloquea al terminar semana 2</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Bloqueado</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-white/5 opacity-60">
                          <div className="flex items-center gap-2.5">
                            <Lock size={14} className="text-slate-400" />
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Semana 4: Descarga & Supercompensación</p>
                              <p className="text-[10px] text-slate-400">Consolidación antes de la Fase 2</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">Bloqueado</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Galería de Fotos de Cambio Físico (Desplegable) */}
              <div className="bg-white dark:bg-[#0a0d16] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xs overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => toggleAnalyticsSection('gallery')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Camera size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white truncate">
                        Fotos de Progreso Físico
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold truncate">
                        Registro privado • Próximo control en 30 días
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black font-montserrat px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                      Día 1 Guardado
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                      {expandedAnalytics.gallery ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedAnalytics.gallery && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-100 dark:border-white/5 p-4 sm:p-5 pt-3 space-y-3"
                    >
                      <ProgressGallery />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Workout Session Overlay */}
      <AnimatePresence>
        {isWorkoutActive && !onStartWorkout && (
          <ActiveWorkoutSession 
            day={activeDay} 
            onClose={() => setIsWorkoutActive(false)} 
          />
        )}
      </AnimatePresence>

      {/* Aesthetic Story Studio Modal */}
      <SetupWorkoutWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        onSuccess={() => setIsWorkoutDraftConfigured(true)}
      />

      <AestheticStoryStudio
        isOpen={isStoryShareOpen}
        onClose={() => setIsStoryShareOpen(false)}
        initialCategory="WORKOUT"
        workoutData={{
          workoutName: activeDay?.name || 'Sesión de Entrenamiento',
          totalSets: workoutSummary?.totalSets,
          durationMinutes: workoutSummary?.estimatedMinutes
        }}
      />

      {/* Direct Coach Communication Modal from Workout Module */}
      <QuickTopicModal
        isOpen={coachModalState.isOpen}
        onClose={() => setCoachModalState(prev => ({ ...prev, isOpen: false }))}
        topicType={coachModalState.type}
        coachName={assignedCoach?.name || 'Coach Leandro'}
        initialExerciseName={coachModalState.exerciseName}
        initialWeight={coachModalState.weight}
        onSendMessage={sendAthleteMessage}
      />

      {/* Modal de Planes y Selección de Coaches Certificados */}
      <CoachPlansModal
        isOpen={isCoachPlansOpen}
        onClose={() => setIsCoachPlansOpen(false)}
      />

      {/* Modal de Registro de Actividad Extra o Clase Grupal */}
      <LogExtraActivityModal
        isOpen={isExtraActivityModalOpen}
        initialClass={selectedClassForLog}
        onClose={() => {
          setIsExtraActivityModalOpen(false);
          setSelectedClassForLog(null);
        }}
      />

      {/* Modal de Clase en Vivo (Cronómetro Persistente, Inmune a Bloqueo de Pantalla) */}
      <LiveClassSessionModal />

      {/* Pill Flotante de Clase en Vivo (cuando el modal está minimizado) */}
      <FloatingActiveClassPill />
    </motion.div>
  );
};

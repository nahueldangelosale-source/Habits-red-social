import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExecutionStore } from '../../stores/useExecutionStore';
import { type WorkoutDay, type RoutineExercise } from '../../stores/usePlanBuilderStore';
import { useCompleteSetMutation } from '../../hooks/useCompleteSetMutation';
import { resolveExerciseVideo, ALL_CATILLI_VIDEOS, type ExerciseVideoInfo } from '../../utils/exerciseVideoMap';
import { 
  CheckCircle2, Play, Pause, Timer, X, Trophy, Dumbbell, 
  Video, Clock, ArrowLeft, ChevronLeft, ChevronRight,
  RefreshCw, Search, Building2, ShieldAlert, Check, Maximize2, Sparkles, Zap, Flame, Award, ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  day: WorkoutDay;
  onClose: () => void;
}

const DEFAULT_DEMO_EXERCISES: RoutineExercise[] = [
  {
    id: 'demo-sq-1',
    type: 'EXERCISE',
    exercise: { 
      ID_Ejercicio: 'CATILLI_SQ_01',
      Nombre_Oficial: 'Sentadilla Atrás con Barra',
      Alias_Buscador: 'Back Squat',
      Patron_Movimiento: 'Dominante de Rodilla',
      Lateralidad: 'Bilateral',
      Carga_Axial: 'SÍ',
      Musculo_Agonista: 'Cuádriceps',
      Musculos_Sinergistas: 'Glúteo Mayor, Erectores Espinales',
      Equipamiento_Requerido: 'Barra Olímpica',
      Nivel_Habilidad: '4',
      Nivel_Impacto_Articular: 'Medio',
      Cue_Verbal_Foco_Externo: 'Empuja el suelo con los talones y mantén el pecho erguido.',
      Url_Video_Youtube: 'https://www.youtube.com/embed/IX4rtWXcAlY'
    } as any,
    sets: '4',
    reps: '8-10',
    weight: '80',
    rpe: '8',
    videoUrl: 'https://www.youtube.com/embed/IX4rtWXcAlY',
    progression: 'Lineal',
    restTimer: '90',
    tempo: '3-0-1-0',
    rir: '2'
  },
  {
    id: 'demo-bp-1',
    type: 'EXERCISE',
    exercise: { 
      ID_Ejercicio: 'BENCH_001',
      Nombre_Oficial: 'Press de Banca Plano con Barra',
      Alias_Buscador: 'Bench Press',
      Patron_Movimiento: 'Empuje Horizontal',
      Lateralidad: 'Bilateral',
      Carga_Axial: 'NO',
      Musculo_Agonista: 'Pectoral Mayor',
      Musculos_Sinergistas: 'Tríceps Braquial, Deltoides Anterior',
      Equipamiento_Requerido: 'Banco Plano y Barra',
      Nivel_Habilidad: '3',
      Nivel_Impacto_Articular: 'Medio',
      Cue_Verbal_Foco_Externo: 'Retrae escápulas y empuja la barra alejando el banco de ti con control.',
      Url_Video_Youtube: 'https://www.youtube.com/embed/fcrDKKNBba8'
    } as any,
    sets: '4',
    reps: '10',
    weight: '70',
    rpe: '8',
    videoUrl: 'https://www.youtube.com/embed/fcrDKKNBba8',
    progression: 'Lineal',
    restTimer: '90',
    tempo: '2-1-1-0',
    rir: '2'
  },
  {
    id: 'demo-rdl-1',
    type: 'EXERCISE',
    exercise: { 
      ID_Ejercicio: 'CATILLI_DL_01',
      Nombre_Oficial: 'Peso Muerto con Barra Hexagonal',
      Alias_Buscador: 'Trap Bar Deadlift',
      Patron_Movimiento: 'Dominante de Cadera',
      Lateralidad: 'Bilateral',
      Carga_Axial: 'SÍ',
      Musculo_Agonista: 'Isquiosurales & Glúteos',
      Musculos_Sinergistas: 'Erectores Espinales, Core',
      Equipamiento_Requerido: 'Barra Hexagonal',
      Nivel_Habilidad: '3',
      Nivel_Impacto_Articular: 'Bajo',
      Cue_Verbal_Foco_Externo: 'Empuja la cadera hacia la pared de atrás manteniendo el tronco firme.',
      Url_Video_Youtube: 'https://www.youtube.com/embed/-zrb-pvvLKA'
    } as any,
    sets: '3',
    reps: '10',
    weight: '90',
    rpe: '7.5',
    videoUrl: 'https://www.youtube.com/embed/-zrb-pvvLKA',
    progression: 'Lineal',
    restTimer: '75',
    tempo: '3-1-1-0',
    rir: '2'
  },
  {
    id: 'demo-vuelo-1',
    type: 'EXERCISE',
    exercise: { 
      ID_Ejercicio: 'CATILLI_FLY_01',
      Nombre_Oficial: 'Vuelo Posterior en Máquina',
      Alias_Buscador: 'Reverse Fly',
      Patron_Movimiento: 'Tracción Horizontal',
      Lateralidad: 'Bilateral',
      Carga_Axial: 'NO',
      Musculo_Agonista: 'Deltoides Posterior',
      Musculos_Sinergistas: 'Romboides, Trapecio Medio',
      Equipamiento_Requerido: 'Máquina Pec Deck Invertida',
      Nivel_Habilidad: '2',
      Nivel_Impacto_Articular: 'Bajo',
      Cue_Verbal_Foco_Externo: 'Abre los brazos como si quisieras abrazar un barril gigante hacia atrás.',
      Url_Video_Youtube: 'https://www.youtube.com/embed/gEjyGp2Gje8'
    } as any,
    sets: '3',
    reps: '12',
    weight: '35',
    rpe: '8',
    videoUrl: 'https://www.youtube.com/embed/gEjyGp2Gje8',
    progression: 'Lineal',
    restTimer: '60',
    tempo: '2-0-1-1',
    rir: '2'
  }
];

// ─── Matriz Inteligente de Rotación de 3 Variantes (Tríos Biomecánicos) ─────────

interface SmartSwapOption {
  title: string;
  videoId: string;
  embedUrl: string;
  badge: string;
  reason: string;
  equipment: string;
  icon: string;
}

const TRIO_FAMILIES: Array<{
  familyKey: string;
  match: string[];
  options: SmartSwapOption[];
}> = [
  // 1. Sentadilla / Cuádriceps / Dominante de rodilla
  {
    familyKey: 'SQUAT',
    match: ['sentadilla', 'squat', 'sissy', 'cuad', 'pierna'],
    options: [
      {
        title: 'Sentadilla Atrás con Barra',
        videoId: 'IX4rtWXcAlY',
        embedUrl: 'https://www.youtube.com/embed/IX4rtWXcAlY',
        badge: '🏋️ Barra Olímpica / Principal',
        reason: 'Variante reina de fuerza y sobrecarga si el rack ya está libre.',
        equipment: 'Barra Olímpica',
        icon: '🏋️'
      },
      {
        title: 'Sentadilla con mancuernas',
        videoId: 'QwUWx_cesxQ',
        embedUrl: 'https://www.youtube.com/embed/QwUWx_cesxQ',
        badge: '⚡ Mancuernas (Rack Ocupado)',
        reason: 'Mismo estímulo de cuádriceps sin necesidad de esperar el rack ni la barra olímpica.',
        equipment: 'Mancuernas',
        icon: '⚡'
      },
      {
        title: 'Sentadilla sissy en banco',
        videoId: 'OYsrflL2LNY',
        embedUrl: 'https://www.youtube.com/embed/OYsrflL2LNY',
        badge: '🛡️ Cero Carga Axial / Seguro',
        reason: 'Aislamiento directo de cuádriceps sin compresión en la columna ni lumbar.',
        equipment: 'Banco / Peso Corporal',
        icon: '🛡️'
      }
    ]
  },
  // 2. Press de Banca / Pectoral / Empuje Horizontal
  {
    familyKey: 'BENCH',
    match: ['press', 'banca', 'plano', 'pecho', 'bench', 'hammer', 'pectoral'],
    options: [
      {
        title: 'Press de Banca Plano con Barra',
        videoId: 'fcrDKKNBba8',
        embedUrl: 'https://www.youtube.com/embed/fcrDKKNBba8',
        badge: '🏋️ Barra / Banco Principal',
        reason: 'Variante principal con barra olímpica si el banco plano ya está libre.',
        equipment: 'Banco Plano y Barra',
        icon: '🏋️'
      },
      {
        title: 'Press banco plano con mancuernas',
        videoId: 'y1r5K2ULZNs',
        embedUrl: 'https://www.youtube.com/embed/y1r5K2ULZNs',
        badge: '⚡ Mancuernas (Banco Ocupado)',
        reason: 'Mismo estímulo de pectoral con mayor libertad articular y sin esperar la barra.',
        equipment: 'Mancuernas',
        icon: '⚡'
      },
      {
        title: 'Press pecho hammer',
        videoId: 'G_Fb29uBBic',
        embedUrl: 'https://www.youtube.com/embed/G_Fb29uBBic',
        badge: '🛡️ Máquina Guiada',
        reason: 'Trayectoria convergente segura con máxima estabilidad y cero riesgo de fallo.',
        equipment: 'Máquina Hammer',
        icon: '🛡️'
      }
    ]
  },
  // 3. Peso Muerto / Cadera / Isquios & Glúteos
  {
    familyKey: 'DEADLIFT',
    match: ['peso muerto', 'deadlift', 'isquio', 'glute', 'cadera', 'puente'],
    options: [
      {
        title: 'Peso Muerto con Barra Hexagonal',
        videoId: '-zrb-pvvLKA',
        embedUrl: 'https://www.youtube.com/embed/-zrb-pvvLKA',
        badge: '🏋️ Barra Hexagonal / Principal',
        reason: 'Variante principal con barra hexagonal si el espacio ya está disponible.',
        equipment: 'Barra Hexagonal',
        icon: '🏋️'
      },
      {
        title: 'Peso muerto rumano con mancuernas',
        videoId: 'OjwTR4XD6sw',
        embedUrl: 'https://www.youtube.com/embed/OjwTR4XD6sw',
        badge: '⚡ Mancuernas (Libre)',
        reason: 'Misma activación profunda de isquiosurales y glúteos en cualquier banco libre.',
        equipment: 'Mancuernas',
        icon: '⚡'
      },
      {
        title: 'Puente de gluteo con mancuerna',
        videoId: 'XX5WkE09k9E',
        embedUrl: 'https://www.youtube.com/embed/XX5WkE09k9E',
        badge: '🛡️ Suelo / Mínimo Impacto Lumbar',
        reason: 'Excelente estímulo de glúteo en el suelo con cero estrés para la espalda baja.',
        equipment: 'Mancuerna / Suelo',
        icon: '🍑'
      }
    ]
  },
  // 4. Vuelo Posterior / Remo / Espalda
  {
    familyKey: 'ROW_FLY',
    match: ['vuelo', 'remo', 'dorsal', 'espalda', 'traccion', 'deltoide'],
    options: [
      {
        title: 'Vuelo Posterior en Máquina',
        videoId: 'gEjyGp2Gje8',
        embedUrl: 'https://www.youtube.com/embed/gEjyGp2Gje8',
        badge: '⚙️ Máquina Pec Deck / Principal',
        reason: 'Variante guiada si la máquina pec deck invertida ya está disponible.',
        equipment: 'Máquina Pec Deck',
        icon: '⚙️'
      },
      {
        title: 'Vuelo posterior sentado con mancuernas',
        videoId: 'wy48Q5PBM8A',
        embedUrl: 'https://www.youtube.com/embed/wy48Q5PBM8A',
        badge: '⚡ Mancuernas (Pec Deck Ocupado)',
        reason: 'Aisla el deltoides posterior en cualquier banco libre usando mancuernas.',
        equipment: 'Mancuernas',
        icon: '⚡'
      },
      {
        title: 'Remo a 1bb con mancuerna 2 apoyos',
        videoId: 'rsG3rtWFEb8',
        embedUrl: 'https://www.youtube.com/embed/rsG3rtWFEb8',
        badge: '🛡️ Máxima Estabilidad',
        reason: 'Estímulo unilateral de espalda alta con apoyo en banco para proteger el core.',
        equipment: 'Mancuerna y Banco',
        icon: '💪'
      }
    ]
  }
];

function normalizeTextSimple(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Retorna las 2 opciones complementarias del trío para permitir
 * rotar limpiamente entre las 3 variantes en cualquier momento.
 */
function getCuratedSmartAlternatives(currentExerciseName: string, targetMuscle: string): SmartSwapOption[] {
  const normCurrent = normalizeTextSimple(currentExerciseName || '');

  for (const fam of TRIO_FAMILIES) {
    const isMatch = fam.match.some(m => normCurrent.includes(m) || targetMuscle.toLowerCase().includes(m));
    if (isMatch) {
      // Filtrar para excluir el ejercicio que está actualmente seleccionado
      const otherOptions = fam.options.filter(opt => {
        const normOpt = normalizeTextSimple(opt.title);
        return normOpt !== normCurrent && !normOpt.includes(normCurrent) && !normCurrent.includes(normOpt);
      });

      if (otherOptions.length >= 2) {
        return otherOptions.slice(0, 2);
      }
      if (otherOptions.length === 1) {
        return otherOptions;
      }
    }
  }

  // Fallback genérico
  return [
    {
      title: 'Press vertical de pie con mancuernas',
      videoId: 'EY4SMXe1diQ',
      embedUrl: 'https://www.youtube.com/embed/EY4SMXe1diQ',
      badge: '⚡ Variante Mancuernas',
      reason: 'Estímulo libre equivalente con mancuernas.',
      equipment: 'Mancuernas',
      icon: '🏋️'
    },
    {
      title: 'Sentadilla con mancuernas',
      videoId: 'QwUWx_cesxQ',
      embedUrl: 'https://www.youtube.com/embed/QwUWx_cesxQ',
      badge: '🛡️ Alternativa Guiada',
      reason: 'Variante segura y accesible.',
      equipment: 'Mancuernas',
      icon: '⚡'
    }
  ];
}

// ─── Función Pedagógica de Nombres de Músculos (Fácil de entender) ───────────

function getFriendlyMuscleInfo(rawMuscle: string): { name: string; icon: string } {
  const m = (rawMuscle || '').toLowerCase();
  if (m.includes('cuad') || m.includes('pierna') || m.includes('rodilla')) {
    return { name: 'Piernas (Cuádriceps)', icon: '🦵' };
  }
  if (m.includes('pecho') || m.includes('pectoral') || m.includes('empuje')) {
    return { name: 'Pecho (Pectoral)', icon: '🛡️' };
  }
  if (m.includes('isquio') || m.includes('glute') || m.includes('cadera') || m.includes('femoral')) {
    return { name: 'Glúteos e Isquios', icon: '🍑' };
  }
  if (m.includes('deltoide') || m.includes('hombro')) {
    return { name: 'Hombros', icon: '🦾' };
  }
  if (m.includes('espalda') || m.includes('dorsal') || m.includes('traccion') || m.includes('remo')) {
    return { name: 'Espalda Alta', icon: '🦅' };
  }
  if (m.includes('brazo') || m.includes('biceps') || m.includes('triceps')) {
    return { name: 'Brazos', icon: '💪' };
  }
  if (m.includes('core') || m.includes('abdom')) {
    return { name: 'Zona Media / Core', icon: '🧱' };
  }
  return { name: rawMuscle || 'Grupo Muscular', icon: '⚡' };
}

export const ActiveWorkoutSession: React.FC<Props> = ({ day, onClose }) => {
  const { startSession, endSession, activeSession } = useExecutionStore();
  const [isFinishingModalOpen, setIsFinishingModalOpen] = useState(false);
  const [showDataReveal, setShowDataReveal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedVideoExercise, setSelectedVideoExercise] = useState<RoutineExercise | null>(null);

  // Stepper: Índice del ejercicio actual enfocado (1 por 1)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lista local mutable de ejercicios para permitir reemplazos en vivo
  const initialExercises: RoutineExercise[] = useMemo(() => {
    const direct = (day?.items?.filter(i => i.type === 'EXERCISE') || []) as RoutineExercise[];
    const fromBlocks = (day?.items?.filter(i => i.type === 'BLOCK') || []).flatMap((b: any) => b.items || []) as RoutineExercise[];
    const total = [...direct, ...fromBlocks];
    if (total.length > 0) return total;
    return DEFAULT_DEMO_EXERCISES;
  }, [day?.items]);

  const [exercisesList, setExercisesList] = useState<RoutineExercise[]>(initialExercises);

  // Modal de reemplazo por máquina ocupada o preferencia
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Set-level micro evaluation modal state
  const [evaluatingSet, setEvaluatingSet] = useState<{
    exercise: RoutineExercise;
    setIndex: number;
    reps: string;
    weight: string;
  } | null>(null);

  // Session assessment data to forward to final celebration
  const [completedSessionData, setCompletedSessionData] = useState<{
    rpe: number;
    pain: number;
    satisfaction: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'TIRED';
    notes: string;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (day?.id) {
      startSession(day.id);
    } else {
      startSession('day-default-session');
    }
  }, [day?.id, startSession]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenFinishModal = () => {
    setIsFinishingModalOpen(true);
  };

  const handleConfirmFinishSession = (sessionData: {
    rpe: number;
    pain: number;
    satisfaction: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'TIRED';
    notes: string;
  }) => {
    setCompletedSessionData(sessionData);
    setIsFinishingModalOpen(false);
    setShowDataReveal(true);

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80, 40, 120]);
    }

    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8']
    });

    window.dispatchEvent(new CustomEvent('xp:award', {
      detail: { source: 'workout_complete', amount: 140 }
    }));

    endSession(sessionData.notes, sessionData.rpe, sessionData.pain, sessionData.satisfaction);
  };

  // Reemplazar el ejercicio activo con el Swap Inteligente
  const handleSwapCurrentExercise = (newExercise: {
    title: string;
    embedUrl: string;
    equipment?: string;
  }) => {
    const current = exercisesList[currentIndex];
    const updated: RoutineExercise = {
      ...current,
      exercise: {
        ...current.exercise,
        Nombre_Oficial: newExercise.title,
        Equipamiento_Requerido: newExercise.equipment || 'Mancuernas',
        Url_Video_Youtube: newExercise.embedUrl
      } as any,
      videoUrl: newExercise.embedUrl
    };

    const nextList = [...exercisesList];
    nextList[currentIndex] = updated;
    setExercisesList(nextList);
    setIsSwapModalOpen(false);

    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
  };

  const currentExercise = exercisesList[currentIndex] || exercisesList[0];

  // Comprobar si todas las series del ejercicio actual están completadas
  const isCurrentExerciseCompleted = useMemo(() => {
    if (!currentExercise || !activeSession?.exercises?.[currentExercise.id]) return false;
    const numSets = parseInt(currentExercise.sets) || 3;
    const recorded = activeSession.exercises[currentExercise.id];
    let completedCount = 0;
    for (let i = 0; i < numSets; i++) {
      if (recorded[i]?.isCompleted) completedCount++;
    }
    return completedCount >= numSets;
  }, [currentExercise, activeSession?.exercises]);

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center font-lato">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md h-[100dvh] bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white flex flex-col relative overflow-hidden shadow-2xl"
      >
        {/* Sticky Mobile Header con Contador de Pasos */}
        <div className="pt-3 pb-2 px-3 sm:px-4 bg-white/95 dark:bg-[#0a0d16]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/5 shrink-0 sticky top-0 z-30 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                title="Volver"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-indigo-500/20">
                    En Vivo
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock size={11} className="text-indigo-500" /> {formatTimer(elapsedSeconds)}
                  </span>
                </div>
                <h2 className="font-montserrat font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-tight mt-0.5">
                  {day?.name || 'Día 1: Fuerza & Hipertrofia'}
                </h2>
              </div>
            </div>

            <button
              onClick={handleOpenFinishModal}
              className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-montserrat font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 active:scale-95 transition-all"
            >
              <CheckCircle2 size={13} />
              <span>Finalizar</span>
            </button>
          </div>

          {/* Stepper Tabs: Píldoras interactivas de ejercicios */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {exercisesList.map((ex, idx) => {
              const setsRec = activeSession?.exercises?.[ex.id] || [];
              const totalSets = parseInt(ex.sets) || 3;
              const isDone = setsRec.filter(s => s?.isCompleted).length >= totalSets && totalSets > 0;
              const isActive = idx === currentIndex;

              return (
                <button
                  key={ex.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-1 min-w-[60px] py-1 px-1.5 rounded-xl text-center transition-all flex items-center justify-center gap-1 border text-xs font-montserrat ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-black'
                      : isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 font-bold'
                      : 'bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border-transparent font-medium'
                  }`}
                >
                  {isDone ? (
                    <Check size={12} className="text-emerald-500" />
                  ) : (
                    <span>#{idx + 1}</span>
                  )}
                  <span className="truncate text-[10px] hidden xs:inline">
                    {idx === currentIndex ? 'Actual' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenedor Principal: 1 Ejercicio a la Vez con Video Directo */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise.id || currentIndex}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.18 }}
            >
              <ExerciseFocusCard 
                exercise={currentExercise}
                order={currentIndex + 1}
                totalExercises={exercisesList.length}
                onOpenFullscreenVideo={() => setSelectedVideoExercise(currentExercise)}
                onOpenSwap={() => setIsSwapModalOpen(true)}
                onRequestSetEvaluation={(setIndex, reps, weight) => {
                  setEvaluatingSet({ exercise: currentExercise, setIndex, reps, weight });
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Barra Inferior Fija de Navegación entre Ejercicios */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 bg-white/95 dark:bg-[#0a0d16]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/5 z-20 flex items-center justify-between gap-2.5 shadow-lg">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="py-3 px-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-all shadow-xs shrink-0"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>

          {currentIndex < exercisesList.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(exercisesList.length - 1, prev + 1))}
              className={`flex-1 py-3 px-4 rounded-2xl font-montserrat font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 ${
                isCurrentExerciseCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
              }`}
            >
              <span>Siguiente Ejercicio</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleOpenFinishModal}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <Trophy size={16} />
              <span>Finalizar Sesión (+140 XP)</span>
            </button>
          )}
        </div>

        {/* Modal: Reemplazo Inteligente Biomecánico con Rotación de 3 Vías (Efecto Ajá) */}
        <AnimatePresence>
          {isSwapModalOpen && (
            <SmartExerciseSwapModal 
              currentExercise={currentExercise}
              onSelectAlternative={handleSwapCurrentExercise}
              onClose={() => setIsSwapModalOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Modal: Micro-Evaluación de Serie (Pedagógico y Visual) */}
        <AnimatePresence>
          {evaluatingSet && (
            <SetEffortPainModal 
              exercise={evaluatingSet.exercise}
              setIndex={evaluatingSet.setIndex}
              reps={evaluatingSet.reps}
              weight={evaluatingSet.weight}
              onSave={() => {
                setEvaluatingSet(null);
              }}
              onClose={() => setEvaluatingSet(null)}
            />
          )}
        </AnimatePresence>

        {/* Modal: Evaluación Global del Día / Fin de Sesión (Amigable & Simple) */}
        <AnimatePresence>
          {isFinishingModalOpen && (
            <SessionDailyAssessmentModal 
              elapsedTime={formatTimer(elapsedSeconds)}
              onConfirm={handleConfirmFinishSession}
              onClose={() => setIsFinishingModalOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Modal de Video en Pantalla Completa & Biomecánica */}
        <AnimatePresence>
          {selectedVideoExercise && (
            <ExerciseVideoModal 
              exercise={selectedVideoExercise} 
              onClose={() => setSelectedVideoExercise(null)} 
            />
          )}
        </AnimatePresence>

        {/* Data-Reveal Celebration Overlay (Resumen Amigable, Coherente y Pedagógico) */}
        <AnimatePresence>
          {showDataReveal && (
            <GamingCelebrationOverlay 
              exercises={exercisesList}
              elapsedTime={formatTimer(elapsedSeconds)} 
              sessionData={completedSessionData}
              onContinue={() => {
                setShowDataReveal(false);
                onClose();
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ─── Tarjeta Enfocada con Video Directo y Opciones de Expansión ───────────────

interface ExerciseFocusCardProps {
  exercise: RoutineExercise;
  order: number;
  totalExercises: number;
  onOpenFullscreenVideo: () => void;
  onOpenSwap: () => void;
  onRequestSetEvaluation: (setIndex: number, reps: string, weight: string) => void;
}

const ExerciseFocusCard: React.FC<ExerciseFocusCardProps> = ({ 
  exercise, order, totalExercises, onOpenFullscreenVideo, onOpenSwap, onRequestSetEvaluation 
}) => {
  const numSets = parseInt(exercise.sets) || 3;
  const setsArray = Array.from({ length: numSets }, (_, i) => i);
  const [activeTimerSet, setActiveTimerSet] = useState<number | null>(null);

  const exerciseName = exercise.exercise?.Nombre_Oficial || exercise.exercise?.name || (exercise as any).name || 'Ejercicio';
  const targetMuscle = exercise.exercise?.Musculo_Agonista || exercise.exercise?.targetMuscle || 'Grupo Principal';
  const equipment = exercise.exercise?.Equipamiento_Requerido || exercise.exercise?.equipment || 'Libre';
  const cue = exercise.exercise?.Cue_Verbal_Foco_Externo || 'Mantén el control en todo el rango de movimiento.';
  const restSeconds = parseInt(exercise.restTimer || '90') || 90;

  // Video info resuelto de Catilli
  const videoInfo: ExerciseVideoInfo = useMemo(() => {
    return resolveExerciseVideo(exerciseName, exercise.videoUrl || exercise.exercise?.Url_Video_Youtube);
  }, [exerciseName, exercise.videoUrl, exercise.exercise?.Url_Video_Youtube]);

  return (
    <div className="bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200/80 dark:border-white/5 overflow-hidden shadow-xs space-y-0">
      {/* 1. Video Player Directo en la Pantalla */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        <iframe 
          src={`${videoInfo.embedUrl}?rel=0&modestbranding=1`} 
          title={videoInfo.title}
          className="w-full h-full border-0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen 
        />
        
        {/* Botón flotante para expandir a pantalla completa */}
        <button
          type="button"
          onClick={onOpenFullscreenVideo}
          className="absolute top-2.5 right-2.5 z-10 py-1.5 px-2.5 rounded-xl bg-black/70 hover:bg-black/90 text-white font-montserrat font-bold text-[10px] backdrop-blur-md flex items-center gap-1.5 border border-white/20 active:scale-95 transition-all shadow-md"
          title="Expandir video a pantalla completa con guía biomecánica"
        >
          <Maximize2 size={12} className="text-amber-300" />
          <span>Expandir ⛶</span>
        </button>
      </div>

      {/* 2. Header con Título del Ejercicio y Botón Máquina Ocupada */}
      <div className="p-3.5 bg-gradient-to-br from-indigo-50/40 via-slate-50/40 to-white dark:from-zinc-900/60 dark:to-zinc-900/20 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
              {order}/{totalExercises} • {targetMuscle} • {equipment}
            </span>
            <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white leading-tight truncate">
              {exerciseName}
            </h3>
          </div>

          <button
            onClick={onOpenSwap}
            className="py-1.5 px-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-black text-[10px] flex items-center gap-1 border border-amber-200/70 dark:border-amber-500/20 active:scale-95 transition-all shadow-2xs shrink-0"
            title="Cambiar ejercicio si la máquina está ocupada o tienes molestias"
          >
            <RefreshCw size={11} className="text-amber-600" />
            <span>¿Máquina Ocupada? 🔄</span>
          </button>
        </div>

        {/* Coach Cue Compacto */}
        {cue && (
          <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 leading-tight">
            <span className="shrink-0 text-xs">💡</span>
            <p className="font-medium">{cue}</p>
          </div>
        )}
      </div>

      {/* 3. Tabla de Series Compacta */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-[28px_1fr_1fr_1fr_36px] gap-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider text-center">
          <div>SET</div>
          <div>KG</div>
          <div>REPS</div>
          <div>SENSACIÓN</div>
          <div>LISTO</div>
        </div>

        {setsArray.map(setIndex => (
          <SetRow 
            key={setIndex}
            exercise={exercise}
            setIndex={setIndex}
            onComplete={() => {
              if (restSeconds > 0) {
                setActiveTimerSet(setIndex);
              }
            }}
            onEvaluateRequest={(reps, weight) => {
              onRequestSetEvaluation(setIndex, reps, weight);
            }}
          />
        ))}

        {/* Embedded Rest Timer */}
        <AnimatePresence mode="wait">
          {activeTimerSet !== null && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-1"
            >
              <EmbeddedTimer 
                seconds={restSeconds} 
                onDismiss={() => setActiveTimerSet(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─── Modal: Reemplazo Inteligente Biomecánico (Rotación Continua de 3 Vías) ───

interface SmartExerciseSwapModalProps {
  currentExercise: RoutineExercise;
  onSelectAlternative: (exercise: {
    title: string;
    embedUrl: string;
    equipment?: string;
  }) => void;
  onClose: () => void;
}

const SmartExerciseSwapModal: React.FC<SmartExerciseSwapModalProps> = ({ 
  currentExercise, onSelectAlternative, onClose 
}) => {
  const currentName = currentExercise.exercise?.Nombre_Oficial || currentExercise.exercise?.name || (currentExercise as any).name || 'Ejercicio Actual';
  const targetMuscle = currentExercise.exercise?.Musculo_Agonista || currentExercise.exercise?.targetMuscle || 'Músculo Principal';

  // Obtiene siempre las otras 2 opciones del trío biomecánico
  const smartOptions = useMemo(() => {
    return getCuratedSmartAlternatives(currentName, targetMuscle);
  }, [currentName, targetMuscle]);

  return (
    <div className="fixed inset-0 z-[170] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-lato">
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#0c0f18] rounded-t-3xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xl p-5 space-y-4 max-h-[88vh] flex flex-col"
      >
        {/* Cabecera Inteligente */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                <span>Coach IA • Rotación Biomecánica</span>
              </span>
            </div>
            <h3 className="font-montserrat font-black text-base text-slate-900 dark:text-white mt-1">
              ¿Deseas cambiar de variante?
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Ejercicio activo: <strong className="text-indigo-600 dark:text-indigo-400">{currentName}</strong>. Elige cualquiera de las otras variantes disponibles:
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center active:scale-95 shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Las 2 Opciones Curadas Exactas (Rotando entre las 3 de la Familia) */}
        <div className="space-y-2.5 pt-1">
          {smartOptions.map((opt, index) => (
            <div 
              key={opt.videoId}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                index === 0
                  ? 'bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/30 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-zinc-900 border-indigo-300/80 dark:border-indigo-500/30 shadow-xs'
                  : 'bg-slate-50/80 dark:bg-zinc-900/50 border-slate-200/80 dark:border-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-white/90 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-white/10 shadow-2xs">
                  {opt.badge}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {opt.equipment}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{opt.icon}</span>
                <h4 className="font-montserrat font-black text-sm text-slate-900 dark:text-white">
                  {opt.title}
                </h4>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mb-3">
                {opt.reason}
              </p>

              <button
                type="button"
                onClick={() => onSelectAlternative({
                  title: opt.title,
                  embedUrl: opt.embedUrl,
                  equipment: opt.equipment
                })}
                className={`w-full py-3 rounded-xl font-montserrat font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-sm ${
                  index === 0
                    ? 'bg-gradient-to-r from-indigo-600 to-teal-600 hover:opacity-95 text-white shadow-indigo-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <Zap size={14} className="text-amber-300" />
                <span>Cambiar a {opt.title}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Nota de Coherencia de Carga */}
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-[10px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <span>Tus series, repeticiones y descansos se conservan intactos.</span>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Fila de Set ─────────────────────────────────────────────────────────────

interface SetRowProps {
  exercise: RoutineExercise;
  setIndex: number;
  onComplete: () => void;
  onEvaluateRequest: (reps: string, weight: string) => void;
}

const SetRow: React.FC<SetRowProps> = ({ exercise, setIndex, onComplete, onEvaluateRequest }) => {
  const { updateSetExecution, markSetCompleted, activeSession } = useExecutionStore();
  
  const executionData = activeSession?.exercises?.[exercise.id]?.[setIndex] || {
    repsDone: exercise.reps || '10',
    weightUsed: exercise.weight || '50',
    rirReal: exercise.rir || '2',
    isCompleted: false,
    rpe: 8,
    painLevel: 0
  };

  const isCompleted = executionData.isCompleted;

  const handleToggle = () => {
    if (!isCompleted) {
      onEvaluateRequest(executionData.repsDone, executionData.weightUsed);
    } else {
      markSetCompleted(exercise.id, setIndex, false);
    }
  };

  const getEffortLabel = (rpe?: number) => {
    if (!rpe || rpe === 8) return 'Justo ✨';
    if (rpe <= 7) return 'Cómodo 🟢';
    if (rpe === 9) return 'Pesado 🟠';
    return 'Fallo 🔴';
  };

  return (
    <div className={`grid grid-cols-[28px_1fr_1fr_1fr_36px] gap-2 items-center p-2 rounded-2xl transition-all border ${
      isCompleted 
        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/30 shadow-2xs' 
        : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200/70 dark:border-white/5'
    }`}>
      <div className="text-center font-mono font-bold text-slate-400 text-xs">
        {setIndex + 1}
      </div>
      
      <input 
        type="text" 
        value={executionData.weightUsed}
        onChange={e => updateSetExecution(exercise.id, setIndex, { weightUsed: e.target.value })}
        disabled={isCompleted}
        className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl py-1.5 text-center text-slate-900 dark:text-white text-xs font-bold focus:border-indigo-500 outline-none disabled:opacity-70 shadow-2xs"
        placeholder={exercise.weight || '-'}
      />
      
      <input 
        type="text" 
        value={executionData.repsDone}
        onChange={e => updateSetExecution(exercise.id, setIndex, { repsDone: e.target.value })}
        disabled={isCompleted}
        className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl py-1.5 text-center text-slate-900 dark:text-white text-xs font-bold focus:border-indigo-500 outline-none disabled:opacity-70 shadow-2xs"
        placeholder={exercise.reps || '-'}
      />

      {/* Pill Visual Amigable de Sensación / Esfuerzo */}
      <button 
        type="button"
        onClick={() => onEvaluateRequest(executionData.repsDone, executionData.weightUsed)}
        className={`py-1 px-1.5 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center leading-none ${
          isCompleted 
            ? 'bg-white dark:bg-zinc-800 border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-300' 
            : 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200/70 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 hover:scale-102'
        }`}
        title="Toca para ajustar cómo se sintió la serie"
      >
        <span>{getEffortLabel(executionData.rpe)}</span>
        {(executionData.painLevel || 0) > 0 && (
          <span className="text-[8px] font-black text-rose-500 mt-0.5">⚠️ Molestia</span>
        )}
      </button>

      <button 
        onClick={handleToggle}
        className={`w-8 h-8 flex items-center justify-center rounded-xl mx-auto transition-all active:scale-90 ${
          isCompleted 
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
            : 'bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-300'
        }`}
        title={isCompleted ? "Set completado" : "Completar set y evaluar esfuerzo/dolor"}
      >
        <CheckCircle2 size={16} />
      </button>
    </div>
  );
};

// ─── Modal: Micro-Evaluador con Pedagogía Visual y Palabras Sencillas ────────

interface SetEffortPainModalProps {
  exercise: RoutineExercise;
  setIndex: number;
  reps: string;
  weight: string;
  onSave: (data: { rpe: number; painLevel: number; painJoint?: string }) => void;
  onClose: () => void;
}

const SetEffortPainModal: React.FC<SetEffortPainModalProps> = ({ 
  exercise, setIndex, reps, weight, onSave, onClose 
}) => {
  const { updateSetExecution, markSetCompleted, activeSession } = useExecutionStore();
  const completeSetMutation = useCompleteSetMutation();

  const [selectedRpe, setSelectedRpe] = useState<number>(8);
  const [selectedPain, setSelectedPain] = useState<number>(0);
  const [selectedJoint, setSelectedJoint] = useState<string>('');

  const exerciseName = exercise.exercise?.Nombre_Oficial || exercise.exercise?.name || (exercise as any).name || 'Ejercicio';

  const handleConfirm = () => {
    if (navigator.vibrate) navigator.vibrate([40, 20, 40]);

    updateSetExecution(exercise.id, setIndex, {
      repsDone: reps,
      weightUsed: weight,
      rpe: selectedRpe,
      painLevel: selectedPain,
      painJoint: selectedPain > 0 ? selectedJoint : undefined,
      isCompleted: true
    });
    markSetCompleted(exercise.id, setIndex, true);

    completeSetMutation.mutate({
      exercise_id: exercise.id,
      target_reps: parseInt(exercise.reps) || 10,
      target_weight: parseFloat(exercise.weight) || 0,
      actual_reps: parseInt(reps) || 10,
      actual_weight: parseFloat(weight) || 0,
      rpe: selectedRpe,
      client_created_at: new Date().toISOString(),
      protocol_id: activeSession?.planId || 'prot_default'
    });

    onSave({ rpe: selectedRpe, painLevel: selectedPain, painJoint: selectedJoint });
  };

  return (
    <div className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-lato">
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#0c0f18] rounded-t-3xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xl p-5 space-y-4"
      >
        {/* Cabecera Amigable */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-montserrat font-black text-xs border border-indigo-200/50 dark:border-indigo-500/20">
              #{setIndex + 1}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                {exerciseName}
              </span>
              <h3 className="font-montserrat font-black text-base text-slate-900 dark:text-white leading-tight">
                ¿Cómo sentiste esta serie?
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. Esfuerzo / Peso con Pedagogía Visual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>🔥 ¿Cuánto esfuerzo te costó?</span>
            </label>
            <span className="text-[10px] font-bold text-slate-400">
              {selectedRpe === 8 ? '⭐ Zona recomendada' : ''}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            ¿Cuántas repeticiones más sentís que podrías haber hecho antes de no poder levantar más?
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { 
                val: 7, 
                title: 'Cómodo', 
                desc: 'Podía hacer 3 o más', 
                icon: '🟢',
                border: 'border-emerald-200 dark:border-emerald-500/20',
                activeBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300'
              },
              { 
                val: 8, 
                title: 'En su punto justo', 
                desc: 'Me sobraban 2 reps', 
                icon: '🟡',
                border: 'border-indigo-200 dark:border-indigo-500/20',
                activeBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-300 shadow-xs'
              },
              { 
                val: 9, 
                title: 'Muy pesado', 
                desc: 'Solo podía 1 rep más', 
                icon: '🟠',
                border: 'border-orange-200 dark:border-orange-500/20',
                activeBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-900 dark:text-orange-300'
              },
              { 
                val: 10, 
                title: 'Al fallo total', 
                desc: 'No salía ni media más', 
                icon: '🔴',
                border: 'border-rose-200 dark:border-rose-500/20',
                activeBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300'
              }
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => setSelectedRpe(item.val)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedRpe === item.val
                    ? `${item.activeBg} font-black shadow-xs scale-101`
                    : `bg-slate-50/80 dark:bg-zinc-900/60 ${item.border} text-slate-700 dark:text-zinc-300 hover:bg-slate-100`
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-montserrat font-black text-xs flex items-center gap-1.5">
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </span>
                  {item.val === 8 && (
                    <span className="text-[8px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded-md">
                      Óptimo
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Dolor Articular / Molestia con Pedagogía Visual */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center justify-between">
            <span>🛡️ ¿Sentiste dolor en alguna articulación?</span>
            <span className={`text-[10px] font-bold ${selectedPain === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {selectedPain === 0 ? 'Cero molestias ✨' : 'Molestia registrada ⚠️'}
            </span>
          </label>

          <p className="text-[10px] text-slate-400 leading-snug">
            Nota: No nos referimos al cansancio o ardor muscular, sino a rodillas, hombros o cintura.
          </p>

          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[
              { val: 0, label: 'Sin dolor', icon: '✨', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300' },
              { val: 2, label: 'Leve aviso', icon: '🟡', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300' },
              { val: 5, label: 'Molestia', icon: '🟠', bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-900 dark:text-orange-300' },
              { val: 8, label: 'Dolor agudo', icon: '🔴', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300' },
            ].map(p => (
              <button
                key={p.val}
                type="button"
                onClick={() => setSelectedPain(p.val)}
                className={`py-2 px-1 rounded-2xl border text-center transition-all ${
                  selectedPain === p.val
                    ? `${p.bg} font-black shadow-xs`
                    : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200/80 dark:border-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm">{p.icon}</div>
                <div className="text-[9px] font-bold mt-0.5">{p.label}</div>
              </button>
            ))}
          </div>

          {/* Si hay dolor, selector pedagógico de zona */}
          {selectedPain > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-2 p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-200/80 dark:border-rose-500/20 space-y-1.5"
            >
              <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-300 block">
                ¿En qué zona sentiste la molestia?
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { name: 'Rodillas', icon: '🦵' },
                  { name: 'Hombros', icon: '🦾' },
                  { name: 'Cintura', icon: '🧱' },
                  { name: 'Codos', icon: '⚡' },
                  { name: 'Cadera', icon: '🦴' },
                  { name: 'Muñecas', icon: '🖐️' }
                ].map(joint => (
                  <button
                    key={joint.name}
                    type="button"
                    onClick={() => setSelectedJoint(joint.name)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center gap-1 ${
                      selectedJoint === joint.name
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/20'
                    }`}
                  >
                    <span>{joint.icon}</span>
                    <span>{joint.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* CTA Guardar Serie */}
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <CheckCircle2 size={16} />
          <span>Guardar Serie y Comenzar Descanso ⏱️</span>
        </button>
      </motion.div>
    </div>
  );
};

// ─── Modal: Evaluación Rápida, Amigable & Simple de Fin de Sesión ────────────

interface SessionDailyAssessmentModalProps {
  elapsedTime: string;
  onConfirm: (data: {
    rpe: number;
    pain: number;
    satisfaction: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'TIRED';
    notes: string;
  }) => void;
  onClose: () => void;
}

const SessionDailyAssessmentModal: React.FC<SessionDailyAssessmentModalProps> = ({ 
  elapsedTime, onConfirm, onClose 
}) => {
  const [selectedEnergy, setSelectedEnergy] = useState<'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'TIRED'>('EXCELLENT');
  const [selectedEffort, setSelectedEffort] = useState<number>(8);
  const [selectedJointPain, setSelectedJointPain] = useState<number>(0);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-[190] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-lato">
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-[#0c0f18] rounded-t-3xl sm:rounded-3xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header Amigable */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20">
              ⏱️ Tiempo Total: {elapsedTime}
            </span>
            <h3 className="font-montserrat font-black text-lg text-slate-900 dark:text-white mt-1 leading-tight">
              ¡Entrenamiento Finalizado! 🎉
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 flex items-center justify-center active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. ¿Cómo estuvo tu energía hoy? */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            ¿Cómo estuvo tu energía y motivación?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'EXCELLENT', label: '¡A tope!', emoji: '🤩', sub: 'Gran día' },
              { key: 'GOOD', label: 'Con ganas', emoji: '😊', sub: 'Cumplí bien' },
              { key: 'NEUTRAL', label: 'Cumplí', emoji: '😐', sub: 'Justo' },
              { key: 'TIRED', label: 'Agotado', emoji: '🥱', sub: 'Pesado' },
            ].map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedEnergy(item.key as any)}
                className={`py-3 px-1 rounded-2xl border text-center transition-all ${
                  selectedEnergy === item.key
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black scale-102'
                    : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100'
                }`}
              >
                <div className="text-2xl">{item.emoji}</div>
                <div className="text-[10px] font-bold mt-1">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. ¿Qué tan exigente se sintió? */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              ¿Qué tan exigente sentiste el entreno?
            </label>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black text-xs">
              {selectedEffort}/10 • {selectedEffort >= 9 ? '🔥 Muy Duro' : selectedEffort >= 7 ? '💪 Óptimo' : '🟢 Suave'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 6, label: 'Liviano 🟢', sub: 'Daba para más' },
              { val: 8, label: 'En su punto ⭐', sub: 'Estímulo perfecto' },
              { val: 10, label: 'Extenuante 🔥', sub: 'Al límite absoluto' }
            ].map(ef => (
              <button
                key={ef.val}
                type="button"
                onClick={() => setSelectedEffort(ef.val)}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  selectedEffort === ef.val
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 font-black shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-zinc-400'
                }`}
              >
                <div className="text-xs font-montserrat font-black">{ef.label}</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{ef.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. ¿Cómo quedaron tus articulaciones? */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            ¿Cómo quedaron tus articulaciones?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 0, label: 'Impecables ✨', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300' },
              { val: 3, label: 'Leve Fatiga 🟡', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300' },
              { val: 7, label: 'Con Dolor 🔴', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300' },
            ].map(pj => (
              <button
                key={pj.val}
                type="button"
                onClick={() => setSelectedJointPain(pj.val)}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  selectedJointPain === pj.val
                    ? `${pj.bg} font-black shadow-xs`
                    : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-white/5 text-slate-700 dark:text-zinc-400'
                }`}
              >
                <div className="text-xs font-montserrat font-bold">{pj.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Notas opcionales colapsables */}
        <div className="pt-1">
          {!showNotes ? (
            <button
              type="button"
              onClick={() => setShowNotes(true)}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>+ Agregar un comentario o nota para el coach</span>
            </button>
          ) : (
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej: Aumenté 5kg en sentadilla, sentí gran congestión..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none shadow-2xs"
            />
          )}
        </div>

        {/* CTA Principal de Cierre */}
        <button
          onClick={() => onConfirm({ rpe: selectedEffort, pain: selectedJointPain, satisfaction: selectedEnergy, notes })}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Trophy size={16} />
          <span>Ver Resumen & Reclamar Recompensa (+140 XP)</span>
        </button>
      </motion.div>
    </div>
  );
};

// ─── Overlay de Resumen Amigable, Coherente y Pedagógico (Efecto Celebración) ──

interface GamingCelebrationOverlayProps {
  exercises: RoutineExercise[];
  elapsedTime: string;
  sessionData: {
    rpe: number;
    pain: number;
    satisfaction: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'TIRED';
    notes: string;
  } | null;
  onContinue: () => void;
}

const GamingCelebrationOverlay: React.FC<GamingCelebrationOverlayProps> = ({ 
  exercises, elapsedTime, sessionData, onContinue 
}) => {
  // Desglose amigable de músculos con nombres claros para principiantes
  const muscleBreakdown = useMemo(() => {
    const map: Record<string, { displayName: string; sets: number; xp: number; icon: string }> = {};

    exercises.forEach(ex => {
      const rawMuscle = ex.exercise?.Musculo_Agonista || ex.exercise?.targetMuscle || 'Cuádriceps';
      const sets = parseInt(ex.sets) || 3;
      const { name: displayName, icon } = getFriendlyMuscleInfo(rawMuscle);

      if (!map[displayName]) {
        map[displayName] = { displayName, sets: 0, xp: 0, icon };
      }
      map[displayName].sets += sets;
      map[displayName].xp += sets * 10 + 5;
    });

    return Object.values(map);
  }, [exercises]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[220] bg-slate-900/80 dark:bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-4 text-slate-900 dark:text-white font-lato overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        className="w-full max-w-sm bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200/90 dark:border-white/10 p-5 space-y-4 shadow-2xl my-auto"
      >
        {/* Trofeo Amigable & Badge Superior */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 mx-auto shadow-lg shadow-amber-500/20">
            <div className="w-full h-full rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
            </div>
          </div>

          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-500/20 inline-flex items-center gap-1 shadow-2xs">
              <Sparkles size={10} className="text-amber-500" />
              <span>¡Sesión Completada con Éxito!</span>
            </span>
            <h2 className="text-xl font-black font-montserrat text-slate-900 dark:text-white mt-1">
              ¡Gran Entrenamiento! 🎉
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
              Completaste todos tus ejercicios y sumaste puntos de experiencia.
            </p>
          </div>
        </div>

        {/* 1. Tarjeta de Recompensas: XP & Racha de Días */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-500/20 text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Puntos Ganados
            </span>
            <span className="font-montserrat font-black text-lg text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1 mt-0.5">
              <Zap size={15} className="text-amber-500 fill-amber-500" />
              <span>+140 XP</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/20 text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              Racha de Días
            </span>
            <span className="font-montserrat font-black text-lg text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1 mt-0.5">
              <Flame size={15} className="text-orange-500 fill-orange-500" />
              <span>4 Días 🔥</span>
            </span>
          </div>
        </div>

        {/* Barra de Nivel Explicada Fácil */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-indigo-600 dark:text-indigo-400 font-montserrat font-black">
              Nivel 6 • Guerrero
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              ¡Casi Nivel 7! ⭐
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '50%' }}
              animate={{ width: '85%' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-full"
            />
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 block text-center">
            Estás a solo 1 entrenamiento de subir de nivel
          </span>
        </div>

        {/* 2. Músculos que Entrenaste Hoy (Pedagogía Visual y Nombres Claros) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <Dumbbell size={12} className="text-indigo-500" />
              <span>Músculos que trabajaste hoy</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              ⏱️ {elapsedTime}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {muscleBreakdown.map(item => (
              <div 
                key={item.displayName}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-1.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[11px] font-montserrat font-black text-slate-800 dark:text-slate-200 block truncate">
                      {item.displayName}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">
                      {item.sets} series completas
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-montserrat font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                  +{item.xp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mini Premio Motivacional del Día */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100/50 to-indigo-50 dark:from-amber-950/20 dark:via-zinc-900 dark:to-indigo-950/20 border border-amber-300/60 dark:border-amber-500/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-white dark:bg-amber-400/20 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <Award size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-black uppercase text-amber-700 dark:text-amber-400 block">
              Premio del Día 🏆
            </span>
            <h4 className="text-xs font-montserrat font-black text-slate-900 dark:text-white truncate">
              Medalla de Constancia
            </h4>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 block truncate">
              Completaste el 100% de los ejercicios de hoy
            </span>
          </div>
        </div>

        {/* Botón Principal Amigable */}
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Sparkles size={15} />
          <span>Volver a mi Panel Principal ✨</span>
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── Temporizador Embebido de Descanso ────────────────────────────────────────

const EmbeddedTimer: React.FC<{ seconds: number; onDismiss: () => void }> = ({ seconds, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl p-2.5 border border-indigo-200/70 dark:border-indigo-500/20 flex items-center justify-between relative overflow-hidden shadow-2xs">
      {/* Progress background bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 bg-indigo-500/10 dark:bg-indigo-500/20 transition-all duration-1000 ease-linear pointer-events-none"
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center gap-2.5 relative z-10">
        <div className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs">
          <Timer size={14} />
        </div>
        <div>
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
            Descanso Activo
          </span>
          <span className="font-montserrat font-black text-sm text-slate-900 dark:text-white font-mono">
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 relative z-10">
        <button 
          onClick={() => setIsActive(!isActive)}
          className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 active:scale-95"
        >
          {isActive ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <button 
          onClick={onDismiss}
          className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-400 hover:text-slate-700 text-xs border border-slate-200/80 dark:border-white/10 active:scale-95"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};

// ─── Modal de Técnica & Pantalla Completa ─────────────────────────────────────

const ExerciseVideoModal: React.FC<{ exercise: RoutineExercise; onClose: () => void }> = ({ exercise, onClose }) => {
  const exerciseName = exercise.exercise?.Nombre_Oficial || exercise.exercise?.name || (exercise as any).name || 'Ejercicio';
  const targetMuscle = exercise.exercise?.Musculo_Agonista || exercise.exercise?.targetMuscle || 'Músculo Principal';
  const synergists = exercise.exercise?.Musculos_Sinergistas || 'Core, Estabilizadores';
  const cue = exercise.exercise?.Cue_Verbal_Foco_Externo || 'Controla la fase excéntrica y explota en la fase concéntrica.';
  const equipment = exercise.exercise?.Equipamiento_Requerido || 'Equipamiento Convencional';

  // Resolver con la base de datos de videos de Catilli
  const videoInfo: ExerciseVideoInfo = useMemo(() => {
    return resolveExerciseVideo(exerciseName, exercise.videoUrl || exercise.exercise?.Url_Video_Youtube);
  }, [exerciseName, exercise.videoUrl, exercise.exercise?.Url_Video_Youtube]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 font-lato">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-md bg-white dark:bg-[#0c0f18] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden max-h-[92vh] flex flex-col shadow-2xl"
      >
        {/* Header Modal */}
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Guía de Técnica & Biomecánica
            </span>
            <h3 className="font-montserrat font-black text-base text-slate-900 dark:text-white mt-0.5">
              {exerciseName}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 flex items-center justify-center active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Embed Player en Gran Formato */}
        <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
          <iframe 
            src={`${videoInfo.embedUrl}?rel=0&autoplay=1`} 
            title={videoInfo.title}
            className="w-full h-full border-0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen 
          />
        </div>

        {/* Detalles y Cues */}
        <div className="p-4 overflow-y-auto space-y-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-black uppercase tracking-wider text-[9px] block mb-1">Foco Clave de Técnica</span>
            <p className="leading-relaxed">{cue}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">Músculo Principal</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{targetMuscle}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
              <span className="text-[9px] font-black uppercase text-slate-400 block">Equipamiento</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{equipment}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-white/5">
            <span className="text-[9px] font-black uppercase text-slate-400 block">Músculos Sinergistas</span>
            <p className="font-bold text-slate-700 dark:text-zinc-300 text-xs mt-0.5">{synergists}</p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 mt-2"
          >
            Entendido, volver a la serie
          </button>
        </div>
      </motion.div>
    </div>
  );
};

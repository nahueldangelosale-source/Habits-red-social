import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Dumbbell, Apple, Activity, Target, Zap, Pin, AlertTriangle, Layers, ChevronRight, ChevronLeft, ShieldCheck, Maximize, ChevronDown, ChevronUp, FileText, Settings, Copy, Share2, Save, PenTool, MoreHorizontal, Trash2, Archive, Clock, CalendarDays, CalendarRange, Calendar, ZoomIn, ZoomOut, Settings2, LayoutTemplate, Timer, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTemplateLibraryStore } from '../../stores/useTemplateLibraryStore';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableExerciseCard } from './SortableExerciseCard';
import { SortableBlock } from './SortableBlock';
import { DraggablePaletteItem } from './DraggablePaletteItem';
import { DraggableBlockPaletteItem } from './DraggableBlockPaletteItem';
import { SMART_BLOCKS } from '../../data/templates.constants';
import { DroppableDayColumn } from './DroppableDayColumn';
import { InteractiveHeatmap } from './InteractiveHeatmap';
import { MacroDayCard } from './MacroDayCard';
import { SortablePhaseCard } from './SortablePhaseCard';
import { useGridKeyboardNav } from '../../hooks/useGridKeyboardNav';

import { EXERCISES_DATABASE, type ExerciseTaxonomy } from '../../data/exercisesData';
import { SmartVaultPanel } from './SmartVaultPanel';
import { BodyPartVolumeTracker } from './BodyPartVolumeTracker';
import { usePlanBuilderStore, type RoutineItem, type RoutineBlock, type RoutineExercise } from '../../stores/usePlanBuilderStore';
import { SmartExerciseLibrary } from './SmartExerciseLibrary';
import { SignatureModal } from './SignatureModal';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useWorkloadCalculator } from '../../hooks/useWorkloadCalculator';
import { calculateEWMA, projectSessionImpact, type DailyLoad } from '../../utils/acwrEngine';
import { useAutoTemplateEngine } from '../../hooks/useAutoTemplateEngine';
import { createMesocycleFromWeek1 } from '../../utils/progressionAdapter';
import { emitACWRProjectionViewed, emitCoachVolumeAdjusted } from '../../utils/telemetry';
import toast from 'react-hot-toast';
import { getPeriodConfig } from '../../data/modalityColors';
import { PeriodSelectorModal } from './PeriodSelectorModal';
import { ProgressionSettingsModal } from './ProgressionSettingsModal';
import { CalendarPlus, Eye, CloudDownload, GraduationCap, Info, Check } from 'lucide-react';
import { getBuilderLabels } from '../../utils/builderDictionary';



export const CORE_10_EXERCISES: ExerciseTaxonomy[] = EXERCISES_DATABASE.filter(ex => [
  'SQUAT_001', // Sentadilla
  'BENCH_001', // Press Banca
  'DEADLIFT_001', // Peso Muerto
  'PULL_001', // Dominadas
  'PULL_002', // Jalón
  'PRESS_001', // Press Militar
  'ROW_001', // Remo
  'LUNGE_001', // Zancadas
  'CURL_001', // Curl Bíceps
  'DIP_001' // Fondos
].includes(ex.ID_Ejercicio));

// Fallback just in case exact IDs don't match, we take first 10
const FINAL_CORE_10 = CORE_10_EXERCISES.length > 0 ? CORE_10_EXERCISES : EXERCISES_DATABASE.slice(0, 10);

import { generateSmartRoutine } from '../../utils/routineGeneratorEngine';
import { Sparkles } from 'lucide-react';
import { CircuitCreatorModal } from '../builders/CircuitCreatorModal';
import type { CircuitBlockType, CircuitGeneratedBlock } from '../../types/circuit.types';

export interface QuickWorkoutCycle {
  id: string;
  title: string;
  duration: string;
  subtitle: string;
  badge: string;
  icon: string;
  border: string;
  preferredSplit?: 'CLASSIC_WEIDER' | 'FULL_BODY' | 'UPPER_LOWER' | 'PPL';
  daysCount?: 3 | 4 | 5 | 6;
  phases: { id: string; weeks: number }[];
}

export interface SplitDefinition {
  id: string;
  days: 3 | 4 | 5 | 6;
  splitPreference: 'CLASSIC_WEIDER' | 'FULL_BODY' | 'UPPER_LOWER' | 'PPL';
  label: string;
  buttonLabel: string;
  badge: string;
  badgeColor: string;
  shortDesc: string;
  explanation: string;
  daysSchedule: { day: string; title: string; muscles: string; color: string }[];
}

export const PEDAGOGICAL_SPLITS: SplitDefinition[] = [
  {
    id: '3_WEIDER',
    days: 3,
    splitPreference: 'CLASSIC_WEIDER',
    label: '3 Días: Clásica de Gimnasio',
    buttonLabel: 'Clásica (3d)',
    badge: 'La más Popular 🏆',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    shortDesc: 'Pecho/Tríceps • Espalda/Bíceps • Pierna/Hombro',
    explanation: 'La división tradicional más famosa de los gimnasios. Agrupa músculos agonistas y sinergistas (que trabajan juntos) en la misma sesión para conseguir una congestión óptima y darles una semana entera de recuperación profunda.',
    daysSchedule: [
      { day: 'Día 1', title: 'Pecho + Tríceps', muscles: 'Empuje Horizontal, Pectoral & Tríceps', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { day: 'Día 2', title: 'Espalda + Bíceps', muscles: 'Tirón Vertical/Horizontal, Dorsal & Bíceps', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { day: 'Día 3', title: 'Piernas + Hombros', muscles: 'Sentadilla, Cadena Posterior, Hombros & Gemelos', color: 'bg-orange-50 text-orange-700 border-orange-200' }
    ]
  },
  {
    id: '3_FULLBODY',
    days: 3,
    splitPreference: 'FULL_BODY',
    label: '3 Días: Todo el Cuerpo (Full Body)',
    buttonLabel: 'Full Body (3d)',
    badge: 'Máxima Eficiencia ⚡',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    shortDesc: 'Full Body A • Full Body B • Full Body C',
    explanation: 'Estimula todos los grandes grupos musculares en cada sesión, dejando siempre 48 horas de descanso entre entrenamientos (ej: Lunes, Miércoles y Viernes). Ideal si disponés de días acotados pero querés máxima frecuencia.',
    daysSchedule: [
      { day: 'Día 1', title: 'Full Body A', muscles: 'Foco en Sentadilla & Empuje Plano', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      { day: 'Día 2', title: 'Full Body B', muscles: 'Foco en Bisagra de Cadera & Tirón', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      { day: 'Día 3', title: 'Full Body C', muscles: 'Foco en Empuje Inclinado & Piernas', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
    ]
  },
  {
    id: '4_UPPERLOWER',
    days: 4,
    splitPreference: 'UPPER_LOWER',
    label: '4 Días: Torso / Pierna',
    buttonLabel: 'Torso / Pierna (4d)',
    badge: 'Balance Perfecto ⭐',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    shortDesc: 'Torso A • Pierna A • Torso B • Pierna B',
    explanation: 'Divide el cuerpo en Tren Superior (pecho, espalda, hombros, brazos) y Tren Inferior (cuádriceps, glúteos, isquiosurales, gemelos). Permite entrenar cada músculo 2 veces por semana con excelente recuperación articular.',
    daysSchedule: [
      { day: 'Día 1', title: 'Torso A', muscles: 'Pecho Plano, Espalda & Brazos', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { day: 'Día 2', title: 'Pierna A', muscles: 'Sentadilla Pesada, Prensa & Gemelos', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      { day: 'Día 3', title: 'Torso B', muscles: 'Press Inclinado, Remo & Hombros', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { day: 'Día 4', title: 'Pierna B', muscles: 'Bisagra Cadera, Glúteos & Aductores', color: 'bg-purple-50 text-purple-700 border-purple-200' }
    ]
  },
  {
    id: '5_PPL_UL',
    days: 5,
    splitPreference: 'PPL',
    label: '5 Días: Empuje / Tirón / Pierna + Híbrido',
    buttonLabel: 'Híbrido (5d)',
    badge: 'Volumen Avanzado 🚀',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    shortDesc: 'Torso/Pierna Fuerza + Empuje/Tirón/Pierna Hipertrofia',
    explanation: 'Combina 2 días de fuerza pesada para el cuerpo entero con 3 días específicos de hipertrofia y detalle muscular. Recomendado para practicantes con experiencia que buscan mayor volumen semanal.',
    daysSchedule: [
      { day: 'Día 1', title: 'Upper Power', muscles: 'Fuerza en Torso (Banca & Remo)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { day: 'Día 2', title: 'Lower Power', muscles: 'Fuerza en Pierna (Sentadilla & RDL)', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      { day: 'Día 3', title: 'Push (Empuje)', muscles: 'Pectoral, Deltoides Anterior & Tríceps', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      { day: 'Día 4', title: 'Pull (Tirón)', muscles: 'Dorsal, Deltoides Posterior & Bíceps', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { day: 'Día 5', title: 'Legs (Pierna)', muscles: 'Cuádriceps, Isquios, Glúteo & Gemelos', color: 'bg-rose-50 text-rose-700 border-rose-200' }
    ]
  },
  {
    id: '6_PPL',
    days: 6,
    splitPreference: 'PPL',
    label: '6 Días: Atleta Élite (PPL x 2)',
    buttonLabel: 'PPL x 2 (6d)',
    badge: 'Doble Frecuencia 🔥',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    shortDesc: 'Push • Pull • Legs repetido 2 veces por semana',
    explanation: 'La división de mayor volumen y frecuencia semanal. Estimula cada grupo muscular 2 veces por semana dividiendo exactamente los patrones motores. Requiere un estricto control del sueño y la nutrición.',
    daysSchedule: [
      { day: 'Días 1 & 4', title: 'Push (Empuje A & B)', muscles: 'Pecho, Hombros & Tríceps', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      { day: 'Días 2 & 5', title: 'Pull (Tirón A & B)', muscles: 'Espalda completa & Bíceps', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { day: 'Días 3 & 6', title: 'Legs (Pierna A & B)', muscles: 'Tren inferior completo & Gemelos', color: 'bg-orange-50 text-orange-700 border-orange-200' }
    ]
  }
];

export const QUICK_WORKOUT_CYCLES: QuickWorkoutCycle[] = [
  {
    id: 'weider_classic_8w',
    title: 'División Clásica de Gimnasio',
    duration: '8 Semanas',
    subtitle: 'Pecho + Tríceps ➔ Espalda + Bíceps ➔ Pierna + Hombro (+ Core & RAMP)',
    badge: 'Más Popular 🏆',
    icon: '🏆',
    border: 'border-amber-200 hover:border-amber-400',
    preferredSplit: 'CLASSIC_WEIDER',
    daysCount: 3,
    phases: [
      { id: 'ADAPTACION', weeks: 2 },
      { id: 'HIPERTROFIA', weeks: 4 },
      { id: 'TRANSICION', weeks: 2 }
    ]
  },
  {
    id: 'full_12w',
    title: 'Macrociclo Completo',
    duration: '12 Semanas',
    subtitle: 'Adaptación (3s) ➔ Hipertrofia (5s) ➔ Fuerza (3s) ➔ Descarga (1s)',
    badge: 'Periodización Integral 🚀',
    icon: '🚀',
    border: 'border-indigo-200 hover:border-indigo-400',
    phases: [
      { id: 'ADAPTACION', weeks: 3 },
      { id: 'HIPERTROFIA', weeks: 5 },
      { id: 'FUERZA', weeks: 3 },
      { id: 'TRANSICION', weeks: 1 }
    ]
  },
  {
    id: 'hypertrophy_8w',
    title: 'Ciclo Hipertrofia & Fuerza',
    duration: '8 Semanas',
    subtitle: 'Hipertrofia y Volumen (4s) ➔ Intensidad & Fuerza (3s) ➔ Descarga (1s)',
    badge: 'Masa & Potencia 💪',
    icon: '💪',
    border: 'border-emerald-200 hover:border-emerald-400',
    phases: [
      { id: 'HIPERTROFIA', weeks: 4 },
      { id: 'FUERZA', weeks: 3 },
      { id: 'TRANSICION', weeks: 1 }
    ]
  },
  {
    id: 'recomp_6w',
    title: 'Ciclo Recomposición Corporal',
    duration: '6 Semanas',
    subtitle: 'Adaptación Anatómica (2s) ➔ Recomposición (3s) ➔ Descarga (1s)',
    badge: 'Fuerza & Definición 🔥',
    icon: '🔥',
    border: 'border-amber-200 hover:border-amber-400',
    phases: [
      { id: 'ADAPTACION', weeks: 2 },
      { id: 'RECOMPOSICION', weeks: 3 },
      { id: 'TRANSICION', weeks: 1 }
    ]
  },
  {
    id: 'single_4w',
    title: 'Mesociclo de Hipertrofia',
    duration: '4 Semanas',
    subtitle: 'Sobrecarga progresiva acumulativa en rango 8-12 reps',
    badge: 'Enfoque Rápido ⚡',
    icon: '⚡',
    border: 'border-purple-200 hover:border-purple-400',
    phases: [
      { id: 'HIPERTROFIA', weeks: 4 }
    ]
  },
  {
    id: 'strength_4w',
    title: 'Mesociclo de Fuerza Pura',
    duration: '4 Semanas',
    subtitle: 'Prilepin (4-6 reps) ➔ Rate Coding (RPE 8-9) ➔ Tapering (1s)',
    badge: 'SNC & 1RM ⚡',
    icon: '🏋️‍♂️',
    border: 'border-blue-200 hover:border-blue-400',
    phases: [
      { id: 'FUERZA', weeks: 4 }
    ]
  }
];

interface PanoramicBuilderProps {
  onOpenForm?: () => void;
  isReadOnly?: boolean;
  headerContent?: React.ReactNode;
}

export const PanoramicBuilder: React.FC<PanoramicBuilderProps> = ({ onOpenForm, isReadOnly = false, headerContent }) => {
  const {
    discipline, isSimpleMode, entityType,
    days, addWorkoutDay, addRoutineItem, updateRoutineItem, removeRoutineItem,
    reorderRoutine, revertClinicalSwap, activeDayId, setActiveDayId, batchInsertDays,
    isRoutineLocked, unlockRoutine,
    isOverloadAssistantActive, setOverloadAssistantActive, duplicateMicrocycle,
    removeSegmentDays, duplicateSegmentDays,
    phases, addPhase, addPhaseWithWeeks, updatePhase, removePhase, renamePhase, updatePhaseModality,
    exerciseDensity, setExerciseDensity, applyPresetToClonedWeeks, reorderPhases,
    populateFullRoutine, setCycleName
  } = usePlanBuilderStore();
  const createTemplate = useTemplateLibraryStore(state => state.createTemplate);
  const folders = useTemplateLibraryStore(state => state.folders);

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const labels = getBuilderLabels(discipline);

  const flattenedRoutine = days.flatMap(d => d.items);
  const onboardingData = useOnboardingPTStore();
  const { injuries, identity, biometrics, training, goalTags, healthData } = onboardingData;
  const isFemale = identity?.gender?.toUpperCase() === 'FEMALE' || identity?.gender?.toUpperCase() === 'MUJER' || identity?.gender?.toUpperCase() === 'F';
  const workloadMetrics = useWorkloadCalculator(flattenedRoutine);

  // Dynamic Empty State Logic
  const expLevel = training?.experience_level || 'BEGINNER';
  const hasWeightLossGoal = goalTags?.includes('perder peso') || goalTags?.includes('recomposicion');
  
  let suggestion1 = { title: 'Adaptación Anatómica', desc: 'Añade 4 semanas para preparar articulaciones y sentar bases de movimiento.' };
  let suggestion2 = { title: 'Fuerza / Hipertrofia', desc: 'Añade 4 a 8 semanas enfocadas en progreso de cargas y ganancia muscular.' };
  let suggestion3 = { title: 'Descarga (Deload)', desc: 'Añade 1 semana de recuperación activa reduciendo el volumen drásticamente.' };

  if (expLevel !== 'BEGINNER') {
    if (hasWeightLossGoal) {
      suggestion1 = { title: 'Hipertrofia Metabólica', desc: 'Añade 4 semanas de estrés metabólico para potenciar el déficit.' };
      suggestion2 = { title: 'Retención de Masa', desc: 'Añade 3 semanas pesadas (Fuerza) para mantener músculo.' };
      suggestion3 = { title: 'Descarga Activa', desc: 'Añade 1 semana de recuperación activa priorizando NEAT.' };
    } else {
      suggestion1 = { title: 'Acumulación', desc: 'Añade 4 semanas enfocadas en acumular volumen de entrenamiento (Hipertrofia).' };
      suggestion2 = { title: 'Intensificación', desc: 'Añade 3 semanas de intensificación pesada (Peaking de Fuerza).' };
      suggestion3 = { title: 'Tapering', desc: 'Añade 1 semana de reducción de fatiga para manifestar adaptaciones.' };
    }
  }

  const expLevelMap: Record<string, string> = {
    'BEGINNER': 'Principiante',
    'INTERMEDIATE': 'Intermedio',
    'ADVANCED': 'Avanzado'
  };
  const translatedLevel = expLevelMap[expLevel] || 'Principiante';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'UPPER' | 'LOWER' | 'CORE'>('ALL');
  const [activeTabLeft, setActiveTabLeft] = useState<'vault' | 'search' | 'shelf' | 'blocks'>('search');
  
  const [activeDragItem, setActiveDragItem] = useState<RoutineItem | null>(null);
  const [activePaletteDrag, setActivePaletteDrag] = useState<ExerciseTaxonomy | null>(null);
  const [activePhaseDrag, setActivePhaseDrag] = useState<any | null>(null);
  const [activePaintBlock, setActivePaintBlock] = useState<RoutineBlock | null>(null);
  
  const [viewMode, setViewMode] = useState<'micro' | 'medio' | 'macro' | 'semestral' | 'anual'>('micro');
  
  const [activePhaseId, setActivePhaseId] = useState<string | null>(phases?.[0]?.id || null);
  const [activeMainTab, setActiveMainTab] = useState<'mapa' | 'dias'>(
    isSimpleMode || entityType === 'TEMPLATE' || days.some(d => d.items && d.items.length > 0) ? 'dias' : 'mapa'
  );
  
  // Circuit Creator Modal State
  const [isCircuitModalOpen, setIsCircuitModalOpen] = useState(false);
  const [circuitModalInitialType, setCircuitModalInitialType] = useState<CircuitBlockType>('TABATA');

  const handleApplyGeneratedCircuit = (genBlock: CircuitGeneratedBlock, mode: 'BRUSH' | 'INJECT') => {
    const routineBlock = {
      id: genBlock.id,
      type: 'BLOCK' as const,
      name: genBlock.name,
      description: genBlock.description,
      blockType: genBlock.blockType,
      workTime: genBlock.workTimeSec || 40,
      restTime: genBlock.restTimeSec || 20,
      rounds: genBlock.rounds || 4,
      intervalTime: genBlock.intervalTimeSec,
      isCollapsed: false,
      items: genBlock.exercises.map(item => ({
        id: item.id,
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: item.exercise.id,
          Nombre_Oficial: item.exercise.name,
          Alias_Buscador: '',
          Patron_Movimiento: item.exercise.category,
          Lateralidad: 'Bilateral',
          Carga_Axial: item.exercise.spinalCompressionScore > 5 ? 'SÍ' : 'NO',
          Musculo_Agonista: item.exercise.targetMuscle,
          Musculos_Sinergistas: '',
          Equipamiento_Requerido: item.exercise.equipment.join(', '),
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: String(genBlock.rounds || 4),
        reps: item.reps || (item.workTimeSec ? `${item.workTimeSec}s` : '10-12'),
        weight: 'Auto',
        rpe: '8',
        videoUrl: '',
        progression: ''
      }))
    };

    if (mode === 'BRUSH') {
      setActivePaintBlock(routineBlock as any);
      toast.success(`Pincel activado con "${genBlock.name}". Haz clic en cualquier día para aplicarlo.`);
    } else {
      if (days.length > 0) {
        addExerciseToDay(days[0].id, routineBlock as any);
        toast.success(`Circuito "${genBlock.name}" inyectado en ${days[0].title}.`);
      }
    }
  };
  
  useEffect(() => {
    if (isSimpleMode) {
      setActiveMainTab('dias');
    }
  }, [isSimpleMode]);

  useEffect(() => {
    if (isSimpleMode && phases.length === 0) {
      addPhase('Módulo 1', discipline);
    }
  }, [isSimpleMode, phases.length, addPhase, discipline]);

  // Sync activePhaseId if phases change and it's null
  useEffect(() => {
    if (phases?.length > 0) {
      if (!activePhaseId || !phases.some(p => p.id === activePhaseId)) {
        setActivePhaseId(phases[0].id);
      }
    }
  }, [phases, activePhaseId]);

  const visibleDays = useMemo(() => {
    if (activePhaseId) {
      const filtered = days.filter(d => d.phaseId === activePhaseId);
      if (filtered.length > 0) return filtered;
    }
    return days;
  }, [activePhaseId, days]);
  
  const getNextDayName = () => {
    const d = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return `${labels.day} ${visibleDays.length + 1} - ${d[visibleDays.length % 7]}`;
  };

  const [isMobileVaultOpen, setIsMobileVaultOpen] = useState(false);
  const [isCockpitExpanded, setIsCockpitExpanded] = useState(true);
  const [isTelemetryExpanded, setIsTelemetryExpanded] = useState(false);
  
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editingPhaseName, setEditingPhaseName] = useState('');
  const [isLeftPanelExpanded, setIsLeftPanelExpanded] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openSegmentMenuId, setOpenSegmentMenuId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<'LINEAR' | 'UNDULATING' | 'DUP' | 'BLOCK' | null>('LINEAR');
  const [showGuide, setShowGuide] = useState(false);
  const [isPeriodSelectorOpen, setIsPeriodSelectorOpen] = useState(false);
  const [isProgressionModalOpen, setIsProgressionModalOpen] = useState(false);
  const defaultSplitIdFromOnboarding = useMemo(() => {
    const days = training?.days_per_week;
    if (days === 4) return '4_UPPERLOWER';
    if (days === 5) return '5_PPL_UL';
    if (days === 6) return '6_PPL';
    if (days === 3) return '3_WEIDER';
    if (days && days <= 2) return '3_FULLBODY';
    return '3_WEIDER';
  }, [training?.days_per_week]);

  const [selectedSplitId, setSelectedSplitId] = useState<string>(() => defaultSplitIdFromOnboarding);

  // Sincronizar automáticamente con el onboarding del atleta si se informa su disponibilidad
  useEffect(() => {
    if (training?.days_per_week && phases.length === 0) {
      const days = training.days_per_week;
      let targetId = '3_WEIDER';
      if (days === 4) targetId = '4_UPPERLOWER';
      else if (days === 5) targetId = '5_PPL_UL';
      else if (days === 6) targetId = '6_PPL';
      else if (days <= 2) targetId = '3_FULLBODY';
      setSelectedSplitId(targetId);
    }
  }, [training?.days_per_week, phases.length]);

  const selectedSplitDef = useMemo(() => {
    return PEDAGOGICAL_SPLITS.find(s => s.id === selectedSplitId) || PEDAGOGICAL_SPLITS[0];
  }, [selectedSplitId]);

  const selectedDaysFrequency = selectedSplitDef.days;
  const setSelectedDaysFrequency = (d: 3 | 4 | 5 | 6) => {
    const match = PEDAGOGICAL_SPLITS.find(s => s.days === d);
    if (match) setSelectedSplitId(match.id);
  };

  const handleApplyQuickWorkoutCycle = (preset: typeof QUICK_WORKOUT_CYCLES[0]) => {
    let firstPhaseId: string | null = null;
    const allGeneratedDays: WorkoutDay[] = [];

    const targetDays = preset.daysCount || selectedDaysFrequency;
    const targetSplit = preset.preferredSplit || selectedSplitDef.splitPreference;

    if (preset.preferredSplit === 'CLASSIC_WEIDER') {
      setSelectedSplitId('3_WEIDER');
    }

    preset.phases.forEach((p, idx) => {
      const config = getPeriodConfig(p.id);
      const newPhaseId = addPhaseWithWeeks(config.label, p.weeks, p.id);
      if (idx === 0) firstPhaseId = newPhaseId;

      // Generar días específicos para ESTA fase con IDs reales y prescripción de repeticiones/RIR
      const phaseDays = generateSmartRoutine({
        goal: goalTags?.[0] || 'HIPERTROFIA',
        daysCount: targetDays,
        splitPreference: targetSplit,
        injuries: injuries as string[],
        phaseModality: p.id,
        phaseId: newPhaseId,
        phaseName: config.label,
        isFemaleAthlete: isFemale
      });

      allGeneratedDays.push(...phaseDays);
    });

    if (firstPhaseId) {
      setActivePhaseId(firstPhaseId);
    }

    populateFullRoutine(allGeneratedDays);
    setCycleName(preset.title);
    toast.success(`¡${preset.title} (${targetDays} días/sem) activado con éxito!`, { icon: '🏋️‍♂️' });
  };

  const handleQuickAddWorkoutPhase = (periodId: string, weeks: number = 4) => {
    const config = getPeriodConfig(periodId);
    const newPhaseId = addPhaseWithWeeks(config.label, weeks, periodId);
    setActivePhaseId(newPhaseId);

    const phaseDays = generateSmartRoutine({
      goal: goalTags?.[0] || 'HIPERTROFIA',
      daysCount: selectedDaysFrequency,
      splitPreference: selectedSplitDef.splitPreference,
      injuries: injuries as string[],
      phaseModality: periodId,
      phaseId: newPhaseId,
      phaseName: config.label,
      isFemaleAthlete: isFemale
    });

    populateFullRoutine([...days, ...phaseDays]);
    toast.success(`Añadido: ${config.label} (${weeks} sem) con ${selectedDaysFrequency} días`, { icon: '➕' });
  };

  // Close menus when clicking outside (handled via simple overlay or on scroll)
  useEffect(() => {
    const closeMenu = () => setOpenSegmentMenuId(null);
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { generateTemplate, isGenerating, generationStepText, swapsOccurred, dosageWarnings } = useAutoTemplateEngine();
  const hasGeneratedRef = React.useRef(false);

  // Web Worker para operaciones batch (off-thread)
  const workerRef = React.useRef<Worker | null>(null);
  React.useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../workers/planBuilderWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current.onmessage = (e) => {
      const { type, action, payload } = e.data;
      if (type === 'SUCCESS') {
        if (action === 'BATCH_CREATE_DAYS' || action === 'DUPLICATE_WEEK') {
          batchInsertDays(payload.newDays);
        } else if (action === 'PAINT_BLOCK') {
          usePlanBuilderStore.getState().batchStackBlocks(payload.updates);
        }
      }
    };
    return () => workerRef.current?.terminate();
  }, [batchInsertDays]);

  // Mock de Historial (Normalmente vendría del backend / Base de Datos)
  const mockHistoricalLoads: DailyLoad[] = React.useMemo(() => {
    const loads: DailyLoad[] = [];
    const today = new Date();
    for (let i = 28; i > 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      loads.push({
        date: d.toISOString().split('T')[0],
        // Simular un volumen de mantenimiento constante con algo de ruido
        volumeLoad: (Math.random() * 2000) + 6000 
      });
    }
    return loads;
  }, []);

  const currentAcwrHistory = React.useMemo(() => calculateEWMA(mockHistoricalLoads), [mockHistoricalLoads]);
  const baselineACWR = currentAcwrHistory[currentAcwrHistory.length - 1];
  const projectedACWR = React.useMemo(() => {
    return projectSessionImpact(baselineACWR.chronicEWMA, baselineACWR.acuteEWMA, workloadMetrics.totalVolumeLoad / (days.length || 1));
  }, [baselineACWR, workloadMetrics, days.length]);

  // Telemetry references for Outcomes (Exposición -> Acción)
  const telemetryTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasFiredExposition = React.useRef<boolean>(false);
  const lastExpositionTime = React.useRef<number | null>(null);
  const awaitingAction = React.useRef<boolean>(false);

  useEffect(() => {
    const athleteId = onboardingData.createdAthleteId || onboardingData.identity.email || 'draft_athlete';
    const currentACWR = projectedACWR.acwr;

    if (currentACWR >= 1.5) {
      if (!telemetryTimerRef.current && !hasFiredExposition.current) {
        telemetryTimerRef.current = setTimeout(() => {
          emitACWRProjectionViewed(athleteId, currentACWR);
          hasFiredExposition.current = true;
          lastExpositionTime.current = Date.now();
          awaitingAction.current = true;
          toast.error("Alerta de Sobrecarga: ACWR Proyectado ≥ 1.5. Considera ajustar el volumen.", {
            id: 'acwr-overload-alert',
            icon: '⚠️',
            style: { background: '#1c1917', color: '#f43f5e', border: '1px solid #f43f5e' }
          });
        }, 1500); // 1.5 segundos visible
      }
    } else {
      if (telemetryTimerRef.current) {
        clearTimeout(telemetryTimerRef.current);
        telemetryTimerRef.current = null;
      }
      
      // Si baja al Sweet Spot (0.8 - 1.3) y estábamos esperando la acción tras la exposición
      if (awaitingAction.current && currentACWR >= 0.8 && currentACWR <= 1.3) {
        if (lastExpositionTime.current) {
          const secondsToAdjust = Math.floor((Date.now() - lastExpositionTime.current) / 1000);
          if (secondsToAdjust <= 180) {
            emitCoachVolumeAdjusted(athleteId, secondsToAdjust, currentACWR);
            toast.success("Volumen optimizado. Retorno al Sweet Spot del atleta.", {
              icon: '🛡️',
              style: { background: '#1c1917', color: '#10b981', border: '1px solid #10b981' }
            });
          }
        }
        awaitingAction.current = false;
        hasFiredExposition.current = false;
      }
    }

    return () => {
      if (telemetryTimerRef.current) {
        clearTimeout(telemetryTimerRef.current);
        telemetryTimerRef.current = null;
      }
    };
  }, [projectedACWR.acwr, onboardingData.createdAthleteId, onboardingData.identity.email]);

  useEffect(() => {
    if (days.length === 0 && !hasGeneratedRef.current && onboardingData) {
      hasGeneratedRef.current = true;
      generateTemplate();
    }
  }, [days.length, generateTemplate, onboardingData]);

  // Atajos de teclado: Tecla ESC y Ctrl+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePaintBlock(null);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        onOpenForm?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenForm]);

  // Stateful Stamp Tracker
  const stampRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!activePaintBlock) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (stampRef.current) {
        stampRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [activePaintBlock]);

  // Escape Trinity 3: Clic fuera (Contextual)
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (activePaintBlock && e.target === e.currentTarget) {
      setActivePaintBlock(null);
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXl = windowWidth >= 1280;

  useEffect(() => {
    if (visibleDays.length > 0 && (!activeDayId || !visibleDays.some(d => d.id === activeDayId))) {
      setActiveDayId(visibleDays[0].id);
    }
  }, [visibleDays, activeDayId, setActiveDayId]);

  const searchResults = useMemo(() => {
    let results = EXERCISES_DATABASE;
    if (categoryFilter !== 'ALL') {
      results = results.filter(ex => {
        if (categoryFilter === 'UPPER') {
          return ['Pectoral', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Antebrazos'].some(m => ex.Musculo_Agonista?.includes(m));
        }
        if (categoryFilter === 'LOWER') {
          return ['Cuádriceps', 'Isquiosurales', 'Glúteos', 'Pantorrillas'].some(m => ex.Musculo_Agonista?.includes(m));
        }
        if (categoryFilter === 'CORE') {
          return ['Abdominales', 'Oblicuos', 'Lumbares'].some(m => ex.Musculo_Agonista?.includes(m));
        }
        return true;
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(ex => 
        (ex.Nombre_Oficial || '').toLowerCase().includes(query) || 
        (ex.Alias_Buscador || '').toLowerCase().includes(query) ||
        (ex.Musculo_Agonista || '').toLowerCase().includes(query)
      );
    }
    return results.slice(0, 15);
  }, [searchQuery, categoryFilter]);

  const handleQuickInject = (exercise: ExerciseTaxonomy, targetId?: string) => {
    // Clinical Guardrail Check
    if (injuries && injuries.length > 0) {
      const exStr = `${exercise.Nombre_Oficial} ${exercise.Musculo_Agonista} ${exercise.Categoria || ''}`.toLowerCase();
      const isLowerBody = !!exStr.match(/cuádriceps|isquio|glúteo|gemelo|sóleo|pierna|sentadilla|prensa/i);
      const isUpperBody = !!exStr.match(/pectoral|dorsal|deltoides|bíceps|tríceps|trapecio|press|dominada|remo|brazo/i);
      
      const conflict = injuries.find((inj: any) => {
        const zoneStr = (inj.zone || '').toLowerCase();
        const jointStr = (inj.joint || '').toLowerCase();
        if (zoneStr.includes('inferior') && isLowerBody) return true;
        if (zoneStr.includes('superior') && isUpperBody) return true;
        if (jointStr && exStr.includes(jointStr)) return true;
        if (zoneStr.includes('lumbar') && exStr.match(/sentadilla|peso muerto/i)) return true;
        return false;
      });

      if (conflict) {
        toast(`Advertencia Clínica: "${exercise.Nombre_Oficial}" puede afectar la lesión de ${conflict.zone} (${conflict.joint || 'General'}).`, { 
          duration: 6000, 
          icon: '⚠️',
          position: 'bottom-right',
          style: {
            background: '#fef08a',
            color: '#854d0e',
            border: '2px solid #fde047',
            fontWeight: 'bold',
            padding: '16px',
            maxWidth: '450px'
          }
        });
      }
    }

    let targetDayId = targetId || activeDayId;
    if (!targetDayId) {
      if (days.length === 0) {
        addWorkoutDay('Día 1');
        alert("Día 1 creado, selecciona el día para inyectar.");
        return;
      }
      targetDayId = days[0].id;
    }
    
    addRoutineItem(targetDayId, {
      id: Math.random().toString(36).substr(2, 9),
      exercise,
      sets: '',
      reps: '',
      weight: '',
      rpe: '',
      videoUrl: exercise.Url_Video_Youtube || '',
      progression: ''
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    
    if (active.data.current?.type === 'phase') {
      setActivePhaseDrag(active.data.current.phase);
      return;
    }

    if (active.data.current?.type === 'palette-item') {
      setActivePaletteDrag(active.data.current.exercise);
      return;
    }

    const item = flattenedRoutine.find(r => r.id === active.id);
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.data.current?.type === 'phase') {
      setActivePhaseDrag(null);
      if (over && active.id !== over.id) {
        reorderPhases(active.id as string, over.id as string);
      }
      return;
    }

    if (activePaletteDrag) {
      if (over) {
        const overContainerId = days.find(d => d.items.some(i => i.id === over.id))?.id || over.id as string;
        if (overContainerId) {
          handleQuickInject(activePaletteDrag, overContainerId);
        }
      }
      setActivePaletteDrag(null);
      return;
    }

    setActiveDragItem(null);
    if (!over) return;

    const activeContainerId = days.find(d => d.items.some(i => i.id === active.id))?.id;
    const overContainerId = days.find(d => d.items.some(i => i.id === over.id))?.id || over.id as string;
    
    if (activeContainerId && overContainerId && active.id !== over.id) {
      reorderRoutine(overContainerId, active.id as string, over.id as string);
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
  };

  const GoalTranslations: Record<string, string> = {
    HIPERTROFIA: 'Hipertrofia',
    STRENGTH: 'Fuerza Máxima',
    FAT_LOSS: 'Pérdida de Grasa',
    ENDURANCE: 'Resistencia',
    REHAB_LONGEVITY: 'Salud y Prevención',
    HIGH_PERFORMANCE: 'Fuerza y Músculo',
    BODY_RECOMP: 'Pérdida de Grasa',
    VITALITY_MAINTENANCE: 'Vitalidad',
    SPORT_AGILITY: 'Potencia y Agilidad'
  };

  const handlePeriodizeMonth = () => {
    if (days.length < 7) {
      alert("Necesitas al menos 1 semana completa (7 días) para periodizar.");
      return;
    }
    const week1 = days.slice(0, 7);
    const maxRPE = onboardingData.training.level === 'AVANZADO' ? 10 : onboardingData.training.level === 'INTERMEDIO' ? 9 : 8;
    const fullMonth = createMesocycleFromWeek1(week1, maxRPE);
    // Extraer solo semanas 2, 3 y 4
    const newDays = fullMonth.slice(7);
    batchInsertDays(newDays);
  };

  const handleDayPaintClick = (dayId: string) => {
    if (!activePaintBlock) return;
    
    // Anexado (Merge/Stacking) utilizando el Worker o el Store
    workerRef.current?.postMessage({
      type: 'PAINT_BLOCK',
      payload: {
        block: activePaintBlock,
        targetDayIndices: [days.findIndex(d => d.id === dayId)]
      }
    });
  };

  const groupByWeeks = (workoutDays: typeof days) => {
    const weeks = [];
    for (let i = 0; i < workoutDays.length; i += 7) {
      weeks.push(workoutDays.slice(i, i + 7));
    }
    return weeks;
  };

  const renderSegmentMenu = (menuId: string, dayIds: string[]) => (
    <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
      <button 
        onClick={(e) => {
          e.preventDefault();
          setOpenSegmentMenuId(openSegmentMenuId === menuId ? null : menuId);
        }} 
        className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {openSegmentMenuId === menuId && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden py-1 z-50 font-sans"
          >
            <button 
              onClick={() => { duplicateSegmentDays(dayIds); setOpenSegmentMenuId(null); toast.success('Segmento duplicado'); }} 
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4 text-indigo-400" /> Duplicar
            </button>
            <button 
              onClick={() => { toast('Próximamente', { icon: '🔗' }); setOpenSegmentMenuId(null); }} 
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4 text-indigo-400" /> Compartir
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button 
              onClick={() => { removeSegmentDays(dayIds); setOpenSegmentMenuId(null); toast.success('Segmento eliminado'); }} 
              className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" /> Eliminar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div 
      className={`${isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen rounded-none border-none overflow-y-auto' : 'w-full rounded-2xl border border-slate-200'} flex flex-col relative bg-slate-100 ${activePaintBlock ? 'cursor-none' : ''}`}
      onClick={handleBackgroundClick}
    >
      
      {/* Dimming Glow para la brocha */}
      <AnimatePresence>
        {activePaintBlock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/15 pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* SVG del Cursor Stamp */}
      {activePaintBlock && (
        <div 
          ref={stampRef}
          className="fixed top-0 left-0 pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2"
        >
          <div className="bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-xl shadow-2xl border border-indigo-400 flex items-center gap-2 scale-90">
            <Activity size={14} />
            <span className="text-xs font-bold whitespace-nowrap">{activePaintBlock.name}</span>
          </div>
        </div>
      )}

      {/* Escape Trinity 2: Floating Action Bar */}
      <AnimatePresence>
        {activePaintBlock && (
          <motion.div 
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            className="absolute bottom-6 left-1/2 z-50 flex items-center gap-4 bg-zinc-900 px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-zinc-800"
          >
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-bold tracking-widest uppercase">Modo Pintura</span>
            </div>
            <div className="h-4 w-px bg-zinc-700"></div>
            <span className="text-sm font-medium text-zinc-300">{activePaintBlock.name}</span>
            <button 
              onClick={() => setActivePaintBlock(null)}
              className="ml-4 bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              Finalizar <kbd className="bg-rose-700 px-1.5 py-0.5 rounded text-[10px] opacity-80">ESC</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Clinical Guardrail HUD (Visible only < 1280px and if injuries exist) */}
      {!isXl && injuries && injuries.length > 0 && (
        <div className="sticky top-0 z-50 bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Restricción Clínica:</span>
            <div className="flex gap-2">
              {injuries.map((inj, idx) => (
                <span key={idx} className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {inj.zone} ({inj.painLevel}/5)
                </span>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="text-[10px] font-bold uppercase bg-white border border-rose-200 text-rose-600 px-3 py-1 rounded-lg hover:bg-rose-100"
          >
            Ver Cockpit
          </button>
        </div>
      )}

      {/* Main Grid Layout wrapped in DndContext */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isGenerating ? 'pointer-events-none opacity-60 filter blur-[1px]' : 'pointer-events-auto opacity-100'} ${isRoutineLocked ? 'opacity-80 grayscale-[20%]' : ''}`}>
          
          {/* Timeline de Periodización */}
              {!isReadOnly && (
                <>
                <div className="w-full px-4 pt-4 pb-4 flex flex-col gap-4 relative z-30 transition-all duration-300">
                  <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
                  {headerContent}
                  {phases.length > 0 && !isSimpleMode && (
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                    {/* A. Fases del Programa (Horizontal Scroll) */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 mb-2 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{labels.phase}s del {labels.program}</span>
                          <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {phases.length} {phases.length === 1 ? 'Periodo' : 'Periodos'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
                            Añadir Periodo:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickAddWorkoutPhase('HIPERTROFIA', 4)}
                            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md border border-slate-200/80 transition-colors cursor-pointer"
                            title="Añadir 4 semanas de Hipertrofia"
                          >
                            +4s Hipertrofia
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAddWorkoutPhase('FUERZA', 3)}
                            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-md border border-slate-200/80 transition-colors cursor-pointer"
                            title="Añadir 3 semanas de Fuerza"
                          >
                            +3s Fuerza
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAddWorkoutPhase('TRANSICION', 1)}
                            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600 rounded-md border border-slate-200/80 transition-colors cursor-pointer"
                            title="Añadir 1 semana de Descarga (Deload)"
                          >
                            +1s Descarga
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAddWorkoutPhase('ADAPTACION', 2)}
                            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 rounded-md border border-slate-200/80 transition-colors cursor-pointer"
                            title="Añadir 2 semanas de Adaptación Anatómica"
                          >
                            +2s Adaptación
                          </button>
                        </div>
                      </div>
                      <div className="flex w-full gap-2 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <SortableContext items={phases.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                          {phases.map((phase) => (
                            <SortablePhaseCard
                              key={phase.id}
                              phase={phase}
                              isActive={activePhaseId === phase.id}
                              isEditing={editingPhaseId === phase.id}
                              daysCount={days.filter(d => d.phaseId === phase.id).length}
                              setActivePhaseId={setActivePhaseId}
                              updatePhase={updatePhase}
                              removePhase={(id) => {
                                removePhase(id);
                                const remaining = phases.filter(p => p.id !== id);
                                setActivePhaseId(remaining.length > 0 ? remaining[0].id : null);
                              }}
                              toast={toast}
                            />
                          ))}
                        </SortableContext>
                        
                        {/* Add Phase Card Button */}
                        <div
                          onClick={() => setIsPeriodSelectorOpen(true)}
                          className="snap-start shrink-0 flex flex-col justify-center items-center p-3 rounded-2xl cursor-pointer transition-all border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 w-64 opacity-80 hover:opacity-100"
                        >
                          <Plus className="w-8 h-8 text-indigo-400 mb-2" />
                          <span className="text-sm font-bold text-slate-600">Agregar Bloque</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                  </div>
                </div>

                {phases.length > 0 && (
                <div className="w-full px-4 pb-4 sticky top-0 bg-slate-100/90 backdrop-blur-xl border-b border-slate-200 z-40 transition-all duration-300">
                  <div className="w-full max-w-7xl mx-auto">
                  {/* BARRA DE NAVEGACIÓN Y HERRAMIENTAS UNIFICADA */}
                  <div className="flex flex-col xl:flex-row items-center justify-between bg-white border border-slate-200 rounded-2xl p-2 shadow-sm gap-4">
                     {/* Izquierda: Tabs Principales */}
                     <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                       {!isSimpleMode && (
                         <>
                           <div className="hidden xl:flex flex-col justify-center">
                             <div className="flex items-center gap-1.5 text-slate-400">
                               <LayoutTemplate size={14} />
                               <span className="text-[11px] font-black uppercase tracking-widest">Modo de Trabajo</span>
                             </div>
                           </div>
                           <div className="flex bg-slate-100/80 p-1 rounded-xl w-full xl:w-auto border border-slate-200/50 shadow-inner">
                              <button 
                                 onClick={() => setActiveMainTab('mapa')}
                                 className={`flex flex-col items-center justify-center flex-1 xl:flex-none px-6 py-1.5 rounded-lg transition-all duration-200 ${activeMainTab === 'mapa' ? 'bg-white shadow-sm border border-slate-200/50' : 'hover:bg-slate-200/50 opacity-70 hover:opacity-100'}`}
                              >
                                <span className={`font-heading text-sm ${activeMainTab === 'mapa' ? 'text-indigo-700 font-bold' : 'text-slate-600 font-semibold'}`}>Mapa del Plan</span>
                                <span className={`text-[9px] uppercase tracking-wider hidden md:block mt-0.5 ${activeMainTab === 'mapa' ? 'text-indigo-400 font-bold' : 'text-slate-400 font-medium'}`}>Calendario General</span>
                              </button>
                              <button 
                                 onClick={() => setActiveMainTab('dias')}
                                 className={`flex flex-col items-center justify-center flex-1 xl:flex-none px-6 py-1.5 rounded-lg transition-all duration-200 ${activeMainTab === 'dias' ? 'bg-white shadow-sm border border-slate-200/50' : 'hover:bg-slate-200/50 opacity-70 hover:opacity-100'}`}
                              >
                                <span className={`font-heading text-sm ${activeMainTab === 'dias' ? 'text-indigo-700 font-bold' : 'text-slate-600 font-semibold'}`}>Editor de {labels.day}s</span>
                                <span className={`text-[9px] uppercase tracking-wider hidden md:block mt-0.5 ${activeMainTab === 'dias' ? 'text-indigo-400 font-bold' : 'text-slate-400 font-medium'}`}>Armar Rutinas</span>
                              </button>
                           </div>
                         </>
                       )}
                       {isSimpleMode && (
                         <div className="flex items-center gap-1.5 text-slate-700">
                           <LayoutTemplate size={16} className="text-indigo-600" />
                           <span className="text-sm font-black font-montserrat">Editor de {labels.day}s</span>
                         </div>
                       )}
                     </div>

                     {/* Derecha: Herramientas Contextuales */}
                     <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                       {activeMainTab === 'dias' && (
                         <>
                           {/* Vistas (Dias, Semanas) */}
                           <div className="flex items-center gap-3 bg-slate-50/80 p-1 pl-3 rounded-xl border border-slate-200/60 shrink-0">
                             <div className="hidden xl:flex items-center gap-1.5 text-slate-400 mr-1" title="Agrupar los días en pantalla">
                               <Eye size={14} />
                               <span className="text-[11px] font-black uppercase tracking-widest">Vista</span>
                             </div>
                             <div className="flex items-center bg-white p-1 rounded-lg shadow-sm shrink-0">
                                <button onClick={() => setViewMode('micro')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'micro' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Días</button>
                                <button onClick={() => setViewMode('medio')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'medio' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Semanas</button>
                                <button onClick={() => setViewMode('macro')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'macro' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>Meses</button>
                             </div>
                           </div>

                           <div className="w-px h-8 bg-slate-200 mx-1 hidden xl:block"></div>

                           {/* Auto-Progresion Mini Toggle */}
                           <div className="flex items-center gap-2 shrink-0">
                             <div 
                               className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 cursor-pointer hover:bg-emerald-100 transition-colors group" 
                               onClick={() => setOverloadAssistantActive(!isOverloadAssistantActive)}
                               title="Calcula automáticamente los aumentos de peso y repeticiones semana a semana."
                             >
                                <Zap className={`w-4 h-4 ${isOverloadAssistantActive ? 'text-emerald-600' : 'text-emerald-300'}`} />
                                <span className={`text-xs font-bold hidden md:inline ${isOverloadAssistantActive ? 'text-emerald-700' : 'text-emerald-500'}`}>Auto-Progresión</span>
                                <div className={`relative inline-flex h-5 w-9 ml-1 items-center rounded-full transition-colors ${isOverloadAssistantActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOverloadAssistantActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                             </div>

                             {isOverloadAssistantActive && (
                               <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 hidden md:flex animate-in fade-in slide-in-from-left-2">
                                 <select
                                   value={selectedPreset || 'LINEAR'}
                                   onChange={(e) => setSelectedPreset(e.target.value as any)}
                                   className="text-xs font-bold text-emerald-700 bg-transparent outline-none cursor-pointer"
                                   title="Modelo de Progresión"
                                 >
                                   <option value="LINEAR">📈 Lineal</option>
                                   <option value="UNDULATING">🌊 Ondulante</option>
                                   <option value="DUP">⚡ DUP</option>
                                   <option value="BLOCK">🧱 Bloques</option>
                                 </select>
                                 <div className="w-px h-4 bg-emerald-200 mx-1"></div>
                                 <button onClick={() => setIsProgressionModalOpen(true)} className="p-1 text-emerald-600 hover:bg-emerald-200 rounded-md transition-colors" title="Ajustar Configuración Avanzada">
                                   <Settings2 className="w-4 h-4" />
                                 </button>
                               </div>
                             )}
                           </div>
                         </>
                       )}

                       <button 
                          onClick={() => {
                             if (!document.fullscreenElement) {
                               document.documentElement.requestFullscreen().catch(err => {
                                 console.error(`Error al intentar Pantalla Completa: ${err.message}`);
                               });
                             } else {
                               document.exitFullscreen();
                             }
                          }}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0"
                          title="Modo Inmersivo (Pantalla Completa)"
                       >
                          <Maximize className="w-5 h-5" />
                       </button>
                     </div>
                  </div>


                  </div>
                </div>
              )}
              </>
            )}
              

          {/* SPLIT VIEW */}
          <div className="flex-1 flex flex-col xl:flex-row relative">
            
          {/* A. LEFT COLUMN: Asset Palette */}
          {!isReadOnly && activeMainTab === 'dias' && phases.length > 0 && (
            <div 
              data-tour-step="exercise-search"
              className={`
              bg-white border-r border-slate-200 flex flex-col shadow-sm z-50 hidden md:flex transition-all duration-300 xl:sticky top-[80px] h-[calc(100vh-80px)] shrink-0
              ${isLeftPanelExpanded ? 'xl:w-[420px]' : 'xl:w-10'}
            `}>
              {/* Horizontal Label when collapsed */}
              {isXl && !isLeftPanelExpanded && !isFullscreen && (
                <div 
                  className="flex-1 cursor-pointer w-full h-full relative group" 
                  onClick={() => setIsLeftPanelExpanded(true)}
                >
                  <div className="absolute top-48 left-4 -translate-y-1/2 z-[100]">
                    <div 
                      className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-full shadow-md group-hover:border-indigo-300 group-hover:shadow-lg transition-all cursor-pointer"
                      title="Mostrar Ejercicios"
                    >
                      <Layers size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Content */}
              <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isLeftPanelExpanded ? 'opacity-100' : 'opacity-0 invisible'}`}>
                <div className="bg-white border-b border-slate-200 pt-2 px-2 flex items-center justify-between w-full">
                  <div className="flex overflow-x-auto custom-scrollbar flex-1">
                    <button 
                      onClick={() => setActiveTabLeft('search')}
                      className={`px-3 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTabLeft === 'search' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                      Catálogo
                    </button>
                    <button 
                      onClick={() => setActiveTabLeft('blocks')}
                      className={`px-3 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTabLeft === 'blocks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                      Circuitos
                    </button>
                    <button 
                      onClick={() => setActiveTabLeft('shelf')}
                      className={`px-3 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTabLeft === 'shelf' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                      Frecuentes
                    </button>
                    <button 
                      onClick={() => setActiveTabLeft('vault')}
                      className={`px-3 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTabLeft === 'vault' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                      <Zap size={12}/> Plantillas
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsLeftPanelExpanded(false)}
                    className="shrink-0 ml-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    Ocultar <ChevronLeft size={12} />
                  </button>
                </div>

                {activeTabLeft !== 'search' && (
                  <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
                    {/* Filtros de Píldoras Rápidas (Chips) Arriba del buscador para mejor eficiencia visual */}
                  {activeTabLeft === 'shelf' && (
                    <div className="flex gap-1.5 w-full overflow-x-auto pb-1 custom-scrollbar" style={{ scrollbarWidth: 'none' }}>
                      {[
                        { id: 'ALL', label: 'Todos' },
                        { id: 'UPPER', label: 'Superior' },
                        { id: 'LOWER', label: 'Inferior' },
                        { id: 'CORE', label: 'Core' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setCategoryFilter(cat.id as any)}
                          className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                            categoryFilter === cat.id 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Buscador de bloques / shelf */}
                  {activeTabLeft !== 'search' && (
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder={activeTabLeft === 'blocks' ? "Buscar circuitos..." : "Buscar..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none shadow-sm"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className={`flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden ${activeTabLeft === 'search' ? '' : 'p-4 bg-slate-50/50'}`}>
                {activeTabLeft === 'shelf' && (
                  <div className="space-y-2">
                    {FINAL_CORE_10.filter(ex => {
                      if (categoryFilter === 'UPPER' && !['Pectoral', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps'].some(m => ex.Musculo_Agonista?.includes(m))) return false;
                      if (categoryFilter === 'LOWER' && !['Cuádriceps', 'Isquiosurales', 'Glúteos', 'Pantorrillas'].some(m => ex.Musculo_Agonista?.includes(m))) return false;
                      if (categoryFilter === 'CORE' && !['Abdominales', 'Oblicuos', 'Lumbares'].some(m => ex.Musculo_Agonista?.includes(m))) return false;
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase();
                        return (
                          (ex.Nombre_Oficial || '').toLowerCase().includes(q) ||
                          (ex.Alias_Buscador || '').toLowerCase().includes(q) ||
                          (ex.Musculo_Agonista || '').toLowerCase().includes(q)
                        );
                      }
                      return true;
                    }).map(ex => (
                      <DraggablePaletteItem key={ex.ID_Ejercicio} exercise={ex} onQuickInject={handleQuickInject} />
                    ))}
                  </div>
                )}

                {activeTabLeft === 'blocks' && (
                  <div className="space-y-4 px-2">
                    <div className="flex flex-col gap-2">
                      {Object.values(SMART_BLOCKS).filter(block => {
                        if (searchQuery) {
                          const q = searchQuery.toLowerCase();
                          return (
                            block.name.toLowerCase().includes(q) ||
                            block.items.some(item => (item.exercise?.Nombre_Oficial || '').toLowerCase().includes(q))
                          );
                        }
                        return true;
                      }).map((block) => (
                        <DraggableBlockPaletteItem 
                          key={block.id} 
                          block={block} 
                          onQuickInject={handleQuickInject} 
                          onClick={setActivePaintBlock}
                        />
                      ))}
                    </div>

                    <div className="mt-6 p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <h3 className="font-black text-slate-700 text-xs">Generador de Circuitos</h3>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
                          Auto-Ensamblaje Inteligente
                        </span>
                      </div>

                      {/* Botón Maestro del Wizard */}
                      <button
                        onClick={() => {
                          setCircuitModalInitialType('TABATA');
                          setIsCircuitModalOpen(true);
                        }}
                        className="w-full mb-2.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
                      >
                        <Sparkles size={13} /> ⚡ Abrir Asistente de Circuitos
                      </button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            setCircuitModalInitialType('TABATA');
                            setIsCircuitModalOpen(true);
                          }}
                          className="bg-rose-50 text-rose-600 border border-rose-200 py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 hover:bg-rose-100 transition-colors"
                        >
                          <Zap size={14} /> Tabata (20/10)
                        </button>
                        
                        <button 
                          onClick={() => {
                            setCircuitModalInitialType('EMOM');
                            setIsCircuitModalOpen(true);
                          }}
                          className="bg-indigo-50 text-indigo-600 border border-indigo-200 py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 hover:bg-indigo-100 transition-colors"
                        >
                          <Timer size={14} /> EMOM
                        </button>
                        
                        <button 
                          onClick={() => {
                            setCircuitModalInitialType('AMRAP');
                            setIsCircuitModalOpen(true);
                          }}
                          className="bg-amber-50 text-amber-600 border border-amber-200 py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 hover:bg-amber-100 transition-colors"
                        >
                          <Flame size={14} /> AMRAP
                        </button>

                        <button 
                          onClick={() => {
                            setCircuitModalInitialType('PHA_TRISERIE');
                            setIsCircuitModalOpen(true);
                          }}
                          className="bg-emerald-50 text-emerald-600 border border-emerald-200 py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 hover:bg-emerald-100 transition-colors"
                        >
                          <Activity size={14} /> PHA Shunting
                        </button>

                        <button 
                          onClick={() => {
                            setCircuitModalInitialType('COMPLEX');
                            setIsCircuitModalOpen(true);
                          }}
                          className="bg-purple-50 text-purple-600 border border-purple-200 py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 hover:bg-purple-100 transition-colors"
                        >
                          <Dumbbell size={14} /> Complejo Barra
                        </button>

                        <button 
                          onClick={() => {
                            setCircuitModalInitialType('RAMP_WARMUP');
                            setIsCircuitModalOpen(true);
                          }}
                          className="bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 hover:bg-orange-100 transition-colors"
                        >
                          <Thermometer size={14} /> Calentamiento RAMP
                        </button>
                      </div>
                      
                      <p className="text-[9px] text-slate-500 mt-2.5 text-center leading-relaxed">
                        Configura y auto-genera con 1 clic. Aplícalo como "Pincel" o inyéctalo directamente.
                      </p>
                    </div>
                  </div>
                )}

                {activeTabLeft === 'search' && (
                  <div className="w-full h-full">
                    <SmartExerciseLibrary onQuickInject={handleQuickInject} />
                  </div>
                )}

                {activeTabLeft === 'vault' && (
                  <div className="w-full">
                    <SmartVaultPanel />
                  </div>
                )}
              </div>
              </div>
            </div>
          )}

          {/* B. CENTER COLUMN (Canvas) */}
          <div 
            className={`flex-1 bg-slate-50/50 relative ${isLeftPanelExpanded ? 'hidden xl:block' : 'block'}`}
          >
            <div className="w-full max-w-7xl mx-auto relative px-2 sm:px-4 py-4 min-h-full pb-32">
            
            <ProgressionSettingsModal isOpen={isProgressionModalOpen} onClose={() => setIsProgressionModalOpen(false)} />
            <PeriodSelectorModal isOpen={isPeriodSelectorOpen} onClose={() => setIsPeriodSelectorOpen(false)} />

            {/* Mini HUD for collapsed mode */}
            {isXl && !isCockpitExpanded && injuries && injuries.length > 0 && (
              <div className="relative mb-6 flex justify-center w-full max-w-4xl mx-auto">
                <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">Restricción Clínica:</span>
                  <div className="flex gap-2">
                    {injuries.map((inj, idx) => (
                      <span key={idx} className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                        {inj.zone} ({inj.painLevel}/5)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="relative min-h-[500px]">
              {isRoutineLocked && (
                <div className="absolute inset-0 z-40 bg-slate-50/10 pointer-events-none rounded-3xl" />
              )}
              {isGenerating && (
                <div className="absolute inset-0 z-50 p-4 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-sm flex flex-col gap-4">
                  {/* Shimmer Overlay (3.5s cycle per user request) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-[200%] z-10 pointer-events-none" style={{ animation: 'shimmer-calm 3.5s infinite linear', transform: 'translateX(-100%)' }} />
                  
                  {/* Top Status */}
                  <div className="flex items-center justify-center pt-8 pb-4 relative z-20">
                     <div className="bg-indigo-600/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl shadow-indigo-500/20 flex flex-col items-center gap-1 border border-indigo-400">
                        <Zap className="w-5 h-5 text-indigo-200 mb-1" />
                        <h3 className="text-sm font-black text-white font-montserrat tracking-widest uppercase">Generando Rutina</h3>
                        <p className="text-[10px] font-mono tracking-wider text-indigo-200 uppercase">{generationStepText}</p>
                     </div>
                  </div>

                  {/* Skeletons */}
                  <div className="flex gap-4 opacity-40 relative z-0 mt-4 overflow-hidden w-full">
                    {[1, 2, 3, 4].map((col) => (
                      <div key={col} className="w-[340px] shrink-0 bg-slate-100/50 rounded-3xl p-3 border border-slate-200">
                         <div className="h-4 bg-slate-300/50 rounded w-1/3 mb-4" />
                         <div className="flex flex-col gap-3">
                           {[1, 2, 3, 4].map((item) => (
                             <div key={item} className="h-24 bg-white/60 rounded-2xl border border-slate-200 shadow-sm" />
                           ))}
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <style>{`
                    @keyframes shimmer-calm {
                      100% {
                        transform: translateX(100%);
                      }
                    }
                  `}</style>
                </div>
              )}

              {activeMainTab === 'mapa' && phases.length > 0 ? (
                <div className="mt-4 animate-in fade-in duration-300">
                  <InteractiveHeatmap activePhaseId={activePhaseId} />
                </div>
              ) : (
                <>
                  {/* Opciones Menu */}
                  {isReadOnly && (
                  <div className="relative z-50">
                    <button 
                      onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                      className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <Settings className="w-4 h-4 text-indigo-500" /> Opciones <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOptionsMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isOptionsMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden"
                        >
                          <button 
                            onClick={() => {
                              setIsOptionsMenuOpen(false);
                              navigate('/plan-builder');
                            }}
                            className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition-colors"
                          >
                            <PenTool className="w-4 h-4 text-indigo-400" /> EDITAR RUTINA
                          </button>
                          <button 
                            onClick={() => setIsOptionsMenuOpen(false)}
                            className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition-colors"
                          >
                            <Copy className="w-4 h-4 text-indigo-400" /> DUPLICAR
                          </button>
                          <button 
                            onClick={() => setIsOptionsMenuOpen(false)}
                            className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-indigo-400" /> COMPARTIR
                          </button>
                          <button 
                            onClick={() => setIsOptionsMenuOpen(false)}
                            className="w-full text-left px-4 py-3 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                          >
                            <Save className="w-4 h-4 text-emerald-400" /> GUARDAR / HABILITAR
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {/* EMPTY STATE ULTRA ÁGIL: PRESETS DE CICLOS EN 1 CLIC */}
              {!isReadOnly && phases.length === 0 && (
                <div data-tour-step="sequence-assistant" className="w-full max-w-5xl mx-auto my-8 text-center flex flex-col items-center gap-6 px-4">
                  {/* 1. ENCABEZADO PRINCIPAL */}
                  <div className="flex flex-col items-center max-w-2xl px-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-sm border border-indigo-100 text-2xl">
                      🏋️‍♂️
                    </div>
                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full mb-2 shadow-sm border border-indigo-200 uppercase tracking-widest">
                      PERIODIZACIÓN & MESOCICLOS
                    </span>
                    <h4 className="text-slate-800 text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2 font-montserrat">
                      PLANIFICACIÓN POR CICLOS
                    </h4>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                      Activá un macrociclo estructurado en <strong>1 solo clic</strong> o armá tu secuencia bloque por bloque con base científica.
                    </p>

                    {/* 2. BOTONES DE ACCIÓN RÁPIDA (ARRIBA, NO AL FINAL) */}
                    <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-1 mb-2">
                      <button 
                        type="button"
                        onClick={() => setIsPeriodSelectorOpen(true)}
                        className="text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50/80 border border-indigo-200 px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 active:scale-98"
                      >
                        <CalendarPlus className="w-4 h-4 text-indigo-600" />
                        <span>Diseñar Ciclo a Medida (Librería)</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className={`text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs border transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                          showGuide 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                            : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <GraduationCap className={`w-4 h-4 ${showGuide ? 'text-white' : 'text-slate-500'}`} />
                        <span>{showGuide ? 'Ocultar Guía de Periodización' : 'Ver Guía de Periodización'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. GUÍA DE PERIODIZACIÓN (DESPLEGABLE DIRECTAMENTE ARRIBA) */}
                  <AnimatePresence>
                    {showGuide && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="w-full max-w-5xl mx-auto overflow-hidden text-left"
                      >
                        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/40 border border-indigo-100 rounded-2xl p-5 shadow-sm">
                          <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">🎓</span>
                            Guía Rápida de Periodización para Entrenadores
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Concepto 1 */}
                            <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                              <h5 className="font-black text-[10px] uppercase text-indigo-500 tracking-widest mb-2 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-indigo-600"/> 1. Bloques / Fases
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Un "Bloque" agrupa varias semanas con una misma meta fisiológica (Adaptación, Hipertrofia o Fuerza). Tienen su color distintivo para visualizarlos de un vistazo.
                              </p>
                            </div>
                            {/* Concepto 2 */}
                            <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                              <h5 className="font-black text-[10px] uppercase text-indigo-500 tracking-widest mb-2 flex items-center gap-1.5">
                                <Copy className="w-3.5 h-3.5 text-indigo-600"/> 2. Generar Semanas
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Diseñás la <strong>Semana 1</strong> y luego hacés clic en <strong>"+4 Semanas"</strong> para clonarla hacia el futuro aplicando sobrecarga progresiva sin trabajo repetitivo.
                              </p>
                            </div>
                            {/* Concepto 3 */}
                            <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                              <h5 className="font-black text-[10px] uppercase text-indigo-500 tracking-widest mb-2 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-500"/> 3. Progresión Automática
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                                El motor calcula el volumen e intensidad semana a semana:
                              </p>
                              <ul className="text-[11px] text-slate-500 space-y-1 ml-1 border-l-2 border-indigo-100 pl-2">
                                <li><strong>📈 Lineal:</strong> Aumento gradual de cargas.</li>
                                <li><strong>🌊 Ondulante:</strong> Alterna días pesados y livianos.</li>
                                <li><strong>⚡ DUP:</strong> Varía repeticiones e intensidad cada sesión.</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 4. SECCIÓN PEDAGÓGICA VISUAL UX: DISTRIBUCIÓN SEMANAL */}
                  <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider mb-1">
                          <Info className="w-3 h-3" /> Distribución Semanal
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="text-slate-800 font-extrabold text-base sm:text-lg">
                            Distribución Semanal
                          </h5>
                          {training?.days_per_week && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <Target className="w-3 h-3 text-emerald-600" />
                              Preferencia del cliente: {training.days_per_week} días/semana
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs mt-0.5 max-w-2xl leading-relaxed">
                          Cómo repartís los grupos musculares en los días de la semana. La regla de oro es que cada músculo entrene con máxima energía y luego descanse 48 horas para recuperarse y crecer.
                        </p>
                      </div>

                      {/* Selector de Distribución Semanal */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-2xl border border-slate-200 self-start md:self-auto">
                        {PEDAGOGICAL_SPLITS.map((split) => {
                          const isSel = selectedSplitId === split.id;
                          const isOnboardingDefault = training?.days_per_week === split.days && (split.days !== 3 || split.id === defaultSplitIdFromOnboarding);
                          return (
                            <button
                              key={split.id}
                              type="button"
                              onClick={() => setSelectedSplitId(split.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSel
                                  ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100 scale-102'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                              }`}
                            >
                              <span>{split.buttonLabel}</span>
                              {isOnboardingDefault && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                                  🎯 Onboarding
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tarjeta Visual Detallada de la Distribución Seleccionada */}
                    <div className="mt-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">
                            {selectedSplitDef.splitPreference === 'CLASSIC_WEIDER' ? '🏆' : selectedSplitDef.splitPreference === 'FULL_BODY' ? '⚡' : selectedSplitDef.splitPreference === 'UPPER_LOWER' ? '⭐' : '🚀'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h6 className="font-extrabold text-slate-800 text-sm sm:text-base">
                                {selectedSplitDef.label}
                              </h6>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${selectedSplitDef.badgeColor}`}>
                                {selectedSplitDef.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {selectedSplitDef.shortDesc}
                            </p>
                          </div>
                        </div>

                        {training?.days_per_week === selectedSplitDef.days ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> Preferencia del cliente: {training.days_per_week} días por semana
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                            Frecuencia: {selectedSplitDef.days} días por semana
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed mb-4">
                        💡 <strong>¿Cómo funciona?:</strong> {selectedSplitDef.explanation}
                      </p>

                      {/* Desglose Visual de los Días de la Distribución */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5">
                        {selectedSplitDef.daysSchedule.map((dayItem, dIdx) => (
                          <div 
                            key={dIdx} 
                            className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${dayItem.color}`}>
                                  {dayItem.day}
                                </span>
                              </div>
                              <h6 className="font-bold text-slate-800 text-xs mb-1">
                                {dayItem.title}
                              </h6>
                              <p className="text-[10px] text-slate-500 leading-snug">
                                {dayItem.muscles}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Barra de Garantías Fijas de Calidad */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Cada día incluye automáticamente:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold text-slate-600">
                            🔥 RAMP (Calentamiento guiado)
                          </span>
                          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold text-slate-600">
                            🛡️ Core 360° & Anti-lesiones
                          </span>
                          <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold text-slate-600">
                            🧘 Estiramientos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. GRID DE PRESETS DE CICLOS EN 1 CLIC (6 OPCIONES) */}
                  <div className="w-full text-left mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Elegí un Ciclo Pre-diseñado (1 Clic)</span>
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Se generará con los ejercicios, repeticiones y descansos adaptados a tu atleta y a la distribución semanal seleccionada ({selectedSplitDef.days} días):
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full mb-2">
                      {QUICK_WORKOUT_CYCLES.map((cycle) => (
                        <div 
                          key={cycle.id}
                          className={`bg-white rounded-2xl p-4 sm:p-5 border ${cycle.border} shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer hover:scale-[1.01]`}
                          onClick={() => handleApplyQuickWorkoutCycle(cycle)}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-2xl">{cycle.icon}</span>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {cycle.duration}
                              </span>
                            </div>

                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                              {cycle.badge}
                            </span>

                            <h3 className="font-bold text-slate-800 text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
                              {cycle.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                              {cycle.subtitle}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyQuickWorkoutCycle(cycle);
                            }}
                            className="mt-4 w-full py-2 px-3 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-98"
                          >
                            <Sparkles size={13} />
                            <span>Cargar Ciclo Completo</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeMainTab === 'dias' && phases.length > 0 && (
                <>
                  {viewMode === 'micro' ? (
                <div className={`flex flex-col gap-6 h-full pb-8 w-full max-w-7xl mx-auto ${isXl && !isCockpitExpanded && injuries?.length > 0 ? 'mt-12' : ''} ${isGenerating ? 'blur-sm pointer-events-none' : ''}`}>
                  {visibleDays.length === 0 ? (
                    <div className="w-full flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 mb-4 mt-8">
                      <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                      </div>
                      <h3 className="text-xl font-heading font-extrabold text-slate-800 mb-2">Comienza tu rutina</h3>
                      <p className="font-sans text-slate-500 max-w-md mb-6 leading-relaxed">
                        Puedes generar un mesociclo completo con periodización inteligente por ciclos basado en el perfil del atleta, o añadir tus días manualmente.
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            const goal = goalTags?.[0] || 'HIPERTROFIA';
                            const currentPhase = phases.find(p => p.id === activePhaseId);
                            const phaseModality = currentPhase?.modality || 'HIPERTROFIA';
                            const newDays = generateSmartRoutine({
                              goal,
                              daysCount: selectedDaysFrequency,
                              splitPreference: selectedSplitDef.splitPreference,
                              injuries: injuries as string[],
                              phaseModality,
                              phaseId: activePhaseId || undefined,
                              phaseName: currentPhase?.name,
                              isFemaleAthlete: isFemale
                            });
                            if (activePhaseId && days.length > 0) {
                              const otherDays = days.filter(d => d.phaseId !== activePhaseId);
                              populateFullRoutine([...otherDays, ...newDays]);
                            } else {
                              populateFullRoutine(newDays);
                            }
                            toast.success(`¡Rutina de ${currentPhase ? currentPhase.name : 'Ciclo'} generada (${selectedDaysFrequency} días/sem)!`);
                          }}
                          className="py-3 px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-2xl text-sm font-bold font-montserrat shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                        >
                          <Zap size={16} className="text-amber-300 fill-amber-300" />
                          <span>Auto-Poblar Rutina por Ciclos ({selectedDaysFrequency} días)</span>
                        </button>
                        
                        <button
                          onClick={() => addWorkoutDay(getNextDayName(), activePhaseId || undefined)}
                          className="py-3 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold font-montserrat shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Plus size={16} className="text-slate-400" />
                          <span>Añadir Día Manual</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    visibleDays.map((day, index) => (
                      <motion.div
                        key={day.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                        className="w-full"
                      >
                        <DroppableDayColumn
                          day={day}
                          dayNumber={index + 1}
                          isActive={activeDayId === day.id}
                          onSetActive={(id) => {
                             setActiveDayId(id);
                             setIsLeftPanelExpanded(true);
                          }}
                          updateRoutineItem={updateRoutineItem}
                          removeRoutineItem={removeRoutineItem}
                          revertClinicalSwap={revertClinicalSwap}
                        />
                      </motion.div>
                    ))
                  )}
                  
                  {visibleDays.length > 0 && (
                    <div 
                      onClick={() => addWorkoutDay(getNextDayName(), activePhaseId || undefined)}
                      className="w-full border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all h-[120px] mt-2 group"
                    >
                      <div className="flex flex-col items-center gap-2 font-heading font-bold text-slate-400 group-hover:text-indigo-600">
                        <Plus size={24} className="group-hover:scale-125 transition-transform" />
                        <span className="uppercase text-xs tracking-wider">Añadir {getNextDayName()}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex flex-col gap-10 pb-16 w-full ${viewMode === 'medio' ? 'max-w-7xl' : 'max-w-full'} mx-auto ${isXl && !isCockpitExpanded && injuries?.length > 0 ? 'mt-12' : ''} ${isGenerating ? 'blur-sm pointer-events-none' : ''} ${activePaintBlock ? 'z-20 relative' : ''}`}>
                  {(() => {
                    const allWeeks = groupByWeeks(visibleDays);
                    let chunks = [];
                    let title = 'Semana';
                    let chunkSize = 1;
                    
                    if (viewMode === 'medio') {
                      const activeWeekIndex = allWeeks.findIndex(w => w.some(d => d.id === activeDayId));
                      const idx = activeWeekIndex >= 0 ? activeWeekIndex : 0;
                      if (allWeeks[idx]) chunks = [[allWeeks[idx]]];
                    } else if (viewMode === 'macro') {
                      title = 'Mes';
                      chunkSize = 4;
                      for(let i=0; i<allWeeks.length; i+=4) chunks.push(allWeeks.slice(i, i+4));
                    } else if (viewMode === 'semestral') {
                      title = 'Semestre';
                      chunkSize = 24;
                      for(let i=0; i<allWeeks.length; i+=24) chunks.push(allWeeks.slice(i, i+24));
                    } else if (viewMode === 'anual') {
                      title = 'Año';
                      chunkSize = 48;
                      for(let i=0; i<allWeeks.length; i+=48) chunks.push(allWeeks.slice(i, i+48));
                    }

                    return chunks.map((chunk, chunkIndex) => {
                      const months = [];
                      if (viewMode === 'medio') {
                        months.push(chunk);
                      } else {
                        for(let i=0; i<chunk.length; i+=4) {
                          months.push(chunk.slice(i, i+4));
                        }
                      }

                      return (
                        <div key={`${title}-${chunkIndex}`} className={`flex flex-col gap-6 ${viewMode !== 'medio' ? 'bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm' : ''}`}>
                          {viewMode !== 'medio' && (
                            <h2 className="text-xl font-black text-slate-800 border-b border-slate-200 pb-3 flex items-center justify-between gap-2">
                              <span className="flex items-center gap-2"><Target className="text-indigo-500 w-5 h-5" /> {title} {chunkIndex + 1}</span>
                              {!isReadOnly && renderSegmentMenu(`chunk-${chunkIndex}`, chunk.flatMap(w => w.map(d => d.id)))}
                            </h2>
                          )}
                          
                          <div className={`grid gap-8 ${viewMode === 'semestral' || viewMode === 'anual' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                            {months.map((monthWeeks, monthLocalIndex) => {
                              const realMonthIndex = viewMode === 'macro' 
                                ? chunkIndex 
                                : viewMode === 'semestral' 
                                  ? chunkIndex * 6 + monthLocalIndex 
                                  : chunkIndex * 12 + monthLocalIndex;

                              return (
                                <div key={`month-${realMonthIndex}`} className={`flex flex-col gap-4 ${viewMode === 'semestral' || viewMode === 'anual' ? 'bg-white p-5 rounded-2xl border border-slate-200 shadow-sm' : ''}`}>
                                  {(viewMode === 'semestral' || viewMode === 'anual') && (
                                    <h3 className="text-lg font-black text-slate-700 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                      <span className="flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-400" /> Mes {realMonthIndex + 1}</span>
                                      {!isReadOnly && renderSegmentMenu(`month-${realMonthIndex}`, monthWeeks.flatMap(w => w.map(d => d.id)))}
                                    </h3>
                                  )}
                                  <div className="flex flex-col gap-5">
                                    {monthWeeks.map((week) => {
                                      const realWeekIndex = allWeeks.findIndex(w => w[0].id === week[0].id);
                                      return (
                                        <div key={`week-${realWeekIndex}`} className="flex flex-col gap-2">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between gap-2 w-full">
                                            <span className="flex items-center gap-2">
                                              Semana {realWeekIndex + 1}
                                              {realWeekIndex % 4 === 3 && <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Descarga</span>}
                                            </span>
                                            {!isReadOnly && renderSegmentMenu(`week-${realWeekIndex}`, week.map(d => d.id))}
                                          </h4>
                                          <div className={
                                            viewMode === 'medio'
                                              ? week.length <= 1
                                                ? 'grid gap-4 grid-cols-1 max-w-sm'
                                                : week.length === 2
                                                  ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 max-w-2xl'
                                                  : week.length === 3
                                                    ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl'
                                                    : week.length === 4
                                                      ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl'
                                                      : week.length === 5
                                                        ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                                                        : week.length === 6
                                                          ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
                                                          : 'grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7'
                                              : 'grid gap-2 grid-cols-7'
                                          }>
                                            {week.map(day => (
                                              <MacroDayCard 
                                                key={day.id} 
                                                day={day} 
                                                isActive={activeDayId === day.id} 
                                                onSetActive={(id) => {
                                                  setActiveDayId(id);
                                                  if (!activePaintBlock) {
                                                    setViewMode('micro');
                                                  }
                                                }}
                                                onPaintClick={handleDayPaintClick}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

                {/* Ghost Card para añadir días en vistas no-micro */}
                {viewMode !== 'micro' && (
                  <div 
                    onClick={() => addWorkoutDay(getNextDayName(), activePhaseId || undefined)}
                    className={`w-full ${viewMode === 'medio' ? 'max-w-5xl' : ''} border-2 border-dashed border-slate-300 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-white hover:border-indigo-400 hover:text-indigo-600 transition-all h-[100px] mt-4 group`}
                  >
                    <div className="flex flex-col items-center gap-2 font-bold text-slate-400 group-hover:text-indigo-600">
                      <Plus size={24} className="group-hover:scale-125 transition-transform" />
                      <span className="uppercase text-xs tracking-wider">Añadir {getNextDayName()}</span>
                    </div>
                  </div>
                )}
                </>
              )}
                </>
              )}
              </div>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeDragItem ? (
                <div className="rotate-2 scale-105 shadow-2xl cursor-grabbing w-[320px] mx-auto pointer-events-none">
                  {activeDragItem.type === 'BLOCK' ? (
                    <div className="bg-slate-900 border-2 border-indigo-400 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-900/50 rounded-lg flex items-center justify-center">
                        <Layers className="text-indigo-400 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{(activeDragItem as RoutineBlock).name}</h4>
                        <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-black">Moviendo bloque...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-indigo-400 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Dumbbell className="text-indigo-600 w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{(activeDragItem as RoutineExercise).exercise?.Nombre_Oficial || 'Ejercicio'}</h4>
                        <span className="text-[10px] text-indigo-500 uppercase tracking-widest font-black">Moviendo...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {activePaletteDrag ? (
                <div className="rotate-2 scale-105 shadow-xl cursor-grabbing w-[280px] pointer-events-none">
                  <div className="bg-white border-2 border-indigo-400 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 flex items-center justify-center rounded-lg">
                      <Search className="w-4 h-4 text-indigo-400"/>
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">{activePaletteDrag.Nombre_Oficial}</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
            </div>
          </div>

        {/* Toasts de Swap Clínico */}
        <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {!isGenerating && swapsOccurred.map((swap, idx) => (
              <motion.div
                key={`swap-${idx}`}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-amber-50 border border-amber-500/50 rounded-xl p-4 shadow-lg flex gap-3 max-w-sm pointer-events-auto"
              >
                <div className="mt-0.5">
                  <ShieldCheck className="text-amber-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">AI Assist Activado</h4>
                  <p className="text-[11px] text-amber-900/80 leading-snug">
                    <strong className="font-bold">{swap.original}</strong> sustituido debido a restricción: <span className="italic">{swap.rationale}</span>. El volumen ha sido re-calculado.
                  </p>
                </div>
              </motion.div>
            ))}
            {!isGenerating && dosageWarnings && dosageWarnings.map((warning, idx) => (
              <motion.div
                key={`warn-${idx}`}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: (swapsOccurred.length + idx) * 0.1 }}
                className="bg-rose-50 border border-rose-500/50 rounded-xl p-4 shadow-lg flex gap-3 max-w-sm pointer-events-auto"
              >
                <div className="mt-0.5">
                  <Activity className="text-rose-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">Motor 80/20</h4>
                  <p className="text-[11px] text-rose-900/80 leading-snug">
                    {warning}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        </div>
        </div>
      </DndContext>

      {/* Signature Modal */}
      {isSignatureModalOpen && (
        <SignatureModal 
          onClose={() => setIsSignatureModalOpen(false)}
          onSuccess={() => setIsSignatureModalOpen(false)}
        />
      )}

      {/* Period Selector Modal */}
      <PeriodSelectorModal
        isOpen={isPeriodSelectorOpen}
        onClose={() => setIsPeriodSelectorOpen(false)}
        onSelectPeriod={(selections) => {
          selections.forEach(sel => {
            const config = getPeriodConfig(sel.id);
            const newPhaseId = addPhaseWithWeeks(config.label, sel.weeks, sel.id, sel.activeDaysPattern);
            setActivePhaseId(newPhaseId); // It will end up on the last one
          });
        }}
      />
      <ProgressionSettingsModal 
        isOpen={isProgressionModalOpen} 
        onClose={() => setIsProgressionModalOpen(false)} 
      />

      {/* Circuit Creator Modal */}
      <CircuitCreatorModal
        isOpen={isCircuitModalOpen}
        onClose={() => setIsCircuitModalOpen(false)}
        initialType={circuitModalInitialType}
        onActivateBrush={(block) => handleApplyGeneratedCircuit(block, 'BRUSH')}
        onInjectDirectly={(block) => handleApplyGeneratedCircuit(block, 'INJECT')}
      />
    </div>
  );
};

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, FileText, Dumbbell, CalendarDays, Brain, 
  Apple, MessageSquare, Play, X, Settings, UserPlus, GripVertical, ChevronDown, ChevronRight, ChevronLeft, FileSpreadsheet, Search, Plus, Trash2, Activity, Target, Clock, UploadCloud, Lock, Shield, Zap, Crown, Box, Calendar, ClipboardList, Pin, Edit3, Save, FolderOpen, Bookmark
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ProgramSettingsModal } from './ProgramSettingsModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableExerciseCard } from './SortableExerciseCard';
import { SignatureModal } from './SignatureModal';
import { ShieldCheck } from 'lucide-react';
import { NaaSWorkspace } from '../builders/DietBuilder/NaaSWorkspace';
import { useNaaSCanvasStore } from '../../stores/useNaaSCanvasStore';

import { EXERCISES_DATABASE } from '../../data/exercisesData';
import type { ExerciseTaxonomy } from '../../data/exercisesData';
import { SmartVaultPanel } from './SmartVaultPanel';
import { BodyPartVolumeTracker } from './BodyPartVolumeTracker';
import { usePeriodizationEngine } from '../../hooks/usePeriodizationEngine';
import { useWorkloadCalculator } from '../../hooks/useWorkloadCalculator';
import { PanoramicBuilder } from './PanoramicBuilder';
import { usePlanBuilderStore, type RoutineItem } from '../../stores/usePlanBuilderStore';
import { usePlanBuilderMutations } from '../../hooks/usePlanBuilderMutations';
import { GlassmorphicSoftLock as BillingSoftLock } from '../billing/GlassmorphicSoftLock';
import { GlassmorphicSoftLock as ROISoftLock } from './GlassmorphicSoftLock';

import { ExcelDropzone } from './ExcelDropzone';
import { ReconciliationPreview, type ReconciliationItem } from './ReconciliationPreview';
import { useTemplateLibraryStore } from '../../stores/useTemplateLibraryStore';

import { serializeRoutineForAPI } from '../../utils/serializers/routineSerializer';
import { emitMRVSoftCapOverride } from '../../utils/telemetry';
import { trackNaaSEvent } from '../../lib/telemetry/naasTelemetry';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { TrainingCalendar } from '../calendar/TrainingCalendar';
import { HabitPrescriberDrilldown } from '../coach/HabitPrescriberDrilldown';
import { useLocation, useNavigate } from 'react-router-dom';
import { TemplateLibrary } from '../library/TemplateLibrary';
import { AthleteDemoDashboard } from '../athlete/AthleteDemoDashboard';
import { AthleteFormModal } from './AthleteFormModal';
import { DisciplineSelectorModal } from './DisciplineSelectorModal';
import { getBuilderLabels } from '../../utils/builderDictionary';
import { PlanBuilderGuidedTour } from './PlanBuilderGuidedTour';

const mockReconciliationItems: ReconciliationItem[] = [
  { id: '1', dirtyName: 'Sentadilla Libre', matchedName: 'Sentadilla Trasera con Barra (EX_402)', confidenceScore: 95, muscleGroup: 'Piernas' },
  { id: '2', dirtyName: 'Curl Bicep', matchedName: 'Curl de Bíceps con Mancuernas (EX_201)', confidenceScore: 85, muscleGroup: 'Brazos' },
  { id: '3', dirtyName: 'Abdominales maquina', matchedName: null, confidenceScore: 40, muscleGroup: 'Core' },
];

interface EventReminder {
  type: string;
  date: string;
  time: string;
  instructions: string[];
}

const PREDEFINED_INSTRUCTIONS = [
  "Traer cinta métrica",
  "Ropa cómoda",
  "Formulario de evaluación completo",
  "Ayuno de 8h",
  "Traer estudios médicos"
];

const MESOCYCLE_TAXONOMY = [
  { id: 'hypertrophy_phase_1', label: 'Hipertrofia Fase 1' },
  { id: 'strength_max', label: 'Fuerza Max' },
  { id: 'full_body', label: 'Full Body' },
  { id: 'deload', label: 'Descarga' },
  { id: 'rehab', label: 'Rehabilitación' }
];

export const PlanBuilderCockpit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = location.state?.initialTab || 'routine';
  
  const [selectedTier, setSelectedTier] = useState<'Ignite' | 'Pro' | 'Elite' | null>(null);
  const [activeTab, setActiveTab] = useState<'routine' | 'nutrition' | 'notes' | 'import' | 'calendar' | 'habits' | 'athlete_demo'>(initialTab);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isROISoftLockOpen, setIsROISoftLockOpen] = useState(false);
  const [isPastDueLockOpen, setIsPastDueLockOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  
  const [showProgramSettings, setShowProgramSettings] = useState(false);

  const {
    cycleName, setCycleName,
    cycleTaxonomyId, setCycleTaxonomyId,
    startDate, endDate, setDates,
    days, addWorkoutDay, addRoutineItem, updateRoutineItem, removeRoutineItem,
    nutrition, setNutrition,
    hasSeenTutorial, setHasSeenTutorial,
    bulkUpdateField, duplicateRoutineItems, removeRoutineItems, reorderRoutine, revertClinicalSwap,
    phases,
    entityType, sourceTemplateId, saveTemplateChanges
  } = usePlanBuilderStore();

  const flattenedRoutine = days.flatMap(d => d.items);

  const { 
    saveProtocolMutation, 
    showSoftLock, 
    setShowSoftLock, 
    softLockDetails 
  } = usePlanBuilderMutations();

  // Load Athlete Context from the Onboarding Store
  const { identity, biometrics, goalTags, injuries, training, healthData, createdAthleteId } = useOnboardingPTStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'UPPER' | 'LOWER' | 'CORE'>('ALL');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isRoutineMenuOpen, setIsRoutineMenuOpen] = useState(false);
  const [showOtherAlergy, setShowOtherAlergy] = useState(false);
  const [otherAlergyText, setOtherAlergyText] = useState('');

  // Bulk Actions State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeDragItem, setActiveDragItem] = useState<RoutineItem | null>(null);
  const [bulkRpe, setBulkRpe] = useState('');
  const [bulkProgression, setBulkProgression] = useState('');

  const workloadMetrics = useWorkloadCalculator(flattenedRoutine);
  const { generateMesocycleProgression } = usePeriodizationEngine();
  const registerCell = () => {};

  const [eventReminder, setEventReminder] = useState<EventReminder>({
    type: 'Check-in Semanal',
    date: '',
    time: '',
    instructions: []
  });
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isMacroStrategyOpen, setIsMacroStrategyOpen] = useState(false);
  const [isPhasesOpen, setIsPhasesOpen] = useState(false);
  
  // ADKAR & Biometrics State
  const [showADKARModal, setShowADKARModal] = useState(false);
  const [modalRenderTime, setModalRenderTime] = useState<number>(0);
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(false);
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false);
  const [clinicalTarget, setClinicalTarget] = useState<'Déficit' | 'Mantenimiento' | 'Superávit'>('Mantenimiento');
  const [clinicalData, setClinicalData] = useState({
      gender: biometrics?.gender || 'M',
      weight: biometrics?.weight?.toString() || '80',
      height: biometrics?.height?.toString() || '180',
      age: biometrics?.age?.toString() || '30',
      activityLevel: training?.days_per_week ? (
          training.days_per_week >= 5 ? '1.725' :
          training.days_per_week >= 3 ? '1.55' : '1.375'
      ) : '1.2'
  });

  useEffect(() => {
    // Show ADKAR Modal only on the first visit to the Builder (V2_CLEAN)
    const hasSeenModal = localStorage.getItem('v2_clean_modal_seen');
    if (!hasSeenModal) {
      setShowADKARModal(true);
      setModalRenderTime(Date.now());
      setIsBiometricsOpen(true); // Open the accordion by default the first time to show the new location
      trackNaaSEvent('modal_v2_viewed');
    }
    
    // Show Discipline Modal for new visitors OR if they just created a new client
    const hasSeenDiscipline = localStorage.getItem('v2_discipline_selected');
    if (!hasSeenDiscipline || location.state?.isNewClient) {
      setIsDisciplineModalOpen(true);
      if (!hasSeenDiscipline) {
        localStorage.setItem('v2_discipline_selected', 'true');
      }
    }
  }, [location.state?.isNewClient]);

  const handleADKARClick = () => {
    const timeToClick = Date.now() - modalRenderTime;
    localStorage.setItem('v2_clean_modal_seen', 'true');
    setShowADKARModal(false);
    trackNaaSEvent('modal_v2_cta_clicked', { time_to_click_ms: timeToClick });
  };

  const calculateClinicalCalories = useCallback(() => {
      const weight = parseFloat(clinicalData.weight) || 80;
      const height = parseFloat(clinicalData.height) || 180;
      const age = parseFloat(clinicalData.age) || 30;
      const pal = parseFloat(clinicalData.activityLevel) || 1.2;

      let bmr = clinicalData.gender === 'M' 
          ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
          : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);

      let der = bmr * pal;
      if (clinicalTarget === 'Déficit') der -= 500;
      if (clinicalTarget === 'Superávit') der += 500;

      const newKcal = Math.round(der);
      
      const protein_g = Math.round((newKcal * 0.3) / 4);
      const carbs_g = Math.round((newKcal * 0.45) / 4);
      const fat_g = Math.round((newKcal * 0.25) / 9);

      // En el MVP actualizamos el state global the NaaSCanvas o simplemente confiamos en el render.
      // Ya que en NaaSWorkspace initNewPlan crea un borrador, pasaremos estos macros como prop o los inyectaremos.
      useNaaSCanvasStore.getState().initNewPlan('tenant-1', 'client-1', 'prof-1', { protein_g, carbs_g, fat_g, calories: newKcal });
  }, [clinicalData, clinicalTarget]);

  const toggleInstruction = (instruction: string) => {
    setEventReminder(prev => ({
      ...prev,
      instructions: prev.instructions.includes(instruction)
        ? prev.instructions.filter(i => i !== instruction)
        : [...prev.instructions, instruction]
    }));
  };

  // US-001: Data Layer GA4 para navegación de pestañas
  useEffect(() => {
    console.log(`[GA4 Event] view_builder_tab: tab_name=${activeTab}`);
  }, [activeTab]);

  const [activeSearchDayId, setActiveSearchDayId] = useState<string | null>(null);

  // Asignar Plan State-Aware Logic
  const isRoutineValid = days.length > 0 && days.some(d => d.items && d.items.length > 0);
  const [showAssignTooltip, setShowAssignTooltip] = useState(false);

  useEffect(() => {
    if (showAssignTooltip) {
      const timer = setTimeout(() => setShowAssignTooltip(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showAssignTooltip]);

  useEffect(() => {
    // Hide tooltip automatically when user starts interacting with the canvas
    if (isRoutineValid && showAssignTooltip) {
      setShowAssignTooltip(false);
    }
  }, [isRoutineValid, showAssignTooltip]);

  useEffect(() => {
    const handleGlobalSave = () => {
      // Find the save button and click it to trigger validation and save flow
      const saveBtn = document.getElementById('global-save-btn');
      if (saveBtn) saveBtn.click();
    };
    window.addEventListener('trigger-plan-save', handleGlobalSave);
    return () => window.removeEventListener('trigger-plan-save', handleGlobalSave);
  }, []);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showDates, setShowDates] = useState(true);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle form modal on Ctrl+F
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFormModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const COMMON_ALLERGIES = [
    'SIBO', 'Low-FODMAP', 'Vegano', 'Vegetariano', 'Celíaco', 'Alergia al Maní', 'Intolerancia a la Lactosa', 'SOP', 'Resistencia a la Insulina'
  ];

  const handleAllergyToggle = (allergy: string) => {
    let current = nutrition.clinicalFirewall ? nutrition.clinicalFirewall.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    // Retrocompatibilidad: Si hay strings que no están en COMMON_ALLERGIES ni es "Otro", lo mantenemos
    
    if (current.includes(allergy)) {
      current = current.filter(a => a !== allergy);
      if (allergy === 'Otro') {
        setShowOtherAlergy(false);
        setOtherAlergyText('');
      }
    } else {
      current.push(allergy);
      if (allergy === 'Otro') setShowOtherAlergy(true);
    }
    setNutrition({ ...nutrition, clinicalFirewall: current.join(', ') });
  };

  // Sincronizar el texto libre de "Otro" con el estado global
  const handleOtherTextChange = (text: string) => {
    setOtherAlergyText(text);
    let current = nutrition.clinicalFirewall ? nutrition.clinicalFirewall.split(',').map(s => s.trim()).filter(Boolean) : [];
    // Remover cualquier texto custom previo (que no esté en COMMON_ALLERGIES ni sea "Otro")
    current = current.filter(a => COMMON_ALLERGIES.includes(a) || a === 'Otro');
    if (text) current.push(`Custom: ${text}`);
    setNutrition({ ...nutrition, clinicalFirewall: current.join(', ') });
    
    // Telemetry ping asíncrono
    if (text.length > 3) {
      // Simulate telemetry
      console.log("[Telemetry] Custom allergy registered:", text);
    }
  };

  const currentAllergies = nutrition.clinicalFirewall ? nutrition.clinicalFirewall.split(',').map(s => s.trim()).filter(Boolean) : [];
  const hasCustomAlergy = currentAllergies.some(a => a.startsWith('Custom: '));
  // Si hay alguna custom (que viene de base de datos) o showOtherAlergy es true
  const isOtroActive = showOtherAlergy || hasCustomAlergy;

  const searchResults = EXERCISES_DATABASE.filter(ex => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (ex.Nombre_Oficial || '').toLowerCase().includes(query) || 
      (ex.Alias_Buscador || '').toLowerCase().includes(query) ||
      (ex.Musculo_Agonista || '').toLowerCase().includes(query);

    if (!matchesSearch && searchQuery.length > 0) return false;

    if (categoryFilter === 'ALL') return matchesSearch || searchQuery.length === 0;

    const patron = (ex.Patron_Movimiento || '').toLowerCase();
    const musculo = (ex.Musculo_Agonista || '').toLowerCase();

    if (categoryFilter === 'UPPER') {
      return patron.includes('empuje') || patron.includes('tirón') || musculo.includes('pectoral') || musculo.includes('dorsal') || musculo.includes('deltoides') || musculo.includes('bíceps') || musculo.includes('tríceps');
    }
    if (categoryFilter === 'LOWER') {
      return patron.includes('rodilla') || patron.includes('cadera') || patron.includes('zancada') || patron.includes('lunge') || musculo.includes('cuádriceps') || musculo.includes('glúteo') || musculo.includes('isquiosurales') || musculo.includes('gemelo') || musculo.includes('pantorrilla');
    }
    if (categoryFilter === 'CORE') {
      return patron.includes('core') || musculo.includes('abdominal') || musculo.includes('oblicuo');
    }
    return true;
  }).slice(0, 15);

  const handleAddExercise = (exercise: ExerciseTaxonomy) => {
    let targetDayId = activeSearchDayId;
    if (!targetDayId) {
      if (days.length === 0) {
        alert("Primero añade un Día de entrenamiento.");
        return;
      }
      targetDayId = days[days.length - 1].id;
    }
    
    addRoutineItem(targetDayId, {
      id: Math.random().toString(36).substr(2, 9),
      type: 'EXERCISE',
      exercise,
      sets: '',
      reps: '',
      weight: '',
      rpe: '',
      videoUrl: exercise.Url_Video_Youtube || '',
      progression: ''
    });
    setSearchQuery('');
    setIsSearching(false);
    setActiveSearchDayId(null);
  };

  const handleSaveProtocol = () => {
    // Guardarraíl: verificar que existe un atleta real antes de disparar la mutación
    if (!createdAthleteId) {
      return;
    }
    if (identity?.payment_status === 'PAST_DUE') {
      usePlanBuilderStore.getState().setSyncStatus('PAUSED');
      setIsPastDueLockOpen(true);
      return;
    }

    // Guardarraíl Clínico: Confirmación Final
    if (injuries && injuries.length > 0) {
      const allExercises = days.flatMap(day => day.items.map(i => i.exercise).filter(Boolean));
      
      const hasConflict = allExercises.some(exercise => {
        if (!exercise) return false;
        const exStr = `${exercise.Nombre_Oficial} ${exercise.Musculo_Agonista} ${exercise.Categoria || ''}`.toLowerCase();
        const isLowerBody = !!exStr.match(/cuádriceps|isquio|glúteo|gemelo|sóleo|pierna|sentadilla|prensa/i);
        const isUpperBody = !!exStr.match(/pectoral|dorsal|deltoides|bíceps|tríceps|trapecio|press|dominada|remo|brazo/i);
        
        return injuries.some((inj: any) => {
          const zoneStr = (inj.zone || '').toLowerCase();
          const jointStr = (inj.joint || '').toLowerCase();
          if (zoneStr.includes('inferior') && isLowerBody) return true;
          if (zoneStr.includes('superior') && isUpperBody) return true;
          if (jointStr && exStr.includes(jointStr)) return true;
          if (zoneStr.includes('lumbar') && exStr.match(/sentadilla|peso muerto/i)) return true;
          return false;
        });
      });

      if (hasConflict) {
        const proceed = window.confirm("⚠️ ADVERTENCIA CLÍNICA\n\nEl plan actual contiene ejercicios que podrían afectar las lesiones reportadas por el atleta.\n\n¿Estás seguro de que deseas asignar este plan y que has adaptado la carga o el Rango de Movimiento (ROM) correspondientemente?");
        if (!proceed) return;
      }
    }

    // Abre el ROI visual en lugar de disparar la mutación de inmediato.
    // La mutación podría dispararse desde adentro del modal o al cerrarlo.
    setIsROISoftLockOpen(true);
  };



  const handleGenerateProgression = () => {
    if (flattenedRoutine.length === 0) {
      alert("Añade ejercicios antes de generar la progresión.");
      return;
    }
    try {
      const updatedDays = days.map(day => ({
        ...day,
        items: day.items.map(item => {
          if (item.type === 'EXERCISE') {
            return { ...item, progression: "Autopilot Activo: Mesociclo Generado" };
          }
          return item;
        })
      }));
      // @ts-ignore
      setDays(updatedDays);
      setIsGenerated(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSelect = useCallback((id: string, isShiftMode: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Evita triggers al hacer clic en los inputs
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    const item = flattenedRoutine.find(r => r.id === active.id);
    if (item) setActiveDragItem(item);
  };

  const handleDragEnd = (dayId: string, event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderRoutine(dayId, active.id as string, over.id as string);
    }
  };

  const renderRoutineBuilder = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Planificación</h2>
        <button 
          onClick={() => setShowProgramSettings(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
        >
          <Settings className="w-4 h-4" /> Configuración
        </button>
      </div>
      
      {/* Category Filters */}
      <div className="flex gap-2 mb-2 z-20 relative overflow-x-auto pb-1">
        <button 
          onClick={() => { setCategoryFilter('ALL'); setIsSearching(true); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap ${categoryFilter === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => { setCategoryFilter('UPPER'); setIsSearching(true); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap ${categoryFilter === 'UPPER' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Tren Superior
        </button>
        <button 
          onClick={() => { setCategoryFilter('LOWER'); setIsSearching(true); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap ${categoryFilter === 'LOWER' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Tren Inferior
        </button>
        <button 
          onClick={() => { setCategoryFilter('CORE'); setIsSearching(true); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap ${categoryFilter === 'CORE' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          Core
        </button>
      </div>

      {/* Search Module */}
      <div className="relative z-20 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar en +300 ejercicios (ej. Sentadilla Búlgara) o usa Ctrl+K..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearching(e.target.value.length > 0);
            }}
            onFocus={() => { if(searchQuery.length > 0) setIsSearching(true); }}
            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none text-slate-700 font-medium transition-all bg-white shadow-sm"
          />
            <AnimatePresence>
              {isSearching && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-80 overflow-y-auto z-50"
                >
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map(ex => (
                        <div 
                          key={ex.ID_Ejercicio}
                          onClick={() => handleAddExercise(ex)}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group"
                        >
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{ex.Nombre_Oficial}</h4>
                            <p className="text-xs text-slate-500 font-lato">{ex.Patron_Movimiento} • {ex.Musculo_Agonista}</p>
                          </div>
                          <button className="text-indigo-600 bg-indigo-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">No se encontraron ejercicios en la base de datos</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
        </div>
        <button 
          onClick={handleGenerateProgression}
          disabled={flattenedRoutine.length === 0 || isGenerated}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold px-6 py-4 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <Zap className="w-5 h-5" /> {isGenerated ? 'Mesociclo Generado' : 'Generar Progresión'}
        </button>
      </div>

      {/* Estrategia de Volumen por Zona Corporal */}
      <BodyPartVolumeTracker routine={flattenedRoutine} />

      {/* Days List */}
      <div className="space-y-6 relative z-10">
        {days.map(day => (
          <div key={day.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-black text-slate-800 font-montserrat tracking-tight">{day.name}</h3>
              <button 
                onClick={() => {
                  setActiveSearchDayId(day.id);
                  // Opcional: enfocar el input de búsqueda
                  const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.focus();
                  }
                }}
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors border ${activeSearchDayId === day.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}
              >
                + Añadir Ejercicio
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={(e) => handleDragEnd(day.id, e)}
              >
                <SortableContext 
                  items={day.items.map(r => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {day.items.map((item, index) => (
                      <SortableExerciseCard 
                        key={item.id}
                        item={item}
                        index={index}
                        isSelected={selectedIds.has(item.id)}
                        onToggleSelect={handleToggleSelect}
                        updateRoutineItem={(id, field, value) => updateRoutineItem(day.id, id, field, value)}
                        removeRoutineItem={(id) => removeRoutineItem(day.id, id)}
                        revertClinicalSwap={(id) => revertClinicalSwap(day.id, id)}
                        registerCell={registerCell}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeDragItem && day.items.find(i => i.id === activeDragItem.id) ? (
                    <SortableExerciseCard 
                      item={activeDragItem}
                      index={day.items.findIndex(r => r.id === activeDragItem.id)}
                      isSelected={selectedIds.has(activeDragItem.id)}
                      onToggleSelect={() => {}}
                      updateRoutineItem={() => {}}
                      removeRoutineItem={() => {}}
                      revertClinicalSwap={() => {}}
                      registerCell={registerCell}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
              
              {day.items.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <p className="text-slate-400 font-lato text-sm">Este día está vacío. Añade un ejercicio o márcalo como día de descanso.</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {days.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
            <Dumbbell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-lato mb-4">El macrociclo está vacío. Añade un día para comenzar.</p>
            <button 
              onClick={() => addWorkoutDay(`Día 1`)}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
            >
              Crear Día 1
            </button>
          </div>
        )}
        
        {days.length > 0 && (
          <button 
            onClick={() => addWorkoutDay(`Día ${days.length + 1}`)}
            className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            + Añadir Nuevo Día
          </button>
        )}
      </div>
    </div>
  );

  const renderNutrition = () => (
    <div className="w-full">
      <NaaSWorkspace />
    </div>
  );

  const renderNotes = () => (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button 
        onClick={() => setIsEventsOpen(!isEventsOpen)}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <h3 className="font-black text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-sky-500" /> Agenda Interactiva y Videollamadas
        </h3>
        <div className={`p-2 rounded-full transition-transform duration-300 ${isEventsOpen ? 'rotate-180 bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      
      <AnimatePresence>
        {isEventsOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 overflow-hidden"
          >
            <div className="p-6 pt-4">
              {selectedTier === 'Ignite' ? (
                <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Lock size={24} />
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1">Nivel Ignite Activo</h4>
                  <p className="text-sm text-slate-500 mb-4 max-w-sm">
                    Hemos desactivado las videollamadas en este plan para proteger tu tiempo libre y asegurar que tu esfuerzo coincida con el servicio contratado. ¿Tu cliente necesita seguimiento en vivo?
                  </p>
                  <button 
                    onClick={() => setSelectedTier('Elite')}
                    className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Crown size={14} /> Actualizar a Elite
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tipo de Evento</label>
                      <select 
                        value={eventReminder.type} 
                        onChange={e => setEventReminder({...eventReminder, type: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option>Check-in Semanal</option>
                        <option>Videollamada Kick-off</option>
                        <option>Revisión de Técnica</option>
                        <option>Toma de Medidas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha</label>
                      <input type="date" value={eventReminder.date} onChange={e => setEventReminder({...eventReminder, date: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Hora</label>
                      <input type="time" value={eventReminder.time} onChange={e => setEventReminder({...eventReminder, time: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Instrucciones Adicionales</label>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_INSTRUCTIONS.map(instruction => {
                        const isActive = eventReminder.instructions.includes(instruction);
                        return (
                          <button
                            key={instruction}
                            onClick={() => toggleInstruction(instruction)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                              isActive 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {instruction}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 py-3 bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Agregar Evento al Calendario
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-50 text-slate-900 overflow-y-auto font-sans z-[9999]" onClick={() => isSearching && setIsSearching(false)}>
      <BillingSoftLock 
        isOpen={showSoftLock || isPastDueLockOpen} 
        onClose={() => { setShowSoftLock(false); setIsPastDueLockOpen(false); }} 
        triggerLocation={isPastDueLockOpen ? 'past_due' : (activeTab === 'notes' ? 'events_tab' : activeTab === 'nutrition' ? 'nutrition_tab' : 'routine_canvas')}
        details={softLockDetails}
        onUpgradeSuccess={() => { if (!isPastDueLockOpen) handleSaveProtocol(); }}
      />
      <DisciplineSelectorModal isOpen={isDisciplineModalOpen} onClose={() => setIsDisciplineModalOpen(false)} />
      
      <div className={`mx-auto py-4 px-4 relative transition-all duration-300 w-full max-w-full md:px-6 ${saveProtocolMutation.isPending ? 'pointer-events-none opacity-60 grayscale-[0.2]' : ''}`}>
          
          {/* Patient Summary Banner / Template Mode Header */}
          <div data-tour-step="athlete-header" className="mb-4 bg-slate-900 rounded-2xl p-4 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6">
            {entityType === 'TEMPLATE' ? (
              <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                <button 
                  onClick={() => navigate('/library')} 
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0 flex items-center gap-1.5"
                  title="Volver a la Biblioteca de Planes"
                >
                  <ChevronLeft size={18} />
                  <span className="text-xs font-bold hidden sm:inline">Biblioteca</span>
                </button>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner shrink-0 text-white">
                  ⚡
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">
                      MODO EDICIÓN DE PLANTILLA
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 size={11} /> Trazabilidad Activa
                    </span>
                  </div>
                  <h3 className="font-black text-lg leading-tight text-white truncate mt-1">
                    {cycleName || 'Plantilla de Entrenamiento'}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                <button 
                  onClick={() => {
                    if (createdAthleteId) {
                      navigate(`/trainer/athlete/${createdAthleteId}`);
                    } else {
                      navigate('/dashboard');
                    }
                  }} 
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
                  title="Volver al Perfil"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-black text-xl shadow-inner shrink-0">
                  {identity?.first_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg leading-tight flex items-center gap-2 text-white truncate">
                    <span className="truncate">{identity?.first_name || 'Nuevo Atleta'} {identity?.last_name || ''}</span>
                    {identity?.payment_status === 'PAST_DUE' ? (
                      <button onClick={() => useOnboardingPTStore.getState().setIdentity({ payment_status: 'ACTIVE' })} className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-black tracking-widest transition-colors hover:bg-amber-500/40 cursor-pointer shrink-0">
                        PAST DUE
                      </button>
                    ) : (
                      <button onClick={() => useOnboardingPTStore.getState().setIdentity({ payment_status: 'PAST_DUE' })} className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black tracking-widest transition-colors hover:bg-emerald-500/40 cursor-pointer shrink-0">
                        ACTIVE
                      </button>
                    )}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    {biometrics?.age ? `${biometrics.age} años` : ''} 
                    {biometrics?.gender === 'M' || biometrics?.gender === 'male' ? ' • Hombre' : biometrics?.gender === 'F' || biometrics?.gender === 'female' ? ' • Mujer' : ''}
                    {biometrics?.weight ? ` • ${biometrics.weight}kg` : ''} 
                    {biometrics?.height ? ` • ${biometrics.height}cm` : ''}
                  </p>
                </div>
              </div>
            )}
            
            {/* Telemetry Stats */}
            {entityType === 'TEMPLATE' ? (
              <div data-tour-step="athlete-badges" className="flex items-center gap-6 md:gap-8 text-sm flex-1 justify-between md:justify-center border-y md:border-y-0 md:border-x border-slate-800 py-4 md:py-0 px-2 md:px-8 w-full md:w-auto overflow-x-auto no-scrollbar">
                <div className="flex flex-col shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Estructura</span>
                  <span className="text-indigo-300 font-bold">{phases.length || 1} Fase(s)</span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                <div className="flex flex-col shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Días / Sesiones</span>
                  <span className="text-slate-200 font-bold">{days.length} Días</span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                <div className="flex flex-col shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Ejercicios Totales</span>
                  <span className="text-slate-200 font-bold">{flattenedRoutine.length} Ejercicios</span>
                </div>
              </div>
            ) : (
              <div data-tour-step="athlete-badges" className="flex items-center gap-6 md:gap-8 text-sm flex-1 justify-between md:justify-center border-y md:border-y-0 md:border-x border-slate-800 py-4 md:py-0 px-2 md:px-8 w-full md:w-auto overflow-x-auto no-scrollbar">
                <div className="flex flex-col shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Objetivo</span>
                  <span className="text-indigo-300 font-bold">
                    {(() => {
                      const raw = goalTags?.[0];
                      if (!raw) return 'No definido';
                      const norm = raw.toUpperCase().replace(/ /g, '_');
                      const dict: Record<string, string> = {
                        HIPERTROFIA: 'Hipertrofia', STRENGTH: 'Fuerza', FAT_LOSS: 'Pérdida de Grasa', ENDURANCE: 'Resistencia',
                        REHAB_LONGEVITY: 'Salud', HIGH_PERFORMANCE: 'Rendimiento', BODY_RECOMP: 'Recomposición',
                        VITALITY_MAINTENANCE: 'Vitalidad', SPORT_AGILITY: 'Agilidad', BODY_FAT_LOSS: 'Pérdida de Grasa',
                        BODY_MUSCLE_GAIN: 'Hipertrofia', BODY_HEALTH: 'Salud'
                      };
                      return dict[norm] || raw;
                    })()}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                <div className="flex flex-col shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Nivel</span>
                  <span className="text-slate-200 font-bold">
                    {(() => {
                      const lvlRaw = healthData?.experienceLevel || training?.experience_level;
                      if (typeof lvlRaw === 'number') {
                        return {1: 'Principiante', 2: 'Novato', 3: 'Intermedio', 4: 'Avanzado', 5: 'Experto'}[lvlRaw] || 'Principiante';
                      }
                      if (lvlRaw === 'BEGINNER') return 'Principiante';
                      if (lvlRaw === 'INTERMEDIATE') return 'Intermedio';
                      if (lvlRaw === 'ADVANCED') return 'Avanzado';
                      return 'Principiante';
                    })()}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                <div className="flex flex-col shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider mb-0.5">Frecuencia</span>
                  <span className="text-slate-200 font-bold">{training?.days_per_week ? `${training.days_per_week} Días/Sem` : '-'}</span>
                </div>
                {injuries && injuries.length > 0 && (
                  <>
                    <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                    <div className="flex flex-col shrink-0">
                      <span className="text-[10px] text-rose-500/70 uppercase font-black tracking-wider mb-0.5 flex items-center gap-1"><Activity size={10} /> Precaución</span>
                      <span className="text-rose-400 font-bold text-xs">{injuries.length} Lesiones Activas</span>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
              {entityType === 'TEMPLATE' ? (
                <>
                  <button 
                    onClick={() => {
                      saveTemplateChanges();
                      toast.success(`Plantilla "${cycleName}" guardada con éxito en la biblioteca`, { icon: '💾' });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all h-[42px] cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> <span>Guardar en Plantilla</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsFormModalOpen(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors h-[42px] cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" /> <span className="hidden sm:inline">Asignar a Atleta</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    data-tour-step="athlete-form-btn"
                    onClick={() => setIsFormModalOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors h-[42px]"
                  >
                    <ClipboardList className="w-4 h-4" /> <span className="hidden md:inline">Ver Ficha</span>
                  </button>
                  
                  {/* Asignar Plan Top-Nav Button */}
                  <div className="relative" data-tour-step="assign-btn">
                    <button 
                      id="top-nav-save-btn"
                      onClick={(e) => {
                        if (!isRoutineValid) {
                          e.preventDefault();
                          setShowAssignTooltip(true);
                          return;
                        }
                        let finalName = cycleName;
                        if (!finalName || finalName.trim() === '') {
                          const inputName = window.prompt("Por favor, ingresa un nombre para este plan de entrenamiento antes de guardarlo:");
                          if (!inputName || inputName.trim() === '') return;
                          finalName = inputName;
                          setCycleName(finalName);
                        }
                        handleSaveProtocol();
                      }}
                      disabled={saveProtocolMutation.isPending}
                      className={`
                        py-2.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 h-[42px] relative overflow-hidden font-montserrat
                        ${isRoutineValid 
                          ? 'bg-lime-500 hover:bg-lime-400 text-slate-900 font-black shadow-[0_0_15px_rgba(163,230,53,0.3)] hover:scale-105 active:scale-95' 
                          : 'bg-slate-800/40 text-slate-500 border border-slate-700/30 font-bold opacity-50 hover:bg-slate-800/60'
                        }
                        ${saveProtocolMutation.isPending ? 'opacity-50 pointer-events-none' : ''}
                      `}
                    >
                      {/* Shimmer Effect */}
                      {isRoutineValid && (
                        <motion.div 
                          initial={{ left: '-100%' }}
                          animate={{ left: '200%' }}
                          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                          className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
                        />
                      )}

                      {saveProtocolMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                      ) : (
                        <Zap className={`w-4 h-4 ${isRoutineValid ? 'text-slate-900' : 'text-slate-500'}`} />
                      )}
                      {saveProtocolMutation.isPending ? 'Guardando...' : 'Asignar Plan'}
                    </button>

                    {/* Magnetic Tooltip */}
                    {/* Magnetic Tooltip */}
                    <AnimatePresence>
                      {showAssignTooltip && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-3 w-64 bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 z-50 pointer-events-auto flex flex-col gap-1"
                        >
                          <div className="absolute -top-1.5 right-6 w-3 h-3 bg-slate-900 border-t border-l border-slate-700 transform rotate-45"></div>
                          <p className="font-lato text-xs text-slate-200 leading-relaxed text-center">
                            Tu nuevo centro de control.<br/>Guarda y asigna desde aquí.
                          </p>
                          {!isRoutineValid && (
                            <div className="font-lato text-[10px] text-amber-400/90 font-bold leading-relaxed text-center mt-1 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                              Termina de armar tu rutina para activar la asignación.
                              <div className="mt-1.5">
                                <button 
                                  onClick={() => {
                                    setShowAssignTooltip(false);
                                    if (days.length === 0) {
                                      addWorkoutDay('Día 1');
                                    }
                                    // Ensure library tab is active to drag exercises
                                    setActiveTab('import');
                                  }}
                                  className="text-amber-300 underline decoration-amber-500/50 hover:text-amber-200 cursor-pointer transition-colors"
                                >
                                  Empezar a armar Día 1 →
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Sidebar Tabs (Colapsable / Expandible) */}
            <div 
              data-tour-step="tab-bar" 
              className={`flex-shrink-0 flex flex-col space-y-2 bg-white rounded-2xl p-3 shadow-md border border-slate-100 transition-all duration-300 ${
                isSidebarCollapsed ? 'w-full md:w-20 items-center' : 'w-full md:w-60'
              }`}
            >
              {/* Header con botón para colapsar/expandir */}
              <div className={`flex items-center pb-2 border-b border-slate-100 ${isSidebarCollapsed ? 'justify-center w-full' : 'justify-between px-2 w-full'}`}>
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-montserrat">
                    Módulos
                  </span>
                )}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center"
                  title={isSidebarCollapsed ? "Expandir panel de módulos" : "Achicar panel de módulos"}
                >
                  {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
              </div>

              {/* Tab: Biblioteca */}
              <button 
                onClick={() => setActiveTab('import')}
                title="Biblioteca de Ejercicios y Recetas"
                className={`rounded-xl font-medium font-montserrat text-sm transition-all duration-200 flex items-center ${
                  isSidebarCollapsed 
                    ? 'w-12 h-12 justify-center p-0' 
                    : 'w-full py-2.5 px-3.5 gap-3'
                } ${
                  activeTab === 'import' 
                    ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className={`w-5 h-5 flex-shrink-0 ${activeTab === 'import' ? 'text-indigo-600' : 'text-slate-400'}`} /> 
                {!isSidebarCollapsed && <span>Biblioteca</span>}
              </button>

              {/* Tab: Rutina */}
              <button 
                onClick={() => setActiveTab('routine')}
                title="Diseñador de Rutina y Entrenamiento"
                className={`rounded-xl font-medium font-montserrat text-sm transition-all duration-200 flex items-center ${
                  isSidebarCollapsed 
                    ? 'w-12 h-12 justify-center p-0' 
                    : 'w-full py-2.5 px-3.5 gap-3'
                } ${
                  activeTab === 'routine' 
                    ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Dumbbell className={`w-5 h-5 flex-shrink-0 ${activeTab === 'routine' ? 'text-indigo-600' : 'text-slate-400'}`} /> 
                {!isSidebarCollapsed && <span>Rutina</span>}
              </button>

              {/* Tab: Nutrición */}
              <button 
                onClick={() => setActiveTab('nutrition')}
                title="Constructor Nutricional NaaS"
                className={`rounded-xl font-medium font-montserrat text-sm transition-all duration-200 flex items-center ${
                  isSidebarCollapsed 
                    ? 'w-12 h-12 justify-center p-0' 
                    : 'w-full py-2.5 px-3.5 gap-3'
                } ${
                  activeTab === 'nutrition' 
                    ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Apple className={`w-5 h-5 flex-shrink-0 ${activeTab === 'nutrition' ? 'text-indigo-600' : 'text-slate-400'}`} /> 
                {!isSidebarCollapsed && <span>Nutrición</span>}
              </button>

              {/* Tab: Hábitos */}
              <button 
                onClick={() => setActiveTab('habits')}
                title="Prescriptor de Hábitos y Adherencia"
                className={`rounded-xl font-medium font-montserrat text-sm transition-all duration-200 flex items-center ${
                  isSidebarCollapsed 
                    ? 'w-12 h-12 justify-center p-0' 
                    : 'w-full py-2.5 px-3.5 gap-3'
                } ${
                  activeTab === 'habits' 
                    ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Brain className={`w-5 h-5 flex-shrink-0 ${activeTab === 'habits' ? 'text-indigo-600' : 'text-slate-400'}`} /> 
                {!isSidebarCollapsed && <span>Hábitos</span>}
              </button>

              {/* Tab: Calendario */}
              <button 
                onClick={() => setActiveTab('calendar')}
                title="Calendario de Sesiones"
                className={`rounded-xl font-medium font-montserrat text-sm transition-all duration-200 flex items-center ${
                  isSidebarCollapsed 
                    ? 'w-12 h-12 justify-center p-0' 
                    : 'w-full py-2.5 px-3.5 gap-3'
                } ${
                  activeTab === 'calendar' 
                    ? 'bg-indigo-50 text-indigo-900 border-l-4 border-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <CalendarDays className={`w-5 h-5 flex-shrink-0 ${activeTab === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`} /> 
                {!isSidebarCollapsed && <span>Calendario</span>}
              </button>

              <div className="w-full h-px bg-slate-100 my-1.5" />

              {/* Tab: App Atleta Demo */}
              <button 
                onClick={() => setActiveTab('athlete_demo')}
                title="Vista Previa de la App del Atleta"
                className={`rounded-xl font-black font-montserrat text-sm transition-all duration-200 flex items-center border-2 ${
                  isSidebarCollapsed 
                    ? 'w-12 h-12 justify-center p-0' 
                    : 'w-full py-2.5 px-3.5 gap-3'
                } ${
                  activeTab === 'athlete_demo' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${activeTab === 'athlete_demo' ? 'text-white' : 'text-indigo-500'}`} /> 
                {!isSidebarCollapsed && <span>App Atleta</span>}
              </button>
            </div>

            {/* Onboarding Dimming Overlay */}
            {!(showADKARModal || isDisciplineModalOpen || isBiometricsOpen) && (
              <PlanBuilderGuidedTour />
            )}

            {/* Content Area */}
            <div className="flex-1 w-full flex flex-col bg-transparent md:bg-white md:rounded-3xl md:shadow-md md:p-6 md:border md:border-slate-100 min-h-[calc(100vh-180px)]">
            {activeTab === 'import' && <TemplateLibrary 
              onSwitchToRoutine={() => setActiveTab('routine')} 
              onSwitchToNutrition={() => setActiveTab('nutrition')} 
            />}
            {activeTab === 'routine' && <PanoramicBuilder 
              onOpenForm={() => setIsFormModalOpen(true)} 
              headerContent={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full transition-all pb-4">
                  <div className="flex-1 w-full max-w-lg">
                    <div className={`group flex flex-col w-full border-b transition-colors pb-1 cursor-text ${phases.length > 0 ? 'border-transparent hover:border-slate-200 focus-within:border-indigo-500' : 'border-transparent focus-within:border-indigo-400'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="Añadir Título del Plan..."
                          value={cycleName}
                          onChange={(e) => {
                            setCycleName(e.target.value);
                            setCycleTaxonomyId(null);
                          }}
                          className={`text-slate-900 bg-transparent outline-none placeholder:text-slate-400 transition-all duration-300 focus:w-full font-montserrat ${phases.length > 0 ? 'w-full text-xl md:text-3xl font-black' : 'w-48 text-lg font-bold text-slate-500 focus:text-slate-800 focus:text-xl'}`}
                        />
                        <Edit3 className={`w-5 h-5 transition-opacity ${phases.length > 0 ? 'text-slate-300 opacity-0 group-hover:opacity-100' : 'text-slate-400 opacity-50 group-hover:opacity-100'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-3">
                    <button 
                      onClick={() => setIsFormModalOpen(true)}
                      className="w-full md:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-3 border border-indigo-200 shadow-sm group text-sm"
                      title="Abrir Ficha del Atleta (Ctrl + F)"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> 
                        <span>Ficha del Atleta</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-0.5 bg-white/60 text-indigo-500 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest border border-indigo-200 shadow-sm group-hover:bg-white transition-colors">
                        <kbd>CTRL</kbd><span className="opacity-50">+</span><kbd>F</kbd>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => document.getElementById('smart-vault-panel')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm whitespace-nowrap text-sm"
                    >
                      <UploadCloud className="w-4 h-4 text-indigo-500" /> Cargar Plantilla
                    </button>
                    
                    <button 
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="w-full md:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-200 shadow-sm whitespace-nowrap text-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Guardar Plantilla
                    </button>
                  </div>
                </div>
              }
            />}
            {activeTab === 'nutrition' && renderNutrition()}
            {activeTab === 'habits' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <HabitPrescriberDrilldown />
              </div>
            )}
            {activeTab === 'calendar' && (
              <div className="flex flex-col gap-10">
                {renderNotes()}
                <TrainingCalendar />
              </div>
            )}
            {activeTab === 'athlete_demo' && (
              <div className="max-w-3xl mx-auto w-full pt-4">
                <AthleteDemoDashboard />
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Bar for Bulk Actions */}
        <AnimatePresence>
          {selectedIds.size > 0 && activeTab === 'routine' && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 rounded-2xl shadow-2xl p-4 flex items-center gap-4 z-50 border border-slate-700"
            >
              <div className="bg-indigo-600 text-white font-black px-3 py-1.5 rounded-lg text-sm">
                {selectedIds.size} seleccionados
              </div>
              
              <div className="h-8 w-px bg-slate-700 mx-2"></div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="@RPE"
                  value={bulkRpe}
                  onChange={e => setBulkRpe(e.target.value)}
                  className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-500"
                />
                <button 
                  onClick={() => {
                    bulkUpdateField(Array.from(selectedIds), 'rpe', bulkRpe);
                    setSelectedIds(new Set());
                    setBulkRpe('');
                  }}
                  disabled={!bulkRpe}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors text-sm font-bold"
                >
                  Aplicar RPE
                </button>
              </div>

              <div className="flex items-center gap-2 ml-2">
                <input 
                  type="text" 
                  placeholder="+%"
                  value={bulkProgression}
                  onChange={e => setBulkProgression(e.target.value)}
                  className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none placeholder:text-slate-500"
                />
                <button 
                  onClick={() => {
                    bulkUpdateField(Array.from(selectedIds), 'progression', bulkProgression);
                    setSelectedIds(new Set());
                    setBulkProgression('');
                  }}
                  disabled={!bulkProgression}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors text-sm font-bold"
                >
                  Aplicar Progresión
                </button>
              </div>

              <div className="h-8 w-px bg-slate-700 mx-2"></div>

              <button 
                onClick={() => {
                  duplicateRoutineItems(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold"
              >
                <Box className="w-4 h-4" /> Duplicar
              </button>

              <button 
                onClick={() => {
                  removeRoutineItems(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isSignatureModalOpen && (
          <SignatureModal 
            onClose={() => setIsSignatureModalOpen(false)}
            onSuccess={() => {
              setIsSignatureModalOpen(false);
              // Save to template library
              const store = useTemplateLibraryStore.getState();
              let targetFolder = store.folders.find(f => f.name === 'Recientemente Creadas');
              
              if (!targetFolder) {
                store.createFolder('Recientemente Creadas');
                targetFolder = useTemplateLibraryStore.getState().folders.find(f => f.name === 'Recientemente Creadas');
              }

              if (targetFolder) {
                // Ensure we deep clone the days so we don't store proxy references which might fail serialization
                const clonedDays = JSON.parse(JSON.stringify(days));
                
                store.createTemplate(targetFolder.id, {
                  name: store.cycleName || cycleName || 'Plantilla Nueva',
                  taxonomyId: cycleTaxonomyId,
                  tags: ['entrenamiento', 'demo', cycleTaxonomyId].filter(Boolean) as string[],
                  phases: [
                    {
                      id: uuidv4(),
                      name: 'Fase Única',
                      releaseDate: null,
                      notes: 'Prescripción guardada desde el editor',
                      days: clonedDays
                    }
                  ]
                });
                alert('¡Plantilla firmada y guardada en "Recientemente Creadas"!');
              }
            }}
          />
        )}

        {isROISoftLockOpen && (
            <ROISoftLock 
              onClose={() => {
                setIsROISoftLockOpen(false);
                const clientId = createdAthleteId; 
                
                // Telemetría Fire-and-forget
                const isBeginner = training?.experience === 'BEGINNER';
                const totalSets = flattenedRoutine.reduce((acc, curr) => acc + parseInt(curr.sets || '0'), 0);
                const maxSets = flattenedRoutine.reduce((max, curr) => Math.max(max, parseInt(curr.sets || '0')), 0);

                if (isBeginner && totalSets > 150) {
                  emitMRVSysWarning({ expected_max: 150, user_value: totalSets, experience_level: 'BEGINNER' });
                }

                if (isBeginner && maxSets > 14) {
                  // Mismo límite que DroppableDayColumn para grupo muscular (aquí aproximado por ejercicio para el ejemplo)
                  emitMRVSoftCapOverride({ expected_max: 14, user_value: maxSets, experience_level: 'BEGINNER' });
                }

                const payload = serializeRoutineForAPI(
                  clientId,
                  cycleName || 'Rutina sin nombre',
                  cycleTaxonomyId || '',
                  days,
                  nutrition,
                  workloadMetrics,
                  { startDate: new Date(startDate), endDate: new Date(endDate) }
                );

                saveProtocolMutation.mutate(payload);
              }}
              archetype="coach_premium"
            />
          )}

          {/* Athlete Form Modal */}
          <AnimatePresence>
            {isFormModalOpen && (
              <AthleteFormModal onClose={() => setIsFormModalOpen(false)} />
            )}
          </AnimatePresence>

          {/* ADKAR Modal Removed in favor of Guided Tour */}
      </div>
    </div>
  );
};

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { type ProgressionPreset, type ProgressionSettings, defaultProgressionSettings } from '../utils/progressionEngine';
import { createMesocycleFromWeek1 } from '../utils/progressionAdapter';
import { EXERCISES_DATABASE, type ExerciseTaxonomy } from '../data/exercisesData';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';
import { useOnboardingPTStore } from '../stores/useOnboardingPTStore';
import { validateClinicalDosage, type ExperienceLevel } from '../utils/clinicalDosageEngine';
import { emitMRVSoftCapOverride } from '../utils/telemetry';
import { evaluateExercise } from '../utils/clinicalFirewall';

export interface RoutineExercise {
  id: string;
  type: 'EXERCISE';
  exercise: ExerciseTaxonomy;
  sets: string;
  reps: string;
  weight: string;
  rpe: string;
  videoUrl: string;
  progression: string;
  // --- XAI (Explainable AI) Fields ---
  isSwapped?: boolean;
  clinicalRationale?: string;
  originalExerciseId?: string;
  originalExerciseName?: string;
  // --- Progressive Disclosure Fields ---
  tempo?: string;
  restTimer?: string; // in seconds, e.g. "90"
  rir?: string; // Reps in reserve
  notes?: string;
  rpeRule?: string;
  previousSessionHistory?: string;
  // --- Deep Research Biomechanical Flags ---
  tier?: 'T1' | 'T2' | 'T3' | 'CORE' | 'RAMP';
  isAxial?: boolean;
  stretchBiased?: boolean;
  isImmutable?: boolean;
}

export interface RoutineBlock {
  id: string;
  type: 'BLOCK';
  name: string;
  description?: string;
  rpe?: number;
  isCollapsed?: boolean;
  blockType?: 'STANDARD' | 'TABATA' | 'EMOM' | 'AMRAP' | 'CIRCUIT';
  workTime?: number; // seconds
  restTime?: number; // seconds
  rounds?: number;
  items: RoutineExercise[];
}

export type RoutineItem = RoutineExercise | RoutineBlock;

export interface Phase {
  id: string;
  name: string;
  modality?: string; // e.g. 'FUERZA', 'HIPERTROFIA'
  order: number; // For lexicographical sorting or fractional index
  weeksCount: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  customName?: string;
  items: RoutineItem[];
  isCollapsed?: boolean;
  phaseId?: string;
  phaseName?: string;
  releaseDate?: string | null;
  visibility?: 'published' | 'draft';
  primaryModality?: string;
  secondaryModality?: string;
}

export interface NutritionPlan {
  target: 'Déficit' | 'Mantenimiento' | 'Superávit' | '';
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  gender: 'M' | 'F' | '';
  age: string;
  weight: string;
  height: string;
  activityLevel: string;
  metabolicArchetype: string;
  clinicalFirewall: string;
  phase1: string;
  phase2: string;
  phase3: string;
  mealPlan: string;
}

interface PlanBuilderStateData {
  entityType: 'TEMPLATE' | 'CLIENT_INSTANCE';
  sourceTemplateId: string | null;
  editingTemplateFolderId: string | null;
  templateVersion: number;
  discipline: 'STRENGTH' | 'YOGA' | 'CROSSFIT' | 'CLINICAL' | 'ENDURANCE';
  isSimpleMode: boolean;
  cycleName: string;
  cycleTaxonomyId: string | null;
  startDate: string;
  endDate: string;
  phases: Phase[];
  days: WorkoutDay[];
  nutrition: NutritionPlan;
  hasSeenTutorial: boolean;
  activeDayId: string | null;
  syncStatus: 'DRAFT' | 'PAUSED' | 'SYNCED';
  isRoutineLocked: boolean;
  signatureBase64: string | null;
  isOverloadAssistantActive: boolean;
  selectedPreset: ProgressionPreset;
  progressionSettings: ProgressionSettings;
  exerciseDensity: 'detailed' | 'compact';
}

interface PlanBuilderActions {
  lockRoutine: (signatureBase64: string) => void;
  unlockRoutine: () => void;
  setSyncStatus: (status: 'DRAFT' | 'PAUSED' | 'SYNCED') => void;
  setDiscipline: (discipline: 'STRENGTH' | 'YOGA' | 'CROSSFIT' | 'CLINICAL' | 'ENDURANCE') => void;
  setSourceTemplate: (templateId: string) => void;
  setCycleName: (name: string) => void;
  setCycleTaxonomyId: (id: string | null) => void;
  setDates: (start: string, end: string) => void;
  setDays: (days: WorkoutDay[]) => void;
  updateDayName: (dayId: string, name: string) => void;
  setDayModality: (dayId: string, primary: string | undefined, secondary?: string) => void;
  toggleDayModality: (dayId: string) => void;
  addWorkoutDay: (name: string, phaseId?: string) => void;
  addRoutineItem: (dayId: string, item: RoutineItem) => void;
  updateRoutineItem: (dayId: string, itemId: string, field: string, value: any) => void;
  removeRoutineItem: (dayId: string, itemId: string) => void;
  revertClinicalSwap: (dayId: string, itemId: string) => void;
  toggleDayCollapse: (dayId: string) => void;
  toggleDayVisibility: (dayId: string) => void;
  toggleBlockCollapse: (dayId: string, blockId: string) => void;
  setNutrition: (nutrition: Partial<NutritionPlan>) => void;
  adaptTemplate: (newDays: WorkoutDay[]) => void;
  populateSmartDay: (dayId: string, items: RoutineItem[]) => void;
  populateFullRoutine: (days: WorkoutDay[]) => void;
  setActiveDayId: (id: string | null) => void;
  
  // Motor de Periodización (Clonación Inteligente)
  setOverloadAssistantActive: (active: boolean) => void;
  setSelectedPreset: (preset: ProgressionPreset) => void;
  setProgressionSettings: (settings: Partial<ProgressionSettings>) => void;
  setExerciseDensity: (density: 'detailed' | 'compact') => void;
  duplicateMicrocycle: (targetWeeksCount: number) => void;
  applyPresetToClonedWeeks: (preset: ProgressionPreset, sourceWeekIndex: number, totalWeeks: number) => void;
  propagateDay: (sourceDayId: string, targetWeekIndices: number[]) => void;
  removeSegmentDays: (dayIds: string[]) => void;
  duplicateSegmentDays: (dayIds: string[]) => void;

  // Acciones Masivas & Drag and Drop
  reorderRoutine: (dayId: string, activeId: string, overId: string) => void;
  bulkUpdateField: (dayId: string, ids: string[], field: keyof RoutineItem, value: string) => void;
  duplicateRoutineItems: (dayId: string, ids: string[]) => void;
  removeRoutineItems: (dayId: string, ids: string[]) => void;
  
  // Web Worker Batch Mutations
  batchInsertDays: (newDays: WorkoutDay[]) => void;
  batchStackBlocks: (updates: { dayIndex: number; newItem: RoutineItem }[]) => void;
  addPhaseWithWeeks: (phaseName: string, weeks: number, modality?: string, activeDaysPattern?: number[]) => string;
  duplicateDay: (dayId: string) => void;
  
  // Phase Management
  addPhase: (name: string, modality?: string) => void;
  updatePhase: (phaseId: string, updates: Partial<Phase>) => void;
  removePhase: (phaseId: string) => void;
  renamePhase: (phaseId: string, newName: string) => void;
  reorderPhases: (activeId: string, overId: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
  // Onboarding
  setHasSeenTutorial: (seen: boolean) => void;
  reset: () => void;
  
  // Entity Identity Actions
  setEntityType: (type: 'TEMPLATE' | 'CLIENT_INSTANCE') => void;
  setSourceTemplateId: (id: string | null) => void;
  loadFromTemplate: (templateData: { cycleName: string; days: WorkoutDay[]; sourceTemplateId: string }) => void;
  loadTemplateForEditing: (folderId: string, template: any) => void;
  saveTemplateChanges: () => void;
}

export interface PlanBuilderStore extends PlanBuilderStateData, PlanBuilderActions {
  past: PlanBuilderStateData[];
  future: PlanBuilderStateData[];
}

const defaultNutrition: NutritionPlan = {
  target: '', calories: '', protein: '', carbs: '', fats: '',
  gender: '', age: '', weight: '', height: '',
  activityLevel: '1.2', metabolicArchetype: '', clinicalFirewall: '',
  phase1: '', phase2: '', phase3: '', mealPlan: ''
};

const getInitialState = (): PlanBuilderStateData => ({
  entityType: 'TEMPLATE',
  sourceTemplateId: null,
  editingTemplateFolderId: null,
  templateVersion: 1,
  discipline: 'STRENGTH',
  isSimpleMode: false,
  cycleName: 'Nueva Plantilla',
  cycleTaxonomyId: null,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
  phases: [],
  days: [
    { id: uuidv4(), name: 'Día 1', items: [], isCollapsed: true },
    { id: uuidv4(), name: 'Día 2', items: [], isCollapsed: true },
    { id: uuidv4(), name: 'Día 3', items: [], isCollapsed: true }
  ],
  nutrition: defaultNutrition,
  hasSeenTutorial: false,
  activeDayId: null,
  syncStatus: 'DRAFT',
  isRoutineLocked: false,
  signatureBase64: null,
  isOverloadAssistantActive: false,
  selectedPreset: 'LINEAR',
  progressionSettings: defaultProgressionSettings,
  exerciseDensity: 'detailed',
});

const MAX_HISTORY = 5;

// Estrategia Zero-AI: Motor Heurístico de Reglas Locales para Smart Defaults de RPE
export const getHeuristicRPE = (blockName: string): number => {
  const name = blockName.toLowerCase();
  
  // Nivel 1: Alta demanda (SNC / Metabólica)
  if (/fuerza|hipertrofia|principal|boxeo|sparring|metab[oó]lico|potencia/.test(name)) return 8;
  
  // Nivel 2: Baja demanda (Recuperación / Movilidad)
  if (/movilidad|calentamiento|descarga|recuperaci[oó]n|estiramiento/.test(name)) return 3;
  
  // Nivel 3: Fallo Seguro (Default)
  return 6;
};

// Utilidad para clonación profunda con regeneración de UUIDs
const deepCloneRoutineItem = (item: RoutineItem): RoutineItem => {
  if (item.type === 'BLOCK') {
    return {
      ...item,
      id: uuidv4(),
      items: item.items.map(ex => ({ ...ex, id: uuidv4() }))
    };
  }
  return { ...item, id: uuidv4() };
};

const deepCloneWorkoutDay = (day: WorkoutDay): WorkoutDay => {
  return {
    ...day,
    id: uuidv4(),
    items: day.items.map(deepCloneRoutineItem)
  };
};

// Utilidad para extraer el estado "puro" (sin métodos ni historial) para guardar en la pila
const extractState = (state: PlanBuilderStore): PlanBuilderStateData => ({
  entityType: state.entityType,
  sourceTemplateId: state.sourceTemplateId,
  templateVersion: state.templateVersion,
  discipline: state.discipline,
  isSimpleMode: state.isSimpleMode,
  cycleName: state.cycleName,
  cycleTaxonomyId: state.cycleTaxonomyId,
  startDate: state.startDate,
  endDate: state.endDate,
  days: JSON.parse(JSON.stringify(state.days)), // deep clone para evitar referencias cruzadas
  nutrition: JSON.parse(JSON.stringify(state.nutrition)),
  hasSeenTutorial: state.hasSeenTutorial,
  activeDayId: state.activeDayId,
  syncStatus: state.syncStatus,
  isRoutineLocked: state.isRoutineLocked,
  signatureBase64: state.signatureBase64,
  phases: JSON.parse(JSON.stringify(state.phases)),
  isOverloadAssistantActive: state.isOverloadAssistantActive,
  selectedPreset: state.selectedPreset,
  progressionSettings: state.progressionSettings,
  exerciseDensity: state.exerciseDensity
});

// Utilidad para guardar un snapshot antes de mutar
const saveSnapshot = (state: PlanBuilderStore) => {
  const snapshot = extractState(state);
  state.past.push(snapshot);
  if (state.past.length > MAX_HISTORY) {
    state.past.shift(); // Elimina el más antiguo si supera el límite
  }
  state.future = []; // Cualquier mutación invalida el futuro (Redo)
};

export const usePlanBuilderStore = create<PlanBuilderStore>()(
  persist(
    immer((set) => ({
      ...getInitialState(),
    past: [],
    future: [],

    lockRoutine: (signatureBase64) => set((state) => {
      state.isRoutineLocked = true;
      state.signatureBase64 = signatureBase64;
    }),

    unlockRoutine: () => set((state) => {
      // Registrar en telemetría el request de enmienda si es necesario
      state.isRoutineLocked = false;
      state.signatureBase64 = null;
    }),

    setOverloadAssistantActive: (active) => set((state) => {
      state.isOverloadAssistantActive = active;
    }),

    setSelectedPreset: (preset) => set((state) => {
      state.selectedPreset = preset;
    }),

    setProgressionSettings: (settings) => set((state) => {
      state.progressionSettings = { ...state.progressionSettings, ...settings };
    }),
    
    setExerciseDensity: (density) => set((state) => {
      state.exerciseDensity = density;
    }),

    duplicateMicrocycle: (_targetWeeksCount) => set((_state) => {
      // Delegamos a applyPresetToClonedWeeks
    }),

    applyPresetToClonedWeeks: (preset, sourceWeekIndex, totalWeeks) => set((state) => {
      saveSnapshot(state as PlanBuilderStore);
      
      const startIndex = sourceWeekIndex * 7;
      let baseDays = state.days.slice(startIndex, startIndex + 7);
      if (baseDays.length === 0) return;
      
      while (baseDays.length < 7) {
        baseDays.push({
          id: uuidv4(),
          name: `Día ${baseDays.length + 1}`,
          items: []
        });
      }
      
      // Aplicamos la progresión usando el adapter y engine actualizados
      const progressedDays = createMesocycleFromWeek1(baseDays, totalWeeks, preset, state.progressionSettings);
      
      // Mantenemos los días anteriores a la semana origen (si hay)
      const previousDays = state.days.slice(0, startIndex);
      
      // Mantenemos los días que existan después del bloque generado (si genera menos)
      const existingRemainingDays = state.days.slice(startIndex + (totalWeeks * 7));
      
      state.days = [...previousDays, ...progressedDays, ...existingRemainingDays];
    }),

    propagateDay: (sourceDayId, targetWeekIndices) => set((state) => {
      saveSnapshot(state as PlanBuilderStore);
      
      const sourceDayIndex = state.days.findIndex(d => d.id === sourceDayId);
      if (sourceDayIndex === -1) return;
      
      const sourceDay = state.days[sourceDayIndex];
      const dayOffsetInWeek = sourceDayIndex % 7; // El índice del día dentro de su semana
      
      targetWeekIndices.forEach(weekIndex => {
        const targetIndex = (weekIndex * 7) + dayOffsetInWeek;
        
        // Si el día destino existe, lo sobrescribimos con el clon
        if (targetIndex < state.days.length) {
          const oldDayName = state.days[targetIndex].name;
          const oldCustomName = state.days[targetIndex].customName;
          
          state.days[targetIndex] = deepCloneWorkoutDay(sourceDay);
          
          // Preservar los nombres originales del día destino
          state.days[targetIndex].name = oldDayName;
          if (oldCustomName) {
            state.days[targetIndex].customName = oldCustomName || oldDayName;
          }
        }
      });
    }),

    removeSegmentDays: (dayIds) => set((state) => {
      saveSnapshot(state as PlanBuilderStore);
      state.days = state.days.filter(d => !dayIds.includes(d.id));
    }),

    duplicateSegmentDays: (dayIds) => set((state) => {
      saveSnapshot(state as PlanBuilderStore);
      // Extraemos los días a duplicar
      const daysToDuplicate = state.days.filter(d => dayIds.includes(d.id));
      if (daysToDuplicate.length === 0) return;
      
      // Creamos copias profundas
      const clonedDays = daysToDuplicate.map(d => deepCloneWorkoutDay(d));
      
      // Encontramos el índice del último día de este segmento en el array general
      const lastSourceDayId = dayIds[dayIds.length - 1];
      const insertIndex = state.days.findIndex(d => d.id === lastSourceDayId);
      
      if (insertIndex !== -1) {
        // Insertamos justo después del segmento original
        state.days.splice(insertIndex + 1, 0, ...clonedDays);
      } else {
        // Si por alguna razón no lo encontramos, lo mandamos al final
        state.days.push(...clonedDays);
      }
    }),

    setSyncStatus: (status) => set((state) => {
      state.syncStatus = status;
    }),

    setDiscipline: (discipline) => set((state) => {
      state.discipline = discipline;
      state.isSimpleMode = discipline !== 'STRENGTH';
    }),

    setSourceTemplate: (templateId) => set((state) => {
      state.sourceTemplateId = templateId;
    }),

    setCycleName: (cycleName) => set((state) => {
      saveSnapshot(state);
      state.cycleName = cycleName;
    }),
    
    setCycleTaxonomyId: (id) => set((state) => {
      saveSnapshot(state);
      state.cycleTaxonomyId = id;
    }),
    
    setDates: (startDate, endDate) => set((state) => {
      saveSnapshot(state);
      state.startDate = startDate;
      state.endDate = endDate;
    }),
    
    setDays: (days) => set((state) => {
      saveSnapshot(state);
      state.days = days;
    }),

    updateDayName: (dayId, name) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) day.customName = name;
    }),

    setDayModality: (dayId, primary, secondary) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.primaryModality = primary;
        day.secondaryModality = secondary;
      }
    }),

    toggleDayModality: (dayId) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (!day) return;
      const phase = state.phases.find(p => p.id === day.phaseId);
      const targetModality = phase?.modality || 'HIPERTROFIA'; // Fallback
      
      if (day.primaryModality) {
        day.primaryModality = undefined;
      } else {
        day.primaryModality = targetModality;
      }
    }),

    addWorkoutDay: (name, phaseId?: string) => set((state) => {
      saveSnapshot(state);
      const phase = phaseId ? state.phases.find(p => p.id === phaseId) : undefined;
      state.days.push({
        id: uuidv4(),
        name,
        items: [],
        phaseId,
        phaseName: phase?.name,
      });
    }),

    addPhaseWithWeeks: (phaseName: string, weeks: number, modality?: string, activeDaysPattern?: number[]) => {
      const phaseId = uuidv4();
      set((state) => {
        saveSnapshot(state);
        const order = state.phases.length > 0 ? Math.max(...state.phases.map(p => p.order)) + 1000 : 1000;
        
        state.phases.push({
          id: phaseId,
          name: phaseName,
          modality,
          order,
          weeksCount: weeks
        });

        const newDays: WorkoutDay[] = [];
        const DAYS_OF_WEEK = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
        
        for (let w = 0; w < weeks; w++) {
          for (let d = 0; d < 7; d++) {
            const isActive = activeDaysPattern ? activeDaysPattern.includes(d) : true;
            newDays.push({
              id: uuidv4(),
              name: `${DAYS_OF_WEEK[d]} (Semana ${w + 1})`,
              items: [],
              phaseId,
              phaseName,
              primaryModality: isActive ? modality : undefined
            });
          }
        }
        state.days.push(...newDays);
      });
      return phaseId;
    },

    addPhase: (name: string, modality?: string) => set((state) => {
      saveSnapshot(state);
      const order = state.phases.length > 0 ? Math.max(...state.phases.map(p => p.order)) + 1000 : 1000;
      state.phases.push({
        id: uuidv4(),
        name,
        modality,
        order,
        weeksCount: 0
      });
    }),

    updatePhase: (phaseId: string, updates: Partial<Phase>) => set((state) => {
      saveSnapshot(state);
      const phase = state.phases.find(p => p.id === phaseId);
      if (phase) {
        Object.assign(phase, updates);
        // If modality changed, optionally update days? For now just phase.
        if (updates.name) {
            state.days.forEach(d => {
                if (d.phaseId === phaseId) d.phaseName = updates.name;
            });
        }
      }
    }),

    removePhase: (phaseId: string) => set((state) => {
      saveSnapshot(state);
      state.phases = state.phases.filter(p => p.id !== phaseId);
      state.days = state.days.filter(d => d.phaseId !== phaseId);
    }),

    renamePhase: (phaseId: string, newName: string) => set((state) => {
      saveSnapshot(state);
      const phase = state.phases.find(p => p.id === phaseId);
      if (phase) phase.name = newName;
      state.days.forEach(d => {
        if (d.phaseId === phaseId) d.phaseName = newName;
      });
    }),

    reorderPhases: (activeId: string, overId: string) => set((state) => {
      saveSnapshot(state);
      const oldIndex = state.phases.findIndex(p => p.id === activeId);
      const newIndex = state.phases.findIndex(p => p.id === overId);
      if (oldIndex >= 0 && newIndex >= 0) {
        const item = state.phases.splice(oldIndex, 1)[0];
        state.phases.splice(newIndex, 0, item);
        state.phases.forEach((p, idx) => p.order = idx * 1000);
      }
    }),

    addWeekToPhase: (phaseId: string) => set((state) => {
      saveSnapshot(state);
      // Encontrar un día existente de esa fase para heredar el nombre
      const existingDay = state.days.find(d => d.phaseId === phaseId);
      const phaseName = existingDay?.phaseName || 'Fase Desconocida';
      
      const existingDaysInPhase = state.days.filter(d => d.phaseId === phaseId).length;
      
      const newDays: WorkoutDay[] = [];
      for (let d = 0; d < 7; d++) {
        newDays.push({
          id: uuidv4(),
          name: `Día ${existingDaysInPhase + d + 1}`,
          items: [],
          phaseId,
          phaseName
        });
      }
      // Insertar los días al final de los días existentes de esta fase
      const lastIndex = state.days.map(d => d.phaseId).lastIndexOf(phaseId);
      if (lastIndex >= 0) {
        state.days.splice(lastIndex + 1, 0, ...newDays);
      } else {
        state.days.push(...newDays);
      }
    }),

    duplicateDay: (dayId) => set((state) => {
      saveSnapshot(state);
      const originalDayIndex = state.days.findIndex(d => d.id === dayId);
      if (originalDayIndex >= 0) {
        const originalDay = state.days[originalDayIndex];
        const newDay: WorkoutDay = {
          ...originalDay,
          id: uuidv4(),
          name: `${originalDay.name} (Copia)`,
          items: originalDay.items.map(item => ({ ...item, id: uuidv4() }))
        };
        state.days.splice(originalDayIndex + 1, 0, newDay);
      }
    }),

    batchInsertDays: (newDays) => set((state) => {
      saveSnapshot(state);
      state.days.push(...newDays);
    }),

    batchStackBlocks: (updates) => set((state) => {
      saveSnapshot(state);
      updates.forEach(({ dayIndex, newItem }) => {
        if (state.days[dayIndex]) {
          if (newItem.type === 'BLOCK' && typeof newItem.rpe === 'undefined') {
            newItem.rpe = getHeuristicRPE(newItem.name);
          }
          state.days[dayIndex].items.push(newItem);
        }
      });
      
      // Fricción Positiva (Post-mutación)
      const experienceLevel = (useOnboardingPTStore.getState().training?.experience_level as ExperienceLevel) || 'INTERMEDIATE';
      const dosageResult = validateClinicalDosage(state.days, experienceLevel);
      if (!dosageResult.isValid) {
        dosageResult.violations.forEach((v: any) => {
          emitMRVSoftCapOverride({
            expected_max: v.maxValue,
            user_value: v.currentValue,
            experience_level: experienceLevel
          });
        });
      }
    }),
    
    addRoutineItem: (dayId, item) => set((state) => {
      if (state.isRoutineLocked) return;
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        let finalItem = { ...item };
        // Clinical Firewall Interception (only for EXERCISE)
        if (finalItem.type === 'EXERCISE') {
          const evalResult = evaluateExercise(finalItem.exercise);
          if (evalResult.isBlocked) {
            console.warn(evalResult.blockReason);
            return;
          }
          if (evalResult.isSwapped && evalResult.newExercise) {
            finalItem = {
              ...finalItem,
              exercise: evalResult.newExercise,
              isSwapped: true,
              clinicalRationale: evalResult.clinicalRationale,
              originalExerciseId: evalResult.originalExerciseId,
              originalExerciseName: item.type === 'EXERCISE' ? item.exercise.Nombre_Oficial : undefined
            };
          }
        }
        
        // Aplicar Heurística Zero-AI al añadir un nuevo bloque
        if (finalItem.type === 'BLOCK' && typeof finalItem.rpe === 'undefined') {
          finalItem.rpe = getHeuristicRPE(finalItem.name);
        }
        
        day.items.push(finalItem);
        
        // Fricción Positiva (Post-mutación)
        const experienceLevel = (useOnboardingPTStore.getState().training?.experience_level as ExperienceLevel) || 'INTERMEDIATE';
        const dosageResult = validateClinicalDosage(state.days, experienceLevel);
        if (!dosageResult.isValid) {
          dosageResult.violations.forEach((v: any) => {
            emitMRVSoftCapOverride({
              expected_max: v.maxValue,
              user_value: v.currentValue,
              experience_level: experienceLevel
            });
          });
        }
      }
    }),
    
    updateRoutineItem: (dayId, itemId, field, value) => set((state) => {
      if (state.isRoutineLocked) return;
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (!day) return;

      // Buscar en nivel 1
      const item = day.items.find(i => i.id === itemId);
      if (item) {
        if (field === 'exercise' && item.type === 'EXERCISE') {
            const evalResult = evaluateExercise(value);
            if (evalResult.isBlocked) {
                console.warn(evalResult.blockReason);
                return;
            }
            if (evalResult.isSwapped && evalResult.newExercise) {
                (item as any)[field] = evalResult.newExercise;
                item.isSwapped = true;
                item.clinicalRationale = evalResult.clinicalRationale;
                item.originalExerciseId = evalResult.originalExerciseId;
                item.originalExerciseName = value.Nombre_Oficial;
            } else {
                (item as any)[field] = value;
                item.isSwapped = false;
                item.clinicalRationale = undefined;
            }
        } else {
            (item as any)[field] = value;
        }
      } else {
          // Buscar en nivel 2 (bloques)
          for (const block of day.items) {
            if (block.type === 'BLOCK') {
              const ex = block.items.find(i => i.id === itemId);
              if (ex) {
                if (field === 'exercise' && ex.type === 'EXERCISE') {
                    const evalResult = evaluateExercise(value);
                    if (evalResult.isBlocked) return;
                    if (evalResult.isSwapped && evalResult.newExercise) {
                        (ex as any)[field] = evalResult.newExercise;
                        ex.isSwapped = true;
                        ex.clinicalRationale = evalResult.clinicalRationale;
                        ex.originalExerciseId = evalResult.originalExerciseId;
                        ex.originalExerciseName = value.Nombre_Oficial;
                    } else {
                        (ex as any)[field] = value;
                        ex.isSwapped = false;
                        ex.clinicalRationale = undefined;
                    }
                } else {
                    (ex as any)[field] = value;
                }
                break;
              }
            }
          }
      }
      
      if (field === 'sets' || field === 'rpe') {
        const experienceLevel = (useOnboardingPTStore.getState().training?.experience_level as ExperienceLevel) || 'INTERMEDIATE';
        const dosageResult = validateClinicalDosage(state.days, experienceLevel);
        if (!dosageResult.isValid) {
          dosageResult.violations.forEach((v: any) => {
            emitMRVSoftCapOverride({
              expected_max: v.maxValue,
              user_value: v.currentValue,
              experience_level: experienceLevel
            });
          });
        }
      }
    }),
    
    removeRoutineItem: (dayId, itemId) => set((state) => {
      if (state.isRoutineLocked) return;
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (!day) return;

      const initialLength = day.items.length;
      day.items = day.items.filter(i => i.id !== itemId);
      
      // Si no se eliminó en el nivel 1, buscar dentro de los bloques
      if (day.items.length === initialLength) {
        for (const block of day.items) {
          if (block.type === 'BLOCK') {
            block.items = block.items.filter(i => i.id !== itemId);
          }
        }
      }
    }),

    revertClinicalSwap: (dayId, itemId) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (!day) return;
      const item = day.items.find(i => i.id === itemId);
      if (!item || item.type !== 'EXERCISE' || !item.isSwapped || !item.originalExerciseId) return;

      const originalExercise = EXERCISES_DATABASE.find(ex => ex.ID_Ejercicio === item.originalExerciseId);
      
      if (originalExercise) {
        console.log(`[GA4 Event] swap_reverted: original_id=${item.originalExerciseId} swapped_id=${item.exercise.ID_Ejercicio} rationale="${item.clinicalRationale}"`);
        
        item.exercise = originalExercise;
        
        delete item.isSwapped;
        delete item.clinicalRationale;
        delete item.originalExerciseId;
        delete item.originalExerciseName;
      }
    }),

    toggleDayCollapse: (dayId) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.isCollapsed = !day.isCollapsed;
      }
    }),

    toggleDayVisibility: (dayId) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.visibility = day.visibility === 'draft' ? 'published' : 'draft';
      }
    }),

    toggleBlockCollapse: (dayId, blockId) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        const block = day.items.find(i => i.id === blockId && i.type === 'BLOCK') as RoutineBlock;
        if (block) {
          block.isCollapsed = !block.isCollapsed;
        }
      }
    }),
    
    setNutrition: (nutritionPatch) => set((state) => {
      saveSnapshot(state);
      Object.assign(state.nutrition, nutritionPatch);
    }),

    adaptTemplate: (newDays) => set((state) => {
      saveSnapshot(state);
      state.days.push(...newDays);
    }),

    populateSmartDay: (dayId, items) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.items = items;
      }
    }),

    populateFullRoutine: (days) => set((state) => {
      saveSnapshot(state);
      state.days = days;
    }),

    reorderRoutine: (dayId, activeId, overId) => set((state) => {
      if (state.isRoutineLocked) return;
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        const oldIndex = day.items.findIndex(item => item.id === activeId);
        const newIndex = day.items.findIndex(item => item.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          day.items = arrayMove(day.items, oldIndex, newIndex);
        }
      }
    }),

    bulkUpdateField: (dayId, ids, field, value) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.items.forEach(item => {
          if (ids.includes(item.id)) {
            (item as any)[field] = value;
          }
        });
      }
    }),

    duplicateRoutineItems: (dayId, ids) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (!day) return;

      const itemsToDuplicate = day.items.filter(item => ids.includes(item.id));
      if (itemsToDuplicate.length === 0) return;

      const maxIndex = Math.max(...itemsToDuplicate.map(item => day.items.indexOf(item)));
      
      const clones = itemsToDuplicate.map(item => {
        const newId = uuidv4();
        if (item.type === 'BLOCK' && item.items) {
          return {
            ...item,
            id: newId,
            items: item.items.map((child: any) => ({ ...child, id: uuidv4() }))
          };
        }
        return { ...item, id: newId };
      });

      day.items.splice(maxIndex + 1, 0, ...clones);
    }),

    removeRoutineItems: (dayId, ids) => set((state) => {
      saveSnapshot(state);
      const day = state.days.find(d => d.id === dayId);
      if (day) {
        day.items = day.items.filter(item => !ids.includes(item.id));
      }
    }),

    setEntityType: (type) => set((state) => {
      state.entityType = type;
    }),

    setSourceTemplateId: (id) => set((state) => {
      state.sourceTemplateId = id;
    }),

    loadFromTemplate: (templateData) => set((state) => {
      saveSnapshot(state);
      state.cycleName = templateData.cycleName;
      state.days = templateData.days;
      state.sourceTemplateId = templateData.sourceTemplateId;
      state.entityType = 'CLIENT_INSTANCE';
      state.syncStatus = 'DRAFT';
      state.isRoutineLocked = false;
      state.signatureBase64 = null;
    }),

    loadTemplateForEditing: (folderId, template) => set((state) => {
      saveSnapshot(state);
      state.entityType = 'TEMPLATE';
      state.sourceTemplateId = template.id;
      state.editingTemplateFolderId = folderId;
      state.cycleName = template.name;
      state.cycleTaxonomyId = template.taxonomyId || null;

      // Extract template phases & days with full correlation
      if (template.phases && template.phases.length > 0) {
        const builderPhases: Phase[] = template.phases.map((p: any, idx: number) => ({
          id: p.id || uuidv4(),
          name: p.name || `Fase ${idx + 1}`,
          modality: 'HIPERTROFIA',
          order: idx + 1,
          weeksCount: 4
        }));
        state.phases = builderPhases;

        const allDays: WorkoutDay[] = template.phases.flatMap((phase: any, pIdx: number) => {
          const phaseId = builderPhases[pIdx]?.id || phase.id;
          return (phase.days || []).map((day: any) => ({
            ...JSON.parse(JSON.stringify(day)),
            id: day.id || uuidv4(),
            phaseId: phaseId,
            phaseName: phase.name,
            isCollapsed: false
          }));
        });

        state.days = allDays.length > 0 ? allDays : [
          { id: uuidv4(), name: 'Día 1', items: [], isCollapsed: false, phaseId: builderPhases[0]?.id }
        ];
      } else {
        const defaultPhaseId = uuidv4();
        state.phases = [
          { id: defaultPhaseId, name: 'Mesociclo Base (4 Semanas)', modality: 'HIPERTROFIA', order: 1, weeksCount: 4 }
        ];
        state.days = [
          { id: uuidv4(), name: 'Día 1', items: [], isCollapsed: false, phaseId: defaultPhaseId }
        ];
      }

      state.syncStatus = 'SYNCED';
      state.isRoutineLocked = false;
      state.signatureBase64 = null;
      state.activeDayId = state.days[0]?.id || null;
    }),

    saveTemplateChanges: () => {
      const state = get();
      if (!state.sourceTemplateId) return;

      const templateStore = useTemplateLibraryStore.getState();
      let targetFolderId = state.editingTemplateFolderId;
      if (!targetFolderId) {
        const found = templateStore.folders.find(f => f.templates.some(t => t.id === state.sourceTemplateId));
        if (found) targetFolderId = found.id;
      }
      if (!targetFolderId) {
        targetFolderId = templateStore.folders[0]?.id || 'folder-hipertrofia';
      }

      // Group days by phase
      const updatedPhases = (state.phases || []).map(p => {
        const phaseDays = state.days.filter(d => d.phaseId === p.id);
        return {
          id: p.id,
          name: p.name,
          releaseDate: null,
          notes: `${p.name} (${p.weeksCount || 4} semanas)`,
          days: phaseDays.length > 0 ? phaseDays : state.days
        };
      });

      const finalPhases = updatedPhases.length > 0 ? updatedPhases : [
        {
          id: uuidv4(),
          name: state.cycleName || 'Mesociclo Principal',
          releaseDate: null,
          notes: '',
          days: state.days
        }
      ];

      templateStore.updateTemplate(targetFolderId, state.sourceTemplateId, {
        name: state.cycleName,
        phases: finalPhases
      });
    },

    undo: () => set((state) => {
      if (state.past.length === 0) return;
      const currentSnapshot = extractState(state);
      state.future.push(currentSnapshot);
      const previousState = state.past.pop()!;
      Object.assign(state, previousState);
    }),

    redo: () => set((state) => {
      if (state.future.length === 0) return;
      const currentSnapshot = extractState(state);
      state.past.push(currentSnapshot);
      const nextState = state.future.pop()!;
      Object.assign(state, nextState);
    }),

    reset: () => set((state) => {
      Object.assign(state, getInitialState());
      state.past = [];
      state.future = [];
    }),

    setHasSeenTutorial: (seen) => set((state) => {
      state.hasSeenTutorial = seen;
    }),

    setActiveDayId: (id) => set((state) => {
      state.activeDayId = id;
    })
  })),
  {
    name: 'plan-builder-storage',
    version: 4,
    migrate: (persistedState: any, version: number) => {
      if (version < 2) {
        persistedState.entityType = 'CLIENT_INSTANCE';
        persistedState.sourceTemplateId = null;
        persistedState.templateVersion = 1;
      }
      if (version < 3 && persistedState.days) {
        persistedState.days.forEach((day: any) => {
          day.items?.forEach((item: any) => {
            if (item.type === 'EXERCISE') {
              item.restTimer = item.restTimer || '90';
              item.rir = item.rir || item.rpe || '2';
              item.tempo = item.tempo || '2-0-2-0';
            } else if (item.type === 'BLOCK') {
              item.items?.forEach((ex: any) => {
                ex.restTimer = ex.restTimer || '90';
                ex.rir = ex.rir || ex.rpe || '2';
                ex.tempo = ex.tempo || '2-0-2-0';
              });
            }
          });
        });
      }
      return persistedState;
    },
    partialize: (state) => ({
      entityType: state.entityType,
      sourceTemplateId: state.sourceTemplateId,
      editingTemplateFolderId: state.editingTemplateFolderId,
      templateVersion: state.templateVersion,
      cycleName: state.cycleName,
      cycleTaxonomyId: state.cycleTaxonomyId,
      startDate: state.startDate,
      endDate: state.endDate,
      phases: state.phases,
      days: state.days,
      nutrition: state.nutrition,
      hasSeenTutorial: state.hasSeenTutorial,
      syncStatus: state.syncStatus,
      isRoutineLocked: state.isRoutineLocked,
      signatureBase64: state.signatureBase64
    })
  }
  )
);

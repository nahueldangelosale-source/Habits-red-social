import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';

// ═══════════════════════════════════════════════════════════════
// TIPOS CORE
// ═══════════════════════════════════════════════════════════════

export type HabitType = 'BUILD' | 'BREAK';
export type HabitDuration = '1_WEEK' | '1_MONTH' | '3_MONTHS' | 'INDEFINITE';
export type HabitCategory = 'SUEÑO' | 'NUTRICION' | 'FITNESS' | 'MINDSET' | 'PRODUCTIVIDAD' | 'CUSTOM';
export type HabitInputType = 'BOOLEAN' | 'NUMERIC';
export type CompletionZone = 'NONE' | 'LOW' | 'HIGH'; // LOW = 90-99%, HIGH = 100%+

// ═══════════════════════════════════════════════════════════════
// DÍAS DE LA SEMANA Y HELPERS (1 = Lunes ... 7 = Domingo)
// ═══════════════════════════════════════════════════════════════

export const DAY_LABELS_SHORT = [
  { id: 1, label: 'L', name: 'Lunes' },
  { id: 2, label: 'M', name: 'Martes' },
  { id: 3, label: 'X', name: 'Miércoles' },
  { id: 4, label: 'J', name: 'Jueves' },
  { id: 5, label: 'V', name: 'Viernes' },
  { id: 6, label: 'S', name: 'Sábado' },
  { id: 7, label: 'D', name: 'Domingo' },
] as const;

export function getDayOfWeekISO(dateString?: string): number {
  const d = dateString ? new Date(dateString + 'T12:00:00') : new Date();
  const day = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  return day === 0 ? 7 : day; // Retorna 1..7 (1=Lunes ... 7=Domingo)
}

export function isHabitScheduledForDay(habit: PrescribedHabit, dateString?: string): boolean {
  if (!habit.scheduledDays || habit.scheduledDays.length === 0) return true;
  const dayIso = getDayOfWeekISO(dateString);
  return habit.scheduledDays.includes(dayIso);
}

export function getHabitDaysSummary(scheduledDays?: number[]): string {
  if (!scheduledDays || scheduledDays.length === 0 || scheduledDays.length === 7) {
    return 'Todos los días';
  }
  if (scheduledDays.length === 5 && [1, 2, 3, 4, 5].every(d => scheduledDays.includes(d))) {
    return 'Lunes a Viernes';
  }
  if (scheduledDays.length === 2 && [6, 7].every(d => scheduledDays.includes(d))) {
    return 'Fines de Semana';
  }
  if (scheduledDays.length === 3 && [1, 3, 5].every(d => scheduledDays.includes(d))) {
    return 'Lun · Mié · Vie';
  }
  if (scheduledDays.length === 3 && [2, 4, 6].every(d => scheduledDays.includes(d))) {
    return 'Mar · Jue · Sáb';
  }
  const map: Record<number, string> = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' };
  return [...scheduledDays].sort().map(d => map[d] || `${d}`).join(' · ');
}

// ═══════════════════════════════════════════════════════════════
// CATÁLOGO EXPANDIDO
// ═══════════════════════════════════════════════════════════════

export interface HabitCatalogItem {
  id: string;
  title: string;
  type: HabitType;
  category: HabitCategory;
  icon: string;
  tags: string[];
  inputType: HabitInputType;
  unit?: string;
  targetValue?: number;
  defaultScheduledDays?: number[];
}

export const HABIT_CATALOG: HabitCatalogItem[] = [
  // ──── SUEÑO ────
  { id: 'h_sleep_7h',       title: '7h de Sueño',           type: 'BUILD', category: 'SUEÑO',         icon: '😴', tags: ['sueño','recuperación'],         inputType: 'NUMERIC', unit: 'h',     targetValue: 7, defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_bed_time',       title: 'Acostarse antes 23h',   type: 'BUILD', category: 'SUEÑO',         icon: '🛏️', tags: ['sueño','rutina'],              inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_no_screen',      title: 'No celular post-23h',   type: 'BREAK', category: 'SUEÑO',         icon: '📵', tags: ['sueño','pantallas'],            inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },

  // ──── FITNESS ────
  { id: 'h_training',       title: 'Entrenamiento del día', type: 'BUILD', category: 'FITNESS',       icon: '🏋️', tags: ['ejercicio','fuerza'],           inputType: 'BOOLEAN', defaultScheduledDays: [1,3,5] },
  { id: 'h_walk_20',        title: '20min Caminata',        type: 'BUILD', category: 'FITNESS',       icon: '🚶', tags: ['ejercicio','cardio','NEAT'],    inputType: 'NUMERIC', unit: 'min',   targetValue: 20, defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_steps',          title: 'Meta de Pasos',         type: 'BUILD', category: 'FITNESS',       icon: '👟', tags: ['ejercicio','NEAT','pasos'],     inputType: 'NUMERIC', unit: 'pasos', targetValue: 10000, defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_mobility_10',    title: '10min Movilidad / Foam',type: 'BUILD', category: 'FITNESS',       icon: '🧘', tags: ['movilidad','recuperación'],     inputType: 'NUMERIC', unit: 'min',   targetValue: 10, defaultScheduledDays: [1,2,3,4,5,6,7] },

  // ──── NUTRICIÓN ────
  { id: 'h_water',          title: '2L de Agua',            type: 'BUILD', category: 'NUTRICION',     icon: '💧', tags: ['hidratación','nutrición'],       inputType: 'NUMERIC', unit: 'L',     targetValue: 2, defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_macros',         title: 'Cumplir Macros',        type: 'BUILD', category: 'NUTRICION',     icon: '🎯', tags: ['nutrición','macros'],            inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_cal_range',      title: 'Calorías en Rango',     type: 'BUILD', category: 'NUTRICION',     icon: '🔥', tags: ['nutrición','calorías'],          inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_supplements',    title: 'Suplementos / Creatina',type: 'BUILD', category: 'NUTRICION',     icon: '💊', tags: ['nutrición','suplementos'],       inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_veg',            title: '5 porciones Verdura',   type: 'BUILD', category: 'NUTRICION',     icon: '🥦', tags: ['nutrición','micronutrientes'],   inputType: 'NUMERIC', unit: 'porc.', targetValue: 5, defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_breakfast',      title: 'Desayunar',             type: 'BUILD', category: 'NUTRICION',     icon: '🍳', tags: ['nutrición','timing'],            inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_mealprep',       title: 'Preparar Meal Prep',    type: 'BUILD', category: 'NUTRICION',     icon: '🥡', tags: ['nutrición','preparación'],       inputType: 'BOOLEAN', defaultScheduledDays: [7] },
  { id: 'h_no_anxiety_eat', title: 'No comer por ansiedad', type: 'BREAK', category: 'NUTRICION',     icon: '🚫', tags: ['nutrición','psicología'],        inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_no_ultraproc',   title: 'No ultraprocesados',    type: 'BREAK', category: 'NUTRICION',     icon: '🍫', tags: ['nutrición','calidad'],           inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_no_skip_meals',  title: 'No saltear comidas',    type: 'BREAK', category: 'NUTRICION',     icon: '⏰', tags: ['nutrición','timing'],            inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_no_alcohol',     title: 'Reducir alcohol',       type: 'BREAK', category: 'NUTRICION',     icon: '🍺', tags: ['nutrición','alcohol'],           inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },

  // ──── MINDSET ────
  { id: 'h_meditate',       title: '10min Meditación',      type: 'BUILD', category: 'MINDSET',       icon: '🧘', tags: ['mindset','meditación'],          inputType: 'NUMERIC', unit: 'min',   targetValue: 10, defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_reading',        title: 'Lectura (10 págs / 20m)',type: 'BUILD', category: 'MINDSET',      icon: '📖', tags: ['mindset','aprendizaje'],         inputType: 'NUMERIC', unit: 'min',   targetValue: 20, defaultScheduledDays: [1,2,3,4,5,6,7] },
  { id: 'h_writing',        title: 'Escritura / Journaling',type: 'BUILD', category: 'MINDSET',       icon: '✏️', tags: ['mindset','reflexión'],           inputType: 'NUMERIC', unit: 'min',   targetValue: 15, defaultScheduledDays: [1,2,3,4,5,6,7] },

  // ──── PRODUCTIVIDAD ────
  { id: 'h_deep_work',      title: 'Deep Work (2h Foco)',   type: 'BUILD', category: 'PRODUCTIVIDAD', icon: '🧠', tags: ['productividad','foco'],          inputType: 'NUMERIC', unit: 'min',   targetValue: 120, defaultScheduledDays: [1,2,3,4,5] },
  { id: 'h_checkin',        title: 'Check-in Clientes',     type: 'BUILD', category: 'PRODUCTIVIDAD', icon: '📋', tags: ['productividad','clientes'],      inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5] },
  { id: 'h_todo',           title: 'Completar To-Do',       type: 'BUILD', category: 'PRODUCTIVIDAD', icon: '✅', tags: ['productividad','organización'],  inputType: 'BOOLEAN', defaultScheduledDays: [1,2,3,4,5,6,7] },
];

// Orden de categorías para UI
export const CATEGORY_ORDER: HabitCategory[] = ['SUEÑO', 'FITNESS', 'NUTRICION', 'MINDSET', 'PRODUCTIVIDAD'];
export const CATEGORY_META: Record<HabitCategory, { label: string; icon: string; color: string }> = {
  'SUEÑO':         { label: 'Sueño & Recuperación', icon: '😴', color: 'indigo' },
  'FITNESS':       { label: 'Fitness & Movimiento',  icon: '🏋️', color: 'emerald' },
  'NUTRICION':     { label: 'Nutrición & Hidratación',icon: '🥗', color: 'amber' },
  'MINDSET':       { label: 'Mindset & Bienestar',   icon: '🧘', color: 'violet' },
  'PRODUCTIVIDAD': { label: 'Productividad',          icon: '🧠', color: 'cyan' },
  'CUSTOM':        { label: 'Personalizados',          icon: '⚙️', color: 'slate' },
};

// Lally et al. Thresholds
export const HABIT_LEVEL_THRESHOLDS = [7, 21, 45, 66, 90, 180, 365];
export const HABIT_LEVEL_LABELS = ['Inicio', 'Semana 1', 'Hábito', 'Automático', 'Lally', 'Maestro', 'Veterano', 'Leyenda'];

// Tolerancia dinámica para NUMERIC (90% = Zona LOW, 100% = Zona HIGH)
const NUMERIC_TOLERANCE = 0.90;

// ═══════════════════════════════════════════════════════════════
// INTERFACES DE ESTADO
// ═══════════════════════════════════════════════════════════════

export interface PrescribedHabit {
  id: string;
  serverId?: string;              // UUID de PostgreSQL en el backend
  syncStatus?: 'LOCAL' | 'SYNCED' | 'PENDING';
  clientId: string;
  templateId: string;
  title: string;
  type: HabitType;
  category: HabitCategory;
  tags: string[];
  inputType: HabitInputType;
  unit?: string;
  targetValue?: number;
  duration: HabitDuration;
  startDate: string;
  scheduledDays?: number[];       // [1..7] donde 1=Lunes, 7=Domingo. Por defecto todos [1,2,3,4,5,6,7]
  streakCurrent: number;
  streakBest: number;
  completedDays: string[];        // 'YYYY-MM-DD'
  dailyValues: Record<string, number>; // 'YYYY-MM-DD' → valor numérico
  dailyZones: Record<string, CompletionZone>; // 'YYYY-MM-DD' → zona
  level: number;
  isCustom: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  condition: string;
  unlockedAt: string | null;
}

interface HabitState {
  clients: string[]; 
  prescribedHabits: PrescribedHabit[];
  achievements: Achievement[];
  lastConfettiDate: string | null;
}

interface HabitActions {
  // Sincronización en la Nube
  setHabitsFromServer: (habits: PrescribedHabit[]) => void;
  setHabitSyncStatus: (habitId: string, status: 'LOCAL' | 'SYNCED' | 'PENDING', serverId?: string) => void;

  // Prescripción y Creación (Entrenador o Atleta)
  prescribeHabit: (clientId: string, templateId: string, duration?: HabitDuration, scheduledDays?: number[]) => void;
  prescribeCustomHabit: (clientId: string, habit: { 
    title: string; 
    type: HabitType; 
    category: HabitCategory; 
    inputType: HabitInputType;
    unit?: string;
    targetValue?: number;
    scheduledDays?: number[];
    tags?: string[];
  }) => void;
  updateHabitSchedule: (habitId: string, scheduledDays: number[]) => void;
  updateHabit: (habitId: string, updates: Partial<PrescribedHabit>) => void;
  removeHabit: (habitId: string) => void;

  // Cumplimiento (Atleta)
  completeDay: (habitId: string, date: string) => void;
  completeDayWithValue: (habitId: string, date: string, value: number) => void;
  uncompleteDay: (habitId: string, date: string) => void;
  markConfettiSeen: (date: string) => void;

  // Consultas
  getAdherence: (clientId: string) => number;
  getDailyCompletionRate: (clientId: string, date: string) => number;
  getDailyStreak: (clientId: string) => number;
  getCompletionZone: (habit: PrescribedHabit, date: string) => CompletionZone;
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Evaluar zona de cumplimiento
// ═══════════════════════════════════════════════════════════════

function evaluateZone(inputType: HabitInputType, targetValue: number | undefined, value: number | boolean): CompletionZone {
  if (inputType === 'BOOLEAN') {
    return value ? 'HIGH' : 'NONE';
  }

  // NUMERIC
  if (!targetValue || targetValue <= 0) return value ? 'HIGH' : 'NONE';
  const numVal = typeof value === 'number' ? value : 0;
  const ratio = numVal / targetValue;

  if (ratio >= 1.0) return 'HIGH';       // 100%+ → Excelencia
  if (ratio >= NUMERIC_TOLERANCE) return 'LOW';  // 90-99% → Tolerado (racha vive)
  return 'NONE';                           // <90% → No cumplido
}

function recalcLevel(completedDaysCount: number): number {
  let level = 0;
  for (let i = 0; i < HABIT_LEVEL_THRESHOLDS.length; i++) {
    if (completedDaysCount >= HABIT_LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

// ═══════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════

export const useHabitStore = create<HabitState & HabitActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        clients: [],
        prescribedHabits: [],
        achievements: [],
        lastConfettiDate: null,

        // ---------------------------------------------------------
        // ACTIONS
        // ---------------------------------------------------------

        setHabitsFromServer: (serverHabits) => set((state) => {
          // Merge o reemplazo inteligente
          state.prescribedHabits = serverHabits;
        }),

        setHabitSyncStatus: (habitId, syncStatus, serverId) => set((state) => {
          const habit = state.prescribedHabits.find((h) => h.id === habitId || h.serverId === habitId);
          if (habit) {
            habit.syncStatus = syncStatus;
            if (serverId) habit.serverId = serverId;
          }
        }),

        markConfettiSeen: (date: string) => set((state) => {
          state.lastConfettiDate = date;
        }),

        // ── PRESCRIPCIÓN & CREACIÓN DE HÁBITOS ──
        prescribeHabit: (clientId, templateId, duration = 'INDEFINITE', scheduledDays) => set(state => {
          const template = HABIT_CATALOG.find(h => h.id === templateId);
          if (!template) return;

          // Evitar duplicados activos
          const existing = state.prescribedHabits.find(
            h => h.clientId === clientId && h.templateId === templateId
          );
          if (existing) return;

          const days = scheduledDays && scheduledDays.length > 0 
            ? scheduledDays 
            : (template.defaultScheduledDays || [1, 2, 3, 4, 5, 6, 7]);

          state.prescribedHabits.push({
            id: uuidv4(),
            clientId,
            templateId,
            title: template.title,
            type: template.type,
            category: template.category,
            tags: [...template.tags],
            inputType: template.inputType,
            unit: template.unit,
            targetValue: template.targetValue,
            duration,
            startDate: new Date().toISOString(),
            scheduledDays: days,
            streakCurrent: 0,
            streakBest: 0,
            completedDays: [],
            dailyValues: {},
            dailyZones: {},
            level: 0,
            isCustom: false,
          });
        }),

        prescribeCustomHabit: (clientId, habit) => set(state => {
          const days = habit.scheduledDays && habit.scheduledDays.length > 0 
            ? habit.scheduledDays 
            : [1, 2, 3, 4, 5, 6, 7];

          state.prescribedHabits.push({
            id: uuidv4(),
            clientId,
            templateId: `custom_${Date.now()}`,
            title: habit.title,
            type: habit.type,
            category: habit.category,
            tags: habit.tags && habit.tags.length > 0 ? habit.tags : ['custom'],
            inputType: habit.inputType,
            unit: habit.unit,
            targetValue: habit.targetValue,
            duration: 'INDEFINITE',
            startDate: new Date().toISOString().split('T')[0],
            scheduledDays: days,
            streakCurrent: 0,
            streakBest: 0,
            completedDays: [],
            dailyValues: {},
            dailyZones: {},
            level: 1,
            isCustom: true
          });
        }),

        updateHabitSchedule: (habitId, scheduledDays) => set(state => {
          const habit = state.prescribedHabits.find(h => h.id === habitId);
          if (habit) {
            habit.scheduledDays = scheduledDays.length > 0 ? scheduledDays : [1, 2, 3, 4, 5, 6, 7];
          }
        }),

        updateHabit: (habitId, updates) => set(state => {
          const habit = state.prescribedHabits.find(h => h.id === habitId);
          if (habit) {
            Object.assign(habit, updates);
          }
        }),

        removeHabit: (habitId) => set(state => {
          const idx = state.prescribedHabits.findIndex(h => h.id === habitId);
          if (idx !== -1) state.prescribedHabits.splice(idx, 1);
        }),

        // ── CUMPLIMIENTO BOOLEAN (Atleta) ──
        completeDay: (habitId, date) => set(state => {
          const habit = state.prescribedHabits.find(h => h.id === habitId);
          if (!habit) return;

          if (!habit.completedDays.includes(date)) {
            // Marcar completado
            habit.completedDays.push(date);
            habit.dailyZones[date] = 'HIGH'; // BOOLEAN siempre es HIGH si completado
            habit.streakCurrent += 1;
            if (habit.streakCurrent > habit.streakBest) habit.streakBest = habit.streakCurrent;
            habit.level = recalcLevel(habit.completedDays.length);
          } else {
            // Toggle off
            habit.completedDays = habit.completedDays.filter(d => d !== date);
            delete habit.dailyZones[date];
            delete habit.dailyValues[date];
            habit.streakCurrent = Math.max(0, habit.streakCurrent - 1);
            habit.level = recalcLevel(habit.completedDays.length);
          }
        }),

        // ── CUMPLIMIENTO NUMÉRICO (Atleta) ──
        completeDayWithValue: (habitId, date, value) => set(state => {
          const habit = state.prescribedHabits.find(h => h.id === habitId);
          if (!habit) return;

          const zone = evaluateZone(habit.inputType, habit.targetValue, value);
          habit.dailyValues[date] = value;
          habit.dailyZones[date] = zone;

          if (zone !== 'NONE') {
            // Cumplido (LOW o HIGH) → racha vive
            if (!habit.completedDays.includes(date)) {
              habit.completedDays.push(date);
              habit.streakCurrent += 1;
              if (habit.streakCurrent > habit.streakBest) habit.streakBest = habit.streakCurrent;
              habit.level = recalcLevel(habit.completedDays.length);
            }
          } else {
            // No cumplido → rompe racha
            if (habit.completedDays.includes(date)) {
              habit.completedDays = habit.completedDays.filter(d => d !== date);
              habit.streakCurrent = Math.max(0, habit.streakCurrent - 1);
              habit.level = recalcLevel(habit.completedDays.length);
            }
          }
        }),

        uncompleteDay: (habitId, date) => set(state => {
          const habit = state.prescribedHabits.find(h => h.id === habitId);
          if (!habit) return;
          habit.completedDays = habit.completedDays.filter(d => d !== date);
          delete habit.dailyValues[date];
          delete habit.dailyZones[date];
          habit.streakCurrent = Math.max(0, habit.streakCurrent - 1);
          habit.level = recalcLevel(habit.completedDays.length);
        }),

        // ── CONSULTAS ──
        getAdherence: (clientId) => {
          const habits = get().prescribedHabits.filter(h => h.clientId === clientId);
          if (habits.length === 0) return 0;
          let totalPrescribed = 0;
          let totalCompleted = 0;
          habits.forEach(h => {
            const start = new Date(h.startDate).getTime();
            const now = new Date().getTime();
            const daysActive = Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));
            // Multiplicamos por la fracción de días programados
            const scheduledFraction = (h.scheduledDays?.length || 7) / 7;
            totalPrescribed += Math.max(1, Math.round(daysActive * scheduledFraction));
            totalCompleted += h.completedDays.length;
          });
          return totalPrescribed === 0 ? 0 : Math.min(100, Math.round((totalCompleted / totalPrescribed) * 100));
        },

        getDailyCompletionRate: (clientId, date) => {
          const habits = get().prescribedHabits.filter(h => h.clientId === clientId);
          if (habits.length === 0) return 0;
          // Filtrar hábitos programados para este día de la semana
          const scheduledToday = habits.filter(h => isHabitScheduledForDay(h, date));
          if (scheduledToday.length === 0) return 100; // Si no hay hábitos programados hoy, está al 100%
          const completed = scheduledToday.filter(h => h.completedDays.includes(date)).length;
          return Math.round((completed / scheduledToday.length) * 100);
        },

        getDailyStreak: (clientId) => {
          const habits = get().prescribedHabits.filter(h => h.clientId === clientId);
          if (habits.length === 0) return 0;

          let streak = 0;
          const now = new Date();
          for (let i = 0; i < 365; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            const scheduledOnDay = habits.filter(h => isHabitScheduledForDay(h, key));
            if (scheduledOnDay.length === 0) continue; // Día sin hábitos no rompe racha
            const allCompleted = scheduledOnDay.every(h => h.completedDays.includes(key));
            if (allCompleted) streak++;
            else break;
          }
          return streak;
        },

        getCompletionZone: (habit, date) => {
          return habit.dailyZones[date] || 'NONE';
        },
      })),
      { name: 'habit-storage-v2' }
    )
  )
);

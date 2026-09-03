import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useExecutionStore } from './useExecutionStore';
import { useHabitStore } from './useHabitStore';
import { format } from 'date-fns';

export type AgendaTaskStatus = 'SCHEDULED' | 'PENDING' | 'COMPLETED' | 'COMPLETED_BY_COACH';

export interface AgendaTask {
    id: string;
    time: string;
    type: 'training' | 'nutrition' | 'coach' | 'class';
    title: string;
    instructor?: string;
    status: AgendaTaskStatus;
    actionRoute: string; // The route to force navigation to
}

export interface RecurringClass {
    id: string;
    title: string;
    instructorName: string;
    daysOfWeek: number[]; // 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
    time: string; // ej: "19:00"
    durationMinutes: number;
    activityType: string;
}

interface AgendaStore {
    recurringClasses: RecurringClass[];
    overrides: Record<string, { reason: string; timestamp: number }>; // taskId_date -> override data
    
    // Actions
    addRecurringClass: (item: Omit<RecurringClass, 'id'>) => string;
    removeRecurringClass: (id: string) => void;
    getAgendaForDate: (date: Date) => AgendaTask[];
    evaluateDailyCompletion: () => void;
    overrideTaskByCoach: (taskId: string, dateStr: string, reason: string) => void;
}

const DEFAULT_RECURRING_CLASSES: RecurringClass[] = [
    {
        id: 'rec-crossfit-1',
        title: 'CrossFit WOD',
        instructorName: 'Prof. Marcos',
        daysOfWeek: [1, 3, 5], // Lun, Mié, Vie
        time: '19:00',
        durationMinutes: 50,
        activityType: 'CROSSFIT'
    },
    {
        id: 'rec-yoga-1',
        title: 'Yoga & Movilidad',
        instructorName: 'Prof. Sofía',
        daysOfWeek: [2, 4], // Mar, Jue
        time: '18:00',
        durationMinutes: 45,
        activityType: 'YOGA'
    }
];

export const useAgendaStore = create<AgendaStore>()(
    persist(
        (set, get) => ({
            recurringClasses: DEFAULT_RECURRING_CLASSES,
            overrides: {},

            addRecurringClass: (item) => {
                const newId = `rec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
                const newClass: RecurringClass = {
                    ...item,
                    id: newId
                };
                set((state) => ({
                    recurringClasses: [...state.recurringClasses, newClass]
                }));
                return newId;
            },

            removeRecurringClass: (id) => {
                set((state) => ({
                    recurringClasses: state.recurringClasses.filter(c => c.id !== id)
                }));
            },

            getAgendaForDate: (date: Date) => {
                const today = new Date();
                const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayOfWeek = date.getDay(); // 0=Dom ... 6=Sab
                const tasks: AgendaTask[] = [];

                const { sessionHistory } = useExecutionStore.getState();

                // 1. ENTRENAMIENTO PROGRAMADO (Fuerza / Rutina)
                let trainingStatus: AgendaTaskStatus = isToday ? 'PENDING' : 'SCHEDULED';
                const overrideKeyTrain = `train_${dateStr}`;
                if (get().overrides[overrideKeyTrain]) {
                    trainingStatus = 'COMPLETED_BY_COACH';
                } else if (sessionHistory.some(s => s.date === dateStr && s.status === 'COMPLETED')) {
                    trainingStatus = 'COMPLETED';
                }

                tasks.push({
                    id: 'train',
                    time: '08:00',
                    type: 'training',
                    title: 'Entrenamiento del Día (Fuerza)',
                    status: trainingStatus,
                    actionRoute: '/athlete/canvas'
                });

                // 2. CLASES GRUPALES Y ACTIVIDADES FIJAS EN AGENDA
                const classesForDay = (get().recurringClasses || []).filter(c => c.daysOfWeek.includes(dayOfWeek));
                classesForDay.forEach((cls) => {
                    const taskKey = `class_${cls.id}_${dateStr}`;
                    let classStatus: AgendaTaskStatus = isToday ? 'PENDING' : 'SCHEDULED';
                    if (get().overrides[taskKey]) {
                        classStatus = 'COMPLETED_BY_COACH';
                    }

                    tasks.push({
                        id: `class-${cls.id}`,
                        time: cls.time,
                        type: 'class',
                        title: cls.title,
                        instructor: cls.instructorName,
                        status: classStatus,
                        actionRoute: '/athlete'
                    });
                });

                // 3. TRACKER NUTRICIONAL
                let nutritionStatus: AgendaTaskStatus = isToday ? 'PENDING' : 'SCHEDULED';
                const overrideKeyNutri = `meal_${dateStr}`;
                if (get().overrides[overrideKeyNutri]) {
                    nutritionStatus = 'COMPLETED_BY_COACH';
                }
                tasks.push({
                    id: 'meal',
                    time: '12:30',
                    type: 'nutrition',
                    title: 'Tracker Nutricional',
                    status: nutritionStatus,
                    actionRoute: '/athlete/nutrition'
                });

                // Ordenar tareas por hora cronológica
                return tasks.sort((a, b) => a.time.localeCompare(b.time));
            },

            overrideTaskByCoach: (taskId: string, dateStr: string, reason: string) => {
                set((state) => ({
                    overrides: {
                        ...state.overrides,
                        [`${taskId}_${dateStr}`]: { reason, timestamp: Date.now() }
                    }
                }));
                get().evaluateDailyCompletion();
            },

            evaluateDailyCompletion: () => {
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const agenda = get().getAgendaForDate(today);
                
                const allCompleted = agenda.every(t => t.status === 'COMPLETED' || t.status === 'COMPLETED_BY_COACH');
                
                if (allCompleted) {
                    const habitStore = useHabitStore.getState();
                    const todoHabit = habitStore.prescribedHabits.find(h => h.templateId === 'h_todo');
                    if (todoHabit && !todoHabit.completedDays.includes(todayStr)) {
                        habitStore.completeDay(todoHabit.id, todayStr);
                    }
                }
            }
        }),
        {
            name: 'useAgendaStore',
            partialize: (state) => ({
                recurringClasses: state.recurringClasses,
                overrides: state.overrides
            })
        }
    )
);

// Setup global listener to evaluate completion whenever ExecutionStore changes
useExecutionStore.subscribe((state, prevState) => {
    if (state.sessionHistory.length > prevState.sessionHistory.length) {
        useAgendaStore.getState().evaluateDailyCompletion();
    }
});

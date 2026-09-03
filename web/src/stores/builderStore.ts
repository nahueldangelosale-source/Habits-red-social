
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TYPES (Archetypes)
// ============================================================================
export interface Archetype {
    id: string;
    type: 'NUTRITION' | 'FITNESS';
    name: string;
    description: string;
    tags: string[]; // "Low Carb", "Hypertrophy", "Glutes"
    config: any; // Type specific config
    baseStructure: any; // DietPlan | WorkoutPlan
    clinicalMetric?: string; // e.g. "HOMA-IR > 3.2"
}

// Nutrition Config
export interface NutritionArchetypeConfig {
    macroSplit: { p: number; c: number; f: number }; // 40/40/20
    mealFrequency: number; // 3 or 4 or 5
    whitelistedTags: string[]; // "lean_meat", "green_veggies"
    blacklistedTags: string[]; // "sugar", "flour"
    deficit: number; // 500
}

// Fitness Config
export interface FitnessArchetypeConfig {
    daysPerWeek: number;
    splitType: 'torso_leg' | 'full_body' | 'bro_split';
    progressionModel: 'linear' | 'volume' | 'undulating';
    focus: string[]; // "glutes", "chest"
    intensityRule: string; // "RIR 2"
}

// ============================================================================
// TYPES (Nutrition)
// ============================================================================
export interface FoodItem {
    id: string;
    name: string;
    portion: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    category: 'protein' | 'carb' | 'fat' | 'veggie' | 'fruit' | 'dairy';
    isLocal: boolean;
    costLevel: 1 | 2 | 3; // 1=Low, 3=High
    tags: string[];
}

export interface MealBlock {
    id: string;
    name: string;
    time: string;
    foods: FoodItem[];
}

export interface DietPlan {
    id: string;
    name: string;
    days: Record<string, MealBlock[]>; // 'monday': [Breakfast, Lunch...]
}

// ============================================================================
// TYPES (Fitness)
// ============================================================================
export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string; // "8-12" or "10"
    rpe: number; // 1-10
    weight?: number;
    rest?: string | number;
    supersetId?: string;
    videoUrl?: string;
}

export interface WorkoutDay {
    id: string;
    name: string; // "Leg Day"
    exercises: Exercise[];
}

export interface WorkoutPlan {
    id: string;
    name: string;
    days: WorkoutDay[];
}

// ============================================================================
// MOCK DATA (Knowledge Graph)
// ============================================================================
const INJURY_SWAPS: Record<string, Record<string, string>> = {
    'lower_back_pain': {
        'Deadlift': 'Hip Thrust',
        'Barbell Squat': 'Bulgarian Split Squat',
        'Bent Over Row': 'Chest Supported Row'
    },
    'knee_pain': {
        'Leg Extension': 'Step Ups',
        'Lunge': 'Reverse Lunge',
        'Jump Squat': 'Box Squat'
    }
};

// ============================================================================
// STORE INTERFACE
// ============================================================================
interface BuilderState {
    // NUTRITION STATE
    activeDiet: DietPlan;
    dietHistory: DietPlan[]; // For Undo/Redo (future)

    // FITNESS STATE
    activeWorkout: WorkoutPlan;
    archetypes: Archetype[];

    // ACTIONS (Nutrition)
    addFoodToMeal: (day: string, mealId: string, food: FoodItem) => void;
    removeFoodFromMeal: (day: string, mealId: string, foodId: string) => void;
    updatePortion: (day: string, mealId: string, foodId: string, newPortion: number) => void;
    setDietName: (name: string) => void;
    wipeDiet: () => void;
    populateMockDiet: () => void;

    // ACTIONS (Fitness)
    addExercise: (dayId: string, exercise: Exercise) => void;
    groupSuperset: (dayId: string, exerciseId1: string, exerciseId2: string) => void;
    applyProgressiveOverload: (sourceDayId: string, targetDayId: string, mode: 'linear' | 'volume') => void;

    // ACTIONS (Archetypes)
    applyArchetype: (userId: string, archetypeId: string) => void;
    saveAsArchetype: (type: 'NUTRITION' | 'FITNESS', name: string, config: any) => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================
export const useBuilderStore = create<BuilderState>()(
    persist(
        (set) => ({
            // INIT STATE
            activeDiet: {
                id: 'draft-1',
                name: 'New Personalized Plan',
                days: {
                    'day_a': [
                        { id: 'm1', name: 'Desayuno', time: '08:00', foods: [] },
                        { id: 'm2', name: 'Almuerzo', time: '13:00', foods: [] },
                        { id: 'm3', name: 'Merienda', time: '17:00', foods: [] },
                        { id: 'm4', name: 'Cena', time: '21:00', foods: [] },
                    ],
                    'day_b': [
                        { id: 'm1', name: 'Desayuno', time: '08:00', foods: [] },
                        { id: 'm2', name: 'Almuerzo', time: '13:00', foods: [] },
                        { id: 'm3', name: 'Merienda', time: '17:00', foods: [] },
                        { id: 'm4', name: 'Cena', time: '21:00', foods: [] },
                    ]
                }
            },
            dietHistory: [],
            activeWorkout: {
                id: 'workout-draft-1',
                name: 'Hypertrophy Phase 1',
                days: []
            },
            archetypes: [
                {
                    id: 'arch-gi',
                    type: 'NUTRITION',
                    name: 'Gastro-Inmunológico (SII/SIBO)',
                    description: 'Eliminación estricta de carbohidratos fermentables (FODMAPs) y fase de reintroducción.',
                    tags: ['FODMAPs', 'SIBO', 'Gut'],
                    config: { deficit: 0, macroSplit: { p: 30, c: 30, f: 40 }, blacklistedTags: ['FODMAPs'] },
                    baseStructure: null,
                    clinicalMetric: 'Calprotectina Fecal > 50 µg/g'
                },
                {
                    id: 'arch-aesthetic',
                    type: 'NUTRITION',
                    name: 'Estético y Recomposición Corporal',
                    description: 'Déficit calórico moderado con secuenciación de 4-5 comidas hiperproteicas.',
                    tags: ['High Protein', 'Fat Loss', 'Recomp'],
                    config: { deficit: 500, macroSplit: { p: 40, c: 30, f: 30 }, blacklistedTags: [] },
                    baseStructure: null,
                    clinicalMetric: 'BF > 22% (Target: 15%)'
                },
                {
                    id: 'arch-performance',
                    type: 'NUTRITION',
                    name: 'Rendimiento y Ciclado (Carb Cycling)',
                    description: 'Días asimétricos sincronizados con el calendario de entrenamiento y recuperación.',
                    tags: ['Carb Cycling', 'Athlete'],
                    config: { deficit: 0, macroSplit: { p: 30, c: 50, f: 20 }, blacklistedTags: [] },
                    baseStructure: null,
                    clinicalMetric: 'Altas cargas ACWR'
                },
                {
                    id: 'arch-endocrine',
                    type: 'NUTRITION',
                    name: 'Endocrino-Metabólico',
                    description: 'Método del Plato y Secuenciación (Fibra/Proteína primero) para control glucémico.',
                    tags: ['MetS', 'Pre-diabetes'],
                    config: { deficit: 300, macroSplit: { p: 35, c: 25, f: 40 }, blacklistedTags: ['Sugar', 'Refined Grains'] },
                    baseStructure: null,
                    clinicalMetric: 'HOMA-IR > 3.2'
                },
                {
                    id: 'arch-longevity',
                    type: 'NUTRITION',
                    name: 'Longevidad y Anti-aging',
                    description: 'Ayuno Intermitente (TRE) sincronizado con ritmos circadianos y dieta rica en polifenoles.',
                    tags: ['Autophagy', 'TRE', 'Longevity'],
                    config: { deficit: 200, macroSplit: { p: 25, c: 35, f: 40 }, blacklistedTags: ['Ultra-Processed'] },
                    baseStructure: null,
                    clinicalMetric: 'PCR-us > 2.0 mg/L'
                },
                {
                    id: 'arch-2',
                    type: 'FITNESS',
                    name: 'Hipertrofia Glúteos - Nivel Intermedio',
                    description: 'Foco en cadena posterior con alta frecuencia.',
                    tags: ['Glutes', 'Hypertrophy', 'Intermediate'],
                    config: { focus: ['glutes'], intensityRule: 'RIR 2' },
                    baseStructure: {
                        id: 'arch-base-2',
                        name: 'Glute Focus Template',
                        days: [
                            {
                                id: 'd1', name: 'Glutes & Hams', exercises: [
                                    { id: 'ex1', name: 'Hip Thrust', sets: 4, reps: '8-12', rpe: 9, rest: 120 },
                                    { id: 'ex2', name: 'Deadlift', sets: 3, reps: '6-8', rpe: 8, rest: 180 }, // Injury risk!
                                    { id: 'ex3', name: 'Bulgarian Split Squat', sets: 3, reps: '10-12', rpe: 9, rest: 90 }
                                ]
                            }
                        ]
                    }
                }
            ],

            // ACTIONS
            addFoodToMeal: (day, mealId, food) => set((state) => {
                const days = { ...state.activeDiet.days };
                const mealIndex = days[day].findIndex(m => m.id === mealId);
                if (mealIndex === -1) return state; // Meal not found

                const updatedMeal = { ...days[day][mealIndex] };
                updatedMeal.foods = [...updatedMeal.foods, food];
                days[day][mealIndex] = updatedMeal;

                return { activeDiet: { ...state.activeDiet, days } };
            }),

            removeFoodFromMeal: (day, mealId, foodId) => set((state) => {
                const days = { ...state.activeDiet.days };
                const mealIndex = days[day].findIndex(m => m.id === mealId);
                if (mealIndex === -1) return state;

                const updatedMeal = { ...days[day][mealIndex] };
                updatedMeal.foods = updatedMeal.foods.filter(f => f.id !== foodId);
                days[day][mealIndex] = updatedMeal;

                return { activeDiet: { ...state.activeDiet, days } };
            }),

            updatePortion: (day, mealId, foodId, newPortion) => set((state) => {
                const days = { ...state.activeDiet.days };
                const mealIndex = days[day].findIndex(m => m.id === mealId);
                if (mealIndex === -1) return state;

                const updatedMeal = { ...days[day][mealIndex] };
                updatedMeal.foods = updatedMeal.foods.map(f => {
                    if (f.id !== foodId) return f;
                    // Auto-scale macros
                    const ratio = newPortion / f.portion;
                    return {
                        ...f,
                        portion: newPortion,
                        calories: Math.round(f.calories * ratio),
                        protein: Number((f.protein * ratio).toFixed(1)),
                        carbs: Number((f.carbs * ratio).toFixed(1)),
                        fats: Number((f.fats * ratio).toFixed(1)),
                    };
                });
                days[day][mealIndex] = updatedMeal;

                return { activeDiet: { ...state.activeDiet, days } };
            }),

            setDietName: (name) => set((state) => ({
                activeDiet: { ...state.activeDiet, name }
            })),

            wipeDiet: () => set((state) => {
                const emptyDays: any = {};
                ['day_a', 'day_b'].forEach(day => {
                    emptyDays[day] = [
                        { id: 'm1', name: 'Desayuno', time: '08:00', foods: [] },
                        { id: 'm2', name: 'Almuerzo', time: '13:00', foods: [] },
                        { id: 'm3', name: 'Merienda', time: '17:00', foods: [] },
                        { id: 'm4', name: 'Cena', time: '21:00', foods: [] },
                    ];
                });
                return { activeDiet: { ...state.activeDiet, days: emptyDays, name: 'Lienzo en Blanco' } };
            }),

            populateMockDiet: () => set((state) => {
                const populatedDays: any = {};
                ['day_a', 'day_b'].forEach(day => {
                    populatedDays[day] = [
                        {
                            id: 'm1', name: 'Desayuno', time: '08:00', foods: [
                                { id: 'f1', name: 'Huevos Revueltos', portion: 2, unit: 'unidades', calories: 140, protein: 12, carbs: 1, fats: 10, category: 'protein', isLocal: true, costLevel: 1, tags: ['keto'] },
                                { id: 'f2', name: 'Palta', portion: 50, unit: 'g', calories: 80, protein: 1, carbs: 4, fats: 7, category: 'fat', isLocal: true, costLevel: 2, tags: ['keto'] }
                            ]
                        },
                        {
                            id: 'm2', name: 'Almuerzo', time: '13:00', foods: [
                                { id: 'f3', name: 'Pechuga de Pollo', portion: 150, unit: 'g', calories: 165, protein: 31, carbs: 0, fats: 3, category: 'protein', isLocal: true, costLevel: 1, tags: ['lean_meat'] },
                                { id: 'f4', name: 'Quinoa', portion: 80, unit: 'g', calories: 96, protein: 3, carbs: 17, fats: 1, category: 'carb', isLocal: false, costLevel: 2, tags: ['complex_carb'] },
                                { id: 'f5', name: 'Ajo Salteado', portion: 10, unit: 'g', calories: 15, protein: 0.5, carbs: 3, fats: 0.1, category: 'veggie', isLocal: true, costLevel: 1, tags: ['FODMAPs', 'Alergeno'] } // Alerta SIBO intencional
                            ]
                        },
                        { id: 'm3', name: 'Merienda', time: '17:00', foods: [] },
                        { id: 'm4', name: 'Cena', time: '21:00', foods: [] },
                    ];
                });
                return { activeDiet: { ...state.activeDiet, days: populatedDays, name: 'Protocolo Gastro-Inmunológico (Borrador 90%)' } };
            }),

            addExercise: (_dayId, _exercise) => set((state) => {
                // TODO: Implement Fitness Logic
                return state;
            }),

            groupSuperset: (_dayId, _ex1, _ex2) => set((state) => {
                // TODO: Implement visual bracket logic
                return state;
            }),

            applyProgressiveOverload: (_sourceDayId, _targetDayId, _mode) => set((state) => {
                // TODO: The "Magic Modal" Logic
                return state;
            }),

            // --------------------------------------------------------------------------
            // SMART ARCHETYPE LOGIC ("The Auto-Morph Engine")
            // --------------------------------------------------------------------------
            applyArchetype: (userId, archetypeId) => set((state) => {
                const archetype = state.archetypes.find(a => a.id === archetypeId);
                if (!archetype) return state;

                console.log(`🌀 [Auto-Morph] Applying ${archetype.name} to user ${userId}`);

                // MOCK USER BIOMETRICS (In real app, fetch from UserContext)
                const mockUser = {
                    id: userId,
                    bmr: 2000,
                    injuries: ['lower_back_pain'], // TRIGGER FOR SMART SWAP
                    allergies: ['gluten']
                };

                if (archetype.type === 'FITNESS') {
                    // 1. Clone base structure
                    const newWorkout = JSON.parse(JSON.stringify(archetype.baseStructure)) as WorkoutPlan;

                    // 2. Apply "Smart Swap" for Injuries
                    newWorkout.days.forEach(day => {
                        day.exercises = day.exercises.map((ex: Exercise) => {
                            // Check compatibility
                            for (const injury of mockUser.injuries) {
                                const swaps = INJURY_SWAPS[injury];
                                if (swaps && swaps[ex.name]) {
                                    console.log(`⚠️ Injury Alert: Swapping ${ex.name} -> ${swaps[ex.name]}`);
                                    return {
                                        ...ex,
                                        name: swaps[ex.name],
                                        id: ex.id + '-safe',
                                        tags: ['injury_safe']
                                    };
                                }
                            }
                            return ex;
                        });
                    });

                    // 3. Auto-Scale Weights (Mock logic)
                    // newWorkout.days... (future: scale based on 1RM)

                    return { activeWorkout: newWorkout };
                }

                if (archetype.type === 'NUTRITION') {
                    // 1. Calculate Targets
                    // const targetCals = mockUser.bmr - archetype.config.deficit;
                    // ... implementation ...
                    return state;
                }

                return state;
            }),

            saveAsArchetype: (type, name, _config) => set((state) => {
                const newArchetype: Archetype = {
                    id: `arch-${Date.now()}`,
                    type,
                    name,
                    description: 'Custom Template',
                    tags: ['User Created'],
                    config: _config,
                    baseStructure: type === 'NUTRITION' ? state.activeDiet : state.activeWorkout
                };

                return { archetypes: [...state.archetypes, newArchetype] };
            }),

        }),
        {
            name: 'builder-storage',
            // getStorage: () => localStorage,
        }
    )
);

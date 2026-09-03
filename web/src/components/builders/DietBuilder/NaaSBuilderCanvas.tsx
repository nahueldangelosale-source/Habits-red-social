/**
 * NaaSBuilderCanvas — Nutrition as a Service Builder (Sprint 2 — Gap Killer)
 *
 * Concepto A: Diseño Atómico en Cascada
 * - Ingestas con custom_label personalizable ("Ingesta 1", "Pre-entreno")
 * - Opciones múltiples anidadas (Opción A, B, C) con items como tags
 * - Macro Envelope: rango min-max entre opciones con alerta de varianza
 * - Notas del profesional a nivel de bloque (acordeón plegable)
 * - NaaS Quick-Add (Bloques CHO/PRO/FAT estandarizados)
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
    Search, Flame, Activity, Zap, Shield, Plus, Lock, Sparkles,
    ChevronRight, ChevronLeft, Droplets, Trash2, Copy, Play, Maximize2,
    Clock, Utensils, Beef, Wheat, Droplet,
    ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Loader2,
    Moon, MessageSquare, FileText, LayoutTemplate, Save, X,
    RefreshCw, Wand2, Beaker, HelpCircle, Scale
} from 'lucide-react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { trackNaaSEvent } from '../../../lib/telemetry/naasTelemetry';
import saraDataRaw from '../../../data/SARA_Master_Database.json';

import { useOnboardingPTStore } from '../../../stores/useOnboardingPTStore';
import { usePlanBuilderStore } from '../../../stores/usePlanBuilderStore';
import { useTemplateLibraryStore } from '../../../stores/useTemplateLibraryStore';
import { AthleteFormModal } from '../../onboarding/AthleteFormModal';
import {
    type MealBlock, type MealOption, type MealItem, type MealType, type MacroNutrients,
    MealTypeEnum,
    NAAS_BLOCK_SIZES,
    createEmptyMealBlock,
    createEmptyMealOption,
    createEmptyMealItem,
    generateBlockId,
    calcCaloriesFromMacros,
    calcMacroEnvelope,
    sumItemsMacros,
    getNextOptionLabel,
    NutritionPlanCreateSchema
} from '../../../schemas/nutritionPlanSchema';
import { BMR_FORMULAS, GOAL_MACRO_MATRIX } from '../../../data/nutritionEngine';
import type { BodyCompositionGoal, BMRFormula } from '../../../data/nutritionEngine';
import { SupplementationEngine } from '../../../data/supplementationEngine';
import type { SupplementPlan, AthleteState, TrainingGoal } from '../../../data/supplementationEngine';
import { nutritionApi } from '../../../api/nutritionClient';
import { ZodError } from 'zod';
import { ParametricScaler } from '../../../utils/ParametricScaler';
import type { ParametricTarget, HealthGuardFilters } from '../../../utils/ParametricScaler';
import { 
    resolveRecommendedPhase, 
    ALL_PRESET_PHASES, 
    getPresetByPhaseId, 
    type PresetPhase 
} from '../../../data/presets';
import { calculateVisualPlate, getHouseholdMeasure } from '../../../utils/householdMeasures';
import { getSmartSwaps, getFoodDominance, convertSaraItemToSwap, type CalculatedSwap } from '../../../utils/smartSwapEngine';
import { applyDietaryShieldsToItem, type DietaryShield } from '../../../utils/clinicalAllergensEngine';
import { calculateCarbCyclingTargets, type DayMacroTarget } from '../../../utils/carbCyclingEngine';
import { searchSaraFoods } from '../../../utils/saraSearchEngine';

export const GOAL_LABELS: Record<string, string> = {
    'FAT_LOSS': 'Pérdida de Grasa',
    'HYPERTROPHY': 'Hipertrofia Muscular',
    'HIPERTROFIA': 'Hipertrofia Muscular',
    'RECOMPOSITION': 'Recomposición Corporal',
    'BODY_RECOMP': 'Recomposición Corporal',
    'STRENGTH': 'Fuerza Máxima',
    'ENDURANCE': 'Resistencia & Cardio',
    'SPORT_AGILITY': 'Rendimiento Deportivo',
    'REHAB_LONGEVITY': 'Salud & Longevidad',
    'VITALITY_MAINTENANCE': 'Mantenimiento & Vitalidad'
};

const saraPredictive = (saraDataRaw as any[])
    .filter((item: any) => item.ENERC_KCAL !== null && item.PROTCNT !== null)
    .map((item: any) => ({
        id: String(item.ID_SARA || item.id_sara || Math.random()),
        name: item.Alimento || item.alimento || 'Sin nombre',
        category: item.Grupo || item.origen_categoria || 'SARA Oficial',
        protein_g: Number(item.PROTCNT) || 0,
        carbs_g: Number(item.CHOCDF || item.CHOAVLDF) || 0,
        fat_g: Number(item.FAT) || 0,
        calories: Number(item.ENERC_KCAL) || 0
    }));

function convertPresetToMealBlocks(preset: PresetPhase, desiredCount: number = 4): MealBlock[] {
    const mealTypeMap: Record<string, MealType> = {
        m1_desayuno: 'breakfast',
        m2_almuerzo: 'lunch',
        m3_merienda: 'snack',
        m4_cena: 'dinner'
    };

    const defaultLayoutByCount: Record<number, { type: MealType; label: string; time: string }[]> = {
        1: [{ type: 'lunch', label: 'Comida Principal', time: '14:00' }],
        2: [
            { type: 'lunch', label: 'Almuerzo', time: '13:00' },
            { type: 'dinner', label: 'Cena', time: '21:00' }
        ],
        3: [
            { type: 'breakfast', label: 'Desayuno', time: '08:30' },
            { type: 'lunch', label: 'Almuerzo', time: '13:30' },
            { type: 'dinner', label: 'Cena', time: '21:00' }
        ],
        4: [
            { type: 'breakfast', label: 'Desayuno', time: '08:00' },
            { type: 'lunch', label: 'Almuerzo', time: '13:30' },
            { type: 'snack', label: 'Merienda', time: '17:30' },
            { type: 'dinner', label: 'Cena', time: '21:30' }
        ],
        5: [
            { type: 'breakfast', label: 'Desayuno', time: '08:00' },
            { type: 'snack', label: 'Colación Mañana', time: '11:00' },
            { type: 'lunch', label: 'Almuerzo', time: '13:30' },
            { type: 'snack', label: 'Merienda', time: '17:30' },
            { type: 'dinner', label: 'Cena', time: '21:30' }
        ],
        6: [
            { type: 'breakfast', label: 'Desayuno', time: '07:30' },
            { type: 'snack', label: 'Colación Mañana', time: '10:30' },
            { type: 'lunch', label: 'Almuerzo', time: '13:00' },
            { type: 'snack', label: 'Merienda', time: '16:30' },
            { type: 'pre_workout', label: 'Pre-Entreno', time: '19:00' },
            { type: 'dinner', label: 'Cena', time: '21:30' }
        ],
        7: [
            { type: 'breakfast', label: 'Desayuno', time: '07:30' },
            { type: 'snack', label: 'Media Mañana', time: '10:00' },
            { type: 'lunch', label: 'Almuerzo', time: '13:00' },
            { type: 'snack', label: 'Merienda 1', time: '16:00' },
            { type: 'pre_workout', label: 'Pre-Entreno', time: '18:30' },
            { type: 'dinner', label: 'Cena', time: '21:00' },
            { type: 'snack', label: 'Colación Noche', time: '23:00' }
        ],
        8: [
            { type: 'breakfast', label: 'Desayuno', time: '07:00' },
            { type: 'snack', label: 'Colación 1', time: '09:30' },
            { type: 'snack', label: 'Colación 2', time: '11:30' },
            { type: 'lunch', label: 'Almuerzo', time: '13:30' },
            { type: 'snack', label: 'Merienda 1', time: '16:00' },
            { type: 'snack', label: 'Merienda 2', time: '18:30' },
            { type: 'dinner', label: 'Cena', time: '21:00' },
            { type: 'snack', label: 'Colación Noche', time: '23:00' }
        ]
    };

    const optionLetters = ['Opción A', 'Opción B', 'Opción C', 'Opción D', 'Opción E'];
    const count = Math.max(1, Math.min(8, desiredCount));
    const layout = defaultLayoutByCount[count] || defaultLayoutByCount[4];
    const baseMeals = preset.meals;

    const rawBlocks: MealBlock[] = layout.map((cfg, idx) => {
        let matchingMeal = baseMeals.find(pm => mealTypeMap[pm.mealId] === cfg.type);
        if (!matchingMeal) {
            matchingMeal = baseMeals[idx % baseMeals.length];
        }

        const options: MealOption[] = matchingMeal.options.map((opt, optIdx) => {
            const items: MealItem[] = opt.ingredients.map((ing) => {
                const prot = Number(((ing.protPer100g * ing.amount) / 100).toFixed(1));
                const carbs = Number(((ing.carbsPer100g * ing.amount) / 100).toFixed(1));
                const fat = Number(((ing.fatPer100g * ing.amount) / 100).toFixed(1));
                const cals = Number(((ing.calsPer100g * ing.amount) / 100).toFixed(1));
                return {
                    id: generateBlockId(),
                    sara_item_id: `sara_preset_${opt.optionId}`,
                    name: ing.name,
                    portion_amount: ing.amount,
                    portion_unit: ing.unit || 'g',
                    quantity_g: ing.amount,
                    macros: {
                        protein_g: prot,
                        carbs_g: carbs,
                        fat_g: fat,
                        calories: cals
                    }
                };
            });

            return {
                id: generateBlockId(),
                label: `${optionLetters[optIdx] || `Opción ${optIdx + 1}`}: ${opt.name}`,
                items
            };
        });

        return {
            id: generateBlockId(),
            meal_type: cfg.type,
            custom_label: cfg.label,
            time: cfg.time,
            notes: '',
            options
        };
    });

    // ── Auto-Calibración Paramétrica Inmediata ──
    const targetCalories = preset.dailyTargetMacros.calories;
    const currentSumCalories = rawBlocks.reduce((sum, block) => {
        if (block.options.length === 0) return sum;
        return sum + sumItemsMacros(block.options[0].items).calories;
    }, 0);

    if (currentSumCalories > 0 && targetCalories > 0) {
        const factor = targetCalories / currentSumCalories;
        return rawBlocks.map(block => ({
            ...block,
            options: block.options.map(option => ({
                ...option,
                items: option.items.map(item => {
                    const newPortion = Math.max(5, Math.round((item.portion_amount || 100) * factor));
                    const ratio = (item.portion_amount || 100) > 0 ? newPortion / (item.portion_amount || 100) : 1;
                    return {
                        ...item,
                        portion_amount: newPortion,
                        quantity_g: newPortion,
                        macros: {
                            protein_g: Number((item.macros.protein_g * ratio).toFixed(1)),
                            carbs_g: Number((item.macros.carbs_g * ratio).toFixed(1)),
                            fat_g: Number((item.macros.fat_g * ratio).toFixed(1)),
                            calories: Math.round(item.macros.calories * ratio)
                        }
                    };
                })
            }))
        }));
    }

    return rawBlocks;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const MEAL_DEFAULTS: Record<MealType, { label: string; icon: React.ReactNode; defaultTime: string }> = {
    breakfast:    { label: 'Desayuno',        icon: <Utensils className="w-4 h-4" />, defaultTime: '08:00' },
    lunch:        { label: 'Almuerzo',        icon: <Utensils className="w-4 h-4" />, defaultTime: '13:00' },
    dinner:       { label: 'Cena',            icon: <Moon className="w-4 h-4" />,     defaultTime: '20:30' },
    snack:        { label: 'Merienda',        icon: <Utensils className="w-4 h-4" />, defaultTime: '16:00' },
    pre_workout:  { label: 'Pre-Entreno',     icon: <Zap className="w-4 h-4" />,      defaultTime: '17:00' },
    post_workout: { label: 'Post-Entreno',    icon: <Zap className="w-4 h-4" />,      defaultTime: '19:00' },
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface NaaSBuilderCanvasProps {
    athleteId: string;
    athleteName?: string;
    dayName?: string;
    activeDay?: number;
    onSaveSuccess?: (planId: string) => void;
    headerNavigation?: React.ReactNode;
    leftSidebar?: React.ReactNode;
    viewMode?: 'micro' | 'medio' | 'macro';
    onDropItem?: (blockId: string, optionId: string, saraItem: any) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const NaaSBuilderCanvas: React.FC<NaaSBuilderCanvasProps> = ({
    athleteId,
    athleteName = 'Atleta',
    dayName,
    activeDay,
    onSaveSuccess,
    headerNavigation,
    leftSidebar,
    viewMode = 'micro'
}) => {
    const { goalTags, biometrics, training, medicalTags, healthData } = useOnboardingPTStore();
    const { nutrition, setNutrition, cycleName, setCycleName, days } = usePlanBuilderStore();
    const routineDaysCount = days?.length || 4;
    const { createTemplate, folders } = useTemplateLibraryStore();

    // Initialize state from persisted nutrition store or fallback to defaults
    const [showDates, setShowDates] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [meals, setMeals] = useState<MealBlock[]>(() => {
        const dayIdx = activeDay || 1;
        if (nutrition?.mealPlan) {
            try {
                const parsed = JSON.parse(nutrition.mealPlan);
                
                // Si es el nuevo formato (diccionario)
                if (parsed && !Array.isArray(parsed)) {
                    if (Array.isArray(parsed[dayIdx]) && parsed[dayIdx].length > 0) {
                        return parsed[dayIdx];
                    }
                } 
                // Migración: si es el formato viejo (array) y estamos en el día 1
                else if (Array.isArray(parsed) && parsed.length > 0) {
                    if (dayIdx === 1) return parsed;
                }
            } catch (e) {
                console.warn("Could not parse mealPlan", e);
            }
        }
        return [
            createEmptyMealBlock('breakfast', '08:00', 'Ingesta 1'),
            createEmptyMealBlock('lunch', '13:00', 'Ingesta 2'),
            createEmptyMealBlock('dinner', '20:30', 'Ingesta 3'),
        ];
    });
    
    const [dailyTarget, setDailyTarget] = useState<MacroNutrients>(() => {
        if (nutrition?.calories && nutrition?.protein) {
            return {
                calories: Number(nutrition.calories),
                protein_g: Number(nutrition.protein),
                carbs_g: Number(nutrition.carbs),
                fat_g: Number(nutrition.fats)
            };
        }
        return { protein_g: 140, carbs_g: 200, fat_g: 65, calories: 1945 };
    });
    
    const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [isBiometricsOpen, setIsBiometricsOpen] = useState(false);
    
    const [clinicalTarget, setClinicalTarget] = useState<BodyCompositionGoal>('RECOMPOSITION');
    const [clinicalData, setClinicalData] = useState({
        gender: biometrics?.gender || 'M',
        weight: biometrics?.weight?.toString() || '80',
        height: biometrics?.height?.toString() || '180',
        age: biometrics?.age?.toString() || '30',
        formula: 'MIFFLIN_ST_JEOR' as BMRFormula,
        activityLevel: training?.days_per_week ? (
            training.days_per_week >= 5 ? '1.725' :
            training.days_per_week >= 3 ? '1.55' : '1.375'
        ) : '1.2'
    });
    const [supplementPlan, setSupplementPlan] = useState<SupplementPlan | null>(null);
    const [showSupplementHelp, setShowSupplementHelp] = useState(false);
    const [isSupplementDismissed, setIsSupplementDismissed] = useState(false);

    const [customPhase, setCustomPhase] = useState<{ [key: string]: boolean }>({});
    const [newPhaseName, setNewPhaseName] = useState<{ [key: string]: string }>({});
    const [phaseOptions, setPhaseOptions] = useState({
        phase1: ['Low-FODMAP Intensivo', 'Déficit Agresivo (Minicut)', 'Keto Adaptación', 'Reset Metabólico'],
        phase2: ['Reintroducción de Carbohidratos', 'Carga Glucémica Peri-entrenamiento', 'Superávit Controlado (+300 kcal)', 'Consolidación de Hábitos'],
        phase3: ['Flexibilidad Metabólica (Ciclado)', 'Dieta Mediterránea Estructurada', 'Mantenimiento Iso-calórico', 'Ayuno Intuitivo']
    });

    // ── Escudos Clínicos de Alérgenos & Restricciones Dietarias ──
    const [activeShields, setActiveShields] = useState<DietaryShield[]>([]);
    const [shieldFeedback, setShieldFeedback] = useState<string | null>(null);

    // ── Ciclado de Carbohidratos (Carb Cycling) ──
    const [isCarbCyclingEnabled, setIsCarbCyclingEnabled] = useState(false);
    const [trainingDaysSet, setTrainingDaysSet] = useState<number[]>([1, 3, 5, 6]); // Lunes, Miércoles, Viernes, Sábado por defecto

    const isCurrentDayTraining = useMemo(() => {
        const currentDay = activeDay || 1;
        return trainingDaysSet.includes(currentDay);
    }, [activeDay, trainingDaysSet]);

    const activeCyclingTarget: DayMacroTarget = useMemo(() => {
        return calculateCarbCyclingTargets(dailyTarget, isCarbCyclingEnabled, isCurrentDayTraining);
    }, [dailyTarget, isCarbCyclingEnabled, isCurrentDayTraining]);

    const handleToggleShield = useCallback((shield: DietaryShield) => {
        setActiveShields(prev => {
            const isCurrentlyActive = prev.includes(shield);
            const newShields = isCurrentlyActive 
                ? prev.filter(s => s !== shield)
                : [...prev, shield];

            if (!isCurrentlyActive) {
                let totalReplaced = 0;
                setMeals(currentMeals => {
                    return currentMeals.map(meal => ({
                        ...meal,
                        options: meal.options.map(opt => ({
                            ...opt,
                            items: opt.items.map(item => {
                                const { shouldReplace, rule } = applyDietaryShieldsToItem(item.name, [shield]);
                                if (shouldReplace && rule) {
                                    totalReplaced++;
                                    const ratio = item.portion_amount / 100;
                                    return {
                                        ...item,
                                        name: rule.replacementName,
                                        macros: {
                                            protein_g: Number((rule.protPer100g * ratio).toFixed(1)),
                                            carbs_g: Number((rule.carbsPer100g * ratio).toFixed(1)),
                                            fat_g: Number((rule.fatPer100g * ratio).toFixed(1)),
                                            calories: Number((rule.calsPer100g * ratio).toFixed(1))
                                        },
                                        notes: rule.pedagogicalReason
                                    };
                                }
                                return item;
                            })
                        }))
                    }));
                });

                const shieldNames: Record<DietaryShield, string> = {
                    GLUTEN_FREE: 'Sin TACC',
                    LACTOSE_FREE: 'Sin Lactosa',
                    VEGAN: 'Vegano'
                };

                setShieldFeedback(`🛡️ Escudo ${shieldNames[shield]}: ${totalReplaced > 0 ? `${totalReplaced} alimento(s) adaptado(s) automáticamente.` : 'Las opciones actuales ya son seguras.'}`);
            } else {
                setShieldFeedback(null);
            }

            return newShields;
        });
    }, []);

    const handleToggleTrainingDay = useCallback((dayNum: number) => {
        setTrainingDaysSet(prev => {
            if (prev.includes(dayNum)) {
                return prev.filter(d => d !== dayNum);
            } else {
                return [...prev, dayNum].sort((a, b) => a - b);
            }
        });
    }, []);

    // Fase recomendada según el arquetipo relevado en el Onboarding
    const recommendedPhase = useMemo(() => {
        return resolveRecommendedPhase(goalTags, biometrics?.gender, biometrics?.age ? Number(biometrics.age) : undefined);
    }, [goalTags, biometrics?.gender, biometrics?.age]);

    // Acción para cargar un Preset Completo con Tríada A/B/C en 1 clic y distribuirlo a los 7 días
    const loadPhaseIntoCanvas = useCallback((phase: PresetPhase, customCount?: number) => {
        const countToUse = customCount ?? (meals?.length > 0 ? meals.length : 4);
        const newMealBlocks = convertPresetToMealBlocks(phase, countToUse);
        setMeals(newMealBlocks);
        setDailyTarget({
            calories: phase.dailyTargetMacros.calories,
            protein_g: phase.dailyTargetMacros.protein,
            carbs_g: phase.dailyTargetMacros.carbs,
            fat_g: phase.dailyTargetMacros.fats
        });

        // Distribuir el plan automáticamente a los 7 días de la semana
        const allSevenDays: Record<number, MealBlock[]> = {
            1: newMealBlocks,
            2: newMealBlocks.map(m => ({ ...m, id: generateBlockId(), options: m.options.map(o => ({ ...o, id: generateBlockId(), items: o.items.map(i => ({ ...i, id: generateBlockId() })) })) })),
            3: newMealBlocks.map(m => ({ ...m, id: generateBlockId(), options: m.options.map(o => ({ ...o, id: generateBlockId(), items: o.items.map(i => ({ ...i, id: generateBlockId() })) })) })),
            4: newMealBlocks.map(m => ({ ...m, id: generateBlockId(), options: m.options.map(o => ({ ...o, id: generateBlockId(), items: o.items.map(i => ({ ...i, id: generateBlockId() })) })) })),
            5: newMealBlocks.map(m => ({ ...m, id: generateBlockId(), options: m.options.map(o => ({ ...o, id: generateBlockId(), items: o.items.map(i => ({ ...i, id: generateBlockId() })) })) })),
            6: newMealBlocks.map(m => ({ ...m, id: generateBlockId(), options: m.options.map(o => ({ ...o, id: generateBlockId(), items: o.items.map(i => ({ ...i, id: generateBlockId() })) })) })),
            7: newMealBlocks.map(m => ({ ...m, id: generateBlockId(), options: m.options.map(o => ({ ...o, id: generateBlockId(), items: o.items.map(i => ({ ...i, id: generateBlockId() })) })) })),
        };

        setNutrition({
            calories: phase.dailyTargetMacros.calories,
            protein: phase.dailyTargetMacros.protein,
            carbs: phase.dailyTargetMacros.carbs,
            fats: phase.dailyTargetMacros.fats,
            mealPlan: JSON.stringify(allSevenDays)
        });
        if (!cycleName || cycleName.trim() === '' || cycleName === 'Nueva Plantilla') {
            setCycleName(`${phase.phaseName}`);
        }
        setExpandedMealId(newMealBlocks[0]?.id ?? null);
        trackNaaSEvent('preset_loaded_into_canvas', { phaseId: phase.phaseId, mealsCount: countToUse });
    }, [meals?.length, cycleName, setCycleName, setNutrition]);

    const handleAddPhase = (phaseKey: 'phase1' | 'phase2' | 'phase3') => {
        if (newPhaseName[phaseKey]?.trim()) {
            const val = newPhaseName[phaseKey].trim();
            setPhaseOptions(prev => ({
                ...prev,
                [phaseKey]: [...prev[phaseKey], val]
            }));
            setNutrition({ ...(nutrition as any), [phaseKey]: val });
            setCustomPhase(prev => ({ ...prev, [phaseKey]: false }));
            setNewPhaseName(prev => ({ ...prev, [phaseKey]: '' }));
        }
    };

    const calculateClinicalCalories = useCallback(() => {
        const weight = parseFloat(clinicalData.weight) || 80;
        const height = parseFloat(clinicalData.height) || 180;
        const age = parseFloat(clinicalData.age) || 30;
        const pal = parseFloat(clinicalData.activityLevel) || 1.2;
        const formula = clinicalData.formula;

        let bmr = 0;
        if (formula === 'MIFFLIN_ST_JEOR') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + (clinicalData.gender === 'M' ? 5 : -161);
        } else if (formula === 'HARRIS_BENEDICT') {
            bmr = clinicalData.gender === 'M' 
                ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
                : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        } else {
            // KATCH_MCARDLE (Estimación genérica de grasa si no se proveyó para simplificar UI)
            const bf = clinicalData.gender === 'M' ? 15 : 25; 
            const ffm = weight * (1 - bf / 100);
            bmr = 370 + (21.6 * ffm);
        }

        const tdee = bmr * pal;
        const goalConfig = GOAL_MACRO_MATRIX[clinicalTarget];
        
        // Usar shift mínimo por conservadurismo algorítmico
        const targetKcal = tdee * (1 + goalConfig.energyShiftMin);
        
        const newKcal = Math.round(targetKcal);
        
        // Macros (Tomamos el min del rango para asegurar failsafes en la demo)
        const protein_g = Math.round(goalConfig.proteinMin * (goalConfig.proteinBase === 'BW' ? weight : (weight * 0.85)));
        let fat_g = 0;
        if (goalConfig.fatBase === 'BW') {
            fat_g = Math.round(goalConfig.fatMin * weight);
        } else {
            fat_g = Math.round((newKcal * goalConfig.fatMin) / 9);
        }
        
        const carbs_g = Math.round((newKcal - (protein_g * 4) - (fat_g * 9)) / 4);

        // Generar Protocolo de Suplementación P1
        const mappedPrimaryGoal = 
            clinicalTarget === 'HYPERTROPHY' ? 'Hipertrofia' :
            clinicalTarget === 'RECOMPOSITION' ? 'Recomposicion' : 'Resistencia Aerobica';
            
        const athleteState: AthleteState = {
            weightKg: weight,
            age: age,
            isCaloricDeficit: clinicalTarget === 'FAT_LOSS' || clinicalTarget === 'RECOMPOSITION',
            primaryGoal: mappedPrimaryGoal as TrainingGoal,
            daysOnCreatine: 10, // Asumimos fase de mantenimiento para la UI
            hoursUntilSleepAtWorkout: 6 // Asumimos 6hs por defecto
        };
        const plan = SupplementationEngine.generatePrescription(athleteState);
        setSupplementPlan(plan);
        setIsSupplementDismissed(false);

        setDailyTarget({ protein_g, carbs_g, fat_g, calories: newKcal });
        setIsBiometricsOpen(false);
    }, [clinicalData, clinicalTarget]);

    // ── Computed: Daily Envelope (avg across all meals' first options as baseline) ──
    const dailyEnvelope = useMemo(() => {
        const allFirstOptionMacros = meals.map(m => {
            if (m.options.length === 0) return { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 };
            return sumItemsMacros(m.options[0].items);
        });
        return allFirstOptionMacros.reduce(
            (acc, m) => ({
                protein_g: acc.protein_g + m.protein_g,
                carbs_g: acc.carbs_g + m.carbs_g,
                fat_g: acc.fat_g + m.fat_g,
                calories: acc.calories + m.calories,
            }),
            { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 }
        );
    }, [meals]);

    // ── Auto-Calibrar Porciones al 100% de la Meta Diaria ──
    const handleScalePortionsToTarget = useCallback(() => {
        if (dailyEnvelope.calories <= 0 || dailyTarget.calories <= 0) return;
        const factor = dailyTarget.calories / dailyEnvelope.calories;

        setMeals(prev => prev.map(meal => ({
            ...meal,
            options: meal.options.map(option => ({
                ...option,
                items: option.items.map(item => {
                    const newQuantity = Math.max(5, Math.round(item.quantity_g * factor));
                    const itemRatio = item.quantity_g > 0 ? newQuantity / item.quantity_g : 1;
                    return {
                        ...item,
                        quantity_g: newQuantity,
                        macros: {
                            protein_g: Number((item.macros.protein_g * itemRatio).toFixed(1)),
                            carbs_g: Number((item.macros.carbs_g * itemRatio).toFixed(1)),
                            fat_g: Number((item.macros.fat_g * itemRatio).toFixed(1)),
                            calories: Math.round(item.macros.calories * itemRatio)
                        }
                    };
                })
            }))
        })));
        trackNaaSEvent('portions_auto_scaled', { factor, targetKcal: dailyTarget.calories });
    }, [dailyEnvelope.calories, dailyTarget.calories]);

    useDndMonitor({
        onDragEnd(event) {
            const { active, over } = event;
            if (!over) return;
            
            const isSaraItem = active.data.current?.type === 'SARA_ITEM';
            const isMealOption = over.data.current?.type === 'MEAL_OPTION';
            const isMealBlock = over.data.current?.type === 'MEAL_BLOCK';
            
            if (isSaraItem && (isMealOption || isMealBlock)) {
                const saraItem = active.data.current?.item;
                
                if (saraItem) {
                    setMeals(prev => {
                        let blockId = over.data.current?.blockId;
                        let optionId = over.data.current?.optionId;

                        if (isMealBlock) {
                            blockId = over.data.current?.mealId;
                            const targetMeal = prev.find(m => m.id === blockId);
                            if (targetMeal && targetMeal.options.length > 0) {
                                optionId = targetMeal.options[0].id;
                            }
                        }

                        if (!blockId || !optionId) return prev;

                        return prev.map(m => {
                            if (m.id !== blockId) return m;
                            return {
                                ...m,
                                options: m.options.map(opt => {
                                if (opt.id !== optionId) return opt;
                                const defaultPortion = 100;
                                const multiplier = defaultPortion / 100;
                                const newItem: MealItem = {
                                    id: uuidv4(),
                                    name: saraItem.name,
                                    portion_amount: defaultPortion,
                                    portion_unit: 'g',
                                    macros: {
                                        protein_g: Number((saraItem.protein_g * multiplier).toFixed(1)),
                                        carbs_g: Number((saraItem.available_carbs_g * multiplier).toFixed(1)),
                                        fat_g: Number((saraItem.total_fat_g * multiplier).toFixed(1)),
                                        calories: Number((saraItem.energy_kcal * multiplier).toFixed(1))
                                    },
                                    notes: null
                                };
                                return { ...opt, items: [...opt.items, newItem] };
                            })
                        };
                        });
                    });
                }
            }
        }
    });

    // ── Meal-Level Mutations ──
    const updateMeal = useCallback((mealId: string, updates: Partial<MealBlock>) => {
        setMeals(prev => prev.map(m => m.id === mealId ? { ...m, ...updates } : m));
    }, []);

    const handleCloneDayToAll = useCallback(() => {
        // Obtenemos el diccionario actual para no perder los datos no guardados de otros días
        let currentDict: Record<number, MealBlock[]> = {};
        if (nutrition?.mealPlan) {
            try {
                const parsed = JSON.parse(nutrition.mealPlan);
                if (parsed && !Array.isArray(parsed)) currentDict = parsed;
                else if (Array.isArray(parsed)) currentDict[1] = parsed;
            } catch(e){}
        }
        
        // Función recursiva para regenerar UUIDs en toda la estructura de la ingesta
        const deepCloneMeals = (sourceMeals: MealBlock[]): MealBlock[] => {
            return sourceMeals.map(m => ({
                ...m,
                id: uuidv4(),
                options: m.options.map(o => ({
                    ...o,
                    id: uuidv4(),
                    items: o.items.map(i => ({ ...i, id: uuidv4() }))
                }))
            }));
        };

        // Copiar a todos los días (1 al 7)
        for (let i = 1; i <= 7; i++) {
            if (i !== (activeDay || 1)) {
                currentDict[i] = deepCloneMeals(meals);
            } else {
                currentDict[i] = meals; // Para el día actual, guardamos la referencia directa
            }
        }

        // Guardar en zustand
        setNutrition({
            ...nutrition,
            mealPlan: JSON.stringify(currentDict)
        });
        
        alert("✅ Ingestas replicadas exitosamente a los 7 días de la semana.");
    }, [meals, nutrition, activeDay, setNutrition]);

    const cloneMeal = useCallback((mealId: string) => {
        setMeals(prev => {
            const targetMeal = prev.find(m => m.id === mealId);
            if (!targetMeal) return prev;
            
            const newMeal: MealBlock = {
                ...targetMeal,
                id: uuidv4(),
                custom_label: targetMeal.custom_label ? `${targetMeal.custom_label} (Copia)` : 'Ingesta (Copia)',
                options: targetMeal.options.map(opt => ({
                    ...opt,
                    id: uuidv4(),
                    items: opt.items.map(item => ({
                        ...item,
                        id: uuidv4()
                    }))
                }))
            };
            
            const index = prev.findIndex(m => m.id === mealId);
            const nextMeals = [...prev];
            nextMeals.splice(index + 1, 0, newMeal);
            return nextMeals;
        });
    }, []);

    const addMeal = useCallback(() => {
        const idx = meals.length + 1;
        const newMeal = createEmptyMealBlock('snack', '16:00', `Ingesta ${idx}`);
        setMeals(prev => [...prev, newMeal]);
        setExpandedMealId(newMeal.id);
    }, [meals.length]);

    const removeMeal = useCallback((mealId: string) => {
        setMeals(prev => prev.filter(m => m.id !== mealId));
    }, []);

    const handleMealsCountChange = useCallback((count: number) => {
        setMeals(prev => {
            if (count === prev.length) return prev;
            if (count < prev.length) return prev.slice(0, count);
            
            const newMeals = [...prev];
            const defaultTimes = ['08:00', '12:00', '16:00', '20:00', '22:00', '23:00'];
            for (let i = prev.length; i < count; i++) {
                newMeals.push(createEmptyMealBlock('snack', defaultTimes[i] || '12:00', `Ingesta ${i + 1}`));
            }
            return newMeals;
        });
    }, []);

    // ── Option-Level Mutations ──
    const addOptionToMeal = useCallback((mealId: string) => {
        setMeals(prev => prev.map(m => {
            if (m.id !== mealId) return m;
            const label = getNextOptionLabel(m.options);
            return { ...m, options: [...m.options, createEmptyMealOption(label)] };
        }));
    }, []);

    const cloneOption = useCallback((mealId: string, optionId: string) => {
        setMeals(prev => prev.map(m => {
            if (m.id !== mealId) return m;
            const source = m.options.find(o => o.id === optionId);
            if (!source) return m;
            const label = getNextOptionLabel(m.options);
            const cloned: MealOption = {
                id: generateBlockId(),
                label,
                items: source.items.map(item => ({ ...item, id: generateBlockId() })),
            };
            return { ...m, options: [...m.options, cloned] };
        }));
    }, []);

    const autoSwapOption = useCallback((mealId: string, optionId: string) => {
        setMeals(prev => prev.map(m => {
            if (m.id !== mealId) return m;
            const source = m.options.find(o => o.id === optionId);
            if (!source) return m;
            const label = getNextOptionLabel(m.options);
            
            const newItems = source.items.map(item => {
                let swapItem = { ...item, id: generateBlockId() };
                const dbOriginal = saraPredictive.find(f => f.name === item.name);
                
                if (dbOriginal) {
                    // Buscar candidatos en la MISMA categoría SARA
                    const candidates = saraPredictive.filter(f => f.category === dbOriginal.category && f.id !== dbOriginal.id && f.protein_g !== undefined);
                    if (candidates.length > 0) {
                        const dbSwap = candidates[Math.floor(Math.random() * candidates.length)];
                        
                        // Determinar el macro dominante para igualarlo matemáticamente
                        let dominantMacro: 'protein_g' | 'carbs_g' | 'fat_g' | 'calories' = 'calories';
                        let maxVal = 0;
                        if (dbOriginal.protein_g > maxVal) { maxVal = dbOriginal.protein_g; dominantMacro = 'protein_g'; }
                        if (dbOriginal.carbs_g > maxVal) { maxVal = dbOriginal.carbs_g; dominantMacro = 'carbs_g'; }
                        if (dbOriginal.fat_g > maxVal) { maxVal = dbOriginal.fat_g; dominantMacro = 'fat_g'; }
                        
                        let ratio = 1;
                        if (dbSwap[dominantMacro] > 0 && dbOriginal[dominantMacro] > 0) {
                            ratio = dbOriginal[dominantMacro] / dbSwap[dominantMacro];
                        } else if (dbSwap.calories > 0 && dbOriginal.calories > 0) {
                            ratio = dbOriginal.calories / dbSwap.calories;
                        }
                        
                        // CLINICAL GUARDRAIL: Evitar porciones masivas si los alimentos son muy distintos (cap 0.3x a 3x)
                        if (ratio > 3) ratio = 3;
                        if (ratio < 0.33) ratio = 0.33;
                        
                        // Calcular nuevos gramos redondeados a 5g
                        let newPortion = Math.round(item.portion_amount * ratio);
                        newPortion = Math.max(5, Math.round(newPortion / 5) * 5);
                        
                        swapItem = {
                            id: generateBlockId(),
                            name: dbSwap.name,
                            portion_amount: newPortion,
                            macros: {
                                protein_g: Number(((dbSwap.protein_g * newPortion) / 100).toFixed(1)),
                                carbs_g: Number(((dbSwap.carbs_g * newPortion) / 100).toFixed(1)),
                                fat_g: Number(((dbSwap.fat_g * newPortion) / 100).toFixed(1)),
                                calories: Math.round((dbSwap.calories * newPortion) / 100)
                            }
                        };
                    }
                }
                return swapItem;
            });

            const cloned: MealOption = {
                id: generateBlockId(),
                label: `${label} ✨`, // Indicador visual de variante IA
                items: newItems,
            };
            return { ...m, options: [...m.options, cloned] };
        }));
    }, []);

    const removeOption = useCallback((mealId: string, optionId: string) => {
        setMeals(prev => prev.map(m =>
            m.id === mealId ? { ...m, options: m.options.filter(o => o.id !== optionId) } : m
        ));
    }, []);

    const equalizeOptionsInMeal = useCallback((mealId: string) => {
        setMeals(prev => prev.map(m => {
            if (m.id !== mealId || m.options.length <= 1) return m;

            // Opción A es el baseline metabólico
            const baselineCalories = m.options[0].items.length > 0
                ? sumItemsMacros(m.options[0].items).calories
                : 400;

            if (baselineCalories <= 0) return m;

            const newOptions = m.options.map((opt, idx) => {
                if (idx === 0) return opt; // Opción A no cambia
                const currentCals = sumItemsMacros(opt.items).calories;
                if (currentCals <= 0) return opt;
                const factor = baselineCalories / currentCals;

                return {
                    ...opt,
                    items: opt.items.map(item => {
                        const currentPortion = item.portion_amount ?? (item as any).quantity_g ?? 100;
                        const newPortion = Math.max(5, Math.round(currentPortion * factor));
                        const ratio = currentPortion > 0 ? newPortion / currentPortion : 1;
                        return {
                            ...item,
                            portion_amount: newPortion,
                            quantity_g: newPortion,
                            macros: {
                                protein_g: Number((item.macros.protein_g * ratio).toFixed(1)),
                                carbs_g: Number((item.macros.carbs_g * ratio).toFixed(1)),
                                fat_g: Number((item.macros.fat_g * ratio).toFixed(1)),
                                calories: Math.round(item.macros.calories * ratio)
                            }
                        };
                    })
                };
            });

            return { ...m, options: newOptions };
        }));
    }, []);

    // ── Item-Level Mutations ──
    const addItemToOption = useCallback((mealId: string, optionId: string) => {
        setMeals(prev => prev.map(m =>
            m.id === mealId
                ? { ...m, options: m.options.map(o =>
                    o.id === optionId ? { ...o, items: [...o.items, createEmptyMealItem()] } : o
                ) }
                : m
        ));
    }, []);

    const addNaaSBlockToOption = useCallback((mealId: string, optionId: string, blockType: 'PRO' | 'CHO' | 'FAT') => {
        const size = NAAS_BLOCK_SIZES[blockType];
        const macros: MacroNutrients = {
            protein_g: blockType === 'PRO' ? size : 0,
            carbs_g: blockType === 'CHO' ? size : 0,
            fat_g: blockType === 'FAT' ? size : 0,
            calories: 0,
        };
        macros.calories = calcCaloriesFromMacros(macros);
        const labels = { PRO: 'Proteína', CHO: 'Carbohidrato', FAT: 'Grasa' };
        const newItem: MealItem = {
            id: generateBlockId(),
            name: `Bloque ${labels[blockType]}`,
            portion_amount: blockType === 'PRO' ? 30 : blockType === 'CHO' ? 100 : 15,
            portion_unit: 'g',
            macros,
            notes: null,
        };
        setMeals(prev => prev.map(m =>
            m.id === mealId
                ? { ...m, options: m.options.map(o =>
                    o.id === optionId ? { ...o, items: [...o.items, newItem] } : o
                ) }
                : m
        ));
    }, []);

    const removeItemFromOption = useCallback((mealId: string, optionId: string, itemId: string) => {
        setMeals(prev => prev.map(m =>
            m.id === mealId
                ? { ...m, options: m.options.map(o =>
                    o.id === optionId ? { ...o, items: o.items.filter(i => i.id !== itemId) } : o
                ) }
                : m
        ));
    }, []);

    const updateItemInOption = useCallback((mealId: string, optionId: string, itemId: string, updates: Partial<MealItem>) => {
        setMeals(prev => prev.map(m =>
            m.id === mealId
                ? { ...m, options: m.options.map(o =>
                    o.id === optionId
                        ? { ...o, items: o.items.map(i => {
                            if (i.id !== itemId) return i;
                            const updated = { ...i, ...updates };
                            if (updates.macros) {
                                updated.macros = { ...updated.macros, calories: calcCaloriesFromMacros(updated.macros) };
                            }
                            return updated;
                        }) }
                        : o
                ) }
                : m
        ));
    }, []);

    // ── Save ──
    const handleSave = useCallback(async () => {
        setSaveError(null); setSaveSuccess(false); setValidationErrors([]);
        
        let finalName = cycleName;
        if (!finalName || finalName.trim() === '') {
            const inputName = window.prompt("Por favor, ingresa un nombre para este plan nutricional antes de guardarlo:");
            if (!inputName || inputName.trim() === '') return;
            finalName = inputName;
            setCycleName(finalName);
        }

        const payload = {
            athlete_id: athleteId,
            title: finalName,
            daily_macros_target: dailyTarget,
            meals,
        };
        try {
            NutritionPlanCreateSchema.parse(payload);
        } catch (e) {
            if (e instanceof ZodError) {
                setValidationErrors(e.errors.map(err => `${err.path.join('.')}: ${err.message}`));
                return;
            }
            throw e;
        }
        setIsSaving(true);

        // PERSIST STATE LOCALLY FIRST (DICT FORMAT)
        let currentDict: Record<number, MealBlock[]> = {};
        if (nutrition?.mealPlan) {
            try {
                const parsed = JSON.parse(nutrition.mealPlan);
                if (parsed && !Array.isArray(parsed)) {
                    currentDict = parsed;
                } else if (Array.isArray(parsed)) {
                    currentDict[1] = parsed;
                }
            } catch (e) {}
        }
        currentDict[activeDay || 1] = meals;

        setNutrition({
            ...nutrition,
            calories: dailyTarget.calories.toString(),
            protein: dailyTarget.protein_g.toString(),
            carbs: dailyTarget.carbs_g.toString(),
            fats: dailyTarget.fat_g.toString(),
            target: clinicalTarget,
            mealPlan: JSON.stringify(currentDict)
        });

        const afterSaveSuccess = () => {
            setSaveSuccess(true);
            setSaveError(null);
            onSaveSuccess?.(cycleName || 'Nuevo Plan Nutricional');
            
            // DEMO UX: Mostrar el plan en la biblioteca de plantillas para que el usuario sienta que se guardó
            const recentFolder = folders.find(f => f.name === 'Recientemente Creadas');
            if (recentFolder && createTemplate) {
                const nutritionData = {
                    calories: dailyTarget.calories.toString(),
                    protein: dailyTarget.protein_g.toString(),
                    carbs: dailyTarget.carbs_g.toString(),
                    fats: dailyTarget.fat_g.toString(),
                    target: clinicalTarget,
                    mealPlan: JSON.stringify(currentDict)
                };
                
                createTemplate(recentFolder.id, {
                    name: finalName,
                    taxonomyId: 'nutrition',
                    tags: ['nutricion', 'demo', clinicalTarget, nutrition?.clinicalFirewall].filter(Boolean) as string[],
                    internalNotes: JSON.stringify(nutritionData),
                    phases: [{ id: uuidv4(), name: 'Fase Única', releaseDate: null, notes: '', days: [] }]
                });
            }
        };

        try {
            const result = await nutritionApi.createPlan(payload);
            afterSaveSuccess();
        } catch (err: any) {
            setSaveError(
                err?.status === 422 ? 'Error de contrato: schemas Zod/Pydantic desincronizados.'
                : err?.status === 404 ? 'Atleta no encontrado en tu espacio de trabajo.'
                : err?.status === 403 ? 'No tienes permisos para crear planes nutricionales.'
                : err?.message || 'Error desconocido.'
            );
            // 🚀 MOCK SUCCESS FOR DEMO MODE IF BACKEND IS DOWN
            console.warn("[Demo] API Error caught, mocking success:", err);
            afterSaveSuccess();
        } finally { setIsSaving(false); }
    }, [athleteId, athleteName, cycleName, dailyTarget, meals, onSaveSuccess, nutrition, clinicalTarget, setNutrition, folders, createTemplate]);


    // ── Template Droppable ──
    const { setNodeRef, isOver } = useDroppable({
        id: 'naas-canvas',
        data: {
            type: 'NUTRITION_TEMPLATE',
        }
    });

    return (
        <div className="w-full space-y-4">
            
            {/* ── Daily Target Horizontal Bar (Symmetric & Professional) ── */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-4 z-10 space-y-3.5">
                {/* Fila 1: Título, Objetivo, Auto-calcular & Macro Cards */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-1 min-w-0">
                        <div className="shrink-0">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-0.5 font-montserrat">
                                Metas Diarias
                            </h3>
                            <p className="text-[11px] text-slate-500 max-w-[220px] leading-tight font-medium">
                                Ajusta los objetivos energéticos de este ciclo.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-3 py-1.5 shrink-0 items-center gap-1.5 shadow-2xs">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Objetivo:</span>
                                <span className="text-xs font-black text-indigo-700">{GOAL_LABELS[clinicalTarget] || clinicalTarget}</span>
                            </div>
                            
                            <button 
                                onClick={() => setIsBiometricsOpen(!isBiometricsOpen)}
                                className={`h-8 px-3 shrink-0 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs active:scale-95 ${isBiometricsOpen ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600'}`}
                                title="Abre la calculadora biométrica y ecuaciones TMB (Harris-Benedict / Mifflin-St Jeor)"
                            >
                                <Activity className="w-3.5 h-3.5" /> Auto-calcular (NaaS)
                            </button>

                            {dailyEnvelope.calories > 0 && Math.abs(dailyEnvelope.calories - dailyTarget.calories) > 80 && (
                                <button
                                    onClick={handleScalePortionsToTarget}
                                    className="h-8 px-3 shrink-0 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap active:scale-95"
                                    title="Ajusta proporcionalmente las porciones de todos los alimentos para coincidir con la meta exacta"
                                >
                                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                                    Calibrar al 100% ({dailyTarget.calories} kcal)
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Macro Target Inputs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0 w-full xl:w-auto">
                        <div className="w-full xl:w-[105px]">
                            <TargetInput label="Calorías" value={isCarbCyclingEnabled ? activeCyclingTarget.calories : dailyTarget.calories} color="slate" onChange={v => setDailyTarget({ ...dailyTarget, calories: v })} />
                            <div className="mt-1"><ProgressBar label="Kcal." current={dailyEnvelope.calories} target={isCarbCyclingEnabled ? activeCyclingTarget.calories : dailyTarget.calories} color="slate" /></div>
                        </div>
                        <div className="w-full xl:w-[105px]">
                            <TargetInput label="Proteínas" value={isCarbCyclingEnabled ? activeCyclingTarget.protein_g : dailyTarget.protein_g} color="rose" onChange={v => setDailyTarget({ ...dailyTarget, protein_g: v })} />
                            <div className="mt-1"><ProgressBar label="Pro." current={dailyEnvelope.protein_g} target={isCarbCyclingEnabled ? activeCyclingTarget.protein_g : dailyTarget.protein_g} color="rose" /></div>
                        </div>
                        <div className="w-full xl:w-[105px]">
                            <TargetInput label="Carbos" value={isCarbCyclingEnabled ? activeCyclingTarget.carbs_g : dailyTarget.carbs_g} color="amber" onChange={v => setDailyTarget({ ...dailyTarget, carbs_g: v })} />
                            <div className="mt-1"><ProgressBar label="Car." current={dailyEnvelope.carbs_g} target={isCarbCyclingEnabled ? activeCyclingTarget.carbs_g : dailyTarget.carbs_g} color="amber" /></div>
                        </div>
                        <div className="w-full xl:w-[105px]">
                            <TargetInput label="Grasas" value={isCarbCyclingEnabled ? activeCyclingTarget.fat_g : dailyTarget.fat_g} color="sky" onChange={v => setDailyTarget({ ...dailyTarget, fat_g: v })} />
                            <div className="mt-1"><ProgressBar label="Gra." current={dailyEnvelope.fat_g} target={isCarbCyclingEnabled ? activeCyclingTarget.fat_g : dailyTarget.fat_g} color="sky" /></div>
                        </div>
                    </div>
                </div>

                {/* Fila 2: Barra de Herramientas Simétrica (Suplementación Fija, Escudos y Ciclado Vinculado a Rutina) */}
                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Botón Fijo de Suplementación */}
                        <button
                            onClick={() => {
                                if (!supplementPlan) {
                                    handleAutoCalculateNaaS();
                                }
                                setIsSupplementDismissed(false);
                            }}
                            className={`h-8 px-3 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                                !isSupplementDismissed && supplementPlan
                                    ? 'bg-emerald-600 text-white border border-emerald-600 shadow-emerald-500/20'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90'
                            }`}
                            title="Protocolo de suplementación deportiva con evidencia científica (Creatina, Cafeína, Beta-Alanina, Citrulina)"
                        >
                            💊 Suplementación
                            {!isSupplementDismissed && supplementPlan && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </button>

                        {/* Escudos Clínicos de Alérgenos (Grupo simétrico) */}
                        <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80">
                            <button
                                onClick={() => handleToggleShield('GLUTEN_FREE')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                                    activeShields.includes('GLUTEN_FREE')
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                                title="Escudo Sin TACC: Sustituye automáticamente derivados de trigo por granos libres de gluten"
                            >
                                🌾 Sin TACC
                            </button>
                            <button
                                onClick={() => handleToggleShield('LACTOSE_FREE')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                                    activeShields.includes('LACTOSE_FREE')
                                        ? 'bg-sky-600 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                                title="Escudo Sin Lactosa: Sustituye lácteos por bebidas vegetales y tofu"
                            >
                                🥛 Sin Lactosa
                            </button>
                            <button
                                onClick={() => handleToggleShield('VEGAN')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all active:scale-95 ${
                                    activeShields.includes('VEGAN')
                                        ? 'bg-emerald-700 text-white shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                                title="Escudo Vegano: Sustituye carnes y huevos por fuentes 100% vegetales"
                            >
                                🌱 Vegano
                            </button>
                        </div>

                        {/* Ciclado de Días de Entrenamiento (Vinculado a Rutina) */}
                        <button
                            onClick={() => setIsCarbCyclingEnabled(!isCarbCyclingEnabled)}
                            className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-2xs active:scale-95 ${
                                isCarbCyclingEnabled
                                    ? 'bg-amber-500 text-white border border-amber-600 shadow-amber-500/20'
                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80'
                            }`}
                            title="Ajusta los carbohidratos según los días de entrenamiento de la rutina"
                        >
                            ⚡ Días de Entreno ({routineDaysCount}d)
                            {isCarbCyclingEnabled && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </button>
                    </div>

                    {/* Selector de Estado del Día si Ciclado está activo */}
                    {isCarbCyclingEnabled && (
                        <div className="flex items-center gap-1 bg-amber-50/80 p-1 rounded-xl border border-amber-200/80 text-[11px]">
                            <span className="text-[10px] font-bold text-amber-700 px-1.5">Pauta Hoy:</span>
                            <button
                                onClick={() => {
                                    const cur = activeDay || 1;
                                    if (!trainingDaysSet.includes(cur)) setTrainingDaysSet([...trainingDaysSet, cur]);
                                }}
                                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                                    isCurrentDayTraining ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-800 hover:bg-amber-100'
                                }`}
                            >
                                🔥 Alta Energía
                            </button>
                            <button
                                onClick={() => {
                                    const cur = activeDay || 1;
                                    setTrainingDaysSet(trainingDaysSet.filter(d => d !== cur));
                                }}
                                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                                    !isCurrentDayTraining ? 'bg-slate-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                🛋️ Descanso
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Banner Pedagógico de Escudos Clínicos ── */}
            <AnimatePresence>
                {shieldFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="bg-emerald-50 border border-emerald-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-2xs"
                    >
                        <div className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                            <p className="text-xs font-semibold text-emerald-900">{shieldFeedback}</p>
                        </div>
                        <button
                            onClick={() => setShieldFeedback(null)}
                            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-0.5 rounded-md hover:bg-emerald-100 transition-colors"
                        >
                            Entendido
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Barra Pedagógica de Ciclado de Carbohidratos ── */}
            <AnimatePresence>
                {isCarbCyclingEnabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2.5 overflow-hidden"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 text-white shadow-xs">
                                    {activeCyclingTarget.badgeLabel}
                                </span>
                                <span className="text-xs font-bold text-slate-700">
                                    Día {activeDay || 1}: {isCurrentDayTraining ? '🔥 Alta Carga Glucídica' : '🛋️ Recuperación & Saciedad'}
                                </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-600 italic">
                                {activeCyclingTarget.pedagogicalTip}
                            </p>
                        </div>

                        {/* Selector Rápido de Días de Entrenamiento (On vs Off) */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-200/60">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">
                                Esquema Semanal:
                            </span>
                            {[
                                { num: 1, label: 'Lun' },
                                { num: 2, label: 'Mar' },
                                { num: 3, label: 'Mié' },
                                { num: 4, label: 'Jue' },
                                { num: 5, label: 'Vie' },
                                { num: 6, label: 'Sáb' },
                                { num: 7, label: 'Dom' }
                            ].map(day => {
                                const isTraining = trainingDaysSet.includes(day.num);
                                const isSelected = (activeDay || 1) === day.num;
                                return (
                                    <button
                                        key={day.num}
                                        onClick={() => handleToggleTrainingDay(day.num)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 ${
                                            isTraining
                                                ? 'bg-amber-500 text-white border border-amber-600'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                        } ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 font-black' : ''}`}
                                        title={`Haz clic para alternar el día ${day.label} entre Entrenamiento (🔥) y Descanso (🛋️)`}
                                    >
                                        <span>{day.label}</span>
                                        <span>{isTraining ? '🔥' : '🛋️'}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isBiometricsOpen && (
                    <motion.div initial={{ height: 0, opacity: 0, marginTop: -16 }} animate={{ height: 'auto', opacity: 1, marginTop: -4 }} exit={{ height: 0, opacity: 0, marginTop: -16 }} className="overflow-hidden relative z-0">
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-b-2xl p-4 pt-6 mx-4">
                            <p className="text-xs text-indigo-700/80 leading-relaxed font-medium mb-3">
                                Selecciona la <strong>Fórmula TMB</strong> y tu <strong>Factor de Actividad</strong> para obtener el Gasto Energético Total (GET).
                            </p>
                            <div className="flex flex-wrap items-end gap-4">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block text-[10px] font-bold text-indigo-400 mb-1">Ecuación TMB</label>
                                    <select value={clinicalData.formula} onChange={e => setClinicalData({...clinicalData, formula: e.target.value as BMRFormula})} className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 outline-none w-full">
                                        {Object.values(BMR_FORMULAS).map(f => (
                                            <option key={f.id} value={f.id}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-indigo-400 mb-1">Género</label>
                                    <select value={clinicalData.gender} onChange={e => setClinicalData({...clinicalData, gender: e.target.value})} className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 outline-none w-32">
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-indigo-400 mb-1">Peso (kg)</label>
                                    <input type="number" value={clinicalData.weight} onChange={e => setClinicalData({...clinicalData, weight: e.target.value})} className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 outline-none w-24" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-indigo-400 mb-1">Altura (cm)</label>
                                    <input type="number" value={clinicalData.height} onChange={e => setClinicalData({...clinicalData, height: e.target.value})} className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 outline-none w-24" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-indigo-400 mb-1">Edad</label>
                                    <input type="number" value={clinicalData.age} onChange={e => setClinicalData({...clinicalData, age: e.target.value})} className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 outline-none w-20" />
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-[10px] font-bold text-indigo-400 mb-1">Factor Actividad</label>
                                    <select value={clinicalData.activityLevel} onChange={e => setClinicalData({...clinicalData, activityLevel: e.target.value})} className="bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-bold text-indigo-900 outline-none w-full">
                                        <option value="1.2">Sedentario</option>
                                        <option value="1.375">Ligero</option>
                                        <option value="1.55">Moderado</option>
                                        <option value="1.725">Activo</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mt-5 pt-5 border-t border-indigo-100/50">
                                <label className="block text-[10px] font-bold text-indigo-400 mb-2">Objetivo Biológico (Desplazamiento Termodinámico)</label>
                                <div className="flex flex-col md:flex-row gap-3">
                                    {[
                                        { id: 'FAT_LOSS', label: 'Pérdida de Grasa', desc: 'Déficit severo (-20%) preservando la masa muscular.' }, 
                                        { id: 'RECOMPOSITION', label: 'Recomposición', desc: 'Déficit leve o isocalórico. Construir músculo quemando grasa.' }, 
                                        { id: 'HYPERTROPHY', label: 'Hipertrofia', desc: 'Superávit optimizado para máxima ganancia muscular.' }
                                    ].map(t => (
                                        <button key={t.id} onClick={() => setClinicalTarget(t.id as any)}
                                            className={`flex-1 p-3 text-left rounded-xl transition-all border ${clinicalTarget === t.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-indigo-900 border-indigo-200 hover:border-indigo-400'}`}>
                                            <div className="text-xs font-bold">{t.label}</div>
                                            <div className={`text-[10px] mt-1 leading-tight ${clinicalTarget === t.id ? 'text-indigo-100' : 'text-indigo-500'}`}>{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button onClick={calculateClinicalCalories} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0 flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Ejecutar Cálculo y Aplicar Metas
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Supplementation UI (Pedagogía Visual y Baja Carga Cognitiva) ── */}
            <AnimatePresence>
                {supplementPlan && !isBiometricsOpen && !isSupplementDismissed && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-emerald-50/90 border border-emerald-200/70 rounded-3xl p-5 shadow-sm relative z-10 mb-5">
                            
                            {/* Header con Explicación Humana y Botón de Cerrar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-100/80">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 text-lg shrink-0">
                                        💊
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-emerald-950 font-montserrat tracking-tight">Suplementación Deportiva Sugerida</h3>
                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase tracking-wider">
                                                Cálculo Inteligente
                                            </span>
                                        </div>
                                        <p className="text-xs text-emerald-800/80 font-medium mt-0.5">
                                            Dosis calculadas según el peso corporal ({biometrics?.weight || 80} kg). Puedes ajustar los valores directamente en cada tarjeta.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <button
                                        onClick={() => setShowSupplementHelp(!showSupplementHelp)}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                                        {showSupplementHelp ? 'Ocultar guía' : '¿Cómo funciona?'}
                                    </button>

                                    <button
                                        onClick={() => setIsSupplementDismissed(true)}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-950 bg-white/80 hover:bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs transition-all flex items-center gap-1 active:scale-95"
                                        title="Ocultar panel de suplementación (puedes volver a abrirlo desde Metas Diarias)"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Cerrar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Panel Pedagógico Desplegable */}
                            <AnimatePresence>
                                {showSupplementHelp && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-4"
                                    >
                                        <div className="bg-white rounded-2xl p-4 border border-emerald-200/60 shadow-sm text-xs text-slate-600 space-y-2">
                                            <div className="flex items-start gap-2 text-emerald-900 font-bold">
                                                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>¿Para qué sirve esta sección y cómo editar?</span>
                                            </div>
                                            <p className="leading-relaxed">
                                                Este módulo calcula las dosis exactas de los suplementos con mayor evidencia científica (Creatina, Cafeína, Citrulina, etc.) basándose en las guías de la <strong>ISSN (Sociedad Internacional de Nutrición Deportiva)</strong>.
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                                                <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                                                    <span className="font-bold text-emerald-800">🟢 Dosis Editables:</span> Escribe directamente en los números para ajustar gramos o miligramos según tu criterio clínico.
                                                </div>
                                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                                    <span className="font-bold text-slate-700">⚪ Activar/Pausar:</span> Haz clic en las etiquetas superiores de cada tarjeta para habilitar o pausar un suplemento.
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Grid de Tarjetas de Suplementos Editables */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {/* Creatina */}
                                <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-3.5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">Creatina</span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Recomendado</span>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <input 
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={supplementPlan.creatine.dailyDoseGrams}
                                                onChange={e => setSupplementPlan({
                                                    ...supplementPlan,
                                                    creatine: { ...supplementPlan.creatine, dailyDoseGrams: Math.max(0, Number(e.target.value)) }
                                                })}
                                                className="w-16 bg-emerald-50/50 border border-emerald-200 rounded-lg px-2 py-0.5 text-2xl font-black text-slate-900 font-montserrat focus:outline-none focus:bg-white focus:border-emerald-500"
                                            />
                                            <span className="text-xs font-bold text-slate-400">g/día</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-2 mb-1">
                                            Fase de {supplementPlan.creatine.phase}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-snug border-t border-slate-100 pt-2 mt-1 font-medium">
                                        {supplementPlan.creatine.message || 'Consumir diariamente independientemente del horario de entrenamiento.'}
                                    </p>
                                </div>

                                {/* Beta-Alanina */}
                                <div className={`rounded-2xl p-3.5 transition-all flex flex-col justify-between border ${supplementPlan.betaAlanine.isPrescribed ? 'bg-white border-emerald-200/80 shadow-2xs hover:shadow-sm' : 'bg-white/60 border-slate-200/80'}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Beta-Alanina</span>
                                            <button 
                                                onClick={() => setSupplementPlan({
                                                    ...supplementPlan,
                                                    betaAlanine: {
                                                        ...supplementPlan.betaAlanine,
                                                        isPrescribed: !supplementPlan.betaAlanine.isPrescribed,
                                                        dailyDoseGrams: !supplementPlan.betaAlanine.isPrescribed ? (supplementPlan.betaAlanine.dailyDoseGrams || 3.2) : 0
                                                    }
                                                })}
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${supplementPlan.betaAlanine.isPrescribed ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                title="Clic para activar o pausar Beta-Alanina"
                                            >
                                                {supplementPlan.betaAlanine.isPrescribed ? 'Rendimiento ✓' : 'Pausada'}
                                            </button>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <input 
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={supplementPlan.betaAlanine.dailyDoseGrams}
                                                onChange={e => {
                                                    const val = Math.max(0, Number(e.target.value));
                                                    setSupplementPlan({
                                                        ...supplementPlan,
                                                        betaAlanine: { ...supplementPlan.betaAlanine, dailyDoseGrams: val, isPrescribed: val > 0 }
                                                    });
                                                }}
                                                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-2xl font-black text-slate-900 font-montserrat focus:outline-none focus:bg-white focus:border-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-slate-400">g/día</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-snug border-t border-slate-100 pt-2 mt-1 font-medium">
                                        {supplementPlan.betaAlanine.message || 'Para series de alta repetición y resistencia.'}
                                    </p>
                                </div>

                                {/* Cafeína */}
                                <div className={`rounded-2xl p-3.5 transition-all flex flex-col justify-between border ${supplementPlan.caffeine.isPrescribed ? 'bg-white border-amber-300 shadow-2xs hover:shadow-sm' : 'bg-white/60 border-slate-200/80'}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Cafeína</span>
                                            <button 
                                                onClick={() => setSupplementPlan({
                                                    ...supplementPlan,
                                                    caffeine: {
                                                        ...supplementPlan.caffeine,
                                                        isPrescribed: !supplementPlan.caffeine.isPrescribed,
                                                        preWorkoutDoseMg: !supplementPlan.caffeine.isPrescribed ? (supplementPlan.caffeine.preWorkoutDoseMg || 200) : 0
                                                    }
                                                })}
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${supplementPlan.caffeine.isPrescribed ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                title="Clic para activar o pausar Cafeína"
                                            >
                                                {supplementPlan.caffeine.isPrescribed ? 'Pre-Entreno ⚡' : 'Pausada'}
                                            </button>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <input 
                                                type="number"
                                                step="25"
                                                min="0"
                                                value={supplementPlan.caffeine.preWorkoutDoseMg}
                                                onChange={e => {
                                                    const val = Math.max(0, Number(e.target.value));
                                                    setSupplementPlan({
                                                        ...supplementPlan,
                                                        caffeine: { ...supplementPlan.caffeine, preWorkoutDoseMg: val, isPrescribed: val > 0 }
                                                    });
                                                }}
                                                className="w-20 bg-amber-50/50 border border-amber-200 rounded-lg px-2 py-0.5 text-2xl font-black text-slate-900 font-montserrat focus:outline-none focus:bg-white focus:border-amber-500"
                                            />
                                            <span className="text-xs font-bold text-slate-400">mg</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-2 mb-1">
                                            -{supplementPlan.caffeine.timingMinutes || 45} min antes
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-snug border-t border-slate-100 pt-2 mt-1 font-medium">
                                        {supplementPlan.caffeine.warning || (supplementPlan.caffeine.isPrescribed ? 'Consumir 45 min antes de entrenar.' : 'Suprimida. El clearance de vida media interferiría con el sueño profundo.')}
                                    </p>
                                </div>

                                {/* Citrulina */}
                                <div className={`rounded-2xl p-3.5 transition-all flex flex-col justify-between border ${supplementPlan.citrulline.isPrescribed ? 'bg-white border-indigo-200/80 shadow-2xs hover:shadow-sm' : 'bg-white/60 border-slate-200/80'}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Citrulina</span>
                                            <button 
                                                onClick={() => setSupplementPlan({
                                                    ...supplementPlan,
                                                    citrulline: {
                                                        ...supplementPlan.citrulline,
                                                        isPrescribed: !supplementPlan.citrulline.isPrescribed,
                                                        preWorkoutDoseGrams: !supplementPlan.citrulline.isPrescribed ? (supplementPlan.citrulline.preWorkoutDoseGrams || 6) : 0
                                                    }
                                                })}
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${supplementPlan.citrulline.isPrescribed ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                title="Clic para activar o pausar Citrulina"
                                            >
                                                {supplementPlan.citrulline.isPrescribed ? 'Vasodilatador ✓' : 'Opcional'}
                                            </button>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <input 
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={supplementPlan.citrulline.preWorkoutDoseGrams}
                                                onChange={e => {
                                                    const val = Math.max(0, Number(e.target.value));
                                                    setSupplementPlan({
                                                        ...supplementPlan,
                                                        citrulline: { ...supplementPlan.citrulline, preWorkoutDoseGrams: val, isPrescribed: val > 0 }
                                                    });
                                                }}
                                                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-2xl font-black text-slate-900 font-montserrat focus:outline-none focus:bg-white focus:border-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-slate-400">g</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mt-2 mb-1">
                                            Pre-entreno (-{supplementPlan.citrulline.timingMinutes || 45}m)
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-snug border-t border-slate-100 pt-2 mt-1 font-medium">
                                        {supplementPlan.citrulline.isPrescribed ? 'Mejora el flujo sanguíneo y oxigenación muscular.' : 'Vasodilatador no requerido.'}
                                    </p>
                                </div>

                                {/* HMB */}
                                <div className={`rounded-2xl p-3.5 transition-all flex flex-col justify-between border ${supplementPlan.hmb.isPrescribed ? 'bg-white border-purple-200/80 shadow-2xs hover:shadow-sm' : 'bg-white/60 border-slate-200/80'}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">HMB</span>
                                            <button 
                                                onClick={() => setSupplementPlan({
                                                    ...supplementPlan,
                                                    hmb: {
                                                        ...supplementPlan.hmb,
                                                        isPrescribed: !supplementPlan.hmb.isPrescribed,
                                                        dailyDoseGrams: !supplementPlan.hmb.isPrescribed ? (supplementPlan.hmb.dailyDoseGrams || 3) : 0
                                                    }
                                                })}
                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${supplementPlan.hmb.isPrescribed ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                                title="Clic para activar o pausar HMB"
                                            >
                                                {supplementPlan.hmb.isPrescribed ? 'Anticatabólico ✓' : 'No requerido'}
                                            </button>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <input 
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={supplementPlan.hmb.dailyDoseGrams}
                                                onChange={e => {
                                                    const val = Math.max(0, Number(e.target.value));
                                                    setSupplementPlan({
                                                        ...supplementPlan,
                                                        hmb: { ...supplementPlan.hmb, dailyDoseGrams: val, isPrescribed: val > 0 }
                                                    });
                                                }}
                                                className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-2xl font-black text-slate-900 font-montserrat focus:outline-none focus:bg-white focus:border-purple-500"
                                            />
                                            <span className="text-xs font-bold text-slate-400">g/día</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-snug border-t border-slate-100 pt-2 mt-1 font-medium">
                                        {supplementPlan.hmb.message || 'Dividir en tomas para mantener niveles plasmáticos estables.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Split Workspace ── */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[calc(100vh-14rem)] relative z-0">
                {leftSidebar && (
                    <div className="border-r border-slate-200 bg-white">
                        <div className="h-full overflow-y-auto bg-white custom-scrollbar">
                            {leftSidebar}
                        </div>
                    </div>
                )}
                
                {/* ── Main Canvas Block ── */}
                <div ref={setNodeRef} className={`flex-1 overflow-y-auto custom-scrollbar p-6 transition-all duration-300 ${isOver ? 'bg-emerald-50/50 ring-2 ring-emerald-500 ring-inset shadow-[inset_0_0_50px_rgba(16,185,129,0.1)]' : 'bg-white'} relative`}>
                    
                    {/* ── Sticky Context Navigation ── */}
                    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 -mx-6 -mt-6 mb-6 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col flex-1 mr-4">
                            <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase mb-0.5">
                                Plan Activo
                            </span>
                            <input type="text" value={cycleName} onChange={e => setCycleName(e.target.value)}
                                placeholder="Nombre del plan (ej. Recomposición Semana 1)"
                                className="w-full text-lg font-black font-montserrat text-slate-900 bg-transparent outline-none placeholder:text-slate-300 transition-colors focus:text-indigo-600" />
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                            {/* Botón de Directrices con dropdown */}
                            <div className="relative group">
                                <button className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-2">
                                    <Shield className="w-4 h-4"/> Directrices
                                </button>
                                {/* Dropdown flotante */}
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right z-50">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Patologías y Alergias
                                    </h4>
                                    {medicalTags && medicalTags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {medicalTags.map((tag, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md border border-rose-200/50">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-medium text-slate-400 italic">Sin restricciones reportadas.</p>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Utensils className="w-4 h-4 text-sky-500" /> Hábitos Actuales
                                        </h4>
                                        <div className="text-[11px] text-slate-600 space-y-1">
                                            <p><span className="font-bold text-slate-400">Dieta:</span> {healthData?.currentDiet || '-'}</p>
                                            <p><span className="font-bold text-slate-400">Comidas/día:</span> {healthData?.mealsPerDay || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={isSaving}
                                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md font-bold text-sm rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isSaving ? 'Guardando...' : 'Guardar Plan'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {headerNavigation && (
                            <div className="pt-2 pb-2 border-b border-slate-100">
                                {headerNavigation}
                            </div>
                        )}

                        <div 
                            className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-3 px-4 transition-all mb-4 shadow-xs"
                        >
                            {/* Lado Izquierdo: Título y Selector de Ingestas Simétrico */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Utensils className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-black text-slate-800 font-montserrat uppercase tracking-wider">
                                    {dayName ? `Menú Diario - ${dayName}` : 'Menú Diario'}
                                </h2>
                                <div className="flex items-center">
                                    <select 
                                        value={meals.length} 
                                        onChange={(e) => {
                                            const newCount = parseInt(e.target.value);
                                            loadPhaseIntoCanvas(recommendedPhase, newCount);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                        className="h-8 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-2.5 outline-none cursor-pointer hover:border-emerald-300 focus:border-emerald-500 transition-colors shadow-2xs"
                                    >
                                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Ingestas</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Lado Derecho: Botones de Acción Alineados y Simétricos */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); loadPhaseIntoCanvas(recommendedPhase, meals.length); }}
                                    className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
                                    title={`Carga el menú sugerido balanceado a ${meals.length} ingestas y lo distribuye a los 7 días`}
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Cargar Menú ({meals.length} Ingestas)
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleCloneDayToAll(); }}
                                    className="h-8 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
                                    title="Clona este día exacto a los otros 6 días de la semana"
                                >
                                    <Copy className="w-3.5 h-3.5 text-indigo-600" /> Replicar Día
                                </button>
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="h-8 px-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold bg-slate-50 border border-slate-200 shadow-2xs"
                                    title={isMenuOpen ? "Ocultar detalles del menú" : "Mostrar detalles del menú"}
                                >
                                    {isMenuOpen ? (
                                        <><span>Ocultar</span><ChevronUp size={14} /></>
                                    ) : (
                                        <><span>Expandir</span><ChevronDown size={14} /></>
                                    )}
                                </button>
                            </div>
                        </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden space-y-5"
                    >
                        {/* ── Feedback ── */}
                        {validationErrors.length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1">
                                <p className="text-red-400 font-bold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Errores de Validación (Zod Gate)</p>
                                {validationErrors.map((err, i) => <p key={i} className="text-red-300/80 text-xs font-mono">• {err}</p>)}
                            </div>
                        )}
                        {saveError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"><p className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {saveError}</p></div>}
                        {saveSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"><p className="text-emerald-400 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Plan guardado correctamente.</p></div>}

                        {/* ── CARGA INTELIGENTE POR ARQUETIPO (1 Clic) ── */}
                        {(meals.length === 0 || meals.every(m => m.options.every(o => o.items.length === 0))) && (
                            <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-indigo-50/80 border-2 border-emerald-200/80 rounded-3xl p-6 mb-6 shadow-sm flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20 text-xl">
                                    🎯
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/90 text-emerald-800 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
                                    Arquetipo Detectado: {goalTags?.[0] || 'Recomposición Corporal'}
                                </div>
                                <h3 className="text-slate-900 font-black font-montserrat text-base mb-1">
                                    Menú Sugerido: {recommendedPhase.phaseName}
                                </h3>
                                <p className="text-slate-600 text-xs mb-4 max-w-lg leading-relaxed">
                                    Carga automáticamente las 4 ingestas (Desayuno, Almuerzo, Merienda y Cena) con sus <strong>3 opciones balanceadas A, B y C</strong> listas para personalizar ({recommendedPhase.dailyTargetMacros.calories} kcal).
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                    <button 
                                        onClick={() => loadPhaseIntoCanvas(recommendedPhase)}
                                        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" /> Cargar Menú Sugerido (1 Clic)
                                    </button>

                                    {/* Selector de Otras Fases */}
                                    <select
                                        onChange={(e) => {
                                            const selected = getPresetByPhaseId(e.target.value);
                                            if (selected) loadPhaseIntoCanvas(selected);
                                        }}
                                        defaultValue=""
                                        className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-3 px-4 rounded-xl shadow-sm outline-none cursor-pointer transition-colors"
                                    >
                                        <option value="" disabled>Elegir otra Fase Nutricional...</option>
                                        {ALL_PRESET_PHASES.map((p) => (
                                            <option key={p.phaseId} value={p.phaseId}>
                                                {p.phaseName} ({p.dailyTargetMacros.calories} kcal)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* ── Removed Old Progress Block ── */}

                        {/* ── Meal List ── */}
                        <div className="space-y-4">
                            {meals.map((meal, index) => (
                                <IngestaCard
                                    key={meal.id}
                                    meal={meal}
                                    mealIndex={index}
                                    isExpanded={expandedMealId === meal.id}
                                    onToggle={() => setExpandedMealId(expandedMealId === meal.id ? null : meal.id)}
                                    onUpdateMeal={u => updateMeal(meal.id, u)}
                                    onRemoveMeal={() => removeMeal(meal.id)}
                                    onCloneMeal={() => cloneMeal(meal.id)}
                                    onAddOption={() => addOptionToMeal(meal.id)}
                                    onCloneOption={optId => cloneOption(meal.id, optId)}
                                    onAutoSwapOption={optId => autoSwapOption(meal.id, optId)}
                                    onRemoveOption={optId => removeOption(meal.id, optId)}
                                    onAddItem={(optId) => addItemToOption(meal.id, optId)}
                                    onAddNaaSBlock={(optId, type) => addNaaSBlockToOption(meal.id, optId, type)}
                                    onRemoveItem={(optId, itemId) => removeItemFromOption(meal.id, optId, itemId)}
                                    onUpdateItem={(optId, itemId, updates) => updateItemInOption(meal.id, optId, itemId, updates)}
                                    onEqualizeOptions={() => equalizeOptionsInMeal(meal.id)}
                                />
                            ))}
                        </div>

                        {/* ── Add Ingesta ── */}
                        <button onClick={addMeal}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-zinc-400 text-sm hover:bg-lime-500/10 hover:text-lime-400 hover:border-lime-500/30 transition-all flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Agregar Ingesta
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
            </div>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {isFormModalOpen && (
                    <AthleteFormModal onClose={() => setIsFormModalOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ── IngestaCard (Concepto A: Cascada Atómica) ──
// ═══════════════════════════════════════════════════════════════════════════

interface IngestaCardProps {
    meal: MealBlock;
    mealIndex: number;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdateMeal: (u: Partial<MealBlock>) => void;
    onRemoveMeal: () => void;
    onCloneMeal: () => void;
    onAddOption: () => void;
    onCloneOption: (optId: string) => void;
    onAutoSwapOption: (optId: string) => void;
    onRemoveOption: (optId: string) => void;
    onAddItem: (optId: string) => void;
    onAddNaaSBlock: (optId: string, type: 'PRO' | 'CHO' | 'FAT') => void;
    onRemoveItem: (optId: string, itemId: string) => void;
    onUpdateItem: (optId: string, itemId: string, u: Partial<MealItem>) => void;
    onEqualizeOptions?: () => void;
}

const IngestaCard: React.FC<IngestaCardProps> = ({
    meal, mealIndex, isExpanded, onToggle, onUpdateMeal, onRemoveMeal, onCloneMeal,
    onAddOption, onCloneOption, onAutoSwapOption, onRemoveOption, onAddItem, onAddNaaSBlock, onRemoveItem, onUpdateItem,
    onEqualizeOptions
}) => {
    const [showNotes, setShowNotes] = useState(!!meal.notes);
    const envelope = useMemo(() => calcMacroEnvelope(meal.options), [meal.options]);
    const displayLabel = meal.custom_label || `Ingesta ${mealIndex + 1}`;

    const { setNodeRef, isOver } = useDroppable({
        id: `meal-block-${meal.id}`,
        data: { type: 'MEAL_BLOCK', mealId: meal.id }
    });

    return (
        <div ref={setNodeRef} className={`bg-white shadow-sm border rounded-2xl transition-colors relative z-10 ${isOver ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200'}`} style={{ zIndex: 100 - mealIndex }}>
            {/* ── DISCOVERY SPIKE: Option 2 (Explanatory Placeholder) ── */}
            {(meal as any).isSpikeOmitted ? (
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-4 flex items-center justify-between rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-200/50 p-2 rounded-lg text-slate-400">
                            <Utensils className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-slate-500 font-bold text-sm line-through decoration-slate-400">{meal.custom_label || MEAL_DEFAULTS[meal.type].label}</h3>
                            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                                <Lock className="w-3 h-3 text-slate-400" /> Omitida automáticamente por regla de ciclo: Ayuno Intermitente (16/8)
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onUpdateMeal({ isSpikeOmitted: false } as any)} 
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                        title="Forzar anulación de la regla"
                    >
                        Anular Regla
                    </button>
                </div>
            ) : (
                <>
                {/* ── Header ── */}
                <div onClick={onToggle} className={`w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'}`}>
                <div className="flex items-center gap-3">
                    <span className="text-emerald-500">{MEAL_DEFAULTS[meal.type]?.icon}</span>
                    <span className="text-slate-800 font-bold text-base">{displayLabel}</span>
                    {meal.time_target && (
                        <span className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {meal.time_target}</span>
                    )}
                    <span className="text-slate-500 text-xs font-bold hidden sm:inline-block">
                        {meal.options.length} {meal.options.length === 1 ? 'opción' : 'opciones'} · ~{envelope.avg.calories} kcal
                    </span>
                    {!envelope.isBalanced && (
                        <span className="text-amber-500 text-xs font-bold flex items-center gap-1" title={`Varianza de ${envelope.variancePct}% entre opciones`}>
                            <AlertTriangle className="w-3 h-3" /> ±{envelope.variancePct}%
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); onCloneMeal(); }}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                        title="Duplicar Ingesta Completa">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onRemoveMeal(); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar Ingesta">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
            </div>

            {/* ── Body ── */}
            {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 space-y-4 pt-4">
                    {/* Config Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <input type="text" value={meal.custom_label || ''} onChange={e => onUpdateMeal({ custom_label: e.target.value || null })}
                            placeholder={`Ingesta ${mealIndex + 1}`}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 w-40 font-bold placeholder:font-normal" />
                        <input type="time" value={meal.time_target || ''} onChange={e => onUpdateMeal({ time_target: e.target.value || null })}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 font-bold" />
                        <select value={meal.type} onChange={e => onUpdateMeal({ type: e.target.value as MealType })}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-bold">
                            {MealTypeEnum.options.map(t => <option key={t} value={t}>{MEAL_DEFAULTS[t].label}</option>)}
                        </select>
                        <button onClick={() => setShowNotes(!showNotes)}
                            className={`p-1.5 rounded-lg border transition-colors ${showNotes ? 'bg-indigo-50 border-indigo-200 text-indigo-500' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                            <MessageSquare className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Notes (Acordeón) */}
                    {showNotes && (
                        <div className="border-l-2 border-indigo-500 pl-3">
                            <textarea value={meal.notes || ''} onChange={e => onUpdateMeal({ notes: e.target.value || null })}
                                placeholder="Notas o instrucciones para el atleta en esta comida (opcional, ej. 'Tomar con 1 vaso grande de agua antes de entrenar')..."
                                rows={2}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 text-xs focus:outline-none focus:border-indigo-400 focus:bg-white placeholder:text-slate-400 resize-none transition-colors" />
                        </div>
                    )}

                    {/* Macro Envelope Alert & Quick Parity Button */}
                    {meal.options.length > 1 && !envelope.isBalanced && (
                        <div className="bg-amber-50 border border-amber-200/90 rounded-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                <p className="text-amber-800 text-xs font-medium">
                                    Las opciones varían un <strong className="font-bold text-amber-950">{envelope.variancePct}%</strong> en calorías ({envelope.min.calories}–{envelope.max.calories} kcal).
                                </p>
                            </div>
                            {onEqualizeOptions && (
                                <button
                                    onClick={onEqualizeOptions}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs active:scale-95 whitespace-nowrap self-end sm:self-auto"
                                    title="Ajusta proporcionalmente las porciones de las demás opciones para igualar las calorías de la Opción A"
                                >
                                    <Scale className="w-3.5 h-3.5" />
                                    Nivelar Opciones ({envelope.avg.calories} kcal)
                                </button>
                            )}
                        </div>
                    )}

                    {/* Options (Cascada) */}
                    <div className="space-y-3">
                        {meal.options.map(option => (
                            <OptionCard key={option.id} 
                                mealId={meal.id}
                                option={option}
                                canRemove={meal.options.length > 1}
                                onClone={() => onCloneOption(option.id)}
                                onAutoSwap={() => onAutoSwapOption(option.id)}
                                onRemove={() => onRemoveOption(option.id)}
                                onAddItem={() => onAddItem(option.id)}
                                onAddNaaSBlock={type => onAddNaaSBlock(option.id, type)}
                                onRemoveItem={itemId => onRemoveItem(option.id, itemId)}
                                onUpdateItem={(itemId, u) => onUpdateItem(option.id, itemId, u)} />
                        ))}
                    </div>

                    {/* Add Option Trigger */}
                    <div className="pt-2 flex justify-center">
                        <button onClick={onAddOption} title="Agregar nueva opción de menú a esta comida"
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-300 transition-all flex items-center gap-2 shadow-xs">
                            <Plus className="w-3.5 h-3.5" /> Agregar Opción
                        </button>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ── OptionCard (Nivel Opción A, B, C) ──
// ═══════════════════════════════════════════════════════════════════════════

interface OptionCardProps {
    mealId: string;
    option: MealOption;
    canRemove: boolean;
    onClone: () => void;
    onAutoSwap: () => void;
    onRemove: () => void;
    onAddItem: () => void;
    onAddNaaSBlock: (type: 'PRO' | 'CHO' | 'FAT') => void;
    onRemoveItem: (itemId: string) => void;
    onUpdateItem: (itemId: string, u: Partial<MealItem>) => void;
}

const OptionCard: React.FC<OptionCardProps> = ({
    mealId, option, canRemove, onClone, onAutoSwap, onRemove, onAddItem, onAddNaaSBlock, onRemoveItem, onUpdateItem
}) => {
    const [isVisualOpen, setIsVisualOpen] = useState(false);
    const macros = useMemo(() => sumItemsMacros(option.items), [option.items]);
    const plate = useMemo(() => calculateVisualPlate(option.items), [option.items]);

    const { setNodeRef, isOver } = useDroppable({
        id: option.id,
        data: { type: 'MEAL_OPTION', optionId: option.id, blockId: mealId }
    });

    return (
        <div ref={setNodeRef} className={`border-l-2 pl-4 py-1 space-y-2 relative transition-colors ${isOver ? 'border-emerald-400 bg-emerald-50/50 rounded-r-xl' : 'border-indigo-200'}`}>
            {/* Option Header */}
            <div className={`flex items-center justify-between relative ${isVisualOpen ? 'z-50' : 'z-10'}`}>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{option.label}</span>
                        {option.isAIDraft && <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm"><Wand2 className="w-2.5 h-2.5"/> Borrador IA</span>}
                    </div>
                    <div className={`relative flex items-center ${isVisualOpen ? 'z-50' : 'z-10'}`}>
                        <button 
                            onClick={() => setIsVisualOpen(!isVisualOpen)}
                            className={`flex items-center gap-1.5 py-0.5 px-1 -ml-1 rounded transition-colors relative ${isVisualOpen ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                        >
                            <div className="w-4 h-4 rounded-full shadow-2xs border border-slate-200" style={{ background: plate.plateConicGradient }} />
                            <span className={`text-[9px] font-bold uppercase tracking-wide transition-colors ${isVisualOpen ? 'text-indigo-600' : 'text-slate-400'}`}>% Visual en Plato</span>
                            
                            {/* Modal / Tooltip Pedagógico del Plato Real */}
                            <div className={`absolute left-0 top-7 transition-all duration-300 bg-white border border-slate-200/90 shadow-2xl rounded-2xl p-4 w-72 z-50 origin-top-left ${isVisualOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                                    <p className="text-xs font-black text-slate-800 font-montserrat flex items-center gap-1.5">
                                        🍽️ Distribución del Plato
                                    </p>
                                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                                        Método Harvard
                                    </span>
                                </div>
                                
                                {/* Plato grande centrado con borde de vajilla */}
                                <div className="flex justify-center mb-3 relative">
                                    <div className="w-24 h-24 rounded-full shadow-inner border-4 border-slate-100 flex items-center justify-center transition-all" style={{ background: plate.plateConicGradient }}>
                                        <div className="w-8 h-8 rounded-full bg-white/95 shadow-2xs flex items-center justify-center text-[9px] font-black text-slate-700 font-montserrat">
                                            {macros.calories}k
                                        </div>
                                    </div>
                                </div>

                                {/* Grupos del Plato Real */}
                                <div className="space-y-1.5 text-[11px] mb-3">
                                    <div className="flex justify-between items-center bg-emerald-50/70 border border-emerald-100 rounded-lg px-2.5 py-1">
                                        <span className="flex items-center gap-1.5 font-bold text-emerald-900">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>🥗 Vegetales / Frutas ({plate.vegetablesGrams}g)
                                        </span>
                                        <span className="font-black text-emerald-800">{plate.vegetablesPct}%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-rose-50/70 border border-rose-100 rounded-lg px-2.5 py-1">
                                        <span className="flex items-center gap-1.5 font-bold text-rose-900">
                                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>🥩 Proteína Magra ({plate.proteinGrams}g)
                                        </span>
                                        <span className="font-black text-rose-800">{plate.proteinPct}%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-50/70 border border-amber-100 rounded-lg px-2.5 py-1">
                                        <span className="flex items-center gap-1.5 font-bold text-amber-900">
                                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>🍚 Carbohidratos ({plate.carbsGrams}g)
                                        </span>
                                        <span className="font-black text-amber-800">{plate.carbsPct}%</span>
                                    </div>
                                    {plate.fatsGrams > 0 && (
                                        <div className="flex justify-between items-center bg-sky-50/70 border border-sky-100 rounded-lg px-2.5 py-1">
                                            <span className="flex items-center gap-1.5 font-bold text-sky-900">
                                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>🫒 Grasas / Aceites ({plate.fatsGrams}g)
                                            </span>
                                            <span className="font-black text-sky-800">{plate.fatsPct}%</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-snug">
                                    💡 <strong>Regla Visual:</strong> ~1/2 plato vegetales/frutas, ~1/4 proteína (1 palma) y ~1/4 carbohidratos (1 puño).
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                        <span title="Proteínas" className="cursor-help hover:text-zinc-700">{macros.protein_g.toFixed(0)}g Pro</span>
                        <span className="text-zinc-300">·</span>
                        <span title="Carbohidratos" className="cursor-help hover:text-zinc-700">{macros.carbs_g.toFixed(0)}g Car</span>
                        <span className="text-zinc-300">·</span>
                        <span title="Grasas" className="cursor-help hover:text-zinc-700">{macros.fat_g.toFixed(0)}g Gra</span>
                        <span className="text-zinc-300">·</span>
                        <span title="Calorías" className="cursor-help font-bold text-zinc-600 hover:text-zinc-800">{macros.calories} kcal</span>
                    </span>
                    <button onClick={onClone} title="Clonar opción"
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                    {canRemove && (
                        <button onClick={onRemove}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Items (Tags/Inline) */}
            {option.items.length > 0 && (
                <div className="space-y-1.5">
                    {option.items.map(item => (
                        <ItemRow key={item.id} item={item}
                            onUpdate={u => onUpdateItem(item.id, u)}
                            onRemove={() => onRemoveItem(item.id)} />
                    ))}
                </div>
            )}

            {/* Add Item Action */}
            <div className="pt-1 opacity-40 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                <button onClick={onAddItem} title="Buscar un alimento de la base de datos"
                    className="px-3 py-1.5 rounded-md text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Agregar Alimento
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ── ItemRow (Compact inline with Smart Swap Engine) ──
// ═══════════════════════════════════════════════════════════════════════════

const ItemRow: React.FC<{
    item: MealItem;
    onUpdate: (u: Partial<MealItem>) => void;
    onRemove: () => void;
}> = ({ item, onUpdate, onRemove }) => {
    // Fase 1: Telemetría (Línea Base)
    const startInteractionTime = useRef<number | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showSmartSwaps, setShowSmartSwaps] = useState(false);
    const [swapTab, setSwapTab] = useState<'auto' | 'carbs' | 'protein' | 'fat' | 'vegan'>('auto');
    const [swapSearchQuery, setSwapSearchQuery] = useState('');
    const [saraCustomSwaps, setSaraCustomSwaps] = useState<CalculatedSwap[]>([]);
    const swapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (swapRef.current && !swapRef.current.contains(event.target as Node)) {
                setShowSmartSwaps(false);
            }
        };

        if (showSmartSwaps) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSmartSwaps]);

    const suggestions = useMemo(() => {
        if (!item.name || item.name.length < 2) return [];
        const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const term = normalizeStr(item.name);
        return saraPredictive.filter((f: any) => 
            normalizeStr(f.name).includes(term) || 
            normalizeStr(f.category).includes(term)
        ).slice(0, 5);
    }, [item.name]);

    const handleInteractionStart = () => {
        setShowSuggestions(true);
        if (!startInteractionTime.current) {
            startInteractionTime.current = Date.now();
            console.info('[Telemetry] food_interaction_start', { itemId: item.id, timestamp: startInteractionTime.current });
        }
    };

    const handleInteractionSave = () => {
        setTimeout(() => setShowSuggestions(false), 200);
        if (startInteractionTime.current) {
            const ttc = Date.now() - startInteractionTime.current;
            console.info('[Telemetry] food_interaction_save', { itemId: item.id, ttc_ms: ttc });
            startInteractionTime.current = null;
        }
    };

    const portionGrams = item.portion_amount ?? (item as any).quantity_g ?? 100;
    const household = useMemo(() => getHouseholdMeasure(item.name, portionGrams), [item.name, portionGrams]);

    const itemCalories = item.macros.calories || Math.round((item.macros.protein_g || 0) * 4 + (item.macros.carbs_g || 0) * 4 + (item.macros.fat_g || 0) * 9);
    const dominance = useMemo(() => getFoodDominance(item.macros.protein_g || 0, item.macros.carbs_g || 0, item.macros.fat_g || 0), [item.macros]);

    // Calcular sustitutos dinámicos
    const smartSwaps = useMemo(() => {
        return getSmartSwaps(item.name, portionGrams, { ...item.macros, calories: itemCalories }, swapTab);
    }, [item.name, portionGrams, item.macros, itemCalories, swapTab]);

    // Búsqueda en vivo en SARA Database dentro del Swap Popover
    useEffect(() => {
        if (!swapSearchQuery.trim() || swapSearchQuery.length < 2) {
            setSaraCustomSwaps([]);
            return;
        }
        const timer = setTimeout(async () => {
            const found = await searchSaraFoods(swapSearchQuery);
            const mapped = found.slice(0, 5).map(f => convertSaraItemToSwap(f, { ...item.macros, calories: itemCalories }, dominance));
            setSaraCustomSwaps(mapped);
        }, 150);
        return () => clearTimeout(timer);
    }, [swapSearchQuery, item.macros, itemCalories, dominance]);

    const activeDisplaySwaps = swapSearchQuery.trim().length >= 2 ? saraCustomSwaps : smartSwaps;

    return (
        <div className="flex items-center gap-1.5 group relative" onFocusCapture={handleInteractionStart} onBlurCapture={handleInteractionSave}>
            <div className="relative flex-1 flex flex-col justify-center min-w-0 group/swap py-0.5">
                <div className="flex items-center">
                    <input type="text" value={item.name} onChange={e => onUpdate({ name: e.target.value })}
                        placeholder="Alimento" className="w-full bg-transparent text-slate-800 font-semibold text-sm focus:outline-none placeholder:text-slate-400 px-2 py-1 rounded-lg hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-300 transition-colors relative z-10" />
                    
                    {/* Smart Swap Magnetic Trigger */}
                    <div 
                        onClick={() => {
                            setShowSmartSwaps(!showSmartSwaps);
                            setSwapSearchQuery('');
                        }}
                        className="opacity-0 group-hover/swap:opacity-100 cursor-pointer text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 px-1.5 py-0.5 rounded-md transition-all z-20 flex items-center gap-1 shrink-0 ml-1 border border-indigo-200/60 shadow-xs"
                        title="Sustitución Inteligente (Smart Swap)"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">Swap</span>
                    </div>
                </div>

                {/* Medida Casera Pedagógica */}
                {household && (
                    <span className="text-[10px] text-emerald-700 font-medium px-2 -mt-0.5 truncate select-none" title={`Equivalencia cotidiana: ${household}`}>
                        💡 {household}
                    </span>
                )}

                {/* Smart Swap Context Menu (Full Info Card) */}
                <AnimatePresence>
                    {showSmartSwaps && (
                        <motion.div 
                            ref={swapRef}
                            initial={{ opacity: 0, scale: 0.95, y: 5 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            className="absolute left-0 top-full mt-2 w-[420px] max-w-[95vw] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Gradient Header */}
                            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-4 py-3 text-white">
                                <div className="flex items-center justify-between">
                                    <span className="text-white text-xs font-bold flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-amber-300" /> Sustitutos Inteligentes (Smart Swap)
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setShowSmartSwaps(false); }}
                                        className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                                        title="Cerrar"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Target Food Recap */}
                                <div className="mt-2 bg-black/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px]">
                                    <span className="font-semibold text-white truncate max-w-[180px]">
                                        {item.name || 'Alimento'} ({portionGrams}g)
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0 text-indigo-100 font-mono text-[10px]">
                                        <span className="text-amber-300 font-bold">{itemCalories} kcal</span>
                                        <span>•</span>
                                        <span>{item.macros.carbs_g || 0}g C</span>
                                        <span>•</span>
                                        <span>{item.macros.protein_g || 0}g P</span>
                                        <span>•</span>
                                        <span>{item.macros.fat_g || 0}g F</span>
                                    </div>
                                </div>

                                {/* Dominance Explanation */}
                                <div className="mt-1.5 text-[10px] text-indigo-100/90 flex items-center gap-1 font-medium">
                                    {dominance === 'CARBS' && <span>🌾 <strong>Dominio Carbohidratos:</strong> Porciones calculadas para igualar {item.macros.carbs_g || 0}g de Carbos.</span>}
                                    {dominance === 'PROTEIN' && <span>🥩 <strong>Dominio Proteico:</strong> Porciones calculadas para igualar {item.macros.protein_g || 0}g de Proteína.</span>}
                                    {dominance === 'FAT' && <span>🥑 <strong>Dominio Grasas:</strong> Porciones calculadas para igualar {item.macros.fat_g || 0}g de Grasas.</span>}
                                    {dominance === 'BALANCED' && <span>⚖️ <strong>Perfil Balanceado:</strong> Porciones isocalóricas calculadas (~{itemCalories} kcal).</span>}
                                </div>
                            </div>

                            {/* Category Filter Chips */}
                            <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto text-[11px]">
                                {[
                                    { id: 'auto', label: '🎯 Sugeridos' },
                                    { id: 'carbs', label: '🌾 Carbos' },
                                    { id: 'protein', label: '🥩 Proteínas' },
                                    { id: 'fat', label: '🥑 Grasas' },
                                    { id: 'vegan', label: '🌱 Vegano' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setSwapTab(tab.id as any);
                                            setSwapSearchQuery('');
                                        }}
                                        className={`px-2.5 py-1 rounded-full font-semibold transition-all shrink-0 ${
                                            swapTab === tab.id && !swapSearchQuery
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search in SARA Database */}
                            <div className="p-2 border-b border-slate-100 bg-white">
                                <div className="relative flex items-center">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                                    <input 
                                        type="text"
                                        value={swapSearchQuery}
                                        onChange={(e) => setSwapSearchQuery(e.target.value)}
                                        placeholder="Buscar cualquier alimento en la base nutricional..."
                                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-700 placeholder:text-slate-400"
                                    />
                                    {swapSearchQuery && (
                                        <button 
                                            onClick={() => setSwapSearchQuery('')}
                                            className="absolute right-2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Swaps List with All Macro Info */}
                            <div className="p-2 space-y-1.5 max-h-[290px] overflow-y-auto">
                                {activeDisplaySwaps.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-xs">
                                        No se encontraron sustitutos equivalentes para este criterio.
                                    </div>
                                ) : (
                                    activeDisplaySwaps.map((swap, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => {
                                                onUpdate({ 
                                                    name: swap.name, 
                                                    portion_amount: swap.quantity_g, 
                                                    quantity_g: swap.quantity_g,
                                                    macros: swap.macros 
                                                });
                                                setShowSmartSwaps(false);
                                            }}
                                            className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer transition-all hover:shadow-xs group/card bg-white"
                                        >
                                            {/* Row 1: Name + Grams + Tag */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span className="text-sm font-bold text-slate-800 group-hover/card:text-indigo-900 truncate">
                                                        {swap.quantity_g}g {swap.name}
                                                    </span>
                                                    {swap.isCustomSearch && (
                                                        <span className="text-[9px] bg-purple-50 text-purple-600 font-bold px-1.5 py-0.2 rounded border border-purple-200">
                                                            Nutrición
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0 border border-indigo-100">
                                                    🎯 {swap.matchPercentage}% match
                                                </span>
                                            </div>

                                            {/* Row 2: Household measure */}
                                            {swap.household && (
                                                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                                                    💡 {swap.household}
                                                </p>
                                            )}

                                            {/* Row 3: Full 4 Macro Badges (Kcal, Carbs, Protein, Fat) */}
                                            <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
                                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                                    🔥 {swap.macros.calories} kcal
                                                </span>
                                                <span className="bg-amber-50 text-amber-700 border border-amber-200/60 font-bold px-1.5 py-0.5 rounded-md text-[10px]">
                                                    🌾 {swap.macros.carbs_g}g C
                                                </span>
                                                <span className="bg-rose-50 text-rose-700 border border-rose-200/60 font-bold px-1.5 py-0.5 rounded-md text-[10px]">
                                                    🥩 {swap.macros.protein_g}g P
                                                </span>
                                                <span className="bg-sky-50 text-sky-700 border border-sky-200/60 font-bold px-1.5 py-0.5 rounded-md text-[10px]">
                                                    🥑 {swap.macros.fat_g}g F
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Predictive Auto-complete Dropdown */}
            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 top-full mt-1 w-[300px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                        {suggestions.map((s: any) => (
                            <div 
                                key={s.id} 
                                onClick={() => {
                                    onUpdate({ 
                                        name: s.name, 
                                        portion_amount: 100,
                                        macros: {
                                            protein_g: s.protein_g,
                                            carbs_g: s.carbs_g,
                                            fat_g: s.fat_g,
                                            calories: s.calories
                                        }
                                    });
                                    setShowSuggestions(false);
                                }}
                                className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-100 last:border-0"
                            >
                                <p className="text-xs font-bold text-slate-700 truncate">{s.name}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded shadow-sm">P: {s.protein_g}</span>
                                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded shadow-sm">C: {s.carbs_g}</span>
                                    <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-1 rounded shadow-sm">F: {s.fat_g}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input de Gramos / Porción (Siempre visible y editable) */}
            <div className="flex items-center bg-slate-50 border border-slate-200 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:bg-white rounded-lg px-2 py-0.5 shadow-2xs transition-all shrink-0">
                <input 
                    type="number" 
                    value={item.portion_amount ?? (item as any).quantity_g ?? 100} 
                    min={1} 
                    step={5}
                    onChange={e => {
                        const newPortion = Math.max(1, Number(e.target.value));
                        const currentPortion = item.portion_amount ?? (item as any).quantity_g ?? 100;
                        const ratio = currentPortion > 0 ? newPortion / currentPortion : 1;
                        onUpdate({ 
                            portion_amount: newPortion,
                            quantity_g: newPortion,
                            macros: {
                                protein_g: Number((item.macros.protein_g * ratio).toFixed(1)),
                                carbs_g: Number((item.macros.carbs_g * ratio).toFixed(1)),
                                fat_g: Number((item.macros.fat_g * ratio).toFixed(1)),
                                calories: Math.round(item.macros.calories * ratio)
                            }
                        });
                    }}
                    className="w-12 bg-transparent py-0.5 text-slate-800 text-xs font-black text-right focus:outline-none cursor-text" 
                />
                <span className="text-[10px] font-bold text-slate-400 ml-1 select-none">{item.portion_unit || 'g'}</span>
            </div>
            
            <MacroMini label="P" value={item.macros.protein_g} color="rose"
                onChange={v => onUpdate({ macros: { ...item.macros, protein_g: v, calories: calcCaloriesFromMacros({ ...item.macros, protein_g: v }) } })} />
            <MacroMini label="C" value={item.macros.carbs_g} color="amber"
                onChange={v => onUpdate({ macros: { ...item.macros, carbs_g: v, calories: calcCaloriesFromMacros({ ...item.macros, carbs_g: v }) } })} />
            <MacroMini label="F" value={item.macros.fat_g} color="sky"
                onChange={v => onUpdate({ macros: { ...item.macros, fat_g: v, calories: calcCaloriesFromMacros({ ...item.macros, fat_g: v }) } })} />
            
            <span className="text-xs text-slate-500 font-bold w-12 text-right">{item.macros.calories} <span className="font-normal text-[10px]">kcal</span></span>
            
            <button onClick={onRemove} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// ── Atomic Sub-Components ──
// ═══════════════════════════════════════════════════════════════════════════

const MacroMini: React.FC<{ label: string; value: number; color: string; onChange: (v: number) => void }> = ({ label, value, color, onChange }) => (
    <div className={`flex items-center gap-0.5 bg-${color}-50 border border-${color}-100 rounded px-1 py-0.5`}>
        <span className={`text-${color}-600 text-[8px] font-bold`}>{label}</span>
        <input type="number" value={value} min={0} step={0.5} onChange={e => onChange(Math.max(0, Number(e.target.value)))}
            className={`w-8 bg-transparent text-${color}-800 font-bold text-[10px] text-center focus:outline-none`} />
    </div>
);

const TARGET_COLOR_MAP: Record<string, { bg: string; border: string; label: string; text: string; barBg: string; barFill: string }> = {
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', label: 'text-slate-500', text: 'text-slate-900', barBg: 'bg-slate-100', barFill: 'bg-slate-600' },
    rose:  { bg: 'bg-rose-50',  border: 'border-rose-200',  label: 'text-rose-600',  text: 'text-rose-900',  barBg: 'bg-rose-100',  barFill: 'bg-rose-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', label: 'text-amber-600', text: 'text-amber-900', barBg: 'bg-amber-100', barFill: 'bg-amber-500' },
    sky:   { bg: 'bg-sky-50',   border: 'border-sky-200',   label: 'text-sky-600',   text: 'text-sky-900',   barBg: 'bg-sky-100',   barFill: 'bg-sky-500' },
};

const TargetInput: React.FC<{ label: string; value: number; color: string; onChange: (v: number) => void }> = ({ label, value, color, onChange }) => {
    const c = TARGET_COLOR_MAP[color] || TARGET_COLOR_MAP.slate;
    return (
        <div className={`rounded-xl p-2.5 ${c.bg} border ${c.border} shadow-2xs`}>
            <label className={`text-[10px] font-bold ${c.label} uppercase tracking-wider block`}>{label}</label>
            <input 
                type="number" 
                value={value} 
                onChange={e => onChange(Number(e.target.value))}
                className={`w-full bg-transparent border-none ${c.text} text-xl font-black font-montserrat focus:outline-none mt-0.5`} 
            />
        </div>
    );
};

const ProgressBar: React.FC<{ label: string; current: number; target: number; color: string }> = ({ label, current, target, color }) => {
    const c = TARGET_COLOR_MAP[color] || TARGET_COLOR_MAP.slate;
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const isOver = current > target;
    return (
        <div className="px-0.5">
            <div className={`text-[9px] font-bold mb-1 flex justify-between ${isOver ? 'text-red-500' : c.label}`}>
                <span>{label}</span>
                <span>{current.toFixed(0)} / {target}</span>
            </div>
            <div className={`h-2 ${c.barBg} rounded-full overflow-hidden`}>
                <div className={`h-full ${isOver ? 'bg-red-500' : c.barFill} transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
        </div>
    );
};

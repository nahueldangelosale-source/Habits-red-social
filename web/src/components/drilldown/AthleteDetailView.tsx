import React, { useEffect, useState } from 'react';
import {
    ChevronLeft,
    Activity,
    Dna,
    Calendar,
    Plus,
    Dumbbell,
    User,
    ShieldAlert,
    Target,
    Info,
    FileText,
    ChevronDown,
    ChevronUp,
    Zap,
    Edit3,
    PlusCircle,
    Clock,
    Utensils,
    MessageCircle,
    Award,
    CheckCircle,
    CheckCircle2,
    Folder,
    X,
    Sparkles,
    TrendingUp,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { trainerApi, type AthleteDetail } from '../../api/trainer';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { hydrateRoutine } from '../../utils/RoutineHydrator';
import { RoutineSessionCard } from './RoutineSessionCard';

import { HabitPrescriberDrilldown } from '../coach/HabitPrescriberDrilldown';
import { AnimatePresence, motion } from 'framer-motion';
import { AthleteFormModal } from '../onboarding/AthleteFormModal';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { TemplateLibrary } from '../library/TemplateLibrary';
import { PanoramicBuilder } from '../onboarding/PanoramicBuilder';
import { BiometricLogModal } from './BiometricLogModal';
import { WorkoutTrackingView } from './WorkoutTrackingView';
import { NutritionTrackingView } from './NutritionTrackingView';
import { TrainingCalendar } from '../calendar/TrainingCalendar';
import { VerticalActivityFeed } from '../calendar/VerticalActivityFeed';
import { NutritionACWRCrossView } from './NutritionACWRCrossView';

const GOAL_TRANSLATIONS: Record<string, string> = {
    'SPORT_AGILITY': 'Deporte & Agilidad',
    'HIPERTROFIA': 'Hipertrofia',
    'STRENGTH': 'Fuerza Máxima',
    'HIGH_PERFORMANCE': 'Alto Rendimiento',
    'FAT_LOSS': 'Pérdida de Grasa',
    'BODY_RECOMP': 'Recomposición Corporal',
    'ENDURANCE': 'Resistencia',
    'REHAB_LONGEVITY': 'Rehabilitación & Longevidad',
    'VITALITY_MAINTENANCE': 'Mantenimiento & Vitalidad'
};

const TagBadge = ({ children, isWarning = false }: { children: React.ReactNode, isWarning?: boolean }) => (
    <span className={`px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-widest border shadow-sm ${isWarning
        ? 'bg-rose-950/40 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
        : 'bg-zinc-900 border-zinc-700 text-zinc-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
        }`}>
        {children}
    </span>
);

const InfoTooltip = ({ text, isClinical }: { text: string, isClinical: boolean }) => (
    <div className="relative group flex items-center ml-2">
        <Info size={14} className={`cursor-help opacity-40 hover:opacity-100 transition-opacity ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`} />
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-[11px] leading-relaxed font-normal normal-case tracking-normal rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ${isClinical ? 'bg-slate-800 text-white border border-slate-700' : 'bg-zinc-100 text-zinc-900 border border-white'}`}>
            {text}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isClinical ? 'border-t-slate-800' : 'border-t-zinc-100'}`}></div>
        </div>
    </div>
);

const Accordion = ({ title, defaultOpen = false, children, isClinical, icon: Icon }: { title: string, defaultOpen?: boolean, children: React.ReactNode, isClinical?: boolean, icon?: any }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <motion.div 
            whileHover={{ y: -1 }}
            className={`mb-3 rounded-2xl overflow-hidden transition-all duration-200 border ${
            isOpen 
                ? (isClinical ? 'bg-white border-indigo-200 shadow-sm' : 'bg-zinc-900 border-indigo-500/30 shadow-md') 
                : (isClinical ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70' : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-900')
        }`}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left focus:outline-none group cursor-pointer"
            >
                <div className="flex items-center gap-2.5">
                    {Icon && <Icon size={16} className={`transition-colors ${isOpen ? (isClinical ? 'text-indigo-600' : 'text-indigo-400') : (isClinical ? 'text-slate-400' : 'text-zinc-500')}`} />}
                    <span className={`text-xs font-bold font-montserrat tracking-tight transition-colors ${isOpen ? (isClinical ? 'text-slate-900' : 'text-white') : (isClinical ? 'text-slate-600' : 'text-zinc-300')}`}>
                        {title}
                    </span>
                </div>
                <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? (isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400') : (isClinical ? 'bg-slate-200/70 text-slate-500' : 'bg-zinc-800 text-zinc-400')}`}>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`p-4 pt-2 border-t border-dashed mx-4 ${isClinical ? 'border-slate-200' : 'border-zinc-800/50'}`}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface AthleteDetailViewProps {
    athleteId: string;
    onBack: () => void;
}

type TabType = 'resumen' | 'entrenamiento' | 'agenda' | 'nutricion' | 'habitos';

// Header ACWR Badge Component (Memoized)
const ACWRBadge = React.memo(({ acwrData, isClinical }: { acwrData: any, isClinical: boolean }) => {
    if (!acwrData || acwrData.risk_status === 'CALCULATING') return null;

    let colorClass = 'text-amber-500 border-amber-500/20 bg-amber-500/10';
    let pulseClass = '';

    if (acwrData.risk_status === 'DANGER_ZONE') {
        colorClass = 'text-rose-500 border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
        pulseClass = 'animate-pulse';
    } else if (acwrData.risk_status === 'SWEET_SPOT') {
        colorClass = 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
    }

    return (
        <div className={`flex flex-col items-end justify-center ${pulseClass}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">SNC ACWR</span>
            <div className={`px-3 py-1.5 rounded border ${colorClass} font-black text-sm tracking-wider flex items-center gap-2`}>
                <Activity size={14} />
                {acwrData.acwr?.toFixed(2) || '0.00'} - {acwrData.risk_status?.replace(/_/g, ' ') || 'SIN DATOS'}
            </div>
        </div>
    );
});

export const AthleteDetailView: React.FC<AthleteDetailViewProps> = ({ athleteId, onBack }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const [activeTab, setActiveTab] = useState<TabType>('resumen');
    const [athlete, setAthlete] = useState<AthleteDetail | null>(null);
    const [activeRoutine, setActiveRoutine] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('Mes');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [isLogMetricsOpen, setIsLogMetricsOpen] = useState(false);
    const [nutrients, setNutrients] = useState<any>(null);
    const [isRadarExpanded, setIsRadarExpanded] = useState(false);
    const navigate = useNavigate();
    
    // Hooks must be called before early returns
    const draftDaysCount = usePlanBuilderStore(state => state.days.filter(d => d.visibility === 'draft').length);

    const handleNavigateToBuilder = (initialTab: 'import' | 'routine' | 'nutrition' | 'habits' = 'routine') => {
        const store = useOnboardingPTStore.getState();
        store.setCreatedAthleteId(athleteId);
        
        // Hydrate store so Plan Builder knows exactly who we're building for
        if (athlete) {
            const nameParts = athlete.name ? athlete.name.split(' ') : [''];
            store.setIdentity({
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || ''
            });
            
            if (athlete.onboardingData?.biometrics) {
                store.setBiometrics(athlete.onboardingData.biometrics);
            }
            if (athlete.onboardingData?.training) {
                store.setTraining(athlete.onboardingData.training);
            }
            if (athlete.onboardingData?.healthData) {
                store.setHealthData(athlete.onboardingData.healthData);
            }
            if (athlete.onboardingData?.goal_tags?.length > 0) {
                // We'll just reset or leave existing goals if needed, but identity is the key part
            }
        }
        
        navigate('/plan-builder', { state: { initialTab } });
    };

    const handleCreateRoutine = () => handleNavigateToBuilder('routine');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [athleteData, routineData] = await Promise.all([
                    trainerApi.getAthleteDetail(athleteId),
                    api.get<any>(`/api/v1/routines/${athleteId}`).catch(() => null)
                ]);

                // Merge data from recent onboarding store (which powers the Edit Modal)
                const ptStore = useOnboardingPTStore.getState();
                let mergedAthleteData = { ...athleteData };
                
                if (athleteId === '06e00868-61a3-4834-aa56-4527a9c6ae51' || athleteId.startsWith('EPHEMERAL') || athleteId === ptStore.createdAthleteId) {
                    if (ptStore.identity?.first_name && athleteId !== 'ephemeral-demo') {
                        mergedAthleteData.name = `${ptStore.identity.first_name} ${ptStore.identity.last_name}`;
                    }

                    mergedAthleteData.bio = `Atleta enfocado en objetivos deportivos. Nivel de estrés: ${ptStore.healthData?.stressLevel || 3}/5.`;
                    
                    if (!mergedAthleteData.onboardingData) mergedAthleteData.onboardingData = {};
                    mergedAthleteData.onboardingData.goal_tags = ptStore.goalTags?.length > 0 ? ptStore.goalTags : mergedAthleteData.onboardingData.goal_tags;
                    mergedAthleteData.onboardingData.medical_tags = ptStore.injuries?.length > 0 ? ptStore.injuries.map((i: any) => i.joint || i.zone || 'Lesión') : mergedAthleteData.onboardingData.medical_tags;
                    mergedAthleteData.onboardingData.biometrics = ptStore.biometrics;
                    mergedAthleteData.onboardingData.training = ptStore.training;
                    mergedAthleteData.onboardingData.healthData = ptStore.healthData;
                    mergedAthleteData.onboardingData.habit_stress_level = ptStore.healthData?.stressLevel;
                    mergedAthleteData.onboardingData.habit_sleep_quality = ptStore.healthData?.sleepQuality;
                    mergedAthleteData.onboardingData.habit_work_type = ptStore.healthData?.occupation;
                }

                setAthlete(mergedAthleteData);
                setActiveRoutine(routineData);

                // Fetch nutrients from localStorage or default (B2B2C syncing)
                let targetProt = 140;
                let targetCarbs = 160;
                let targetFats = 60;
                let isLowFodmap = false;

                const localEditsRaw = localStorage.getItem(`patient_edits_${athleteId}`);
                if (localEditsRaw) {
                    const parsed = JSON.parse(localEditsRaw);
                    targetProt = parsed.protein || targetProt;
                    targetCarbs = parsed.carbs || targetCarbs;
                    targetFats = parsed.fats || targetFats;
                    isLowFodmap = parsed.clinicalFlags?.low_fodmap || false;
                } else if (athleteId === 'ephemeral-demo' || athleteId.startsWith('EPHEMERAL')) {
                    const epRaw = localStorage.getItem('ephemeral_patient_demo');
                    if (epRaw) {
                        const ep = JSON.parse(epRaw);
                        targetProt = Math.round((ep.weight || 82.5) * 2);
                        targetCarbs = Math.round((ep.daily_energy_requirement || 1800) * 0.4 / 4);
                        targetFats = Math.round((ep.daily_energy_requirement || 1800) * 0.25 / 9);
                        isLowFodmap = ep.clinical_flags?.low_fodmap_active || false;
                    }
                }

                setNutrients({
                    protein: targetProt,
                    carbs: targetCarbs,
                    fats: targetFats,
                    lowFodmap: isLowFodmap
                });
            } catch (error) {
                console.error("Failed to load athlete detail", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [athleteId]);


    let displayRoutine = activeRoutine?.data || activeRoutine || (athlete as any)?.mutated_routine || (athlete as any)?.active_routine || (athlete as any)?.routine || null;
    if (Array.isArray(displayRoutine)) {
        displayRoutine = displayRoutine.find((r: any) => r.is_active) || displayRoutine[displayRoutine.length - 1];
    }
    
    const hydratedDays = React.useMemo(() => {
        // HACK PARA DEMO LOCAL FRONTEND-ONLY
        const localStore = usePlanBuilderStore.getState();
        if ((athleteId === '06e00868-61a3-4834-aa56-4527a9c6ae51' || athleteId === 'ephemeral-demo' || athleteId.startsWith('EPHEMERAL')) && localStore.days && localStore.days.length > 0 && localStore.days.some(d => d.items.length > 0)) {
            const mockSerializedDays = localStore.days.map(d => ({
                id: d.id,
                name: d.name,
                items: d.items.map(i => {
                    if (i.type === 'BLOCK') {
                        return { 
                            type: 'BLOCK', 
                            block_id: i.id, 
                            name: i.name, 
                            items: i.items.map(ex => ({ type: 'EXERCISE', exercise_id: ex.exercise.ID_Ejercicio, sets: ex.sets, reps: ex.reps, weight: ex.weight, rpe: ex.rpe })) 
                        };
                    }
                    return { type: 'EXERCISE', exercise_id: (i as any).exercise.ID_Ejercicio, sets: (i as any).sets, reps: (i as any).reps, weight: (i as any).weight, rpe: (i as any).rpe };
                })
            }));
            return hydrateRoutine(mockSerializedDays as any);
        }

        const serializedDays = displayRoutine?.days || displayRoutine?.serializedDays || [];
        return displayRoutine ? hydrateRoutine(serializedDays) : [];
    }, [displayRoutine, athleteId]);

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${isClinical ? "bg-white" : "bg-zinc-950"}`}>
            <div className={`w-8 h-8 border-2 rounded-full animate-spin ${isClinical ? "border-slate-300 border-t-slate-800" : "border-lime-500/30 border-t-lime-400"}`} />
        </div>
    );

    if (!athlete) return <div className="p-10 text-center text-rose-500 font-bold">ATHLETE_NOT_FOUND</div>;
    
    
    // Check if real PR stats exist (ignoring mock/default values)
    const hasRealStats = athlete.performanceStats && 
                         Object.keys(athlete.performanceStats).length > 0 && 
                         Object.values(athlete.performanceStats).some(val => val > 0) &&
                         Object.keys(athlete.performanceStats)[0] !== 'Squat_1rm';

    // Dynamic Nutrition Balance Radar Chart Calculation
    const getNutritionBalance = () => {
        const base = { protein: 85, carbs: 80, fats: 85, hydration: 90, adherence: 85, micros: 80 };
        const tags = athlete.onboardingData?.goal_tags || [];
        if (tags.length > 0) {
            tags.forEach((tag: string) => {
                const normalized = tag.toUpperCase().replace(/ /g, '_');
                switch (normalized) {
                    case 'HIPERTROFIA':
                        base.protein += 25; base.carbs += 20; base.adherence += 10;
                        break;
                    case 'STRENGTH':
                    case 'HIGH_PERFORMANCE':
                        base.protein += 20; base.carbs += 30; base.hydration += 20;
                        break;
                    case 'FAT_LOSS':
                    case 'BODY_RECOMP':
                        base.protein += 30; base.carbs -= 10; base.adherence += 25; base.micros += 15;
                        break;
                    case 'ENDURANCE':
                        base.carbs += 35; base.hydration += 25; base.fats += 10;
                        break;
                    case 'REHAB_LONGEVITY':
                    case 'VITALITY_MAINTENANCE':
                        base.micros += 30; base.fats += 20; base.hydration += 20;
                        break;
                    case 'SPORT_AGILITY':
                        base.carbs += 25; base.hydration += 20; base.protein += 15;
                        break;
                    default:
                        break;
                }
            });
        }
        return [
            { subject: 'Proteínas', A: Math.max(30, Math.min(140, base.protein)), fullMark: 150 },
            { subject: 'Carbos', A: Math.max(30, Math.min(140, base.carbs)), fullMark: 150 },
            { subject: 'Grasas', A: Math.max(30, Math.min(140, base.fats)), fullMark: 150 },
            { subject: 'Hidratación', A: Math.max(30, Math.min(140, base.hydration)), fullMark: 150 },
            { subject: 'Adherencia', A: Math.max(30, Math.min(140, base.adherence)), fullMark: 150 },
            { subject: 'Micros', A: Math.max(30, Math.min(140, base.micros)), fullMark: 150 }
        ];
    };

    const nutritionBalanceData = getNutritionBalance();

    const renderHeader = () => {
        const initial = athlete.name ? athlete.name.charAt(0).toUpperCase() : 'A';
        const goals = athlete.onboardingData?.goal_tags || [];
        const injuries = athlete.onboardingData?.medical_tags || [];
        const hasInjuries = injuries.length > 0;
        const isPaid = useOnboardingPTStore.getState().identity?.payment_status !== 'PAST_DUE';
        const age = athlete.onboardingData?.biometrics?.age || '--';
        const weight = athlete.onboardingData?.biometrics?.weight || athlete.performanceStats?.weight || '--';
        const height = athlete.onboardingData?.biometrics?.height || '--';
        const hasActiveRoutine = hydratedDays.length > 0;
        
        return (
            <div className={`mb-6 p-5 md:p-6 rounded-3xl border transition-all shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl ${
                isClinical 
                    ? 'bg-white/95 border-slate-200/90' 
                    : 'bg-zinc-900/95 border-zinc-800'
            }`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    
                    {/* IZQUIERDA: Back + Avatar + Identidad + Semáforo Biomecánico */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <button 
                            onClick={onBack} 
                            className={`p-2.5 rounded-2xl transition-all self-start sm:self-center shrink-0 cursor-pointer ${
                                isClinical 
                                    ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' 
                                    : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                            }`}
                            title="Volver al Roster"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        {/* Avatar con Dot de Presencia / Actividad */}
                        <div className="relative shrink-0">
                            {athlete.photoUrl ? (
                                <img 
                                    src={athlete.photoUrl} 
                                    alt={athlete.name} 
                                    className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-zinc-800 shadow-sm" 
                                />
                            ) : (
                                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-base font-black font-montserrat shadow-sm ${
                                    isClinical 
                                        ? 'bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white' 
                                        : 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white'
                                }`}>
                                    {initial}
                                </div>
                            )}
                            <span 
                                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                                    hasInjuries ? 'bg-amber-500' : 'bg-emerald-500'
                                } ${isClinical ? 'border-white' : 'border-zinc-900'}`} 
                                title={hasInjuries ? 'Molestia activa reportada' : 'Atleta activo y saludable'}
                            />
                        </div>

                        {/* Datos de Identidad y Semáforo Biomecánico */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                <h1 className={`text-xl md:text-2xl font-black font-montserrat tracking-tight truncate ${
                                    isClinical ? 'text-slate-900' : 'text-white'
                                }`}>
                                    {athlete.name}
                                </h1>
                                {goals.slice(0, 1).map((tag: string) => (
                                    <span 
                                        key={tag} 
                                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                            isClinical 
                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80' 
                                                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                        }`}
                                    >
                                        {GOAL_TRANSLATIONS[tag] || tag}
                                    </span>
                                ))}
                            </div>

                            {/* Línea de Biometría Vital + SEMÁFORO BIOMECÁNICO (Hero Focus de 3 segundos) */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                                <div className={`font-semibold flex items-center gap-2 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                    <span>{age} años</span>
                                    <span className="opacity-30">•</span>
                                    <span>{weight} kg</span>
                                    <span className="opacity-30">•</span>
                                    <span>{height} cm</span>
                                </div>

                                <span className="opacity-30 hidden sm:inline">•</span>

                                {/* SEMÁFORO BIOMECÁNICO (Claridad LIFT Instantánea) */}
                                {hasInjuries ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                                        <ShieldAlert size={12} className="animate-pulse text-amber-600 dark:text-amber-400" />
                                        <span>⚠️ {injuries.length} {injuries.length === 1 ? 'Molestia' : 'Molestias'}: {injuries[0]}</span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                                        <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                                        <span>🟢 Apto para Entrenar</span>
                                    </div>
                                )}

                                {/* ESTADO DE CONTINUIDAD (Hero Focus 3s) */}
                                {hasActiveRoutine ? (
                                    <span className={`text-[11px] font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                        isClinical ? 'text-indigo-700 bg-indigo-50/70' : 'text-indigo-400 bg-indigo-500/10'
                                    }`}>
                                        ⚡ Rutina Activa
                                    </span>
                                ) : (
                                    <span className={`text-[11px] font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                        isClinical ? 'text-amber-700 bg-amber-50' : 'text-amber-400 bg-amber-500/10'
                                    }`}>
                                        ⏳ Sin Rutina Asignada
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DERECHA: Píldoras Quiet Luxury (Plan Activo y Estado Financiero) */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-stretch sm:self-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-zinc-800">
                        
                        {/* 1. Plan Activo Pill */}
                        <div className={`flex items-center gap-3 p-2.5 pr-4 rounded-2xl border transition-all ${
                            isClinical 
                                ? 'bg-indigo-50/60 border-indigo-200/70 text-indigo-900 shadow-2xs' 
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
                        }`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isClinical ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-500/20 text-indigo-400'
                            }`}>
                                <Award size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-black font-montserrat uppercase tracking-wider ${
                                    isClinical ? 'text-indigo-600/80' : 'text-indigo-400/80'
                                }`}>
                                    Plan Activo
                                </span>
                                <span className={`text-xs font-black font-montserrat tracking-tight ${
                                    isClinical ? 'text-slate-900' : 'text-white'
                                }`}>
                                    PRO TIER
                                </span>
                            </div>
                        </div>

                        {/* 2. Estado Financiero Pill */}
                        <div className={`flex items-center gap-3 p-2.5 pr-3 rounded-2xl border transition-all ${
                            !isPaid 
                                ? (isClinical ? 'bg-rose-50/80 border-rose-200 text-rose-900' : 'bg-rose-950/30 border-rose-900/50 text-rose-300') 
                                : (isClinical ? 'bg-emerald-50/60 border-emerald-200/70 text-emerald-900 shadow-2xs' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300')
                        }`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                !isPaid
                                    ? (isClinical ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-400')
                                    : (isClinical ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-500/20 text-emerald-400')
                            }`}>
                                <CreditCard size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-black font-montserrat uppercase tracking-wider ${
                                    !isPaid ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-400'
                                }`}>
                                    Estado Financiero
                                </span>
                                <span className={`text-xs font-bold ${
                                    !isPaid ? 'text-rose-700' : 'text-emerald-800 dark:text-emerald-300'
                                }`}>
                                    {!isPaid ? 'En Mora • Pago Vencido' : 'Al Día • Vence en 14d'}
                                </span>
                            </div>
                            <button 
                                onClick={() => toast.success("Modo Edición: Actualización de Plan y Pagos en desarrollo...")} 
                                className={`p-1.5 rounded-lg transition-colors ml-1 cursor-pointer ${
                                    isClinical ? 'hover:bg-black/5 text-slate-400 hover:text-slate-700' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
                                }`} 
                                title="Editar Suscripción"
                            >
                                <Edit3 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`w-full min-h-full p-4 md:p-8 font-sans ${isClinical ? 'bg-slate-50 text-slate-800' : 'bg-black text-white'}`}>
            
            {renderHeader()}

            {/* Alerta Pasiva: Días en Borrador */}
            {draftDaysCount > 0 && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${isClinical ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    <Info size={18} className="shrink-0" />
                    <p className="text-sm font-bold">Tienes {draftDaysCount} día{draftDaysCount !== 1 ? 's' : ''} en borrador que el atleta no puede ver. Haz clic en Editar Plan para gestionarlos.</p>
                </div>
            )}

            {/* TABS DE NAVEGACIÓN CON ANIMACIÓN LÍQUIDA (layoutId) */}
            <div className={`mb-6 p-1.5 flex space-x-1 overflow-x-auto hide-scrollbar rounded-2xl w-fit relative ${
                isClinical ? 'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs' : 'bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-lg'
            }`}>
                <nav className="flex space-x-1" aria-label="Tabs del Atleta">
                    {(['resumen', 'entrenamiento', 'nutricion', 'habitos', 'agenda'] as TabType[]).map((tab) => {
                        const isActive = activeTab === tab;
                        const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-5 py-2 rounded-xl text-xs font-bold font-montserrat uppercase tracking-wider transition-colors duration-200 whitespace-nowrap z-10 cursor-pointer ${
                                    isActive 
                                        ? (isClinical ? 'text-indigo-900 font-black' : 'text-white font-black') 
                                        : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-400 hover:text-zinc-200')
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeAthleteTab"
                                        className={`absolute inset-0 rounded-xl -z-10 ${
                                            isClinical ? 'bg-white border border-slate-200/90 shadow-sm' : 'bg-zinc-800 border border-zinc-700'
                                        }`}
                                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                    />
                                )}
                                {label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Tabs Con Contenedor Animado Fluido (Container Transform) */}
            <div className="w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="w-full"
                    >
                {activeTab === 'resumen' && (
                    <div className="space-y-6">
                        {/* Quick Actions Bar (Jerarquía Modelo LIFT) */}
                        <div className={`p-3.5 md:p-4 rounded-3xl border flex flex-wrap gap-2.5 items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-xl ${
                            isClinical ? 'bg-white/95 border-slate-200/90' : 'bg-zinc-900/95 border-zinc-800'
                        }`}>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-black font-montserrat uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-1`}>
                                    Workflows
                                </span>

                                {/* ACCIÓN PRIMARIA LIFT: Crear / Modificar Rutina con relleno sólido */}
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleNavigateToBuilder('routine')} 
                                    className="px-4 py-2 text-xs font-black font-montserrat rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
                                >
                                    <Dumbbell size={14} />
                                    <span>{hydratedDays.length > 0 ? 'Modificar Rutina' : '+ Crear Rutina'}</span>
                                </motion.button>

                                {/* ACCIONES SECUNDARIAS (Botones Ghost / Micro-Pills) */}
                                <button 
                                    onClick={() => setShowLibraryModal(true)} 
                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isClinical 
                                            ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700' 
                                            : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                                    }`}
                                >
                                    <Folder size={14} className="text-slate-400" />
                                    <span>Desde Plantilla</span>
                                </button>

                                <button 
                                    onClick={() => handleNavigateToBuilder('nutrition')} 
                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isClinical 
                                            ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700' 
                                            : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                                    }`}
                                >
                                    <Utensils size={14} className="text-slate-400" />
                                    <span>Plan Alimentario</span>
                                </button>

                                <button 
                                    onClick={() => handleNavigateToBuilder('habits')} 
                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isClinical 
                                            ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700' 
                                            : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                                    }`}
                                >
                                    <CheckCircle size={14} className="text-slate-400" />
                                    <span>Asignar Hábito</span>
                                </button>
                            </div>

                            {/* ACCIONES DE REGISTRO & MENSAJERÍA (Aisladas con Divisor) */}
                            <div className="flex items-center gap-2 ml-auto">
                                <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800 mx-1 hidden md:block" />

                                <button 
                                    onClick={() => setIsLogMetricsOpen(true)} 
                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isClinical 
                                            ? 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-800' 
                                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                    }`}
                                >
                                    <Activity size={14} />
                                    <span>Registrar Medidas</span>
                                </button>

                                <button 
                                    onClick={() => navigate(`/inbox?athlete=${athleteId}`)} 
                                    className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isClinical 
                                            ? 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200 text-indigo-800' 
                                            : 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                                    }`}
                                >
                                    <MessageCircle size={14} />
                                    <span>Chat Interno</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* COLUMNA 1: Clinical & Lifestyle Profile */}
                            <div className="order-2 lg:order-1 space-y-6">
                                <div className={`p-6 rounded-3xl border h-full shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl ${isClinical ? 'bg-white/95 border-slate-200/90' : 'bg-zinc-950/95 border-zinc-800'}`}>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center">
                                            <div className="flex flex-col">
                                                <h3 className={`text-xs font-black font-montserrat tracking-widest uppercase flex items-center gap-2 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                                    <User size={15} className={isClinical ? "text-indigo-600" : "text-indigo-400"} /> FICHA BASELINE
                                                </h3>
                                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">
                                                    {athlete?.updatedAt ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(athlete.updatedAt)) : 'CREADO RECIENTEMENTE'}
                                                </span>
                                            </div>
                                            <InfoTooltip isClinical={isClinical} text="Información inicial recopilada por nuestro asistente virtual, estructurada para que conozcas a tu cliente en menos de 1 minuto." />
                                        </div>
                                        <button onClick={() => setShowFormModal(true)} className={`p-2 rounded-xl border transition-colors ${isClinical ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-500 hover:text-indigo-600' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white'}`} title="Editar Perfil">
                                            <Edit3 size={13} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {(athlete?.onboardingData?.goal_tags || []).map((tag: string) => (
                                            <div key={tag} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${isClinical ? 'bg-indigo-50/70 border-indigo-100 text-indigo-800' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'} text-[10px] font-black uppercase tracking-wider`} title="Objetivo principal del atleta">
                                                <Target size={11} className={isClinical ? 'text-indigo-600' : 'text-indigo-400'} />
                                                <span>{GOAL_TRANSLATIONS[tag] || tag}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="font-sans space-y-3">
                                        <Accordion title="Contexto y Dolencias" defaultOpen={true} isClinical={isClinical} icon={Activity}>
                                            <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-medium flex items-start gap-2">
                                                <Sparkles size={13} className="shrink-0 mt-0.5" />
                                                <span><strong>Insight Clínico:</strong> Identificar fuentes de estrés o dolencias previas previene abandonos en las primeras 4 semanas.</span>
                                            </div>
                                            <p className={`text-xs leading-relaxed italic mb-3.5 p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70 text-slate-700' : 'bg-zinc-900/60 border-zinc-800/70 text-zinc-300'}`}>
                                                "{athlete.bio || 'Sin descripción adicional registrada por el usuario.'}"
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(athlete.onboardingData?.medical_tags || []).length > 0 ? (
                                                    athlete.onboardingData?.medical_tags?.map((tag: string) => (
                                                        <TagBadge key={tag} isWarning>{tag.replace(/_/g, ' ')}</TagBadge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                        <CheckCircle2 size={13} /> Sin lesiones ni dolor reportado
                                                    </span>
                                                )}
                                            </div>
                                        </Accordion>

                                        <Accordion title="Composición Corporal Inicial" isClinical={isClinical} icon={FileText}>
                                            <div className="mb-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 dark:text-indigo-300 text-[11px] font-medium flex items-start gap-2">
                                                <Sparkles size={13} className="shrink-0 mt-0.5" />
                                                <span><strong>Punto de Partida:</strong> Referencia baseline para contrastar las reevaluaciones periódicas.</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Peso</span>
                                                    <span className="font-montserrat font-black text-sm">{athlete.performanceStats?.weight || athlete.onboardingData?.biometrics?.weight || '--'} <span className="text-[11px] font-medium opacity-60">kg</span></span>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Altura</span>
                                                    <span className="font-montserrat font-black text-sm">{athlete.onboardingData?.biometrics?.height || '--'} <span className="text-[11px] font-medium opacity-60">cm</span></span>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Edad</span>
                                                    <span className="font-montserrat font-black text-sm">{athlete.onboardingData?.biometrics?.age || '--'} <span className="text-[11px] font-medium opacity-60">años</span></span>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Género</span>
                                                    <span className="font-montserrat font-black text-sm capitalize">{athlete.onboardingData?.biometrics?.gender || '--'}</span>
                                                </div>
                                            </div>
                                        </Accordion>

                                        <Accordion title="Historial Deportivo" isClinical={isClinical} icon={Dumbbell}>
                                            <div className="mb-3 p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-700 dark:text-zinc-300 text-[11px] font-medium flex items-start gap-2">
                                                <Sparkles size={13} className="shrink-0 mt-0.5" />
                                                <span><strong>Dosificación:</strong> Determina la tasa de sobrecarga progresiva y tolerancia al volumen semanal.</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5 mb-3">
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Nivel</span>
                                                    <span className="font-black text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                                        {athlete.onboardingData?.training?.experience_level === 'BEGINNER' ? 'Principiante' : athlete.onboardingData?.training?.experience_level === 'INTERMEDIATE' ? 'Intermedio' : athlete.onboardingData?.training?.experience_level === 'ADVANCED' ? 'Avanzado' : 'Desconocido'}
                                                    </span>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Frecuencia</span>
                                                    <span className="font-black text-xs uppercase tracking-wider">
                                                        {athlete.onboardingData?.training?.days_per_week ? `${athlete.onboardingData.training.days_per_week} DÍAS/SEM` : '--'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-1.5">Equipamiento Disponible</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {athlete.onboardingData?.training?.equipment && athlete.onboardingData.training.equipment.length > 0 ? (
                                                        athlete.onboardingData.training.equipment.map((eq: string) => {
                                                            const eqName = eq === 'COMMERCIAL_GYM' ? 'Gimnasio Comercial' : eq === 'HOME_GYM' ? 'Gimnasio en Casa' : eq === 'NO_EQUIPMENT' ? 'Sin Equipamiento' : eq;
                                                            return <span key={eq} className={`text-[10px] uppercase px-2.5 py-1 rounded-lg border font-bold ${isClinical ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>{eqName}</span>;
                                                        })
                                                    ) : <span className="text-xs opacity-50">--</span>}
                                                </div>
                                            </div>
                                        </Accordion>

                                        <Accordion title="Estilo de Vida y Nutrición" isClinical={isClinical} icon={Utensils}>
                                            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium flex items-start gap-2">
                                                <Sparkles size={13} className="shrink-0 mt-0.5" />
                                                <span><strong>Sustrato Recuperativo:</strong> Calidad de sueño y estrés modulan hasta un 60% la síntesis de colágeno y glucógeno.</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Dieta</span>
                                                    <span className="font-bold text-xs capitalize">{athlete.onboardingData?.healthData?.currentDiet || '--'}</span>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Trabajo</span>
                                                    <span className="font-bold text-xs capitalize">{athlete.onboardingData?.habit_work_type || '--'}</span>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Estrés</span>
                                                    <span className="font-bold text-xs">{athlete.onboardingData?.habit_stress_level ? `${athlete.onboardingData.habit_stress_level} / 5` : '--'}</span>
                                                </div>
                                                <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/60 border-zinc-800/70'}`}>
                                                    <span className="text-[10px] uppercase font-black tracking-wider opacity-50 block mb-0.5">Sueño</span>
                                                    <span className="font-bold text-xs">{athlete.onboardingData?.habit_sleep_quality ? `${athlete.onboardingData.habit_sleep_quality} / 5 ★` : '--'}</span>
                                                </div>
                                            </div>
                                        </Accordion>
                                    </div>
                                </div>
                            </div>
                            
                            {/* COLUMNA 2: Performance Projection & Nutritional Radar */}
                            <div className="order-1 lg:order-2 space-y-6">
                                <div className={`p-6 rounded-3xl border h-full flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl ${isClinical ? 'bg-white/95 border-slate-200/90' : 'bg-zinc-950/95 border-zinc-800'}`}>
                                    <div className="flex justify-between items-center mb-5">
                                        <div className="flex items-center">
                                            <h3 className={`text-xs font-black font-montserrat tracking-widest uppercase flex items-center gap-2 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                                <Activity size={15} className={isClinical ? "text-emerald-600" : "text-emerald-400"} /> Balance Nutricional & SNC
                                            </h3>
                                            <InfoTooltip isClinical={isClinical} text="Distribución de macronutrientes y su correlación con la fatiga del Sistema Nervioso Central (SNC)." />
                                        </div>
                                        <button
                                            onClick={() => setIsRadarExpanded(!isRadarExpanded)}
                                            className={`text-[10px] font-black font-montserrat px-3 py-1 rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
                                                isRadarExpanded 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : isClinical 
                                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                                                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                                            }`}
                                        >
                                            <Sparkles size={12} />
                                            <span>{isRadarExpanded ? 'Ocultar SNC' : 'Fatiga SNC'}</span>
                                        </button>
                                    </div>

                                    {/* Radar Chart con degradado radial */}
                                    <div className="h-[210px] w-full mb-3 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={nutritionBalanceData}>
                                                <defs>
                                                    <radialGradient id="radarRadialGrad" cx="50%" cy="50%" r="50%">
                                                        <stop offset="0%" stopColor={isClinical ? "#10b981" : "#6366f1"} stopOpacity="0.45" />
                                                        <stop offset="100%" stopColor={isClinical ? "#059669" : "#4f46e5"} stopOpacity="0.08" />
                                                    </radialGradient>
                                                </defs>
                                                <PolarGrid stroke={isClinical ? "#e2e8f0" : "rgba(255,255,255,0.1)"} />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: isClinical ? '#475569' : '#a1a1aa', fontSize: 10, fontWeight: 700 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                                <Radar
                                                    name="Objetivo"
                                                    dataKey="A"
                                                    stroke={isClinical ? "#059669" : "#6366f1"}
                                                    strokeWidth={2.5}
                                                    fill="url(#radarRadialGrad)"
                                                    fillOpacity={1}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Micro-píldoras de síntesis nutricional */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className={`p-2.5 rounded-xl border text-center ${isClinical ? 'bg-emerald-50/50 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                                            <span className="text-[9px] uppercase font-black tracking-wider opacity-60 block">Proteínas</span>
                                            <span className="text-xs font-montserrat font-black text-emerald-600 dark:text-emerald-400">93%</span>
                                        </div>
                                        <div className={`p-2.5 rounded-xl border text-center ${isClinical ? 'bg-sky-50/50 border-sky-100' : 'bg-sky-500/5 border-sky-500/10'}`}>
                                            <span className="text-[9px] uppercase font-black tracking-wider opacity-60 block">Agua</span>
                                            <span className="text-xs font-montserrat font-black text-sky-600 dark:text-sky-400">2.8L</span>
                                        </div>
                                        <div className={`p-2.5 rounded-xl border text-center ${isClinical ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
                                            <span className="text-[9px] uppercase font-black tracking-wider opacity-60 block">Adherencia</span>
                                            <span className="text-xs font-montserrat font-black text-indigo-600 dark:text-indigo-400">88%</span>
                                        </div>
                                    </div>

                                    {/* Desplegable Container Transform: Correlación Fatiga SNC vs Nutrición */}
                                    <AnimatePresence>
                                        {isRadarExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="overflow-hidden mb-4"
                                            >
                                                <div className={`p-3.5 rounded-2xl border ${
                                                    isClinical 
                                                        ? 'bg-amber-50/60 border-amber-200/80 text-amber-900' 
                                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                                                }`}>
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <AlertCircle size={14} className="text-amber-500 shrink-0" />
                                                        <span className="text-[11px] font-black font-montserrat uppercase tracking-wider">
                                                            Correlación Neuro-Endócrina
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] leading-relaxed mb-2 opacity-90">
                                                        Cuando el <strong>ACWR supera 1.30</strong> (fatiga SNC acumulada), la ingesta de micronutrientes y recuperación proteica desciende un <strong>18%</strong> por saturación neurocognitiva.
                                                    </p>
                                                    <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-amber-500/20">
                                                        <span>ACWR: <strong>1.30 (Sweet Spot)</strong></span>
                                                        <span>Adherencia Dieta: <strong>88% (Estable)</strong></span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <hr className={`my-3 border-t ${isClinical ? 'border-slate-100' : 'border-zinc-800/60'}`} />

                                    {hasRealStats ? (
                                        <>
                                            {/* Volume Chart */}
                                            <div className="h-[180px] w-full mb-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={athlete.lastSessions}>
                                                        <defs>
                                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={isClinical ? "#4f46e5" : "#6366f1"} stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor={isClinical ? "#4f46e5" : "#6366f1"} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isClinical ? "#f1f5f9" : "rgba(255,255,255,0.05)"} />
                                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                                        <Tooltip contentStyle={{ backgroundColor: isClinical ? '#fff' : '#18181b', borderColor: isClinical ? '#e2e8f0' : '#27272a', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                                                        <Area type="monotone" dataKey="volume" stroke={isClinical ? "#4f46e5" : "#6366f1"} strokeWidth={2.5} fill="url(#colorVolume)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* PR Stats Row */}
                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                {Object.entries(athlete.performanceStats).filter(([k]) => k !== 'Total Volume').slice(0,4).map(([key, value]) => (
                                                    <div key={key} className={`p-3.5 rounded-2xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                                        <div className="text-[9px] uppercase font-black tracking-widest opacity-50 mb-0.5">{key.replace('_1rm', '')}</div>
                                                        <div className="text-xl font-black font-montserrat">{value} <span className="text-xs font-normal opacity-50">kg</span></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/20 my-auto">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                <Dumbbell size={22} />
                                            </div>
                                            <h4 className="text-xs font-black font-montserrat uppercase tracking-wider mb-1.5">Sin Historial de Marcas</h4>
                                            <p className="text-[11px] opacity-60 mb-4 max-w-[220px] leading-relaxed">
                                                Registra un test inicial para proyectar tonelaje y sobrecarga adaptativa.
                                            </p>
                                            <button 
                                                onClick={() => setIsLogMetricsOpen(true)}
                                                className={`px-3.5 py-2 rounded-xl font-montserrat font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                                                    isClinical 
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                                                        : 'bg-white text-black hover:bg-zinc-200'
                                                }`}
                                            >
                                                <Plus size={12} />
                                                <span>Registrar 1RM Base</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* COLUMNA 3: Actividad Reciente & Operaciones */}
                            <div className="order-3 lg:order-3 space-y-6">
                                <div className={`p-6 rounded-3xl border h-full flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl ${isClinical ? 'bg-white/95 border-slate-200/90' : 'bg-zinc-950/95 border-zinc-800'}`}>
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className={`text-xs font-black font-montserrat tracking-widest uppercase flex items-center gap-2 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                            <Clock size={15} className={isClinical ? "text-indigo-600" : "text-indigo-400"} /> Línea de Tiempo & Evolución
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <button className={`p-2 rounded-xl border transition-colors ${isClinical ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-emerald-600' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-emerald-400'}`} title="Felicitar">
                                                <Award size={13} />
                                            </button>
                                            <button onClick={() => navigate(`/inbox?athlete=${athleteId}`)} className={`p-2 rounded-xl border transition-colors ${isClinical ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-indigo-600' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-indigo-400'}`} title="Enviar Mensaje">
                                                <MessageCircle size={13} />
                                            </button>
                                            <button onClick={() => setShowFormModal(true)} className={`p-2 rounded-xl border transition-colors ${isClinical ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-500' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400'}`} title="Añadir Observación">
                                                <Edit3 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Evolución Visual (Progreso fotográfico con hover elástico) */}
                                    <div className="mb-5">
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="text-[10px] font-black font-montserrat uppercase tracking-wider opacity-60">Fotos de Progreso</span>
                                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md ${isClinical ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'}`}>Mes Actual</span>
                                        </div>
                                        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                                            {/* Botón Añadir Foto */}
                                            <motion.div 
                                                whileHover={{ y: -2, scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                                className={`min-w-[84px] h-[105px] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-all ${
                                                    isClinical 
                                                        ? 'border-slate-200 hover:border-indigo-300 bg-slate-50/80 hover:bg-slate-50 text-slate-400 hover:text-indigo-600' 
                                                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-500 hover:text-zinc-300'
                                                }`}
                                            >
                                                <Plus size={16} className="mb-1" />
                                                <span className="text-[9px] font-black font-montserrat uppercase">Añadir</span>
                                            </motion.div>

                                            <motion.div 
                                                whileHover={{ y: -2, scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                                className={`min-w-[84px] h-[105px] rounded-2xl bg-zinc-800 bg-cover bg-center border relative overflow-hidden shadow-sm ${isClinical ? 'border-slate-200/80' : 'border-zinc-700'}`} 
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=200&auto=format&fit=crop')" }}
                                            >
                                                <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent text-[8px] font-mono text-white text-center font-bold">14 Feb</div>
                                            </motion.div>

                                            <motion.div 
                                                whileHover={{ y: -2, scale: 1.03 }}
                                                transition={{ type: "spring", stiffness: 400 }}
                                                className={`min-w-[84px] h-[105px] rounded-2xl bg-zinc-800 bg-cover bg-center border opacity-60 hover:opacity-100 transition-opacity relative overflow-hidden shadow-sm ${isClinical ? 'border-slate-200/80' : 'border-zinc-700'}`} 
                                                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200&auto=format&fit=crop')" }}
                                            >
                                                <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/80 to-transparent text-[8px] font-mono text-white text-center font-bold">01 Feb</div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-2.5">
                                        <span className="text-[10px] font-black font-montserrat uppercase tracking-wider opacity-60">Historial Reciente (Gestalt)</span>
                                    </div>

                                    {/* Gestalt Negative Space: Tarjetas flotantes limpias */}
                                    <div className="h-[185px] overflow-y-auto pr-1 custom-scrollbar mb-4 flex flex-col gap-2.5">
                                        {athlete?.lastSessions && athlete.lastSessions.length > 0 ? (
                                            athlete.lastSessions.map((session: any, idx: number) => (
                                                <div 
                                                    key={idx} 
                                                    className={`p-3.5 rounded-2xl border transition-all ${
                                                        isClinical 
                                                            ? 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/60 hover:border-slate-200 shadow-sm' 
                                                            : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/40 hover:border-zinc-700/60'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span className="text-xs font-montserrat font-bold">{new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                                        <span className="text-[9px] font-black font-montserrat uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                            RPE {session.intensity}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] opacity-60 font-medium">
                                                        <span>Carga Total:</span>
                                                        <strong className="font-mono font-bold text-slate-800 dark:text-zinc-200">{session.volume} kg</strong>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/20">
                                                <Clock size={18} className="mb-1.5 opacity-40" />
                                                <p className="text-[10px] uppercase tracking-wider font-bold opacity-60">Sin registros recientes</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <hr className={`my-3 border-t ${isClinical ? 'border-slate-100' : 'border-zinc-800/60'}`} />

                                    {/* Operaciones */}
                                    <Accordion title="Métricas Operativas" defaultOpen={false} isClinical={isClinical}>
                                        <div className="space-y-2.5 font-sans mt-2">
                                            <div className={`flex justify-between items-center p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                                <div className="text-[10px] font-black uppercase tracking-wider opacity-60">Estado de Cobro</div>
                                                <div className={`text-xs font-black font-montserrat uppercase tracking-wider ${isClinical ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200' : 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md'}`}>
                                                    AL DÍA
                                                </div>
                                            </div>
                                            <div className={`flex justify-between items-center p-3 rounded-xl border ${isClinical ? 'bg-slate-50/70 border-slate-200/70' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                                <div className="text-[10px] font-black uppercase tracking-wider opacity-60">Adherencia Global</div>
                                                <div className="text-xs font-black font-montserrat tracking-wider">85% Asistencia</div>
                                            </div>
                                        </div>
                                    </Accordion>
                                </div>
                            </div>
                        </div>

                        {/* Fila inferior: Widget cruzado */}
                        <NutritionACWRCrossView 
                            isClinical={isClinical} 
                            acwrData={{ acwr: 1.3, risk_status: 'SWEET_SPOT' }} 
                            nutritionBalanceData={nutritionBalanceData} 
                        />
                    </div>
                )}

                {activeTab === 'entrenamiento' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {hydratedDays.length > 0 ? (
                            <WorkoutTrackingView onEditPlan={handleCreateRoutine} />
                        ) : (
                            <div className="text-center p-10 opacity-50 flex flex-col items-center justify-center">
                                <span className="mb-4">Sin programa de entrenamiento activo</span>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setShowLibraryModal(true)} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700' : 'bg-zinc-900 border border-lime-500/20 hover:bg-lime-500/10 text-lime-400'}`}>
                                        <Folder size={14} /> Abrir Biblioteca
                                    </button>
                                    <button onClick={handleCreateRoutine} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-lime-500 hover:bg-lime-600 text-black'}`}>
                                        <Dumbbell size={14} /> Crear Rutina
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'agenda' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Action Bar for Agenda */}
                        <div className={`p-4 rounded-2xl flex flex-wrap gap-4 items-center ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-lg'} border`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest opacity-50 mr-2`}>Programar Evento</span>
                            <button className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-lime-500 hover:bg-lime-600 text-black'}`}>
                                <Plus size={14} /> Nueva Sesión
                            </button>
                            <button className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                                <CheckCircle size={14} /> Check-in
                            </button>
                            <button className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                                <Activity size={14} /> Medida / Biometría
                            </button>
                        </div>
                        
                        <div className={`p-6 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-xl'}`}>
                            <TrainingCalendar />
                        </div>
                    </div>
                )}

                {activeTab === 'nutricion' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <NutritionTrackingView onEditPlan={() => handleNavigateToBuilder('nutrition')} athleteId={athleteId} />
                    </div>
                )}

                {activeTab === 'habitos' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className={`p-6 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-xl'}`}>
                            <HabitPrescriberDrilldown />
                        </div>
                    </div>
                )}
                    </motion.div>
                </AnimatePresence>
            </div>

                {/* Modals */}
                <AnimatePresence>
                    {showLibraryModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl relative"
                            >
                                <button 
                                    onClick={() => setShowLibraryModal(false)} 
                                    className={`absolute top-4 right-4 p-2 rounded-full z-10 ${isClinical ? 'bg-white/80 hover:bg-white text-slate-500 shadow-sm' : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400'}`}
                                >
                                    <X size={20} />
                                </button>
                                <div className="h-full max-h-[90vh] overflow-y-auto">
                                    <TemplateLibrary onSwitchToRoutine={handleCreateRoutine} />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            <AnimatePresence>
                {showFormModal && <AthleteFormModal onClose={() => setShowFormModal(false)} />}
            </AnimatePresence>

            {/* Biometric Modal */}
            <BiometricLogModal 
                isOpen={isLogMetricsOpen} 
                onClose={() => setIsLogMetricsOpen(false)}
                patient={{ id: athleteId || '', name: athlete.name, status: 'active', tags: athlete.onboardingData?.goal_tags || [] }}
                isClinical={isClinical}
                onSave={async (data) => {
                    console.log('Biometric data saved', data);
                    setIsLogMetricsOpen(false);
                }}
            />
        </div>
    );
};

export default AthleteDetailView;

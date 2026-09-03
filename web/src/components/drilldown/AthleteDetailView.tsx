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
    Folder,
    X
} from 'lucide-react';
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
        <div className={`mb-3 rounded-xl overflow-hidden transition-all duration-200 border ${
            isOpen 
                ? (isClinical ? 'bg-white border-emerald-200 shadow-sm' : 'bg-zinc-900 border-lime-500/20 shadow-lg') 
                : (isClinical ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900')
        }`}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none group"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={16} className={`transition-colors ${isOpen ? (isClinical ? 'text-emerald-500' : 'text-lime-400') : (isClinical ? 'text-slate-400' : 'text-zinc-500')}`} />}
                    <span className={`text-[11px] uppercase font-bold tracking-widest transition-colors ${isOpen ? (isClinical ? 'text-emerald-700' : 'text-lime-400') : (isClinical ? 'text-slate-600' : 'text-zinc-400')}`}>
                        {title}
                    </span>
                </div>
                <div className={`p-1.5 rounded-md transition-colors ${isOpen ? (isClinical ? 'bg-emerald-100 text-emerald-600' : 'bg-lime-500/20 text-lime-400') : (isClinical ? 'bg-slate-200 text-slate-500' : 'bg-zinc-800 text-zinc-400')}`}>
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
        </div>
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
        
        return (
            <div className={`mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900 border-zinc-800 shadow-xl'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className={`p-2 rounded-full transition-colors self-start mt-2 ${isClinical ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-white/60'}`}>
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${isClinical ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-800 text-white border border-white/10'}`}>
                            {athlete.photoUrl ? (
                                <img src={athlete.photoUrl} alt={athlete.name} className="w-full h-full object-cover rounded-full" />
                            ) : initial}
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <h1 className={`text-xl font-bold tracking-tight capitalize ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                        {athlete.name}
                                    </h1>
                                    {goals.slice(0, 1).map((tag: string) => (
                                        <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold tracking-wider ${isClinical ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-lime-500/10 border-lime-500/20 text-lime-400'}`}>
                                            {GOAL_TRANSLATIONS[tag] || tag}
                                        </span>
                                    ))}
                                </div>
                                <div className={`text-[11px] font-medium tracking-wider uppercase flex items-center gap-3 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                    <span>{athlete.onboardingData?.biometrics?.age || '--'} Años</span>
                                    <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                                    <span>{athlete.onboardingData?.biometrics?.weight || athlete.performanceStats?.weight || '--'} kg</span>
                                    <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
                                    <span>{athlete.onboardingData?.biometrics?.height || '--'} cm</span>
                                </div>
                                
                                
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial & Subscription Status */}
                <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-3">
                    {/* Plan Badge */}
                    <div className={`flex items-center gap-3 p-2 pr-4 rounded-xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-800'}`}>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <Award size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Plan Activo</span>
                            <span className={`text-sm font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>PRO TIER</span>
                        </div>
                    </div>

                    {/* Financial Status */}
                    <div className={`flex items-center gap-3 p-2 pr-4 rounded-xl border ${useOnboardingPTStore.getState().identity?.payment_status === 'PAST_DUE' ? (isClinical ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/30 border-rose-900/50') : (isClinical ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/30 border-emerald-900/50')}`}>
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${useOnboardingPTStore.getState().identity?.payment_status === 'PAST_DUE' ? (isClinical ? 'text-rose-600' : 'text-rose-500') : (isClinical ? 'text-emerald-600' : 'text-emerald-500')}`}>Estado Financiero</span>
                            <span className={`text-xs font-medium ${useOnboardingPTStore.getState().identity?.payment_status === 'PAST_DUE' ? (isClinical ? 'text-rose-800' : 'text-rose-300') : (isClinical ? 'text-emerald-800' : 'text-emerald-300')}`}>
                                {useOnboardingPTStore.getState().identity?.payment_status === 'PAST_DUE' ? 'Atrasado • Bloqueo Inminente' : 'Al Día • Vence en 14 días'}
                            </span>
                        </div>
                        <button onClick={() => toast.success("Modo Edición: Actualización de Plan y Pagos abriendo...")} className={`p-2 rounded-lg transition-colors ${useOnboardingPTStore.getState().identity?.payment_status === 'PAST_DUE' ? (isClinical ? 'bg-rose-100 hover:bg-rose-200 text-rose-700' : 'bg-rose-900/50 hover:bg-rose-800 text-rose-400') : (isClinical ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' : 'bg-emerald-900/50 hover:bg-emerald-800 text-emerald-400')}`} title="Editar Suscripción">
                            <Edit3 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const tabClass = (tab: TabType) => `px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${activeTab === tab ? (isClinical ? 'bg-white shadow-sm text-emerald-700' : 'bg-zinc-800 text-lime-400 shadow-lg') : `text-current opacity-60 hover:opacity-100 ${isClinical ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}`;

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

            <div className={`mb-6 p-1.5 flex space-x-1 overflow-x-auto hide-scrollbar rounded-2xl w-fit ${isClinical ? 'bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm' : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl'}`}>
                <nav className="flex space-x-1" aria-label="Tabs del Atleta">
                    <button onClick={() => setActiveTab('resumen')} className={tabClass('resumen')}>Resumen</button>
                    <button onClick={() => setActiveTab('entrenamiento')} className={tabClass('entrenamiento')}>Entrenamiento</button>
                    <button onClick={() => setActiveTab('nutricion')} className={tabClass('nutricion')}>Nutrición</button>
                    <button onClick={() => setActiveTab('habitos')} className={tabClass('habitos')}>Hábitos</button>
                    <button onClick={() => setActiveTab('agenda')} className={tabClass('agenda')}>Agenda</button>
                </nav>
            </div>

            {/* Content Tabs */}
            <div className="w-full">
                {activeTab === 'resumen' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Quick Actions Bar */}
                        <div className={`p-4 rounded-2xl flex flex-wrap gap-4 items-center ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-lg'} border`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest opacity-50 mr-2`}>Acciones Rápidas</span>
                            <button onClick={() => setShowLibraryModal(true)} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                                <Folder size={14} /> Asignar Rutina
                            </button>
                            <button onClick={() => handleNavigateToBuilder('routine')} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                                <Dumbbell size={14} /> Crear Rutina
                            </button>
                            <button onClick={() => handleNavigateToBuilder('habits')} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                                <CheckCircle size={14} /> Crear Hábito
                            </button>
                            <button onClick={() => handleNavigateToBuilder('nutrition')} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'}`}>
                                <Utensils size={14} /> Plan Alimenticio
                            </button>
                            <div className="w-px h-6 bg-zinc-800 mx-1 hidden md:block"></div>
                            <button onClick={() => setIsLogMetricsOpen(true)} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' : 'bg-lime-500/10 hover:bg-lime-500/20 text-lime-400'}`}>
                                <Activity size={14} /> Toma de Medidas
                            </button>
                            <button onClick={() => {}} className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl transition-colors ${isClinical ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400'}`}>
                                <MessageCircle size={14} /> Mensajes
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* COLUMNA 1: Clinical & Lifestyle Profile */}
                            <div className="order-2 lg:order-1 space-y-6">
                                <div className={`p-6 rounded-2xl border h-full ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-lg'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="flex flex-col">
                                                <h3 className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                                    <User size={16} /> FICHA BASELINE
                                                </h3>
                                                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">
                                                    {athlete?.updatedAt ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(athlete.updatedAt)) : 'CREADO RECIENTEMENTE'}
                                                </span>
                                            </div>
                                            <InfoTooltip isClinical={isClinical} text="Información inicial recopilada por nuestro asistente virtual, estructurada para que conozcas a tu cliente en menos de 1 minuto." />
                                        </div>
                                        <button onClick={() => setShowFormModal(true)} className={`p-1.5 rounded-lg transition-colors ${isClinical ? 'hover:bg-slate-100 text-slate-400 hover:text-emerald-600' : 'hover:bg-zinc-800 text-zinc-500 hover:text-lime-400'}`} title="Editar Perfil">
                                            <Edit3 size={14} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {(athlete?.onboardingData?.goal_tags || []).map((tag: string) => (
                                            <div key={tag} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-800 border-zinc-700'} text-[10px] font-bold uppercase tracking-widest`} title="Objetivo principal del atleta">
                                                <Target size={12} className={isClinical ? 'text-slate-600' : 'text-slate-400'} />
                                                <span className={isClinical ? 'text-slate-700' : 'text-slate-300'}>{GOAL_TRANSLATIONS[tag] || tag}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="font-sans">
                                        <Accordion title="Contexto y Dolencias" defaultOpen={true} isClinical={isClinical} icon={Activity}>
                                            <p className={`text-[10px] mb-3 uppercase tracking-widest opacity-50 font-bold`}>💡 Por qué importa: Entender su estrés y dolores previos es clave para retener al cliente.</p>
                                            <p className={`text-sm leading-relaxed italic mb-4 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                                "{athlete.bio}"
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {(athlete.onboardingData?.medical_tags || []).length > 0 ? (
                                                    athlete.onboardingData?.medical_tags?.map((tag: string) => (
                                                        <TagBadge key={tag} isWarning>{tag.replace(/_/g, ' ')}</TagBadge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs font-mono text-emerald-500">Sin lesiones registradas</span>
                                                )}
                                            </div>
                                        </Accordion>

                                        <Accordion title="Composición Corporal Inicial" isClinical={isClinical} icon={FileText}>
                                            <p className={`text-[10px] mb-3 uppercase tracking-widest opacity-50 font-bold`}>💡 Por qué importa: Es el punto de partida (baseline) para demostrar resultados reales a futuro.</p>
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Última actualización:</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">{athlete?.updatedAt ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(athlete.updatedAt)) : 'Hoy'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Peso</span>
                                                    <span className="font-bold">{athlete.performanceStats?.weight || athlete.onboardingData?.biometrics?.weight || '--'} kg</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Altura</span>
                                                    <span className="font-bold">{athlete.onboardingData?.biometrics?.height || '--'} cm</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Edad</span>
                                                    <span className="font-bold">{athlete.onboardingData?.biometrics?.age || '--'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Género</span>
                                                    <span className="font-bold capitalize">{athlete.onboardingData?.biometrics?.gender || '--'}</span>
                                                </div>
                                            </div>
                                        </Accordion>

                                        <Accordion title="Historial Deportivo" isClinical={isClinical} icon={Dumbbell}>
                                            <p className={`text-[10px] mb-3 uppercase tracking-widest opacity-50 font-bold`}>💡 Por qué importa: Define el volumen y la complejidad inicial de la rutina a asignar.</p>
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Nivel</span>
                                                    <span className={`font-bold text-xs uppercase tracking-wider ${!isClinical && 'text-lime-400'}`}>
                                                        {athlete.onboardingData?.training?.experience_level === 'BEGINNER' ? 'Principiante' : athlete.onboardingData?.training?.experience_level === 'INTERMEDIATE' ? 'Intermedio' : athlete.onboardingData?.training?.experience_level === 'ADVANCED' ? 'Avanzado' : 'Desconocido'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Frecuencia</span>
                                                    <span className="font-bold text-xs uppercase tracking-wider">
                                                        {athlete.onboardingData?.training?.days_per_week ? `${athlete.onboardingData.training.days_per_week} DÍAS/SEM` : '--'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase opacity-50 block mb-2">Equipamiento</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {athlete.onboardingData?.training?.equipment && athlete.onboardingData.training.equipment.length > 0 ? (
                                                        athlete.onboardingData.training.equipment.map((eq: string) => {
                                                            const eqName = eq === 'COMMERCIAL_GYM' ? 'Gimnasio Comercial' : eq === 'HOME_GYM' ? 'Gimnasio en Casa' : eq === 'NO_EQUIPMENT' ? 'Sin Equipamiento' : eq;
                                                            return <span key={eq} className={`text-[9px] uppercase px-2 py-1 rounded border font-bold ${isClinical ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-zinc-900 border-zinc-800 text-zinc-300'}`}>{eqName}</span>;
                                                        })
                                                    ) : <span className="text-xs opacity-50">--</span>}
                                                </div>
                                            </div>
                                        </Accordion>

                                        <Accordion title="Estilo de Vida y Nutrición" isClinical={isClinical} icon={Utensils}>
                                            <p className={`text-[10px] mb-3 uppercase tracking-widest opacity-50 font-bold`}>💡 Por qué importa: El descanso y el estrés impactan hasta un 60% en la recuperación muscular.</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Dieta</span>
                                                    <span className="font-bold text-sm capitalize">{athlete.onboardingData?.healthData?.currentDiet || '--'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Trabajo</span>
                                                    <span className="font-bold text-sm capitalize">{athlete.onboardingData?.habit_work_type || '--'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Estrés</span>
                                                    <span className="font-bold text-sm">{athlete.onboardingData?.habit_stress_level ? `${athlete.onboardingData.habit_stress_level}/5` : '--'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase opacity-50 block">Sueño</span>
                                                    <span className="font-bold text-sm">{athlete.onboardingData?.habit_sleep_quality ? `${athlete.onboardingData.habit_sleep_quality}/5 ★` : '--'}</span>
                                                </div>
                                            </div>
                                        </Accordion>
                                    </div>
                                </div>
                            </div>
                            
                            {/* COLUMNA 2: Performance Projection */}
                            <div className="order-1 lg:order-2 space-y-6">
                                <div className={`p-6 rounded-2xl border h-full flex flex-col ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-lg'}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center">
                                            <h3 className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                                <Activity size={16} /> Balance Nutricional
                                            </h3>
                                            <InfoTooltip isClinical={isClinical} text="Distribución de objetivos nutricionales y macro." />
                                        </div>
                                        {hasRealStats && (
                                            <div className="bg-zinc-900 p-1 rounded-md inline-flex items-center gap-1 border border-white/5">
                                                {['Día', 'Sem', 'Mes', 'Trim'].map((range) => (
                                                    <button
                                                        key={range}
                                                        onClick={() => setTimeRange(range)}
                                                        className={`px-3 py-1 text-[9px] font-bold uppercase rounded transition-all ${timeRange === range
                                                            ? 'bg-zinc-800 text-lime-400 shadow-sm'
                                                            : 'text-zinc-500 hover:text-zinc-300'
                                                            }`}
                                                    >
                                                        {range}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Radar Chart */}
                                    <div className="h-[200px] w-full mb-6 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={nutritionBalanceData}>
                                                <PolarGrid stroke={isClinical ? "#e2e8f0" : "rgba(255,255,255,0.1)"} />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: isClinical ? '#64748b' : '#a1a1aa', fontSize: 9, fontWeight: 'bold' }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                                <Radar
                                                    name="Objetivo"
                                                    dataKey="A"
                                                    stroke={isClinical ? "#059669" : "#6366f1"}
                                                    strokeWidth={2}
                                                    fill={isClinical ? "#10b981" : "#6366f1"}
                                                    fillOpacity={0.2}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <hr className={`my-4 border-t ${isClinical ? 'border-slate-100' : 'border-zinc-800/50'}`} />

                                    {hasRealStats ? (
                                        <>
                                            {/* Volume Chart */}
                                            <div className="h-[200px] w-full mb-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={athlete.lastSessions}>
                                                        <defs>
                                                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor={isClinical ? "#0f172a" : "#ffffff"} stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor={isClinical ? "#0f172a" : "#ffffff"} stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isClinical ? "#e2e8f0" : "rgba(255,255,255,0.05)"} />
                                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
                                                        <Tooltip contentStyle={{ backgroundColor: isClinical ? '#fff' : '#000', borderColor: isClinical ? '#e2e8f0' : '#111', borderRadius: '8px' }} />
                                                        <Area type="monotone" dataKey="volume" stroke={isClinical ? "#0f172a" : "#ffffff"} strokeWidth={3} fill="url(#colorVolume)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* PR Stats Row */}
                                            <div className="grid grid-cols-2 gap-4 mt-auto">
                                                {Object.entries(athlete.performanceStats).filter(([k]) => k !== 'Total Volume').slice(0,4).map(([key, value]) => (
                                                    <div key={key} className={`p-4 rounded-xl border ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-50 mb-1">{key.replace('_1rm', '')}</div>
                                                        <div className="text-2xl font-black">{value} <span className="text-xs font-normal opacity-50">kg</span></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isClinical ? 'bg-slate-100' : 'bg-zinc-900'}`}>
                                                <Dumbbell size={24} className={isClinical ? "text-slate-400" : "text-zinc-600"} />
                                            </div>
                                            <h4 className="text-sm font-black uppercase tracking-wider mb-2">Sin Historial de Marcas</h4>
                                            <p className="text-xs opacity-50 mb-6 max-w-[200px] leading-relaxed">
                                                Para proyectar el rendimiento necesitamos una línea base de fuerza.
                                            </p>
                                            <button className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isClinical ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white text-black hover:bg-zinc-200'}`}>
                                                Registrar 1RM Base
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* COLUMNA 3: Actividad Reciente & Operaciones */}
                            <div className="order-3 lg:order-3 space-y-6">
                                <div className={`p-6 rounded-2xl border h-full flex flex-col ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-900 shadow-lg'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                            <Clock size={16} /> Línea de Tiempo & Evolución
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <button className={`p-1.5 rounded-lg transition-colors ${isClinical ? 'hover:bg-slate-100 text-emerald-600' : 'hover:bg-zinc-800 text-lime-400'}`} title="Felicitar">
                                                <Award size={14} />
                                            </button>
                                            <button className={`p-1.5 rounded-lg transition-colors ${isClinical ? 'hover:bg-slate-100 text-blue-500' : 'hover:bg-zinc-800 text-sky-400'}`} title="Enviar Mensaje">
                                                <MessageCircle size={14} />
                                            </button>
                                            <button className={`p-1.5 rounded-lg transition-colors ${isClinical ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400'}`} title="Añadir Observación">
                                                <Edit3 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Evolución Visual (Progreso fotográfico) */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Fotos de Progreso</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isClinical ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'}`}>Mes Actual</span>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                                            {/* Mocks de fotos */}
                                            <div className={`min-w-[80px] h-[100px] rounded-xl flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-colors ${isClinical ? 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-400' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-zinc-500'}`}>
                                                <Plus size={16} className="mb-1" />
                                                <span className="text-[9px] font-bold uppercase">Añadir</span>
                                            </div>
                                            <div className={`min-w-[80px] h-[100px] rounded-xl bg-zinc-800 bg-cover bg-center border ${isClinical ? 'border-slate-200 shadow-sm' : 'border-zinc-700'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=200&auto=format&fit=crop')" }}></div>
                                            <div className={`min-w-[80px] h-[100px] rounded-xl bg-zinc-800 bg-cover bg-center border opacity-50 ${isClinical ? 'border-slate-200' : 'border-zinc-700'}`} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=200&auto=format&fit=crop')" }}></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Historial Reciente</span>
                                    </div>

                                    <div className="h-[180px] overflow-y-auto pr-2 custom-scrollbar mb-4 flex flex-col gap-3">
                                        {athlete?.lastSessions && athlete.lastSessions.length > 0 ? (
                                            athlete.lastSessions.map((session: any, idx: number) => (
                                                <div key={idx} className={`p-4 rounded-xl border ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold">{new Date(session.date).toLocaleDateString()}</span>
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-indigo-500/10 text-indigo-500">
                                                            RPE: {session.intensity}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] uppercase opacity-50 font-bold">Volumen: {session.volume} kg</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-50 border border-dashed rounded-xl border-zinc-800">
                                                <Clock size={20} className="mb-2" />
                                                <p className="text-[10px] uppercase tracking-widest font-bold">No hay registros recientes</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <hr className={`my-4 border-t ${isClinical ? 'border-slate-100' : 'border-zinc-800/50'}`} />

                                    {/* Operaciones */}
                                    <Accordion title="Métricas Operativas" defaultOpen={false} isClinical={isClinical}>
                                        <div className="space-y-3 font-sans mt-2">
                                            <div className={`flex justify-between items-center p-4 rounded-xl border ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Estado de Pago</div>
                                                <div className={`text-xs font-black uppercase tracking-wider ${isClinical ? 'text-emerald-600' : 'text-lime-400'}`}>AL DÍA</div>
                                            </div>
                                            <div className={`flex justify-between items-center p-4 rounded-xl border ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-zinc-900/50 border-zinc-800/50'}`}>
                                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Adherencia</div>
                                                <div className="text-xs font-black uppercase tracking-wider">85% Asistencia</div>
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
            </div>

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

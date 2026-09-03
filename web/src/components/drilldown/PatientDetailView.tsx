import React, { useEffect, useState, useMemo } from 'react';
import {
    ChevronLeft, Activity, Calendar, AlertTriangle, FileText, Utensils, BrainCircuit, HeartPulse, Moon, Eye, EyeOff, Users, BookOpen,
    Edit, Save, X, Shield, CheckCircle2, Lock, ArrowRight, BarChart3, FlaskConical, Stethoscope
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { BiometricLogModal } from './BiometricLogModal';
interface PatientDetailViewProps {
    patientId: string;
    onBack: () => void;
}

type TimeRange = '1W' | '1M' | '3M' | '6M' | 'YTD';
type Tab = 'SCORECARD' | 'ANALYTICS';

// =============================================================================
// HELPER TO GENERATE DYNAMIC TELEMETRY BASED ON WEIGHT
// =============================================================================
const generateMockTelemetry = (startingWeight: number) => {
    const data = [];
    const today = new Date('2026-06-01');
    let baseWeight = startingWeight;
    let baseAlmi = 7.2;

    for (let i = 180; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Weight fluctuation with noise
        baseWeight = baseWeight - (Math.random() * 0.05); 
        const dailyNoise = (Math.random() - 0.5) * 1.5; 
        const rawWeight = Number((baseWeight + dailyNoise).toFixed(1));

        // Sleep
        let deepSleep = 1.5 + (Math.random() * 0.5); 
        
        // Adherence (calories)
        let in_range = 1800 + (Math.random() * 200);
        let deficit = 0;
        let excess = 0;

        if (i === 45 || i === 90 || i === 120) {
            deepSleep = 0.5; 
        }

        if (i === 44 || i === 89 || i === 119) {
            excess = 800 + (Math.random() * 400); 
            in_range = 1800;
        }

        if (Math.random() > 0.95 && excess === 0) {
            deficit = 500 + (Math.random() * 300);
            in_range = 1800 - deficit;
        }

        baseAlmi += 0.002;

        data.push({
            date: date.toISOString().split('T')[0],
            displayDate: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            rawWeight,
            wmaWeight: rawWeight,
            deepSleep: Number(deepSleep.toFixed(2)),
            in_range,
            deficit,
            excess,
            almi: Number(baseAlmi.toFixed(2)),
            tir: 85 + (Math.random() * 10) - (excess > 0 ? 15 : 0)
        });
    }

    for (let i = 0; i < data.length; i++) {
        let sum = 0;
        let weightSum = 0;
        for (let j = 0; j < 7; j++) {
            if (i - j >= 0) {
                const weight = 7 - j;
                sum += data[i - j].rawWeight * weight;
                weightSum += weight;
            }
        }
        data[i].wmaWeight = Number((sum / weightSum).toFixed(1));
    }

    return data;
};

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patientId, onBack }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const navigate = useNavigate();

    // Data State
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<any>(null);
    const [telemetry, setTelemetry] = useState<any[]>([]);
    
    // UI State
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');
    const [activeTab, setActiveTab] = useState<Tab>('SCORECARD');

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editAge, setEditAge] = useState(30);
    const [editWeight, setEditWeight] = useState(70);
    const [editWaist, setEditWaist] = useState(80);
    const [editCalories, setEditCalories] = useState(1800);
    const [editProtein, setEditProtein] = useState(150);
    const [editCarbs, setEditCarbs] = useState(150);
    const [editFats, setEditFats] = useState(60);
    const [editLowFodmap, setEditLowFodmap] = useState(false);
    const [editGlp1, setEditGlp1] = useState(false);
    const [editMets, setEditMets] = useState(false);

    // Friction Modal for GLP-1 Override
    const [showFrictionModal, setShowFrictionModal] = useState(false);

    // Biometric Log Modal State
    const [isLogMetricsOpen, setIsLogMetricsOpen] = useState(false);

    // Correlation Canvas Toggles
    const [showWeight, setShowWeight] = useState(true);
    const [showAdherence, setShowAdherence] = useState(true);
    const [showSleep, setShowSleep] = useState(true);
    const [showAlmi, setShowAlmi] = useState(false);
    const [showTir, setShowTir] = useState(false);

    // Load Patient Data dynamically
    const fetchPatientData = async () => {
        setLoading(true);
        try {
            let found: any = null;

            // 1. Check local storage edits
            const localEditsRaw = localStorage.getItem(`patient_edits_${patientId}`);
            if (localEditsRaw) {
                found = JSON.parse(localEditsRaw);
            }

            // 2. Check if ephemeral onboarding demo patient
            if (!found && (patientId === 'ephemeral-demo' || patientId.startsWith('EPHEMERAL'))) {
                const epRaw = localStorage.getItem('ephemeral_patient_demo');
                if (epRaw) {
                    const ep = JSON.parse(epRaw);
                    const isLowFodmap = ep.clinical_flags?.low_fodmap_active || false;
                    const isGlp1 = ep.clinical_flags?.glp1_safety_mode || false;
                    const metsRisk = ep.clinical_flags?.metabolic_syndrome_risk || (ep.waist || 85) > (ep.gender === 'female' ? 85 : 90);

                    found = {
                        id: patientId,
                        full_name: ep.patient_name || 'Nahuel 2',
                        email: ep.email || 'demo.cliente.cero@aurea.clinic',
                        age: ep.age || 32,
                        weight: ep.weight || 82.5,
                        height: ep.height || 172,
                        waist: ep.waist || 85,
                        tmb: ep.tmb || 1650,
                        goal: ep.archetype_label || 'Plan Personalizado',
                        macrosCompliance: 88,
                        status: 'active',
                        clinicalFlags: {
                            low_fodmap: isLowFodmap,
                            glp1: isGlp1,
                            mets: metsRisk
                        },
                        calories: ep.daily_energy_requirement || 1800,
                        protein: Math.round((ep.weight || 82.5) * 2),
                        carbs: Math.round((ep.daily_energy_requirement || 1800) * 0.4 / 4),
                        fats: Math.round((ep.daily_energy_requirement || 1800) * 0.25 / 9),
                        telemetrySync: true,
                        lastTelemetrySync: 'Hace 1 min',
                        isEphemeral: true
                    };
                }
            }

            // 3. Fallback mock definitions
            if (!found) {
                const localMocks = [
                    {
                        id: 'mock-1',
                        full_name: 'Laura Martinez',
                        email: 'laura.m@email.com',
                        age: 35,
                        weight: 68.2,
                        height: 165,
                        waist: 88,
                        tmb: 1420,
                        goal: 'Low Carb + Ozempic',
                        macrosCompliance: 92,
                        status: 'active',
                        clinicalFlags: { low_fodmap: false, glp1: true, mets: true },
                        calories: 1800,
                        protein: 160,
                        carbs: 120,
                        fats: 75,
                        telemetrySync: true,
                        lastTelemetrySync: 'Hace 5 min'
                    },
                    {
                        id: 'mock-2',
                        full_name: 'Carlos Ruiz',
                        email: 'carlos.ruiz@hotmail.com',
                        age: 48,
                        weight: 95.4,
                        height: 178,
                        waist: 104,
                        tmb: 1850,
                        goal: 'Keto + FODMAP Shield',
                        macrosCompliance: 42,
                        status: 'warning',
                        clinicalFlags: { low_fodmap: true, glp1: false, mets: true },
                        calories: 1900,
                        protein: 140,
                        carbs: 50,
                        fats: 120,
                        telemetrySync: true,
                        lastTelemetrySync: 'Hace 1d'
                    },
                    {
                        id: 'mock-3',
                        full_name: 'Ana Gomez',
                        email: 'ana.gomez@gmail.com',
                        age: 29,
                        weight: 61.5,
                        height: 168,
                        waist: 78,
                        tmb: 1380,
                        goal: 'Balanced Nutrition',
                        macrosCompliance: 96,
                        status: 'active',
                        clinicalFlags: { low_fodmap: false, glp1: false, mets: false },
                        calories: 1600,
                        protein: 120,
                        carbs: 160,
                        fats: 50,
                        telemetrySync: true,
                        lastTelemetrySync: 'Hace 10 min'
                    },
                    {
                        id: 'mock-4',
                        full_name: 'Mateo Salazar',
                        email: 'mateo.salazar@outlook.com',
                        age: 31,
                        weight: 82.0,
                        height: 180,
                        waist: 86,
                        tmb: 1720,
                        goal: 'Hypertrophy Protocol',
                        macrosCompliance: 89,
                        status: 'active',
                        clinicalFlags: { low_fodmap: false, glp1: false, mets: false },
                        calories: 2500,
                        protein: 180,
                        carbs: 280,
                        fats: 75,
                        telemetrySync: false,
                        lastTelemetrySync: 'Hace 3d'
                    },
                    {
                        id: 'mock-5',
                        full_name: 'Sofia Ortiz',
                        email: 'sofia.ortiz@gmail.com',
                        age: 42,
                        weight: 74.8,
                        height: 160,
                        waist: 92,
                        tmb: 1490,
                        goal: 'Low-FODMAP Clean',
                        macrosCompliance: 35,
                        status: 'inactive',
                        clinicalFlags: { low_fodmap: true, glp1: false, mets: true },
                        calories: 1450,
                        protein: 100,
                        carbs: 140,
                        fats: 55,
                        telemetrySync: true,
                        lastTelemetrySync: 'Hace 2d'
                    },
                    {
                        id: 'mock-6',
                        full_name: 'Diego Almada',
                        email: 'diego.almada@gmail.com',
                        age: 55,
                        weight: 89.1,
                        height: 175,
                        waist: 101,
                        tmb: 1750,
                        goal: 'Ozempic + Low-FODMAP',
                        macrosCompliance: 78,
                        status: 'warning',
                        clinicalFlags: { low_fodmap: true, glp1: true, mets: true },
                        calories: 1700,
                        protein: 130,
                        carbs: 130,
                        fats: 65,
                        telemetrySync: false,
                        lastTelemetrySync: 'Hace 4d'
                    }
                ];

                const match = localMocks.find(m => m.id === patientId);
                if (match) {
                    found = { ...match };
                }
            }

            // 4. Ultimate default fallback
            if (!found) {
                found = {
                    id: patientId,
                    full_name: 'Paciente Encontrado',
                    email: 'paciente.consulta@aurea.clinic',
                    age: 34,
                    weight: 72.0,
                    height: 170,
                    waist: 82,
                    tmb: 1530,
                    goal: 'Recomposición Corporal',
                    macrosCompliance: 80,
                    status: 'active',
                    clinicalFlags: { low_fodmap: false, glp1: false, mets: false },
                    calories: 1800,
                    protein: 140,
                    carbs: 170,
                    fats: 62,
                    telemetrySync: true,
                    lastTelemetrySync: 'Hace 1h'
                };
            }

            setPatient(found);
            setTelemetry(generateMockTelemetry(found.weight));

            // Set edit fields
            setEditName(found.full_name);
            setEditEmail(found.email || '');
            setEditAge(found.age);
            setEditWeight(found.weight);
            setEditWaist(found.waist || 80);
            setEditCalories(found.calories || 1800);
            setEditProtein(found.protein || 140);
            setEditCarbs(found.carbs || 160);
            setEditFats(found.fats || 60);
            setEditLowFodmap(found.clinicalFlags.low_fodmap);
            setEditGlp1(found.clinicalFlags.glp1);
            setEditMets(found.clinicalFlags.mets);

        } catch (e) {
            console.error(e);
            toast.error('Error al cargar datos del paciente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    // Handle turning off GLP-1 (Friction Trigger)
    const handleGlp1Toggle = (checked: boolean) => {
        // If they are checking it, let them proceed.
        // If they are UNCHECKING it, throw the positive friction modal override block!
        if (!checked) {
            setShowFrictionModal(true);
        } else {
            setEditGlp1(true);
        }
    };

    // Confirm medical override of GLP-1
    const confirmMedicalOverride = () => {
        setEditGlp1(false);
        setShowFrictionModal(false);
        toast.success('Anulación médica autorizada. Bloqueo magnético liberado.', { icon: '🛡️' });
    };

    // Save protocol changes
    const saveEdits = () => {
        const updated = {
            ...patient,
            full_name: editName,
            email: editEmail,
            age: Number(editAge),
            weight: Number(editWeight),
            waist: Number(editWaist),
            tmb: Math.round(10 * Number(editWeight) + 6.25 * (patient.height || 170) - 5 * Number(editAge) + 5),
            calories: Number(editCalories),
            protein: Number(editProtein),
            carbs: Number(editCarbs),
            fats: Number(editFats),
            clinicalFlags: {
                low_fodmap: editLowFodmap,
                glp1: editGlp1,
                mets: editMets
            }
        };

        // Write to local storage
        localStorage.setItem(`patient_edits_${patient.id}`, JSON.stringify(updated));

        // If it is the ephemeral user, also sync the ZeroClientWizard cache!
        if (patient.id === 'ephemeral-demo') {
            const epRaw = localStorage.getItem('ephemeral_patient_demo');
            if (epRaw) {
                try {
                    const ep = JSON.parse(epRaw);
                    const synced = {
                        ...ep,
                        patient_name: editName,
                        email: editEmail,
                        age: Number(editAge),
                        weight: Number(editWeight),
                        waist: Number(editWaist),
                        tmb: updated.tmb,
                        daily_energy_requirement: Number(editCalories),
                        clinical_flags: {
                            ...ep.clinical_flags,
                            low_fodmap_active: editLowFodmap,
                            glp1_safety_mode: editGlp1,
                            metabolic_syndrome_risk: editMets
                        }
                    };
                    localStorage.setItem('ephemeral_patient_demo', JSON.stringify(synced));
                } catch (e) {
                    console.error("Syncing ephemeral patient demo failed", e);
                }
            }
        }

        setPatient(updated);
        setTelemetry(generateMockTelemetry(updated.weight));
        setIsEditing(false);

        // Notify client app simulator about updates via dynamic custom event
        window.dispatchEvent(new CustomEvent('patient-updated', { detail: updated }));

        toast.success('Protocolo clínico actualizado con éxito.', {
            style: {
                background: isClinical ? '#F0FDF4' : '#18181b',
                color: isClinical ? '#15803d' : '#6366f1',
                border: isClinical ? '1px solid #bbf7d0' : '1px solid rgba(206,255,0,0.15)',
                fontWeight: 'bold',
                fontFamily: 'sans-serif'
            },
            icon: '✓'
        });
    };

    const filteredData = useMemo(() => {
        if (!telemetry.length) return [];
        const days = timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : timeRange === '3M' ? 90 : 180;
        return telemetry.slice(-days);
    }, [telemetry, timeRange]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-4 rounded-xl shadow-xl border ${isClinical ? 'bg-white/95 border-slate-200' : 'bg-zinc-900/95 border-zinc-800'}`}>
                    <p className={`text-sm font-bold mb-3 ${isClinical ? 'text-slate-800' : 'text-white'}`}>{label}</p>
                    {payload.map((p: any, idx: number) => {
                        let name = p.name;
                        let value = p.value;
                        let unit = '';
                        
                        if (name === 'rawWeight') return null;
                        if (name === 'wmaWeight') { name = 'Peso (WMA 7d)'; unit = 'kg'; }
                        if (name === 'deepSleep') { name = 'Sueño Profundo'; unit = 'h'; }
                        if (name === 'in_range') { name = 'Calorías Rango'; unit = 'kcal'; }
                        if (name === 'excess') { name = 'Exceso Calórico'; unit = 'kcal'; }
                        if (name === 'deficit') { name = 'Déficit'; unit = 'kcal'; }
                        if (name === 'almi') { name = 'ALMI'; unit = 'kg/m²'; }
                        if (name === 'tir') { name = 'TIR (Glucosa)'; unit = '%'; }

                        if (value === 0 && (name.includes('Exceso') || name.includes('Déficit'))) return null;

                        return (
                            <div key={idx} className="flex items-center gap-3 justify-between text-xs mb-1.5">
                                <span style={{ color: p.color }} className="font-bold flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                    {name}
                                </span>
                                <span className={isClinical ? 'text-slate-600' : 'text-zinc-300 font-mono'}>{value} {unit}</span>
                            </div>
                        );
                    })}
                    {payload.find((p:any) => p.name === 'excess' && p.value > 0) && payload.find((p:any) => p.name === 'deepSleep' && p.value < 1.0) && (
                        <div className="mt-3 pt-3 border-t border-rose-100/20 bg-rose-500/10 p-2 rounded-lg text-[10px] text-rose-500 font-bold uppercase tracking-widest flex items-start gap-1">
                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                            Causalidad: Privación de sueño precedió al atracón calórico.
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isClinical ? 'bg-[#F8FAFC]' : 'bg-zinc-950'}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-indigo-500 mb-4" />
                <div className={`text-sm font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Cargando Telemetría Avanzada...</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 md:p-6 font-sans animate-in slide-in-from-right duration-500 pb-36 ${isClinical ? 'bg-[#F8FAFC] text-slate-800' : 'bg-zinc-950 text-white'}`}>
            
            {/* Header & Global Time Sync */}
            <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <button
                        onClick={onBack}
                        className={`p-2.5 rounded-2xl transition-colors border ${isClinical ? 'hover:bg-slate-200 text-slate-500 border-slate-200 bg-white shadow-sm' : 'hover:bg-zinc-800 text-zinc-400 border-zinc-800 bg-zinc-900/50'}`}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className={`text-3xl font-sans font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                {patient.full_name}
                            </h1>
                            {patient.isEphemeral && (
                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    Demo Onboarding
                                </span>
                            )}
                        </div>
                        <div className={`flex flex-wrap items-center gap-2 text-sm font-medium mt-1.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                            <span className="font-mono text-xs">{patient.email}</span>
                            <span>•</span>
                            <span>{patient.age} años</span>
                            <span>•</span>
                            <span>{patient.weight} kg</span>
                            
                            {/* ACTIVE SHIELD CHIPS */}
                            <div className="flex gap-1 ml-3">
                                {patient.clinicalFlags.low_fodmap && (
                                    <span className="flex items-center gap-1 text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        🛡️ Low-FODMAP Active
                                    </span>
                                )}
                                {patient.clinicalFlags.glp1 && (
                                    <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        ⚠️ GLP-1 Active Mode
                                    </span>
                                )}
                                {patient.clinicalFlags.mets && (
                                    <span className="flex items-center gap-1 text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                        🫀 Riesgo MetS
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* EDIT & NAVIGATION ACTION ROW */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${
                            isEditing 
                                ? (isClinical ? 'bg-rose-500 text-white' : 'bg-rose-600 text-white')
                                : (isClinical ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800')
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <X size={14} /> Cancelar Edición
                            </>
                        ) : (
                            <>
                                <Edit size={14} /> Editar Protocolo
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setIsLogMetricsOpen(true)}
                        className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 ${
                            isClinical ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:bg-indigo-400'
                        }`}
                    >
                        <HeartPulse size={14} /> Registrar Medición
                    </button>

                    {/* Nexus Nav Shortcuts */}
                    <div className={`p-1 rounded-2xl flex border text-xs font-bold gap-1 ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'}`}>
                        <button
                            onClick={() => navigate('/dietqa')}
                            className={`px-3 py-2 rounded-xl flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}
                            title="Abrir DietQA Recetas"
                        >
                            <Stethoscope size={14} /> Recetas
                        </button>
                        <button
                            onClick={() => navigate('/smartlab')}
                            className={`px-3 py-2 rounded-xl flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}
                            title="Abrir Smart Lab"
                        >
                            <FlaskConical size={14} /> Bio-Sync
                        </button>
                        <button
                            onClick={() => navigate('/validations')}
                            className={`px-3 py-2 rounded-xl flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}
                            title="Validaciones Tinder"
                        >
                            <CheckCircle2 size={14} /> Validaciones
                        </button>
                    </div>

                    <div className={`flex p-1 rounded-xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'}`}>
                        {(['1W', '1M', '3M', '6M', 'YTD'] as TimeRange[]).map(tr => (
                            <button
                                key={tr}
                                onClick={() => setTimeRange(tr)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    timeRange === tr 
                                        ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]')
                                        : (isClinical ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800')
                                }`}
                            >
                                {tr}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className={`flex gap-6 border-b mb-6 ${isClinical ? 'border-slate-200' : 'border-zinc-800'}`}>
                <button 
                    onClick={() => setActiveTab('SCORECARD')}
                    className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative ${
                        activeTab === 'SCORECARD' 
                            ? (isClinical ? 'text-slate-900' : 'text-indigo-400') 
                            : (isClinical ? 'text-slate-400 hover:text-slate-600' : 'text-zinc-400 hover:text-zinc-200')
                    }`}
                >
                    Strategic Scorecard
                    {activeTab === 'SCORECARD' && (
                        <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${isClinical ? 'bg-slate-900' : 'bg-indigo-500'}`} />
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('ANALYTICS')}
                    className={`pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative flex items-center gap-2 ${
                        activeTab === 'ANALYTICS' 
                            ? (isClinical ? 'text-slate-900' : 'text-indigo-400') 
                            : (isClinical ? 'text-slate-400 hover:text-slate-600' : 'text-zinc-400 hover:text-zinc-200')
                    }`}
                >
                    <BrainCircuit size={16} /> Lienzo de Correlación
                    {activeTab === 'ANALYTICS' && (
                        <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-full ${isClinical ? 'bg-slate-900' : 'bg-indigo-500'}`} />
                    )}
                </button>
            </div>

            {/* TAB CONTENT: SCORECARD */}
            {activeTab === 'SCORECARD' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
                    
                    {/* LEFT BAR: BIOMETRICS & INTERACTIVE SHIELDS */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                    <Activity size={16} /> Ficha Clínica
                                </h3>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isClinical ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'}`}>Activa</span>
                            </div>
                            
                            {/* DYNAMIC FORM / CONTENT SWITCH */}
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div
                                        key="editing-biometrics"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="space-y-4"
                                    >
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Editar Biometría</h4>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 block mb-1">Nombre Completo</label>
                                            <input 
                                                type="text" 
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className={`w-full p-2.5 rounded-xl border text-xs ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-850'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 block mb-1">Email de Contacto</label>
                                            <input 
                                                type="email" 
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className={`w-full p-2.5 rounded-xl border text-xs ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-850'}`}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 block mb-1">Edad (Años)</label>
                                                <input 
                                                    type="number" 
                                                    value={editAge}
                                                    onChange={(e) => setEditAge(Number(e.target.value))}
                                                    className={`w-full p-2.5 rounded-xl border text-xs font-mono ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-850'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 block mb-1">Peso (kg)</label>
                                                <input 
                                                    type="number" 
                                                    value={editWeight}
                                                    onChange={(e) => setEditWeight(Number(e.target.value))}
                                                    className={`w-full p-2.5 rounded-xl border text-xs font-mono ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-850'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold uppercase tracking-widest opacity-50 block mb-1">Cintura (cm)</label>
                                                <input 
                                                    type="number" 
                                                    value={editWaist}
                                                    onChange={(e) => setEditWaist(Number(e.target.value))}
                                                    className={`w-full p-2.5 rounded-xl border text-xs font-mono ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-850'}`}
                                                />
                                            </div>
                                        </div>

                                        {/* Escudos Clínicos Toggles */}
                                        <div className={`p-4 rounded-2xl border space-y-3 mt-4 ${isClinical ? 'bg-slate-50' : 'bg-zinc-950 border-zinc-850'}`}>
                                            <h5 className="text-[9px] font-bold uppercase tracking-widest opacity-50">Escudos Clínicos (B2B Safeguards)</h5>
                                            
                                            <label className="flex items-center justify-between text-xs cursor-pointer">
                                                <span>Escudo Low-FODMAP</span>
                                                <input
                                                    type="checkbox"
                                                    checked={editLowFodmap}
                                                    onChange={(e) => setEditLowFodmap(e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between text-xs cursor-pointer">
                                                <span className="flex items-center gap-1">GLP-1 Mode Active 🛡️</span>
                                                <input
                                                    type="checkbox"
                                                    checked={editGlp1}
                                                    onChange={(e) => handleGlp1Toggle(e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </label>

                                            <label className="flex items-center justify-between text-xs cursor-pointer">
                                                <span>Riesgo MetS</span>
                                                <input
                                                    type="checkbox"
                                                    checked={editMets}
                                                    onChange={(e) => setEditMets(e.target.checked)}
                                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </label>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="view-biometrics"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <div className={`text-xs mb-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>TMB Estimado (Mifflin-St Jeor)</div>
                                            <div className="flex items-baseline gap-2">
                                                <div className={`text-3xl font-black ${isClinical ? 'text-slate-800' : 'text-white'}`}>{patient.tmb || 1500}</div>
                                                <span className="text-xs opacity-50">kcal/día</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800">
                                            <div>
                                                <div className={`text-xs mb-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Medida Cintura</div>
                                                <div className={`text-xl font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>{patient.waist || 80} cm</div>
                                            </div>
                                            <div>
                                                <div className={`text-xs mb-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>TIR (Glucosa)</div>
                                                <div className={`text-xl font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>92%</div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-dashed border-slate-200 dark:border-zinc-800">
                                            <div className={`text-xs mb-2 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Escudos de Seguridad Activos</div>
                                            <div className="space-y-2">
                                                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${patient.clinicalFlags.low_fodmap ? 'border-blue-500/20 bg-blue-500/5 text-blue-500' : 'opacity-40 border-zinc-800'}`}>
                                                    <span>Shield Low-FODMAP</span>
                                                    <span className="font-bold text-[10px]">{patient.clinicalFlags.low_fodmap ? 'CONECTADO' : 'INACTIVO'}</span>
                                                </div>
                                                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${patient.clinicalFlags.glp1 ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' : 'opacity-40 border-zinc-800'}`}>
                                                    <span>Lock GLP-1 / Ayunos</span>
                                                    <span className="font-bold text-[10px]">{patient.clinicalFlags.glp1 ? 'BLOQUEO MAG.' : 'INACTIVO'}</span>
                                                </div>
                                                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${patient.clinicalFlags.mets ? 'border-rose-500/20 bg-rose-500/5 text-rose-400' : 'opacity-40 border-zinc-800'}`}>
                                                    <span>Filtro de Síndrome Metabólico</span>
                                                    <span className="font-bold text-[10px]">{patient.clinicalFlags.mets ? 'PROTECCIÓN' : 'INACTIVO'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Patient-Reported Outcomes (PROMs) */}
                        <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-indigo-55/40 border-indigo-100' : 'bg-indigo-950/20 border-indigo-900/30'}`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${isClinical ? 'text-indigo-800' : 'text-indigo-400'}`}>
                                <FileText size={16} /> Patient-Reported Outcomes
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className={`text-xs mb-1 font-bold ${isClinical ? 'text-indigo-600/70' : 'text-indigo-400/70'}`}>Energía Matutina (Últimos 7 días)</div>
                                    <div className="flex gap-1">
                                        {[1,2,3,4,5,6,7].map(d => (
                                            <div key={d} className={`h-8 flex-1 rounded-md ${d > 2 ? 'bg-indigo-500' : 'bg-indigo-200'} ${isClinical ? '' : 'opacity-80'}`} />
                                        ))}
                                    </div>
                                    <p className={`text-[10px] mt-2 font-medium ${isClinical ? 'text-indigo-800' : 'text-indigo-300'}`}>Mejora sustancial tras ajuste de crononutrición.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLS: OPERATIONAL DIET & ALERTS */}
                    <div className="lg:col-span-8 space-y-6">
                        {!patient.nutrition ? (
                            <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                    <Utensils size={16} /> Protocolo Nutricional Operativo
                                </h3>
                                <p className="text-sm text-zinc-500 italic">No hay un plan nutricional activo.</p>
                                <button 
                                    onClick={() => navigate('/dietqa')}
                                    className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-indigo-500 hover:bg-[#b0d600] text-black'}`}
                                >
                                    CREAR PLAN NUTRICIONAL
                                </button>
                            </div>
                        ) : (
                        <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                    <Utensils size={16} /> Protocolo Nutricional Operativo
                                </h3>
                                
                                {isEditing ? (
                                    <button 
                                        onClick={saveEdits}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-indigo-500 text-black hover:bg-[#b0d600]'}`}
                                    >
                                        <Save size={12} /> GUARDAR CAMBIOS
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => navigate('/dietqa')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
                                    >
                                        ABRIR DIETQA BUILDER
                                    </button>
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div 
                                        key="editing-diet"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-4 gap-4"
                                    >
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1">Calorías (kcal)</label>
                                            <input 
                                                type="number"
                                                value={editCalories}
                                                onChange={(e) => setEditCalories(Number(e.target.value))}
                                                className={`w-full p-3 rounded-2xl border text-center font-mono font-black text-lg ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-850'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1">Proteínas (g)</label>
                                            <input 
                                                type="number"
                                                value={editProtein}
                                                onChange={(e) => setEditProtein(Number(e.target.value))}
                                                className={`w-full p-3 rounded-2xl border text-center font-mono font-black text-lg ${isClinical ? 'bg-blue-50/50 border-blue-100 text-blue-900' : 'bg-zinc-950 border-zinc-850 text-blue-300'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1">Carbos (g)</label>
                                            <input 
                                                type="number"
                                                value={editCarbs}
                                                onChange={(e) => setEditCarbs(Number(e.target.value))}
                                                className={`w-full p-3 rounded-2xl border text-center font-mono font-black text-lg ${isClinical ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-zinc-950 border-zinc-850 text-emerald-300'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1">Grasas (g)</label>
                                            <input 
                                                type="number"
                                                value={editFats}
                                                onChange={(e) => setEditFats(Number(e.target.value))}
                                                className={`w-full p-3 rounded-2xl border text-center font-mono font-black text-lg ${isClinical ? 'bg-amber-50/50 border-amber-100 text-amber-900' : 'bg-zinc-950 border-zinc-850 text-amber-300'}`}
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="view-diet"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid grid-cols-4 gap-4 text-center"
                                    >
                                        <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-zinc-950 border-zinc-850'}`}>
                                            <div className={`text-xs uppercase tracking-widest font-bold mb-2 ${isClinical ? 'text-slate-400' : 'text-zinc-550'}`}>Calorías</div>
                                            <div className={`text-2xl font-black ${isClinical ? 'text-slate-800' : 'text-white'}`}>{patient.nutrition?.macros?.calories || 0}</div>
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-blue-50 border-blue-100' : 'bg-blue-950/30 border-blue-900/50'}`}>
                                            <div className={`text-xs uppercase tracking-widest font-bold mb-2 ${isClinical ? 'text-blue-500' : 'text-blue-400'}`}>Proteína</div>
                                            <div className={`text-2xl font-black ${isClinical ? 'text-blue-900' : 'text-blue-300'}`}>{patient.nutrition?.macros?.protein || 0}g</div>
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/30 border-emerald-900/50'}`}>
                                            <div className={`text-xs uppercase tracking-widest font-bold mb-2 ${isClinical ? 'text-emerald-500' : 'text-emerald-400'}`}>Carbos</div>
                                            <div className={`text-2xl font-black ${isClinical ? 'text-emerald-900' : 'text-emerald-300'}`}>{patient.nutrition?.macros?.carbs || 0}g</div>
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-amber-50 border-amber-100' : 'bg-amber-950/30 border-amber-900/50'}`}>
                                            <div className={`text-xs uppercase tracking-widest font-bold mb-2 ${isClinical ? 'text-amber-500' : 'text-amber-400'}`}>Grasas</div>
                                            <div className={`text-2xl font-black ${isClinical ? 'text-amber-900' : 'text-amber-300'}`}>{patient.nutrition?.macros?.fats || 0}g</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        )}

                        {/* Balance de Nutrientes (Nutrient Balance) */}
                        <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${isClinical ? 'text-slate-400' : 'text-zinc-555'}`}>
                                <Utensils size={16} /> Balance de Nutrientes
                            </h3>
                            <div className="h-[250px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                                        { subject: 'Proteína', A: Math.min(120, ((patient?.protein || 140) / 150) * 100), fullMark: 100 },
                                        { subject: 'Carbos', A: Math.min(120, ((patient?.carbs || 160) / 200) * 100), fullMark: 100 },
                                        { subject: 'Grasas', A: Math.min(120, ((patient?.fats || 60) / 70) * 100), fullMark: 100 },
                                        { subject: 'Fibra', A: patient?.clinicalFlags?.low_fodmap ? 60 : 85, fullMark: 100 },
                                        { subject: 'Agua', A: 90, fullMark: 100 }
                                    ]}>
                                        <PolarGrid stroke={isClinical ? "#e2e8f0" : "rgba(255,255,255,0.1)"} />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: isClinical ? '#64748b' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }}
                                        />
                                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Objetivo"
                                            dataKey="A"
                                            stroke={isClinical ? "#10b981" : "#6366f1"}
                                            strokeWidth={2}
                                            fill={isClinical ? "#10b981" : "#6366f1"}
                                            fillOpacity={0.2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Evolutions */}
                        <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                <Calendar size={16} /> Hitos Clínicos Recientes
                            </h3>
                            <div className="space-y-4">
                                <div className={`p-4 rounded-2xl border-l-4 ${isClinical ? 'bg-slate-50 border-l-slate-400 border-slate-100' : 'bg-zinc-950 border-l-zinc-500 border-zinc-850'}`}>
                                    <div className="flex justify-between mb-2">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Ajuste de Protocolo</span>
                                        <span className={`text-xs font-mono ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>Hace 15 días</span>
                                    </div>
                                    <p className={`text-sm font-medium ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>
                                        Transición a ciclo de carbohidratos. Se reduce carga glucémica en días de descanso para mejorar sensibilidad a la insulina, manteniendo ALMI estable.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: ANALYTICS (CORRELATION CANVAS) */}
            {activeTab === 'ANALYTICS' && (
                <div className={`p-6 rounded-3xl border shadow-sm animate-in fade-in duration-300 ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    
                    {/* Graph Controls */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button 
                            onClick={() => setShowAdherence(!showAdherence)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                                showAdherence ? (isClinical ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400') 
                                : (isClinical ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 opacity-50')
                            }`}
                        >
                            {showAdherence ? <Eye size={14} /> : <EyeOff size={14} />} Adherencia (Semáforo)
                        </button>
                        <button 
                            onClick={() => setShowWeight(!showWeight)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                                showWeight ? (isClinical ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400') 
                                : (isClinical ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 opacity-50')
                            }`}
                        >
                            {showWeight ? <Eye size={14} /> : <EyeOff size={14} />} Peso (Tendencia WMA)
                        </button>
                        <button 
                            onClick={() => setShowSleep(!showSleep)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                                showSleep ? (isClinical ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-purple-500/10 border-purple-500/30 text-purple-400') 
                                : (isClinical ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 opacity-50')
                            }`}
                        >
                            {showSleep ? <Eye size={14} /> : <EyeOff size={14} />} Sueño Profundo
                        </button>
                        <button 
                            onClick={() => setShowAlmi(!showAlmi)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                                showAlmi ? (isClinical ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400') 
                                : (isClinical ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 opacity-50')
                            }`}
                        >
                            {showAlmi ? <Eye size={14} /> : <EyeOff size={14} />} ALMI (Masa Magra)
                        </button>
                        <button 
                            onClick={() => setShowTir(!showTir)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all ${
                                showTir ? (isClinical ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/30 text-amber-400') 
                                : (isClinical ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-50' : 'bg-zinc-900 border-zinc-400 opacity-50')
                            }`}
                        >
                            {showTir ? <Eye size={14} /> : <EyeOff size={14} />} TIR Glucosa
                        </button>
                    </div>

                    <div className="h-[500px] w-full mt-4 relative">
                        {filteredData.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">
                                Sin datos en el periodo seleccionado
                            </div>
                        )}
                        
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isClinical ? "#f1f5f9" : "#27272a"} />
                                <XAxis 
                                    dataKey="displayDate" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: isClinical ? '#94a3b8' : '#71717a' }} 
                                    minTickGap={30}
                                />
                                <YAxis 
                                    yAxisId="weight" 
                                    orientation="left" 
                                    domain={['dataMin - 2', 'dataMax + 2']} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: isClinical ? '#6366f1' : '#818cf8' }} 
                                    hide={!showWeight}
                                />
                                <YAxis 
                                    yAxisId="cals" 
                                    orientation="right" 
                                    domain={[0, 3000]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: isClinical ? '#10b981' : '#6366f1' }} 
                                    hide={!showAdherence}
                                />
                                <YAxis 
                                    yAxisId="sleep" 
                                    orientation="right" 
                                    domain={[0, 4]} 
                                    hide={true} 
                                />
                                <YAxis 
                                    yAxisId="almi" 
                                    orientation="right" 
                                    domain={['dataMin - 0.5', 'dataMax + 0.5']} 
                                    hide={true} 
                                />
                                <YAxis 
                                    yAxisId="tir" 
                                    orientation="right" 
                                    domain={[50, 100]} 
                                    hide={true} 
                                />

                                <Tooltip content={<CustomTooltip />} cursor={{ fill: isClinical ? '#f8fafc' : '#18181b', opacity: 0.5 }} />

                                {showAdherence && <Bar yAxisId="cals" dataKey="in_range" stackId="a" fill={isClinical ? "#10b981" : "#6366f1"} opacity={0.8} barSize={timeRange === 'YTD' || timeRange === '6M' ? 2 : 10} />}
                                {showAdherence && <Bar yAxisId="cals" dataKey="deficit" stackId="a" fill="#fbbf24" opacity={0.8} />}
                                {showAdherence && <Bar yAxisId="cals" dataKey="excess" stackId="a" fill={isClinical ? "#f43f5e" : "#e11d48"} opacity={0.8} />}

                                {showWeight && (
                                    <Area 
                                        yAxisId="weight" 
                                        type="monotone" 
                                        dataKey="rawWeight" 
                                        fill="none" 
                                        stroke={isClinical ? "#cbd5e1" : "#3f3f46"} 
                                        strokeWidth={1} 
                                        opacity={0.5} 
                                        dot={false}
                                        activeDot={false}
                                    />
                                )}
                                {showWeight && (
                                    <Line 
                                        yAxisId="weight" 
                                        type="monotone" 
                                        dataKey="wmaWeight" 
                                        stroke={isClinical ? "#6366f1" : "#818cf8"} 
                                        strokeWidth={3} 
                                        dot={false} 
                                        activeDot={{ r: 6, fill: isClinical ? "#6366f1" : "#818cf8", stroke: "#fff", strokeWidth: 2 }}
                                    />
                                )}

                                {showSleep && (
                                    <Line 
                                        yAxisId="sleep" 
                                        type="stepAfter" 
                                        dataKey="deepSleep" 
                                        stroke={isClinical ? "#a855f7" : "#c084fc"} 
                                        strokeWidth={2} 
                                        dot={false}
                                        strokeDasharray="4 4"
                                    />
                                )}

                                {showAlmi && (
                                    <Line 
                                        yAxisId="almi" 
                                        type="monotone" 
                                        dataKey="almi" 
                                        stroke={isClinical ? "#06b6d4" : "#22d3ee"} 
                                        strokeWidth={3} 
                                        dot={false}
                                    />
                                )}

                                {showTir && (
                                    <Line 
                                        yAxisId="tir" 
                                        type="monotone" 
                                        dataKey="tir" 
                                        stroke={isClinical ? "#f59e0b" : "#fbbf24"} 
                                        strokeWidth={2} 
                                        dot={false}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={`mt-4 pt-4 border-t flex justify-between items-center text-xs font-bold uppercase tracking-widest ${isClinical ? 'border-slate-100 text-slate-400' : 'border-zinc-800 text-zinc-400'}`}>
                        <span>Lienzo de Correlación Activo</span>
                        <span className="flex items-center gap-2"><BrainCircuit size={14} /> Reconocimiento de Patrones: Activado</span>
                    </div>
                </div>
            )}

            {/* FRICCION POSITIVA OVERLAY MODAL */}
            <AnimatePresence>
                {showFrictionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowFrictionModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className={`relative w-full max-w-md rounded-3xl border p-6 shadow-2xl z-10 ${
                                isClinical ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-white'
                            }`}
                        >
                            <div className="flex items-start gap-3 mb-4 text-rose-500">
                                <AlertTriangle size={24} className="shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Confirmar Anulación Médica</h3>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Fricción de Seguridad B2B</span>
                                </div>
                            </div>
                            
                            <p className="text-xs opacity-75 mb-6 leading-relaxed">
                                Desactivar el escudo **GLP-1 Active Mode** anulará el Bloqueo Magnético de seguridad. Esto permitirá configurar ayunos agresivos y comidas espaciadas que incrementan severamente el riesgo de la **Paradoja Hipoglucémica** en el paciente.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setEditGlp1(true); // Keep it active
                                        setShowFrictionModal(false);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold ${
                                        isClinical ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                                    }`}
                                >
                                    Mantener Escudo
                                </button>
                                <button
                                    onClick={confirmMedicalOverride}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
                                >
                                    Confirmar Desactivación
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Biometric Log Modal (ISAK Standard) */}
            <BiometricLogModal 
                isOpen={isLogMetricsOpen}
                onClose={() => setIsLogMetricsOpen(false)}
                patient={patient}
                isClinical={isClinical}
                onSave={(data) => {
                    setEditWeight(data.weight);
                    setEditWaist(data.waist);
                    
                    setTelemetry(prev => {
                        const newTelem = [...prev];
                        if (newTelem.length > 0) {
                            newTelem[0] = {
                                ...newTelem[0],
                                rawWeight: data.weight,
                                wmaWeight: data.weight,
                            };
                        }
                        return newTelem;
                    });
                }}
            />
        </div>
    );
};

export default PatientDetailView;

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, User, Calendar, AlertCircle, Search, Grid, List,
    CheckCircle2, AlertTriangle, Send, Activity, Shield,
    SlidersHorizontal, ArrowUpDown, Bluetooth, Check, X,
    Lock, Sparkles, RefreshCw, Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { PatientDetailView } from '../drilldown/PatientDetailView';
import { useAthletes } from '../../hooks/queries/useAthletes';
import toast from 'react-hot-toast';
import { TrainerRoster } from './TrainerRoster';
import { useRBAC } from '../../context/RBACContext';

// =============================================================================
// TYPES
// =============================================================================
interface Patient {
    id: string;
    full_name: string;
    email?: string;
    age: number;
    weight: number;
    height?: number;
    waist?: number;
    tmb?: number;
    goal?: string;
    macrosCompliance: number;
    lastCheckIn: string;
    status: 'active' | 'warning' | 'inactive';
    created_at: string;
    operationalStreak: boolean[];
    clinicalFlags: {
        low_fodmap: boolean;
        glp1: boolean;
        mets: boolean;
    };
    telemetrySync: boolean;
    lastTelemetrySync?: string;
    isEphemeral?: boolean;
}

// =============================================================================
// HIGH FIDELITY MOCK DATA
// =============================================================================
const MOCK_PATIENTS: Patient[] = [
    {
        id: 'mock-1',
        full_name: 'Laura Martinez',
        email: 'laura.m@email.com',
        age: 35,
        weight: 68.2,
        height: 165,
        waist: 88, // MetS risk for female (>85)
        tmb: 1420,
        goal: 'Low Carb + Ozempic',
        macrosCompliance: 92,
        lastCheckIn: 'Hace 2h',
        status: 'active',
        created_at: '2026-04-10T10:00:00Z',
        operationalStreak: [true, true, true, true, true, true, true],
        clinicalFlags: { low_fodmap: false, glp1: true, mets: true },
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
        waist: 104, // MetS risk for male (>90)
        tmb: 1850,
        goal: 'Keto + FODMAP Shield',
        macrosCompliance: 42,
        lastCheckIn: 'Hace 3d',
        status: 'warning',
        created_at: '2026-03-15T14:30:00Z',
        operationalStreak: [true, false, false, false, false, false, false],
        clinicalFlags: { low_fodmap: true, glp1: false, mets: true },
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
        lastCheckIn: 'Hace 1h',
        status: 'active',
        created_at: '2026-05-01T08:15:00Z',
        operationalStreak: [true, true, true, true, true, true, true],
        clinicalFlags: { low_fodmap: false, glp1: false, mets: false },
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
        lastCheckIn: 'Hace 12h',
        status: 'active',
        created_at: '2026-04-20T11:00:00Z',
        operationalStreak: [true, true, true, true, false, true, true],
        clinicalFlags: { low_fodmap: false, glp1: false, mets: false },
        telemetrySync: false, // Wearable Disconnected (>48h)
        lastTelemetrySync: 'Hace 3d'
    },
    {
        id: 'mock-5',
        full_name: 'Sofia Ortiz',
        email: 'sofia.ortiz@gmail.com',
        age: 42,
        weight: 74.8,
        height: 160,
        waist: 92, // MetS risk (>85)
        tmb: 1490,
        goal: 'Low-FODMAP Clean',
        macrosCompliance: 35,
        lastCheckIn: 'Hace 5d',
        status: 'inactive',
        created_at: '2026-02-10T09:20:00Z',
        operationalStreak: [false, false, false, false, false, false, false],
        clinicalFlags: { low_fodmap: true, glp1: false, mets: true },
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
        waist: 101, // MetS risk (>90)
        tmb: 1750,
        goal: 'Ozempic + Low-FODMAP',
        macrosCompliance: 78,
        lastCheckIn: 'Hace 1d',
        status: 'warning',
        created_at: '2026-05-12T16:45:00Z',
        operationalStreak: [true, true, false, true, false, false, true],
        clinicalFlags: { low_fodmap: true, glp1: true, mets: true },
        telemetrySync: false, // Wearable Disconnected (>48h)
        lastTelemetrySync: 'Hace 4d'
    }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const PatientList: React.FC = () => {
    const { token } = useAuth();
    const { mode } = useTheme();
    const { lang } = useLanguage();
    const { activeWorkspace } = useRBAC();
    const isClinical = mode === 'CLINICAL' || activeWorkspace === 'CLINICAL';

    if (activeWorkspace === 'PT') {
        return <TrainerRoster />;
    }

    // State
    const [dbPatients, setDbPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    // Layout view state
    const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

    // Filter & Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [triageFilter, setTriageFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
    const [shieldFilter, setShieldFilter] = useState<'all' | 'low_fodmap' | 'glp1' | 'mets' | 'disconnected'>('all');
    const [sortBy, setSortBy] = useState<'compliance' | 'age' | 'weight' | 'name'>('compliance');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Selection & Bulk Actions
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isNudgeOpen, setIsNudgeOpen] = useState(false);
    const [nudgeMessage, setNudgeMessage] = useState(
        'He notado que esta semana ha sido difícil. Recuerda que la constancia es mejor que la perfección. ¿Necesitas que ajustemos el menú?'
    );
    const [isSendingNudge, setIsSendingNudge] = useState(false);

    // Haptic snap feedback animation trigger
    const [snapActive, setSnapActive] = useState(false);

    // React Query
    const { data: fetchedPatients, isLoading: queryLoading, isError, error: queryError } = useAthletes();

    useEffect(() => {
        setIsLoading(queryLoading);
        if (isError) {
            console.warn('API error, using mockup fallback', queryError);
            setError('Servidor no disponible. Usando respaldo de demostración local.');
            setDbPatients([]);
            return;
        }
        
        if (fetchedPatients) {
            try {
                // Map database patients to structured Patient model
                const mapped: Patient[] = fetchedPatients.map((p: any) => {
                    const goalStr = p.goal || '';
                    const isLowFodmap = goalStr.includes('Low-FODMAP: True') || goalStr.includes('FODMAP');
                    const isGlp1 = goalStr.includes('GLP-1 Mode: True') || goalStr.includes('Ozempic') || goalStr.includes('GLP-1');
                    const waistVal = p.waist || 85;
                    const metsRisk = waistVal > 90; // general simplified threshold

                    // Deterministic macros compliance calculation
                    const idInt = parseInt(p.id.replace(/\D/g, '') || '0');
                    const macrosCompliance = (idInt % 45) + 50; // deterministic random 50-95%

                    return {
                        id: p.id,
                        full_name: p.full_name || p.first_name + ' ' + p.last_name,
                        email: p.email || 'paciente@aurea.clinic',
                        age: p.age || 30,
                        weight: p.weight || 70,
                        height: p.height || 170,
                        waist: p.waist || 80,
                        tmb: Math.round(10 * p.weight + 6.25 * (p.height || 170) - 5 * p.age + 5),
                        goal: p.goal || 'Personalizado',
                        macrosCompliance,
                        lastCheckIn: 'Hoy',
                        status: macrosCompliance >= 85 ? 'active' : (macrosCompliance >= 50 ? 'warning' : 'inactive'),
                        created_at: p.created_at || new Date().toISOString(),
                        operationalStreak: [true, true, true, macrosCompliance > 60, macrosCompliance > 70, true, macrosCompliance > 50],
                        clinicalFlags: {
                            low_fodmap: isLowFodmap,
                            glp1: isGlp1,
                            mets: metsRisk
                        },
                        telemetrySync: true,
                        lastTelemetrySync: 'Hace 10 min'
                    };
                });
                setDbPatients(mapped);
                setError(null);
            } catch (err) {
                console.warn('Mapping error', err);
                setDbPatients([]);
            }
        }
    }, [fetchedPatients, queryLoading, isError, queryError]);

    // Handle filter switch with visual "Haptic Snap" and hardware vibration if available
    const triggerHapticSnap = (updateFn: () => void) => {
        if (navigator.vibrate) {
            navigator.vibrate(12);
        }
        setSnapActive(true);
        updateFn();
        setTimeout(() => setSnapActive(false), 200);
    };

    // Formulate final combined patients list (ephemeral demo + database + mockups)
    const combinedPatients = useMemo(() => {
        const list = [...dbPatients];

        // 🛡️ EPHEMERAL HYDRATION (Bypass SQL - PLG Conversion Hook)
        const ephemeralPatientRaw = localStorage.getItem('ephemeral_patient_demo');
        if (ephemeralPatientRaw) {
            try {
                const ep = JSON.parse(ephemeralPatientRaw);
                const isLowFodmap = ep.clinical_flags?.low_fodmap_active || false;
                const isGlp1 = ep.clinical_flags?.glp1_safety_mode || false;
                const waistVal = ep.waist || 85;
                const metsRisk = waistVal > (ep.gender === 'female' ? 85 : 90);

                const epPatient: Patient = {
                    id: 'ephemeral-demo',
                    full_name: ep.patient_name || 'Paciente Demo Onboarding',
                    email: ep.email || 'demo.cliente.cero@aurea.clinic',
                    age: ep.age || 32,
                    weight: ep.weight || 82.5,
                    height: ep.height || 172,
                    waist: waistVal,
                    tmb: ep.tmb || 1650,
                    goal: ep.archetype_label || 'Plan Personalizado',
                    macrosCompliance: 88, // Inicia verde estable
                    lastCheckIn: 'Recién Ingresado',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    operationalStreak: [true, true, true, true, true, true, false],
                    clinicalFlags: {
                        low_fodmap: isLowFodmap,
                        glp1: isGlp1,
                        mets: metsRisk
                    },
                    telemetrySync: true,
                    lastTelemetrySync: 'Hace 1 min',
                    isEphemeral: true
                };

                // Avoid duplicating the ephemeral patient if already loaded
                if (!list.some(p => p.id === 'ephemeral-demo')) {
                    list.unshift(epPatient);
                }
            } catch (err) {
                console.error('Error parsing ephemeral patient from storage', err);
            }
        }

        // Hydrate mock data if list is short to ensure premium B2B density
        const mocksToAdd = MOCK_PATIENTS.filter(mock => !list.some(p => p.full_name.toLowerCase() === mock.full_name.toLowerCase()));
        return [...list, ...mocksToAdd];
    }, [dbPatients]);

    // Filtering & Sorting Process
    const processedPatients = useMemo(() => {
        let results = [...combinedPatients];

        // Search Filter
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                p => p.full_name.toLowerCase().includes(query) || (p.email && p.email.toLowerCase().includes(query))
            );
        }

        // Triage Status Filter
        if (triageFilter === 'red') {
            results = results.filter(p => p.macrosCompliance < 50);
        } else if (triageFilter === 'yellow') {
            results = results.filter(p => p.macrosCompliance >= 50 && p.macrosCompliance < 85);
        } else if (triageFilter === 'green') {
            results = results.filter(p => p.macrosCompliance >= 85);
        }

        // Shields & Safeguards Filter
        if (shieldFilter === 'low_fodmap') {
            results = results.filter(p => p.clinicalFlags.low_fodmap);
        } else if (shieldFilter === 'glp1') {
            results = results.filter(p => p.clinicalFlags.glp1);
        } else if (shieldFilter === 'mets') {
            results = results.filter(p => p.clinicalFlags.mets);
        } else if (shieldFilter === 'disconnected') {
            results = results.filter(p => !p.telemetrySync);
        }

        // Sorting
        results.sort((a, b) => {
            let fieldA: any = a.macrosCompliance;
            let fieldB: any = b.macrosCompliance;

            if (sortBy === 'age') {
                fieldA = a.age;
                fieldB = b.age;
            } else if (sortBy === 'weight') {
                fieldA = a.weight;
                fieldB = b.weight;
            } else if (sortBy === 'name') {
                fieldA = a.full_name.toLowerCase();
                fieldB = b.full_name.toLowerCase();
            }

            if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
            if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return results;
    }, [combinedPatients, searchQuery, triageFilter, shieldFilter, sortBy, sortOrder]);

    // Handle single selection
    const handleSelectPatient = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Select all displayed patients
    const handleSelectAll = () => {
        if (selectedIds.length === processedPatients.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(processedPatients.map(p => p.id));
        }
    };

    // Bulk nudge trigger
    const sendBulkNudges = () => {
        setIsSendingNudge(true);
        setTimeout(() => {
            setIsSendingNudge(false);
            setIsNudgeOpen(false);
            const count = selectedIds.length;
            setSelectedIds([]);
            toast.success(`Nudge conductual multidifundido a ${count} pacientes vía WhatsApp y Email con éxito.`);
        }, 1500);
    };

    // Single simulated nudge
    const handleSingleNudge = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: `Preparando mensaje de motivación para ${name}...`,
                success: `Mensaje de motivación enviado a ${name} vía WhatsApp.`,
                error: 'Error de red.'
            }
        );
    };

    // Handle prompt to reconnect wearable
    const handleWearableReconnectPrompt = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: `Creando enlace de calibración para ${name}...`,
                success: `Notificación de re-sincronización Wearable enviada a ${name}.`,
                error: 'Fallo al enviar notificación.'
            }
        );
    };

    if (selectedPatientId) {
        return <PatientDetailView patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} />;
    }

    return (
        <div className={`min-h-screen p-4 md:p-6 lg:p-8 font-sans transition-colors duration-1000 pb-36 ${isClinical ? 'text-slate-800 bg-[#F2F4F6]' : 'text-white bg-[var(--color-adrenaline-bg)]'}`}>

            {/* HEADER */}
            <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase border ${isClinical
                            ? 'bg-white border-slate-200 text-slate-500'
                            : 'bg-white/5 border-white/10 text-zinc-400'
                            }`}>Roster Clínico Completo</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isClinical ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-500 text-black'}`}>
                            {processedPatients.length} Activos
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                        Pacientes Totales
                    </h1>
                </div>

                {/* SEARCH & DISPLAY TOGGLE */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`} />
                        <input
                            type="text"
                            placeholder="Buscar paciente por nombre o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 rounded-2xl border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isClinical
                                ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
                                : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600'
                                }`}
                        />
                    </div>

                    {/* View Switcher */}
                    <div className={`p-1 rounded-2xl flex border ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <button
                            onClick={() => setLayoutMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${layoutMode === 'grid'
                                ? (isClinical ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-white/10 text-white')
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setLayoutMode('list')}
                            className={`p-2.5 rounded-xl transition-all ${layoutMode === 'list'
                                ? (isClinical ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-white/10 text-white')
                                : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ERROR NOTICE */}
            {error && (
                <div className="mb-6 p-4 rounded-2xl border bg-yellow-500/10 border-yellow-500/20 text-yellow-500 text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertTriangle size={18} /> {error}</span>
                </div>
            )}

            {/* FILTERS TOOLBAR */}
            <div className={`mb-6 p-4 rounded-3xl border flex flex-col gap-4 ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                {/* Triage & Shields */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Triage Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
                            <SlidersHorizontal size={12} /> Triage:
                        </span>
                        {(['all', 'red', 'yellow', 'green'] as const).map((tVal) => {
                            const labels = { all: 'Todos', red: 'Rojo (Alerta)', yellow: 'Amarillo (Cola)', green: 'Verde (Estable)' };
                            const isActive = triageFilter === tVal;
                            return (
                                <button
                                    key={tVal}
                                    onClick={() => triggerHapticSnap(() => setTriageFilter(tVal))}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${isActive
                                        ? (isClinical ? 'bg-slate-900 text-white shadow-sm border-slate-900' : 'bg-[var(--color-action-primary)] text-black border-[var(--color-action-primary)]')
                                        : (isClinical ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800')
                                        }`}
                                >
                                    {labels[tVal]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Shields Selector */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
                            <Shield size={12} /> Escudos Clínicos:
                        </span>
                        {(['all', 'low_fodmap', 'glp1', 'mets', 'disconnected'] as const).map((sVal) => {
                            const labels = {
                                all: 'Cualquiera',
                                low_fodmap: 'Low-FODMAP',
                                glp1: 'Ozempic / GLP-1',
                                mets: 'Riesgo MetS',
                                disconnected: 'Falla Wearable'
                            };
                            const isActive = shieldFilter === sVal;
                            return (
                                <button
                                    key={sVal}
                                    onClick={() => triggerHapticSnap(() => setShieldFilter(sVal))}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${isActive
                                        ? (isClinical ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-[0_0_10px_rgba(16,185,129,0.1)]')
                                        : (isClinical ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800')
                                        }`}
                                >
                                    {labels[sVal]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Divider */}
                <div className={`h-px w-full ${isClinical ? 'bg-slate-100' : 'bg-zinc-800'}`} />

                {/* Sorters */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
                            <ArrowUpDown size={12} /> Ordenar por:
                        </span>
                        {(['compliance', 'age', 'weight', 'name'] as const).map((sortVal) => {
                            const labels = { compliance: 'Adherencia', age: 'Edad', weight: 'Peso', name: 'Nombre' };
                            const isActive = sortBy === sortVal;
                            return (
                                <button
                                    key={sortVal}
                                    onClick={() => {
                                        if (sortBy === sortVal) {
                                            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortBy(sortVal);
                                            setSortOrder('desc');
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${isActive
                                        ? (isClinical ? 'text-slate-900 border-slate-300 bg-slate-100' : 'text-indigo-400 border-zinc-700 bg-zinc-800')
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                        }`}
                                >
                                    {labels[sortVal]}
                                    {isActive && (sortOrder === 'asc' ? '↑' : '↓')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bulk Selection Box Trigger */}
                    {processedPatients.length > 0 && (
                        <button
                            onClick={handleSelectAll}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${isClinical
                                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                                }`}
                        >
                            {selectedIds.length === processedPatients.length ? 'Deseleccionar Todo' : 'Seleccionar Todo en Pantalla'}
                        </button>
                    )}
                </div>
            </div>

            {/* LIST ENGINE (GRID VS LIST) */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${triageFilter}-${shieldFilter}-${layoutMode}`}
                    animate={snapActive ? { scale: [1, 0.98, 1.01, 1], rotate: [0, -0.1, 0.1, 0] } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                >
                    {processedPatients.length === 0 ? (
                        <div className={`p-16 text-center border border-dashed rounded-3xl ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900/40 border-zinc-800'}`}>
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-zinc-500">
                                <Search size={28} />
                            </div>
                            <h3 className="text-lg font-bold mb-1">Ningún paciente coincide con los filtros</h3>
                            <p className="text-sm opacity-60 max-w-sm mx-auto">Prueba limpiando los filtros seleccionados o ingresando un término de búsqueda diferente.</p>
                        </div>
                    ) : layoutMode === 'grid' ? (
                        /* GRID VIEW */
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {processedPatients.map((patient) => {
                                const hasLowFodmap = patient.clinicalFlags.low_fodmap;
                                const hasGlp1 = patient.clinicalFlags.glp1;
                                const hasMets = patient.clinicalFlags.mets;
                                const isDisconnected = !patient.telemetrySync;

                                // Card conditional styling for glowing protection locks
                                const isGlp1FilterActive = shieldFilter === 'glp1';
                                const isLowFodmapFilterActive = shieldFilter === 'low_fodmap';
                                const shouldGlow = (hasGlp1 && isGlp1FilterActive) || (hasLowFodmap && isLowFodmapFilterActive);

                                const isSelected = selectedIds.includes(patient.id);

                                return (
                                    <div
                                        key={patient.id}
                                        onClick={() => setSelectedPatientId(patient.id)}
                                        className={`group relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer ${isClinical
                                            ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300'
                                            : 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-950 hover:border-zinc-700 shadow-md hover:shadow-2xl'
                                            } ${shouldGlow
                                                ? (isClinical ? 'ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'ring-2 ring-indigo-500/50 shadow-[0_0_20px_rgba(206,255,0,0.15)]')
                                                : ''
                                            } ${isDisconnected ? 'opacity-80 hover:opacity-100' : ''}`}
                                    >
                                        {/* Selection Checkbox */}
                                        <button
                                            onClick={(e) => handleSelectPatient(patient.id, e)}
                                            className={`absolute top-4 left-4 z-10 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${isSelected
                                                ? (isClinical ? 'bg-slate-900 border-slate-900 text-white' : 'bg-indigo-500 border-indigo-500 text-black')
                                                : (isClinical ? 'border-slate-300 bg-slate-50 hover:border-slate-400' : 'border-zinc-750 bg-zinc-900 hover:border-zinc-600')
                                                }`}
                                        >
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                        </button>

                                        {/* Top Header Card */}
                                        <div className="flex justify-between items-start mb-4 pl-6">
                                            <div>
                                                <h3 className="font-extrabold text-lg flex items-center gap-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                                                    {patient.full_name}
                                                    {patient.isEphemeral && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                            NUEVO DEMO
                                                        </span>
                                                    )}
                                                </h3>
                                                <span className="text-xs opacity-50 block truncate max-w-[200px]">{patient.email}</span>
                                            </div>

                                            {/* Status Dot */}
                                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${patient.status === 'active'
                                                ? (isClinical ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400')
                                                : patient.status === 'warning'
                                                    ? (isClinical ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')
                                                    : (isClinical ? 'bg-red-50 border-red-100 text-red-700' : 'bg-red-500/10 border-red-500/20 text-red-400')
                                                }`}>
                                                {patient.macrosCompliance}% OK
                                            </span>
                                        </div>

                                        {/* Exclusions Badges */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {hasLowFodmap && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-500">
                                                    🛡️ Low-FODMAP
                                                </span>
                                            )}
                                            {hasGlp1 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                                    ⚠️ GLP-1 Active
                                                </span>
                                            )}
                                            {hasMets && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                                    🫀 MetS Risk
                                                </span>
                                            )}
                                            {isDisconnected && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-zinc-500/10 border border-zinc-500/25 text-zinc-400 animate-pulse">
                                                    <Bluetooth size={10} /> Disconnected
                                                </span>
                                            )}
                                        </div>

                                        {/* Physical Stats Grid */}
                                        <div className={`grid grid-cols-3 gap-2 p-3 rounded-2xl mb-4 ${isClinical ? 'bg-slate-50' : 'bg-zinc-900/60'}`}>
                                            <div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 block">Edad</span>
                                                <span className="text-sm font-black font-mono">{patient.age}a</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 block">Peso</span>
                                                <span className="text-sm font-black font-mono">{patient.weight}kg</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 block">TMB (Mifflin)</span>
                                                <span className="text-xs font-black font-mono text-indigo-500 dark:text-indigo-400">{patient.tmb || 1500} kcal</span>
                                            </div>
                                        </div>

                                        {/* Adherence Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs font-bold mb-1.5 opacity-80">
                                                <span>Adherencia Nutricional (7d)</span>
                                                <span>{patient.macrosCompliance}%</span>
                                            </div>
                                            <div className={`h-2 w-full rounded-full overflow-hidden flex ${isClinical ? 'bg-slate-100' : 'bg-zinc-800'}`}>
                                                <div
                                                    style={{ width: `${patient.macrosCompliance}%` }}
                                                    className={`h-full rounded-full ${patient.macrosCompliance >= 85
                                                        ? 'bg-emerald-500'
                                                        : patient.macrosCompliance >= 50
                                                            ? 'bg-amber-500'
                                                            : 'bg-rose-500'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Operational Streak & Telemetry Out (Ghost Tech) */}
                                        <div className={`pt-4 border-t flex items-center justify-between ${isClinical ? 'border-slate-100' : 'border-zinc-800'}`}>
                                            <div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 block mb-1">Racha Operacional (7d)</span>
                                                {isDisconnected ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                                                        <AlertTriangle size={14} className="shrink-0 animate-bounce" />
                                                        <span>Falla de Telemetría ({patient.lastTelemetrySync})</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1">
                                                        {patient.operationalStreak.map((ok, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${ok
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                                                                    }`}
                                                            >
                                                                {ok ? '✓' : '×'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Nudge Trigger */}
                                            {isDisconnected ? (
                                                <button
                                                    onClick={(e) => handleWearableReconnectPrompt(patient.full_name, e)}
                                                    className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1 transition-all"
                                                    title="Nudge Reconnect"
                                                >
                                                    <Bluetooth size={12} />
                                                    Reconectar
                                                </button>
                                            ) : patient.status === 'warning' || patient.status === 'inactive' ? (
                                                <button
                                                    onClick={(e) => handleSingleNudge(patient.full_name, e)}
                                                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border ${isClinical
                                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                                        : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white'
                                                        }`}
                                                    title="Nudge Motivación"
                                                >
                                                    <Send size={11} /> Nudge
                                                </button>
                                            ) : (
                                                <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md flex items-center gap-1">
                                                    <CheckCircle2 size={10} /> Estable
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* TABLE / LIST VIEW */
                        <div className={`overflow-x-auto rounded-3xl border ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-950/40 border-zinc-800'}`}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`border-b text-xs font-black uppercase tracking-widest ${isClinical ? 'border-slate-100 bg-slate-50 text-slate-400' : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'}`}>
                                        <th className="p-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === processedPatients.length}
                                                onChange={handleSelectAll}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="p-4">Paciente</th>
                                        <th className="p-4">Triage</th>
                                        <th className="p-4">Escudos Clínicos</th>
                                        <th className="p-4">TMB / Biométrica</th>
                                        <th className="p-4 text-center">Telemetría</th>
                                        <th className="p-4 text-right">Ficha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedPatients.map((patient) => {
                                        const hasLowFodmap = patient.clinicalFlags.low_fodmap;
                                        const hasGlp1 = patient.clinicalFlags.glp1;
                                        const hasMets = patient.clinicalFlags.mets;
                                        const isDisconnected = !patient.telemetrySync;
                                        const isSelected = selectedIds.includes(patient.id);

                                        return (
                                            <tr
                                                key={patient.id}
                                                onClick={() => setSelectedPatientId(patient.id)}
                                                className={`border-b text-sm transition-colors cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-900/40 ${isClinical ? 'border-slate-100' : 'border-zinc-850'
                                                    } ${isDisconnected ? 'opacity-70' : ''}`}
                                            >
                                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            setSelectedIds(prev =>
                                                                prev.includes(patient.id) ? prev.filter(x => x !== patient.id) : [...prev, patient.id]
                                                            );
                                                        }}
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-extrabold flex items-center gap-2">
                                                        {patient.full_name}
                                                        {patient.isEphemeral && (
                                                            <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">DEMO</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs opacity-50 font-mono">{patient.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${patient.status === 'active' ? 'bg-emerald-500' : patient.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                        <span className="font-bold">{patient.macrosCompliance}% OK</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {hasLowFodmap && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500">🛡️ FODMAP</span>}
                                                        {hasGlp1 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">⚠️ GLP-1</span>}
                                                        {hasMets && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">🫀 MetS</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono text-xs">
                                                    <div>{patient.weight}kg / {patient.age} años</div>
                                                    <div className="opacity-60">{patient.tmb} kcal/día</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {isDisconnected ? (
                                                        <span className="text-rose-500 text-xs font-bold flex items-center justify-center gap-1">
                                                            <Bluetooth size={12} /> Falla ({patient.lastTelemetrySync})
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-500 text-xs font-bold flex items-center justify-center gap-1">
                                                            <Check size={12} /> Sync OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedPatientId(patient.id)}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${isClinical
                                                            ? 'border-slate-200 bg-white hover:bg-slate-50 hover:text-indigo-600'
                                                            : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-indigo-400'
                                                            }`}
                                                    >
                                                        Abrir
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* FLOATING ACTION OVERLAY FOR BULK NUDGES */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0, x: '-50%' }}
                        animate={{ y: 0, opacity: 1, x: '-50%' }}
                        exit={{ y: 80, opacity: 0, x: '-50%' }}
                        className={`fixed bottom-8 left-1/2 z-40 flex items-center gap-4 px-6 py-4 rounded-3xl border shadow-2xl backdrop-blur-xl transition-colors duration-1000 ${isClinical
                            ? 'bg-white/90 border-slate-200 text-slate-800'
                            : 'bg-zinc-900/90 border-zinc-800 text-white'
                            }`}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-black flex items-center gap-1">
                                <Sparkles size={14} className="text-indigo-500 dark:text-indigo-400" />
                                {selectedIds.length} {selectedIds.length === 1 ? 'Paciente seleccionado' : 'Pacientes seleccionados'}
                            </span>
                            <span className="text-[10px] opacity-60">Cola de Gestión de Nutrientes</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsNudgeOpen(true)}
                                className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform ${isClinical
                                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                                    : 'bg-indigo-500 text-black hover:bg-[#b5e000]'
                                    }`}
                            >
                                <Send size={12} />
                                Acción Multidifusión
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className={`px-3 py-2.5 rounded-2xl font-bold text-xs ${isClinical ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
                            >
                                Despejar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* NUDGE MULTIDIFUSIÓN MODAL */}
            <AnimatePresence>
                {isNudgeOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsNudgeOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className={`relative w-full max-w-lg rounded-3xl border p-6 shadow-2xl z-10 ${isClinical
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-zinc-900 border-zinc-800 text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-4 text-indigo-500 dark:text-indigo-400">
                                <Activity size={24} />
                                <h3 className="text-lg font-black tracking-tight">Nudge Conductual Multidifusión</h3>
                            </div>
                            <p className="text-xs opacity-60 mb-4 leading-relaxed">
                                Enviarás un recordatorio clínico personalizado vía **WhatsApp API** y **Email** para incentivar la adherencia a la cola de pacientes seleccionada.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1">Destinatarios ({selectedIds.length})</label>
                                    <div className={`p-3 rounded-2xl max-h-24 overflow-y-auto text-xs flex flex-wrap gap-1.5 border ${isClinical ? 'bg-slate-50 border-slate-100' : 'bg-zinc-950 border-zinc-850'}`}>
                                        {selectedIds.map(id => {
                                            const patient = processedPatients.find(p => p.id === id);
                                            return (
                                                <span key={id} className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                                                    {patient?.full_name || id}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mb-1">Mensaje Empujón Conductual</label>
                                    <textarea
                                        rows={4}
                                        value={nudgeMessage}
                                        onChange={(e) => setNudgeMessage(e.target.value)}
                                        className={`w-full p-3 rounded-2xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-medium leading-relaxed ${isClinical
                                            ? 'bg-white border-slate-200 text-slate-800'
                                            : 'bg-zinc-950 border-zinc-850 text-white'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsNudgeOpen(false)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold ${isClinical ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-zinc-800 text-zinc-400'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={sendBulkNudges}
                                    disabled={isSendingNudge}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 ${isClinical
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-indigo-500 text-black'
                                        }`}
                                >
                                    {isSendingNudge ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={12} />
                                            Enviar Nudge API
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientList;

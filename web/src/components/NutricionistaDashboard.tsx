/**
 * CLINICAL COMMAND CENTER (B2B)
 * "Silent Luxury" Aesthetic - High Density Data Dashboard
 * Gestion por Excepcion - Semáforo Clínico
 */

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { nutritionistApi } from '../api/nutritionist';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { PatientDetailView } from './drilldown/PatientDetailView';
import { ClinicalOnboardingFlow } from './clinical/ClinicalOnboardingFlow';
import { PatientMobileSimulator } from './clinical/PatientMobileSimulator';
import { TelemetryGodModePanel } from './clinical/TelemetryGodModePanel';

import { TriageLevel1 } from './clinical/TriageLevel1';
import { TriageLevel2 } from './clinical/TriageLevel2';
import { PopulationInsights } from './clinical/PopulationInsights';
import { VoiceToChartDock } from './clinical/VoiceToChartDock';
import { ValidationTinderTab } from './clinical/ValidationTinderTab';
import { ZeroDraftInbox } from './clinical/ZeroDraftInbox';

// =============================================================================
// TYPES
// =============================================================================

type DashboardState = 'loading' | 'success' | 'error';

// =============================================================================
// MOCK DATA
// =============================================================================
const MOCK_DATA = {
    weightAlerts: [
        { patientId: 'p1', patientName: 'Ana Gomez', alertType: 'weight_spike' as const, message: 'Aumento súbito de peso (+2.5kg en 48h)', value: '78.5kg', time: 'Hace 2h' },
        { patientId: 'p2', patientName: 'Carlos Ruiz', alertType: 'hyperglycemia' as const, message: 'Hiperglucemia sostenida', value: '310 mg/dL', time: 'Hace 5h' }
    ],
    patients: [
        { id: '1', name: 'Laura Martinez', status: 'active', lastCheckIn: 'Hoy', plan: 'Keto', macrosCompliance: 92, operationalStreak: [true, true, true, true, true, true, true], strategicMetric: { label: 'HbA1c', value: '5.2%', trend: 'good' as const } },
        { id: '2', name: 'Pedro Sanchez', status: 'warning', lastCheckIn: '3d', plan: 'Low Carb', macrosCompliance: 40, operationalStreak: [true, false, false, false, false, false, false], strategicMetric: { label: 'Peso', value: '92kg', trend: 'bad' as const } },
        { id: '3', name: 'Elena Gomez', status: 'active', lastCheckIn: '2h', plan: 'Balanced', macrosCompliance: 95, operationalStreak: [true, true, true, false, true, true, true], strategicMetric: { label: 'Masa Magra', value: '45kg', trend: 'good' as const } },
        { id: '4', name: 'Miguel Torres', status: 'inactive', lastCheckIn: '5d', plan: 'Vegan', macrosCompliance: 10, operationalStreak: [false, false, false, false, false, false, false], strategicMetric: { label: 'HbA1c', value: '6.5%', trend: 'bad' as const } },
        { id: '5', name: 'Sofia Rodriguez', status: 'active', lastCheckIn: '4h', plan: 'Paleo', macrosCompliance: 88, operationalStreak: [true, true, true, true, false, true, true], strategicMetric: { label: 'Grasa Visceral', value: '8%', trend: 'good' as const } },
        { id: '6', name: 'Diego Lopez', status: 'warning', lastCheckIn: '1d', plan: 'Intermittent', macrosCompliance: 45, operationalStreak: [true, true, false, false, true, false, false], strategicMetric: { label: 'Colesterol', value: '190', trend: 'neutral' as const } },
    ]
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const NutricionistaDashboard: React.FC = () => {
    const { token } = useAuth();
    const [state, setState] = useState<DashboardState>('loading');
    const [alerts, setAlerts] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [isCreatingPatient, setIsCreatingPatient] = useState(false);
    const [isPatientViewOpen, setIsPatientViewOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'triage' | 'validations' | 'zeroDraft'>('triage');
    const { mode } = useTheme();

    const handleSelectPatient = (id: string | null) => {
        if (!document.startViewTransition) {
            setSelectedPatientId(id);
            return;
        }
        document.startViewTransition(() => {
            setSelectedPatientId(id);
        });
    };

    useEffect(() => {
        loadData();
    }, [token]);

    const loadData = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/patients`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            
            if (response.ok) {
                const dbPatients = await response.json();
                let mappedPatients: any[] = [];
                if (Array.isArray(dbPatients) && dbPatients.length > 0) {
                    mappedPatients = dbPatients.map((p: any) => {
                        let parsedPlan = 'Personalizado';
                        if (p.goal && p.goal.includes('Archetype:')) {
                            parsedPlan = p.goal.split('Archetype:')[1].split('.')[0].trim();
                        }
                        if (p.goal && p.goal.includes('Meal Schedule:')) {
                            const scheduleRaw = p.goal.split('Meal Schedule:')[1].split('.')[0].trim();
                            const schedLabels: Record<string, string> = {
                                '3meals': '3 Comidas',
                                '5meals': '5 Ingestas',
                                'fasting': 'Ayuno 16:8'
                            };
                            parsedPlan += ` (${schedLabels[scheduleRaw] || scheduleRaw})`;
                        }
                        
                        const isLowFodmap = p.goal ? p.goal.includes('Low-FODMAP: True') : false;
                        const isGlp1 = p.goal ? p.goal.includes('GLP-1 Mode: True') : false;
                        
                        return {
                            id: p.id,
                            name: p.full_name,
                            status: 'warning',
                            lastCheckIn: 'Sin registros',
                            plan: parsedPlan,
                            macrosCompliance: 35,
                            operationalStreak: [false, false, false, false, false, false, false],
                            strategicMetric: { label: 'Peso', value: `${p.weight}kg`, trend: 'neutral' as const },
                            clinicalFlags: {
                                low_fodmap: isLowFodmap,
                                glp1: isGlp1
                            }
                        };
                    });
                }
                
                // 🛡️ EPHEMERAL HYDRATION (Bypass SQL)
                const ephemeralPatientRaw = localStorage.getItem('ephemeral_patient_demo');
                let currentAlerts = [...MOCK_DATA.weightAlerts];
                
                if (ephemeralPatientRaw) {
                    try {
                        const ep = JSON.parse(ephemeralPatientRaw);
                        const epId = `EPHEMERAL-${Date.now()}`;
                        const epPatient = {
                            id: epId,
                            name: ep.patient_name || 'Paciente Demo',
                            status: 'warning',
                            lastCheckIn: 'Recién Ingresado',
                            plan: ep.archetype_label || 'Plan Personalizado',
                            macrosCompliance: 0, // 0 para forzarlo a aparecer en Nivel 2 (Cola de Gestión)
                            operationalStreak: [false, false, false, false, false, false, false],
                            strategicMetric: { label: 'TMB', value: `${ep.tmb} kcal`, trend: 'neutral' as const },
                            clinicalFlags: {
                                low_fodmap: ep.clinical_flags?.low_fodmap_active || false,
                                glp1: ep.clinical_flags?.glp1_safety_mode || false
                            }
                        };
                        mappedPatients.unshift(epPatient);
                        
                        // Magia: Forzamos una alerta de Nivel 1 para que el Inversor vea el impacto inmediato
                        currentAlerts.unshift({
                            patientId: epId,
                            patientName: epPatient.name,
                            alertType: 'weight_spike' as const, // Reusamos el icono rojizo
                            message: 'NUEVO INGRESO: ZERO CLIENT WIZARD COMPLETADO',
                            value: 'ONBOARDING',
                            time: 'Ahora'
                        });
                    } catch (err) {
                        console.error('Error parsing ephemeral patient', err);
                    }
                }
                
                // Prepend real and ephemeral database patients to mock list
                setPatients([...mappedPatients, ...MOCK_DATA.patients]);
                setAlerts(currentAlerts);
            } else {
                setPatients(MOCK_DATA.patients as any);
                setAlerts(MOCK_DATA.weightAlerts);
            }
            
            setState('success');
        } catch (e) {
            console.warn("API failed, using mock data", e);
            setPatients(MOCK_DATA.patients as any);
            setAlerts(MOCK_DATA.weightAlerts);
            setState('success');
        }
    };

    if (state === 'loading') {
        return (
            <div className={`min-h-[100dvh] flex items-center justify-center ${mode === 'CLINICAL' ? 'bg-[#F2F4F6]' : 'bg-[var(--color-adrenaline-bg)]'}`}>
                <div className="w-full max-w-4xl mx-auto space-y-6 px-8 animate-pulse">
                    <div className="h-12 w-full max-w-md bg-white/5 rounded-2xl mx-auto mb-12" />
                    <div className="h-48 bg-white/5 rounded-3xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-32 bg-white/5 rounded-3xl" />
                        <div className="h-32 bg-white/5 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isCreatingPatient) {
        return <ClinicalOnboardingFlow onComplete={() => setIsCreatingPatient(false)} onCancel={() => setIsCreatingPatient(false)} />;
    }

    if (selectedPatientId) {
        return <PatientDetailView patientId={selectedPatientId} onBack={() => handleSelectPatient(null)} />;
    }

    // Triage Logic
    // Nivel 2: Cola de Gestión (Amarillo) -> Riesgo de abandono o adherencia < 50%
    const yellowPatients = patients.filter(p => p.macrosCompliance < 50 || p.lastCheckIn.includes('d'));
    
    // Nivel 3: Zero-Friction (Verde) -> Estables (No se muestran por defecto, a menos que se busquen)
    const greenPatients = patients.filter(p => p.macrosCompliance >= 85);
    
    // Resultados de búsqueda global
    const isSearching = searchQuery.trim().length > 0;
    const searchResults = isSearching 
        ? patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    return (
        <main aria-label="Command Center Clinico" className={`min-h-[100dvh] p-4 md:p-6 lg:p-8 font-sans pb-32 transition-colors duration-1000 ${mode === 'CLINICAL' ? 'text-slate-800 bg-[#F2F4F6]' : 'text-white bg-[var(--color-adrenaline-bg)]'}`}>
            
            {/* GLOBAL HEADER & SEARCH BAR */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest uppercase border ${mode === 'CLINICAL'
                                ? 'bg-white border-slate-200 text-slate-500'
                                : 'bg-white/5 border-white/10 text-zinc-400'
                            }`}>Centro de Mando</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Gestión por Excepción</h1>
                    </div>

                    <div className="relative w-full md:w-auto flex flex-wrap gap-3">
                        <div className="relative flex-1 md:w-64">
                            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${mode === 'CLINICAL' ? 'text-slate-400' : 'text-zinc-400'}`}>
                                <Search size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Buscar pacientes estables..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-11 pr-4 py-3 rounded-2xl border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                                    mode === 'CLINICAL' 
                                        ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm' 
                                        : 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500'
                                }`}
                            />
                        </div>
                        <button 
                            onClick={() => setActiveTab(activeTab === 'zeroDraft' ? 'triage' : 'zeroDraft')}
                            className={`shrink-0 px-4 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
                                activeTab === 'zeroDraft'
                                    ? (mode === 'CLINICAL' ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-indigo-500 text-white')
                                    : (mode === 'CLINICAL' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600' : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:text-indigo-400')
                            }`}
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                            {activeTab === 'zeroDraft' ? 'Volver a Triage' : 'Borradores AUREA (4)'}
                        </button>
                        <button 
                            onClick={() => setActiveTab(activeTab === 'validations' ? 'triage' : 'validations')}
                            className={`shrink-0 px-4 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
                                activeTab === 'validations'
                                    ? (mode === 'CLINICAL' ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-indigo-500 text-white')
                                    : (mode === 'CLINICAL' ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600' : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 hover:text-indigo-400')
                            }`}
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                            {activeTab === 'validations' ? 'Volver a Triage' : 'Validar Diarios (3)'}
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN ARCHITECTURE: 4 LEVELS */}
            {activeTab === 'validations' ? (
                <ValidationTinderTab />
            ) : activeTab === 'zeroDraft' ? (
                <ZeroDraftInbox />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left/Center Column (Operational) */}
                    <div className="lg:col-span-8 flex flex-col gap-2">
                    
                    {/* Búsqueda Global Activa */}
                    {isSearching ? (
                        <section className="mb-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60">Resultados de Búsqueda</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map(p => (
                                    <div key={p.id} className="p-4 rounded-xl border bg-white shadow-sm" onClick={() => handleSelectPatient(p.id)}>
                                        <div className="font-bold">{p.name}</div>
                                        <div className="text-xs text-slate-500">Adherencia: {p.macrosCompliance}%</div>
                                    </div>
                                ))}
                                {searchResults.length === 0 && (
                                    <div className="col-span-2 text-center p-8 opacity-50">No se encontraron pacientes.</div>
                                )}
                            </div>
                        </section>
                    ) : (
                        <>
                            {/* Nivel 1: Acción Inmediata (ROJO) */}
                            <TriageLevel1 
                                alerts={alerts} 
                                onAction={(id, action) => {
                                    if (action === 'intervene') handleSelectPatient(id);
                                    else console.log(`Calling patient ${id}`);
                                }} 
                            />

                            {/* Nivel 2: Cola de Gestión (AMARILLO) */}
                            <TriageLevel2 
                                patients={yellowPatients} 
                                onSelectPatient={handleSelectPatient}
                            />
                            
                            {/* Nivel 3: Zero-Friction (VERDE) */}
                            <section className="text-center p-8 border border-dashed rounded-3xl opacity-50 hover:opacity-100 transition-opacity">
                                <h3 className="text-sm font-bold text-emerald-600">Piloto Automático Activo</h3>
                                <p className="text-xs mt-1">Hay {greenPatients.length} pacientes estables (Adherencia &gt; 85%) que no requieren tu atención. Recibiendo refuerzos asíncronos.</p>
                            </section>
                        </>
                    )}
                </div>

                {/* Right Column (Strategic & Population) */}
                <div className="lg:col-span-4">
                    {/* Nivel 4 (Parte 1): Population Insights */}
                    <PopulationInsights />
                </div>
                </div>
            )}

            {/* Nivel 4 (Parte 2): Voice-to-Chart Dock */}
            <VoiceToChartDock />

            {/* Dev Tools */}
            <TelemetryGodModePanel />
            {isPatientViewOpen && <PatientMobileSimulator onClose={() => setIsPatientViewOpen(false)} />}
        </main>
    );
};

export default NutricionistaDashboard;

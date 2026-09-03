import React, { useState } from 'react';
import { Search, Activity, Users, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { KpiRadarWidget } from '../../domains/coach/widgets/KpiRadarWidget';
import { CoachRosterWidget } from '../../domains/coach/widgets/CoachRosterWidget';
import { IntelligentInboxWidget } from '../../domains/coach/widgets/IntelligentInboxWidget';
import { FinanceBentoWidget } from '../../domains/coach/widgets/FinanceBentoWidget';
import { ClientDrillDownWidget } from '../../domains/coach/widgets/ClientDrillDownWidget';
import { Radiografia360DetailView } from '../../domains/coach/widgets/Radiografia360DetailView';
import { CascadeBuilderCanvas } from '../../domains/coach/features/WorkoutBuilder/CascadeBuilderCanvas';
import { useViewTransition } from '../../shared/hooks/useViewTransition';
import { useEffect } from 'react';
import { trainerApi, type TrainerDashboardData } from '../../api/trainer';
import { useGlobalSimulator } from '../../stores/useGlobalSimulator';
import { useTheme } from '../../context/ThemeContext';
import { QuickActionsFAB } from '../../widgets/QuickActionsFAB';

export const PersonalTrainerDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'CABINA' | 'ATLETAS'>('CABINA');
    const [activeAthleteId, setActiveAthleteId] = useState<string | null>(null);
    const [activeRadiografiaId, setActiveRadiografiaId] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<TrainerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { transitionViewIfSupported } = useViewTransition();
    const navigate = useNavigate();
    const simulator = useGlobalSimulator();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const fetchDashboard = async () => {
        try {
            const data = await trainerApi.getDashboard();
            setDashboardData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleSelectAthlete = (id: string) => {
        transitionViewIfSupported(() => {
            setActiveRadiografiaId(null);
            setActiveAthleteId(id);
        });
    };

    const handleSelectInboxMessage = (id: string) => {
        transitionViewIfSupported(() => {
            setActiveAthleteId(null);
            setActiveRadiografiaId(id);
        });
    };

    if (isLoading || !dashboardData) {
        return (
            <main className="min-h-screen p-6 bg-black text-zinc-200 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-mono tracking-widest text-zinc-500 uppercase">Inicializando Panel Principal...</p>
                </div>
            </main>
        );
    }

    return (
        <main aria-label="Personal Trainer Command Center" className={`min-h-screen p-6 font-sans selection:bg-cyan-500/30 overflow-x-hidden transition-colors duration-300 ${isClinical ? 'bg-slate-50 text-slate-900' : 'bg-black text-zinc-200'}`}>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                     <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full tracking-widest uppercase border shadow-[0_0_15px_rgba(163,230,53,0.1)] ${isClinical ? 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20' : 'bg-[var(--color-action-primary)]/10 text-[var(--color-action-primary)] border-[var(--color-action-primary)]/20'}`}>
                            {isClinical ? 'NUTRI_CLINIC [NEXUS]' : 'COACH_CORE [NEXUS]'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl tracking-tight font-black uppercase italic mb-1">
                        {isClinical ? 'Centro de Mando Clínico' : 'Centro de Control PRO'}
                    </h1>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Tabs */}
                    <div className={`flex p-1 border rounded-lg ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800/50'}`}>
                        <button
                            onClick={() => setActiveTab('CABINA')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'CABINA' ? (isClinical ? 'bg-slate-200 text-slate-900 shadow-sm' : 'bg-zinc-800 text-white shadow-sm') : (isClinical ? 'text-slate-500 hover:text-slate-700' : 'text-zinc-500 hover:text-zinc-300')}`}
                        >
                            Cabina
                        </button>
                        <button
                            onClick={() => setActiveTab('ATLETAS')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${activeTab === 'ATLETAS' ? (isClinical ? 'bg-slate-200 text-slate-900 shadow-sm' : 'bg-zinc-800 text-white shadow-sm') : (isClinical ? 'text-slate-500 hover:text-slate-700' : 'text-zinc-500 hover:text-zinc-300')}`}
                        >
                            Atletas
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64 lg:w-80">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`} size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH_ATHLETE_DB"
                            className={`w-full pl-11 pr-4 py-3 rounded-xl text-xs md:text-xs font-bold uppercase tracking-widest focus:outline-none transition-all border font-mono backdrop-blur-md ${isClinical ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:bg-slate-50' : 'bg-zinc-950 border-zinc-800/50 text-zinc-200 placeholder-zinc-500 focus:border-[var(--color-action-primary)]/50 focus:bg-zinc-900/80'}`}
                        />
                    </div>
                </div>
            </header>

            {/* Drill Down Views take priority full screen if active */}
            {activeRadiografiaId ? (
                <div className="col-span-12 h-full z-50">
                    <Radiografia360DetailView athleteId={activeRadiografiaId} onBack={() => handleSelectInboxMessage(null as any)} />
                </div>
            ) : activeAthleteId ? (
                 <div className="col-span-12 h-full flex flex-col gap-6">
                    <ClientDrillDownWidget 
                        athleteId={activeAthleteId} 
                        onBack={() => handleSelectAthlete(null as any)} 
                    />
                    <div className="h-96">
                        <CascadeBuilderCanvas 
                            athleteId={activeAthleteId} 
                            painAreas={activeAthleteId === '1' ? ['Rodilla', 'Baja Espalda'] : []} 
                        />
                    </div>
                 </div>
            ) : activeTab === 'ATLETAS' ? (
                // PESTAÑA ATLETAS: SOLO LISTA
                <section className="h-[calc(100vh-45)] bg-zinc-950 border border-zinc-800/50 rounded-2xl p-4">
                    <CoachRosterWidget clients={dashboardData.clients} onSelectAthlete={handleSelectAthlete} />
                </section>
            ) : (
                // PESTAÑA CABINA: SOLO METRICAS Y AVISOS
                <section className="grid grid-cols-12 gap-6 p-2">
                    
                    {/* Main Column (col-span-12 md:col-span-8): Triaje Clínico & Finanzas */}
                    <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
                        {/* 1. Triaje Clínico (SEMAFORO) */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center">
                                    <span className="absolute w-4 h-4 rounded-full bg-red-500/20 animate-ping"></span>
                                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"></span>
                                </div>
                                <h2 className={`text-sm font-black uppercase tracking-widest ${isClinical ? 'text-slate-800' : 'text-zinc-300'}`}>Triaje de Atención Primaria</h2>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-auto">
                            {/* Demandas Rojas (Lesiones / Acción Inmediata) */}
                            <div className={`border rounded-3xl p-6 flex flex-col gap-4 shadow-lg transition-colors ${isClinical ? 'bg-white border-red-500/20 hover:border-red-500/40 shadow-red-500/5' : 'bg-zinc-950/80 border-red-500/10 hover:border-red-500/30 shadow-[0_8px_32px_-12px_rgba(239,68,68,0.1)]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs text-red-500 border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-lg w-fit uppercase font-black tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={14} /> Alertas Clínicas
                                    </h3>
                                    <span className={`text-xs font-bold ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>{simulator.proHasNewAlert ? 1 : 0} Casos</span>
                                </div>
                                {!simulator.proHasNewAlert ? (
                                    <div className={`flex-1 flex items-center justify-center border border-dashed rounded-2xl min-h-32 ${isClinical ? 'border-slate-200' : 'border-zinc-800/50'}`}>
                                        <p className={`text-xs font-medium uppercase tracking-widest ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}>Sin alertas clínicas activas.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div className={`p-4 rounded-2xl border cursor-pointer transition-all group ${isClinical ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-red-500/40' : 'bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900 hover:border-red-500/40'}`} onClick={() => handleSelectAthlete('1')}>
                                            <div className="flex justify-between items-start mb-2">
                                                <p className={`text-sm font-bold transition-colors group-hover:text-red-500 ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>Juan Pérez (Simulador)</p>
                                                <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-500/10 text-red-500">URGENTE</span>
                                            </div>
                                            <p className={`text-xs font-medium mb-2 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Alerta en <span className={isClinical ? 'text-slate-700' : 'text-zinc-300'}>{simulator.proAlertMessage}</span></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Demandas Ambar (Retención / Churn Risks / Nudges) */}
                             <div className={`border rounded-3xl p-6 flex flex-col gap-4 shadow-lg transition-colors ${isClinical ? 'bg-white border-amber-500/20 hover:border-amber-500/40 shadow-amber-500/5' : 'bg-zinc-950/80 border-amber-500/10 hover:border-amber-500/30 shadow-[0_8px_32px_-12px_rgba(245,158,11,0.1)]'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs text-amber-500 border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit uppercase font-black tracking-widest flex items-center gap-2">
                                        <Clock size={14} /> Riesgo Adherencia (Nudge)
                                    </h3>
                                    <span className={`text-xs font-bold ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>{dashboardData.churnRisks.length} Casos</span>
                                </div>
                                {dashboardData.churnRisks.length === 0 ? (
                                    <div className={`flex-1 flex items-center justify-center border border-dashed rounded-2xl min-h-32 ${isClinical ? 'border-slate-200' : 'border-zinc-800/50'}`}>
                                        <p className={`text-xs font-medium uppercase tracking-widest ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}>Retención 100% Estable.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 max-h-60 overflow-y-auto no-scrollbar">
                                    {dashboardData.churnRisks.slice(0, 2).map(risk => (
                                        <div key={risk.clientId} className={`p-4 rounded-2xl border flex flex-col justify-between group cursor-pointer transition-all gap-3 ${isClinical ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-amber-500/40' : 'bg-zinc-900/40 border-zinc-800/50 hover:bg-zinc-900 hover:border-amber-500/40'}`} onClick={() => handleSelectAthlete(risk.clientId)}>
                                            <div className="flex justify-between items-start">
                                                 <p className={`text-sm font-bold transition-colors group-hover:text-amber-500 ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>{risk.clientName}</p>
                                                 <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                                                    Inactivo {risk.daysSinceLastActivity}d
                                                 </span>
                                            </div>
                                            <button className={`w-full text-xs border py-2 rounded-xl transition-all font-black uppercase tracking-widest group-hover:border-amber-500/30 group-hover:bg-amber-500/10 group-hover:text-amber-500 ${isClinical ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>
                                                Intervenir / Nudge
                                            </button>
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Finanzas */}
                        <div 
                            onClick={() => {
                                if (document.startViewTransition) {
                                    document.startViewTransition(() => {
                                        flushSync(() => navigate('/trainer/finance'));
                                    });
                                } else {
                                    navigate('/trainer/finance');
                                }
                            }}
                            className={`border rounded-2xl cursor-pointer hover:-translate-y-1 transition-all overflow-hidden ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-800/50'}`}
                        >
                            <FinanceBentoWidget 
                                mrr={(dashboardData?.clients?.length || 0) > 0 ? (simulator.gymActiveClients * simulator.gymBaseMRR) : 0} 
                                delinquentClients={dashboardData.delinquentClients || []} 
                                onResolveSuccess={fetchDashboard}
                            />
                        </div>
                    </div>

                    {/* Right Sidebar (col-span-12 md:col-span-4): KPIs, Inbox, Fatiga */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                        {/* Atletas y Adherencia */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`border rounded-2xl p-4 flex flex-col justify-center ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-800/50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Users size={14} className={isClinical ? 'text-slate-400' : 'text-zinc-500'} />
                                    <span className={`text-xs font-bold uppercase tracking-widest block ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Atletas</span>
                                </div>
                                <div className="flex items-end gap-2 mb-1">
                                    <span className={`text-3xl font-black italic tracking-tighter ${isClinical ? 'text-slate-800' : 'text-zinc-100'}`}>{dashboardData?.clients?.length || 0}</span>
                                    {(dashboardData?.clients?.length || 0) > 0 && <span className="text-xs font-bold text-emerald-500 mb-1">+5</span>}
                                </div>
                            </div>
                            <div className={`border rounded-2xl p-4 flex flex-col justify-center ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-800/50'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity size={14} className="text-lime-500" />
                                    <span className={`text-xs font-bold uppercase tracking-widest block ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Adherencia</span>
                                </div>
                                <span className="text-3xl font-black italic tracking-tighter text-lime-500">{(dashboardData?.clients?.length || 0) > 0 ? '92%' : '--%'}</span>
                                <div className={`w-full rounded-full h-1 mt-2 ${isClinical ? 'bg-slate-100' : 'bg-zinc-900'}`}>
                                    <div className="bg-lime-400 h-1 rounded-full" style={{ width: (dashboardData?.clients?.length || 0) > 0 ? '92%' : '0%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Inbox/Notificaciones */}
                        <div className={`border rounded-2xl pt-4 overflow-hidden flex flex-col min-h-64 ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-800/50'}`}>
                            <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 px-4 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                <AlertTriangle size={14} className="text-amber-500" /> Live Feed
                            </h3>
                            <div className="flex-1 overflow-y-auto no-scrollbar shadow-inner px-2 pb-2 pl-4">
                                <IntelligentInboxWidget onSelectMessage={handleSelectInboxMessage} />
                            </div>
                        </div>

                        {/* Fatiga Global */}
                        <div className={`border rounded-2xl overflow-hidden flex flex-col min-h-72 ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-800/50'}`}>
                            <h3 className={`text-xs font-bold uppercase tracking-widest mx-4 mt-5 mb-0 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Fatiga Global (ACWR)</h3>
                            <div className="flex-1 -mt-4 relative">
                                <KpiRadarWidget />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Acciones Rápidas Globales (FAB) */}
            <QuickActionsFAB mode={mode} />
        </main>
    );
};

export default PersonalTrainerDashboard;

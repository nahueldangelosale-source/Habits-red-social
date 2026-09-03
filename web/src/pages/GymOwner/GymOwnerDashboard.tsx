import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
    TrendingUp, Users, AlertOctagon, Repeat, DollarSign,
    Activity, Shield, ShieldAlert, ArrowUpRight, Award, Box, Link, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useBusinessMetrics } from '../../hooks/useMonetization';

export const GymOwnerDashboard: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    
    const { data: metricsResponse, isLoading } = useBusinessMetrics();
    const metrics = metricsResponse?.data;
    const meta = metricsResponse?.meta;

    const [activeTab, setActiveTab] = useState<'FINANCIALS' | 'STAFF' | 'FACILITY'>('FINANCIALS');

    const handleAction = (action: string) => {
        toast.success(`Action Triggered: ${action}`);
    };

    return (
        <div className={`p-6 md:p-10 min-h-screen font-sans animate-in fade-in duration-500 ${isClinical ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-white'}`}>
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl ${isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            <Box size={28} />
                        </div>
                        <h1 className={`text-3xl font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            Enterprise Command Center
                        </h1>
                    </div>
                    <p className={`font-medium max-w-xl ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        Telemetría B2B. Protege tus ingresos (Revenue Protection), optimiza el LTV y supervisa la resiliencia de tu Staff.
                    </p>
                    {meta?.is_degraded && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            Modo Degradado: {meta.reason}
                        </div>
                    )}
                </div>
                
                {/* Tabs */}
                <div className={`flex p-1 rounded-2xl border shadow-sm w-full md:w-auto ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <button
                        onClick={() => setActiveTab('FINANCIALS')}
                        className={`flex-1 md:px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'FINANCIALS' 
                                ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]')
                                : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-zinc-300')
                        }`}
                    >
                        <DollarSign size={14} /> Financials & Bleed
                    </button>
                    <button
                        onClick={() => setActiveTab('STAFF')}
                        className={`flex-1 md:px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'STAFF' 
                                ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]')
                                : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-zinc-300')
                        }`}
                    >
                        <Award size={14} /> Staff Resilience
                    </button>
                    <button
                        onClick={() => setActiveTab('FACILITY')}
                        className={`flex-1 md:px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'FACILITY' 
                                ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]')
                                : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-zinc-300')
                        }`}
                    >
                        <Activity size={14} /> Facility Ops
                    </button>
                </div>
            </header>

            {/* Macro Telemetry (Top Bar) - Always Visible */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>MRR Total</p>
                    <p className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        {isLoading ? '...' : `$${((metrics?.total_revenue_cents || 0) / 100).toLocaleString()}`}
                    </p>
                    <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-2">+{metrics?.mrr_growth_percentage || 0}% M/M</span>
                </div>
                <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Capital en Riesgo</p>
                    <p className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        {isLoading ? '...' : `$${((metrics?.capital_at_risk_cents || 0) / 100).toLocaleString()}`}
                    </p>
                    <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block mt-2">Acción Requerida</span>
                </div>
                <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Global Churn</p>
                    <p className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        {isLoading ? '...' : `${metrics?.churn_rate_percentage || 0}%`}
                    </p>
                    <span className="text-xs text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md inline-block mt-2">Target &lt; 4%</span>
                </div>
                <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Suscripciones Activas</p>
                    <p className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        {isLoading ? '...' : metrics?.active_subscriptions || 0}
                    </p>
                    <span className="text-xs text-slate-500 font-bold bg-slate-500/10 px-2 py-0.5 rounded-md inline-block mt-2">Capacity: 85%</span>
                </div>
            </div>

            {activeTab === 'FINANCIALS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                    {/* Financial Bleed Alert */}
                    <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-rose-200' : 'bg-rose-950/20 border-rose-900/50'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-2xl ${isClinical ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/20 text-rose-400'}`}>
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-rose-900' : 'text-rose-400'}`}>Financial Bleed Alert</h3>
                                <p className={`text-sm ${isClinical ? 'text-rose-700/80' : 'text-rose-500/80'}`}>Detección predictiva de abandono (Ghosting)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-5 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-rose-50 border-rose-100' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                <div>
                                    <h4 className={`font-black text-lg ${isClinical ? 'text-rose-700' : 'text-rose-400'}`}>$14,500 LTV en Riesgo</h4>
                                    <p className={`text-xs mt-1 font-medium ${isClinical ? 'text-rose-600/80' : 'text-rose-500/80'}`}>
                                        12 miembros sin registros en 10 días ni asistencia a clases.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleAction('Win-Back Campaign: Oferta de Retención')}
                                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 ${
                                        isClinical ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-rose-500 text-white hover:bg-rose-600'
                                    }`}
                                >
                                    <Repeat size={14} /> Disparar Win-Back
                                </button>
                            </div>

                            <div className={`p-5 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-amber-50 border-amber-100' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                <div>
                                    <h4 className={`font-black text-lg ${isClinical ? 'text-amber-700' : 'text-amber-400'}`}>$5,200 LTV en Declive</h4>
                                    <p className={`text-xs mt-1 font-medium ${isClinical ? 'text-amber-600/80' : 'text-amber-500/80'}`}>
                                        Uso debajo de 3 visitas/mes. Patrón de fatiga (ACWR alto).
                                    </p>
                                </div>
                                <button 
                                    onClick={() => handleAction('Nudge Campaign: Mensaje Motivacional')}
                                    className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 ${
                                        isClinical ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-500 text-black hover:bg-amber-600'
                                    }`}
                                >
                                    <Zap size={14} /> Nudge Campaign
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Upsell Engine */}
                    <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-2xl ${isClinical ? 'bg-emerald-100 text-emerald-600' : 'bg-action-primary/20 text-action-primary'}`}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Motor de Upselling (AI)</h3>
                                <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Expansión del LTV mediante telemetría.</p>
                            </div>
                        </div>
                        <div className={`p-5 rounded-2xl border ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>Kit "Sleep Optimization"</h4>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    +$900 MRR Disp.
                                </span>
                            </div>
                            <p className={`text-xs mb-4 leading-relaxed ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                Detectamos 30 pacientes con bajo sueño profundo (Oura/Apple Health). La AI sugiere ofertar un upgrade a Protocolo Crononutricional.
                            </p>
                            <button 
                                onClick={() => handleAction('Upsell: Sleep Optimization')}
                                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                    isClinical ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' : 'bg-[var(--color-action-primary)] text-black hover:scale-[1.02]'
                                }`}
                            >
                                Lanzar Campaña <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'STAFF' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                    {/* Leaderboard Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Staff Leaderboard: Resiliencia & LTV</h3>
                        </div>
                        
                        {/* Trainer 1 (Top) */}
                        <div className={`p-5 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-white border-emerald-200 shadow-sm' : 'bg-emerald-950/20 border-emerald-900/50'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-lg border border-emerald-200">
                                    A
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Andrés M. (Master Trainer)</h4>
                                    <div className="flex gap-3 mt-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                            NPS: 9.8
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-blue-600' : 'text-blue-400'}`}>
                                            AVG LEG: 22 Meses
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>15 Rescates</div>
                                <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>de Danger Zone (ACWR)</p>
                            </div>
                        </div>

                        {/* Trainer 2 */}
                        <div className={`p-5 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg">
                                    V
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Valeria R.</h4>
                                    <div className="flex gap-3 mt-1">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                            NPS: 9.2
                                        </span>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-blue-600' : 'text-blue-400'}`}>
                                            AVG LEG: 14 Meses
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>8 Rescates</div>
                                <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>de Danger Zone (ACWR)</p>
                            </div>
                        </div>
                    </div>

                    {/* Matchmaker AI Column */}
                    <div className="space-y-6">
                        <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-gradient-to-b from-indigo-50 to-white border-indigo-100' : 'bg-gradient-to-b from-indigo-950/40 to-zinc-900 border-indigo-900/50'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Zap size={18} className="text-indigo-500" />
                                <h3 className={`font-bold ${isClinical ? 'text-indigo-900' : 'text-indigo-400'}`}>Lead Matchmaker AI</h3>
                            </div>
                            <div className={`p-4 rounded-xl border mb-4 ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                                <p className={`text-xs mb-2 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Nuevo Lead: "Recuperación de Rodilla, Introvertido"</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className={isClinical ? 'text-slate-700 font-medium' : 'text-zinc-300'}>1. Andrés M. (95% Match)</span>
                                        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">100% Capacidad</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className={isClinical ? 'text-slate-700 font-medium' : 'text-zinc-300'}>2. Valeria R. (88% Match)</span>
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">75% Capacidad</span>
                                    </div>
                                </div>
                            </div>
                            <button className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${isClinical ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}>
                                Auto-Asignar a Valeria (Protección Burnout)
                            </button>
                        </div>

                        {/* Ecosystem Anchor */}
                        <div className={`p-6 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                            <h3 className={`font-bold text-sm mb-3 flex items-center gap-2 ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                <Link size={16} /> Anclaje al Ecosistema
                            </h3>
                            <p className={`text-xs mb-4 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                18% de los pacientes de Andrés M. tienen interacción nula con el resto del gimnasio (Riesgo de Fuga si el Trainer se va).
                            </p>
                            <button className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}>
                                Invitar a Retos Grupales
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'FACILITY' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                    {/* Space Optimization / Heatmap */}
                    <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-2xl ${isClinical ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Space Optimization</h3>
                                <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Decisiones de CapEx basadas en Swap Engine.</p>
                            </div>
                        </div>

                        <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${isClinical ? 'bg-blue-50 border-blue-100' : 'bg-blue-950/20 border-blue-900/50'}`}>
                            <div>
                                <h4 className={`font-black text-lg flex items-center gap-2 ${isClinical ? 'text-blue-800' : 'text-blue-400'}`}>
                                    <AlertOctagon size={18} /> Cuello de Botella Detectado
                                </h4>
                                <p className={`text-xs mt-2 leading-relaxed ${isClinical ? 'text-blue-700/80' : 'text-blue-300/80'}`}>
                                    El Swap Engine de los trainers registra un <strong>45% de sustituciones forzadas</strong> en el ejercicio "Prensa de Piernas" (Leg Press) durante horas pico (18:00 - 20:00).
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl text-xs font-bold ${isClinical ? 'bg-white text-blue-900 shadow-sm' : 'bg-blue-900/40 text-white'}`}>
                                💡 Sugerencia AI: Adquirir 1 Prensa de Piernas adicional o reubicar racks libres para mejorar Yield per Sq. Meter.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

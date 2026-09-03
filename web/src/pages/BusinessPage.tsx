import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
    Users, TrendingUp, AlertOctagon, Video, 
    MessageSquare, BatteryWarning, ArrowUpRight, 
    Network, HeartPulse, DollarSign, GraduationCap, Repeat
} from 'lucide-react';
import toast from 'react-hot-toast';

export const BusinessPage: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const [activeTab, setActiveTab] = useState<'HEALTH' | 'BUSINESS' | 'RETAINERS'>('HEALTH');

    const handleBulkAction = (action: string) => {
        toast.success(`Acción Asíncrona: ${action} enviada a la cohorte.`, { icon: '🚀' });
    };

    return (
        <div className={`p-6 md:p-10 min-h-screen font-sans animate-in fade-in duration-500 ${isClinical ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-white'}`}>
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className={`text-3xl font-black flex items-center gap-3 tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        <div className={`p-2 rounded-xl ${isClinical ? 'bg-blue-100 text-blue-600' : 'bg-blue-500/20 text-blue-400'}`}>
                            <Network size={28} />
                        </div>
                        Inteligencia Poblacional (PSN)
                    </h1>
                    <p className={`mt-2 font-medium max-w-xl ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        Patient Similarity Networks. Gestiona tu clínica de 1-a-Muchos. Intervenciones masivas y predicción de ingresos basada en telemetría.
                    </p>
                </div>
                
                {/* Global Toggle */}
                <div className={`flex p-1 rounded-2xl border shadow-sm w-full md:w-auto ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <button
                        onClick={() => setActiveTab('HEALTH')}
                        className={`flex-1 md:px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'HEALTH' 
                                ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]')
                                : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-zinc-300')
                        }`}
                    >
                        <HeartPulse size={14} /> Population Health
                    </button>
                    <button
                        onClick={() => setActiveTab('BUSINESS')}
                        className={`flex-1 md:px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'BUSINESS' 
                                ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]')
                                : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-zinc-300')
                        }`}
                    >
                        <TrendingUp size={14} /> Revenue & Churn
                    </button>
                    <button
                        onClick={() => setActiveTab('RETAINERS')}
                        className={`flex-1 md:px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                            activeTab === 'RETAINERS' 
                                ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]')
                                : (isClinical ? 'text-slate-500 hover:text-slate-800' : 'text-zinc-500 hover:text-zinc-300')
                        }`}
                    >
                        <Repeat size={14} /> Graduaciones (LTV)
                    </button>
                </div>
            </header>

            {activeTab === 'HEALTH' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                    
                    {/* Phenotype Cluster 1 */}
                    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-2 ${isClinical ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'}`}>
                                    Cluster 1 • 15 Pacientes
                                </div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Falla por Privación de Sueño</h3>
                            </div>
                            <BatteryWarning className={isClinical ? 'text-amber-500' : 'text-amber-400'} size={24} />
                        </div>
                        <p className={`text-sm mb-6 flex-1 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                            Cohorte con alta adherencia diurna pero atracones nocturnos correlacionados con &lt;45 min de sueño profundo en Oura/Apple Watch.
                        </p>
                        
                        <div className={`p-4 rounded-2xl mb-4 ${isClinical ? 'bg-slate-50' : 'bg-zinc-950'}`}>
                            <p className={`text-xs font-bold uppercase mb-2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>Intervención 1-a-Muchos</p>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkAction('Video Higiene Sueño')} className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${isClinical ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}>
                                    <Video size={14} /> Enviar Video
                                </button>
                                <button onClick={() => handleBulkAction('Ajuste Crononutrición')} className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${isClinical ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'}`}>
                                    <BrainCircuit size={14} /> Ajuste IA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Phenotype Cluster 2 */}
                    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-2 ${isClinical ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/20 text-rose-400'}`}>
                                    Cluster 2 • 8 Pacientes
                                </div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Estancamiento Metabólico</h3>
                            </div>
                            <AlertOctagon className={isClinical ? 'text-rose-500' : 'text-rose-400'} size={24} />
                        </div>
                        <p className={`text-sm mb-6 flex-1 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                            Adherencia {'>'}90% por más de 3 semanas, pero WMA (Media Móvil de Peso) y ALMI permanecen completamente planos. Requieren estímulo disruptivo.
                        </p>
                        
                        <div className={`p-4 rounded-2xl mb-4 ${isClinical ? 'bg-slate-50' : 'bg-zinc-950'}`}>
                            <p className={`text-xs font-bold uppercase mb-2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>Intervención 1-a-Muchos</p>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkAction('Mensaje Motivacional')} className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${isClinical ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}>
                                    <MessageSquare size={14} /> Mensaje
                                </button>
                                <button onClick={() => handleBulkAction('Protocolo Refeed')} className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${isClinical ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'}`}>
                                    <Utensils size={14} /> Protocolo Refeed
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Phenotype Cluster 3 */}
                    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-2 ${isClinical ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    Cluster 3 • 42 Pacientes
                                </div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Respondedores Óptimos</h3>
                            </div>
                            <TrendingUp className={isClinical ? 'text-emerald-500' : 'text-emerald-400'} size={24} />
                        </div>
                        <p className={`text-sm mb-6 flex-1 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                            TIR {'>'}85%, ALMI en aumento, y adherencia estable. Este grupo es ideal para publicar casos de éxito.
                        </p>
                        
                        <div className={`p-4 rounded-2xl mb-4 ${isClinical ? 'bg-slate-50' : 'bg-zinc-950'}`}>
                            <p className={`text-xs font-bold uppercase mb-2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>Intervención 1-a-Muchos</p>
                            <div className="flex gap-2">
                                <button onClick={() => handleBulkAction('Campaña Referidos')} className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${isClinical ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}>
                                    <Users size={14} /> Solicitar Referidos (Campaña Automática)
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'BUSINESS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                    
                    {/* Churn Risk Semaphore */}
                    <div className={`p-8 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-2xl ${isClinical ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/20 text-rose-400'}`}>
                                <AlertOctagon size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Riesgo de Abandono (Churn)</h3>
                                <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Basado en silencio de telemetría (Ghosting)</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-rose-50 border-rose-100' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                <div>
                                    <h4 className={`font-bold ${isClinical ? 'text-rose-900' : 'text-rose-400'}`}>Riesgo Crítico (4 pacientes)</h4>
                                    <p className={`text-xs ${isClinical ? 'text-rose-700' : 'text-rose-500/80'}`}>Sin pesajes ni sync de Oura en 7 días.</p>
                                </div>
                                <button className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${isClinical ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'}`}>
                                    BOT WHATSAPP
                                </button>
                            </div>
                            
                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-amber-50 border-amber-100' : 'bg-amber-500/5 border-amber-500/20'}`}>
                                <div>
                                    <h4 className={`font-bold ${isClinical ? 'text-amber-900' : 'text-amber-400'}`}>Riesgo Medio (12 pacientes)</h4>
                                    <p className={`text-xs ${isClinical ? 'text-amber-700' : 'text-amber-500/80'}`}>Registros intermitentes (Snap and Go).</p>
                                </div>
                                <button className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${isClinical ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'}`}>
                                    NUDGE APP
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Upselling Engine */}
                    <div className={`p-8 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-2xl ${isClinical ? 'bg-emerald-100 text-emerald-600' : 'bg-action-primary/20 text-action-primary'}`}>
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Motor de Upselling (AI)</h3>
                                <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Oportunidades de LTV basadas en fenotipos.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-4 rounded-2xl border ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900/50 border-zinc-800'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>Kit "Sleep Optimization"</h4>
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+ $450 MRR Disp.</span>
                                </div>
                                <p className={`text-xs mb-4 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                    Detectamos 15 pacientes (Cluster 1) con problemas de sueño profundo. Enviarles oferta automática de Kit de Magnesio + Protocolo de Crononutrición Premium.
                                </p>
                                <button onClick={() => handleBulkAction('Upsell: Sleep Kit')} className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[var(--color-action-primary)] text-black'}`}>
                                    Ejecutar Campaña <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 'RETAINERS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                    {/* Graduating Cohort */}
                    <div className={`p-8 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Graduaciones del Mes</h3>
                                    <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Finalizan su programa High-Ticket en &lt; 7 días.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className={`p-5 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                                <div>
                                    <h4 className={`font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>Laura M. (Paciente Zero)</h4>
                                    <p className={`text-xs mt-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Programa Longevidad (Día 85/90)</p>
                                </div>
                                <button onClick={() => handleBulkAction('Pase a Suscripción')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-[var(--color-action-primary)] text-black hover:bg-lime-400'}`}>
                                    <Repeat size={14} /> Ofertar $50/mo
                                </button>
                            </div>
                            <div className={`p-5 rounded-2xl border flex items-center justify-between ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                                <div>
                                    <h4 className={`font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>Carlos G.</h4>
                                    <p className={`text-xs mt-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Recomposición (Día 88/90)</p>
                                </div>
                                <button onClick={() => handleBulkAction('Pase a Suscripción')} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-[var(--color-action-primary)] text-black hover:bg-lime-400'}`}>
                                    <Repeat size={14} /> Ofertar $50/mo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LTV & MRR Projections */}
                    <div className={`p-8 rounded-3xl border shadow-sm flex flex-col justify-center items-center text-center ${isClinical ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100' : 'bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border-indigo-500/20'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${isClinical ? 'bg-white text-indigo-600' : 'bg-zinc-900 text-indigo-400'}`}>
                            <TrendingUp size={32} />
                        </div>
                        <h4 className={`text-lg font-black mb-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>Ingreso Recurrente Base (MRR)</h4>
                        <p className={`text-4xl font-mono font-black mb-4 ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>$4,250 <span className="text-sm text-slate-500">/mes</span></p>
                        <p className={`text-sm max-w-sm ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                            Tienes 85 pacientes en la membresía de mantenimiento ("Retainer"). Esto cubre tus costos operativos antes de vender una sola transformación nueva.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

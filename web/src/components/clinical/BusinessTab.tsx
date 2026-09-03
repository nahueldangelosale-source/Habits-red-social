import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, DollarSign, ArrowRight, Star, Zap, ShoppingCart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const KANBAN_STAGES = [
    { id: 'onboarding', title: 'Fase 1: Eliminación', count: 42, color: 'border-slate-300' },
    { id: 'active', title: 'Fase 2: Reintroducción', count: 85, color: 'border-indigo-400' },
    { id: 'maintenance', title: 'Fase 3: Estilo de Vida', count: 120, color: 'border-emerald-400' }
];

const MOCK_UPSELLS = [
    {
        id: 'u1',
        patientName: 'Elena Gomez',
        reason: 'Meseta en pérdida de peso (14 días sin cambio en Apple Health).',
        product: 'Kit Optimización Metabólica',
        price: 150,
        commission: 120
    },
    {
        id: 'u2',
        patientName: 'Diego Lopez',
        reason: 'Finalizando Fase 3 exitosamente. Alta propensión a expansión.',
        product: 'Suscripción Longevidad (Anual)',
        price: 499,
        commission: 400
    }
];

export const BusinessTab: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const [processingUpsell, setProcessingUpsell] = useState<string | null>(null);

    const handleSendUpsell = (id: string) => {
        setProcessingUpsell(id);
        setTimeout(() => {
            setProcessingUpsell(null);
            // Removes from UI for demo
        }, 2000);
    };

    return (
        <div className="flex flex-col gap-8">
            
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl border flex items-center justify-between ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">MRR Total</div>
                        <div className="text-3xl font-black">$12,450</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <DollarSign size={24} />
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border flex items-center justify-between ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Cohorte Activa</div>
                        <div className="text-3xl font-black">247</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Users size={24} />
                    </div>
                </div>
                <div className={`p-6 rounded-3xl border flex items-center justify-between bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-600 shadow-xl shadow-amber-500/20`}>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1 flex items-center gap-1"><Zap size={12} /> Oportunidades Upsell</div>
                        <div className="text-3xl font-black">+$649</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Kanban Cohortes (1-to-Many) */}
                <div className="xl:col-span-8">
                    <div className={`p-6 rounded-3xl border h-[600px] flex flex-col ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold font-sans">Gestión de Cohortes (Drip Content)</h3>
                            <p className="text-sm opacity-60">Visualización de pacientes en programas automatizados.</p>
                        </div>
                        
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            {KANBAN_STAGES.map(stage => (
                                <div key={stage.id} className={`bg-slate-50/50 rounded-2xl border-t-4 p-4 flex flex-col ${stage.color} ${isClinical ? 'bg-slate-50' : 'bg-zinc-950 border-zinc-800'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-sm">{stage.title}</h4>
                                        <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold">{stage.count}</span>
                                    </div>
                                    <div className="flex-1 space-y-2 overflow-y-auto">
                                        {/* Mock Cards */}
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={`p-3 rounded-xl border shadow-sm text-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-700'}`}>
                                                <div className="font-bold mb-1">Paciente {stage.id}-{i}</div>
                                                <div className="text-xs opacity-50 flex items-center justify-between">
                                                    <span>Día 14/30</span>
                                                    <span className="text-emerald-500 font-bold">100% Adh</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="p-3 text-center opacity-30 text-xs font-bold">... {stage.count - 3} más</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upselling Engine */}
                <div className="xl:col-span-4 space-y-4">
                    <h3 className="text-xl font-bold font-sans px-2">Expansion Propensity (IA)</h3>
                    <p className="text-sm opacity-60 px-2 mb-4">Señales detectadas para Upselling automatizado.</p>

                    {MOCK_UPSELLS.map(upsell => (
                        <div key={upsell.id} className={`p-5 rounded-3xl border shadow-lg ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="font-bold text-lg">{upsell.patientName}</div>
                                <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                    <Star size={12} /> Alta Probabilidad
                                </div>
                            </div>
                            <p className="text-sm opacity-70 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">{upsell.reason}</p>
                            
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-4 relative overflow-hidden">
                                <ShoppingCart size={80} className="absolute -right-4 -bottom-4 opacity-5 text-indigo-900" />
                                <div className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-1">Sugerencia de Oferta</div>
                                <div className="font-bold text-indigo-900">{upsell.product}</div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-2xl font-black text-indigo-700">${upsell.price}</span>
                                    <span className="text-xs text-indigo-500/70 font-medium">Tu comisión: ${upsell.commission}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleSendUpsell(upsell.id)}
                                disabled={processingUpsell === upsell.id}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                {processingUpsell === upsell.id ? (
                                    <span className="animate-pulse">Enviando Nudge + Payment Link...</span>
                                ) : (
                                    <>Enviar Oferta (1-Click) <ArrowRight size={16} /></>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

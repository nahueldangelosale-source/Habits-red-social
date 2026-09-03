import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check, X, MessageSquare, Calendar as CalendarIcon, BatteryWarning, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

interface RetentionAlert {
    id: string;
    athleteName: string;
    athletePhoto?: string;
    criScore: number; // 0-100
    triggerReason: string;
    aiDiagnostic: string;
    proposedMessage: string;
    proposedCalendarPayload: string;
}

const MOCK_ALERTS: RetentionAlert[] = []; // Empty state for onboarding

export const RetentionRadarWidget: React.FC = () => {
    const [queue, setQueue] = useState<RetentionAlert[]>(MOCK_ALERTS);
    const [isExecuting, setIsExecuting] = useState(false);
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    if (queue.length === 0) {
        return (
            <div className={`mb-10 px-4 py-3 rounded-2xl border flex items-center gap-3 ${
                isClinical ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'
            }`}>
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-bold tracking-wide">SNC y Retención en Óptimas Condiciones. No hay alertas activas.</span>
            </div>
        );
    }

    const currentAlert = queue[0];

    const handleAction = (action: 'APPROVE' | 'DISMISS') => {
        if (action === 'APPROVE') {
            setIsExecuting(true);
            setTimeout(() => {
                toast.success('Hibridación Exitosa: Calendario ajustado y WhatsApp preparado.', {
                    icon: '🚀',
                    style: { background: '#18181b', color: '#10b981', border: '1px solid #059669' }
                });
                setIsExecuting(false);
                setQueue(prev => prev.slice(1));
            }, 1200);
        } else {
            toast('Alerta ignorada. Vigilancia pasiva activada.', {
                icon: '👀',
                style: { background: '#18181b', color: '#a1a1aa', border: '1px solid #3f3f46' }
            });
            setQueue(prev => prev.slice(1));
        }
    };

    return (
        <div className="mb-10 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
                <div>
                    <h3 className={`text-lg font-black flex items-center gap-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        <BatteryWarning className="text-rose-500" />
                        Triaje de Retención (WIP: 1)
                    </h3>
                    <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {queue.length} atletas en riesgo crítico de abandono.
                    </p>
                </div>
                <div className="bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    Acción Requerida
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                <motion.div 
                    key={currentAlert.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    className={`rounded-3xl border shadow-2xl overflow-hidden relative ${
                        isClinical ? 'bg-white border-rose-200' : 'bg-zinc-900 border-rose-900/30'
                    }`}
                >
                    {/* Header Score */}
                    <div className="bg-gradient-to-r from-rose-600 to-rose-800 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            {currentAlert.athletePhoto ? (
                                <img src={currentAlert.athletePhoto} alt="athlete" className="w-10 h-10 rounded-full border-2 border-white/20" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center font-bold">
                                    {currentAlert.athleteName.substring(0, 2)}
                                </div>
                            )}
                            <div>
                                <h4 className="font-black text-lg">{currentAlert.athleteName}</h4>
                                <p className="text-xs text-rose-100 font-medium">Índice de Riesgo (CRI): {currentAlert.criScore}%</p>
                            </div>
                        </div>
                        <ShieldAlert className="text-white opacity-50" size={32} />
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Telemetry Context */}
                        <div className="mb-6">
                            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isClinical ? 'text-rose-600' : 'text-rose-500'}`}>
                                Telemetría Oscura Detectada
                            </p>
                            <p className={`font-medium ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>
                                {currentAlert.triggerReason}
                            </p>
                            <div className={`mt-3 p-3 rounded-xl border text-sm ${
                                isClinical ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-amber-500/5 border-amber-500/10 text-amber-500'
                            }`}>
                                <span className="font-bold">Diagnóstico IA: </span> {currentAlert.aiDiagnostic}
                            </div>
                        </div>

                        {/* Proposed Hybrid Intervention */}
                        <div className="mb-8 relative">
                            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${
                                isClinical ? 'text-indigo-600' : 'text-indigo-400'
                            }`}>
                                <ArrowUpRight size={14} /> Solución Híbrida Propuesta (1 Clic)
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Action 1: System Payload */}
                                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                                    isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
                                }`}>
                                    <div>
                                        <div className={`flex items-center gap-2 mb-2 ${isClinical ? 'text-slate-700' : 'text-zinc-400'}`}>
                                            <CalendarIcon size={16} /> <span className="text-xs font-bold uppercase">Ajuste de Calendario</span>
                                        </div>
                                        <p className={`text-sm font-medium ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                            {currentAlert.proposedCalendarPayload}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                                        <Check size={12} /> Listo para inyectar
                                    </div>
                                </div>

                                {/* Action 2: Human Touch */}
                                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                                    isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
                                }`}>
                                    <div>
                                        <div className={`flex items-center gap-2 mb-2 ${isClinical ? 'text-slate-700' : 'text-zinc-400'}`}>
                                            <MessageSquare size={16} /> <span className="text-xs font-bold uppercase">Borrador Empático</span>
                                        </div>
                                        <p className={`text-xs italic ${isClinical ? 'text-slate-600' : 'text-zinc-300'}`}>
                                            "{currentAlert.proposedMessage}"
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-center gap-1 text-[10px] text-indigo-500 font-bold">
                                        <ArrowUpRight size={12} /> Abrirá WhatsApp Web
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Validation Actions */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleAction('DISMISS')}
                                disabled={isExecuting}
                                className={`flex-1 py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all ${
                                    isClinical 
                                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                }`}
                            >
                                <X size={18} /> Ignorar Alerta
                            </button>
                            <button 
                                onClick={() => handleAction('APPROVE')}
                                disabled={isExecuting}
                                className={`flex-[2] py-4 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all shadow-lg transform hover:-translate-y-1 ${
                                    isExecuting 
                                        ? 'bg-indigo-500/50 text-white cursor-wait animate-pulse' 
                                        : isClinical
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                                            : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
                                }`}
                            >
                                {isExecuting ? (
                                    <>Procesando Intervención...</>
                                ) : (
                                    <><Check size={18} /> Autorizar Intervención Híbrida</>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

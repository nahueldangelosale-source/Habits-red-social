import React from 'react';
import { AlertTriangle, Phone, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CriticalAlert {
    patientId: string;
    patientName: string;
    alertType: 'weight_spike' | 'hyperglycemia' | 'severe_hypoglycemia';
    message: string;
    value: string;
    time: string;
}

interface TriageLevel1Props {
    alerts: CriticalAlert[];
    onAction: (patientId: string, action: string) => void;
}

export const TriageLevel1: React.FC<TriageLevel1Props> = ({ alerts, onAction }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    if (alerts.length === 0) return null;

    return (
        <section aria-label="Radar de Acción Inmediata" className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> 
                Nivel 1: Acción Inmediata ({alerts.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map(alert => (
                    <article key={alert.patientId} className={`relative overflow-hidden flex flex-col p-4 rounded-2xl border shadow-lg ${
                        isClinical ? 'bg-white border-rose-200' : 'bg-[#1a0f14] border-rose-900/50'
                    }`}>
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${isClinical ? 'bg-gradient-to-b from-rose-500 to-rose-600' : 'bg-gradient-to-b from-rose-600 to-rose-700'}`} />
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className={`font-black text-xl tracking-tight flex items-center gap-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                    {alert.patientName}
                                </h4>
                                <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-xs font-bold ${isClinical ? 'bg-rose-50 text-rose-600' : 'bg-rose-500/10 text-rose-400'}`}>
                                    <AlertTriangle size={12} /> {alert.message}
                                </div>
                            </div>
                            <div className={`text-2xl font-black font-sans tracking-tighter ${isClinical ? 'text-rose-600' : 'text-rose-500'}`}>
                                {alert.value}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-rose-500/10">
                            <button 
                                onClick={() => onAction(alert.patientId, 'call')}
                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm ${
                                    isClinical ? 'bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                }`}
                            >
                                <Phone size={16} /> Contactar
                            </button>
                            <button 
                                onClick={() => window.location.href='/plan-builder'}
                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg ${
                                    isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                            >
                                <Activity size={16} /> Intervenir Plan
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

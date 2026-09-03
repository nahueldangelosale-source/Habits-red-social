import React, { useState } from 'react';
import { Activity, Moon, Zap, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export const MetabolicGPSWidget: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    
    const [isSyncing, setIsSyncing] = useState(false);
    const [wearableEvent, setWearableEvent] = useState<'NONE' | 'POOR_SLEEP' | 'LOW_HRV'>('NONE');

    const handleSimulateEvent = (event: 'POOR_SLEEP' | 'LOW_HRV') => {
        setIsSyncing(true);
        setTimeout(() => {
            setWearableEvent(event);
            setIsSyncing(false);
            window.dispatchEvent(new CustomEvent('wearable-sync', { detail: { event } }));
        }, 1500);
    };

    return (
        <div className={`p-4 rounded-3xl border shadow-sm ${
            isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
        }`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Activity size={20} />
                </div>
                <div>
                    <h3 className={`font-bold text-sm ${isClinical ? 'text-slate-800' : 'text-white'}`}>GPS Metabólico</h3>
                    <p className={`text-xs ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Integración Continua con Wearables</p>
                </div>
                <div className={`ml-auto px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 border ${
                    isClinical 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                        : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                }`}>
                    <ShieldCheck size={12} /> Apple HealthKit Activo
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <button 
                    onClick={() => handleSimulateEvent('POOR_SLEEP')}
                    disabled={isSyncing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                        wearableEvent === 'POOR_SLEEP' 
                            ? (isClinical ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-amber-950/30 border-amber-900/55 text-amber-400')
                            : (isClinical ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-zinc-800 border-zinc-700 text-zinc-350 hover:bg-zinc-750')
                    }`}
                >
                    <Moon size={14} /> Simular Sueño &lt; 6h
                </button>
                <button 
                    onClick={() => handleSimulateEvent('LOW_HRV')}
                    disabled={isSyncing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                        wearableEvent === 'LOW_HRV' 
                            ? (isClinical ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-rose-950/30 border-rose-900/55 text-rose-400')
                            : (isClinical ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-zinc-800 border-zinc-700 text-zinc-350 hover:bg-zinc-750')
                    }`}
                >
                    <Activity size={14} /> Simular Caída HRV
                </button>
            </div>

            {isSyncing && (
                <div className="text-center p-4">
                    <Zap className="w-6 h-6 text-indigo-500 animate-pulse mx-auto mb-2" />
                    <p className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Sincronizando Biometría...</p>
                </div>
            )}

            {!isSyncing && wearableEvent !== 'NONE' && (
                <div className={`p-4 rounded-2xl border ${
                    wearableEvent === 'POOR_SLEEP' 
                        ? (isClinical ? 'bg-amber-50 border-amber-200' : 'bg-amber-950/20 border-amber-900/40') 
                        : (isClinical ? 'bg-rose-50 border-rose-200' : 'bg-rose-950/20 border-rose-900/40')
                }`}>
                    <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${
                        wearableEvent === 'POOR_SLEEP' ? (isClinical ? 'text-amber-800' : 'text-amber-400') : (isClinical ? 'text-rose-800' : 'text-rose-400')
                    }`}>
                        Resistencia Transitoria Detectada
                    </h4>
                    <p className={`text-sm font-medium ${
                        wearableEvent === 'POOR_SLEEP' ? (isClinical ? 'text-amber-700' : 'text-amber-300') : (isClinical ? 'text-rose-700' : 'text-rose-300')
                    }`}>
                        {wearableEvent === 'POOR_SLEEP' 
                            ? 'El usuario reportó solo 5h 30m de sueño (Oura Ring).'
                            : 'Caída de 15% en la Variabilidad de Frecuencia Cardíaca base.'}
                    </p>
                    <div className={`mt-3 p-3 rounded-xl border ${
                        isClinical ? 'bg-white/60 border-white' : 'bg-zinc-950/40 border-zinc-800/80'
                    }`}>
                        <p className={`text-xs font-bold ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>Recalibración Invisible Aplicada:</p>
                        <ul className={`text-xs mt-1 space-y-1 list-disc pl-4 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                            <li className={`font-medium ${isClinical ? 'text-rose-600' : 'text-rose-400'}`}>-20% Carbohidratos Glucémicos</li>
                            <li className={`font-medium ${isClinical ? 'text-emerald-600' : 'text-emerald-400'}`}>+10% Grasas Saludables</li>
                        </ul>
                        <p className={`text-[10px] mt-2 font-mono ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Enviando Nudge Predictivo al paciente para reducir culpa...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

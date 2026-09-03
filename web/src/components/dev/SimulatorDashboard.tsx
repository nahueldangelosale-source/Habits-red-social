import React, { useState } from 'react';
import { useGlobalSimulator } from '../../stores/useGlobalSimulator';
import { Settings, Play, ShieldAlert, HeartPulse, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';

export const SimulatorDashboard: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const simulator = useGlobalSimulator();

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-[9999] bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-full p-3 shadow-2xl flex items-center gap-2 font-bold text-xs"
            >
                <Settings className="w-4 h-4" />
                SIMULADOR
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-[9999] w-80 bg-zinc-950 border border-fuchsia-500/50 rounded-2xl shadow-[0_0_30px_rgba(192,38,211,0.2)] overflow-hidden text-sm">
            <div className="bg-fuchsia-900/40 p-3 border-b border-fuchsia-500/30 flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(false)}>
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-fuchsia-400" />
                    <span className="font-bold text-fuchsia-100 uppercase tracking-widest text-xs">Modo Dios</span>
                </div>
                <ChevronDown className="w-4 h-4 text-fuchsia-300" />
            </div>

            <div className="p-4 space-y-4">
                {/* Visualizador de Estado */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 mb-4 bg-black/50 p-2 rounded-lg">
                    <div>Atletas B2B: <span className="text-white font-bold">{simulator.gymActiveClients}</span></div>
                    <div>MRR: <span className="text-emerald-400 font-bold">${simulator.gymActiveClients * simulator.gymBaseMRR}</span></div>
                    <div>Alertas PRO: <span className={simulator.proHasNewAlert ? "text-red-400 font-bold" : "text-zinc-500"}>{simulator.proHasNewAlert ? 'ACTIVA' : 'No'}</span></div>
                    <div>Atleta Stress: <span className="text-white font-bold">{simulator.athleteStressLevel}</span></div>
                </div>

                {/* Acciones */}
                <div className="space-y-2">
                    <button 
                        onClick={() => simulator.triggerOnboardClient('Juan Pérez')}
                        className="w-full text-left px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 flex items-center transition-colors"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        1. Dar de Alta a Juan (B2B)
                    </button>

                    <button 
                        onClick={() => simulator.triggerWorkoutCompletion(9)}
                        className="w-full text-left px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-300 flex items-center transition-colors"
                    >
                        <HeartPulse className="w-4 h-4 mr-2" />
                        2. Juan reporta RPE 9 (B2C)
                    </button>

                    <button 
                        onClick={() => simulator.triggerReportStress()}
                        className="w-full text-left px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 flex items-center transition-colors"
                    >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        3. Forzar Lesión/Stress (B2C)
                    </button>
                    
                    <button 
                        onClick={() => simulator.triggerHabitCompletion()}
                        className="w-full text-left px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-300 flex items-center transition-colors"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        4. Juan completa Hábito (B2C)
                    </button>
                </div>

                <div className="pt-2 mt-2 border-t border-white/5">
                    <button 
                        onClick={() => simulator.resetSimulator()}
                        className="w-full py-2 text-zinc-500 hover:text-white flex items-center justify-center text-xs transition-colors"
                    >
                        <RotateCcw className="w-3 h-3 mr-1" /> Resetear Estado
                    </button>
                </div>
            </div>
        </div>
    );
};

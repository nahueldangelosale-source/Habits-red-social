import React, { useState } from 'react';
import { syncEngine } from '../../../infrastructure/async/BackgroundSyncEngine';
import { useViewTransition } from '../../../shared/hooks/useViewTransition';
import { Activity, CheckCircle2 } from 'lucide-react';

/**
 * WodLogger
 * Demuestra la arquitectura `Zero Latency` (Local-First).
 * Elimina los spinners bloqueantes. La vista transiciona instantáneamente.
 */
export const WodLogger: React.FC = () => {
  const [wodTime, setWodTime] = useState('');
  const [syncedId, setSyncedId] = useState<string | null>(null);
  const { transitionViewIfSupported } = useViewTransition();

  const handleLogWod = async () => {
    if (!wodTime) return;

    // Mutación Inmediata a Edge SQLite (0ms UI Blocking)
    // El syncEngine enruta la data a libSQL usando UUIDv7 para CRDT
    const id = await syncEngine.enqueueMutation('WOD_LOG', {
        timeSeconds: parseInt(wodTime, 10),
        loggedAt: new Date().toISOString()
    });

    // View Transition instantánea sin "Await" visible para el usuario
    transitionViewIfSupported(() => {
        setSyncedId(id);
        setWodTime('');
    });
  };

  return (
    <div className="card-glass p-6 max-w-sm mx-auto shadow-neon backdrop-blur-2xl bg-zinc-950/40 border border-white/5 rounded-2xl relative overflow-hidden" style={{ viewTransitionName: 'wod-logger-card' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-bl-full blur-[40px] pointer-events-none"></div>

        {!syncedId ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center gap-2 text-white mb-4">
                    <Activity className="text-lime-400" size={20} />
                    <h3 className="font-bold uppercase tracking-widest text-sm text-zinc-300">Registrar WOD</h3>
                </div>
                
                <input 
                    type="number"
                    placeholder="Tiempo (Segundos)"
                    value={wodTime}
                    onChange={(e) => setWodTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-3 font-mono focus:border-lime-500 focus:ring-1 focus:ring-lime-500/50 outline-none transition-all"
                />

                {/* NO HAY SPINNER AQUI (Cero Latencia por diseño) */}
                <button 
                    onClick={handleLogWod}
                    className="w-full bg-lime-400 hover:bg-lime-300 text-black font-bold uppercase tracking-widest py-3 rounded-xl transition-transform ease-spring hover:scale-[1.05]"
                >
                    Log Time (Local-First)
                </button>
                <p className="text-xs text-zinc-500 text-center font-mono mt-2 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse-subtle"></span>
                    Powered by Edge SQLite
                </p>
            </div>
        ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in-95 ease-spring duration-500">
                <div className="w-16 h-16 rounded-full bg-lime-400/20 flex items-center justify-center shadow-[0_0_30px_rgba(163,230,53,0.3)]">
                    <CheckCircle2 size={32} className="text-lime-400" />
                </div>
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">WOD Registrado</h3>
                <p className="text-zinc-500 text-xs font-mono max-w-[200px]">
                    Sincronización en 2do plano vía CRDT.
                </p>
                <button 
                    onClick={() => transitionViewIfSupported(() => setSyncedId(null))}
                    className="mt-4 px-4 py-2 border border-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/5 transition-colors"
                >
                    Registrar Otro
                </button>
            </div>
        )}
    </div>
  );
};

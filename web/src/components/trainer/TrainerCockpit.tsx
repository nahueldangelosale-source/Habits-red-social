import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Square, Activity, Send, Pizza, Wine, Leaf, Coffee, Flame, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const TrainerCockpit: React.FC = () => {
  // --- TTR Telemetry State ---
  const [callStatus, setCallStatus] = useState<'IDLE' | 'IN_CALL' | 'POST_CALL' | 'ROUTINE_ISSUED'>('IDLE');
  const [ttrStartTime, setTtrStartTime] = useState<number | null>(null);
  const [ttrElapsedMs, setTtrElapsedMs] = useState<number>(0);

  // --- Qualitative Data (Zero Text, Muscle Memory) ---
  const [data, setData] = useState({
    cheatMeals: false,
    alcohol: false,
    vegan: false,
    fasting: false,
    highStress: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Background Async Save (Debounced)
  const initialMount = useRef(true);
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    
    setIsSaving(true);
    const handler = setTimeout(() => {
      // Mock Async DB Patch
      console.log('Background sync (JSONB):', data);
      setIsSaving(false);
    }, 800);

    return () => clearTimeout(handler);
  }, [data]);

  // TTR Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callStatus === 'POST_CALL' && ttrStartTime) {
      interval = setInterval(() => {
        setTtrElapsedMs(Date.now() - ttrStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, ttrStartTime]);

  const toggleField = (key: keyof typeof data) => {
    setData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartCall = () => setCallStatus('IN_CALL');
  
  const handleEndCall = () => {
    // API Hook: Google Meet webhook / Cal.com call.ended event maps here
    setCallStatus('POST_CALL');
    setTtrStartTime(Date.now());
    toast.success('Llamada finalizada. TTR Tracker iniciado.', { icon: '⏱️' });
  };

  const handleEmitRoutine = () => {
    if (!ttrStartTime) return;
    const finalTTR = Date.now() - ttrStartTime;
    const ttrMinutes = (finalTTR / 60000).toFixed(2);
    
    setCallStatus('ROUTINE_ISSUED');
    toast.success(`Rutina emitida. TTR: ${ttrMinutes} minutos.`, { 
      icon: '🚀',
      duration: 5000 
    });

    // Emitting Telemetry to the central brain
    console.log(`[TELEMETRY] TTR: ${finalTTR}ms. Target: < 180000ms`);
  };

  const formatTTR = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-80 h-screen bg-slate-950 border-l border-white/10 flex flex-col shadow-2xl flex-shrink-0 absolute right-0 top-0 z-50">
      
      {/* HEADER HUD */}
      <div className="p-5 border-b border-white/10 bg-black/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-montserrat font-black tracking-wide text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-lime-400" />
            TRAINER HUD
          </h2>
          <div className="flex items-center gap-2">
            {isSaving && <Save className="w-3 h-3 text-indigo-400 animate-pulse" />}
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* TTR Telemetry Monitor */}
        <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5 flex items-center justify-between">
          <span className="font-montserrat text-xs font-bold text-slate-400">TTR</span>
          <span className={`font-mono text-lg font-bold tracking-wider ${
            callStatus === 'ROUTINE_ISSUED' ? 'text-lime-400' :
            (ttrElapsedMs > 180000 ? 'text-rose-500' : 'text-indigo-400')
          }`}>
            {formatTTR(ttrElapsedMs)}
          </span>
        </div>
      </div>

      {/* CALL CONTROLS */}
      <div className="p-4 flex gap-2 border-b border-white/5 bg-slate-900/20">
        {callStatus === 'IDLE' && (
          <button onClick={handleStartCall} className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center gap-2 font-montserrat font-bold text-xs transition-colors border border-emerald-500/20">
            <Play className="w-3 h-3 fill-current" /> Kick-off
          </button>
        )}
        {callStatus === 'IN_CALL' && (
          <button onClick={handleEndCall} className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center gap-2 font-montserrat font-bold text-xs transition-colors border border-rose-500/20 animate-pulse">
            <Square className="w-3 h-3 fill-current" /> Terminar Llamada
          </button>
        )}
      </div>

      {/* MUSCLE MEMORY TOGGLES (Zero Text Entry) */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <h3 className="font-montserrat text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Teleprompter Clínico</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <HUDToggle 
            active={data.cheatMeals} 
            onClick={() => toggleField('cheatMeals')} 
            icon={<Pizza className="w-5 h-5" />} 
            label="Cheat Meal" 
            color="amber"
          />
          <HUDToggle 
            active={data.alcohol} 
            onClick={() => toggleField('alcohol')} 
            icon={<Wine className="w-5 h-5" />} 
            label="Alcohol" 
            color="rose"
          />
          <HUDToggle 
            active={data.vegan} 
            onClick={() => toggleField('vegan')} 
            icon={<Leaf className="w-5 h-5" />} 
            label="Plant Based" 
            color="emerald"
          />
          <HUDToggle 
            active={data.fasting} 
            onClick={() => toggleField('fasting')} 
            icon={<Coffee className="w-5 h-5" />} 
            label="Ayuno Int." 
            color="indigo"
          />
          <HUDToggle 
            active={data.highStress} 
            onClick={() => toggleField('highStress')} 
            icon={<Flame className="w-5 h-5" />} 
            label="Estrés Alto" 
            color="orange"
          />
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="p-5 border-t border-white/10 bg-black/40">
        <button 
          onClick={handleEmitRoutine}
          disabled={callStatus !== 'POST_CALL'}
          className="w-full py-4 rounded-xl font-montserrat font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-lime-400 text-black hover:bg-lime-300 shadow-[0_0_20px_rgba(163,230,53,0.3)]"
        >
          <Send className="w-4 h-4" />
          Emitir Rutina
        </button>
      </div>
    </div>
  );
};

// Sub-component for muscle-memory toggles
const HUDToggle = ({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) => {
  const colorMap: Record<string, string> = {
    amber: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    rose: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
    emerald: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    indigo: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400',
    orange: 'border-orange-500/50 bg-orange-500/10 text-orange-400',
    default: 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-colors h-24 ${active ? colorMap[color] : colorMap.default}`}
    >
      <div className={active ? '' : 'opacity-50'}>{icon}</div>
      <span className="font-lato text-xs font-bold text-center leading-tight">{label}</span>
    </motion.button>
  );
};

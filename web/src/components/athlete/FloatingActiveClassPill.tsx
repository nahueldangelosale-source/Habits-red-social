import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize2, Check, User, Clock } from 'lucide-react';
import { useLiveClassStore } from '../../stores/useLiveClassStore';

export const FloatingActiveClassPill: React.FC = () => {
  const { 
    activeClass, 
    isModalOpen, 
    openModal, 
    pauseClass, 
    resumeClass, 
    finishClass,
    getElapsedSeconds 
  } = useLiveClassStore();

  const [, setTick] = useState(0);

  useEffect(() => {
    if (activeClass?.isRunning) {
      const interval = setInterval(() => setTick(t => t + 1), 500);
      return () => clearInterval(interval);
    }
  }, [activeClass?.isRunning]);

  // Solo mostrar si hay una clase activa y el modal principal está minimizado/cerrado
  if (!activeClass || isModalOpen) return null;

  const seconds = getElapsedSeconds();
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.9 }}
        className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-slate-900/95 text-white backdrop-blur-md rounded-2xl border border-indigo-500/40 p-3 shadow-2xl flex items-center justify-between gap-3 font-lato"
      >
        {/* Isotipo y Cronómetro */}
        <div 
          onClick={openModal}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-md">
              {activeClass.activityType === 'CROSSFIT' ? '🏋️' : activeClass.activityType === 'YOGA' ? '🧘' : activeClass.activityType === 'RUNNING' ? '🏃' : activeClass.activityType === 'SWIMMING' ? '🏊' : '⚡'}
            </div>
            {activeClass.isRunning && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded">
                EN VIVO
              </span>
              <p className="text-xs font-black truncate group-hover:text-indigo-400 transition-colors">
                {activeClass.title}
              </p>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
              <Clock size={10} className="text-indigo-400" />
              <span className="text-indigo-300 font-bold">{formattedTime}</span>
              <span>• {activeClass.instructorName}</span>
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeClass.isRunning) pauseClass();
              else resumeClass();
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeClass.isRunning ? 'bg-amber-500 text-slate-950 hover:bg-amber-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
            title={activeClass.isRunning ? 'Pausar' : 'Reanudar'}
          >
            {activeClass.isRunning ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            type="button"
            onClick={openModal}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="Abrir pantalla completa"
          >
            <Maximize2 size={13} />
          </button>

          <button
            type="button"
            onClick={finishClass}
            className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:opacity-95 text-white font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow-xs"
            title="Finalizar y guardar clase"
          >
            <Check size={12} />
            <span className="hidden sm:inline">Finalizar</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { Camera, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaselinePhotoModal } from './BaselinePhotoModal';

export const BaselinePhotoCard: React.FC = () => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('athlete-baseline-card-dismissed') === 'true';
  });
  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem('athlete-baseline-photo-completed') === 'true';
  });

  // Si ya se completó o se descartó, DESAPARECE del Inicio para no duplicar
  if (isCompleted || isDismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem('athlete-baseline-card-dismissed', 'true');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-3xl border border-indigo-200/70 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-[#0f1120] dark:via-[#0c0f18] dark:to-[#140f26] p-4 sm:p-5 shadow-sm font-lato relative overflow-hidden group cursor-pointer"
        onClick={() => setIsPhotoModalOpen(true)}
      >
        {/* Glow Accent */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0 group-hover:scale-105 transition-transform">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Sparkles size={10} /> +100 XP Recompensa
                </span>
              </div>
              <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white mt-1">
                📸 Tu Foto de Punto de Partida (Opcional)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Sácate tu foto hoy para ver tu cambio en 30 días
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            title="Ocultar por ahora"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Footer Action */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck size={13} className="text-emerald-500" />
            100% Privado (solo tú y tu coach)
          </span>

          <span className="flex items-center gap-1 text-xs group-hover:translate-x-1 transition-transform">
            <span>Sacar Foto Guiada</span>
            <ArrowRight size={13} />
          </span>
        </div>
      </motion.div>

      {/* Modal de Captura */}
      <BaselinePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setIsCompleted(localStorage.getItem('athlete-baseline-photo-completed') === 'true');
        }}
        onPhotoSaved={() => {
          setIsCompleted(true);
        }}
      />
    </>
  );
};

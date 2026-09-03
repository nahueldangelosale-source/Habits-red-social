import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Activity, Dumbbell, Apple, ShieldAlert, Award, 
  Flame, TrendingUp, Calendar, HeartPulse, Sparkles, ChevronRight, ExternalLink,
  CheckCircle2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AthleteQuickCardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tab: 'profile' | 'activity';
  athleteName: string;
  athleteAvatar: string;
}

export const AthleteQuickCardDrawer: React.FC<AthleteQuickCardDrawerProps> = ({
  isOpen,
  onClose,
  tab,
  athleteName,
  athleteAvatar
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end" onClick={onClose}>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-md bg-white dark:bg-[#0c0f18] h-full shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden font-lato"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <img
                src={athleteAvatar}
                alt={athleteName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    {athleteName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Nivel 14
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {tab === 'profile' ? 'Ficha Clínica & Deportiva' : 'Línea de Tiempo & Actividad'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
            
            {tab === 'profile' ? (
              /* FICHA CLÍNICA & DEPORTIVA */
              <div className="space-y-4">
                {/* Resumen General */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                      Objetivo Activo
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-100">
                      Hipertrofia & Recomp.
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-zinc-900 border border-emerald-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                      Racha Activa
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-zinc-100 flex items-center gap-1">
                      <Flame size={14} className="text-amber-500 fill-amber-500" /> 18 Días Seguidos
                    </span>
                  </div>
                </div>

                {/* Precauciones Médicas / Firewall */}
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                    <ShieldAlert size={15} />
                    <span>Firewall de Lesiones / Alertas</span>
                  </div>
                  <p className="text-xs text-rose-900/80 dark:text-rose-300 leading-relaxed">
                    Antecedente de molestia lumbar en L5-S1. Protocolo de Seguridad: Evitar sentadillas traseras a RPE &gt; 9 y limitar carga axial acumulada.
                  </p>
                </div>

                {/* Prescripción Nutricional */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-montserrat uppercase text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                      <Apple size={14} className="text-emerald-500" /> Macro Pauta Diaria
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      2,450 kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                      <span className="text-[9px] text-slate-400 font-bold block">Proteína</span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">180g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                      <span className="text-[9px] text-slate-400 font-bold block">Carbos</span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">260g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                      <span className="text-[9px] text-slate-400 font-bold block">Grasas</span>
                      <span className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono">70g</span>
                    </div>
                  </div>
                </div>

                {/* Récords Personales (1RM) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-2.5">
                  <span className="text-xs font-black font-montserrat uppercase text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                    <Award size={14} className="text-amber-500" /> Récords de Fuerza Estimados
                  </span>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-zinc-300 font-medium">Sentadilla Trasera</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">160 kg (1RM)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-zinc-300 font-medium">Press de Banca</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">110 kg (1RM)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-zinc-300 font-medium">Peso Muerto Rumano</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">190 kg (1RM)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LÍNEA DE TIEMPO RECIENTE */
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black font-montserrat uppercase tracking-wider text-slate-400">
                    Línea de Tiempo del Atleta
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sincronizado
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Evento 1: Video de Sentadilla */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Dumbbell size={14} className="text-indigo-500" /> Fuerza Día 1 • Sentadilla Trasera
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Hoy 18:30</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                      Serie pesada de 100 kg completada (3 series x 8 reps). Video enviado para validación de profundidad y técnica.
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        100 kg
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        RPE 8.5
                      </span>
                    </div>
                  </div>

                  {/* Evento 2: Check-in de Comida */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Apple size={14} className="text-emerald-500" /> Check-in Almuerzo
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Hoy 13:15</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                      Pollo teriyaki con arroz y brócoli. Adherencia al 100% (+20 XP ganados).
                    </p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      620 kcal • P: 48g | C: 65g | G: 16g
                    </span>
                  </div>

                  {/* Evento 3: Registro de Hidratación */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Activity size={14} className="text-sky-500" /> Hidratación Óptima
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Hoy 11:00</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                      Completó 2.5 litros de agua pre-entreno. Hábito de hidratación matutina completado.
                    </p>
                  </div>

                  {/* Evento 4: Subida de Nivel / Gamificación */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" /> Subida de Nivel
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Ayer 20:00</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                      Alcanzó el Nivel 14 (Atleta Pro) tras cumplir 18 días continuos de racha perfecta.
                    </p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      +150 XP Racha Semanal
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Drawer Footer CTA */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/80">
            <button
              onClick={() => {
                onClose();
                navigate('/lab');
              }}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-montserrat font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <span>Abrir en Plan Builder Lab</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

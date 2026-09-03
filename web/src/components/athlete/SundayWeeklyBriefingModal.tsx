import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Trophy, Calendar, Dumbbell, Droplets, Flame, 
  ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, Rocket,
  Target, Compass, Zap, Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { useGamificationStore } from '../../stores/useGamificationStore';

interface SundayWeeklyBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName?: string;
}

export const SundayWeeklyBriefingModal: React.FC<SundayWeeklyBriefingModalProps> = ({
  isOpen,
  onClose,
  athleteName = 'Atleta'
}) => {
  const [slide, setSlide] = useState<1 | 2 | 3>(1);
  const { cycleName, phases } = usePlanBuilderStore();
  const { xp, level } = useGamificationStore();

  if (!isOpen) return null;

  // Datos simulados/calculados del ciclo
  const currentCycleTitle = cycleName && cycleName !== 'Nueva Plantilla' 
    ? cycleName 
    : 'Fuerza & Recomposición por Ciclos';
  const totalWeeks = phases?.[0]?.weeksCount || 4;
  const currentWeek = 2; // Semana 2 de 4
  const progressPercent = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));

  const handleFinish = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    const weekKey = `sunday_briefing_seen_w${currentWeek}_${new Date().getFullYear()}`;
    localStorage.setItem(weekKey, 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="w-full max-w-md bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]"
        >
          {/* Header con Barra de Progreso del Resumen */}
          <div className="p-5 pb-3 border-b border-zinc-800/80 bg-zinc-900/40 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Compass size={13} /> Tu Brújula Semanal • Domingo de Balance
              </span>
              <span className="text-[10px] font-bold text-zinc-400">
                Paso {slide} de 3
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 h-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`rounded-full transition-colors ${
                    slide >= i ? 'bg-amber-400' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Cuerpo del Resumen Semanal */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* SLIDE 1: TUS LOGROS DE LA SEMANA */}
            {slide === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  🏆
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    ¡Gran trabajo esta semana, {athleteName.split(' ')[0]}!
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Cada repetición y cada hábito cumplido suman para tu transformación.
                  </p>
                </div>

                {/* Tarjetas de Logros Semanales */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="text-xl">🏋️</span>
                    <p className="text-base font-black text-white mt-1">4 / 4</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Sesiones</p>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="text-xl">💧</span>
                    <p className="text-base font-black text-white mt-1">85%</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Hábitos</p>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-center">
                    <span className="text-xl">⚡</span>
                    <p className="text-base font-black text-amber-400 mt-1">+{xp || 280}</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">XP Ganados</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 text-left flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Tu constancia esta semana fue impecable. Tu cuerpo ya comenzó a responder.</span>
                </div>
              </motion.div>
            )}

            {/* SLIDE 2: EL MAPA DE TU CICLO Y RUMBO POR DELANTE */}
            {slide === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-2">
                    🗺️
                  </div>
                  <h3 className="text-xl font-bold text-white">El Rumbo de tu Ciclo</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Así avanza tu plan en el tiempo para no estancarte:
                  </p>
                </div>

                {/* Tarjeta del Ciclo con Barra de Progreso */}
                <div className="bg-zinc-900 border border-zinc-800 p-4.5 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                        Mesociclo Activo
                      </span>
                      <h4 className="text-sm font-black text-white">{currentCycleTitle}</h4>
                    </div>
                    <span className="text-xs font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                      Semana {currentWeek} de {totalWeeks}
                    </span>
                  </div>

                  {/* Barra Visual */}
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-zinc-400 mb-1">
                      <span>Progreso del Ciclo</span>
                      <span className="text-white">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Etapas Explicadas con Palabras Sencillas */}
                  <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5 text-zinc-300">
                      <span className="text-emerald-400 font-bold">✓ Sem 1:</span>
                      <span><strong>Adaptación:</strong> Aprendiste los ejercicios y fijaste la técnica base.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-indigo-300 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                      <span className="text-indigo-400 font-bold">👉 Sem 2:</span>
                      <span><strong>Intensificación:</strong> Tu cuerpo ya sabe qué hacer; buscamos 1 repetición más o un poquito más de peso.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-zinc-400">
                      <span className="font-bold">⏳ Sem 3-4:</span>
                      <span><strong>Consolidación & Deload:</strong> Pico de fuerza y semana de descanso activo para recuperarte al 100%.</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3: LO QUE SE VIENE LA PRÓXIMA SEMANA & MOTIVACIÓN */}
            {slide === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  🚀
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">
                    ¡Listos para una Nueva Semana!
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    El secreto del éxito no es la perfección, sino la constancia día a día.
                  </p>
                </div>

                {/* Tus 3 Metas para esta semana */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-left space-y-2.5 text-xs">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Tus 3 Metas para los Próximos 7 Días:
                  </p>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Completar tus sesiones de entrenamiento programadas.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Mantener activa tu racha de hidratación y descanso.</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Sumar más de 300 XP para subir al próximo nivel.</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-amber-500/10 border border-amber-500/20 text-xs text-zinc-300">
                  ✨ <em>"Cada domingo es una oportunidad para recargar energías y arrancar con foco."</em>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-5 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between shrink-0">
            {slide > 1 ? (
              <button
                type="button"
                onClick={() => setSlide((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white font-medium text-xs flex items-center gap-1.5 hover:bg-zinc-800/50 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Atrás</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-500 hover:text-zinc-400 font-medium py-2 px-3"
              >
                Cerrar
              </button>
            )}

            {slide < 3 ? (
              <button
                type="button"
                onClick={() => setSlide((prev) => (prev + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <span>Ver Mi Ciclo</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
              >
                <Rocket size={14} />
                <span>¡A Conquistar la Semana!</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

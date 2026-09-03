import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Target, Flame, Dumbbell, Sparkles, ArrowRight, ArrowLeft, 
  CheckCircle2, Users, Calendar, Trophy, Zap, Shield, Droplets, Share2, MessageCircle 
} from 'lucide-react';
import { useTribuStore, type ChallengeType } from '../../stores/useTribuStore';
import confetti from 'canvas-confetti';

interface CreateSquadChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  category: string;
  icon: string;
  defaultTarget: number;
  unit: string;
  defaultDurationDays: number;
  badge: string;
  gradientClass: string;
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    id: 't_habits_sync',
    title: '7 Días Sin Fallos',
    description: 'Sincronización total: cada miembro del squad debe cumplir el 100% de sus hábitos diarios durante una semana.',
    type: 'HABIT_SYNC',
    category: 'HABITOS',
    icon: '🔥',
    defaultTarget: 28,
    unit: 'Check-ins',
    defaultDurationDays: 7,
    badge: 'Titán Invencible 🛡️',
    gradientClass: 'from-amber-500/10 to-orange-500/10 border-amber-500/30'
  },
  {
    id: 't_volume_raid',
    title: 'Raid de Fuerza: 50,000 kg',
    description: 'Trabajo colaborativo en el gym. Sumamos el tonelaje levantado en cada serie de todos los integrantes.',
    type: 'COLLECTIVE_VOLUME',
    category: 'ENTRENO',
    icon: '🏋️',
    defaultTarget: 50000,
    unit: 'kg',
    defaultDurationDays: 7,
    badge: 'Levantadores Colosales ⚡',
    gradientClass: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30'
  },
  {
    id: 't_hydration_boost',
    title: 'Hidratación & Movilidad 100%',
    description: 'Pacto de salud: 3 litros de agua y 10 minutos de movilidad articular diarios por persona.',
    type: 'HABIT_SYNC',
    category: 'BIENESTAR',
    icon: '💧',
    defaultTarget: 28,
    unit: 'Días Cumplidos',
    defaultDurationDays: 7,
    badge: 'Espíritu Fluido 🌊',
    gradientClass: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
  },
  {
    id: 't_streak_pact',
    title: 'Pacto de Racha de Tribu',
    description: 'Protección colectiva: mantengan la racha activa durante 14 días continuos sin que nadie falle.',
    type: 'STREAK_PACT',
    category: 'RACHA',
    icon: '⚡',
    defaultTarget: 14,
    unit: 'Días Invictos',
    defaultDurationDays: 14,
    badge: 'Hermandad de Acero ⚔️',
    gradientClass: 'from-purple-500/10 to-pink-500/10 border-purple-500/30'
  }
];

export const CreateSquadChallengeModal: React.FC<CreateSquadChallengeModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createChallenge, members, squadName, inviteCode } = useTribuStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<ChallengeTemplate>(TEMPLATES[0]);
  const [customTitle, setCustomTitle] = useState(TEMPLATES[0].title);
  const [customDescription, setCustomDescription] = useState(TEMPLATES[0].description);
  const [targetValue, setTargetValue] = useState(TEMPLATES[0].defaultTarget);
  const [durationDays, setDurationDays] = useState(TEMPLATES[0].defaultDurationDays);

  const handleSelectTemplate = (template: ChallengeTemplate) => {
    setSelectedTemplate(template);
    setCustomTitle(template.title);
    setCustomDescription(template.description);
    // Calcular meta adaptativa según integrantes del squad
    const calculatedTarget = template.type === 'HABIT_SYNC' 
      ? members.length * template.defaultDurationDays 
      : template.defaultTarget;
    setTargetValue(calculatedTarget);
    setDurationDays(template.defaultDurationDays);
    setStep(2);
  };

  const handleLaunch = () => {
    const rewardXP = durationDays >= 14 ? 250 : 150;
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + durationDays * 86400000).toISOString();

    createChallenge({
      title: customTitle,
      description: customDescription,
      type: selectedTemplate.type,
      category: selectedTemplate.category,
      icon: selectedTemplate.icon,
      targetValue: Number(targetValue),
      unit: selectedTemplate.unit,
      durationDays: Number(durationDays),
      startDate,
      endDate,
      rewardXP,
      rewardBadge: selectedTemplate.badge
    });

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    confetti({
      particleCount: 140,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
    });

    setStep(3);
  };

  const handleShareOnWhatsApp = () => {
    const message = `🔥 ¡Nuevo Reto Activado en nuestro Escuadrón Habits! "${customTitle}". Súmate con nosotros para no perder la racha: https://habits.app/join/${inviteCode}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header con Identidad Habits. */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-amber-400/20">
                <Target size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white">Nuevo Reto de Tribu</h3>
                  <span className="font-bold text-xs text-transparent bg-clip-text bg-gradient-to-tr from-amber-500 to-rose-500">Habits.</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Paso {step} de 3 • Metas Compartidas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* PASO 1: SELECCIONAR PLANTILLA PEDAGÓGICA */}
            {step === 1 && (
              <div className="space-y-3.5">
                <div className="mb-2">
                  <h4 className="font-montserrat font-black text-base text-slate-900 dark:text-white">¿Qué objetivo quieren conquistar juntos?</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona un formato probado para impulsar la motivación del escuadrón.</p>
                </div>

                <div className="space-y-2.5">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-white/5 hover:border-indigo-500/40 text-left flex items-start gap-3.5 transition-all group active:scale-[0.99] shadow-sm"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 group-hover:scale-105 text-2xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 transition-transform shadow-sm">
                        {tmpl.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-montserrat font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {tmpl.title}
                          </h5>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {tmpl.defaultDurationDays} Días
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                          {tmpl.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                            <Trophy size={11} /> +150 XP
                          </span>
                          <span>•</span>
                          <span className="text-slate-500 dark:text-slate-400">{tmpl.badge}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 2: AJUSTAR PARÁMETROS DEL RETO */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div>
                    <h5 className="font-montserrat font-bold text-sm text-slate-900 dark:text-white">{selectedTemplate.title}</h5>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">Formato: {selectedTemplate.category}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Nombre del Reto
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                      Mensaje Motivacional para el Squad
                    </label>
                    <textarea
                      rows={2}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none transition-all resize-none shadow-sm"
                    />
                  </div>

                  {/* Duración */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                      Duración del Desafío
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[7, 14, 21, 30].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setDurationDays(days)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            durationDays === days
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {days} Días
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meta numérica */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      <span>Meta Colectiva ({selectedTemplate.unit})</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Meta para {members.length} atletas</span>
                    </div>
                    <input
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white font-mono outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Banner de Recompensa */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-400/20">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300">Recompensa al completar:</p>
                    <p className="text-[11px] text-slate-800 dark:text-white font-montserrat font-black">
                      +{durationDays >= 14 ? 250 : 150} XP para cada atleta • {selectedTemplate.badge}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 3: ÉXITO & LANZAMIENTO */}
            {step === 3 && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="font-montserrat font-black text-xl text-slate-900 dark:text-white">¡Reto Activado en el Squad!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Todos los integrantes de {squadName} han sido notificados. ¡Es hora de sumar esfuerzos!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-left shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-black mb-1">Reto en marcha</p>
                  <p className="font-montserrat font-black text-sm text-slate-900 dark:text-white">{customTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Meta: {targetValue} {selectedTemplate.unit} en {durationDays} días</p>
                </div>

                {/* Botón rápido para invitar amigos al reto */}
                <button
                  onClick={handleShareOnWhatsApp}
                  className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-montserrat font-black text-xs shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <MessageCircle size={16} className="fill-slate-950" />
                  <span>Avisar al Squad por WhatsApp</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/40 flex items-center justify-between gap-2">
            {step === 1 && (
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cancelar
              </button>
            )}

            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft size={14} /> Volver
                </button>
                <button
                  onClick={handleLaunch}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <span>Lanzar Reto al Squad</span>
                  <Zap size={14} />
                </button>
              </>
            )}

            {step === 3 && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-black text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                Ir a los Hábitos del Día 🚀
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

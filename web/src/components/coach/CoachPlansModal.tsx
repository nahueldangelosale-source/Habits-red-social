import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Sparkles, UserCheck, Shield, Zap, Star, 
  Crown, ArrowRight, MessageSquare, Video, Dumbbell, Award, KeyRound 
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useCoachStore, type ProfessionalCoach, type BusinessPlanTier } from '../../stores/useCoachStore';

interface CoachPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoachPlansModal: React.FC<CoachPlansModalProps> = ({ isOpen, onClose }) => {
  const { 
    activePlanTier, 
    availableCoaches, 
    assignedCoach, 
    assignCoach, 
    upgradePlan, 
    linkCoachByCode 
  } = useCoachStore();

  const [activeTab, setActiveTab] = useState<'PLANS' | 'MARKETPLACE' | 'CODE'>('PLANS');
  const [coachCode, setCoachCode] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState<string>(assignedCoach?.id || availableCoaches[0]?.id);

  if (!isOpen) return null;

  const handleSelectPlan = (tier: BusinessPlanTier) => {
    upgradePlan(tier);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    toast.success('¡Plan actualizado con éxito!', { icon: '✨' });
    onClose();
  };

  const handleHireCoach = (coach: ProfessionalCoach) => {
    assignCoach(coach, 'HABITS_COACH_PRO');
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    toast.success(`¡Vinculado con éxito con ${coach.name}!`, { icon: '🤝' });
    onClose();
  };

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachCode.trim()) return;
    const res = linkCoachByCode(coachCode);
    if (res.success) {
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
      toast.success(res.message, { icon: '🎉' });
      onClose();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Crown size={20} />
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Planes & Coaches Profesionales
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elige tu nivel de acompañamiento o vincula a tu coach
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('PLANS')}
              className={`flex-1 py-2 rounded-xl text-xs font-black font-montserrat transition-all ${
                activeTab === 'PLANS'
                  ? 'bg-white dark:bg-[#0a0d16] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              3 Planes de Acceso
            </button>
            <button
              onClick={() => setActiveTab('MARKETPLACE')}
              className={`flex-1 py-2 rounded-xl text-xs font-black font-montserrat transition-all ${
                activeTab === 'MARKETPLACE'
                  ? 'bg-white dark:bg-[#0a0d16] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Coaches Certificados
            </button>
            <button
              onClick={() => setActiveTab('CODE')}
              className={`flex-1 py-2 rounded-xl text-xs font-black font-montserrat transition-all ${
                activeTab === 'CODE'
                  ? 'bg-white dark:bg-[#0a0d16] text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Tengo un Código
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            
            {/* TAB 1: 3 PLANES DE NEGOCIO */}
            {activeTab === 'PLANS' && (
              <div className="space-y-3.5">
                {/* PLAN 1: FREE TRIAL */}
                <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0d16] space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Prueba Gratuita
                      </span>
                      <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white mt-1">
                        Habits Free Trial (14 Días)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-montserrat text-slate-900 dark:text-white">$0</span>
                      <p className="text-[10px] text-slate-400">Sin tarjeta</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>Hábitos, rachas y gamificación completa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>Pestaña Social y Tribus cooperativas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>Asistente de inicio pedagógico</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleSelectPlan('FREE_TRIAL')}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors"
                  >
                    {activePlanTier === 'FREE_TRIAL' ? 'Plan Actual ✓' : 'Continuar con Prueba Gratuita'}
                  </button>
                </div>

                {/* PLAN 2: HABITS PRO (AUTOGESTIONADO) */}
                <div className="p-4 rounded-3xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/30 to-purple-50/20 dark:from-indigo-950/20 dark:to-purple-950/20 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                        Popular • Autogestionado
                      </span>
                      <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white mt-1">
                        Habits Pro Ilimitado
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-montserrat text-indigo-600 dark:text-indigo-400">$7.99</span>
                      <span className="text-[10px] text-slate-400"> USD/mes</span>
                      <p className="text-[9px] text-slate-400 font-mono">o $14.900 ARS/mes</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-indigo-500 shrink-0" />
                      <span>Smart Swap de Nutrición & 12 Recetas Maestras</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-indigo-500 shrink-0" />
                      <span>IA Readiness Scanner y Comparador Antes/Después</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-indigo-500 shrink-0" />
                      <span>Tribus, Escuadrones y Retos sin límites</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleSelectPlan('HABITS_PRO')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-montserrat font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                  >
                    {activePlanTier === 'HABITS_PRO' ? 'Plan Actual ✓' : 'Elegir Habits Pro'}
                  </button>
                </div>

                {/* PLAN 3: HABITS PRO + COACH CERTIFICADO (REVENUE SHARE) */}
                <div className="p-4 rounded-3xl border-2 border-amber-400/80 dark:border-amber-500/60 bg-gradient-to-br from-amber-50/40 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20 space-y-2.5 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 flex items-center gap-1 w-fit">
                        <Sparkles size={10} /> Máxima Transformación
                      </span>
                      <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white mt-1">
                        Habits Pro + Coach 1 a 1
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-montserrat text-amber-600 dark:text-amber-400">$49</span>
                      <span className="text-[10px] text-slate-400"> USD/mes</span>
                      <p className="text-[9px] text-slate-400 font-mono">o $49.000 ARS/mes</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-2">
                      <Star size={13} className="text-amber-500 shrink-0 fill-amber-500" />
                      <span className="font-bold">Todo Habits Pro incluido</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>Plan de entrenamiento & dieta 100% personalizado semanal</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>Chat directo 1 a 1 con tu coach (respuesta en &lt;2h)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span>Corrección de técnica en video & ajustes de cargas en vivo</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => setActiveTab('MARKETPLACE')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-montserrat font-black text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>Elegir Mi Coach Certificado</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MARKETPLACE DE COACHES CERTIFICADOS */}
            {activeTab === 'MARKETPLACE' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-black font-montserrat uppercase tracking-wider text-slate-400">
                    Coaches Disponibles ({availableCoaches.length})
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-bold">100% Certificados</span>
                </div>

                <div className="space-y-3">
                  {availableCoaches.map((coach) => (
                    <div
                      key={coach.id}
                      className={`p-4 rounded-3xl border transition-all space-y-3 ${
                        assignedCoach?.id === coach.id
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-[#0a0d16] border-slate-200/80 dark:border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={coach.avatarUrl}
                            alt={coach.name}
                            className="w-13 h-13 rounded-2xl object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                          />
                          {coach.isOnline && (
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white truncate">
                              {coach.name}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                              <Star size={12} className="fill-amber-500" />
                              <span>{coach.rating}</span>
                              <span className="text-slate-400 font-normal">({coach.reviewCount})</span>
                            </div>
                          </div>

                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                            {coach.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {coach.specialty}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                        {coach.bio}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                        <div>
                          <span className="font-black font-montserrat text-slate-900 dark:text-white">
                            ${coach.priceMonthlyUSD} USD
                          </span>
                          <span className="text-[10px] text-slate-400">/mes</span>
                        </div>

                        {assignedCoach?.id === coach.id ? (
                          <span className="py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                            <Check size={13} /> Tu Coach Asignado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleHireCoach(coach)}
                            className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-montserrat font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                          >
                            Elegir este Coach
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CANJE DE CÓDIGO DE ENTRENADOR */}
            {activeTab === 'CODE' && (
              <form onSubmit={handleRedeemCode} className="space-y-4 p-2">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold">
                    <KeyRound size={22} />
                  </div>
                  <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                    ¿Tu entrenador ya usa Habits?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Ingresa el código que te dio tu coach o tu gimnasio para sincronizar tu cuenta directamente.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={coachCode}
                    onChange={(e) => setCoachCode(e.target.value)}
                    placeholder="Ej: LEANDRO o SOFIA"
                    className="w-full text-center tracking-widest font-mono font-black uppercase px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base focus:border-indigo-500 outline-none"
                  />
                  <p className="text-[10px] text-center text-slate-400">
                    💡 Códigos demo disponibles: <code className="text-indigo-500 font-bold">LEANDRO</code> o <code className="text-indigo-500 font-bold">SOFIA</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!coachCode.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Vincular con mi Entrenador
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Target, Trophy, Calendar, CheckCircle2, Flame, Users, 
  AlertTriangle, Zap, Share2, Sparkles, Shield 
} from 'lucide-react';
import { useTribuStore, type SquadChallenge } from '../../stores/useTribuStore';
import confetti from 'canvas-confetti';

interface SquadChallengeDetailModalProps {
  challengeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite: () => void;
}

export const SquadChallengeDetailModal: React.FC<SquadChallengeDetailModalProps> = ({
  challengeId,
  isOpen,
  onClose,
  onOpenInvite
}) => {
  const { challenges, checkInChallenge } = useTribuStore();
  const challenge = challenges.find(c => c.id === challengeId);

  if (!isOpen || !challenge) return null;

  const progressPercent = Math.min(100, Math.round((challenge.currentValue / (challenge.targetValue || 1)) * 100));
  
  // Calcular días restantes
  const endDate = new Date(challenge.endDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleCheckIn = () => {
    if (challenge.hasUserCheckedInToday) return;

    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899']
    });

    checkInChallenge(challenge.id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#0c0f17] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header con Gradiente Hero Luminous */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-600 dark:from-indigo-950/80 dark:via-purple-950/50 dark:to-[#0a0d16] text-white relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{challenge.icon}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/90 bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {challenge.category}
                  </span>
                  <h3 className="font-montserrat font-black text-xl text-white mt-0.5">
                    {challenge.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-white/90 leading-relaxed mb-4">
              {challenge.description}
            </p>

            {/* Barra de Progreso Colectivo Animada */}
            <div className="space-y-2 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100 block">Progreso del Squad</span>
                  <span className="text-lg font-black font-montserrat text-white">
                    {challenge.currentValue.toLocaleString()} <span className="text-xs font-bold text-indigo-200">/ {challenge.targetValue.toLocaleString()} {challenge.unit}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-montserrat text-lime-300">{progressPercent}%</span>
                  <span className="text-[10px] font-bold text-indigo-100 block flex items-center gap-1 justify-end">
                    <Calendar size={10} /> {daysLeft} días restantes
                  </span>
                </div>
              </div>

              <div className="h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-300 rounded-full shadow-lg shadow-lime-400/30"
                />
              </div>
            </div>
          </div>

          {/* Cuerpo: Aportes de Miembros & Alertas de Racha */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Recompensa */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Trophy size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Recompensa Colectiva</p>
                  <p className="text-[11px] text-slate-700 dark:text-white/90 font-montserrat font-black">
                    +{challenge.rewardXP} XP • {challenge.rewardBadge}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenInvite();
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm flex items-center gap-1 transition-all active:scale-95"
              >
                <Share2 size={11} /> Invitar Amigo
              </button>
            </div>

            {/* Lista de Participantes y Contribución */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-montserrat">
                  <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
                  Aporte Individual ({challenge.participants.length} Atletas)
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">Estado de Hoy</span>
              </div>

              <div className="space-y-2">
                {challenge.participants.map((p) => (
                  <div
                    key={p.memberId}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                          {p.riskLevel === 'HIGH' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-rose-500/20">
                              <AlertTriangle size={8} /> Racha en Riesgo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Aportó: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{p.contribution.toLocaleString()} {challenge.unit}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Estado del Check-In */}
                    <div>
                      {p.hasCheckedInToday ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Hecho
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer con Botón de Check-In Diario */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-slate-900/40 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all"
            >
              Cerrar
            </button>

            <button
              onClick={handleCheckIn}
              disabled={challenge.hasUserCheckedInToday}
              className={`flex-1 py-3 px-4 rounded-2xl font-montserrat font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all ${
                challenge.hasUserCheckedInToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-95 text-white shadow-indigo-600/20'
              }`}
            >
              {challenge.hasUserCheckedInToday ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Check-In de Hoy Completado (+35 XP)</span>
                </>
              ) : (
                <>
                  <Zap size={16} className="text-amber-300 fill-amber-300" />
                  <span>Marcar Mi Check-In de Hoy (+35 XP)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

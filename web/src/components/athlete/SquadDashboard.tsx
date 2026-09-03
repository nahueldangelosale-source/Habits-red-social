import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Flame, Users, HeartHandshake, ChevronRight, Zap, MessageCircle } from 'lucide-react';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { useGamificationStore, type FeedMessage } from '../../stores/useGamificationStore';

// ═══════════════════════════════════════════════════════════════
// KUDO POPOVER — Aparece 4 segundos después del check-in del usuario.
// Un solo tap envía un "🤜 Kudo" al miembro seleccionado.
// Si no se toca, desaparece sin fricción.
// ═══════════════════════════════════════════════════════════════
const KudoPopover: React.FC<{ 
  members: { id: string; avatar: string; name: string; isMe: boolean }[];
  onSend: (toId: string) => void;
  onDismiss: () => void;
}> = ({ members, onSend, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const targets = members.filter(m => !m.isMe);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="bg-zinc-900/90 border border-indigo-500/30 backdrop-blur-md rounded-2xl p-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
    >
      <p className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-widest">🤜 Enviar Kudo</p>
      <div className="flex gap-2">
        {targets.map(m => (
          <button
            key={m.id}
            onClick={() => onSend(m.id)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-indigo-500/10 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-indigo-500 flex items-center justify-center text-xs font-black text-zinc-300 group-hover:text-indigo-400 transition-colors">
              {m.avatar}
            </div>
            <span className="text-[9px] text-zinc-500 group-hover:text-indigo-400 font-bold">{m.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// FEED MESSAGE CARD
// ═══════════════════════════════════════════════════════════════
const FeedCard: React.FC<{ msg: FeedMessage }> = ({ msg }) => {
  const iconConfig = {
    'SYSTEM_CHECKIN': { icon: Flame, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    'KUDO': { icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    'MILESTONE': { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  }[msg.type];

  const Icon = iconConfig.icon;
  const timeAgo = getTimeAgo(msg.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl flex items-start gap-3"
    >
      <div className={`w-10 h-10 rounded-full ${iconConfig.bg} border flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconConfig.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-black ${iconConfig.color}`}>{msg.memberName}</span>
          <span className="text-[10px] text-zinc-600">{timeAgo}</span>
        </div>
        <p className="text-white/80 text-sm font-medium leading-relaxed">{msg.text}</p>
      </div>
    </motion.div>
  );
};

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export const SquadDashboard: React.FC = () => {
    const { calmMode } = useCognitiveLoad();
    const [showKudoPopover, setShowKudoPopover] = useState(false);

    // ─── Store ────────────────────────────────────────────────
    const { 
      squad, 
      tickSimulation, 
      sendKudo, 
      getSquadCompletionToday, 
      getActiveChallenge,
      markFeedSeen 
    } = useGamificationStore();
    
    const activeChallenge = useGamificationStore(s => s.challenges.find(c => c.state === 'ACTIVE'));
    const completionPct = Math.round(getSquadCompletionToday());
    const needsRescueCount = squad.members.filter(m => !m.completedToday && !m.isMe).length;
    const meCompleted = squad.members.find(m => m.isMe)?.completedToday || false;

    // Run simulation on mount
    useEffect(() => {
      tickSimulation();
    }, [tickSimulation]);

    // Show Kudo popover after user checks in
    useEffect(() => {
      if (meCompleted) {
        const timer = setTimeout(() => setShowKudoPopover(true), 1000);
        return () => clearTimeout(timer);
      }
    }, [meCompleted]);

    const handleSendKudo = (toId: string) => {
      sendKudo(toId);
      setShowKudoPopover(false);
      // Haptic on kudo
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
    };

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-1000 ${calmMode ? 'bg-[#0f111a]' : 'bg-[#0a0a0a]'}`}>
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-white">{squad.name}</h2>
                        <p className="text-sm text-zinc-400 mt-1">Racha Colectiva: {squad.streakCollective} días 🔥</p>
                    </div>
                    <div className={`${completionPct >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'} border px-3 py-1.5 rounded-xl flex items-center font-bold text-xs transition-colors`}>
                        <Target className="w-3 h-3 mr-1.5" /> {completionPct}% Hoy
                    </div>
                </div>
            </header>

            {/* Active Challenge Banner */}
            {activeChallenge && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 border border-indigo-500/50 rounded-3xl p-5 mb-8 shadow-[0_0_30px_rgba(99,102,241,0.2)] relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Shield className="w-32 h-32 text-white" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-2">
                      <Flame className="w-5 h-5 text-indigo-200 mr-2" />
                      <h3 className="text-indigo-100 font-bold text-sm uppercase tracking-widest">Misión Activa</h3>
                    </div>
                    <p className="text-white font-bold text-xl mb-1">{activeChallenge.title}</p>
                    <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
                      Progreso: {activeChallenge.currentValue} / {activeChallenge.targetValue} días
                    </p>
                    {/* Progress bar */}
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (activeChallenge.currentValue / activeChallenge.targetValue) * 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
            )}

            {/* Pacto Ciego: Misión de Rescate */}
            <AnimatePresence>
                {needsRescueCount > 0 && meCompleted && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-indigo-600/20 border border-indigo-500/30 rounded-3xl p-5 mb-8 relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 opacity-10">
                            <HeartHandshake className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-2">
                                <HeartHandshake className="w-5 h-5 text-indigo-400 mr-2" />
                                <h3 className="text-indigo-300 font-bold text-sm uppercase tracking-widest">Refuerzo de Pares</h3>
                            </div>
                            <p className="text-white font-bold text-lg mb-1">{needsRescueCount} compañero{needsRescueCount > 1 ? 's' : ''} aún no completó hoy.</p>
                            <p className="text-indigo-300 text-sm mb-4 leading-relaxed">
                                Envía un Kudo para motivarlos a completar su check-in y proteger la racha grupal.
                            </p>
                            <button 
                              onClick={() => setShowKudoPopover(true)}
                              className="bg-indigo-500 text-white font-black py-2.5 px-6 rounded-xl shadow-lg hover:bg-indigo-400 transition-colors flex items-center gap-2 text-sm"
                            >
                                🤜 Enviar Kudos
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kudo Popover */}
            <AnimatePresence>
              {showKudoPopover && (
                <div className="mb-6">
                  <KudoPopover
                    members={squad.members.map(m => ({ id: m.id, avatar: m.avatar, name: m.name, isMe: m.isMe }))}
                    onSend={handleSendKudo}
                    onDismiss={() => setShowKudoPopover(false)}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Miembros del Squad (Datos reales del store) */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 mb-8">
                <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest flex justify-between items-center">
                    <span>Estado del Escuadrón</span>
                    <Users className="w-4 h-4" />
                </h3>
                
                <div className="grid grid-cols-4 gap-3">
                    {squad.members.map((member) => (
                        <div key={member.id} className="flex flex-col items-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg mb-2 relative transition-all duration-500 ${
                                member.completedToday 
                                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                            } ${member.isMe ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}>
                                {member.avatar}
                                {member.completedToday && (
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center">
                                    <span className="text-[8px]">✓</span>
                                  </div>
                                )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">
                                {member.isMe ? 'Tú' : member.name.split(' ')[0]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feed Gestalt (Mensajes del Sistema + Kudos + Hitos) */}
            <div>
                <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-widest flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" /> Feed del Squad
                </h3>
                
                <div className="space-y-3">
                  {squad.feedMessages.length === 0 ? (
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 text-center">
                      <p className="text-zinc-600 text-sm">Aún no hay actividad hoy. ¡Sé el primero en completar tu check-in!</p>
                    </div>
                  ) : (
                    squad.feedMessages.slice(0, 10).map((msg) => (
                      <FeedCard key={msg.id} msg={msg} />
                    ))
                  )}
                </div>
            </div>
        </div>
    );
};

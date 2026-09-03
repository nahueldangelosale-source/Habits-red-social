import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Trophy, Sparkles, Lock, CheckCircle2, Share2, 
  Flame, Dumbbell, UtensilsCrossed, Brain, Users, Zap, Award 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AestheticStoryStudio } from './AestheticStoryStudio';

export interface AthleteBadge {
  id: string;
  name: string;
  category: 'STREAK' | 'WORKOUT' | 'NUTRITION' | 'MIND' | 'SOCIAL' | 'MILESTONE';
  icon: string;
  color: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0 to 100
  progressText?: string;
  rewardXP: number;
}

const MASTER_BADGES: AthleteBadge[] = [
  {
    id: 'badge-1',
    name: 'Iniciador Imparable',
    category: 'MILESTONE',
    icon: '📸',
    color: 'from-indigo-500 to-purple-600',
    description: 'Estableciste tu foto de punto de partida inicial y diste el primer paso.',
    unlocked: true,
    unlockedAt: '12 Ago 2026',
    rewardXP: 100
  },
  {
    id: 'badge-2',
    name: 'Semana de Fuego',
    category: 'STREAK',
    icon: '🔥',
    color: 'from-orange-500 to-amber-500',
    description: '7 días consecutivos de racha sin romper tus hábitos diarios.',
    unlocked: true,
    unlockedAt: '18 Ago 2026',
    rewardXP: 150
  },
  {
    id: 'badge-3',
    name: 'Titán de la Fuerza',
    category: 'WORKOUT',
    icon: '🏋️',
    color: 'from-blue-600 to-indigo-600',
    description: 'Acumulaste más de 10.000 kg de volumen total en tus entrenamientos.',
    unlocked: true,
    unlockedAt: '20 Ago 2026',
    rewardXP: 200
  },
  {
    id: 'badge-4',
    name: 'Nutrición Quirúrgica',
    category: 'NUTRITION',
    icon: '🥗',
    color: 'from-emerald-500 to-teal-600',
    description: '5 días consecutivos cumpliendo tus metas de proteínas y calorías.',
    unlocked: true,
    unlockedAt: '21 Ago 2026',
    rewardXP: 120
  },
  {
    id: 'badge-5',
    name: 'Mente Inquebrantable',
    category: 'MIND',
    icon: '🧘',
    color: 'from-purple-500 to-pink-500',
    description: '5 sesiones guiadas de respiración y recuperación en Mind Gym.',
    unlocked: true,
    unlockedAt: 'Ayer',
    rewardXP: 100
  },
  {
    id: 'badge-6',
    name: 'Líder de Tribu',
    category: 'SOCIAL',
    icon: '🦁',
    color: 'from-amber-600 to-rose-600',
    description: 'Invita a 3 amigos a tu escuadrón cooperativo de entrenamiento.',
    unlocked: false,
    progress: 33,
    progressText: '1 de 3 Amigos',
    rewardXP: 250
  },
  {
    id: 'badge-7',
    name: 'Maestro del Flow',
    category: 'MIND',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    description: 'Completa 14 check-ins matutinos de Estado de Preparación (Readiness).',
    unlocked: false,
    progress: 57,
    progressText: '8 de 14 Días',
    rewardXP: 150
  },
  {
    id: 'badge-8',
    name: 'Centurión de Oro',
    category: 'MILESTONE',
    icon: '👑',
    color: 'from-amber-400 to-yellow-600',
    description: 'Alcanza el Nivel 20 y desbloquea el título de Leyenda de la Tribu.',
    unlocked: false,
    progress: 25,
    progressText: 'Nivel 5 de 20',
    rewardXP: 500
  }
];

interface AthleteMedalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AthleteMedalsModal: React.FC<AthleteMedalsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');
  const [selectedBadge, setSelectedBadge] = useState<AthleteBadge | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!isOpen) return null;

  const unlockedCount = MASTER_BADGES.filter(b => b.unlocked).length;
  const totalCount = MASTER_BADGES.length;

  const filteredBadges = MASTER_BADGES.filter(b => {
    if (filter === 'UNLOCKED') return b.unlocked;
    if (filter === 'LOCKED') return !b.unlocked;
    return true;
  });

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
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Vitrina de Logros & Medallas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unlockedCount} de {totalCount} Medallas Desbloqueadas ({Math.round((unlockedCount / totalCount) * 100)}%)
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

          {/* Filter Pills */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20 flex items-center gap-1.5 shrink-0">
            {[
              { id: 'ALL', label: `Todas (${totalCount})` },
              { id: 'UNLOCKED', label: `Obtenidas (${unlockedCount})` },
              { id: 'LOCKED', label: `Por Ganar (${totalCount - unlockedCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-montserrat transition-all ${
                  filter === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Medals Grid */}
          <div className="p-5 overflow-y-auto flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {filteredBadges.map(badge => (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`p-4 rounded-3xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                    badge.unlocked
                      ? 'bg-white dark:bg-[#0a0d16] border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:shadow-md'
                      : 'bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800/60 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform`}>
                      {badge.icon}
                    </div>

                    {badge.unlocked ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 size={12} />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Lock size={11} />
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white line-clamp-1">
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {badge.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold">
                    <span className="text-amber-500 font-mono">+{badge.rewardXP} XP</span>
                    {badge.unlocked ? (
                      <span className="text-slate-400">{badge.unlockedAt}</span>
                    ) : (
                      <span className="text-indigo-500 font-mono">{badge.progressText}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Overlay if Badge is Selected */}
          <AnimatePresence>
            {selectedBadge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${selectedBadge.color} text-white flex items-center justify-center text-2xl shadow-md shrink-0`}>
                    {selectedBadge.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                        {selectedBadge.name}
                      </h4>
                      <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        +{selectedBadge.rewardXP} XP
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedBadge.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedBadge.unlocked ? (
                    <button
                      onClick={() => setIsShareOpen(true)}
                      className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-montserrat font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                    >
                      <Share2 size={13} />
                      <span>Compartir Medalla</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      En progreso ({selectedBadge.progressText})
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <X size={15} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Stories Studio */}
      <AestheticStoryStudio
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        initialCategory="BADGE"
      />
    </AnimatePresence>
  );
};

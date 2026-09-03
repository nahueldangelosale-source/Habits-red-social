import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Calendar, Clock, Trophy, UserPlus, 
  Sparkles, ArrowRight, CheckCircle2, Flame, Rocket, Share2, Copy 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export interface ClassMember {
  id: string;
  name: string;
  avatarUrl: string;
  streakDays: number;
  status: 'ACTIVE' | 'MISSED' | 'PENDING';
  lastActivity: string;
}

export interface ClassGroupDetail {
  id: string;
  name: string;
  discipline: string;
  icon: string;
  schedule: string;
  count: string;
  activeChallengeTitle?: string;
  members: ClassMember[];
}

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classGroup: ClassGroupDetail | null;
  onLaunchChallenge?: (classId: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  classGroup,
  onLaunchChallenge
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !classGroup) return null;

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}/b2c/join?class=${classGroup.id}&ref=coach`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('¡Enlace de invitación copiado!', {
      icon: '🔗',
      style: { background: '#18181b', color: '#60a5fa', border: '1px solid #3b82f6' }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToGamification = () => {
    onClose();
    if (onLaunchChallenge) {
      onLaunchChallenge(classGroup.id);
    } else {
      navigate('/gamification');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-start justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
                {classGroup.icon}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {classGroup.discipline}
                </span>
                <h3 className="text-lg font-black font-montserrat tracking-tight text-slate-900 dark:text-white mt-1">
                  {classGroup.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Clock size={13} className="text-slate-400" />
                  {classGroup.schedule} • <strong>{classGroup.count}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: Members & Actions */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Banner de Reto Activo de la Clase */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg">
                  🏆
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reto Asignado a esta Clase</p>
                  <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                    {classGroup.activeChallengeTitle || 'Raid de Fuerza: 50,000 kg'}
                  </h4>
                </div>
              </div>
              <button
                onClick={handleGoToGamification}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black shadow-md shadow-indigo-600/20 flex items-center gap-1 active:scale-95 transition-all"
              >
                <span>Nuevo Reto</span>
                <Rocket size={12} />
              </button>
            </div>

            {/* Lista de Atletas / Usuarios en esta Clase */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-montserrat">
                  <Users size={14} className="text-indigo-500" />
                  Atletas Inscritos ({classGroup.members.length})
                </h4>
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Share2 size={12} />
                  <span>Invitar Atleta</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {classGroup.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover bg-slate-200 border border-white/10"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{member.name}</p>
                        <p className="text-[10px] text-slate-400">Última actividad: {member.lastActivity}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                        <Flame size={12} /> {member.streakDays}d
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Activo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Copy size={14} />
              <span>{copied ? '¡Enlace Copiado!' : 'Copiar Link de Clase'}</span>
            </button>

            <button
              onClick={handleGoToGamification}
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Ir a Grupos & Retos</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

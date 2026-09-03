import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Users, Calendar, Award, Target, Zap, UserPlus, 
  Plus, Trophy, ArrowRight, ShieldCheck, AlertTriangle, Sparkles, 
  ChevronRight, MessageCircle, HeartHandshake, CheckCircle2, ChevronDown, Check, Compass,
  Send, ThumbsUp, PartyPopper
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useTribuStore, type SquadChallenge } from '../../stores/useTribuStore';
import { CreateSquadChallengeModal } from '../tribu/CreateSquadChallengeModal';
import { InviteToSquadModal } from '../tribu/InviteToSquadModal';
import { SquadChallengeDetailModal } from '../tribu/SquadChallengeDetailModal';
import { CreateSquadModal } from '../tribu/CreateSquadModal';

type TribuSubTab = 'FEED' | 'CHALLENGES' | 'RANKING' | 'SQUADS';

export const AthleteTribuDashboard: React.FC = () => {
  const { 
    squadName, 
    squadLevel, 
    squadXP, 
    squadMultiplier, 
    members, 
    challenges, 
    feed, 
    giveKudos,
    toggleReaction,
    mySquads,
    activeSquadId,
    setActiveSquad
  } = useTribuStore();

  const [activeTab, setActiveTab] = useState<TribuSubTab>('FEED');
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isCreateSquadOpen, setIsCreateSquadOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Next level calculation
  const nextLevelXP = 5000;
  const squadXPProgress = Math.min(100, Math.round((squadXP / nextLevelXP) * 100));

  const currentSquad = mySquads?.find(s => s.id === activeSquadId) || {
    id: 'squad-1',
    name: squadName,
    avatarEmoji: '🦁',
    level: squadLevel,
    xp: squadXP,
    multiplier: squadMultiplier,
    memberCount: members.length,
    category: 'Tribu Cooperativa'
  };

  const handleSendCheer = (memberName: string) => {
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 }
    });
    toast.success(`¡Le enviaste un aliento a ${memberName}! 🚀`, {
      icon: '💪',
      duration: 2500
    });
  };

  const handleReactionClick = (feedId: string, type: 'fire' | 'muscle' | 'rocket' | 'clap') => {
    if (toggleReaction) {
      toggleReaction(feedId, type);
    } else {
      giveKudos(feedId);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full bg-slate-50 dark:bg-[#04060a] text-slate-900 dark:text-white font-lato pb-24"
    >
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. SELECTOR DE 4 PESTAÑAS ARRIBA DE TODO (TOP NAVBAR)      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="p-3 sm:px-5 bg-white dark:bg-[#0a0d16] border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm shrink-0 sticky top-0 z-30">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 dark:bg-slate-900/80 rounded-2xl max-w-md mx-auto">
          {/* PESTAÑA 1: FEED */}
          <button
            onClick={() => setActiveTab('FEED')}
            className={`py-2 px-1 rounded-xl text-xs font-black font-montserrat transition-all flex items-center justify-center gap-1 ${
              activeTab === 'FEED'
                ? 'bg-white dark:bg-[#0c0f18] text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Flame size={13} className={activeTab === 'FEED' ? 'text-orange-500' : ''} />
            <span className="truncate">Muro</span>
          </button>

          {/* PESTAÑA 2: RETOS */}
          <button
            onClick={() => setActiveTab('CHALLENGES')}
            className={`py-2 px-1 rounded-xl text-xs font-black font-montserrat transition-all flex items-center justify-center gap-1 ${
              activeTab === 'CHALLENGES'
                ? 'bg-white dark:bg-[#0c0f18] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Target size={13} className={activeTab === 'CHALLENGES' ? 'text-indigo-500' : ''} />
            <span className="truncate">Retos</span>
            <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
              activeTab === 'CHALLENGES' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              {challenges.length}
            </span>
          </button>

          {/* PESTAÑA 3: RANKING */}
          <button
            onClick={() => setActiveTab('RANKING')}
            className={`py-2 px-1 rounded-xl text-xs font-black font-montserrat transition-all flex items-center justify-center gap-1 ${
              activeTab === 'RANKING'
                ? 'bg-white dark:bg-[#0c0f18] text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Trophy size={13} className={activeTab === 'RANKING' ? 'text-amber-500' : ''} />
            <span className="truncate">Ranking</span>
          </button>

          {/* PESTAÑA 4: MIS TRIBUS & GRUPOS */}
          <button
            onClick={() => setActiveTab('SQUADS')}
            className={`py-2 px-1 rounded-xl text-xs font-black font-montserrat transition-all flex items-center justify-center gap-1 ${
              activeTab === 'SQUADS'
                ? 'bg-white dark:bg-[#0c0f18] text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Users size={13} className={activeTab === 'SQUADS' ? 'text-purple-500' : ''} />
            <span className="truncate">Tribus</span>
            <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
              activeTab === 'SQUADS' ? 'bg-purple-50 dark:bg-purple-950 text-purple-600' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}>
              {mySquads?.length || 1}
            </span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. CABECERA DEL ESCUADRÓN ACTIVO (EN MURO, RETOS, RANKING) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {activeTab !== 'SQUADS' && (
        <div className="p-4 bg-white dark:bg-[#0a0d16] border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm shrink-0 space-y-2.5">
          {/* Fila Superior: Identidad + Botón Invitar */}
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                onClick={() => setActiveTab('SQUADS')}
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-500/15 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                title="Ver todas mis tribus"
              >
                {currentSquad.avatarEmoji || '🦁'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white truncate">
                    {currentSquad.name}
                  </h2>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-full shrink-0">
                    Nivel {currentSquad.level}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentSquad.category || 'Tribu Cooperativa'} • {members.length} Atletas
                </p>
              </div>
            </div>

            {/* Botón Invitar Compacto */}
            <button
              onClick={() => setIsInviteOpen(true)}
              className="py-1.5 px-3 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-md shadow-pink-600/20 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
            >
              <UserPlus size={12} />
              <span>Invitar</span>
            </button>
          </div>

          {/* Barra de Progreso Colectivo (Limpia & Simétrica) */}
          <div className="p-2.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 space-y-1 max-w-md mx-auto w-full">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                <span>Meta de Grupo</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded-md">
                  {currentSquad.multiplier}x Racha
                </span>
                <span className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                  {currentSquad.xp} <span className="text-[9px] text-slate-400 font-normal">/ {nextLevelXP} XP</span>
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${squadXPProgress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. CONTENIDO DINÁMICO DE PESTAÑAS                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 max-w-md mx-auto w-full space-y-3">
        
        {/* PESTAÑA 1: FEED SOCIAL CON STRATEGY A (STORIES + MICRO-CARDS) */}
        {activeTab === 'FEED' && (
          <div className="space-y-3">
            {/* 1. CARROUSEL DE ESTADO DEL ESCUADRÓN HOY (STORIES TICKER) */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black font-montserrat uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-indigo-500" />
                  <span>Actividad del Escuadrón Hoy ({members.filter(m => m.dailyCompletionRate === 100).length}/{members.length})</span>
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Toca para animar ✨</span>
              </div>

              {/* Fila de Avatares Táctiles */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {members.map((m) => {
                  const isDone = m.dailyCompletionRate === 100;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSendCheer(m.name)}
                      className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                    >
                      <div className={`relative p-[2px] rounded-full transition-transform active:scale-90 ${
                        isDone 
                          ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 shadow-sm shadow-orange-500/20'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}>
                        <img 
                          src={m.avatarUrl} 
                          alt={m.name} 
                          className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-[#0a0d16]" 
                        />
                        {isDone ? (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[8px] font-bold shadow-sm">
                            🔥
                          </div>
                        ) : (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-slate-400 text-white flex items-center justify-center text-[7px] font-bold">
                            ⏳
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 max-w-[50px] truncate text-center">
                        {m.isCurrentUser ? 'Tú' : m.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. ENCABEZADO DEL MURO */}
            <div className="flex items-center justify-between px-1 pt-1">
              <h3 className="text-xs font-black font-montserrat uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Flame size={13} className="text-orange-500" />
                <span>Muro de Victorias en Vivo</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">En tiempo real</span>
            </div>

            {/* 3. LISTA DE MICRO-TARJETAS DE VICTORIA (55% MENOR ALTURA) */}
            <div className="space-y-2.5">
              {feed.map((item) => {
                const reactions = item.reactions || { fire: item.kudosCount || 1, muscle: 0, rocket: 0, clap: 0 };
                const userReactions = item.userReactions || (item.hasGivenKudos ? ['fire'] : []);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-slate-300 transition-all space-y-2"
                  >
                    {/* Fila 1: Avatar + Nombre + Título + Timestamp */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={item.memberAvatar} 
                          alt={item.memberName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {item.memberName}
                            </h4>
                            {item.badgeEmoji && (
                              <span className="text-xs">{item.badgeEmoji}</span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
                            {item.actionTitle}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {item.timestamp}
                      </span>
                    </div>

                    {/* Fila 2: Métrica Clave y XP */}
                    <div className="flex items-center justify-between text-[11px] px-1 bg-slate-50 dark:bg-slate-900/60 py-1 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                        {item.actionDescription}
                      </span>
                      {item.rewardXP && (
                        <span className="text-[10px] font-black text-amber-500 font-mono shrink-0 pl-1">
                          +{item.rewardXP} XP
                        </span>
                      )}
                    </div>

                    {/* Fila 3: Botones de Reacción Rápida (1 Toque) */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-1.5">
                        {/* Reacción FUEGO */}
                        <button
                          onClick={() => handleReactionClick(item.id, 'fire')}
                          className={`px-2 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-90 ${
                            userReactions.includes('fire')
                              ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span>🔥</span>
                          <span className="text-[10px]">{reactions.fire}</span>
                        </button>

                        {/* Reacción MÚSCULO */}
                        <button
                          onClick={() => handleReactionClick(item.id, 'muscle')}
                          className={`px-2 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-90 ${
                            userReactions.includes('muscle')
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span>💪</span>
                          <span className="text-[10px]">{reactions.muscle}</span>
                        </button>

                        {/* Reacción COHETE */}
                        <button
                          onClick={() => handleReactionClick(item.id, 'rocket')}
                          className={`px-2 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-90 ${
                            userReactions.includes('rocket')
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span>🚀</span>
                          <span className="text-[10px]">{reactions.rocket}</span>
                        </button>

                        {/* Reacción APLAUSO */}
                        <button
                          onClick={() => handleReactionClick(item.id, 'clap')}
                          className={`px-2 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-90 ${
                            userReactions.includes('clap')
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span>👏</span>
                          <span className="text-[10px]">{reactions.clap}</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-bold">
                        {item.kudosCount || 0} kudos
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: RETOS DE TRIBU */}
        {activeTab === 'CHALLENGES' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-black font-montserrat uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Target size={13} className="text-indigo-500" />
                <span>Retos Activos ({challenges.length})</span>
              </h3>
              <button
                onClick={() => setIsCreateChallengeOpen(true)}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                + Nuevo Reto
              </button>
            </div>

            {challenges.map((ch) => {
              const progressPct = Math.min(100, Math.round((ch.currentValue / ch.targetValue) * 100));
              return (
                <div
                  key={ch.id}
                  onClick={() => setSelectedChallengeId(ch.id)}
                  className="p-4 rounded-3xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-slate-800/80 shadow-sm cursor-pointer hover:border-indigo-400 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{ch.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{ch.title}</h4>
                        <p className="text-[10px] text-slate-400">{ch.category} • {ch.durationDays} Días</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> +{ch.rewardXP} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {ch.description}
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500">Progreso</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                        {ch.currentValue} / {ch.targetValue} {ch.unit} ({progressPct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progressPct}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-400">
                      {ch.participants.length} atletas participando
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                      <span>Ver Detalles</span>
                      <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PESTAÑA 3: RANKING DEL ESCUADRÓN */}
        {activeTab === 'RANKING' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-black font-montserrat uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy size={13} className="text-amber-500" />
                <span>Tabla de Posiciones</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">Semana en Curso</span>
            </div>

            <div className="space-y-2">
              {members.map((m, idx) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    m.isCurrentUser
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60'
                      : 'bg-white dark:bg-[#0a0d16] border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-black font-montserrat text-sm ${
                      idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      #{idx + 1}
                    </span>

                    <img 
                      src={m.avatarUrl} 
                      alt={m.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                    />

                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.isCurrentUser && (
                          <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-mono">TÚ</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400">{m.role} • {m.streakDays} días de racha 🔥</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {m.weeklyVolumeKg} kg
                    </span>
                    <p className="text-[9px] text-slate-400">Volumen</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: MIS TRIBUS & GRUPOS (PESTAÑA DEDICADA) */}
        {activeTab === 'SQUADS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black font-montserrat uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users size={13} className="text-purple-500" />
                  <span>Mis Tribus & Clases ({mySquads?.length || 1})</span>
                </h3>
                <p className="text-[11px] text-slate-500">Toca cualquier grupo para activarlo</p>
              </div>

              <button
                onClick={() => setIsCreateSquadOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-montserrat font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <Plus size={12} />
                <span>Nueva Tribu</span>
              </button>
            </div>

            {/* Lista de Tribus del Atleta */}
            <div className="space-y-3">
              {mySquads?.map((squad) => {
                const isActive = squad.id === activeSquadId;
                const squadProgress = Math.min(100, Math.round((squad.xp / nextLevelXP) * 100));

                return (
                  <div
                    key={squad.id}
                    onClick={() => setActiveSquad(squad.id)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                      isActive
                        ? 'bg-white dark:bg-[#0a0d16] border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                        : 'bg-white dark:bg-[#0a0d16] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-sm">
                          {squad.avatarEmoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                              {squad.name}
                            </h4>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                              Nivel {squad.level}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {squad.category} • {squad.memberCount} Atletas
                          </p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="py-1 px-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                          <Check size={11} /> Activa
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSquad(squad.id);
                          }}
                          className="py-1 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                        >
                          Activar
                        </button>
                      )}
                    </div>

                    {/* Barra de XP de la Tribu */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>XP Colectivo: {squad.xp} / {nextLevelXP} XP</span>
                        <span className="text-amber-500">{squad.multiplier}x Racha Bonus</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${squadProgress}%` }}
                          className="h-full bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tarjeta de Explorar / Unirse con Código */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/70 dark:border-indigo-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                    ¿Tienes un código de invitación?
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Únete al squad de tus amigos con su código</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateSquadOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-bold text-xs shadow-sm hover:bg-indigo-50 transition-colors"
              >
                Unirme
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MODALES CONECTADOS                                         */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <CreateSquadModal
        isOpen={isCreateSquadOpen}
        onClose={() => setIsCreateSquadOpen(false)}
      />

      <InviteToSquadModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      <CreateSquadChallengeModal
        isOpen={isCreateChallengeOpen}
        onClose={() => setIsCreateChallengeOpen(false)}
      />

      {selectedChallengeId && (
        <SquadChallengeDetailModal
          isOpen={!!selectedChallengeId}
          onClose={() => setSelectedChallengeId(null)}
          challenge={challenges.find(c => c.id === selectedChallengeId)!}
        />
      )}
    </motion.div>
  );
};

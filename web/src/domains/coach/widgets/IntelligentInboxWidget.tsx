import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Video, Apple, CreditCard, Clock, CheckCircle2, 
  Send, Sparkles, ChevronRight, Check, X, ShieldAlert, Play, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useCoachCommunicationStore, type InboxItem } from '../../../../stores/useCoachCommunicationStore';

interface InboxProps {
  onSelectMessage?: (id: string) => void;
}

export const IntelligentInboxWidget: React.FC<InboxProps> = ({ onSelectMessage }) => {
  const { 
    inboxItems, 
    coachValidateBiomechanics, 
    coachReplyMessage,
    initBroadcastSync 
  } = useCoachCommunicationStore();

  const [activeTab, setActiveTab] = useState<'URGENT' | 'BIOMECHANICS' | 'NUTRITION' | 'PAYMENT'>('BIOMECHANICS');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = initBroadcastSync();
    return cleanup;
  }, [initBroadcastSync]);

  const handleTabChange = (tab: 'URGENT' | 'BIOMECHANICS' | 'NUTRITION' | 'PAYMENT') => {
    setActiveTab(tab);
  };

  // Filter items by type and status
  const pendingItems = inboxItems.filter((i) => i.type === activeTab && i.status === 'PENDING');
  const resolvedItems = inboxItems.filter((i) => i.type === activeTab && i.status === 'RESOLVED');

  const countByType = {
    URGENT: inboxItems.filter((i) => i.type === 'URGENT' && i.status === 'PENDING').length,
    BIOMECHANICS: inboxItems.filter((i) => i.type === 'BIOMECHANICS' && i.status === 'PENDING').length,
    NUTRITION: inboxItems.filter((i) => i.type === 'NUTRITION' && i.status === 'PENDING').length,
    PAYMENT: inboxItems.filter((i) => i.type === 'PAYMENT' && i.status === 'PENDING').length
  };

  const handleApprove = (item: InboxItem) => {
    coachValidateBiomechanics(item.id, 'APPROVED', 'Profundidad y estabilidad de rodillas impecables.');
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.5 } });
    toast.success(`¡Técnica de ${item.athleteName} validada! +25 XP otorgados.`, {
      icon: '🏆',
      duration: 3000
    });
  };

  const handleAdjustLoad = (item: InboxItem) => {
    coachValidateBiomechanics(
      item.id,
      'ADJUSTED',
      'Ajusté la carga a 95 kg (-5kg) para priorizar el rango de movimiento completo sin compensaciones.',
      -5
    );
    toast.success(`Carga ajustada a 95 kg en la rutina de ${item.athleteName}.`, {
      icon: '⚠️',
      duration: 3000
    });
  };

  const handleSendCustomReply = (itemId: string) => {
    const text = replyTextMap[itemId];
    if (!text?.trim()) return;
    coachReplyMessage(itemId, text);
    setReplyTextMap({ ...replyTextMap, [itemId]: '' });
    setActiveReplyId(null);
    toast.success('Respuesta enviada al chat del atleta', { icon: '💬' });
  };

  return (
    <article className="p-5 sm:p-6 rounded-[24px] bg-[var(--color-clinical-surface)] backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800/50 shadow-md flex flex-col h-full overflow-hidden transition-all text-slate-900 dark:text-white relative font-lato">
      
      {/* Header */}
      <header className="mb-3.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black font-montserrat tracking-tight uppercase">
              Bandeja Inteligente <span className="text-[10px] text-indigo-500 font-mono">Triage en Vivo</span>
            </h2>
            <p className="text-[11px] text-slate-400">Validaciones y consultas de atletas en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/inbox?tab=validations&fullscreen=true')}
            className="text-[10px] font-black font-montserrat uppercase px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 shadow-xs"
            title="Abrir vista completa de Mensajes & Validaciones"
          >
            <span>Ver Todo</span>
            <ArrowRight size={10} />
          </button>
          <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            EN VIVO
          </span>
        </div>
      </header>

      {/* Semantic Category Tabs with Live Badges */}
      <nav aria-label="Inbox Categories" className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 shrink-0 w-full">
        <button 
          onClick={() => handleTabChange('BIOMECHANICS')} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-montserrat transition-all shrink-0 ${
            activeTab === 'BIOMECHANICS' 
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
              : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Video size={13} />
          <span>Biomecánica</span>
          {countByType.BIOMECHANICS > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/20 text-white">
              {countByType.BIOMECHANICS}
            </span>
          )}
        </button>

        <button 
          onClick={() => handleTabChange('URGENT')} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-montserrat transition-all shrink-0 ${
            activeTab === 'URGENT' 
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
              : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <AlertTriangle size={13} />
          <span>Alertas / Dolor</span>
          {countByType.URGENT > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/20 text-white">
              {countByType.URGENT}
            </span>
          )}
        </button>

        <button 
          onClick={() => handleTabChange('NUTRITION')} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-montserrat transition-all shrink-0 ${
            activeTab === 'NUTRITION' 
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
              : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Apple size={13} />
          <span>Nutrición</span>
          {countByType.NUTRITION > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/20 text-white">
              {countByType.NUTRITION}
            </span>
          )}
        </button>

        <button 
          onClick={() => handleTabChange('PAYMENT')} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-montserrat transition-all shrink-0 ${
            activeTab === 'PAYMENT' 
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
              : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <CreditCard size={13} />
          <span>Pagos</span>
        </button>
      </nav>

      {/* Item List with Live Actions */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
        {pendingItems.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-2 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">
              ¡Todo al día en esta categoría!
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              No tienes validaciones pendientes de atletas. Las nuevas consultas ingresarán en vivo.
            </p>
          </div>
        ) : (
          pendingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-3 shadow-xs hover:border-indigo-400/60 transition-all"
            >
              {/* Top Row: Avatar + Name + Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={item.athleteAvatar} 
                    alt={item.athleteName}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-500/40" 
                  />
                  <div>
                    <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                      {item.athleteName}
                    </h4>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                      {item.issue}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock size={11} /> {item.time}
                </span>
              </div>

              {/* Detail Text */}
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-snug">
                {item.detailText}
              </p>

              {/* Biomechanics Telemetry Box */}
              {item.type === 'BIOMECHANICS' && (
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <Play size={12} className="fill-blue-500" />
                      <span>{item.exerciseName || 'Sentadilla Trasera'}</span>
                    </span>
                    <span className="font-mono font-black text-slate-800 dark:text-white">
                      {item.currentWeightKg || 100} kg • RPE {item.declaredRpe || 8.5}
                    </span>
                  </div>

                  {/* 1-Click Fast Actions for Biomechanics */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(item)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
                    >
                      <Check size={12} />
                      <span>Aprobar (+25 XP)</span>
                    </button>

                    <button
                      onClick={() => handleAdjustLoad(item)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-montserrat font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95"
                    >
                      <AlertTriangle size={12} />
                      <span>Ajustar -5kg</span>
                    </button>

                    <button
                      onClick={() => setActiveReplyId(activeReplyId === item.id ? null : item.id)}
                      className="p-1.5 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-slate-700 dark:text-zinc-300 transition-colors"
                      title="Escribir mensaje personalizado"
                    >
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* General Actions for Other Types */}
              {item.type !== 'BIOMECHANICS' && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Atleta esperando feedback</span>
                  <button
                    onClick={() => setActiveReplyId(activeReplyId === item.id ? null : item.id)}
                    className="py-1 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-montserrat font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                  >
                    <MessageSquare size={12} />
                    <span>Responder en Chat</span>
                  </button>
                </div>
              )}

              {/* Custom Reply Box Inline */}
              <AnimatePresence>
                {activeReplyId === item.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder={`Escribe a ${item.athleteName}...`}
                      value={replyTextMap[item.id] || ''}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [item.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendCustomReply(item.id)}
                      className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    <button
                      onClick={() => handleSendCustomReply(item.id)}
                      disabled={!replyTextMap[item.id]?.trim()}
                      className="p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition-all shrink-0"
                    >
                      <Send size={13} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}

        {/* Resolved History Section */}
        {resolvedItems.length > 0 && (
          <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Completados Recientes ({resolvedItems.length})
            </h4>
            {resolvedItems.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/40 flex items-center justify-between text-xs opacity-75"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{r.athleteName}</span>
                    <p className="text-[10px] text-slate-400">{r.issue}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {r.resolvedAt || 'Validado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

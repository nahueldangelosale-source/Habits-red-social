import React, { useState, useRef, useEffect } from 'react';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { 
  Send, Phone, Video, MoreVertical, Check, CheckCheck, Camera, 
  Sparkles, UserCheck, Crown, Shield, Star, KeyRound, Info, ArrowRight, 
  MessageSquare, Dumbbell, Utensils, HeartPulse, Zap, Moon, Image as ImageIcon,
  ChevronDown, ChevronUp, Award, SlidersHorizontal, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCoachStore } from '../../stores/useCoachStore';
import { useCoachCommunicationStore } from '../../stores/useCoachCommunicationStore';
import { CoachPlansModal } from '../coach/CoachPlansModal';
import { QuickTopicModal, type QuickTopicType } from './QuickTopicModal';

interface QuickTopic {
  id: QuickTopicType;
  icon: string;
  label: string;
  desc: string;
  category: 'ENTRENO' | 'NUTRICION' | 'SALUD';
}

const QUICK_TOPICS: QuickTopic[] = [
  {
    id: 'cargas',
    icon: '🏋️',
    label: 'Cargas & RPE',
    desc: 'Ajustar pesos de series',
    category: 'ENTRENO'
  },
  {
    id: 'video',
    icon: '🎥',
    label: 'Técnica en Video',
    desc: 'Validación biomecánica',
    category: 'ENTRENO'
  },
  {
    id: 'nutricion',
    icon: '🥗',
    label: 'Dieta & Macros',
    desc: 'Smart Swap de alimentos',
    category: 'NUTRICION'
  },
  {
    id: 'dolor',
    icon: '🩹',
    label: 'Molestia / Firewall',
    desc: 'Sustituto de ejercicio',
    category: 'SALUD'
  },
  {
    id: 'nivel',
    icon: '⚡',
    label: 'Subir Nivel',
    desc: 'Mayor intensidad y volumen',
    category: 'ENTRENO'
  },
  {
    id: 'fatiga',
    icon: '😴',
    label: 'Fatiga / Readiness',
    desc: 'Recuperación activa',
    category: 'SALUD'
  },
  {
    id: 'foto',
    icon: '📸',
    label: 'Foto Progreso',
    desc: 'Registro corporal confidencial',
    category: 'NUTRICION'
  }
];

export const CoachChatView: React.FC = () => {
  const { calmMode } = useCognitiveLoad();
  const { 
    hasAssignedCoach, 
    assignedCoach, 
    activePlanTier 
  } = useCoachStore();

  const { 
    messages, 
    sendAthleteMessage, 
    initBroadcastSync 
  } = useCoachCommunicationStore();

  const [message, setMessage] = useState('');
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(true);
  const [selectedTopicForModal, setSelectedTopicForModal] = useState<QuickTopicType | null>(null);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = initBroadcastSync();
    return cleanup;
  }, [initBroadcastSync]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendAthleteMessage(message, 'text');
    setMessage('');
  };

  const handleTopicClick = (topicType: QuickTopicType) => {
    if (topicType === 'foto') {
      sendAthleteMessage('📸 Foto de control subida a la Galería para tu revisión periódica.', 'text', 'foto');
      toast.success('¡Notificación de foto enviada al Coach!', { icon: '📸' });
      if (navigator.vibrate) navigator.vibrate([25]);
    } else {
      setSelectedTopicForModal(topicType);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden font-lato transition-colors duration-500 bg-slate-50 dark:bg-[#04060a] ${calmMode ? 'font-serif' : 'font-sans'}`}>
      
      {/* ESCENARIO A: EL ATLETA TIENE UN COACH ASIGNADO */}
      {hasAssignedCoach && assignedCoach ? (
        <>
          {/* Header Compacto Tipo WhatsApp */}
          <div className="bg-white dark:bg-[#0a0d16] border-b border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2.5 shrink-0 flex items-center justify-between shadow-xs z-10">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={assignedCoach.avatarUrl} 
                  alt={assignedCoach.name} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                />
                {assignedCoach.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0d16]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-black font-montserrat text-sm text-slate-900 dark:text-white truncate">
                    {assignedCoach.name}
                  </h2>
                  <span className="text-[8px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                    <Crown size={8} /> PRO
                  </span>
                </div>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {assignedCoach.isOnline ? `En línea • Responde en ${assignedCoach.responseTime}` : 'Disponible'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-xl border border-slate-200/50 dark:border-white/5 flex items-center gap-1">
                <Shield size={11} className="text-emerald-500" />
                <span>Plan Activo</span>
              </span>
            </div>
          </div>

          {/* Área de Mensajes con Scroll Interno */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3.5 py-3 space-y-3">
            <div className="text-center my-0.5">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-200/50 dark:border-slate-800/50">
                Canal Directo Encriptado con {assignedCoach.name.split(' ')[0]} 🔒
              </span>
            </div>
            
            {messages.map((msg) => {
              const isMe = msg.sender === 'me';
              const isBadge = msg.mediaType === 'validation_badge';
              const isVideo = msg.mediaType === 'video_check';

              // Detect topic tag in text
              let topicBadge = null;
              if (msg.text.startsWith('🏋️')) topicBadge = { label: 'Ajuste de Cargas', color: 'bg-indigo-500/20 text-white' };
              else if (msg.text.startsWith('🎥')) topicBadge = { label: 'Biomecánica en Video', color: 'bg-purple-500/20 text-white' };
              else if (msg.text.startsWith('🥗')) topicBadge = { label: 'Smart Swap Nutricional', color: 'bg-emerald-500/20 text-white' };
              else if (msg.text.startsWith('🩹')) topicBadge = { label: 'Firewall Biomecánico', color: 'bg-rose-500/20 text-white' };
              else if (msg.text.startsWith('⚡')) topicBadge = { label: 'Aumento de Intensidad', color: 'bg-amber-500/20 text-white' };
              else if (msg.text.startsWith('😴')) topicBadge = { label: 'Readiness & Fatiga', color: 'bg-purple-500/20 text-white' };
              else if (msg.text.startsWith('📸')) topicBadge = { label: 'Foto de Progreso', color: 'bg-indigo-500/20 text-white' };

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 space-y-1.5 shadow-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/15' 
                      : isBadge
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-2 border-emerald-500 text-slate-900 dark:text-white rounded-bl-xs shadow-md shadow-emerald-500/10'
                        : 'bg-white dark:bg-[#0e121d] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                  }`}>
                    
                    {/* Header Tag for Structured Messages */}
                    {isMe && topicBadge && (
                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${topicBadge.color}`}>
                          {topicBadge.label}
                        </span>
                      </div>
                    )}

                    {isVideo && (
                      <div className={`p-2 rounded-xl mb-1 flex items-center gap-2 text-xs font-bold ${
                        isMe ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white'
                      }`}>
                        <Video size={14} className="text-amber-300" />
                        <span>Validación Biomecánica Registrada</span>
                      </div>
                    )}

                    {isBadge && (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs pb-1 border-b border-emerald-200 dark:border-emerald-800/60">
                        <Award size={15} className="text-amber-500" />
                        <span>Resolución de Cabina del Coach</span>
                      </div>
                    )}
                    
                    <p className={`text-[13px] sm:text-sm leading-relaxed ${
                      isMe ? 'text-white font-normal' : isBadge ? 'font-semibold text-slate-900 dark:text-emerald-100' : 'text-slate-800 dark:text-slate-100 font-normal'
                    }`}>
                      {msg.text}
                    </p>
                    
                    <div className={`flex items-center justify-end gap-1 text-[9px] ${
                      isMe ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck size={12} className="text-white" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* BANDEJA DE TEMAS RÁPIDOS & CONSULTAS GUIADAS                */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="bg-white/95 dark:bg-[#0a0d16]/95 border-t border-slate-200/80 dark:border-slate-800/80 px-3.5 pt-2 pb-1.5 backdrop-blur-md shrink-0">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <button
                onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-montserrat flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Sparkles size={12} className="text-indigo-500" />
                <span>Consultas Rápidas y Guiadas</span>
                {isTopicsExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
              </button>
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold">
                Toca para personalizar y enviar
              </span>
            </div>

            {/* Malla de Pastillas Rápidas con Categorías y Guía */}
            <AnimatePresence>
              {isTopicsExpanded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 pb-0.5"
                >
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-zinc-900 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-white/5 text-[11px] font-bold font-montserrat flex items-center gap-1.5 shrink-0 transition-all active:scale-95 shadow-xs"
                      title={topic.desc}
                    >
                      <span className="text-sm">{topic.icon}</span>
                      <span>{topic.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Barra de Input Estilo WhatsApp */}
          <div className="p-2.5 bg-white dark:bg-[#0a0d16] border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedTopicForModal('video')}
                className="p-2.5 rounded-full text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-slate-800 transition-colors shrink-0"
                title="Enviar video para corrección biomecánica"
              >
                <Camera size={17} />
              </button>
              
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full px-3.5 py-2 flex items-center transition-colors">
                <input 
                  type="text" 
                  placeholder={`Mensaje a ${assignedCoach.name.split(' ')[0]}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                />
              </div>
              
              <button 
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* ESCENARIO B: EL ATLETA AÚN NO TIENE UN COACH ASIGNADO */
        <div className="flex-1 overflow-y-auto p-5 max-w-md mx-auto w-full flex flex-col justify-center items-center text-center space-y-5">
          {/* Hero Concéntrico */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-indigo-500 to-purple-600 p-[3px] shadow-xl shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#0c0f18] flex items-center justify-center text-2xl">
                🏋️‍♂️
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-black font-bold">
              <Crown size={13} />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Módulo de Acompañamiento 1 a 1
            </span>
            <h2 className="text-lg font-black font-montserrat tracking-tight text-slate-900 dark:text-white mt-2">
              Entrená Guiado por un Coach Certificado
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Este canal se desbloquea al vincularte con tu entrenador para recibir corrección de técnica en video, ajustes de cargas y consultas directas.
            </p>
          </div>

          {/* 3 Beneficios Clave */}
          <div className="w-full space-y-2 text-left">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Dumbbell size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                  Prescripción Adaptada a Vos
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Volumen, series y sustituciones de ejercicios revisadas por tu coach
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Video size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                  Corrección Biomecánica en Video
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Subí tus levantamientos para chequear técnica y evitar lesiones
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <MessageSquare size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                  Chat Directo y Preguntas Rápidas
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Resolvé dudas sobre nutrición, fatiga y descansos
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="w-full space-y-2 pt-1">
            <button
              onClick={() => setIsPlansModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <KeyRound size={14} />
              <span>Tengo un Código de Invitación de mi Coach</span>
            </button>

            <button
              onClick={() => setIsPlansModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Crown size={13} className="text-amber-500" />
              <span>Explorar Coaches Certificados</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Planes, Marketplace y Canje de Código */}
      <CoachPlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
      />

      {/* Modal de Pregunta / Consulta Guiada Pedagógica */}
      <QuickTopicModal
        isOpen={!!selectedTopicForModal}
        onClose={() => setSelectedTopicForModal(null)}
        topicType={selectedTopicForModal}
        coachName={assignedCoach?.name || 'Coach'}
        onSendMessage={sendAthleteMessage}
      />
    </div>
  );
};

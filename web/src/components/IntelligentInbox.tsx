import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MessageSquare, Dumbbell, Apple, CreditCard, Send,
  Users, Activity, X, ChevronRight, CheckCircle2, AlertTriangle,
  Play, Video, Sparkles, Clock, ShieldAlert, ArrowRight, UserCheck,
  Check, RefreshCw, Mic, Volume2, Layers, ChevronDown, ChevronUp, Maximize2,
  FileText, Palette, HeartPulse, User, Bot
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCoachCommunicationStore, type InboxItem, type ChatMessage } from '../stores/useCoachCommunicationStore';
import { usePlanBuilderStore } from '../stores/usePlanBuilderStore';
import { TinderValidationDeck } from './inbox/TinderValidationDeck';
import { AthleteQuickCardDrawer } from './inbox/AthleteQuickCardDrawer';
import { CommunicationConfigTab } from './inbox/CommunicationConfigTab';

type PrimaryTab = 'messages' | 'validations' | 'communication';
type FilterTab = 'all' | 'biomechanics' | 'risks' | 'nutrition' | 'payments' | 'resolved';

type BubbleTheme = 'indigo' | 'emerald' | 'violet' | 'ocean' | 'obsidian' | 'sunset' | 'rose';

const BUBBLE_THEMES: { id: BubbleTheme; label: string; bgClass: string; hex: string }[] = [
  { id: 'indigo', label: 'Índigo', bgClass: 'bg-indigo-600', hex: '#4f46e5' },
  { id: 'emerald', label: 'Esmeralda', bgClass: 'bg-emerald-600', hex: '#059669' },
  { id: 'violet', label: 'Violeta', bgClass: 'bg-purple-600', hex: '#9333ea' },
  { id: 'ocean', label: 'Océano', bgClass: 'bg-sky-600', hex: '#0284c7' },
  { id: 'sunset', label: 'Atardecer', bgClass: 'bg-amber-600', hex: '#d97706' },
  { id: 'obsidian', label: 'Obsidiana', bgClass: 'bg-zinc-800', hex: '#27272a' },
  { id: 'rose', label: 'Rosa Coral', bgClass: 'bg-rose-600', hex: '#e11d48' },
];

export const IntelligentInbox: React.FC = () => {
  const {
    inboxItems,
    messages,
    coachValidateBiomechanics,
    coachReplyMessage,
    sendAthleteMessage,
    initBroadcastSync
  } = useCoachCommunicationStore();

  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  
  // Tab Principal
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>(() => {
    if (urlTab === 'communication' || urlTab === 'channels' || urlTab === 'settings') return 'communication';
    if (urlTab === 'validations') return 'validations';
    return 'messages';
  });

  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemId, setActiveItemId] = useState<string>(inboxItems[0]?.id || 'inbox-1');
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showVideoBanner, setShowVideoBanner] = useState(false);

  // Drawer de Ficha / Actividad
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'activity'>('profile');

  // Tema de Color de Burbujas del Coach (Persistido en localStorage)
  const [bubbleTheme, setBubbleTheme] = useState<BubbleTheme>(() => {
    return (localStorage.getItem('coach_chat_bubble_theme') as BubbleTheme) || 'indigo';
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pendingValidationsCount = useMemo(() => {
    return inboxItems.filter(
      (i) => (i.type === 'BIOMECHANICS' || i.type === 'URGENT') && i.status === 'PENDING'
    ).length;
  }, [inboxItems]);

  useEffect(() => {
    const unsubscribe = initBroadcastSync();
    return () => unsubscribe();
  }, [initBroadcastSync]);

  const handleSelectTheme = (theme: BubbleTheme) => {
    setBubbleTheme(theme);
    localStorage.setItem('coach_chat_bubble_theme', theme);
    setShowColorPicker(false);
    toast.success(`Color de chat actualizado: ${theme}`, { icon: '🎨', duration: 1500 });
  };

  const filteredItems = useMemo(() => {
    return inboxItems.filter((item) => {
      if (activeFilterTab === 'risks' && item.type !== 'URGENT') return false;
      if (activeFilterTab === 'biomechanics' && item.type !== 'BIOMECHANICS') return false;
      if (activeFilterTab === 'nutrition' && item.type !== 'NUTRITION') return false;
      if (activeFilterTab === 'payments' && item.type !== 'PAYMENT') return false;
      if (activeFilterTab === 'resolved' && item.status !== 'RESOLVED') return false;
      if (activeFilterTab !== 'resolved' && item.status === 'RESOLVED') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.athleteName.toLowerCase().includes(q);
        const matchesIssue = item.issue.toLowerCase().includes(q);
        const matchesDetail = item.detailText.toLowerCase().includes(q);
        return matchesName || matchesIssue || matchesDetail;
      }

      return true;
    });
  }, [inboxItems, activeFilterTab, searchQuery]);

  const activeItem = useMemo(() => {
    return inboxItems.find((item) => item.id === activeItemId) || filteredItems[0] || inboxItems[0];
  }, [inboxItems, activeItemId, filteredItems]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeItem]);

  const handleValidate = (decision: 'APPROVED' | 'ADJUSTED') => {
    if (!activeItem) return;

    if (decision === 'APPROVED') {
      coachValidateBiomechanics(
        activeItem.id,
        'APPROVED',
        '¡Excelente profundidad y bloqueo articular! Mantener esta técnica en la próxima serie.'
      );
      toast.success('¡Técnica Aprobada! +25 XP otorgados al atleta.', { icon: '🏆', duration: 3000 });
    } else {
      coachValidateBiomechanics(
        activeItem.id,
        'ADJUSTED',
        'Notamos leve fatiga lumbar en la fase excéntrica. Ajustamos -5kg temporalmente para consolidar técnica.',
        -5
      );
      toast('Carga ajustada -5kg en el Plan Builder.', { icon: '⚖️', duration: 3000 });
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeItem) return;

    setIsReplying(true);
    coachReplyMessage(activeItem.id, replyText.trim());
    setReplyText('');
    setIsReplying(false);
    toast.success('Mensaje enviado al atleta', { icon: '💬', duration: 1500 });
  };

  const filterTabs: { id: FilterTab; label: string; icon: string; count: number; activeColor: string }[] = [
    { id: 'all', label: 'Todos', icon: '💬', count: inboxItems.filter((i) => i.status === 'PENDING').length, activeColor: 'bg-indigo-600 text-white' },
    { id: 'biomechanics', label: 'Biomecánica', icon: '🏋️', count: inboxItems.filter((i) => i.type === 'BIOMECHANICS' && i.status === 'PENDING').length, activeColor: 'bg-amber-500 text-white' },
    { id: 'risks', label: 'Riesgos', icon: '⚠️', count: inboxItems.filter((i) => i.type === 'URGENT' && i.status === 'PENDING').length, activeColor: 'bg-rose-600 text-white' },
    { id: 'nutrition', label: 'Nutrición', icon: '🥗', count: inboxItems.filter((i) => i.type === 'NUTRITION' && i.status === 'PENDING').length, activeColor: 'bg-emerald-600 text-white' },
    { id: 'payments', label: 'Pagos', icon: '💳', count: inboxItems.filter((i) => i.type === 'PAYMENT' && i.status === 'PENDING').length, activeColor: 'bg-sky-600 text-white' },
    { id: 'resolved', label: 'Resueltos', icon: '✅', count: inboxItems.filter((i) => i.status === 'RESOLVED').length, activeColor: 'bg-slate-700 text-white' },
  ];

  const currentBubbleBg = BUBBLE_THEMES.find(t => t.id === bubbleTheme)?.bgClass || 'bg-indigo-600';

  return (
    <div className="h-[calc(100vh-20px)] flex flex-col rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#0a0d16] shadow-sm font-lato m-2.5 md:m-3">
      
      {/* 🌟 CABECERA SUPERIOR */}
      <div className="px-5 py-3 border-b border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-[#0a0d16]/95 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-sm font-black font-montserrat uppercase tracking-wider text-slate-900 dark:text-white">
              Mensajes & Validaciones
            </h1>
            <p className="text-[10px] text-slate-400">
              Centro de comunicación y auditoría biomecánica en tiempo real
            </p>
          </div>
        </div>

        {/* Pestañas Principales Estilo Switch */}
        <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
          <button
            onClick={() => setPrimaryTab('messages')}
            className={`py-1 px-3.5 rounded-xl text-xs font-black font-montserrat uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              primaryTab === 'messages'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare size={13} />
            <span>Mensajes & Chat</span>
          </button>

          <button
            onClick={() => setPrimaryTab('validations')}
            className={`py-1 px-3.5 rounded-xl text-xs font-black font-montserrat uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              primaryTab === 'validations'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Validaciones Tinder</span>
            {pendingValidationsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                primaryTab === 'validations'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-indigo-600 text-white'
              }`}>
                {pendingValidationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setPrimaryTab('communication')}
            className={`py-1 px-3.5 rounded-xl text-xs font-black font-montserrat uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              primaryTab === 'communication'
                ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot size={13} />
            <span>Canales & Automatizaciones</span>
          </button>
        </div>
      </div>

      {/* 🌟 CONTENIDO CONDICIONAL */}
      {primaryTab === 'validations' ? (
        <TinderValidationDeck />
      ) : primaryTab === 'communication' ? (
        <CommunicationConfigTab />
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* 1. Panel Izquierdo: Lista de Conversaciones */}
          <div className="w-[320px] lg:w-[350px] flex flex-col border-r border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#06080e]/60 shrink-0">
            
            {/* Header & Buscador */}
            <div className="p-3 border-b border-slate-200/80 dark:border-zinc-800 space-y-2.5 bg-white dark:bg-[#0a0d16]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar atleta o consulta..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none transition-all border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-slate-800 dark:text-zinc-100 focus:border-indigo-500"
                />
              </div>

              {/* Píldoras de Filtros Amigables en Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {filterTabs.map((tab) => {
                  const isActive = activeFilterTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilterTab(tab.id)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold font-montserrat transition-all flex items-center justify-between shadow-2xs ${
                        isActive
                          ? `${tab.activeColor} shadow-sm scale-102`
                          : 'bg-white dark:bg-zinc-900/90 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/70 dark:border-zinc-800'
                      }`}
                    >
                      <span className="flex items-center gap-1 truncate">
                        <span>{tab.icon}</span>
                        <span className="truncate">{tab.label}</span>
                      </span>
                      {tab.count > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ml-1 ${
                          isActive ? 'bg-white/30 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Conversaciones */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-900/80 no-scrollbar p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2">
                  <CheckCircle2 size={28} className="mx-auto text-slate-300 dark:text-zinc-700" />
                  <p className="text-xs font-bold">No hay mensajes en esta categoría</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveItemId(item.id)}
                      className={`p-2.5 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-white dark:bg-zinc-900/90 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                          : 'bg-white/60 dark:bg-[#0a0d16]/60 border-transparent hover:bg-white dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={item.athleteAvatar}
                            alt={item.athleteName}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-zinc-800"
                          />
                          {item.type === 'URGENT' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white dark:ring-black flex items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white truncate">
                              {item.athleteName}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">{item.time}</span>
                          </div>

                          <div className="flex items-center gap-1 mb-1">
                            <span className={`text-[8px] font-black font-montserrat uppercase px-1.5 py-0.2 rounded-md ${
                              item.type === 'BIOMECHANICS'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                                : item.type === 'URGENT'
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                                  : item.type === 'NUTRITION'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                                    : 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60'
                            }`}>
                              {item.type}
                            </span>

                            {item.status === 'RESOLVED' && (
                              <span className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5">
                                <Check size={9} /> Resuelto
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium line-clamp-1 leading-tight">
                            {item.issue}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Panel Derecho: Conversación Activa & Chat */}
          <div className="flex-1 flex flex-col bg-white dark:bg-[#0a0d16] overflow-hidden min-h-0 relative">
            {activeItem ? (
              <>
                {/* Header del Atleta Activo */}
                <div className="h-14 px-4 md:px-5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-[#0a0d16] shrink-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeItem.athleteAvatar}
                      alt={activeItem.athleteName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                          {activeItem.athleteName}
                        </h3>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {activeItem.exerciseName ? `Reportando: ${activeItem.exerciseName}` : 'Canal Directo de Feedback'}
                      </p>
                    </div>
                  </div>

                  {/* Acceso Rápido a Ficha, Actividad, Video & Color de Burbujas */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* Botón Ficha del Atleta */}
                    <button
                      onClick={() => {
                        setDrawerTab('profile');
                        setDrawerOpen(true);
                      }}
                      className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-bold font-montserrat flex items-center gap-1.5 transition-all shadow-2xs"
                      title="Ver Ficha Clínica y Deportiva"
                    >
                      <FileText size={12} className="text-indigo-500" />
                      <span className="hidden sm:inline">Ficha Atleta</span>
                    </button>

                    {/* Botón Actividad Reciente */}
                    <button
                      onClick={() => {
                        setDrawerTab('activity');
                        setDrawerOpen(true);
                      }}
                      className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-bold font-montserrat flex items-center gap-1.5 transition-all shadow-2xs"
                      title="Ver Actividad y Telemetría Reciente"
                    >
                      <Activity size={12} className="text-emerald-500" />
                      <span className="hidden sm:inline">Actividad</span>
                    </button>

                    {/* Selector de Color de Burbujas */}
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-all shadow-2xs flex items-center gap-1"
                        title="Personalizar color de burbujas de chat"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-white/50"
                          style={{ backgroundColor: BUBBLE_THEMES.find(t => t.id === bubbleTheme)?.hex }}
                        />
                        <Palette size={11} className="text-slate-400" />
                      </button>

                      {/* Dropdown flotante de colores */}
                      {showColorPicker && (
                        <div className="absolute right-0 top-9 z-30 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl space-y-1.5 min-w-[150px]">
                          <span className="text-[9px] font-black uppercase text-slate-400 block px-1">
                            Color de Burbujas
                          </span>
                          <div className="grid grid-cols-4 gap-1.5 p-1">
                            {BUBBLE_THEMES.map((theme) => (
                              <button
                                key={theme.id}
                                onClick={() => handleSelectTheme(theme.id)}
                                className={`w-7 h-7 rounded-xl transition-transform flex items-center justify-center ${
                                  bubbleTheme === theme.id ? 'scale-110 ring-2 ring-indigo-500' : 'hover:scale-105'
                                }`}
                                style={{ backgroundColor: theme.hex }}
                                title={theme.label}
                              >
                                {bubbleTheme === theme.id && <Check size={12} className="text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón Ver Video Plegable */}
                    {activeItem.videoUrl && (
                      <button
                        onClick={() => setShowVideoBanner(!showVideoBanner)}
                        className="py-1 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold font-montserrat flex items-center gap-1 transition-all border border-indigo-200 dark:border-indigo-800"
                      >
                        <Video size={12} />
                        <span>{showVideoBanner ? 'Ocultar Video' : 'Ver Video'}</span>
                        {showVideoBanner ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner Plegable de Video & Contexto */}
                <AnimatePresence>
                  {showVideoBanner && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-900/60 p-4 shrink-0 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                            {activeItem.issue}
                          </h4>
                          <p className="text-[11px] text-slate-500">{activeItem.detailText}</p>
                        </div>
                        {activeItem.currentWeightKg && (
                          <span className="text-xs font-black font-mono px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                            {activeItem.currentWeightKg} kg • RPE {activeItem.declaredRpe || 8.5}
                          </span>
                        )}
                      </div>

                      {activeItem.videoUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black aspect-video max-h-[180px] mx-auto">
                          <video src={activeItem.videoUrl} controls className="w-full h-full object-contain" />
                        </div>
                      )}

                      {activeItem.status === 'PENDING' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleValidate('APPROVED')}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <CheckCircle2 size={13} />
                            <span>Aprobar (+25 XP)</span>
                          </button>

                          <button
                            onClick={() => handleValidate('ADJUSTED')}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-montserrat font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <AlertTriangle size={13} />
                            <span>Ajustar Carga (-5 kg)</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mensajes del Chat con Tipografía Ultranítida y Color Personalizable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-50/30 dark:bg-[#06080e]/40">
                  {messages.map((msg) => {
                    const isCoach = msg.sender === 'coach';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCoach ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isCoach
                              ? `${currentBubbleBg} text-white font-medium rounded-tr-none antialiased`
                              : 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-medium rounded-tl-none border border-slate-200/80 dark:border-zinc-700/80'
                          }`}
                        >
                          <p className={`select-text text-xs leading-relaxed ${
                            isCoach ? 'text-white font-medium' : 'text-slate-900 dark:text-zinc-100 font-normal'
                          }`}>
                            {msg.text}
                          </p>
                          <span className={`text-[9px] block text-right mt-1 font-mono ${
                            isCoach ? 'text-white/80' : 'text-slate-400 dark:text-zinc-400'
                          }`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input para responder Acoplado al Fondo */}
                <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#0a0d16] flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Escribe un mensaje o indicación técnica..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-all border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isReplying}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-montserrat font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
                  >
                    <Send size={13} />
                    <span>Enviar</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare size={36} className="text-slate-300 dark:text-zinc-700 mb-2" />
                <h4 className="text-xs font-black font-montserrat text-slate-700 dark:text-zinc-300">
                  Selecciona una conversación
                </h4>
              </div>
            )}

            {/* Drawer Deslizable de Ficha del Atleta / Actividad */}
            <AthleteQuickCardDrawer
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              tab={drawerTab}
              athleteName={activeItem?.athleteName || 'Atleta'}
              athleteAvatar={activeItem?.athleteAvatar || ''}
            />
          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, AlertTriangle, Check, X, ShieldCheck, Play, Pause, 
  Mic, Square, RotateCcw, PenTool, CheckCircle2, Video, Volume2, 
  Sparkles, User, Activity, Flame, ChevronRight, RefreshCw, Maximize2, Minimize2,
  Send, MessageSquare, Trash2, Headphones
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCoachCommunicationStore, type InboxItem } from '../../stores/useCoachCommunicationStore';

export const TinderValidationDeck: React.FC = () => {
  const { inboxItems, coachValidateBiomechanics, coachReplyMessage } = useCoachCommunicationStore();
  const [searchParams] = useSearchParams();
  
  const [isFullScreen, setIsFullScreen] = useState(searchParams.get('fullscreen') === 'true');

  // Items de validacion pendientes
  const pendingItems = inboxItems.filter(
    (item) => (item.type === 'BIOMECHANICS' || item.type === 'URGENT') && item.status === 'PENDING'
  );

  const [selectedId, setSelectedId] = useState<string>(pendingItems[0]?.id || '');
  const activeItem = pendingItems.find((i) => i.id === selectedId) || pendingItems[0];

  // Video & Telestrator State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>('#ef4444');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Written Chat Feedback Note State
  const [writtenNote, setWrittenNote] = useState('');

  // Quick feedback templates
  const quickSuggestions = [
    '🎯 Excelente profundidad y timing',
    '🦵 Cuidado con el valgo de rodilla',
    '🧱 Mantener core y espalda neutra',
    '⏱️ Controlar más la fase excéntrica'
  ];

  // Setup Canvas Context
  useEffect(() => {
    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext('2d');
      if (renderCtx) {
        renderCtx.strokeStyle = penColor;
        renderCtx.lineWidth = 4;
        renderCtx.lineCap = 'round';
        renderCtx.lineJoin = 'round';
        setCtx(renderCtx);
      }
    }
  }, [activeItem?.id, isDrawingMode, penColor, isFullScreen]);

  // Tecla ESC para salir de pantalla completa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        clearCanvas();
        setIsDrawingMode(false);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !ctx) return;
    e.preventDefault();
    setIsDrawing(true);
    
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !isDrawingMode) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) ctx.closePath();
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Audio Recording Logic
  const handleRecordToggle = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(url);
          toast.success('Audio grabado con éxito', { icon: '🎙️' });
        };

        mediaRecorder.start();
        setIsRecording(true);
        if (isPlaying && videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } catch (err) {
        toast.error('Permiso de micrófono no disponible.');
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      }
    }
  };

  const handleDeleteAudio = () => {
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];
    toast('Audio eliminado', { icon: '🗑️' });
  };

  // Decisiones de Aprobación / Ajuste
  const handleApprove = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    const feedbackMsg = writtenNote.trim() 
      ? `✅ [Aprobado (+25 XP)]: ${writtenNote.trim()}`
      : '✅ ¡Técnica aprobada! Alineación articular perfecta y profundidad conseguida. +25 XP.';

    coachValidateBiomechanics(id, 'APPROVED', feedbackMsg);
    
    // Si escribió una nota, enviarla también al chat
    if (writtenNote.trim()) {
      coachReplyMessage(id, writtenNote.trim());
    }

    clearCanvas();
    setIsDrawingMode(false);
    setWrittenNote('');
    setRecordedAudioUrl(null);
    toast.success('¡Técnica Aprobada! +25 XP otorgados al atleta.', { icon: '🏆', duration: 2500 });
  };

  const handleAdjust = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const feedbackMsg = writtenNote.trim()
      ? `⚠️ [Ajuste de Carga -5kg]: ${writtenNote.trim()}`
      : '⚠️ Corrección biomecánica enviada con trazo de feedback y ajuste preventivo de -5kg.';

    coachValidateBiomechanics(id, 'ADJUSTED', feedbackMsg, -5);

    if (writtenNote.trim()) {
      coachReplyMessage(id, writtenNote.trim());
    }

    clearCanvas();
    setIsDrawingMode(false);
    setWrittenNote('');
    setRecordedAudioUrl(null);
    toast('Carga ajustada -5kg con feedback biomecánico.', { icon: '⚖️', duration: 2500 });
  };

  if (pendingItems.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <ShieldCheck size={40} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black font-montserrat text-slate-800 dark:text-zinc-100">
            ¡Todo al día en Validaciones!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            No tienes videos ni alertas pendientes de revisión. Las nuevas series pesadas ingresarán en tiempo real.
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🌟 MODO PANTALLA COMPLETA OSCURO CINEMÁTICO (DARKROOM FULL-SCREEN STUDIO)
  // ═══════════════════════════════════════════════════════════════════════════════
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col md:flex-row overflow-hidden font-lato">
        
        {/* Panel Izquierdo: Video Cinemático con Telestrator */}
        <div className="flex-1 bg-black relative flex flex-col border-r border-zinc-900">
          <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-md">
                MODO REVISIÓN PANTALLA COMPLETA
              </div>
              <span className="text-zinc-400 text-xs font-bold font-mono">
                {pendingItems.length} pendientes
              </span>
            </div>

            <button
              onClick={() => setIsFullScreen(false)}
              className="py-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
              title="Salir de pantalla completa (ESC)"
            >
              <Minimize2 size={14} />
              <span>Cerrar Pantalla Completa</span>
            </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-8 md:p-12">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-zinc-800 shadow-2xl max-w-5xl w-full aspect-video bg-zinc-950">
              <video
                ref={videoRef}
                src={activeItem?.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              <canvas
                ref={canvasRef}
                width={960}
                height={540}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`absolute inset-0 w-full h-full ${
                  isDrawingMode ? 'cursor-crosshair z-20' : 'pointer-events-none z-10'
                }`}
              />

              {/* Toolbar Flotante */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/60 rounded-2xl z-30 shadow-2xl">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  title={isPlaying ? 'Congelar Pantalla' : 'Reproducir'}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>

                <div className="w-[1px] h-6 bg-zinc-700 mx-1" />

                <button
                  onClick={() => {
                    setPenColor('#ef4444');
                    setIsDrawingMode(true);
                    if (isPlaying && videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                    isDrawingMode && penColor === '#ef4444'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-rose-400 hover:bg-zinc-700'
                  }`}
                  title="Lápiz Corrector (Rojo)"
                >
                  <PenTool size={18} />
                </button>

                <button
                  onClick={() => {
                    setPenColor('#10b981');
                    setIsDrawingMode(true);
                    if (isPlaying && videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                    isDrawingMode && penColor === '#10b981'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700'
                  }`}
                  title="Lápiz Postura Correcta (Verde)"
                >
                  <PenTool size={18} />
                </button>

                <button
                  onClick={clearCanvas}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Borrar Trazos"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Metadatos, Audio y Respuesta de Chat */}
        <div className="w-full md:w-[480px] bg-[#0c0c0e] flex flex-col relative border-l border-zinc-900">
          
          <div className="p-6 border-b border-zinc-900">
            <h2 className="text-2xl font-black font-montserrat text-white tracking-tight mb-1">
              {activeItem?.athleteName}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-montserrat text-sm">
                {activeItem?.exerciseName || activeItem?.issue}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <span className="text-zinc-400 font-bold font-mono text-sm">
                {activeItem?.currentWeightKg ? `${activeItem.currentWeightKg} kg` : 'Form Check'}
              </span>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-5">
            
            {/* Feedback Biomecánico Voice-Over */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Mic size={14} className="text-indigo-400" /> Feedback de Audio (Voice-Over)
              </h4>

              {recordedAudioUrl ? (
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Headphones size={15} />
                    </div>
                    <audio src={recordedAudioUrl} controls className="h-8 max-w-[220px] w-full" />
                  </div>
                  <button
                    onClick={handleDeleteAudio}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all shrink-0"
                    title="Eliminar audio y regrabar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRecordToggle}
                  className={`w-full relative overflow-hidden flex items-center justify-center gap-2.5 py-4 rounded-2xl border transition-all ${
                    isRecording 
                      ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-rose-500' 
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 bg-rose-500/10"
                      />
                      <Square size={18} className="fill-current text-rose-500" />
                      <span className="font-bold tracking-widest uppercase text-xs z-10 text-rose-500">
                        Grabando Dictado... (Toca para Finalizar)
                      </span>
                    </>
                  ) : (
                    <>
                      <Mic size={18} className="text-indigo-400" />
                      <span className="font-bold tracking-wider uppercase text-xs">
                        Grabar Dictado por Audio
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Respuesta Escrita del Chat */}
            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-emerald-400" /> Indicación Escrita para el Atleta
              </h4>
              <textarea
                value={writtenNote}
                onChange={(e) => setWrittenNote(e.target.value)}
                placeholder="Escribe la corrección personalizada que se enviará al chat..."
                rows={3}
                className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-indigo-500 text-xs text-white placeholder:text-zinc-500 outline-none transition-all resize-none"
              />

              {/* Sugerencias Rápidas */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setWrittenNote(sug)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Barra Inferior de Decisiones */}
          <div className="p-6 border-t border-zinc-900 bg-zinc-950/90">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={(e) => handleAdjust(activeItem.id, e)}
                className="py-3.5 rounded-2xl font-black font-montserrat uppercase tracking-wider text-xs flex justify-center items-center gap-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95"
              >
                <AlertTriangle size={15} /> Ajustar -5kg
              </button>

              <button 
                onClick={(e) => handleApprove(activeItem.id, e)}
                className="py-3.5 rounded-2xl font-black font-montserrat uppercase tracking-wider text-xs flex justify-center items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                <CheckCircle2 size={16} /> Aprobar (+25 XP)
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🌟 MODO EMBEBIDO EN PESTAÑA (TAB EMBEDDED VIEW) CON AUDIO PLAYER & CHAT INPUT
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-hidden font-lato">
      
      {/* 1. Panel Izquierdo (4 columnas): Cola de Triage */}
      <div className="lg:col-span-4 space-y-3 overflow-y-auto no-scrollbar pr-1">
        <div className="flex items-center justify-between px-1 mb-1">
          <span className="text-xs font-black font-montserrat uppercase tracking-wider text-slate-400">
            Cola de Triage ({pendingItems.length})
          </span>
          <button
            onClick={() => setIsFullScreen(true)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Maximize2 size={12} />
            <span>Pantalla Completa</span>
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {pendingItems.map((req) => {
            const isSelected = activeItem?.id === req.id;
            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                onClick={() => setSelectedId(req.id)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-white/80 dark:bg-zinc-950/60 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
                    <img
                      src={req.athleteAvatar}
                      alt={req.athleteName}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play size={16} className="text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white truncate">
                        {req.athleteName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">{req.time}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium truncate mb-1.5">
                      {req.exerciseName || req.issue}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                        {req.currentWeightKg ? `${req.currentWeightKg} kg` : 'Form Check'}
                      </span>
                      {req.declaredRpe && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                          RPE {req.declaredRpe}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones Rápidos en Tarjeta */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    onClick={(e) => handleAdjust(req.id, e)}
                    className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold font-montserrat flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <AlertTriangle size={12} />
                    <span>Ajustar -5kg</span>
                  </button>

                  <button
                    onClick={(e) => handleApprove(req.id, e)}
                    className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold font-montserrat flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                  >
                    <CheckCircle2 size={12} />
                    <span>Aprobar (+25 XP)</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. Panel Derecho (8 columnas): Estación Biomecánica & Multimodal Feedback */}
      <div className="lg:col-span-8 flex flex-col bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-4 overflow-hidden shadow-xs">
        {activeItem ? (
          <div className="flex flex-col h-full space-y-3 overflow-y-auto no-scrollbar">
            
            {/* Header del Atleta Auditado */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={activeItem.athleteAvatar}
                  alt={activeItem.athleteName}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                      {activeItem.athleteName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Nivel 14 • Atleta Pro
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeItem.exerciseName || activeItem.issue}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold font-montserrat flex items-center gap-1.5 transition-all shadow-xs"
                  title="Ampliar a pantalla completa"
                >
                  <Maximize2 size={13} />
                  <span>Pantalla Completa</span>
                </button>

                {activeItem.currentWeightKg && (
                  <div className="text-center px-3 py-1 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Carga</span>
                    <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {activeItem.currentWeightKg} kg
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Container con Telestrator */}
            <div className="h-[210px] bg-black rounded-2xl overflow-hidden relative group flex items-center justify-center ring-1 ring-slate-200 dark:ring-zinc-800 shrink-0">
              <video
                ref={videoRef}
                src={activeItem.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`absolute inset-0 w-full h-full ${
                  isDrawingMode ? 'cursor-crosshair z-20' : 'pointer-events-none z-10'
                }`}
              />

              {/* Toolbar Flotante del Telestrator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-zinc-950/80 backdrop-blur-xl border border-zinc-700/60 rounded-2xl z-30 shadow-2xl">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  title={isPlaying ? 'Congelar Pantalla' : 'Reproducir'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>

                <div className="w-[1px] h-4 bg-zinc-700 mx-0.5" />

                <button
                  onClick={() => {
                    setPenColor('#ef4444');
                    setIsDrawingMode(true);
                    if (isPlaying && videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                    isDrawingMode && penColor === '#ef4444'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-rose-400 hover:bg-zinc-700'
                  }`}
                  title="Lápiz Corrector (Rojo)"
                >
                  <PenTool size={14} />
                </button>

                <button
                  onClick={() => {
                    setPenColor('#10b981');
                    setIsDrawingMode(true);
                    if (isPlaying && videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${
                    isDrawingMode && penColor === '#10b981'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700'
                  }`}
                  title="Lápiz Postura Correcta (Verde)"
                >
                  <PenTool size={14} />
                </button>

                <button
                  onClick={clearCanvas}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Borrar Trazos"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Kinematic Badge */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 text-white flex items-center gap-1.5 pointer-events-none z-30">
                <Activity size={11} className="text-emerald-400" />
                <span className="text-[9px] font-mono tracking-wider font-bold">KINEMATICS: 94% ROM OPTIMAL</span>
              </div>
            </div>

            {/* SECCIÓN 1: FEEDBACK DE AUDIO (GRABACIÓN & REPRODUCTOR) */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Mic size={12} className="text-indigo-500" /> Feedback de Audio (Voice-Over)
              </span>

              {recordedAudioUrl ? (
                <div className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-zinc-900 border border-indigo-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Headphones size={14} />
                    </div>
                    <audio src={recordedAudioUrl} controls className="h-7 max-w-[200px] w-full" />
                  </div>
                  <button
                    onClick={handleDeleteAudio}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all shrink-0"
                    title="Eliminar audio y regrabar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRecordToggle}
                  className={`w-full relative overflow-hidden flex items-center justify-center gap-2 py-2.5 rounded-2xl border font-montserrat font-bold text-xs transition-all ${
                    isRecording 
                      ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-rose-500 animate-pulse' 
                      : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <Square size={14} className="fill-current text-rose-500" />
                      <span>Grabando Dictado de Voz... (Toca para Detener)</span>
                    </>
                  ) : (
                    <>
                      <Mic size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Grabar Corrección por Audio</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* SECCIÓN 2: RESPUESTA ESCRITA DEL CHAT & SUGERENCIAS */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MessageSquare size={12} className="text-emerald-500" /> Indicación Escrita para el Chat
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={writtenNote}
                  onChange={(e) => setWrittenNote(e.target.value)}
                  placeholder="Escribe una indicación técnica para el atleta..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:border-indigo-500 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {quickSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setWrittenNote(sug)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* SECCIÓN 3: BOTONES DE DECISIÓN DEL COACH (CLAROS Y VISIBLES) */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 shrink-0">
              <button
                onClick={(e) => handleAdjust(activeItem.id, e)}
                className="py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-montserrat font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <AlertTriangle size={14} />
                <span>Ajustar Carga (-5 kg)</span>
              </button>

              <button
                onClick={(e) => handleApprove(activeItem.id, e)}
                className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <CheckCircle2 size={14} />
                <span>Aprobar Técnica (+25 XP)</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <User size={36} className="text-slate-300 dark:text-zinc-700 mb-2" />
            <p className="text-xs font-bold">Selecciona un video para auditar</p>
          </div>
        )}
      </div>

    </div>
  );
};

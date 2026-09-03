import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Check, X, ShieldCheck, Play, Pause, Mic, Square, RotateCcw, PenTool, CheckCircle2, ChevronRight, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useValidationsStore, type ValidationTask } from '../../stores/coach/useValidationsStore';

interface ValidationTinderPanelProps {
  onComplete?: () => void;
}

export default function ValidationTinderPanel({ onComplete }: ValidationTinderPanelProps) {
  const { queue: alerts, approveTask, rejectTask, getPendingCount } = useValidationsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Desktop State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Framer Motion controllers (Mobile)
  const motionX = useMotionValue(0);
  const rotate = useTransform(motionX, [-200, 200], [-15, 15]);
  const opacity = useTransform(motionX, [-200, 0, 200], [0.8, 1, 0.8]);
  const controls = useAnimation();

  useEffect(() => {
    if (alerts.length === 0 && !isFinished) {
      triggerVictorySequence();
    }
  }, [alerts.length, isFinished]);

  // Drawing Canvas Logic
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext('2d');
      if (renderCtx) {
        renderCtx.strokeStyle = '#ef4444'; // Red for corrections
        renderCtx.lineWidth = 4;
        renderCtx.lineCap = 'round';
        setCtx(renderCtx);
      }
    }
  }, [currentIndex, isDrawingMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !ctx) return;
    e.preventDefault();
    setIsDrawing(true);
    
    // Pause video when drawing starts to ensure freeze frame
    if (isPlaying) togglePlay();

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

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        // Clear drawing when resuming play
        clearCanvas();
        setIsDrawingMode(false);
      }
      setIsPlaying(!isPlaying);
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

        mediaRecorder.start();
        setIsRecording(true);
        // Pause video to focus on giving feedback on the freeze frame
        if (isPlaying) togglePlay();
      } catch (err) {
        toast.error("Permiso de micrófono denegado.");
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }
    }
  };

  const handleReject = async (alert: ValidationTask) => {
    let audioBlob;
    if (audioChunksRef.current.length > 0) {
      audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    }
    const canvasData = canvasRef.current?.toDataURL('image/png');
    
    rejectTask(alert.id, audioBlob, canvasData);
    audioChunksRef.current = [];
    clearCanvas();
    setIsDrawingMode(false);
    setIsPlaying(true);
    
    toast('Feedback biomecánico enviado.', {
      icon: '🎙️',
      style: { background: '#09090b', color: '#f43f5e', border: '1px solid #9f1239' }
    });
    nextCard();
  };

  const handleApprove = async (alert: ValidationTask) => {
    approveTask(alert.id);
    audioChunksRef.current = [];
    clearCanvas();
    setIsDrawingMode(false);
    setIsPlaying(true);
    nextCard();
  };

  const triggerVictorySequence = () => {
    setIsFinished(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 800); 
  };

  const nextCard = () => {
    if (alerts.length <= 1) {
      triggerVictorySequence();
    } else {
      motionX.set(0);
    }
  };

  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 80;
    const currentAlert = alerts[0];
    if (!currentAlert) return;

    if (info.offset.x > swipeThreshold) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.15 } });
      handleApprove(currentAlert);
    } else if (info.offset.x < -swipeThreshold) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.15 } });
      handleReject(currentAlert);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } });
    }
  };

  if (isFinished || alerts.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col items-center justify-center font-sans">
        <motion.div
            key="victory"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center text-center"
        >
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-16 h-16 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight font-montserrat">¡Todo al día!</h2>
            <p className="text-emerald-400/80 mt-2 font-bold tracking-widest uppercase text-xs">No tienes videos pendientes por revisar</p>
        </motion.div>
      </div>
    );
  }

  const currentAlert = alerts[0];
  const nextAlert = alerts[1];

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* ─── DESKTOP SPLIT VIEW (Estación Biomecánica) ─── */}
      <div className="hidden md:flex w-full h-full">
        {/* Panel Izquierdo: Cuarto Oscuro / Video Analyzer */}
        <div className="flex-1 bg-black relative flex flex-col border-r border-zinc-900">
          
          <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
             <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-md">
                Modo Revisión
             </div>
             <span className="text-zinc-500 text-sm font-bold">{getPendingCount()} pendientes</span>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-12">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-zinc-800 shadow-2xl max-w-4xl w-full aspect-video bg-zinc-950">
              <video 
                ref={videoRef}
                src={currentAlert.video_url} 
                autoPlay 
                loop 
                muted 
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Canvas Overlay for Freehand Drawing */}
              <canvas
                ref={canvasRef}
                width={800} // Set dynamically based on container in a real implementation
                height={450}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`absolute inset-0 w-full h-full ${isDrawingMode ? 'cursor-crosshair z-20' : 'pointer-events-none z-10'}`}
              />

              {/* Toolbar superpuesta (Gestalt de Proximidad) */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl z-30 shadow-2xl">
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  title={isPlaying ? "Congelar Pantalla" : "Reproducir"}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                </button>
                <div className="w-[1px] h-6 bg-zinc-700 mx-1" />
                <button 
                  onClick={() => { setIsDrawingMode(true); if(isPlaying) togglePlay(); }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isDrawingMode ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                  title="Lápiz Corrector"
                >
                  <PenTool size={18} />
                </button>
                <button 
                  onClick={clearCanvas}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Borrar Trazos"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Metadatos, Roster y Acciones */}
        <div className="w-[450px] bg-[#0c0c0e] flex flex-col relative">
          
          <div className="p-8 pb-4 border-b border-zinc-900">
            <h1 className="text-3xl font-black font-montserrat text-white tracking-tight mb-2">
              {currentAlert.client_name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold font-montserrat">{currentAlert.exercise_name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <span className="text-zinc-400 font-bold">{currentAlert.weight_kg} kg</span>
            </div>
          </div>

          <div className="p-8 flex-1 overflow-y-auto">
            <div className="mb-8">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Reporte Algorítmico</h4>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-300 leading-relaxed font-lato">
                  {currentAlert.message}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Feedback Biomecánico (Voice-Over)</h4>
              
              <button
                onClick={handleRecordToggle}
                className={`w-full relative overflow-hidden flex items-center justify-center gap-3 py-6 rounded-2xl border transition-all ${
                  isRecording 
                    ? 'bg-rose-500/10 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-rose-500' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                {isRecording ? (
                  <>
                    {/* Animación de onda de audio simulada */}
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-rose-500/5"
                    />
                    <Square size={20} className="fill-current" />
                    <span className="font-bold tracking-widest uppercase text-sm z-10">Grabando Dictado...</span>
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    <span className="font-bold tracking-widest uppercase text-sm">Dictar Corrección</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-8 border-t border-zinc-900 bg-zinc-950/50">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleReject(currentAlert)}
                className="py-4 rounded-xl font-black uppercase tracking-widest text-sm flex justify-center items-center gap-2 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              >
                <X size={18} /> Rechazar
              </button>
              <button 
                onClick={() => handleApprove(currentAlert)}
                className="py-4 rounded-xl font-black uppercase tracking-widest text-sm flex justify-center items-center gap-2 text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors"
              >
                <Check size={18} /> Aprobar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MOBILE SWIPE VIEW (Tinder Card) ─── */}
      <div className="md:hidden flex-1 flex flex-col items-center justify-center relative w-full h-full">
         <div className="absolute top-8 w-full px-6 flex justify-between items-center z-50">
            <h1 className="text-xl font-black text-white font-montserrat">Triage</h1>
            <span className="text-zinc-500 font-bold text-sm">{getPendingCount()} pending</span>
         </div>
         <div className="relative w-full max-w-[400px] h-[70vh] max-h-[600px] px-6">
            {alerts.slice(0, 2).map((alert, idx) => {
              const isCurrent = idx === 0;
              let borderColor = 'border-emerald-500/50';
              let accentColor = 'text-emerald-500';
              let bgColor = 'bg-emerald-500/10';
              
              if (alert.priority === 'P1') {
                borderColor = 'border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.15)]';
                accentColor = 'text-rose-500';
                bgColor = 'bg-rose-500/10';
              } else if (alert.priority === 'P2') {
                borderColor = 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.1)]';
                accentColor = 'text-amber-500';
                bgColor = 'bg-amber-500/10';
              }

              return (
                <motion.div
                  key={alert.id}
                  drag={isCurrent ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={isCurrent ? handleDragEnd : undefined}
                  animate={isCurrent ? controls : undefined}
                  style={isCurrent ? { x: motionX, rotate, opacity } : { scale: 0.95, y: 20, zIndex: -1 }}
                  whileDrag={isCurrent ? { scale: 1.02, cursor: 'grabbing' } : undefined}
                  className={`absolute inset-0 border-2 rounded-[2rem] overflow-hidden bg-black flex flex-col ${borderColor} ${isCurrent ? 'z-10 cursor-grab' : 'opacity-40 pointer-events-none'}`}
                >
                  <div className="absolute top-0 left-0 w-full p-4 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                    <div className={`px-3 py-1 rounded-full text-xs font-black tracking-widest ${bgColor} ${accentColor} border ${borderColor} backdrop-blur-md`}>
                      {alert.priority}
                    </div>
                    <div className="text-right">
                      <h3 className="text-white font-black font-montserrat tracking-tight text-lg drop-shadow-md">{alert.client_name}</h3>
                      <p className="text-zinc-300 font-bold text-xs drop-shadow-md">{alert.exercise_name} • {alert.weight_kg}kg</p>
                    </div>
                  </div>

                  <div className="relative flex-1 bg-zinc-900 w-full pointer-events-none">
                    <video 
                      src={alert.video_url} 
                      autoPlay={isCurrent}
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
                    {alert.priority !== 'P3' && (
                      <div className="flex items-start gap-3 mb-4">
                        <ShieldAlert className={`w-5 h-5 mt-0.5 shrink-0 ${accentColor}`} />
                        <p className="text-sm text-zinc-200 font-medium leading-snug">
                          {alert.message}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase mt-2">
                      <span className="flex items-center gap-1"><X size={12}/> Rechazar</span>
                      {alert.priority === 'P3' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(isCurrent) handleApprove(alert); }}
                          className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full flex items-center gap-2 hover:bg-emerald-500/30 transition-colors pointer-events-auto cursor-pointer"
                        >
                          <Check size={14}/> Aprobar Rápido
                        </button>
                      )}
                      <span className="flex items-center gap-1">Aprobar <Check size={12}/></span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
         </div>
      </div>
    </div>
  );
}

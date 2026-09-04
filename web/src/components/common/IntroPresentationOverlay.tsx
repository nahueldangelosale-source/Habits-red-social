import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroPresentationOverlayProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const IntroPresentationOverlay: React.FC<IntroPresentationOverlayProps> = ({ 
  onComplete,
  forceShow = false
}) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (forceShow) return true;
    if (typeof window === 'undefined') return false;
    // Se muestra en cada carga fresca de sesión de navegador
    return !sessionStorage.getItem('habits_intro_presentation_v2');
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('habits_intro_presentation_v2', 'true');
    } catch {}
    onComplete?.();
  };

  useEffect(() => {
    if (!isVisible) return;

    // Acelerar video para que sea una bienvenida ágil sin esperas largas
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.6;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[IntroPresentation] Autoplay muted notice:', err);
        });
      }
    }

    // Timer de seguridad: máximo 8 segundos de presentación
    const timeout = setTimeout(() => {
      handleDismiss();
    }, 8500);

    return () => clearTimeout(timeout);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="habits-intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100000] bg-black flex flex-col justify-between p-5 md:p-10 select-none overflow-hidden"
          style={{ width: '100vw', height: '100dvh' }}
        >
          {/* Video de Presentación Acelerado en Fondo */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleDismiss}
            onError={handleDismiss}
            className="absolute inset-0 w-full h-full object-cover"
            src="/intro-habits.mp4"
          />

          {/* Capa de atmósfera y viñeta cinematográfica */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/75 pointer-events-none" />

          {/* Header Superior con Branding y Botón Saltar */}
          <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md p-1.5 border border-white/20 shadow-xl flex items-center justify-center">
                <img
                  src="/logo-habits-transparent.png"
                  alt="Habits"
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-2xl text-white tracking-tight flex items-baseline leading-none">
                  Habits
                  <span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 text-3xl ml-0.5 font-black">
                    .
                  </span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-widest text-white/80 mt-0.5">
                  Tu Red Social Saludable
                </span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="py-2 px-4 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/20 text-white text-xs font-bold font-montserrat tracking-wide transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <span>Saltar</span>
              <span className="opacity-70">✕</span>
            </button>
          </div>

          {/* Footer Inferior con CTA Principal de Entrada Instantánea */}
          <div className="relative z-10 w-full max-w-md mx-auto text-center flex flex-col items-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-1.5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-mono uppercase tracking-widest font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Ecosistema de Bienestar & Salud</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-montserrat tracking-tight text-white drop-shadow-md">
                Tu Plataforma Integral
              </h1>
            </motion.div>

            <button
              onClick={handleDismiss}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600 hover:from-amber-300 hover:to-indigo-500 text-white font-montserrat font-black text-sm tracking-wide shadow-[0_8px_32px_rgba(244,63,94,0.4)] transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Ingresar a la Plataforma</span>
              <span className="text-base">→</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

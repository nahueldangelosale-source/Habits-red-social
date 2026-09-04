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
    // Se muestra en cada sesión fresca de navegador
    return !sessionStorage.getItem('habits_intro_presentation_v4');
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('habits_intro_presentation_v4', 'true');
    } catch {}
    onComplete?.();
  };

  useEffect(() => {
    if (!isVisible) return;

    // Reproducción a velocidad normal tal como fue creado el video
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[IntroPresentation] Autoplay notice:', err);
        });
      }
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="habits-intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100000] bg-white flex items-center justify-center select-none overflow-hidden"
          style={{ width: '100vw', height: '100dvh' }}
        >
          {/* Video de Presentación a Pantalla Completa en Color 100% Original */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleDismiss}
            onError={handleDismiss}
            className="w-full h-full object-cover"
            src="/intro-habits.mp4"
          />

          {/* Botón Exclusivo "Saltar Intro" — Estética Simple y Premium */}
          <button
            onClick={handleDismiss}
            type="button"
            className="fixed top-5 right-5 z-20 py-2 px-4 rounded-full bg-slate-900/80 hover:bg-slate-900 active:scale-95 backdrop-blur-md border border-white/20 text-white text-xs font-semibold font-montserrat tracking-wide transition-all cursor-pointer shadow-lg flex items-center gap-1.5"
            aria-label="Saltar Intro"
          >
            <span>Saltar Intro</span>
            <span className="opacity-60 text-xs">✕</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


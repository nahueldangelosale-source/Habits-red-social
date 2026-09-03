import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Eye, EyeOff, Share2, Sparkles, Calendar, 
  TrendingUp, Dumbbell, Flame, CheckCircle2, ChevronRight, SlidersHorizontal, Layers 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AestheticStoryStudio } from './AestheticStoryStudio';

interface VisualComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBeforePhoto?: string;
  initialAfterPhoto?: string;
  daysPassed?: number;
}

export const VisualComparisonModal: React.FC<VisualComparisonModalProps> = ({
  isOpen,
  onClose,
  initialBeforePhoto = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  initialAfterPhoto = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
  daysPassed = 30
}) => {
  const [viewMode, setViewMode] = useState<'SLIDER' | 'SIDE_BY_SIDE'>('SLIDER');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState<'FRONT' | 'SIDE' | 'BACK'>('FRONT');
  const [isShareOpen, setIsShareOpen] = useState(false);

  if (!isOpen) return null;

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Camera size={20} />
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Comparativa de Progreso Visual
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar size={12} className="text-indigo-500" />
                  <span>Día 1 vs Día {daysPassed} (Evolución Real)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                title={isPrivacyMode ? 'Revelar Fotos' : 'Modo Privacidad (Desenfoque)'}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {isPrivacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Controls Bar: Angle & Mode */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/20 flex items-center justify-between gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('SLIDER')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'SLIDER'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SlidersHorizontal size={12} />
                <span>Deslizar</span>
              </button>

              <button
                onClick={() => setViewMode('SIDE_BY_SIDE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'SIDE_BY_SIDE'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers size={12} />
                <span>Lado a Lado</span>
              </button>
            </div>

            {/* Angle Select */}
            <div className="flex items-center gap-1">
              {[
                { id: 'FRONT', label: 'Frente' },
                { id: 'SIDE', label: 'Perfil' },
                { id: 'BACK', label: 'Espalda' }
              ].map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setSelectedAngle(ang.id as any)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedAngle === ang.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {ang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Image Display */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {viewMode === 'SLIDER' ? (
              <div
                onMouseMove={handleSliderMove}
                onTouchMove={handleSliderMove}
                className="aspect-[3/4] w-full max-w-[320px] mx-auto rounded-3xl overflow-hidden relative select-none cursor-ew-resize border-2 border-slate-200 dark:border-slate-800 shadow-lg shadow-indigo-500/5 bg-slate-900"
              >
                {/* After Image (Background) */}
                <img
                  src={initialAfterPhoto}
                  alt="Día Actual"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: isPrivacyMode ? 'blur(16px)' : 'none' }}
                />
                <span className="absolute bottom-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600/90 text-white backdrop-blur-sm z-10">
                  Día {daysPassed} (Hoy)
                </span>

                {/* Before Image (Clipped Foreground) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={initialBeforePhoto}
                    alt="Punto de Partida"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ 
                      width: '320px', 
                      height: '100%', 
                      filter: isPrivacyMode ? 'blur(16px)' : 'none' 
                    }}
                  />
                  <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-600/90 text-white backdrop-blur-sm z-10 whitespace-nowrap">
                    Día 1 (Inicio)
                  </span>
                </div>

                {/* Split Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20 flex items-center justify-center -ml-0.5"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="w-7 h-7 rounded-full bg-white text-indigo-600 shadow-md flex items-center justify-center text-xs font-black">
                    ↔
                  </div>
                </div>
              </div>
            ) : (
              /* Side by Side Mode */
              <div className="grid grid-cols-2 gap-3 max-w-[340px] mx-auto">
                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                    Día 1 (Punto de Partida)
                  </span>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 relative">
                    <img
                      src={initialBeforePhoto}
                      alt="Día 1"
                      className="w-full h-full object-cover"
                      style={{ filter: isPrivacyMode ? 'blur(16px)' : 'none' }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-center">
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    Día {daysPassed} (Actual)
                  </span>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 relative">
                    <img
                      src={initialAfterPhoto}
                      alt="Día Actual"
                      className="w-full h-full object-cover"
                      style={{ filter: isPrivacyMode ? 'blur(16px)' : 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Metrics & Transformation Summary */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tiempo</p>
                <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white mt-0.5">
                  {daysPassed} Días
                </h5>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sesiones</p>
                <h5 className="text-xs font-black font-montserrat text-emerald-500 mt-0.5">
                  24 Hechas
                </h5>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Constancia</p>
                <h5 className="text-xs font-black font-montserrat text-amber-500 mt-0.5">
                  92% Adh.
                </h5>
              </div>
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => setIsShareOpen(true)}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Share2 size={14} />
              <span>Compartir en Stories</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Continuar Entrenando</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stories Generator Studio */}
      <AestheticStoryStudio
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        initialCategory="STREAK"
      />
    </AnimatePresence>
  );
};

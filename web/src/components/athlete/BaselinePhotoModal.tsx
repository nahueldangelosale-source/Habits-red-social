import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Sun, Smartphone, UserCheck, ShieldCheck, 
  Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Trophy, Upload, Flame, Calendar, Bell, User 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { VisualComparisonModal } from './VisualComparisonModal';

interface BaselinePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSaved?: (photoUrl: string) => void;
}

export const BaselinePhotoModal: React.FC<BaselinePhotoModalProps> = ({
  isOpen,
  onClose,
  onPhotoSaved
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAngle, setSelectedAngle] = useState<'FRONT' | 'SIDE' | 'BACK'>('FRONT');
  const [photoFront, setPhotoFront] = useState<string | null>(null);
  const [photoSide, setPhotoSide] = useState<string | null>(null);
  const [photoBack, setPhotoBack] = useState<string | null>(null);
  const [reminderDays, setReminderDays] = useState<15 | 20 | 30>(30);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const { awardXP } = useGamificationStore();

  if (!isOpen) return null;

  const handleSimulateCapture = () => {
    const demoPhotos = {
      FRONT: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80',
      SIDE: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&q=80',
      BACK: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80'
    };

    if (selectedAngle === 'FRONT') setPhotoFront(demoPhotos.FRONT);
    if (selectedAngle === 'SIDE') setPhotoSide(demoPhotos.SIDE);
    if (selectedAngle === 'BACK') setPhotoBack(demoPhotos.BACK);

    toast.success('¡Foto capturada con éxito!', { icon: '📸' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (selectedAngle === 'FRONT') setPhotoFront(result);
        if (selectedAngle === 'SIDE') setPhotoSide(result);
        if (selectedAngle === 'BACK') setPhotoBack(result);
        toast.success('¡Foto cargada!', { icon: '📸' });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTargetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleFinish = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + reminderDays);

    localStorage.setItem('athlete-baseline-photo-completed', 'true');
    localStorage.setItem('athlete-baseline-photo-front', photoFront || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80');
    if (photoSide) localStorage.setItem('athlete-baseline-photo-side', photoSide);
    if (photoBack) localStorage.setItem('athlete-baseline-photo-back', photoBack);
    localStorage.setItem('athlete-baseline-photo-date', new Date().toISOString());
    localStorage.setItem('athlete-next-photo-days', String(reminderDays));
    localStorage.setItem('athlete-next-photo-target-date', targetDate.toISOString());

    try {
      awardXP('habit', 100);
      window.dispatchEvent(new CustomEvent('earn-xp', { detail: { amount: 100, source: 'Foto Baseline' } }));
    } catch (e) {
      // safe fallback
    }

    toast.success('🎉 ¡+100 XP Ganados! Foto guardada en tu Galería de Perfil.', {
      style: { background: '#18181b', color: '#10b981', border: '1px solid #059669' }
    });

    if (onPhotoSaved && photoFront) {
      onPhotoSaved(photoFront);
    }

    setStep(3);
  };

  const handleSelectDays = (days: 15 | 20 | 30) => {
    setReminderDays(days);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    localStorage.setItem('athlete-next-photo-days', String(days));
    localStorage.setItem('athlete-next-photo-target-date', targetDate.toISOString());
    toast.success(`Recordatorio fijado para el ${calculateTargetDate(days)}`, { icon: '📅' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-md bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Camera size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Foto de Punto de Partida
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>Recompensa: <strong>+100 XP</strong></span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="text-center space-y-1.5">
                  <span className="text-3xl">📸</span>
                  <h4 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    4 Consejos Fáciles para tu Foto
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    No importa tu estado actual, es solo para comparar tu transformación en 30 días.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Sun size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">1. Buena Iluminación</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Párate frente a una ventana o foco de luz claro. Evita contraluces.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">2. Celular a la Altura del Pecho</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Apoya el móvil en una repisa o sácate la foto frente a un espejo de cuerpo entero.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">3. Postura Natural</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Párate relajado/a, respira normal sin esconder ni forzar la postura.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">4. 100% Privado y Seguro</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">Solo tú y tu entrenador tienen acceso a tus fotos de progreso.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {/* Selector de Ángulos */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'FRONT', label: 'Frente', photo: photoFront },
                    { key: 'SIDE', label: 'Perfil', photo: photoSide },
                    { key: 'BACK', label: 'Espalda', photo: photoBack }
                  ].map((angle) => (
                    <button
                      key={angle.key}
                      onClick={() => setSelectedAngle(angle.key as any)}
                      className={`p-2.5 rounded-2xl border text-xs font-bold transition-all text-center relative ${
                        selectedAngle === angle.key
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{angle.label}</span>
                      {angle.photo && (
                        <CheckCircle2 size={12} className="absolute top-1.5 right-1.5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Vista Previa de la Foto */}
                <div className="aspect-[3/4] w-full max-w-[240px] mx-auto rounded-3xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-4 text-center overflow-hidden relative group">
                  {(selectedAngle === 'FRONT' && photoFront) ||
                  (selectedAngle === 'SIDE' && photoSide) ||
                  (selectedAngle === 'BACK' && photoBack) ? (
                    <div className="relative w-full h-full">
                      <img
                        src={
                          selectedAngle === 'FRONT' ? photoFront! :
                          selectedAngle === 'SIDE' ? photoSide! : photoBack!
                        }
                        alt="Punto de partida"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                        <span className="text-white text-xs font-bold">Cambiar Foto</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                        <Camera size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Foto de {selectedAngle === 'FRONT' ? 'Frente' : selectedAngle === 'SIDE' ? 'Perfil' : 'Espalda'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Toca abajo para capturar o subir desde tu galería
                      </p>
                    </div>
                  )}
                </div>

                {/* Acciones de Carga */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={handleSimulateCapture}
                    className="py-3 px-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Camera size={14} />
                    <span>Usar Cámara / Demo</span>
                  </button>

                  <label className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95">
                    <Upload size={14} />
                    <span>Subir de Galería</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-2 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 text-3xl">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    ¡Paso Inicial Completado!
                  </span>
                  <h4 className="text-xl font-black font-montserrat text-slate-900 dark:text-white mt-1.5">
                    ¡Punto de Partida Establecido!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-0.5">
                    Has ganado <strong>+100 XP</strong>. Tu foto está guardada de forma segura.
                  </p>
                </div>

                {/* Pedagogical Notice: Photo is now in Profile Menu */}
                <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <User size={15} />
                    <span>¿Dónde ver tu foto a partir de ahora?</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Esta tarjeta desaparecerá del inicio para mantener tu pantalla limpia. Podrás ver tus fotos y comparativas en cualquier momento desde tu <strong>Menú de Perfil (arriba a la izquierda)</strong> en <strong>Galería de Progreso</strong>.
                  </p>
                </div>

                {/* Agendamiento Automático para la Próxima Foto */}
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 text-left space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-indigo-600 dark:text-indigo-400" />
                      <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                        ¿Cuándo quieres tu próximo recordatorio?
                      </h5>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <Bell size={11} /> Auto
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Te recordaremos sacarte la misma foto para comparar tu evolución:
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { days: 15, label: '⚡ 15 Días', badge: 'Rápido' },
                      { days: 20, label: '🎯 20 Días', badge: 'Medio' },
                      { days: 30, label: '🏆 30 Días', badge: 'Recomendado' }
                    ].map((opt) => (
                      <button
                        key={opt.days}
                        onClick={() => handleSelectDays(opt.days as any)}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          reminderDays === opt.days
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        <span className="text-xs font-black block">{opt.label}</span>
                        <span className={`text-[9px] block mt-0.5 ${
                          reminderDays === opt.days ? 'text-indigo-200' : 'text-slate-400'
                        }`}>
                          {calculateTargetDate(opt.days)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botón para ver comparativa de muestra */}
                <button
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Ver Demo del Comparador Antes / Después</span>
                  <ArrowRight size={13} />
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 shrink-0">
            {step === 1 && (
              <>
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2"
                >
                  Hacerlo más tarde
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Continuar a la Foto</span>
                  <ArrowRight size={14} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Consejos</span>
                </button>

                <button
                  onClick={handleFinish}
                  disabled={!photoFront && !photoSide && !photoBack}
                  className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Guardar & Ganar +100 XP</span>
                  <Sparkles size={14} />
                </button>
              </>
            )}

            {step === 3 && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>¡Volver al Inicio y Entrenar! 🚀</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal de Comparativa Visual */}
      <VisualComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        daysPassed={reminderDays}
      />
    </AnimatePresence>
  );
};

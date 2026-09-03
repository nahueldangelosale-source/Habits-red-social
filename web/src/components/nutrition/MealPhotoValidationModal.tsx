import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Camera, 
  Upload, 
  Check, 
  Sparkles, 
  Lightbulb, 
  Info, 
  Maximize2, 
  Compass, 
  Sun, 
  Utensils, 
  Send,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCoachCommunicationStore } from '../../stores/useCoachCommunicationStore';
import { useCoachStore } from '../../stores/useCoachStore';

interface MealPhotoValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealId: string;
  mealType: string;
  mealName: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  onConfirmCheckIn?: () => void;
}

export const MealPhotoValidationModal: React.FC<MealPhotoValidationModalProps> = ({
  isOpen,
  onClose,
  mealId,
  mealType,
  mealName,
  calories,
  macros,
  onConfirmCheckIn
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [athleteNote, setAthleteNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { assignedCoach } = useCoachStore();
  const { sendAthleteMessage } = useCoachCommunicationStore();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendPhoto = () => {
    setIsSubmitting(true);
    
    // Simulate sending to coach communication store
    const messageText = `📸 Foto de control de ingesta: ${mealType} (${mealName}, ${calories} kcal)${athleteNote ? ` - Nota: "${athleteNote}"` : ''}`;
    sendAthleteMessage(messageText, 'text', 'foto');

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        assignedCoach 
          ? `¡Foto enviada a tu Coach ${assignedCoach.name}! Ingesta validada.`
          : '¡Foto registrada con éxito en tu bitácora nutricional!',
        { icon: '📸', duration: 4000 }
      );

      if (onConfirmCheckIn) {
        onConfirmCheckIn();
      }

      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      onClose();
    }, 600);
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Header (shrink-0) */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:bg-zinc-900/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
                📸
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                  <span>Validación de Plato</span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    Control Visual
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {mealType} • {assignedCoach ? `Enviar a Coach ${assignedCoach.name}` : 'Registro con Validación de Porciones'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body (scrollable) */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-left min-h-0">
            
            {/* Guía Pedagógica: Cómo sacar la foto para que el coach valide tus porciones */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/10 space-y-2.5">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500 shrink-0" />
                <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white uppercase tracking-wider">
                  ¿Cómo sacar la foto perfecta?
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Compass size={13} className="text-indigo-500" />
                    <span>1. Foto Cenital (90°)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                    Saca la foto directamente desde arriba para medir el diámetro y volumen.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Sun size={13} className="text-amber-500" />
                    <span>2. Buena Luz</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                    Luz clara sin sombras de tu mano o del celular sobre la comida.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Maximize2 size={13} className="text-emerald-500" />
                    <span>3. Encuadre Total</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                    Incluye todo el plato, aderezos o bebida que consumas.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Utensils size={13} className="text-purple-500" />
                    <span>4. Referencia</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                    Deja los cubiertos al lado del plato como escala de tamaño.
                  </p>
                </div>
              </div>
            </div>

            {/* Zona de Captura / Carga de Foto */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileChange}
            />

            {!photoPreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 text-center cursor-pointer transition-all space-y-3 group"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <Camera size={28} />
                </div>
                <div>
                  <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                    Tocar para Abrir Cámara o Galería
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Formatos JPG, PNG o captura directa desde tu teléfono
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Camera size={14} />
                  <span>Tomar Foto del Plato</span>
                </button>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm bg-black group">
                <img 
                  src={photoPreview} 
                  alt="Plato capturado" 
                  className="w-full max-h-56 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold hover:bg-black/80 flex items-center gap-1 transition-all"
                    title="Cambiar foto"
                  >
                    <RefreshCw size={12} />
                    <span>Cambiar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="p-2 rounded-xl bg-rose-600/80 backdrop-blur-md text-white text-xs font-bold hover:bg-rose-700 transition-all"
                    title="Eliminar foto"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center justify-between">
                  <span>✓ Foto lista para validar</span>
                  <span className="text-emerald-400 font-mono">{calories} kcal</span>
                </div>
              </div>
            )}

            {/* Resumen del Plato */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Ingesta Registrada
                </span>
                <p className="text-xs font-black font-montserrat text-slate-900 dark:text-white truncate">
                  {mealName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-800 dark:text-zinc-200 font-mono block">
                  {calories} kcal
                </span>
                <div className="flex items-center gap-1.5 text-[9px] font-bold mt-0.5">
                  <span className="text-blue-500">{macros.protein}g P</span>
                  <span className="text-amber-500">{macros.carbs}g C</span>
                  <span className="text-rose-500">{macros.fats}g G</span>
                </div>
              </div>
            </div>

            {/* Campo Opcional de Notas para el Coach */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black font-montserrat text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                <span>Nota u observación para tu Coach (Opcional):</span>
              </label>
              <textarea
                value={athleteNote}
                onChange={e => setAthleteNote(e.target.value)}
                placeholder="Ej: No terminé todo el arroz / cambié el aceite por semillas / comí con mucha hambre..."
                rows={2}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Footer CTA (shrink-0) */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70 shrink-0">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              onClick={handleSendPhoto}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Enviando...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>Enviar Foto y Registrar Ingesta</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

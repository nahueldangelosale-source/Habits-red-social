import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Folder, FileText, Dumbbell, Salad, 
  Share2, Users, ArrowRight, ArrowLeft, CheckCircle2, 
  Copy, Layers, Rocket, ShieldCheck, BookOpen, Apple, ChefHat, X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LibraryWelcomeWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LibraryWelcomeWizardModal: React.FC<LibraryWelcomeWizardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [slide, setSlide] = useState<1 | 2 | 3>(1);

  if (!isOpen) return null;

  const handleFinish = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignorar si confetti falla
    }
    localStorage.setItem('library_welcome_wizard_seen', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white/95 dark:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[90vh] relative"
        >
          {/* Specular Top Rim Light */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

          {/* Header con Indicador de Pasos */}
          <div className="p-5 pb-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={13} /> Guía Rápida • Biblioteca de Recursos
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400">
                  Paso {slide} de 3
                </span>
                <button 
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 h-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    slide >= i 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xs' 
                      : 'bg-slate-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Contenido Dinámico por Diapositiva */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* SLIDE 1: ESTRUCTURA Y ORDEN DE BASE */}
            {slide === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mx-auto mb-2 shadow-xs">
                    📁
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Todo tu Conocimiento en un Solo Lugar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Centralizá tus metodologías para reutilizarlas en segundos con cualquier cliente:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="p-3 bg-slate-50/80 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-2xl space-y-1">
                    <span className="text-base">🏋️‍♂️</span>
                    <h4 className="font-bold text-slate-800 dark:text-white">Entrenamientos</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">Mesociclos, bloques de fuerza, hipertrofia y biseries.</p>
                  </div>
                  <div className="p-3 bg-slate-50/80 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-2xl space-y-1">
                    <span className="text-base">🥗</span>
                    <h4 className="font-bold text-slate-800 dark:text-white">Nutrición & Dietas</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">Pautas de 1 a 8 ingestas, déficit, normo y superávit.</p>
                  </div>
                  <div className="p-3 bg-slate-50/80 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-2xl space-y-1">
                    <span className="text-base">🍳</span>
                    <h4 className="font-bold text-slate-800 dark:text-white">Recetarios Saludables</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">Fichas con macros, porciones, ingredientes y fotos.</p>
                  </div>
                  <div className="p-3 bg-slate-50/80 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded-2xl space-y-1">
                    <span className="text-base">📄</span>
                    <h4 className="font-bold text-slate-800 dark:text-white">Documentos & PDFs</h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-tight">Guías de hábitos, suplementación y enlaces a Drive.</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Te preparamos carpetas con iconos temáticos para empezar 100% ordenado.</span>
                </div>
              </motion.div>
            )}

            {/* SLIDE 2: ASIGNACIÓN SEGURA (SMART FORK) */}
            {slide === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mx-auto mb-2 shadow-xs">
                    🛡️
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Asignación Segura (Smart Fork)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Tu plantilla maestra nunca se altera cuando la personalizás para un cliente:
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-black text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Tu Plantilla Maestra</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Permanece protegida en tu biblioteca como tu activo principal.</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200/70 dark:bg-zinc-800 my-1" />

                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">Copia Dedicada al Alumno</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Se clona a su perfil. Si le cambiás un ejercicio por lesión, tu original no sufre ningún cambio.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Inmutabilidad garantizada para trabajar rápido sin miedo a desconfigurar tus programas.</span>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3: COLABORACIÓN ENTRE COLEGAS */}
            {slide === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl mx-auto mb-2 shadow-xs">
                  🤝
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    Compartí e Importá con Colegas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                    Potenciá tu trabajo colaborando con otros profesionales del bienestar:
                  </p>
                </div>

                <div className="bg-slate-50/90 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-4 rounded-2xl text-left space-y-3 text-xs">
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-zinc-300">
                    <Copy size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Generá un Código Copiable:</strong> Compartí cualquier rutina o recetario con un link o código de 6 caracteres.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-slate-700 dark:text-zinc-300">
                    <Users size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Importación en 1 Toque:</strong> Tu colega pega el código y el recurso se aloja automáticamente en su carpeta de compartidos.</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 dark:from-indigo-950/30 dark:to-amber-950/30 border border-purple-200/60 dark:border-purple-800/40 text-xs text-slate-600 dark:text-zinc-300">
                  ✨ <em>"El orden en tu biblioteca es la base para escalar tu tiempo y atender más clientes."</em>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Navigation */}
          <div className="p-5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-between shrink-0">
            {slide > 1 ? (
              <button
                type="button"
                onClick={() => setSlide((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Atrás</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-400 font-bold py-2 px-3"
              >
                Saltar Tour
              </button>
            )}

            {slide < 3 ? (
              <button
                type="button"
                onClick={() => setSlide((prev) => (prev + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <span>Siguiente</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/25 active:scale-95 transition-all"
              >
                <Rocket size={14} />
                <span>¡Comenzar a Organizar!</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

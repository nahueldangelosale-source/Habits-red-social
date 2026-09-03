import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (code: string) => void;
}

export const ImportTemplateModal: React.FC<ImportTemplateModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      toast.success('¡Recurso importado exitosamente en tu carpeta de compartidos!', { icon: '📥' });
      onImportSuccess(code.trim().toUpperCase());
      setCode('');
      onClose();
    }, 700);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl p-6 text-white space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <DownloadCloud size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Importación P2P
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  Importar Recurso de Colega
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Ingresá el código de 6 caracteres que te compartió otro entrenador o colega para clonar su rutina, receta o guía a tu biblioteca.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-400 block mb-1.5">
                Código de Recurso:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EJ: HAB-HYPER-741"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-3 text-center font-mono text-base font-black tracking-widest text-amber-400 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                maxLength={18}
                required
              />
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>El recurso se guardará en tu carpeta <strong>"📥 Recursos Importados de Colegas"</strong>.</span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoading || !code.trim()}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                {isLoading ? (
                  <span>Importando...</span>
                ) : (
                  <>
                    <span>Clonar e Importar a Mi Biblioteca</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-zinc-400 hover:text-white font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

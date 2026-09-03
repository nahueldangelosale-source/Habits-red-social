import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemType?: string;
}

export const ShareTemplateModal: React.FC<ShareTemplateModalProps> = ({
  isOpen,
  onClose,
  itemName,
  itemType = 'Plantilla'
}) => {
  const [copied, setCopied] = useState(false);
  const shareCode = `HAB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    toast.success('Código copiado al portapapeles', { icon: '📋' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola colega! Te comparto mi ${itemType.toLowerCase()} "${itemName}" en Bienestar APP. Podés importarla directamente usando el código: ${shareCode}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
                <Share2 size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Colaboración P2P
                </span>
                <h3 className="text-base font-bold text-white leading-tight">
                  Compartir con Colega
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

          <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase">Recurso a Compartir:</span>
            <p className="text-sm font-black text-white">{itemName}</p>
          </div>

          {/* Código de Importación */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400">
              Código Único de Importación (6 caracteres):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-4 py-2.5 text-center font-mono text-lg font-black tracking-widest text-amber-400">
                {shareCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
            <span>Al importar, el otro colega obtiene una copia independiente. Tu original no se modificará.</span>
          </div>

          {/* Botón WhatsApp */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-emerald-600/20"
            >
              <MessageSquare size={16} />
              <span>Enviar Código por WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs text-zinc-400 hover:text-white font-medium"
            >
              Listo / Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

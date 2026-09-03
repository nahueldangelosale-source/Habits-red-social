import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, X, Clock, Pill } from 'lucide-react';
import { useClinicalStore } from '../../stores/useClinicalStore';

export const NutritionalNudgeWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const activePathologies = useClinicalStore(state => state.activePathologies);

  // Aparece 60 min antes (simulado para el frontend, aquí lo mostramos apenas monta si hay patología)
  useEffect(() => {
    if (activePathologies.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500); // Retardo sutil para no ahogar al usuario al entrar
      return () => clearTimeout(timer);
    }
  }, [activePathologies]);

  if (activePathologies.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 w-80 bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-5 shadow-2xl z-50 overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/30">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-heading font-extrabold text-white mb-1">
                Ventana Anabólica Crítica
              </h4>
              <p className="text-xs text-slate-300 font-lato leading-relaxed mb-3">
                Para acelerar tu rehabilitación tisular, el protocolo de Keith Baar sugiere un estímulo pre-sesión.
              </p>
              
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">T-Minus 60 Minutos</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-xs text-slate-200">15-20g Colágeno Hidrolizado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5 text-orange-300" />
                    <span className="text-xs text-slate-200">50mg Vitamina C (Cofactor)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

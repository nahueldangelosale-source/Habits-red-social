import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutritionStore } from '../../stores/useNutritionStore';
import { MetabolicAnchorSelector, MacrosLoader, EscapeValve, ShadowDataHUD } from './AtomicSmartBlocks';
import { UtensilsCrossed, Send } from 'lucide-react';

export const NutritionSmartBlocks = () => {
  // Suscripción optimizada: solo nos re-renderizamos si el ancla cambia
  const metabolicAnchor = useNutritionStore(state => state.metabolicAnchor);
  const generatePayload = useNutritionStore(state => state.generatePayload);

  const handleSubmit = useCallback(() => {
    const payload = generatePayload();
    console.log('[SHADOW DATA & SMART BLOCKS PAYLOAD]', JSON.stringify(payload, null, 2));
    // Aquí iría el mutate al backend POST /api/v1/nutrition-plans
    alert('Plan inyectado. Revisa la consola para ver el JSON Híbrido.');
  }, [generatePayload]);

  return (
    <div className="min-h-[80vh] bg-[#09090b] rounded-3xl p-8 border border-zinc-800/80 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <UtensilsCrossed className="text-indigo-400" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white font-montserrat tracking-tight">Smart Blocks</h2>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Prescripción Libre de Fricción</p>
        </div>
      </div>

      {/* Cascada Condicional UI */}
      <div className="max-w-xl">
        <MetabolicAnchorSelector />

        {/* Solo desplegamos el resto si se ha seleccionado un ancla (Progressive Disclosure) */}
        <AnimatePresence>
          {metabolicAnchor && (
            <motion.div
              initial={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
              exit={{ opacity: 0, height: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <MacrosLoader />
              <EscapeValve />
              
              {/* Submit Button */}
              <button 
                onClick={handleSubmit}
                className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
              >
                Inyectar Prescripción <Send size={16} />
              </button>

              <ShadowDataHUD />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

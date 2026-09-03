import React, { useState } from 'react';
import { Check, X, AlertTriangle, ArrowRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ReconciliationItem {
  id: string;
  dirtyName: string;
  matchedName: string | null;
  confidenceScore: number;
  muscleGroup: string;
}

interface ReconciliationPreviewProps {
  items: ReconciliationItem[];
  onConfirm: (resolvedItems: ReconciliationItem[]) => void;
  onCancel: () => void;
}

export const ReconciliationPreview: React.FC<ReconciliationPreviewProps> = ({ items, onConfirm, onCancel }) => {
  const [resolved, setResolved] = useState<ReconciliationItem[]>(items);

  const handleApprove = (id: string) => {
    // In a real scenario, this confirms the match
    console.log('Approved', id);
  };

  const handleReject = (id: string) => {
    // In a real scenario, this allows manual override
    console.log('Rejected, needs manual override', id);
  };

  const highConfidence = resolved.filter(i => i.confidenceScore >= 90).length;
  const mediumConfidence = resolved.filter(i => i.confidenceScore >= 70 && i.confidenceScore < 90).length;
  const lowConfidence = resolved.filter(i => i.confidenceScore < 70).length;

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black font-montserrat text-slate-900 mb-2">Revisión Heurística</h2>
        <p className="text-slate-500 font-lato text-sm">
          Nuestro motor ha mapeado tus ejercicios a la base clínica. Revisa los resultados con confianza media o baja.
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <div className="text-emerald-500 font-black text-2xl">{highConfidence}</div>
          <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Alta Confianza</div>
        </div>
        <div className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="text-amber-500 font-black text-2xl">{mediumConfidence}</div>
          <div className="text-amber-700 text-xs font-bold uppercase tracking-wider">Revisión Sugerida</div>
        </div>
        <div className="flex-1 bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <div className="text-rose-500 font-black text-2xl">{lowConfidence}</div>
          <div className="text-rose-700 text-xs font-bold uppercase tracking-wider">Mapeo Manual</div>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <AnimatePresence>
          {resolved.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                item.confidenceScore >= 90 ? 'bg-white border-slate-200' : 
                item.confidenceScore >= 70 ? 'bg-amber-50/50 border-amber-200' : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Tu Excel</span>
                  <span className="font-lato font-medium text-slate-700">"{item.dirtyName}"</span>
                </div>
                
                <ArrowRight className="text-slate-300" size={16} />
                
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-1">Base Clínica</span>
                  <span className="font-bold text-slate-900">{item.matchedName || 'No encontrado'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-8">
                <div className="text-right">
                  <span className={`text-sm font-black ${
                    item.confidenceScore >= 90 ? 'text-emerald-500' : 
                    item.confidenceScore >= 70 ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {item.confidenceScore}%
                  </span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Similitud</span>
                </div>

                {item.confidenceScore < 90 && (
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                    <button onClick={() => handleApprove(item.id)} className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors">
                      <Check size={16} />
                    </button>
                    <button onClick={() => handleReject(item.id)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors">
          Cancelar Importación
        </button>
        <button onClick={() => onConfirm(resolved)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2">
          <Save size={18} /> Confirmar y Desplegar
        </button>
      </div>
    </div>
  );
};

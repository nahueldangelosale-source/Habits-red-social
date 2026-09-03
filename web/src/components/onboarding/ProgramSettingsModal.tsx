import React from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Users, Calendar, Clock, Copy, EyeOff } from 'lucide-react';

interface ProgramSettingsModalProps {
  onClose: () => void;
  programName: string;
}

export const ProgramSettingsModal: React.FC<ProgramSettingsModalProps> = ({ onClose, programName }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col font-sans"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-lg">Configuración Avanzada</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Asignar a */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Asignar a (Destinatario)
            </label>
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de Inicio */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fecha de inicio
              </label>
              <input 
                type="date" 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            {/* Duración */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Duración (Semanas)
              </label>
              <input 
                type="number" 
                defaultValue={4}
                min={1}
                max={52}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input type="checkbox" className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors"></div>
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-slate-400" />
                  Ocultar el programa a mi cliente hasta la fecha de inicio
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  (No tiene ningún efecto si el programa se encuentra en el calendario público).
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all shadow-sm">
            <Copy className="w-4 h-4" /> Duplicar Programa
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

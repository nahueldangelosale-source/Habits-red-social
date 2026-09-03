import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2, HelpCircle, Save, TrendingUp, RefreshCw, Box } from 'lucide-react';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';

interface ProgressionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressionSettingsModal({ isOpen, onClose }: ProgressionSettingsModalProps) {
  const { progressionSettings, setProgressionSettings } = usePlanBuilderStore();
  
  // Local state for the form so we don't dispatch to the store on every keystroke
  const [localSettings, setLocalSettings] = useState(progressionSettings);

  if (!isOpen) return null;

  const handleSave = () => {
    setProgressionSettings(localSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Settings2 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Configuración de Progresión</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-indigo-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* RPE Increment */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    Incremento de Intensidad (RPE)
                  </label>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    +{localSettings.rpeIncrement.toFixed(1)} / Semana
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" max="2" step="0.5"
                  value={localSettings.rpeIncrement}
                  onChange={(e) => setLocalSettings({...localSettings, rpeIncrement: parseFloat(e.target.value)})}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ¿Cuánto aumentará el RPE percibido cada semana? Por defecto es +0.5.
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Volume Increment */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Box className="w-4 h-4 text-emerald-500" />
                    Incremento de Volumen (Series)
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={localSettings.applyToVolume}
                      onChange={(e) => setLocalSettings({...localSettings, applyToVolume: e.target.checked})}
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                
                {localSettings.applyToVolume && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600">Series añadidas</span>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        +{localSettings.volumeIncrement} / Semana
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" max="3" step="1"
                      value={localSettings.volumeIncrement}
                      onChange={(e) => setLocalSettings({...localSettings, volumeIncrement: parseInt(e.target.value)})}
                      className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </motion.div>
                )}
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Si se activa, añade series extra a lo largo de las semanas para acumular volumen.
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Deload Frequency */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-sky-500" />
                    Frecuencia de Descarga (Deload)
                  </label>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    Cada {localSettings.deloadFrequency} Semanas
                  </span>
                </div>
                <input 
                  type="range" 
                  min="2" max="6" step="1"
                  value={localSettings.deloadFrequency}
                  onChange={(e) => setLocalSettings({...localSettings, deloadFrequency: parseInt(e.target.value)})}
                  className="w-full accent-sky-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
                  <span>Alta freq</span>
                  <span>Baja freq</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                  En la semana de descarga, el volumen y la intensidad se reducen a la mitad automáticamente.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

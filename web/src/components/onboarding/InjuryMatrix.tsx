import React from 'react';
import { ShieldAlert, Plus, Trash2, ChevronDown } from 'lucide-react';
import type { Injury } from '../../stores/useOnboardingPTStore';
import { motion, AnimatePresence } from 'framer-motion';

interface InjuryMatrixProps {
  injuries: any[]; // using any to avoid strict type error if we don't edit the store yet, or we assume it accepts dynamic props
  onAdd: (injury: any) => void;
  onUpdate: (id: string, data: Partial<any>) => void;
  onRemove: (id: string) => void;
}

const ZONES = ['Tren Superior', 'Tren Inferior', 'Core / Columna'];

const JOINTS: Record<string, string[]> = {
  'Tren Superior': ['Hombro', 'Codo', 'Muñeca', 'Cervical Alta'],
  'Tren Inferior': ['Cadera', 'Rodilla', 'Tobillo', 'Pie'],
  'Core / Columna': ['Cervical Baja', 'Dorsal', 'Lumbar', 'Pelvis', 'Abdomen']
};

export const InjuryMatrix: React.FC<InjuryMatrixProps> = ({
  injuries,
  onAdd,
  onUpdate,
  onRemove
}) => {
  const handleAdd = () => {
    onAdd({
      id: Math.random().toString(36).substring(7),
      zone: 'Tren Superior',
      joint: 'Hombro',
      painLevel: 2,
      restrictionType: 'LIMITACION_MOVIMIENTO',
      phase: 'AGUDA'
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <span className="text-slate-900 font-bold block mb-1 text-lg">Cuidado de Articulaciones y Molestias</span>
            <p className="text-slate-500 text-sm leading-relaxed max-w-md">Contanos si sentís algún dolor o molestia para que la rutina evite forzar esa zona.</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-sm flex items-center transition-all border border-rose-200 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 mr-1" />
          Añadir Molestia
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {injuries.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
              <p className="text-slate-500 font-medium">No se han registrado lesiones o molestias.</p>
            </motion.div>
          )}

          {injuries.map((injury) => (
            <motion.div
              key={injury.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-5 shadow-sm relative group hover:border-slate-300 transition-colors"
            >
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* ZONA */}
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">¿Parte del cuerpo?</label>
                  <div className="relative">
                    <select
                      value={injury.zone}
                      onChange={(e) => {
                        const newZone = e.target.value;
                        onUpdate(injury.id, { 
                          zone: newZone, 
                          joint: JOINTS[newZone][0] // Reset joint when zone changes
                        });
                      }}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 truncate"
                    >
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* ARTICULACION */}
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">¿Dónde exactamente?</label>
                  <div className="relative">
                    <select
                      value={injury.joint}
                      onChange={(e) => onUpdate(injury.id, { joint: e.target.value })}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 truncate"
                    >
                      {(JOINTS[injury.zone] || []).map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* TIPO RESTRICCION */}
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">¿Qué sentís?</label>
                  <div className="relative">
                    <select
                      value={injury.restrictionType || 'LIMITACION_MOVIMIENTO'}
                      onChange={(e) => onUpdate(injury.id, { restrictionType: e.target.value })}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 truncate"
                    >
                      <option value="LIMITACION_MOVIMIENTO">🧊 Me cuesta moverlo (Limitado)</option>
                      <option value="PINZAMIENTO">⚡ Siento un "pellizco" o roce</option>
                      <option value="TENDINOPATIA">🔥 Me duele el tendón al hacer fuerza</option>
                      <option value="POST_QUIRURGICO">🏥 Operación reciente (Recuperación)</option>
                      <option value="INESTABILIDAD">⚠️ Siento que está flojo / Inestable</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
                
                {/* FASE */}
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">¿Hace cuánto tiempo?</label>
                  <div className="relative">
                    <select
                      value={injury.phase || 'AGUDA'}
                      onChange={(e) => onUpdate(injury.id, { phase: e.target.value })}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-rose-500/50 truncate"
                    >
                      <option value="AGUDA">🔴 Es nuevo (Hace unos días)</option>
                      <option value="SUBAGUDA">🟡 En proceso (Un par de semanas)</option>
                      <option value="CRONICA">🟢 Es algo viejo (Más de 1 mes)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="w-full pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* DOLOR */}
                <div className="w-full md:w-1/2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex justify-between items-center">
                    <span>¿Cuánto duele?</span>
                    <span className="text-rose-500 font-black bg-rose-50 px-2 py-0.5 rounded-md">{injury.painLevel}/5</span>
                  </label>
                  <input 
                    type="range" 
                    min="1" max="5" 
                    value={injury.painLevel}
                    onChange={(e) => onUpdate(injury.id, { painLevel: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500 mt-2" 
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                    <span>Es una molestia</span>
                    <span>Dolor intenso</span>
                  </div>
                </div>

                {/* REMOVE */}
                <button 
                  onClick={() => onRemove(injury.id)}
                  className="px-4 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-500 flex items-center justify-center gap-2 transition-all flex-shrink-0 w-full md:w-auto font-bold text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Quitar de la lista
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

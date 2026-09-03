import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutritionStore, type MetabolicAnchor } from '../../stores/useNutritionStore';
import { Check, Flame, BatteryCharging, Droplet, ArrowRight, ShieldAlert, Heart, Activity } from 'lucide-react';

// -----------------------------------------------------------------------------
// 1. ANCLA METABÓLICA (CHIPS)
// -----------------------------------------------------------------------------
export const MetabolicAnchorSelector = React.memo(() => {
  const currentAnchor = useNutritionStore(state => state.metabolicAnchor);
  const setAnchor = useNutritionStore(state => state.setMetabolicAnchor);

  const options: { id: MetabolicAnchor; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'DEFICIT', label: 'Déficit (Quema)', icon: <Flame size={16} />, color: 'bg-rose-500 text-rose-50' },
    { id: 'MAINTENANCE', label: 'Mantenimiento', icon: <Activity size={16} />, color: 'bg-blue-500 text-blue-50' },
    { id: 'SURPLUS', label: 'Superávit (Fuerza)', icon: <BatteryCharging size={16} />, color: 'bg-emerald-500 text-emerald-50' },
    { id: 'FASTING', label: 'Ayuno Intermitente', icon: <Droplet size={16} />, color: 'bg-indigo-500 text-indigo-50' }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-sm font-black text-white font-montserrat uppercase tracking-wider mb-3">
        1. Ancla Metabólica
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = currentAnchor === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setAnchor(opt.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all duration-200 ${
                isSelected 
                  ? `${opt.color} shadow-lg ring-2 ring-white/20` 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {opt.icon}
              {opt.label}
              {isSelected && <Check size={14} className="ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
});

// -----------------------------------------------------------------------------
// 2. MAGNETIC SLIDERS (Carga de Macros)
// -----------------------------------------------------------------------------
interface MacroSliderProps {
  macro: 'protein' | 'carbs' | 'fats';
  label: string;
  max: number;
  colorClass: string;
}

const MacroSlider = React.memo(({ macro, label, max, colorClass }: MacroSliderProps) => {
  const value = useNutritionStore(state => state.macros[macro]);
  const setValue = useNutritionStore(state => state.setMacro);

  const step = 25; // Salto magnético

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // El input de tipo range con step hace el snap automático
    setValue(macro, parseInt(e.target.value));
  }, [macro, setValue]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-2">
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
        <span className={`text-xl font-black font-lato ${colorClass}`}>{value}g</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max={max} 
        step={step} 
        value={value} 
        onChange={handleChange}
        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
        style={{
          background: `linear-gradient(to right, var(--tw-gradient-stops))`,
          // Implementación simplificada del fill
        }}
      />
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-bold">
        <span>0g</span>
        <span>{max}g</span>
      </div>
    </div>
  );
});

export const MacrosLoader = React.memo(() => {
  return (
    <div className="mb-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
      <h3 className="text-sm font-black text-white font-montserrat uppercase tracking-wider mb-5">
        2. Carga Estructural (Macros)
      </h3>
      <MacroSlider macro="protein" label="Proteína" max={300} colorClass="text-rose-400" />
      <MacroSlider macro="carbs" label="Carbohidratos" max={500} colorClass="text-blue-400" />
      <MacroSlider macro="fats" label="Grasas" max={200} colorClass="text-amber-400" />
    </div>
  );
});

// -----------------------------------------------------------------------------
// 3. VÁLVULA DE ESCAPE (REBEL METER)
// -----------------------------------------------------------------------------
export const EscapeValve = React.memo(() => {
  const notes = useNutritionStore(state => state.escapeValveNotes);
  const setNotes = useNutritionStore(state => state.setEscapeValveNotes);
  const evaluateCompliance = useNutritionStore(state => state.evaluateTextCompliance);
  const complianceBreach = useNutritionStore(state => state.clinicalComplianceBreach);

  const [isFocused, setIsFocused] = useState(false);
  const maxLength = 150;

  return (
    <div className="mb-8 relative">
      <h3 className="text-sm font-black text-white font-montserrat uppercase tracking-wider mb-2 flex items-center gap-2">
        3. Excepciones Clínicas <span className="text-xs text-zinc-500 normal-case tracking-normal">(Opcional)</span>
      </h3>
      <div className="relative">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            evaluateCompliance();
          }}
          placeholder="Ej: Alergia severa al cacahuete. Reemplazar frutos secos por aguacate."
          maxLength={maxLength}
          className={`w-full bg-zinc-900 border ${
            complianceBreach ? 'border-amber-500/50 focus:border-amber-500' : 'border-zinc-800 focus:border-zinc-600'
          } rounded-xl p-4 text-sm text-zinc-300 resize-none h-24 outline-none transition-colors placeholder:text-zinc-700`}
        />
        <div className={`absolute bottom-3 right-3 text-[10px] font-bold ${
          notes.length >= maxLength ? 'text-rose-500' : 'text-zinc-600'
        }`}>
          {notes.length} / {maxLength}
        </div>
      </div>
      
      <AnimatePresence>
        {complianceBreach && !isFocused && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3"
          >
            <ShieldAlert size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-400/90 font-medium leading-relaxed">
              <strong>Nudge Táctico:</strong> Notamos que utilizas frecuentemente las notas libres para definir macros. 
              Recuerda utilizar los <em>Magnetic Sliders</em> arriba para mantener el historial analítico del atleta intacto.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// -----------------------------------------------------------------------------
// 4. SHADOW DATA INDICATOR (SOLO LECTURA / INVISIBLE EN PROD, MOSTRADO PARA DEMO)
// -----------------------------------------------------------------------------
export const ShadowDataHUD = React.memo(() => {
  const shadow = useNutritionStore(state => state.shadowContext);
  
  return (
    <div className="mt-12 pt-6 border-t border-zinc-800/50">
      <div className="flex items-center gap-2 mb-3 opacity-30 hover:opacity-100 transition-opacity">
        <Heart size={14} className="text-zinc-500" />
        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Shadow Context (Auto-Sync)</h4>
      </div>
      <div className="flex gap-4 opacity-50">
        <div className="text-xs">
          <span className="text-zinc-600 block text-[10px] uppercase font-bold mb-0.5">Peso</span>
          <span className="text-zinc-400 font-lato">{shadow.currentWeightKg} kg</span>
        </div>
        <div className="text-xs">
          <span className="text-zinc-600 block text-[10px] uppercase font-bold mb-0.5">HRV Matutino</span>
          <span className="text-zinc-400 font-lato">{shadow.morningHrvMs} ms</span>
        </div>
        <div className="text-xs">
          <span className="text-zinc-600 block text-[10px] uppercase font-bold mb-0.5">Carga (Día)</span>
          <span className="text-zinc-400 font-lato">{shadow.trainingLoadType}</span>
        </div>
      </div>
    </div>
  );
});

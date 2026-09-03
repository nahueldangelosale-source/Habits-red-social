import React from 'react';
import { motion } from 'framer-motion';

export interface SliderStep {
  value: number;
  title: string;
  description: string;
}

interface PedagogicalSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  steps: SliderStep[];
  icon?: React.ReactNode;
  theme?: 'light' | 'dark';
}

export const PedagogicalSlider: React.FC<PedagogicalSliderProps> = ({ 
  label, 
  value, 
  onChange, 
  steps,
  icon,
  theme = 'dark'
}) => {
  const currentStep = steps.find(s => s.value === value) || steps[0];
  const isLight = theme === 'light';

  return (
    <div className={`w-full border rounded-2xl p-5 mb-6 backdrop-blur-sm ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/10'}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className={isLight ? 'text-indigo-600' : 'text-lime-400'}>{icon}</div>}
        <h3 className={`font-bold font-montserrat tracking-wide ${isLight ? 'text-slate-800' : 'text-white'}`}>{label}</h3>
      </div>

      <div className="relative pt-2 pb-6">
        <input
          type="range"
          min={steps[0].value}
          max={steps[steps.length - 1].value}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isLight ? 'bg-slate-200 accent-indigo-600' : 'bg-zinc-800 accent-lime-400'}`}
          style={{
            background: `linear-gradient(to right, ${isLight ? '#4f46e5' : '#a3e635'} 0%, ${isLight ? '#4f46e5' : '#a3e635'} ${(value - 1) * (100 / (steps.length - 1))}%, ${isLight ? '#e2e8f0' : '#27272a'} ${(value - 1) * (100 / (steps.length - 1))}%, ${isLight ? '#e2e8f0' : '#27272a'} 100%)`
          }}
        />
        
        <div className={`flex justify-between text-xs font-lato mt-2 px-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
          <span>{steps[0].title}</span>
          <span>{steps[steps.length - 1].title}</span>
        </div>
        
        {/* Indicadores Numéricos Clickables */}
        <div className="flex justify-between px-1 mt-4">
          {steps.map((s) => (
            <button 
              key={s.value} 
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(s.value); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                value === s.value 
                  ? (isLight ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-110' : 'bg-lime-400 text-slate-900 border-lime-400 shadow-md scale-110')
                  : (isLight ? 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400' : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:border-lime-400')
              }`}
            >
              {s.value}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        key={value}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'}`}
      >
        <h4 className={`font-bold mb-1 font-montserrat text-sm ${isLight ? 'text-indigo-700' : 'text-lime-400'}`}>{currentStep.title}</h4>
        <p className={`text-sm font-lato leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
          {currentStep.description}
        </p>
      </motion.div>
    </div>
  );
};

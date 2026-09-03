import React from 'react';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { getPeriodConfig, ACTIVE_PERIODS } from '../../data/modalityColors';

export const InteractiveHeatmap = ({ activePhaseId }: { activePhaseId: string | null }) => {
  const allDays = usePlanBuilderStore(state => state.days);
  const phases = usePlanBuilderStore(state => state.phases);
  const DAYS_OF_WEEK = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  // Agrupar días por fase (Mesociclo) para que los días "normales" (1-28) se reinicien por bloque
  const phasesWithWeeks = phases
    .filter(phase => activePhaseId === null || phase.id === activePhaseId)
    .map(phase => {
      const phaseDays = allDays.filter(d => d.phaseId === phase.id);
      const weeks = [];
      for (let i = 0; i < phaseDays.length; i += 7) {
        weeks.push(phaseDays.slice(i, i + 7));
      }
      return { phase, weeks, daysCount: phaseDays.length };
    }).filter(p => p.daysCount > 0);

  const getModalityColor = (modality?: string, secondaryModality?: string) => {
    if (!modality) return { className: 'bg-white text-slate-300 border-slate-100 opacity-50', style: {} };
    const p = getPeriodConfig(modality);
    
    if (secondaryModality) {
      const p2 = getPeriodConfig(secondaryModality);
      return {
        className: 'border-current/20 text-slate-800',
        style: {
          background: `linear-gradient(135deg, ${p.color.light} 50%, ${p2.color.light} 50%)`,
          borderColor: p.color.border
        }
      };
    }
    
    return {
      className: `${p.color.tailwind}/10 ${p.color.tailwindText} border-current/20`,
      style: {}
    };
  };

  if (allDays.length === 0) return null;

  const visiblePhaseDays = allDays.filter(d => activePhaseId === null || d.phaseId === activePhaseId);

  return (
    <div className="mt-4 border-t border-slate-100 pt-5 animate-in fade-in slide-in-from-top-2">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6 px-1 gap-4">
        
        {/* Explicación Pedagógica */}
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-black text-slate-700 uppercase">Mapa de Entrenamiento</h4>
          <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed">
            Los días con color indican <strong>Entrenamiento</strong> (el color define el enfoque, como Hipertrofia). Los días en gris claro son <strong>Descanso</strong>. Haz clic en cualquier día para alternar entre Entrenar o Descansar.
          </p>
        </div>

        {/* Dynamic Legend based only on used modalities in visible phases */}
        <div className="flex gap-3 text-[9px] font-bold text-slate-400 uppercase flex-wrap justify-end md:max-w-[40%]">
          {Array.from(new Set(visiblePhaseDays.map(d => d.primaryModality).filter(Boolean))).map(modalityId => {
            const p = ACTIVE_PERIODS.find(ap => ap.id === modalityId);
            if (!p) return null;
            return (
              <span key={p.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color.bg }} /> {p.label}
              </span>
            );
          })}
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        {phasesWithWeeks.map(({ phase, weeks }) => (
          <div key={phase.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-3 border-b border-slate-200/50 pb-2">
              <h5 className="text-xs font-black text-slate-700 uppercase">{phase.name}</h5>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400">{weeks.length} Semanas</span>
                <button
                  onClick={() => {
                    const store = usePlanBuilderStore.getState();
                    store.addWorkoutDay(`Día ${store.days.length + 1}`, phase.id);
                  }}
                  className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                >
                  + Día
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>
            
            <div className="flex flex-col gap-2">
              {weeks.map((week, weekIdx) => (
                <div key={`week-${weekIdx}`} className="grid grid-cols-7 gap-2">
                  {week.map((day, dayIdx) => {
                    const colorConfig = getModalityColor(day.primaryModality, day.secondaryModality);
                    return (
                      <div 
                        key={day.id} 
                        onClick={() => usePlanBuilderStore.getState().toggleDayModality(day.id)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${colorConfig.className}`}
                        style={colorConfig.style}
                        title={day.primaryModality ? `Día de Entrenamiento (Clic para marcar como descanso)` : `Día de Descanso (Clic para marcar como entrenamiento)`}
                      >
                        <span className="text-xs font-black">{dayIdx + 1 + (weekIdx * 7)}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

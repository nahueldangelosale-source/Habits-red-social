import React, { useMemo, useState } from 'react';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { Activity, LayoutGrid, Zap, X, Dumbbell } from 'lucide-react';

interface MacrocicloChartProps {
  onClose?: () => void;
}

export const MacrocicloChart: React.FC<MacrocicloChartProps> = ({ onClose }) => {
  const { days } = usePlanBuilderStore();
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const calendarData = useMemo(() => {
    // 1. Calcular carga por día y enriquecer
    const enrichedDays = days.map((day, index) => {
      let cargaDiaria = 0;
      day.items.forEach(item => {
        if (item.type === 'BLOCK') {
          const volumen = item.items.length;
          const rpe = item.rpe ?? 6;
          cargaDiaria += volumen * rpe;
        } else {
          cargaDiaria += 6;
        }
      });
      
      return {
        ...day,
        absoluteIndex: index,
        cargaDiaria,
        phaseName: day.phaseName || 'Fase de Trabajo'
      };
    });

    // 2. Agrupar por Fases (Mesociclos)
    const phasesMap: Record<string, typeof enrichedDays> = {};
    enrichedDays.forEach(day => {
      if (!phasesMap[day.phaseName]) {
        phasesMap[day.phaseName] = [];
      }
      phasesMap[day.phaseName].push(day);
    });

    // 3. Agrupar por semanas (Microciclos) dentro de cada fase
    const phasesResult = Object.entries(phasesMap).map(([phaseName, phaseDays]) => {
      const weeks = [];
      for (let i = 0; i < phaseDays.length; i += 7) {
        weeks.push(phaseDays.slice(i, i + 7));
      }
      return {
        phaseName,
        weeks
      };
    });

    return phasesResult;
  }, [days]);

  const getColorClass = (carga: number, isSelected: boolean) => {
    const base = isSelected ? 'ring-4 ring-slate-800 scale-105 z-10' : 'hover:scale-105';
    if (carga === 0) return `${base} bg-slate-50 border border-slate-200 hover:border-slate-300`;
    if (carga < 15) return `${base} bg-teal-100 border border-teal-200 shadow-[0_0_8px_rgba(20,184,166,0.1)]`; // Descarga
    if (carga < 40) return `${base} bg-indigo-300 border border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.2)]`; // Moderada
    if (carga < 70) return `${base} bg-indigo-500 border border-indigo-600 shadow-[0_0_16px_rgba(99,102,241,0.4)]`; // Alta
    return `${base} bg-violet-700 border border-violet-800 shadow-[0_0_20px_rgba(109,40,217,0.6)]`; // Muy alta
  };

  const getLabelClass = (carga: number) => {
    if (carga === 0) return 'text-slate-400';
    if (carga < 15) return 'text-teal-700';
    if (carga < 40) return 'text-indigo-900';
    return 'text-white';
  };

  const selectedDay = useMemo(() => {
    if (!selectedDayId) return null;
    return calendarData.flatMap(p => p.weeks.flat()).find(d => d.id === selectedDayId);
  }, [selectedDayId, calendarData]);

  return (
    <div className="w-full h-[85vh] landscape:h-screen flex flex-col bg-white landscape:bg-slate-50 landscape:rounded-none rounded-3xl p-6 shadow-2xl border border-slate-200 transition-all relative overflow-hidden">
      
      {/* Header Glassmorphism */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-100 z-10">
        <div>
          <h2 className="text-2xl font-black font-montserrat text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutGrid className="text-indigo-600" /> Analítica de Carga (Mapa de Macrociclo)
          </h2>
          <p className="text-slate-500 font-lato text-sm font-medium mt-1">
            Jerarquía: Macrociclo (Total) → Mesociclo (Fase) → Microciclo (Semana) → Sesión (Día).
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="hidden md:flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs font-bold text-slate-500 font-lato">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-slate-50 border border-slate-200"></div> Descanso</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-teal-100 border border-teal-200"></div> Ligero</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-indigo-500 border border-indigo-600"></div> Intenso</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-violet-700 border border-violet-800"></div> Extremo</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all font-lato shadow-lg hover:shadow-xl active:scale-95"
            >
              Cerrar Analítica
            </button>
          )}
        </div>
      </div>
      
      {/* Scrollable Canvas con Grid Layout si hay un día seleccionado */}
      <div className={`w-full flex-grow relative min-h-0 flex gap-6 transition-all duration-300`}>
        
        {/* Lado Izquierdo: El Calendario */}
        <div className={`flex-grow overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar transition-all duration-300 ${selectedDayId ? 'w-2/3 max-w-4xl' : 'w-full'}`}>
          {calendarData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <Activity size={48} className="opacity-20" />
              <p className="font-bold text-lg">No hay sesiones planificadas aún.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10 pb-12">
              {calendarData.map((phase, pIndex) => (
                <div key={pIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${pIndex * 150}ms` }}>
                  
                  {/* Mesociclo Header */}
                  <h3 className="font-black text-slate-800 font-montserrat tracking-tight mb-4 flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-sm">Mesociclo {pIndex + 1}</span> 
                    {phase.phaseName}
                  </h3>
                  
                  {/* Weeks Grid Container */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                    {phase.weeks.map((week, wIndex) => (
                      <div key={wIndex} className="flex flex-col xl:flex-row xl:items-center gap-4 group">
                        
                        {/* Microcycle Label */}
                        <div className="min-w-[120px] font-bold text-sm text-slate-400 uppercase tracking-widest font-lato group-hover:text-indigo-500 transition-colors">
                          Microciclo {wIndex + 1}
                        </div>
                        
                        {/* Days row */}
                        <div className="grid grid-cols-7 gap-3 flex-grow">
                          {week.map((day) => {
                            const isRest = day.cargaDiaria === 0;
                            const isSelected = selectedDayId === day.id;
                            return (
                              <div 
                                key={day.id} 
                                onClick={() => setSelectedDayId(isSelected ? null : day.id)}
                                className={`relative h-20 rounded-2xl flex flex-col items-center justify-center p-2 transition-all duration-300 ease-out group/day cursor-pointer ${getColorClass(day.cargaDiaria, isSelected)}`}
                              >
                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${getLabelClass(day.cargaDiaria)} opacity-80`}>
                                  Sesión {day.absoluteIndex + 1}
                                </span>
                                <span className={`text-xl font-black font-montserrat ${getLabelClass(day.cargaDiaria)}`}>
                                  {isRest ? '-' : day.cargaDiaria}
                                </span>
                                
                                {/* Tooltip Hover */}
                                <div className="absolute bottom-full mb-3 opacity-0 group-hover/day:opacity-100 pointer-events-none transition-all duration-200 scale-95 group-hover/day:scale-100 z-50">
                                  <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-2xl whitespace-nowrap border border-slate-800 flex items-center gap-2">
                                    <Zap size={12} className={isRest ? 'text-slate-500' : 'text-amber-400'} />
                                    Carga Total: {day.cargaDiaria} pts
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {/* Fill empty days if week < 7 */}
                          {Array.from({ length: 7 - week.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-20 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 opacity-50 pointer-events-none"></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lado Derecho: Panel de Drilldown (Sesión Seleccionada) */}
        {selectedDayId && selectedDay && (
          <div className="w-1/3 min-w-[300px] border-l border-slate-200 pl-6 animate-in slide-in-from-right-8 duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
                  Sesión {selectedDay.absoluteIndex + 1}
                </div>
                <h3 className="font-black text-xl text-slate-900 font-montserrat">{selectedDay.name || 'Día de Entrenamiento'}</h3>
              </div>
              <button 
                onClick={() => setSelectedDayId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Carga de Sesión</p>
                <p className="text-2xl font-black text-slate-800 font-montserrat">{selectedDay.cargaDiaria} <span className="text-sm font-bold text-slate-400">pts</span></p>
              </div>
              <Activity className="text-slate-300 w-8 h-8" />
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
              <h4 className="text-sm font-bold text-slate-800 mb-4 font-montserrat flex items-center gap-2">
                <Dumbbell size={14} className="text-indigo-500" /> Ejercicios Programados
              </h4>
              
              {selectedDay.items.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No hay ejercicios asignados en esta sesión (Día de descanso).</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedDay.items.map((item, idx) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight mb-1">
                          {item.exercise?.Nombre_Oficial || 'Bloque de Ejercicios'}
                        </p>
                        {item.type === 'BLOCK' ? (
                          <p className="text-[11px] font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">
                            {item.items.length} Series • RPE {item.rpe || 6}
                          </p>
                        ) : (
                          <p className="text-[11px] font-bold text-slate-500">
                            {item.sets || 4}x{item.reps || 10} • RPE {item.rpe || 6}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

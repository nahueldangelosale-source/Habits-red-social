import React, { useState, useMemo } from 'react';
import { usePlanBuilderStore, type WorkoutDay } from '../../stores/usePlanBuilderStore';
import { Calendar, ChevronRight, ChevronDown, Clock, CalendarDays, Lock, Grid, List, LineChart, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MacrocicloChart } from './MacrocicloChart';

export const VerticalActivityFeed: React.FC = () => {
  const { days, addPhaseWithWeeks, addWeekToPhase } = usePlanBuilderStore();
  
  const [viewMode, setViewMode] = useState<'orquestador' | 'clasico'>('orquestador');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [isAnalyticModalOpen, setIsAnalyticModalOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('Nueva Fase');
  const [newPhaseWeeks, setNewPhaseWeeks] = useState(4);

  const handleCreatePhase = () => {
    addPhaseWithWeeks(newPhaseName, newPhaseWeeks);
    setShowAddPhaseModal(false);
    setNewPhaseName('Nueva Fase');
    setNewPhaseWeeks(4);
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: prev[phaseId] === undefined ? false : !prev[phaseId]
    }));
  };

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };
  
  // Nivel 1: Agrupar días por phaseId (Memoizado para rendimiento Main Thread)
  const phases = useMemo(() => {
    const phasesMap = days.reduce((acc, day) => {
      const phaseId = day.phaseId || 'unassigned';
      if (!acc[phaseId]) {
        acc[phaseId] = {
          id: phaseId,
          name: day.phaseName || 'Fase sin asignar',
          releaseDate: day.releaseDate,
          days: []
        };
      }
      acc[phaseId].days.push(day);
      return acc;
    }, {} as Record<string, { id: string, name: string, releaseDate?: string | null, days: WorkoutDay[] }>);

    return Object.values(phasesMap).sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    });
  }, [days]);

  // Helper para dividir los días de una fase en semanas (Microciclos)
  const getWeeks = (phaseDays: WorkoutDay[]) => {
    const weeks = [];
    for (let i = 0; i < phaseDays.length; i += 7) {
      weeks.push(phaseDays.slice(i, i + 7));
    }
    return weeks;
  };

  return (
    <div className="bg-slate-50 border-x border-slate-200 min-h-screen max-w-5xl mx-auto pb-24 font-lato">
      
      {/* Sticky Header & Toggles */}
      <div className="bg-white p-6 border-b border-slate-200 sticky top-0 z-40 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black font-montserrat text-slate-900 flex items-center gap-2">
              <CalendarDays className="text-indigo-600" /> Historial de Entrenamiento
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-slate-500">Orquestación de la temporada de entrenamiento.</p>
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${showHelp ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                title="Ayuda sobre las vistas"
              >
                <Info size={14} />
              </button>
              {viewMode === 'orquestador' && (
                <button 
                  onClick={() => setIsAnalyticModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-colors font-lato"
                >
                  <LineChart size={14} /> Abrir Analítica de Carga
                </button>
              )}
            </div>
          </div>
          
          {/* Interruptor de Adopción (Modelo ADKAR) */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setViewMode('orquestador')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'orquestador' ? 'bg-white text-indigo-700 shadow-md ring-1 ring-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-700 scale-95 hover:scale-100'}`}
            >
              <Grid size={16} /> Vista Orquestador
            </button>
            <button 
              onClick={() => setViewMode('clasico')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'clasico' ? 'bg-white text-slate-800 shadow-md ring-1 ring-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-700 scale-95 hover:scale-100'}`}
            >
              <List size={16} /> Tabla Clásica
            </button>
          </div>
        </div>

        {/* Panel de Ayuda Expandible */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 text-sm text-slate-700 font-lato relative">
                <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600"><Lock size={14} className="opacity-0" /></button>
                <h4 className="font-black text-indigo-900 mb-3 font-montserrat flex items-center gap-2">
                  <Info size={16} className="text-indigo-500" /> Guía de Vistas de Orquestación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-bold text-indigo-800 flex items-center gap-1.5 mb-1"><Grid size={14} /> Vista Orquestador (Nivel Medio)</h5>
                    <p className="text-slate-600 leading-relaxed text-xs">Es tu <strong>mesa de trabajo (Workbench)</strong>. Aquí construyes, mueves y ordenas las cosas arrastrando. Te permite ver las Fases (Mesociclos) y Semanas (Microciclos) como cajas colapsables para periodizar el año rápidamente.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-indigo-800 flex items-center gap-1.5 mb-1"><List size={14} /> Tabla Clásica (Nivel Micro)</h5>
                    <p className="text-slate-600 leading-relaxed text-xs">Es tu <strong>hoja de Excel detallada</strong>. Muestra todo en un listado vertical aburrido pero altamente funcional. Ideal para lectura rápida de series, repeticiones y RPE sin distracciones visuales.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-indigo-800 flex items-center gap-1.5 mb-1"><LineChart size={14} /> Analítica Heatmap (Nivel Macro)</h5>
                    <p className="text-slate-600 leading-relaxed text-xs">Es tu <strong>radar de fatiga topográfico</strong>. Muestra toda la temporada en colores térmicos para detectar sobrecargas (bloques violetas) de un vistazo. <em>Tip: Haz clic en un día del Heatmap para inspeccionarlo.</em></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 space-y-12">
        {phases.length === 0 ? (
          <div className="text-center p-12 text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
            <Clock size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold font-lato">No hay eventos en la trayectoria.</p>
          </div>
        ) : viewMode === 'orquestador' ? (
          /* =========================================================================
             VISTA ORQUESTADOR (SEMANTIC ZOOM TIMELINE) 
             ========================================================================= */
          <div className="flex flex-col gap-10">
            {phases.map((phase) => {
              const isExpanded = expandedPhases[phase.id] !== false; // Default a true

              return (
                <div key={phase.id} className="flex flex-col gap-4">
                  {/* NIVEL 1: MACROCICLO (Vista 30k pies) */}
                  <div 
                    onClick={() => togglePhase(phase.id)}
                    className="group bg-indigo-950 hover:bg-indigo-900 transition-all duration-300 rounded-[2rem] py-8 px-6 cursor-pointer text-center shadow-lg hover:shadow-xl flex flex-col items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 via-transparent to-indigo-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <h3 className="font-black font-montserrat text-white text-2xl md:text-3xl uppercase tracking-[0.2em] relative z-10">
                      {phase.name}
                    </h3>
                    <div className="mt-3 text-indigo-300/60 text-xs font-bold tracking-widest uppercase relative z-10">
                      {phase.days.length} Días de Entrenamiento
                    </div>
                  </div>

                  {/* NIVEL 2 & 3: MESOCICLOS Y MICROCICLOS */}
                  {isExpanded && (
                    <div className="flex flex-col gap-4 px-4 animate-in fade-in slide-in-from-top-4 duration-300 ease-in-out fill-mode-both">
                      {getWeeks(phase.days).map((week, weekIndex) => {
                        const weekId = `${phase.id}-week-${weekIndex}`;
                        const isWeekExpanded = expandedWeeks[weekId] || false;
                        
                        // Empty states & volume logic para Nivel 2
                        const totalBlocks = week.reduce((sum, day) => sum + day.items.length, 0);
                        const isRestWeek = totalBlocks === 0;

                        // Grading Cinematográfico (Heatmap Monocromático)
                        const bgColor = isRestWeek 
                          ? 'bg-slate-50 border border-slate-200 border-dashed hover:border-indigo-300 hover:bg-indigo-50/30' 
                          : totalBlocks > 15 
                            ? 'bg-indigo-800 border border-indigo-700' 
                            : totalBlocks > 8 
                              ? 'bg-indigo-600 border border-indigo-500' 
                              : 'bg-indigo-400 border border-indigo-300';
                        
                        const textColor = isRestWeek ? 'text-slate-400' : 'text-white';
                        const sparklineColor = isRestWeek ? 'bg-slate-200' : 'bg-white/40';

                        return (
                          <div key={weekId} className="flex flex-col gap-3">
                            
                            {/* NIVEL 2: SEMANA (Zoom Semántico) */}
                            <div 
                              onClick={() => toggleWeek(weekId)}
                              className={`h-14 rounded-2xl flex items-center justify-between px-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.01] shadow-sm ${bgColor}`}
                            >
                              <div className="flex items-center gap-4">
                                <span className={`font-black font-montserrat text-sm uppercase tracking-wider ${textColor}`}>
                                  Microciclo {weekIndex + 1}
                                </span>
                                {isRestWeek && (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                                    Descarga / Vacío
                                  </span>
                                )}
                              </div>
                              
                              {/* Sparklines: Representación visual del volumen sin números */}
                              <div className="flex items-end gap-1.5 h-6">
                                {week.map((d, i) => (
                                  <div 
                                    key={d.id} 
                                    className={`w-1.5 rounded-full ${sparklineColor} transition-all duration-500`}
                                    style={{ height: d.items.length === 0 ? '4px' : `${Math.min(24, Math.max(8, d.items.length * 3))}px` }}
                                    title={`Día ${i+1}`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* NIVEL 3: DÍAS (Vista Táctica Operativa) */}
                            {isWeekExpanded && (
                              <div className="grid grid-cols-7 gap-3 mt-1 px-2 animate-in fade-in zoom-in-95 duration-200 ease-out fill-mode-both">
                                {week.map((day, dayIndex) => {
                                  const isEmptyDay = day.items.length === 0;
                                  return (
                                    <div 
                                      key={day.id} 
                                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${isEmptyDay ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md cursor-pointer'}`}
                                    >
                                      <span className={`text-[10px] font-black uppercase tracking-widest mb-1.5 font-lato ${isEmptyDay ? 'text-slate-300' : 'text-indigo-400'}`}>
                                        Día {dayIndex + 1}
                                      </span>
                                      <span className={`text-sm font-bold truncate w-full text-center font-lato ${isEmptyDay ? 'text-slate-400' : 'text-slate-800'}`}>
                                        {isEmptyDay ? 'Descanso' : `${day.items.length} Bloques`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Agregar Microciclo a Fase */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addWeekToPhase(phase.id);
                        }}
                        className="mt-2 h-12 w-full rounded-2xl border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50 flex items-center justify-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-600 transition-all font-lato group"
                      >
                        <span className="text-lg leading-none group-hover:scale-110 transition-transform">+</span> 
                        AGREGAR MICROCICLO
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Add Phase Button (Orquestador) */}
            <button
              onClick={() => setShowAddPhaseModal(true)}
              className="mt-4 w-full h-24 border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-[2rem] flex flex-col items-center justify-center text-indigo-400 hover:text-indigo-600 transition-all duration-300 font-bold font-lato group"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center mb-2 transition-colors">
                <span className="text-2xl">+</span>
              </div>
              Insertar Mesociclo / Fase
            </button>
          </div>
        ) : (
          /* =========================================================================
             VISTA CLÁSICA (TABLA / VERTICAL TRADICIONAL)
             ========================================================================= */
          <div className="flex flex-col gap-6">
            {phases.map((phase, index) => {
              const isExpanded = expandedPhases[phase.id] !== false; // Default a true
              return (
                <div key={phase.id} className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div 
                    onClick={() => togglePhase(phase.id)}
                    className="flex items-center justify-between cursor-pointer border-b border-slate-100 pb-4 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold font-montserrat text-lg text-slate-800">{phase.name}</h3>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5 flex items-center gap-1">
                          {phase.releaseDate ? (
                            <>
                              <Calendar size={10} /> INICIA: {new Date(phase.releaseDate).toLocaleDateString()}
                            </>
                          ) : (
                            <>
                              <Lock size={10} /> PENDIENTE DE LIBERACIÓN
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span className="text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {phase.days.length} días
                      </span>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-4 pr-2 space-y-4 border-l-2 border-slate-100 ml-4 relative">
                      {phase.days.map((day, dayIndex) => {
                        const isLocked = !phase.releaseDate;
                        return (
                          <div key={day.id} className={`relative flex items-start gap-4 transition-all duration-300 ${isLocked ? 'opacity-60 grayscale-[0.5]' : 'hover:translate-x-1'}`}>
                            {/* Nodo */}
                            <div className="absolute -left-[23px] bg-white border-2 border-slate-200 rounded-full p-1 z-10 mt-2">
                              <div className="w-2 h-2 rounded-full bg-slate-300" />
                            </div>

                            {/* Tarjeta Clásica */}
                            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1.5 font-lato">
                                    Día {dayIndex + 1}
                                    {isLocked && <Lock size={10} className="text-slate-400" />}
                                  </div>
                                  <h4 className="font-bold text-slate-700 text-base font-lato">
                                    {day.name}
                                  </h4>
                                </div>
                                
                                <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                                  {day.items.length} bloques
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAnalyticModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-3xl"
            >
              <MacrocicloChart onClose={() => setIsAnalyticModalOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPhaseModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-black font-montserrat text-slate-800 mb-2">Insertar Nueva Fase</h3>
              <p className="text-slate-500 font-lato text-sm mb-6">Configura el mesociclo. Generaremos los microciclos automáticamente.</p>
              
              <div className="space-y-4 font-lato">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre de la Fase</label>
                  <input 
                    type="text" 
                    value={newPhaseName}
                    onChange={(e) => setNewPhaseName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    placeholder="Ej. Acumulación Metabólica"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duración (Semanas)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" max="12" 
                      value={newPhaseWeeks}
                      onChange={(e) => setNewPhaseWeeks(Number(e.target.value))}
                      className="flex-grow accent-indigo-600"
                    />
                    <div className="w-16 text-center bg-indigo-50 text-indigo-700 font-black px-3 py-2 rounded-xl">
                      {newPhaseWeeks}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowAddPhaseModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors font-lato"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreatePhase}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all font-lato"
                >
                  Generar Fase
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



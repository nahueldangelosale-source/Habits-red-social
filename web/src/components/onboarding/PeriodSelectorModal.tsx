import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarPlus, Plus, Minus, Trash2, ArrowRight, Sparkles, AlertCircle, Star, ChevronDown, ChevronRight, Dumbbell, Activity, ShieldCheck, Settings } from 'lucide-react';
import { ACTIVE_PERIODS, getPeriodConfig } from '../../data/modalityColors';
import type { PeriodCategory, PeriodConfig } from '../../data/modalityColors';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { v4 as uuidv4 } from 'uuid';

export type QueuedPhase = {
  uId: string;
  id: string;
  config: PeriodConfig;
  weeks: number;
  frequency: number;
};

interface PeriodSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPeriod: (selections: {id: string, weeks: number, activeDaysPattern: number[]}[]) => void;
}

const CATEGORY_LABELS: Record<PeriodCategory, { title: string; subtitle: string }> = {
  TRAINING: { title: 'Entrenamiento y Performance', subtitle: 'Fuerza, Hipertrofia y Potencia' },
  WELLNESS: { title: 'Bienestar y Movilidad', subtitle: 'Restauración, Flow y Yoga' },
  PREVENTION: { title: 'Prevención y Condición', subtitle: 'Readaptación y Salud' },
  CUSTOM: { title: 'Personalizado', subtitle: 'Crea tu propio bloque a medida' },
  SYSTEM: { title: '', subtitle: '' } // Oculto
};

const getCategoryIcon = (key: PeriodCategory) => {
  switch (key) {
    case 'TRAINING': return <Dumbbell className="w-6 h-6 text-indigo-500" />;
    case 'WELLNESS': return <Activity className="w-6 h-6 text-teal-500" />;
    case 'PREVENTION': return <ShieldCheck className="w-6 h-6 text-rose-500" />;
    case 'CUSTOM': return <Settings className="w-6 h-6 text-slate-500" />;
    default: return null;
  }
};

export const PeriodSelectorModal: React.FC<PeriodSelectorModalProps> = ({ isOpen, onClose, onSelectPeriod }) => {
  const [queuedPhases, setQueuedPhases] = useState<QueuedPhase[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const { training, goalTags } = useOnboardingPTStore();
  const { favoriteRoutinePhases, toggleRoutineFavorite } = useFavoritesStore();

  useEffect(() => {
    if (isOpen) {
      const discipline = localStorage.getItem('v2_discipline_selected') || 'STRENGTH';
      if (discipline === 'YOGA' || discipline === 'PILATES') setExpandedCategories(['WELLNESS']);
      else if (discipline === 'CLINICAL' || discipline === 'REHAB') setExpandedCategories(['PREVENTION']);
      else setExpandedCategories(['TRAINING']);
    }
  }, [isOpen]);

  const addToQueue = (periodId: string) => {
    const config = getPeriodConfig(periodId);
    if (!config) return;
    setQueuedPhases(prev => [...prev, {
      uId: uuidv4(),
      id: periodId,
      config,
      weeks: 4,
      frequency: 3
    }]);
  };

  const updateQueuedPhase = (uId: string, updates: Partial<QueuedPhase>) => {
    setQueuedPhases(prev => prev.map(p => p.uId === uId ? { ...p, ...updates } : p));
  };

  const removeQueuedPhase = (uId: string) => {
    setQueuedPhases(prev => prev.filter(p => p.uId !== uId));
  };

  // Sugerencias Dinámicas
  const expLevel = training?.experience_level || 'BEGINNER';
  const hasWeightLossGoal = goalTags?.includes('perder peso') || goalTags?.includes('recomposicion');

  const discipline = localStorage.getItem('v2_discipline_selected') || 'STRENGTH';

  let suggestedIds = ['ADAPTACION', 'HIPERTROFIA', 'TRANSICION'];
  
  if (discipline === 'YOGA' || discipline === 'PILATES') {
    suggestedIds = ['FUNDAMENTOS_MOVIMIENTO', 'FLOW_INTEGRATIVO', 'TRANSICION'];
  } else if (discipline === 'CLINICAL' || discipline === 'REHAB') {
    suggestedIds = ['REHABILITACION', 'READAPTACION', 'ESTABILIZACION_CORE'];
  } else if (discipline === 'CROSSFIT') {
    suggestedIds = ['ADAPTACION', 'FUERZA', 'ANAEROBICO'];
  } else if (discipline === 'ENDURANCE') {
    suggestedIds = ['AEROBICO_BASE', 'ANAEROBICO', 'PUESTA_A_PUNTO'];
  } else {
    // Para Fuerza o perfiles comerciales, usamos sus objetivos
    if (expLevel !== 'BEGINNER') {
      if (hasWeightLossGoal) {
        suggestedIds = ['RECOMPOSICION', 'DEFICIT', 'TRANSICION'];
      } else {
        suggestedIds = ['HIPERTROFIA', 'FUERZA', 'PUESTA_A_PUNTO'];
      }
    }
  }

  const suggestedPeriods = suggestedIds.map(id => getPeriodConfig(id)).filter(Boolean) as PeriodConfig[];

  const periodsByCategory = ACTIVE_PERIODS.reduce((acc, period) => {
    if (period.category === 'SISTEMA') return acc;
    if (!acc[period.category]) acc[period.category] = [];
    acc[period.category].push(period);
    return acc;
  }, {} as Record<PeriodCategory, PeriodConfig[]>);

  const totalWeeks = queuedPhases.reduce((acc, p) => acc + p.weeks, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:px-8 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-montserrat">Librería de Ciclos de Entrenamiento</h2>
            <p className="text-sm text-slate-500 font-medium">Diseña tu plan encolando diferentes ciclos cronológicamente.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body - Split Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column - Library (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 sm:px-8 bg-slate-50 custom-scrollbar">
            
            {/* Filter Toggle */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl mb-8 w-fit">
              <button 
                onClick={() => setFilterFavorites(false)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!filterFavorites ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Todas las Fases
              </button>
              <button 
                onClick={() => setFilterFavorites(true)}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${filterFavorites ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                ⭐ Favoritas y más usadas
              </button>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 text-sm">¿Cómo funciona la Periodización?</h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  Un <strong>Ciclo de Entrenamiento</strong> es una fase estructurada de varias semanas enfocada en un estímulo puntual (ej: ganar fuerza o mejorar movilidad). Encadenar diferentes ciclos ayuda a evitar el estancamiento y a reducir el riesgo de lesiones a largo plazo.
                </p>
              </div>
            </div>

            {/* Suggested Section */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recomendados según Perfil del Atleta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedPeriods.map(period => (
                  <button
                    key={`sug-${period.id}`}
                    onClick={() => addToQueue(period.id)}
                    className="flex flex-col p-4 rounded-2xl border-2 border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-left relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 flex items-center gap-3 mb-2">
                      <span className="text-2xl drop-shadow-sm" aria-hidden="true">{period.emoji}</span>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{period.label}</h4>
                    </div>
                    <p className="relative z-10 text-xs text-slate-500">{period.description}</p>
                    <div className="relative z-10 mt-3 flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                      <Plus className="w-3 h-3 mr-1" /> Añadir al Plan
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pb-8">
              {(() => {
                const discipline = localStorage.getItem('v2_discipline_selected') || 'STRENGTH';
                const keys = Object.keys(CATEGORY_LABELS) as PeriodCategory[];
                
                // Reordenar categorías basado en la disciplina
                keys.sort((a, b) => {
                  if (a === 'SYSTEM') return 1; // Sistema siempre al final
                  if (b === 'SYSTEM') return -1;
                  
                  if (discipline === 'YOGA' || discipline === 'PILATES') {
                    if (a === 'WELLNESS') return -1;
                    if (b === 'WELLNESS') return 1;
                  } else if (discipline === 'CLINICAL' || discipline === 'REHAB') {
                    if (a === 'PREVENTION') return -1;
                    if (b === 'PREVENTION') return 1;
                  } else {
                    // STRENGTH, CROSSFIT, ENDURANCE, etc
                    if (a === 'TRAINING') return -1;
                    if (b === 'TRAINING') return 1;
                  }
                  return 0;
                });

                return keys.map(catKey => {
                  const catLabel = CATEGORY_LABELS[catKey];
                  const catPeriods = (periodsByCategory[catKey] || []).filter(p => !filterFavorites || favoriteRoutinePhases.includes(p.id));
                  
                  if (catPeriods.length === 0) return null;

                  const isPersonalizado = catKey === 'CUSTOM';

                return (
                  <div key={catKey} className={isPersonalizado ? "mt-8 pt-6 border-t border-slate-200" : ""}>
                    <button 
                      onClick={() => {
                        setExpandedCategories(prev => 
                          prev.includes(catKey) 
                            ? prev.filter(k => k !== catKey) 
                            : [...prev, catKey]
                        );
                      }}
                      className={`w-full flex items-center justify-between mb-4 group text-left p-4 rounded-2xl transition-all border ${
                        expandedCategories.includes(catKey) 
                          ? 'bg-white border-indigo-200 shadow-sm ring-4 ring-indigo-50' 
                          : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-white shadow-sm border border-slate-100`}>
                          {getCategoryIcon(catKey)}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{catLabel.title}</h3>
                          <p className="text-xs font-semibold text-slate-500 mt-1">{catLabel.subtitle}</p>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        expandedCategories.includes(catKey) ? 'bg-indigo-100 text-indigo-600' : 'bg-white border text-slate-400 group-hover:text-indigo-500'
                      }`}>
                        {expandedCategories.includes(catKey) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>

                    {expandedCategories.includes(catKey) && (
                      <AnimatePresence>
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-hidden"
                        >
                      {catPeriods.map(period => (
                        <button
                          key={period.id}
                          onClick={() => addToQueue(period.id)}
                          className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:shadow-sm ${
                            isPersonalizado 
                              ? 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300' 
                              : 'border-slate-200 bg-white hover:border-indigo-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600`}>
                            <span className="text-xl" aria-hidden="true">{period.emoji}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <h4 className="font-bold text-slate-800 text-sm leading-tight">
                                {period.label}
                              </h4>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRoutineFavorite(period.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleRoutineFavorite(period.id);
                                  }
                                }}
                                className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-100 transition-colors group/star cursor-pointer"
                                title={favoriteRoutinePhases.includes(period.id) ? "Quitar de favoritas" : "Añadir a favoritas"}
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  strokeWidth={2} 
                                  stroke="currentColor" 
                                  className={`w-4 h-4 transition-all ${favoriteRoutinePhases.includes(period.id) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 group-hover/star:text-amber-400 group-hover/star:scale-110'}`}
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">{period.description}</p>
                          </div>
                        </button>
                      ))}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                );
              })})()}
            </div>

          </div>

          {/* Right Column - Queue */}
          <div className="w-full sm:w-80 lg:w-96 border-l border-slate-100 bg-white flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-indigo-500" />
                Tu Secuencia
              </h3>
              <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
                {totalWeeks} Semanas
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <AnimatePresence>
                {queuedPhases.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-12 px-4"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 border-dashed">
                      <AlertCircle className="w-6 h-6 text-slate-300" />
                    </div>
                    <h4 className="font-bold text-slate-700 mb-1">Sin bloques</h4>
                    <p className="text-xs text-slate-500">Haz clic en los bloques de la izquierda para armar tu secuencia de entrenamiento.</p>
                  </motion.div>
                ) : (
                  queuedPhases.map((phase, index) => (
                    <motion.div
                      key={phase.uId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 rounded-2xl border shadow-sm relative bg-slate-50 border-slate-200`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs bg-indigo-600 text-white font-bold shadow-sm`}>
                            {index + 1}
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">{phase.config.label}</h4>
                        </div>
                        <button 
                          onClick={() => removeQueuedPhase(phase.uId)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duración</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQueuedPhase(phase.uId, { weeks: Math.max(1, phase.weeks - 1) })}
                              className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-black text-slate-800 w-12 text-center text-xs">
                              {phase.weeks} sem
                            </span>
                            <button 
                              onClick={() => updateQueuedPhase(phase.uId, { weeks: Math.min(16, phase.weeks + 1) })}
                              className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frecuencia</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQueuedPhase(phase.uId, { frequency: Math.max(1, phase.frequency - 1) })}
                              className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-black text-slate-800 w-12 text-center text-xs">
                              {phase.frequency}x
                            </span>
                            <button 
                              onClick={() => updateQueuedPhase(phase.uId, { frequency: Math.min(7, phase.frequency + 1) })}
                              className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer Action */}
            <div className="p-5 border-t border-slate-100 bg-white">
              <button
                disabled={queuedPhases.length === 0}
                onClick={() => {
                  const selections = queuedPhases.map(qp => {
                    let pattern = [0, 2, 4]; // Default 3x
                    if (qp.frequency === 1) pattern = [0];
                    if (qp.frequency === 2) pattern = [1, 4];
                    if (qp.frequency === 3) pattern = [0, 2, 4];
                    if (qp.frequency === 4) pattern = [0, 1, 3, 4];
                    if (qp.frequency === 5) pattern = [0, 1, 2, 3, 4];
                    if (qp.frequency === 6) pattern = [0, 1, 2, 3, 4, 5];
                    if (qp.frequency === 7) pattern = [0, 1, 2, 3, 4, 5, 6];
                    return { id: qp.id, weeks: qp.weeks, activeDaysPattern: pattern };
                  });
                  onSelectPeriod(selections);
                  onClose();
                  setQueuedPhases([]);
                }}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  queuedPhases.length > 0 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02]' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Generar {queuedPhases.length} Bloque{queuedPhases.length !== 1 ? 's' : ''} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

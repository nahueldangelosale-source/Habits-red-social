import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarPlus, ChevronRight, ChevronDown, Plus, Minus, Trash2, ArrowRight, Sparkles, AlertCircle, Leaf, Flame, Apple, Flower2, Zap, Stethoscope, PencilRuler } from 'lucide-react';
import { NUTRITION_PERIOD_PALETTE, NUTRITION_CATEGORY_LABELS, getNutritionPeriodConfig } from '../../../data/nutritionPhasesConfig';
import type { NutritionPeriodCategory, NutritionPeriodConfig } from '../../../data/nutritionPhasesConfig';
import { v4 as uuidv4 } from 'uuid';
import { useOnboardingPTStore } from '../../../stores/useOnboardingPTStore';
import { useFavoritesStore } from '../../../stores/useFavoritesStore';

export type QueuedNutritionPhase = {
  uId: string;
  id: string;
  config: NutritionPeriodConfig;
  weeks: number;
};

interface NutritionPeriodSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPeriod: (selections: {id: string, weeks: number}[]) => void;
}

export const NutritionPeriodSelectorModal: React.FC<NutritionPeriodSelectorModalProps> = ({ isOpen, onClose, onSelectPeriod }) => {
  const [queuedPhases, setQueuedPhases] = useState<QueuedNutritionPhase[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<NutritionPeriodCategory[]>([]);

  const getCategoryIcon = (catKey: NutritionPeriodCategory) => {
    switch (catKey) {
      case 'ESTILO_DE_VIDA': return <Leaf className="w-5 h-5 text-emerald-500" />;
      case 'GESTION_METABOLICA': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'SALUD_GI': return <Apple className="w-5 h-5 text-red-500" />;
      case 'SALUD_HORMONAL': return <Flower2 className="w-5 h-5 text-pink-500" />;
      case 'RENDIMIENTO': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'CLINICO': return <Stethoscope className="w-5 h-5 text-blue-500" />;
      case 'PERSONALIZADO': return <PencilRuler className="w-5 h-5 text-slate-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const addToQueue = (periodId: string) => {
    const config = getNutritionPeriodConfig(periodId);
    if (!config) return;
    setQueuedPhases(prev => [...prev, {
      uId: uuidv4(),
      id: periodId,
      config,
      weeks: 4,
    }]);
  };

  const updateQueuedPhase = (uId: string, updates: Partial<QueuedNutritionPhase>) => {
    setQueuedPhases(prev => prev.map(p => p.uId === uId ? { ...p, ...updates } : p));
  };

  const removeQueuedPhase = (uId: string) => {
    setQueuedPhases(prev => prev.filter(p => p.uId !== uId));
  };

  const { goalTags, healthData } = useOnboardingPTStore();
  const { favoriteNutritionPhases, toggleNutritionFavorite } = useFavoritesStore();

  // Lógica de Sugerencias Dinámicas
  const hasWeightLossGoal = goalTags?.includes('perder peso') || goalTags?.includes('recomposicion');
  const hasMuscleGoal = goalTags?.includes('ganar masa muscular') || goalTags?.includes('ganar musculo');
  const isGI = healthData?.digestion_issues?.length > 0;

  let suggestedIds = ['AYUNO_INTERMITENTE', 'RESET_CONDUCTUAL', 'TRANSICION_PLANT_BASED'];
  
  if (isGI) {
    suggestedIds = ['GUT_RESET', 'LOW_FODMAP', 'REPARACION_5R'];
  } else if (hasWeightLossGoal) {
    suggestedIds = ['RESET_INSULINICO', 'DEFICIT_ESTANDAR', 'REVERSE_DIETING'];
  } else if (hasMuscleGoal) {
    suggestedIds = ['SUPERAVIT_PROTEICO', 'CICLADO_CARBOHIDRATOS', 'MANTENIMIENTO_MED'];
  }

  const suggestedPeriods = suggestedIds.map(id => getNutritionPeriodConfig(id)).filter(Boolean) as NutritionPeriodConfig[];

  // Agrupar los periodos por categoría
  const periodsByCategory = Object.values(NUTRITION_PERIOD_PALETTE).reduce((acc, period) => {
    if (!acc[period.category]) acc[period.category] = [];
    acc[period.category].push(period);
    return acc;
  }, {} as Record<NutritionPeriodCategory, NutritionPeriodConfig[]>);

  const totalWeeks = queuedPhases.reduce((acc, p) => acc + p.weeks, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
            <h2 className="text-2xl font-black text-slate-800 font-montserrat">Librería de Ciclos Nutricionales</h2>
            <p className="text-sm text-slate-500 font-medium">Diseña la estrategia uniendo bloques nutricionales adaptados al contexto de tu paciente.</p>
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

            {/* Pedagogical Explanation */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-500 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 text-sm">¿Cómo funciona la Periodización Nutricional?</h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  Un <strong>Ciclo Nutricional</strong> es una fase estructurada enfocada en un estímulo metabólico puntual (ej: déficit calórico, sanación intestinal o peak performance). Encadenar diferentes ciclos ayuda a evitar la adaptación metabólica y garantiza resultados sostenibles a largo plazo.
                </p>
              </div>
            </div>

            {/* Suggested Section */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Recomendados según Perfil del Paciente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestedPeriods.map(period => (
                  <button
                    key={`sug-${period.id}`}
                    onClick={() => addToQueue(period.id)}
                    className="flex flex-col p-4 rounded-2xl border-2 border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-left relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 opacity-5 -mr-4 -mt-4 rounded-full ${period.color.tailwind}`}></div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl" aria-hidden="true">{period.emoji}</span>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{period.label}</h4>
                    </div>
                    <p className="text-xs text-slate-500">{period.description}</p>
                    <div className="mt-3 flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                      <Plus className="w-3 h-3 mr-1" /> Añadir al Plan
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-8 pb-8">
              {(Object.keys(NUTRITION_CATEGORY_LABELS) as NutritionPeriodCategory[]).map(catKey => {
                const catLabel = NUTRITION_CATEGORY_LABELS[catKey];
                const catPeriods = (periodsByCategory[catKey] || []).filter(p => !filterFavorites || favoriteNutritionPhases.includes(p.id));
                
                if (catPeriods.length === 0) return null;

                const isPersonalizado = catKey === 'PERSONALIZADO';

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
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${period.color.tailwind} ${period.color.tailwindText} bg-opacity-10`}>
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
                                  toggleNutritionFavorite(period.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleNutritionFavorite(period.id);
                                  }
                                }}
                                className="p-1.5 -mr-1.5 rounded-full hover:bg-slate-100 transition-colors group/star cursor-pointer"
                                title={favoriteNutritionPhases.includes(period.id) ? "Quitar de favoritas" : "Añadir a favoritas"}
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  strokeWidth={2} 
                                  stroke="currentColor" 
                                  className={`w-4 h-4 transition-all ${favoriteNutritionPhases.includes(period.id) ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300 group-hover/star:text-amber-400 group-hover/star:scale-110'}`}
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
              })}
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
                    <p className="text-xs text-slate-500">Haz clic en los bloques de la izquierda para armar tu secuencia nutricional.</p>
                  </motion.div>
                ) : (
                  queuedPhases.map((phase, index) => (
                    <motion.div
                      key={phase.uId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 rounded-2xl border shadow-sm relative ${phase.config.color.tailwind} bg-opacity-[0.02] ${phase.config.color.border}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${phase.config.color.tailwind} text-white font-bold shadow-sm`}>
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

                      <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duración</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQueuedPhase(phase.uId, { weeks: Math.max(1, phase.weeks - 1) })}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-black text-slate-800 w-16 text-center">
                            {phase.weeks} sem{phase.weeks > 1 ? 's' : ''}
                          </span>
                          <button 
                            onClick={() => updateQueuedPhase(phase.uId, { weeks: phase.weeks + 1 })}
                            className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
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
                  onSelectPeriod(queuedPhases.map(q => ({
                    id: q.id,
                    weeks: q.weeks
                  })));
                  setQueuedPhases([]);
                }}
                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  queuedPhases.length > 0 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02]' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Insertar {queuedPhases.length} Bloque{queuedPhases.length !== 1 ? 's' : ''} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

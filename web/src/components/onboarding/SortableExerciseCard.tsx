import React, { memo, useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, GripVertical, Target, Activity, PlayCircle, Shield, RotateCcw, ChevronDown, ChevronUp, Layers, ChevronRight, MoreVertical, Eye, RefreshCw } from 'lucide-react';
import { usePlanBuilderStore, type RoutineItem } from '../../stores/usePlanBuilderStore';

interface SortableExerciseCardProps {
  item: any;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: string, isShiftMode: boolean) => void;
  updateRoutineItem: (id: string, field: string, value: string) => void;
  removeRoutineItem: (id: string) => void;
  revertClinicalSwap?: (id: string) => void;
  isOverMRV?: boolean;
  phaseColor?: string;
  isHIITBlock?: boolean;
  registerCell: (id: string, field: string) => (el: HTMLInputElement | null) => void;
}
// --- Feature Flags ---
const IS_BETA_FEATURES_ENABLED = true;
const IS_ACTION_MENU_ENABLED = true;

export const SortableExerciseCard = memo(({
  item,
  index,
  isSelected,
  onToggleSelect,
  updateRoutineItem,
  removeRoutineItem,
  revertClinicalSwap,
  isOverMRV,
  phaseColor,
  isHIITBlock,
  registerCell
}: SortableExerciseCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAdvancedSets, setShowAdvancedSets] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { exerciseDensity } = usePlanBuilderStore();

  // Close action menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    // Small delay (200ms) to avoid accidental closure
    tooltipTimeoutRef.current = setTimeout(() => setShowTooltip(false), 200);
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Detectamos si el usuario mantiene apretado Shift nativamente
    // e.nativeEvent.shiftKey nos permite hacer selección de rangos si quisiéramos implementarlo
    onToggleSelect(item.id, (e.nativeEvent as any).shiftKey);
  };

  // Determinar color de borde (Teal para swap, Indigo para selección)
  let borderClass = 'border-b border-b-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)]';
  let bgClass = 'bg-white';
  
  if (isSelected) {
    borderClass = 'border-l-4 border-l-indigo-500 border-b border-b-indigo-100 shadow-sm';
    bgClass = 'bg-indigo-50/30';
  } else if (item.isSwapped) {
    borderClass = 'border-l-4 border-l-teal-500 border-b border-b-teal-100 shadow-teal-500/10 shadow-sm';
    bgClass = 'bg-slate-50/50';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white ${borderClass} rounded-2xl transition-all duration-200 
        ${isSelected ? 'bg-indigo-50/50' : ''} 
        ${isDragging ? 'scale-[0.98] rotate-2 shadow-2xl z-[100] border-indigo-400 opacity-95 ring-2 ring-indigo-500/30' : 'hover:shadow-md hover:border-slate-300'}
        ${exerciseDensity === 'compact' ? 'p-2' : 'p-3 md:p-4'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {item.exercise.ID_Ejercicio === 'manual-validation-required' ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                {...attributes} 
                {...listeners} 
                className="w-8 h-8 rounded-full bg-slate-800/10 hover:bg-slate-800/20 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing transition-colors"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-slate-800 text-lg tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Validación Requerida
              </h3>
            </div>
            <button 
              onClick={() => removeRoutineItem(item.id)} 
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2 rounded-lg"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-slate-900 border-l-4 border-l-amber-500 rounded-r-xl p-4 shadow-inner">
            <p className="text-xs text-amber-50 font-lato leading-relaxed">
              <span className="font-bold text-amber-400">AI Assist:</span> {item.clinicalRationale}
            </p>
            <button className="mt-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all w-full text-left flex items-center justify-between">
              Firmar Variante Manual <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <input 
                type="checkbox" 
                checked={isSelected}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0"
              />
              <div 
                {...attributes} 
                {...listeners} 
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-grab active:cursor-grabbing transition-colors shrink-0"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              
              {phaseColor && (
                <div className={`w-1.5 h-10 rounded-full ${phaseColor} shrink-0 opacity-80`} />
              )}
              
              <div className="min-w-0 flex-1">
                <div 
                  className="flex items-center flex-wrap gap-2 cursor-pointer hover:bg-slate-50/50 py-1 rounded transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  title="Ver detalles del ejercicio"
                >
                  <h3 className="font-heading font-extrabold text-slate-800 text-base md:text-lg flex items-center gap-1.5 truncate">
                    <span className="text-sm font-black text-slate-400">#{index + 1}</span> {item.exercise.Nombre_Oficial}
                  </h3>
                  
                  {item.isSwapped && (
                    <div 
                      className="relative flex items-center shrink-0"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => setShowTooltip(!showTooltip)}
                    >
                      <span className="flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-purple-950 via-purple-900 to-rose-500 text-rose-50 text-[9px] font-bold uppercase tracking-wider rounded-full cursor-help hover:opacity-95 transition-opacity border border-purple-500/30 shadow-sm">
                        <Shield size={10} className="fill-rose-300" /> Optimizado por IA
                      </span>
                      
                      {showTooltip && (
                        <div 
                          className="absolute left-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-205"
                          onMouseEnter={handleMouseEnter}
                          onMouseLeave={handleMouseLeave}
                        >
                          <h4 className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Shield size={12} className="text-rose-400" /> Sustitución Clínica Activa
                          </h4>
                          <p className="text-slate-300 text-xs font-lato leading-relaxed mb-4">
                            {item.clinicalRationale}
                          </p>
                          
                          {revertClinicalSwap && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowTooltip(false);
                                setShowNegotiationModal(true);
                              }}
                              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-colors border border-slate-700"
                            >
                              <RotateCcw size={14} /> Revertir a {item.originalExerciseName || 'original'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className={`text-[11px] font-lato text-slate-500 truncate ${exerciseDensity === 'compact' ? 'hidden md:block' : ''}`}>{item.exercise.Musculo_Agonista} • {item.exercise.Equipamiento_Requerido}</p>
              </div>
            </div>

            {/* Dosis de Volumen Rápido (Siempre Visible) */}
            <div className={`flex items-center shrink-0 ${exerciseDensity === 'compact' ? 'gap-1' : 'gap-3'}`}>
              {isHIITBlock ? (
                <div className={`flex items-center gap-2 text-indigo-600 bg-indigo-50 rounded-lg border border-indigo-200/40 shadow-sm font-black uppercase tracking-widest ${exerciseDensity === 'compact' ? 'text-[9px] px-2 py-1' : 'text-[10px] px-3 py-1.5'}`}>
                  <span>Timer WOD</span>
                  <span className="text-indigo-300">|</span>
                  <span className="text-slate-500">Peso Corporal / Ligero</span>
                </div>
              ) : (
                <div 
                  className={`flex items-center gap-1 text-slate-600 bg-slate-100/80 rounded-lg border border-slate-200/40 shadow-sm font-black uppercase tracking-widest ${exerciseDensity === 'compact' ? 'text-[9px] px-2 py-1' : 'text-[10px] px-2 py-1'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input 
                    type="text" 
                    value={item.sets || ''} 
                    placeholder="0" 
                    onChange={e => updateRoutineItem(item.id, 'sets', e.target.value)} 
                    className="w-5 bg-transparent text-center outline-none focus:bg-white focus:ring-1 focus:ring-indigo-400 rounded transition-colors" 
                    title="Series"
                  />
                  <span className="text-slate-400">×</span>
                  <input 
                    type="text" 
                    value={item.reps || ''} 
                    placeholder="0" 
                    onChange={e => updateRoutineItem(item.id, 'reps', e.target.value)} 
                    className="w-8 bg-transparent text-center outline-none focus:bg-white focus:ring-1 focus:ring-indigo-400 rounded transition-colors" 
                    title="Repeticiones"
                  />
                </div>
              )}
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600">RPE {item.rpe || '0'}</span>
              {item.weight && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">{item.weight}</span>
                </>
              )}
            </div>

            {exerciseDensity !== 'compact' && (
              <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-2 rounded-lg border transition-all duration-200 ${isExpanded ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold opacity-100' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 opacity-0 group-hover:opacity-100'}`}
                    title={isExpanded ? "Colapsar Detalle" : "Ver Detalle / Editar"}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {IS_ACTION_MENU_ENABLED ? (
                    <div className="relative" ref={actionMenuRef}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsActionMenuOpen(!isActionMenuOpen);
                      }}
                      className="p-2 rounded-lg border border-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                      title="Acciones"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {isActionMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] py-1 flex flex-col"
                          // Prevenir que el drag empiece al interactuar con el menú
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setIsActionMenuOpen(false);
                              alert('Abriendo catálogo para reemplazar (V1)...');
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                          >
                            <RefreshCw className="w-4 h-4 text-indigo-500" /> Cambiar Ejercicio (Swap)
                          </button>
                          
                          <div className="h-px bg-slate-100 my-1 mx-2" />
                          
                          <div className="px-4 py-2 relative group">
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                removeRoutineItem(item.id); 
                                setIsActionMenuOpen(false);
                              }}
                              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                            
                            {/* Tooltip de Onboarding para el nuevo botón de eliminar */}
                            <div className="absolute top-1/2 -translate-y-1/2 right-full mr-4 w-48 bg-slate-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none before:absolute before:top-1/2 before:-translate-y-1/2 before:left-full before:-ml-1 before:border-4 before:border-transparent before:border-l-slate-800">
                              El botón de eliminar ha sido movido aquí para evitar clics accidentales y organizar mejor las opciones.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeRoutineItem(item.id); }}
                    className="p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              )}
            </div>

          <AnimatePresence>
            {isExpanded && exerciseDensity !== 'compact' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-slate-100 space-y-4"
              >
                {isHIITBlock ? (
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 text-center">
                    <Target className="w-6 h-6 text-indigo-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-indigo-800 font-bold font-montserrat">Ejercicio Gestionado por Tabata</p>
                    <p className="text-[10px] text-indigo-600/80 mt-1 leading-snug">El tiempo de trabajo y descanso se controla a nivel del circuito. Utiliza un peso ligero o el peso corporal que te permita mantener un ritmo continuo.</p>
                  </div>
                ) : (
                  <>
                    {/* Inputs de Data Tabulation con Grid */}
                    <div className={`grid gap-3 ${IS_BETA_FEATURES_ENABLED ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-8' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'}`}>
                      <div className="flex-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Series</label>
                    <input 
                      id={`${item.id}-sets`}
                      ref={registerCell(item.id, 'sets')}
                      type="text" placeholder="Ej. 4" value={item.sets} onChange={e => updateRoutineItem(item.id, 'sets', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1" title="Repeticiones por serie">Repeticiones</label>
                    <input 
                      id={`${item.id}-reps`}
                      ref={registerCell(item.id, 'reps')}
                      type="text" placeholder="Ej. 8-10" value={item.reps} onChange={e => updateRoutineItem(item.id, 'reps', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1" title="Peso a levantar">Peso (kg)</label>
                    <input 
                      id={`${item.id}-weight`}
                      ref={registerCell(item.id, 'weight')}
                      type="text" placeholder="Ej. 80kg" value={item.weight} onChange={e => updateRoutineItem(item.id, 'weight', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-1 flex items-center gap-0.5" title="Progresión sugerida"><Target className="w-2.5 h-2.5"/> Progresión</label>
                    <input 
                      id={`${item.id}-progression`}
                      ref={registerCell(item.id, 'progression')}
                      type="text" placeholder="+2.5%" value={item.progression || ''} onChange={e => updateRoutineItem(item.id, 'progression', e.target.value)}
                      className="w-full bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`block text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center gap-0.5 ${item.rpe === '7-8' ? 'text-teal-500' : 'text-indigo-500'}`} title="Esfuerzo percibido (Rate of Perceived Exertion)"><Activity className="w-2.5 h-2.5"/> Esfuerzo (RPE)</label>
                    <input 
                      id={`${item.id}-rpe`}
                      ref={registerCell(item.id, 'rpe')}
                      type="text" placeholder="@8" value={item.rpe} onChange={e => updateRoutineItem(item.id, 'rpe', e.target.value)}
                      className={`w-full border rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-black outline-none focus:ring-2 ${item.rpe === '7-8' ? 'bg-teal-50 border-teal-300 text-teal-700 focus:ring-teal-500 shadow-inner' : 'bg-indigo-50 border-indigo-100 text-indigo-700 focus:ring-indigo-500 placeholder:text-indigo-300'}`} 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1" title="Ritmo de ejecución (Excéntrica-Pausa-Concéntrica-Pausa)">Ritmo</label>
                    <input 
                      type="text" placeholder="3-1-1-0" value={item.tempo || ''} onChange={e => updateRoutineItem(item.id, 'tempo', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                  {IS_BETA_FEATURES_ENABLED && (
                    <>
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1" title="Repeticiones en Reserva (Repetitions in Reserve)">Reserva (RIR)</label>
                        <input 
                          type="text" placeholder="Ej. 2" value={item.rir || ''} onChange={e => updateRoutineItem(item.id, 'rir', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1" title="Tiempo de descanso entre series">Descanso (s)</label>
                        <input 
                          type="text" placeholder="Ej. 90" value={item.restTimer || ''} onChange={e => updateRoutineItem(item.id, 'restTimer', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] tracking-tight font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" 
                        />
                      </div>
                    </>
                  )}
                </div>

                    {/* Advanced Sets Matrix Toggle & Matrix */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Configuración Avanzada de Series</span>
                        <button 
                      onClick={() => setShowAdvancedSets(!showAdvancedSets)}
                      className="text-[9px] uppercase font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors bg-white px-2 py-1 rounded border border-slate-200 shadow-sm"
                    >
                      <Layers size={10}/> {showAdvancedSets ? 'Ocultar Matriz' : 'Detallar Series'}
                      {showAdvancedSets ? <ChevronUp size={10}/> : <ChevronDown size={10}/>}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showAdvancedSets && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2 shadow-inner">
                          <div className="grid grid-cols-4 gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-100">
                            <div className="pl-1">Serie</div>
                            <div>Reps</div>
                            <div>Peso</div>
                            <div>RPE</div>
                          </div>
                          {Array.from({ length: parseInt(item.sets, 10) || 1 }).map((_, i) => {
                            const parseDelimited = (str: string) => (str || '').split(/[,/\-\s]+/).filter(Boolean);
                            const sCount = parseInt(item.sets, 10) || 1;
                            
                            const getVal = (str: string, idx: number) => {
                              const arr = parseDelimited(str);
                              return arr[idx] !== undefined ? arr[idx] : (arr[arr.length - 1] || '');
                            };

                            const handleRowChange = (index: number, field: 'reps' | 'weight' | 'rpe', value: string) => {
                              const updateArr = (current: string) => {
                                const arr = parseDelimited(current);
                                while(arr.length < sCount) arr.push(arr[arr.length - 1] || '');
                                arr[index] = value;
                                return arr.join(', ');
                              };
                              updateRoutineItem(item.id, field, updateArr(item[field]));
                            };

                            return (
                              <div key={i} className="grid grid-cols-4 gap-2 items-center">
                                <div className="pl-1 text-xs font-bold text-slate-400">{i + 1}</div>
                                <input 
                                  type="text" 
                                  value={getVal(item.reps, i)} 
                                  onChange={e => handleRowChange(i, 'reps', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 font-mono" 
                                />
                                <input 
                                  type="text" 
                                  value={getVal(item.weight, i)} 
                                  onChange={e => handleRowChange(i, 'weight', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-1 focus:ring-indigo-500 font-mono" 
                                />
                                <input 
                                  type="text" 
                                  value={getVal(item.rpe, i)} 
                                  onChange={e => handleRowChange(i, 'rpe', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-1.5 py-1 text-xs font-black text-indigo-600 outline-none focus:ring-1 focus:ring-indigo-500 font-mono" 
                                />
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                </>
                )}

                {/* Micro-Inputs: Notas, Regla, Historial, Video */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <span className="text-[8px] font-black bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Bio</span>
                    </div>
                    <input 
                      type="text" placeholder="Indicaciones biomecánicas..." value={item.notes || ''} onChange={e => updateRoutineItem(item.id, 'notes', e.target.value)}
                      className="w-full bg-white hover:border-teal-200 border border-slate-200 focus:border-teal-400 rounded-lg pl-[42px] pr-2 py-1.5 text-[10px] font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-colors truncate shadow-sm" 
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <span className="text-[8px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Regla</span>
                    </div>
                    <input 
                      type="text" placeholder="Sobrecarga programada (ej. Doble progresión)" value={item.rpeRule || ''} onChange={e => updateRoutineItem(item.id, 'rpeRule', e.target.value)}
                      className="w-full bg-white hover:border-indigo-200 border border-slate-200 focus:border-indigo-400 rounded-lg pl-[56px] pr-2 py-1.5 text-[10px] font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-colors truncate shadow-sm" 
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm">Hist</span>
                    </div>
                    <input 
                      type="text" placeholder="Rendimiento anterior (ej. 80kg x 8)" value={item.previousSessionHistory || ''} onChange={e => updateRoutineItem(item.id, 'previousSessionHistory', e.target.value)}
                      className="w-full bg-white hover:border-amber-200 border border-slate-200 focus:border-amber-400 rounded-lg pl-[46px] pr-2 py-1.5 text-[10px] font-black text-slate-800 placeholder:text-slate-400 outline-none transition-colors truncate shadow-sm" 
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <span className="text-[8px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm flex items-center gap-0.5"><PlayCircle className="w-2.5 h-2.5"/> Vid</span>
                    </div>
                    <input 
                      type="url" placeholder="Video URL (Ej. YouTube)" value={item.videoUrl || ''} onChange={e => updateRoutineItem(item.id, 'videoUrl', e.target.value)}
                      className="w-full bg-white hover:border-rose-200 border border-slate-200 focus:border-rose-400 rounded-lg pl-[50px] pr-2 py-1.5 text-[10px] font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-colors font-mono truncate shadow-sm" 
                    />
                  </div>
                </div>

                {/* YouTube Video Embed */}
                {item.videoUrl && item.videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/) && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                    <iframe 
                      width="100%" 
                      height="200" 
                      src={`https://www.youtube.com/embed/${item.videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1]}`} 
                      title="Video de Técnica" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      
      {showNegotiationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-6 flex items-start gap-4">
              <div className="bg-amber-500/20 p-2 rounded-full text-amber-600">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 tracking-tight text-lg mb-1">
                  Intervención de Copiloto: Riesgo Biomecánico
                </h3>
                <p className="font-lato text-slate-600 text-sm leading-relaxed">
                  La plantilla automatizada sustituyó <strong>{item.originalExerciseName}</strong> para proteger al atleta según su historial clínico. Forzar este ejercicio incrementa el estrés mecánico bajo fatiga acumulada.
                </p>
              </div>
            </div>
            
            <div className="p-6 space-y-4 bg-slate-50">
              <button 
                onClick={() => setShowNegotiationModal(false)}
                className="w-full text-left p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-start gap-3"
              >
                <div className="mt-0.5 w-4 h-4 rounded-full border-4 border-indigo-500 bg-white shrink-0"></div>
                <div>
                  <div className="font-bold text-indigo-900 text-sm mb-1">Mantener {item.exercise.Nombre_Oficial} (Recomendado)</div>
                  <div className="text-indigo-700/80 text-xs font-lato">Preserva el volumen total programado sin riesgo de compresión. RPE sugerido: 8.</div>
                </div>
              </button>

              <button 
                onClick={() => {
                  setShowNegotiationModal(false);
                  if (revertClinicalSwap) revertClinicalSwap(item.id);
                  // Disparamos sendBeacon asíncrono
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/v1/telemetry/override', JSON.stringify({
                      event: 'flag_manual_override',
                      exerciseId: item.exercise.ID_Ejercicio,
                      timestamp: new Date().toISOString()
                    }));
                  }
                }}
                className="w-full text-left p-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 transition-colors flex items-start gap-3"
              >
                <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-slate-400 bg-white shrink-0"></div>
                <div>
                  <div className="font-bold text-slate-700 text-sm mb-1">Forzar {item.originalExerciseName} Manualmente</div>
                  <div className="text-slate-500 text-xs font-lato">Compromiso: El sistema asume que ajustarás el RPE para mitigar el riesgo.</div>
                </div>
              </button>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button 
                onClick={() => setShowNegotiationModal(false)}
                className="px-6 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar y Volver al Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Custom comparison para memoization extremo: solo re-renderear si el item cambió sus propiedades o la selección.
  // Como `item` muta inmutablemente gracias a Immer, podemos chequear referencias.
  return (
    prev.item === next.item && 
    prev.isSelected === next.isSelected &&
    prev.index === next.index
  );
});

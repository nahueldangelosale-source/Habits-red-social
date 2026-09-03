import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableExerciseCard } from './SortableExerciseCard';
import { SortableBlock } from './SortableBlock';
import { Dumbbell, ChevronDown, ChevronUp, ChevronRight, BatteryWarning, PenTool, Trash2, MoreHorizontal, Copy, Share2, Layers, Eye, EyeOff, Plus, Wand2, Coffee, Zap, Sparkles } from 'lucide-react';
import { usePlanBuilderStore, type WorkoutDay, type RoutineBlock, type RoutineExercise } from '../../stores/usePlanBuilderStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { ACTIVE_PERIODS } from '../../data/modalityColors';
import { generateSmartSingleDay } from '../../utils/routineGeneratorEngine';

interface DroppableDayColumnProps {
  day: WorkoutDay;
  dayNumber?: number;
  isActive: boolean;
  onSetActive: (id: string) => void;
  updateRoutineItem: (dayId: string, id: string, field: string, value: string) => void;
  removeRoutineItem: (dayId: string, id: string) => void;
  revertClinicalSwap: (dayId: string, id: string) => void;
}

export const DroppableDayColumn: React.FC<DroppableDayColumnProps> = ({
  day, dayNumber, isActive, onSetActive, updateRoutineItem, removeRoutineItem, revertClinicalSwap
}) => {
  const navigate = useNavigate();
  const { setNodeRef, isOver } = useDroppable({
    id: day.id,
  });
  
  const { toggleDayCollapse, propagateDay, days, setDayModality, populateSmartDay } = usePlanBuilderStore();
  const goalTags = useOnboardingPTStore(state => state.goalTags);
  const injuries = useOnboardingPTStore(state => state.injuries) || [];
  const [isPropagateOpen, setIsPropagateOpen] = React.useState(false);
  const [showModalityMenu, setShowModalityMenu] = React.useState(false);
  
  const handleModalitySelect = (modalityId: string) => {
    if (!day.primaryModality) {
      setDayModality(day.id, modalityId, day.secondaryModality);
    } else if (day.primaryModality !== modalityId && !day.secondaryModality) {
      setDayModality(day.id, day.primaryModality, modalityId);
    } else if (day.primaryModality === modalityId) {
      setDayModality(day.id, day.secondaryModality || '', undefined);
    } else if (day.secondaryModality === modalityId) {
      setDayModality(day.id, day.primaryModality, undefined);
    } else {
       setDayModality(day.id, day.primaryModality, modalityId);
    }
  };

  // Imported from centralized palette
  const MODALITIES = React.useMemo(() => {
    return ACTIVE_PERIODS.map((p: any) => ({
      id: p.id,
      label: p.label,
      color: p.color.tailwind,
      text: p.color.tailwindText,
    }));
  }, []);

  const primaryConf = MODALITIES.find(m => m.id === day.primaryModality);
  const secondaryConf = MODALITIES.find(m => m.id === day.secondaryModality);

  const totalWeeks = Math.ceil(days.length / 7);
  const currentWeekIndex = dayNumber ? Math.floor((dayNumber - 1) / 7) : 0;

  const totalSets = day.items.reduce((acc, item) => {
    if (item.type === 'BLOCK') {
      return acc + item.items.reduce((bAcc, ex) => bAcc + (parseInt(ex.sets) || 0), 0);
    }
    return acc + (parseInt(item.sets) || 0);
  }, 0);

  const totalExercises = day.items.reduce((acc, item) => {
    if (item.type === 'BLOCK') {
      return acc + item.items.length;
    }
    return acc + 1;
  }, 0);

  // Gather exercise items for collapsed view
  const exerciseItems: { id: string; name: string }[] = [];
  day.items.forEach(item => {
    if (item.type === 'EXERCISE' || !item.type) {
      if (item.exercise?.Nombre_Oficial) {
        exerciseItems.push({ id: item.id, name: item.exercise.Nombre_Oficial });
      }
    } else if (item.type === 'BLOCK' && item.items) {
      item.items.forEach(ex => {
        if (ex.exercise?.Nombre_Oficial) {
          exerciseItems.push({ id: ex.id, name: ex.exercise.Nombre_Oficial });
        }
      });
    }
  });
  const displayedExercises = exerciseItems.length > 0 ? exerciseItems.slice(0, 4).map(e => e.name).join(', ') + (exerciseItems.length > 4 ? ', ...' : '') : '';

  return (
    <div 
      ref={setNodeRef}
      onClick={() => onSetActive(day.id)}
      className={`w-full flex flex-col bg-white border border-slate-200 shadow-sm rounded-3xl p-3 mb-4 transition-all cursor-pointer ${isActive ? 'ring-2 ring-indigo-400 bg-indigo-50/10' : isOver ? 'bg-indigo-50/20 border-indigo-300' : 'hover:border-slate-300 hover:shadow-md'}`}
    >
      {/* Total Sets Indicator */}
      {totalSets > 0 && (
        <div className="px-4 pt-2 mb-1 flex justify-end">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {totalSets} Series Totales
          </span>
        </div>
      )}

      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => {
               e.stopPropagation();
               toggleDayCollapse(day.id);
            }}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${day.isCollapsed ? 'hover:bg-slate-200/50 text-slate-500' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 shadow-sm text-[9px] font-bold uppercase tracking-wider'}`}
            title={day.isCollapsed ? 'Expandir' : 'Ocultar Día'}
          >
            {day.isCollapsed ? <ChevronRight className="w-5 h-5 text-slate-500" /> : <><ChevronUp className="w-4 h-4 text-slate-500" /> Ocultar</>}
          </button>
          <div className="flex flex-col flex-1 min-w-0 relative">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex flex-wrap items-center gap-1">
                {dayNumber && <span className="text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][(dayNumber - 1) % 7]}</span>}
                {!dayNumber && day.name}
                {dayNumber && <span className="text-slate-400 font-medium normal-case tracking-normal ml-0.5">(Semana {Math.ceil(dayNumber / 7)})</span>}
              </span>
              {!day.primaryModality && day.items.length === 0 && (
                <span className="text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Descanso
                </span>
              )}
            </div>
            <input 
              type="text"
              value={day.customName ?? day.name ?? ''}
              onChange={(e) => usePlanBuilderStore.getState().updateDayName(day.id, e.target.value)}
              className="font-heading font-extrabold text-slate-800 bg-transparent outline-none w-full border-b border-transparent focus:border-indigo-400 hover:border-slate-200 transition-colors py-0.5 rounded-sm placeholder:font-medium placeholder:text-slate-300 truncate"
              placeholder={day.name || "Nombre del Día (ej. Torso A)"}
            />
            {/* Split Pill Selector */}
            <div className="relative mt-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowModalityMenu(!showModalityMenu); }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-widest hover:shadow-sm transition-all overflow-hidden ${!primaryConf ? 'border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500' : 'border-slate-200 bg-white shadow-sm'}`}
              >
                {!primaryConf ? (
                  <>
                    <Plus size={10} /> Modalidad
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 w-full">
                    <div className="flex -space-x-1">
                       <div className={`w-2 h-2 rounded-full ${primaryConf.color} z-10`} />
                       {secondaryConf && <div className={`w-2 h-2 rounded-full ${secondaryConf.color} z-0`} />}
                    </div>
                    <span className="text-slate-700 truncate max-w-[100px]">
                      {primaryConf.label} {secondaryConf && `/ ${secondaryConf.label}`}
                    </span>
                  </div>
                )}
              </button>
              
              {showModalityMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-[100] w-48 animate-in fade-in slide-in-from-top-2">
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Seleccionar (Hasta 2)</div>
                   <div className="flex flex-col gap-1">
                      {MODALITIES.map(m => {
                        const isPrimary = day.primaryModality === m.id;
                        const isSecondary = day.secondaryModality === m.id;
                        const isSelected = isPrimary || isSecondary;
                        
                        return (
                          <button
                            key={m.id}
                            onClick={(e) => { e.stopPropagation(); handleModalitySelect(m.id); }}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-2">
                               <div className={`w-2.5 h-2.5 rounded-full ${m.color}`} />
                               <span className={isSelected ? 'text-slate-800' : 'text-slate-500'}>{m.label}</span>
                            </div>
                            {isPrimary && <span className="text-[8px] uppercase tracking-widest text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Pri</span>}
                            {isSecondary && <span className="text-[8px] uppercase tracking-widest text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Sec</span>}
                          </button>
                        );
                      })}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-1 rounded-lg animate-in fade-in">
              Activo
            </span>
          )}
            {/* Day Options */}
          <div className="relative group">
            
            {/* Visibility Toggle (Draft / Published) */}
            <button 
              onClick={(e) => { e.stopPropagation(); usePlanBuilderStore.getState().toggleDayVisibility(day.id); }}
              className="p-1.5 hover:bg-slate-300/50 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors opacity-0 invisible group-hover:opacity-100 group-hover:visible"
              title={day.visibility === 'draft' ? 'Publicar Día' : 'Ocultar Día (Borrador)'}
            >
              {day.visibility === 'draft' ? <EyeOff className="w-5 h-5 text-amber-500" /> : <Eye className="w-5 h-5 text-emerald-500" />}
            </button>

            {/* Propagation (Clonado Inteligente) */}
            {totalWeeks > 1 && (
              <div className="relative inline-block mr-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsPropagateOpen(!isPropagateOpen); }}
                  className="p-1.5 hover:bg-slate-300/50 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                  title="Propagar a otras semanas"
                >
                  <Layers className="w-5 h-5" />
                </button>

                {isPropagateOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Propagar Día a:</span>
                    </div>
                    <div className="flex flex-col max-h-40 overflow-y-auto">
                      {Array.from({ length: totalWeeks }).map((_, weekIdx) => {
                        if (weekIdx === currentWeekIndex) return null;
                        return (
                          <button
                            key={weekIdx}
                            onClick={() => {
                              propagateDay(day.id, [weekIdx]);
                              setIsPropagateOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            Semana {weekIdx + 1}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => {
                          const targetIndices = Array.from({ length: totalWeeks }).map((_, i) => i).filter(i => i !== currentWeekIndex);
                          propagateDay(day.id, targetIndices);
                          setIsPropagateOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-100 transition-colors border-t border-slate-100"
                      >
                        Todas las Semanas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={(e) => { e.stopPropagation(); setIsPropagateOpen(false); }}
              className="p-1.5 hover:bg-slate-300/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/plan-builder');
                }}
                className="w-full text-left px-4 py-2.5 text-[11px] font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition-colors"
              >
                <PenTool className="w-3.5 h-3.5 text-indigo-400" /> EDITAR DÍA
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="w-full text-left px-4 py-2.5 text-[11px] font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" /> DUPLICAR
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="w-full text-left px-4 py-2.5 text-[11px] font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 border-b border-slate-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" /> COMPARTIR
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {day.isCollapsed ? (
        <div className="flex-1 px-4 py-4 flex flex-col items-center opacity-80 text-center">
          {displayedExercises ? (
            <div className="flex flex-col gap-1.5 w-full mt-2">
              {exerciseItems.slice(0, 4).map((exItem) => (
                <div key={exItem.id} className="group relative bg-white/60 border border-slate-300 text-slate-600 text-[10px] font-bold px-2 py-1.5 rounded-lg truncate w-full shadow-sm hover:bg-white transition-colors flex items-center justify-between">
                  <span className="truncate pr-12">{exItem.name}</span>
                  <div className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-gradient-to-l from-white via-white to-transparent pl-4 pr-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDayCollapse(day.id);
                      }}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-500 rounded"
                      title="Editar / Reemplazar (Abrir Detalle)"
                    >
                      <PenTool size={11} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoutineItem(day.id, exItem.id);
                      }}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"
                      title="Eliminar"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
              {exerciseItems.length > 4 && (
                <span className="text-[10px] font-bold text-slate-400 mt-1">
                  + {exerciseItems.length - 4} más...
                </span>
              )}
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col items-center gap-2 w-full">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{totalSets} Series Totales</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDayCollapse(day.id);
                    onSetActive(day.id);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold py-1.5 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <ChevronDown className="w-3 h-3" /> Mostrar Ejercicios
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-60 group-hover:opacity-100 transition-opacity pt-4 pb-2">
               <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 shadow-sm border border-slate-100">
                 <Wand2 className="w-5 h-5 text-indigo-300 group-hover:text-indigo-400 transition-colors" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lienzo en Blanco</span>
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   toggleDayCollapse(day.id);
                   onSetActive(day.id);
                 }}
                 className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 font-bold py-1.5 rounded-lg text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm"
               >
                 <Plus className="w-3 h-3" /> Agregar Ejercicios
               </button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-2 pb-2 space-y-3">
          <SortableContext items={day.items.map(r => r.id)} strategy={verticalListSortingStrategy}>
            {day.items.map((item, index) => {
              if (item.type === 'BLOCK') {
                return <SortableBlock key={item.id} block={item as RoutineBlock} dayId={day.id} />;
              } else {
                return (
                  <SortableExerciseCard 
                    key={item.id}
                    item={item as RoutineExercise}
                    index={index}
                    isSelected={false}
                    phaseColor={primaryConf?.color}
                    onToggleSelect={() => {}}
                    updateRoutineItem={(id, field, value) => updateRoutineItem(day.id, id, field as any, value)}
                    removeRoutineItem={(id) => removeRoutineItem(day.id, id)}
                    revertClinicalSwap={(id) => revertClinicalSwap(day.id, id)}
                    registerCell={() => () => {}}
                  />
                );
              }
            })}
          </SortableContext>
          {day.items.length === 0 && (
            <div className={`text-center py-8 px-3 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[140px] transition-colors ${isOver ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-white/50 hover:border-indigo-300'}`}>
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-indigo-100">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              </div>
              <p className="text-xs text-slate-800 font-heading font-extrabold uppercase tracking-wider">Día Vacío</p>
              <p className="text-[11px] text-slate-500 mt-1 mb-3 px-2 leading-snug">Arrastra ejercicios o genera la sesión científicamente en 1 clic.</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const goal = goalTags?.[0] || 'HIPERTROFIA';
                  const generated = generateSmartSingleDay(day.name, (dayNumber || 1) - 1, days.length, {
                    goal,
                    daysCount: days.length,
                    injuries: injuries as string[]
                  });
                  populateSmartDay(day.id, generated.items);
                }}
                className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold font-montserrat shadow-md shadow-indigo-200/50 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Zap size={13} className="text-amber-300 fill-amber-300" />
                <span>Auto-Poblar este Día</span>
              </button>
            </div>
          )}


        </div>
      )}
    </div>
  );
};

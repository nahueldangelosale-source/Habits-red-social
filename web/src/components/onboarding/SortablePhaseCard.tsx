import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, Archive, Trash2, GripVertical, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { getPeriodConfig } from '../../data/modalityColors';

interface SortablePhaseCardProps {
  phase: any;
  isActive: boolean;
  isEditing: boolean;
  daysCount: number;
  setActivePhaseId: (id: string | null) => void;
  updatePhase: (id: string, updates: any) => void;
  removePhase: (id: string) => void;
  toast: any;
}

export const SortablePhaseCard = ({
  phase,
  isActive,
  isEditing,
  daysCount,
  setActivePhaseId,
  updatePhase,
  removePhase,
  toast
}: SortablePhaseCardProps) => {
  const phaseConfig = getPeriodConfig(phase.modality);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: phase.id,
    data: {
      type: 'phase',
      phase,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform) + (isDragging ? ' scale(0.98) rotate(2deg)' : ''),
    transition,
    zIndex: isDragging ? 50 : isActive ? 10 : 1,
    opacity: isDragging ? 0.95 : 1,
    ...(isDragging ? { boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)' } : {})
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => setActivePhaseId(phase.id)}
      className={`relative group snap-start shrink-0 flex flex-col justify-between p-3 rounded-2xl cursor-pointer transition-all border-2 overflow-hidden w-64 ${isActive ? 'border-indigo-400 bg-white shadow-md scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'}`}
    >
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: phaseConfig?.color.bg || '#94a3b8' }} />
      <div className="flex items-center gap-2 mb-2">
        <div {...listeners} className="cursor-grab hover:text-indigo-600 text-slate-300 -ml-1 py-1 mr-1">
            <GripVertical className="w-4 h-4" />
        </div>
        <span className="text-xl drop-shadow-sm">{phaseConfig?.emoji}</span>
        <div className="flex flex-col">
          {isEditing && isActive ? (
            <input 
              type="text"
              value={phase.name}
              onChange={(e) => updatePhase(phase.id, { name: e.target.value })}
              className="text-sm font-black text-slate-800 bg-transparent border-b border-indigo-300 outline-none w-full"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 className={`text-sm font-black truncate max-w-[140px] ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
              {phase.name}
            </h4>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 mt-auto">
      {isEditing && isActive ? (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1">
            <input type="number" min="1" max="52" value={phase.weeksCount || 1} onChange={(e) => updatePhase(phase.id, { weeksCount: parseInt(e.target.value) || 1 })} className="w-12 px-1 py-0.5 text-xs font-bold bg-slate-100 rounded text-center" onClick={(e) => e.stopPropagation()} />
            <span className="text-[10px] font-medium text-slate-500 uppercase">sem</span>
          </label>
          <label className="flex items-center gap-1">
            <input type="number" min="1" max="7" value={phase.frequency} onChange={(e) => updatePhase(phase.id, { frequency: parseInt(e.target.value) || 1 })} className="w-10 px-1 py-0.5 text-xs font-bold bg-slate-100 rounded text-center" onClick={(e) => e.stopPropagation()} />
            <span className="text-[10px] font-medium text-slate-500 uppercase">días/sem</span>
          </label>
        </div>
      ) : (
        <>
          <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded-md flex items-center gap-1 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'bg-white text-slate-600'}`}>
            <CalendarDays className="w-3 h-3" /> {phase.weeksCount || 1} SEMANAS
          </span>
          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${isActive ? 'bg-indigo-50/50 text-indigo-500' : 'bg-transparent text-slate-400'}`}>
            {phase.frequency} DÍAS/SEM
          </span>
        </>
      )}
      
      {!isEditing && (
        <span className={`text-[10px] uppercase font-bold ml-1 px-2 py-0.5 rounded-full ${isActive ? 'bg-black/20 text-current' : 'bg-slate-100 text-slate-400'}`} title="Días creados en esta fase">
          {daysCount} DÍAS
        </span>
      )}
      </div>
      {isActive && !isEditing && (
        <div className="absolute right-2 top-2 flex items-center gap-0.5 z-10 bg-white/90 p-0.5 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast('Cargar Bloque (Próximamente)', { icon: '⬇️' });
            }}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-all"
            title="Cargar Bloque Guardado"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.success('Bloque guardado en la biblioteca (Próximamente)');
            }}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
            title="Guardar Bloque en Mi Biblioteca"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePhase(phase.id);
            }}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-all"
            title="Eliminar bloque"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

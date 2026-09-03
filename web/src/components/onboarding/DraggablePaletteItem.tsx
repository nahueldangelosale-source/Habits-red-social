import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Plus, Pin, GripVertical } from 'lucide-react';
import type { ExerciseTaxonomy } from '../../data/exercisesData';

interface DraggablePaletteItemProps {
  exercise: ExerciseTaxonomy;
  onQuickInject: (ex: ExerciseTaxonomy) => void;
}

export const DraggablePaletteItem: React.FC<DraggablePaletteItemProps> = ({ exercise, onQuickInject }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${exercise.ID_Ejercicio}`,
    data: {
      type: 'palette-item',
      exercise
    }
  });

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onDoubleClick={(e) => { e.stopPropagation(); onQuickInject(exercise); }}
      className={`bg-white border-b border-slate-100 py-2 px-2 hover:bg-slate-50 transition-all cursor-grab group flex items-center justify-between ${isDragging ? 'opacity-75 scale-[0.98] shadow-lg border border-indigo-400 z-50 relative rounded-lg' : ''}`}
    >
      <div className="flex items-center gap-2 overflow-hidden w-full">
        <div className="text-slate-300 group-hover:text-indigo-400 cursor-grab shrink-0">
          <GripVertical size={14} />
        </div>
        {exercise.Url_Miniatura_Youtube ? (
          <div className="relative group/thumb shrink-0 z-10">
            <img 
              src={exercise.Url_Miniatura_Youtube} 
              alt={exercise.Nombre_Oficial}
              className="w-7 h-7 object-cover rounded border border-slate-200/50 group-hover:border-indigo-300 transition-colors cursor-pointer"
            />
            {/* Popover miniatura expandida */}
            <div className="absolute left-9 top-1/2 -translate-y-1/2 hidden group-hover/thumb:block w-48 bg-white p-1 rounded-xl shadow-2xl border border-slate-200 z-[100] pointer-events-none animate-in fade-in zoom-in-95 duration-100">
              <img 
                src={exercise.Url_Miniatura_Youtube} 
                alt="Expandido" 
                className="w-full h-auto rounded-lg object-cover aspect-video"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end p-2">
                <span className="text-white text-[9px] font-bold truncate">{exercise.Nombre_Oficial}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-7 h-7 bg-slate-100 text-[10px] font-black text-slate-500 rounded flex items-center justify-center shrink-0 border border-slate-200/50 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors uppercase">
            {exercise.Nombre_Oficial.substring(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <h4 className="text-[11px] font-bold text-slate-700 truncate leading-tight group-hover:text-indigo-900 transition-colors">{exercise.Nombre_Oficial}</h4>
          <p className="text-[9px] text-slate-400 truncate leading-none mt-0.5">{exercise.Musculo_Agonista}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
        <button 
          onPointerDown={(e) => { e.stopPropagation(); onQuickInject(exercise); }}
          className="bg-indigo-50 text-indigo-600 p-1 rounded hover:bg-indigo-100"
          title="Doble clic para añadir rápido"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

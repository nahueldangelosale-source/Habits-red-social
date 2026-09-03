import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Plus, Pin, GripVertical, Layers } from 'lucide-react';

interface DraggableBlockPaletteItemProps {
  block: any;
  onQuickInject?: (block: any) => void;
  onClick?: (block: any) => void;
}

export const DraggableBlockPaletteItem: React.FC<DraggableBlockPaletteItemProps> = ({ block, onQuickInject, onClick }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-block-${block.id}`,
    data: {
      type: 'palette-block',
      block
    }
  });

  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only trigger if we haven't dragged
        if (!isDragging && onClick) onClick(block);
      }}
      className={`bg-white border border-slate-200 p-3 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all cursor-grab group flex items-center justify-between ${isDragging ? 'opacity-50 scale-95 shadow-none border-indigo-400 border-dashed bg-indigo-50/50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-slate-300 group-hover:text-slate-400 cursor-grab">
          <GripVertical size={16} />
        </div>
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-indigo-400" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 leading-tight">{block.name}</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">{block.items?.length || 0} ejercicios • {block.description || 'Bloque compuesto'}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onQuickInject && (
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onQuickInject(block); }}
            className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-100"
            title="Inyectar al día activo"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

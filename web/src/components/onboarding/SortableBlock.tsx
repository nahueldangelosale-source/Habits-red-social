import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, Layers, Copy, Trash2, Edit2, Sparkles } from 'lucide-react';
import type { RoutineBlock } from '../../stores/usePlanBuilderStore';
import { SortableExerciseCard } from './SortableExerciseCard';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { HIITBlockEditor } from './HIITBlockEditor';

interface SortableBlockProps {
  block: RoutineBlock;
  dayId: string;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ block, dayId }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      type: 'BLOCK',
      block
    }
  });

  const { toggleBlockCollapse, updateRoutineItem, removeRoutineItem, revertClinicalSwap } = usePlanBuilderStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBlockCollapse(dayId, block.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-100/50 border-2 border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-300 ${isDragging ? 'shadow-2xl border-indigo-400 scale-105 ring-4 ring-indigo-500/20' : 'hover:border-slate-300'}`}
    >
      {/* Block Header (Ancla) */}
      <div 
        {...attributes} 
        {...listeners}
        className={`px-4 py-3 flex items-start justify-between cursor-grab active:cursor-grabbing transition-colors ${block.description ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 hover:from-indigo-100/80 hover:to-purple-100/80' : 'bg-slate-200/80 hover:bg-slate-300/50'}`}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            {block.description ? <Sparkles className="w-4 h-4 text-indigo-500" /> : <Layers className="w-4 h-4 text-slate-500" />}
            <h4 className={`font-bold text-sm tracking-tight font-montserrat ${block.description ? 'text-indigo-900' : 'text-slate-800'}`}>{block.name}</h4>
          </div>
          {block.description && (
            <p className="text-[10px] text-indigo-600/80 font-medium pl-6 leading-tight max-w-[280px]">
              {block.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3 mt-0.5" onPointerDown={(e) => e.stopPropagation()}>
          {/* Dimmer de Intensidad (Zero-AI RPE Slider) */}
          <div className="group relative flex items-center gap-2 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-md border border-slate-200/50 hover:border-indigo-300 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 font-montserrat transition-colors">RPE</span>
            <input 
              type="range" 
              min="1" max="10" 
              value={block.rpe ?? 6}
              onChange={(e) => updateRoutineItem(dayId, block.id, 'rpe', parseInt(e.target.value))}
              className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-600 transition-all"
            />
            <span className="text-[10px] font-black text-slate-700 w-3 text-center font-montserrat">{block.rpe ?? 6}</span>
            {/* Tooltip Lato */}
            <div className="absolute top-full right-0 mt-2 w-32 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 font-lato whitespace-nowrap text-center">
              Intensidad: Nivel {block.rpe ?? 6}
            </div>
          </div>

          <button 
            onClick={handleToggle}
            className={`p-1.5 rounded-lg transition-all ${block.description ? 'text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300'}`}
          >
            {block.isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor de Alta Intensidad (EMOM/TABATA) */}
      {!block.isCollapsed && block.blockType && block.blockType !== 'STANDARD' && (
        <HIITBlockEditor block={block} dayId={dayId} />
      )}

      {/* Block Content (Exercises) */}
      <AnimatePresence initial={false}>
        {!block.isCollapsed && (
          <motion.div 
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-2 bg-slate-50/50">
              <SortableContext items={block.items.map(r => r.id)} strategy={verticalListSortingStrategy}>
                {block.items.map((item, index) => (
                  <SortableExerciseCard
                    key={item.id}
                    item={item}
                    index={index}
                    isSelected={false}
                    onToggleSelect={() => {}}
                    updateRoutineItem={(id, field, value) => updateRoutineItem(dayId, id, field as any, value)}
                    removeRoutineItem={(id) => removeRoutineItem(dayId, id)}
                    revertClinicalSwap={(id) => revertClinicalSwap(dayId, id)}
                    isHIITBlock={block.blockType && block.blockType !== 'STANDARD'}
                    registerCell={() => () => {}}
                  />
                ))}
              </SortableContext>
              {block.items.length === 0 && (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">Bloque vacío</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Macro View inside Block when collapsed */}
      <AnimatePresence initial={false}>
        {block.isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-2 bg-white flex items-center justify-between border-t border-slate-200 overflow-hidden"
          >
            <div className="text-xs text-slate-500 font-bold">
              {block.items.length} {block.items.length === 1 ? 'Ejercicio' : 'Ejercicios'}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {block.items.reduce((acc, curr) => acc + (parseInt(curr.sets) || 0), 0)} Series totales
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

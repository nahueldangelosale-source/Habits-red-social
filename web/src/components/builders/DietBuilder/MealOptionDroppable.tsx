import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { MealOption, MealItem } from '../../../schemas/nutritionPlanSchema';
import { GripVertical, Trash2 } from 'lucide-react';
import { useNaaSCanvasStore } from '../../../stores/useNaaSCanvasStore';

interface MealOptionDroppableProps {
  blockId: string;
  option: MealOption;
  optionIndex: number;
}

export const MealOptionDroppable: React.FC<MealOptionDroppableProps> = ({ blockId, option, optionIndex }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-option-${option.id}`,
    data: {
      type: 'MEAL_OPTION',
      blockId,
      optionId: option.id
    }
  });

  const updateItemPortion = useNaaSCanvasStore(state => state.updateItemPortion);
  
  // Letra de la opción basada en el índice (A, B, C...)
  const optionLabel = String.fromCharCode(65 + optionIndex);

  return (
    <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <h4 className="font-montserrat font-semibold text-slate-700 text-sm">Opción {optionLabel}</h4>
        {option.custom_label && (
          <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">
            {option.custom_label}
          </span>
        )}
      </div>
      
      <div 
        ref={setNodeRef}
        className={`p-4 min-h-[120px] transition-colors ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-400' : 'bg-transparent border-2 border-transparent'}`}
      >
        {(!option.items || option.items.length === 0) ? (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm font-lato italic pointer-events-none">
            {isOver ? 'Suelta el alimento aquí' : 'Arrastra un alimento aquí para establecer tu pauta'}
          </div>
        ) : (
          <div className="space-y-2">
            {option.items.map((item: MealItem) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded p-3 flex items-center gap-3 shadow-sm group">
                <GripVertical className="text-slate-300 cursor-grab" size={16} />
                
                <div className="flex-1">
                  <h5 className="font-montserrat font-medium text-sm text-slate-800">{item.name}</h5>
                  <div className="flex gap-2 text-xs text-slate-500 mt-1">
                    <span className="text-red-600">P: {item.macros.protein_g}g</span>
                    <span className="text-blue-600">C: {item.macros.carbs_g}g</span>
                    <span className="text-amber-600">G: {item.macros.fat_g}g</span>
                    <span className="text-slate-600 font-semibold">{item.macros.calories} kcal</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input 
                      type="number"
                      className="w-20 text-right pr-6 pl-2 py-1 border border-slate-300 rounded text-sm font-lato focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={item.portion_amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) {
                          updateItemPortion(blockId, option.id, item.id, val);
                        }
                      }}
                    />
                    <span className="absolute right-2 top-1.5 text-slate-400 text-xs">{item.portion_unit}</span>
                  </div>
                  
                  <button className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

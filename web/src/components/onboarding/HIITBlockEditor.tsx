import React from 'react';
import { Clock, RefreshCcw, Zap, Target } from 'lucide-react';
import type { RoutineBlock } from '../../stores/usePlanBuilderStore';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';

interface HIITBlockEditorProps {
  block: RoutineBlock;
  dayId: string;
}

export const HIITBlockEditor: React.FC<HIITBlockEditorProps> = ({ block, dayId }) => {
  const { updateRoutineItem } = usePlanBuilderStore();

  const handleUpdate = (field: string, value: any) => {
    updateRoutineItem(dayId, block.id, field, value);
  };

  const blockType = block.blockType || 'TABATA';
  const workTime = block.workTime || 20;
  const restTime = block.restTime || 10;
  const rounds = block.rounds || 8;

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Type Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <Target size={12} /> Modalidad
          </label>
          <div className="relative">
            <select
              value={blockType}
              onChange={(e) => handleUpdate('blockType', e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 appearance-none"
            >
              <option value="TABATA">Tabata</option>
              <option value="EMOM">EMOM</option>
              <option value="AMRAP">AMRAP</option>
              <option value="CIRCUIT">Circuito Fijo</option>
            </select>
          </div>
        </div>

        {/* Work Time (Red) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-rose-500 tracking-wider flex items-center gap-1">
            <Zap size={12} /> Trabajo (seg)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="5"
              max="600"
              step="5"
              value={workTime}
              onChange={(e) => handleUpdate('workTime', parseInt(e.target.value) || 0)}
              className="w-full bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        {/* Rest Time (Blue) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-blue-500 tracking-wider flex items-center gap-1">
            <Clock size={12} /> Descanso (seg)
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              max="600"
              step="5"
              value={restTime}
              onChange={(e) => handleUpdate('restTime', parseInt(e.target.value) || 0)}
              className="w-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Rounds */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
            <RefreshCcw size={12} /> Rondas
          </label>
          <div className="relative flex items-center">
            <input
              type="number"
              min="1"
              max="50"
              value={rounds}
              onChange={(e) => handleUpdate('rounds', parseInt(e.target.value) || 1)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

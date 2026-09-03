import React, { useState } from 'react';

export default function ReviewKanban({ onSelectRoutine }: { onSelectRoutine: (id: string) => void }) {
  // Mock data for the kanban
  const pendingRoutines = [
    {
      id: "rout_1",
      athleteName: "Alex Mercer",
      archetype: "ARQ_02_UPPER_LOWER",
      biomechanicalRisk: "Alto (inj_lower_back)",
      date: "2026-03-17"
    },
    {
      id: "rout_2",
      athleteName: "Sarah Connor",
      archetype: "ARQ_08_METABOLIC_FAT_LOSS",
      biomechanicalRisk: "Bajo (inj_none)",
      date: "2026-03-17"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-black text-zinc-100 p-6 font-mono">
      <h2 className="text-2xl font-bold mb-6 text-emerald-400">REVIEW KANBAN (HITL)</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {/* PENDING COLUMN */}
        <div className="w-80 flex flex-col gap-4">
          <div className="flex justify-between items-center text-zinc-400 mb-2 border-b border-zinc-800 pb-2">
            <span>PENDING APPROVAL</span>
            <span className="bg-zinc-800 text-xs px-2 py-1 rounded-full">{pendingRoutines.length}</span>
          </div>
          
          {pendingRoutines.map(routine => (
            <div 
              key={routine.id}
              onClick={() => onSelectRoutine(routine.id)}
              className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-4 rounded-lg cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-bold text-lg text-white">{routine.athleteName}</span>
                <span className="text-xs text-zinc-500">{routine.date}</span>
              </div>
              <div className="text-sm text-zinc-400 mb-2">
                <span className="text-zinc-600">ARCHETYPE:</span> {routine.archetype}
              </div>
              <div className="text-sm">
                <span className="text-zinc-600">RISK:</span>{' '}
                <span className={routine.biomechanicalRisk.includes('Alto') ? 'text-red-400' : 'text-emerald-400'}>
                  {routine.biomechanicalRisk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

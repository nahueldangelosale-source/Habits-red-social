import React, { useState } from 'react';

export default function RoutineArtifactEditor({ routineId, onBack }: { routineId: string, onBack: () => void }) {
  const [showSwapModal, setShowSwapModal] = useState(false);

  return (
    <div className="flex flex-col h-full bg-black text-zinc-100 p-6 font-mono">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors">
          ← BACK TO KANBAN
        </button>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-6 rounded transition-colors">
          APROBAR Y DESPLEGAR
        </button>
      </div>

      <div className="flex gap-6 h-full">
        {/* Routine Structure */}
        <div className="flex-1 overflow-y-auto pr-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">ROUTINE ARTIFACT: {routineId}</h2>
            <div className="text-sm text-red-400 mb-4 bg-red-950/20 p-2 border border-red-900 rounded">
              ⚠️ HARD CONSTRAINTS: [inj_lower_back] (CARGA AXIAL PROHIBIDA)
            </div>
          </div>

          {/* Day 1 Mock */}
          <div className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
              <h3 className="text-lg font-bold text-emerald-400">DAY 1: FULL BODY ADAPTIVE</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="bg-black border border-zinc-800 p-4 rounded flex justify-between items-center group cursor-grab">
                <div>
                  <div className="font-bold text-white">Kettlebell Deadbug</div>
                  <div className="text-sm text-zinc-500">3 sets x 12/side | Mantenener core estabilizado</div>
                </div>
                <button 
                  onClick={() => setShowSwapModal(true)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 border border-blue-900 bg-blue-950/30 px-3 py-1 rounded transition-opacity"
                >
                  SWAP EXERCISE
                </button>
              </div>

              <div className="bg-black border border-zinc-800 p-4 rounded flex justify-between items-center group cursor-grab">
                <div>
                  <div className="font-bold text-white">Bulgarian Split Squat</div>
                  <div className="text-sm text-zinc-500">4 sets x 10/leg | RIR 2</div>
                </div>
                <button 
                  onClick={() => setShowSwapModal(true)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 border border-blue-900 bg-blue-950/30 px-3 py-1 rounded transition-opacity"
                >
                  SWAP EXERCISE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-80 bg-zinc-950/80 border border-zinc-800 rounded-lg p-6 max-h-[300px]">
          <h3 className="text-lg font-bold text-zinc-400 mb-4">AI METRICS</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-zinc-600">CONFIDENCE SCORE:</span>
              <div className="text-emerald-400 text-xl font-bold mt-1">98.5%</div>
            </div>
            <div>
              <span className="text-zinc-600">EST. DAILY CALORIES:</span>
              <div className="text-white mt-1">2,300 kcal</div>
            </div>
            <div>
              <span className="text-zinc-600">CYCLE DURATION:</span>
              <div className="text-white mt-1">12 Weeks</div>
            </div>
          </div>
        </div>
      </div>

      {showSwapModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">GRAPH-RAG CATALOG SEARCH</h2>
              <button onClick={() => setShowSwapModal(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            <div className="mb-4 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900 p-2 rounded">
              ✅ Pruning Active: Axial Load exercises excluded automatically for [inj_lower_back]
            </div>
            <input 
              type="text" 
              placeholder="Search specific exercises..."
              className="w-full bg-black border border-zinc-800 text-white p-3 rounded mb-4 focus:outline-none focus:border-emerald-500"
            />
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-transparent hover:border-emerald-500/50 cursor-pointer rounded text-zinc-300">
                Dumbbell Goblet Squat (SQUAT_003)
              </div>
              <div className="p-3 bg-zinc-900/50 hover:bg-zinc-800 border border-transparent hover:border-emerald-500/50 cursor-pointer rounded text-zinc-300">
                Leg Press (SQUAT_004)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

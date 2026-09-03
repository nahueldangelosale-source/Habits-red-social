import React, { useState } from 'react';

export default function ArchetypeStudio() {
  const [archetypes] = useState([
    { id: "ARQ_01_BUSY_PRO", name: "Ejecutivo Ocupado / Recomposición", days: "3", goal: "Pérdida de Grasa, Salud General" },
    { id: "ARQ_02_UPPER_LOWER", name: "Arquitectura Base / Fuerza Estructural", days: "4", goal: "Hipertrofia Funcional" },
  ]);

  return (
    <div className="flex flex-col h-full bg-black text-zinc-100 p-6 font-mono">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-emerald-400">ARCHETYPE STUDIO</h2>
        <button className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-4 border border-zinc-600 rounded transition-colors">
          + CREATE CUSTOM ARCHETYPE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archetypes.map(ark => (
          <div key={ark.id} className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-zinc-500">{ark.id}</span>
                <span className="bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-300">Global</span>
              </div>
              <h3 className="text-lg font-bold mb-4 text-white">{ark.name}</h3>
              <div className="space-y-2 mb-6">
                <p className="text-sm"><span className="text-zinc-600">TRAINING DAYS:</span> {ark.days}</p>
                <p className="text-sm"><span className="text-zinc-600">PRIMARY GOAL:</span> {ark.goal}</p>
              </div>
            </div>
            
            <button className="w-full py-2 border border-emerald-900 text-emerald-400 hover:bg-emerald-950/30 rounded transition-colors text-sm font-bold">
              CLONAR Y EDITAR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

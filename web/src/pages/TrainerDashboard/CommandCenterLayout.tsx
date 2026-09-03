import React from 'react';
import { RetentionRadarList } from '../../components/dashboard/RetentionRadarList';
import { ValidationTinderDeck } from '../../components/dashboard/ValidationTinderDeck';
import { Stethoscope, Radar, ArrowLeft } from 'lucide-react';

export const CommandCenterLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-clinical-bg flex font-sans text-clinical-text">
      {/* Tercio Izquierdo: Eje del Riesgo (Retention Radar) */}
      <aside className="w-1/3 max-w-md bg-clinical-surface shadow-clinical flex flex-col z-10 border-r border-slate-200">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-black text-2xl tracking-tighter text-slate-800 flex items-center gap-2">
              <Radar className="text-clinical-accent" size={24} />
              Command_Center
            </h2>
            <p className="font-sans text-xs uppercase tracking-widest text-clinical-muted font-bold mt-1">
              Modo Soberanía Clínica
            </p>
          </div>
          <button className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full transition-colors">
             <ArrowLeft size={20} />
          </button>
        </header>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-heading font-bold text-sm text-slate-400 uppercase tracking-widest">
               Retention Radar
             </h3>
             <span className="bg-risk-high/10 text-risk-high text-xs font-black px-2 py-1 rounded-full uppercase tracking-wider">
               2 Riesgos Altos
             </span>
          </div>
          <RetentionRadarList />
        </div>
      </aside>

      {/* Dos Tercios Centrales/Derechos: Escenario de Acción (Validation Tinder) */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden bg-clinical-bg">
        <div className="absolute top-8 right-8 flex items-center gap-3 bg-clinical-surface px-4 py-2 rounded-xl shadow-clinical border border-slate-200">
           <Stethoscope size={18} className="text-clinical-accent" />
           <div>
              <p className="text-xs uppercase tracking-widest font-bold text-clinical-muted">TTA (Time-to-Action)</p>
              <p className="font-heading font-black text-clinical-text">&lt; 1.2s</p>
           </div>
        </div>

        <ValidationTinderDeck />
        
        <p className="absolute bottom-8 font-sans text-clinical-muted text-sm flex items-center gap-2 font-medium">
          <span className="hidden md:inline">← Corregir anomalía</span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span>Aprobar ejecución →</span>
        </p>
      </main>
    </div>
  );
};

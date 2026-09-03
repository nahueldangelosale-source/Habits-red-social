import React, { useState, useEffect } from 'react';
import { useTemplateLibraryStore } from '../../stores/useTemplateLibraryStore';
import type { ProgramTemplate } from '../../stores/useTemplateLibraryStore';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { motion } from 'framer-motion';
import { X, Calendar, User, Check, Sparkles, Lock } from 'lucide-react';

interface AssignTemplateFlowProps {
  template: ProgramTemplate;
  folderId: string;
  onClose: () => void;
}

export const AssignTemplateFlow: React.FC<AssignTemplateFlowProps> = ({ template, folderId, onClose }) => {
  const forkTemplateToClient = useTemplateLibraryStore(state => state.forkTemplateToClient);
  const loadFromTemplate = usePlanBuilderStore(state => state.loadFromTemplate);
  
  // List of actual clients in the system to assign to (we fall back to static list or current active client)
  const activeAthleteName = useOnboardingPTStore(state => state.identity?.fullName) || 'Atleta Actual (Seleccionado)';

  const [selectedClient, setSelectedClient] = useState<string>('active_client');
  const [phaseDates, setPhaseDates] = useState<Record<string, string | null>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (template && template.phases) {
      const initialDates: Record<string, string | null> = {};
      template.phases.forEach((phase, index) => {
        // By default, first phase gets today's date, others are null
        initialDates[phase.id] = index === 0 ? new Date().toISOString().split('T')[0] : null;
      });
      setPhaseDates(initialDates);
    }
  }, [template]);

  const handleDateChange = (phaseId: string, value: string) => {
    setPhaseDates(prev => ({ ...prev, [phaseId]: value === '' ? null : value }));
  };

  const handleConfirmAssignment = () => {
    setIsProcessing(true);

    // Simulate Network Latency ceremony (1.2s) to show mechanical rigor
    setTimeout(() => {
      // 1. Fork from Master Library (structuredClone + new UUID generation)
      const forkedDays = forkTemplateToClient(folderId, template.id, selectedClient, phaseDates);

      // 2. Load into the Active Plan Builder Store
      loadFromTemplate({
        cycleName: template.name,
        days: forkedDays,
        sourceTemplateId: template.id
      });

      setIsProcessing(false);
      onClose();

      // Trigger navigation or success toast (simulated with alert)
      alert(`¡Template forkeado con éxito! Se ha cargado la copia independiente en el editor activo.`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#0a0d16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Asignación Rápida</span>
            <h3 className="text-md font-black font-montserrat uppercase tracking-tight text-white mt-1">
              Instanciar Plantilla
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-full transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Client Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">1. Seleccionar Cliente</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedClient('active_client')}
                className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedClient === 'active_client'
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                    : 'bg-slate-900/50 border-slate-850 text-slate-400'
                }`}
              >
                <User size={14} />
                <span>{activeAthleteName} (Activo)</span>
                {selectedClient === 'active_client' && <Check size={14} className="ml-auto text-blue-400" />}
              </button>
            </div>
          </div>

          {/* Step 2: Date Config per Phase */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">2. Fechas de Liberación por Fase</label>
            <div className="space-y-2">
              {template.phases.map((phase) => (
                <div key={phase.id} className="flex items-center gap-3 bg-slate-900/50 border border-slate-850 p-3 rounded-xl">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-300">{phase.name}</div>
                    <div className="text-[10px] text-slate-500">{phase.days.length} días</div>
                  </div>
                  <div className="w-36 relative">
                    {phaseDates[phase.id] ? (
                      <Calendar size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    ) : (
                      <Lock size={14} className="absolute left-3 top-2.5 text-slate-500" />
                    )}
                    <input
                      type="date"
                      value={phaseDates[phase.id] || ''}
                      onChange={e => handleDateChange(phase.id, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-2 py-2 text-xs text-slate-300 outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                      title={!phaseDates[phase.id] ? "Fase Bloqueada (Oculta hasta asignar fecha)" : "Fecha de inicio"}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              * Las fases sin fecha de inicio se mostrarán como <span className="text-amber-500">BLOQUEADAS</span>. El cliente sabrá que existen, pero no verá los ejercicios hasta que decidas activarlas.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t border-slate-800/80 bg-slate-900/20">
          <button
            onClick={handleConfirmAssignment}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)]"
          >
            {isProcessing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" /> Instanciando Copia Local...
              </>
            ) : (
              <>
                Confirmar e Inyectar Copia
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

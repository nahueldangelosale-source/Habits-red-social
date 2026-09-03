import React, { useState } from 'react';
import { Activity, Mail, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { PatientRow } from '../../widgets/PatientRow';

interface TriageLevel2Props {
    patients: any[]; // These will be the 'yellow' patients
    onSelectPatient: (id: string) => void;
}

export const TriageLevel2: React.FC<TriageLevel2Props> = ({ patients, onSelectPatient }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const [sentBatch, setSentBatch] = useState(false);

    if (patients.length === 0) return null;

    // Simulate batch processing by grouping
    const ghosts = patients.slice(0, Math.ceil(patients.length / 2));
    const hypocaloric = patients.slice(Math.ceil(patients.length / 2));

    const handleBatchNudge = () => {
        // In a real app, this would trigger an API call to the LLM to generate & send messages
        setSentBatch(true);
        setTimeout(() => setSentBatch(false), 3000);
    };

    return (
        <section aria-label="Cola de Gestión" className="mb-8">
            <div className="flex items-center justify-between mb-4 border-b border-amber-500/20 pb-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                    <Activity size={14} /> 
                    Nivel 2: Cola de Gestión ({patients.length})
                </h3>
                
                <button 
                    onClick={handleBatchNudge}
                    disabled={sentBatch}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full transition-all ${
                        sentBatch 
                            ? 'bg-emerald-500 text-white' 
                            : isClinical 
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    }`}
                >
                    {sentBatch ? (
                        <><CheckCircle2 size={14} /> Nudges Enviados (Batch)</>
                    ) : (
                        <><Mail size={14} /> Nudge Empático Masivo</>
                    )}
                </button>
            </div>

            <div className="space-y-6">
                {ghosts.length > 0 && (
                    <div>
                        <h4 className={`text-xs font-bold mb-3 opacity-60 uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                            Riesgo: Fantasmas (Sin registros x 3 días)
                        </h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {ghosts.map(p => (
                                <PatientRow key={p.id} patient={p} mode={mode} onClick={() => onSelectPatient(p.id)} />
                            ))}
                        </div>
                    </div>
                )}

                {hypocaloric.length > 0 && (
                    <div>
                        <h4 className={`text-xs font-bold mb-3 opacity-60 uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                            Riesgo: Hipocalóricos (&lt;50% ingesta)
                        </h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {hypocaloric.map(p => (
                                <PatientRow key={p.id} patient={p} mode={mode} onClick={() => onSelectPatient(p.id)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

import React, { useState } from 'react';
import { Calendar, Check, ChevronRight, Zap, Info } from 'lucide-react';
import type { IMacrocycle } from '../../../../entities/workout/schemas';
import { ExerciseDrillDownModal } from './ExerciseDrillDownModal';

interface CascadeBuilderProps {
    athleteId: string;
    athleteTags: string[];
    onConfirmMacrocycle: (macrocycle: IMacrocycle) => void;
}

export const CascadeBuilderCanvas: React.FC<CascadeBuilderProps> = ({ athleteTags, onConfirmMacrocycle }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [draft, setDraft] = useState<IMacrocycle | null>(null);
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
    
    // Labor Illusion State
    const [loadingStage, setLoadingStage] = useState(0);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState("");

    const loadingStages = [
        { progress: 15, msg: "Analizando perfil biomecánico del atleta..." },
        { progress: 30, msg: "Aplicando filtros de seguridad articular (McGill)..." },
        { progress: 55, msg: "Calculando curva de progresión..." },
        { progress: 75, msg: "Proyectando ACWR y semanas de deload..." },
        { progress: 90, msg: "Compilando macrociclo para revisión..." }
    ];

    const handleProposeDraft = async () => {
        setIsGenerating(true);
        setLoadingStage(0);
        setLoadingProgress(0);
        setLoadingMessage(loadingStages[0].msg);
        
        // Arrancar Labor Illusion
        let currentStage = 0;
        const illusionInterval = setInterval(() => {
            currentStage++;
            if (currentStage < loadingStages.length) {
                setLoadingStage(currentStage);
                setLoadingProgress(loadingStages[currentStage].progress);
                setLoadingMessage(loadingStages[currentStage].msg);
            } else {
                clearInterval(illusionInterval);
            }
        }, 2000);

        try {
            // Llamada real al endpoint
            const res = await fetch('/api/v1/macrocycles/propose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ athlete_id: athleteId, tags: athleteTags })
            });
            const data = await res.json();
            
            if (data.task_id) {
                // Polling / SSE fallback simulado por ahora (SSE real requiere EventSource)
                const sse = new EventSource(`/api/v1/macrocycles/${data.task_id}/status`);
                sse.onmessage = (event) => {
                    const statusData = JSON.parse(event.data);
                    if (statusData.status === 'COMPLETED') {
                        setDraft(statusData.result);
                        setIsGenerating(false);
                        clearInterval(illusionInterval);
                        sse.close();
                    } else if (statusData.status === 'FAILED') {
                        setIsGenerating(false);
                        clearInterval(illusionInterval);
                        sse.close();
                    }
                };
            }
        } catch (error) {
            console.error('Failed to propose draft', error);
            setIsGenerating(false);
            clearInterval(illusionInterval);
        }
    };

    const handleConfirm = async () => {
        if (draft) {
             await fetch(`/api/v1/macrocycles/${draft.id}/activate`, { method: 'PUT' });
             onConfirmMacrocycle({...draft, status: 'ACTIVE'});
        }
    };

    return (
        <section className="p-6 rounded-[24px] bg-[var(--color-clinical-surface)] backdrop-blur-xl border border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] h-full overflow-hidden text-white flex flex-col relative">
            <header className="mb-6 flex justify-between items-center z-10">
                 <div>
                    <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                         Cascade <span className="text-indigo-400">Copilot</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">AI-Assisted Human-in-the-Loop Periodization</p>
                 </div>
                 
                 {!draft && !isGenerating && (
                     <button
                         onClick={handleProposeDraft}
                         className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2 group hover:-translate-y-0.5"
                     >
                         <Zap size={14} className="group-hover:text-indigo-200 transition-colors" />
                         Proponer Macrociclo
                     </button>
                 )}
                 {draft && (
                     <button
                         onClick={handleConfirm}
                         className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 group hover:-translate-y-0.5"
                     >
                         <Check size={14} /> Oficializar Macrociclo
                     </button>
                 )}
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 w-full">
                {/* 1. Empty State */}
                {!isGenerating && !draft && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                        <Calendar size={48} className="mb-4 text-zinc-600 stroke-1" />
                        <p className="text-sm text-zinc-400 max-w-[280px]">El copiloto requiere acción para analizar los {athleteTags.length} clinical tags y formular una propuesta estructural.</p>
                    </div>
                )}

                {/* 2. Generating State (Proof of Work with Labor Illusion) */}
                {isGenerating && (
                    <div className="space-y-4">
                        <div className="p-6 bg-indigo-950/20 border border-indigo-500/20 rounded-xl relative overflow-hidden h-36 flex flex-col justify-center transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            <h3 className="text-sm font-bold text-indigo-400 mb-3">{loadingMessage}</h3>
                            <div className="h-2 bg-zinc-800/50 rounded w-full mb-3 overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000 ease-in-out" 
                                    style={{ width: `${loadingProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-2 lowercase font-mono">
                                {loadingProgress >= 90 ? "Esperando compilación asíncrona..." : "Resolving Biomechanical Constraints..."}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                             {[1,2,3].map(i => (
                                 <div key={i} className="aspect-square bg-zinc-900/40 rounded-xl border border-zinc-800/30 p-4 animate-pulse flex flex-col justify-between">
                                     <div className="w-8 h-8 rounded-full bg-zinc-800/50"></div>
                                     <div>
                                         <div className="h-1.5 bg-zinc-800/50 rounded w-full mb-2"></div>
                                         <div className="h-1.5 bg-zinc-800/50 rounded w-1/2"></div>
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* 3. Draft Review Canvas */}
                {draft && !isGenerating && (
                    <div className="space-y-6 pb-20 fade-in">
                        {/* Status Banner */}
                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-start gap-3">
                             <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                             <div>
                                 <p className="text-xs font-bold text-amber-500 uppercase">Pending Approval</p>
                                 <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">El LLM actúa estrictamente como proponente subordinado. Esta tabla interactiva requiere su confirmación final o edición manual detallada.</p>
                             </div>
                        </div>

                        {/* Rendering the simulated week (Week 1) */}
                        <div className="border border-zinc-800/50 rounded-2xl overflow-hidden bg-zinc-950/30">
                            <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800/50 flex justify-between items-center">
                                <h3 className="font-bold text-sm tracking-wide">Semana 1: {draft.structure.week_1.focus}</h3>
                            </div>
                            
                            <div className="p-4 space-y-4">
                                {Object.values(draft.structure.week_1.days).map((day: any, dIdx) => (
                                    <div key={dIdx} className="border border-zinc-800/30 rounded-xl p-4 bg-zinc-900/20">
                                         <h4 className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-widest">{day.name}</h4>
                                         
                                         <div className="space-y-2">
                                             {day.blocks.map((block: any, bIdx: number) => (
                                                 <div key={bIdx} className="space-y-2">
                                                     {block.exercises.map((ex: any) => (
                                                         <div 
                                                            key={ex.id}
                                                            onClick={() => setSelectedExerciseId(ex.id)}
                                                            className="group flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-lg hover:border-indigo-500/50 cursor-pointer transition-all hover:bg-indigo-950/20"
                                                         >
                                                             <div>
                                                                 <p className="text-sm font-bold group-hover:text-indigo-300 transition-colors">{ex.name}</p>
                                                                 <div className="flex gap-2 mt-1">
                                                                     {ex.biomechanical_tags.map((tag: string, i: number) => (
                                                                         <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/10 uppercase font-mono">{tag}</span>
                                                                     ))}
                                                                 </div>
                                                             </div>
                                                             <div className="text-right">
                                                                  <p className="text-xs font-bold">{ex.sets}x{ex.reps}</p>
                                                                  <div className="flex justify-end gap-1 mt-1 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                      <span className="text-[10px] font-bold">INSPECT</span>
                                                                      <ChevronRight size={14} />
                                                                  </div>
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>
                                             ))}
                                         </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
            
            {/* Modal Layer */}
            {selectedExerciseId && (
                <ExerciseDrillDownModal 
                    exerciseId={selectedExerciseId} 
                    onClose={() => setSelectedExerciseId(null)} 
                />
            )}

            {/* Ambient Background Glow */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        </section>
    );
};

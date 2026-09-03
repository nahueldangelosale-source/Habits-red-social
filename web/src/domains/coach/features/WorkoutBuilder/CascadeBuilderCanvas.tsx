import React, { useState } from 'react';
import { Dumbbell, Plus, Sparkles, BrainCircuit } from 'lucide-react';
import { BiomechanicsInterceptor } from '../../services/BiomechanicsInterceptor';
import { useCognitiveLoad } from '../../../../shared/hooks/useCognitiveLoad';

interface CascadeBuilderCanvasProps {
    athleteId: string;
    painAreas: string[];
}

export const CascadeBuilderCanvas: React.FC<CascadeBuilderCanvasProps> = ({ athleteId, painAreas }) => {
    const [routine, setRoutine] = useState<any[]>([
        { id: '1', name: 'Sentadilla Trasera', pattern: 'RODILLA', sets: '3', reps: '10', isAdapted: false }
    ]);
    const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
    const { status } = useCognitiveLoad(currentTaskId, {
        onSuccess: (data) => {
            if (data?.exercises) {
                // Mapear los ejercicios de vuelta al formato UI
                setRoutine(data.exercises.map((ex: any) => ({
                    id: ex.id,
                    name: ex.exercise.name,
                    pattern: 'RODILLA', // Podría venir del backend
                    sets: String(ex.sets),
                    reps: String(ex.reps),
                    isAdapted: ex.isAiSwapped,
                    reason: ex.clinicalContext
                })));
            }
            setCurrentTaskId(null);
        },
        onError: (err) => {
            console.error("Task failed: ", err);
            setCurrentTaskId(null);
        }
    });

    const isProcessing = status === 'fetching' || status === 'human_review';

    const handleAIOptimize = async () => {
        try {
            const response = await fetch('/api/v1/trainer/generate-progression', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Assuming local dev / token bypassing, otherwise:
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    athleteId,
                    medicalTags: painAreas,
                    targetPattern: 'RODILLA'
                })
            });

            if (!response.ok) throw new Error('Failed to start Celery engine');

            const data = await response.json();
            if (data.task_id) {
                setCurrentTaskId(data.task_id);
            }
        } catch (error) {
            console.error(error);
        }
    };
        
    // Simulador removido porque todo ahora corre por Celery Backend.

    return (
        <article className="bg-[#09090b] border border-white/10 shadow-2xl p-6 rounded-[32px] h-full flex flex-col text-white relative overflow-hidden">
             <header className="mb-6 flex justify-between items-center">
                 <h2 className="text-xl font-bold tracking-tight uppercase italic flex items-center gap-2">
                     <Dumbbell size={20} className="text-zinc-500" />
                     Cascade_Builder
                 </h2>
                 <button
                     onClick={handleAIOptimize}
                     disabled={currentTaskId !== null}
                     className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center gap-2"
                 >
                     {currentTaskId !== null ? <BrainCircuit size={14} className="animate-spin" /> : <Sparkles size={14} />}
                     {currentTaskId !== null ? 'Reescribiendo...' : 'Optimización IA'}
                 </button>
             </header>

             {/* Canvas Area */}
             <div className="flex-1 overflow-y-auto no-scrollbar relative" aria-live="polite">
                 {currentTaskId !== null ? (
                     // IMMERSIVE SKELETON (Proof of Work)
                     <div className="absolute inset-0 z-10 bg-zinc-950/50 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                         <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-xl rounded-full animate-pulse"></div>
                            <BrainCircuit size={48} className="text-indigo-400 animate-pulse relative z-10" />
                         </div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-2">Motor Celery Autopilot Activo</h3>
                         <p className="text-[10px] text-zinc-400 font-mono text-center max-w-[250px]">
                             Comunicando con Web Worker de Celery. Clonando y aplicando mesociclo de sobrecarga (4 semanas) seguro para {painAreas.join(', ') || 'atleta'}...
                         </p>
                     </div>
                 ) : null}

                 <div className="space-y-4">
                     {routine.map((ex) => (
                         <div key={ex.id} className={`p-4 rounded-2xl border transition-all ${ex.isAdapted ? 'bg-indigo-500/5 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-white/[0.02] border-white/5'}`}>
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                                     {ex.name}
                                     {ex.isAdapted && (
                                         <span className="text-[8px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                                             IA_Adaptado
                                         </span>
                                     )}
                                 </h4>
                                 <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{ex.pattern}</span>
                             </div>
                             <div className="flex gap-4">
                                 <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2 flex-1">
                                     <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest block mb-1">Sets</span>
                                     <span className="font-mono text-sm">{ex.sets}</span>
                                 </div>
                                 <div className="bg-zinc-950/40 border border-white/5 rounded-lg p-2 flex-1">
                                     <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest block mb-1">Reps</span>
                                     <span className="font-mono text-sm">{ex.reps}</span>
                                 </div>
                             </div>
                             {ex.reason && (
                                 <p className="mt-3 text-[10px] text-indigo-400 font-mono bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                                     ✨ Rationale: {ex.reason}
                                 </p>
                             )}
                         </div>
                     ))}

                     <button className="w-full py-6 rounded-2xl border-2 border-dashed border-white/10 text-zinc-500 hover:text-white hover:border-white/30 transition-all flex flex-col items-center justify-center gap-2 group">
                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Plus size={16} />
                         </div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Add_Block</span>
                     </button>
                 </div>
             </div>
        </article>
    );
};

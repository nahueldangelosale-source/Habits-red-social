import React from 'react';
import { X, Play, CheckCircle2, Info } from 'lucide-react';

interface ExerciseDrillDownProps {
    exerciseId: string;
    onClose: () => void;
    // Mock data for isolation
    mockExercise?: any; 
}

export const ExerciseDrillDownModal: React.FC<ExerciseDrillDownProps> = ({ exerciseId, onClose, mockExercise }) => {
    
    // In real app, we fetch `exercise` by `exerciseId` from DB via tRPC or React Query
    const exercise = mockExercise || {
        id: exerciseId,
        name: "Sentadilla Goblet",
        video_url: "https://example.com/squat",
        description: "Variante de sentadilla anterior ideal para aprender el patrón motor y mantener el torso erguido. Minimiza el estrés cizalla en la zona lumbar mientras enfatiza la extensión de rodilla.",
        execution_cues: [
             "Mantener torso erguido (pecho arriba)",
             "Rodillas en línea con las puntas del pie",
             "Descender hasta romper paralelo si movilidad lo permite",
             "Presión uniforme en toda la planta del pie (trípode plantar)"
        ],
        biomechanical_tags: ["anti_extension", "knee_dominant", "low_axial_load"]
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 fade-in">
            {/* Backdrop Blur using VANGUARD IGNITE */}
            <div 
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" 
                onClick={onClose}
            ></div>
            
            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-[var(--color-clinical-surface)] border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] slide-up">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-zinc-800/50 bg-zinc-900/30">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                            {exercise.name}
                        </h3>
                        <div className="flex gap-2 mt-1.5">
                            {exercise.biomechanical_tags.map((tag: string, i: number) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase font-mono tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800/30">
                     
                     {/* Left Col: Visual & Description */}
                     <div className="bg-[var(--color-clinical-surface)] p-5 space-y-5">
                          {/* Video Placeholder */}
                          <div className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 relative overflow-hidden group cursor-pointer">
                              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 group-hover:bg-zinc-950/20 transition-colors z-10">
                                   <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-lg group-hover:scale-110 transition-transform">
                                       <Play size={20} className="ml-1 fill-white" />
                                   </div>
                              </div>
                              <img src={`https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800`} className="w-full h-full object-cover opacity-50 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-80" alt="Exercise Demo"/>
                          </div>

                          <div>
                              <p className="text-xs text-zinc-400 leading-relaxed text-justify">{exercise.description}</p>
                          </div>
                     </div>

                     {/* Right Col: Cues & Intelligence */}
                     <div className="bg-[var(--color-clinical-surface)] p-5 space-y-6">
                         
                         <div>
                             <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                                 <CheckCircle2 size={12} className="text-emerald-500" />
                                 Execution Cues
                             </h4>
                             <ul className="space-y-3">
                                 {exercise.execution_cues.map((cue: string, idx: number) => (
                                     <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                                         <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1"></span>
                                         <span className="leading-snug">{cue}</span>
                                     </li>
                                 ))}
                             </ul>
                         </div>

                         <div className="pt-4 border-t border-zinc-800/50">
                             <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl flex gap-3">
                                 <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                 <div>
                                      <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Por qué la IA lo propone</p>
                                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                                         Cumple restricción `LOWER_BACK_PAIN` impuesta en triage. Desvía la carga mecánica del raquis hacia el tren inferior.
                                      </p>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
                
                {/* Footer Actions */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end gap-3">
                      <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:bg-zinc-800 transition-colors">
                          Cerrar Visualización
                      </button>
                      <button className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-900 hover:bg-white transition-colors flex items-center gap-2 shadow-lg">
                          Validar Ejercicio
                      </button>
                </div>

            </div>
        </div>
    );
};

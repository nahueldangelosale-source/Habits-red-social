import React from 'react';
import { ArrowLeft, Cross, Sparkles, Box, Shield, HeartPulse } from 'lucide-react';
import { useViewTransition } from '../../../shared/hooks/useViewTransition';
import { BiometricTagBadge } from '../../../shared/ui/BiometricTagBadge';

interface Radiografia360DetailProps {
    athleteId: string;
    onBack: () => void;
}

export const Radiografia360DetailView: React.FC<Radiografia360DetailProps> = ({ athleteId, onBack }) => {
    const { transitionViewIfSupported } = useViewTransition();

    const handleBack = () => {
        transitionViewIfSupported(onBack);
    };

    // Mocking 68 tags conceptually categorization
    const tags = [
        { id: '1', label: 'Dolor Lumbar L5', category: 'danger' },
        { id: '2', label: 'Presión Alta', category: 'danger' },
        { id: '3', label: 'Ectomorfo', category: 'ops' },
        { id: '4', label: 'Ayuno Intermitente', category: 'success' },
        { id: '5', label: 'Fatiga Crónica Matutina', category: 'warning' },
        { id: '6', label: 'Discopatía', category: 'danger' },
        { id: '7', label: 'Hipoglucemia Recreativa', category: 'warning' },
        { id: '8', label: 'Vegano Estricto', category: 'ops' },
        { id: '9', label: 'Hipertrofia Glútea (Meta)', category: 'ai' },
        { id: '10', label: 'Déficit Calórico Moderado', category: 'ai' },
        { id: '11', label: 'Movilidad Reducida Hombro', category: 'danger' }
    ] as const;

    return (
        <article style={{ viewTransitionName: 'radiografia-360-view' }} className="bg-gradient-to-br from-zinc-900/90 to-zinc-950/95 backdrop-blur-xl border border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 rounded-[24px] h-full flex flex-col text-white relative animate-in zoom-in-95 duration-500">
             
             <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                 <div className="flex items-center gap-4">
                     <button onClick={handleBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
                         <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white" />
                     </button>
                     <div>
                         <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                             <HeartPulse size={24} className="text-purple-500" />
                             Radiografía 360
                         </h2>
                         <div className="flex items-center gap-2 mt-2">
                             <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest bg-zinc-950/40 px-2 py-0.5 rounded-md border border-white/5">
                                 ID: {athleteId} | Sovereign_Matchmaker
                             </span>
                             <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                 <Shield size={10} /> 68 Tags Capturados
                             </span>
                         </div>
                     </div>
                 </div>

                 <button className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-400 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                     <Sparkles size={14} /> Asignar Arquetipo
                 </button>
             </header>

             <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
                 {/* ZONA PELIGRO / RESTRICCIONES */}
                 <section className="bg-zinc-950/50 border border-red-500/20 p-6 rounded-2xl">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                         <Cross size={14} className="text-red-500" /> Blockers Biomecánicos / Médicos
                     </h3>
                     <div className="flex flex-wrap gap-2">
                         {tags.filter(t => t.category === 'danger').map(tag => (
                             <BiometricTagBadge key={tag.id} tag={tag.label} category={tag.category} />
                         ))}
                     </div>
                 </section>

                 {/* ZONA RIESGO Y ESTILO DE VIDA */}
                 <section className="bg-zinc-950/50 border border-amber-500/20 p-6 rounded-2xl">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                         <Box size={14} className="text-amber-500" /> Triaje Adicional & Nutrición
                     </h3>
                     <div className="flex flex-wrap gap-2">
                         {tags.filter(t => t.category === 'warning' || t.category === 'ops' || t.category === 'success').map(tag => (
                             <BiometricTagBadge key={tag.id} tag={tag.label} category={tag.category} />
                         ))}
                     </div>
                 </section>

                 {/* ZONA OBJETIVOS IA */}
                 <section className="bg-zinc-950/50 border border-purple-500/20 p-6 rounded-2xl">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
                         <Sparkles size={14} className="text-purple-400" /> Directivas del Motor IA
                     </h3>
                     <div className="flex flex-wrap gap-2">
                         {tags.filter(t => t.category === 'ai').map(tag => (
                             <BiometricTagBadge key={tag.id} tag={tag.label} category={tag.category} />
                         ))}
                     </div>
                 </section>
             </div>
        </article>
    );
};

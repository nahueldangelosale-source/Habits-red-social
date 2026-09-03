import React, { useState } from 'react';
import { ArrowLeft, User, Cross, Sparkles, Activity, FileText } from 'lucide-react';
import { useViewTransition } from '../../../shared/hooks/useViewTransition';

interface ClientDrillDownProps {
    athleteId: string;
    onBack: () => void;
}

export const ClientDrillDownWidget: React.FC<ClientDrillDownProps> = ({ athleteId, onBack }) => {
    const { transitionViewIfSupported } = useViewTransition();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleBack = () => {
        transitionViewIfSupported(onBack);
    };

    const handleGenerateArchetype = () => {
        setIsGenerating(true);
        setTimeout(() => setIsGenerating(false), 2000); // Simulate API call
    };

    // Mock Data
    const athlete = {
        name: athleteId === '1' ? 'Marcos R.' : athleteId === '2' ? 'Julia M.' : 'Ana S.',
        age: 28,
        goal: 'Hipertrofia Miofibrilar',
        level: 'Intermedio',
        painAreas: athleteId === '1' ? ['Rodilla', 'Baja Espalda'] : athleteId === '3' ? ['Hombro'] : [],
        stressLevel: 8
    };

    return (
        <article style={{ viewTransitionName: 'drill-down-view' }} className="bg-[var(--color-clinical-surface)] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-8 rounded-[24px] h-full flex flex-col text-white relative animate-in slide-in-from-right-8 duration-500">
             
             <header className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                 <div className="flex items-center gap-4">
                     <button onClick={handleBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
                         <ArrowLeft size={16} className="text-zinc-400 group-hover:text-white" />
                     </button>
                     <div>
                         <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
                             <div style={{ viewTransitionName: `client-avatar-${athleteId}` }} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                 <User size={24} className="text-[var(--color-action-primary)]" />
                             </div>
                             {athlete.name}
                         </h2>
                         <div className="flex items-center gap-2 mt-2">
                             <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest bg-zinc-950/40 px-2 py-0.5 rounded-md border border-white/5">
                                 ID: {athleteId.padStart(6, '0')}
                             </span>
                             <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                 <Activity size={10} /> Active
                             </span>
                         </div>
                     </div>
                 </div>

                 <button
                     onClick={handleGenerateArchetype}
                     disabled={isGenerating}
                     className="flex items-center gap-2 bg-[var(--color-action-primary)] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[var(--color-action-primary)]/80 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     {isGenerating ? (
                         <>
                             <Sparkles size={14} className="animate-spin" /> Procesando Bio-Data...
                         </>
                     ) : (
                         <>
                             <Sparkles size={14} /> Generar Arquetipo IA
                         </>
                     )}
                 </button>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                 {/* Psychographic Profile */}
                 <div className="bg-zinc-950/20 border border-white/5 rounded-2xl p-6">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                         <FileText size={14} /> Perfil Psicográfico
                     </h3>
                     <ul className="space-y-4">
                         <li className="flex justify-between items-center pb-2 border-b border-white/5">
                             <span className="text-sm font-mono text-zinc-400">Objetivo</span>
                             <span className="font-bold text-sm text-[var(--color-action-primary)]">{athlete.goal}</span>
                         </li>
                         <li className="flex justify-between items-center pb-2 border-b border-white/5">
                             <span className="text-sm font-mono text-zinc-400">Edad Biológica</span>
                             <span className="font-bold text-sm">{athlete.age} años</span>
                         </li>
                         <li className="flex justify-between items-center pb-2 border-b border-white/5">
                             <span className="text-sm font-mono text-zinc-400">Nivel Técnico</span>
                             <span className="font-bold text-sm">{athlete.level}</span>
                         </li>
                         <li className="flex justify-between items-center pb-2">
                             <span className="text-sm font-mono text-zinc-400">Nivel Estrés (SNC)</span>
                             <span className="font-bold text-sm text-amber-400">{athlete.stressLevel}/10</span>
                         </li>
                     </ul>
                 </div>

                 {/* Clinical Restrictions */}
                 <div className="bg-zinc-950/20 border border-white/5 rounded-2xl p-6">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                         <Cross size={14} className="text-red-400" /> Historial Clínico
                     </h3>
                     
                     {athlete.painAreas.length > 0 ? (
                         <div className="space-y-3">
                             <div className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r-xl">
                                 <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
                                     Precaución Biomecánica: {athlete.painAreas.join(' & ')}
                                 </p>
                             </div>
                             <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                 La inyección de Smart Slots evitará automáticamente patrones dominantes de estas áreas y proveerá alternativas isométricas o de carga axial reducida (Constraint: BiomechanicalInterceptor).
                             </p>
                         </div>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-32 text-zinc-500">
                             <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-2 bg-white/5">
                                 <Cross size={16} />
                             </div>
                             <p className="text-[10px] font-bold uppercase tracking-widest">Sin Lesiones Registradas</p>
                         </div>
                     )}
                 </div>
             </div>
        </article>
    );
};

import React, { useState } from 'react';
import { Users, AlertCircle, Sparkles } from 'lucide-react';
import { flushSync } from 'react-dom';

import type { ClientSummary } from '../../../api/trainer';

interface CoachRosterProps {
    clients: ClientSummary[];
    onSelectAthlete?: (id: string) => void;
}

export const CoachRosterWidget: React.FC<CoachRosterProps> = ({ clients, onSelectAthlete }) => {
    const [activeTab, setActiveTab] = useState<'ALL' | 'ALERTS' | 'PROSPECTS'>('ALL');

    const filteredClients = clients.filter(client => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'ALERTS') return client.painAreas.length > 0 || !client.isActive;
        if (activeTab === 'PROSPECTS') return client.streak < 5;
        return true;
    });

    const handleSelect = (id: string) => {
        if (!onSelectAthlete) return;
        if (!document.startViewTransition) {
            onSelectAthlete(id);
            return;
        }
        document.startViewTransition(() => {
            flushSync(() => {
                onSelectAthlete(id);
            });
        });
    };

    return (
        <article className="bg-[var(--color-clinical-surface)] backdrop-blur-xl border border-zinc-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-6 rounded-[24px] h-full flex flex-col text-white">
             <header className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h2 className="text-xl font-bold tracking-tighter uppercase italic flex items-center gap-2">
                     <Users size={20} className="text-[var(--color-action-primary)]" />
                     Live_Roster
                 </h2>
                 <div className="flex bg-zinc-950/40 rounded-lg p-1 border border-zinc-800/50">
                    <button 
                        onClick={() => setActiveTab('ALL')}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-all ${activeTab === 'ALL' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Todos
                    </button>
                    <button 
                        onClick={() => setActiveTab('ALERTS')}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${activeTab === 'ALERTS' ? 'bg-red-500/20 text-red-400' : 'text-zinc-500 hover:text-red-300'}`}
                    >
                        <AlertCircle size={10} /> Alertas Rojas
                    </button>
                    <button 
                        onClick={() => setActiveTab('PROSPECTS')}
                        className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-all flex items-center gap-1 ${activeTab === 'PROSPECTS' ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-500 hover:text-purple-300'}`}
                    >
                        <Sparkles size={10} /> Prospectos
                    </button>
                 </div>
             </header>

             <div className="flex-1 overflow-auto no-scrollbar">
                 <table className="w-full text-left">
                     <thead>
                         <tr className="border-b border-white/10 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                             <th className="pb-3 pl-2">Atleta</th>
                             <th className="pb-3">Estado</th>
                             <th className="pb-3">Molestias</th>
                             <th className="pb-3 text-right pr-2">Score</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                         {filteredClients.map(client => (
                             <tr 
                                key={client.id} 
                                onClick={() => handleSelect(client.id)}
                                className="hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                             >
                                 <td className="py-3 pl-2">
                                     <div className="flex items-center gap-2">
                                         <div 
                                             style={{ viewTransitionName: `client-avatar-${client.id}` }} 
                                             className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs uppercase text-zinc-300 group-hover:bg-white/10 group-hover:text-white transition-all"
                                         >
                                             {client.name.charAt(0)}
                                         </div>
                                         <span className="font-bold text-sm tracking-tight">{client.name}</span>
                                     </div>
                                 </td>
                                 <td className="py-3">
                                     <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${client.isActive ? 'bg-[var(--color-action-primary)]/10 text-[var(--color-action-primary)] border-[var(--color-action-primary)]/20' : 'bg-white/5 text-zinc-500 border-white/10'}`}>
                                         {client.isActive ? 'Live' : 'Inactive'}
                                     </span>
                                 </td>
                                 <td className="py-3 text-xs text-zinc-400">{client.painAreas.length ? client.painAreas.join(', ') : 'None'}</td>
                                 <td className="py-3 text-right pr-2 font-mono text-xs text-[var(--color-action-primary)] font-bold">{client.streak * 10}%</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
        </article>
    );
};

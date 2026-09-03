import React, { useState } from 'react';
import { DollarSign, AlertCircle, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { trainerApi, type DelinquentClient } from '../../../api/trainer';

interface FinanceBentoProps {
    mrr: number;
    delinquentClients: DelinquentClient[];
    onResolveSuccess?: () => void;
}

export const FinanceBentoWidget: React.FC<FinanceBentoProps> = ({ mrr, delinquentClients, onResolveSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleApproveAgenticMutation = async (clientId: string) => {
        setIsProcessing(true);
        
        try {
            // Simulated network delay
            await trainerApi.resolveDelinquency(clientId);
            toast.success("Zero-Trust MCP: Mutación Autorizada y Ejecutada", {
                icon: '🛡️',
                style: { background: '#18181b', color: '#a78bfa', border: '1px solid #4c1d95' }
            });
            if (onResolveSuccess) {
                onResolveSuccess();
            }
        } catch (error) {
            toast.error("El Agentic Gateway bloqueó la ejecución.");
        } finally {
             setIsProcessing(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 min-h-[320px] shadow-2xl relative overflow-hidden group hover:border-violet-500/30 transition-colors">
            {/* Header: MRR & FinOps */}
            <div className="flex justify-between items-start mb-6">
                <div>
                     <p className="text-xs uppercase tracking-widest text-violet-400 font-bold flex items-center gap-1.5 mb-1">
                         <ShieldCheck size={14} /> ZERO-TRUST FINOPS
                     </p>
                     <p className="text-sm text-zinc-400">Monthly Recurring Revenue</p>
                     <h3 className="text-4xl font-black text-white tracking-tighter mt-1">
                         ${mrr.toLocaleString()}
                     </h3>
                </div>
                <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 text-violet-400">
                     <DollarSign size={24} />
                </div>
            </div>

            {/* MCP Automation Queue */}
            <div className="space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={14} className="text-amber-500" />
                      <h4 className="text-xs uppercase font-bold text-zinc-300 tracking-wider">
                          Cola de Morosidad Detectada por Agente
                      </h4>
                 </div>

                 {delinquentClients.length === 0 ? (
                     <div className="p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl text-center">
                         <p className="text-xs text-zinc-500">Ninguna alerta financiera activa.</p>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         {delinquentClients.map(client => (
                             <div key={client.id} className="bg-black/40 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:bg-zinc-800/50 transition-colors">
                                  <div>
                                       <p className="font-bold text-sm text-zinc-100">{client.name}</p>
                                       <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                                {client.daysLate} días tarde
                                            </span>
                                            <span className="text-xs text-zinc-400 font-mono">${client.amountDue} USD</span>
                                       </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3">
                                       <div className="text-[10px] text-zinc-500 text-right pr-2 hidden sm:block">
                                            <p>Req: `draft_payment_link`</p>
                                            <p className="text-violet-400/70">Firma Humana Requerida</p>
                                       </div>
                                       <button 
                                           disabled={isProcessing}
                                           onClick={() => handleApproveAgenticMutation(client.id)}
                                           className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                       >
                                           <CreditCard size={14} /> Aprobar Gestión
                                       </button>
                                  </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
            
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
    );
};

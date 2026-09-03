import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { api } from '../api/client';

interface PendingDraft {
    id: string;
    ai_reasoning: {
        trigger: string;
        reason: string;
        action: string;
    };
    mutated_routine: any;
    risk_score: string;
}

export const SwapActionPanel: React.FC<{ clientId: string }> = ({ clientId }) => {
    const [draft, setDraft] = useState<PendingDraft | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApproving, setIsApproving] = useState(false);
    const [approved, setApproved] = useState(false);

    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const response = await api.get<PendingDraft | null>(`/api/v1/watchtower/clients/${clientId}/drafts/pending`);
                setDraft(response);
            } catch (error) {
                console.error("Failed to load draft", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDraft();
    }, [clientId]);

    const handleApprove = async () => {
        if (!draft) return;
        setIsApproving(true);
        try {
            await api.post(`/api/v1/watchtower/clients/${clientId}/drafts/${draft.id}/approve`);
            setApproved(true);
        } catch (error) {
            console.error("Failed to approve draft", error);
        } finally {
            setIsApproving(false);
        }
    };

    if (isLoading) return <Loader2 className="animate-spin text-zinc-500 mx-auto" size={16} />;
    if (approved) return <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-1 justify-end"><CheckCircle2 size={14}/> Swap Aplicado</span>;
    if (!draft) return null;

    return (
        <div className="flex flex-col items-end gap-2 my-2">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-left max-w-[250px]">
                <div className="flex items-center gap-1 text-indigo-400 font-bold text-[10px] mb-1 uppercase tracking-widest">
                    <Bot size={12} /> Swap Copilot
                </div>
                <p className="text-zinc-300 text-[10px] leading-tight mb-2">
                    <span className="text-white font-bold">{draft.ai_reasoning.trigger}:</span> {draft.ai_reasoning.reason}
                    <br/>
                    <span className="text-zinc-500 mt-1 block">{draft.ai_reasoning.action}</span>
                </p>
                <button 
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="w-full bg-indigo-500 hover:bg-indigo-500/80 text-black px-2 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                >
                    {isApproving ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} 
                    Aprobar con 1-Clic
                </button>
            </div>
        </div>
    );
};

// web/src/components/inbox/DraftReviewSplitScreen.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Info, AlertTriangle, Dumbbell, Video } from 'lucide-react';

interface DraftData {
    id: string;
    client_name: string;
    risk_score: 'Green' | 'Yellow' | 'Red';
    onboarding_data: any;
    original_plan: any; // Simplified for MVP
    mutated_routine: any;
    ai_reasoning: Array<{ target: string, reason: string }>;
}

interface DraftReviewSplitScreenProps {
    draft: DraftData;
    onBack: () => void;
    onApprove: (draftId: string) => void;
}

export const DraftReviewSplitScreen: React.FC<DraftReviewSplitScreenProps> = ({ draft, onBack, onApprove }) => {
    const [isApproving, setIsApproving] = useState(false);
    const [hoveredReasoning, setHoveredReasoning] = useState<string | null>(null);

    const handleApprove = async () => {
        setIsApproving(true);
        // Simulate API call to approve and mutate the actual client routine
        setTimeout(() => {
            setIsApproving(false);
            onApprove(draft.id);
        }, 1500);
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Red': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'Yellow': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        }
    };

    // Helper to find reasoning for a specific target
    const getReasoningFor = (targetName: string) => {
        return draft.ai_reasoning.find(r => r.target.toLowerCase() === targetName.toLowerCase())?.reason;
    };

    const renderDay = (dayData: any, isMutated: boolean) => {
        if (!dayData || !dayData.exercises) return null;

        return (
            <div className="space-y-4">
                <h4 className="font-bold text-lg border-b border-zinc-800 pb-2">{dayData.name}</h4>
                {dayData.exercises.map((ex: any, idx: number) => {
                    const reason = getReasoningFor(ex.name);
                    const isChanged = isMutated && reason;

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border relative transition-all ${isChanged
                                ? 'bg-yellow-500/10 border-yellow-500/50'
                                : 'bg-zinc-900 border-zinc-800'
                                }`}
                            onMouseEnter={() => isChanged && setHoveredReasoning(reason)}
                            onMouseLeave={() => setHoveredReasoning(null)}
                        >
                            {isChanged && (
                                <div className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center shadow-lg">
                                    <Info className="w-4 h-4" />
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold">{ex.name}</span>
                                <span className="text-zinc-500 text-sm font-mono">{ex.sets} Sets x {ex.reps}</span>
                            </div>

                            {/* Hover Tooltip equivalent built-in for MVP */}
                            {hoveredReasoning === reason && isChanged && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 p-3 bg-zinc-950/50 border border-yellow-500/30 rounded-lg text-sm text-yellow-200"
                                >
                                    <span className="font-bold block mb-1">Decisión del Swap Engine:</span>
                                    {reason}
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white rounded-xl overflow-hidden border border-zinc-800">
            {/* Header */}
            <div className="h-16 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="font-bold">Revisión de Onboarding B2C</h2>
                        <p className="text-xs text-zinc-500">Atleta: {draft.client_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getRiskColor(draft.risk_score)}`}>
                        <AlertTriangle className="w-3 h-3" />
                        Riesgo: {draft.risk_score.toUpperCase()}
                    </div>
                    {/* Mobility Video Status Added */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${draft.onboarding_data?.videoUrl ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                        {draft.onboarding_data?.videoUrl ? <CheckCircle2 className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                        Video: {draft.onboarding_data?.videoUrl ? 'OK' : 'MISSING'}
                    </div>
                    <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="bg-neon-volt hover:bg-neon-volt/90 text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isApproving ? 'Aplicando Mutación...' : 'Aceptar y Oficializar Rutina'}
                        {!isApproving && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Master Plan (Original) */}
                <div className="flex-1 border-r border-zinc-800 bg-zinc-950/50 overflow-y-auto p-6">
                    <div className="flex items-center gap-2 mb-6 text-zinc-400">
                        <Dumbbell className="w-5 h-5" />
                        <h3 className="font-bold uppercase tracking-wider">Plantilla Maestra Original</h3>
                    </div>

                    {/* Onboarding Summary in Sidebar */}
                    <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-bold uppercase">Nivel de Estrés</span>
                            <span className={`font-black ${draft.onboarding_data?.stressLevel >= 8 ? 'text-red-400' : 'text-teal-400'}`}>
                                {draft.onboarding_data?.stressLevel || 5}/10
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-bold uppercase">Días/Semana</span>
                            <span className="text-white font-black">{draft.onboarding_data?.days || 3}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500 font-bold uppercase">Entorno</span>
                            <span className="text-white font-black uppercase text-[10px]">{draft.onboarding_data?.equipment || 'Standard'}</span>
                        </div>
                    </div>

                    {/* Simplified Render of Days for MVP */}
                    {draft.original_plan?.days?.map((day: any, i: number) => (
                        <div key={i} className="mb-8">
                            {renderDay(day, false)}
                        </div>
                    ))}
                </div>

                {/* Right Side: AI Mutated Draft */}
                <div className="flex-1 bg-zinc-950 overflow-y-auto p-6 relative">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-neon-volt">
                            <Bot className="w-5 h-5" />
                            <h3 className="font-bold uppercase tracking-wider">Borrador Mutado por IA</h3>
                        </div>

                        {/* Global Reasoning Alert if Stress caused drops */}
                        {getReasoningFor("General") && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg text-xs font-medium max-w-xs text-right">
                                {getReasoningFor("General")}
                            </div>
                        )}
                    </div>

                    {/* Simplified Render of Mutated Days for MVP */}
                    {draft.mutated_routine?.days?.map((day: any, i: number) => (
                        <div key={i} className="mb-8">
                            {renderDay(day, true)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Mock Bot icon since lucide-react 0.292.0 might not have it exported natively depending on version, fallback to generic
const Bot = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);

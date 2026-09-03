import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Activity, CheckCircle, AlertTriangle, PlayCircle, X } from 'lucide-react';
import { api } from '../../api/client';
import { useCeremonyStore } from '../../stores/useCeremonyStore';

interface SplitViewProps {
    clientId: string;
    onClose: () => void;
}

export const BiomechanicalSplitView: React.FC<SplitViewProps> = ({ clientId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [conflictData, setConflictData] = useState<any>(null);
    const [isResolving, setIsResolving] = useState(false);
    const removeConflict = useCeremonyStore((state) => state.removeConflict);
    const addConflict = useCeremonyStore((state) => state.addConflict);

    useEffect(() => {
        const fetchConflict = async () => {
            try {
                const res = await api.get(`/api/v1/clinical/conflicts/${clientId}`);
                setConflictData(res);
            } catch (error) {
                console.error("Error fetching conflict details", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConflict();
    }, [clientId]);

    const handleResolve = async (action: 'KEEP_ADAPTATION' | 'OVERWRITE') => {
        if (isResolving) return; // Idempotency UI block
        setIsResolving(true);
        
        // Optimistic UI update
        removeConflict(clientId);
        onClose();
        
        try {
            await api.post(`/api/v1/clinical/conflicts/${clientId}/resolve?action=${action}`);
            // Show toast success if you have a toast system
        } catch (error) {
            console.error("Failed to resolve conflict", error);
            // Rollback optimistic UI
            addConflict(clientId);
            alert("La sincronización falló. El estado original ha sido restaurado. Verifica tu conexión.");
        } finally {
            setIsResolving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl flex items-center justify-center">
                    <p className="text-zinc-500 animate-pulse font-mono tracking-widest text-sm">Cargando Conflicto Biomecánico...</p>
                </div>
            </div>
        );
    }

    if (!conflictData) {
        return null;
    }

    const { active_plan, origin_protocol } = conflictData;

    const renderPlanBlocks = (planContent: any[], title: string, isOriginal: boolean) => (
        <div className={`flex-1 rounded-[2rem] border ${isOriginal ? 'border-indigo-200 bg-indigo-50/20' : 'border-emerald-200 bg-emerald-50/20'} p-6 overflow-y-auto max-h-[60vh] custom-scrollbar`}>
            <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isOriginal ? 'text-indigo-900' : 'text-emerald-900'}`}>
                {isOriginal ? <Target className="text-indigo-500" /> : <ShieldCheck className="text-emerald-500" />}
                {title}
            </h3>
            <div className="space-y-4">
                {planContent?.map((item: any, index: number) => (
                    <div key={item.id || index} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative transition-colors hover:border-slate-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                        <span className="text-sm font-black text-slate-400">#{index + 1}</span> 
                                        {item.exercise?.Nombre_Oficial || 'Ejercicio'}
                                    </h3>
                                    <p className="text-xs font-lato text-slate-500">
                                        {item.exercise?.Musculo_Agonista || 'N/A'} • {item.exercise?.Equipamiento_Requerido || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Series</label>
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800">{item.sets}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reps</label>
                                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800">{item.reps}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-1 flex items-center gap-1"><Target className="w-3 h-3"/> Prog.</label>
                                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm font-bold text-emerald-700">{item.progression || '-'}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> RPE</label>
                                <div className="w-full bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-sm font-black text-indigo-700">{item.rpe || '-'}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-[var(--color-adrenaline-bg)]/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-8 w-full max-w-[1400px] shadow-2xl relative flex flex-col max-h-[90vh]"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-8 pr-16">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <AlertTriangle className="text-orange-500" size={32} />
                        Rebase de Protocolo Requerido
                    </h2>
                    <p className="text-slate-500 text-lg mt-2">
                        El estándar maestro ha sido actualizado. Elige si deseas mantener la mutación específica para este paciente o alinearlo al nuevo estándar científico.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 mb-8 flex-1 min-h-0">
                    {/* Active Plan (Adaptation) */}
                    {renderPlanBlocks(active_plan?.routines || [], "Adaptación Actual del Coach", false)}
                    
                    {/* Origin Protocol (New Standard) */}
                    {renderPlanBlocks(origin_protocol?.routines || [], "Nuevo Estándar del Protocolo", true)}
                </div>

                <div className="flex justify-end gap-4 mt-auto pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => handleResolve('KEEP_ADAPTATION')}
                        disabled={isResolving}
                        className="px-8 py-4 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        Mantener Adaptación
                    </button>
                    <button 
                        onClick={() => handleResolve('OVERWRITE')}
                        disabled={isResolving}
                        className="px-8 py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircle size={20} />
                        Aceptar Nuevo Estándar
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

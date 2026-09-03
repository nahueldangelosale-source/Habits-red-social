import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Play, Edit2, ShieldAlert } from 'lucide-react';
import { api, ApiError } from '../../api/client';

interface QuarantineRecord {
    id: string;
    raw_payload: any;
    error_reason: string;
    status: string;
}

export const QuarantineResolutionTable: React.FC = () => {
    const [records, setRecords] = useState<QuarantineRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchQuarantine = async () => {
        try {
            const data = await api.get<QuarantineRecord[]>('/api/v1/magic-import/quarantine');
            setRecords(data);
        } catch (e) {
            console.error("Error fetching quarantine", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuarantine();
    }, []);

    const startEdit = (record: QuarantineRecord) => {
        setEditingId(record.id);
        setEditForm({ ...record.raw_payload });
        setFormError(null);
    };

    const handleFormChange = (key: string, value: string) => {
        setEditForm(prev => ({ ...prev, [key]: value }));
    };

    const handleResolve = async (id: string) => {
        setIsSubmitting(true);
        setFormError(null);
        try {
            await api.post(`/api/v1/magic-import/quarantine/${id}/resolve`, editForm);
            setRecords(prev => prev.filter(r => r.id !== id));
            setEditingId(null);
        } catch (e) {
            if (e instanceof ApiError && e.status === 422) {
                const detail = e.data && typeof e.data === 'object' && 'detail' in e.data ? (e.data as any).detail : "Error de validación.";
                setFormError(typeof detail === 'string' ? detail : JSON.stringify(detail));
            } else {
                setFormError("Error al intentar resolver la cuarentena.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 text-center border border-zinc-800 bg-zinc-900/30 rounded-3xl animate-pulse">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-zinc-500">Cargando cuarentena soberana...</p>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="p-8 border border-dashed border-emerald-500/30 bg-emerald-500/5 rounded-3xl text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                <h3 className="text-lg font-black text-emerald-500">Cuarentena Limpia</h3>
                <p className="text-sm text-zinc-500 mt-2">No hay registros anómalos pendientes de resolución.</p>
            </div>
        );
    }

    return (
        <div className="font-sans">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <ShieldAlert size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white">Bandeja de Resolución (Sovereign Quarantine)</h3>
                    <p className="text-xs text-zinc-500">Corrige los errores de formato detectados durante la importación para re-encolarlos.</p>
                </div>
                <div className="ml-auto bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/20">
                    {records.length} pendientes
                </div>
            </div>

            <div className="space-y-4">
                {records.map(record => {
                    const isEditing = editingId === record.id;
                    
                    return (
                        <div key={record.id} className={`p-5 rounded-2xl border transition-all ${
                            isEditing ? 'bg-zinc-900 border-indigo-500/50 shadow-xl' : 'bg-zinc-900/50 border-zinc-800'
                        }`}>
                            
                            <div className="flex items-start gap-3 mb-4">
                                <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">Diagnóstico del Error</span>
                                    <code className="text-xs font-mono text-zinc-300 bg-black/50 px-2 py-1 rounded">
                                        {record.error_reason}
                                    </code>
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-zinc-800">
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.keys(editForm).map(key => (
                                            <div key={key} className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{key}</label>
                                                <input 
                                                    type="text" 
                                                    value={editForm[key] || ''} 
                                                    onChange={(e) => handleFormChange(key, e.target.value)}
                                                    className="bg-zinc-950 border border-zinc-700 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {formError && (
                                        <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 font-mono">
                                            {formError}
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-zinc-800">
                                        <button 
                                            onClick={() => setEditingId(null)}
                                            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={() => handleResolve(record.id)}
                                            disabled={isSubmitting}
                                            className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <span className="animate-pulse">Re-encolando...</span>
                                            ) : (
                                                <>
                                                    <Play size={14} fill="currentColor" /> Guardar y Re-encolar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between border-t border-zinc-800 pt-4 mt-2">
                                    <div className="flex gap-4 opacity-75">
                                        {Object.entries(record.raw_payload).slice(0, 3).map(([k, v]) => (
                                            <div key={k} className="text-xs">
                                                <span className="text-zinc-500 mr-1">{k}:</span>
                                                <span className="text-zinc-300 font-medium">{String(v)}</span>
                                            </div>
                                        ))}
                                        {Object.keys(record.raw_payload).length > 3 && (
                                            <span className="text-xs text-zinc-600">+{Object.keys(record.raw_payload).length - 3} más...</span>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => startEdit(record)}
                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                                    >
                                        <Edit2 size={12} /> Corregir Datos
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuarantineResolutionTable;

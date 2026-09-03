import React, { useState } from 'react';
import { Mic, FileSignature, CheckCircle2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceToChartDock: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    
    // Si isExpanded es true, muestra la interfaz de revisión (Split-Screen).
    // Si es false, se colapsa a un pequeño dock flotante tipo "Inbox".
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Mock de notas pendientes
    const [pendingNotes, setPendingNotes] = useState([
        { 
            id: 'n1', 
            patient: 'Ana Gomez', 
            summary: 'Paciente reporta adherencia al protocolo. Menciona consumo dudoso de un suplemento (Dosis incierta).', 
            draftHTML: 'Evolución favorable. Refiere buena tolerancia al protocolo GI. Menciona tomar <span class="bg-amber-200 text-amber-900 px-1 rounded font-bold" title="Confidence: 45%. Por favor, verifica la dosis exacta.">Magnesio 500mg (?)</span> por las noches.' 
        }
    ]);

    if (pendingNotes.length === 0) {
        return null; // Inbox Zero
    }

    const handleSign = (id: string) => {
        setPendingNotes(prev => prev.filter(n => n.id !== id));
        if (pendingNotes.length <= 1) {
            setIsExpanded(false);
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right ${
            isExpanded ? 'w-[90vw] max-w-2xl' : 'w-auto'
        }`}>
            {!isExpanded ? (
                <button 
                    onClick={() => setIsExpanded(true)}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center relative transition-transform hover:scale-105 ${
                        isClinical ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-indigo-500 text-white shadow-indigo-500/30'
                    }`}
                >
                    <Mic size={24} />
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 ${isClinical ? 'border-white' : 'border-zinc-900'}`}>
                        {pendingNotes.length}
                    </span>
                </button>
            ) : (
                <div className={`rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
                    isClinical 
                        ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-slate-200/50' 
                        : 'bg-zinc-900/95 backdrop-blur-xl border-zinc-800 shadow-black/50'
                }`}>
                    
                    {/* Header */}
                    <div className={`px-6 py-4 flex items-center justify-between border-b border-dashed ${
                        isClinical ? 'border-slate-200' : 'border-zinc-800'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
                            }`}>
                                <Mic size={14} />
                            </div>
                            <h4 className={`font-bold text-sm ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                Voice-to-Chart <span className={`text-xs font-normal ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>({pendingNotes.length} pendientes)</span>
                            </h4>
                        </div>
                        <button 
                            onClick={() => setIsExpanded(false)}
                            className={`p-2 rounded-full transition-colors ${
                                isClinical ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-white/10 text-zinc-400'
                            }`}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Expanded View (Column Layout for Panel) */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="max-h-[70vh] overflow-y-auto"
                            >
                                {pendingNotes.map(note => (
                                    <div key={note.id} className={`flex flex-col p-6 gap-6 border-b last:border-0 ${
                                        isClinical ? 'border-slate-100' : 'border-zinc-800'
                                    }`}>
                                        {/* Top: Summary */}
                                        <div className="space-y-2">
                                            <h5 className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                                Transcripción Resumida
                                            </h5>
                                            <div className={`p-4 rounded-2xl text-sm ${isClinical ? 'bg-slate-50 text-slate-700' : 'bg-black/20 text-zinc-300'}`}>
                                                <p><span className="font-bold">Paciente:</span> {note.patient}</p>
                                                <p className="mt-2">{note.summary}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Bottom: Draft & Action */}
                                        <div className="space-y-2 flex flex-col">
                                            <h5 className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-indigo-500' : 'text-indigo-400'}`}>
                                                Borrador Clínico (Generado por IA)
                                            </h5>
                                            <div 
                                                contentEditable
                                                suppressContentEditableWarning
                                                dangerouslySetInnerHTML={{ __html: note.draftHTML }}
                                                className={`min-h-[100px] p-4 rounded-2xl text-sm w-full border focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all ${
                                                    isClinical ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-white'
                                                }`}
                                            />
                                            <div className="flex gap-2 mt-4">
                                                <button 
                                                    onClick={() => handleSign(note.id)}
                                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
                                                        isClinical ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-50 text-white hover:bg-indigo-600'
                                                    }`}
                                                >
                                                    <FileSignature size={18} /> Firmar y Archivar
                                                </button>
                                                <button 
                                                    onClick={() => handleSign(note.id)}
                                                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                                                    isClinical ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                                }`}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

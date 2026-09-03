import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface InvisibleCopilotProps {
    initialSuggestion: string;
    onApprove: (finalText: string) => Promise<void>;
}

export const InvisibleCopilot: React.FC<InvisibleCopilotProps> = ({ initialSuggestion, onApprove }) => {
    // Estado para el texto editable
    const [text, setText] = useState(initialSuggestion);
    const [isDirty, setIsDirty] = useState(false);

    // Estados para la UI Optimista
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const contentEditableRef = useRef<HTMLDivElement>(null);
    const debouncedText = useDebounce(text, 300);

    // Efecto para detectar si el texto ha cambiado respecto a la sugerencia inicial
    useEffect(() => {
        if (debouncedText !== initialSuggestion) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [debouncedText, initialSuggestion]);

    // Manejador del campo editable
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        setText(e.currentTarget.textContent || '');
    };

    // Aplicar estilo 'JetBrains Mono' a los números de forma inicial
    const renderInitialHTML = (content: string) => {
        // Envolvemos números y porcentajes en un span con la fuente tabular
        return content.replace(/(\d+%?|\b\d+\b)/g, '<span class="font-mono tabular-nums text-zinc-900 dark:text-white font-medium">$1</span>');
    };

    // UI Optimista: Oculta la tarjeta inmediatamente y lanza el request
    const handleApprove = async () => {
        setIsSubmitting(true);
        setIsVisible(false); // Colapso fluido optimista
        try {
            await onApprove(text);
        } catch (error) {
            // Si falla en el backend, revertimos la UI
            setIsVisible(true);
            setIsSubmitting(false);
            console.error("Error al aprobar la sugerencia:", error);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    layout
                    initial={{ opacity: 0, height: 0, y: 10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95, margin: 0, padding: 0 }}
                    transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1] }}
                    className="glass-card-clinical bg-white/80 backdrop-blur-xl p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center border border-emerald-200/50">
                                <Sparkles className="w-4 h-4 text-[#88B04B]" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] mb-2 font-sans flex items-center gap-2">
                                    Copiloto Invisible
                                    {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>}
                                </h4>

                                {/* Contenedor Editable Inline */}
                                <div
                                    ref={contentEditableRef}
                                    contentEditable
                                    onInput={handleInput}
                                    suppressContentEditableWarning
                                    dangerouslySetInnerHTML={{ __html: renderInitialHTML(initialSuggestion) }}
                                    className="outline-none min-h-[40px] p-3 -ml-3 rounded-xl hover:bg-slate-50/80 focus:bg-slate-50 focus:ring-1 focus:ring-slate-200 transition-all text-slate-700 font-sans leading-relaxed cursor-text"
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <motion.button
                                    layout
                                    onClick={handleApprove}
                                    disabled={isSubmitting}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${isDirty
                                            ? 'bg-zinc-900 text-white hover:brightness-110 shadow-[0_0_20px_rgba(206,255,0,0.3)] border border-indigo-500/30'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                                        }`}
                                >
                                    <motion.span layout className="flex items-center gap-2">
                                        {isDirty ? (
                                            <>
                                                <motion.div
                                                    initial={{ rotate: -90, opacity: 0 }}
                                                    animate={{ rotate: 0, opacity: 1 }}
                                                >
                                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                                </motion.div>
                                                <span className="text-white">Sellar Modificación</span>
                                            </>
                                        ) : (
                                            <>
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                >
                                                    <Check className="w-4 h-4" />
                                                </motion.div>
                                                <span>Aprobar y Actualizar</span>
                                            </>
                                        )}
                                    </motion.span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

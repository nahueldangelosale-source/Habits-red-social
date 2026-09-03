import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, X } from 'lucide-react';

export type WidgetType = 'LOGISTICS_DAY_1' | 'CLINICAL_DAY_3';

interface AureaChatWidgetProps {
    type: WidgetType;
    onComplete: (selectedValue: string) => void;
    onDismiss: () => void;
}

/**
 * AUREA Chat Widget - Behavioral Profiler (Discovery Track / Fake Door)
 * 
 * Implementa el "Nudge" logístico asíncrono.
 * Diseño: Bottom-sheet flotante, no invasivo (ocupa 30% inferior).
 * Estética: Minimalista oscuro, avatar de IA diferenciado (halo neón).
 * Micro-interacciones: 3s Labor Illusion post-click.
 */
export const AureaChatWidget: React.FC<AureaChatWidgetProps> = ({ type, onComplete, onDismiss }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [processingState, setProcessingState] = useState<'idle' | 'compiling' | 'injected'>('idle');

    // Mocks for LOGISTICS_DAY_1
    const options = [
        { id: 'home_gym', label: 'Home Gym (Mancuernas)' },
        { id: 'commercial_gym', label: 'Gimnasio Comercial' },
        { id: 'bodyweight', label: 'Solo Peso Corporal' }
    ];

    const handleSelect = (id: string) => {
        if (processingState !== 'idle') return;
        
        // 1. Telemetry Tracking (The "Fake Door" measurement)
        console.log(`[TELEMETRY] TRACK: aurea_widget_used | widget_type: ${type} | selection: ${id}`);
        // Here we would push to our analytics layer (e.g., Mixpanel/PostHog)
        
        setSelectedOption(id);
        setProcessingState('compiling');

        // 2. Micro-momento: Compilando (0s a 2s)
        // El botón seleccionado brilla, los demás desaparecen.
        setTimeout(() => {
            // 3. Micro-momento: Inyectado (2s a 3s)
            setProcessingState('injected');
        }, 1800);

        setTimeout(() => {
            // 4. Finalización y Desmontaje
            onComplete(id);
        }, 3000);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute bottom-[80px] left-4 right-4 z-50 pointer-events-none"
            >
                {/* Contenedor Flotante No Invasivo */}
                <div className="bg-zinc-950/90 backdrop-blur-xl border border-lime-500/20 rounded-[2rem] p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden">
                    
                    {/* Efecto Glow Top Edge */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-400 to-transparent opacity-50" />

                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900 border border-lime-500/30">
                                <BrainCircuit className="w-5 h-5 text-lime-400 relative z-10" />
                                {/* Halo Neón AUREA */}
                                <motion.div 
                                    className="absolute inset-0 rounded-full bg-lime-400/20 blur-md"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                            </div>
                            <div>
                                <h4 className="text-lime-400 font-black tracking-widest uppercase text-[10px] leading-none mb-1">AUREA</h4>
                                <p className="text-zinc-300 text-sm font-medium leading-tight max-w-[220px]">
                                    Gino está calibrando. ¿Qué equipo tendrás disponible mañana?
                                </p>
                            </div>
                        </div>
                        {processingState === 'idle' && (
                            <button onClick={onDismiss} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-full hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 relative min-h-[140px]">
                        <AnimatePresence>
                            {processingState === 'idle' && options.map((opt) => (
                                <motion.button
                                    key={opt.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => handleSelect(opt.id)}
                                    className="w-full text-left px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-zinc-200 font-bold text-sm"
                                >
                                    {opt.label}
                                </motion.button>
                            ))}
                        </AnimatePresence>

                        {/* ESTADOS DE PROCESAMIENTO (THE CLIFFHANGER) */}
                        <AnimatePresence>
                            {processingState !== 'idle' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-center"
                                >
                                    <div className="w-16 h-16 rounded-full bg-lime-500/10 border border-lime-500/30 flex items-center justify-center mb-4 relative">
                                        {processingState === 'compiling' ? (
                                            <>
                                                <BrainCircuit className="w-7 h-7 text-lime-400 z-10" />
                                                <motion.div 
                                                    className="absolute inset-0 rounded-full border-2 border-t-lime-400 border-r-transparent border-b-transparent border-l-transparent"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                                />
                                            </>
                                        ) : (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring" }}
                                            >
                                                <CheckCircle2 className="w-8 h-8 text-lime-400" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <h5 className="text-lime-400 font-black uppercase tracking-widest text-xs mb-1">
                                        {processingState === 'compiling' ? 'Sincronizando' : 'Inyectado'}
                                    </h5>
                                    <p className="text-zinc-400 text-xs font-mono">
                                        {processingState === 'compiling' 
                                            ? 'Traduciendo selección al motor clínico...' 
                                            : 'Parámetros actualizados en el Blueprint.'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RPEBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rpe: number) => void;
    exerciseName: string;
}

export const RPEBottomSheet: React.FC<RPEBottomSheetProps> = ({ isOpen, onClose, onSubmit, exerciseName }) => {
    const [selectedRpe, setSelectedRpe] = useState<number | null>(null);

    // Auto-hide tras selección para UX Zero-Fricción
    useEffect(() => {
        if (selectedRpe !== null) {
            const timer = setTimeout(() => {
                onSubmit(selectedRpe);
                setSelectedRpe(null);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [selectedRpe, onSubmit]);

    // Cerramos el modal cuando termine el enter animation si se apretó backdrop
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
            setSelectedRpe(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-md bg-zinc-900 rounded-t-3xl sm:rounded-2xl border-t border-zinc-800 p-6 pb-10 sm:pb-6 shadow-2xl"
                    >
                        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6 opacity-50" />
                        
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white mb-1">Telemetría RPE</h3>
                            <p className="text-zinc-400 text-sm">
                                ¿Qué tan intensa fue tu última serie de <span className="text-lime-400 font-medium">{exerciseName}</span>?
                            </p>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {[...Array(10)].map((_, i) => {
                                const rpeValue = i + 1;
                                const isSelected = selectedRpe === rpeValue;
                                
                                // Color scale from green to red based on RPE
                                let colorClass = 'border-zinc-700 text-zinc-300 hover:border-lime-500/50 hover:bg-lime-500/10';
                                if (isSelected) {
                                    if (rpeValue <= 4) colorClass = 'border-lime-400 bg-lime-400/20 text-lime-400';
                                    else if (rpeValue <= 7) colorClass = 'border-yellow-400 bg-yellow-400/20 text-yellow-400';
                                    else colorClass = 'border-red-500 bg-red-500/20 text-red-500';
                                }

                                return (
                                    <button
                                        key={rpeValue}
                                        onClick={() => setSelectedRpe(rpeValue)}
                                        className={`h-14 rounded-xl border-2 transition-all flex items-center justify-center text-lg font-bold
                                            ${colorClass}
                                            ${selectedRpe !== null && !isSelected ? 'opacity-30 scale-95' : 'scale-100'}
                                        `}
                                    >
                                        {rpeValue}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="flex justify-between text-xs font-medium text-zinc-500 mt-3 px-1 uppercase tracking-wider">
                            <span>Muy Ligero (1-4)</span>
                            <span>Fallo Muscular (10)</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert } from 'lucide-react';

interface SessionRPEBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rpe: number, jointPain: boolean) => void;
}

export const SessionRPEBottomSheet: React.FC<SessionRPEBottomSheetProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selectedRpe, setSelectedRpe] = useState<number | null>(null);
    const [jointPain, setJointPain] = useState<boolean | null>(null);

    // Auto-hide tras completar ambos campos para UX Zero-Fricción (< 3 segundos)
    useEffect(() => {
        if (selectedRpe !== null && jointPain !== null) {
            const timer = setTimeout(() => {
                onSubmit(selectedRpe, jointPain);
                // Reset state for next time
                setSelectedRpe(null);
                setJointPain(null);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [selectedRpe, jointPain, onSubmit]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-md bg-zinc-950 rounded-t-3xl sm:rounded-2xl border-t border-zinc-800 p-6 pb-10 sm:pb-6 shadow-2xl relative overflow-hidden"
                    >
                        {/* WIIFM Glowing Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-lime-400 to-emerald-500" />
                        
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6" />
                        
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Activity className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Telemetría de Cierre</h3>
                            <p className="text-indigo-400/80 text-xs font-medium tracking-wide uppercase">
                                Calibrando tu próxima sesión para evitar sobreentrenamiento...
                            </p>
                        </div>

                        {/* Pregunta 1: Molestias Articulares */}
                        <div className="mb-8">
                            <p className="text-zinc-400 text-sm font-medium mb-3 flex items-center justify-center">
                                <ShieldAlert className="w-4 h-4 mr-2 text-zinc-500" />
                                ¿Experimentaste molestias articulares anómalas?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setJointPain(false)}
                                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                                        jointPain === false 
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400' 
                                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                                    }`}
                                >
                                    NO (Limpio)
                                </button>
                                <button
                                    onClick={() => setJointPain(true)}
                                    className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                                        jointPain === true 
                                        ? 'border-orange-500 bg-orange-500/10 text-orange-400' 
                                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                                    }`}
                                >
                                    SÍ (Reportar)
                                </button>
                            </div>
                        </div>

                        {/* Pregunta 2: RPE Global */}
                        <div className={`transition-all duration-300 ${jointPain !== null ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                            <p className="text-zinc-400 text-sm font-medium mb-3 text-center">
                                Esfuerzo Percibido Global (sRPE)
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                                {[...Array(10)].map((_, i) => {
                                    const rpeValue = i + 1;
                                    const isSelected = selectedRpe === rpeValue;
                                    
                                    let colorClass = 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-lime-500/30';
                                    if (isSelected) {
                                        if (rpeValue <= 4) colorClass = 'border-lime-400 bg-lime-400/20 text-lime-400 scale-105';
                                        else if (rpeValue <= 7) colorClass = 'border-yellow-400 bg-yellow-400/20 text-yellow-400 scale-105';
                                        else colorClass = 'border-red-500 bg-red-500/20 text-red-500 scale-105';
                                    }

                                    return (
                                        <button
                                            key={rpeValue}
                                            onClick={() => setSelectedRpe(rpeValue)}
                                            className={`h-12 rounded-xl border-2 transition-all flex items-center justify-center text-lg font-black
                                                ${colorClass}
                                                ${selectedRpe !== null && !isSelected ? 'opacity-30 scale-95' : ''}
                                            `}
                                        >
                                            {rpeValue}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-zinc-600 mt-2 px-1 uppercase tracking-wider">
                                <span>Paseo (1)</span>
                                <span>Límite Total (10)</span>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

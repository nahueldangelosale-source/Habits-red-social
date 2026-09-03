import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useBiometricStore } from '../../stores/useBiometricStore';
import { toast } from 'sonner';

export const BiometricHUD: React.FC = () => {
    // 1. Transient State Architecture: Strict Selectors to prevent re-renders
    const hr = useBiometricStore(state => state.metrics.current_hr);
    const hrZone = useBiometricStore(state => state.metrics.hr_zone);
    const uiDirective = useBiometricStore(state => state.ui_state_directive);
    const recoveryRate = useBiometricStore(state => state.metrics.recovery_rate_bpm);
    const updateTelemetry = useBiometricStore(state => state.updateTelemetry);
    
    const [isRpeModalOpen, setIsRpeModalOpen] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    // WebSocket Hook for Vibe Coding Mock
    useEffect(() => {
        // Connect to the FastAPI Mock Endpoint
        const ws = new WebSocket(`ws://localhost:8000/api/v1/ws-telemetry/mock-telemetry/uuid-1234`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            updateTelemetry(data);
        };

        return () => {
            ws.close();
        };
    }, [updateTelemetry]);

    // RPE Modal Trigger Logic
    useEffect(() => {
        // If recovery rate drops significantly, it means we are resting. Trigger RPE Modal.
        if (uiDirective === 'RECOVERY_MODE' && recoveryRate < -10 && !isRpeModalOpen) {
            setIsRpeModalOpen(true);
        } else if (uiDirective === 'FOCUS_MODE') {
            setIsRpeModalOpen(false);
        }
    }, [uiDirective, recoveryRate, isRpeModalOpen]);

    // Background Variants (GPU Accelerated)
    const backgroundVariants = {
        zone1: { backgroundColor: '#f3f4f6' }, // Gray
        zone2: { backgroundColor: '#dbeafe' }, // Blue
        zone3: { backgroundColor: '#dcfce3' }, // Green
        zone4: { backgroundColor: '#fef9c3' }, // Yellow
        zone5: { backgroundColor: '#fee2e2' }  // Red (High Alert)
    };

    const handleRpeSubmit = (value: number) => {
        toast.success(`RPE ${value} registrado.`);
        setIsRpeModalOpen(false);
    };

    return (
        <motion.div 
            className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden transition-colors"
            variants={backgroundVariants}
            animate={`zone${hrZone}`}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            {/* Main HUD Display */}
            <div className={`z-10 flex flex-col items-center justify-center p-8 rounded-full shadow-2xl backdrop-blur-md ${hrZone === 5 ? 'bg-red-600/20' : 'bg-white/50'}`}>
                <h1 className="text-8xl font-black font-montserrat text-gray-900 tracking-tighter">
                    {hr}
                </h1>
                <p className="text-xl font-bold font-lato text-gray-600 uppercase tracking-widest mt-2">
                    BPM
                </p>
            </div>

            {/* Sub-metrics: Only visible if not in Zone 5 (Cognitive Load Reduction) */}
            <AnimatePresence>
                {hrZone < 5 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-20 flex gap-12 font-lato"
                    >
                        <div className="text-center">
                            <p className="text-sm text-gray-500 font-semibold uppercase">Zona</p>
                            <p className="text-2xl font-bold text-gray-800">{hrZone}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 font-semibold uppercase">Estado</p>
                            <p className="text-2xl font-bold text-gray-800">{uiDirective}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RPE One-Touch Modal (For shaking hands) */}
            <AnimatePresence>
                {isRpeModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center p-6"
                    >
                        <h2 className="text-3xl font-black font-montserrat text-white mb-8 text-center">
                            ¿Qué tan duro fue esa serie?
                        </h2>
                        {/* One-Touch Grid: Huge targets for shaking hands */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                            <button onClick={() => handleRpeSubmit(4)} className="py-8 bg-green-500 hover:bg-green-400 rounded-2xl text-2xl font-bold font-montserrat text-white shadow-lg active:scale-95 transition-transform">
                                Fácil (1-4)
                            </button>
                            <button onClick={() => handleRpeSubmit(6)} className="py-8 bg-yellow-500 hover:bg-yellow-400 rounded-2xl text-2xl font-bold font-montserrat text-white shadow-lg active:scale-95 transition-transform">
                                Moderado (5-7)
                            </button>
                            <button onClick={() => handleRpeSubmit(8)} className="py-8 bg-orange-500 hover:bg-orange-400 rounded-2xl text-2xl font-bold font-montserrat text-white shadow-lg active:scale-95 transition-transform">
                                Difícil (8-9)
                            </button>
                            <button onClick={() => handleRpeSubmit(10)} className="py-8 bg-red-600 hover:bg-red-500 rounded-2xl text-2xl font-bold font-montserrat text-white shadow-lg active:scale-95 transition-transform">
                                Al Límite (10)
                            </button>
                        </div>
                        <p className="text-gray-400 font-lato mt-8 text-center">
                            Toca un botón para registrar tu RPE.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

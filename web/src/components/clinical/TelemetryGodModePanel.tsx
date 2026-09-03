import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Moon, Zap, RefreshCw, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const TelemetryGodModePanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isInjecting, setIsInjecting] = useState(false);
    const [alertFired, setAlertFired] = useState(false);
    const { mode } = useTheme();

    const handleInjectSleepDeprivation = () => {
        setIsInjecting(true);
        setTimeout(() => {
            setIsInjecting(false);
            setAlertFired(true);
            setTimeout(() => setAlertFired(false), 5000);
        }, 1500);
    };

    return (
        <>
            {/* Botón flotante para abrir el panel */}
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                title="Inyector de Telemetría (God Mode)"
            >
                <Settings size={20} />
            </button>

            {/* Panel Flotante */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, x: -50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.9 }}
                        className="fixed bottom-24 left-6 z-50 w-80 bg-white border-2 border-slate-900 rounded-3xl shadow-2xl overflow-hidden font-sans"
                    >
                        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <Zap size={16} className="text-amber-400" />
                                Telemetry Injector
                            </div>
                            <button onClick={() => setIsOpen(false)} className="opacity-50 hover:opacity-100">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <p className="text-xs text-slate-500 font-medium">
                                Simula la ingesta pasiva de datos biomecánicos (Oura/Apple Health) para probar la recalibración del RAG.
                            </p>

                            <button 
                                onClick={handleInjectSleepDeprivation}
                                disabled={isInjecting}
                                className="w-full p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between hover:bg-indigo-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                                        <Moon size={14} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-indigo-900 leading-tight">Sueño Profundo &lt; 45m</div>
                                        <div className="text-[10px] text-indigo-500">Inyectar en Paciente Activo</div>
                                    </div>
                                </div>
                                {isInjecting && <RefreshCw size={14} className="text-indigo-500 animate-spin" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Alerta Global Mock (Aparece cuando el trigger funciona) */}
            <AnimatePresence>
                {alertFired && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed top-24 right-6 z-[100] w-96 bg-amber-50 border border-amber-200 rounded-2xl shadow-2xl p-5"
                    >
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                                <Activity size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm">Alerta Biomecánica (Oura Ring)</h4>
                                <p className="text-xs text-amber-700 mt-1 mb-2 leading-relaxed">
                                    El paciente registró 35min de sueño profundo. El motor RAG ha aplicado la regla de <strong>Resistencia Transitoria a la Insulina</strong>.
                                </p>
                                <div className="bg-white/50 px-2 py-1 rounded text-[10px] font-bold text-amber-900 border border-amber-200/50">
                                    Ajuste Automático: Carbohidratos -20%, Grasas +15% para el día de hoy.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

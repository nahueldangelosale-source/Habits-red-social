import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Camera, CheckCircle2, ChevronLeft, Activity, Bell, Flame, Moon, Compass, Coffee, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';

export const PatientMobileSimulator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { mode } = useTheme();
    // Forzamos un tema oscuro inmersivo para B2C
    const isClinical = mode === 'CLINICAL';

    const [isRecording, setIsRecording] = useState(false);
    const [showNudge, setShowNudge] = useState(true);
    const [confession, setConfession] = useState<string | null>(null);
    const [isSOSMode, setIsSOSMode] = useState(false);

    const handleRecord = () => {
        setIsRecording(true);
        setTimeout(() => {
            setIsRecording(false);
            setConfession("Ayer a la noche tuve un atracón de pizza y cerveza por estrés del trabajo.");
            // Ocultamos el nudge anterior y mostramos uno nuevo tras confesión
            setShowNudge(false);
            setTimeout(() => {
                setShowNudge(true);
            }, 1000);
        }, 3000);
    };

    if (isSOSMode) {
        return (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white font-sans text-center">
                <div className="max-w-xs w-full space-y-8">
                    <div>
                        <h2 className="text-2xl font-black mb-2 text-rose-400">Contención de Crisis</h2>
                        <p className="text-zinc-400 text-sm">Respiración de Caja (Box Breathing)</p>
                    </div>

                    {/* Box Breathing Animation */}
                    <div className="w-48 h-48 mx-auto relative flex items-center justify-center border-2 border-zinc-800 rounded-3xl overflow-hidden">
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1.5, 1, 1] }}
                            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 bg-rose-500/20 rounded-full blur-xl absolute"
                        />
                        <motion.div 
                            animate={{ 
                                opacity: [0.5, 1, 1, 0.5, 0.5],
                                scale: [1, 1.2, 1.2, 1, 1]
                            }}
                            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 border border-rose-500/50 rounded-full flex items-center justify-center relative z-10 bg-black/50 backdrop-blur-md"
                        >
                            <span className="font-bold text-rose-400">Inhala 4s</span>
                        </motion.div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl text-left">
                        <h3 className="font-bold text-sm mb-2 text-indigo-400">Técnica de Enraizamiento (5-4-3-2-1)</h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">Antes de actuar, nombra en voz alta 5 cosas que puedes ver en la habitación, 4 cosas que puedes tocar, 3 que puedes oír.</p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors" onClick={() => setIsSOSMode(false)}>
                            Comer y Registrarlo (Sin juicios)
                        </button>
                        <button className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-rose-500/20">
                            Mensaje de Emergencia al Coach
                        </button>
                        <button className="w-full py-3 text-zinc-500 font-bold text-xs" onClick={() => setIsSOSMode(false)}>
                            Ya estoy mejor. Volver.
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            
            {/* Controles del Simulador */}
            <div className="absolute top-6 left-6 flex items-center gap-4">
                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors font-bold text-sm"
                >
                    <ChevronLeft size={16} /> Volver al "God Mode" Clínico
                </button>
                <div className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} /> Vista de Paciente B2C
                </div>
            </div>

            {/* Smartphone Frame */}
            <div className="w-[375px] h-[812px] bg-[#09090b] rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col font-sans text-white">
                
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-zinc-800 rounded-b-3xl w-40 mx-auto z-20"></div>

                {/* Header App */}
                <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                            <Flame size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-400 font-medium">Fase 2: Quema Acelerada</p>
                            <h2 className="font-bold text-lg leading-tight">Día 14 <span className="opacity-40">/ 90</span></h2>
                        </div>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center relative">
                        <Bell size={20} className="text-zinc-300" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
                    </button>
                </header>

                {/* Main Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6">
                    
                    {/* Asynchronous SLA Banner */}
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3 flex items-center justify-center gap-2 mt-4">
                        <Clock size={14} className="text-indigo-400" />
                        <span className="text-[10px] text-indigo-300 font-bold tracking-wide">Tu Nutricionista responde de L-V entre 16:00 y 17:00hs</span>
                    </div>
                    
                    {/* GPS Metabólico Nudge */}
                    <AnimatePresence>
                        {showNudge && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20, height: 0 }} 
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <Compass size={100} />
                                </div>
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 mt-1">
                                        <Activity size={16} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-500 mb-1">GPS Metabólico Activo</h3>
                                        {confession ? (
                                            <p className="text-sm text-zinc-300 leading-relaxed">
                                                No te preocupes. Hemos reducido automáticamente los carbohidratos de hoy en un 15% para absorber el impacto de la pizza y mantener tu meta semanal intacta. Seguimos adelante.
                                            </p>
                                        ) : (
                                            <p className="text-sm text-zinc-300 leading-relaxed">
                                                Notamos que tu sueño profundo fue bajo ayer (<span className="text-emerald-400 font-bold">35 min</span>). Hemos ajustado tu protocolo de hoy elevando grasas para evitar picos de insulina.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Today's Protocol */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Protocolo de Hoy</h3>
                        <div className="space-y-3">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                        <Coffee size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Ayuno Intermitente</h4>
                                        <p className="text-xs text-zinc-400">Ventana se abre 12:00 PM</p>
                                    </div>
                                </div>
                                <CheckCircle2 size={24} className="text-emerald-500" />
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden opacity-50">
                                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl">
                                    🥗
                                </div>
                                <div>
                                    <h4 className="font-bold">Almuerzo Antiinflamatorio</h4>
                                    <p className="text-xs text-zinc-400">12:30 PM • 650 kcal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deterministic Telemetry Section (FinOps Phase 6) */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4">Check-in de Hábitos (FinOps)</h3>
                        <div className="space-y-4">
                            {/* Sleep Telemetry */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Moon className="text-indigo-400 w-5 h-5" />
                                    <h4 className="font-bold text-sm text-zinc-200">¿Cómo dormiste anoche?</h4>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={async () => {
                                            setConfession("Dormí menos de 5 horas");
                                            setShowNudge(false); setTimeout(() => setShowNudge(true), 500);
                                            try { await api.post('/api/v1/clinical/telemetry/bypass', { event_type: 'sleep_log', status: 'Low', raw_value: 4.5 }); } catch(e){}
                                        }}
                                        className="flex-1 py-3 px-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-colors"
                                    >
                                        &lt; 5 horas
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            setConfession("Dormí entre 5 y 7 horas");
                                            setShowNudge(false); setTimeout(() => setShowNudge(true), 500);
                                            try { await api.post('/api/v1/clinical/telemetry/bypass', { event_type: 'sleep_log', status: 'Optimal', raw_value: 6.5 }); } catch(e){}
                                        }}
                                        className="flex-1 py-3 px-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-colors"
                                    >
                                        5 - 7 horas
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            setConfession("Dormí más de 7 horas");
                                            setShowNudge(false); setTimeout(() => setShowNudge(true), 500);
                                            try { await api.post('/api/v1/clinical/telemetry/bypass', { event_type: 'sleep_log', status: 'Optimal', raw_value: 8.0 }); } catch(e){}
                                        }}
                                        className="flex-1 py-3 px-2 bg-zinc-800 hover:bg-lime-500/20 hover:text-lime-400 border border-transparent hover:border-lime-500/50 rounded-xl text-xs font-bold text-zinc-300 transition-colors"
                                    >
                                        &gt; 7 horas
                                    </button>
                                </div>
                            </div>

                            {/* Nutrition/Adherence Telemetry */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <Activity className="text-emerald-400 w-5 h-5" />
                                    <h4 className="font-bold text-sm text-zinc-200">Adherencia al Protocolo</h4>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={async () => {
                                            setConfession("Cumplí el protocolo al 100%");
                                            setShowNudge(false); setTimeout(() => setShowNudge(true), 500);
                                            try { await api.post('/api/v1/clinical/telemetry/bypass', { event_type: 'adherence_log', status: 'Optimal', raw_value: 1.0 }); } catch(e){}
                                        }}
                                        className="w-full py-3 bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50 border border-transparent rounded-xl text-sm font-bold text-zinc-300 transition-colors"
                                    >
                                        Cumplí al 100% (Verde)
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            setConfession("Tuve un desliz moderado");
                                            setShowNudge(false); setTimeout(() => setShowNudge(true), 500);
                                            try { await api.post('/api/v1/clinical/telemetry/bypass', { event_type: 'adherence_log', status: 'Medium', raw_value: 0.5 }); } catch(e){}
                                        }}
                                        className="w-full py-3 bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/50 border border-transparent rounded-xl text-sm font-bold text-zinc-300 transition-colors"
                                    >
                                        Desliz moderado (Amarillo)
                                    </button>
                                    <button 
                                        onClick={async () => {
                                            setConfession("No pude cumplir hoy");
                                            setShowNudge(false); setTimeout(() => setShowNudge(true), 500);
                                            try { await api.post('/api/v1/clinical/telemetry/bypass', { event_type: 'adherence_log', status: 'Low', raw_value: 0.0 }); } catch(e){}
                                        }}
                                        className="w-full py-3 bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/50 border border-transparent rounded-xl text-sm font-bold text-zinc-300 transition-colors"
                                    >
                                        Fuera de protocolo (Rojo)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Nav */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-black/90 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-6 pb-6">
                    <div className="flex flex-col items-center gap-1 text-emerald-500">
                        <Activity size={24} />
                        <span className="text-[10px] font-bold">Hoy</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-zinc-500">
                        <Compass size={24} />
                        <span className="text-[10px] font-bold">Viaje</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-zinc-500">
                        <Bell size={24} />
                        <span className="text-[10px] font-bold">Nudges</span>
                    </div>
                </div>

                {/* Botón Flotante SOS (FAB) */}
                <button 
                    onClick={() => setIsSOSMode(true)}
                    className="absolute bottom-28 right-6 w-14 h-14 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 hover:scale-105 transition-transform z-30"
                    aria-label="Botón SOS Contención"
                >
                    <Flame size={24} />
                </button>

            </div>
        </div>
    );
};

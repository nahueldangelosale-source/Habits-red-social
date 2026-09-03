import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Activity, Zap, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';

// Mocks basados en la arquitectura del Bucle de Identidad
export type CrystalType = 'OBSIDIAN' | 'TITANIUM' | 'QUARTZ' | 'AMBER';

interface GraduationProps {
    crystalType: CrystalType;
    onClose: () => void;
}

export const WorkoutGraduation: React.FC<GraduationProps> = ({ crystalType, onClose }) => {
    const { calmMode } = useCognitiveLoad();
    const [step, setStep] = useState(0); // 0: Análisis, 1: Cristal, 2: Radar
    
    // Configuración del Cristal
    const getCrystalConfig = () => {
        switch (crystalType) {
            case 'TITANIUM':
                return {
                    name: 'Cristal de Titanio',
                    color: 'from-zinc-300 to-zinc-600',
                    text: 'text-zinc-200',
                    border: 'border-zinc-500/50',
                    icon: <Trophy className="w-8 h-8 text-zinc-300" />,
                    title: 'Fuerza Base Expandida',
                    description: 'Rompiste tu meseta en Sentadilla. AUREA ha cristalizado tu progreso en Tensión Mecánica.'
                };
            case 'QUARTZ':
                return {
                    name: 'Cristal de Cuarzo',
                    color: 'from-cyan-300 to-blue-600',
                    text: 'text-cyan-300',
                    border: 'border-cyan-500/50',
                    icon: <CheckCircle2 className="w-8 h-8 text-cyan-300" />,
                    title: 'Precisión Clínica',
                    description: 'Mapeaste el RPE exacto que prescribió tu Coach (0 desviaciones).'
                };
            case 'AMBER':
                return {
                    name: 'Cristal Ámbar',
                    color: 'from-orange-400 to-amber-600',
                    text: 'text-orange-400',
                    border: 'border-orange-500/50',
                    icon: <Activity className="w-8 h-8 text-orange-400" />,
                    title: 'Semilla de Resiliencia',
                    description: 'AUREA detectó sobrecarga hoy. Hemos priorizado tu Recuperación Activa. Rendirse hoy para pelear mañana es una victoria clínica.'
                };
            case 'OBSIDIAN':
            default:
                return {
                    name: 'Cristal de Obsidiana',
                    color: 'from-zinc-800 to-black',
                    text: 'text-zinc-400',
                    border: 'border-zinc-700',
                    icon: <Zap className="w-8 h-8 text-zinc-500" />,
                    title: 'Consistencia Inquebrantable',
                    description: '30 días sin fallar. Has anclado el hábito en tu sistema nervioso.'
                };
        }
    };
    
    const config = getCrystalConfig();

    // Simular el escaneo y transición
    React.useEffect(() => {
        if (step === 0) {
            const timer = setTimeout(() => setStep(1), 2500); // Labor Illusion
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 ${calmMode ? 'bg-[#0f111a]' : 'bg-[#0a0a0a]'}`}>
            <AnimatePresence mode="wait">
                
                {/* Paso 0: Labor Illusion (Análisis) */}
                {step === 0 && (
                    <motion.div 
                        key="analysis"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-lime-400 animate-spin opacity-50" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-4 rounded-full border-b-2 border-r-2 border-indigo-500 animate-spin opacity-30" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                            <Activity className="w-10 h-10 text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-widest uppercase">Sintetizando Sesión</h2>
                            <p className="text-zinc-500 text-sm mt-2 font-mono">Calculando Tensión Mecánica & RPE...</p>
                        </div>
                    </motion.div>
                )}

                {/* Paso 1: Revelación del Cristal y Radar */}
                {step >= 1 && (
                    <motion.div 
                        key="graduation"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full max-w-md flex flex-col items-center"
                    >
                        {/* El Cristal 2D (Premium UI) */}
                        <div className="relative w-48 h-48 mb-8">
                            <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className={`absolute inset-0 rounded-3xl rotate-45 bg-gradient-to-br ${config.color} border-2 ${config.border} shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden`}
                            >
                                {/* Simulación de refracción geométrica 2D */}
                                <div className="absolute inset-0 bg-white/5 skew-x-12 translate-x-8" />
                                <div className="absolute inset-0 bg-black/20 -skew-x-12 -translate-x-8" />
                                <div className="rotate-[-45deg]">
                                    {config.icon}
                                </div>
                            </motion.div>
                        </div>

                        {/* Narrativa de Autoridad Clínica */}
                        <div className="text-center mb-8">
                            <motion.h1 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className={`text-2xl font-black uppercase tracking-widest ${config.text} mb-3`}
                            >
                                {config.name}
                            </motion.h1>
                            <motion.h3 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-lg font-bold text-white mb-2"
                            >
                                {config.title}
                            </motion.h3>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="text-zinc-400 text-sm leading-relaxed px-4"
                            >
                                {config.description}
                            </motion.p>
                        </div>

                        {/* Radar de Bio-Síntesis (Abstracción UI) */}
                        {step === 1 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ delay: 1.5 }}
                                className="w-full bg-zinc-900/50 rounded-2xl p-5 border border-zinc-800 mb-8 backdrop-blur-md"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bio-Síntesis</h4>
                                    <span className="text-xs text-lime-400 font-mono">+120 XP</span>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-400 font-medium px-2">
                                    <div className="flex flex-col items-center">
                                        <span className="mb-2">Fuerza</span>
                                        <div className="w-1.5 h-16 bg-zinc-800 rounded-full overflow-hidden flex items-end">
                                            <motion.div 
                                                initial={{ height: '40%' }}
                                                animate={{ height: crystalType === 'TITANIUM' ? '60%' : '40%' }}
                                                transition={{ delay: 2, duration: 1 }}
                                                className={`w-full ${crystalType === 'TITANIUM' ? 'bg-zinc-300' : 'bg-zinc-600'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="mb-2">Metabolismo</span>
                                        <div className="w-1.5 h-16 bg-zinc-800 rounded-full overflow-hidden flex items-end">
                                            <motion.div 
                                                initial={{ height: '30%' }}
                                                animate={{ height: crystalType === 'QUARTZ' ? '45%' : '30%' }}
                                                transition={{ delay: 2, duration: 1 }}
                                                className={`w-full ${crystalType === 'QUARTZ' ? 'bg-cyan-400' : 'bg-cyan-900'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="mb-2">Resiliencia</span>
                                        <div className="w-1.5 h-16 bg-zinc-800 rounded-full overflow-hidden flex items-end">
                                            <motion.div 
                                                initial={{ height: '70%' }}
                                                animate={{ height: crystalType === 'AMBER' ? '85%' : '75%' }}
                                                transition={{ delay: 2, duration: 1 }}
                                                className={`w-full ${crystalType === 'AMBER' ? 'bg-orange-400' : 'bg-orange-900'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            onClick={onClose}
                            className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-colors"
                        >
                            Ir a la Arena
                        </motion.button>
                        
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

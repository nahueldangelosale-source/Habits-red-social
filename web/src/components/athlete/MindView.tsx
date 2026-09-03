import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ActivitySquare, HeartPulse, Brain, ChevronRight, Play } from 'lucide-react';
import { triggerFatigueUpdate, useCognitiveLoad, addResilienceXp } from '../../hooks/useCognitiveLoad';

const RecoveryCard = ({ title, duration, type, icon: Icon, xpReward }: { title: string, duration: string, type: string, icon: any, xpReward: number }) => {
    const handleStart = () => {
        addResilienceXp(xpReward);
        alert(`Sesión iniciada: ${title}. Ganaste +${xpReward} XP de Resiliencia.`);
    };

    return (
        <div className="flex-shrink-0 w-64 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none rounded-3xl p-5 snap-center">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                    <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-500 bg-slate-100 dark:bg-black/50 px-2 py-1 rounded-lg mb-1">{duration}</span>
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">+{xpReward} XP</span>
                </div>
            </div>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-widest uppercase block mb-1">{type}</span>
            <h4 className="text-slate-900 dark:text-white font-bold text-lg leading-tight mb-4">{title}</h4>
            <button 
                onClick={handleStart}
                className="w-full py-2 bg-indigo-500/20 text-indigo-300 font-bold text-sm rounded-xl hover:bg-indigo-500/30 transition-colors flex items-center justify-center"
            >
                <Play className="w-4 h-4 mr-2 fill-indigo-300" /> Iniciar Sesión
            </button>
        </div>
    );
};

// --- SIMILITUD DEL COSENO (MOTOR DE RECOMENDACIÓN) ---
const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const interventionsDB = [
    { id: 1, title: "Respiración Cuadrada (Box Breathing)", duration: "5 min", type: "Sistema Parasimpático", icon: Wind, xpReward: 50, vector: [0.9, 0.2] }, // Alto estrés mental, baja fatiga física
    { id: 2, title: "Movilidad Pélvica y Cadera", duration: "12 min", type: "Descarga Lumbar", icon: ActivitySquare, xpReward: 70, vector: [0.2, 0.9] }, // Bajo estrés mental, alta fatiga física
    { id: 3, title: "Meditación: Escaneo Corporal", duration: "15 min", type: "Mindfulness", icon: Brain, xpReward: 100, vector: [0.8, 0.8] }, // Alto estrés mental, alta fatiga física
];

export const MindView: React.FC = () => {
    const { calmMode, state } = useCognitiveLoad();
    const [afaqAnswered, setAfaqAnswered] = useState(false);

    // Vector del Usuario: [Estrés Mental, Fatiga Física] (0 a 1)
    // En produccion esto vendría del ACWR y los tests de la app
    const userStateVector = useMemo(() => {
        if (state === 'fatigued') return [0.9, 0.8];
        if (state === 'risk' || calmMode) return [0.8, 0.3]; // Mucho miedo/estrés, poca fatiga real
        return [0.2, 0.2]; // Estado óptimo
    }, [state, calmMode]);

    // Ordenar intervenciones usando Similitud del Coseno
    const recommendedInterventions = useMemo(() => {
        return [...interventionsDB]
            .map(intervention => ({
                ...intervention,
                similarity: cosineSimilarity(userStateVector, intervention.vector)
            }))
            .sort((a, b) => b.similarity - a.similarity);
    }, [userStateVector]);

    const handleSantuarioToggle = () => {
        triggerFatigueUpdate(calmMode ? 'optimal' : 'fatigued');
    };

    return (
        <div className="min-h-full p-6 pb-32 bg-transparent relative overflow-hidden">
            
            {/* Efectos Visuales de Fondo (Santuario) */}
            <AnimatePresence>
                {calmMode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
                    >
                        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
                        <div className="absolute bottom-[10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '12s' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-8 relative z-10 flex justify-between items-center">
                <div>
                    <h2 className={`text-3xl font-black ${calmMode ? 'text-indigo-700 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>Santuario</h2>
                    <p className={`text-sm mt-1 ${calmMode ? 'text-indigo-500 dark:text-indigo-400/70' : 'text-slate-500 dark:text-zinc-400'}`}>{calmMode ? 'Descarga Mental Activa' : 'Espacio de Recuperación'}</p>
                </div>
                
                {/* Botón de Emergencia Autonómica */}
                <button 
                    onClick={handleSantuarioToggle}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        calmMode ? 'bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none'
                    }`}
                >
                    <Brain className={`w-6 h-6 ${calmMode ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-zinc-500'}`} />
                </button>
            </header>

            <div className="relative z-10">
                
                {/* AFAQ Micro-Cuestionario (Si no se ha respondido hoy) */}
                <AnimatePresence>
                    {!afaqAnswered && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                            className="bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm dark:shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                            <div className="flex items-start mb-4">
                                <ActivitySquare className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                                <div>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-sm">Prevención de Molestias</h3>
                                    <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                                        Basado en tus molestias de ayer: ¿Sientes temor a lesionarte si entrenas con intensidad hoy?
                                    </p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button 
                                    onClick={() => setAfaqAnswered(true)}
                                    className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/5 py-3 rounded-xl text-slate-600 dark:text-zinc-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cero Dolor. Todo bien.
                                </button>
                                <button 
                                    onClick={() => {
                                        setAfaqAnswered(true);
                                        triggerFatigueUpdate('risk'); // Muta el estado de la app
                                    }}
                                    className="bg-orange-500/10 border border-orange-500/30 py-3 rounded-xl text-orange-400 text-sm font-bold hover:bg-orange-500/20 transition-colors"
                                >
                                    Sí, prefiero ir suave.
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Autonómico actual */}
                <div className={`p-5 rounded-3xl mb-8 flex items-center justify-between border ${
                    calmMode ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/20' : 'bg-lime-400/10 dark:bg-lime-400/5 border-lime-400/20 dark:border-lime-400/10'
                }`}>
                    <div className="flex items-center">
                        <HeartPulse className={`w-8 h-8 mr-4 ${calmMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-lime-600 dark:text-lime-400'}`} />
                        <div>
                            <h4 className={`font-bold ${calmMode ? 'text-indigo-800 dark:text-indigo-200' : 'text-lime-700 dark:text-lime-400'}`}>
                                {calmMode ? 'Prioridad: Cuidarte' : 'Energía al Máximo'}
                            </h4>
                            <p className={`text-xs mt-0.5 leading-relaxed ${calmMode ? 'text-indigo-600 dark:text-indigo-400/80' : 'text-lime-700/80 dark:text-lime-400/60'}`}>
                                {calmMode 
                                    ? 'Notamos que estás cansado hoy. Tu entrenador y la IA han ajustado tu rutina para que sea más suave y proteger tu recuperación.' 
                                    : 'Todo se ve genial para tu próxima sesión.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Carousels de Intervención (Recomendación Inteligente) */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`text-sm font-bold uppercase tracking-widest ${calmMode ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-zinc-400'}`}>
                            Flujos Recomendados (IA)
                        </h3>
                        <ChevronRight className={`w-5 h-5 ${calmMode ? 'text-indigo-500' : 'text-slate-400 dark:text-zinc-600'}`} />
                    </div>
                    
                    {/* Contenedor scrolleable horizontalmente (ocultar scrollbar en CSS global) */}
                    <div className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {recommendedInterventions.map(intervention => (
                            <RecoveryCard 
                                key={intervention.id}
                                title={intervention.title}
                                duration={intervention.duration}
                                type={intervention.type}
                                icon={intervention.icon}
                                xpReward={intervention.xpReward}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

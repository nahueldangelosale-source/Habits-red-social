import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Heart, Star, ChevronRight, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GraduationRitual: React.FC = () => {
    // Esto se renderizará en la App B2C, forzamos dark mode premium (Silent Luxury)
    const [step, setStep] = useState<number>(0);

    // Trigger de confetti en pasos clave
    useEffect(() => {
        if (step === 2) {
            const end = Date.now() + 2 * 1000;
            const colors = ['#fde047', '#eab308', '#ffffff'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [step]);

    return (
        <div className="fixed inset-0 bg-[#050505] z-50 flex items-center justify-center p-6 text-white overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[800px] h-[800px] bg-yellow-500/20 rounded-full blur-[120px]"
                />
            </div>

            <div className="max-w-md w-full relative z-10">
                <AnimatePresence mode="wait">
                    
                    {/* PASO 0: El Libro de Logros */}
                    {step === 0 && (
                        <motion.div 
                            key="step0"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                <Award className="w-10 h-10 text-zinc-400" />
                            </div>
                            <h1 className="text-4xl font-serif italic mb-4">El Fin del Principio.</h1>
                            <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-light">
                                Tu programa de transformación clínica ha concluido oficialmente. Hemos compilado tu historial.
                            </p>
                            <button 
                                onClick={() => setStep(1)}
                                className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-transform"
                            >
                                Revelar mis Logros
                            </button>
                        </motion.div>
                    )}

                    {/* PASO 1: Métricas de Esfuerzo (Prueba de Trabajo) */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-widest text-zinc-500">Tu Legado Clínico</h2>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                                    <Zap className="w-6 h-6 text-yellow-500 mb-3" />
                                    <p className="text-3xl font-black mb-1">1,240</p>
                                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Horas de Esfuerzo</p>
                                </motion.div>
                                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                                    <Heart className="w-6 h-6 text-rose-500 mb-3" />
                                    <p className="text-3xl font-black mb-1">+45%</p>
                                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">HRV Mejorado</p>
                                </motion.div>
                            </div>
                            
                            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.5}} className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 mb-8">
                                <Star className="w-6 h-6 text-emerald-500 mb-3" />
                                <p className="text-3xl font-black mb-1">0</p>
                                <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Días Abandonados</p>
                            </motion.div>

                            <button 
                                onClick={() => setStep(2)}
                                className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-transform mt-4 flex justify-center items-center"
                            >
                                Continuar <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        </motion.div>
                    )}

                    {/* PASO 2: Upsell a la Tribu de Élite (Mantenimiento) */}
                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-b from-yellow-500/20 to-transparent blur-2xl -z-10" />
                            
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                                <Crown className="w-12 h-12 text-black" />
                            </div>
                            
                            <h2 className="text-4xl font-black mb-4">Graduación Oficial</h2>
                            <p className="text-zinc-400 text-base mb-10 leading-relaxed">
                                Has dominado tu metabolismo. Tu clínico ha autorizado tu ingreso a la <strong>Tribu de Mantenimiento</strong>. El conocimiento 1:1 ya no es necesario; ahora necesitas constancia de élite.
                            </p>

                            <div className="bg-zinc-900/80 border border-yellow-500/30 rounded-3xl p-6 mb-8 text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl" />
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg text-yellow-500">Membresía Alumni</h3>
                                    <span className="font-black text-xl">$50<span className="text-sm text-zinc-500">/mes</span></span>
                                </div>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-sm font-medium text-zinc-300">
                                        <CheckCircle2 className="w-4 h-4 mr-3 text-yellow-500" /> Aceso continuo al cOS y Ecosistema
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-zinc-300">
                                        <CheckCircle2 className="w-4 h-4 mr-3 text-yellow-500" /> Leaderboard Semanal de la Tribu
                                    </li>
                                    <li className="flex items-center text-sm font-medium text-zinc-500 opacity-70">
                                        <Lock className="w-4 h-4 mr-3 text-zinc-600" /> Revisiones 1:1 (Excluidas)
                                    </li>
                                </ul>
                            </div>

                            <button 
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                            >
                                Desbloquear Acceso Alumni
                            </button>
                            <button className="mt-6 text-sm font-bold text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">
                                Finalizar programa y perder historial
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

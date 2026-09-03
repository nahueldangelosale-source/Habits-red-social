import React from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

/**
 * WelcomeDashboard - Enterprise Domain
 * Implementa Tipografía Cinética (Kinetic Typography) acoplada al Scroll y Posición del Cursor.
 * Optimizado para Machine Experience (MX) y respetando las preferencias vestibulares (prefers-reduced-motion).
 */
export const WelcomeDashboard: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const shouldReduceMotion = useReducedMotion();

    // Scroll-based Kinetic Typography
    const { scrollYProgress } = useScroll();
    
    // Mapeamos el progreso del scroll (0 a 1) al peso de la fuente (300 a 900)
    const rawFontWeight = useTransform(scrollYProgress, [0, 1], [300, 900]);
    // Aplicamos físicas de resorte para que la transición sea fluida
    const fontWeight = useSpring(rawFontWeight, { stiffness: 100, damping: 30 });

    // Cursor-based Kinetic Typography (Slant/Inclinación)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (shouldReduceMotion) return;
        
        // Normalizamos coordenadas relativas al centro de la ventana (-1 a 1)
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        
        mouseX.set(x);
        mouseY.set(y);
    };

    // Mapeamos el movimiento X a la inclinación de la fuente (Slant: -10 a 0)
    const rawSlant = useTransform(mouseX, [-1, 1], [-10, 0]);
    const fontSlant = useSpring(rawSlant, { stiffness: 150, damping: 20 });

    // Efecto de rastreo sutil con el Mouse Y
    const rawBlur = useTransform(mouseY, [-1, 1], [4, 0]);
    const blurEffect = useSpring(rawBlur, { stiffness: 100, damping: 20 });

    return (
        <main 
            aria-label="Welcome Enterprise Dashboard"
            className={`min-h-[200vh] w-full flex flex-col pt-32 px-12 transition-colors duration-700 ${isClinical ? 'bg-clinical-bg text-clinical-text' : 'bg-adrenaline-bg text-adrenaline-text'}`}
            onMouseMove={handleMouseMove}
        >
            <nav aria-label="Enterprise Navigation" className="fixed top-6 left-12 right-12 flex justify-between items-center z-50 mix-blend-difference text-white">
                <span className="font-mono text-sm uppercase tracking-widest font-bold">Bienestar OS // Enterprise</span>
                <span className="text-xs uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">Estado: L6 Governance</span>
            </nav>

            <article aria-labelledby="kinetic-hero" className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full sticky top-32">
                <header className="mb-8">
                    <span className="text-sm font-bold tracking-[0.2em] uppercase opacity-60 mb-4 block">Operativizando la Escala</span>
                    
                    {/* Contenedor de Tipografía Cinética */}
                    <motion.h1 
                        id="kinetic-hero"
                        style={{
                            // Si el usuario prefiere reducir movimiento, caemos a un estado estático (peso 700)
                            fontWeight: shouldReduceMotion ? 700 : fontWeight,
                            fontVariationSettings: shouldReduceMotion 
                                ? '"slnt" 0' 
                                : useTransform(() => `"slnt" ${fontSlant.get()}`),
                            filter: shouldReduceMotion ? 'none' : useTransform(() => `blur(${Math.max(0, blurEffect.get() - 2)}px)`),
                            letterSpacing: '-0.04em'
                        }}
                        className="text-[clamp(3rem,8vw,8rem)] leading-[0.9] tracking-tighter will-change-[font-weight,filter] break-words"
                    >
                        INTELIGENCIA <br />
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isClinical ? 'from-emerald-600 to-teal-400' : 'from-lime-400 to-cyan-400'}`}>
                            ASÍNCRONA
                        </span>
                    </motion.h1>
                </header>

                <section aria-label="Value Proposition" className="max-w-2xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="font-mono text-sm font-bold uppercase tracking-widest opacity-50">01. Cero Latencia</h2>
                        <p className="text-lg leading-relaxed opacity-80">
                            Manejando la sincronización de estados a través del motor 
                            <strong className="font-semibold text-action-primary ml-1">Embedded Replica</strong> 
                            con librerías Locales-First. 0ms TTI garantizado.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="font-mono text-sm font-bold uppercase tracking-widest opacity-50">02. Fricción Justificada</h2>
                        <p className="text-lg leading-relaxed opacity-80">
                            Micro-interacciones validadas neuro-estéticamente para canalizar 
                            <strong className="font-semibold text-action-primary ml-1">atención clínica sostenida</strong> 
                            evitando la fatiga de alarma.
                        </p>
                    </div>
                </section>
                
                <div className="mt-24 text-sm font-mono opacity-30 flex items-center gap-4">
                    <span className="animate-pulse-subtle">↓ SCROLL PARA MUTAR ESPACIO VISUAL</span>
                </div>
            </article>
        </main>
    );
};

export default WelcomeDashboard;

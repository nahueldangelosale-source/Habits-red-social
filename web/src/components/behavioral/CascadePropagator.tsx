import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, CheckCircle2, Copy } from 'lucide-react';
import * as Toast from '@radix-ui/react-toast';

// Mock 40 clients array
const MOCK_CLIENTS = Array.from({ length: 40 }, (_, i) => ({
    id: `client-${i}`,
    name: `Atleta ${i + 1}`,
    initials: `${String.fromCharCode(65 + (i % 26))}${i % 9}`
}));

const opticPathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: [0, 1, 0.2],
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
    }
};

const gridVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.6,
            staggerChildren: 0.03
        }
    }
};

const avatarVariants = {
    hidden: {
        opacity: 0.3,
        y: 0,
        borderColor: '#27272a', // zinc-800
        boxShadow: '0 0 0 rgba(0,0,0,0)'
    },
    visible: {
        opacity: 1,
        y: [-5, 0], // Micro-salto
        borderColor: '#10b981', // emerald-500
        boxShadow: '0 0 15px rgba(16,185,129,0.4)',
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    }
};

export function CascadePropagator() {
    const [isDeployed, setIsDeployed] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleDeploy = () => {
        setIsDeployed(true);
        // Show outcome toast after staggered animation completes
        setTimeout(() => {
            setShowToast(true);
        }, 3000);
    };

    return (
        <Toast.Provider swipeDirection="right">
            <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-zinc-950/80 border border-zinc-900 shadow-2xl relative overflow-hidden font-sans min-h-[500px] flex flex-col items-center justify-center">

                <AnimatePresence mode="wait">
                    {!isDeployed ? (
                        <motion.button
                            key="deploy-btn"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDeploy}
                            className="w-full max-w-md py-4 rounded-2xl bg-indigo-500 text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(206,255,0,0.3)] animate-pulse-neon relative overflow-hidden group"
                        >
                            <Zap className="w-5 h-5" />
                            <span className="relative z-10">Asignar Programa Maestro a 40 Clientes</span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </motion.button>
                    ) : (
                        <motion.div
                            key="deploy-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full flex flex-col items-center relative"
                        >
                            {/* Master Template Elevation */}
                            <motion.div
                                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                                animate={{ y: 0, opacity: 1, scale: 1, boxShadow: '0 25px 50px -12px rgba(206,255,0,0.25)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                className="bg-[#1A1A1A] border border-indigo-500/50 p-4 rounded-xl flex items-center gap-4 z-20 relative w-64"
                            >
                                <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
                                    <Copy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold leading-tight">Mesociclo Fuerza</h4>
                                    <p className="text-indigo-400 text-xs font-mono font-bold tracking-widest">MASTER V1.4</p>
                                </div>
                            </motion.div>

                            {/* Fiber Optic SVG Choreography */}
                            <div className="w-full h-24 relative -mt-4 z-10">
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
                                    <defs>
                                        <linearGradient id="neonLine" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                                        </linearGradient>
                                    </defs>
                                    {/* Dibujo de 5 hilos principales que abren en abanico */}
                                    <motion.path d="M200,10 Q100,50 20,90" fill="none" stroke="url(#neonLine)" strokeWidth="2" variants={opticPathVariants} initial="hidden" animate="visible" />
                                    <motion.path d="M200,10 Q150,50 100,90" fill="none" stroke="url(#neonLine)" strokeWidth="2" variants={opticPathVariants} initial="hidden" animate="visible" />
                                    <motion.path d="M200,10 Q200,50 200,90" fill="none" stroke="url(#neonLine)" strokeWidth="3" variants={opticPathVariants} initial="hidden" animate="visible" />
                                    <motion.path d="M200,10 Q250,50 300,90" fill="none" stroke="url(#neonLine)" strokeWidth="2" variants={opticPathVariants} initial="hidden" animate="visible" />
                                    <motion.path d="M200,10 Q300,50 380,90" fill="none" stroke="url(#neonLine)" strokeWidth="2" variants={opticPathVariants} initial="hidden" animate="visible" />
                                </svg>
                            </div>

                            {/* Clients Grid (Staggered Children) */}
                            <motion.div
                                className="grid grid-cols-8 gap-3 z-20 w-full"
                                variants={gridVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {MOCK_CLIENTS.map((client) => (
                                    <motion.div
                                        key={client.id}
                                        variants={avatarVariants}
                                        className="aspect-square rounded-full border-2 bg-zinc-900 flex items-center justify-center relative overflow-hidden group"
                                    >
                                        <span className="text-[10px] text-zinc-500 font-bold group-hover:text-white transition-colors">
                                            {client.initials}
                                        </span>
                                        {/* Success Check Micro-interaction inside avatar */}
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 1, type: 'spring' }}
                                            className="absolute bottom-0 right-0"
                                        >
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400 bg-zinc-900 rounded-full" />
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Success Outcome Toast */}
            <Toast.Root
                open={showToast}
                onOpenChange={setShowToast}
                className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 grid gap-1 items-center font-sans radix-state-open:animate-toast-slide-in radix-state-closed:animate-toast-hide radix-swipe-end:animate-toast-swipe-out"
            >
                <Toast.Title className="text-white font-bold flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" /> Operación Élite Completada
                </Toast.Title>
                <Toast.Description className="text-zinc-400 text-xs mt-1">
                    40 planes individualizados y asignados vía motor IA. <span className="text-indigo-400 font-bold">120 horas ahorradas.</span>
                </Toast.Description>
            </Toast.Root>
            <Toast.Viewport className="fixed bottom-0 right-0 p-6 z-[100] outline-none max-w-sm w-full" />
        </Toast.Provider>
    );
}

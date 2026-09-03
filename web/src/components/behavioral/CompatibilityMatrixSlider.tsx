import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ArrowDownUp, Info, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';

// Mock Data
export interface SwapAlternative {
    id: string;
    name: string;
    affinity: number;
    metrics: string;
}

const originalItem = {
    id: 'orig-1',
    name: 'Sentadilla Trasnuca',
    metrics: 'Tensión Mecánica Alta'
};

const mockAlternatives: SwapAlternative[] = [
    { id: 'alt-1', name: 'Sentadilla Goblet', affinity: 95, metrics: 'Biomecánica similar' },
    { id: 'alt-2', name: 'Prensa a 45°', affinity: 75, metrics: 'Menor demanda core' },
    { id: 'alt-3', name: 'Sillón Cuádriceps', affinity: 40, metrics: 'Pérdida de patrón motor' }
];

function getThermalGradient(affinity: number) {
    if (affinity >= 90) return { color: '#6366f1', light: 'rgba(206,255,0,0.1)', glow: 'drop-shadow-[0_0_15px_rgba(206,255,0,0.4)]', msg: 'Sustitución Óptima', icon: <CheckCircle2 className="text-indigo-400 w-5 h-5" />, btn: 'Confirmar Sustitución' };
    if (affinity >= 60) return { color: '#F8FAFC', light: 'rgba(248,250,252,0.1)', glow: 'drop-shadow-[0_0_10px_rgba(248,250,252,0.3)]', msg: 'Variación Aceptable', icon: <Info className="text-[#F8FAFC] w-5 h-5" />, btn: 'Aceptar Variación' };
    return { color: '#FF5500', light: 'rgba(255,85,0,0.1)', glow: 'drop-shadow-[0_0_15px_rgba(255,85,0,0.4)]', msg: 'Desviación Biomecánica Alta', icon: <AlertTriangle className="text-[#FF5500] w-5 h-5" />, btn: 'Asumir Variación' };
}

// Circular Affinity Ring using basic SVG
function AffinityRing({ value, color }: { value: number, color: string }) {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setProgress(value), 300);
        return () => clearTimeout(t);
    }, [value]);

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r={radius} className="fill-none stroke-zinc-800" strokeWidth="4" />
                <motion.circle
                    cx="30"
                    cy="30"
                    r={radius}
                    className="fill-none transition-all duration-1000 ease-out"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (progress / 100) * circumference}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex items-center justify-center flex-col">
                <span className="text-sm font-mono font-bold text-white tracking-tighter tabular-nums">{value}%</span>
            </div>
        </div>
    );
}

export function CompatibilityMatrixSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swapping, setSwapping] = useState(false);

    // Swipe interaction logic
    const handleDragEnd = (event: any, info: any) => {
        const offset = info.offset.y;
        const velocity = info.velocity.y;

        if (offset < -50 || velocity < -500) {
            // Swipe Up -> Next alternative
            setCurrentIndex((prev) => (prev + 1) % mockAlternatives.length);
        } else if (offset > 50 || velocity > 500) {
            // Swipe Down -> Prev alternative
            setCurrentIndex((prev) => (prev - 1 + mockAlternatives.length) % mockAlternatives.length);
        }
    };

    const currentAlt = mockAlternatives[currentIndex];
    const thermal = getThermalGradient(currentAlt.affinity);

    return (
        <div className="w-full max-w-sm mx-auto bg-zinc-950/80 backdrop-blur-3xl rounded-[2rem] border border-zinc-800 p-6 shadow-2xl overflow-hidden relative font-sans">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <ArrowDownUp className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Swipe to Swap</span>
                </div>
                <div className="px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: thermal.color }} />
                    <span className="text-xs font-mono tabular-nums text-zinc-300">Target</span>
                </div>
            </div>

            {/* Original Item context */}
            <div className="mb-6 opacity-50">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">Plan Original (Coach)</p>
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 line-through decoration-zinc-600">
                    <p className="text-sm text-zinc-400 font-medium">{originalItem.name}</p>
                </div>
            </div>

            {/* Draggable Alternative Card */}
            <div className="relative h-[200px] flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={currentAlt.id}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        onDragEnd={handleDragEnd}
                        className={`absolute w-full glass-card-adrenaline cursor-grab active:cursor-grabbing p-5 rounded-2xl flex flex-col gap-4 border-t`}
                        style={{ borderTopColor: thermal.color, boxShadow: `0 10px 40px -10px ${thermal.light}` }}
                    >

                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1 font-sans tracking-tight">{currentAlt.name}</h3>
                                <p className="text-xs text-zinc-400 font-mono tracking-tight">{currentAlt.metrics}</p>
                            </div>
                            <AffinityRing value={currentAlt.affinity} color={thermal.color} />
                        </div>

                        <div className="bg-zinc-950/50 rounded-lg p-3 flex items-center gap-3">
                            {thermal.icon}
                            <span className="text-xs font-medium" style={{ color: thermal.color }}>
                                {thermal.msg}
                            </span>
                        </div>

                    </motion.div>
                </AnimatePresence>

                {/* Swipe indicators */}
                <div className="absolute -bottom-6 w-full flex justify-center opacity-30 animate-pulse pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-white" />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col gap-3">
                <button
                    className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group"
                    style={{ backgroundColor: thermal.light, color: thermal.color, border: `1px solid ${thermal.color}40` }}
                >
                    <span className="relative z-10">{thermal.btn}</span>
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>

                {currentAlt.affinity < 60 && (
                    <button className="w-full py-3 rounded-xl font-semibold text-sm text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800">
                        Mantener Plan Original
                    </button>
                )}
            </div>

        </div>
    );
}

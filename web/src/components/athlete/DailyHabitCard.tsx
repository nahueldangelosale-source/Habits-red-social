import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { addResilienceXp } from '../../hooks/useCognitiveLoad';

interface DailyHabitCardProps {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    xpReward: number;
    color: string; // Tailwind color class string (e.g. 'text-blue-400')
    bgColor: string; // Tailwind bg class string (e.g. 'bg-blue-400/10')
    borderColor: string;
}

export const DailyHabitCard: React.FC<DailyHabitCardProps> = ({ title, subtitle, icon, xpReward, color, bgColor, borderColor }) => {
    const [isCompleted, setIsCompleted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleComplete = () => {
        if (isCompleted) return;
        
        setIsCompleted(true);
        setShowConfetti(true);
        addResilienceXp(xpReward);

        // Hide confetti after animation
        setTimeout(() => setShowConfetti(false), 1500);
    };

    return (
        <div className={`relative p-4 rounded-2xl border transition-all duration-500 overflow-hidden ${
            isCompleted ? 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800' : 'bg-white dark:bg-black border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none'
        }`}>
            {/* Fondo que brilla al completar */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isCompleted ? 0.3 : 0 }}
                className={`absolute inset-0 bg-gradient-to-r from-transparent ${bgColor} to-transparent pointer-events-none`}
            />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isCompleted ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 grayscale' : `${bgColor} ${color} ${borderColor} border`
                    }`}>
                        {icon}
                    </div>
                    <div>
                        <h4 className={`font-bold transition-colors ${isCompleted ? 'text-slate-400 dark:text-zinc-500 line-through' : 'text-slate-800 dark:text-white'}`}>{title}</h4>
                        <p className="text-slate-500 dark:text-zinc-500 text-xs">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center">
                    <span className={`text-xs font-black tracking-widest mr-3 transition-colors ${
                        isCompleted ? 'text-slate-400 dark:text-zinc-600' : color
                    }`}>
                        +{xpReward} XP
                    </span>
                    
                    <button 
                        onClick={handleComplete}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted 
                                ? 'bg-lime-500 border-lime-500 text-white dark:text-black shadow-[0_0_15px_rgba(132,204,22,0.4)]' 
                                : 'border-slate-300 dark:border-zinc-700 hover:border-lime-500'
                        }`}
                    >
                        {isCompleted && <Check className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Confetti Particles (Framer Motion) */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                                animate={{ 
                                    opacity: 0, 
                                    scale: Math.random() * 1.5 + 0.5,
                                    x: (Math.random() - 0.5) * 100, 
                                    y: (Math.random() - 0.5) * 100 
                                }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-lime-400' : 'bg-white'}`}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { Check, Droplets, Moon, Footprints, Flame, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHabitStore } from '../../stores/useHabitStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';

// Map icon names/types to actual Lucide components
const getHabitIcon = (type: string, id: string) => {
    if (type === 'BREAK') return <Brain size={20} />;
    if (id.includes('water')) return <Droplets size={20} />;
    if (id.includes('sleep')) return <Moon size={20} />;
    if (id.includes('walk')) return <Footprints size={20} />;
    return <TrendingUp size={20} />;
};

export const MicroHabits: React.FC = () => {
    const { prescribedHabits, completeDay } = useHabitStore();
    const athleteId = useOnboardingPTStore(state => state.identity.fullName) || 'unknown';
    
    // Filtramos los hábitos para el cliente activo
    const myHabits = prescribedHabits.filter(h => h.clientId === athleteId);
    const today = new Date().toISOString().split('T')[0];

    const handleComplete = (habitId: string, event: React.MouseEvent<HTMLButtonElement>, isCompleted: boolean) => {
        // Toggle in store
        completeDay(habitId, today);

        if (!isCompleted) {
            // Visual ceremony only when checking (not unchecking)
            const rect = event.currentTarget.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            const rootStyles = getComputedStyle(document.documentElement);
            const primaryColor = rootStyles.getPropertyValue('--theme-primary').trim() || '#6366f1';

            confetti({
                particleCount: 50,
                spread: 60,
                origin: { x, y },
                colors: [primaryColor, '#FFFFFF', '#09090b'],
                disableForReducedMotion: true
            });
        }
    };

    if (myHabits.length === 0) {
        return (
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center">
                <Brain className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2 font-montserrat">Micro-Hábitos</h3>
                <p className="text-sm text-zinc-400 font-lato">No tienes hábitos prescritos activos.</p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-2 font-montserrat">Micro-Hábitos</h3>
            <p className="text-sm text-zinc-400 mb-6 font-lato">Completa tu día. Construye consistencia.</p>

            <div className="space-y-4">
                {myHabits.map((habit) => {
                    const isCompleted = habit.completedDays.includes(today);
                    const isBuild = habit.type === 'BUILD';
                    
                    // Theming based on BUILD vs BREAK
                    const activeColorClass = isBuild ? 'bg-[var(--theme-primary)] text-black' : 'bg-red-500 text-white';
                    const activeBorderClass = isBuild ? 'border-transparent' : 'border-transparent';
                    const hoverBorderClass = isBuild ? 'hover:border-[var(--theme-primary)]' : 'hover:border-red-500';
                    const activeBgWrapper = isBuild ? 'bg-[var(--theme-primary)]/10' : 'bg-red-500/10';
                    const textColor = isBuild ? 'text-[var(--theme-primary)]' : 'text-red-400';

                    return (
                        <div
                            key={habit.id}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                                isCompleted
                                    ? `${activeBgWrapper} ${activeBorderClass}`
                                    : 'bg-zinc-800/50 border border-zinc-800'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${
                                    isCompleted ? activeColorClass : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                    {getHabitIcon(habit.type, habit.templateId)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        {isBuild ? <TrendingUp size={12} className={textColor} /> : <TrendingDown size={12} className={textColor} />}
                                        <h4 className={`font-semibold font-lato ${isCompleted ? 'text-white' : 'text-zinc-300'}`}>
                                            {habit.title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-xs font-montserrat font-bold flex items-center gap-1 ${textColor}`}>
                                            <Flame size={12} /> {habit.streakCurrent} {habit.streakCurrent === 1 ? 'Día' : 'Días'}
                                        </span>
                                        <span className="text-xs text-zinc-500 font-montserrat font-bold bg-zinc-800 px-1.5 py-0.5 rounded">
                                            Nivel {habit.level}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleComplete(habit.id, e, isCompleted)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted
                                        ? activeColorClass
                                        : `border-2 border-zinc-600 text-transparent ${hoverBorderClass}`
                                }`}
                            >
                                <Check size={16} strokeWidth={3} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

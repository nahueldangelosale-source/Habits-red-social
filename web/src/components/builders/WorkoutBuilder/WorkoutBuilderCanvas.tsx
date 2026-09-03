
import React, { useState } from 'react';
import { Plus, Dumbbell, Zap } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';
import { ProgressiveOverloadModal } from './ProgressiveOverloadModal';
import { ArchetypeSelector } from '../ArchetypeSelector';
import { useBuilderStore } from '../../../stores/builderStore';
import { useTheme } from '../../../context/ThemeContext';

export const WorkoutBuilderCanvas: React.FC = () => {
    const { activeWorkout } = useBuilderStore();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const [isOverloadModalOpen, setIsOverloadModalOpen] = useState(false);
    const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false);

    // Safe access with optional chaining, defaulting to empty array if days undefined
    const days = activeWorkout?.days || [];
    const currentDay = days[activeDayIndex] || { id: 'd-new', name: 'New Day', exercises: [] };

    return (
        <div className={`flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 border ${isClinical
            ? 'glass-card-clinical border-slate-200'
            : 'glass-panel bg-[#09090b] border-white/10'}`}>

            {/* 1. Header & Split Tabs */}
            <div className={`p-4 border-b ${isClinical ? 'border-slate-100' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`font-sans text-2xl ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                        {activeWorkout?.name || "New Workout Plan"}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsArchetypeModalOpen(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isClinical
                                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                            Templates
                        </button>
                        <button
                            onClick={() => setIsOverloadModalOpen(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isClinical
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-white/10 text-white hover:bg-white/20'}`}>
                            <Zap size={14} className={isClinical ? "text-amber-500" : "text-indigo-400"} />
                            Auto-Progression
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {days.length > 0 ? days.map((day, idx) => (
                        <button
                            key={day.id}
                            onClick={() => setActiveDayIndex(idx)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeDayIndex === idx
                                ? (isClinical ? 'bg-emerald-500 text-white shadow-lg' : 'bg-indigo-500 text-black shadow-[0_0_15px_rgba(206,255,0,0.4)]')
                                : (isClinical ? 'bg-slate-50 text-slate-400 hover:bg-slate-100' : 'bg-white/5 text-zinc-500 hover:bg-white/10')
                                }`}
                        >
                            {day.name}
                        </button>
                    )) : (
                        <button
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isClinical ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-black'}`}
                        >
                            Day 1
                        </button>
                    )}

                    <button className={`px-3 py-2 rounded-xl transition-all ${isClinical ? 'bg-slate-50 text-slate-400' : 'bg-white/5 text-zinc-500'}`}>
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* 2. Workout Canvas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentDay.exercises && currentDay.exercises.length > 0 ? (
                    currentDay.exercises.map((exercise, index) => {
                        // Check if part of superset with NEXT exercise
                        const isSuperset = exercise.supersetId &&
                            index < currentDay.exercises.length - 1 &&
                            currentDay.exercises[index + 1].supersetId === exercise.supersetId;

                        return (
                            <ExerciseCard
                                key={exercise.id}
                                exercise={exercise}
                                onRemove={() => { }} // TODO: Connect to store
                                isSuperset={!!isSuperset}
                            />
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className={`items-center justify-center flex flex-col p-12 border-2 border-dashed rounded-2xl ${isClinical ? 'border-slate-200' : 'border-white/10'}`}>
                        <div className={`p-4 rounded-full mb-4 ${isClinical ? 'bg-slate-50 text-slate-400' : 'bg-white/5 text-zinc-600'}`}>
                            <Dumbbell size={32} />
                        </div>
                        <p className={`text-sm font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                            Drag exercises here or click to add
                        </p>
                        <button className={`mt-4 px-6 py-2 rounded-lg text-sm font-bold transition-all ${isClinical
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-indigo-500 text-black hover:bg-[#b0d600]'}`}>
                            Add Exercise
                        </button>
                    </div>
                )}
            </div>

            {/* Footer: Volume/Intensity Summary */}
            <div className={`p-4 border-t flex items-center justify-between text-xs ${isClinical ? 'border-slate-100 text-slate-500' : 'border-white/5 text-zinc-500'}`}>
                <div className="flex gap-4">
                    <span>Sets: {currentDay.exercises ? currentDay.exercises.reduce((acc, ex) => acc + ex.sets, 0) : 0}</span>
                    <span>Volume: 0kg</span>
                </div>
                <div>
                    Est. Time: {currentDay.exercises ? currentDay.exercises.length * 5 : 0} min
                </div>
            </div>

            {/* Progressive Overload Modal */}
            {isOverloadModalOpen && (
                <ProgressiveOverloadModal
                    onClose={() => setIsOverloadModalOpen(false)}
                    onApply={(mode) => {
                        // TODO: Call store action
                        console.log("Applying overload:", mode);
                        setIsOverloadModalOpen(false);
                    }}
                />
            )}

            {/* Archetype Selector */}
            {isArchetypeModalOpen && (
                <ArchetypeSelector
                    type="FITNESS"
                    onClose={() => setIsArchetypeModalOpen(false)}
                />
            )}
        </div>
    );
};

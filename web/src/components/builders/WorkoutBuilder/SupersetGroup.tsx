
import React from 'react';
import { Layers } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { ExerciseCard } from './ExerciseCard';

interface SupersetGroupProps {
    exercises: any[]; // Replace with Exercise type
    onRemoveExercise: (id: string) => void;
}

export const SupersetGroup: React.FC<SupersetGroupProps> = ({ exercises, onRemoveExercise }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <div className={`pl-4 border-l-4 rounded-r-xl my-2 ${isClinical ? 'border-indigo-400 bg-indigo-50/30' : 'border-indigo-500 bg-indigo-500/5'}`}>
            <div className="flex items-center gap-2 mb-2 pt-2 pl-2">
                <Layers size={14} className={isClinical ? 'text-indigo-500' : 'text-indigo-400'} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>
                    Superset
                </span>
            </div>

            <div className="space-y-2 p-2 pt-0">
                {exercises.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onRemove={() => onRemoveExercise(exercise.id)}
                        isSuperset={index < exercises.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

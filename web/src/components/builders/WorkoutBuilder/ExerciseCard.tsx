
import React from 'react';
import { GripVertical, Video, Trash2, Repeat, Clock } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface ExerciseCardProps {
    exercise: {
        id: string;
        name: string;
        sets: number;
        reps: string;
        rpe?: number;
        rest?: string | number;
        videoUrl?: string; // Future: YouTube/Vimeo
    };
    onRemove: () => void;
    isSuperset?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onRemove, isSuperset }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <div className={`relative group flex items-start gap-4 p-4 rounded-xl border transition-all ${isClinical
            ? 'bg-white border-slate-100 hover:border-slate-300'
            : 'bg-white/5 border-white/5 hover:border-white/10'}`}>

            {/* Drag Handle */}
            <div className={`mt-2 cursor-grab active:cursor-grabbing ${isClinical ? 'text-slate-300' : 'text-zinc-600'}`}>
                <GripVertical size={20} />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className={`font-bold text-base ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>
                        {exercise.name}
                    </h4>
                    <div className="flex items-center gap-2">
                        {exercise.videoUrl && (
                            <button className={`p-1.5 rounded-lg ${isClinical ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50' : 'text-zinc-500 hover:text-indigo-400 hover:bg-white/10'}`}>
                                <Video size={16} />
                            </button>
                        )}
                        <button
                            onClick={onRemove}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isClinical ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-zinc-500 hover:text-rose-500 hover:bg-white/10'}`}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Sets / Reps / Load */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className={`text-[10px] uppercase font-bold tracking-wider ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}>Sets</label>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950/20 border-white/10 text-white'}`}>
                            <Repeat size={14} className={isClinical ? "text-slate-400" : "text-zinc-500"} />
                            <input type="number" defaultValue={exercise.sets} className="w-8 bg-transparent outline-none text-center font-mono text-sm" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className={`text-[10px] uppercase font-bold tracking-wider ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}>Reps</label>
                        <input
                            type="text"
                            defaultValue={exercise.reps}
                            className={`w-16 px-3 py-1.5 rounded-lg border outline-none text-sm font-mono text-center ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950/20 border-white/10 text-white'}`}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className={`text-[10px] uppercase font-bold tracking-wider ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}>RPE / RIR</label>
                        <select className={`w-20 px-2 py-1.5 rounded-lg border outline-none text-xs font-mono appearance-none cursor-pointer ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950/20 border-white/10 text-white'}`}>
                            <option value="8">8 RPE</option>
                            <option value="9">9 RPE</option>
                            <option value="10">10 RPE</option>
                            <option value="failure">FAILURE</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className={`text-[10px] uppercase font-bold tracking-wider ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}>Rest</label>
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950/20 border-white/10 text-white'}`}>
                            <Clock size={14} className={isClinical ? "text-slate-400" : "text-zinc-500"} />
                            <input type="text" defaultValue={exercise.rest || "90s"} className="w-10 bg-transparent outline-none text-center font-mono text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Superset Connector */}
            {isSuperset && (
                <div className={`absolute -left-[21px] top-1/2 w-4 h-[calc(100%+16px)] border-l-2 border-b-2 rounded-bl-xl -z-10 ${isClinical ? 'border-indigo-200' : 'border-indigo-500/30'}`} />
            )}
        </div>
    );
};

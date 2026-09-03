import { useState } from 'react';
import { Search, Dumbbell, Activity, Compass } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { useExercises, type Exercise } from '../../hooks/queries/useExercises';

function DraggableExerciseItem({ exercise }: { exercise: Exercise }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: exercise.id,
        data: {
            type: 'LibraryItem',
            exercise,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`p-4 rounded-xl border transition-all duration-200 bg-white ${isDragging
                    ? 'shadow-float border-neon-primary scale-105 z-50 cursor-grabbing rotate-2'
                    : 'border-slate-100 hover:border-slate-300 hover:shadow-sm cursor-grab shadow-sm'
                }`}
        >
            <div className="flex items-center gap-3 pointer-events-none">
                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100/50">
                    <Dumbbell className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">{exercise.official_name}</h4>
                    <p className="text-xs text-slate-400 uppercase font-mono tracking-widest mt-1">
                        {exercise.primary_muscle} • {exercise.movement_pattern}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function WorkoutLibrarySidebar() {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: exercises = [], isLoading } = useExercises();

    const filtered = exercises.filter(ex =>
        ex.official_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.primary_muscle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white/20">
            <div className="p-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-sans text-slate-800 tracking-tight font-semibold mb-1">LibrerÃ­a Inteligente</h2>
                <p className="text-sm text-slate-400 mb-6">Arrastra bloques al canvas</p>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar ejercicio o grupo muscular..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-neon-primary/50 focus:border-neon-primary transition-all font-sans"
                    />
                </div>

                <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold">Ejercicios</button>
                    <button className="flex-1 py-1.5 rounded-lg bg-transparent text-slate-500 hover:bg-slate-100 text-xs font-semibold transition-colors">Superseries</button>
                    <button className="flex-1 py-1.5 rounded-lg bg-transparent border border-amber-200 text-amber-600 bg-amber-50 text-xs font-semibold flex items-center justify-center gap-1">
                        <Activity className="w-3 h-3" /> IA
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-10 opacity-50 text-sm text-slate-500">Cargando biblioteca...</div>
                ) : filtered.map(ex => (
                    <DraggableExerciseItem key={ex.id} exercise={ex} />
                ))}

                {!isLoading && filtered.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <Compass className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm text-slate-500">NingÃºn ejercicio coincide con "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </div>
    );
}

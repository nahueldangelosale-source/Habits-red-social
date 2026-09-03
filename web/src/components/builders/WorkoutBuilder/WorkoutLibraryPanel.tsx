import React, { useState } from 'react';
import { Search, ChevronRight, Filter, Dumbbell, Zap, Activity, ActivitySquare, HeartPulse, Stethoscope, Scissors } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { useTheme } from '../../../context/ThemeContext';

// MOCK DATA for Sprint 1
const MOCK_EXERCISES = [
    { id: 'ex_func_1', name: 'Kettlebell Swing', category: 'Funcional / HIIT', equipment: ['Kettlebell'], impact: 'Medio', muscle: 'Glúteo', pattern: 'Dominante Cadera', level: 2 },
    { id: 'ex_func_2', name: 'Burpee', category: 'Funcional / HIIT', equipment: ['Peso Corporal'], impact: 'Alto', muscle: 'Full Body', pattern: 'Locomoción', level: 3 },
    { id: 'ex_func_3', name: 'Wall Ball', category: 'Funcional / HIIT', equipment: ['Medicine Ball'], impact: 'Medio', muscle: 'Cuádriceps', pattern: 'Empuje Vertical', level: 2 },
    { id: 'ex_func_4', name: 'Box Jump', category: 'Funcional / HIIT', equipment: ['Cajón Pliométrico'], impact: 'Alto', muscle: 'Piernas', pattern: 'Pliometría', level: 3 },
    { id: 'ex_func_5', name: 'Battle Ropes', category: 'Funcional / HIIT', equipment: ['Battle Ropes'], impact: 'Bajo', muscle: 'Tren Superior', pattern: 'Condición', level: 2 },
];

const FAMILIES = [
    {
        name: 'ENTRENAMIENTO',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        categories: [
            { id: 'cat_musc', name: 'Musculación', icon: <Dumbbell size={16} />, desc: '~500 ej. • Fuerza' },
            { id: 'cat_func', name: 'Funcional / HIIT', icon: <Zap size={16} />, desc: '~250 ej. • Circuitos' },
            { id: 'cat_pwr', name: 'Fuerza / Power', icon: <ActivitySquare size={16} />, desc: '~200 ej. • Básicos' },
            { id: 'cat_oly', name: 'Olímpico', icon: <Activity size={16} />, desc: '~50 ej. • Potencia' },
        ]
    },
    {
        name: 'BIENESTAR Y MOVILIDAD',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        categories: [
            { id: 'cat_mob', name: 'Movilidad', icon: <Activity size={16} />, desc: '~100 ej. • Articular' },
            { id: 'cat_str', name: 'Stretching', icon: <Scissors size={16} />, desc: '~80 ej. • Flex' },
            { id: 'cat_yoga', name: 'Yoga', icon: <Activity size={16} />, desc: '~100 ej. • Asanas' },
            { id: 'cat_pil', name: 'Pilates', icon: <Activity size={16} />, desc: '~60 ej. • Mat' },
        ]
    },
    {
        name: 'PREVENCIÓN Y CONDICIÓN',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        categories: [
            { id: 'cat_rehab', name: 'Rehab / Prehab', icon: <Stethoscope size={16} />, desc: '~120 ej. • Clínico' },
            { id: 'cat_warm', name: 'Calentamiento', icon: <Zap size={16} />, desc: '~80 ej. • Activación' },
            { id: 'cat_plyo', name: 'Pliometría', icon: <Zap size={16} />, desc: '~80 ej. • Impacto' },
            { id: 'cat_cardio', name: 'Cardio', icon: <HeartPulse size={16} />, desc: '~60 ej. • Aeróbico' },
        ]
    }
];

const DraggableExerciseCard = ({ exercise }: { exercise: any }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: exercise.id,
        data: {
            type: 'EXERCISE_ITEM',
            item: exercise
        }
    });

    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <div 
            ref={setNodeRef} 
            {...listeners} 
            {...attributes}
            className={`p-3 rounded-xl border flex flex-col gap-1 cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isDragging ? 'opacity-50 scale-95 shadow-lg' : ''} ${isClinical ? 'bg-white border-slate-200' : 'bg-[#18181b] border-white/10'}`}
        >
            <div className="flex justify-between items-start">
                <span className={`font-bold text-xs font-montserrat ${isClinical ? 'text-slate-800' : 'text-white'}`}>{exercise.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${isClinical ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-500/20 text-indigo-400'}`}>Lvl {exercise.level}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
                <span className={`text-[9px] font-lato px-1.5 py-0.5 rounded border ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-white/50'}`}>{exercise.pattern}</span>
                <span className={`text-[9px] font-lato px-1.5 py-0.5 rounded border ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-white/50'}`}>{exercise.equipment[0]}</span>
            </div>
        </div>
    );
};

export const WorkoutLibraryPanel = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Filter exercises
    const filteredExercises = MOCK_EXERCISES.filter(ex => 
        (activeCategory ? ex.category === activeCategory : true) &&
        (searchTerm ? ex.name.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    );

    return (
        <div className={`w-[400px] h-full flex flex-col border-r transition-all duration-300 ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-[#09090b] border-white/10'}`}>
            {/* Header & Search */}
            <div className={`p-4 border-b z-10 shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-[#18181b] border-white/10'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className={`text-lg font-black font-montserrat flex items-center gap-2 ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                            Banco de Ejercicios
                        </h2>
                        <p className={`text-[10px] font-medium mt-0.5 font-lato ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                            Arrastra los ejercicios hacia tu sesión.
                        </p>
                    </div>
                    <button className={`p-1.5 rounded-lg transition-colors ${isClinical ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700' : 'text-zinc-500 hover:bg-white/10 hover:text-white'}`}>
                        <Filter size={18} />
                    </button>
                </div>

                <div className="relative">
                    <Search className={`absolute left-3 top-2.5 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`} size={16} />
                    <input
                        type="text"
                        placeholder="Buscar press, sentadilla, movilidad..."
                        className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 font-lato transition-all ${isClinical 
                            ? 'border-slate-200 bg-white text-slate-800 focus:ring-indigo-500' 
                            : 'border-white/10 bg-white/5 text-white focus:ring-indigo-500 placeholder-zinc-500'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {searchTerm || activeCategory ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                Resultados ({filteredExercises.length})
                            </span>
                            {activeCategory && (
                                <button 
                                    onClick={() => setActiveCategory(null)}
                                    className={`text-[10px] font-bold hover:underline ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}
                                >
                                    Volver a Categorías
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {filteredExercises.map(ex => (
                                <DraggableExerciseCard key={ex.id} exercise={ex} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {FAMILIES.map(family => (
                            <div key={family.name} className="flex flex-col gap-3">
                                <h3 className={`text-[10px] font-black uppercase tracking-widest ${family.color}`}>
                                    {family.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {family.categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.name)}
                                            className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${isClinical ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-[#18181b] border-white/10 hover:border-indigo-500/50'}`}
                                        >
                                            <div className={`p-1.5 rounded-lg ${isClinical ? family.bg + ' ' + family.color : 'bg-white/5 ' + family.color}`}>
                                                {cat.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-[11px] font-montserrat ${isClinical ? 'text-slate-700' : 'text-zinc-200'}`}>{cat.name}</span>
                                                <span className={`text-[9px] font-lato ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>{cat.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

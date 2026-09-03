import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, Dumbbell, Zap, Activity, ActivitySquare, HeartPulse, Stethoscope, Scissors } from 'lucide-react';
import { EXERCISES_DATABASE, type ExerciseTaxonomy } from '../../data/exercisesData';
import { DraggablePaletteItem } from './DraggablePaletteItem';

interface SmartExerciseLibraryProps {
    onQuickInject: (ex: ExerciseTaxonomy) => void;
}

interface CategoryConfig {
    id: string;
    name: string;
    icon: React.ReactNode;
    desc: string;
    segmentTags?: string[];
    patternTags?: string[];
    muscleFilter?: string[];
    keywords?: string[];
}

const FAMILIES = [
    {
        name: 'ENTRENAMIENTO',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        borderColor: 'border-indigo-100',
        hoverBorder: 'hover:border-indigo-300',
        categories: [
            { 
                id: 'musculacion', 
                name: 'Musculación', 
                icon: <Dumbbell size={16} />, 
                desc: 'Fuerza / Máquinas', 
                muscleFilter: ['Pectoral', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquiosurales', 'Glúteo', 'Gastrocnemio'],
                patternTags: ['Dominante de Rodilla', 'Bisagra de Cadera (Hinge)', 'Empuje Horizontal', 'Empuje Vertical', 'Tracción Horizontal', 'Tracción Vertical', 'Aislamiento']
            },
            { 
                id: 'funcional', 
                name: 'Funcional / HIIT', 
                icon: <Zap size={16} />, 
                desc: 'Circuitos / Core', 
                patternTags: ['Core Antiextensión', 'Core Antiflexión', 'Core Antirotación', 'Core Flexión', 'Locomoción/Transporte', 'Pliometría'],
                keywords: ['kettlebell', 'farmer', 'plancha', 'slam', 'balón', 'salto']
            },
            { 
                id: 'fuerza', 
                name: 'Fuerza / Power', 
                icon: <ActivitySquare size={16} />, 
                desc: 'Básicos Pesados', 
                patternTags: ['Dominante de Rodilla', 'Bisagra de Cadera (Hinge)', 'Empuje Horizontal', 'Empuje Vertical', 'Tracción Horizontal', 'Tracción Vertical'],
                keywords: ['sentadilla', 'banca', 'muerto', 'militar', 'dominada', 'barra', 'press']
            },
            { 
                id: 'olimpico', 
                name: 'Olímpico', 
                icon: <Activity size={16} />, 
                desc: 'Potencia', 
                patternTags: ['Pliometría', 'Acondicionamiento Metabólico'],
                keywords: ['snatch', 'clean', 'jerk', 'arrancada', 'dos tiempos', 'olímpico', 'potencia', 'slam']
            },
        ]
    },
    {
        name: 'BIENESTAR Y MOVILIDAD',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        borderColor: 'border-emerald-100',
        hoverBorder: 'hover:border-emerald-300',
        categories: [
            { 
                id: 'movilidad', 
                name: 'Movilidad', 
                icon: <Activity size={16} />, 
                desc: 'Articular', 
                segmentTags: ['MOVILIDAD_ARTICULAR'],
                patternTags: ['Movilidad'],
                keywords: ['movilidad', 'articular', '90/90', 'world', 'estiramiento', 'tobillo', 'cadera', 'torácico', 'dorsiflexion']
            },
            { 
                id: 'stretching', 
                name: 'Stretching', 
                icon: <Scissors size={16} />, 
                desc: 'Flexibilidad', 
                segmentTags: ['STRETCHING_COOLDOWN'],
                patternTags: ['Movilidad'],
                keywords: ['couch', 'sofá', 'respiración', 'elongación', 'cooldown', 'estiramiento', 'diafragmática']
            },
            { 
                id: 'yoga', 
                name: 'Yoga', 
                icon: <Activity size={16} />, 
                desc: 'Asanas', 
                patternTags: ['Movilidad', 'Core Antiextensión'],
                keywords: ['cat-cow', 'perro', 'asana', 'postura', 'respiración', '90/90', 'libro abierto', 'puente']
            },
            { 
                id: 'pilates', 
                name: 'Pilates', 
                icon: <Activity size={16} />, 
                desc: 'Mat / Reformer', 
                patternTags: ['Core Antiextensión', 'Core Antiflexión', 'Core Antirotación', 'Core Flexión'],
                keywords: ['deadbug', 'insecto', 'plancha', 'puente', 'hundred', 'estabilización', 'mcgill', 'copenhagen']
            },
        ]
    },
    {
        name: 'PREVENCIÓN Y CONDICIÓN',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        borderColor: 'border-rose-100',
        hoverBorder: 'hover:border-rose-300',
        categories: [
            { 
                id: 'rehab', 
                name: 'Rehab / Prehab', 
                icon: <Stethoscope size={16} />, 
                desc: 'Clínico', 
                segmentTags: ['REHAB_PREHAB'],
                keywords: ['mcgill', 'copenhagen', 'nórdico', 'bird-dog', 'perro', 'prehab', 'rehab', 'curl-up', 'insecto', 'deadbug']
            },
            { 
                id: 'calentamiento', 
                name: 'Calentamiento', 
                icon: <Zap size={16} />, 
                desc: 'Activación RAMP', 
                segmentTags: ['ACTIVACION_RAMP', 'MOVILIDAD_ARTICULAR'],
                keywords: ['ramp', 'activación', 'banda', 'band', 'puente', 'ytwl', 'monster', 'caminata', 'flexión escapular', 'separación']
            },
            { 
                id: 'pliometria', 
                name: 'Pliometría', 
                icon: <Zap size={16} />, 
                desc: 'Impacto / Potencia', 
                segmentTags: ['PLIOMETRIA_POTENCIACION'],
                patternTags: ['Pliometría'],
                keywords: ['salto', 'pogo', 'broad', 'slam', 'balón', 'box jump', 'pliometría', 'rebote']
            },
            { 
                id: 'cardio', 
                name: 'Cardio', 
                icon: <HeartPulse size={16} />, 
                desc: 'Aeróbico / Zonas', 
                segmentTags: ['CARDIO_ZONAS'],
                patternTags: ['Acondicionamiento Metabólico', 'Locomoción/Transporte'],
                keywords: ['cardio', 'zona', 'hiit', 'liss', 'cinta', 'remo', 'bici', 'airbike', 'aeróbica', 'intervalos']
            },
        ]
    }
];

export const SmartExerciseLibrary: React.FC<SmartExerciseLibraryProps> = ({ onQuickInject }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryConfig | null>(null);

    // Conteo dinámico de ejercicios por cada categoría
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        FAMILIES.forEach(f => {
            f.categories.forEach(cat => {
                const matchCount = EXERCISES_DATABASE.filter(ex => {
                    const segMatch = cat.segmentTags?.includes(ex.Categoria_Segmento || '');
                    const patMatch = cat.patternTags?.includes(ex.Patron_Movimiento);
                    const musMatch = cat.muscleFilter?.some((m: string) => ex.Musculo_Agonista?.toLowerCase().includes(m.toLowerCase()));
                    const keyMatch = cat.keywords?.some((k: string) => 
                        (ex.Nombre_Oficial || '').toLowerCase().includes(k.toLowerCase()) ||
                        (ex.Alias_Buscador || '').toLowerCase().includes(k.toLowerCase())
                    );
                    return Boolean(segMatch || patMatch || musMatch || keyMatch);
                }).length;
                counts[cat.id] = matchCount;
            });
        });
        return counts;
    }, []);

    // Búsqueda y filtrado usando la DB real y los filtros biomecánicos
    const filteredExercises = useMemo(() => {
        let results = EXERCISES_DATABASE;

        // Si hay categoría activa, filtramos por segmento, patrón, músculo o palabras clave
        if (activeCategory) {
            results = results.filter(ex => {
                const segMatch = activeCategory.segmentTags?.includes(ex.Categoria_Segmento || '');
                const patMatch = activeCategory.patternTags?.includes(ex.Patron_Movimiento);
                const musMatch = activeCategory.muscleFilter?.some((m: string) => ex.Musculo_Agonista?.toLowerCase().includes(m.toLowerCase()));
                const keyMatch = activeCategory.keywords?.some((k: string) => 
                    (ex.Nombre_Oficial || '').toLowerCase().includes(k.toLowerCase()) ||
                    (ex.Alias_Buscador || '').toLowerCase().includes(k.toLowerCase())
                );
                return Boolean(segMatch || patMatch || musMatch || keyMatch);
            });
        }

        // Aplicamos el buscador
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            results = results.filter(ex => 
                (ex.Nombre_Oficial || '').toLowerCase().includes(q) ||
                (ex.Alias_Buscador || '').toLowerCase().includes(q) ||
                (ex.Musculo_Agonista || '').toLowerCase().includes(q) ||
                (ex.Patron_Movimiento || '').toLowerCase().includes(q) ||
                (ex.Categoria_Segmento || '').toLowerCase().includes(q) ||
                (ex.Injury_Firewall_Tag || '').toLowerCase().includes(q)
            );
        }

        return results;
    }, [searchTerm, activeCategory]);

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Cabecera / Buscador */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black text-slate-800 font-montserrat flex items-center gap-2">
                            <Dumbbell size={16} className="text-indigo-600" /> Catálogo de Ejercicios
                        </h2>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                            {EXERCISES_DATABASE.length} ejercicios disponibles clasificados
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por músculo o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none shadow-sm font-lato transition-all focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
            </div>

            {/* Cuerpo desplazable */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {searchTerm || activeCategory ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                {filteredExercises.length} Resultados
                            </span>
                            {activeCategory && (
                                <button 
                                    onClick={() => setActiveCategory(null)}
                                    className="text-[10px] font-bold hover:underline text-indigo-600 flex items-center bg-indigo-50 px-2 py-1 rounded-md"
                                >
                                    <ChevronLeft size={12} className="mr-0.5" /> Volver a Categorías
                                </button>
                            )}
                        </div>
                        
                        {filteredExercises.length > 0 && (
                            <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                    💡 Mantén presionado y arrastra
                                </span>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            {filteredExercises.map(ex => (
                                <DraggablePaletteItem 
                                    key={ex.ID_Ejercicio} 
                                    exercise={ex} 
                                    onQuickInject={onQuickInject} 
                                />
                            ))}
                            {filteredExercises.length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-8">No se encontraron ejercicios en esta categoría.</p>
                            )}
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
                                            onClick={() => setActiveCategory(cat)}
                                            className={`flex items-start gap-2 p-3 rounded-xl border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${family.borderColor} ${family.hoverBorder}`}
                                        >
                                            <div className={`p-1.5 rounded-lg shrink-0 ${family.bg} ${family.color}`}>
                                                {cat.icon}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-bold text-[11px] font-montserrat text-slate-700 truncate">{cat.name}</span>
                                                    <span className="text-[9px] font-bold font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                                                        {categoryCounts[cat.id] || 0}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] font-lato text-slate-400 truncate mt-0.5">{cat.desc}</span>
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

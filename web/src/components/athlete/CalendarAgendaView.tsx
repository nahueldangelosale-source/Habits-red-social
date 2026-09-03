import React, { useState, useEffect } from 'react';
import { HabitHeatmap } from './HabitHeatmap';
import { Calendar, Dumbbell, Utensils, MessageCircle, ArrowRight, ChevronDown, ChevronUp, ShieldCheck, Play } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAgendaStore } from '../../stores/useAgendaStore';
import { HybridCheckinModal } from './HybridCheckinModal';

export interface CalendarAgendaViewProps {
    onNavigateTab?: (tab: 'today' | 'gaming' | 'social' | 'calendar' | 'coach' | 'nutrition') => void;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({ onNavigateTab }) => {
    const navigate = useNavigate();
    // Generar próximos 7 días
    const today = new Date();
    const nextDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));
    const [selectedDate, setSelectedDate] = useState(today);
    
    // Estado para colapsar/expandir el historial de logros (Racha Mensual)
    const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
    
    // Estado para el Modal Híbrido
    const [checkinModalItem, setCheckinModalItem] = useState<{id: string, title: string, actionRoute: string} | null>(null);

    // Pre-fetching de módulos pesados por rendimiento percibido (Umbral de Doherty)
    useEffect(() => {
        // Carga silenciosa del canvas
        import('./ActiveCanvas').catch(() => {});
    }, []);

    // Conectar al Store
    const getAgendaForDate = useAgendaStore(state => state.getAgendaForDate);
    const agenda = getAgendaForDate(selectedDate);

    return (
        <div className="min-h-full p-6 pb-32 bg-transparent">
            <header className="mb-8">
                <h2 className="text-3xl font-black font-montserrat text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Calendar size={24} />
                    </div>
                    Agenda
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-2 font-lato">
                    Tu planificación y registro histórico.
                </p>
            </header>

            {/* Historial Gráfico (Movido desde el perfil y colapsable) */}
            <section className="mb-10">
                <button 
                    onClick={() => setIsHeatmapOpen(!isHeatmapOpen)}
                    className="w-full flex items-center justify-between mb-2 group"
                >
                    <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                        Historial de Logros
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        {isHeatmapOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </button>
                
                <AnimatePresence initial={false}>
                    {isHeatmapOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2">
                                <HabitHeatmap />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Agenda Diaria */}
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">
                        Próximas Sesiones
                    </h3>
                </div>

                {/* Selector de Días Deslizable */}
                <div className="flex space-x-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                    {nextDays.map((date, idx) => {
                        const isSelected = selectedDate.getDate() === date.getDate();
                        const isToday = idx === 0;
                        return (
                            <button 
                                key={idx}
                                onClick={() => setSelectedDate(date)}
                                className={`snap-start shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                                    isSelected 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                            >
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-zinc-500'}`}>
                                    {isToday ? 'HOY' : format(date, 'EEE', { locale: es }).substring(0,3)}
                                </span>
                                <span className={`text-xl font-black mt-1 ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                                    {format(date, 'd')}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Lista de Eventos */}
                <div className="mt-4 space-y-3">
                    {agenda.map(item => {
                        const isCompletedByCoach = item.status === 'COMPLETED_BY_COACH';
                        const isCompleted = item.status === 'COMPLETED';
                        
                        return (
                            <div 
                                key={item.id} 
                                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all group overflow-hidden"
                            >
                                {/* Área Principal (Deep Link Directo) */}
                                <button 
                                    onClick={() => {
                                        if (item.actionRoute.startsWith('/athlete/') && onNavigateTab) {
                                            const route = item.actionRoute.split('/athlete/')[1];
                                            if (route === 'canvas') {
                                                navigate(item.actionRoute);
                                            } else {
                                                onNavigateTab(route as any);
                                            }
                                        } else {
                                            navigate(item.actionRoute);
                                        }
                                    }}
                                    className="flex-1 p-4 flex items-center gap-4 text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-black/30 flex items-center justify-center border border-slate-100 dark:border-white/5 shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                                        {item.type === 'training' && <Dumbbell className={`w-5 h-5 ${isCompleted ? 'text-emerald-500' : 'text-indigo-500'}`} />}
                                        {item.type === 'nutrition' && <Utensils className={`w-5 h-5 ${isCompleted ? 'text-emerald-500' : 'text-emerald-500'}`} />}
                                        {item.type === 'coach' && <MessageCircle className="w-5 h-5 text-blue-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">{item.time}</p>
                                        <h4 className={`text-sm font-bold truncate ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                            {item.title}
                                        </h4>
                                        
                                        {isCompletedByCoach && (
                                            <div className="flex items-center gap-1 mt-1 text-amber-500">
                                                <ShieldCheck size={12} />
                                                <span className="text-[9px] font-bold tracking-widest uppercase">Sesión validada por tu Coach</span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                                
                                {/* Botón Rápido (Modal Híbrido) */}
                                <div className="p-4 pl-0">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.status === 'PENDING' && item.type === 'training') {
                                                setCheckinModalItem(item);
                                            } else {
                                                if (item.actionRoute.startsWith('/athlete/') && onNavigateTab) {
                                                    const route = item.actionRoute.split('/athlete/')[1];
                                                    if (route === 'canvas') {
                                                        navigate(item.actionRoute);
                                                    } else {
                                                        onNavigateTab(route as any);
                                                    }
                                                } else {
                                                    navigate(item.actionRoute);
                                                }
                                            }
                                        }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                            isCompleted 
                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:bg-indigo-500 hover:text-white shadow-sm'
                                        }`}
                                    >
                                        {isCompleted ? <ShieldCheck size={18} /> : (item.status === 'PENDING' ? <Play size={18} className="ml-1" /> : <ArrowRight size={18} />)}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Modal Híbrido */}
            {checkinModalItem && (
                <HybridCheckinModal
                    isOpen={!!checkinModalItem}
                    onClose={() => setCheckinModalItem(null)}
                    item={checkinModalItem}
                />
            )}
        </div>
    );
};

import React, { useState } from 'react';
import { Activity, Edit3, Calendar, Layers, CheckCircle2, AlertTriangle, X, Utensils, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mock day data for modal
const MOCK_DAY_MEALS = [
    {
        id: 1,
        time: '08:00',
        name: 'Desayuno',
        options: [
            { id: 'opt1', name: 'Huevos Revueltos con Tostadas', kcal: 350, pro: 22, car: 30, fat: 12 },
            { id: 'opt2', name: 'Yogur Griego con Frutas', kcal: 280, pro: 18, car: 35, fat: 5 }
        ]
    },
    {
        id: 2,
        time: '13:00',
        name: 'Almuerzo',
        options: [
            { id: 'opt3', name: 'Pechuga a la Plancha con Arroz', kcal: 500, pro: 45, car: 55, fat: 8 }
        ]
    },
    {
        id: 3,
        time: '17:00',
        name: 'Merienda / Pre-entreno',
        options: [
            { id: 'opt4', name: 'Batido de Proteína y Banana', kcal: 220, pro: 25, car: 28, fat: 2 }
        ]
    },
    {
        id: 4,
        time: '21:00',
        name: 'Cena',
        options: [
            { id: 'opt5', name: 'Salmón con Batata al Horno', kcal: 450, pro: 35, car: 40, fat: 15 }
        ]
    }
];

interface NutritionTrackingViewProps {
    onEditPlan?: () => void;
    athleteId?: string;
}

export const NutritionTrackingView: React.FC<NutritionTrackingViewProps> = ({ onEditPlan, athleteId }) => {
    const navigate = useNavigate();
    const [selectedDay, setSelectedDay] = useState<{ day: number, status: string } | null>(null);
    const [plan, setPlan] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchPlan = async () => {
            if (!athleteId) {
                setLoading(false);
                return;
            }
            try {
                // api.client already has base URL setup in 'api' from '../../api/client'
                // But we don't have it imported here. Let me import it at the top later, or use fetch with token.
                // It's better to add the import.
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:8000/api/v1/nutrition-plans/?client_id=${athleteId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setPlan(data[0]); // Get most recent plan
                    }
                }
            } catch (err) {
                console.error('Failed to fetch nutrition plan', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [athleteId]);

    // Mock data for adherence heatmap
    const days = Array.from({ length: 28 }, (_, i) => ({
        day: i + 1,
        status: Math.random() > 0.2 ? 'completed' : (Math.random() > 0.5 ? 'partial' : 'missed')
    }));

    // Calculate global adherence
    const completedDays = days.filter(d => d.status === 'completed').length;
    const partialDays = days.filter(d => d.status === 'partial').length;
    const adherencePercentage = Math.round(((completedDays + (partialDays * 0.5)) / days.length) * 100);

    return (
        <div className="flex flex-col lg:flex-row gap-6 relative">
            {/* Left Column: Calendar & Plan Summary */}
            <div className="flex-1 space-y-6">
                {/* Plan Summary Header */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        {/* Adherence Circle */}
                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-100 dark:text-slate-800"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                    className={adherencePercentage >= 80 ? 'text-emerald-500' : adherencePercentage >= 60 ? 'text-amber-500' : 'text-rose-500'}
                                    strokeWidth="3"
                                    strokeDasharray={`${adherencePercentage}, 100`}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm font-black text-slate-800 dark:text-white">{adherencePercentage}%</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white font-montserrat">
                                {plan ? plan.title : 'Sin Plan Nutricional Asignado'}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg">
                                    <Activity size={14}/> {plan?.daily_macros_target?.calories || 0} kcal
                                </span>
                                <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-lg">{plan?.daily_macros_target?.protein || 0}g Pro</span>
                                <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg">{plan?.daily_macros_target?.carbs || 0}g Car</span>
                                <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg">{plan?.daily_macros_target?.fats || 0}g Fat</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onEditPlan ? onEditPlan() : navigate('/plan-builder')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 shrink-0"
                    >
                        <Edit3 size={16} /> Editar Plan
                    </button>
                </div>

                {/* Adherence Calendar */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Calendar size={16} /> Cumplimiento Mensual (Click en día para ver detalles)
                        </h3>
                        <div className="flex gap-3 text-[10px] font-bold uppercase text-slate-400">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500"></div> Perfecto</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"></div> Parcial</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500"></div> Fallo</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-slate-400 mb-2 uppercase">{d}</div>
                        ))}
                        {days.map((day, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedDay(day)}
                                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all cursor-pointer hover:scale-105 ${
                                    day.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' :
                                    day.status === 'partial' ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' :
                                    'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
                                }`}
                            >
                                {day.day}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Feedback & Comments */}
            <div className="w-full lg:w-96 space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm h-full flex flex-col min-h-[500px]">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Layers size={16} /> Observaciones del Cliente
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {/* Event 1 - Hambre */}
                        <div 
                            onClick={() => setSelectedDay({ day: 7, status: 'partial' })}
                            className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-500/5 dark:border-rose-500/20 relative cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse group-hover:scale-150 transition-transform" />
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle size={14} className="text-rose-500" />
                                <span className="text-[10px] font-bold uppercase text-rose-600 group-hover:text-rose-700 transition-colors">Ayer, 08:45 AM - Desayuno (Opción B)</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                                    Me quedé con hambre
                                </span>
                            </div>
                        </div>

                        {/* Event 2 - Perfecto */}
                        <div 
                            onClick={() => setSelectedDay({ day: 4, status: 'completed' })}
                            className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/20 relative cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase text-emerald-600 group-hover:text-emerald-700 transition-colors">11 Jul, 21:15 PM - Cena</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                                    Quedé súper bien
                                </span>
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                                    Me siento liviano/a
                                </span>
                            </div>
                        </div>
                        
                        {/* Event 3 - Hinchazón / Alerta */}
                        <div 
                            onClick={() => setSelectedDay({ day: 3, status: 'missed' })}
                            className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 relative cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold uppercase text-amber-600 group-hover:text-amber-700 transition-colors">10 Jul, 13:30 PM - Almuerzo</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                                    Me siento hinchado/a
                                </span>
                            </div>
                        </div>

                        {/* Event 4 - Energía */}
                        <div 
                            onClick={() => setSelectedDay({ day: 2, status: 'completed' })}
                            className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-500/5 dark:border-blue-500/20 relative cursor-pointer hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold uppercase text-blue-600 group-hover:text-blue-700 transition-colors">09 Jul, 16:45 PM - Pre-entreno</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-500 text-white shadow-sm shadow-blue-500/20">
                                    ¡Con mucha energía!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para ver el Plan de un Día Específico */}
            <AnimatePresence>
                {selectedDay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        selectedDay.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                        selectedDay.status === 'partial' ? 'bg-amber-100 text-amber-600' :
                                        'bg-rose-100 text-rose-600'
                                    }`}>
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 dark:text-white font-montserrat">Día {selectedDay.day}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-bold uppercase tracking-widest ${
                                                selectedDay.status === 'completed' ? 'text-emerald-500' :
                                                selectedDay.status === 'partial' ? 'text-amber-500' :
                                                'text-rose-500'
                                            }`}>
                                                {selectedDay.status === 'completed' ? 'Cumplimiento Perfecto' :
                                                 selectedDay.status === 'partial' ? 'Cumplimiento Parcial' :
                                                 'Fallo de Adherencia'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedDay(null)}
                                    className="p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content - Ingestas del Día */}
                            <div className="p-6 overflow-y-auto bg-white dark:bg-zinc-950 flex-1 space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Utensils size={16} className="text-indigo-500" /> Plan Asignado para este Día
                                    </h3>
                                </div>

                                {MOCK_DAY_MEALS.map((meal) => (
                                    <div key={meal.id} className="border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-zinc-900/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-black px-2 py-1 rounded-lg">
                                                    {meal.time}
                                                </span>
                                                <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-sm">{meal.name}</h4>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {meal.options.map((opt, i) => (
                                                <div key={opt.id} className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Opción {String.fromCharCode(65 + i)}</div>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{opt.name}</p>
                                                        </div>
                                                        <div className="flex gap-2 text-[10px] font-bold">
                                                            <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">{opt.kcal} kcal</span>
                                                            <span className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 px-2 py-1 rounded">P:{opt.pro}</span>
                                                            <span className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 px-2 py-1 rounded">C:{opt.car}</span>
                                                            <span className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 px-2 py-1 rounded">G:{opt.fat}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><Info size={14}/> Los datos provienen del historial del plan.</span>
                                <button onClick={() => { setSelectedDay(null); onEditPlan ? onEditPlan() : navigate('/plan-builder'); }} className="font-bold text-indigo-600 hover:text-indigo-700">Editar Día Completo &rarr;</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

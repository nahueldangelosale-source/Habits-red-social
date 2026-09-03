import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

// Generar 28 días estáticos como base del calendario
const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche

    for (let i = 27; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push({
            dateString: date.toISOString().split('T')[0],
            dateObj: date
        });
    }
    return days;
};

const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const HabitHeatmap: React.FC = () => {

    const { data: historyData } = useQuery({
        queryKey: ['athlete', 'workouts'],
        queryFn: async () => {
            const res = await fetch('/api/v1/athlete/workouts');
            if (!res.ok) throw new Error('Failed to fetch history');
            return res.json();
        }
    });

    const summary = historyData?.summary || { consistency_score: 0 };
    const workouts = historyData?.workouts || [];

    const heatmapData = useMemo(() => {
        const calendar = generateCalendarDays();
        
        // Mapear el historial en un diccionario por fecha 'YYYY-MM-DD'
        const workoutsByDate: Record<string, { volume: number }> = {};
        workouts.forEach((w: any) => {
            // Asegurar que parseamos correctamente la fecha local/utc
            const dateStr = w.started_at.split('T')[0];
            workoutsByDate[dateStr] = { volume: w.total_volume_kg };
        });

        // Encontrar el volumen máximo para relativizar la intensidad
        const maxVolume = workouts.length > 0 ? Math.max(...workouts.map((w: any) => w.total_volume_kg)) : 1;

        return calendar.map(day => {
            const workout = workoutsByDate[day.dateString];
            let intensity = 0;
            if (workout && maxVolume > 0) {
                const ratio = workout.volume / maxVolume;
                if (ratio > 0.75) intensity = 4;
                else if (ratio > 0.5) intensity = 3;
                else if (ratio > 0.25) intensity = 2;
                else intensity = 1;
            }
            return {
                ...day,
                intensity
            };
        });
    }, [workouts]);

    const getColorClass = (intensity: number) => {
        switch(intensity) {
            case 0: return 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-700'; // Nada
            case 1: return 'bg-lime-100 dark:bg-lime-900/20 border-lime-200 dark:border-lime-900/50 text-lime-600 dark:text-lime-800'; 
            case 2: return 'bg-lime-300 dark:bg-lime-800/40 border-lime-400 dark:border-lime-800/50 text-lime-700 dark:text-lime-600'; 
            case 3: return 'bg-lime-500 dark:bg-lime-600 border-lime-500 text-white dark:text-black font-bold'; 
            case 4: return 'bg-lime-400 border-lime-300 text-black font-bold shadow-[0_0_10px_rgba(163,230,53,0.3)]'; // Perfecto
            default: return 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-700';
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/5 rounded-3xl p-5 mb-8 transition-colors">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1 transition-colors">Racha Mensual</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 transition-colors">Últimos 28 días</p>
                </div>
                <div className="text-right">
                    <span className="text-sm font-black text-lime-500 dark:text-lime-400 tracking-widest uppercase transition-colors">{summary.consistency_score}%</span>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider transition-colors">Consistencia</p>
                </div>
            </div>

            {/* Cabecera de Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day, i) => (
                    <div key={i} className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 text-center transition-colors">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {heatmapData.map((day, idx) => (
                    <div 
                        key={idx} 
                        className={`aspect-square rounded-lg border flex items-center justify-center text-[10px] transition-all duration-300 ${getColorClass(day.intensity)}`}
                        title={`Volumen en ${day.dateString}`}
                    >
                        {day.dateString.split('-')[2]}
                    </div>
                ))}
            </div>
        </div>
    );
};

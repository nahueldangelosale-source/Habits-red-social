
import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useBuilderStore } from '../../../stores/builderStore';
import { useTheme } from '../../../context/ThemeContext';

export const MacroRadarWidget: React.FC = () => {
    const { activeDiet } = useBuilderStore();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Calculate totals from all days/meals (or just active day - let's do active day avg for now)
    const data = useMemo(() => {
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let totalCals = 0;

        // Simple aggregation of all foods in the plan
        Object.values(activeDiet.days).forEach(meals => {
            meals.forEach(meal => {
                meal.foods.forEach(food => {
                    totalProtein += food.protein;
                    totalCarbs += food.carbs;
                    totalFats += food.fats;
                    totalCals += food.calories;
                });
            });
        });

        // Normalize to a single day average (assuming 7 days filled, but for MVP just totals)
        // In a real app, this would be compared against targets. 
        // Let's Mock Targets: Protein 150g, Carbs 200g, Fats 60g

        return [
            { subject: 'Protein', A: Math.min(100, (totalProtein / 150) * 100), fullMark: 100 },
            { subject: 'Carbs', A: Math.min(100, (totalCarbs / 200) * 100), fullMark: 100 },
            { subject: 'Fats', A: Math.min(100, (totalFats / 60) * 100), fullMark: 100 },
            { subject: 'Fiber', A: 45, fullMark: 100 }, // Mock
            { subject: 'Water', A: 80, fullMark: 100 }, // Mock
        ];
    }, [activeDiet]);

    return (
        <div className={`p-4 rounded-2xl h-[300px] flex flex-col items-center justify-center transition-all border ${isClinical
            ? 'glass-card-clinical border-slate-200'
            : 'glass-panel bg-[#09090b] border-white/10'}`}>

            <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                Nutrient Balance
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke={isClinical ? "#e2e8f0" : "rgba(255,255,255,0.1)"} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: isClinical ? '#64748b' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Actual"
                        dataKey="A"
                        stroke={isClinical ? "#10b981" : "#6366f1"}
                        strokeWidth={2}
                        fill={isClinical ? "#10b981" : "#6366f1"}
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

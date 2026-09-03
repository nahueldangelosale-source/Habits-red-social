import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

export const KpiRadarWidget: React.FC = () => {
    return (
        <article aria-labelledby="radar-heading" className="bg-[var(--color-clinical-surface)] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-6 rounded-[24px] relative h-full flex flex-col">
            <h3 id="radar-heading" className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Fatiga Global</h3>

            <div className="absolute top-5 right-5 text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5 z-10">
                <Activity size={10} />
                Sobrecarga
            </div>

            <div className="flex-1 w-full min-h-[200px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                        { subject: 'SNC', A: 75, fullMark: 100 },
                        { subject: 'Muscular', A: 40, fullMark: 100 },
                        { subject: 'Sueño', A: 85, fullMark: 100 },
                        { subject: 'Estrés', A: 90, fullMark: 100 },
                    ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Recovery"
                            dataKey="A"
                            stroke="var(--color-action-primary)"
                            strokeWidth={2}
                            fill="var(--color-action-primary)"
                            fillOpacity={0.2}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(9,9,11,0.9)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px' }}
                            itemStyle={{ color: 'var(--color-action-primary)', fontSize: '12px', fontWeight: 'bold' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
};

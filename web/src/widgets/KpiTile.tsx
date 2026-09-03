import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiTileProps {
    label: string;
    value: string | number | undefined;
    subtext: string;
    trend?: number;
    data?: number[];
    icon: React.ElementType;
    mode: string;
}

export function KpiTile({ label, value, subtext, trend, data, icon: Icon, mode }: KpiTileProps) {
    const isClinical = mode === 'CLINICAL';

    return (
        <article className={`p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-transparent shadow-sm ${isClinical
            ? 'glass-card-clinical hover:border-emerald-100/50'
            : 'bg-[var(--color-adrenaline-surface)] hover:border-[var(--color-action-primary)]/20'
            }`}>
            {/* Background Icon */}
            <div className={`absolute top-0 right-0 p-4 transition-opacity duration-500 ${isClinical ? 'opacity-[0.03] group-hover:opacity-[0.08] text-emerald-900' : 'opacity-[0.05] group-hover:opacity-[0.1] text-white'
                }`} aria-hidden="true">
                <Icon size={80} />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <div className={`flex items-center gap-2 mb-3 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        <div className={`p-1.5 rounded-lg ${isClinical ? 'bg-slate-100' : 'bg-white/10'}`} aria-hidden="true">
                            <Icon size={14} />
                        </div>
                        <h3 className="text-xs font-bold tracking-widest uppercase">{label}</h3>
                    </div>

                    <div className="flex items-baseline gap-3 mb-1">
                        <span className={`text-4xl font-sans tracking-tighter ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            {value}
                        </span>
                        {trend !== undefined && (
                            <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${trend > 0
                                ? (isClinical ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--color-action-primary)]/20 text-[var(--color-action-primary)]')
                                : 'bg-rose-100 text-rose-700'
                                }`} aria-label={`Tendencia: ${trend > 0 ? 'Positiva' : 'Negativa'} de ${Math.abs(trend)}%`}>
                                {trend > 0 ? <TrendingUp size={10} className="mr-1" aria-hidden="true" /> : <TrendingDown size={10} className="mr-1" aria-hidden="true" />}
                                {Math.abs(trend)}%
                            </div>
                        )}
                    </div>
                    <p className={`text-xs font-medium ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>{subtext}</p>
                </div>

                {/* Micro-Chart (Sparkline) */}
                {data && (
                    <div className="h-10 w-full mt-6 flex items-end gap-1 opacity-80" aria-label="Gráfica de tendencia">
                        {data.map((h: number, i: number) => (
                            <div
                                key={i}
                                style={{ height: `${h}%` }}
                                className={`flex-1 rounded-sm transition-all duration-300 group-hover:scale-y-110 origin-bottom ${isClinical
                                    ? 'bg-emerald-900/10 group-hover:bg-emerald-600'
                                    : 'bg-white/10 group-hover:bg-[var(--color-action-primary)]'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

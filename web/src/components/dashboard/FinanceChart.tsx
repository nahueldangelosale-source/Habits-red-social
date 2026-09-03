import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export interface FinanceChartProps {
    data: { month: string; revenue: number; clientCount?: number }[];
    isClinical?: boolean;
}

const CustomTooltip = ({ active, payload, label, isClinical }: any) => {
    if (active && payload && payload.length) {
        const revenue = payload[0].value;
        return (
            <div className={`p-3 rounded-2xl border shadow-xl backdrop-blur-md ${
                isClinical 
                    ? 'bg-white/95 border-slate-200 text-slate-900' 
                    : 'bg-zinc-900/95 border-zinc-700 text-white'
            }`}>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-0.5">
                    Mes: {label}
                </p>
                <p className="text-base font-black text-indigo-600 dark:text-indigo-400 font-montserrat">
                    ${Number(revenue).toLocaleString('es-AR')}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                    Recaudación mensual por cuotas
                </p>
            </div>
        );
    }
    return null;
};

const FinanceChart: React.FC<FinanceChartProps> = ({ data, isClinical }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isClinical ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"} />
                <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: isClinical ? '#64748b' : '#a1a1aa', fontWeight: 'bold' }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: isClinical ? '#64748b' : '#71717a', fontWeight: 'bold' }}
                    tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip isClinical={isClinical} />} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default FinanceChart;


/**
 * BIO-SYNTHESIS - Analytics Cockpit
 * Data visualization showing correlations between biometrics.
 * Dark-mode dashboard with AI insights.
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext'; // Import ThemeContext

import { Line, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';

interface ChartData {
    label: string;
    data: number[];
    baseline?: number[];
}

interface ChartData {
    label: string;
    data: number[];
    baseline?: number[]; // Baseline value for reference
}

const BioChart = ({ config, isClinical }: { config: ChartData; isClinical: boolean }) => {
    // Transform data for Recharts: [ { value: 72, baseline: 100 }, ... ]
    const chartData = config.data.map((val, i) => ({
        index: i,
        value: val,
        baseline: config.baseline ? config.baseline[i] : undefined
    }));

    const color = isClinical ? '#4f46e5' : '#a3e635'; // Indigo-600 vs Lime-400
    const strokeColor = isClinical ? '#4f46e5' : '#a3e635';

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${config.label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isClinical ? 'rgba(255, 255, 255, 0.9)' : 'rgba(24, 24, 27, 0.9)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: isClinical ? '#1e293b' : '#fff', fontWeight: 'bold', fontFamily: 'monospace' }}
                        labelStyle={{ display: 'none' }}
                        cursor={{ stroke: isClinical ? '#cbd5e1' : '#3f3f46', strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill={`url(#gradient-${config.label})`}
                        animationDuration={1500}
                    />
                    {config.baseline && (
                        <Line
                            type="monotone"
                            dataKey="baseline"
                            stroke={isClinical ? '#94a3b8' : '#52525b'}
                            strokeDasharray="4 4"
                            strokeWidth={1}
                            dot={false}
                            activeDot={false}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

// Typewriter effect hook
function useTypewriter(text: string, speed: number = 30) {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        setDisplayText(''); // Reset on text change
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return displayText;
}

const chartConfigs: ChartData[] = [
    { label: 'WEIGHT TREND', data: [72, 71.5, 71.8, 71.2, 70.8, 70.5, 70.2, 69.8, 69.5, 69.2, 68.8, 68.4] },
    { label: 'GLUCOSE LEVELS', data: [105, 98, 112, 95, 102, 89, 94, 88, 91, 85, 87, 82], baseline: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100] },
    { label: 'SLEEP QUALITY', data: [65, 70, 68, 75, 72, 80, 78, 82, 85, 83, 88, 90] },
    { label: 'TRAINING VOLUME', data: [1200, 1350, 1400, 1280, 1500, 1450, 1600, 1550, 1700, 1650, 1800, 1750] },
];

const insights = [
    { text: "Analysis: Cortisol spiked at 18:00. Correlates with missed meal window.", type: 'warning' },
    { text: "Positive: Sleep quality improved 23% after implementing evening routine.", type: 'positive' },
    { text: "Recommendation: Increase protein intake by 15g on training days.", type: 'positive' },
];

export function BioSynthesis() {
    const [currentInsight, setCurrentInsight] = useState(0);
    const typedText = useTypewriter(insights[currentInsight].text, 30);
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Styles
    const textColor = isClinical ? 'text-slate-800' : 'text-white';
    const subTextColor = isClinical ? 'text-slate-500' : 'text-slate-400';

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentInsight(prev => (prev + 1) % insights.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <div className="analytics-grid" style={{ flex: 1, display: 'grid', gap: '1rem' }}>
                {chartConfigs.map((config, i) => (
                    <div key={i} className={`chart-card ${isClinical ? 'glass-card-clinical' : 'glass-card-adrenaline'} p-4 rounded-xl flex flex-col justify-between`} style={{ minHeight: '180px' }}>
                        <div className="chart-header flex justify-between mb-2">
                            <span className={`chart-title text-xs font-bold tracking-widest ${subTextColor}`}>{config.label}</span>
                            <span className={`chart-value font-mono font-bold ${textColor}`}>
                                {config.data[config.data.length - 1]}
                            </span>
                        </div>
                        <div className="chart-body flex-1 w-full h-32">
                            <BioChart config={config} isClinical={isClinical} />
                        </div>
                    </div>
                ))}
            </div>

            <div className={`insight-module ${isClinical ? 'glass-card-clinical border-l-4 border-l-indigo-500' : 'glass-card-adrenaline border-l-4 border-l-indigo-400'} p-6 rounded-xl`} style={{ width: '320px', alignSelf: 'flex-start' }}>
                <div className={`insight-title text-xs font-bold uppercase tracking-widest mb-2 ${isClinical ? 'text-indigo-800' : 'text-indigo-400'}`}>AI Analysis</div>
                <div className={`insight-text font-mono text-sm leading-relaxed ${isClinical ? 'text-indigo-900' : 'text-indigo-200'} ${insights[currentInsight].type === 'warning' ? (isClinical ? 'text-amber-700' : 'text-amber-400') : ''}`}>
                    {typedText}
                    <span style={{ borderRight: '2px solid currentColor', marginLeft: '2px', animation: 'blink 0.75s step-end infinite' }} />
                </div>
            </div>
        </div>
    );
}

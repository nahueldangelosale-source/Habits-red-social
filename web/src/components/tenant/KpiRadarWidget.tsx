import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface StaffPerformance {
    id: string;
    name: string;
    riskLevel: 'Low' | 'High';
    mrrImpact: number;
    inactiveAthletes: number;
    sparklineData: number[]; // Array of values to draw the trend
}

const MOCK_STAFF: StaffPerformance[] = [
    { id: '1', name: 'Laura Martínez', riskLevel: 'Low', mrrImpact: 0, inactiveAthletes: 0, sparklineData: [40, 42, 45, 44, 46, 50, 49] },
    { id: '2', name: 'Carlos Díaz', riskLevel: 'High', mrrImpact: -850, inactiveAthletes: 4, sparklineData: [50, 48, 45, 30, 25, 20, 15] },
    { id: '3', name: 'Ana Gómez', riskLevel: 'Low', mrrImpact: 0, inactiveAthletes: 1, sparklineData: [30, 31, 30, 32, 33, 35, 36] },
    { id: '4', name: 'Julián Sosa', riskLevel: 'High', mrrImpact: -1200, inactiveAthletes: 7, sparklineData: [60, 55, 40, 35, 20, 10, 5] },
];

/**
 * Helper to generate a raw SVG Sparkline path to maximize Data-Ink ratio and DOM performance.
 */
const generateSparklinePath = (data: number[], width: number, height: number) => {
    if (data.length === 0) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    const stepX = width / (data.length - 1);

    return data.map((val, index) => {
        const x = index * stepX;
        // Invert Y axis for SVG (0 is top)
        const y = height - ((val - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
};

export const KpiRadarWidget: React.FC = () => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className="w-full max-w-2xl bg-clinical-surface p-8">
            <div className="flex flex-col gap-4">
                {MOCK_STAFF.map((staff) => {
                    const isHighRisk = staff.riskLevel === 'High';
                    const colorClass = isHighRisk ? 'text-risk-high' : 'text-clinical-muted';
                    const strokeColor = isHighRisk ? '#EF4444' : '#94A3B8';
                    const isFaded = hoveredId !== null && hoveredId !== staff.id;

                    return (
                        <div 
                            key={staff.id}
                            className={`group relative flex items-center justify-between transition-all duration-300 ${isFaded ? 'opacity-30' : 'opacity-100'}`}
                            onMouseEnter={() => setHoveredId(staff.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            {/* Figura (Nombre) */}
                            <div className="w-1/3">
                                <span className={`font-heading font-bold text-lg tracking-tight transition-colors duration-300 ${colorClass}`}>
                                    {staff.name}
                                </span>
                            </div>

                            {/* Sparkline (Tendencia Visual) */}
                            <div className="flex-1 px-4 relative">
                                <svg width="100%" height="30" className="overflow-visible">
                                    <path 
                                        d={generateSparklinePath(staff.sparklineData, 200, 30)} 
                                        fill="none" 
                                        stroke={strokeColor} 
                                        strokeWidth={isHighRisk ? 2.5 : 1.5} 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        className="transition-colors duration-300"
                                    />
                                </svg>

                                {/* Micro-etiqueta de Revelación Progresiva en Hover */}
                                {isHighRisk && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <span className="bg-red-50 text-risk-high font-sans text-xs font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap">
                                            ${Math.abs(staff.mrrImpact)} MRR / {staff.inactiveAthletes} Inactivos
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Acción Operativa (Notificar) */}
                            <div className="w-1/4 flex justify-end">
                                {isHighRisk && (
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-red-50 hover:bg-red-100 text-risk-high px-3 py-1.5 rounded-lg text-xs font-bold font-sans uppercase tracking-widest shadow-sm">
                                        <Send size={14} />
                                        Intervenir
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

import React from 'react';
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceArea } from 'recharts';

interface ACWRDataPoint {
    date: string;
    acute_load: number;
    chronic_load: number;
    acwr: number;
}

interface ACWRChartProps {
    data: ACWRDataPoint[];
    isClinical: boolean;
}

export const ACWRChart: React.FC<ACWRChartProps> = ({ data, isClinical }) => {
    // Determine bounds for Sweet Spot
    // The "Sweet Spot" is usually between 0.8 and 1.3
    
    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isClinical ? "#e2e8f0" : "#27272a"} vertical={false} />
                    <XAxis dataKey="date" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                    
                    {/* Left Axis for Load */}
                    <YAxis yAxisId="left" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                    
                    {/* Right Axis for ACWR Ratio */}
                    <YAxis yAxisId="right" orientation="right" domain={[0, 2]} stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                    
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: isClinical ? '#ffffff' : '#18181b', 
                            border: isClinical ? '1px solid #e2e8f0' : '1px solid #27272a',
                            borderRadius: '12px',
                            fontSize: '12px'
                        }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {/* Sweet Spot Zone (Right Axis) */}
                    <ReferenceArea yAxisId="right" y1={0.8} y2={1.3} fill={isClinical ? "#10b981" : "#84cc16"} fillOpacity={0.1} />
                    {/* Danger Zone (Right Axis) */}
                    <ReferenceArea yAxisId="right" y1={1.5} y2={2.0} fill={isClinical ? "#ef4444" : "#f43f5e"} fillOpacity={0.1} />

                    {/* Chronic Load (Area) */}
                    <Area 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="chronic_load" 
                        name="Carga Crónica (28 días)" 
                        stroke={isClinical ? "#cbd5e1" : "#52525b"} 
                        fill={isClinical ? "#f8fafc" : "#18181b"} 
                        strokeWidth={2} 
                    />

                    {/* Acute Load (Bar) */}
                    <Bar 
                        yAxisId="left" 
                        dataKey="acute_load" 
                        name="Carga Aguda (7 días)" 
                        fill={isClinical ? "#94a3b8" : "#a1a1aa"} 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={30}
                    />

                    {/* ACWR Ratio (Line/Area to show spikes) */}
                    <Area 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="acwr" 
                        name="Ratio ACWR" 
                        stroke={isClinical ? "#8b5cf6" : "#a855f7"} 
                        fill="none" 
                        strokeWidth={3} 
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

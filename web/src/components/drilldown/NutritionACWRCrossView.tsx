import React from 'react';
import { Activity, Utensils, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface NutritionACWRCrossViewProps {
    isClinical: boolean;
    acwrData: any;
    nutritionBalanceData: any[];
}

export const NutritionACWRCrossView: React.FC<NutritionACWRCrossViewProps> = ({ isClinical, acwrData, nutritionBalanceData }) => {
    // Mock cross-reference data for demo
    const crossData = [
        { name: 'Sem 1', acwr: 1.0, adherence: 85 },
        { name: 'Sem 2', acwr: 1.1, adherence: 88 },
        { name: 'Sem 3', acwr: 1.3, adherence: 75 },
        { name: 'Sem 4', acwr: 1.5, adherence: 60 } // Danger zone ACWR corresponds to drop in nutrition adherence
    ];

    const currentAcwr = acwrData?.acwr || 1.0;
    const isDanger = currentAcwr >= 1.5;

    return (
        <div className={`p-6 rounded-2xl border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900 border-zinc-800 shadow-xl'}`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                    <Activity size={16} /> ACWR vs. Adherencia Nutricional
                </h3>
                {isDanger && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold uppercase">
                        <AlertTriangle size={12} /> Riesgo por Déficit
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={crossData}>
                            <defs>
                                <linearGradient id="colorAcwr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isClinical ? "#8b5cf6" : "#a855f7"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isClinical ? "#8b5cf6" : "#a855f7"} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isClinical ? "#10b981" : "#84cc16"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isClinical ? "#10b981" : "#84cc16"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isClinical ? "#e2e8f0" : "#27272a"} vertical={false} />
                            <XAxis dataKey="name" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: isClinical ? '#ffffff' : '#18181b', 
                                    border: isClinical ? '1px solid #e2e8f0' : '1px solid #27272a',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }} 
                            />
                            <Area yAxisId="left" type="monotone" dataKey="acwr" stroke={isClinical ? "#8b5cf6" : "#a855f7"} fillOpacity={1} fill="url(#colorAcwr)" strokeWidth={2} name="ACWR" />
                            <Area yAxisId="right" type="monotone" dataKey="adherence" stroke={isClinical ? "#10b981" : "#84cc16"} fillOpacity={1} fill="url(#colorAdherence)" strokeWidth={2} name="Adherencia %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                    <p className={`text-sm leading-relaxed ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                        Correlación detectada: Cuando el ACWR cruza el umbral de 1.3 (aumento brusco de carga), la adherencia nutricional cae un 15-20%.
                    </p>
                    <div className="space-y-3">
                        <div className={`p-3 rounded-xl border flex items-start gap-3 ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                            <TrendingUp size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>Fatiga del SNC</h4>
                                <p className={`text-[11px] ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Mayor carga cognitiva y fatiga limitan la preparación de comidas.</p>
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl border flex items-start gap-3 ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                            <Utensils size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>Intervención Sugerida</h4>
                                <p className={`text-[11px] ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Simplificar la dieta a recetas SARA pre-ensambladas durante picos de ACWR.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

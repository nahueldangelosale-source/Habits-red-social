import React from 'react';
import { Activity, Utensils, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface NutritionACWRCrossViewProps {
    isClinical: boolean;
    acwrData: any;
    nutritionBalanceData: any[];
}

export const NutritionACWRCrossView: React.FC<NutritionACWRCrossViewProps> = ({ isClinical, acwrData }) => {
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
        <div className={`p-6 rounded-3xl border shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl ${
            isClinical ? 'bg-white/95 border-slate-200/90' : 'bg-zinc-950/95 border-zinc-800'
        }`}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-black font-montserrat tracking-widest uppercase flex items-center gap-2 ${
                        isClinical ? 'text-slate-600' : 'text-zinc-400'
                    }`}>
                        <Activity size={15} className="text-indigo-600 dark:text-indigo-400" /> Correlación ACWR vs. Adherencia Nutricional
                    </h3>
                    <span className={`text-[10px] font-black font-montserrat uppercase px-2.5 py-0.5 rounded-full border ${
                        isDanger 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' 
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                        {isDanger ? 'Zona de Riesgo' : 'Sweet Spot (1.0 - 1.3)'}
                    </span>
                </div>
                {isDanger && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black font-montserrat uppercase">
                        <AlertTriangle size={12} /> Riesgo por Déficit
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={crossData}>
                            <defs>
                                <linearGradient id="colorAcwr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isClinical ? "#4f46e5" : "#6366f1"} stopOpacity="0.35" />
                                    <stop offset="95%" stopColor={isClinical ? "#4f46e5" : "#6366f1"} stopOpacity="0" />
                                </linearGradient>
                                <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isClinical ? "#059669" : "#10b981"} stopOpacity="0.35" />
                                    <stop offset="95%" stopColor={isClinical ? "#059669" : "#10b981"} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isClinical ? "#f1f5f9" : "#27272a"} vertical={false} />
                            <XAxis dataKey="name" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke={isClinical ? "#94a3b8" : "#71717a"} fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: isClinical ? '#ffffff' : '#18181b', 
                                    border: isClinical ? '1px solid #e2e8f0' : '1px solid #27272a',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
                                }} 
                            />
                            <Area yAxisId="left" type="monotone" dataKey="acwr" stroke={isClinical ? "#4f46e5" : "#6366f1"} fillOpacity={1} fill="url(#colorAcwr)" strokeWidth={2.5} name="ACWR" />
                            <Area yAxisId="right" type="monotone" dataKey="adherence" stroke={isClinical ? "#059669" : "#10b981"} fillOpacity={1} fill="url(#colorAdherence)" strokeWidth={2.5} name="Adherencia %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex flex-col justify-center space-y-3.5">
                    <div className={`p-3.5 rounded-2xl border ${
                        isClinical ? 'bg-slate-50/70 border-slate-200/70 text-slate-700' : 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
                    }`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <h4 className="text-[11px] font-black font-montserrat uppercase tracking-wider">Patrón Neuro-Biológico</h4>
                        </div>
                        <p className="text-xs leading-relaxed opacity-85">
                            Cuando el ACWR cruza el umbral de <strong>1.3</strong> (incremento agudo en fatiga acumulada), la adherencia nutricional desciende típicamente entre un <strong>15% y 20%</strong>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                            isClinical ? 'bg-amber-50/60 border-amber-200/80' : 'bg-amber-500/10 border-amber-500/20'
                        }`}>
                            <TrendingUp size={15} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-black font-montserrat uppercase tracking-wider mb-0.5 text-amber-900 dark:text-amber-200">Fatiga SNC</h4>
                                <p className="text-[11px] leading-snug text-amber-800 dark:text-amber-300 opacity-90">La sobrecarga cognitiva reduce el tiempo dedicado a preparar comidas.</p>
                            </div>
                        </div>

                        <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                            isClinical ? 'bg-emerald-50/60 border-emerald-200/80' : 'bg-emerald-500/10 border-emerald-500/20'
                        }`}>
                            <Utensils size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[10px] font-black font-montserrat uppercase tracking-wider mb-0.5 text-emerald-900 dark:text-emerald-200">Intervención Sugerida</h4>
                                <p className="text-[11px] leading-snug text-emerald-800 dark:text-emerald-300 opacity-90">Activar recetas exprés y carbohidratos intra-entreno durante picos.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

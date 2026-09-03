import React from 'react';
import { Users, TrendingDown, ArrowRight, Video } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const PopulationInsights: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <aside aria-label="Inteligencia Poblacional" className={`p-5 rounded-3xl border shadow-lg h-full flex flex-col ${
            isClinical ? 'bg-white border-slate-100' : 'bg-zinc-900 border-zinc-800'
        }`}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                    <Users size={16} />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Inteligencia Poblacional</h3>
                    <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Cohorte Activa</p>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className={`p-4 rounded-2xl border ${
                    isClinical ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5'
                }`}>
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm">Alerta de Tendencia</h4>
                        <TrendingDown size={16} className="text-amber-500" />
                    </div>
                    <p className={`text-xs mb-3 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                        El promedio de sueño de la cohorte "Pérdida de Peso" bajó un <strong className={isClinical ? 'text-slate-900' : 'text-white'}>15%</strong> esta semana.
                    </p>
                    
                    <button className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                        isClinical ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                    }`}>
                        <Video size={14} /> Intervención: Enviar Video (1-a-Muchos)
                    </button>
                </div>

                <div className={`p-4 rounded-2xl border ${
                    isClinical ? 'bg-slate-50 border-slate-100' : 'bg-black/20 border-white/5'
                }`}>
                    <h4 className="font-bold text-sm mb-1">Efectividad de Protocolos</h4>
                    <div className="space-y-3 mt-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-bold">
                                <span>Gastro-Inmuno</span>
                                <span>92%</span>
                            </div>
                            <div className={`h-2.5 rounded-full overflow-hidden ${isClinical ? 'bg-slate-200' : 'bg-white/10'}`}>
                                <div className="h-full bg-emerald-500 w-[92%]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1 font-bold">
                                <span>Keto Cíclica</span>
                                <span>65%</span>
                            </div>
                            <div className={`h-2.5 rounded-full overflow-hidden ${isClinical ? 'bg-slate-200' : 'bg-white/10'}`}>
                                <div className="h-full bg-amber-500 w-[65%]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient-Similarity Networks (PSN) Cluster */}
                <div className={`p-4 rounded-2xl border ${
                    isClinical ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-500/20'
                }`}>
                    <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-bold text-sm ${isClinical ? 'text-indigo-900' : 'text-indigo-400'}`}>Clúster Dinámico (PSN)</h4>
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            Anillo Oura
                        </div>
                    </div>
                    <p className={`text-xs mb-3 ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                        La IA detectó <strong className={isClinical ? 'text-indigo-600' : 'text-indigo-400'}>15 pacientes</strong> de diferentes programas con una caída de <strong className={isClinical ? 'text-slate-900' : 'text-white'}>-20% en sueño profundo</strong> anoche.
                    </p>
                    
                    <button className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                        isClinical ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}>
                        <Video size={14} /> Broadcast: Higiene del Sueño
                    </button>
                    <p className="text-center text-[9px] mt-2 opacity-50 uppercase tracking-widest font-bold">Safe by Default: 0 Exclusiones</p>
                </div>
            </div>

            <button className={`mt-4 w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                isClinical ? 'text-slate-400 hover:text-slate-800' : 'text-zinc-400 hover:text-white'
            }`}>
                Ver Reporte Completo <ArrowRight size={14} />
            </button>
        </aside>
    );
};

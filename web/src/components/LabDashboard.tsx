
import React from 'react';
import { FlaskConical, Dna, Activity, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const LabDashboard: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <div className={`min-h-screen p-8 transition-colors duration-500 ${isClinical ? 'text-slate-800' : 'text-white'}`}>

            {/* Header */}
            <div className={`mb-8 border-b pb-4 ${isClinical ? 'border-slate-200' : 'border-white/10'}`}>
                <h1 className={`text-3xl font-sans font-semibold flex items-center gap-3 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                    <FlaskConical size={32} className={isClinical ? "text-emerald-500" : "text-[#88B04B]"} />
                    Laboratorio & Bio-Data
                </h1>
                <p className={`text-sm mt-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Gestión de análisis clínicos y biomarcadores</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Upload Zone */}
                <div className={`lg:col-span-2 p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[300px] transition-all group cursor-pointer ${isClinical
                    ? 'border-slate-300 bg-slate-50 hover:bg-white hover:border-emerald-400 hover:shadow-lg'
                    : 'border-white/10 bg-zinc-900/50 hover:bg-zinc-900 hover:border-indigo-500/50 hover:shadow-indigo-500/10'
                    }`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${isClinical ? 'bg-emerald-100' : 'bg-indigo-500/10'
                        }`}>
                        <FileText size={32} className={isClinical ? "text-emerald-600" : "text-indigo-400"} />
                    </div>
                    <h3 className={`text-xl font-medium mb-2 ${isClinical ? 'text-slate-800' : 'text-white'}`}>Subir Resultados de Análisis</h3>
                    <p className={`text-center text-sm max-w-md mb-6 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                        Arrastra tus archivos PDF o imágenes aquí. Nuestro motor OCR extraerá automáticamente los biomarcadores.
                    </p>
                    <button className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:translate-y-[-2px] ${isClinical
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                        : 'bg-[#88B04B] text-white hover:bg-[#7a9d43] shadow-[#88B04B]/20'
                        }`}>
                        Seleccionar Archivos
                    </button>
                </div>

                {/* Quick Stats / Recent */}
                <div className="space-y-6">
                    <div className={`p-6 rounded-2xl ${isClinical ? 'glass-card-clinical' : 'glass-panel bg-zinc-900'}`}>
                        <h4 className={`font-bold mb-4 flex items-center gap-2 ${isClinical ? 'text-slate-700' : 'text-white'}`}>
                            <Activity size={18} /> Últimos Biomarcadores
                        </h4>
                        <div className="space-y-4">
                            <BiomarkerRow name="Colesterol LDL" value="115 mg/dL" status="warning" />
                            <BiomarkerRow name="Vitamina D" value="32 ng/mL" status="normal" />
                            <BiomarkerRow name="Cortisol" value="18 ug/dL" status="high" />
                        </div>
                    </div>

                    <div className={`p-6 rounded-2xl ${isClinical ? 'glass-card-clinical' : 'glass-panel bg-zinc-900'}`}>
                        <h4 className={`font-bold mb-4 flex items-center gap-2 ${isClinical ? 'text-slate-700' : 'text-white'}`}>
                            <Dna size={18} /> Análisis Genético
                        </h4>
                        <p className={`text-sm mb-4 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Perfil genético no vinculado.</p>
                        <button className={`text-xs font-bold uppercase tracking-wider ${isClinical ? 'text-emerald-600' : 'text-[#88B04B]'}`}>
                            Vincular 23andMe
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

const BiomarkerRow = ({ name, value, status }: { name: string, value: string, status: 'normal' | 'warning' | 'high' }) => {


    return (
        <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100 dark:border-zinc-800 last:border-0">
            <span className="text-sm font-medium">{name}</span>
            <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-slate-500">{value}</span>
                <span className={`w-2 h-2 rounded-full ${status === 'normal' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>
        </div>
    );
}

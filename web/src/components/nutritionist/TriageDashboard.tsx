import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, MessageSquarePlus, Clock, Moon, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface TriagePatient {
    id: string;
    name: string;
    subjectiveStatus: 'GREEN' | 'YELLOW' | 'RED';
    ouraHrv: number; // 0-100 score
    ouraSleep: number; // 0-100 score
    isDissonant: boolean;
    lastUpdated: string;
}

export const TriageDashboard: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Mock Data
    const patients: TriagePatient[] = [
        { id: '1', name: 'Laura Gómez', subjectiveStatus: 'GREEN', ouraHrv: 35, ouraSleep: 40, isDissonant: true, lastUpdated: 'Hace 10 min' },
        { id: '2', name: 'Marcos V.', subjectiveStatus: 'RED', ouraHrv: 45, ouraSleep: 55, isDissonant: false, lastUpdated: 'Hace 1 hora' },
        { id: '3', name: 'Elena R.', subjectiveStatus: 'GREEN', ouraHrv: 85, ouraSleep: 90, isDissonant: false, lastUpdated: 'Hace 3 horas' },
        { id: '4', name: 'Diego M.', subjectiveStatus: 'YELLOW', ouraHrv: 60, ouraSleep: 65, isDissonant: false, lastUpdated: 'Hace 5 horas' },
    ];

    // Clasificación Clínica (Gestión por Excepción)
    const allCriticalPatients = patients.filter(p => p.subjectiveStatus === 'RED' || p.isDissonant);
    
    // Mitigación de Alert Fatigue: Mostrar solo Top 3 críticos
    const criticalPatients = allCriticalPatients.slice(0, 3);
    const hiddenCriticalCount = Math.max(0, allCriticalPatients.length - 3);
    
    const stablePatients = patients.filter(p => p.subjectiveStatus !== 'RED' && !p.isDissonant);

    return (
        <div className={`p-8 min-h-screen ${isClinical ? 'bg-[#f8fafc]' : 'bg-[#0a0a0a]'}`}>
            
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className={`text-3xl font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>Triage Clínico</h2>
                    <p className={`text-sm mt-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-300'}`}>Filtro de Tiempo Global: Hoy</p>
                </div>
                <div className="flex items-center gap-3">
                    {hiddenCriticalCount > 0 && (
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-sm ${isClinical ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-amber-900/20 border border-amber-500/30 text-amber-400'}`}>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            + {hiddenCriticalCount} en Observación (Ocultos)
                        </div>
                    )}
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center shadow-sm ${isClinical ? 'bg-white border border-slate-200 text-slate-700' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                        {stablePatients.length} Estables
                    </div>
                </div>
            </header>

            {/* Dissonance & Crisis Zone */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {criticalPatients.map((patient) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative rounded-3xl p-6 shadow-xl border overflow-hidden ${
                                patient.isDissonant 
                                    ? (isClinical ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-900/30')
                                    : (isClinical ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-950/20 border-rose-900/30')
                            }`}
                        >
                            {/* Alerta de Disonancia: Glow Animado */}
                            {patient.isDissonant && (
                                <motion.div 
                                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className={`absolute inset-0 pointer-events-none ${isClinical ? 'bg-amber-400' : 'bg-amber-500'}`}
                                />
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>{patient.name}</h3>
                                        <div className="flex items-center mt-1">
                                            <Clock className={`w-3 h-3 mr-1 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`} />
                                            <span className={`text-xs font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-300'}`}>{patient.lastUpdated}</span>
                                        </div>
                                    </div>
                                    
                                    {patient.isDissonant ? (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isClinical ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400'}`}>
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isClinical ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/20 text-rose-400'}`}>
                                            <Activity className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Matrix Biometría vs Subjetividad */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className={`p-3 rounded-2xl ${isClinical ? 'bg-white/60' : 'bg-black/20'}`}>
                                        <span className={`text-[10px] uppercase tracking-widest font-bold mb-1 block ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Auto-Reporte</span>
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${patient.subjectiveStatus === 'GREEN' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            <span className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>
                                                {patient.subjectiveStatus === 'GREEN' ? 'Me siento excelente' : 'Agotado/Dolor'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${isClinical ? 'bg-white/60' : 'bg-black/20'}`}>
                                        <span className={`text-[10px] uppercase tracking-widest font-bold mb-1 block flex items-center ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                            Oura Ring <Moon className="w-3 h-3 ml-1" />
                                        </span>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full mr-2 bg-rose-500" />
                                            <span className={`text-sm font-bold ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>HRV {patient.ouraHrv} (Crítico)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Dissonance Nudge (Copiloto Metabólico) */}
                                {patient.isDissonant && (
                                    <div className={`mb-6 p-4 rounded-2xl border ${isClinical ? 'bg-amber-50/80 border-amber-200/50' : 'bg-amber-950/40 border-amber-900/50'}`}>
                                        <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isClinical ? 'text-amber-700' : 'text-amber-500'}`}>Disonancia Detectada</p>
                                        <p className={`text-sm italic leading-relaxed ${isClinical ? 'text-slate-600' : 'text-zinc-300'}`}>
                                            "El paciente reporta bienestar (deseabilidad social), pero su sistema nervioso está colapsando. Evitar restricción calórica."
                                        </p>
                                    </div>
                                )}

                                {/* Acción de Redirección */}
                                <button className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center transition-all ${
                                    patient.isDissonant 
                                        ? (isClinical ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20' : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]')
                                        : (isClinical ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20' : 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.2)]')
                                }`}>
                                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                                    {patient.isDissonant ? 'Enviar Nudge Empático' : 'Contactar por Crisis'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSignature, ShieldAlert, Check, X, Shield, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LogEntry {
    id: string;
    timestamp: Date;
    patientName: string;
    aiSuggestion: string;
    clinicalOverride: string;
    reason: string;
}

export const OverrideLog: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Mock logs
    const [logs] = useState<LogEntry[]>([
        { 
            id: '1', 
            timestamp: new Date(Date.now() - 3600000 * 2), 
            patientName: 'Sofía M.', 
            aiSuggestion: 'Reducción calórica 15% (Oura Readiness = 55)', 
            clinicalOverride: 'Mantener calorías baseline. Inyectar Carbos bajo IG.', 
            reason: 'Paciente en fase lutea. La restricción calórica aumentará el cortisol basal. Prioridad: Resiliencia autonómica.' 
        },
        { 
            id: '2', 
            timestamp: new Date(Date.now() - 3600000 * 48), 
            patientName: 'Carlos T.', 
            aiSuggestion: 'Dieta alta en proteínas (Bloque Hipertrofia)', 
            clinicalOverride: 'Restricción proteica temporal (0.8g/kg).', 
            reason: 'Falso negativo en OCR previo. Filtrado renal (TFG) limítrofe en laboratorios históricos.' 
        }
    ]);

    return (
        <div className={`p-8 min-h-screen ${isClinical ? 'bg-[#f8fafc]' : 'bg-[#0a0a0a]'}`}>
            
            <header className="mb-10 max-w-4xl mx-auto flex items-center justify-between">
                <div>
                    <h2 className={`text-3xl font-serif italic tracking-tight flex items-center ${isClinical ? 'text-slate-900' : 'text-slate-200'}`}>
                        <FileSignature className={`w-8 h-8 mr-3 ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`} />
                        Bitácora de Autoridad Médica
                    </h2>
                    <p className={`text-sm mt-2 font-medium font-serif ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                        Registro inmutable de revocaciones clínicas (RLHF)
                    </p>
                </div>
                <div className={`p-3 rounded-full ${isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-950/30 text-indigo-400'}`}>
                    <Shield className="w-6 h-6" />
                </div>
            </header>

            <div className="max-w-4xl mx-auto space-y-8 relative">
                
                {/* Línea de tiempo vertical decorativa */}
                <div className={`absolute left-8 top-4 bottom-0 w-px ${isClinical ? 'bg-slate-200' : 'bg-zinc-800'}`} />

                {logs.map((log, index) => (
                    <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className={`relative z-10 ml-16 p-8 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl shadow-sm border-l-4 ${
                            isClinical 
                                ? 'bg-white border-l-indigo-500 border-y border-r border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]' 
                                : 'bg-zinc-900/80 border-l-indigo-400 border-y border-r border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                        }`}
                        style={{ fontFamily: "'Georgia', serif" }} // Estética de Pergamino Digital
                    >
                        {/* Conector a la línea de tiempo */}
                        <div className={`absolute top-8 -left-[35px] w-4 h-4 rounded-full border-2 ${
                            isClinical ? 'bg-white border-indigo-500' : 'bg-zinc-950 border-indigo-400'
                        }`} />

                        <div className="flex justify-between items-start mb-6 border-b pb-4 border-slate-200/50 dark:border-white/5">
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>
                                    Override #{log.id.padStart(4, '0')}
                                </span>
                                <h3 className={`text-xl font-bold mt-1 ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>{log.patientName}</h3>
                            </div>
                            <div className={`flex items-center text-xs font-medium ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                <Clock className="w-3 h-3 mr-1" />
                                {log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* Sugerencia RAG (Rechazada) */}
                            <div className={`p-4 rounded-xl border border-dashed ${isClinical ? 'bg-slate-50 border-slate-300' : 'bg-black/20 border-zinc-700'}`}>
                                <div className="flex items-center mb-2">
                                    <X className="w-4 h-4 text-rose-500 mr-2" />
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Sugerencia DietQA</span>
                                </div>
                                <p className={`text-sm italic ${isClinical ? 'text-slate-600 line-through decoration-rose-300' : 'text-zinc-400 line-through decoration-rose-900/50'}`}>
                                    {log.aiSuggestion}
                                </p>
                            </div>

                            {/* Mandato Clínico (Aprobado) */}
                            <div className={`p-4 rounded-xl border ${isClinical ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-900/30'}`}>
                                <div className="flex items-center mb-2">
                                    <Check className="w-4 h-4 text-emerald-500 mr-2" />
                                    <span className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-indigo-700' : 'text-indigo-400'}`}>Mandato Clínico</span>
                                </div>
                                <p className={`text-sm font-medium ${isClinical ? 'text-indigo-900' : 'text-indigo-200'}`}>
                                    {log.clinicalOverride}
                                </p>
                            </div>
                        </div>

                        {/* Justificación Médica */}
                        <div className="mt-4">
                            <span className={`text-xs font-bold uppercase tracking-widest mb-2 block ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                Justificación Médica
                            </span>
                            <p className={`text-base italic leading-relaxed ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>
                                "{log.reason}"
                            </p>
                        </div>
                    </motion.div>
                ))}

            </div>
        </div>
    );
};

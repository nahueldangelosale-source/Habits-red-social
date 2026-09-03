import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, AlertCircle, HeartHandshake, UserX, Crown, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Appointment {
    id: string;
    patientName: string;
    time: string;
    isVIP: boolean;
    graceTokensRemaining: number;
    status: 'SCHEDULED' | 'NO_SHOW_PENDING' | 'RESOLVED';
}

export const SmartCalendar: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Mock Appointments
    const [appointments, setAppointments] = useState<Appointment[]>([
        { id: '1', patientName: 'Javier D. (Alta Fidelidad)', time: '09:00 AM', isVIP: true, graceTokensRemaining: 1, status: 'NO_SHOW_PENDING' },
        { id: '2', patientName: 'Lucía M.', time: '10:30 AM', isVIP: false, graceTokensRemaining: 0, status: 'SCHEDULED' },
    ]);

    const handleGraceTokenUse = (id: string) => {
        setAppointments(prev => prev.map(app => 
            app.id === id 
                ? { ...app, status: 'RESOLVED', graceTokensRemaining: app.graceTokensRemaining - 1 } 
                : app
        ));
    };

    const handleStrictPenalty = (id: string) => {
        setAppointments(prev => prev.map(app => 
            app.id === id ? { ...app, status: 'RESOLVED' } : app
        ));
    };

    return (
        <div className={`p-8 min-h-screen ${isClinical ? 'bg-[#f8fafc]' : 'bg-[#0a0a0a]'}`}>
            
            <header className="mb-10 max-w-5xl mx-auto">
                <h2 className={`text-3xl font-black tracking-tight flex items-center ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                    <CalendarIcon className={`w-8 h-8 mr-3 ${isClinical ? 'text-blue-600' : 'text-blue-500'}`} />
                    Smart Calendar & Revenue Guard
                </h2>
                <p className={`text-sm mt-2 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Gestión de ausencias (No-Shows) y protección de LTV (Valor de Vida del Cliente).
                </p>
            </header>

            <div className="max-w-5xl mx-auto grid gap-6">
                <AnimatePresence>
                    {appointments.map((app) => (
                        <motion.div 
                            key={app.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-6 rounded-3xl border overflow-hidden relative ${
                                app.status === 'NO_SHOW_PENDING' 
                                    ? (isClinical ? 'bg-white border-rose-200 shadow-xl' : 'bg-zinc-900 border-rose-900/50 shadow-2xl')
                                    : (isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/50 border-white/5')
                            }`}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                                
                                {/* Info del Paciente */}
                                <div className="mb-6 md:mb-0">
                                    <div className="flex items-center mb-1">
                                        <Clock className={`w-4 h-4 mr-2 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`} />
                                        <span className={`text-sm font-bold ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>{app.time}</span>
                                        {app.isVIP && (
                                            <span className="ml-3 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-widest bg-amber-500 text-black flex items-center">
                                                <Crown className="w-3 h-3 mr-1" /> VIP LTV
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`text-2xl font-black ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                        {app.patientName}
                                    </h3>
                                    
                                    {app.status === 'NO_SHOW_PENDING' && (
                                        <p className={`text-sm font-bold flex items-center mt-2 ${isClinical ? 'text-rose-600' : 'text-rose-400'}`}>
                                            <AlertCircle className="w-4 h-4 mr-1" /> Ausencia sin aviso (No-Show Detectado)
                                        </p>
                                    )}
                                </div>

                                {/* Controles de Fricción / Resolución */}
                                {app.status === 'NO_SHOW_PENDING' ? (
                                    <div className="flex flex-col gap-3 w-full md:w-auto">
                                        
                                        {/* Grace Token Action (Solo VIPs con saldo) */}
                                        {app.isVIP && app.graceTokensRemaining > 0 ? (
                                            <button 
                                                onClick={() => handleGraceTokenUse(app.id)}
                                                className={`py-3 px-6 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                                                    isClinical ? 'bg-blue-600 text-white shadow-blue-600/20 shadow-lg' : 'bg-blue-500 text-black shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                                }`}
                                            >
                                                <HeartHandshake className="w-5 h-5 mr-2" />
                                                Usar Token de Gracia (Quedan {app.graceTokensRemaining})
                                            </button>
                                        ) : (
                                            <div className={`py-2 px-4 rounded-lg text-xs font-bold text-center border border-dashed ${isClinical ? 'text-slate-400 border-slate-300' : 'text-zinc-450 border-zinc-800'}`}>
                                                Sin Tokens de Gracia Disponibles
                                            </div>
                                        )}

                                        {/* Strict Penalty Action */}
                                        <button 
                                            onClick={() => handleStrictPenalty(app.id)}
                                            className={`py-3 px-6 rounded-xl font-bold flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 border-2 ${
                                                isClinical ? 'bg-white border-slate-200 text-slate-700 hover:border-rose-500 hover:text-rose-600' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-rose-500 hover:text-rose-400'
                                            }`}
                                        >
                                            <UserX className="w-5 h-5 mr-2" />
                                            Ejecutar Degradación Graciosa
                                        </button>

                                    </div>
                                ) : (
                                    <div className={`flex items-center font-bold px-4 py-2 rounded-xl ${isClinical ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        <CheckCircle2 className="w-5 h-5 mr-2" /> Resolvido
                                    </div>
                                )}
                            </div>

                            {/* Info Box del Token de Gracia */}
                            {app.status === 'NO_SHOW_PENDING' && app.isVIP && app.graceTokensRemaining > 0 && (
                                <div className={`mt-6 p-4 rounded-2xl text-sm ${isClinical ? 'bg-blue-50 text-blue-800' : 'bg-blue-950/30 text-blue-300'}`}>
                                    <strong>Estrategia de Retención Activa:</strong> El sistema recomienda perdonar esta ausencia usando el Token de Gracia. Esto anulará el cobro punitivo de $100 y enviará un SMS ultra-empático permitiendo la reprogramación asíncrona. Protege el LTV B2B.
                                </div>
                            )}

                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

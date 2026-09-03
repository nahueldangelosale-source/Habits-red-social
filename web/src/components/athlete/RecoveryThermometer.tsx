import React, { useMemo, useState } from 'react';
import { Activity, HeartPulse, Zap, AlertTriangle, ChevronRight } from 'lucide-react';
import { CorrelationEngine, type DailyTelemetry, type AutonomicReadiness } from '../../data/correlationEngine';

interface Props {
    patientId: string;
    athleteFTP: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATOR (Efecto Ajá para Demos)
// ════════════════════════════════════════════════════════════════════════════════
const generateMockTelemetry = (scenario: 'overtrained' | 'peaking' | 'underloaded'): DailyTelemetry[] => {
    const data: DailyTelemetry[] = [];
    const today = new Date();
    
    // Baseline HRV: ~60ms
    // Baseline Load: ~100 TSS/day
    
    for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        
        let load = 100 + (Math.random() * 20 - 10);
        let hrv = 60 + (Math.random() * 10 - 5);

        if (scenario === 'overtrained' && i < 7) {
            // Últimos 7 días: Carga altísima, HRV desplomado
            load = 200 + (Math.random() * 40);
            hrv = 30 + (Math.random() * 5); 
        } else if (scenario === 'peaking' && i < 7) {
            // Últimos 7 días: Tapering (Carga baja, HRV subiendo)
            load = 80 + (Math.random() * 10);
            hrv = 75 + (Math.random() * 5);
        } else if (scenario === 'underloaded' && i < 14) {
             // Últimos 14 días: Inactividad
             load = 20 + (Math.random() * 10);
             hrv = 55 + (Math.random() * 5);
        }

        data.push({
            dateIso: d.toISOString(),
            trainingLoadTotal: load,
            morningRmssdRaw: hrv
        });
    }
    return data;
};

// ════════════════════════════════════════════════════════════════════════════════
// THERMOMETER COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
export const RecoveryThermometer: React.FC<Props> = ({ athleteFTP }) => {
    // Para Demos de Ventas, permitimos cambiar la historia narrada
    const [scenario, setScenario] = useState<'overtrained' | 'peaking' | 'underloaded'>('peaking');

    const telemetry = useMemo(() => generateMockTelemetry(scenario), [scenario]);
    const readiness = useMemo(() => CorrelationEngine.evaluateReadiness(telemetry, athleteFTP), [telemetry, athleteFTP]);

    // Semántica de Psicología Positiva (Evitar el rojo sangre)
    const getColors = (status: AutonomicReadiness['readinessStatus']) => {
        switch (status) {
            case 'Óptimo': return 'from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-400';
            case 'Precaución': return 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400';
            case 'Alto': return 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400';
            case 'Baja': return 'from-zinc-500/20 to-zinc-600/10 border-zinc-500/30 text-zinc-400';
            default: return 'from-slate-500/10 to-slate-600/5 border-slate-500/20 text-slate-400';
        }
    };

    const getMessage = (status: AutonomicReadiness['readinessStatus']) => {
        switch (status) {
            case 'Óptimo': return 'Listo para asimilar cargas máximas.';
            case 'Precaución': return 'Monitorear la percepción de esfuerzo.';
            case 'Alto': return 'Se sugiere reducir volumen de entrenamiento hoy.';
            case 'Baja': return 'El atleta está perdiendo adaptaciones crónicas.';
            default: return 'Recopilando datos biométricos...';
        }
    };

    const colors = getColors(readiness.readinessStatus);
    const message = getMessage(readiness.readinessStatus);

    return (
        <div className={`p-5 rounded-[2rem] border bg-gradient-to-br shadow-lg ${colors} relative overflow-hidden transition-colors duration-1000`}>
            {/* Ambient Glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-current opacity-10 blur-3xl rounded-full pointer-events-none" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-current flex items-center gap-2 mb-1">
                        <Zap size={14} /> Termómetro de Recuperación
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-medium">Estado de Disposición (HRV + Carga)</p>
                </div>
                
                {/* Selector de Demos Oculto (Click para alternar escenarios) */}
                <select 
                    className="bg-transparent border-none text-[10px] font-bold text-current cursor-pointer outline-none opacity-50 hover:opacity-100 transition-opacity"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value as any)}
                    title="Alternar Escenario de Demo"
                >
                    <option value="peaking">Demo: Óptimo</option>
                    <option value="overtrained">Demo: Riesgo Alto</option>
                    <option value="underloaded">Demo: Carga Baja</option>
                </select>
            </div>

            {/* Main Readiness Indicator */}
            <div className="flex items-end gap-3 mb-6 relative z-10">
                <span className="text-4xl font-black tracking-tighter leading-none text-current transition-all">
                    {readiness.readinessStatus}
                </span>
                {readiness.readinessStatus === 'Alto' && <AlertTriangle className="mb-1 text-current animate-pulse" size={24} />}
                {readiness.readinessStatus === 'Óptimo' && <HeartPulse className="mb-1 text-current" size={24} />}
            </div>

            {/* Data Grid (No formulas, just results) */}
            <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
                <div className="bg-black/20 rounded-2xl p-3 border border-current/10 backdrop-blur-sm">
                    <span className="text-[9px] uppercase tracking-widest text-current/70 block mb-1 font-bold">Carga (ACWR)</span>
                    <span className="text-lg font-black text-current font-mono">{readiness.acwrEwma}</span>
                </div>
                <div className="bg-black/20 rounded-2xl p-3 border border-current/10 backdrop-blur-sm">
                    <span className="text-[9px] uppercase tracking-widest text-current/70 block mb-1 font-bold">Estrés (HRV Z)</span>
                    <span className="text-lg font-black text-current font-mono">{readiness.hrvZScore > 0 ? '+' : ''}{readiness.hrvZScore}</span>
                </div>
            </div>

            {/* Friendly Actionable Message Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative z-10">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-current opacity-80">
                        {readiness.readinessStatus === 'Alto' ? <AlertTriangle size={16} /> : <Zap size={16} />}
                    </div>
                    <div>
                        <span className="text-xs font-bold text-white block mb-1">Sugerencia del Motor:</span>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                            {message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

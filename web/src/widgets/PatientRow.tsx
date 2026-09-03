import { Clock, Activity, LayoutTemplate, Users, AlertTriangle, Target, Zap } from 'lucide-react';
import { ActionMenu } from '../components/ui/ActionMenu';

interface PatientSummary {
    id: string;
    name: string;
    status: 'active' | 'warning' | 'inactive';
    lastCheckIn: string;
    nextCheckIn?: string;
    macrosCompliance?: number;
    plan: string;
    strategicMetric?: { label: string; value: string; trend: 'good' | 'bad' | 'neutral' };
    operationalStreak?: boolean[]; // Array of 7 days, true = met goals
    clinicalFlags?: {
        low_fodmap?: boolean;
        glp1?: boolean;
    };
}

interface PatientRowProps {
    patient: PatientSummary;
    mode: string;
    onClick: () => void;
}

export function PatientRow({ patient, mode, onClick }: PatientRowProps) {
    const isClinical = mode === 'CLINICAL';

    // Mock data if not provided
    const streak = patient.operationalStreak || [true, true, false, true, true, true, true];
    let strategy = patient.strategicMetric || { label: 'HbA1c', value: '5.8%', trend: 'good' as const };

    // Predictive Lag Measure Logic
    const missedDays = streak.filter(met => !met).length;
    const isPredictiveRisk = missedDays >= 3;
    if (isPredictiveRisk && strategy.trend === 'good') {
        strategy = { ...strategy, trend: 'bad' }; // Force bad trend as prediction
    }

    return (
        <article onClick={onClick} className={`group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border border-transparent shadow-sm gap-4 ${isClinical
            ? 'bg-white border-slate-100 hover:shadow-md hover:border-emerald-200'
            : 'bg-white/5 border-white/5 hover:border-[var(--color-action-primary)]/30 hover:bg-white/[0.07]'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
            aria-label={`Ver detalles del paciente ${patient.name}`}
        >
            <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-sans text-lg shadow-sm border ${isClinical
                        ? 'bg-slate-50 text-slate-600 border-slate-100'
                        : 'bg-zinc-950/40 text-zinc-300 border-white/5'
                        }`} aria-hidden="true">
                        {patient.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] ${isClinical ? 'border-white' : 'border-[var(--color-adrenaline-surface)]'
                        } ${patient.status === 'active' ? 'bg-emerald-500' :
                            patient.status === 'warning' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} aria-label={`Estado: ${patient.status}`} />
                </div>

                <div>
                    <h4 className={`text-sm font-bold flex flex-wrap items-center gap-2 ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>
                        {patient.name}
                        {patient.clinicalFlags?.glp1 && (
                            <span className="text-xs font-black text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-sm tracking-wide animate-pulse shrink-0">
                                ⚠️ GLP-1 SAFE
                            </span>
                        )}
                        {patient.clinicalFlags?.low_fodmap && (
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shadow-sm tracking-wide shrink-0">
                                🛡️ LOW-FODMAP
                            </span>
                        )}
                    </h4>
                    <div className={`flex items-center gap-2 text-xs uppercase tracking-wider font-bold mt-0.5 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                        <span>{patient.plan}</span>
                        <span aria-hidden="true">•</span>
                        <span className="flex items-center gap-1">
                            <Clock size={10} aria-hidden="true" /> {patient.lastCheckIn}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6 justify-between md:justify-end w-full md:w-auto">
                {/* Strategic Scorecard */}
                <div className="flex items-center gap-2 hidden sm:flex relative group/score">
                    {isPredictiveRisk && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-0.5 shadow-sm" title="Predicción IA: Riesgo por baja adherencia táctica">
                            <Zap size={10} />
                        </div>
                    )}
                    <div className={`p-1.5 rounded-md transition-colors ${isClinical ? (isPredictiveRisk ? 'bg-amber-50' : 'bg-slate-50') : 'bg-white/5'}`}>
                        <Target size={14} className={strategy.trend === 'good' ? 'text-emerald-500' : 'text-amber-500'} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-xs uppercase tracking-widest font-bold ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>{strategy.label}</span>
                        <span className={`text-xs font-bold ${isClinical ? (isPredictiveRisk ? 'text-amber-600' : 'text-slate-700') : (isPredictiveRisk ? 'text-amber-400' : 'text-zinc-200')}`}>{strategy.value}</span>
                    </div>
                </div>

                {/* Operational Dashboard (7-day streak) */}
                <div className="flex flex-col items-end hidden sm:flex">
                    <span className={`text-xs uppercase tracking-widest font-bold mb-1 ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>7D Adherencia</span>
                    <div className="flex gap-1">
                        {streak.map((met, i) => (
                            <div key={i} className={`w-2 h-4 rounded-sm ${met 
                                ? (isClinical ? 'bg-emerald-400' : 'bg-emerald-500') 
                                : (isClinical ? 'bg-slate-200' : 'bg-zinc-800')}`} 
                            />
                        ))}
                    </div>
                </div>

                <div className={`p-2 rounded-full transition-colors shrink-0 ${isClinical ? 'bg-slate-50 text-slate-300 group-hover:text-emerald-600 group-hover:bg-emerald-50' : 'bg-white/5 text-zinc-600 group-hover:text-white'
                    }`} onClick={(e) => e.stopPropagation()}>
                    <ActionMenu actions={[
                        { label: 'View Details', icon: Activity, onClick: onClick },
                        { label: 'Edit Diet', icon: LayoutTemplate, onClick: () => console.log("Edit Diet") },
                        { label: 'Message', icon: Users, onClick: () => console.log("Message") },
                        { label: 'Archive', icon: AlertTriangle, onClick: () => console.log("Archive"), variant: 'danger' }
                    ]} />
                </div>
            </div>
        </article>
    );
}

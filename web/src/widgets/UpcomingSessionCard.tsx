import { Clock } from 'lucide-react';

interface UpcomingSessionCardProps {
    mode: string;
}

export function UpcomingSessionCard({ mode }: UpcomingSessionCardProps) {
    const isClinical = mode === 'CLINICAL';
    return (
        <article className={`p-6 h-full flex flex-col justify-center rounded-3xl border transition-all shadow-xl ${isClinical ? 'glass-card-clinical' : 'bg-[var(--color-adrenaline-surface)] border-[var(--color-action-primary)]/10'
            }`}>
            <h3 className={`flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'
                }`}>
                <Clock size={16} className={isClinical ? '' : 'text-[var(--color-action-primary)]'} />
                PRÓXIMA SESIÓN
            </h3>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center font-bold text-lg ${isClinical ? 'border-slate-100 bg-slate-100 text-slate-700' : 'border-white/5 bg-zinc-950/40 text-white'
                        }`}>
                        LF {/* Changed from image link to initials for semantic simplicity, standard pattern */}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--color-adrenaline-surface)] ${isClinical ? 'bg-emerald-500' : 'bg-[var(--color-action-primary)]'
                        }`} aria-label="En Línea"></span>
                </div>
                <div>
                    <div className={`font-bold text-lg ${isClinical ? 'text-slate-900' : 'text-white'}`}>Luis Fernández</div>
                    <div className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Hipertrofia - Día de Piernas</div>
                    <div className={`text-xs font-mono mt-1 font-bold ${isClinical ? 'text-emerald-600' : 'text-[var(--color-action-primary)]'}`}>16:00 (En 45m)</div>
                </div>
            </div>
            <button className={`mt-6 w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isClinical
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                : 'bg-[var(--color-action-primary)] text-black hover:opacity-90 shadow-[0_4px_14px_rgba(206,255,0,0.15)]'
                }`}>
                Preparar Sesión
            </button>
        </article>
    );
}

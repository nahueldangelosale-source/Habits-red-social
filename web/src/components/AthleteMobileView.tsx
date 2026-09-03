/**
 * AthleteMobileView â€” B2C Mobile-First PWA
 * 
 * Entry point for athletes accessing their workout routine via a Magic Link.
 * Flow: 
 *   1. Read token from URL path (/atleta/auth/:token)
 *   2. Redeem token → receive JWT → store in localStorage
 *   3. Show routine blocks + Quick Feedback buttons
 * 
 * Design: Strict mobile container (max-w-md), dark premium aesthetic.
 */

import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { getContrastYIQ } from '../utils/colors';
import { redeemMagicToken, submitAthleteFeedback, type FeedbackPayload } from '../api/athleteApi';
import { ProgressiveProfilerWidget } from './athlete/ProgressiveProfilerWidget';
import { StreakRing } from './StreakRing';

// ─── Types ───────────────────────────────────────────────────────────────────

type AppState = 'REDEEMING' | 'AUTHENTICATED' | 'ERROR' | 'FEEDBACK_SENT';

interface RoutineBlock {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
}

// ─── Mock Routine (removed during hygiene) ────────────────────────────

// ─── Collapsible Expandable Card Helper ──────────────────────────────────────

interface ExpandableCardProps {
    title: string;
    children: React.ReactNode;
}

function ExpandableCard({ title, children }: ExpandableCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
            >
                <span>{title}</span>
                <span className={`text-zinc-400 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            <div 
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100 border-t border-white/5 p-5' : 'max-h-0 opacity-0 pointer-events-none'}`}
                style={{ overflow: 'hidden' }}
            >
                {children}
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AthleteMobileView() {
    const [appState, setAppState] = useState<AppState>('REDEEMING');
    const [errorMessage, setErrorMessage] = useState('');
    const [feedbackNotes, setFeedbackNotes] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
    const [exercises, setExercises] = useState<RoutineBlock[]>([]);

    // ─── Tenant Branding Configuration ───────────────────────────────────────
    const [branding, setBranding] = useState<{ logo_url: string | null; primary_color: string, subscription_status?: string }>({
        logo_url: null,
        primary_color: '#6366f1', // Default Aurea Green
        subscription_status: 'active'
    });

    // ─── Token Redemption ────────────────────────────────────────────────────

    useEffect(() => {
        const redeemToken = async () => {
            // Extract token from URL: /atleta/auth/<token>
            const pathSegments = window.location.pathname.split('/');
            const tokenIndex = pathSegments.indexOf('auth');
            const token = tokenIndex !== -1 ? pathSegments[tokenIndex + 1] : null;

            if (!token) {
                setErrorMessage('No se encontró un token válido en la URL.');
                setAppState('ERROR');
                return;
            }

            // Check if already redeemed (JWT present)
            const existingJwt = localStorage.getItem('athlete_jwt');
            if (existingJwt) {
                setAppState('AUTHENTICATED');
                return;
            }

            try {
                const response = await redeemMagicToken(token);
                localStorage.setItem('athlete_jwt', response.access_token);
                localStorage.setItem('athlete_client_id', response.client_id);
                localStorage.setItem('athlete_tenant_id', response.tenant_id);
                setAppState('AUTHENTICATED');
            } catch (err) {
                setErrorMessage(
                    err instanceof Error ? err.message : 'Error al canjear el enlace mágico'
                );
                setAppState('ERROR');
            }
        };

        redeemToken();
    }, []);

    // ─── Fetch Branding when Authenticated ───────────────────────────────────
    useEffect(() => {
        if (appState === 'AUTHENTICATED' || appState === 'FEEDBACK_SENT') {
            const fetchBranding = async () => {
                try {
                    const data: any = await api.get('/v1/tenants/branding');

                    const isPastDue = data.subscription_status === 'past_due';

                    setBranding({
                        // WORKFLOW J: CSS Reversion & Logo Reversion if Gym owner didn't pay
                        logo_url: isPastDue ? null : data.logo_url, // Strip their logo, use AUREA default
                        primary_color: isPastDue ? '#00E5FF' : (data.primary_color || '#6366f1'), // Fallback to AUREA Cyan
                        subscription_status: data.subscription_status
                    });
                } catch (err) {
                    console.error("Failed to load tenant branding, fallback to default", err);
                }
            };
            fetchBranding();
        }
    }, [appState]);

    // ─── Feedback Submission ─────────────────────────────────────────────────

    const handleFeedback = useCallback(async (type: FeedbackPayload['feedback_type']) => {
        setSelectedFeedback(type);
        try {
            await submitAthleteFeedback({
                feedback_type: type,
                notes: feedbackNotes || undefined,
            });
            setAppState('FEEDBACK_SENT');

            // Reset after showing confirmation
            setTimeout(() => {
                setAppState('AUTHENTICATED');
                setSelectedFeedback(null);
                setFeedbackNotes('');
            }, 2500);
        } catch (err) {
            setErrorMessage(
                err instanceof Error ? err.message : 'Error al enviar feedback'
            );
            setAppState('ERROR');
        }
    }, [feedbackNotes]);

    // ─── Render ──────────────────────────────────────────────────────────────

    // Calculate UI Safety
    const foregroundColor = getContrastYIQ(branding.primary_color);

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex justify-center"
            style={{
                '--theme-primary': branding.primary_color,
                '--theme-primary-foreground': foregroundColor
            } as React.CSSProperties}
        >
            <div className="max-w-md mx-auto w-full px-4 py-6 relative">

                {/* ─── Header ───────────────────────────────────────────────────── */}
                <header className="text-center mb-8">
                    {branding.logo_url ? (
                        <div className="mx-auto mb-4 min-h-[48px] flex items-center justify-center">
                            <img src={branding.logo_url} alt="Tenant Logo" className="max-h-12 object-contain" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, var(--theme-primary) 0%, #000 200%)` }}>
                            <span className="text-xl">💪</span>
                        </div>
                    )}
                    <h1 className="text-xl font-bold text-white tracking-tight">Tu Rutina de Hoy</h1>
                    <p className="text-sm text-zinc-500 mt-1">Bienestar APP · Coach Mode</p>
                </header>

                {/* ─── States ───────────────────────────────────────────────────── */}

                {appState === 'REDEEMING' && (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-zinc-400 text-sm">Verificando tu enlace mágico...</p>
                    </div>
                )}

                {appState === 'ERROR' && (
                    <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-6 text-center">
                        <span className="text-3xl block mb-3">🔒</span>
                        <h2 className="text-lg font-semibold text-red-400 mb-2">Acceso Denegado</h2>
                        <p className="text-sm text-red-300/80">{errorMessage}</p>
                        <p className="text-xs text-zinc-500 mt-4">Solicita un nuevo enlace a tu Coach.</p>
                    </div>
                )}

                {appState === 'FEEDBACK_SENT' && (
                    <div className="flex flex-col items-center gap-3 py-20 animate-pulse">
                        <span className="text-5xl">
                            {selectedFeedback === 'COMPLETED' && '🎉'}
                            {selectedFeedback === 'TOO_HEAVY' && '🏋️'}
                            {selectedFeedback === 'PAIN' && '🩺'}
                        </span>
                        <p className="font-semibold" style={{ color: 'var(--theme-primary)' }}>
                            ¡Feedback enviado a tu Coach!
                        </p>
                        <p className="text-xs text-zinc-500">Tu coach recibirá esta notificación en tiempo real.</p>
                    </div>
                )}

                {appState === 'AUTHENTICATED' && (
                    <>
                        {/* ─── WORKFLOW J: Containment Banner (Non-Blocking) ──── */}
                        {branding.subscription_status === 'past_due' && (
                            <div className="mb-6 bg-blue-950/40 border border-[#00E5FF]/40 rounded-2xl p-4 animate-in fade-in slide-in-from-top-4">
                                <div className="flex gap-3">
                                    <span className="text-2xl">🛡️</span>
                                    <div>
                                        <h4 className="text-[#00E5FF] font-semibold text-sm mb-1">
                                            Aviso de Plataforma
                                        </h4>
                                        <p className="text-zinc-300 text-xs leading-relaxed">
                                            Tu centro de entrenamiento está actualizando su sistema.
                                            Pero no te preocupes, tus datos históricos están seguros y respaldados en los servidores de <strong>Bienestar OS</strong>. Disfruta tu sesión de hoy.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Streak & Active Movement Tracker (Pilar 2) ─── */}
                        <div className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex items-center gap-4 relative z-10">
                                <StreakRing streak={5} size="md" />
                                <div>
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Racha Actual</h4>
                                    <p className="text-xl font-black italic tracking-tight text-white mt-0.5">5 Días Activo</p>
                                    <p className="text-[10px] text-emerald-400/80 font-medium">¡Estás encendido! 🔥</p>
                                </div>
                            </div>

                            <div className="h-10 w-px bg-white/10 relative z-10" />

                            <div className="text-right relative z-10 flex-1">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tiempo Activo</h4>
                                <p className="text-xl font-black italic tracking-tight text-white mt-0.5">45 min</p>
                                <p className="text-[10px] text-zinc-500 font-medium">Meta: 150 min/sem</p>
                            </div>
                        </div>

                        {/* ─── Progressive Profiler (Setup-Aha-Habit) ─── */}
                        <div id="progressive-profiler-section" className="mb-6 transition-all duration-500 rounded-3xl">
                            <ProgressiveProfilerWidget />
                        </div>

                        {/* ─── Initiation Phase Mastery Telemetry Lock (Pilar 2) ─── */}
                        <div className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 relative overflow-hidden group">
                            {/* Glassmorphic Lock Layer */}
                            <div className="absolute inset-0 bg-black/75 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center transition-all duration-300">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                                    <span className="text-lg">🔒</span>
                                </div>
                                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                                    Fase de Iniciación (Semanas 1-8)
                                </h3>
                                <p className="text-[11px] text-zinc-400 max-w-[280px] leading-relaxed mb-3.5">
                                    Completa 8 semanas de consistencia para desbloquear Telemetría Avanzada (VO2 max, gráficas de potencia y RPE).
                                </p>
                                
                                {/* Styled Cyan Progress Bar */}
                                <div className="w-full max-w-[220px]">
                                    <div className="flex justify-between text-[9px] font-bold text-cyan-400/80 mb-1 uppercase tracking-widest">
                                        <span>Consistencia</span>
                                        <span>3 / 8 Semanas</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_#00E5FF]"
                                            style={{ width: '37.5%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Blur background mockup elements of advanced telemetry */}
                            <div className="opacity-15 pointer-events-none select-none filter blur-[1px]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-mono text-zinc-400">VO2 Max telemetry</span>
                                    <span className="text-[10px] font-mono text-cyan-400">54.2 ml/kg/min</span>
                                </div>
                                <div className="h-16 bg-zinc-800/40 border border-white/5 rounded-xl mb-2 flex items-end p-2 gap-1">
                                    {[30, 45, 35, 60, 75, 50, 90].map((h, i) => (
                                        <div key={i} className="flex-1 bg-cyan-400/40 rounded-t" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                                <div className="text-[9px] text-zinc-500 text-center font-mono uppercase tracking-wider">Curva de Potencia & RPE Histórico</div>
                            </div>
                        </div>

                        {/* ─── Expandable Cards (Pilar 2) ─── */}
                        <div className="space-y-3 mb-6">
                            <ExpandableCard title="💬 Mensaje Especial de tu Coach">
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                    "¡Hola! Esta semana nos enfocaremos en la fase de iniciación metabólica. Concéntrate en la consistencia de tus días de entrenamiento y no te preocupes por el peso máximo todavía. Mantén un control de 3 segundos en la fase excéntrica del movimiento."
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                                        JD
                                    </div>
                                    <span className="text-[9px] text-zinc-500 font-semibold">Coach Javier Díaz · Hace 2 horas</span>
                                </div>
                            </ExpandableCard>

                            <ExpandableCard title="🛡️ Restricciones Clínicas y Biomecánicas">
                                <div className="space-y-2">
                                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                                        Tu perfil cuenta con protección activa del **Swap Engine Biomecánico** bajo el Protocolo McGill:
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">
                                            Espalda Baja Protegida (Carga Axial Pruneda)
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                            Filtro de Impacto Articular Activo
                                        </span>
                                    </div>
                                </div>
                            </ExpandableCard>
                        </div>

                        {/* ─── Routine Blocks ───────────────────────────────────── */}
                        <div className="space-y-3 mb-8">
                            {exercises.length === 0 ? (
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-12 h-12 mx-auto mb-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                        <span className="text-2xl">🚀</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-2">¡Tu camino hacia el bienestar comienza hoy!</h3>
                                    <p className="text-[11px] text-zinc-400 max-w-[280px] mx-auto leading-relaxed mb-6">
                                        Estamos calibrando tu rutina y emparejándote con tu Coach. Mientras tanto, ayúdanos a afinar tu perfil metabólico.
                                    </p>
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('progressive-profiler-section');
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth' });
                                                el.classList.add('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-black');
                                                setTimeout(() => el.classList.remove('ring-2', 'ring-cyan-400', 'ring-offset-2', 'ring-offset-black'), 2000);
                                            }
                                        }}
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-400 text-black text-xs font-bold tracking-wide uppercase transition-transform active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-300"
                                    >
                                        Completar Mi Perfil ⚡
                                    </button>
                                </div>
                            ) : (
                                exercises.map((block, index) => (
                                    <div
                                        key={block.id}
                                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-emerald-500/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">{block.name}</h3>
                                                    <p className="text-xs text-zinc-500 mt-0.5">
                                                        {block.sets} series × {block.reps} reps · Descanso {block.rest}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {block.notes && (
                                            <p className="text-xs text-amber-400/70 mt-2 pl-10 ">
                                                💡 {block.notes}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* ─── Quick Feedback (3-Click UX) ───────────────────── */}
                        <div className="sticky bottom-4 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 z-20">
                            <p className="text-xs text-zinc-400 text-center mb-3 font-medium uppercase tracking-wider">
                                ¿Cómo te fue hoy?
                            </p>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <button
                                    onClick={() => handleFeedback('COMPLETED')}
                                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all shadow-lg active:scale-95"
                                    style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-primary-foreground)' }}
                                >
                                    <span className="text-2xl">✅</span>
                                    <span className="text-[11px] font-bold tracking-wide">Completado</span>
                                </button>

                                <button
                                    onClick={() => handleFeedback('TOO_HEAVY')}
                                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all active:scale-95"
                                >
                                    <span className="text-2xl">ðŸ‹ï¸</span>
                                    <span className="text-[11px] font-medium text-amber-400">Muy Pesado</span>
                                </button>

                                <button
                                    onClick={() => handleFeedback('PAIN')}
                                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all active:scale-95"
                                >
                                    <span className="text-2xl">ðŸ¤•</span>
                                    <span className="text-[11px] font-medium text-red-400">Dolor</span>
                                </button>
                            </div>

                            {/* Optional Notes */}
                            <input
                                type="text"
                                value={feedbackNotes}
                                onChange={(e) => setFeedbackNotes(e.target.value)}
                                placeholder="Notas adicionales (opcional)..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                            />
                        </div>
                    </>
                )}

                {/* â”€â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <footer className="text-center mt-10 pb-8">
                    <p className="text-[10px] text-zinc-700">
                        Powered by Bienestar APP Â· Datos protegidos con encriptaciÃ³n E2E
                    </p>
                </footer>
            </div>
        </div>
    );
}

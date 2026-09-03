import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, WifiOff, Loader2, Shield, Lock, Unlock, Camera, Sparkles, Dumbbell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/client';
import { enqueueSet, flushOfflineQueue, type QueuedSet } from '../../services/offlineSync';
import { saveRoutineToLocal, getLocalRoutine } from '../../services/offlineDb';
import { useCeremonyStore } from '../../stores/useCeremonyStore';
import { useCanvasWebSocket } from '../../hooks/useCanvasWebSocket';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useCompleteSetMutation } from '../../hooks/useCompleteSetMutation';
import { SyncConflictBanner } from './SyncConflictBanner';

function ShatteringGlassCeremony({ onComplete }: { onComplete: () => void }) {
    // Phase 3: Dopamine Engine - Shattering Glass with GPU acceleration
    const particles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 600,
        y: (Math.random() - 0.5) * 600,
        r: Math.random() * 360,
        s: Math.random() * 1.5 + 0.5
    }));

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-lg overflow-hidden">
            {/* Act I: Lock shaking and shrinking */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.3, 0], rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.8, times: [0, 0.2, 0.4, 0.8] }}
                style={{ willChange: 'transform, opacity' }}
                className="absolute z-10 text-red-500 flex flex-col items-center"
            >
                <Lock size={120} />
                <span className="mt-4 font-bold tracking-widest uppercase text-red-500">Soft-Lock</span>
            </motion.div>
            
            {/* Act II: Glass shattering (GPU Accelerated Particles) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], x: p.x, y: p.y, rotate: p.r, scale: p.s }}
                        transition={{ duration: 1.0, delay: 0.6, ease: 'easeOut' }}
                        style={{ 
                            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', 
                            willChange: 'transform, opacity' 
                        }}
                        className="absolute w-3 h-3 bg-white"
                        // CSS polygon to look like a glass shard
                    />
                ))}
            </div>

            {/* Act III: Glow CTA & Aversion Relief */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8, type: 'spring' }}
                style={{ willChange: 'transform, opacity' }}
                className="z-20 flex flex-col items-center text-center mt-32"
            >
                <Unlock size={80} className="text-indigo-400 mb-6 drop-shadow-[0_0_25px_rgba(206,255,0,0.6)]" />
                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Santuario Desbloqueado</h2>
                <p className="text-zinc-400 mb-10 max-w-md leading-relaxed text-sm">Tu suscripción ha sido confirmada por el Smart Contract. El motor de entrenamiento y todos tus beneficios están activos nuevamente.</p>
                <button 
                    onClick={onComplete}
                    className="px-10 py-5 bg-indigo-500 text-black font-black uppercase tracking-widest text-lg rounded-2xl shadow-[0_0_40px_rgba(206,255,0,0.4)] hover:scale-105 transition-transform"
                >
                    Entrar a la Arena
                </button>
            </motion.div>
        </div>
    );
}

interface RoutineExercise {
    exercise_id: string;
    name: string;
    target_reps: number;
    target_weight: number;
    current_e1rm: number;
}

export function ActiveCanvas() {
    const navigate = useNavigate();
    const { branding } = useTheme();
    const { hasSeenShatteringGlass, markShatteringGlassSeen } = useCeremonyStore();
    const [exercises, setExercises] = useState<RoutineExercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const { token } = useAuth();
    const { mutateAsync: completeSetMutation } = useCompleteSetMutation();
    
    // Conectar WebSocket Reactivo
    useCanvasWebSocket(token);

    // Form State
    const [actualReps, setActualReps] = useState<number | ''>('');
    const [actualWeight, setActualWeight] = useState<number | ''>('');

    // PWA Trojan Horse State
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPwaPrompt, setShowPwaPrompt] = useState(false);
    const [forceCeremony, setForceCeremony] = useState(false);

    // ── Fase 13: Offline Hydration State ──
    const [cachedRoutine, setCachedRoutine] = useState<any[] | undefined>(undefined);
    const [cachedRoutineTimestamp, setCachedRoutineTimestamp] = useState<number | undefined>(undefined);

    // Hidratar desde IndexedDB al montar (antes del primer fetch)
    useEffect(() => {
        getLocalRoutine().then((cached) => {
            if (cached) {
                setCachedRoutine(cached.exercises);
                setCachedRoutineTimestamp(cached.cachedAt);
            }
        });
    }, []);

    const [isAssigningRoutine, setIsAssigningRoutine] = useState(false);

    const { data: routineData, isLoading: loading, refetch } = useQuery({
        queryKey: ['athlete-routine'],
        queryFn: async () => {
            const res = await api.get('/api/v1/athlete/routine/today');
            // Fase 13: Persistir en IndexedDB para offline
            await saveRoutineToLocal((res as any)?.exercises || []);
            return res as any;
        },
        initialData: cachedRoutine,
        initialDataUpdatedAt: cachedRoutineTimestamp,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true
    });

    const handleSelfAssignRoutine = async () => {
        setIsAssigningRoutine(true);
        try {
            await api.post('/api/v1/athlete/routine/self', {});
            toast.success('¡Rutina inteligente activada!');
            await refetch();
        } catch (err) {
            console.error('Error al auto-asignar rutina:', err);
            toast.error('No se pudo activar la rutina. Intentá de nuevo.');
        } finally {
            setIsAssigningRoutine(false);
        }
    };

    useEffect(() => {
        // Silently update exercises in the background if they arrive from WebSocket or query invalidation
        // Only if we don't already have them, OR if they changed.
        // We preserve currentIndex to avoid interrupting the user's active set
        if (routineData && routineData.exercises && routineData.exercises.length > 0) {
            setExercises(routineData.exercises);
            
            // Only set initial weights if we haven't started interacting with the form
            if (actualReps === '' && actualWeight === '' && currentIndex === 0) {
                setActualReps(routineData.exercises[0].target_reps);
                setActualWeight(routineData.exercises[0].target_weight);
            }
        }
    }, [routineData]);

    useEffect(() => {
        // PWA Install Prompt Interception
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Network listeners for offline-first resilience
        const handleOnline = async () => {
            setIsOffline(false);
            // Fase 13: Flush asíncrono con toast de confirmación
            const result = await flushOfflineQueue(async (set: QueuedSet) => {
                await api.post('/api/v1/athlete/sets', set);
            });
            if (result.synced > 0) {
                toast('Sincronización completada', {
                    icon: '✅',
                    position: 'top-center',
                    duration: 2000
                });
            }
        };
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);


    const handleCompleteSet = async () => {
        const currentEx = exercises[currentIndex];

        // Strict ISO String matching exactly the click moment
        const client_created_at = new Date().toISOString();

        const setPayload: QueuedSet = {
            exercise_id: currentEx.exercise_id,
            target_reps: currentEx.target_reps,
            target_weight: currentEx.target_weight,
            actual_reps: Number(actualReps) || currentEx.target_reps,
            actual_weight: Number(actualWeight) || currentEx.target_weight,
            client_created_at,
            idempotency_key: crypto.randomUUID(),
            protocol_id: routineData?.protocol_id || '00000000-0000-0000-0000-000000000000'
        };

        // Fase 29: Optimistic UI & Local Mutation Queue
        try {
            await completeSetMutation(setPayload);
        } catch (e) {
            console.error("Hard fail processing set mutation", e);
        }

        // --- PWA Trojan Horse Trigger ---
        // Just after completing any set, if we have a prompt waiting, we show the modal
        if (deferredPrompt && !showPwaPrompt) {
            setShowPwaPrompt(true);
        }

        // Swipe Next
        if (currentIndex < exercises.length - 1) {
            const nextEx = exercises[currentIndex + 1];
            setCurrentIndex(currentIndex + 1);
            setActualReps(nextEx.target_reps);
            setActualWeight(nextEx.target_weight);
        } else {
            // Workout Finished
            setCurrentIndex(exercises.length);
        }
    };

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA Installation outcome: ${outcome}`);
        setDeferredPrompt(null);
        setShowPwaPrompt(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950 text-neon-volt">
                <Loader2 className="animate-spin w-12 h-12" />
            </div>
        );
    }

    if (currentIndex >= exercises.length && exercises.length > 0) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-zinc-950 text-center p-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-neon-volt">
                    <Check className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold font-sans uppercase tracking-wider text-white">SesiÃ³n Completada</h1>
                    <p className="mt-2 text-zinc-400">Tus datos han sido absorbidos por el Math Engine.</p>
                </motion.div>
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 text-slate-800 p-6 text-center font-sans relative overflow-hidden">
                {/* Decorative background glows */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-slate-200/80 p-8 rounded-3xl flex flex-col items-center shadow-2xl shadow-indigo-500/10 relative z-10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-50 to-purple-50 border border-indigo-100 flex items-center justify-center mb-5 text-indigo-600 shadow-sm">
                        <Dumbbell className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 font-montserrat tracking-tight mb-2">No tenés un plan activo hoy</h2>
                    <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                        Activá tu plan inteligente con periodización por ciclos de 3 días (Torso, Pierna y Full Body) para comenzar a entrenar ya mismo.
                    </p>
                    
                    <button
                        onClick={handleSelfAssignRoutine}
                        disabled={isAssigningRoutine}
                        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-montserrat font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
                    >
                        {isAssigningRoutine ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Activando Plan...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Activar Rutina Inteligente</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/athlete')}
                        className="w-full mt-3 py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver a Inicio (Hábitos)</span>
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentEx = exercises[currentIndex];
    const progressPercent = ((currentIndex) / exercises.length) * 100;

    const shouldShowCeremony = (branding?.payment_status !== 'past_due' && !hasSeenShatteringGlass) || forceCeremony;

    if (shouldShowCeremony) {
        return <ShatteringGlassCeremony onComplete={() => { markShatteringGlassSeen(); setForceCeremony(false); }} />;
    }

    return (
        <div className="flex flex-col h-screen w-full bg-zinc-950 text-white overflow-hidden">
            <SyncConflictBanner />
            {/* Top Banner: Progress & Network Status */}
            <div className="absolute top-0 left-0 w-full z-50">
                <div className="flex justify-between items-center p-4">
                    {isOffline && (
                        <span className="flex items-center text-xs text-red-500 font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded">
                            <WifiOff className="w-3 h-3 mr-2" />
                            Offline Mode (Queueing)
                        </span>
                    )}
                    <span className="ml-auto text-xs text-zinc-500 font-mono">
                        {currentIndex + 1} / {exercises.length}
                    </span>
                </div>
                <div className="h-1 bg-zinc-900 w-full">
                    <motion.div
                        className="h-full bg-neon-volt"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* B2C CONTAINMENT BANNER (Phase 25) */}
            {branding?.payment_status === 'past_due' && (
                <div className="absolute top-16 left-0 w-full z-40 px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900/90 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center gap-3 shadow-2xl"
                    >
                        <div className="w-2 h-2 rounded-full bg-neon-volt animate-pulse" />
                        <p className="text-[10px] text-zinc-300 font-medium leading-tight">
                            Tu centro estÃ¡ <span className="text-white font-bold text-neon-volt">actualizando su sistema</span>. Tus datos de entrenamiento estÃ¡n seguros y respaldados.
                        </p>
                    </motion.div>
                </div>
            )}

            {/* Center Canvas */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 mt-12 relative w-full max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentEx.exercise_id + currentIndex}
                        initial={{ opacity: 0, x: 100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -100, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-full flex flex-col items-center"
                    >
                        <h2 className="text-3xl font-sans font-bold uppercase tracking-wider text-center text-zinc-100 mb-2">
                            {currentEx.name}
                        </h2>
                        <p className="text-sm font-mono text-neon-volt mb-12">
                            TARGET: {currentEx.target_reps} REPS @ {currentEx.target_weight} KG
                        </p>

                        {/* Zero-Friction Inputs */}
                        <div className="flex gap-6 w-full justify-center mb-16">
                            <div className="flex flex-col items-center">
                                <label className="text-xs text-zinc-500 font-mono mb-2">PESO (KG)</label>
                                <input
                                    type="number"
                                    value={actualWeight}
                                    onChange={(e) => setActualWeight(e.target.value ? Number(e.target.value) : '')}
                                    className="w-28 h-24 bg-zinc-900 rounded-2xl text-center text-4xl font-bold font-sans text-white focus:outline-none focus:ring-2 focus:ring-neon-volt selection:bg-neon-volt selection:text-black transition-all"
                                    placeholder={currentEx.target_weight.toString()}
                                />
                            </div>

                            <div className="flex flex-col items-center">
                                <label className="text-xs text-zinc-500 font-mono mb-2">REPS</label>
                                <input
                                    type="number"
                                    value={actualReps}
                                    onChange={(e) => setActualReps(e.target.value ? Number(e.target.value) : '')}
                                    className="w-28 h-24 bg-zinc-900 rounded-2xl text-center text-4xl font-bold font-sans text-white focus:outline-none focus:ring-2 focus:ring-neon-volt selection:bg-neon-volt selection:text-black transition-all"
                                    placeholder={currentEx.target_reps.toString()}
                                />
                            </div>
                        </div>

                        <div className="flex w-full max-w-[300px] gap-2">
                            <button
                                onClick={handleCompleteSet}
                                className="flex-1 bg-neon-volt hover:bg-[#bce600] text-black font-bold font-sans uppercase tracking-widest py-6 rounded-2xl shadow-[0_0_30px_rgba(206,255,0,0.3)] transition-all transform active:scale-95 flex items-center justify-center group"
                            >
                                <Check className="w-6 h-6 mr-2" />
                                Completar
                            </button>
                            <button
                                onClick={() => {
                                    toast.success('Video enviado para Validación Biomecánica', { icon: '🎥' });
                                }}
                                className="w-20 bg-zinc-900 border border-zinc-800 hover:border-neon-volt/50 text-zinc-400 hover:text-neon-volt rounded-2xl flex items-center justify-center transition-all transform active:scale-95"
                                title="Solicitar Validación Biomecánica"
                            >
                                <Camera className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-zinc-600 text-xs mt-4">
                            e1RM Actual: {currentEx.current_e1rm > 0 ? `${currentEx.current_e1rm} kg` : 'Calculando...'}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* PWA Trojan Horse Modal */}
            <AnimatePresence>
                {showPwaPrompt && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 p-6 z-[100] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center text-center"
                    >
                        <div className="w-12 h-1 bg-zinc-800 rounded-full mb-6" />
                        <h3 className="text-xl font-sans font-bold text-white mb-2 tracking-wide uppercase">
                            Experiencia Nativa
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6 max-w-[280px]">
                            Instala Bienestar OS en tu pantalla de inicio para acceso instantÃ¡neo a tus rutinas, incluso <span className="text-neon-volt font-bold">sin conexiÃ³n a internet</span>.
                        </p>
                        <div className="flex w-full space-x-4">
                            <button
                                onClick={() => setShowPwaPrompt(false)}
                                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 font-bold uppercase text-sm"
                            >
                                Ahora No
                            </button>
                            <button
                                onClick={handleInstallClick}
                                className="flex-1 py-3 rounded-xl bg-neon-volt text-black font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(206,255,0,0.2)]"
                            >
                                Instalar App
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

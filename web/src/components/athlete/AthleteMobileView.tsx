import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AthleteDemoDashboard } from './AthleteDemoDashboard';
import { AthleteWorkoutView } from './AthleteWorkoutView';
import { AthleteNutritionDashboard } from './AthleteNutritionDashboard';
import { ActiveWorkoutSession } from './ActiveWorkoutSession';
import { AthleteTribuDashboard } from './AthleteTribuDashboard';
import { MindView } from './MindView';
import { CalendarAgendaView } from './CalendarAgendaView';
import { CoachChatView } from './CoachChatView';
import { ProfileView } from './ProfileView';
import { DailyReadinessModal, type ReadinessResult } from './DailyReadinessModal';
import { FloatingActiveClassPill } from './FloatingActiveClassPill';
import { LiveClassSessionModal } from './LiveClassSessionModal';
import { AthleteWelcomeWizardModal } from './AthleteWelcomeWizardModal';
import { Home, Dumbbell, Target, Users, Brain, MessageCircle, Lock, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { triggerFatigueUpdate, useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useGamificationSync } from '../../hooks/useGamificationSync';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { useAuth } from '../../context/AuthContext';

export type AthleteTab = 'workout' | 'nutrition' | 'home' | 'social' | 'coach' | 'mind' | 'calendar';

export const AthleteMobileView: React.FC = () => {
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [customAvatar, setCustomAvatar] = useState<string | null>(() => localStorage.getItem('athlete-custom-avatar'));

    React.useEffect(() => {
        const handleAvatarUpdated = () => {
            setCustomAvatar(localStorage.getItem('athlete-custom-avatar'));
        };
        window.addEventListener('athlete-avatar-updated', handleAvatarUpdated);
        return () => window.removeEventListener('athlete-avatar-updated', handleAvatarUpdated);
    }, []);
    
    // Check if readiness was already completed or dismissed TODAY
    const [hasCompletedReadiness, setHasCompletedReadiness] = useState(() => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const saved = localStorage.getItem('readiness-today');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.date === todayStr) return true;
            }
            const dismissed = localStorage.getItem('readiness-dismissed-today');
            if (dismissed === todayStr) return true;
        } catch (e) {
            // fallback
        }
        return false;
    });

    const [readinessScore, setReadinessScore] = useState<number | null>(() => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const saved = localStorage.getItem('readiness-today');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.date === todayStr) return parsed.readinessScore || null;
            }
        } catch (e) {
            // fallback
        }
        return null;
    });

    const [currentTab, setCurrentTab] = useState<AthleteTab>('home');
    const { user } = useAuth();
    const [isWelcomeWizardOpen, setIsWelcomeWizardOpen] = useState(() => {
        return localStorage.getItem('athlete-onboarding-completed') !== 'true';
    });
    const { calmMode, athletePhase } = useCognitiveLoad();
    const { isSoftLocked, services } = useOnboardingPTStore();
    const { initXPListener } = useGamificationStore();
    useGamificationSync();

    // Initialize XP event listener (decoupled from all stores)
    React.useEffect(() => {
        const cleanup = initXPListener();
        return cleanup;
    }, [initXPListener]);

    // Listener to re-open welcome wizard manually on demand
    React.useEffect(() => {
        const handleReopenWelcome = () => setIsWelcomeWizardOpen(true);
        window.addEventListener('reopen-athlete-welcome', handleReopenWelcome);

        // Check if URL has ?welcome=true or #welcome
        if (window.location.search.includes('welcome=true') || window.location.hash.includes('welcome')) {
            setIsWelcomeWizardOpen(true);
        }

        return () => window.removeEventListener('reopen-athlete-welcome', handleReopenWelcome);
    }, []);

    // Listener to re-open readiness check-in manually on demand
    React.useEffect(() => {
        const handleReopen = () => setHasCompletedReadiness(false);
        window.addEventListener('reopen-readiness', handleReopen);
        return () => window.removeEventListener('reopen-readiness', handleReopen);
    }, []);

    React.useEffect(() => {
        const handleNavigate = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail) {
                setCurrentTab(customEvent.detail as AthleteTab);
            }
        };
        window.addEventListener('navigate-tab', handleNavigate);
        return () => window.removeEventListener('navigate-tab', handleNavigate);
    }, []);

    const { days } = usePlanBuilderStore();
    const activeDay = days[0];

    return (
        <div className={`min-h-[100dvh] flex flex-col relative transition-colors duration-1000 ${calmMode ? 'bg-slate-50 dark:bg-[#0f111a]' : 'bg-slate-50 dark:bg-[#0a0a0a]'}`}>
            
            <AnimatePresence>
                {!hasCompletedReadiness && (
                    <DailyReadinessModal 
                        onDismiss={() => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            localStorage.setItem('readiness-dismissed-today', todayStr);
                            setHasCompletedReadiness(true);
                        }}
                        onComplete={(result: ReadinessResult) => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            setReadinessScore(result.readinessScore);
                            localStorage.setItem('readiness-today', JSON.stringify({
                                ...result,
                                date: todayStr,
                            }));
                            window.dispatchEvent(new CustomEvent('readiness:completed', { detail: result }));
                            window.dispatchEvent(new CustomEvent('xp:award', {
                                detail: { source: 'readiness', amount: 15 }
                            }));
                            if (result.readinessScore <= 2) {
                                triggerFatigueUpdate('fatigued');
                            } else {
                                triggerFatigueUpdate('optimal');
                            }
                            setHasCompletedReadiness(true);
                        }} 
                    />
                )}
            </AnimatePresence>
            
            {/* Header Global con Logo Habits. + Acceso a Perfil y Mind */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md flex justify-between items-center px-4 py-3 border-b border-slate-200/80 dark:border-white/5 relative max-w-md mx-auto w-full">
                {/* Avatar / Nivel */}
                <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-[2px] shadow-md relative z-10 active:scale-95 transition-transform shrink-0"
                    title="Mi Perfil y Ajustes"
                >
                    <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center font-bold text-xs text-white">
                        {customAvatar ? (
                            <img src={customAvatar} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                            <span>NH</span>
                        )}
                    </div>
                </button>

                {/* Logo Central Habits. */}
                <div 
                    onClick={() => setCurrentTab('home')}
                    className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 cursor-pointer"
                >
                    <img src="/Logo Habits.jpeg" alt="Habits Icon" className="w-9 h-9 rounded-full object-cover shadow-sm" />
                    <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white font-montserrat">
                        Habits<span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-rose-400">.</span>
                    </span>
                </div>
                
                {/* Botón de Acceso Rápido a Mind */}
                <button
                    onClick={() => setCurrentTab('mind')}
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 ${
                        currentTab === 'mind'
                            ? 'bg-purple-600 text-white shadow-purple-600/30'
                            : 'bg-slate-100 dark:bg-zinc-800 text-purple-600 dark:text-purple-400 hover:bg-slate-200'
                    }`}
                    title="Mind Gym & Bienestar Mental"
                >
                    <Brain size={18} />
                </button>
            </header>

            {/* Contenedor Principal Mobile-First */}
            <main className={`flex-1 flex flex-col relative max-w-md mx-auto w-full ${currentTab === 'coach' ? 'h-[calc(100dvh-57px-64px)] overflow-hidden pb-0' : 'pb-24'}`}>

                {currentTab === 'home' && (
                    <AthleteDemoDashboard 
                        onStartWorkout={() => setIsWorkoutActive(true)} 
                        onViewMealPlan={() => setCurrentTab('nutrition')} 
                        onNavigateToWorkout={() => setCurrentTab('workout')}
                        onNavigateToCalendar={() => setCurrentTab('calendar')}
                        onNavigateToMind={() => setCurrentTab('mind')}
                        onNavigateToCoach={() => setCurrentTab('coach')}
                        readinessScore={readinessScore} 
                    />
                )}

                {currentTab === 'workout' && (
                    <AthleteWorkoutView 
                        onStartWorkout={() => setIsWorkoutActive(true)} 
                    />
                )}

                {currentTab === 'nutrition' && (
                    <AthleteNutritionDashboard 
                        onBack={() => setCurrentTab('home')} 
                    />
                )}

                {currentTab === 'social' && (
                    <AthleteTribuDashboard />
                )}

                {currentTab === 'coach' && (
                    <div className="fixed inset-x-0 top-[57px] bottom-16 max-w-md mx-auto flex flex-col z-30 bg-slate-50 dark:bg-[#04060a] overflow-hidden">
                        <CoachChatView />
                    </div>
                )}

                {currentTab === 'mind' && (
                    <MindView />
                )}

                {currentTab === 'calendar' && (
                    <div className="flex flex-col h-full">
                        <div className="p-3 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 flex items-center gap-2">
                            <button
                                onClick={() => setCurrentTab('home')}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1"
                            >
                                <ArrowLeft size={14} /> Volver a Inicio
                            </button>
                            <h3 className="font-montserrat font-black text-sm text-slate-900 dark:text-white">Agenda Completa</h3>
                        </div>
                        <CalendarAgendaView onNavigateTab={(tab) => setCurrentTab(tab as AthleteTab)} />
                    </div>
                )}

                {/* TRAMPA DE ESCASEZ: Zeigarnik Effect / Soft-Lock Overlay */}
                {isSoftLocked && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/50 backdrop-blur-md p-6 animate-in fade-in duration-500">
                        <div className="bg-zinc-900/90 border border-indigo-500/30 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400" />
                            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Protocolo Suspendido</h3>
                            <p className="text-sm text-zinc-400 mb-6 font-lato">
                                Tu infraestructura de rendimiento está lista, pero la conexión está en pausa.
                            </p>
                            
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
                                Activar Protocolo Completo
                            </button>
                        </div>
                    </div>
                )}

                {/* Pill Flotante de Clase en Vivo (cuando el atleta navega por otras pestañas) */}
                <FloatingActiveClassPill />

                {/* Modal de Clase en Vivo (Cronómetro Persistente Inmune a Bloqueo) */}
                <LiveClassSessionModal />
            </main>

            {/* Bottom Navigation: [ Entreno | Nutrición | 🌟 INICIO (Centro) | Social | Coach ] */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 pb-safe z-40">
                <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
                    
                    {/* 1. ENTRENO */}
                    <button 
                        onClick={() => setCurrentTab('workout')}
                        className={`flex flex-col items-center justify-center space-y-0.5 transition-all ${
                            currentTab === 'workout' 
                                ? 'text-indigo-600 dark:text-indigo-400 scale-105 font-bold' 
                                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
                        }`}
                    >
                        <Dumbbell className="w-5 h-5" strokeWidth={2.2} />
                        <span className="text-[9px] font-black tracking-wider uppercase">Entreno</span>
                    </button>

                    {/* 2. NUTRICIÓN */}
                    <button 
                        onClick={() => setCurrentTab('nutrition')}
                        className={`flex flex-col items-center justify-center space-y-0.5 transition-all ${
                            currentTab === 'nutrition' 
                                ? 'text-indigo-600 dark:text-indigo-400 scale-105 font-bold' 
                                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
                        }`}
                    >
                        <UtensilsCrossed className="w-5 h-5" strokeWidth={2.2} />
                        <span className="text-[9px] font-black tracking-wider uppercase">Nutrición</span>
                    </button>

                    {/* 3. 🌟 INICIO (CENTRO MATEMÁTICO DESTACADO CON "H." Y CICLO DE COLOR HABITS) */}
                    <div className="flex flex-col items-center justify-center -mt-5">
                        <motion.button 
                            onClick={() => setCurrentTab('home')}
                            animate={{
                                background: [
                                    'linear-gradient(135deg, #38bdf8 0%, #a78bfa 50%, #fb7185 100%)',
                                    'linear-gradient(135deg, #a78bfa 0%, #fb7185 50%, #fb923c 100%)',
                                    'linear-gradient(135deg, #fb7185 0%, #fb923c 50%, #facc15 100%)',
                                    'linear-gradient(135deg, #fb923c 0%, #facc15 50%, #34d399 100%)',
                                    'linear-gradient(135deg, #facc15 0%, #34d399 50%, #38bdf8 100%)',
                                    'linear-gradient(135deg, #34d399 0%, #38bdf8 50%, #a78bfa 100%)',
                                    'linear-gradient(135deg, #38bdf8 0%, #a78bfa 50%, #fb7185 100%)',
                                ],
                                boxShadow: currentTab === 'home'
                                    ? [
                                        '0 10px 25px -5px rgba(251, 113, 133, 0.45)',
                                        '0 10px 25px -5px rgba(251, 146, 60, 0.45)',
                                        '0 10px 25px -5px rgba(52, 211, 153, 0.45)',
                                        '0 10px 25px -5px rgba(56, 189, 248, 0.45)',
                                        '0 10px 25px -5px rgba(167, 139, 250, 0.45)',
                                        '0 10px 25px -5px rgba(251, 113, 133, 0.45)',
                                    ]
                                    : '0 4px 12px rgba(0, 0, 0, 0.08)'
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all active:scale-90 relative overflow-hidden ${
                                currentTab === 'home'
                                    ? 'ring-4 ring-white dark:ring-zinc-950 scale-105'
                                    : 'opacity-90 hover:opacity-100 hover:scale-100'
                            }`}
                            title="Inicio / Hoy"
                        >
                            <div className="relative flex items-center justify-center select-none">
                                <span className="font-montserrat font-black text-white text-2xl leading-none">
                                    H
                                </span>
                                <span className="absolute -bottom-0.5 -right-2 text-amber-200 text-2xl font-black leading-none pointer-events-none">
                                    .
                                </span>
                            </div>
                        </motion.button>
                        <span className={`text-[9px] font-black tracking-wider uppercase mt-1 transition-colors ${
                            currentTab === 'home' ? 'text-rose-500 dark:text-rose-400 font-bold' : 'text-slate-400 dark:text-zinc-500'
                        }`}>
                            Inicio
                        </span>
                    </div>

                    {/* 4. SOCIAL */}
                    <button 
                        onClick={() => setCurrentTab('social')}
                        className={`flex flex-col items-center justify-center space-y-0.5 transition-all ${
                            currentTab === 'social' 
                                ? 'text-indigo-600 dark:text-indigo-400 scale-105 font-bold' 
                                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
                        }`}
                    >
                        <Users className="w-5 h-5" strokeWidth={2.2} />
                        <span className="text-[9px] font-black tracking-wider uppercase">Social</span>
                    </button>

                    {/* 5. COACH (CHAT DIRECTO) */}
                    <button 
                        onClick={() => setCurrentTab('coach')}
                        className={`flex flex-col items-center justify-center space-y-0.5 transition-all ${
                            currentTab === 'coach' 
                                ? 'text-indigo-600 dark:text-indigo-400 scale-105 font-bold' 
                                : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600'
                        }`}
                    >
                        <MessageCircle className="w-5 h-5" strokeWidth={2.2} />
                        <span className="text-[9px] font-black tracking-wider uppercase">Coach</span>
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                <ProfileView isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            </AnimatePresence>

            {/* Athlete Pedagogical Welcome Wizard */}
            <AthleteWelcomeWizardModal
                isOpen={isWelcomeWizardOpen}
                onClose={() => setIsWelcomeWizardOpen(false)}
                athleteName={user?.name || 'Atleta'}
                hasCoach={Boolean((user as any)?.professional_id || (user as any)?.coach_name)}
                coachName={(user as any)?.coach_name || 'Tu Entrenador'}
            />

            {/* Active Workout Execution Overlay (Full Mobile Experience) */}
            <AnimatePresence>
                {isWorkoutActive && activeDay && (
                    <ActiveWorkoutSession 
                        day={activeDay} 
                        onClose={() => setIsWorkoutActive(false)} 
                    />
                )}
            </AnimatePresence>
            
        </div>
    );
};

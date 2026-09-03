/**
 * THE ARENA - Gamified Finance Style
 * "Wall Street for Wellness" meets "Duolingo"
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords,
    Target,
    Footprints,
    Flame,
    Timer,
    Zap,
    Crown,
    Activity,
    Trophy,
    Users,
    Star,
    Medal
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ActiveChallengeCard } from './dashboard/ActiveChallengeCard';
import { PendingDuelCard } from './dashboard/PendingDuelCard';
import { DopamineTrigger } from './ui/DopamineTrigger';
import { AureaChatWidget } from './chat/AureaChatWidget';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// TYPES & CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const METRIC_CONFIG: Record<string, {
    label: string;
    ticker: string;
    icon: React.ElementType;
    unit: string;
    color: string;
}> = {
    STEPS: { label: 'Pasos', ticker: '$STEP', icon: Footprints, unit: 'pasos', color: '#6366f1' },
    CALORIES: { label: 'Calorías', ticker: '$BURN', icon: Flame, unit: 'kcal', color: '#FF5500' },
    DISTANCE: { label: 'Distancia', ticker: '$DIST', icon: Target, unit: 'km', color: '#00FFFF' },
    WORKOUT_TIME: { label: 'Tiempo Activo', ticker: '$TIME', icon: Timer, unit: 'min', color: '#FF00FF' }
};

type WagerStatus = 'PENDING' | 'ACTIVE' | 'SYNC' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
type ChallengeMetric = 'STEPS' | 'CALORIES' | 'DISTANCE' | 'WORKOUT_TIME';

interface WagerParticipant {
    id: string;
    name: string;
    avatarUrl?: string;
    currentValue?: number;
    verified?: boolean;
    currentUser?: boolean;
}

interface Wager {
    id: string;
    status: WagerStatus;
    challenger: WagerParticipant;
    opponent: WagerParticipant;
    stakeAmount: number;
    metric: ChallengeMetric;
    description?: string;
    challengeStart: string;
    challengeEnd: string;
    winnerId?: string;
    integrityFlags?: string[];
}

interface TribeMember {
    id: string;
    name: string;
    avatarUrl?: string;
    level: number;
    streak: number;
    xp: number;
    division: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}

interface Event {
    id: string;
    title: string;
    description: string;
    timeLeft: string;
    participants: number;
    prizePool: number;
    imageGradient: string;
}

interface TheArenaProps {
    userId: string;
    userBalance: number;
    tribeMembers: TribeMember[];
    activeWagers: Wager[];
    onCreateWager: (data: CreateWagerData) => Promise<void>;
    onAcceptWager: (wagerId: string) => Promise<void>;
    onDeclineWager: (wagerId: string) => Promise<void>;
}

interface CreateWagerData {
    opponentId: string;
    stakeAmount: number;
    metric: ChallengeMetric;
    description?: string;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MOCK DATA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const mockTribeMembers: TribeMember[] = [
    { id: '1', name: 'María García', level: 15, streak: 21, xp: 15400, division: 'Diamond' },
    { id: '2', name: 'Carlos López', level: 12, streak: 14, xp: 12100, division: 'Gold' },
    { id: '3', name: 'Ana Torres', level: 18, streak: 45, xp: 18900, division: 'Diamond' },
    { id: '4', name: 'Pedro Martín', level: 8, streak: 7, xp: 8200, division: 'Silver' },
    { id: '5', name: 'Lucía Fernández', level: 5, streak: 3, xp: 5100, division: 'Bronze' }
];

const mockActiveWagers: Wager[] = [
    {
        id: 'w1',
        status: 'ACTIVE',
        challenger: { id: 'me', name: 'Tú', currentValue: 6240, currentUser: true },
        opponent: { id: '1', name: 'María García', currentValue: 5890 },
        stakeAmount: 500,
        metric: 'STEPS',
        challengeStart: new Date().toISOString(),
        challengeEnd: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'w2',
        status: 'PENDING',
        challenger: { id: '2', name: 'Carlos López' },
        opponent: { id: 'me', name: 'Tú', currentUser: true },
        stakeAmount: 300,
        metric: 'CALORIES',
        challengeStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        challengeEnd: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    }
];

const mockEvents: Event[] = [
    {
        id: 'e1',
        title: 'Weekend Warrior',
        description: 'Complete 30k steps this weekend.',
        timeLeft: '2d 14h',
        participants: 234,
        prizePool: 50000,
        imageGradient: 'from-orange-500 to-red-600'
    },
    {
        id: 'e2',
        title: 'Mindful Morning',
        description: 'Meditate for 10 mins before 8AM.',
        timeLeft: '14h 20m',
        participants: 112,
        prizePool: 10000,
        imageGradient: 'from-blue-400 to-indigo-600'
    }
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPONENTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// COMPONENTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const EventCard = ({ event, mode }: { event: Event, mode: string }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer group ${mode === 'CLINICAL' ? 'bg-white shadow-xl shadow-slate-200/50' : 'bg-zinc-900 border border-white/10'
            }`}
    >
        {/* Background Gradient */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${event.imageGradient} opacity-20 blur-3xl rounded-full -mr-10 -mt-10 group-hover:opacity-30 transition-opacity`} />

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${mode === 'CLINICAL' ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'
                }`}>
                Evento en Vivo
            </div>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                <Timer size={14} /> {event.timeLeft}
            </div>
        </div>

        <h3 className={`text-xl font-black  mb-2 relative z-10 ${mode === 'CLINICAL' ? 'text-slate-800' : 'text-white'
            }`}>{event.title}</h3>

        <p className={`text-xs mb-6 relative z-10 ${mode === 'CLINICAL' ? 'text-slate-500' : 'text-zinc-400'
            }`}>{event.description}</p>

        <div className="flex items-center justify-between relative z-10">
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${mode === 'CLINICAL' ? 'border-white bg-slate-200 text-slate-600' : 'border-black bg-zinc-800 text-zinc-400'
                        }`}>
                        {String.fromCharCode(64 + i)}
                    </div>
                ))}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${mode === 'CLINICAL' ? 'border-white bg-slate-100 text-slate-500' : 'border-black bg-zinc-900 text-zinc-500'
                    }`}>
                    +{event.participants}
                </div>
            </div>
            <div className="flex items-center gap-1 font-mono font-bold text-amber-500">
                <Trophy size={14} /> {event.prizePool.toLocaleString()}
            </div>
        </div>
    </motion.div>
);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export function TheArena({
    userId = 'me',
    userBalance = 4850,
    tribeMembers = mockTribeMembers,
    activeWagers = mockActiveWagers,
    onCreateWager,
    onAcceptWager,
    onDeclineWager
}: Partial<TheArenaProps>) {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // VISUAL CONSTANTS
    const accentColor = isClinical ? '#10B981' : '#6366f1'; // Emerald vs Lime

    // STATE
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedOpponent, setSelectedOpponent] = useState<TribeMember | null>(null);
    const [stakeAmount, setStakeAmount] = useState(100);
    const [selectedMetric, setSelectedMetric] = useState<ChallengeMetric>('STEPS');
    const [tab, setTab] = useState<'monitor' | 'leaderboard'>('monitor');
    const [rankFilter, setRankFilter] = useState<'global' | 'tribe' | 'friends'>('tribe');
    const [showAureaNudge, setShowAureaNudge] = useState(true); // Discovery Track Simulation

    // DATA FILTERS
    const pendingWagers = activeWagers.filter(w => w.status === 'PENDING' && w.opponent.id === userId);
    const myActiveWagers = activeWagers.filter(w => w.status === 'ACTIVE' && (w.challenger.id === userId || w.opponent.id === userId));

    const handleCreateWager = async () => {
        if (!selectedOpponent) return;
        if (onCreateWager) {
            await onCreateWager({
                opponentId: selectedOpponent.id,
                stakeAmount,
                metric: selectedMetric
            });
        }
        setShowCreateModal(false);
        setSelectedOpponent(null);
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 ${isClinical ? 'bg-premium-clinical text-slate-800' : 'bg-premium-adrenaline text-white'
            }`}>
            {/* 1. TICKER TAPE REMOVED */}

            <div className="max-w-7xl mx-auto px-6 py-10 pb-20">

                {/* 2. HEADER AREA */}
                <header className="mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        {/* Title & Status */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mb-2"
                            >
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isClinical ? 'bg-emerald-100 text-emerald-700' : 'bg-lime-400/10 text-lime-400'
                                    }`}>
                                    Temporada 4: Velocidad
                                </div>
                                <span className={`text-[10px] font-mono opacity-50 uppercase`}>Mercado Abierto</span>
                            </motion.div>

                            <h1 className={`text-6xl font-black tracking-tighter flex items-center gap-4 ${isClinical ? 'text-slate-900' : 'text-white'
                                }`}>
                                LA ARENA
                                <Swords size={48} className={isClinical ? "text-emerald-500" : "text-lime-400"} strokeWidth={2} />
                            </h1>
                        </div>

                        {/* User Stats (Duolingo Style) */}
                        <div className="flex gap-4">
                            {/* Streak */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer ${isClinical ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                                    }`}
                            >
                                <Flame size={20} fill="currentColor" />
                                <span className="font-black text-lg">12</span>
                            </motion.div>

                            {/* Balance (Points) */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer ${isClinical ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-lime-400/10 border-lime-400/20 text-lime-400'
                                    }`}
                            >
                                <Zap size={20} fill="currentColor" />
                                <span className="font-black text-lg">{userBalance}</span>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* 3. NAVIGATION TABS (Bouncy) */}
                <div className="flex justify-center mb-10">
                    <div className={`flex p-1.5 rounded-2xl ${isClinical ? 'bg-slate-200/50' : 'bg-zinc-900/50 border border-white/5'}`}>
                        {[
                            { id: 'monitor', label: 'Centro de Comando', icon: Activity },
                            { id: 'leaderboard', label: 'Clasificaciones', icon: Trophy },
                        ].map(t => {
                            const Icon = t.icon;
                            const isActive = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id as any)}
                                    className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${isActive
                                        ? (isClinical ? 'text-slate-900 shadow-sm' : 'text-black shadow-[0_0_20px_rgba(206,255,0,0.3)]')
                                        : (isClinical ? 'text-slate-500 hover:text-slate-700' : 'text-zinc-500 hover:text-zinc-300')
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className={`absolute inset-0 rounded-xl ${isClinical ? 'bg-white' : 'bg-indigo-500'}`}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Icon size={18} /> {t.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. CONTENT AREA */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN (Content) */}
                    <div className="lg:col-span-8 space-y-8">

                        {tab === 'monitor' && (
                            <>
                                {/* LIVE EVENTS SECTION */}
                                <section>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Star size={18} className="text-amber-500" fill="currentColor" />
                                        <h2 className={`font-bold uppercase tracking-widest text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Eventos en Vivo</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mockEvents.map(evt => (
                                            <EventCard key={evt.id} event={evt} mode={mode} />
                                        ))}
                                    </div>
                                </section>

                                {/* ACTIVE DUELS */}
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Swords size={18} className={isClinical ? "text-emerald-500" : "text-lime-400"} />
                                            <h2 className={`font-bold uppercase tracking-widest text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Posiciones Activas</h2>
                                        </div>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${isClinical
                                                ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                                : 'border-lime-400/30 text-lime-400 hover:bg-lime-400/10'
                                                }`}
                                        >
                                            + NUEVO DUELO
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {myActiveWagers.map(wager => (
                                            <ActiveChallengeCard
                                                key={wager.id}
                                                wager={wager}
                                                userId={userId}
                                                accentColor={accentColor}
                                                metricConfig={METRIC_CONFIG}
                                            />
                                        ))}
                                        {myActiveWagers.length === 0 && (
                                            <div onClick={() => setShowCreateModal(true)} className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group ${isClinical ? 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50' : 'border-zinc-800 hover:border-lime-500/50 hover:bg-lime-500/10'
                                                }`}>
                                                <div className={`p-4 rounded-full mb-4 transition-transform group-hover:scale-110 ${isClinical ? 'bg-slate-100' : 'bg-zinc-900'
                                                    }`}>
                                                    <Swords size={24} className={isClinical ? 'text-slate-400' : 'text-zinc-600'} />
                                                </div>
                                                <p className={`font-bold ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>Sin duelos activos</p>
                                                <p className={`text-xs mt-1 ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}>Desafía a un amigo para empezar a ganar</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* PENDING ORDERS */}
                                {pendingWagers.length > 0 && (
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Activity size={18} className="text-blue-500" />
                                            <h2 className={`font-bold uppercase tracking-widest text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Libro de Órdenes (Pendiente)</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {pendingWagers.map(wager => (
                                                <PendingDuelCard
                                                    key={wager.id}
                                                    wager={wager}
                                                    onAccept={() => onAcceptWager?.(wager.id)}
                                                    onDecline={() => onDeclineWager?.(wager.id)}
                                                    accentColor={accentColor}
                                                    metricConfig={METRIC_CONFIG}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}

                        {tab === 'leaderboard' && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Leaderboard Filters */}
                                <div className="flex gap-2 mb-6">
                                    {['global', 'tribe', 'friends'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setRankFilter(f as any)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${rankFilter === f
                                                ? (isClinical ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-lime-400 border-lime-400 text-black')
                                                : (isClinical ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500')
                                                }`}
                                        >
                                            {f === 'global' ? 'Global' : f === 'tribe' ? 'Tribu' : 'Amigos'}
                                        </button>
                                    ))}
                                </div>

                                <div className={`rounded-3xl border overflow-hidden ${isClinical ? 'bg-white border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-zinc-900 border-white/10'
                                    }`}>
                                    {tribeMembers.sort((a, b) => b.xp - a.xp).map((member, i) => (
                                        <div
                                            key={member.id}
                                            className={`flex items-center p-4 border-b last:border-0 hover:bg-white/5 transition-colors ${isClinical ? 'border-slate-100 hover:bg-slate-50' : 'border-white/5'
                                                }`}
                                        >
                                            <div className="w-12 text-center font-black text-lg opacity-30 ">
                                                {i + 1}
                                            </div>

                                            <div className="relative mr-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${isClinical ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-300'
                                                    }`}>
                                                    {member.name.charAt(0)}
                                                </div>
                                                {i < 3 && (
                                                    <div className="absolute -top-2 -right-2">
                                                        <Crown size={20} className={
                                                            i === 0 ? 'text-yellow-400 fill-yellow-400' :
                                                                i === 1 ? 'text-slate-400 fill-slate-400' :
                                                                    'text-amber-700 fill-amber-700'
                                                        } />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className={`font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                                    {member.name}
                                                </div>
                                                <div className="text-xs opacity-60 font-mono">
                                                    División {member.division} • Nv {member.level}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className={`font-mono font-bold text-lg ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                                    {member.xp.toLocaleString()} XP
                                                </div>
                                                <div className="text-xs text-orange-500 font-bold flex items-center justify-end gap-1">
                                                    {member.streak} Días 🔥
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Sidebar Stats) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Division Card */}
                        <div className={`p-6 rounded-3xl border overflow-hidden relative ${isClinical
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20'
                            : 'bg-gradient-to-br from-indigo-900 to-purple-900 border-white/10 text-white'
                            }`}>
                            <div className="absolute top-0 right-0 p-32 bg-white opacity-10 blur-3xl rounded-full -mr-16 -mt-16"></div>

                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                <Medal size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Liga Actual</span>
                            </div>
                            <h3 className="text-3xl font-black  mb-4">DIAMANTE I</h3>

                            <div className="relative h-2 bg-zinc-950/20 rounded-full overflow-hidden mb-2">
                                <div className="absolute top-0 left-0 h-full bg-white w-[75%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                            </div>
                            <div className="flex justify-between text-xs font-mono opacity-80">
                                <span>3,400 XP</span>
                                <span>PROMOCIÓN EN 2 DÍAS</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className={`p-6 rounded-3xl border ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                            }`}>
                            <h4 className={`font-bold uppercase tracking-widest text-xs mb-4 ${isClinical ? 'text-slate-500' : 'text-zinc-500'
                                }`}>Quick Actions</h4>

                            <div className="space-y-2">
                                <button onClick={() => setShowCreateModal(true)} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 ${isClinical
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-lime-400/10 text-lime-400 hover:bg-lime-400/20'
                                    }`}>
                                    <Zap size={16} /> Duelo Instantáneo (Aleatorio)
                                </button>
                                <button className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 ${isClinical
                                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                    }`}>
                                    <Users size={16} /> Invitar Amigo
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* CREATE MODAL */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-lg border rounded-3xl p-8 relative shadow-2xl ${isClinical
                                ? 'bg-white border-slate-200'
                                : 'bg-zinc-950 border-zinc-800'
                                }`}
                        >
                            <h2 className={`text-2xl font-black  mb-6 uppercase flex items-center gap-2 ${isClinical ? 'text-slate-900' : 'text-white'
                                }`}>
                                <Zap size={24} className={isClinical ? "text-emerald-500" : "text-lime-400"} />
                                Iniciar Desafío
                            </h2>

                            {/* Opponent Selection */}
                            <div className="mb-6">
                                <label className="block text-xs font-mono opacity-50 uppercase mb-2">Seleccionar Contraparte</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {tribeMembers.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setSelectedOpponent(m)}
                                            className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${selectedOpponent?.id === m.id
                                                ? (isClinical ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-indigo-500 bg-indigo-500/10 text-white')
                                                : (isClinical ? 'border-slate-200 hover:border-slate-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700')
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${isClinical ? 'bg-slate-200' : 'bg-zinc-800'
                                                }`}>{m.name.charAt(0)}</div>
                                            <span className="text-sm font-bold truncate">{m.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Metric Selection */}
                            <div className="mb-6">
                                <label className="block text-xs font-mono opacity-50 uppercase mb-2">Seleccionar Categoría de Activo</label>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {(Object.keys(METRIC_CONFIG) as ChallengeMetric[]).map(m => {
                                        const conf = METRIC_CONFIG[m];
                                        const Ico = conf.icon;
                                        const isSelected = selectedMetric === m;
                                        return (
                                            <button
                                                key={m}
                                                onClick={() => setSelectedMetric(m)}
                                                className={`px-4 py-3 rounded-xl border flex flex-col items-center gap-2 min-w-[100px] transition-all transform ${isSelected
                                                    ? `scale-105 ${isClinical
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                                                        : 'border-indigo-500 text-indigo-400 bg-indigo-500/5'}`
                                                    : (isClinical
                                                        ? 'border-slate-200 text-slate-500'
                                                        : 'border-zinc-800 text-zinc-500')
                                                    }`}
                                            >
                                                <Ico size={20} />
                                                <span className="text-xs font-bold">{conf.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Stake Amount */}
                            <div className="mb-8">
                                <label className="block text-xs font-mono opacity-50 uppercase mb-2">Monto de la Apuesta (XP)</label>
                                <div className="flex justify-between items-center px-4 py-4 rounded-xl border font-mono text-2xl font-bold">
                                    <button onClick={() => setStakeAmount(Math.max(10, stakeAmount - 10))} className="p-2 opacity-50 hover:opacity-100 active:scale-95 transition-transform">-</button>
                                    <span>{stakeAmount}</span>
                                    <button onClick={() => setStakeAmount(stakeAmount + 10)} className="p-2 opacity-50 hover:opacity-100 active:scale-95 transition-transform">+</button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className={`flex-1 py-3 rounded-xl font-bold font-mono text-xs uppercase ${isClinical ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    Cancelar
                                </button>
                                <DopamineTrigger
                                    onTrigger={handleCreateWager}
                                    className={`flex-[2] py-3 rounded-xl font-black  uppercase disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${!selectedOpponent ? 'opacity-50 cursor-not-allowed' : ''
                                        } ${isClinical
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
                                            : 'bg-indigo-500 text-black hover:bg-[#b0d600] shadow-indigo-500/30'
                                        }`}
                                >
                                    Ejecutar Orden
                                </DopamineTrigger>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AUREA NUDGE (DISCOVERY TRACK FAKE DOOR) */}
            {showAureaNudge && (
                <AureaChatWidget
                    type="LOGISTICS_DAY_1"
                    onComplete={(val) => {
                        console.log("Nudge completed with:", val);
                        setShowAureaNudge(false);
                    }}
                    onDismiss={() => {
                        console.log("[TELEMETRY] TRACK: aurea_widget_dismissed");
                        setShowAureaNudge(false);
                    }}
                />
            )}
        </div>
    );
}


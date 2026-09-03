/**
 * GAMIFICATION HUB - Central Dashboard
 * The Duolingo Effect - All 4 Motors + 5-Pillar Ecosystem
 * 
 * Central hub showing:
 * - Streak Ring (Motor 1)
 * - Freeze Tokens (Motor 2)
 * - Vital Points Wallet (Motor 3)
 * - Leaderboard (Motor 4)
 * - Double or Nothing Bet
 * - Streak Warning Notification
 * - Mind Gym (Mental Training)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Snowflake,
    Coins,
    Trophy,
    Gift,
    Zap,
    Target,
    Calendar,
    Sparkles,
    ShoppingBag,
    Clock,
    Dices,
    Brain,
    Play,
    Moon,
    Wind,
    Eye,
    X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { StreakRing } from './StreakRing';
import { LeaderboardPanel } from './LeaderboardPanel';

// Types
interface UserStats {
    currentStreak: number;
    longestStreak: number;
    freezeTokens: number;
    vitalPoints: number;
    weeklyXP: number;
    level: number;
    totalWorkouts: number;
    hasActiveBet: boolean;
    betAmount: number;
    betDaysCompleted: number;
    hasEliteStatus?: boolean;
}

interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    image: string;
    category: 'discount' | 'product' | 'service' | 'digital';
    discount?: number;
    isPhysical?: boolean;
    tier?: number;
    stockLeft?: number;
}

interface DailyChallenge {
    id: string;
    title: string;
    progress: number;
    target: number;
    reward: number;
    completed: boolean;
}

interface MindTrack {
    id: string;
    title: string;
    type: 'BREATHWORK' | 'MEDITATION' | 'SLEEP_STORY' | 'VISUALIZATION';
    duration: string;
    icon: string;
}

// Mock data
const mockStats: UserStats = {
    currentStreak: 14,
    longestStreak: 28,
    freezeTokens: 2,
    vitalPoints: 4850,
    weeklyXP: 1650,
    level: 12,
    totalWorkouts: 87,
    hasActiveBet: false,
    betAmount: 0,
    betDaysCompleted: 0
};

const mockRewards: Reward[] = [
    { id: '1', name: 'Batido Whey Protein', description: '25g Proteína post-entreno', cost: 150, image: '🥤', category: 'product', isPhysical: true, tier: 2 },
    { id: '2', name: 'Toalla Microfibra', description: 'Edición limitada del Gym', cost: 300, image: '🧣', category: 'product', isPhysical: true, tier: 3, stockLeft: 3 },
    { id: '3', name: 'Pase de Invitado', description: 'Trae a un amigo 1 día', cost: 200, image: '🎟️', category: 'service', isPhysical: false },
    { id: '4', name: 'Avatar: "Lobo Alfa"', description: 'Borde animado para tu perfil', cost: 50, image: '🐺', category: 'digital', isPhysical: false },
];

const mockChallenges: DailyChallenge[] = [
    { id: '1', title: '🏋️ Completar entrenamiento', progress: 1, target: 1, reward: 100, completed: true },
    { id: '2', title: '💧 Beber 2L de agua', progress: 1.5, target: 2, reward: 50, completed: false },
    { id: '3', title: '🚶 10,000 pasos', progress: 7200, target: 10000, reward: 75, completed: false },
];

const mockMindTracks: MindTrack[] = [
    { id: '1', title: 'Respiración Wim Hof', type: 'BREATHWORK', duration: '11 min', icon: '🌬️' },
    { id: '2', title: 'Meditación para Dormir', type: 'SLEEP_STORY', duration: '20 min', icon: '🌙' },
    { id: '3', title: 'Visualización Pre-Entreno', type: 'VISUALIZATION', duration: '8 min', icon: '🎯' },
    { id: '4', title: 'Calma Anti-Ansiedad', type: 'MEDITATION', duration: '15 min', icon: '🧘' },
];

export function GamificationHub() {
    const { mode } = useTheme();
    const [stats, setStats] = useState<UserStats>(mockStats);
    const [rewards] = useState<Reward[]>(mockRewards);
    const [challenges] = useState<DailyChallenge[]>(mockChallenges);
    const [mindTracks] = useState<MindTrack[]>(mockMindTracks);
    const [showRewardModal, setShowRewardModal] = useState<Reward | null>(null);
    const [showBetModal, setShowBetModal] = useState(false);
    const [showStreakWarning, setShowStreakWarning] = useState(false);
    const [animatePoints] = useState(false);
    const [hoursLeft] = useState(3);
    const [statusNotification, setStatusNotification] = useState<string | null>(null);

    const accentColor = mode === 'CLINICAL' ? '#88B04B' : '#6366f1';
    const cardBg = mode === 'CLINICAL' ? 'var(--surface)' : 'var(--surface)';

    // Simulate streak warning at 21:00 (demo trigger)
    useEffect(() => {
        // Demo: show warning after 3 seconds if no activity
        const timer = setTimeout(() => {
            if (!challenges.every(c => c.completed)) {
                setShowStreakWarning(true);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // Calculate level progress
    const levelProgress = (stats.weeklyXP % 1000) / 1000;
    const nextLevelXP = 1000 - (stats.weeklyXP % 1000);

    const redeemReward = (reward: Reward) => {
        if (stats.vitalPoints >= reward.cost) {
            setStats(prev => ({ ...prev, vitalPoints: prev.vitalPoints - reward.cost }));
            setShowRewardModal(null);
            
            // Antigravity 2.0: Estatus Social como Valor Intrínsico
            if (reward.category === 'digital') {
                setStatusNotification(`🔥 La Tribu se ha enterado: Acabas de desbloquear ${reward.name}`);
                setStats(prev => ({ ...prev, hasEliteStatus: true }));
                setTimeout(() => setStatusNotification(null), 5000);
            }
        }
    };

    const buyFreezeToken = () => {
        if (stats.vitalPoints >= 1000) {
            setStats(prev => ({
                ...prev,
                vitalPoints: prev.vitalPoints - 1000,
                freezeTokens: prev.freezeTokens + 1
            }));
        }
    };

    const placeBet = () => {
        if (stats.vitalPoints >= 500 && !stats.hasActiveBet) {
            setStats(prev => ({
                ...prev,
                vitalPoints: prev.vitalPoints - 500,
                hasActiveBet: true,
                betAmount: 500,
                betDaysCompleted: 0
            }));
            setShowBetModal(false);
        }
    };

    const getMindTrackIcon = (type: string) => {
        switch (type) {
            case 'BREATHWORK': return <Wind size={16} />;
            case 'MEDITATION': return <Brain size={16} />;
            case 'SLEEP_STORY': return <Moon size={16} />;
            case 'VISUALIZATION': return <Eye size={16} />;
            default: return <Brain size={16} />;
        }
    };

    return (
        <div className="gamification-hub">
            {/* Streak Warning Notification - The Famous Duolingo Alert */}
            <AnimatePresence>
                {showStreakWarning && (
                    <motion.div
                        className="streak-warning-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="streak-warning-modal"
                            initial={{ scale: 0.8, y: -50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: -50 }}
                        >
                            <button
                                className="close-warning"
                                onClick={() => setShowStreakWarning(false)}
                            >
                                <X size={20} />
                            </button>
                            <div className="warning-icon">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, -10, 10, 0]
                                    }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                                >
                                    🔥
                                </motion.div>
                            </div>
                            <h2>¡Vas a perder tu racha de {stats.currentStreak} días!</h2>
                            <p className="warning-timer">
                                <Clock size={18} />
                                Tienes <strong>{hoursLeft} horas</strong> para completar un hábito
                            </p>
                            <div className="warning-streak-display">
                                <StreakRing
                                    streak={stats.currentStreak}
                                    size="md"
                                    showWarning={true}
                                    avatarInitials="NH"
                                />
                                <div className="streak-at-risk">
                                    <span className="big-number">{stats.currentStreak}</span>
                                    <span>días en riesgo</span>
                                </div>
                            </div>
                            <div className="warning-actions">
                                <motion.button
                                    className="action-primary"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowStreakWarning(false)}
                                    style={{ background: accentColor }}
                                >
                                    💪 ¡Entrenar Ahora!
                                </motion.button>
                                <button
                                    className="action-secondary"
                                    onClick={() => {
                                        buyFreezeToken();
                                        setShowStreakWarning(false);
                                    }}
                                    disabled={stats.freezeTokens >= 3 && stats.vitalPoints < 1000}
                                >
                                    <Snowflake size={14} />
                                    Usar Freeze Token ({stats.freezeTokens} disponibles)
                                </button>
                            </div>
                            <p className="warning-tip">
                                💡 Tip: Hasta beber un vaso de agua cuenta como hábito mínimo
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header with Streak */}
            <div className="hub-header relative">
                
                <AnimatePresence>
                    {statusNotification && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-full font-black shadow-[0_0_30px_rgba(234,179,8,0.4)] z-50 whitespace-nowrap flex items-center gap-2"
                        >
                            <Trophy size={16} /> {statusNotification}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="header-streak relative">
                    {stats.hasEliteStatus && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500/20 text-yellow-400 text-[10px] uppercase font-black px-3 py-1 rounded-full border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center gap-1 z-10 animate-pulse">
                            👑 Estatus Élite Activo
                        </div>
                    )}
                    <StreakRing
                        streak={stats.currentStreak}
                        avatarInitials="NH"
                        size="lg"
                        freezeTokens={stats.freezeTokens}
                    />
                    <div className="streak-info">
                        <h2>¡Racha de Fuego! 🔥</h2>
                        <p>{stats.currentStreak} días consecutivos</p>
                        <div className="streak-meta">
                            <span><Trophy size={14} /> Récord: {stats.longestStreak} días</span>
                            <span><Calendar size={14} /> {stats.totalWorkouts} entrenamientos</span>
                        </div>
                    </div>
                </div>

                {/* Level Badge */}
                <div className="level-badge" style={{ background: cardBg }}>
                    <div className="level-icon" style={{ background: `${accentColor}20` }}>
                        <Zap size={24} style={{ color: accentColor }} />
                    </div>
                    <div className="level-info">
                        <span className="level-label">Nivel {stats.level}</span>
                        <div className="level-progress">
                            <div
                                className="level-bar"
                                style={{
                                    width: `${levelProgress * 100}%`,
                                    background: `linear-gradient(90deg, ${accentColor}, #10B981)`
                                }}
                            />
                        </div>
                        <span className="level-xp">{nextLevelXP} XP para nivel {stats.level + 1}</span>
                    </div>
                </div>
            </div>

            <div className="hub-layout">
                {/* Left Column */}
                <div className="hub-left">
                    {/* Double or Nothing Bet Card */}
                    <motion.div
                        className={`bet-card ${stats.hasActiveBet ? 'active-bet' : ''}`}
                        style={{ background: cardBg }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="bet-header">
                            <Dices size={20} style={{ color: '#EC4899' }} />
                            <h3>Doble o Nada</h3>
                            {stats.hasActiveBet && <span className="bet-active-badge">ACTIVO</span>}
                        </div>
                        {stats.hasActiveBet ? (
                            <div className="bet-progress">
                                <div className="bet-days">
                                    {[...Array(7)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`bet-day ${i < stats.betDaysCompleted ? 'completed' : ''}`}
                                        >
                                            {i < stats.betDaysCompleted ? '✓' : i + 1}
                                        </div>
                                    ))}
                                </div>
                                <p className="bet-status">
                                    {stats.betDaysCompleted}/7 días completados
                                </p>
                                <div className="bet-stakes">
                                    <span className="stake lose">Perder: -{stats.betAmount}</span>
                                    <span className="stake win">Ganar: +{stats.betAmount * 2}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bet-offer">
                                <p>Apuesta 500 puntos a que entrenas 7 días seguidos</p>
                                <div className="bet-odds">
                                    <span className="lose">❌ Fallas: Pierdes 500</span>
                                    <span className="win">✅ Ganas: Recibes 1000</span>
                                </div>
                                <motion.button
                                    className="place-bet-btn"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowBetModal(true)}
                                    disabled={stats.vitalPoints < 500}
                                >
                                    <Dices size={16} />
                                    Hacer Apuesta (500 pts)
                                </motion.button>
                            </div>
                        )}
                    </motion.div>

                    {/* Wallet Card */}
                    <motion.div
                        className="wallet-card"
                        style={{ background: cardBg }}
                        animate={animatePoints ? { scale: [1, 1.02, 1] } : {}}
                    >
                        <div className="wallet-header">
                            <Coins size={20} style={{ color: '#F59E0B' }} />
                            <h3>Vital Points</h3>
                            <Sparkles size={14} style={{ color: '#F59E0B' }} />
                        </div>
                        <motion.div
                            className="wallet-balance"
                            key={stats.vitalPoints}
                            initial={{ scale: 1.2, color: '#10B981' }}
                            animate={{ scale: 1, color: 'var(--text-primary)' }}
                        >
                            {stats.vitalPoints.toLocaleString()}
                        </motion.div>
                        <div className="wallet-actions">
                            <button
                                className="wallet-btn freeze"
                                onClick={buyFreezeToken}
                                disabled={stats.vitalPoints < 1000}
                            >
                                <Snowflake size={14} />
                                Comprar Freeze (1000)
                            </button>
                            <button className="wallet-btn history">
                                <Clock size={14} />
                                Historial
                            </button>
                        </div>
                    </motion.div>

                    {/* Mind Gym Card */}
                    <div className="mind-gym-card" style={{ background: cardBg }}>
                        <div className="mind-gym-header">
                            <Brain size={20} style={{ color: '#8B5CF6' }} />
                            <h3>Mind Gym</h3>
                            <span className="mind-gym-badge">Nuevo</span>
                        </div>
                        <p className="mind-gym-subtitle">Entrenamiento mental prescrito por tu coach</p>
                        <div className="mind-tracks">
                            {mindTracks.slice(0, 3).map(track => (
                                <motion.div
                                    key={track.id}
                                    className="mind-track"
                                    whileHover={{ x: 4, background: 'var(--surface-elevated)' }}
                                >
                                    <div className="track-icon">{track.icon}</div>
                                    <div className="track-info">
                                        <span className="track-title">{track.title}</span>
                                        <span className="track-meta">
                                            {getMindTrackIcon(track.type)}
                                            {track.duration}
                                        </span>
                                    </div>
                                    <button className="play-track">
                                        <Play size={14} fill="currentColor" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        <button className="see-all-tracks">
                            Ver biblioteca completa →
                        </button>
                    </div>
                </div>

                {/* Center Column - Rewards & Challenges */}
                <div className="hub-center">
                    {/* Daily Challenges */}
                    <div className="challenges-card" style={{ background: cardBg }}>
                        <div className="challenges-header">
                            <Target size={18} style={{ color: accentColor }} />
                            <h3>Misiones Diarias</h3>
                            <span className="challenges-reset">Reinicia en 14h</span>
                        </div>
                        <div className="challenges-list">
                            {challenges.map(challenge => (
                                <div
                                    key={challenge.id}
                                    className={`challenge-item ${challenge.completed ? 'completed' : ''}`}
                                >
                                    <div className="challenge-info">
                                        <span className="challenge-title">{challenge.title}</span>
                                        <div className="challenge-progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`,
                                                    background: challenge.completed
                                                        ? '#10B981'
                                                        : `linear-gradient(90deg, ${accentColor}, #10B981)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="challenge-reward">
                                        <Coins size={12} color="#F59E0B" />
                                        <span>+{challenge.reward}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="challenges-total">
                            <span>Completadas: {challenges.filter(c => c.completed).length}/{challenges.length}</span>
                            <span className="bonus">Bonus por todas: +200</span>
                        </div>
                    </div>

                    {/* Rewards Marketplace */}
                    <div className="rewards-section" style={{ background: cardBg }}>
                        <div className="rewards-header">
                            <Gift size={20} style={{ color: '#EC4899' }} />
                            <h3>Mercado de Sudor</h3>
                            <span className="points-display">
                                <Coins size={14} color="#F59E0B" />
                                {stats.vitalPoints.toLocaleString()}
                            </span>
                        </div>

                        <div className="rewards-grid relative">
                            {rewards.map(reward => (
                                <motion.div
                                    key={reward.id}
                                    className={`reward-card relative overflow-hidden ${stats.vitalPoints >= reward.cost ? 'affordable' : 'locked'} ${reward.isPhysical ? 'physical-item' : 'digital-item'}`}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    onClick={() => stats.vitalPoints >= reward.cost && setShowRewardModal(reward)}
                                >
                                    {/* ANTIGRAVITY 2.0: COOLDOWN / SURGE PRICING BADGES */}
                                    {reward.tier === 2 && (
                                        <div className="absolute top-2 right-2 bg-amber-500/90 text-black text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg animate-pulse flex items-center gap-1">
                                            🔥 Alta Demanda
                                        </div>
                                    )}
                                    {reward.tier === 3 && (
                                        <div className="absolute top-2 right-2 bg-rose-500/90 text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-lg animate-pulse flex items-center gap-1">
                                            ⏳ Solo quedan {reward.stockLeft}
                                        </div>
                                    )}
                                    {reward.category === 'digital' && (
                                        <div className="absolute top-2 right-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black uppercase px-2 py-1 rounded flex items-center gap-1">
                                            ✨ Digital
                                        </div>
                                    )}

                                    <div className="reward-image">{reward.image}</div>
                                    <div className="reward-info">
                                        <span className="reward-name">{reward.name}</span>
                                        <span className="reward-desc">{reward.description}</span>
                                    </div>
                                    <div className="reward-cost">
                                        <Coins size={12} color={reward.tier && reward.tier > 1 ? "#EF4444" : "#F59E0B"} />
                                        <span className={reward.tier && reward.tier > 1 ? "text-rose-400 font-bold" : ""}>
                                            {reward.cost.toLocaleString()}
                                        </span>
                                    </div>
                                    {reward.discount && (
                                        <div className="discount-badge">-{reward.discount}%</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <button className="see-all-btn">
                            <ShoppingBag size={14} />
                            Ver todo el catálogo
                        </button>
                    </div>
                </div>

                {/* Right Column - Leaderboard & Tokens */}
                <div className="hub-right">
                    <LeaderboardPanel />

                    {/* Freeze Tokens */}
                    <div className="tokens-card" style={{ background: cardBg }}>
                        <div className="tokens-header">
                            <Snowflake size={18} style={{ color: '#3B82F6' }} />
                            <h3>Tokens de Recuperación</h3>
                        </div>
                        <div className="tokens-display">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`token-slot ${i < stats.freezeTokens ? 'filled' : 'empty'}`}
                                >
                                    <Snowflake size={20} />
                                </div>
                            ))}
                        </div>
                        <p className="tokens-info">
                            Si no entrenas mañana, se usará un token automáticamente para proteger tu racha.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bet Confirmation Modal */}
            <AnimatePresence>
                {showBetModal && (
                    <motion.div
                        className="reward-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowBetModal(false)}
                    >
                        <motion.div
                            className="bet-modal"
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: cardBg }}
                        >
                            <div className="bet-modal-icon">🎲</div>
                            <h3>¿Listo para el Desafío?</h3>
                            <p>Estás apostando <strong>500 Vital Points</strong> a que puedes entrenar 7 días seguidos.</p>
                            <div className="bet-modal-stakes">
                                <div className="stake-box win">
                                    <span className="label">Si ganas</span>
                                    <span className="value">+1000 pts</span>
                                </div>
                                <div className="stake-box lose">
                                    <span className="label">Si pierdes</span>
                                    <span className="value">-500 pts</span>
                                </div>
                            </div>
                            <div className="bet-modal-actions">
                                <motion.button
                                    className="confirm-bet"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={placeBet}
                                    style={{ background: `linear-gradient(135deg, #EC4899, #8B5CF6)` }}
                                >
                                    🎰 ¡Acepto el Reto!
                                </motion.button>
                                <button
                                    className="cancel-bet"
                                    onClick={() => setShowBetModal(false)}
                                >
                                    Mejor no...
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reward Claim Modal */}
            <AnimatePresence>
                {showRewardModal && (
                    <motion.div
                        className="reward-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowRewardModal(null)}
                    >
                        <motion.div
                            className="reward-modal"
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: cardBg }}
                        >
                            <div className="modal-image">{showRewardModal.image}</div>
                            <h3>{showRewardModal.name}</h3>
                            <p>{showRewardModal.description}</p>
                            <div className="modal-cost">
                                <Coins size={16} color="#F59E0B" />
                                <span>{showRewardModal.cost.toLocaleString()} Vital Points</span>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="redeem-btn"
                                    onClick={() => redeemReward(showRewardModal)}
                                    style={{ background: accentColor }}
                                >
                                    🎉 Canjear Ahora
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowRewardModal(null)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


/**
 * LEADERBOARD PANEL - Coach Tribe Leagues
 * Motor 4: Las Ligas de Responsabilidad
 * 
 * Weekly competition within coach's client group
 * with tier badges and Top 3 celebrations
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Medal,
    Crown,
    ChevronUp,
    ChevronDown,
    Minus,
    Flame,
    Zap,
    Star
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface LeaderboardEntry {
    id: string;
    name: string;
    avatar: string;
    weeklyXP: number;
    streak: number;
    tier: 'bronze' | 'silver' | 'gold' | 'diamond';
    rankChange: number; // +1, -1, 0
    isCurrentUser?: boolean;
}

interface LeaderboardPanelProps {
    entries?: LeaderboardEntry[];
    coachName?: string;
    weekNumber?: number;
}

// Tier configuration
const tierConfig = {
    bronze: { color: '#CD7F32', label: 'Bronce', icon: Medal, minXP: 0 },
    silver: { color: '#C0C0C0', label: 'Plata', icon: Medal, minXP: 1000 },
    gold: { color: '#FFD700', label: 'Oro', icon: Trophy, minXP: 3000 },
    diamond: { color: '#B9F2FF', label: 'Diamante', icon: Crown, minXP: 5000 },
};

// Mock data
const mockLeaderboard: LeaderboardEntry[] = [
    { id: '1', name: 'María García', avatar: 'MG', weeklyXP: 2450, streak: 21, tier: 'gold', rankChange: 0, isCurrentUser: false },
    { id: '2', name: 'Carlos López', avatar: 'CL', weeklyXP: 2100, streak: 14, tier: 'gold', rankChange: 1, isCurrentUser: false },
    { id: '3', name: 'Ana Torres', avatar: 'AT', weeklyXP: 1890, streak: 7, tier: 'silver', rankChange: -1, isCurrentUser: false },
    { id: '4', name: 'Tú', avatar: 'NH', weeklyXP: 1650, streak: 12, tier: 'silver', rankChange: 2, isCurrentUser: true },
    { id: '5', name: 'Diego Morales', avatar: 'DM', weeklyXP: 1200, streak: 5, tier: 'silver', rankChange: -1, isCurrentUser: false },
    { id: '6', name: 'Laura Ruiz', avatar: 'LR', weeklyXP: 980, streak: 3, tier: 'bronze', rankChange: 0, isCurrentUser: false },
    { id: '7', name: 'Pedro Sánchez', avatar: 'PS', weeklyXP: 750, streak: 2, tier: 'bronze', rankChange: -2, isCurrentUser: false },
];

export function LeaderboardPanel({
    entries = mockLeaderboard,
    coachName = 'Coach Juan',
    weekNumber = 6
}: LeaderboardPanelProps) {
    const { mode } = useTheme();
    const [selectedTier, setSelectedTier] = useState<string | null>(null);

    const accentColor = mode === 'CLINICAL' ? '#88B04B' : '#6366f1';
    const cardBg = mode === 'CLINICAL' ? 'var(--surface)' : 'var(--surface)';

    const filteredEntries = selectedTier
        ? entries.filter(e => e.tier === selectedTier)
        : entries;

    const sortedEntries = [...filteredEntries].sort((a, b) => b.weeklyXP - a.weeklyXP);
    const topThree = sortedEntries.slice(0, 3);
    const restOfList = sortedEntries.slice(3);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={16} color="#FFD700" fill="#FFD700" />;
        if (rank === 2) return <Medal size={16} color="#C0C0C0" fill="#C0C0C0" />;
        if (rank === 3) return <Medal size={16} color="#CD7F32" fill="#CD7F32" />;
        return <span className="rank-number">{rank}</span>;
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return <ChevronUp size={14} color="#10B981" />;
        if (change < 0) return <ChevronDown size={14} color="#EF4444" />;
        return <Minus size={14} color="var(--text-muted)" />;
    };

    return (
        <div className="leaderboard-panel" style={{ background: cardBg }}>
            {/* Header */}
            <div className="leaderboard-header">
                <div className="header-left">
                    <Trophy size={20} style={{ color: accentColor }} />
                    <div>
                        <h3>Tribu de {coachName}</h3>
                        <span className="week-label">Semana {weekNumber}</span>
                    </div>
                </div>
                <div className="tier-filters">
                    {Object.entries(tierConfig).map(([key, config]) => (
                        <button
                            key={key}
                            className={`tier-btn ${selectedTier === key ? 'active' : ''}`}
                            onClick={() => setSelectedTier(selectedTier === key ? null : key)}
                            style={{
                                background: selectedTier === key ? `${config.color}20` : 'transparent',
                                borderColor: selectedTier === key ? config.color : 'var(--border)'
                            }}
                            title={config.label}
                        >
                            <config.icon size={14} color={config.color} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Podium - Top 3 */}
            <div className="podium">
                {topThree.map((entry, i) => {
                    const rank = i + 1;
                    const height = rank === 1 ? 100 : rank === 2 ? 80 : 60;
                    const order = rank === 1 ? 1 : rank === 2 ? 0 : 2;

                    return (
                        <motion.div
                            key={entry.id}
                            className={`podium-spot ${entry.isCurrentUser ? 'current-user' : ''}`}
                            style={{ order }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="podium-avatar" style={{
                                background: tierConfig[entry.tier].color,
                                boxShadow: rank === 1 ? '0 0 20px rgba(255, 215, 0, 0.5)' : undefined
                            }}>
                                {entry.avatar}
                                {entry.streak >= 7 && (
                                    <div className="podium-streak">
                                        <Flame size={10} color="#FF6B35" />
                                    </div>
                                )}
                            </div>
                            <div className="podium-rank">{getRankIcon(rank)}</div>
                            <span className="podium-name">{entry.name}</span>
                            <span className="podium-xp">{entry.weeklyXP.toLocaleString()} XP</span>
                            <motion.div
                                className="podium-bar"
                                style={{
                                    height,
                                    background: rank === 1
                                        ? 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)'
                                        : rank === 2
                                            ? 'linear-gradient(180deg, #C0C0C0 0%, #A8A8A8 100%)'
                                            : 'linear-gradient(180deg, #CD7F32 0%, #8B4513 100%)'
                                }}
                                initial={{ height: 0 }}
                                animate={{ height }}
                                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Rest of Leaderboard */}
            <div className="leaderboard-list">
                <AnimatePresence>
                    {restOfList.map((entry, i) => {
                        const rank = i + 4;
                        const TierIcon = tierConfig[entry.tier].icon;

                        return (
                            <motion.div
                                key={entry.id}
                                className={`leaderboard-row ${entry.isCurrentUser ? 'current-user' : ''}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="row-rank">{rank}</div>
                                <div className="row-change">{getChangeIcon(entry.rankChange)}</div>
                                <div className="row-avatar" style={{
                                    background: `${tierConfig[entry.tier].color}30`,
                                    color: tierConfig[entry.tier].color
                                }}>
                                    {entry.avatar}
                                </div>
                                <div className="row-info">
                                    <span className="row-name">{entry.name}</span>
                                    <div className="row-stats">
                                        <TierIcon size={12} color={tierConfig[entry.tier].color} />
                                        {entry.streak > 0 && (
                                            <span className="row-streak">
                                                <Flame size={10} color="#FF6B35" />
                                                {entry.streak}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="row-xp">
                                    <Zap size={12} style={{ color: accentColor }} />
                                    {entry.weeklyXP.toLocaleString()}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Promotion Zone */}
            <div className="promotion-zone">
                <div className="zone-indicator up">
                    <ChevronUp size={14} />
                    <span>Top 3 ascienden</span>
                </div>
                <div className="zone-indicator down">
                    <ChevronDown size={14} />
                    <span>Últimos 2 descienden</span>
                </div>
            </div>

            {/* Weekly Challenge */}
            <div className="weekly-challenge">
                <Star size={16} color="#F59E0B" />
                <div>
                    <span className="challenge-label">Reto Semanal</span>
                    <span className="challenge-text">Completa 5 entrenamientos para 500 XP bonus</span>
                </div>
                <div className="challenge-progress">
                    <div className="progress-bar" style={{
                        width: '60%',
                        background: `linear-gradient(90deg, ${accentColor}, #10B981)`
                    }} />
                </div>
                <span className="challenge-count">3/5</span>
            </div>
        </div>
    );
}

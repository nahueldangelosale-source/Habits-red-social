import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Swords } from 'lucide-react';

interface WagerParticipant {
    id: string;
    name: string;
    avatarUrl?: string;
    currentValue?: number;
    currentUser?: boolean;
}

interface Wager {
    id: string;
    status: string;
    challenger: WagerParticipant;
    opponent: WagerParticipant;
    stakeAmount: number;
    metric: string;
    challengeEnd: string;
}

interface ActiveChallengeCardProps {
    wager: Wager;
    userId: string;
    accentColor: string;
    metricConfig: any;
}

export const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({
    wager,
    userId,
    accentColor = '#6366f1',
    metricConfig
}) => {
    const isChallenger = wager.challenger.id === userId || wager.challenger.currentUser;
    const myData = isChallenger ? wager.challenger : wager.opponent;
    const opponentData = isChallenger ? wager.opponent : wager.challenger;

    const myValue = myData.currentValue || 0;
    const opponentValue = opponentData.currentValue || 0;

    // Calc progress
    const total = myValue + opponentValue;
    const myPercent = total > 0 ? (myValue / total) * 100 : 50;

    const config = metricConfig[wager.metric] || { label: wager.metric, icon: Target, unit: 'pts' };
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="relative bg-zinc-900 border-l-4 rounded-r-xl p-6 shadow-xl overflow-hidden group"
            style={{ borderLeftColor: accentColor }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800">
                        <Icon size={20} style={{ color: accentColor }} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg tracking-tight">VS {opponentData.name}</h3>
                        <p className="text-zinc-500 text-xs font-mono uppercase tracking-wider">{config.label} DUEL</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-white tracking-tighter">
                        {wager.stakeAmount} <span className="text-sm text-zinc-500">PTS</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-zinc-400 mt-1">
                        <Clock size={12} />
                        <span>24h Left</span>
                    </div>
                </div>
            </div>

            {/* VS BAR */}
            <div className="relative h-12 bg-zinc-800 rounded-lg overflow-hidden flex items-center mb-4 z-10">
                {/* My Bar */}
                <motion.div
                    className="h-full flex items-center justify-start pl-4 relative z-10"
                    style={{ width: `${myPercent}%`, backgroundColor: accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${myPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <span className="font-mono font-bold text-black text-lg">{myValue}</span>
                </motion.div>

                {/* Opponent Bar (Background is zinc-800, so we just show number on right) */}
                <div className="absolute right-4 z-10">
                    <span className="font-mono font-bold text-zinc-400 text-lg">{opponentValue.toLocaleString()}</span>
                </div>

                {/* Diagonal Slicing Line visual trick could go here */}
                <div className="absolute inset-y-0 w-1 bg-zinc-950 transform -skew-x-12" style={{ left: `${myPercent}%` }}></div>
            </div>

            {/* Avatar Face-off */}
            <div className="flex justify-between items-center text-xs font-medium text-zinc-500 font-mono z-10 relative">
                <span>YOU</span>
                <span>OPPONENT</span>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 opacity-5">
                <Swords size={150} color="white" />
            </div>
        </motion.div>
    );
};

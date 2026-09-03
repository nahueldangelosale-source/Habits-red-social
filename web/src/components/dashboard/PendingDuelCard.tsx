import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

// Temporary Types duplication
type ChallengeMetric = 'STEPS' | 'CALORIES' | 'DISTANCE' | 'WORKOUT_TIME';

interface WagerParticipant {
    id: string;
    name: string;
}

interface Wager {
    id: string;
    status: string;
    challenger: WagerParticipant;
    opponent: WagerParticipant;
    stakeAmount: number;
    metric: ChallengeMetric;
    challengeEnd: string;
}

interface PendingDuelCardProps {
    wager: Wager;
    onAccept: () => void;
    onDecline: () => void;
    accentColor: string;
    metricConfig: any;
}

export const PendingDuelCard: React.FC<PendingDuelCardProps> = ({
    wager,
    onAccept,
    onDecline,
    accentColor,
    metricConfig
}) => {
    const config = metricConfig[wager.metric];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 border-2 border-dashed border-zinc-700 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-colors"
        >
            <div className="flex items-center gap-5 relative z-10">
                {/* Metric Icon with Glow */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Icon size={32} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                </div>

                {/* Challenge Details */}
                <div className="flex-1">
                    <div className="text-xs font-bold text-amber-500 tracking-wider uppercase mb-1">
                        Nueva Solicitud de Duelo
                    </div>
                    <h3 className="text-lg font-black text-white leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                            {wager.challenger.name}
                        </span>
                        <span className="text-zinc-500 font-normal mx-2">te desafía en</span>
                        <span className="text-amber-400">{config.label}</span>
                    </h3>

                    <div className="mt-3 flex items-center gap-4 text-sm font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md">
                            <span>Apuesta:</span>
                            <strong className="text-white">{wager.stakeAmount}</strong>
                            <span className="text-amber-500">PTS</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-600" />
                        <div>Expires in 24h</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[100px]">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onAccept}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                        <Check size={14} className="stroke-[3px]" />
                        ACEPTAR
                    </motion.button>
                    <button
                        onClick={onDecline}
                        className="w-full py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        IGNORAR
                    </button>
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-orange-600" />
        </motion.div>
    );
};

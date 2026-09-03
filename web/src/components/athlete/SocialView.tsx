import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Flame, Trophy, Crown, ArrowUpRight } from 'lucide-react';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';

// Mock Data
const FEED_EVENTS = [
    { id: 1, user: 'Valeria M.', avatar: 'V', action: 'acaba de completar su sesión #50', group: 'Club 6AM', time: 'hace 5 min', likes: 12 },
    { id: 2, user: 'David S.', avatar: 'D', action: 'venció su récord personal en Peso Muerto', group: 'Powerlifting Base', time: 'hace 12 min', likes: 24 },
    { id: 3, user: 'Camila R.', avatar: 'C', action: 'completó una semana perfecta de consistencia', group: 'Reto Verano', time: 'hace 1 hora', likes: 8 },
];

const LeaderboardRow = ({ rank, name, points, isCurrentUser = false }: { rank: number, name: string, points: string, isCurrentUser?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-xl mb-2 ${isCurrentUser ? 'bg-lime-400/10 border border-lime-400/30' : 'bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none'}`}>
        <div className="flex items-center space-x-4">
            <span className={`font-black w-6 text-center ${rank === 1 ? 'text-yellow-500 dark:text-yellow-400' : rank === 2 ? 'text-slate-400 dark:text-zinc-300' : rank === 3 ? 'text-orange-500 dark:text-orange-400' : 'text-slate-300 dark:text-zinc-600'}`}>
                {rank}
            </span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isCurrentUser ? 'bg-lime-400 text-black' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-white'}`}>
                {name.charAt(0)}
            </div>
            <span className={`font-bold ${isCurrentUser ? 'text-lime-600 dark:text-lime-400' : 'text-slate-900 dark:text-white'}`}>{name}</span>
        </div>
        <span className="font-mono text-slate-500 dark:text-zinc-400 text-sm">{points} XP</span>
    </div>
);

export const SocialView: React.FC = () => {
    const { calmMode } = useCognitiveLoad();
    const [reactedIds, setReactedIds] = useState<number[]>([]);

    const handleReaction = (id: number) => {
        if (!reactedIds.includes(id)) {
            setReactedIds(prev => [...prev, id]);
        }
    };

    return (
        <div className="min-h-full p-6 pb-32 bg-transparent">
            
            <header className="mb-8">
                <h2 className={`text-3xl font-black ${calmMode ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>La Tribu</h2>
                <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Conectado a 3 Micro-Comunidades</p>
            </header>

            {/* Progreso Colectivo (Duelo/Reto) */}
            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-3xl p-5 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Users className="w-24 h-24 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 tracking-widest uppercase mb-1 block">Reto Activo</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">1000 Sentadillas del Club 6AM</h3>
                    
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white mb-2">
                        <span>Progreso Colectivo</span>
                        <span>64%</span>
                    </div>
                    <div className="w-full h-3 bg-white/50 dark:bg-black/50 rounded-full overflow-hidden border border-indigo-200 dark:border-white/10">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '64%' }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Muro (Feed Glassmorphism) */}
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4 flex items-center">
                    <Flame className="w-4 h-4 mr-2" />
                    Actividad Reciente
                </h3>
                <div className="space-y-4">
                    {FEED_EVENTS.map((event) => {
                        const hasReacted = reactedIds.includes(event.id);
                        return (
                            <div key={event.id} className={`p-4 rounded-2xl border transition-all shadow-sm dark:shadow-none ${calmMode ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/50 dark:border-indigo-900/30' : 'bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'}`}>
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex flex-shrink-0 items-center justify-center font-bold text-slate-700 dark:text-white border border-slate-300 dark:border-white/5">
                                        {event.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600 dark:text-zinc-300">
                                            <span className="font-bold text-slate-900 dark:text-white">{event.user}</span> {event.action}
                                        </p>
                                        <div className="flex items-center mt-1 space-x-2">
                                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10 px-2 py-0.5 rounded">{event.group}</span>
                                            <span className="text-xs text-slate-400 dark:text-zinc-500">{event.time}</span>
                                        </div>
                                        
                                        <div className="mt-3 flex space-x-2">
                                            <button 
                                                onClick={() => handleReaction(event.id)}
                                                className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                    hasReacted 
                                                    ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30' 
                                                    : 'bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <Flame className={`w-3 h-3 mr-1.5 ${hasReacted ? 'fill-orange-500 dark:fill-orange-400 text-orange-500 dark:text-orange-400' : ''}`} />
                                                {event.likes + (hasReacted ? 1 : 0)}
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleReaction(event.id)}
                                                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-all"
                                            >
                                                💪
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Leaderboard */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span className="flex items-center"><Trophy className="w-4 h-4 mr-2" /> Leaderboard Semanal</span>
                    <span className="text-xs flex items-center text-indigo-600 dark:text-indigo-400 cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300">Ver Todos <ArrowUpRight className="w-3 h-3 ml-1" /></span>
                </h3>
                
                <div className="bg-slate-100 dark:bg-black/20 rounded-2xl p-2 border border-slate-200 dark:border-white/5 shadow-inner dark:shadow-none">
                    <LeaderboardRow rank={1} name="Sarah J." points="12,450" />
                    <LeaderboardRow rank={2} name="Nahuel H." points="11,200" isCurrentUser={true} />
                    <LeaderboardRow rank={3} name="Marcos T." points="10,850" />
                    <div className="flex justify-center p-2">
                        <Crown className="w-4 h-4 text-slate-400 dark:text-zinc-600" />
                    </div>
                </div>
            </div>

        </div>
    );
};

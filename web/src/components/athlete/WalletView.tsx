import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gem, Zap, Clock, ShieldAlert, ChevronRight, Lock } from 'lucide-react';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';

interface TokenBalance {
    amount: number;
    decayDate: Date;
}

export const WalletView: React.FC = () => {
    const { calmMode } = useCognitiveLoad();
    
    // Mocks from TokenomicsEngine
    const [etBalance, setEtBalance] = useState<TokenBalance>({ amount: 140, decayDate: new Date(Date.now() + 48 * 60 * 60 * 1000) });
    const [cgBalance, setCgBalance] = useState<TokenBalance>({ amount: 15, decayDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    const formatDecay = (date: Date) => {
        const hours = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60));
        if (hours < 24) return `${hours}h restantes`;
        return `${Math.floor(hours / 24)}d restantes`;
    };

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-1000 ${calmMode ? 'bg-[#0f111a]' : 'bg-[#0a0a0a]'}`}>
            <header className="mb-8">
                <h2 className="text-3xl font-black text-white">Bóveda Virtual</h2>
                <p className="text-sm text-zinc-400 mt-1">Tus activos de esfuerzo y consistencia.</p>
            </header>

            {/* Consistency Gems (Alto Valor Físico) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/20 border border-emerald-500/20 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Gem className="w-32 h-32 text-emerald-400" />
                </div>
                
                <div className="relative z-10 flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center mb-1">
                            <Gem className="w-5 h-5 text-emerald-400 mr-2" />
                            <h3 className="text-emerald-300 font-bold uppercase tracking-widest text-xs">Gemas de Consistencia</h3>
                        </div>
                        <span className="text-5xl font-black text-white">{cgBalance.amount}</span>
                    </div>
                    
                    <div className="bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center">
                        <Clock className="w-3 h-3 text-emerald-400 mr-1.5" />
                        <span className="text-xs font-bold text-emerald-300">{formatDecay(cgBalance.decayDate)}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors flex justify-between items-center px-4">
                        <span>Pase de 1 Día al Gimnasio (Upsell O2O)</span>
                        <span className="bg-black/20 px-2 py-1 rounded text-xs">10 CG</span>
                    </button>
                    <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors flex justify-between items-center px-4">
                        <span>Desbloquear Masterclass Nutrición</span>
                        <span className="text-zinc-400 text-xs">5 CG</span>
                    </button>
                </div>
            </motion.div>

            {/* Effort Tokens (Metaverso) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center mb-1">
                            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                            <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Effort Tokens</h3>
                        </div>
                        <span className="text-4xl font-black text-white">{etBalance.amount}</span>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg flex items-center">
                        <ShieldAlert className="w-3 h-3 text-orange-400 mr-1.5" />
                        <span className="text-xs font-bold text-orange-400">Expira pronto</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full mb-3 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-zinc-500" />
                        </div>
                        <span className="text-xs text-zinc-400 font-bold mb-1">Skin: Dark Mode</span>
                        <span className="text-yellow-400 text-[10px] font-black">200 ET</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-zinc-800 rounded-full mb-3 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-zinc-500" />
                        </div>
                        <span className="text-xs text-zinc-400 font-bold mb-1">Oráculo IA +</span>
                        <span className="text-yellow-400 text-[10px] font-black">50 ET</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEntropyVAK } from '../../contexts/EntropyVAKContext';
import type { EntropyState, VAKProfile } from '../../contexts/EntropyVAKContext';
import { Eye, Volume2, Hand, BrainCircuit, Activity, Settings2 } from 'lucide-react';

export function AdaptSwitch() {
    const { entropy, vakProfile, setEntropy, setVakProfile, triggerSound, triggerVibration } = useEntropyVAK();
    const [isOpen, setIsOpen] = useState(false);

    const handleVakChange = (profile: VAKProfile) => {
        setVakProfile(profile);
        if (profile === 'kinesthetic') triggerVibration();
        if (profile === 'auditory') triggerSound();
    };

    const handleEntropyChange = (state: EntropyState) => {
        setEntropy(state);
        triggerVibration();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800 p-5 rounded-3xl shadow-2xl w-72 flex flex-col gap-6"
                    >
                        {/* VAK Profile Selector */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <BrainCircuit className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Perfil VAK</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleVakChange('visual')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-all ${vakProfile === 'visual' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <Eye className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">Visual</span>
                                </button>
                                <button
                                    onClick={() => handleVakChange('auditory')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-all ${vakProfile === 'auditory' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <Volume2 className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">Auditivo</span>
                                </button>
                                <button
                                    onClick={() => handleVakChange('kinesthetic')}
                                    className={`flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-all ${vakProfile === 'kinesthetic' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    <Hand className="w-5 h-5" />
                                    <span className="text-[10px] font-bold">Kinest.</span>
                                </button>
                            </div>
                        </div>

                        {/* Entropy Switcher */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Entropía UI</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleEntropyChange('low_free_energy')}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${entropy === 'low_free_energy' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                                >
                                    <span className="text-xs font-bold">Low Free Energy</span>
                                    {entropy === 'low_free_energy' && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                                </button>
                                <button
                                    onClick={() => handleEntropyChange('cognitive_flexibility')}
                                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${entropy === 'cognitive_flexibility' ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'}`}
                                >
                                    <span className="text-xs font-bold">High Complexity</span>
                                    {entropy === 'cognitive_flexibility' && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
                                </button>
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    triggerVibration();
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 ${isOpen ? 'bg-indigo-500 text-black' : 'bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-500'}`}
            >
                <Settings2 className="w-6 h-6" />
            </button>
        </div>
    );
}

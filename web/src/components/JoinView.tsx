import React from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../api/client';
import { Zap } from 'lucide-react';

export const JoinView = () => {
    // 1. Eslabón Perdido: Extraer el ref de la URL antes del vuelo a Google.
    const query = new URLSearchParams(window.location.search);
    const refId = query.get('ref');

    const handleGoogleLogin = () => {
        let authUrl = `${API_BASE_URL}/auth/google/login`;
        if (refId) {
            authUrl += `?ref=${refId}`;
        }
        // 2. Transición al backend de Aurea que dropeara la cookie 'ref_id'
        window.location.href = authUrl;
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Atmosphere Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(206,255,0,0.05)_0%,transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6366f1] to-transparent opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center">

                    <div className="mb-8">
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4 border border-indigo-500/20"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            <Zap className="w-8 h-8 text-indigo-400" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Aurea OS</h1>
                        <p className="text-white/40 text-sm uppercase tracking-widest font-mono">Únete al Ecosistema</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white text-black font-semibold rounded-lg py-3 px-4 flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale" />
                            Continuar con Google
                        </button>
                    </div>

                    {/* VITAL: Indicate to user their referral was captured natively */}
                    {refId && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 inline-flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
                        >
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-xs text-indigo-400 font-mono tracking-wide">
                                INVITACIÓN SEGURA DETECTADA
                            </span>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

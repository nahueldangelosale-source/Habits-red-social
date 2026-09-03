import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Users, Zap, Award, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export const ReferralDashboard = () => {
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState({ referrals: 0, earned_units: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    useEffect(() => {
        const fetchTenantContext = async () => {
            try {
                // Obtenemos el ID de tenant actual desde el endpoint whoami
                const response: any = await api.get('/auth/whoami');
                setTenantId(response.tenant_id);
                // Mock stats or placeholder for PLG metrics 
                // In production, this would query a dedicated /api/v1/tenants/referrals endpoint
                setStats({ referrals: 3, earned_units: 300000 });
            } catch (err) {
                console.error("Failed to load tenant context for referrals", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTenantContext();
    }, []);

    const referralLink = tenantId ? `https://app.aurea.app/join?ref=${tenantId}` : 'Generando enlace criptográfico...';

    const handleCopy = () => {
        if (!tenantId) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return <div className={`h-full flex items-center justify-center font-mono animate-pulse ${isClinical ? 'text-slate-500' : 'text-indigo-400'}`}>Cargando Motor Viral...</div>;
    }

    return (
        <div className={`h-full p-8 overflow-y-auto transition-colors duration-1000 ${isClinical ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-white'}`}>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* ─── Header ────────────────────────────────────────────── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Programa de Referidos</h1>
                        <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-white/50'}`}>Invita a otros profesionales y gana Compute Units para la IA.</p>
                    </div>
                    <div className={`p-3 rounded-2xl border hidden md:block ${isClinical ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                        <Award className={`w-8 h-8 ${isClinical ? 'text-emerald-500' : 'text-indigo-400'}`} />
                    </div>
                </div>

                {/* ─── Main Link Card ────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-8 rounded-3xl relative overflow-hidden border ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A0A0A] border-white/10'}`}
                >
                    <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 ${isClinical ? 'bg-emerald-500/5' : 'bg-indigo-500/5'}`} />

                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <LinkIcon className={`w-5 h-5 ${isClinical ? 'text-emerald-500' : 'text-indigo-400'}`} />
                        Tu Enlace B2B Exclusivo
                    </h2>

                    <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                        <div className={`flex-1 w-full border rounded-xl p-4 font-mono text-sm truncate selection:bg-indigo-500/30 selection:text-indigo-400 ${isClinical ? 'bg-slate-50 border-slate-200 text-emerald-600' : 'bg-zinc-950 border-white/20 text-indigo-400/80'}`}>
                            {referralLink}
                        </div>
                        <button
                            onClick={handleCopy}
                            disabled={!tenantId}
                            className={`w-full md:w-auto px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 disabled:opacity-50 ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-black hover:bg-zinc-200'}`}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span>Copiado</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    <span>Copiar Enlace</span>
                                </>
                            )}
                        </button>
                    </div>
                    <p className={`text-xs mt-4 ${isClinical ? 'text-slate-500' : 'text-white/40'}`}>
                        Ambos recibirán <strong className={isClinical ? 'text-slate-900' : 'text-white'}>100,000 Compute Units</strong> cuando tu colega complete su primer análisis con la Inteligencia Artificial.
                    </p>
                </motion.div>

                {/* ─── Stats Grid ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`p-6 rounded-3xl border flex flex-col justify-between h-40 ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0A0A0A] border-white/10'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${isClinical ? 'text-slate-500' : 'text-white/50'}`}>Colegas Activos</span>
                            <Users className={`w-5 h-5 ${isClinical ? 'text-slate-300' : 'text-white/30'}`} />
                        </div>
                        <div className="text-4xl font-black">{stats.referrals}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className={`p-6 rounded-3xl border flex flex-col justify-between h-40 ${isClinical ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-500/5 border-indigo-500/20'}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium uppercase tracking-widest font-mono ${isClinical ? 'text-emerald-700' : 'text-indigo-400/70'}`}>Unidades Ganadas</span>
                            <Zap className={`w-5 h-5 ${isClinical ? 'text-emerald-500' : 'text-indigo-400'}`} />
                        </div>
                        <div className={`text-4xl font-black ${isClinical ? 'text-emerald-600' : 'text-indigo-400'}`}>
                            {stats.earned_units.toLocaleString()}
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

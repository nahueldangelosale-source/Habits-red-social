import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Fingerprint, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../api/client';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useAuth } from '../../context/AuthContext';

export function MagicLinkRedeem() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const reqId = searchParams.get('req_id');
    const navigate = useNavigate();
    const { login } = useAuth();

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!token) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-xl font-sans text-white mb-2">Enlace Inválido</h1>
                <p className="text-zinc-500 text-center text-sm">El enlace mágico no está presente en la URL. Solicita uno nuevo a tu coach.</p>
            </div>
        );
    }

    const handleVerify = async () => {
        setStatus('loading');
        setErrorMessage('');

        try {
            const response: any = await api.post('/api/v1/auth-b2c/redeem', {
                magic_token: token,
                req_id: reqId || undefined
            });

            // Sincronizar estado global de autenticación
            login(response.access_token, {
                email: response.athlete_id,
                role: 'b2c_athlete'
            });
            
            // Limpiar Triage (Prevenir fugas de PII y estado huerfano)
            useOnboardingPTStore.getState().resetOnboarding();
            localStorage.removeItem('onboarding-pt-storage');
            
            setStatus('success');

            // Delay visual para mejor UX y luego salto al Active Canvas
            setTimeout(() => {
                navigate('/atleta/canvas', { replace: true });
            }, 1000);

        } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.data?.detail || "El enlace expiró o ya fue usado en otro dispositivo.");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">

            {/* Aesthetic Background Elements */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-volt/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="z-10 w-full max-w-sm flex flex-col items-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl">
                    {status === 'success' ? (
                        <CheckCircle2 className="text-neon-volt w-8 h-8" />
                    ) : (
                        <Fingerprint className="text-neon-volt w-8 h-8" />
                    )}
                </div>

                <h1 className="font-sans font-bold text-2xl text-white mb-2 tracking-wide text-center">
                    {status === 'success' ? 'Identidad Confirmada' : 'Bienvenido a tu Espacio'}
                </h1>
                <p className="text-zinc-400 text-center text-sm mb-10">
                    {status === 'success' ? 'Redirigiendo a tu rutina...' : 'Haz clic para iniciar sesión de forma segura sin contraseña.'}
                </p>

                {status !== 'success' && (
                    <button
                        onClick={handleVerify}
                        disabled={status === 'loading'}
                        className="w-full flex items-center justify-center space-x-2 bg-neon-volt text-zinc-950 font-bold py-4 px-6 rounded-xl shadow-[0_0_20px_rgba(206,255,0,0.3)] hover:shadow-[0_0_30px_rgba(206,255,0,0.5)] transition-all disabled:opacity-50"
                    >
                        {status === 'loading' ? (
                            <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Confirmar Acceso</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                )}

                {/* Error Feedback */}
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 w-full mt-6"
                    >
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-medium">{errorMessage}</span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

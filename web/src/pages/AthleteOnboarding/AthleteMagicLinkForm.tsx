import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Mail, ArrowRight, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, API_BASE_URL } from '../../api/client';

import toast from 'react-hot-toast';

export const AthleteMagicLinkForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'idle' | 'loading' | 'waiting' | 'syncing' | 'success'>('idle');
  const [reqId, setReqId] = useState<string | null>(null);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStep('loading');
    try {
      const res: any = await api.post('/api/v1/auth-b2c/magic-link', { email });
      setReqId(res.session_request_id);
      setStep('waiting');
    } catch (err: any) {
      toast.error(err.data?.detail || 'Error al enviar el enlace mágico');
      setStep('idle');
    }
  };

  useEffect(() => {
    if (step === 'waiting' && reqId) {
      const sseUrl = `${API_BASE_URL}/api/v1/clinical/sse/auth-wait/${reqId}`;
      const eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('auth_success', async (e) => {
        try {
          const data = JSON.parse(e.data);
          const transferToken = data.transfer_token;
          setStep('syncing');

          const syncRes: any = await api.post('/api/v1/auth-b2c/sync-device', {
            transfer_token: transferToken
          });

          localStorage.setItem('token', syncRes.access_token);
          
          
          localStorage.removeItem('onboarding-pt-storage');

          setStep('success');

          setTimeout(() => {
            navigate('/atleta/canvas', { replace: true });
          }, 1500);

        } catch (error) {
          console.error('Error in sync-device', error);
          toast.error('Error al sincronizar el dispositivo.');
          setStep('idle');
        } finally {
          eventSource.close();
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE Error', err);
      };

      return () => {
        eventSource.close();
      };
    }
  }, [step, reqId, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-neon-volt/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        <AnimatePresence mode="wait">
          {(step === 'idle' || step === 'loading') && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center w-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl">
                <ShieldCheck className="text-neon-volt w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Acceso Seguro</h2>
              <p className="text-zinc-400 text-center mb-8">Ingresa tu email para recibir un enlace mágico</p>

              <form onSubmit={handleRequestLink} className="w-full space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-neon-volt/50 focus:ring-1 focus:ring-neon-volt/50 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={step === 'loading'}
                  className="w-full bg-neon-volt text-black font-semibold rounded-xl py-3 flex items-center justify-center gap-2 hover:bg-lime-400 transition-colors disabled:opacity-50"
                >
                  {step === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Enviar Enlace</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800 relative">
                <div className="absolute inset-0 border-2 border-neon-volt rounded-full animate-ping opacity-20" />
                <Smartphone className="w-10 h-10 text-neon-volt animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Revisa tu correo</h3>
              <p className="text-zinc-400">
                Hemos enviado un enlace mágico a<br />
                <span className="text-zinc-300 font-medium">{email}</span>
              </p>
            </motion.div>
          )}

          {step === 'syncing' && (
            <motion.div
              key="syncing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center w-full"
            >
              <Loader2 className="w-12 h-12 text-neon-volt animate-spin mb-4" />
              <p className="text-zinc-400 font-medium">Sincronizando dispositivo...</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="w-20 h-20 bg-neon-volt/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-neon-volt" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Autenticación Exitosa!</h3>
              <p className="text-zinc-400">Preparando tu experiencia...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

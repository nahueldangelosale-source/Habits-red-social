import React, { useState, useEffect } from 'react';
import { CheckoutInvoice } from './CheckoutInvoice';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { api } from '../../api/client';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface CheckoutFunnelProps {
    amount: number;
    description: string;
    coachName: string;
    planName: string;
    onClose: () => void;
}

export const CheckoutFunnel = ({ amount, description, coachName, planName, onClose }: CheckoutFunnelProps) => {
    const { checkoutV2Enabled } = useFeatureFlags();
    const [status, setStatus] = useState<'initial' | 'redirecting' | 'verifying' | 'optimistic' | 'success'>('initial');
    const [txId, setTxId] = useState<string | null>(null);

    // Initial Telemetry
    useEffect(() => {
        console.log('[Telemetry] checkout_link_clicked', { amount, planName });
    }, [amount, planName]);

    // Handle return from MercadoPago
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('status');
        const transactionId = urlParams.get('external_reference');

        if (paymentStatus === 'approved' && transactionId) {
            setStatus('verifying');
            setTxId(transactionId);

            // Connect to SSE
            const eventSource = new EventSource(`/api/v1/checkout/stream/${transactionId}`);
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'payment_confirmed' && data.payload.transaction_id === transactionId) {
                    console.log('[Telemetry] checkout_success', { transactionId });
                    setStatus('success');
                    eventSource.close();
                }
            };

            // Timeout for Optimistic UI (10s)
            const timeoutId = setTimeout(() => {
                if (eventSource.readyState !== EventSource.CLOSED) {
                    setStatus('optimistic');
                    eventSource.close();
                }
            }, 10000);

            return () => {
                eventSource.close();
                clearTimeout(timeoutId);
            };
        }
    }, []);

    const handleConfirm = async () => {
        if (!checkoutV2Enabled) {
            alert('Legacy checkout flow triggered.');
            return;
        }

        try {
            setStatus('redirecting');
            const response = await api.post('/api/v1/checkout/create', {
                amount,
                description
            });
            
            console.log('[Telemetry] checkout_form_loaded', { txId: response.data.transaction_id });
            
            // Redirect to MercadoPago
            window.location.href = response.data.redirect_url;
            
        } catch (error) {
            console.error('Error creating checkout:', error);
            setStatus('initial');
            alert('Error al iniciar el pago.');
        }
    };

    if (status === 'initial' || status === 'redirecting') {
        return (
            <CheckoutInvoice 
                amount={amount}
                coachName={coachName}
                planName={planName}
                onConfirm={handleConfirm}
                onClose={onClose}
            />
        );
    }

    if (status === 'verifying') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-xl font-mono text-white mb-2">Verificación Criptográfica</h2>
                    <p className="text-zinc-400 text-sm">Asegurando tu transacción de forma local...</p>
                </div>
            </div>
        );
    }

    if (status === 'success' || status === 'optimistic') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/90 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#0F0F11] border border-indigo-500/30 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl shadow-indigo-500/10"
                >
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle size={40} className="text-indigo-400" />
                    </motion.div>
                    
                    <h2 className="text-2xl font-bold text-white mb-3">
                        {status === 'success' ? 'Pago Confirmado' : 'Pago en Proceso'}
                    </h2>
                    
                    <p className="text-zinc-400 text-sm mb-8">
                        {status === 'success' 
                            ? 'Tu membresía ha sido activada exitosamente. Ya puedes acceder a todas las funciones PRO.'
                            : 'Tu pago está siendo procesado en segundo plano por la red bancaria. Ya puedes acceder a tus rutinas mientras tanto.'}
                    </p>
                    
                    <button 
                        onClick={() => {
                            window.location.href = '/dashboard';
                        }}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium text-sm"
                    >
                        Ir a mi Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return null;
};


import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CreditCard, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DunningBanner: React.FC = () => {
    const { user } = useAuth();

    // Solo mostrar si el estado es past_due (Dunning inteligente de 7 días)
    const isPastDue = user?.subscription_status === 'past_due' || user?.subscription_status === 'rejected';

    const getManagementUrl = () => {
        if (user?.payment_provider === 'MERCADO_PAGO') {
            return 'https://www.mercadopago.com.ar/subscriptions';
        }
        return 'https://billing.stripe.com/p/login/test_your_link';
    };

    if (!isPastDue) return null;

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-red-600/90 backdrop-blur-md border-b border-red-500/50 relative z-[100]"
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-white">
                    <div className="bg-red-500 rounded-full p-1 shadow-lg animate-pulse">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-bold tracking-tight">
                            Acción requerida: Tu suscripción Pro Suite tiene un problema de pago.
                        </p>
                        <p className="text-[11px] opacity-80">
                            Detectamos un error al procesar tu cargo en {user?.payment_provider === 'MERCADO_PAGO' ? 'Mercado Pago' : 'Stripe'}. Actualiza tu método para evitar la interrupción del servicio.
                        </p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,1)', color: '#dc2626' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(getManagementUrl(), '_blank')}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white text-white transition-all text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/30"
                >
                    <CreditCard size={14} />
                    Actualizar Pago
                    <ChevronRight size={14} />
                </motion.button>
            </div>
        </motion.div>
    );
};

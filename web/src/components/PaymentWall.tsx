import React from 'react';
import { Lock, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export const PaymentWall: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-zinc-950 border border-rose-500/30 w-full max-w-md rounded-3xl p-10 text-center shadow-[0_0_100px_rgba(244,63,94,0.15)]"
            >
                <div className="w-24 h-24 bg-gradient-to-br from-rose-500/20 to-red-600/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                    <Lock size={48} className="text-rose-500" />
                </div>
                <h2 className="text-4xl font-black  text-white tracking-tighter mb-4">ACCESO<br /><span className="text-rose-500">DENEGADO</span></h2>
                <div className="h-px w-16 bg-rose-500/50 mx-auto mb-6"></div>
                <p className="text-zinc-400 mb-10 leading-relaxed text-sm">
                    Tu suscripción requiere atención urgente. Hemos intentado procesar el pago sin éxito, y tu periodo de gracia de 7 días ha finalizado. Actualiza para restaurar el acceso.
                </p>
                <button
                    onClick={() => {
                        alert("🔒 Iniciando pasarela de pago segura (Stripe Connect)...");
                    }}
                    className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black  tracking-widest uppercase rounded-2xl py-5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-500/25"
                >
                    <CreditCard size={20} />
                    Pagar y Desbloquear
                </button>
            </motion.div>
        </div>
    );
};

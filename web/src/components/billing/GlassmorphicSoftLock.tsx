import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, X, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface GlassmorphicSoftLockProps {
  isOpen: boolean;
  onClose: () => void;
  triggerLocation?: 'events_tab' | 'nutrition_tab' | 'routine_canvas' | 'general' | 'past_due';
  details: {
    message?: string;
    tier_required?: string;
  };
  onUpgradeSuccess: () => void;
}

const CONTEXT_DATA = {
  events_tab: {
    headline: "Tu atleta necesita verte en vivo",
    benefit: "Los coaches Elite retienen 3x más atletas con Check-ins semanales",
    cta: "Activar Videollamadas"
  },
  nutrition_tab: {
    headline: "La sincronización de macros está esperándote",
    benefit: "Ajusta calorías en tiempo real basándote en la carga de entrenamiento",
    cta: "Desbloquear Nutrición Avanzada"
  },
  routine_canvas: {
    headline: "Esta plantilla fue diseñada para atletas como el tuyo",
    benefit: "Accede a +200 bloques biomecánicos con progresión automática",
    cta: "Desbloquear Bóveda Completa"
  },
  general: {
    headline: "Límite de Asientos Alcanzado",
    benefit: "El crecimiento no tiene límites, tu plan tampoco debería.",
    cta: "Desbloquear Plan Elite"
  },
  past_due: {
    headline: "Sincronización Pausada por Pago Pendiente",
    benefit: "El estado de facturación del atleta está en mora. Mantén el control de tu flujo de caja.",
    cta: "Enviar Recordatorio de Pago"
  }
};

export const GlassmorphicSoftLock: React.FC<GlassmorphicSoftLockProps> = ({ 
  isOpen, 
  onClose, 
  triggerLocation = 'general',
  details,
  onUpgradeSuccess 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Efecto para reportar view_upgrade_modal (US-001)
  React.useEffect(() => {
    if (isOpen) {
      console.log(`[GA4 Event] view_upgrade_modal: triggerLocation=${triggerLocation}, modal_variant=${triggerLocation}`);
    }
  }, [isOpen, triggerLocation]);

  const handleClose = async () => {
    // PLG: Report Abandoned Intent
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/telemetry/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          event_type: 'PAYWALL_ABANDONED',
          context: {
            source: 'plan_builder',
            tier_required: details?.tier_required,
            trigger_location: triggerLocation
          }
        })
      });
    } catch (e) {
      console.warn("Error reporting abandonment", e);
    }
    onClose();
  };

  const handleUpgrade = async () => {
    if (triggerLocation === 'past_due') {
      setIsProcessing(true);
      setTimeout(() => {
        toast.success('Recordatorio de pago enviado por WhatsApp exitosamente.', { icon: '💬' });
        setIsProcessing(false);
        onClose();
      }, 1500);
      return;
    }

    console.log(`[GA4 Event] click_upgrade_cta: triggerLocation=${triggerLocation}`);
    setIsProcessing(true);
    try {
      // Usamos fetch directamente para evitar interceptores globales extraños
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/checkout/simulate-b2b-upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          target_tier: details?.tier_required || 'TIER_2',
          amount_cents: 500000 // 50,000 ARS mockup
        })
      });

      if (!res.ok) {
        throw new Error('Error al simular pago');
      }

      console.log(`[GA4 Event] purchase_elite: revenue=50000`);
      toast.success('¡Suscripción actualizada exitosamente! Ledger inmutable sincronizado.', { icon: '💎' });
      onUpgradeSuccess();
      onClose();
    } catch (error) {
      toast.error('La simulación de pago falló.');
    } finally {
      setIsProcessing(false);
    }
  };

  const content = CONTEXT_DATA[triggerLocation] || CONTEXT_DATA.general;
  const isAmber = triggerLocation === 'past_due';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/60"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-zinc-900/80 border border-zinc-700 shadow-2xl rounded-3xl max-w-lg w-full p-8 relative overflow-hidden"
          >
            {/* Ambient Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-48 blur-[80px] pointer-events-none ${isAmber ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`} />

            <button
              onClick={handleClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center relative z-10">
              <div className={`w-20 h-20 rounded-full border flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] ${isAmber ? 'bg-amber-500/20 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
                <ShieldAlert size={36} className={isAmber ? "text-amber-400" : "text-emerald-400"} />
              </div>

              <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                {content.headline}
              </h2>
              
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                {details?.message || content.benefit}
              </p>

              <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6 w-full mb-8 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="text-amber-400" />
                  <span className="text-white font-bold text-xl">Plan {details?.tier_required === 'TIER_2' ? 'Pro' : 'Elite'}</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-zinc-300">
                    <span className={isAmber ? "text-amber-500" : "text-emerald-500"}>✓</span> Asignación hasta 500 atletas
                  </li>
                  <li className="flex items-center gap-2 text-zinc-300">
                    <span className={isAmber ? "text-amber-500" : "text-emerald-500"}>✓</span> Motor Nutricional Avanzado
                  </li>
                  <li className="flex items-center gap-2 text-zinc-300">
                    <span className={isAmber ? "text-amber-500" : "text-emerald-500"}>✓</span> Priority Support Watchtower
                  </li>
                </ul>
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className={`w-full text-zinc-950 font-black text-lg py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isAmber ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]'}`}
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <CreditCard size={24} />
                    {content.cta}
                  </>
                )}
              </button>
              
              <p className="text-zinc-600 text-xs mt-4">
                Powered by MercadoPago & Ledger Append-Only Inmutable.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

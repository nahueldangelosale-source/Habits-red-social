import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, ChevronRight, CheckCircle2 } from 'lucide-react';

interface GlassmorphicSoftLockProps {
  onClose: () => void;
  archetype: string;
}

export const GlassmorphicSoftLock: React.FC<GlassmorphicSoftLockProps> = ({ onClose, archetype }) => {
  const [usdSaved, setUsdSaved] = useState(0);
  const [hoursSaved, setHoursSaved] = useState(0);

  useEffect(() => {
    // sendBeacon para el Revenue Bridge
    const payload = JSON.stringify({
      event: 'pricing_modal_opened',
      archetype,
      estimatedUsdSaved: 120,
      estimatedHoursSaved: 2.5,
      timestamp: new Date().toISOString()
    });

    if (navigator.onLine && navigator.sendBeacon) {
      navigator.sendBeacon('/api/v1/telemetry/pricing-modal-opened', payload);
    } else {
      // Fallback a localStorage/IndexedDB
      const queue = JSON.parse(localStorage.getItem('telemetry_queue') || '[]');
      queue.push(payload);
      localStorage.setItem('telemetry_queue', JSON.stringify(queue));
      
      // Register Background Sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(reg => {
          (reg as any).sync.register('sync-telemetry').catch(() => console.log('Sync registration failed'));
        });
      }
    }

    // Animación fluida de contadores
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5 segundos
    
    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setUsdSaved(Math.round(easeProgress * 120));
      setHoursSaved(Number((easeProgress * 2.5).toFixed(1)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [archetype]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-lg w-full toast-glass rounded-3xl overflow-hidden overflow-y-auto max-h-[90vh]">
        
        {/* Decoración Glassmorphic de fondo */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/80 border border-white rounded-full flex items-center justify-center shadow-lg shadow-black/5">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
          </div>
          
          <h2 className="text-center text-2xl font-black font-montserrat text-slate-900 tracking-tight mb-2">
            ¡Plan Asignado con Éxito!
          </h2>
          <p className="text-center text-slate-700 font-lato text-sm mb-8 leading-relaxed">
            El plan de entrenamiento y nutrición ha sido publicado exitosamente en el perfil del atleta.
          </p>

          <div className="bg-white/40 border border-white/60 rounded-xl p-6 mb-8 relative overflow-hidden group shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-center relative z-10">
              <h3 className="text-slate-900 font-bold text-lg mb-2">¿Deseas cobrar este plan?</h3>
              <p className="text-slate-600 text-sm mb-4">
                Genera un enlace de pago único o suscribe a tu cliente a un cobro recurrente.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md text-sm">
                  Generar Link de Pago
                </button>
                <button className="flex-1 bg-white/70 hover:bg-white text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm border border-slate-300 shadow-sm">
                  Cobro Recurrente
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onClose}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xl"
            >
              Volver al Tablero <ChevronRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock de la API de Cal.com (En producción importamos el script oficial)
// import Cal, { getCalApi } from "@calcom/embed-react";

interface SchedulingEmbedProps {
  coachName: string;
  calLink: string;
  patientName: string;
  patientEmail: string;
  onSchedulingComplete: () => void;
}

export const SchedulingEmbed: React.FC<SchedulingEmbedProps> = ({
  coachName,
  calLink,
  patientName,
  patientEmail,
  onSchedulingComplete
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulación de precarga del iFrame para evitar layout shift
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-400/20 text-lime-400 mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white font-montserrat mb-3">Pago Confirmado</h2>
        <p className="text-zinc-400 font-lato max-w-md mx-auto">
          Has dado el paso más importante. Ahora, sella tu compromiso agendando tu llamada de Kick-off con <strong>{coachName}</strong>.
        </p>
      </div>

      <div className="w-full bg-zinc-900/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm min-h-[600px] relative flex items-center justify-center">
        
        {!isLoaded && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute flex flex-col items-center text-zinc-500"
          >
            <Calendar className="w-10 h-10 mb-3 animate-pulse text-indigo-400" />
            <span className="font-lato text-sm tracking-widest uppercase">Cargando Disponibilidad...</span>
          </motion.div>
        )}

        {isLoaded && (
          <div className="w-full h-[600px] flex items-center justify-center p-4">
             {/* 
                Protección de Cumplimiento Continuo (HIPAA/GDPR):
                El payload pre-cargado (name, email) está estrictamente sanitizado. 
                NUNCA enviamos IDs médicos ni telemetría del HealthHistoryForm al iframe de Cal.com.
             */}
            <div className="w-full h-full bg-black/50 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                <span className="text-indigo-400 font-bold font-montserrat mb-2">[CAL.COM IFRAME EMBED]</span>
                <span className="text-zinc-500 font-lato text-sm text-center">
                  URL Enrutada: cal.com/{calLink}?name={encodeURIComponent(patientName)}&email={encodeURIComponent(patientEmail)}
                </span>
                
                {/* Botón de fallback para pruebas/desarrollo */}
                <button 
                  onClick={onSchedulingComplete}
                  className="mt-8 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors font-lato"
                >
                  Simular Agendamiento Exitoso
                </button>
            </div>
          </div>
        )}

      </div>
      
      <div className="mt-6 text-center text-zinc-600 text-xs font-lato flex items-center justify-center gap-2">
        <Calendar className="w-3 h-3" />
        <span>Garantía de Sincronización: El horario se ajustará automáticamente a tu zona horaria local.</span>
      </div>
    </div>
  );
};

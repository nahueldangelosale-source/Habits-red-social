import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { AVAILABLE_TRAITS } from '../../schemas/traitsSchema';
import { resolveAthleteConstraints } from '../../utils/clinicalRuleEngine';

interface BehavioralOnboardingProps {
  onComplete: () => void;
}

export const BehavioralOnboarding: React.FC<BehavioralOnboardingProps> = ({ onComplete }) => {
  const { injectTrait, activeTraits } = useOnboardingPTStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");

  const handlePillClick = (traitKey: keyof typeof AVAILABLE_TRAITS, ttlDays?: number) => {
    const traitDef = AVAILABLE_TRAITS[traitKey];
    injectTrait({
      traitId: traitKey,
      level: traitDef.level,
      weight: traitDef.weight,
      source: 'ONBOARDING',
      ...(ttlDays ? { expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString() } : {})
    });
  };

  const handleFinish = () => {
    setIsProcessing(true);
    
    // Labor Illusion Coreografía
    setProcessingText("Analizando tolerancia a la carga axial...");
    setTimeout(() => {
      setProcessingText("Ajustando algoritmos de volumen y recuperación...");
    }, 1500);
    setTimeout(() => {
      setProcessingText("Arquitectura de entrenamiento ensamblada.");
    }, 3000);

    setTimeout(() => {
      // Offline-first approach: resolve rules to prepare the payload, but proceed immediately.
      // We assume sync happens in the background.
      const constraints = resolveAthleteConstraints(activeTraits);
      console.log("[Clinical Engine] Active Constraints:", constraints);
      
      onComplete(); // Advance to Panoramic Builder
    }, 3500);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.p
            key={processingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-slate-800 font-mono text-sm tracking-widest uppercase font-bold"
          >
            {processingText}
          </motion.p>
        </AnimatePresence>
        <div className="w-48 h-px bg-slate-200 mt-6 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-indigo-600"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
      <h2 className="text-2xl font-black text-slate-900 font-montserrat mb-2">Contexto de Entrenamiento</h2>
      <p className="text-sm text-slate-500 font-lato mb-8">
        Entender tu rutina diaria y cómo te sientes nos ayuda a ajustar el entrenamiento a tu energía actual.
      </p>

      <div className="space-y-6">
        {/* Pregunta 1: Burnout / HPA Axis */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Disponibilidad y Esfuerzo</h3>
          <button 
            onClick={(e) => {
              e.currentTarget.classList.toggle('bg-slate-900');
              e.currentTarget.classList.toggle('text-white');
              e.currentTarget.classList.toggle('bg-white');
              e.currentTarget.classList.toggle('text-slate-600');
              handlePillClick('SYS_HPA_BURNOUT', 21); // TTL 21 days
            }}
            className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-montserrat text-sm font-bold transition-all hover:border-indigo-400 active:scale-95"
          >
            "Días con alto estrés, necesito un entrenamiento que no me agote más de la cuenta."
          </button>
        </div>

        {/* Pregunta 2: Espina Dorsal */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Historial de Lesiones</h3>
          <button 
            onClick={(e) => {
              e.currentTarget.classList.toggle('bg-slate-900');
              e.currentTarget.classList.toggle('text-white');
              e.currentTarget.classList.toggle('bg-white');
              e.currentTarget.classList.toggle('text-slate-600');
              handlePillClick('CLINICAL_LUMBAR_FLEX');
            }}
            className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-montserrat text-sm font-bold transition-all hover:border-indigo-400 active:scale-95"
          >
            "Tengo o tuve molestias en la espalda baja al cargar peso pesado."
          </button>
        </div>

        {/* Pregunta 3: Preferencia Estética / Rendimiento */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Energía y Ambición</h3>
          <button 
            onClick={(e) => {
              e.currentTarget.classList.toggle('bg-slate-900');
              e.currentTarget.classList.toggle('text-white');
              e.currentTarget.classList.toggle('bg-white');
              e.currentTarget.classList.toggle('text-slate-600');
              handlePillClick('PREF_HYPERTROPHY');
            }}
            className="w-full text-left p-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-montserrat text-sm font-bold transition-all hover:border-indigo-400 active:scale-95"
          >
            "Tengo energía de sobra, me recupero rápido y quiero que me expriman al máximo."
          </button>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button 
          onClick={handleFinish}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold font-montserrat text-sm uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
        >
          Compilar Matriz
        </button>
      </div>
    </div>
  );
};

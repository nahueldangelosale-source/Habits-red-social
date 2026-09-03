import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, CheckCircle2, Zap, LayoutTemplate, Apple, ArrowRight } from 'lucide-react';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';

const TOUR_STEPS = [
  {
    target: 'athlete-header',
    phase: 'FASE 1: DIAGNÓSTICO',
    title: 'Tu brújula: El Atleta',
    content: <>Aquí verás los datos clave de tu cliente. Todo el plan que vas a crear gira en torno a su peso, nivel y estado actual. 🧭</>,
    position: 'bottom' as const,
  },
  {
    target: 'athlete-badges',
    phase: 'FASE 1: DIAGNÓSTICO',
    title: '¿Por qué te pedimos esto?',
    content: <>Nuestra IA usa estos datos para <strong>recomendarte la rutina perfecta</strong> y avisarte si le estás exigiendo demasiado a tu atleta. 🤖🛡️</>,
    position: 'bottom' as const,
  },
  {
    target: 'athlete-form-btn',
    phase: 'FASE 1: DIAGNÓSTICO',
    title: 'El historial completo',
    content: <><strong>Hacé clic acá</strong> en cualquier momento para repasar sus lesiones, hábitos e historial. Es tu respaldo médico para nunca prescribir a ciegas. 📋🔍</>,
    position: 'bottom' as const,
  },
  {
    target: 'tab-bar',
    phase: 'FASE 2: ARQUITECTURA',
    title: 'Tu mesa de trabajo',
    content: <><strong>Movete por estas pestañas</strong> para construir el plan paso a paso.<br/><br/>💡 Tip: Arrancá en 📚 Biblioteca, ajustá en 🏋️‍♂️ Rutina y cerrá en 🍎 Nutrición.</>,
    position: 'bottom' as const,
  },
  {
    target: 'sequence-assistant',
    phase: 'FASE 2: ARQUITECTURA',
    title: '¿No sabés cómo arrancar?',
    content: <>Nuestro Asistente te sugiere qué bloques armar según la experiencia del atleta. <strong>Hacé clic en uno</strong> para agregarlo. 🧱✨</>,
    position: 'top' as const,
  },
  {
    target: 'exercise-search',
    phase: 'FASE 3: EJECUCIÓN',
    title: 'Arrastrar y Soltar',
    content: <><strong>Buscá un ejercicio y arrastralo</strong> hacia el día de la rutina. Si estás apurado, usá los básicos recomendados. 🖐️🎯</>,
    position: 'top' as const,
  },
  {
    target: 'assign-btn',
    phase: 'FASE 3: EJECUCIÓN',
    title: '¡A la cancha!',
    content: <>Cuando tu rutina esté lista, <strong>hacé clic aquí</strong> para guardarla y enviarla directo al celular de tu atleta. 🚀📱</>,
    position: 'bottom' as const,
  }
];

export const PlanBuilderGuidedTour: React.FC = () => {
  const { hasSeenTutorial, setHasSeenTutorial } = usePlanBuilderStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // If already seen, don't render anything
  if (hasSeenTutorial) return null;

  useEffect(() => {
    // Find the target element and its bounding rect
    const updateRect = () => {
      const step = TOUR_STEPS[currentStep];
      const el = document.querySelector(`[data-tour-step="${step.target}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        // Scroll the element into view with some padding
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
        // If element is not found, maybe it's on a different tab. We just center the tooltip.
      }
    };

    updateRect();
    // Update on resize or scroll
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    
    // Sometimes elements take a moment to render (like if they are inside Framer Motion)
    const timeoutId = setTimeout(updateRect, 500);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearTimeout(timeoutId);
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setHasSeenTutorial(true);
    }
  };

  const handleSkip = () => {
    setHasSeenTutorial(true);
  };

  const step = TOUR_STEPS[currentStep];

  // Calculate tooltip position based on target rect
  const getTooltipStyle = () => {
    if (!targetRect) {
      // Center if no target
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const PADDING = 16;
    let top = 0;
    let left = 0;

    if (step.position === 'bottom') {
      top = targetRect.bottom + PADDING;
      left = targetRect.left + (targetRect.width / 2) - 160; // Center horizontally (width 320 / 2)
    } else if (step.position === 'top') {
      top = targetRect.top - 200 - PADDING; // Approx height
      left = targetRect.left + (targetRect.width / 2) - 160;
    }

    // Keep within viewport bounds
    left = Math.max(16, Math.min(left, window.innerWidth - 336)); // 320px width + 16px padding
    top = Math.max(16, Math.min(top, window.innerHeight - 200));

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] pointer-events-none">
        {/* Dark overlay with spotlight cutout */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-all duration-500">
          {targetRect && (
            <div 
              className="absolute bg-transparent transition-all duration-500 ease-out shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] rounded-xl"
              style={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(15,23,42,0.6), inset 0 0 0 1px rgba(255,255,255,0.2)'
              }}
            />
          )}
        </div>

        {/* Tooltip Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, type: 'spring' }}
          className="absolute w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden pointer-events-auto"
          style={getTooltipStyle()}
        >
          {/* Progress bar */}
          <div className="flex w-full h-1 bg-slate-100">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`flex-1 ${idx <= currentStep ? 'bg-indigo-600' : 'bg-transparent'}`}
                style={{ opacity: idx === currentStep ? 1 : 0.4 }}
              />
            ))}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500">
                {step.phase}
              </span>
              <button 
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Saltar tour"
              >
                <X size={18} />
              </button>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 font-montserrat mb-3 leading-tight tracking-tight">
              {step.title}
            </h3>
            
            <p className="text-sm font-medium text-slate-600 font-lato leading-relaxed mb-6 [&>strong]:text-indigo-900 [&>strong]:font-bold">
              {step.content}
            </p>

            <div className="flex items-center justify-between mt-2">
              <button
                onClick={handleSkip}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Saltar tutorial
              </button>
              <button
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>¡Entendido! <CheckCircle2 size={16} /></>
                ) : (
                  <>Siguiente <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

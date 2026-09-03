import React, { useState } from 'react';
import { z } from 'zod';
import { useViewTransition } from '../../../shared/hooks/useViewTransition';
import { CheckCircle2 } from 'lucide-react';

// Strict Protocol: No free text, array of Enums only
const OnboardingSchema = z.object({
  injuries: z.array(z.enum(['KNEE_PAIN', 'LOWER_BACK', 'SHOULDER_ROTATOR', 'NONE'])),
  goal: z.enum(['HYPERTROPHY', 'ENDURANCE', 'REHABILITATION']),
  availabilityDays: z.number().min(1).max(7)
});

type OnboardingData = z.infer<typeof OnboardingSchema>;

export const ConversationalOnboarding: React.FC = () => {
  // Progressive Disclosure State
  const [step, setStep] = useState<number>(0);
  const [selection, setSelection] = useState<Partial<OnboardingData>>({ injuries: [] });
  const { transitionViewIfSupported } = useViewTransition();

  const toggleInjury = (pill: "KNEE_PAIN" | "LOWER_BACK" | "SHOULDER_ROTATOR" | "NONE") => {
    transitionViewIfSupported(() => {
        setSelection(prev => {
          const current = prev.injuries || [];
          if (pill === 'NONE') return { ...prev, injuries: ['NONE'] };
          const next = current.includes(pill) ? current.filter(i => i !== pill) : [...current.filter(i => i !== 'NONE'), pill];
          return { ...prev, injuries: next };
        });
    });
  };

  const handleNext = () => {
    transitionViewIfSupported(() => {
        setStep(s => s + 1);
    });
  };

  // @archunit-ignore: UI Freeze - No modificar estilos
  return (
    <div className="card-glass p-6 max-w-lg mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-white">Anamnesis Estructural</h2>
      
      {step === 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <p className="text-zinc-400">Selecciona áreas con molestia articular (PillButtons):</p>
          <div className="flex flex-wrap gap-2">
            {(['KNEE_PAIN', 'LOWER_BACK', 'SHOULDER_ROTATOR', 'NONE'] as const).map(pill => (
              <button
                key={pill}
                onClick={() => toggleInjury(pill)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  selection.injuries?.includes(pill) 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : 'bg-zinc-800/50 text-zinc-300 border-zinc-700'
                }`}
              >
                {pill.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button 
            onClick={handleNext}
            disabled={!selection.injuries?.length}
            className="w-full mt-6 bg-white text-black py-3 rounded-xl font-bold"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4" style={{ viewTransitionName: 'onboarding-content' }}>
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <CheckCircle2 size={20} className="animate-pulse-subtle" />
            <span className="text-sm font-bold uppercase tracking-widest">Biomecánica Registrada</span>
          </div>
          <p className="text-zinc-400">¿Objetivo principal del ciclo?</p>
          <select 
            className="w-full p-3 rounded-lg bg-zinc-800 border-zinc-700 text-white transition-all ease-spring hover:scale-[1.02]"
            value={selection.goal || ''}
            onChange={(e) => {
                transitionViewIfSupported(() => {
                    setSelection({...selection, goal: e.target.value as any});
                });
            }}
          >
            <option value="" disabled>Selecciona una opción</option>
            <option value="HYPERTROPHY">Hipertrofia Miofibrilar</option>
            <option value="ENDURANCE">Resistencia Anaeróbica</option>
            <option value="REHABILITATION">Rehabilitación Clínica</option>
          </select>
          <button className="w-full bg-neon text-black py-3 rounded-xl font-bold mt-4 animate-pulse-neon ease-spring hover:scale-[1.05] transition-transform">
            Generar Protocolo
          </button>
        </div>
      )}
    </div>
  );
};

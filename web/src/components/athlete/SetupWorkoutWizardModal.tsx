import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Dumbbell, ShieldCheck, Sparkles, ChevronRight, ChevronLeft, 
  Check, Flame, Zap, Award, Activity, HeartPulse, Building2, Home, TreePine
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { generateSmartRoutine, type GenerateRoutineOptions } from '../../utils/routineGeneratorEngine';

interface SetupWorkoutWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SetupWorkoutWizardModal: React.FC<SetupWorkoutWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const { setDays, identity } = usePlanBuilderStore();

  // State
  const [goal, setGoal] = useState<'HIPERTROFIA' | 'FAT_LOSS' | 'STRENGTH' | 'CALISTHENICS' | 'GLUTES'>('HIPERTROFIA');
  const [skillLevel, setSkillLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [location, setLocation] = useState<'gym' | 'home' | 'calisthenics'>('gym');
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);
  const [daysCount, setDaysCount] = useState<3 | 4 | 5 | 6>(4);

  if (!isOpen) return null;

  const toggleInjury = (injury: string) => {
    if (injury === 'NONE') {
      setSelectedInjuries([]);
      return;
    }
    if (selectedInjuries.includes(injury)) {
      setSelectedInjuries(selectedInjuries.filter((i) => i !== injury));
    } else {
      setSelectedInjuries([...selectedInjuries.filter((i) => i !== 'NONE'), injury]);
    }
  };

  const handleGenerate = () => {
    try {
      const isFemale = identity?.gender === 'F' || (identity?.gender as string)?.toLowerCase() === 'female';
      const options: GenerateRoutineOptions = {
        goal: goal === 'CALISTHENICS' ? 'CALISTHENICS' : goal === 'GLUTES' ? 'GLUTES' : goal,
        daysCount,
        injuries: selectedInjuries,
        skillLevel,
        isFemaleAthlete: isFemale
      };

      const newDays = generateSmartRoutine(options);
      setDays(newDays);
      localStorage.setItem('workout_draft_configured', 'true');

      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      toast.success('¡Tu rutina personalizada por ciclos ha sido creada y adaptada a tu cuerpo!', {
        icon: '🚀',
        duration: 3500
      });

      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Error al generar la rutina');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white dark:bg-[#0a0d16] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-lato text-slate-900 dark:text-white"
      >
        {/* Header con Progreso */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Dumbbell size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black font-montserrat tracking-tight uppercase">
                Personaliza Tu Rutina por Ciclos
              </h3>
              <p className="text-[11px] text-slate-400">Paso {step} de 4 • Menos de 1 minuto</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Pills */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-4 h-1.5 rounded-full transition-all ${
                    s === step ? 'bg-indigo-600 w-6' : s < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body Wizard */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <AnimatePresence mode="wait">
            
            {/* PASO 1: META & ARQUETIPO */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    ¿Cuál es tu enfoque principal? 🎯
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Elegí lo que más te motiva en este momento. Podés cambiarlo cuando quieras.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {[
                    { id: 'HIPERTROFIA', icon: '🏋️', title: 'Ganar Músculo & Fuerza', desc: 'Series de hipertrofia óptima con sobrecarga progresiva.' },
                    { id: 'FAT_LOSS', icon: '🔥', title: 'Quemar Grasa & Definición', desc: 'Densidad de entrenamiento con descansos activos y tono muscular.' },
                    { id: 'STRENGTH', icon: '⚡', title: 'Rendimiento Atlético & Fuerza Máxima', desc: 'Levantamientos compuestos, potencia y estabilidad.' },
                    { id: 'CALISTHENICS', icon: '🤸', title: 'Calistenia & Peso Corporal', desc: 'Dominadas, fondos y control corporal total sin pesas pesadas.' },
                    { id: 'GLUTES', icon: '🍑', title: 'Especialización Glúteos & Piernas', desc: 'Enfoque en cadena posterior, empujes de cadera y sentadillas.' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setGoal(item.id as any)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-[0.99] ${
                        goal === item.id
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                            {item.title}
                          </h5>
                          {goal === item.id && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PASO 2: EXPERIENCIA & LUGAR */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    ¿Tu nivel y dónde vas a entrenar? 🏢
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Esto calibra la cantidad exacta de series por semana para que progreses sin sobreentrenarte.
                  </p>
                </div>

                {/* Nivel de Experiencia */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Nivel de Experiencia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Principiante', label: 'Principiante', sub: '0 a 1 año' },
                      { id: 'Intermedio', label: 'Intermedio', sub: '1 a 3 años' },
                      { id: 'Avanzado', label: 'Avanzado', sub: '3+ años' }
                    ].map((n) => (
                      <button
                        key={n.id}
                        onClick={() => setSkillLevel(n.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          skillLevel === n.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="block text-xs font-bold font-montserrat">{n.label}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{n.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lugar / Equipamiento */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Equipamiento Disponible
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'gym', icon: <Building2 size={16} />, title: 'Gimnasio Completo', desc: 'Barras, mancuernas, poleas y máquinas guiadas.' },
                      { id: 'home', icon: <Home size={16} />, title: 'En Casa con Mancuernas', desc: 'Mancuernas ajustables, banco o esterilla.' },
                      { id: 'calisthenics', icon: <TreePine size={16} />, title: 'Parque / Barra de Dominadas', desc: 'Peso corporal, anillas y barras.' }
                    ].map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => setLocation(loc.id as any)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          location === loc.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-white ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${location === loc.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'}`}>
                          {loc.icon}
                        </div>
                        <div className="flex-1">
                          <h6 className="text-xs font-bold font-montserrat text-slate-900 dark:text-white">{loc.title}</h6>
                          <p className="text-[10px] text-slate-400">{loc.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASO 3: ESCUDO DE LESIONES & DOLORES */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-montserrat uppercase">
                    <ShieldCheck size={15} />
                    <span>Escudo de Seguridad & Cortafuegos</span>
                  </div>
                  <h4 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    ¿Tenés alguna molestia o dolor articular? 🛡️
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tranqui: si marcás alguna zona, nuestro algoritmo cambiará automáticamente los ejercicios de riesgo por variantes 100% seguras y sin dolor.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 'NONE', label: '✅ Sin Dolores', sub: '100% sano y listo' },
                    { id: 'LUMBAR', label: '🦴 Espalda Baja / Lumbar', sub: 'Cero compresión discal' },
                    { id: 'SHOULDER', label: '🦾 Hombro / Manguito', sub: 'Variantes en plano escapular' },
                    { id: 'KNEE', label: '🦵 Rodilla / Rótula', sub: 'Variantes tibiales verticales' },
                    { id: 'WRIST', label: '🖐️ Muñecas / Codo', sub: 'Agarre neutro ergonómico' },
                    { id: 'ANKLE', label: '🦶 Tobillo / Gemelos', sub: 'Elevación de talones' }
                  ].map((inj) => {
                    const isSelected = inj.id === 'NONE' 
                      ? selectedInjuries.length === 0 
                      : selectedInjuries.includes(inj.id);

                    return (
                      <button
                        key={inj.id}
                        onClick={() => toggleInjury(inj.id)}
                        className={`p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-white ring-1 ring-indigo-500 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="block text-xs font-bold font-montserrat">{inj.label}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{inj.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* PASO 4: DÍAS & FRECUENCIA */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    ¿Cuántos días por semana vas a entrenar? 📅
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Elegí un ritmo que puedas sostener en el tiempo con disfrute y constancia.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {[
                    { days: 3, title: '3 Días por Semana (Full Body A-B-A)', desc: 'Ideal si tenés poco tiempo. Estimula todo el cuerpo 3 veces por semana.' },
                    { days: 4, title: '4 Días por Semana (Torso / Pierna) ⭐ Recomendado', desc: 'El balance perfecto entre recuperación, volumen y ganancia muscular.' },
                    { days: 5, title: '5 Días por Semana (Empuje / Tirón / Pierna + Híbrido)', desc: 'Para atletas dedicados que buscan alta frecuencia y enfoque por grupo muscular.' },
                    { days: 6, title: '6 Días por Semana (PPL x 2 Élite)', desc: 'Para atletas avanzados. Doble frecuencia semanal Push/Pull/Legs con protección articular de codo.' }
                  ].map((d) => (
                    <button
                      key={d.days}
                      onClick={() => setDaysCount(d.days as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        daysCount === d.days
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-white ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                          {d.title}
                        </h5>
                        {daysCount === d.days && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {d.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
            >
              <ChevronLeft size={14} />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((step + 1) as any)}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-montserrat font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <span>Siguiente</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-montserrat font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Sparkles size={14} />
              <span>Generar Mi Rutina</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

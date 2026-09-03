import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Apple, Sparkles, ChevronRight, ChevronLeft, 
  Check, Flame, Scale, Dumbbell, UtensilsCrossed, HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useNutritionStore } from '../../stores/useNutritionStore';

interface SetupNutritionWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SetupNutritionWizardModal: React.FC<SetupNutritionWizardModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const { setMetabolicAnchor, setMacros } = useNutritionStore();

  // Form State
  const [goal, setGoal] = useState<'DEFICIT' | 'MAINTENANCE' | 'SURPLUS'>('DEFICIT');
  const [weightKg, setWeightKg] = useState<number>(75);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [age, setAge] = useState<number>(28);
  const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [mealsCount, setMealsCount] = useState<3 | 4 | 5>(4);

  if (!isOpen) return null;

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'NONE') {
      setAllergies([]);
      return;
    }
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter((a) => a !== allergy));
    } else {
      setAllergies([...allergies.filter((a) => a !== 'NONE'), allergy]);
    }
  };

  // Approximate TMB (Mifflin-St Jeor)
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  const activityMultiplier = activity === 'sedentary' ? 1.2 : activity === 'moderate' ? 1.45 : 1.7;
  const maintenanceCals = Math.round(bmr * activityMultiplier);
  
  const targetCals = goal === 'DEFICIT' 
    ? Math.max(1300, Math.round(maintenanceCals - 400))
    : goal === 'SURPLUS'
      ? Math.round(maintenanceCals + 350)
      : maintenanceCals;

  // Macros target
  const proteinGrams = Math.round(weightKg * 2.0); // 2g/kg
  const fatsGrams = Math.round(weightKg * 0.9);   // 0.9g/kg
  const remainingCals = targetCals - (proteinGrams * 4 + fatsGrams * 9);
  const carbsGrams = Math.max(50, Math.round(remainingCals / 4));

  const handleGenerate = () => {
    try {
      setMetabolicAnchor(goal);
      setMacros({
        protein: proteinGrams,
        carbs: carbsGrams,
        fats: fatsGrams
      });
      localStorage.setItem('nutrition_draft_configured', 'true');

      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      toast.success('¡Tu plan de comidas inteligente está listo y equilibrado al 100%!', {
        icon: '🥗',
        duration: 3500
      });

      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Error al configurar la nutrición');
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
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Apple size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black font-montserrat tracking-tight uppercase">
                Personaliza Tu Plan Nutricional
              </h3>
              <p className="text-[11px] text-slate-400">Paso {step} de 4 • Pautas y Macros</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-4 h-1.5 rounded-full transition-all ${
                    s === step ? 'bg-emerald-600 w-6' : s < step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-zinc-800'
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
            
            {/* PASO 1: META NUTRICIONAL */}
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
                    ¿Cuál es tu meta con la comida? 🍽️
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Ajustaremos las calorías y la proporción de proteínas según tu objetivo.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {[
                    { id: 'DEFICIT', icon: '🔥', title: 'Quemar Grasa (Déficit Suave)', desc: 'Pérdida de grasa progresiva protegiendo tu masa muscular y energía diaria.' },
                    { id: 'MAINTENANCE', icon: '⚖️', title: 'Mantener Peso & Rendir al Máximo', desc: 'Comer exactamente lo que gastas para optimizar fuerza y recuperación.' },
                    { id: 'SURPLUS', icon: '💪', title: 'Ganar Músculo Limpio (Superávit)', desc: 'Aumento de masa magra con suficiente energía para tus entrenamientos.' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setGoal(item.id as any)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        goal === item.id
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                            {item.title}
                          </h5>
                          {goal === item.id && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
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

            {/* PASO 2: DATOS FÍSICOS */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    Tus datos para el cálculo exacto 📊
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Usamos la fórmula clínica Mifflin-St Jeor para que no pases hambre ni te excedas.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Peso (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Altura (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Edad (años)</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white text-center"
                    />
                  </div>
                </div>

                {/* Nivel de actividad */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Actividad Diaria</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sedentary', label: '🚶 Sedentario', sub: 'Oficina / Poco mov.' },
                      { id: 'moderate', label: '🏃 Moderado', sub: 'Entreno 3-4 días' },
                      { id: 'active', label: '⚡ Muy Activo', sub: 'Entreno 5+ días' }
                    ].map((act) => (
                      <button
                        key={act.id}
                        onClick={() => setActivity(act.id as any)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          activity === act.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">{act.label}</span>
                        <span className="block text-[9px] text-slate-400 mt-0.5">{act.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Macro Badge */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                      Meta Diaria Estimada
                    </span>
                    <h5 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                      {targetCals.toLocaleString()} <span className="text-xs font-normal">kcal/día</span>
                    </h5>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-600 dark:text-zinc-300">
                    <div>P: <span className="font-bold text-blue-600 dark:text-blue-400">{proteinGrams}g</span></div>
                    <div>C: <span className="font-bold text-amber-600 dark:text-amber-400">{carbsGrams}g</span> | G: <span className="font-bold text-rose-600 dark:text-rose-400">{fatsGrams}g</span></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PASO 3: ALERGIAS Y PREFERENCIAS */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                    ¿Alguna preferencia o restricción? 🌾
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Filtraremos automáticamente las recetas de tu menú para que solo veas lo que te gusta.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { id: 'NONE', label: '🥩 Como de Todo', sub: 'Sin restricciones' },
                    { id: 'GLUTEN_FREE', label: '🌾 Sin Gluten', sub: 'Celíaco o sensible' },
                    { id: 'LACTOSE_FREE', label: '🥛 Sin Lactosa', sub: 'Leches y quesos vegetales' },
                    { id: 'VEGETARIAN', label: '🌿 Vegetariano', sub: 'Huevos y lácteos sí' }
                  ].map((all) => {
                    const isSelected = all.id === 'NONE' 
                      ? allergies.length === 0 
                      : allergies.includes(all.id);

                    return (
                      <button
                        key={all.id}
                        onClick={() => toggleAllergy(all.id)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-white ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="block text-xs font-bold font-montserrat">{all.label}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{all.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* PASO 4: REPARTO DE COMIDAS */}
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
                    ¿Cómo prefieres organizar tu día? ⏰
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Distribuiremos tus calorías de forma equilibrada en tus momentos del día.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {[
                    { count: 3, title: '3 Comidas al Día', desc: 'Desayuno, Almuerzo y Cena. Platos más contundentes y simples de cocinar.' },
                    { count: 4, title: '4 Comidas al Día ⭐ Recomendado', desc: 'Desayuno, Almuerzo, Merienda y Cena. Mantiene tu energía y saciedad estable.' },
                    { count: 5, title: '5 Comidas al Día', desc: 'Incluye colaciones pre/post entreno para máxima síntesis proteica.' }
                  ].map((m) => (
                    <button
                      key={m.count}
                      onClick={() => setMealsCount(m.count as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        mealsCount === m.count
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-white ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                          {m.title}
                        </h5>
                        {mealsCount === m.count && <Check size={14} className="text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {m.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
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
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
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
              <span>Generar Mi Menú Nutricional</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

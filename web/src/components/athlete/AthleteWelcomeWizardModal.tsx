import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Target, Dumbbell, Flame, Zap, Heart, 
  Check, ArrowRight, ArrowLeft, Trophy, CheckCircle2,
  Droplets, Moon, Footprints, Salad, Rocket, ShieldCheck,
  Award, Users, Compass, PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useGamificationStore } from '../../stores/useGamificationStore';

interface AthleteWelcomeWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteName?: string;
  hasCoach?: boolean;
  coachName?: string;
}

export const AthleteWelcomeWizardModal: React.FC<AthleteWelcomeWizardModalProps> = ({
  isOpen,
  onClose,
  athleteName = 'Atleta',
  hasCoach = false,
  coachName = 'Tu Entrenador'
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('HABITOS');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(['Agua', 'Sueño', 'Pasos']);
  const [isUnlockingReward, setIsUnlockingReward] = useState<boolean>(false);
  const { awardXP } = useGamificationStore();

  if (!isOpen) return null;

  const goalOptions = [
    { 
      id: 'HABITOS', 
      icon: '🌱', 
      title: 'Crear Hábitos Saludables', 
      desc: 'Agua, descanso, pasos diarios y constancia'
    },
    { 
      id: 'FUERZA', 
      icon: '💪', 
      title: 'Ganar Fuerza y Músculo', 
      desc: 'Entrenamiento y sobrecarga progresiva por ciclos'
    },
    { 
      id: 'ENERGIA', 
      icon: '⚡', 
      title: 'Sentirme con Más Energía', 
      desc: 'Movimiento diario, vitalidad y salud integral'
    },
    { 
      id: 'GRASA', 
      icon: '🔥', 
      title: 'Bajar Grasa y Tonificar', 
      desc: 'Déficit saludable y aceleración metabólica'
    },
  ];

  const habitOptions = [
    { id: 'Agua', icon: '💧', label: 'Tomar 2L de agua por día' },
    { id: 'Sueño', icon: '🌙', label: 'Dormir al menos 7-8 horas' },
    { id: 'Pasos', icon: '👟', label: 'Caminar 8.000 pasos diarios' },
    { id: 'Comida', icon: '🥗', label: 'Comer porciones balanceadas' },
  ];

  const toggleHabit = (h: string) => {
    if (selectedHabits.includes(h)) {
      if (selectedHabits.length > 1) {
        setSelectedHabits(selectedHabits.filter(item => item !== h));
      }
    } else {
      setSelectedHabits([...selectedHabits, h]);
    }
  };

  const handleStartRewardFlow = () => {
    // Activar pantalla de celebración de impacto
    setIsUnlockingReward(true);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 }
    });

    localStorage.setItem('athlete-onboarding-completed', 'true');
    localStorage.setItem('athlete-primary-goal', selectedGoal);
    localStorage.setItem('athlete-selected-habits', JSON.stringify(selectedHabits));

    try {
      awardXP('readiness', 50);
      window.dispatchEvent(new CustomEvent('earn-xp', { detail: { amount: 50, source: 'Bienvenida' } }));
    } catch (e) {
      // safe fallback
    }
  };

  const handleFinishEverything = () => {
    toast.success('🎉 ¡Bienvenido/a a Habits.! +50 XP acreditados.', {
      style: { 
        background: '#ffffff', 
        color: '#059669', 
        border: '1px solid #10b981',
        fontWeight: 'bold'
      }
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl font-sans overflow-hidden">
        {/* Luces Ambientales Estáticas Fijas (Sin parpadeo) */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-500/15 dark:bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Modal Liquid Glass Card Adaptativo a Tema Claro y Oscuro */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="w-full max-w-md bg-white/95 dark:bg-zinc-950/90 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[92vh] relative"
        >
          {/* Specular Rim Light */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CASO ESPECIAL: PANTALLA DE CELEBRACIÓN Y DESBLOQUEO DE +50 XP   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {isUnlockingReward ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center flex flex-col items-center justify-center space-y-6 my-auto"
            >
              {/* Animación del Trofeo e Imagotipo */}
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-[3px] shadow-2xl shadow-amber-500/25 flex items-center justify-center"
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-4xl shadow-inner">
                    🏆
                  </div>
                </motion.div>

                {/* Badge Flotante de XP */}
                <motion.div 
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black rounded-full shadow-lg border-2 border-white dark:border-zinc-900 flex items-center gap-1"
                >
                  <Sparkles size={12} /> +50 XP
                </motion.div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  ¡Recompensa Desbloqueada!
                </span>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  ¡Bienvenido/a a Habits.!
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-xs mx-auto leading-relaxed">
                  Te acreditamos tus primeros <strong className="text-amber-500 dark:text-amber-400 font-bold">+50 XP</strong> para arrancar tu aventura saludable con ventaja.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinishEverything}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-[0_10px_30px_rgba(16,185,129,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>¡Empezar Ahora!</span>
                <Rocket size={16} />
              </button>
            </motion.div>
          ) : (
            <>
              {/* Header con Barra de Pasos */}
              <div className="p-5 pb-3 border-b border-slate-100 dark:border-white/[0.07] bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Sparkles size={13} /> Paso {step} de 3 • Tu Espacio de Bienestar
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-400">
                    {step === 1 ? 'Bienvenida' : step === 2 ? 'Tu Enfoque' : 'Tus Hábitos'}
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="grid grid-cols-3 gap-2 h-1.5 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-500 ${
                        step >= i 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-sm' 
                          : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Contenido Dinámico por Paso */}
              <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* PASO 1: SALUDO CÁLIDO + BRANDING HABITS NUEVO SIN RECUADRO      */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {step === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className="text-center space-y-4"
                  >
                    {/* Logo Habits NUEVO TRANSPARENTE SIN RECUADRO */}
                    <div className="flex flex-col items-center justify-center pt-1">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center pointer-events-none mb-1">
                        <img 
                          src="/logo-habits-transparent.png" 
                          alt="Habits - Tu Red Social Saludable" 
                          className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(99,102,241,0.15)]"
                        />
                      </div>
                      
                      {/* Nombre de Marca con Punto Verde Esmeralda */}
                      <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-montserrat flex items-baseline justify-center">
                        Habits
                        <span className="text-emerald-500 text-4xl translate-y-0.5 ml-0.5">
                          .
                        </span>
                      </h2>

                      {/* Slogan Oficial */}
                      <p className="text-[11px] font-bold font-montserrat tracking-[0.18em] uppercase text-slate-500 dark:text-zinc-400 mt-0.5">
                        Tu Red Social Saludable
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        ¡Hola, {athleteName}!
                      </h3>
                      {hasCoach ? (
                        <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 max-w-xs mx-auto leading-relaxed">
                          <strong className="text-slate-900 dark:text-white font-bold">{coachName}</strong> preparó este espacio para acompañar tus entrenamientos, nutrición y evolución diaria.
                        </p>
                      ) : (
                        <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 max-w-xs mx-auto leading-relaxed">
                          Tu espacio personal para construir constancia, compartir tus avances con amigos y superarte día a día.
                        </p>
                      )}
                    </div>

                    {/* 3 Pilares Visuales con Palabras Simples, Claras y Sencillas */}
                    <div className="space-y-2.5 text-left pt-1">
                      {/* 1. Hábitos y Plan */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] flex items-center gap-3.5 shadow-2xs">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Zap size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Tu plan y tus hábitos diarios</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Tu entrenamiento, tus comidas y tus objetivos del día en un solo lugar, fácil y rápido.</p>
                        </div>
                      </div>

                      {/* 2. Social & Comunidad */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] flex items-center gap-3.5 shadow-2xs">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Comunidad & Social</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Compartí logros con amigos, sumate o creá grupos y conectá con profesionales certificados.</p>
                        </div>
                      </div>

                      {/* 3. Evolución */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] flex items-center gap-3.5 shadow-2xs">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Award size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Evolución y Recompensas</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Sumá puntos con cada avance, mantené tus rachas activas y desbloqueá nuevos logros.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* PASO 2: ELECCIÓN DE META PRINCIPAL                              */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {step === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                        🎯
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {hasCoach ? 'Tus 2 Pilares de Progreso' : '¿Cuál es tu meta principal?'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                        {hasCoach
                          ? 'La constancia diaria es la clave para ver resultados reales.'
                          : 'Elegí el enfoque que más te motive para personalizar tu experiencia:'}
                      </p>
                    </div>

                    {hasCoach ? (
                      <div className="space-y-2.5 pt-1">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] flex items-start gap-3.5">
                          <span className="text-2xl shrink-0 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">🏋️‍♂️</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">1. Tu Entrenamiento del Día</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                              En la pestaña de <strong>Entrenamiento</strong> vas a ver los ejercicios prescritos por tu profesor, con series y pesos sugeridos.
                            </p>
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] flex items-start gap-3.5">
                          <span className="text-2xl shrink-0 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">🌱</span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">2. Tus Hábitos Diarios</p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                              En la pestaña de <strong>Hábitos</strong> podés marcar con 1 toque si tomaste agua, descansaste bien o cumpliste tus pasos.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {goalOptions.map((goal) => {
                          const isSelected = selectedGoal === goal.id;
                          return (
                            <button
                              key={goal.id}
                              type="button"
                              onClick={() => setSelectedGoal(goal.id)}
                              className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-200 ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-400'
                                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.07] text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                              }`}
                            >
                              <span className="text-2xl shrink-0">{goal.icon}</span>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{goal.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{goal.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* PASO 3: SELECCIÓN DE HÁBITOS DE INICIO                          */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                {step === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                        ✨
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {hasCoach ? 'Subí de Nivel en Comunidad' : 'Tus Hábitos de Inicio'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                        {hasCoach
                          ? 'Completar tus hábitos te ayuda a mantener tu racha activa y sumar logros.'
                          : 'Elegí los hábitos con los que querés arrancar hoy:'}
                      </p>
                    </div>

                    {hasCoach ? (
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] p-5 rounded-2xl space-y-4 text-center">
                        <div className="flex justify-center gap-2.5">
                          <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-2xs">
                            ⚔️ Nivel 1 • Novato
                          </div>
                          <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-2xs">
                            🔥 Racha de Días
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-w-xs mx-auto">
                          Mantener tu racha activa te ayuda a construir disciplina y desbloquear nuevos retos con tus amigos.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        {habitOptions.map((h) => {
                          const isSelected = selectedHabits.includes(h.id);
                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => toggleHabit(h.id)}
                              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                                isSelected
                                  ? 'bg-indigo-50/80 dark:bg-indigo-600/20 border-indigo-500 text-slate-900 dark:text-white shadow-sm'
                                  : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.07] text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{h.icon}</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-white">{h.label}</span>
                              </div>
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                                isSelected 
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs' 
                                  : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                              }`}>
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Footer Glass Navigation */}
              <div className="p-5 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => (prev - 1) as any)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Atrás</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-400 font-medium py-2 px-3 transition-colors"
                  >
                    Omitir
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => (prev + 1) as any)}
                    className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
                  >
                    <span>Siguiente</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartRewardFlow}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                  >
                    <Rocket size={14} />
                    <span>¡Entrar a mi Espacio!</span>
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowRight, ShieldAlert, Activity, CheckCircle2,
  Flame, Dumbbell, Zap, Target, Home, Sparkles, HeartPulse, BrainCircuit,
  ActivitySquare, Stethoscope, AlertCircle, ChevronDown, Utensils
} from 'lucide-react';
import { PedagogicalSlider } from './PedagogicalSlider';
import { InjuryMatrix } from './InjuryMatrix';
import { emitOnboardingStepViewed, emitOnboardingStepCompleted } from '../../utils/telemetry';

const LABOR_STEPS = [
  { text: 'Analizando biomecánica y restricciones...', duration: 800 },
  { text: 'Aplicando filtros de seguridad articular (McGill)...', duration: 900 },
  { text: 'Calculando volumen óptimo de recuperación (ACWR)...', duration: 700 },
  { text: 'Generando blueprint del microciclo en el Cockpit 360...', duration: 600 },
];

const GOAL_OPTIONS = [
  { id: 'REHAB_LONGEVITY', label: 'Salud y Prevención', desc: 'Entrenar sin dolor y proteger articulaciones', colorClass: 'from-blue-500 to-cyan-400', bgLight: 'bg-blue-50', borderLight: 'border-blue-200', textDark: 'text-blue-900', icon: ShieldAlert },
  { id: 'BODY_RECOMP', label: 'Pérdida de Grasa', desc: 'Perder peso y ganar resistencia', colorClass: 'from-emerald-500 to-teal-400', bgLight: 'bg-emerald-50', borderLight: 'border-emerald-200', textDark: 'text-emerald-900', icon: ActivitySquare },
  { id: 'HIGH_PERFORMANCE', label: 'Fuerza y Músculo', desc: 'Levantar más peso y ganar tamaño muscular', colorClass: 'from-orange-500 to-rose-500', bgLight: 'bg-orange-50', borderLight: 'border-orange-200', textDark: 'text-orange-900', icon: Zap },
  { id: 'SPORT_AGILITY', label: 'Potencia y Agilidad', desc: 'Mejorar rendimiento para un deporte específico', colorClass: 'from-violet-500 to-purple-500', bgLight: 'bg-violet-50', borderLight: 'border-violet-200', textDark: 'text-violet-900', icon: Flame },
  { id: 'VITALITY_MAINTENANCE', label: 'Vitalidad y Energía', desc: 'Sentirse ágil y liberar estrés con poco tiempo', colorClass: 'from-amber-500 to-yellow-400', bgLight: 'bg-amber-50', borderLight: 'border-amber-200', textDark: 'text-amber-900', icon: HeartPulse },
];

const EQUIPMENT_OPTIONS = [
  { id: 'COMMERCIAL_GYM', label: 'Gimnasio Comercial', icon: Dumbbell },
  { id: 'HOME_GYM', label: 'Home Gym (Barras)', icon: Home },
  { id: 'DUMBBELLS_ONLY', label: 'Solo Mancuernas', icon: Target },
  { id: 'BODYWEIGHT', label: 'Peso Corporal', icon: Activity },
];

const activitySteps = [
  { value: 1, title: "Sedentario", description: "Trabajo de oficina, menos de 5000 pasos." },
  { value: 2, title: "Ligero", description: "Caminatas ocasionales. Entre 5k y 8k pasos." },
  { value: 3, title: "Moderado", description: "Entreno 3 veces por semana o trabajo moderado." },
  { value: 4, title: "Activo", description: "Entrenamiento intenso 4-5 veces por semana." },
  { value: 5, title: "Atleta", description: "Alto rendimiento o trabajo físico demandante." }
];

const experienceSteps = [
  { value: 1, title: "Principiante", description: "Nunca he entrenado con estructura." },
  { value: 2, title: "Novato", description: "He entrenado intermitente." },
  { value: 3, title: "Intermedio", description: "Entreno hace más de 1 año." },
  { value: 4, title: "Avanzado", description: "Domino la técnica y programación." },
  { value: 5, title: "Experto", description: "Nivel competitivo o entrenador." }
];

export interface ZeroClientWizardPTProps {
  mode?: 'B2B' | 'B2C';
}

export const ZeroClientWizardPT: React.FC<ZeroClientWizardPTProps> = ({ mode = 'B2B' }) => {
  const navigate = useNavigate();
  const store = useOnboardingPTStore();
  const { 
    currentBlockIndex, direction, setCurrentBlockIndex, nextBlock, prevBlock, 
    biometrics, setBiometrics, training, setTraining, toggleEquipment,
    goalTags, toggleGoalTag, services, toggleService, injuries, addInjury, updateInjury, removeInjury,
    healthData, setHealthData, identity, setIdentity, loadDummyPatient, setIsSoftLocked
  } = store;

  const [preferredShifts, setPreferredShifts] = useState<string[]>(['MORNING']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showB2CSuccessModal, setShowB2CSuccessModal] = useState(false);
  
  const stepStartTime = useRef<number>(Date.now());
  const TOTAL_SLIDES = 11;

  // Track telemetry per slide
  useEffect(() => {
    const slideName = `slide_${currentBlockIndex}`;
    emitOnboardingStepViewed(slideName);
    stepStartTime.current = Date.now();
    
    return () => {
      const timeSpent = Date.now() - stepStartTime.current;
      emitOnboardingStepCompleted(slideName, timeSpent);
    };
  }, [currentBlockIndex]);

  // Auto-skip Block 0 if in B2B mode
  useEffect(() => {
    if (mode === 'B2B' && currentBlockIndex === 0) {
      setCurrentBlockIndex(1);
    }
  }, [mode, currentBlockIndex, setCurrentBlockIndex]);

  const handleGenderSelect = (g: 'male' | 'female') => {
    if (!biometrics.gender) {
      if (g === 'male') {
        setBiometrics({ gender: g, weight: 80, height: 175, age: 28 });
      } else {
        setBiometrics({ gender: g, weight: 65, height: 165, age: 28 });
      }
    } else {
      setBiometrics({ gender: g });
    }
  };

  const validateSlide = (index: number) => {
    switch(index) {
      case 0: return services.length > 0;
      case 1: 
        const emailRegex = /^\S+@\S+\.\S+$/;
        return identity.first_name.trim() !== '' && identity.last_name.trim() !== '' && emailRegex.test(identity.email);
      case 2: return biometrics.gender !== null && biometrics.weight > 0 && biometrics.height > 0 && biometrics.age > 0;
      case 3: return true; 
      case 4: return true; 
      case 5: return true; 
      case 6: return true; 
      case 7: return true; 
      case 8: return true; 
      case 9: return goalTags.length > 0;
      case 10: return training.equipment.length > 0 && preferredShifts.length > 0;
      default: return true;
    }
  };

  const isCurrentSlideValid = validateSlide(currentBlockIndex);

  const handleNext = () => {
    if (isCurrentSlideValid) {
      nextBlock();
    } else {
      toast.error('Por favor, completa los campos requeridos para continuar.', { id: 'validation-error' });
    }
  };

  const handleFinish = async () => {
    if (!validateSlide(10)) {
      toast.error('Completa los datos para continuar.');
      return;
    }
    setIsProcessing(true);
    setProcessingStep(0);

    let step = 0;
    const advanceStep = () => {
      step++;
      if (step < LABOR_STEPS.length) {
        setProcessingStep(step);
        setTimeout(advanceStep, LABOR_STEPS[step].duration);
      }
    };
    setTimeout(advanceStep, LABOR_STEPS[0].duration);

    try {
      const payload = {
        first_name: identity.first_name,
        last_name: identity.last_name,
        email: identity.email,
        age: biometrics.age,
        weight_kg: biometrics.weight,
        height_cm: biometrics.height,
        extra_data: {
          training_experience: training.experience_level,
          training_days_available: training.days_per_week,
          training_duration_pref: training.duration_pref,
          goal_tags: goalTags,
          equipment: training.equipment.join(', '),
          preferred_shifts: preferredShifts,
          injuries: injuries,
          health_data: healthData
        }
      };

      const { api } = await import('../../api/client');
      const response = await api.post('/api/v1/athletes', payload);
      
      if (response?.athlete_id) {
        useOnboardingPTStore.getState().setCreatedAthleteId(response.athlete_id);
      }
    } catch (e: any) {
      const status = e.status || e?.response?.status;
      if (status === 409) {
        toast.error('Este correo ya está registrado.', { duration: 5000 });
      } else {
        toast.error(e.message || 'Error al guardar el atleta en el servidor.', { duration: 5000 });
      }
      setIsProcessing(false);
      return;
    }

    const totalLaborTime = LABOR_STEPS.reduce((sum, s) => sum + s.duration, 0);
    await new Promise(r => setTimeout(r, totalLaborTime));

    setIsProcessing(false);
    if (mode === 'B2B') setShowRegisterModal(true);
    else setShowB2CSuccessModal(true);
  };

  const handleReturnToDashboard = () => {
    toast.success(`Atleta creado exitosamente.`, { duration: 3000, icon: '✅' });
    navigate('/plan-builder/new');
  };

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 })
  };

  const progressPercent = (currentBlockIndex / TOTAL_SLIDES) * 100;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 text-slate-800 flex flex-col font-sans z-[9999] overflow-hidden">
      
      {/* ═══ OVERLAY: Procesamiento ═══ */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden">
            {/* Cinematic Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative w-32 h-32 mb-12 z-10">
              <motion.div className="absolute inset-0 rounded-full border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} />
              <motion.div className="absolute inset-0 rounded-full border-t-2 border-l-2 border-indigo-400 border-r-transparent border-b-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
              <motion.div className="absolute inset-2 rounded-full border-b-2 border-r-2 border-violet-400 border-t-transparent border-l-transparent opacity-70" animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <BrainCircuit className="w-10 h-10 text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.8)]" />
                </motion.div>
              </div>
            </div>
            
            <div className="w-96 h-1 bg-slate-800/50 rounded-full mb-10 overflow-hidden z-10 relative">
              <motion.div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 rounded-full" initial={{ width: '0%' }} animate={{ width: `${((processingStep + 1) / LABOR_STEPS.length) * 100}%` }} transition={{ duration: 0.6, ease: "easeOut" }}>
                <div className="absolute top-0 right-0 w-10 h-full bg-white blur-[2px] opacity-50" />
              </motion.div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p key={processingStep} initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(10px)' }} transition={{ duration: 0.4 }} className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white text-xl font-light text-center max-w-md z-10 tracking-wide">
                {LABOR_STEPS[processingStep]?.text}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ OVERLAY: Modals ═══ */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg text-slate-800">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20"><Sparkles className="w-6 h-6" /></div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2">Atleta Creado Exitosamente</h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">El perfil biomecánico de <strong>{identity.first_name || 'tu atleta'}</strong> está listo en el sistema.</p>
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleReturnToDashboard} className="w-full px-5 py-4 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
                Crear / Asignar Plan <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {showB2CSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg text-slate-800 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black font-montserrat mb-3">¡Perfil Completado!</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left">
                <p className="text-sm text-slate-600 font-lato mb-2">Tu expediente biomecánico ha sido procesado de forma segura.</p>
              </div>
              <div className="space-y-3 mb-6">
                <button onClick={handleReturnToDashboard} className="w-full h-14 rounded-2xl bg-[#009EE3] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#008ACB] transition-all shadow-lg">Pagar con Mercado Pago</button>
              </div>
              <button onClick={() => { setIsSoftLocked(true); navigate('/atleta/dashboard'); }} className="w-full py-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-all">Saltar por ahora (Entrar en modo restringido)</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Header Minimalista ═══ */}
      <div className="px-6 py-6 absolute top-0 w-full z-10 flex justify-between items-center pointer-events-none">
        <div>
          <h1 className="text-xl font-black font-montserrat text-slate-900 tracking-tight">
            {mode === 'B2B' ? 'Cliente Cero' : 'Tu Perfil'}
          </h1>
        </div>
      </div>

      {/* ═══ Área Principal (Contenedor Centrado Verticalmente) ═══ */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 pt-16 pb-32 relative overflow-hidden">
        <div className="w-full max-w-2xl relative flex flex-col justify-center h-[500px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            
            {/* Slide 0: Servicios */}
            {currentBlockIndex === 0 && (
              <motion.div key="s0" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-8">¿Qué estás buscando?</h2>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'GYM', label: 'Gym / Rutinas', desc: 'Entrenamiento autónomo', icon: Dumbbell },
                    { id: 'PT', label: 'Personal Trainer', desc: 'Acompañamiento 1 a 1', icon: Target },
                    { id: 'NUTRITION', label: 'Nutrición Metabólica', desc: 'Dietoterapia y recomposición', icon: Flame },
                  ].map(srv => (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={srv.id} onClick={() => toggleService(srv.id)}
                      className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${services.includes(srv.id) ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-500 shadow-md ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${services.includes(srv.id) ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}><srv.icon size={28} /></div>
                      <div className="flex-1"><span className="font-bold block text-lg text-slate-800">{srv.label}</span><span className="text-sm text-slate-500 block">{srv.desc}</span></div>
                      {services.includes(srv.id) && <CheckCircle2 className="w-6 h-6 text-indigo-500" />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Slide 1: Identidad */}
            {currentBlockIndex === 1 && (
              <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Identidad del Atleta</h2>
                <p className="text-slate-500 text-center mb-8 text-sm">Necesitamos estos datos para crear el expediente digital.</p>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Nombre</label>
                      <input type="text" value={identity.first_name} onChange={e => setIdentity({ ...identity, first_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" placeholder="Ej. Carlos" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Apellido</label>
                      <input type="text" value={identity.last_name} onChange={e => setIdentity({ ...identity, last_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" placeholder="Ej. Ruiz" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email</label>
                    <input type="email" value={identity.email === 'ghost@aura.app' ? '' : identity.email} onChange={e => setIdentity({ ...identity, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" placeholder="carlos@email.com" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Slide 2: Biometría */}
            {currentBlockIndex === 2 && (
              <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Métricas Base</h2>
                <p className="text-slate-500 text-center mb-8 text-sm">El motor usa esto para calcular el metabolismo basal y requerimientos energéticos.</p>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex space-x-4 mb-8">
                    {['male', 'female'].map((g) => (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={g} onClick={() => handleGenderSelect(g as 'male' | 'female')}
                        className={`py-4 rounded-xl border-2 transition-all flex-1 font-bold text-lg ${biometrics.gender === g ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        {g === 'male' ? 'Hombre' : 'Mujer'}
                      </motion.button>
                    ))}
                  </div>
                  <div className="space-y-8">
                    {[
                      { label: 'Peso Corporal', key: 'weight', min: 40, max: 150, unit: 'kg', val: biometrics.weight },
                      { label: 'Estatura', key: 'height', min: 140, max: 220, unit: 'cm', val: biometrics.height },
                      { label: 'Edad', key: 'age', min: 14, max: 80, unit: 'años', val: biometrics.age }
                    ].map(metric => (
                      <div key={metric.key}>
                        <label className="text-slate-500 text-sm font-bold mb-2 flex items-center justify-between">
                          <span>{metric.label}</span>
                          <div className="flex items-baseline gap-1">
                            <input 
                              type="number" 
                              min={metric.min} 
                              max={metric.max} 
                              value={metric.val || ''} 
                              onChange={(e) => setBiometrics({ [metric.key]: parseInt(e.target.value) || 0 })}
                              className="w-20 text-right bg-transparent text-indigo-700 font-black text-xl p-0 border-b-2 border-transparent focus:border-indigo-500 focus:ring-0 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-sm font-medium text-slate-400">{metric.unit}</span>
                          </div>
                        </label>
                        <input type="range" min={metric.min} max={metric.max} value={metric.val || 0} onChange={(e) => setBiometrics({ [metric.key]: parseInt(e.target.value) || 0 })}
                          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Slide 3: Restricciones */}
            {currentBlockIndex === 3 && (
              <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Cuidados Especiales</h2>
                <p className="text-slate-500 text-center mb-8 text-sm">¿Tenés alguna molestia o dolor recurrente?</p>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <InjuryMatrix injuries={injuries} onAdd={addInjury} onUpdate={updateInjury} onRemove={removeInjury} />
                </div>
              </motion.div>
            )}

            {/* Slide 4: Actividad */}
            {currentBlockIndex === 4 && (
              <motion.div key="s4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Nivel de Actividad Diaria</h2>
                <p className="text-slate-500 text-center mb-8 text-sm">Esto determina tu requerimiento calórico fuera del gimnasio.</p>
                <div className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <PedagogicalSlider label="Actividad fuera del entrenamiento" icon={<Activity />} value={healthData.activityLevel} onChange={(v) => setHealthData({ activityLevel: v })} steps={activitySteps} theme="light" />
                </div>
              </motion.div>
            )}

            {/* Slide 5: Experiencia */}
            {currentBlockIndex === 5 && (
              <motion.div key="s5" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Experiencia Entrenando</h2>
                <p className="text-slate-500 text-center mb-8 text-sm">Determina la complejidad técnica de los ejercicios asignados.</p>
                <div className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                  <PedagogicalSlider label="Conocimiento técnico y años entrenando" icon={<Dumbbell />} value={healthData.experienceLevel} onChange={(v) => setHealthData({ experienceLevel: v })} steps={experienceSteps} theme="light" />
                </div>
              </motion.div>
            )}

            {/* Slide 6: Salud */}
            {currentBlockIndex === 6 && (
              <motion.div key="s6" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Salud y Preexistencias</h2>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                  <motion.label whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-colors bg-slate-50 border-slate-200 hover:border-slate-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-rose-500" /></div>
                      <span className="font-bold text-slate-700">¿Tomas medicación recurrente?</span>
                    </div>
                    <input type="checkbox" checked={healthData.medications} onChange={e => setHealthData({ medications: e.target.checked })} className="w-6 h-6 accent-indigo-600 cursor-pointer" />
                  </motion.label>
                  <motion.label whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-colors bg-slate-50 border-slate-200 hover:border-slate-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Stethoscope className="w-5 h-5 text-blue-500" /></div>
                      <span className="font-bold text-slate-700">Último chequeo médico hace menos de 1 año</span>
                    </div>
                    <input type="checkbox" checked={healthData.recentCheckup} onChange={e => setHealthData({ recentCheckup: e.target.checked })} className="w-6 h-6 accent-indigo-600 cursor-pointer" />
                  </motion.label>
                </div>
              </motion.div>
            )}

            {/* Slide 7: Hábitos */}
            {currentBlockIndex === 7 && (
              <motion.div key="s7" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Hábitos de Vida</h2>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Actividad Laboral</label>
                    <div className="relative">
                      <select value={healthData.workActivityLevel} onChange={(e) => setHealthData({ workActivityLevel: e.target.value })} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                        <option value="SEDENTARY">Sedentario (Escritorio)</option>
                        <option value="LIGHT">Ligero (De pie)</option>
                        <option value="ACTIVE">Activo (Movimiento)</option>
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Alcohol</label>
                    <div className="relative">
                      <select value={healthData.alcohol} onChange={(e) => setHealthData({ alcohol: e.target.value })} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                        <option value="NADA">No consumo</option>
                        <option value="SOCIAL">Social</option>
                        <option value="FRECUENTE">Frecuente</option>
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tabaco / Vapeo</label>
                    <div className="relative">
                      <select value={healthData.smokerFreq} onChange={(e) => setHealthData({ smokerFreq: e.target.value })} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                        <option value="NO_FUMO">No fumo</option>
                        <option value="OCASIONAL">Ocasional</option>
                        <option value="DIARIO">Diario</option>
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Slide 8: Nutrición */}
            {currentBlockIndex === 8 && (
              <motion.div key="s8" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Nutrición y Patrones</h2>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Dieta Actual</label>
                    <div className="relative">
                      <select value={healthData.currentDiet} onChange={(e) => setHealthData({ currentDiet: e.target.value })} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                        <option value="FLEXIBLE">Flexible / Omnívora</option>
                        <option value="VEGETARIANA">Vegetariana</option>
                        <option value="VEGANA">Vegana (Plant-Based)</option>
                        <option value="MEDITERRANEAN">Mediterránea (Equilibrada, grasas saludables)</option>
                        <option value="KETO">Cetogénica (Keto)</option>
                        <option value="LOW_CARB">Low Carb (Baja en carbohidratos)</option>
                        <option value="AYUNO">Ayuno Intermitente Frecuente</option>
                        <option value="OTRA">Otra</option>
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Comidas por Día</label>
                    <div className="relative">
                      <select value={healthData.mealsPerDay} onChange={(e) => setHealthData({ mealsPerDay: e.target.value })} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                        <option value="1_2">1-2 comidas</option>
                        <option value="3_4">3-4 comidas</option>
                        <option value="5_PLUS">5 o más</option>
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Frecuencia de Delivery / Afuera</label>
                    <div className="relative">
                      <select value={healthData.eatsOutFreq} onChange={(e) => setHealthData({ eatsOutFreq: e.target.value })} className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                        <option value="RARA_VEZ">Rara vez (Cocino siempre)</option>
                        <option value="1_2_SEMANA">1-2 veces por semana</option>
                        <option value="CASI_DIARIO">Casi diario</option>
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-4 top-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Slide 9: Objetivos */}
            {currentBlockIndex === 9 && (
              <motion.div key="s9" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Objetivo Principal</h2>
                <div className="grid grid-cols-1 gap-3">
                  {GOAL_OPTIONS.map(opt => (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={opt.id} onClick={() => toggleGoalTag(opt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${goalTags.includes(opt.id) ? `bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-500 shadow-md ring-2 ring-indigo-500/20` : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${opt.colorClass} text-white shadow-sm`}><opt.icon className="w-6 h-6" /></div>
                        <div className="flex-1">
                          <span className={`font-bold text-lg ${goalTags.includes(opt.id) ? 'text-indigo-900' : 'text-slate-900'}`}>{opt.label}</span>
                          <span className="text-xs text-slate-500 block">{opt.desc}</span>
                        </div>
                        {goalTags.includes(opt.id) && <CheckCircle2 className={`w-6 h-6 text-indigo-600`} />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Slide 10: Entorno */}
            {currentBlockIndex === 10 && (
              <motion.div key="s10" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-6 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <h2 className="text-3xl font-black text-slate-900 text-center mb-2">Entorno y Disponibilidad</h2>
                <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm mb-4">
                  <span className="text-slate-900 font-bold block mb-4">Infraestructura</span>
                  <div className="grid grid-cols-1 gap-2">
                    {EQUIPMENT_OPTIONS.map(eq => (
                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} key={eq.id} onClick={() => toggleEquipment(eq.id)}
                        className={`flex items-center px-4 py-3 rounded-xl border font-bold transition-all ${training.equipment.includes(eq.id) ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-500 text-indigo-800 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white shadow-sm'}`}>
                        <eq.icon className={`w-5 h-5 mr-3 ${training.equipment.includes(eq.id) ? 'text-indigo-600' : 'text-slate-400'}`} />{eq.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm">
                    <span className="text-slate-500 font-bold text-sm block mb-3">Días por Semana</span>
                    <div className="flex flex-wrap gap-2">
                      {[2,3,4,5,6].map(d => (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} key={d} onClick={() => setTraining({ days_per_week: d })}
                          className={`w-10 h-10 rounded-lg font-black border transition-all ${training.days_per_week === d ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>{d}</motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm">
                    <span className="text-slate-500 font-bold text-sm block mb-3">Turno Ideal</span>
                    <div className="flex flex-col gap-2">
                      {['MORNING', 'AFTERNOON', 'EVENING'].map(s => (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} key={s} onClick={() => setPreferredShifts(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                          className={`px-3 py-2 rounded-lg font-bold border text-xs text-center transition-all ${preferredShifts.includes(s) ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                          {s === 'MORNING' ? 'Mañana' : s === 'AFTERNOON' ? 'Tarde' : 'Noche'}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Slide 11: Fin */}
            {currentBlockIndex === 11 && (
              <motion.div key="s11" custom={direction} variants={slideVariants} initial="enter" animate="center" className="space-y-8 w-full absolute top-1/2 left-0 -translate-y-1/2">
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="w-20 h-20 bg-gradient-to-tr from-indigo-100 to-violet-100 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner z-10 ring-4 ring-white"><CheckCircle2 className="w-10 h-10" /></div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-violet-700 mb-3 z-10 text-center">¡Expediente Listo!</h2>
                  <p className="text-slate-500 mb-8 max-w-md z-10 font-medium text-center text-sm md:text-base leading-relaxed">
                    Tus datos serán procesados por nuestra <strong className="text-indigo-600">Inteligencia Artificial</strong> y auditados por <strong className="text-violet-600">profesionales clínicos</strong> para garantizar la máxima seguridad y resultados.
                  </p>
                  
                  {/* Feature Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-8 z-10">
                    <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-slate-800">Motor AI</span>
                        <span className="block text-xs text-slate-500">Análisis biomecánico</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 shadow-sm">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="block text-sm font-bold text-slate-800">Auditoría Humana</span>
                        <span className="block text-xs text-slate-500">Revisión clínica 100%</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFinish} disabled={isProcessing}
                    className="w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg hover:shadow-indigo-500/25 transition-all flex justify-center items-center gap-2 z-10">
                    Guardar Atleta y Continuar <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ Footer Flotante (Sticky) ═══ */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/50 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              {(currentBlockIndex > 0 && currentBlockIndex < 11 && !(mode === 'B2B' && currentBlockIndex === 1)) && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={prevBlock} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
                  Volver
                </motion.button>
              )}
            </div>
            {currentBlockIndex < 11 && (
              <motion.button 
                whileHover={isCurrentSlideValid ? { scale: 1.02 } : {}} 
                whileTap={isCurrentSlideValid ? { scale: 0.95 } : {}} 
                onClick={handleNext} 
                className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center ${isCurrentSlideValid ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-80'}`}
              >
                Siguiente Paso <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            )}
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

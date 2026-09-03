import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowRight, Activity, CheckCircle2, Lock, Unlock,
  HeartPulse, Brain, Leaf, Droplet, Apple, BatteryCharging, BatteryWarning, BrainCircuit,
  Pill, Stethoscope
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

const METABOLIC_GOALS = [
  { id: 'GENERAL_HEALTH', label: 'Longevidad y Anti-aging', desc: 'Optimizar marcadores celulares y extender calidad de vida', icon: Leaf },
  { id: 'WEIGHT_LOSS', label: 'Estabilidad Glucémica', desc: 'Evitar picos de insulina, mejorar energía', icon: Droplet },
  { id: 'THERAPEUTIC', label: 'Salud Digestiva', desc: 'Microbioma, reducción de inflamación', icon: Apple },
  { id: 'SPORTS', label: 'Rendimiento Cognitivo', desc: 'Claridad mental, neuroprotección', icon: Brain },
];

const SYMPTOMS_OPTIONS = [
  { id: 'FATIGUE', label: 'Fatiga Crónica', icon: BatteryWarning },
  { id: 'JOINT_PAIN', label: 'Dolor Articular', icon: Activity },
  { id: 'SLEEP_ISSUES', label: 'Insomnio', icon: BatteryCharging },
  { id: 'DIGESTIVE', label: 'Hinchazón/Gases', icon: Apple },
  { id: 'OTHER_UNSPECIFIED', label: 'Otros (No Especificado)', icon: Stethoscope },
];

const GUT_HEALTH_OPTIONS = [
  { id: 'OPTIMAL', label: 'Óptima (Sin molestias)' },
  { id: 'MILD_DISCOMFORT', label: 'Incomodidad Leve (Gases ocasionales)' },
  { id: 'SEVERE_DYSBIOSIS', label: 'Disbiosis Severa (Dolor recurrente)' },
  { id: 'OTHER_UNSPECIFIED', label: 'Otro (No Especificado)' },
];

const ACTIVITY_LEVELS = [
  { id: 'SEDENTARY', label: 'Sedentario' },
  { id: 'LIGHT', label: 'Ligero (1-3 días)' },
  { id: 'MODERATE', label: 'Moderado (3-5 días)' },
  { id: 'ACTIVE', label: 'Activo (Diario)' },
  { id: 'VERY_ACTIVE', label: 'Muy Activo (Atleta)' }
];

export default function ClinicalOnboardingWizard() {
  const navigate = useNavigate();
  
  // Local state for the clinical wizard
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [archetype, setArchetype] = useState<string>('GENERAL_HEALTH');
  const [biometrics, setBiometrics] = useState({ gender: 'male', weight: 70, height: 170, age: 35 });
  const [activityLevel, setActivityLevel] = useState('MODERATE');
  
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [gutHealth, setGutHealth] = useState<string>('OPTIMAL');
  
  const [identity, setIdentity] = useState({ first_name: '', last_name: '', email: '' });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // TanStack Query Mutation for Optimistic UI and Idempotency
  const submitPatientMutation = useMutation({
    mutationFn: async (payload: any) => {
      // Usamos UUID nativo para idempotencia (Fase 14 req)
      const idempotencyKey = crypto.randomUUID();
      
      const response = await fetch('/api/v1/patients/clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('El correo electrónico ya está registrado.');
        }
        throw new Error('Error al generar expediente clínico.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Optimistic UI: Mostrar modal de éxito inmediatamente (<50ms ideal)
      // Guardar el client_id recibido en una variable o estado para usarlo en el navigate
      setIdentity(prev => ({ ...prev, client_id: data.client_id }));
      setShowSuccessModal(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error de conexión');
    }
  });

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const nextBlock = () => setCurrentBlockIndex(p => Math.min(p + 1, 3));
  const prevBlock = () => setCurrentBlockIndex(p => Math.max(p - 1, 0));

  const handleFinish = () => {
    if (!identity.first_name || !identity.email) {
      toast.error('Completa los datos de identidad.');
      return;
    }

    const payload = {
      schema_version: 1,
      first_name: identity.first_name,
      last_name: identity.last_name,
      email: identity.email,
      age: biometrics.age,
      weight_kg: biometrics.weight,
      height_cm: biometrics.height,
      gender: biometrics.gender,
      activity_level: activityLevel,
      archetype: archetype,
      symptoms: symptoms,
      gut_health: gutHealth,
      clinical_hard_stops: []
    };

    // Disparar mutación
    submitPatientMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[stone-100] text-[slate-800] flex font-sans z-[9999] overflow-hidden">
      
      {/* ═══ Área Principal ═══ */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 pb-32">
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-black font-montserrat text-[slate-800] mb-3 tracking-tight">
              Expediente Metabólico (Zero-AI)
            </h1>
            <p className="text-slate-600 font-lato md:text-lg">
              Construyamos el contexto clínico necesario para diseñar tu protocolo de longevidad mediante captura determinista.
            </p>
          </header>

          <div className="relative flex-1">
            <AnimatePresence mode="wait">
              
              {/* BLOQUE 0: OBJETIVOS CLÍNICOS */}
              {currentBlockIndex === 0 && (
                <motion.div key="block0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <h2 className="text-2xl font-semibold text-[slate-800] flex items-center font-montserrat">
                    <span className="w-8 h-8 rounded-full bg-[stone-300]/30 text-[slate-600] flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Foco Terapéutico
                  </h2>
                  
                  <div className="bg-[white] p-8 rounded-2xl shadow-sm border border-[stone-300]/30">
                    <span className="text-[slate-800] font-bold block mb-4 text-lg font-montserrat">¿Cuál es tu prioridad principal?</span>
                    <div className="grid grid-cols-1 gap-4">
                      {METABOLIC_GOALS.map(goal => (
                        <motion.button whileTap={{ scale: 0.98 }} key={goal.id} onClick={() => setArchetype(goal.id)}
                          className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${archetype === goal.id ? 'bg-[stone-300]/10 border-[stone-300] shadow-sm' : 'bg-white border-slate-200 hover:border-[stone-300]/50 shadow-sm'}`}>
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${archetype === goal.id ? 'bg-[stone-300]/20 text-emerald-800' : 'bg-slate-50 text-slate-400'}`}>
                            <goal.icon size={28} />
                          </div>
                          <div className="flex-1">
                            <span className={`font-bold block text-lg font-montserrat ${archetype === goal.id ? 'text-[slate-800]' : 'text-slate-700'}`}>{goal.label}</span>
                            <span className="text-sm text-slate-500 block font-lato">{goal.desc}</span>
                          </div>
                          {archetype === goal.id && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* BLOQUE 1: BIOMETRÍA Y ACTIVIDAD */}
              {currentBlockIndex === 1 && (
                <motion.div key="block1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <h2 className="text-2xl font-semibold text-[slate-800] flex items-center font-montserrat">
                    <span className="w-8 h-8 rounded-full bg-[stone-300]/30 text-[slate-600] flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Fisiología y Actividad
                  </h2>
                  
                  <div className="bg-[white] p-8 rounded-2xl shadow-sm border border-[stone-300]/30">
                    <div className="flex space-x-4 mb-8">
                      {['male', 'female'].map((g) => (
                        <motion.button whileTap={{ scale: 0.98 }} key={g} onClick={() => setBiometrics(prev => ({ ...prev, gender: g }))}
                          className={`px-8 py-4 rounded-xl border-2 transition-all duration-200 flex-1 font-medium text-lg ${biometrics.gender === g ? 'bg-[stone-300]/10 border-[stone-300] text-[slate-800]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                          {g === 'male' ? 'Hombre' : 'Mujer'}
                        </motion.button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 font-lato">
                      {[
                        { label: 'Peso Actual', key: 'weight', min: 40, max: 150, unit: 'kg', val: biometrics.weight },
                        { label: 'Estatura', key: 'height', min: 140, max: 220, unit: 'cm', val: biometrics.height },
                        { label: 'Edad', key: 'age', min: 16, max: 90, unit: 'años', val: biometrics.age },
                      ].map((s) => (
                        <div key={s.key} className="space-y-5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-slate-500 font-medium text-sm">{s.label}</span>
                            <span className="text-3xl font-bold text-[slate-800] font-montserrat">{s.val} <span className="text-lg text-slate-400 font-medium font-lato">{s.unit}</span></span>
                          </div>
                          <input type="range" min={s.min} max={s.max} value={s.val}
                            onChange={(e) => setBiometrics(prev => ({ ...prev, [s.key]: parseInt(e.target.value) }))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[stone-400]" />
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <span className="text-[slate-800] font-bold block mb-4 text-lg font-montserrat">Nivel de Actividad Física</span>
                      <div className="flex flex-wrap gap-3">
                        {ACTIVITY_LEVELS.map(act => (
                          <motion.button whileTap={{ scale: 0.95 }} key={act.id} onClick={() => setActivityLevel(act.id)}
                            className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all ${activityLevel === act.id ? 'bg-[slate-800] border-[slate-800] text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-[stone-300]'}`}>
                            {act.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* BLOQUE 2: CARGA ALOSTÁTICA Y SÍNTOMAS (Validation Tinder) */}
              {currentBlockIndex === 2 && (
                <motion.div key="block2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="space-y-8">
                  <h2 className="text-2xl font-semibold text-[slate-800] flex items-center font-montserrat">
                    <span className="w-8 h-8 rounded-full bg-[stone-300]/30 text-[slate-600] flex items-center justify-center text-sm font-bold mr-3">3</span>
                    Carga Alostática y Síntomas
                  </h2>
                  
                  <div className="bg-[white] p-8 border border-[stone-300]/30 rounded-2xl shadow-sm space-y-8">
                    
                    <div>
                      <span className="text-[slate-800] font-bold block mb-4 text-lg font-montserrat">Salud Intestinal (Microbioma)</span>
                      <div className="flex flex-col gap-3">
                        {GUT_HEALTH_OPTIONS.map(gh => (
                          <motion.button whileTap={{ scale: 0.98 }} key={gh.id} onClick={() => setGutHealth(gh.id)}
                            className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${gutHealth === gh.id ? 'bg-[stone-300]/10 border-[stone-300] shadow-sm text-emerald-800 font-bold' : 'bg-white border-slate-200 hover:border-[stone-300]/50 text-slate-700'}`}>
                            <span>{gh.label}</span>
                            {gutHealth === gh.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <span className="text-[slate-800] font-bold block mb-4 text-lg font-montserrat">Síntomas Actuales (Validation Tinder)</span>
                      <p className="text-sm text-slate-500 mb-4 font-lato">Selecciona todos los que apliquen mediante un simple tap. Sin necesidad de escribir.</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SYMPTOMS_OPTIONS.map(symp => (
                          <motion.button whileTap={{ scale: 0.95 }} key={symp.id} onClick={() => toggleSymptom(symp.id)}
                            className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 text-center h-28 ${symptoms.includes(symp.id) ? 'bg-[stone-300]/20 border-[stone-300] shadow-sm text-emerald-900' : 'bg-white border-slate-200 text-slate-500 hover:border-[stone-300]/50 hover:bg-slate-50'}`}>
                            <symp.icon className={`w-8 h-8 ${symptoms.includes(symp.id) ? 'text-emerald-700' : 'text-slate-400'}`} />
                            <span className="text-sm font-bold font-montserrat leading-tight">{symp.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* BLOQUE 3: IDENTIDAD */}
              {currentBlockIndex === 3 && (
                <motion.div key="block3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                  <div className="bg-[white] p-10 rounded-3xl shadow-sm border border-[stone-300]/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[stone-300]" />
                    <div className="w-16 h-16 bg-[slate-800] text-white rounded-2xl flex items-center justify-center mb-6">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-[slate-800] tracking-tight mb-2 font-montserrat">
                      Asegurar Historial
                    </h2>
                    <p className="text-slate-500 mb-8 text-base font-lato">
                      El motor clínico está listo para compilar tu expediente determinista asíncrono.
                    </p>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-montserrat">Nombre</label>
                          <input type="text" value={identity.first_name} onChange={e => setIdentity(p => ({ ...p, first_name: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-[stone-300] outline-none transition-all" placeholder="Ej. Carlos" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-montserrat">Apellido</label>
                          <input type="text" value={identity.last_name} onChange={e => setIdentity(p => ({ ...p, last_name: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-[stone-300] outline-none transition-all" placeholder="Ej. Ruiz" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 font-montserrat">Correo Electrónico</label>
                        <input type="email" value={identity.email} onChange={e => setIdentity(p => ({ ...p, email: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 focus:ring-2 focus:ring-[stone-300] outline-none transition-all" placeholder="paciente@email.com" />
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-3">
                      <motion.button whileTap={{ scale: 0.98 }} onClick={handleFinish} disabled={!identity.first_name || !identity.email || submitPatientMutation.isPending}
                        className="w-full py-4 rounded-xl text-lg font-bold text-white bg-[slate-800] hover:bg-[slate-900] shadow-md transition-all disabled:bg-slate-300 disabled:shadow-none flex justify-center items-center gap-2 font-montserrat">
                        {submitPatientMutation.isPending ? (
                          <BrainCircuit className="w-5 h-5 animate-spin" />
                        ) : (
                          <Unlock className="w-5 h-5" /> 
                        )}
                        {submitPatientMutation.isPending ? 'Validando Métrica...' : 'Compilar Expediente'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* B2C SUCCESS MODAL */}
          <AnimatePresence>
            {showSuccessModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[999999] bg-[slate-800]/80 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-[white] p-8 md:p-10 rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg text-[slate-800] text-center"
                >
                  <div className="w-16 h-16 bg-[stone-300]/30 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <h2 className="text-2xl font-black font-montserrat mb-3">Expediente Aprobado</h2>
                  
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 text-left">
                    <p className="text-sm text-slate-600 font-lato mb-3 leading-relaxed">
                      Tu información clínica ha sido validada sin fricción. Nuestro motor cognitivo está procesando tu matriz asíncronamente.
                    </p>
                    <p className="text-sm text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 font-lato font-bold">
                      Continúa al portal para descubrir el protocolo de longevidad en tiempo real.
                    </p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => navigate('/longevidad', { state: { clientId: (identity as any).client_id } })}
                      className="w-full h-14 rounded-xl bg-[blue-500] text-white font-bold font-montserrat flex items-center justify-center gap-2 hover:bg-[blue-600] transition-all shadow-md"
                    >
                      Continuar a Dashboard
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ FOOTER DE NAVEGACIÓN ═══ */}
        <div className="mt-8 pt-6 border-t border-[stone-300]/50 flex items-center justify-between z-20 relative max-w-3xl mx-auto px-4 pb-8">
          <div>
            {currentBlockIndex > 0 && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={prevBlock} className="px-6 py-3 rounded-xl font-bold font-montserrat text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                Volver
              </motion.button>
            )}
          </div>
          <div className="flex space-x-3">
            {[0,1,2,3].map(idx => (
              <div key={idx} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentBlockIndex ? 'bg-[slate-800] scale-125' : idx < currentBlockIndex ? 'bg-slate-400' : 'bg-slate-300'}`} />
            ))}
          </div>
          <div>
            {currentBlockIndex < 3 && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={nextBlock} className="px-8 py-3 rounded-xl font-bold font-montserrat bg-[slate-800] text-white hover:bg-[slate-900] disabled:bg-slate-300 transition-all flex items-center shadow-md">
                Siguiente <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

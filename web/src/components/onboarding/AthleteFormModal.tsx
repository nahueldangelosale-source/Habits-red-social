import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronDown, User, Target, Moon, Utensils, Heart, Activity, 
  Shield, Check, AlertTriangle, ShieldAlert, Flame, AlertCircle
} from 'lucide-react';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';

interface AthleteFormModalProps {
  onClose: () => void;
}

const goalMap: Record<string, string> = {
  'body:fat_loss': 'Pérdida de Grasa (Resiliencia)',
  'body:muscle_gain': 'Ganancia Muscular (Hipertrofia)',
  'body:recomp': 'Recomposición Corporal',
  'body:health': 'Mantenimiento (Salud)',
  'sport:performance': 'Alto Rendimiento Deportivo',
  'mind:stress': 'Reducción de Estrés',
  BODY_FAT_LOSS: 'Pérdida de Grasa (Resiliencia)',
  BODY_MUSCLE_GAIN: 'Ganancia Muscular (Hipertrofia)',
  BODY_RECOMP: 'Recomposición Corporal',
  BODY_HEALTH: 'Mantenimiento (Salud)',
  SPORT_PERFORMANCE: 'Alto Rendimiento Deportivo',
  MIND_STRESS: 'Reducción de Estrés',
  WEIGHT_LOSS: 'Pérdida de Peso',
  MUSCLE_GAIN: 'Ganancia Muscular',
  RECOMPOSITION: 'Recomposición Corporal',
  HIGH_PERFORMANCE: 'Alto Rendimiento',
  HEALTH: 'Salud Integral'
};

const eqMap: Record<string, string> = {
  COMMERCIAL_GYM: 'Gimnasio Comercial',
  HOME_GYM: 'Gimnasio en Casa',
  BODYWEIGHT: 'Peso Corporal',
  DUMBBELLS_ONLY: 'Solo Mancuernas',
  BARBELL_ONLY: 'Solo Barra'
};

const coachMap: Record<string, string> = {
  DATA_SCIENCE: 'Ciencia de Datos',
  MOTIVATIONAL: 'Motivacional',
  STRICT: 'Estricto / Disciplinado',
  FLEXIBLE: 'Flexible / Empático'
};

const workTypeMap: Record<string, string> = {
  SEDENTARY: 'Sedentario',
  ACTIVE: 'Activo'
};

const mobilityMap: Record<string, string> = {
  SEDENTARY: 'Sedentario',
  LIGHT: 'Ligera',
  MODERATE: 'Moderada',
  ACTIVE: 'Activa',
  VERY_ACTIVE: 'Muy Activa'
};

const smokeMap: Record<string, string> = {
  NO_FUMO: 'No Fumo',
  OCASIONAL: 'Ocasional',
  DIARIO: 'Diario'
};

const alcoholMap: Record<string, string> = {
  NADA: 'Nada',
  OCASIONAL: 'Ocasional',
  FRECUENTE: 'Frecuente'
};

const dietMap: Record<string, string> = {
  FLEXIBLE: 'Flexible',
  VEGETARIAN: 'Vegetariana',
  VEGAN: 'Vegana',
  KETO: 'Keto',
  PALEO: 'Paleo',
  OMNIVORE: 'Omnívora'
};

const mealsMap: Record<string, string> = {
  '1_2': '1 a 2 comidas',
  '3_4': '3 a 4 comidas',
  '5_PLUS': '5 o más comidas'
};

const eatsOutMap: Record<string, string> = {
  NUNCA: 'Nunca',
  RARA_VEZ: 'Rara Vez',
  FRECUENTE: 'Frecuente',
  CASI_SIEMPRE: 'Casi Siempre'
};

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: React.ElementType, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50/80 hover:bg-slate-100 transition-colors"
      >
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Icon size={14} className="text-indigo-600" /> {title}
        </h4>
        <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={16} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-slate-100 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export const AthleteFormModal: React.FC<AthleteFormModalProps> = ({ onClose }) => {
  const { identity, biometrics, training, healthData, injuries, goalTags, medicalTags, sleepQuality, stressLevel, workType } = useOnboardingPTStore();

  return (
    <div className="fixed inset-y-0 right-0 z-[99999] flex pointer-events-none font-sans">
      <motion.div 
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-[480px] bg-white shadow-2xl border-l border-slate-200 h-full flex flex-col pointer-events-auto overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <User className="text-indigo-600 w-5 h-5" />
              Ficha del Atleta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Datos relevados en el Onboarding</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* 🚨 1. ALERTA MÉDICA Y LESIONES ACTIVAS (ARRIBA DE TODO) */}
          {((injuries && injuries.length > 0) || (medicalTags && medicalTags.length > 0)) && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-900 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 font-mono block">
                      PRECAUCIÓN MÉDICA CRÍTICA
                    </span>
                    <h4 className="text-xs font-black text-rose-950">
                      {injuries?.length || 0} Lesión(es) Activa(s) y Advertencias
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 font-mono">
                  Atención Requerida
                </span>
              </div>

              {/* Lista de Lesiones Activas */}
              {injuries && injuries.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {injuries.map((inj: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between text-xs shadow-2xs">
                      <div className="flex items-center gap-2 font-black text-rose-950">
                        <ShieldAlert size={14} className="text-rose-500 shrink-0" />
                        <span>{inj.joint || inj.zone || 'Lesión Reportada'} {inj.zone && inj.joint ? `(${inj.zone})` : ''}</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono">
                        Dolor: {inj.painLevel || 3}/5
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Patologías Médicas Relevadas */}
              {medicalTags && medicalTags.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider block mb-1">
                    Patologías / Condiciones Médicas:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {medicalTags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                        ⚠️ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-rose-700 italic pt-1 border-t border-rose-200/60 flex items-center gap-1">
                <span>🛡️</span> El Injury Firewall alertará automáticamente si programas ejercicios con alta carga axial o impacto en estas zonas.
              </p>
            </div>
          )}

          {/* Identidad y Biometría */}
          <AccordionSection title="Identidad y Biometría" icon={User} defaultOpen={true}>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Atleta</span>
                <span className="text-sm font-bold text-slate-800">{identity?.first_name || '-'} {identity?.last_name || '-'}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Edad</span>
                  <span className="text-sm font-bold text-slate-800">{biometrics?.age ? `${biometrics.age} años` : '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Género</span>
                  <span className="text-sm font-bold text-slate-800 capitalize">{biometrics?.gender === 'male' ? 'Hombre' : biometrics?.gender === 'female' ? 'Mujer' : biometrics?.gender || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Peso</span>
                  <span className="text-sm font-bold text-slate-800">{biometrics?.weight ? `${biometrics.weight} kg` : '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Altura</span>
                  <span className="text-sm font-bold text-slate-800">{biometrics?.height ? `${biometrics.height} cm` : '-'}</span>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Entrenamiento */}
          <AccordionSection title="Perfil de Entrenamiento" icon={Target} defaultOpen={false}>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Objetivos</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {goalTags?.map(g => (
                    <span key={g} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">{goalMap[g] || g}</span>
                  )) || '-'}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Experiencia</span>
                  <span className="text-sm font-bold text-slate-800">
                    {(() => {
                      const lvlRaw = healthData?.experienceLevel || training?.experience_level;
                      if (typeof lvlRaw === 'number') {
                        return { 1: 'Principiante', 2: 'Novato', 3: 'Intermedio', 4: 'Avanzado', 5: 'Experto' }[lvlRaw] || 'Principiante';
                      }
                      if (lvlRaw === 'BEGINNER') return 'Principiante';
                      if (lvlRaw === 'INTERMEDIATE') return 'Intermedio';
                      if (lvlRaw === 'ADVANCED') return 'Avanzado';
                      return 'Principiante';
                    })()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Días Disponibles</span>
                  <span className="text-sm font-bold text-slate-800">{training?.days_per_week ? `${training.days_per_week} días/sem` : '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Duración Sesión</span>
                  <span className="text-sm font-bold text-slate-800">{training?.session_duration_minutes ? `${training.session_duration_minutes} min` : '-'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Equipamiento Disponible</span>
                <span className="text-sm font-bold text-slate-800">{training?.equipment_available ? (eqMap[training.equipment_available] || training.equipment_available) : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Estilo de Coaching</span>
                <span className="text-sm font-bold text-slate-800">{training?.coaching_style ? (coachMap[training.coaching_style] || training.coaching_style) : '-'}</span>
              </div>
            </div>
          </AccordionSection>

          {/* Hábitos y Estilo de Vida */}
          <AccordionSection title="Hábitos y Estilo de Vida" icon={Moon} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Horas de Sueño</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.sleepHours ? `${healthData.sleepHours} hrs` : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Calidad de Sueño</span>
                <span className="text-sm font-bold text-slate-800">{sleepQuality ? `${sleepQuality}/5` : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nivel de Estrés</span>
                <span className="text-sm font-bold text-slate-800">{stressLevel ? `${stressLevel}/5` : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tipo de Trabajo</span>
                <span className="text-sm font-bold text-slate-800">{workType ? (workTypeMap[workType] || workType) : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nivel de Movilidad</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.mobilityLevel ? (mobilityMap[healthData.mobilityLevel] || healthData.mobilityLevel) : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Consumo de Tabaco</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.smokingHabit ? (smokeMap[healthData.smokingHabit] || healthData.smokingHabit) : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center col-span-1 md:col-span-2">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Consumo de Alcohol</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.alcoholHabit ? (alcoholMap[healthData.alcoholHabit] || healthData.alcoholHabit) : '-'}</span>
              </div>
            </div>
          </AccordionSection>

          {/* Alimentación */}
          <AccordionSection title="Alimentación" icon={Utensils} defaultOpen={false}>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Preferencia Dietaria</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.dietaryPreference ? (dietMap[healthData.dietaryPreference] || healthData.dietaryPreference) : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Comidas al Día</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.mealsPerDay ? (mealsMap[healthData.mealsPerDay] || healthData.mealsPerDay) : '-'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Comidas Fuera</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.eatsOutFreq ? (eatsOutMap[healthData.eatsOutFreq] || healthData.eatsOutFreq) : '-'}</span>
              </div>
            </div>
          </AccordionSection>

          {/* Salud y Lesiones */}
          <AccordionSection title="Historial Clínico y Lesiones" icon={Heart} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Chequeo Reciente</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.recentCheckup ? 'Sí' : 'No'}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Medicación</span>
                <span className="text-sm font-bold text-slate-800">{healthData?.medications ? 'Sí' : 'No'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Activity size={12} /> Patologías / Médicas</span>
                {medicalTags && medicalTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {medicalTags.map((tag, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">{tag}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">Ninguna reportada.</p>
                )}
              </div>

              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="block text-xs text-rose-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Shield size={12} /> Lesiones Activas</span>
                {injuries && injuries.length > 0 ? (
                  <ul className="space-y-1">
                    {injuries.map((inj, idx) => (
                      <li key={idx} className="text-xs font-medium text-rose-800 flex justify-between items-center bg-white/60 px-2 py-1.5 rounded">
                        <span>{inj.joint || inj.zone} {inj.zone && inj.joint ? `(${inj.zone})` : ''}</span>
                        <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-black">Dolor: {inj.painLevel}/5</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">Ninguna lesión reportada.</p>
                )}
              </div>
            </div>
          </AccordionSection>

        </div>
      </motion.div>
    </div>
  );
};

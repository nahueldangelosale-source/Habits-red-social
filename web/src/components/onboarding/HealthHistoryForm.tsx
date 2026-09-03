import React, { useEffect, useRef } from 'react';
import { PedagogicalSlider } from './PedagogicalSlider';
import { Activity, Dumbbell, AlertCircle, HeartPulse, Cigarette, Stethoscope, MessageCircle, ChevronDown, Utensils, GlassWater, Briefcase, Wine } from 'lucide-react';
import { emitOnboardingStepViewed, emitOnboardingStepCompleted, emitOnboardingDropOff } from '../../utils/telemetry';

export interface HealthData {
  activityLevel: number;
  experienceLevel: number;
  medications: boolean;
  smokerFreq: string;
  recentCheckup: boolean;
  commStyle: string;
  currentDiet: string;
  eatsOutFreq: string;
  alcohol: string;
  mealsPerDay: string;
  workActivityLevel: string;
}

interface HealthHistoryFormProps {
  data: HealthData;
  onChange: (data: Partial<HealthData>) => void;
  theme?: 'light' | 'dark';
  hideCommStyle?: boolean;
}

export const HealthHistoryForm: React.FC<HealthHistoryFormProps> = ({
  data,
  onChange,
  theme = 'dark',
  hideCommStyle = false
}) => {
  const isLight = theme === 'light';
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    emitOnboardingStepViewed("habitos");
    
    return () => {
      // Component unmount telemetry
      const timeSpent = Date.now() - startTimeRef.current;
      emitOnboardingStepCompleted("habitos", timeSpent);
    };
  }, []);

  const activitySteps = [
    { value: 1, title: "Sedentario", description: "Trabajo de oficina, menos de 5000 pasos al día." },
    { value: 2, title: "Ligero", description: "Caminatas ocasionales. Entre 5k y 8k pasos diarios." },
    { value: 3, title: "Moderado", description: "Entreno 3 veces por semana o trabajo físico moderado." },
    { value: 4, title: "Activo", description: "Entrenamiento intenso 4-5 veces por semana." },
    { value: 5, title: "Atleta", description: "Alto rendimiento o trabajo físico demandante." }
  ];

  const experienceSteps = [
    { value: 1, title: "Principiante", description: "Nunca he entrenado con estructura." },
    { value: 2, title: "Novato", description: "He entrenado intermitente, sin dominar técnicas." },
    { value: 3, title: "Intermedio", description: "Conozco movimientos básicos y entreno hace más de 1 año." },
    { value: 4, title: "Avanzado", description: "Domino la técnica y entiendo de programación." },
    { value: 5, title: "Experto", description: "Nivel competitivo o entrenador." }
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className={`text-xl font-black font-montserrat mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>Perfil Físico y Clínico</h2>
        <p className={`font-lato text-sm ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Métricas estructuradas para el motor de inferencia.</p>
      </div>

      <div className="space-y-4 mb-8">
        <PedagogicalSlider 
          label="Nivel de Actividad Diaria (General)" 
          icon={<Activity className="w-5 h-5" />}
          value={data.activityLevel} 
          onChange={(v) => onChange({ activityLevel: v })} 
          steps={activitySteps} 
          theme={theme}
        />
        <PedagogicalSlider 
          label="Experiencia Entrenando" 
          icon={<Dumbbell className="w-5 h-5" />}
          value={data.experienceLevel} 
          onChange={(v) => onChange({ experienceLevel: v })} 
          steps={experienceSteps} 
          theme={theme}
        />
      </div>

      {/* BLOQUE: SALUD */}
      <div className={`border rounded-2xl p-5 mb-8 backdrop-blur-sm ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/10'}`}>
        <h3 className={`font-bold font-montserrat tracking-wide mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <Stethoscope className="w-5 h-5 text-red-400" />
          Salud y Preexistencias
        </h3>
        <div className="space-y-3">
          <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-black/30 border-white/5 hover:border-white/10'}`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span className={`font-lato text-sm font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>¿Tomas medicación recurrente?</span>
            </div>
            <input type="checkbox" checked={data.medications} onChange={e => onChange({ medications: e.target.checked })} className={`w-5 h-5 ${isLight ? 'accent-indigo-600' : 'accent-lime-400'}`} />
          </label>
          <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-black/30 border-white/5 hover:border-white/10'}`}>
            <div className="flex items-center gap-3">
              <HeartPulse className="w-5 h-5 text-blue-400" />
              <span className={`font-lato text-sm font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Último chequeo médico general hace menos de 1 año</span>
            </div>
            <input type="checkbox" checked={data.recentCheckup} onChange={e => onChange({ recentCheckup: e.target.checked })} className={`w-5 h-5 ${isLight ? 'accent-indigo-600' : 'accent-lime-400'}`} />
          </label>
        </div>
      </div>

      {/* BLOQUE: HÁBITOS */}
      <div className={`border rounded-2xl p-5 mb-8 backdrop-blur-sm ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/10'}`}>
        <h3 className={`font-bold font-montserrat tracking-wide mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <Activity className="w-5 h-5 text-indigo-400" />
          Hábitos de Vida
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-2 font-lato ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Nivel de Actividad Laboral</label>
            <div className="relative">
              <select value={data.workActivityLevel} onChange={(e) => onChange({ workActivityLevel: e.target.value })}
                className={`w-full appearance-none border font-medium text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-white'}`}>
                <option value="SEDENTARY">Sedentario (Trabajo de escritorio / Oficina)</option>
                <option value="LIGHT">Ligero (De pie algunas horas / Maestro)</option>
                <option value="ACTIVE">Activo (Movimiento constante / Camarero)</option>
                <option value="VERY_ACTIVE">Muy Activo (Trabajo físico / Construcción)</option>
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 font-lato ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Consumo de Alcohol</label>
            <div className="relative">
              <select value={data.alcohol} onChange={(e) => onChange({ alcohol: e.target.value })}
                className={`w-full appearance-none border font-medium text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-white'}`}>
                <option value="NADA">No consumo alcohol</option>
                <option value="SOCIAL">Ocasional / Eventos sociales</option>
                <option value="FRECUENTE">Frecuente (1-3 veces por semana)</option>
                <option value="DIARIO">Casi todos los días</option>
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 font-lato ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Fumador / Tabaco</label>
            <div className="relative">
              <select value={data.smokerFreq} onChange={(e) => onChange({ smokerFreq: e.target.value })}
                className={`w-full appearance-none border font-medium text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-white'}`}>
                <option value="NO_FUMO">No fumo</option>
                <option value="SOCIAL">Solo en eventos sociales</option>
                <option value="OCASIONAL">Ocasional (Pocos cigarrillos/vape a la semana)</option>
                <option value="DIARIO">Diario</option>
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE: NUTRICIÓN */}
      <div className={`border rounded-2xl p-5 mb-8 backdrop-blur-sm ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/40 border-white/10'}`}>
        <h3 className={`font-bold font-montserrat tracking-wide mb-4 flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <Utensils className="w-5 h-5 text-emerald-400" />
          Nutrición y Patrones
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-2 font-lato ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Tipo de Dieta Actual</label>
            <div className="relative">
              <select
                value={data.currentDiet}
                onChange={(e) => onChange({ currentDiet: e.target.value })}
                className={`w-full appearance-none border font-medium text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-white'}`}
              >
                <option value="FLEXIBLE">Flexible / Omnívora</option>
                <option value="VEGETARIANA">Vegetariana</option>
                <option value="VEGANA">Vegana (Plant-Based)</option>
                <option value="KETO">Cetogénica (Keto)</option>
                <option value="LOW_CARB">Low Carb (Baja en carbohidratos)</option>
                <option value="MEDITERRANEAN">Mediterránea (Equilibrada, grasas saludables)</option>
                <option value="AYUNO">Ayuno Intermitente Frecuente</option>
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 font-lato ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>Frecuencia de Comidas Diarias</label>
            <div className="relative">
              <select value={data.mealsPerDay} onChange={(e) => onChange({ mealsPerDay: e.target.value })}
                className={`w-full appearance-none border font-medium text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-white'}`}>
                <option value="1_2">1-2 comidas principales</option>
                <option value="3_4">3-4 comidas (Desayuno, Almuerzo, Cena + Snack)</option>
                <option value="5_PLUS">5 o más (Frecuencia alta / Múltiples snacks)</option>
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 font-lato ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>¿Con qué frecuencia comes fuera de casa?</label>
            <div className="relative">
              <select value={data.eatsOutFreq} onChange={(e) => onChange({ eatsOutFreq: e.target.value })}
                className={`w-full appearance-none border font-medium text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-white'}`}>
                <option value="RARA_VEZ">Rara vez (Cocino casi todo)</option>
                <option value="1_2_SEMANA">1 a 2 veces por semana</option>
                <option value="3_4_SEMANA">3 a 4 veces por semana</option>
                <option value="CASI_DIARIO">Casi todos los días (Delivery / Restaurante)</option>
              </select>
              <ChevronDown className={`w-4 h-4 absolute right-3 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

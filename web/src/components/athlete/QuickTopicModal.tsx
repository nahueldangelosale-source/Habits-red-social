import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Dumbbell, 
  Video, 
  Utensils, 
  HeartPulse, 
  Zap, 
  Moon, 
  Camera, 
  Send, 
  Check, 
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export type QuickTopicType = 'cargas' | 'video' | 'nutricion' | 'dolor' | 'nivel' | 'fatiga' | 'foto';

interface QuickTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicType: QuickTopicType | null;
  coachName?: string;
  initialExerciseName?: string;
  initialWeight?: number;
  initialMealType?: string;
  initialFoodSource?: string;
  onSendMessage: (text: string, mediaType?: 'text' | 'video_check', topicType?: QuickTopicType) => void;
}

const EXERCISES_LIST = [
  'Sentadilla Trasera con Barra',
  'Press de Banca Plano',
  'Peso Muerto Convencional',
  'Peso Muerto Rumano (RDL)',
  'Press Militar con Barra',
  'Dominadas Pronas',
  'Remo con Barra Inclinado',
  'Prensa de Piernas',
  'Elevaciones Laterales',
  'Otro Ejercicio'
];

export const QuickTopicModal: React.FC<QuickTopicModalProps> = ({
  isOpen,
  onClose,
  topicType,
  coachName = 'Coach Leandro',
  initialExerciseName,
  initialWeight,
  initialMealType,
  initialFoodSource,
  onSendMessage
}) => {
  // Common states
  const [selectedExercise, setSelectedExercise] = useState('Sentadilla Trasera con Barra');
  
  // Topic 1: Cargas
  const [currentWeight, setCurrentWeight] = useState(80);
  const [effortFeeling, setEffortFeeling] = useState<'EASY' | 'OPTIMAL' | 'HARD'>('OPTIMAL');
  const [loadGoal, setLoadGoal] = useState<'UP' | 'MAINTAIN' | 'DOWN'>('UP');

  // Topic 2: Video
  const [videoFocus, setVideoFocus] = useState<'PROFUNDIDAD' | 'ESPALDA' | 'RITMO' | 'GENERAL'>('PROFUNDIDAD');

  // Topic 3: Nutricion
  const [mealType, setMealType] = useState('Almuerzo');
  const [foodSource, setFoodSource] = useState('150g Arroz Integral');
  const [foodTarget, setFoodTarget] = useState('200g Papa Asada');

  // Topic 4: Molestia / Dolor
  const [bodyPart, setBodyPart] = useState('Hombro');
  const [painLevel, setPainLevel] = useState(4);
  const [painMoment, setPainMoment] = useState('Durante la bajada excéntrica');

  // Topic 5: Subir Nivel
  const [levelAspect, setLevelAspect] = useState<'PESO' | 'VOLUMEN' | 'MENOS_DESCANSO' | 'TECNICAS'>('PESO');

  // Topic 6: Fatiga
  const [fatigueSource, setFatigueSource] = useState<'SUEÑO' | 'MUSCULAR' | 'ESTRES'>('MUSCULAR');
  const [readinessScore, setReadinessScore] = useState(45);

  // Synchronize initial props
  useEffect(() => {
    if (initialExerciseName) setSelectedExercise(initialExerciseName);
    if (initialWeight) setCurrentWeight(initialWeight);
    if (initialMealType) setMealType(initialMealType);
    if (initialFoodSource) setFoodSource(initialFoodSource);
  }, [initialExerciseName, initialWeight, initialMealType, initialFoodSource, isOpen]);

  if (!isOpen || !topicType) return null;

  const handleSend = () => {
    let structuredText = '';
    let mediaType: 'text' | 'video_check' = 'text';

    if (topicType === 'cargas') {
      const feelingText = effortFeeling === 'EASY' ? 'me resultó muy ligera (RPE < 7)' : effortFeeling === 'OPTIMAL' ? 'se sintió en el punto óptimo (RPE 8)' : 'estuvo al límite máximo (RPE 9.5)';
      const goalText = loadGoal === 'UP' ? '¿Podemos subir 2.5 - 5 kg?' : loadGoal === 'MAINTAIN' ? '¿Consolidamos este peso una semana más?' : '¿Reajustamos o descargamos un poco?';
      structuredText = `🏋️ Consulta de Cargas — ${selectedExercise} (${currentWeight} kg): La última serie ${feelingText}. ${goalText}`;
    } else if (topicType === 'video') {
      mediaType = 'video_check';
      structuredText = `🎥 Video de ${selectedExercise} enviado para corrección de técnica (Foco: ${videoFocus.toLowerCase()}).`;
    } else if (topicType === 'nutricion') {
      structuredText = `🥗 Smart Swap (${mealType}): Deseo cambiar ${foodSource} por ${foodTarget} manteniendo la equivalencia de macros e isocalórica. ¿Cómo lo ajustamos?`;
    } else if (topicType === 'dolor') {
      structuredText = `🩹 Reporte de Molestia (${painLevel}/10 en ${bodyPart}): Siento molestia ${painMoment}. Activo protocolo preventivo y solicito ejercicio sustituto seguro.`;
    } else if (topicType === 'nivel') {
      const aspectMap = {
        PESO: 'subir los pesos base de los ejercicios principales',
        VOLUMEN: 'sumar series efectivas semanales',
        MENOS_DESCANSO: 'reducir los tiempos de descanso entre series',
        TECNICAS: 'incorporar técnicas de intensidad (drop sets, pausas isométricas)'
      };
      structuredText = `⚡ Solicitud de Nivel: Siento que el plan actual me resulta muy accesible. Me gustaría ${aspectMap[levelAspect]}.`;
    } else if (topicType === 'fatiga') {
      const fatigueMap = {
        SUEÑO: 'pocas horas de sueño reparador',
        MUSCULAR: 'acumulación de fatiga y agujetas musculares (DOMS)',
        ESTRES: 'alta carga de estrés y trabajo'
      };
      structuredText = `😴 Reporte de Fatiga (Readiness ${readinessScore}%): Hoy me levanté con ${fatigueMap[fatigueSource]}. ¿Hacemos sesión de movilidad/recuperación activa o descanso total?`;
    } else if (topicType === 'foto') {
      structuredText = `📸 Foto de control subida a la Galería para tu revisión periódica.`;
    }

    onSendMessage(structuredText, mediaType, topicType);
    toast.success('¡Consulta enviada al Coach!', { icon: '✨' });
    if (navigator.vibrate) navigator.vibrate([25]);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
                {topicType === 'cargas' && '🏋️'}
                {topicType === 'video' && '🎥'}
                {topicType === 'nutricion' && '🥗'}
                {topicType === 'dolor' && '🩹'}
                {topicType === 'nivel' && '⚡'}
                {topicType === 'fatiga' && '😴'}
                {topicType === 'foto' && '📸'}
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white leading-tight">
                  {topicType === 'cargas' && 'Ajustar Cargas & Pesos'}
                  {topicType === 'video' && 'Validación Biomecánica'}
                  {topicType === 'nutricion' && 'Smart Swap & Macros'}
                  {topicType === 'dolor' && 'Reportar Molestia Articular'}
                  {topicType === 'nivel' && 'Subir Intensidad / Nivel'}
                  {topicType === 'fatiga' && 'Fatiga & Readiness'}
                  {topicType === 'foto' && 'Foto de Control Periódica'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {topicType === 'cargas' || topicType === 'video' ? `Vinculado al módulo de Entrenamiento` : topicType === 'nutricion' ? `Vinculado al módulo de Nutrición` : `Respuesta estructurada para ${coachName.split(' ')[0]}`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-left">
            
            {/* ─── 1. CARGAS (MODULO ENTRENAMIENTO) ─── */}
            {topicType === 'cargas' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-montserrat">
                    Ejercicio en Curso
                  </label>
                  <select
                    value={selectedExercise}
                    onChange={e => setSelectedExercise(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {!EXERCISES_LIST.includes(selectedExercise) && (
                      <option value={selectedExercise}>{selectedExercise}</option>
                    )}
                    {EXERCISES_LIST.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Peso Actual (kg)</label>
                    <input
                      type="number"
                      value={currentWeight}
                      onChange={e => setCurrentWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-900 dark:text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Propuesta al Coach</label>
                    <select
                      value={loadGoal}
                      onChange={e => setLoadGoal(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white mt-1"
                    >
                      <option value="UP">Subir +2.5 / +5 kg 🚀</option>
                      <option value="MAINTAIN">Mantener y afianzar 🎯</option>
                      <option value="DOWN">Descargar -5 kg 🛡️</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">¿Cómo sentiste la última serie pesada?</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEffortFeeling('EASY')}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        effortFeeling === 'EASY' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-600'
                      }`}
                    >
                      ⚡ Muy Ligera
                    </button>
                    <button
                      type="button"
                      onClick={() => setEffortFeeling('OPTIMAL')}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        effortFeeling === 'OPTIMAL' ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-600'
                      }`}
                    >
                      🎯 Óptima (RPE 8)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEffortFeeling('HARD')}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        effortFeeling === 'HARD' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-600'
                      }`}
                    >
                      🔥 Al Límite
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 2. TÉCNICA EN VIDEO (MODULO ENTRENAMIENTO) ─── */}
            {topicType === 'video' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-montserrat">
                    Ejercicio a Validar
                  </label>
                  <select
                    value={selectedExercise}
                    onChange={e => setSelectedExercise(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {!EXERCISES_LIST.includes(selectedExercise) && (
                      <option value={selectedExercise}>{selectedExercise}</option>
                    )}
                    {EXERCISES_LIST.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Punto de interés biomecánico</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'PROFUNDIDAD', label: 'Profundidad & Rango' },
                      { id: 'ESPALDA', label: 'Alineación de Columna' },
                      { id: 'RITMO', label: 'Tempo & Excéntrico' },
                      { id: 'GENERAL', label: 'Revisión General' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setVideoFocus(item.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                          videoFocus === item.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Video size={16} className="text-indigo-600 shrink-0" />
                  <span>El video de tu serie en <strong>{selectedExercise}</strong> se enviará directamente a la bandeja del coach para resolución y feedback.</span>
                </div>
              </div>
            )}

            {/* ─── 3. NUTRICION & SMART SWAP (MODULO NUTRICION) ─── */}
            {topicType === 'nutricion' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-montserrat">
                    Momento del Día
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Desayuno', 'Almuerzo', 'Merienda', 'Cena'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMealType(m)}
                        className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          mealType === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 text-slate-600'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Alimento Original en Plan</label>
                    <input
                      type="text"
                      value={foodSource}
                      onChange={e => setFoodSource(e.target.value)}
                      placeholder="Ej: 150g Arroz"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400">Deseo Cambiar Por</label>
                    <input
                      type="text"
                      value={foodTarget}
                      onChange={e => setFoodTarget(e.target.value)}
                      placeholder="Ej: 200g Papa / Quinoa"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white mt-1"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  💡 El motor <strong>Smart Swap</strong> calcula la equivalencia isocalórica para que mantengas tus macros diarios intactos al cambiar este alimento.
                </p>
              </div>
            )}

            {/* ─── 4. MOLESTIA ARTICULAR (FIREWALL) ─── */}
            {topicType === 'dolor' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-montserrat">
                    Zona de la Molestia
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Hombro', 'Rodilla', 'Espalda Baja', 'Codo', 'Muñeca', 'Cadera'].map(part => (
                      <button
                        key={part}
                        type="button"
                        onClick={() => setBodyPart(part)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          bodyPart === part ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 text-slate-600'
                        }`}
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                    <span>Intensidad del Dolor (Escala EVA)</span>
                    <span className="text-rose-600 font-black text-xs">{painLevel} / 10</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={painLevel}
                    onChange={e => setPainLevel(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400">
                    <span>Leve (1-3)</span>
                    <span>Moderado (4-6)</span>
                    <span>Severo (7-10)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">¿Cuándo se presenta?</label>
                  <input
                    type="text"
                    value={painMoment}
                    onChange={e => setPainMoment(e.target.value)}
                    placeholder="Ej: Al bajar la barra, al terminar la serie..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* ─── 5. SUBIR NIVEL ─── */}
            {topicType === 'nivel' && (
              <div className="space-y-3.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-montserrat">
                  ¿Cómo te gustaría aumentar el estímulo?
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'PESO', title: 'Subir Pesos Base', desc: 'Aumentar kilos en ejercicios principales (+5%)' },
                    { id: 'VOLUMEN', title: 'Más Series Efectivas', desc: 'Agregar 1 serie extra por grupo muscular' },
                    { id: 'MENOS_DESCANSO', title: 'Mayor Densidad', desc: 'Reducir descansos para elevar estrés metabólico' },
                    { id: 'TECNICAS', title: 'Técnicas Avanzadas', desc: 'Añadir Drop Sets o Pausas Isométricas' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLevelAspect(item.id as any)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        levelAspect === item.id ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-black font-montserrat">{item.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">{item.desc}</p>
                      </div>
                      {levelAspect === item.id && <Check size={16} className="text-amber-500 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 6. FATIGA / READINESS ─── */}
            {topicType === 'fatiga' && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-montserrat">
                    Causa Principal de la Fatiga
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'MUSCULAR', label: 'Cansancio Muscular' },
                      { id: 'SUEÑO', label: 'Poco Sueño' },
                      { id: 'ESTRES', label: 'Estrés / Trabajo' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFatigueSource(item.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                          fatigueSource === item.id ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 text-slate-600'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                    <span>Nivel de Batería / Readiness Estimado</span>
                    <span className="text-purple-600 font-black text-xs">{readinessScore}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    value={readinessScore}
                    onChange={e => setReadinessScore(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* ─── 7. FOTO DE CONTROL (NOTIFICACION DIRECTA) ─── */}
            {topicType === 'foto' && (
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                <Camera size={32} className="text-indigo-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Notificar al Coach sobre nueva foto en Galería
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Se enviará un aviso confidencial a la bandeja de Leandro para que revise tu última foto de progreso corporal y haga un análisis comparativo.
                </p>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancelar
            </button>

            <button
              onClick={handleSend}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
              <Send size={13} />
              <span>{topicType === 'foto' ? 'Enviar Notificación al Coach' : 'Enviar al Coach'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

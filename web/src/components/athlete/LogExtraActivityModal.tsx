import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Check, Flame, Activity, Clock, Zap, Heart, Sparkles, 
  MessageSquare, Compass, Trophy, Calendar, Repeat, User, MapPin
} from 'lucide-react';
import { useExecutionStore } from '../../stores/useExecutionStore';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useAgendaStore, type RecurringClass } from '../../stores/useAgendaStore';
import toast from 'react-hot-toast';

export interface LogExtraActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClass?: RecurringClass | null;
}

export type ExtraActivityType = 
  | 'RUNNING' 
  | 'CROSSFIT' 
  | 'YOGA' 
  | 'PILATES' 
  | 'CYCLING' 
  | 'PADEL' 
  | 'SWIMMING' 
  | 'FUNCTIONAL' 
  | 'BOXING' 
  | 'FOOTBALL' 
  | 'OTHER';

interface ActivityOption {
  id: ExtraActivityType;
  label: string;
  emoji: string;
  color: string;
  defaultMinutes: number;
  defaultRpe: number;
}

const ACTIVITIES: ActivityOption[] = [
  { id: 'CROSSFIT', label: 'CrossFit / WOD', emoji: '🏋️', color: 'from-amber-500 to-rose-500', defaultMinutes: 50, defaultRpe: 8 },
  { id: 'RUNNING', label: 'Running / Trote', emoji: '🏃', color: 'from-sky-500 to-indigo-500', defaultMinutes: 40, defaultRpe: 7 },
  { id: 'YOGA', label: 'Yoga / Movilidad', emoji: '🧘', color: 'from-emerald-500 to-teal-500', defaultMinutes: 45, defaultRpe: 4 },
  { id: 'FUNCTIONAL', label: 'Clase Funcional', emoji: '🔥', color: 'from-orange-500 to-amber-500', defaultMinutes: 45, defaultRpe: 7 },
  { id: 'PADEL', label: 'Pádel / Tenis', emoji: '🎾', color: 'from-lime-500 to-emerald-500', defaultMinutes: 60, defaultRpe: 6 },
  { id: 'CYCLING', label: 'Spinning / Bici', emoji: '🚴', color: 'from-cyan-500 to-blue-500', defaultMinutes: 45, defaultRpe: 7 },
  { id: 'SWIMMING', label: 'Natación', emoji: '🏊', color: 'from-blue-500 to-indigo-500', defaultMinutes: 45, defaultRpe: 6 },
  { id: 'PILATES', label: 'Pilates', emoji: '🩰', color: 'from-purple-500 to-pink-500', defaultMinutes: 50, defaultRpe: 5 },
  { id: 'BOXING', label: 'Boxeo / Artes M.', emoji: '🥊', color: 'from-rose-500 to-red-500', defaultMinutes: 50, defaultRpe: 8 },
  { id: 'FOOTBALL', label: 'Fútbol / Equipos', emoji: '⚽', color: 'from-emerald-500 to-sky-500', defaultMinutes: 60, defaultRpe: 7 },
  { id: 'OTHER', label: 'Otra Actividad', emoji: '⚡', color: 'from-indigo-500 to-purple-500', defaultMinutes: 40, defaultRpe: 6 },
];

const DAYS_OF_WEEK = [
  { day: 1, label: 'L', name: 'Lunes' },
  { day: 2, label: 'M', name: 'Martes' },
  { day: 3, label: 'X', name: 'Miércoles' },
  { day: 4, label: 'J', name: 'Jueves' },
  { day: 5, label: 'V', name: 'Viernes' },
  { day: 6, label: 'S', name: 'Sábado' },
  { day: 0, label: 'D', name: 'Domingo' },
];

export const LogExtraActivityModal: React.FC<LogExtraActivityModalProps> = ({ 
  isOpen, 
  onClose,
  initialClass
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ExtraActivityType>('CROSSFIT');
  const [durationMinutes, setDurationMinutes] = useState<number>(50);
  const [rpe, setRpe] = useState<number>(8);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  
  // Opciones de Clase Recurrente / Fija en Agenda
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);
  const [classTime, setClassTime] = useState<string>('19:00');
  const [instructorName, setInstructorName] = useState<string>('Prof. Marcos');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { awardXP, recordProgress } = useGamificationStore();
  const { addRecurringClass } = useAgendaStore();

  // Si se abre con una clase específica
  useEffect(() => {
    if (initialClass) {
      const act = ACTIVITIES.find(a => a.id === initialClass.activityType as ExtraActivityType);
      if (act) setSelectedActivity(act.id);
      setDurationMinutes(initialClass.durationMinutes || 45);
      setInstructorName(initialClass.instructorName || '');
      setClassTime(initialClass.time || '19:00');
      setSelectedDays(initialClass.daysOfWeek || [1, 3, 5]);
    }
  }, [initialClass, isOpen]);

  if (!isOpen) return null;

  const currentOption = ACTIVITIES.find(a => a.id === selectedActivity) || ACTIVITIES[0];
  const isSwimming = selectedActivity === 'SWIMMING';
  const hasDistance = ['RUNNING', 'CYCLING', 'SWIMMING', 'PADEL', 'FOOTBALL', 'OTHER'].includes(selectedActivity);

  const internalLoad = durationMinutes * rpe; // TRIMP / Foster Session RPE Load (AU)
  const xpEarned = Math.min(60, Math.max(20, Math.round((durationMinutes / 10) * 5 + rpe * 2)));

  const handleSelectActivity = (act: ActivityOption) => {
    setSelectedActivity(act.id);
    setDurationMinutes(act.defaultMinutes);
    setRpe(act.defaultRpe);
    if (act.id === 'CROSSFIT') setInstructorName('Prof. Marcos');
    else if (act.id === 'YOGA') setInstructorName('Prof. Sofía');
    else if (act.id === 'RUNNING') setInstructorName('Coach Lucas');
    else if (act.id === 'FUNCTIONAL') setInstructorName('Prof. Julieta');
  };

  const toggleDay = (d: number) => {
    setSelectedDays(prev => 
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  const getRpeDescription = (val: number) => {
    if (val <= 3) return { text: 'Muy Suave / Regenerativo', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' };
    if (val <= 5) return { text: 'Moderado / Controlado', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' };
    if (val <= 7) return { text: 'Exigente / Sudor Intenso', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' };
    if (val <= 9) return { text: 'Muy Duro / Cerca del Límite', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' };
    return { text: 'Máximo Esfuerzo / Fatiga Total', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' };
  };

  const rpeInfo = getRpeDescription(rpe);

  // Cálculo de Ritmo en vivo
  let paceDisplay = '';
  if (isSwimming && distanceMeters > 0) {
    const totalSecs = durationMinutes * 60;
    const pace100mSecs = (totalSecs / distanceMeters) * 100;
    const paceMins = Math.floor(pace100mSecs / 60);
    const paceRemSecs = Math.round(pace100mSecs % 60);
    paceDisplay = `Ritmo: ${paceMins}:${String(paceRemSecs).padStart(2, '0')} min/100m`;
  } else if (!isSwimming && distanceKm > 0) {
    const paceMinsDecimal = durationMinutes / distanceKm;
    const paceMins = Math.floor(paceMinsDecimal);
    const paceSecs = Math.round((paceMinsDecimal - paceMins) * 60);
    paceDisplay = `Ritmo: ${paceMins}:${String(paceSecs).padStart(2, '0')} min/km`;
  }

  const handleSubmit = () => {
    setIsSubmitting(true);

    try {
      // 1. Otorgar XP al atleta
      awardXP('WORKOUT_LOG', xpEarned);

      // 2. Registrar en Gamificación / Squad
      recordProgress({
        source: 'WORKOUT_COMPLETE',
        value: 1,
        clientId: 'me',
      });

      // 3. Si se marcó como clase fija / recurrente, guardar en Agenda
      if (isRecurring && selectedDays.length > 0) {
        addRecurringClass({
          title: `Clase de ${currentOption.label}`,
          instructorName: instructorName.trim() || 'Profesor a cargo',
          daysOfWeek: selectedDays,
          time: classTime,
          durationMinutes,
          activityType: selectedActivity
        });
      }

      // 4. Emitir eventos de telemetría y hábitos
      window.dispatchEvent(new CustomEvent('xp:award', {
        detail: { source: 'extra_workout', amount: xpEarned }
      }));

      window.dispatchEvent(new CustomEvent('habit:complete_category', {
        detail: { category: 'FITNESS' }
      }));

      const distanceText = isSwimming && distanceMeters > 0 
        ? ` (${distanceMeters}m)` 
        : distanceKm > 0 
        ? ` (${distanceKm} km)` 
        : '';

      const recurringMsg = isRecurring ? ' y agendada como fija' : '';
      toast.success(
        `¡${currentOption.label} registrada${distanceText}${recurringMsg}! Ganaste +${xpEarned} XP 🏆`, 
        { duration: 4500 }
      );

      setIsSubmitting(false);
      onClose();
    } catch (e) {
      toast.error('Error al guardar la actividad');
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#0c0e17] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden my-auto font-lato"
        >
          {/* Header con Isotipo y Cierre */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20">
                {currentOption.emoji}
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Registrar Actividad o Clase
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  CrossFit, Running, Natación, Yoga o Deportes
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. SELECCIÓN DE ACTIVIDAD / DISCIPLINA */}
            <div>
              <label className="text-[11px] font-black font-montserrat uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                1. ¿Qué actividad realizaste hoy?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACTIVITIES.map((act) => {
                  const isSelected = selectedActivity === act.id;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleSelectActivity(act)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-950 dark:text-white shadow-xs font-black'
                          : 'bg-slate-50/70 dark:bg-zinc-900/40 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 font-bold'
                      }`}
                    >
                      <span className="text-lg">{act.emoji}</span>
                      <span className="text-xs truncate">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. DURACIÓN EN MINUTOS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black font-montserrat uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock size={13} className="text-indigo-500" />
                  <span>2. Duración de la sesión</span>
                </label>
                <span className="text-xs font-black font-montserrat text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-200/80 dark:border-indigo-800">
                  {durationMinutes} minutos
                </span>
              </div>

              {/* Botones rápidos de minutos */}
              <div className="flex gap-2 mb-2">
                {[20, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={10}
                max={150}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* 3. DISTANCIA OPCIONAL (PARA RUNNING, NATACIÓN, CICLISMO, ETC.) */}
            {hasDistance && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black font-montserrat uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin size={13} className="text-indigo-600 dark:text-indigo-400" />
                    <span>3. Distancia Recorrida (Opcional)</span>
                  </label>
                  {paceDisplay && (
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                      {paceDisplay}
                    </span>
                  )}
                </div>

                {isSwimming ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {[500, 1000, 1500, 2000].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setDistanceMeters(m)}
                          className={`flex-1 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            distanceMeters === m
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5'
                          }`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="50"
                        min="0"
                        value={distanceMeters || ''}
                        onChange={(e) => setDistanceMeters(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="Metros nadados (ej: 1250)"
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">metros</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {[3, 5, 8, 10, 21].map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => setDistanceKm(km)}
                          className={`flex-1 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            distanceKm === km
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-white/5'
                          }`}
                        >
                          {km}k
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={distanceKm || ''}
                        onChange={(e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="Kilómetros recorridos (ej: 5.4)"
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">km</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. ESFUERZO PERCIBIDO (RPE 1-10) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black font-montserrat uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Flame size={13} className="text-rose-500" />
                  <span>4. Intensidad / Esfuerzo (RPE)</span>
                </label>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${rpeInfo.badge}`}>
                  {rpe}/10 • {rpeInfo.text}
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={rpe}
                onChange={(e) => setRpe(parseInt(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
                <span>1: Muy Fácil</span>
                <span>5: Moderado</span>
                <span>10: Al Límite</span>
              </div>
            </div>

            {/* 5. FIJAR ESTA CLASE EN AGENDA SEMANAL */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Repeat size={15} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                      ¿Esta clase es fija en tu semana?
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Cargar automáticamente en tu Agenda semanal
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isRecurring} 
                    onChange={(e) => setIsRecurring(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-white/5"
                >
                  {/* Selector de Días de la semana */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                      Días que asistes:
                    </span>
                    <div className="flex gap-1.5">
                      {DAYS_OF_WEEK.map((d) => {
                        const isDaySelected = selectedDays.includes(d.day);
                        return (
                          <button
                            key={d.day}
                            type="button"
                            onClick={() => toggleDay(d.day)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isDaySelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/5'
                            }`}
                            title={d.name}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horario y Profesor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Horario de inicio:
                      </span>
                      <input
                        type="time"
                        value={classTime}
                        onChange={(e) => setClassTime(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Profesor / Coach de la clase:
                      </span>
                      <input
                        type="text"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        placeholder="Ej: Prof. Marcos"
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 6. NOTA O DETALLE PARA EL COACH */}
            <div>
              <label className="text-[11px] font-black font-montserrat uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                <span>6. Notas o Sensaciones (Opcional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: WOD con mucho trabajo de hombros, buenas sensaciones..."
                rows={2}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* RESUMEN DE IMPACTO PEDAGÓGICO */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-rose-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                    Impacto en Carga & XP
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Carga Interna: <strong>{internalLoad} AU</strong> • Recompensa: <strong>+{xpEarned} XP</strong>
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800 px-2.5 py-1 rounded-xl shadow-xs border border-indigo-100 dark:border-white/5">
                +1 Entrenamiento
              </span>
            </div>
          </div>

          {/* Footer con Botón de Guardado */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-black/20 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:opacity-95 text-white font-montserrat font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              <span>Guardar {isRecurring ? 'y Agendar Clase' : 'Actividad Extra'} (+{xpEarned} XP)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

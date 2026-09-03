import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Sparkles, ArrowRight, CheckCircle2, Clock, Calendar, Dumbbell, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TargetAudience {
  id: string;
  name: string;
  icon: string;
  count: string;
  discipline?: string;
  schedule?: string;
}

interface CreateClassGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassCreated: (newAudience: TargetAudience) => void;
}

const DISCIPLINE_PRESETS = [
  { id: 'fuerza', label: 'Fuerza & Musculación', icon: '🏋️' },
  { id: 'crossfit', label: 'CrossFit & WOD', icon: '⚡' },
  { id: 'running', label: 'Running & Atletismo', icon: '🏃' },
  { id: 'yoga', label: 'Yoga & Movilidad', icon: '🧘' },
  { id: 'pilates', label: 'Pilates & Postura', icon: '🤸' },
  { id: 'boxeo', label: 'Boxeo & Artes Marciales', icon: '🥊' },
  { id: 'spinning', label: 'Spinning & Ciclismo', icon: '🚴' },
  { id: 'calistenia', label: 'Calistenia & Bodyweight', icon: '🤸‍♂️' },
  { id: 'natacion', label: 'Natación & Aqua', icon: '🏊' },
  { id: 'padel', label: 'Pádel & Raqueta', icon: '🎾' },
  { id: 'habitos', label: 'Hábitos & Bienestar', icon: '🔥' },
  { id: 'nutricion', label: 'Nutrición Grupal', icon: '🥗' },
  { id: 'custom', label: 'Personalizada (+ Crear)', icon: '✨' }
];

const CUSTOM_ICONS = ['✨', '🦁', '🐺', '⚔️', '💎', '👑', '🚀', '🎯', '🔥', '💪', '🥊', '🚴'];

const SCHEDULE_SUGGESTIONS = [
  'Lunes, Mié y Vie • 19:00 hs',
  'Martes y Jueves • 08:00 hs',
  'Sábados • 09:00 hs (Outdoor)',
  'Lunes a Viernes • Turno Tarde',
  'Horario Flexible / Online'
];

export const CreateClassGroupModal: React.FC<CreateClassGroupModalProps> = ({
  isOpen,
  onClose,
  onClassCreated
}) => {
  const [className, setClassName] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState(DISCIPLINE_PRESETS[0].id);
  const [customDisciplineName, setCustomDisciplineName] = useState('');
  const [customIcon, setCustomIcon] = useState('✨');
  const [schedule, setSchedule] = useState(SCHEDULE_SUGGESTIONS[0]);
  const [estimatedAthletes, setEstimatedAthletes] = useState(12);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isCustom = selectedDiscipline === 'custom';
  const currentDisciplineObj = DISCIPLINE_PRESETS.find(d => d.id === selectedDiscipline) || DISCIPLINE_PRESETS[0];
  const effectiveIcon = isCustom ? customIcon : currentDisciplineObj.icon;
  const effectiveDisciplineLabel = isCustom 
    ? (customDisciplineName.trim() || 'Disciplina Personalizada')
    : currentDisciplineObj.label;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = className.trim() || `Clase ${effectiveDisciplineLabel}`;

    const newAudience: TargetAudience = {
      id: `class_${Date.now()}`,
      name: `${finalName} (${schedule.split('•')[1]?.trim() || schedule})`,
      icon: effectiveIcon,
      count: `${estimatedAthletes} atletas`,
      discipline: effectiveDisciplineLabel,
      schedule: schedule
    };

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClassCreated(newAudience);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xl font-bold">
                {effectiveIcon}
              </div>
              <div>
                <h3 className="text-lg font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Crear Nueva Clase o Grupo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fuerza, CrossFit, Running, Yoga, Pilates o disciplina personalizada
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {isSuccess ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-500/30"
              >
                <CheckCircle2 size={36} />
              </motion.div>
              <h4 className="text-2xl font-black font-montserrat text-slate-900 dark:text-white mb-2">
                ¡Clase Creada con Éxito!
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                El grupo ha sido agregado y seleccionado como destinatario del desafío actual.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* 1. Disciplina */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    1. Disciplina / Tipo de Clase
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {DISCIPLINE_PRESETS.length} opciones disponibles
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DISCIPLINE_PRESETS.map((disc) => (
                    <button
                      type="button"
                      key={disc.id}
                      onClick={() => setSelectedDiscipline(disc.id)}
                      className={`p-2.5 rounded-2xl text-xs font-bold text-left border transition-all flex items-center gap-2 ${
                        selectedDiscipline === disc.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-500/30'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base shrink-0">{disc.icon}</span>
                      <span className="truncate">{disc.label.split('&')[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-formulario si es Personalizada */}
                {isCustom && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-500/20 space-y-3"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Nombre de la Disciplina Personalizada
                      </label>
                      <input
                        type="text"
                        value={customDisciplineName}
                        onChange={(e) => setCustomDisciplineName(e.target.value)}
                        placeholder="Ej: Kettlebells Élite, Bootcamp Militar, Hipopresivos..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500/30 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Elige un Emblema / Icono
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {CUSTOM_ICONS.map((ico) => (
                          <button
                            type="button"
                            key={ico}
                            onClick={() => setCustomIcon(ico)}
                            className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-all ${
                              customIcon === ico
                                ? 'bg-indigo-600 text-white scale-110 shadow-md shadow-indigo-600/30'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {ico}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 2. Nombre de la Clase */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  2. Nombre del Grupo / Clase
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder={`Ej: Clase ${effectiveDisciplineLabel} 19:00 hs...`}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 3. Horario & Días */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  3. Días y Horarios
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500 mb-2"
                />

                {/* Sugerencias Rápidas de Horarios */}
                <div className="flex flex-wrap gap-1.5">
                  {SCHEDULE_SUGGESTIONS.slice(0, 3).map((sugg) => (
                    <button
                      type="button"
                      key={sugg}
                      onClick={() => setSchedule(sugg)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 transition-colors"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Cantidad de Alumnos Estimada */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  4. Capacidad / Alumnos Estimados
                </label>
                <div className="flex items-center gap-2.5">
                  {[8, 12, 18, 25, 35].map((count) => (
                    <button
                      type="button"
                      key={count}
                      onClick={() => setEstimatedAthletes(count)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                        estimatedAthletes === count
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-bold ml-1">alumnos</span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>Crear y Seleccionar</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

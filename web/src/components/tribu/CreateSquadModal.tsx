import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Sparkles, ArrowRight, CheckCircle2, Shield, HeartHandshake } from 'lucide-react';
import { useTribuStore } from '../../stores/useTribuStore';
import confetti from 'canvas-confetti';

interface CreateSquadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSquadCreated?: (squadName: string) => void;
}

const SQUAD_ICONS = ['🛡️', '⚡', '🔥', '🦁', '🐺', '⚔️', '🦅', '💎', '🚀', '👑'];

const SQUAD_SUGGESTIONS = [
  'Escuadrón Titanes',
  'Tribu Imparable',
  'Team Madrugadores',
  'Guerreros del Gym',
  'Compañeros de Racha',
  'Los Espartanos',
  'Fuerza & Foco'
];

export const CreateSquadModal: React.FC<CreateSquadModalProps> = ({
  isOpen,
  onClose,
  onSquadCreated
}) => {
  const { squadName, members } = useTribuStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🛡️');
  const [selectedDiscipline, setSelectedDiscipline] = useState('Fuerza & Hábitos');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `${selectedIcon} ${SQUAD_SUGGESTIONS[0]}`;
    
    // Actualizar nombre del squad en el store
    useTribuStore.setState({
      squadName: finalName,
      squadLevel: 1,
      squadXP: 100,
      squadMultiplier: 1.2
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      if (onSquadCreated) onSquadCreated(finalName);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white font-lato"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg">
                {selectedIcon}
              </div>
              <div>
                <h3 className="text-lg font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Crear Mi Escuadrón / Squad
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Forma tu micro-tribu para entrenar y competir en equipo
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
                ¡Escuadrón Creado con Éxito!
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Tu tribu está lista. Ahora invita a tus amigos o compañeros para empezar a ganar XP juntos.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {/* Selector de Icono */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Elige el Emblema del Escuadrón
                </label>
                <div className="flex flex-wrap gap-2">
                  {SQUAD_ICONS.map((icon) => (
                    <button
                      type="button"
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-10 h-10 rounded-2xl text-lg flex items-center justify-center transition-all ${
                        selectedIcon === icon
                          ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre del Squad */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre del Escuadrón
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Escuadrón Titanes, Tribu de Acero..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
                />

                {/* Sugerencias Rápidas */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SQUAD_SUGGESTIONS.slice(0, 4).map((sugg) => (
                    <button
                      type="button"
                      key={sugg}
                      onClick={() => setName(sugg)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 transition-colors"
                    >
                      + {sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disciplina Principal */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Enfoque / Disciplina
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Fuerza & Gym 🏋️', 'Running & Cardio 🏃', 'Hábitos & Salud 🔥'].map((disc) => (
                    <button
                      type="button"
                      key={disc}
                      onClick={() => setSelectedDiscipline(disc)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                        selectedDiscipline === disc
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {disc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beneficio Pedagógico */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Beneficio de Tribu:</strong> Al entrenar en escuadrón, todos los miembros ganan un <strong>multiplicador de racha (1.2x a 2.0x XP)</strong> y protegen su constancia diaria.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
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
                  <span>Crear Escuadrón</span>
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

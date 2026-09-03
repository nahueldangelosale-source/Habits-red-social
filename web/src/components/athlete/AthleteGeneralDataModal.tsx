import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Weight, Ruler, Target, Dumbbell, 
  Shield, CheckCircle2, Sparkles, Save, HeartPulse 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface AthleteGeneralDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSaved?: () => void;
}

export const AthleteGeneralDataModal: React.FC<AthleteGeneralDataModalProps> = ({
  isOpen,
  onClose,
  onDataSaved
}) => {
  const { user } = useAuth();

  const [weight, setWeight] = useState(() => localStorage.getItem('athlete-data-weight') || '82.5');
  const [height, setHeight] = useState(() => localStorage.getItem('athlete-data-height') || '178');
  const [goal, setGoal] = useState(() => localStorage.getItem('athlete-data-goal') || 'Hipertrofia & Fuerza');
  const [discipline, setDiscipline] = useState(() => localStorage.getItem('athlete-data-discipline') || 'Musculación & Funcional');
  const [experience, setExperience] = useState(() => localStorage.getItem('athlete-data-experience') || 'Intermedio (2 años)');
  const [coachName, setCoachName] = useState(() => localStorage.getItem('athlete-data-coach') || 'Leandro Usea (Sede Central)');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('athlete-data-weight', weight);
    localStorage.setItem('athlete-data-height', height);
    localStorage.setItem('athlete-data-goal', goal);
    localStorage.setItem('athlete-data-discipline', discipline);
    localStorage.setItem('athlete-data-experience', experience);
    localStorage.setItem('athlete-data-coach', coachName);

    window.dispatchEvent(new CustomEvent('athlete-data-updated'));
    toast.success('¡Datos del atleta guardados!', { icon: '📋' });

    if (onDataSaved) onDataSaved();
    onClose();
  };

  // Calculate BMI
  const numWeight = parseFloat(weight) || 0;
  const numHeight = (parseFloat(height) || 0) / 100;
  const bmi = numHeight > 0 ? (numWeight / (numHeight * numHeight)).toFixed(1) : '26.0';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md font-lato">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-md bg-white dark:bg-[#0c0f18] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  Ficha & Datos del Atleta
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Biometría, objetivos y disciplina activa
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {/* Biometría (Peso + Altura + IMC) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Weight size={12} className="text-indigo-500" />
                  <span>Peso Actual (kg)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-black font-mono focus:border-indigo-500 outline-none"
                  placeholder="82.5"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Ruler size={12} className="text-purple-500" />
                  <span>Altura (cm)</span>
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-black font-mono focus:border-indigo-500 outline-none"
                  placeholder="178"
                />
              </div>
            </div>

            {/* IMC Result Pill */}
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <HeartPulse size={14} className="text-indigo-600" />
                <span>Índice de Masa Corporal (IMC)</span>
              </span>
              <span className="font-black font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                {bmi} kg/m²
              </span>
            </div>

            {/* Objetivo Deportivo */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Target size={12} className="text-amber-500" />
                <span>Objetivo Principal</span>
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-indigo-500 outline-none"
              >
                <option value="Hipertrofia & Fuerza">💪 Ganar Músculo & Fuerza (Hipertrofia)</option>
                <option value="Pérdida de Grasa & Definición">🔥 Quemar Grasa & Definición</option>
                <option value="Rendimiento Deportivo">⚡ Rendimiento & Resistencia</option>
                <option value="Salud & Hábitos">🧘 Longevidad, Salud & Bienestar</option>
              </select>
            </div>

            {/* Disciplina */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Dumbbell size={12} className="text-emerald-500" />
                <span>Disciplina Principal</span>
              </label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-indigo-500 outline-none"
              >
                <option value="Musculación & Funcional">🏋️ Musculación & Hipertrofia</option>
                <option value="CrossFit & WODs">⚔️ CrossFit & Entrenamiento Funcional</option>
                <option value="Running & Atletismo">🏃 Running & Cardio</option>
                <option value="Powerlifting">🔥 Powerlifting & Fuerza Pura</option>
                <option value="Yoga & Calistenia">🧘 Yoga & Movilidad</option>
              </select>
            </div>

            {/* Coach Asignado */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Shield size={12} className="text-blue-500" />
                <span>Coach & Sede</span>
              </label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:border-indigo-500 outline-none"
                placeholder="Coach Leandro Usea"
              />
            </div>

            {/* Footer Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 mt-4"
            >
              <Save size={14} />
              <span>Guardar Ficha del Atleta</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

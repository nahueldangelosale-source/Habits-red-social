import React, { useState } from 'react';
import { useHabitStore, HABIT_CATALOG, type HabitDuration } from '../../stores/useHabitStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { Brain, Sparkles, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

export const HabitPrescriber: React.FC = () => {
  const { prescribeHabit, prescribedHabits, removeHabit } = useHabitStore();
  
  // En producción real, este ID vendría por prop o URL param del cliente seleccionado.
  // Para MVP usamos el active client del store global.
  const activeClientId = useOnboardingPTStore(state => state.identity.fullName) || 'unknown';

  const clientHabits = prescribedHabits.filter(h => h.clientId === activeClientId);
  
  const [selectedDuration, setSelectedDuration] = useState<HabitDuration>('1_MONTH');

  const DURATIONS: { value: HabitDuration; label: string }[] = [
    { value: '1_WEEK', label: '1 Semana' },
    { value: '1_MONTH', label: '1 Mes' },
    { value: '3_MONTHS', label: '3 Meses' },
    { value: 'INDEFINITE', label: 'Indefinido' }
  ];

  const handlePrescribe = (templateId: string) => {
    prescribeHabit(activeClientId, templateId, selectedDuration);
  };

  const isPrescribed = (templateId: string) => {
    return clientHabits.some(h => h.templateId === templateId);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Brain size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black font-montserrat text-slate-900">Protocolos de Prescripción</h2>
          <p className="text-xs font-lato text-slate-500">
            Catálogo cerrado de Hábitos (Cero Texto Libre) basado en Lally et al.
          </p>
        </div>
      </div>

      {clientHabits.length >= 3 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <p className="text-xs font-bold leading-relaxed">
            Sobrecarga Cognitiva Detectada: Prescribir más de 3 hábitos simultáneos reduce la adherencia absoluta según los principios de micro-hábitos.
          </p>
        </div>
      )}

      {/* Duración (Scope temporal) */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          <Clock size={12} /> Duración de la Intervención
        </label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map(d => (
            <button
              key={d.value}
              onClick={() => setSelectedDuration(d.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-montserrat transition-all ${
                selectedDuration === d.value
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* BUILD Category */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">
            <TrendingUp size={14} /> Fomentar Comportamiento (BUILD)
          </label>
          <div className="flex flex-wrap gap-2">
            {HABIT_CATALOG.filter(h => h.type === 'BUILD').map(habit => {
              const active = isPrescribed(habit.id);
              return (
                <button
                  key={habit.id}
                  onClick={() => active ? removeHabit(clientHabits.find(ch => ch.templateId === habit.id)!.id) : handlePrescribe(habit.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-lato transition-all border ${
                    active
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  {habit.title} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* BREAK Category */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-600 mb-3">
            <TrendingDown size={14} /> Deconstruir Comportamiento (BREAK)
          </label>
          <div className="flex flex-wrap gap-2">
            {HABIT_CATALOG.filter(h => h.type === 'BREAK').map(habit => {
              const active = isPrescribed(habit.id);
              return (
                <button
                  key={habit.id}
                  onClick={() => active ? removeHabit(clientHabits.find(ch => ch.templateId === habit.id)!.id) : handlePrescribe(habit.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-lato transition-all border ${
                    active
                      ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                >
                  {habit.title} {active && '✗'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-lato">
          <strong className="text-slate-600">{clientHabits.length}</strong> Hábitos activos prescritos.
        </span>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
          <Sparkles size={14} /> Actualizar Plan
        </button>
      </div>
    </div>
  );
};

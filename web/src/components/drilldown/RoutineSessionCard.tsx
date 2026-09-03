import React from 'react';
import { Activity, Check, AlertTriangle } from 'lucide-react';
import type { HydratedDay, HydratedItem, HydratedBlock, HydratedExercise } from '../../utils/RoutineHydrator';
import { useSessionLogStore } from '../../stores/useSessionLogStore';

interface RoutineSessionCardProps {
  day: HydratedDay;
  athleteId?: string;
  protocolId?: string;
}

export const RoutineSessionCard: React.FC<RoutineSessionCardProps> = ({ day, athleteId = '', protocolId = '' }) => {
  const { startSession, getSessionKey } = useSessionLogStore();
  const sessionKey = getSessionKey(athleteId, day.id);

  // Auto-start session when the card mounts (resume if exists)
  React.useEffect(() => {
    if (athleteId && protocolId) {
      startSession(athleteId, protocolId, day.id, day.name);
    }
  }, [athleteId, protocolId, day.id]);

  return (
    <div className="border-l-2 border-lime-400/30 pl-4 mb-8">
      <h4 className="text-lime-400 font-bold uppercase tracking-tighter mb-4 flex items-center gap-2">
        {day.name} <span className="text-[10px] opacity-40 font-mono">[{day.items.length} BLOQUES/EJERCICIOS]</span>
      </h4>
      <div className="space-y-4">
        {day.items.map((item, index) => (
          <RoutineItemRenderer key={`${item.type}-${index}`} item={item} sessionKey={sessionKey} />
        ))}
      </div>
    </div>
  );
};

const RoutineItemRenderer: React.FC<{ item: HydratedItem; sessionKey: string }> = ({ item, sessionKey }) => {
  if (item.type === 'BLOCK') {
    const block = item as HydratedBlock;
    return (
      <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-4">
        <h5 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
          <Activity size={14} /> {block.name}
        </h5>
        <div className="space-y-2 pl-2 border-l border-zinc-800/50">
          {block.items.map((ex, idx) => (
            <ExerciseRow key={idx} exercise={ex} sessionKey={sessionKey} />
          ))}
        </div>
      </div>
    );
  }

  return <ExerciseRow exercise={item as HydratedExercise} sessionKey={sessionKey} />;
};

const ExerciseRow: React.FC<{ exercise: HydratedExercise; sessionKey: string }> = ({ exercise, sessionKey }) => {
  const { logExercise, toggleComplete } = useSessionLogStore();
  
  // Read persisted state from the store (survives reloads)
  const exerciseLog = useSessionLogStore(
    (state) => state.activeSessions[sessionKey]?.exercises[exercise.exercise_id]
  );

  const isChecked = exerciseLog?.isCompleted || false;
  const actualWeight = exerciseLog?.actualWeight || '';
  const actualReps = exerciseLog?.actualReps || '';

  const handleWeightChange = (value: string) => {
    logExercise(sessionKey, exercise.exercise_id, { actualWeight: value });
  };

  const handleRepsChange = (value: string) => {
    logExercise(sessionKey, exercise.exercise_id, { actualReps: value });
  };

  const handleToggleCheck = () => {
    toggleComplete(sessionKey, exercise.exercise_id, exercise.weight || '', exercise.reps || '');
  };

  return (
    <div className={`bg-zinc-900/50 p-4 rounded-xl border transition-all ${isChecked ? 'border-lime-500/50 bg-lime-900/10 shadow-lg shadow-lime-900/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Info del Ejercicio */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold tracking-tight ${exercise.isFallback ? 'text-amber-500' : 'text-white'}`}>
              {exercise.name}
            </span>
            {exercise.isFallback && (
              <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <AlertTriangle size={10} /> Fallback
              </span>
            )}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase font-medium mt-0.5 flex gap-2">
            <span>{exercise.muscle_group}</span>
            <span>•</span>
            <span>{exercise.sets} Sets</span>
          </div>
        </div>

        {/* Carga Prescrita vs Log */}
        <div className="flex items-center gap-3">
          {/* Smart Defaults Input (Peso) */}
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Carga (kg)</span>
            <input 
              type="text" 
              value={actualWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder={exercise.weight || '0'}
              className={`w-16 bg-zinc-950 border rounded-md px-2 py-1.5 text-xs font-mono text-center outline-none transition-colors ${isChecked ? 'border-lime-500/30 text-lime-400' : 'border-zinc-800 text-white focus:border-indigo-500'}`}
            />
          </div>

          {/* Smart Defaults Input (Reps) */}
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Reps</span>
            <input 
              type="text" 
              value={actualReps}
              onChange={(e) => handleRepsChange(e.target.value)}
              placeholder={exercise.reps || '0'}
              className={`w-16 bg-zinc-950 border rounded-md px-2 py-1.5 text-xs font-mono text-center outline-none transition-colors ${isChecked ? 'border-lime-500/30 text-lime-400' : 'border-zinc-800 text-white focus:border-indigo-500'}`}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1">RPE</span>
            <div className="w-12 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-xs text-zinc-400 font-mono text-center cursor-not-allowed">
              {exercise.rpe || '-'}
            </div>
          </div>

          {/* Validation Action — Persisted Check */}
          <button 
            onClick={handleToggleCheck}
            className={`mt-4 ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isChecked ? 'bg-lime-500 text-zinc-950 shadow-[0_0_10px_rgba(132,204,22,0.4)] hover:bg-lime-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            <Check size={14} strokeWidth={isChecked ? 3 : 2} />
          </button>
        </div>

      </div>
    </div>
  );
};

// components/builders/CircuitCreatorModal.tsx
import React, { useState, useMemo } from 'react';
import { 
  X, 
  Zap, 
  Timer, 
  Flame, 
  Activity, 
  Dumbbell, 
  Thermometer, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  Paintbrush, 
  Plus, 
  Trash2,
  ChevronRight,
  Info
} from 'lucide-react';
import type { 
  CircuitBlockType, 
  CircuitGeneratedBlock, 
  CircuitGeneratorOptions, 
  Equipment, 
  EnergySystem,
  BiomechanicalCategory
} from '../../types/circuit.types';
import { 
  generateSmartCircuit, 
  validateCircuitBiomechanics,
  mapTaxonomyToMeta 
} from '../../utils/circuitGeneratorEngine';
import { EXERCISES_DATABASE, type ExerciseTaxonomy } from '../../data/exercisesData';

interface CircuitCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: CircuitBlockType;
  onSaveToVault?: (block: CircuitGeneratedBlock) => void;
  onActivateBrush?: (block: CircuitGeneratedBlock) => void;
  onInjectDirectly?: (block: CircuitGeneratedBlock) => void;
}

const MODALITY_CONFIGS: { type: CircuitBlockType; label: string; icon: React.ReactNode; desc: string; color: string; badge: string }[] = [
  { type: 'TABATA', label: 'Tabata (20s/10s)', icon: <Zap size={16} />, desc: '8 Rondas de máxima densidad y VO2 Máx', color: 'rose', badge: 'Alta Intensidad' },
  { type: 'EMOM', label: 'EMOM (Cada Minuto)', icon: <Timer size={16} />, desc: 'Intervalos fijos de potencia y resíntesis de PCr', color: 'indigo', badge: 'Potencia & Calidad' },
  { type: 'AMRAP', label: 'AMRAP (Máximas Rondas)', icon: <Flame size={16} />, desc: 'Time-Cap de tolerancia láctica y ritmo continuo', color: 'amber', badge: 'Capacidad de Trabajo' },
  { type: 'PHA_TRISERIE', label: 'PHA / Triserie Shunting', icon: <Activity size={16} />, desc: 'Alternancia Upper/Lower sin pausa para gasto cardíaco', color: 'emerald', badge: 'Flujo Sanguíneo' },
  { type: 'COMPLEX', label: 'Complejo Ininterrumpido', icon: <Dumbbell size={16} />, desc: 'Secuencia sin soltar el implemento (Javorek / Dan John)', color: 'purple', badge: 'TUT & Oclusión' },
  { type: 'RAMP_WARMUP', label: 'Calentamiento RAMP', icon: <Thermometer size={16} />, desc: '4 Fases: Raise, Activate, Mobilize, Potentiate', color: 'orange', badge: 'Higiene Articular' },
  { type: 'STANDARD', label: 'Circuito Estándar', icon: <Layers size={16} />, desc: 'Bloque tradicional de hipertrofia o core con descansos', color: 'blue', badge: 'Fuerza / Core' }
];

const EQUIPMENT_OPTIONS: { id: Equipment; label: string }[] = [
  { id: 'BARBELL', label: 'Barra Olímpica' },
  { id: 'DUMBBELL', label: 'Mancuernas' },
  { id: 'KETTLEBELL', label: 'Kettlebells' },
  { id: 'BODYWEIGHT', label: 'Peso Corporal' },
  { id: 'MACHINE', label: 'Máquinas / Poleas' },
  { id: 'BAND', label: 'Bandas / Minibands' }
];

export const CircuitCreatorModal: React.FC<CircuitCreatorModalProps> = ({
  isOpen,
  onClose,
  initialType = 'TABATA',
  onSaveToVault,
  onActivateBrush,
  onInjectDirectly
}) => {
  // Opciones del generador
  const [options, setOptions] = useState<CircuitGeneratorOptions>({
    blockType: initialType,
    availableEquipment: ['BODYWEIGHT', 'DUMBBELL', 'KETTLEBELL'],
    targetEnergySystem: 'GLYCOLYTIC',
    focusMuscles: ['UPPER_PUSH', 'LOWER_PUSH', 'CORE'],
    intensityLevel: 8,
    rounds: initialType === 'TABATA' ? 8 : (initialType === 'EMOM' ? 10 : 4),
    workTimeSec: initialType === 'TABATA' ? 20 : 40,
    restTimeSec: initialType === 'TABATA' ? 10 : 20,
    timeCapMin: 12
  });

  // Estado del bloque en edición
  const [currentBlock, setCurrentBlock] = useState<CircuitGeneratedBlock>(() => 
    generateSmartCircuit(options, EXERCISES_DATABASE)
  );

  // Buscador de ejercicios manual
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddExercise, setShowAddExercise] = useState(false);

  // Actualizar modalidad y regenerar
  const handleModalityChange = (type: CircuitBlockType) => {
    const updatedOptions: CircuitGeneratorOptions = {
      ...options,
      blockType: type,
      rounds: type === 'TABATA' ? 8 : (type === 'EMOM' ? 10 : (type === 'RAMP_WARMUP' ? 1 : 4)),
      workTimeSec: type === 'TABATA' ? 20 : 40,
      restTimeSec: type === 'TABATA' ? 10 : 20
    };
    setOptions(updatedOptions);
    const newBlock = generateSmartCircuit(updatedOptions, EXERCISES_DATABASE);
    setCurrentBlock(newBlock);
  };

  // Toggle de equipamiento
  const toggleEquipment = (eq: Equipment) => {
    const next = options.availableEquipment.includes(eq)
      ? options.availableEquipment.filter(e => e !== eq)
      : [...options.availableEquipment, eq];
    const safeNext = next.length === 0 ? ['BODYWEIGHT' as Equipment] : next;
    const updated = { ...options, availableEquipment: safeNext };
    setOptions(updated);
  };

  // Disparar Auto-Generación Inteligente
  const handleAutoGenerate = () => {
    const newBlock = generateSmartCircuit(options, EXERCISES_DATABASE);
    setCurrentBlock(newBlock);
  };

  // Agregar ejercicio manual
  const handleAddManualExercise = (ex: ExerciseTaxonomy) => {
    const meta = mapTaxonomyToMeta(ex);
    const newItem = {
      id: crypto.randomUUID(),
      exercise: meta,
      reps: '10-12',
      workTimeSec: options.workTimeSec || 40,
      restTimeSec: options.restTimeSec || 20
    };
    setCurrentBlock({
      ...currentBlock,
      exercises: [...currentBlock.exercises, newItem]
    });
    setShowAddExercise(false);
    setSearchQuery('');
  };

  // Eliminar ejercicio del circuito
  const handleRemoveExercise = (id: string) => {
    setCurrentBlock({
      ...currentBlock,
      exercises: currentBlock.exercises.filter(e => e.id !== id)
    });
  };

  // Telemetría y validación en vivo
  const validation = useMemo(() => {
    return validateCircuitBiomechanics(currentBlock);
  }, [currentBlock]);

  // Lista de ejercicios filtrados para agregar
  const searchResults = useMemo(() => {
    if (!searchQuery) return EXERCISES_DATABASE.slice(0, 10);
    const q = searchQuery.toLowerCase();
    return EXERCISES_DATABASE.filter(ex => 
      (ex.Nombre_Oficial || '').toLowerCase().includes(q) ||
      (ex.Musculo_Agonista || '').toLowerCase().includes(q) ||
      (ex.Patron_Movimiento || '').toLowerCase().includes(q)
    ).slice(0, 12);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Layers size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-white font-montserrat flex items-center gap-2">
                Generador Inteligente de Circuitos & Bloques
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">V1 Pro</span>
              </h2>
              <p className="text-xs text-slate-400 font-lato">
                Ensambla y valida bloques metabólicos respetando las 5 reglas de seguridad biomecánica.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo Dividido en 2 Columnas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Columna Izquierda: Parámetros del Motor (Pasos 1 & 2) */}
          <div className="w-full md:w-[380px] border-r border-slate-100 dark:border-slate-800 p-5 overflow-y-auto custom-scrollbar space-y-6 bg-slate-50/30 dark:bg-slate-900/30 shrink-0">
            
            {/* Paso 1: Modalidad */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
                Paso 1: Modalidad del Circuito
              </label>
              <div className="space-y-1.5">
                {MODALITY_CONFIGS.map(m => (
                  <button
                    key={m.type}
                    onClick={() => handleModalityChange(m.type)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      options.blockType === m.type
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${options.blockType === m.type ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        {m.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold font-montserrat truncate">{m.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{m.desc}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 shrink-0 ml-1">
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ajuste de Tiempos & Rondas */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                <span>Rondas / Vueltas:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">{options.rounds}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={options.rounds || 4}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setOptions({ ...options, rounds: val });
                  setCurrentBlock({ ...currentBlock, rounds: val });
                }}
                className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />

              {options.blockType === 'TABATA' && (
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/40">
                  <span>Trabajo: <b>20s</b></span>
                  <span>Descanso: <b>10s</b></span>
                  <span>Tiempo Total: <b>4:00 min</b></span>
                </div>
              )}

              {options.blockType === 'EMOM' && (
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/40">
                  <span>Intervalo: <b>60s</b></span>
                  <span>Trabajo sugerido: <b>15-20s</b></span>
                  <span>Total: <b>{options.rounds} min</b></span>
                </div>
              )}

              {options.blockType === 'AMRAP' && (
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>Time-Cap (Minutos):</span>
                    <span className="font-mono text-amber-600 font-black">{options.timeCapMin}m</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    step="1"
                    value={options.timeCapMin || 12}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setOptions({ ...options, timeCapMin: val });
                      setCurrentBlock({ ...currentBlock, timeCapMin: val });
                    }}
                    className="w-full accent-amber-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Paso 2: Equipamiento */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 block">
                Paso 2: Equipamiento Disponible
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENT_OPTIONS.map(eq => {
                  const isSelected = options.availableEquipment.includes(eq.id);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{eq.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón de Auto-Generación Inteligente */}
            <button
              onClick={handleAutoGenerate}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-black text-xs font-montserrat flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:opacity-95 active:scale-[0.99] transition-all"
            >
              <Sparkles size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
              ⚡ Auto-Ensamblaje Inteligente
            </button>
          </div>

          {/* Columna Derecha: Lienzo del Circuito & Telemetría (Pasos 3 & 4) */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
            
            {/* Header del Bloque en Edición */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex items-start justify-between">
              <div>
                <input 
                  type="text" 
                  value={currentBlock.name}
                  onChange={(e) => setCurrentBlock({ ...currentBlock, name: e.target.value })}
                  className="text-lg font-black text-slate-800 dark:text-white font-montserrat bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 outline-none w-full"
                />
                <input 
                  type="text" 
                  value={currentBlock.description}
                  onChange={(e) => setCurrentBlock({ ...currentBlock, description: e.target.value })}
                  className="text-xs text-slate-400 font-lato bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 outline-none w-full mt-1"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                  {currentBlock.rounds} {currentBlock.rounds === 1 ? 'Ronda' : 'Rondas'}
                </span>
              </div>
            </div>

            {/* Lista de Ejercicios Ensamblados */}
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Ejercicios en la Secuencia ({currentBlock.exercises.length})
                </span>
                <button
                  onClick={() => setShowAddExercise(!showAddExercise)}
                  className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> {showAddExercise ? 'Cerrar Buscador' : 'Añadir Ejercicio'}
                </button>
              </div>

              {/* Buscador de Ejercicios Integrado */}
              {showAddExercise && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 mb-3">
                  <input 
                    type="text"
                    placeholder="Buscar ejercicio para añadir al circuito..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-600 font-lato"
                  />
                  <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {searchResults.map(ex => (
                      <button
                        key={ex.ID_Ejercicio}
                        onClick={() => handleAddManualExercise(ex)}
                        className="text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between"
                      >
                        <span className="truncate">{ex.Nombre_Oficial}</span>
                        <Plus size={12} className="text-indigo-600 shrink-0 ml-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentBlock.exercises.map((item, idx) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 font-montserrat truncate">
                        {item.exercise.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span>Categoría: <b>{item.exercise.category}</b></span>
                        <span>•</span>
                        <span>Músculo: <b>{item.exercise.targetMuscle}</b></span>
                        {item.workTimeSec && (
                          <>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">TUT: {item.workTimeSec}s</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <input 
                      type="text" 
                      value={item.reps || ''}
                      placeholder="Reps/Tiempo"
                      onChange={(e) => {
                        const updated = currentBlock.exercises.map(ex => 
                          ex.id === item.id ? { ...ex, reps: e.target.value } : ex
                        );
                        setCurrentBlock({ ...currentBlock, exercises: updated });
                      }}
                      className="w-24 text-center text-xs font-bold font-mono px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-600"
                    />
                    <button
                      onClick={() => handleRemoveExercise(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                      title="Eliminar de la secuencia"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {currentBlock.exercises.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400">No hay ejercicios en la secuencia.</p>
                  <button
                    onClick={handleAutoGenerate}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    ⚡ Generar automáticamente
                  </button>
                </div>
              )}
            </div>

            {/* Consola de Telemetría Biomecánica */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-black font-montserrat">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <ShieldCheck size={16} className={validation.isValid ? 'text-emerald-500' : 'text-amber-500'} />
                  Telemetría y Seguridad Clínica (5 Reglas)
                </span>
                {validation.isValid ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                    Secuencia Estable
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                    Alertas Detectadas
                  </span>
                )}
              </div>

              {validation.warnings.length > 0 ? (
                <div className="space-y-1 text-[11px] text-amber-600 dark:text-amber-400 font-lato">
                  {validation.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span>⚠️</span> <span>{w}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {validation.positives.map((p, i) => (
                    <div key={i}>{p}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Botonera de Acción */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  if (onActivateBrush) onActivateBrush(currentBlock);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Paintbrush size={14} className="text-indigo-600" /> Activar Modo Pincel
              </button>

              <button
                onClick={() => {
                  if (onInjectDirectly) onInjectDirectly(currentBlock);
                  onClose();
                }}
                disabled={currentBlock.exercises.length === 0}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
              >
                <Check size={14} /> Inyectar en Día Actual
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

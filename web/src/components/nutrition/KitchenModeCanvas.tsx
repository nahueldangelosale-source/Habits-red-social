import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, Check, ChefHat, Clock, BellRing, Flame, Snowflake, RotateCcw, Beef, Wheat, Leaf, ArrowRight } from 'lucide-react';

// Estructura de Tareas
type TaskType = 'active' | 'passive';

interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  duration?: number; // en segundos
  dependencies?: string[];
}

const KITCHEN_WORKFLOW: Task[] = [
  // Tareas Activas
  { id: 'a1', type: 'active', title: 'Mise en place', description: 'Lavar y cortar vegetales (Cebolla, Brócoli, Zanahoria). Laminar ajo.' },
  { id: 'a2', type: 'active', title: 'Aderezar Proteína', description: 'Cortar pollo en cubos. Aderezar con teriyaki y sésamo.' },
  { id: 'a3', type: 'active', title: 'Salteado Wok', description: 'Saltear vegetales blanqueados con salsa de soja y jengibre.' },
  { id: 'a4', type: 'active', title: 'Envasado', description: 'Separar pollo y vegetales en contenedores. Aplicar regla FIFO.' },
  
  // Tareas Pasivas (Timers)
  { id: 'p1', type: 'passive', title: 'Horno: Vegetales Asados', description: '200°C. Bandeja media.', duration: 1800 },
  { id: 'p2', type: 'passive', title: 'Ebullición: Arroz / Quinoa', description: 'Fuego lento, olla tapada.', duration: 900 },
];

interface TimerState {
  id: string;
  endTime: number | null; // null si no está corriendo
  remaining: number;
  initialDuration: number;
}

export const KitchenModeCanvas: React.FC = () => {
  const [phase, setPhase] = useState<'matrix' | 'execution' | 'closing'>('matrix');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [timers, setTimers] = useState<Record<string, TimerState>>({});
  const [finishedTimers, setFinishedTimers] = useState<string[]>([]);
  const [pulseAnimation, setPulseAnimation] = useState<string | null>(null);

  // Inicializar timers pasivos
  useEffect(() => {
    const initialTimers: Record<string, TimerState> = {};
    KITCHEN_WORKFLOW.filter(t => t.type === 'passive').forEach(t => {
      initialTimers[t.id] = {
        id: t.id,
        endTime: null,
        remaining: t.duration || 0,
        initialDuration: t.duration || 0,
      };
    });
    setTimers(initialTimers);
  }, []);

  // Motor de Timers (Timestamp-based para resiliencia en background)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let updated = false;
      const newTimers = { ...timers };

      Object.values(newTimers).forEach(timer => {
        if (timer.endTime !== null) {
          const timeLeft = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
          if (timeLeft !== timer.remaining) {
            newTimers[timer.id].remaining = timeLeft;
            updated = true;

            // Finalización
            if (timeLeft === 0) {
              newTimers[timer.id].endTime = null; // Detener
              if (!finishedTimers.includes(timer.id)) {
                setFinishedTimers(prev => [...prev, timer.id]);
                setPulseAnimation(timer.id);
                playSubtleChime();
              }
            }
          }
        }
      });

      if (updated) setTimers(newTimers);
    }, 500);

    return () => clearInterval(interval);
  }, [timers, finishedTimers]);

  // Audio feedback sutil y no estresante
  const playSubtleChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2);
    } catch (e) {
      console.warn("Audio context not supported", e);
    }
  }, []);

  const toggleTimer = (id: string) => {
    setTimers(prev => {
      const timer = prev[id];
      const now = Date.now();
      
      // Si estaba corriendo, lo pauso guardando el remaining
      if (timer.endTime !== null) {
        return {
          ...prev,
          [id]: { ...timer, endTime: null }
        };
      } else {
        // Si estaba pausado, calculo el nuevo endTime basado en el remaining
        return {
          ...prev,
          [id]: { ...timer, endTime: now + (timer.remaining * 1000) }
        };
      }
    });

    if (finishedTimers.includes(id)) {
        setFinishedTimers(prev => prev.filter(t => t !== id));
        // Reset timer
        setTimers(prev => ({
            ...prev,
            [id]: { ...prev[id], remaining: prev[id].initialDuration, endTime: null }
        }));
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeTasks = KITCHEN_WORKFLOW.filter(t => t.type === 'active');
  const passiveTasks = KITCHEN_WORKFLOW.filter(t => t.type === 'passive');
  const currentActiveTask = activeTasks[activeStepIndex];
  const isLast = activeStepIndex === activeTasks.length - 1;

  const handleNext = () => {
    if (!isLast) setActiveStepIndex(c => c + 1);
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-[700px] p-4 sm:p-6 rounded-3xl flex flex-col font-lato text-slate-800 dark:text-white relative overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
      {/* Luces volumétricas de fondo */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="flex items-center justify-between mb-8 relative z-10 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2.5 rounded-2xl text-indigo-400 ring-1 ring-indigo-500/30">
            <ChefHat size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black font-montserrat uppercase tracking-widest text-slate-900 dark:text-white">Modo Cocina</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 mt-0.5">
              <Flame size={12} className="text-amber-500" /> MICRO-FÁBRICA MODULAR
            </p>
          </div>
        </div>
      </header>

      {phase === 'matrix' && (
        <div className="flex-1 flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-black font-montserrat tracking-tight mb-2 text-slate-900 dark:text-white">Matriz Base Semanal</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto text-sm">Selecciona 3 ingredientes de cada categoría. Optimizaremos la producción en paralelo para combinarlos libremente en la semana.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 flex-1">
            {/* Columna Carbos */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 lg:p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500"><Wheat size={20} /></div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs">Carbohidratos</h4>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-amber-100 dark:border-amber-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Arroz Yamani</span><Check size={16} className="text-amber-500"/>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-amber-100 dark:border-amber-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Batata al Horno</span><Check size={16} className="text-amber-500"/>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-amber-100 dark:border-amber-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Quinoa</span><Check size={16} className="text-amber-500"/>
                </div>
              </div>
            </div>

            {/* Columna Proteínas */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 lg:p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-500"><Beef size={20} /></div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs">Proteínas</h4>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-rose-100 dark:border-rose-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Pollo Teriyaki</span><Check size={16} className="text-rose-500"/>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-rose-100 dark:border-rose-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Huevos Duros</span><Check size={16} className="text-rose-500"/>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-rose-100 dark:border-rose-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Tofu Marinado</span><Check size={16} className="text-rose-500"/>
                </div>
              </div>
            </div>

            {/* Columna Vegetales */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 lg:p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500"><Leaf size={20} /></div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs">Vegetales</h4>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-emerald-100 dark:border-emerald-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Brócoli Blanqueado</span><Check size={16} className="text-emerald-500"/>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-emerald-100 dark:border-emerald-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Zanahorias Asadas</span><Check size={16} className="text-emerald-500"/>
                </div>
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl flex items-center justify-between border border-emerald-100 dark:border-emerald-500/30 shadow-sm">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Espinaca Fresca</span><Check size={16} className="text-emerald-500"/>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button 
              onClick={() => setPhase('execution')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/20 flex items-center gap-3 transition-all transform hover:scale-105"
            >
              Iniciar Producción <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {phase === 'execution' && (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 relative z-10 animate-in fade-in slide-in-from-right-8 duration-500">
        
        {/* Panel Principal: Tareas Activas (Focus) */}
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Tarea en Foco
            </span>
            <span className="text-indigo-400 font-black text-xs uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg">
              Paso {activeStepIndex + 1} de {activeTasks.length}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-8 rounded-3xl flex-1 flex flex-col justify-center shadow-xl shadow-slate-200/50 dark:shadow-xl relative overflow-hidden group">
            {/* Indicador sutil de progreso en el borde superior */}
            <div className="absolute top-0 left-0 h-1 bg-slate-100 dark:bg-slate-800 w-full">
                <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${((activeStepIndex + 1) / activeTasks.length) * 100}%` }} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black font-montserrat tracking-tight leading-tight mb-4 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-50 transition-colors">
              {currentActiveTask?.title}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
              {currentActiveTask?.description}
            </p>
          </div>

          {/* Navegación Activa */}
          <div className="flex items-center justify-between mt-6">
            <button 
              onClick={() => setActiveStepIndex(c => Math.max(0, c - 1))}
              disabled={activeStepIndex === 0}
              className="p-4 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white disabled:opacity-20 transition-colors bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={() => isLast ? setPhase('closing') : handleNext()}
              className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl ${isLast ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
            >
              {isLast ? (
                <><Check size={20} /> Cierre y SOPs</>
              ) : (
                <>Siguiente <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>

        {/* Panel Lateral Flotante: Tareas Pasivas (Fondo) */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} /> Procesos Pasivos
            </span>
          </div>

          <div className="space-y-3">
            {passiveTasks.map(task => {
              const timer = timers[task.id];
              if (!timer) return null;
              
              const isRunning = timer.endTime !== null;
              const isFinished = finishedTimers.includes(task.id);
              const progress = ((timer.initialDuration - timer.remaining) / timer.initialDuration) * 100;
              
              return (
                <div 
                  key={task.id} 
                  className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-500 transform ${
                    isFinished 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] scale-[1.02]' 
                      : isRunning 
                        ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-500/30 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Progress Bar Background */}
                  {isRunning && (
                    <div 
                      className="absolute inset-0 bg-indigo-900/20 origin-left transition-all duration-1000 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-4">
                    <button 
                      onClick={() => toggleTimer(task.id)}
                      className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-all shadow-md ${
                        isFinished 
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                          : isRunning 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isFinished ? (
                        <Check size={20} className="stroke-[3]" />
                      ) : isRunning ? (
                        <Pause size={20} fill="currentColor" />
                      ) : (
                        timer.remaining < timer.initialDuration ? <RotateCcw size={20} /> : <Play size={20} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className={`text-sm font-bold truncate pr-2 ${isFinished ? 'text-emerald-400' : 'text-white'}`}>
                          {task.title}
                        </h4>
                      </div>
                      
                      {isFinished ? (
                        <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse">
                          <BellRing size={12} /> Requiere Acción
                        </span>
                      ) : (
                        <span className={`text-2xl font-black tabular-nums tracking-tight font-montserrat ${isRunning ? 'text-indigo-300' : 'text-slate-500'}`}>
                          {formatTime(timer.remaining)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Tip de Sistema (Micro-learning) */}
          <div className="mt-auto bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex gap-3 text-slate-500 dark:text-slate-400 items-start shadow-sm">
            <Snowflake size={16} className="text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">
              <strong className="text-slate-900 dark:text-white block mb-1">Regla de Enfriamiento</strong>
              Los procesos pasivos te dan tiempo para organizar. Todo lo caliente debe bajar a menos de 4°C en un máximo de dos horas.
            </p>
          </div>

        </div>
        </div>
      )}

      {phase === 'closing' && (
        <div className="flex-1 flex flex-col relative z-10 animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto w-full">
          <div className="mb-8 text-center">
            <h3 className="text-3xl font-black font-montserrat tracking-tight mb-2 text-slate-900 dark:text-white">SOPs y Conservación</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto text-sm">Prevención de errores y descarga mental. Cierra tu sesión de Batch Cooking aplicando estas reglas estandarizadas.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Regla FIFO/FEFO */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-lg">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/10 dark:ring-sky-500/30"><Snowflake size={24} /></div>
                <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest text-sm">Zonificación (FEFO)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">First Expired, First Out</p>
                </div>
              </div>
              <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-4">
                <li className="flex gap-3">
                  <Check size={18} className="text-sky-500 flex-shrink-0 mt-0.5"/>
                  <p><strong className="text-slate-800 dark:text-slate-200">Estante Superior (Más caliente):</strong> Snacks, sobras de comida, envases sellados.</p>
                </li>
                <li className="flex gap-3">
                  <Check size={18} className="text-sky-500 flex-shrink-0 mt-0.5"/>
                  <p><strong className="text-slate-800 dark:text-slate-200">Estante Medio:</strong> Huevos duros, lácteos, tuppers con nuestra producción de hoy.</p>
                </li>
                <li className="flex gap-3">
                  <Check size={18} className="text-sky-500 flex-shrink-0 mt-0.5"/>
                  <p><strong className="text-slate-800 dark:text-slate-200">Estante Inferior (Más frío):</strong> Carnes crudas en descongelamiento (siempre en bandeja para evitar goteo cruzado).</p>
                </li>
              </ul>
            </div>

            {/* Etiquetado Visual */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-lg">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 ring-1 ring-amber-500/10 dark:ring-amber-500/30"><ChefHat size={24} /></div>
                <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest text-sm">Etiquetado Rápido</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Descarga cognitiva inmediata</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">No confíes en tu memoria para el jueves a la noche. Usa cinta de enmascarar (masking tape) y un marcador permanente.</p>
              
              <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center mb-4 shadow-sm">
                  <div className="bg-amber-100/90 text-slate-900 px-6 py-2 rounded shadow-sm transform -rotate-2 font-mono font-bold text-lg mb-2">
                    POLLO TERIYAKI
                  </div>
                  <div className="bg-amber-100/90 text-slate-900 px-4 py-1 rounded shadow-sm transform rotate-1 font-mono font-bold text-sm">
                    {new Date().toLocaleDateString('es-AR')}
                  </div>
              </div>
              <p className="text-xs text-slate-500 text-center font-bold uppercase tracking-widest">SOP: [CONTENIDO] + [FECHA]</p>
            </div>
          </div>
          
          <div className="mt-10 flex justify-center pb-8">
            <button 
              onClick={() => setPhase('matrix')}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-slate-800 dark:border-slate-700 shadow-xl flex items-center gap-3 transition-all"
            >
              <Check size={20} className="text-emerald-400 dark:text-emerald-500" /> Finalizar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

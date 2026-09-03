import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, RotateCcw, Check, Flame, Trophy, 
  Sparkles, Compass, MapPin, Zap, User, Clock, Heart, Activity, Minimize2
} from 'lucide-react';
import { useLiveClassStore } from '../../stores/useLiveClassStore';

export const LiveClassSessionModal: React.FC = () => {
  const {
    activeClass,
    isModalOpen,
    pauseClass,
    resumeClass,
    resetClass,
    updateMetrics,
    closeModal,
    finishClass,
    getElapsedSeconds
  } = useLiveClassStore();

  // Tick local para forzar re-render de la aguja del cronómetro
  const [, setTick] = useState(0);

  useEffect(() => {
    if (activeClass?.isRunning) {
      const interval = setInterval(() => {
        setTick(t => t + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [activeClass?.isRunning]);

  if (!isModalOpen || !activeClass) return null;

  const seconds = getElapsedSeconds();
  const minutesElapsed = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  const formattedTime = `${String(minutesElapsed).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;

  const isSwimming = activeClass.activityType === 'SWIMMING';
  const hasDistanceMetric = [
    'RUNNING', 'CYCLING', 'SWIMMING', 'PADEL', 'FOOTBALL'
  ].includes(activeClass.activityType);

  const effectiveMinutes = Math.max(1, minutesElapsed);
  const internalLoad = effectiveMinutes * activeClass.rpe;
  const liveXp = Math.min(80, Math.max(25, Math.round((effectiveMinutes / 5) * 4 + activeClass.rpe * 2)));

  // Cálculo de Ritmo / Pace
  let paceDisplay = '';
  if (isSwimming && activeClass.distanceMeters > 0) {
    const pace100mSecs = (seconds / activeClass.distanceMeters) * 100;
    const paceMins = Math.floor(pace100mSecs / 60);
    const paceRemSecs = Math.round(pace100mSecs % 60);
    paceDisplay = `${paceMins}:${String(paceRemSecs).padStart(2, '0')} min/100m`;
  } else if (!isSwimming && activeClass.distanceKm > 0) {
    const paceKmSecs = seconds / activeClass.distanceKm;
    const paceMins = Math.floor(paceKmSecs / 60);
    const paceRemSecs = Math.round(paceKmSecs % 60);
    paceDisplay = `${paceMins}:${String(paceRemSecs).padStart(2, '0')} min/km`;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-lg overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="bg-white dark:bg-[#0c0e17] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden my-auto font-lato"
        >
          {/* Header con Estado "En Vivo" & Minimizar */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-rose-50/60 dark:from-zinc-900 dark:via-indigo-950/40 dark:to-purple-950/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-500/20">
                  {activeClass.activityType === 'CROSSFIT' ? '🏋️' : activeClass.activityType === 'YOGA' ? '🧘' : activeClass.activityType === 'RUNNING' ? '🏃' : activeClass.activityType === 'SWIMMING' ? '🏊' : '⚡'}
                </div>
                {activeClass.isRunning && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                    {activeClass.title}
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    EN VIVO
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-bold flex items-center gap-1 mt-0.5">
                  <User size={12} className="text-indigo-500" />
                  <span>A cargo de: <strong>{activeClass.instructorName}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Minimizar (el cronómetro seguirá corriendo en segundo plano)"
              >
                <Minimize2 size={15} />
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. CRONÓMETRO INMUNE A BLOQUEO DE PANTALLA */}
            <div className="p-6 rounded-3xl bg-slate-900 text-white text-center shadow-inner relative overflow-hidden border border-slate-800">
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-black font-montserrat uppercase tracking-widest text-indigo-400">
                  <Clock size={12} />
                  <span>Tiempo de Clase (Inmune a Bloqueo)</span>
                </div>

                <div className="text-5xl sm:text-6xl font-mono font-black tracking-tight text-white my-2">
                  {formattedTime}
                </div>

                {/* Controles de Cronómetro */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeClass.isRunning) pauseClass();
                      else resumeClass();
                    }}
                    className={`px-5 py-2.5 rounded-2xl font-montserrat font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                      activeClass.isRunning
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {activeClass.isRunning ? <Pause size={15} /> : <Play size={15} />}
                    <span>{activeClass.isRunning ? 'Pausar' : 'Reanudar'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetClass}
                    className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    title="Reiniciar Cronómetro a 0"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* AVISO PEDAGÓGICO DE SEGUNDO PLANO */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-2.5">
              <span className="text-base">📱</span>
              <p className="text-[11px] font-bold text-emerald-950 dark:text-emerald-300 leading-tight">
                <strong>Cronómetro Continuo:</strong> Puedes bloquear tu pantalla o minimizar este menú; el tiempo exacto seguirá corriendo sin detenerse.
              </p>
            </div>

            {/* 2. DISTANCIA OPCIONAL (PARA RUNNING, NATACIÓN, BICICLETA, ETC.) */}
            {hasDistanceMetric && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black font-montserrat text-slate-900 dark:text-white uppercase tracking-wider">
                        Distancia Recorrida (Opcional)
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isSwimming ? '¿Cuántos metros nadaste hoy?' : '¿Cuántos kilómetros corriste o pedaleaste?'}
                      </p>
                    </div>
                  </div>

                  {paceDisplay && (
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                      {paceDisplay}
                    </span>
                  )}
                </div>

                {isSwimming ? (
                  /* Selector Natación (Metros) */
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {[500, 1000, 1500, 2000, 3000].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => updateMetrics({ distanceMeters: m })}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeClass.distanceMeters === m
                              ? 'bg-indigo-600 text-white shadow-xs'
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
                        value={activeClass.distanceMeters || ''}
                        onChange={(e) => updateMetrics({ distanceMeters: Math.max(0, parseInt(e.target.value) || 0) })}
                        placeholder="Metros personalizados (ej: 1250)"
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">metros</span>
                    </div>
                  </div>
                ) : (
                  /* Selector Running / Bici (KM) */
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {[3, 5, 8, 10, 15, 21].map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => updateMetrics({ distanceKm: km })}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeClass.distanceKm === km
                              ? 'bg-indigo-600 text-white shadow-xs'
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
                        value={activeClass.distanceKm || ''}
                        onChange={(e) => updateMetrics({ distanceKm: Math.max(0, parseFloat(e.target.value) || 0) })}
                        placeholder="Distancia personalizada (ej: 6.5)"
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-500 shrink-0">kilómetros</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. ESFUERZO PERCIBIDO EN VIVO (RPE 1-10) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black font-montserrat uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Flame size={13} className="text-rose-500" />
                  <span>Intensidad de la Clase (RPE)</span>
                </label>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  {activeClass.rpe}/10 • {activeClass.rpe >= 8 ? 'Alta Exigencia' : activeClass.rpe >= 5 ? 'Moderado' : 'Regenerativo'}
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={activeClass.rpe}
                onChange={(e) => updateMetrics({ rpe: parseInt(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* 4. NOTA PARA EL PROFESOR / COACH */}
            <div>
              <label className="text-[11px] font-black font-montserrat uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Comentarios de la sesión (Opcional):
              </label>
              <textarea
                value={activeClass.notes}
                onChange={(e) => updateMetrics({ notes: e.target.value })}
                placeholder={`Comentarios para ${activeClass.instructorName}...`}
                rows={2}
                className="w-full p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* 5. RESUMEN DE IMPACTO */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-rose-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs font-black font-montserrat text-slate-900 dark:text-white">
                    Carga: {internalLoad} AU • Recompensa: +{liveXp} XP
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Suma a tu Squad y valida tu hábito de entrenamiento
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer de Finalización */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-black/20 flex items-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Minimizar
            </button>

            <button
              type="button"
              onClick={finishClass}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-montserrat font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={16} />
              <span>✓ Completar y Guardar Clase (+{liveXp} XP)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

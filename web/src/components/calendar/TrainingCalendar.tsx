import React, { useState, useMemo } from 'react';
import { usePlanBuilderStore, type WorkoutDay, type RoutineBlock } from '../../stores/usePlanBuilderStore';
import { useHabitStore } from '../../stores/useHabitStore';
import { CalendarDays, ChevronLeft, ChevronRight, X, Moon, Dumbbell, Layers, Flame } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const PHASE_COLORS = [
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500', ring: 'ring-indigo-300' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-300' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-300' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', ring: 'ring-rose-300' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', dot: 'bg-cyan-500', ring: 'ring-cyan-300' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500', ring: 'ring-violet-300' },
];

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const fmtDate = (d: Date) => d.toISOString().split('T')[0];

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export const TrainingCalendar: React.FC = () => {
  const { days } = usePlanBuilderStore();
  const { prescribedHabits } = useHabitStore();
  
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setMonth(today.getMonth()); setYear(today.getFullYear()); };

  // Phase color mapping
  const phaseColorMap = useMemo(() => {
    const map: Record<string, typeof PHASE_COLORS[0]> = {};
    const uniquePhases = [...new Set(days.map(d => d.phaseId || 'unassigned'))];
    uniquePhases.forEach((pid, i) => { map[pid] = PHASE_COLORS[i % PHASE_COLORS.length]; });
    return map;
  }, [days]);

  // Map workout days to calendar dates
  const dateMap = useMemo(() => {
    const m = new Map<string, WorkoutDay & { phaseColor: typeof PHASE_COLORS[0]; dayIndex: number }>();
    const phaseGroups: Record<string, WorkoutDay[]> = {};
    days.forEach(day => {
      const pid = day.phaseId || 'unassigned';
      if (!phaseGroups[pid]) phaseGroups[pid] = [];
      phaseGroups[pid].push(day);
    });

    Object.entries(phaseGroups).forEach(([pid, phaseDays]) => {
      const startStr = phaseDays[0]?.releaseDate;
      const start = startStr ? new Date(startStr) : new Date();
      const color = phaseColorMap[pid] || PHASE_COLORS[0];
      phaseDays.forEach((day, idx) => {
        const d = new Date(start);
        d.setDate(d.getDate() + idx);
        m.set(fmtDate(d), { ...day, phaseColor: color, dayIndex: idx + 1 });
      });
    });
    return m;
  }, [days, phaseColorMap]);

  // Phase legend
  const phaseLegend = useMemo(() => {
    const seen = new Map<string, { name: string; color: typeof PHASE_COLORS[0]; count: number; startDate: string }>();
    days.forEach(day => {
      const pid = day.phaseId || 'unassigned';
      if (!seen.has(pid)) {
        seen.set(pid, { name: day.phaseName || 'Sin Fase', color: phaseColorMap[pid] || PHASE_COLORS[0], count: 0, startDate: day.releaseDate || fmtDate(new Date()) });
      }
      seen.get(pid)!.count++;
    });
    return [...seen.values()];
  }, [days, phaseColorMap]);

  // Habit dates
  const habitDatesSet = useMemo(() => {
    const s = new Set<string>();
    prescribedHabits.forEach(h => h.completedDays.forEach(d => s.add(d)));
    return s;
  }, [prescribedHabits]);

  // Calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = startDow - 1; i >= 0; i--) cells.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) cells.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    const rows = Math.ceil(cells.filter(c => c.isCurrentMonth).length / 7) + (cells.findIndex(c => c.isCurrentMonth) > 0 ? 1 : 0);
    return cells.slice(0, (rows <= 5 ? 5 : 6) * 7);
  }, [year, month]);

  const selectedDayData = selectedDate ? dateMap.get(selectedDate) : null;

  const countBlocks = (day: WorkoutDay) => day.items.filter(i => i.type === 'BLOCK').length;
  const countExercises = (day: WorkoutDay) => {
    let total = 0;
    day.items.forEach(i => { if (i.type === 'EXERCISE') total++; else if (i.type === 'BLOCK') total += (i as RoutineBlock).items.length; });
    return total;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-lato">
      {/* Header */}
      <div 
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
        className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarDays size={18} />
          </div>
          <div>
            <h2 className="text-lg font-black font-montserrat text-slate-900">Calendario de Entrenamiento</h2>
            <p className="text-[11px] text-slate-400">Visualización mensual de fases y actividades</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCalendarOpen && (
            <button 
              onClick={(e) => { e.stopPropagation(); goToday(); }} 
              className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Hoy
            </button>
          )}
          <div className={`p-2 rounded-full transition-transform duration-300 ${isCalendarOpen ? 'rotate-180 bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 overflow-hidden"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-50/50">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors">
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
        <h3 className="text-base font-black font-montserrat text-slate-800 tracking-tight">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors">
          <ChevronRight size={18} className="text-slate-600" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
        ))}
      </div>

      {/* Grid */}
      {days.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <CalendarDays size={40} strokeWidth={1.5} />
          <p className="text-sm font-bold">Sin actividades programadas</p>
          <p className="text-xs">Crea una rutina en la pestaña Rutina para verla aquí.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${month}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7"
          >
            {calendarGrid.map(({ date, isCurrentMonth }, idx) => {
              const key = fmtDate(date);
              const dayData = dateMap.get(key);
              const isToday = key === fmtDate(today);
              const hasHabits = habitDatesSet.has(key);
              const isSelected = selectedDate === key;
              const blocks = dayData ? countBlocks(dayData) : 0;
              const isRest = dayData && dayData.items.length === 0;

              return (
                <button
                  key={idx}
                  onClick={() => { if (dayData || hasHabits) setSelectedDate(isSelected ? null : key); }}
                  className={`
                    relative min-h-[90px] md:min-h-[100px] p-1.5 border-b border-r border-slate-100 text-left transition-all duration-150
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${isSelected ? 'ring-2 ring-indigo-400 z-10' : ''}
                    ${dayData ? `${dayData.phaseColor.bg} hover:brightness-[0.97] cursor-pointer` : hasHabits ? 'hover:bg-slate-50 cursor-pointer' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-indigo-500 ring-inset z-10' : ''}
                  `}
                >
                  <span className={`text-xs font-bold block mb-0.5 ${isToday ? 'text-indigo-600' : dayData ? dayData.phaseColor.text : 'text-slate-500'}`}>
                    {date.getDate()}
                  </span>
                  {dayData && (
                    <div className="space-y-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${dayData.phaseColor.text} block truncate`}>
                        Día {dayData.dayIndex}
                      </span>
                      {isRest ? (
                        <span className="text-[9px] text-slate-400 flex items-center gap-0.5"><Moon size={8} /> Descanso</span>
                      ) : (
                        <span className="text-[9px] text-slate-500 block">
                          {blocks > 0 ? `${blocks} bloques` : `${dayData.items.length} ejerc.`}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1.5 flex items-center gap-0.5">
                    {dayData && <span className={`w-1.5 h-1.5 rounded-full ${dayData.phaseColor.dot}`} />}
                    {hasHabits && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Phase Legend */}
      {phaseLegend.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fases:</span>
          {phaseLegend.map((p, i) => (
            <button key={i} onClick={() => { const d = new Date(p.startDate); setMonth(d.getMonth()); setYear(d.getFullYear()); }} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <span className={`w-2.5 h-2.5 rounded-full ${p.color.dot}`} />
              <span className="text-xs font-bold text-slate-600">{p.name}</span>
              <span className="text-[10px] text-slate-400">({p.count}d)</span>
            </button>
          ))}
        </div>
      )}

      {/* Day Drilldown Modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" 
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className={`p-6 border-b border-slate-100 flex-shrink-0 ${selectedDayData ? selectedDayData.phaseColor.bg : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black font-montserrat text-slate-900">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <button onClick={() => setSelectedDate(null)} className="w-8 h-8 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center shadow-sm">
                    <X size={16} />
                  </button>
                </div>
                {selectedDayData && (
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${selectedDayData.phaseColor.dot}`} />
                    <span className={`text-xs font-bold ${selectedDayData.phaseColor.text}`}>
                      {selectedDayData.phaseName || 'Sin Fase'} — Día {selectedDayData.dayIndex}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                {selectedDayData ? (
                  <>
                    {selectedDayData.items.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">
                        <Moon size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-bold">Día de Descanso</p>
                        <p className="text-xs mt-1">Sin ejercicios programados</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <Layers size={14} className="mx-auto text-slate-400 mb-1" />
                            <div className="text-lg font-black text-slate-900">{countBlocks(selectedDayData)}</div>
                            <div className="text-[9px] font-bold uppercase text-slate-400">Bloques</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <Dumbbell size={14} className="mx-auto text-slate-400 mb-1" />
                            <div className="text-lg font-black text-slate-900">{countExercises(selectedDayData)}</div>
                            <div className="text-[9px] font-bold uppercase text-slate-400">Ejercicios</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <Flame size={14} className="mx-auto text-slate-400 mb-1" />
                            <div className="text-lg font-black text-slate-900">
                              {selectedDayData.items.reduce((sum, i) => {
                                if (i.type === 'EXERCISE') return sum + (parseInt(i.sets) || 0);
                                if (i.type === 'BLOCK') return sum + (i as RoutineBlock).items.reduce((s, e) => s + (parseInt(e.sets) || 0), 0);
                                return sum;
                              }, 0)}
                            </div>
                            <div className="text-[9px] font-bold uppercase text-slate-400">Sets Total</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Contenido del Día</h4>
                          {selectedDayData.items.map((item) => {
                            if (item.type === 'BLOCK') {
                              const block = item as RoutineBlock;
                              return (
                                <div key={item.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-800">{block.name}</span>
                                    <span className="text-[9px] text-slate-400 font-bold">{block.items.length} ejerc.</span>
                                  </div>
                                  <div className="space-y-1">
                                    {block.items.map(ex => (
                                      <div key={ex.id} className="flex items-center justify-between text-[11px] text-slate-600 pl-2 border-l-2 border-slate-200">
                                        <span className="truncate flex-1">{ex.exercise?.name || 'Ejercicio'}</span>
                                        <span className="text-slate-400 ml-2 whitespace-nowrap">{ex.sets}x{ex.reps}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                                <span className="text-xs text-slate-700 font-bold truncate">{item.type === 'EXERCISE' ? (item.exercise?.name || 'Ejercicio') : ''}</span>
                                <span className="text-[10px] text-slate-400 font-bold ml-2">{item.type === 'EXERCISE' ? `${item.sets}x${item.reps}` : ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {habitDatesSet.has(selectedDate) && (
                      <div className="pt-3 border-t border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Hábitos Completados</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {prescribedHabits.filter(h => h.completedDays.includes(selectedDate!)).map(h => (
                            <span key={h.id} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${h.type === 'BUILD' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{h.title}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <CalendarDays size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold">Sin entrenamiento este día</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

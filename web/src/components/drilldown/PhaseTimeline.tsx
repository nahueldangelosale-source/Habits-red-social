/**
 * ═══════════════════════════════════════════════════════════════
 * TIMELINE DE PERIODOS — Vista visual de cumplimiento
 * ═══════════════════════════════════════════════════════════════
 * 
 * Muestra los periodos del plan con sus colores y el estado
 * de cumplimiento del atleta. Simple, visual, sin gráficos complejos.
 * 
 * Vistas: Mensual | Trimestral | Semestral
 */

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, X, Clock, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPeriodConfig, FIELD_LABELS, type PeriodConfig } from '../../data/modalityColors';

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

export type ComplianceStatus = 'done' | 'partial' | 'missed' | 'rest' | 'future';

export interface DayData {
  date: string;            // ISO date "2026-07-14"
  dayOfMonth: number;
  periodId: string | null; // FK a PERIOD_PALETTE (ej. 'FUERZA', 'HIPERTROFIA')
  periodName?: string;     // Nombre custom de la fase (ej. "Mesociclo Fuerza 1")
  status: ComplianceStatus;
}

export interface WeekSummary {
  weekNumber: number;
  days: DayData[];
  dominantPeriod: string | null;
  compliancePercent: number;
}

interface PhaseTimelineProps {
  isClinical?: boolean;
}

// ─────────────────────────────────────────────────────────────
// DATOS STUB (se reemplazarán por datos reales del backend)
// ─────────────────────────────────────────────────────────────

const generateStubMonth = (): DayData[] => {
  const days: DayData[] = [];
  const phases: { period: string; weeks: number[] }[] = [
    { period: 'ADAPTACION', weeks: [1, 2] },
    { period: 'FUERZA', weeks: [3, 4] },
  ];

  // Julio 2026 empieza en miércoles (offset 2 para lunes=0)
  const daysInMonth = 31;
  const startDayOfWeek = 2; // 0=Lun, 1=Mar, 2=Mié

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (startDayOfWeek + d - 1) % 7;
    const weekNum = Math.ceil((d + startDayOfWeek) / 7);
    const isWeekend = dayOfWeek >= 5;

    // Determinar periodo
    let periodId: string | null = null;
    let periodName: string | undefined = undefined;
    if (!isWeekend) {
      if (weekNum <= 2) {
        periodId = 'ADAPTACION';
        periodName = 'Adaptación — Semana ' + weekNum;
      } else {
        periodId = 'FUERZA';
        periodName = 'Fuerza Máxima — Semana ' + (weekNum - 2);
      }
    }

    // Determinar status
    let status: ComplianceStatus = 'future';
    if (isWeekend && !periodId) {
      status = 'rest';
    } else if (d <= 16) {
      // Días pasados
      const rand = Math.random();
      if (!periodId) {
        status = 'rest';
      } else if (rand > 0.2) {
        status = 'done';
      } else if (rand > 0.1) {
        status = 'partial';
      } else {
        status = 'missed';
      }
    }

    days.push({
      date: `2026-07-${String(d).padStart(2, '0')}`,
      dayOfMonth: d,
      periodId,
      periodName,
      status,
    });
  }
  return days;
};

const generateStubQuarter = (): WeekSummary[] => {
  const weeks: WeekSummary[] = [];
  const phases = [
    { period: 'ADAPTACION', weekCount: 4 },
    { period: 'FUERZA', weekCount: 4 },
    { period: 'HIPERTROFIA', weekCount: 3 },
    { period: 'DELOAD', weekCount: 1 },
  ];

  let weekNum = 1;
  for (const phase of phases) {
    for (let w = 0; w < phase.weekCount; w++) {
      const pct = weekNum <= 10 ? 60 + Math.floor(Math.random() * 40) : 0;
      weeks.push({
        weekNumber: weekNum,
        days: [],
        dominantPeriod: phase.period,
        compliancePercent: weekNum <= 10 ? pct : 0,
      });
      weekNum++;
    }
  }
  return weeks;
};

const generateStubSemester = (): { month: string; periodId: string; percent: number }[] => {
  return [
    { month: 'Ene', periodId: 'ADAPTACION', percent: 92 },
    { month: 'Feb', periodId: 'FUERZA', percent: 88 },
    { month: 'Mar', periodId: 'FUERZA', percent: 75 },
    { month: 'Abr', periodId: 'HIPERTROFIA', percent: 95 },
    { month: 'May', periodId: 'POTENCIA', percent: 82 },
    { month: 'Jun', periodId: 'COMPETICION', percent: 90 },
  ];
};

// ─────────────────────────────────────────────────────────────
// COMPONENTES DE CADA VISTA
// ─────────────────────────────────────────────────────────────

const StatusIcon: React.FC<{ status: ComplianceStatus; size?: number }> = ({ status, size = 12 }) => {
  switch (status) {
    case 'done':
      return <Check size={size} className="text-white" strokeWidth={3} />;
    case 'partial':
      return <Minus size={size} className="text-white" strokeWidth={3} />;
    case 'missed':
      return <X size={size} className="text-white" strokeWidth={3} />;
    case 'future':
      return <Clock size={size} className="text-slate-300 dark:text-zinc-600" strokeWidth={2} />;
    default:
      return null;
  }
};

const getStatusBg = (status: ComplianceStatus): string => {
  switch (status) {
    case 'done': return 'bg-emerald-500';
    case 'partial': return 'bg-amber-500';
    case 'missed': return 'bg-rose-500';
    default: return '';
  }
};

// ── VISTA MENSUAL ────────────────────────────────────────────

const MonthlyView: React.FC<{ isClinical: boolean }> = ({ isClinical }) => {
  const days = React.useMemo(() => generateStubMonth(), []);
  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Agrupar por semanas
  const startDayOfWeek = 2; // Julio 2026: Miércoles
  const gridCells: (DayData | null)[] = [];

  // Padding inicial
  for (let i = 0; i < startDayOfWeek; i++) {
    gridCells.push(null);
  }
  gridCells.push(...days);

  // Padding final
  while (gridCells.length % 7 !== 0) {
    gridCells.push(null);
  }

  // Leyenda dinámica: solo periodos que aparecen
  const activePeriods = new Set<string>();
  days.forEach(d => { if (d.periodId) activePeriods.add(d.periodId); });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
              <ChevronLeft size={16} className="text-slate-400" />
            </button>
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-200">
              Julio 2026
            </h3>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-2 max-w-2xl">
          El color de fondo en cada día indica la fase de periodización actual. Los iconos centrales señalan si el atleta completó, hizo parcialmente o saltó la sesión asignada.
        </p>
      </div>

      {/* Grid de Días de la Semana */}
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map(wd => (
          <div key={wd} className="text-center text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest py-1">
            {wd}
          </div>
        ))}

        {gridCells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="aspect-square rounded-xl" />;
          }

          const period = getPeriodConfig(cell.periodId);
          const isRest = cell.status === 'rest' || !cell.periodId;
          const isFuture = cell.status === 'future';
          const isToday = cell.dayOfMonth === 17; // Stub: hoy es 17

          return (
            <motion.div
              key={cell.date}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.01 }}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                relative cursor-pointer group transition-all duration-200
                ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-zinc-950' : ''}
                ${isRest
                  ? 'bg-slate-50 dark:bg-zinc-900/50'
                  : isFuture
                    ? 'border-2 border-dashed'
                    : 'shadow-sm hover:shadow-md hover:scale-105'
                }
              `}
              style={
                !isRest
                  ? {
                      backgroundColor: isFuture ? 'transparent' : period.color.light,
                      borderColor: period.color.border,
                    }
                  : undefined
              }
              title={cell.periodName || period.label}
            >
              {/* Número del día */}
              <span
                className={`text-xs font-bold ${
                  isRest
                    ? 'text-slate-300 dark:text-zinc-700'
                    : isFuture
                      ? 'text-slate-400 dark:text-zinc-500'
                      : ''
                }`}
                style={!isRest && !isFuture ? { color: period.color.text } : undefined}
              >
                {cell.dayOfMonth}
              </span>

              {/* Indicador de cumplimiento */}
              {!isRest && !isFuture && (
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${getStatusBg(cell.status)}`}
                >
                  <StatusIcon status={cell.status} size={10} />
                </div>
              )}

              {/* Dot de color del periodo (para días futuros) */}
              {isFuture && cell.periodId && (
                <div
                  className="w-2.5 h-2.5 rounded-full opacity-60"
                  style={{ backgroundColor: period.color.bg }}
                />
              )}

              {/* Tooltip hover */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg">
                <span>{period.emoji}</span>
                <span>{period.label}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
        {Array.from(activePeriods).map(pid => {
          const p = getPeriodConfig(pid);
          return (
            <div key={pid} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400">
              <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: p.color.bg }} />
              <span>{p.emoji} {p.label}</span>
            </div>
          );
        })}
        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-1" />
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-emerald-500" /> Hecho
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-amber-500" /> Parcial
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400">
          <div className="w-3 h-3 rounded-full bg-rose-500" /> Omitido
        </div>
      </div>
    </div>
  );
};

// ── VISTA TRIMESTRAL ─────────────────────────────────────────

const QuarterlyView: React.FC<{ isClinical: boolean }> = ({ isClinical }) => {
  const weeks = React.useMemo(() => generateStubQuarter(), []);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Trimestre Actual — 12 Semanas
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
          El porcentaje (%) indica el nivel de adherencia del atleta durante la semana. Se calcula cruzando las sesiones completadas, series validadas y el RPE reportado vs lo planificado.
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
        {weeks.map((week) => {
          const period = getPeriodConfig(week.dominantPeriod);
          const hasData = week.compliancePercent > 0;

          return (
            <motion.div
              key={week.weekNumber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: week.weekNumber * 0.03 }}
              className="flex flex-col items-center gap-1.5 cursor-pointer group relative"
            >
              {/* Barra de cumplimiento */}
              <div
                className="w-full h-20 rounded-xl relative overflow-hidden transition-all group-hover:scale-105 group-hover:shadow-lg"
                style={{ backgroundColor: period.color.light, borderLeft: `4px solid ${period.color.bg}` }}
              >
                {hasData && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${week.compliancePercent}%` }}
                    transition={{ delay: week.weekNumber * 0.05, duration: 0.5 }}
                    className="absolute bottom-0 left-0 right-0 rounded-b-lg opacity-30"
                    style={{ backgroundColor: period.color.bg }}
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black" style={{ color: period.color.text }}>
                    {hasData ? `${week.compliancePercent}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <div className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase">
                  S{week.weekNumber}
                </div>
                <div className="text-[8px] font-bold" style={{ color: period.color.text }}>
                  {period.emoji}
                </div>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg">
                {period.emoji} {period.label} — Semana {week.weekNumber}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
        {['ADAPTACION', 'FUERZA', 'HIPERTROFIA', 'DELOAD'].map(pid => {
          const p = getPeriodConfig(pid);
          return (
            <div key={pid} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-zinc-400">
              <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: p.color.bg }} />
              <span>{p.emoji} {p.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── VISTA SEMESTRAL ──────────────────────────────────────────

const SemesterView: React.FC<{ isClinical: boolean }> = ({ isClinical }) => {
  const months = React.useMemo(() => generateStubSemester(), []);

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-200">
          Vista de 6 Meses — Macrociclo
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
          El porcentaje (%) muestra el éxito general del atleta durante cada mes. Se calcula promediando la adherencia global de todas las semanas que componen la fase de entrenamiento de ese mes.
        </p>
      </div>

      <div className="space-y-3">
        {months.map((m, idx) => {
          const period = getPeriodConfig(m.periodId);
          return (
            <motion.div
              key={m.month}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              {/* Mes */}
              <div className="w-10 text-xs font-black text-slate-400 dark:text-zinc-500 uppercase text-right shrink-0">
                {m.month}
              </div>

              {/* Barra de progreso */}
              <div className="flex-1 h-10 rounded-xl overflow-hidden relative" style={{ backgroundColor: period.color.light }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.percent}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="h-full rounded-xl flex items-center justify-end pr-3 transition-all group-hover:brightness-110"
                  style={{ backgroundColor: period.color.bg }}
                >
                  <span className="text-xs font-black text-white drop-shadow-sm">
                    {m.percent}%
                  </span>
                </motion.div>

                {/* Label dentro de la barra */}
                <div className="absolute inset-0 flex items-center pl-3">
                  <span className="text-[11px] font-bold" style={{ color: period.color.text }}>
                    {period.emoji} {period.label}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

type TimelineView = 'mes' | 'trimestre' | 'semestre';

export const PhaseTimeline: React.FC<PhaseTimelineProps> = ({ isClinical = false }) => {
  const [view, setView] = useState<TimelineView>('mes');

  const views: { id: TimelineView; label: string }[] = [
    { id: 'mes', label: 'Mes' },
    { id: 'trimestre', label: 'Trimestre' },
    { id: 'semestre', label: 'Semestre' },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm">
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-indigo-500" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
            Progreso del Plan
          </h3>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === v.id
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'mes' && <MonthlyView isClinical={isClinical} />}
          {view === 'trimestre' && <QuarterlyView isClinical={isClinical} />}
          {view === 'semestre' && <SemesterView isClinical={isClinical} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Calendar, Dumbbell, Coffee } from 'lucide-react';
import type { WorkoutDay } from '../../stores/usePlanBuilderStore';

interface MacroDayCardProps {
  day: WorkoutDay;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onPaintClick?: (dayId: string) => void; // Para el Stateful Stamp
}

export interface ParsedDayInfo {
  dayBadge: string;
  mainTitle: string;
  subtitle: string;
}

/**
 * Descompone títulos densos generados automáticamente para eliminar la saturación cognitiva.
 * Convierte strings como "Día 1 - Full Body A: Foco en Sentadilla & Empuje Plano (Hipertrofia)"
 * en elementos estructurados:
 *  - dayBadge: "DÍA 1"
 *  - mainTitle: "Full Body A"
 *  - subtitle: "Sentadilla & Empuje Plano"
 */
export const parseDayDisplay = (rawName?: string, customName?: string): ParsedDayInfo => {
  const name = (customName || rawName || '').trim();
  if (!name) {
    return { dayBadge: 'DÍA', mainTitle: 'Entrenamiento', subtitle: '' };
  }

  // 1. Eliminar etiquetas de fase redundantes al final entre paréntesis
  let text = name.replace(/\s*\([^)]*\)\s*$/, '').trim();

  // 2. Extraer el prefijo del día ("Día 1", "Día 2", "Day 1")
  let dayBadge = '';
  const dayMatch = text.match(/^(D[íi]a\s*\d+|Day\s*\d+)\s*[:-]?\s*/i);
  if (dayMatch) {
    dayBadge = dayMatch[1].toUpperCase();
    text = text.substring(dayMatch[0].length).trim();
  }

  let mainTitle = text;
  let subtitle = '';

  // 3. Separar título principal del split y foco anatómico
  if (text.includes(': Foco en ')) {
    const parts = text.split(': Foco en ');
    mainTitle = parts[0].trim();
    subtitle = parts[1].trim();
  } else if (text.includes(' - Foco en ')) {
    const parts = text.split(' - Foco en ');
    mainTitle = parts[0].trim();
    subtitle = parts[1].trim();
  } else if (text.includes(' - ')) {
    const parts = text.split(' - ');
    mainTitle = parts[0].trim();
    subtitle = parts.slice(1).join(' - ').trim();
  } else if (text.includes(': ')) {
    const parts = text.split(': ');
    mainTitle = parts[0].trim();
    subtitle = parts.slice(1).join(': ').trim();
  }

  // Limpiar prefijo "Foco en " sobrante
  if (subtitle.toLowerCase().startsWith('foco en ')) {
    subtitle = subtitle.substring(8).trim();
  }

  // Si no hay subtítulo pero el texto original tenía una nota aclaratoria entre paréntesis (no genérica de fase)
  const parenMatch = name.match(/\(([^)]+)\)$/);
  if (!subtitle && parenMatch) {
    const note = parenMatch[1].trim();
    const lower = note.toLowerCase();
    if (!['hipertrofia', 'fuerza', 'adaptación', 'adaptacion', 'deload', 'descarga', 'transición', 'transicion'].includes(lower)) {
      subtitle = note;
    }
  }

  return {
    dayBadge: dayBadge || 'DÍA',
    mainTitle: mainTitle || 'Entrenamiento',
    subtitle
  };
};

export const MacroDayCard: React.FC<MacroDayCardProps> = ({ day, isActive, onSetActive, onPaintClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: day.id,
    data: { type: 'day-container', dayId: day.id }
  });

  const isEmpty = day.items.length === 0;
  const parsed = parseDayDisplay(day.name, day.customName);

  // Extraer items de previsualización con diseño limpio y ligero
  const previewItems = day.items.slice(0, 3).map(item => {
    if (item.type === 'BLOCK') {
      return {
        name: item.name || 'Circuito / Bloque',
        setsReps: item.items?.length ? `${item.items.length} ejerc.` : ''
      };
    }
    const name = item.exercise?.Nombre_Oficial || item.name || 'Ejercicio';
    const sets = item.sets ? `${item.sets}s` : '';
    const reps = item.reps ? `${item.reps}r` : '';
    const setsReps = sets && reps ? `${item.sets}x${item.reps}` : sets || reps;
    return { name, setsReps };
  });

  const extraCount = Math.max(0, day.items.length - 3);

  return (
    <div
      ref={setNodeRef}
      onClick={() => {
        onSetActive(day.id);
        if (onPaintClick) onPaintClick(day.id);
      }}
      className={`group relative rounded-2xl p-4 min-h-[150px] transition-all duration-200 cursor-pointer flex flex-col justify-between
        ${isEmpty 
          ? 'bg-slate-50/70 border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30' 
          : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'}
        ${isOver ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-400' : ''}
        ${isActive && !isEmpty ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-md shadow-indigo-100/60 bg-white' : ''}
      `}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 150px' }}
    >
      <div>
        {/* Cabecera: Píldora del Día + Contador de Ejercicios */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors
            ${isActive 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'bg-indigo-50/90 text-indigo-700 border border-indigo-100/80 group-hover:bg-indigo-100/80'}
          `}>
            <Calendar className="w-3 h-3" />
            {parsed.dayBadge}
          </span>

          {!isEmpty && (
            <span className="text-[11px] font-semibold text-slate-400 font-mono flex items-center gap-1">
              <Dumbbell className="w-3 h-3 text-slate-400" />
              {day.items.length} {day.items.length === 1 ? 'ejercicio' : 'ejercicios'}
            </span>
          )}
        </div>

        {/* Título Principal & Foco Anatómico */}
        <div className="mb-3">
          <h4 
            className={`text-sm font-black tracking-tight leading-snug truncate ${isEmpty ? 'text-slate-400' : 'text-slate-800 group-hover:text-indigo-900 transition-colors'}`}
            title={parsed.mainTitle}
          >
            {parsed.mainTitle}
          </h4>
          {parsed.subtitle ? (
            <p 
              className="text-[11px] font-medium text-slate-500 truncate mt-0.5 flex items-center gap-1"
              title={parsed.subtitle}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
              <span className="truncate">{parsed.subtitle}</span>
            </p>
          ) : (
            <div className="h-4" />
          )}
        </div>

        {/* Divisor sutil */}
        <div className="h-px bg-slate-100 mb-2.5" />

        {/* Lista de Ejercicios Respirable */}
        <div className="flex flex-col gap-1.5">
          {previewItems.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 transition-colors"
              title={item.name}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 h-4 rounded bg-white border border-slate-200/80 text-[10px] font-bold font-mono text-slate-400 flex items-center justify-center shrink-0 shadow-xs">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {item.name}
                </span>
              </div>
              {item.setsReps && (
                <span className="text-[10px] font-mono font-medium text-slate-400 shrink-0 bg-white/90 px-1.5 py-0.5 rounded border border-slate-100">
                  {item.setsReps}
                </span>
              )}
            </div>
          ))}

          {extraCount > 0 && (
            <div className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 pl-1 pt-1 flex items-center gap-1.5 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>+{extraCount} ejercicios adicionales...</span>
            </div>
          )}

          {isEmpty && !isOver && (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-1.5">
              <Coffee className="w-5 h-5 text-slate-300" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Día de Descanso</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

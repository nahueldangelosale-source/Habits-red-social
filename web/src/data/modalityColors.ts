/**
 * ═══════════════════════════════════════════════════════════════
 * PALETA DE PERIODOS — Fuente Única de Verdad
 * ═══════════════════════════════════════════════════════════════
 * 
 * Cada periodo de entrenamiento tiene un color fijo y campos
 * específicos que se muestran al entrenador.
 * 
 * REGLA: Todos los componentes de la app importan de AQUÍ.
 *        Nunca definir colores de periodo en otro archivo.
 */

export type PeriodCategory = 'TRAINING' | 'WELLNESS' | 'PREVENTION' | 'CUSTOM' | 'SYSTEM';

export interface PeriodConfig {
  id: string;
  emoji: string;           // Identificador visual rápido
  description: string;     // Explicación en 1 línea para usuarios nuevos
  isTopComercial?: boolean; // Fases estrella más usadas
  category: PeriodCategory; // Agrupador para la librería
  color: {
    bg: string;            // Color principal (fondos, badges)
    text: string;          // Color de texto sobre fondo claro
    light: string;         // Color de fondo suave (cards)
    border: string;        // Color de borde
    tailwind: string;      // Clase Tailwind para backgrounds
    tailwindText: string;  // Clase Tailwind para texto
  };
  /** Campos que se muestran al crear/editar ejercicios en este periodo */
  fields: readonly string[];
}

// ─────────────────────────────────────────────────────────────
// PALETA COMPLETA DE PERIODOS
// ─────────────────────────────────────────────────────────────

export const PERIOD_PALETTE: Record<string, PeriodConfig> = {
  // ─── A. PREPARACION GENERAL (Construcción de la base) ───
  ADAPTACION: {
    id: 'ADAPTACION',
    label: 'Adaptación',
    emoji: '🌱',
    description: 'Prepara el cuerpo (tendones y articulaciones) antes de entrenar fuerte.',
    isTopComercial: true,
    category: 'TRAINING',
    color: {
      bg: '#84cc16', text: '#4d7c0f', light: '#f7fee7', border: '#a3e635',
      tailwind: 'bg-lime-500', tailwindText: 'text-lime-600',
    },
    fields: ['peso', 'series', 'reps', 'rpe'],
  },
  HIPERTROFIA: {
    id: 'HIPERTROFIA',
    label: 'Hipertrofia',
    emoji: '🟣',
    description: 'Aumento de masa muscular. Series y repeticiones medias/altas.',
    isTopComercial: true,
    category: 'TRAINING',
    color: {
      bg: '#a855f7', text: '#7e22ce', light: '#faf5ff', border: '#c084fc',
      tailwind: 'bg-purple-500', tailwindText: 'text-purple-600',
    },
    fields: ['peso', 'series', 'reps', 'rir', 'tempo'],
  },
  AEROBICO_BASE: {
    id: 'AEROBICO_BASE',
    label: 'Cardio Base',
    emoji: '🍑',
    description: 'Foco en glúteos y piernas (el famoso "Día de Piernas").',
    isTopComercial: true,
    category: 'TRAINING',
    color: {
      bg: '#06b6d4', text: '#0891b2', light: '#ecfeff', border: '#22d3ee',
      tailwind: 'bg-cyan-500', tailwindText: 'text-cyan-600',
    },
    fields: ['duracion', 'rpe', 'descanso'],
  },

  // ─── B. PREPARACION ESPECIFICA (Optimización) ───
  FUERZA: {
    id: 'FUERZA',
    label: 'Fuerza Máxima',
    emoji: '🔴',
    description: 'Levantar muy pesado para generar más fuerza. Pocas repeticiones.',
    category: 'TRAINING',
    color: {
      bg: '#ef4444', text: '#dc2626', light: '#fef2f2', border: '#f87171',
      tailwind: 'bg-red-500', tailwindText: 'text-red-600',
    },
    fields: ['peso', 'porcentaje_1rm', 'velocidad_vbt', 'rpe'],
  },
  FUERZA_RESISTENCIA: {
    id: 'FUERZA_RESISTENCIA',
    label: 'Fuerza-Resistencia',
    emoji: '⚙️',
    description: 'Capacidad de aguantar el esfuerzo pesado por más tiempo.',
    category: 'TRAINING',
    color: {
      bg: '#f97316', text: '#ea580c', light: '#fff7ed', border: '#fb923c',
      tailwind: 'bg-orange-500', tailwindText: 'text-orange-600',
    },
    fields: ['peso', 'series', 'reps', 'descanso', 'rpe'],
  },
  POTENCIA: {
    id: 'POTENCIA',
    label: 'Potencia (Explosividad)',
    emoji: '⚡',
    description: 'Mover el peso lo más rápido posible. Saltar, lanzar, correr rápido.',
    category: 'TRAINING',
    color: {
      bg: '#eab308', text: '#ca8a04', light: '#fefce8', border: '#facc15',
      tailwind: 'bg-yellow-500', tailwindText: 'text-yellow-600',
    },
    fields: ['peso', 'velocidad_vbt', 'series', 'reps', 'rpe'],
  },
  ANAEROBICO: {
    id: 'ANAEROBICO',
    label: 'Cardio Anaeróbico',
    emoji: '🔥',
    description: 'Esfuerzos máximos cortos con poco descanso (HIIT, sprints).',
    category: 'TRAINING',
    color: {
      bg: '#f43f5e', text: '#be123c', light: '#fff1f2', border: '#fb7185',
      tailwind: 'bg-rose-500', tailwindText: 'text-rose-600',
    },
    fields: ['duracion', 'descanso', 'rpe', 'series'],
  },

  // ─── C. COMPETITIVAS (Rendimiento pico) ───
  PUESTA_A_PUNTO: {
    id: 'PUESTA_A_PUNTO',
    label: 'Puesta a Punto (Tapering)',
    emoji: '🎯',
    description: 'Bajar el volumen para eliminar la fatiga antes del gran día.',
    category: 'TRAINING',
    color: {
      bg: '#3b82f6', text: '#1d4ed8', light: '#eff6ff', border: '#60a5fa',
      tailwind: 'bg-blue-500', tailwindText: 'text-blue-600',
    },
    fields: ['peso', 'series', 'reps', 'rpe'],
  },
  COMPETICION: {
    id: 'COMPETICION',
    label: 'Competición',
    emoji: '🏆',
    description: 'Fase del torneo o evento. Entrenar solo para mantenerse.',
    category: 'TRAINING',
    color: {
      bg: '#2563eb', text: '#1e40af', light: '#dbeafe', border: '#3b82f6',
      tailwind: 'bg-blue-600', tailwindText: 'text-blue-700',
    },
    fields: ['peso', 'rpe', 'bienestar'],
  },

  // ─── E. ESTETICA / COMERCIAL ───
  RECOMPOSICION: {
    id: 'RECOMPOSICION',
    label: 'Recomposición',
    emoji: '⚖️',
    description: 'Bajar grasa y mantener músculo. Alto en proteína, volumen moderado.',
    isTopComercial: true,
    category: 'TRAINING',
    color: {
      bg: '#8b5cf6', text: '#6d28d9', light: '#f5f3ff', border: '#a78bfa',
      tailwind: 'bg-violet-500', tailwindText: 'text-violet-600',
    },
    fields: ['peso', 'series', 'reps', 'rpe'],
  },
  DEFICIT: {
    id: 'DEFICIT',
    label: 'Definición (Déficit)',
    emoji: '📉',
    description: 'Mantener el músculo perdiendo porcentaje de grasa.',
    isTopComercial: true,
    category: 'TRAINING',
    color: {
      bg: '#ec4899', text: '#be185d', light: '#fdf2f8', border: '#f472b6',
      tailwind: 'bg-pink-500', tailwindText: 'text-pink-600',
    },
    fields: ['peso', 'series', 'reps', 'rpe', 'descanso'],
  },

  // ─── WELLNESS (Bienestar y Movilidad) ───
  TRANSICION: {
    id: 'TRANSICION',
    label: 'Transición / Descanso',
    emoji: '🏖️',
    description: 'Descanso activo. Relajar mente y cuerpo tras la temporada.',
    category: 'WELLNESS',
    color: {
      bg: '#14b8a6', text: '#0f766e', light: '#f0fdfa', border: '#5eead4',
      tailwind: 'bg-teal-500', tailwindText: 'text-teal-600',
    },
    fields: ['duracion', 'bienestar', 'rpe'],
  },
  FUNDAMENTOS_MOVIMIENTO: {
    id: 'FUNDAMENTOS_MOVIMIENTO',
    label: 'Fundamentos',
    emoji: '🧘',
    description: 'Control motor básico, respiración y consciencia corporal.',
    isTopComercial: true,
    category: 'WELLNESS',
    color: {
      bg: '#0d9488', text: '#0f766e', light: '#f0fdfa', border: '#5eead4',
      tailwind: 'bg-teal-600', tailwindText: 'text-teal-700',
    },
    fields: ['duracion', 'bienestar'],
  },
  FLOW_INTEGRATIVO: {
    id: 'FLOW_INTEGRATIVO',
    label: 'Flow Integrativo',
    emoji: '🌊',
    description: 'Secuencias fluidas conectando posturas. Aumento de movilidad.',
    category: 'WELLNESS',
    color: {
      bg: '#059669', text: '#047857', light: '#ecfdf5', border: '#34d399',
      tailwind: 'bg-emerald-600', tailwindText: 'text-emerald-700',
    },
    fields: ['duracion', 'bienestar', 'rpe'],
  },

  // ─── PREVENTION (Prevención y Condición) ───
  REHABILITACION: {
    id: 'REHABILITACION',
    label: 'Rehabilitación Temprana',
    emoji: '🩹',
    description: 'Recuperación de lesiones. Cargas bajas, rango limitado y control.',
    category: 'PREVENTION',
    color: {
      bg: '#6366f1', text: '#4338ca', light: '#eef2ff', border: '#818cf8',
      tailwind: 'bg-indigo-500', tailwindText: 'text-indigo-600',
    },
    fields: ['dolor', 'peso', 'series', 'reps'],
  },
  READAPTACION: {
    id: 'READAPTACION',
    label: 'Readaptación Funcional',
    emoji: '🔄',
    description: 'Transición hacia el entrenamiento normal. Mejora de asimetrías.',
    category: 'PREVENTION',
    color: {
      bg: '#4f46e5', text: '#3730a3', light: '#eef2ff', border: '#818cf8',
      tailwind: 'bg-indigo-600', tailwindText: 'text-indigo-700',
    },
    fields: ['dolor', 'peso', 'series', 'reps', 'rpe'],
  },
  ESTABILIZACION_CORE: {
    id: 'ESTABILIZACION_CORE',
    label: 'Estabilización Core',
    emoji: '🛡️',
    description: 'Trabajo isométrico y anti-movimiento para proteger la columna.',
    isTopComercial: true,
    category: 'PREVENTION',
    color: {
      bg: '#4338ca', text: '#312e81', light: '#eef2ff', border: '#818cf8',
      tailwind: 'bg-indigo-700', tailwindText: 'text-indigo-800',
    },
    fields: ['duracion', 'series', 'rpe'],
  },

  // ─── PERSONALIZADO ───
  CUSTOM: {
    id: 'CUSTOM',
    label: 'Bloque Personalizado',
    emoji: '✏️',
    description: 'Diseña un bloque desde cero con nombre y objetivos a medida.',
    category: 'CUSTOM',
    color: {
      bg: '#475569', text: '#1e293b', light: '#f8fafc', border: '#64748b',
      tailwind: 'bg-slate-600', tailwindText: 'text-slate-700',
    },
    fields: ['peso', 'series', 'reps', 'descanso'],
  },

  // ─── SISTEMA ───
  DESCANSO: {
    id: 'DESCANSO',
    label: 'Día Libre',
    emoji: '😴',
    description: 'Día libre sin entrenamiento programado',
    category: 'SYSTEM',
    color: {
      bg: '#94a3b8', text: '#475569', light: '#f8fafc', border: '#cbd5e1',
      tailwind: 'bg-slate-400', tailwindText: 'text-slate-500',
    },
    fields: [],
  },
} as const;


// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Obtener la config de un periodo por su ID. Si no existe, devuelve DESCANSO. */
export function getPeriodConfig(modalityId?: string | null): PeriodConfig {
  if (!modalityId) return PERIOD_PALETTE.DESCANSO;
  return PERIOD_PALETTE[modalityId.toUpperCase()] ?? PERIOD_PALETTE.DESCANSO;
}

/** Lista ordenada de periodos para selectores y leyendas */
export const PERIOD_LIST: PeriodConfig[] = Object.values(PERIOD_PALETTE);

/** Lista de periodos activos (sin DESCANSO) para selectores del Plan Builder */
export const ACTIVE_PERIODS: PeriodConfig[] = PERIOD_LIST.filter(p => p.id !== 'DESCANSO');

// ─────────────────────────────────────────────────────────────
// ETIQUETAS DE CAMPOS (palabras simples)
// ─────────────────────────────────────────────────────────────

export const FIELD_LABELS: Record<string, { label: string; hint: string; unit: string }> = {
  peso:            { label: 'Peso',           hint: 'Kilos que levanta',                    unit: 'kg' },
  series:          { label: 'Series',         hint: 'Cuántas veces repite el bloque',       unit: '' },
  reps:            { label: 'Repeticiones',   hint: 'Cuántas veces levanta en cada serie',  unit: '' },
  rpe:             { label: 'Esfuerzo',       hint: 'Del 1 al 10, ¿cuánto costó?',         unit: '/10' },
  rir:             { label: 'Reps en Reserva', hint: '¿Cuántas reps más podía hacer?',      unit: '' },
  tempo:           { label: 'Tempo',          hint: 'Velocidad del movimiento (ej: 3-0-1-0)', unit: '' },
  porcentaje_1rm:  { label: '% de Máximo',    hint: 'Porcentaje de su máxima carga',        unit: '%' },
  velocidad_vbt:   { label: 'Velocidad',      hint: 'Metros por segundo de la barra',       unit: 'm/s' },
  descanso:        { label: 'Descanso',       hint: 'Segundos entre series',                unit: 'seg' },
  duracion:        { label: 'Duración',       hint: 'Segundos manteniendo la posición',     unit: 'seg' },
  bienestar:       { label: 'Bienestar',      hint: 'Del 1 al 10, ¿cómo se siente hoy?',   unit: '/10' },
  dolor:           { label: 'Dolor',          hint: 'Del 0 al 10, ¿tiene alguna molestia?', unit: '/10' },
  sueno:           { label: 'Sueño',          hint: 'Horas que durmió anoche',              unit: 'hrs' },
};

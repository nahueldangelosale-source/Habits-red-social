export type NutritionPeriodCategory = 'ESTILO_DE_VIDA' | 'GESTION_METABOLICA' | 'SALUD_GI' | 'SALUD_HORMONAL' | 'RENDIMIENTO' | 'CLINICO' | 'PERSONALIZADO';

export interface NutritionPeriodConfig {
  id: string;
  label: string;          // Nombre de la fase
  emoji: string;           // Identificador visual
  description: string;     // Breve explicación de la duración típica y objetivo
  category: NutritionPeriodCategory; // Módulo al que pertenece
  color: {
    bg: string;            // Color principal
    text: string;
    light: string;
    border: string;
    tailwind: string;
    tailwindText: string;
  };
  isTopComercial?: boolean; // Marca con estrella si es muy demandado
}

// Configuración de las categorías para la UI
export const NUTRITION_CATEGORY_LABELS: Record<NutritionPeriodCategory, { title: string, subtitle: string }> = {
  ESTILO_DE_VIDA: {
    title: 'Estilo de Vida & Conductual',
    subtitle: 'Captación B2C, resets rápidos y cambios de hábitos',
  },
  GESTION_METABOLICA: {
    title: 'Metabolismo & Composición',
    subtitle: 'Pérdida de peso y reversión de resistencia a la insulina',
  },
  SALUD_GI: {
    title: 'Salud Intestinal (GI)',
    subtitle: 'Protocolos para disbiosis, SIBO e intestino irritable',
  },
  SALUD_HORMONAL: {
    title: 'Salud Hormonal Femenina',
    subtitle: 'Sincronización del ciclo, SOP y menopausia',
  },
  RENDIMIENTO: {
    title: 'Periodización Deportiva',
    subtitle: 'Para atletas híbridos, crossfitters e hipertrofia',
  },
  CLINICO: {
    title: 'Clínico e Inmunológico',
    subtitle: 'Patologías autoinmunes y perioperatorias',
  },
  PERSONALIZADO: {
    title: 'Bloques a Medida',
    subtitle: 'Construye tu propio enfoque nutricional desde cero',
  }
};

export const NUTRITION_PERIOD_PALETTE: Record<string, NutritionPeriodConfig> = {
  // ─── Módulo 1: Estilo de Vida, Conductual y Resets ───
  AYUNO_INTERMITENTE: {
    id: 'AYUNO_INTERMITENTE',
    label: 'Ayuno Intermitente (16:8 / 14:10)',
    emoji: '⏱️',
    description: 'Restricción de ventana alimentaria para control glucémico.',
    category: 'ESTILO_DE_VIDA',
    isTopComercial: true,
    color: {
      bg: '#3b82f6', text: '#1e40af', light: '#eff6ff', border: '#93c5fd',
      tailwind: 'bg-blue-500', tailwindText: 'text-blue-700',
    }
  },
  RESET_CONDUCTUAL: {
    id: 'RESET_CONDUCTUAL',
    label: 'Reset Conductual (Whole30)',
    emoji: '🧠',
    description: 'Eliminar ultraprocesados y frenar antojos dopaminérgicos (21-30 días).',
    category: 'ESTILO_DE_VIDA',
    isTopComercial: true,
    color: {
      bg: '#8b5cf6', text: '#5b21b6', light: '#f5f3ff', border: '#c4b5fd',
      tailwind: 'bg-violet-500', tailwindText: 'text-violet-700',
    }
  },
  TRANSICION_PLANT_BASED: {
    id: 'TRANSICION_PLANT_BASED',
    label: 'Transición Plant-Based',
    emoji: '🌱',
    description: 'Adaptación enzimática a una dieta basada en plantas (4-8 semanas).',
    category: 'ESTILO_DE_VIDA',
    color: {
      bg: '#10b981', text: '#065f46', light: '#ecfdf5', border: '#6ee7b7',
      tailwind: 'bg-emerald-500', tailwindText: 'text-emerald-700',
    }
  },
  DETOX_HEPATICA: {
    id: 'DETOX_HEPATICA',
    label: 'Detoxificación Hepática Suave',
    emoji: '🍃',
    description: 'Apoyar vías de metilación y sulfatación post-excesos (7-14 días).',
    category: 'ESTILO_DE_VIDA',
    color: {
      bg: '#84cc16', text: '#3f6212', light: '#f7fee7', border: '#bef264',
      tailwind: 'bg-lime-500', tailwindText: 'text-lime-700',
    }
  },

  // ─── Módulo 2: Gestión Metabólica y Composición Corporal ───
  RESET_INSULINICO: {
    id: 'RESET_INSULINICO',
    label: 'Reset Insulínico (Keto/VLCKD)',
    emoji: '🥑',
    description: 'Forzar cetosis nutricional y bajar insulina basal (2-12 semanas).',
    category: 'GESTION_METABOLICA',
    isTopComercial: true,
    color: {
      bg: '#f59e0b', text: '#92400e', light: '#fffbeb', border: '#fcd34d',
      tailwind: 'bg-amber-500', tailwindText: 'text-amber-700',
    }
  },
  MINICUT_AGRESIVO: {
    id: 'MINICUT_AGRESIVO',
    label: 'Minicut Agresivo (-25% a -30%)',
    emoji: '⚡',
    description: 'Déficit agresivo con alta proteína (2.4-2.8 g/kg) para pérdida rápida de grasa sin catabolismo (4-6 semanas).',
    category: 'GESTION_METABOLICA',
    isTopComercial: true,
    color: {
      bg: '#e11d48', text: '#881337', light: '#fff1f2', border: '#fda4af',
      tailwind: 'bg-rose-600', tailwindText: 'text-rose-800',
    }
  },
  DEFICIT_ESTANDAR: {
    id: 'DEFICIT_ESTANDAR',
    label: 'Déficit Calórico Estándar',
    emoji: '📉',
    description: 'Pérdida sostenida de grasa sin comprometer masa magra (8-16 semanas).',
    category: 'GESTION_METABOLICA',
    isTopComercial: true,
    color: {
      bg: '#ef4444', text: '#991b1b', light: '#fef2f2', border: '#fca5a5',
      tailwind: 'bg-red-500', tailwindText: 'text-red-700',
    }
  },
  RECOVERY_DIET: {
    id: 'RECOVERY_DIET',
    label: 'Recovery Diet (Post-Déficit)',
    emoji: '🩺',
    description: 'Salto inmediato a mantenimiento calculado para restaurar leptina, T3 y eje gonadal post-déficit (2-4 semanas).',
    category: 'GESTION_METABOLICA',
    isTopComercial: true,
    color: {
      bg: '#0d9488', text: '#134e4a', light: '#f0fdfa', border: '#99f6e4',
      tailwind: 'bg-teal-600', tailwindText: 'text-teal-800',
    }
  },
  MATADOR_DIET_BREAK: {
    id: 'MATADOR_DIET_BREAK',
    label: 'Protocolo MATADOR (Diet Breaks)',
    emoji: '⏳',
    description: 'Déficit intermitente (2 sem déficit / 2 sem mantenimiento) para revertir la adaptación metabólica (12 semanas).',
    category: 'GESTION_METABOLICA',
    isTopComercial: true,
    color: {
      bg: '#d97706', text: '#78350f', light: '#fffbeb', border: '#fde68a',
      tailwind: 'bg-amber-600', tailwindText: 'text-amber-800',
    }
  },
  REVERSE_DIETING: {
    id: 'REVERSE_DIETING',
    label: 'Reverse Dieting (Escalonado)',
    emoji: '🔄',
    description: 'Recuperar tasa metabólica basal tras un déficit de forma gradual (4-12 semanas).',
    category: 'GESTION_METABOLICA',
    color: {
      bg: '#06b6d4', text: '#155e75', light: '#ecfeff', border: '#67e8f9',
      tailwind: 'bg-cyan-500', tailwindText: 'text-cyan-700',
    }
  },
  PROTECCION_GLP1: {
    id: 'PROTECCION_GLP1',
    label: 'Protección GLP-1 (Anti-Sarcopenia)',
    emoji: '🛡️',
    description: 'Prevenir pérdida muscular inducida por fármacos tipo Ozempic.',
    category: 'GESTION_METABOLICA',
    color: {
      bg: '#6366f1', text: '#3730a3', light: '#eef2ff', border: '#a5b4fc',
      tailwind: 'bg-indigo-500', tailwindText: 'text-indigo-700',
    }
  },
  MANTENIMIENTO_MED: {
    id: 'MANTENIMIENTO_MED',
    label: 'Mantenimiento (Mediterránea)',
    emoji: '🥗',
    description: 'Sostenibilidad a largo plazo y prevención cardiovascular.',
    category: 'GESTION_METABOLICA',
    color: {
      bg: '#14b8a6', text: '#0f766e', light: '#f0fdfa', border: '#5eead4',
      tailwind: 'bg-teal-500', tailwindText: 'text-teal-700',
    }
  },

  // ─── Módulo 3: Salud Intestinal y Gastrointestinal (GI) ───
  GUT_RESET: {
    id: 'GUT_RESET',
    label: 'Gut Reset / Líquidos',
    emoji: '🥣',
    description: 'Reposo digestivo agudo para desinflamación rápida (3-5 días).',
    category: 'SALUD_GI',
    isTopComercial: true,
    color: {
      bg: '#f43f5e', text: '#9f1239', light: '#fff1f2', border: '#fda4af',
      tailwind: 'bg-rose-500', tailwindText: 'text-rose-700',
    }
  },
  LOW_FODMAP: {
    id: 'LOW_FODMAP',
    label: 'Eliminación Low-FODMAP',
    emoji: '🚫',
    description: 'Reducir sustrato fermentable para mitigar gases y distensión (4-6 semanas).',
    category: 'SALUD_GI',
    color: {
      bg: '#ec4899', text: '#9d174d', light: '#fdf2f8', border: '#f9a8d4',
      tailwind: 'bg-pink-500', tailwindText: 'text-pink-700',
    }
  },
  REINTRODUCCION_FODMAP: {
    id: 'REINTRODUCCION_FODMAP',
    label: 'Reintroducción FODMAP',
    emoji: '🔍',
    description: 'Identificar umbrales de tolerancia individuales (6-8 semanas).',
    category: 'SALUD_GI',
    color: {
      bg: '#d946ef', text: '#86198f', light: '#fdf4ff', border: '#f0abfc',
      tailwind: 'bg-fuchsia-500', tailwindText: 'text-fuchsia-700',
    }
  },
  REPARACION_5R: {
    id: 'REPARACION_5R',
    label: 'Reparación Mucosa (5R)',
    emoji: '🧱',
    description: 'Sellar uniones estrechas intestinales / Leaky Gut (4-12 semanas).',
    category: 'SALUD_GI',
    color: {
      bg: '#0ea5e9', text: '#075985', light: '#f0f9ff', border: '#7dd3fc',
      tailwind: 'bg-sky-500', tailwindText: 'text-sky-700',
    }
  },

  // ─── Módulo 4: Salud Hormonal Femenina ───
  SOPORTE_LUTEO: {
    id: 'SOPORTE_LUTEO',
    label: 'Soporte Lúteo (Seed Cycling)',
    emoji: '🌻',
    description: 'Mitigar SPM y favorecer producción de progesterona (14 días).',
    category: 'SALUD_HORMONAL',
    color: {
      bg: '#eab308', text: '#854d0e', light: '#fefce8', border: '#fde047',
      tailwind: 'bg-yellow-500', tailwindText: 'text-yellow-700',
    }
  },
  RESCATE_ANDROGENICO: {
    id: 'RESCATE_ANDROGENICO',
    label: 'Rescate Androgénico (SOP)',
    emoji: '⚖️',
    description: 'Reducir andrógenos libres mediante control de insulina (8-12 semanas).',
    category: 'SALUD_HORMONAL',
    color: {
      bg: '#f97316', text: '#9a3412', light: '#fff7ed', border: '#fdba74',
      tailwind: 'bg-orange-500', tailwindText: 'text-orange-700',
    }
  },
  TRANSICION_MENOPAUSICA: {
    id: 'TRANSICION_MENOPAUSICA',
    label: 'Transición Menopáusica',
    emoji: '🌸',
    description: 'Mitigar sofocos, proteger densidad ósea y masa muscular.',
    category: 'SALUD_HORMONAL',
    color: {
      bg: '#fb7185', text: '#be123c', light: '#fff1f2', border: '#fda4af',
      tailwind: 'bg-rose-400', tailwindText: 'text-rose-700',
    }
  },

  // ─── Módulo 5: Periodización Deportiva y Rendimiento ───
  CICLADO_CARBOHIDRATOS: {
    id: 'CICLADO_CARBOHIDRATOS',
    label: 'Ciclado de Carbohidratos',
    emoji: '🚴',
    description: 'Sincronizar energía con demanda del entrenamiento (Semanal).',
    category: 'RENDIMIENTO',
    isTopComercial: true,
    color: {
      bg: '#2563eb', text: '#1e40af', light: '#eff6ff', border: '#93c5fd',
      tailwind: 'bg-blue-600', tailwindText: 'text-blue-800',
    }
  },
  SUPERAVIT_PROTEICO: {
    id: 'SUPERAVIT_PROTEICO',
    label: 'Superávit Proteico (Lean Bulk)',
    emoji: '💪',
    description: 'Maximizar síntesis proteica e hipertrofia muscular (12-24 semanas).',
    category: 'RENDIMIENTO',
    color: {
      bg: '#7c3aed', text: '#4c1d95', light: '#f5f3ff', border: '#c4b5fd',
      tailwind: 'bg-violet-600', tailwindText: 'text-violet-800',
    }
  },
  CARB_LOADING: {
    id: 'CARB_LOADING',
    label: 'Supercompensación (Carb Loading)',
    emoji: '🔋',
    description: 'Saturar depósitos de glucógeno previo a competencia (2-4 días).',
    category: 'RENDIMIENTO',
    color: {
      bg: '#059669', text: '#064e3b', light: '#ecfdf5', border: '#6ee7b7',
      tailwind: 'bg-emerald-600', tailwindText: 'text-emerald-800',
    }
  },
  REFEED_CARBS: {
    id: 'REFEED_CARBS',
    label: 'Refeed Estructurado de Carbohidratos',
    emoji: '🍚',
    description: 'Sobrealimentación de 24-48h con grasa mínima (<30g) y altos hidratos para disparar leptina (+28%).',
    category: 'RENDIMIENTO',
    isTopComercial: true,
    color: {
      bg: '#0284c7', text: '#075985', light: '#f0f9ff', border: '#bae6fd',
      tailwind: 'bg-sky-600', tailwindText: 'text-sky-800',
    }
  },

  // ─── Módulo 6: Clínico e Inmunológico ───
  AIP_ELIMINACION: {
    id: 'AIP_ELIMINACION',
    label: 'AIP Eliminación (Autoinmune)',
    emoji: '🩺',
    description: 'Apagar reactividad del sistema inmune e inflamación (6-12 semanas).',
    category: 'CLINICO',
    color: {
      bg: '#dc2626', text: '#7f1d1d', light: '#fef2f2', border: '#fca5a5',
      tailwind: 'bg-red-600', tailwindText: 'text-red-800',
    }
  },
  INMUNONUTRICION_PREOP: {
    id: 'INMUNONUTRICION_PREOP',
    label: 'Inmunonutrición Prehabilitación',
    emoji: '🛡️',
    description: 'Reducir morbilidad infecciosa post-quirúrgica (10-14 días).',
    category: 'CLINICO',
    color: {
      bg: '#4f46e5', text: '#312e81', light: '#eef2ff', border: '#a5b4fc',
      tailwind: 'bg-indigo-600', tailwindText: 'text-indigo-800',
    }
  },
  TRANSICION_ENTERAL: {
    id: 'TRANSICION_ENTERAL',
    label: 'Transición Enteral / Post-Op',
    emoji: '🏥',
    description: 'Reacondicionar el tracto digestivo de forma segura (3-7 días).',
    category: 'CLINICO',
    color: {
      bg: '#0891b2', text: '#164e63', light: '#ecfeff', border: '#67e8f9',
      tailwind: 'bg-cyan-600', tailwindText: 'text-cyan-800',
    }
  },

  // ─── Personalizado ───
  CICLO_PERSONALIZADO: {
    id: 'CICLO_PERSONALIZADO',
    label: 'Bloque Nutricional Personalizado',
    emoji: '✨',
    description: 'Configura macros, calorías y restricciones desde cero.',
    category: 'PERSONALIZADO',
    color: {
      bg: '#64748b', text: '#334155', light: '#f8fafc', border: '#cbd5e1',
      tailwind: 'bg-slate-500', tailwindText: 'text-slate-700',
    }
  }
};

export const getNutritionPeriodConfig = (id: string): NutritionPeriodConfig => {
  return NUTRITION_PERIOD_PALETTE[id] || NUTRITION_PERIOD_PALETTE['CICLO_PERSONALIZADO'];
};

export const getNutritionPeriodsByCategory = (): Record<NutritionPeriodCategory, NutritionPeriodConfig[]> => {
  const result = {} as Record<NutritionPeriodCategory, NutritionPeriodConfig[]>;
  (Object.keys(NUTRITION_CATEGORY_LABELS) as NutritionPeriodCategory[]).forEach(cat => {
    result[cat] = [];
  });
  
  Object.values(NUTRITION_PERIOD_PALETTE).forEach(p => {
    result[p.category].push(p);
  });
  
  return result;
};

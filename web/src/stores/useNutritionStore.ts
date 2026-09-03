import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getPresetByPhaseId, INITIAL_SEED_RECIPES } from '../data/presets';

// -----------------------------------------------------------------------------
// Tipos y Taxonomía del Shadow Data y Smart Blocks
// -----------------------------------------------------------------------------
export type MetabolicAnchor = 'DEFICIT' | 'SURPLUS' | 'MAINTENANCE' | 'FASTING' | null;

export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface ShadowContext {
  currentWeightKg: number;
  morningHrvMs: number;
  trainingLoadType: string;
}

export interface RecipeIngredient {
  saraId: string;
  name: string;
  amount: number;        // grams (raw)
  unit: string;          // 'g' | 'ml' | 'unidad'
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

export interface Recipe {
  id: string;
  name: string;
  tags: string[];          // e.g., 'vegano', 'sin_gluten', 'alto_proteina'
  servings: number;        // porciones que rinde
  prepTimeMin: number;     // tiempo de preparación en minutos
  ingredients: RecipeIngredient[];
  totalMacros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  createdAt: string;       // ISO date
  updatedAt: string;       // ISO date
}

export interface DailyMealOption {
  id: string;
  name: string;
  recipeId?: string;
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
      calories: number;
    };
  }[];
  totalMacros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

export interface DailyMeal {
  id: string;
  time: string;
  mealType: string;
  options: DailyMealOption[];
}

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DAYS_OF_WEEK_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export function getCurrentDayOfWeekName(): string {
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dayNames[new Date().getDay()];
}

export const DEFAULT_DAILY_MEALS: DailyMeal[] = [
  {
    id: 'm1',
    time: '08:00',
    mealType: 'Desayuno',
    options: [
      {
        id: 'opt_desayuno_1',
        name: 'Tostadas con Palta y Huevo',
        recipeId: 'rec_tostadas_palta_huevo',
        ingredients: [
          { id: 'i1', name: 'Pan integral', quantity: 60, unit: 'g', macros: { protein: 6, carbs: 28, fats: 2, calories: 154 } },
          { id: 'i2', name: 'Huevos enteros', quantity: 2, unit: 'u', macros: { protein: 12, carbs: 1, fats: 10, calories: 142 } },
          { id: 'i3', name: 'Palta Hass', quantity: 40, unit: 'g', macros: { protein: 1, carbs: 3, fats: 6, calories: 64 } }
        ],
        totalMacros: { protein: 19, carbs: 32, fats: 18, calories: 360 }
      },
      {
        id: 'opt_desayuno_2',
        name: 'Yogur con Granola y Frutas',
        recipeId: 'rec_yogur_granola_frutas',
        ingredients: [
          { id: 'i4', name: 'Yogur Griego natural', quantity: 200, unit: 'g', macros: { protein: 18, carbs: 8, fats: 2, calories: 122 } },
          { id: 'i5', name: 'Granola artesanal', quantity: 30, unit: 'g', macros: { protein: 3, carbs: 20, fats: 5, calories: 137 } },
          { id: 'i6', name: 'Frutos rojos frescos', quantity: 80, unit: 'g', macros: { protein: 1, carbs: 12, fats: 0, calories: 52 } }
        ],
        totalMacros: { protein: 22, carbs: 40, fats: 7, calories: 311 }
      }
    ]
  },
  {
    id: 'm2',
    time: '13:00',
    mealType: 'Almuerzo',
    options: [
      {
        id: 'opt_almuerzo_1',
        name: 'Milanesa al Horno con Ensalada',
        recipeId: 'rec_milanesa_horno',
        ingredients: [
          { id: 'i7', name: 'Peceto magro al horno', quantity: 180, unit: 'g', macros: { protein: 42, carbs: 12, fats: 6, calories: 270 } },
          { id: 'i8', name: 'Mix hojas verdes & tomate', quantity: 150, unit: 'g', macros: { protein: 2, carbs: 6, fats: 0, calories: 32 } },
          { id: 'i9', name: 'Aceite de oliva extra virgen', quantity: 10, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 9, calories: 81 } }
        ],
        totalMacros: { protein: 44, carbs: 18, fats: 15, calories: 383 }
      },
      {
        id: 'opt_almuerzo_2',
        name: 'Pollo con Arroz y Brócoli',
        recipeId: 'rec_pollo_arroz_brocoli',
        ingredients: [
          { id: 'i10', name: 'Pechuga de pollo a la plancha', quantity: 200, unit: 'g', macros: { protein: 46, carbs: 0, fats: 3, calories: 211 } },
          { id: 'i11', name: 'Arroz blanco cocido', quantity: 150, unit: 'g', macros: { protein: 4, carbs: 42, fats: 0, calories: 184 } },
          { id: 'i12', name: 'Brócoli al vapor', quantity: 100, unit: 'g', macros: { protein: 3, carbs: 5, fats: 0, calories: 32 } }
        ],
        totalMacros: { protein: 53, carbs: 47, fats: 3, calories: 427 }
      }
    ]
  },
  {
    id: 'm3',
    time: '17:30',
    mealType: 'Merienda / Snack',
    options: [
      {
        id: 'opt_merienda_1',
        name: 'Batido Post-Entreno',
        recipeId: 'rec_batido_post_entreno',
        ingredients: [
          { id: 'i13', name: 'Proteína Whey (1 scoop)', quantity: 30, unit: 'g', macros: { protein: 24, carbs: 2, fats: 1, calories: 113 } },
          { id: 'i14', name: 'Leche descremada', quantity: 200, unit: 'ml', macros: { protein: 7, carbs: 10, fats: 1, calories: 77 } },
          { id: 'i15', name: 'Banana madura', quantity: 100, unit: 'g', macros: { protein: 1, carbs: 23, fats: 0, calories: 96 } }
        ],
        totalMacros: { protein: 32, carbs: 35, fats: 2, calories: 286 }
      },
      {
        id: 'opt_merienda_2',
        name: 'Wrap de Pollo y Verduras',
        recipeId: 'rec_wrap_pollo_verduras',
        ingredients: [
          { id: 'i16', name: 'Tortilla integral', quantity: 1, unit: 'u', macros: { protein: 4, carbs: 22, fats: 3, calories: 131 } },
          { id: 'i17', name: 'Pollo desmenuzado', quantity: 80, unit: 'g', macros: { protein: 18, carbs: 0, fats: 2, calories: 90 } },
          { id: 'i18', name: 'Palta y tomate', quantity: 50, unit: 'g', macros: { protein: 1, carbs: 4, fats: 4, calories: 56 } }
        ],
        totalMacros: { protein: 23, carbs: 26, fats: 9, calories: 277 }
      }
    ]
  },
  {
    id: 'm4',
    time: '20:30',
    mealType: 'Cena',
    options: [
      {
        id: 'opt_cena_1',
        name: 'Salmón al Horno con Papas',
        recipeId: 'rec_salmon_horno_papas',
        ingredients: [
          { id: 'i19', name: 'Filete de salmón rosado', quantity: 180, unit: 'g', macros: { protein: 36, carbs: 0, fats: 22, calories: 344 } },
          { id: 'i20', name: 'Papa asada en cubos', quantity: 150, unit: 'g', macros: { protein: 3, carbs: 30, fats: 0, calories: 132 } },
          { id: 'i21', name: 'Espárragos salteados', quantity: 80, unit: 'g', macros: { protein: 2, carbs: 3, fats: 0, calories: 20 } }
        ],
        totalMacros: { protein: 41, carbs: 33, fats: 22, calories: 496 }
      },
      {
        id: 'opt_cena_2',
        name: 'Revuelto de Huevos con Verduras',
        recipeId: 'rec_revuelto_huevos_verduras',
        ingredients: [
          { id: 'i22', name: 'Huevos enteros + claras', quantity: 3, unit: 'u', macros: { protein: 22, carbs: 2, fats: 10, calories: 186 } },
          { id: 'i23', name: 'Espinaca y champiñones', quantity: 120, unit: 'g', macros: { protein: 3, carbs: 5, fats: 0, calories: 32 } },
          { id: 'i24', name: 'Aceite de coco/oliva', quantity: 5, unit: 'g', macros: { protein: 0, carbs: 0, fats: 5, calories: 45 } }
        ],
        totalMacros: { protein: 25, carbs: 7, fats: 15, calories: 263 }
      }
    ]
  }
];

export const DEFAULT_WEEKLY_SCHEDULE: Record<string, DailyMeal[]> = {
  'Lunes': JSON.parse(JSON.stringify(DEFAULT_DAILY_MEALS)),
  'Martes': [
    {
      id: 'm1',
      time: '08:00',
      mealType: 'Desayuno',
      options: [
        {
          id: 'opt_des_mar',
          name: 'Yogur Griego con Granola y Frutas',
          ingredients: [
            { id: 'i_mar_1', name: 'Yogur Griego Natural', quantity: 200, unit: 'g', macros: { protein: 20, carbs: 8, fats: 0.5, calories: 120 } },
            { id: 'i_mar_2', name: 'Granola baja en azúcar', quantity: 40, unit: 'g', macros: { protein: 4, carbs: 26, fats: 5, calories: 165 } },
            { id: 'i_mar_3', name: 'Banana madura', quantity: 80, unit: 'g', macros: { protein: 1, carbs: 18, fats: 0.2, calories: 75 } }
          ],
          totalMacros: { protein: 25, carbs: 52, fats: 6, calories: 360 }
        }
      ]
    },
    {
      id: 'm2',
      time: '13:00',
      mealType: 'Almuerzo',
      options: [
        {
          id: 'opt_alm_mar',
          name: 'Pechuga de Pollo con Arroz Integral & Brócoli',
          ingredients: [
            { id: 'i_mar_4', name: 'Pechuga de Pollo grillada', quantity: 180, unit: 'g', macros: { protein: 41, carbs: 0, fats: 3, calories: 198 } },
            { id: 'i_mar_5', name: 'Arroz Integral cocido', quantity: 120, unit: 'g', macros: { protein: 3.5, carbs: 32, fats: 1, calories: 150 } },
            { id: 'i_mar_6', name: 'Brócoli al vapor', quantity: 100, unit: 'g', macros: { protein: 3, carbs: 5, fats: 0.4, calories: 35 } },
            { id: 'i_mar_7', name: 'Aceite de oliva', quantity: 5, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 4.5, calories: 40 } }
          ],
          totalMacros: { protein: 47.5, carbs: 37, fats: 8.9, calories: 423 }
        }
      ]
    },
    {
      id: 'm3',
      time: '17:30',
      mealType: 'Merienda / Snack',
      options: [
        {
          id: 'opt_mer_mar',
          name: 'Sandwich Integral de Pavo & Queso Magro',
          ingredients: [
            { id: 'i_mar_8', name: 'Pan integral', quantity: 60, unit: 'g', macros: { protein: 6, carbs: 28, fats: 2, calories: 154 } },
            { id: 'i_mar_9', name: 'Pechuga de pavo natural', quantity: 60, unit: 'g', macros: { protein: 14, carbs: 0.5, fats: 1, calories: 65 } },
            { id: 'i_mar_10', name: 'Queso magro', quantity: 30, unit: 'g', macros: { protein: 7, carbs: 0.5, fats: 4, calories: 65 } }
          ],
          totalMacros: { protein: 27, carbs: 29, fats: 7, calories: 284 }
        }
      ]
    },
    {
      id: 'm4',
      time: '20:30',
      mealType: 'Cena',
      options: [
        {
          id: 'opt_cen_mar',
          name: 'Tortilla de Espinacas & Claras con Tomates Cherry',
          ingredients: [
            { id: 'i_mar_11', name: 'Claras de Huevo', quantity: 4, unit: 'u', macros: { protein: 16, carbs: 1, fats: 0.2, calories: 70 } },
            { id: 'i_mar_12', name: 'Huevo Entero', quantity: 1, unit: 'u', macros: { protein: 6.5, carbs: 0.3, fats: 5, calories: 72 } },
            { id: 'i_mar_13', name: 'Espinacas cocidas', quantity: 150, unit: 'g', macros: { protein: 4, carbs: 3, fats: 0.5, calories: 35 } },
            { id: 'i_mar_14', name: 'Queso Magro', quantity: 40, unit: 'g', macros: { protein: 8, carbs: 1, fats: 5, calories: 80 } },
            { id: 'i_mar_15', name: 'Tomates Cherry', quantity: 100, unit: 'g', macros: { protein: 1, carbs: 4, fats: 0.2, calories: 22 } }
          ],
          totalMacros: { protein: 35.5, carbs: 9.3, fats: 10.9, calories: 279 }
        }
      ]
    }
  ],
  'Miércoles': [
    {
      id: 'm1',
      time: '08:00',
      mealType: 'Desayuno',
      options: [
        {
          id: 'opt_des_mie',
          name: 'Pancakes de Avena & Claras con Frutos Rojos',
          ingredients: [
            { id: 'i_mie_1', name: 'Harina de Avena', quantity: 50, unit: 'g', macros: { protein: 7, carbs: 33, fats: 3, calories: 185 } },
            { id: 'i_mie_2', name: 'Claras de Huevo', quantity: 4, unit: 'u', macros: { protein: 16, carbs: 1, fats: 0.2, calories: 70 } },
            { id: 'i_mie_3', name: 'Frutos Rojos / Arándanos', quantity: 60, unit: 'g', macros: { protein: 0.5, carbs: 12, fats: 0.2, calories: 50 } },
            { id: 'i_mie_4', name: 'Miel pura', quantity: 15, unit: 'g', macros: { protein: 0, carbs: 12, fats: 0, calories: 48 } }
          ],
          totalMacros: { protein: 23.5, carbs: 58, fats: 3.4, calories: 353 }
        }
      ]
    },
    {
      id: 'm2',
      time: '13:00',
      mealType: 'Almuerzo',
      options: [
        {
          id: 'opt_alm_mie',
          name: 'Wok de Lomo Vacuno Magro con Quinoa & Vegetales',
          ingredients: [
            { id: 'i_mie_5', name: 'Lomo Vacuno Magro', quantity: 160, unit: 'g', macros: { protein: 35, carbs: 0, fats: 5, calories: 192 } },
            { id: 'i_mie_6', name: 'Quinoa cocida', quantity: 100, unit: 'g', macros: { protein: 4.5, carbs: 21, fats: 2, calories: 120 } },
            { id: 'i_mie_7', name: 'Mix Vegetales (Zanahoria, Zucchini, Morrones)', quantity: 150, unit: 'g', macros: { protein: 2, carbs: 8, fats: 0.5, calories: 45 } },
            { id: 'i_mie_8', name: 'Aceite de sésamo/oliva', quantity: 5, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 4.5, calories: 40 } }
          ],
          totalMacros: { protein: 41.5, carbs: 29, fats: 12, calories: 397 }
        }
      ]
    },
    {
      id: 'm3',
      time: '17:30',
      mealType: 'Merienda / Snack',
      options: [
        {
          id: 'opt_mer_mie',
          name: 'Porridge Caliente de Avena con Manzana & Canela',
          ingredients: [
            { id: 'i_mie_9', name: 'Avena en hojuelas', quantity: 45, unit: 'g', macros: { protein: 6, carbs: 27, fats: 3, calories: 162 } },
            { id: 'i_mie_10', name: 'Proteína Whey', quantity: 20, unit: 'g', macros: { protein: 16, carbs: 1, fats: 0.8, calories: 75 } },
            { id: 'i_mie_11', name: 'Manzana cortada', quantity: 80, unit: 'g', macros: { protein: 0.3, carbs: 11, fats: 0.1, calories: 46 } }
          ],
          totalMacros: { protein: 22.3, carbs: 39, fats: 3.9, calories: 283 }
        }
      ]
    },
    {
      id: 'm4',
      time: '20:30',
      mealType: 'Cena',
      options: [
        {
          id: 'opt_cen_mie',
          name: 'Filete de Merluza al Limón con Puré de Calabaza',
          ingredients: [
            { id: 'i_mie_12', name: 'Filete de Merluza / Pescado blanco', quantity: 200, unit: 'g', macros: { protein: 36, carbs: 0, fats: 2.4, calories: 170 } },
            { id: 'i_mie_13', name: 'Puré de Calabaza / Zapallo', quantity: 180, unit: 'g', macros: { protein: 2, carbs: 16, fats: 0.4, calories: 75 } },
            { id: 'i_mie_14', name: 'Aceite de oliva extra virgen', quantity: 8, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 7.2, calories: 65 } }
          ],
          totalMacros: { protein: 38, carbs: 16, fats: 10, calories: 310 }
        }
      ]
    }
  ],
  'Jueves': JSON.parse(JSON.stringify(DEFAULT_DAILY_MEALS)),
  'Viernes': [
    {
      id: 'm1',
      time: '08:00',
      mealType: 'Desayuno',
      options: [
        {
          id: 'opt_des_vie',
          name: 'Omelette de Claras con Queso Magro & Pan',
          ingredients: [
            { id: 'i_vie_1', name: 'Claras de Huevo', quantity: 4, unit: 'u', macros: { protein: 16, carbs: 1, fats: 0.2, calories: 70 } },
            { id: 'i_vie_2', name: 'Queso Magro untable', quantity: 40, unit: 'g', macros: { protein: 5, carbs: 1.5, fats: 1, calories: 35 } },
            { id: 'i_vie_3', name: 'Pan integral', quantity: 60, unit: 'g', macros: { protein: 6, carbs: 28, fats: 2, calories: 154 } },
            { id: 'i_vie_4', name: 'Tomates Cherry', quantity: 80, unit: 'g', macros: { protein: 1, carbs: 3, fats: 0.1, calories: 18 } }
          ],
          totalMacros: { protein: 28, carbs: 33.5, fats: 3.3, calories: 277 }
        }
      ]
    },
    {
      id: 'm2',
      time: '13:00',
      mealType: 'Almuerzo',
      options: [
        {
          id: 'opt_alm_vie',
          name: 'Milanesa de Peceto al Horno con Ensalada',
          ingredients: [
            { id: 'i_vie_5', name: 'Peceto magro al horno', quantity: 180, unit: 'g', macros: { protein: 42, carbs: 12, fats: 6, calories: 270 } },
            { id: 'i_vie_6', name: 'Mix hojas verdes & tomate', quantity: 150, unit: 'g', macros: { protein: 2, carbs: 6, fats: 0, calories: 32 } },
            { id: 'i_vie_7', name: 'Aceite de oliva extra virgen', quantity: 10, unit: 'ml', macros: { protein: 0, carbs: 0, fats: 9, calories: 81 } }
          ],
          totalMacros: { protein: 44, carbs: 18, fats: 15, calories: 383 }
        }
      ]
    },
    {
      id: 'm3',
      time: '17:30',
      mealType: 'Merienda / Snack',
      options: [
        {
          id: 'opt_mer_vie',
          name: 'Batido Post-Entreno',
          ingredients: [
            { id: 'i_vie_8', name: 'Proteína Whey (1 scoop)', quantity: 30, unit: 'g', macros: { protein: 24, carbs: 2, fats: 1, calories: 113 } },
            { id: 'i_vie_9', name: 'Leche descremada', quantity: 200, unit: 'ml', macros: { protein: 7, carbs: 10, fats: 1, calories: 77 } },
            { id: 'i_vie_10', name: 'Banana madura', quantity: 100, unit: 'g', macros: { protein: 1, carbs: 23, fats: 0, calories: 96 } }
          ],
          totalMacros: { protein: 32, carbs: 35, fats: 2, calories: 286 }
        }
      ]
    },
    {
      id: 'm4',
      time: '20:30',
      mealType: 'Cena',
      options: [
        {
          id: 'opt_cen_vie',
          name: 'Fajitas de Pollo con Pimientos & Palta',
          ingredients: [
            { id: 'i_vie_11', name: 'Pechuga de Pollo en tiras', quantity: 150, unit: 'g', macros: { protein: 34, carbs: 0, fats: 2.5, calories: 165 } },
            { id: 'i_vie_12', name: 'Tortillas de maíz / integrales (2u)', quantity: 60, unit: 'g', macros: { protein: 4, carbs: 28, fats: 2, calories: 145 } },
            { id: 'i_vie_13', name: 'Pimientos y Cebolla salteados', quantity: 100, unit: 'g', macros: { protein: 1.5, carbs: 6, fats: 0.2, calories: 32 } },
            { id: 'i_vie_14', name: 'Palta en cubos', quantity: 35, unit: 'g', macros: { protein: 0.7, carbs: 3, fats: 5.2, calories: 56 } }
          ],
          totalMacros: { protein: 40.2, carbs: 37, fats: 9.9, calories: 398 }
        }
      ]
    }
  ],
  'Sábado': JSON.parse(JSON.stringify(DEFAULT_DAILY_MEALS)),
  'Domingo': [
    {
      id: 'm1',
      time: '09:00',
      mealType: 'Desayuno',
      options: [
        {
          id: 'opt_des_dom',
          name: 'Tostadas con Palta y Huevo',
          ingredients: [
            { id: 'i_dom_1', name: 'Pan integral', quantity: 60, unit: 'g', macros: { protein: 6, carbs: 28, fats: 2, calories: 154 } },
            { id: 'i_dom_2', name: 'Huevos enteros', quantity: 2, unit: 'u', macros: { protein: 12, carbs: 1, fats: 10, calories: 142 } },
            { id: 'i_dom_3', name: 'Palta Hass', quantity: 40, unit: 'g', macros: { protein: 1, carbs: 3, fats: 6, calories: 64 } }
          ],
          totalMacros: { protein: 19, carbs: 32, fats: 18, calories: 360 }
        }
      ]
    },
    {
      id: 'm2',
      time: '13:30',
      mealType: 'Almuerzo',
      options: [
        {
          id: 'opt_alm_dom',
          name: 'Filete de Salmón con Puré de Batata',
          ingredients: [
            { id: 'i_dom_4', name: 'Filete de Salmón Rosado', quantity: 150, unit: 'g', macros: { protein: 30, carbs: 0, fats: 18, calories: 285 } },
            { id: 'i_dom_5', name: 'Batata al vapor / Puré', quantity: 120, unit: 'g', macros: { protein: 2, carbs: 29, fats: 0.2, calories: 126 } },
            { id: 'i_dom_6', name: 'Espinacas frescas salteadas', quantity: 100, unit: 'g', macros: { protein: 2.5, carbs: 2, fats: 0.3, calories: 20 } }
          ],
          totalMacros: { protein: 34.5, carbs: 31, fats: 18.5, calories: 431 }
        }
      ]
    },
    {
      id: 'm3',
      time: '17:30',
      mealType: 'Merienda / Snack',
      options: [
        {
          id: 'opt_mer_dom',
          name: 'Yogur Griego con Granola y Frutas',
          ingredients: [
            { id: 'i_dom_7', name: 'Yogur Griego Natural', quantity: 200, unit: 'g', macros: { protein: 20, carbs: 8, fats: 0.5, calories: 120 } },
            { id: 'i_dom_8', name: 'Granola baja en azúcar', quantity: 40, unit: 'g', macros: { protein: 4, carbs: 26, fats: 5, calories: 165 } },
            { id: 'i_dom_9', name: 'Banana madura', quantity: 80, unit: 'g', macros: { protein: 1, carbs: 18, fats: 0.2, calories: 75 } }
          ],
          totalMacros: { protein: 25, carbs: 52, fats: 6, calories: 360 }
        }
      ]
    },
    {
      id: 'm4',
      time: '20:30',
      mealType: 'Cena',
      options: [
        {
          id: 'opt_cen_dom',
          name: 'Revuelto de Huevos con Verduras',
          ingredients: [
            { id: 'i_dom_10', name: 'Huevos enteros + claras', quantity: 3, unit: 'u', macros: { protein: 22, carbs: 2, fats: 10, calories: 186 } },
            { id: 'i_dom_11', name: 'Espinaca y champiñones', quantity: 120, unit: 'g', macros: { protein: 3, carbs: 5, fats: 0, calories: 32 } },
            { id: 'i_dom_12', name: 'Aceite de coco/oliva', quantity: 5, unit: 'g', macros: { protein: 0, carbs: 0, fats: 5, calories: 45 } }
          ],
          totalMacros: { protein: 25, carbs: 7, fats: 15, calories: 263 }
        }
      ]
    }
  ]
};

const DEFAULT_WEEKLY_LOGISTICS: Record<string, Record<string, 'cocina' | 'delivery' | 'social'>> = {
  'Lunes': { m1: 'cocina', m2: 'cocina', m3: 'cocina', m4: 'cocina' },
  'Martes': { m1: 'cocina', m2: 'cocina', m3: 'cocina', m4: 'cocina' },
  'Miércoles': { m1: 'cocina', m2: 'cocina', m3: 'cocina', m4: 'delivery' },
  'Jueves': { m1: 'cocina', m2: 'cocina', m3: 'cocina', m4: 'cocina' },
  'Viernes': { m1: 'cocina', m2: 'cocina', m3: 'cocina', m4: 'social' },
  'Sábado': { m1: 'cocina', m2: 'social', m3: 'cocina', m4: 'social' },
  'Domingo': { m1: 'cocina', m2: 'social', m3: 'cocina', m4: 'cocina' },
};

interface NutritionState {
  // 1. Ancla Metabólica
  metabolicAnchor: MetabolicAnchor;
  setMetabolicAnchor: (anchor: MetabolicAnchor) => void;

  // 2. Carga de Macros
  macros: Macros;
  setMacro: (macro: keyof Macros, value: number) => void;

  // 3. Moduladores de Hábito
  habitHydrationPeak: boolean;
  setHabitHydrationPeak: (val: boolean) => void;
  habitVisualReward: boolean;
  setHabitVisualReward: (val: boolean) => void;

  // 4. Válvula de Escape
  escapeValveNotes: string;
  setEscapeValveNotes: (notes: string) => void;
  
  // 5. Gobernanza: Telemetría del Rebel Meter
  clinicalComplianceBreach: boolean;
  evaluateTextCompliance: () => void;

  // Shadow Context (Datos Biométricos Ocultos)
  shadowContext: ShadowContext;
  
  // Submit action
  generatePayload: () => object;

  // Recetas CRUD
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateRecipe: (id: string, updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteRecipe: (id: string) => void;
  duplicateRecipe: (id: string) => Recipe | null;
  getRecipeById: (id: string) => Recipe | undefined;
  
  // Plan Activo & Comidas Diarias
  activePlan: any;
  setActivePlan: (plan: any) => void;
  dailyMealPlan: DailyMeal[];
  completedMeals: Record<string, string>; // { [mealId]: optionId }
  setDailyMealPlan: (plan: DailyMeal[]) => void;
  completeMeal: (mealId: string, optionId?: string) => void;
  uncompleteMeal: (mealId: string) => void;
  resetCompletedMeals: () => void;
  getDailyMacroProgress: () => { protein: number; carbs: number; fats: number; calories: number };
  loadPresetPhase: (phaseId: string) => boolean;

  // Plan Semanal & Logística
  weeklySchedule: Record<string, DailyMeal[]>;
  weeklyLogistics: Record<string, Record<string, 'cocina' | 'delivery' | 'social'>>;
  updateWeeklyMealOption: (day: string, mealId: string, newOption: DailyMealOption) => void;
  updateDailyMealOption: (mealId: string, newOption: DailyMealOption) => void;
  setWeeklyLogistic: (day: string, mealId: string, strategy: 'cocina' | 'delivery' | 'social') => void;

  // Módulo de Compras (Checklist Interactivo)
  purchasedShoppingItems: string[];
  toggleShoppingItem: (itemId: string) => void;
  clearPurchasedShoppingItems: () => void;
  markAllShoppingItemsPurchased: (itemIds: string[]) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    devtools(
      (set, get) => ({
      metabolicAnchor: null,
      setMetabolicAnchor: (anchor) => set({ metabolicAnchor: anchor }, false, 'setMetabolicAnchor'),

      recipes: INITIAL_SEED_RECIPES,
      addRecipe: (recipe) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        set(
          (state) => ({
            recipes: [...state.recipes, { ...recipe, id, createdAt: now, updatedAt: now }]
          }),
          false,
          'addRecipe'
        );
        return id;
      },
      updateRecipe: (id, updates) =>
        set(
          (state) => ({
            recipes: state.recipes.map((r) =>
              r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
            )
          }),
          false,
          'updateRecipe'
        ),
      deleteRecipe: (id) =>
        set(
          (state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }),
          false,
          'deleteRecipe'
        ),
      duplicateRecipe: (id) => {
        const state = get();
        const original = state.recipes.find((r) => r.id === id);
        if (!original) return null;

        const newId = crypto.randomUUID();
        const now = new Date().toISOString();
        const copy: Recipe = {
          ...original,
          id: newId,
          name: `${original.name} (copia)`,
          createdAt: now,
          updatedAt: now,
          ingredients: original.ingredients.map((ing) => ({
            ...ing,
            macros: { ...ing.macros }
          })),
          totalMacros: { ...original.totalMacros }
        };

        set(
          (state) => ({ recipes: [...state.recipes, copy] }),
          false,
          'duplicateRecipe'
        );
        return copy;
      },
      getRecipeById: (id) => get().recipes.find((r) => r.id === id),
      
      activePlan: null,
      setActivePlan: (plan) => set({ activePlan: plan }, false, 'setActivePlan'),

      // Comidas Diarias y Adherencia del Atleta
      dailyMealPlan: DEFAULT_DAILY_MEALS,
      completedMeals: {},
      setDailyMealPlan: (plan) => set({ dailyMealPlan: plan }, false, 'setDailyMealPlan'),
      completeMeal: (mealId, optionId = 'default') => {
        set(
          (state) => ({
            completedMeals: { ...state.completedMeals, [mealId]: optionId }
          }),
          false,
          'completeMeal'
        );
        // Otorgar XP al atleta por registrar comida
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('xp:award', {
              detail: { source: 'meal', amount: 20 }
            })
          );
        }
      },
      uncompleteMeal: (mealId) =>
        set(
          (state) => {
            const next = { ...state.completedMeals };
            delete next[mealId];
            return { completedMeals: next };
          },
          false,
          'uncompleteMeal'
        ),
      resetCompletedMeals: () => set({ completedMeals: {} }, false, 'resetCompletedMeals'),
      getDailyMacroProgress: () => {
        const { dailyMealPlan, completedMeals } = get();
        let p = 0, c = 0, f = 0, cal = 0;
        for (const [mealId, optionId] of Object.entries(completedMeals)) {
          const meal = dailyMealPlan.find((m) => m.id === mealId);
          if (meal) {
            const option = meal.options.find((o) => o.id === optionId) || meal.options[0];
            if (option) {
              p += option.totalMacros.protein || 0;
              c += option.totalMacros.carbs || 0;
              f += option.totalMacros.fats || 0;
              cal += option.totalMacros.calories || 0;
            }
          }
        }
        return {
          protein: Math.round(p),
          carbs: Math.round(c),
          fats: Math.round(f),
          calories: Math.round(cal)
        };
      },

      loadPresetPhase: (phaseId: string) => {
        const preset = getPresetByPhaseId(phaseId);
        if (!preset) return false;

        const newMeals: DailyMeal[] = preset.meals.map((m) => ({
          id: m.mealId,
          time: m.recommendedTime,
          mealType: m.mealName,
          options: m.options.map((opt) => ({
            id: opt.optionId,
            name: opt.name,
            ingredients: opt.ingredients.map((ing, idx) => ({
              id: `ing_${opt.optionId}_${idx}`,
              name: ing.name,
              quantity: ing.amount,
              unit: ing.unit,
              macros: {
                protein: Number(((ing.protPer100g * ing.amount) / 100).toFixed(1)),
                carbs: Number(((ing.carbsPer100g * ing.amount) / 100).toFixed(1)),
                fats: Number(((ing.fatPer100g * ing.amount) / 100).toFixed(1)),
                calories: Number(((ing.calsPer100g * ing.amount) / 100).toFixed(1))
              }
            })),
            totalMacros: {
              protein: opt.totalMacros.protein,
              carbs: opt.totalMacros.carbs,
              fats: opt.totalMacros.fats,
              calories: opt.totalMacros.calories
            }
          }))
        }));

        set(
          {
            dailyMealPlan: newMeals,
            completedMeals: {}
          },
          false,
          'loadPresetPhase'
        );
        return true;
      },

      // Plan Semanal & Coordinación
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      weeklyLogistics: DEFAULT_WEEKLY_LOGISTICS,

      updateWeeklyMealOption: (day, mealId, newOption) => {
        set((state) => {
          const currentDayMeals = state.weeklySchedule[day] || state.dailyMealPlan;
          const updatedDayMeals = currentDayMeals.map((meal) => {
            if (meal.id === mealId || meal.mealType === newOption.name || meal.options.some(o => o.id === newOption.id)) {
              return {
                ...meal,
                options: [newOption]
              };
            }
            return meal;
          });

          const currentDayName = getCurrentDayOfWeekName();
          const shouldUpdateDaily = day.toLowerCase() === currentDayName.toLowerCase();

          return {
            weeklySchedule: {
              ...state.weeklySchedule,
              [day]: updatedDayMeals
            },
            ...(shouldUpdateDaily ? { dailyMealPlan: updatedDayMeals } : {})
          };
        }, false, 'updateWeeklyMealOption');
      },

      updateDailyMealOption: (mealId, newOption) => {
        set((state) => {
          const updatedDaily = state.dailyMealPlan.map((meal) => {
            if (meal.id === mealId) {
              return {
                ...meal,
                options: [newOption]
              };
            }
            return meal;
          });

          const currentDayName = getCurrentDayOfWeekName();
          return {
            dailyMealPlan: updatedDaily,
            weeklySchedule: {
              ...state.weeklySchedule,
              [currentDayName]: updatedDaily
            }
          };
        }, false, 'updateDailyMealOption');
      },

      setWeeklyLogistic: (day, mealId, strategy) => {
        set((state) => ({
          weeklyLogistics: {
            ...state.weeklyLogistics,
            [day]: {
              ...(state.weeklyLogistics[day] || {}),
              [mealId]: strategy
            }
          }
        }), false, 'setWeeklyLogistic');
      },

      // Módulo de Compras
      purchasedShoppingItems: [],
      toggleShoppingItem: (itemId) => {
        set((state) => {
          const exists = state.purchasedShoppingItems.includes(itemId);
          return {
            purchasedShoppingItems: exists
              ? state.purchasedShoppingItems.filter((id) => id !== itemId)
              : [...state.purchasedShoppingItems, itemId]
          };
        });
      },
      clearPurchasedShoppingItems: () => set({ purchasedShoppingItems: [] }, false, 'clearPurchasedShoppingItems'),
      markAllShoppingItemsPurchased: (itemIds) => set({ purchasedShoppingItems: itemIds }, false, 'markAllShoppingItemsPurchased'),

      macros: { protein: 0, carbs: 0, fats: 0 },
      setMacro: (macro, value) => 
        set((state) => ({ 
          macros: { ...state.macros, [macro]: value } 
        }), false, 'setMacro'),

      habitHydrationPeak: false,
      setHabitHydrationPeak: (val) => set({ habitHydrationPeak: val }, false, 'setHabitHydrationPeak'),
      
      habitVisualReward: true,
      setHabitVisualReward: (val) => set({ habitVisualReward: val }, false, 'setHabitVisualReward'),

      escapeValveNotes: '',
      setEscapeValveNotes: (notes) => set({ escapeValveNotes: notes }, false, 'setEscapeValveNotes'),

      clinicalComplianceBreach: false,
      evaluateTextCompliance: () => {
        const text = get().escapeValveNotes.toLowerCase();
        const redFlags = ['atracón', 'vómito', 'laxante', 'diurético', 'ayuno extremo'];
        const hasBreach = redFlags.some(flag => text.includes(flag));
        set({ clinicalComplianceBreach: hasBreach }, false, 'evaluateTextCompliance');
      },

      shadowContext: {
        currentWeightKg: 78.5,
        morningHrvMs: 62,
        trainingLoadType: 'HIPERTROFIA'
      },

      generatePayload: () => {
        const state = get();
        return {
          prescription: {
            metabolicAnchor: state.metabolicAnchor,
            macros: state.macros,
            habits: {
              hydrationPeak: state.habitHydrationPeak,
              visualReward: state.habitVisualReward
            },
            clinicalExceptions: state.escapeValveNotes
          },
          shadowContext: state.shadowContext
        };
      }
    }),
    { name: 'NutritionStore' }
    ),
    {
      name: 'bienestar-nutrition-store',
      partialize: (state) => ({
        recipes: state.recipes,
        dailyMealPlan: state.dailyMealPlan,
        completedMeals: state.completedMeals,
        weeklySchedule: state.weeklySchedule,
        weeklyLogistics: state.weeklyLogistics,
        purchasedShoppingItems: state.purchasedShoppingItems
      }),
      merge: (persistedState: any, currentState: any) => {
        const persisted = (persistedState as Partial<NutritionState>) || {};
        return {
          ...currentState,
          ...persisted,
          recipes: (persisted.recipes && persisted.recipes.length > 0) 
            ? persisted.recipes 
            : currentState.recipes,
          weeklySchedule: persisted.weeklySchedule || currentState.weeklySchedule,
          weeklyLogistics: persisted.weeklyLogistics || currentState.weeklyLogistics,
          purchasedShoppingItems: persisted.purchasedShoppingItems || currentState.purchasedShoppingItems
        };
      }
    }
  )
);

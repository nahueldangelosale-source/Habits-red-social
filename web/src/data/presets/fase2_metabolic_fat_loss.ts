/**
 * Preset Nutricional Maestro — FASE 2: Pérdida de Grasa, Salud Metabólica & Time Crunch
 * Basado en Deep Research: Índice de Saciedad de Holt, Almidón Resistente Tipo 3 (RS3), Crononutrición y Tríada A/B/C.
 * Arquetipos: ARQ_08_METABOLIC_FAT_LOSS, ARQ_07_TIME_CRUNCH_2X, ARQ_01_WELLNESS
 */

import type { PresetPhase } from './fase1_fuerza_hipertrofia';

export const PRESET_FASE_02_METABOLIC_FAT_LOSS: PresetPhase = {
  phaseId: "FASE_02_METABOLIC_FAT_LOSS",
  phaseName: "Pérdida de Grasa, Salud Metabólica & Time Crunch",
  targetArchetypes: [
    "ARQ_08_METABOLIC_FAT_LOSS", 
    "ARQ_07_TIME_CRUNCH_2X", 
    "ARQ_01_WELLNESS"
  ],
  dailyTargetMacros: {
    calories: 1850,
    protein: 155,
    carbs: 165,
    fats: 55
  },
  meals: [
    // -------------------------------------------------------------------------
    // 1. DESAYUNOS (Tríada A / B / C)
    // -------------------------------------------------------------------------
    {
      mealId: "m1_desayuno",
      mealName: "Desayuno",
      recommendedTime: "08:00",
      targetMacros: { protein: 30.0, carbs: 25.0, fats: 10.0, calories: 300.0 },
      options: [
        {
          optionId: "opt_desayuno_2a",
          name: "Omelette de Claras con Espinaca y Tostada Integral",
          prepTimeMin: 10,
          tags: ["Alto en Proteína 💪", "Desayuno ☀️", "Alto Volumen"],
          servings: 1,
          ingredients: [
            { name: "Clara de huevo", amount: 150, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Huevo entero", amount: 50, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Espinaca cruda", amount: 80, unit: "g", protPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, calsPer100g: 29.6 },
            { name: "Pan integral", amount: 40, unit: "g", protPer100g: 9.0, carbsPer100g: 45.0, fatPer100g: 3.0, calsPer100g: 243.0 },
            { name: "Aceite de oliva EV", amount: 3, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 28.6, carbs: 22.2, fats: 9.6, calories: 289.6 },
          culinaryTip: "Saltear brevemente la espinaca en la sartén para romper la pared celular antes de volcar las claras batidas. El uso de aceite medido aísla térmicamente la proteína sin excedente calórico."
        },
        {
          optionId: "opt_desayuno_2b",
          name: "Bowl de Yogur Griego con Chía, Frutillas y Nueces",
          prepTimeMin: 5,
          tags: ["Alto en Proteína 💪", "Desayuno ☀️", "Dulce", "Polifenoles"],
          servings: 1,
          ingredients: [
            { name: "Yogur griego descremado", amount: 200, unit: "g", protPer100g: 10.0, carbsPer100g: 3.6, fatPer100g: 0.4, calsPer100g: 58.0 },
            { name: "Semillas de chía", amount: 15, unit: "g", protPer100g: 16.5, carbsPer100g: 42.1, fatPer100g: 30.7, calsPer100g: 510.7 },
            { name: "Frutillas frescas", amount: 100, unit: "g", protPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, calsPer100g: 36.3 },
            { name: "Nueces", amount: 15, unit: "g", protPer100g: 15.2, carbsPer100g: 13.7, fatPer100g: 65.2, calsPer100g: 702.4 }
          ],
          totalMacros: { protein: 25.5, carbs: 23.3, fats: 15.5, calories: 334.7 },
          culinaryTip: "Hidratar mecánicamente las semillas de chía en el yogur la noche anterior (efecto overnight) promueve una liberación lenta de mucílagos, maximizando la retención hídrica en el estómago."
        },
        {
          optionId: "opt_desayuno_2c",
          name: "Tostadas Express con Queso Magro y Jamón Cocido",
          prepTimeMin: 5,
          tags: ["Alto en Proteína 💪", "Desayuno ☀️", "Express ⚡", "Portátil"],
          servings: 1,
          ingredients: [
            { name: "Pan integral", amount: 50, unit: "g", protPer100g: 9.0, carbsPer100g: 45.0, fatPer100g: 3.0, calsPer100g: 243.0 },
            { name: "Queso Port Salut Light", amount: 50, unit: "g", protPer100g: 23.0, carbsPer100g: 1.5, fatPer100g: 12.0, calsPer100g: 206.0 },
            { name: "Jamón cocido natural", amount: 40, unit: "g", protPer100g: 18.0, carbsPer100g: 1.0, fatPer100g: 3.0, calsPer100g: 103.0 }
          ],
          totalMacros: { protein: 23.2, carbs: 23.7, fats: 8.7, calories: 265.9 },
          culinaryTip: "Ensamblado totalmente en frío o tostadora. Ideal para días donde el individuo dispone de menos de cinco minutos netos para ingerir macronutrientes."
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 2. ALMUERZOS (Tríada A / B / C)
    // -------------------------------------------------------------------------
    {
      mealId: "m2_almuerzo",
      mealName: "Almuerzo",
      recommendedTime: "13:00",
      targetMacros: { protein: 45.0, carbs: 40.0, fats: 10.0, calories: 410.0 },
      options: [
        {
          optionId: "opt_almuerzo_2a",
          name: "Wok de Pollo y Vegetales con Arroz Integral",
          prepTimeMin: 15,
          tags: ["Almuerzo 🍽️", "Alto Volumen", "Saciedad Extrema", "Fibra Soluble"],
          servings: 1,
          ingredients: [
            { name: "Pechuga de pollo cruda", amount: 180, unit: "g", protPer100g: 23.1, carbsPer100g: 0.0, fatPer100g: 1.2, calsPer100g: 103.2 },
            { name: "Arroz integral crudo", amount: 45, unit: "g", protPer100g: 7.5, carbsPer100g: 76.2, fatPer100g: 2.7, calsPer100g: 359.1 },
            { name: "Zucchini crudo", amount: 150, unit: "g", protPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, calsPer100g: 19.9 },
            { name: "Tomate fresco", amount: 100, unit: "g", protPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, calsPer100g: 21.0 },
            { name: "Aceite de oliva EV", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 47.7, carbs: 42.9, fats: 9.0, calories: 443.4 },
          culinaryTip: "Cortar el pollo y los vegetales en cubos minúsculos exige una masticación prolongada, extendiendo el tiempo de ingesta y fomentando la supresión hipotalámica del hambre."
        },
        {
          optionId: "opt_almuerzo_2b",
          name: "Filet de Merluza con Puré de Calabaza y Ensalada Mixta",
          prepTimeMin: 15,
          tags: ["Almuerzo 🍽️", "Baja Densidad", "Proteína Marina Magra"],
          servings: 1,
          ingredients: [
            { name: "Filet de merluza crudo", amount: 220, unit: "g", protPer100g: 17.8, carbsPer100g: 0.0, fatPer100g: 0.7, calsPer100g: 77.5 },
            { name: "Calabaza Anco cruda", amount: 250, unit: "g", protPer100g: 1.0, carbsPer100g: 7.0, fatPer100g: 0.1, calsPer100g: 32.9 },
            { name: "Tomate fresco", amount: 100, unit: "g", protPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, calsPer100g: 21.0 },
            { name: "Lechuga mixta", amount: 80, unit: "g", protPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, calsPer100g: 19.0 },
            { name: "Aceite de oliva EV", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 43.7, carbs: 23.7, fats: 7.1, calories: 333.5 },
          culinaryTip: "La cocción de la calabaza mediante microondas en recipientes sellados (5 a 7 minutos) preserva los carotenoides termo-sensibles y elude la necesidad de ollas."
        },
        {
          optionId: "opt_almuerzo_2c",
          name: "Wrap Integral Frío Express de Atún",
          prepTimeMin: 5,
          tags: ["Almuerzo 🍽️", "Express ⚡", "Portátil", "Zero Fricción"],
          servings: 1,
          ingredients: [
            { name: "Tortilla integral", amount: 60, unit: "g", protPer100g: 8.5, carbsPer100g: 48.0, fatPer100g: 5.0, calsPer100g: 271.0 },
            { name: "Atún al natural", amount: 120, unit: "g", protPer100g: 23.5, carbsPer100g: 0.0, fatPer100g: 0.9, calsPer100g: 102.1 },
            { name: "Palta", amount: 40, unit: "g", protPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 14.7, calsPer100g: 174.3 },
            { name: "Tomate fresco", amount: 80, unit: "g", protPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, calsPer100g: 21.0 },
            { name: "Lechuga mixta", amount: 50, unit: "g", protPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, calsPer100g: 19.0 }
          ],
          totalMacros: { protein: 35.5, carbs: 36.7, fats: 10.3, calories: 381.5 },
          culinaryTip: "Macerar y pisar la palta cruda permite usarla funcionalmente como base lipídica untable, erradicando la necesidad de mayonesas comerciales altas en aceites inflamatorios."
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 3. MERIENDAS (Tríada A / B / C)
    // -------------------------------------------------------------------------
    {
      mealId: "m3_merienda",
      mealName: "Merienda",
      recommendedTime: "17:00",
      targetMacros: { protein: 25.0, carbs: 30.0, fats: 6.0, calories: 280.0 },
      options: [
        {
          optionId: "opt_merienda_2a",
          name: "Pancakes Rápidos de Banana y Claras",
          prepTimeMin: 10,
          tags: ["Merienda 🥤", "Dulce Sin Azúcar", "Freno al Hambre Vespertina"],
          servings: 1,
          ingredients: [
            { name: "Clara de huevo", amount: 120, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Banana", amount: 100, unit: "g", protPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, calsPer100g: 98.3 },
            { name: "Avena en hojuelas", amount: 30, unit: "g", protPer100g: 13.5, carbsPer100g: 66.3, fatPer100g: 6.9, calsPer100g: 381.3 }
          ],
          totalMacros: { protein: 18.2, carbs: 43.5, fats: 2.6, calories: 270.2 },
          culinaryTip: "Licuar en frío los tres ingredientes genera una disrupción celular de la banana que incrementa el poder endulzante natural, eliminando por completo los siropes."
        },
        {
          optionId: "opt_merienda_2b",
          name: "Yogur Bowl con Arándanos y Almendras",
          prepTimeMin: 3,
          tags: ["Merienda 🥤", "Probióticos Activos", "Densidad Nutricional"],
          servings: 1,
          ingredients: [
            { name: "Yogur griego descremado", amount: 180, unit: "g", protPer100g: 10.0, carbsPer100g: 3.6, fatPer100g: 0.4, calsPer100g: 58.0 },
            { name: "Arándanos frescos", amount: 80, unit: "g", protPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, calsPer100g: 63.5 },
            { name: "Almendras", amount: 15, unit: "g", protPer100g: 21.2, carbsPer100g: 21.7, fatPer100g: 49.9, calsPer100g: 620.7 },
            { name: "Semillas de chía", amount: 10, unit: "g", protPer100g: 16.5, carbsPer100g: 42.1, fatPer100g: 30.7, calsPer100g: 510.7 }
          ],
          totalMacros: { protein: 23.5, carbs: 25.6, fats: 11.5, calories: 299.9 },
          culinaryTip: "La incorporación de grasas sólidas (almendras) en el tejido conectivo interrumpe mecánicamente la digestión enzimática, sosteniendo la saciedad hasta la cena."
        },
        {
          optionId: "opt_merienda_2c",
          name: "Batido Saciante Express de Whey y Frutillas",
          prepTimeMin: 2,
          tags: ["Merienda 🥤", "Express ⚡", "Líquido Saciante", "Aminoácidos Rápidos"],
          servings: 1,
          ingredients: [
            { name: "Whey Protein concentrado", amount: 30, unit: "g", protPer100g: 80.0, carbsPer100g: 6.0, fatPer100g: 3.0, calsPer100g: 371.0 },
            { name: "Leche descremada", amount: 200, unit: "g", protPer100g: 3.4, carbsPer100g: 5.0, fatPer100g: 0.1, calsPer100g: 34.5 },
            { name: "Frutillas frescas", amount: 100, unit: "g", protPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, calsPer100g: 36.3 },
            { name: "Semillas de chía", amount: 10, unit: "g", protPer100g: 16.5, carbsPer100g: 42.1, fatPer100g: 30.7, calsPer100g: 510.7 }
          ],
          totalMacros: { protein: 33.2, carbs: 23.7, fats: 4.5, calories: 268.1 },
          culinaryTip: "Añadir abundantes fragmentos de hielo durante el licuado logra triplicar el volumen del líquido mediante aeración, induciendo estiramiento gástrico vagal."
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 4. CENAS (Tríada A / B / C)
    // -------------------------------------------------------------------------
    {
      mealId: "m4_cena",
      mealName: "Cena",
      recommendedTime: "20:30",
      targetMacros: { protein: 42.0, carbs: 25.0, fats: 10.0, calories: 360.0 },
      options: [
        {
          optionId: "opt_cena_2a",
          name: "Bife Magro de Ternera con Ensalada y Papa Hervida Fría",
          prepTimeMin: 15,
          tags: ["Cena 🌙", "Almidón Resistente RS3", "Proteína Hemo", "Baja Carga Glucémica"],
          servings: 1,
          ingredients: [
            { name: "Bife de nalga magro crudo", amount: 180, unit: "g", protPer100g: 21.5, carbsPer100g: 0.0, fatPer100g: 2.2, calsPer100g: 105.8 },
            { name: "Papa cruda", amount: 180, unit: "g", protPer100g: 2.0, carbsPer100g: 17.0, fatPer100g: 0.1, calsPer100g: 76.9 },
            { name: "Tomate fresco", amount: 100, unit: "g", protPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, calsPer100g: 21.0 },
            { name: "Lechuga mixta", amount: 80, unit: "g", protPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, calsPer100g: 19.0 },
            { name: "Aceite de oliva EV", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 44.3, carbs: 36.8, fats: 9.6, calories: 410.8 },
          culinaryTip: "Es imperativo hervir y refrigerar la papa con horas de antelación para forzar la cristalización y generar Almidón Resistente Tipo 3, bloqueando los picos nocturnos de glucosa."
        },
        {
          optionId: "opt_cena_2b",
          name: "Revuelto Proteico de Claras, Zucchini y Port Salut",
          prepTimeMin: 10,
          tags: ["Cena 🌙", "Digestión Liviana", "Proteína de Lenta Absorción"],
          servings: 1,
          ingredients: [
            { name: "Clara de huevo", amount: 200, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Huevo entero", amount: 50, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Zucchini crudo", amount: 200, unit: "g", protPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, calsPer100g: 19.9 },
            { name: "Queso Port Salut Light", amount: 50, unit: "g", protPer100g: 23.0, carbsPer100g: 1.5, fatPer100g: 12.0, calsPer100g: 206.0 },
            { name: "Aceite de oliva EV", amount: 3, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 42.0, carbs: 8.7, fats: 14.8, calories: 336.0 },
          culinaryTip: "Rallar el zucchini crudo directamente sobre la sartén caliente acelera la deshidratación del vegetal, logrando condensar el volumen gástrico sin añadir estrés hepático nocturno."
        },
        {
          optionId: "opt_cena_2c",
          name: "Sopa Proteica de Verduras con Pollo Desmenuzado",
          prepTimeMin: 15,
          tags: ["Cena 🌙", "Express ⚡", "Confort Térmico", "Relajación Gástrica"],
          servings: 1,
          ingredients: [
            { name: "Pechuga de pollo cruda", amount: 160, unit: "g", protPer100g: 23.1, carbsPer100g: 0.0, fatPer100g: 1.2, calsPer100g: 103.2 },
            { name: "Calabaza Anco cruda", amount: 150, unit: "g", protPer100g: 1.0, carbsPer100g: 7.0, fatPer100g: 0.1, calsPer100g: 32.9 },
            { name: "Zucchini crudo", amount: 150, unit: "g", protPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, calsPer100g: 19.9 },
            { name: "Espinaca cruda", amount: 50, unit: "g", protPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, calsPer100g: 29.6 },
            { name: "Aceite de oliva EV", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 41.7, carbs: 17.0, fats: 7.7, calories: 304.1 },
          culinaryTip: "Procesar y licuar los vegetales previamente suavizados en microondas, y añadir los filamentos del pollo magro, aporta un elevado confort térmico ideal para favorecer el descanso profundo."
        }
      ]
    }
  ]
};

/**
 * Preset Nutricional Maestro — FASE 3: Eje Microbioma-Longevidad y Mitigación de Sarcopenia Inducida por GLP-1
 * Basado en Deep Research: Eje Zonulina / Leaky Gut, Protocolo 5R, Dieta Low-FODMAP Estricta (Monash University),
 * Inducción de Akkermansia muciniphila / Butirato y Umbral de Leucina Anti-Sarcopenia GLP-1.
 * Arquetipos: ARQ_09_LONGEVITY_VITALITY, ARQ_CLINICAL_GI, ARQ_GLP1_PROTECTION
 */

import type { PresetPhase } from './fase1_fuerza_hipertrofia';

export const PRESET_FASE_03_LONGEVITY_GUT_HEALTH: PresetPhase = {
  phaseId: "FASE_03_LONGEVITY_GUT_HEALTH",
  phaseName: "Longevidad, Salud Digestiva & Anti-Inflamación",
  targetArchetypes: [
    "ARQ_09_LONGEVITY_VITALITY",
    "ARQ_CLINICAL_GI",
    "ARQ_GLP1_PROTECTION"
  ],
  dailyTargetMacros: {
    calories: 1950,
    protein: 140,
    carbs: 200,
    fats: 65
  },
  meals: [
    // -------------------------------------------------------------------------
    // 1. DESAYUNOS (Tríada A / B / C)
    // -------------------------------------------------------------------------
    {
      mealId: "m1_desayuno",
      mealName: "Desayuno",
      recommendedTime: "08:00",
      targetMacros: { protein: 28.0, carbs: 40.0, fats: 14.0, calories: 398.0 },
      options: [
        {
          optionId: "opt_desayuno_3a",
          name: "Porridge de Avena sin Gluten con Arándanos, Claras y Semillas de Lino",
          prepTimeMin: 10,
          tags: ["Longevidad 🫀", "Polifenoles 🫐", "Anti-Inflamatorio", "Beta-Glucanos"],
          servings: 1,
          ingredients: [
            { name: "Avena sin TACC en hojuelas", amount: 50, unit: "g", protPer100g: 13.5, carbsPer100g: 60.0, fatPer100g: 6.5, calsPer100g: 352.5 },
            { name: "Clara de huevo", amount: 150, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Arándanos frescos", amount: 80, unit: "g", protPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, calsPer100g: 63.5 },
            { name: "Semillas de lino molidas", amount: 15, unit: "g", protPer100g: 18.0, carbsPer100g: 29.0, fatPer100g: 42.0, calsPer100g: 566.0 }
          ],
          totalMacros: { protein: 26.4, carbs: 47.0, fats: 10.1, calories: 384.3 },
          culinaryTip: "Cocinar la avena con las claras a fuego bajo revolviendo constantemente para lograr una coagulación cremosa; integrar el lino molido al apagar el fuego para evitar la peroxidación del ALA (omega-3 vegetal)."
        },
        {
          optionId: "opt_desayuno_3b",
          name: "Tostadas Sin Gluten con Huevo Poché, Palta y Aceite de Oliva EV",
          prepTimeMin: 8,
          tags: ["Low-FODMAP 🚫", "Gut-Friendly 🌿", "Cero Gluten"],
          servings: 1,
          ingredients: [
            { name: "Pan sin gluten (harina de arroz/sarraceno)", amount: 50, unit: "g", protPer100g: 4.5, carbsPer100g: 44.0, fatPer100g: 3.2, calsPer100g: 222.8 },
            { name: "Huevo entero pastoril", amount: 100, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Clara de huevo", amount: 100, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Palta Hass", amount: 30, unit: "g", protPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 14.7, calsPer100g: 148.3 },
            { name: "Aceite de oliva extra virgen", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 26.4, carbs: 26.0, fats: 20.7, calories: 395.9 },
          culinaryTip: "Realizar el poché añadiendo vinagre al agua hirviendo. Mantener la yema líquida asegura la biodisponibilidad de colina intacta sin la formación inflamatoria de productos finales de glicación avanzada (AGEs)."
        },
        {
          optionId: "opt_desayuno_3c",
          name: "Bowl de Tofu Revuelto con Cúrcuma, Espinaca Baby y Tostada Sin Gluten",
          prepTimeMin: 5,
          tags: ["100% Vegetal 🌱", "Digestión Ligera", "Express ⚡"],
          servings: 1,
          ingredients: [
            { name: "Tofu firme orgánico", amount: 200, unit: "g", protPer100g: 12.1, carbsPer100g: 1.9, fatPer100g: 4.8, calsPer100g: 99.2 },
            { name: "Espinaca baby", amount: 50, unit: "g", protPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, calsPer100g: 29.6 },
            { name: "Pan sin gluten (harina de arroz/sarraceno)", amount: 40, unit: "g", protPer100g: 4.5, carbsPer100g: 44.0, fatPer100g: 3.2, calsPer100g: 222.8 },
            { name: "Aceite de oliva extra virgen", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 27.5, carbs: 23.2, fats: 16.1, calories: 347.7 },
          culinaryTip: "Pisar el tofu con tenedor, sazonar con cúrcuma y una pizca imperceptible de pimienta negra para activar la piperina, asegurando la absorción linfática de los curcuminoides para suprimir NF-kB."
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
      targetMacros: { protein: 40.0, carbs: 50.0, fats: 20.0, calories: 540.0 },
      options: [
        {
          optionId: "opt_almuerzo_3a",
          name: "Salmón Rosado a la Plancha con Quinoa Real y Vegetales Asados",
          prepTimeMin: 15,
          tags: ["Longevidad 🫀", "Omega-3 🐟", "Soporte Mitocondrial"],
          servings: 1,
          ingredients: [
            { name: "Salmón rosado (filet)", amount: 150, unit: "g", protPer100g: 20.4, carbsPer100g: 0.0, fatPer100g: 13.4, calsPer100g: 202.2 },
            { name: "Quinoa real", amount: 60, unit: "g", protPer100g: 14.1, carbsPer100g: 64.2, fatPer100g: 6.1, calsPer100g: 368.1 },
            { name: "Zanahoria", amount: 50, unit: "g", protPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2, calsPer100g: 43.8 },
            { name: "Zucchini / Zapallito verde", amount: 50, unit: "g", protPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, calsPer100g: 19.9 }
          ],
          totalMacros: { protein: 40.1, carbs: 44.9, fats: 24.0, calories: 556.0 },
          culinaryTip: "Friccionar y lavar la quinoa en abundante agua fría para remover completamente las saponinas irritantes del epitelio intestinal. Asar el salmón a fuego moderado protegiendo la isomerización térmica del DHA."
        },
        {
          optionId: "opt_almuerzo_3b",
          name: "Pechuga de Pollo Pastoril con Puré de Zanahoria al Jengibre y Arroz Basmati",
          prepTimeMin: 20,
          tags: ["Low-FODMAP 🚫", "Reparación Mucosa 🌿", "Cero Fricción"],
          servings: 1,
          ingredients: [
            { name: "Pechuga de pollo sin piel", amount: 150, unit: "g", protPer100g: 22.5, carbsPer100g: 0.0, fatPer100g: 2.6, calsPer100g: 113.4 },
            { name: "Arroz basmati", amount: 60, unit: "g", protPer100g: 7.1, carbsPer100g: 78.0, fatPer100g: 0.7, calsPer100g: 346.7 },
            { name: "Zanahoria", amount: 100, unit: "g", protPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2, calsPer100g: 43.8 },
            { name: "Aceite infusionado de hierbas/ajo (sin fructanos)", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 38.9, carbs: 56.4, fats: 9.5, calories: 466.7 },
          culinaryTip: "Procesar la zanahoria bien hervida con el aceite infusionado para un puré untuoso cero fricción. Los fructanos del ajo no migran al aceite lipídico, garantizando inmunidad osmótica."
        },
        {
          optionId: "opt_almuerzo_3c",
          name: "Ensalada Templada Express de Arroz Blanco, Atún al Natural y Huevo Duro con Oliva",
          prepTimeMin: 5,
          tags: ["Express ⚡", "Almidón Resistente RS3", "Alta Saciedad"],
          servings: 1,
          ingredients: [
            { name: "Atún al natural (escurrido)", amount: 150, unit: "g", protPer100g: 23.5, carbsPer100g: 0.0, fatPer100g: 1.0, calsPer100g: 103.0 },
            { name: "Arroz blanco", amount: 50, unit: "g", protPer100g: 6.8, carbsPer100g: 78.2, fatPer100g: 0.6, calsPer100g: 345.4 },
            { name: "Huevo entero pastoril", amount: 50, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Aceite de oliva extra virgen", amount: 10, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 45.0, carbs: 39.5, fats: 16.6, calories: 487.4 },
          culinaryTip: "Enfriar el arroz blanco por 24hs tras su cocción. Este proceso químico induce la cristalización del almidón generando RS3 (Almidón Resistente Tipo 3), excelente sustrato prebiótico que potencia la producción de butirato colónico."
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
      targetMacros: { protein: 30.0, carbs: 25.0, fats: 12.0, calories: 328.0 },
      options: [
        {
          optionId: "opt_merienda_3a",
          name: "Bowl de Frutos Rojos con Yogur Sin Lactosa, Nueces y Péptidos de Colágeno",
          prepTimeMin: 5,
          tags: ["Longevidad 🫀", "Matriz Colágeno", "Microbioma"],
          servings: 1,
          ingredients: [
            { name: "Yogur sin lactosa / Skyr sin lactosa", amount: 200, unit: "g", protPer100g: 10.0, carbsPer100g: 3.5, fatPer100g: 0.2, calsPer100g: 55.8 },
            { name: "Arándanos frescos", amount: 50, unit: "g", protPer100g: 0.7, carbsPer100g: 14.5, fatPer100g: 0.3, calsPer100g: 63.5 },
            { name: "Nueces", amount: 15, unit: "g", protPer100g: 15.2, carbsPer100g: 13.7, fatPer100g: 65.2, calsPer100g: 702.4 },
            { name: "Péptidos de colágeno hidrolizado", amount: 15, unit: "g", protPer100g: 90.0, carbsPer100g: 0.0, fatPer100g: 0.0, calsPer100g: 360.0 }
          ],
          totalMacros: { protein: 36.1, carbs: 16.3, fats: 10.3, calories: 302.3 },
          culinaryTip: "Disolver rigurosamente el colágeno en el yogur frío. Las nueces proveen ácido elágico que, metabolizado por la microbiota, origina urolitinas funcionales capaces de inducir recambio y mitofagia celular."
        },
        {
          optionId: "opt_merienda_3b",
          name: "Smoothie Suave de Espinaca Baby, Banana, Proteína Whey Isolate y Leche de Almendras",
          prepTimeMin: 5,
          tags: ["Líquido GLP-1 🥤", "Anti-Sarcopenia 💪", "Cero Tensión Osmótica"],
          servings: 1,
          ingredients: [
            { name: "Proteína Whey Isolate (sin lactosa)", amount: 30, unit: "g", protPer100g: 88.0, carbsPer100g: 1.5, fatPer100g: 0.5, calsPer100g: 362.5 },
            { name: "Leche de almendras sin azúcar", amount: 200, unit: "g", protPer100g: 0.5, carbsPer100g: 0.3, fatPer100g: 1.1, calsPer100g: 13.1 },
            { name: "Banana (maduración media)", amount: 100, unit: "g", protPer100g: 1.1, carbsPer100g: 22.8, fatPer100g: 0.3, calsPer100g: 98.3 },
            { name: "Espinaca baby", amount: 30, unit: "g", protPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, calsPer100g: 29.6 }
          ],
          totalMacros: { protein: 29.4, carbs: 24.9, fats: 2.8, calories: 242.4 },
          culinaryTip: "Licuar en potencia extrema por 60 segundos. Vehículo hiper-liviano y pre-digerido diseñado para pacientes con profunda anorexia post-dosis GLP-1. Cruza el umbral de leucina desencadenando síntesis miofibrilar."
        },
        {
          optionId: "opt_merienda_3c",
          name: "Tostadas Sin TACC con Huevo Duro y Manteca de Almendras 100%",
          prepTimeMin: 5,
          tags: ["Snack Seco 🥖", "Low-FODMAP 🚫", "Express ⚡"],
          servings: 1,
          ingredients: [
            { name: "Pan sin gluten (harina de arroz/sarraceno)", amount: 50, unit: "g", protPer100g: 4.5, carbsPer100g: 44.0, fatPer100g: 3.2, calsPer100g: 222.8 },
            { name: "Huevo entero pastoril", amount: 100, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Clara de huevo", amount: 50, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Manteca de almendras 100%", amount: 10, unit: "g", protPer100g: 21.0, carbsPer100g: 18.8, fatPer100g: 55.5, calsPer100g: 658.7 }
          ],
          totalMacros: { protein: 22.4, carbs: 24.9, fats: 16.8, calories: 340.4 },
          culinaryTip: "Tostado intenso del pan para modular la textura seca. Este approach facilita dramáticamente el vaciamiento gástrico en cuadros de motilidad deprimida por efectos incretínicos."
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
      targetMacros: { protein: 40.0, carbs: 40.0, fats: 15.0, calories: 455.0 },
      options: [
        {
          optionId: "opt_cena_3a",
          name: "Filet de Merluza Austral al Limón con Crema Suave de Calabaza al Jengibre",
          prepTimeMin: 15,
          tags: ["Longevidad 🫀", "Digestión Ultraliviana", "Sueño Profundo 🌙"],
          servings: 1,
          ingredients: [
            { name: "Filet de merluza", amount: 200, unit: "g", protPer100g: 17.8, carbsPer100g: 0.0, fatPer100g: 0.8, calsPer100g: 78.4 },
            { name: "Calabaza Anco", amount: 60, unit: "g", protPer100g: 1.0, carbsPer100g: 11.7, fatPer100g: 0.1, calsPer100g: 51.7 },
            { name: "Aceite de oliva extra virgen", amount: 10, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 36.2, carbs: 7.0, fats: 11.7, calories: 278.1 },
          culinaryTip: "Mantener la calabaza en el estricto gramaje de 60g crudos para no violentar el límite osmótico Low-FODMAP de la Universidad de Monash (límite <63g). Cocción lenta para la merluza minimizando desnaturalización proteica."
        },
        {
          optionId: "opt_cena_3b",
          name: "Salteado de Pollo Limpio con Fideos de Arroz y Zucchini al Wok con Oliva",
          prepTimeMin: 15,
          tags: ["Low-FODMAP 🚫", "Gut-Friendly 🌿", "Cero Fermentación"],
          servings: 1,
          ingredients: [
            { name: "Pechuga de pollo sin piel", amount: 150, unit: "g", protPer100g: 22.5, carbsPer100g: 0.0, fatPer100g: 2.6, calsPer100g: 113.4 },
            { name: "Fideos de arroz sin gluten", amount: 60, unit: "g", protPer100g: 7.0, carbsPer100g: 80.0, fatPer100g: 0.8, calsPer100g: 355.2 },
            { name: "Zucchini / Zapallito verde", amount: 50, unit: "g", protPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, calsPer100g: 19.9 },
            { name: "Aceite infusionado de hierbas/ajo (sin fructanos)", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 38.6, carbs: 49.6, fats: 9.5, calories: 438.3 },
          culinaryTip: "Saltear el zucchini a fuego intenso para textura al dente; limitar rígidamente a 50g para impedir la generación masiva de gases por fructanos durante el tránsito colónico nocturno."
        },
        {
          optionId: "opt_cena_3c",
          name: "Sopa Reparadora de Caldo Concentrado de Huesos con Pollo Desmenuzado y Arroz Basmati",
          prepTimeMin: 10,
          tags: ["Reparación 5R 🧬", "Glutamina Líquida", "Express ⚡"],
          servings: 1,
          ingredients: [
            { name: "Caldo de huesos concentrado en colágeno", amount: 200, unit: "g", protPer100g: 6.0, carbsPer100g: 0.5, fatPer100g: 0.5, calsPer100g: 29.5 },
            { name: "Pechuga de pollo sin piel", amount: 100, unit: "g", protPer100g: 22.5, carbsPer100g: 0.0, fatPer100g: 2.6, calsPer100g: 113.4 },
            { name: "Arroz basmati", amount: 50, unit: "g", protPer100g: 7.1, carbsPer100g: 78.0, fatPer100g: 0.7, calsPer100g: 346.7 }
          ],
          totalMacros: { protein: 38.1, carbs: 40.0, fats: 4.0, calories: 348.4 },
          culinaryTip: "Integrar el pollo pre-cocido deshilachado al caldo en ebullición junto con el arroz basmati. Constituye un vehículo de entrega hiper-eficiente de L-glutamina y glicina bioidéntica para la restauración de las tight junctions."
        }
      ]
    }
  ]
};

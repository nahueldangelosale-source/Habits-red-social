/**
 * Preset Nutricional Maestro — FASE 1: Fuerza, Hipertrofia & Recomposición Muscular
 * Basado en Deep Research Bioenergético, SARA 2 y Atwater Exacto.
 * Arquetipos: ARQ_03_PPL, ARQ_02_UPPER_LOWER, ARQ_01_HYPERTROPHY_PT
 */

export interface PresetIngredient {
  name: string;
  amount: number; // gramos crudos
  unit: string;
  protPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  calsPer100g: number;
}

export interface PresetOption {
  optionId: string;
  name: string;
  prepTimeMin: number;
  tags: string[];
  servings: number;
  ingredients: PresetIngredient[];
  totalMacros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  culinaryTip: string;
}

export interface PresetMeal {
  mealId: string;
  mealName: string;
  recommendedTime: string;
  targetMacros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  options: PresetOption[];
}

export interface PresetPhase {
  phaseId: string;
  phaseName: string;
  targetArchetypes: string[];
  dailyTargetMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: PresetMeal[];
}

export const PRESET_FASE_01_FUERZA_HIPERTROFIA: PresetPhase = {
  phaseId: "FASE_01_FUERZA_HIPERTROFIA",
  phaseName: "Superávit Proteico & Recomposición Muscular",
  targetArchetypes: [
    "ARQ_03_PPL",
    "ARQ_02_UPPER_LOWER",
    "ARQ_01_HYPERTROPHY_PT"
  ],
  dailyTargetMacros: {
    calories: 2850,
    protein: 185,
    carbs: 335,
    fats: 75
  },
  meals: [
    // -------------------------------------------------------------------------
    // 1. DESAYUNO
    // -------------------------------------------------------------------------
    {
      mealId: "m1_desayuno",
      mealName: "Desayuno",
      recommendedTime: "08:00",
      targetMacros: { protein: 38.5, carbs: 68.0, fats: 19.0, calories: 599.0 },
      options: [
        {
          optionId: "opt_desayuno_1a",
          name: "Pancakes de Avena y Claras a la Plancha",
          prepTimeMin: 15,
          tags: ["Alto en Proteína 💪", "Desayuno ☀️", "Superávit"],
          servings: 1,
          ingredients: [
            { name: "Avena en hojuelas", amount: 100, unit: "g", protPer100g: 13.5, carbsPer100g: 60.0, fatPer100g: 6.5, calsPer100g: 352.5 },
            { name: "Clara de huevo", amount: 150, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Huevo entero", amount: 50, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Banana", amount: 100, unit: "g", protPer100g: 1.1, carbsPer100g: 23.0, fatPer100g: 0.3, calsPer100g: 99.1 }
          ],
          totalMacros: { protein: 37.3, carbs: 84.4, fats: 11.9, calories: 593.3 },
          culinaryTip: "Licuar los ingredientes en crudo para asegurar homogeneidad e incorporar aire, facilitando una cocción uniforme sin grasas añadidas."
        },
        {
          optionId: "opt_desayuno_1b",
          name: "Tostadas Integrales con Huevos y Palta",
          prepTimeMin: 10,
          tags: ["Alto en Proteína 💪", "Desayuno ☀️", "Superávit"],
          servings: 1,
          ingredients: [
            { name: "Pan integral de molde", amount: 100, unit: "g", protPer100g: 9.0, carbsPer100g: 45.0, fatPer100g: 3.0, calsPer100g: 243.0 },
            { name: "Huevo entero", amount: 150, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Clara de huevo", amount: 100, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Palta", amount: 60, unit: "g", protPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 15.0, calsPer100g: 177.0 }
          ],
          totalMacros: { protein: 40.0, carbs: 51.9, fats: 26.5, calories: 605.5 },
          culinaryTip: "Pisar la palta con especias para usar de base. Las claras incrementan la matriz de leucina sin aportar colesterol no deseado."
        },
        {
          optionId: "opt_desayuno_1c",
          name: "Pancakes de Avena y Claras (Corte Ligero)",
          prepTimeMin: 15,
          tags: ["Alto en Proteína 💪", "Desayuno ☀️", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Avena en hojuelas", amount: 70, unit: "g", protPer100g: 13.5, carbsPer100g: 60.0, fatPer100g: 6.5, calsPer100g: 352.5 },
            { name: "Clara de huevo", amount: 200, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Huevo entero", amount: 50, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Banana", amount: 50, unit: "g", protPer100g: 1.1, carbsPer100g: 23.0, fatPer100g: 0.3, calsPer100g: 99.1 }
          ],
          totalMacros: { protein: 38.1, carbs: 55.3, fats: 9.9, calories: 462.1 },
          culinaryTip: "Se reduce el gramaje de avena y se eleva la clara líquida para priorizar el cociente proteína-energía."
        },
        {
          optionId: "opt_desayuno_1d",
          name: "Tostadas Integrales con Huevos y Palta (Ligero)",
          prepTimeMin: 10,
          tags: ["Alto en Proteína 💪", "Desayuno ☀️", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Pan integral de molde", amount: 70, unit: "g", protPer100g: 9.0, carbsPer100g: 45.0, fatPer100g: 3.0, calsPer100g: 243.0 },
            { name: "Huevo entero", amount: 100, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Clara de huevo", amount: 150, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Palta", amount: 40, unit: "g", protPer100g: 2.0, carbsPer100g: 8.5, fatPer100g: 15.0, calsPer100g: 177.0 }
          ],
          totalMacros: { protein: 36.1, carbs: 36.7, fats: 17.9, calories: 451.9 },
          culinaryTip: "Reemplazar un huevo entero por claras y ajustar el pan mantiene la densidad nutricional pero reduce el aporte calórico."
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 2. ALMUERZO
    // -------------------------------------------------------------------------
    {
      mealId: "m2_almuerzo",
      mealName: "Almuerzo",
      recommendedTime: "13:30",
      targetMacros: { protein: 55.0, carbs: 90.0, fats: 17.0, calories: 735.0 },
      options: [
        {
          optionId: "opt_almuerzo_2a",
          name: "Pechuga Grillada con Arroz Blanco y Brócoli",
          prepTimeMin: 25,
          tags: ["Alto en Proteína 💪", "Almuerzo 🍽️", "Superávit"],
          servings: 1,
          ingredients: [
            { name: "Pechuga de pollo", amount: 200, unit: "g", protPer100g: 22.5, carbsPer100g: 0.0, fatPer100g: 2.6, calsPer100g: 113.4 },
            { name: "Arroz blanco", amount: 120, unit: "g", protPer100g: 7.0, carbsPer100g: 78.0, fatPer100g: 0.6, calsPer100g: 345.4 },
            { name: "Brócoli", amount: 150, unit: "g", protPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, calsPer100g: 41.2 },
            { name: "Aceite de oliva extra virgen", amount: 10, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 57.6, carbs: 103.5, fats: 16.5, calories: 793.1 },
          culinaryTip: "Lavar el arroz con agua fría previo a cocción elimina almidón suelto. Cocer brócoli al vapor retiene compuestos activos."
        },
        {
          optionId: "opt_almuerzo_2b",
          name: "Bola de Lomo al Horno con Papas Asadas y Zanahoria",
          prepTimeMin: 30,
          tags: ["Alto en Proteína 💪", "Almuerzo 🍽️", "Superávit"],
          servings: 1,
          ingredients: [
            { name: "Carne vacuna magra (Bola de lomo / Nalga)", amount: 200, unit: "g", protPer100g: 21.5, carbsPer100g: 0.0, fatPer100g: 3.5, calsPer100g: 117.5 },
            { name: "Papa", amount: 400, unit: "g", protPer100g: 2.0, carbsPer100g: 17.0, fatPer100g: 0.1, calsPer100g: 76.9 },
            { name: "Zanahoria", amount: 100, unit: "g", protPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2, calsPer100g: 43.8 },
            { name: "Aceite de oliva extra virgen", amount: 10, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 51.9, carbs: 77.6, fats: 17.6, calories: 676.4 },
          culinaryTip: "Sazonar las papas con aceite de oliva crudo tras hornear protege sus polifenoles antioxidantes."
        },
        {
          optionId: "opt_almuerzo_2c",
          name: "Pechuga Grillada con Arroz y Brócoli (Ligero)",
          prepTimeMin: 25,
          tags: ["Alto en Proteína 💪", "Almuerzo 🍽️", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Pechuga de pollo", amount: 220, unit: "g", protPer100g: 22.5, carbsPer100g: 0.0, fatPer100g: 2.6, calsPer100g: 113.4 },
            { name: "Arroz blanco", amount: 80, unit: "g", protPer100g: 7.0, carbsPer100g: 78.0, fatPer100g: 0.6, calsPer100g: 345.4 },
            { name: "Brócoli", amount: 150, unit: "g", protPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, calsPer100g: 41.2 },
            { name: "Aceite de oliva extra virgen", amount: 10, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 59.3, carbs: 72.3, fats: 16.8, calories: 677.6 },
          culinaryTip: "La elevación del pollo estabiliza la saciedad en el tracto gástrico compensando la reducción del arroz."
        },
        {
          optionId: "opt_almuerzo_2d",
          name: "Bife Magro al Horno con Papa Asada y Tomate",
          prepTimeMin: 30,
          tags: ["Alto en Proteína 💪", "Almuerzo 🍽️", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Carne vacuna magra (Bola de lomo / Nalga)", amount: 220, unit: "g", protPer100g: 21.5, carbsPer100g: 0.0, fatPer100g: 3.5, calsPer100g: 117.5 },
            { name: "Papa", amount: 300, unit: "g", protPer100g: 2.0, carbsPer100g: 17.0, fatPer100g: 0.1, calsPer100g: 76.9 },
            { name: "Tomate", amount: 150, unit: "g", protPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, calsPer100g: 21.0 },
            { name: "Aceite de oliva extra virgen", amount: 10, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 54.7, carbs: 56.9, fats: 18.3, calories: 610.7 },
          culinaryTip: "Cortar el tomate en gajos amplios y rociar con oliva asiste a la reducción de inflamación post-entrenamiento."
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 3. MERIENDA
    // -------------------------------------------------------------------------
    {
      mealId: "m3_merienda",
      mealName: "Merienda",
      recommendedTime: "17:30",
      targetMacros: { protein: 46.0, carbs: 77.0, fats: 18.0, calories: 660.0 },
      options: [
        {
          optionId: "opt_merienda_3a",
          name: "Bowl de Yogur Griego, Granola y Almendras",
          prepTimeMin: 5,
          tags: ["Alto en Proteína 💪", "Merienda 🥤", "Rápido"],
          servings: 1,
          ingredients: [
            { name: "Yogur griego natural descremado", amount: 250, unit: "g", protPer100g: 10.0, carbsPer100g: 4.0, fatPer100g: 0.4, calsPer100g: 59.6 },
            { name: "Granola artesanal sin azúcar", amount: 80, unit: "g", protPer100g: 10.0, carbsPer100g: 62.0, fatPer100g: 12.0, calsPer100g: 396.0 },
            { name: "Miel de abejas", amount: 20, unit: "g", protPer100g: 0.3, carbsPer100g: 82.0, fatPer100g: 0.0, calsPer100g: 329.2 },
            { name: "Almendras / Frutos secos", amount: 20, unit: "g", protPer100g: 21.0, carbsPer100g: 20.0, fatPer100g: 50.0, calsPer100g: 614.0 }
          ],
          totalMacros: { protein: 37.3, carbs: 80.0, fats: 20.6, calories: 654.4 },
          culinaryTip: "Mantener la granola y la miel apartadas del yogur si se prepara con antelación para conservar su textura crujiente."
        },
        {
          optionId: "opt_merienda_3b",
          name: "Batido Hipercalórico Anabólico (Whey y Maní)",
          prepTimeMin: 3,
          tags: ["Alto en Proteína 💪", "Merienda 🥤", "Líquido"],
          servings: 1,
          ingredients: [
            { name: "Leche descremada", amount: 300, unit: "g", protPer100g: 3.4, carbsPer100g: 5.0, fatPer100g: 0.1, calsPer100g: 34.5 },
            { name: "Whey protein concentrado 80%", amount: 40, unit: "g", protPer100g: 80.0, carbsPer100g: 6.0, fatPer100g: 6.0, calsPer100g: 398.0 },
            { name: "Banana", amount: 100, unit: "g", protPer100g: 1.1, carbsPer100g: 23.0, fatPer100g: 0.3, calsPer100g: 99.1 },
            { name: "Avena en hojuelas", amount: 50, unit: "g", protPer100g: 13.5, carbsPer100g: 60.0, fatPer100g: 6.5, calsPer100g: 352.5 },
            { name: "Manteca de maní 100%", amount: 20, unit: "g", protPer100g: 25.0, carbsPer100g: 20.0, fatPer100g: 50.0, calsPer100g: 630.0 }
          ],
          totalMacros: { protein: 55.1, carbs: 74.4, fats: 16.3, calories: 664.1 },
          culinaryTip: "Licuar primeramente la avena en seco para pulverizarla y evitar grumos que dificulten la digestión."
        },
        {
          optionId: "opt_merienda_3c",
          name: "Bowl de Yogur Griego Simple",
          prepTimeMin: 5,
          tags: ["Alto en Proteína 💪", "Merienda 🥤", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Yogur griego natural descremado", amount: 250, unit: "g", protPer100g: 10.0, carbsPer100g: 4.0, fatPer100g: 0.4, calsPer100g: 59.6 },
            { name: "Granola artesanal sin azúcar", amount: 50, unit: "g", protPer100g: 10.0, carbsPer100g: 62.0, fatPer100g: 12.0, calsPer100g: 396.0 },
            { name: "Almendras / Frutos secos", amount: 15, unit: "g", protPer100g: 21.0, carbsPer100g: 20.0, fatPer100g: 50.0, calsPer100g: 614.0 }
          ],
          totalMacros: { protein: 33.2, carbs: 44.0, fats: 14.5, calories: 439.1 },
          culinaryTip: "Eliminar la miel simple re-sensibiliza los picos de insulina y restringe el ingreso de calorías vacías."
        },
        {
          optionId: "opt_merienda_3d",
          name: "Batido Ligero de Proteína sin Avena",
          prepTimeMin: 3,
          tags: ["Alto en Proteína 💪", "Merienda 🥤", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Leche descremada", amount: 300, unit: "g", protPer100g: 3.4, carbsPer100g: 5.0, fatPer100g: 0.1, calsPer100g: 34.5 },
            { name: "Whey protein concentrado 80%", amount: 40, unit: "g", protPer100g: 80.0, carbsPer100g: 6.0, fatPer100g: 6.0, calsPer100g: 398.0 },
            { name: "Banana", amount: 100, unit: "g", protPer100g: 1.1, carbsPer100g: 23.0, fatPer100g: 0.3, calsPer100g: 99.1 },
            { name: "Manteca de maní 100%", amount: 15, unit: "g", protPer100g: 25.0, carbsPer100g: 20.0, fatPer100g: 50.0, calsPer100g: 630.0 }
          ],
          totalMacros: { protein: 47.1, carbs: 43.4, fats: 10.5, calories: 456.3 },
          culinaryTip: "El retiro de la avena reduce densidad calórica manteniendo la rápida absorción peptídica peri-entrenamiento."
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 4. CENA
    // -------------------------------------------------------------------------
    {
      mealId: "m4_cena",
      mealName: "Cena",
      recommendedTime: "21:30",
      targetMacros: { protein: 56.0, carbs: 68.0, fats: 16.0, calories: 640.0 },
      options: [
        {
          optionId: "opt_cena_4a",
          name: "Atún al Natural con Quinoa y Tomate Fresco",
          prepTimeMin: 15,
          tags: ["Alto en Proteína 💪", "Cena 🌙", "Superávit"],
          servings: 1,
          ingredients: [
            { name: "Atún al natural escurrido", amount: 200, unit: "g", protPer100g: 23.5, carbsPer100g: 0.0, fatPer100g: 1.0, calsPer100g: 103.0 },
            { name: "Quinoa", amount: 100, unit: "g", protPer100g: 14.0, carbsPer100g: 64.0, fatPer100g: 6.0, calsPer100g: 366.0 },
            { name: "Tomate", amount: 100, unit: "g", protPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, calsPer100g: 21.0 },
            { name: "Aceite de oliva extra virgen", amount: 10, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 61.9, carbs: 67.9, fats: 18.2, calories: 683.0 },
          culinaryTip: "Friccionar la quinoa bajo el grifo de agua elimina activamente las saponinas amargas, optimizando la digestión nocturna."
        },
        {
          optionId: "opt_cena_4b",
          name: "Omelette Relleno con Queso Magro y Fideos Integrales",
          prepTimeMin: 20,
          tags: ["Alto en Proteína 💪", "Cena 🌙", "Superávit"],
          servings: 1,
          ingredients: [
            { name: "Huevo entero", amount: 100, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Clara de huevo", amount: 150, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Queso por salut descremado", amount: 50, unit: "g", protPer100g: 18.0, carbsPer100g: 3.0, fatPer100g: 4.0, calsPer100g: 120.0 },
            { name: "Fideos integrales", amount: 100, unit: "g", protPer100g: 12.5, carbsPer100g: 65.0, fatPer100g: 2.0, calsPer100g: 328.0 }
          ],
          totalMacros: { protein: 50.5, carbs: 68.3, fats: 13.8, calories: 599.0 },
          culinaryTip: "El queso por salut descremado aporta caseína al 80% para una liberación proteica sostenida durante el sueño."
        },
        {
          optionId: "opt_cena_4c",
          name: "Atún al Natural con Quinoa y Zanahoria (Ligero)",
          prepTimeMin: 15,
          tags: ["Alto en Proteína 💪", "Cena 🌙", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Atún al natural escurrido", amount: 200, unit: "g", protPer100g: 23.5, carbsPer100g: 0.0, fatPer100g: 1.0, calsPer100g: 103.0 },
            { name: "Quinoa", amount: 60, unit: "g", protPer100g: 14.0, carbsPer100g: 64.0, fatPer100g: 6.0, calsPer100g: 366.0 },
            { name: "Zanahoria", amount: 150, unit: "g", protPer100g: 0.9, carbsPer100g: 9.6, fatPer100g: 0.2, calsPer100g: 43.8 },
            { name: "Aceite de oliva extra virgen", amount: 5, unit: "g", protPer100g: 0.0, carbsPer100g: 0.0, fatPer100g: 100.0, calsPer100g: 900.0 }
          ],
          totalMacros: { protein: 56.8, carbs: 52.8, fats: 10.9, calories: 536.3 },
          culinaryTip: "Elevar la fracción de zanahorias crudas compensa la reducción de la quinoa sin acumulación calórica neta."
        },
        {
          optionId: "opt_cena_4d",
          name: "Omelette Nocturno de Claras con Fideos y Brócoli",
          prepTimeMin: 20,
          tags: ["Alto en Proteína 💪", "Cena 🌙", "Recomposición"],
          servings: 1,
          ingredients: [
            { name: "Huevo entero", amount: 50, unit: "g", protPer100g: 12.6, carbsPer100g: 0.7, fatPer100g: 9.5, calsPer100g: 138.7 },
            { name: "Clara de huevo", amount: 200, unit: "g", protPer100g: 10.9, carbsPer100g: 0.7, fatPer100g: 0.2, calsPer100g: 48.2 },
            { name: "Queso por salut descremado", amount: 40, unit: "g", protPer100g: 18.0, carbsPer100g: 3.0, fatPer100g: 4.0, calsPer100g: 120.0 },
            { name: "Fideos integrales", amount: 70, unit: "g", protPer100g: 12.5, carbsPer100g: 65.0, fatPer100g: 2.0, calsPer100g: 328.0 },
            { name: "Brócoli", amount: 100, unit: "g", protPer100g: 2.8, carbsPer100g: 6.6, fatPer100g: 0.4, calsPer100g: 41.2 }
          ],
          totalMacros: { protein: 46.9, carbs: 55.1, fats: 8.6, calories: 484.6 },
          culinaryTip: "Cortar el brócoli y amalgamar en la cocción del omelette mejora la presentación y estabiliza el tránsito intestinal."
        }
      ]
    }
  ]
};

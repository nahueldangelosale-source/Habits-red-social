/**
 * Preset Nutricional Maestro — FASE 4: Rendimiento Deportivo, Periodización & Salud Hormonal Femenina
 * Basado en Deep Research: Fisiología Femenina, Seed Cycling (Lino/Calabaza en Folicular y Sésamo/Girasol en Lútea),
 * Protocolo de Rescate SOP/PCOS (GLUT-4, Baja Carga Glucémica), Biodisponibilidad de Hierro Hemo y Tríada Neuro-Inhibitoria (B6/Mg/Zn).
 * Arquetipos: ARQ_FEMALE_HEALTH, ARQ_05_ATHLETIC_40, ARQ_CARB_CYCLING
 */

import type { PresetPhase } from './fase1_fuerza_hipertrofia';

export const PRESET_FASE_04_ATHLETIC_FEMALE_HEALTH: PresetPhase = {
  phaseId: "FASE_04_ATHLETIC_FEMALE_HEALTH",
  phaseName: "Rendimiento Deportivo, Periodización & Salud Hormonal Femenina",
  targetArchetypes: [
    "ARQ_FEMALE_HEALTH",
    "ARQ_05_ATHLETIC_40",
    "ARQ_CARB_CYCLING"
  ],
  dailyTargetMacros: {
    calories: 2250,
    protein: 145,
    carbs: 260,
    fats: 70
  },
  meals: [
    // -------------------------------------------------------------------------
    // 1. DESAYUNOS (Tríada A / B / C)
    // -------------------------------------------------------------------------
    {
      mealId: "m1_desayuno",
      mealName: "Desayuno",
      recommendedTime: "08:00",
      targetMacros: {
        protein: 32.0,
        carbs: 55.0,
        fats: 16.0,
        calories: 492.0
      },
      options: [
        {
          optionId: "opt_desayuno_4a",
          name: "Pancakes de Avena, Cacao Puro y Semillas de Lino/Calabaza",
          prepTimeMin: 12,
          tags: [
            "Salud Hormonal 🌸",
            "Magnesio 🍫",
            "Seed Cycling 🌱"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Avena en hojuelas",
              amount: 60,
              unit: "g",
              protPer100g: 13.5,
              carbsPer100g: 60.0,
              fatPer100g: 6.5,
              calsPer100g: 352.5
            },
            {
              name: "Clara de huevo",
              amount: 150,
              unit: "g",
              protPer100g: 10.9,
              carbsPer100g: 0.7,
              fatPer100g: 0.2,
              calsPer100g: 48.2
            },
            {
              name: "Cacao amargo 100% en polvo",
              amount: 10,
              unit: "g",
              protPer100g: 19.5,
              carbsPer100g: 13.5,
              fatPer100g: 13.5,
              calsPer100g: 253.5
            },
            {
              name: "Semillas de lino molidas",
              amount: 15,
              unit: "g",
              protPer100g: 18.0,
              carbsPer100g: 29.0,
              fatPer100g: 42.0,
              calsPer100g: 566.0
            },
            {
              name: "Banana",
              amount: 80,
              unit: "g",
              protPer100g: 1.1,
              carbsPer100g: 23.0,
              fatPer100g: 0.3,
              calsPer100g: 99.1
            }
          ],
          culinaryTip: "Licuar los ingredientes en crudo. El cacao amargo aporta magnesio puro que relaja el miometrio y reduce la tensión muscular matutina.",
          totalMacros: {
            protein: 30.0,
            carbs: 61.2,
            fats: 12.1,
            calories: 473.3
          }
        },
        {
          optionId: "opt_desayuno_4b",
          name: "Tostadas de Masa Madre con Huevos Revueltos, Palta y Semillas",
          prepTimeMin: 10,
          tags: [
            "Rescate SOP 🥑",
            "Low-GI 🌾",
            "Sensibilidad Insulínica ⚡"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Pan de masa madre integral",
              amount: 70,
              unit: "g",
              protPer100g: 9.0,
              carbsPer100g: 45.0,
              fatPer100g: 2.0,
              calsPer100g: 234.0
            },
            {
              name: "Huevo entero pastoril",
              amount: 110,
              unit: "g",
              protPer100g: 12.6,
              carbsPer100g: 0.8,
              fatPer100g: 9.9,
              calsPer100g: 142.7
            },
            {
              name: "Palta Hass",
              amount: 40,
              unit: "g",
              protPer100g: 2.0,
              carbsPer100g: 8.5,
              fatPer100g: 15.0,
              calsPer100g: 177.0
            },
            {
              name: "Semillas de calabaza activadas",
              amount: 15,
              unit: "g",
              protPer100g: 24.5,
              carbsPer100g: 14.0,
              fatPer100g: 45.0,
              calsPer100g: 559.0
            },
            {
              name: "Canela en polvo",
              amount: 3,
              unit: "g",
              protPer100g: 4.0,
              carbsPer100g: 81.0,
              fatPer100g: 1.2,
              calsPer100g: 350.8
            }
          ],
          culinaryTip: "La fermentación láctica de la masa madre disminuye la carga glucémica pico. La canela potencia la traslocación de GLUT-4 sin disparar la insulina.",
          totalMacros: {
            protein: 25.0,
            carbs: 36.7,
            fats: 25.8,
            calories: 479.0
          }
        },
        {
          optionId: "opt_desayuno_4c",
          name: "Bowl Express de Yogur Griego, Frutos Rojos, Canela y Semillas Activadas",
          prepTimeMin: 3,
          tags: [
            "Express ⚡",
            "Probióticos 🦠",
            "Antiinflamatorio 🍓"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Yogur griego natural 0%",
              amount: 200,
              unit: "g",
              protPer100g: 10.0,
              carbsPer100g: 4.0,
              fatPer100g: 0.5,
              calsPer100g: 60.5
            },
            {
              name: "Frutos rojos frescos",
              amount: 120,
              unit: "g",
              protPer100g: 1.0,
              carbsPer100g: 12.0,
              fatPer100g: 0.4,
              calsPer100g: 55.6
            },
            {
              name: "Proteína de suero de leche (Whey)",
              amount: 15,
              unit: "g",
              protPer100g: 80.0,
              carbsPer100g: 4.0,
              fatPer100g: 2.0,
              calsPer100g: 354.0
            },
            {
              name: "Semillas de calabaza activadas",
              amount: 15,
              unit: "g",
              protPer100g: 24.5,
              carbsPer100g: 14.0,
              fatPer100g: 45.0,
              calsPer100g: 559.0
            },
            {
              name: "Semillas de lino molidas",
              amount: 10,
              unit: "g",
              protPer100g: 18.0,
              carbsPer100g: 29.0,
              fatPer100g: 42.0,
              calsPer100g: 566.0
            }
          ],
          culinaryTip: "Ensamble instantáneo. Las antocianinas de los frutos rojos atenúan el estrés oxidativo tisular y optimizan la flora intestinal.",
          totalMacros: {
            protein: 38.7,
            carbs: 28.0,
            fats: 12.7,
            calories: 381.1
          }
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
      targetMacros: {
        protein: 45.0,
        carbs: 85.0,
        fats: 20.0,
        calories: 700.0
      },
      options: [
        {
          optionId: "opt_almuerzo_4a",
          name: "Bife de Cuadril con Batata Asada al Romero y Ensalada de Espinaca",
          prepTimeMin: 18,
          tags: [
            "Hierro Hemo 🥩",
            "Recarga de Glucógeno 🍠",
            "Soporte Lúteo 🌸"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Bife de cuadril magro",
              amount: 180,
              unit: "g",
              protPer100g: 21.5,
              carbsPer100g: 0.0,
              fatPer100g: 4.5,
              calsPer100g: 126.5
            },
            {
              name: "Batata cruda",
              amount: 300,
              unit: "g",
              protPer100g: 1.6,
              carbsPer100g: 20.0,
              fatPer100g: 0.1,
              calsPer100g: 87.3
            },
            {
              name: "Espinaca fresca",
              amount: 80,
              unit: "g",
              protPer100g: 2.9,
              carbsPer100g: 3.6,
              fatPer100g: 0.4,
              calsPer100g: 29.6
            },
            {
              name: "Aceite de oliva extra virgen",
              amount: 10,
              unit: "ml",
              protPer100g: 0.0,
              carbsPer100g: 0.0,
              fatPer100g: 100.0,
              calsPer100g: 900.0
            },
            {
              name: "Semillas de sésamo",
              amount: 10,
              unit: "g",
              protPer100g: 18.0,
              carbsPer100g: 23.0,
              fatPer100g: 50.0,
              calsPer100g: 614.0
            }
          ],
          culinaryTip: "Sellar el bife a fuego fuerte para preservar jugos. La batata provee almidón de digestión lenta y potasio para mitigar la fatiga neuromuscular.",
          totalMacros: {
            protein: 47.6,
            carbs: 65.2,
            fats: 23.7,
            calories: 664.5
          }
        },
        {
          optionId: "opt_almuerzo_4b",
          name: "Pechuga Salteada con Quinoa, Brócoli y Semillas de Sésamo",
          prepTimeMin: 15,
          tags: [
            "SOP Friendly 🥦",
            "Lignanos 🌱",
            "Proteína Completa 🍗"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Pechuga de pollo",
              amount: 170,
              unit: "g",
              protPer100g: 22.5,
              carbsPer100g: 0.0,
              fatPer100g: 2.5,
              calsPer100g: 112.5
            },
            {
              name: "Quinoa cruda",
              amount: 90,
              unit: "g",
              protPer100g: 14.0,
              carbsPer100g: 64.0,
              fatPer100g: 6.0,
              calsPer100g: 366.0
            },
            {
              name: "Brócoli fresco",
              amount: 150,
              unit: "g",
              protPer100g: 2.8,
              carbsPer100g: 6.6,
              fatPer100g: 0.4,
              calsPer100g: 41.2
            },
            {
              name: "Semillas de sésamo",
              amount: 15,
              unit: "g",
              protPer100g: 18.0,
              carbsPer100g: 23.0,
              fatPer100g: 50.0,
              calsPer100g: 614.0
            },
            {
              name: "Aceite de oliva extra virgen",
              amount: 8,
              unit: "ml",
              protPer100g: 0.0,
              carbsPer100g: 0.0,
              fatPer100g: 100.0,
              calsPer100g: 900.0
            }
          ],
          culinaryTip: "Cocinar la quinoa previa hidratación. El sulforafano del brócoli apoya la detoxificación de estrógenos en fase 2 hepática.",
          totalMacros: {
            protein: 57.8,
            carbs: 71.0,
            fats: 25.8,
            calories: 747.4
          }
        },
        {
          optionId: "opt_almuerzo_4c",
          name: "Wrap Integral de Atún, Huevo y Palta con Hojas Verdes",
          prepTimeMin: 5,
          tags: [
            "Portátil 🌯",
            "Omega-3 🐟",
            "Post-Entreno ⚡"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Rapita integral (Wrap)",
              amount: 100,
              unit: "g",
              protPer100g: 9.0,
              carbsPer100g: 50.0,
              fatPer100g: 5.0,
              calsPer100g: 281.0
            },
            {
              name: "Atún al natural escurrido",
              amount: 140,
              unit: "g",
              protPer100g: 24.0,
              carbsPer100g: 0.0,
              fatPer100g: 1.0,
              calsPer100g: 105.0
            },
            {
              name: "Huevo entero pastoril",
              amount: 55,
              unit: "g",
              protPer100g: 12.6,
              carbsPer100g: 0.8,
              fatPer100g: 9.9,
              calsPer100g: 142.7
            },
            {
              name: "Palta Hass",
              amount: 50,
              unit: "g",
              protPer100g: 2.0,
              carbsPer100g: 8.5,
              fatPer100g: 15.0,
              calsPer100g: 177.0
            },
            {
              name: "Espinaca fresca",
              amount: 50,
              unit: "g",
              protPer100g: 2.9,
              carbsPer100g: 3.6,
              fatPer100g: 0.4,
              calsPer100g: 29.6
            }
          ],
          culinaryTip: "Mezclar el atún con la palta pisada como aderezo cremoso sin mayonesa. Ideal para llevar al trabajo o comer peri-entrenamiento.",
          totalMacros: {
            protein: 52.0,
            carbs: 56.5,
            fats: 19.6,
            calories: 610.4
          }
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
      targetMacros: {
        protein: 28.0,
        carbs: 50.0,
        fats: 14.0,
        calories: 438.0
      },
      options: [
        {
          optionId: "opt_merienda_4a",
          name: "Mug Cake Proteico de Banana, Avena, Claras y Cacao 100%",
          prepTimeMin: 4,
          tags: [
            "Freno Cravings 🍫",
            "Magnesio & B6 🧠",
            "Soporte Lúteo 🌸"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Avena en hojuelas",
              amount: 45,
              unit: "g",
              protPer100g: 13.5,
              carbsPer100g: 60.0,
              fatPer100g: 6.5,
              calsPer100g: 352.5
            },
            {
              name: "Clara de huevo",
              amount: 120,
              unit: "g",
              protPer100g: 10.9,
              carbsPer100g: 0.7,
              fatPer100g: 0.2,
              calsPer100g: 48.2
            },
            {
              name: "Banana",
              amount: 90,
              unit: "g",
              protPer100g: 1.1,
              carbsPer100g: 23.0,
              fatPer100g: 0.3,
              calsPer100g: 99.1
            },
            {
              name: "Cacao amargo 100% en polvo",
              amount: 12,
              unit: "g",
              protPer100g: 19.5,
              carbsPer100g: 13.5,
              fatPer100g: 13.5,
              calsPer100g: 253.5
            },
            {
              name: "Semillas de girasol",
              amount: 10,
              unit: "g",
              protPer100g: 21.0,
              carbsPer100g: 20.0,
              fatPer100g: 51.0,
              calsPer100g: 623.0
            }
          ],
          culinaryTip: "Cocinar en taza al microondas por 90 segundos. Aporta piridoxina (B6) y magnesio para atenuar los antojos hedónicos premenstruales.",
          totalMacros: {
            protein: 24.6,
            carbs: 52.2,
            fats: 10.2,
            calories: 399.0
          }
        },
        {
          optionId: "opt_merienda_4b",
          name: "Smoothie Proteico de Frutillas con Manteca de Maní y Semillas de Girasol",
          prepTimeMin: 3,
          tags: [
            "Selenio & Vit E 🌻",
            "Antiinflamatorio 🍓",
            "Portátil 🥤"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Proteína de suero de leche (Whey)",
              amount: 25,
              unit: "g",
              protPer100g: 80.0,
              carbsPer100g: 4.0,
              fatPer100g: 2.0,
              calsPer100g: 354.0
            },
            {
              name: "Frutillas frescas",
              amount: 150,
              unit: "g",
              protPer100g: 0.8,
              carbsPer100g: 7.7,
              fatPer100g: 0.3,
              calsPer100g: 36.7
            },
            {
              name: "Manteca de maní 100%",
              amount: 15,
              unit: "g",
              protPer100g: 25.0,
              carbsPer100g: 20.0,
              fatPer100g: 50.0,
              calsPer100g: 630.0
            },
            {
              name: "Semillas de girasol",
              amount: 15,
              unit: "g",
              protPer100g: 21.0,
              carbsPer100g: 20.0,
              fatPer100g: 51.0,
              calsPer100g: 623.0
            },
            {
              name: "Canela en polvo",
              amount: 2,
              unit: "g",
              protPer100g: 4.0,
              carbsPer100g: 81.0,
              fatPer100g: 1.2,
              calsPer100g: 350.8
            }
          ],
          culinaryTip: "Licuar con hielo y agua. El aporte de vitamina E y selenio de las semillas de girasol protege el cuerpo lúteo contra el daño oxidativo.",
          totalMacros: {
            protein: 28.2,
            carbs: 20.2,
            fats: 16.1,
            calories: 338.5
          }
        },
        {
          optionId: "opt_merienda_4c",
          name: "Tostadas Integrales con Huevo Duro y Mix de Semillas Tostadas",
          prepTimeMin: 5,
          tags: [
            "Crujiente 🍞",
            "Saciante 🍳",
            "Rescate SOP 🥑"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Pan de masa madre integral",
              amount: 60,
              unit: "g",
              protPer100g: 9.0,
              carbsPer100g: 45.0,
              fatPer100g: 2.0,
              calsPer100g: 234.0
            },
            {
              name: "Huevo entero pastoril",
              amount: 110,
              unit: "g",
              protPer100g: 12.6,
              carbsPer100g: 0.8,
              fatPer100g: 9.9,
              calsPer100g: 142.7
            },
            {
              name: "Semillas de sésamo",
              amount: 10,
              unit: "g",
              protPer100g: 18.0,
              carbsPer100g: 23.0,
              fatPer100g: 50.0,
              calsPer100g: 614.0
            },
            {
              name: "Semillas de girasol",
              amount: 10,
              unit: "g",
              protPer100g: 21.0,
              carbsPer100g: 20.0,
              fatPer100g: 51.0,
              calsPer100g: 623.0
            },
            {
              name: "Aceite de oliva extra virgen",
              amount: 5,
              unit: "ml",
              protPer100g: 0.0,
              carbsPer100g: 0.0,
              fatPer100g: 100.0,
              calsPer100g: 900.0
            }
          ],
          culinaryTip: "Tostar suavemente las semillas para activar sus aromatizantes sin oxidar sus grasas poliinsaturadas. Excelente balance crujiente y proteico.",
          totalMacros: {
            protein: 23.2,
            carbs: 32.2,
            fats: 27.2,
            calories: 466.4
          }
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 4. CENAS (Tríada A / B / C)
    // -------------------------------------------------------------------------
    {
      mealId: "m4_cena",
      mealName: "Cena",
      recommendedTime: "21:00",
      targetMacros: {
        protein: 40.0,
        carbs: 70.0,
        fats: 20.0,
        calories: 620.0
      },
      options: [
        {
          optionId: "opt_cena_4a",
          name: "Salmón Rosado a la Plancha con Puré de Batatas y Rúcula",
          prepTimeMin: 15,
          tags: [
            "Descanso Muscular 🌙",
            "Omega-3 🐟",
            "Progesterona 🧘‍♀️"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Salmón rosado",
              amount: 160,
              unit: "g",
              protPer100g: 20.0,
              carbsPer100g: 0.0,
              fatPer100g: 13.0,
              calsPer100g: 197.0
            },
            {
              name: "Batata cruda",
              amount: 250,
              unit: "g",
              protPer100g: 1.6,
              carbsPer100g: 20.0,
              fatPer100g: 0.1,
              calsPer100g: 87.3
            },
            {
              name: "Rúcula fresca",
              amount: 60,
              unit: "g",
              protPer100g: 2.6,
              carbsPer100g: 3.6,
              fatPer100g: 0.7,
              calsPer100g: 31.1
            },
            {
              name: "Aceite de oliva extra virgen",
              amount: 8,
              unit: "ml",
              protPer100g: 0.0,
              carbsPer100g: 0.0,
              fatPer100g: 100.0,
              calsPer100g: 900.0
            },
            {
              name: "Semillas de girasol",
              amount: 10,
              unit: "g",
              protPer100g: 21.0,
              carbsPer100g: 20.0,
              fatPer100g: 51.0,
              calsPer100g: 623.0
            }
          ],
          culinaryTip: "Cocinar el salmón sobre su piel para mantener los ácidos grasos EPA/DHA intactos. Los carbohidratos de la batata estimulan la síntesis nocturna de serotonina.",
          totalMacros: {
            protein: 39.7,
            carbs: 54.2,
            fats: 34.6,
            calories: 687.0
          }
        },
        {
          optionId: "opt_cena_4b",
          name: "Omelette Proteico con Queso Magro, Champiñones y Arroz Integral",
          prepTimeMin: 12,
          tags: [
            "Síntesis GABA 🧠",
            "Bajo IG 🌾",
            "SOP Control 🛡️"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Clara de huevo",
              amount: 150,
              unit: "g",
              protPer100g: 10.9,
              carbsPer100g: 0.7,
              fatPer100g: 0.2,
              calsPer100g: 48.2
            },
            {
              name: "Huevo entero pastoril",
              amount: 55,
              unit: "g",
              protPer100g: 12.6,
              carbsPer100g: 0.8,
              fatPer100g: 9.9,
              calsPer100g: 142.7
            },
            {
              name: "Queso Por Salut Light",
              amount: 50,
              unit: "g",
              protPer100g: 22.0,
              carbsPer100g: 1.5,
              fatPer100g: 10.0,
              calsPer100g: 184.0
            },
            {
              name: "Champiñones frescos",
              amount: 80,
              unit: "g",
              protPer100g: 3.1,
              carbsPer100g: 3.3,
              fatPer100g: 0.3,
              calsPer100g: 28.3
            },
            {
              name: "Arroz integral crudo",
              amount: 65,
              unit: "g",
              protPer100g: 7.5,
              carbsPer100g: 77.0,
              fatPer100g: 2.5,
              calsPer100g: 360.5
            }
          ],
          culinaryTip: "Acompañar con el arroz cocido. Los champiñones aportados junto con los aminoácidos del huevo facilitan la regulación del tono vagal para el sueño profundo.",
          totalMacros: {
            protein: 41.6,
            carbs: 54.9,
            fats: 12.6,
            calories: 499.4
          }
        },
        {
          optionId: "opt_cena_4c",
          name: "Cazuela Rápida de Pollo con Vegetales y Semillas de Sésamo",
          prepTimeMin: 15,
          tags: [
            "Confort Térmico 🍲",
            "Fácil Digestión 🌿",
            "Calcio Bio 🦴"
          ],
          servings: 1,
          ingredients: [
            {
              name: "Pechuga de pollo",
              amount: 160,
              unit: "g",
              protPer100g: 22.5,
              carbsPer100g: 0.0,
              fatPer100g: 2.5,
              calsPer100g: 112.5
            },
            {
              name: "Batata cruda",
              amount: 200,
              unit: "g",
              protPer100g: 1.6,
              carbsPer100g: 20.0,
              fatPer100g: 0.1,
              calsPer100g: 87.3
            },
            {
              name: "Brócoli fresco",
              amount: 100,
              unit: "g",
              protPer100g: 2.8,
              carbsPer100g: 6.6,
              fatPer100g: 0.4,
              calsPer100g: 41.2
            },
            {
              name: "Semillas de sésamo",
              amount: 15,
              unit: "g",
              protPer100g: 18.0,
              carbsPer100g: 23.0,
              fatPer100g: 50.0,
              calsPer100g: 614.0
            },
            {
              name: "Aceite de oliva extra virgen",
              amount: 8,
              unit: "ml",
              protPer100g: 0.0,
              carbsPer100g: 0.0,
              fatPer100g: 100.0,
              calsPer100g: 900.0
            }
          ],
          culinaryTip: "Saltear el pollo cortado en cubos pequeños con la batata previamente hervida o al vapor. Digestión rápida sin interferir con la liberación de hormona de crecimiento.",
          totalMacros: {
            protein: 44.7,
            carbs: 50.1,
            fats: 20.1,
            calories: 560.1
          }
        }
      ]
    }
  ]
};

export interface RecipeIngredient {
  saraId: string;
  name: string;
  baseRawAmount: number; // Gramos en crudo
  correctionFactor: number; // FC
  yieldFactor: number; // YF
  retentionFactor: number; // RF
  isAnchor?: boolean;
}

export interface RecipeSeed {
  id: string;
  name: string;
  tags: string[]; // e.g., 'vegano', 'sin_gluten', 'pollo'
  ingredients: RecipeIngredient[];
}

export const MASTER_RECIPES: RecipeSeed[] = [
  {
    id: 'rec_pollo_arroz_brocoli',
    name: 'Pollo Teriyaki con Arroz y Brócoli',
    tags: ['sin_gluten', 'alto_proteina', 'pollo'],
    ingredients: [
      {
        saraId: '272.0', // Pechuga de pollo
        name: 'Pechuga de Pollo',
        baseRawAmount: 150,
        correctionFactor: 1.0, // Ya viene limpia
        yieldFactor: 0.75, // Pierde 25% de agua al cocinar
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '123.0', // Arroz blanco
        name: 'Arroz Blanco',
        baseRawAmount: 50,
        correctionFactor: 1.0,
        yieldFactor: 2.5, // Absorbe agua, rinde más
        retentionFactor: 1.0,
      },
      {
        saraId: '456.0', // Brócoli
        name: 'Brócoli',
        baseRawAmount: 100,
        correctionFactor: 0.8, // Pierde 20% en tallos gruesos
        yieldFactor: 0.9,
        retentionFactor: 0.8, // Pérdida de vit C al hervir
      }
    ]
  },
  {
    id: 'rec_avena_proteica',
    name: 'Avena Proteica con Frutos Rojos',
    tags: ['vegetariano', 'desayuno'],
    ingredients: [
      {
        saraId: '789.0', // Avena
        name: 'Avena Tradicional',
        baseRawAmount: 50,
        correctionFactor: 1.0,
        yieldFactor: 1.0, 
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '801.0', // Whey
        name: 'Whey Protein Vainilla',
        baseRawAmount: 30,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '802.0', // Arandanos
        name: 'Arándanos',
        baseRawAmount: 50,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_tofu_quinoa',
    name: 'Bowl Vegano de Tofu y Quinoa',
    tags: ['vegano', 'sin_gluten'],
    ingredients: [
      {
        saraId: '901.0', // Tofu
        name: 'Tofu Firme',
        baseRawAmount: 150,
        correctionFactor: 1.0,
        yieldFactor: 0.85, 
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '902.0', // Quinoa
        name: 'Quinoa',
        baseRawAmount: 60,
        correctionFactor: 1.0,
        yieldFactor: 2.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_milanesa_horno',
    name: 'Milanesa al Horno con Ensalada',
    tags: ['alto_proteina', 'almuerzo'],
    ingredients: [
      {
        saraId: '272.0',
        name: 'Pechuga de Pollo',
        baseRawAmount: 200,
        correctionFactor: 1.0,
        yieldFactor: 0.75,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '101.0',
        name: 'Pan Rallado Integral',
        baseRawAmount: 30,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '301.0',
        name: 'Huevo',
        baseRawAmount: 50,
        correctionFactor: 0.88,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '401.0',
        name: 'Lechuga',
        baseRawAmount: 80,
        correctionFactor: 0.8,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '402.0',
        name: 'Tomate',
        baseRawAmount: 100,
        correctionFactor: 0.95,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_tostadas_palta',
    name: 'Tostadas con Palta y Huevo',
    tags: ['desayuno', 'vegetariano'],
    ingredients: [
      {
        saraId: '102.0',
        name: 'Pan Integral Tostado',
        baseRawAmount: 60,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '501.0',
        name: 'Palta (Aguacate)',
        baseRawAmount: 50,
        correctionFactor: 0.7,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '301.0',
        name: 'Huevo',
        baseRawAmount: 100,
        correctionFactor: 0.88,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '601.0',
        name: 'Semillas de Chía',
        baseRawAmount: 10,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_ensalada_atun',
    name: 'Ensalada Proteica de Atún',
    tags: ['alto_proteina', 'bajo_carbos', 'almuerzo'],
    ingredients: [
      {
        saraId: '201.0',
        name: 'Atún al Natural',
        baseRawAmount: 150,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '401.0',
        name: 'Lechuga Mix',
        baseRawAmount: 100,
        correctionFactor: 0.8,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '402.0',
        name: 'Tomate Cherry',
        baseRawAmount: 80,
        correctionFactor: 0.95,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '301.0',
        name: 'Huevo Duro',
        baseRawAmount: 50,
        correctionFactor: 0.88,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '701.0',
        name: 'Aceite de Oliva',
        baseRawAmount: 10,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_batido_post',
    name: 'Batido Post-Entreno',
    tags: ['post_entreno', 'snack'],
    ingredients: [
      {
        saraId: '502.0',
        name: 'Banana',
        baseRawAmount: 120,
        correctionFactor: 0.65,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '801.0',
        name: 'Whey Protein',
        baseRawAmount: 30,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '803.0',
        name: 'Leche Descremada',
        baseRawAmount: 200,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '789.0',
        name: 'Avena',
        baseRawAmount: 20,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_pasta_bolognesa',
    name: 'Fideos con Salsa Bolognesa',
    tags: ['almuerzo', 'cena'],
    ingredients: [
      {
        saraId: '103.0',
        name: 'Fideos Integrales',
        baseRawAmount: 80,
        correctionFactor: 1.0,
        yieldFactor: 2.5,
        retentionFactor: 1.0,
      },
      {
        saraId: '250.0',
        name: 'Carne Picada Magra',
        baseRawAmount: 150,
        correctionFactor: 1.0,
        yieldFactor: 0.7,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '403.0',
        name: 'Salsa de Tomate',
        baseRawAmount: 100,
        correctionFactor: 1.0,
        yieldFactor: 0.9,
        retentionFactor: 1.0,
      },
      {
        saraId: '404.0',
        name: 'Cebolla',
        baseRawAmount: 50,
        correctionFactor: 0.85,
        yieldFactor: 0.85,
        retentionFactor: 0.85,
      }
    ]
  },
  {
    id: 'rec_wrap_pollo',
    name: 'Wrap de Pollo y Verduras',
    tags: ['almuerzo', 'alto_proteina'],
    ingredients: [
      {
        saraId: '104.0',
        name: 'Tortilla Integral',
        baseRawAmount: 60,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '272.0',
        name: 'Pechuga de Pollo Grillada',
        baseRawAmount: 150,
        correctionFactor: 1.0,
        yieldFactor: 0.75,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '401.0',
        name: 'Lechuga',
        baseRawAmount: 40,
        correctionFactor: 0.8,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '402.0',
        name: 'Tomate',
        baseRawAmount: 50,
        correctionFactor: 0.95,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '804.0',
        name: 'Queso Untable Light',
        baseRawAmount: 20,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_yogur_granola',
    name: 'Yogur con Granola y Frutas',
    tags: ['desayuno', 'snack', 'vegetariano'],
    ingredients: [
      {
        saraId: '805.0',
        name: 'Yogur Griego Natural',
        baseRawAmount: 170,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '105.0',
        name: 'Granola Casera',
        baseRawAmount: 30,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '502.0',
        name: 'Banana',
        baseRawAmount: 60,
        correctionFactor: 0.65,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '806.0',
        name: 'Miel',
        baseRawAmount: 10,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_revuelto_verduras',
    name: 'Revuelto de Huevos con Verduras',
    tags: ['desayuno', 'bajo_carbos', 'vegetariano'],
    ingredients: [
      {
        saraId: '301.0',
        name: 'Huevos',
        baseRawAmount: 150,
        correctionFactor: 0.88,
        yieldFactor: 0.95,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '405.0',
        name: 'Espinaca',
        baseRawAmount: 60,
        correctionFactor: 0.7,
        yieldFactor: 0.6,
        retentionFactor: 0.8,
      },
      {
        saraId: '406.0',
        name: 'Champiñones',
        baseRawAmount: 50,
        correctionFactor: 0.9,
        yieldFactor: 0.6,
        retentionFactor: 0.9,
      },
      {
        saraId: '807.0',
        name: 'Queso Rallado',
        baseRawAmount: 15,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      }
    ]
  },
  {
    id: 'rec_salmon_papas',
    name: 'Salmón al Horno con Papas',
    tags: ['cena', 'sin_gluten', 'alto_proteina'],
    ingredients: [
      {
        saraId: '202.0',
        name: 'Filete de Salmón',
        baseRawAmount: 180,
        correctionFactor: 1.0,
        yieldFactor: 0.8,
        retentionFactor: 1.0,
        isAnchor: true,
      },
      {
        saraId: '407.0',
        name: 'Papa',
        baseRawAmount: 150,
        correctionFactor: 0.85,
        yieldFactor: 1.0,
        retentionFactor: 0.9,
      },
      {
        saraId: '408.0',
        name: 'Espárragos',
        baseRawAmount: 80,
        correctionFactor: 0.5,
        yieldFactor: 0.9,
        retentionFactor: 0.8,
      },
      {
        saraId: '701.0',
        name: 'Aceite de Oliva',
        baseRawAmount: 10,
        correctionFactor: 1.0,
        yieldFactor: 1.0,
        retentionFactor: 1.0,
      },
      {
        saraId: '503.0',
        name: 'Limón',
        baseRawAmount: 10,
        correctionFactor: 0.4,
        yieldFactor: 1.0,
        retentionFactor: 0.5,
      }
    ]
  }
];

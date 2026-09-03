import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { WorkoutDay } from './usePlanBuilderStore';

export interface MesocyclePhase {
  id: string;
  name: string;
  days: WorkoutDay[];
  releaseDate: string | null;  // ISO date string, null = immediately visible
  notes: string;
}

export type LibraryCategory = 'TRAINING' | 'NUTRITION' | 'RECIPES' | 'DOCUMENTS';

export type LibraryItemLevel = 'PROGRAM' | 'BLOCK' | 'EXERCISE' | 'DOCUMENT' | 'RECIPE' | 'MEAL_PLAN';

export interface NutritionMealItem {
  name: string;
  time?: string;
  items: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

export interface LibraryItem {
  id: string;
  type: LibraryItemLevel;
  category?: LibraryCategory;
  name: string;
  icon?: string;
  taxonomyId: string | null;  // e.g. 'hypertrophy_phase_1'
  tags: string[];
  phases: MesocyclePhase[]; // Utilizado para PROGRAM y BLOCK
  
  // Nutrición & Dietas
  nutritionData?: {
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    meals: NutritionMealItem[];
  };

  // Recetarios
  recipeData?: {
    prepTimeMin: number;
    servings: number;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: string[];
    instructions: string[];
  };

  // Documentos adjuntos o enlaces externos
  documentData?: {
    fileType: 'PDF' | 'DOCX' | 'LINK';
    url?: string;
    sizeMb?: number;
  };
  customExerciseId?: string; 
  customExerciseData?: any; // To store ExerciseTaxonomy data for custom exercises
  version: number;
  createdAt: string;
  updatedAt: string;
  assignmentCount: number;
  internalNotes?: string;
  assignmentHistory?: { clientId: string; assignedAt: string; }[];
}

export interface TemplateFolder {
  id: string;
  name: string;
  category?: LibraryCategory;
  icon?: string;
  templates: LibraryItem[];
}

interface TemplateLibraryState {
  folders: TemplateFolder[];
  activeCategory: LibraryCategory;
  searchQuery: string;
  selectedTemplateId: string | null;
  isCreating: boolean;
  isSynced: boolean;
  lastSyncedAt: string | null;
}

interface TemplateLibraryActions {
  setActiveCategory: (cat: LibraryCategory) => void;
  createFolder: (name: string, category?: LibraryCategory, icon?: string) => void;
  renameFolder: (folderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  createTemplate: (
    folderId: string,
    template: Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'assignmentCount'>
  ) => void;
  createDocumentItem: (folderId: string, doc: { name: string; fileType: 'PDF' | 'DOCX' | 'LINK'; url?: string; notes?: string }) => void;
  importTemplateByCode: (code: string) => void;
  updateTemplate: (folderId: string, templateId: string, updates: Partial<LibraryItem>) => void;
  deleteTemplate: (folderId: string, templateId: string) => void;
  duplicateTemplate: (folderId: string, templateId: string) => void;
  moveTemplate: (fromFolderId: string, toFolderId: string, templateId: string) => void;
  forkTemplateToClient: (folderId: string, templateId: string, clientId?: string, phaseDates?: Record<string, string | null>) => WorkoutDay[];
  setSearchQuery: (query: string) => void;
  setSelectedTemplateId: (id: string | null) => void;
  getFilteredTemplates: (level?: LibraryItemLevel) => TemplateFolder[];
  syncFromBackend: (backendTemplates: any[]) => void;
}

export interface TemplateLibraryStore extends TemplateLibraryState, TemplateLibraryActions {}

import { EXERCISES_DATABASE } from '../data/exercisesData';

const findEx = (id: string) => EXERCISES_DATABASE.find(e => e.ID_Ejercicio === id) || EXERCISES_DATABASE[0];

const initialFolders: TemplateFolder[] = [
  // ── ENTRENAMIENTO ──
  {
    id: 'folder-hipertrofia',
    name: 'Hipertrofia & Ganancia Muscular',
    category: 'TRAINING',
    icon: '🔥',
    templates: [
      {
        id: 'template-torso-pierna-4d',
        type: 'PROGRAM',
        category: 'TRAINING',
        icon: '🔥',
        name: 'Torso / Pierna Hipertrofia (4 Días)',
        taxonomyId: 'hypertrophy_torso_pierna_4d',
        tags: ['hipertrofia', 'intermedio', 'frecuencia-2', '4-dias'],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 0,
        internalNotes: 'Arquitectura clásica Lyle McDonald GBR / Eric Helms con balance agonista-antagonista.',
        assignmentHistory: [],
        phases: [
          {
            id: 'phase-tp-1',
            name: 'Mesociclo Base (4 Semanas)',
            releaseDate: null,
            notes: 'Frecuencia 2 por grupo muscular con sobrecarga progresiva y doble progresión autorregulada (RIR 1-2).',
            days: [
              {
                id: 'day-tp-1',
                name: 'Día 1: Torso A (Enfoque Horizontal)',
                primaryModality: 'HIPERTROFIA',
                isCollapsed: false,
                items: [
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_002'), sets: '2', reps: '15-20', weight: 'Banda', rpe: 'Activación', videoUrl: '', progression: 'Separación con banda' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_004'), sets: '2', reps: '10-12', weight: 'Corporal', rpe: 'Activación', videoUrl: '', progression: 'Flexión escapular' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CHEST_001'), sets: '4', reps: '6-8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: 'Tempo 3-0-1-0' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('BACK_004'), sets: '4', reps: '8-10', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: 'Pecho apoyado' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SHO_003'), sets: '3', reps: '12-15', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: 'Elevaciones laterales' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARM_001'), sets: '3', reps: '12-15', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: 'Curl bíceps' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('ARM_002'), sets: '3', reps: '12-15', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: 'Tríceps polea' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_006'), sets: '2', reps: '10/lado', weight: 'Corporal', rpe: 'Control', videoUrl: '', progression: 'Deadbug antiextensión' }
                ]
              },
              {
                id: 'day-tp-2',
                name: 'Día 2: Pierna A (Dominante de Rodilla)',
                primaryModality: 'HIPERTROFIA',
                isCollapsed: false,
                items: [
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_002'), sets: '2', reps: '12/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'Tobillo en pared' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('RAMP_001'), sets: '2', reps: '15', weight: 'Miniband', rpe: 'Activación', videoUrl: '', progression: 'Puente glúteo' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_001'), sets: '4', reps: '6-8', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: 'Sentadilla trasera' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('DEAD_003'), sets: '3', reps: '8-10', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: 'Peso muerto rumano' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_004'), sets: '3', reps: '10-12', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: 'Prensa 45°' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CALF_001'), sets: '4', reps: '12-15', weight: 'Auto', rpe: '9 (RIR 1)', videoUrl: '', progression: 'Gemelos de pie' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('PREHAB_002'), sets: '3', reps: '30s/lado', weight: 'Corporal', rpe: 'Isometría', videoUrl: '', progression: 'Plancha lateral McGill' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'folder-fuerza',
    name: 'Fuerza & Rendimiento',
    category: 'TRAINING',
    icon: '⚡',
    templates: [
      {
        id: 'template-fullbody-3d',
        type: 'PROGRAM',
        category: 'TRAINING',
        icon: '⚡',
        name: 'Full Body A-B-A (3 Días)',
        taxonomyId: 'full_body_3d_gzclp',
        tags: ['fuerza', 'hipertrofia', 'principiante-intermedio', '3-dias'],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 0,
        internalNotes: 'Estructura GZCLP / Eric Helms escalonada en niveles T1, T2 y T3.',
        assignmentHistory: [],
        phases: [
          {
            id: 'phase-fb-1',
            name: 'Fase de Fuerza & Base (4 Semanas)',
            releaseDate: null,
            notes: 'Frecuencia 3x de estímulo corporal completo.',
            days: [
              {
                id: 'day-fb-1',
                name: 'Día 1: Full Body A (Sentadilla + Banca)',
                primaryModality: 'FUERZA',
                isCollapsed: false,
                items: [
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('MOV_001'), sets: '2', reps: '6/lado', weight: 'Corporal', rpe: 'Movilidad', videoUrl: '', progression: 'World Greatest Stretch' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_001'), sets: '3', reps: '5', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Sentadilla con barra' },
                  { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CHEST_001'), sets: '3', reps: '5', weight: 'Auto', rpe: '8 (RIR 2)', videoUrl: '', progression: '[T1] Press de banca plano' }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'folder-gluteos',
    name: 'Especialización Glúteos & Piernas',
    category: 'TRAINING',
    icon: '🍑',
    templates: []
  },
  {
    id: 'folder-calistenia',
    name: 'Calistenia & Peso Corporal',
    category: 'TRAINING',
    icon: '🤸',
    templates: []
  },
  {
    id: 'folder-principiantes',
    name: 'Principiantes & Adaptación Anatómica',
    category: 'TRAINING',
    icon: '🌱',
    templates: []
  },
  {
    id: 'folder-compartidos',
    name: 'Recursos Importados de Colegas',
    category: 'TRAINING',
    icon: '📥',
    templates: []
  },

  // ── NUTRICIÓN & DIETAS ──
  {
    id: 'folder-nutri-deficit',
    name: 'Protocolos de Pérdida de Grasa (Déficit)',
    category: 'NUTRITION',
    icon: '🔥',
    templates: [
      {
        id: 'template-nutri-deficit-2k',
        type: 'MEAL_PLAN',
        category: 'NUTRITION',
        icon: '🔥',
        name: 'Déficit Controlado 2000 kcal (4 Comidas)',
        taxonomyId: 'nutri_deficit_2000',
        tags: ['déficit', 'pérdida-grasa', 'alta-proteína', '4-comidas'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 14,
        internalNotes: 'Pauta con 2.0g/kg de proteína (160g), 200g Carbos y 60g Grasas.',
        nutritionData: {
          kcal: 2000,
          protein: 160,
          carbs: 200,
          fats: 60,
          meals: [
            { name: 'Desayuno Proteico', time: '08:30', items: '3 Huevos revueltos + 60g Avena con arándanos y canela + Café solo', kcal: 450, protein: 32, carbs: 45, fats: 15 },
            { name: 'Almuerzo Equilibrado', time: '13:30', items: '180g Pechuga de pollo grillada + 150g Arroz basmati + Ensalada verde con 1 cda aceite oliva', kcal: 620, protein: 50, carbs: 65, fats: 16 },
            { name: 'Merienda / Pre-Entreno', time: '17:30', items: '200g Yogur griego 0% + 1 scoop Proteína Whey + 1 Plátano + 15g Almendras', kcal: 380, protein: 38, carbs: 40, fats: 8 },
            { name: 'Cena Ligera & Saciedad', time: '21:30', items: '200g Salmón a la plancha + 250g Vegetales asados (calabaza, espárragos, brócoli)', kcal: 550, protein: 40, carbs: 50, fats: 21 }
          ]
        }
      },
      {
        id: 'template-nutri-deficit-1800',
        type: 'MEAL_PLAN',
        category: 'NUTRITION',
        icon: '⚡',
        name: 'Déficit Agresivo & Ciclado de Carbos (1800 kcal)',
        taxonomyId: 'nutri_deficit_1800',
        tags: ['déficit-agresivo', 'definición', 'ciclado-carbos'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 6,
        internalNotes: 'Pauta para semanas de definición con días de carbos altos y bajos.',
        nutritionData: {
          kcal: 1800,
          protein: 165,
          carbs: 160,
          fats: 50,
          meals: [
            { name: 'Desayuno', items: 'Tortilla de 4 claras + 1 huevo + 50g Avena + Café', kcal: 380, protein: 32, carbs: 35, fats: 10 },
            { name: 'Almuerzo', items: '200g Lomo magro + 120g Quinoa cocida + Mix de hojas verdes', kcal: 540, protein: 52, carbs: 45, fats: 14 },
            { name: 'Merienda', items: '1 scoop Whey Protein + 1 Manzana + 10g Nueces', kcal: 260, protein: 28, carbs: 22, fats: 6 },
            { name: 'Cena', items: '200g Pescado blanco + Wok de vegetales salteados con gotas de sésamo', kcal: 420, protein: 45, carbs: 35, fats: 10 }
          ]
        }
      }
    ]
  },
  {
    id: 'folder-nutri-surplus',
    name: 'Protocolos de Ganancia Muscular (Superávit)',
    category: 'NUTRITION',
    icon: '💪',
    templates: [
      {
        id: 'template-nutri-surplus-2800',
        type: 'MEAL_PLAN',
        category: 'NUTRITION',
        icon: '💪',
        name: 'Superávit Limpio 2800 kcal (5 Comidas)',
        taxonomyId: 'nutri_surplus_2800',
        tags: ['superávit', 'volumen-limpio', 'hipertrofia', '5-comidas'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 11,
        internalNotes: '180g Proteína, 360g Carbos, 75g Grasas. Alta biodisponibilidad y fácil digestión.',
        nutritionData: {
          kcal: 2800,
          protein: 180,
          carbs: 360,
          fats: 75,
          meals: [
            { name: 'Desayuno', items: '4 Huevos enteros + 80g Avena + 1 Banana + Miel', kcal: 650, protein: 36, carbs: 80, fats: 20 },
            { name: 'Media Mañana', items: '2 Tostadas integrales con crema de cacahuete + 1 Scoop Whey', kcal: 420, protein: 30, carbs: 40, fats: 16 },
            { name: 'Almuerzo', items: '200g Carne magra + 200g Arroz jazmín + Verduras al vapor', kcal: 750, protein: 55, carbs: 90, fats: 18 },
            { name: 'Merienda Post-Entreno', items: 'Batido con 1 Scoop Whey + 50g Harina de arroz + Frutos rojos', kcal: 430, protein: 32, carbs: 65, fats: 4 },
            { name: 'Cena', items: '200g Salmón / Pechuga + 250g Batata asada + Ensalada completa', kcal: 550, protein: 42, carbs: 60, fats: 17 }
          ]
        }
      }
    ]
  },
  {
    id: 'folder-nutri-recomp',
    name: 'Recomposición Corporal & Mantenimiento',
    category: 'NUTRITION',
    icon: '⚖️',
    templates: [
      {
        id: 'template-nutri-recomp-2300',
        type: 'MEAL_PLAN',
        category: 'NUTRITION',
        icon: '⚖️',
        name: 'Normocalórico Isoproteico 2300 kcal (4 Comidas)',
        taxonomyId: 'nutri_recomp_2300',
        tags: ['recomposición', 'mantenimiento', 'rendimiento'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 9,
        internalNotes: '170g Proteína, 240g Carbos, 70g Grasas para recomposición corporal.',
        nutritionData: {
          kcal: 2300,
          protein: 170,
          carbs: 240,
          fats: 70,
          meals: [
            { name: 'Desayuno', items: 'Pancakes de avena con claras y frutos rojos + Café', kcal: 500, protein: 38, carbs: 55, fats: 12 },
            { name: 'Almuerzo', items: '180g Pechuga de pollo + 150g Pasta integral + Ensalada de rúcula y tomates', kcal: 650, protein: 48, carbs: 75, fats: 16 },
            { name: 'Merienda', items: 'Yogur proteico + 20g Nueces + 1 Manzana verde', kcal: 350, protein: 25, carbs: 30, fats: 15 },
            { name: 'Cena', items: 'Tortilla de 3 huevos con espinacas + 150g Papas al horno', kcal: 500, protein: 32, carbs: 45, fats: 20 }
          ]
        }
      }
    ]
  },
  {
    id: 'folder-nutri-vegano',
    name: 'Planes Vegetarianos & Veganos',
    category: 'NUTRITION',
    icon: '🌱',
    templates: [
      {
        id: 'template-nutri-vegano-2100',
        type: 'MEAL_PLAN',
        category: 'NUTRITION',
        icon: '🌱',
        name: 'Plant-Based High Protein 2100 kcal (4 Comidas)',
        taxonomyId: 'nutri_vegan_2100',
        tags: ['vegano', 'plant-based', 'proteína-vegetal'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 5,
        internalNotes: '140g Proteína vegetal completa combinando tofu, seitán, legumbres y proteína de arroz.',
        nutritionData: {
          kcal: 2100,
          protein: 140,
          carbs: 230,
          fats: 65,
          meals: [
            { name: 'Desayuno', items: 'Tofu revuelto con cúrcuma + Tostada de centeno + Batido vegetal', kcal: 480, protein: 35, carbs: 45, fats: 14 },
            { name: 'Almuerzo', items: 'Curry de garbanzos (200g) con espinacas y leche de coco + 100g Arroz integral', kcal: 620, protein: 30, carbs: 80, fats: 18 },
            { name: 'Merienda', items: 'Edamames al vapor (150g) + 20g Almendras tostadas', kcal: 320, protein: 22, carbs: 18, fats: 16 },
            { name: 'Cena', items: '200g Seitán salteado con pimientos y champiñones + 150g Boniato', kcal: 520, protein: 50, carbs: 55, fats: 11 }
          ]
        }
      }
    ]
  },
  {
    id: 'folder-nutri-intolerancias',
    name: 'Planes Celíacos & Sin Lactosa',
    category: 'NUTRITION',
    icon: '🌾',
    templates: []
  },

  // ── RECETARIOS SALUDABLES ──
  {
    id: 'folder-rec-desayunos',
    name: 'Desayunos & Meriendas Proteicas',
    category: 'RECIPES',
    icon: '🍳',
    templates: [
      {
        id: 'template-rec-pancakes-avena',
        type: 'RECIPE',
        category: 'RECIPES',
        icon: '🥞',
        name: 'Pancakes de Avena & Proteína SARA',
        taxonomyId: 'rec_pancakes_avena',
        tags: ['desayuno', 'proteína', 'fácil', '10-min'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 22,
        internalNotes: '35g Proteína • 45g Carbos • 8g Grasas (390 kcal)',
        recipeData: {
          prepTimeMin: 10,
          servings: 1,
          kcal: 390,
          protein: 35,
          carbs: 45,
          fats: 8,
          ingredients: [
            '60g Harina de avena integral',
            '1 Scoop (30g) Proteína Whey de vainilla',
            '120ml Claras de huevo pasteurizadas',
            '1/2 Cucharadita de polvo de hornear',
            'Canela al gusto y gotas de stevia',
            '50g Frutos rojos para el topping'
          ],
          instructions: [
            'Mezclar todos los ingredientes en una licuadora o bowl hasta obtener una masa homogénea.',
            'Calentar una sartén antiadherente a fuego medio con unas gotas de aceite de coco.',
            'Verter la masa formando círculos y cocinar 2 minutos por lado hasta que doren.',
            'Servir con los frutos rojos frescos por encima.'
          ]
        }
      },
      {
        id: 'template-rec-overnight-oats',
        type: 'RECIPE',
        category: 'RECIPES',
        icon: '🥣',
        name: 'Overnight Oats de Frutos Rojos y Chía',
        taxonomyId: 'rec_overnight_oats',
        tags: ['desayuno', 'meal-prep', 'sin-cocción'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 16,
        internalNotes: '28g Proteína • 42g Carbos • 7g Grasas (340 kcal)',
        recipeData: {
          prepTimeMin: 5,
          servings: 1,
          kcal: 340,
          protein: 28,
          carbs: 42,
          fats: 7,
          ingredients: [
            '50g Copos de avena',
            '150g Yogur griego natural 0%',
            '1 Cucharada (10g) de semillas de chía',
            '100ml Bebida vegetal de almendras sin azúcar',
            '1/2 Taza de arándanos y frambuesas'
          ],
          instructions: [
            'Colocar la avena, chía y yogur en un frasco de vidrio.',
            'Añadir la bebida vegetal y mezclar bien.',
            'Tapar y dejar reposar en el refrigerador durante toda la noche.',
            'Por la mañana añadir los frutos rojos y disfrutar frío.'
          ]
        }
      }
    ]
  },
  {
    id: 'folder-rec-almuerzos',
    name: 'Almuerzos & Cenas Rápidas (<15 min)',
    category: 'RECIPES',
    icon: '🥗',
    templates: [
      {
        id: 'template-rec-bowl-mediterraneo',
        type: 'RECIPE',
        category: 'RECIPES',
        icon: '🥗',
        name: 'Bowl Mediterráneo de Pollo, Quinoa y Palta',
        taxonomyId: 'rec_bowl_mediterraneo',
        tags: ['almuerzo', 'rápido', 'balanceado'],
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 18,
        internalNotes: '44g Proteína • 50g Carbos • 16g Grasas (520 kcal)',
        recipeData: {
          prepTimeMin: 15,
          servings: 1,
          kcal: 520,
          protein: 44,
          carbs: 50,
          fats: 16,
          ingredients: [
            '180g Pechuga de pollo en cubos marinada con orégano y limón',
            '120g Quinoa cocida',
            '50g Palta en láminas',
            'Tomates cherry, pepino y rúcula fresca',
            '1 Cucharadita de aceite de oliva virgen extra'
          ],
          instructions: [
            'Dorar el pollo en una sartén caliente durante 6-8 minutos.',
            'En un bowl amplio disponer la base de quinoa y vegetales frescos.',
            'Incorporar el pollo cocido y las láminas de palta.',
            'Condimentar con el aceite de oliva y gotas de limón.'
          ]
        }
      }
    ]
  },
  {
    id: 'folder-rec-snacks',
    name: 'Snacks & Postres Saludables',
    category: 'RECIPES',
    icon: '🍪',
    templates: []
  },
  {
    id: 'folder-rec-shakes',
    name: 'Batidos & Pre/Post Entreno',
    category: 'RECIPES',
    icon: '🥤',
    templates: []
  },

  // ── DOCUMENTOS & GUÍAS ──
  {
    id: 'folder-doc-habitos',
    name: 'Guías de Hábitos & Sueño',
    category: 'DOCUMENTS',
    icon: '📚',
    templates: [
      {
        id: 'doc-guia-sueno-recuperacion',
        type: 'DOCUMENT',
        category: 'DOCUMENTS',
        icon: '📄',
        name: 'Guía de Higiene del Sueño & Cortisol (PDF)',
        taxonomyId: 'doc_sueno_01',
        tags: ['recuperación', 'sueño', 'hábitos', 'pdf'],
        documentData: {
          fileType: 'PDF',
          url: 'https://bienestar.app/docs/guia_sueno_recuperacion.pdf',
          sizeMb: 2.4
        },
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 31,
        internalNotes: 'Protocolo de reducción de luz azul, ritmos circadianos y temperatura para optimizar la recuperación neuromuscular.'
      }
    ]
  },
  {
    id: 'folder-doc-suplementos',
    name: 'Guías de Suplementación Científica',
    category: 'DOCUMENTS',
    icon: '💊',
    templates: [
      {
        id: 'doc-manual-suplementos',
        type: 'DOCUMENT',
        category: 'DOCUMENTS',
        icon: '📄',
        name: 'Manual de Suplementos Basados en Evidencia (PDF)',
        taxonomyId: 'doc_supl_01',
        tags: ['suplementación', 'creatina', 'evidencia', 'pdf'],
        documentData: {
          fileType: 'PDF',
          url: 'https://bienestar.app/docs/manual_suplementacion_cientifica.pdf',
          sizeMb: 3.1
        },
        phases: [],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignmentCount: 27,
        internalNotes: 'Dosis, timing y contraindicaciones de Creatina Creapure, Cafeína anhidra, Beta-Alanina y Omega 3.'
      }
    ]
  },
  {
    id: 'folder-doc-movilidad',
    name: 'Manuales de Movilidad & Estiramientos',
    category: 'DOCUMENTS',
    icon: '🧘',
    templates: []
  },
  {
    id: 'folder-doc-anamnesis',
    name: 'Cuestionarios de Inicio & Anamnesis',
    category: 'DOCUMENTS',
    icon: '📋',
    templates: []
  }
];

export const useTemplateLibraryStore = create<TemplateLibraryStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        folders: initialFolders,
        activeCategory: 'TRAINING',
        searchQuery: '',
        selectedTemplateId: null,
        isCreating: false,
        isSynced: false,
        lastSyncedAt: null,

        setActiveCategory: (category) =>
          set((state) => {
            state.activeCategory = category;
          }, false, 'setActiveCategory'),

        createFolder: (name, category = 'TRAINING', icon = '📁') =>
          set((state) => {
            state.folders.push({
              id: uuidv4(),
              name,
              category,
              icon,
              templates: []
            });
          }, false, 'createFolder'),



        renameFolder: (folderId, name) =>
          set((state) => {
            const folder = state.folders.find((f) => f.id === folderId);
            if (folder) {
              folder.name = name;
            }
          }, false, 'renameFolder'),

        deleteFolder: (folderId) =>
          set((state) => {
            const index = state.folders.findIndex((f) => f.id === folderId);
            if (index !== -1 && state.folders[index].templates.length === 0) {
              state.folders.splice(index, 1);
            }
          }, false, 'deleteFolder'),

        createTemplate: (folderId, template) =>
          set((state) => {
            const folder = state.folders.find((f) => f.id === folderId);
            if (folder) {
              folder.templates.unshift({
                ...template,
                id: uuidv4(),
                version: 1,
                assignmentCount: 0,
                internalNotes: template.internalNotes || '',
                assignmentHistory: template.assignmentHistory || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          }, false, 'createTemplate'),

        createDocumentItem: (folderId, doc) =>
          set((state) => {
            let folder = state.folders.find((f) => f.id === folderId);
            if (!folder) {
              folder = state.folders.find((f) => f.category === 'DOCUMENTS') || state.folders[0];
            }

            if (folder) {
              const newDocItem: LibraryItem = {
                id: uuidv4(),
                type: 'DOCUMENT',
                category: 'DOCUMENTS',
                icon: doc.fileType === 'LINK' ? '🔗' : '📄',
                name: doc.name,
                taxonomyId: `doc_${uuidv4().substring(0, 8)}`,
                tags: ['documento', doc.fileType.toLowerCase()],
                phases: [],
                documentData: {
                  fileType: doc.fileType,
                  url: doc.url || `https://bienestar.app/docs/${doc.name.toLowerCase().replace(/\s+/g, '_')}.${doc.fileType.toLowerCase()}`,
                  sizeMb: 2.1
                },
                internalNotes: doc.notes || 'Documento adjunto para consulta y descarga del atleta.',
                version: 1,
                assignmentCount: 0,
                assignmentHistory: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              folder.templates.unshift(newDocItem);
            }
          }, false, 'createDocumentItem'),

        importTemplateByCode: (code) =>
          set((state) => {
            let sharedFolder = state.folders.find((f) => f.id === 'folder-compartidos');
            if (!sharedFolder) {
              sharedFolder = {
                id: 'folder-compartidos',
                name: 'Planes Importados de Colegas',
                category: 'TRAINING',
                icon: '📥',
                templates: []
              };
              state.folders.push(sharedFolder);
            }

            const importedItem: LibraryItem = {
              id: uuidv4(),
              type: 'PROGRAM',
              category: 'TRAINING',
              icon: '⚡',
              name: `Plan Importado (#${code.toUpperCase()})`,
              taxonomyId: `import_${code}`,
              tags: ['importado', 'p2p-share'],
              version: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              assignmentCount: 0,
              internalNotes: `Plan transferido mediante código de seguridad: ${code.toUpperCase()}`,
              assignmentHistory: [],
              phases: [
                {
                  id: uuidv4(),
                  name: 'Mesociclo Importado (4 Semanas)',
                  releaseDate: null,
                  notes: 'Rutina compartida por colega.',
                  days: [
                    {
                      id: uuidv4(),
                      name: 'Día 1: Fuerza y Control',
                      primaryModality: 'FUERZA',
                      isCollapsed: false,
                      items: [
                        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('SQUAT_001'), sets: '4', reps: '6-8', weight: 'Auto', rpe: '8', videoUrl: '', progression: 'Sentadilla' },
                        { id: uuidv4(), type: 'EXERCISE', exercise: findEx('CHEST_001'), sets: '4', reps: '8-10', weight: 'Auto', rpe: '8', videoUrl: '', progression: 'Press plano' }
                      ]
                    }
                  ]
                }
              ]
            };

            sharedFolder.templates.unshift(importedItem);
          }, false, 'importTemplateByCode'),

        updateTemplate: (folderId, templateId, updates) =>
          set((state) => {
            const folder = state.folders.find((f) => f.id === folderId);
            if (folder) {
              const template = folder.templates.find((t) => t.id === templateId);
              if (template) {
                Object.assign(template, updates);
                template.updatedAt = new Date().toISOString();
                template.version += 1;
              }
            }
          }, false, 'updateTemplate'),

        deleteTemplate: (folderId, templateId) =>
          set((state) => {
            const folder = state.folders.find((f) => f.id === folderId);
            if (folder) {
              const index = folder.templates.findIndex((t) => t.id === templateId);
              if (index !== -1) {
                folder.templates.splice(index, 1);
              }
            }
          }, false, 'deleteTemplate'),

        duplicateTemplate: (folderId, templateId) =>
          set((state) => {
            const folder = state.folders.find((f) => f.id === folderId);
            if (folder) {
              const original = folder.templates.find((t) => t.id === templateId);
              if (original) {
                // Deep clone using structuredClone
                const clone = structuredClone(original);
                clone.id = uuidv4();
                clone.name = `${original.name} (copia)`;
                clone.version = 1;
                clone.assignmentCount = 0;
                clone.assignmentHistory = [];
                clone.createdAt = new Date().toISOString();
                clone.updatedAt = new Date().toISOString();
                
                // Refresh phase & day ids
                clone.phases.forEach((phase) => {
                  phase.id = uuidv4();
                  phase.days.forEach((day) => {
                    day.id = uuidv4();
                    day.items.forEach((item) => {
                      item.id = uuidv4();
                      if (item.type === 'BLOCK') {
                        item.items.forEach((ex) => {
                          ex.id = uuidv4();
                        });
                      }
                    });
                  });
                });

                folder.templates.push(clone);
              }
            }
          }, false, 'duplicateTemplate'),

        moveTemplate: (fromFolderId, toFolderId, templateId) =>
          set((state) => {
            const fromFolder = state.folders.find((f) => f.id === fromFolderId);
            const toFolder = state.folders.find((f) => f.id === toFolderId);
            if (fromFolder && toFolder) {
              const index = fromFolder.templates.findIndex((t) => t.id === templateId);
              if (index !== -1) {
                const [template] = fromFolder.templates.splice(index, 1);
                toFolder.templates.push(template);
              }
            }
          }, false, 'moveTemplate'),

        forkTemplateToClient: (folderId, templateId, clientId = 'unknown', phaseDates = {}) => {
          let daysToFork: WorkoutDay[] = [];
          set((state) => {
            const folder = state.folders.find((f) => f.id === folderId);
            if (folder) {
              const template = folder.templates.find((t) => t.id === templateId);
              if (template) {
                template.assignmentCount += 1;
                if (!template.assignmentHistory) template.assignmentHistory = [];
                template.assignmentHistory.push({ clientId, assignedAt: new Date().toISOString() });
                
                // Deep clone template phases to flat days, injecting phase info
                const flatDays: WorkoutDay[] = template.phases.flatMap((phase) => {
                  return phase.days.map(day => ({
                    ...day,
                    phaseId: phase.id,
                    phaseName: phase.name,
                    releaseDate: phaseDates[phase.id] !== undefined ? phaseDates[phase.id] : phase.releaseDate
                  }));
                });
                const clonedDays = JSON.parse(JSON.stringify(flatDays));

                // Regenerate all UUIDs in the fork to avoid cross-referencing
                clonedDays.forEach((day: any) => {
                  day.id = uuidv4();
                  day.items.forEach((item: any) => {
                    item.id = uuidv4();
                    if (item.type === 'BLOCK') {
                      item.items.forEach((ex: any) => {
                        ex.id = uuidv4();
                      });
                    }
                  });
                });
                daysToFork = clonedDays;
              }
            }
          }, false, 'forkTemplateToClient');
          return daysToFork;
        },

        setSearchQuery: (query) =>
          set((state) => {
            state.searchQuery = query;
          }, false, 'setSearchQuery'),

        setSelectedTemplateId: (id) =>
          set((state) => {
            state.selectedTemplateId = id;
          }, false, 'setSelectedTemplateId'),

        getFilteredTemplates: (level) => {
          const { folders, searchQuery } = get();
          
          let filteredFolders = folders;
          
          // First filter by level if provided
          if (level) {
            filteredFolders = filteredFolders.map(folder => ({
              ...folder,
              templates: folder.templates.filter(t => t.type === level)
            })).filter(folder => folder.templates.length > 0);
          }
          
          if (!searchQuery.trim()) return filteredFolders;

          const query = searchQuery.toLowerCase();
          return filteredFolders.map((folder) => {
            const filteredTemplates = folder.templates.filter(
              (template) =>
                template.name.toLowerCase().includes(query) ||
                template.tags.some((tag) => tag.toLowerCase().includes(query))
            );
            return {
              ...folder,
              templates: filteredTemplates
            };
          }).filter((folder) => folder.templates.length > 0);
        },

        syncFromBackend: (backendTemplates) =>
          set((state) => {
            if (!Array.isArray(backendTemplates) || backendTemplates.length === 0) return;
            
            // Find or create 'Plantillas del Servidor' folder
            let serverFolder = state.folders.find((f) => f.id === 'folder-backend-synced');
            if (!serverFolder) {
              serverFolder = {
                id: 'folder-backend-synced',
                name: '☁️ Plantillas en la Nube (Backend)',
                templates: []
              };
              state.folders.unshift(serverFolder);
            }

            // Map backend templates to LibraryItem
            backendTemplates.forEach((bt: any) => {
              const existingIdx = serverFolder!.templates.findIndex((t) => t.id === bt.id);
              
              const mappedItem: LibraryItem = {
                id: bt.id,
                type: 'PROGRAM',
                name: bt.title,
                taxonomyId: bt.id,
                tags: ['backend-synced', bt.is_master ? 'master' : 'custom'],
                version: 1,
                createdAt: bt.created_at || new Date().toISOString(),
                updatedAt: bt.updated_at || new Date().toISOString(),
                assignmentCount: 0,
                internalNotes: bt.description || 'Plantilla sincronizada desde la base de datos central.',
                assignmentHistory: [],
                phases: [
                  {
                    id: `phase-${bt.id}`,
                    name: 'Fase Principal',
                    releaseDate: null,
                    notes: bt.description || '',
                    days: (bt.days || []).map((day: any) => ({
                      id: day.id || uuidv4(),
                      name: day.name || 'Día de Entrenamiento',
                      primaryModality: 'HIPERTROFIA',
                      isCollapsed: false,
                      items: (day.supersets || []).flatMap((ss: any) => 
                        (ss.exercises || []).map((ex: any) => ({
                          id: ex.id || uuidv4(),
                          type: 'EXERCISE',
                          exercise: findEx(ex.exercise_id || '') || {
                            ID_Ejercicio: ex.exercise_id || 'CUSTOM',
                            Nombre: ex.custom_exercise_name || 'Ejercicio Personalizado',
                            Patron_Movimiento: 'Compuesto',
                            Nivel_Habilidad: 1
                          },
                          sets: String(ex.sets || '3'),
                          reps: String(ex.reps || '10'),
                          weight: String(ex.weight || 'Auto'),
                          rpe: String(ex.rpe || '8'),
                          videoUrl: '',
                          progression: ex.notes || ''
                        }))
                      )
                    }))
                  }
                ]
              };

              if (existingIdx >= 0) {
                serverFolder!.templates[existingIdx] = mappedItem;
              } else {
                serverFolder!.templates.push(mappedItem);
              }
            });

            state.isSynced = true;
            state.lastSyncedAt = new Date().toISOString();
          }, false, 'syncFromBackend')
      })),
      {
        name: 'template-library-storage-v5'
      }
    )
  )
);

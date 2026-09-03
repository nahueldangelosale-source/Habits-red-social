
import type { FoodItem } from "../../../stores/builderStore";

export const LOCAL_FOODS: FoodItem[] = [
    // PROTEIN
    { id: 'f1', name: 'Milanesa de Pollo (Horno)', portion: 150, unit: 'g', calories: 280, protein: 35, carbs: 12, fats: 8, category: 'protein', isLocal: true, costLevel: 1, tags: ['almuerzo', 'cena', 'economico'] },
    { id: 'f2', name: 'Huevos de Campo (Grandes)', portion: 2, unit: 'u', calories: 140, protein: 12, carbs: 1, fats: 10, category: 'protein', isLocal: true, costLevel: 1, tags: ['desayuno', 'cena'] },
    { id: 'f3', name: 'Atún al Natural (Lata)', portion: 120, unit: 'g', calories: 130, protein: 28, carbs: 0, fats: 1, category: 'protein', isLocal: false, costLevel: 2, tags: ['almuerzo', 'rapido'] },

    // CARBS
    { id: 'f4', name: 'Puré de Calabaza', portion: 200, unit: 'g', calories: 90, protein: 2, carbs: 20, fats: 0, category: 'veggie', isLocal: true, costLevel: 1, tags: ['guarnicion'] },
    { id: 'f5', name: 'Arroz Gallo Oro', portion: 150, unit: 'g (cocido)', calories: 195, protein: 4, carbs: 42, fats: 0.5, category: 'carb', isLocal: true, costLevel: 1, tags: ['almuerzo', 'guarnicion'] },
    { id: 'f6', name: 'Pan Integral (Fargo)', portion: 2, unit: 'rebanadas', calories: 160, protein: 6, carbs: 30, fats: 2, category: 'carb', isLocal: true, costLevel: 1, tags: ['desayuno', 'merienda'] },

    // FATS
    { id: 'f7', name: 'Palta Hass', portion: 0.5, unit: 'u', calories: 120, protein: 1, carbs: 6, fats: 11, category: 'fat', isLocal: true, costLevel: 3, tags: ['desayuno', 'ensalada'] },
    { id: 'f8', name: 'Queso Por Salut Light', portion: 50, unit: 'g', calories: 110, protein: 14, carbs: 0, fats: 6, category: 'dairy', isLocal: true, costLevel: 2, tags: ['cena', 'tostada'] },

    // EXTRAS
    { id: 'f9', name: 'Mate Cocido (Sin Azúcar)', portion: 1, unit: 'taza', calories: 5, protein: 0, carbs: 1, fats: 0, category: 'veggie', isLocal: true, costLevel: 1, tags: ['desayuno', 'merienda'] },
    { id: 'f10', name: 'Maní Tostado (Sin Sal)', portion: 30, unit: 'g', calories: 170, protein: 7, carbs: 5, fats: 14, category: 'fat', isLocal: true, costLevel: 1, tags: ['snack', 'alergeno'] },
];

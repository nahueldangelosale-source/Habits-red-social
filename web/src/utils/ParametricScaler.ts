import type { RecipeSeed } from '../data/recipeSeedData';
import { MASTER_RECIPES } from '../data/recipeSeedData';
import type { MealOption, MealItem, MacroNutrients } from '../schemas/nutritionPlanSchema';
import { v4 as uuidv4 } from 'uuid';

export interface ParametricTarget {
    calories: number;
    // We could add macro % targets here (e.g. { protein: 40, carbs: 30, fats: 30 })
    // For now, we will scale to hit the caloric target.
}

export interface HealthGuardFilters {
    isVegan: boolean;
    isCeliac: boolean;
}

// Simulated SARA Database lookup to get base macros per 100g
const getSaraMacros = (saraId: string): MacroNutrients => {
    // Mock values based on SARA IDs
    switch (saraId) {
        case '272.0': return { protein_g: 22, carbs_g: 0, fat_g: 1.2, calories: 105 }; // Pechuga
        case '123.0': return { protein_g: 7, carbs_g: 80, fat_g: 0.5, calories: 360 }; // Arroz
        case '456.0': return { protein_g: 2.8, carbs_g: 4, fat_g: 0.3, calories: 34 }; // Brocoli
        case '789.0': return { protein_g: 13, carbs_g: 66, fat_g: 7, calories: 389 }; // Avena
        case '801.0': return { protein_g: 80, carbs_g: 5, fat_g: 5, calories: 385 }; // Whey
        case '802.0': return { protein_g: 0.7, carbs_g: 14, fat_g: 0.3, calories: 57 }; // Arandanos
        case '901.0': return { protein_g: 15, carbs_g: 2, fat_g: 8, calories: 144 }; // Tofu
        case '902.0': return { protein_g: 14, carbs_g: 64, fat_g: 6, calories: 368 }; // Quinoa
        default: return { protein_g: 10, carbs_g: 10, fat_g: 5, calories: 125 };
    }
};

export class ParametricScaler {
    
    // HealthGuard: Hard Exclusions
    static filterRecipes(recipes: RecipeSeed[], filters: HealthGuardFilters): RecipeSeed[] {
        return recipes.filter(r => {
            if (filters.isVegan && !r.tags.includes('vegano')) return false;
            if (filters.isCeliac && !r.tags.includes('sin_gluten')) return false;
            return true;
        });
    }

    // Mathematical Engine: Scale a recipe to a target
    static scaleRecipe(recipe: RecipeSeed, target: ParametricTarget): MealOption | null {
        let K = 1.0;
        const K_STEP = 0.05;
        const MAX_ITERATIONS = 1000;
        
        let iteration = 0;
        let bestK = 1.0;
        let bestDiff = Infinity;

        // Bucle Iterativo Escalar (K)
        while (iteration < MAX_ITERATIONS) {
            let iterationKcal = 0;
            
            // Calculate total calories for current K
            for (const ing of recipe.ingredients) {
                const scaledRawAmount = ing.baseRawAmount * K;
                // Macronutriente_Real = (Masa_Bruta * FC) * YF * RF * (MacroSARA / 100)
                // For calories, RF usually doesn't apply (it applies to micros), but we follow the physical mass path
                const effectiveMass = (scaledRawAmount * ing.correctionFactor) * ing.yieldFactor;
                const saraMacros = getSaraMacros(ing.saraId);
                const calories = (effectiveMass / 100) * saraMacros.calories;
                iterationKcal += calories;
            }

            const diff = Math.abs(iterationKcal - target.calories);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestK = K;
            }

            // Margin of error < 5%
            if (diff / target.calories <= 0.05) {
                break;
            }

            if (iterationKcal < target.calories) {
                K += K_STEP;
            } else {
                K -= K_STEP;
            }
            
            iteration++;
        }

        // Apply best K to generate final MealOption
        const finalItems: MealItem[] = recipe.ingredients.map(ing => {
            const scaledRawAmount = Math.round(ing.baseRawAmount * bestK); // Peso bruto (para el dietista/lista de compras)
            const effectiveMass = (scaledRawAmount * ing.correctionFactor) * ing.yieldFactor;
            
            const saraMacros = getSaraMacros(ing.saraId);
            const macros: MacroNutrients = {
                protein_g: Math.round((effectiveMass / 100) * saraMacros.protein_g),
                carbs_g: Math.round((effectiveMass / 100) * saraMacros.carbs_g),
                fat_g: Math.round((effectiveMass / 100) * saraMacros.fat_g),
                calories: Math.round((effectiveMass / 100) * saraMacros.calories)
            };

            return {
                id: uuidv4(),
                sara_item_id: ing.saraId,
                name: ing.name,
                portion_amount: scaledRawAmount, // Mostrar peso en crudo al usuario
                portion_unit: 'g',
                macros: macros,
                notes: `K=${bestK.toFixed(2)}, YF=${ing.yieldFactor}`
            };
        });

        return {
            id: uuidv4(),
            label: 'Opción',
            isAIDraft: true,
            items: finalItems
        };
    }

    // Generates 3 options for a meal, preventing intra-day collisions
    static generateMealOptions(
        target: ParametricTarget, 
        filters: HealthGuardFilters, 
        usedRecipeIds: Set<string>
    ): MealOption[] {
        const availableRecipes = this.filterRecipes(MASTER_RECIPES, filters)
            .filter(r => !usedRecipeIds.has(r.id));
        
        // Shuffle available
        const shuffled = [...availableRecipes].sort(() => 0.5 - Math.random());
        
        // Pick up to 3
        const selected = shuffled.slice(0, 3);
        const options: MealOption[] = [];
        const labels = ['Opción A', 'Opción B', 'Opción C'];

        selected.forEach((recipe, index) => {
            const option = this.scaleRecipe(recipe, target);
            if (option) {
                option.label = labels[index];
                options.push(option);
                usedRecipeIds.add(recipe.id); // Mark as used
            }
        });

        return options;
    }
}

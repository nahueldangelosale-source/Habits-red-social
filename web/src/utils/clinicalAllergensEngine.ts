/**
 * Motor Clínico de Alérgenos y Restricciones Dietarias (Clinical Allergens Shield)
 * Bienestar APP — Fase 90
 * 
 * Reglas de sustitución segura e inmediata para:
 * 1. Celiaquía / Sin TACC (Gluten-Free)
 * 2. Intolerancia a la Lactosa (Dairy-Free)
 * 3. Vegano / Vegetariano (Plant-Based)
 */

export type DietaryShield = 'GLUTEN_FREE' | 'LACTOSE_FREE' | 'VEGAN';

export interface AllergenSwapRule {
    keyword: string;
    shield: DietaryShield;
    replacementName: string;
    protPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    calsPer100g: number;
    pedagogicalReason: string;
}

export const ALLERGEN_SWAP_RULES: AllergenSwapRule[] = [
    // ── 1. Sin TACC / Gluten-Free ──
    {
        keyword: 'avena',
        shield: 'GLUTEN_FREE',
        replacementName: 'Avena Certificada Sin TACC (USDA)',
        protPer100g: 13.5,
        carbsPer100g: 60.0,
        fatPer100g: 6.5,
        calsPer100g: 352.5,
        pedagogicalReason: 'Reemplazado por avena pura sin contaminación cruzada de gluten.'
    },
    {
        keyword: 'pan',
        shield: 'GLUTEN_FREE',
        replacementName: 'Pan Sin TACC / Galletas de Arroz',
        protPer100g: 7.5,
        carbsPer100g: 80.0,
        fatPer100g: 2.0,
        calsPer100g: 370.0,
        pedagogicalReason: 'Sustituido por panificados a base de harina de arroz y fécula de mandioca.'
    },
    {
        keyword: 'fideos',
        shield: 'GLUTEN_FREE',
        replacementName: 'Fideos de Arroz / Maíz Sin TACC',
        protPer100g: 7.0,
        carbsPer100g: 78.0,
        fatPer100g: 1.0,
        calsPer100g: 350.0,
        pedagogicalReason: 'Pasta elaborada 100% con harinas libres de gluten.'
    },
    {
        keyword: 'gallet',
        shield: 'GLUTEN_FREE',
        replacementName: 'Galletas de Arroz Integral',
        protPer100g: 8.0,
        carbsPer100g: 81.0,
        fatPer100g: 2.5,
        calsPer100g: 380.0,
        pedagogicalReason: 'Opción crujiente 100% arroz libre de TACC.'
    },

    // ── 2. Sin Lactosa / Dairy-Free ──
    {
        keyword: 'leche',
        shield: 'LACTOSE_FREE',
        replacementName: 'Bebida de Almendras / Soja Sin Lactosa',
        protPer100g: 3.0,
        carbsPer100g: 1.5,
        fatPer100g: 2.0,
        calsPer100g: 36.0,
        pedagogicalReason: 'Bebida vegetal suave, digestiva y 100% libre de lactosa.'
    },
    {
        keyword: 'yogur',
        shield: 'LACTOSE_FREE',
        replacementName: 'Yogur de Coco / Soja Fermentado',
        protPer100g: 4.0,
        carbsPer100g: 6.0,
        fatPer100g: 2.5,
        calsPer100g: 62.5,
        pedagogicalReason: 'Fermento vegetal que aporta probióticos sin azúcares lácteos.'
    },
    {
        keyword: 'queso',
        shield: 'LACTOSE_FREE',
        replacementName: 'Queso Sin Lactosa / Tofu Firme',
        protPer100g: 15.0,
        carbsPer100g: 2.0,
        fatPer100g: 8.0,
        calsPer100g: 140.0,
        pedagogicalReason: 'Sustituto de textura cremosa sin disacáridos de la leche.'
    },
    {
        keyword: 'ricotta',
        shield: 'LACTOSE_FREE',
        replacementName: 'Ricotta de Almendras / Tofu Sedoso',
        protPer100g: 10.0,
        carbsPer100g: 3.0,
        fatPer100g: 6.0,
        calsPer100g: 106.0,
        pedagogicalReason: 'Aporte de untuosidad libre de derivados lácteos.'
    },

    // ── 3. Vegano / Plant-Based ──
    {
        keyword: 'pollo',
        shield: 'VEGAN',
        replacementName: 'Tofu Firme Marinado (USDA)',
        protPer100g: 15.5,
        carbsPer100g: 2.5,
        fatPer100g: 8.0,
        calsPer100g: 144.0,
        pedagogicalReason: 'Proteína vegetal completa con los 9 aminoácidos esenciales.'
    },
    {
        keyword: 'carne',
        shield: 'VEGAN',
        replacementName: 'Tempeh / Soja Texturizada Gruesa',
        protPer100g: 20.0,
        carbsPer100g: 9.0,
        fatPer100g: 11.0,
        calsPer100g: 215.0,
        pedagogicalReason: 'Aporte proteico denso y fibroso de origen 100% vegetal.'
    },
    {
        keyword: 'atún',
        shield: 'VEGAN',
        replacementName: 'Garbanzos Cocidos al Limón',
        protPer100g: 8.9,
        carbsPer100g: 27.4,
        fatPer100g: 2.6,
        calsPer100g: 168.6,
        pedagogicalReason: 'Legumbre rica en proteínas, minerales y fibra saciante.'
    },
    {
        keyword: 'pescado',
        shield: 'VEGAN',
        replacementName: 'Tofu Sedoso con Semillas de Chía',
        protPer100g: 12.0,
        carbsPer100g: 4.0,
        fatPer100g: 7.0,
        calsPer100g: 127.0,
        pedagogicalReason: 'Aporte de Omega-3 vegetal y textura ligera.'
    },
    {
        keyword: 'huevo',
        shield: 'VEGAN',
        replacementName: 'Revuelto de Tofu con Cúrcuma',
        protPer100g: 12.0,
        carbsPer100g: 3.0,
        fatPer100g: 6.0,
        calsPer100g: 114.0,
        pedagogicalReason: 'Alternativa clásica vegetal con color, textura y proteínas equivalentes.'
    },
    {
        keyword: 'clara',
        shield: 'VEGAN',
        replacementName: 'Proteína de Arvejas / Soja Aislada',
        protPer100g: 24.0,
        carbsPer100g: 1.0,
        fatPer100g: 1.0,
        calsPer100g: 109.0,
        pedagogicalReason: 'Concentrado proteico vegetal de rápida asimilación.'
    }
];

export interface ShieldApplicationResult {
    adaptedCount: number;
    explanations: string[];
    modifiedItems: Array<{ original: string; replacement: string; reason: string }>;
}

/**
 * Evalúa y adapta una lista de ingredientes según los escudos activos.
 */
export function applyDietaryShieldsToItem(
    itemName: string,
    activeShields: DietaryShield[]
): { shouldReplace: boolean; rule?: AllergenSwapRule } {
    if (!activeShields || activeShields.length === 0) {
        return { shouldReplace: false };
    }

    const lowerName = itemName.toLowerCase();

    for (const shield of activeShields) {
        for (const rule of ALLERGEN_SWAP_RULES) {
            if (rule.shield === shield && lowerName.includes(rule.keyword)) {
                // Si el alimento ya es la variante segura, no volver a reemplazar
                if (lowerName.includes('sin tacc') || lowerName.includes('sin lactosa') || lowerName.includes('tofu') || lowerName.includes('tempeh')) {
                    continue;
                }
                return { shouldReplace: true, rule };
            }
        }
    }

    return { shouldReplace: false };
}

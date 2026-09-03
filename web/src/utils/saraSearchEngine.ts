/**
 * Motor de Búsqueda y Normalización Inteligente para SARA 2 y Alimentos Base
 * Incluye resolución de sinónimos (ej: "pollo" -> "pechuga de pollo"),
 * ponderación por relevancia, descarte de falsos positivos ("repollo" al buscar "pollo")
 * y embellecimiento de nombres del nomenclador oficial.
 */

import saraDataRaw from '../data/SARA_Master_Database.json';

export interface SaraFoodItem {
  id_sara: string;
  alimento: string;
  grupo: string;
  protcnt: number;
  choavldf: number;
  fat: number;
  enerc_kcal: number;
}

// Diccionario de expansión semántica y sinónimos para el mercado hispanohablante
const SYNONYM_MAP: Record<string, string[]> = {
  pollo: ['pechuga', 'pata y muslo', 'alitas', 'menudos', 'pollo'],
  pechuga: ['pechuga', 'pollo'],
  carne: ['bife', 'cuadril', 'lomo', 'nalga', 'peceto', 'vaca', 'ternera', 'carne picada', 'asado', 'matambre'],
  bife: ['bife', 'cuadril', 'lomo', 'nalga', 'bife de chorizo', 'ojo de bife'],
  huevo: ['huevo', 'clara', 'yema', 'omelette'],
  clara: ['clara', 'clara de huevo', 'huevo'],
  arroz: ['arroz', 'arroz integral', 'arroz basmati', 'arroz yamaní'],
  avena: ['avena', 'hojuelas de avena', 'quaker'],
  batata: ['batata', 'boniato', 'camote'],
  papa: ['papa', 'patata', 'puré de papas'],
  palta: ['palta', 'aguacate', 'guacamole'],
  atun: ['atun', 'atún', 'pescado'],
  merluza: ['merluza', 'pescado', 'filet'],
  salmon: ['salmon', 'salmón', 'pescado'],
  leche: ['leche', 'descremada', 'entera', 'leche en polvo'],
  queso: ['queso', 'port salut', 'mozzarella', 'crema', 'ricotta'],
  yogur: ['yogur', 'yogurt', 'yogur griego', 'skyr'],
  frutilla: ['frutilla', 'fresa', 'frutos rojos', 'berries'],
  banana: ['banana', 'plátano'],
  lino: ['lino', 'semillas de lino', 'linaza'],
  chia: ['chia', 'chía', 'semillas de chía'],
  sesamo: ['sesamo', 'sésamo', 'semillas de sésamo', 'ajonjolí'],
  girasol: ['girasol', 'semillas de girasol', 'pipas'],
  calabaza: ['calabaza', 'semillas de calabaza', 'zapallo', 'anco'],
  cacao: ['cacao', 'cacao amargo', 'chocolate 100%'],
  mani: ['mani', 'maní', 'manteca de maní', 'cacahuate', 'mantequilla de maní'],
  almendra: ['almendra', 'almendras', 'frutos secos'],
  nuez: ['nuez', 'nueces', 'frutos secos'],
  oliva: ['aceite de oliva', 'oliva', 'aceite']
};

// Normalizar strings quitando tildes y caracteres especiales
export const normalizeStr = (str: string): string => {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Limpieza y embellecimiento de nombres de alimentos del nomenclador
function cleanFoodName(name: string): string {
  let cleaned = name
    .replace(/\s*\.\s*/g, ' ') // reemplaza "Pollo . asado" por "Pollo asado"
    .replace(/\s+/g, ' ')
    .trim();

  // Mejoras semánticas comunes
  if (/^pechuga sin piel/i.test(cleaned)) {
    cleaned = 'Pechuga de pollo sin piel (cruda)';
  } else if (/^pechuga con piel/i.test(cleaned)) {
    cleaned = 'Pechuga de pollo con piel';
  } else if (/^pata y muslo sin piel/i.test(cleaned)) {
    cleaned = 'Pata y muslo de pollo sin piel';
  } else if (/^pata y muslo con piel/i.test(cleaned)) {
    cleaned = 'Pata y muslo de pollo con piel';
  } else if (/^cuadril/i.test(cleaned)) {
    cleaned = 'Bife de cuadril magro';
  } else if (/^lomo$/i.test(cleaned)) {
    cleaned = 'Lomo vacuno magro';
  } else if (/^nalga$/i.test(cleaned)) {
    cleaned = 'Nalga vacuna magra';
  }

  // Capitalizar primera letra
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// Base de datos parseada e indexada en memoria
export const SARA_DATABASE: SaraFoodItem[] = (saraDataRaw as any[])
  .filter((item: any) => item.ENERC_KCAL !== null && item.PROTCNT !== null)
  .map((item: any) => {
    const rawName = item.Alimento || item.alimento || 'Sin nombre';
    return {
      id_sara: String(item.ID_SARA || item.id_sara || Math.random()),
      alimento: cleanFoodName(rawName),
      grupo: item.Grupo || item.origen_categoria || 'SARA Oficial',
      protcnt: Number(item.PROTCNT) || 0,
      choavldf: Number(item.CHOCDF || item.CHOAVLDF) || 0,
      fat: Number(item.FAT) || 0,
      enerc_kcal: Number(item.ENERC_KCAL) || 0
    };
  });

/**
 * Búsqueda Inteligente con scoring de relevancia
 */
export async function searchSaraFoods(
  searchTerm: string,
  sortBy: string = 'relevance',
  filterGroup: string | null = null
): Promise<SaraFoodItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let pool = [...SARA_DATABASE];

      if (filterGroup) {
        const groupTerm = normalizeStr(filterGroup);
        pool = pool.filter((f) => normalizeStr(f.grupo).includes(groupTerm));
      }

      if (!searchTerm || searchTerm.trim() === '') {
        // Orden default
        if (sortBy === 'protein') pool.sort((a, b) => b.protcnt - a.protcnt);
        if (sortBy === 'carbs') pool.sort((a, b) => a.choavldf - b.choavldf);
        if (sortBy === 'calories') pool.sort((a, b) => a.enerc_kcal - b.enerc_kcal);
        resolve(pool.slice(0, 50));
        return;
      }

      const term = normalizeStr(searchTerm);
      const queryTokens = term.split(/\s+/).filter(Boolean);

      // Obtener términos expandidos por sinónimos
      const expandedTerms = new Set<string>([term, ...queryTokens]);
      queryTokens.forEach((tok) => {
        if (SYNONYM_MAP[tok]) {
          SYNONYM_MAP[tok].forEach((s) => expandedTerms.add(normalizeStr(s)));
        }
      });

      // Calcular Score para cada alimento
      const scoredItems: { item: SaraFoodItem; score: number }[] = [];

      pool.forEach((item) => {
        const normName = normalizeStr(item.alimento);
        const normGroup = normalizeStr(item.grupo);
        const words = normName.split(/\s+/);

        let score = 0;

        // 1. Coincidencia exacta o inicio del nombre
        if (normName === term) {
          score += 150;
        } else if (normName.startsWith(term)) {
          score += 100;
        }

        // 2. Coincidencia de palabra completa
        words.forEach((w) => {
          if (w === term) {
            score += 80;
          } else if (w.startsWith(term)) {
            score += 50;
          }
        });

        // 3. Chequeo de sinónimos expandidos
        expandedTerms.forEach((exp) => {
          if (normName.includes(exp)) {
            score += 40;
          }
        });

        // 4. Penalización de falsos positivos por subcadena dentro de otra palabra
        // Ej: buscar "pollo" no debe rankear alto "repollo" o "pimpollo"
        if (term === 'pollo' && (normName.includes('repollo') || normName.includes('pimpollo'))) {
          score -= 90;
        }
        if (term === 'papa' && (normName.includes('papaya') || normName.includes('papalote'))) {
          score -= 90;
        }

        // 5. Coincidencia general de tokens
        const allTokensMatch = queryTokens.every((tok) => normName.includes(tok));
        if (allTokensMatch) {
          score += 30;
        }

        // 6. Grupo
        if (normGroup.includes(term)) {
          score += 10;
        }

        if (score > 0) {
          scoredItems.push({ item, score });
        }
      });

      // Ordenar por score de mayor a menor
      scoredItems.sort((a, b) => {
        if (sortBy === 'protein') return b.item.protcnt - a.item.protcnt;
        if (sortBy === 'carbs') return a.item.choavldf - b.item.choavldf;
        if (sortBy === 'calories') return a.item.enerc_kcal - b.item.enerc_kcal;
        return b.score - a.score;
      });

      resolve(scoredItems.slice(0, 50).map((si) => si.item));
    }, 150);
  });
}

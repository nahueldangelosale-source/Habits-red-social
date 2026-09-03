import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Circle, 
  Utensils, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Sparkles, 
  Check, 
  Package, 
  Info, 
  RotateCcw,
  CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNutritionStore, DAYS_OF_WEEK } from '../../stores/useNutritionStore';

type TimeHorizon = '3d' | '1w' | '2w' | '1m';

interface SmartShoppingItem {
  id: string;
  name: string;
  rawAmount: number;
  rawUnit: string;
  category: string;
  retailPackaging: string;     // Cómo se compra en góndola (ej: "1 paquete de 400g")
  householdMeasure: string;    // Medida casera real (ej: "2 rebanadas por desayuno")
  yieldDescription: string;    // Rendimiento (ej: "Rinde ~7 desayunos")
}

const multipliers: Record<TimeHorizon, number> = {
  '3d': 0.43,
  '1w': 1.0,
  '2w': 2.0,
  '1m': 4.0
};

const horizonLabels: Record<TimeHorizon, string> = {
  '3d': '3 Días',
  '1w': '1 Semana',
  '2w': '15 Días',
  '1m': '1 Mes'
};

// Diccionario de empaques comerciales argentinos y medidas caseras
const RETAIL_KNOWLEDGE_BASE: Record<string, { pack: string; measure: string; yieldPerPack: string }> = {
  'pan': { pack: '1 paquete de pan lactal (400g)', measure: '2 rebanadas (~60g)', yieldPerPack: 'Rinde ~7 desayunos' },
  'granola': { pack: '1 bolsa o frasco (250g)', measure: '2 cdas soperas (~30g)', yieldPerPack: 'Rinde ~8 porciones' },
  'arroz': { pack: '1 paquete de 500g o 1kg', measure: '1 taza cocida (~150g)', yieldPerPack: 'Rinde ~6 comidas' },
  'huevo': { pack: '1 media docena (6 u)', measure: '2 huevos enteros', yieldPerPack: 'Rinde 3 desayunos' },
  'clara': { pack: '1 sachet o 1 docena', measure: '3 a 4 claras', yieldPerPack: 'Rinde 3 tortillas' },
  'peceto': { pack: '1 bandeja de ~500g a 1kg', measure: '1 bife mediano (~180g)', yieldPerPack: 'Rinde 3 a 5 comidas' },
  'lomo': { pack: '1 bandeja de lomo magro (~600g)', measure: '1 porción (~160g)', yieldPerPack: 'Rinde 3 a 4 comidas' },
  'pollo': { pack: '1 bandeja de pechuga (~1kg)', measure: '1 pechuga mediana (~200g)', yieldPerPack: 'Rinde ~5 comidas' },
  'pavo': { pack: '1 paquete de pechuga de pavo (150g)', measure: '2 a 3 fetas (~60g)', yieldPerPack: 'Rinde 2 a 3 sandwiches' },
  'merluza': { pack: '1 bandeja de filete fresco (~600g)', measure: '1 filete (~200g)', yieldPerPack: 'Rinde 3 cenas' },
  'salmón': { pack: '1 filete de salmón (~400g)', measure: '1 porción (~180g)', yieldPerPack: 'Rinde 2 cenas' },
  'palta': { pack: '2 o 3 unidades medianas', measure: '1/2 palta (~40g)', yieldPerPack: 'Rinde 4 a 6 tostadas' },
  'yogur': { pack: '1 pote grande (500g) o 2 chicos', measure: '1 taza o vaso (~200g)', yieldPerPack: 'Rinde 3 porciones' },
  'leche': { pack: '1 sachet de 1 litro', measure: '1 taza (~200ml)', yieldPerPack: 'Rinde 5 batidos' },
  'queso': { pack: '1 pote de untable / 200g magro', measure: '1 casette / 2 cdas (~40g)', yieldPerPack: 'Rinde 5 porciones' },
  'frutos': { pack: '1 bandeja de frutos rojos (150g)', measure: '1 puñado (~80g)', yieldPerPack: 'Rinde 2 meriendas' },
  'banana': { pack: '1 racimo (~1kg)', measure: '1 banana mediana (~100g)', yieldPerPack: 'Rinde ~8 unidades' },
  'manzana': { pack: '1 bolsa de 1kg (~5-6 u)', measure: '1 manzana mediana (~120g)', yieldPerPack: 'Rinde ~6 meriendas' },
  'brócoli': { pack: '1 planta de brócoli fresca (400g)', measure: '1 taza al vapor (~100g)', yieldPerPack: 'Rinde 4 porciones' },
  'espinaca': { pack: '1 paquete de espinaca lavada', measure: '1 plato hondo (~150g)', yieldPerPack: 'Rinde 2 tortillas/guarniciones' },
  'calabaza': { pack: '1/2 calabaza mediana (~1kg)', measure: '1 porción puré (~180g)', yieldPerPack: 'Rinde 4 a 5 porciones' },
  'papa': { pack: '1 bolsa de papas (1 a 2kg)', measure: '1 papa mediana (~150g)', yieldPerPack: 'Rinde 6 a 8 guarniciones' },
  'batata': { pack: '1/2 kg de batatas', measure: '1 batata chica (~120g)', yieldPerPack: 'Rinde 4 porciones' },
  'aceite': { pack: '1 botella de oliva (500ml)', measure: '1 cucharada (~10ml)', yieldPerPack: 'Rinde 50 ensaladas' },
  'tomate': { pack: '1/2 kg de tomates', measure: '1 tomate mediano (~120g)', yieldPerPack: 'Rinde 4 ensaladas' },
  'avena': { pack: '1 paquete de avena (400g)', measure: '4 cdas soperas (~45g)', yieldPerPack: 'Rinde 9 desayunos/pancakes' },
  'whey': { pack: '1 pote o doy pack (900g)', measure: '1 scoop (~30g)', yieldPerPack: 'Rinde 30 batidos' },
  'tortilla': { pack: '1 paquete de 6 a 10 tortillas', measure: '2 tortillas (~60g)', yieldPerPack: 'Rinde 3 a 5 comidas' },
  'quinoa': { pack: '1 paquete de 250g', measure: '1/2 taza cocida (~100g)', yieldPerPack: 'Rinde 5 bowls' }
};

export const ShoppingListOrchestrator: React.FC = () => {
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('1w');
  const [isForecastExpanded, setIsForecastExpanded] = useState(false);

  const { 
    weeklySchedule, 
    dailyMealPlan, 
    purchasedShoppingItems, 
    toggleShoppingItem, 
    clearPurchasedShoppingItems,
    markAllShoppingItemsPurchased
  } = useNutritionStore();

  const purchasedSet = useMemo(() => new Set(purchasedShoppingItems), [purchasedShoppingItems]);

  // Consolidación de ingredientes de todos los días de la semana
  const baseItems = useMemo(() => {
    const consolidation: Record<string, SmartShoppingItem> = {};

    // Iterar por todos los días de la semana planificados
    DAYS_OF_WEEK.forEach((dayName) => {
      const dayMeals = weeklySchedule[dayName] || dailyMealPlan;
      dayMeals.forEach((meal) => {
        const activeOpt = meal.options[0];
        if (activeOpt) {
          activeOpt.ingredients.forEach((ing) => {
            const key = ing.name.toLowerCase().trim();
            if (consolidation[key]) {
              consolidation[key].rawAmount += ing.quantity;
            } else {
              let category = 'Otros / Almacén';
              let retailPackaging = '1 unidad / paquete chico';
              let householdMeasure = `${ing.quantity}${ing.unit} por plato`;
              let yieldDescription = 'Rinde según plan';

              const n = ing.name.toLowerCase();

              // Buscar en Knowledge Base de supermercado
              for (const [kw, info] of Object.entries(RETAIL_KNOWLEDGE_BASE)) {
                if (n.includes(kw)) {
                  retailPackaging = info.pack;
                  householdMeasure = info.measure;
                  yieldDescription = info.yieldPerPack;
                  break;
                }
              }

              if (n.includes('pollo') || n.includes('carne') || n.includes('peceto') || n.includes('lomo') || n.includes('atún') || n.includes('salmón') || n.includes('merluza') || n.includes('huevo') || n.includes('clara') || n.includes('pavo')) {
                category = 'Carnes, Pescados & Huevos';
              } else if (n.includes('arroz') || n.includes('avena') || n.includes('pan') || n.includes('quinoa') || n.includes('granola') || n.includes('fideos') || n.includes('lentejas') || n.includes('harina') || n.includes('tortilla')) {
                category = 'Granos, Cereales & Harinas';
              } else if (n.includes('palta') || n.includes('brócoli') || n.includes('tomate') || n.includes('hojas') || n.includes('frutos') || n.includes('espinaca') || n.includes('calabaza') || n.includes('batata') || n.includes('papa') || n.includes('banana') || n.includes('manzana') || n.includes('zanahoria') || n.includes('pimiento') || n.includes('cebolla')) {
                category = 'Frutas & Verduras Frescas';
              } else if (n.includes('yogur') || n.includes('leche') || n.includes('queso') || n.includes('whey') || n.includes('proteína')) {
                category = 'Lácteos & Proteínas';
              } else if (n.includes('aceite') || n.includes('miel') || n.includes('chía') || n.includes('nuez') || n.includes('almendra')) {
                category = 'Grasas Saludables & Especias';
              }

              consolidation[key] = {
                id: key,
                name: ing.name,
                rawAmount: ing.quantity,
                rawUnit: ing.unit || 'g',
                category,
                retailPackaging,
                householdMeasure,
                yieldDescription
              };
            }
          });
        }
      });
    });

    return Object.values(consolidation);
  }, [weeklySchedule, dailyMealPlan]);

  // Multiplicador de período escalado
  const scaledItems = useMemo(() => {
    const multiplier = multipliers[timeHorizon];
    return baseItems.map((item) => {
      const totalRaw = Math.round(item.rawAmount * multiplier);
      
      // Adaptar el empaque sugerido si se piden 15 días o 1 mes
      let packaging = item.retailPackaging;
      if (timeHorizon === '2w' || timeHorizon === '1m') {
        if (item.name.toLowerCase().includes('huevo')) packaging = '1 maple de 30 huevos';
        if (item.name.toLowerCase().includes('pollo')) packaging = '2 bandejas grandes (~2kg)';
        if (item.name.toLowerCase().includes('arroz')) packaging = '1 paquete de 1kg';
        if (item.name.toLowerCase().includes('pan')) packaging = '2 paquetes de pan lactal';
        if (item.name.toLowerCase().includes('avena')) packaging = '2 paquetes de avena (800g)';
      }

      return {
        ...item,
        rawAmount: totalRaw,
        retailPackaging: packaging
      };
    });
  }, [baseItems, timeHorizon]);

  // Pronóstico de platos dinámico
  const mealForecast = useMemo(() => {
    const factor = multipliers[timeHorizon];
    const plateCounts: Record<string, { name: string; qty: number; cals: number; tag: string }> = {};

    DAYS_OF_WEEK.forEach((dayName) => {
      const dayMeals = weeklySchedule[dayName] || dailyMealPlan;
      dayMeals.forEach((meal) => {
        const opt = meal.options[0];
        if (opt) {
          if (!plateCounts[opt.name]) {
            plateCounts[opt.name] = {
              name: opt.name,
              qty: 0,
              cals: opt.totalMacros.calories,
              tag: meal.mealType
            };
          }
          plateCounts[opt.name].qty += 1;
        }
      });
    });

    const plates = Object.values(plateCounts).map((p) => ({
      ...p,
      qty: Math.max(1, Math.round(p.qty * factor))
    }));

    const totalPortions = plates.reduce((acc, p) => acc + p.qty, 0);
    return { totalPortions, plates };
  }, [weeklySchedule, dailyMealPlan, timeHorizon]);

  const handleToggle = (id: string) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
    toggleShoppingItem(id);
  };

  const handleMarkAll = () => {
    const allIds = scaledItems.map(i => i.id);
    markAllShoppingItemsPurchased(allIds);
    toast.success('Todos los artículos marcados como comprados', { icon: '✅' });
  };

  const handleClearAll = () => {
    clearPurchasedShoppingItems();
    toast.success('Lista de compras reiniciada', { icon: '🔄' });
  };

  const groupedItems = useMemo(() => {
    return scaledItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, SmartShoppingItem[]>);
  }, [scaledItems]);

  const purchasedCount = scaledItems.filter(i => purchasedSet.has(i.id)).length;
  const progress = scaledItems.length > 0
    ? Math.round((purchasedCount / scaledItems.length) * 100)
    : 0;

  const handleShareWhatsApp = () => {
    const lines = scaledItems.map(
      (item) => `${purchasedSet.has(item.id) ? '✅' : '⬜'} *${item.name}*: ${item.retailPackaging} _(${item.householdMeasure})_`
    );
    const text = `🛒 *Lista de Compras Inteligente Habits (${horizonLabels[timeHorizon]})*\n\n${lines.join('\n')}\n\n_Generado automáticamente desde mi Plan Nutricional_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 max-w-md mx-auto font-lato text-slate-900 dark:text-white">
      
      {/* 1. SELECTOR DE HORIZONTE TEMPORAL */}
      <div className="flex items-center justify-between gap-1 bg-white dark:bg-[#0a0d16] p-1.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs">
        {(Object.entries(horizonLabels) as [TimeHorizon, string][]).map(([key, label]) => {
          const isActive = timeHorizon === key;
          return (
            <button
              key={key}
              onClick={() => setTimeHorizon(key)}
              className={`flex-1 py-1.5 px-2 rounded-xl font-black font-montserrat text-[11px] uppercase tracking-wider transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/25' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 2. MENÚ DESPLEGABLE SEPARADO: PRONÓSTICO DE PLATOS & RENDIMIENTO */}
      <div className="bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        <button
          onClick={() => setIsForecastExpanded(!isForecastExpanded)}
          className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Utensils size={15} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Rendimiento de Platos
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 shrink-0">
                  {mealForecast.totalPortions} Platos Listos
                </span>
              </div>
              <h4 className="text-xs font-black font-montserrat text-slate-800 dark:text-white truncate">
                Pronóstico de Comidas para {horizonLabels[timeHorizon]}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
              {isForecastExpanded ? 'Ocultar' : 'Ver Platos'}
            </span>
            {isForecastExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        <AnimatePresence>
          {isForecastExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-3"
            >
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-lato pt-1">
                Con esta compra cubrís exactamente tus comidas del período, optimizando cantidades para evitar desperdicios de comida.
              </p>

              {/* Grid de Platos Pronosticados */}
              <div className="grid grid-cols-2 gap-2">
                {mealForecast.plates.map((plate, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate">
                        {plate.tag}
                      </span>
                      <span className="font-mono text-slate-400 shrink-0">{plate.cals} kcal</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight truncate">
                      {plate.name}
                    </h5>
                    <span className="inline-block text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      x{plate.qty} Porciones
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. PROGRESO DE COMPRA & DESPENSA INTELIGENTE */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0d16] border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShoppingCart size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black font-montserrat text-slate-900 dark:text-white uppercase tracking-wider">
                Tu Despensa
              </h3>
              <p className="text-[10px] text-slate-400">
                {purchasedCount} de {scaledItems.length} ingredientes comprados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAll}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-600 dark:text-zinc-300 text-[10px] font-bold"
              title="Marcar todos"
            >
              <CheckSquare size={13} />
            </button>
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-600 dark:text-zinc-300 text-[10px] font-bold"
              title="Reiniciar lista"
            >
              <RotateCcw size={13} />
            </button>
            <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-1 rounded-lg">
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 4. LISTA DE COMPRAS PEDAGÓGICA (PACK DE GÓNDOLA + MEDIDA CASERA) */}
      <div className="space-y-3.5 pt-1">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
              {category}
            </h4>

            <div className="bg-white dark:bg-[#0a0d16] rounded-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-zinc-800/60">
              {items.map((item) => {
                const isPurchased = purchasedSet.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`flex items-start justify-between p-3.5 cursor-pointer transition-all gap-3 ${
                      isPurchased 
                        ? 'bg-slate-50/60 dark:bg-zinc-900/30 opacity-60' 
                        : 'hover:bg-slate-50/80 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        className={`shrink-0 mt-0.5 transition-all ${
                          isPurchased ? 'text-emerald-500' : 'text-slate-300 dark:text-zinc-600'
                        }`}
                      >
                        {isPurchased ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs font-bold block truncate ${
                            isPurchased 
                              ? 'line-through text-slate-400 dark:text-zinc-500' 
                              : 'text-slate-800 dark:text-zinc-100'
                          }`}
                        >
                          {item.name}
                        </span>
                        {/* Subtítulo pedagógico: Medida Casera & Rendimiento */}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                          Usás: <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.householdMeasure}</span> • {item.yieldDescription}
                        </span>
                      </div>
                    </div>

                    {/* Badge de Empaque Comercial en Góndola */}
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[11px] font-black font-montserrat px-2.5 py-1 rounded-lg inline-block ${
                          isPurchased
                            ? 'bg-slate-200/80 dark:bg-zinc-800 text-slate-500'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
                        }`}
                      >
                        {item.retailPackaging}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 5. BOTÓN COMPARTIR A WHATSAPP */}
      <div className="pt-2 pb-6">
        <button
          onClick={handleShareWhatsApp}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-montserrat font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Share2 size={14} />
          <span>Enviar Lista Lista para Comprar a WhatsApp</span>
        </button>
      </div>

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { 
  Plus, Pin, Layers, Activity, ChevronLeft, ChevronRight, ChefHat, 
  ChevronDown, ChevronUp, Sparkles, FileText, CloudDownload, CalendarPlus, 
  Settings2, Flame, Scale, Zap, Check, ArrowRight
} from 'lucide-react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { SmartLibraryPanel } from './SmartLibraryPanel';
import { NaaSBuilderCanvas } from './NaaSBuilderCanvas';
import { useNaaSCanvasStore } from '../../../stores/useNaaSCanvasStore';
import { useNutritionStore } from '../../../stores/useNutritionStore';
import { RecipeCreatorModal } from './RecipeCreatorModal';
import { trackNaaSEvent } from '../../../lib/telemetry/naasTelemetry';
import { NutritionPeriodSelectorModal } from './NutritionPeriodSelectorModal';
import { getNutritionPeriodConfig } from '../../../data/nutritionPhasesConfig';
import toast from 'react-hot-toast';

export const QUICK_NUTRITION_CYCLES = [
  {
    id: 'recomp_8w',
    title: 'Ciclo Recomposición Corporal',
    duration: '8 Semanas',
    subtitle: 'Déficit Calórico 4s + Mantenimiento Isocalórico 4s',
    badge: 'Más Usado ⭐',
    icon: '⚖️',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    border: 'border-emerald-200 hover:border-emerald-400',
    phases: [
      { configId: 'DEFICIT_ESTANDAR', weeks: 4 },
      { configId: 'MANTENIMIENTO_MED', weeks: 4 },
    ]
  },
  {
    id: 'definition_6w',
    title: 'Ciclo Minicut & Recovery Diet',
    duration: '6 Semanas',
    subtitle: 'Minicut Agresivo 4s + Salto a Recovery Diet 2s',
    badge: 'Quema Rápida ⚡',
    icon: '🔥',
    gradient: 'from-rose-500/10 via-amber-500/5 to-transparent',
    border: 'border-rose-200 hover:border-rose-400',
    phases: [
      { configId: 'MINICUT_AGRESIVO', weeks: 4 },
      { configId: 'RECOVERY_DIET', weeks: 2 },
    ]
  },
  {
    id: 'matador_12w',
    title: 'Protocolo MATADOR (Diet Breaks)',
    duration: '12 Semanas',
    subtitle: 'Déficit 2s + Mantenimiento 2s (Atenúa termogénesis)',
    badge: 'Clínico ISSN ⏳',
    icon: '⏳',
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    border: 'border-amber-200 hover:border-amber-400',
    phases: [
      { configId: 'DEFICIT_ESTANDAR', weeks: 2 },
      { configId: 'MANTENIMIENTO_MED', weeks: 2 },
      { configId: 'DEFICIT_ESTANDAR', weeks: 2 },
      { configId: 'MANTENIMIENTO_MED', weeks: 2 },
      { configId: 'DEFICIT_ESTANDAR', weeks: 2 },
      { configId: 'MANTENIMIENTO_MED', weeks: 2 },
    ]
  },
  {
    id: 'hypertrophy_10w',
    title: 'Ciclo Volumen Limpio & Masa',
    duration: '10 Semanas',
    subtitle: 'Superávit Controlado 8s + Consolidación 2s',
    badge: 'Hipertrofia 💪',
    icon: '🍗',
    gradient: 'from-indigo-500/10 via-purple-500/5 to-transparent',
    border: 'border-indigo-200 hover:border-indigo-400',
    phases: [
      { configId: 'SUPERAVIT_PROTEICO', weeks: 8 },
      { configId: 'MANTENIMIENTO_MED', weeks: 2 },
    ]
  },
  {
    id: 'carb_cycling_refeed_4w',
    title: 'Ciclado de Carbos & Refeed',
    duration: '4 Semanas',
    subtitle: 'Días Altos/Bajos + Refeed Estructurado de 48h',
    badge: 'Rendimiento 🔋',
    icon: '⚡',
    gradient: 'from-sky-500/10 via-blue-500/5 to-transparent',
    border: 'border-sky-200 hover:border-sky-400',
    phases: [
      { configId: 'CICLADO_CARBOHIDRATOS', weeks: 3 },
      { configId: 'REFEED_CARBS', weeks: 1 },
    ]
  }
];

const ClientTrackingSidebar = () => {
  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Activity size={14} /> Adherencia Global
        </h3>
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-emerald-600">85%</span>
            <span className="text-xs font-bold text-slate-500 uppercase">Esta Semana</span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white shadow-sm">
            <Activity size={18} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Layers size={14} /> Comentarios del Cliente
        </h3>
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm relative">
            <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-4 right-4"></div>
            <p className="text-xs text-slate-600 font-medium mb-2">"Me quedé con un poco de hambre en la Opción B del desayuno de hoy. ¿Podemos agregar algo?"</p>
            <div className="text-[10px] font-bold text-slate-400">Hace 2 horas - Día 1</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative">
            <p className="text-xs text-slate-500 font-medium mb-2">"Excelente la merienda pre-entreno, me dio buena energía."</p>
            <div className="text-[10px] font-bold text-slate-400">Ayer - Día 7</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NaaSWorkspaceProps {
  mode?: 'builder' | 'tracking';
}

export const NaaSWorkspace: React.FC<NaaSWorkspaceProps> = ({ mode = 'builder' }) => {
  const { initNewPlan, dropSaraItemToOption, nutritionPhases, addNutritionPhase } = useNaaSCanvasStore();
  const addRecipe = useNutritionStore(s => s.addRecipe);
  const [activeDay, setActiveDay] = useState(1);
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'micro' | 'medio' | 'macro'>('macro');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  useEffect(() => {
    if (!activePhaseId && nutritionPhases.length > 0) {
      setActivePhaseId(nutritionPhases[0].id);
    }
  }, [nutritionPhases, activePhaseId]);

  // Inicializar un borrador vacío si no existe
  useEffect(() => {
    initNewPlan('tenant-1', 'client-1', 'prof-1', {
      protein_g: 150, carbs_g: 200, fat_g: 60, calories: 1940
    });
    trackNaaSEvent('session_start', { timestamp: Date.now() });
  }, [initNewPlan]);

  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const handleDragStart = (event: DragStartEvent) => {
    trackNaaSEvent('drag_item_started', { timestamp: Date.now() });
    const { active } = event;
    if (active.data.current?.type === 'SARA_ITEM') {
      setActiveDragItem(active.data.current.item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;
    
    if (!over) return;

    const isSaraItem = active.data.current?.type === 'SARA_ITEM';
    const isMealOption = over.data.current?.type === 'MEAL_OPTION';

    if (isSaraItem && isMealOption) {
      const saraItem = active.data.current?.item;
      const blockId = over.data.current?.blockId;
      const optionId = over.data.current?.optionId;

      trackNaaSEvent('drop_item_calculated', {
        itemId: saraItem.id,
        optionId: optionId
      });

      setTimeout(() => {
        dropSaraItemToOption(blockId, optionId, saraItem);
      }, 400);
    }
  };

  const handleApplyQuickCycle = (preset: typeof QUICK_NUTRITION_CYCLES[0]) => {
    preset.phases.forEach(p => {
      addNutritionPhase(p.configId, undefined, p.weeks);
    });
    toast.success(`¡${preset.title} activado con éxito!`, { icon: '🥗' });
  };

  const handleQuickAddPeriod = (configId: string, weeks: number = 4) => {
    addNutritionPhase(configId, undefined, weeks);
    const cfg = getNutritionPeriodConfig(configId);
    toast.success(`Añadido: ${cfg.label} (${weeks} sem)`, { icon: '➕' });
  };

  // --- TIMELINE HORIZONTAL DE CICLOS Y PERIODOS (ÁGIL) ---
  const renderMacroTimeline = () => (
    <div className="w-full max-w-7xl mx-auto mb-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Encabezado Delgado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-4 border-b border-slate-100 bg-slate-50/70 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 text-xs font-montserrat tracking-tight">Ciclos y Periodos Nutricionales</h3>
            <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100/80 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {nutritionPhases.length} {nutritionPhases.length === 1 ? 'Periodo' : 'Periodos'}
            </span>
          </div>
        </div>

        {/* Atajos Rápidos de Periodos para trabajo ágil */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline">
            Añadir Periodo Rápido:
          </span>
          <button
            onClick={() => handleQuickAddPeriod('MINICUT_AGRESIVO', 4)}
            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-md border border-slate-200/80 transition-colors"
            title="Añadir 4 semanas de Minicut Agresivo"
          >
            +4s Minicut
          </button>
          <button
            onClick={() => handleQuickAddPeriod('DEFICIT_ESTANDAR', 4)}
            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md border border-slate-200/80 transition-colors"
            title="Añadir 4 semanas de Déficit Estándar"
          >
            +4s Déficit
          </button>
          <button
            onClick={() => handleQuickAddPeriod('RECOVERY_DIET', 2)}
            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-600 text-slate-600 rounded-md border border-slate-200/80 transition-colors"
            title="Añadir 2 semanas de Recovery Diet (Salto a Mantenimiento)"
          >
            +2s Recovery
          </button>
          <button
            onClick={() => handleQuickAddPeriod('MANTENIMIENTO_MED', 4)}
            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-md border border-slate-200/80 transition-colors"
            title="Añadir 4 semanas de Mantenimiento"
          >
            +4s Mantenimiento
          </button>
          <button
            onClick={() => handleQuickAddPeriod('SUPERAVIT_PROTEICO', 4)}
            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-purple-50 hover:text-purple-600 text-slate-600 rounded-md border border-slate-200/80 transition-colors"
            title="Añadir 4 semanas de Superávit"
          >
            +4s Superávit
          </button>
          <button
            onClick={() => handleQuickAddPeriod('REVERSE_DIETING', 2)}
            className="text-[10px] font-bold px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-600 text-slate-600 rounded-md border border-slate-200/80 transition-colors"
            title="Añadir 2 semanas de Reverse Dieting"
          >
            +2s Reverse
          </button>
          
          <button 
            onClick={() => setIsSelectorOpen(true)}
            className="text-xs font-bold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Librería</span>
          </button>
          <button
            onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            title={isTimelineCollapsed ? "Expandir mapa de ciclos" : "Minimizar mapa de ciclos"}
          >
            {isTimelineCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
        </div>
      </div>

      {/* Contenido de Ciclos Compacto */}
      {!isTimelineCollapsed && (
        <div className="flex flex-col py-2.5 px-4 bg-slate-50/30 overflow-x-auto custom-scrollbar">
          <div className="flex gap-3 min-w-max items-center">
            {nutritionPhases.map((phase, idx) => {
              const config = getNutritionPeriodConfig(phase.configId);
              return (
                <div key={phase.id} className="flex items-center gap-3">
                  <div 
                    onClick={() => setActivePhaseId(phase.id)}
                    className={`w-48 px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 relative group ${
                      activePhaseId === phase.id 
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base shrink-0" aria-hidden="true">{config.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 text-[11px] leading-tight truncate">{config.label}</h4>
                        <span className="text-[9px] text-slate-400 font-medium">Periodo {idx + 1}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${config.color.tailwind} text-white`}>
                        {phase.durationWeeks}s
                      </span>
                    </div>
                  </div>
                  {idx < nutritionPhases.length - 1 && (
                    <div className="flex items-center text-slate-300">
                      <div className="w-4 h-px bg-slate-200"></div>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-slate-50 flex flex-col font-lato">
        
        <div className="flex flex-col p-4 sm:p-6 relative flex-1">
        
        {/* --- EMPTY STATE ULTRA ÁGIL: PRESETS DE CICLOS EN 1 CLIC --- */}
        {nutritionPhases.length === 0 ? (
          <div className="w-full max-w-5xl mx-auto mt-6 mb-16 px-4 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-sm border border-indigo-100 text-2xl">
                🥗
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-montserrat tracking-tight mb-2">
                PERIODIZACIÓN & CICLOS NUTRICIONALES
              </h2>
              <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                Trabajá de manera ágil: activá una estructura de ciclo completa en <strong>1 solo clic</strong>, o diseñá tu secuencia personalizada periodo por periodo.
              </p>
            </div>
            
            {/* Grid de 4 Presets de Ciclos en 1 Clic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {QUICK_NUTRITION_CYCLES.map((cycle) => (
                <div 
                  key={cycle.id}
                  className={`bg-white rounded-2xl p-5 border ${cycle.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer`}
                  onClick={() => handleApplyQuickCycle(cycle)}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{cycle.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {cycle.duration}
                      </span>
                    </div>

                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                      {cycle.badge}
                    </span>

                    <h3 className="font-bold text-slate-800 text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
                      {cycle.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {cycle.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyQuickCycle(cycle);
                    }}
                    className="mt-4 w-full py-2 px-3 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>Cargar en 1 Clic</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Acciones Secundarias */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => setIsSelectorOpen(true)}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-600 border border-indigo-200 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Diseñar Ciclo a Medida (Librería)
              </button>
              <button 
                onClick={() => setIsRecipeModalOpen(true)}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-emerald-500" /> Crear Nueva Receta
              </button>
            </div>
          </div>
        ) : (
          <>
            {renderMacroTimeline()}

            {/* Main Canvas with split layout */}
            <NaaSBuilderCanvas 
              key={activeDay}
              athleteId="athlete-123" 
              athleteName="Nicolas Moroni" 
              dayName={`Día ${activeDay}`}
              activeDay={activeDay}
              viewMode={viewMode as any}
              leftSidebar={mode === 'builder' ? <SmartLibraryPanel /> : <ClientTrackingSidebar />}
              headerNavigation={
                <div className="flex flex-col border-t border-slate-100 pt-4 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center pb-3 border-b border-slate-100 mb-3 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg border border-indigo-100">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 tracking-tight text-sm">Menú Detallado</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Diseño Día a Día</p>
                        </div>
                    </div>
                  </div>

                  {/* Macro Navigation Bar (Days/Weeks) */}
                  <div className="flex items-center gap-2 py-2 shrink-0 overflow-x-auto custom-scrollbar">
                    <span className="text-xs font-black uppercase text-slate-400 mr-2 tracking-wider shrink-0">Semana 1</span>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all shrink-0 cursor-pointer ${
                          activeDay === day 
                            ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200' 
                            : 'text-slate-500 hover:bg-slate-100 bg-white shadow-sm border border-slate-200'
                        }`}
                      >
                        Día {day}
                      </button>
                    ))}
                    <button className="ml-auto flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all shrink-0 cursor-pointer">
                      <Plus className="w-4 h-4" /> Añadir Día
                    </button>
                  </div>
                </div>
              }
            />
          </>
        )}
        
        <DragOverlay>
          {activeDragItem ? (
            <div className="p-3 rounded-lg border-2 border-blue-400 bg-white shadow-xl opacity-90 rotate-2 w-64 flex items-center justify-between pointer-events-none cursor-grabbing">
              <div className="flex-1 truncate pr-2">
                <h4 className="text-sm font-semibold text-slate-800 font-montserrat truncate">{activeDragItem.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-slate-500 font-lato truncate">{activeDragItem.category}</p>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">por 100g</span>
                </div>
              </div>
              <div className="flex gap-2 text-[10px] font-lato font-bold shrink-0">
                <span className="bg-rose-50 text-rose-700 px-1.5 py-1 rounded shadow-sm">P: {activeDragItem.protein_g}</span>
                <span className="bg-amber-50 text-amber-700 px-1.5 py-1 rounded shadow-sm">C: {activeDragItem.available_carbs_g}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        <NutritionPeriodSelectorModal 
          isOpen={isSelectorOpen} 
          onClose={() => setIsSelectorOpen(false)}
          onSelectPeriod={(selections) => {
            selections.forEach(sel => addNutritionPhase(sel.id, undefined, sel.weeks));
            setIsSelectorOpen(false);
          }}
        />

        <RecipeCreatorModal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          onSave={(recipe) => {
            addRecipe(recipe);
            setIsRecipeModalOpen(false);
          }}
        />
        </div>
      </div>
    </DndContext>
  );
};

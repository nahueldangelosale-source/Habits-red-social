import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  Flame, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Target, 
  ArrowLeft, 
  ArrowRight, 
  Search,
  Sliders,
  Award
} from 'lucide-react';
import { 
  useHabitStore, 
  HABIT_CATALOG, 
  CATEGORY_ORDER, 
  CATEGORY_META, 
  DAY_LABELS_SHORT,
  getHabitDaysSummary,
  type HabitCategory, 
  type HabitType, 
  type HabitInputType,
  type HabitCatalogItem
} from '../../stores/useHabitStore';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClientId: string;
}

const QUICK_TITLE_SUGGESTIONS: Record<HabitCategory, string[]> = {
  FITNESS: ['Entrenamiento de Fuerza', '20m Caminata Activa', '15m Movilidad / Foam', 'Estiramientos Post-Entreno', '10.000 Pasos'],
  NUTRICION: ['2L de Agua', 'Tomar Creatina', '5 Porciones de Verdura', 'Comer Proteína en Cada Comida', 'Preparar Meal Prep'],
  SUEÑO: ['7h de Sueño Reparador', 'Acostarse Antes de las 23h', 'Dejar Pantallas 30m Antes', 'Habitación Fresca y Oscura'],
  MINDSET: ['10m Meditación / Mindfulness', 'Lectura de Crecimiento', 'Journaling / Gratitud', 'Paseo al Aire Libre'],
  PRODUCTIVIDAD: ['2h de Deep Work', 'Planificar el Día Siguiente', 'Completar To-Do Principal', 'Revisión de Metas'],
  CUSTOM: ['Nuevo Hábito Personal']
};

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  activeClientId
}) => {
  const { prescribeHabit, prescribeCustomHabit, prescribedHabits } = useHabitStore();

  const [activeTab, setActiveTab] = useState<'CATALOG' | 'CUSTOM'>('CATALOG');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<HabitCategory | 'ALL'>('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');

  // ─── Wizard Step State ─────────────────────────────────
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HabitCategory>('FITNESS');
  const [type, setType] = useState<HabitType>('BUILD');
  const [inputType, setInputType] = useState<HabitInputType>('BOOLEAN');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState('min');
  const [scheduledDays, setScheduledDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  // Day Toggle Handlers
  const handleToggleDay = (dayId: number) => {
    setScheduledDays(prev => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev; // Mantener al menos 1 día
        return prev.filter(d => d !== dayId);
      } else {
        return [...prev, dayId].sort();
      }
    });
  };

  const setPresetDays = (days: number[]) => {
    setScheduledDays(days);
    if ('vibrate' in navigator) navigator.vibrate([15]);
  };

  const handleAddFromCatalog = (template: HabitCatalogItem) => {
    prescribeHabit(activeClientId, template.id, 'INDEFINITE', scheduledDays);
    if ('vibrate' in navigator) navigator.vibrate([25]);
    onClose();
  };

  const handleFinishCustom = () => {
    if (!title.trim()) return;

    prescribeCustomHabit(activeClientId, {
      title: title.trim(),
      type,
      category,
      inputType,
      unit: inputType === 'NUMERIC' ? unit : undefined,
      targetValue: inputType === 'NUMERIC' ? Number(targetValue) : undefined,
      scheduledDays,
      tags: [category.toLowerCase(), type.toLowerCase(), 'personalizado']
    });

    if ('vibrate' in navigator) navigator.vibrate([30]);
    // Reset Form
    setTitle('');
    setWizardStep(1);
    setScheduledDays([1, 2, 3, 4, 5, 6, 7]);
    onClose();
  };

  if (!isOpen) return null;

  const existingTemplateIds = prescribedHabits
    .filter(h => h.clientId === activeClientId)
    .map(h => h.templateId);

  const filteredCatalog = HABIT_CATALOG.filter(item => {
    const matchesCat = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
    const matchesQuery = !catalogSearch.trim() || item.title.toLowerCase().includes(catalogSearch.toLowerCase()) || item.tags.some(t => t.toLowerCase().includes(catalogSearch.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-lato"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-montserrat text-slate-900 dark:text-white leading-tight">
                  Crear Nuevo Hábito
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {activeTab === 'CATALOG' ? 'Elige una plantilla lista para usar' : `Paso ${wizardStep} de 3 — Diseña tu hábito a medida`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Segmented Control: Plantillas vs Personalizado */}
          <div className="px-5 pt-3">
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/60 dark:border-white/5">
              <button
                onClick={() => {
                  setActiveTab('CATALOG');
                  if ('vibrate' in navigator) navigator.vibrate([10]);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'CATALOG'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Zap size={14} />
                Plantillas Rápidas
              </button>

              <button
                onClick={() => {
                  setActiveTab('CUSTOM');
                  if ('vibrate' in navigator) navigator.vibrate([10]);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'CUSTOM'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <Sliders size={14} />
                Personalizado (Paso a Paso)
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 1: PLANTILLAS RÁPIDAS (1-Clic)                         */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'CATALOG' && (
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* Selector de Días Previo para las Plantillas */}
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 font-montserrat">
                    <Calendar size={13} className="text-indigo-500" />
                    Días activos para las plantillas:
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                    {getHabitDaysSummary(scheduledDays)}
                  </span>
                </div>

                {/* Botones Circulares L M X J V S D */}
                <div className="flex items-center justify-between gap-1">
                  {DAY_LABELS_SHORT.map(d => {
                    const isActive = scheduledDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleToggleDay(d.id)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 scale-105'
                            : 'bg-white dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-200/80 dark:border-white/5 hover:border-indigo-300'
                        }`}
                        title={d.name}
                      >
                        <span>{d.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Atajos Rápidos */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <button
                    type="button"
                    onClick={() => setPresetDays([1, 2, 3, 4, 5, 6, 7])}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                  >
                    ⚡ Todos los días
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDays([1, 3, 5])}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                  >
                    🏋️ Lun · Mié · Vie
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDays([2, 4, 6])}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                  >
                    🔥 Mar · Jue · Sáb
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresetDays([1, 2, 3, 4, 5])}
                    className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                  >
                    💼 Días Laborales
                  </button>
                </div>
              </div>

              {/* Barra de Búsqueda y Filtro de Categoría */}
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={e => setCatalogSearch(e.target.value)}
                    placeholder="Buscar hábito (agua, sueño, pasos, entreno...)"
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  {catalogSearch && (
                    <button onClick={() => setCatalogSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Symmetric Category Filter Grid (All 6 options fit on screen without scroll) */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter('ALL');
                      if ('vibrate' in navigator) navigator.vibrate([10]);
                    }}
                    className={`py-2 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 text-center ${
                      selectedCategoryFilter === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    <span>🌟</span>
                    <span className="truncate">Todos</span>
                  </button>

                  {CATEGORY_ORDER.map(cat => {
                    const meta = CATEGORY_META[cat];
                    const isSelected = selectedCategoryFilter === cat;
                    const labelText = cat === 'PRODUCTIVIDAD' ? 'Productiv.' : meta.label.split(' ')[0];

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryFilter(cat);
                          if ('vibrate' in navigator) navigator.vibrate([10]);
                        }}
                        className={`py-2 px-1 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 text-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                            : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                        }`}
                        title={meta.label}
                      >
                        <span>{meta.icon}</span>
                        <span className="truncate">{labelText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lista de Plantillas con Títulos Claros y sin Truncar */}
              <div className="grid grid-cols-1 gap-2">
                {filteredCatalog.map(item => {
                  const isAlreadyAdded = existingTemplateIds.includes(item.id);
                  const meta = CATEGORY_META[item.category];

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isAlreadyAdded
                          ? 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200 dark:border-white/5 opacity-60'
                          : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xl flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${
                              item.type === 'BUILD'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50'
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">
                              {meta.label}
                            </span>
                            {item.targetValue && (
                              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-1 rounded">
                                Meta: {item.targetValue} {item.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isAlreadyAdded ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <Check size={12} /> Activo
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddFromCatalog(item)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm"
                        >
                          <Plus size={13} />
                          <span>Añadir</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 2: PERSONALIZADO — WIZARD PEDAGÓGICO POR PASOS         */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'CUSTOM' && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              
              {/* Wizard Stepper Header (Plan Builder Style) */}
              <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-zinc-900/30">
                <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
                  
                  {/* Step 1 */}
                  <button 
                    onClick={() => setWizardStep(1)}
                    className="flex flex-col items-center gap-1 flex-1 group"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      wizardStep === 1 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110' 
                        : wizardStep > 1 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      {wizardStep > 1 ? <Check size={13} /> : '1'}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      wizardStep === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                    }`}>
                      Identidad
                    </span>
                  </button>

                  {/* Connector Line 1 */}
                  <div className={`h-0.5 flex-1 rounded-full transition-colors ${
                    wizardStep > 1 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-800'
                  }`} />

                  {/* Step 2 */}
                  <button 
                    onClick={() => {
                      if (title.trim()) setWizardStep(2);
                    }}
                    disabled={!title.trim()}
                    className={`flex flex-col items-center gap-1 flex-1 group ${!title.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      wizardStep === 2 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110' 
                        : wizardStep > 2 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      {wizardStep > 2 ? <Check size={13} /> : '2'}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      wizardStep === 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                    }`}>
                      Medición
                    </span>
                  </button>

                  {/* Connector Line 2 */}
                  <div className={`h-0.5 flex-1 rounded-full transition-colors ${
                    wizardStep > 2 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-800'
                  }`} />

                  {/* Step 3 */}
                  <button 
                    onClick={() => {
                      if (title.trim()) setWizardStep(3);
                    }}
                    disabled={!title.trim()}
                    className={`flex flex-col items-center gap-1 flex-1 group ${!title.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      wizardStep === 3 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-110' 
                        : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                    }`}>
                      3
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      wizardStep === 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                    }`}>
                      Días & Activar
                    </span>
                  </button>
                </div>
              </div>

              {/* Wizard Body Scrollable */}
              <div className="p-5 overflow-y-auto flex-1 space-y-5">
                
                {/* ─── PASO 1: IDENTIDAD Y CATEGORÍA ─── */}
                {wizardStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 font-montserrat">
                        ¿Qué hábito deseas incorporar?
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Escribe un nombre claro y motivante para tu acción diaria.
                      </p>
                      <input
                        type="text"
                        autoFocus
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ej: Entrenar Piernas, Tomar Creatina, Caminar 20m..."
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mt-1"
                      />
                    </div>

                    {/* Sugerencias Rápidas de Título */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Ideas populares para {CATEGORY_META[category].label.split(' ')[0]}:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {QUICK_TITLE_SUGGESTIONS[category]?.map(sug => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setTitle(sug)}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Categoría con Iconos */}
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 font-montserrat">
                        Categoría del Hábito
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {CATEGORY_ORDER.map(cat => {
                          const meta = CATEGORY_META[cat];
                          const isSelected = category === cat;
                          const shortName = cat === 'PRODUCTIVIDAD' ? 'Product.' : cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setCategory(cat);
                                if ('vibrate' in navigator) navigator.vibrate([10]);
                              }}
                              className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-105'
                                  : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xl sm:text-2xl">{meta.icon}</span>
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight truncate w-full">
                                {shortName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── PASO 2: MEDICIÓN Y OBJETIVO ─── */}
                {wizardStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    {/* Objetivo Conductual */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 font-montserrat">
                        Objetivo Conductual
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setType('BUILD')}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                            type === 'BUILD'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-sm'
                              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          <span className="text-2xl">🟢</span>
                          <div>
                            <p className="text-xs font-black font-montserrat">Construir (BUILD)</p>
                            <p className="text-[10px] text-slate-400">Sumar una acción positiva</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setType('BREAK')}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                            type === 'BREAK'
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200 shadow-sm'
                              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          <span className="text-2xl">🔴</span>
                          <div>
                            <p className="text-xs font-black font-montserrat">Eliminar (BREAK)</p>
                            <p className="text-[10px] text-slate-400">Dejar un mal hábito</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Modo de Registro */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 font-montserrat">
                        ¿Cómo vas a registrarlo cada día?
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setInputType('BOOLEAN')}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                            inputType === 'BOOLEAN'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          <CheckCircle2 size={20} className={inputType === 'BOOLEAN' ? 'text-indigo-600' : 'text-slate-400'} />
                          <div>
                            <p className="text-xs font-black font-montserrat">Interruptor Sí / No</p>
                            <p className="text-[10px] text-slate-400">1 toque para marcar hecho</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInputType('NUMERIC')}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                            inputType === 'NUMERIC'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          <Target size={20} className={inputType === 'NUMERIC' ? 'text-indigo-600' : 'text-slate-400'} />
                          <div>
                            <p className="text-xs font-black font-montserrat">Meta Numérica</p>
                            <p className="text-[10px] text-slate-400">Contador con objetivo</p>
                          </div>
                        </button>
                      </div>

                      {inputType === 'NUMERIC' && (
                        <div className="p-4 bg-slate-50 dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 mt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor Meta Diario</label>
                              <input
                                type="number"
                                min={1}
                                value={targetValue}
                                onChange={e => setTargetValue(Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-900 dark:text-white mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unidad de Medida</label>
                              <input
                                type="text"
                                value={unit}
                                onChange={e => setUnit(e.target.value)}
                                placeholder="min, L, pasos, porc., km..."
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ─── PASO 3: DÍAS DE LA SEMANA Y VISTA PREVIA ─── */}
                {wizardStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 font-montserrat flex items-center gap-1.5">
                          <Calendar size={14} className="text-indigo-500" />
                          ¿Qué días de la semana aplica?
                        </label>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                          {getHabitDaysSummary(scheduledDays)}
                        </span>
                      </div>

                      {/* Botones de Días L M X J V S D */}
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        {DAY_LABELS_SHORT.map(d => {
                          const isActive = scheduledDays.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => handleToggleDay(d.id)}
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-xs font-black transition-all flex items-center justify-center ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105'
                                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border border-slate-200 dark:border-white/5 hover:border-indigo-300'
                              }`}
                              title={d.name}
                            >
                              <span>{d.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Atajos Rápidos */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        <button
                          type="button"
                          onClick={() => setPresetDays([1, 2, 3, 4, 5, 6, 7])}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                            scheduledDays.length === 7
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                              : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          ⚡ Todos los días
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetDays([1, 3, 5])}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                            scheduledDays.length === 3 && [1, 3, 5].every(d => scheduledDays.includes(d))
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                              : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          🏋️ Lun · Mié · Vie (L-X-V)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetDays([2, 4, 6])}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                            scheduledDays.length === 3 && [2, 4, 6].every(d => scheduledDays.includes(d))
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                              : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          🔥 Mar · Jue · Sáb
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetDays([1, 2, 3, 4, 5])}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                            scheduledDays.length === 5 && [1, 2, 3, 4, 5].every(d => scheduledDays.includes(d))
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                              : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-white/5 text-slate-500'
                          }`}
                        >
                          💼 Lun a Vie
                        </button>
                      </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Award size={12} className="text-amber-500" />
                        Vista Previa de tu Tarjeta de Hábito:
                      </label>
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 text-xl flex items-center justify-center shrink-0 shadow-xs">
                            {CATEGORY_META[category].icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                                {title || 'Nombre del Hábito'}
                              </h4>
                              <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded flex items-center gap-0.5 shrink-0">
                                <Flame size={9} className="fill-amber-500" /> 0d
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex items-center gap-0.5">
                                {DAY_LABELS_SHORT.map(d => {
                                  const isActive = scheduledDays.includes(d.id);
                                  return (
                                    <span
                                      key={d.id}
                                      className={`w-3.5 h-3.5 rounded text-[7px] font-black flex items-center justify-center ${
                                        isActive
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-slate-200 dark:bg-zinc-800 text-slate-400'
                                      }`}
                                    >
                                      {d.label}
                                    </span>
                                  );
                                })}
                              </div>
                              <span className="text-[8px] font-bold text-slate-400 ml-1">
                                {getHabitDaysSummary(scheduledDays)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Preview Control */}
                        <div className="shrink-0">
                          {inputType === 'BOOLEAN' ? (
                            <div className="w-12 h-7 rounded-full bg-slate-200 dark:bg-zinc-700 p-1 flex items-center">
                              <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                            </div>
                          ) : (
                            <div className="px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border text-xs font-bold text-slate-600 dark:text-zinc-300">
                              0 / {targetValue} {unit}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Wizard Footer Navigation */}
              <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setWizardStep((prev) => (prev - 1) as 1 | 2)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <ArrowLeft size={14} />
                    <span>Atrás</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                )}

                {wizardStep < 3 ? (
                  <button
                    type="button"
                    disabled={!title.trim()}
                    onClick={() => {
                      if (title.trim()) setWizardStep((prev) => (prev + 1) as 2 | 3);
                      if ('vibrate' in navigator) navigator.vibrate([15]);
                    }}
                    className={`px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all ${
                      !title.trim() ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                    }`}
                  >
                    <span>Siguiente</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishCustom}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
                  >
                    <Sparkles size={14} />
                    <span>Activar Hábito</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

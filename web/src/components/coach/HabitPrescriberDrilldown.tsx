import React, { useState, useMemo } from 'react';
import { 
  useHabitStore, 
  HABIT_CATALOG, 
  HABIT_LEVEL_THRESHOLDS, 
  HABIT_LEVEL_LABELS,
  CATEGORY_ORDER,
  CATEGORY_META,
  type HabitDuration, 
  type HabitCategory
} from '../../stores/useHabitStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { Brain, Sparkles, TrendingUp, TrendingDown, Clock, ShieldAlert, Trash2, ChevronRight, Zap, Trophy, Flame, ChevronDown, Check, X, Target } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const fmtDate = (d: Date) => d.toISOString().split('T')[0];

export const HabitPrescriberDrilldown: React.FC = () => {
  const { prescribeHabit, prescribedHabits, removeHabit, completeDay, completeDayWithValue, getCompletionZone, prescribeCustomHabit } = useHabitStore();
  const activeClientId = useOnboardingPTStore(state => state.identity.fullName) || 'unknown';
  const clientHabits = prescribedHabits.filter(h => h.clientId === activeClientId);

  const [selectedDuration, setSelectedDuration] = useState<HabitDuration>('1_MONTH');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  
  // Modals & UX State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', type: 'BUILD', isNumeric: false, category: 'NUTRICION' as HabitCategory });
  const [showToast, setShowToast] = useState(false);

  // Auto-select first if none selected so the calendar is always visible
  const actualSelectedId = selectedHabitId || (clientHabits.length > 0 ? clientHabits[0].id : null);
  const selectedHabit = clientHabits.find(h => h.id === actualSelectedId) || null;
  
  // Tag Filtering
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<HabitCategory>>(new Set()); // Closed by default

  const DURATIONS: { value: HabitDuration; label: string }[] = [
    { value: '1_WEEK', label: '1 Semana' },
    { value: '1_MONTH', label: '1 Mes' },
    { value: '3_MONTHS', label: '3 Meses' },
    { value: 'INDEFINITE', label: 'Indefinido' }
  ];

  const handlePrescribe = (templateId: string) => prescribeHabit(activeClientId, templateId, selectedDuration);
  const isPrescribed = (templateId: string) => clientHabits.some(h => h.templateId === templateId);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    HABIT_CATALOG.forEach(h => h.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const toggleTag = (tag: string) => {
    const newTags = new Set(activeTags);
    if (newTags.has(tag)) newTags.delete(tag);
    else newTags.add(tag);
    setActiveTags(newTags);
  };

  const clearTags = () => setActiveTags(new Set());

  const toggleCategory = (cat: HabitCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(cat)) newExpanded.delete(cat);
    else newExpanded.add(cat);
    setExpandedCategories(newExpanded);
  };

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    const customHabitItems = clientHabits.filter(h => h.isCustom).map(h => ({
      id: h.templateId,
      title: h.title,
      type: h.type,
      category: h.category,
      icon: '✨',
      tags: h.tags,
      inputType: h.inputType,
      unit: h.unit,
      targetValue: h.targetValue
    }));
    const fullCatalog = [...HABIT_CATALOG, ...customHabitItems];

    if (activeTags.size === 0) return fullCatalog;
    return fullCatalog.filter(h => h.tags.some(t => activeTags.has(t)));
  }, [activeTags, clientHabits]);

  // Current Month grid for the drilldown calendar
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0-6 (0 is Sunday)
    // Shift so Monday is 0
    const emptySlots = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    // Last day of the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const cells: (Date | null)[] = [];
    
    // Pad empty slots
    for (let i = 0; i < emptySlots; i++) {
      cells.push(null);
    }
    
    // Fill days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(new Date(year, month, i));
    }
    
    return cells;
  }, []);

  // Stats for selected habit
  const habitStats = useMemo(() => {
    if (!selectedHabit) return null;
    const start = new Date(selectedHabit.startDate);
    const now = new Date();
    const daysActive = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const adherence = daysActive > 0 ? Math.round((selectedHabit.completedDays.length / daysActive) * 100) : 0;
    
    // Calculate % of HIGH zones
    const highDays = Object.values(selectedHabit.dailyZones).filter(z => z === 'HIGH').length;
    const highPct = selectedHabit.completedDays.length > 0 
      ? Math.round((highDays / selectedHabit.completedDays.length) * 100) 
      : 0;

    let nextThreshold = HABIT_LEVEL_THRESHOLDS.find(t => t > selectedHabit.streakCurrent) || 365;
    const daysToNext = nextThreshold - selectedHabit.streakCurrent;
    const currentThreshold = selectedHabit.level > 0 ? HABIT_LEVEL_THRESHOLDS[selectedHabit.level - 1] : 0;
    const progressPct = nextThreshold > currentThreshold
      ? Math.min(100, ((selectedHabit.streakCurrent - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
      : 100;

    return { daysActive, adherence, highPct, nextThreshold, daysToNext, progressPct, currentThreshold };
  }, [selectedHabit]);

  const durationLabel = (d: HabitDuration) => {
    const map: Record<HabitDuration, string> = { '1_WEEK': '1 Sem', '1_MONTH': '1 Mes', '3_MONTHS': '3 Meses', 'INDEFINITE': '∞' };
    return map[d];
  };

  const getTailwindColor = (colorName: string) => {
    const map: Record<string, string> = {
      'indigo': 'text-indigo-600 bg-indigo-50 border-indigo-200',
      'emerald': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      'amber': 'text-amber-600 bg-amber-50 border-amber-200',
      'violet': 'text-violet-600 bg-violet-50 border-violet-200',
      'cyan': 'text-cyan-600 bg-cyan-50 border-cyan-200',
      'slate': 'text-slate-600 bg-slate-50 border-slate-200',
    };
    return map[colorName] || map['slate'];
  };

  const getSaturatedColor = (colorName: string) => {
     const map: Record<string, string> = {
      'indigo': 'bg-indigo-500',
      'emerald': 'bg-emerald-500',
      'amber': 'bg-amber-500',
      'violet': 'bg-violet-500',
      'cyan': 'bg-cyan-500',
      'slate': 'bg-slate-500',
    };
    return map[colorName] || map['slate'];
  }

  const getLightColor = (colorName: string) => {
     const map: Record<string, string> = {
      'indigo': 'bg-indigo-300',
      'emerald': 'bg-emerald-300',
      'amber': 'bg-amber-300',
      'violet': 'bg-violet-300',
      'cyan': 'bg-cyan-300',
      'slate': 'bg-slate-300',
    };
    return map[colorName] || map['slate'];
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[600px] font-lato">
      {/* ═══ LEFT PANEL: Master ═══ */}
      <div className="w-full lg:w-[450px] lg:border-r border-slate-100 p-5 overflow-y-auto flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black font-montserrat text-slate-900 leading-tight">Protocolos de Prescripción</h2>
              <p className="text-[11px] font-lato text-slate-400">Catálogo expandido · Lally et al.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1 shadow-sm">
             + Crear Hábito
          </button>
        </div>

        {/* ── Hábitos Activos (PRIORITARIO — siempre visible arriba) ── */}
        {clientHabits.length > 0 && (
          <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3">
            <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">
              <span className="flex items-center gap-1.5"><Target size={10} /> Activos</span>
              <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full text-[9px]">{clientHabits.length}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {clientHabits.map(habit => {
                const isActive = actualSelectedId === habit.id;
                const catalogItem = HABIT_CATALOG.find(h => h.id === habit.templateId);
                return (
                  <button
                    key={habit.id}
                    onClick={() => setSelectedHabitId(isActive ? null : habit.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border group ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-white'
                    }`}
                  >
                    <span>{catalogItem?.icon || '✨'}</span>
                    <span className="truncate max-w-[100px]">{habit.title}</span>
                    <span className={`text-[9px] font-black ${isActive ? 'text-indigo-200' : 'text-amber-500'}`}>🔥{habit.streakCurrent}</span>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); removeHabit(habit.id); if (isActive) setSelectedHabitId(null); }}
                      className={`w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                        isActive ? 'hover:bg-indigo-500' : 'hover:bg-red-50'
                      }`}
                    >
                      <X size={10} className={isActive ? 'text-indigo-200' : 'text-red-400'} />
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
              }}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Check size={14} /> Confirmar nuevos hábitos
            </button>
          </div>
        )}

        {/* Cognitive Overload Warning */}
        {clientHabits.length >= 3 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2 text-amber-800 shadow-sm">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold leading-relaxed">
              Sobrecarga Cognitiva: +3 hábitos simultáneos reduce adherencia.
            </p>
          </div>
        )}

        {/* Duration Selector */}
        <div>
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            <Clock size={12} /> Duración de Prescripción
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DURATIONS.map(d => (
              <button key={d.value} onClick={() => setSelectedDuration(d.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  selectedDuration === d.value ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >{d.label}</button>
            ))}
          </div>
        </div>

        {/* Tag Filter Bar (UX Optimized) */}
        <div>
           <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Filtros Inteligentes
          </label>
          <div className="flex flex-wrap gap-1.5 items-center">
            <button 
              onClick={clearTags}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                  activeTags.size === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
              }`}
            >
              Todos
            </button>
            {(showAllTags ? allTags : allTags.slice(0, 6)).map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                  activeTags.has(tag) ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                #{tag}
              </button>
            ))}
            
            {allTags.length > 6 && (
              <button 
                onClick={() => setShowAllTags(!showAllTags)}
                className="px-2 py-1 rounded-md text-[10px] font-bold transition-all border border-transparent text-slate-400 hover:bg-slate-100 flex items-center gap-1"
              >
                {showAllTags ? 'Ocultar' : `+${allTags.length - 6} más`}
                <ChevronDown size={10} className={`transition-transform ${showAllTags ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Category Accordions */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {CATEGORY_ORDER.map(cat => {
            const meta = CATEGORY_META[cat];
            const catHabits = filteredCatalog.filter(h => h.category === cat);
            
            if (catHabits.length === 0) return null; // Hide if no habits match filter

            const isExpanded = expandedCategories.has(cat);
            const buildHabits = catHabits.filter(h => h.type === 'BUILD');
            const breakHabits = catHabits.filter(h => h.type === 'BREAK');

            return (
              <div key={cat} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.icon}</span>
                    <span className="text-xs font-black uppercase text-slate-700">{meta.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 rounded">{catHabits.length}</span>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Accordion Body */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-3">
                        {/* BUILD Habits */}
                        {buildHabits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {buildHabits.map(habit => {
                              const active = isPrescribed(habit.id);
                              return (
                                <button key={habit.id}
                                  onClick={() => active ? removeHabit(clientHabits.find(ch => ch.templateId === habit.id)!.id) : handlePrescribe(habit.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                    active ? getTailwindColor(meta.color) + ' shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{habit.icon}</span>
                                  <span>{habit.title}</span>
                                  {active && <Check size={12} className="opacity-70" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Subtle Divider */}
                        {buildHabits.length > 0 && breakHabits.length > 0 && (
                          <div className="h-px bg-slate-100 w-full" />
                        )}

                        {/* BREAK Habits */}
                        {breakHabits.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {breakHabits.map(habit => {
                              const active = isPrescribed(habit.id);
                              return (
                                <button key={habit.id}
                                  onClick={() => active ? removeHabit(clientHabits.find(ch => ch.templateId === habit.id)!.id) : handlePrescribe(habit.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                    active ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/30'
                                  }`}
                                >
                                  <span>{habit.icon}</span>
                                  <span>{habit.title}</span>
                                  {active && <X size={12} className="text-rose-500" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>


      {/* ═══ RIGHT PANEL: Drilldown Detail ═══ */}
      <div className="flex-1 p-5 lg:p-8 bg-slate-50/50 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!selectedHabit ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-300 gap-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                <Brain size={32} className="text-slate-200" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-400">Prescribe un hábito</p>
                <p className="text-[11px] text-slate-400 mt-1">Selecciona un hábito de la lista para ver su calendario histórico.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={selectedHabit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              {/* Detail Header */}
              <div className="flex items-start justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      selectedHabit.type === 'BUILD' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>{selectedHabit.type}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTailwindColor(CATEGORY_META[selectedHabit.category].color)}`}>
                       {CATEGORY_META[selectedHabit.category].label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                      {durationLabel(selectedHabit.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{HABIT_CATALOG.find(h => h.id === selectedHabit.templateId)?.icon || '✨'}</span>
                    <h3 className="text-2xl font-black font-montserrat text-slate-900 leading-none tracking-tight">{selectedHabit.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                     {selectedHabit.tags.map(t => (
                        <span key={t} className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">#{t}</span>
                     ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md ${
                    selectedHabit.type === 'BUILD'
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                      : 'bg-gradient-to-br from-rose-400 to-rose-600 text-white'
                  }`}>
                    {selectedHabit.level}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">Nivel</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                  <Flame size={18} className="mx-auto text-amber-500 mb-2" />
                  <div className="text-2xl font-black text-slate-900">{selectedHabit.streakCurrent}</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 mt-1">Racha Actual</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                  <Trophy size={18} className="mx-auto text-amber-500 mb-2" />
                  <div className="text-2xl font-black text-slate-900">{selectedHabit.streakBest}</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 mt-1">Mejor Racha</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                  <Zap size={18} className="mx-auto text-indigo-500 mb-2" />
                  <div className="text-2xl font-black text-slate-900">{habitStats?.adherence ?? 0}%</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 mt-1">Adherencia</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-center">
                  <Target size={18} className="mx-auto text-emerald-500 mb-2" />
                  <div className="text-2xl font-black text-slate-900">{habitStats?.highPct ?? 0}%</div>
                  <div className="text-[9px] font-black uppercase text-slate-400 mt-1">Zona High</div>
                </div>
              </div>

              {/* Level Progress Bar */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progreso Lally et al.</span>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Faltan {habitStats?.daysToNext ?? 0}d para Nv.{selectedHabit.level + 1}
                  </span>
                </div>
                <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${habitStats?.progressPct ?? 0}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      selectedHabit.type === 'BUILD' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between relative px-2">
                  {HABIT_LEVEL_THRESHOLDS.map((t, i) => (
                    <div key={t} className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mb-1.5 ${
                        selectedHabit.streakCurrent >= t
                          ? (selectedHabit.type === 'BUILD' ? 'bg-emerald-500 shadow-sm' : 'bg-rose-500 shadow-sm')
                          : 'bg-slate-200'
                      }`} />
                      <span className={`text-[9px] font-black ${selectedHabit.streakCurrent >= t ? 'text-slate-800' : 'text-slate-400'}`}>
                        {t}d
                      </span>
                      <span className={`text-[8px] font-bold mt-0.5 ${selectedHabit.streakCurrent >= t ? 'text-slate-500' : 'text-slate-400'}`}>
                        {HABIT_LEVEL_LABELS[i + 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Calendar (Mes Actual) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 capitalize">Registro: {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h4>
                <div className="grid grid-cols-7 gap-1.5">
                  {['L','M','X','J','V','S','D'].map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-slate-400 pb-1">{d}</div>
                  ))}
                  {calendarDays.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} className="w-full aspect-square" />;

                    const key = fmtDate(date);
                    const isCompleted = selectedHabit.completedDays.includes(key);
                    const zone = getCompletionZone(selectedHabit, key);
                    const isToday = key === fmtDate(new Date());
                    const isFuture = date > new Date();
                    const val = selectedHabit.dailyValues[key];
                    
                    const catColor = CATEGORY_META[selectedHabit.category].color;
                    
                    let bgClass = 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100';
                    
                    if (isCompleted) {
                       if (zone === 'HIGH') {
                          bgClass = `${getSaturatedColor(catColor)} text-white shadow-sm border-transparent hover:opacity-90`;
                       } else if (zone === 'LOW') {
                          bgClass = `${getLightColor(catColor)} text-white shadow-sm border-transparent hover:opacity-90`;
                       }
                    }
                    
                    // Simple interaction for demo purposes (real usage via Athlete UI)
                    const handleSimpleToggle = () => {
                       if (isFuture) return;
                       if (isCompleted) {
                           // For now, simple completeDay will toggle off correctly
                           completeDay(selectedHabit.id, key);
                       } else {
                           if (selectedHabit.inputType === 'NUMERIC' && selectedHabit.targetValue) {
                              completeDayWithValue(selectedHabit.id, key, selectedHabit.targetValue);
                           } else {
                              completeDay(selectedHabit.id, key);
                           }
                       }
                    }

                    return (
                      <button
                        key={i}
                        disabled={isFuture}
                        onClick={handleSimpleToggle}
                        title={val !== undefined ? `${val}${selectedHabit.unit || ''}` : ''}
                        className={`
                          w-full aspect-square rounded-lg text-[11px] font-bold transition-all flex items-center justify-center
                          ${isFuture ? 'opacity-30 cursor-not-allowed bg-slate-50 border border-slate-100 text-slate-300' : 'cursor-pointer hover:scale-110'}
                          ${bgClass}
                          ${isToday && !isCompleted ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
                        `}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center font-medium bg-slate-50 py-2 rounded-lg">
                   {selectedHabit.inputType === 'NUMERIC' 
                      ? 'Tonos oscuros indican meta al 100%. Tonos claros indican meta parcial (≥90%).' 
                      : 'Clic en un día para simular cumplimiento.'}
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Crear Hábito (Explicación) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-[200] backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-montserrat text-slate-900 leading-tight">Creador de Hábitos</h2>
                    <p className="text-xs text-slate-500 font-lato">Definición de Comportamientos Libres</p>
                  </div>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shadow-sm">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del Hábito</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Leer 10 páginas, Tomar 2L de agua..."
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. ¿Qué tipo es?</label>
                    <select 
                      value={newHabit.type}
                      onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                    >
                      <option value="BUILD">Hacer (BUILD)</option>
                      <option value="BREAK">Evitar (BREAK)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. ¿Cómo se mide?</label>
                    <select 
                      value={newHabit.isNumeric ? 'true' : 'false'}
                      onChange={(e) => setNewHabit({ ...newHabit, isNumeric: e.target.value === 'true' })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                    >
                      <option value="false">Check (Sí/No)</option>
                      <option value="true">Número (Rango)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">3. Categoría</label>
                  <select 
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as HabitCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                  >
                    <option value="SUEÑO">Sueño & Recuperación</option>
                    <option value="NUTRICION">Nutrición & Hidratación</option>
                    <option value="MINDSET">Mindset & Bienestar</option>
                    <option value="FITNESS">Fitness & Movimiento</option>
                    <option value="PRODUCTIVIDAD">Productividad</option>
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-white border border-slate-200 text-slate-600 font-bold py-2.5 px-6 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (newHabit.name.trim()) {
                      prescribeCustomHabit(activeClientId, {
                        title: newHabit.name.trim(),
                        type: newHabit.type as 'BUILD' | 'BREAK',
                        category: newHabit.category,
                        inputType: newHabit.isNumeric ? 'NUMERIC' : 'BOOLEAN'
                      });
                      setNewHabit({ name: '', type: 'BUILD', isNumeric: false, category: 'NUTRICION' });
                      setIsCreateModalOpen(false);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-md shadow-indigo-500/20 text-sm"
                >
                  Guardar Hábito
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 toast-glass px-6 py-4 rounded-2xl flex items-center gap-4 z-[200]"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={16} />
            </div>
            <div>
              <p className="text-sm font-bold">Hábitos Confirmados</p>
              <p className="text-[11px] text-slate-400">Los hábitos han sido guardados en el perfil del atleta.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  useHabitStore, 
  CATEGORY_ORDER, 
  CATEGORY_META,
  HABIT_LEVEL_THRESHOLDS,
  HABIT_LEVEL_LABELS,
  HABIT_CATALOG,
  DAY_LABELS_SHORT,
  getDayOfWeekISO,
  isHabitScheduledForDay,
  getHabitDaysSummary,
  type HabitCategory,
  type PrescribedHabit
} from '../../stores/useHabitStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { useGamificationStore, getLevelTitle } from '../../stores/useGamificationStore';
import { useHabitSync } from '../../hooks/useHabitSync';
import { 
  Calendar, 
  Flame, 
  CheckCircle2, 
  CheckSquare, 
  ListTodo, 
  Minus, 
  Plus, 
  Trophy, 
  X, 
  TrendingUp, 
  Target, 
  Zap, 
  ChevronUp, 
  Share2, 
  Star, 
  Users, 
  UserPlus, 
  AlertTriangle, 
  ChevronRight, 
  Sparkles,
  BarChart3,
  Trash2,
  CalendarDays,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MindsetSanctuary } from '../behavioral/MindsetSanctuary';
import { StatsStickerShare } from './StatsStickerShare';
import { useTribuStore } from '../../stores/useTribuStore';
import { InviteToSquadModal } from '../tribu/InviteToSquadModal';
import { CreateSquadChallengeModal } from '../tribu/CreateSquadChallengeModal';
import { SquadChallengeDetailModal } from '../tribu/SquadChallengeDetailModal';
import { CreateHabitModal } from './CreateHabitModal';
import confetti from 'canvas-confetti';

const fmtDate = (d: Date) => d.toISOString().split('T')[0];

// ═══════════════════════════════════════════════════════════════
// DailyHabitCheckin Component
// ═══════════════════════════════════════════════════════════════

// Haptic feedback utility
const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([15]);
  }
};

interface PerfectDayCelebrationProps {
  active: boolean;
  onClose: () => void;
  onShare: () => void;
}

const PerfectDayCelebration: React.FC<PerfectDayCelebrationProps> = ({ active, onClose, onShare }) => {
  if (!active) return null;
  const { level, getXPProgress } = useGamificationStore();
  const xpProgress = getXPProgress();
  const levelTitle = getLevelTitle(level);
  const currentXP = xpProgress?.currentXP ?? 0;
  const xpForNextLevel = xpProgress?.xpForNextLevel ?? 1000;
  const progressPercent = xpProgress?.progressPercent ?? 0;
  const remainingXP = Math.max(0, xpForNextLevel - currentXP);
  
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-full max-w-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full bg-white dark:bg-zinc-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-2xl shadow-indigo-500/30 relative overflow-hidden text-center"
        >
          {/* Botón Cerrar X */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-all z-20 hover:scale-105 active:scale-95"
            title="Cerrar"
          >
            <X size={16} />
          </button>

          {/* Destellos decorativos */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl rotate-3 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
              <span className="text-3xl -rotate-3">🎉</span>
            </div>
            
            <h3 className="text-indigo-700 dark:text-indigo-400 font-black font-montserrat uppercase tracking-tight text-2xl mb-1">¡Día Perfecto!</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mb-5">Has completado todos tus hábitos de hoy.</p>

            {/* Panel de Estadísticas Gamificadas */}
            <div className="w-full bg-slate-50 dark:bg-black/40 rounded-2xl p-4 border border-slate-100 dark:border-white/5 mb-5 text-left">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Zap size={12} /> Recompensa
                  </p>
                  <p className="text-lg font-black text-slate-800 dark:text-white mt-0.5">+50 XP 🚀</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 flex items-center gap-1 justify-end">
                    <Star size={12} /> Nivel {level} • {levelTitle}
                  </p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">{currentXP} / {xpForNextLevel} XP</p>
                </div>
              </div>
              
              {/* Barra de Progreso XP */}
              <div className="h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-2 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                <span>Faltan {remainingXP} XP para Nivel {level + 1}</span>
                <span>{progressPercent}%</span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={onShare}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Share2 size={16} />
                <span>Compartir Victoria</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const DailyHabitCheckin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'SQUAD'>('PERSONAL');
  const [pulseHabitId, setPulseHabitId] = useState<string | null>(null);
  const [shakeHabitId, setShakeHabitId] = useState<string | null>(null);
  const [tooltipHabitId, setTooltipHabitId] = useState<string | null>(null);
  const [sanctuaryHabitId, setSanctuaryHabitId] = useState<string | null>(null);
  const [isShareStickerOpen, setIsShareStickerOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateChallengeModalOpen, setIsCreateChallengeModalOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [isCreateHabitModalOpen, setIsCreateHabitModalOpen] = useState(false);

  const { 
    prescribedHabits, 
    prescribeHabit,
    updateHabitSchedule,
    removeHabit,
    completeDay, 
    completeDayWithValue, 
    getDailyCompletionRate, 
    getAdherence, 
    getCompletionZone, 
    lastConfettiDate, 
    markConfettiSeen 
  } = useHabitStore();

  // ─── Tribu & Gamification Store ─────────────────────────
  const { 
    squadName, 
    squadMultiplier, 
    members: tribuMembers, 
    challenges: tribuChallenges, 
    checkInChallenge, 
    giveKudos 
  } = useTribuStore();
  const activeSquadChallenge = tribuChallenges[0] || null;
  const { markMyCheckinToday, recordProgress } = useGamificationStore();

  const activeClientId = useOnboardingPTStore(state => state.identity.fullName) || 'unknown';
  const clientHabits = prescribedHabits.filter(h => h.clientId === activeClientId);
  const { syncCheckIn } = useHabitSync(activeClientId);
  
  const today = fmtDate(new Date());

  // Auto-seed baseline habits if empty for this client
  useEffect(() => {
    if (clientHabits.length === 0 && activeClientId) {
      prescribeHabit(activeClientId, 'h_training', 'INDEFINITE', [1, 3, 5]); // Entreno Lun, Mié, Vie
      prescribeHabit(activeClientId, 'h_water', 'INDEFINITE', [1, 2, 3, 4, 5, 6, 7]); // 2L Agua diario
      prescribeHabit(activeClientId, 'h_veg', 'INDEFINITE', [1, 2, 3, 4, 5, 6, 7]); // 5 porciones verdura diario
      prescribeHabit(activeClientId, 'h_sleep_7h', 'INDEFINITE', [1, 2, 3, 4, 5, 6, 7]); // 7h Sueño diario
    }
  }, [activeClientId, clientHabits.length, prescribeHabit]);

  // Habits scheduled for today vs all
  const todayScheduledHabits = useMemo(() => {
    return clientHabits.filter(h => isHabitScheduledForDay(h, today));
  }, [clientHabits, today]);

  const todayHabitsCompletedCount = todayScheduledHabits.filter(h => h.completedDays.includes(today)).length;
  
  const completionRate = getDailyCompletionRate(activeClientId, today);
  const monthlyAdherence = getAdherence(activeClientId);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeToast, setActiveToast] = useState<{title: string, threshold: number, label: string} | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const [isGuideDismissed, setIsGuideDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('habits_guide_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissGuide = () => {
    setIsGuideDismissed(true);
    try {
      localStorage.setItem('habits_guide_dismissed', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const detailHabit = clientHabits.find(h => h.id === detailHabitId) || null;

  useEffect(() => {
    setIsCalendarExpanded(false);
  }, [detailHabitId]);

  const handleShareHabit = async (habitTitle: string) => {
    console.log('telemetry_event', { event: 'habit_share_clicked', habit: habitTitle, timestamp: new Date().toISOString() });
    
    const text = `Te reto a cumplir ${habitTitle} por 7 días. Descarga la app aquí: https://bienestar.app`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reto de Bienestar',
          text: text,
        });
      } catch (err) {
        console.log('Share cancelado o fallido', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto copiado al portapapeles. ¡Pégalo en WhatsApp o Telegram!');
    }
  };

  // Pre-computed calendar grid for the current month
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    const emptySlots = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < emptySlots; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(year, month, i));
    return cells;
  }, []);

  // Stats for the detail habit
  const detailStats = useMemo(() => {
    if (!detailHabit) return null;
    const start = new Date(detailHabit.startDate);
    const now = new Date();
    const daysActive = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const scheduledFraction = (detailHabit.scheduledDays?.length || 7) / 7;
    const expectedDays = Math.max(1, Math.round(daysActive * scheduledFraction));
    const adherence = expectedDays > 0 ? Math.round((detailHabit.completedDays.length / expectedDays) * 100) : 0;
    const highDays = Object.values(detailHabit.dailyZones).filter(z => z === 'HIGH').length;
    const highPct = detailHabit.completedDays.length > 0 ? Math.round((highDays / detailHabit.completedDays.length) * 100) : 0;
    let nextThreshold = HABIT_LEVEL_THRESHOLDS.find(t => t > detailHabit.streakCurrent) || 365;
    const daysToNext = nextThreshold - detailHabit.streakCurrent;
    const currentThreshold = detailHabit.level > 0 ? HABIT_LEVEL_THRESHOLDS[detailHabit.level - 1] : 0;
    const progressPct = nextThreshold > currentThreshold
      ? Math.min(100, ((detailHabit.streakCurrent - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
      : 100;

    return {
      daysActive,
      adherence: Math.min(100, adherence),
      highDays,
      highPct,
      daysToNext,
      progressPct
    };
  }, [detailHabit]);

  // Handlers for completing habits
  const handleBooleanToggle = (habitId: string) => {
    const habit = clientHabits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.templateId === 'h_training' && !habit.completedDays.includes(today)) {
      setShakeHabitId(habitId);
      setTooltipHabitId(habitId);
      setTimeout(() => setShakeHabitId(null), 500);
      setTimeout(() => setTooltipHabitId(null), 3000);
      return;
    }

    triggerHaptic();
    completeDay(habitId, today);
    setPulseHabitId(habitId);
    setTimeout(() => setPulseHabitId(null), 600);

    const isNowCompleted = !habit.completedDays.includes(today);
    if (isNowCompleted) {
      markMyCheckinToday(habitId);
      recordProgress({ source: 'HABIT_CHECKIN', value: 1 });
    }

    // Sincronización en segundo plano con PostgreSQL
    syncCheckIn({
      habitId: habit.serverId || habit.id,
      date: today,
      completed: isNowCompleted,
    });
  };

  const handleNumericChange = (habitId: string, newVal: number, maxTarget: number) => {
    triggerHaptic();
    const habit = clientHabits.find(h => h.id === habitId);
    const clampedVal = Math.max(0, Math.min(newVal, maxTarget * 2));
    completeDayWithValue(habitId, today, clampedVal);
    
    if (clampedVal >= maxTarget) {
      markMyCheckinToday(habitId);
      recordProgress({ source: 'HABIT_CHECKIN', value: 1 });
    }

    // Sincronización en segundo plano con PostgreSQL
    if (habit) {
      syncCheckIn({
        habitId: habit.serverId || habit.id,
        date: today,
        completed: clampedVal >= (maxTarget * 0.9),
        value: clampedVal,
      });
    }
  };

  // Check for perfect day celebration
  useEffect(() => {
    if (completionRate === 100 && todayScheduledHabits.length > 0 && lastConfettiDate !== today) {
      setShowConfetti(true);
      markConfettiSeen(today);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [completionRate, todayScheduledHabits.length, lastConfettiDate, today, markConfettiSeen]);

  const handleSanctuarySaveStreak = () => {
    if (sanctuaryHabitId) {
      completeDay(sanctuaryHabitId, today);
      setSanctuaryHabitId(null);
    }
  };

  const handleSanctuaryRegisterFail = () => {
    setSanctuaryHabitId(null);
  };

  const getGradientId = (rate: number) => {
    if (rate === 100) return 'grad-100';
    if (rate >= 90) return 'grad-90';
    if (rate >= 50) return 'grad-50';
    return 'grad-0';
  };

  return (
    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden font-lato flex flex-col transition-all duration-500">
      <PerfectDayCelebration 
        active={showConfetti} 
        onClose={() => setShowConfetti(false)}
        onShare={() => {
          setShowConfetti(false);
          setIsShareStickerOpen(true);
        }}
      />

      {/* Header (Always Visible & Mobile-Optimized) */}
      <div 
        className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-2.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            completionRate === 100 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
              : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
          }`}>
            {completionRate === 100 ? <CheckCircle2 size={20} className="text-emerald-500" /> : <CheckSquare size={20} className="text-violet-500 dark:text-violet-400" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black font-montserrat text-slate-900 dark:text-white tracking-tight leading-tight">
              {isCollapsed && completionRate === 100 ? '¡Día Perfecto! 🎉' : 'Hábitos de Hoy'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
              {completionRate === 100 ? 'Todos listos' : `${todayHabitsCompletedCount}/${todayScheduledHabits.length} listos hoy`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón "+ Nuevo" Rápido */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsCreateHabitModalOpen(true); 
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all active:scale-95"
            title="Crear un nuevo hábito"
          >
            <Plus size={14} />
            <span className="text-[11px]">Nuevo</span>
          </button>

          {/* Share Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsShareStickerOpen(true); }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
              completionRate === 100 
                ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
            }`}
            title="Compartir en Historias"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline text-[11px]">Compartir</span>
          </button>

          {/* Toggle Expand/Collapse */}
          <button 
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronUp size={16} className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            
            {/* Top Compact Progress Banner */}
            <div className="p-4 bg-slate-50/80 dark:bg-zinc-950/40 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="grad-100" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="grad-90" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="grad-50" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                      <linearGradient id="grad-0" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="none" className="stroke-slate-200 dark:stroke-zinc-800" strokeWidth="12" />
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      fill="none" 
                      stroke={`url(#${getGradientId(completionRate)})`}
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 264" }}
                      animate={{ strokeDasharray: `${(completionRate / 100) * 264} 264` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black font-montserrat text-slate-800 dark:text-white">
                      {completionRate}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black font-montserrat text-slate-800 dark:text-white">
                    {completionRate === 100 ? '¡Racha Impecable! 🔥' : 'Progreso de Hoy'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {completionRate === 100 
                      ? 'Has completado todos tus hábitos del día.' 
                      : `Faltan ${Math.max(0, todayScheduledHabits.length - todayHabitsCompletedCount)} hábitos para un día perfecto.`}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1 font-mono">
                  <Flame size={14} className="fill-amber-500" /> {todayHabitsCompletedCount}/{todayScheduledHabits.length}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Listos Hoy</span>
              </div>
            </div>

            {/* Habit List & Retos (Scrollable Vertical) */}
            <div className="w-full p-4 space-y-4 bg-white dark:bg-zinc-900/60">
              
              {/* Pedagogical Banner: Dismissible Initial Guide */}
              <AnimatePresence>
                {!isGuideDismissed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between gap-2.5 shadow-xs overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        💡
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-snug">
                          Toca cualquier hábito para ver su historial, racha y días
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          Puedes programar qué días entrenas (ej: L-X-V) y revisar tu consistencia.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleDismissGuide}
                      className="w-6 h-6 rounded-lg bg-indigo-100/60 dark:bg-white/10 hover:bg-indigo-200 dark:hover:bg-white/20 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-colors shrink-0"
                      title="Entendido (No volver a mostrar)"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Segmented Control */}
              <div className="flex bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-2xl shadow-inner border border-slate-200/50 dark:border-white/5">
                <button 
                  onClick={() => setActiveTab('PERSONAL')} 
                  className={`flex-1 text-xs font-black uppercase py-2.5 rounded-xl transition-all duration-300 ${activeTab === 'PERSONAL' ? 'bg-white dark:bg-zinc-900 shadow-sm text-indigo-600 dark:text-indigo-400 scale-100' : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50 scale-[0.98]'}`}
                >
                  Mis Hábitos ({clientHabits.length})
                </button>
                <button 
                  onClick={() => setActiveTab('SQUAD')} 
                  className={`flex-1 text-xs font-black uppercase py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'SQUAD' ? 'bg-white dark:bg-zinc-900 shadow-sm text-emerald-600 dark:text-emerald-400 scale-100' : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-200/50 dark:hover:bg-zinc-700/50 scale-[0.98]'}`}
                >
                  <Users size={14} className={activeTab === 'SQUAD' ? 'text-emerald-500' : ''} />
                  Retos Tribu
                </button>
              </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeTab === 'PERSONAL' && (
                  clientHabits.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-slate-50 dark:bg-zinc-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl">
                        ✨
                      </div>
                      <h4 className="text-sm font-black font-montserrat text-slate-800 dark:text-white">
                        Aún no tienes hábitos configurados
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Crea hábitos para entrenar, hidratarte, descansar y desbloquear recompensas y XP.
                      </p>
                      <button
                        onClick={() => setIsCreateHabitModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                      >
                        <Plus size={14} />
                        <span>Crear mi Primer Hábito</span>
                      </button>
                    </div>
                  ) : (
                    CATEGORY_ORDER.map(cat => {
                      const catHabits = clientHabits.filter(h => h.category === cat);
                      if (catHabits.length === 0) return null;
                      
                      const meta = CATEGORY_META[cat];
                      const scheduledInCat = catHabits.filter(h => isHabitScheduledForDay(h, today));
                      const completedInCat = scheduledInCat.filter(h => h.completedDays.includes(today)).length;

                      return (
                        <div key={cat} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                              <span>{meta.icon}</span> {meta.label}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full transition-colors">
                              {completedInCat} / {scheduledInCat.length} hoy
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {catHabits.map(habit => {
                              const isScheduledToday = isHabitScheduledForDay(habit, today);
                              const isCompleted = habit.completedDays.includes(today);
                              const zone = getCompletionZone(habit, today);
                              const val = habit.dailyValues[today] ?? 0;
                              const currentDayIso = getDayOfWeekISO(today);

                              return (
                                <div 
                                  key={habit.id} 
                                  className={`group relative p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                    isCompleted 
                                      ? 'bg-white dark:bg-zinc-800/80 border-indigo-100 dark:border-indigo-500/20 shadow-sm' 
                                      : isScheduledToday
                                        ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/30'
                                        : 'bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200/50 dark:border-white/5 opacity-75'
                                  }`}
                                >
                                  {pulseHabitId === habit.id && (
                                    <motion.div
                                      initial={{ opacity: 1, scale: 1 }}
                                      animate={{ opacity: 0, scale: 1.05 }}
                                      transition={{ duration: 0.4, ease: "easeOut" }}
                                      className="absolute inset-0 rounded-2xl bg-emerald-400/20 border-2 border-emerald-400 pointer-events-none"
                                    />
                                  )}

                                  {/* LEFT ZONE: Click opens Bottom Sheet for stats & schedule */}
                                  <button 
                                    onClick={() => setDetailHabitId(habit.id)}
                                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-90 transition-opacity cursor-pointer"
                                    title="Toca para ver historial, racha y editar días de entreno"
                                  >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                                      isCompleted ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-slate-100 dark:bg-zinc-800'
                                    }`}>
                                      {habit.isCustom ? '✨' : (HABIT_CATALOG.find(h => h.id === habit.templateId)?.icon || '✨')}
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <h4 className={`text-xs font-black transition-colors ${
                                          isCompleted ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-zinc-200'
                                        }`}>
                                          {habit.title}
                                        </h4>
                                        <span className="text-[9px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1 py-0.2 rounded flex items-center gap-0.5 shrink-0">
                                          <Flame size={9} className="fill-amber-500" /> {habit.streakCurrent}d
                                        </span>
                                      </div>

                                      {/* Micro-Pills of Scheduled Days */}
                                      <div className="flex items-center gap-1.5 mt-1">
                                        <div className="flex items-center gap-0.5">
                                          {DAY_LABELS_SHORT.map(d => {
                                            const isDayActive = (habit.scheduledDays || [1, 2, 3, 4, 5, 6, 7]).includes(d.id);
                                            const isTodayThisDay = currentDayIso === d.id;
                                            return (
                                              <span
                                                key={d.id}
                                                className={`w-3.5 h-3.5 rounded text-[7px] font-black flex items-center justify-center transition-all ${
                                                  isDayActive
                                                    ? isTodayThisDay
                                                      ? 'bg-indigo-600 text-white shadow-xs'
                                                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                                    : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-300 dark:text-zinc-600'
                                                }`}
                                                title={d.name}
                                              >
                                                {d.label}
                                              </span>
                                            );
                                          })}
                                        </div>

                                        {!isScheduledToday && (
                                          <span className="text-[8px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                                            Descanso hoy
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </button>

                                  {/* RIGHT CONTROLS */}
                                  <div className="shrink-0 flex items-center justify-end">
                                    {/* INPUT TYPE: BOOLEAN */}
                                    {habit.inputType === 'BOOLEAN' && (
                                      <div className="relative">
                                        <motion.button
                                          animate={shakeHabitId === habit.id ? { x: [-3, 3, -3, 3, 0] } : {}}
                                          transition={{ duration: 0.3 }}
                                          onClick={() => handleBooleanToggle(habit.id)}
                                          className={`relative w-12 h-7 rounded-full transition-colors ${
                                            isCompleted ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-zinc-700'
                                          }`}
                                        >
                                          <motion.div
                                            initial={false}
                                            animate={{ x: isCompleted ? 22 : 3 }}
                                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center"
                                          >
                                            {isCompleted && <CheckCircle2 size={12} className="text-indigo-500" />}
                                          </motion.div>
                                        </motion.button>
                                        <AnimatePresence>
                                          {tooltipHabitId === habit.id && (
                                            <motion.div 
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              exit={{ opacity: 0, y: 10 }}
                                              className="absolute right-0 top-10 w-48 sm:w-64 bg-slate-800 text-white text-xs p-3 rounded-xl shadow-xl z-50 font-lato pointer-events-none"
                                            >
                                              Este hábito se conquista automáticamente al finalizar tu sesión de entrenamiento de hoy.
                                              <div className="absolute -top-1 right-5 w-3 h-3 bg-slate-800 transform rotate-45"></div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )}

                                    {/* INPUT TYPE: NUMERIC */}
                                    {habit.inputType === 'NUMERIC' && habit.targetValue && (
                                      <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-950/50 rounded-xl p-0.5 border border-slate-200 dark:border-white/5 transition-colors">
                                          <button 
                                            onClick={() => handleNumericChange(habit.id, val - (habit.targetValue! * 0.1), habit.targetValue!)}
                                            className="w-6 h-6 rounded-lg hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 transition-colors shadow-sm text-xs font-bold"
                                          >
                                            <Minus size={12} />
                                          </button>
                                          <div className="w-12 text-center font-black text-slate-800 dark:text-zinc-200 text-xs flex items-center justify-center gap-0.5">
                                            <span>{Math.round(val)}</span>
                                            <span className="text-[8px] text-slate-400 dark:text-zinc-500 uppercase">{habit.unit}</span>
                                          </div>
                                          <button 
                                            onClick={() => handleNumericChange(habit.id, val + (habit.targetValue! * 0.1), habit.targetValue!)}
                                            className="w-6 h-6 rounded-lg hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400 transition-colors shadow-sm text-xs font-bold"
                                          >
                                            <Plus size={12} />
                                          </button>
                                        </div>
                                        <div className="flex items-center justify-between w-full gap-1.5">
                                          <div className="w-14 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div 
                                              animate={{ width: `${Math.min(100, (val / habit.targetValue) * 100)}%` }}
                                              className={`h-full rounded-full transition-colors ${
                                                zone === 'HIGH' ? 'bg-indigo-500' : zone === 'LOW' ? 'bg-amber-400' : 'bg-slate-300'
                                              }`}
                                            />
                                          </div>
                                          <span className="text-[8px] font-bold text-slate-400">
                                            /{habit.targetValue}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )
                )}

                {activeTab === 'SQUAD' && (
                  <div className="space-y-6">
                    {/* Retos Tribu Activos — Luminous & Friendly Aesthetic */}
                    {activeSquadChallenge ? (
                      <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-pink-50/40 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-zinc-900 border border-indigo-100/80 dark:border-indigo-500/20 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 font-montserrat">
                            <Flame size={14} className="text-orange-500 fill-orange-500" />
                            Reto Semanal de Tribu
                          </span>
                          <span className="text-[10px] font-bold bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                            x{squadMultiplier} Multiplicador
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-black font-montserrat text-slate-900 dark:text-white leading-tight">
                            {activeSquadChallenge.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
                            {activeSquadChallenge.description}
                          </p>
                        </div>

                        {/* Barra de Progreso del Reto */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-zinc-300">
                            <span>Progreso de Tribu</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-black">
                              {activeSquadChallenge.currentValue} / {activeSquadChallenge.targetValue} {activeSquadChallenge.unit}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500 shadow-xs"
                              style={{ width: `${Math.min(100, (activeSquadChallenge.currentValue / (activeSquadChallenge.targetValue || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedChallengeId(activeSquadChallenge.id)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                          >
                            Ver Detalles y Tabla
                          </button>

                          <button
                            onClick={() => {
                              checkInChallenge(activeSquadChallenge.id);
                              triggerHaptic();
                            }}
                            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                          >
                            <CheckCircle2 size={15} />
                            <span>Sumar al Reto</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-50 dark:bg-zinc-950/40 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 space-y-3">
                        <p className="text-xs text-slate-400">No hay un reto activo en tu escuadrón actualmente.</p>
                        <button
                          onClick={() => setIsCreateChallengeModalOpen(true)}
                          className="py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                        >
                          + Crear Primer Reto
                        </button>
                      </div>
                    )}

                    {/* Actividad del Squad */}
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400 flex items-center gap-2 font-montserrat">
                          <Flame size={15} className="text-orange-500" />
                          Actividad del Squad ({tribuMembers.length} Atletas)
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400">Estado de Hoy</span>
                      </div>

                      <div className="space-y-2.5">
                        {tribuMembers.map((member) => (
                          <div 
                            key={member.id} 
                            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5 transition-all hover:bg-slate-100/80 dark:hover:bg-black/40"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={member.avatarUrl}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                                />
                                {member.dailyCompletionRate === 100 && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white dark:border-black flex items-center justify-center text-[7px] text-white font-bold">
                                    ✓
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                    {member.isCurrentUser ? `${member.name}` : member.name}
                                  </p>
                                  {member.isGuest && (
                                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase">
                                      Invitado
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-1">
                                  <span className="font-bold text-slate-500 dark:text-zinc-400">{member.role}</span>
                                  <span>•</span>
                                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                    <Flame size={9} /> {member.streakDays}d racha
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Estado y Acción de Ánimo */}
                            <div className="flex items-center gap-2">
                              {member.dailyCompletionRate === 100 ? (
                                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle2 size={11} /> 100% Hoy
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    giveKudos('f1');
                                    if (navigator.vibrate) navigator.vibrate(50);
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-[10px] font-black flex items-center gap-1 transition-all active:scale-95"
                                  title="Enviar recordatorio y ánimo"
                                >
                                  <Flame size={11} className="fill-orange-500" />
                                  <span>Dar Ánimo</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botones de Acción del Squad */}
                      <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-white/5">
                        <button
                          onClick={() => setIsInviteModalOpen(true)}
                          className="py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/30 dark:hover:bg-pink-950/50 text-pink-700 dark:text-pink-300 border border-pink-200/50 dark:border-pink-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <UserPlus size={14} className="text-pink-500" />
                          <span>Invitar Atleta</span>
                        </button>

                        <button
                          onClick={() => setIsCreateChallengeModalOpen(true)}
                          className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                        >
                          <Plus size={14} className="text-indigo-500" />
                          <span>Nuevo Reto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Lally Milestone Toast Overlay */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ y: 50, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: 50, opacity: 0, x: '-50%' }}
            className="absolute bottom-8 left-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-300">¡Hito de consistencia!</p>
              <p className="text-sm font-black font-montserrat">
                <span className="text-amber-400">{activeToast.title}</span>: {activeToast.threshold} días
              </p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Nivel desbloqueado: {activeToast.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* BOTTOM SHEET: Habit Drilldown & Weekday Schedule Editor    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailHabit && detailStats && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailHabitId(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: '-45%', x: '-50%', scale: 0.95 }}
              animate={{ opacity: 1, y: '-50%', x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: '-45%', x: '-50%', scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 w-[95%] max-w-xl z-[101] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto transition-colors font-lato"
            >

              {/* Sheet Header */}
              <div className="px-6 pb-4 pt-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors ${
                    detailHabit.completedDays.includes(today) ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-slate-100 dark:bg-zinc-800'
                  }`}>
                    {detailHabit.isCustom ? '✨' : (HABIT_CATALOG.find(h => h.id === detailHabit.templateId)?.icon || '✨')}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black font-montserrat text-slate-900 dark:text-white leading-tight transition-colors">
                      {detailHabit.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border transition-colors ${
                        detailHabit.type === 'BUILD' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400'
                      }`}>{detailHabit.type}</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500">
                        {CATEGORY_META[detailHabit.category]?.label || detailHabit.category}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setDetailHabitId(null)} 
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* KPI Cards */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-3.5 text-center border border-slate-100 dark:border-white/5 transition-colors">
                    <Flame size={16} className="mx-auto text-amber-500 dark:text-amber-400 mb-1" />
                    <p className="text-xl font-black font-montserrat text-slate-800 dark:text-white">{detailHabit.streakCurrent}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mt-0.5">Racha Actual</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-3.5 text-center border border-slate-100 dark:border-white/5 transition-colors">
                    <Trophy size={16} className="mx-auto text-amber-500 dark:text-amber-400 mb-1" />
                    <p className="text-xl font-black font-montserrat text-slate-800 dark:text-white">{detailHabit.streakBest}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mt-0.5">Mejor Racha</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-3.5 text-center border border-slate-100 dark:border-white/5 transition-colors">
                    <Zap size={16} className="mx-auto text-indigo-500 dark:text-indigo-400 mb-1" />
                    <p className="text-xl font-black font-montserrat text-slate-800 dark:text-white">{detailStats.adherence}%</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mt-0.5">Adherencia</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-3.5 text-center border border-slate-100 dark:border-white/5 transition-colors">
                    <Target size={16} className="mx-auto text-emerald-500 dark:text-emerald-400 mb-1" />
                    <p className="text-xl font-black font-montserrat text-slate-800 dark:text-white">{detailStats.highPct}%</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mt-0.5">Zona Alta</p>
                  </div>
                </div>
              </div>

              {/* Interactive Weekday Schedule Selector */}
              <div className="px-6 pb-4">
                <div className="bg-slate-50 dark:bg-zinc-900/70 rounded-2xl p-4 border border-slate-100 dark:border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 font-montserrat">
                      <Calendar size={13} className="text-indigo-500" />
                      Días programados de la semana:
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                      {getHabitDaysSummary(detailHabit.scheduledDays)}
                    </span>
                  </div>

                  {/* Botones de Días L M X J V S D */}
                  <div className="flex items-center justify-between gap-1">
                    {DAY_LABELS_SHORT.map(d => {
                      const currentDays = detailHabit.scheduledDays || [1, 2, 3, 4, 5, 6, 7];
                      const isDayActive = currentDays.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            let nextDays: number[];
                            if (isDayActive) {
                              if (currentDays.length <= 1) return; // Mínimo 1 día
                              nextDays = currentDays.filter(day => day !== d.id);
                            } else {
                              nextDays = [...currentDays, d.id].sort();
                            }
                            updateHabitSchedule(detailHabit.id, nextDays);
                            triggerHaptic();
                          }}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                            isDayActive
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 scale-105'
                              : 'bg-white dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-200/80 dark:border-white/5 hover:border-indigo-300'
                          }`}
                          title={d.name}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Atajos Rápidos */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => updateHabitSchedule(detailHabit.id, [1, 2, 3, 4, 5, 6, 7])}
                      className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                    >
                      ⚡ Todos los días
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHabitSchedule(detailHabit.id, [1, 3, 5])}
                      className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                    >
                      🏋️ Lun · Mié · Vie
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHabitSchedule(detailHabit.id, [2, 4, 6])}
                      className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                    >
                      🔥 Mar · Jue · Sáb
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHabitSchedule(detailHabit.id, [1, 2, 3, 4, 5])}
                      className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-600"
                    >
                      💼 Días Laborales
                    </button>
                  </div>
                </div>
              </div>

              {/* Lally Progress Bar */}
              <div className="px-6 pb-4">
                <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-4 border border-slate-100 dark:border-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                      Automatización (Lally et al.)
                    </h4>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5">
                      Faltan {detailStats.daysToNext}d para Nv.{detailHabit.level + 1}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden transition-colors">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${detailStats.progressPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    />
                  </div>
                  <div className="flex justify-between mt-2.5">
                    {HABIT_LEVEL_THRESHOLDS.slice(0, 5).map((t, i) => (
                      <div key={t} className="flex flex-col items-center gap-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${detailHabit.streakCurrent >= t ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
                        <span className={`text-[8px] font-bold transition-colors ${detailHabit.streakCurrent >= t ? 'text-slate-700 dark:text-zinc-200' : 'text-slate-400 dark:text-zinc-600'}`}>{t}d</span>
                        <span className={`text-[7px] font-bold transition-colors ${detailHabit.streakCurrent >= t ? 'text-slate-600 dark:text-zinc-400' : 'text-slate-400 dark:text-zinc-600'}`}>{HABIT_LEVEL_LABELS[i + 1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collapsible Monthly Calendar Heatmap (Closed by default to eliminate scroll) */}
              <div className="px-6 pb-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/5 transition-all overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CalendarDays size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 font-montserrat truncate">
                        Registro de Consistencia
                      </h4>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full capitalize shrink-0">
                        {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {isCalendarExpanded ? 'Ocultar' : 'Ver Calendario'}
                      </span>
                      <ChevronUp 
                        size={15} 
                        className={`transform transition-transform duration-300 ${isCalendarExpanded ? '' : 'rotate-180'}`} 
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isCalendarExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-white/5 overflow-hidden"
                      >
                        <div className="grid grid-cols-7 gap-1 pt-2">
                          {['L','M','X','J','V','S','D'].map(d => (
                            <div key={d} className="text-center text-[9px] font-black text-slate-400 dark:text-zinc-600 pb-1">{d}</div>
                          ))}
                          {calendarDays.map((date, i) => {
                            if (!date) return <div key={`empty-${i}`} className="w-full aspect-square" />;
                            const key = fmtDate(date);
                            const isComp = detailHabit.completedDays.includes(key);
                            const zone = getCompletionZone(detailHabit, key);
                            const isToday = key === today;
                            const isFuture = date > new Date();

                            let bgClass = 'bg-slate-50 dark:bg-zinc-950 text-slate-400 dark:text-zinc-600 border border-slate-100 dark:border-white/5';
                            if (isComp) {
                              if (zone === 'HIGH') bgClass = 'bg-indigo-600 text-white border-transparent shadow-xs';
                              else if (zone === 'LOW') bgClass = 'bg-indigo-400 text-white border-transparent';
                            }

                            return (
                              <div
                                key={i}
                                className={`
                                  w-full aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center transition-colors
                                  ${isFuture ? 'opacity-30 bg-slate-50 dark:bg-zinc-900 text-slate-300' : ''}
                                  ${bgClass}
                                  ${isToday && !isComp ? 'ring-2 ring-indigo-500' : ''}
                                `}
                              >
                                {date.getDate()}
                              </div>
                            );
                          })}
                        </div>

                        <p className="text-[9px] text-slate-400 dark:text-zinc-500 mt-3 text-center font-medium bg-slate-50 dark:bg-zinc-950/50 py-1.5 rounded-lg">
                          {detailHabit.inputType === 'NUMERIC'
                            ? 'Tonos oscuros = meta 100%. Tonos claros = meta parcial (≥90%).'
                            : 'Cada celda coloreada indica un día completado.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom Actions: Delete / Close */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <button
                  onClick={() => {
                    if (window.confirm(`¿Deseas eliminar el hábito "${detailHabit.title}"?`)) {
                      removeHabit(detailHabit.id);
                      setDetailHabitId(null);
                      triggerHaptic();
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 size={14} />
                  <span>Eliminar Hábito</span>
                </button>

                <button
                  onClick={() => setDetailHabitId(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 font-black text-xs transition-all shadow-sm"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Positive Friction (Mindset Sanctuary) */}
      <AnimatePresence>
        {sanctuaryHabitId && (
          <MindsetSanctuary 
            onSaveStreak={handleSanctuarySaveStreak}
            onRegisterFail={handleSanctuaryRegisterFail}
          />
        )}
      </AnimatePresence>

      {/* Share Sticker Modal */}
      <StatsStickerShare 
        isOpen={isShareStickerOpen} 
        onClose={() => setIsShareStickerOpen(false)} 
        completionRate={completionRate} 
        monthlyAdherence={monthlyAdherence} 
      />

      {/* Tribu & Squad Challenge Modals */}
      <InviteToSquadModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <CreateSquadChallengeModal
        isOpen={isCreateChallengeModalOpen}
        onClose={() => setIsCreateChallengeModalOpen(false)}
      />

      <SquadChallengeDetailModal
        challengeId={selectedChallengeId}
        isOpen={!!selectedChallengeId}
        onClose={() => setSelectedChallengeId(null)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
      />

      {/* Modal de Creación Rápida de Hábitos */}
      <CreateHabitModal
        isOpen={isCreateHabitModalOpen}
        onClose={() => setIsCreateHabitModalOpen(false)}
        activeClientId={activeClientId}
      />
    </div>
  );
};

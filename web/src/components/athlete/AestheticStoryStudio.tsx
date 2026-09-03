import React, { useRef, useState, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { 
  Share2, CheckCircle2, TrendingUp, X, Camera, Image as ImageIcon, 
  Sparkles, Download, Flame, Trophy, Dumbbell, Target, Layers, 
  Sliders, MoveVertical, Eye, Palette, ZoomIn, ZoomOut, Moon, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore, getLevelTitle } from '../../stores/useGamificationStore';
import { useHabitStore } from '../../stores/useHabitStore';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { usePlanBuilderStore, type RoutineExercise } from '../../stores/usePlanBuilderStore';
import { useNutritionStore } from '../../stores/useNutritionStore';

export type StoryCategory = 'HABITS' | 'WORKOUT' | 'NUTRITION';
export type AestheticStyle = 'GLASS_MINIMAL' | 'BOLD_SPORT' | 'COMPACT_PILL';
export type StickerPosition = 'TOP' | 'CENTER' | 'BOTTOM';
export type BackgroundMode = 'CUSTOM_PHOTO' | 'GRADIENT_MIDNIGHT' | 'GRADIENT_NEON' | 'GRADIENT_SUNSET' | 'TRANSPARENT_STICKER';

export interface AestheticStoryStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: StoryCategory;
  completionRate?: number;
  monthlyAdherence?: number;
  workoutData?: {
    workoutName?: string;
    totalVolumeKg?: number;
    totalSets?: number;
    durationMinutes?: number;
    rpe?: number;
  };
  nutritionData?: {
    calories?: number;
    targetCalories?: number;
    proteinG?: number;
    targetProteinG?: number;
    carbsG?: number;
    fatsG?: number;
    completedMeals?: number;
    totalMeals?: number;
  };
}

export const AestheticStoryStudio: React.FC<AestheticStoryStudioProps> = ({
  isOpen,
  onClose,
  initialCategory = 'HABITS',
  completionRate: propCompletionRate,
  monthlyAdherence: propMonthlyAdherence,
  workoutData: propWorkoutData,
  nutritionData: propNutritionData
}) => {
  const storyCanvasRef = useRef<HTMLDivElement>(null);
  const stickerSoloRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [category, setCategory] = useState<StoryCategory>(initialCategory);
  const [aestheticStyle, setAestheticStyle] = useState<AestheticStyle>('GLASS_MINIMAL');
  const [bgMode, setBgMode] = useState<BackgroundMode>('CUSTOM_PHOTO');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [stickerScale, setStickerScale] = useState<number>(100); // 70 to 125 %
  const [stickerPosition, setStickerPosition] = useState<StickerPosition>('CENTER');
  const [darkOverlayOpacity, setDarkOverlayOpacity] = useState<number>(40); // 0 to 80%
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMode, setExportMode] = useState<'FULL_STORY' | 'SOLO_STICKER'>('FULL_STORY');
  const [showToolsDrawer, setShowToolsDrawer] = useState<boolean>(false);

  // Stores
  const { level, totalXP } = useGamificationStore();
  const activeClientId = useOnboardingPTStore(state => state.identity.fullName) || 'unknown';
  const rawStreak = useHabitStore(s => s.getDailyStreak(activeClientId)) || 1;
  const storeAdherence = useHabitStore(s => s.getAdherence(activeClientId)) || 94;
  const storeCompletion = useHabitStore(s => s.getDailyCompletionRate(activeClientId, new Date().toISOString().split('T')[0])) || 100;

  const { days, nutrition: planNutrition } = usePlanBuilderStore();
  const getDailyMacroProgress = useNutritionStore(s => s.getDailyMacroProgress);
  const storeCompletedMeals = useNutritionStore(s => s.completedMeals);
  const storeDailyMealPlan = useNutritionStore(s => s.dailyMealPlan);

  // Derived Data
  const habitStats = useMemo(() => ({
    completionRate: propCompletionRate ?? storeCompletion,
    monthlyAdherence: propMonthlyAdherence ?? storeAdherence,
    streak: rawStreak
  }), [propCompletionRate, storeCompletion, propMonthlyAdherence, storeAdherence, rawStreak]);

  const workoutStats = useMemo(() => {
    if (propWorkoutData) {
      return {
        name: propWorkoutData.workoutName || 'Sesión de Fuerza & Potencia',
        volumeKg: propWorkoutData.totalVolumeKg || 4250,
        sets: propWorkoutData.totalSets || 16,
        durationMin: propWorkoutData.durationMinutes || 48,
        rpe: propWorkoutData.rpe || 8.5
      };
    }
    const activeDay = days[0];
    const exercises = (activeDay?.items?.filter(i => i.type === 'EXERCISE') || []) as RoutineExercise[];
    const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 3), 0) || 15;
    return {
      name: activeDay?.name || 'Torso & Empuje Funcional',
      volumeKg: totalSets * 260,
      sets: totalSets,
      durationMin: totalSets * 3,
      rpe: 8.5
    };
  }, [propWorkoutData, days]);

  const nutritionStats = useMemo(() => {
    if (propNutritionData) {
      return {
        calories: propNutritionData.calories || 2150,
        targetCalories: propNutritionData.targetCalories || 2200,
        protein: propNutritionData.proteinG || 160,
        targetProtein: propNutritionData.targetProteinG || 160,
        carbs: propNutritionData.carbsG || 220,
        fats: propNutritionData.fatsG || 65,
        mealsDone: propNutritionData.completedMeals || 4,
        totalMeals: propNutritionData.totalMeals || 4
      };
    }
    const consumed = getDailyMacroProgress();
    const targetCals = parseInt(planNutrition?.calories) || 2200;
    const targetProt = parseInt(planNutrition?.protein) || 160;
    return {
      calories: consumed.calories > 0 ? consumed.calories : 2150,
      targetCalories: targetCals,
      protein: consumed.protein > 0 ? consumed.protein : 160,
      targetProtein: targetProt,
      carbs: consumed.carbs > 0 ? consumed.carbs : 210,
      fats: consumed.fats > 0 ? consumed.fats : 60,
      mealsDone: Object.keys(storeCompletedMeals).length || 4,
      totalMeals: storeDailyMealPlan.length || 4
    };
  }, [propNutritionData, getDailyMacroProgress, planNutrition, storeCompletedMeals, storeDailyMealPlan]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
      setBgMode('CUSTOM_PHOTO');
    }
  };

  const handleExportOrShare = async () => {
    const targetNode = exportMode === 'SOLO_STICKER' ? stickerSoloRef.current : storyCanvasRef.current;
    if (!targetNode) return;

    try {
      setIsExporting(true);

      const isTransparent = exportMode === 'SOLO_STICKER' || bgMode === 'TRANSPARENT_STICKER';
      
      const dataUrl = await toPng(targetNode, {
        quality: 1,
        pixelRatio: 3,
        style: { transform: 'scale(1)' },
        backgroundColor: isTransparent ? undefined : '#090d16'
      });

      const fileName = `habits-${category.toLowerCase()}-${Date.now()}.png`;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Mi Progreso en Habits. ✨`,
          text: `¡Día cumplido en @Habits! Nivel ${level} • ${getLevelTitle(level)} 🔥`,
          files: [file]
        });
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error exporting story image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] bg-black/95 sm:bg-black/90 backdrop-blur-md flex flex-col items-center justify-between overflow-hidden font-lato text-white select-none">
        
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* HEADER SUPERIOR MÓVIL / DESKTOP                            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <header className="w-full max-w-4xl px-4 py-3 sm:py-4 flex items-center justify-between z-30 shrink-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
          {/* Botón Salir */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all active:scale-90"
          >
            <X size={18} />
          </button>

          {/* Logo Central Oficial Habits. */}
          <div className="flex items-center gap-2">
            <img 
              src="/Logo Habits.jpeg" 
              alt="Habits Icon" 
              className="w-7 h-7 rounded-full object-cover shadow-md ring-1 ring-white/20" 
            />
            <span className="font-bold text-base tracking-tight text-white font-montserrat flex items-center leading-none">
              Habits<span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-rose-400 font-black text-lg">.</span>
              <span className="text-[10px] text-indigo-400 font-black ml-1 uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">Studio</span>
            </span>
          </div>

          {/* Botón de Cámara Rápida */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-montserrat font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Camera size={14} />
            <span className="hidden sm:inline">{customPhotoUrl ? 'Cambiar Foto' : 'Mi Foto'}</span>
            <span className="sm:hidden">Foto</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </header>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ÁREA CENTRAL: HERO STORY CANVAS 9:16                      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <main className="flex-1 w-full max-w-4xl flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
          
          {/* El lienzo Story 9:16 maximizado en móviles */}
          <div className="relative h-full max-h-[58vh] sm:max-h-[64vh] md:max-h-[68vh] aspect-[9/16] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-2 sm:border-4 border-slate-800 shadow-2xl flex items-center justify-center bg-slate-950">
            <div
              ref={storyCanvasRef}
              className={`w-full h-full relative flex flex-col justify-between p-4 sm:p-6 overflow-hidden transition-all select-none ${
                bgMode === 'GRADIENT_MIDNIGHT'
                  ? 'bg-gradient-to-b from-[#0B0F19] via-[#111827] to-[#070A10]'
                  : bgMode === 'GRADIENT_NEON'
                  ? 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950'
                  : bgMode === 'GRADIENT_SUNSET'
                  ? 'bg-gradient-to-b from-rose-950 via-purple-950 to-slate-950'
                  : bgMode === 'TRANSPARENT_STICKER'
                  ? 'bg-transparent'
                  : 'bg-black'
              }`}
              style={
                bgMode === 'CUSTOM_PHOTO' && customPhotoUrl
                  ? {
                      backgroundImage: `url(${customPhotoUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }
                  : undefined
              }
            >
              {/* Overlay oscuro graduable para legibilidad sobre fotos */}
              {bgMode === 'CUSTOM_PHOTO' && (
                <div
                  className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                  style={{ opacity: darkOverlayOpacity / 100 }}
                />
              )}

              {/* Header Superior del Story (Branding Habits. & Nivel) */}
              <div className="relative z-10 w-full flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white shadow-lg">
                  <img 
                    src="/Logo Habits.jpeg" 
                    alt="Habits Icon" 
                    className="w-3.5 h-3.5 rounded-full object-cover shadow-sm ring-1 ring-white/30" 
                  />
                  <span className="font-bold text-[11px] tracking-tight text-white font-montserrat flex items-center leading-none">
                    Habits<span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 to-rose-400 font-black text-xs">.</span>
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white flex items-center gap-1.5 shadow-lg">
                  <Trophy size={11} className="text-amber-400" />
                  <span className="text-[9px] font-bold font-montserrat">
                    Nivel {level} • {getLevelTitle(level)}
                  </span>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* STICKER FLOTANTE POSICIONABLE & ESCALABLE                  */}
              {/* ═══════════════════════════════════════════════════════════ */}
              <div
                className={`relative z-10 w-full flex items-center justify-center transition-all ${
                  stickerPosition === 'TOP'
                    ? 'my-1'
                    : stickerPosition === 'BOTTOM'
                    ? 'mt-auto mb-1'
                    : 'my-auto'
                }`}
              >
                <div
                  ref={stickerSoloRef}
                  style={{ transform: `scale(${stickerScale / 100})`, transformOrigin: 'center' }}
                  className="transition-transform duration-200"
                >
                  {aestheticStyle === 'GLASS_MINIMAL' && (
                    <GlassMinimalSticker
                      category={category}
                      habitStats={habitStats}
                      workoutStats={workoutStats}
                      nutritionStats={nutritionStats}
                    />
                  )}

                  {aestheticStyle === 'BOLD_SPORT' && (
                    <BoldSportSticker
                      category={category}
                      habitStats={habitStats}
                      workoutStats={workoutStats}
                      nutritionStats={nutritionStats}
                    />
                  )}

                  {aestheticStyle === 'COMPACT_PILL' && (
                    <CompactPillSticker
                      category={category}
                      habitStats={habitStats}
                      workoutStats={workoutStats}
                      nutritionStats={nutritionStats}
                    />
                  )}
                </div>
              </div>

              {/* Footer Inferior del Story (Fecha) */}
              <div className="relative z-10 w-full flex items-center justify-center">
                <div className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 text-[8px] font-mono tracking-widest uppercase">
                  • {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())} •
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* FOOTER INTERACTIVO MÓVIL-FIRST: CONTROLES DIRECTOS        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <footer className="w-full max-w-4xl bg-slate-950/95 border-t border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 z-30 shrink-0 flex flex-col gap-2 backdrop-blur-xl">
          
          {/* Fila 1: Selector de Categorías (Pestañas Rápidas) */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex-1 grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCategory('HABITS')}
                className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  category === 'HABITS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 size={12} />
                <span>Hábitos</span>
              </button>
              <button
                onClick={() => setCategory('WORKOUT')}
                className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  category === 'WORKOUT' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Dumbbell size={12} />
                <span>Entreno</span>
              </button>
              <button
                onClick={() => setCategory('NUTRITION')}
                className={`py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  category === 'NUTRITION' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Target size={12} />
                <span>Nutrición</span>
              </button>
            </div>

            {/* Toggle de Ajustes Extra (Tamaño / Fondos) */}
            <button
              onClick={() => setShowToolsDrawer(!showToolsDrawer)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                showToolsDrawer 
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Ajustes de Tamaño y Fondos"
            >
              <Sliders size={15} />
            </button>
          </div>

          {/* Fila 2: Estilos y Posición Rápida */}
          <div className="flex items-center justify-between gap-2 text-[10px]">
            {/* Estilos */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setAestheticStyle('GLASS_MINIMAL')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  aestheticStyle === 'GLASS_MINIMAL' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                💎 Glass
              </button>
              <button
                onClick={() => setAestheticStyle('BOLD_SPORT')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  aestheticStyle === 'BOLD_SPORT' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                ⚡ Neón
              </button>
              <button
                onClick={() => setAestheticStyle('COMPACT_PILL')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  aestheticStyle === 'COMPACT_PILL' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                🏷️ Stamp
              </button>
            </div>

            {/* Posición */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setStickerPosition('TOP')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  stickerPosition === 'TOP' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                ⬆
              </button>
              <button
                onClick={() => setStickerPosition('CENTER')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  stickerPosition === 'CENTER' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                ⏺
              </button>
              <button
                onClick={() => setStickerPosition('BOTTOM')}
                className={`px-2 py-1 rounded font-bold transition-all ${
                  stickerPosition === 'BOTTOM' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                ⬇
              </button>
            </div>

            {/* Ajuste Rápido de Tamaño (+ / -) */}
            <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setStickerScale(s => Math.max(70, s - 10))}
                className="w-6 h-6 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                title="Achicar"
              >
                -
              </button>
              <span className="text-[9px] font-mono text-indigo-400 font-bold px-1">{stickerScale}%</span>
              <button
                onClick={() => setStickerScale(s => Math.min(125, s + 10))}
                className="w-6 h-6 flex items-center justify-center text-slate-300 font-bold hover:text-white"
                title="Agrandar"
              >
                +
              </button>
            </div>
          </div>

          {/* Drawer Desplegable Opcional para Fondos y Filtros */}
          <AnimatePresence>
            {showToolsDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2 border-t border-slate-800 grid grid-cols-2 gap-3"
              >
                {/* Fondos */}
                <div>
                  <label className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
                    Fondo Alternativo
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBgMode('GRADIENT_MIDNIGHT')}
                      className={`px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 border ${
                        bgMode === 'GRADIENT_MIDNIGHT' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Midnight
                    </button>
                    <button
                      onClick={() => setBgMode('GRADIENT_NEON')}
                      className={`px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 border ${
                        bgMode === 'GRADIENT_NEON' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Neón
                    </button>
                    <button
                      onClick={() => setBgMode('TRANSPARENT_STICKER')}
                      className={`px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 border ${
                        bgMode === 'TRANSPARENT_STICKER' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Sin Fondo
                    </button>
                  </div>
                </div>

                {/* Sombra de Foto */}
                {bgMode === 'CUSTOM_PHOTO' && customPhotoUrl && (
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                      <span>Sombra de Foto</span>
                      <span className="text-indigo-400">{darkOverlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={darkOverlayOpacity}
                      onChange={(e) => setDarkOverlayOpacity(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 rounded appearance-none accent-indigo-500"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fila 3: Botones de Acción Primarios */}
          <div className="flex items-center gap-2 pt-1">
            {/* Exportar Solo PNG */}
            <button
              onClick={() => {
                setExportMode('SOLO_STICKER');
                setTimeout(handleExportOrShare, 50);
              }}
              disabled={isExporting}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-montserrat font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={13} />
              <span>Solo PNG</span>
            </button>

            {/* Compartir Historia Completa 9:16 */}
            <button
              onClick={() => {
                setExportMode('FULL_STORY');
                setTimeout(handleExportOrShare, 50);
              }}
              disabled={isExporting}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-montserrat font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Share2 size={15} />
              )}
              <span>{isExporting ? 'Generando...' : 'Compartir Historia 9:16'}</span>
            </button>
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════
// SUBCOMPONENTES DE STICKERS ESTÉTICOS (3 ESTILOS x 3 CATEGORÍAS)
// ═══════════════════════════════════════════════════════════════

interface StickerProps {
  category: StoryCategory;
  habitStats: { completionRate: number; monthlyAdherence: number; streak: number };
  workoutStats: { name: string; volumeKg: number; sets: number; durationMin: number; rpe: number };
  nutritionStats: { calories: number; targetCalories: number; protein: number; targetProtein: number; carbs: number; fats: number; mealsDone: number; totalMeals: number };
}

// 💎 ESTILO 1: GLASS MINIMAL (Aesthetic Clean con Blur Translúcido)
const GlassMinimalSticker: React.FC<StickerProps> = ({ category, habitStats, workoutStats, nutritionStats }) => {
  return (
    <div className="w-60 sm:w-64 bg-black/50 backdrop-blur-2xl border border-white/25 rounded-3xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />

      {category === 'HABITS' && (
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-1.5 border border-white/30 shadow-inner">
            <CheckCircle2 size={22} className="text-emerald-400" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300">
            Día Perfecto
          </span>
          <h4 className="text-3xl sm:text-4xl font-black font-montserrat my-0.5 tracking-tight">
            {habitStats.completionRate}%
          </h4>
          <p className="text-[9px] text-white/80 font-medium mb-2.5">Hábitos al 100%</p>

          <div className="w-full grid grid-cols-2 gap-1.5 pt-2 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1.5 flex flex-col items-center">
              <span className="text-[7px] text-slate-300 uppercase tracking-wider font-bold">Racha</span>
              <span className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                <Flame size={11} /> {habitStats.streak} Días
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1.5 flex flex-col items-center">
              <span className="text-[7px] text-slate-300 uppercase tracking-wider font-bold">Adherencia</span>
              <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1">
                <TrendingUp size={11} /> {habitStats.monthlyAdherence}%
              </span>
            </div>
          </div>
        </div>
      )}

      {category === 'WORKOUT' && (
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 backdrop-blur-md flex items-center justify-center mb-1.5 border border-indigo-400/30">
            <Dumbbell size={20} className="text-indigo-400" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300">
            Sesión Completada
          </span>
          <h4 className="text-lg font-black font-montserrat my-0.5 leading-tight truncate max-w-full px-1">
            {workoutStats.name}
          </h4>
          <p className="text-[9px] text-emerald-400 font-bold mb-2.5">+50 XP Ganados 🚀</p>

          <div className="w-full grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-center">
            <div className="bg-white/10 rounded-xl p-1">
              <span className="text-[7px] text-slate-300 block">Volumen</span>
              <span className="text-[10px] font-black text-white">{workoutStats.volumeKg.toLocaleString()} kg</span>
            </div>
            <div className="bg-white/10 rounded-xl p-1">
              <span className="text-[7px] text-slate-300 block">Series</span>
              <span className="text-[10px] font-black text-white">{workoutStats.sets} Sets</span>
            </div>
            <div className="bg-white/10 rounded-xl p-1">
              <span className="text-[7px] text-slate-300 block">Tiempo</span>
              <span className="text-[10px] font-black text-white">{workoutStats.durationMin} min</span>
            </div>
          </div>
        </div>
      )}

      {category === 'NUTRITION' && (
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 backdrop-blur-md flex items-center justify-center mb-1.5 border border-emerald-400/30">
            <Target size={20} className="text-emerald-400" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-300">
            Nutrición en Blanco
          </span>
          <h4 className="text-2xl sm:text-3xl font-black font-montserrat my-0.5 tracking-tight">
            {nutritionStats.calories} <span className="text-xs text-white/60 font-bold">kcal</span>
          </h4>
          <p className="text-[9px] text-emerald-300 font-bold mb-2.5">
            {nutritionStats.mealsDone}/{nutritionStats.totalMeals} Comidas del Plan
          </p>

          <div className="w-full grid grid-cols-3 gap-1 pt-2 border-t border-white/10 text-center">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-1">
              <span className="text-[7px] text-blue-200 block">Proteína</span>
              <span className="text-[10px] font-black text-white">{nutritionStats.protein}g</span>
            </div>
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-1">
              <span className="text-[7px] text-amber-200 block">Carbos</span>
              <span className="text-[10px] font-black text-white">{nutritionStats.carbs}g</span>
            </div>
            <div className="bg-rose-500/20 border border-rose-400/30 rounded-xl p-1">
              <span className="text-[7px] text-rose-200 block">Grasas</span>
              <span className="text-[10px] font-black text-white">{nutritionStats.fats}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ⚡ ESTILO 2: BOLD SPORT (High-Impact Neón & Gradientes)
const BoldSportSticker: React.FC<StickerProps> = ({ category, habitStats, workoutStats, nutritionStats }) => {
  return (
    <div className="w-60 sm:w-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-4 sm:p-5 shadow-2xl text-white border-2 border-white/30 relative overflow-hidden">
      {category === 'HABITS' && (
        <div className="flex flex-col items-center text-center">
          <div className="px-2.5 py-0.5 rounded-full bg-white text-indigo-900 font-black text-[8px] uppercase tracking-wider mb-1.5 shadow-sm">
            ✨ Hábito Cumplido
          </div>
          <h4 className="text-4xl sm:text-5xl font-black font-montserrat my-0.5 drop-shadow-md">
            100%
          </h4>
          <p className="text-[10px] font-bold text-white/90 mb-2.5">DÍA PERFECTO SIN FALLOS</p>
          <div className="w-full flex items-center justify-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-[11px] font-black flex items-center gap-1">
              🔥 {habitStats.streak} DÍAS
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-[11px] font-black flex items-center gap-1">
              ⚡ +50 XP
            </span>
          </div>
        </div>
      )}

      {category === 'WORKOUT' && (
        <div className="flex flex-col items-center text-center">
          <div className="px-2.5 py-0.5 rounded-full bg-white text-indigo-900 font-black text-[8px] uppercase tracking-wider mb-1.5 shadow-sm">
            🏋️ Beast Mode Activado
          </div>
          <h4 className="text-2xl sm:text-3xl font-black font-montserrat my-0.5 drop-shadow-md">
            {workoutStats.volumeKg.toLocaleString()} KG
          </h4>
          <p className="text-[10px] font-bold text-white/90 uppercase tracking-wider mb-2.5">
            {workoutStats.sets} SERIES • {workoutStats.durationMin} MIN
          </p>
          <div className="w-full flex items-center justify-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-[11px] font-black">
              RPE {workoutStats.rpe} 🔥
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-[11px] font-black">
              +50 XP 🚀
            </span>
          </div>
        </div>
      )}

      {category === 'NUTRITION' && (
        <div className="flex flex-col items-center text-center">
          <div className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[8px] uppercase tracking-wider mb-1.5 shadow-sm">
            🥗 Macros Clavados
          </div>
          <h4 className="text-3xl sm:text-4xl font-black font-montserrat my-0.5 drop-shadow-md">
            {nutritionStats.protein}g PRO
          </h4>
          <p className="text-[10px] font-bold text-white/90 uppercase tracking-wider mb-2.5">
            {nutritionStats.calories} KCAL CONSUMIDAS
          </p>
          <div className="w-full flex items-center justify-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-[11px] font-black">
              🎯 100% PLAN
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-black/40 backdrop-blur-md text-[11px] font-black">
              +20 XP ⚡
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 🏷️ ESTILO 3: COMPACT PILL (Mini Stamp Horizontal)
const CompactPillSticker: React.FC<StickerProps> = ({ category, habitStats, workoutStats, nutritionStats }) => {
  return (
    <div className="w-60 sm:w-64 bg-black/75 backdrop-blur-xl border border-white/30 rounded-full px-3.5 py-2 shadow-2xl flex items-center justify-between text-white">
      {category === 'HABITS' && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
              ✓
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Hábitos 100%</p>
              <p className="text-[11px] font-black text-white">Día Perfecto</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-amber-300 text-[11px] font-black flex items-center gap-1">
            <Flame size={11} /> {habitStats.streak}d
          </div>
        </>
      )}

      {category === 'WORKOUT' && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black text-xs">
              🏋️
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Entreno Hecho</p>
              <p className="text-[11px] font-black text-white">{workoutStats.volumeKg.toLocaleString()} kg</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-400 text-[11px] font-black">
            +50 XP
          </div>
        </>
      )}

      {category === 'NUTRITION' && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
              🥗
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Macros Ok</p>
              <p className="text-[11px] font-black text-white">{nutritionStats.protein}g PRO</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-white/10 text-amber-300 text-[11px] font-black">
            {nutritionStats.calories} kcal
          </div>
        </>
      )}
    </div>
  );
};

// Aliased export for backwards compatibility
export { AestheticStoryStudio as StatsStickerShare };

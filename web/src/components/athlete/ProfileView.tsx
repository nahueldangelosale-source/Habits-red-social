import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Moon, Sun, Settings, Flame, Trophy, Calendar, 
  ChevronRight, ChevronDown, Camera, Sparkles, User, Upload, Check, Trash2, 
  Weight, Ruler, Target, Dumbbell, Shield, Edit3, LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { HabitHeatmap } from './HabitHeatmap';
import { useCognitiveLoad } from '../../hooks/useCognitiveLoad';
import { useThemeStore } from '../../stores/useThemeStore';
import { useAuth } from '../../context/AuthContext';
import { useGamificationStore, getLevelTitle } from '../../stores/useGamificationStore';
import { AthleteMedalsModal } from './AthleteMedalsModal';
import { AthleteGeneralDataModal } from './AthleteGeneralDataModal';

const LazyProgressCharts = React.lazy(() => import('./ProgressGallery').then(mod => ({ default: mod.ProgressGallery })));

interface ProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ isOpen, onClose }) => {
  const { resilienceXp } = useCognitiveLoad();
  const { theme, toggleTheme } = useThemeStore();
  
  // Accordions
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Modals
  const [isMedalsModalOpen, setIsMedalsModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Profile Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem('athlete-custom-avatar');
  });

  // Athlete General Data State
  const [athleteData, setAthleteData] = useState(() => ({
    weight: localStorage.getItem('athlete-data-weight') || '82.5',
    height: localStorage.getItem('athlete-data-height') || '178',
    goal: localStorage.getItem('athlete-data-goal') || 'Hipertrofia & Fuerza',
    discipline: localStorage.getItem('athlete-data-discipline') || 'Musculación & Funcional',
    experience: localStorage.getItem('athlete-data-experience') || 'Intermedio (2 años)',
    coach: localStorage.getItem('athlete-data-coach') || 'Leandro Usea'
  }));

  const { user, logout } = useAuth();
  const { level, getXPProgress } = useGamificationStore();
  const xpProgress = getXPProgress();

  useEffect(() => {
    const handleAvatarChange = () => {
      setAvatarUrl(localStorage.getItem('athlete-custom-avatar'));
    };
    const handleDataChange = () => {
      setAthleteData({
        weight: localStorage.getItem('athlete-data-weight') || '82.5',
        height: localStorage.getItem('athlete-data-height') || '178',
        goal: localStorage.getItem('athlete-data-goal') || 'Hipertrofia & Fuerza',
        discipline: localStorage.getItem('athlete-data-discipline') || 'Musculación & Funcional',
        experience: localStorage.getItem('athlete-data-experience') || 'Intermedio (2 años)',
        coach: localStorage.getItem('athlete-data-coach') || 'Leandro Usea'
      });
    };

    window.addEventListener('athlete-avatar-updated', handleAvatarChange);
    window.addEventListener('athlete-data-updated', handleDataChange);
    return () => {
      window.removeEventListener('athlete-avatar-updated', handleAvatarChange);
      window.removeEventListener('athlete-data-updated', handleDataChange);
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
        localStorage.setItem('athlete-custom-avatar', base64);
        window.dispatchEvent(new CustomEvent('athlete-avatar-updated', { detail: base64 }));
        toast.success('¡Foto de perfil actualizada!', { icon: '📸' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAvatarUrl(null);
    localStorage.removeItem('athlete-custom-avatar');
    window.dispatchEvent(new CustomEvent('athlete-avatar-updated', { detail: null }));
    toast.success('Foto de perfil restablecida');
  };

  const getLevelColor = (lvl: number) => {
    if (lvl <= 5) return 'bg-emerald-400 text-emerald-950';
    if (lvl <= 15) return 'bg-amber-400 text-amber-950';
    if (lvl <= 30) return 'bg-indigo-400 text-indigo-950';
    return 'bg-rose-400 text-rose-950';
  };

  const displayName = user?.full_name || 'Atleta';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
      className="fixed inset-0 z-50 bg-slate-50/95 dark:bg-[#090b10]/95 backdrop-blur-xl overflow-y-auto font-lato"
    >
      <div className="p-5 sm:p-6 pb-32 max-w-md mx-auto">
        
        {/* Top Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white dark:bg-zinc-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-slate-200/80 dark:border-white/10 shadow-sm active:scale-95"
          >
            <X className="w-5 h-5 text-slate-800 dark:text-white" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 bg-white dark:bg-zinc-900 rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-slate-200/80 dark:border-white/10 shadow-sm active:scale-95"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Identidad del Atleta (Simétrico & Centrado con Carga de Foto) */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative group">
            {/* Anillo de Gradiente Concéntrico */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-400 p-[3px] shadow-xl shadow-indigo-500/15 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-900 dark:bg-zinc-900 flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#090b10] relative">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-3xl font-black text-white font-montserrat tracking-wider">
                    {initials}
                  </span>
                )}

                {/* Hover overlay para cambiar foto */}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                  <Camera size={18} />
                  <span className="text-[9px] font-bold mt-1">Cambiar</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Botón flotante para subir foto */}
            <label 
              title="Subir foto de perfil"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 cursor-pointer transition-transform active:scale-95 z-20"
            >
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Badge de Nivel Centrado */}
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${getLevelColor(level)} text-[10px] font-black font-montserrat px-3 py-0.5 rounded-full uppercase tracking-wider border-2 border-white dark:border-zinc-900 shadow-md whitespace-nowrap z-20`}>
              NIVEL {level}
            </div>
          </div>
          
          <h2 className="text-xl font-black font-montserrat text-slate-900 dark:text-white mt-5 mb-0.5">
            {displayName}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center font-medium">
            <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Miembro activo
          </p>

          {avatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              className="mt-2 text-[10px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <Trash2 size={11} />
              <span>Quitar foto personalizada</span>
            </button>
          )}
        </div>

        {/* Tarjeta de Rango & Progreso XP */}
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                Rango Actual
              </p>
              <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white">
                {getLevelTitle(level)}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                {xpProgress.currentXP}
              </span>
              <span className="text-[10px] text-slate-400 font-mono"> / {xpProgress.xpForNextLevel} XP</span>
            </div>
          </div>

          <div className="h-2.5 w-full bg-slate-100 dark:bg-black/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, xpProgress.progressPercent))}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-full"
            />
          </div>
        </div>

        {/* 1. SECCIÓN: DATOS GENERALES & BIOMETRÍA DEL ATLETA */}
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mb-3.5">
          <button 
            onClick={() => setIsDataOpen(!isDataOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Datos Generales & Biometría</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {athleteData.weight} kg • {athleteData.height} cm • {athleteData.goal}
                </p>
              </div>
            </div>
            <motion.div animate={{ rotate: isDataOpen ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isDataOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Weight size={11} className="text-indigo-500" /> Peso
                      </span>
                      <p className="text-xs font-black font-mono text-slate-900 dark:text-white mt-0.5">
                        {athleteData.weight} kg
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Ruler size={11} className="text-purple-500" /> Altura
                      </span>
                      <p className="text-xs font-black font-mono text-slate-900 dark:text-white mt-0.5">
                        {athleteData.height} cm
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Target size={11} className="text-amber-500" /> Objetivo
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {athleteData.goal}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Dumbbell size={11} className="text-emerald-500" /> Disciplina
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {athleteData.discipline}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Shield size={11} className="text-blue-500" /> Coach
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                        {athleteData.coach}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDataModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Edit3 size={13} />
                    <span>Modificar Ficha & Datos</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. SECCIÓN: LOGROS & MEDALLAS (VITRINA INTERACTIVA) */}
        <div className="mb-3.5">
          <button 
            onClick={() => setIsMedalsModalOpen(true)}
            className="w-full bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-amber-400/50 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Logros y Medallas</h3>
                  <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded-md">
                    5 Ganadas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Vitrina de insignias, desafíos e hitos
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 3. SECCIÓN: RACHA ACTUAL */}
        <div className="mb-3.5">
          <div className="w-full bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Racha Actual</h3>
                <p className="text-xs text-orange-500 font-black tracking-wider uppercase mt-0.5 font-montserrat">12 Días Imparables 🔥</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-lg">
              +50 XP Hoy
            </span>
          </div>
        </div>

        {/* 4. SECCIÓN: HISTORIAL Y CALENDARIO */}
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mb-3.5">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Historial y Calendario</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tus check-ins y entrenamientos completados</p>
              </div>
            </div>
            <motion.div animate={{ rotate: isCalendarOpen ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isCalendarOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/5">
                  <div className="pt-3">
                    <HabitHeatmap />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. SECCIÓN: GALERÍA DE PROGRESO */}
        <div className="bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mb-4">
          <button 
            onClick={() => setIsGalleryOpen(!isGalleryOpen)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Galería de Progreso Visual</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Fotos de evolución y comparador antes/después</p>
              </div>
            </div>
            <motion.div animate={{ rotate: isGalleryOpen ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isGalleryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/5">
                  <div className="pt-3">
                    <React.Suspense fallback={<div className="h-48 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />}>
                      <LazyProgressCharts />
                    </React.Suspense>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. GUÍA DE BIENVENIDA & ACCIONES DE SESIÓN */}
        <div className="space-y-3 mb-8">
          {/* Botón Ver Bienvenida */}
          <button
            onClick={() => {
              localStorage.removeItem('athlete-onboarding-completed');
              onClose();
              window.dispatchEvent(new CustomEvent('reopen-athlete-welcome'));
            }}
            className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900/80 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-slate-800 dark:text-zinc-200 transition-all active:scale-[0.98] shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ver Wizard de Bienvenida</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Repasar metas, hábitos y diseño glass de inicio</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </button>

          {/* Botón Cerrar Sesión & Nuevo Usuario */}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('athlete-onboarding-completed');
              localStorage.removeItem('readiness-today');
              localStorage.removeItem('readiness-dismissed-today');
              localStorage.removeItem('athlete-primary-goal');
              localStorage.removeItem('athlete-selected-habits');
              localStorage.removeItem('athlete-custom-avatar');
              logout();
              toast.success('Sesión cerrada. Iniciando nuevo usuario...', { icon: '👋' });
              onClose();
              window.location.href = '/b2c/onboarding';
            }}
            className="w-full p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-400 transition-all active:scale-[0.98] shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-rose-400">Cerrar Sesión</h4>
                <p className="text-[11px] text-rose-400/70 mt-0.5">Salir de este atleta e iniciar con un usuario nuevo</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-rose-400/50" />
          </button>
        </div>

      </div>

      {/* Modales Conectados */}
      <AthleteMedalsModal
        isOpen={isMedalsModalOpen}
        onClose={() => setIsMedalsModalOpen(false)}
      />

      <AthleteGeneralDataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </motion.div>
  );
};

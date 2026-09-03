import React, { useState } from 'react';
import { 
  Target, Users, Zap, CheckCircle2, Rocket, ArrowRight, 
  Flame, Dumbbell, Trophy, Sparkles, Calendar, Droplets, 
  HeartHandshake, ChevronRight, ChevronDown, ShieldCheck, Eye, Layers, Compass, Plus,
  Clock, Share2, Copy, Trash2, Swords, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamificationStore } from '../../stores/useGamificationStore';
import { useTribuStore, type ChallengeType as TribuChallengeType } from '../../stores/useTribuStore';
import { useClassesStore, type ClassGroupDetail } from '../../stores/useClassesStore';
import { CreateClassGroupModal, type TargetAudience } from './CreateClassGroupModal';
import { ClassDetailModal } from './ClassDetailModal';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type GamificationTab = 'CLASSES' | 'CHALLENGES';

interface DisciplineTemplate {
  id: string;
  discipline: string;
  disciplineIcon: string;
  disciplineBadge: string;
  disciplineColor: string;
  title: string;
  description: string;
  type: TribuChallengeType;
  category: string;
  icon: string;
  defaultTarget: number;
  unit: string;
  defaultDurationDays: number;
  rewardXP: number;
  rewardBadge: string;
  gradientClass: string;
}

const DISCIPLINE_TEMPLATES: DisciplineTemplate[] = [
  {
    id: 'fuerza_tonelaje',
    discipline: 'Fuerza & Musculación',
    disciplineIcon: '🏋️',
    disciplineBadge: 'Fuerza',
    disciplineColor: 'from-amber-500 to-rose-500',
    title: 'Raid de Fuerza: 50,000 kg',
    description: 'Tonelaje acumulativo grupal: sumamos los kilos levantados en cada serie de todos los atletas participantes.',
    type: 'COLLECTIVE_VOLUME',
    category: 'ENTRENO',
    icon: '🏋️',
    defaultTarget: 50000,
    unit: 'kg',
    defaultDurationDays: 7,
    rewardXP: 250,
    rewardBadge: 'Levantadores Colosales ⚡',
    gradientClass: 'from-amber-500/10 via-rose-500/10 to-purple-500/10 border-amber-500/30'
  },
  {
    id: 'running_km',
    discipline: 'Running & Cardio',
    disciplineIcon: '🏃',
    disciplineBadge: 'Running',
    disciplineColor: 'from-sky-500 to-indigo-600',
    title: 'Desafío Ruta de la Tribu: 100 KM',
    description: 'Acumulación de kilómetros en equipo. Cada salida a correr, fondo o trote de los atletas suma a la meta colectiva.',
    type: 'COLLECTIVE_VOLUME',
    category: 'RUNNING',
    icon: '🏃',
    defaultTarget: 100,
    unit: 'km',
    defaultDurationDays: 7,
    rewardXP: 200,
    rewardBadge: 'Corredores Imparables 🌍',
    gradientClass: 'from-sky-500/10 via-indigo-500/10 to-blue-500/10 border-sky-500/30'
  },
  {
    id: 'crossfit_wods',
    discipline: 'Funcional & CrossFit',
    disciplineIcon: '⚡',
    disciplineBadge: 'Funcional',
    disciplineColor: 'from-emerald-500 to-teal-600',
    title: 'Guerra de WODs: 30 Entrenamientos',
    description: 'Meta de asistencia y esfuerzo conjunto: el escuadrón debe completar 30 clases o WODs en la semana.',
    type: 'HABIT_SYNC',
    category: 'CROSSFIT',
    icon: '⚡',
    defaultTarget: 30,
    unit: 'WODs',
    defaultDurationDays: 7,
    rewardXP: 220,
    rewardBadge: 'Gladiadores del Box 🔥',
    gradientClass: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30'
  },
  {
    id: 'habitos_7d',
    discipline: 'Hábitos & Recuperación',
    disciplineIcon: '🔥',
    disciplineBadge: 'Hábitos',
    disciplineColor: 'from-purple-500 to-pink-500',
    title: '7 Días Sin Fallos (Constancia 100%)',
    description: 'Pacto de disciplina diaria: cada atleta del escuadrón debe cumplir el 100% de sus hábitos (agua, sueño y movilidad).',
    type: 'HABIT_SYNC',
    category: 'HABITOS',
    icon: '🔥',
    defaultTarget: 28,
    unit: 'Check-ins',
    defaultDurationDays: 7,
    rewardXP: 150,
    rewardBadge: 'Titán Invencible 🛡️',
    gradientClass: 'from-purple-500/10 via-pink-500/10 to-rose-500/10 border-purple-500/30'
  },
  {
    id: 'nutricion_adherencia',
    discipline: 'Nutrición & Ingestas',
    disciplineIcon: '🥗',
    disciplineBadge: 'Nutrición',
    disciplineColor: 'from-emerald-500 to-lime-500',
    title: 'Semana Nutricional Perfecta',
    description: 'Adherencia a la comida real: registro diario de ingestas planificadas y metas de hidratación sin omitir platos.',
    type: 'HABIT_SYNC',
    category: 'NUTRICIÓN',
    icon: '🥗',
    defaultTarget: 28,
    unit: 'Comidas',
    defaultDurationDays: 7,
    rewardXP: 180,
    rewardBadge: 'Nutrición de Élite 🥑',
    gradientClass: 'from-emerald-500/10 via-lime-500/10 to-teal-500/10 border-emerald-500/30'
  },
  {
    id: 'duelo_clases',
    discipline: 'Guerra de Clases & Squads',
    disciplineIcon: '⚔️',
    disciplineBadge: 'Vs Clases',
    disciplineColor: 'from-orange-500 to-red-600',
    title: 'Duelo: Mañana vs Tarde (Pacto de Racha)',
    description: 'Competencia amistosa inter-grupal: el turno con mayor racha colectiva y asistencia gana el trofeo de la semana.',
    type: 'STREAK_PACT',
    category: 'COMPETICIÓN',
    icon: '⚔️',
    defaultTarget: 14,
    unit: 'Días Invictos',
    defaultDurationDays: 14,
    rewardXP: 300,
    rewardBadge: 'Campeones de Tribu 🏆',
    gradientClass: 'from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/30'
  }
];

export const GamificationBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GamificationTab>('CLASSES');
  const [selectedTemplate, setSelectedTemplate] = useState<DisciplineTemplate | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<string>('all_gym');
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<ClassGroupDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [disciplineFilter, setDisciplineFilter] = useState<string>('ALL');
  const [expandedClassIds, setExpandedClassIds] = useState<Set<string>>(new Set());

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetMetric, setTargetMetric] = useState(50000);
  const [durationDays, setDurationDays] = useState(7);
  const [rewardXP, setRewardXP] = useState(250);

  const { classes, addClass, deleteClass, assignChallengeToClass } = useClassesStore();
  const { deployChallenge } = useGamificationStore();
  const { createChallenge } = useTribuStore();

  const totalAthletes = classes.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);
  const activeChallengesCount = classes.filter(c => !!c.activeChallengeTitle && c.activeChallengeTitle !== 'Reto en Preparación').length;

  const toggleClassExpand = (classId: string) => {
    setExpandedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) {
        next.delete(classId);
      } else {
        next.add(classId);
      }
      return next;
    });
  };

  const handleToggleExpandAll = () => {
    if (expandedClassIds.size === classes.length) {
      setExpandedClassIds(new Set());
    } else {
      setExpandedClassIds(new Set(classes.map(c => c.id)));
    }
  };

  const handleClassCreated = (newAudience: TargetAudience) => {
    const created = addClass({
      name: newAudience.name.split('(')[0].trim(),
      discipline: newAudience.discipline || 'Disciplina Grupal',
      icon: newAudience.icon,
      schedule: newAudience.schedule || 'Horario a coordinar',
      count: newAudience.count,
      activeChallengeTitle: 'Reto en Preparación'
    });
    setSelectedAudience(created.id);
    toast.success(`Clase "${created.name}" creada exitosamente.`);
  };

  const handleSelectTemplate = (template: DisciplineTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.title);
    setDescription(template.description);
    setTargetMetric(template.defaultTarget);
    setDurationDays(template.defaultDurationDays);
    setRewardXP(template.rewardXP);
  };

  const handleLaunchChallengeForClass = (cls: ClassGroupDetail) => {
    setSelectedAudience(cls.id);
    setActiveTab('CHALLENGES');
    // Pre-select matching template if discipline matches
    const matchingTemplate = DISCIPLINE_TEMPLATES.find(t => 
      t.discipline.toLowerCase().includes(cls.discipline.toLowerCase().split(' ')[0]) ||
      cls.discipline.toLowerCase().includes(t.disciplineBadge.toLowerCase())
    ) || DISCIPLINE_TEMPLATES[0];
    handleSelectTemplate(matchingTemplate);
  };

  const handleCopyClassInvite = (cls: ClassGroupDetail) => {
    const inviteLink = `${window.location.origin}/b2c/join?class=${cls.id}&ref=coach`;
    navigator.clipboard.writeText(inviteLink);
    toast.success(`Enlace de invitación copiado para ${cls.name}`, {
      icon: '🔗'
    });
  };

  const handleDeploy = () => {
    if (!selectedTemplate) return;
    setIsDeploying(true);

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + durationDays);

    const finalTitle = title || selectedTemplate.title;

    // 1. Inyectar directamente en useTribuStore (Superficie social del atleta)
    createChallenge({
      title: finalTitle,
      description: description || selectedTemplate.description,
      type: selectedTemplate.type,
      category: selectedTemplate.category,
      icon: selectedTemplate.icon,
      targetValue: targetMetric,
      unit: selectedTemplate.unit,
      durationDays: durationDays,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      rewardXP: rewardXP,
      rewardBadge: selectedTemplate.rewardBadge
    });

    // 2. Inyectar en useGamificationStore global
    deployChallenge({
      title: finalTitle,
      type: selectedTemplate.type === 'COLLECTIVE_VOLUME' ? 'VOLUME' : 'STREAK',
      targetValue: targetMetric,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      durationDays: durationDays,
      assignedClients: [selectedAudience],
      squadId: selectedAudience
    });

    // 3. Asignar reto a la clase seleccionada en useClassesStore
    assignChallengeToClass(selectedAudience, finalTitle);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      setTimeout(() => {
        setDeploySuccess(false);
        setSelectedTemplate(null);
        setActiveTab('CLASSES');
      }, 2200);
    }, 600);
  };

  const filteredTemplates = disciplineFilter === 'ALL'
    ? DISCIPLINE_TEMPLATES
    : DISCIPLINE_TEMPLATES.filter(t => t.category === disciplineFilter || t.disciplineBadge.toUpperCase() === disciplineFilter.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-4 sm:p-8 md:p-10 font-lato relative overflow-y-auto">
      {/* Header Principal */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Trophy size={22} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-montserrat tracking-tight text-slate-900 dark:text-white">
                  GRUPOS & RETOS
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                  Gestiona tus clases, horarios y lanza dinámicas motivacionales sincronizadas en tiempo real con la app del atleta.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateClassOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>+ Crear Clase / Grupo</span>
            </button>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronización en Vivo
            </span>
          </div>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN (2 VISUALES CLAVE) */}
        <div className="flex items-center gap-3 mt-6 border-b border-slate-200 dark:border-zinc-800 pb-1">
          <button
            onClick={() => {
              setActiveTab('CLASSES');
              setSelectedTemplate(null);
            }}
            className={`px-5 py-3 rounded-2xl font-black font-montserrat text-sm transition-all flex items-center gap-2.5 relative ${
              activeTab === 'CLASSES'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-800'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900/50'
            }`}
          >
            <Users size={18} />
            <span>Clases & Grupos Activos</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'CLASSES'
                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}>
              {classes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CHALLENGES')}
            className={`px-5 py-3 rounded-2xl font-black font-montserrat text-sm transition-all flex items-center gap-2.5 relative ${
              activeTab === 'CHALLENGES'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-zinc-800'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900/50'
            }`}
          >
            <Swords size={18} />
            <span>Catálogo de Retos (Game Master)</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              activeTab === 'CHALLENGES'
                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}>
              {DISCIPLINE_TEMPLATES.length} Formatos
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* ═════════════════════════════════════════════════════════════════════
            PESTAÑA 1: CLASES & GRUPOS ACTIVOS (ACORDEÓN / RELEVAMIENTO COMPACTO)
           ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'CLASSES' && (
          <div className="space-y-8">
            {/* KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Clases & Grupos</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{classes.length} Activas</h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">CrossFit, Running, Fuerza, Yoga</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Flame size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Comunidad Total</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{totalAthletes} Atletas</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Inscritos en grupos activos</p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">Retos en Curso</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{activeChallengesCount} Activos</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Generando XP y retención</p>
                </div>
              </div>
            </div>

            {/* Lista Desplegable / Acordeón de Clases Activas */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-base font-black font-montserrat uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                    <Layers size={18} className="text-indigo-500" />
                    Tus Clases y Escuadrones en Operación
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Relevamiento ejecutivo de tus clases. Toca cualquier fila para desplegar alumnos, estadísticas y opciones.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleExpandAll}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${expandedClassIds.size === classes.length ? 'rotate-180 text-indigo-500' : ''}`} />
                    <span>{expandedClassIds.size === classes.length ? 'Colapsar Todas' : 'Expandir Todas'}</span>
                  </button>
                </div>
              </div>

              {/* Banner Pedagógico de Coherencia Visual */}
              <div className="mb-4 px-4 py-2.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span>
                    <strong>Píldora Violeta (Reto Activo):</strong> Desafío grupal sincronizado con la app móvil de los alumnos para motivar asistencia y hábitos.
                  </span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {activeChallengesCount} de {classes.length} con reto activo
                </span>
              </div>

              {/* Cabecera Simétrica de Columnas (Desktop) */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 select-none">
                <div className="col-span-5">Clase & Horario</div>
                <div className="col-span-3">Comunidad Asignada</div>
                <div className="col-span-3">Reto Colectivo (Game Master)</div>
                <div className="col-span-1 text-right">Detalle</div>
              </div>

              {/* Contenedor Acordeón de Clases */}
              <div className="space-y-3">
                {classes.map((cls) => {
                  const isExpanded = expandedClassIds.has(cls.id);
                  const hasActiveChallenge = cls.activeChallengeTitle && cls.activeChallengeTitle !== 'Reto en Preparación';

                  return (
                    <div
                      key={cls.id}
                      className={`rounded-2xl sm:rounded-3xl border transition-all overflow-hidden ${
                        isExpanded
                          ? 'bg-white dark:bg-zinc-900 border-indigo-500/40 dark:border-indigo-500/40 shadow-md ring-1 ring-indigo-500/10'
                          : 'bg-white dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Header de la Fila (Grid Simétrico de 12 Columnas) */}
                      <div
                        onClick={() => toggleClassExpand(cls.id)}
                        className="px-4 sm:px-6 py-3.5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 cursor-pointer select-none transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/30"
                      >
                        {/* Col 1: Clase & Horario (5 cols) */}
                        <div className="md:col-span-5 flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-2xl flex items-center justify-center shadow-inner shrink-0">
                            {cls.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white truncate">
                                {cls.name}
                              </h3>
                              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/40 shrink-0">
                                {cls.discipline}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                              <Clock size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate">{cls.schedule}</span>
                            </div>
                          </div>
                        </div>

                        {/* Col 2: Comunidad Asignada (3 cols) */}
                        <div className="md:col-span-3 flex items-center justify-between md:justify-start gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden shrink-0">
                              {cls.members.slice(0, 3).map((m) => (
                                <img
                                  key={m.id}
                                  src={m.avatarUrl}
                                  alt={m.name}
                                  className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-900 object-cover"
                                />
                              ))}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                {cls.count}
                              </span>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">alumnos inscritos</p>
                            </div>
                          </div>
                        </div>

                        {/* Col 3: Píldora Violeta - Reto Activo (3 cols) */}
                        <div className="md:col-span-3 flex items-center">
                          {hasActiveChallenge ? (
                            <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/30 text-purple-700 dark:text-purple-300 shadow-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
                                  <Trophy size={13} />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block leading-tight">
                                    Reto en Vivo
                                  </span>
                                  <span className="text-xs font-black truncate max-w-[150px] block text-slate-900 dark:text-purple-100 font-montserrat">
                                    {cls.activeChallengeTitle?.split(':')[0]}
                                  </span>
                                </div>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Sincronizado en la app de los alumnos" />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchChallengeForClass(cls);
                              }}
                              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/60 border border-dashed border-slate-300 dark:border-zinc-700/60 text-slate-500 dark:text-zinc-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              <span className="text-xs font-medium italic">Sin reto asignado</span>
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">+ Asignar Reto</span>
                            </button>
                          )}
                        </div>

                        {/* Col 4: Toggle Chevron (1 col) */}
                        <div className="md:col-span-1 flex justify-end">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-transform group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600">
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`} />
                          </div>
                        </div>
                      </div>

                      {/* Cuerpo Desplegable (Detalles y Acciones) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            className="overflow-hidden border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 p-4 sm:p-6 space-y-4"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Alumnos Destacados y Rachas */}
                              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                                    <Users size={14} className="text-indigo-500" />
                                    Alumnos Inscritos ({cls.members.length})
                                  </p>
                                  <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                    <Flame size={12} /> Rachas Activas
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {cls.members.map((m) => (
                                    <div
                                      key={m.id}
                                      className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800"
                                    >
                                      <img
                                        src={m.avatarUrl}
                                        alt={m.name}
                                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{m.name}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                                          <Flame size={10} /> {m.streakDays} días
                                        </div>
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                        Activo
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Reto Colectivo Asignado */}
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                      <Trophy size={13} /> Dinámica & Reto Colectivo
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                      En Curso
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                                    {cls.activeChallengeTitle || 'Guerra de WODs: 30 Entrenamientos'}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                    Suma de esfuerzo colectivo sincronizada en tiempo real con la app del atleta.
                                  </p>
                                </div>

                                <div className="mt-3 pt-3 border-t border-purple-500/15 flex items-center justify-between text-xs">
                                  <span className="text-amber-500 font-bold flex items-center gap-1">
                                    <Sparkles size={13} /> Recompensa XP activa
                                  </span>
                                  <button
                                    onClick={() => handleLaunchChallengeForClass(cls)}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                  >
                                    Cambiar Reto <ArrowRight size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Barra de Acciones */}
                            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                              <button
                                onClick={() => {
                                  setSelectedClassForDetail(cls);
                                  setIsDetailModalOpen(true);
                                }}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <Users size={14} className="text-indigo-500" /> Ver Expediente de Alumnos & Horarios
                              </button>

                              <div className="flex items-center gap-2 ml-auto">
                                <button
                                  onClick={() => handleCopyClassInvite(cls)}
                                  className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                                  title="Copiar enlace de invitación"
                                >
                                  <Copy size={14} />
                                  <span>Copiar Enlace</span>
                                </button>
                                <button
                                  onClick={() => handleLaunchChallengeForClass(cls)}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                                >
                                  <Zap size={14} /> Lanzar Reto a Esta Clase
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            PESTAÑA 2: CATÁLOGO DE RETOS (GAME MASTER)
           ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'CHALLENGES' && (
          <>
            {!selectedTemplate ? (
              /* PASO 1: SELECCIÓN DE PLANTILLA POR DISCIPLINA */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black font-montserrat uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                      <Compass size={18} className="text-indigo-500" />
                      Elige una Dinámica o Disciplina para tu Clase
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Formatos probados de retención que motivan a los alumnos a entrenar juntos y no perder la racha.
                    </p>
                  </div>

                  {/* Filtro de Categorías */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {['ALL', 'ENTRENO', 'RUNNING', 'CROSSFIT', 'HABITOS', 'NUTRICIÓN', 'COMPETICIÓN'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setDisciplineFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors whitespace-nowrap ${
                          disciplineFilter === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {cat === 'ALL' ? 'Todas' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredTemplates.map((tmpl) => (
                    <motion.div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-3xl p-6 cursor-pointer shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            {tmpl.icon}
                          </div>
                          <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200 dark:border-zinc-700">
                            {tmpl.disciplineBadge}
                          </span>
                        </div>

                        <h3 className="text-base font-black font-montserrat text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tmpl.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-500 flex items-center gap-1">
                          <Sparkles size={13} /> +{tmpl.rewardXP} XP
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Configurar Reto <ChevronRight size={14} />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              /* PASO 2: CONFIGURADOR PEDAGÓGICO & PREVIEW EN VIVO */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Formulario Izquierdo */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowRight size={14} className="rotate-180" /> Cambiar de Plantilla
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                      {selectedTemplate.discipline}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      1. Nombre del Desafío
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-montserrat font-bold text-base focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Selector de Grupo / Destinatario conectado a useClassesStore */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider">
                        2. ¿A qué Grupo o Clase va dirigido?
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreateClassOpen(true)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors active:scale-95"
                      >
                        <Plus size={13} />
                        <span>Crear Nueva Clase</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Opción Global: Toda la Comunidad */}
                      <button
                        type="button"
                        onClick={() => setSelectedAudience('all_gym')}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
                          selectedAudience === 'all_gym'
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm'
                            : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-xl shrink-0">🏢</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">Toda la Comunidad / Gimnasio</p>
                          <p className="text-[10px] text-slate-400">{totalAthletes} atletas</p>
                        </div>
                        {selectedAudience === 'all_gym' && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </button>

                      {/* Lista dinámica de clases de useClassesStore */}
                      {classes.map((cls) => (
                        <button
                          type="button"
                          key={cls.id}
                          onClick={() => setSelectedAudience(cls.id)}
                          className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
                            selectedAudience === cls.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm'
                              : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-600'
                          }`}
                        >
                          <span className="text-xl shrink-0">{cls.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{cls.name}</p>
                            <p className="text-[10px] text-slate-400">{cls.count} • {cls.schedule.split('•')[0]}</p>
                          </div>
                          {selectedAudience === cls.id && (
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          )}
                        </button>
                      ))}

                      {/* Tarjeta Directa para Crear Clase */}
                      <button
                        type="button"
                        onClick={() => setIsCreateClassOpen(true)}
                        className="p-3 rounded-2xl text-left border border-dashed border-slate-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-zinc-800/30 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                          <Plus size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold">+ Crear Nueva Clase</p>
                          <p className="text-[10px] text-slate-400">Personaliza horario y disciplina</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Métricas: Objetivo y Duración */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Meta ({selectedTemplate.unit})
                      </label>
                      <input
                        type="number"
                        value={targetMetric}
                        onChange={(e) => setTargetMetric(Number(e.target.value) || 1)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-montserrat font-black text-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                        Duración (Días)
                      </label>
                      <select
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white font-montserrat font-bold text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value={3}>⚡ 3 Días (Express)</option>
                        <option value={7}>📅 7 Días (1 Semana)</option>
                        <option value={14}>🗓️ 14 Días (2 Semanas)</option>
                        <option value={30}>🏆 30 Días (Mensual)</option>
                      </select>
                    </div>
                  </div>

                  {/* Recompensa */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Recompensa para los Atletas
                    </label>
                    <div className="flex items-center gap-3">
                      {[150, 250, 500].map((xp) => (
                        <button
                          type="button"
                          key={xp}
                          onClick={() => setRewardXP(xp)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                            rewardXP === xp
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          <Sparkles size={14} /> +{xp} XP
                        </button>
                      ))}
                      <span className="text-xs text-slate-400 font-bold">
                        + {selectedTemplate.rewardBadge}
                      </span>
                    </div>
                  </div>

                  {/* Botón Lanzar */}
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Aparecerá en el feed de <strong>Habits & Tribu</strong> de todos los atletas seleccionados.
                    </p>
                    <button
                      onClick={handleDeploy}
                      disabled={isDeploying || deploySuccess}
                      className={`px-6 py-3 rounded-2xl font-black font-montserrat text-xs uppercase tracking-wider text-white shadow-xl flex items-center gap-2 transition-all active:scale-95 ${
                        deploySuccess
                          ? 'bg-emerald-500 shadow-emerald-500/20'
                          : isDeploying
                            ? 'bg-indigo-600/50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 shadow-indigo-600/30'
                      }`}
                    >
                      {deploySuccess ? (
                        <><CheckCircle2 size={16} /> ¡Lanzado con Éxito!</>
                      ) : isDeploying ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publicando...</>
                      ) : (
                        <><Rocket size={16} /> Lanzar Desafío a la Tribu</>
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Previsualización Móvil del Atleta (Live Preview) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 font-montserrat">
                      <Eye size={14} className="text-indigo-500" />
                      Previsualización en la App del Atleta
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Vista Móvil</span>
                  </div>

                  <div className="bg-slate-100 dark:bg-zinc-950 p-4 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-inner">
                    {/* Tarjeta de Reto Idéntica a AthleteTribuDashboard */}
                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 dark:from-indigo-950/80 dark:via-purple-950/50 dark:to-zinc-900 border border-white/15 dark:border-indigo-500/30 rounded-3xl p-5 shadow-lg text-white relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{selectedTemplate.icon}</span>
                          <div>
                            <span className="bg-indigo-500/20 text-indigo-200 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-indigo-500/30">
                              {selectedTemplate.category}
                            </span>
                            <h4 className="text-base font-black text-white font-montserrat mt-0.5">
                              {title || selectedTemplate.title}
                            </h4>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-indigo-200 flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                          <Calendar size={11} /> {durationDays}d
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {description || selectedTemplate.description}
                      </p>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-slate-400 text-[11px] font-bold">Progreso Colectivo</span>
                          <span className="font-black text-white font-montserrat">
                            0 / {targetMetric.toLocaleString()} {selectedTemplate.unit} (0%)
                          </span>
                        </div>
                        <div className="h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-2" />
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                          <Trophy size={13} />
                          <span>+{rewardXP} XP al completar</span>
                        </div>

                        <span className="text-indigo-300 font-bold flex items-center gap-1 text-[11px]">
                          Ver Detalle & Check-in <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                      <span>Los atletas recibirán notificación en su feed social con 1 toque.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para Crear Nueva Clase / Grupo */}
      <CreateClassGroupModal
        isOpen={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
        onClassCreated={handleClassCreated}
      />

      {/* Modal para Ver Detalle de Clase / Alumnos */}
      <ClassDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        classGroup={selectedClassForDetail}
        onLaunchChallenge={(classId) => {
          if (selectedClassForDetail) {
            handleLaunchChallengeForClass(selectedClassForDetail);
          }
        }}
      />
    </div>
  );
};


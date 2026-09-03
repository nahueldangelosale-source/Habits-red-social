import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Dumbbell, Flame, Heart, Zap, 
  Copy, Check, QrCode, ArrowRight, ArrowLeft, Users, 
  Building2, Trophy, Rocket, ShieldCheck, User,
  CalendarDays, MessageSquare, CreditCard, Apple,
  CheckCircle2, Swords, Video, Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../api/client';

interface CoachWelcomeWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachName?: string;
}

export const CoachWelcomeWizardModal: React.FC<CoachWelcomeWizardModalProps> = ({
  isOpen,
  onClose,
  coachName = 'Entrenador'
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [firstName, setFirstName] = useState(
    coachName !== 'Entrenador' && coachName !== 'Coach' ? coachName.split(' ')[0] : ''
  );
  const [lastName, setLastName] = useState(
    coachName !== 'Entrenador' && coachName !== 'Coach' ? coachName.split(' ').slice(1).join(' ') : ''
  );
  const [gymName, setGymName] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['Fuerza & Musculación']);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const focusOptions = [
    { 
      id: 'Fuerza & Musculación', 
      icon: '💪', 
      title: 'Fuerza y Músculo', 
      desc: 'Rutinas de sobrecarga, RPE y progresión por ciclos' 
    },
    { 
      id: 'Nutrición Deportiva', 
      icon: '🥗', 
      title: 'Nutrición y Macros', 
      desc: 'Planes nutricionales por fases y recetas inteligentes' 
    },
    { 
      id: 'Híbrido Integral', 
      icon: '⚡', 
      title: 'Híbrido (Fitness + Nutrición)', 
      desc: 'Gestión integral de entrenamiento y pautas de comidas' 
    },
    { 
      id: 'Hábitos & Estilo de Vida', 
      icon: '🌱', 
      title: 'Hábitos y Psicología', 
      desc: 'Agua, descanso, constancia diaria y adherencia' 
    },
    { 
      id: 'Recomposición Corporal', 
      icon: '🔥', 
      title: 'Recomposición y Definición', 
      desc: 'Pérdida de grasa, tonificación y bioimpedancia' 
    },
    { 
      id: 'Kinesiología & Readaptación', 
      icon: '🩺', 
      title: 'Kinesiología y Fisioterapia', 
      desc: 'Salud articular, movilidad y retorno deportivo' 
    },
    { 
      id: 'Clases Grupales', 
      icon: '⚡', 
      title: 'Clases y CrossFit', 
      desc: 'WODs, reserva de cupos y horarios grupales' 
    },
    { 
      id: 'Resistencia y Running', 
      icon: '🏃', 
      title: 'Resistencia y Running', 
      desc: 'Cardio, ritmos, FC y acondicionamiento aeróbico' 
    }
  ];

  const currentDisplayName = `${firstName} ${lastName}`.trim() || coachName;
  const inviteSlug = currentDisplayName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const inviteLink = `${window.location.origin}/invite/profe-${inviteSlug || 'coach'}`;

  const toggleFocus = (id: string) => {
    if (selectedFocus.includes(id)) {
      if (selectedFocus.length > 1) {
        setSelectedFocus(selectedFocus.filter(f => f !== id));
      }
    } else {
      setSelectedFocus([...selectedFocus, id]);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    toast.success('¡Enlace de invitación copiado al portapapeles!', {
      style: { background: '#ffffff', color: '#4f46e5', border: '1px solid #c7d2fe', fontWeight: 'bold' }
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleFinish = async () => {
    setIsSaving(true);
    
    // Disparar celebración con confeti
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.55 }
    });

    localStorage.setItem('coach_wizard_completed', 'true');
    if (gymName) {
      localStorage.setItem('coach_gym_name', gymName);
    }
    localStorage.setItem('coach_focus_areas', JSON.stringify(selectedFocus));

    // Guardar perfil en backend via PATCH /profile
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            first_name: firstName.trim() || undefined,
            last_name: lastName.trim() || undefined,
            business_name: gymName.trim() || undefined,
            specialty: selectedFocus[0] || 'PERSONAL_TRAINER'
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const saved = localStorage.getItem('user');
            const current = saved ? JSON.parse(saved) : {};
            localStorage.setItem('user', JSON.stringify({ ...current, ...data.user }));
          }
        }
      }
    } catch (e) {
      console.warn("Profile sync in background:", e);
    }

    toast.success('🎉 ¡Espacio de entrenamiento configurado con éxito!', {
      style: { background: '#ffffff', color: '#059669', border: '1px solid #10b981', fontWeight: 'bold' }
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl font-sans overflow-hidden">
        {/* Luces Ambientales Estáticas Fijas */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/15 dark:bg-indigo-600/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="w-full max-w-2xl bg-white/95 dark:bg-zinc-950/90 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden text-slate-900 dark:text-white flex flex-col max-h-[94vh] relative"
        >
          {/* Specular Rim Light */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

          {/* Header & Progreso */}
          <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-white/[0.07] bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={13} /> Paso {step} de 4 • Personalización Inicial
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck size={12} /> Espacio Profesional
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 h-1.5 bg-slate-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-500 ${
                    step >= i 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xs' 
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Contenido Dinámico */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
            {/* Paso 1: Tu Identidad & Marca */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto shadow-sm">
                  🏛️
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                    ¡Te damos la bienvenida a Habits!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-sm mx-auto leading-relaxed">
                    Personalicemos tu espacio en 30 segundos para que tus alumnos te identifiquen al instante.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                        Tu Nombre
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 text-slate-400 dark:text-zinc-500 w-4 h-4" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ej: Nahuel"
                          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl py-2.5 pl-10 pr-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors shadow-2xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                        Tu Apellido
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ej: Dangelo"
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl py-2.5 px-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                      Nombre de tu Gimnasio, Box o Marca
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 text-slate-400 dark:text-zinc-500 w-4 h-4" />
                      <input
                        type="text"
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder={`Ej: ${firstName || 'Coach'} Performance Lab (opcional)`}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl py-2.5 pl-10 pr-3 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors shadow-2xs"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                      Tus alumnos verán este nombre en el encabezado de sus aplicaciones móviles.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Paso 2: Especialidades Profesionales */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                    🎯
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">¿Cuál es tu enfoque principal?</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    Seleccioná tus áreas para configurar tus herramientas y plantillas de trabajo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {focusOptions.map((opt) => {
                    const isSelected = selectedFocus.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleFocus(opt.id)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-600/20 border-indigo-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-400/40'
                            : 'bg-slate-50/80 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/[0.07] text-slate-700 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-2xl shrink-0">{opt.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{opt.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Paso 3: Tu Enlace de Invitación para Alumnos */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-2 shadow-sm">
                    🚀
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Tu Enlace de Invitación</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    Con este enlace tus alumnos se registran y quedan conectados a tu panel de control automáticamente.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <QrCode size={15} className="text-indigo-600 dark:text-indigo-400" />
                      Enlace Directo WhatsApp
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      Listo para compartir
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteLink}
                      className="bg-transparent text-xs text-slate-600 dark:text-zinc-400 flex-1 outline-none font-mono truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    💡 <strong>Tip Pro:</strong> Podés compartir este link en tu bio de Instagram o mandarlo por WhatsApp a tus nuevos alumnos.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Paso 4: Todo Listo para Comenzar (Pedagógico y Completo) */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Header Paso 4 */}
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-[2px] mx-auto shadow-md">
                    <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[14px] flex items-center justify-center text-2xl">
                      🏆
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    ¡Tu ecosistema está listo, {firstName || currentDisplayName}!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Tenés a tu disposición todas las herramientas integradas para entrenar, nutrir, fidelizar y gestionar tus cobros en 1 solo lugar.
                  </p>
                </div>

                {/* Grid Pedagógica de los 6 Pilares de Habits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                  
                  {/* 1. Rutinas & Ciclos */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between hover:border-indigo-400/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          <Dumbbell size={16} />
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Rutinas & Ciclos</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
                        Periodización por mesociclos y microciclos, sobrecarga progresiva, 1RM y biblioteca con videos técnicos en HD.
                      </p>
                    </div>
                    <span className="mt-2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md self-start">
                      Fuerza & Ciclos
                    </span>
                  </div>

                  {/* 2. Planes de Nutrición */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between hover:border-emerald-400/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Apple size={16} />
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Nutrición & Fases</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
                        Pautas por periodos metabólicos (déficit, volumen, mantenimiento), control de macros y Smart Swap.
                      </p>
                    </div>
                    <span className="mt-2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md self-start">
                      Periodos & Macros
                    </span>
                  </div>

                  {/* 3. Clases, Grupos & Retos */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between hover:border-fuchsia-400/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
                          <Swords size={16} />
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Clases & Retos</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
                        Grupos por nivel, WODs, cupos para clases y retos gamificados para motivar a tu comunidad.
                      </p>
                    </div>
                    <span className="mt-2 text-[9px] font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-500/10 px-2 py-0.5 rounded-md self-start">
                      Gamificación
                    </span>
                  </div>

                  {/* 4. Agenda de Turnos */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between hover:border-purple-400/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <CalendarDays size={16} />
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Agenda de Turnos</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
                        Calendario inteligente para coordinar tus horarios, citas presenciales o virtuales con alumnos.
                      </p>
                    </div>
                    <span className="mt-2 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md self-start">
                      Smart Calendar
                    </span>
                  </div>

                  {/* 5. Mensajería & Validación Unificada */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between hover:border-rose-400/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <MessageSquare size={16} />
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Chat & Validación</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
                        Bandeja unificada con chat privado: valida videos de técnica y fotos de platos en 1 solo clic.
                      </p>
                    </div>
                    <span className="mt-2 text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md self-start">
                      Videos & Platos
                    </span>
                  </div>

                  {/* 6. Finanzas & Cobros */}
                  <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.07] flex flex-col justify-between hover:border-amber-400/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <CreditCard size={16} />
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">Finanzas & Cobros</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
                        Monitoreo de ingresos (MRR), membresías y recordatorios automáticos de pago vía WhatsApp.
                      </p>
                    </div>
                    <span className="mt-2 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md self-start">
                      MRR & WhatsApp
                    </span>
                  </div>

                </div>
              </motion.div>
            )}
          </div>

          {/* Footer de Navegación */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/[0.07] bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Anterior
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 px-3 py-2 transition-colors cursor-pointer"
              >
                Omitir por ahora
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFinish}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Guardando...' : 'Entrar a mi Panel 🚀'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    Shield,
    Bell,
    MessageSquare,
    AlertTriangle,
    Calendar,
    Moon,
    Sun,
    Check,
    X,
    Edit2,
    Save,
    Smartphone,
    Mail,
    Bot,
    Settings,
    Zap,
    HeartPulse,
    CheckCircle2,
    Flame,
    Sparkles,
    Send,
    RotateCcw,
    Link2,
    Award,
    Trophy,
    TrendingUp,
    ExternalLink,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DaySchedule {
    day: string;
    enabled: boolean;
    start: string;
    end: string;
}

interface AutoResponse {
    id: string;
    title: string;
    trigger: 'outside_hours' | 'vacation' | 'busy';
    icon: string;
    message: string;
    active: boolean;
}

interface RetentionTrigger {
    id: string;
    title: string;
    description: string;
    badge: string;
    icon: any;
    color: string;
    active: boolean;
    timing: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
    { day: 'Lunes', enabled: true, start: '08:00', end: '20:00' },
    { day: 'Martes', enabled: true, start: '08:00', end: '20:00' },
    { day: 'Miércoles', enabled: true, start: '08:00', end: '20:00' },
    { day: 'Jueves', enabled: true, start: '08:00', end: '20:00' },
    { day: 'Viernes', enabled: true, start: '08:00', end: '19:00' },
    { day: 'Sábado', enabled: true, start: '09:00', end: '13:00' },
    { day: 'Domingo', enabled: false, start: '10:00', end: '13:00' },
];

const DEFAULT_RESPONSES: AutoResponse[] = [
    {
        id: 'outside_hours',
        title: 'Mensaje Fuera de Horario (En App)',
        trigger: 'outside_hours',
        icon: '🌙',
        message: '¡Hola! Gracias por tu mensaje. En este momento estoy fuera de mi horario de atención. Te respondo mañana a primera hora. ¡A descansar y recuperar! 🙏',
        active: true,
    },
    {
        id: 'busy',
        title: 'En Sesión de Entrenamiento',
        trigger: 'busy',
        icon: '🏋️',
        message: '¡Hola! Estoy dando clase personalizada en este momento. Apenas termine la sesión (máximo 1 hora) te respondo con detalle dentro de la app. 💪',
        active: false,
    },
    {
        id: 'vacation',
        title: 'Modo Vacaciones / Receso',
        trigger: 'vacation',
        icon: '🏖️',
        message: '¡Hola! Estoy de receso hasta el próximo lunes. Tus rutinas en la app siguen 100% activas. Si surge alguna molestia o lesión, repórtala en la app. ¡Nos vemos pronto!',
        active: false,
    },
];

const DEFAULT_TRIGGERS: RetentionTrigger[] = [
    {
        id: 'sunday_briefing',
        title: 'Resumen Semanal & Enfoque de Próxima Semana',
        description: 'Envía el balance de logros de la semana que cierra (adherencia, kg levantados) y la estrategia/motivación para la semana que entra.',
        badge: 'Fidelización & Hábito',
        icon: Calendar,
        color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
        active: true,
        timing: 'Domingos a las 19:00 hs',
    },
    {
        id: 'streak',
        title: 'Felicitación por Racha de Entrenamientos',
        description: 'Notificación push de celebración al cumplir 7, 14 o 30 días seguidos de constancia con medalla de XP.',
        badge: 'Motivación & Retención',
        icon: Flame,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        active: true,
        timing: 'Inmediato al completar la sesión',
    },
    {
        id: 'inactivity',
        title: 'Check-in por Inactividad (4 Días)',
        description: 'Detecta si un alumno lleva 4 días sin registrar entrenamientos y le envía un saludo de acompañamiento.',
        badge: 'Anti-Abandono',
        icon: HeartPulse,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        active: true,
        timing: 'Al 4to día sin actividad',
    },
    {
        id: 'payment_link',
        title: 'Envío de Enlace Preventivo de Cuota',
        description: 'Genera y envía el enlace directo de renovación de cuota 2 días antes del vencimiento.',
        badge: 'Finanzas & Enlaces',
        icon: Link2,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        active: true,
        timing: '2 días antes del corte',
    },
];

export const CommunicationConfigTab: React.FC = () => {
    // Horarios
    const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
        const saved = localStorage.getItem('coach_comm_schedule');
        return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
    });

    // Filtro de emergencias / bypass
    const [emergencyBypass, setEmergencyBypass] = useState<boolean>(() => {
        const saved = localStorage.getItem('coach_comm_emergency_bypass');
        return saved ? JSON.parse(saved) : true;
    });

    // Auto-respuestas
    const [autoResponses, setAutoResponses] = useState<AutoResponse[]>(() => {
        const saved = localStorage.getItem('coach_comm_auto_responses');
        return saved ? JSON.parse(saved) : DEFAULT_RESPONSES;
    });

    // Triggers
    const [triggers, setTriggers] = useState<RetentionTrigger[]>(() => {
        const saved = localStorage.getItem('coach_comm_triggers');
        return saved ? JSON.parse(saved) : DEFAULT_TRIGGERS;
    });

    // Mensaje de Enfoque Semanal para el Domingo
    const [sundayCoachNote, setSundayCoachNote] = useState<string>(() => {
        return localStorage.getItem('coach_comm_sunday_note') || '¡Gran trabajo esta semana! La próxima semana subimos intensidad en fuerza de tren inferior. ¡A descansar hoy para arrancar con todo el lunes!';
    });

    const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
    const [editedText, setEditedText] = useState('');
    const [showSundayPreviewModal, setShowSundayPreviewModal] = useState(false);

    // Persistencia
    useEffect(() => {
        localStorage.setItem('coach_comm_schedule', JSON.stringify(schedule));
    }, [schedule]);

    useEffect(() => {
        localStorage.setItem('coach_comm_emergency_bypass', JSON.stringify(emergencyBypass));
    }, [emergencyBypass]);

    useEffect(() => {
        localStorage.setItem('coach_comm_auto_responses', JSON.stringify(autoResponses));
    }, [autoResponses]);

    useEffect(() => {
        localStorage.setItem('coach_comm_triggers', JSON.stringify(triggers));
    }, [triggers]);

    useEffect(() => {
        localStorage.setItem('coach_comm_sunday_note', sundayCoachNote);
    }, [sundayCoachNote]);

    const toggleDay = (index: number) => {
        setSchedule(prev => prev.map((d, i) => i === index ? { ...d, enabled: !d.enabled } : d));
        toast.success('Horario de atención actualizado');
    };

    const updateTime = (index: number, field: 'start' | 'end', value: string) => {
        setSchedule(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
    };

    const toggleResponse = (id: string) => {
        setAutoResponses(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
        toast.success('Estado de auto-respuesta modificado');
    };

    const startEditing = (response: AutoResponse) => {
        setEditingResponseId(response.id);
        setEditedText(response.message);
    };

    const saveEditing = (id: string) => {
        setAutoResponses(prev => prev.map(r => r.id === id ? { ...r, message: editedText } : r));
        setEditingResponseId(null);
        toast.success('Mensaje guardado correctamente');
    };

    const toggleTrigger = (id: string) => {
        setTriggers(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
        toast.success('Disparador automático actualizado');
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-lato">
            
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO BANNER PEDAGÓGICO: CANAL CENTRALIZADO HABITS
               ═══════════════════════════════════════════════════════════════ */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-emerald-500/10 to-purple-500/10 border border-indigo-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                        <Bot size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/40">
                                Centro de Notificaciones & Enlaces
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Canal Propio Activo
                            </span>
                        </div>
                        <h2 className="text-xl font-black font-montserrat text-slate-900 dark:text-white">
                            Canal Propio Habits & Notificaciones Push
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                            Toda la comunicación, el chat y el seguimiento transcurre <strong>dentro de nuestra app</strong>. Los canales externos se utilizan exclusivamente para enviar <strong>enlaces rápidos</strong> (links de renovación o comprobantes).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setShowSundayPreviewModal(true)}
                        className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black font-montserrat uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-500/20"
                    >
                        <Eye size={14} /> Ver Resumen del Domingo
                    </button>
                    <button
                        onClick={() => {
                            setSchedule(DEFAULT_SCHEDULE);
                            setAutoResponses(DEFAULT_RESPONSES);
                            setTriggers(DEFAULT_TRIGGERS);
                            setEmergencyBypass(true);
                            toast.success('Configuraciones restauradas');
                        }}
                        className="px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
                        title="Restaurar de fábrica"
                    >
                        <RotateCcw size={13} />
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                2. LAS 3 VÍAS DE CONTACTO REALES DE HABITS
               ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-black font-montserrat flex items-center gap-2 text-slate-900 dark:text-white">
                            <Smartphone size={18} className="text-indigo-500" /> Vías de Contacto del Ecosistema
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            La experiencia vive en la app; los canales externos solo distribuyen accesos y links.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* 1. Notificaciones Push en App */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-indigo-200/60 dark:border-indigo-900/40 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <Bell size={20} />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-200 dark:border-indigo-800/40 flex items-center gap-1">
                                <Check size={11} /> Canal Principal
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                                Notificaciones Push en App
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Alertas instantáneas al móvil del alumno: asignación de rutinas, validaciones de biomecánica con XP y recordatorios diarios.
                            </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                            <span>● Tiempo real en la App del Alumno</span>
                        </div>
                    </div>

                    {/* 2. Resumen Semanal de los Domingos */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-purple-200/60 dark:border-purple-900/40 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Calendar size={20} />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-black uppercase tracking-wider border border-purple-200 dark:border-purple-800/40 flex items-center gap-1">
                                <Check size={11} /> Domingo 19:00 hs
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                                Resumen Semanal & Enfoque
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Balance de la semana cerrada + estrategia de la semana siguiente para comenzar el lunes con máxima motivación.
                            </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                            <span>● Reporte interactivo automático</span>
                        </div>
                    </div>

                    {/* 3. Enlaces Rápidos (WhatsApp / Email) */}
                    <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Link2 size={20} />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                                <Check size={11} /> Solo Enlaces
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                                Enlaces de Pago & Activación
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Envío de links de checkout para renovación de cuotas y enlaces directos de bienvenida. Sin canales de chat externos.
                            </p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <span>● Redirección directa a checkout seguro</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                3. ENFOQUE DEL DOMINGO & PERSONALIZACIÓN DEL COACH
               ═══════════════════════════════════════════════════════════════ */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                        <h3 className="text-base font-black font-montserrat flex items-center gap-2 text-slate-900 dark:text-white">
                            <Award size={18} className="text-purple-500" />
                            Mensaje Motivacional para el Resumen del Domingo
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Este texto se incluirá en el reporte que los alumnos reciben cada domingo a las 19:00 hs para arrancar la semana.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSundayPreviewModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 shrink-0"
                    >
                        <Eye size={13} /> Previsualizar Tarjeta del Alumno
                    </button>
                </div>

                <div className="space-y-2">
                    <textarea
                        rows={3}
                        value={sundayCoachNote}
                        onChange={(e) => setSundayCoachNote(e.target.value)}
                        className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                        placeholder="Escribe tu mensaje motivacional semanal..."
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>💡 Se envía automáticamente junto con los datos de adherencia y volumen de cada alumno.</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Guardado automático</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                4. DISPARADORES AUTOMÁTICOS DE RETENCIÓN (TRIGGERS)
               ═══════════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-black font-montserrat flex items-center gap-2 text-slate-900 dark:text-white">
                        <Zap size={18} className="text-amber-500" /> Automatizaciones de Notificaciones & Acompañamiento
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Disparadores en segundo plano que mantienen al alumno comprometido sin esfuerzo manual.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {triggers.map((trigger) => {
                        const Icon = trigger.icon;
                        return (
                            <div
                                key={trigger.id}
                                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-3 ${
                                    trigger.active
                                        ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm'
                                        : 'bg-slate-100/40 dark:bg-zinc-900/40 border-slate-200/40 dark:border-zinc-800/40 opacity-65'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${trigger.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleTrigger(trigger.id)}
                                            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                                                trigger.active ? 'bg-indigo-600 justify-end' : 'bg-slate-200 dark:bg-zinc-700 justify-start'
                                            }`}
                                        >
                                            <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-xs" />
                                        </button>
                                    </div>

                                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-wider">
                                        {trigger.badge}
                                    </span>

                                    <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white mt-2 mb-1">
                                        {trigger.title}
                                    </h4>

                                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-2">
                                        {trigger.description}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
                                    <span>⏱️ {trigger.timing}</span>
                                    <span>{trigger.active ? '🟢 Activo' : '⚪ Pausado'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                5. HORARIOS DE ATENCIÓN & GUARDIÁN DE DESCANSO (GATEKEEPER)
               ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Columna Izquierda: Grilla Semanal de Horarios */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                        <div>
                            <h3 className="text-base font-black font-montserrat flex items-center gap-2 text-slate-900 dark:text-white">
                                <Clock size={18} className="text-indigo-500" /> Horario de Atención en la App
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Fuera de estas horas se enviará la auto-respuesta dentro del chat de la app.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {schedule.map((day, idx) => (
                            <div
                                key={day.day}
                                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                    day.enabled
                                        ? 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60'
                                        : 'bg-slate-100/40 dark:bg-zinc-900/40 border-slate-200/40 dark:border-zinc-800/40 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-3 w-32">
                                    <button
                                        type="button"
                                        onClick={() => toggleDay(idx)}
                                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                                            day.enabled
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
                                        }`}
                                    >
                                        {day.enabled && <Check size={12} />}
                                    </button>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{day.day}</span>
                                </div>

                                {day.enabled ? (
                                    <div className="flex items-center gap-2 text-xs font-mono">
                                        <input
                                            type="time"
                                            value={day.start}
                                            onChange={(e) => updateTime(idx, 'start', e.target.value)}
                                            className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                        />
                                        <span className="text-slate-400">a</span>
                                        <input
                                            type="time"
                                            value={day.end}
                                            onChange={(e) => updateTime(idx, 'end', e.target.value)}
                                            className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-xs font-bold text-slate-400 italic">Descanso / Silenciado</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Interruptor de Urgencias & Excepciones */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Alertas de Lesión (Bypass) */}
                    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setEmergencyBypass(!emergencyBypass);
                                    toast.success(emergencyBypass ? 'Filtro de urgencias desactivado' : 'Filtro de urgencias activado');
                                }}
                                className={`w-12 h-7 rounded-full transition-colors p-1 flex items-center ${
                                    emergencyBypass ? 'bg-rose-600 justify-end' : 'bg-slate-200 dark:bg-zinc-700 justify-start'
                                }`}
                            >
                                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-xs" />
                            </button>
                        </div>
                        <div>
                            <h4 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                                Filtro de Alertas Críticas (Bypass de Urgencia)
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Si un alumno marca un dolor articular fuerte, fatiga extrema o lesión, la notificación push te llegará de inmediato incluso fuera de horario para brindarle asistencia prioritaria.
                            </p>
                        </div>
                    </div>

                    {/* Resumen del Estado Actual */}
                    <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                            <Shield size={16} />
                            <span>Protección de Descanso Activa</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                            Tus mensajes están organizados para darte paz mental y garantizar que tus alumnos siempre reciban atención cordial sin invadir tus horas personales.
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                6. MODAL PREVIEW DEL RESUMEN SEMANAL DEL DOMINGO
               ═══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showSundayPreviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-lato"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black font-montserrat text-slate-900 dark:text-white">
                                            Vista Previa: Resumen Semanal (Domingo)
                                        </h3>
                                        <p className="text-[11px] text-slate-400">Así es como lo recibe el alumno en su teléfono</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSundayPreviewModal(false)}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Tarjeta Visual de Alumno Simulada */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white space-y-4 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Trophy size={18} className="text-amber-400" />
                                        <span className="text-xs font-black font-montserrat uppercase tracking-wider text-indigo-200">
                                            Tu Semana en Resumen
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                                        Semana 12
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-lg font-black font-montserrat text-emerald-400">100%</div>
                                        <div className="text-[10px] text-indigo-200 font-bold">Adherencia</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-lg font-black font-montserrat text-amber-400">4 / 4</div>
                                        <div className="text-[10px] text-indigo-200 font-bold">Sesiones</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                        <div className="text-lg font-black font-montserrat text-sky-400">14.2 t</div>
                                        <div className="text-[10px] text-indigo-200 font-bold">Volumen</div>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
                                    <div className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                                        <Sparkles size={13} />
                                        <span>Enfoque para la Próxima Semana:</span>
                                    </div>
                                    <p className="text-xs text-white/90 leading-relaxed italic">
                                        "{sundayCoachNote}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => {
                                        toast.success('¡Notificación de prueba enviada!');
                                        setShowSundayPreviewModal(false);
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black font-montserrat uppercase tracking-wider shadow-sm transition-all"
                                >
                                    Enviar Notificación de Prueba
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

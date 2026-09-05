import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, ChevronRight, ChevronDown, Target, CreditCard, 
    UserPlus, Dumbbell, CheckCircle2, Clock, AlertCircle, 
    Users, BarChart3, Calendar, MessageSquare, Flame
} from 'lucide-react';
import { trainerApi, type TrainerDashboardData } from '../../api/trainer';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const TrainerRoster: React.FC = () => {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { lang } = useLanguage();
    const isClinical = mode === 'CLINICAL';
    
    // State
    const [dashboardData, setDashboardData] = useState<TrainerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Menú desplegable de estadísticas (CERRADO POR DEFECTO para evitar scroll forzado)
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    
    // Filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [objectiveFilter, setObjectiveFilter] = useState<'ALL' | 'HYPERTROPHY' | 'REHAB'>('ALL');
    const [planFilter, setPlanFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');
    const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'DUE'>('ALL');

    useEffect(() => {
        let isMounted = true;
        const fetchClients = async () => {
            try {
                const data = await trainerApi.getDashboard();
                if (isMounted) {
                    if (data && data.clients) {
                        data.clients = data.clients.map((c, idx) => ({
                            ...c,
                            planStatus: (c as any).planStatus || 'ACTIVE',
                            paymentStatus: (c as any).paymentStatus || 'paid',
                            // Indicador de mensajería interna no leída (plataforma propia)
                            hasUnreadMessage: (c as any).hasUnreadMessage ?? (idx === 0),
                            unreadMessagesCount: (c as any).unreadMessagesCount ?? (idx === 0 ? 1 : 0)
                        }));
                    }
                    setDashboardData(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchClients();
        return () => { isMounted = false; };
    }, []);

    // Clientes filtrados
    const filteredClients = useMemo(() => {
        if (!dashboardData?.clients) return [];
        
        return dashboardData.clients.filter(client => {
            // Buscador
            const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Objetivo
            const isRehab = client.painAreas && client.painAreas.length > 0;
            const matchesObjective = objectiveFilter === 'ALL' 
                ? true 
                : objectiveFilter === 'REHAB' 
                    ? isRehab 
                    : !isRehab;
            
            // Estado de Plan
            const isDraft = (client as any).planStatus === 'DRAFT';
            const matchesPlan = planFilter === 'ALL'
                ? true
                : planFilter === 'DRAFT'
                    ? isDraft
                    : !isDraft;

            // Estado de Cuota
            const isPastDue = (client as any).paymentStatus === 'past_due';
            const matchesPayment = paymentFilter === 'ALL'
                ? true
                : paymentFilter === 'DUE'
                    ? isPastDue
                    : !isPastDue;
            
            return matchesSearch && matchesObjective && matchesPlan && matchesPayment;
        });
    }, [dashboardData, searchQuery, objectiveFilter, planFilter, paymentFilter]);

    // Métricas globales reactivas
    const metrics = useMemo(() => {
        if (!dashboardData?.clients) {
            return { rehab: 0, hypertrophy: 0, total: 0, alDia: 0, enMora: 0, activePlans: 0, pendingPlans: 0 };
        }
        const clients = dashboardData.clients;
        const total = clients.length;
        const rehab = clients.filter(c => c.painAreas && c.painAreas.length > 0).length;
        const hypertrophy = total - rehab;
        const alDia = clients.filter(c => (c as any).paymentStatus !== 'past_due').length;
        const enMora = total - alDia;
        const pendingPlans = clients.filter(c => (c as any).planStatus === 'DRAFT').length;
        const activePlans = total - pendingPlans;

        return {
            total,
            rehab,
            hypertrophy,
            alDia,
            enMora,
            activePlans,
            pendingPlans,
        };
    }, [dashboardData]);

    const handleCreateNew = () => {
        useOnboardingPTStore.getState().resetOnboarding();
        navigate('/cliente-cero-pt');
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // ACCIONES RÁPIDAS A 1 CLIC (CON e.stopPropagation())
    // ═══════════════════════════════════════════════════════════════════════════

    // 1 Clic: Alternar Cuota (Al Día <-> En Mora)
    const handleTogglePaymentStatus = (clientId: string, clientName: string) => {
        setDashboardData(prev => {
            if (!prev) return prev;
            let updatedStatus = 'paid';
            const updatedClients = prev.clients.map(c => {
                if (c.id === clientId) {
                    const currentStatus = (c as any).paymentStatus || 'paid';
                    const newStatus = currentStatus === 'paid' ? 'past_due' : 'paid';
                    updatedStatus = newStatus;
                    return { ...c, paymentStatus: newStatus };
                }
                return c;
            });

            if (updatedStatus === 'paid') {
                toast.success(`Cuota de ${clientName}: Marcada Al Día ✅`, {
                    icon: '💳',
                    duration: 3000
                });
            } else {
                toast.error(`Cuota de ${clientName}: Marcada En Mora ⚠️`, {
                    icon: '⚠️',
                    duration: 3000
                });
            }

            return { ...prev, clients: updatedClients };
        });
    };

    // 1 Clic: Alternar Estado de Plan (Activo <-> Pendiente)
    const handleTogglePlanStatus = (clientId: string, clientName: string) => {
        setDashboardData(prev => {
            if (!prev) return prev;
            let updatedPlan = 'ACTIVE';
            const updatedClients = prev.clients.map(c => {
                if (c.id === clientId) {
                    const currentStatus = (c as any).planStatus || 'ACTIVE';
                    const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
                    updatedPlan = newStatus;
                    return { ...c, planStatus: newStatus };
                }
                return c;
            });

            if (updatedPlan === 'ACTIVE') {
                toast.success(`Plan de ${clientName}: Activado ✅`, {
                    icon: '🏋️',
                    duration: 3000
                });
            } else {
                toast.success(`Plan de ${clientName}: En Borrador / Pendiente ⏳`, {
                    icon: '📝',
                    duration: 3000
                });
            }

            return { ...prev, clients: updatedClients };
        });
    };

    // 1 Clic: Agendar Turno en Calendario
    const handleQuickSchedule = (clientId: string, clientName: string) => {
        toast.success(`Abriendo agenda para ${clientName}...`, { icon: '📅' });
        navigate(`/calendar?athlete=${clientId}&name=${encodeURIComponent(clientName)}`);
    };

    // 1 Clic: Diseñar / Ver Rutina en Plan Builder
    const handleQuickPlan = (clientId: string, clientName: string) => {
        toast.success(`Cargando diseñador de rutinas para ${clientName}...`, { icon: '🏋️' });
        navigate(`/plan-builder?athleteId=${clientId}`);
    };

    // 1 Clic: Mensajería Interna Propia de la Plataforma
    const handleQuickInternalChat = (clientId: string, clientName: string) => {
        // Al abrir la mensajería, limpiamos la notificación pendiente
        setDashboardData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                clients: prev.clients.map(c => c.id === clientId ? { ...c, hasUnreadMessage: false, unreadMessagesCount: 0 } : c)
            };
        });
        toast.success(`Abriendo mensajería interna con ${clientName}...`, { icon: '💬' });
        navigate(`/inbox?athlete=${clientId}`);
    };

    if (isLoading) {
        return (
            <div className={`flex-1 p-6 md:p-10 flex items-center justify-center min-h-screen ${isClinical ? 'bg-slate-50' : 'bg-zinc-950'}`}>
                <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${isClinical ? 'border-indigo-600' : 'border-indigo-500'}`} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 md:p-6 lg:p-8 font-sans transition-colors duration-500 pb-36 ${
            isClinical ? 'text-slate-900 bg-[#F4F6FB]' : 'text-white bg-zinc-950'
        }`}>
            {/* ═══════════════════════════════════════════════════════════════
                HEADER PRINCIPAL CON BOTÓN GENERAR NUEVO
               ═══════════════════════════════════════════════════════════════ */}
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <span className={`px-3 py-0.5 border rounded-full text-[10px] font-black uppercase tracking-widest ${
                            isClinical ? 'bg-indigo-50/90 border-indigo-200/80 text-indigo-700' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}>
                            Lista de Clientes
                        </span>
                        <span className={`text-xs font-black font-montserrat ${isClinical ? 'text-indigo-600' : 'text-indigo-400'}`}>
                            {metrics.total} {metrics.total === 1 ? 'Activo' : 'Activos'}
                        </span>
                    </div>
                    <h1 className={`text-3xl font-black font-montserrat tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        Contactos Totales
                    </h1>
                </div>

                {/* BOTÓN GENERAR NUEVO ALUMNO */}
                <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-montserrat font-black uppercase text-xs tracking-wider shadow-md shadow-indigo-500/20 transition-all cursor-pointer group shrink-0"
                >
                    <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                    <span>Nuevo Alumno</span>
                </button>
            </header>

            {/* ═══════════════════════════════════════════════════════════════
                BARRA DE BÚSQUEDA Y FILTROS CLAROS
               ═══════════════════════════════════════════════════════════════ */}
            <div className={`border rounded-3xl p-4 md:p-5 mb-4 shadow-xs ${
                isClinical ? 'bg-white/90 border-slate-200/80 backdrop-blur-sm' : 'bg-zinc-900 border-zinc-800'
            }`}>
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                    {/* Buscador */}
                    <div className="flex-1 relative">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`} size={16} />
                        <input
                            type="text"
                            placeholder="Buscar alumno por nombre o correo..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full border rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold focus:outline-none transition-all shadow-2xs ${
                                isClinical 
                                    ? 'bg-slate-50/90 border-slate-200/80 focus:bg-white focus:border-indigo-500 text-slate-900 placeholder:text-slate-400' 
                                    : 'bg-zinc-950 border-zinc-800 focus:border-indigo-500 text-white'
                            }`}
                        />
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-4 items-center">
                        
                        {/* Filtro 1: Objetivo */}
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black font-montserrat uppercase tracking-wider ${
                                isClinical ? 'text-slate-400' : 'text-zinc-500'
                            }`}>
                                Objetivo:
                            </span>
                            <div className={`flex rounded-xl p-0.5 border ${
                                isClinical ? 'bg-slate-50 border-slate-200/80' : 'bg-zinc-950 border-zinc-800'
                            }`}>
                                {[
                                    { id: 'ALL', label: 'Todos' },
                                    { id: 'HYPERTROPHY', label: 'Fuerza/Hip' },
                                    { id: 'REHAB', label: 'Rehab' }
                                ].map((obj) => (
                                    <button
                                        key={obj.id}
                                        onClick={() => setObjectiveFilter(obj.id as any)}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                            objectiveFilter === obj.id
                                                ? (isClinical ? 'bg-indigo-600 text-white shadow-xs' : 'bg-zinc-800 text-white shadow-xs')
                                                : (isClinical ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200')
                                        }`}
                                    >
                                        {obj.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtro 2: Estado de Plan */}
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black font-montserrat uppercase tracking-wider ${
                                isClinical ? 'text-slate-400' : 'text-zinc-500'
                            }`}>
                                Plan:
                            </span>
                            <div className={`flex rounded-xl p-0.5 border ${
                                isClinical ? 'bg-slate-50 border-slate-200/80' : 'bg-zinc-950 border-zinc-800'
                            }`}>
                                {[
                                    { id: 'ALL', label: 'Todos' },
                                    { id: 'ACTIVE', label: 'Activo' },
                                    { id: 'DRAFT', label: 'Pendiente' }
                                ].map((pf) => (
                                    <button
                                        key={pf.id}
                                        onClick={() => setPlanFilter(pf.id as any)}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                            planFilter === pf.id
                                                ? (isClinical ? 'bg-indigo-600 text-white shadow-xs' : 'bg-zinc-800 text-white shadow-xs')
                                                : (isClinical ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200')
                                        }`}
                                    >
                                        {pf.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtro 3: Cuota */}
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black font-montserrat uppercase tracking-wider ${
                                isClinical ? 'text-slate-400' : 'text-zinc-500'
                            }`}>
                                Cuota:
                            </span>
                            <div className={`flex rounded-xl p-0.5 border ${
                                isClinical ? 'bg-slate-50 border-slate-200/80' : 'bg-zinc-950 border-zinc-800'
                            }`}>
                                {[
                                    { id: 'ALL', label: 'Todas' },
                                    { id: 'PAID', label: 'Al Día' },
                                    { id: 'DUE', label: 'Mora' }
                                ].map((pay) => (
                                    <button
                                        key={pay.id}
                                        onClick={() => setPaymentFilter(pay.id as any)}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                            paymentFilter === pay.id
                                                ? (isClinical ? 'bg-indigo-600 text-white shadow-xs' : 'bg-zinc-800 text-white shadow-xs')
                                                : (isClinical ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200')
                                        }`}
                                    >
                                        {pay.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                BOTÓN DESPLEGABLE DE ESTADÍSTICAS (CERRADO POR DEFECTO)
               ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-6">
                <button
                    onClick={() => setIsStatsOpen(!isStatsOpen)}
                    className={`w-full p-3.5 md:p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left group cursor-pointer shadow-xs ${
                        isClinical 
                            ? 'bg-white/90 hover:bg-white border-slate-200/80 hover:border-indigo-300 backdrop-blur-md' 
                            : 'bg-zinc-900/90 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 backdrop-blur-md'
                    }`}
                >
                    {/* Izquierda: Icono + Título + Micro-Pills informativas */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className={`p-2 rounded-xl transition-colors ${
                            isClinical ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100' : 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30'
                        }`}>
                            <BarChart3 size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-black font-montserrat uppercase tracking-wider ${
                                    isClinical ? 'text-slate-800' : 'text-white'
                                }`}>
                                    Estadísticas y Resumen del Roster
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isClinical ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                    {metrics.total} {metrics.total === 1 ? 'Alumno' : 'Alumnos'}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                                {isStatsOpen 
                                    ? 'Métricas de objetivos, planes y cuotas desplegadas' 
                                    : 'Haz clic para ver métricas de objetivos, planes asignados y estado de cuotas'}
                            </p>
                        </div>

                        {/* Micro-pills visibles incluso cuando el menú está cerrado */}
                        <div className="hidden lg:flex items-center gap-2 ml-2">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                isClinical ? 'bg-indigo-50/70 border-indigo-200/60 text-indigo-700' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                            }`}>
                                🎯 {metrics.hypertrophy} Fuerza · {metrics.rehab} Rehab
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                isClinical ? 'bg-sky-50/70 border-sky-200/60 text-sky-700' : 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                            }`}>
                                📋 {metrics.activePlans} Planes Activos {metrics.pendingPlans > 0 ? `· ${metrics.pendingPlans} Pend.` : ''}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                metrics.enMora > 0 
                                    ? (isClinical ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-rose-500/10 border-rose-500/20 text-rose-300')
                                    : (isClinical ? 'bg-emerald-50/70 border-emerald-200/60 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300')
                            }`}>
                                💳 {metrics.alDia} Al Día {metrics.enMora > 0 ? `· ${metrics.enMora} En Mora` : ''}
                            </span>
                        </div>
                    </div>

                    {/* Derecha: Texto toggle y chevron animado */}
                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <span className={`text-[11px] font-bold font-montserrat uppercase tracking-wider ${
                            isClinical ? 'text-indigo-600' : 'text-indigo-400'
                        }`}>
                            {isStatsOpen ? 'Ocultar estadísticas' : 'Ver estadísticas'}
                        </span>
                        <div className={`p-1.5 rounded-lg transition-transform duration-300 ${
                            isStatsOpen ? 'rotate-180' : ''
                        } ${
                            isClinical ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </button>

                {/* CONTENIDO DESPLEGABLE CON LAS 3 TARJETAS PEDAGÓGICAS */}
                <AnimatePresence>
                    {isStatsOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4 pb-2">
                                
                                {/* 1. DISTRIBUCIÓN POR OBJETIVO */}
                                <div className={`p-5 md:p-6 rounded-3xl border shadow-xs flex flex-row items-center justify-between transition-all ${
                                    isClinical ? 'bg-white/90 border-slate-200/80 backdrop-blur-sm' : 'bg-zinc-900 border-zinc-800'
                                }`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`p-2 rounded-xl ${isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                                <Target size={16} />
                                            </div>
                                            <div>
                                                <h3 className={`text-xs font-black font-montserrat uppercase tracking-wider ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                                    Objetivos
                                                </h3>
                                                <p className="text-[11px] text-slate-400 font-medium">Enfoque de entrenamiento</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-xs font-bold gap-1.5 mt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                                                <span className={isClinical ? 'text-slate-600' : 'text-zinc-400'}>
                                                    {metrics.hypertrophy} Fuerza / Hipertrofia
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                                <span className={isClinical ? 'text-slate-600' : 'text-zinc-400'}>
                                                    {metrics.rehab} Rehabilitación / Salud
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-18 h-18 relative shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                            <path className={isClinical ? 'text-slate-100' : 'text-zinc-800'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                                            <path className="text-indigo-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(metrics.hypertrophy / (metrics.total || 1)) * 100}, 100`} />
                                            {metrics.rehab > 0 && (
                                                <path className="text-rose-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(metrics.rehab / (metrics.total || 1)) * 100}, 100`} strokeDashoffset={`-${(metrics.hypertrophy / (metrics.total || 1)) * 100}`} />
                                            )}
                                        </svg>
                                    </div>
                                </div>

                                {/* 2. ESTADO DE PLANES Y RUTINAS */}
                                <div className={`p-5 md:p-6 rounded-3xl border shadow-xs flex flex-row items-center justify-between transition-all ${
                                    isClinical ? 'bg-white/90 border-slate-200/80 backdrop-blur-sm' : 'bg-zinc-900 border-zinc-800'
                                }`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`p-2 rounded-xl ${isClinical ? 'bg-sky-50 text-sky-600' : 'bg-sky-500/20 text-sky-400'}`}>
                                                <Dumbbell size={16} />
                                            </div>
                                            <div>
                                                <h3 className={`text-xs font-black font-montserrat uppercase tracking-wider ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                                    Planes Asignados
                                                </h3>
                                                <p className="text-[11px] text-slate-400 font-medium">Cobertura de rutinas</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-xs font-bold gap-1.5 mt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                                <span className={isClinical ? 'text-slate-600' : 'text-zinc-400'}>
                                                    {metrics.activePlans} Plan Activo
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                                <span className={isClinical ? 'text-slate-600' : 'text-zinc-400'}>
                                                    {metrics.pendingPlans} Pendiente / Borrador
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-18 h-18 relative shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                            <path className={isClinical ? 'text-slate-100' : 'text-zinc-800'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                                            <path className="text-sky-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(metrics.activePlans / (metrics.total || 1)) * 100}, 100`} />
                                            {metrics.pendingPlans > 0 && (
                                                <path className="text-amber-400" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(metrics.pendingPlans / (metrics.total || 1)) * 100}, 100`} strokeDashoffset={`-${(metrics.activePlans / (metrics.total || 1)) * 100}`} />
                                            )}
                                        </svg>
                                    </div>
                                </div>

                                {/* 3. ESTADO DE CUOTAS Y FINANZAS */}
                                <div className={`p-5 md:p-6 rounded-3xl border shadow-xs flex flex-row items-center justify-between transition-all ${
                                    isClinical ? 'bg-white/90 border-slate-200/80 backdrop-blur-sm' : 'bg-zinc-900 border-zinc-800'
                                }`}>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`p-2 rounded-xl ${isClinical ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                <CreditCard size={16} />
                                            </div>
                                            <div>
                                                <h3 className={`text-xs font-black font-montserrat uppercase tracking-wider ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                                    Estado de Cuotas
                                                </h3>
                                                <p className="text-[11px] text-slate-400 font-medium">Cobros y membresías</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-xs font-bold gap-1.5 mt-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                <span className={isClinical ? 'text-slate-600' : 'text-zinc-400'}>
                                                    {metrics.alDia} Al Día
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                                <span className={isClinical ? 'text-slate-600' : 'text-zinc-400'}>
                                                    {metrics.enMora} En Mora / Pendiente
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-18 h-18 relative shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                            <path className={isClinical ? 'text-slate-100' : 'text-zinc-800'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                                            <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(metrics.alDia / (metrics.total || 1)) * 100}, 100`} />
                                            {metrics.enMora > 0 && (
                                                <path className="text-rose-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(metrics.enMora / (metrics.total || 1)) * 100}, 100`} strokeDashoffset={`-${(metrics.alDia / (metrics.total || 1)) * 100}`} />
                                            )}
                                        </svg>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                LISTA DE ALUMNOS (TARJETAS PRÉMIUM CON ACCIONES RÁPIDAS A 1 CLIC)
               ═══════════════════════════════════════════════════════════════ */}
            <div className={`border rounded-3xl overflow-hidden shadow-xs ${
                isClinical ? 'bg-white/95 border-slate-200/80 backdrop-blur-sm' : 'bg-zinc-900 border-zinc-800'
            }`}>
                <div className={`divide-y ${isClinical ? 'divide-slate-100' : 'divide-zinc-800/50'}`}>
                    {filteredClients.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className={`p-4 rounded-full mb-3 ${isClinical ? 'bg-slate-100 text-slate-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                <Users size={24} />
                            </div>
                            <h4 className={`text-sm font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                No se encontraron alumnos
                            </h4>
                            <p className="text-xs text-slate-400 max-w-sm mt-1">
                                No hay coincidencias con los filtros aplicados. Puedes restablecer los filtros o registrar un nuevo alumno.
                            </p>
                            <button
                                onClick={handleCreateNew}
                                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-montserrat font-black text-xs uppercase tracking-wider transition-all"
                            >
                                + Registrar Alumno
                            </button>
                        </div>
                    ) : (
                        filteredClients.map((client) => {
                            const hasUnread = (client as any).hasUnreadMessage;
                            const isPaid = (client as any).paymentStatus !== 'past_due';
                            const isPlanActive = (client as any).planStatus !== 'DRAFT';

                            return (
                                <div 
                                    key={client.id}
                                    onClick={() => navigate(`/trainer/athlete/${client.id}`)}
                                    className="p-4 sm:p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-200 cursor-pointer group hover:bg-slate-50/80 dark:hover:bg-zinc-800/60"
                                >
                                    {/* LADO IZQUIERDO: AVATAR, DATOS VITALES Y OBJETIVOS */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        {/* Avatar con indicador de mensaje interno no leído */}
                                        <div className="relative shrink-0">
                                            {client.photoUrl ? (
                                                <img 
                                                    src={client.photoUrl} 
                                                    alt={client.name} 
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-zinc-700" 
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-montserrat font-black text-sm ${
                                                    isClinical 
                                                        ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200/70' 
                                                        : 'bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/30'
                                                }`}>
                                                    {client.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}

                                            {/* Indicador de Mensajería Interna No Leída (Punto Ámbar Pulso) */}
                                            {hasUnread && (
                                                <span 
                                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse shadow-xs" 
                                                    title="Mensaje interno sin leer en la plataforma"
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <h4 className={`font-black font-montserrat text-sm truncate ${
                                                    isClinical ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-400'
                                                } transition-colors`}>
                                                    {client.name}
                                                </h4>
                                                {!client.lastWorkout && (
                                                    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                        isClinical ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                        Nuevo
                                                    </span>
                                                )}
                                                {client.streak > 0 && (
                                                    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                                        isClinical ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400'
                                                    }`}>
                                                        <Flame size={10} />
                                                        {client.streak}d racha
                                                    </span>
                                                )}
                                                {hasUnread && (
                                                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                                                        Mensaje pendiente
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                                <p className={`truncate flex items-center gap-1.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                                    <span className="font-black text-[10px] font-montserrat uppercase tracking-wider text-slate-400">Objetivo:</span>
                                                    <span className={`font-semibold truncate ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>
                                                        {client.painAreas?.length ? 'Rehabilitación y Readaptación' : 'Fuerza Máxima e Hipertrofia'}
                                                    </span>
                                                </p>
                                                <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">•</span>
                                                <p className={`text-[11px] font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                                    {client.lastWorkout ? `Último entreno: ${client.lastWorkout}` : 'Sin entrenos aún'}
                                                </p>
                                            </div>

                                            {client.criticalTags && client.criticalTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {client.criticalTags.map(tag => (
                                                        <span key={tag} className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap border ${
                                                            client.riskLevel === 'RED'
                                                                ? isClinical ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                : isClinical ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        }`}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* LADO DERECHO: ESTADOS A SIMPLE VISTA Y BARRA DE ACCIONES A 1 CLIC */}
                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 md:gap-6 shrink-0 self-start lg:self-auto ml-16 lg:ml-0">
                                        
                                        {/* Estado del Plan (Interactivo a 1 clic para alternar) */}
                                        <div className="text-right">
                                            <p className={`text-[10px] font-black font-montserrat uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                                Plan
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePlanStatus(client.id, client.name);
                                                }}
                                                title="Clic para alternar estado de plan (Activo / Pendiente)"
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                                    isPlanActive 
                                                        ? (isClinical ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30')
                                                        : (isClinical ? 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30')
                                                }`}
                                            >
                                                {isPlanActive ? (
                                                    <>
                                                        <CheckCircle2 size={11} className="text-indigo-600 dark:text-indigo-400" />
                                                        <span>Activo</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={11} className="text-amber-500" />
                                                        <span>Pendiente</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        
                                        {/* Estado de Cuota (Interactivo a 1 clic para alternar) */}
                                        <div className="text-right">
                                            <p className={`text-[10px] font-black font-montserrat uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                                Cuota
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePaymentStatus(client.id, client.name);
                                                }}
                                                title="Clic para alternar cuota (Al Día / En Mora)"
                                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                                                    isPaid 
                                                        ? (isClinical ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30')
                                                        : (isClinical ? 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30')
                                                }`}
                                            >
                                                {isPaid ? (
                                                    <>
                                                        <CheckCircle2 size={11} className="text-emerald-500" />
                                                        <span>Al Día</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle size={11} className="text-rose-500" />
                                                        <span>En Mora</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* ═══════════════════════════════════════════════════════════════
                                            MICRO-TOOLBAR DE ACCIONES RÁPIDAS A 1 CLIC
                                           ═══════════════════════════════════════════════════════════════ */}
                                        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border transition-all ${
                                            isClinical ? 'bg-slate-100/80 border-slate-200/80' : 'bg-zinc-950/70 border-zinc-800'
                                        }`}>
                                            {/* Acción 1: 📅 Agendar Turno */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickSchedule(client.id, client.name);
                                                }}
                                                title="📅 Agendar Turno en Calendario"
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-indigo-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400'
                                                }`}
                                            >
                                                <Calendar size={15} />
                                            </button>

                                            {/* Acción 2: 🏋️ Diseñar / Ver Rutina */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickPlan(client.id, client.name);
                                                }}
                                                title="🏋️ Diseñar o Ver Plan de Entrenamiento"
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-sky-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-sky-400'
                                                }`}
                                            >
                                                <Dumbbell size={15} />
                                            </button>

                                            {/* Acción 3: 💬 Mensajería Interna de la Plataforma */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickInternalChat(client.id, client.name);
                                                }}
                                                title={hasUnread ? "💬 Tienes un mensaje interno sin leer" : "💬 Enviar Mensaje Interno (Chat Propio)"}
                                                className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-emerald-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400'
                                                }`}
                                            >
                                                <MessageSquare size={15} />
                                                {hasUnread && (
                                                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                                                )}
                                            </button>

                                            {/* Acción 4: 💳 Alternar Cuota */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTogglePaymentStatus(client.id, client.name);
                                                }}
                                                title={isPaid ? "💳 Cuota al día (clic para marcar mora)" : "💳 Cuota en mora (clic para registrar cobro)"}
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'hover:bg-white text-slate-600 hover:text-emerald-600 hover:shadow-xs' 
                                                        : 'hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400'
                                                }`}
                                            >
                                                <CreditCard size={15} />
                                            </button>

                                            {/* Acción 5: ➡️ Ficha Completa del Atleta */}
                                            <button
                                                onClick={() => navigate(`/trainer/athlete/${client.id}`)}
                                                title="Ver Ficha Completa del Alumno"
                                                className={`p-2 rounded-xl transition-all cursor-pointer ${
                                                    isClinical 
                                                        ? 'bg-white text-slate-700 hover:bg-indigo-600 hover:text-white shadow-2xs' 
                                                        : 'bg-zinc-800 text-zinc-300 hover:bg-indigo-500 hover:text-white'
                                                }`}
                                            >
                                                <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerRoster;

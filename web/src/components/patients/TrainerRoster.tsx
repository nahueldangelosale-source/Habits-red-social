import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, ChevronRight, Filter, Target, CreditCard, 
    UserPlus, Dumbbell, CheckCircle2, Clock, AlertCircle, 
    Users, Sparkles, FileText, ArrowUpRight
} from 'lucide-react';
import { trainerApi, type TrainerDashboardData } from '../../api/trainer';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOnboardingPTStore } from '../../stores/useOnboardingPTStore';
import { motion } from 'framer-motion';

export const TrainerRoster: React.FC = () => {
    const navigate = useNavigate();
    const { mode } = useTheme();
    const { lang } = useLanguage();
    const isClinical = mode === 'CLINICAL';
    
    // State
    const [dashboardData, setDashboardData] = useState<TrainerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters (Objetivos, Plan, Finanzas - Cansancio eliminado)
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

    const filteredClients = useMemo(() => {
        if (!dashboardData?.clients) return [];
        
        return dashboardData.clients.filter(client => {
            // Search
            const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Objective
            const isRehab = client.painAreas && client.painAreas.length > 0;
            const matchesObjective = objectiveFilter === 'ALL' 
                ? true 
                : objectiveFilter === 'REHAB' 
                    ? isRehab 
                    : !isRehab;
            
            // Plan Status
            const isDraft = (client as any).planStatus === 'DRAFT';
            const matchesPlan = planFilter === 'ALL'
                ? true
                : planFilter === 'DRAFT'
                    ? isDraft
                    : !isDraft;

            // Payment Status
            const isPastDue = (client as any).paymentStatus === 'past_due';
            const matchesPayment = paymentFilter === 'ALL'
                ? true
                : paymentFilter === 'DUE'
                    ? isPastDue
                    : !isPastDue;
            
            return matchesSearch && matchesObjective && matchesPlan && matchesPayment;
        });
    }, [dashboardData, searchQuery, objectiveFilter, planFilter, paymentFilter]);

    // Métricas Pedagógicas y Claras
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
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                MÉTRICAS PEDAGÓGICAS (OBJETIVOS, PLANES, FINANZAS)
               ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                
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

            {/* ═══════════════════════════════════════════════════════════════
                BARRA DE BÚSQUEDA Y FILTROS CLAROS
               ═══════════════════════════════════════════════════════════════ */}
            <div className={`border rounded-3xl p-4 md:p-5 mb-8 shadow-xs ${
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
                LISTA DE ALUMNOS (FILAS PEDAGÓGICAS CON COHERENCIA PRÉMIUM)
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
                        filteredClients.map((client) => (
                            <div 
                                key={client.id}
                                onClick={() => navigate(`/trainer/athlete/${client.id}`)}
                                className={`p-4 sm:p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 cursor-pointer group hover:bg-slate-50/80 dark:hover:bg-zinc-800/70 border-transparent`}
                            >
                                {/* LADO IZQUIERDO: INFORMACIÓN DEL ALUMNO */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {client.photoUrl ? (
                                        <img src={client.photoUrl} alt={client.name} className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-indigo-100 dark:border-zinc-700" />
                                    ) : (
                                        <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-montserrat font-black text-sm ${
                                            isClinical ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200/70' : 'bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500/30'
                                        }`}>
                                            {client.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className={`font-black font-montserrat text-sm truncate ${isClinical ? 'text-slate-900 group-hover:text-indigo-600' : 'text-white group-hover:text-indigo-400'} transition-colors`}>
                                                {client.name}
                                            </h4>
                                            {!client.lastWorkout && (
                                                <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                    isClinical ? 'bg-emerald-100 text-emerald-700 font-montserrat' : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    Nuevo
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate flex items-center gap-1.5 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                            <span className="font-black text-[10px] font-montserrat uppercase tracking-wider text-slate-400">Objetivo:</span>
                                            <span className={`font-semibold truncate ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>
                                                {client.painAreas?.length ? 'Rehabilitación y Readaptación' : 'Fuerza Máxima e Hipertrofia'}
                                            </span>
                                        </p>
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
                                
                                {/* LADO DERECHO: COLUMNAS DE ESTADO Y ACCIONES */}
                                <div className="flex items-center gap-4 sm:gap-6 md:gap-8 shrink-0 self-start md:self-auto ml-16 md:ml-0">
                                    
                                    {/* Estado del Plan */}
                                    <div className="text-right">
                                        <p className={`text-[10px] font-black font-montserrat uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                            Plan
                                        </p>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1 ${
                                            (client as any).planStatus === 'DRAFT' 
                                                ? isClinical ? 'bg-amber-50 text-amber-700 border border-amber-200/80' : 'bg-amber-500/20 text-amber-400'
                                                : isClinical ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80' : 'bg-indigo-500/20 text-indigo-400'
                                        }`}>
                                            {(client as any).planStatus === 'DRAFT' ? (
                                                <>
                                                    <Clock size={10} className="text-amber-500" />
                                                    <span>Pendiente</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={10} className="text-indigo-600" />
                                                    <span>Activo</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    
                                    {/* Estado de Finanzas / Cuota */}
                                    <div className="text-right">
                                        <p className={`text-[10px] font-black font-montserrat uppercase tracking-widest mb-1 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                            Cuota
                                        </p>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap inline-flex items-center gap-1 ${
                                            (client as any).paymentStatus === 'past_due' 
                                                ? isClinical ? 'bg-rose-50 text-rose-700 border border-rose-200/80' : 'bg-rose-500/20 text-rose-400'
                                                : isClinical ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                            {(client as any).paymentStatus === 'past_due' ? (
                                                <>
                                                    <AlertCircle size={10} className="text-rose-500" />
                                                    <span>En Mora</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={10} className="text-emerald-500" />
                                                    <span>Al Día</span>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {/* Flecha de Navegación */}
                                    <div className="pl-2">
                                        <div className={`p-2 rounded-xl transition-all ${
                                            isClinical 
                                                ? 'bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white shadow-2xs' 
                                                : 'bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white'
                                        }`}>
                                            <ChevronRight size={15} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerRoster;

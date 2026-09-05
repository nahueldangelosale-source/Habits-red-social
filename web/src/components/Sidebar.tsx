import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRBAC } from '../context/RBACContext';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/rbac';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useValidationsStore } from '../stores/coach/useValidationsStore';
import { useCoachCommunicationStore } from '../stores/useCoachCommunicationStore';
import {
    LayoutDashboard, Users, Activity,
    FlaskConical,
    Swords, Brain,
    Stethoscope, Dumbbell,
    Menu, Bot, Shield,
    ScanLine,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    BarChart3,
    Apple,
    CreditCard,
    Database,
    CheckCircle2,
    TrendingUp,
    Palette,
    CalendarDays,
    LogOut,
    Sparkles,
    Sun,
    Moon,
    X
} from 'lucide-react';

import './Sidebar.css';
import { api } from '../api/client';

export type View = 'dashboard' | 'roster' | 'lab' | 'inbox' | 'settings' | 'import' | 'branding' | 'referrals' | 'prescription' | 'context-inbox' | 'gatekeeper' | 'revenue' | 'gamification' | 'arena' | 'mindgym' | 'nutrition' | 'nutricionista' | 'trainer' | 'client' | 'debug-chat' | 'professionals' | 'communication' | 'smartlab' | 'injury' | 'menu' | 'watchtower' | 'rewards' | 'analytics' | 'finance' | 'validations' | 'business' | 'library' | 'calendar' | 'dietqa';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    isCollapsed, 
    toggleSidebar,
    isMobileOpen = false,
    onCloseMobile
}) => {
    const { mode, toggleMode, branding } = useTheme();
    const { t, lang } = useLanguage();
    const { currentRole, isProfessional, isAdmin, activeWorkspace, setWorkspace } = useRBAC();
    const { queue: validationsQueue } = useValidationsStore();
    const { inboxItems } = useCoachCommunicationStore();
    const { user, logout } = useAuth();

    const pendingInboxCount = (validationsQueue?.length || 0) + (inboxItems?.filter((i: any) => i.status === 'PENDING')?.length || 0);

    // Theme styling mode (CLINICAL light vs ADRENALINE dark)
    const isClinicalTheme = mode === 'CLINICAL';

    // Role workspace mode (PT vs CLINICAL)
    const isNutriWorkspace = activeWorkspace === 'CLINICAL';

    const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.email ? user.email.split('@')[0] : 'Coach'));
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('') || 'C';
    const roleTitle = isNutriWorkspace 
        ? 'Nutricionista Clínico' 
        : (user?.role === 'SUPERADMIN' ? 'Super Administrador' : 'Coach & Entrenador');
    const [devOpen, setDevOpen] = useState(false);
    const [quarantineCount, setQuarantineCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Derive currentView from location
    const currentView = location.pathname.split('/')[1] || 'dashboard';

    useEffect(() => {
        if (isAdmin || currentRole === Role.SUPERUSER) {
            api.get<any[]>('/api/v1/magic-import/quarantine')
                .then(data => setQuarantineCount(data.length))
                .catch(e => console.error('Error fetching quarantine count:', e));
        }
    }, [isAdmin, currentRole]);

    const handleViewChange = (view: View) => {
        onCloseMobile?.();
        if (view === 'dashboard') navigate('/dashboard');
        else if (view === 'communication') navigate('/inbox?tab=communication');
        else navigate(`/${view}`);
    };

    // Role switcher (Does NOT alter theme color)
    const handleSwitchToCoach = () => {
        onCloseMobile?.();
        setWorkspace('PT');
        navigate('/trainer');
    };

    const handleSwitchToNutri = () => {
        onCloseMobile?.();
        setWorkspace('CLINICAL');
        navigate('/nutricionista');
    };

    const sidebarBaseClass = isClinicalTheme
        ? 'sidebar-glass'
        : 'bg-zinc-950/60 border-r border-white/5 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.2)]';

    const sectionTitleClass = isClinicalTheme
    // Paleta cromática inspirada en los pétalos del imagotipo Habits (Fuerza, Nutrición, Hábitos, Social, Finanzas)
    type AccentColor = 'indigo' | 'purple' | 'sky' | 'emerald' | 'amber' | 'rose' | 'fuchsia' | 'teal' | 'cyan';

    const colorStyles: Record<AccentColor, {
        activeIcon: string;
        inactiveIcon: string;
        iconBoxBg: string;
        badgeBg: string;
    }> = {
        indigo: {
            activeIcon: 'text-indigo-600 dark:text-indigo-400',
            inactiveIcon: 'text-indigo-500/90 group-hover:text-indigo-600',
            iconBoxBg: 'bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/90 dark:border-indigo-500/40 shadow-xs',
            badgeBg: 'bg-indigo-100/95 text-indigo-700 border-indigo-200/90 dark:bg-indigo-500/20 dark:text-indigo-300'
        },
        purple: {
            activeIcon: 'text-purple-600 dark:text-purple-400',
            inactiveIcon: 'text-purple-500/90 group-hover:text-purple-600',
            iconBoxBg: 'bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/90 dark:border-purple-500/40 shadow-xs',
            badgeBg: 'bg-purple-100/95 text-purple-700 border-purple-200/90 dark:bg-purple-500/20 dark:text-purple-300'
        },
        sky: {
            activeIcon: 'text-sky-600 dark:text-sky-400',
            inactiveIcon: 'text-sky-500/90 group-hover:text-sky-600',
            iconBoxBg: 'bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-cyan-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/90 dark:border-sky-500/40 shadow-xs',
            badgeBg: 'bg-sky-100/95 text-sky-700 border-sky-200/90 dark:bg-sky-500/20 dark:text-sky-300'
        },
        emerald: {
            activeIcon: 'text-emerald-600 dark:text-emerald-400',
            inactiveIcon: 'text-emerald-500/90 group-hover:text-emerald-600',
            iconBoxBg: 'bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/90 dark:border-emerald-500/40 shadow-xs',
            badgeBg: 'bg-emerald-100/95 text-emerald-700 border-emerald-200/90 dark:bg-emerald-500/20 dark:text-emerald-300'
        },
        amber: {
            activeIcon: 'text-amber-600 dark:text-amber-400',
            inactiveIcon: 'text-amber-500/90 group-hover:text-amber-600',
            iconBoxBg: 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/90 dark:border-amber-500/40 shadow-xs',
            badgeBg: 'bg-amber-100/95 text-amber-700 border-amber-200/90 dark:bg-amber-500/20 dark:text-amber-300'
        },
        rose: {
            activeIcon: 'text-rose-600 dark:text-rose-400',
            inactiveIcon: 'text-rose-500/90 group-hover:text-rose-600',
            iconBoxBg: 'bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/90 dark:border-rose-500/40 shadow-xs',
            badgeBg: 'bg-rose-100/95 text-rose-700 border-rose-200/90 dark:bg-rose-500/20 dark:text-rose-300'
        },
        fuchsia: {
            activeIcon: 'text-fuchsia-600 dark:text-fuchsia-400',
            inactiveIcon: 'text-fuchsia-500/90 group-hover:text-fuchsia-600',
            iconBoxBg: 'bg-gradient-to-br from-fuchsia-500/20 via-fuchsia-500/10 to-purple-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200/90 dark:border-fuchsia-500/40 shadow-xs',
            badgeBg: 'bg-fuchsia-100/95 text-fuchsia-700 border-fuchsia-200/90 dark:bg-fuchsia-500/20 dark:text-fuchsia-300'
        },
        teal: {
            activeIcon: 'text-teal-600 dark:text-teal-400',
            inactiveIcon: 'text-teal-500/90 group-hover:text-teal-600',
            iconBoxBg: 'bg-gradient-to-br from-teal-500/20 via-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 border border-teal-200/90 dark:border-teal-500/40 shadow-xs',
            badgeBg: 'bg-teal-100/95 text-teal-700 border-teal-200/90 dark:bg-teal-500/20 dark:text-teal-300'
        },
        cyan: {
            activeIcon: 'text-cyan-600 dark:text-cyan-400',
            inactiveIcon: 'text-cyan-500/90 group-hover:text-cyan-600',
            iconBoxBg: 'bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/90 dark:border-cyan-500/40 shadow-xs',
            badgeBg: 'bg-cyan-100/95 text-cyan-700 border-cyan-200/90 dark:bg-cyan-500/20 dark:text-cyan-300'
        }
    };

    const MenuItem = ({ 
        view, 
        icon: Icon, 
        label, 
        badge, 
        badgeColor = 'default',
        color = 'indigo'
    }: { 
        view: View; 
        icon: any; 
        label: string; 
        badge?: string; 
        badgeColor?: 'default' | 'red';
        color?: AccentColor;
    }) => {
        const isActive = currentView === view;
        const themeStyle = colorStyles[color] || colorStyles.indigo;

        const prefetchView = () => {
            if (view === 'roster') {
                queryClient.prefetchQuery({
                    queryKey: ['patients', activeWorkspace],
                    queryFn: () => api.get('/api/v1/patients'),
                    staleTime: 60000,
                });
            } else if (view === 'inbox') {
                queryClient.prefetchQuery({
                    queryKey: ['inbox', activeWorkspace],
                    queryFn: () => api.get('/api/v1/inbox/conversations'),
                    staleTime: 60000,
                });
            } else if (view === 'dashboard' || view === 'trainer') {
                queryClient.prefetchQuery({
                    queryKey: ['dashboard', activeWorkspace],
                    queryFn: () => api.get('/api/v1/dashboard/metrics'),
                    staleTime: 60000,
                });
            }
        };

        return (
            <motion.button
                className={`group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 overflow-hidden select-none ${
                    isActive
                        ? (isClinicalTheme ? 'habits-active-liquid' : 'bg-white/10 text-white shadow-xs')
                        : (isClinicalTheme ? 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-950' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100')
                }`}
                onClick={() => handleViewChange(view)}
                onMouseEnter={prefetchView}
                whileHover={{ x: 1 }}
                whileTap={{ scale: 0.99 }}
            >
                {/* Subtle, Static Left Indicator - No constant motion */}
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                )}

                {/* Metalized Liquid Glass Icon Capsule */}
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-all duration-200 ${
                    isActive 
                        ? (isClinicalTheme ? 'bg-white shadow-xs border border-indigo-200/90 text-indigo-600' : 'bg-white/15 text-white') 
                        : (isClinicalTheme ? 'bg-slate-100/70 text-slate-500 border border-slate-200/50 group-hover:bg-slate-200/60 group-hover:text-slate-800' : 'bg-white/5 text-zinc-400 group-hover:text-white')
                }`}>
                    <Icon
                        size={isCollapsed ? 20 : 17}
                        strokeWidth={isActive ? 2.5 : 2}
                        className={`transition-colors duration-200 ${
                            isActive 
                                ? (isClinicalTheme ? 'text-indigo-600' : 'text-white') 
                                : (isClinicalTheme ? 'text-slate-500 group-hover:text-slate-900' : 'text-zinc-400 group-hover:text-white')
                        }`}
                    />
                </div>

                {!isCollapsed && (
                    <div className="relative z-10 flex-1 text-left flex items-center justify-between min-w-0">
                        <span className={`sidebar-item-text text-[13px] transition-colors ${
                            isActive ? 'font-black text-slate-950 dark:text-white' : 'font-semibold text-slate-700 dark:text-zinc-300'
                        }`}>
                            {label}
                        </span>
                        {badge && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-1.5 border transition-all ${
                                badgeColor === 'red' 
                                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                                    : (isClinicalTheme 
                                        ? 'bg-slate-100 text-slate-700 border-slate-200' 
                                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30')
                            }`}>
                                {badge}
                            </span>
                        )}
                    </div>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                    <div className={`absolute left-full ml-3 px-3 py-1.5 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-all transform translate-x-2 group-hover:translate-x-0 ${isClinicalTheme ? 'bg-slate-900 text-white' : 'bg-white text-black'
                        }`}>
                        {label}
                        <div className={`absolute top-1/2 -left-1 w-2 h-2 transform -translate-y-1/2 rotate-45 ${isClinicalTheme ? 'bg-slate-900' : 'bg-white'
                            }`} />
                    </div>
                )}
            </motion.button>
        );
    };

    const renderBody = (isMobileDrawer: boolean) => {
        const collapsed = isMobileDrawer ? false : isCollapsed;

        return (
            <>
                {/* Header (Clean Logo Area with Vibrant Habits Branding) */}
                <div className={`h-20 flex items-center mb-1 transition-all duration-300 overflow-x-hidden border-b ${isClinicalTheme ? 'border-slate-200/70 bg-gradient-to-b from-indigo-500/[0.05] to-transparent' : 'border-white/5 bg-gradient-to-b from-indigo-500/5 to-transparent'} ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
                    {!collapsed ? (
                        <motion.div
                            className="logo-area flex items-center justify-start gap-3 py-2 px-1 flex-1 cursor-pointer group"
                            onClick={() => {
                                if (isMobileDrawer) onCloseMobile?.();
                                navigate(isNutriWorkspace ? '/nutricionista' : '/trainer');
                            }}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Logo Vectorial Mandala Limpio y Nítido con Cápsula Liquid Glass */}
                            <div className="w-11 h-11 flex-shrink-0 relative flex items-center justify-center rounded-2xl bg-white/95 dark:bg-white/10 p-1.5 shadow-[0_4px_18px_rgba(99,102,241,0.16)] border border-indigo-200/90 dark:border-white/10">
                                <img 
                                    src="/logo-habits-transparent.png" 
                                    alt="Habits - Tu Red Social Saludable" 
                                    className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform" 
                                    onError={(e) => { 
                                        e.currentTarget.src = '/logo.png';
                                    }} 
                                />
                            </div>

                            {/* Tipografía con Punto Gradiente Ámbar/Rosa/Índigo + Subtítulo */}
                            <div className="flex flex-col">
                                <span className={`font-heading font-black text-2xl tracking-tight leading-none flex items-baseline ${isClinicalTheme ? 'text-slate-900' : 'text-white'}`}>
                                    Habits
                                    <span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-4xl translate-y-0.5 ml-0.5 font-black drop-shadow-[0_2px_8px_rgba(244,63,94,0.35)]">
                                        .
                                    </span>
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 mt-0.5">
                                    Tu Red Social Saludable
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <button
                            onClick={toggleSidebar}
                            title="Expandir barra lateral"
                            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-rose-500/10 hover:from-indigo-500/20 hover:to-rose-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs transition-all active:scale-95 group p-1.5"
                        >
                            <img src="/logo-habits-transparent.png" alt="Habits" className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform" />
                        </button>
                    )}
                    
                    {isMobileDrawer ? (
                        <button
                            onClick={onCloseMobile}
                            aria-label="Cerrar menú"
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                                isClinicalTheme 
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                        >
                            <X size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={toggleSidebar}
                            title={collapsed ? "Expandir barra lateral" : "Ocultar barra lateral"}
                            className={`p-2 rounded-xl transition-colors shrink-0 ${
                                isClinicalTheme 
                                    ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700' 
                                    : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                            } ${collapsed ? 'hidden' : ''}`}
                        >
                            <Menu size={19} />
                        </button>
                    )}
                </div>

                {/* Scrollable Content (Strictly no horizontal scrollbar) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-4 no-scrollbar py-2">

                    {/* VISTA 1: COACH / ENTRENADOR */}
                    {!isNutriWorkspace && (
                        <div className="space-y-1">
                            <MenuItem view="trainer" icon={Dumbbell} label={lang === 'es' ? 'Inicio' : 'Home'} badge="CORE" color="indigo" />
                            <MenuItem view="calendar" icon={CalendarDays} label={lang === 'es' ? 'Agenda' : 'Calendar'} color="purple" />
                            <MenuItem view="roster" icon={Users} label={lang === 'es' ? 'Alumnos' : 'Clients'} color="sky" />
                            <MenuItem view="finance" icon={CreditCard} label={lang === 'es' ? 'Finanzas' : 'Finance'} badge="MRR" color="emerald" />
                            <MenuItem view="library" icon={Database} label={lang === 'es' ? 'Biblioteca' : 'Library'} color="amber" />
                            <MenuItem view="inbox" icon={MessageSquare} label={lang === 'es' ? 'Mensajes' : 'Messages'} badge={pendingInboxCount > 0 ? pendingInboxCount.toString() : undefined} color="rose" />
                            <MenuItem view="gamification" icon={Swords} label={lang === 'es' ? 'Comunidad' : 'Community'} color="fuchsia" />
                        </div>
                    )}

                    {/* VISTA 2: NUTRICIÓN & CLÍNICA */}
                    {isNutriWorkspace && (
                        <div className="space-y-1">
                            <MenuItem view="nutricionista" icon={Activity} label={lang === 'es' ? 'Inicio' : 'Home'} color="teal" />
                            <MenuItem view="roster" icon={Users} label={lang === 'es' ? 'Pacientes' : 'Patients'} color="sky" />
                            <MenuItem view="dietqa" icon={Stethoscope} label="DietQA" badge="MOTOR" color="emerald" />
                            <MenuItem view="library" icon={Database} label={lang === 'es' ? 'Biblioteca' : 'Library'} color="amber" />
                            <MenuItem view="inbox" icon={MessageSquare} label={lang === 'es' ? 'Mensajes' : 'Messages'} badge={pendingInboxCount > 0 ? pendingInboxCount.toString() : undefined} color="rose" />
                            <MenuItem view="smartlab" icon={FlaskConical} label="Smart Lab" color="cyan" />
                            <MenuItem view="calendar" icon={CalendarDays} label={lang === 'es' ? 'Agenda' : 'Calendar'} color="purple" />
                        </div>
                    )}

                    {/* DEBUG & MANTENIMIENTO EXPANDABLE */}
                    {isAdmin && (
                        <div className="space-y-1 pb-2">
                            <button
                                onClick={() => setDevOpen(!devOpen)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                                    isClinicalTheme ? 'hover:bg-slate-50 text-slate-400' : 'hover:bg-white/5 text-zinc-400'
                                }`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest truncate">
                                    {!collapsed ? (lang === 'es' ? '⚙️ Herramientas Dev' : '⚙️ Dev Tools') : 'DEV'}
                                </span>
                                {!collapsed && (
                                    devOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                            </button>
                            <AnimatePresence initial={false}>
                                {devOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden space-y-1"
                                    >
                                        <MenuItem view="branding" icon={Palette} label={lang === 'es' ? 'Personalización de Marca' : 'Brand Settings'} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer con SELECTOR DE ROL + BOTÓN DE TEMA & LOGOUT */}
                <div className={`p-4 mt-auto border-t overflow-x-hidden ${isClinicalTheme ? 'border-slate-200/70 bg-gradient-to-t from-indigo-500/[0.02] to-transparent' : 'border-white/5 bg-gradient-to-t from-indigo-500/5 to-transparent'}`}>
                    
                    {/* Switcher Profesional */}
                    {!collapsed ? (
                        <div className="flex bg-slate-100/90 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800 mb-3 shadow-2xs">
                            <button
                                onClick={handleSwitchToCoach}
                                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black font-montserrat flex items-center justify-center gap-1.5 transition-all ${
                                    !isNutriWorkspace
                                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                            >
                                <Dumbbell size={13} />
                                <span>Coach</span>
                            </button>

                            <button
                                onClick={handleSwitchToNutri}
                                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black font-montserrat flex items-center justify-center gap-1.5 transition-all ${
                                    isNutriWorkspace
                                        ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 text-white shadow-md shadow-emerald-500/25 font-bold'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                                }`}
                            >
                                <Activity size={13} />
                                <span>Nutrición</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 mb-3">
                            <button
                                onClick={isNutriWorkspace ? handleSwitchToCoach : handleSwitchToNutri}
                                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 hover:scale-105 transition-transform"
                                title={isNutriWorkspace ? "Cambiar a Coach" : "Cambiar a Nutrición"}
                            >
                                {isNutriWorkspace ? <Activity size={18} className="text-emerald-500" /> : <Dumbbell size={18} className="text-indigo-500" />}
                            </button>

                            <button
                                onClick={toggleMode}
                                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:scale-105 transition-transform"
                                title={isClinicalTheme ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
                            >
                                {isClinicalTheme ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
                            </button>
                        </div>
                    )}

                    {/* Perfil del Usuario + Botones de Tema y Logout */}
                    <div className={`flex items-center gap-2.5 overflow-x-hidden ${collapsed ? 'justify-center' : ''}`}>
                        <div className="relative shrink-0 p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 shadow-xs">
                            <div className="w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center text-white text-xs font-black shadow-inner">
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>

                        {!collapsed && (
                            <div className="overflow-hidden flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${isClinicalTheme ? 'text-slate-900' : 'text-white'}`}>{displayName}</p>
                                <p className={`text-xs truncate ${isClinicalTheme ? 'text-slate-500' : 'text-zinc-400'}`}>
                                    {roleTitle}
                                </p>
                            </div>
                        )}

                        {!collapsed && (
                            <div className="flex items-center gap-1 shrink-0">
                                {/* Botón Swap Theme en Footer */}
                                <button 
                                    onClick={toggleMode}
                                    title={isClinicalTheme ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
                                    className={`p-2 rounded-xl transition-colors ${
                                        isClinicalTheme ? 'hover:bg-slate-200 text-slate-500 hover:text-indigo-600' : 'hover:bg-white/10 text-zinc-400 hover:text-amber-300'
                                    }`}
                                >
                                    {isClinicalTheme ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
                                </button>

                                {/* Botón Cerrar Sesión */}
                                <button 
                                    onClick={logout}
                                    title="Cerrar Sesión"
                                    className={`p-2 rounded-xl transition-colors ${
                                        isClinicalTheme ? 'hover:bg-slate-200 text-slate-500 hover:text-red-600' : 'hover:bg-white/10 text-zinc-400 hover:text-red-400'
                                    }`}
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
            {/* BARRA LATERAL ESCRITORIO (EXCLUSIVO >= md, NUNCA VISIBLE EN MÓVIL) */}
            <div className="hidden md:block select-none">
                <motion.aside
                    className={`flex flex-col h-screen z-50 fixed left-0 top-0 overflow-x-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${sidebarBaseClass} ${isCollapsed ? 'w-20' : 'w-72'}`}
                    initial={false}
                >
                    {renderBody(false)}
                </motion.aside>
            </div>

            {/* DRAWER MODAL MÓVIL (< md) CON PORTAL GLOBAL FUERA DE APP-CONTAINER */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isMobileOpen && (
                        <div className="fixed inset-0 z-[99999] md:hidden">
                            {/* Fondo oscuro traslúcido */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={onCloseMobile}
                                className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer z-[99998]"
                            />

                            {/* Panel deslizable 100% OPACO - CERO TRANSPARENCIA */}
                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                className={`fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] h-[100dvh] flex flex-col z-[99999] shadow-2xl overflow-hidden select-none ${
                                    isClinicalTheme 
                                        ? '!bg-white text-slate-900 border-r border-slate-200' 
                                        : '!bg-[#0c101d] text-white border-r border-white/10'
                                }`}
                                style={{
                                    backgroundColor: isClinicalTheme ? '#ffffff' : '#0c101d',
                                    opacity: 1
                                }}
                            >
                                {renderBody(true)}
                            </motion.aside>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

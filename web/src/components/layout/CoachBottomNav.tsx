import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Dumbbell, 
    CalendarDays, 
    Users, 
    MessageSquare, 
    Menu,
    X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useValidationsStore } from '../../stores/coach/useValidationsStore';
import { useCoachCommunicationStore } from '../../stores/useCoachCommunicationStore';

interface CoachBottomNavProps {
    isOpen?: boolean;
    onToggleMenu: () => void;
}

export const CoachBottomNav: React.FC<CoachBottomNavProps> = ({ isOpen = false, onToggleMenu }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const { queue: validationsQueue } = useValidationsStore();
    const { inboxItems } = useCoachCommunicationStore();
    const pendingCount = (validationsQueue?.length || 0) + (inboxItems?.filter((i: any) => i.status === 'PENDING')?.length || 0);

    const currentPath = location.pathname;

    const navItems = [
        {
            id: 'home',
            label: 'Inicio',
            icon: Dumbbell,
            path: '/trainer',
            isActive: currentPath === '/dashboard' || currentPath === '/trainer' || currentPath === '/nutricionista' || currentPath === '/',
        },
        {
            id: 'calendar',
            label: 'Agenda',
            icon: CalendarDays,
            path: '/calendar',
            isActive: currentPath === '/calendar',
        },
        {
            id: 'roster',
            label: 'Contactos',
            icon: Users,
            path: '/roster',
            isActive: currentPath === '/roster',
        },
        {
            id: 'inbox',
            label: 'Mensajes',
            icon: MessageSquare,
            path: '/inbox',
            isActive: currentPath === '/inbox' || currentPath === '/validations',
            badge: pendingCount > 0 ? pendingCount : null,
        },
        {
            id: 'menu',
            label: isOpen ? 'Cerrar' : 'Menú',
            icon: isOpen ? X : Menu,
            path: null,
            isActive: isOpen,
            onClick: onToggleMenu,
        }
    ];

    return (
        <nav 
            className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t px-2 py-1.5 pb-safe flex items-center justify-around transition-colors duration-300 ${
                isClinical 
                    ? 'bg-white/95 border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]' 
                    : 'bg-zinc-950/95 border-white/10 shadow-[0_-4px_25px_rgba(0,0,0,0.4)]'
            }`}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.isActive;

                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.onClick) {
                                item.onClick();
                            } else if (item.path) {
                                navigate(item.path);
                            }
                        }}
                        className="relative flex flex-col items-center justify-center py-1 px-3 min-w-[58px] transition-all cursor-pointer active:scale-90"
                    >
                        {/* Active Glow Pill */}
                        {active && (
                            <motion.div
                                layoutId="bottomNavActivePill"
                                className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                            />
                        )}

                        <div className="relative">
                            <Icon 
                                size={21} 
                                strokeWidth={active ? 2.5 : 2}
                                className={`transition-colors duration-200 ${
                                    active
                                        ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                                        : (isClinical ? 'text-slate-400 hover:text-slate-700' : 'text-zinc-500 hover:text-zinc-300')
                                }`} 
                            />

                            {/* Unread / Pending Badge */}
                            {item.badge && item.badge > 0 && (
                                <span className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                        </div>

                        <span className={`text-[10px] mt-0.5 tracking-tight transition-colors duration-200 ${
                            active
                                ? 'font-black text-indigo-600 dark:text-indigo-400'
                                : (isClinical ? 'font-medium text-slate-500' : 'font-medium text-zinc-500')
                        }`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

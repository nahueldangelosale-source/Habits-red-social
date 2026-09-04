import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Dumbbell, Activity, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRBAC } from '../../context/RBACContext';
import { useTheme } from '../../context/ThemeContext';

interface CoachMobileHeaderProps {
    isOpen?: boolean;
    onToggleMenu: () => void;
}

export const CoachMobileHeader: React.FC<CoachMobileHeaderProps> = ({ isOpen = false, onToggleMenu }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeWorkspace, setWorkspace } = useRBAC();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const displayName = user?.full_name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.email ? user.email.split('@')[0] : 'Coach'));
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('') || 'C';

    const isNutriWorkspace = activeWorkspace === 'CLINICAL';

    const handleSwitchWorkspace = () => {
        if (isNutriWorkspace) {
            setWorkspace('PT');
            navigate('/trainer');
        } else {
            setWorkspace('CLINICAL');
            navigate('/nutricionista');
        }
    };

    return (
        <header className={`md:hidden fixed top-0 left-0 right-0 h-16 z-40 px-3.5 flex items-center justify-between backdrop-blur-xl border-b transition-colors duration-300 ${
            isClinical 
                ? 'bg-white/92 border-slate-200/80 shadow-2xs' 
                : 'bg-zinc-950/90 border-white/10 shadow-lg'
        }`}>
            {/* Logo & Branding */}
            <div 
                onClick={() => navigate(isNutriWorkspace ? '/nutricionista' : '/trainer')}
                className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
            >
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 p-1 flex items-center justify-center shadow-xs border border-indigo-200/70 dark:border-white/10">
                    <img 
                        src="/logo-habits-transparent.png" 
                        alt="Habits" 
                        className="w-full h-full object-contain"
                        onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                    />
                </div>
                <div className="flex flex-col">
                    <span className={`font-heading font-black text-lg tracking-tight leading-none flex items-baseline ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        Habits
                        <span className="text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 text-xl translate-y-0.5 ml-0.5 font-black">
                            .
                        </span>
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">
                        Tu Red Social Saludable
                    </span>
                </div>
            </div>

            {/* Actions: Workspace Pill Switcher + Avatar + Hamburger */}
            <div className="flex items-center gap-2">
                {/* Switcher Coach / Nutrición */}
                <button
                    onClick={handleSwitchWorkspace}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border transition-all active:scale-95 shadow-2xs ${
                        !isNutriWorkspace
                            ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                            : 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    }`}
                    title="Alternar entre modo Coach y Nutrición"
                >
                    {!isNutriWorkspace ? (
                        <>
                            <Dumbbell size={11} className="text-indigo-600 dark:text-indigo-400" />
                            <span>Coach</span>
                        </>
                    ) : (
                        <>
                            <Activity size={11} className="text-emerald-600 dark:text-emerald-400" />
                            <span>Nutri</span>
                        </>
                    )}
                </button>

                {/* Avatar Initials */}
                <div 
                    onClick={onToggleMenu}
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95"
                    title={displayName}
                >
                    {initials}
                </div>

                {/* Hamburger Drawer Toggle */}
                <button
                    onClick={onToggleMenu}
                    aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                    className={`p-2 rounded-xl transition-colors active:scale-95 ${
                        isOpen
                            ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                            : isClinical 
                                ? 'text-slate-700 hover:bg-slate-100' 
                                : 'text-zinc-300 hover:bg-white/10'
                    }`}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </header>
    );
};

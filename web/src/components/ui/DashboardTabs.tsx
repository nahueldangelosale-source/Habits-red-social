
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface TabItem {
    id: string;
    label: string;
    icon?: React.ElementType;
    badgeCount?: number;
}

interface DashboardTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ tabs, activeTab, onTabChange }) => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive
                            ? (isClinical
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                : 'bg-indigo-500 text-black shadow-[0_0_15px_rgba(206,255,0,0.4)]')
                            : (isClinical
                                ? 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                                : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5 hover:bg-white/5')
                            }`}
                    >
                        {Icon && <Icon size={16} className={isActive ? '' : 'opacity-70'} />}
                        <span>{tab.label}</span>

                        {tab.badgeCount && tab.badgeCount > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive
                                ? (isClinical ? 'bg-white/20 text-white' : 'bg-zinc-950/20 text-black')
                                : (isClinical ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white')
                                }`}>
                                {tab.badgeCount}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

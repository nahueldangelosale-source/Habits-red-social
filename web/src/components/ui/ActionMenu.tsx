
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MoreHorizontal } from 'lucide-react';

interface ActionItem {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

interface ActionMenuProps {
    actions: ActionItem[];
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`p-2 rounded-full transition-colors ${isClinical
                    ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                    : 'hover:bg-white/10 text-zinc-500 hover:text-zinc-300'}`}
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl z-50 border overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isClinical
                    ? 'bg-white border-slate-100 ring-1 ring-slate-200'
                    : 'bg-zinc-900 border-white/10 ring-1 ring-black'}`}>
                    <div className="py-1">
                        {actions.map((action, i) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        action.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${action.variant === 'danger'
                                        ? (isClinical ? 'text-rose-600 hover:bg-rose-50' : 'text-rose-500 hover:bg-rose-500/10')
                                        : (isClinical ? 'text-slate-700 hover:bg-slate-50' : 'text-zinc-300 hover:bg-white/5')
                                        }`}
                                >
                                    <Icon size={14} className={action.variant === 'danger' ? '' : 'opacity-70'} />
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

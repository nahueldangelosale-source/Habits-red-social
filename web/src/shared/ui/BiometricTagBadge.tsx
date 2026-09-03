import React from 'react';
import { Activity, Thermometer, Box, Brain, Cross } from 'lucide-react';

interface BiometricTagBadgeProps {
    tag: string;
    category: 'ops' | 'success' | 'danger' | 'warning' | 'ai' | 'neutral';
}

export const BiometricTagBadge: React.FC<BiometricTagBadgeProps> = ({ tag, category }) => {
    
    const config = {
        ops: {
            colors: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
            icon: <Box size={10} />
        },
        success: {
            colors: 'bg-lime-500/10 text-lime-400 border-lime-500/30 hover:shadow-[0_0_20px_rgba(132,204,22,0.15)]',
            icon: <Activity size={10} />
        },
        danger: {
            colors: 'bg-red-500/10 text-red-500 border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
            icon: <Cross size={10} />
        },
        warning: {
            colors: 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            icon: <Thermometer size={10} />
        },
        ai: {
            colors: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
            icon: <Brain size={10} />
        },
        neutral: {
            colors: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30 hover:shadow-[0_0_20px_rgba(113,113,122,0.15)]',
            icon: null
        }
    };

    const currentConfig = config[category] || config['neutral'];

    return (
        <span 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest border transition-all duration-300 ease-out hover:-translate-y-0.5 cursor-default ${currentConfig.colors}`}
        >
            {currentConfig.icon}
            {tag}
        </span>
    );
};

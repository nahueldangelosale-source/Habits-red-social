import React from 'react';
import { motion } from 'framer-motion';

interface NavButtonProps {
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    isActive?: boolean;
    style?: React.CSSProperties;
}

export const NavButton: React.FC<NavButtonProps> = ({ onClick, title, icon, isActive, style }) => (
    <motion.button
        onClick={onClick}
        title={title}
        // HEDONIC PHYSICS
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }} // "Snappy" feel

        // HYBRID STYLING (Tailwind classes instead of inline styles)
        className={`
      relative flex items-center justify-center p-3 rounded-2xl transition-all duration-300
      ${isActive
                ? 'bg-zinc-900 text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)]' // Active State
                : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm border border-zinc-100' // Inactive
            }
    `}
        style={style}
    >
        <span className="text-xl">{icon}</span>
        {/* Optional: Label for Desktop - Hidden for now to match icon-only top bar */}
        {/* <span className="ml-2 text-sm font-medium hidden md:block">{title}</span> */}

        {/* ACTIVE INDICATOR DOT */}
        {isActive && (
            <motion.div
                layoutId="activeDot"
                className="absolute -bottom-1 w-1 h-1 bg-lime-500 rounded-full"
            />
        )}
    </motion.button>
);

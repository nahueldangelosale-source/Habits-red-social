/**
 * REALITY SWITCH - The Central Toggle
 * Shifts the app from "Clinical Mode" to "Adrenaline Mode"
 * With fluid spring physics via Framer Motion
 */

import { motion } from 'framer-motion';
import { Leaf, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface RealitySwitchProps {
    isCollapsed?: boolean;
}

export function RealitySwitch({ isCollapsed = false }: RealitySwitchProps) {
    const { mode, toggleMode } = useTheme();
    const { t } = useLanguage();
    const isAdrenaline = mode === 'ADRENALINE';

    // Compact Mode (Collapsed Sidebar)
    if (isCollapsed) {
        return (
            <motion.button
                onClick={toggleMode}
                className="reality-switch-compact"
                animate={{
                    backgroundColor: isAdrenaline ? '#09090b' : '#FFFFFF',
                    borderColor: isAdrenaline ? '#6366f1' : '#E5E5E7',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    border: '1px solid',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    cursor: 'pointer',
                    boxShadow: 'none'
                }}
            >
                {isAdrenaline ? (
                    <Zap size={20} fill="#6366f1" color="#6366f1" />
                ) : (
                    <Leaf size={20} className="text-[#88B04B]" />
                )}
            </motion.button>
        );
    }

    // Full Mode
    return (
        <motion.div
            onClick={toggleMode}
            className="reality-switch"
            animate={{
                backgroundColor: isAdrenaline ? '#09090b' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isAdrenaline ? '#6366f1' : '#E5E5E7',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
            }}
            transition={{ duration: 0.4 }}
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%', // Fluid width
                maxWidth: '240px',
                height: '48px',
                padding: '4px',
                borderRadius: '24px',
                cursor: 'pointer',
                border: '1px solid',
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Sliding Background */}
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                    position: 'absolute',
                    height: '40px',
                    width: '50%', // Relative width
                    borderRadius: '20px',
                    zIndex: 10,
                    top: '3px' // Center vertically manually
                }}
                animate={{
                    left: isAdrenaline ? '48%' : '4px', // Adjust for padding
                    right: isAdrenaline ? '4px' : 'unset',
                    width: 'calc(50% - 6px)',
                    backgroundColor: isAdrenaline ? '#6366f1' : '#FFFFFF',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
            />

            <motion.div
                style={{
                    position: 'relative',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50%',
                    gap: '6px',
                    fontSize: '10px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontWeight: isAdrenaline ? 400 : 700,
                }}
                animate={{
                    color: isAdrenaline ? '#666666' : '#1D1D1F',
                }}
            >
                <Leaf size={14} />
                <span>{t.realitySwitch.clinical}</span>
            </motion.div>

            {/* ADRENALINE Label */}
            <motion.div
                style={{
                    position: 'relative',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '50%',
                    gap: '6px',
                    fontSize: '10px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontFamily: isAdrenaline ? 'var(--font-mono)' : 'inherit',
                    fontWeight: isAdrenaline ? 700 : 400,
                }}
                animate={{
                    color: isAdrenaline ? '#09090b' : '#999999',
                }}
            >
                <span>{t.realitySwitch.ignite}</span>
                <Zap size={14} fill={isAdrenaline ? '#09090b' : 'none'} />
            </motion.div>
        </motion.div>
    );
}

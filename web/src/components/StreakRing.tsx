/**
 * STREAK RING - The Sacred Flame
 * Motor 1: La Llama Sagrada
 * 
 * Animated fire/water ring around profile avatar
 * showing current streak with juicy animations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Snowflake, Trophy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface StreakRingProps {
    streak: number;
    avatarUrl?: string;
    avatarInitials?: string;
    size?: 'sm' | 'md' | 'lg';
    showWarning?: boolean;
    freezeTokens?: number;
    frozen?: boolean;
}

// Particle component for fire effect
const FireParticle = ({ delay, size }: { delay: number; size: number }) => (
    <motion.div
        className="fire-particle"
        style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #FF6B35 0%, #F7C59F 100%)',
            filter: 'blur(1px)',
        }}
        initial={{
            y: 0,
            x: Math.random() * 20 - 10,
            opacity: 0,
            scale: 0
        }}
        animate={{
            y: -30 - Math.random() * 20,
            x: Math.random() * 30 - 15,
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
        }}
        transition={{
            duration: 1.2,
            delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 0.5,
            ease: 'easeOut'
        }}
    />
);

export function StreakRing({
    streak,
    avatarUrl,
    avatarInitials = 'U',
    size = 'md',
    showWarning = false,
    freezeTokens = 0,
    frozen = false
}: StreakRingProps) {
    const { mode } = useTheme();
    const [isAnimating, setIsAnimating] = useState(false);
    const [particles, setParticles] = useState<number[]>([]);

    const sizes = {
        sm: { ring: 64, avatar: 48, stroke: 3, fontSize: '0.6rem' },
        md: { ring: 96, avatar: 72, stroke: 4, fontSize: '0.75rem' },
        lg: { ring: 140, avatar: 108, stroke: 5, fontSize: '0.9rem' },
    };

    const config = sizes[size];
    const circumference = 2 * Math.PI * ((config.ring - config.stroke) / 2);

    // Streak milestones for special effects
    const isMilestone = [7, 14, 30, 60, 100, 365].includes(streak);
    const isOnFire = streak >= 7 && !frozen;
    const isDanger = showWarning && streak > 0 && !frozen;

    // Generate particles for fire effect
    useEffect(() => {
        if (isOnFire) {
            setParticles(Array.from({ length: 8 }, (_, i) => i));
        } else {
            setParticles([]);
        }
    }, [isOnFire]);

    // Trigger animation on streak change
    useEffect(() => {
        if (!frozen) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 600);
            return () => clearTimeout(timer);
        }
    }, [streak, frozen]);

    const getGradientColors = () => {
        if (isDanger) return ['#EF4444', '#F59E0B']; // Keep danger state as is for now, or map to brand danger? User didn't specify.

        // Brand Gradients
        if (mode === 'CLINICAL') {
            return ['#88B04B', '#5F8D4E']; // Sage depths
        } else {
            return ['#6366f1', '#A3CC00']; // Volt depths
        }
    };

    const colors = getGradientColors();

    return (
        <div className="streak-ring-container" style={{
            width: config.ring,
            height: config.ring,
            position: 'relative'
        }}>
            {/* Fire particles */}
            {isOnFire && (
                <div className="particles-container" style={{
                    position: 'absolute',
                    bottom: '50%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                    zIndex: 10
                }}>
                    {particles.map((i) => (
                        <FireParticle key={i} delay={i * 0.15} size={4 + Math.random() * 4} />
                    ))}
                </div>
            )}

            {/* SVG Ring */}
            <svg
                width={config.ring}
                height={config.ring}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <defs>
                    <linearGradient id={`streak-gradient-${streak}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {colors.map((color, i) => (
                            <stop
                                key={i}
                                offset={`${(i / (colors.length - 1)) * 100}%`}
                                stopColor={color}
                            />
                        ))}
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background ring */}
                <circle
                    cx={config.ring / 2}
                    cy={config.ring / 2}
                    r={(config.ring - config.stroke) / 2}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={config.stroke}
                    opacity={0.3}
                />

                {/* Animated streak ring */}
                <motion.circle
                    cx={config.ring / 2}
                    cy={config.ring / 2}
                    r={(config.ring - config.stroke) / 2}
                    fill="none"
                    stroke={`url(#streak-gradient-${streak})`}
                    strokeWidth={config.stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - Math.min(streak / 30, 1))}
                    filter={isOnFire ? 'url(#glow)' : undefined}
                    initial={false}
                    animate={{
                        strokeDashoffset: circumference * (1 - Math.min(streak / 30, 1)),
                        rotate: (isOnFire && !frozen) ? [0, 3, -3, 0] : 0
                    }}
                    transition={{
                        strokeDashoffset: frozen ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' },
                        rotate: frozen ? { duration: 0 } : { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
                    }}
                    style={{ transformOrigin: 'center' }}
                />
            </svg>

            {/* Avatar */}
            <motion.div
                className="streak-avatar"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    // Transform handled by motion props to avoid conflict
                    width: config.avatar,
                    height: config.avatar,
                    borderRadius: '50%',
                    background: mode === 'CLINICAL'
                        ? 'linear-gradient(135deg, #88B04B 0%, #6B8E23 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #88B04B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: config.avatar * 0.4,
                    fontWeight: 600,
                    color: mode === 'CLINICAL' ? 'white' : 'black',
                    overflow: 'hidden',
                    boxShadow: isOnFire
                        ? '0 0 20px rgba(255, 107, 53, 0.5)'
                        : '0 2px 8px rgba(0,0,0,0.1)'
                }}
                initial={{ x: '-50%', y: '-50%' }}
                animate={(isAnimating && !frozen) ? {
                    scale: [1, 1.1, 1],
                } : {}}
                transition={{ duration: 0.3 }}
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    avatarInitials
                )}
            </motion.div>

            {/* Streak Badge */}
            <motion.div
                className="streak-badge"
                style={{
                    position: 'absolute',
                    bottom: -4,
                    right: size === 'lg' ? 10 : size === 'md' ? 5 : 0,
                    background: isDanger
                        ? 'linear-gradient(135deg, #EF4444, #F59E0B)'
                        : isOnFire
                            ? 'linear-gradient(135deg, #FF6B35, #F7C59F)'
                            : 'var(--surface)',
                    color: (isDanger || isOnFire) ? 'white' : 'var(--text-primary)',
                    borderRadius: 20,
                    padding: `2px ${size === 'lg' ? 10 : 6}px`,
                    fontSize: config.fontSize,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    border: '2px solid var(--background)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 20
                }}
                animate={isAnimating ? {
                    scale: [1, 1.2, 1],
                    y: [0, -5, 0]
                } : {}}
                transition={{ duration: 0.4 }}
            >
                {isOnFire ? <Flame size={size === 'lg' ? 14 : 10} /> : null}
                {streak}
            </motion.div>

            {/* Freeze Token Indicator */}
            {freezeTokens > 0 && (
                <motion.div
                    className="freeze-indicator"
                    style={{
                        position: 'absolute',
                        top: -4,
                        right: size === 'lg' ? 10 : size === 'md' ? 5 : 0,
                        background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                        color: 'white',
                        borderRadius: 20,
                        padding: `2px ${size === 'lg' ? 8 : 5}px`,
                        fontSize: config.fontSize,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        border: '2px solid var(--background)',
                        zIndex: 20
                    }}
                    title={`${freezeTokens} Streak Freeze disponibles`}
                >
                    <Snowflake size={size === 'lg' ? 12 : 9} />
                    {freezeTokens}
                </motion.div>
            )}

            {/* Warning Pulse */}
            <AnimatePresence>
                {isDanger && (
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: -8,
                            borderRadius: '50%',
                            border: '2px solid #EF4444',
                            pointerEvents: 'none'
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: [0.5, 0, 0.5],
                            scale: [0.95, 1.05, 0.95]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}
            </AnimatePresence>

            {/* Milestone Crown */}
            {isMilestone && streak > 0 && (
                <motion.div
                    style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 30
                    }}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                    <Trophy size={size === 'lg' ? 20 : 16} color="#F59E0B" fill="#F59E0B" />
                </motion.div>
            )}
        </div>
    );
}

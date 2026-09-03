/**
 * AVATAR VIEWER - The Digital Twin Renderer
 * SVG-based avatar with dynamic physique visualization
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Crown,
    Flame,
    ShoppingBag
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PhysiqueMetrics {
    muscle_mass: number;      // 0.0 - 1.0
    shoulder_width: number;
    arm_definition: number;
    leanness: number;
    energy_aura: number;
    posture_score: number;
}

interface BaseDNA {
    skin_tone: string;
    hair_style: string;
    hair_color: string;
    gender: 'masculine' | 'feminine' | 'neutral';
    body_type: string;
    face_shape: string;
}

interface EquippedGear {
    torso?: string;
    legs?: string;
    footwear?: string;
    accessory?: string;
    headwear?: string;
    special_effect?: string;
}

interface AvatarViewerProps {
    physique: PhysiqueMetrics;
    dna: BaseDNA;
    gear: EquippedGear;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showStats?: boolean;
    isInteractive?: boolean;
    onCustomize?: () => void;
    streak?: number;
    level?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIZE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const SIZE_CONFIG = {
    sm: { width: 120, height: 180, fontSize: 10 },
    md: { width: 180, height: 270, fontSize: 12 },
    lg: { width: 240, height: 360, fontSize: 14 },
    xl: { width: 320, height: 480, fontSize: 16 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function AvatarViewer({
    physique,
    dna,
    gear,
    size = 'md',
    showStats = false,
    isInteractive = false,
    onCustomize,
    streak = 0,
    level = 1
}: AvatarViewerProps) {
    const { mode } = useTheme();
    const config = SIZE_CONFIG[size];

    // Calculate visual scaling based on physique
    const visualMetrics = useMemo(() => ({
        // Shoulder width scales from 0.85 to 1.15
        shoulderScale: 0.85 + (physique.shoulder_width * 0.3),
        // Arm size scales from 1.0 to 1.25
        armScale: 1.0 + (physique.arm_definition * 0.25),
        // Torso width scales from 0.9 to 1.2
        torsoScale: 0.9 + (physique.muscle_mass * 0.3),
        // Leanness affects definition lines opacity
        definitionOpacity: 0.2 + (physique.leanness * 0.6),
        // Energy aura glow intensity
        auraIntensity: physique.energy_aura,
        // Posture affects stance angle
        postureAngle: -5 + (physique.posture_score * 10)
    }), [physique]);

    const accentColor = mode === 'CLINICAL' ? '#88B04B' : '#6366f1';
    const cardBg = mode === 'CLINICAL' ? 'var(--surface)' : 'var(--surface)';

    const hasFireAura = streak >= 7;
    const hasGoldenAura = physique.energy_aura >= 0.9;
    const hasCrown = level >= 20 || streak >= 365;

    return (
        <div
            className="avatar-viewer"
            style={{
                width: config.width,
                background: cardBg,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-md)',
                position: 'relative',
                border: '1px solid var(--border)'
            }}
        >
            {/* Aura Background Effect */}
            {hasGoldenAura && (
                <motion.div
                    className="golden-aura"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'var(--radius-lg)',
                        background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Fire Effect for Streaks */}
            {hasFireAura && (
                <div className="fire-particles" style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 4
                }}>
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [-5, -15, -5],
                                opacity: [1, 0.5, 1]
                            }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.2,
                                repeat: Infinity
                            }}
                        >
                            <Flame size={16} color="#FF6B35" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Crown for Elite Users */}
            {hasCrown && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        position: 'absolute',
                        top: 8,
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                >
                    <Crown size={24} color="#FFD700" fill="#FFD700" />
                </motion.div>
            )}

            {/* SVG Avatar Canvas */}
            <svg
                width={config.width - 24}
                height={config.height}
                viewBox="0 0 100 150"
                style={{ display: 'block', margin: '0 auto' }}
            >
                {/* Definitions */}
                <defs>
                    {/* Skin Gradient */}
                    <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={dna.skin_tone} />
                        <stop offset="100%" stopColor={adjustColor(dna.skin_tone, -20)} />
                    </linearGradient>

                    {/* Muscle Definition Lines */}
                    <filter id="definition-blur">
                        <feGaussianBlur stdDeviation="0.5" />
                    </filter>

                    {/* Aura Glow */}
                    <filter id="aura-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Body Group - Transforms based on posture */}
                <g transform={`rotate(${visualMetrics.postureAngle}, 50, 75)`}>

                    {/* Torso */}
                    <motion.path
                        d={`
                            M ${50 - 15 * visualMetrics.shoulderScale} 55
                            Q ${50 - 18 * visualMetrics.shoulderScale} 60 ${50 - 12 * visualMetrics.torsoScale} 85
                            L ${50 + 12 * visualMetrics.torsoScale} 85
                            Q ${50 + 18 * visualMetrics.shoulderScale} 60 ${50 + 15 * visualMetrics.shoulderScale} 55
                            Z
                        `}
                        fill="url(#skin-gradient)"
                        stroke={adjustColor(dna.skin_tone, -30)}
                        strokeWidth="0.5"
                    />

                    {/* Muscle Definition Lines (visible based on leanness) */}
                    <g opacity={visualMetrics.definitionOpacity} filter="url(#definition-blur)">
                        {/* Chest lines */}
                        <path
                            d={`M 50 58 Q 48 65 50 72`}
                            stroke={adjustColor(dna.skin_tone, -40)}
                            strokeWidth="0.8"
                            fill="none"
                        />
                        {/* Abs */}
                        <path
                            d={`M 50 72 L 50 80`}
                            stroke={adjustColor(dna.skin_tone, -40)}
                            strokeWidth="0.5"
                            fill="none"
                        />
                        <path
                            d={`M 46 74 L 54 74`}
                            stroke={adjustColor(dna.skin_tone, -30)}
                            strokeWidth="0.3"
                            fill="none"
                        />
                        <path
                            d={`M 46 78 L 54 78`}
                            stroke={adjustColor(dna.skin_tone, -30)}
                            strokeWidth="0.3"
                            fill="none"
                        />
                    </g>

                    {/* Arms */}
                    <motion.ellipse
                        cx={50 - 20 * visualMetrics.shoulderScale}
                        cy={65}
                        rx={5 * visualMetrics.armScale}
                        ry={12 * visualMetrics.armScale}
                        fill="url(#skin-gradient)"
                        stroke={adjustColor(dna.skin_tone, -30)}
                        strokeWidth="0.5"
                    />
                    <motion.ellipse
                        cx={50 + 20 * visualMetrics.shoulderScale}
                        cy={65}
                        rx={5 * visualMetrics.armScale}
                        ry={12 * visualMetrics.armScale}
                        fill="url(#skin-gradient)"
                        stroke={adjustColor(dna.skin_tone, -30)}
                        strokeWidth="0.5"
                    />

                    {/* Head */}
                    <circle
                        cx="50"
                        cy="40"
                        r="15"
                        fill="url(#skin-gradient)"
                        stroke={adjustColor(dna.skin_tone, -30)}
                        strokeWidth="0.5"
                    />

                    {/* Hair */}
                    <path
                        d={getHairPath(dna.hair_style)}
                        fill={dna.hair_color}
                    />

                    {/* Eyes - Simple */}
                    <circle cx="45" cy="38" r="1.5" fill="#333" />
                    <circle cx="55" cy="38" r="1.5" fill="#333" />

                    {/* Smile */}
                    <path
                        d="M 46 45 Q 50 48 54 45"
                        stroke="#333"
                        strokeWidth="0.8"
                        fill="none"
                    />

                    {/* Legs */}
                    <rect x="40" y="85" width="8" height="30" rx="3" fill="url(#skin-gradient)" />
                    <rect x="52" y="85" width="8" height="30" rx="3" fill="url(#skin-gradient)" />

                    {/* Gear Overlays */}
                    {gear.torso && (
                        <GearOverlay type="torso" item={gear.torso} metrics={visualMetrics} />
                    )}
                    {gear.legs && (
                        <GearOverlay type="legs" item={gear.legs} metrics={visualMetrics} />
                    )}
                    {gear.accessory && (
                        <GearOverlay type="accessory" item={gear.accessory} metrics={visualMetrics} />
                    )}
                </g>
            </svg>

            {/* Stats Display */}
            {showStats && (
                <div className="avatar-stats" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 4,
                    marginTop: 'var(--space-sm)',
                    fontSize: config.fontSize
                }}>
                    <StatBar
                        label="💪"
                        value={physique.muscle_mass}
                        color="#EF4444"
                    />
                    <StatBar
                        label="🏃"
                        value={physique.leanness}
                        color="#3B82F6"
                    />
                    <StatBar
                        label="✨"
                        value={physique.energy_aura}
                        color="#FBBF24"
                    />
                </div>
            )}

            {/* Customize Button */}
            {isInteractive && onCustomize && (
                <button
                    onClick={onCustomize}
                    style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: accentColor,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'black'
                    }}
                >
                    <ShoppingBag size={16} />
                </button>
            )}

            {/* Level Badge */}
            {level > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    color: 'white',
                    fontSize: config.fontSize - 2,
                    fontWeight: 700
                }}>
                    Lvl {level}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 2 }}>{label}</div>
            <div style={{
                height: 4,
                borderRadius: 2,
                background: 'var(--surface-hover)',
                overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{
                        height: '100%',
                        background: color,
                        borderRadius: 2
                    }}
                />
            </div>
        </div>
    );
}

interface GearOverlayProps {
    type: 'torso' | 'legs' | 'accessory';
    item: string;
    metrics: {
        shoulderScale: number;
        torsoScale: number;
        armScale: number;
    };
}

function GearOverlay({ type, item, metrics }: GearOverlayProps) {
    // Simplified gear rendering - in production, load SVG assets
    const gearColors: Record<string, string> = {
        'tank_top_neon': '#6366f1',
        'tank_top_black': '#1a1a1a',
        'tshirt_white': '#ffffff',
        'shorts_camo': '#4a5d23',
        'shorts_black': '#2a2a2a',
        'watch_gold': '#FFD700'
    };

    const color = gearColors[item] || '#666';

    if (type === 'torso') {
        return (
            <path
                d={`
                    M ${50 - 14 * metrics.shoulderScale} 56
                    Q ${50 - 16 * metrics.shoulderScale} 62 ${50 - 11 * metrics.torsoScale} 82
                    L ${50 + 11 * metrics.torsoScale} 82
                    Q ${50 + 16 * metrics.shoulderScale} 62 ${50 + 14 * metrics.shoulderScale} 56
                    Z
                `}
                fill={color}
                opacity={0.9}
            />
        );
    }

    if (type === 'legs') {
        return (
            <>
                <rect x="40" y="85" width="8" height="18" rx="2" fill={color} />
                <rect x="52" y="85" width="8" height="18" rx="2" fill={color} />
            </>
        );
    }

    if (type === 'accessory' && item.includes('watch')) {
        return (
            <circle
                cx={50 - 20 * metrics.shoulderScale}
                cy={75}
                r={3}
                fill={color}
                stroke="#333"
                strokeWidth="0.3"
            />
        );
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function adjustColor(hex: string, amount: number): string {
    // Simple color adjustment
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function getHairPath(style: string): string {
    const paths: Record<string, string> = {
        'buzz_cut': 'M 35 35 Q 50 22 65 35 Q 68 30 65 25 Q 50 18 35 25 Q 32 30 35 35',
        'short_classic': 'M 35 38 Q 50 20 65 38 Q 70 28 65 22 Q 50 12 35 22 Q 30 28 35 38',
        'long_wavy': 'M 30 40 Q 35 18 50 15 Q 65 18 70 40 L 72 55 Q 68 45 65 50 L 35 50 Q 32 45 28 55 L 30 40',
        'ponytail': 'M 35 38 Q 50 20 65 38 Q 70 28 65 22 Q 50 12 35 22 Q 30 28 35 38 M 50 25 Q 55 20 60 30'
    };
    return paths[style] || paths['short_classic'];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT WITH SAMPLE DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const SAMPLE_AVATAR = {
    physique: {
        muscle_mass: 0.45,
        shoulder_width: 0.4,
        arm_definition: 0.35,
        leanness: 0.5,
        energy_aura: 0.7,
        posture_score: 0.6
    },
    dna: {
        skin_tone: '#C4A583',
        hair_style: 'short_classic',
        hair_color: '#2C1810',
        gender: 'neutral' as const,
        body_type: 'athletic',
        face_shape: 'oval'
    },
    gear: {
        torso: 'tank_top_neon',
        legs: 'shorts_black'
    }
};

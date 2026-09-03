/**
 * METABOLIC RADAR COMPONENT
 * Spider chart for micronutrient visualization
 * 
 * Features:
 * - SVG-based radar/spider chart
 * - Pathology-specific requirements overlay
 * - Deficiency alerts with food suggestions
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    Zap,
    Apple
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface MicronutrientAlert {
    severity: 'low' | 'medium' | 'high' | 'critical';
    nutrient: string;
    current_value: number;
    target_value: number;
    unit: string;
    deficit_percent: number;
    message: string;
    suggestion: string;
    suggested_foods: string[];
    pathology: string;
}

interface RadarData {
    nutrients: Record<string, number>;
    alerts: MicronutrientAlert[];
    overall_score: number;
}

interface MetabolicRadarProps {
    pathologies?: string[];
    planMicros?: {
        iron: number;
        calcium: number;
        zinc: number;
        selenium: number;
        vitamin_d: number;
        vitamin_b12: number;
        magnesium: number;
        folate: number;
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const NUTRIENT_LABELS: Record<string, string> = {
    iron: 'Hierro',
    calcium: 'Calcio',
    zinc: 'Zinc',
    selenium: 'Selenio',
    vitamin_d: 'Vit D',
    b12: 'B12',
    magnesium: 'Magnesio',
    folate: 'Folato'
};

const SEVERITY_COLORS = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626'
};

const SEVERITY_ICONS = {
    low: Info,
    medium: AlertCircle,
    high: AlertTriangle,
    critical: Zap
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function MetabolicRadar({
    pathologies = ['anemia', 'hypothyroidism'],
    planMicros
}: MetabolicRadarProps) {
    // Use CSS variable as accent color
    const accentColor = 'var(--accent)';
    const [radarData, setRadarData] = useState<RadarData | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedAlert, setExpandedAlert] = useState<number | null>(null);

    // Default micros for demo
    const defaultMicros = {
        iron: 12,
        calcium: 800,
        zinc: 6,
        selenium: 40,
        vitamin_d: 15,
        vitamin_b12: 2.0,
        magnesium: 280,
        folate: 300
    };

    const micros = planMicros || defaultMicros;

    // Fetch radar data
    useEffect(() => {
        const fetchRadarData = async () => {
            setLoading(true);
            try {
                // Using API_BASE_URL to avoid ghost ports. (Assumes global auth is passed if needed)
                const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const token = localStorage.getItem('auth_token');

                const response = await fetch(`${BASE_URL}/api/v1/nutrition/radar-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        plan_micros: micros,
                        pathologies,
                        allergies: []
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setRadarData(data);
                }
            } catch (error) {
                console.error('Error fetching radar data:', error);
                setRadarData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRadarData();
    }, [pathologies, micros]);

    if (loading) {
        return (
            <div style={{
                padding: 'var(--space-xl)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <Zap size={32} color={accentColor} style={{ opacity: 0.5 }} />
                </motion.div>
            </div>
        );
    }

    if (!radarData) {
        return (
            <div style={{
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)'
            }}>
                <Target size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Sin Datos</h3>
                <p style={{ color: 'var(--text-muted)' }}>No hay datos suficientes para generar el Radar Metabólico.</p>
            </div>
        );
    }

    const nutrients = Object.entries(radarData.nutrients);
    const numPoints = nutrients.length;
    const angleStep = (2 * Math.PI) / numPoints;
    const centerX = 150;
    const centerY = 150;
    const maxRadius = 100;

    // Generate radar polygon points
    const getPoint = (index: number, value: number) => {
        const angle = angleStep * index - Math.PI / 2;
        const radius = Math.min(value, 1.5) * maxRadius / 1.5;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };

    const polygonPoints = nutrients.map(([_, value], i) => getPoint(i, value));
    const targetPolygon = nutrients.map((_, i) => getPoint(i, 1));

    // Score color
    const getScoreColor = (score: number) => {
        if (score >= 0.9) return '#10B981';
        if (score >= 0.7) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div style={{ padding: 'var(--space-lg)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    textAlign: 'center',
                    marginBottom: 'var(--space-lg)'
                }}
            >
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    marginBottom: 'var(--space-xs)'
                }}>
                    🎯 Radar Metabólico
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Patologías: {pathologies.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                </p>
            </motion.div>

            {/* Radar Chart */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)',
                    marginBottom: 'var(--space-lg)',
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                <svg width={300} height={300} viewBox="0 0 300 300">
                    {/* Background circles */}
                    {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                        <circle
                            key={i}
                            cx={centerX}
                            cy={centerY}
                            r={maxRadius * scale}
                            fill="none"
                            stroke="var(--surface-hover)"
                            strokeWidth={1}
                            opacity={0.5}
                        />
                    ))}

                    {/* Axis lines */}
                    {nutrients.map(([_, __], i) => {
                        const point = getPoint(i, 1.1);
                        return (
                            <line
                                key={i}
                                x1={centerX}
                                y1={centerY}
                                x2={point.x}
                                y2={point.y}
                                stroke="var(--surface-hover)"
                                strokeWidth={1}
                            />
                        );
                    })}

                    {/* Target polygon (100% line) */}
                    <motion.polygon
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        points={targetPolygon.map(p => `${p.x},${p.y}`).join(' ')}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={2}
                        strokeDasharray="4,4"
                    />

                    {/* Actual values polygon */}
                    <motion.polygon
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                        fill={`${accentColor}40`}
                        stroke={accentColor}
                        strokeWidth={2}
                        style={{ transformOrigin: 'center' }}
                    />

                    {/* Data points */}
                    {polygonPoints.map((point, i) => {
                        const [nutrient, value] = nutrients[i];
                        const color = value >= 1 ? '#10B981' : value >= 0.7 ? '#F59E0B' : '#EF4444';
                        return (
                            <motion.circle
                                key={i}
                                cx={point.x}
                                cy={point.y}
                                r={6}
                                fill={color}
                                stroke="white"
                                strokeWidth={2}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            />
                        );
                    })}

                    {/* Labels */}
                    {nutrients.map(([nutrient, value], i) => {
                        const labelPoint = getPoint(i, 1.35);
                        return (
                            <text
                                key={i}
                                x={labelPoint.x}
                                y={labelPoint.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="var(--text)"
                                fontSize="11"
                                fontWeight="600"
                            >
                                {NUTRIENT_LABELS[nutrient] || nutrient}
                            </text>
                        );
                    })}

                    {/* Center score */}
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r={35}
                        fill="var(--background)"
                        stroke={getScoreColor(radarData.overall_score)}
                        strokeWidth={3}
                    />
                    <text
                        x={centerX}
                        y={centerY - 5}
                        textAnchor="middle"
                        fill={getScoreColor(radarData.overall_score)}
                        fontSize="20"
                        fontWeight="800"
                    >
                        {Math.round(radarData.overall_score * 100)}%
                    </text>
                    <text
                        x={centerX}
                        y={centerY + 12}
                        textAnchor="middle"
                        fill="var(--text-muted)"
                        fontSize="9"
                    >
                        Cobertura
                    </text>
                </svg>
            </motion.div>

            {/* Alerts */}
            <AnimatePresence>
                {radarData.alerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            marginBottom: 'var(--space-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <AlertTriangle size={20} color="#F59E0B" />
                            Alertas Nutricionales ({radarData.alerts.length})
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {radarData.alerts.map((alert, index) => {
                                const Icon = SEVERITY_ICONS[alert.severity];
                                const color = SEVERITY_COLORS[alert.severity];
                                const isExpanded = expandedAlert === index;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{
                                            background: `${color}15`,
                                            border: `1px solid ${color}40`,
                                            borderRadius: 'var(--radius-md)',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            onClick={() => setExpandedAlert(isExpanded ? null : index)}
                                            style={{
                                                padding: 'var(--space-md)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Icon size={20} color={color} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{alert.message}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {alert.current_value}/{alert.target_value} {alert.unit}
                                                        <span style={{ color }}> ({alert.deficit_percent.toFixed(0)}% déficit)</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{
                                                        padding: '0 var(--space-md) var(--space-md)',
                                                        borderTop: `1px solid ${color}30`
                                                    }}
                                                >
                                                    <div style={{
                                                        marginTop: 'var(--space-md)',
                                                        padding: 'var(--space-md)',
                                                        background: 'var(--surface)',
                                                        borderRadius: 'var(--radius-sm)'
                                                    }}>
                                                        <div style={{
                                                            fontWeight: 600,
                                                            marginBottom: 'var(--space-sm)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8
                                                        }}>
                                                            <Apple size={16} color={accentColor} />
                                                            {alert.suggestion}
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            Alimentos ricos en {NUTRIENT_LABELS[alert.nutrient] || alert.nutrient}:
                                                        </div>
                                                        <ul style={{
                                                            margin: 'var(--space-sm) 0 0 var(--space-md)',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {alert.suggested_foods.map((food, i) => (
                                                                <li key={i} style={{ marginBottom: 4 }}>{food}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* No alerts message */}
            {radarData.alerts.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-lg)',
                        textAlign: 'center'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>✨</span>
                    <h3 style={{ color: '#10B981', marginTop: 'var(--space-sm)' }}>
                        ¡Plan nutricionalmente completo!
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Todos los micronutrientes están cubiertos según las patologías del paciente.
                    </p>
                </motion.div>
            )}
        </div>
    );
}

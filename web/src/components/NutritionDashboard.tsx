/**
 * NUTRITION DASHBOARD
 * Main view for Advanced Nutrition Module
 * 
 * Features:
 * - Tab navigation between features
 * - Menu Scanner integration
 * - Metabolic Radar integration
 * - Smart Swaps integration
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Target,
    RefreshCw,
    Utensils,
    ChefHat,
    BookOpen,
    Sparkles
} from 'lucide-react';
import { MenuScanner } from './MenuScanner';
import MetabolicRadar from './MetabolicRadar';
import { ShoppingListOrchestrator } from './nutrition/ShoppingListOrchestrator';
import { KitchenModeCanvas } from './nutrition/KitchenModeCanvas';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type Tab = 'scanner' | 'radar' | 'swaps' | 'archetypes';

interface TabConfig {
    id: Tab;
    label: string;
    icon: React.ElementType;
    description: string;
    badge?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TABS: TabConfig[] = [
    {
        id: 'scanner',
        label: 'Menu Scanner',
        icon: Camera,
        description: 'Analiza menús de restaurantes',
        badge: 'AI'
    },
    {
        id: 'planner',
        label: 'Meal Prep',
        icon: ChefHat,
        description: 'Planificación proactiva y despensa',
        badge: 'NUEVO'
    },
    {
        id: 'radar',
        label: 'Radar Metabólico',
        icon: Target,
        description: 'Micronutrientes por patología'
    },
    {
        id: 'swaps',
        label: 'Smart Swaps',
        icon: RefreshCw,
        description: 'Sustituciones inteligentes'
    },
    {
        id: 'archetypes',
        label: 'Arquetipos',
        icon: BookOpen,
        description: 'Templates de dietas'
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function NutritionDashboard() {
    // Use CSS variable as accent color
    const accentColor = 'var(--accent)';
    const [activeTab, setActiveTab] = useState<Tab>('scanner');

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)'
        }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'var(--surface)',
                    borderBottom: '1px solid var(--surface-hover)',
                    padding: 'var(--space-lg) var(--space-xl)'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxWidth: 1200,
                    margin: '0 auto'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            marginBottom: 'var(--space-xs)'
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-md)',
                                background: `linear-gradient(135deg, ${accentColor}, #F59E0B)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Utensils size={22} color="white" />
                            </div>
                            Nutrición Avanzada
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Motor de nutrición inteligente con IA
                        </p>
                    </div>

                    {/* Mocks erradicados */}
                </div>
            </motion.div>

            {/* Tab Navigation */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--surface-hover)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    display: 'flex',
                    gap: 'var(--space-xs)',
                    padding: '0 var(--space-lg)',
                    overflowX: 'auto'
                }}>
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '16px 20px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: `3px solid ${isActive ? accentColor : 'transparent'}`,
                                    color: isActive ? accentColor : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap'
                                }}
                                whileHover={{ color: accentColor }}
                            >
                                <Icon size={18} />
                                {tab.label}
                                {tab.badge && (
                                    <span style={{
                                        background: `linear-gradient(135deg, ${accentColor}, #F59E0B)`,
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                        fontWeight: 700
                                    }}>
                                        {tab.badge}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: 'var(--space-lg)'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'scanner' && <MenuScanner />}
                        {activeTab === 'radar' && <MetabolicRadar />}
                        {activeTab === 'swaps' && <SmartSwaps />}
                        {activeTab === 'archetypes' && <ArchetypesPlaceholder />}
                        {activeTab === 'planner' && <MealPrepView />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function SmartSwaps() {
    const accentColor = 'var(--accent)';
    const [ingredient, setIngredient] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ingredient.trim()) return;
        
        setLoading(true);
        try {
            const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('auth_token');
            const patientId = '00000000-0000-0000-0000-000000000000'; // Demo UUID

            const response = await fetch(`${BASE_URL}/api/v1/dietqa/substitutions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    ingredient: ingredient
                })
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
            }
        } catch (error) {
            console.error('Error fetching substitutions:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            textAlign: 'center'
        }}>
            <RefreshCw size={48} color={accentColor} style={{ marginBottom: 'var(--space-md)', margin: '0 auto' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                Smart Swaps
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                "No tengo esto" → Te doy alternativas macro-equivalentes según reglas clínicas
            </p>

            <form onSubmit={handleSearch} style={{ maxWidth: 500, margin: '0 auto var(--space-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <input 
                        type="text" 
                        value={ingredient}
                        onChange={(e) => setIngredient(e.target.value)}
                        placeholder="Ej: Yogur Entero, Queso Cheddar"
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--surface-hover)',
                            background: 'var(--background)',
                            color: 'var(--text)',
                            outline: 'none'
                        }}
                    />
                    <button 
                        type="submit"
                        disabled={loading || !ingredient.trim()}
                        style={{
                            padding: '12px 24px',
                            borderRadius: 'var(--radius-md)',
                            background: accentColor,
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            cursor: loading || !ingredient.trim() ? 'not-allowed' : 'pointer',
                            opacity: loading || !ingredient.trim() ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Buscando...' : 'Sustituir'}
                    </button>
                </div>
            </form>

            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: 600, margin: '0 auto', textAlign: 'left' }}
                >
                    <div style={{
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        marginBottom: 'var(--space-md)'
                    }}>
                        <div style={{ fontWeight: 600, color: '#10B981', marginBottom: 4 }}>Razonamiento Clínico</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{result.ai_reasoning}</div>
                        {result.cached && (
                            <span style={{ fontSize: '0.7rem', background: '#F59E0B', color: 'white', padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>CACHED</span>
                        )}
                    </div>
                    
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>Alternativas:</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                        {result.suggested_substitutes.map((sub: string, i: number) => (
                            <div key={i} style={{ background: 'var(--surface-hover)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                                🔄 {sub}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function ArchetypesPlaceholder() {
    // Use CSS variable as accent color
    const accentColor = 'var(--accent)';

    return (
        <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)'
        }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                <ChefHat size={48} color={accentColor} style={{ marginBottom: 'var(--space-md)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                    Clone & Tweak - Arquetipos de Dieta
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Templates configurados que se auto-ajustan al peso/altura del paciente
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--space-md)'
            }}>
                {[
                    { name: 'Protocolo SIBO Fase 1', category: 'therapeutic', color: '#EF4444' },
                    { name: 'Keto Pérdida de Grasa', category: 'weight_loss', color: '#F59E0B' },
                    { name: 'Hipercalórica Masa Muscular', category: 'muscle_gain', color: '#10B981' },
                    { name: 'Mediterránea Cardioprotectora', category: 'general_health', color: '#6366F1' }
                ].map((arch, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                            background: `${arch.color}10`,
                            border: `1px solid ${arch.color}40`,
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-lg)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 'var(--space-sm)'
                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                background: arch.color,
                                color: 'white',
                                borderRadius: 10,
                                fontWeight: 600
                            }}>
                                {arch.category.replace('_', ' ')}
                            </span>
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-xs)' }}>
                            {arch.name}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Listo para aplicar a cualquier paciente
                        </p>
                    </motion.div>
                ))}
            </div>

            <p style={{
                marginTop: 'var(--space-lg)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
            }}>
                Endpoint activo: <code>POST /nutrition/archetypes/apply</code>
            </p>
        </div>
    );
}

function MealPrepView() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-lg)' }}>
            <div>
                <ShoppingListOrchestrator />
            </div>
            <div>
                <KitchenModeCanvas />
            </div>
        </div>
    );
}

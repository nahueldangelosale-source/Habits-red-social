import React from 'react';
import { 
    Activity, 
    Utensils, 
    Crown, 
    Camera, 
    Dumbbell, 
    User, 
    Zap, 
    ShoppingBag, 
    Calendar, 
    BarChart,
    ShieldCheck,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { RecoveryThermometer } from './athlete/RecoveryThermometer';
import { useRBAC } from '../context/RBACContext';
import { Role } from '../types/rbac';
import { PlanSelection } from './PlanSelection';
import { CheckoutInvoice } from './checkout/CheckoutInvoice';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';

// =============================================================================
// SUB-COMPONENTS WITH PROPS
// =============================================================================

const MobileHeader = ({ title, subtitle, icon, shields }: any) => (
    <header aria-label="Vista principal" className="pt-16 pb-6 px-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-black text-white">{title}</h1>
                <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">{subtitle}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-sm">
                {icon}
            </div>
        </div>

        {/* 🛡️ POSITIVE ENCUADRE CONDUCTUAL (Framing Safeguards) */}
        {shields && shields.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 pt-2"
            >
                {shields.map((sText: string, i: number) => (
                    <div 
                        key={i} 
                        className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                    >
                        <ShieldCheck size={11} className="shrink-0" />
                        {sText}
                    </div>
                ))}
            </motion.div>
        )}
    </header>
);

const NextMealCard = ({ hasLowFodmap }: { hasLowFodmap: boolean }) => (
    <article aria-labelledby="next-meal-title" className="mx-6 mb-4 p-5 rounded-[2rem] bg-emerald-900/10 backdrop-blur-2xl border border-emerald-500/20 shadow-lg">
        <h3 id="next-meal-title" className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Próxima Comida</h3>
        <p className="text-white font-bold mb-1">Poke Bowl de Salmón</p>
        <p className="text-xs text-zinc-300">14:30 • 540 kcal</p>
        {hasLowFodmap && (
            <div className="mt-2.5 pt-2 border-t border-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <span>🛡️ Protocolo Low-FODMAP: Ingredientes fermentables sustituidos</span>
            </div>
        )}
    </article>
);

const MacroProgress = ({ protein, carbs, fats, calories }: any) => (
    <article aria-labelledby="macros-title" className="mx-6 mb-6 p-5 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg flex items-center justify-between">
        <h3 id="macros-title" className="sr-only">Progreso de Macronutrientes</h3>
        <div className="flex gap-4">
            <div className="text-center">
                <div className="text-xs text-zinc-400 mb-1">P</div>
                <div className="text-sm font-bold text-white">{protein}g</div>
            </div>
            <div className="text-center">
                <div className="text-xs text-zinc-400 mb-1">C</div>
                <div className="text-sm font-bold text-white">{carbs}g</div>
            </div>
            <div className="text-center">
                <div className="text-xs text-zinc-400 mb-1">F</div>
                <div className="text-sm font-bold text-white">{fats}g</div>
            </div>
        </div>
        <div className="text-right">
            <div className="text-2xl font-black text-[var(--color-action-primary)]">{calories}</div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">kcal objetivo</div>
        </div>
    </article>
);

const WorkoutCard = () => (
    <article aria-labelledby="workout-title" className="mx-6 mb-4 p-5 rounded-[2rem] bg-indigo-900/10 backdrop-blur-2xl border border-indigo-500/20 shadow-lg">
        <h3 id="workout-title" className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Entrenamiento de Hoy</h3>
        <p className="text-white font-bold mb-1">Empuje (Push A)</p>
        <p className="text-xs text-zinc-300">Pectoral • Tríceps • Hombro</p>
    </article>
);

const telemetryData = [
    { date: '1 Jul', mm: 0, w: 0 },
    { date: '8 Jul', mm: 1.2, w: -0.5 },
    { date: '15 Jul', mm: 2.8, w: -1.2 },
    { date: '22 Jul', mm: 3.5, w: -1.8 },
    { date: '29 Jul', mm: 5.1, w: -2.4 },
];

const HeroGraphCard = () => {
    // 1. Hover-to-Aha Telemetry Event placeholder
    const handleTooltipHover = () => {
        // Here we'd fire the telemetry event if hover duration > 800ms
    };

    return (
        <article aria-labelledby="hero-title" className="mx-6 mb-4 p-5 rounded-[2rem] bg-zinc-950 backdrop-blur-xl border border-zinc-800 shadow-2xl relative overflow-hidden">
            {/* The Background Glow (Opción 1) */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none transition-opacity duration-1000 animate-pulse" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 id="hero-title" className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 font-lato">Recomposición Corporal</h3>
                    
                    {/* The Golden Delta (Opción 2) */}
                    <div className="flex items-center gap-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.1 }}
                            className="flex items-baseline gap-1.5"
                        >
                            <span className="text-2xl font-black text-emerald-400 font-montserrat">+5.1%</span>
                            <span className="text-[10px] font-bold text-emerald-500/70 uppercase font-lato">Masa Magra</span>
                        </motion.div>
                        
                        <div className="w-px h-8 bg-zinc-800" />
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 100, damping: 10, delay: 0.2 }}
                            className="flex items-baseline gap-1.5"
                        >
                            <span className="text-2xl font-black text-amber-500 font-montserrat">-2.4%</span>
                            <span className="text-[10px] font-bold text-amber-500/70 uppercase font-lato">Cintura</span>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="h-44 w-full relative z-10 -ml-2" onMouseEnter={handleTooltipHover} onTouchStart={handleTooltipHover}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="glowDivergence" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} domain={[-5, 8]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ fontWeight: 900 }}
                            formatter={(value: any, name: any) => {
                                if (name === 'mm') return [`+${value}%`, 'Calidad Muscular'];
                                return [`${value}%`, 'Cintura / Grasa'];
                            }}
                            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                            cursor={{ stroke: '#27272a', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        
                        {/* Glow de Divergencia (Opción 1) */}
                        <Area 
                            type="monotone" 
                            dataKey="mm" 
                            stroke="none" 
                            fillOpacity={1} 
                            fill="url(#glowDivergence)" 
                            animationDuration={1500}
                        />
                        
                        {/* Línea de Poder (Masa Magra / FFMI) */}
                        <Line 
                            type="monotone" 
                            dataKey="mm" 
                            stroke="#10b981" 
                            strokeWidth={4} 
                            dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
                            activeDot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#000' }}
                            animationDuration={1500}
                        />
                        
                        {/* Línea de Riesgo (Cintura) */}
                        <Line 
                            type="monotone" 
                            dataKey="w" 
                            stroke="#f59e0b" 
                            strokeWidth={4} 
                            dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} 
                            activeDot={{ r: 6, fill: '#f59e0b', strokeWidth: 3, stroke: '#000' }}
                            animationDuration={1500}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
};

const BottomNav: React.FC<{ currentTab: string, onTabChange: (tab: string) => void }> = ({ currentTab, onTabChange }) => {
    return (
        <div className="mobile-nav">
            <button
                type="button"
                className={`nav-item ${currentTab === 'today' ? 'active' : ''}`}
                onClick={() => onTabChange('today')}
            >
                <Activity size={24} />
                <span>Resumen</span>
            </button>

            <button type="button" className={`nav-item ${currentTab === 'fitness' ? 'active' : ''}`} onClick={() => onTabChange('fitness')}>
                <Dumbbell size={24} />
                <span>Entrenamiento</span>
            </button>

            <button type="button" className={`nav-item ${currentTab === 'nutrition' ? 'active' : ''}`} onClick={() => onTabChange('nutrition')}>
                <Utensils size={24} />
                <span>Nutrición</span>
            </button>

            <button type="button" className={`nav-item ${currentTab === 'habits' ? 'active' : ''}`} onClick={() => onTabChange('habits')}>
                <CheckCircle2 size={24} />
                <span>Hábitos</span>
            </button>

            <button type="button" className={`nav-item ${currentTab === 'agenda' ? 'active' : ''}`} onClick={() => onTabChange('agenda')}>
                <Calendar size={24} />
                <span>Agenda</span>
            </button>
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ClientHub: React.FC = () => {
    const { currentRole } = useRBAC();
    const [activeTab, setActiveTab] = React.useState<'today' | 'fitness' | 'nutrition' | 'habits' | 'agenda' | 'profile'>('today');
    const [showCheckout, setShowCheckout] = React.useState(false);
    const [selectedPlan, setSelectedPlan] = React.useState<{ name: string, price: number } | null>(null);
    
    // Telemetry Sync state (Work Illusion)
    const [isSyncing, setIsSyncing] = React.useState(true);

    // Hydrated Patient State
    const [patientData, setPatientData] = React.useState<any>(null);

    // Sync from local storage
    const loadPatientDetails = () => {
        const epRaw = localStorage.getItem('ephemeral_patient_demo');
        if (epRaw) {
            try {
                const ep = JSON.parse(epRaw);
                const editsRaw = localStorage.getItem('patient_edits_ephemeral-demo');
                let data = {
                    full_name: ep.patient_name || 'Nahuel 2',
                    calories: ep.daily_energy_requirement || 1800,
                    protein: Math.round((ep.weight || 82.5) * 2) || 165,
                    carbs: Math.round((ep.daily_energy_requirement || 1800) * 0.4 / 4) || 180,
                    fats: Math.round((ep.daily_energy_requirement || 1800) * 0.25 / 9) || 50,
                    clinicalFlags: {
                        low_fodmap: ep.clinical_flags?.low_fodmap_active || false,
                        glp1: ep.clinical_flags?.glp1_safety_mode || false,
                        mets: ep.clinical_flags?.metabolic_syndrome_risk || false
                    }
                };
                
                // If there are edits made in PatientDetailView, overlay them!
                if (editsRaw) {
                    const edits = JSON.parse(editsRaw);
                    data = {
                        ...data,
                        full_name: edits.full_name,
                        calories: edits.calories,
                        protein: edits.protein,
                        carbs: edits.carbs,
                        fats: edits.fats,
                        clinicalFlags: {
                            low_fodmap: edits.clinicalFlags.low_fodmap,
                            glp1: edits.clinicalFlags.glp1,
                            mets: edits.clinicalFlags.mets
                        }
                    };
                }
                setPatientData(data);
            } catch (err) {
                console.error("Error reading client details", err);
            }
        }
    };

    React.useEffect(() => {
        loadPatientDetails();

        // Listen for live update event triggered when professional saves edits
        const handleLiveUpdate = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.id === 'ephemeral-demo') {
                setPatientData({
                    full_name: detail.full_name,
                    calories: detail.calories,
                    protein: detail.protein,
                    carbs: detail.carbs,
                    fats: detail.fats,
                    clinicalFlags: {
                        low_fodmap: detail.clinicalFlags.low_fodmap,
                        glp1: detail.clinicalFlags.glp1,
                        mets: detail.clinicalFlags.mets
                    }
                });
            }
        };

        window.addEventListener('patient-updated', handleLiveUpdate);
        return () => window.removeEventListener('patient-updated', handleLiveUpdate);
    }, []);

    React.useEffect(() => {
        // MX: Simulate initial AI agent load (Object Constancy / Labor Illusion)
        setIsSyncing(true);
        const timer = setTimeout(() => setIsSyncing(false), 1400);
        return () => clearTimeout(timer);
    }, [activeTab, patientData]);

    const isNutritionClient = currentRole === Role.CLIENT_NUTRITION;
    const isFitnessClient = currentRole === Role.CLIENT_FITNESS;

    // Default to Hybrid
    const isHybrid = currentRole === Role.CLIENT_HYBRID ||
        (!isNutritionClient && !isFitnessClient);

    const handlePlanSelect = (plan: 'ESSENTIAL' | 'ELITE') => {
        setSelectedPlan({
            name: plan === 'ESSENTIAL' ? 'Plan Essential' : 'Plan Performance Elite',
            price: plan === 'ESSENTIAL' ? 45000 : 90000
        });
        setShowCheckout(true);
    };

    // Calculate translated clinical shields (Positive Framing)
    const activeShields = React.useMemo(() => {
        const shieldsList: string[] = [];
        if (patientData) {
            if (patientData.clinicalFlags.low_fodmap) {
                shieldsList.push("🛡️ Protocolo Low-FODMAP Activo");
            }
            if (patientData.clinicalFlags.glp1) {
                shieldsList.push("🛡️ Escudo GLP-1 Adherencia Activa");
            }
            if (patientData.clinicalFlags.mets) {
                shieldsList.push("🛡️ Optimización Metabólica Activa");
            }
        }
        return shieldsList;
    }, [patientData]);

    return (
        <div className="client-app-container">
            {/* Checkout Modal Overlay */}
            {showCheckout && selectedPlan && (
                <section aria-label="Checkout modal" className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xl p-4">
                    <div className="w-full max-w-md transform scale-90">
                        <CheckoutInvoice
                            amount={selectedPlan.price}
                            coachName="Dr. Sara Connor"
                            planName={selectedPlan.name}
                            onConfirm={() => {
                                alert("🔒 Redirigiendo a Pasarela de Pago...");
                                setShowCheckout(false);
                                setActiveTab('today');
                            }}
                            onClose={() => setShowCheckout(false)}
                        />
                    </div>
                </section>
            )}

            <main className="mobile-frame">
                <div className="notch" aria-hidden="true"></div>

                <div className="app-content">
                    {/* Header adapts to role or hydrates with Ephemeral Patient */}
                    {activeTab === 'today' && (
                        <>
                            {patientData ? (
                                <MobileHeader
                                    title={`Hola, ${patientData.full_name.split(' ')[0]}`}
                                    subtitle="Protocolo Nutricional Activo"
                                    icon={<Zap color="#6366f1" />}
                                    shields={activeShields}
                                />
                            ) : (
                                <>
                                    {isNutritionClient && (
                                        <MobileHeader
                                            title="Hola, Ana"
                                            subtitle="Objetivo: Déficit Calórico"
                                            icon={<Utensils color="#10B981" />}
                                        />
                                    )}
                                    {isFitnessClient && (
                                        <MobileHeader
                                            title="Hola, Carlos"
                                            subtitle="Objetivo: Hipertrofia"
                                            icon={<Dumbbell color="#6366F1" />}
                                        />
                                    )}
                                    {isHybrid && (
                                        <MobileHeader
                                            title="Hola, Sofia"
                                            subtitle="Plan Integral"
                                            icon={<Zap color="#F59E0B" />}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {activeTab === 'profile' && (
                        <MobileHeader
                            title="Tu Perfil"
                            subtitle="Optimización & Biometría"
                            icon={<User color="#6366f1" />}
                        />
                    )}

                    <section aria-label="Contenido Principal" className="scroll-content">
                        {/* CONDITIONAL MAIN VIEW */}
                        {activeTab === 'today' ? (
                            <div aria-live="polite">
                                {isSyncing ? (
                                    <div className="flex flex-col gap-4 px-6 mt-4">
                                        <div className="h-28 rounded-[2rem] skeleton border border-white/10" />
                                        <div className="h-24 rounded-[2rem] skeleton border border-white/10" />
                                        <div className="h-32 rounded-[2rem] skeleton border border-white/10" />
                                        <div className="flex flex-col items-center gap-1 mt-4">
                                            <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase animate-pulse">Sincronizando con Consultorio de Nutricionista...</span>
                                            <span className="text-[8px] text-zinc-500 font-mono">Descargando últimos macros y bloqueos de seguridad</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* NUTRITION & HYBRID */}
                                        {(isNutritionClient || isHybrid) && (
                                            <>
                                                <NextMealCard hasLowFodmap={patientData ? patientData.clinicalFlags.low_fodmap : false} />
                                                
                                                {patientData ? (
                                                    <MacroProgress 
                                                        protein={patientData.protein}
                                                        carbs={patientData.carbs}
                                                        fats={patientData.fats}
                                                        calories={patientData.calories}
                                                    />
                                                ) : (
                                                    <MacroProgress protein={120} carbs={210} fats={45} calories={1850} />
                                                )}

                                                <nav aria-label="Acciones de Nutrición" className="action-row">
                                                    <button className="btn-action bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors border border-white/10">
                                                        <ShoppingBag size={20} /> Lista de Compras
                                                    </button>
                                                    <button className="btn-action bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors border border-white/10">
                                                        <Calendar size={20} /> Menú Semanal
                                                    </button>
                                                </nav>
                                            </>
                                        )}

                                        {/* SEPARATOR FOR HYBRID */}
                                        {isHybrid && <div className="section-divider opacity-50 text-zinc-500">ENTRENAMIENTO</div>}

                                        {/* FITNESS & HYBRID */}
                                        {(isFitnessClient || isHybrid) && (
                                            <>
                                                <WorkoutCard />
                                                <HeroGraphCard />
                                                <nav aria-label="Acciones de Entrenamiento" className="action-row">
                                                    <button className="btn-action secondary bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors border border-white/10">
                                                        <BarChart size={20} /> Ver Progreso
                                                    </button>
                                                </nav>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : activeTab === 'profile' ? (
                            /* PROFILE VIEW WITH NUTRIENT BALANCE RADAR */
                            <div className="px-6 flex flex-col gap-6" aria-live="polite">
                                {isSyncing ? (
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div className="h-32 rounded-[2rem] bg-white/5 skeleton border border-white/10" />
                                        <div className="h-48 rounded-[2rem] bg-white/5 skeleton border border-white/10" />
                                        <div className="flex flex-col items-center gap-1 mt-4">
                                            <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase animate-pulse">Cargando Perfil Biométrico...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Avatar & Basic Info Card */}
                                        <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-black text-2xl font-black shadow-lg">
                                                {patientData ? patientData.full_name.charAt(0) : 'N'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white leading-tight">
                                                    {patientData ? patientData.full_name : 'Nahuel 2'}
                                                </h3>
                                                <p className="text-xs text-zinc-400 font-mono">
                                                    CLIENT_LEVEL_ACTIVE
                                                </p>
                                            </div>
                                        </div>

                                        {/* Active Shields / Health Guards */}
                                        {activeShields.length > 0 && (
                                            <div className="p-5 rounded-[2rem] bg-emerald-950/10 border border-emerald-500/20 shadow-md space-y-2">
                                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Escudos de Optimización</h4>
                                                <div className="flex flex-col gap-2">
                                                    {activeShields.map((shield, i) => (
                                                        <div key={i} className="text-xs text-zinc-350 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                            {shield.replace(/🛡️ /g, "")}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* TERMÓMETRO DE RECUPERACIÓN (Inyectado con Revelación Progresiva) */}
                                        <RecoveryThermometer patientId={patientData?.id || 'demo'} athleteFTP={250} />

                                        {/* Nutrient Balance Chart Card */}
                                        <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg">
                                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 text-center">
                                                Nutrient Balance
                                            </h4>
                                            <div className="h-[240px] w-full flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                                                        { subject: 'Proteína', A: Math.min(120, ((patientData?.protein || 140) / 150) * 100), fullMark: 100 },
                                                        { subject: 'Carbos', A: Math.min(120, ((patientData?.carbs || 160) / 200) * 100), fullMark: 100 },
                                                        { subject: 'Grasas', A: Math.min(120, ((patientData?.fats || 60) / 70) * 100), fullMark: 100 },
                                                        { subject: 'Fibra', A: patientData?.clinicalFlags?.low_fodmap ? 60 : 85, fullMark: 100 },
                                                        { subject: 'Agua', A: 90, fullMark: 100 }
                                                    ]}>
                                                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                                                        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar
                                                            name="Actual"
                                                            dataKey="A"
                                                            stroke="#6366f1"
                                                            strokeWidth={2}
                                                            fill="#6366f1"
                                                            fillOpacity={0.25}
                                                        />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Biometrics Summary */}
                                        <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 shadow-lg grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-white/2 rounded-2xl border border-white/5">
                                                <span className="text-[10px] uppercase text-zinc-400 block mb-1">Racha de Hábitos</span>
                                                <span className="text-lg font-black text-white">🔥 12 Días</span>
                                            </div>
                                            <div className="text-center p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                                <span className="text-[10px] uppercase text-zinc-400 block mb-1">Consistencia Dieta</span>
                                                <span className="text-lg font-black text-indigo-400">92%</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* PLACEHOLDER FOR NEW TABS */
                            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                                <h3 className="text-xl font-black text-white mb-2 capitalize">{activeTab}</h3>
                                <p className="text-sm text-zinc-500">Módulo en construcción. La interfaz progresiva se cargará aquí pronto.</p>
                            </div>
                        )}

                        {/* Safe space for bottom nav */}
                        <div className="h-24" aria-hidden="true" />
                    </section>

                    <nav aria-label="Navegación Móvil Principal">
                        <BottomNav
                            currentTab={activeTab}
                            onTabChange={(tab) => setActiveTab(tab as any)}
                        />
                    </nav>
                </div>
            </main>

            <div className="preview-label">
                <h3>Vista Previa Móvil</h3>
                <p>Simulación del entorno del cliente</p>
                <div className="role-badge">{patientData ? patientData.full_name : currentRole}</div>
            </div>
        </div>
    );
};

export default ClientHub;

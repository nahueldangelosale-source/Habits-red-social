import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dumbbell,
    Activity,
    Target,
    Zap,
    ChevronRight,
    Save,
    CheckCircle2,
    User,
    Calendar,
    Ruler,
    Weight
} from 'lucide-react';
import { api } from '../api/client';
import { useEffect } from 'react';

// ==========================================
// CONFIGURACIÓN MODULAR (La "Falsa Customización")
// ==========================================
const ONBOARDING_CONFIG = {
    showTraining: true,
    showClinical: true,
    showGoals: true,
    showHabits: true
};

// ==========================================
// TYPES & CONSTANTS
// ==========================================
interface OnboardingData {
    client_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    age: number;
    weight_kg: number;
    height_cm: number;
    training_experience: string;
    training_days_available: number;
    training_duration_pref: number;
    medical_tags: string[];
    goal_tags: string[];
    habit_sleep_quality: number;
    habit_stress_level: number;
    habit_work_type: string;
}

const EXPERIENCE_LEVELS = [
    { id: 'BEGINNER', label: 'Principiante', icon: '' },
    { id: 'INTERMEDIATE', label: 'Intermedio', icon: '' },
    { id: 'ADVANCED', label: 'Avanzado', icon: '' }
];

// Dynamic tags array
interface TagOption {
    id: string;
    category: string;
    label: string;
}

const WORK_TYPES = [
    { id: 'SEDENTARY', label: 'Sedentario (Oficina)', icon: '' },
    { id: 'ACTIVE', label: 'Activo (En movimiento)', icon: '' }
];

// ==========================================
// SUB-COMPONENTS
// ==========================================
const PillButton: React.FC<{
    label: string,
    isSelected: boolean,
    onClick: () => void,
    icon?: string
}> = ({ label, isSelected, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-4 bg-zinc-900 border border-zinc-700 hover:border-lime-500 hover:shadow-[0_0_15px_rgba(163,230,53,0.15)] rounded-xl transition-all font-medium text-zinc-300 ${isSelected ? 'border-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.15)] bg-zinc-800 text-white' : ''}`}
    >
        <div className="flex justify-between items-center w-full">
            <span>{icon && <span className="mr-2">{icon}</span>}{label}</span>
            {isSelected && <CheckCircle2 className="w-5 h-5 text-lime-400" />}
        </div>
    </button>
);

const SectionHeader: React.FC<{ title: string, icon: any }> = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-lime-400/10 rounded-2xl border border-lime-400/20">
            <Icon className="w-6 h-6 text-lime-400" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{title}</h2>
    </div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
const OnboardingFlow: React.FC = () => {
    const [data, setData] = useState<OnboardingData>({
        client_id: undefined,
        first_name: '',
        last_name: '',
        email: '',
        age: 25,
        weight_kg: 70,
        height_cm: 170,
        training_experience: 'BEGINNER',
        training_days_available: 3,
        training_duration_pref: 60,
        medical_tags: [],
        goal_tags: [],
        habit_sleep_quality: 3,
        habit_stress_level: 3,
        habit_work_type: 'SEDENTARY'
    });

    const [tags, setTags] = useState({
        goals: [{ id: 'fat_loss', text: 'Pérdida de Grasa y Definición' }, { id: 'hypertrophy', text: 'Hipertrofia Muscular' }, { id: 'strength', text: 'Ganancia de Fuerza' }],
        injuries: [{ id: 'none', text: 'Sin lesiones' }, { id: 'knees', text: 'Molestia en Rodillas' }, { id: 'lower_back', text: 'Dolor Lumbar' }, { id: 'shoulders', text: 'Pinzamiento de Hombro' }]
    });

    const medicalOptions = tags.injuries.map(t => ({ id: t.id, label: t.text }));
    const goalOptions = tags.goals.map(t => ({ id: t.id, label: t.text }));

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);

    const toggleTag = (category: 'medical_tags' | 'goal_tags', tagId: string) => {
        setData(prev => {
            const current = prev[category];
            const next = current.includes(tagId)
                ? current.filter(t => t !== tagId)
                : [...current, tagId];
            return { ...prev, [category]: next };
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/api/v1/onboarding/submit', data);
            alert("¡Onboarding completado! Tu Coach recibirá la radiografía.");
        } catch (err) {
            console.error(err);
            alert("Error al enviar el formulario.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-2xl"
            >
                {/* Progress Bar */}
                <div className="h-1 bg-zinc-900/50 flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 transition-all duration-700 ${step >= s ? 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]' : ''}`}
                        />
                    ))}
                </div>

                <div className="p-10">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <SectionHeader title="Datos Personales" icon={User} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Nombre</label>
                                        <input type="text" value={data.first_name} onChange={(e) => setData({ ...data, first_name: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-lime-500/50 focus:bg-zinc-900 transition-all font-medium" placeholder="Tu primer nombre..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Apellido</label>
                                        <input type="text" value={data.last_name} onChange={(e) => setData({ ...data, last_name: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-lime-500/50 focus:bg-zinc-900 transition-all font-medium" placeholder="Tu apellido..." />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">Email</label>
                                        <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-lime-500/50 focus:bg-zinc-900 transition-all font-medium" placeholder="correo@ejemplo.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2"><Calendar size={12} /> Edad</label>
                                        <input type="number" min="15" max="100" value={data.age} onChange={(e) => setData({ ...data, age: parseInt(e.target.value) || 25 })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-lime-500/50 focus:bg-zinc-900 transition-all font-medium font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2"><Weight size={12} /> Peso (kg)</label>
                                        <input type="number" step="0.1" value={data.weight_kg} onChange={(e) => setData({ ...data, weight_kg: parseFloat(e.target.value) || 70 })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-lime-500/50 focus:bg-zinc-900 transition-all font-medium font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2"><Ruler size={12} /> Altura (cm)</label>
                                        <input type="number" value={data.height_cm} onChange={(e) => setData({ ...data, height_cm: parseFloat(e.target.value) || 170 })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-lime-500/50 focus:bg-zinc-900 transition-all font-medium font-mono" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && ONBOARDING_CONFIG.showTraining && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <SectionHeader title="Tu Nivel & Disponibilidad" icon={Dumbbell} />
                                <div className="space-y-8">
                                    <div>
                                        <p className="text-slate-500 mb-4 font-bold uppercase text-[10px] tracking-[0.2em]">Experiencia Previa</p>
                                        <div className="flex flex-wrap gap-4">
                                            {EXPERIENCE_LEVELS.map(lvl => (
                                                <PillButton
                                                    key={lvl.id}
                                                    label={lvl.label}
                                                    isSelected={data.training_experience === lvl.id}
                                                    onClick={() => setData({ ...data, training_experience: lvl.id })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-4 font-bold uppercase text-[10px] tracking-[0.2em]">Días a la semana</p>
                                        <div className="flex gap-4">
                                            {[2, 3, 4, 5, 6].map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setData({ ...data, training_days_available: d })}
                                                    className={`w-12 h-12 rounded-full border transition-all font-black text-lg ${data.training_days_available === d
                                                        ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                                        : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 hover:border-lime-500/50'
                                                        }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && ONBOARDING_CONFIG.showClinical && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <SectionHeader title="Puntos de Dolor o Lesiones" icon={Activity} />
                                <p className="text-slate-500 mb-8 font-medium text-lg leading-relaxed italic">Esto activará los guardrails de seguridad del Coach.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {medicalOptions.length > 0 ? medicalOptions.map(opt => (
                                        <PillButton
                                            key={opt.id}
                                            label={opt.label}
                                            isSelected={data.medical_tags.includes(opt.id)}
                                            onClick={() => toggleTag('medical_tags', opt.id)}
                                        />
                                    )) : <span className="text-zinc-500 text-xs py-2 italic col-span-2">Cargando base de datos médica...</span>}
                                    <div className="col-span-2">
                                        <PillButton
                                            label="Ninguna lesión"
                                            isSelected={data.medical_tags.length === 0}
                                            onClick={() => setData({ ...data, medical_tags: [] })}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && ONBOARDING_CONFIG.showGoals && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <SectionHeader title="Tus Objetivos" icon={Target} />
                                <div className="grid grid-cols-2 gap-4">
                                    {goalOptions.length > 0 ? goalOptions.map(opt => (
                                        <PillButton
                                            key={opt.id}
                                            label={opt.label}
                                            isSelected={data.goal_tags.includes(opt.id)}
                                            onClick={() => toggleTag('goal_tags', opt.id)}
                                        />
                                    )) : <span className="text-zinc-500 text-xs py-2 italic col-span-2">Calculando métricas de adaptabilidad...</span>}
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && ONBOARDING_CONFIG.showHabits && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <SectionHeader title="Estilo de Vida & Estrés" icon={Zap} />
                                <div className="space-y-10">
                                    <div>
                                        <p className="text-slate-500 mb-4 font-bold uppercase text-[10px] tracking-[0.2em]">Nivel de Estrés Diario (1-5)</p>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setData({ ...data, habit_stress_level: v })}
                                                    className={`w-14 h-14 rounded-2xl border transition-all flex flex-col items-center justify-center ${data.habit_stress_level === v
                                                        ? 'bg-lime-400 text-black border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                                                        : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 hover:border-lime-500/50 '
                                                        }`}
                                                >
                                                    <span className="text-lg font-bold">{v}</span>
                                                    <span className="text-[10px] uppercase font-bold text-zinc-500">{v > 3 ? 'Alto' : 'Bajo'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-4 font-bold uppercase text-[10px] tracking-[0.2em]">Tipo de Trabajo</p>
                                        <div className="flex gap-4">
                                            {WORK_TYPES.map(work => (
                                                <PillButton
                                                    key={work.id}
                                                    label={work.label}
                                                    isSelected={data.habit_work_type === work.id}
                                                    onClick={() => setData({ ...data, habit_work_type: work.id })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-neutral-900">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-8 py-4 text-zinc-500 font-black uppercase text-xs tracking-widest hover:text-lime-400 transition-colors"
                            >
                                Anterior
                            </button>
                        )}
                        <div className="flex-1" />
                        {step < 5 ? (
                            <button
                                onClick={() => {
                                    if (step === 1 && (!data.first_name || !data.email)) {
                                        alert("Por favor completa tu nombre y correo para continuar.");
                                        return;
                                    }
                                    setStep(step + 1);
                                }}
                                className="bg-lime-400 text-black px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-tighter hover:bg-lime-300 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.2)]"
                            >
                                Siguiente
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-lime-400 text-black px-10 py-4 rounded-2xl font-black uppercase text-sm tracking-tighter hover:bg-lime-300 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(163,230,53,0.3)] disabled:opacity-50"
                            >
                                {isSubmitting ? 'Enviando...' : 'Finalizar & Enviar'}
                                <Save className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingFlow;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Zap, Brain, BrainCircuit, HeartPulse, ChevronRight, ChevronLeft, Shield, X, Sparkles } from 'lucide-react';

export interface ReadinessResult {
    sleep: number;
    energy: number;
    stress: number;
    readinessScore: number;
}

interface ReadinessModalProps {
    onComplete: (result: ReadinessResult) => void;
    onDismiss?: () => void;
    athleteName?: string;
}

// ─────────────────────────────────────────────
// STEP CONFIGURATION
// ─────────────────────────────────────────────

interface StepConfig {
    id: 'sleep' | 'energy' | 'stress';
    question: string;
    icon: React.ElementType;
    options: { value: number; emoji: string; label: string }[];
    invertedForScore?: boolean; // stress: high value = bad
}

const STEPS: StepConfig[] = [
    {
        id: 'sleep',
        question: '¿Cómo dormiste anoche?',
        icon: Moon,
        options: [
            { value: 1, emoji: '😫', label: 'Muy mal' },
            { value: 2, emoji: '😕', label: 'Mal' },
            { value: 3, emoji: '😐', label: 'Normal' },
            { value: 4, emoji: '😊', label: 'Bien' },
            { value: 5, emoji: '😴', label: 'Excelente' },
        ],
    },
    {
        id: 'energy',
        question: '¿Cómo te sentís hoy?',
        icon: Zap,
        options: [
            { value: 1, emoji: '🪫', label: 'Sin energía' },
            { value: 2, emoji: '🔋', label: 'Baja' },
            { value: 3, emoji: '⚖️', label: 'Normal' },
            { value: 4, emoji: '⚡', label: 'Con energía' },
            { value: 5, emoji: '🚀', label: 'A tope' },
        ],
    },
    {
        id: 'stress',
        question: '¿Cuánto estrés tenés?',
        icon: Brain,
        invertedForScore: true,
        options: [
            { value: 1, emoji: '😌', label: 'Relajado' },
            { value: 2, emoji: '🙂', label: 'Tranquilo' },
            { value: 3, emoji: '😐', label: 'Moderado' },
            { value: 4, emoji: '😰', label: 'Bastante' },
            { value: 5, emoji: '🤯', label: 'Muy alto' },
        ],
    },
];

// ─────────────────────────────────────────────
// READINESS SCORE CALCULATION
// ─────────────────────────────────────────────

const calculateReadiness = (sleep: number, energy: number, stress: number): number => {
    return Math.round(((sleep + energy + (6 - stress)) / 3) * 10) / 10;
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export const DailyReadinessModal: React.FC<ReadinessModalProps> = ({ onComplete, onDismiss, athleteName = 'Nahuel' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isMutating, setIsMutating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'forward' | 'backward'>('forward');

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const step = STEPS[currentStep];
    const selectedValue = answers[step.id];
    const isLastStep = currentStep === STEPS.length - 1;

    const handleSelect = (value: number) => {
        setAnswers(prev => ({ ...prev, [step.id]: value }));
    };

    const handleNext = () => {
        if (!selectedValue) return;

        if (isLastStep) {
            const sleep = answers.sleep ?? 3;
            const energy = answers.energy ?? 3;
            const stress = answers.stress ?? 3;
            const readinessScore = calculateReadiness(sleep, energy, stress);

            if (readinessScore <= 2) {
                setIsMutating(true);
                setTimeout(() => {
                    onComplete({ sleep, energy, stress, readinessScore });
                }, 2500);
            } else {
                onComplete({ sleep, energy, stress, readinessScore });
            }
        } else {
            setSlideDirection('forward');
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setSlideDirection('backward');
            setCurrentStep(prev => prev - 1);
        }
    };

    // ─── Calm Mode Loading Overlay ───
    if (isMutating) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
            >
                <div className="p-8 text-center max-w-sm w-full mx-4 relative bg-zinc-950/80 rounded-3xl border border-indigo-500/30 shadow-2xl">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-3xl blur-xl" />
                    <BrainCircuit className="text-indigo-400 w-16 h-16 mx-auto mb-6 animate-pulse relative z-10" />
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Activando Modo Calma</h3>
                    <p className="text-indigo-200/80 text-xs leading-relaxed animate-pulse relative z-10">
                        Ajustando el volumen y la intensidad del entrenamiento para proteger tu sistema nervioso y favorecer la recuperación...
                    </p>
                </div>
            </motion.div>
        );
    }

    // ─── Progress & Score Feedback ───
    const allAnswered = answers.sleep && answers.energy && answers.stress;
    const previewScore = allAnswered
        ? calculateReadiness(answers.sleep, answers.energy, answers.stress)
        : null;

    const getScoreColor = (score: number) => {
        if (score <= 2) return 'text-rose-400';
        if (score <= 3) return 'text-amber-400';
        return 'text-emerald-400';
    };

    const getScoreLabel = (score: number) => {
        if (score <= 2) return 'Modo Calma recomendado';
        if (score <= 3) return 'Recuperación activa sugerida';
        return '¡Excelente energía para entrenar!';
    };

    const slideVariants = {
        enter: (dir: 'forward' | 'backward') => ({
            x: dir === 'forward' ? 60 : -60,
            opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (dir: 'forward' | 'backward') => ({
            x: dir === 'forward' ? -60 : 60,
            opacity: 0,
        }),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl font-sans overflow-hidden"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/3 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-purple-600/20 rounded-full blur-[90px] pointer-events-none" />

            <motion.div
                initial={{ scale: 0.93, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="p-6 sm:p-7 rounded-3xl sm:rounded-[2.5rem] w-full max-w-sm shadow-[0_25px_80px_rgba(0,0,0,0.9)] bg-zinc-950/85 border border-white/10 backdrop-blur-2xl overflow-hidden relative text-white"
            >
                {/* Specular Rim Light */}
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Close Button */}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors border border-white/5"
                        title="Omitir por hoy"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Header with Greeting */}
                <div className="text-center mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <HeartPulse size={26} />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">
                        {getGreeting()}, {athleteName}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-0.5">Check-in rápido de hoy</p>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                    {STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === currentStep
                                    ? 'w-7 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                                    : i < currentStep
                                    ? 'w-3.5 bg-indigo-600/70'
                                    : 'w-3.5 bg-zinc-800'
                            }`}
                        />
                    ))}
                </div>

                {/* Animated Step Content */}
                <AnimatePresence mode="wait" custom={slideDirection}>
                    <motion.div
                        key={step.id}
                        custom={slideDirection}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                    >
                        {/* Step Icon + Question */}
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                <step.icon size={18} />
                            </div>
                            <h4 className="text-base font-bold text-white leading-tight">{step.question}</h4>
                        </div>

                        {/* Pill Options */}
                        <div className="grid grid-cols-5 gap-1.5 mb-5">
                            {step.options.map(opt => {
                                const isSelected = selectedValue === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border transition-all duration-200 ${
                                            isSelected
                                                ? 'border-indigo-400 bg-gradient-to-b from-indigo-500/25 to-purple-500/20 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.35)] ring-1 ring-indigo-400/40'
                                                : 'border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                                        }`}
                                    >
                                        <span className="text-2xl">{opt.emoji}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-tight leading-tight text-center ${
                                            isSelected ? 'text-indigo-300' : 'text-zinc-500'
                                        }`}>
                                            {opt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Score Preview (on last step when all answered) */}
                {isLastStep && previewScore !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl mb-4 backdrop-blur-md ${
                            previewScore <= 2 ? 'bg-rose-500/10 border border-rose-500/30' :
                            previewScore <= 3 ? 'bg-amber-500/10 border border-amber-500/30' :
                            'bg-emerald-500/10 border border-emerald-500/30'
                        }`}
                    >
                        <Shield size={18} className={getScoreColor(previewScore)} />
                        <div>
                            <span className={`text-xs font-black ${getScoreColor(previewScore)}`}>
                                Nivel de Disposición: {previewScore}/5
                            </span>
                            <span className="text-[11px] text-zinc-300 block">
                                {getScoreLabel(previewScore)}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2.5">
                    {currentStep > 0 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="p-3.5 rounded-2xl font-bold text-zinc-400 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:text-white transition-all flex items-center justify-center"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!selectedValue}
                        className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-1.5 ${
                            !selectedValue
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'
                                : isLastStep
                                    ? (previewScore && previewScore <= 2)
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10'
                                        : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-zinc-950 font-black shadow-[0_0_25px_rgba(16,185,129,0.5)] border border-emerald-300/40'
                                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10'
                        }`}
                    >
                        {isLastStep
                            ? (previewScore && previewScore <= 2)
                                ? 'Proteger mi recuperación'
                                : '¡Listo, a entrenar!'
                            : 'Siguiente'
                        }
                        {!isLastStep && <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Omitir por hoy */}
                {onDismiss && (
                    <div className="text-center mt-3">
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="text-xs text-zinc-500 hover:text-zinc-400 font-medium transition-colors"
                        >
                            Omitir por hoy
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

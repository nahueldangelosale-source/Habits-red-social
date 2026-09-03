import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
    Dumbbell, 
    HeartPulse, 
    Salad, 
    Activity, 
    MonitorPlay, 
    Users, 
    Building2, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft,
    Sparkles,
    Moon,
    Sun,
    SkipForward,
    Flame,
    PersonStanding,
    Wind,
    Timer,
    Footprints,
    PencilLine
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// --- Types ---
type Specialty = 'Fuerza' | 'Hipertrofia' | 'Salud' | 'Nutrición' | 'CrossFit' | 'Clases Grupales' | 'Pilates / Yoga' | 'Running' | 'Longevidad' | 'Otra';
type WorkModel = 'Online' | 'Presencial' | 'Híbrido';
type ThemeChoice = 'ADRENALINE' | 'CLINICAL';

export const TrainerSetupWizard: React.FC = () => {
    const navigate = useNavigate();
    const { setMode } = useTheme();

    const [step, setStep] = useState(1);
    
    // Form State
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [workModel, setWorkModel] = useState<WorkModel | null>(null);
    const [themeChoice, setThemeChoice] = useState<ThemeChoice | null>(null);
    const [customSpecialty, setCustomSpecialty] = useState('');

    const totalSteps = 5;

    // --- Actions ---
    const handleNext = () => {
        if (step < totalSteps) setStep(prev => prev + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const handleSkip = () => {
        toast('Configuración omitida por ahora', { icon: '⏭️' });
        navigate('/dashboard');
    };

    const handleFinish = () => {
        // Trigger Success Climax
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        setTimeout(() => {
            navigate('/dashboard');
        }, 3000);
    };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const toggleSpecialty = (sp: Specialty) => {
        setSpecialties(prev => 
            prev.includes(sp) ? prev.filter(i => i !== sp) : [...prev, sp]
        );
    };

    const selectTheme = (t: ThemeChoice) => {
        setThemeChoice(t);
        setMode(t);
        // Direct DOM reinforcement — ensures dark class applies immediately
        // even if React batching delays the ThemeContext useEffect
        if (t === 'ADRENALINE') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // --- Validation ---
    const canProceed = () => {
        if (step === 2) return specialties.length > 0 && (!specialties.includes('Otra') || customSpecialty.trim().length > 0);
        if (step === 3) return workModel !== null;
        if (step === 4) return themeChoice !== null;
        return true;
    };

    // --- Animation Variants ---
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
            transition: { type: 'spring', stiffness: 300, damping: 30 }
        })
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-700">
            {/* Top Navigation & Progress */}
            <div className="w-full max-w-4xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">Habits</span>
                </div>
                
                <div className="flex items-center gap-6">
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-slate-400">Paso {step} de {totalSteps}</div>
                        <div className="flex gap-1">
                            {[...Array(totalSteps)].map((_, i) => (
                                <div 
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                        i + 1 === step ? 'w-6 bg-indigo-600' : 
                                        i + 1 < step ? 'w-2 bg-indigo-400' : 'w-2 bg-slate-200 dark:bg-zinc-800'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Emergency Exit (Heuristic) */}
                    {step < totalSteps && (
                        <button 
                            onClick={handleSkip}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            Saltar por ahora <SkipForward className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center items-center px-4 relative overflow-hidden">
                <AnimatePresence mode="wait" custom={1}>
                    
                    {/* STEP 1: WELCOME */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="max-w-2xl text-center space-y-8"
                        >
                            <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-8">
                                <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Tu práctica profesional merece una plataforma a su altura
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                                En menos de 2 minutos vamos a personalizar todo para que vos y tus clientes tengan la mejor experiencia desde el día uno.
                            </p>
                        </motion.div>
                    )}

                    {/* STEP 2: SPECIALTIES */}
                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full max-w-4xl relative"
                        >
                            {/* Backlight (Contraluz) - Separación del Fondo */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent -z-10 blur-xl pointer-events-none" />

                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Diseñemos tu entorno de trabajo.</h2>
                                <p className="text-lg text-slate-500 dark:text-slate-400">¿Cuáles son tus territorios fuertes? Nuestra IA adaptará tus herramientas en base a esto.</p>
                                <p className="text-sm text-slate-400 dark:text-zinc-500 mt-2">Más de 4.000 profesionales ya configuraron su espacio · Podés cambiarlo cuando quieras</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto relative z-10">
                                {[
                                    { id: 'Fuerza', icon: Dumbbell, desc: 'Powerlifting, Strongman' },
                                    { id: 'Hipertrofia', icon: Activity, desc: 'Estética y Volumen' },
                                    { id: 'CrossFit', icon: Flame, desc: 'Funcional de alta intensidad' },
                                    { id: 'Clases Grupales', icon: Users, desc: 'Spinning, Zumba, GAP' },
                                    { id: 'Pilates / Yoga', icon: Wind, desc: 'Flexibilidad y Core' },
                                    { id: 'Salud', icon: HeartPulse, desc: 'Rehabilitación y Prevención' },
                                    { id: 'Nutrición', icon: Salad, desc: 'Planes alimentarios' },
                                    { id: 'Running', icon: Footprints, desc: 'Maratón, Trail, Sprints' },
                                    { id: 'Longevidad', icon: Timer, desc: 'Anti-aging y Bienestar' },
                                    { id: 'Otra', icon: PencilLine, desc: 'Escribí tu especialidad' }
                                ].map((item) => {
                                    const isSelected = specialties.includes(item.id as Specialty);
                                    const hasSelection = specialties.length > 0;
                                    const Icon = item.icon;
                                    
                                    // Cinematic Depth of Field & 3-Point Lighting
                                    let lightingClasses = '';
                                    if (isSelected) {
                                        lightingClasses = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20 scale-[1.03] opacity-100 z-10';
                                    } else if (hasSelection) {
                                        lightingClasses = 'border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 opacity-60 hover:opacity-100 hover:scale-[1.02] hover:border-slate-300 dark:hover:border-zinc-700';
                                    } else {
                                        lightingClasses = 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 hover:scale-[1.02]';
                                    }

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleSpecialty(item.id as Specialty)}
                                            className={`relative overflow-hidden group flex flex-col items-center text-center p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 ease-out ${lightingClasses}`}
                                        >
                                            <div className={`p-3 rounded-xl mb-3 transition-colors duration-300 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500'}`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <h3 className={`text-sm font-bold leading-tight transition-colors duration-300 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                                                {item.id}
                                            </h3>
                                            <p className="text-slate-400 text-xs mt-1 leading-snug">{item.desc}</p>
                                            
                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div 
                                                        initial={{ scale: 0, opacity: 0 }} 
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                        className="absolute top-3 right-3 text-indigo-600"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5 fill-indigo-100 dark:fill-indigo-900" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom specialty input — appears when "Otra" is selected */}
                            <AnimatePresence>
                                {specialties.includes('Otra') && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }} 
                                        animate={{ opacity: 1, height: 'auto' }} 
                                        exit={{ opacity: 0, height: 0 }}
                                        className="max-w-md mx-auto mt-6"
                                    >
                                        <input
                                            type="text"
                                            value={customSpecialty}
                                            onChange={(e) => setCustomSpecialty(e.target.value)}
                                            placeholder="Ej: Artes marciales, Natación, Calistenia..."
                                            className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            autoFocus
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* STEP 3: WORK MODEL */}
                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full max-w-4xl"
                        >
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">¿Dónde sucede la magia?</h2>
                                <p className="text-lg text-slate-500">Contanos cómo conectás con tus clientes para adaptar herramientas, agenda y cobros.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {[
                                    { id: 'Online', icon: MonitorPlay, title: '100% Online', desc: 'Asesorías a distancia, rutinas por app y seguimiento remoto.' },
                                    { id: 'Presencial', icon: Building2, title: 'Presencial', desc: 'Clases 1 a 1 o grupales en un gimnasio o centro.' },
                                    { id: 'Híbrido', icon: Users, title: 'Híbrido', desc: 'Una mezcla perfecta entre sesiones presenciales y app.' }
                                ].map((item) => {
                                    const isSelected = workModel === item.id;
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setWorkModel(item.id as WorkModel)}
                                            className={`flex flex-col items-center text-center p-8 rounded-3xl border-2 transition-all duration-300 ${
                                                isSelected 
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-xl shadow-emerald-500/20 scale-[1.05] z-10 relative' 
                                                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:scale-[1.02]'
                                            }`}
                                        >
                                            <div className={`p-5 rounded-full mb-6 transition-colors ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 group-hover:text-emerald-500'}`}>
                                                <Icon className="w-10 h-10" />
                                            </div>
                                            <h3 className={`text-2xl font-black mb-3 ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                                                {item.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: IDENTITY / THEME */}
                    {step === 4 && (
                        <motion.div 
                            key="step4"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full max-w-4xl"
                        >
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Dale personalidad a tu espacio</h2>
                                <p className="text-lg text-slate-500">El look que vas a ver cada día. Elegí el que te haga sentir en casa.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                <button
                                    onClick={() => selectTheme('CLINICAL')}
                                    className={`relative overflow-hidden group flex flex-col p-2 rounded-3xl border-4 transition-all duration-300 ${
                                        themeChoice === 'CLINICAL' 
                                        ? 'border-blue-500 shadow-xl shadow-blue-500/20 scale-[1.02]' 
                                        : 'border-transparent hover:border-slate-200 dark:hover:border-zinc-800'
                                    }`}
                                >
                                    <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                        <Sun className="w-16 h-16 text-slate-400" />
                                    </div>
                                    <div className="px-4 pb-4">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Estilo Clínico (Claro)</h3>
                                        <p className="text-slate-500 mt-1 text-sm text-left">Ideal para luz de día. Colores suaves, alto contraste, sensación de limpieza y profesionalismo médico.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => selectTheme('ADRENALINE')}
                                    className={`relative overflow-hidden group flex flex-col p-2 rounded-3xl border-4 transition-all duration-300 ${
                                        themeChoice === 'ADRENALINE' 
                                        ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]' 
                                        : 'border-transparent hover:border-slate-200 dark:hover:border-zinc-800'
                                    }`}
                                >
                                    <div className="w-full h-48 bg-zinc-950 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
                                        <Moon className="w-16 h-16 text-zinc-600" />
                                    </div>
                                    <div className="px-4 pb-4">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Estilo PRO (Oscuro)</h3>
                                        <p className="text-slate-500 mt-1 text-sm text-left">Elegante y moderno. Menor fatiga visual, interfaz envolvente para trabajar por largas horas.</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: SUCCESS CLIMAX */}
                    {step === 5 && (
                        <motion.div 
                            key="step5"
                            custom={1}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="max-w-2xl text-center space-y-8"
                        >
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                                className="mx-auto w-32 h-32 bg-gradient-to-tr from-emerald-400 to-indigo-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30"
                            >
                                <CheckCircle2 className="w-16 h-16 text-white" />
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Tu espacio profesional está listo
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                                Todo fue configurado a tu medida. Es momento de invitar a tu primer cliente y empezar a transformar vidas.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="w-full max-w-4xl mx-auto px-6 py-8 flex justify-between items-center z-10">
                <div>
                    {step > 1 && step < 5 && (
                        <button 
                            onClick={handlePrev}
                            className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" /> Atrás
                        </button>
                    )}
                </div>
                
                {step < 5 ? (
                    <button 
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className={`px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all duration-300 shadow-xl ${
                            canProceed() 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1' 
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        {step === 1 ? 'Empezar' : step === 2 ? 'Confirmar especialidades' : step === 3 ? 'Definir mi estilo' : 'Casi listo'} <ArrowRight className="w-5 h-5" />
                    </button>
                ) : (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFinish}
                        className="px-10 py-5 rounded-2xl font-black text-xl text-white bg-slate-900 dark:bg-white dark:text-slate-900 flex items-center gap-3 shadow-2xl mx-auto"
                    >
                        Comenzar a transformar vidas <ArrowRight className="w-6 h-6" />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

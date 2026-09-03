import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BrainCircuit, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface ClinicalOnboardingFlowProps {
    onComplete: () => void;
    onCancel: () => void;
}

type Step = 'physio' | 'lifestyle' | 'barriers' | 'triage' | 'draft';

export const ClinicalOnboardingFlow: React.FC<ClinicalOnboardingFlowProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState<Step>('physio');
    const [socialProof, setSocialProof] = useState<string | null>(null);

    // Form State (Simulated)
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [energyCrash, setEnergyCrash] = useState('');
    const [conditions, setConditions] = useState('');

    const handleNext = (nextStep: Step, proofMessage?: string) => {
        if (proofMessage) {
            setSocialProof(proofMessage);
            setTimeout(() => {
                setSocialProof(null);
                setStep(nextStep);
            }, 2000); // 2 seconds of social validation delay
        } else {
            setStep(nextStep);
        }
    };

    useEffect(() => {
        if (step === 'triage') {
            const timer = setTimeout(() => {
                setStep('draft');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Variantes de animación
    const fadeVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white text-slate-900 flex flex-col font-sans overflow-hidden">
            {/* Header minimalista */}
            <header className="p-6 flex justify-between items-center border-b border-slate-100">
                <div className="font-bold tracking-tight text-xl flex items-center gap-2">
                    <Activity className="text-emerald-500" />
                    Bienestar <span className="opacity-40">| Clínica</span>
                </div>
                <button onClick={onCancel} className="text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors">
                    Cancelar
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
                
                {/* Social Proof Overlay */}
                <AnimatePresence>
                    {socialProof && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm"
                        >
                            <div className="text-center max-w-md px-6">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Excelente.</h3>
                                <p className="text-slate-500 text-lg leading-relaxed">{socialProof}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {step === 'physio' && !socialProof && (
                        <motion.div key="physio" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-lg">
                            <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 mb-4 block">Paso 1 de 3</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Empecemos por tu motor.</h2>
                            <p className="text-slate-500 text-lg mb-10">¿Cuál es tu punto de partida fisiológico actual?</p>
                            
                            <div className="space-y-6 mb-12">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Peso Actual (kg)</label>
                                    <input 
                                        type="number" 
                                        value={weight} onChange={e => setWeight(e.target.value)}
                                        className="w-full text-2xl font-bold p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 transition-colors outline-none bg-slate-50"
                                        placeholder="Ej. 85" autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Estatura (cm)</label>
                                    <input 
                                        type="number" 
                                        value={height} onChange={e => setHeight(e.target.value)}
                                        className="w-full text-2xl font-bold p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 transition-colors outline-none bg-slate-50"
                                        placeholder="Ej. 180"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={() => handleNext('lifestyle', 'Calcular tu Tasa Metabólica Basal con precisión es el primer paso para el éxito.')}
                                disabled={!weight || !height}
                                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuar <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 'lifestyle' && !socialProof && (
                        <motion.div key="lifestyle" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-lg">
                            <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 mb-4 block">Paso 2 de 3</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Tu Ecosistema Diario.</h2>
                            <p className="text-slate-500 text-lg mb-10">¿En qué momento del día sientes la mayor caída de energía o picos de estrés?</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                                {['Media Mañana', 'Después de Almorzar', 'Media Tarde', 'Antes de Dormir'].map((option) => (
                                    <button 
                                        key={option}
                                        onClick={() => setEnergyCrash(option)}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                                            energyCrash === option 
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' 
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => handleNext('barriers', 'Dato vital. Esto nos permitirá blindar tu ritmo circadiano contra el cortisol cruzado.')}
                                disabled={!energyCrash}
                                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuar <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}

                    {step === 'barriers' && !socialProof && (
                        <motion.div key="barriers" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-lg">
                            <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 mb-4 block">Paso 3 de 3</span>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Barreras Metabólicas.</h2>
                            <p className="text-slate-500 text-lg mb-10">¿Tienes alguna alergia clínica, intolerancia severa o condición diagnosticada? (Opcional)</p>
                            
                            <div className="mb-12">
                                <textarea 
                                    value={conditions} onChange={e => setConditions(e.target.value)}
                                    className="w-full text-lg p-6 rounded-3xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-0 transition-colors outline-none bg-slate-50 min-h-[160px] resize-none"
                                    placeholder="Ej. Soy celíaco, tengo Síndrome de Ovario Poliquístico, etc."
                                />
                            </div>

                            <button 
                                onClick={() => handleNext('triage')}
                                className="w-full py-5 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-2xl shadow-slate-900/20"
                            >
                                Finalizar Análisis <BrainCircuit size={20} className="ml-2" />
                            </button>
                        </motion.div>
                    )}

                    {step === 'triage' && (
                        <motion.div key="triage" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-lg text-center">
                            <div className="w-24 h-24 mx-auto mb-8 relative">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                                <BrainCircuit className="absolute inset-0 m-auto text-slate-800" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-900">El Motor RAG está procesando...</h2>
                            <div className="space-y-3 text-slate-500 text-sm font-medium">
                                <p className="animate-pulse">Analizando cruzamiento de biomarcadores...</p>
                                <p className="animate-pulse" style={{ animationDelay: '1s' }}>Clasificando Arquetipo Metabólico...</p>
                                <p className="animate-pulse" style={{ animationDelay: '2s' }}>Construyendo esqueleto nutricional de 12 semanas...</p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'draft' && (
                        <motion.div key="draft" variants={fadeVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-2xl">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 mb-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ShieldAlert size={120} />
                                </div>
                                <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-bold tracking-widest uppercase rounded-full mb-6">
                                    Triaje Completado
                                </span>
                                <h2 className="text-3xl font-black tracking-tight mb-2 text-emerald-950">Arquetipo: Resistencia Periférica</h2>
                                <p className="text-emerald-800/80 text-lg mb-8 max-w-md">
                                    El sistema ha detectado una probabilidad del 82% de resistencia a la insulina basada en el IMC y el patrón de fatiga vespertina.
                                </p>
                                
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100/50">
                                    <h4 className="font-bold text-slate-900 mb-4">Acciones de la Inteligencia Artificial (Bounded AI):</h4>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                            Borrador de protocolo de 12 semanas generado (Dieta Antiinflamatoria).
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                            Estrategia de carbohidratos desplazada a la noche para mitigar el pico de cortisol vespertino.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                            {conditions ? `Filtro estricto aplicado para: ${conditions}` : 'Ningún alérgeno reportado. Perfil dietario abierto.'}
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <button 
                                onClick={onComplete}
                                className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-bold text-xl hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/20"
                            >
                                Enviar al Nutricionista Clínico
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

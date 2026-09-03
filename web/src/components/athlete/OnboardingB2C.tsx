// web/src/components/athlete/OnboardingB2C.tsx

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, Activity, Camera, Loader2, Video } from 'lucide-react';
import { api } from '../../api/client';

type Step = 'passive-sync' | 'logistics' | 'clinical' | 'psychology' | 'mobility' | 'waiting-room';

interface OnboardingData {
    days: number;
    equipment: string;
    injuries: string;
    stressLevel: number;
    coachingStyle: 'drill-sergeant' | 'empathetic';
    videoUrl?: string;
}

export function OnboardingB2C() {
    const [currentStep, setCurrentStep] = useState<Step>('passive-sync');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState<OnboardingData>({
        days: 3,
        equipment: 'full-gym',
        injuries: 'Ninguna',
        stressLevel: 5,
        coachingStyle: 'empathetic'
    });

    const handleNext = (nextStep: Step) => {
        setCurrentStep(nextStep);
    };

    const submitOnboarding = async () => {
        setIsSubmitted(true);
        setCurrentStep('waiting-room');
        try {
            // 🔥 DIAGNÓSTICO ESTRICTO
            console.log("🔥 PAYLOAD FRONTEND:", JSON.stringify(formData, null, 2));

            await api.post('/api/v1/onboarding/submit', formData);
        } catch (error) {
            console.error("Error submitting onboarding:", error);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-neon-volt/30 flex flex-col font-sans relative overflow-hidden">
            {/* ATMOSPHERE GLOW */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-volt/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none opacity-50" />

            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 w-full max-w-2xl mx-auto">

                <AnimatePresence mode="wait">
                    {isSubmitted ? (
                        <WaitingRoomStep key="waiting-step" />
                    ) : (
                        <>
                            {currentStep === 'passive-sync' && (
                                <PassiveSyncStep key="step-1" onNext={() => handleNext('logistics')} />
                            )}
                            {currentStep === 'logistics' && (
                                <LogisticsStep key="step-2" data={formData} setData={setFormData} onNext={() => handleNext('clinical')} />
                            )}
                            {currentStep === 'clinical' && (
                                <ClinicalStep key="step-3" data={formData} setData={setFormData} onNext={() => handleNext('psychology')} />
                            )}
                            {currentStep === 'psychology' && (
                                <PsychologyStep key="step-4" data={formData} setData={setFormData} onNext={() => handleNext('mobility')} />
                            )}
                            {currentStep === 'mobility' && (
                                <MobilityTestStep key="step-5" onComplete={(url) => {
                                    setFormData(prev => ({ ...prev, videoUrl: url }));
                                    submitOnboarding();
                                }} />
                            )}
                        </>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

// ── STEPS COMPONENTS ─────────────────────────────────────────────────────────

function PassiveSyncStep({ onNext }: { onNext: () => void }) {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            onNext();
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full flex flex-col items-center text-center"
        >
            <Activity className="w-16 h-16 text-neon-volt mb-6 animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Potencia tu inicio</h1>
            <p className="text-zinc-400 mb-10 text-lg max-w-md">
                Conecta tu dispositivo para extraer 7 días de baseline (RHR, Sueño, Pasos) y calibrar tu primer bloque al instante.
            </p>

            <div className="w-full space-y-4 max-w-sm">
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full py-4 px-6 bg-zinc-900 border border-zinc-800 hover:border-neon-volt/50 rounded-2xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <span className="text-black font-bold text-xs">Oura</span>
                        </div>
                        <span className="font-semibold text-lg group-hover:text-neon-volt transition-colors">Conectar Oura Ring</span>
                    </div>
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin text-neon-volt" /> : <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-neon-volt transition-colors" />}
                </button>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="w-full py-4 px-6 bg-zinc-900 border border-zinc-800 hover:border-neon-volt/50 rounded-2xl flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-lg group-hover:text-neon-volt transition-colors">Google Fit</span>
                    </div>
                    {isSyncing ? <Loader2 className="w-5 h-5 animate-spin text-neon-volt" /> : <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-neon-volt transition-colors" />}
                </button>
            </div>

            <button
                onClick={onNext}
                className="mt-8 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
            >
                Cargar mis datos manualmente (Saltar)
            </button>
        </motion.div>
    );
}

function LogisticsStep({ data, setData, onNext }: { data: OnboardingData, setData: any, onNext: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg"
        >
            <h2 className="text-2xl font-bold mb-2">Logística de Entrenamiento</h2>
            <p className="text-zinc-400 mb-8">Diseñamos tu volumen funcional basado en el tiempo libre que posees.</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Días a la semana</label>
                    <div className="flex gap-2">
                        {[2, 3, 4, 5, 6].map(day => (
                            <button
                                key={day}
                                onClick={() => setData({ ...data, days: day })}
                                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${data.days === day
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                    }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Equipamiento Disponible</label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'full-gym', label: 'Gym Comercial' },
                            { id: 'dumbbells-only', label: 'Solo Mancuernas' },
                            { id: 'bodyweight', label: 'Solo Peso Corporal' },
                            { id: 'bands', label: 'Bandas Elásticas' }
                        ].map(eq => (
                            <button
                                key={eq.id}
                                onClick={() => setData({ ...data, equipment: eq.id })}
                                className={`p-4 rounded-xl border text-left transition-all ${data.equipment === eq.id
                                    ? 'bg-neon-volt/10 border-neon-volt text-white'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                    }`}
                            >
                                <span className="block font-medium">{eq.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-end">
                <button onClick={onNext} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                    Siguiente <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}

function ClinicalStep({ data, setData, onNext }: { data: OnboardingData, setData: any, onNext: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg"
        >
            <h2 className="text-2xl font-bold mb-2">Historial Clínico Rápido</h2>
            <p className="text-zinc-400 mb-8">Información vital para el Swap Engine de seguridad.</p>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Lesiones Crónicas o Dolor Actual</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { id: 'Ninguna', label: 'Ninguna' },
                            { id: 'Rodilla (Knee)', label: 'Rodilla (Knee)' },
                            { id: 'Lumbar (Lower Back)', label: 'Lumbar (Lower Back)' },
                            { id: 'Hombro (Shoulder)', label: 'Hombro (Shoulder)' },
                            { id: 'Muñeca/Codo (Wrist/Elbow)', label: 'Muñeca/Codo (Wrist/Elbow)' }
                        ].map(injury => (
                            <button
                                key={injury.id}
                                onClick={() => setData({ ...data, injuries: injury.id })}
                                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${data.injuries === injury.id
                                    ? 'bg-neon-volt/10 border-neon-volt text-white'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                    }`}
                            >
                                <span className="font-medium">{injury.label}</span>
                                {data.injuries === injury.id && (
                                    <div className="w-2 h-2 rounded-full bg-neon-volt animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-end">
                <button onClick={onNext} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                    Siguiente <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}

function PsychologyStep({ data, setData, onNext }: { data: OnboardingData, setData: any, onNext: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg"
        >
            <h2 className="text-2xl font-bold mb-2">Perfil Psicológico</h2>
            <p className="text-zinc-400 mb-8">El Máximo Volumen Recuperable (MRV) se adapta a tu estrés nervioso.</p>

            <div className="space-y-8">
                <div>
                    <div className="flex justify-between items-end mb-3">
                        <label className="block text-sm font-semibold text-zinc-300 uppercase tracking-wider">Nivel de Estrés Actual</label>
                        <span className="text-neon-volt font-mono font-bold text-xl">{data.stressLevel} / 10</span>
                    </div>
                    <input
                        type="range"
                        min="1" max="10"
                        value={data.stressLevel}
                        onChange={(e) => setData({ ...data, stressLevel: parseInt(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-volt"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-2 font-medium uppercase">
                        <span>Zen</span>
                        <span>Burnout</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Estilo de Coaching Preferido</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setData({ ...data, coachingStyle: 'drill-sergeant' })}
                            className={`p-4 rounded-xl border text-left transition-all ${data.coachingStyle === 'drill-sergeant'
                                ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                        >
                            <span className="block font-bold mb-1">Militar / Sargento</span>
                            <span className="text-xs opacity-70">Empuja tus límites. Cero excusas.</span>
                        </button>
                        <button
                            onClick={() => setData({ ...data, coachingStyle: 'empathetic' })}
                            className={`p-4 rounded-xl border text-left transition-all ${data.coachingStyle === 'empathetic'
                                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                        >
                            <span className="block font-bold mb-1">Empático / Flexible</span>
                            <span className="text-xs opacity-70">Adapta el plan a tu vida diaria.</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex justify-end">
                <button onClick={onNext} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                    Siguiente <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}


function MobilityTestStep({ onComplete }: { onComplete: (url?: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const [hasCamera, setHasCamera] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Init camera
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(() => {
                setHasCamera(false);
            });

        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(t => t.stop());
            }
        };
    }, []);

    const startRecording = () => {
        if (!videoRef.current?.srcObject) return;

        const stream = videoRef.current.srcObject as MediaStream;
        const options = { mimeType: 'video/webm;codecs=vp8' };

        try {
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                setProcessing(true);
                const blob = new Blob(chunks, { type: 'video/webm' });
                // FAKE UPLOAD: We wait 2 seconds and "succeed". Tolerant to failure.
                setTimeout(() => {
                    setProcessing(false);
                    onComplete('https://fake-cf-r2-url.com/video.webm');
                }, 1500);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Timer for 5 seconds
            let t = 5;
            const interval = setInterval(() => {
                t -= 1;
                setTimeLeft(t);
                if (t <= 0) {
                    clearInterval(interval);
                    mediaRecorder.stop();
                    setIsRecording(false);
                }
            }, 1000);

        } catch (e) {
            console.error("No se pudo grabar video", e);
            // Fault tolerance: allow skipping
            onComplete();
        }
    };

    if (processing) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-neon-volt animate-spin mb-4" />
                <p className="text-zinc-400 font-medium">Ejecutando evaluación biomecánica determinista...</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg flex flex-col items-center"
        >
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-6">
                <Camera className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-center">Test de Movilidad</h2>
            <p className="text-zinc-400 mb-8 text-center px-4">
                Realiza una sentadilla libre frente a la cámara. Grabaremos 5 segundos para que el motor de reglas detecte asimetrías articulares.
            </p>

            {hasCamera ? (
                <div className="relative w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 mb-8">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />

                    {isRecording && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white font-mono font-bold px-3 py-1 rounded-full text-sm flex items-center gap-2 animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            00:0{timeLeft}
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full aspect-[4/3] bg-zinc-900 rounded-2xl border border-zinc-800 mb-8 flex flex-col items-center justify-center text-zinc-500 p-6 text-center">
                    <Video className="w-12 h-12 mb-4 opacity-50" />
                    <p>No se pudo acceder a la cámara.</p>
                </div>
            )}

            <div className="flex gap-4 w-full">
                <button
                    onClick={() => onComplete()}
                    disabled={isRecording}
                    className="flex-1 py-4 bg-zinc-900 text-zinc-400 rounded-xl font-medium hover:text-white transition-colors"
                >
                    Saltar Fase
                </button>
                {hasCamera && (
                    <button
                        onClick={startRecording}
                        disabled={isRecording}
                        className="flex-1 py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {isRecording ? 'Grabando...' : 'Iniciar Test (5s)'}
                    </button>
                )}
            </div>
        </motion.div>
    );
}

function WaitingRoomStep() {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = [
        "Indexando parámetros articulares...",
        "Calculando Volumen Máximo Recuperable (MRV)...",
        "Comparando contra Plantillas Maestras del Tenant...",
        "Ejecutando ajuste de tags por estrés...",
        "Generando Alerta en Inbox del Coach..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prev => Math.min(prev + 1, messages.length - 1));
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-lg flex flex-col items-center justify-center text-center py-10"
        >
            <div className="relative mb-12">
                <div className="w-32 h-32 rounded-full border-4 border-zinc-800 border-t-neon-volt animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-10 h-10 text-neon-volt animate-pulse" />
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Analizando biometría y adaptando volumen...</h2>
            <p className="text-zinc-400 mb-8 max-w-sm">
                Tu Coach está revisando el perfil para aprobar tu plan. Mantente en esta pantalla.
            </p>

            <div className="h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-zinc-400 font-mono text-sm"
                    >
                        {messages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>

            {messageIndex >= messages.length - 1 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-12 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full text-left"
                >
                    <div className="flex items-start gap-4 mb-4">
                        <img src="https://ui-avatars.com/api/?name=Coach+Elite&background=random" className="w-12 h-12 rounded-full" />
                        <div>
                            <h4 className="font-bold text-white">Mensaje del Coach</h4>
                            <p className="text-xs text-neon-volt mt-1">El programa ha sido procesado por el Motor de Reglas.</p>
                        </div>
                    </div>
                    <p className="text-sm text-zinc-400 italic">
                        "¡Bienvenido al equipo! Nuestro sistema ha tageado tu perfil según tus límites articulares y nivel de estrés. He recibido la alerta en mi Inbox y revisaré tu bloque de entrenamiento en breve."
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}

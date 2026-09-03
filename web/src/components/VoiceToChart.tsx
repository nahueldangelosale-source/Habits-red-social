import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Check, Activity, FileText, Brain, Stethoscope, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { voiceToChartApi, type VoiceToChartOutput } from '../api/voiceToChart';

export const VoiceToChart: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // STATE
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [duration, setDuration] = useState(0);
    const [soapData, setSoapData] = useState<VoiceToChartOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    // REFS
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    // CLEANUP
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // RECORDING LOGIC
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' }); // Chrome/Firefox default
                await handleUpload(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setSoapData(null);
            setError(null);

            // Timer
            setDuration(0);
            timerRef.current = window.setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("No se pudo acceder al micrÃƒÂ³fono.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleUpload = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            // TODO: Replace hardcoded UUIDs with real Client/Pro IDs
            const result = await voiceToChartApi.uploadAudio(
                audioBlob,
                "00000000-0000-0000-0000-000000000000", // Demo Client
                "00000000-0000-0000-0000-000000000000", // Demo Pro
                duration
            );
            setSoapData(result);
        } catch (err) {
            console.error(err);
            setError("Error procesando la consulta. Intente nuevamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    // FORMAT TIME
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`min-h-screen p-6 md:p-12 flex flex-col items-center transition-colors duration-500 ${isClinical ? 'bg-premium-clinical text-slate-800' : 'bg-premium-adrenaline text-white'
            }`}>

            <div className="w-full max-w-5xl">

                {/* Header */}
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 bg-white/50 backdrop-blur-sm border-slate-200"
                    >
                        <Brain size={16} className={isClinical ? "text-emerald-600" : "text-lime-400"} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-400'
                            }`}>Rule Engine V2.0</span>
                    </motion.div>
                    <h1 className={`text-5xl font-sans font-bold mb-3 tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'
                        }`}>The Invisible Scribe</h1>
                    <p className={`text-sm uppercase tracking-widest font-medium ${isClinical ? 'text-slate-400' : 'text-zinc-500'
                        }`}>Listening. Structuring. Analyzing.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT PANEL: RECORDER (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className={`relative rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 group ${isRecording ? (isClinical ? 'shadow-emerald-500/20 ring-4 ring-emerald-500/10' : 'shadow-lime-400/20 ring-4 ring-lime-400/10') : ''
                            } ${isClinical
                                ? 'bg-white/60 backdrop-blur-xl border border-white/60'
                                : 'bg-zinc-900/60 backdrop-blur-xl border border-white/10'
                            }`}>

                            {/* Visualizer */}
                            <div className={`h-64 flex flex-col items-center justify-center relative overflow-hidden ${isClinical
                                ? 'bg-gradient-to-b from-slate-50/50 to-emerald-50/30'
                                : 'bg-gradient-to-b from-zinc-900/50 to-lime-400/5'
                                }`}>
                                {isRecording ? (
                                    <div className="flex items-center gap-1.5 h-24">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className={`w-3 rounded-full ${isClinical ? 'bg-emerald-400' : 'bg-lime-400'}`}
                                                animate={{
                                                    height: [20, Math.random() * 80 + 20, 20],
                                                    opacity: [0.5, 1, 0.5]
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 0.4,
                                                    delay: i * 0.05,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : isProcessing ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 size={48} className={`animate-spin ${isClinical ? "text-emerald-500" : "text-lime-400"}`} />
                                        <span className={`text-xs font-bold uppercase tracking-widest animate-pulse ${isClinical ? "text-emerald-600" : "text-lime-400"
                                            }`}>Processing Audio...</span>
                                    </div>
                                ) : (
                                    <motion.div
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className={`opacity-20 ${isClinical ? 'text-slate-400' : 'text-zinc-600'}`}
                                    >
                                        <Mic size={80} strokeWidth={1} />
                                    </motion.div>
                                )}

                                {/* Timer */}
                                <div className={`absolute bottom-6 font-mono text-2xl font-bold tracking-wider ${isRecording
                                    ? (isClinical ? 'text-rose-500' : 'text-red-400')
                                    : (isClinical ? 'text-slate-300' : 'text-zinc-600')
                                    }`}>
                                    {formatTime(duration)}
                                </div>
                            </div>

                            {/* Control Button */}
                            <div className="p-8 flex justify-center -mt-10 relative z-10">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={isProcessing}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 active:scale-95 border-4 ${isProcessing
                                        ? 'bg-slate-200 cursor-not-allowed border-slate-100'
                                        : isRecording
                                            ? 'bg-rose-500 text-white border-rose-100 hover:bg-rose-600'
                                            : (isClinical
                                                ? 'bg-emerald-500 text-white border-emerald-50 hover:bg-emerald-600 hover:shadow-emerald-500/30'
                                                : 'bg-lime-400 text-black border-lime-200 hover:bg-lime-300 hover:shadow-lime-400/30')
                                        }`}
                                >
                                    {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={32} />}
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="px-6 pb-6 text-center">
                                    <p className="text-xs text-rose-500 font-bold bg-rose-50 px-4 py-2 rounded-lg border border-rose-100 inline-flex items-center gap-2">
                                        <AlertCircle size={12} /> {error}
                                    </p>
                                </div>
                            )}

                        </div>

                        {/* Confidence Score */}
                        {soapData && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-2xl p-6 border ${isClinical ? 'bg-white/50 border-white/60' : 'bg-zinc-900/40 border-white/10'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-xs font-bold uppercase ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>Certeza de Evaluación</span>
                                    <span className={`text-lg font-mono font-bold ${soapData.transcription_confidence > 0.8
                                        ? (isClinical ? 'text-emerald-500' : 'text-lime-400')
                                        : 'text-amber-500'
                                        }`}>
                                        {(soapData.transcription_confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isClinical ? 'bg-emerald-500' : 'bg-lime-400'}`}
                                        style={{ width: `${soapData.transcription_confidence * 100}%` }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT PANEL: SOAP OUTPUT (Span 8) */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {soapData ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* SOAP GRID */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* S: Subjective */}
                                        <SOAPCard
                                            title="Subjective"
                                            icon={FileText}
                                            color={isClinical ? "text-blue-500" : "text-blue-400"}
                                            bgColor={isClinical ? "bg-blue-50 border-blue-100" : "bg-blue-900/10 border-blue-500/20"}
                                            mode={mode}
                                        >
                                            <ul className="space-y-2 text-sm">
                                                <li className="font-bold">"{soapData.subjective.chief_complaint}"</li>
                                                {soapData.subjective.symptoms?.map((s, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs opacity-80">
                                                        <span className="mt-1 w-1 h-1 rounded-full bg-current" /> {s}
                                                    </li>
                                                ))}
                                                {soapData.subjective.lifestyle_notes && (
                                                    <li className="text-xs  mt-2 opacity-70 border-t border-current/10 pt-2">
                                                        {soapData.subjective.lifestyle_notes}
                                                    </li>
                                                )}
                                            </ul>
                                        </SOAPCard>

                                        {/* O: Objective */}
                                        <SOAPCard
                                            title="Objective"
                                            icon={Activity}
                                            color={isClinical ? "text-emerald-500" : "text-emerald-400"}
                                            bgColor={isClinical ? "bg-emerald-50 border-emerald-100" : "bg-emerald-900/10 border-emerald-500/20"}
                                            mode={mode}
                                        >
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-xs uppercase opacity-60 block mb-1">Weight</span>
                                                    <span className="font-mono font-bold text-lg">{soapData.objective.weight_kg || '--'} kg</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs uppercase opacity-60 block mb-1">Body Fat</span>
                                                    <span className="font-mono font-bold text-lg">{soapData.objective.body_fat_percentage || '--'} %</span>
                                                </div>
                                            </div>
                                            {soapData.objective.measurements && (
                                                <div className="mt-4 pt-3 border-t border-current/10">
                                                    <span className="text-[10px] uppercase opacity-60 block mb-2">Measurements</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(soapData.objective.measurements).map(([k, v]) => (
                                                            <span key={k} className="px-2 py-1 rounded text-xs bg-zinc-950/5 font-mono">
                                                                {k}: {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </SOAPCard>

                                        {/* A: Assessment */}
                                        <SOAPCard
                                            title="Assessment"
                                            icon={Brain}
                                            color={isClinical ? "text-amber-500" : "text-amber-400"}
                                            bgColor={isClinical ? "bg-amber-50 border-amber-100" : "bg-amber-900/10 border-amber-500/20"}
                                            mode={mode}
                                        >
                                            <p className="text-sm font-medium leading-relaxed mb-3">
                                                {soapData.assessment.progress_evaluation}
                                            </p>
                                            <div className="space-y-2">
                                                {soapData.assessment.risk_factors?.map((r, i) => (
                                                    <div key={i} className={`text-xs px-2 py-1 rounded border inline-block mr-2 ${isClinical ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-amber-900/30 border-amber-500/30 text-amber-200'
                                                        }`}>
                                                        Ã¢Å¡Â Ã¯Â¸Â {r}
                                                    </div>
                                                ))}
                                            </div>
                                        </SOAPCard>

                                        {/* P: Plan */}
                                        <SOAPCard
                                            title="Plan"
                                            icon={Stethoscope}
                                            color={isClinical ? "text-violet-500" : "text-violet-400"}
                                            bgColor={isClinical ? "bg-violet-50 border-violet-100" : "bg-violet-900/10 border-violet-500/20"}
                                            mode={mode}
                                        >
                                            <ul className="space-y-2 text-sm">
                                                {soapData.plan.protocol_adjustments?.map((adj, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <Check size={14} className="opacity-70" /> {adj}
                                                    </li>
                                                ))}
                                                {soapData.plan.homework?.map((hw, i) => (
                                                    <li key={i} className="flex items-center gap-2 opacity-80">
                                                        <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full border border-current text-[8px]">H</span> {hw}
                                                    </li>
                                                ))}
                                            </ul>
                                            {soapData.plan.follow_up_date && (
                                                <div className="mt-4 pt-3 border-t border-current/10 text-xs font-mono opacity-70 text-right">
                                                    Next: {new Date(soapData.plan.follow_up_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </SOAPCard>

                                    </div>

                                    {/* RAW TRANSCRIPT TOGGLE */}
                                    <div className={`rounded-2xl p-6 border ${isClinical ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-zinc-900/30 border-zinc-800 text-zinc-500'
                                        }`}>
                                        <h4 className="text-xs font-bold uppercase mb-2 opacity-70">Raw Transcription</h4>
                                        <p className="text-xs  leading-relaxed font-sans">"{soapData.raw_transcription}"</p>
                                    </div>

                                </motion.div>
                            ) : (
                                // PLACEHOLDER STATE
                                <EmptyState isProcessing={isProcessing} isRecording={isRecording} isClinical={isClinical} />
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};

const SOAPCard = ({ title, icon: Icon, color, bgColor, children, mode }: any) => {
    const isClinical = mode === 'CLINICAL';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className={`p-6 rounded-2xl border transition-shadow ${bgColor} ${isClinical ? "hover:shadow-md" : "hover:shadow-lg hover:shadow-white/5"}`}
        >
            <div className={`flex items-center gap-2 mb-4 ${color}`}>
                <Icon size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
            </div>
            <div className={isClinical ? "text-slate-700" : "text-zinc-300"}>
                {children}
            </div>
        </motion.div>
    );
};

const EmptyState = ({ isProcessing, isRecording, isClinical }: any) => (
    <div className={`h-full min-h-[400px] flex flex-col items-center justify-center rounded-3xl border border-dashed text-center p-8 transition-colors ${isClinical
        ? 'border-slate-200 bg-slate-50/50 text-slate-400'
        : 'border-zinc-800 bg-zinc-900/20 text-zinc-600'
        }`}>
        {isProcessing ? (
            <div className="max-w-md">
                <Brain size={48} className={`mx-auto mb-6 animate-pulse ${isClinical ? 'text-emerald-400' : 'text-lime-400'}`} />
                <h3 className={`text-xl font-sans font-bold mb-2 ${isClinical ? 'text-slate-700' : 'text-zinc-200'}`}>Analizando Insights Clínicos...</h3>
                <p className="text-sm opacity-70">El motor se encarga de tagear patrones biomecánicos, extraer biomarcadores y estructurar tus notas de forma determinista.</p>
            </div>
        ) : isRecording ? (
            <div className="max-w-md">
                <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center animate-ping ${isClinical ? 'bg-emerald-100 text-emerald-500' : 'bg-lime-900/30 text-lime-400'}`}>
                    <Mic size={24} />
                </div>
                <h3 className={`text-xl font-sans font-bold mb-2 ${isClinical ? 'text-slate-700' : 'text-zinc-200'}`}>Listening...</h3>
                <p className="text-sm opacity-70">Speak naturally. The Scribe identifies subjective symptoms and objective metrics automatically.</p>
            </div>
        ) : (
            <div className="max-w-md">
                <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isClinical ? 'bg-white shadow-sm text-slate-300' : 'bg-zinc-800 text-zinc-600'}`}>
                    <FileText size={24} />
                </div>
                <h3 className={`text-xl font-sans font-bold mb-2 ${isClinical ? 'text-slate-700' : 'text-zinc-200'}`}>Ready to Transcribe</h3>
                <p className="text-sm opacity-70">Press the microphone to start a new patient consultation analysis.</p>
            </div>
        )}
    </div>
);

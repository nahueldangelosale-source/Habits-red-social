import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import { Upload, Activity, ShieldAlert, CheckCircle2, AlertTriangle, FileCheck2, Lock, ArrowUpRight, Search, FileSignature } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// -----------------------------------------------------------------------------
// MOCK DATA
// -----------------------------------------------------------------------------
type MarkerData = {
    id: string;
    name: string;
    value: number;
    unit: string;
    confidence: number;
    boxTop: string; 
    isConfirmed: boolean;
    optimal: number;
    fullMark: number;
};

const INITIAL_MARKERS: MarkerData[] = [
    { id: 'm1', name: 'Triglicéridos', value: 180, unit: 'mg/dL', confidence: 98, boxTop: '20%', isConfirmed: true, optimal: 100, fullMark: 200 },
    { id: 'm2', name: 'Glucosa Ayuno', value: 95, unit: 'mg/dL', confidence: 96, boxTop: '35%', isConfirmed: true, optimal: 85, fullMark: 120 },
    { id: 'm3', name: 'Cortisol', value: 16, unit: 'ug/dL', confidence: 95, boxTop: '50%', isConfirmed: true, optimal: 12, fullMark: 25 },
    { id: 'm4', name: 'Vitamina D (25-OH)', value: 2, unit: 'ng/mL', confidence: 42, boxTop: '65%', isConfirmed: false, optimal: 50, fullMark: 80 }, // Falla intencional (Mancha de café)
    { id: 'm5', name: 'PCR', value: 3.5, unit: 'mg/L', confidence: 88, boxTop: '80%', isConfirmed: true, optimal: 1.0, fullMark: 5 },
];

type AppState = 'DROPZONE' | 'PAYWALL' | 'SCANNING' | 'VALIDATION_ROOM' | 'RADAR_VIEW';

export const SmartLabReader: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    
    // State
    const [appState, setAppState] = useState<AppState>('DROPZONE');
    const [scansRemaining, setScansRemaining] = useState(3);
    const [markers, setMarkers] = useState<MarkerData[]>(INITIAL_MARKERS);
    const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
    const [constraintApplied, setConstraintApplied] = useState(false);

    // Bucle de Validación Legal
    const canSign = useMemo(() => markers.every(m => m.isConfirmed), [markers]);

    // -----------------------------------------------------------------------------
    // HANDLERS
    // -----------------------------------------------------------------------------
    const handleFileUpload = () => {
        if (scansRemaining === 0) {
            setAppState('PAYWALL');
            return;
        }

        setAppState('SCANNING');
        setTimeout(() => {
            setAppState('VALIDATION_ROOM');
            setScansRemaining(prev => prev - 1);
            toast("Extracción pausada. Se requiere validación humana por baja confianza algorítmica.", { icon: '⚠️', duration: 5000 });
        }, 3000);
    };

    const handleMarkerChange = (id: string, newValue: string) => {
        setMarkers(prev => prev.map(m => {
            if (m.id === id) {
                // Al editar, el humano implícitamente confirma y sobrescribe el valor (Override)
                return { ...m, value: Number(newValue) || 0, isConfirmed: true };
            }
            return m;
        }));
    };

    const handleConfirmMarker = (id: string) => {
        setMarkers(prev => prev.map(m => m.id === id ? { ...m, isConfirmed: true } : m));
        toast.success("Valor confirmado (Override registrado para RLHF)", { icon: '📝' });
    };

    const handleLegalSignature = () => {
        if (!canSign) return;
        toast.success("Firma Legal Registrada. Trazabilidad guardada.", { icon: '⚖️' });
        setAppState('RADAR_VIEW');
    };

    // -----------------------------------------------------------------------------
    // RENDERERS
    // -----------------------------------------------------------------------------
    
    const renderDropzone = () => (
        <div className="max-w-3xl mx-auto mt-20 animate-in zoom-in duration-500">
            <div 
                onClick={handleFileUpload}
                className={`relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-16 transition-all cursor-pointer group ${
                    isClinical 
                        ? 'bg-white border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50' 
                        : 'bg-zinc-900/50 border-zinc-700 hover:border-indigo-500 hover:bg-indigo-500/5'
                }`}
            >
                <div className="flex flex-col items-center z-10">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${isClinical ? 'bg-indigo-50 text-indigo-500' : 'bg-zinc-800 text-zinc-400 group-hover:text-indigo-400'}`}>
                        <Upload size={32} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isClinical ? 'text-slate-800' : 'text-white'}`}>AI Dropzone (Computer Vision)</h3>
                    <p className={`text-sm text-center max-w-sm mb-6 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                        Arrastra el PDF de Quest Diagnostics o LabCorp. Extracción óptica instantánea sin entrada manual de datos.
                    </p>
                    
                    {/* Reverse Trial Hook */}
                    <div className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-2 ${
                        isClinical ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    }`}>
                        <Lock size={14} className={isClinical ? 'text-emerald-500' : 'text-indigo-400'} />
                        Reverse Trial: {scansRemaining} Scans Gratuitos Restantes
                    </div>
                </div>

                {!isClinical && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 to-transparent" />
                )}
            </div>

            <div className="mt-6 flex justify-center">
                 <button className={`text-sm underline font-medium ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                     O usar Entrada Manual (Gratis para siempre)
                 </button>
            </div>
        </div>
    );

    const renderScanning = () => (
        <div className="max-w-xl mx-auto mt-32 flex flex-col items-center">
            <div className="relative w-24 h-32 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 overflow-hidden mb-6 shadow-2xl">
                <motion.div
                    className={`absolute top-0 left-0 w-full h-1 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20 ${isClinical ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-indigo-500 shadow-indigo-500/50'}`}
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="p-3 space-y-3 opacity-30">
                    <div className="h-2 w-full bg-slate-400 rounded"></div>
                    <div className="h-2 w-3/4 bg-slate-400 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-400 rounded"></div>
                    <div className="h-2 w-full bg-slate-400 rounded mt-4"></div>
                    <div className="h-2 w-2/3 bg-slate-400 rounded"></div>
                </div>
            </div>
            <h3 className={`text-xl font-bold mb-2 animate-pulse ${isClinical ? 'text-slate-800' : 'text-white'}`}>Extrayendo Biomarcadores...</h3>
            <p className={`text-sm font-mono ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Ejecutando modelo OCR y parseo estructural</p>
        </div>
    );

    const renderValidationRoom = () => (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
            <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${isClinical ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <div className="flex items-center gap-3">
                    <AlertTriangle className={isClinical ? 'text-amber-600' : 'text-amber-400'} size={24} />
                    <div>
                        <h2 className={`font-bold ${isClinical ? 'text-amber-900' : 'text-amber-400'}`}>Auditoría Human-in-the-Loop Requerida</h2>
                        <p className={`text-sm ${isClinical ? 'text-amber-700' : 'text-amber-500/80'}`}>La IA detectó zonas ilegibles en el documento original. Firma legal bloqueada hasta verificación.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                {/* Left: Document Viewer with Bounding Boxes */}
                <div className={`relative rounded-3xl border overflow-hidden shadow-inner ${isClinical ? 'bg-slate-100 border-slate-300' : 'bg-zinc-900 border-zinc-700'}`}>
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2"><Search size={14}/> Documento Original</span>
                        <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">quest_lab_results.pdf</span>
                    </div>

                    {/* Simulated PDF Background */}
                    <div className="absolute inset-4 mt-20 bg-white shadow-sm border border-slate-200 rounded-lg p-8 pointer-events-none">
                        <div className="space-y-8 opacity-20">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="h-3 w-32 bg-slate-800 rounded"></div>
                                    <div className="h-3 w-16 bg-slate-800 rounded"></div>
                                    <div className="h-3 w-48 bg-slate-400 rounded"></div>
                                </div>
                            ))}
                        </div>
                        
                        {/* The "Coffee Stain" / Blur simulation */}
                        <div className="absolute top-[62%] left-[40%] w-32 h-16 bg-amber-900/20 blur-md rounded-full rotate-12"></div>
                        <div className="absolute top-[63%] left-[45%] text-[8px] font-mono text-slate-800 font-bold opacity-40 -rotate-2">Vitamina D (25-OH)   ??.5 ng/mL</div>

                        {/* Bounding Box Sync */}
                        <AnimatePresence>
                            {hoveredMarkerId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`absolute left-6 right-16 h-10 border-2 rounded-md ${isClinical ? 'border-indigo-500 bg-indigo-500/10' : 'border-indigo-500 bg-indigo-500/10'}`}
                                    style={{ top: markers.find(m => m.id === hoveredMarkerId)?.boxTop }}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right: Data Table for Validation */}
                <div className={`flex flex-col rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-800'}`}>
                    <div className={`p-6 border-b ${isClinical ? 'border-slate-100' : 'border-zinc-800'}`}>
                        <h3 className={`text-lg font-bold flex items-center gap-2 ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                            Valores Extraídos
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                        {markers.map((marker) => {
                            const isLowConfidence = marker.confidence < 85;
                            const isPending = !marker.isConfirmed;
                            
                            return (
                                <div 
                                    key={marker.id}
                                    onMouseEnter={() => setHoveredMarkerId(marker.id)}
                                    onMouseLeave={() => setHoveredMarkerId(null)}
                                    className={`m-2 p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                                        isPending
                                            ? (isClinical ? 'bg-amber-50/50 border-amber-300 shadow-[inset_0_0_10px_rgba(251,191,36,0.2)]' : 'bg-amber-500/10 border-amber-500/50 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)]')
                                            : (hoveredMarkerId === marker.id 
                                                ? (isClinical ? 'bg-indigo-50 border-indigo-200' : 'bg-zinc-900 border-zinc-700')
                                                : (isClinical ? 'bg-white border-transparent' : 'bg-transparent border-transparent'))
                                    }`}
                                >
                                    <div className="flex-1">
                                        <label className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>{marker.name}</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <input 
                                                type="number"
                                                value={marker.value}
                                                onChange={(e) => handleMarkerChange(marker.id, e.target.value)}
                                                className={`w-24 text-lg font-mono font-bold bg-transparent border-b outline-none focus:border-indigo-500 ${isClinical ? 'text-slate-900 border-slate-300' : 'text-white border-zinc-700'}`}
                                            />
                                            <span className={`text-sm ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>{marker.unit}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                            isLowConfidence 
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' 
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        }`}>
                                            Confianza: {marker.confidence}%
                                        </span>
                                        
                                        {isPending && (
                                            <button 
                                                onClick={() => handleConfirmMarker(marker.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    isClinical ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' : 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300'
                                                }`}
                                            >
                                                Confirmar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={`p-6 border-t ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <button
                            onClick={handleLegalSignature}
                            disabled={!canSign}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                canSign
                                    ? (isClinical ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg' : 'bg-[var(--color-action-primary)] text-black shadow-[0_0_20px_rgba(206,255,0,0.3)]')
                                    : (isClinical ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed')
                            }`}
                        >
                            <FileSignature size={20} />
                            Firma Médico-Legal y Procesar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderRadarView = () => {
        // Formatear datos para el gráfico
        const radarData = markers.map(m => ({
            subject: m.name.split(' ')[0],
            A: m.value,
            B: m.optimal,
            fullMark: m.fullMark
        }));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in zoom-in-95 duration-500">
                {/* Left Column: Biological Age Radar */}
                <div className="lg:col-span-7 space-y-6">
                    <div className={`p-8 rounded-3xl border shadow-sm ${isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`}>
                                    <Activity size={16} /> Mapa de Longevidad
                                </h3>
                                <p className={`text-xs mt-1 font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                    Edad Cronológica: 35 años • <span className={isClinical ? 'text-rose-600 font-bold' : 'text-rose-400 font-bold'}>Edad Biológica Estimada: 42 años</span>
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${isClinical ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                                <CheckCircle2 size={12}/> HIL Validado
                            </div>
                        </div>
                        
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke={isClinical ? '#e2e8f0' : '#27272a'} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: isClinical ? '#64748b' : '#a1a1aa', fontSize: 11, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Rango Óptimo" dataKey="B" stroke={isClinical ? '#10b981' : '#6366f1'} fill={isClinical ? '#10b981' : '#6366f1'} fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
                                    <Radar name="Paciente (Actual)" dataKey="A" stroke={isClinical ? '#6366f1' : '#818cf8'} fill={isClinical ? '#6366f1' : '#818cf8'} fillOpacity={0.5} strokeWidth={2} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: isClinical ? '#fff' : '#18181b', borderRadius: '12px', border: isClinical ? '1px solid #e2e8f0' : '1px solid #27272a' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: Alerts */}
                <div className="lg:col-span-5 space-y-6">
                    <AnimatePresence>
                        {!constraintApplied ? (
                            <motion.div 
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-1 rounded-3xl shadow-xl overflow-hidden ${isClinical ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-rose-600 to-rose-900'}`}
                            >
                                <div className={`p-6 rounded-[22px] backdrop-blur-xl ${isClinical ? 'bg-white/95' : 'bg-zinc-950/90'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                                            <ShieldAlert size={28} />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-black mb-1 ${isClinical ? 'text-slate-900' : 'text-white'}`}>Safe by Default: Alerta Clínica</h4>
                                            <p className={`text-sm mb-4 leading-relaxed ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                                                DietQA detectó niveles de riesgo (Triglicéridos {markers.find(m=>m.id==='m1')?.value} mg/dL). Se ha pre-cargado una <strong className={isClinical ? 'text-slate-800' : 'text-white'}>Restricción Dura</strong> para bloquear grasas saturadas.
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    setConstraintApplied(true);
                                                    toast.success("Hard Constraint inyectado en DietQA", { icon: '🛡️' });
                                                }}
                                                className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold tracking-wide text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={18} /> APROBAR RESTRICCIÓN
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 ${isClinical ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-950/30 border-emerald-900/50'}`}
                            >
                                <div className={`p-2 rounded-full ${isClinical ? 'bg-emerald-500 text-white' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isClinical ? 'text-emerald-900' : 'text-emerald-400'}`}>Regla Clínica Activa</h4>
                                    <p className={`text-sm ${isClinical ? 'text-emerald-700' : 'text-emerald-600/80'}`}>DietQA bloqueando grasas saturadas.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    const renderPaywall = () => (
        <div className="max-w-xl mx-auto mt-32 text-center animate-in zoom-in-95 duration-500">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border-4 ${isClinical ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-blue-900/20 border-blue-500/20 text-blue-400'}`}>
                <ArrowUpRight size={48} />
            </div>
            <h2 className={`text-3xl font-black mb-4 tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>Desbloquea el Smart Lab Ilimitado</h2>
            <p className={`mb-8 leading-relaxed ${isClinical ? 'text-slate-600' : 'text-zinc-400'}`}>
                Has consumido tus 3 extracciones gratuitas. Para seguir ahorrando 15 minutos de transcripción manual por paciente y utilizar la auditoría Human-in-the-Loop, actualiza tu plan.
            </p>
            <div className="flex gap-4 justify-center">
                <button onClick={() => setAppState('DROPZONE')} className={`px-6 py-3 rounded-xl font-bold transition-colors ${isClinical ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                    Volver a Carga Manual
                </button>
                <button className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-xl hover:-translate-y-1 ${isClinical ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
                    Actualizar a Premium - $49/mo
                </button>
            </div>
        </div>
    );

    return (
        <div className={`p-6 md:p-10 min-h-screen font-sans ${isClinical ? 'bg-[#F8FAFC] text-slate-800' : 'bg-zinc-950 text-white'}`}>
            {appState !== 'VALIDATION_ROOM' && appState !== 'SCANNING' && appState !== 'PAYWALL' && (
                <header className="mb-8 flex justify-between items-end animate-in fade-in">
                    <div>
                        <h1 className={`text-3xl font-black flex items-center gap-3 tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            <div className={`p-2 rounded-xl ${isClinical ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                <Activity size={28} />
                            </div>
                            Smart Lab (Bio-Sync)
                        </h1>
                    </div>
                </header>
            )}

            {appState === 'DROPZONE' && renderDropzone()}
            {appState === 'SCANNING' && renderScanning()}
            {appState === 'VALIDATION_ROOM' && renderValidationRoom()}
            {appState === 'RADAR_VIEW' && renderRadarView()}
            {appState === 'PAYWALL' && renderPaywall()}
        </div>
    );
};

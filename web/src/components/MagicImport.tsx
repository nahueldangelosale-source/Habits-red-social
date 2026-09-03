/**
 * MAGIC IMPORT - Legacy Data Migration
 * "La Ingesta Mágica" - Zero-Pain Switch Epic
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    Image as ImageIcon,
    Table,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    User,
    Utensils,
    FileUp,
    Zap,
    Bot
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTaskPolling } from '../hooks/useTaskPolling';
import { uploadMagicImport } from '../api/magicImportApi';
import toast from 'react-hot-toast';

interface ExtractedPatient {
    id: string;
    name: string;
    confidence: number;
    foods: string[];
    macros: { calories: number; protein: number; carbs: number; fat: number };
    status: 'pending' | 'confirmed' | 'rejected';
}

interface UploadedFile {
    name: string;
    type: 'pdf' | 'xls' | 'jpg';
    size: string;
    status: 'uploading' | 'processing' | 'complete' | 'error';
}

const FileTypeIcon = ({ type, className = "" }: { type: string, className?: string }) => {
    switch (type) {
        case 'pdf': return <FileText className={className} />;
        case 'xls': return <Table className={className} />;
        case 'jpg': return <ImageIcon className={className} />;
        default: return <FileText className={className} />;
    }
};

export function MagicImport() {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [extractedPatients, setExtractedPatients] = useState<ExtractedPatient[]>([]);
    const [step, setStep] = useState<'upload' | 'processing' | 'confirm'>('upload');

    const accentColorClass = isClinical ? 'text-emerald-500' : 'text-indigo-400';
    const accentBgClass = isClinical ? 'bg-emerald-500' : 'bg-indigo-500';
    const accentBorderClass = isClinical ? 'border-emerald-500/50' : 'border-indigo-500/50';
    const glowClass = isClinical ? 'shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'shadow-[0_0_30px_rgba(206,255,0,0.15)]';
    const glassPanelClass = isClinical 
        ? 'bg-white/80 border-slate-200 backdrop-blur-xl shadow-xl' 
        : 'bg-zinc-900/60 border-white/5 backdrop-blur-xl shadow-2xl';

    const { state, elapsedTime, error, submitTask, reset } = useTaskPolling({
        onSuccess: (result: any) => {
            setFiles(prev => prev.map(f => ({ ...f, status: 'complete' })));
            if (result) {
                const isDiet = !!result.diet_plan;
                const isWorkout = !!result.workout_plan;
                const nameLabel = isDiet ? "Plan Dietario Analizado" : (isWorkout ? "Rutina Híbrida Analizada" : "Documento Procesado");

                let foodsExtracted = ["-"];
                let cals = 0;
                if (isDiet && result.diet_plan?.meals?.length > 0) {
                    foodsExtracted = result.diet_plan.meals[0].foods || [];
                    cals = result.diet_plan.daily_calories || 0;
                }

                setExtractedPatients([{
                    id: result.id || Math.random().toString(),
                    name: nameLabel,
                    confidence: result.confidence_score || 0.9,
                    foods: foodsExtracted,
                    macros: { calories: cals, protein: 120, carbs: 180, fat: 60 },
                    status: 'pending'
                }]);
                setTimeout(() => setStep('confirm'), 800);
            }
        },
        onError: () => {
            setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
        }
    });

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
        }
    };

    const processFiles = (selectedFiles: File[]) => {
        const file = selectedFiles[0]; 
        if (!file) return;

        const newFiles: UploadedFile[] = [{
            name: file.name,
            type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? 'xls' : 'jpg',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            status: 'uploading'
        }];

        setFiles(newFiles);
        setStep('processing');
        reset();
        const demoTenantId = "00000000-0000-0000-0000-000000000000";
        submitTask(() => uploadMagicImport(file, demoTenantId));
    };

    const handleConfirm = (id: string) => {
        setExtractedPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'confirmed' as const } : p));
        toast.success('Dato importado exitosamente', { icon: '✅' });
    };

    const handleReject = (id: string) => {
        setExtractedPatients(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' as const } : p));
    };

    const handleConfirmAll = () => {
        setExtractedPatients(prev => prev.map(p => p.status === 'pending' ? { ...p, status: 'confirmed' as const } : p));
        toast.success('Todos los datos importados', { icon: '✅' });
    };

    return (
        <div className={`min-h-[calc(100vh-64px)] p-8 ${isClinical ? 'text-slate-800' : 'text-slate-100'} font-sans relative`}>
            
            {/* Header */}
            <div className="max-w-5xl mx-auto mb-10">
                <div className="flex items-center gap-4 mb-3">
                    <div className={`p-3 rounded-2xl ${isClinical ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className={`text-4xl font-black tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            Ingesta Mágica
                        </h1>
                        <p className={`text-lg font-medium ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                            Arrastra los Excel o PDFs de tus atletas y deja que la Inteligencia Artificial extraiga todo en segundos.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    
                    {/* STEP 1: UPLOAD ZONE */}
                    {step === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="relative group cursor-pointer"
                        >
                            <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${
                                isClinical ? 'bg-gradient-to-b from-emerald-400/20 to-transparent' : 'bg-gradient-to-b from-indigo-500/20 to-transparent'
                            } blur-xl`} />
                            
                            <label className={`relative flex flex-col items-center justify-center w-full min-h-[400px] p-12 text-center border-2 border-dashed rounded-3xl transition-all duration-300 ${glassPanelClass} ${
                                isDragging 
                                    ? `${accentBorderClass} ${glowClass} scale-[1.02]` 
                                    : isClinical ? 'border-slate-300 hover:border-emerald-400' : 'hover:border-indigo-500/50'
                            }`}>
                                <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center transition-transform duration-500 ${
                                    isDragging ? 'scale-110' : 'group-hover:scale-110'
                                } ${isClinical ? 'bg-emerald-50 text-emerald-500' : 'bg-white/5 text-indigo-400'}`}>
                                    <FileUp strokeWidth={1.5} className="w-12 h-12" />
                                </div>
                                
                                <h3 className={`text-2xl font-bold mb-3 ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                                    Arrastra tus archivos aquí
                                </h3>
                                <p className={`text-lg mb-8 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>
                                    O haz clic para explorar en tu computadora
                                </p>
                                
                                <div className="flex flex-wrap items-center justify-center gap-4 mt-auto">
                                    {[
                                        { icon: FileText, label: "PDF Document" },
                                        { icon: Table, label: "Excel Spreadsheet" },
                                        { icon: ImageIcon, label: "Scanned Images" }
                                    ].map((format, idx) => (
                                        <div key={idx} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                                            isClinical ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-zinc-300'
                                        }`}>
                                            <format.icon className="w-4 h-4" />
                                            {format.label}
                                        </div>
                                    ))}
                                </div>

                                <input type="file" accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />
                            </label>
                        </motion.div>
                    )}

                    {/* STEP 2: PROCESSING */}
                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-10 rounded-3xl border ${glassPanelClass} ${state === 'POLLING' ? glowClass : ''}`}
                        >
                            <div className="flex flex-col items-center text-center max-w-lg mx-auto">
                                <div className="relative mb-8">
                                    {state === 'ERROR' ? (
                                        <AlertCircle className="w-20 h-20 text-rose-500" strokeWidth={1.5} />
                                    ) : state === 'SUCCESS' ? (
                                        <CheckCircle2 className={`w-20 h-20 ${accentColorClass}`} strokeWidth={1.5} />
                                    ) : (
                                        <div className="relative">
                                            <Loader2 className={`w-20 h-20 animate-spin ${accentColorClass}`} strokeWidth={1.5} />
                                            <div className={`absolute inset-0 flex items-center justify-center animate-pulse ${accentColorClass}`}>
                                                <Bot className="w-8 h-8" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h3 className={`text-2xl font-bold mb-3 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                    {state === 'ERROR' 
                                        ? (error === 'Créditos Insuficientes' ? 'Fondo Insuficiente (FinOps)' : 'Fallo en la Ingesta')
                                        : state === 'SUCCESS' 
                                            ? 'Procesamiento Completado' 
                                            : 'Motor de IA Analizando Documento'}
                                </h3>
                                
                                <p className={`text-lg mb-10 ${state === 'ERROR' ? 'text-rose-500 font-medium' : (isClinical ? 'text-slate-500' : 'text-zinc-400')}`}>
                                    {state === 'ERROR' ? (
                                        error === 'Créditos Insuficientes'
                                            ? 'No tienes suficientes Compute Units para esta inferencia. Recarga créditos con Stripe.'
                                            : error
                                    ) : elapsedTime < 1000 ? (
                                        'Despachando tarea asíncrona a la red Celery...'
                                    ) : elapsedTime < 3000 ? (
                                        'Vision AI extrayendo métricas y tensores de las tablas...'
                                    ) : elapsedTime < 6000 ? (
                                        'Resolviendo identidades semánticas y corrigiendo ambigüedades...'
                                    ) : (
                                        'Generando Blueprint unificado...'
                                    )}
                                </p>

                                {/* File List Progress */}
                                <div className="w-full space-y-3 mb-8 text-left">
                                    {files.map((file, i) => (
                                        <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                                            isClinical ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/5'
                                        }`}>
                                            <div className={`p-3 rounded-xl ${isClinical ? 'bg-white text-slate-400 shadow-sm' : 'bg-white/5 text-zinc-400'}`}>
                                                <FileTypeIcon type={file.type} className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-semibold truncate ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>{file.name}</h4>
                                                <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>{file.size}</p>
                                            </div>
                                            <div>
                                                {state === 'SUBMITTING' && <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />}
                                                {state === 'POLLING' && <Sparkles className={`w-6 h-6 animate-pulse ${accentColorClass}`} />}
                                                {state === 'SUCCESS' && <CheckCircle2 className={`w-6 h-6 ${isClinical ? 'text-emerald-500' : 'text-emerald-400'}`} />}
                                                {state === 'ERROR' && <AlertCircle className="w-6 h-6 text-rose-500" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {state === 'ERROR' && (
                                    <button
                                        onClick={() => { setStep('upload'); reset(); }}
                                        className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg ${
                                            error === 'Créditos Insuficientes' 
                                                ? `${accentBgClass} text-black hover:scale-105` 
                                                : 'bg-rose-500 text-white hover:bg-rose-600'
                                        }`}
                                    >
                                        {error === 'Créditos Insuficientes' ? 'Recargar Créditos' : 'Intentar Nuevamente'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: HUMAN IN THE LOOP (REVIEW) */}
                    {step === 'confirm' && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
                                <div>
                                    <h2 className={`text-2xl font-bold mb-1 ${isClinical ? 'text-slate-900' : 'text-white'}`}>Auditoría Ejecutiva</h2>
                                    <p className={`text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Revisa y aprueba los datos extraídos por el LLM antes de inyectarlos a la base de datos.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border ${
                                        isClinical ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'bg-white/5 border-white/10 text-zinc-300'
                                    }`}>
                                        <User className="w-4 h-4" /> {extractedPatients.length} Registros Encontrados
                                    </div>
                                    {pendingCount > 0 && (
                                        <button 
                                            onClick={handleConfirmAll}
                                            className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:scale-105 ${
                                                accentBgClass
                                            } text-black`}
                                        >
                                            Aprobar Todo ({pendingCount})
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {extractedPatients.map(patient => (
                                    <motion.div
                                        key={patient.id}
                                        layout
                                        className={`p-6 rounded-2xl border transition-all duration-300 ${glassPanelClass} ${
                                            patient.status === 'confirmed' ? 'border-emerald-500/50 bg-emerald-500/5' : 
                                            patient.status === 'rejected' ? 'border-rose-500/50 opacity-50 grayscale' : 
                                            isClinical ? 'border-slate-200 hover:border-emerald-300' : 'border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-inner ${
                                                    isClinical ? 'bg-slate-100 text-slate-600' : 'bg-black/50 text-white'
                                                }`}>
                                                    {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold text-lg leading-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>{patient.name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full ${patient.confidence > 0.8 ? 'bg-emerald-500' : patient.confidence > 0.6 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                                style={{ width: `${patient.confidence * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-semibold ${
                                                            patient.confidence > 0.8 ? 'text-emerald-500' : patient.confidence > 0.6 ? 'text-amber-500' : 'text-rose-500'
                                                        }`}>
                                                            {Math.round(patient.confidence * 100)}% Match
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {patient.status === 'confirmed' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                            {patient.status === 'rejected' && <AlertCircle className="w-6 h-6 text-rose-500" />}
                                        </div>

                                        <div className={`p-4 rounded-xl border mb-6 ${
                                            isClinical ? 'bg-slate-50 border-slate-100' : 'bg-black/30 border-white/5'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Utensils className={`w-4 h-4 ${isClinical ? 'text-slate-400' : 'text-zinc-500'}`} />
                                                <span className={`text-sm font-medium truncate ${isClinical ? 'text-slate-700' : 'text-zinc-300'}`}>{patient.foods.join(', ')}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-bold">
                                                <div className={`px-2 py-1 rounded-md ${isClinical ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-white'}`}>{patient.macros.calories} kcal</div>
                                                <div className="text-emerald-500">{patient.macros.protein}g P</div>
                                                <div className="text-amber-500">{patient.macros.carbs}g C</div>
                                                <div className="text-rose-500">{patient.macros.fat}g F</div>
                                            </div>
                                        </div>

                                        {patient.status === 'pending' && (
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => handleReject(patient.id)}
                                                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm border transition-all ${
                                                        isClinical ? 'border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600' : 'border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-zinc-400'
                                                    }`}
                                                >
                                                    Descartar
                                                </button>
                                                <button 
                                                    onClick={() => handleConfirm(patient.id)}
                                                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                                                        isClinical ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-white text-black hover:bg-zinc-200'
                                                    }`}
                                                >
                                                    Aprobar
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}


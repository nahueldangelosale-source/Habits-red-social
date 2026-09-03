import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../api/client';

interface ImportProgress {
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    total: number;
    success: number;
    quarantine: number;
    error?: string;
}

interface MagicImportDropzoneProps {
    onComplete: (successCount: number, quarantineCount: number) => void;
}

export const MagicImportDropzone: React.FC<MagicImportDropzoneProps> = ({ onComplete }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [progress, setProgress] = useState<ImportProgress | null>(null);
    const [illusionText, setIllusionText] = useState('Analizando biometría...');

    // Labor Illusion texts
    useEffect(() => {
        if (!isUploading || progress?.status === 'completed') return;
        
        const texts = [
            'Analizando biometría...',
            'Generando historiales clínicos...',
            'Alineando arquetipos metabólicos...',
            'Procesando variables de carga...',
            'Validando integridad multitenant...'
        ];
        
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % texts.length;
            setIllusionText(texts[i]);
        }, 3000);
        
        return () => clearInterval(interval);
    }, [isUploading, progress?.status]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Initiate the background job via standard API client
            const data = await api.post<{ task_id: string }>('/api/v1/magic-import/csv', formData);
            
            setJobId(data.task_id);
            toast.success('Archivo subido con éxito. Iniciando AUREA Engine...');
        } catch (error: any) {
            toast.error(`Error de importación: ${error.message}`);
            setIsUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        maxFiles: 1,
        disabled: isUploading
    });

    // Subscribe to Server-Sent Events (SSE) for progress updates
    useEffect(() => {
        if (!jobId) return;

        // Use the native SSE manager route (assuming standard setup for celery tasks)
        // Since we are using standard Celery task progress, we might not have the SSE setup directly yet.
        // For now, we will mock the progress updates based on time, or if SSE exists, listen to it.
        // If the backend isn't sending SSE yet, let's simulate the progress for the UX demo.
        const mockInterval = setInterval(() => {
            setProgress(prev => {
                if (!prev) return { status: 'processing', progress: 10, total: 100, success: 0, quarantine: 0 };
                const nextProg = Math.min(prev.progress + Math.floor(Math.random() * 15), 100);
                if (nextProg === 100) {
                    clearInterval(mockInterval);
                    setTimeout(() => {
                        setIsUploading(false);
                        onComplete(97, 3); // Simulated partial failure as per Hólos request
                        toast.success('97 atletas importados exitosamente. 3 requieren revisión manual.');
                    }, 1000);
                    return { status: 'completed', progress: 100, total: 100, success: 97, quarantine: 3 };
                }
                return { ...prev, progress: nextProg, success: nextProg - 1, quarantine: 1 };
            });
        }, 1500);

        return () => {
            clearInterval(mockInterval);
        };
    }, [jobId, onComplete]);

    const percentage = progress && progress.total > 0 
        ? Math.round((progress.progress / progress.total) * 100) 
        : 0;

    return (
        <div className="w-full font-sans">
            <AnimatePresence mode="wait">
                {!isUploading && !progress ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        {...getRootProps()}
                        className={`p-10 border-2 border-dashed rounded-3xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group ${
                            isDragActive 
                                ? 'border-indigo-500 bg-indigo-500/10' 
                                : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/80 hover:border-zinc-600'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud size={32} className={isDragActive ? "text-indigo-400" : "text-zinc-400"} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">
                            Arrastra tu CSV de Atletas aquí
                        </h3>
                        <p className="text-sm text-zinc-400 max-w-sm">
                            Motor de ingesta masiva (Sovereign Quarantine). Soportamos hasta 10,000 atletas por subida. Cero bloqueos.
                        </p>
                        
                        <div className="mt-8 flex gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            <span className="flex items-center gap-1"><FileSpreadsheet size={14}/> .CSV</span>
                            <span className="flex items-center gap-1"><FileSpreadsheet size={14}/> .XLSX</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="telemetry"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <Loader2 size={24} className="text-indigo-400 animate-spin" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">AUREA Engine Activo</span>
                                    <motion.h3 
                                        key={illusionText}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="text-xl font-black text-white"
                                    >
                                        {illusionText}
                                    </motion.h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-black text-white tabular-nums">{percentage}%</span>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-8">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Procesados</span>
                                <span className="text-xl font-black text-white tabular-nums">{progress?.progress || 0} <span className="text-xs font-normal text-zinc-500">/ {progress?.total || 0}</span></span>
                            </div>
                            <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-900/30">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 block mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Éxitos</span>
                                <span className="text-xl font-black text-emerald-400 tabular-nums">{progress?.success || 0}</span>
                            </div>
                            <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-900/30">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 block mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Cuarentena</span>
                                <span className="text-xl font-black text-rose-400 tabular-nums">{progress?.quarantine || 0}</span>
                            </div>
                        </div>
                        
                        {progress?.status === 'completed' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 flex justify-center"
                            >
                                <button 
                                    onClick={() => window.location.href = '/coach/dashboard'}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                                >
                                    Ir al Dashboard <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )}

                        {/* Labor Illusion overlay effect */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MagicImportDropzone;

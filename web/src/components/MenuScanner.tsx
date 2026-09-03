import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, RefreshCw, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const MenuScanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [scanMode, setScanMode] = useState<'PLATO' | 'ETIQUETA'>('PLATO');
    
    // Zenith Sensor State
    const [tilt, setTilt] = useState({ beta: 0, gamma: 0 });
    const [isLevel, setIsLevel] = useState(false);
    const [orientationSupported, setOrientationSupported] = useState(true);
    const [bypassZenith, setBypassZenith] = useState(false);
    
    // UI Flow State
    const [appState, setAppState] = useState<'CAMERA' | 'PROCESSING' | 'SUCCESS'>('CAMERA');

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            toast.error("No se pudo acceder a la cámara.");
        }
    };

    const requestDeviceOrientation = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    setOrientationSupported(false);
                }
            } catch (error) {
                console.error("Error requesting orientation permission", error);
                setOrientationSupported(false);
            }
        } else {
            // Non-iOS 13+ devices
            window.addEventListener('deviceorientation', handleOrientation);
        }
    };

    useEffect(() => {
        startCamera();
        requestDeviceOrientation();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    const handleOrientation = (event: DeviceOrientationEvent) => {
        const b = event.beta || 0;
        const g = event.gamma || 0;
        setTilt({ beta: b, gamma: g });
        
        const tolerance = 15;
        setIsLevel(Math.abs(b) < tolerance && Math.abs(g) < tolerance);
    };

    // Canvas Pre-flight: Check Sharpness and Darkness
    const performQualityCheck = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        let totalBrightness = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
        }
        
        const avgBrightness = totalBrightness / (width * height);
        if (avgBrightness < 30) {
            toast.error("Imagen muy oscura. Busca un lugar iluminado.", { icon: '🌙' });
            return false;
        }
        return true;
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        if (scanMode === 'PLATO' && !isLevel && !bypassZenith) {
            toast.error("Nivela el teléfono o usa el bypass manual");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (!performQualityCheck(ctx, canvas.width, canvas.height)) {
            return;
        }

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            // Detener cámara para ahorrar batería e iniciar Dopamine Loop
            if (stream) stream.getTracks().forEach(track => track.stop());
            setAppState('PROCESSING');
            await uploadAndAnalyze(blob);
        }, 'image/jpeg', 0.8);
    };

    const uploadAndAnalyze = async (blob: Blob) => {
        const patientId = "demo_patient_123";
        
        try {
            // S3 Upload (Mock)
            const fileName = `scan_${Date.now()}.jpg`;
            const s3Response = await fetch(`/api/v1/storage/presigned-url?file_name=${fileName}&content_type=image/jpeg`, { method: 'POST' });
            const s3Data = await s3Response.json();
            
            // In a real flow: POST FormData built from s3Data.fields and blob
            const uploadUrl = s3Data.upload_url || "https://mock-s3";

            // Trigger DietQA Celery Worker
            await fetch('/api/v1/dietqa/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: uploadUrl, patient_id: patientId })
            });

            // Suscribirse al SSE del paciente (Data Scoping Seguro)
            const eventSource = new EventSource(`/api/v1/clinical/sse/stream/${patientId}?role=patient`);
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // El payload está capado intencionalmente para el paciente
                if (data.status === 'COMPLETED') {
                    setAppState('SUCCESS');
                    eventSource.close();
                } else if (data.status === 'FAILED') {
                    toast.error("Ocurrió un error en el análisis. Intenta nuevamente.");
                    setAppState('CAMERA');
                    startCamera();
                    eventSource.close();
                }
            };
            
            eventSource.onerror = () => {
                eventSource.close();
            };

        } catch (err) {
            console.error(err);
            toast.error("Error de conexión");
            setAppState('CAMERA');
            startCamera();
        }
    };

    if (appState === 'PROCESSING') {
        return (
            <div className="h-screen bg-indigo-950 flex flex-col items-center justify-center p-6 text-white font-sans">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-32 h-32 rounded-full border-t-4 border-l-4 border-indigo-400 border-r-4 border-r-transparent border-b-4 border-b-transparent mb-8"
                />
                <h2 className="text-2xl font-bold mb-2 animate-pulse">Analizando Biometría Nutricional</h2>
                <p className="text-indigo-300 text-center max-w-sm">
                    La Inteligencia Artificial Médica está deconstruyendo los macronutrientes de tu plato. Esto tomará unos segundos.
                </p>
            </div>
        );
    }

    if (appState === 'SUCCESS') {
        return (
            <div className="h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-white font-sans">
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8"
                >
                    <CheckCircle className="w-16 h-16 text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">¡Comida registrada con éxito!</h2>
                <p className="text-emerald-200 text-center max-w-sm mb-12">
                    Tu nutricionista ya tiene los datos exactos en su tablero clínico. ¡Sigue así!
                </p>
                <button 
                    onClick={() => { setAppState('CAMERA'); startCamera(); }}
                    className="bg-emerald-500 text-emerald-950 px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-emerald-400 transition-colors"
                >
                    Registrar otra comida <ChevronRight />
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-screen bg-black overflow-hidden font-sans flex flex-col">
            <div className="absolute inset-0 z-0">
                <video ref={videoRef} autoPlay playsInline muted className="object-cover w-full h-full" />
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            <div className="relative z-10 flex-1 flex flex-col justify-between p-6 pb-12 pointer-events-none">
                
                <div className="flex justify-center pointer-events-auto mt-8">
                    <div className="bg-black/50 backdrop-blur-md p-1 rounded-full flex border border-white/20">
                        <button 
                            onClick={() => setScanMode('PLATO')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${scanMode === 'PLATO' ? 'bg-indigo-600 text-white' : 'text-white/70'}`}
                        >
                            🍽️ Plato Casero
                        </button>
                        <button 
                            onClick={() => setScanMode('ETIQUETA')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${scanMode === 'ETIQUETA' ? 'bg-indigo-600 text-white' : 'text-white/70'}`}
                        >
                            🏷️ Etiqueta
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                    {scanMode === 'PLATO' ? (
                        <div className="relative w-64 h-64 rounded-full border-4 border-dashed border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                            <span className="absolute -bottom-8 text-white/80 font-medium text-sm text-center w-full">
                                Ubica el plato dentro del círculo
                            </span>
                        </div>
                    ) : (
                        <div className="relative w-72 h-96 border-2 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                            <span className="absolute -bottom-8 text-white/80 font-medium text-sm text-center w-full">
                                Alinea la tabla nutricional aquí
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-6 pointer-events-auto">
                    
                    {scanMode === 'PLATO' && (
                        <div className="flex flex-col items-center gap-2">
                            {(!orientationSupported || bypassZenith) ? (
                                <span className="text-xs font-bold text-slate-400 bg-black/50 px-3 py-1 rounded-full">Nivelador Omitido</span>
                            ) : (
                                <>
                                    <div className="relative w-16 h-16 rounded-full border-2 border-white/30 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                        <div className="absolute w-full h-[1px] bg-white/20"></div>
                                        <div className="absolute h-full w-[1px] bg-white/20"></div>
                                        <div className={`absolute w-4 h-4 rounded-full border-2 transition-colors ${isLevel ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/50'}`}></div>
                                        <div 
                                            className={`w-3 h-3 rounded-full transition-transform duration-75 ${isLevel ? 'bg-emerald-400' : 'bg-white'}`}
                                            style={{ transform: `translate(${Math.max(-24, Math.min(24, tilt.gamma))}px, ${Math.max(-24, Math.min(24, tilt.beta))}px)` }}
                                        ></div>
                                    </div>
                                    
                                    {!isLevel && (
                                        <button 
                                            onClick={() => setBypassZenith(true)}
                                            className="mt-2 text-[10px] uppercase font-bold text-white/50 hover:text-white/90 underline decoration-white/30 underline-offset-4"
                                        >
                                            Omitir Nivelador (Fallback iOS)
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <button 
                        onClick={captureImage}
                        disabled={scanMode === 'PLATO' && !isLevel && !bypassZenith}
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${
                            (scanMode === 'PLATO' && !isLevel && !bypassZenith) ? 'border-zinc-600 bg-zinc-800 opacity-50' : 
                            'border-indigo-400 bg-white hover:scale-105 active:scale-95'
                        }`}
                    >
                        <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200"></div>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default MenuScanner;
